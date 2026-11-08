# davidadeyemi/layoutlm-nigerian-forms

## Resumen

`davidadeyemi/layoutlm-nigerian-forms` es un modelo de clasificación de tokens (token classification) especializado en el etiquetado de campos en formularios bancarios nigerianos. Se trata de un fine-tuning de `philschmid/layoutlm-funsd`, que a su vez deriva de la arquitectura LayoutLM de Microsoft. El modelo procesa cada palabra obtenida por OCR en una página de formulario y la etiqueta según el esquema BIO de 7 etiquetas de FUNSD (HEADER, QUESTION, ANSWER y variantes), lo que permite identificar qué fragmentos de texto corresponden a etiquetas de campo y cuáles a los valores rellenados.

El modelo forma parte del proyecto N-ATLAS Form Assistant como modelo de la etapa 1 (detección y etiquetado de campos), y está pensado para digitalizar y extraer información estructurada de formularios de apertura de cuentas bancarias nigerianas. Con 112,6 millones de parámetros y un tamaño de repositorio de 0,5 GB, es un modelo compacto orientado a inferencia sobre documentos escaneados.

Su relevancia es acotada y experimental: el propio autor reconoce que los conjuntos de entrenamiento y prueba nigerianos son pequeños (53 páginas de entrenamiento y 19 de prueba) y provienen de un número reducido de formularios bancarios, y que en los datos gold del proyecto rindió ligeramente por debajo del modelo base. La licencia no está declarada, por lo que debe tratarse como modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LayoutLM (transformer con embeddings de layout 2D), `LayoutLMForTokenClassification` |
| Parametros totales | 112.633.351 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (LayoutLM base admite hasta 512 tokens de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre formularios en inglés de Nigeria y FUNSD) |
| Licencia | no disponible (el autor indica que la licencia del modelo base no está declarada; tratar como research-only) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura LayoutLM, un transformer basado en BERT que incorpora embeddings de posición bidimensional (coordenadas x0, y0, x1, y1 de cada palabra en la página) además de los embeddings de token y de posición secuencial. Esto permite que el modelo combine información textual y espacial, algo crítico en documentos donde la posición de una palabra respecto a una etiqueta determina si es un valor de campo. La cabeza de salida es de clasificación de tokens sobre el esquema BIO de 7 etiquetas de FUNSD.

El entrenamiento partió de `philschmid/layoutlm-funsd` y se realizó durante 15 épocas con learning rate 3e-5 y batch size 4. Los datos consistieron en 53 páginas de formularios nigerianos (cada una repetida 3 veces) más las 149 páginas de entrenamiento de FUNSD. No se indica en la información disponible el uso de RLHF, DPO ni ninguna otra técnica de alineación; se trata de un fine-tuning supervisado convencional. El modelo no incluye tokenizer propio: debe usarse `microsoft/layoutlm-base-uncased`.

## Capacidades

- Etiquetado de tokens a nivel de palabra OCR sobre páginas de formularios, con el esquema BIO de 7 etiquetas de FUNSD (HEADER, QUESTION, ANSWER y variantes).
- Identificación de etiquetas de campo (QUESTION) y de sus valores rellenados (ANSWER) en formularios de apertura de cuentas bancarias.
- Procesamiento de información de layout (coordenadas de bounding boxes) junto con el texto.
- Integración en pipelines de extracción de documentos como etapa de detección de campos previa a la extracción de valores.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo de clasificación, no generativo).
- Capacidades multilingües: no disponibles; el entrenamiento se limita a formularios en inglés de Nigeria y FUNSD.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Digitalización de formularios de apertura de cuentas bancarias: el modelo etiqueta cada palabra OCR como etiqueta de campo o valor, permitiendo reconstruir pares clave-valor de formularios escaneados de entidades bancarias nigerianas.
- Etapa de detección de campos en pipelines de extracción documental: se usaría como primer paso (stage 1) antes de un modelo de extracción o de reglas de layout que consoliden los campos, tal como hace el proyecto N-ATLAS Form Assistant.
- Procesamiento por lotes de formularios históricos: al ser un modelo de 112 M de parámetros y 0,5 GB, puede ejecutarse en CPU o GPU modestas para clasificar grandes volúmenes de páginas escaneadas sin coste elevado de inferencia.
- Enriquecimiento de sistemas OCR existentes: se puede acoplar a la salida de un motor OCR (palabras y bounding boxes) para añadir semántica de formulario sin reentrenar el OCR.
- Investigación en extracción de información de documentos (Document AI): sirve como punto de partida para fine-tuning sobre dominios administrativos o bancarios con pocos datos etiquetados.
- Prototipado de asistentes de rellenado de formularios: la salida de etiquetas permite construir interfaces que resalten campos pendientes o validen la estructura del formulario antes de su envío.

