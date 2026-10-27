# microduckapp/microduck-phone-call

## Resumen

`microduckapp/microduck-phone-call` es un asset de robótica, no un modelo de lenguaje: se trata de un "move" o movimiento pregrabado de 10,3 segundos para el robot bípedo Microduck, publicado por la organización `microduckapp` en HuggingFace bajo el pipeline `robotics` y la etiqueta `microduck-move`. El repositorio contiene tres artefactos: `policy.onnx` (la política de control, con 61 observaciones de entrada y 14 consignas articulares de salida a 50 Hz), `manifest.json` (los metadatos que la app MicroDuck necesita para instalar y reproducir el movimiento) y `media/preview.mp4` (una previsualización visual). El movimiento consiste en una llamada telefónica teatralizada: el robot inclina la cabeza, da vueltas en círculo, asiente, se ríe y se despide con un "bye" alegre.

El modelo se enmarca en el ecosistema Microduck, el robot bípedo de 25 cm y 399 dólares desarrollado por Pollen Robotics (grupo Hugging Face), presentado en agosto de 2026 como plataforma abierta de IA física entrenada con aprendizaje por refuerzo en MuJoCo. Los moves como este son el mecanismo de distribución de comportamiento expresivo del robot: pequeños controladores ONNX que la app descarga e instala para que la unidad física ejecute una secuencia concreta.

