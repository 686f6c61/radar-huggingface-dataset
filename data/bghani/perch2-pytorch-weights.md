# bghani/perch2-pytorch-weights

## Resumen

Perch v2 es un modelo fundacional de bioacústica desarrollado por Google Research, diseñado para clasificar vocalizaciones de especies animales y generar embeddings transferibles a partir de audio. Este repositorio concreto (`bghani/perch2-pytorch-weights`) contiene una conversión independiente de la comunidad de los pesos del backbone de Perch v2 al formato PyTorch, extraídos del SavedModel original en JAX/Flax y adaptados para ser compatibles con la implementación `tf_efficientnet_b3` de la librería `timm`.

El modelo resuelve el problema de la falta de pesos PyTorch entrenables para Perch v2: las distribuciones oficiales (ONNX y TFLite) son solo de inferencia y no disponen de grafo de autograd, lo que impide el fine-tuning profundo. Esta conversión permite extracción de características congeladas, linear probing y fine-tuning completo, con una arquitectura EfficientNet-B3 de entrada monoaural que produce embeddings de 1536 dimensiones. La relevancia actual radica en que Perch 2.0 amplía el entrenamiento original (exclusivamente aviar) a un dataset multi-taxa, y esta conversión facilita su uso en el ecosistema PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B3 (`tf_efficientnet_b3` de timm), entrada monoaural (`in_chans=1`), sin cabeza de clasificacion |
| Parametros totales | No disponible (arquitectura EfficientNet-B3 de timm; cifra exacta no publicada en el repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de audio); entrada de clips de 5 segundos a 32 kHz (160.000 muestras) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de audio bioacustico, no textual) |
| Licencia | Apache 2.0 (heredada del lanzamiento original de Perch v2) |
| Formato de pesos | State dict de PyTorch (archivo `.pt`: `perch_v2_backbone_timm.pt`) |

## Arquitectura y entrenamiento

El backbone es un EfficientNet-B3 estándar de `timm` con la entrada modificada a un solo canal (espectrograma log-mel), y la cabeza de clasificación eliminada para devolver directamente un embedding agrupado de 1536 dimensiones. Los pesos se extrajeron del SavedModel original de Google en JAX/Flax (`infer.graph.variables`) y se convirtieron a un state dict compatible con PyTorch. La validación por bloques (stem, bloques expand, bloques residuales y cabeza) mostró similitud coseno superior a 0.999, pero la similitud coseno de la red completa se estabiliza en torno a 0.80, probablemente debido a errores numéricos acumulados a través de los 26 bloques MBConv secuenciales.

El modelo original Perch 2.0 se entrenó de forma supervisada con autodestilación (self-distillation) sobre un dataset multi-taxa que amplía el enfoque exclusivamente aviar de Perch 1.0, proporcionando tanto puntuaciones de clasificación directas para miles de especies vocalizadoras como embeddings robustos para transferencia de aprendizaje. Esta conversión comunitaria no es una reproducción bit-exacta del modelo de Google, sino una inicialización preentrenada sólida para fine-tuning.

## Capacidades

- Extracción de embeddings bioacústicos de 1536 dimensiones a partir de clips de audio de 5 segundos a 32 kHz.
- Clasificación de vocalizaciones de especies animales (multi-taxa: aves y otros taxa) mediante linear probing sobre el backbone congelado.
- Fine-tuning profundo del backbone completo para tareas de clasificación personalizadas.
- Transferencia de aprendizaje desde un modelo preentrenado sobre un amplio dataset de vocalizaciones.
- Compatibilidad con el frontend de Perch (`PerchFrontend`) para el cálculo de espectrogramas log-mel.
- Integración con el ecosistema PyTorch estándar (Hugging Face Hub, `torch`, `timm`).

## Casos de uso

