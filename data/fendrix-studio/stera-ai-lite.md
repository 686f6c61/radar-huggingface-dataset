# Fendrix-Studio/Stera-AI-Lite

## Resumen

Stera-AI-Lite V14 es un modelo de lenguaje y vision (vision-language) publicado por Fendrix-Studio bajo licencia Apache 2.0. Se presenta como un derivado afinado y cuantizado del modelo base Qwen/Qwen3.5-2B, del que hereda la arquitectura transformer y el tokenizador. El repositorio distribuye exclusivamente pesos en formato GGUF: una cuantizacion Q4_K_M del modelo de lenguaje y un proyector visual en F16 (mmproj) necesario para habilitar la entrada de imagenes. Segun los metadatos de safetensors, el modelo cuenta con 1.543.714.304 parametros totales, lo que lo situa en la gama de los 1,5-2 mil millones de parametros.

El modelo se orienta a inferencia local en equipos de consumo y a integraciones conversacionales con soporte de vision. La model card menciona compatibilidad con endpoints y uso mediante LM Studio, ademas de una aplicacion propia (Stera AI) anunciada como proxima. La fecha de publicacion indicada en la model card (24 de noviembre de 2026) y los benchmarks comparativos que incluye deben tratarse con cautela, ya que el autor no documenta metodologia, semillas ni protocolo de evaluacion.

