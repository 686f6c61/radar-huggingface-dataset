# fernandofa42/architecture-doc-type-classifier

## Resumen

Architecture Doc Type Classifier (PT/EN) es un clasificador de texto que determina si un documento de arquitectura de software se corresponde con una de seis categorías: ADR, design doc, guide, playbook, postmortem o teardown. Lo desarrolla Fernando Azevedo (fernandofa42), arquitecto de TI especializado en IA y AWS, y se publica bajo licencia MIT. No es un modelo generativo: es una regresión logística de 6 clases entrenada sobre los embeddings de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, con 2.310 pesos almacenados en JSON plano.

El problema que resuelve es acotado pero práctico: triar y organizar carpetas de documentación técnica bilingüe (portugués e inglés) sin tener que abrir cada fichero. Es relevante para equipos que acumulan ADRs, postmortems y guías en repositorios y wikis, y necesitan etiquetado automático o filtrado previo. El modelo base aporta la codificación multilingüe; la cabeza de clasificación es lineal y muy ligera.

Se trata de un artefacto pequeño y experimental: el conjunto de entrenamiento son 176 muestras derivadas de 88 documentos, y las métricas publicadas (accuracy 0,648, macro F1 0,643 en validación cruzada de 5 folds) reflejan esa escala. El propio autor lo posiciona como herramienta de triaje, no como sistema de decisión autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística de 6 clases sobre embeddings de `paraphrase-multilingual-MiniLM-L12-v2` (transformer MiniLM de 12 capas como extractor congelado) |
| Parametros totales | 2.310 pesos en la cabeza de clasificación (JSON plano); el encoder base no se especifica en la información disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del encoder MiniLM; no se indica en la model card) |
| Tipos de cuantizacion | No aplica; los pesos de la cabeza son JSON de precisión completa. El encoder base admite las cuantizaciones habituales de sentence-transformers, no documentadas aquí |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | JSON plano para la cabeza de clasificación; el encoder se carga vía `sentence-transformers` |
| Pipeline | text-classification |
| Dataset de entrenamiento | `fernandofa42/architecture-decisions-pt-en` (176 muestras de 88 documentos) |
| Métricas declaradas | accuracy, F1 |

## Arquitectura y entrenamiento

El modelo es un pipeline en dos etapas. Primero, un encoder `paraphrase-multilingual-MiniLM-L12-v2` convierte cada documento en un vector de embedding. Después, una regresión logística multiclase aprende a mapear ese vector a una de las seis etiquetas (adr, design-doc, guide, playbook, postmortem, teardown). La cabeza tiene 2.310 pesos y se distribuye como JSON, lo que hace la inferencia trivial de desplegar sin necesidad de frameworks de deep learning más allá del encoder.

El entrenamiento usa 176 muestras provenientes de 88 documentos, cada uno en versión portuguesa e inglesa. La validación es cruzada de 5 folds con una precaución metodológica relevante: las versiones pt y en del mismo documento se mantienen siempre en el mismo fold para evitar fuga de información entre idiomas. Además, los nombres de las etiquetas (`ADR`, `postmortem`, etc.) se enmascaran antes del entrenamiento y de la inferencia, de modo que el clasificador aprende de la estructura y el contenido del texto y no de la mención explícita del tipo de documento. No se documenta uso de RLHF, DPO ni ajuste fino del encoder; la información disponible no detalla la composición exacta del corpus ni el proceso de generación de los datos (el autor indica que son datos generados por IA).

## Capacidades

- Clasificación de documentos de arquitectura de software en seis categorías: ADR, design doc, guide, playbook, postmortem y teardown.
- Funcionamiento bilingüe portugués-inglés, apoyado en el encoder multilingüe MiniLM.
- Predicción sobre texto libre: recibe un fragmento o documento completo y devuelve una de las seis etiquetas.
- Inferencia ligera: la cabeza es una regresión logística en JSON, sin dependencias pesadas más allá del encoder.
- Enmascaramiento de etiquetas explícitas para que la clasificación dependa del contenido real del documento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- No genera texto: es exclusivamente un clasificador.

## Casos de uso