- Monitoreo de biodiversidad aviar: el modelo puede clasificar vocalizaciones de cientos de especies en grabaciones de campo, permitiendo censos automatizados de avifauna en reservas naturales mediante el despliegue de grabadoras autónomas.
- Detección de especies en peligro de extincion: organizaciones de conservación pueden entrenar clasificadores específicos con linear probing sobre el backbone congelado para detectar llamadas de especies amenazadas en tiempo real, sin necesidad de grandes conjuntos de datos etiquetados.
- Evaluacion de impacto ambiental: consultoras ambientales pueden analizar grabaciones acusticas antes y despues de proyectos de infraestructura para cuantificar cambios en la presencia y actividad de especies, gracias a la capacidad de fine-tuning con pocos ejemplos.
- Estudios fenologicos: investigadores pueden correlacionar patrones de vocalizacion estacional con variables climaticas, usando los embeddings de 1536 dimensiones como caracteristicas para modelos de series temporales.
- Investigacion en ecologia del comportamiento: el fine-tuning completo permite adaptar el modelo a especies o dialectos regionales especificos, capturando variaciones sutiles en las vocalizaciones que los modelos genericos no discriminan.
- Ciencia ciudadana y educacion: plataformas colaborativas pueden integrar el modelo para identificar automaticamente especies en grabaciones subidas por voluntarios, con la ventaja de que la licencia Apache 2.0 permite su redistribucion en proyectos sin fines de lucro.
- Monitoreo de mamiferos marinos: al ser multi-taxa, el modelo puede adaptarse mediante transferencia a vocalizaciones de cetaceos y pinnipedos, aunque requiere fine-tuning adicional por la diferencia acustica respecto a aves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible, ya que se trata de un modelo de audio bioacustico, no textual. La unica validacion documentada en el repositorio es la similitud coseno entre los pesos convertidos y el modelo original de Google:

| Metrica de validacion | Valor |
|---|---|
| Similitud coseno por bloques (stem, expand, residual, head) | > 0.999 |
| Similitud coseno de la red completa | ~0.80 |

Esta discrepancia indica que los pesos no son bit-exactos y deben tratarse como una inicializacion fuerte para fine-tuning, no como una reproduccion fiel para extraccion de embeddings congelados.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentacion; al tratarse de un EfficientNet-B3 (arquitectura ligera), se espera que sea considerablemente inferior a la de modelos transformer grandes, pero no se proporcionan cifras concretas.
- GPU recomendadas: no especificadas; por la naturaleza de la arquitectura, deberia ejecutarse en GPUs de consumo como RTX 3060 o superiores, aunque no esta confirmado.
- Compatibilidad con GPU de consumo: probable, dado el tamano reducido del modelo, pero no confirmado en la documentacion.
- Opciones de despliegue: el repositorio proporciona una API Python nativa (`perchv2_pytorch` con `Perch2Embedder` y `Perch2Classifier`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que son especificas de modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Entrenamiento | Autograd | Licencia |
|---|---|---|---|---|---|
| bghani/perch2-pytorch-weights (este) | EfficientNet-B3 | PyTorch (.pt) | Multi-taxa, autodestilacion | Si (fine-tuning completo) | Apache 2.0 |
| justinchuby/Perch-onnx (oficial) | EfficientNet-B3 | ONNX/TFLite | Multi-taxa, autodestilacion | No (solo inferencia) | Apache 2.0 |
| cgeorgiaw/Perch (Perch v1) | EfficientNet-B3 | No especificado | Solo aves | No especificado | No especificada |

La diferencia principal frente a la distribucion oficial es la capacidad de entrenamiento: los pesos ONNX/TFLite oficiales no tienen grafo de autograd, mientras que esta conversion PyTorch permite fine-tuning. Frente a Perch v1, la ventaja es el entrenamiento multi-taxa de Perch 2.0.

## Limitaciones y advertencias

- Conversion independiente de la comunidad, no un lanzamiento oficial de Google; los pesos no son bit-exactos respecto al original (similitud coseno de red completa ~0.80).
- Para embeddings congelados que requieran exactitud bit a bit, se recomienda usar la distribucion oficial ONNX/TFLite en lugar de estos pesos.
- La similitud coseno por bloques es alta (>0.999), pero el error numerico se acumula a lo largo de los 26 bloques MBConv, lo que puede afectar a tareas de extraccion de caracteristicas de alta precision.
- No se proporcionan datos sobre sesgos del modelo, riesgos de alucinacion (no aplica a audio) o limitaciones de idioma; al ser un modelo de audio, las consideraciones de sesgo se centran en la cobertura taxonomica y geografica del dataset de entrenamiento, no documentada aqui.
- La licencia Apache 2.0 permite uso comercial, pero se requiere atribucion al trabajo derivado segun el aviso NOTICE del repositorio principal.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bghani/perch2-pytorch-weights
- Repositorio GitHub principal (perchv2-pytorch): https://github.com/bghani/perchv2-pytorch
- Repositorio oficial de Perch de Google: https://github.com/google-research/perch
- Pagina del modelo original en Kaggle: https://www.kaggle.com/models/google/bird-vocalization-classifier
- Distribucion oficial ONNX: https://huggingface.co/justinchuby/Perch-onnx
- Paper Perch 2.0 (arXiv:2508.04665): https://arxiv.org/html/2508.04665v1
- PDF del paper: https://arxiv.org/pdf/2508.04665
- Perch v1 en HuggingFace: https://huggingface.co/cgeorgiaw/Perch
