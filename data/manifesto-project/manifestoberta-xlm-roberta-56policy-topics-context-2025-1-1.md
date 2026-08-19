# manifesto-project/manifestoberta-xlm-roberta-56policy-topics-context-2025-1-1

## Resumen

ManifestoBERTa es un modelo de clasificación de textos basado en XLM-RoBERTa-large, desarrollado por el equipo del Manifesto Project (WZB Berlin Social Science Center). Su función es categorizar cualquier texto en 56 temas políticos según el esquema de codificación del Manifesto Project (Handbook 4). El modelo ha sido ajustado (fine-tuning) sobre aproximadamente 1,8 millones de declaraciones anotadas del Manifesto Corpus (versión 2025a), lo que lo convierte en una herramienta especializada para el análisis automático de programas electorales, discursos políticos y otros documentos similares.

La variante "context" presentada aquí incorpora las oraciones circundantes de cada declaración para mejorar la clasificación de frases ambiguas. Esta innovación, junto con una modificación en la cabeza de clasificación (eliminación de la capa tanh y la capa lineal intermedia), logra una mejora de alrededor del 7% en precisión respecto a la versión sin contexto. El modelo es multilingüe, con un rendimiento óptimo en los 40 idiomas presentes en el corpus de entrenamiento, aunque es aplicable a todos los idiomas soportados por XLM-RoBERTa.

