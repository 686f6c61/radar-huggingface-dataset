# paralaif/ReCaVSR-comfy-int8-convrot

## Resumen

ReCaVSR es un modelo de superresolución de vídeo en streaming de un solo paso, desarrollado por Xijun Wang, Xin Li, Suhang Yao, Zirui Lang, Bingchen Li y Zhibo Chen (University of Science and Technology of China). Se construye sobre el transformer de Wan2.2-TI2V-5B y está entrenado para un factor de escala 4×. Esta ficha concreta, publicada por el usuario `paralaif`, no es el modelo original sino una versión cuantizada a INT8 con rotación Hadamard por bloques (denominada ConvRot) del transformer de ReCaVSR, empaquetada junto con los nodos de ComfyUI necesarios para ejecutarla.

El objetivo de esta variante es reducir el coste de memoria y acelerar la inferencia en GPUs de consumo. El transformer original en BF16 ocupa 9,88 GiB, mientras que esta versión INT8 ocupa 5,84 GiB, con una pérdida de calidad medida de 40,3 dB PSNR respecto a la salida BF16. El repositorio incluye además el decoder (`flashdecoder.safetensors`, 218 MiB en FP32) y el embedding de prompt fijo (`prompt.safetensors`, 4 MB en BF16), ambos sin modificar respecto al modelo base.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización aplicada a un modelo de vídeo generativo (quantización INT8 con rotación de pesos y cuantización de activaciones en tiempo de ejecución); por otro, ofrece un paquete listo para instalar en ComfyUI, lo que baja la barrera de entrada para probar superresolución de vídeo 4× en hardware de gama media. El modelo no está pensado para generación de texto ni para tareas de lenguaje: es un componente de visión puro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Wan2.2-TI2V-5B, con atención propia y cruzada, 30 bloques |
| Parámetros totales | no disponible (el modelo base es Wan2.2-TI2V-5B, 5B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa vídeo en streaming, no texto) |
| Tipos de cuantización | INT8 con rotación Hadamard de bloque de anchura 256 (formato `int8_tensorwise` con `convrot`); capas no cuantizadas en BF16 y decoder en FP32 |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (INT8-ConvRot, BF16, FP32) |

## Arquitectura y entrenamiento

El transformer sigue la arquitectura de Wan2.2-TI2V-5B, un modelo de difusión para vídeo con 30 bloques que combinan self-attention, cross-attention y feed-forward. ReCaVSR adapta ese backbone para superresolución de vídeo en streaming de un solo paso: en lugar de un proceso de difusión iterativo, produce el fotograma de alta resolución en una única pasada, condicionado por el fotograma de baja resolución y por un estado latente reciclado entre fotogramas. El decoder (`flashdecoder.safetensors`) está condicionado por la imagen de baja resolución (LR-conditioned) y se mantiene en FP32.

La cuantización de esta ficha afecta a 240 capas lineales: en cada uno de los 30 bloques se cuantizan las proyecciones q/k/v/out de self-attention, las proyecciones q/out de cross-attention y los dos pesos de feed-forward. Cada peso se almacena en INT8 con una escala por fila de salida, previa aplicación de una rotación Hadamard de bloque de anchura 256. Las activaciones se cuantizan en tiempo de ejecución. Permanecen en BF16 las claves y valores de cross-attention (calculados una vez por vídeo), las proyecciones de latente de baja resolución y de latente reciclado, el patch embedding, el condicionamiento, las normas y la cabeza de salida. La conversión se realizó con el cuantizador INT8 ConvRot de Comfy Kitchen mediante el script `ComfyUI-ReCaVSR/tools/convert_int8.py`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o fotogramas vistos, ni sobre si se aplicó RLHF o DPO (no aplica en un modelo de visión de este tipo).

## Capacidades

- Superresolución de vídeo 4× en streaming, de un solo paso, sobre fotogramas de baja resolución.
- Procesamiento de vídeo con audio y frecuencia de fotogramas preservados (según la model card, el pipeline de ComfyUI mantiene ambos).
- Integración nativa con ComfyUI mediante los nodos `ComfyUI-ReCaVSR` (Load Video → ReCaVSR Upscale Video → Save Video, con ReCaVSR Loader).
- Ejecución en GPUs de consumo: el ejemplo medido usa una RTX 5060 Ti de 16 GB con unos 10 GB libres para el proceso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto ni matemáticas: es un componente de visión especializado.
- No tiene capacidades multilingües ni modo "thinking".

## Casos de uso

