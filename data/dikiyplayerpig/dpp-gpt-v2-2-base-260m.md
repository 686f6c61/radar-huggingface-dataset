# dikiyplayerpig/dpp-gpt-V2.2-base-260m

## Resumen

dpp-gpt V2.2 Base (260M) es un modelo de lenguaje de 242 millones de parámetros únicos (259M contando el embedding de salida, que comparte pesos con el de entrada) entrenado íntegramente desde cero por un único desarrollador, identificado en HuggingFace como `dikiyplayerpig`, sobre una sola GPU de consumo RTX 4060. Sigue una arquitectura de estilo Llama (RMSNorm, RoPE, SwiGLU, GQA con 4 cabezas KV) con 20 capas, dimensión oculta de 1024 y un vocabulario BPE propio de 16.384 tokens. Soporta ruso, inglés y francés, con una ventana de contexto de 8.192 tokens.

Se trata de un modelo **base**: solo ha pasado por preentrenamiento, sin ajuste de instrucciones ni de diálogo. Continúa texto libre y, gracias a que parte de los datos de preentrenamiento ya venían en formato ChatML, reproduce habilidades concretas inyectadas de forma sintética (aritmética descompuesta, deletreo, conteo de letras, traducción) cuando se le interroga con esa plantilla. El autor publica además una variante orientada a conversación, `dpp-gpt-V2.2-Pro-preview-260m`.

Su relevancia es fundamentalmente metodológica: demuestra que un ciclo completo de preentrenamiento de ~31.000 millones de tokens, con mezcla de datos deliberadamente diseñada, es viable en hardware de gama media y con licencia Apache 2.0. No obstante, sus capacidades son muy limitadas frente a modelos pequeños de laboratorios consolidados: no hay benchmarks estándar publicados, solo pruebas propias del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RMSNorm, RoPE, SwiGLU, GQA) |
| Parametros totales | 259M declarados por el autor; 242.263.040 únicos en safetensors (embeddings de entrada y salida atados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (ampliado desde 4.096 en la versión 2.1) |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | Ruso (ru), inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`LlamaForCausalLM`), GGUF y PyTorch `.pth` (solo pesos) |

Detalles estructurales adicionales: 20 capas, `hidden_size` 1024, 16 cabezas de atención y 4 cabezas KV (GQA), vocabulario de 16.384 tokens con tokenizador BPE propio, tamaño del repositorio 2,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con las decisiones de diseño habituales de la familia Llama: normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con consultas agrupadas (GQA) que reduce las cabezas KV a 4 frente a las 16 de consulta. El vocabulario es un BPE propio de 16.384 entradas, más pequeño de lo habitual, lo que abarata el embedding pero penaliza la eficiencia de tokenización en lenguas no representadas.

El entrenamiento consiste en un preentrenamiento continuado sobre la versión 2.1 Base: se añadieron aproximadamente 19.000 millones de tokens a los 11.800 millones previos, alcanzando unos 31.000 millones en total (59.090 pasos de 524.000 tokens cada uno, es decir, unas 119 tokens por parámetro). La mezcla declarada es: Wikipedia ru/en/fr 24 %, CulturaX ru/en/fr 14 %, Python 16 %, código web 5 %, Cosmopedia 5 %, Zyda-2 5 %, poesía 4 %, hechos 5 %, traducciones 5 %, datos sintéticos de habilidades textuales (deletreo letra a letra, análisis de palabras, mayúsculas) 7 %, textos sobre código generados por un modelo 1 % y matemáticas 15 % repartidas en 9 ficheros generados (operaciones básicas, multiplicación y división, cadenas y paréntesis, ecuaciones ax+b=c y ax=b, fracciones y decimales, resultados negativos, tareas lógicas con comparaciones y secuencias, números de hasta 40 dígitos y conteo hasta mil). El pico de learning rate fue 0,0001, con decaimiento lineal hasta 0,000003 en los últimos 1.485 pasos; la pérdida bajó de 1,320 a 1,298 durante ese decaimiento, y se reporta 1,95 nats por token (0,83 bits por byte) sobre Wikipedia. No se menciona ningún proceso de RLHF, DPO ni ajuste por preferencias: es un modelo estrictamente base.

