# KillerBoss/e-os-v4

## Resumen

E-OS v4 es un modelo generativo de interfaz de usuario (UI) desarrollado por KillerBoss (Rudolf) y distribuido bajo licencia Apache 2.0. A diferencia de los modelos de lenguaje, este modelo no procesa texto, sino que genera el fotograma completo de una pantalla de Android (384x832 píxeles) a partir de un layout aproximado dibujado por código (192x416) y un vector de estado de 32 dimensiones. El autor lo denomina "Full-Frame Generative OS": no utiliza máscaras ni celdas condicionadas, todo lo visible es generado por una única red neuronal.

El modelo se llama FrameGenerator y tiene 0.88 millones de parámetros, con 3.9 GMACs a resolución de aplicación. Está diseñado para ejecutarse en la NPU Hexagon de un Samsung Galaxy S26 Ultra mediante NNAPI, con un objetivo de 60 Hz y un fallback a CPU. El repositorio incluye el APK de la versión 0.4, así como los scripts completos de generación de dataset, entrenamiento y exportación a ONNX y TFLite. El modelo cubre ocho pantallas del sistema: bloqueo, inicio, cajón de aplicaciones, calculadora, tiempo, música, ajustes e información.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional generativa con capas Conv, SiLU, FiLM, Concat, Resize y DepthToSpace |
| Parametros totales | 0.88 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (se distribuye como TFLite para NPU; no se especifica el esquema de cuantización) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17) y TFLite |

## Arquitectura y entrenamiento

El modelo FrameGenerator es una red convolucional que toma como entrada un hint de layout de tamaño 1x3x192x416 y un vector de estado de 32 dimensiones. La salida es un fotograma de 1x3x384x832 con activación sigmoid. La arquitectura incluye capas de convolución, activaciones SiLU, modulación FiLM, concatenación, redimensionado y DepthToSpace, todas ellas compatibles con NNAPI para su ejecución eficiente en la NPU Hexagon.

El dataset utilizado para el entrenamiento consta de 3,200 muestras: 1,600 escenas multiplicadas por 2 variantes de tiempo. Cada muestra es un par hint->estilo, donde el hint es el layout aproximado y la imagen estilizada es el fotograma objetivo. El vector de estado de 32 dimensiones codifica información como la pantalla actual, transición, ondas de pulsación, hora del día, tono de color, estado de la música y condiciones meteorológicas. El pipeline de entrenamiento se compone de tres scripts: `gen_os4_dataset.py` para generar el dataset, `train_os4.py` para el entrenamiento por fragmentos con reanudación mediante checkpoints, y `export_os4.py` para exportar a ONNX opset 17. Posteriormente, `ai_hub_os4.py` convierte el modelo a TFLite y genera el perfil NPU para el Galaxy S26 Ultra.

## Capacidades

- Generación completa de fotogramas de interfaz de usuario de Android a 384x832 píxeles, sin máscaras ni celdas condicionadas.
- Condicionamiento mediante un layout aproximado de 192x416 y un vector de estado de 32 dimensiones que controla pantalla, transiciones, hora del día, tono de color, música y clima.
- Ocho pantallas integradas: bloqueo (Aurora), inicio (Glühwürmchen), cajón de aplicaciones, calculadora, tiempo (sol, nubes, lluvia, estrellas), música (visualizador de espectro), ajustes (colores de acento, interruptor de IA y diagnóstico) e información.
- Botones de retroceso funcionales en la interfaz, en la barra de navegación y mediante el botón físico de hardware.
- Transiciones deslizantes y efectos de ondulación (ripples) en cada pulsación de tecla.
- Objetivo de 60 Hz mediante NNAPI sobre la NPU Hexagon, con fallback limpio a CPU y un modo seguro de arranque que siempre inicia.
- Panel de diagnóstico integrado en los ajustes que lee el archivo `crash.txt`.
- Distribución como APK instalable sobre la versión 0.3.x con la misma firma.

## Casos de uso

