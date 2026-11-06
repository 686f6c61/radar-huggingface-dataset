# Ambarella/RetinaFace

## Resumen

RetinaFace es un detector de caras de una sola etapa (*single-stage*) que combina una red troncal convolucional con aprendizaje multitarea para predecir simultáneamente ubicaciones de caras, puntos clave faciales (*landmarks*) y características contextuales. El modelo original se describe en el artículo *RetinaFace: Single-Shot Multi-Level Face Localisation in the Wild* (arXiv:1905.00641) y esta ficha corresponde a la variante con *backbone* ResNet-50 publicada por Ambarella en Hugging Face.

Esta publicación concreta no es el modelo de investigación original, sino una versión empaquetada y optimizada por Ambarella para su despliegue en hardware de visión embebida (SoCs de las familias N1-655, X7, CV7, CV72 y CV75) mediante su cadena de herramientas Cooper SDK y Cooper Foundry. El repositorio incluye artefactos binarios específicos por dispositivo, tanto en variante *Amba_optimized* como con activaciones en FP16.

El modelo resuelve el problema de detección y localización facial en imágenes en condiciones no controladas, con un equilibrio entre precisión y eficiencia computacional que lo hace adecuado para autenticación, videovigilancia e interacción persona-ordenador. Es relevante para desarrolladores que trabajan con hardware Ambarella y necesitan un detector facial listo para producción, aunque su utilidad fuera de ese ecosistema es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN single-stage (RetinaFace) con backbone ResNet-50 y aprendizaje multitarea |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada 3x640x640) |
| Tipos de cuantizacion | Amba_optimized y Activation_fp16 (según nomenclatura del autor) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | binarios específicos por dispositivo (.bin); pesos PyTorch de referencia vía repositorio oficial |

## Arquitectura y entrenamiento

RetinaFace es un detector de caras de una sola etapa construido sobre una red troncal ResNet-50. La arquitectura emplea un *feature pyramid* multinivel y cabezas multitarea que predicen, para cada ancla, la puntuación de confianza de la cara, la regresión de la *bounding box*, cinco puntos clave faciales y una señal de localización densa (*dense face localisation*) que aporta supervisión adicional a nivel de píxel. Esta combinación de supervisión débil (cajas) y fuerte (landmarks y máscaras) es la innovación principal del artículo original.

Según la model card, el modelo se entrena sobre el conjunto de datos WIDER FACE. No se proporcionan en la información disponible detalles sobre el número de tokens (no aplica), composición exacta del dataset, ni si se emplearon técnicas de *fine-tuning* adicionales o aumentos de datos específicos más allá de lo descrito en el artículo original. La publicación de Ambarella se centra en el empaquetado y la optimización para sus aceleradores, no en un reentrenamiento documentado. Tampoco se detalla el proceso de conversión a los formatos binarios por dispositivo más allá de la referencia a Cooper SDK y Cooper Foundry.

## Capacidades

- Detección de caras en imágenes en condiciones no controladas (*in the wild*).
- Localización de cinco puntos clave faciales (ojos, nariz y comisuras de la boca).
- Predicción de *bounding boxes* con puntuaciones de confianza por ancla.
- Localización densa de caras a nivel de píxel como señal auxiliar de entrenamiento.
- Procesamiento de imágenes a resolución de entrada 3x640x640.
- Despliegue optimizado en hardware Ambarella (N1-655, X7, CV7, CV72, CV75) mediante Cooper SDK.
- No dispone de capacidades de generación de texto, razonamiento, código ni *tool calling*: es un modelo puramente de visión por computador.
- No dispone de soporte multilingüe ni de agentes; no aplica.
- No se documentan modos especiales como *thinking mode*, visión generativa o audio.

## Casos de uso

