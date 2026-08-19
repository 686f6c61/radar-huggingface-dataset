# sohail-kustagi/MAAS-Disaster-Response

## Resumen

El repositorio MAAS-Disaster-Response, publicado por el usuario sohail-kustagi, contiene dos modelos fine-tuned diseñados para el proyecto **Multi-Disaster Autonomous Aerial Swarm (MAAS)**: un detector de objetos basado en YOLOv10 Nano y un agente de razonamiento basado en Microsoft Phi-3-Mini 4k Instruct. El objetivo es dotar a enjambres de drones autónomos de capacidades de análisis visual en tiempo real y de toma de decisiones autónoma en escenarios de desastre (incendios, inundaciones, personas atrapadas). El modelo YOLO analiza flujos de vídeo WebRTC desde drones, mientras que el Phi-3 adaptado con LoRA procesa la telemetría y las detecciones para generar comandos de navegación MAVLink sin intervención humana. La relevancia actual reside en la integración de visión por computador y razonamiento de lenguaje en un pipeline de respuesta a emergencias, combinando formatos OpenVINO, PyTorch y GGUF para despliegue en hardware de borde. El repositorio incluye pesos en formato PyTorch, OpenVINO, GGUF y adaptadores LoRA en safetensors, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor (YOLOv10) | Valor (Phi-3-Mini) |
|---|---|---|
| Arquitectura | YOLOv10 Nano | Transformer decoder-only (Phi-3-Mini 4k Instruct) |
| Parametros totales | no disponible (modelo nano, aprox. 2-3 M) | 3.8 B (base) |
| Parametros activos | no aplica (no es MoE) | no aplica (no es MoE) |
| Longitud de contexto | no aplica | 4096 tokens (base) |
| Tipos de cuantizacion | no disponible | GGUF (presumiblemente Q4_K_M, no confirmado) |
| Idiomas soportados | no disponible (deteccion de objetos, no depende de idioma) | en (ingles) |
| Licencia | MIT | MIT (repositorio) |
| Formato de pesos | PyTorch (best.pt), OpenVINO (best_openvino_model/) | GGUF (phi3-lora.gguf), Safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene dos modelos independientes pero complementarios. Por un lado, un **YOLOv10 Nano** (variante eficiente de la familia YOLO) fine-tuned durante varias semanas sobre un dataset de desastres curado, con el objetivo de detectar fuego, inundaciones y personas atrapadas con alta confianza y minimizar falsos positivos en entornos extremos. Los pesos se proporcionan en formato PyTorch y también convertidos a Intel OpenVINO para inferencia en hardware de borde. Por otro lado, un **Phi-3-Mini 4k Instruct** (modelo de lenguaje de 3.8 B parámetros, contexto de 4096 tokens) adaptado mediante LoRA, cuyos adaptadores se distribuyen en formato GGUF y safetensors. Este agente de razonamiento recibe como entrada la telemetría del dron y las detecciones del YOLO, y genera comandos de navegación MAVLink de forma autónoma. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el proceso de ajuste (RLHF, DPO, etc.), más allá de la mención de un fine-tuning intensivo.

## Capacidades

- Deteccion de objetos en tiempo real: fuego, inundaciones y personas atrapadas, optimizada para flujos de vídeo de drones (WebRTC).
- Razonamiento autonomo para generacion de comandos MAVLink: el modelo Phi-3 procesa telemetria y detecciones para producir coordenadas de navegacion sin intervencion humana.
- Integracion con hardware de borde: el modelo YOLO se distribuye en formato OpenVINO para inferencia de alta velocidad en dispositivos con recursos limitados.
- Soporte de cuantizacion GGUF para el modelo de lenguaje, permitiendo despliegue en CPUs y GPUs de baja gama.
- Capacidad multilingue limitada: el modelo de lenguaje esta entrenado principalmente en ingles (segun los tags).
- No se mencionan capacidades de tool calling, agentes multi-step ni vision-language integrada; el pipeline es secuencial (vision + razonamiento).

## Casos de uso

