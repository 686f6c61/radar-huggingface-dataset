# masterofaudio2077/Ageis-image-safety-classifier-dinov3-onnx-int8

## Resumen

Ageis ONNX INT8 es la versión cuantizada del clasificador binario de seguridad de imágenes Ageis, construido sobre un fine-tune parcial de DINOv3 ViT-H+/16. El modelo devuelve la probabilidad de que una imagen incumpla una política de seguridad, lo que lo convierte en un componente de tipo guardrail para pipelines de moderación de contenido. Esta variante concreta emplea cuantización dinámica INT8 en el backbone (operaciones `MatMul`) manteniendo la cabeza clasificadora en FP32, y se distribuye en formato ONNX (IR 11, opset 23) para ejecución con ONNX Runtime.

La relevancia de esta versión radica en el ahorro de espacio y en la posibilidad de ejecución en CPU: el archivo `model.onnx` ocupa 847.353.583 bytes (~808 MiB) frente a los 1.681.262.366 bytes (~1,57 GiB) del modelo base en BF16. El preprocesado (normalización por 255 y aplicación de media/desviación típica del modelo) está integrado en el propio grafo, de modo que la única entrada es un tensor RGB en bruto de tipo `float32` con rango 0–255 y forma `[B,3,224,224]`.

El autor es `masterofaudio2077` y el modelo se publica bajo la licencia DINOv3 de Meta, heredada del backbone. No es un clasificador de imágenes de propósito general: está especializado en clasificación de seguridad y su uso previsto incluye revisión humana en decisiones de alto impacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-H+/16 (transformer de visión) con cabeza lineal sobre concatenación de token CLS y media de tokens de parche |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagen, entrada 224x224) |
| Tipos de cuantizacion | INT8 dinámica per-tensor en `MatMul` del backbone; cabeza `Gemm` en FP32 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | dinov3-license (DINOv3 License de Meta) |
| Formato de pesos | ONNX (IR 11, opset 23) |

## Arquitectura y entrenamiento

El modelo base Ageis es un fine-tune parcial de DINOv3 ViT-H+/16 con una cabeza lineal que opera sobre la concatenación del token CLS y el token medio de parches. Esta variante aplica cuantización dinámica post-entrenamiento (PTQ) sobre las operaciones `MatMul` del backbone con pesos `QInt8` per-tensor, sin calibración (data-free). La cabeza clasificadora final (`/m/head/Gemm`) se mantiene en FP32 porque, según el autor, cuantizarla degradaba de forma medible el AUC y la tasa de falsos positivos en la cola de la distribución. Se probó cuantización dinámica per-channel, pero produjo salidas inválidas con ONNX Runtime 1.31.1 (puntuaciones colapsadas cerca de cero), por lo que se optó por per-tensor.

No se realizó entrenamiento ni QAT: es exclusivamente cuantización post-entrenamiento. El grafo ONNX incorpora el preprocesado (división por 255 y normalización con media/desviación del modelo) y expone una única salida `prob` de tipo `float32 [B,1]` con probabilidad sigmoide. El lote es dinámico.

## Capacidades

- Clasificación binaria de seguridad de imágenes: devuelve la probabilidad de que una imagen viole una política de seguridad.
- Moderación de contenido como guardrail en pipelines de visión.
- Ejecución en CPU mediante ONNX Runtime (`CPUExecutionProvider`).
- Procesamiento por lotes con dimensión de batch dinámica.
- Preprocesado integrado en el grafo (redimensionado no incluido; normalización sí).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de imagen puro.

## Casos de uso

- Moderación de contenido en plataformas de imágenes: el modelo puntúa cada imagen con una probabilidad de incumplimiento y permite aplicar umbrales calibrados (por ejemplo, `0.8443` para 95 % de recall en INT8) antes de derivar a revisión humana.
- Filtrado previo en pipelines de subida de contenido: al ejecutarse en CPU con ONNX Runtime, puede desplegarse como paso de precribado en servidores sin GPU antes de un clasificador o revisor más costoso.
- Guardrail en sistemas generativos de imagen: verificación de salidas antes de su publicación, usando la probabilidad sigmoide como señal de bloqueo o marcado.
- Automatización de colas de revisión: priorización de imágenes por puntuación para que los moderadores humanos atiendan primero las de mayor riesgo.
- Despliegue en entornos con recursos limitados: el tamaño de ~808 MiB y la ejecución en CPU permiten integrarlo en contenedores sin acelerador dedicado.
- Investigación en seguridad de modelos de visión: evaluación de la degradación introducida por cuantización INT8 dinámica sobre métricas de cola (FPR a alto recall).

