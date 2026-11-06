# smile-forge/qwen-image-edit-2511-onnx

## Resumen

`smile-forge/qwen-image-edit-2511-onnx` es una conversión a ONNX Runtime del modelo de edición de imágenes Qwen-Image-Edit-2511 de Alibaba Qwen, publicada por el usuario smile-forge. No se trata de un modelo entrenado desde cero, sino de una reimplementación del pipeline original de diffusers en cinco grafos ONNX independientes (lector de imagen, codificador de prompt, codificador de imagen, denoiser y decodificador), pensada para ejecutarse con el execution provider CUDA de ONNX Runtime 1.30 o superior. El objetivo es ofrecer una vía de despliegue alternativa a PyTorch/diffusers, útil para integrar la edición de imágenes en aplicaciones .NET o C# a través del host Nexaflow del mismo autor.

El modelo base Qwen-Image-Edit-2511 es un modelo de imagen a imagen de aproximadamente 20 000 millones de parámetros que combina un codificador visual Qwen2.5-VL, un VAE de Qwen-Image y un transformer de difusión MMDiT de 60 capas. Esta conversión mantiene esa arquitectura pero la descompone en grafos optimizados para inferencia: el denoiser se ofrece en dos variantes (pesos de 8 bits para GPU de 32 GB y fp16 para GPU de 48 GB), mientras que el resto de componentes se distribuyen en fp32 o fp16 según su función.

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue ONNX para un modelo de edición de imágenes de gran tamaño, y por otro sirve como referencia de las decisiones técnicas (cuantización MatMulNBits, atención fusionada, manejo de precisión mixta) que implica portar un pipeline de difusión multimodal a ONNX Runtime. La licencia Apache 2.0 del modelo base se mantiene en esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión multimodal: vision tower Qwen2.5-VL + LM Qwen2.5-VL-7B + VAE Qwen-Image + MMDiT de 60 capas + VAE decoder, exportados como cinco grafos ONNX |
| Parametros totales | aproximadamente 20 000 millones (modelo base Qwen-Image-Edit-2511) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos de 8 bits (MatMulNBits) en prompt-encoder y denoiser; fp32 en picture-reader; fp16 en picture-encoder, decoder y variante denoiser-fp16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (grafos separados por componente); tokenizer.json incluido en prompt-encoder |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una conversión de inferencia. El pipeline original de Qwen-Image-Edit-2511 se ha trazado con `torch.onnx.export` a partir de diffusers 0.39 y transformers 4.57, y se ha dividido en cinco grafos: `picture-reader` (vision tower de Qwen2.5-VL, fp32, 2,7 GB), `prompt-encoder` (LM Qwen2.5-VL-7B con pesos de 8 bits en aritmética fp32, 8,4 GB), `picture-encoder` (VAE encoder de Qwen-Image en fp16, 0,1 GB), `denoiser` (MMDiT de 60 capas con pesos de 8 bits y aritmética fp16 sobre streams residuales fp32, 21,9 GB) y `decoder` (VAE decoder en fp16, 0,1 GB). Existe además una variante `denoiser-fp16` de 40,9 GB con pesos en fp16.

