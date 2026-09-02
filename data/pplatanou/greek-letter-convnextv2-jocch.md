# pplatanou/greek-letter-convnextv2-jocch

## Resumen

El modelo `pplatanou/greek-letter-convnextv2-jocch` es un clasificador de imágenes basado en ConvNeXt V2 Tiny, desarrollado por Paraskevi Platanou y colaboradores (el código fuente se aloja en el repositorio `ipavlopoulos/diachronic-greek-letterforms`). Está diseñado para el reconocimiento de caracteres griegos antiguos manuscritos a partir de recortes individuales en escala de grises, una tarea específica dentro de la paleografía digital y las humanidades digitales. El modelo acompaña el estudio titulado *Graphic Compensation in Ancient Greek Documentary Hands: A Computational Paleographic Analysis from Handwritten Character Recognition*, que investiga la compensación gráfica en manos documentales antiguas mediante reconocimiento de escritura a mano.

La arquitectura emplea un backbone ConvNeXt V2 Tiny (una red convolucional pura moderna) entrenado con una estrategia de entrenamiento propia denominada *Lacuna-based Fragmentation* (LF) combinada con una pérdida contrastiva supervisada dinámicamente aprendida (DSCL). El modelo distingue 24 clases de letras griegas antiguas y alcanza una precisión final en test de 0,8644 y un macro-F1 de 0,8599. Su relevancia radica en proporcionar una herramienta reproducible para el análisis paleográfico computacional de manuscritos antiguos, un campo donde los modelos específicos son escasos y los datos de entrenamiento suelen ser limitados.

El repositorio incluye no solo los pesos del modelo, sino también artefactos para visualización interactiva (embeddings de referencia, proyección UMAP y un reductor joblib), lo que permite a los investigadores explorar las representaciones aprendidas y realizar búsquedas por similitud coseno en el espacio de embeddings normalizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Tiny (red convolucional pura) |
| Parametros totales | 28,6 millones (backbone ConvNeXt V2 Tiny estándar; no se indica si el fine-tuning modifica el conteo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (entrada de imagen de 64x64 píxeles en escala de grises) |
| Tipos de cuantizacion | No disponible (solo se distribuye checkpoint .pth sin cuantizar) |
| Idiomas soportados | No aplica (reconoce caracteres del alfabeto griego antiguo manuscrito) |
| Licencia | No disponible (pendiente de confirmación por los autores; no se especifica en la model card) |
| Formato de pesos | PyTorch checkpoint (.pth) |

## Arquitectura y entrenamiento

El modelo se basa en ConvNeXt V2 Tiny, una arquitectura convolucional pura desarrollada por Meta AI que introduce el *Fully Convolutional Masked Autoencoder* (FCMAE) como método de preentrenamiento auto-supervisado. A diferencia de los transformers de visión, ConvNeXt V2 mantiene la eficiencia de las CNN mientras compite con los ViT en benchmarks de reconocimiento visual. El backbone Tiny tiene aproximadamente 28,6 millones de parámetros y una capacidad adecuada para tareas con conjuntos de datos pequeños, como es el caso de la paleografía.

El entrenamiento del clasificador de caracteres emplea dos innovaciones técnicas propias: *Lacuna-based Fragmentation* (LF), que genera fragmentos de entrenamiento a partir de lagunas (huecos) en los trazos de los caracteres, simulando condiciones reales de deterioro en manuscritos antiguos; y *Dynamically-learned Supervised Contrastive Loss* (DSCL), una función de pérdida contrastiva supervisada cuyos parámetros se aprenden dinámicamente durante el entrenamiento. Esta combinación busca mejorar la robustez del modelo ante variaciones gráficas y ruido, así como aprender representaciones más discriminativas entre clases de letras. La entrada se normaliza a recortes de 64x64 píxeles en escala de grises.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el proceso de anotación. Tampoco se indica si se aplicaron técnicas de aumento de datos adicionales a las mencionadas. El entrenamiento se realizó sobre un conjunto de 24 clases de letras griegas antiguas, y los resultados finales se reportan en términos de precisión y macro-F1 sobre un conjunto de test.

## Capacidades

- Clasificación de caracteres griegos antiguos manuscritos: reconoce 24 clases de letras a partir de recortes individuales de 64x64 píxeles en escala de grises.
- Extracción de embeddings: el modelo produce representaciones normalizadas en el espacio de características de ConvNeXt, útiles para búsqueda de vecinos por similitud coseno.
- Visualización interactiva: incluye artefactos UMAP (embeddings de referencia y reductor joblib) para explorar la estructura del espacio de representaciones.
- Recuperación cuantitativa de vecinos: permite realizar búsquedas de caracteres similares en el espacio de embeddings, lo que facilita el análisis paleográfico comparativo.
- Entrenamiento robusto a deterioro: la estrategia LF simula lagunas en los trazos, mejorando potencialmente la tolerancia a daños en manuscritos reales.
- Diseño específico para investigación: no es un modelo de propósito general; está optimizado para la tarea concreta de clasificación de caracteres históricos.

## Casos de uso

- Investigación paleográfica computacional: los investigadores pueden utilizar el modelo para clasificar automáticamente caracteres en colecciones de manuscritos digitalizados, acelerando el estudio de variaciones gráficas y compensaciones en la escritura documental antigua.
- Análisis de estilos de escritura: mediante los embeddings y la búsqueda de vecinos, es posible agrupar caracteres por similitud estilística, lo que ayuda a identificar manos o talleres de escribas.
- Digitalización y transcripción asistida: en proyectos de digitalización de papiros o pergaminos, el modelo puede preclasificar recortes de caracteres para asistir a transcriptores humanos, reduciendo el esfuerzo manual.
- Educación y divulgación en epigrafía: el demostrador interactivo (que usa los artefactos UMAP) permite a estudiantes y público general explorar visualmente cómo se agrupan las letras griegas antiguas según su forma.
- Evaluación de técnicas de aumento de datos: la estrategia LF puede servir como caso de estudio para otros investigadores que trabajen con datos históricos deteriorados y quieran comparar métodos de fragmentación.
- Desarrollo de pipelines de reconocimiento de escritura histórica: aunque el modelo trabaja solo con caracteres individuales, puede integrarse como componente de un sistema mayor que segmenta líneas de texto en caracteres y luego los clasifica.

## Benchmarks y rendimiento

Los únicos resultados reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Precisión en test | 0,8644 |
| Macro-F1 en test | 0,8599 |

No se proporcionan comparaciones con otros modelos de clasificación de caracteres históricos ni resultados en benchmarks estándar como ImageNet. El modelo está evaluado únicamente sobre su conjunto de test específico, que no se describe en detalle. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo ConvNeXt V2 Tiny (~28,6 millones de parámetros), la inferencia en FP32 requiere aproximadamente 115 MB de VRAM para los pesos, más la memoria de activaciones para una entrada de 64x64, lo que totaliza menos de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GTX 1650, RTX 2060, RTX 3060, o GPUs integradas modernas. No se requieren GPUs de nivel datacenter.
- Compatibilidad con GPU de consumo: sí, el modelo cabe sin problemas en cualquier GPU consumer actual e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un checkpoint PyTorch nativo, se puede cargar con `torch.load` y servir con frameworks como FastAPI, TorchServe o ONNX Runtime si se exporta. No se proporcionan archivos GGUF ni soporte para llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no se proporcionan datos oficiales, pero para una entrada de 64x64, la inferencia en una GPU moderna (RTX 3080) debería ser inferior a 1 ms por imagen; en CPU podría rondar los 10-20 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de caracteres griegos antiguos manuscritos). No existen datos públicos de otros modelos específicos para esta tarea que permitan una comparación directa. Los modelos de ConvNeXt V2 preentrenados en ImageNet podrían adaptarse, pero no hay resultados reportados para esta tarea concreta.

