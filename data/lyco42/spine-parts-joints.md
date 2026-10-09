# lyco42/spine-parts-joints

## Resumen

Spine Parts Joints es un modelo de visión por computador especializado en la detección de puntos articulares sobre renders 2D de personajes estilo Spine con fondo transparente (RGBA). A partir de una imagen, predice ocho mapas de calor correspondientes a ocho tipos de articulación (head_top, neck, shoulder, elbow, wrist, hip_joint, knee, ankle) y, mediante los scripts incluidos en el repositorio, genera directamente un esqueleto de Spine 3.8 con pesos de skinning. Lo desarrolla el usuario lyco42 y se publica bajo licencia CC0-1.0.

El modelo cierra una línea de trabajo que empezó con segmentación densa de partes (v1 18.8, v2 26.73 y v3 31.21 val mIoU) y que migró a detección de articulaciones al comprobar que esta tarea local es mucho más eficiente en datos para el objetivo real: automatizar el rigging 2D. La versión alojada en el repositorio se identifica como v7 en la tabla de versiones, aunque el título de la model card mencione v6, y alcanza un val PCK@10%diag de 84.09.

Es relevante para estudios de videojuegos y pipelines de assets que necesiten automatizar el paso de render a esqueleto en Spine, porque ofrece un flujo completo desde la imagen hasta un proyecto Spine importable con animaciones de ejemplo. La entrada se procesa a 256x256 píxeles y el modelo no maneja texto, por lo que carece de capacidades lingüísticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de mapas de calor sobre PyTorch; backbone no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 256x256 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin entrada ni salida de texto) |
| Licencia | cc0-1.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura de red empleada. Se describe como un modelo de regresión que produce ocho mapas de calor de articulaciones (uno por clase, con 0-2 instancias por clase y canal sin pico cuando la articulación está ocluida). El desarrollo se apoya en PyTorch y torchvision, y admite ejecución completa en CPU. Los puntos centrales del torso (pecho, cintura, cadera) no se aprenden: se derivan analíticamente a partir de los puntos medios de hombros y caderas.

El entrenamiento usa el dataset público lilyco4242/spine-parts-seg-ds, con 460 clips y aproximadamente 10.900 fotogramas de 256x256, divididos 90/10 por hash del nombre del rig para evitar fugas. Las etiquetas de articulaciones se derivan de etiquetas de partes ya existentes, sin anotación adicional, mediante un procedimiento documentado (conservación del mayor componente conexo por parte, punto medio entre píxeles vecinos con EDT, barrido de la columna central para el cuello con una restricción anatómica que impide bajarlo por debajo de la línea de hombros, y orden de resolución cadera-rodilla-tobillo con prior de simetría muslo/pantorrilla). La model card no indica explícitamente si hubo RLHF, DPO ni otras fases de ajuste.

## Capacidades

- Detección de ocho tipos de articulación sobre renders RGBA de personajes 2D: head_top, neck, shoulder, elbow, wrist, hip_joint, knee y ankle.
- Salida de mapas de calor por clase, con supresión de canales cuando la articulación está ocluida (el modelo aprende que solo emite pico si el punto es visible).
- Generación de esqueleto de Spine 3.8 con jerarquía de huesos, coordenadas locales relativas al padre, rotaciones y longitudes, con eje Y invertido al convenio de Spine.
- Cálculo de partición por píxel del esqueleto y pesos de skinning top-2 por distancia inversa.
- Exportación a proyecto Spine completo (archivos .json, .atlas y .png) con un único slot de malla ponderada y animaciones de ejemplo de idle y wave.
- Derivación analítica de puntos de torso (pecho, cintura y centro de cadera) a partir de los puntos detectados.
- No dispone de tool calling, función de agente, capacidades multilingües ni modos de razonamiento, ya que es un modelo exclusivamente visual.

## Casos de uso

- Rigging automático de assets 2D: dado un render RGBA de un personaje, el modelo produce el esqueleto y los pesos de skinning, y spine_export.py entrega un proyecto importable en Spine 3.8, lo que elimina el trazado manual de huesos por personaje.
- Integración en pipelines de producción de videojuegos: los scripts se ejecutan por línea de comandos y son deterministas, por lo que pueden encadenarse en procesos por lotes que reciban catálogos de personajes y generen rigs de forma masiva.
- Prototipado rápido de animaciones: la exportación incluye animaciones de idle y wave, lo que permite validar el funcionamiento del esqueleto sin escribir animaciones desde cero.
- Preprocesado para herramientas de animación: las particiones por píxel y los pesos top-2 permiten deformar la malla en motores de animación 2D que acepten geometría ponderada.
- Auditoría y control de calidad de assets: el script infer_example.py genera visualizaciones con los puntos detectados, útiles para revisiones manuales antes de dar por bueno un rig.
- Generación de datos sintéticos de pose: las etiquetas de articulación derivadas del propio dataset pueden reutilizarse como referencia en experimentos de estimación de pose 2D sobre personajes chibi.
- Investigación en estimación de puntos clave sin texto: sirve como caso de estudio de un detector de joints pequeños entrenado con GT derivado automáticamente en lugar de anotado a mano.

## Benchmarks y rendimiento

