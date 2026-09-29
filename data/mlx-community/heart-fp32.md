# mlx-community/HEART-fp32

## Resumen

HEART (Hybrid Efficient Attention with Rank-factorized bias Transformer) es una red de super-resolucion de imagen desarrollada por Philip Hofmann (Phips) y publicada bajo licencia Apache-2.0. El repositorio analizado, `mlx-community/HEART-fp32`, es una conversion comunitaria a formato MLX en precision fp32 que reproduce de forma exacta, tensor a tensor, los pesos originales de PyTorch. Se trata de un transformer de atencion por ventanas de la familia HAT-iLN con 16,7 millones de parametros, especializado en tareas de image-to-image: reescalado 4x y 2x y restauracion de imagenes danadas.

El modelo resuelve un problema concreto: el aumento de resolucion y la restauracion de fotografia con degradaciones reales (ruido, compresion, desenfoque) sin depender de modelos gigantes. Fue entrenado exclusivamente sobre el corpus CC0 `Phips/lucid-cc0-v2-hc-512`, procedente de pxhere.com, lo que simplifica su trazabilidad legal para uso comercial. Su relevancia actual radica en que permite ejecutar super-resolucion de alta fidelidad de forma local en Apple silicon mediante MLX, integrandose en el motor Swift `xocialize/mlx-heart-swift` como el nivel de fidelidad para imagenes fijas.

A diferencia de los modelos de lenguaje, no procesa texto ni admite instrucciones: su entrada y salida son imagenes. El repositorio incluye cuatro checkpoints diferenciados por variante de entrenamiento y escala (`.fidelity`, `.sharp`, `.clean` y `.clean2x`), lo que permite seleccionar el equilibrio entre fidelidad y nitidez segun el tipo de fuente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer HAT-iLN con atencion por ventanas y sesgo factorizado por rango (Hybrid Efficient Attention with Rank-factorized bias Transformer), familia HAT de XPixelGroup |
| Parametros totales | 16,7 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje; procesa imagenes mediante atencion por ventanas |
| Tipos de cuantizacion | fp32 (este repositorio); existe un lane fp16 en `mlx-community/HEART-fp16`, donde los tensores conv/linear van en fp16 y 220 de 748 tensores (i-LN, pesos/sesgos afines y parametros de la red implicita RIB) permanecen en fp32. No hay cuantizaciones de 8 o 4 bits publicadas |
| Idiomas soportados | no aplica (modelo de imagen; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |
| Numero de tensores | 748 |
| Escalas soportadas | 4x (`.fidelity`, `.sharp`, `.clean`) y 2x (`.clean2x`) |
| Variantes incluidas | `heart_4x_otf_v2_fp32.safetensors` (`.fidelity`, por defecto), `heart_4x_otf_gan_fp32.safetensors` (`.sharp`), `heart_4x_pretrain_fp32.safetensors` (`.clean`), `heart_2x_fp32.safetensors` (`.clean2x`) |
| Framework | MLX (Apple silicon) |
| Modelo base | `Phips/HEART` (revision upstream `868878ce4c253a8061300f923b620fdc6edf090a`) |
| Dataset de entrenamiento | `Phips/lucid-cc0-v2-hc-512` (CC0, via `nyuuzyou/pxhere` y pxhere.com) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer para super-resolucion con atencion por ventanas, denominada HAT-iLN, que combina normalizacion i-LN y el mecanismo RIB (red implicita con tablas de posicion) procedente de SST. Esta construccion permite modelar dependencias de largo alcance dentro de la imagen sin el coste cuadratico de la atencion global completa, algo critico en una red de solo 16,7 M de parametros. La conversion a MLX mantiene las claves de los tensores sin cambios y solo reordena las convoluciones de `(O,I,kH,kW)` a `(O,kH,kW,I)`; el resto de la conversion es exacta por tensor. El lane fp16 aplica una regla de precision mixta: conv y linear en fp16, mientras que las estadisticas i-LN, las tablas de posicion RIB, el softmax, el average pooling global y su cabeza squeeze/excite se calculan en fp32.

En cuanto al entrenamiento, solo se ha publicado que los pesos se entrenaron sobre el corpus CC0 `Phips/lucid-cc0-v2-hc-512`. Las variantes `.fidelity` y `.sharp` corresponden a un regimen de degradaciones generadas al vuelo (OTF), la segunda con objetivo GAN, mientras que `.clean` y `.clean2x` son los pesos preentrenados oficiales orientados a fuentes limpias. No se detallan en la informacion disponible el numero de tokens o imagenes, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en el sentido habitual a un modelo de imagen).

La innovacion destacable del repositorio no es el entrenamiento, sino la paridad numerica: la conversion fp32 alcanza 127,5 dB de PSNR frente a la implementacion PyTorch original en CPU fp32, con cada suboperacion dentro de 1e-5 relativo, lo que la convierte en una referencia valida para auditar la implementacion.

