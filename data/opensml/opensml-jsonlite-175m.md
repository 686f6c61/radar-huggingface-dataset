# OpenSML/OpenSML-JSONLite-175M

## Resumen

OpenSML-JSONLite-175M es un modelo de lenguaje de 175.611.648 parámetros entrenado desde cero por William Zebrowski (organización OpenSML) para una tarea muy concreta: generar directamente un objeto JSON plano a partir de un texto fuente en inglés y un JSON Schema plano proporcionado por el usuario. El modelo realiza una única llamada autoregresiva; la validación contra el esquema se hace después de la generación. No utiliza ensamblado de JSON, reparación de salida, decodificador restringido ni un segundo modelo.

La arquitectura es un transformer denso de 24 capas, 768 dimensiones ocultas y FFN de 2.048, con atención GQA (12 cabezas de consulta, 4 de clave/valor), RMSNorm con normalización de Q/K, SwiGLU y RoPE con base 10.000. El vocabulario es un BPE de 32.000 tokens congelado y el contexto compartido es de 2.048 tokens. Los pesos se distribuyen en BF16 sin cuantizar en safetensors con embeddings atados.

Es relevante ahora porque aborda un nicho práctico —extracción de información estructurada en entornos con recursos limitados y Apple Silicon— con un modelo minúsculo, pero también porque su model card es inusualmente honesta sobre los límites: la validez de esquema observada es del 99,93% sobre 1.444 peticiones, pero la corrección completa solo del 89,54%, y el propio autor advierte que se produzcan errores de extracción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (24 capas, 768 hidden, FFN 2.048, GQA 12Q/4KV, RMSNorm + Q/K norm, SwiGLU, RoPE base 10.000) |
| Parámetros totales | 175.611.648 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (instrucción, fuente, esquema y salida comparten la ventana) |
| Tipos de cuantización | No disponible (pesos publicados en BF16 sin cuantizar) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16, embeddings atados); librería MLX |
| Vocabulario | BPE de 32.000 tokens congelado |
| Generación por defecto | Temperatura 0, repetition penalty 1, máximo 256 tokens |
| Tamaño del repo | 1,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso entrenado desde cero sobre el checkpoint base OpenSML-Base-175M. La configuración concreta incluye 24 capas, dimensión oculta 768, FFN de 2.048, atención con grouped-query attention (12 cabezas de consulta y 4 de clave/valor), normalización RMSNorm con normalización adicional en Q/K, activación SwiGLU y embeddings posicionales rotatorios RoPE con base 10.000. El vocabulario es un BPE de 32.000 tokens congelado y los embeddings de entrada y salida están atados.

El post-entrenamiento combina un preentrenamiento continuado sobre datos estructurados con un único SFT conjunto para extracción fundamentada y generación directa de JSON guiada por esquema. Los datasets citados en la model card son smollm-corpus, dclm-edu, finewiki, python-edu-cleaned, squad_v2, databricks-dolly-15k y AmazonScience/massive. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es el contrato de salida: una sola pasada autoregresiva produce el JSON completo y la validación se realiza a posteriori, sin decodificación restringida.

## Capacidades

- Extracción de información explícita de textos cortos en inglés y colocación en un objeto JSON plano.
- Generación directa de JSON guiada por un JSON Schema plano con 1 a 8 propiedades requeridas y `additionalProperties: false`.
- Soporte de propiedades de tipo string, string anulable y arrays de strings.
- Copia literal de valores (fechas y números como texto, sin normalización ni conversión).
- Relleno de arrays ausentes con `[]` y de strings anulables ausentes con `null`.
- Preservación del orden de aparición en arrays y de mayúsculas y ortografía exactas.
- Salida en una sola llamada autoregresiva con temperatura 0 por defecto.
- No soporta (fuera del contrato verificado): objetos anidados, arrays de objetos, salidas numéricas o booleanas, lógica de propiedades opcionales, enums, referencias y restricciones avanzadas de esquema.
- No verificado: chat general, entrada multilingüe y extracción de documentos largos.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Extracción de entidades en asistentes de voz o comandos: a partir de frases cortas como "Play the track Blue Lantern by Mira Sol" el modelo rellena campos como `track` y `artist`; encaja por su tamaño mínimo y su latencia baja en dispositivos Apple Silicon.
- Enriquecimiento de registros en pipelines de datos: dado un texto breve y un esquema plano, se genera el JSON directamente para insertarlo en una base de datos, con validación posterior contra el esquema y comprobación de valores contra la fuente.
- Preprocesado de formularios y tickets en inglés: extracción de campos de texto libre (nombres, títulos, listas) hacia un objeto plano, siempre que los campos sean strings o arrays de strings y no requieran normalización de fechas o importes.
- Prototipado de extracción estructurada en local: al ejecutarse con MLX en macOS sobre Apple Silicon, permite iterar sobre esquemas y prompts sin depender de servicios en la nube ni de GPUs dedicadas.
- Filtrado y clasificación ligera por esquema: uso de esquemas con campos de string para etiquetar o resumir información explícita de textos cortos en flujos de ingesta, con validación estricta de la estructura de salida.
- Investigación sobre modelos pequeños y post-entrenamiento: sirve como referencia reproducible de un modelo de 175M entrenado desde cero con SFT conjunto para una tarea estructurada, útil para estudiar el equilibrio entre validez de esquema y corrección semántica.
- Evaluación de robustez de extracción: los propios ejemplos de la model card (probes de tres, cuatro y cinco ítems) permiten medir la tasa de acierto en listas y detectar fusiones u omisiones de elementos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la evaluación observada de 1.444 peticiones realizada por el autor:

| Métrica | Resultado |
|---|---|
| Validez de esquema (1.444 peticiones observadas) | 99,93% |
| Corrección completa (misma evaluación) | 89,54% |
| Probes de tres/cuatro/cinco ítems completamente correctos | 3 de 6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 175,6M de parámetros en BF16, los pesos ocupan aproximadamente 350 MB; en FP16/FP32 la huella es del mismo orden, muy por debajo de 1 GB, más el espacio de activaciones y KV cache para 2.048 tokens.
- GPU recomendadas: no se especifican en la información disponible; el modelo está verificado en Apple Silicon (macOS) con MLX 0.32.3 y Python 3.11.
- Cabe holgadamente en GPUs de consumo (RTX 4090, RTX 3090, RTX 4060 y similares) por tamaño, aunque el export publicado es específico de MLX y no se ha verificado en esas plataformas.
- Opciones de despliegue: runner nativo MLX incluido en el repositorio (`inference.py`); no soporta carga automática con Transformers AutoModel ni con mlx-lm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenSML-JSONLite-175M | 175,6M | 2.048 | Extracción JSON guiada por esquema, solo inglés | No disponible | Hugging Face, MLX |
| OpenSML-Base-175M | 175,6M | No disponible | Modelo base preentrenado desde cero | No disponible | Hugging Face |
| Alternativas de extracción estructurada de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables de la misma categoría para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte de errores de extracción: puede acortar nombres o títulos, omitir o fusionar elementos de listas, confundir a quién pertenece un valor o rellenar un campo cuando la respuesta correcta es vacía.
- La validez de esquema del 99,93% y la corrección completa del 89,54% corresponden a una evaluación observada de 1.444 peticiones y no garantizan el comportamiento en entradas nuevas.
- Solo se han verificado 3 de 6 probes de tres, cuatro y cinco ítems como completamente correctos; no hay un número establecido de entidades que el modelo extraiga siempre bien.
- Fuera del contrato verificado: objetos anidados, arrays de objetos, salidas numéricas o booleanas, propiedades opcionales, enums, referencias y restricciones avanzadas de esquema.
- Solo inglés; el multilingüismo, el chat general y la extracción de documentos largos no están verificados.
- El contexto es de 2.048 tokens compartidos entre instrucción, fuente, esquema y respuesta; el runner admite hasta 256 tokens de salida y rechaza prompts demasiado largos sin truncar.
- No normaliza fechas ni números: los copia como texto.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- El export es específico de MLX y no carga con Transformers AutoModel ni mlx-lm; requiere el runner nativo incluido.
- Riesgo de alucinación: puede inventar valores cuando el dato no está explícito en la fuente; se recomienda validar estructura y significado contra el texto original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenSML/OpenSML-JSONLite-175M
- Modelo base: https://huggingface.co/OpenSML/OpenSML-Base-175M
- Guía de ejecución local: RUN_GUIDE.md (incluida en el repositorio del modelo)
- Informe técnico: TECHNICAL_REPORT.md (incluido en el repositorio del modelo)
- Resultados: JSONLITE_RESULTS.json (incluido en el repositorio del modelo)
- Procedencia del checkpoint: checkpoint_provenance.json (incluido en el repositorio del modelo)
