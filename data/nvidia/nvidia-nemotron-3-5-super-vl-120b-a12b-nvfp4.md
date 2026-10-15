# nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 es la version cuantizada en NVFP4 de NVIDIA Nemotron 3.5 Super VL, un modelo vision-lenguaje desarrollado por NVIDIA Corporation para razonamiento, generacion de codigo, uso de herramientas, comprension de documentos y comprension de video. La model card declara 120.000 millones de parametros totales con 12.000 millones activos y una arquitectura hibrida que intercala capas Mamba-2, capas de atencion y capas de mezcla de expertos (MoE), junto con un codificador visual C-RADIO y un conector vision-lenguaje.

El modelo acepta texto, imagenes y video como entrada y produce texto, con una ventana de contexto de hasta 1.000.000 de tokens, decodificacion especulativa nativa mediante Multi-Token Prediction (MTP) y un modo de razonamiento configurable desde la plantilla de chat (`enable_thinking=True/False`). La cuantizacion NVFP4 se obtuvo por destilacion con conciencia de cuantizacion (quantization-aware distillation) a partir de la version BF16, con el objetivo de reducir la huella de memoria sin degradar la precision.

Su relevancia actual reside en que permite servir un VLM de gran tamano en una sola GPU H200, en un GB200, en dos H100 o incluso en un DGX Spark (GB10), con licencia OpenMDW-1.1, que autoriza uso comercial y no comercial. El repositorio acumula 81 descargas y 33 likes desde su publicacion el 12 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + Transformer con mezcla de expertos (MoE) y codificador visual C-RADIO |
| Parametros totales | 120B declarados en la model card; recuento de safetensors del repositorio: 65.769.840.138 |
| Parametros activos | 12B (MoE) |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 (pesos en precision mixta, `modelopt_mixed`); la version BF16 esta en un repositorio aparte |
| Idiomas soportados | Ingles, espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | safetensors (NVFP4), cargables con transformers mediante `custom_code` (`nemotron_h_omni`) |
| Entrada / salida | Texto, imagen y video / texto |
| Tamano del repositorio | 75,0 GB |
| Fecha de publicacion | 12 de octubre de 2026 (actualizado el 15 de octubre de 2026) |

## Arquitectura y entrenamiento

La arquitectura combina capas Mamba-2 (modelo de espacio de estados), capas de atencion y capas MoE de forma intercalada, siguiendo el patron `nemotron_h_omni` implementado con codigo personalizado en transformers. La vision se resuelve con un codificador C-RADIO mas un conector vision-lenguaje, lo que habilita entrada de imagenes y video. El modelo incorpora Multi-Token Prediction (MTP), que actua como mecanismo nativo de decodificacion especulativa; en la configuracion de vLLM publicada se emplea un modelo borrador especifico (LiLiCorr) con 7 tokens especulativos por paso y metodo `dflash`.

El checkpoint NVFP4 se genero por destilacion con conciencia de cuantizacion desde el modelo BF16, con pesos cuantizados en precision mixta. Los resultados publicados indican una degradacion practicamente nula frente al BF16 en las pruebas reportadas (GPQA-Diamond sube de 89,52 a 89,90 y HLE text-only baja de 31,79 a 31,44; MMLU-ProX baja de 76,91 a un valor truncado en la informacion disponible). No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; unicamente se enlaza la coleccion de datasets de preentrenamiento de Nemotron y el informe tecnico de la familia Nemotron 3.5 Super y Lightning.

## Capacidades

- Generacion de texto y razonamiento complejo, con modo de pensamiento activable o desactivable desde la plantilla de chat.
- Razonamiento cientifico y de nivel experto: 89,90 en GPQA-Diamond y 31,44 en HLE (solo texto) en la variante NVFP4.
- Generacion y comprension de codigo, con soporte de tool calling habilitado por `--enable-auto-tool-choice` y el parser `qwen3_coder`.
- Uso de herramientas y construccion de agentes: la model card posiciona el modelo para agentes de texto y vision-lenguaje, con parser de razonamiento especifico (`nemotron_v3`).
- Comprension de documentos: pipeline `image-text-to-text`, adecuado para documentos con contenido visual.
- Comprension de video: soporte de entrada de video con configuracion de `fps: 2`, `num_frames: 256` y una tasa de poda de video (`--video-pruning-rate 0.5`).
- Capacidades multilingues en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Contexto largo de hasta 1M de tokens, con `--block-size 64` y `--prefix-match-unit 64` en la configuracion de despliegue.
- Decodificacion especulativa nativa mediante MTP, con modelo borrador LiLiCorr y 7 tokens especulativos.

## Casos de uso