- Interfaz generativa para dispositivos Android de gama alta: el modelo puede generar dinámicamente pantallas de sistema completas en un Samsung Galaxy S26 Ultra, aprovechando la NPU Hexagon para alcanzar los 60 Hz.
- Personalización visual de sistemas operativos móviles: gracias al vector de estado, se pueden variar en tiempo real la hora del día, el tono de color, el clima o la música, generando una estética coherente sin necesidad de assets predefinidos.
- Prototipado rápido de UI generativa: los scripts incluidos permiten regenerar el dataset y reentrenar el modelo, lo que facilita experimentar con nuevas pantallas o estilos visuales en un entorno controlado.
- Investigación en compresión y eficiencia de modelos generativos: con solo 0.88 millones de parámetros y 3.9 GMACs, es un caso de estudio de generación de imágenes a alta resolución en hardware móvil.
- Demostración de capacidades de NNAPI y Hexagon NPU: el proyecto sirve como ejemplo de despliegue de un modelo convolucional en la NPU de un dispositivo Android, con perfilado y exportación a TFLite.
- Evaluación de técnicas de condicionamiento por layout: el uso de un hint de baja resolución como condición para generar el fotograma completo es un enfoque útil para tareas de síntesis de interfaces o de imágenes condicionadas por estructuras espaciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona una carpeta `eval/` con métricas PSNR y previsualizaciones, pero no se proporcionan valores numéricos concretos en la model card ni en los resultados de búsqueda web. Tampoco hay comparaciones con otros modelos.

## Requisitos de hardware

- Dispositivo objetivo: Samsung Galaxy S26 Ultra, específicamente su NPU Hexagon.
- Ejecución mediante NNAPI con perfil NPU; se incluye un fallback a CPU para entornos sin NPU.
- No se especifican requisitos de VRAM, ya que no es un modelo de lenguaje y no se ejecuta en GPU convencional.
- El modelo se distribuye como APK de Android, por lo que el despliegue se realiza instalando el paquete `com.killerboss.eos` (versionCode 5).
- El objetivo de rendimiento declarado es 60 Hz, pero no se publican cifras de latencia ni throughput.
- Opciones de despliegue: APK en Android, con modelos en formato ONNX y TFLite. No se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser aplicables a este tipo de modelo.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada. E-OS v4 es un modelo generativo de interfaces de usuario muy específico para hardware móvil, sin equivalentes directos en la misma categoría.

## Limitaciones y advertencias

- El modelo no es un modelo de lenguaje: no procesa texto, no genera código ni responde a prompts en lenguaje natural. Cualquier intento de usarlo como LLM no funcionará.
- Está diseñado exclusivamente para un dispositivo concreto, el Samsung Galaxy S26 Ultra y su NPU Hexagon. La compatibilidad con otros dispositivos Android no está garantizada.
- El dataset de entrenamiento es pequeño (3,200 muestras), lo que puede limitar la generalización a escenas o condiciones no vistas.
- El repositorio en HuggingFace tiene un tamaño de 0.0 GB y no registra descargas ni likes, lo que sugiere que los archivos del modelo podrían no estar disponibles públicamente o que el proyecto está en una fase muy temprana.
- La model card está escrita en alemán y no incluye documentación detallada sobre el proceso de entrenamiento, hiperparámetros ni métricas de evaluación.
- No se publican resultados de benchmarks ni comparativas, por lo que el rendimiento real frente a otras soluciones es desconocido.
- Al ser un proyecto experimental, puede haber errores o inestabilidades en el APK; el autor menciona un "modo seguro" que arranca siempre, pero no se detallan los fallos cubiertos.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un dispositivo específico y la falta de documentación pueden complicar su integración en productos.

## Enlaces

- HuggingFace: https://huggingface.co/KillerBoss/e-os-v4
- Perfil del autor en HuggingFace: https://huggingface.co/KillerBoss
- Descarga directa del APK: https://huggingface.co/KillerBoss/e-os-v4/resolve/main/apk/e-os-npu-v0.4.apk
