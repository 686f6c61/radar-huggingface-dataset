# AxiomicLabs/X3Guard-150M-ONNX

## Resumen

X3Guard-150M-ONNX es la versión cuantizada en formato ONNX de X3Guard-150M, un clasificador de 150 millones de parámetros desarrollado por AxiomicLabs cuyo propósito es actuar como guardián de prompts: detecta tanto contenido dañino como intentos adversariales de jailbreak o inyección de prompts. El modelo original se distribuye en PyTorch, y este repositorio ofrece dos artefactos ONNX (uno para CPU en fp32 y otro para GPU en fp16 con partes críticas en fp32) que se ejecutan únicamente con onnxruntime, tokenizers y numpy, sin necesidad de PyTorch.

La relevancia de esta versión reside en su rendimiento en el escenario típico de un guardián: prompts cortos y sueltos. Según la model card, en CPU es entre 2,6 y 2,9 veces más rápido que PyTorch para un prompt individual, y en GPU entre 3 y 4,6 veces más rápido para prompts cortos mediante CUDA graphs o TensorRT. Para lotes grandes o prompts largos en GPU, sin embargo, PyTorch sigue siendo más rápido.

El modelo está pensado para integraciones de moderación y seguridad en pipelines de inferencia LLM, con salida estructurada por cabezas (harmful y adversarial) y umbrales ajustables por perfil (strict, balanced, permissive). La licencia es Apache-2.0, igual que la del modelo base, y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base X3Guard-150M; la model card no detalla la arquitectura interna) |
| Parametros totales | 150M (según nombre y descripción del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (model_cpu.onnx) y fp16 con normas, recurrencia, softmax de atención y cabeza de puntuación en fp32 (model_gpu.onnx) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (onnx/model_cpu.onnx, onnx/model_gpu.onnx); modelo base en PyTorch |

## Arquitectura y entrenamiento

La model card de esta versión ONNX no describe la arquitectura interna del modelo base X3Guard-150M; se limita a indicar que es un guardián de prompts de 150M de parámetros con dos cabezas de clasificación (harmful y adversarial) y que el modelo original en PyTorch emplea kernels FLA y autocast fp16 como ruta rápida en GPU. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica documentada en este repositorio es la cuantización a ONNX con verificación de fidelidad: se comparó una muestra de 298 prompts entre el modelo original y cada cuantización, obteniendo diferencias máximas de puntuación de 2,6e-6/3,1e-6 en CPU y 1,1e-3/1,7e-3 en GPU, sin ningún cambio de veredicto en los tres perfiles de umbral. La build GPU usa CUDA graphs para prompts individuales y lotes pequeños, y TensorRT opcional para lotes grandes; la build CPU funciona con onnxruntime estándar y no requiere CUDA.

## Capacidades

- Clasificación de prompts en dos dimensiones independientes: contenido dañino (harmful) y contenido adversarial (jailbreak o prompt injection).
- Salida estructurada por prompt: `{"harmful": bool, "harm_score": float, "adversarial": bool, "adversarial_score": float}`.
- Umbrales configurables por perfil: strict (harmful 0,1 / adversarial 0,3), balanced (0,5 / 0,5) y permissive (0,7 / 0,9), además de umbral personalizado mediante `threshold=x`.
- Ejecución sin PyTorch: solo onnxruntime, tokenizers y numpy.
- Soporte de CPU y GPU NVIDIA (CUDA graphs y TensorRT).
- Procesamiento por lotes (la model card menciona lotes de 32 prompts de 256 tokens en las pruebas de velocidad).
- Idioma: únicamente inglés.

## Casos de uso

- Moderación de entrada en asistentes conversacionales: colocar X3Guard delante del LLM para filtrar prompts dañinos antes de que lleguen al modelo generativo, usando el perfil balanced por defecto y ajustando a strict en dominios sensibles.
- Detección de jailbreaks en APIs públicas: clasificar cada petición entrante con la build GPU y CUDA graphs para prompts cortos, aprovechando la latencia de 19-26 ms por prompt medida en la model card.
- Protección frente a prompt injection en pipelines RAG: verificar el texto recuperado o el prompt del usuario antes de inyectarlo en el contexto del modelo principal, con umbral adversarial bajo en perfil strict.
- Filtrado por lotes en procesos offline: usar la build CPU con onnxruntime estándar para clasificar grandes volúmenes de prompts históricos o datasets de evaluación sin depender de GPU.
- Despliegue en entornos sin PyTorch: integrar el guardián en servicios ligeros donde instalar PyTorch no es viable, ya que la build ONNX solo requiere onnxruntime, tokenizers y numpy.
- Servicio de seguridad de alto rendimiento en GPU: usar TensorRT para lotes grandes, aceptando el coste de compilación inicial de unos 60 segundos y el almacenamiento en caché del motor.
- Evaluación comparativa de políticas de moderación: ejecutar el mismo conjunto de prompts con los perfiles strict, balanced y permissive para calibrar el equilibrio entre falsos positivos y falsos negativos.

## Benchmarks y rendimiento

La model card de esta versión ONNX no publica métricas de precisión (F1, MMLU, etc.) y remite a la model card del modelo base para los F1 de referencia. Los datos de rendimiento disponibles son de velocidad y fidelidad de cuantización:

| Build | Diferencia máxima de puntuación | Cambios de veredicto (strict / balanced / permissive) |
|---|---|---|
| model_cpu.onnx, CPU | 2,6e-6 / 3,1e-6 | 0 / 0 / 0 |
| model_gpu.onnx, CUDA graphs | 1,1e-3 / 1,7e-3 | 0 / 0 / 0 |
| model_gpu.onnx, TensorRT | 1,1e-3 / 1,2e-3 | 0 / 0 / 0 |

Velocidad en CPU (Ryzen 9 4900HS), frente a PyTorch fp32:

| Configuración | 1 × 39 tokens | 1 × 1.024 tokens | 32 × 256 tokens |
|---|---|---|---|
| PyTorch | 307 ms | 5.146 ms | 26.899 ms |
| ONNX model_cpu.onnx | 106 ms (2,9×) | 1.999 ms (2,6×) | 14.647 ms (1,8×) |

Velocidad en GPU (RTX 2060 Max-Q 6 GB), frente a PyTorch con kernels FLA y autocast fp16:

| Configuración | 1 × 39 tokens | 1 × 1.024 tokens | 32 × 256 tokens |
|---|---|---|---|
| PyTorch + FLA | 88 ms | 122 ms | 381 ms |
| ONNX + TensorRT | 19 ms (4,6×) | 229 ms (0,5×) | 1.045 ms (0,4×) |
| ONNX + CUDA graphs | 26 ms (3,4×) | 271 ms (0,45×) | no disponible |

## Requisitos de hardware

- VRAM estimada: la build GPU ocupa 300 MB en disco y la CPU 582 MB; no se especifica el consumo exacto en VRAM, pero por tamaño cabe holgadamente en cualquier GPU consumer actual.
- GPU recomendadas: NVIDIA con soporte CUDA y cuDNN; las pruebas se hicieron en una RTX 2060 Max-Q de 6 GB. Para TensorRT se requiere además tensorrt-cu13 10.x.
- Cabe en GPU consumer: sí, el modelo es de 150M de parámetros y la build GPU pesa 300 MB.
- Opciones de despliegue: onnxruntime (CPU), onnxruntime-gpu con CUDA graphs, TensorRT, o bien el modelo base en PyTorch con vLLM/TGI si se prefiere esa ruta.
- Latencia medida: 106 ms por prompt de 39 tokens en CPU; 19 ms con TensorRT y 26 ms con CUDA graphs en GPU.
- Advertencia de integración: no importar torch en el mismo proceso que el runner GPU, porque torch incluye su propia cuDNN con el mismo nombre de DLL.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de modelos comparables de la misma categoría (guardianes de prompts de tamaño similar) con parámetros, contexto, rendimiento y licencia verificables. La model card únicamente compara esta build ONNX con su propio modelo base en PyTorch, que no es una alternativa externa sino la referencia de fidelidad.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| X3Guard-150M-ONNX | 150M | no disponible | apache-2.0 | ONNX |
| X3Guard-150M (base) | 150M | no disponible | apache-2.0 | PyTorch |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; los prompts en otros idiomas pueden clasificarse de forma poco fiable.
- No se publican métricas de precisión (F1) en esta model card; para evaluar falsos positivos y negativos hay que consultar la model card del modelo base.
- Los umbrales por perfil son fijos y calibrados sobre un conjunto concreto; en dominios específicos puede requerir recalibración con `threshold=x`.
- En GPU, la build ONNX es más lenta que PyTorch para prompts largos (0,5× con 1.024 tokens) y lotes grandes (0,4× con 32 × 256 tokens); para servir a alto volumen con prompts largos conviene usar el modelo PyTorch.
- La build GPU con TensorRT requiere una compilación inicial de aproximadamente un minuto antes de poder servir.
- No se puede importar torch en el mismo proceso que el runner GPU por conflicto de DLL de cuDNN.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; al ser un clasificador, el riesgo principal es de clasificación errónea, no de generación.
- La verificación de fidelidad se hizo sobre 298 prompts, incluidos prompts de CircleGuardBench; es una muestra limitada y no cubre todos los dominios.
- Licencia Apache-2.0 permite uso comercial, pero el dataset de verificación está sujeto a la White Circle Responsible Use License, lo que puede afectar a la redistribución de ese material.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AxiomicLabs/X3Guard-150M-ONNX
- Modelo base: https://huggingface.co/AxiomicLabs/X3Guard-150M
