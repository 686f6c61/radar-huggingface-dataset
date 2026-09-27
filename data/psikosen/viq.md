# psikosen/viq

## Resumen

VIQ (identificador `psikosen/viq`) no es un modelo de lenguaje ni una red neuronal entrenada por el autor, sino una herramienta de línea de comandos que extrae una o varias personas de un vídeo y empaqueta el resultado como material con canal alfa listo para composición y prototipado de realidad aumentada. El repositorio de HuggingFace no contiene pesos propios: actúa como punto de distribución del proyecto, cuya implementación se apoya en backends de segmentación y matting de terceros (rembg sobre ONNX Runtime, SAM 3 y MatAnyone 2). El pipeline cubre segmentación, limpieza del matte, comprobaciones de temporización y exportación verificada de vídeo alfa.

La relevancia del proyecto está en resolver un problema de producción concreto: obtener recortes utilizables en posproducción sin confundir una tarea de segmentación con un supuesto modelo de reconstrucción 3D. La documentación insiste explícitamente en que un cutout alfa es 2D/2.5D y no un humano tridimensional completo, y en que las vistas laterales o traseras requieren una etapa de reconstrucción con cobertura multivista suficiente. Esa honestidad técnica sobre los límites del resultado es uno de los rasgos diferenciales de la ficha.

La herramienta soporta entrada equirectangular monoscópica mediante una conversión temporal a cubemap 3x2 con el filtro `v360` de FFmpeg, lo que permite segmentar panorámicas de 360 grados sin exponer al modelo a la distorsión de los polos. El repositorio registra 0 descargas y 0 likes, y solo la etiqueta `region:us`, sin pipeline, licencia ni idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de segmentación de vídeo y matting alfa orquestado en Python 3.12 sobre FFmpeg; no es una red neuronal única ni un transformer |
| Parametros totales | no disponible (depende del backend: rembg ONNX, SAM 3 o MatAnyone 2) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (procesa fotograma a fotograma, sin ventana de tokens) |
| Tipos de cuantizacion | no disponible; el backend rembg se distribuye como modelo ONNX sin precisión declarada en la documentación |
| Idiomas soportados | no disponible (la herramienta no procesa lenguaje natural) |
| Licencia | no disponible en el repositorio; los componentes tienen licencias propias: rembg es MIT, MatAnyone 2 es no comercial y los pesos descargados de rembg pueden tener términos separados |
| Formato de pesos | ONNX (backend rembg); SAM 3 y MatAnyone 2 no declaran formato en la documentación |
| Requisitos de sistema | Python 3.12 o superior y FFmpeg con `ffprobe`, `alphamerge` y `libx264` |
| Formatos de salida | PNG en escala de grises, ProRes 4444 con alfa, HEVC con alfa, VP9 con alfa y MP4 de previsualización |

## Arquitectura y entrenamiento

El proyecto no entrena ningún modelo. Se estructura como un orquestador que delega la inferencia en backends intercambiables y se encarga de la coherencia temporal, la gestión de resoluciones de trabajo y el empaquetado de los resultados. El backend por defecto es `auto`: utiliza SAM 3 cuando hay un entorno CUDA preparado y recurre a rembg si está instalado. rembg funciona como respaldo por fotograma, con un modelo de segmentación humana descargado en el primer uso, y en Mac compatibles aprovecha automáticamente el proveedor de ejecución Core ML de Apple. La opción de promediado de máscaras entre fotogramas adyacentes está desactivada por defecto (valor cero) porque genera fantasmas de movimiento.

MatAnyone 2, sucesor de MatAnyone presentado en CVPR 2026, es la etapa de refinado preferida para uso no comercial: preserva el detalle fino de bordes a lo largo del tiempo y su selección de dispositivo oficial admite CUDA, Apple MPS y CPU. La innovación técnica más destacable del pipeline es la ruta para material equirectangular: convierte temporalmente cada panorama a un cubemap 3x2 con `v360`, ejecuta el backend sobre esa vista y reproyecta las máscaras completadas a la resolución equirectangular original. El renderizado siempre parte del vídeo fuente sin modificar. El tamaño de cara del cubemap se calcula preservando el menor de los muestreos angulares horizontal y vertical de la fuente (por ejemplo, 4096x2048 pasa a un cubemap 3x2 de 3072x2048), y se puede reducir manualmente con `--cube-face-size 512` para priorizar velocidad sobre detalle. El modo y la resolución de trabajo efectivos quedan registrados en `manifest.json`.

## Capacidades

