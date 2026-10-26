# jaydeepb/llama-3.2-1b-pg19-run2

## Resumen

`jaydeepb/llama-3.2-1b-pg19-run2` es un artefacto de investigación liberado como parte del trabajo *Predicting Memorization Before Fine-Tuning Language Models*. Se trata de `meta-llama/Llama-3.2-1B` ajustado durante una única época sobre una muestra de 1 millón de secuencias del corpus PG-19, en la variante "Run 2" que el paper emplea como conjunto de evaluación. No es un modelo de propósito general ni una variante alineada para instrucciones: es el objeto de estudio sobre el que los clasificadores del paper predicen qué secuencias acabarán memorizadas de forma literal.

Su relevancia es metodológica más que de producto. El modelo permite reproducir el experimento completo: dado un modelo base concreto y un corpus de ajuste definido, comprobar qué fragmentos se reproducen verbatim tras el fine-tuning y validar hasta qué punto esas predicciones se podían hacer *antes* de entrenar. Es, por tanto, una pieza de infraestructura de investigación sobre privacidad, copyright y dinámica del sobreajuste en modelos pequeños.

Arquitectura y tamaño son los del modelo base: transformer decoder-only de 1.235.814.400 parámetros, publicado en safetensors (2,5 GB de repositorio) y con la licencia Llama 3.2. La model card advierte explícitamente de que el modelo puede reproducir porciones de sus datos de ajuste de forma textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2; pesos derivados de `meta-llama/Llama-3.2-1B`) |
| Parametros totales | 1.235.814.400 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Llama 3.2 1B, que declara 131.072 tokens |
| Tipos de cuantizacion | No disponible: el autor no publica versiones cuantizadas; al estar en safetensors es convertible a FP16/BF16, INT8, GPTQ/AWQ y GGUF con herramientas estándar |
| Idiomas soportados | No disponible en la model card; el modelo base cubre oficialmente 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), sin evaluación específica tras el fine-tuning |
| Licencia | Llama 3.2 Community License (`license: llama3.2`) |
| Formato de pesos | safetensors (compatible con `transformers` y `text-generation-inference`) |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint `meta-llama/Llama-3.2-1B` sin modificaciones estructurales: transformer decoder-only con atención causal, RMSNorm, activaciones SwiGLU, RoPE y atención agrupada por consultas (GQA). El ajuste consiste en entrenamiento de lenguaje autorregresivo estándar (predicción del siguiente token) durante **una sola época** sobre una muestra de **1 millón de secuencias** de PG-19, el corpus de libros de Project Gutenberg utilizado habitualmente como benchmark de modelado de lenguaje de contexto largo.

No se documenta en la model card el número total de tokens vistos, la composición exacta de la muestra, la mezcla de datos ni la existencia de fases de alineación (RLHF, DPO o similares); por el propósito del artefacto, se trata de un fine-tuning supervisado puro orientado a inducir memorización. La innovación técnica no está en el modelo sino en su papel experimental: los clasificadores del paper predicen, a partir de características del **modelo base antes del ajuste**, qué secuencias concretas serán memorizadas verbatim tras el fine-tuning. Este checkpoint es la referencia empírica contra la que se valida esa predicción (la "Run 2" del protocolo de evaluación).

## Capacidades

- Generación de texto autorregresiva y continuación de documentos largos, con el estilo y el vocabulario del corpus PG-19 (literatura en inglés anterior a 1919).
- Reproducción verbatim de fragmentos de sus datos de ajuste: es la capacidad central que el modelo materializa y la que el paper estudia.
- Modelado de lenguaje de dominio literario, útil como baseline de perplejidad sobre textos de Project Gutenberg.
- Capacidad potencial de contexto largo heredada del modelo base (hasta 131.072 tokens según la documentación de Llama 3.2 1B), sin verificación publicada para este checkpoint.
- No dispone de ajuste por instrucciones ni de alineación conversacional: no es un modelo de chat.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, uso como agente, visión, audio ni modo "thinking".
- Capacidades multilingües no evaluadas tras el fine-tuning; el corpus de ajuste es mayoritariamente en inglés.

## Casos de uso

