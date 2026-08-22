# AntResearch/4DAnyone

## Resumen

4DAnyone es un modelo de generación de vídeo multivista desarrollado por AntResearch (grupo de investigación de Ant Group) que convierte un vídeo monocular casual de una persona en una secuencia de vídeos multivista consistentes, que posteriormente se pueden elevar a una reconstrucción dinámica 4D mediante Gaussian Splatting (4DGS). Su objetivo principal es resolver el problema de reconstrucción de humanos en 4D a partir de una única cámara sin calibración, una tarea tradicionalmente compleja que requería múltiples cámaras sincronizadas o escáneres dedicados. La relevancia actual radica en que democratiza la creación de avatares 4D para aplicaciones de realidad virtual, cinematografía y videojuegos, reduciendo el coste de captura.

El modelo se basa en una arquitectura de difusión de vídeo, empleando el VAE de Wan2.2 para la compresión latente y el codificador de texto UMT5-XXL para el condicionamiento por lenguaje. Además, incorpora un módulo de estimación de pose humana (GVHMR) y un modelo de transformación de malla SMPL a Goliath70 para guiar la generación con la forma y pose del sujeto. El repositorio ocupa 32,2 GB e incluye múltiples pesos en formatos safetensors, PyTorch y checkpoint. Aunque no se especifican los parámetros totales, la presencia de un text encoder de 5 mil millones de parámetros (UMT5-XXL) sugiere un modelo de gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión de vídeo multivista (basada en Wan2.2 VAE) con codificador de texto UMT5-XXL y módulo de estimación de pose (GVHMR) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de vídeo, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors y pesos PyTorch) |
| Idiomas soportados | no disponible (el condicionamiento por texto probablemente soporta inglés, pero no se indica) |
| Licencia | multiple-licenses (ver archivo LICENSE específico en el repositorio) |
| Formato de pesos | safetensors (model.safetensors), .pt (SMPL a Goliath70), .pth (Wan2.2 VAE), .ckpt (GVHM) |

## Arquitectura y entrenamiento

La arquitectura de 4DAnyone se fundamenta en un modelo de difusión de vídeo que opera sobre el espacio latente del VAE de Wan2.2. El proceso recibe un vídeo monocular de entrada (típicamente de 121 fotogramas) y, condicionado por el texto del prompt y la información de pose y forma del cuerpo extraída mediante el módulo GVMHR (estimación de pose humana) y el modelo SMPL, genera múltiples vídeos del mismo sujeto desde puntos de vista novedosos. Para garantizar la consistencia entre las vistas, el modelo introduce dos innovaciones técnicas: **Reference Context Packing (RCP)** y **Target Context Routing (TCR)**. RCP empaqueta el contexto de referencia en un tamaño fijo para que la condición de la vista original no escale con el número de vistas objetivo, mientras que TCR permite el intercambio de información de contexto entre los grupos de vistas objetivo, mejorando la coherencia global en reconstrucciones con muchas cámaras virtuales.

Los detalles de entrenamiento no se han publicado en la información disponible: no se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF. Sin embargo, el uso de un text encoder UMT5-XXL (5 mil millones de parámetros) y un VAE de Wan2.2 (modelo de difusión de vídeo de gran escala) sugiere que el entrenamiento se realizó con grandes volúmenes de datos de vídeo y texto, probablemente con una fase de ajuste fino específica para la tarea de reconstrucción humana.

## Capacidades

- Generación de vídeo multivista consistente a partir de un vídeo monocular de una persona.
- Reconstrucción 4D humana mediante Gaussian Splatting dinámico (4DGS) a partir de los vídeos generados.
- Síntesis de vistas novedosas (novel-view synthesis) de alta calidad.
- Transformación vídeo-a-vídeo (video-to-video) con control de punto de vista.
- Condicionamiento por texto para describir el movimiento o la escena.
- Estimación de pose humana integrada (a través de GVMHR) para guiar la generación.
- Soporte de entrada de vídeo sin calibración de cámara (uncalibrated monocular video).
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-paso, ya que el modelo se centra exclusivamente en la generación visual.

## Casos de uso

