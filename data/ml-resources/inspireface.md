# ml-resources/InspireFace

## Resumen

InspireFace es un SDK de reconocimiento facial multiplataforma desarrollado en C/C++, distribuido como paquete de Python (pypi) y como librería nativa. Deriva del proyecto InsightFace, en concreto de la implementación del paquete C++ `cpp-package/inspireface`, y está mantenido por el equipo de HyperInspire. Este repositorio concreto de HuggingFace (`ml-resources/InspireFace`) es un espejo del original publicado en ModelScope por el usuario `tunmxy`, sin declaración de licencia en el origen.

El problema que resuelve es el despliegue de pipelines completos de análisis facial en entornos muy heterogéneos: detección y seguimiento de rostros, extracción y comparación de embeddings, detección de landmarks, estimación de pose, atributos (edad, género, emoción), prueba de vida (liveness) y detección de mascarillas. Para ello abstrae distintos backends de inferencia (CPU, MNN con CUDA, TensorRT, NPU de Rockchip y Neural Engine de Apple), de modo que el mismo código funciona en Linux, macOS, iOS y Android.

Es relevante ahora porque permite ejecutar reconocimiento facial en tiempo real tanto en GPUs de servidor como en SoC de gama baja (RV1109/RV1126, RK3566/RK3588) y en dispositivos Apple con ANE, sin obligar a reescribir la integración por plataforma. No es un modelo de lenguaje: no tiene parámetros publicados, ventana de contexto ni cuantizaciones documentadas en la información disponible, y el repositorio ocupa aproximadamente 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDK nativo C/C++ de visión por computador sobre modelos derivados de InsightFace; la arquitectura de red concreta no se detalla |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no declarada en el origen (unknown); todos los derechos reservados a los autores originales |
| Formato de pesos | no disponible |
| Backends de inferencia | CPU, MNN_CUDA, CUDA/TensorRT, RKNPU, ANE (MacOS/iOS), Metal |
| Plataformas | Linux (ARMv7, ARMv8, x86/x86_64), macOS (Intel y Apple Silicon), iOS, Android (ARMv7, ARMv8, x86_64) |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red, el número de parámetros, el volumen de datos de entrenamiento ni si hubo fases de ajuste fino con RLHF o DPO (no aplicable a un sistema de reconocimiento facial). Lo que sí se documenta es la capa de integración: InspireFace es un SDK derivado del paquete C++ de InsightFace, con una API nativa que orquesta varios modelos especializados (detección, landmarks, embedding facial, atributos, liveness, calidad y pose) y los ejecuta sobre distintos motores de inferencia.

La innovación destacable no está en el modelo en sí, sino en la portabilidad: el mismo SDK se compila y pasa pruebas en Linux con CPU, en Linux con CUDA/TensorRT, en SoC Rockchip mediante RKNPU (RV1109/RV1126, RV1103/RV1106, RK3566/RK3568, RK3588) y en dispositivos Apple usando Metal y el Neural Engine. La tabla de compatibilidad del autor marca como verificados todos los objetivos listados salvo RK3588, que figura como soportado pero sin resultado de test confirmado. No se documentan técnicas como decodificación especulativa ni attention linear, propias de modelos generativos.

## Capacidades

- Detección y seguimiento de rostros de alta precisión en tiempo real.
- Reconocimiento facial: extracción de características y comparación de embeddings.
- Detección de landmarks faciales.
- Atributos faciales: edad, género y emoción.
- Prueba de vida (liveness) silenciosa y cooperativa.
- Detección de mascarilla facial.
- Evaluación de calidad de la cara.
- Estimación de ángulo de pose facial.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica: no es un modelo de lenguaje).
- No se documentan capacidades multilingües ni de generación de texto, audio o vídeo.

## Casos de uso

