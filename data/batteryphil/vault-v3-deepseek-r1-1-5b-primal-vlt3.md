# batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL-VLT3

## Resumen

VAULT-v3-DeepSeek-R1-1.5B-PRIMAL-VLT3 es una distribucion empaquetada del modelo `batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL`, un fine-tune del `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (licencia MIT original) realizado por el autor independiente batteryphil. El repositorio no contiene pesos en formato convencional (safetensors o GGUF), sino dos binarios autocontenidos en formato propietario `.vlt3` acompanados de un motor de inferencia en C99 sin dependencias externas (`runtime/vault3_host`). El objetivo declarado es el despliegue en CPU y dispositivos edge con un consumo de memoria muy reducido.

El modelo parte de la arquitectura transformer densa de Qwen2.5-1.5B (1.500 millones de parametros, contexto nativo estrecho por `rope_theta = 10.000`) y sobre ella el autor aplica tres intervenciones principales: un proceso de "ablacion de pesos" orientado a eliminar los rechazos del modelo base (etiquetado como *uncensored*), un entrenamiento discreto de todos los parametros en un manifold de enteros de 8 bits denominado PRIMAL v3.1, y un mecanismo de gestion de KV-cache por segmentos que re-rotaciona claves pre-RoPE para extender el contexto efectivo hasta 100K tokens con memoria constante.

La relevancia de esta ficha es doble: por un lado documenta una propuesta tecnica poco convencional (LUT armonica de primos de 4 bits, runtime freestanding en C99, KV eviction O(1)); por otro, advierte de que se trata de un artefacto con licencia no estandar, sin descargas ni validacion de la comunidad, y con afirmaciones de rendimiento que provienen unicamente de la model card del autor y no han sido replicadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de DeepSeek-R1-Distill-Qwen-1.5B / Qwen2.5-1.5B), con KV-cache por segmentos evictados y re-rotacion pre-RoPE |
| Parametros totales | 1.777.088.000 (incluye `lm_head.weight` sin atar) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens de ventana deslizante + banco de 1.024 segmentos; recall NIAH declarado hasta 100.444 tokens; `rope_theta = 10.000` original |
| Tipos de cuantizacion | `V3_P4_0` (LUT armonica de primos con escala con signo, 4 bits, 1.18 GiB) y `V3_Q8_0` (entero de 8 bits, 1.77 GiB); el modelo base tambien en BF16 |
| Idiomas soportados | en, zh |
| Licencia | `bartsch-personal-free-5pct-commercial` (licencia "other", no estandar, definida en el fichero LICENSE del repo) |
| Formato de pesos | Binarios `.vlt3` propietarios (`vault_v3_deepseek_r1_1_5b_p4_0_primal.vlt3`, `vault_v3_deepseek_r1_1_5b_q8_0_primal.vlt3`); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de 1.500 millones de parametros heredado de DeepSeek-R1-Distill-Qwen-1.5B, que a su vez deriva de Qwen2.5-1.5B. Sobre esa base, el autor aplica un proceso de "Harmless-Cone Orthogonalized Multi-Pass Weight Ablation" en las capas L08 a L27 y en el `lm_head` sin atar, orientado a eliminar el comportamiento de rechazo del modelo original. Posteriormente realiza un entrenamiento completo en precision discreta (denominado PRIMAL v3.1) sobre todos los 1.777.088.000 parametros en enteros de 8 bits, con un estado persistente de 2,06 bytes por parametro (3,42 GiB) y un throughput declarado de 1.233,4 tokens/s de entrenamiento dentro de 5,94 GiB de VRAM en una GPU consumer de 16 GB. Finalmente aplica un ajuste "Velvet ROME" consciente de cuantizacion en L13 a L27 para preservar la coherencia tanto en Q8_0 como en la LUT de 4 bits.

La innovacion mas destacable es el mecanismo de memoria de contexto: en lugar de una KV-cache clasica, el runtime almacena claves pre-RoPE en un banco fijo de 1.024 segmentos puntuado por un `SegmentScorer` de 1,18 millones de parametros FP32 (entrenado con EMA causal), mantiene una ventana deslizante de 1.024 tokens y re-rotaciona dinamicamente los segmentos supervivientes a posiciones relativas contiguas `[-M_cnt-S .. 2W-1]`. Segun la model card, esto evita el colapso de atencion que sufre el modelo base con `rope_theta = 10.000` mas alla de 16K tokens y mantiene el recall de passkey al 100% hasta 100.444 tokens con un uso de VRAM plano de aproximadamente 4.130 MiB. La cuantizacion de 4 bits usa una tabla de consulta armonica de primos con escala con signo derivada de la Hessiana de activaciones (`H_j = E[x_j^2]`).

## Capacidades

- Generacion de texto y razonamiento paso a paso mediante bloques `<think>...</think>`, heredado de DeepSeek-R1-Distill.
- Modo `--nothink` que fuerza la respuesta directa (`<think>\n</think>\n\n`) con latencia reducida.
- Razonamiento matematico (el autor reporta GSM8K del 71,00% con `n=200`).
- Conocimiento cientifico de opcion multiple (ARC-Easy, ARC-Challenge, SciQ segun la model card).
- Generacion de texto en ingles y chino; no se declaran otros idiomas.
- Comportamiento "uncensored" declarado: la model card afirma 0/18 violaciones de rechazo en ingles y chino tras la ablacion de pesos.
- Contexto largo efectivo mediante el banco de segmentos (recall NIAH declarado al 100% hasta 100.444 tokens).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni otras modalidades.

## Casos de uso

- Inferencia en CPU sin GPU: el runtime C99 freestanding permite ejecutar el binario `V3_P4_0` de 1.18 GiB en 1.509,5 MiB de RSS con 53,86 tokens/s, lo que lo hace viable en portatiles, mini-PC y servidores sin acelerador.
- Despliegue en dispositivos edge y entornos embebidos: al compilarse como binario unico sin simbolos externos (AVX2+FMA, ARM64 NEON o C99 escalar), puede integrarse en imagenes minimas, contenedores scratch o sistemas Apple Silicon sin cadena de dependencias Python.
- Razonamiento matematico asistido sin conexion: el modelo mantiene el modo `<think>` para problemas algebraicos y aritmeticos, util en entornos air-gapped donde no se puede llamar a una API externa.
- Analisis de documentos largos con memoria acotada: el banco de segmentos permite procesar entradas de decenas de miles de tokens con VRAM plana de aproximadamente 4,1 GiB, adecuado para resumen o extraccion sobre contratos, informes o logs extensos en una unica GPU consumer.
- Prototipado de investigacion sobre cuantizacion discreta: el par `.vlt3` + runtime sirve como referencia reproducible para estudiar LUT armonicas de primos, entrenamiento entero de extremo a extremo y estrategias de KV eviction.
- Experimentacion con modelos sin filtros en entornos controlados: el autor declara eliminar los rechazos, lo que puede interesar a investigadores de seguridad y alineamiento que necesiten estudiar respuestas no filtradas, siempre dentro de un marco legal y etico.
- Sustitucion de modelos de 1,5B en pipelines de generacion de texto de baja latencia en ingles o chino, cuando el presupuesto de memoria es inferior a 2 GiB.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no replicados de forma independiente):

| Modelo / formato | Huella | WikiText-2 Word PPL | GSM8K (`<think>`, n=200) | ARC-Easy | ARC-Challenge | SciQ (RC / Closed-Book) | Violaciones "uncensored" |
|---|---|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (BF16) | 3,31 GiB | 99,20 | ~75,5% | 60,5% | 35,0% | 89,9% / 66,1% | 18/18 |
| VAULT-v3 PRIMAL (BF16 / V3_Q8_0) | 3,31 GiB / 1,77 GiB | 60,60 | 71,00% | 58,54% | 35,15% | 85,40% / 65,00% | 0/6 (0/18 WSP) |
| VAULT-v3 PRIMAL (V3_P4_0 Prime LUT) | 1,18 GiB | 62,72 | 71,00% | 58,12% | 35,15% | 85,40% / 63,10% | 0/6 |

Prueba de contexto largo (NIAH passkey, `rope_theta = 10.000`, ventana 1.024, presupuesto de segmentos 1.024):

| Contexto y profundidad | Retencion del banco | Recall VAULT-v3 | Modelo base (DynamicCache) | VRAM pico VAULT-v3 |
|---|---|---|---|---|
| 16.365 tokens (25%) | 100% | 100% exacto | 0% (colapso RoPE / OOM) | 4.163,7 MiB |
| 32.882 tokens (25%) | 100% | 100% exacto | 0% (colapso RoPE / OOM) | 4.129,2 MiB |
| 100.444 tokens (10%) | 100% | 100% exacto | 0% (colapso RoPE / OOM) | 4.130,4 MiB |
| 100.444 tokens (25%) | 100% | 100% exacto | 0% (colapso RoPE / OOM) | 4.130,4 MiB |

Throughput declarado en CPU: 53,86 tok/s con `V3_P4_0` (1.509,5 MiB RSS) y 43,11 tok/s con `V3_Q8_0` (2.114,7 MiB RSS). No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: aproximadamente 4,1 GiB pico segun la model card, tanto para `V3_P4_0` como para `V3_Q8_0` durante la prueba de contexto largo.
- RAM para inferencia en CPU: 1.509,5 MiB de RSS con `V3_P4_0` y 2.114,7 MiB con `V3_Q8_0`.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para margen; el autor cita una GPU consumer de 16 GB para el entrenamiento. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU consumer: si, segun los datos del autor, en tarjetas con 6 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 4070); no se aportan mediciones especificas por modelo.
- Opciones de despliegue: exclusivamente el runtime propietario `runtime/vault3_host` compilado con `make -C runtime` en Linux, macOS Apple Silicon o WSL. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.vlt3` no es compatible con esos ecosistemas.
- Latencia y throughput: 53,86 tok/s (`V3_P4_0`) y 43,11 tok/s (`V3_Q8_0`) en CPU con 12 hilos segun los ejemplos de la model card; no se publican cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAULT-v3-DeepSeek-R1-1.5B-PRIMAL-VLT3 | 1,78 B | 1.024 + banco de 1.024 segmentos (recall hasta 100K declarado) | `.vlt3` + runtime C99 propietario | `bartsch-personal-free-5pct-commercial` | 0 descargas, 0 likes en Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | 32.768 tokens (heredado de Qwen2.5) | safetensors, transformers, vLLM, llama.cpp | MIT | Ampliamente adoptado en Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | safetensors, GGUF, vLLM, llama.cpp | Apache 2.0 | Muy extendido, soporte nativo en la mayoria de runtimes |
| batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL (modelo base del fine-tune) | 1,78 B | no disponible | BF16 / V3_Q8_0 | `bartsch-personal-free-5pct-commercial` | Repositorio del autor, sin adopcion publica documentada |