Su relevancia es doble. Por un lado, es un ejemplo canónico de "modelo" en el sentido de IA física: pesos de una política de control empaquetados para inferencia en tiempo real, con un presupuesto de 20 ms por paso. Por otro, ilustra un patrón de distribución emergente en robótica de consumo, donde el comportamiento se versiona y comparte como artefactos independientes en un hub, igual que ocurre con los pesos de un LLM. No hay que confundirlo con un modelo generativo: no procesa texto, no tiene contexto conversacional y no expone ninguna API de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de control exportada a ONNX; la model card no documenta la topología de la red) |
| Parámetros totales | No disponible (el repositorio completo ocupa 0,0 GB según HuggingFace, redondeado) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 valores por paso de control, sin memoria larga documentada |
| Tipos de cuantización | No disponible (se distribuye un único `policy.onnx`; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no procesa texto) |
| Licencia | No disponible (ni la model card ni los metadatos de HuggingFace la indican) |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` y `media/preview.mp4` |
| Interfaz de entrada | 61 observaciones por paso |
| Interfaz de salida | 14 consignas articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,3 s |
| Pipeline (HuggingFace) | `robotics` |
| Etiquetas | `onnx`, `robotics`, `microduck-move`, `region:us` |
| Autor | `microduckapp` |
| Descargas / likes | 0 / 0 (a fecha de creación del registro) |
| Fecha de creación | 2026-10-27 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la política: solo se especifica el contrato de interfaz (61 entradas, 14 salidas, 50 Hz) y el empaquetado ONNX. No se indica si se trata de un perceptrón multicapa, una red recurrente, un transformer pequeño o un controlador híbrido, ni se publica el número de capas, el ancho de las mismas ni el régimen de precisión numérica. Tampoco se documenta el proceso de obtención del movimiento: no consta si deriva de una política entrenada con aprendizaje por refuerzo, de una captura de movimiento retargetizada o de una animación por keyframes convertida a política. Fuera del alcance de este archivo, las fuentes públicas sobre el programa Microduck sí indican que el robot se entrena con aprendizaje por refuerzo en MuJoCo, lo que constituye contexto del ecosistema pero no una confirmación sobre este checkpoint concreto.

El dato técnico más relevante es el contrato de despliegue. `manifest.json` actúa como descriptor de instalación: define qué necesita el robot para adoptar el movimiento dentro de la app MicroDuck. El repositorio forma parte de un catálogo de 16 modelos de la misma organización, etiquetados como `microduck-move`, lo que sugiere una convención común de empaquetado (un ONNX por comportamiento más su manifiesto) y posiblemente una interfaz de observación compartida entre todos ellos. No hay información sobre normalización de observaciones, espacio de acciones, unidad de las consignas articulares (radianes o grados), límites de par ni estrategia de sim2real.

## Capacidades

- Ejecución de una secuencia expresiva cerrada de 10,3 segundos con inclinación de cabeza, giro en círculos, asentimiento, risa y despedida.
- Generación de consignas de control para 14 articulaciones a 50 Hz a partir de 61 observaciones.
- Reproducción determinista y repetible del mismo movimiento en cada ejecución, apta para demostraciones y validación de hardware.
- Instalación mediante manifiesto dentro de la app MicroDuck, sin necesidad de reentrenamiento en el dispositivo.
- Inferencia en formato ONNX, portable entre runtimes y plataformas (CPU, GPU, aceleradores embebidos).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües: no procesa ni genera lenguaje.
- No incorpora visión, audio ni modo "thinking"; el componente de voz del robot Microduck reside en otra capa del stack.

## Casos de uso

- Demostraciones de producto y ferias: el movimiento está diseñado explícitamente como pieza de exhibición, con una duración de 10,3 s que encaja en una interacción breve de escaparate; `media/preview.mp4` permite mostrar el resultado sin necesidad de tener el robot delante.
- Pruebas de integración del pipeline de instalación: al incluir `manifest.json` junto al ONNX, sirve para verificar de extremo a extremo el flujo de descubrimiento, descarga, instalación y reproducción de moves en la app MicroDuck.
- Validación de hardware y banco de pruebas articular: al emitir 14 consignas a 50 Hz, permite comprobar el seguimiento de trayectorias de las articulaciones, detectar holguras o limitaciones de rango y medir la latencia real del bucle de control.
- Referencia para investigación en sim2real: comparar la ejecución del mismo ONNX en simulador y en la unidad física permite cuantificar la brecha de transferencia y calibrar parámetros del modelo dinámico.
- Base para composición de comportamientos: al ser una política corta y autocontenida, puede usarse como bloque en un sistema de secuenciación que encadene varios moves (por ejemplo, este movimiento seguido de otro del catálogo `microduck-move`) y evaluar las transiciones entre ellos.
- Contenido y material de marketing reproducible: la secuencia fija garantiza que las tomas de vídeo salgan idénticas entre ejecuciones, lo que simplifica la producción de material promocional y la comparación de tomas.
- Docencia en IA física: ejemplo mínimo y de tamaño despreciable para explicar el ciclo observación-política-acción, el empaquetado ONNX y la distribución de políticas de control en hubs de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito del movimiento, error de seguimiento articular, tasa de caídas, consumo energético, latencia de inferencia ni comparaciones cuantitativas con otros moves del catálogo. Tampoco aplican métricas de tipo MMLU, HumanEval o GSM8K, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: prácticamente nula. El repositorio completo ocupa 0,0 GB según HuggingFace (redondeado) e incluye un vídeo de previsualización, por lo que los pesos deben situarse en el orden de kilobytes a pocos megabytes.
- GPU recomendadas: no se requiere GPU. Cualquier acelerador es sobredimensionado para esta carga; el cómputo cabe en el presupuesto de la controladora del propio robot.
- Cabe en hardware de consumo y embebido: CPU de escritorio, Raspberry Pi, placas ARM y módulos Jetson son suficientes; no se publica una lista de compatibilidad oficial.
- Opciones de despliegue: ONNX Runtime como runtime natural del formato; alternativas como TensorRT u OpenVINO son viables si se convierte el grafo, aunque no hay documentación de conversión publicada.
- Presupuesto temporal: a 50 Hz el bucle debe cerrar en 20 ms por paso, incluyendo adquisición de observaciones y envío de consignas. La latencia real de inferencia no está publicada.
- Throughput: no disponible.
- Almacenamiento: despreciable; el peso dominante del repositorio es probablemente el fichero `preview.mp4`.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas / salidas | Frecuencia | Duración | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| `microduckapp/microduck-phone-call` | Move expresivo MicroDuck (ONNX) | 61 / 14 | 50 Hz | 10,3 s | No disponible | No disponibles |
| `microduckapp/microduck-midnight-snack` | Move MicroDuck (mismo catálogo) | No disponible | No disponible | No disponible | No disponible | No disponibles |
| Políticas de locomoción ONNX genéricas para bípedos de investigación | Control continuo | No disponible | No disponible | Indefinida | Variable según proyecto | No disponibles |
| Modelos fundacionales de robótica (VLA) tipo visión-lenguaje-acción | Política multimodal extremo a extremo | Variable (imagen + texto + estado) | Variable | Indefinida | Variable | No comparables: otro régimen de cómputo y otro objetivo |

La comparación cuantitativa no es posible con la información disponible: no hay métricas publicadas para este move ni para sus hermanos de catálogo. La diferencia funcional frente a un modelo VLA es de escala y propósito: aquí se distribuye una secuencia expresiva fija de 10 segundos, no una política generalizable que interprete instrucciones.

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de licencia en la model card y en los metadatos impide asumir derechos de uso comercial, redistribución o modificación. En producción, tratar el artefacto como "todos los derechos reservados" hasta confirmación del autor.
- Cero adopción registrada: 0 descargas y 0 likes implican ausencia de validación por terceros; no hay informes independientes de que el movimiento se reproduzca correctamente en hardware real.
- Especificación de observaciones incompleta: no se documenta el orden, las unidades ni la normalización de los 61 valores de entrada, ni de las 14 salidas. Sin esa información, integrar el ONNX fuera de la app MicroDuck requiere ingeniería inversa o acceso al código de la aplicación.
- Sin información de sim2real: no se indica en qué condiciones (simulador, unidad física, superficies, carga de batería) se validó el movimiento. Un comportamiento expresivo que implique giros y cabeceos puede degradarse con fricción, terreno irregular o batería baja.
- Dependencia de hardware específico: el movimiento está calibrado para la cinemática del Microduck; no es transferible a otro robot sin retargeting.
- Duración fija y sin lógica de recuperación: no se documenta qué ocurre si el robot pierde el equilibrio a mitad de secuencia, ni si existe un estado seguro de salida.
- Riesgo de alucinación no aplicable; en su lugar, el riesgo operativo es la ejecución incorrecta de consignas sin mecanismo de verificación publicado.
- Sin soporte de idioma ni de texto: cualquier expectativa de interacción conversacional debe resolverse en otras capas del stack del robot.
- Fecha y versionado: el registro data de 2026-10-27 y no se declara versión semántica; conviene fijar el commit exacto si se integra en un pipeline reproducible.
- Al tratarse de contenido expresivo con componentes de risa y gestos, conviene revisar la adecuación cultural del movimiento si el robot se despliega en entornos profesionales o educativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-phone-call
- Organización MicroDuck en HuggingFace: https://huggingface.co/microduckapp
- Presentación de Microduck (Pollen Robotics): https://pollen-robotics.com/microduck/blog/introducing-microduck/
- Cobertura de MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura de TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura de The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
