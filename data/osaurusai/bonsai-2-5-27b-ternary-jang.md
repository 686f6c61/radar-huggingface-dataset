# OsaurusAI/Bonsai-2.5-27B-Ternary-JANG

## Resumen

Bonsai-2.5-27B-Ternary-JANG es un bundle de pesos en formato MLX publicado por OsaurusAI que reempaqueta el modelo Prism ML Ternary Bonsai 2.5 27B (a su vez construido sobre Qwen3.8-27B). Se trata de un modelo denso vision-lenguaje de 27.784 millones de parametros cuyos pesos de lenguaje estan cuantizados en ternario (codigos de 2 bits con escala por grupo de 128 elementos), mientras que la torre de vision y la cabeza MTP para decodificacion especulativa se mantienen en float16 y 4 bits respectivamente, sin modificar respecto al pack original de Prism.

El modelo resuelve el problema de ejecutar un VLM de 27B con contexto de 262.144 tokens en hardware Apple Silicon con un consumo de almacenamiento de solo 8.252 GiB de shards, gracias a la cuantizacion ternaria y a una rotacion de Hadamard por bloques (bloque de 1024) aplicada a las activaciones en tiempo de ejecucion. Incluye plantilla de chat Qwen3.8 con modo thinking, `reasoning_effort` configurable, soporte de tool calling en formato XML y procesadores de imagen y video.

Es relevante ahora porque demuestra que la cuantizacion extrema (ternaria, 2 bits) puede ser lossless respecto a un pack de referencia ya cuantizado, con paridad de logits verificada, y porque habilita inferencia multimodal con contexto largo y decodificacion especulativa en equipos de consumo de Apple, algo poco habitual en modelos de esta categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3.8-27B vision-lenguaje (64 bloques: 48 GatedDeltaNet + 16 atencion completa) |
| Parametros totales | 27.784.338.160 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Ternario {-s, 0, +s} en pesos de lenguaje, grupo de 128, slots de 2 bits; torre de vision en float16; cabeza MTP en 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX), 8.252 GiB en 8 shards |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 64 bloques que combina 48 bloques de GatedDeltaNet (atencion lineal con estado recurrente) y 16 bloques de atencion completa, siguiendo el diseno de Qwen3.8-27B. Los pesos de lenguaje se almacenan en formato ternario con escala por grupo de 128 elementos y se aplican sobre una base de rotacion de Hadamard por bloques (bloque de 1024, con signos explicitos en `hadamard.json`) que se aplica a las activaciones en tiempo de ejecucion. La torre de vision permanece en float16 y es byte-identica al pack de Prism. Se incluye una cabeza MTP v2 de 4 bits para decodificacion especulativa que comparte embedding y cabeza de salida.

El bundle es un reempaquetado lossless: cada codigo de 2 bits y cada escala del pack original de Prism se conserva sin cambios tras validacion, y los 2.057 tensores de lenguaje y 333 tensores de vision son byte-identicos al original (mas 31 tensores de la cabeza MTP). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada; esos detalles corresponden al modelo base Qwen3.8-27B y al trabajo de Prism ML, no documentados en esta ficha.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y `reasoning_effort` configurable (`xhigh`, `medium`, `low`).
- Procesamiento de imagen: descripcion de formas y colores, OCR exacto de texto superpuesto.
- Procesamiento de video: reconocimiento de secuencias de fotogramas (verificado con fotogramas rojos seguidos de azules).
- Tool calling / function calling en formato XML de Qwen3.8 (`qwen3_coder`), con integracion del resultado de la herramienta en la respuesta.
- Razonamiento multi-paso y flujos agenticos, con bloques `<think>` para la traza de razonamiento.
- Contexto largo: recuperacion de hechos en prompts de hasta 10.662 tokens verificada; ventana declarada de 262.144 tokens.
- Conversacion multi-turno con recall exacto de informacion previa.
- Decodificacion especulativa mediante cabeza MTP v2, con verificacion de cada borrador por el modelo completo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con capturas de pantalla o fotos adjuntas y mantener contexto de hasta 262.144 tokens, lo que permite arrastrar historiales largos sin truncar.
- Extraccion de datos de documentos: OCR exacto de texto superpuesto en imagenes, util para digitalizar facturas, formularios o tickets en pipelines de back office sobre equipos Apple.
- Agentes con herramientas: el soporte de tool calling en formato XML permite encadenar llamadas a APIs (por ejemplo, consulta meteorologica) e integrar los resultados en la respuesta final, adecuado para asistentes automatizados.
- Analisis de video: deteccion de secuencias de fotogramas y cambios de escena, aplicable a monitorizacion de contenidos o resumen de clips cortos.
- Asistencia a desarrolladores en local: generacion y revision de codigo con modo thinking y decodificacion especulativa, ejecutable en un Mac con MLX sin depender de la nube.
- Razonamiento sobre documentos largos: resumen y pregunta-respuesta sobre contratos o informes de decenas de miles de tokens gracias a la ventana de 262.144 tokens.
- Prototipado de agentes en Apple Silicon: el tamano de 8.252 GiB en shards y la integracion con el runtime Osaurus permiten desplegar un VLM de 27B en estaciones de trabajo Mac para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye verificaciones funcionales realizadas el 2026-11-24 en un Apple M5 Ultra:

