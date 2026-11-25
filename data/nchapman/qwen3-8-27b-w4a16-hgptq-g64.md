# nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64

## Resumen

Qwen3.8-27B-W4A16-HGPTQ-g64 es una cuantizacion de 4 bits del modelo denso multimodal Qwen3.8-27B de Alibaba Qwen, publicada por el usuario nchapman. El checkpoint reduce el peso en disco de 51,75 GiB en BF16 a 16,14 GiB, lo que permite ejecutar un modelo de 29.105 millones de parametros reales en una unica GPU de 24 GB (RTX 3090/4090) dejando espacio para contexto largo de 128K-256K, entradas de vision y decodificacion especulativa. Es relevante porque mantiene calibrados de forma conjunta el backbone de texto, el codificador de vision y el cabezal MTP (Multi-Token Prediction), algo poco habitual en cuantizaciones de 4 bits que suelen dejar esas partes sin calibrar o directamente eliminarlas.

El modelo base es la arquitectura hibrida de atencion de Qwen, orientada a rendimiento en contexto largo, con soporte nativo de decodificacion especulativa mediante MTP. Esta version cuantizada emplea GPTQ con rotacion de Hadamard (de ahi el sufijo HGPTQ) en formato W4A16 con grupo de cuantizacion de 64, pesos empaquetados de 4 y 8 bits y cabezal de salida en 8 bits. El resultado declarado es una calidad casi sin perdida: 85,99 % de media agregada en IFEval, MATH-500 y HumanEval+ frente a 86,90 % del modelo completo en 16 bits.

La ficha cubre exclusivamente los datos publicados por el autor en la model card y en los metadatos de Hugging Face. Cualquier especificacion no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + vision) con atencion hibrida y cabezal MTP para decodificacion especulativa; tipo `qwen3_5` en transformers |
| Parametros totales | 29.105.255.152 (~29,1 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K-256K soportados en warp34 segun el autor; longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | W4A16 GPTQ con grupo de 64 y rotacion de Hadamard; pesos de 4 bits, activaciones de 16 bits, cabezal de salida en 8 bits; formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors / GPTQ), requiere `trust-remote-code` en vLLM |
| Tamano en disco | 16,14 GiB (frente a 51,75 GiB en BF16, 3,2x menor) |
| Tamano del repositorio | 54,3 GB |
| Descargas | 307 |
| Fecha de creacion | 2026-11-06 |
| Ultima actualizacion | 2026-11-24 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de aproximadamente 29,1 B de parametros con arquitectura de atencion hibrida disenada por Qwen para mantener rendimiento alto en contextos largos. Incorpora de forma nativa Multi-Token Prediction (MTP), un cabezal adicional que predice varios tokens por paso y se usa como borrador en decodificacion especulativa, acelerando la generacion sin cambiar la distribucion de salida del modelo principal. El modelo es multimodal: procesa imagen y texto como entrada y genera texto (pipeline `image-text-to-text`).

Esta publicacion no entrena el modelo, sino que lo cuantiza. El proceso aplica GPTQ con rotacion de Hadamard sobre pesos empaquetados de 4 bits en grupos de 64, manteniendo activaciones en 16 bits (W4A16) y el cabezal de salida en 8 bits. La innovacion destacable es la calibracion conjunta de las tres partes del modelo: backbone de texto, torre de vision y borrador MTP. El autor indica explicitamente que otras cuantizaciones de 4 bits eliminan o dejan sin calibrar la torre de vision y el cabezal de borrador, lo que degrada la calidad multimodal y la decodificacion especulativa. No se detallan en la informacion disponible el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de proposito general, orientado a codificacion, seguimiento de instrucciones y tareas de razonamiento matematico.
- Capacidades de vision: procesa imagenes junto con texto (pipeline image-text-to-text), con la torre de vision calibrada en esta cuantizacion.
- Generacion de codigo: el modelo base esta posicionado por Qwen para tareas de coding, y la cuantizacion reporta 93,3 % en HumanEval+.
- Razonamiento matematico: 82,8 % en MATH-500 segun los datos del autor.
- Seguimiento de instrucciones: 81,9 % en IFEval.
- Decodificacion especulativa mediante cabezal MTP integrado, calibrado en esta version, y compatible con un borrador externo (DFlash2-W4A16-HGPTQ).
- Contexto largo: soporte de 128K-256K en warp34.
- Soporte de tool calling y function calling: no documentado explicitamente en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente.
- Multilingue: no disponible.

## Casos de uso

