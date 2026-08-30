# HichTala/draw2

## Resumen

DRAW 2 (Detect and Recognize A Wide range of cards) es un detector de objetos basado en visión por computador, entrenado específicamente para localizar y reconocer cartas de _Yu-Gi-Oh!_ en imágenes, con especial énfasis en entornos de duelo. Desarrollado por HichTala, el modelo se publica bajo licencia AGPL-3.0 y está disponible en Hugging Face con el pipeline de detección de objetos. Su arquitectura se apoya en un backbone ViT-base (preentrenado en ImageNet-21k) sobre el que se añade una cabeza de detección, aunque el diseño exacto de esta cabeza no se documenta en la información pública.

El modelo resuelve un problema práctico: la identificación automática de cartas durante partidas en vivo, algo que aplicaciones oficiales como Yu-Gi-Oh! NEURON no logran de forma fiable en condiciones de iluminación o ángulo adversas. DRAW 2 se integra con un plugin para OBS Studio, lo que permite mostrar en tiempo real las cartas detectadas en streams o vídeos sin necesidad de conocimientos técnicos avanzados. Con 96,4 millones de parámetros y un repositorio de 8,6 GB, el modelo es lo suficientemente ligero para ejecutarse en GPU de consumo, aunque no se especifican requisitos exactos de hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-base (backbone) + cabeza de detección (no especificada) |
| Parametros totales | 96.426.236 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (etiquetas de clases) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un backbone ViT-base (patch16, resolución 224) preentrenado en ImageNet-21k, tal como se indica en el campo `base_model`. Sobre este backbone se añade una cabeza de detección de objetos, cuya arquitectura concreta no se detalla en la documentación pública. El entrenamiento se realizó sobre el dataset `HichTala/ygoprodeck-dataset`, que contiene más de 11.000 clases de cartas de _Yu-Gi-Oh!_, según se menciona en la búsqueda web. No se publican datos sobre el número de épocas, el tamaño del dataset en imágenes, ni si se emplearon técnicas de aumento de datos o regularización. Tampoco se indica si se utilizó algún método de alineación como RLHF o DPO, ya que no es un modelo generativo de lenguaje. La referencia al paper `arxiv:2010.11929` corresponde al artículo original de ViT, que sirve como base teórica para el backbone.

## Capacidades

- Detección y localización de cartas de _Yu-Gi-Oh!_ en imágenes, vídeos y flujos de cámara web.
- Reconocimiento de la carta específica entre más de 11.000 clases posibles.
- Funcionamiento en tiempo real, con soporte para entrada de vídeo y webcam.
- Integración con OBS Studio mediante un plugin oficial, que permite superponer las cartas detectadas en transmisiones en vivo.
- Opción de proporcionar una lista de deck (archivo .ydk) para restringir la búsqueda y mejorar la precisión en partidas concretas.
- Interfaz de línea de comandos con parámetros configurables (fuente, guardado, visualización, FPS, etc.).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es un modelo puramente de visión.

## Casos de uso

- **Streaming de partidas de Yu-Gi-Oh!**: el plugin de OBS permite a los creadores de contenido mostrar las cartas jugadas en pantalla, mejorando la experiencia de los espectadores que no conocen todas las cartas. El detector funciona en tiempo real y puede seguir el ritmo de una partida.
- **Vídeos de análisis de duelo**: los jugadores pueden grabar sus partidas y procesarlas posteriormente con el detector para generar listas de cartas usadas, facilitando el análisis de estrategias o la creación de contenido educativo.
- **Archivo y catalogación de colecciones**: el modelo puede utilizarse para digitalizar colecciones físicas de cartas, detectando y clasificando cada carta en una imagen, lo que agiliza la creación de inventarios digitales.
- **Asistencia a jugadores con discapacidad visual**: al detectar y nombrar las cartas en voz alta mediante un sistema de texto a voz, el modelo podría integrarse en herramientas de accesibilidad para personas con problemas de visión.
- **Moderación de torneos**: en eventos presenciales, un sistema basado en DRAW 2 podría verificar automáticamente que las cartas jugadas coinciden con las declaradas, reduciendo errores humanos y posibles trampas.
- **Desarrollo de aplicaciones de realidad aumentada**: la detección precisa de cartas en tiempo real permite superponer animaciones, efectos o información adicional sobre las cartas físicas, similar al proyecto inspirador de SuperZouloux pero sin necesidad de chips incrustados.
- **Educación y tutoriales**: los creadores de guías pueden usar el detector para resaltar automáticamente las cartas mencionadas en vídeos instructivos, facilitando el seguimiento por parte de principiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas cuantitativas como mAP, precisión o recall sobre conjuntos de validación estándar. El autor menciona que DRAW 2 es "más preciso y robusto" que su predecesor, pero no proporciona cifras concretas.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 96,4M parámetros, la inferencia en precisión fp16 requiere aproximadamente 200 MB de VRAM, y en fp32 unos 400 MB. Sin embargo, el repositorio incluye múltiples archivos (posiblemente pesos en distintas precisiones y otros componentes), por lo que el espacio en disco es mayor (8,6 GB). Se recomienda al menos 2 GB de VRAM para un funcionamiento fluido con vídeo en tiempo real.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 3060) debería ser suficiente. Para procesamiento por lotes o vídeo de alta resolución, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4070, A100, etc.).
- **Compatibilidad con GPU de consumo**: sí, el modelo puede ejecutarse en tarjetas gráficas de gama media sin problemas.
- **Opciones de despliegue**: se puede utilizar directamente con la librería `transformers` de Hugging Face, junto con PyTorch. También se proporciona un paquete instalable vía pip (`pip install git+https://github.com/HichTala/draw2.git`) y un plugin para OBS Studio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que estas herramientas están orientadas a modelos de lenguaje, no a visión.
- **Latencia y throughput**: no se especifican datos concretos. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por imagen en GPU moderna, suficiente para tiempo real a 30 FPS con entrada de webcam.