- Extracción de una o varias personas de un vídeo, con separación por sujeto bajo `subjects/subject-<tracker-id>/` y escena combinada en `combined/`.
- Generación de mattes alfa en PNG numerados (`masks/%06d.png`) como fuente de verdad sin pérdida.
- Exportación a ProRes 4444 con alfa (`subject-alpha.mov`) para edición e intercambio.
- Exportación a HEVC con alfa (`subject-alpha-hevc.mov`) para AVFoundation y RealityKit, solo en macOS.
- Exportación a VP9 con alfa (`subject-alpha.webm`) para tiempos de ejecución web compatibles.
- Generación de `preview.mp4` con el recorte compuesto sobre fondo oscuro para revisión rápida.
- Escritura de `manifest.json` con metadatos de origen, ajustes del modelo, salidas y diagnósticos de calidad de máscara.
- Segmentación de material equirectangular monoscópico 2:1 mediante la ruta de cubemap, con `--projection auto`, `equirectangular` o `flat`.
- Inspección previa del material con `viq inspect`, que informa de temporización, rotación, proyección declarada y estimaciones del conjunto de trabajo sin comprimir.
- Renderizado independiente del backend de IA: acepta máscaras generadas por un editor, otro modelo u otra máquina.
- Comprobación de dependencias y capacidades del sistema con `viq doctor`.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento, por no ser un modelo de lenguaje.

## Casos de uso

- Posproducción y composición de VFX: el pipeline entrega un matte alfa sin pérdida por fotograma y un máster ProRes 4444 con alfa, de modo que un compositor puede integrar al sujeto sobre nuevos fondos sin volver a segmentar y conservando la calidad de borde.
- Prototipado de realidad aumentada: el archivo HEVC con alfa se consume directamente en AVFoundation y RealityKit en macOS, lo que permite colocar a la persona recortada como cartel orientado al espectador en una escena AR sin trabajo adicional de conversión.
- Rotoscopia asistida para editor: el operador puede generar las máscaras con el backend disponible y luego revisarlas o corregirlas en su herramienta habitual, ya que `viq render` acepta máscaras externas nombradas de forma secuencial a la resolución exacta del vídeo fuente.
- Fragmentos para web interactiva: la salida VP9 con alfa permite incrustar el recorte con transparencia en navegadores compatibles, útil para páginas de producto, demostraciones o experiencias ligeras sin plugin.
- Preparación de conjuntos de datos de matting: `manifest.json` documenta ajustes del modelo, resoluciones de trabajo y diagnósticos de calidad, lo que facilita la trazabilidad de un corpus de máscaras generado de forma reproducible.
- Limpieza de metraje 360 para postproducción de VR: la ruta equirectangular permite segmentar panorámicas monoscópicas evitando la distorsión polar, útil para insertar gráficos, logotipos o capas informativas en un plano de 360 grados.
- Extracción de múltiples sujetos en una misma toma: los modos de separación por tracker y de escena combinada permiten aislar a cada persona por separado o disponer de todos los seleccionados en una única capa, según lo que requiera el montaje.
- Generación de previsualizaciones rápidas para validación de plano: el formato de salida por defecto es solo `preview.mp4`, lo que evita crear másteres alfa de gran tamaño mientras se decide si el recorte es válido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas de IoU, precisión de borde ni estabilidad temporal frente a otros modelos de matting, y la documentación se limita a describir cualitativamente las diferencias entre backends: rembg es más ligero que SAM 3, pero su estabilidad entre fotogramas, su precisión en escenas concurridas y su tratamiento de bordes finos de pelo son peores. El campo de diagnósticos de calidad de máscara en `manifest.json` es el único mecanismo de evaluación disponible, y no se especifica qué métricas concretas incluye.

## Requisitos de hardware

- CPU y Mac: el backend rembg está pensado como alternativa local práctica y funciona sin GPU. En Mac compatibles utiliza automáticamente el proveedor Core ML de Apple; `--execution-provider cpu` se reserva para diagnóstico.
- GPU: SAM 3 requiere un entorno CUDA preparado para activarse como backend por defecto. MatAnyone 2 admite CUDA, Apple MPS y CPU en su selección oficial de dispositivo.
- VRAM estimada: no disponible. Consumo dependiente de la resolución de trabajo, que en la ruta equirectangular puede llegar a un cubemap de 3072x2048 para una fuente de 4096x2048, y que se puede rebajar con `--cube-face-size 512`.
- GPU de consumo: no se especifica compatibilidad con tarjetas concretas. El diseño contempla explícitamente la ejecución en CPU y en Mac sin GPU dedicada a través de rembg.
- Conjunto de trabajo: `viq inspect` informa de estimaciones del conjunto de trabajo sin comprimir antes de procesar, lo que permite dimensionar la máquina antes de ejecutar la extracción.
- Despliegue: se instala como paquete Python editable (`pip install -e .` o `pip install -e '.[local]'` para el backend ONNX) y se invoca mediante el binario de línea de comandos `viq`. No es servible mediante vLLM, llama.cpp, Ollama ni TGI, por no ser un modelo de lenguaje.
- Dependencia externa obligatoria: FFmpeg con `ffprobe`, `alphamerge` y `libx264`. Las salidas ProRes, VP9, 360 real y HEVC de Apple tienen comprobaciones adicionales que reporta `viq doctor`.
- Latencia y throughput: no disponibles. La documentación no publica tiempos por fotograma ni rendimiento en fotogramas por segundo para ninguno de los backends.

