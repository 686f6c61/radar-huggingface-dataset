# AdithyaaVS/hw1-hc3-detector

## Resumen

hw1-hc3-detector es un modelo publicado en HuggingFace por el usuario AdithyaaVS. Por su identificador y por la existencia de otros repositorios con exactamente el mismo nombre en cuentas distintas (jainatharva21, Aishkrish, Yihangsun), se trata casi con certeza de un ejercicio académico de una asignatura ("hw1"), no de un modelo de propósito general ni de un lanzamiento de producto.

La model card del repositorio está prácticamente vacía: solo contiene el campo `license: unknown`, sin descripción, sin datos de entrenamiento, sin métricas ni instrucciones de uso. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no declara pipeline, idiomas ni licencia.

Dado que otros repositorios homónimos de la misma serie describen el ajuste fino de all-MiniLM-L6-v2 para clasificación binaria (0 = humano, 1 = ChatGPT) sobre respuestas del dataset HC3 en inglés, lo más probable es que este modelo siga el mismo patrón, pero esto no puede confirmarse con la información oficial disponible y debe tratarse como una hipótesis, no como un dato verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente encoder transformer basado en all-MiniLM-L6-v2, según modelos homónimos de la misma serie; no confirmado en la model card) |
| Parámetros totales | no disponible (si se confirma all-MiniLM-L6-v2, serían ~22,7 M) |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (all-MiniLM-L6-v2 admite 256 tokens; no confirmado para este modelo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los modelos homónimos de la serie trabajan con HC3 en inglés) |
| Licencia | unknown (campo declarado en la model card, sin texto de licencia asociado) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No hay información publicada en la model card sobre arquitectura, tamaño, corpus de entrenamiento, número de tokens, composición del dataset ni método de alineación (RLHF, DPO, SFT). Tampoco se documentan hiperparámetros, epochs ni procedimiento de evaluación.

La única referencia indirecta procede de repositorios homónimos de la misma serie, que describen un ajuste fino de all-MiniLM-L6-v2 para clasificación binaria sobre respuestas del dataset HC3 en inglés, con etiquetas 0 = humano y 1 = ChatGPT. all-MiniLM-L6-v2 es un transformer encoder de 6 capas, 384 dimensiones ocultas y ~22,7 M de parámetros, destilado para generar embeddings de frases. Si este repositorio sigue ese esquema, se trataría de una tarea de clasificación de secuencias cortas (detección de texto generado), no de un modelo generativo. Esta afirmación es una inferencia a partir de modelos con nombre idéntico, no un dato confirmado para el repositorio de AdithyaaVS.

## Capacidades

- No hay ninguna capacidad documentada por el autor en la model card.
- Si se confirma la hipótesis de la serie: clasificación binaria de texto (humano frente a generado por ChatGPT) sobre respuestas cortas en inglés.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- No se documenta generación de texto, código, matemáticas ni visión.
- No se documenta modo "thinking" ni ninguna capacidad especial.

## Casos de uso

Ninguno de los siguientes casos está respaldado por documentación del autor; se derivan del propósito probable de la serie (detección de texto generado) y deben validarse antes de cualquier uso real.

- Detección de texto generado por IA en entornos educativos: clasificar respuestas de estudiantes para señalar posibles usos de ChatGPT. Requiere validación previa porque un clasificador binario de este tipo produce falsos positivos con textos humanos formales.
- Moderación de contenido en foros y plataformas: etiquetado automático de publicaciones sospechosas de generación automática para revisión humana posterior.
- Curación de datasets: filtrar respuestas generadas al construir corpus de entrenamiento con mezcla de texto humano y sintético.
- Auditoría de respuestas de chatbots: verificar si las salidas de un sistema conversacional se ajustan al estilo de texto humano esperado en un dominio concreto.
- Investigación en detección de IA: usar el modelo como línea base reproducible en experimentos académicos sobre atribución de autoría.
- Control de calidad en pipelines de contenido: marcar automáticamente artículos o descripciones de producto generados sin revisión editorial antes de su publicación.
- Análisis de integridad documental en periodismo: señalizar borradores o comunicados con alta probabilidad de haber sido generados por un modelo de lenguaje.

En todos los casos, el uso en producción exigiría antes resolver la licencia (actualmente `unknown`), confirmar la arquitectura real y medir la tasa de falsos positivos sobre el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Si el modelo es efectivamente un encoder de ~22,7 M de parámetros, la inferencia cabría en menos de 1 GB de VRAM en fp32 y en unos pocos cientos de MB en cuantización de 8 bits; se trata de una estimación condicional, no de un dato del repositorio.
- GPU recomendadas: no disponible. Con ese orden de magnitud, cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) sería suficiente, e incluso CPU.
- GPU consumer: no confirmado, pero previsiblemente sí si se cumple la hipótesis anterior.
- Opciones de despliegue: no documentadas. No hay ficheros GGUF publicados, ni plantillas de Ollama, ni referencias a vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Autor | Descripción declarada | Licencia | Disponibilidad |
|---|---|---|---|---|
| AdithyaaVS/hw1-hc3-detector | AdithyaaVS | Sin descripción en la model card | unknown | 0 descargas, 0 likes |
| jainatharva21/hw1-hc3-detector | jainatharva21 | all-MiniLM-L6-v2 ajustado para clasificación binaria de respuestas de HC3 (inglés); 0 = humano, 1 = ChatGPT | no disponible | Repositorio público |
| Aishkrish/hw1-hc3-detector | Aishkrish | Sin descripción detallada; registrado en directorios de terceros | no disponible | Repositorio público |
| Yihangsun/hw1-hc3-detector | Yihangsun | Entrada de registro con metadatos pendientes | no disponible | Repositorio público |

No se dispone de datos de rendimiento para ninguno de ellos, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia `unknown`: no hay texto de licencia, por lo que no se puede asumir permiso de uso comercial, modificación ni redistribución. Es un bloqueo directo para cualquier despliegue en producción.
- Model card vacía: sin descripción, sin datos de entrenamiento, sin métricas y sin limitaciones declaradas por el autor.
- 0 descargas y 0 likes: el modelo no tiene validación por parte de la comunidad.
- Riesgo de alucinación y de clasificación errónea: en tareas de detección de texto generado, los falsos positivos sobre texto humano son un problema conocido y con consecuencias graves en contextos educativos o disciplinarios.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento ni el idioma, no se puede evaluar el sesgo por dominio, registro o variedad lingüística.
- Idiomas no declarados: si el ajuste se hizo sobre HC3 en inglés, el rendimiento fuera de ese idioma sería muy probablemente pobre.
- Naturaleza académica: el identificador "hw1" sugiere un trabajo de curso, sin garantía de mantenimiento, soporte ni corrección de errores.
- No hay evidencia de que sea un modelo generativo; si se usa como tal, fallará, ya que lo más probable es que sea un clasificador.

## Enlaces

- https://huggingface.co/AdithyaaVS/hw1-hc3-detector
- https://huggingface.co/jainatharva21/hw1-hc3-detector
- https://huggingface.co/Aishkrish/hw1-hc3-detector
- https://free2aitools.com/model/aishkrish/hw1-hc3-detector
- https://savrn.com/models/hw1-hc3-detector
- https://gptzero.me/
