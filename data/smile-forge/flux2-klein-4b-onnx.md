# smile-forge/flux2-klein-4b-onnx

## Resumen

FLUX.2 [klein] 4B para ONNX Runtime es una conversión a ONNX del modelo de generación y edición de imágenes FLUX.2-klein-4B de Black Forest Labs, publicada por el usuario smile-forge. El repositorio no contiene pesos en formato PyTorch, sino cuatro grafos ONNX (encoder de prompt, denoiser, encoder de imagen y decoder) pensados para ejecutarse con ONNX Runtime 1.30 o superior y el execution provider de CUDA. El objetivo es permitir la inferencia del modelo fuera del ecosistema PyTorch/diffusers, en particular desde aplicaciones .NET a través del host Nexaflow, que invoca los grafos desde C#.

El modelo resuelve dos tareas: la generación de imágenes a partir de una descripción textual (text-to-image) y la edición de imágenes existentes mediante instrucciones, composición de varias imágenes o repintado restringido a una máscara (inpainting). Se apoya en un transformer de flujo rectificado (rectified flow) destilado, por lo que no requiere guidance, y en un encoder de prompt derivado de Qwen3-4B truncado en la capa 27. El tamaño total del repositorio es de 8,7 GB, con pesos cuantizados a 8 bits en el denoiser y el encoder de prompt.

La relevancia de esta ficha es doble: documenta una alternativa de despliegue de FLUX.2-klein-4B sin dependencia de PyTorch y ofrece datos concretos de precisión numérica frente a las pipelines oficiales de diffusers, además de cifras de consumo de memoria y latencia medidas en una RTX PRO 6000. Es un artefacto de conversión, no un modelo nuevo, y su licencia Apache-2.0 coincide con la del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow) para difusión, con encoder de prompt Qwen3-4B truncado en la capa 27 y VAE con patchificación 2×2 |
| Parametros totales | 4B (heredados del modelo base FLUX.2-klein-4B; el desglose por componente no se detalla) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de prompt (el encoder trunca o rellena a 512) |
| Tipos de cuantizacion | Pesos de 8 bits MatMulNBits (bloques de 32, simétrico) en encoder y denoiser; VAE en fp16; aritmética fp32 en el encoder y fp16 sobre residuales fp32 en el denoiser |
| Idiomas soportados | no disponible (el prompt se procesa con la plantilla de chat de Qwen3; no se documentan idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuatro grafos: `encoder/`, `denoiser/`, `picture-encoder/`, `decoder/`) |

## Arquitectura y entrenamiento

El modelo base es FLUX.2-klein-4B, un transformer de flujo rectificado para difusión de imágenes con 4B de parámetros y variante destilada (no usa classifier-free guidance). La conversión a ONNX mantiene la arquitectura y modifica únicamente lo imprescindible para que el grafo sea exportable y ejecutable en ONNX Runtime, preservando la aritmética en cada cambio. El encoder de prompt es Qwen3-4B cortado tras la capa 27, que entrega las salidas de las capas 9, 18 y 27 de forma simultánea tal como las consume la pipeline original. El VAE incorpora la patchificación 2×2 y el batch norm dentro de los grafos de imagen, de modo que el llamante solo maneja latentes de 128 canales.

