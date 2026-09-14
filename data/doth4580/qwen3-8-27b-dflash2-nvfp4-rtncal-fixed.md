# doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED

## Resumen

DFlash 2 NVFP4 RTNcal FIXED es un modelo borrador (draft) de decodificación especulativa para el modelo objetivo Qwen3.8-27B, empaquetado por el usuario doth4580 en el formato de ficheros que espera el motor de inferencia veloGB10. No es un modelo de lenguaje autónomo: se ejecuta en paralelo al modelo objetivo y propone bloques de tokens que el objetivo verifica, de modo que la salida codiciosa (greedy) coincide exactamente con la del objetivo y el muestreo preserva su distribución. Su arquitectura es la del draft DFlash 2 de tipo block-diffusion, con 5 capas, `hidden_size` 5120, 32 cabezas de atención y 8 cabezas KV.

El repositorio es una obra derivada, no un espejo: parte de la cuantización NVFP4 con calibración RTN publicada por maurienne-ai, a su vez derivada del draft BF16 DFlash 2 de incoai, y la reempaqueta en el layout que carga veloGB10 (que no acepta el formato ModelOpt de NVIDIA que sí carga SGLang de forma nativa). El cambio de contenedor implica también un cambio de esquema: el original usaba cuantización W4A4 con escalas de activación estáticas, mientras que esta versión es weight-only, con las activaciones en BF16.

Su relevancia es acotada pero específica: permite servir Qwen3.8-27B con decodificación especulativa sobre hardware NVIDIA GB10 (Grace Blackwell), incluyendo despliegues multi-nodo con TP=2 y TP=4 y ventanas de hasta 262 144 tokens. El repositorio tiene 0 descargas y 0 likes, no publica benchmarks y no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft de decodificación especulativa DFlash 2 (block-diffusion) sobre transformer con proyecciones convolucionales (`attention_conv`, `mlp_conv`); 5 capas, `hidden_size` 5120, 32 cabezas de atencion / 8 cabezas KV, `head_dim` 128, `target_layer_ids` [5, 19, 33, 47, 61], tamano de bloque 8 |
| Parametros totales | 312 218 880 (segun safetensors) |
| Longitud de contexto | `max_position_embeddings` 262 144 (config del draft); el ejemplo de servicio usa `--max-seq-len 262144` y `--max-tokens 65536` |
| Tipos de cuantizacion | NVFP4 weight-only: pesos en E2M1 de 4 bits empaquetados en U8, escala por grupo de 16 en F8_E4M3 y escala global F32; 46 lineales cuantizadas. El resto de tensores permanece en BF16. El upstream usaba W4A4 (ModelOpt FP4 con `input_scale` estatico por tensor) |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; heredados del modelo objetivo Qwen3.8-27B, no especificados) |
| Licencia | Apache-2.0 (con copia de `LICENSE` en el repositorio) |
| Formato de pesos | Safetensors: `nvfp4.safetensors` (1 010 090 080 bytes, 46 lineales x 3 tensores = 138 tensores) y `model.safetensors` (624 442 648 bytes, 46 tensores BF16). Repo total: 1,6 GB |

## Arquitectura y entrenamiento

El modelo es un draft de difusión por bloques (block-diffusion) con 5 capas, disenado para generar candidatos por bloques de 8 tokens que el modelo objetivo valida. Incorpora componentes especificos de esta familia: codebooks de seleccion de candidatos y proyeccion oculta, todas las RMSNorm, kernels base de convolucion dinamica y gemelos en BF16 de `fc`, `k_proj` y `v_proj`. Estas piezas se mantienen en alta precision a proposito: la ruta de prompt-prime se ejecuta con lotes grandes (M de hasta 8192) sobre la GEMM BF16, mientras que los pasos de bloque se ejecutan con M bajo por la GEMM FP4. Los gemelos BF16 son los unicos bytes duplicados (~367 MB).

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni sobre tecnicas de alineamiento (RLHF/DPO) del draft base. Lo que si se documenta es el proceso de empaquetado: el bake `--df2-bake-nvfp4 <src> <dst>` parte del artefacto BF16 cuyo sha256 (`67fc76d68dc5a9415511a4f394ef744d67510cd20e93b37cc2cc7d28e4bab65c`) esta fijado en el campo `df2_quant_source_sha256`. El resultado es agnostico al tamano de bloque: las teselas empaquetadas dependen solo de las formas de los pesos, por lo que las rondas de bloque 8 y bloque 16 leen el mismo directorio sin re-conversion. La verificacion contra el objetivo hace que el draft sea sin perdida (lossless) respecto a la salida del modelo objetivo.

