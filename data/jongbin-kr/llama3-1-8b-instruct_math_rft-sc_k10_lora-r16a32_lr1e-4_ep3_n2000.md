# Jongbin-kr/llama3.1-8b-instruct_math_RFT-sc_k10_lora-r16a32_lr1e-4_ep3_n2000

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre `meta-llama/Llama-3.1-8B-Instruct` mediante rejection-sampling fine-tuning (RFT) sin etiquetas, es decir, utilizando las propias muestras del modelo como datos de entrenamiento y seleccionando las respuestas por consenso. Lo desarrolla el usuario Jongbin-kr y se publica como un experimento de autoentrenamiento orientado a mejorar el razonamiento matematico del modelo base sin recurrir a anotaciones humanas ni a un modelo verificador externo.

El adaptador se entrena sobre 2.000 problemas del split de entrenamiento de MATH (dataset `DigitalLearningGmbH/MATH-lighteval`, estratificado por nivel y con semilla 42), a partir de 10 muestras por problema generadas por el propio Llama-3.1-8B-Instruct. La seleccion concreta de esta variante es `sc` (self-consistency): se elige la primera muestra cuya respuesta final coincide con la respuesta mas frecuente entre las 10 generaciones.

Su relevancia es metodologica mas que de rendimiento: el autor compara cinco estrategias de seleccion (random, self-consistency, llm-choice, jev-noul y gold) manteniendo fijas las muestras, lo que permite aislar el efecto de la seleccion sobre la precision de los datos y sobre la exactitud final en MATH-500. En esta variante concreta, la mejora observada frente al modelo base es nula (49,2 % en ambos casos), lo que la convierte en un punto de referencia util para estudiar cuando el RFT no aporta ganancias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA sobre todas las proyecciones lineales |
| Parametros totales | 8.030 millones (modelo base Llama-3.1-8B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible en la model card (el modelo base soporta 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en bfloat16 o cuantizado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct, un transformer decoder-only de 8.030 millones de parametros con atencion causal estandar y RoPE. El entrenamiento es un SFT con LoRA de rango 16, alpha 32, dropout 0,05, aplicado a todas las proyecciones lineales, con learning rate 1e-4, scheduler coseno, warmup del 3 %, 3 epocas, batch efectivo de 32, loss solo sobre la completion, precision bf16 y semilla 42. Es una unica ejecucion por variante de seleccion.

El pipeline de datos es el nucleo del experimento: se parte de 2.000 problemas de MATH (nivel estratificado, semilla 42) y se generan 10 muestras por problema con el modelo base a temperatura 0,7 y top_p 1,0, usando el prompt `<problem>\n\nPlease reason step by step, and put your final answer within \boxed{}.`. La variante `sc` selecciona, para cada problema, la primera muestra cuya respuesta final coincide con la respuesta modal entre las 10. Con ello se obtiene un conjunto de 2.000 ejemplos con una precision de datos del 79,8 % (frente al 63,2 % de la seleccion aleatoria y el 100 % del conjunto gold de 1.761 ejemplos). No se emplea RLHF ni DPO, y no hay innovaciones arquitectonicas: el valor esta en el protocolo de seleccion de datos.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso en el dominio matematico, con formato de respuesta final en `\boxed{}`.
- Resolucion de problemas de matematicas de nivel competitivo (MATH), incluyendo algebra, geometria, teoria de numeros y conteo.
- Razonamiento multi-paso con cadenas de pensamiento explicitas, inducido por el prompt de entrenamiento.
- Generacion de codigo y capacidades generales heredadas del modelo base Llama-3.1-8B-Instruct (no evaluadas especificamente en este adaptador).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en el adaptador).
- Capacidades multilingues heredadas del modelo base; no se documenta el efecto del ajuste sobre idiomas distintos del ingles.
- No dispone de vision, audio ni modo thinking nativo.

## Casos de uso

- Investigacion sobre RFT y seleccion de datos: el adaptador sirve como artefacto reproducible para comparar estrategias de seleccion (random, sc, llm-choice, jev-noul, gold) manteniendo fijas las muestras, util para estudiar la relacion entre precision de datos y exactitud final.
- Baseline de autoentrenamiento en matematicas: al no mejorar al modelo base en MATH-500, es un control negativo adecuado para experimentos que pretendan demostrar ganancias de RFT.
- Generacion de cadenas de razonamiento matematico: el formato de entrenamiento produce soluciones paso a paso con respuesta final delimitada, aprovechable para construir datasets de razonamiento o para evaluar verificadores automaticos.
- Destilacion de datos sinteticos: las 20.000 muestras subyacentes (2.000 problemas x 10) y su seleccion por consenso pueden reutilizarse para entrenar modelos mas pequenos.
- Ajuste fino adicional sobre dominios matematicos especificos: al ser un adaptador LoRA de 0,2 GB, se puede cargar y continuar el entrenamiento con recursos modestos.
- Despliegue experimental en entornos de investigacion con vLLM o TGI combinando el adaptador con el modelo base, para reproducir los resultados publicados en MATH-500.

## Benchmarks y rendimiento

Evaluacion sobre MATH-500 (`HuggingFaceH4/MATH-500`), decodificacion greedy, verificacion con math-verify. La columna de precision de datos es la proporcion de ejemplos de SFT cuya respuesta final es correcta.

| Seleccion | Ejemplos SFT | Precision de datos (%) | Exactitud MATH-500 (%) |
|---|---|---|---|
| base (sin SFT) | - | - | 49,2 |
| random | 2000 | 63,2 | 49,0 |
| **sc (este adaptador)** | 2000 | 79,8 | 49,2 |
| llm-choice | 2000 | 72,1 | 50,6 |
| jev-noul | 2000 | 80,0 | 50,4 |
| gold | 1761 | 100,0 | 53,2 |

El autor advierte que solo hay una semilla de entrenamiento por seleccion y que las diferencias inferiores a 2-3 puntos pueden ser ruido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB.
- El adaptador LoRA en si ocupa unos 0,2 GB y se fusiona o carga junto al modelo base.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para bf16; RTX 3090/4080 o superiores para cuantizacion 4/8 bits.
- Cabe en GPU de consumo (RTX 4090, 3090, 4080) si se cuantiza el modelo base a 4 u 8 bits.
- Opciones de despliegue: transformers + PEFT (fusion del adaptador con `merge_and_unload`), vLLM, TGI y llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Llama-3.1-8B-Instruct + LoRA sc) | 8,0 B + LoRA | 128 K (heredado) | 49,2 % | Llama 3.1 Community | Hugging Face (0 descargas) |
| Llama-3.1-8B-Instruct (base) | 8,0 B | 128 K | 49,2 % | Llama 3.1 Community | Hugging Face (oficial) |
| Mismo pipeline con seleccion gold | 8,0 B + LoRA | 128 K (heredado) | 53,2 % | Llama 3.1 Community | Hugging Face (mismo autor) |
| Mismo pipeline con seleccion llm-choice | 8,0 B + LoRA | 128 K (heredado) | 50,6 % | Llama 3.1 Community | Hugging Face (mismo autor) |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo estudio.