## Comparativa con modelos similares

La comparación pertinente no es con modelos de lenguaje, sino con los backends de segmentación y matting que el propio proyecto integra.

| Backend | Tipo | Estabilidad temporal | Calidad de borde fino | Escenas concurridas | Aceleracion | Licencia |
|---|---|---|---|---|---|---|
| rembg (ONNX) | Segmentación humana por fotograma | Débil, es un respaldo por fotograma | Débil | Débil | CPU, Core ML en Mac; ligero | MIT, con términos propios en los pesos descargados |
| SAM 3 | Segmentación | No detallada en la documentación | No detallada | No detallada | Requiere CUDA para activarse por defecto | No disponible |
| MatAnyone 2 | Matting alfa con preservación de detalle | Alta, preserva detalle de borde a lo largo del tiempo | Alta | No detallada | CUDA, Apple MPS y CPU | No comercial |

No se dispone de comparativas publicadas frente a alternativas externas como RVM, BackgroundMattingV2 u otros modelos de matting de vídeo, por lo que no se pueden establecer cifras comparativas de IoU o error de matte.

## Limitaciones y advertencias

- Un recorte alfa es 2D/2.5D, no una persona en 3D. Puede orientarse al espectador como cartel en AR, pero las vistas lateral y trasera reales exigen una etapa de reconstrucción con cobertura multivista suficiente.
- Las máscaras numeradas por fotograma requieren entrada de tasa de fotogramas constante. VIQ rechaza las fuentes con tasa variable detectada antes de la extracción costosa; hay que normalizar previamente a CFR.
- El modo equirectangular solo admite estéreo monoscópico 2:1. El estéreo over/under o side-by-side, las panorámicas parciales o en mosaico, los originales de cámara de ojo de pez dual y las fuentes cubemap directas deben convertirse o dividirse antes; el modo `auto` rechaza estos diseños cuando los metadatos los declaran.
- Las máscaras y los fotogramas codificados conservan la disposición de píxeles equirectangular, pero VIQ todavía no inyecta cajas de proyección Spherical Video V2 en las salidas filtradas. Muchos reproductores de 360 necesitan esos átomos de contenedor para activar la reproducción esférica; la inyección debe hacerse aguas abajo.
- Los límites entre caras del cubemap pueden confundir al modelo de segmentación cuando el sujeto los cruza, por lo que conviene revisar la previsualización y las máscaras exportadas en las costuras y los polos.
- El modo equirectangular exige un fotograma de proporción aproximadamente 2:1 y sin metadatos de rotación de pantalla sin resolver.
- El promediado de máscaras entre fotogramas adyacentes de rembg está desactivado por defecto porque puede dejar fantasmas de movimiento.
- MatAnyone 2 es la etapa de refinado preferida, pero su uso está restringido a escenarios no comerciales; para producción comercial hay que revisar la licencia exacta y considerar alternativas.
- Los pesos descargados por rembg pueden tener términos distintos de la licencia MIT del software, por lo que hay que revisar las condiciones del modelo concreto antes de usarlo en producción.
- La exportación HEVC con alfa está limitada a macOS en la práctica, ya que depende de AVFoundation y RealityKit.
- El repositorio de HuggingFace no declara licencia, idiomas ni pipeline, y no registra descargas ni interacciones, por lo que no hay validación comunitaria del proyecto.
- No se han publicado métricas objetivas de calidad, sesgo o robustez; la única evaluación disponible es la inspección manual de las previsualizaciones y los diagnósticos de `manifest.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/psikosen/viq
- Perfil del autor en GitHub: https://github.com/psikosen
- MatAnyone 2 (etapa de refinado, licencia no comercial): https://github.com/pq-yang/MatAnyone2
- Filtro `v360` de FFmpeg: https://ffmpeg.org/ffmpeg-filters.html#v360
- Auditoría de tecnología y licencias citada en la model card: DEEP_RESEARCH_AUDIT.md (referenciada en el repositorio, no enlazada de forma directa en la información disponible)
- Trabajo homónimo no relacionado, sobre representaciones visuales cuantizadas alineadas con texto: https://arxiv.org/abs/2606.27313 y https://arxiv.org/html/2606.27313
- Trabajo homónimo no relacionado, sobre clasificación de demencia con atención cuántica: https://ieeexplore.ieee.org/document/11250020
