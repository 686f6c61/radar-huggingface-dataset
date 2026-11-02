# harrisonvanderbyl/purelaffn-1.15b-step1100

## Resumen

PureLAFFN 1.15B (step 1100) es un modelo experimental de lenguaje desarrollado por el usuario de HuggingFace harrisonvanderbyl. Se trata de una variante de la arquitectura RWKV-7 (un modelo recurrente con mecanismo de time-mixing lineal, alternativo a los transformers clasicos) en la que el bloque feed-forward convencional se sustituye por un modulo denominado PureLAFFN (Linear Attention Feed-Forward Network), con cabezas agrupadas por pares, router de expertos y down router. El modelo tiene 1.150 millones de parametros y 12 capas.

El checkpoint publicado corresponde al paso 1100 de un entrenamiento previsto de 20.000 pasos, por lo que se trata de un modelo en estado intermedio (no finalizado). Fue entrenado en 8 GPU AMD MI325X (gfx942) con paralelismo tensorial de 8 vias sobre las cabezas. El repositorio contiene los pesos fragmentados por rango en formato PyTorch (`.pt`), no safetensors ni GGUF, y el codigo de entrenamiento e inferencia.

Su relevancia es fundamentalmente de investigacion: explora una arquitectura alternativa (RWKV-7 con FFN basado en atencion lineal) y demuestra entrenamiento en hardware AMD, pero al ser un checkpoint intermedio, sin model card de evaluacion, sin licencia declarada y sin benchmarks publicados, no es un modelo apto para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 con bloque PureLAFFN (Linear Attention Feed-Forward Network); transformer recurrente con time-mixing |
| Parametros totales | 1,15 mil millones (1.15B) |
| Parametros activos | no disponible (no es MoE clasico; incluye router de expertos en el bloque FFN) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 con autocast bf16; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` por rango (8 ficheros `ckpt_step1100_rank{0..7}.pt`, TP=8) |
| Dimension del modelo (d_model) | 2560 |
| Capas | 12 |
| Cabezas globales (n_up) | 128 (16 por rango en TP=8) |
| Vocabulario | 50.304 tokens |
| K / v_up | 256 / 1280 |
| Tamano del repositorio | 24,7 GB |

## Arquitectura y entrenamiento

El modelo sigue la familia RWKV-7, que sustituye la atencion cuadratica de los transformers por un mecanismo de time-mixing recurrente de coste lineal respecto a la longitud de secuencia. La innovacion principal es el bloque PureLAFFN, que reemplaza el FFN habitual por una red de atencion lineal con cabezas agrupadas por pares (pair-grouped up heads), un router de expertos, un down router (4 cabezas por cabeza de subida, en modo separado) y una mezcla descendente (down mix). La configuracion concreta es d_model=2560, 12 capas, K=256, v_up=1280 y 128 cabezas globales de subida (16 por rango con TP=8).

El entrenamiento se realizo en 8 GPU AMD MI325X (gfx942) con paralelismo tensorial de 8 vias sobre las cabezas, learning rate inicial de 1e-3 con decaimiento a 7.5e-4, warmup de 200 pasos, multiplicador de learning rate del estado de 2.0, beta2=0.95 y epsilon de Adam de 1e-15. El checkpoint publicado corresponde al paso 1100 de un total previsto de 20.000, es decir, aproximadamente el 5,5% del entrenamiento planificado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva mediante el script `generate.py`, que carga los 8 rangos y ejecuta la inferencia en una sola GPU.
- Muestreo configurable con temperatura y top-p (por ejemplo, temperatura 0.8 y top-p 0.9 en el ejemplo de la model card).
- Al ser un checkpoint intermedio (paso 1100 de 20.000), no se documentan capacidades consolidadas de razonamiento, codigo o matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni idiomas cubiertos.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- El vocabulario de 50.304 tokens es compatible con tokenizadores tipo GPT-2/NeoX, pero el tokenizador concreto no se especifica.

## Casos de uso

- Investigacion en arquitecturas recurrentes: replicar el entrenamiento con `train.py` para estudiar el comportamiento del bloque PureLAFFN frente a FFN convencionales en RWKV-7, comparando curvas de perdida a lo largo de los pasos.
- Experimentacion con hardware AMD: servir como referencia reproducible de entrenamiento en 8 GPU MI325X con TP=8 sobre cabezas, util para validar stacks de ROCm y gfx942.
- Estudio de routers de expertos en FFN: analizar el enrutamiento del expert router y del down router (4 cabezas por cabeza de subida) para investigar especializacion de cabezas durante el entrenamiento temprano.
- Pruebas de inferencia en una sola GPU: usar `generate.py` para medir latencia y consumo de memoria de un modelo de 1,15B en fp32/bf16 en una GPU consumer o de datacenter.
- Baseline para comparativas academicas: emplear el checkpoint del paso 1100 como punto de referencia intermedio en estudios sobre convergencia y estabilidad de LR (con los hiperparametros documentados).
- Prototipado de generacion de texto a pequena escala: generar continuaciones cortas (por ejemplo, 50 tokens) para inspeccionar cualitativamente el estado del modelo, sin expectativas de calidad de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 de 1,15B parametros ocupan aproximadamente 4,6 GB; con autocast bf16 el calculo puede reducir el uso efectivo, pero los pesos se almacenan en fp32 segun la model card. Hay que sumar memoria para activaciones y estado recurrente.
- GPU recomendadas: el entrenamiento se realizo en 8 AMD MI325X (gfx942); para inferencia en una sola GPU, una RTX 4090 (24 GB) o superior es suficiente en terminos de pesos, aunque no se documenta compatibilidad probada.
- Cabe en GPU consumer: si, en principio, en GPUs con 8-12 GB o mas, dado el tamano de 1,15B en fp32; no se han publicado pruebas.
- Opciones de despliegue: unicamente el script `generate.py` proporcionado por el autor, que carga los 8 ficheros de rango y ejecuta en una GPU. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` fragmentado no es directamente compatible con esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| PureLAFFN 1.15B (step 1100) | 1,15B | no disponible | RWKV-7 + PureLAFFN | no disponible | `.pt` (TP=8) |
| RWKV-7 (variantes oficiales) | 0,1B-2,9B segun version | no disponible | RWKV-7 | Apache 2.0 (tipicamente) | safetensors, GGUF |
| Modelos transformer ~1B (p. ej., Llama 3.2 1B, Qwen2.5 1.5B) | 1-1,5B | 128K-32K | Transformer denso | licencias permisivas | safetensors, GGUF |

