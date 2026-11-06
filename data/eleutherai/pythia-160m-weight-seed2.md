# EleutherAI/pythia-160m-weight-seed2

## Resumen

`EleutherAI/pythia-160m-weight-seed2` es un modelo de lenguaje causal de 160 millones de parametros perteneciente a la suite **PolyPythias**, una extension del proyecto Pythia de EleutherAI que anade 45 ejecuciones de entrenamiento adicionales (5 tamanos x 9 semillas) para estudiar la estabilidad y reproducibilidad del preentrenamiento de modelos de lenguaje. Este checkpoint concreto forma parte del subconjunto de variantes *weight-seed*, pensadas en principio para aislar el efecto de la inicializacion de pesos manteniendo fija la ordenacion de los datos.

Es importante senalar que la model card advierte de un **error de entrenamiento** en los modelos weight-seed: en lugar de partir de pesos inicializados de forma independiente, continuaron el entrenamiento desde los pesos originales de Pythia con buffers del optimizador Adam incorrectos. Por tanto, estos checkpoints **no deben utilizarse como ablacion de inicializacion de pesos**; EleutherAI ha publicado versiones corregidas en `pythia-160m-weight-seed2-corrected`.

El modelo es relevante principalmente como objeto de estudio para investigacion sobre dinamica de entrenamiento, outliers en activaciones y reproducibilidad, no como modelo de produccion. Su tamano reducido (12 capas, 768 dimensiones, 12 cabezas de atencion) y su contexto de 2048 tokens lo sitúan en la categoria de modelos pequenos de investigacion, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-NeoX) |
| Parametros totales | 160M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en fp16; compatible con cuantizacion estandar via transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / pytorch (repo de 58,1 GB por los 154 checkpoints en ramas Git) |
| Capas | 12 |
| Dimension del modelo | 768 |
| Cabezas de atencion | 12 |
| Tokens de entrenamiento | 300B (The Pile) |
| Checkpoints intermedios | 154 (ramas Git: step0, step1...step143000) |
| Dataset | EleutherAI/pile, EleutherAI/pile-preshuffled-seeds |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-NeoX: un transformer decoder-only con atencion causal estandar, normalizacion por capas y embeddings rotatorios, en la configuracion de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion. Se entreno sobre 300B tokens de The Pile, el mismo corpus y regimen que los Pythia originales, con ordenacion de datos pre-barajada especifica por semilla (ficheros `.idx` publicados en `EleutherAI/pile-preshuffled-seeds`).

La innovacion metodologica de PolyPythias no esta en la arquitectura sino en el diseno experimental: 154 checkpoints intermedios por ejecucion (10 log-espaciados en la fase temprana y 143 equiespaciados hasta los 300B tokens) permiten trazar la evolucion de metricas, outliers y estabilidad a lo largo del entrenamiento. En el caso concreto de este checkpoint weight-seed, el entrenamiento partio de los pesos de Pythia con buffers de Adam incorrectos, lo que invalida el proposito de ablacion de inicializacion; los checkpoints corregidos estan disponibles por separado. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto causal en ingles (continuacion de prompt, muestreo y decodificacion greedy).
- Modelado de lenguaje base: util para extraer representaciones y perplejidad en investigacion.
- Checkpoints intermedios accesibles por revision Git para estudiar trayectorias de entrenamiento.
- No dispone de tool calling ni function calling documentado.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues limitadas practicamente al ingles.
- No incluye modo thinking, vision ni audio.
- No esta alineado con instrucciones (no es instruct-tuned).

## Casos de uso

