# AbrahamPJ/nightmare-ip-adapter

## Resumen

`AbrahamPJ/nightmare-ip-adapter` no es un modelo de lenguaje ni un modelo de difusión completo: es la conversión a ONNX de IP-Adapter Plus para Stable Diffusion 1.5, empaquetada para ejecutarse en la CPU de un teléfono Android. Forma parte del proyecto Nightmare Mobile, una aplicación de generación de imágenes en el dispositivo con interfaz tipo ComfyUI. La conversión está pensada para el formato SD 1.5 Swap v2, un UNet que se ejecuta en la NPU de Snapdragon y que recibe como entradas las K y V de cada capa de cross-attention en lugar de calcularlas internamente.

El repositorio contiene tres ficheros ONNX: un codificador de imagen CLIP ViT-H/14 (OpenCLIP, laion2B) truncado a 31 de sus 32 capas, y dos cabezas IP-Adapter (Plus y Plus Face) que incluyen el Resampler de 16 tokens y las proyecciones `to_k_ip` / `to_v_ip` de cada capa. El flujo es: imagen de referencia, codificador CLIP, cabeza IP-Adapter y salida de 16 pares de tensores K/V (`ipk_0..15`, `ipv_0..15`) listos para inyectar en el UNet. Los pesos se cuantizan a int16 por canal de salida en el codificador y a int8 por canal en las cabezas, con cómputo en fp32 mediante `DequantizeLinear`.

Su relevancia es de nicho pero concreta: permite usar prompts de imagen (image prompting) en generación de difusión completamente offline y sin GPU, delegando la parte pesada al acelerador neuronal del móvil y dejando en CPU solo la codificación de la imagen de referencia, que se ejecuta una vez por imagen. El repositorio es de septiembre de 2026, tiene 0 descargas y 0 likes, y está publicado bajo licencia Apache-2.0 sin reentrenamiento alguno: son pesos convertidos y cuantizados a partir de `h94/IP-Adapter`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo generativo completo: codificador de imagen CLIP ViT-H/14 (OpenCLIP, truncado a 31 de 32 capas, se usa el penúltimo estado oculto) más cabeza IP-Adapter Plus (Resampler de 16 tokens y proyecciones `to_k_ip` / `to_v_ip` por capa). Todo exportado a ONNX |
| Parametros totales | no disponible (el repositorio ocupa 1,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el adaptador produce 16 tokens de imagen por capa de cross-attention en 16 capas (`i = 0..15`) |
| Tipos de cuantizacion | int16 por canal de salida en el codificador (`clip_vit_h_w16qdq.onnx`, variante publicada); int8 por canal de salida en las cabezas (`ip_plus_head_w8qdq.onnx`, `ip_face_head_w8qdq.onnx`). Variantes medidas pero no publicadas: int8 por bloque de 64 (0,63 GB), int8 por canal (0,59 GB) e int8 dinámico con activaciones (0,59 GB). Cómputo en fp32 tras `DequantizeLinear` (opset 21) |
| Idiomas soportados | no disponible / no aplica: este repositorio no incluye codificador de texto (el prompt de texto lo gestiona el pipeline de difusión) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 21), pensado para ONNX Runtime |
| Entradas / salidas | Encoder: `pixels` [1,3,224,224] normalizado según CLIP y recortado al centro, salida `hidden` [1,257,1280]. Cabeza: `hidden` como entrada, salidas `ipk_i` [1,inner,16] e `ipv_i` [1,16,inner] para `i = 0..15`, en el orden de entrada del UNet Swap v2 (down_blocks, up_blocks, mid_block). La V sale a escala 1 y la aplicación la multiplica por la fuerza del IP-Adapter |
| Tamaño de los ficheros | `clip_vit_h_w16qdq.onnx`: 1,17 GB; cabezas int8: incluidas en el total del repo (1,3 GB) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-29 (actualizado el mismo día) |

## Arquitectura y entrenamiento

