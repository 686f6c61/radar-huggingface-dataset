# hustlabubba/altswap

## Resumen

AltSwap v1 es un modelo de intercambio de caras (face swap) desarrollado por el usuario hustlabubba y publicado en Hugging Face. Se trata de un modelo pequeño, de 42 millones de parámetros, diseñado para ejecutarse en el navegador mediante WebGPU y onnxruntime-web, y que según su autor es el motor que utiliza la vista previa web en vivo de la aplicación AltFace. El modelo opera sobre recortes de cara de 128×128 píxeles y aplica una identidad de origen codificada como un embedding de 512 dimensiones.

La relevancia del modelo radica en su enfoque de despliegue: en lugar de un pipeline pesado en servidor, AltSwap v1 está empaquetado en formato ONNX con pesos en fp16 (84 MB) y pensado para inferencia en el cliente, lo que facilita su integración en aplicaciones web interactivas. Su interfaz de tensores imita deliberadamente la de InSwapper, lo que permite sustituirlo en pipelines existentes que ya usen ese esquema de entrada y salida.

El entrenamiento se realizó exclusivamente con caras sintéticas de adultos generadas con FLUX.1 [schnell], sin fotografías de personas reales, y el autor declara que no se usaron modelos ni datos de InsightFace. La licencia es "all rights reserved", lo que restringe su uso comercial fuera de la aplicación AltFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder + bloques residuales con modulacion de identidad (AdaIN) + decoder con skips modulados |
| Parametros totales | 42 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | fp16 (pesos), entradas y salidas en fp32 |
| Idiomas soportados | no disponible |
| Licencia | all-rights-reserved (other) |
| Formato de pesos | ONNX (`altswap_v1_fp16.onnx`, 84 MB) |

## Arquitectura y entrenamiento

AltSwap v1 es una red convolucional de 42 millones de parámetros compuesta por un encoder, una serie de bloques residuales con modulación de identidad mediante AdaIN y un decoder con skips modulados. La identidad a aplicar no se inyecta como imagen sino como un embedding de 512 dimensiones, L2-normalizado, producido por AuraFace-v1 (`glintr100.onnx`). La entrada de destino es un recorte de cara de 128×128 píxeles en RGB (rango 0–1), alineado con la plantilla de 5 puntos de ArcFace escalada por 128/112. La interfaz de tensores replica la de InSwapper: `target` `[1,3,128,128]`, `source` `[1,512]` y `output` `[1,3,128,128]`.

El entrenamiento se realizó sobre aproximadamente 19.600 caras sintéticas de adultos generadas localmente con FLUX.1 [schnell] (Apache-2.0). La alineación se hizo con MediaPipe Face Landmarker (Apache-2.0) y la pérdida de identidad se calculó con AuraFace-v1 (Apache-2.0). El modelo se entrenó durante 400.000 pasos combinando pérdidas de identidad, reconstrucción, feature-matching del discriminador y adversarias. El autor afirma explícitamente que no se emplearon modelos ni datos de InsightFace para entrenarlo.

## Capacidades

- Intercambio de caras sobre recortes alineados de 128×128 píxeles, con salida en el mismo espacio de color y resolución.
- Transferencia de identidad a partir de un embedding de 512 dimensiones de AuraFace-v1, no de una imagen de origen directa.
- Inferencia en navegador mediante WebGPU y onnxruntime-web, con un rendimiento declarado de aproximadamente 25 FPS en una RTX 3090.
- Compatibilidad a nivel de interfaz con pipelines que esperen el esquema de tensores de InSwapper.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general ni audio: es un modelo de visión específico para una única tarea.
- Capacidades multilingües: no aplicable.

## Casos de uso