- Control de acceso físico: el SDK se integra en lectores de puerta o tornos con SoC Rockchip (RK3566/RK3588) para verificar identidad en el propio dispositivo, usando detección, embedding facial y liveness sin depender de la nube.
- Verificación de identidad remota (KYC): combinación de detección de rostro, prueba de vida cooperativa y comparación contra una imagen de referencia para validar altas en servicios financieros.
- Analítica de audiencia en retail: estimación de edad, género y emoción sobre cámaras ya instaladas, agregando métricas anónimas por franja horaria.
- Seguridad y videovigilancia: seguimiento de rostros en flujo de vídeo y búsqueda de coincidencias contra una galería local, con la ventaja de poder ejecutarse en GPU de servidor vía CUDA/TensorRT.
- Aplicaciones móviles de foto y edición: detección de landmarks y pose para aplicar filtros, reencuadres o efectos sobre el rostro en iOS y Android con aceleración por ANE o ARM.
- Cumplimiento de normativa de mascarillas: detección de mascarilla y evaluación de calidad de imagen para sistemas de control en entornos sanitarios o industriales.
- Preprocesado en pipelines biométricos: uso del SDK como etapa de calidad y normalización (pose, calidad, landmarks) antes de alimentar un motor de reconocimiento propio.
- Despliegue en dispositivos de borde sin GPU: los modelos cuantizados para RKNPU permiten inferencia en placas RV1103/RV1106 de muy bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU de servidor: soportadas NVIDIA mediante backend CUDA y TensorRT (modelos concretos no especificados).
- Aceleradores de borde: RKNPU en RV1109/RV1126, RV1103/RV1106, RK3566/RK3568 y RK3588.
- Apple: CPU, Metal y Neural Engine (ANE) en macOS Intel, Apple Silicon e iOS.
- Android: ARMv7, ARMv8 y x86_64, incluidas variantes con RKNPU.
- CPU en servidor y escritorio: Linux ARMv7, ARMv8 y x86/x86_64.
- Opciones de despliegue: librería nativa C/C++ y paquete de Python en PyPI (`inspireface`).
- Latencia y throughput: no disponibles.
- No se dispone de datos sobre si cabe en GPUs de consumo tipo RTX 4090, aunque el soporte CUDA/TensorRT hace plausible su uso en ellas; no confirmado en la información disponible.

## Comparativa con modelos similares

| Proyecto | Relación | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InspireFace | Objeto de esta ficha | no disponible | no aplica | no declarada (unknown) | HuggingFace (espejo), ModelScope, GitHub, PyPI |
| InsightFace (`cpp-package/inspireface`) | Proyecto origen del que deriva | no disponible | no aplica | no disponible en esta información | GitHub |
| CompreFace | Alternativa autoalojada de reconocimiento facial | no disponible | no aplica | no disponible en esta información | no disponible en esta información |
| DeepFace | Alternativa en Python con múltiples modelos | no disponible | no aplica | no disponible en esta información | no disponible en esta información |

No se dispone de datos numéricos de rendimiento, parámetros ni licencia para establecer una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- La licencia no está declarada en el origen; el espejo indica explícitamente que no es un lanzamiento oficial y que todos los derechos quedan en manos de los autores originales. No se puede asumir uso comercial sin aclarar la licencia con los responsables.
- El repositorio de HuggingFace registra 0 descargas y 0 likes, y su fecha de creación es posterior a la del proyecto original; se trata de un espejo no oficial, con el riesgo de desactualización respecto a los repositorios mantenidos.
- Los sistemas de reconocimiento facial están sujetos a sesgos demográficos (tono de piel, edad, género, iluminación) que no se documentan ni se cuantifican en la información disponible.
- Existe riesgo de falsos positivos y falsos negativos en la comparación de embeddings; no se publican tasas de FAR/FRR ni umbrales recomendados.
- La prueba de vida silenciosa puede ser vulnerable a ataques de presentación sofisticados (deepfakes, máscaras 3D); no se documenta su robustez frente a ellos.
- El uso de reconocimiento facial está regulado en la UE por el RGPD y, en determinados contextos, por la AI Act; es responsabilidad del integrador evaluar la base legal.
- El soporte de RK3588 figura como disponible pero sin pruebas superadas, por lo que conviene validarlo antes de producción.
- No hay información sobre arquitectura, cuantizaciones ni formatos de pesos, lo que dificulta auditar el modelo o reproducir sus resultados.

## Enlaces

- HuggingFace (espejo): https://huggingface.co/ml-resources/InspireFace
- ModelScope (origen del espejo): https://www.modelscope.cn/models/tunmxy/InspireFace
- GitHub (desarrollo): https://github.com/HyperInspire/InspireFace
- GitHub (estable, dentro de InsightFace): https://github.com/deepinsight/insightface/tree/master/cpp-package/inspireface
- Releases: https://github.com/HyperInspire/InspireFace/releases/latest
- PyPI: https://pypi.org/project/inspireface/
