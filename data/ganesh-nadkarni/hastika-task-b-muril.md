# Ganesh-Nadkarni/hastika-task-b-muril

## Resumen

`hastika-task-b-muril` es un modelo de clasificación de texto obtenido mediante fine-tuning de `google/muril-base-cased` sobre la tarea B del shared task HASTIKA @ ICON-2026. Su objetivo es identificar la categoría objetivo de comentarios de odio (Gender, Political, Religion, Geo-political, Violence, Others) en comentarios de YouTube con mezcla de código kannada-inglés (kanglish). Lo desarrolla Ganesh-Nadkarni y se publica bajo licencia Apache 2.0.

El modelo parte de MuRIL, un transformer encoder multilingüe de Google preentrenado específicamente con datos de lenguas indias y texto transliterado, lo que lo hace adecuado para el fenómeno del code-mixing kannada-inglés. Sobre esa base se aplica una cabeza de clasificación de 6 clases entrenada con el split de entrenamiento de HASTIKA, usando una partición estratificada 88/12 y selección por macro-F1 en validación.

Es relevante como componente especializado en pipelines de moderación de contenido para comunidades de habla kannada, un segmento poco cubierto por los clasificadores de toxicidad genéricos entrenados mayoritariamente en inglés. El autor advierte explícitamente de que el checkpoint forma parte de un ensemble mayor y que, de forma aislada, su rendimiento es limitado (macro-F1 de 0,529 en su split de validación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MuRIL base, BERT-like) |
| Parametros totales | no disponible (modelo base `google/muril-base-cased`, tamaño base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max length 160 tokens) |
| Tipos de cuantizacion | no disponible (compatible con cuantización estándar de transformers, no verificada por el autor) |
| Idiomas soportados | kannada (kn), inglés (en); texto code-mixed kannada-inglés (kanglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (checkpoint de transformers; presumiblemente safetensors o pytorch bin, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/muril-base-cased`, un encoder transformer de tipo BERT preentrenado por Google con datos multilingües enriquecidos con transliteraciones de lenguas indias. Sobre el encoder se añade una cabeza de clasificación de secuencia con 6 etiquetas de salida correspondientes a las categorías objetivo de odio. El pipeline declarado es `text-classification` y la librería es `transformers`.

El entrenamiento usa el split de entrenamiento del dataset HASTIKA con una partición estratificada 88/12 (entrenamiento/held-out). Los hiperparámetros documentados son: longitud máxima de 160 tokens, batch size 16, precisión mixta, learning rate 1e-5 y early stopping sobre macro-F1 de validación. El desbalance de clases se trata únicamente con pérdida ponderada por clase, sin oversampling. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF/DPO (poco habituales en un clasificador de este tipo).

## Capacidades

- Clasificación de texto en 6 categorías objetivo de comentarios de odio: Gender, Political, Religion, Geo-political, Violence y Others.
- Procesamiento de texto code-mixed kannada-inglés (kanglish), incluyendo variantes de transliteración vistas en entrenamiento.
- Etiquetado de un único comentario por inferencia mediante `pipeline("text-classification")`.
- Integración con el ecosistema `transformers` (compatible con endpoints según los tags del repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingüe limitada a los dos idiomas declarados (kn, en) y a su mezcla.

## Casos de uso

- Moderación asistida de comentarios en YouTube para comunidades kannada: el modelo etiqueta cada comentario con su categoría objetivo de odio, permitiendo priorizar la revisión humana por tipo de contenido (p. ej. violencia frente a otros).
- Triaje en colas de moderación: al clasificar en 6 categorías, permite enrutar los comentarios a equipos o políticas distintas según la categoría detectada, reduciendo el volumen que llega a revisión manual completa.
- Investigación sobre discurso de odio en lenguas indias: sirve como línea base reproducible para experimentos de clasificación code-mixed en kanglish, con hiperparámetros y split documentados.
- Componente de un ensemble: el autor indica que el checkpoint se diseñó como parte de una mezcla mayor, por lo que su uso previsto es como señal adicional junto a otros clasificadores.
- Filtrado previo en plataformas de comentarios de nicho: para foros o canales de YouTube con audiencia kannada, puede actuar como primera pasada de detección antes de la revisión humana.
- Análisis de datasets de comentarios: etiquetado automático de corpus kanglish para estudios de prevalencia por categoría (género, política, religión, geopolítica, violencia).
- Evaluación comparativa de modelos multilingües: al estar basado en MuRIL, permite comparar el rendimiento de encoders preentrenados en lenguas indias frente a alternativas multilingües genéricas en la misma tarea.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro-F1 | 0,529 | Split held-out propio (12 % del split de entrenamiento HASTIKA) |

No se han publicado resultados de benchmarks en la información disponible más allá del macro-F1 del split held-out indicado por el autor. No hay comparación con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un modelo base tipo BERT (cientos de millones de parámetros), la inferencia en fp32 requiere del orden de unos pocos GB de VRAM, y en fp16 o int8 se reduce a aproximadamente 1-2 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (p. ej. RTX 3060 en adelante) debería poder ejecutar el modelo; no hay datos oficiales de latencia ni throughput.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño base del modelo; no confirmado en la model card.
- Opciones de despliegue: `transformers` (pipeline de text-classification), y por compatibilidad de arquitectura, servidores de inferencia estándar para encoders (TGI, vLLM, ONNX Runtime); no documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hastika-task-b-muril | no disponible (base MuRIL) | no disponible (entrenado a 160 tokens) | Clasificación de categoría objetivo de odio en kanglish | Apache 2.0 | Hugging Face |
| google/muril-base-cased | no disponible (base) | 512 tokens (estándar BERT, no confirmado en la información) | Modelo base multilingüe para lenguas indias | Apache 2.0 | Hugging Face |
| Clasificadores de toxicidad genéricos en inglés | variable | variable | Detección de toxicidad en inglés | variable | variable |

No se dispone en la información proporcionada de resultados de benchmarks comparativos con alternativas de la misma categoría, por lo que la comparación de rendimiento se indica como no disponible.

## Limitaciones y advertencias

- Rendimiento limitado en solitario: el autor indica que el checkpoint es un componente de un ensemble mayor y que, de forma aislada, es más débil (macro-F1 de 0,529 en su held-out).
- Entrenado con un dataset pequeño: se esperan errores en dialectos, sarcasmo, lenguaje reclamado y variantes de transliteración no vistas en entrenamiento.
- Riesgo de falsos negativos y falsos positivos en comentarios ambiguos o irónicos, dado el tratamiento del desbalance solo con pérdida ponderada y sin oversampling.
- Uso previsto como asistencia a moderadores humanos, no como sustituto; el autor lo restringe explícitamente a uso de investigación.
- El dataset HASTIKA no se incluye y sus términos deben consultarse antes de cualquier otro uso.
- Licencia Apache 2.0 para el checkpoint, pero sujeta a las condiciones del dataset de entrenamiento; verificar antes de uso comercial.
- Idiomas limitados a kannada, inglés y su mezcla; no cubre otras lenguas indias ni code-mixing con otros idiomas.
- No se documentan sesgos específicos medidos, aunque al entrenarse sobre comentarios de YouTube de una comunidad concreta puede heredar sesgos de esa muestra.

## Enlaces

- Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hastika-task-b-muril
- Modelo base: https://huggingface.co/google/muril-base-cased
- Cita del dataset: Kavatagi, S. and Rachh, R. (2025). HASTIKA: hate speech and target identification in Kannada-English code-mixed text. *Language Resources and Evaluation*, 59(3):2811-2856.
- Shared task: HASTIKA @ ICON-2026 (no se proporciona URL en la información disponible)