- Vista previa interactiva en web: integración en una aplicación de navegador que use WebGPU y onnxruntime-web para mostrar el resultado del intercambio de caras en tiempo real, aprovechando los ~25 FPS declarados en una RTX 3090.
- Sustitución directa en pipelines InSwapper: al mantener los mismos nombres y formas de tensor (`target`, `source`, `output`), puede reemplazar a InSwapper en un flujo existente sin reescribir la capa de preprocesado ni la de postprocesado.
- Prototipado de filtros de identidad: uso en demos y pruebas de concepto de efectos faciales sobre caras sintéticas, dado que el modelo se entrenó solo con datos generados y no con fotos reales.
- Investigación sobre transferencia de identidad: comparación de jueces de identidad (ArcFace frente a AuraFace) usando el modelo como caso de estudio de cómo el juez de entrenamiento condiciona las métricas de evaluación.
- Aplicaciones de edición de avatar: generación de variantes de identidad sobre recortes faciales en herramientas de creación de avatares, siempre que se respete la licencia.
- Despliegue en el cliente sin servidor: al pesar 84 MB en fp16 y ejecutarse en ONNX Runtime Web, permite evitar el envío de recortes faciales a un backend, reduciendo la exposición de datos en tránsito.

## Benchmarks y rendimiento

Evaluación sobre 32 pares sintéticos reservados (held-out), según la model card:

| Juez | Sin swap | InSwapper | AltSwap v1 |
|---|---|---|---|
| ArcFace w600k_r50, coseno con la fuente | 0,19 | 0,80 | 0,48 |
| AuraFace, coseno con la fuente | 0,20 | 0,66 | 0,85 |

El autor señala que cada modelo obtiene mejores resultados con el juez con el que fue entrenado: AltSwap v1 transfiere la identidad con menos fuerza que InSwapper según el juez independiente ArcFace (0,48 frente a 0,80), mientras que con AuraFace supera a InSwapper (0,85 frente a 0,66). No se han publicado otros resultados de benchmarks (FID, SSIM, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo pesa 84 MB en fp16 y opera sobre tensores de 128×128, por lo que cabe holgadamente en cualquier GPU con unos pocos cientos de MB libres.
- GPU recomendadas: el autor reporta ~25 FPS en una RTX 3090; no se han publicado cifras para A100, H100 u otras GPU.
- Cabe en GPU de consumo: sí, por tamaño; no se especifican modelos concretos más allá de la RTX 3090 citada.
- Opciones de despliegue: onnxruntime-web con WebGPU (entorno objetivo declarado); también es desplegable con ONNX Runtime nativo, aunque no se documentan otros backends.
- Latencia y throughput: ~25 FPS en RTX 3090 según el autor; sin datos para otros hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrada | Identidad | Licencia | Formato |
|---|---|---|---|---|---|
| AltSwap v1 | 42 M | 128×128 | Embedding AuraFace-v1 (512) | all-rights-reserved | ONNX (fp16) |
| InSwapper | no disponible | 128×128 (misma interfaz) | Embedding de 512 dimensiones | no disponible en la información | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con un tercer modelo de la misma categoría.

## Limitaciones y advertencias

- La transferencia de identidad es más débil que la de InSwapper según el juez independiente ArcFace (0,48 frente a 0,80), lo que puede producir swaps menos fieles en evaluaciones externas.
- El modelo se entrenó únicamente con caras sintéticas generadas por FLUX.1 [schnell]; su comportamiento sobre fotografías reales no está evaluado en la información disponible.
- La evaluación se realizó sobre solo 32 pares sintéticos reservados, una muestra reducida.
- Licencia "all rights reserved": el uso comercial o fuera de la aplicación AltFace requiere contactar con el propietario del repositorio; no es apta para producción sin autorización expresa.
- Riesgo de uso indebido: la propia model card advierte de no emplearlo para suplantar, engañar o acosar, ni para generar imágenes sexuales o íntimas de personas reales; solo debe usarse con caras propias o con permiso.
- El repositorio no registra descargas ni likes y no tiene pipeline declarado; se desconoce su mantenimiento y soporte.
- No se documentan sesgos concretos ni limitaciones idiomáticas, al no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hustlabubba/altswap
- AuraFace-v1 (modelo de identidad usado): https://huggingface.co/fal/AuraFace-v1
- FLUX.1 [schnell] (generador de datos de entrenamiento): no se proporciona enlace en la información disponible
- MediaPipe Face Landmarker: no se proporciona enlace en la información disponible
- Repositorio o demo de AltFace: no disponible
