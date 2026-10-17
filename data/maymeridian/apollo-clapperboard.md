# maymeridian/apollo-clapperboard

## Resumen

Apollo clapperboard classifier es un clasificador de imágenes publicado por el usuario maymeridian (16 de octubre de 2026) que estima la probabilidad de que un anuncio de eBay corresponda a una claqueta de cine o televisión original usada en producción, y no a una réplica, un artículo de novedad, un cubo de palomitas, una claqueta en blanco o una simple fotografía de una claqueta. No es un modelo generativo ni un LLM: es un sistema de puntuación binaria compuesto por una torre de visión SigLIP 2 exportada a ONNX y una cabeza de clasificación entrenada aparte en NumPy.

El componente principal es una exportación fp32 a ONNX de la torre de visión de google/siglip2-so400m-patch16-256, que recibe tensores `pixel_values [N,3,256,256]` y devuelve embeddings L2-normalizados de 1152 dimensiones. Sobre esos embeddings se aplica una regresión logística por fotografía, un TF-IDF de n-gramas de caracteres sobre el título del anuncio y un combinador final que mezcla puntuaciones de imagen, texto y precio. El resultado es un único score por anuncio con dos umbrales operativos: REVIEW ≥ 0,36 y FOUND ≥ 0,95.

Su relevancia es acotada pero concreta: resuelve un problema de desambiguación muy específico (detección de utilería original de rodaje frente a imitaciones) dentro del proyecto Apollo, con métricas de validación cruzada publicadas y una licencia Apache-2.0 que permite uso comercial. El repositorio ocupa 1,7 GB y acumula 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un artefacto de nicho y de adopción prácticamente nula fuera de su proyecto de origen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de vision SigLIP 2 (ViT con parches de 16 px a 256x256) exportada a ONNX en fp32, mas una cabeza de clasificacion externa (regresion logistica por foto, TF-IDF de n-gramas de caracteres sobre el titulo y combinador con el precio) en NumPy |
| Parametros totales | No disponible de forma explicita; la torre de vision corresponde a google/siglip2-so400m-patch16-256, cuya nomenclatura SO400M indica del orden de 400 M de parametros en el codificador de vision |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de imagenes; no procesa secuencias de texto) |
| Tipos de cuantizacion | fp32 (ONNX). No se publican variantes fp16, int8 ni GGUF |
| Idiomas soportados | No disponible. El modelo procesa imagenes; la rama de texto opera sobre titulos de anuncios, que en los datos de evaluacion son de eBay en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`siglip2_so400m_256_vision.onnx`, fp32) y NumPy comprimido (`apollo_head.npz`) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas. La primera es una torre de visión SigLIP 2 SO400M/16 a resolución 256x256, exportada a ONNX en fp32, que produce embeddings de imagen L2-normalizados de 1152 dimensiones. La segunda es una cabeza ligera entrenada sobre esos embeddings: una regresión logística por fotografía, un vectorizador TF-IDF de n-gramas de caracteres sobre el título del anuncio y un combinador que agrega las puntuaciones de foto, la puntuación de título y el precio. El fichero `apollo_head.npz` almacena tanto los pesos de la cabeza como un bloque `meta` con la versión del modelo y los umbrales de alerta.

El preprocesado es específico del proyecto Apollo: letterbox a un cuadrado blanco, redimensionado bilineal a 256x256 y escalado a [-1, 1] (implementado en `src/machine/classifier.py:prepare` del repositorio Apollo). La evaluación se realizó con validación cruzada agrupada de 5 particiones sobre 5.205 anuncios de eBay etiquetados a mano, de los cuales 277 eran claquetas originales usadas en producción. La model card no indica si la torre de visión se congeló o se ajustó finamente, ni detalla la composición completa del conjunto de entrenamiento, el número de épocas, la función de pérdida o si se aplicaron técnicas de aumento de datos. No hay RLHF, DPO ni ningún tipo de alineación por preferencias, ya que no es un modelo generativo.

