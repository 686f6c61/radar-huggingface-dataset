# nurdich/Qwen3.5-4B-Jev-Judge

## Resumen

Qwen3.5-4B-Jev-Judge es un modelo juez de 4B de parámetros desarrollado por el usuario nurdich (publicado también bajo la cuenta MaziyarPanahi) sobre la base de Qwen/Qwen3.5-4B. No es un modelo generativo de propósito general: es un clasificador de decisiones que devuelve una probabilidad calibrada para cada opción de una pregunta binaria, en lugar de texto libre. Resuelve dos comprobaciones recurrentes en pipelines de LLM: si una respuesta RAG está fundamentada en el contexto proporcionado (detección de alucinaciones) y si una petición o respuesta es insegura (safety).

El modelo se construye con Unsloth `FastDecisionModel`, añadiendo una cabeza de decisión sobre un LoRA r=16 entrenado con 20.000 filas de dos datasets públicos de decisiones Jev. La arquitectura subyacente es la de Qwen3.5-4B (transformer multimodal con pipeline image-text-to-text), con 4.659.865.088 parámetros totales en formato safetensors de 16 bits y un repositorio de 9,5 GB.

Su relevancia actual reside en que ofrece una alternativa local y de licencia Apache-2.0 a los servicios de decisión propietarios: en las pruebas publicadas por el autor supera a Jev 1.14 en los conjuntos de test de RAG y safety, y sirve como componente de verificación en sistemas de recuperación aumentada y moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B) con cabeza de decisión (LoRA r=16 fusionado) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud máxima de entrenamiento configurada) |
| Tipos de cuantizacion | no disponible (el autor indica `load_in_4bit=False` en el ejemplo; el repo se distribuye en 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo fusionado en raíz + `adapter/` con LoRA y `joint_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal (pipeline image-text-to-text) sobre el que se aplica un ajuste LoRA de rango 16 con una cabeza de decisión específica ("decision head") que produce probabilidades calibradas por opción. La temperatura de calibración está incorporada en la cabeza. El repositorio raíz contiene el modelo fusionado en 16 bits con la LoRA plegada, además de `joint_head.safetensors` y sus configuraciones; la carpeta `adapter/` conserva el adaptador original para quien ya disponga de Qwen3.5-4B. Incluye también `joint_schema_model.py`, el código de referencia Clef de Cloudflare (Apache-2.0) que Unsloth exporta, aunque el autor advierte que no reproduce las respuestas de Unsloth en todas las filas.

El entrenamiento usó 10.000 filas aleatorias del split de train de cada uno de los dos datasets (excluyendo la pregunta trivial `quality`), con semilla 3407: MaziyarPanahi/Jev-RAG-Claim-Verification-130K y MaziyarPanahi/Jev-Safety-Refusal-Decisions-150K, basados en RAGTruth (vía `wandb/RAGTruth-processed`, MIT) y NVIDIA Aegis 2.0 (CC-BY-4.0). La receta fue bf16 LoRA r=16, learning rate 2e-4, batch 8 x 4, una época, longitud máxima 4.096 y calibración sobre 400 filas reservadas del propio entrenamiento. El cómputo fue una NVIDIA H200 en Hugging Face Jobs, con 22,5 minutos de entrenamiento y un coste de 1,87 USD a 5,00 USD/hora.

## Capacidades

- Verificación de fundamentación RAG: dada una respuesta y un contexto autoritativo, devuelve la probabilidad de que todas las afirmaciones fácticas estén respaldadas por el contexto.
- Detección de alucinaciones: identifica afirmaciones no soportadas o contradichas por la evidencia.
- Clasificación de seguridad: evalúa si una petición o respuesta es insegura, con decisiones de rechazo.
- Salida probabilística calibrada por opción, en lugar de texto libre, lo que facilita umbrales ajustables por caso de uso.
- Formato de decisión estructurado: pregunta con tipo `choice`, instrucciones, criterios y estado en JSON.
- Integración con Unsloth `FastDecisionModel` para inferencia.
- Capacidades multimodales heredadas de Qwen3.5-4B (pipeline image-text-to-text), aunque el ajuste se centra en decisiones textuales.
- No se documentan capacidades de tool calling, agentes o modo thinking específicas para este ajuste.

## Casos de uso

- Verificación de respuestas en pipelines RAG: insertar el modelo como paso de control tras la generación, pasando el contexto recuperado y la respuesta del asistente para obtener una probabilidad de fundamentación y descartar o regenerar respuestas por debajo de un umbral.
- Moderación de contenido en producción: clasificar peticiones y respuestas de un chatbot con la tarea de safety, usando la probabilidad calibrada para decidir entre permitir, rechazar o escalar a revisión humana.
- Detección de alucinaciones en asistentes documentales: aplicar el juez sobre respuestas generadas a partir de manuales o bases de conocimiento internas, marcando como no verificadas aquellas con afirmaciones no soportadas.
- Evaluación automática de sistemas LLM: usar el modelo como evaluador en suites de test internas que midan la tasa de respuestas fundamentadas y la tasa de respuestas inseguras entre versiones del sistema.
- Filtrado previo en bases de datos de preguntas y respuestas: puntuar pares pregunta-respuesta de dominios como PubMed (con validación adicional) para priorizar revisión, aprovechando su capacidad de transferencia observada en MedHallu.
- Guardrail en aplicaciones de atención al cliente: ejecutar el juez en paralelo a la generación para bloquear respuestas que contradigan la política o el contexto de la empresa antes de mostrarlas al usuario.
- Control de calidad en generación aumentada multilingüe: aunque no se documentan idiomas soportados, el modelo hereda el tokenizador de Qwen3.5-4B; conviene validar empíricamente el rendimiento por idioma antes de desplegarlo.

## Benchmarks y rendimiento

Datos publicados por el autor. Cada modelo se evalúa sobre las mismas filas reservadas, con la etiqueta humana o de la fuente como referencia. Jev 1.14 se invocó a través del endpoint Decisions de OpenRouter (solo TypeSafe, sin fallbacks) con el mismo estado, instrucciones y criterios.

| Conjunto de test | Filas | Este modelo | Jev 1.14 |
|---|---|---|---|
| Comprobaciones de afirmaciones RAG (split de test Jev-RAG) | 1.873 | 87,9% | 82,1% |
| Decisiones de safety (split de test Jev-Safety) | 2.162 | 90,7% | 82,3% |
| Ambos, las tareas para las que fue entrenado | 4.035 | 89,4% | 82,2% |
| Respuestas PubMed de MedHallu, sin entrenamiento previo | 2.000 | 78,4% | 67,9% |

En MedHallu (1.000 preguntas PubMed, cada una con la respuesta real y una alucinada), la frecuencia con la que el juez asigna mayor probabilidad de "fundamentado" a la respuesta real que a la falsa es de 855/1.000 para este modelo y 916/1.000 para Jev 1.14 (con 43 empates). El autor señala que el umbral por defecto de Jev es estricto en PubMed (rechaza muchas respuestas reales), por lo que su precisión ahí subestima su capacidad de ranking; recomienda ajustar el umbral a los datos propios.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 9,5 GB en 16 bits; en FP16/BF16 se requiere aproximadamente 10-12 GB de VRAM para pesos, más overhead de activaciones y contexto. Con cuantización a 4 bits (soportada por Unsloth vía `load_in_4bit`, aunque el autor usa `False` en el ejemplo) podría reducirse a unos 4-5 GB, aunque no se publican cifras oficiales.
- GPU recomendadas: NVIDIA H200 fue la usada para entrenamiento (22,5 minutos). Para inferencia, una RTX 4090 (24 GB) o A100/H100 son holgadas en 16 bits; una GPU consumer de 12-16 GB podría ser suficiente en 16 bits con contexto moderado.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090, RTX 4080 y modelos con 12 GB o más en 16 bits; en 4 bits, en GPUs de 8 GB.
- Opciones de despliegue: Unsloth (`FastDecisionModel`), que es la vía verificada por el autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este ajuste con cabeza de decisión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Jev-Judge | 4,66B | 4.096 | Juez de decisión (RAG + safety) | Apache-2.0 | Hugging Face (29 descargas) |
| Jev 1.14 | no disponible | no disponible | Modelo de decisión general vía API | no disponible | Endpoint OpenRouter |
| Qwen/Qwen3.5-4B | 4B (base) | no disponible | Modelo generativo multimodal | no disponible | Hugging Face |

La comparación directa con Jev 1.14 está en la tabla de benchmarks: este modelo supera a Jev 1.14 en los conjuntos de test in-domain (89,4% frente a 82,2%) y en MedHallu (78,4% frente a 67,9%), aunque Jev 1.14 tiene mejor capacidad de ranking en MedHallu (916/1.000 frente a 855/1.000). No se dispone de datos de otros modelos juez comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento in-domain: las filas de test de RAG y safety provienen de las mismas fuentes que las de entrenamiento, por lo que las métricas in-domain pueden sobreestimar el rendimiento en dominios nuevos. Jev 1.14 responde zero-shot como modelo de decisión general.
- PubMed es una prueba de transferencia, no una validación médica: no debe usarse para tomar decisiones clínicas.
- El umbral de decisión debe ajustarse a los datos propios; el comportamiento por defecto puede ser demasiado estricto o laxo según el dominio.
- Riesgo de alucinación y sesgo: no se documentan análisis específicos de sesgos; al heredar Qwen3.5-4B, arrastra los sesgos de su corpus de entrenamiento.
- Idiomas soportados no documentados: validar el rendimiento por idioma antes de desplegar en producción multilingüe.
- El código de referencia `joint_schema_model.py` (Clef de Cloudflare) no reproduce las respuestas de Unsloth en todas las filas; usar la vía Unsloth verificada.
- Licencia Apache-2.0 permite uso comercial, pero las fuentes de datos tienen sus propias licencias (RAGTruth MIT con revisión upstream anotada, Aegis 2.0 CC-BY-4.0) que conviene revisar.
- Modelo con muy poca adopción (29 descargas, 0 likes) y sin validación independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nurdich/Qwen3.5-4B-Jev-Judge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset Jev-RAG-Claim-Verification-130K: https://huggingface.co/datasets/MaziyarPanahi/Jev-RAG-Claim-Verification-130K
- Dataset Jev-Safety-Refusal-Decisions-150K: https://huggingface.co/datasets/MaziyarPanahi/Jev-Safety-Refusal-Decisions-150K
- Dataset RAGTruth procesado: https://huggingface.co/datasets/wandb/RAGTruth-processed
- Dataset MedHallu: https://huggingface.co/datasets/UTAustin-AIHealth/MedHallu
- Unsloth: https://github.com/unslothai/unsloth
