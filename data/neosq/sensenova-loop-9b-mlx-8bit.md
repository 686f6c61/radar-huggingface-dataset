# NeosQ/SenseNova-Loop-9B-MLX-8bit

## Resumen

SenseNova-Loop-9B-MLX-8bit es una conversión no oficial al formato MLX con cuantización de 8 bits del modelo sensenova/SenseNova-Loop-9B, publicada por el usuario NeosQ. El modelo base, desarrollado por SenseNova, emplea una arquitectura propietaria denominada "looped, dual-stream mHC" (multi-head communication, según la nomenclatura del autor), que se aparta del transformer convencional y requiere un runtime específico. Esta conversión está pensada exclusivamente para inferencia de texto sobre Apple Silicon mediante MLX y oMLX.

La relevancia de esta ficha radica en que documenta una de las pocas conversiones cuantizadas disponibles de un modelo de arquitectura no estándar, con métricas de calidad de cuantización publicadas (perplejidad y acuerdo top-1 frente a BF16) y mediciones de velocidad en hardware concreto. El paquete contiene únicamente pesos de generación de texto: no soporta entradas de visión.

Con 8.956.947.840 parámetros (aproximadamente 9B) y un repositorio de 10 GB, el modelo está licenciado bajo Apache 2.0 y soporta inglés y chino. Su principal advertencia es que la librería estándar mlx-lm no reconoce esta arquitectura: es imprescindible un runtime MLX/oMLX con una implementación compatible de `SenseNova_loop`, que el autor incluye como referencia en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped, dual-stream mHC (arquitectura propietaria de SenseNova, no transformer estándar) |
| Parametros totales | 8.956.947.840 (≈9B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX affine, group size 64); el autor publica también variantes BF16 y 4-bit como referencia comparativa |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); incluye `model-mtp.safetensors` opcional en BF16 para decodificación especulativa |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B utiliza una arquitectura descrita por el autor de la conversión como "looped, dual-stream mHC". El término "looped" sugiere un procesamiento recurrente o iterativo de representaciones, y "dual-stream" implica dos flujos paralelos de información; "mHC" corresponde a la denominación interna de la familia. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La conversión MLX se realizó con `mlx_lm.convert` a partir de los pesos BF16 originales de Hugging Face, aplicando cuantización afín de 8 bits con group size 64. El runtime personalizado empleado en las pruebas activa los flags `SENSENOVA_MHC_METAL=1` y `SENSENOVA_MHC_MERGE_METAL=1`, lo que indica que parte de los cálculos del router mHC se ejecutan mediante kernels Metal compilados. El repositorio incluye además un borrador MTP (multi-token prediction) opcional en BF16 para decodificación especulativa, desactivado por defecto y que requiere `SENSENOVA_MTP=1`.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento de múltiples pasos (el autor observa que el razonamiento puede aparecer en inglés aunque la respuesta final sea íntegramente en chino).
- Generación de texto largo en chino (ensayos, reflexiones sobre libros, artículos de divulgación) con calidad validada en pruebas del autor.
- Generación de código (se menciona una tarea de código en las pruebas de MTP, sin detallar el benchmark).
- Razonamiento matemático básico (la evaluación de cuantización incluye texto matemático).
- Decodificación especulativa opcional mediante borrador MTP con profundidad 2.
- No soporta visión: el paquete contiene únicamente pesos de texto.
- No se documenta soporte de tool calling ni de function calling en la información disponible.

## Casos de uso

- Generación de texto largo en chino: el modelo produce ensayos y artículos de aproximadamente 2.000 caracteres con decodificación determinista (temperature=0, top_p=1) sin artefactos de palabras extranjeras, según las pruebas del autor. Adecuado para redacción editorial asistida en chino.
- Asistencia conversacional en inglés y chino: modelo de chat multi-turno para aplicaciones de atención al cliente o asistentes internos en entornos bilingües en/zh.
- Inferencia local en Apple Silicon: con 10 GB de pesos en 8 bits, cabe en Macs con memoria unificada de 16 GB o superior, lo que permite desplegar un modelo de 9B en estaciones de trabajo sin GPU dedicada.
- Prototipado e investigación de arquitecturas no estándar: útil para estudiar el comportamiento de arquitecturas looped/dual-stream y comparar su rendimiento frente a transformers convencionales del mismo tamaño.
- Generación de código asistida en local: el modelo puede emplearse en editores o pipelines de desarrollo que requieran inferencia privada en máquinas Apple, aunque no se documenta tool calling.
- Experimentación con decodificación especulativa: el borrador MTP incluido permite medir ganancias de velocidad en cargas concretas; el autor reporta una mejora del 9,6% en una tarea de código y un empeoramiento en otra, por lo que sirve como banco de pruebas de técnicas de speculative decoding.
- Evaluación de calidad de cuantización: las métricas publicadas (perplejidad y acuerdo top-1) permiten usar esta conversión como referencia para estudiar el impacto de la cuantización de 8 bits frente a BF16 y 4 bits.