## Capacidades

- Super-resolucion de imagen 4x con las variantes `.fidelity`, `.sharp` y `.clean`, y 2x con `.clean2x`.
- Restauracion de imagenes danadas: la variante `.fidelity` es, segun la model card, la mejor de las cuatro con entradas deterioradas en el banco de pruebas Forge.
- Generacion de salida mas nitida en escenas reales mediante `.sharp`, la variante entrenada con objetivo GAN.
- Reescalado de fuentes limpias con `.clean` y `.clean2x`, los pesos preentrenados oficiales.
- Pipeline de image-to-image puro: no acepta prompts, instrucciones de texto ni condicionamiento semantico.
- Seleccion de variante en tiempo de ejecucion a traves del motor Swift (`HEARTConfiguration(variant:quant:)`), que materializa el fichero correspondiente desde el repositorio en el primer uso.
- Ejecucion local en Apple silicon mediante MLX, con integracion en Swift a traves de `MLXServeCore` y `MLXHEART`.
- Procesamiento por teselas (tiling) para imagenes grandes, segun el estudio de tiling documentado en `PORTING-SPEC.md`.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingues, vision general (clasificacion, deteccion, VQA), audio ni modo de razonamiento explicito.

## Casos de uso

- Restauracion de fotografia antigua o deteriorada: usar la variante `.fidelity` con el fichero `heart_4x_otf_v2_fp32.safetensors`, que segun la model card es la mejor arm con entradas danadas en el banco Forge, recuperando detalle en imagenes con ruido, compresion o desenfoque antes de su publicacion o archivo.
- Ampliacion de fotografia digital limpia: la variante `.clean` (`heart_4x_pretrain_fp32`) esta pensada para fuentes sin degradacion, de modo que un fotografo puede generar una version 4x de un original nitido sin introducir artefactos de restauracion.
- Preparacion de imagenes para impresion a gran formato: partiendo de un original de baja resolucion, el modelo 4x multiplica las dimensiones por cuatro, suficiente para adaptar capturas pequenas a tamanos de impresion moderados.
- Revelado integrado en aplicaciones nativas de Apple silicon: el port `mlx-heart-swift` expone `MLXServeEngine` y `ImageUpscaleRequest`, permitiendo que una app de escritorio o movil en Swift ejecute el reescalado en local sin enviar imagenes a un servicio externo, lo que preserva la privacidad del usuario.
- Post-procesado de imagenes generadas por IA: los resultados de un modelo generativo suelen ser limpios pero de resolucion limitada, un escenario idoneo para `.clean` o `.clean2x`, que aumentan el tamano sin anadir restauracion innecesaria.
- Preprocesado para pipelines de vision por computador: antes de una etapa de deteccion, segmentacion o reconocimiento, un reescalado 4x puede recuperar detalle fino en objetos pequenos; la variante elegida dependera de si la fuente ya esta limpia (`.clean`) o no (`.fidelity`).
- Digitalizacion y archivo de patrimonio documental o grafico: la variante 2x `.clean2x` ofrece un factor de ampliacion mas conservador, util cuando se busca minimizar la invencion de detalle en documentos historicos.
- Procesado por lotes en un Mac: al ser un modelo de 16,7 M de parametros con pesos de decenas de megabytes, es viable mantenerlo cargado en memoria y procesar colecciones enteras de imagenes de forma secuencial sin requerir GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR/SSIM/LPIPS frente a verdad de referencia en conjuntos estandar) en la informacion disponible. Los unicos datos numericos de la model card son metricas de paridad numerica entre implementaciones, no de calidad de imagen:

| Variante | Escala | PSNR de paridad frente a PyTorch fp32 en CPU (128²) |
|---|---|---|
| `.fidelity` (`heart_4x_otf_v2_fp32`) | 4x | 127,5 dB |
| `.sharp` (`heart_4x_otf_gan_fp32`) | 4x | 125,3 dB |
| `.clean` (`heart_4x_pretrain_fp32`) | 4x | 122,5 dB |
| `.clean2x` (`heart_2x_fp32`) | 2x | 124,0 dB |

