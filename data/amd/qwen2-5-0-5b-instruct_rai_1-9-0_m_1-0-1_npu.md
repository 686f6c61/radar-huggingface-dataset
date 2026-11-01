# amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_m_1.0.1_npu` es una version optimizada del modelo Qwen2.5-0.5B-Instruct de Alibaba, publicada por AMD para su ejecucion en las unidades de procesamiento neuronal (NPU) de la plataforma Ryzen AI. Se distribuye en formato ONNX y esta etiquetado con el identificador de runtime `m_1.0.1_npu`, lo que indica que ha sido compilado y empaquetado especificamente para el stack de inferencia Ryzen AI 1.9.0 de AMD.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parametros, afinado para instrucciones y conversacion, con una ventana de contexto de 32.768 tokens en su version original. Esta variante de AMD no altera la arquitectura del modelo, sino que adapta los pesos y el grafo computacional para aprovechar la NPU integrada en los procesadores Ryzen AI (familia Strix Point y posteriores), lo que permite ejecutar generacion de texto en local con bajo consumo energetico.

Su relevancia radica en que facilita el despliegue de un LLM pequeno en hardware de PC convencional con aceleracion NPU, sin necesidad de GPU dedicada. El acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones en HuggingFace, aunque la licencia del modelo subyacente es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el tag `m_1.0.1_npu` sugiere un empaquetado especifico del runtime, no una cuantizacion estandar) |
| Idiomas soportados | en (ingles, segun los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen2.5-0.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala y posteriormente sometido a ajuste supervisado y optimizacion por preferencias para comportamiento instructivo y conversacional. AMD no aporta informacion adicional sobre el proceso de entrenamiento en la ficha del repositorio.

La innovacion de esta publicacion no reside en el entrenamiento, sino en el empaquetado: los pesos se exportan a ONNX y se compilan para el runtime Ryzen AI 1.9.0, con un identificador de modelo (`m_1.0.1_npu`) que vincula la version del modelo con la version del motor de inferencia. Esto implica que el artefacto solo es valido para la combinacion especifica de runtime y hardware NPU soportada por AMD, y no es portable a otros backends sin reconversion.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles.
- Razonamiento basico y respuesta a preguntas de complejidad moderada, limitado por el tamano del modelo (0,5 B).
- Generacion de codigo sencillo y explicaciones tecnicas breves.
- Aritmetica y matematicas basicas.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistentes de escritorio en local: el modelo se ejecuta en la NPU de un portatil Ryzen AI, permitiendo un chatbot de texto sin conexion y con bajo consumo, adecuado para tareas de redaccion y resumen.
- Autocompletado y correccion de texto en editores: al ser un modelo de 0,5 B con latencia baja en NPU, puede ofrecer sugerencias en tiempo real dentro de aplicaciones de escritorio.
- Clasificacion y etiquetado de texto en el dispositivo: permite procesar correos, tickets o notas sin enviar datos a la nube, lo que resulta relevante por privacidad.
- Generacion de respuestas en asistentes de voz embebidos: integrado en pipelines de STT + LLM + TTS sobre hardware de PC, con el LLM ejecutandose en la NPU.
- Prototipado de aplicaciones de IA generativa en Windows: sirve como modelo de referencia para desarrolladores que quieran validar el stack Ryzen AI antes de escalar a modelos mayores.
- Filtrado y enrutamiento de consultas: puede actuar como clasificador ligero que decida si una peticion requiere un modelo mayor en la nube o puede resolverse localmente.
- Educacion y demos de inferencia en NPU: util para mostrar el funcionamiento de la aceleracion neuronal en charlas y cursos, dado su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tablas de evaluacion ni comparaciones numericas, y AMD no documenta metricas de latencia o throughput en la ficha proporcionada.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI compatibles con el runtime Ryzen AI 1.9.0 (familia Strix Point y posteriores, segun la nomenclatura de AMD).
- VRAM estimada: no aplica, ya que el modelo se ejecuta en NPU; el repositorio ocupa 0,7 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no disponibles; el artefacto esta compilado para NPU, no para GPU.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX especifico del runtime Ryzen AI probablemente no es portable directamente a CUDA o ROCm sin reconversion.
- Opciones de despliegue: runtime Ryzen AI de AMD (version 1.9.0) con el modelo `m_1.0.1_npu`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_m_1.0.1_npu | 0,5 B | no disponible (base: 32.768) | Apache 2.0 | ONNX para NPU Ryzen AI |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | 32.768 | Apache 2.0 | safetensors, GGUF, ONNX generico |
| meta-llama/Llama-3.2-1B-Instruct | 1,2 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF |
| HuggingFaceTB/SmolLM2-360M-Instruct | 0,36 B | 8.192 | Apache 2.0 | safetensors, GGUF, ONNX |

La diferencia principal frente a las alternativas es el empaquetado especifico para NPU Ryzen AI: los demas modelos se distribuyen en formatos genericos y requieren conversion para ejecutarse en esa NPU, mientras que este artefacto esta listo para el runtime de AMD a cambio de perder portabilidad.

## Limitaciones y advertencias

- El acceso al repositorio esta restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargarlo.
- El modelo esta pensado exclusivamente para el runtime Ryzen AI 1.9.0 y la NPU correspondiente; no es portable a otros backends sin reconversion.
- El idioma declarado es unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Con 0,5 B de parametros, la tasa de alucinacion en tareas de conocimiento factual es elevada y el razonamiento complejo es limitado.
- No se documentan procesos de mitigacion de sesgos especificos para esta variante; hereda los sesgos del corpus de entrenamiento de Qwen2.5.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated de AMD.
- No se proporcionan garantias de soporte, actualizacion ni metricas de calidad para esta compilacion concreta.
- El identificador `m_1.0.1_npu` sugiere una dependencia fuerte de la version del runtime; actualizar Ryzen AI podria requerir una nueva version del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentacion de Ryzen AI de AMD: no disponible en la informacion proporcionada
- Paper de Qwen2.5: no disponible en la informacion proporcionada
