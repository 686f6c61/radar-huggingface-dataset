# neuralll/GLM-5.3-Flash-GSQ-RCO-3.0bit-Q4Kattn-GGUF

## Resumen

GLM-5.3-Flash-GSQ-RCO-3.0bit-Q4Kattn-GGUF es una cuantizacion GGUF de 3,0 bits del modelo GLM-5.3-Flash de Z.ai (zai-org), publicada por el usuario neuralll. Se trata de un modelo de arquitectura MoE (mixture of experts) con 313.326.811.966 parametros totales y 288 expertos enrutados por capa, del cual solo se activan 8 expertos por token en cada capa. El repositorio ocupa 113,6 GB y esta pensado para decodificacion de un solo flujo en GPUs de consumo mediante una cache de expertos en VRAM.

La aportacion principal de esta variante no es la cuantizacion base (heredada de pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF, una reproduccion comunitaria de los metodos GSQ y RCO de IST-DASLab), sino el reempaquetado de los tensores no-experto de Q8_0 a Q4_K: atencion, expertos compartidos, FFN densa y cabeza de salida, unos 8,3 GB del archivo. Los 126 tensores de expertos enrutados, el embedding de tokens y el resto de tensores F32/BF16 se copian bit a bit del original. Como esos pesos Q8_0 se transmiten a la GPU en cada token, reducirlos acelera la decodificacion a costa de un aumento de perplejidad de aproximadamente el 1%.

El modelo requiere un fork especifico de llama.cpp (neurall/llama.cpp) que implementa una cache LRU de expertos residente en GPU, construida sobre el PR #27861 de csantiago78. Segun los datos del autor, en una configuracion de 2x RTX 3090 la decodificacion pasa de 13,8 a 21,5 t/s (1,56x) en una respuesta de chat de 1500 tokens, a cambio de un procesamiento de prompt un 17% mas lento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), 42 capas MoE, 288 expertos enrutados por capa, 8 activos por token |
| Parametros totales | 313.326.811.966 (313,3 B) |
| Parametros activos | no disponible (el autor indica 8 de 288 expertos por capa, sin cifra total de parametros activos) |
| Longitud de contexto | 32k por defecto en el fork de llama.cpp; ampliable con `-c N` a costa de VRAM de cache |
| Tipos de cuantizacion | 3,0 bits base (GSQ-RCO); tensores no-experto en Q4_K; expertos enrutados, `token_embd` y tensores F32/BF16 sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash emplea una arquitectura transformer con capas MoE de 288 expertos enrutados, de los cuales se activan 8 por token y por capa. El checkpoint cuantizado conserva 42 capas MoE. La cuantizacion original aplica los metodos GSQ (arXiv:2604.18556) y RCO (arXiv:2605.00649) de IST-DASLab, que asignan precision por tensor de forma deliberada; esta variante sobrescribe la asignacion RCO para los tensores no-experto, pasandolos de Q8_0 a Q4_K mediante `llama-quantize --allow-requantize --tensor-type-file`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica relevante esta en el runtime, no en el modelo: el fork de llama.cpp sustituye el reparto estatico por capas entre GPUs por una cache de expertos calientes que llena toda la VRAM libre con los aproximadamente 100 expertos mas usados de cada capa. Dado que el uso de expertos esta sesgado, esa seleccion cubre alrededor del 74% del trabajo de expertos que los tokens eligen realmente en salida de chat, frente al 33% con colocacion estatica de capas completas. El resto se calcula en CPU en paralelo con la GPU. El fork activa por defecto `-ub` 2048 en GPUs de 20+ GiB, desactiva el repacking en CPU y reserva un nucleo de CPU por GPU.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Razonamiento y codigo: el autor documenta pruebas con prompts de codigo de 12k tokens sobre fuentes de llama.cpp.
- Soporte de endpoints compatibles con la API de OpenAI (`endpoints_compatible`), incluyendo `/v1/chat/completions`.
- Ejecucion local con llama.cpp mediante un fork especifico con soporte para GLM-5.3-Flash.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local de un MoE de 313 B en hardware de consumo: con 2x RTX 3090 (48 GB) y 125 GB de DDR4 el modelo decodifica a 21,5 t/s en respuestas de chat, lo que permite usar un modelo de esta escala en una estacion de trabajo sin servidores de clase A100/H100.
- Asistencia conversacional de un solo flujo: la cache de expertos esta optimizada para decodificacion single-stream, por lo que encaja en chats interactivos con contexto de hasta 32k tokens donde prima la latencia por token.
- Analisis de codigo con prompts largos: el autor mide procesamiento de prompt con prompts de 12k tokens de fuentes de llama.cpp; util para revision de repositorios o explicacion de modulos completos.
- Prototipado e investigacion sobre cuantizacion: el repositorio incluye `tensor-types-q4kattn.txt` con la asignacion tensor a tipo, lo que permite reproducir el proceso y experimentar con asignaciones alternativas de precision.
- Evaluacion de tecnicas de offload MoE: sirve como banco de pruebas para comparar colocacion estatica por capas frente a cache de expertos calientes en terminos de throughput y perplejidad.
- Despliegue en entornos con VRAM limitada y RAM abundante: el fork mantiene los expertos en RAM y cachea en GPU los mas usados, un patron adecuado para servidores con mucha DDR4 y GPUs de gama alta de generaciones anteriores.
- Generacion de texto por lotes pequenos en local: no recomendado para alta concurrencia, ya que las metricas publicadas corresponden a un unico flujo.