Las innovaciones técnicas documentadas por el autor incluyen: ramas en fp16 sobre streams residuales en fp32 con escalado por potencias de dos para evitar desbordamientos (los streams alcanzan 10⁹); ángulos rotatorios precalculados en tablas para posiciones de −4096 a 4095; atención fusionada mediante `com.microsoft.MultiHeadAttention` de ONNX Runtime con sesgo aditivo en las capas con ventana del vision tower; y lectura de una imagen por llamada al picture-reader, con el orden de ventanas y la ventana de cada parche proporcionados por el llamador. El autor reporta que el paso reconstruido es exacto a 4×10⁻⁶ frente al original en fp32, y que las ramas fp16 se desvían un 0,9 % del valor máximo (frente al 1,6 % del modelo en bf16). No se detallan datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Edición de imágenes a partir de una o varias imágenes de referencia y una instrucción en lenguaje natural.
- Edición multi-imagen: el pipeline acepta hasta tres imágenes de entrada (por ejemplo, insertar un objeto de una segunda imagen en una escena).
- Relleno (inpainting) y expansión (outpainting) bajo máscara.
- Reescritura de texto dentro de la imagen (el autor cita un ejemplo de menú de pizarra reescrito).
- Transformación de sujetos (por ejemplo, convertir un zorro en un panda rojo).
- Cambios de ambiente e iluminación (por ejemplo, escena nocturna en un puerto).
- Comprensión de la imagen de entrada mediante el vision tower de Qwen2.5-VL, que codifica cada imagen en tokens para el prompt.
- Ejecución sobre ONNX Runtime 1.30 o superior con execution provider CUDA; integrable desde C# mediante el host Nexaflow.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni modo de razonamiento explícito.

## Casos de uso

- Edición fotográfica asistida en aplicaciones de escritorio: el pipeline permite reescribir texto en una imagen o cambiar la iluminación de una escena a partir de una instrucción, con latencias de 82 s por edición a un megapíxel en una RTX PRO 6000, adecuadas para flujos de trabajo por lotes más que para edición interactiva en tiempo real.
- Composición multi-imagen en herramientas de diseño: la capacidad de tomar dos o tres imágenes de referencia (por ejemplo, colocar un objeto recortado de una segunda foto sobre una mesa) encaja en asistentes de maquetación que necesitan recombinar activos visuales.
- Relleno y expansión bajo máscara en pipelines de retoque: el autor reporta 82 s para un relleno y 84 s para una expansión bajo máscara a un megapíxel, lo que permite integrarlo en procesos de restauración o ampliación de imágenes por lotes.
- Integración en aplicaciones .NET/C#: al estar exportado a ONNX y ser consumible desde el host Nexaflow, permite incorporar edición de imágenes generativa en backends empresariales escritos en C# sin depender de PyTorch.
- Sustitución de texto en material gráfico localizado: la reescritura de texto dentro de la imagen (menús, carteles, etiquetas) facilita adaptar creatividades a distintos idiomas o versiones sin volver a diseñarlas.
- Prototipado de investigación sobre pipelines de difusión en ONNX: los cinco grafos separados y las variantes de cuantización permiten estudiar el impacto de la precisión (8 bits frente a fp16) en la calidad de la edición, con métricas PSNR reportadas por el autor.
- Despliegue en infraestructura con GPU de 32 GB o 48 GB: la variante de 8 bits del denoiser (27,6 GiB en pico con tres imágenes a un megapíxel) y la fp16 (44,4 GiB) permiten elegir el build según la VRAM disponible.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K u otros), pero sí comparativas de fidelidad y latencia frente al pipeline de diffusers en bf16. Se recogen a continuación los datos aportados en la model card.

| Metrica | Valor reportado |
|---|---|
| PSNR frente a diffusers bf16 (4 ediciones, denoiser 8 bits) | 33,7 / 33,8 / 36,5 / 32,9 dB |
| PSNR frente a diffusers bf16 (4 ediciones, denoiser fp16) | 35,3 / 30,5 / 30,4 / 32,7 dB |
| Latencia de edición a 1 MP, 1 imagen (RTX PRO 6000) | 82 s (diffusers: 76 s) |
| Latencia de edición a 1 MP, 2 imágenes (RTX PRO 6000) | 136 s (diffusers: 139 s) |
| Latencia de relleno bajo máscara | 82 s |
| Latencia de expansión bajo máscara | 84 s |
| Pico de VRAM del denoiser 8 bits (3 imágenes a 1 MP) | 27,6 GiB |
| Pico de VRAM del denoiser fp16 (3 imágenes a 1 MP) | 44,4 GiB |
| Pico de VRAM del prompt encoder | 9,6 GiB |
| Pico de VRAM del picture reader | 3,5 GiB |
| Pico de VRAM del picture encoder | 4,3 GiB |
| Pico de VRAM del decoder | 4,0 GiB |
| Error del paso reconstruido frente al original fp32 | 4×10⁻⁶ |
| Desviación de ramas fp16 frente al original | 0,9 % del valor máximo (bf16: 1,6 %) |
| Diferencia de tokens del picture reader frente al original | 6×10⁻⁵ |
| Diferencia de latentes del VAE encoder en fp16 | 3×10⁻³ |
| PSNR del decoder frente al original | 50,8 dB |

