# sach3v/indicphi-muril-pii

## Resumen

El modelo `sach3v/indicphi-muril-pii` es un encoder basado en MuRIL-base, desarrollado por sach3v, para la detección y redacción de información personal identificable (PII) y de información sanitaria protegida (PHI) en texto clínico indio. Se trata de un clasificador de tokens con etiquetas BIO que cubre 50 tipos de entidades, incluidas identificadores específicos de India como ABHA ID, número de Aadhaar, tarjeta de racionamiento BPL o nombres de trabajadores ASHA. Está fine-tuneado sobre el dataset `Sidharth1743/indicphi`, con 22.554 documentos sintéticos en 23 idiomas y 13 alfabetos.

Su arquitectura es un transformer encoder de 237 millones de parámetros con una cabeza de clasificación personalizada. La relevancia del modelo radica en la creciente necesidad de anonimizar datos clínicos en el contexto de la normativa de protección de datos india, permitiendo a hospitales y centros de investigación cumplir requisitos de privacidad sin perder la utilidad del texto. El autor presenta el modelo como una herramienta de alto rendimiento en distribuciones sintéticas similares a las de entrenamiento, pero advierte de una caída significativa de la calidad en textos reales no sintéticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) basado en MuRIL-base, con cabeza BIO personalizada (LayerNorm + clasificador lineal) |
| Parámetros totales | 237.044.837 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (máximo de BERT, entrenado con max length 512) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | as, bn, brx, doi, en, gu, hi, kn, kok, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-base-cased`, un encoder preentrenado sobre 17 lenguas indias y sus variantes transliteradas. Sobre esta base se añade una cabeza no estándar de clasificación de tokens: una capa LayerNorm antes del clasificador lineal. El autor documenta que una cabeza lineal simple no es capaz de aprender sobre la escala de salida de las activaciones de MuRIL, ya que se queda en pérdida de azar durante todo el entrenamiento.

El entrenamiento se realiza sobre el split de entrenamiento de `Sidharth1743/indicphi`, que contiene 22.554 documentos en 23 idiomas. Se usaron 3 épocas, batch de 8, longitud máxima de 512 tokens y semilla 42. El etiquetado es BIO sobre 50 tipos de entidades (101 etiquetas incluyendo `O`). El autor observa que el rendimiento en transferencia a texto real se satura alrededor de 10.000 documentos de entrenamiento, y que el último aumento de datos solo mejora la métrica in-distribution.

## Capacidades

- Clasificación de tokens BIO para PII y PHI, con salida de spans de caracteres.
- Cobertura de 50 tipos de entidad, incluidas identificadores específicos de India sin equivalente en taxonomías generales: `ABHA_ID`, `ABHA_ADDRESS`, `AADHAAR_NUMBER`, `BPL_RATION_CARD`, `ASHA_WORKER_NAME`, `VILLAGE`, `DISTRICT`, `WARD_NUMBER`, `CASTE`, `RELIGION`.
- Soporte de 23 lenguas indias y 13 alfabetos.
- No es un modelo generativo: no soporta tool calling, function calling ni razonamiento multi-paso.
- Necesita el script de carga personalizado `modeling_indicphi_bio.py` incluido en el repositorio, en lugar de `AutoModelForTokenClassification`.

## Casos de uso

- Redacción de historias clínicas: el modelo puede enmascarar automáticamente nombres de pacientes, edades, teléfonos, MRN y otros identificadores en notas médicas antes de compartirlas con terceros.
- Cumplimiento de normativa de protección de datos en India: detecta identificadores como Aadhaar, ABHA o tarjetas de racionamiento BPL en sistemas de información sanitaria, facilitando el cumplimiento de la DPDP Act.
- Anonimización de datasets clínicos para investigación: permite construir conjuntos de datos de texto clínico sin PHI para entrenar otros modelos o compartirlos entre instituciones.
- Sanitización de corpus antes de procesamientos posteriores: utilizar el modelo como filtro previo a tareas de traducción, extracción de información o generación de texto con LLMs.
- Auditoría de documentos administrativos sanitarios: identifica nombres de trabajadores ASHA, aldeas, distritos, castas y religiones en registros, apoyando la revisión de privacidad de datos internos.
- Integración en pipelines de procesamiento documental: al devolver spans de caracteres, puede integrarse en flujos de OCR, parsing de PDF y redacción automatizada con librerías como Hugging Face Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que el modelo es un encoder de clasificación de tokens y no un modelo generativo. Los resultados disponibles corresponden a la evaluación del autor:

| Evaluación | Resultado |
|---|---|
| Conjunto sintético held-out (mismo generador que el entrenamiento) | 0.45% de fuga de caracteres |
| Conjunto sintético held-out con tipos de documento no vistos | 2.0% de fuga de caracteres |
| Texto real Indic (Naamapadam, nombres de personas) | 31.8% de recall de detección (68.2% fallos) |
| Rango de seis encoders preentrenados de forma diferente (mismo entrenamiento) | 0.34–0.64% en sintético; 0.4–31.8% en texto real |

El propio autor advierte que el valor de 0.45% no debe transferirse a textos reales, y que la cifra de 31.8% en texto real procede de un dominio de noticias, no clínico, por lo que confunde cambio sintético-real y cambio de dominio.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en FP32 y 0.5 GB en FP16, más overhead de librerías.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA T4, RTX 3060 o GTX 1650. También es viable la ejecución en CPU.
- Se puede ejecutar en GPUs de consumo; no requiere A100 ni H100.
- Opciones de despliegue: Hugging Face Transformers (con el script `modeling_indicphi_bio.py`), ONNX Runtime, TorchServe. No es compatible con vLLM ni llama.cpp por ser un encoder y no un modelo de decodificación.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos alternativos de la misma categoría en la información proporcionada. La única comparación citada en la model card es un estudio interno con seis backbones preentrenados de forma diferente, pero no se nombran los modelos. El único modelo de PII encontrado en la búsqueda web, `ab-ai/PII-Model-Phi3-Mini`, es un LLM generativo de mayor tamaño y no comparable en arquitectura ni en soporte de lenguas indias.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con texto clínico sintético; la única evaluación con texto real disponible (Naamapadam) es de noticias, no clínico, por lo que la cifra real en producción podría ser distinta.
- El recall en texto real es significativamente bajo (31.8% de detección en la evaluación disponible), lo que supone un riesgo de fuga de PII en datos no sintéticos.
- Dos alfabetos, Ol Chiki (santali) y Meetei Mayek (manipuri), están fuera del preentrenamiento de MuRIL y resultan ser las lenguas más débiles.
- En lenguas de escritura de derecha a izquierda (sindhi, urdu, cachemir) se observan errores de límites que redactan solo el último carácter o dos del nombre, un fallo de privacidad más grave que una omisión completa.
- Al ser un clasificador de tokens, no genera texto pero puede producir falsos positivos y falsos negativos.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- No soporta tool calling ni agentes.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sach3v/indicphi-muril-pii
- Dataset de entrenamiento: https://huggingface.co/datasets/Sidharth1743/indicphi
- Repositorio de evaluación IndicPHI-Bench: https://github.com/SACHokstack/IndicPHI-Bench
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