## Capacidades

- Clasificación binaria de imágenes: devuelve la probabilidad de que una fotografía corresponda a una claqueta original usada en producción.
- Descarte explícito de clases negativas: réplicas, artículos de novedad, cubos de palomitas, claquetas en blanco y fotografías de una claqueta en lugar del objeto.
- Extracción de embeddings de imagen genéricos: la torre ONNX emite vectores L2-normalizados de 1152 dimensiones reutilizables para otras tareas de similitud visual.
- Puntuación multimodal ligera por anuncio: combina la señal visual, el texto del título (TF-IDF de n-gramas de caracteres) y el precio en una única puntuación.
- Umbrales operativos predefinidos: REVIEW ≥ 0,36 (el umbral más alto que generó alerta sobre todas las claquetas reales del conjunto de evaluación) y FOUND ≥ 0,95 (mejor F1).
- Capacidades que no tiene: no genera texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso, no tiene modo thinking, no procesa audio ni vídeo y no mantiene conversaciones multi-turno.

## Casos de uso

- Moderación y triaje de anuncios en marketplaces: el modelo puntúa cada listado de eBay (o de cualquier plataforma con fichas similares) y prioriza los que superan el umbral REVIEW ≥ 0,36 para revisión humana, descartando automáticamente los que quedan muy por debajo.
- Detección de fraude en venta de utilería: un vendedor que anuncia una réplica como claqueta original de rodaje puede detectarse combinando la puntuación visual con la del título y el precio, que suele ser anómalamente bajo para una pieza original.
- Automatización de alertas para coleccionistas: el umbral FOUND ≥ 0,95 (mejor F1) permite disparar notificaciones de "encontrado" solo en los casos de alta confianza, reduciendo el ruido en el flujo de avisos.
- Verificación asistida en casas de subasta: antes de aceptar un lote de utilería, el sistema genera una puntuación objetiva por fotografía que sirve como segunda opinión documentada junto al peritaje humano.
- Enriquecimiento y anotación de catálogos: los embeddings de 1152 dimensiones de la torre ONNX pueden indexarse en un motor de similitud vectorial para agrupar anuncios parecidos, detectar duplicados o construir clústeres de utilería de una misma producción.
- Investigación de mercado sobre memorabilia: al puntuar grandes volúmenes de anuncios históricos se puede estimar la proporción de piezas originales frente a réplicas por franquicia, época o vendedor.
- Filtrado previo en pipelines de datos: integrar la torre ONNX como etapa de descarte barata antes de modelos más costosos, aprovechando que el coste por imagen es bajo y que el modelo cabe en CPU.
- Revisión manual priorizada: con la configuración publicada, capturar el 99 % de las claquetas reales requiere revisar 332 alertas, una cifra manejable para un equipo humano pequeño y cuantificada en la propia model card.

## Benchmarks y rendimiento

Resultados de validación cruzada agrupada de 5 particiones sobre 5.205 anuncios de eBay etiquetados a mano (277 claquetas originales usadas en producción), tal como los publica el autor:

| Metrica | Valor |
|---|---|
| PR-AUC | 0,987 |
| ROC-AUC | 0,999 |
| Precision @95% recall | 0,87 |
| Precision @99% recall | 0,83 |
| Alertas necesarias para capturar el 99% | 332 |
| Umbral REVIEW | ≥ 0,36 |
| Umbral FOUND | ≥ 0,95 |

No se han publicado en la información disponible comparaciones de estos resultados con otros clasificadores de claquetas ni con el modelo base en modo zero-shot.

## Requisitos de hardware