La relevancia practica del modelo reside en su tamano reducido, su licencia permisiva y su empaquetado GGUF listo para ejecutar en CPU o GPU modestas. No obstante, la informacion publica es escasa: no se detallan idiomas soportados, composicion del dataset de ajuste ni proceso de entrenamiento, y los resultados de benchmarks no son verificables de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B); incluye proyector visual para entrada multimodal |
| Parametros totales | 1.543.714.304 (1,54 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y F16 (proyector visual mmproj) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model-Stera-Lite-Q4_K_M.gguf y mmproj-Stera-Lite_F16.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer decoder-only de aproximadamente 2 mil millones de parametros segun el modelo base referenciado, aunque los safetensors publicados declaran 1,54 mil millones. Sobre esa base, Fendrix-Studio anade un proyector visual en F16 que permite procesar imagenes junto con texto, configurando un pipeline vision-language. La distribucion se realiza unicamente en GGUF, lo que sugiere que el autor ha priorizado el despliegue en llama.cpp y entornos compatibles frente a la publicacion de pesos completos en safetensors.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de ajuste, el uso de RLHF o DPO, ni la estrategia de alineacion. La model card no describe innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Tampoco se documenta si el ajuste fino fue supervisado, por destilacion o mediante preferencias. Esta ausencia de trazabilidad es una limitacion relevante para evaluar el modelo en produccion.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta "conversational" del repositorio.
- Analisis de imagenes mediante el proyector visual mmproj en F16, lo que habilita tareas de descripcion, respuesta a preguntas sobre imagenes y extraccion de informacion visual.
- Razonamiento basico y respuesta a preguntas generales, limitado por el tamano del modelo base.
- Generacion de codigo y tareas de software, segun los benchmarks declarados por el autor (no verificables).
- Uso de herramientas y comportamiento agentico, segun la model card, aunque sin documentacion tecnica sobre el formato de tool calling.
- Compatibilidad con endpoints, indicada en las etiquetas del repositorio.
- Capacidades multilingues: no documentadas; no se especifica la lista de idiomas.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en un portatil con LM Studio y gestionar dialogos multi-turno sin conexion, gracias a su cuantizacion Q4_K_M y su tamano reducido.
- Descripcion y analisis de imagenes en el dispositivo: con el proyector mmproj, permite clasificar capturas, describir fotografias o extraer texto de imagenes en aplicaciones de escritorio sin enviar datos a la nube.
- Prototipado rapido de aplicaciones multimodales: util para validar flujos de vision-lenguaje antes de migrar a modelos mayores, dado su bajo coste de inferencia y su licencia Apache 2.0.
- Automatizacion de soporte tecnico con capturas de pantalla: el modelo puede recibir una imagen de error y generar una respuesta orientativa, integrado en un chatbot de helpdesk.
- Generacion asistida de codigo en entornos con recursos limitados: adecuado para autocompletado o explicacion de fragmentos en IDE, aunque con menor calidad que modelos de mayor tamano.
- Educacion y accesibilidad: lectura de imagenes y explicacion en lenguaje natural para usuarios con discapacidad visual, desplegado en hardware de bajo consumo.
- Filtrado y clasificacion de contenido visual: etiquetado automatico de imagenes en pipelines de moderacion o catalogacion, con la ventaja de ejecutarse en local.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos. Los datos proceden del autor y no se especifica metodologia, version de evaluacion ni protocolo, por lo que deben interpretarse como estimaciones no verificadas.

| Benchmark | Stera-AI-Lite | Qwen3.7-Plus | DeepSeek-V4-Flash | Claude-Opus-4.6 |
|---|---|---|---|---|
| Agentic coding (DeepSWE 1.1) | 24,5 | 16,5 | 54,4 | -- |
| Agentic coding (SWE-bench Pro) | 31,2 | 55,8 | 56,0 | 53,4 |
| SWE-bench Multilingual | 42,8 | 75,8 | -- | 77,5 |
| NL2Repo-Bench | 28,7 | 41,1 | 54,2 | 47,6 |
| CoWorkBench | 39,5 | 65,1 | 45,1 | 68,2 |
| JobBench | 21,3 | 27,6 | 41,3 | 36,6 |
| Agents' Last Exam (Score) | 23,1 | 33,6 | -- | -- |
| Toolathlon Verified | 44,0 | 50,6 | 70,3 | -- |

No se han publicado resultados independientes de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M de un modelo de ~1,5 mil millones de parametros ocupa aproximadamente 1-1,2 GB; con el proyector visual F16 y el contexto de trabajo, el consumo total se situa en torno a 2-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como RTX 3050, RTX 4060, RTX 4090, A100 o H100; el modelo no aprovechara la capacidad de las GPU de gama alta.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas de 4-8 GB e incluso puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, LM Studio (recomendado por el autor), Ollama y servidores compatibles con GGUF; la aplicacion propietaria Stera AI esta anunciada como proxima.
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera una latencia baja en GPU de consumo y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Stera-AI-Lite V14 | 1,54 mil millones | No disponible | Apache 2.0 | GGUF | Vision-language, ajuste propio sobre Qwen3.5-2B |
| Qwen/Qwen3.5-2B | ~2 mil millones | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo base; sin capacidades visuales documentadas |
| Gemma 3 4B | ~4 mil millones | No disponible | Gemma license | Safetensors, GGUF | Multimodal, mayor tamano y requisitos |
| Phi-3.5-vision | ~4,2 mil millones | No disponible | MIT | Safetensors | Vision-language de Microsoft, orientado a imagen |

La comparativa se limita a caracteristicas publicas; no se dispone de evaluaciones cruzadas independientes entre estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-2B, puede heredar sesgos del modelo base y del dataset de ajuste.
- Riesgo de alucinacion: elevado en un modelo de 1,5 mil millones de parametros, especialmente en tareas de razonamiento complejo, codigo y analisis de imagenes detallado.
- Limitaciones de contexto e idioma: la longitud de contexto no esta publicada y no se especifica la cobertura linguistica; el rendimiento fuera del ingles y el chino puede degradarse.
- Benchmarks no verificables: la tabla de la model card carece de metodologia y compara con modelos de gamas muy superiores, lo que invalida su uso como referencia objetiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no aclara si el ajuste fino introduce restricciones adicionales; conviene revisar la licencia del modelo base.
- Empaquetado limitado: solo se distribuye GGUF Q4_K_M y el proyector F16, sin pesos completos ni versiones en otros formatos, lo que dificulta el reentrenamiento o la evaluacion fina.
- Madurez del proyecto: repositorio con 285 descargas y 1 like, aplicacion propia aun no disponible y documentacion escasa; no recomendable para produccion critica sin validacion previa.
- Fechas incoherentes: la model card indica noviembre de 2026, lo que sugiere posibles errores de publicacion y reduce la confianza en los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fendrix-Studio/Stera-AI-Lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio del autor: https://fendrixstudio.netlify.app/
- Aplicacion Stera AI (proxima): https://stera-ai-fendrix-studio.netlify.app/
- LM Studio: https://lmstudio.ai
