# dronefreak/gcnet-s-cityscapes

## Resumen

gcnet-s-cityscapes es un espejo (mirror) de los pesos oficiales del checkpoint GCNet-S para segmentación semántica sobre Cityscapes, publicado originalmente por los autores de Golden Cudgel Network (GCNet, CVPR 2025) en el repositorio gyyang23/GCNet. El repositorio de Hugging Face, mantenido por el usuario dronefreak, no modifica los tensores: los pesos son idénticos byte a byte a los del archivo original y se redistribuyen para ofrecer una descarga estable y programática vía huggingface_hub.

Se trata de una red convolucional de segmentación semántica de aproximadamente 9,2 millones de parámetros y 45,2 GFLOPs, diseñada para inferencia en tiempo real sobre imágenes de escenas de conducción. Está afinada por completo (full fine-tune) para clasificar cada píxel en las 19 clases de Cityscapes y declara 76,9 mIoU a escala única en el split de validación.

No es un modelo de lenguaje ni un modelo generativo multimodal: no procesa texto, no tiene ventana de contexto en tokens y no soporta tool calling ni agentes. Su relevancia actual es servir como punto de partida reproducible para investigación en segmentación semántica eficiente y como baseline de tiempo real, con la advertencia de que la licencia efectiva combina el MIT de los pesos con las condiciones de uso académico del dataset Cityscapes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Golden Cudgel Network (GCNet), CVPR 2025; variante S; backbone y cabeza registrados en una copia vendorizada de mmsegmentation |
| Parametros totales | ~9,2 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen de 1024x1024 px en la configuracion de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en fp32; no hay versiones GGUF, int8 ni int4) |
| Idiomas soportados | No disponible (modelo de segmentación de imagen, no procesa lenguaje) |
| Licencia | MIT para los pesos; el dataset Cityscapes mantiene sus propios terminos (uso academico / investigacion) |
| Formato de pesos | Checkpoint PyTorch de mmengine en `.pth` (state_dict en fp32 + `meta`), ~84 MB; el original upstream pesa 182 MB e incluye estado del optimizador |
| FLOPs | ~45,2 GFLOPs |
| Clases de salida | 19 clases de Cityscapes (trainId 0..18) con paleta y nombres en `meta["dataset_meta"]` |
| Tamano del repositorio | ~0,1 GB |
| Libreria | PyTorch (con mmsegmentation vendorizada del repositorio upstream) |

## Arquitectura y entrenamiento

GCNet (Golden Cudgel Network) es una arquitectura de segmentación semántica orientada a tiempo real, presentada en CVPR 2025 (arXiv:2503.03325) por Guoyu Yang, Yuan Wang, Daming Shi y Yanzhong Wang. La variante S emplea ~9,2 M de parámetros y ~45,2 GFLOPs, una relación de eficiencia propia de la familia de modelos ligeros para percepción de escenas viarias. El checkpoint aquí distribuido se cargó con la configuración `gcnet-s_4xb3-120k_cityscapes-1024x1024.py`, es decir, 4 GPUs con batch 3 por GPU, 120.000 iteraciones y resolución de entrada 1024x1024 píxeles.

El entrenamiento es un fine-tune completo sobre Cityscapes para las 19 clases de `trainId`, con la cabeza de segmentación entrenada de forma conjunta con el backbone. No hay RLHF, DPO ni alineación por preferencias, ya que no es un modelo generativo de lenguaje. El archivo redistribuido es un checkpoint de mmengine al que se le han eliminado el estado del optimizador (buffers de SGD con momentum), el `message_hub` y los `param_schedulers`; se conservan el `state_dict` y el bloque `meta` (entorno de mmengine, configuración y `dataset_meta`) por trazabilidad. No se documenta en la información disponible ninguna innovación adicional como decodificación especulativa, atención lineal o mecanismos híbridos SSM.

## Capacidades

