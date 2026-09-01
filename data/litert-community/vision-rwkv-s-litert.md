# litert-community/Vision-RWKV-S-LiteRT

## Resumen

Vision-RWKV-S-LiteRT es un clasificador de imágenes ImageNet-1K basado en la arquitectura Vision-RWKV (ICLR 2025), convertido por la comunidad LiteRT (sucesor de TensorFlow Lite) para ejecutar su forward pass completo en el delegado GPU de LiteRT `CompiledModel`, sin fallback a CPU. Es el primer backbone de visión estilo RWKV que corre íntegramente en GPU móvil, lo que demuestra que las arquitecturas de atención lineal (WKV bidireccional) son viables en dispositivos edge.

El modelo, con 48 MB en fp16, alcanza un 80,1% de top-1 en ImageNet-1K y está pensado como complemento de visión del modelo de lenguaje RWKV-7-World-0.1B-LiteRT. Su relevancia radica en que ofrece una alternativa eficiente a los transformers de visión clásicos para despliegue on-device, con latencias de ~28 ms en un Pixel 8a y soporte para NPU Snapdragon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VRWKV-S (bidirectional WKV linear attention, 12 bloques, dim 384, patch 16, 196 tokens) |
| Parametros totales | no disponible (48 MB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 196 tokens (fijo, imagen 224x224) |
| Tipos de cuantizacion | fp16 (tflite) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | tflite (LiteRT `CompiledModel`) |

## Arquitectura y entrenamiento

Vision-RWKV-S sustituye la atencion softmax de los transformers de vision por un escaneo de atencion lineal WKV bidireccional, la contrapartida visual del modelo de lenguaje RWKV. El token mixer original es un kernel CUDA `bi_wkv`; al ser el numero de tokens fijo (196), la conversion a LiteRT reescribe el WKV como una atencion con sesgo de decaimiento por canal: se generan C matrices de atencion [T,T] independientes, que se resuelven con un `softmax` 4D y un `matmul`, eliminando el escaneo secuencial. El modelo es post-norm, con el gamma de LayerScale horneado en los parametros afines de la norma siguiente y q-shift implementado como pad+slice+concat.

El entrenamiento original se realizo sobre ImageNet-1K (80,1% top-1), aunque la model card no detalla el numero de tokens ni el regimen de entrenamiento. La conversion a LiteRT incluye dos decisiones clave: la matriz de sesgo de decaimiento [C,T,T] se alimenta como entrada en tiempo de ejecucion (matriz de distancia de tokens) para evitar un flatbuffer de 1,5 GB, y la re-autoria del Bi-WKV es oracle-exacta (correlacion 1,0000000 con la suma bidireccional explicita).

## Capacidades

- Clasificacion de imagenes en 1000 clases de ImageNet-1K, con salida de logits [1,1000].
- Inferencia completa en GPU movil (delegado LiteRT `CompiledModel`) sin fallback a CPU.
- Soporte para NPU Snapdragon (Hexagon) con compilacion anticipada o en el dispositivo.
- Entrada de imagen 224x224 normalizada ImageNet (resize-256, center-crop-224) y matriz de distancia de tokens [1,1,196,196].
- Precision top-1 en dispositivo identica a la de escritorio fp32 (correlacion de logits 0,9989).
- No incluye generacion de texto, tool calling, ni capacidades multimodales mas alla de la clasificacion.

## Casos de uso

- Clasificacion de imagenes en tiempo real en Android: el modelo puede integrarse en una app de camara para etiquetar objetos al instante, gracias a su latencia de ~28 ms en GPU y su tamano de 48 MB.
- Moderacion de contenido en el dispositivo: permite filtrar imagenes (por ejemplo, detectar contenido inapropiado) sin enviar datos a la nube, preservando la privacidad del usuario.
- Etiquetado automatico de fotos en galerias: al ejecutarse localmente, puede asignar categorias (animal, planta, vehiculo, etc.) a miles de imagenes sin conexion.
- Asistencia para personas con discapacidad visual: combinado con un sintetizador de voz, puede describir la categoria de una escena capturada por la camara en tiempo real.
- Control de calidad en entornos industriales: clasificacion de productos o piezas en una linea de montaje usando un dispositivo movil o un modulo embebido con LiteRT.
- Investigacion en eficiencia de modelos: sirve como referencia para evaluar el rendimiento de arquitecturas de atencion lineal en hardware edge, comparandolo con transformers de vision clasicos.

## Benchmarks y rendimiento

La model card reporta el top-1 de ImageNet-1K (80,1%) y mediciones de latencia en dos dispositivos. No se incluyen comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| Top-1 ImageNet-1K | 80,1% |
| Latencia GPU Pixel 8a (LiteRT `CompiledModel`) | ~28 ms |
| Latencia GPU Pixel 8a (TFLite `TfLiteGpuDelegateV2`, OpenCL) | 283,6 ms |
| Latencia CPU Pixel 8a (XNNPACK, 4 hilos) | 402,5 ms |
| Latencia NPU Galaxy S26 (Hexagon v81) | 62,06 ms (mediana) |
| Latencia GPU Galaxy S26 (Adreno) | 66,92 ms (mediana) |

La diferencia entre las dos filas GPU en Pixel 8a se debe a que son runtimes distintos: `LITERT_CL` es la via de LiteRT `CompiledModel`, mientras que `TfLiteGpuDelegateV2` es el delegado clasico de TFLite, mas lento. En Galaxy S26, la NPU es 1,08x mas rapida que la GPU y carga el modelo 3,99x mas rapido (282 ms frente a 1124 ms).

## Requisitos de hardware

- VRAM: 48 MB de pesos en fp16; la memoria total en runtime depende de las activaciones, pero es adecuada para cualquier smartphone moderno.
- GPU recomendadas: Adreno (Qualcomm), Mali (ARM), Tensor G3 (Google); el modelo corre en el delegado GPU de LiteRT sin CPU fallback.
- NPU: compatible con Hexagon v81 (Snapdragon 8 Elite Gen 5) mediante compilacion anticipada o en el dispositivo.
- No requiere GPU de servidor; esta disenado para despliegue on-device.
- Opciones de despliegue: LiteRT `CompiledModel` (Kotlin/Python), con aceleradores GPU o NPU.
- Latencia: ~28 ms en Pixel 8a (GPU), ~62 ms en Galaxy S26 (NPU); el rendimiento varia segun el dispositivo y la temperatura.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros clasificadores on-device en la informacion proporcionada. Cualitativamente, Vision-RWKV-S-LiteRT se posiciona frente a alternativas como MobileNetV3, EfficientNet-Lite o ViT-Tiny, pero no hay datos de benchmarks comparables en la documentacion disponible. Se recomienda evaluar el modelo en el hardware objetivo antes de decidir su adopcion.

## Limitaciones y advertencias

- Es exclusivamente un clasificador de 1000 clases de ImageNet; no genera descripciones ni responde a preguntas sobre la imagen.
- Los sesgos inherentes a ImageNet (distribucion de clases, sesgos culturales y demograficos) se trasladan al modelo.
- No hay informacion sobre riesgos de alucinacion, al no ser un modelo generativo.
- El rendimiento en GPU clasica de TFLite (`TfLiteGpuDelegateV2`) es significativamente inferior al de LiteRT `CompiledModel`; usar la API de LiteRT para obtener las latencias anunciadas.
- La matriz de distancia de tokens debe proporcionarse como entrada en tiempo de ejecucion; omitirla o calcularla incorrectamente produce resultados invalidos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo original es de OpenGVLab; verificar atribucion si se redistribuye.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Vision-RWKV-S-LiteRT
- Repositorio Vision-RWKV (OpenGVLab): https://github.com/OpenGVLab/Vision-RWKV
- LiteRT (sucesor de TensorFlow Lite): https://github.com/google-ai-edge/litert
- Demo y ejemplos de LiteRT-Models: https://github.com/john-rocky/LiteRT-Models/tree/main/vrwkv
- Modelo companero RWKV-7-World-0.1B-LiteRT: https://huggingface.co/litert-community/RWKV-7-World-0.1B-LiteRT
