# richardpenner/sportsball-game-recognition

## Resumen

Sportsball game-recognition es un conjunto de cinco modelos de detección de objetos basados en Ultralytics YOLO, desarrollados por Richard Penner, que permiten identificar retransmisiones de béisbol (MLB) y baloncesto (NBA) a partir de la imagen captada por la cámara de un teléfono apuntando a un televisor. El sistema resuelve el problema de reconocer qué deporte se está emitiendo y qué equipos aparecen en pantalla, sin depender de guías electrónicas de programación ni de datos externos. La relevancia actual radica en su enfoque práctico para aplicaciones de segunda pantalla, accesibilidad o automatización doméstica, con modelos optimizados para ejecución en dispositivos Hailo-10H además de PyTorch y ONNX.

Los cinco roles son: un router de deporte (clasifica la imagen completa en béisbol, baloncesto o ninguno), dos localizadores de marcador (scorebug) específicos por liga (MLB y NBA) y dos detectores de equipos que identifican las marcas de los equipos en el recorte del marcador. El repositorio incluye pesos en formato `.pt` (PyTorch), `.onnx`, `.hef` (Hailo) y archivos de etiquetas. El tamaño total del repositorio es de 0,8 GB. No se especifican parámetros totales, arquitectura exacta ni longitud de contexto (concepto no aplicable a detección de objetos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO (variante no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32/FP16 según formato; no se documenta) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), ONNX (.onnx), Hailo Execution Format (.hef) |

## Arquitectura y entrenamiento

Los cinco modelos se basan en la familia YOLO de Ultralytics, aunque no se especifica la variante exacta (p. ej., YOLOv8, YOLO11, etc.). El router de deporte opera sobre la imagen completa de la cámara a una resolución de entrada de 384 píxeles, mientras que los localizadores de marcador aceptan la imagen completa a 768 píxeles y los detectores de equipos trabajan sobre el recorte de alta resolución del marcador a 960 píxeles. El pipeline es secuencial: primero el router selecciona el deporte, luego el localizador correspondiente encuentra el marcador y finalmente el detector de equipos identifica las marcas de los equipos en ese recorte.

Los datos de entrenamiento incluyen fotogramas de retransmisiones revisados y escenas generadas sintéticamente de teléfono-a-televisión. No se proporcionan detalles sobre el número de tokens (concepto no aplicable), composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El autor indica que los datos no se incluyen en el repositorio y que los usuarios deben obtener sus propios datos de entrenamiento y prueba de forma legal. No se documentan innovaciones arquitectónicas específicas más allá del uso estándar de YOLO y la división en roles especializados.

## Capacidades

- Detección de objetos y clasificación de imágenes: el router distingue entre béisbol, baloncesto y ninguna de las dos.
- Localización de marcadores de tanteo (scorebugs) específicos de MLB y NBA en fotogramas completos de cámara.
- Identificación de marcas de equipos de MLB y NBA en recortes de alta resolución del marcador.
- Ejecución en dispositivos Hailo-10H mediante formato `.hef`, con acuerdo del 99,81% con PyTorch en el router (1.067 de 1.069 fotogramas).
- Inferencia acelerada por hardware: el router alcanza 659,49 fotogramas por segundo en el acelerador Hailo.
- Compatibilidad con el ecosistema Ultralytics: los modelos `.pt` se cargan directamente con la API de YOLO.
- Formato ONNX portable para integración en otros entornos de inferencia.

## Casos de uso

- Aplicación de segunda pantalla para aficionados: al apuntar el teléfono a la televisión, la aplicación identifica automáticamente el deporte y los equipos en juego, permitiendo mostrar estadísticas en tiempo real sin intervención manual.
- Automatización doméstica: un sistema puede detectar cuándo se está emitiendo un partido de béisbol o baloncesto y activar grabaciones, ajustar la iluminación o notificar al usuario según sus preferencias.
- Asistencia para personas con discapacidad visual: el reconocimiento del marcador y los equipos puede alimentar un sintetizador de voz que describa qué partido se está viendo y qué equipos compiten.
- Verificación de contenidos para medios: una herramienta de monitorización puede confirmar que un canal está emitiendo un partido de MLB o NBA y qué equipos aparecen, útil para control de parrilla o derechos de emisión.
- Investigación en visión por computador deportiva: el conjunto de modelos sirve como punto de partida para experimentos con YOLO en entornos de captura con teléfono, incluyendo degradación por moiré, reflejos y perspectiva.
- Despliegue en dispositivos de borde: gracias al formato `.hef` y al alto throughput en Hailo, el pipeline puede ejecutarse en tiempo real en hardware de bajo consumo integrado en televisores o decodificadores.

## Benchmarks y rendimiento

Los resultados que se indican a continuación provienen de las pruebas fijas del autor, no de benchmarks estandarizados como MMLU o HumanEval (no aplicables a detección de objetos). Se presentan las métricas publicadas en la model card.

