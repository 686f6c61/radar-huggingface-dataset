# lackonendes/PAW-35B-A3B-GGUF

## Resumen

PAW-35B-A3B es una cuantización trellis-coded (formato PAW) del modelo Qwen/Qwen3.6-35B-A3B, desarrollada por lackonendes. El modelo base es un MoE con 35 mil millones de parámetros totales y 3 mil millones activos, diseñado por Alibaba Qwen para ofrecer un equilibrio entre rendimiento y eficiencia. Esta cuantización comprime los pesos a 1,5415 bits por peso (bpw), reduciendo el tamaño del archivo a aproximadamente 7,86 GB, lo que permite ejecutar el modelo en una GPU de 24 GB como la RTX 3090 a velocidades de 133-183 tokens por segundo.

La relevancia de este modelo radica en que demuestra que es posible mantener casi intacto el rendimiento en tareas de razonamiento (97,0% en GSM8K frente al 97,5% del modelo original) con una compresión extrema, aunque con una pérdida significativa en generación de código (retención del 94% en HumanEval+ y 93,3% en MBPP+). No es un GGUF estándar: requiere un fork específico de llama.cpp llamado `llama-paw`, y no puede cargarse con la versión oficial. Está pensado para desarrolladores que necesitan ejecutar un modelo de 35B en hardware de consumo sin renunciar a la velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con cuantizacion trellis-coded PAW |
| Parametros totales | 35B (modelo base Qwen3.6-35B-A3B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 128k (mencionado en la configuracion de KV, no confirmado oficialmente) |
| Tipos de cuantizacion | 1,5415 bpw trellis-coded (formato PAW, no compatible con GGUF estandar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variante PAW, requiere llama-paw) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer MoE con 35B parámetros totales y 3B activos por token, lo que permite una inferencia eficiente. La cuantización PAW aplica un esquema de codificación trellis a 1,5415 bpw, una técnica de compresión más agresiva que las cuantizaciones tradicionales (como Q4_K_M o Q5_K_M) y que preserva mejor la calidad a tasas de bits muy bajas. No se dispone de información sobre el entrenamiento del modelo base (composición del dataset, uso de RLHF o DPO), ya que la model card solo documenta el proceso de cuantización.

La cuantización fue realizada por lackonendes y validada con harnesses byte-idénticos contra una medición Q8_0 del modelo padre en una RTX 3090. El archivo resultante pesa 7,86 GB y requiere el fork `llama-paw` de llama.cpp, que implementa la arquitectura `paw` y soporta decodificación especulativa con un drafter `dflash`. La configuración recomendada incluye `enable_thinking:false` (obligatorio) y KV cuantizado a q8_0 para ahorrar 966 MiB a 128k de contexto.

## Capacidades

- Generación de texto y razonamiento matemático: mantiene el 97,0% en GSM8K frente al 97,5% del modelo padre, lo que indica una degradación mínima en tareas de razonamiento lógico y aritmético.
- Generación de código: retiene el 94,0% en HumanEval+ y el 93,3% en MBPP+, con una pérdida estadísticamente significativa (p=0,035 y p=0,008 respectivamente). Adecuado para tareas de código simples, pero no recomendado para producción crítica.
- Decodificación especulativa: soporta el modo `--spec-type draft-dflash` para acelerar la inferencia hasta un 35% adicional sobre la configuración naive.
- Modo no-pensamiento: requiere `enable_thinking:false`; el comportamiento con thinking mode no está medido.
- Multilingüismo: no disponible (heredado del modelo base, pero no verificado en esta cuantización).
- Tool calling y agentes: no disponible (no se menciona en la documentación).

## Casos de uso

- Inferencia local en GPU de consumo: con 7,86 GB de peso y 133-183 tok/s en una RTX 3090, es viable para aplicaciones de chat y asistencia en tiempo real en equipos con 24 GB de VRAM.
- Prototipado de razonamiento matemático: para tareas de resolución de problemas aritméticos o lógicos, el modelo ofrece un rendimiento casi idéntico al original, lo que lo hace útil en entornos de investigación donde se prioriza la velocidad sobre la precisión extrema.
- Generación de código en entornos no críticos: aunque la pérdida en HumanEval+ es real, para scripts simples, autocompletado o generación de boilerplate puede ser suficiente, siempre que se valide la salida.
- Despliegue en edge computing: su tamaño reducido permite ejecutarlo en servidores con una sola GPU, reduciendo costes de infraestructura frente a modelos densos de tamaño similar.
- Experimentación con cuantización extrema: sirve como referencia para estudiar el impacto de tasas de bits muy bajas (1,54 bpw) en modelos MoE, tanto en calidad como en velocidad.
- Aplicaciones de chat con contexto largo: la configuración de KV a 128k permite manejar conversaciones extensas, aunque la calidad por encima de 28k tokens no está verificada.

## Benchmarks y rendimiento

Los datos de rendimiento fueron medidos por el autor en una RTX 3090 con harnesses byte-idénticos contra una medición Q8_0 del modelo padre. No se han publicado resultados de benchmarks adicionales en la información disponible.

| Benchmark | PAW-35B-A3B (1,54 bpw) | Qwen3.6-35B-A3B (Q8_0) | Retencion |
|---|---|---|---|
| GSM8K | 97,0% | 97,5% | 99,5% |
| HumanEval+ | 94,0% (retencion) | 100% (referencia) | 94,0% |
| MBPP+ | 93,3% (retencion) | 100% (referencia) | 93,3% |

Nota: los valores de HumanEval+ y MBPP+ se expresan como porcentaje de retención respecto al modelo padre, no como puntuaciones absolutas. La pérdida en código es estadísticamente significativa según la prueba de McNemar.

## Requisitos de hardware

- VRAM estimada: 7,86 GB para los pesos, más overhead de KV cache y activaciones. Con KV a q8_0 y 128k de contexto, el consumo total cabe en 24 GB.
- GPU recomendada: RTX 3090 (24 GB) como mínimo; también funciona en RTX 4090, A100, H100 o cualquier GPU con 24 GB o más.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 24 GB de VRAM. No cabe en GPUs de 16 GB o menos sin reducir contexto o usar cuantización adicional.
- Opciones de despliegue: requiere el fork `llama-paw` de llama.cpp. No es compatible con stock llama.cpp, Ollama, vLLM ni TGI sin modificaciones.
- Latencia y throughput: 133,7 tok/s en modo mixto y 182,7 tok/s en modo código (medido en 1x RTX 3090). Con decodificación especulativa (`dflash`), se puede obtener un +35% adicional.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otras cuantizaciones del mismo modelo base (por ejemplo, la de Intel con AutoRound o la APEX de mudler) para realizar una comparación cuantitativa. La siguiente tabla compara las características principales:

| Modelo | Tamano archivo | bpw | Velocidad (RTX 3090) | Requisito especial |
|---|---|---|---|---|
| PAW-35B-A3B (este) | 7,86 GB | 1,54 | 133-183 tok/s | Fork llama-paw |
| Qwen3.6-35B-A3B-APEX-GGUF | 146,69 GB (repo) | no disponible | no disponible | GGUF estandar |
| Qwen3.5-35B-A3B-gguf-q2ks-mixed-AutoRound | no disponible | ~2-3 bpw | no disponible | GGUF estandar |

La principal diferencia es que PAW usa un formato propietario que limita su portabilidad, mientras que las alternativas son GGUF estándar y pueden ejecutarse con herramientas convencionales. Sin embargo, PAW ofrece una tasa de bits más baja (1,54 bpw) que las cuantizaciones típicas (Q2_K, Q3_K), lo que permite un archivo más pequeño.

## Limitaciones y advertencias

- Pérdida significativa en generación de código: la retención en HumanEval+ (94%) y MBPP+ (93,3%) es estadísticamente real (p<0,05), por lo que no es recomendable para tareas de programación donde la corrección sea crítica.
- Requiere `enable_thinking:false`: el modo de pensamiento no está medido y puede producir comportamientos inesperados. No usar en aplicaciones que dependan de razonamiento encadenado.
- Longitud de contexto no verificada: la calidad por encima de ~28k tokens no ha sido evaluada; el soporte de 128k es teórico.
- Formato no estándar: no es un GGUF compatible con llama.cpp oficial. Requiere el fork `llama-paw`, lo que limita su integración con herramientas del ecosistema (Ollama, LM Studio, etc.).
- KV cuantizado requiere flash attention: si se usa KV a q8_0, es necesario compilar con flash attention activado.
- Sesgos y alucinaciones: no se han evaluado específicamente para esta cuantización; se heredan del modelo base Qwen3.6-35B-A3B, que no ha sido auditado en este aspecto.
- Sin soporte comercial garantizado: aunque la licencia es Apache 2.0, el uso en producción depende de la estabilidad del fork `llama-paw`, que no tiene mantenimiento oficial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lackonendes/PAW-35B-A3B-GGUF
- Fork llama-paw (referenciado en la model card, sin URL concreta): https://github.com/
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guia de instalacion con LM Studio (referencia externa): https://smarterehab.blog/2026/06/29/install-qwen3-6-35b-a3b-gguf-locally-via-lm-studio-step-by-step/
