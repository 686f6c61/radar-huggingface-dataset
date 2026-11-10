# d3vmeh/bdh-100m-bpe8k

## Resumen

BDH 100M BPE-8k es un modelo de lenguaje base de 109,1 millones de parámetros desarrollado por el usuario d3vmeh, construido sobre la arquitectura Dragon Hatchling (BDH) de referencia publicada por Pathway en el paper arXiv:2509.26507. Se trata de un transformer con seis capas que comparten un único conjunto de pesos, cuatro cabezas de atención, anchura residual de 512 y 16.384 neuronas activadas de forma dispersa por cabeza, entrenado con bloques de 512 posiciones. Su vocabulario es un BPE de 8.192 tokens, lo que lo distingue de su gemelo byte-level `bdh-100m-bytes`, con el que comparte receta de entrenamiento y parámetros de capas compartidas (100,7M), diferenciándose únicamente en el alfabeto y las matrices de vocabulario (8,4M frente a 0,3M).

El modelo se entrenó desde cero con 1.410 millones de tokens (unos 5,4 GB de texto), con una mezcla del 83 % de FineWeb-Edu y el 17 % de TinyStories, durante 86.000 pasos en una única RTX 4090 en 19,8 horas. Es un modelo base sin ajuste fino, orientado a investigación sobre arquitecturas eficientes en parámetros y a experimentos de memoria en contexto, no a producción.

Su relevancia actual reside en que reproduce y evalúa una arquitectura reciente (BDH) a escala pequeña con resultados medibles: 0,964 bits por carácter (bpc) en texto retenido combinado, frente a 0,988 de un transformer rotatorio equivalente, y una tasa de recuerdo top-1 de una palabra plantada en contexto del 57 % a 64 caracteres, 53 % a 128 y 33 % a 256. La densidad de neuronas activas por posición es del 11,9 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dragon Hatchling (BDH) de referencia: transformer con 6 capas que comparten un unico conjunto de pesos, 4 cabezas, anchura residual 512, 16.384 neuronas dispersas por cabeza |
| Parametros totales | 109,1M (100,7M en capas compartidas + 8,4M de vocabulario) |
| Parametros activos | no disponible (no es MoE; la dispersion es a nivel de neuronas por cabeza, con 11,9 % de densidad activa por posicion) |
| Longitud de contexto | 512 posiciones (bloque de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`bdh-100m-bpe8k.pt`); tokenizer en `bpe8k.json` |

## Arquitectura y entrenamiento

La arquitectura sigue la BDH de referencia de pathwaycom/bdh (arXiv:2509.26507): seis capas que comparten los mismos pesos, cuatro cabezas de atención, anchura residual de 512 y 16.384 neuronas activadas de forma dispersa por cabeza, con una densidad media de activación del 11,9 % por posición. El modelo opera sobre un vocabulario BPE de 8.192 tokens construido con la librería `tokenizers` de Hugging Face a partir del mismo corpus de entrenamiento. El bloque de entrenamiento es de 512 posiciones y no se arrastra estado entre bloques.

El entrenamiento utilizó 1.410 millones de tokens (aproximadamente 5,4 GB), con una composición del 83 % FineWeb-Edu y el 17 % TinyStories (split de entrenamiento). Se ejecutaron 86.000 pasos de 32 secuencias (16.384 tokens por paso) con AdamW, weight decay 0,1, learning rate de 1e-3 a 1e-4 con schedule coseno y 1.500 pasos de warmup, dropout 0,1 y autocast en bf16. Todo el entrenamiento se realizó en una única RTX 4090 durante 19,8 horas con una sola semilla. No se documenta RLHF, DPO ni ningún tipo de ajuste posterior: es un modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre contextos de hasta 512 posiciones.
- Modelado de lenguaje a nivel de subpalabra con vocabulario BPE de 8.192 tokens.
- Memoria en contexto: almacena un hecho plantado previamente en el contexto y lo recupera sin ajuste fino (recuerdo top-1 del 57 % a 64 caracteres, 53 % a 128 y 33 % a 256).
- Razonamiento y conocimiento factual muy limitados por escala y volumen de datos; no se documentan capacidades de codigo, matematicas ni vision.
- Sin soporte documentado de tool calling, function calling ni comportamiento agentico.
- Sin modo thinking, vision, audio ni capacidades multimodales.
- Multilingue: no; solo ingles.

