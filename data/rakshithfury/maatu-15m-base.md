# RakshithFury/Maatu-15m-base

## Resumen

Maatu 15M Base es un modelo de lenguaje de 15.040.622 parámetros entrenado desde inicialización aleatoria para el idioma kannada (kn). Lo desarrolla el usuario RakshithFury y se publica en Hugging Face como un checkpoint base de tipo *text-completion*: recibe un prompt en kannada y predice una continuación de texto. Su interés radica en ser un experimento reproducible de modelo de lenguaje de escala muy reducida, orientado a un único idioma de bajos recursos, entrenado en apenas 16 minutos sobre una GPU de consumo.

El modelo sigue la arquitectura GPT de nanochat (el proyecto educativo de Andrej Karpathy), con seis capas, anchura 384, seis cabezas de consulta y dos cabezas clave/valor, una longitud de contexto de 512 tokens y un tokenizador BPE a nivel de byte de 4.864 tokens ajustado sobre documentos en kannada. No es un modelo conversacional: la model card indica explícitamente que solo hace completado de texto y que una versión afinada para chat está "próximamente".

Se entrenó sobre 299.991.040 objetivos de siguiente token procedentes de ocho shards del corpus AI4Bharat Sangraha Verified Kannada. Su relevancia es doble: por un lado, sirve como referencia técnica de cómo entrenar un modelo monolingüe minúsculo con recursos mínimos; por otro, sus resultados de evaluación son deliberadamente modestos (perplejidad de 26,02 en el holdout completo, 51,4 % en IndicCOPA y 28,0 % en Belebele), lo que lo convierte en una línea base honesta más que en una herramienta de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT de nanochat), 6 capas, anchura 384, 6 cabezas de consulta y 2 cabezas clave/valor |
| Parámetros totales | 15.040.622 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas; el checkpoint se ofrece en BF16) |
| Idiomas soportados | Kannada (kn) |
| Licencia | No disponible (el código de inferencia incluido es MIT; la licencia del modelo no se indica) |
| Formato de pesos | safetensors (checkpoint PyTorch; incluye tokenizador y código nanochat) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT, tomado de la implementación de nanochat en el commit `92d63d4e`. Tiene seis capas, dimensión de modelo 384, seis cabezas de atención de consulta y dos cabezas clave/valor (atención con *grouped-query attention*, ratio 3:1), contexto de 512 tokens y tokenizador BPE a nivel de byte de 4.864 tokens ajustado sobre documentos en kannada. El script de inferencia añade automáticamente el token de inicio de documento y espera prompts en texto plano.

El entrenamiento consumió 299.991.040 objetivos de siguiente token en 9.155 actualizaciones, sobre una única NVIDIA RTX 5070 Ti de 16 GB de VRAM con cómputo en BF16 y el optimizador Adafactor, en 16 minutos y 13 segundos (sin contar descarga y preparación de datos). El corpus son ocho shards fijados de AI4Bharat Sangraha Verified Kannada (2,89 GB comprimidos), con normalización de texto, deduplicación exacta de documentos y rechazo de documentos con letras o marcas combinantes extranjeras. La separación de *holdout* se hizo por hash de documento antes de ajustar el tokenizador, y un escaneo independiente no encontró letras ni marcas extranjeras en los *splits* empaquetados. No se menciona RLHF, DPO ni ningún otro post-entrenamiento: es un checkpoint puramente preentrenado.

## Capacidades

- Generación de texto por continuación de prompt en kannada, con salidas cortas legibles.
- Predicción de siguiente token y modelado de lenguaje monolingüe en kannada.
- Capacidad limitada de razonamiento de sentido común zero-shot (IndicCOPA: 51,4 % frente al 50 % de azar).
- Comprensión lectora zero-shot muy limitada (Belebele: 28,0 % frente al 25 % de azar y al 27,9 % de la línea base "siempre B").
- No soporta *tool calling* ni *function calling*.
- No soporta comportamiento de agente ni razonamiento multi-paso.
- No es multilingüe: solo kannada.
- No tiene modo *thinking*, visión ni audio.
- No es un modelo de chat: no hay plantilla de conversación ni ajuste por instrucciones.

## Casos de uso

- Investigación educativa sobre entrenamiento de LLM: sirve para reproducir un *pipeline* completo de preentrenamiento (tokenizador, empaquetado de datos, bucle de entrenamiento, evaluación) en una sola GPU de consumo y en menos de 20 minutos de cómputo.
- Línea base para experimentos en kannada: permite comparar mejoras de datos, arquitectura o hiperparámetros contra un punto de partida conocido y con métricas publicadas (perplejidad 26,02 en el holdout completo).
- Pruebas de infraestructura de inferencia: con 15 M de parámetros y pesos en BF16 (unos 30 MB), es útil para validar *pipelines* de despliegue, scripts de carga de safetensors o integraciones con nanochat antes de pasar a modelos mayores.
- Estudio de tokenizadores de bajos recursos: el BPE de 4.864 tokens ajustado sobre kannada permite analizar la cobertura y eficiencia de vocabularios pequeños en lenguas con escritura propia.
- Generación de continuaciones cortas para *datasets* sintéticos o aumentación de datos en kannada, siempre con revisión humana dada la frecuencia de repeticiones y cambios abruptos de tema.
- Docencia y divulgación: ejemplo práctico de un modelo monolingüe de escala mínima para explicar conceptos de arquitectura transformer, atención con GQA y evaluación con perplejidad.

