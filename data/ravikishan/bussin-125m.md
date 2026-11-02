# Ravikishan/bussin-125m

## Resumen

bussin-125m es un modelo de lenguaje de 125,9 millones de parámetros entrenado desde cero por el desarrollador independiente Ravikishan con recursos gratuitos (GPU T4 de Kaggle). Su propósito no es competir en calidad de generación, sino investigar el control de *registro* lingüístico: la capacidad de generar texto con un nivel especificado de jerga, emojis, abreviaturas, alargamiento vocálico y formalidad. Para ello antepone a cada documento de entrenamiento cinco tokens de control medidos, de modo que el modelo aprende la distribución condicional p(texto | registro).

Arquitectónicamente es un decoder estilo Llama con 14 capas, dimensión 768, 12 cabezas de atención con 4 cabezas KV (GQA), FFN SwiGLU de 2048, RoPE con theta 10.000, RMSNorm, embeddings atados y un vocabulario propio de 49.152 tokens BPE a nivel de byte. La longitud de contexto es de solo 1.024 tokens.

Es relevante como pieza de investigación reproducible sobre condicionamiento de estilo con modelos pequeños, pero no es un modelo apto para producción: no está alineado con instrucciones, no tiene ajuste de seguridad, su calidad de texto es deficiente y su licencia es exclusivamente de investigación. El checkpoint publicado arrastra además el historial de una primera fase de entrenamiento con la función de pérdida mal especificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (LlamaForCausalLM) |
| Parámetros totales | 125.851.392 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (con una pequeña cantidad de hinglish) |
| Licencia | research-only (campo `license: other`) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama: 14 capas de decoder, d_model de 768, 12 cabezas de atención con 4 cabezas KV (GQA), FFN SwiGLU de dimensión 2048, RoPE con theta 10.000, RMSNorm, embeddings atados y vocabulario de 49.152 tokens con BPE a nivel de byte propio. El export se validó contra la implementación original con una diferencia máxima de logits de 3,6e-05 y un 100 % de coincidencia en argmax.

El entrenamiento se hizo desde cero en T4 de Kaggle, en dos fases. La primera (v1) supuso 25.757 pasos y 6,74B tokens (unas 110 GPU-horas), pero un error en la función de pérdida desplazó los objetivos: el modelo aprendía a predecir el token dos posiciones por delante en lugar del siguiente (NLL de 8,76 frente a 5,40 en +2). La segunda fase (realign) partió de esos pesos y entrenó 4.067 pasos y 1,07B tokens con la pérdida corregida, siguiendo el currículo de datos por etapas del proyecto (S2 y S3); este es el checkpoint publicado. La pérdida de validación en un shard general retenido es de 3,741 en el paso 3.314 y 3,748 en el 4.067, sin mejora medible en los últimos 750 pasos. La innovación técnica central es el condicionamiento por registro mediante cinco tokens de control (`slang_0..4`, `emoji_0..3`, `abbrev_0..3`, `elong_0..2`, `formal_0..3`) delimitados por `<|reg|>` y `<|/reg|>`, con etiquetas generadas por un anotador determinista y un léxico de jerga fechado, no por evaluadores humanos.

## Capacidades

- Generación de texto en inglés condicionada por cinco dimensiones de registro: nivel de jerga (0-4), densidad de emojis (0-3), uso de abreviaturas (0-3), alargamiento vocálico (0-2) y formalidad (0-3).
- Control de estilo medible: la calibración de registro (RCE) muestra un error absoluto medio de 0,146 frente a 0,646 del control aleatorio.
- Barridos de una sola dimensión funcionales: jerga de 0 a 3 medido de 0,00 a 2,88; emojis de 0 a 2 medido de 0,00 a 2,00; abreviaturas de 0 a 3 medido de 0,00 a 2,40; alargamiento de 0 a 2 medido de 0,00 a 1,80; formalidad de 0 a 3 medido de 0,02 a 2,62.
- Generación de texto libre con decodificación por muestreo (temperatura, top-k, top-p).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de pensamiento, visión ni audio.
- Capacidad multilingüe prácticamente nula: inglés y trazas de hinglish.

## Casos de uso