El modelo reporta un PCK@10%diag (umbral del 10% de la diagonal de la imagen, emparejamiento de instancias por pico más cercano) sobre el conjunto de validación. La tabla siguiente recoge la métrica principal y el desglose por articulación de la versión del repositorio.

| Metrica | Valor |
|---|---|
| val PCK@10%diag (global) | 84,09 |
| head_top | 0,868 |
| neck | 0,836 |
| shoulder | 0,831 |
| elbow | 0,804 |
| wrist | 0,725 |
| hip_joint | 0,913 |
| knee | 0,914 |
| ankle | 0,851 |

Comparativa de versiones incluidas por el autor (la model card advierte que los PCK de distintas versiones de GT no son directamente comparables, porque la revisión neckclamp cambió la definición del punto del cuello):

| Version | val PCK@10%diag | GT_REV | Nota |
|---|---|---|---|
| Segmentacion v1/v2/v3 | 18,8 / 26,73 / 31,21 mIoU | no disponible | Segmentación densa, descartada |
| Joints v4 | 82,47 | pre-final | Primera versión con mapas de calor |
| Joints v3 | 83,25 | 2026-10-08-final | no disponible |
| Joints v5 | 85,00 | 2026-10-08-final | Ajuste de hiperparámetros (lr 2e-4, 24 épocas) |
| Joints v6 | 84,65 | 2026-10-08-neckclamp | neck 0,684 -> 0,879 con GT de cuello recortado |
| Joints v7 (repositorio) | 84,09 | 2026-10-08-neckclamp | Primera exportación de rig de extremo a extremo con 12 personajes |

No se han publicado resultados de benchmarks con modelos externos en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,3 GB, pero ese tamaño incluye los esqueletos generados y los recursos del dataset, no solo los pesos; no se publica el tamaño exacto del checkpoint.
- El modelo opera sobre imágenes de 256x256 y el autor indica que infer_example.py y auto_rig.py funcionan con PyTorch en CPU; spine_export.py es puro Python y no requiere torch.
- Al tratarse de una red de tamaño moderado para imágenes pequeñas, es viable su ejecución en CPU para inferencias puntuales y en GPU de gama de consumo para lotes; no se publica VRAM mínima ni recomendada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) ni opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI. Como modelo de visión y no de lenguaje, esas herramientas no aplican de forma directa.
- No se publican cifras de latencia ni de throughput.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas con otros modelos ni con herramientas equivalentes. A modo de contexto, este modelo se sitúa en la intersección entre los estimadores de pose 2D (por ejemplo, familias de mapas de calor aplicadas a keypoints humanos, como OpenPose o HRNet) y las utilidades de auto-rigging para motores de animación 2D como Spine. No se dispone de datos de parámetros, contexto ni rendimiento de esos sistemas en la información disponible para construir una comparación cuantitativa.

| Modelo | Categoria | Salida | Licencia | Comparativa cuantitativa |
|---|---|---|---|---|
| lyco42/spine-parts-joints | Detección de joints 2D + auto-rig | 8 mapas de calor y esqueleto Spine 3.8 | cc0-1.0 | val PCK@10%diag 84,09 |
| Estimadores de pose humana 2D | Detección de keypoints | Mapas de calor de keypoints | no disponible | no disponible |
| Herramientas de auto-rig en Spine | Rigging asistido | Esqueleto y pesos | no disponible | no disponible |

## Limitaciones y advertencias

- El entrenamiento cubre únicamente 154 rigs, todos de personajes chibi con orientación frontal; la generalización a cuerpos muy distintos (monturas, criaturas multípedas) es desconocida.
- Entre un cuarto y la mitad de los fotogramas carecen de GT para codo, muñeca, rodilla y tobillo por oclusión; el modelo aprende a solo emitir pico cuando el punto es visible, pero puede producir falsos negativos en poses nuevas.
- El punto del cuello es un marcador analítico (algo por encima de la línea de hombros) y no una articulación anatómica real; en personajes de cuello largo requiere ajuste manual.
- El autor advierte que PCK@10%diag es una métrica de umbral amplio y recomienda inspección visual con infer_example.py antes de usar el rig en producción.
- En la prueba de exportación de extremo a extremo hay un caso fallido documentado: char_263_skadi_summer_3 detectó solo siete huesos (se perdieron hombro, codo y muñeca de un lado) y al levantar el brazo apareció un residuo por pesos mal asignados. Se recomienda revisar manualmente cualquier exportación con menos de 12 huesos.
- El repositorio no publica el conjunto de datos ni los assets de los personajes originales; solo se liberan el modelo y el dataset de segmentación asociado.
- La licencia CC0-1.0 permite uso comercial y modificación sin restricciones atribucionales, pero no cubre los derechos de los personajes originales, que no se distribuyen.
- Existe una discrepancia entre el título de la model card (v6) y la tabla de versiones, que identifica el repositorio como v7; conviene verificarla antes de citar la versión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lyco42/spine-parts-joints
- Dataset asociado: https://huggingface.co/datasets/lilyco4242/spine-parts-seg-ds
- Los resultados de búsqueda web incluidos no contienen enlaces relevantes para este modelo (tratan sobre el importador DAZ y topología diferencial).