## Casos de uso

- Investigacion sobre arquitecturas con pesos compartidos: permite reproducir y comparar la BDH de referencia frente a transformers convencionales con un coste de entrenamiento de menos de 20 horas en una GPU de consumo.
- Experimentos de memoria en contexto: el modelo sirve para estudiar como un modelo pequeno retiene y recupera informacion plantada en el contexto a distintas distancias (64, 128 y 256 caracteres).
- Comparativa de tokenizacion: al existir un gemelo byte-level entrenado con la misma receta, permite aislar el efecto del vocabulario BPE frente al byte-level en calidad y eficiencia.
- Generacion de texto creativo breve en ingles: con 0,592 bpc en TinyStories, es adecuado para generar narrativas cortas y simples en tareas de demostracion o docencia.
- Prototipado educativo: su tamano (0,4 GB de repo, 109M de parametros) permite ejecutarlo y modificarlo en portatiles con GPU modesta para ensenar fundamentos de entrenamiento de LLM.
- Evaluacion de tecnicas de decodificacion y muestreo: el script `chat_stream.py` con `RAW=1` facilita experimentos controlados de generacion sobre un modelo base pequeno.
- Analisis de eficiencia de activacion dispersa: la densidad del 11,9 % de neuronas activas por posicion lo hace util para estudiar tecnicas de sparsity en inferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card: bits por caracter (bpc) sobre 3 MB de texto retenido (parte del shard 013 de FineWeb-Edu y el split de validacion de TinyStories), evaluado en bloques de 512 posiciones.

| Texto | bpc |
|---|---|
| FineWeb-Edu (parte retenida) | 1,039 |
| TinyStories (validacion) | 0,592 |
| Combinado | 0,964 |

| Modelo | bpc combinado |
|---|---|
| BDH 100M BPE-8k | 0,964 |
| BDH 100M byte-level (gemelo) | 1,042 |
| Transformer rotatorio equivalente | 0,988 |

Ademas, la model card reporta recuerdo top-1 de una palabra plantada en contexto (30 ensayos por punto): 57 % a 64 caracteres, 53 % a 128 y 33 % a 256. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (109M de parametros, aproximadamente 0,44 GB en fp32); el repo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el entrenamiento se realizo en una RTX 4090.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: el modelo se carga con PyTorch y el codigo `bdh.py` del repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La generacion se realiza con `chat_stream.py` con `RAW=1`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | bpc combinado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BDH 100M BPE-8k | 109,1M | 512 | 0,964 | MIT | Hugging Face |
| BDH 100M byte-level | 100,7M + 0,3M vocabulario | 512 | 1,042 | MIT | Hugging Face |
| Transformer rotatorio equivalente | no disponible | no disponible | 0,988 | no disponible | no disponible |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de otras alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo pequeno entrenado con solo 5,4 GB de texto: conocimiento factual y capacidad de razonamiento muy limitados.
- El vocabulario se construyo a partir del corpus de entrenamiento, lo que puede favorecer ligeramente al modelo en texto del mismo tipo.
- Solo se probo un tamano de vocabulario y una unica semilla de entrenamiento, lo que limita la robustez de las conclusiones.
- Contexto maximo de 512 posiciones, insuficiente para la mayoria de aplicaciones de produccion con documentos largos.
- Solo ingles; no hay soporte multilingue.
- Riesgo de alucinacion alto por escala y por ser un modelo base sin ajuste instructivo.
- No se documentan sesgos especificos, pero al entrenarse sobre FineWeb-Edu y TinyStories hereda los sesgos de esas fuentes.
- Licencia MIT: permite uso comercial, pero al ser un modelo base sin ajuste, su utilidad directa en produccion es muy limitada.
- No se documenta soporte en frameworks de inferencia estandar (vLLM, llama.cpp, Ollama, TGI), lo que complica el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/d3vmeh/bdh-100m-bpe8k
- Repositorio de codigo: https://github.com/d3vmeh/small-dragon-hatchling
- Paper (DOI, CC BY 4.0): https://doi.org/10.5281/zenodo.23325933
- Paper de la arquitectura BDH de referencia: arXiv:2509.26507
- Repositorio de la arquitectura de referencia: https://github.com/pathwaycom/bdh
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