- Atencion al cliente automatizada multilingue: el modelo puede mantener conversaciones multi-turno en seis idiomas y aprovechar la ventana de hasta 1M de tokens para conservar el historial completo de la interaccion sin resumir.
- Procesamiento de documentos con componentes visuales: al aceptar imagenes y texto, permite extraer y razonar sobre facturas, informes escaneados o formularios dentro de un mismo prompt.
- Agentes con tool calling en produccion: la configuracion de vLLM habilita `--enable-auto-tool-choice` con parser `qwen3_coder`, lo que permite integrarlo en orquestadores de agentes que invocan APIs externas de forma encadenada.
- Generacion y revision de codigo asistida: el modelo cubre razonamiento y codigo en un unico checkpoint, lo que simplifica pipelines de CI/CD que necesitan explicar cambios o proponer parches.
- Analisis de video automatizado: con muestreo a 2 fps y 256 fotogramas se puede aplicar a supervision de contenido, resumen de grabaciones o extraccion de eventos en video.
- Asistencia a investigacion tecnica y cientifica: los resultados en GPQA-Diamond y HLE lo hacen utilizable como asistente de razonamiento experto en dominios cientificos, con la cautela propia de un modelo generativo.
- Despliegue en infraestructura reducida: la cuantizacion NVFP4 permite ejecutar el modelo en un unico DGX Spark (GB10), un H200, un GB200 o dos H100, lo que facilita escenarios de inferencia local o en el borde con datos sensibles.

## Benchmarks y rendimiento

| Benchmark | Nemotron 3.5 Super VL BF16 | Nemotron 3.5 Super VL NVFP4 |
|---|---:|---:|
| GPQA-Diamond | 89,52 | 89,90 |
| HLE (solo texto) | 31,79 | 31,44 |
| MMLU-ProX | 76,91 | 73 (valor truncado en la fuente) |

La model card menciona una grafica de precision adicional (`accuracy_plot.png`), pero su contenido numerico no esta incluido en la informacion disponible. No se han publicado en la informacion disponible resultados de HumanEval, GSM8K ni otros benchmarks habituales.

## Requisitos de hardware

- Despliegue soportado segun la model card: 1x DGX Spark (GB10), 1x H200, 2x H100 o 1x GB200.
- Tamano del repositorio: 75,0 GB; la estimacion derivada de los pesos NVFP4 (65.769.840.138 parametros con cuantizacion de precision mixta) se situa en torno a 37 GB, a lo que hay que sumar el codificador visual, las cache de Mamba y de atencion y las activaciones.
- No cabe en GPU de consumo: una RTX 4090 dispone de 24 GB de VRAM, insuficientes tanto por el recuento de parametros como por el tamano del repositorio.
- Opciones de despliegue documentadas: vLLM con las imagenes `vllm/vllm-openai:nightly-3f1bcfd82bb2e93fcd364fc7a5491718453a77e2` o `vllm/vllm-openai:v0.32.0`; tambien se mencionan ejemplos con SGLang.
- Configuracion de referencia para DGX Spark (GB10): `--max-num-seqs 1`, `--gpu-memory-utilization 0.75`, `--max-num-batched-tokens 8192`, `--speculative_config.num_speculative_tokens 7`, `--speculative_config.method dflash`, `--mamba-backend flashinfer`, `--mamba-ssm-cache-dtype float16`, `--block-size 64`, `--prefix-match-unit 64`, `--video-pruning-rate 0.5`.
- No se documentan en la informacion disponible soporte de llama.cpp, Ollama ni pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA-Diamond | HLE (texto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nemotron 3.5 Super VL NVFP4 | 120B (12B activos) | 1M | 89,90 | 31,44 | OpenMDW-1.1 | HuggingFace |
| Nemotron 3.5 Super VL BF16 | 120B (12B activos) | 1M | 89,52 | 31,79 | OpenMDW-1.1 | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar contra la variante BF16 del mismo modelo. No se dispone de datos de modelos competidores de tamano o categoria equivalentes.

## Limitaciones y advertencias

- Existe una discrepancia no explicada en la informacion disponible entre los 120B declarados en la model card y los 65.769.840.138 parametros contados en los safetensors del repositorio.
- El valor de MMLU-ProX para la variante NVFP4 aparece truncado en la fuente (73...), por lo que la comparacion con el BF16 no puede cerrarse con precision.
- No se han publicado en la informacion disponible datos sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- La cobertura linguistica se limita a seis idiomas; el rendimiento fuera de ellos no esta documentado.
- El modo de razonamiento debe activarse o desactivarse explicitamente desde la plantilla de chat; una configuracion incorrecta altera el comportamiento y los parametros de muestreo recomendados (temperatura 1.0 y top_p 0.95 para texto; 0.6 y 0.95 para vision).
- La licencia OpenMDW-1.1 es una licencia propia de NVIDIA con terminos especificos; conviene revisar el texto completo antes de un uso comercial.
- El modelo requiere `trust_remote_code` y codigo personalizado (`nemotron_h_omni`), lo que implica ejecutar codigo del autor dentro del entorno de transformers.
- La configuracion de vLLM publicada esta pensada exclusivamente para DGX Spark (GB10) y con una sola secuencia concurrente (`--max-num-seqs 1`), lo que limita el throughput en ese escenario concreto.
- No se documentan cuantizaciones alternativas (GGUF, AWQ, GPTQ) que faciliten el despliegue en hardware de consumo.
- La cuantizacion NVFP4 esta ligada a hardware NVIDIA con soporte para dicho formato; su ejecucion en otras plataformas no esta documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Version BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo borrador para decodificacion especulativa (LiLiCorr): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Pagina de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Informe tecnico de Nemotron 3.5 Super y Lightning: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Coleccion de datasets de preentrenamiento de Nemotron: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Servidor de Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Imagen de vLLM utilizada en los ejemplos: `vllm/vllm-openai:v0.32.0` y `vllm/vllm-openai:nightly-3f1bcfd82bb2e93fcd364fc7a5491718453a77e2`
