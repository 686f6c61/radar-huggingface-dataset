# latentdivergence/flux2-klein-t2i-768-npu-8elite

## Resumen

Este repositorio contiene una compilación del modelo de generación de imágenes texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs, optimizada para ejecutarse en la NPU Hexagon del SoC Qualcomm Snapdragon 8 Elite. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo base a grafos ONNX cuantizados y compilados con Qualcomm AI Hub (QAIRT 2.45), pensada para inferencia local en dispositivos móviles. El autor, latentdivergence, publica esta variante de 768x768 píxeles como complemento a sus grafos de edición de 512 píxeles.

La relevancia de esta ficha radica en que ejemplifica el despliegue de modelos de difusión de última generación en hardware móvil de consumo, un escenario tradicionalmente reservado a GPUs de escritorio o servidores. El repositorio incluye los pesos divididos en tres particiones del transformer (p1, p2, p3) en formato w8a16, un decodificador VAE en fp16 y una tabla de sigmas para muestreo en 4 pasos, junto con verificaciones de fidelidad numérica frente a las partes en fp32.

El modelo base FLUX.2 klein 4B pertenece a la familia FLUX.2 de Black Forest Labs, orientada a generación de imágenes de alta calidad con un tamaño de parámetros contenido. Esta compilación concreta no incorpora el codificador de texto Qwen3, que se comparte con otra build del mismo autor (flux2-klein-edit-text), por lo que para su uso completo es necesario descargar componentes adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (FLUX.2 klein), transformer dividido en 3 particiones (p1, p2, p3) + VAE decoder, compilado a ONNX/QNN para NPU Hexagon |
| Parametros totales | 4B (modelo base FLUX.2 klein 4B); pesos del transformer en el repo: ~3,88 GB en tres particiones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto + 2304 tokens latentes (sin tokens de referencia) |
| Tipos de cuantizacion | w8a16 en transformer (pesos 8 bits, activaciones 16 bits); VAE decoder en fp16; IO en fp32 |
| Idiomas soportados | No disponible (el modelo base es texto-a-imagen; el codificador de texto Qwen3 no se incluye en este repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX + model.bin (QNN context binaries), tablas NPZ |

## Arquitectura y entrenamiento

El modelo base es un modelo de difusión de la familia FLUX.2, en su variante klein de 4B parámetros. Esta publicación no entrena ni ajusta el modelo: aplica cuantización y compilación sobre los pesos originales para adaptarlos al backend QNN de Qualcomm. La arquitectura se ha fragmentado en tres subgrafos del transformer (transformer_p1, transformer_p2, transformer_p3), cada uno con su propio model.onnx y model.bin, más un vae_decoder independiente. La entrada se estructura en 64 tokens de texto y 2304 tokens latentes, sin tokens de referencia, lo que corresponde al modo texto-a-imagen puro a resolución 768x768.

La compilación se realizó con Qualcomm AI Hub y QAIRT 2.45, con IO en fp32 y cuantización w8a16 en el transformer y fp16 en el VAE. El repositorio incluye tables_768.npz con las sigmas del muestreo en 4 pasos y los vectores de modulación de timestep. El autor reporta verificaciones de fidelidad numérica frente a las partes en fp32 sobre llamadas held-out, con similitudes coseno de 0,99604 a 0,99995 en las salidas de texto, imagen y salida final según la partición. No se documentan datos de entrenamiento, composición del dataset ni procesos de RLHF/DPO en esta publicación, ya que corresponden al modelo base y no se detallan aquí.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 768x768 píxeles.
- Muestreo en 4 pasos mediante las sigmas precalculadas en tables_768.npz.
- Inferencia en NPU Hexagon del Snapdragon 8 Elite mediante grafos QNN compilados.
- Ejecución local en dispositivo móvil, sin necesidad de GPU de escritorio.
- Compatibilidad con el ecosistema ONNX Runtime / QNN de Qualcomm AI Hub.
- No incluye capacidades de edición de imagen (esta build es solo t2i; la edición corresponde a otro repositorio del mismo autor).
- No incluye el codificador de texto Qwen3, que debe obtenerse por separado (flux2-klein-edit-text).
- Soporte de tool calling, agentes o razonamiento multi-paso: no aplica (modelo de imagen).
- Capacidades multilingües: no documentadas en esta publicación.

## Casos de uso

- Generación de imágenes en aplicaciones móviles nativas: integración de los grafos QNN en una app Android para producir imágenes 768x768 a partir de prompts de texto directamente en el dispositivo, aprovechando la NPU Hexagon para reducir consumo energético frente a CPU/GPU.
- Prototipado de experiencias creativas offline: uso en apps de edición o diseño que requieran generar imágenes sin conexión a la nube, con la ventaja de privacidad que supone no enviar prompts a servidores externos.
- Investigación en despliegue de modelos de difusión en edge: banco de pruebas para medir latencia, consumo y fidelidad numérica de un modelo de 4B cuantizado a w8a16 en hardware móvil, con las verificaciones coseno ya reportadas por el autor.
- Demos y pruebas de concepto en ferias o entornos sin infraestructura: ejecución de generación de imágenes en un teléfono con Snapdragon 8 Elite, sin dependencia de red ni de GPU dedicada.
- Integración en pipelines de generación de contenido para redes sociales: creación de borradores visuales rápidos desde el propio dispositivo antes de un refinamiento posterior en escritorio.
- Evaluación comparativa de backends: contraste del rendimiento de esta build QNN frente a alternativas en GPU o CPU para el mismo modelo base, útil para decidir la plataforma de despliegue en producto.

## Benchmarks y rendimiento

El autor no publica métricas de calidad de imagen (FID, CLIP score) ni latencias. Sí incluye verificaciones de fidelidad numérica frente a las partes en fp32 sobre llamadas held-out:

| Partición | Similitud coseno salida texto | Similitud coseno salida imagen | Similitud coseno salida final |
|---|---|---|---|
| transformer_p1 | 0,99871 – 0,99970 | 0,99994 – 0,99995 | no disponible |
| transformer_p2 | 0,99721 – 0,99937 | 0,99918 – 0,99947 | no disponible |
| transformer_p3 | no disponible | no disponible | 0,99604 – 0,99881 |

Todas las salidas reportadas son finitas (finite = true). No se han publicado resultados de benchmarks de calidad de imagen ni de latencia/throughput en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPU Hexagon del Qualcomm Snapdragon 8 Elite (8elite).
- VRAM: no aplica; el modelo se ejecuta en memoria del dispositivo móvil. El repo ocupa 4,0 GB, con pesos del transformer de ~3,88 GB y VAE de ~135 MB.
- GPU recomendadas: no aplica para esta build; está compilada específicamente para la NPU Hexagon del Snapdragon 8 Elite.
- Cabe en GPU consumer: no es el objetivo de esta compilación; para ejecución en GPU se debería usar el modelo base FLUX.2 klein 4B en otro formato (safetensors, GGUF, etc.).
- Opciones de despliegue: Qualcomm AI Hub / QAIRT 2.45, ONNX Runtime con backend QNN, integración en apps Android mediante el runtime de Qualcomm.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flux2-klein-t2i-768-npu-8elite (este) | 4B (base) | 64 tokens texto + 2304 latentes; 768x768 | ONNX/QNN w8a16 | Apache-2.0 | Hugging Face |
| black-forest-labs/FLUX.2-klein-4B (base) | 4B | No disponible en esta ficha | Safetensors (presumible) | Apache-2.0 | Hugging Face |
| latentdivergence/flux2-klein-edit-npu-8elite | 4B (base) | 512 px, con tokens de referencia | ONNX/QNN | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Esta build está compilada exclusivamente para la NPU Hexagon del Snapdragon 8 Elite; no es portable a otras NPUs, GPUs o CPUs sin recompilación.
- No incluye el codificador de texto Qwen3; es necesario descargar flux2-klein-edit-text para un pipeline completo.
- Resolución fija de 768x768 y muestreo en 4 pasos; no se documentan otras configuraciones.
- Solo texto-a-imagen: no soporta edición, inpainting ni referencia de imagen en esta variante.
- La cuantización w8a16 introduce desviaciones numéricas respecto al fp32 (similitudes coseno de hasta 0,99604 en la peor partición reportada), lo que puede afectar sutilmente a la calidad visual.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base FLUX.2 klein 4B; no se documentan análisis específicos en esta publicación.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las dependencias (Qwen3, QAIRT) por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- No se publican latencias, consumo energético ni métricas de calidad de imagen en dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/latentdivergence/flux2-klein-t2i-768-npu-8elite
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Build de edición del mismo autor: https://huggingface.co/latentdivergence/flux2-klein-edit-npu-8elite
- Codificador de texto compartido: https://huggingface.co/latentdivergence/flux2-klein-edit-text
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- Documentación QAIRT: no disponible en la información proporcionada.