## Benchmarks y rendimiento

Resultados de Entity F1 reportados por el autor sobre sus conjuntos de validación (antes = modelo base, después = este fine-tuning):

| Conjunto de prueba | Antes | Después |
|---|---|---|
| Formularios nigerianos (19 páginas de 3 formularios de apertura de cuenta) | 0.522 | 0.691 |
| Test de FUNSD | 0.785 | 0.765 |

En los datos gold propios del N-ATLAS Form Assistant (6 formularios reales, 155 campos, evaluados a nivel de campo completo tras aplicar las reglas de layout del proyecto, 8 de noviembre de 2026) el modelo obtuvo un field F1 del 56 % frente al 59 % del modelo base. El autor señala que esos formularios no son mayoritariamente de apertura de cuentas.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 112,6 M de parámetros, en fp32 ocupa aproximadamente 0,45 GB de pesos; en fp16 alrededor de 0,23 GB. La VRAM real depende del tamaño de lote y de la longitud de secuencia (hasta 512 tokens), pero en la práctica cabe en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, etc.); también tarjetas de datacenter como A100 o H100, aunque están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (librería nativa), `vLLM` no aplica (no es generativo), `llama.cpp`/`Ollama` no soportan esta arquitectura de clasificación; para serving se puede usar `TGI` o un endpoint de inferencia estándar de Hugging Face (`endpoints_compatible` está en las tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `davidadeyemi/layoutlm-nigerian-forms` | 112,6 M | no disponible (LayoutLM: 512 tokens) | Token classification de formularios | no disponible | Hugging Face |
| `philschmid/layoutlm-funsd` (modelo base) | ~112 M | 512 tokens | Token classification FUNSD | no disponible | Hugging Face |
| `microsoft/layoutlm-base-uncased` | ~112 M | 512 tokens | Modelo base preentrenado | no disponible | Hugging Face |

No se dispone en la información proporcionada de resultados de benchmarks de los modelos comparables más allá de los reportados por el autor para el modelo base en FUNSD (0.785 de Entity F1 antes del fine-tuning).

## Limitaciones y advertencias

- Los conjuntos de entrenamiento y prueba nigerianos son pequeños (53 páginas de entrenamiento y 19 de prueba) y provienen de un número reducido de formularios bancarios, lo que limita la generalización a otros tipos de formulario.
- En los datos gold del proyecto N-ATLAS el modelo rindió por debajo del modelo base (field F1 56 % frente a 59 %), por lo que el fine-tuning no mejora de forma universal.
- El modelo no incluye tokenizer propio; es obligatorio usar `microsoft/layoutlm-base-uncased`, y un uso incorrecto del tokenizer degrada los resultados.
- La licencia no está declarada y la del modelo base tampoco; el autor recomienda tratarlo como research-only hasta verificar los términos, lo que impide asumir uso comercial.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación más allá de lo que implica un modelo de clasificación (no genera texto, pero puede etiquetar erróneamente campos).
- Es un modelo de clasificación de tokens, no generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- El modelo está entrenado sobre formularios en inglés de Nigeria y FUNSD; su rendimiento en otros idiomas o dominios no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidadeyemi/layoutlm-nigerian-forms
- Modelo base: https://huggingface.co/philschmid/layoutlm-funsd
- Tokenizer requerido: https://huggingface.co/microsoft/layoutlm-base-uncased
- Documentación de LayoutLM en Transformers: https://huggingface.co/docs/transformers/model_doc/layoutlm
- Proyecto N-ATLAS Form Assistant: https://github.com/1demilade/n-atlas-form-assistant