## Comparativa con modelos similares

No se dispone de modelos de código abierto directamente comparables, ya que DRAW 2 es el primer detector específico para cartas de _Yu-Gi-Oh!_ en entornos de duelo, según el autor. Las alternativas existentes son:

| Modelo/Herramienta | Tipo | Ventajas | Limitaciones |
|---|---|---|---|
| Yu-Gi-Oh! NEURON (oficial de Konami) | App propietaria | Reconocimiento de hasta 20 cartas, integración con el juego digital | No funciona bien con cartas de baja calidad o en movimiento; no es integrable en otros sistemas; no es open source |
| yugioh-one-shot-learning (GitHub) | Modelo de aprendizaje one-shot | Enfoque académico para reconocimiento de cartas | No está orientado a detección en tiempo real ni a entornos de duelo; sin mantenimiento activo |
| DRAW 2 | Detector de objetos open source | Detección y reconocimiento en tiempo real, plugin OBS, licencia AGPL-3.0 | Depende de un dataset específico; no tiene métricas públicas de rendimiento |

## Limitaciones y advertencias

- **Sesgos y errores**: al estar entrenado sobre un dataset de imágenes de cartas, el modelo puede fallar con cartas muy dañadas, con ángulos extremos, iluminación deficiente o cuando la carta está parcialmente oculta. No se han documentado sesgos de género, raza u otros, dado que es un modelo de visión sobre objetos.
- **Riesgo de alucinación**: aunque no es un modelo generativo de texto, puede producir falsos positivos (detectar cartas donde no las hay) o clasificaciones incorrectas en imágenes ambiguas. Se recomienda validar los resultados en aplicaciones críticas.
- **Limitaciones de contexto**: el modelo está diseñado exclusivamente para cartas de _Yu-Gi-Oh!_. No reconoce otros juegos de cartas ni objetos genéricos.
- **Idioma**: las etiquetas de salida están en inglés, aunque la detección en sí no depende del idioma. El plugin de OBS muestra los nombres de las cartas en inglés.
- **Restricciones de licencia**: la licencia AGPL-3.0 exige que cualquier modificación del código se publique bajo la misma licencia si se ofrece como servicio en red. Esto puede afectar a usos comerciales propietarios. Se recomienda revisar los términos completos antes de integrarlo en productos comerciales.
- **Dependencias técnicas**: requiere PyTorch y la librería `transformers`. Para el plugin de OBS, se necesita OBS Studio y una GPU compatible con aceleración por hardware.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/HichTala/draw2)
- [Repositorio en GitHub](https://github.com/HichTala/draw2)
- [Plugin para OBS Studio](https://github.com/HichTala/draw2-obsplugin)
- [Artículo en Medium sobre el entrenamiento](https://medium.com/@hich.tala.phd/how-i-trained-again-my-model-to-detect-and-recognise-a-wide-range-of-yu-gi-oh-cards-5c567a320b0a)
- [Visualización de entrenamiento en Weights & Biases](https://wandb.ai/hich_/draw)
- [Dataset de cartas utilizado](https://huggingface.co/datasets/HichTala/ygoprodeck-dataset)
- [Paper original de ViT (arxiv:2010.11929)](https://arxiv.org/abs/2010.11929)