La comparativa muestra que el modelo se diferencia por el formato binario compacto y el runtime C99 sin dependencias, pero pierde interoperabilidad frente a alternativas con licencias permisivas (MIT, Apache 2.0) y soporte en herramientas estandar.

## Limitaciones y advertencias

- Licencia no estandar `bartsch-personal-free-5pct-commercial`: el nombre sugiere uso personal gratuito y un 5% de regalias o umbral comercial, pero los terminos exactos no estan transcritos en la informacion disponible; es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial.
- Modelo sin adopcion publica: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los benchmarks ni del comportamiento declarado.
- El proceso de "uncensored" elimina los rechazos del modelo base; esto puede producir contenido danino, ilegal o inexacto y traslada toda la responsabilidad de filtrado al integrador.
- Riesgo de alucinacion propio de un modelo de 1,5B, especialmente en tareas de conocimiento factual y en razonamiento de varios pasos; el modo `--nothink` incrementa este riesgo al eliminar la cadena de razonamiento.
- Contexto nativo limitado: `rope_theta = 10.000` y ventana deslizante de 1.024 tokens; el recall a 100K depende del banco de segmentos y no de atencion completa, por lo que la recuperacion de informacion fuera de los segmentos retenidos no esta garantizada.
- Idiomas limitados a ingles y chino; no se declara soporte de castellano ni de otras lenguas.
- Formato propietario `.vlt3`: no es compatible con transformers, vLLM, llama.cpp, Ollama ni TGI, lo que limita la integracion en pipelines existentes y ata el despliegue al runtime del autor.
- Dependencia de un unico mantenedor (batteryphil) y de un repositorio sin actividad de la comunidad; riesgo de abandono y de falta de parches de seguridad.
- Las cifras de rendimiento (53,86 tok/s, PPL 60,60, recall 100%) provienen exclusivamente de la model card del autor y no han sido replicadas de forma independiente.
- El ejemplo de la model card que consulta un evento historico concreto sugiere un uso deliberado del modelo para evadir filtros; conviene evaluar la legalidad y adecuacion de ese tipo de consultas en la jurisdiccion de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL-VLT3
- Modelo base del fine-tune: https://huggingface.co/batteryphil/VAULT-v3-DeepSeek-R1-1.5B-PRIMAL
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo Qwen subyacente: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Fichero de licencia (referenciado en la model card): LICENSE dentro del repositorio de Hugging Face
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