- **Creación de avatares 4D para videojuegos**: los desarrolladores pueden grabar a un actor con un teléfono móvil y generar automáticamente un avatar 3D dinámico con múltiples vistas, listo para integrarse en motores como Unreal o Unity, reduciendo el coste de captura de movimiento.
- **Producción cinematográfica y publicidad**: un director puede filmar una escena con una sola cámara y obtener tomas alternativas desde otros ángulos sin necesidad de un rig multicámara, lo que agiliza el proceso de rodaje y postproducción.
- **Reconstrucción de patrimonio y personajes históricos**: a partir de un vídeo antiguo de una persona (por ejemplo, un bailarín tradicional), se puede generar una representación 4D que se puede animar en entornos virtuales para museos o documentales.
- **Análisis biomecánico y deportivo**: el modelo puede proporcionar múltiples vistas de un atleta a partir de una grabación única, permitiendo a los entrenadores evaluar la técnica desde diferentes ángulos sin necesidad de cámaras especializadas.
- **Realidad aumentada y virtual**: la generación de avatares 4D de usuarios en tiempo real (o casi) permite aplicaciones de telepresencia inmersiva, donde cada usuario puede verse a sí mismo desde cualquier perspectiva en un entorno virtual.
- **Investigación en visión por computador**: el modelo sirve como herramienta de generación de datos sintéticos para entrenar otros sistemas de reconocimiento de pose o reconstrucción 3D, ya que produce vídeos multivista con consistencia geométrica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se incluyen métricas como PSNR, SSIM, LPIPS, ni comparaciones con otros modelos de reconstrucción 4D en el paper ni en la model card. El artículo de arXiv (2608.20335) puede contener experimentos, pero no se han extraído datos numéricos en los resultados de búsqueda web proporcionados. Por lo tanto, no se puede evaluar cuantitativamente el rendimiento en este momento.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado que el modelo incluye un text encoder de 5 mil millones de parámetros y un VAE de Wan2.2, se estima que la inferencia requiere al menos 40-60 GB de VRAM en precisión completa (FP16). Sin cuantización, el modelo completo podría superar los 32 GB del repositorio, por lo que se recomienda GPU de servidor.
- **GPU recomendadas**: A100 (40/80 GB) o H100 (80 GB) para inferencia con contexto largo. Para desarrollo y pruebas, una A6000 (48 GB) o RTX 4090 (24 GB) podría ser insuficiente, dependiendo de la resolución y número de vistas.
- **Consumer GPU**: no cabe en GPUs de consumo estándar (RTX 3080/4080) sin cuantización; se requeriría un modelo cuantizado o una versión reducida que no se ha publicado.
- **Opciones de despliegue**: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de difusión de vídeo, no de texto. El código de GitHub (https://github.com/ant-research/4DAnyone) es la vía principal para ejecutar el modelo.
- **Latencia y throughput**: no disponibles. La generación de vídeo multivista es computacionalmente intensiva; probablemente minutos por vídeo en GPU de alta gama, pero no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la información proporcionada. No se mencionan alternativas como "NVS" (Neural View Synthesis) o "Human4D" en el paper o en los resultados de búsqueda. La categoría de reconstrucción 4D humana desde vídeo monocular es reciente, y aunque existen métodos previos como "Mono4D" o "GaussianHuman", no se han incluido en los datos disponibles. Por tanto, la comparativa queda pendiente de revisar la literatura del paper.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia es "multiple-licenses", lo que significa que el uso comercial puede estar limitado. Es imprescindible revisar el archivo LICENSE del repositorio y los términos específicos de cada componente (Wan2.2, UMT5, GVHMHR) antes de cualquier aplicación en producción.
- **Dependencia de la calidad del vídeo**: el modelo requiere un vídeo monocular de una persona claramente visible, con buena iluminación y sin oclusiones severas. Vídeos con movimiento rápido o desenfoque pueden producir resultados inconsistentes.
- **Riesgo de alucinación**: como modelo generativo, puede inventar detalles visuales en las vistas novedosas que no están presentes en el vídeo original, especialmente en regiones ocluidas.
- **Idioma**: no se especifican los idiomas soportados para el prompt de texto. El text encoder UMT5-XXL está entrenado principalmente en inglés, por lo que los prompts en otros idiomas pueden tener un rendimiento inferior.
- **Uso específico**: el modelo está diseñado exclusivamente para reconstrucción humana. No es apto para tareas generales de generación de vídeo, edición de escenas o objetos.
- **Recursos de cálculo**: la generación requiere una GPU de gran tamaño (≥40 GB VRAM) y tiempo de cómputo considerable, lo que limita su uso a entornos de investigación o estudios profesionales con infraestructura adecuada.

## Enlaces

- [Hugging Face - AntResearch/4DAnyone](https://huggingface.co/AntResearch/4DAnyone)
- [Página del proyecto](https://4danyone.github.io/)
- [Paper en arXiv](https://arxiv.org/abs/2608.20335)
- [Repositorio de código](https://github.com/ant-research/4DAnyone)
