# eightman999/gemma-jp-plus-e4b-it-ls2b-selective-gguf

## Resumen

Gemma JP+ E4B-it · LS2b Mix es un modelo experimental de generación de texto en japonés publicado por el usuario eightman999 en Hugging Face. Se construye sobre google/gemma-4-E4B-it, el modelo instructivo de Google DeepMind, y añade un vocabulario extendido derivado de JtokV3, embeddings procedentes de LS2b y un LoRA entrenado sobre las capas de atención. El objetivo declarado es la continuación de novelas en japonés (続き書き), un caso de uso muy específico que exige coherencia estilística y control fino de la repetición de kana.

Esta versión concreta (denominada "selective") parte de un ajuste previo del peso de salida del vocabulario adicional a escala 0,90 y sustituye tres filas del vocabulario adicional, identificadas como responsables de la repetición de kana, por los valores entrenados. El resultado se distribuye en formato GGUF para llama.cpp, junto con un LoRA en GGUF que debe aplicarse en la carga. El repositorio ocupa 6,4 GB y los pesos en safetensors del modelo base suman 8.731.393.066 parámetros.

La relevancia es acotada: se trata de un experimento de nicho, sin descargas ni likes en el momento de la ficha, orientado a quienes trabajan con generación creativa en japonés y quieren evaluar técnicas de expansión de vocabulario y LoRA sobre un modelo Gemma pequeño. No es un modelo de propósito general ni sustituye al base para tareas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: google/gemma-4-E4B-it) con vocabulario extendido y LoRA en capas de atención |
| Parametros totales | 8.731.393.066 (safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas); LoRA en GGUF |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo y LoRA), más ficheros auxiliares de tokenizer (`jtok.json`, `gemma-tokenizer.json`, `vocab.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 E4B-it de Google DeepMind, un transformer decoder-only de aproximadamente 8,7 mil millones de parámetros. Sobre esa base, el autor aplica tres modificaciones: un vocabulario adicional derivado de JtokV3, embeddings provenientes de LS2b y un LoRA entrenado específicamente sobre las capas de atención. En la variante "selective" se ajusta el peso de salida del vocabulario adicional a 0,90 y se reemplazan tres filas de ese vocabulario (las asociadas a la repetición de kana) por los valores entrenados.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor indica que la evaluación se realizó sobre texto generado con el LoRA aplicado y que la segmentación de entrada para la evaluación usó JtokV3 con conversión de IDs a JP+, reproducible mediante los ficheros de tokenizer incluidos. No se documentan innovaciones de decodificación más allá del muestreo estándar (temperatura 0,7, top-k 50, repeat-penalty 1,15).

## Capacidades

- Generación de texto conversacional e instructivo en japonés, heredado del modelo base instruct.
- Continuación de ficción y novela en japonés, el caso de uso principal declarado.
- Reducción de repeticiones de kana: en la evaluación del autor, las secuencias de tres o más kana idénticas pasaron de 2/24 a 0/24.
- Seguimiento de instrucciones breves: 12/12 coincidencias exactas en la evaluación, igual que la versión anterior.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al japonés según la metadata del modelo.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Continuación de novelas y relatos en japonés: el modelo está ajustado para generar texto que prosiga un fragmento literario manteniendo estilo y personajes, con menor propensión a la repetición de kana gracias al ajuste selectivo del vocabulario.
- Generación de borradores de ficción serializada: útil para producir escenas de 256 tokens con parámetros de muestreo fijos, revisables por un editor humano.
- Experimentación con expansión de vocabulario: sirve como referencia para investigadores que quieran evaluar cómo afecta añadir vocabulario JtokV3 y embeddings LS2b a un Gemma pequeño.
- Estudio de mitigación de repeticiones: el par de versiones (0,90 frente a selective) permite comparar el efecto de sustituir filas del vocabulario en la tasa de kana repetido.
- Prototipado local en hardware de gama media: al distribuirse en GGUF y haberse evaluado en una RTX 3060, es viable para pruebas en estaciones de trabajo con GPU consumer.
- Evaluación de pipelines LoRA en llama.cpp: el flujo con `--lora` y ficheros de tokenizer auxiliares sirve para validar integraciones de LoRA en herramientas compatibles con Gemma 4.
- Docencia y demostraciones de ajuste fino: por su licencia Apache 2.0 y su tamaño moderado, puede usarse en entornos formativos sin restricciones comerciales.

## Benchmarks y rendimiento

| Metrica | Version 0.90 | Version selective |
|---|---|---|
| Secuencias de 3+ kana idénticas | 2/24 | 0/24 |
| Salidas de vocabulario adicional | 461 | 443 |
| Pérdida de predicción (27 extractos, bits/carácter) | ~4,199 | ~4,199 |
| Coincidencia exacta en instrucciones breves | 12/12 | 12/12 |

La evaluación se realizó en una RTX 3060 con 4 escenas de novela, 2 configuraciones y 3 semillas. La tasa global de repetición de 3-gramas de caracteres se mantuvo prácticamente igual entre versiones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; con 8,7 mil millones de parámetros, una cuantización Q4 requiere del orden de 5-6 GB y Q8 en torno a 9-10 GB, estimaciones orientativas no publicadas por el autor.
- GPU recomendadas: el autor evaluó en una RTX 3060, lo que confirma viabilidad en GPU consumer de gama media; para mayor throughput se recomiendan GPU con más VRAM (RTX 4090, A100, H100), aunque no hay datos publicados.
- Cabe en GPU consumer: sí, al menos en RTX 3060 según la evaluación del autor.
- Opciones de despliegue: llama.cpp (con soporte para Gemma 4 y carga de LoRA GGUF); otras herramientas no confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma JP+ E4B-it LS2b selective | ~8,7 B | no disponible | ja | Apache 2.0 | GGUF + LoRA GGUF |
| google/gemma-4-E4B-it (base) | ~8,7 B | no disponible | multilingüe | licencia Gemma (no confirmada en la información) | safetensors |
| Alternativas de ajuste japonés sobre Gemma | no disponible | no disponible | ja | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental de nicho: sin descargas ni validación comunitaria en el momento de la ficha.
- Persisten problemas de coherencia: el autor reconoce fluctuaciones en nombres de personajes y desviaciones respecto a la escena original.
- La tasa global de repetición de 3-gramas no mejora de forma apreciable; la mejora se limita a la repetición de kana.
- Evaluación muy pequeña (4 escenas, 2 configuraciones, 3 semillas) y en una sola GPU, por lo que los resultados no son concluyentes.
- Idioma restringido al japonés según la metadata; el rendimiento en otros idiomas no está documentado.
- Requiere aplicar el LoRA incluido para reproducir la evaluación; el comportamiento sin LoRA no está descrito.
- El pipeline de tokenización de evaluación difiere del usado por el CLI estándar de llama.cpp, lo que puede afectar a la reproducibilidad.
- Licencia Apache 2.0 declarada, pero el modelo base Gemma puede tener condiciones adicionales que conviene verificar antes de un uso comercial.
- Riesgo de alucinación y de contenido incoherente en generaciones largas no cuantificado.
- Longitud de contexto no documentada, lo que limita la planificación de despliegues con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eightman999/gemma-jp-plus-e4b-it-ls2b-selective-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio llama.cpp: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
