# foxn/Qwen3.8-27B-Holo-V8-2bit-12GB

## Resumen

Holo-V8 es un pipeline de cuantizacion post-entrenamiento (PTQ) y un motor de inferencia en Python + Triton que permite ejecutar un modelo de la familia Qwen 3.8 de 27.000 millones de parametros dentro de una unica GPU consumer de 12 GB de VRAM, en concreto una RTX 3060. El autor, identificado como `foxn`, es un entusiasta independiente del hardware y no un laboratorio academico. El repositorio de Hugging Face contiene unicamente los pesos cuantizados (~11,6 GB) y el codigo del motor vive en un repositorio de GitHub aparte.

El problema que aborda es concreto: un modelo de 27B en BF16 ocupa mas de 51 GB, lo que obliga a descargar capas a RAM del sistema por PCIe y hunde el rendimiento a 1,5-3 tok/s, o a usar cuantizaciones extremas de 2 bits (`Q2_K`, `IQ2_XXS`) que degradan severamente la perplejidad en arquitecturas hibridas. Holo-V8 propone una cuantizacion efectiva de ~2,05 bits basada en codigos Hadamard de 4 dimensiones y proteccion AWQ-Hessian, con ramas dispersas de outliers en FP8, alcanzando 14,9-15,2 tok/s con cero trafico PCIe de pesos durante la generacion.

La relevancia actual es la democratizacion de la inferencia de modelos de ~27B en hardware de gama media. El autor reporta 16K de contexto con KV-Cache en FP8 dentro de 10,95 GB de VRAM, lo que deja margen para el compositor del escritorio en el modo de 8K. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated DeltaNet (48 capas recurrentes lineales) + Full GQA (16 capas de atencion) |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 16.384 tokens (modo servidor) / 8.192 tokens (modo escritorio) |
| Tipos de cuantizacion | PTQ propietaria Holo-V8: ~2,05 bits efectivos, codebooks Hadamard 4D empaquetados (4 pesos por byte `uint8`), outliers FP8 dispersos (`TOPK=768` a `128`), escalas por bloque de 64; KV-Cache en `float8_e4m3fn` |
| Idiomas soportados | en, es, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | Cache propietaria `cache_holocell_v8/` (matrices 2-bit + escalas FP8 + `tokenizer_vocab.pt`); no se distribuye en safetensors ni GGUF estandar |

## Arquitectura y entrenamiento

El modelo base es Qwen 3.8 27B, un transformer hibrido que combina 48 capas de Gated DeltaNet (recurrencia lineal) con 16 capas de atencion completa con GQA. Esta mezcla es la que el autor senala como especialmente fragil frente a cuantizaciones extremas convencionales, ya que las capas recurrentes acumulan error de forma distinta a las de atencion. Sobre ese modelo, Holo-V8 aplica un pipeline PTQ en dos pasos: primero calcula las matrices Hessianas de activacion `E[x²]` para construir una cache protegida por AWQ, y despues optimiza los `TOPK` de outliers en proyecciones internas para liberar 1,52 GB de VRAM y habilitar el contexto de 16K.