## Capacidades

- Continuación de texto libre en ruso, inglés y francés sin necesidad de etiquetas de plantilla.
- Aritmética descompuesta paso a paso: sumas, restas, multiplicaciones, divisiones, cadenas con paréntesis, ecuaciones lineales, fracciones, decimales y números de hasta 40 dígitos, siempre que se solicite con el formato ChatML empleado en el preentrenamiento.
- Habilidades de manipulación de cadenas inyectadas sintéticamente: deletreo letra a letra, ensamblado de palabras, conteo de apariciones de una letra y transformaciones a mayúsculas.
- Traducción entre los tres idiomas soportados cuando se formula como instrucción en formato ChatML.
- Conteo numérico hasta mil.
- Tareas lógicas simples: comparaciones encadenadas del tipo a<b<c, continuación de secuencias, sustitución y repetición.
- Generación de código Python y texto sobre código, fruto del 16 % de Python y el 5 % de código web en la mezcla.
- Soporte de *tool calling*: no disponible.
- Soporte de agentes o razonamiento multi-paso general: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo *thinking*: no es un modo real de razonamiento; existe un token literal `[THINK]` frente a `[NOTHINK]` en la plantilla, heredado del formato de los datos de entrenamiento.

## Casos de uso

- **Investigación sobre preentrenamiento de bajo presupuesto**: sirve como referencia reproducible de un pipeline completo (tokenizador propio, mezcla de datos, decaimiento de LR, conversión a GGUF) ejecutado en una RTX 4060. Adecuado para estudiar el efecto del decaimiento de learning rate, que el autor documenta explícitamente.
- **Generación de texto en ruso con restricciones de recursos**: con cuantización Q4_K_M ocupa del orden de 150 MB, por lo que puede desplegarse en dispositivos de borde, Raspberry Pi o navegador vía WebAssembly sin infraestructura GPU.
- **Prototipado de tareas aritméticas descompuestas**: útil para experimentar con formatos de razonamiento paso a paso en un modelo diminuto, aunque su precisión del 47,6 % en las pruebas del autor lo desaconseja para producción real.
- **Generación de código Python en entornos de prueba**: puede completar fragmentos y funciones sencillas; encaja en tareas de autocompletado offline o generación de snippets en herramientas internas, no en pipelines de CI/CD críticos.
- **Traducción ru/en/fr de bajo coste y gran volumen**: el autor reporta un 88,6 % de calidad según un juez automático (Gemma 4 E4B) en su propio conjunto de prueba; asumible para preprocesamiento masivo o filtrado de corpus donde los errores se toleran.
- **Generación de datos sintéticos y aumento de corpus**: al ser un modelo base, puede emplearse para producir texto de relleno, variaciones léxicas o datos de entrenamiento para modelos mayores en los tres idiomas soportados.
- **Educación y demostraciones de mecánica de transformers**: su tamaño permite ejecutar atención y muestreo en tiempo real en un portátil, lo que lo hace didáctico para explicar GQA, RoPE o decodificación greedy.

## Benchmarks y rendimiento

El autor solo publica pruebas propias, no benchmarks estándar (MMLU, HumanEval, GSM8K u otros). No se han publicado resultados de benchmarks en la información disponible.

| Prueba (autor) | Resultado | Notas |
|---|---|---|
| Aritmética | 47,6 % | 2.200 tareas generadas, 25 tipos, ru/en/fr, números hasta 10^40; 44,2 % antes del decaimiento de LR; un checkpoint de control 1.500 pasos anterior dio 44,1 % |
| Habilidades con letras | 80,6 % | 960 tareas: deletreo, ensamblado de palabras, conteo de letras |
| Traducción ru/en/fr | 88,6 % | Evaluado con el juez automático Gemma 4 E4B |

