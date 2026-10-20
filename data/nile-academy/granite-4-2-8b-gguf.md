# nile-academy/granite-4.2-8b-gguf

## Resumen
nile-academy/granite-4.2-8b-gguf es un repositorio de cuantizaciones GGUF del modelo IBM Granite 4.2 8B, publicado por Nile Academy como espejo o conversión de formato de los pesos originales. No se trata de un modelo entrenado desde cero: la model card indica que no hay entrenamiento adicional y que la licencia Apache 2.0 del modelo base se preserva. El repositorio ofrece cuatro variantes (Q4_K_M, Q5_K_M, Q6_K y Q8_0) pensadas para ejecución local con runners compatibles con GGUF, lo que facilita el despliegue en entornos con recursos limitados o requisitos de privacidad.

El modelo base, ibm-granite/granite-4.2-8b, tiene 8.791.592.960 parámetros y está orientado a generación de texto conversacional. Los benchmarks publicados por el editor original muestran resultados en tareas de tool calling (BFCLv4 52,39), conocimiento y razonamiento (MMLU-Pro 74,04; GPQA 64,14), matemáticas (AIME25 86,67) y código (LiveCodeBench v6 73,24), aunque no se han medido sobre estas cuantizaciones concretas. La relevancia actual reside en la posibilidad de desplegar un modelo de casi 9.000 millones de parámetros en hardware de consumo, con la advertencia de que la calidad de las cuantizaciones no está cualificada por el autor.

No se dispone de información sobre la arquitectura interna, la longitud de contexto o los idiomas soportados en la información proporcionada. La ficha se limita a los datos verificables del repositorio y del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (cuantización GGUF de IBM Granite 4.2 8B) |
| Parámetros totales | 8.791.592.960 |
| Parámetros activos | no aplica (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | ibm-granite/granite-4.2-8b |
| Revisión fijada del modelo base | f8de16cdcdbc6c779ca517604e050d82cc119e44 |
| Tamaño del repositorio | 28,2 GB |
| Fecha de creación del repositorio | 2026-10-19 |
| Fecha de publicación del modelo base | 2026-08-25 |

**Variantes de cuantización incluidas**

| Archivo | Cuantización | Tamaño (GB) | Origen |
|---|---|---:|---|
| granite-4.2-8b-Q4_K_M.gguf | Q4_K_M | 5,348 | exportación del editor oficial |
| granite-4.2-8b-Q5_K_M.gguf | Q5_K_M | 6,254 | exportación del editor oficial |
| granite-4.2-8b-Q6_K.gguf | Q6_K | 7,216 | exportación del editor oficial |
| granite-4.2-8b-Q8_0.gguf | Q8_0 | 9,346 | exportación del editor oficial |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo base, el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineamiento (RLHF, DPO u otros) en la información proporcionada. Este repositorio no realiza entrenamiento adicional: la model card lo describe como un espejo de artefactos o una conversión de formato explícitamente registrada, sin entrenamiento añadido, a partir de los pesos de ibm-granite/granite-4.2-8b en la revisión f8de16cdcdbc6c779ca517604e050d82cc119e44.

Las cuantizaciones GGUF se han generado a partir de los pesos originales. El autor indica que Q8_0 es la referencia de mayor precisión del conjunto; Q6_K y Q5_K_M intercambian memoria por precisión, y Q4_K_M requiere una evaluación emparejada de tareas antes de recomendarlo. No se ofrece una cualificación general de pérdida de calidad ni una validación de funcionamiento sostenido en 8 GB de VRAM. Los benchmarks publicados corresponden al modelo base y no han sido medidos sobre estos archivos cuantizados.

## Capacidades
- Generación de texto conversacional: el pipeline declarado es text-generation y el tag conversational indica uso en diálogo multi-turno.
- Tool calling / function calling: el modelo base reporta una puntuación de 52,39 en BFCL
