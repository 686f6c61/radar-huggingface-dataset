# narudesuyo/AffHandGen

## Resumen

AffHandGen es un conjunto de checkpoints de difusión diseñados para la reconstrucción tridimensional de manos humanas, desarrollado por Naru Suzuki y colaboradores en el marco del trabajo "Affordance-Guided Diffusion Prior for 3D Hand Reconstruction" (arXiv:2510.00506). El modelo genera poses de mano parametrizadas según el modelo MANO, condicionadas por descripciones textuales de la interacción (affordance) mediante un codificador DistilBERT y por características visuales extraídas con un ViT de HaMeR. Su propósito principal es servir como prior para el refinamiento en tiempo de prueba de reconstrucciones de manos que sufren oclusiones, un problema habitual en escenarios reales de interacción mano-objeto.

La relevancia actual del modelo reside en que aborda una limitación persistente en la reconstrucción de manos: la pérdida de información cuando partes de la mano quedan ocultas tras objetos. Al integrar conocimiento semántico de la acción (por ejemplo, "agarrar una taza") y señales visuales, el prior generativo guía la reconstrucción hacia poses plausibles y funcionales. El repositorio incluye dos variantes entrenadas en los conjuntos HOGraspNet y HO3D, cada una con su correspondiente archivo de configuración, lo que permite reproducir los experimentos descritos en el artículo. El tamaño del repositorio es de 0,3 GB, aunque no se detallan los parámetros totales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (no se especifica el tipo exacto, probablemente DDPM o similar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen como .pth, sin cuantización) |
| Idiomas soportados | no disponible (las descripciones de affordance se procesan con DistilBERT, por lo que el texto es en inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

AffHandGen se basa en un modelo de difusión que genera poses MANO (un modelo paramétrico de la mano humana con 51 parámetros de articulación y 10 de forma). El condicionamiento se realiza mediante dos vías: por un lado, una descripción textual de la acción o affordance (por ejemplo, "sujetando una botella") se codifica con un DistilBERT; por otro lado, características visuales de la imagen se extraen mediante un ViT entrenado para reconstrucción de manos (HaMeR). Estas señales se fusionan para guiar el proceso de difusión.

El entrenamiento se realizó de forma separada en dos conjuntos de datos: HOGraspNet (split S1) y HO3D. Cada checkpoint está diseñado para su uso en el refinamiento de reconstrucciones en el mismo dominio de datos. El artículo describe un procedimiento de refinamiento en tiempo de prueba, donde el prior generativo se utiliza para corregir las poses predichas por un reconstrucción base, especialmente cuando hay oclusiones. No se detallan en la información disponible el número de pasos de difusión, la función de pérdida ni la estrategia de entrenamiento (por ejemplo, si se usó clasifier-free guidance). Tampoco se indica si se emplearon técnicas como RLHF o DPO.

## Capacidades

- Generación de poses MANO condicionadas por descripciones textuales de affordance (por ejemplo, "sosteniendo un objeto") y características visuales de una imagen.
- Refinamiento en tiempo de prueba de reconstrucciones 3D de manos bajo oclusión, mejorando la plausibilidad de la pose cuando partes de la mano no son visibles.
- Interacción mano-objeto: el modelo captura la relación semántica entre la acción y la postura de la mano.
- No se mencionan capacidades de generación de texto, código, razonamiento, tool calling, agentes ni multilingüismo, ya que es un modelo especializado en visión 3D.
- El modelo no incluye capacidades de visión general ni de audio; solo procesa características de imagen ya extraídas por un modelo previo (HaMeR).

## Casos de uso

- Reconstrucción de manos en sistemas de realidad virtual y aumentada: cuando la mano queda parcialmente ocluida por un objeto o el propio cuerpo, el modelo puede refinar la pose estimada para mantener una interacción natural con el entorno virtual.
- Análisis de interacción humano-objeto en robótica: al conocer la descripción de la acción, el modelo puede generar la pose esperada de la mano, útil para planificar agarres y manipulación en robots con manos antropomórficas.
- Animación de personajes digitales: para generar posturas de manos coherentes con acciones específicas en escenas 3D, especialmente cuando las manos están ocultas en los datos de captura de movimiento.
- Mejora de reconstrucciones en sistemas de seguimiento de manos en tiempo real: integrando el prior en un pipeline de optimización, se puede corregir la deriva de la pose en secuencias con oclusiones frecuentes.
- Investigación en modelos generativos para la mano: sirve como punto de partida para estudiar la influencia de la affordance en la generación de posturas, y para experimentar con otros condicionamientos.
- Reproducción de experimentos científicos: al estar publicados los checkpoints y el código de reproducción, permite a investigadores replicar los resultados del paper en HOGraspNet y HO3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas (por ejemplo, MPJPE, PA-MPJPE, etc.) ni comparaciones con otros métodos. Para obtener datos de rendimiento, se debe consultar el artículo arXiv:2510.00506.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del repositorio (0,3 GB), el modelo probablemente tenga entre 50 y 200 millones de parámetros, lo que cabría en GPU con 8 GB de VRAM, pero no se puede confirmar sin especificaciones técnicas.
- GPU recomendadas: no se especifican. Al ser un modelo de difusión, una GPU moderna (RTX 3080 o superior, o A100) sería adecuada para inferencia rápida.
- Compatibilidad con GPU de consumo: probablemente sí, pero sin datos exactos.
- Opciones de despliegue: los checkpoints son en formato .pth, por lo que se pueden cargar con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de difusión, no un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de reconstrucción de manos o diffusion priors en la documentación proporcionada. Se recomienda consultar el artículo para ver la comparación con métodos anteriores.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para los conjuntos de datos HOGraspNet y HO3D, por lo que su generalización a otros dominios (diferentes objetos, iluminación, cámaras) no está garantizada.
- No se proporcionan detalles sobre la robustez frente a oclusiones severas o la calidad de las poses generadas en casos extremos.
- La generación de poses puede producir posturas no realistas o anatómicamente imposibles, especialmente si la descripción de affordance es ambigua o el contexto visual es pobre.
- No se han publicado evaluaciones sobre sesgos de género, etnia o tipo de mano, aunque es posible que el modelo herede sesgos de los datos de entrenamiento (por ejemplo, predominancia de manos de piel clara en los conjuntos).
- La licencia MIT permite el uso comercial sin restricciones, pero se recomienda citar el artículo original en publicaciones.
- Al ser un modelo de difusión, la inferencia requiere múltiples pasos de muestreo, lo que puede ser más lento que métodos de regresión directa. No se especifican el número de pasos ni el método de muestreo.

## Enlaces

- Página de HuggingFace: [narudesuyo/AffHandGen](https://huggingface.co/narudesuyo/AffHandGen)
- Repositorio de código: [https://github.com/narudesuyo/AffHandGen](https://github.com/narudesuyo/AffHandGen)
- Paper: arXiv:2510.00506 (enlace no proporcionado directamente, pero se puede buscar en arXiv)