## Benchmarks y rendimiento

| Prueba | Resultado | Referencia |
|---|---:|---|
| Holdout completo de Sangraha, 999.936 objetivos de siguiente token | 26,02 de perplejidad | 4.864,88 en inicialización aleatoria |
| IndicCOPA Kannada, verosimilitud de elección zero-shot | 51,4 % (257/500) | 50 % de azar |
| Belebele Kannada, verosimilitud de etiqueta A–D zero-shot | 28,0 % (252/900) | 25 % de azar; 27,9 % línea base "siempre B" |

En el subconjunto fijo de validación de 262.144 objetivos, la pérdida bajó de 8,49 a 3,24 y la perplejidad de 4.864,94 a 25,45 durante el preentrenamiento. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (el checkpoint completo ocupa unos 30 MB en pesos); cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquiera con soporte CUDA y BF16, desde una RTX 3060 en adelante; el entrenamiento se realizó en una RTX 5070 Ti de 16 GB. La inferencia funciona por defecto en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU modernas e incluso en CPU sin problema de memoria.
- Opciones de despliegue: el repositorio incluye un script `infer.py` con código nanochat y dependencias en `requirements.txt`; requiere Python 3.11 o superior y `huggingface_hub` para la descarga. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---:|---:|---|---|---|
| Maatu 15M Base | 15,04 M | 512 | Kannada | No disponible | Preentrenado desde cero sobre Sangraha Kannada; perplejidad 26,02 en holdout |
| Modelos nanochat de referencia | Del orden de decenas de millones | Variable según configuración | Inglés principalmente | MIT (código) | Arquitectura base sobre la que se construye Maatu; no disponible una comparación directa publicada |
| Modelos Indic de AI4Bharat | No disponible | No disponible | Varias lenguas índicas | No disponible | Familia de modelos multilingües índicos; no se dispone de cifras comparables en la información proporcionada |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría (modelos monolingües de kannada de escala similar); la comparativa anterior es cualitativa.

## Limitaciones y advertencias

- Modelo exclusivamente de completado de texto: no sigue instrucciones ni mantiene diálogos; no debe usarse como asistente conversacional.
- Calidad de generación baja: la model card advierte de repeticiones frecuentes, cambios abruptos de tema y afirmaciones no respaldadas en salidas largas.
- Razonamiento y comprensión lectora muy limitados: los resultados en IndicCOPA (51,4 %) y Belebele (28,0 %) están apenas por encima del azar.
- Contexto muy corto (512 tokens), lo que limita tareas que requieran documentos largos.
- Monolingüe: solo kannada; no procesa otros idiomas de forma fiable.
- Riesgo de alucinación alto en cualquier uso generativo, dado el escaso volumen de entrenamiento (300 M de tokens) y el tamaño del modelo.
- Sesgos: no se documentan análisis de sesgo; el corpus Sangraha Verified puede arrastrar sesgos de la fuente original.
- Licencia del modelo no especificada: antes de cualquier uso comercial debe aclararse con el autor; el código de inferencia incluido es MIT y los corpus y benchmarks conservan sus términos originales (Sangraha bajo CC BY 4.0).
- Sin garantías de producción: es un checkpoint experimental de investigación, no una herramienta validada para despliegues reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RakshithFury/Maatu-15m-base
- Arquitectura nanochat (commit referenciado): https://github.com/karpathy/nanochat/tree/92d63d4e8bb4df75c3b71618f31ddde2378b2bcd
- Dataset AI4Bharat Sangraha (split verified/kan): https://huggingface.co/datasets/ai4bharat/sangraha/tree/8b813c3f62d37b2fa174d68c31e8b35ae2fe85e8/verified/kan
- Licencia CC BY 4.0 del corpus: https://creativecommons.org/licenses/by/4.0/
- Dataset IndicCOPA (test.kn.jsonl): https://huggingface.co/datasets/ai4bharat/IndicCOPA/blob/d356ef19a4eb287e88a51d07a56b73ba88c7f188/data/test.kn.jsonl
- Dataset Belebele (kan_Knda): https://huggingface.co/datasets/facebook/belebele/viewer/kan_Knda
- Plantilla de prompt de Belebele en EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness/blob/main/lm_eval/tasks/belebele/_default_template_yaml