## Limitaciones y advertencias

- No mejora al modelo base en MATH-500 (49,2 % frente a 49,2 %), pese a elevar la precision de los datos de entrenamiento al 79,8 %; el RFT con self-consistency no aporta ganancia en esta configuracion.
- Entrenado con una sola semilla por variante; las diferencias inferiores a 2-3 puntos pueden ser ruido estadistico y no deben interpretarse como mejoras reales.
- El conjunto de datos es pequeno (2.000 problemas) y exclusivamente matematico; el ajuste puede degradar capacidades generales del modelo base.
- Riesgo de alucinacion en razonamientos matematicos: el modelo puede producir cadenas de pensamiento plausibles con respuestas finales incorrectas, dado que el 20,2 % de los ejemplos de entrenamiento tienen respuesta final erronea.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad para este adaptador.
- Idiomas soportados no especificados en la model card; el entrenamiento se realizo en ingles y no hay evidencia de transferencia a otros idiomas.
- La licencia Llama 3.1 Community impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para licencia automatica), obligacion de atribucion y politicas de uso aceptable.
- Requiere descargar el modelo base `meta-llama/Llama-3.1-8B-Instruct`, sujeto a su propia aceptacion de licencia en Hugging Face.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_math_RFT-sc_k10_lora-r16a32_lr1e-4_ep3_n2000
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de evaluacion: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Libreria PEFT: https://github.com/huggingface/peft