- Reproducción del paper: cargar el checkpoint y ejecutar el mismo protocolo de evaluación (Run 2) para verificar las tasas de memorización reportadas y la precisión de los clasificadores predictivos.
- Banco de pruebas para ataques de extracción de datos: lanzar prompts de prefijo y medir cuántos sufijos de PG-19 se recuperan literalmente, como referencia controlada en la evaluación de técnicas de extracción sobre modelos mayores.
- Calibración de detectores de memorización verbatim: usar las salidas del modelo para ajustar umbrales de detectores basados en coincidencia de n-gramas o en perplejidad diferencial.
- Estudio comparativo de dinámica de sobreajuste: enfrentar este fine-tuning (1 época, 1M secuencias, 1,2B parámetros) contra ajustes equivalentes en modelos de otro tamaño o arquitectura para aislar qué factores determinan la memorización.
- Investigación sobre privacidad en fine-tuning: simular el escenario de ajustar un modelo con un corpus de dominio y cuantificar la fuga de información por secuencia, extrapolable a datos sensibles en producción.
- Docencia y divulgación técnica: demostrar de forma reproducible qué es la memorización literal y en qué se diferencia de la generalización, con un modelo que cabe en una GPU de consumo.
- Baseline de generación de texto de dominio literario: estudiar la distribución aprendida sobre libros de dominio público, siempre con la advertencia de que la salida puede ser texto literal del corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad, y los resultados de búsqueda web obtenidos no contienen información relacionada con el modelo.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 2,5 GB en disco y en VRAM (1.235.814.400 parámetros × 2 bytes).
- Cuantización INT8: en torno a 1,3 GB; cuantización de 4 bits: en torno a 0,7 GB (estimaciones por tamaño de parámetros, no publicadas por el autor).
- Cabe holgadamente en cualquier GPU de consumo con 8 GB o más: RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090. En 4 bits puede ejecutarse en GPUs de 4-6 GB e incluso en CPU.
- Caché KV estimada a partir de la configuración publicada del modelo base (16 capas, 8 cabezas KV, dimensión de cabeza 64): unos 32 KiB por token en FP16, es decir, aproximadamente 4 GB para una secuencia de 131.072 tokens. ConContextos largos, la caché KV domina el consumo de VRAM frente a los pesos.
- Despliegue: `transformers` (librería declarada), Text Generation Inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| `jaydeepb/llama-3.2-1b-pg19-run2` | 1,24B | No especificado (base: 131.072) | Llama 3.2 | Fine-tuning de investigación sobre PG-19 | Memorización verbatim como objeto de estudio; sin alineación |
| `meta-llama/Llama-3.2-1B` | 1,24B | 131.072 | Llama 3.2 | Modelo base preentrenado | Punto de partida del ajuste; existe variante Instruct |
| `Qwen/Qwen2.5-1.5B` | 1,54B | 32.768 | Apache 2.0 | Modelo base e Instruct | Licencia permisiva, sin cláusulas de escala |
| `HuggingFaceTB/SmolLM2-1.7B` | 1,7B | 8.192 | Apache 2.0 | Modelo pequeño open source | Alternativa con licencia totalmente permisiva |
| `google/gemma-2-2b` | 2,61B | 8.192 | Gemma Terms of Use | Modelo base e Instruct | Mayor tamaño, licencia con restricciones de uso |

No se dispone de métricas de rendimiento comparables para este checkpoint, por lo que la comparación se limita a parámetros, contexto, licencia y propósito.

## Limitaciones y advertencias

- Memorización deliberada: el modelo reproduce porciones de PG-19 de forma literal. No debe usarse para generar contenido que se pretenda original sin verificar coincidencias con el corpus.
- Artefacto de investigación, no de producción: sin ajuste por instrucciones, sin alineación, sin filtros de seguridad y sin evaluación de calidad de salida.
- Riesgo de alucinación y de degradación fuera de dominio: al haber sido ajustado una época sobre un corpus literario histórico, la distribución de salida está fuertemente sesgada hacia ese registro; fuera de él el comportamiento no está caracterizado.
- Sesgos heredados: los derivados del preentrenamiento de Llama 3.2 1B y, de forma añadida, los del canon literario occidental de Project Gutenberg anterior a 1919 (sesgos de época, género y cultura).
- Idiomas: el corpus de ajuste es en inglés; no hay evaluación multilingüe y es esperable un deterioro notable en otros idiomas respecto al modelo base.
- Licencia Llama 3.2 Community License: permite uso comercial con condiciones (atribución "Built with Llama", mención del nombre del modelo, obligaciones sobre el material generado y cláusula de revocación si se superan los 700 millones de usuarios activos mensuales). Debe revisarse antes de cualquier despliegue.
- Posible solapamiento de copyright: aunque PG-19 contiene obras de dominio público, la licencia del modelo no exime de comprobar los derechos de los textos subyacentes en el contexto de uso.
- Sin resultados de benchmarks ni de perplejidad publicados: no es posible estimar su calidad como modelo de lenguaje a partir de la información disponible.
- Ventana de contexto: aunque el modelo base soporta 131.072 tokens, la model card no confirma que el fine-tuning haya preservado ese rango; conviene validarlo empíricamente antes de usarlo con entradas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/llama-3.2-1b-pg19-run2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Dataset PG-19 (DeepMind): https://github.com/deepmind/pg19
- Paper *Predicting Memorization Before Fine-Tuning Language Models*: referencia citada en la model card, sin URL disponible en la información proporcionada
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados obtenidos tratan sobre kits de pintura de diamantes y no guardan relación con el contenido de esta ficha.
