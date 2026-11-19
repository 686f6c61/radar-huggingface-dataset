# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB es un modelo de lenguaje y vision (VLM) desarrollado por NVIDIA Corporation, diseñado especificamente para ejecutar tareas agenticas cotidianas en local dentro de un presupuesto de 24 GB de memoria. Se distribuye como una cuantizacion nativa de 2 bits (IQ2) del modelo base BF16 `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16`, obtenida mediante entrenamiento consciente de cuantizacion (QAT) y empaquetado con ModelOpt. La nomenclatura 74B-A9B indica 74.000 millones de parametros totales con 9.000 millones activos por token, lo que lo situa en la categoria de modelos MoE dispersos.

La arquitectura combina un backbone hibrido Mamba-2 y Transformer con un mecanismo LatentMoE, al que se anade un codificador visual C-RADIO v4-H para entradas de imagen y video. Soporta una longitud de contexto de hasta 256K tokens y un modo de razonamiento controlable mediante la plantilla de chat (`enable_thinking=True/False`). Incorpora decodificacion especulativa mediante un drafter LiLiCorr servido a traves de DFlash con 7 tokens especulativos, lo que reduce la latencia en despliegues vLLM.

Su relevancia actual radica en la relacion inteligencia-por-GB: NVIDIA lo posiciona como una alternativa mas rapida que modelos densos populares y mas capaz que MoE de huella de memoria similar, con licencia OpenMDW-1.1 que permite uso comercial. La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card del autor; los datos no presentes se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer hibrida con LatentMoE y encoder visual C-RADIO v4-H |
| Parametros totales | 74B (segun model card); 24.558.610.440 parametros en safetensors del repo cuantizado |
| Parametros activos | 9B |
| Longitud de contexto | Hasta 256K tokens (262.144 en la receta vLLM) |
| Tipos de cuantizacion | IQ2 (2 bits, QAT); el modelo base esta en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial) |
| Formato de pesos | safetensors (repo de 24,1 GB); compatible con transformers y vLLM |
| Entradas / salidas | Texto, imagenes y video / texto |
| Precision de despliegue | IQ2 empaquetado en 24 GB |
| Decodificacion especulativa | Drafter LiLiCorr via DFlash, 7 tokens especulativos |
| Fecha de corte de datos | Mayo de 2026 (post-entrenamiento) |
| Fechas del modelo | Diciembre 2025 – Mayo 2026 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina capas Mamba-2 (modelo de espacio de estados) con capas Transformer, sobre las que se aplica un mecanismo LatentMoE con 74B parametros totales y 9B activos por token. Esta combinacion busca reducir el coste de atencion en contextos largos (hasta 256K tokens) manteniendo la capacidad de razonamiento de un Transformer. La parte visual la aporta un encoder C-RADIO v4-H, que habilita la entrada de imagenes y video con hasta 1 imagen y 1 video por prompt en la configuracion de referencia, con pruning de video al 50% y muestreo a 2 fps y 256 frames.

El entrenamiento se apoya en los datasets publicados por NVIDIA (`nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`), con corte de datos de post-entrenamiento en mayo de 2026. La innovacion mas destacable es la cuantizacion nativa IQ2 con entrenamiento consciente de cuantizacion: el modelo se entrena para operar en 2 bits, no es un post-procesado de cuantizacion, lo que permite empaquetar 74B parametros en 24 GB con perdida de calidad controlada. Ademas, integra decodificacion especulativa mediante un drafter LiLiCorr servido con DFlash (7 tokens especulativos) y un parser de razonamiento propio (`ultra_v3_reasoning_parser.py`) para separar el modo thinking del modo respuesta directa. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset, ni si se aplicaron RLHF o DPO mas alla de la referencia al dataset de post-entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento controlable mediante plantilla de chat (`enable_thinking=True/False`), heredado del cliente Super 3.5 VL.
- Comprension de imagenes y video (image-text-to-text), con soporte de hasta 1 imagen y 1 video por prompt en la receta vLLM.
- Tool calling / function calling nativo, con parser `qwen3_coder` y `--enable-auto-tool-choice`.
- Ejecucion de tareas agenticas multi-paso (benchmarks Terminal-Bench 2.1, Tau3 Banking, GDPVal).
- Generacion de codigo y resolucion de problemas cientificos (SciCode, Terminal-Bench).
- Razonamiento matematico y de conocimiento general (GPQA Diamond, HLE sin herramientas).
- Capacidades multilingues en ingles, espanol, frances, aleman, italiano y japones.
- Decodificacion especulativa integrada para reducir latencia en produccion.
- Cuantizacion nativa de 2 bits que permite ejecucion local en 24 GB junto a otras aplicaciones.

