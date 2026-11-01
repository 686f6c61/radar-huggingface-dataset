# cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-r128-lr3e4-soup6-nothink-v2

## Resumen

Yejin Korean 8B v3 es un modelo de lenguaje de 7.241.740.288 parámetros (aproximadamente 7,2 mil millones) especializado en instrucciones en coreano, desarrollado por el usuario cooler8. Se construye a partir de la base Yejin Korean 8B v3, un modelo preentrenado desde cero por el mismo autor sobre datos coreanos públicos, sobre el que se aplican dos etapas de preentrenamiento continuado y posteriormente un ajuste fino con LoRA. La versión concreta que nos ocupa incorpora una destilación de secuencia desde Qwen3.6-27B y un promediado de pesos (model soup) de seis ejecuciones de LoRA.

El modelo emplea la arquitectura Qwen3 (según los tags del repositorio) y está orientado a generación de texto conversacional en coreano. Su interés radica en que cubre un nicho poco poblado: modelos de tamaño medio (7-8B) con ajuste específico para coreano, entrenados con datos propios y con una licencia permisiva Apache 2.0 que facilita su uso comercial sin las restricciones de otros modelos de la misma familia.

La model card es escueta y no documenta benchmarks ni especificaciones detalladas de contexto o cuantización; la información disponible se limita al proceso de entrenamiento, la plantilla de chat y un ejemplo de uso con Transformers. Esto limita la evaluación rigurosa, pero permite identificar con claridad el pipeline de entrenamiento y el formato de interacción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only, según tags del repositorio) |
| Parámetros totales | 7.241.740.288 (≈7,2B) |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Yejin Korean 8B v3 base, preentrenado desde cero por el autor sobre datos coreanos públicos. Sobre esa base se aplican dos etapas de preentrenamiento continuado: una primera de 6.000 pasos y una segunda de 20.000 pasos que incluye texto coreano de FinePDFs, parcialmente extraído mediante el modelo OCR RolmOCR. A continuación se incorpora el "chat vector" del modelo SFT propio del autor y se ejecuta un ajuste fino con LoRA en seis configuraciones: tres con rango 128 y learning rate 2e-4, y tres con rango 64 y learning rate 3e-4, cada una con un orden de datos distinto. Los pesos finales resultan de un promediado uniforme (model soup) de las seis ejecuciones.

Los datos de LoRA mezclan 45.013 muestras del formato de fase 1 con 39.290 soluciones cortas en coreano generadas por Qwen3.6-27B (Apache 2.0) para preguntas procedentes de un generador de puzles propio, del conjunto de entrenamiento de KMMLU, de exámenes escolares de AI Hub y de comprensión lectora de AI Hub. Solo se conservaron las soluciones que alcanzaban la respuesta conocida, en un esquema de destilación a nivel de secuencia (sin pesos ni logits del profesor). El autor declara que no se usaron ítems de test de benchmarks y que los datos de entrenamiento no comparten ningún 13-grama de palabras con KMMLU-Pro, KMMLU test, CLIcK, MuSR ni Korean MuSR.

## Capacidades

- Generación de texto conversacional en coreano, con plantilla de chat propia que incluye un bloque `<think> </think>` vacío (modo "nothink").
- Seguimiento de instrucciones en coreano, entrenado con datos de exámenes escolares, comprensión lectora y puzles.
- Razonamiento de tipo respuesta corta: el pipeline de destilación se orientó a soluciones breves verificables contra una respuesta conocida.
- Capacidad de resolución de preguntas tipo test (por la inclusión de KMMLU train en el dataset de ajuste).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni otras modalidades.
- Multilingüismo limitado al coreano según el campo `language` de la model card.

## Casos de uso