- **Autenticación biométrica facial**: el modelo detecta y localiza la cara y sus puntos clave, lo que permite alinear el rostro antes de pasarlo a un módulo de reconocimiento. Su naturaleza *single-stage* reduce la latencia en el *pipeline* de acceso.
- **Videovigilancia en dispositivos embebidos**: al estar optimizado para SoCs Ambarella de bajo consumo, puede ejecutarse en cámaras IP o *edge devices* para detectar y contar personas en tiempo real sin enviar vídeo a la nube.
- **Interacción persona-ordenador**: la detección de *landmarks* faciales permite estimar la orientación de la cabeza y la mirada, útil en interfaces que reaccionan a la atención del usuario.
- **Preprocesado en *pipelines* de reconocimiento facial**: las cajas y puntos clave sirven como etapa de alineación previa a modelos de *embedding* facial, mejorando la precisión del reconocimiento aguas abajo.
- **Análisis de aforo y analítica de vídeo**: combinado con un *tracker*, el detector permite contar transeúntes y generar estadísticas de ocupación en comercios o espacios públicos.
- **Control de calidad en captura de imagen**: en aplicaciones de fotografía o videoconferencia, el modelo puede verificar que hay una cara bien encuadrada y con landmarks visibles antes de capturar.
- **Sistemas de seguridad y alertas**: detección de presencia de personas en zonas restringidas mediante cámaras conectadas a hardware Ambarella, con procesamiento local para preservar la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como *mAP* en WIDER FACE ni comparaciones cuantitativas con otros detectores.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Al tratarse de un detector CNN con *backbone* ResNet-50 y entrada 640x640, la huella de memoria es moderada, pero no se proporcionan cifras concretas.
- **GPU recomendadas**: el modelo está pensado para los aceleradores integrados de Ambarella (N1-655, X7, CV7, CV72, CV75). Para ejecución en GPU de propósito general se puede usar la implementación de referencia en PyTorch, pero no se documentan requisitos.
- **Compatibilidad con GPU de consumo**: no confirmada en la información disponible. La implementación de referencia en PyTorch podría ejecutarse en GPUs de consumo, pero no se aportan datos de rendimiento.
- **Opciones de despliegue**: Cooper SDK 2.5.4 y Cooper Foundry 2.3 para hardware Ambarella; PyTorch para la implementación de referencia (repositorio oficial de biubug6).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| RetinaFace-ResNet50 (esta ficha) | CNN single-stage, ResNet-50 | 3x640x640 | no disponible | Hugging Face (Ambarella) |
| RetinaFace (original, biubug6) | CNN single-stage, ResNet-50 / MobileNet | variable | licencia del repositorio original (no verificada aquí) | GitHub + pesos en Google Drive |
| MTCNN | CNN en cascada de tres etapas | variable | no disponible en esta ficha | Implementaciones múltiples en GitHub |
| SCRFD | CNN single-stage | variable | no disponible en esta ficha | Implementaciones en repositorios de investigación |

No se dispone de datos comparativos de rendimiento (mAP, latencia) en la información proporcionada, por lo que la comparación se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no declara licencia, lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor o consultar el repositorio original antes de usarlo en producción.
- **Dependencia de hardware Ambarella**: los artefactos `.bin` están compilados para SoCs concretos (N1-655, X7, CV7, CV72, CV75) y no son portables a otras plataformas.
- **Riesgo de sesgo**: como todo detector entrenado en WIDER FACE, puede presentar sesgos de rendimiento según etnia, edad, iluminación y oclusión; la model card no documenta análisis de equidad.
- **Alucinación**: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en detección, especialmente en caras pequeñas u ocluidas.
- **Limitaciones de resolución**: la entrada fija a 640x640 puede degradar la detección de caras muy pequeñas en imágenes de alta resolución si no se aplica un escalado adecuado.
- **Sin información sobre el dataset de evaluación**: no se aportan métricas ni particiones de validación, lo que dificulta estimar el rendimiento real en dominios distintos a WIDER FACE.
- **Escasa documentación**: el repositorio tiene 10 descargas y 0 *likes*, y la model card es breve; no hay guía de integración más allá de la referencia a Cooper SDK.

## Enlaces

- Hugging Face: https://huggingface.co/Ambarella/RetinaFace
- Artículo original: https://arxiv.org/abs/1905.00641
- Implementación de referencia: https://github.com/biubug6/Pytorch_Retinaface
- Pesos originales: https://drive.google.com/file/d/14KX6VqF69MdSPk3Tr9PlDYbq7ArpdNUW/view?usp=drive_link
- Dataset WIDER FACE: http://shuoyang1213.me/WIDERFACE/
- Artefactos binarios por dispositivo: disponibles en la sección de archivos del repositorio de Hugging Face (n1-655, x7, cv7, cv72, cv75, en variantes amba_optimized y act16)