## Limitaciones y advertencias

- Alcance restringido: el modelo solo acepta recortes individuales de caracteres en escala de grises de 64x64; no procesa líneas de texto completas, documentos completos ni fuentes modernas.
- Licencia no definida: la model card indica que la licencia está pendiente de confirmación por los autores. No se debe asumir que es de uso libre; es necesario contactar a los autores antes de cualquier uso comercial o redistribución.
- Riesgo de sesgo en los datos: al estar entrenado sobre un conjunto específico de manuscritos antiguos, el modelo puede no generalizar bien a otros estilos de escritura, períodos o calidades de imagen diferentes a los del entrenamiento.
- Alucinación o errores de clasificación: como todo clasificador, puede confundir clases con formas similares, especialmente en caracteres dañados o fragmentados. No se reporta una matriz de confusión ni análisis de errores por clase.
- Dependencia de la segmentación: en un pipeline real, el modelo asume que los recortes ya están segmentados correctamente; errores en la segmentación previa degradarán el rendimiento.
- Tamaño del repositorio: 0,3 GB puede incluir artefactos pesados (embeddings y UMAP), pero el checkpoint en sí es ligero. No se proporciona información sobre la reproducibilidad del entrenamiento ni los hiperparámetros exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pplatanou/greek-letter-convnextv2-jocch
- Repositorio de código fuente: https://github.com/ipavlopoulos/diachronic-greek-letterforms
- Paper de ConvNeXt V2 (arXiv): https://arxiv.org/abs/2301.00808
- Código oficial de ConvNeXt V2 (GitHub): https://github.com/facebookresearch/ConvNeXt-V2
- Documentación de ConvNeXt V2 en Hugging Face Transformers: https://huggingface.co/docs/transformers/v4.37.0/model_doc/convnextv2
- Perfil de la autora en ACL Anthology: https://aclanthology.org/people/paraskevi-platanou/unverified/