Advertencia del propio autor: el conjunto de aritmética usa los mismos generadores que los datos de preentrenamiento (con números nuevos), por lo que mide la asimilación de esos formatos, no capacidad matemática general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP16, 0,25 GB en Q8_0 y 0,15 GB en Q4_K_M, para los 242M parámetros únicos más el contexto.
- GPU recomendadas: cualquier GPU con 1 GB o más de VRAM es suficiente; una RTX 4090 o A100 quedan enormemente sobredimensionadas. El propio autor entrenó el modelo en una RTX 4060.
- Cabe holgadamente en GPU de consumo: GTX 1050 Ti, RTX 3050, RTX 4060, e incluso en iGPU con memoria unificada.
- Despliegue: `transformers` con `LlamaForCausalLM` sobre safetensors, `llama.cpp` u Ollama con los ficheros GGUF, y vLLM/TGI por compatibilidad con la arquitectura Llama (no verificado explícitamente por el autor).
- Latencia y throughput: no disponibles como cifras medidas. Por tamaño, la generación en Q4_K_M sobre CPU moderna debería ser interactiva, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Benchmarks estándar |
|---|---|---|---|---|---|
| dpp-gpt V2.2 Base 260M | 242M únicos / 259M | 8.192 | Apache 2.0 | ru, en, fr | no publicados |
| Qwen2.5-0.5B | ~494M | 32.768 | Apache 2.0 | multilingüe amplio | publicados por el autor |
| SmolLM2-360M | ~362M | 8.192 | Apache 2.0 | principalmente inglés | publicados por el autor |
| Llama 3.2 1B | ~1.240M | 131.072 | Licencia comunitaria Llama 3.2 | multilingüe | publicados por el autor |

La comparación de rendimiento con estas alternativas no está disponible: dpp-gpt V2.2 no ha sido evaluado en ningún benchmark estándar, y sus pruebas propias no son trasladables. En términos de encaje, compite en la franja de modelos sub-500M, donde Qwen2.5-0.5B y SmolLM2-360M ofrecen tokenizadores más eficientes, contexto mayor o igual y, sobre todo, evaluación pública verificable. La ventaja diferencial de dpp-gpt es su cobertura nativa del ruso, ausente o marginal en SmolLM2.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de diálogo. No mantiene conversaciones multi-turno; para ello el autor remite a la variante Pro/preview.
- Las habilidades aparentes (aritmética, deletreo, traducción) dependen críticamente de la plantilla ChatML con `[NOTHINK]` o `[THINK]`. Fuera de ese formato, el rendimiento cae y el modelo solo continúa texto.
- Precisión aritmética del 47,6 % en las propias pruebas del autor: insuficiente para cualquier uso donde los cálculos deban ser correctos.
- No hay alineación de seguridad, RLHF ni filtrado post-entrenamiento; puede generar contenido sesgado, tóxico o factualmente falso. El riesgo de alucinación es alto por la escala del modelo y por el peso de datos sintéticos en la mezcla.
- Idiomas: solo ruso, inglés y francés. El español no está soportado y el tokenizador BPE propio de 16.384 entradas lo penalizará especialmente, con una fertilidad alta y resultados pobres.
- Ventana de contexto de 8.192 tokens ampliada desde 4.096; no hay evaluación publicada de la calidad de la atención en las posiciones lejanas tras esa extensión.
- El modelo fue entrenado por una sola persona en una RTX 4060 con 31.000 millones de tokens (≈119 tokens por parámetro), muy por debajo de lo habitual en modelos de referencia; la profundidad de conocimiento factual es limitada.
- Los datos de entrenamiento (CulturaX, Zyda-2, Cosmopedia, Wikipedia) conllevan los sesgos propios de corpus web; no se documenta ningún proceso de deduplicación o filtrado de toxicidad.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero no hay garantía alguna de idoneidad; el repositorio es de octubre de 2026 y acumula 0 descargas y 0 likes, sin validación externa.
- El tokenizador propio implica que herramientas ajustadas a tokenizadores Llama estándar (conteo de tokens, plantillas predefinidas, algunos pipelines de evaluación) no funcionarán directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-base-260m
- Versión de conversación (Pro preview): https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.2-Pro-preview-260m
- Versión anterior 2.1 Base: https://huggingface.co/dikiyplayerpig/dpp-gpt-V2.1-base-260m
- Paper, blog o repositorio adicionales: no disponible en la información proporcionada.