- **Investigacion sobre estabilidad del entrenamiento**: comparar curvas de perdida y outliers entre semillas y checkpoints intermedios para identificar fases de inestabilidad, aprovechando los 154 checkpoints disponibles por rama.
- **Estudios de reproducibilidad**: replicar exactamente el orden de datos con los ficheros `.idx` de `pile-preshuffled-seeds` y verificar la reproducibilidad bit a bit del regimen de entrenamiento.
- **Analisis de inicializacion de pesos**: usar la version corregida (`pythia-160m-weight-seed2-corrected`) como control frente a las variantes data-seed para aislar el efecto de la init; este checkpoint concreto no es valido para ese proposito.
- **Benchmarking de tecnicas de interpretabilidad**: al ser un modelo pequeno con checkpoints densos, sirve para probar sondas, analisis de activaciones y deteccion de circuitos a bajo coste computacional.
- **Prototipado rapido de pipelines de generacion**: validar integraciones con `transformers`, TGI o endpoints compatibles en un modelo de 160M antes de escalar a modelos mayores.
- **Educacion y docencia**: ilustrar el ciclo completo de preentrenamiento, evaluacion y analisis de checkpoints con un modelo que cabe en una unica GPU consumer.
- **Ablaciones controladas de datos**: combinado con las variantes `data-seed`, estudiar como el orden de los datos afecta a las metricas finales con pesos fijos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 0,4-0,6 GB para los pesos (160M parametros x 2 bytes), mas overhead de activaciones y cache KV.
- En cuantizacion de 8 bits: en torno a 0,2 GB; en 4 bits, en torno a 0,1 GB (estimaciones teoricas, no documentadas por el autor).
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para inferencia interactiva.
- Despliegue posible con `transformers` (GPTNeoXForCausalLM), text-generation-inference (TGI), llama.cpp (previa conversion a GGUF) y Ollama (previa conversion).
- Throughput y latencia no documentados; por tamano, se espera decodificacion muy rapida en GPU moderna, pero no hay cifras publicadas.
- Nota: el repo pesa 58,1 GB por los 154 checkpoints en ramas; descargar solo la revision necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| pythia-160m-weight-seed2 (este) | 160M | 2048 | 300B tokens, The Pile | Apache 2.0 | Investigacion (weight-seed, con error) |
| pythia-160m (original) | 160M | 2048 | 300B tokens, The Pile | Apache 2.0 | Modelo base de referencia |
| pythia-160m-seed1..9 | 160M | 2048 | 300B tokens, The Pile | Apache 2.0 | Variantes de semilla para reproducibilidad |
| pythia-160m-data-seed1..3 | 160M | 2048 | 300B tokens, The Pile | Apache 2.0 | Ablacion de orden de datos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- **Error de entrenamiento documentado**: los modelos weight-seed no varian la inicializacion de pesos como se pretendia; no deben usarse como ablacion de init. Usar la version `-corrected` para ese fin.
- Modelo base sin alineacion: no sigue instrucciones y puede generar contenido sesgado, toxico o factualmente incorrecto.
- Riesgo elevado de alucinacion en tareas de conocimiento factual por su tamano reducido.
- Ventana de contexto limitada a 2048 tokens.
- Entrenado practicamente solo en ingles; rendimiento pobre en otros idiomas.
- No dispone de tool calling ni capacidades de agente.
- Aunque la licencia es Apache 2.0 (permite uso comercial), su valor practico en produccion es limitado; esta pensado para investigacion.
- El repositorio es muy pesado (58,1 GB) por los checkpoints en ramas; conviene descargar revisiones concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EleutherAI/pythia-160m-weight-seed2
- Version corregida: https://huggingface.co/EleutherAI/pythia-160m-weight-seed2-corrected
- Paper PolyPythias (ICLR 2025): https://arxiv.org/abs/2503.09543
- Dataset de ordenes de datos: https://huggingface.co/datasets/EleutherAI/pile-preshuffled-seeds
- Dataset The Pile: https://huggingface.co/datasets/EleutherAI/pile
- Repositorio Pythia: https://github.com/EleutherAI/pythia
- Coleccion PolyPythias: https://huggingface.co/collections/EleutherAI/polypythias
- The Pile: https://pile.eleuther.ai/