No se dispone de informacion sobre los datos de entrenamiento originales de Qwen 3.8 27B (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada. La innovacion tecnica destacable es el motor de inferencia: kernels Triton de 2 bits con rotacion Walsh-Hadamard, KV-Cache en FP8 limitado a las 16 capas GQA, y un `CUDAGraph` monolitico que elimina por completo el trafico PCIe de pesos durante la decodificacion. Incluye ademas un tokenizer nativo precargado (248k vocabulario, ~0,1 s de carga) que evita distribuir el GGUF original de mas de 15 GB.

## Capacidades

- Generacion de texto y razonamiento general, con modo de razonamiento explicito `<think>` (usado en la evaluacion de GPQA Diamond con `max_tokens=3072`).
- Generacion de codigo en Python: evaluado en HumanEval y MBPP con tests unitarios zero-shot.
- Razonamiento matematico: evaluado en GSM8K con subconjunto estratificado.
- Capacidades multilingues limitadas a ingles, espanol y chino segun la model card.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con Prefix Caching, pensado para integrarse con OpenWebUI.
- Interfaz CLI interactiva de chat (`--cli`) incluida en el motor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local de un modelo de 27B en una RTX 3060 de 12 GB: el caso central. El motor cabe en 10,95 GB con 16K de contexto, permitiendo ejecutar el modelo sin offloading a RAM y a ~15 tok/s, apto para uso interactivo en escritorio.
- Asistente de codigo en estacion de trabajo: con 85,37% en HumanEval `pass@1`, el modelo es utilizable para autocompletado y generacion de funciones Python dentro de un IDE local, sin depender de APIs en la nube.
- Servidor de chat autoalojado para un usuario o equipo pequeno: el servidor compatible con OpenAI permite conectar OpenWebUI u otros frontends y aprovechar el Prefix Caching para conversaciones multi-turno con contexto largo.
- Razonamiento matematico asistido: el 97,33% en GSM8K sobre subconjunto estratificado lo hace adecuado para resolver problemas de nivel escolar y preuniversitario con explicacion paso a paso.
- Evaluacion de tecnicas de cuantizacion extrema: el repositorio incluye el pipeline PTQ completo (`quantize_step1_awq_hessian.py`, `quantize_step2_vram_slim.py`) y un arnes de benchmarks reproducible, util para investigadores que quieran replicar o auditar el metodo.
- Prototipado de agentes con contexto de 16K: suficiente para tareas de varios pasos con documentos medianos, aunque sin soporte documentado de tool calling nativo.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse integramente en local y sin trafico PCIe de pesos, los datos no salen del equipo, lo que encaja en escenarios con requisitos de confidencialidad.

## Benchmarks y rendimiento

Resultados reportados por el autor, ejecutados en una SOYO RTX 3060 12GB (GA104). Las cifras comparan Holo-V7 (2 bits uniforme) con Holo-V8 (AWQ-Hessian ~2,05 bits). Los datos de MMLU, GSM8K, ARC y GPQA corresponden a subconjuntos estratificados locales, no a los splits oficiales completos, salvo donde se indica.

| Benchmark | Holo-V7 | Holo-V8 | Protocolo |
|---|---|---|---|
| WikiText-2-Raw-v1 PPL | 10,3420 | 8,2363 | Split de test oficial completo (20 bloques x 512 tokens = 10.240 tokens) |
| HumanEval `pass@1` | 80,49% (132/164) | 85,37% (140/164) | Benchmark completo (n=164), zero-shot |
| MBPP Sanitized `pass@1` | — | 78,50% (157/200) | Split sanitizado (n=200), zero-shot Python |
| GSM8K | 86,00% (129/150) | 97,33% (146/150) | Subconjunto estratificado local (n=150: 50 facil / 50 medio / 50 dificil) |
| ARC-Challenge | 88,67% (266/300) | 93,00% (279/300) | Subconjunto estratificado local (n=300), log-likelihood directa |
| MMLU | 70,00% (210/300) | 74,33% (223/300) | Subconjunto estratificado local (n=300) |
| GPQA Diamond | 33,33% (66/198, 0-shot) | 87,50% (35/40) | Subconjunto PhD estratificado (n=40) con CoT `<think>` |
| VRAM | 9,74 GB (4K ctx) | 10,48 GB (8K) / 10,95 GB (16K) | KV-Cache FP8 en 16 capas GQA |
| Velocidad | 14,8 tok/s | 14,9-15,2 tok/s | `CUDAGraph` monolitico, 0 bytes PCIe |

Nota: el salto de GPQA de 33,33% a 87,50% compara protocolos distintos (0-shot directo vs. subconjunto con CoT), por lo que no es una mejora atribuible solo a la cuantizacion. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM: 10,95 GB con contexto de 16K (modo servidor sin monitor); 10,48 GB con contexto de 8K (modo escritorio, deja ~1,5 GB para el compositor).
- GPU de referencia: SOYO NVIDIA GeForce RTX 3060 12GB, silicio GA104, 3.584 nucleos CUDA, bus de 192 bits GDDR6, TDP 170W.
- Consumo medido: 159,1 W de media y 67,0 °C de media sobre 4.833 muestras de telemetria durante la generacion.
- Cabe en GPU consumer de 12 GB. Para GPUs con menos VRAM no hay datos; para GPUs con mas VRAM (RTX 4090, A100, H100) el modelo cabria holgadamente, pero el motor Triton esta optimizado y verificado para el perfil de 12 GB.
- Entorno de ejecucion verificado: Proxmox VE con PCIe passthrough, 32 GB de RAM de sistema.
- Opciones de despliegue: motor propietario `holocell_v8_qwen38_engine.py` con Triton y `CUDAGraph`; servidor compatible con OpenAI (`holocell_v8_openai_server.py`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 14,8-15,2 tok/s sostenidos con cero trafico PCIe de pesos durante la generacion.
- Verificacion: `verify_install.py` ejecuta un smoke test de 30 s que comprueba deteccion de GPU, uso de VRAM, velocidad y generacion determinista.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la informacion proporcionada. A continuacion se comparan las dos variantes del propio proyecto y se indica el modelo base:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Holo-V8 (Qwen3.8-27B) | 27B | 16K / 8K | ~2,05 bits AWQ-Hessian | Apache 2.0 | Hugging Face + GitHub |
| Holo-V7 | 27B | 4K | 2 bits uniforme | no disponible | no disponible |
| Qwen 3.8 27B (BF16) | 27B | no disponible | BF16 (>51 GB) | Apache 2.0 | no disponible en la informacion |

No hay datos de benchmarks comparativos con otros modelos de 27B ni con alternativas de cuantizacion como `Q2_K` o `IQ2_XXS` mas alla de la mencion cualitativa del autor.

## Limitaciones y advertencias

- Las cifras de MMLU, GSM8K, ARC-Challenge y GPQA provienen de subconjuntos estratificados locales (n=40 a n=300), no de los splits oficiales completos, por lo que no son directamente comparables con resultados publicados de otros modelos.
- El salto de GPQA (33,33% a 87,50%) mezcla cambio de protocolo (0-shot directo vs. CoT con `<think>`) y cambio de cuantizacion; no debe interpretarse como mejora limpia del metodo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (2026-11-03): no hay validacion independiente de los resultados.
- El autor se declara entusiasta independiente, no laboratorio academico; los benchmarks no han pasado revision por pares.
- La cuantizacion a ~2,05 bits conlleva riesgo de degradacion en tareas fuera de las evaluadas; la perplejidad en WikiText-2 (8,2363) es superior a la de un modelo en BF16, aunque el autor no reporta la cifra de referencia.
- El motor es propietario y especifico para esta GPU y esta cache de pesos; no es compatible con formatos estandar (safetensors, GGUF) ni con runtimes convencionales, lo que limita la portabilidad.
- Idiomas limitados a ingles, espanol y chino; el rendimiento en espanol no se ha evaluado en los benchmarks reportados.
- Riesgo de alucinacion no cuantificado en la informacion disponible; no hay evaluacion de sesgos.
- La licencia Apache 2.0 se declara en la model card, pero al ser una cuantizacion de un modelo de terceros conviene verificar la licencia del modelo base Qwen 3.8 27B antes de uso comercial.
- El contexto maximo verificado es de 16K tokens; no hay datos sobre comportamiento mas alla de esa ventana.

## Enlaces

- Hugging Face: https://huggingface.co/foxn/Qwen3.8-27B-Holo-V8-2bit-12GB
- GitHub (motor de inferencia, kernels Triton y auditoria): https://github.com/FOXN123/Holo-V8-Qwen3.8-27B-12GB
- Notas tecnicas (desglose matematico, ablacion de kernels V1-V9, auditoria metodologica): `TECHNICAL_NOTES.md` en el repositorio de GitHub
- Auditoria de benchmarks: carpeta `benchmarks_audit/` en el repositorio de GitHub