No hay entrenamiento. El repositorio es una conversión y cuantización de pesos preexistentes: el codificador de imagen proviene del subdirectorio `models/image_encoder` de `h94/IP-Adapter` (OpenCLIP ViT-H-14 entrenado con laion2B, licencia MIT) y las cabezas provienen de `models/ip-adapter-plus_sd15.safetensors` y `models/ip-adapter-plus-face_sd15.safetensors` (Tencent AI Lab, Apache-2.0). La model card indica explícitamente "Converted to ONNX and quantized; no retraining".

La innovación técnica no está en el modelo sino en el reparto de trabajo entre NPU y CPU. El UNet en formato Swap v2 se ejecuta en la NPU del Snapdragon y espera recibir las K y V de atención cruzada ya calculadas; este paquete produce esos tensores en CPU una sola vez por imagen, mediante la cadena `imagen → clip_vit_h (penúltimo estado oculto) → ip_<adapter>_head → ipk_0..15, ipv_0..15`. El codificador CLIP se trunca a 31 de 32 capas porque IP-Adapter Plus solo consume el penúltimo estado oculto, lo que ahorra cómputo. En cuanto a la cuantización, el autor documenta que los valores atípicos de activación de ViT-H rompen la cuantización int8 en la variante Plus, cuyo Resampler amplifica errores pequeños; por eso el codificador se publica en int16 por canal, y también se descartó la variante fp16 con `Cast` porque ONNX Runtime expandía todos los pesos por adelantado y elevaba el pico de memoria de 1,4 GB a 3,3 GB. El lado incondicional (unconditional) se obtiene ejecutando la misma cabeza sobre un tensor de píxeles todo ceros.

## Capacidades

- Conversión de una imagen de referencia en las K/V de atención cruzada que necesita un UNet SD 1.5 Swap v2, en el orden exacto de sus 16 capas.
- Soporte de dos variantes de adaptador: IP-Adapter Plus (`ip_plus_head_w8qdq.onnx`) e IP-Adapter Plus Face (`ip_face_head_w8qdq.onnx`), la segunda orientada a preservar identidad facial en retratos.
- Codificación de imágenes con CLIP ViT-H/14 (OpenCLIP laion2B) a 224x224 píxeles, normalización CLIP y recorte central, con salida de 257 tokens de 1280 dimensiones.
- Ejecución íntegra en CPU mediante ONNX Runtime (opset 21), sin necesidad de GPU ni de runtime de PyTorch.
- Flujo incondicional soportado mediante la misma cabeza aplicada a un tensor de ceros.
- Ajuste de la influencia del prompt de imagen en tiempo de inferencia: la V se entrega a escala 1 y la aplicación la multiplica por la fuerza configurada.
- Generación de texto, razonamiento, código, matemáticas, tool calling, function calling, uso de agentes, modo de pensamiento, visión descriptiva y audio: no disponibles, no aplica (no es un modelo de lenguaje ni un modelo multimodal de propósito general).
- Capacidades multilingües: no aplica; el componente de texto no está incluido en este repositorio.

## Casos de uso

