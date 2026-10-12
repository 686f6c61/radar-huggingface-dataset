# MegaPSV/Swift-1.5-FP8-AWQ-MTP

## Resumen

Swift-1.5-FP8-AWQ-MTP es una cuantización en FP8 del modelo multimodal ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario MegaPSV. Se trata de un transformer híbrido de 27.781.427.984 parámetros (27,8B) con 64 capas de atención (48 de atención lineal y 16 de atención completa), una torre visual para entrada de imagen y una longitud de contexto de 262.144 tokens (256K). El pipeline declarado es image-text-to-text y el modelo está etiquetado con las familias qwen3_5 y qwen3_8, además de capacidades de reasoning y efficient-thinking.

El problema que resuelve es el despliegue de un modelo de razonamiento multimodal de casi 28B parámetros en hardware limitado: la versión BF16 ocupa 55,6 GB, mientras que este checkpoint comprimido ocupa unos 30 GB manteniendo métricas estadísticamente indistinguibles del original. La receta combina tres elementos sobre el formato FP8_BLOCK: un pre-paso de smoothing AWQ aplicado sobre los pesos BF16, escalas de KV cache FP8 calibradas por capa y una cabeza MTP (multi-token prediction) cuantizada que deja el modelo listo para decodificación especulativa.

Su relevancia actual radica en que demuestra que una cuantización mixta (FP8 block-scaled más smoothing AWQ) puede preservar la distribución del modelo base sin coste computacional extra en inferencia, y que las escalas calibradas de la KV cache FP8 reducen a la mitad la huella de memoria del contexto sin deriva medible. Está pensado para servirse con vLLM ≥ 0.31.0, que detecta automáticamente el formato compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido: 48 capas de atencion lineal + 16 capas de atencion completa; presencia de modulos de puerta de expertos (`mlp.gate`, `shared_expert_gate`); familia qwen3_5 / qwen3_8 |
| Parametros totales | 27.781.427.984 (27,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Pesos FP8 e4m3 block-scaled [128,128] (RTN, data-free) con pre-paso AWQ smoothing; activaciones FP8 e4m3 dinamicas per-token×128; KV cache FP8 e4m3 con escalas estaticas `k_scale`/`v_scale` calibradas por capa; cabeza MTP en FP8 (8 capas Linear); `mtp.fc`, torre visual, `embed_tokens`, `lm_head`, LayerNorms, `q_norm`/`k_norm`, puertas y modulos auxiliares de atencion lineal en BF16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other`); enlace al texto en el repositorio del modelo base |
| Formato de pesos | safetensors con formato compressed-tensors (FP8 block-scaled) |

Datos adicionales: tamano del repositorio 30,9 GB (~30 GB; frente a 55,6 GB en BF16), tamano oculto 5120 (proyeccion `mtp.fc` de 5120 a 10240), libreria `vllm`, runtime probado vLLM >= 0.31.0, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-11 y actualizado el 2026-10-11.

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido de 64 capas que intercala 48 capas de atencion lineal con 16 capas de atencion completa, lo que reduce el coste de la atencion sobre secuencias largas manteniendo una ventana de 262.144 tokens. La presencia de modulos `mlp.gate` y `shared_expert_gate` asi como de modulos auxiliares de atencion lineal (`A_log`, `conv1d`, `dt_bias`, `in_proj_a/b/ba`, `norm`) apunta a una mezcla de expertos con componentes de estado, aunque la model card no detalla el numero de expertos ni los parametros activos. El modelo incorpora una cabeza MTP con 8 capas `Linear` (`self_attn.{q,k,v,o}_proj` y proyecciones `mlp`) y una proyeccion de entrada `mtp.fc`, que no se invoca en pasadas forward normales y solo actua en decodificacion especulativa MTP.

No hay informacion sobre los datos de entrenamiento del modelo base: no se documentan el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Esta ficha corresponde a una publicacion de cuantizacion, no de entrenamiento. La receta de cuantizacion se ejecuto con llm-compressor 0.14.0 mediante `oneshot`, combinando `AWQModifier(duo_scaling="both")` y `QuantizationModifier(scheme="FP8_BLOCK")`, con calibracion sobre el conjunto `perfectblend` (256 secuencias × 512 tokens). El smoothing AWQ es una transformacion que preserva la funcion: `1/s` se absorbe en la normalizacion previa y `s` en la dimension de entrada del `Linear` siguiente, de modo que la inferencia no anade computo adicional (el checkpoint incluye un `transform_config` vacio). Los pesos `Linear` del LM se cuantizaron a FP8 e4m3 block-scaled [128,128] con RTN sin datos, mientras que las escalas de la KV cache se obtuvieron con un observador `static_minmax` sobre 256 secuencias de 512 tokens. La cabeza MTP se post-cuantizo con la ruta RTN nativa de compressed-tensors.

## Capacidades

- Generacion de texto conversacional multi-turno, con etiquetas declaradas de reasoning y efficient-thinking.
- Entrada multimodal imagen-texto (pipeline image-text-to-text); la torre visual se mantiene en BF16.
- Razonamiento matematico: la evaluacion documentada incluye gsm8k en configuracion 5-shot con cadena de pensamiento y `max_gen_toks=2048`.
- Contexto largo de hasta 262.144 tokens, con atencion hibrida lineal/completa.
- Decodificacion especulativa MTP: la cabeza MTP cuantizada con diseno de paridad permite acelerar la generacion.
- Salida estructurada y parsers de herramientas: el ecosistema vLLM los contempla, aunque la model card advierte que la combinacion de paralelismo por pipeline (PP) con `--async-scheduling` y salida estructurada es rechazada por vLLM 0.31.0.
- Capacidades multilingues: no disponible.
- No se documentan capacidades de audio ni de vision mas alla de la entrada de imagen.

## Casos de uso

- Servicio de razonamiento multimodal en produccion: el modelo acepta entradas de imagen y texto y puede sostener cadenas de razonamiento largas, lo que lo hace adecuado para asistentes que analizan capturas, diagramas o documentos escaneados junto a una pregunta en lenguaje natural.
- Analisis de documentos extensos: con 262.144 tokens de contexto se pueden procesar contratos, informes o bases de codigo completas en una sola pasada, evitando estrategias de troceado y recuperacion.
- Atencion al cliente automatizada: la ventana de contexto y el modo conversacional permiten gestionar dialogos multi-turno extensos manteniendo el hilo de la conversacion sin reinyectar el historial completo.
- Resolucion de problemas matematicos y cuantitativos: el 94,47% de acierto en gsm8k 5-shot CoT lo situa como candidato para tutoria automatica, verificacion de calculos o generacion de ejercicios resueltos.
- Generacion y asistencia de codigo: la combinacion de razonamiento y contexto largo permite integrarlo en pipelines de revision de pull requests o de generacion de tests, siempre que se valide la salida estructurada en la configuracion de despliegue elegida.
- Despliegue en clusters pequenos de GPUs de consumo: la receta documentada funciona en 4× RTX 5070 Ti (16 GB, PCIe) con TP4, lo que permite servir un modelo de 27,8B en hardware de gama alta no profesional.
- Reduccion de latencia mediante MTP: en escenarios interactivos con requisitos de tiempo de respuesta estrictos, la cabeza MTP cuantizada habilita decodificacion especulativa sin necesidad de reentrenar ni recalibrar.
- Extraccion de informacion de imagenes y texto combinados: formularios, tickets o capturas con campos estructurados que requieren comprension de la imagen y generacion de texto en la misma llamada.

## Benchmarks y rendimiento

Metricas teacher-forced frente al modelo base BF16, sobre el mismo corpus de 131.008 tokens (wikitext-2-raw test, 64×2048) y con el mismo motor y paralelismo vLLM, usando `prompt_logprobs`.

| Metrica | BF16 base | Este modelo | Delta |
|---|---|---|---|
| PPL (estilo wikitext-2) | 6,7745 | 6,7741 | −0,0004 |
| Acuerdo en top-1 token | — | 96,36% | — |
| Top-1 del cuantizado dentro del top-5 del base | — | 99,97% | — |
| Desacuerdos confident + certain | — | 0,02% de las posiciones | — |
| KL engrosada (top-5, cota inferior) | — | 0,0055 nats/token | — |

El 94% de la masa de desacuerdo se concentra en el tramo `near-tie` (margen < 0,5). Una ejecucion de control BF16↔BF16 da 0,00% en todas las metricas, por lo que los valores anteriores se consideran senal y no ruido del motor.

Resultados en gsm8k (conjunto completo, 1319 preguntas, 5-shot CoT, `max_gen_toks=2048`, extraccion unificada del ultimo numero, test exacto de McNemar frente a BF16 sobre las mismas preguntas):

| Modelo | Precision | McNemar p frente a BF16 |
|---|---|---|
| BF16 base | 93,71% | — |
| Este modelo (FP8 + AWQ) | 94,47% | 0,18 (no significativo) |
| Misma receta sin smoothing AWQ | 94,16% | 0,46 (no significativo) |
| Build externo FP8_BLOCK sin smoothing | 92,34% | 0,013 (significativamente peor) |

KV cache FP8: sobre una build validada de esta receta, servir con `--kv-cache-dtype fp8` frente a la KV cache automatica (BF16) midio 0,00% de deriva en todas las metricas teacher-forced, y reduce la huella de 64 KiB/token a 32 KiB/token.

Cabeza MTP: no se invoca en pasadas forward ordinarias, por lo que su cuantizacion no altera ninguna metrica de generacion; las metricas teacher-forced son identicas antes y despues de la post-cuantizacion de la MTP.

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: ~30 GB en FP8 frente a 55,6 GB en BF16.
- No cabe en una unica GPU de consumo: 30 GB supera los 24 GB de una RTX 4090 o RTX 3090.
- Configuracion de produccion validada por el autor: 4× RTX 5070 Ti (16 GB, PCIe, sin NVLink) con TP4; el reparto estimado es de ~7,5 GB de pesos y ~2 GB de KV cache FP8 para 256K por tarjeta.
- KV cache: 32 KiB/token en FP8 frente a 64 KiB/token en BF16; una secuencia completa de 262.144 tokens en FP8 ocupa aproximadamente 8 GiB.
- Se requiere vLLM >= 0.31.0. El formato compressed-tensors se detecta automaticamente, por lo que no debe pasarse el flag `--quantization`.
- `--kv-cache-dtype fp8` es obligatorio para aplicar las escalas de KV calibradas; con el dtype `auto` no se usan y la KV cache permanece en BF16.
- Paralelismo: vLLM 0.31.0 rechaza el paralelismo por pipeline (PP) combinado con `--async-scheduling` y salida estructurada (parsers de herramientas). La configuracion sin herramientas validada en este hardware usa PP4; la configuracion completa con todas las funciones usa TP4.
- Variable de entorno recomendada: `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`.
- Latencia y throughput: no disponible. La model card no publica medidas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL | gsm8k | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Swift-1.5-FP8-AWQ-MTP) | 27,8B | 256K | 6,7741 | 94,47% | swift-open-license-1.0 | FP8 block-scaled + AWQ + KV FP8 calibrada + MTP FP8 |
| ukisai/Swift-1.5-Qwen3.8-27b (BF16 base) | 27,8B | 256K | 6,7745 | 93,71% | swift-open-license-1.0 | Modelo de referencia, 55,6 GB |
| Misma receta sin smoothing AWQ | 27,8B | 256K | Δ+0,028 | 94,16% | no disponible | Deriva de distribucion mayor que la variante con AWQ |
| Build externo FP8_BLOCK sin smoothing | 27,8B | 256K | no disponible | 92,34% | no disponible | Significativamente peor en gsm8k (p = 0,013) |
| Qwen/Qwen3.8-27B-FP8 | 27B | no disponible | no disponible | no disponible | no disponible | Referencia del formato FP8_BLOCK citada por el autor |
| TelperionAI/Qwen3.8-27B-FP8-block-AWQ | 27B | no disponible | no disponible | no disponible | no disponible | Referencia del metodo de smoothing AWQ usado |

Las alternativas de la misma categoria (modelos de ~27B en FP8) se citan en la model card unicamente como referencias de formato y metodo; sus especificaciones completas y resultados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Aunque las metricas indican paridad estadistica con el base BF16, sigue existiendo un 3,64% de desacuerdo en el token top-1 y un 0,02% de desacuerdos en los tramos de alta confianza (`confident` + `certain`), que son los relevantes para el dano funcional.
- El smoothing AWQ es determinante: sin el, la misma receta presenta una deriva de PPL de +0,028 frente a −0,0004 en esta version.
- La licencia es `swift-open-license-1.0`, etiquetada como `other`; es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que la model card no resume sus condiciones.
- No se documentan los idiomas soportados, los sesgos del modelo base, el riesgo de alucinacion ni las caracteristicas de los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion independiente de la comunidad.
- Solo se ha probado con vLLM >= 0.31.0; no se documentan rutas alternativas de despliegue (llama.cpp, Ollama, TGI, GGUF).
- Si se omiten las escalas de KV calibradas (es decir, si no se usa `--kv-cache-dtype fp8`), la KV cache permanece en BF16 y se pierde la reduccion de memoria a la mitad.
- La combinacion de paralelismo por pipeline con `--async-scheduling` y salida estructurada esta rechazada por vLLM 0.31.0, lo que limita las configuraciones de despliegue con parsers de herramientas.
- Requiere multiples GPUs: no es desplegable en una sola tarjeta de consumo de 24 GB.
- No se publican medidas de latencia ni de throughput, por lo que no es posible estimar el coste operativo en produccion a partir de la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MegaPSV/Swift-1.5-FP8-AWQ-MTP
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Texto de la licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Referencia del formato FP8_BLOCK: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Referencia del metodo de smoothing AWQ: https://huggingface.co/TelperionAI/Qwen3.8-27B-FP8-block-AWQ
