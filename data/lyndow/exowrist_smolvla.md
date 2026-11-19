# Lyndow/ExoWrist_Smolvla

## Resumen

ExoWrist_Smolvla es un archivo experimental de checkpoints de robótica publicado por el usuario Lyndow en Hugging Face, construido sobre SmolVLA (el modelo visión-lenguaje-acción compacto de Hugging Face) y orientado al control de un brazo robótico Piper. El repositorio no es un modelo único listo para usar, sino una colección multi-versión de pesos de acción, cabezas de intención/esqueleto, dependencias base, código fuente y configuraciones de entrenamiento generadas entre el 16 y el 19 de noviembre de 2026. Su tamaño total es de 37,2 GB.

El modelo resuelve el problema de generar comandos de acción para un brazo de 6 grados de libertad (más pinza) a partir de tres imágenes de cámara y el estado articular medido, con una tarea de texto fija interna. Incluye variantes con entrenamiento conjunto de intención (versión J1) y ajuste fino sobre demostraciones reales y simuladas (R1). La relevancia es limitada: se trata de un archivo de investigación con validación únicamente en simulación (MuJoCo e Isaac), sin despliegue en hardware real verificado, sin calibración de cámara de campo y sin puente de ejecución de motores Piper.

La arquitectura subyacente es SmolVLA (política visión-lenguaje-acción basada en SmolVLM con experto de acción), complementada con capas de contexto visual y cabezas auxiliares de intención/espacial/eventos. El contexto de acción es de 10 pasos con re-planificación cada 3, a una base temporal de entrenamiento de 30 Hz. El repositorio advierte explícitamente que la raíz no debe pasarse directamente a `SmolVLAPolicy.from_pretrained()`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (SmolVLM + experto de acción) con capas de contexto visual y cabezas de intención/espacial/eventos en variantes J1 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: 3 imágenes + estado de 7 dimensiones; salida: 10 pasos de acción) |
| Tipos de cuantizacion | no disponible (pesos en `.pt` de PyTorch) |
| Idiomas soportados | zh, en (tarea de texto interna fija, no entrada libre del operador) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt`; safetensors como tag del repo; dependencias base en formato original de SmolVLA/SmolVLM |

## Arquitectura y entrenamiento

El modelo parte de SmolVLA, una política visión-lenguaje-acción que combina un backbone SmolVLM con un experto de acción para generar trayectorias motrices. Sobre esta base, el autor añade dos capas de contexto visual y, en la variante J1, cabezas de intención, espaciales y de eventos entrenadas de forma conjunta con los parámetros de acción. La entrada es multimodal: tres imágenes redimensionadas con preservación de proporción y relleno a 512×512, más un vector de estado de 7 dimensiones (6 ángulos articulares en radianes y apertura de pinza normalizada). La salida son bloques de 10 acciones, de las que se ejecutan 3 antes de re-planificar.

El entrenamiento se organiza en varias ramas: F (arquitectura original SmolVLA con adaptación de capas visuales), J1 (inicializada desde F con entrenamiento conjunto de cabezas), R1 (ajuste fino de F con mezcla de demostraciones reales y simuladas), R1 conservador (interpolación 0,1 × (R1 − F) en un único checkpoint), E (ajuste fino del experto de acción con demostraciones correctivas) y C20k (entrenamiento con demostraciones filtradas y recuperadas). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó RLHF o DPO. La evaluación se realizó en MuJoCo e Isaac, no en hardware real.

## Capacidades

- Generación de acciones motrices para brazo robótico Piper de 6 ejes más pinza, en bloques de 10 pasos con re-planificación cada 3.
- Percepción visual multimodal a partir de tres cámaras, con preprocesado a 512×512.
- Condicionamiento por tarea de texto fija interna (no entrada libre del operador).
- Detección de intención en la variante J1 mediante cabeza dedicada, con capacidad de no activarse ante ejemplos negativos (1/1 en la evidencia reportada).
- Manejo de pinza con objetivos binarios (0 = cerrada, 1 = abierta) y limitación de pendiente de cierre.
- Procesamiento de consistencia de prefijo (RTC) para reutilizar acciones previas, con `inference_delay=0`.
- Soporte multilingüe limitado a chino e inglés en metadatos y tarea interna.
- No dispone de tool calling, function calling, razonamiento multi-paso general, visión de propósito general ni modo de pensamiento.

## Casos de uso

- Investigación en políticas visión-lenguaje-acción: sirve como base reproducible para estudiar variantes de SmolVLA con cabezas auxiliares de intención, comparando checkpoints F, J1 y R1 bajo un mismo pipeline de evaluación en MuJoCo.
- Replicación de experimentos de manipulación con brazo Piper: el paquete incluye activos oficiales del robot y entornos de simulación, lo que permite reconstruir las condiciones de evaluación sin partir de cero.
- Estudio de detección de intención en robótica asistida: la variante J1 con cabeza de intención y ejemplos negativos permite analizar cuándo el sistema debe o no iniciar una asistencia.
- Análisis de latencia y planificación de control: los datos de auditoría (583 ms de mediana, 715 ms P95 en RTX 4080 SUPER) permiten estudiar la viabilidad de esquemas de re-planificación a 30 Hz frente a la latencia real.
- Desarrollo de pipelines de inferencia offline: el script `tools/bundle_inference.py` con `--self-test` ofrece un punto de partida para validar la cadena imagen-estado-acción antes de integrar hardware.
- Formación y docencia en robótica de imitación: el archivo multi-versión con runbook en chino documenta el ciclo completo de entrenamiento, evaluación y auditoría de datos.
- Comparación de estrategias de ajuste fino: las ramas R1, R1 conservador, E y C20k permiten contrastar interpolación de pesos frente a ajuste fino directo sobre demostraciones.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estándar (MMLU, HumanEval, GSM8K), sino tasas de éxito en escenarios de desarrollo con pocas muestras, no en conjuntos de test independientes ni en hardware real:

| Version | Evidencia reportada |
|---|---|
| F | Flujo completo con disparo visual externo: 2/4; subtarea de acción tras petición explícita + RTC: 3/4 |
| J1 | Flujo completo con disparo de intención propio: 2/4; negativos correctamente no iniciados: 1/1 |
| R1 conservador | Agarre: 4/4; flujo completo: 1/4; negativos no iniciados: 1/1 |
| R1 completo | Flujo completo: 0/4 |
| E | Petición explícita + RTC: 2/4 |
| C20k | Flujo completo: 1/4; petición explícita + RTC: 2/4 |

Latencia registrada en la auditoría del 16-11-2026 sobre RTX 4080 SUPER: mediana de 583 ms y P95 de 715 ms por cálculo de bloque de acción (medición histórica de pipeline, no en tarjeta de campo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 37,2 GB, pero las dependencias base (SmolVLA, SmolVLM, DINOv2, Sapiens2, DETR, MediaPipe) pueden cargarse por separado.
- GPU recomendadas: NVIDIA con soporte CUDA; la medición de latencia se realizó en RTX 4080 SUPER (16 GB). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, al menos en RTX 4080 SUPER según la evidencia de latencia; no se confirma para GPUs con menos VRAM.
- Despliegue: el autor indica explícitamente que no se descargue en Mac; el entorno previsto es Linux con GPU NVIDIA. Se usa `huggingface_hub` para la descarga y `tools/bundle_inference.py` como entrada de inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica de este tipo).
- Latencia y throughput: 583 ms de mediana y 715 ms P95 por bloque de acción; la etiqueta de 30 Hz corresponde a la base temporal de entrenamiento, no a la tasa real de generación. El RTC actual es consistencia de prefijo con `inference_delay=0`, no control asíncrono en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de acción | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ExoWrist_Smolvla | no disponible | 10 pasos, re-planificación cada 3 | no disponible | Hugging Face, 0 descargas, 0 likes | Archivo multi-versión, solo simulación |
| SmolVLA (Hugging Face) | no disponible en esta ficha | no disponible en esta ficha | licencia de SmolVLA (ver UPSTREAM.md) | Hugging Face | Modelo base sobre el que se construye este archivo |
| Otros VLA robóticos (p. ej. OpenVLA, π0) | no disponible en esta ficha | no disponible en esta ficha | según modelo | Hugging Face / repos públicos | No comparados en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre este archivo y alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Validación exclusivamente en simulación (MuJoCo e Isaac); no hay verificación en hardware real, calibración de cámara de campo ni puente de ejecución de motores Piper.
- El repositorio raíz no debe pasarse directamente a `SmolVLAPolicy.from_pretrained()`; requiere seleccionar una versión concreta y seguir el runbook.
- Las tasas de éxito reportadas (p. ej. 2/4, 4/4) provienen de escenarios de desarrollo con pocas muestras, no de conjuntos de test independientes, y no deben interpretarse como rendimiento en producción.
- La licencia no está disponible, lo que impide evaluar restricciones de uso comercial.
- La tarea de texto es fija e interna; no admite instrucciones libres del operador.
- El RTC actual no implementa control asíncrono en tiempo real; la etiqueta de 30 Hz no garantiza 30 generaciones de acción por segundo.
- La correspondencia entre la apertura normalizada (1) y milímetros reales debe medirse en hardware; no se puede asumir soporte de 100 mm.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una política motriz, el riesgo se traduce en acciones erróneas más que en texto incorrecto.
- Idiomas limitados a chino e inglés en metadatos y documentación; el runbook principal está en chino.
- Los pesos `.pt` contienen metadatos del proyecto; solo deben cargarse ficheros verificados por hash del propio repositorio.
- El estado de subida debe confirmarse con `UPLOAD_COMPLETE.json`; su ausencia indica archivo incompleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lyndow/ExoWrist_Smolvla
- Runbook (referenciado en la model card): RUNBOOK_ZH.md dentro del repositorio
- Registro de modelos: model_registry.json dentro del repositorio
- Manifiesto de integridad: manifest.json y UPLOAD_COMPLETE.json dentro del repositorio
- Auditoría de latencia: validation/latency_audit_20261116.json dentro del repositorio
- Inventario de cachés excluidas: inventory_excluded_feature_caches.json dentro del repositorio
- Licencias upstream: licenses/UPSTREAM.md dentro del repositorio
- SmolVLA (modelo base): no se proporciona URL directa en la información disponible
