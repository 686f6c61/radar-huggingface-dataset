# mradermacher/chaperone-qwen3-0.6b-GGUF

## Resumen

Chaperone Qwen3 0.6B es un modelo derivado de Qwen3-0.6B, afinado mediante LoRA por aideedamsyar para tareas de seguridad de agentes (agent-safety) y guardrail en entornos de uso de herramientas y agentes de programación. El modelo que aquí se documenta es la versión cuantizada a GGUF publicada por mradermacher, que facilita su ejecución en llama.cpp y entornos de inferencia local sin necesidad de GPU de gama alta.

El modelo resuelve un problema concreto: actuar como capa de control y verificación sobre las acciones que ejecuta un agente autónomo (llamadas a herramientas, ejecución de código, acceso a recursos), clasificando o filtrando comportamientos no seguros. Con 596.049.920 parámetros (aproximadamente 0,6 mil millones) y licencia Apache 2.0, está pensado para desplegarse como componente ligero dentro de pipelines de agentes donde el coste por inferencia y la latencia importan.

La relevancia actual radica en su tamaño reducido y su empaquetado en múltiples cuantizaciones GGUF, que permiten integrarlo como guardrail en tiempo real junto a modelos generativos más grandes. No se dispone de información publicada sobre longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-0.6B, afinado con LoRA) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-0.6B, un transformer denso de aproximadamente 0,6 mil millones de parámetros. Sobre esa base, el autor original (aideedamsyar) aplicó un ajuste fino con LoRA orientado a tareas de seguridad de agentes, uso de herramientas y agentes de programación, según las etiquetas de la model card (agent-safety, guardrail, tool-use, coding-agents, lora). No se especifica en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO.

La contribución de esta ficha concreta es la cuantización estática a GGUF realizada por mradermacher, con versiones que van desde Q2_K (0,4 GB) hasta f16 (1,3 GB). No se han publicado cuantizaciones ponderadas o con imatrix para este modelo según la propia model card. No se documentan innovaciones arquitectónicas adicionales más allá del ajuste LoRA sobre la base Qwen3.

## Capacidades

- Clasificación y verificación de seguridad de acciones de agentes (guardrail).
- Evaluación de llamadas a herramientas (tool use) para detectar usos inseguros o no permitidos.
- Soporte como capa de control en agentes de programación (coding agents).
- Generación de texto conversacional en inglés.
- Integración con llama.cpp y ecosistema GGUF para inferencia local.
- Compatible con endpoints (etiqueta endpoints_compatible).
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Guardrail en pipelines de agentes autónomos: el modelo se sitúa entre el agente y la ejecución de herramientas para clasificar si una acción propuesta (comando de shell, llamada a API) es segura, aprovechando su tamaño reducido para añadir mínima latencia.
- Verificación de tool calling en asistentes de código: antes de ejecutar una herramienta de edición o ejecución, el modelo evalúa la intención y el contenido de la llamada para bloquear operaciones destructivas.
- Moderación de acciones en entornos CI/CD con agentes: como paso previo a la aplicación de cambios generados por un agente, se usa para filtrar parches o comandos que puedan comprometer el repositorio.
- Capa de seguridad en asistentes conversacionales con acceso a herramientas: filtra solicitudes del usuario que intenten inducir al agente a realizar operaciones no permitidas.
- Evaluación offline de trayectorias de agentes: al ser ligero y cuantizable a 0,4-0,7 GB, permite procesar grandes volúmenes de registros de interacción para etiquetar comportamientos inseguros en lote.
- Despliegue en entornos con recursos limitados: su tamaño permite ejecutarlo en CPU o GPU de gama baja junto a un modelo principal más grande, actuando como verificador en paralelo.
- Prototipado e investigación en seguridad de agentes: sirve como baseline pequeño y de licencia permisiva para experimentar con técnicas de guardrail antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en Q2_K a Q5_K_M; 0,6 GB en Q6_K; 0,7 GB en Q8_0; 1,3 GB en f16. Estas cifras corresponden al tamaño de los ficheros GGUF y no incluyen el overhead del contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente para las cuantizaciones bajas; tarjetas como RTX 3060, RTX 4060 o superiores ofrecen margen amplio. En A100/H100 el modelo queda infrautilizado, pero puede ejecutarse como componente auxiliar.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), servidores compatibles con endpoints, y cualquier runtime que soporte GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| chaperone-qwen3-0.6b-GGUF | 596 M | no disponible | Apache 2.0 | GGUF | Guardrail especializado en seguridad de agentes |
| Qwen3-0.6B (base) | ~0,6 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo generalista; el chaperone deriva de él |
| Modelos guardrail pequeños (p. ej. clasificadores tipo Llama Guard de menor tamaño) | variable | variable | variable | variable | No disponible comparación directa con datos publicados |

No se dispone de datos de rendimiento comparativos publicados para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; su comportamiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Qwen3-0.6B hereda los sesgos del modelo base y de los datos de ajuste LoRA.
- Alucinación: como modelo generativo pequeño, puede producir clasificaciones erróneas o justificaciones inventadas; no debe usarse como único mecanismo de seguridad en producción.
- Contexto: se desconoce la longitud de contexto soportada, lo que limita su uso en trayectorias de agente muy largas sin validación previa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3 y del adaptador original.
- Caveat de producción: al ser un guardrail, un falso negativo puede permitir acciones inseguras; se recomienda combinarlo con validaciones deterministas y monitorización. Las cuantizaciones Q2_K y Q3 pueden degradar la fiabilidad de clasificación.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/chaperone-qwen3-0.6b-GGUF
- Modelo base / adaptador original: https://huggingface.co/aideedamsyar/chaperone-qwen3-0.6b
- Página de overview de cuantizaciones: https://hf.tst.eu/model#chaperone-qwen3-0.6b-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