Las innovaciones técnicas de la conversión son relevantes para quien vaya a desplegarlo: los bloques single-stream mantienen el residual stream en fp32 porque alcanza 1,03×10⁵, fuera del rango de fp16, mientras que las ramas internas corren en fp16 (ninguna supera 3,5×10³); el embedder de timestep, las modulaciones, las normas, las posiciones rotatorias y la proyección de salida se mantienen en fp32, y los ángulos rotatorios se calculan en tablas fp64 como en diffusers. La atención usa el operador fusionado `com.microsoft.MultiHeadAttention`, que evita materializar la matriz completa de puntuaciones token a token. El muestreo es el de la pipeline: cuatro pasos Euler sobre `linspace(1, 1/4, 4)`, con cada nivel reescalado mediante `e^μ / (e^μ + 1/s − 1)` y μ calculado con `compute_empirical_mu(tokens, 4)`. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resoluciones de hasta aproximadamente un megapixel, con cada lado múltiplo de 16.
- Edición de imágenes por instrucción: cambio de estilo, transformación de escena (por ejemplo, convertir una imagen en escena nocturna o en acuarela).
- Composición de varias imágenes: el denoiser acepta hasta varias imágenes de referencia codificadas con posiciones diferenciadas (índices 10·(i+1)), lo que permite insertar elementos de una imagen en otra.
- Inpainting por máscara: repintado restringido a la región indicada, reintegrándose los latentes originales ruidosos al nivel de cada paso donde la máscara vale 0.
- Expansión de bordes (outpainting) de la imagen, con una fidelidad de 26 dB PSNR frente a la pipeline de referencia.
- Prompt en formato de plantilla de chat de Qwen3 con modo thinking desactivado; el encoder produce las representaciones de las capas 9, 18 y 27.
- No se documenta soporte de tool calling, agentes, visión general, audio ni otras modalidades fuera de imagen y texto.

## Casos de uso

- Edición de imágenes por instrucción en aplicaciones de escritorio .NET: el host Nexaflow invoca los cuatro grafos desde C# con ONNX Runtime y CUDA, lo que permite integrar edición por prompt en herramientas nativas Windows sin dependencia de Python ni PyTorch.
- Repintado selectivo en flujos de retoque fotográfico: la máscara se reescala bilinealmente a la rejilla de tokens y solo se sustituyen los latentes en la región marcada, lo que encaja en editores que necesitan eliminar objetos o rellenar huecos manteniendo el resto de la imagen intacta.
- Composición de producto en marketing: combinar hasta tres imágenes de referencia (por ejemplo, un producto y dos escenas) para generar variantes de catálogo, aprovechando que el denoiser acepta varias imágenes con posiciones diferenciadas.
- Expansión de bordes para adaptar imágenes a formatos: el outpainting documentado a 26 dB PSNR frente a diffusers permite reformatear imágenes a relaciones de aspecto distintas sin recortar el contenido.
- Generación de borradores visuales en pipelines de preproducción: con cuatro pasos Euler y aproximadamente un segundo por imagen en una RTX PRO 6000, es viable generar varias propuestas por prompt en sesiones interactivas.
- Servicio de edición de imágenes en infraestructura CUDA existente: al ejecutarse sobre ONNX Runtime con execution provider CUDA, puede desplegarse en entornos donde ya se opera con runtime de inferencia genérico y no se quiere introducir el stack de PyTorch.
- Procesamiento por lotes de restilizado: cambiar el estilo de conjuntos de imágenes (por ejemplo, a acuarela) con una fidelidad de 30–37 dB PSNR frente a la pipeline oficial, suficiente para tareas donde la equivalencia numérica con diffusers no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí aporta métricas de fidelidad frente a las pipelines de diffusers en bf16 partiendo del mismo ruido:

| Tarea | PSNR frente a diffusers (bf16) |
|---|---|
| Edición de imagen 1024² (cambio de escena, restilizado, inserción de elementos) | 30–37 dB |
| Relleno bajo máscara (inpainting) | 31–43 dB |
| Expansión de bordes | 26 dB |
| Generación solo desde prompt | 18 dB |
| Decoder frente al VAE en fp32 | 63 dB |

Las cifras de generación desde prompt (18 dB) indican que, sin imagen de referencia que ancle el resultado, la conversión produce la misma imagen con detalles desplazados; para edición e inpainting la equivalencia es alta.

## Requisitos de hardware

- Memoria en pico medida en el host Nexaflow con una imagen de un megapixel: 4,9 GiB para el encoder de prompt, 2,0 GiB para el encoder de imagen, 4,8 GiB para el decoder y, para el denoiser, 7,3 GiB generando desde prompt, 9,6 GiB con una imagen de referencia, 10,7 GiB con dos y 13,4 GiB con tres.
- El total en pico no es la suma de todas las partes si se liberan los grafos entre etapas, pero un despliegue que mantenga todo cargado simultáneamente requiere del orden de 20–30 GiB de VRAM según el número de imágenes de referencia.
- GPU recomendadas: RTX PRO 6000 (medida en la model card, aproximadamente un segundo por imagen), así como A100, H100 o L40S por capacidad de memoria; tarjetas consumer de 24 GB como la RTX 4090 pueden alojar el encoder y el denoiser por separado, pero no todos los componentes a la vez en el peor caso de tres imágenes de referencia.
- Cabe en GPU consumer de 24 GB si se descargan y recargan los grafos entre etapas; con menos de 16 GB es inviable mantener el denoiser con referencias múltiples.
- Opciones de despliegue: ONNX Runtime 1.30 o superior con el execution provider CUDA; el autor proporciona los scripts `build_flux2_klein.py`, `check_flux2_klein.py` y `Build-Flux2Klein.ps1` para reproducir la conversión y la validación.
- Latencia: aproximadamente un segundo por imagen de un megapixel en una RTX PRO 6000 con cuatro pasos Euler; no se documenta throughput para otros aceleradores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de prompt | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| smile-forge/flux2-klein-4b-onnx | 4B | 512 tokens | ONNX (8 bits MatMulNBits + fp16) | Apache-2.0 | Conversión para ONNX Runtime CUDA; 8,7 GB de repo |
| black-forest-labs/FLUX.2-klein-4B | 4B | 512 tokens | safetensors (bf16/fp16) | Apache-2.0 | Modelo original en PyTorch/diffusers; referencia de fidelidad de la conversión |
| Otras conversiones ONNX de FLUX.2-klein | no disponible | no disponible | ONNX | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación directa más útil es con el modelo base: misma arquitectura, mismos parámetros y misma licencia, con la diferencia de que la versión ONNX pesa 8,7 GB por la cuantización a 8 bits y funciona sin PyTorch, a costa de una pérdida de fidelidad documentada de 18 dB PSNR en generación desde prompt y de 26–43 dB en tareas de edición.

## Limitaciones y advertencias

- La generación desde prompt sin imagen de referencia se aleja de la pipeline oficial (18 dB PSNR), con detalles desplazados; no es adecuada si se exige equivalencia numérica con diffusers en text-to-image puro.
- El prompt se trunca o rellena a 512 tokens con `<|endoftext|>`; prompts más largos pierden información sin aviso.
- La resolución está limitada a aproximadamente un megapixel y cada lado debe ser múltiplo de 16; por encima de ese tamaño no hay garantías documentadas.
- El modelo es destilado y no acepta guidance; no se puede ajustar la adherencia al prompt mediante escala de guidance.
- Los pesos están cuantizados a 8 bits en encoder y denoiser, lo que introduce una pérdida de precisión respecto a los pesos originales en bf16.
- No se documentan sesgos, comportamiento multilingüe ni evaluación de alucinación visual; el prompt se procesa con la plantilla de Qwen3 y no hay datos sobre calidad en idiomas distintos del inglés.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y de los pesos convertidos; conviene verificar las condiciones de FLUX.2-klein-4B en la revisión `e7b7dc27`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (3 de noviembre de 2026); no hay evidencia de uso en producción ni validación independiente.
- Requiere ONNX Runtime 1.30 o superior con execution provider CUDA; no se documenta funcionamiento en CPU ni en otros execution providers.
- El consumo de VRAM con tres imágenes de referencia (13,4 GiB solo para el denoiser) puede exceder tarjetas consumer de 24 GB si se mantienen todos los grafos cargados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/smile-forge/flux2-klein-4b-onnx
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Proyecto Nexaflow: https://github.com/smile-forge/nexaflow
- Conversión relacionada del mismo autor (MOSS-Image para ONNX): https://github.com/smile-forge/moss-image-onnx
- Referencia en Telegram sobre trabajos del autor: https://t.me/s/GreenNeuralRobots?q=%23mossimage
