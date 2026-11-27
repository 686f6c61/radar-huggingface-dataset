# JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-DFlash2

## Resumen

Qwen3.8-Flash-Next FLARE 1M TP2 DFlash2 es un paquete de runtime preparado por JohannesBertens para servir el modelo Qwen3.8-Flash-Next (publicado por NVIDIA como `nvidia/Qwen3.8-Flash-Next-FP4-Local`) mediante el motor Flare de NVIDIA (repositorio `hyperflare-inference`). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue que empaqueta los pesos del checkpoint original junto con tablas rotatorias modificadas y un modelo borrador de decodificación especulativa, listo para ejecutarse en hardware Blackwell.

La aportación principal del paquete es la extensión del contexto de servicio desde los 262.144 tokens nativos hasta 1.048.576 tokens (1M) mediante interpolación de rope tipo YaRN de factor 4, aplicada solo en frecuencia (sin modificar la temperatura de atención). La interpolación se incrusta en las tablas rotatorias en tiempo de preparación, por lo que el checkpoint original permanece inalterado. El paquete está optimizado para dos GPU Blackwell de la misma arquitectura (rank count 2) y usa cuantización NVFP4 con expertos en W4A16 durante decodificación.

La variante DFlash2 sustituye el módulo MTP nativo por un modelo borrador aprendido (DFlash2) con 7 tokens de borrador, anchuras 1-8 y verificación adaptativa, además de cuantizar la cabeza del borrador y proyecciones elegibles en MXFP8. Según las mediciones del autor, destaca en prefill de prompts largos y decodificación de un solo flujo, con un techo de concurrencia de 16 peticiones. Es relevante ahora porque demuestra la viabilidad práctica de servir contextos de 1M tokens en GPU profesionales Blackwell con throughput medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-Flash-Next); paquete de runtime con decodificacion especulativa DFlash2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (extendido desde 262.144 nativos via YaRN factor 4) |
| Tipos de cuantizacion | NVFP4 en checkpoint base; expertos en W4A16 durante decode/verificacion; cabeza del borrador y proyecciones elegibles en MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (license: other) |
| Formato de pesos | Paquete de runtime Flare (payload en revision `gb202`); checkpoint base FP4; artefactos MXFP8 |
| Tamano del repositorio | 111,1 GB |
| Pipeline | image-text-to-text (multimodal) |
| Hardware objetivo | 2x GB202 (RTX PRO 6000 Blackwell, SM120) |
| Contrato de ejecucion / ABI | Prepared model contract 2 / execution ABI 6 |
| Motor requerido | Flare (`NVIDIA/hyperflare-inference`) commit `e30d55db` (2026-11-25) o superior |
| Tokens de borrador | 7 (anchuras 1-8, capacidad 128, verificacion adaptativa) |
| Concurrencia maxima | 16 |
| Chunks de prefill | 8.192 tokens |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un transformer multimodal (image-text-to-text) distribuido por NVIDIA en formato FP4. Sobre ese checkpoint, este paquete aplica una preparacion de runtime que no reentrena ni modifica los pesos: incrusta tablas rotatorias con interpolacion YaRN de factor 4 (`RopeScaling(4.0, 262144)`) para extender el contexto efectivo a 1M tokens, y sustituye el modulo MTP nativo por el modelo borrador DFlash2 (`incoai/Qwen3.8-Flash-Next-DFlash2` @ `a22a1744`, ~1,2 GB), con 7 tokens de borrador, anchuras 1-8 y verificacion adaptativa.