## Benchmarks y rendimiento

La evaluación de paridad se realizó sobre un subconjunto estratificado determinista de 2.000 imágenes (400 de cada una de cinco fuentes: tres de contenido inseguro y dos limpias), comparando las puntuaciones INT8 con las de referencia BF16 del modelo base para las mismas imágenes.

| Metrica | BF16 referencia | ONNX INT8 | Delta |
|---|---:|---:|---:|
| ROC-AUC | 0,999336 | 0,998909 | -0,000427 |
| PR-AUC | 0,999568 | 0,999294 | -0,000274 |
| FPR @ 95 % recall | 0,1250 % | 0,5000 % | +0,3750 pp |
| FPR @ 99 % recall | 1,5000 % | 1,8750 % | +0,3750 pp |
| MAE de puntuación | — | 0,015926 | — |
| Correlación de puntuación | — | 0,990581 | — |

El benchmark completo del modelo base (100.683 imágenes) reporta ROC-AUC 0,999615, FPR@95 0,0237 % y FPR@99 0,3709 %. El autor advierte que las cifras del subconjunto son solo para verificación de paridad y que, con 800 negativos, FPR@95 corresponde a 1–4 imágenes, por lo que las diferencias en la cola deben interpretarse como aproximadas.

Umbrales específicos para INT8:

| Recall objetivo | Umbral BF16 | Umbral INT8 |
|---|---:|---:|
| 95 % | 0,9959 | 0,8443 |
| 99 % | 0,7892 | 0,2324 |

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; el archivo ONNX ocupa ~808 MiB. En GPU, el consumo de memoria sería del orden del tamaño del modelo más activaciones, pero no se proporcionan cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- CPU: el autor reporta ~0,5 img/s en un entorno Kaggle de 4 vCPU con batch 8 y cuatro hilos; CPUs de servidor o GPU serán más rápidas.
- Cabe en GPU de consumo: no se aportan datos específicos; por tamaño (~808 MiB) es plausible en GPUs de consumo, pero no está verificado en la información disponible.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider` (verificado); otros proveedores de ejecución de ONNX Runtime no documentados.
- Latencia y throughput: ~0,5 img/s en el entorno de prueba descrito; el resto, no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Ageis ONNX INT8 (este) | no disponible | no aplica | ONNX INT8 | dinov3-license | ROC-AUC 0,998909 (subconjunto 2k) |
| Ageis BF16 (base) | no disponible | no aplica | BF16 | dinov3-license | ROC-AUC 0,999336 (subconjunto 2k); 0,999615 (benchmark completo) |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros clasificadores de seguridad de imágenes comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización dinámica INT8 desplaza la distribución de puntuaciones: es necesario usar los umbrales específicos de INT8 o recalibrar sobre datos propios.
- Es cuantización post-entrenamiento, no QAT; no hubo reentrenamiento.
- El modelo base está especializado en clasificación de seguridad y no es un clasificador de imágenes de propósito general.
- Para decisiones de alto impacto debe mantenerse revisión humana.
- El rendimiento en CPU es limitado (~0,5 img/s en el entorno de prueba con batch 8 y cuatro hilos).
- La evaluación de paridad se hizo sobre un subconjunto de 2.000 imágenes, no sobre el benchmark completo; las métricas de cola (FPR a alto recall) son aproximadas.
- La licencia DINOv3 impone sus propios términos de uso; debe revisarse antes de uso comercial.
- No se documentan sesgos específicos, riesgos de alucinación (no aplica a un clasificador) ni cobertura idiomática.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/Ageis-image-safety-classifier-dinov3-onnx-int8
- Modelo base: https://huggingface.co/masterofaudio2077/Ageis-image-safety-classifier-dinov3
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