- Generación de imágenes con prompt de imagen en el propio teléfono: la app toma una foto de la galería, la pasa por el codificador CLIP y la cabeza IP-Adapter, y condiciona el UNet que corre en la NPU. Es el escenario para el que se diseñó el paquete y no requiere conexión a red.
- Retratos y avatares con preservación de identidad: usando `ip_face_head_w8qdq.onnx` se puede condicionar la generación con una o varias fotos de una persona para mantener rasgos faciales reconocibles, sin subir las imágenes a un servidor.
- Aplicaciones de privacidad estricta: al ejecutarse todo en el dispositivo, la imagen de referencia nunca sale del terminal, lo que encaja en contextos sanitarios, legales o de menores donde enviar fotos a una API externa es inviable.
- Transferencia de estilo y variaciones de producto: una única imagen de referencia (una prenda, un objeto, una paleta) condiciona la generación de variaciones controladas por prompt de texto, útil en catálogos o prototipado de diseño.
- Integración en pipelines tipo ComfyUI en el dispositivo: Nightmare Mobile expone nodos, y este adaptador se puede encadenar detrás de un nodo de carga de imagen y delante del nodo del UNet Swap v2.
- Inferencia en servidores sin GPU: al ser ONNX con cómputo fp32, el paquete puede ejecutarse en cualquier máquina con ONNX Runtime, lo que sirve para validar el pipeline de difusión en CI antes de desplegarlo en el móvil.
- Análisis del impacto de la cuantización en adaptadores de difusión: la tabla de precisión incluida en el repositorio permite comparar int16 por canal, int8 por bloque de 64, int8 por canal e int8 dinámico sobre la misma salida, lo que resulta útil como caso de estudio reproducible.
- Portado a otros aceleradores: el proyecto `npuforge` convierte checkpoints al formato SD1.5 Swap, de modo que este adaptador sirve de referencia para reproducir el esquema NPU (UNet) más CPU (encoder y adaptador) en otros SoC.

## Benchmarks y rendimiento

El autor publica una única métrica de fidelidad: el peor coseno de cualquier tensor K/V de salida frente a la ruta fp32, medido sobre 12 imágenes de referencia más la imagen de ceros (`check.json`). No hay datos de FID, CLIP-score, MMLU ni ningún benchmark de calidad de imagen.

| Pesos del encoder | Plus (peor coseno) | Face (peor coseno) | Tamaño del fichero |
|---|---|---|---|
| int16 por canal (publicado) | 0,99999995 | 0,99999991 | 1,17 GB |
| int8 por bloque de 64 | 0,9925 | 0,9999 | 0,63 GB |
| int8 por canal | 0,991 | 0,9987 | 0,59 GB |
| int8 dinámico (también activaciones) | 0,838 | 0,976 | 0,59 GB |

Las cabezas, cuantizadas a int8, alcanzan un peor coseno de 0,99964 (Plus) y 0,99991 (Face). El pico de RSS ejecutando el encoder int16 es de aproximadamente 1,4 GB; la variante fp16 con `Cast` resultó igual de exacta pero ONNX Runtime expandía todos los pesos por adelantado y elevaba el pico a 3,3 GB. No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP-score) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el diseño es de inferencia en CPU. El consumo relevante es memoria RAM del proceso: pico de RSS de ~1,4 GB con el encoder int16 publicado.
- Alternativas de menor huella: las variantes int8 del encoder bajan a 0,63 GB (por bloque de 64) o 0,59 GB (por canal o dinámico), a costa de perder fidelidad, especialmente en la variante Plus.
- GPU recomendadas: no aplica para el caso de uso previsto. Para pruebas en escritorio basta cualquier CPU x86-64 o ARM64 con ONNX Runtime; el cómputo se declara en fp32.
- ¿Cabe en GPU de consumo? Irrelevante, pero por tamaño cualquier GPU con 2 GB libres podría alojarlo si se ejecuta con un proveedor CUDA o DirectML de ONNX Runtime; no hay datos publicados de ese escenario.
- Despliegue: ONNX Runtime (opset 21) y onnxruntime para Android, dentro de la aplicación Nightmare Mobile. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Encaje en móvil: requiere un terminal Android con al menos ~1,5 GB libres para el proceso si se usa el encoder int16, además de la memoria que consuma el UNet en la NPU.
- Latencia y throughput: no disponibles. La model card solo indica que el adaptador se ejecuta una vez por imagen, frente a las múltiples pasos del bucle de difusión que corren en la NPU.

## Comparativa con modelos similares

