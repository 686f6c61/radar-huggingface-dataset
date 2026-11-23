# hyukudan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-mirror

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-GGUF-mirror es un espejo (mirror) de una cuantización GGUF del modelo Qwen3.8-Flash-Next, publicada originalmente por ISTA-DASLab y replicada por el usuario hyukudan para garantizar la reproducibilidad de su banco de pruebas de motores de inferencia (strix-halo-engine-lab). No se trata de un modelo nuevo: los archivos son copias byte a byte de la revisión upstream `ed59f92082b1e93c0e96d60a8b11aab089b52f09`, sin recuantizar ni modificar. El modelo base, Qwen3.8-Flash-Next, es un modelo de Qwen con 176.943.899.520 parámetros totales (unos 177.000 millones) según los safetensors del repo original.

La relevancia de este repositorio es doble. Por un lado, ofrece pesos GGUF en dos cuantizaciones concretas (Q2_0 e IQ3_S) listos para motores de inferencia local. Por otro, documenta de forma explícita las técnicas de cuantización empleadas por ISTA-DASLab: GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649), que asignan bits de forma diferenciada por tensor en lugar de aplicar una cuantización uniforme. El mirror incluye además ficheros de asignación de tensores (`.rco-allocation.txt`) que permiten auditar cómo se distribuyeron los bits.

El repositorio tiene 1292 descargas y un tamaño de 121,2 GB en el índice de Hugging Face, aunque la model card declara 150,04 GB para el conjunto completo de 16 archivos. La licencia declarada es Apache-2.0, pero los pesos derivan de Qwen3.8-Flash-Next, por lo que también aplica la Qwen Community License 1.0, incluida en el repo como `LICENSE.Qwen`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; no se detalla en la informacion proporcionada) |
| Parametros totales | 176.943.899.520 (~177.000 M) segun safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q2_0 e IQ3_S (en este mirror); IQ2_XS, IQ3_XXS y UD-Q4_K_XL mencionados en la documentacion upstream |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (declarada) y Qwen Community License 1.0 (por herencia del modelo base) |
| Formato de pesos | GGUF (archivos divididos en shards de 00001-of-00002 y 00002-of-00002) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen3.8-Flash-Next en los datos proporcionados: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo RLHF/DPO. El nombre "Flash-Next" y el tamano (~177.000 M de parametros) sugieren un modelo de gran escala orientado a eficiencia, pero no hay confirmacion tecnica en la informacion disponible.

Lo que si esta documentado es el proceso de cuantizacion. ISTA-DASLab aplica GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649), dos tecnicas de asignacion de precision por tensor. RCO genera ficheros de asignacion (`.rco-allocation.txt`) que registran el reparto de bits entre tensores; el mirror incluye las asignaciones para IQ2_XS, IQ3_S, IQ3_XXS y Q2_0. El mirror no modifica estos pesos: los archivos son copias exactas verificadas por sha256 contra los hashes LFS upstream. Como innovacion practica, el autor del mirror documenta un perfil hibrido propio (no incluido aqui) que sustituye los expertos enrutados de un UD-Q4_K_XL por los tensores Q2_0, con una caida de acuerdo top-1 del 88,1 % al 76,6 % en un conjunto de 64 prompts.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica uso previsto para dialogos multi-turno.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que los pesos pueden servirse mediante APIs compatibles con el formato de endpoints de Hugging Face.
- Cuantizacion con imatrix: el tag `imatrix` indica que las cuantizaciones emplean matrices de importancia para preservar la calidad en bits bajos.
- Razonamiento y codigo: la model card upstream incluye graficas de evaluacion en AIME25 (matematicas), GPQA Diamond (razonamiento cientifico) y LCB (LiveCodeBench, codigo), lo que sugiere capacidades evaluadas en estas areas, aunque no se aportan cifras en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en hardware de gama alta: los shards Q2_0 (66,4 GB en total) permiten cargar un modelo de ~177.000 M en estaciones con suficiente memoria unificada o VRAM, algo inviable con pesos en FP16 (~354 GB). Es adecuado para laboratorios que quieran experimentar con un modelo de gran escala sin infraestructura de datacenter.
- Reproducibilidad de investigacion: el mirror fija una revision concreta y verifica sha256 de cada archivo, por lo que sirve para replicar experimentos de cuantizacion (GSQ/RCO) y comparar motores de inferencia sobre bytes identicos.
- Evaluacion de tecnicas de cuantizacion: los ficheros `.rco-allocation.txt` permiten analizar como RCO distribuye bits entre tensores y correlacionarlo con las curvas de calidad publicadas (AIME25, GPQA Diamond, LCB frente a bit width medio).
- Despliegue con llama.cpp u Ollama: al ser GGUF, los pesos se integran en el ecosistema llama.cpp; util para prototipos de chat conversacional en entornos controlados.
- Benchmarking de motores (vLLM, TGI, llama.cpp): el autor del mirror lo usa para medir throughput de prefill y calidad top-1 en su banco de pruebas; otros equipos pueden reutilizar la misma revision como referencia fija.
- Experimentacion con perfiles hibridos de precision: aunque el perfil hibrido del autor no esta en este repo, los shards Q2_0 e IQ3_S permiten construir variantes propias combinando tensores de distintas cuantizaciones.
- Servicio conversacional de baja concurrencia: el tag `conversational` y la compatibilidad con endpoints permiten montar un servicio de chat para uso interno, siempre que el hardware soporte la carga del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card upstream incluye graficas (`aime25_vs_avg_bit_width.png`, `gpqa_diamond_vs_avg_bit_width.png`, `lcb_vs_avg_bit_width.png`, `task_avg_vs_avg_bit_width.png`, `prefill_throughput.png`) que relacionan la calidad con el ancho de bits medio y el throughput de prefill, pero los valores concretos no se detallan en el texto proporcionado. El unico dato numerico de calidad disponible es del perfil hibrido del autor del mirror (no de estos pesos): 76,6 % de acuerdo top-1 frente a 88,1 % de UD-Q4_K_XL en 64 prompts.

## Requisitos de hardware

- VRAM/memoria estimada para Q2_0: ~66,4 GB solo para pesos (37,6 GB + 28,8 GB de los dos shards), mas overhead de contexto y cache KV.
- VRAM/memoria estimada para IQ3_S: ~83,6 GB solo para pesos (54,8 GB + 28,8 GB), mas overhead.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, se requiere un entorno con al menos ~70-90 GB de memoria disponible, lo que excluye GPUs consumer de 24 GB en configuracion de un solo dispositivo.
- Cabe en consumer GPU: no en una sola GPU consumer convencional (RTX 4090 de 24 GB, etc.) con estas cuantizaciones; requeriria multiplas GPUs, memoria unificada de gran capacidad (el autor usa un entorno "Strix Halo") o descarga a CPU/RAM.
- Opciones de despliegue: llama.cpp y derivados (Ollama) por el formato GGUF; el tag `endpoints_compatible` apunta a servidores compatibles con la API de endpoints. vLLM y TGI no estan confirmados para estos archivos en la informacion disponible.
- Latencia y throughput: no disponibles; solo se referencia una grafica de throughput de prefill sin cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La unica comparacion documentada es interna al ecosistema de cuantizaciones de este mismo modelo:

| Variante | Tamano aproximado de pesos | Calidad top-1 (64 prompts) | Notas |
|---|---:|---:|---|
| UD-Q4_K_XL (upstream) | no disponible | 88,1 % | Referencia de calidad del autor del mirror |
| Perfil hibrido Q2_0 + UD-Q4_K_XL | no disponible | 76,6 % | Perfil opt-in del autor, no incluido en este repo |
| Q2_0 (este mirror) | ~66,4 GB | no disponible | Cuantizacion de 2 bits con imatrix |
| IQ3_S (este mirror) | ~83,6 GB | no disponible | Cuantizacion de ~3 bits |

Comparativa con otros modelos de ~177.000 M de parametros: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo original: es un mirror de una cuantizacion de terceros (ISTA-DASLab); cualquier problema de calidad deriva de la cuantizacion upstream, no del mirror.
- Doble licencia: aunque se declara Apache-2.0, los pesos derivan de Qwen3.8-Flash-Next y la Qwen Community License 1.0 aplica tambien; es necesario revisar sus condiciones antes de uso comercial.
- El repo upstream declara Apache-2.0 pero no incluye fichero LICENSE; el mirror lo anade manualmente, lo que puede generar ambiguedad juridica.
- Cuantizaciones de muy baja precision (Q2_0, IQ3_S): la perdida de calidad frente a FP16 o Q4 es esperable; el propio autor documenta una caida de 11,5 puntos en acuerdo top-1 para su perfil hibrido basado en Q2_0.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo general de los LLM, potencialmente amplificado por la cuantizacion agresiva.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas sin evaluacion propia.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificar la configuracion del modelo base.
- Requisitos de memoria elevados: incluso en Q2_0 se necesitan ~66 GB solo para pesos, lo que limita el despliegue a hardware especializado.
- Los shards IQ3_S y Q2_0 comparten el segundo archivo (mismo sha256), lo que puede confundir en la gestion de descargas; verificar siempre los hashes antes de usar.
- El mirror solo incluye un subconjunto de archivos que usan los motores del autor; no es el repositorio upstream completo.

## Enlaces

- Mirror en Hugging Face: https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF-mirror
- Repositorio upstream de la cuantizacion: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Revision upstream fijada: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF/tree/ed59f92082b1e93c0e96d60a8b11aab089b52f09
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Perfil hibrido del autor (repo separado): https://huggingface.co/hyukudan/Qwen3.8-Flash-Next-GSQ-hybrid-Q2
- Banco de pruebas del autor: https://github.com/hyukudan/strix-halo-engine-lab
- Documentacion del perfil GSQ: https://github.com/hyukudan/strix-halo-engine-lab/blob/main/docs/gsq-speed-profile.md
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo RCO: https://github.com/IST-DASLab/RCO
