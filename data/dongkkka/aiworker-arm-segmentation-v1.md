# Dongkkka/AIWorker-Arm-Segmentation-v1

## Resumen

AIWorker-Arm-Segmentation-v1 es un modelo de segmentación de instancias derivado de facebook/sam3, publicado por el usuario Dongkkka en Hugging Face. Su propósito concreto es segmentar en imágenes RGB las partes visibles del robot grabador (brazos, manos, pinzas, dedos y cámaras acopladas) captadas desde cámaras montadas en cabeza y muñeca. Devuelve máscaras de instancia, cajas delimitadoras y puntuaciones de confianza.

El modelo se distribuye como un ajuste fino (finetune) sobre SAM3, con pesos en formato `model.pt` y un script de inferencia (`predict.py`) que aplica por defecto una resolución de entrada de 504 px, el prompt de texto `robot hand`, umbral de confianza 0,3, umbral de máscara 0,5 e inferencia en BF16. Está pensado para robótica de manipulación, donde la auto-percepción del brazo es un requisito previo para evitar colisiones y para el aprendizaje por imitación.

Es relevante por su especialización: en lugar de un modelo genérico de segmentación, ofrece un ajuste orientado a un dominio muy concreto (imágenes de un robot AI Worker), lo que reduce falsos positivos sobre el propio cuerpo del robot en pipelines de percepción. El repositorio ocupa 3,5 GB y la licencia es la SAM License, no una licencia de código abierto permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM3 (Segment Anything Model 3), ajuste fino para segmentación de instancias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen a 504 px por defecto) |
| Tipos de cuantizacion | no disponible (la model card solo menciona inferencia en BF16) |
| Idiomas soportados | en (inglés; el prompt de texto está en inglés) |
| Licencia | SAM License (license_name: sam-license, license: other) |
| Formato de pesos | `model.pt` (checkpoint PyTorch); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de facebook/sam3, la tercera iteración de la familia Segment Anything de Meta, y se ha ajustado fino sobre imágenes del robot AI Worker. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si se emplearon técnicas de RLHF o DPO; únicamente indica que el ajuste se realizó sobre "AI Worker robot imagery". La arquitectura subyacente es la de SAM3, un modelo de segmentación promptable que acepta prompts de texto e imagen y produce máscaras, cajas y puntuaciones.

La evaluación se llevó a cabo sobre 1.317 imágenes de desarrollo con referencias automáticas o asistidas por IA, además de vídeos de cámaras de cabeza y muñeca. El autor advierte explícitamente que estas referencias no constituyen ground truth humano independiente, lo que limita la fiabilidad de las métricas de calidad reportadas. No se documentan innovaciones técnicas adicionales más allá del ajuste fino y la configuración de inferencia (504 px, BF16, umbrales fijos).

## Capacidades

- Segmentación de instancias de las partes visibles del robot: brazos, manos, pinzas, dedos y cámaras acopladas.
- Generación de máscaras de instancia a resolución nativa, cajas delimitadoras en formato `xyxy` y puntuaciones de confianza.
- Segmentación guiada por prompt de texto (por defecto `robot hand`), heredada de la interfaz promptable de SAM3.
- Procesamiento de imágenes RGB individuales procedentes de cámaras de cabeza y muñeca.
- Salida estructurada en `instances.npz` con arrays `masks` (N x H x W), `boxes_xyxy` (N x 4) y `scores` (N), apta para consumo programático.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento; es un modelo puramente de segmentación visual.

## Casos de uso

- Auto-percepción del robot en manipulación: el modelo segmenta los brazos y pinzas del propio robot para que el planificador de movimiento evite autocolisiones, usando las máscaras y cajas devueltas en `instances.npz`.
- Aprendizaje por imitación desde demostraciones: al segmentar las manos y pinzas del operador robot en vídeos de cámara de muñeca, se pueden extraer regiones de interés limpias para entrenar políticas de manipulación.
- Filtrado de oclusiones en pipelines de percepción: las máscaras del brazo permiten enmascarar el cuerpo del robot antes de pasar la imagen a detectores de objetos externos, reduciendo falsos positivos sobre el propio robot.
- Teleoperación y realidad aumentada: superponer las máscaras segmentadas del brazo en la vista de la cámara de cabeza para interfaces de operador o depuración visual.
- Anotación asistida de datasets de robótica: el modelo genera máscaras y cajas de forma automática sobre imágenes de un AI Worker, que luego se revisan manualmente para construir datasets de segmentación.
- Control de calidad de grabaciones: detectar en vídeos de cámara de cabeza y muñeca si el brazo aparece correctamente en cuadro y sin oclusiones anómalas, usando las puntuaciones de confianza como señal.
- Integración en bucles de control en tiempo real: con inferencia en BF16 sobre una GPU de 8 GB, el modelo puede ejecutarse a la resolución de 504 px por defecto dentro de un bucle de percepción, siempre que se valide la latencia en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una evaluación sobre 1.317 imágenes de desarrollo con referencias automáticas o asistidas por IA, sin cifras de mIoU, AP ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la model card indica que se ha probado con una GPU de 8 GB en BF16.
- GPU recomendadas: cualquier GPU CUDA con soporte BF16; el autor cita una GPU de 8 GB como entorno de prueba. No se especifican modelos concretos (A100, H100, RTX 4090).
- Cabe en GPU de consumo: sí, según la prueba del autor en una GPU de 8 GB con BF16.
- Software: Python 3.12, PyTorch 2.10, CUDA 12.8, `torchvision` 0.25.0 y `huggingface_hub`.
- Opciones de despliegue: script `predict.py` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIWorker-Arm-Segmentation-v1 | no disponible | imagen 504 px por defecto | Segmentación de brazos de robot | SAM License | Hugging Face, 0 descargas |
| facebook/sam3 | no disponible | promptable, imagen | Segmentación genérica promptable | SAM License | Hugging Face (modelo base) |
| SAM 2 (Meta) | no disponible | promptable, imagen y vídeo | Segmentación de imagen y vídeo | Apache 2.0 / licencia propia según variante | Hugging Face y GitHub |
| SAM 1 (Meta) | no disponible | promptable, imagen | Segmentación genérica de imagen | Apache 2.0 | Hugging Face y GitHub |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Las partes del brazo más alejadas pueden no detectarse.
- Puede seleccionar objetos de fondo u otros robots como instancias objetivo.
- Las personas, otros robots y los objetos manipulados no son objetivos previstos; el modelo solo debe segmentar regiones objetivo visibles.
- Las referencias de evaluación son automáticas o asistidas por IA, no ground truth humano independiente, por lo que las métricas de calidad no son concluyentes.
- El modelo solo declara soporte de inglés para el prompt de texto.
- La licencia SAM License no es una licencia de código abierto permisiva; es imprescindible revisar sus términos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación externa.
- No se documentan sesgos específicos más allá de las limitaciones de dominio descritas.
- Riesgo de alucinación de máscaras: al ser un modelo de segmentación, puede generar instancias espurias sobre regiones que no corresponden al brazo, especialmente con objetos de fondo similares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dongkkka/AIWorker-Arm-Segmentation-v1
- Modelo base: https://huggingface.co/facebook/sam3
- Repositorio de SAM3 en GitHub: https://github.com/facebookresearch/sam3