| Modelo | Qué es | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `AbrahamPJ/nightmare-ip-adapter` | IP-Adapter Plus y Plus Face para SD 1.5 + encoder CLIP ViT-H/14, optimizado para CPU de móvil | ONNX (opset 21) | int16 por canal (encoder) e int8 por canal (cabezas) | Apache-2.0 | HuggingFace, 0 descargas |
| `h94/IP-Adapter` (`ip-adapter-plus_sd15`, `ip-adapter-plus-face_sd15`) | Pesos originales de IP-Adapter Plus y Plus Face para SD 1.5, en PyTorch | safetensors / bin | fp32 (sin cuantizar) | Apache-2.0 | HuggingFace, ampliamente utilizado |
| `h94/IP-Adapter` (`models/image_encoder`) | Codificador OpenCLIP ViT-H-14 laion2B completo (32 capas) | PyTorch | fp32 | MIT | HuggingFace |
| IP-Adapter para SDXL / SD3 | Variantes oficiales para modelos base más grandes | safetensors | fp32 | Apache-2.0 | HuggingFace |

Número de parámetros y cifras de rendimiento de las alternativas: no disponibles en la información proporcionada. La diferencia funcional clave frente a los pesos originales es el empaquetado para ONNX Runtime, la cuantización con pérdida medida y el truncado del encoder a 31 capas; a cambio, este repositorio queda atado al esquema Swap v2 y no se puede usar directamente con el pipeline estándar de Diffusers sin volver a convertir.

## Limitaciones y advertencias

- Solo es compatible con Stable Diffusion 1.5 en el formato SD 1.5 Swap v2 generado por `npuforge`. No sirve para SDXL, SD3 ni para UNets SD 1.5 convencionales sin reconversión.
- El orden de las 16 capas de salida está fijado al orden de entrada del UNet Swap v2 (down_blocks, up_blocks, mid_block); un UNet con otra topología producirá resultados incorrectos sin reasignar las salidas.
- La variante publicada del encoder pesa 1,17 GB y exige ~1,4 GB de pico de RSS. En móviles con poca memoria libre el proceso puede ser terminado por el sistema; las alternativas int8 reducen el tamaño pero degradan la fidelidad, y en Plus la variante int8 dinámica cae hasta un coseno de 0,838.
- La cuantización es agresiva y no hay evaluación de calidad perceptual (FID, CLIP-score) que cuantifique el impacto real en la imagen generada; solo se mide similitud de tensores frente a fp32.
- No incluye el codificador de texto, el UNet ni el VAE: es una pieza de un pipeline y no funciona de forma autónoma.
- Herencia de sesgos: la cadena de imagen procede de OpenCLIP ViT-H-14 entrenado con laion2B, un dataset web a gran escala conocido por contener sesgos demográficos y estereotipos; esos sesgos pueden reflejarse en el condicionamiento resultante.
- En modelos de difusión el fallo típico no es la alucinación textual sino la deriva semántica: el prompt de imagen puede imponer contenido no deseado sobre el prompt de texto, y la fuerza del adaptador (factor que aplica la app sobre la V) es el principal parámetro de compromiso.
- Licencia: Apache-2.0 para los pesos de IP-Adapter (Tencent AI Lab) y MIT para el encoder OpenCLIP. La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de difusión que se use junto al adaptador, ya que este repositorio no las cubre.
- Repositorio con 0 descargas y 0 likes, mantenido por un único autor: no hay validación independiente ni garantía de mantenimiento, y la fecha de publicación es muy reciente.
- No se proporcionan datos de latencia, consumo energético ni rendimiento en dispositivos concretos, lo que dificulta estimar el comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbrahamPJ/nightmare-ip-adapter
- Perfil del autor: https://huggingface.co/AbrahamPJ
- Aplicación Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
- Herramienta de conversión npuforge: https://github.com/AbrahamPaulJ/npuforge
- Pesos originales de IP-Adapter: https://huggingface.co/h94/IP-Adapter
- Documentación de IP-Adapter en Diffusers: https://huggingface.co/docs/diffusers/using-diffusers/ip_adapter
- Repositorio de referencia AI-IP-Adapter: https://github.com/absalan/AI-IP-Adapter
- Paper de IP-Adapter (Tencent AI Lab): https://arxiv.org/abs/2308.06721
- OpenCLIP: https://github.com/mlfoundations/open_clip