- Segmentación semántica densa: asigna una etiqueta de clase a cada píxel de la imagen entre las 19 clases de Cityscapes (carretera, acera, coche, persona, cielo, vegetación, etc.).
- Inferencia a alta resolución: la configuración de entrenamiento trabaja a 1024x1024 px, adecuada para escenas viarias con objetos pequeños y bordes finos.
- Salida con metadatos integrados: el checkpoint conserva `dataset_meta` con nombres de clase y paleta de color, lo que permite generar visualizaciones sin tablas externas.
- Segmentación de escena completa: la cabeza produce una única máscara por imagen (semantic segmentation), no instancias ni panóptico.
- Orientación a tiempo real: el presupuesto de cómputo (~45,2 GFLOPs con ~9,2 M de parámetros) está pensado para despliegue con latencia baja en GPU.
- Tool calling / function calling: no soportado, no aplica a un modelo de visión.
- Agentes y razonamiento multi-paso: no soportado, no aplica.
- Capacidades multilingües: no aplica; el modelo no procesa texto.
- Capacidades especiales (modo thinking, visión-lenguaje, audio): no disponibles; el modelo solo acepta imágenes RGB y devuelve máscaras.

## Casos de uso

- Percepción para conducción autónoma y ADAS: el modelo entrega una máscara semántica por fotograma que puede alimentar módulos de detección de carril, espacio libre transitable y peatones; su coste de ~45,2 GFLOPs lo hace viable en un pipeline en tiempo real.
- Preetiquetado en anotación de datasets: generar máscaras automáticas a 1024x1024 para que anotadores humanos solo corrijan bordes, reduciendo el coste de etiquetado de nuevos datasets de escenas viarias.
- Cartografía y mantenimiento de mapas: extracción de carretera, acera y edificios a partir de imágenes de vehículos de mapeo para actualizar cartografía urbana de forma semiautomática.
- Análisis de movilidad y tráfico: segmentar cielo, vegetación, calzada y acera en vídeos de cámaras urbanas para estudios de ocupación de vía, priorización de transporte público o análisis de espacio público.
- Robótica móvil y AGVs en exteriores: delimitación de superficies transitables y obstáculos estáticos a partir de la cámara frontal, como módulo de percepción ligero en plataformas con GPU embebida.
- Baseline de investigación en segmentación eficiente: punto de comparación reproducible para trabajos sobre convoluciones ligeras o destilación, ya que el espejo permite descargar el checkpoint por script sin depender de un enlace manual a Google Drive.
- Control de calidad de datasets: ejecutar el modelo sobre un corpus existente para detectar imágenes atípicas (etiquetas incoherentes, dominios fuera de distribución) mediante el análisis de la distribución de clases predicha.
- Demostraciones educativas: ejemplo autocontenido de carga de un checkpoint mmengine y visualización con paleta de Cityscapes para cursos de visión por computador.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (métrica no verificada de forma independiente):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| gcnet-s-cityscapes | Cityscapes | validation | mIoU (single-scale) | 76,9 |

No se han publicado en la información disponible resultados adicionales de MMLU, HumanEval, GSM8K ni de otras tareas, ya que el modelo no es de lenguaje. Tampoco se aportan cifras de latencia, FPS ni throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación, no publicada por el autor): el state_dict en fp32 ocupa ~37 MB; con activaciones a 1024x1024 y batch 1 el consumo previsible se sitúa en el rango de 1 a 3 GB de VRAM en GPU, dependiendo del backend y de si se usa AMP.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM sirve para lotes pequeños. Para producción en tiempo real tiene sentido una RTX 3060/4060 o superior, RTX 4090, L4, A10, A100 o H100 si se necesita procesar varios flujos en paralelo.
- GPU de consumo: cabe con holgura en tarjetas de gama media y baja (GTX 1650 4 GB, RTX 2060, RTX 3050, RTX 4060) siempre que se acepte una latencia mayor que en tarjetas de datacenter.
- CPU: es posible la inferencia en CPU (`device="cpu"`), pero no está pensada para tiempo real a 1024x1024.
- Opciones de despliegue: PyTorch con mmsegmentation vendorizada del repositorio upstream (obligatorio para registrar `GCNet` y `GCNetHead`; la instalación estándar de `mmsegmentation` no los incluye). Entorno de referencia del upstream: Python 3.8, PyTorch 1.12.1, mmcv 2.0.0, mmengine 0.10.2.
- Integración con servidores de inferencia (vLLM, TGI, Ollama): no disponible; estas herramientas están orientadas a modelos de lenguaje y no aplican a este checkpoint.
- Exportación a ONNX / TensorRT: no documentada en la información disponible.
- Latencia y throughput: no disponibles; el autor no publica FPS ni tiempos de inferencia medidos.

