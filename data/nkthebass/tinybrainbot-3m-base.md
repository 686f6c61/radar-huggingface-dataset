# nkthebass/tinybrainbot-3m-base

## Resumen

TinyBrainBot-3M-Base es un modelo de lenguaje de 2,94 millones de parámetros entrenado desde cero por el desarrollador independiente nkthebass. Se presenta como una implementación estándar de `LlamaForCausalLM` (sin código personalizado) cuyo objetivo es explorar los límites del entrenamiento de modelos extremadamente pequeños sobre un volumen de datos desproporcionadamente grande: 5.550 millones de tokens para menos de 3 millones de parámetros, lo que supone una ratio de aproximadamente 1.885 tokens por parámetro.

El modelo aborda un problema concreto y poco habitual en el ecosistema: la aritmética de primaria expresada en lenguaje natural. El autor generó sintéticamente problemas aritméticos (sumas, restas, problemas de varios pasos, dinero, tiempo, fracciones, perímetros) con programas propios en Python, sin intervención de otro LLM, y los distribuyó en múltiples formulaciones lingüísticas. Esta decisión responde a una lección documentada en la propia model card: una versión previa entrenada con un único patrón de frase resolvía sumas con acarreo el 99 % de las veces en ese patrón pero caía a nivel de azar en otras redacciones.

