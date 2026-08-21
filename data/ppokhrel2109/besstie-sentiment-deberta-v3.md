# ppokhrel2109/besstie-sentiment-deberta-v3

## Resumen

El modelo `ppokhrel2109/besstie-sentiment-deberta-v3` es un clasificador de sentimiento binario (positivo/negativo) especializado en tres variedades del inglés: australiana, británica e india. Desarrollado por ppokhrel2109, se basa en el modelo `microsoft/deberta-v3-base` y se ha ajustado con el benchmark BESSTIE, un recurso académico reciente (ACL 2025) diseñado para evaluar el sesgo dialectal en tareas de sentimiento y sarcasmo. El modelo resuelve el problema de que los clasificadores de sentimiento estándar suelen estar entrenados predominantemente con inglés estadounidense, lo que degrada su rendimiento en otras variedades.

Con 184 millones de parámetros, el modelo ofrece una latencia de aproximadamente 25 ms por predicción en CPU, lo que lo hace adecuado para aplicaciones en tiempo real sin necesidad de hardware especializado. Su relevancia actual radica en la creciente demanda de herramientas de análisis de opinión que funcionen de manera equitativa entre dialectos, especialmente en contextos multilingües y multiculturales. La licencia MIT permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3 (encoder transformer) |
| Parametros totales | 184.423.682 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles australiano, britanico e indio) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, un transformer encoder con atencion desenredada y mascaras de atencion mejoradas. Se ha realizado un ajuste fino (fine-tuning) para clasificacion de secuencias con dos clases (positivo/negativo). El entrenamiento utilizo cross-entropy ponderada por clase para mitigar el desequilibrio entre clases, y se ejecuto con cinco semillas diferentes para evaluar la estabilidad. El umbral de decision no se fija en 0.5 sino que se ajusto sobre una particion retenida del conjunto de entrenamiento, aplicando una temperatura de 1.9059 a los logits antes del softmax y un umbral de 0.210 sobre la probabilidad resultante. Este procedimiento es critico: usar `argmax` o un umbral estandar degrada significativamente el rendimiento.

El conjunto de datos BESSTIE incluye comentarios de Reddit y resenas de Google en las tres variedades de ingles, con anotaciones de sentimiento y sarcasmo. El modelo se evalua en la particion de validacion oficial, mientras que la particion de test esta retenida por los autores del benchmark.

## Capacidades

- Clasificacion de sentimiento binario (positivo/negativo) para ingles australiano, britanico e indio.
- Deteccion de sarcasmo, evaluada exclusivamente sobre el subconjunto de Reddit del benchmark.
- Manejo de textos cortos y coloquiales, como comentarios en redes sociales y resenas de usuarios.
- Inferencia rapida en CPU (aproximadamente 25 ms por prediccion).
- Compatible con la libreria transformers y con text-embeddings-inference para despliegue en produccion.
- No incluye generacion de texto, tool calling ni capacidades multimodales; es un modelo puramente discriminativo.

## Casos de uso

- Analisis de sentimiento en redes sociales para marcas que operan en Australia, Reino Unido e India: el modelo puede procesar comentarios de Twitter, Reddit o Facebook en tiempo real, identificando opiniones positivas y negativas con mayor precision que un clasificador generico entrenado en ingles estadounidense.
- Monitorizacion de resenas de Google para negocios locales: permite a pequenos comercios en paises angloparlantes no estadounidenses detectar quejas o elogios en resenas escritas en su dialecto local.
- Investigacion en sociolinguistica computacional: el modelo sirve como herramienta para estudiar diferencias dialectales en la expresion de emociones y sarcasmo, comparando el rendimiento entre variedades.
- Filtrado de contenido en plataformas de comentarios: puede clasificar automaticamente comentarios toxicos o negativos en foros y secciones de noticias, adaptandose a la variedad linguistica de la audiencia.
- Analisis de encuestas de satisfaccion en empresas multinacionales: las respuestas abiertas de clientes en ingles britanico, australiano o indio pueden clasificarse sin necesidad de modelos separados por region.
- Deteccion de sarcasmo en redes sociales para moderacion de contenido: aunque el rendimiento en sarcasmo es limitado, puede integrarse como senal adicional en sistemas de moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la linea base de clase mayoritaria obtiene una macro-F1 de aproximadamente 0.46 en la tarea, y que puntuaciones cercanas a 0.50 indican ausencia de aprendizaje, pero no se proporcionan las cifras exactas del modelo. El autor indica que los resultados completos estan en el repositorio de GitHub, aunque no se han encontrado en la busqueda web.

## Requisitos de hardware

- Inferencia en CPU: aproximadamente 25 ms por prediccion, segun la model card.
- VRAM estimada: al ser un modelo de 184M parametros, la inferencia en GPU requiere menos de 1 GB de VRAM en precision FP32; con cuantizacion a 8 bits o 4 bits, el consumo es aun menor.
- GPUs compatibles: cualquier GPU con al menos 2 GB de VRAM, incluyendo GTX 1050 Ti, RTX 2060, RTX 3060, etc. Tambien funciona en Apple Silicon y CPUs modernas.
- Opciones de despliegue: transformers (Python), text-embeddings-inference (segun los tags), y potencialmente ONNX Runtime o TensorRT si se exporta el modelo.
- Latencia: 25 ms por prediccion en CPU; en GPU la latencia seria inferior a 5 ms, aunque no se dispone de datos exactos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos de la misma categoria. El modelo es un ajuste fino de DeBERTa-v3-base, y existen otros clasificadores de sentimiento como `cardiffnlp/twitter-roberta-base-sentiment-latest` o `distilbert-base-uncased-finetuned-sst-2-english`, pero no se han encontrado datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo fue evaluado solo en la particion de validacion oficial; la particion de test esta retenida, por lo que el rendimiento real en datos no vistos podria diferir.
- La variedad en-IN (ingles indio) es la mas debil, con menos ejemplos de sarcasmo en el entrenamiento, lo que puede provocar errores sistematicos en ese dialecto.
- El entrenamiento se realizo con comentarios de Reddit y resenas de Google; otros dominios (noticias, textos formales, conversaciones orales) estan fuera de distribucion y el rendimiento puede degradarse.
- Es imprescindible aplicar la temperatura (1.9059) y el umbral (0.210) en el orden indicado. Un umbral ajustado sobre probabilidades sin escalar etiquetaria todas las entradas como positivas.
- El modelo no distingue entre sentimiento neutro y negativo; solo produce dos clases, lo que puede ser insuficiente para aplicaciones que requieran granularidad.
- No se han documentado sesgos especificos, pero al estar entrenado en datos de Reddit y Google, puede reflejar sesgos presentes en esas plataformas (lenguaje informal, jerga, etc.).

## Enlaces

- HuggingFace: https://huggingface.co/ppokhrel2109/besstie-sentiment-deberta-v3
- Paper BESSTIE (arXiv): https://arxiv.org/abs/2412.04726
- PDF del paper (ACL 2025): https://aclanthology.org/2025.findings-acl.441.pdf
- Repositorio de codigo y resultados: https://github.com/Pranav210901/Besstie-improvement-attempt
- Poster ACL 2025: https://dipteshkanojia.co.uk/files/poster-acl-2025-BESSTIE.pdf