## Comparativa con modelos similares

La información proporcionada no incluye resultados comparativos con otras arquitecturas de segmentación semántica en tiempo real. La tabla recoge únicamente los datos disponibles del modelo de esta ficha; el resto de campos se marcan como no disponibles porque no se han aportado cifras verificables.

| Modelo | Tipo | Parametros | Contexto / resolucion | mIoU Cityscapes val | Licencia |
|---|---|---|---|---|---|
| gcnet-s-cityscapes (GCNet-S) | Segmentacion semantica en tiempo real | ~9,2 M | 1024x1024 px | 76,9 (single-scale, no verificado) | MIT (pesos) + terminos academicos de Cityscapes |
| Alternativas de la misma categoria (DDRNet, PP-LiteSeg, BiSeNetV2, SegFormer-B0, entre otras) | Segmentacion semantica en tiempo real | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo nuevo: es una redistribución. Cualquier cita, incidencia o mérito corresponde a los autores originales de GCNet, no al mantenedor del espejo.
- Licencia combinada: los pesos son MIT, pero el dataset Cityscapes impone sus propios términos de uso académico y de investigación. El repositorio redistribuye los pesos derivados sobre esa misma base, por lo que el uso comercial requiere revisar y resolver aparte las condiciones del dataset original.
- Taxonomía cerrada: solo predice las 19 clases de Cityscapes. Cualquier objeto fuera de esa lista (clases raras o categorías no contempladas) quedará etiquetado incorrectamente o absorberse en una clase próxima.
- Desequilibrio de clases del dataset: las categorías con pocas instancias (train, motorcycle, bicycle) suelen presentar un IoU mucho más bajo que las dominantes (road, sky, building), riesgo que se traslada directamente a los pesos.
- Desplazamiento de dominio: el modelo fue afinado con imágenes de conducción diurnas de ciudades alemanas y europeas; en escenas nocturnas, con lluvia o nieve intensa, en interiores o en paisajes no viarios el rendimiento puede degradarse de forma notable.
- Riesgo de error en píxeles de frontera: los bordes entre objetos adyacentes (aceras, postes, barandillas, bordes de vehículos) son la principal fuente de error en segmentación semántica densa.
- Entorno de ejecución frágil: requiere la copia vendorizada de mmsegmentation del repositorio upstream y versiones concretas de PyTorch, mmcv y mmengine; instalar solo `mmsegmentation` desde PyPI no registra las clases del modelo y la carga fallará.
- Sin cuantizaciones ni exportaciones oficiales: no hay GGUF, int8 ni ONNX publicados, lo que limita su despliegue en entornos que no sean PyTorch con CUDA.
- Métrica no verificada: el 76,9 mIoU procede del propio autor del modelo (`verified: false`); no se aporta desglose por clase, evaluación multi-scale ni comparación con otros checkpoints.
- Adopción nula acreditada en el espejo: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria de la integridad funcional del espejo más allá de los checksums publicados.
- Sin controles de sesgo ni análisis de equidad: no se documentan evaluaciones sobre sesgos demográficos o geográficos, algo relevante si se usa en sistemas que toman decisiones sobre personas.
- No apto para tareas de lenguaje: no genera texto, no responde preguntas y no debe usarse como sustituto de un modelo conversacional o multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/gcnet-s-cityscapes
- Repositorio upstream de GCNet: https://github.com/gyyang23/GCNet
- Paper (arXiv:2503.03325), Golden Cudgel Network for Real-Time Semantic Segmentation: https://arxiv.org/abs/2503.03325
- Pesos upstream originales (Google Drive): https://drive.google.com/file/d/1KersBP95k3b0AELiYlQ1rk4PKUmN-ueu/view
- Terminos de uso del dataset Cityscapes: https://www.cityscapes-dataset.com/license/
- Sitio del dataset Cityscapes: https://www.cityscapes-dataset.com/
- Perfil del autor del espejo: https://huggingface.co/dronefreak