## Casos de uso

- Agentes de terminal y automatizacion de shell: con un 50,98 en Terminal-Bench 2.1, el modelo puede interpretar instrucciones en lenguaje natural, ejecutar comandos y corregir errores en un bucle agentico, adecuado para entornos de CI/CD y administracion de sistemas.
- Automatizacion bancaria y financiera: su 17,01 en Tau3 Banking lo hace util para agentes que gestionan consultas de cuentas, transferencias y flujos de compliance con tool calling sobre APIs internas.
- Asistencia documental con vision: al aceptar imagenes y video, puede procesar capturas de pantalla, facturas escaneadas o fotogramas de video y responder preguntas sobre ellos en local, sin enviar datos a la nube.
- Copiloto de codigo en estaciones de trabajo: con 41,02 en SciCode y soporte de function calling, se integra en editores o pipelines para generar y revisar codigo cientifico y de sistemas, ejecutandose en una unica GPU de 24 GB.
- Razonamiento con contexto largo: los 256K tokens permiten analizar repositorios completos, expedientes o transcripciones extensas en una sola pasada, con modo thinking activable para tareas que requieren cadena de razonamiento.
- Despliegue en el borde o en portatiles profesionales: al caber en 24 GB, puede ejecutarse junto a otras aplicaciones en una estacion de trabajo con GPU consumer de gama alta, habilitando asistentes privados sin conexion.
- Evaluacion de conocimiento y QA especializado: con 86,43 en GPQA Diamond, sirve para responder preguntas de nivel experto en dominios cientificos dentro de herramientas internas de investigacion.
- Atencion al cliente multilingue: cubre ingles, espanol, frances, aleman, italiano y japones, con conversaciones multi-turno y contexto largo para historiales de cliente.

## Benchmarks y rendimiento

Datos publicados en la model card del autor. La columna de Nemotron 3.5 Bolt corresponde a la version IQ2 de 24 GB; el resto son modelos en BF16.

| Benchmark | Qwen3.6-35B-A3B BF16 | Gemma4 26B-A4B-IT BF16 | Nemotron 3.5 Lightning 30B-A3B BF16 | Nemotron 3.5 Bolt 74B-A9B-24GB (IQ2) |
|---|---:|---:|---:|---:|
| GDPVal-AA-V2 | 25,75 | 15,33 | 18,26 | **28,47** |
| Terminal-Bench 2.1 | 44,38 | 37,22 | 23,46 | **50,98** |
| Tau3 Banking | 10,52 | 14,02 | 9,48 | **17,01** |
| HLE (sin herramientas) | 19,56 | 17,42 | 10,47 | **25,30** |
| AA-Omniscience accuracy | 19,47 | **22,17** | 16,63 | 16,90 |
| SciCode | 35,33 | 40,28 | 31,38 | **41,02** |
| GPQA Diamond | 83,40 | 79,61 | 75,57 | **86,43** |
| AA-LCR | 61,06 | 57,56 | 49,19 | **64,06** |
| AA-Omniscience non-h | no disponible | no disponible | no disponible | no disponible |