- VRAM estimada: en torno a 2 GB para la torre de visión en fp32 (unos 1,6 GB de pesos más activaciones), dado que el repositorio completo ocupa 1,7 GB y la cabeza en NumPy es de tamaño despreciable.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; por ejemplo GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque estas dos últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales y en muchas integradas, al no requerir cuantización para entrar en memoria.
- Ejecución en CPU: viable con ONNX Runtime para lotes pequeños o moderados, ya que el modelo no necesita aceleración dedicada para funcionar.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA o TensorRT) para la torre y Python con NumPy para la cabeza. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La model card no publica tiempos de inferencia ni caudal por segundo.

## Comparativa con modelos similares

| Modelo | Proposito | Salida | Licencia | Disponibilidad | Rendimiento comparable |
|---|---|---|---|---|---|
| maymeridian/apollo-clapperboard | Clasificador de claquetas originales en anuncios | Probabilidad por anuncio y embedding de 1152 dim | Apache-2.0 | HuggingFace, ONNX + npz | PR-AUC 0,987 en su conjunto de evaluacion |
| google/siglip2-so400m-patch16-256 (modelo base) | Vision-lenguaje generico (contrastivo imagen-texto) | Embeddings de imagen y texto | Apache-2.0 | HuggingFace | No disponible para esta tarea en zero-shot |
| Clasificadores de imagenes genericos ajustados (por ejemplo ResNet, ViT o ConvNeXt) | Clasificacion de imagenes de proposito general | Logits por clase | Variable segun modelo | Amplia | No disponible |
| Reglas manuales o revision humana sobre anuncios | Triaje de listados | Decision binaria | No aplica | No aplica | No disponible |

No se conocen en la información proporcionada otros clasificadores publicados especificamente para claquetas de producción, por lo que la comparación de rendimiento frente a alternativas directas no está disponible.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo está entrenado y evaluado sobre anuncios de eBay relacionados con claquetas; su comportamiento fuera de ese contexto (otras plataformas, otros objetos de utilería, otras condiciones fotográficas) no está caracterizado.
- Conjunto de evaluación pequeño y desbalanceado: 5.205 anuncios con solo 277 positivos, lo que deja una muestra limitada de casos reales y aumenta la varianza de las métricas en subgrupos.
- Caída de precisión a alto recall: con el umbral FOUND la precisión notificada es de 0,87 al 95 % de recall y de 0,83 al 99 %, lo que implica falsos positivos que requieren revisión humana.
- Dependencia de la rama de texto: parte de la señal procede del título del anuncio y del precio, por lo que títulos en otros idiomas, malformados o deliberadamente engañosos pueden degradar la puntuación.
- Idiomas soportados no documentados: no se especifica qué idiomas maneja la rama de texto; los datos de evaluación parecen ser de anuncios en inglés.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea confiada en imágenes ambiguas, con iluminación pobre, recortes o collages.
- Sesgos conocidos: no se documentan análisis de sesgo por vendedor, procedencia geográfica, tipo de producción o calidad fotográfica.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin señales de uso en producción por terceros.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero la model card no incluye cláusulas de exención de responsabilidad específicas ni garantías sobre la exactitud de las clasificaciones; conviene tratar la salida como señal auxiliar, no como peritaje definitivo.
- Caveat de producción: el modelo requiere que se replique exactamente el preprocesado del proyecto Apollo (letterbox a cuadrado blanco, bilineal a 256x256, escalado a [-1, 1]) y que se use la cabeza `apollo_head.npz` correspondiente, ya que los umbrales de alerta dependen de esa combinación.
- Fechas del repositorio: la model card y los metadatos indican creación el 16 de octubre de 2026, dato que se reproduce tal cual figura en la información consultada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maymeridian/apollo-clapperboard
- Repositorio del proyecto Apollo: https://github.com/maymeridian/apollo
- Informe completo de resultados: `reports/README.md` dentro del repositorio Apollo
- Modelo base: https://huggingface.co/google/siglip2-so400m-patch16-256
- Búsqueda web: no se han encontrado enlaces adicionales relevantes (los resultados devueltos correspondían a páginas de ayuda de YouTube y a hilos de Zhihu sin relación con el modelo).