| Modelo / prueba | Metrica | Resultado |
|---|---|---|
| Sport router (test permanente) | Exactitud | 98,78% (1.056/1.069) |
| Sport router (scorebugs reales de telefono) | Aciertos | 13/13 |
| Sport router (acuerdo Hailo vs PyTorch) | Acuerdo | 99,81% (1.067/1.069) |
| Sport router (Hailo acelerador) | Throughput | 659,49 fps |
| Busqueda de marcador enrutada (router + localizadores) | Marcadores encontrados | 98,96% (95/96) |
| Busqueda de marcador enrutada | Falsos positivos en fotogramas sin marcador | 5,00% (3/60) |
| Localizador MLB (retransmision limpia) | Marcadores encontrados | 91,21% (83/91) |
| Localizador MLB | Falsos positivos | 9,09% (2/22) |
| Localizador MLB | Mediana de area compartida | 0,868 |
| Localizador MLB | Mediana de ratio de area predicha | 1,137 |
| Detector de equipos MLB (validacion de entrenamiento) | Precision / Recall / mAP50 / mAP50-95 | 0,937 / 0,936 / 0,961 / 0,754 |
| Detector de equipos NBA (validacion de entrenamiento) | Precision / Recall / mAP50 / mAP50-95 | 0,919 / 0,845 / 0,913 / 0,773 |
| Detector de equipos NBA (test fijo limpio, confianza 0,50) | Al menos un equipo esperado | 91,5% (75/82) |
| Detector de equipos NBA (test fijo limpio, confianza 0,50) | Ambos equipos esperados | 70,0% (56/80) |
| Detector de equipos NBA (test 328 imagenes telefono-a-TV) | Al menos un equipo esperado | 97,0% (318/328) |
| Detector de equipos NBA (test 328 imagenes telefono-a-TV) | Ambos equipos esperados | 72,5% (232/320) |

No se han publicado resultados comparativos con otros modelos de deteccion de objetos en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos minimos de VRAM en la documentacion del modelo. Dado que se trata de modelos YOLO de tamaño no declarado, se estima que la inferencia en CPU es viable para pruebas puntuales, mientras que para uso en tiempo real se recomienda una GPU con al menos 4 GB de VRAM para los modelos de 768 y 960 píxeles de entrada.
- GPU recomendadas: cualquier GPU moderna de NVIDIA (GTX 1660, RTX 3060 o superior) puede ejecutar la inferencia sin problemas. Para despliegues de alto rendimiento, una RTX 4090 o A100 ofreceria latencias muy bajas, aunque no se han publicado mediciones concretas.
- En dispositivos de borde, el modelo esta optimizado para Hailo-10H mediante el formato `.hef`, alcanzando 659 fps en el router.
- Opciones de despliegue: se puede usar la libreria Ultralytics (PyTorch), ONNX Runtime para el formato `.onnx`, o el compilador de Hailo para `.hef`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que son herramientas para modelos de lenguaje, no para vision.
- Latencia y throughput: solo se ha publicado el dato del router en Hailo (659,49 fps). No hay datos de latencia en GPU o CPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en el mismo dominio (reconocimiento de deportes y equipos a partir de marcadores de TV captados con telefono). Los modelos YOLO genericos de Ultralytics (YOLOv8, YOLO11) ofrecen deteccion de objetos general, pero no estan especializados en esta tarea concreta. La comparativa queda limitada a la propia familia YOLO:

| Modelo | Especializacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sportsball (este repositorio) | Deporte (beisbol/baloncesto) y equipos MLB/NBA | .pt, .onnx, .hef | AGPL-3.0 | Publico en Hugging Face |
| YOLOv8 (Ultralytics) | Deteccion general (COCO, etc.) | .pt, .onnx, .tflite | AGPL-3.0 | Publico |
| YOLO11 (Ultralytics) | Deteccion general (COCO, etc.) | .pt, .onnx, .tflite | AGPL-3.0 | Publico |

La diferencia clave es que Sportsball esta entrenado especificamente para el dominio de marcadores de TV y equipos, con un pipeline de tres etapas, mientras que los YOLO genericos requieren entrenamiento adicional o no distinguen entre deportes ni equipos.

## Limitaciones y advertencias

- El modelo esta disenado para una camara de telefono apuntando a un televisor. Los resultados sobre fotogramas de retransmision limpios no garantizan el mismo rendimiento en condiciones reales de captura con telefono (reflejos, moire, perspectiva).
- Si el marcador queda parcialmente fuera del encuadre, es posible que no se detecten ambos equipos.
- El detector de equipos NBA solo cubre graficas de temporada regular. Un test retenido de Summer League no reconocio ambos equipos porque ese estilo de marcador no estaba en el entrenamiento.
- Los estilos graficos de las retransmisiones cambian por red, evento y temporada; el modelo puede fallar ante nuevos disenos no vistos.
- Estos modelos identifican la retransmision y los equipos, pero no proporcionan datos del partido, resumenes ni informacion adicional.
- La licencia AGPL-3.0 impone obligaciones de copyleft: cualquier uso que implique distribucion o prestacion de servicios en red debe publicar el codigo fuente modificado bajo la misma licencia. Esto puede ser restrictivo para uso comercial propietario.
- Los datos de entrenamiento no se incluyen en el repositorio; los usuarios deben obtener sus propios datos de forma legal para reentrenar o evaluar.
- No se documentan sesgos especificos, pero al estar entrenado solo con datos de MLB y NBA, no es aplicable a otras ligas de beisbol o baloncesto (p. ej., ligas europeas o japonesas).
- Riesgo de alucinacion: en deteccion de objetos, el equivalente son los falsos positivos. El localizador MLB tiene una tasa de falsos positivos del 9,09% en fotogramas sin marcador, lo que puede generar detecciones espurias en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/richardpenner/sportsball-game-recognition
- Repositorio de codigo fuente (GitHub): https://github.com/richardpenner/sportsball
- Perfil de Hugging Face del autor: https://huggingface.co/richardpenner
- Perfil de GitHub del autor: https://github.com/richardpenner
