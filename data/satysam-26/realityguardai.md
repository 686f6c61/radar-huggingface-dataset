# Satysam-26/RealityGuardAI

## Resumen

RealityGuardAI es un motor de detección de deepfakes desarrollado por Satysam-26, diseñado para identificar artefactos visuales, anomalías de comportamiento y desincronización audiovisual en vídeos e imágenes generados por IA. El repositorio de HuggingFace aloja únicamente el componente de visión profunda del pipeline completo: una CNN ligera de clasificación binaria (real/falso) que opera en la etapa 7.3 del sistema multimodal. El modelo está pensado para ejecutarse en CPU, con un peso de aproximadamente 100 KB, lo que lo hace adecuado para dispositivos con recursos limitados.

La relevancia actual de este modelo radica en la creciente necesidad de herramientas de verificación de contenido ante la proliferación de vídeos e imágenes sintéticas. A diferencia de los grandes modelos transformer, esta CNN está optimizada para inferencia rápida en entornos de borde, aunque su alcance se limita a la detección de artefactos en recortes faciales, dependiendo de otros módulos del pipeline para una robustez completa. El proyecto se publica bajo licencia Apache 2.0 y cuenta con un DOI asociado en Zenodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial de 3 capas convolucionales con Adaptive Average Pooling y MLP de 2 capas |
| Parametros totales | no disponible (tamano del archivo de pesos: ~100 KB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch State Dictionary (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial de tres capas convolucionales con kernel 3x3, activaciones ReLU y MaxPooling 2x2, seguida de una capa de Adaptive Average Pooling que reduce la salida a 1x1 y un clasificador MLP con una capa oculta de 32 neuronas, Dropout al 20% y una capa final de 2 salidas (real/falso). El modelo acepta imagenes RGB de entrada y produce una puntuacion binaria. No se especifican detalles sobre el dataset de entrenamiento, el numero de epocas, ni si se utilizaron tecnicas de aumento de datos o regularizacion adicional. La model card indica que el modelo fue entrenado para detectar artefactos generativos (trazos de GAN/difusion, ruido de upscaling), inconsistencias de blending a nivel de pixel y anomalias estructurales de los motores de renderizado de deepfakes. No hay informacion sobre el proceso de entrenamiento, como la funcion de perdida, el optimizador o la metrica de validacion.

## Capacidades

- Clasificacion binaria de recortes faciales: distingue entre imagenes reales y falsas (0 = real, 1 = falso).
- Deteccion de artefactos generativos: identifica trazas tipicas de GAN y modelos de difusion, incluyendo ruido de upscaling y patrones de reconstruccion.
- Analisis de inconsistencias de blending: detecta regiones donde una cara sintetica se ha insertado sobre una cabeza real, mediante anomalias en la transicion de pixeles.
- Deteccion de anomalias estructurales: senala deformaciones o irregularidades introducidas por los motores de renderizado de deepfakes.
- Inferencia en CPU: disenado para ejecutarse en hardware estandar sin GPU, con un peso de aproximadamente 100 KB.
- Integracion con pipeline multimodal: funciona como modulo de vision (etapa 7.3) dentro del sistema completo RealityGuardAI, que incluye deteccion de sincronizacion labial, analisis de parpadeo y extraccion de caracteristicas clasicas.

## Casos de uso

- Moderacion de contenido en plataformas sociales: el modelo puede integrarse en sistemas de revision automatica para marcar videos o imagenes sospechosos de ser deepfakes, reduciendo la carga de moderadores humanos. Su bajo peso permite ejecutarlo en servidores sin GPU.
- Verificacion de identidad en videollamadas: combinado con los modulos de sincronizacion labial y analisis de comportamiento del pipeline completo, puede ayudar a detectar suplantaciones en tiempo real durante entrevistas o procesos de autenticacion remota.
- Auditoria de medios periodisticos: equipos de fact-checking pueden usar el modelo como primer filtro para identificar material potencialmente manipulado antes de una revision manual mas profunda.
- Analisis forense de evidencias digitales: en contextos legales, el modelo puede proporcionar una indicacion inicial de si una imagen o video ha sido generado por IA, aunque se requiere validacion adicional con tecnicas clasicas y expertos.
- Filtrado de contenido en redes sociales: integrado en pipelines de ingestion de imagenes, puede descartar automaticamente contenido sintetico no deseado o etiquetarlo para revision.
- Investigacion academica sobre deteccion de deepfakes: el modelo sirve como punto de partida para comparar tecnicas de deteccion de artefactos en recortes faciales, especialmente en entornos con recursos computacionales limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1 ni comparaciones con otros modelos de deteccion de deepfakes. Tampoco se proporcionan datos de latencia o throughput en CPU.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM, ya que esta disenado para inferencia en CPU.
- GPU recomendadas: ninguna; el modelo se ejecuta en CPU estandar.
- Compatibilidad con GPU de consumo: no aplica, aunque puede ejecutarse en cualquier GPU si se desea acelerar, pero no es necesario.
- Opciones de despliegue: integrable en proyectos PyTorch mediante `huggingface_hub`; tambien puede exportarse a otros formatos (ONNX, TorchScript) si se requiere.
- Latencia y throughput: no disponibles, pero dado el tamano de ~100 KB y la arquitectura de 3 capas convolucionales, se espera una inferencia en milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (deteccion de deepfakes con CNNs ligeras). La model card no menciona alternativas ni benchmarks comparativos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sensibilidad a la resolucion: el modelo esta optimizado para recortes faciales bien iluminados y claramente visibles. Compresiones fuertes (por ejemplo, videos de 144p de WhatsApp) pueden aumentar la tasa de falsos positivos.
- Dependencia del pipeline completo: el modelo por si solo no es suficiente para una deteccion robusta; debe combinarse con los modulos de sincronizacion labial, analisis de parpadeo y extraccion de caracteristicas clasicas del repositorio principal.
- Alcance limitado: solo analiza recortes faciales; no procesa videos completos ni senales de audio directamente.
- Sesgos potenciales: no se documentan sesgos especificos, pero al ser un modelo entrenado probablemente con datos de caras, podria tener un rendimiento desigual en diferentes etnias, condiciones de iluminacion o calidades de imagen.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir clasificaciones erroneas en imagenes con artefactos de compresion o ediciones no generativas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe citar el DOI correspondiente segun la model card.
- Ausencia de documentacion de entrenamiento: no se especifican los datos de entrenamiento, lo que dificulta evaluar su generalizacion y posibles sesgos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Satysam-26/RealityGuardAI
- Repositorio de GitHub del pipeline completo: https://github.com/Satyam-123336/DeepFake-Detection
- DOI de Zenodo: https://doi.org/10.5281/zenodo.22282866
