# CodeEvelyn/TableVision

## Resumen

TableVision es un sistema de visión computacional empaquetado como aplicación Python que detecta en tiempo real la ocupación de mesas en un restaurante a partir de la señal de una cámara de seguridad. El repositorio, publicado por el usuario CodeEvelyn en Hugging Face, no contiene pesos de un modelo propio: es un proyecto de aplicación que utiliza el modelo preentrenado YOLO11 de Ultralytics (en sus variantes `yolo11n` y `yolo11s`, entrenadas sobre COCO) para detectar personas y, mediante polígonos configurados manualmente sobre el vídeo, asignar cada persona a una mesa concreta.

La lógica de negocio se apoya en una máquina de estados con histéresis temporal que confirma el estado OCUPADA o DISPONIBLE solo tras observar presencia o ausencia sostenida durante ventanas de tiempo definidas. El resultado se expone en un dashboard web construido con Streamlit, con temporizadores por mesa, tasa de ocupación global e historial de cambios de estado.

Es relevante para desarrolladores que necesiten un prototipo funcional de analítica de ocupación en hostelería sin entrenar modelos propios, aunque se trata de un proyecto de demostración atado a un vídeo y a una configuración de cámara concretos, no de un modelo fundacional reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de visión por computador: detector YOLO11 (Ultralytics, preentrenado en COCO) + asignación geométrica por polígonos (`cv2.pointPolygonTest`) + máquina de estados temporal |
| Parametros totales | No disponible (depende de la variante YOLO11: `yolo11n` o `yolo11s`; el autor no publica cifras) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la interfaz y la documentación están en portugués) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio no contiene pesos; `yolo11n.pt` se descarga automáticamente en la primera ejecución) |

## Arquitectura y entrenamiento

El sistema no entrena ningún modelo. La detección de personas delega en YOLO11, un detector de objetos de la familia Ultralytics preentrenado sobre el dataset COCO, del que se filtra exclusivamente la clase `person` (id 0 de COCO). Sobre esa salida se aplica una etapa geométrica: cada mesa se representa como un polígono que engloba mesa y sillas, definido manualmente en `config/mesas.json` a partir de fotogramas del propio vídeo mediante la herramienta `configurar_mesas.py`. Cada detección se reduce a un punto de anclaje situado al 65 % de la altura de la caja delimitadora (región del quadril) y se asigna a la mesa cuyo polígono lo contiene, con una tolerancia de 12 píxeles.

La innovación técnica del proyecto es la capa de confirmación temporal por histéresis: una mesa pasa a OCUPADA si hay persona en al menos el 60 % de los análisis de los últimos 10 segundos, y vuelve a DISPONIBLE solo si hay persona en el 15 % o menos de los análisis de los últimos 20 segundos. Además, se descartan las cajas cortadas por el borde superior del encuadre para evitar falsos positivos de clientes de pie en el fondo. Todo el procesamiento temporal se ancla al tiempo del vídeo (el reloj parte de 17:01:07, la marca de la cámara en el primer fotograma), no al tiempo de pared, de modo que los temporizadores son consistentes aunque el procesamiento vaya más rápido o más lento que la reproducción real.

## Capacidades

- Detección de personas en vídeo mediante YOLO11 en variantes `yolo11n` (rápida) y `yolo11s` (más precisa).
- Asignación de personas a regiones poligonales predefinidas (14 mesas en la configuración de ejemplo).
- Clasificación binaria de estado por mesa: OCUPADA o DISPONIBLE, con confirmación temporal por histéresis (ventanas de 10 s y 20 s configurables).
- Temporizadores por mesa ("Ocupada há" / "Livre há") y reloj anclados al tiempo del vídeo.
- Dashboard web interactivo con Streamlit: total de mesas, ocupadas, disponibles, tasa de ocupación, tarjeta por mesa e historial de cambios de estado.
- Controles de reproducción: salto a un minuto concreto, submuestreo de fotogramas (analizar 1 de cada N), modo sincronizado con tiempo real y selección de modelo YOLO.
- Herramienta de anotación por clics para redefinir los polígonos de las mesas y generar una imagen de verificación visual.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de un modelo de lenguaje: es un sistema de visión específico de dominio.