El modelo lidera en siete de las ocho metricas con valor publicado, con la excepcion de AA-Omniscience accuracy, donde Gemma4 26B-A4B-IT obtiene 22,17 frente a 16,90. La fila AA-Omniscience non-h aparece truncada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 24 GB para el modelo empaquetado en IQ2, segun especifica el autor; el contexto KV cache se configura en fp8 en la receta de referencia, por lo que contextos muy largos requieren VRAM adicional.
- GPU recomendadas: NVIDIA Ampere (A100), Hopper (H100-80GB) o Blackwell, segun la model card.
- Cabe en GPU consumer: si, en tarjetas con 24 GB o mas (por ejemplo, RTX 4090 o RTX 3090), aunque la receta oficial de vLLM esta validada en A100/H100/Blackwell.
- Opciones de despliegue: vLLM (version nightly concreta indicada por el autor, con backend `b12x` para capas lineales y MoE, FlashInfer para atencion y Mamba, y `--trust-remote-code`); compatible con transformers. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Configuracion de referencia: `--tensor-parallel-size 1`, `--max-model-len 262144`, `--max-num-seqs 1`, `--kv-cache-dtype fp8`, `--enable-chunked-prefill`.
- Latencia y throughput: no se publican cifras concretas de tokens por segundo en la informacion disponible; el autor indica que la decodificacion especulativa con 7 tokens reduce latencia, pero sin numeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Puntos fuertes segun benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B-24GB (IQ2) | 74B totales / 9B activos | 256K | OpenMDW-1.1 | Lidera GDPVal, Terminal-Bench, Tau3, HLE, SciCode, GPQA y AA-LCR | Hugging Face, vLLM |
| Qwen3.6-35B-A3B BF16 | 35B totales / 3B activos | no disponible | no disponible | Segundo en GPQA (83,40) y AA-LCR (61,06) | Hugging Face |
| Gemma4 26B-A4B-IT BF16 | 26B totales / 4B activos | no disponible | no disponible | Mejor en AA-Omniscience accuracy (22,17) | Hugging Face |
| Nemotron 3.5 Lightning 30B-A3B BF16 | 30B totales / 3B activos | no disponible | no disponible | Inferior en todas las metricas publicadas frente a Bolt | Hugging Face |

La comparativa se limita a los datos de la model card; no se dispone de contexto, licencia ni disponibilidad de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion IQ2 de 2 bits implica una perdida de precision frente al modelo base BF16; los benchmarks publicados corresponden a la version cuantizada, pero tareas sensibles a matices pueden degradarse.
- Riesgo de alucinacion inherente a los modelos generativos; el autor no publica tasas de factualidad especificas, y en AA-Omniscience accuracy queda por debajo de Gemma4 26B-A4B-IT.
- El modo thinking debe gestionarse via plantilla de chat; un uso incorrecto puede producir respuestas mezcladas o razonamiento visible no deseado.
- El despliegue de referencia exige una version nightly concreta de vLLM, backend `b12x`, FlashInfer y un plugin de parser de razonamiento, lo que aumenta la complejidad operativa y el riesgo de incompatibilidades.
- La receta oficial limita a 1 imagen y 1 video por prompt y aplica pruning de video al 50%, lo que restringe escenarios con multiples medios.
- Idiomas soportados limitados a seis (en, es, fr, de, it, ja); no se garantiza calidad en otros.
- La licencia OpenMDW-1.1 permite uso comercial, pero conviene revisar sus terminos completos antes de produccion.
- No se publican cifras de latencia, throughput ni consumo energetico, lo que dificulta el dimensionamiento previo.
- El contexto de 256K con KV cache en fp8 requiere VRAM adicional sobre los 24 GB del modelo, especialmente con `--max-num-seqs` alto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Coleccion de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Web de NVIDIA: https://www.nvidia.com/
- Papers referenciados en los tags: arXiv 2605.07182, arXiv 2601.20088, arXiv 2502.02631, arXiv 2502.05003 (disponibles en https://arxiv.org/abs/<id>)
