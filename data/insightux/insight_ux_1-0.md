# InsightUX/Insight_UX_1.0

## Resumen

InsightUX es un sistema de eye-tracking basado en webcam que convierte cualquier portátil con cámara en una herramienta de investigación de experiencia de usuario (UX). El modelo principal, `gaze_cnn_v4.onnx`, es una red neuronal convolucional binocular con backbone EfficientNet-B0 que estima la dirección de la mirada a partir de dos parches de ojos y la pose de la cabeza. El sistema completo incluye calibración por usuario, validación de precisión y un navegador de escritorio que genera mapas de calor, líneas de tiempo de atención y listas de elementos de página ordenadas por fijación visual.

Desarrollado por InsightUX, el proyecto se distribuye bajo licencia MIT y está diseñado para ejecutarse localmente en Windows, sin necesidad de hardware especializado. Su relevancia actual radica en democratizar la investigación de UX: permite a diseñadores y desarrolladores obtener datos de atención visual sobre sus interfaces con un coste prácticamente nulo, en lugar de depender de equipos de seguimiento ocular profesionales como Tobii. El repositorio incluye el modelo ONNX (0,1 GB), scripts de calibración de 16 puntos, validación de precisión en píxeles y un pipeline de inferencia con mapeo RBF para convertir las predicciones del modelo en coordenadas de pantalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN binocular con backbone EfficientNet-B0, entrada dual de parches de ojos + pose de cabeza |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | no disponible (formato ONNX, posible FP32/FP16, no especificado) |
| Idiomas soportados | no disponible (modelo de vision, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (.onnx + .onnx.data), checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo `gaze_cnn_v4` es una red convolucional binocular que procesa simultáneamente dos parches de ojo (izquierdo y derecho) junto con la pose de la cabeza estimada mediante `solvePnP`. El backbone es EfficientNet-B0, una arquitectura eficiente en cómputo que extrae características visuales de los parches oculares. La salida del modelo son dos ángulos de mirada (yaw y pitch), que posteriormente se mapean a coordenadas de pantalla mediante una función de calibración RBF (Radial Basis Function) personalizada por usuario.

El entrenamiento se realizó con un dataset propio no especificado en la documentación. El repositorio incluye un script `calibrate.py` que realiza un ajuste fino (*fine-tuning*) del modelo para cada usuario y configuración, usando 16 puntos de calibración y rechazo automático de parpadeos y cambios de iluminación. Este ajuste es esencial porque la geometría ocular, las características de la cámara y el tamaño de pantalla varían entre personas y entornos. El sistema también detecta si la apertura del párpado (que se reduce al mirar hacia abajo) correlaciona mejor con la posición vertical que la salida cruda del modelo, y utiliza la señal más fuerte de las dos.

## Capacidades

- Estimación de la dirección de la mirada (yaw y pitch) a partir de imágenes de webcam en tiempo real.
- Mapeo de ángulos de mirada a coordenadas de pantalla mediante calibración RBF personalizada.
- Generación de mapas de calor de atención visual sobre capturas reales de la página web.
- Creación de líneas de tiempo de fijación y listas de elementos de página ordenadas por tiempo de atención.
- Clasificación de regiones de interés (AOI) gruesas: barra de navegación, hero, pie de página, etc.
- Detección automática de parpadeos y rechazo de muestras con iluminación deficiente durante la calibración.
- Validación de precisión en píxeles tras la calibración mediante 9 puntos de prueba.
- Funcionamiento sin hardware especializado: solo requiere una webcam estándar.

## Casos de uso

- **Investigación de UX en páginas web**: un diseñador puede estudiar qué elementos de una landing page captan realmente la atención del usuario, generando mapas de calor y listas de fijación tras una sesión de navegación. El sistema es adecuado porque la precisión del 5-10% del diagonal de pantalla permite distinguir regiones grandes como hero vs. barra lateral.
- **Pruebas de usabilidad con usuarios reales**: en lugar de un laboratorio con eye-tracker profesional, un equipo de producto puede ejecutar sesiones en el portátil de cada participante, con calibración individual de un minuto, y obtener datos de atención comparables para identificar problemas de jerarquía visual.
- **Evaluación de diseños alternativos (A/B testing visual)**: se pueden comparar dos versiones de una misma página midiendo qué versión mantiene la mirada del usuario durante más tiempo en los elementos clave, gracias a la línea de tiempo de atención generada automáticamente.
- **Optimización de accesibilidad**: detectar si los usuarios con dificultades visuales (por ejemplo, baja visión) fijan la mirada en zonas donde el contraste es insuficiente, ayudando a ajustar colores y tamaños de fuente.
- **Investigación académica en interacción persona-ordenador**: estudiantes e investigadores pueden recopilar datos de eye-tracking a escala sin presupuesto para hardware caro, usando el pipeline de calibración y validación incluido.
- **Mejora de dashboards y herramientas de análisis**: los equipos de producto pueden integrar el modelo en sus propias aplicaciones de escritorio para monitorizar la atención del usuario durante el uso de software complejo, identificando funciones que pasan desapercibidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o ImageNet) porque se trata de un modelo de estimación de mirada, no de lenguaje o clasificación genérica. El autor proporciona datos de rendimiento cualitativos y cuantitativos en la documentación:

| Metrica | Valor |
|---|---|
| Correlacion horizontal (yaw vs screen-X) | r = +0.995 |
| Correlacion vertical (pitch vs screen-Y) | r = +0.883 |
| Error medio tras buena calibracion | 5-10% del diagonal de pantalla |
| Precision vertical | Tipicamente peor que la horizontal (oclusion del iris por el parpado) |

Estos valores son reportados por el autor en la model card y corresponden a una sesión de calibración típica, no a un benchmark controlado. No hay comparaciones con otros modelos de eye-tracking en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero el modelo ONNX pesa 0,1 GB, por lo que es razonable asumir que cabe en cualquier GPU moderna (incluso integradas) o en CPU.
- **GPU recomendada**: no especificada. Dado el tamaño del modelo, una GPU de gama media (GTX 1660 o superior) o incluso CPU deberian ser suficientes para inferencia en tiempo real.
- **Compatibilidad con GPU de consumo**: sí, cualquier portatil con webcam y Windows deberia poder ejecutarlo. No se requieren GPU profesionales.
- **Opciones de despliegue**: la aplicacion se ejecuta como app de escritorio local con pywebview (WebView2). El modelo ONNX puede integrarse en otros proyectos mediante el runtime ONNX, aunque el pipeline de calibracion y mapeo RBF es parte del repositorio.
- **Latencia y throughput**: no se especifican. Se asume tiempo real (30 fps) dado el diseño para uso interactivo, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Existen sistemas comerciales como Tobii Pro o soluciones academicas como GazeCapture, pero no hay datos publicos que permitan una comparacion directa con InsightUX en terminos de arquitectura, rendimiento o licencia. Por tanto, esta seccion se declara como no disponible.

## Limitaciones y advertencias

- **Solo Windows**: la aplicacion depende de pywebview con backend WinForms y WebView2; otras plataformas no estan probadas y probablemente no funcionen sin modificaciones.
- **Python 3.11 obligatorio**: el proyecto usa la API legacy de face-mesh de mediapipe que no existe en Python 3.12 o superior. Es necesario crear un entorno virtual con esa version exacta.
- **Precision limitada**: el error medio de 5-10% del diagonal de pantalla es suficiente para regiones grandes (AOI) pero no para analisis a nivel de palabra o linea de texto.
- **Sensibilidad al movimiento de cabeza**: la calibracion asume una postura relativamente estable; movimientos bruscos durante la sesion degradan la precision.
- **Sin correccion de distorsion de lente**: `solvePnP` asume cero distorsion, lo que introduce errores cerca de los bordes del frame.
- **Calibracion por persona y por setup**: no se puede reutilizar la calibracion de otra persona ni tras cambios de iluminacion, posicion o camara.
- **Riesgo de sesgos**: no se mencionan sesgos especificos, pero al ser un modelo de vision entrenado probablemente con datos de un grupo demografico limitado, podria tener menor precision con ciertos tipos de ojos, tonos de piel o condiciones de iluminacion no representadas en el entrenamiento.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantias ni soporte. El usuario es responsable de verificar la idoneidad para su caso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/InsightUX/Insight_UX_1.0
- No se proporcionan otros enlaces (papers, blogs, repos externos) en la informacion disponible.
