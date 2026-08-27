# dzannotti/Qwen3.8-Flash-Next-MTP-GGUF

## Resumen

El repositorio dzannotti/Qwen3.8-Flash-Next-MTP-GGUF contiene la cabeza de prediccion multi-token (MTP, multi-token prediction) del modelo Qwen/Qwen3.8-Flash-Next, exportada a formato GGUF y cuantizada. No se trata de un modelo autonomo, sino de un modulo de draft para decodificacion especulativa: acelera la generacion del modelo principal Qwen3.8-Flash-Next, un MoE multimodal de 125B parametros (6B activos) con ventana de contexto de 262K tokens, desarrollado por Alibaba sobre la arquitectura Qwen4.

La cabeza MTP es un bloque completo de arquitectura qwen4exp (atencion + MoE de 512 expertos + hiperconexiones) de aproximadamente 3,88B parametros, entrenado conjuntamente con el modelo base. El convertidor oficial de llama.cpp (PR 27742) descarta esta cabeza al exportar a GGUF, por lo que las cuantizaciones populares del modelo no la incluyen. Este repositorio la exporta directamente desde el checkpoint bf16 y la cuantiza con llama-quantize estandar, lo que permite usarla con kernels de llama.cpp sin tipos de cuantizacion de forks.

La relevancia es practica: permite aprovechar la decodificacion especulativa del modelo Flash-Next en entornos locales, con mejoras de rendimiento medidas de hasta un 76% en generacion de codigo (de 20,3 a 35,8 t/s en ROCm) y de 24,2 a 37,2 t/s en Vulkan, segun las pruebas del autor en hardware AMD Strix Halo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (un bloque: atencion + MoE de 512 expertos + hiperconexiones) |
| Parametros totales | 3.878.549.248 (3,88B) |
| Parametros activos | 3,88B (todos; el bloque contiene un MoE interno de 512 expertos) |
| Longitud de contexto | 262.144 tokens (heredada del modelo objetivo Qwen3.8-Flash-Next) |
| Tipos de cuantizacion | Q4_K_M (2,5 GB), BF16 (7,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La cabeza MTP es un bloque completo de la arquitectura qwen4exp, la misma que usa el modelo base Qwen3.8-Flash-Next. Incluye atencion, un MoE interno de 512 expertos e hiperconexiones (hyper-connections), y fue entrenada conjuntamente con el modelo principal. El repositorio contiene 34 tensores: `blk.48.*` (atencion, indexador, MoE, hiperconexiones), `blk.48.nextn.{eh_proj,enorm,hnorm}`, `token_embd`, `output` y `output_hc_*`, con `nextn_predict_layers = 1` y `block_count = 49`.

El proceso de creacion fue: exportacion desde los 31 shards bf16 que contienen los tensores `mtp.*` mas `embed_tokens`, `lm_head` y las constantes PLE (58 GB en total) usando `convert_hf_to_gguf.py --mtp --outtype bf16`, seguido de cuantizacion con `llama-quantize --output-tensor-type Q4_K --token-embedding-type Q4_K`. El autor eligio Q4_K_M para la cabeza porque, al leer la cabeza LM del draft en cada paso, una cuantizacion mas precisa (Q8_0) midio peor rendimiento: un draft cuantizado igual que su objetivo coincide con el con mas frecuencia.

## Capacidades

- Decodificacion especulativa: genera hasta 3 tokens de draft por paso (configuracion recomendada `--spec-draft-n-max 3`), que el modelo objetivo verifica en paralelo.
- Control de confianza: el parametro `--spec-draft-p-min 0.75` detiene el drafting cuando la cabeza no esta segura, lo que el autor mide como mas importante que la profundidad.
- Compatibilidad con llama.cpp: funciona con kernels estandar (cualquier backend), no requiere tipos de cuantizacion de forks.
- Integracion con GGUFs existentes: puede usarse como `-md` junto a cualquier GGUF de Flash-Next (probado con unsloth UD-Q4_K_XL y UD-IQ4_XS), o fusionarse en el modelo con `merge-mtp-shard.py` para que el modelo lleve su propia cabeza.
- No es un modelo de generacion: no puede usarse de forma independiente para generar texto, razonamiento, codigo u otras tareas.

## Casos de uso

- Aceleracion de inferencia local de Qwen3.8-Flash-Next: el caso principal. En hardware AMD Strix Halo (Radeon 8060S, 128 GB unificados), el autor mide 35,8 t/s en codigo y 22,6 t/s en prosa con ROCm y UD-Q4_K_XL, frente a 20,3 t/s sin la cabeza MTP.
- Despliegue en equipos con APU o GPU integrada: la rama Vulkan de LaurentZuijdwijk, optimizada para Strix Halo, alcanza 37,2 t/s en codigo y 30,3 t/s en prosa con UD-IQ4_XS, frente a 24,2 t/s sin MTP.
- Integracion en pipelines de servidor llama.cpp: el comando de ejecucion usa `llama-server` con `--spec-type draft-mtp`, lo que permite servir el modelo con decodificacion especulativa a traves de la API de llama.cpp.
- Fusion de la cabeza en el GGUF del modelo: el script `merge-mtp-shard.py` permite convertir cualquier GGUF de qwen4exp dividido en shards en un modelo autocontenido con su cabeza de draft, sin necesidad de `-md` ni re-descarga de los 111 GB del modelo.
- Evaluacion de rendimiento de decodificacion especulativa: el repositorio documenta tasas de aceptacion (0,90 en codigo, 0,74 en prosa con UD-Q4_K_XL en ROCm) que sirven de referencia para optimizar parametros de drafting.
- Investigacion sobre MTP en arquitecturas MoE: al ser una exportacion limpia de la cabeza entrenada conjuntamente, permite estudiar el comportamiento del modulo MTP de Qwen4 sin necesidad de cargar el modelo completo.

## Benchmarks y rendimiento

El autor publica mediciones propias en AMD Strix Halo (Radeon 8060S, 128 GB de memoria unificada, temperatura 0, 300 tokens):

| Backend, objetivo | Sin MTP | Con MTP (codigo / prosa) | Aceptacion (codigo / prosa) |
|---|---|---|---|
| ROCm, UD-Q4_K_XL | 20,3 t/s | 35,8 / 22,6 t/s | 0,90 / 0,74 |
| ROCm, UD-IQ4_XS | 18,0 / 18,6 t/s | 32,8 / 22,1 t/s | 0,84 / 0,68 |
| Vulkan (RADV, fork de Laurent), UD-IQ4_XS | 24,2 / 24,3 t/s | 37,2 / 30,3 t/s | 0,88 / 0,82 |

El autor tambien perfila donde se va el tiempo: un paso del modelo objetivo tarda ~47 ms por token y solo ~4,4 ms por token verificado adicional; un paso de la cabeza tarda ~3,4 ms; y aproximadamente un tercio de cada paso son huecos de lanzamiento de kernels (el grafo del objetivo tiene ~8.000 nodos). Vulkan lanza kernels mas baratos, lo que explica su ventaja.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta cabeza MTP, ya que no es un modelo de generacion autonomo.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa 2,5 GB; el BF16, 7,8 GB. La cabeza se carga junto al modelo objetivo, que en cuantizacion UD-Q4_K_XL ocupa aproximadamente 111 GB en disco (28,8 GB solo de la tabla n-gram `per_layer_token_embd`).
- GPU recomendadas: el autor prueba en AMD Strix Halo (Radeon 8060S con 128 GB de memoria unificada). La rama Vulkan esta optimizada para esta APU. No se documentan pruebas en otras GPUs.
- Memoria del sistema: la tabla n-gram del modelo objetivo (28,8 GB) se mantiene en memoria del host (`-ot per_layer_token_embd=CPU`) en llama.cpp estandar; el fork de Laurent la divide por cabeza para que quepa en un dispositivo Vulkan.
- Opciones de despliegue: llama.cpp (llama-server) con parches especificos; se requiere la version `7584430716ee` (tag b10612) con el PR 27742 y el parche `qwen4exp-mtp-draft-head.patch`, o el fork de LaurentZuijdwijk.
- Variables de entorno: es obligatorio `LLAMA_ATTN_ROT_DISABLE=1`, ya que la rotacion de KV cuantizada (#21038) no esta soportada por la ruta de atencion qwen4exp y el servidor aborta al cargar sin ella.
- Latencia y throughput: ver tabla de benchmarks; el autor mide entre 22 y 37 t/s segun backend y cuantizacion.

## Comparativa con modelos similares

No hay una comparativa directa disponible con otras cabezas MTP o metodos de decodificacion especulativa (EAGLE, Medusa, etc.) en la informacion proporcionada. La alternativa mas cercana