## Casos de uso

- Monitorización de ocupación en restauración: el sistema procesa el vídeo de una cámara fija y muestra en tiempo real cuántas mesas están ocupadas y cuántas libres, útil para control de aforo o para optimizar el reparto de sala.
- Análisis histórico de afluencia: el historial de cambios de estado permite reconstruir curvas de ocupación por franja horaria para dimensionar turnos de personal o detectar horas punta.
- Prototipo de gestión de reservas asistida: la tasa de ocupación en vivo puede alimentar un panel interno que indique al personal qué mesas liberar o preparar.
- Despliegue en hardware modesto: con el submuestreo de fotogramas (por ejemplo, 1 de cada 10, unas 3 analíticas por segundo de vídeo) y `yolo11n`, el sistema está pensado para ejecutarse en CPU sin GPU dedicada.
- Base para sistemas de analítica de espacios: la combinación de detector COCO + polígonos + histéresis es reutilizable en otros entornos cerrados (salas de espera, bibliotecas, gimnasios) redefiniendo los polígonos con `configurar_mesas.py`.
- Validación de algoritmos de seguimiento y oclusión: sirve como banco de pruebas para evaluar cómo afectan el submuestreo y las ventanas de histéresis a la estabilidad de las detecciones en escenas con personas en movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por la naturaleza de YOLO11n/s, el autor indica que el modo con submuestreo (1 de cada N fotogramas) es adecuado para CPU, lo que sugiere que no requiere GPU.
- GPU recomendadas: no especificadas. Cualquier GPU compatible con Ultralytics (por ejemplo, series RTX o A100/H100) aceleraría la inferencia, pero no hay cifras publicadas.
- ¿Cabe en GPU de consumo? El diseño está orientado a ejecución en CPU; con GPU de consumo sería viable, pero no se aportan datos de rendimiento.
- Opciones de despliegue: ejecución local con Python 3.12, OpenCV, Ultralytics, NumPy, Pandas y Streamlit; el dashboard se sirve en `http://localhost:8501` mediante `streamlit run app.py`.
- Latencia y throughput estimados: no disponibles. El único dato operativo es que analizar 1 de cada 10 fotogramas equivale a unas 3 analíticas por segundo de vídeo, calificado por el autor como "bueno para CPU".

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Las 14 mesas corresponden a las visibles en la cámara concreta del vídeo de ejemplo; las mesas parcialmente fuera de encuadre (04 y 14) tienen menor precisión.
- Personas pequeñas u ocluidas en el fondo del salón pueden no detectarse en todos los fotogramas; la confirmación temporal compensa la mayor parte, y `yolo11s` mejora la detección a costa de velocidad.
- Un camarero parado más de unos 10 segundos junto a una mesa vacía puede marcarla erróneamente como ocupada.
- El sistema está atado a un vídeo de entrada concreto (`data/restaurante.mp4`, 640x368, 30 fps, 62 minutos) y a una configuración de cámara fija; cambiar de cámara exige redibujar los polígonos.
- La licencia no está declarada en la información disponible, por lo que no puede confirmarse el uso comercial; además, el componente de detección (YOLO11 de Ultralytics) está sujeto a su propia licencia, que debe verificarse por separado.
- Riesgo de sesgos y alucinaciones: no aplica en el sentido de un modelo generativo, pero sí existe riesgo de falsos positivos y negativos derivados de la detección COCO y de la geometría de los polígonos.
- No es un modelo fundacional ni un checkpoint reutilizable: es una aplicación de demostración; el repositorio ocupa 0.0 GB y no contiene pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CodeEvelyn/TableVision
- Repositorio de YOLO11 (Ultralytics): no disponible en la información proporcionada
- Documentación de Streamlit: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