Con 560 millones de parámetros y una longitud de contexto efectiva de 400 tokens (300 para el contexto y 100 para la declaración), ManifestoBERTa es una solución práctica para investigadores y analistas que necesitan etiquetar grandes volúmenes de texto político de forma fiable y reproducible. Su licencia open-source (BigScience OpenRAIL-M) permite su uso comercial y académico sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa-large (Transformer encoder) con cabeza de clasificación modificada |
| Parametros totales | 560.005.232 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 400 tokens (según ejemplo de uso: 100 para la declaración + 300 para contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingüe (XLM-RoBERTa) – mejor rendimiento en 40 idiomas del Manifesto Corpus (ver documentación) |
| Licencia | bigscience-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ManifestoBERTa parte de la arquitectura XLM-RoBERTa-large, un transformer encoder preentrenado con 560M parámetros. Sobre esta base se ha modificado la cabeza de clasificación original: se eliminaron la activación tanh y la capa lineal intermedia de `XLMRobertaModelForSequenceClassification`, lo que mejoró notablemente el rendimiento para esta tarea. Esta modificación requiere cargar el modelo con `trust_remote_code=True`.

El entrenamiento se realizó sobre 1.626.038 quasi-sentences del Manifesto Corpus (versión 2025a), reservando un 10% de los datos para evaluación. Para evitar fugas de datos, la partición se hizo a nivel de manifiesto: 1.759 manifiestos completos para entrenamiento y 201 para test. Los hiperparámetros fueron: learning rate 1e-5, weight decay 0.01, 1 época, warm-up ratio 0.6, batch size 16 por dispositivo y gradientes acumulados cada 2 pasos.

La innovación principal es el uso de un par de oraciones como entrada: la declaración a clasificar seguida de un token separador y el contexto circundante (hasta 300 tokens). Este enfoque permite al modelo interpretar afirmaciones ambiguas apoyándose en el discurso que las rodea. Se probaron alternativas como dos modelos separados o capas compartidas, pero el par de oraciones resultó igual de eficaz con menor coste computacional.

## Capacidades

- Clasificación de textos en 56 categorías políticas según el esquema del Manifesto Project (Handbook 4), como "Libertad y Derechos Humanos", "Internacionalismo: Positivo", "Militar: Negativo", etc.
- Procesamiento de entradas de pares (declaración + contexto) para mejorar la precisión en oraciones ambiguas.
- Soporte multilingüe: funciona en todos los idiomas de XLM-RoBERTa, con rendimiento óptimo en los 40 idiomas del corpus (incluye español, inglés, francés, alemán, etc.).
- Salida probabilística sobre las 56 clases, permitiendo análisis de confianza y umbrales personalizados.
- Integración sencilla con la biblioteca Transformers de Hugging Face mediante `AutoModelForSequenceClassification`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un clasificador de secuencias.

## Casos de uso

- Análisis de programas electorales: los partidos políticos pueden procesar automáticamente sus propios programas o los de sus oponentes para identificar énfasis temáticos y comparar posiciones.
- Investigación académica en ciencia política: los investigadores pueden etiquetar grandes corpus de textos políticos (discursos, leyes, declaraciones) para estudiar cambios en la agenda política a lo largo del tiempo.
- Monitoreo de discursos parlamentarios: clasificación de intervenciones en debates para detectar temas dominantes y evolución de prioridades legislativas.
- Análisis de noticias y medios: categorización de artículos periodísticos según su temática política para estudios de framing o cobertura mediática.
- Automatización de procesos de codificación manual: sustitución o apoyo a anotadores humanos en proyectos que requieran etiquetado consistente de textos políticos, reduciendo tiempo y coste.
- Comparación internacional de sistemas políticos: aplicación del mismo modelo a documentos en distintos idiomas para generar datos comparables entre países.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la inclusión de contexto mejoró la precisión en aproximadamente un 7% respecto a la variante sin contexto, pero no se ofrecen cifras absolutas de accuracy, F1 u otras métricas sobre el conjunto de test.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la documentación del modelo.
- Basado en el tamaño del modelo (560M parámetros), la inferencia en FP16 requiere aproximadamente 1,1 GB de VRAM solo para los pesos, más overhead de activaciones y memoria intermedia. Se estima que una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en FP16.
- Para lotes grandes o despliegue en producción, se recomienda una GPU con 8 GB o más (RTX 3060, RTX 3070, A10, etc.).
- El modelo se puede cargar con la biblioteca Transformers de Hugging Face, y también es compatible con frameworks de inferencia como vLLM o TGI, aunque al ser un modelo de clasificación con `trust_remote_code`, la integración puede requerir ajustes adicionales.
- La inferencia en CPU es posible, pero será significativamente más lenta; se recomienda GPU para procesamiento de grandes volúmenes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, se puede señalar que la mayoría de alternativas para clasificación de textos políticos son modelos genéricos de clasificación (p. ej., BERT, RoBERTa, XLM-R) ajustados para tareas específicas, pero no existe una comparativa directa publicada con este modelo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con el Manifesto Corpus, que contiene principalmente programas electorales y textos políticos formales. Su rendimiento puede degradarse en dominios muy diferentes (p. ej., textos informales, redes sociales, literatura).
- La longitud de contexto está limitada a 400 tokens, lo que puede ser insuficiente para documentos largos; se requiere truncamiento o estrategias de ventana deslizante.
- Aunque es multilingüe, el rendimiento óptimo se limita a los 40 idiomas del corpus; idiomas no representados pueden obtener resultados menos fiables.
- El esquema de clasificación (56 temas) es específico del Manifesto Project; no es un clasificador general de sentimientos o temas.
- La necesidad de `trust_remote_code=True` implica ejecutar código personalizado del repositorio, lo que requiere revisión de seguridad en entornos de producción.
- La licencia BigScience OpenRAIL-M permite uso comercial, pero es recomendable revisar sus términos exactos para aplicaciones de alto riesgo.
- No se han publicado métricas de sesgo o robustez; el modelo puede reflejar los sesgos presentes en los manifiestos políticos (p. ej., sobrerrepresentación de ciertos temas o regiones).

## Enlaces

- [Hugging Face - modelo](https://huggingface.co/manifesto-project/manifestoberta-xlm-roberta-56policy-topics-context-2025-1-1)
- [Manifesto Corpus](https://manifesto-project.wzb.eu/information/documents/corpus)
- [Esquema de codificación Handbook 4](https://manifesto-project.wzb.eu/coding_schemes/mp_v4)