Su relevancia es fundamentalmente metodológica y educativa. No compite con modelos de producción, sino que sirve como banco de pruebas reproducible de recetas de entrenamiento (WSD, GQA, tokenizador a medida) a una escala que cabe en una GPU de consumo y que se puede auditar por completo. La model card indica además que este checkpoint ha sido superado por TinyBrainBot-3M-v2-Base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (`LlamaForCausalLM`), sin código personalizado |
| Parametros totales | 2.942.928 (2,35 M no-embedding + 0,59 M embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (GGUF); Q8_0 no es posible porque el hidden size (144) no es múltiplo de 32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF F16 |
| Dimension oculta | 144 |
| Capas | 10 |
| Cabezas de atencion | 3 cabezas query de 48 dimensiones, 1 cabeza KV (GQA) |
| FFN | SwiGLU con dimensión intermedia 416 |
| Normalizacion | RMSNorm |
| Posicional | RoPE |
| Vocabulario | 4.096 tokens, BPE byte-level entrenado para el modelo (dígitos separados uno por token, espacios preservados, sin tokens desconocidos) |
| Tamano del repo | 0,0 GB (pesos F16 GGUF de 6 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con atención de consultas agrupadas (3 cabezas query frente a 1 sola cabeza KV), SwiGLU, RMSNorm y RoPE, con el embedding de entrada atado al de salida. Con 144 dimensiones ocultas y 10 capas, el modelo es deliberadamente mínimo; el tokenizador de 4.096 tokens se entrenó específicamente para él, con la particularidad de separar cada dígito en un token y preservar el espaciado exacto, lo que facilita las tareas aritméticas y de conteo.

El entrenamiento consumió 5.550 millones de tokens en dos fases: 4.720 millones de preentrenamiento y 830 millones de decaimiento final. La mezcla de preentrenamiento combina un 25 % de Q&A y hechos destilados, un 20 % de aritmética de primaria generada por programas propios, un 15 % de Cosmopedia Stanford + OpenStax, un 15 % de TinyStories, un 10 % de Cosmopedia WikiHow, un 10 % de FineWeb-Edu y un 5 % de introducciones de Wikipedia. La fase de decaimiento repondera hacia Q&A, hechos y sentido común (50 %), aritmética generada en múltiples formulaciones (35 %) y WikiHow (15 %). La receta emplea AdamW (betas 0,9/0,95, weight decay 0,1), LR pico de 4e-3 con schedule warmup-stable-decay, 131.000 tokens por paso, precisión mixta fp16 y 2 GPUs V100. El checkpoint publicado corresponde a la mejor de cuatro ramas de decaimiento exploradas desde el paso 36.000, no a una mezcla de pesos.

## Capacidades

- Generación de texto en inglés a nivel de frases cortas y simples; es un modelo base, no un modelo de chat.
- Aritmética de primaria en lenguaje natural: sumas, restas, problemas de varios pasos, agrupaciones y reparto, dinero, tiempo, medidas, área y perímetro, fracciones, patrones y conteos.
- Continuación de texto y completado de patrones narrativos sencillos (influencia de TinyStories).
- Respuesta a preguntas factuales básicas y de sentido común elemental (mezcla de Q&A y Wikipedia).
- Tokenización robusta de dígitos y espacios, útil para tareas de conteo y manipulación numérica literal.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso general, visión, audio ni modo de pensamiento.
- Multilingüismo: únicamente inglés.

## Casos de uso

- Docencia y divulgación sobre entrenamiento de LLM: el modelo permite recorrer de principio a fin el pipeline (tokenizador, mezcla de datos, schedule WSD, evaluación con lm-eval) en hardware asequible, con pesos y receta públicos.
- Investigación sobre currículos de datos sintéticos: sirve para replicar el experimento del autor sobre cómo la diversidad de formulaciones afecta a la generalización aritmética a esta escala.
- Verificación de aritmética de primaria en plantillas controladas: con entradas que sigan las formulaciones del corpus de entrenamiento, puede resolver sumas y restas con acarreo y problemas de varios pasos, útil como baseline en pruebas de robustez lingüística.
- Generación de texto de relleno para pruebas de infraestructura: su tamaño (6 MB en F16 GGUF) permite validar pipelines de despliegue con llama.cpp, LM Studio o Jan sin consumir recursos.
- Evaluación comparativa de modelos ultrapequeños: punto de referencia reproducible en el Open SLM Leaderboard para medir recetas alternativas por debajo de 3 M de parámetros.
- Pruebas de tokenización y preprocesado: su vocabulario con dígitos aislados y espacios preservados es útil para depurar pipelines que dependen del espaciado exacto.
- Experimentos de destilación o inicialización: al ser un Llama estándar, puede servir como inicialización o alumno en estudios de destilación a escala mínima.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, conjuntos de test completos, `acc_norm`, evaluados en float32 con lm-eval 0.4.13). La columna de índice de inteligencia procede del Open SLM Leaderboard.

| Modelo | Params | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| **TinyBrainBot-3M-Base** | **2,94 M** | **11,33** | 26,94 | 33,12 | 23,04 | 55,98 | **51,20** |
| *TinyBrainBot-3M-Base (acc bruta)* | | *11,55* | *26,63* | *34,72* | *18,94* | *57,73* | *50,50* |
| GPT-S3-3M | 2,97 M | 9,61 | 27,68 | 34,76 | 23,12 | 57,02 | 39,10 |
| Tokle-3M | 2,91 M | 8,91 | 27,20 | 34,85 | 23,98 | 55,01 | 40,80 |
| pulvis-v2 | 2,96 M | 8,62 | 27,93 | 31,86 | 22,78 | 56,86 | 37,40 |
| Purrence-3M | 2,99 M | 8,49 | 27,81 | 34,55 | 23,63 | 56,64 | 34,80 |

La ventaja principal del modelo se concentra en ArithMark-3 (51,20 frente a 34,80–40,80 de los competidores), mientras que en HellaSwag, ARC y PIQA queda en la banda baja del grupo. Ninguno de los resultados está verificado de forma independiente (`verified: false`).

## Requisitos de hardware

- VRAM para inferencia: menos de 100 MB en fp32; unos 6 MB en F16 GGUF. Cabe holgadamente en cualquier GPU, CPU o incluso en un móvil moderno.
- GPU recomendadas: ninguna en particular; el entrenamiento se realizó en 2× V100, pero la inferencia funciona en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en CPU.
- Cabe en GPU de consumo: sí, en todas, incluidas iGPU y dispositivos embebidos.
- Despliegue: transformers (`AutoModelForCausalLM`), llama.cpp, LM Studio y Jan mediante el GGUF F16; también es compatible con text-generation-inference y endpoints de Hugging Face según los tags del repo. No hay cuantización Q8_0 disponible por la restricción del hidden size.
- Latencia y throughput: no disponibles en la información proporcionada; a este tamaño se espera un throughput muy alto y latencia de milisegundos, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Int Index | ArithMark-3 | Licencia | Disponibilidad |
|---|--:|--:|--:|--:|---|---|
| TinyBrainBot-3M-Base | 2,94 M | 1.024 | 11,33 | 51,20 | Apache 2.0 | Hugging Face (safetensors + GGUF F16) |
| GPT-S3-3M | 2,97 M | no disponible | 9,61 | 39,10 | no disponible | Open SLM Leaderboard |
| Tokle-3M | 2,91 M | no disponible | 8,91 | 40,80 | no disponible | Open SLM Leaderboard |
| pulvis-v2 | 2,96 M | no disponible | 8,62 | 37,40 | no disponible | Open SLM Leaderboard |
| Purrence-3M | 2,99 M | no disponible | 8,49 | 34,80 | no disponible | Open SLM Leaderboard |

Los cuatro modelos comparables proceden del Open SLM Leaderboard y comparten la misma franja de tamaño; sus datos de licencia y contexto no figuran en la información disponible. La ventaja de TinyBrainBot-3M-Base es específica de la aritmética, no general.

## Limitaciones y advertencias

- Es un modelo base: no está alineado para chat, no sigue instrucciones de forma fiable y no rechaza peticiones dañinas.
- Escala mínima: la calidad del texto es muy limitada; el autor advierte que solo cabe esperar texto corto y simple y aritmética de primaria en formulaciones familiares.
- Aritmética dependiente de la redacción: el propio autor documenta que la habilidad se ata al patrón de frase y que fuera de las formulaciones vistas el rendimiento cae hacia el azar.
- Contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo inglés; no hay capacidades multilingües.
- Riesgo alto de alucinación en hechos y sentido común, esperable a esta escala.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; los datos de origen (FineWeb-Edu, Wikipedia, Cosmopedia) pueden introducir sesgos propios.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es apto para producción real por su calidad.
- Sin cuantizaciones por debajo de F16 disponibles por la restricción del hidden size (144 no es múltiplo de 32).
- Checkpoint superado por TinyBrainBot-3M-v2-Base según la propia model card; para nuevos proyectos conviene evaluar la versión v2.
- Resultados de benchmarks no verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-3m-base
- Versión sucesora: https://huggingface.co/nkthebass/tinybrainbot-3m-v2-base
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset ArithMark-3.0: https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
