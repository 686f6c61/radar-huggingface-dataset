# anudit/BiRefNet_lite-2K-ONNX

## Resumen

BiRefNet_lite-2K-ONNX es una exportación a formato ONNX del modelo ZhengPeng7/BiRefNet_lite-2K, un modelo de segmentación dicotómica de imágenes orientado a la eliminación de fondos (background removal). Lo publica el usuario anudit como artefacto derivado, cuantizado en fp16 y con un grafo rediseñado para reducir el consumo de memoria de activaciones, con el objetivo explícito de permitir inferencia dentro de un navegador mediante WebGPU a través de la librería `birefnet-webgpu`.

El modelo base emplea una arquitectura BiRefNet (segmentación de referencia bilateral) con backbone Swin-T y 44 millones de parámetros, entrenado para resoluciones de 2560×1440. La exportación mantiene la misma función matemática que el modelo PyTorch original, pero sustituye cadenas de operaciones costosas por operadores ONNX nativos y colapsa algebraicamente partes del decodificador, logrando un pico de activaciones vivas de aproximadamente 0,45 GB a 2560×1472 frente a los ~11 GB de una exportación ingenua.

Su relevancia actual radica en que habilita segmentación de alta resolución en el cliente (navegador) sin backend, con un único fichero ONNX de unos 91 MB y licencia MIT. Está pensado para desarrolladores que necesitan recortar fondos de imágenes con calidad de modelo grande pero sin infraestructura de servidor GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación de referencia bilateral) con backbone Swin-T |
| Parametros totales | 44 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | fp16 (pesos), I/O en fp32 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_fp16.onnx`, ~91 MB) |

## Arquitectura y entrenamiento

El modelo base BiRefNet es una red de segmentación de imagen completa que combina un backbone Swin Transformer de tamaño Tiny con un decodificador multi-escala. La variante lite-2K está entrenada para entradas de 2560×1440 y produce una máscara de un solo canal (logits a los que se aplica sigmoid) para segmentación dicotómica primer plano/fondo. El entrenamiento del modelo original se realizó sobre el conjunto DIS5K, según indica la propia model card al remitir a los términos de datos del repositorio upstream.

La exportación ONNX introduce varias transformaciones técnicas destacables: las convoluciones deformables se representan con el operador estándar `DeformConv` (opset 19+); la concatenación de cinco ramas ASPP (1280 canales) seguida de una convolución 1×1 se reescribe como suma de cinco convoluciones 1×1; la cola del decodificador a resolución completa se colapsa algebraicamente en una convolución 1×1 a baja resolución más una convolución 5×5 sobre la imagen de entrada, con la respuesta de sesgo construida exactamente mediante una convolución monocanal sobre una imagen de unos; y GELU se exporta como operador `Gelu` (opset 20). La entrada `input_image` tiene forma `[1,3,H,W]` con normalización ImageNet, y H y W son dinámicos pero deben ser múltiplos de 64. La fidelidad declarada es de IoU ≥ 0,999997 para el grafo fp32 y 0,9995 para el grafo fp16 a 2560×1440 en CPU con onnxruntime. El único error introducido es un anillo exterior de ~1 px por interacción del zero-padding con las convoluciones plegadas (diferencia máxima de logit ≈ 0,64 en ese anillo, ≤ 7e-3 en el resto).

## Capacidades

- Segmentación dicotómica de imágenes (primer plano/fondo) con salida de máscara a la misma resolución que la entrada.
- Eliminación de fondos de alta resolución, con soporte de tamaños de entrada dinámicos múltiplos de 64.
- Inferencia en navegador mediante WebGPU (motor `birefnet-webgpu`) y en CPU mediante onnxruntime.
- Procesamiento por lotes de tamaño 1 (forma de entrada `[1,3,H,W]`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües ni de modo thinking, visión general o audio: es exclusivamente un modelo de segmentación de imagen.

## Casos de uso

- Eliminación de fondos en el navegador: el modelo puede ejecutarse íntegramente en el cliente con WebGPU, sin enviar imágenes a un servidor, usando el fichero ONNX de 91 MB y bucketing del lado largo a 512, 1024, 1536, 2048 o 2560 píxeles manteniendo la relación de aspecto.
- Herramientas de edición fotográfica web: integración en editores que necesitan recortes de sujeto de alta calidad a resoluciones de hasta 2560×1440 sin infraestructura GPU propia.
- Procesamiento por lotes en servidor con onnxruntime: dado el bajo pico de activaciones (~0,45 GB a 2560×1472), permite procesar imágenes grandes en máquinas con VRAM o RAM limitadas frente a una exportación ONNX convencional.
- Generación de máscaras para pipelines de composición y diseño gráfico: la salida de logits por píxel permite aplicar sigmoid y ajustar el umbral para controlar la agresividad del recorte.
- Preprocesado para otros modelos de visión: la máscara dicotómica puede usarse para aislar sujetos antes de tareas posteriores de clasificación, detección o generación.
- Aplicaciones de privacidad en el cliente: al ejecutarse localmente en el navegador, evita la subida de fotografías personales a servicios externos, lo que resulta adecuado para herramientas de consumo con requisitos de privacidad.
- Prototipado rápido de segmentación: al ser un único fichero ONNX con entradas dinámicas y licencia MIT, facilita la experimentación en entornos de investigación sin dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta métricas de fidelidad de la exportación respecto al modelo PyTorch original:

| Metrica | Valor |
|---|---|
| IoU grafo fp32 vs PyTorch (512², 640×960, 1024², 1536×1024, 1472×2560) | ≥ 0,999997 |
| IoU grafo fp16 vs PyTorch (2560×1440, ORT CPU) | 0,9995 |
| Pico de activaciones vivas a 2560×1472 | ~0,45 GB |
| Memoria GPU asignada en motor WebGPU a 2560×1472 | ~1,1 GB |
| Diferencia máxima de logit en anillo exterior de ~1 px | ≈ 0,64 |
| Diferencia máxima de logit fuera del anillo | ≤ 7e-3 |

## Requisitos de hardware

- VRAM estimada: ~1,1 GB de memoria GPU asignada en el motor WebGPU a 2560×1472; mucho menos a resoluciones menores (el bucket mínimo es 512 en el lado largo).
- Memoria de activaciones: ~0,45 GB de pico vivo a 2560×1472, frente a ~11 GB de una exportación ONNX ingenua.
- GPU recomendadas: cualquier GPU compatible con WebGPU para inferencia en navegador; en servidor, CPU con onnxruntime es suficiente para las pruebas reportadas (el autor verificó fp16 en CPU con ORT).
- Cabe en GPU de consumo: sí, dado el reducido consumo de memoria; no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: onnxruntime (CPU verificado) y el motor `birefnet-webgpu` sobre WebGPU. Requiere un runtime que implemente los operadores `DeformConv` (opset 19+) y `Gelu` (opset 20).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion de entrenamiento | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| anudit/BiRefNet_lite-2K-ONNX | 44 M | 2560×1440 | ONNX fp16 | MIT | Sí (WebGPU) |
| ZhengPeng7/BiRefNet_lite-2K | 44 M | 2560×1440 | PyTorch | MIT | No documentado |
| BiRefNet (variante completa) | no disponible | no disponible | PyTorch | MIT | No documentado |

La comparación se limita a las variantes del propio BiRefNet presentes en la información disponible; no se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de segmentación para una comparativa cuantitativa.

## Limitaciones y advertencias

- La entrada debe tener altura y anchura múltiplos de 64; otras dimensiones provocan error por el patch merging de Swin y la ruta multi-escala a media resolución.
- La salida son logits; es necesario aplicar sigmoid para obtener la máscara de probabilidad.
- Existe un artefacto acotado en un anillo exterior de ~1 px por la interacción del zero-padding con las convoluciones plegadas, con diferencia máxima de logit ≈ 0,64 en esa franja.
- El grafo requiere runtimes con soporte de `DeformConv` (opset 19+) y `Gelu` (opset 20); no funciona en runtimes ONNX antiguos o incompletos.
- El modelo base se entrenó sobre DIS5K; la model card remite a los términos de datos del repositorio upstream antes de un uso comercial, pese a la licencia MIT de pesos y arquitectura.
- No se documentan sesgos específicos ni tasas de alucinación (no aplica al ser un modelo de segmentación), pero no hay evaluación independiente de sesgos en la información disponible.
- No hay datos publicados de latencia ni throughput, por lo que el rendimiento en producción debe medirse en el hardware objetivo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anudit/BiRefNet_lite-2K-ONNX
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite-2K
- Repositorio del motor WebGPU: https://github.com/anudit/birefnet-webgpu
- Repositorio oficial de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