No se han publicado resultados de benchmarks estándar de calidad de edición (por ejemplo, métricas tipo CLIP-score o evaluaciones humanas) en la información disponible.

## Requisitos de hardware

- VRAM estimada: con el denoiser de 8 bits, el pico conjunto ronda los 27,6 GiB del denoiser más los componentes auxiliares cargados de forma secuencial (prompt encoder 9,6 GiB, picture reader 3,5 GiB, picture encoder 4,3 GiB, decoder 4,0 GiB); con el denoiser fp16, el pico del denoiser sube a 44,4 GiB.
- GPU recomendadas: el autor cita una RTX PRO 6000 (48 GB) para las mediciones; la variante de 8 bits está pensada para GPU de 32 GB y la fp16 para GPU de 48 GB. No se documentan pruebas en A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No se confirma en la información disponible; por los picos de VRAM reportados, una GPU de 24 GB (RTX 4090) no cubriría el denoiser de 8 bits en el escenario de tres imágenes a un megapíxel.
- Opciones de despliegue: ONNX Runtime 1.30 o superior con execution provider CUDA; el autor menciona el host Nexaflow (C#) como consumidor de referencia. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 82 s por edición de una imagen a un megapíxel y 136 s con dos imágenes en una RTX PRO 6000; 82 s para relleno bajo máscara y 84 s para expansión. No se reporta throughput agregado por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| smile-forge/qwen-image-edit-2511-onnx | aprox. 20 000 M (base) | no disponible | ONNX Runtime (CUDA) | apache-2.0 | Conversión del pipeline de Qwen-Image-Edit-2511 en cinco grafos; variantes de denoiser en 8 bits y fp16 |
| Qwen/Qwen-Image-Edit-2511 | aprox. 20 000 M | no disponible | PyTorch / diffusers | apache-2.0 | Modelo base original; referencia de calidad y latencia (76 s y 139 s a 1 MP en RTX PRO 6000) |
| Alternativas de edición de imagen de tamaño comparable | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente de los resultados reportados por el autor.
- Las métricas de fidelidad (PSNR) y latencia proceden exclusivamente de la model card del autor y no han sido replicadas de forma independiente.
- El modelo está pensado para ONNX Runtime 1.30 o superior con execution provider CUDA; no se documenta funcionamiento en CPU ni en otros execution providers.
- La conversión depende de versiones concretas de diffusers (0.39) y transformers (4.57); el autor advierte de que transformers 5.0 cambia el comportamiento del pipeline respecto a los `mm_token_type_ids` y rompe la numeración de imágenes del prompt.
- El picture reader procesa una imagen por llamada, lo que impone una orquestación explícita por parte del llamador (orden de ventanas y ventana de cada parche).
- Los requisitos de VRAM (27,6 GiB en el mejor caso para el denoiser) excluyen su uso en GPU de consumo de gama alta con 24 GB en el escenario de tres imágenes a un megapíxel.
- No se documentan sesgos, riesgos de alucinación visual, limitaciones idiomáticas ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales (atribución y ausencia de garantías).
- Al ser una conversión de inferencia, hereda las limitaciones del modelo base Qwen-Image-Edit-2511, que no se detallan en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/smile-forge/qwen-image-edit-2511-onnx
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repositorio Nexaflow (host en C#): https://github.com/smile-forge/nexaflow
