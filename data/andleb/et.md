# andleb/et

## Resumen

Energy-Tweedie es un repositorio de checkpoints en PyTorch asociado al artículo científico "Energy-Tweedie: Score meets Score, Energy meets Energy", obra de Andrej Leban (University of Michigan) y aceptado en NeurIPS 2026. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de modelos de investigación para estimación de score y difusión sobre distribuciones sintéticas (Eight-Gaussians) y MNIST. El artículo extiende la fórmula de Tweedie a una identidad distribucional válida para distribuciones de ruido de Gibbs, lo que permite rutas de muestras posteriores a score, estimación de parámetros de ruido desconocidos a partir de datos corruptos y una perspectiva basada en score de métodos de difusión "distribucionales" recientes.

El repositorio contiene checkpoints y configuraciones para experimentos de estimación de score, extrapolación de Richardson, muestreo estilo difusión, comparación de estimadores y recuperación de parámetros de ruido. Los modelos son de tamaño reducido (el repositorio completo ocupa 0,5 GB) y están pensados para reproducir resultados académicos, no para despliegue en producción. La licencia es BSD 3-Clause, permisiva para uso comercial, aunque el alcance práctico es fundamentalmente de investigación.

La relevancia actual radica en su contribución teórica a la familia de modelos de difusión y score matching, un área central en la generación de imágenes y datos sintéticos. Al ofrecer checkpoints reproducibles junto al código, facilita la verificación independiente de los resultados del artículo y su reutilización en experimentos de estimación de ruido y score.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de estimación de score y posteriores (redes neuronales PyTorch); no se especifica la topología exacta en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | BSD 3-Clause |
| Formato de pesos | PyTorch (`final.pt`), con configuraciones adyacentes en `config.yaml` o `config.json` |

## Arquitectura y entrenamiento

El repositorio agrupa varios modelos entrenados para experimentos concretos: modelos gaussianos isotrópicos, gaussianos generalizados isotrópicos y modelos posteriores de cinco parámetros en `score_and_diffusion/`; modelos ET-DSM y de score directo de Hyvärinen en `score_comparison/`; modelos posteriores y de score para recuperación de parámetros de ruido en `parameter_estimation/`; y un modelo posterior de cinco parámetros para MNIST en `mnist/posterior/`. La información disponible no detalla el número de capas, dimensiones ocultas ni el volumen de datos de entrenamiento más allá de los conjuntos Eight-Gaussians y MNIST.

La innovación técnica central es la elevación de la fórmula de Tweedie a una identidad distribucional válida para ruido de Gibbs, lo que habilita tres aplicaciones: una ruta de muestras posteriores a score, la estimación de parámetros de ruido desconocidos desde datos corruptos y una interpretación basada en score de métodos de difusión distribucionales. No se mencionan detalles sobre RLHF, DPO ni decodificación especulativa, ya que el trabajo no se orienta a modelos de lenguaje.

## Capacidades

- Estimación de score sobre distribuciones sintéticas (Eight-Gaussians) y MNIST.
- Muestreo estilo difusión mediante el sampler Energy-Tweedie con condicionamiento en parámetros de ruido.
- Recuperación de parámetros de ruido desconocidos a partir de datos corruptos.
- Comparación de estimadores de score (ET-DSM frente a score directo de Hyvärinen).
- Extrapolación de Richardson en el contexto de estimación de score.
- Reproducción de resultados del artículo mediante notebooks y scripts de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Reproducción de resultados académicos: cargar los checkpoints con las configuraciones guardadas y ejecutar los notebooks del repositorio para verificar las tablas y figuras del artículo de NeurIPS 2026.
- Investigación en score matching: usar los modelos de `score_comparison/` para comparar el estimador ET-DSM con el score directo de Hyvärinen en Eight-Gaussians y analizar diferencias de comportamiento.
- Estimación de ruido en datos corruptos: emplear los modelos de `parameter_estimation/` para recuperar parámetros de ruido desconocidos, un escenario relevante en calibración de sensores y procesamiento de señales.
- Estudio de métodos de difusión distribucionales: utilizar el modelo posterior de MNIST para explorar las cinco rutas de muestreo descritas en el artículo y su relación con la perspectiva basada en score.
- Docencia y formación: servir como material didáctico reproducible para cursos de estadística computacional y modelos generativos, dado su tamaño reducido y su licencia permisiva.
- Desarrollo de nuevos estimadores: partir del código y los checkpoints como línea base para proponer variantes de la identidad de Tweedie o de samplers asociados.
- Validación de infraestructura de experimentación: probar pipelines de entrenamiento y muestreo en PyTorch con modelos pequeños antes de escalar a modelos de difusión de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,5 GB, por lo que los checkpoints individuales son de tamaño reducido y previsiblemente caben en GPU de consumo.
- GPU recomendadas: no se especifican; por el tamaño del repositorio, una GPU consumer (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: probable, dado el tamaño del repositorio, pero no confirmada.
- Opciones de despliegue: PyTorch nativo; el código de ejemplo carga el checkpoint en CPU con `torch.load` y `build_mnist_engressor`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (estimación de score y difusión sobre Eight-Gaussians y MNIST) con parámetros, contexto o rendimiento verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- Alcance experimental limitado a Eight-Gaussians y MNIST; no se documenta generalización a otros dominios.
- No se han publicado benchmarks en la información disponible, por lo que no es posible evaluar su rendimiento frente a alternativas.
- Riesgo de alucinación no aplica en el sentido habitual, pero los resultados deben interpretarse dentro del marco teórico del artículo y no como validación empírica general.
- La licencia BSD 3-Clause permite uso comercial, pero el repositorio incluye atribuciones de terceros en `third_party_licenses/THIRD_PARTY_LICENSES.md` que deben revisarse.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica adopción muy temprana y escasa validación comunitaria.
- No se especifican sesgos conocidos; al operar sobre distribuciones sintéticas y MNIST, los sesgos relevantes serían los del conjunto de datos, no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/andleb/et
- Paper (arXiv): https://arxiv.org/abs/2512.23818
- Código: https://github.com/andleb/et
- Página del proyecto: https://andleb.netlify.app/publication/et/
- Checkpoints: https://huggingface.co/andleb/et/tree/main
- Release del modelo MNIST: https://github.com/andleb/et/releases/tag/MNIST_model
- Notebook de MNIST: https://github.com/andleb/et/blob/main/exp/reproduce_diffusion_mnist.ipynb
- Código de muestreo MNIST: https://github.com/andleb/et/blob/main/exp/sample_diffusion_mnist.py
- Licencia: https://github.com/andleb/et/blob/main/LICENSE
- Atribuciones de terceros: https://github.com/andleb/et/blob/main/third_party_licenses/THIRD_PARTY_LICENSES.md
