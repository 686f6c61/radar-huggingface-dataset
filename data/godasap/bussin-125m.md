# GodAsap/bussin-125m

## Resumen

bussin-125m es un modelo de lenguaje de 125,9 millones de parámetros entrenado desde cero por el desarrollador independiente GodAsap, orientado a una tarea poco habitual: la generación de texto condicionada por *registro* lingüístico. El modelo aprende a escribir con un nivel controlado de jerga (*slang*), emojis, abreviaturas, alargamiento de palabras y formalidad, mediante un prefijo de tokens de control que precede a cada documento de entrenamiento. Se trata de un proyecto de investigación y portafolio, entrenado con cómputo gratuito (GPUs T4 de Kaggle), no de un modelo de producción.

La arquitectura es un decoder estilo Llama (cargable como `LlamaForCausalLM`) con 14 capas, dimensión de modelo 768, 12 cabezas de atención con 4 cabezas KV (GQA), FFN SwiGLU de 2048, RoPE, RMSNorm y embeddings atados. Emplea un vocabulario propio de 49.152 tokens (BPE a nivel de byte) y una ventana de contexto de 1.024 tokens. El modelo está entrenado únicamente en inglés, con trazas menores de hinglish.

Su relevancia es acotada pero concreta: demuestra una técnica de *register conditioning* medible y reproducible sobre un modelo pequeño, con una evaluación de calibración de registro (RCE) publicada. No obstante, el propio autor advierte de que el texto generado es de baja calidad, incoherente en ocasiones y sin ajuste de seguridad ni de instrucciones. La licencia es exclusivamente de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (GQA, SwiGLU, RoPE, RMSNorm) |
| Parámetros totales | 125.851.392 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | inglés (con trazas menores de hinglish) |
| Licencia | research-only (uso exclusivo de investigación) |
| Formato de pesos | safetensors (transformers) |

Detalles adicionales de arquitectura: 14 capas, `d_model` 768, 12 cabezas de atención con 4 cabezas KV, FFN SwiGLU de 2048, RoPE con theta 10.000, embeddings atados, vocabulario de 49.152 tokens (BPE a nivel de byte personalizado).

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 14 capas con atención de consultas agrupadas (GQA), lo que reduce el coste de memoria de la caché KV frente a atención multi-cabeza completa. Usa SwiGLU en la FFN, normalización RMSNorm y codificación posicional rotatoria (RoPE) con theta 10.000. La exportación a `transformers` fue validada contra la implementación original con una diferencia máxima de logits de 3,6e-05 y un 100 % de coincidencia en argmax.

El entrenamiento se realizó íntegramente desde cero sobre GPUs T4 gratuitas de Kaggle. Cada documento de entrenamiento se prefija con cinco tokens de control de registro medidos de forma determinista: `<|slang_0..4|>`, `<|emoji_0..3|>`, `<|abbrev_0..3|>`, `<|elong_0..2|>` y `<|formal_0..3|>`, delimitados por `<|reg|>` y `<|/reg|>`. Las etiquetas provienen de un anotador determinista y un léxico de jerga fechado, no de evaluadores humanos. El historial de entrenamiento incluye un primer *run* (v1) de 25.757 pasos y 6,74B tokens (unas 110 GPU-horas) con un fallo en la función de pérdida que desplazó los objetivos dos posiciones en lugar de una; se detectó al observar una NLL de 8,76 frente a 5,40 en +2. El checkpoint publicado corresponde a un *run* de realineamiento de 4.067 pasos y 1,07B tokens, inicializado desde los pesos de v1 y con la pérdida corregida, siguiendo un currículo de datos por etapas (S2 y S3). La pérdida de validación en un *shard* general retenido es de 3,741 en el paso 3.314 y 3,748 en el 4.067, sin mejora medible en los últimos 750 pasos (ese *shard* no contiene los datos de la etapa Gen-Z).

## Capacidades

- Generación de texto en inglés condicionada por cinco dimensiones de registro: nivel de jerga, densidad de emojis, uso de abreviaturas, alargamiento de palabras y formalidad.
- Control fino del estilo mediante tokens especiales en el prefijo del *prompt* (no mediante instrucciones en lenguaje natural).
- Generación de texto libre autoregresiva con muestreo (temperatura, top-k, top-p).
- No dispone de *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo *thinking*, visión ni audio.
- No está ajustado a instrucciones ni a seguridad.
- Multilingüismo muy limitado: inglés con trazas de hinglish.

## Casos de uso

- Investigación sobre control de estilo lingüístico: el modelo sirve como banco de pruebas reproducible para estudiar *register conditioning* en modelos pequeños, con una métrica de calibración (RCE) publicada y código abierto en GitHub.
- Generación de datos sintéticos con estilo controlado: puede producir ejemplos de texto con niveles específicos de jerga o formalidad para aumentar datasets de clasificación de registro, siempre con revisión humana posterior por la baja calidad del texto.
- Experimentos académicos de alineación de estilo: útil para comparar anotadores deterministas frente a evaluadores humanos en la medición de atributos estilísticos.
- Docencia y divulgación: por su tamaño reducido y su historial de entrenamiento documentado (incluido el fallo de la función de pérdida), es un caso de estudio didáctico sobre pipeline de datos, currículo por etapas y evaluación.
- Pruebas de infraestructura de inferencia: al ser un modelo Llama-compatible de 125M, permite validar despliegues con `transformers` y TGI en entornos con recursos mínimos.
- Prototipado de sistemas de detección de jerga: las generaciones etiquetadas por nivel pueden usarse como *input* para entrenar o evaluar clasificadores de estilo, con las cautelas sobre calidad y sesgo.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Indica explícitamente que no midió toxicidad, factualidad ni ninguna tarea *downstream*, y que su propio benchmark (BussBench) solo tiene datos de 3 de 15 tareas previstas, con problemas de etiquetado conocidos, por lo que no reporta puntuación.