- Investigación sobre condicionamiento de estilo: reproducir el experimento de prefijos de registro y analizar cómo un modelo de 125M responde a variables de estilo controladas, usando el pipeline y los resultados publicados en el repositorio de GitHub.
- Generación de datos sintéticos con estilo controlado: producir muestras etiquetadas por nivel de jerga, emojis o formalidad para aumentar corpus de clasificadores de registro, aceptando la baja fluidez a cambio de control explícito.
- Evaluación de anotadores automáticos: comparar las etiquetas del anotador determinista del proyecto con las salidas del modelo y con juicio humano para medir el ruido del instrumento (el autor reporta Spearman 0,48 frente a un umbral de 0,70).
- Docencia y divulgación sobre entrenamiento desde cero: ilustrar el impacto de un error en la función de pérdida (predicción a +2 en lugar de +1), el coste real de un modelo pequeño (110 GPU-horas en T4) y la diferencia entre pérdida de validación y calidad percibida.
- Estudio de sesgos y toxicidad en corpus de internet: analizar cómo un modelo sin ajuste de seguridad reproduce insultos y artefactos de bots de Reddit presentes en los datos, en un entorno de investigación controlado.
- Pruebas de infraestructura de despliegue: validar pipelines de inferencia con transformers y text-generation-inference sobre un checkpoint pequeño y de contexto corto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que no midió toxicidad, factualidad ni ningún benchmark downstream, y que su propio BussBench solo tiene datos para 3 de 15 tareas previstas, con problemas de etiquetado conocidos, por lo que no reporta puntuación.

La única evaluación publicada es la calibración de registro (RCE), con 200 peticiones estratificadas por nivel de jerga y presencia de emojis, generando 48 tokens desde el prefijo y midiendo la salida con el anotador:

| Dimensión | Modelo | Control aleatorio | Texto real del mismo documento |
|---|---|---|---|
| Jerga | 0,335 | 1,255 | 0,915 |
| Emojis | 0,150 | 0,930 | 0,565 |
| Abreviaturas | 0,015 | 0,065 | 0,100 |
| Alargamiento | 0,115 | 0,525 | 0,430 |
| Formalidad | 0,115 | 0,455 | 0,320 |
| **Global** | **0,146** | **0,646** | **0,466** |

El propio autor advierte que el anotador puntúa sus propias etiquetas de entrenamiento, que solo 21 de 200 peticiones tenían jerga alta (nivel 3-4), que 193 de 200 tenían nivel 0 de abreviaturas, y que se trata de un único checkpoint, un único conjunto de semillas y temperatura 0,8.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,5 GB de pesos (tamaño del repo); en fp16, aproximadamente 0,25 GB. Con overhead de activaciones y caché KV para 1.024 tokens, cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. Funciona en T4, RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documenta soporte de GGUF, llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponible. El contexto de 1.024 tokens y el tamaño del modelo sugieren latencias muy bajas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bussin-125m | 125,9M | 1.024 | Condicionamiento por registro de estilo | research-only | HuggingFace |
| GPT-2 small | 124M | 1.024 | Generación de texto generalista | MIT | HuggingFace |
| SmolLM-135M | 135M | 2.048 | Modelo pequeño alineado con instrucciones | Apache 2.0 | HuggingFace |
| Pythia-160M | 160M | 2.048 | Investigación sobre entrenamiento y sesgos | Apache 2.0 | HuggingFace |

La comparación de rendimiento con estas alternativas no está disponible: no hay benchmarks comunes publicados para bussin-125m. La diferencia principal es funcional y de licencia: los tres modelos comparables ofrecen licencias permisivas para uso comercial, mientras que bussin-125m restringe el uso a investigación y no está alineado con instrucciones.

## Limitaciones y advertencias

- Calidad de texto deficiente: las muestras divagan, repiten líneas y contienen ensalada de palabras. Con 125M parámetros y unos 1B tokens en la fase final no se alcanza fluidez.
- Puede producir contenido tóxico: el autor leyó muestras en la condición de jerga muy alta con acusaciones infundadas contra una persona e insultos groseros. La toxicidad nunca se midió y no hay ajuste de seguridad.
- Artefactos de los datos de entrenamiento: el filtro no eliminó cierto texto de bots de Reddit, que el modelo reproduce.
- Procedencia del léxico: buena parte de la jerga proviene del inglés afroamericano; el léxico está fechado y contiene términos cuyo significado ha derivado, y el modelo refleja esas fuentes.
- Solo inglés, con algo de hinglish; el contexto está limitado a 1.024 tokens.
- Restricción de licencia: uso exclusivamente de investigación, sin permiso para uso comercial.
- El checkpoint publicado arrastra una primera fase entrenada con objetivos desplazados a +2; la pérdida de validación se estancó en los últimos 750 pasos de la fase de realineamiento.
- La evaluación se basa en un anotador que puntúa sus propias etiquetas, con acuerdo humano bajo (Spearman 0,48 frente a un umbral de 0,70), por lo que las cifras de calibración deben interpretarse como acuerdo con el instrumento, no como juicio humano.
- No apto para producción: sin alineación, sin evaluación de factualidad y sin benchmarks downstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ravikishan/bussin-125m
- Repositorio del proyecto (código, pipeline de datos, evaluación y memoria): https://github.com/Ravikisha/GenZLLM
- Resultados completos de RCE: `docs/results/rce_final-4067.txt` en el repositorio de GitHub