- Triaje de repositorios de documentación: recorrer una carpeta o wiki con ADRs, guías y postmortems mezclados y asignar automáticamente una etiqueta a cada fichero para organizar el índice o la navegación.
- Enrutado en buscadores internos: usar la etiqueta predicha como filtro o faceta en un motor de búsqueda de documentación técnica, de forma que una consulta sobre incidentes priorice postmortems y una consulta sobre decisiones priorice ADRs.
- Clasificación previa a la revisión humana: marcar documentos no etiquetados en un repositorio y enviarlos a revisión, usando la confianza baja como señal de "ninguna de estas categorías" según indica el autor.
- Migración de documentación heredada: procesar lotes de documentos antiguos en portugués e inglés para reconstruir la taxonomía antes de moverlos a una nueva plataforma.
- Automatización de pipelines de documentación: integrar el clasificador como paso en CI para etiquetar nuevos ficheros añadidos a un repositorio de arquitectura y detectar, por ejemplo, postmortems sin categoría asignada.
- Análisis de cobertura documental: contar cuántos documentos de cada tipo existen en una organización y detectar ausencias (por ejemplo, pocos ADRs frente a muchos design docs) como insumo para procesos de gobernanza técnica.
- Demostración y experimentación: servir como ejemplo de clasificador ligero bilingüe sobre embeddings para equipos que quieran replicar el enfoque con su propio corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con validación cruzada de 5 folds manteniendo las versiones pt y en del mismo documento en el mismo fold:

| Métrica | Valor |
|---|---|
| Accuracy | 0,648 |
| Baseline (clase mayoritaria) | 0,284 |
| Macro F1 | 0,643 |

| Clase | F1 | Muestras |
|---|---|---|
| postmortem | 0,92 | 40 |
| guide | 0,71 | 16 |
| teardown | 0,60 | 20 |
| playbook | 0,59 | 26 |
| adr | 0,55 | 50 |
| design-doc | 0,47 | 24 |

No se han publicado resultados frente a modelos comparables ni sobre conjuntos externos. El autor señala que los documentos reales de una empresa probablemente difieran de los datos de entrenamiento y que ese efecto no se ha medido.

## Requisitos de hardware

- VRAM estimada: muy baja. La cabeza de clasificación son 2.310 pesos en JSON (unos pocos kilobytes); el consumo lo determina el encoder MiniLM, que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU. Una CPU moderna es suficiente para clasificar documentos individuales; una GPU consumer (por ejemplo, RTX 3060 o superior) acelera el procesamiento por lotes.
- Cabe en cualquier GPU consumer y también en entornos sin GPU.
- Opciones de despliegue: carga mediante `sentence-transformers` y el script `inference.py` publicado en el repositorio; al ser una regresión logística en JSON, puede servirse con cualquier stack Python (FastAPI, Flask) sin necesidad de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros clasificadores de documentos de arquitectura. Como referencia estructural, se compara con alternativas genéricas de clasificación de texto:

| Modelo | Tipo | Idiomas | Licencia | Comentario |
|---|---|---|---|---|
| architecture-doc-type-classifier | Regresión logística sobre embeddings MiniLM | pt, en | MIT | 6 clases específicas de documentación de arquitectura; 176 muestras de entrenamiento |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Encoder de embeddings | Multilingüe | Apache 2.0 (según el modelo base; no verificado en esta ficha) | Modelo base; no clasifica por sí mismo, requiere una cabeza entrenada |
| Clasificadores zero-shot genéricos (por ejemplo, modelos NLI) | Clasificación por similitud | Multilingüe | Variable | No requieren entrenamiento específico, pero no están ajustados a la taxonomía ADR/design-doc/guide/playbook/postmortem/teardown |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy pequeño: 176 muestras de 88 documentos, lo que limita la generalización.
- Los datos de entrenamiento son generados por IA; el autor advierte que documentos reales de empresa probablemente produzcan métricas inferiores, sin haberlo medido.
- El modelo siempre devuelve una de las seis clases, incluso para textos fuera de dominio (por ejemplo, una receta). Hay que tratar la confianza baja como "ninguna de estas categorías".
- Confusión documentada entre ADR y design-doc (F1 de 0,55 y 0,47 respectivamente), coherente con la práctica real donde muchos ADRs incluyen diseño.
- Cobertura lingüística limitada a portugués e inglés; no se documenta comportamiento en otros idiomas.
- No es un modelo generativo: no produce explicaciones ni texto, solo una etiqueta.
- Licencia MIT, que permite uso comercial y modificación; conviene verificar las condiciones del encoder base al redistribuir.
- Para producción, el autor lo plantea como herramienta de triaje y no como base para decisiones autónomas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fernandofa42/architecture-doc-type-classifier
- Space de demostración: https://huggingface.co/spaces/fernandofa42/architecture-search
- Dataset de entrenamiento: https://huggingface.co/datasets/fernandofa42/architecture-decisions-pt-en
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Autor: https://fernando.moretes.com