La comparacion con alternativas es limitada porque no se dispone de datos de rendimiento, contexto ni licencia del modelo evaluado. Frente a los RWKV-7 oficiales, este checkpoint es experimental, intermedio y no esta empaquetado en formatos estandar; frente a transformers densos de tamano similar, carece de evaluacion publicada que permita comparar calidad.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 1100 de 20.000, por lo que la calidad del modelo es muy inferior a la de un modelo finalizado.
- Sin licencia declarada: no se especifican terminos de uso comercial; no debe usarse en produccion sin aclaracion legal.
- Sin benchmarks ni evaluacion: no hay datos de MMLU, HumanEval, GSM8K ni de calidad de generacion.
- Idiomas no documentados: se desconoce el soporte multilingue real.
- Riesgo de alucinacion y salidas incoherentes: esperable en un modelo entrenado solo el 5,5% de los pasos previstos.
- Formato no estandar: pesos `.pt` fragmentados en 8 rangos; requiere el codigo del autor para reconstruir el modelo, lo que dificulta su integracion en pipelines habituales.
- Sin versiones cuantizadas: no hay GGUF ni formatos de 4/8 bits, lo que limita el despliegue en hardware modesto.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no es posible evaluar sesgos.
- Uso previsto: investigacion y experimentacion, no produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harrisonvanderbyl/purelaffn-1.15b-step1100
- Codigo de entrenamiento: `train.py` incluido en el repositorio del modelo
- Codigo de inferencia: `generate.py` incluido en el repositorio del modelo
- Paper de RWKV-7: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada
