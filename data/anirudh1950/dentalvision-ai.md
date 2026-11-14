# Anirudh1950/DentalVision-AI

## Resumen

DentalVision-AI es un detector de objetos basado en YOLOv8m (variante Medium de Ultralytics) entrenado para localizar y numerar piezas dentales individuales en radiografías panorámicas dentales según el sistema de numeración FDI de la World Dental Federation. El modelo lo publica el usuario Anirudh1950 en Hugging Face y se distribuye como un proyecto de detección de objetos para imagen médica, no como un modelo de lenguaje.

El modelo resuelve una tarea concreta: dada una radiografía panorámica de 640x640 píxeles, devuelve cajas delimitadoras etiquetadas con los códigos FDI (11-18, 21-28, 31-38, 41-48). El repositorio incluye scripts de entrenamiento, inferencia y un servicio FastAPI con endpoints `/health`, `/predict` y `/predict-batch` que aplica posprocesado anatómico (ordenación por cuadrante y filtrado de detecciones fuera de orden) antes de devolver el JSON.

Es relevante para desarrolladores que necesiten automatizar el registro dental, la planificación de tratamientos o flujos docentes, pero conviene subrayar que se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, con dataset de aproximadamente 500 imágenes anotadas y sin licencia declarada, lo que limita su uso en producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8m (detector de objetos de una etapa, familia Ultralytics) |
| Parámetros totales | no disponible (YOLOv8m estándar ronda los 25,9 M, dato no confirmado en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de imagen 640x640) |
| Tipos de cuantización | no disponible (formato nativo de pesos PyTorch; exportación a otros formatos no documentada en la información) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de salida son códigos FDI numéricos) |
| Licencia | no disponible |
| Formato de pesos | pesos `.pt` de PyTorch (checkpoints `best.pt` en `runs/train/exp/weights/`); no se confirma safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un YOLOv8m, un detector de objetos de una etapa con backbone CSPDarknet y cabeza de detección desacoplada, configurado para una única clase por pieza dental (48 clases FDI). La entrada se estandariza a 640x640 píxeles y la salida son cajas delimitadoras con confianza y clase FDI. El proyecto incorpora posprocesado anatómico específico del dominio: ordenación por cuadrante (Q1-Q4) y filtrado de detecciones fuera de orden, además de opciones de supresión de duplicados mediante WBF o Soft-NMS.

El entrenamiento se realizó sobre aproximadamente 500 radiografías panorámicas anotadas en formato YOLO, divididas en 70% train, 15% validation y 15% test. Los scripts permiten configurar épocas (por defecto 100), batch (16), tamaño de imagen (640) y dispositivo (GPU o CPU). No se documentan en la información disponible el número de tokens (no aplica), la composición exacta del dataset, ni si hubo aumentos de datos o ajuste fino con RLHF/DPO (no aplica a un detector).

## Capacidades

- Detección de piezas dentales individuales en radiografías panorámicas con cajas delimitadoras.
- Numeración automática según el sistema FDI (11-18, 21-28, 31-38, 41-48).
- Posprocesado anatómico integrado: ordenación por cuadrante y filtrado de detecciones inconsistentes.
- Supresión de duplicados configurable mediante WBF (Weighted Boxes Fusion) o Soft-NMS.
- Servicio de inferencia HTTP con FastAPI: `/health`, `/predict` (una imagen) y `/predict-batch` (varias imágenes), con parámetros opcionales `conf`, `iou`, `tta`, `soft_nms`, `soft_nms_method` y `soft_nms_sigma`.
- Salida en JSON con detecciones y, opcionalmente, imágenes anotadas con overlay de cuadrantes Q1-Q4.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector de visión puro.

## Casos de uso

- Automatización de historiales dentales: el servicio `/predict` devuelve las piezas detectadas con código FDI, lo que permite poblar fichas clínicas electrónicas sin transcripción manual del odontólogo.
- Planificación de tratamientos: la ordenación por cuadrante y el filtrado anatómico facilitan identificar piezas ausentes o mal posicionadas antes de diseñar prótesis o extracciones.
- Docencia en radiología dental: el overlay Q1-Q4 y las etiquetas FDI sirven como material de apoyo para que estudiantes comparen su lectura con la del modelo.
- Triaje en clínicas con alto volumen: el endpoint `/predict-batch` permite procesar lotes de radiografías y priorizar las que requieren revisión humana.
- Integración en pipelines de investigación: los scripts de entrenamiento e inferencia permiten reentrenar con datasets propios y evaluar variantes (WBF, Soft-NMS, TTA) sobre el mismo conjunto de validación.
- Control de calidad de anotaciones: el análisis de distribución de clases (`analyze_dataset.py`) y la inferencia sobre el split de test ayudan a detectar etiquetas inconsistentes en datasets dentales propios.
- Prototipado de asistentes clínicos: el JSON de salida puede alimentar reglas de negocio (por ejemplo, alertar de piezas faltantes en un rango FDI concreto) sin necesidad de un modelo de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño típico de YOLOv8m (del orden de decenas de millones de parámetros) es esperable que quepa en GPUs consumer de 4-8 GB, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible. El proyecto menciona una GPU compatible con CUDA como recomendación para entrenamiento, sin modelos concretos.
- Cabe en GPU consumer: probablemente sí para inferencia (YOLOv8m es un modelo compacto), pero no hay confirmación en la información disponible.
- Opciones de despliegue: servicio FastAPI con Uvicorn (`uvicorn serve:app --host 0.0.0.0 --port 8000`); scripts CLI de Ultralytics para inferencia por imagen o directorio. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de objetos).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DentalVision-AI | YOLOv8m | Detección y numeración FDI de piezas dentales | Imagen 640x640 | no disponible | Hugging Face (0 descargas, 0 likes) |
| YOLOv8m estándar (Ultralytics) | YOLOv8m | Detección de objetos genérica | Imagen configurable | AGPL-3.0 (según Ultralytics) | Amplia, muy extendida |
| Detectores dentales publicados en literatura | no disponible | Detección de piezas en radiografías | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos dentales comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de aproximadamente 500 imágenes es reducido y no se documenta su composición demográfica ni la distribución por cuadrantes, lo que puede introducir sesgos hacia determinados tipos de radiografía o poblaciones.
- Riesgo de alucinación: como todo detector, puede generar cajas espurias o asignar códigos FDI incorrectos, especialmente en piezas superpuestas, ausentes o con artefactos; el posprocesado anatómico mitiga pero no elimina este riesgo.
- Limitaciones de contexto o idioma: no aplica idioma; la entrada está limitada a radiografías panorámicas de 640x640 y no se documenta soporte para otras modalidades (periapicales, CBCT).
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir permisos de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Caveat para producción: cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni validación externa; no debe usarse como dispositivo médico ni para diagnóstico sin supervisión de un profesional cualificado.
- El repositorio aparece con tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que la información de tamaño no es fiable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anirudh1950/DentalVision-AI
- Project page (Space): https://huggingface.co/spaces/Anirudh1950/DentalVision-AI
- Repositorio de código (referenciado en la model card, URL genérica): https://github.com/yourusername/DentalVision-AI
- Ultralytics YOLOv8 (framework base): no disponible en la información proporcionada
- Paper o blog del autor: no disponible