- Atención al cliente en coreano: el modelo puede gestionar conversaciones multi-turno mediante la plantilla `<|user|>...<|end|><|assistant|>...`, adecuado para chatbots de soporte en mercados coreanohablantes. La longitud de contexto no está documentada, por lo que conviene validar el comportamiento en diálogos largos antes de producción.
- Asistencia educativa y resolución de exámenes: al haberse entrenado con exámenes escolares de AI Hub y KMMLU train, es apropiado para generar respuestas a preguntas de opción múltiple y problemas de comprensión lectora en coreano.
- Generación de respuestas cortas verificables: el esquema de destilación a nivel de secuencia con soluciones que alcanzan la respuesta conocida lo hace útil en tareas de pregunta-respuesta con respuesta concisa (por ejemplo, QA sobre documentación interna).
- Procesamiento de documentos coreanos: la inclusión de texto de FinePDFs con extracción OCR sugiere utilidad en tareas de resumen o extracción sobre texto coreano procedente de PDF, aunque requiere validación empírica.
- Generación de contenido en coreano: redacción de textos, respuestas y material divulgativo en coreano con un modelo de 7,2B desplegable en hardware moderado.
- Base para ajuste fino específico de dominio: al ser Apache 2.0 y de tamaño medio, sirve como punto de partida para LoRA sobre dominios verticales (legal, sanitario, financiero) en coreano.
- Evaluación comparativa de modelos coreanos: útil como referencia en experimentos de destilación y model soup, dado que el autor documenta el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (7,2B), en bfloat16 se necesitan aproximadamente 14-15 GB de VRAM solo para pesos, más memoria para el contexto y el estado de activaciones; en cuantización de 8 bits rondaría los 7-8 GB y en 4 bits los 4-5 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: no documentadas. Por tamaño, cabría esperar funcionamiento en una A100 40 GB, H100, L40S o RTX 4090 (24 GB) en bfloat16, y en GPUs consumer de 8-16 GB con cuantización.
- Cabe en GPU consumer: previsiblemente sí con cuantización (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay confirmación oficial ni artefactos GGUF publicados en el repositorio.
- Opciones de despliegue: el ejemplo de la model card usa `transformers` con `AutoModelForCausalLM` y `device_map="auto"`, en `torch_dtype="bfloat16"`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no haber GGUF en el repo, llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yejin Korean 8B v3 (este modelo) | ≈7,2B | no disponible | coreano | Apache 2.0 | HuggingFace (safetensors) |
| Qwen3.6-27B (profesor de destilación) | 27B (según nombre) | no disponible | multilingüe | Apache 2.0 (según la model card) | HuggingFace |
| Modelos coreanos de 7-8B de la comunidad | no disponible | no disponible | coreano | variable | HuggingFace |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparación cuantitativa fiable con alternativas de la misma categoría. La comparación con Qwen3.6-27B se incluye únicamente porque figura como profesor en el pipeline de destilación, no como alternativa de despliegue equivalente.

## Limitaciones y advertencias

- Idiomas: el modelo está entrenado y etiquetado exclusivamente para coreano; el rendimiento en castellano, inglés u otros idiomas no está garantizado y probablemente sea deficiente.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas sin validación previa.
- Benchmarks: no hay resultados publicados de MMLU, KMMLU, CLIcK ni otros conjuntos, por lo que no se puede verificar la calidad frente a alternativas.
- Alucinación: no se documentan evaluaciones de factualidad ni mecanismos de mitigación; en tareas de QA abierto el riesgo de respuestas plausibles pero incorrectas es relevante.
- Sesgos: no se documenta ningún análisis de sesgos; los datos provienen de fuentes públicas coreanas y de generaciones de Qwen3.6-27B, lo que puede introducir sesgos del profesor y de los corpus de origen.
- Destilación desde un profesor: las soluciones de entrenamiento se generaron con Qwen3.6-27B y solo se conservaron las que alcanzaban la respuesta conocida, lo que puede sesgar el estilo y el razonamiento hacia el del profesor.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de origen (FinePDFs, AI Hub, KMMLU) si se redistribuye el modelo o se usa en productos regulados.
- Madurez: el repositorio tiene 160 descargas y 0 likes en el momento de la consulta, sin documentación extendida; se recomienda validación empírica antes de cualquier uso en producción.
- Formato: solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones listas para usar, lo que añade trabajo de conversión para despliegues en CPU o GPUs de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-cpt2s20000-distill-qwen36-r128-lr3e4-soup6-nothink-v2
- Modelo base: https://huggingface.co/cooler8/yejin-korean-8b-v3-base
- Perfil del autor: https://huggingface.co/cooler8
- Qwen3.6-27B (profesor de destilación, referencia): https://huggingface.co/Qwen
