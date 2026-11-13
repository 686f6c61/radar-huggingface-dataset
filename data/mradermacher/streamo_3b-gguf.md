# mradermacher/Streamo_3B-GGUF

## Resumen

Streamo_3B es un modelo multimodal de 3.085.938.688 parámetros orientado a la comprensión de vídeo en streaming, desarrollado originalmente por JiaerX y distribuido en formato GGUF por mradermacher. Se construye sobre la arquitectura Qwen2.5-VL, lo que le confiere capacidades de visión-lenguaje, y está especializado en el procesamiento de flujos de vídeo continuos en lugar de clips estáticos. El modelo se ha ajustado con el dataset Streamo-Instruct-465K, compuesto por 465.000 ejemplos de instrucciones sobre vídeo en streaming.

La relevancia de este modelo radica en su enfoque específico: la mayoría de los modelos visión-lenguaje convencionales asumen un vídeo previamente segmentado y finito, mientras que Streamo aborda el escenario de flujos continuos donde el contexto crece de forma indefinida. Esto lo hace adecuado para aplicaciones de monitorización, vigilancia, retransmisiones en directo o asistentes que observan vídeo en tiempo real.

Esta ficha cubre la versión cuantizada publicada por mradermacher, que ofrece 12 variantes de cuantización GGUF (desde Q2_K hasta f16) más dos ficheros mmproj para el proyector multimodal, facilitando el despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base está disponible en el repositorio JiaerX/Streamo_3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2.5-VL (vision-lenguaje) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |
| Tamano del repositorio | 30,1 GB |
| Modelo base | JiaerX/Streamo_3B |
| Dataset de ajuste | maifoundations/Streamo-Instruct-465K |

## Arquitectura y entrenamiento

Streamo_3B se apoya en la arquitectura Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La innovación específica del modelo reside en su tratamiento del vídeo en streaming: en lugar de procesar clips cerrados, el modelo está diseñado para mantener la comprensión sobre flujos continuos, lo que exige mecanismos de gestión de contexto temporal que no están detallados en la información disponible. El repositorio incluye un fichero mmproj separado (proyector multimodal) que se carga junto con los pesos del lenguaje en llama.cpp para habilitar la entrada visual.

El ajuste se realizó sobre el dataset Streamo-Instruct-465K, con 465.000 ejemplos de instrucciones orientadas a vídeo en streaming. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá de lo que hereda de Qwen2.5-VL. El modelo está referenciado en el paper arXiv:2512.21334, que constituye la fuente técnica principal para consultar los detalles de arquitectura y entrenamiento.

## Capacidades

- Comprensión de vídeo en streaming: procesamiento de flujos de vídeo continuos, no solo clips estáticos.
- Descripción y respuesta a preguntas sobre contenido visual en vídeo (video question answering).
- Generación de texto conversacional a partir de entradas multimodales (imagen/vídeo + texto).
- Capacidades de visión-lenguaje heredadas de Qwen2.5-VL: reconocimiento de objetos, escenas y texto en imagen.
- Soporte de conversación multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del modelo.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Monitorización de vídeo en directo: el modelo puede procesar un flujo continuo de cámara y responder preguntas sobre eventos a medida que ocurren, aprovechando su especialización en streaming frente a modelos que requieren clips cerrados.
- Asistencia en retransmisiones: análisis en tiempo real de streams de eventos, deportes o conferencias para generar resúmenes o responder consultas del espectador sobre lo que está ocurriendo.
- Vigilancia y seguridad: detección y descripción de eventos en cámaras de seguridad con flujos continuos, generando alertas textuales a partir del contenido visual.
- Accesibilidad audiovisual: descripción automática de vídeo en directo para personas con discapacidad visual, generando narraciones del contenido conforme se reproduce.
- Análisis de vídeo para investigación: procesamiento de grabaciones largas o flujos experimentales donde el modelo debe mantener contexto temporal a lo largo del tiempo.
- Asistentes conversacionales con cámara: integración en aplicaciones donde el usuario comparte un flujo de vídeo y mantiene una conversación multi-turno sobre lo mostrado, gracias al formato conversacional y al proyector multimodal incluido.
- Despliegue en hardware de consumo: al ofrecerse en cuantizaciones desde Q2_K (1,4 GB) hasta Q8_0 (3,4 GB), permite ejecutar comprensión de vídeo en estaciones de trabajo sin GPU de datacenter mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + proyector multimodal):
  - Q2_K + mmproj-Q8_0: aproximadamente 2,3 GB.
  - Q4_K_M + mmproj-Q8_0: aproximadamente 2,9 GB.
  - Q8_0 + mmproj-f16: aproximadamente 4,8 GB.
  - f16 + mmproj-f16: aproximadamente 7,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor comodidad; A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más, usando cuantizaciones Q4_K_M o Q5_K_M. Las cuantizaciones Q2/Q3 permiten incluso GPUs con 4 GB.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para los ficheros GGUF; el modelo base en safetensors es compatible con transformers. Para el proyector multimodal es necesario cargar el fichero mmproj correspondiente.
- Latencia y throughput estimados: no disponible. El procesamiento de vídeo en streaming añade coste computacional por frame que no está cuantificado en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Streamo_3B (esta ficha) | 3,09 B | no disponible | Vídeo en streaming (Qwen2.5-VL) | no disponible | GGUF, safetensors |
| Qwen2.5-VL-3B | 3 B (aprox.) | no disponible en esta ficha | Visión-lenguaje general | no disponible en esta ficha | safetensors, GGUF |
| Video-LLaVA / modelos VLM de ~3B | ~3-7 B | no disponible | Vídeo estático / imagen | variable | safetensors, GGUF |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. Streamo_3B se distingue por su especialización en streaming y por compartir la base Qwen2.5-VL, lo que permite reutilizar el ecosistema de herramientas de esa familia.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia no especificada: al no indicarse la licencia en los metadatos ni en la model card, no se puede confirmar el uso comercial. Es imprescindible consultar el repositorio del modelo base (JiaerX/Streamo_3B) antes de desplegarlo en producción.
- Riesgo de alucinación: como todo modelo generativo, puede describir eventos que no ocurren en el vídeo o inventar detalles, especialmente en cuantizaciones agresivas (Q2_K, Q3_K_S).
- Contexto temporal: aunque está diseñado para streaming, la longitud de contexto no está documentada; flujos muy largos pueden degradar la coherencia o requerir truncamiento.
- Cuantizaciones estáticas: mradermacher indica que no hay cuantizaciones con imatrix/weighted disponibles, lo que puede suponer una pérdida de calidad algo mayor que en cuantizaciones ponderadas equivalentes.
- Dependencia del proyector multimodal: es obligatorio cargar el fichero mmproj junto con los pesos; usarlo sin él desactiva la entrada visual.
- Sin benchmarks publicados: no hay métricas verificables de rendimiento en tareas de vídeo, por lo que la evaluación debe hacerse con datos propios antes de adoptarlo.
- Fecha y tracción: el repositorio es reciente y sin descargas ni likes, lo que implica poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Streamo_3B-GGUF
- Modelo base: https://huggingface.co/JiaerX/Streamo_3B
- Dataset de instrucciones: https://huggingface.co/datasets/maifoundations/Streamo-Instruct-465K
- Paper: https://arxiv.org/abs/2512.21334
- Página de descargas del cuantizador: https://hf.tst.eu/model#Streamo_3B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