## Benchmarks y rendimiento

El autor publica mediciones de velocidad y perplejidad, no de benchmarks de calidad estandar (MMLU, HumanEval, GSM8K). Configuracion: 2x RTX 3090 (48 GB VRAM, un slot x16 de CPU y uno x4 de chipset X570), Ryzen 7 3700X, 125 GB DDR4, single stream, temperatura 0.

| Metrica | Original 3.0-bit | Este archivo (Q4_K attn) |
|---|---|---|
| Decodificacion, prompt corto (t/s) | 12,5 -> 18,5 (con cache) | 13,8 -> 21,5 (con cache) |
| Procesamiento de prompt largo, 12k tokens (t/s) | 209 -> 178 (con cache) | 217 -> 181 (con cache) |
| Decodificacion, prompt largo (t/s) | 11,2 -> 14,7 (con cache) | 12,3 -> 15,7 (con cache) |
| Perplejidad (wikitext-2, 40 x 512 tokens) | 3,5534 | 3,5871 (+0,95%) |

Notas del autor: las cifras suponen el modelo ya en cache de paginas del sistema operativo; la primera ejecucion tras cambiar de modelo es mas lenta. El procesamiento de prompt con cache es aproximadamente un 17% mas lento que sin cache.

## Requisitos de hardware

- VRAM: el archivo pesa 113,6 GB; el autor lo ejecuta con 48 GB de VRAM y 125 GB de RAM del sistema, manteniendo los expertos en RAM y cacheando en GPU los mas usados.
- GPU recomendadas: 2x RTX 3090 es la configuracion medida. No hay datos publicados para A100, H100, RTX 4090 ni otras GPU.
- GPU de consumo: si, en el escenario medido (2x RTX 3090). No cabe en una unica GPU de consumo.
- Despliegue: requiere el fork neurall/llama.cpp (soporte GLM-5.3-Flash y cache de expertos). Tambien carga en cualquier build con soporte de GLM-5.3-Flash (PRs #27773 y #27917), pero sin cache y a menor velocidad. No se menciona compatibilidad con vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: 21,5 t/s de decodificacion en prompt corto y 15,7 t/s en prompt largo con cache en la configuracion indicada; 181 t/s de procesamiento de prompt en 12k tokens.
- Ajuste por defecto del fork: contexto de 32k, `-ub` 2048 en GPUs de 20+ GiB, un nucleo de CPU libre por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (neuralll, Q4_K attn) | 313,3 B totales | 32k por defecto | GGUF, 3,0 bits con no-experto en Q4_K | MIT | PPL 3,5871; 21,5 t/s con cache en 2x RTX 3090 |
| pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF (original 3.0-bit) | 313,3 B totales | 32k por defecto | GGUF, 3,0 bits con asignacion RCO intacta | MIT | PPL 3,5534; 18,5 t/s con cache; misma VRAM |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | safetensors (presumible) | MIT | Modelo original sin cuantizar; requiere hardware muy superior |

No se dispone de datos de benchmarks de calidad ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: la perplejidad sube de 3,5534 a 3,5871 (+0,95%) respecto al cuantizado original, por el cambio de Q8_0 a Q4_K en atencion, expertos compartidos, FFN densa y cabeza de salida. El autor recomienda usar el archivo original si se quiere la asignacion RCO tal como fue disenada.
- Dependencia de un fork: llama.cpp upstream no puede cargar GLM-5.3-Flash segun el autor; sin el fork neurall/llama.cpp se pierde la cache de expertos y el rendimiento cae a la velocidad sin cache.
- Procesamiento de prompt mas lento con cache (aproximadamente un 17%), lo que penaliza cargas con prompts muy largos y poca generacion.
- Optimizado para un solo flujo: las metricas publicadas son single-stream; no hay datos de throughput con concurrencia.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Primera ejecucion lenta: requiere leer 113,6 GB desde disco hasta la cache de paginas del sistema operativo.
- Licencia MIT, que permite uso comercial, pero hereda las condiciones del modelo base zai-org/GLM-5.3-Flash (MIT) y de la cuantizacion original de pfeifferj; conviene verificar el archivo LICENSE del repositorio.
- No es una release de IST-DASLab: la implementacion de GSQ y RCO es una reproduccion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/neuralll/GLM-5.3-Flash-GSQ-RCO-3.0bit-Q4Kattn-GGUF
- Modelo base cuantizado: https://huggingface.co/pfeifferj/GLM-5.3-Flash-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Fork de llama.cpp con cache de expertos: https://github.com/neurall/llama.cpp
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- PR de llama.cpp con cache LRU de expertos (csantiago78): https://github.com/ggml-org/llama.cpp/pull/27861
- PR de soporte GLM-5.3-Flash (timkhronos): https://github.com/ggml-org/llama.cpp/pull/27773
- PR de soporte GLM-5.3-Flash (timkhronos): https://github.com/ggml-org/llama.cpp/pull/27917