## Capacidades

- Generacion de borradores de tokens por bloques (block size 8) para verificacion por parte de Qwen3.8-27B; la salida greedy del sistema coincide exactamente con la del objetivo.
- Preservacion de la distribucion de muestreo del modelo objetivo cuando se usa sampling.
- Ruta de prompt-prime de lote grande (M hasta 8192) sobre GEMM BF16, y pasos de bloque de M bajo sobre GEMM FP4.
- Independencia del tamano de bloque: compatible con rondas de bloque 8 y bloque 16 sin re-empaquetar.
- Carga en el motor veloGB10 a traves del campo `df2_quant` y del sidecar empaquetado; deteccion automatica con `--spec-source dflash2-auto`.
- No dispone de generacion de texto autonoma, tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: no es un modelo de lenguaje independiente.
- Idiomas: no declarados; dependen del modelo objetivo con el que se empareje.
- Cache de prefijo soportada a nivel de motor (`--prefix-cache on`); el ajuste de tipo de KV cache en FP8 se aplica al modelo objetivo, no al draft.

## Casos de uso

- Aceleracion de la decodificacion de Qwen3.8-27B en un solo GB10: el draft propone bloques de tokens y el objetivo los verifica, reduciendo el numero de pasos de decodificacion sin alterar la salida. Es el escenario documentado en el repositorio con `--max-batch 1`.
- Servicio de contexto largo: con `--max-seq-len 262144` y `--max-tokens 65536`, el sistema puede atender peticiones de hasta 262 144 tokens de posicion aprovechando la cache de prefijo activada.
- Despliegue multi-nodo con TP=2: un nodo de computo mas un nodo par (`./gb10_inference --node --port 29500`) y `--tp 2 --nodes <peer-ip>:29500` para repartir el modelo objetivo y el draft.
- Despliegue multi-nodo con TP=4: tres nodos pares y `--tp 4 --nodes <ip1>:29500,<ip2>:29500,<ip3>:29500`, orientado a maximizar el rendimiento en el mismo hardware GB10.
- Sustitucion del borrador en un pipeline de decodificacion especulativa existente: util si se sirve el objetivo NVFP4 `doth4580/Qwen3.8-27B-NVFP4-FULL` y se necesita el formato de fichero de veloGB10 en lugar del layout ModelOpt.
- Validacion reproducible de artefactos cuantizados: el campo `df2_quant_source_sha256` permite verificar que el bake consumio exactamente el artefacto BF16 esperado, lo que resulta util en pipelines de integracion con control de procedencia.
- Experimentacion con geometrias de bloque: al ser agnostico al tamano de bloque, sirve para comparar round-8 y round-16 sin volver a convertir pesos.
- Investigacion sobre decodificacion especulativa sin perdida: dado que la salida greedy es identica a la del objetivo, el draft es un banco de pruebas para medir ganancias de velocidad sin contaminar metricas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de aceptacion de tokens, velocidad de decodificacion o throughput. La unica afirmacion cuantificable de la model card es cualitativa: la salida greedy coincide exactamente con la del modelo objetivo y el muestreo preserva su distribucion.

## Requisitos de hardware

- Espacio en disco de los pesos: 1,6 GB en total (1,01 GB `nvfp4.safetensors` + 0,62 GB `model.safetensors`). Ambos ficheros son obligatorios y el directorio se carga como una unidad.
- VRAM estimada para inferencia: no disponible de forma explicita. La documentacion solo indica que el draft necesita memoria adicional a la del modelo objetivo, que debe residir simultaneamente; no se publican cifras de VRAM ni el reparto entre pesos, activaciones y buffers de la ruta prompt-prime con M hasta 8192.
- GPU documentadas: NVIDIA GB10 (Grace Blackwell), unica plataforma para la que existe procedimiento de servicio, con TP=1, TP=2 y TP=4 sobre nodos pares conectados por red.
- Compatibilidad con GPU de consumo (RTX 4090 y similares): no disponible. El formato NVFP4 y el loader del motor veloGB10 estan orientados a hardware Blackwell, pero el repositorio no documenta pruebas en otras GPU.
- Opciones de despliegue: exclusivamente el motor veloGB10 (`./gb10_inference`), invocado con `--model-dir` (objetivo) y `--draft-dir` (este draft). No es cargable en SGLang (el upstream si lo era, en su layout ModelOpt), ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, tasa de aceptacion del draft ni factor de aceleracion.
- Parametros de servicio documentados: `--port 9000`, `--max-seq-len 262144`, `--max-batch 1`, `--max-tokens 65536`, `--prefix-cache on`, `--default-presence-penalty 1.5`, `--mtp=auto`, `--spec-source dflash2-auto`.

## Comparativa con modelos similares

La informacion disponible permite comparar tres variantes de la misma familia (el draft DFlash 2 para Qwen3.8-27B) y no incluye datos de familias alternativas como EAGLE-3 o Medusa.

| Aspecto | Este repo (RTNcal-FIXED) | maurienne-ai/…RTNcal (upstream) | incoai/Qwen3.8-27B-DFlash2 (BF16) |
|---|---|---|---|
| Formato de pesos | Safetensors; `nvfp4.safetensors` (1,01 GB, 46 lineales empaquetadas) + `model.safetensors` BF16 (0,62 GB) | `model.safetensors`, 1,55 GB, 186 tensores (layout ModelOpt) | Artefacto BF16 DFlash 2 (sha256 `67fc76d6…`) |
| Cuantizacion | NVFP4 weight-only; activaciones en BF16 | NVFP4 W4A4 con `input_scale` estatico por tensor | Sin cuantizar |
| Config de carga | Campos `df2_quant`, `df2_quant_recipe`, `df2_quant_source_sha256` | `quantization_config` + lista `ignore` de ModelOpt | No aplica |
| Motor compatible | veloGB10 | SGLang (`--speculative-draft-model-quantization modelopt_fp4`) | Motor que consuma el artefacto BF16 |
| Ajuste de KV cache | No aplica (se configura en el objetivo) | FP8 KV mediante flags de SGLang | No disponible |
| Licencia | Apache-2.0 | Apache-2.0 (heredada del draft base y de Qwen3.8-27B) | Apache-2.0 |
| Prestaciones publicadas | No disponibles | No disponibles | No disponibles |

## Limitaciones y advertencias

- No es un modelo independiente: sin el modelo objetivo no produce respuestas utiles. No admite uso como chatbot, generador de codigo ni motor de razonamiento por si solo.
- Dependencia estricta del motor veloGB10. El layout empaquetado no lo carga SGLang (que si carga el upstream ModelOpt), ni se documenta soporte para vLLM, llama.cpp, Ollama o TGI, lo que limita la portabilidad del artefacto.
- Requiere ambos ficheros safetensors en el mismo directorio. Tratar `model.safetensors` como una copia de respaldo o eliminarlo rompe la carga, ya que contiene codebooks del selector de candidatos, proyeccion oculta, RMSNorms, kernels de convolucion base y los gemelos BF16 de `fc`, `k_proj` y `v_proj`.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de aceptacion, aceleracion o comportamiento en produccion. Adoptarlo exige medir en el entorno propio.
- Madurez y trazabilidad del repositorio: 0 descargas y 0 likes, creado y actualizado en septiembre de 2026, sin historial de uso comunitario que permita inferir estabilidad.
- Idiomas no declarados: cualquier limitacion linguistica o de sesgo dependera del modelo objetivo Qwen3.8-27B, cuyas caracteristicas no se detallan en la informacion disponible.
- Riesgo de alucinacion: en el uso previsto, la verificacion por parte del objetivo hace que el sistema sea sin perdida respecto a la salida del objetivo. Fuera de ese esquema de verificacion, las propuestas del draft no tienen garantia alguna.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el repositorio es una obra derivada con dos niveles de dependencia (maurienne-ai y incoai); conviene conservar los avisos y el fichero `LICENSE` incluido.
- El ajuste de KV cache en FP8 no se configura en el draft, sino en el modelo objetivo; asumir lo contrario lleva a configuraciones invalidas.
- La verificacion por sha256 del artefacto fuente (`df2_quant_source_sha256`) forma parte del comportamiento por defecto del motor; alterar o reemplazar el bake sin actualizar ese campo puede impedir el arranque.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/doth4580/Qwen3.8-27B-DFlash2-NVFP4-RTNcal-FIXED
- Modelo base (cuantizacion upstream): https://huggingface.co/maurienne-ai/Qwen3.8-27B-DFlash2-NVFP4-RTNcal
- Modelo base (draft BF16 DFlash 2): https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Modelo objetivo recomendado en el motor veloGB10: https://huggingface.co/doth4580/Qwen3.8-27B-NVFP4-FULL
- Motor veloGB10 (repositorio): https://github.com/sf-stav/veloGB10
- Guia de despliegue del motor: `QWEN38_27B_SETUP.md`, en el repositorio de veloGB10
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al motor veloGB10 ni a la familia DFlash 2; los resultados devueltos corresponden a paginas no relacionadas.