- Vigilancia aerea de incendios forestales: el YOLO detecta focos de fuego en tiempo real desde drones, y el Phi-3 genera rutas de sobrevuelo para confirmar la extension del incendio.
- Busqueda y rescate de personas atrapadas: el detector identifica siluetas humanas en zonas inundadas o escombros, y el agente de razonamiento calcula coordenadas de aproximacion para equipos de rescate.
- Evaluacion de inundaciones urbanas: el sistema analiza flujos de video para detectar zonas anegadas y genera comandos MAVLink para que el dron sobrevuele areas criticas.
- Coordinacion de enjambres de drones: cada dron ejecuta el modelo localmente, permitiendo decisiones autonomas sin depender de una estacion central, ideal para escenarios con comunicacion intermitente.
- Generacion de informes de situacion: el Phi-3 puede resumir las detecciones y telemetria en texto estructurado para los equipos de emergencia, aunque no se especifica en la documentacion.
- Entrenamiento y simulacion de respuesta a desastres: el modelo puede usarse en entornos simulados para validar algoritmos de navegacion autonoma antes de despliegues reales.

## Benchmarks y rendimiento

La model card proporciona dos datos de rendimiento evaluados sobre metraje real de desastres (ej. incendio de una vivienda en Pella):

| Metrica | Valor |
|---|---|
| Velocidad de vision (YOLO OpenVINO) | 10.33 FPS en hardware de borde |
| Latencia de razonamiento (Phi-3) | 29.86 s por generacion de comando MAVLink |

No se publican resultados de benchmarks estandar como mAP, MMLU, HumanEval, etc. en la informacion disponible. Las imagenes de benchmark referenciadas en la model card no estan accesibles en el repositorio.

## Requisitos de hardware

- YOLOv10 Nano: disenado para hardware de borde (ej. NVIDIA Jetson, Raspberry Pi con acelerador). El formato OpenVINO permite inferencia en CPU con aceleracion integrada. Se estima que requiere menos de 1 GB de VRAM en GPU, aunque no se especifica en el repositorio.
- Phi-3-Mini 4k Instruct: con cuantizacion GGUF, puede ejecutarse en CPUs con al menos 8 GB de RAM o en GPUs con 4-6 GB de VRAM (dependiendo del nivel de cuantizacion). La latencia de 29.86 s por comando sugiere que la inferencia se realiza en CPU o en hardware modesto.
- Opciones de despliegue: para el YOLO, se puede usar OpenVINO Runtime, ONNX Runtime o PyTorch. Para el Phi-3, llama.cpp, Ollama o vLLM (aunque vLLM requiere GPU). No se proporcionan metricas de throughput adicionales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de deteccion de desastres o agentes de razonamiento para drones. Los modelos base (YOLOv10 y Phi-3-Mini) tienen referencias publicas, pero los fine-tunings especificos de este repositorio no han sido evaluados contra alternativas. Se puede indicar que, por arquitectura, compite con otros detectores de objetos en tiempo real (YOLOv8, RT-DETR) y con LLMs pequenos para razonamiento (Gemma-2 2B, Llama-3.2 3B), pero no hay datos comparativos.

## Limitaciones y advertencias

- Sesgos y falsos positivos: el dataset de entrenamiento esta "estrictamente curado" pero no se detalla su composicion; puede haber sesgos geograficos o climaticos (solo se menciona la region US en los tags).
- Riesgo de alucinacion en el modelo de lenguaje: al generar comandos MAVLink, el Phi-3 puede producir coordenadas incorrectas si la telemetria es ambigua, lo que requiere validacion humana en entornos criticos.
- Limitaciones de idioma: el modelo de lenguaje solo soporta ingles; no es util para equipos hispanohablantes sin traduccion previa.
- Latencia alta para el razonamiento: 29.86 s por comando puede ser inaceptable en escenarios de emergencia en tiempo real; no se documenta si hay optimizaciones.
- Falta de informacion sobre el proceso de entrenamiento: no se especifica el volumen de datos, la estrategia de fine-tuning ni la evaluacion de sesgos, lo que dificulta la reproducibilidad.
- Licencia MIT: permite uso comercial, pero el modelo base Phi-3 tiene su propia licencia (MIT tambien, aunque hay que verificar los terminos de Microsoft); se recomienda revisar las restricciones del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y no se ha actualizado desde 2026; podria tratarse de un proyecto experimental sin mantenimiento activo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sohail-kustagi/MAAS-Disaster-Response
- Demo interactiva: no disponible (se menciona un Hugging Face Space en el perfil del autor, pero no se proporciona URL directa)
- Modelo base Phi-3-Mini-4k-instruct: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper o documentacion adicional: no disponible