| Prueba | Resultado |
|---|---|
| Paridad de logits vs loader de referencia de Prism | PASS: coincidencia de argmax 1.0 en cada posicion sobre 4 prompts, continuaciones greedy identicas |
| Pesos | 2.057 tensores de lenguaje y 333 de vision byte-identicos al pack de Prism (mas 31 de la cabeza MTP) |
| Texto, thinking off / on (`medium`) | PASS: `Paris`; bloque think cerrado con `391` |
| Multi-turno | PASS: recall y combinacion exactos de codeword |
| Contexto largo | PASS: hecho recuperado de un prompt de 10.662 tokens |
| Imagen / OCR | PASS: formas y colores; OCR exacto de texto superpuesto |
| Video | PASS: fotogramas rojos y luego azules |
| Tool calling | PASS: llamada `get_weather` emitida, resultado integrado en la respuesta |
| Decodificacion especulativa MTP | PASS: borradores verificados por el modelo completo; en 8 repeticiones greedy por prompt, codigo y prosa coincidieron exactamente con decodificacion plana; un prompt de historia larga se dividio en un token casi empatado en algunas repeticiones (numerica de verificacion por lotes, no cambio de pesos) |

## Requisitos de hardware

- VRAM/almacenamiento: 8.252 GiB de shards en disco; en memoria unificada de Apple Silicon se requiere espacio para pesos mas activaciones y cache KV, no cuantificado en la informacion disponible.
- GPU recomendadas: Apple Silicon con runtime Osaurus 1.0.13 o superior; verificado en Apple M5 Ultra. No se documenta soporte para A100, H100 ni RTX 4090 en la informacion proporcionada.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta con memoria unificada suficiente; el formato MLX no es compatible con GPUs NVIDIA de consumo sin conversion.
- Opciones de despliegue: runtime Osaurus (obligatorio, version 1.0.13 o superior); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2.5-27B-Ternary-JANG (este) | 27.784 M | 262.144 | Ternaria 2 bits (lenguaje), float16 (vision), 4 bits (MTP) | Apache-2.0 | Hugging Face, runtime Osaurus |
| prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit | no disponible | no disponible | Ternaria 2 bits (pack de referencia) | no disponible | Hugging Face |
| Qwen3.8-27B (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere el runtime Osaurus 1.0.13 o superior; no es un formato portable a otros motores de inferencia sin conversion.
- El formato MLX limita el despliegue a hardware Apple Silicon; no hay soporte documentado para CUDA.
- La cuantizacion ternaria, aunque lossless respecto al pack de Prism, hereda cualquier perdida de calidad que ya tuviera ese pack de 2 bits respecto al modelo original en float16.
- La decodificacion especulativa puede introducir divergencias en tokens casi empatados en prompts largos, segun la propia verificacion del autor.
- Riesgo de alucinacion no cuantificado; no se han publicado evaluaciones de sesgo ni de robustez.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE.txt` y atribuir los pesos a Prism ML.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- No se dispone de informacion sobre el dataset de entrenamiento, sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/OsaurusAI/Bonsai-2.5-27B-Ternary-JANG
- Modelo base (pack de referencia): https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Perfil del autor: https://huggingface.co/OsaurusAI
- Sitio del runtime: https://osaurus.ai