## Benchmarks y rendimiento

Calidad de cuantización (614 posiciones de token en chino, inglés, Python y matemáticas; perplejidad menor es mejor):

| Variante | Perplejidad | Acuerdo top-1 con BF16 |
|---|---:|---:|
| BF16 | 2,7127 | referencia |
| 8-bit | 2,6938 | 99,02% |
| 4-bit | 2,7875 | 93,81% |

Velocidad de generación en Mac Apple Silicon con 128 GB de memoria unificada, oMLX 0.7.3, mlx-lm personalizado y MLX 0.32.4 (mediana de tres peticiones compatibles con OpenAI generando 64 tokens):

| Variante | Velocidad |
|---|---:|
| BF16 | 8,50 token/s |
| 8-bit | 13,51 token/s |
| 4-bit | 20,90 token/s |

Artefactos de idioma en texto largo chino con muestreo por defecto (temperature=1,0, top_p=0,95; tres semillas fijas):

| Variante | Palabras extranjeras en 3 ensayos | Palabras extranjeras por 1.000 caracteres chinos |
|---|---:|---:|
| BF16 | 7 | 1,21 |
| 8-bit | 23 | 3,32 |
| 4-bit | 18 | 2,76 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos en 8 bits ocupan aproximadamente 10 GB (tamaño del repositorio); se recomienda al menos 16 GB de memoria unificada en Apple Silicon para dejar margen al contexto y al runtime.
- Hardware de referencia del autor: Mac Apple Silicon con 128 GB de memoria unificada.
- GPU dedicadas: no se documenta soporte para CUDA; el paquete es específico de MLX, por lo que no se aplican recomendaciones de A100, H100 o RTX 4090.
- Cabe en GPU de consumo Apple: sí, en equipos con memoria unificada suficiente (M-series con 16 GB o más, estimación basada en el tamaño de los pesos).
- Despliegue: MLX con runtime personalizado (oMLX 0.7.3 o superior con implementación compatible de `SenseNova_loop`); mlx-lm estándar no es suficiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 13,51 token/s en 8 bits y 8,50 token/s en BF16 en el equipo de prueba; el borrador MTP con profundidad 2 mejoró una tarea de código un 9,6% y empeoró otra, medido contra el objetivo de 4 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato/ecosistema | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-MLX-8bit | ≈9B | no disponible | Apache 2.0 | MLX, runtime personalizado | Conversión no oficial, solo texto, solo Apple Silicon |
| SenseNova-Loop-9B (base) | ≈9B | no disponible | Apache 2.0 | safetensors (BF16) | Modelo original de SenseNova; soporta visión según el autor de la conversión (no confirmado en la información disponible) |
| Alternativas de 9B en MLX | no disponible | no disponible | no disponible | MLX | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento (benchmarks estándar) con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización no es sin pérdidas; el autor advierte que el impacto es especialmente notable en 4 bits, aunque en 8 bits el acuerdo top-1 con BF16 es del 99,02%.
- La decodificación determinista no evita errores factuales, citas inventadas ni experiencias personales ficticias; es necesario revisar el contenido factual antes de su uso.
- Con el muestreo por defecto del modelo base (temperature=1,0, top_p=0,95) aparecen palabras extranjeras inapropiadas en texto largo chino, incluso en BF16; la cuantización puede agravarlo, aunque la relación no es monótona con la profundidad de cuantización. Se recomienda temperature=0 y top_p=1 para generación formal en chino.
- El razonamiento puede producirse en inglés aunque la respuesta final sea en chino.
- Requiere un runtime personalizado; descargar el repositorio en una instalación estándar de mlx-lm no es suficiente.
- Solo soporta texto: no hay soporte de visión en este paquete.
- Solo se documentan los idiomas inglés y chino; el rendimiento en castellano no está evaluado.
- El borrador MTP es experimental y dependiente de la carga de trabajo; no debe tratarse como una optimización general.
- Licencia Apache 2.0: permite uso comercial, pero al ser una conversión no oficial, la responsabilidad sobre la calidad y el soporte recae en el usuario.
- Las pruebas de idioma se centraron en artefactos de tokens extranjeros, no en calidad global de escritura ni exactitud factual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/NeosQ/SenseNova-Loop-9B-MLX-8bit
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- README en chino simplificado: README.zh-CN.md (incluido en el repositorio)
- Implementación de runtime de referencia: `mlx_sensenova_loop.py` (incluido en el repositorio)
- Runner de decodificación especulativa: `mlx_mtp_speculative.py` (incluido en el repositorio)