- Asistente de codigo en estacion de trabajo local: con 16,14 GiB de pesos cabe en una RTX 3090 o 4090 de 24 GB, permitiendo autocompletado, refactorizacion y explicacion de codigo sin enviar el codigo a un servicio externo. El 93,3 % en HumanEval+ indica que la perdida por cuantizacion es marginal para generacion de codigo.
- Revision de capturas y diagramas: al conservar el codificador de vision calibrado, el modelo puede describir interfaces, extraer texto de imagenes o interpretar diagramas de arquitectura junto a una pregunta en texto.
- Analisis de documentos largos: la ventana de 128K-256K en warp34 permite cargar informes, expedientes o repositorios completos y hacer preguntas sobre ellos en una sola pasada.
- Servicio de inferencia en vLLM sobre una sola GPU: con vLLM 0.34 o superior y `--trust-remote-code` se puede desplegar un endpoint compatible con la API de OpenAI para prototipos y entornos de staging con presupuesto de hardware limitado.
- Razonamiento matematico asistido: resolucion paso a paso de problemas tipo competicion o verificacion de calculos en cuadernos tecnicos, con el 82,8 % en MATH-500 como referencia de calidad tras cuantizar.
- Generacion acelerada con decodificacion especulativa: combinado con el borrador DFlash2-W4A16-HGPTQ o usando el cabezal MTP integrado, reduce la latencia por token en cargas interactivas donde el tiempo de respuesta es critico.
- Evaluacion comparativa de cuantizaciones: util como checkpoint de referencia para medir la degradacion real de GPTQ con Hadamard frente al modelo en BF16 en tareas de texto y vision.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. La media agregada se calcula sobre IFEval, MATH-500 y HumanEval+.

| Benchmark | Esta cuantizacion (W4A16) | Modelo completo (16 bits) |
|---|---|---|
| IFEval | 81,9 % | no disponible por prueba |
| MATH-500 | 82,8 % | no disponible por prueba |
| HumanEval+ | 93,3 % | no disponible por prueba |
| Media agregada | 85,99 % | 86,90 % |

No se han publicado en la informacion disponible resultados desglosados del modelo en 16 bits por benchmark, ni comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: 16,14 GiB solo de pesos; con cache KV para 128K-256K de contexto, vision y decodificacion especulativa el autor indica que cabe en 24 GB, pero no publica la cifra exacta de VRAM total necesaria.
- GPU recomendadas: RTX 3090 y RTX 4090 (24 GB) son el objetivo declarado; el autor menciona GPUs RTX 30/40-series de 24 GB. No se documenta soporte en A100/H100, aunque vLLM podria ejecutarlo.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090. Para GPUs de 16 GB existe la variante W2.6A16-HGPTQ-RCO de 12,20 GiB.
- Opciones de despliegue: warp34 (herramienta del autor, `warp34 serve`), vLLM 0.34 o superior con `--trust-remote-code`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo afirma que warp34 ejecuta kernels CUDA a plena velocidad sin flags adicionales y que la decodificacion especulativa acelera la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Peso en disco | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-W4A16-HGPTQ-g64 (este) | 29,1 B | 128K-256K en warp34 | W4A16 GPTQ + Hadamard, grupo 64 | 16,14 GiB | Apache 2.0 | Vision y MTP calibrados; media 85,99 % en tres benchmarks |
| Qwen3.8-27B (BF16) | 29,1 B | no disponible | 16 bits | 51,75 GiB | Apache 2.0 | Referencia de calidad; media 86,90 % |
| Qwen3.8-27B-W2.6A16-HGPTQ-RCO | 29,1 B | no disponible | W2.6A16 | 12,20 GiB | Apache 2.0 | Variante del mismo autor para GPUs de 16 GB; calidad no disponible |
| Qwen3.8-27B-DFlash2-W4A16-HGPTQ | 29,1 B | no disponible | W4A16 | no disponible | Apache 2.0 | Borrador de decodificacion especulativa del mismo autor, no un modelo completo |

No se dispone de datos de benchmarks ni de contexto para las variantes W2.6A16 y DFlash2 en la informacion proporcionada. No se han identificado en la informacion disponible modelos de terceros comparables con datos verificables.

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible: 85,99 % frente a 86,90 % de media agregada en los tres benchmarks publicados. No se documenta la degradacion en tareas de vision ni en contexto largo.
- Los benchmarks publicados son solo tres (IFEval, MATH-500, HumanEval+) y no cubren vision, multilingue, tool calling ni contexto largo.
- No se detallan los idiomas soportados; el rendimiento fuera de ingles y chino no esta documentado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se publican tasas de alucinacion ni evaluaciones de veracidad.
- Sesgos conocidos: no documentados en la informacion disponible.
- Requiere `trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio; conviene auditar el checkpoint antes de desplegarlo en produccion.
- El soporte esta optimizado para warp34, una herramienta del propio autor con adopcion limitada; fuera de ese entorno el rendimiento puede no ser el declarado.
- El contexto de 128K-256K se declara especificamente para warp34; en vLLM el limite efectivo no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.8-27B, que conviene verificar por separado.
- Modelo con 307 descargas y 0 likes: validacion comunitaria escasa; no hay informes independientes de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.8-27B-W4A16-HGPTQ-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante para GPUs de 16 GB: https://huggingface.co/nchapman/Qwen3.8-27B-W2.6A16-HGPTQ-RCO
- Borrador de decodificacion especulativa: https://huggingface.co/nchapman/Qwen3.8-27B-DFlash2-W4A16-HGPTQ
- Repositorio warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico: incluido en el repositorio del modelo como `TECHNICAL.md`