Cada suboperacion de la conversion se mantiene dentro de 1e-5 relativo. Frente a las exportaciones ONNX del autor bajo ONNX Runtime, el port coincide en 90,2 / 84,9 / 95,8 dB a 128², con la salvedad de que el fichero ONNX de `heart_4x_pretrain` no reproduce su checkpoint (7,8 dB) y de que ORT presenta deriva al variar el tamano de imagen. Los detalles del estudio fp16 y del estudio de tiling estan en `PORTING-SPEC.md` del repositorio del port.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 67 MB en fp32 y 33 MB en fp16, calculo derivado de los 16,7 M de parametros declarados; el autor no publica cifras de memoria.
- Memoria de trabajo: dominada por las activaciones, no por los pesos; crece con la resolucion de entrada, por lo que se recomienda tiling para imagenes grandes, tal como documenta el estudio de tiling del port.
- Cabe sin problema en cualquier Mac con Apple silicon (M1 o posterior); el repositorio completo ocupa 0,3 GB en disco, repartidos entre cuatro checkpoints y el `config.json`.
- GPU recomendadas: no aplica el catalogo CUDA habitual; MLX esta disenado para Apple silicon. Para GPUs NVIDIA habria que recurrir a los pesos PyTorch o a las exportaciones ONNX del autor, no incluidas en este repositorio.
- Opciones de despliegue: framework MLX (Python o Swift) y el motor `xocialize/mlx-heart-swift` (`MLXServeCore`, `MLXHEART`, `MLXServeEngine`, `WeightSourcing`). No aplica vLLM, llama.cpp, Ollama ni TGI, que son soluciones para modelos de lenguaje.
- VRAM y latencia: no disponibles. El autor no publica cifras de throughput ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Escalas | Precision | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mlx-community/HEART-fp32` (este) | 16,7 M | 2x, 4x | fp32 | safetensors MLX | Apache-2.0 | HuggingFace, lane de paridad/referencia |
| `mlx-community/HEART-fp16` | 16,7 M (220 de 748 tensores en fp32) | 2x, 4x | fp16 mixto | safetensors MLX | Apache-2.0 | HuggingFace, lane de produccion recomendado |
| `Phips/HEART` (upstream) | 16,7 M | 2x, 4x | fp32 | checkpoints PyTorch | Apache-2.0 | HuggingFace, implementacion de referencia |
| Familia HAT (XPixelGroup) | no disponible | no disponible | no disponible | no disponible | Apache-2.0 | arXiv 2205.04437 y 2504.06629; arquitectura base sobre la que se construye HEART |

No se dispone de datos verificados de parametros, contexto ni licencia de alternativas de la misma categoria como Real-ESRGAN o SwinIR en la informacion proporcionada, por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Sesgo de dominio: el entrenamiento se limita al corpus CC0 `Phips/lucid-cc0-v2-hc-512`, derivado de pxhere.com, una coleccion de fotografia generica; no hay evaluacion publicada de su comportamiento en dominios como ilustracion, documentos escaneados, imagen medica o satelital.
- Riesgo de detalle sintetico: la variante `.sharp` se entreno con objetivo GAN, lo que tiende a producir salidas visualmente nitidas pero potencialmente inventadas; en contextos forenses o de archivo conviene usar `.fidelity` o `.clean2x`.
- Ausencia de benchmarks de calidad: los unicos numeros publicados miden la paridad numerica entre implementaciones, no la fidelidad al original, de modo que no permiten comparar con otras redes de super-resolucion.
- Caveat del export ONNX upstream: el fichero ONNX de `heart_4x_pretrain` no reproduce su checkpoint (7,8 dB) y ONNX Runtime presenta deriva con el tamano de imagen, un problema del material original que conviene tener en cuenta si se reutilizan esas exportaciones.
- Limitacion de plataforma: este repositorio es exclusivamente MLX, por lo que requiere Apple silicon; no hay ruta CUDA incluida.
- Licencia: Apache-2.0 permite uso comercial, pero la model card pide expresamente acreditar al autor al utilizar estos pesos. La procedencia CC0 del corpus la declara la plataforma de origen y el re-host la asume como gobernante, sin verificacion independiente documentada.
- Traccion nula: el repositorio registra 0 descargas y 0 likes, con fechas de creacion y actualizacion en 2026, por lo que no existe aun validacion por parte de la comunidad.
- Sin capacidades de texto: no acepta prompts ni instrucciones, no admite tool calling ni razonamiento multi-paso, y no debe integrarse como sustituto de un modelo de lenguaje en ningun flujo.
- Precision: el lane fp32 duplica el consumo de memoria frente a fp16 sin mejora perceptible en la salida; en produccion se recomienda el lane fp16, reservando fp32 para validacion y referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/HEART-fp32
- Modelo upstream (PyTorch): https://huggingface.co/Phips/HEART
- Licencia upstream: https://huggingface.co/Phips/HEART/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/Phips/lucid-cc0-v2-hc-512
- Lane fp16 de produccion: https://huggingface.co/mlx-community/HEART-fp16
- Port Swift/MLX: https://github.com/xocialize/mlx-heart-swift
- Framework MLX (repositorio): https://github.com/ml-explore/mlx
- Framework MLX (web oficial): https://mlx-framework.org/
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- Estudio de MLX y aceleradores neuronales en M5: https://machinelearning.apple.com/research/exploring-llms-mlx-m5
- Articulo HAT (arquitectura base): https://arxiv.org/abs/2205.04437
- Articulo HAT-iLN: https://arxiv.org/abs/2504.06629
- Articulo RIB (SST): https://arxiv.org/abs/2603.06738