- Restauración de metraje antiguo o de baja resolución: el modelo escala 4× fotogramas de 488×830 a 1952×3320 en 36 s con esta versión INT8 en una RTX 5060 Ti, lo que permite procesar clips cortos en hardware de consumo sin recurrir a un servidor.
- Upstream de pipelines de edición en ComfyUI: al estar empaquetado como nodos nativos, se puede insertar como paso de upscale dentro de un grafo mayor (por ejemplo, antes de un modelo de interpolación de fotogramas o de un encoder de vídeo) sin escribir código.
- Preprocesado para modelos de vídeo generativo: subir la resolución de un clip de referencia antes de usarlo como condicionamiento en pipelines de image-to-video o video-to-video, aprovechando que el modelo preserva la frecuencia de fotogramas.
- Archivado y preservación digital: escalar material de archivo a 4K para almacenamiento o difusión, con la ventaja de que el procesamiento es en streaming y no requiere tener el vídeo completo en memoria.
- Prototipado e investigación en superresolución de vídeo: la versión INT8 con ConvRot sirve como referencia reproducible para estudiar el impacto de la cuantización en un transformer de difusión de vídeo, dado que el autor publica los errores de reconstrucción de pesos (0,963 % medio, 1,087 % máximo) y la comparación PSNR frente a BF16.
- Despliegue en estaciones de trabajo con una sola GPU: el peso del transformer baja de 9,88 GiB a 5,84 GiB, lo que permite cargar el modelo junto con el decoder y el resto del pipeline en tarjetas de 12–16 GB que no admitirían la versión BF16 completa.
- Evaluación comparativa de cuantizaciones: al incluir los ficheros originales sin modificar (prompt y decoder) y los nodos, se puede medir el efecto aislado de la cuantización del transformer sobre la calidad final.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones del propio autor sobre la reconstrucción de pesos y la velocidad, no benchmarks estándar de superresolución (PSNR/SSIM/LPIPS sobre datasets de referencia).

| Métrica | Valor |
|---|---|
| Error relativo medio de reconstrucción de pesos (240 capas) | 0,963 % |
| Error relativo máximo de reconstrucción de pesos | 1,087 % |
| PSNR entre vídeo upscalado INT8 y BF16 (ambos H.264) | 40,3 dB |
| Tiempo de inferencia, clip demo (45 fotogramas, 488×830 → 1952×3320) en RTX 5060 Ti 16 GB | 36 s (INT8) frente a 59 s (BF16) |
| Aceleración observada | ~1,64× |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de visión.

## Requisitos de hardware

- VRAM estimada para el transformer: 5,84 GiB en INT8 (frente a 9,88 GiB en BF16). Añadir el decoder FP32 (218 MiB), el embedding de prompt (4 MB) y las activaciones en tiempo de ejecución.
- El ejemplo medido usa una RTX 5060 Ti de 16 GB con aproximadamente 10 GB libres para el proceso, y completa el clip demo en 36 s.
- Cabe en GPUs de consumo de 12–16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 5060 Ti 16 GB, RTX 5070 Ti 16 GB), siempre que el resto del pipeline de ComfyUI no consuma demasiada memoria.
- GPU de gama profesional (A100, H100) no están documentadas para esta variante; el modelo está pensado para ComfyUI en estaciones de trabajo.
- Despliegue: exclusivamente mediante ComfyUI con los nodos `ComfyUI-ReCaVSR` incluidos en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de vídeo).
- Latencia y throughput: 36 s para 45 fotogramas a 1952×3320 en RTX 5060 Ti 16 GB con la versión INT8; no se publican cifras para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReCaVSR-comfy-int8-convrot (esta ficha) | 5B (base Wan2.2-TI2V-5B) | Vídeo en streaming, 4× | INT8 ConvRot | Apache-2.0 | Hugging Face, ComfyUI |
| ReCaVSR (kopper/ReCaVSR, BF16) | 5B | Vídeo en streaming, 4× | BF16 | Apache-2.0 | Hugging Face |
| Wan2.2-TI2V-5B | 5B | Vídeo texto/imagen a vídeo | BF16 y otras | Apache-2.0 | Hugging Face |

No se dispone de información sobre otros modelos de superresolución de vídeo comparables en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo linaje.

## Limitaciones y advertencias

- Modelo de visión especializado: no genera texto, no razona, no hace código ni matemáticas; no debe evaluarse con benchmarks de lenguaje.
- La cuantización introduce un error de reconstrucción de pesos de hasta 1,087 % en la capa peor, y una diferencia de 40,3 dB PSNR frente a la salida BF16; para aplicaciones donde la fidelidad absoluta sea crítica, conviene usar la versión BF16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (16 de noviembre de 2026); no hay evidencia de uso en producción ni validación independiente.
- Dependencia fuerte de ComfyUI: la instalación y el uso están atados a los nodos `ComfyUI-ReCaVSR` y a la versión de ComfyUI que soporte el formato `int8_tensorwise` con `convrot`.
- No se documentan sesgos, riesgos de alucinación ni comportamiento en dominios concretos (caras, texto en vídeo, movimiento rápido), por lo que se desconoce su robustez fuera del clip demo.
- La licencia Apache-2.0 permite uso comercial, pero los nodos de ComfyUI son MIT y las partes portadas de ReCaVSR mantienen Apache-2.0 según el fichero `NOTICE`; conviene revisar ese aviso antes de redistribuir.
- No se especifican idiomas soportados ni limitaciones de contexto porque el modelo no procesa lenguaje.
- El rendimiento medido (36 s para 45 fotogramas) corresponde a una única GPU y a un único clip; no hay datos de escalado a vídeos más largos o resoluciones mayores.

## Enlaces

- Hugging Face: https://huggingface.co/paralaif/ReCaVSR-comfy-int8-convrot
- Modelo base: https://huggingface.co/kopper/ReCaVSR
- Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Paper de ReCaVSR: https://arxiv.org/abs/2609.37831
- Código de ReCaVSR: https://github.com/kopperx/ReCaVSR
- ComfyUI-Lumen (incluye los mismos nodos como Upscale ×4): https://github.com/quinteroac/ComfyUI-Lumen
- Comfy Kitchen (cuantizador INT8 ConvRot): https://github.com/Comfy-Org/comfy-kitchen