La única evaluación publicada es la calibración de registro (RCE), con 200 peticiones estratificadas por nivel de jerga y presencia de emojis; el modelo genera 48 tokens desde el prefijo y el anotador mide la salida. Error absoluto medio frente a la petición, con un nulo de peticiones barajadas y el error del texto real del mismo documento:

| Dimensión | Modelo | Nulo barajado | Texto real mismo documento |
|---|---|---|---|
| slang | 0,335 | 1,255 | 0,915 |
| emoji | 0,150 | 0,930 | 0,565 |
| abbrev | 0,015 | 0,065 | 0,100 |
| elong | 0,115 | 0,525 | 0,430 |
| formal | 0,115 | 0,455 | 0,320 |
| **global** | **0,146** | **0,646** | **0,466** |

Barrido de una sola dimensión (resto a 0, n=50): slang de 0 a 3 medido de 0,00 a 2,88; emoji de 0 a 2 medido de 0,00 a 2,00; abbrev de 0 a 3 medido de 0,00 a 2,40; elong de 0 a 2 medido de 0,00 a 1,80; formal de 0 a 3 medido de 0,02 a 2,62. El autor advierte de que el anotador puntúa sus propias etiquetas de entrenamiento, que su acuerdo con un evaluador humano (una sola persona) fue de Spearman 0,48 frente a un umbral de 0,70, y que hay pocas peticiones de jerga alta (21 de 200) y casi ninguna abreviatura real (193 de 200 en nivel 0). Todo con un único checkpoint, un conjunto de semillas y temperatura 0,8.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16/bf16, unos 0,25 GB. La caché KV es despreciable por el contexto de 1.024 tokens y GQA.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1060, RTX 3060, RTX 4090, e incluso en CPU con `transformers`.
- GPU recomendadas para despliegue: cualquiera con al menos 2 GB de VRAM; para lotes grandes o TGI, una T4, L4 o A10 es más que suficiente.
- Opciones de despliegue: `transformers` (soporte nativo, `LlamaForCausalLM`), TGI (el modelo declara `text-generation-inference` y `endpoints_compatible` en sus etiquetas). No hay GGUF publicado, por lo que `llama.cpp` y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera una latencia de milisegundos por token en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| bussin-125m | 125,9M | 1.024 | research-only | Register conditioning (jerga/estilo) |
| GPT-2 small | 124M | 1.024 | MIT | Generación de texto general |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Generación de texto general |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Generación de texto general |

La comparación es orientativa por tamaño. Frente a GPT-2 small y SmolLM-135M, bussin-125m no compite en calidad de texto general ni en benchmarks estándar, sino en el control explícito de registro estilístico mediante tokens. Su licencia research-only restringe el uso comercial, a diferencia de las alternativas citadas. No se dispone de datos de benchmarks comparativos publicados para establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Calidad de texto pobre: las muestras divagan, repiten líneas y contienen ensalada de palabras; 125M de parámetros y unos 1B tokens en la fase final no producen un modelo fluido.
- Puede generar contenido tóxico: el autor documenta acusaciones infundadas contra personas e insultos soeces en la condición de jerga alta. La toxicidad no se midió y no hay ajuste de seguridad.
- Artefactos de datos: el filtro de entrenamiento dejó pasar texto de bots de Reddit que el modelo reproduce.
- Procedencia del léxico: buena parte de la jerga proviene del inglés afroamericano; el léxico está fechado y contiene términos cuyo significado ha derivado, y el modelo refleja esas fuentes.
- Solo inglés, con algo de hinglish; sin capacidades multilingües reales.
- El checkpoint arrastra el historial de una primera fase con la función de pérdida mal especificada; la validación no muestra mejora en los últimos 750 pasos del *run* de realineamiento.
- La evaluación de registro mide acuerdo con el propio anotador determinista, no con juicio humano (Spearman 0,48 frente al umbral de 0,70 fijado por el autor).
- Licencia research-only: no apta para uso comercial. Las licencias de las fuentes de datos son mixtas y no han pasado revisión legal.
- Sin ajuste a instrucciones: no debe usarse como asistente conversacional ni en producción orientada a usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GodAsap/bussin-125m
- Repositorio GitHub (código, pipeline de datos, evaluación y write-up): https://github.com/Ravikisha/GenZLLM
- Resultados completos de RCE: `docs/results/rce_final-4067.txt` en el repositorio GitHub
- Especificación de datos y niveles de fuente: `docs/SPEC.md`, sección 1.12, en el repositorio GitHub