La innovacion tecnica principal es la combinacion de decodificacion especulativa DFlash2 con cuantizacion mixta: expertos enrutados en W4A16 durante decodificacion y verificacion (`--force-moe-decode-a16`), y cabeza del borrador mas proyecciones elegibles en MXFP8 (`--draft-head-quantization mxfp8`, `--online-mxfp8`). El paquete captura chunks de prefill de 8.192 tokens a concurrencia 16, lo que segun el autor eleva el prefill de prompts frios entre un 57 % y un 65 % respecto a los hermanos basados en MTP5. Los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Contexto largo de hasta 1.048.576 tokens con recuperacion tipo needle demostrada a 268k y 1,04M tokens.
- Decodificacion especulativa con DFlash2 (7 tokens de borrador, verificacion adaptativa) para acelerar la generacion.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`).
- Cache de prefijo en RAM de host (256 GB de prefix cache configurado en las pruebas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: el modelo puede ingerir prompts de hasta 1M tokens, lo que permite procesar libros completos, expedientes o bases de codigo en una sola pasada sin fragmentacion. El prefill medido de 11.418 tok/s sobre 1,04M tokens (91,1 s) hace viable este escenario en produccion.
- Recuperacion de informacion en corpus largos (needle in a haystack): la recuperacion verificada a 268k y 1,04M tokens lo hace adecuado para sistemas de preguntas y respuestas sobre repositorios documentales masivos con cache de prefijo.
- Generacion de historias y contenido creativo de un solo flujo: con 246 tok/s en decodificacion de un solo stream (el mas rapido de la familia segun el autor), es apropiado para aplicaciones interactivas de escritura asistida.
- Servicio de chat multimodal: al ser un pipeline image-text-to-text, puede integrarse en asistentes que reciben imagenes y texto con contexto largo, siempre que se acepte el techo de 16 peticiones concurrentes.
- Procesamiento batch de prompts largos: con 916 tok/s agregados a 8 streams y 1.308 tok/s a 16 streams, es util para tareas de resumen o extraccion sobre lotes moderados de documentos extensos.
- Investigacion en inferencia de contexto largo: sirve como banco de pruebas reproducible para evaluar YaRN, decodificacion especulativa DFlash2 y cuantizacion mixta en hardware Blackwell, con cifras de referencia publicadas por el autor.

## Benchmarks y rendimiento

Mediciones del autor sobre 2x RTX PRO 6000 Blackwell (2026-11-25, engine `e30d55db`), con generaciones de 600 tokens, recuperacion con cache fria, tablas de embedding en RAM de host y 256 GB de cache de prefijo:

| Metrica | Este paquete (DFlash2, c16) | Hermano TP2 A16 (MTP5, c32) | Hermano TP2 (MTP5, c32, W4A4) |
|---|---|---|---|
| Decode, 1 stream | 246 tok/s (2,25 tok/ronda) | 234 tok/s | 143 tok/s |
| Decode, 8 streams (agregado) | 916 tok/s | 900 tok/s | 297 tok/s |
| Decode, 16 streams (agregado) | 1.308 tok/s | 1.373 tok/s | 531 tok/s |
| Aceptacion del borrador a 16 streams | 48,7 % | 59,5 % | 40,4 % |
| Prefill, prompt de 268k (frio) | 12.952 tok/s · 20,7 s | 8.239 tok/s · 32,5 s | 7.319 tok/s · 36,6 s |
| Prefill, prompt de 1,04M (frio) | 11.418 tok/s · 91,1 s | 6.897 tok/s · 150,8 s | 6.145 tok/s · 169,2 s |
| Recuperacion needle (268k / 1,04M) | si / si | si / si | si / si |
| KV cache al cargar | 7.979.008 tokens KV | 7.503.872 | 7.471.104 |
| Carga del servidor | 50 s | 65 s | 125 s |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- GPU: exactamente 2 dispositivos GB202 (RTX PRO 6000 Blackwell, SM120). La reproduccion exige la misma arquitectura sobre la que se preparo el paquete.
- VRAM: no disponible de forma explicita; el repositorio ocupa 111,1 GB y el checkpoint base descargado ronda los 102 GB, distribuido entre dos GPU.
- Memoria de host: las pruebas usaron 256 GB de cache de prefijo con tablas de embedding en RAM.
- No cabe en GPU de consumo convencionales (RTX 4090, etc.): requiere Blackwell GB202 y el motor Flare.
- Despliegue: motor Flare compilado desde `NVIDIA/hyperflare-inference` (commit `e30d55db` o superior), con `cargo build --release --manifest-path flare-cli/Cargo.toml`. No requiere Python ni descarga adicional mas alla del paquete.
- Comando de servicio: `flare run JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-DFlash2 --gpus 0,1`, con `--mtp-draft-tokens 7` para la profundidad capturada.
- Latencia y throughput medidos: 50 s de carga del servidor; 246 tok/s en un stream; 1.308 tok/s agregados a 16 streams; prefill de 1,04M tokens en 91,1 s.
- Validacion en contenedor para este paquete concreto: no ejecutada por el autor; se remite a las notas del hermano TP2 (SELinux `--security-opt label=disable`, montaje del core y perfil de publicador para UID 10001).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decode 1 stream | Prefill 1,04M | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este paquete (DFlash2, c16) | no disponible | 1.048.576 | 246 tok/s | 11.418 tok/s · 91,1 s | nvidia-open-model-agreement | Paquete Flare en HF |
| Qwen3.8-Flash-Next FLARE 1M TP2 A16 (MTP5, c32) | no disponible | 1.048.576 | 234 tok/s | 6.897 tok/s · 150,8 s | nvidia-open-model-agreement | Paquete Flare en HF |
| Qwen3.8-Flash-Next FLARE 1M TP2 (MTP5, c32, W4A4) | no disponible | 1.048.576 | 143 tok/s | 6.145 tok/s · 169,2 s | nvidia-open-model-agreement | Paquete Flare en HF |
| Qwen3.8-Flash-Next-FP4-Local (checkpoint base NVIDIA) | no disponible | 262.144 nativos | no disponible | no disponible | nvidia-open-model-agreement | HF (`nvidia/...`) |

Los tres paquetes comparados son variantes del mismo checkpoint preparadas por el mismo autor; no se dispone de datos de modelos de otros proveedores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: es un paquete de runtime atado a una version concreta del motor Flare (ABI 6, contrato 2) y a la arquitectura GB202. Motores anteriores fallan en `Prepare model` con "unsupported execution contract version".
- Requiere aceptar la divulgacion del publicador en cada carga en linea (clave `6ae68dd76635a095255de5f669ab18ce9a1bb43aea98a7d3b21ee2ec384dedd0`); la verificacion de identidad descarga `publisher.json` del repositorio.
- Techo de concurrencia de 16 peticiones; por encima, el hermano A16 (c32) ofrece mayor throughput agregado.
- Aceptacion del borrador mas baja que el hermano MTP5 a 16 streams (48,7 % frente a 59,5 %).
- Contexto extendido via YaRN de factor 4: la calidad mas alla de los 262.144 tokens nativos no esta cuantificada con benchmarks academicos en la informacion disponible.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplican los riesgos habituales de modelos generativos sin datos especificos.
- Idiomas soportados: no disponible.
- Licencia `nvidia-open-model-agreement`: es necesario revisar sus terminos para uso comercial; el paquete declara `license: other`.
- Validacion en contenedor para este paquete especifico no ejecutada por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de un artefacto reciente y poco contrastado por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-DFlash2
- Checkpoint base NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Modelo borrador DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Motor Flare (NVIDIA): https://github.com/NVIDIA/hyperflare-inference
- Hermano TP2 A16: https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2-A16
- Hermano TP2 (W4A4): https://huggingface.co/JohannesBertens/Qwen3.8-Flash-Next-FLARE-1M-TP2
- Licencia NVIDIA open model agreement: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
