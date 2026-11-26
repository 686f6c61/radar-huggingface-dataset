# paralaif/Nemotron-Labs-Image-30B-A3B-comfy-w4a8

## Resumen

Nemotron-Labs-Image-30B-A3B es un modelo de generación de imágenes texto-a-imagen desarrollado por NVIDIA Labs con una arquitectura poco habitual en este dominio: en lugar de un UNet o un transformer de difusión, emplea un transformer autorregresivo con mezcla de expertos (MoE). Cuenta con 30 000 millones de parámetros totales de los que unos 3000 millones se activan por token (de ahí el sufijo A3B), distribuidos en 128 expertos enrutados. El modelo genera imágenes mediante tokens visuales discretos producidos por un tokenizador de imágenes propio, el L24SQ.

La ficha que nos ocupa no es el modelo original, sino una conversión comunitaria publicada por el usuario paralaif para los nodos ComfyUI-Nemotron-Image. La conversión cuantiza únicamente los pesos de los expertos enrutados a un formato asimétrico de 4 bits con activaciones int8 (`asym_w4a8_int8`, del toolkit comfy-kitchen), mientras que el resto de pesos se mantienen en bf16. El resultado es un checkpoint de 24,4 GB para el generador más un VAE de 1,2 GB, lo que hace viable la inferencia en GPUs de consumo con 16 GB de VRAM.

Su relevancia actual radica en dos factores: por un lado, demuestra que los modelos autorregresivos multimodales con MoE pueden competir en el terreno de la síntesis de imágenes; por otro, la cuantización W4A8 de los expertos reduce drásticamente los requisitos de memoria con una pérdida medida muy contenida (aproximadamente 0,01 nats por token de imagen, KL ~0,045 respecto al intermedio en fp8). La licencia NVIDIA, sin embargo, restringe el uso a investigación y evaluación, excluyendo el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con mezcla de expertos (MoE) y capas Mamba; tokenizador de imágenes L24SQ |
| Parametros totales | 30B (aproximado, según nombre del modelo) |
| Parametros activos | 3B (aproximado, según nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en `asym_w4a8_int8` (4 bits, codebook, activaciones int8, ConvRot 256); resto en bf16; escalares Mamba y bias del router en fp32 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (nvidia-license); solo uso no comercial (investigación o evaluación) |
| Formato de pesos | safetensors (un checkpoint de generador de 24,4 GB y un VAE de 1,2 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer autorregresivo con capas de tipo Mamba (los pesos del checkpoint incluyen escalares Mamba explícitos) y una capa MoE con 128 expertos enrutados. El modelo no opera sobre píxeles directamente, sino sobre tokens visuales discretos generados por el tokenizador L24SQ, que se distribuye como VAE independiente en bf16 con codebook en fp32. La generación es, por tanto, secuencial token a token, igual que en un modelo de lenguaje, lo que explica el uso de decodificación con grafos CUDA en los nodos de ComfyUI para acelerar la inferencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión tampoco detalla innovaciones de entrenamiento del modelo original. La innovación técnica destacable de esta ficha concreta es el proceso de cuantización: los expertos se convierten a `asym_w4a8_int8` mediante una copia intermedia por fila en fp8, las dimensiones K de los expertos se rellenan con ceros hasta múltiplos de 256 (2688→2816, 1856→2048) y se elimina la cabeza `decoder.distill_mlp`, usada solo en entrenamiento. El tokenizador queda embebido en el checkpoint como `tokenizer_json`.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image), con resolución de al menos 1024×1024 píxeles según las mediciones publicadas.
- Generación autorregresiva de tokens visuales discretos mediante el tokenizador L24SQ.
- Integración con ComfyUI a través de los nodos ComfyUI-Nemotron-Image, con decodificación acelerada por grafos CUDA.
- Ejecución en GPUs de consumo gracias a la cuantización W4A8 de los expertos.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada ni modo thinking.
- Capacidades multilingües: no disponibles; la model card no especifica idiomas para el prompt de texto.

## Casos de uso

- Prototipado de pipelines de generación de imágenes en ComfyUI: el checkpoint se carga directamente en `models/text_encoders` y el VAE en `models/vae`, lo que permite montar un flujo texto-a-imagen completo sin infraestructura adicional y evaluar la calidad del modelo autorregresivo frente a modelos de difusión.
- Investigación sobre modelos autorregresivos multimodales: al ser un MoE de 30B con 3B activos, sirve para estudiar el comportamiento de la generación secuencial de tokens visuales y compararlo con la difusión, en un entorno de laboratorio con una sola GPU de 16 GB.
- Evaluación de técnicas de cuantización extrema: la ficha incluye métricas de degradación (KL ~0,045, ~0,01 nats por token), por lo que es un caso de estudio útil para medir el impacto de W4A8 en la calidad de imagen generada.
- Generación de ilustraciones y material visual para experimentos académicos: con una licencia limitada a investigación y evaluación, encaja en proyectos docentes o papers que necesiten un generador local sin dependencia de APIs externas.
- Pruebas de rendimiento y benchmarking de hardware: el tiempo de generación publicado (~293 s para 1024² en una RTX 5060 Ti de 16 GB) permite calibrar expectativas de latencia en GPUs de gama media y comparar con alternativas.
- Desarrollo de nodos y herramientas para ComfyUI: el repositorio ComfyUI-Nemotron-Image es el destino de esta conversión, de modo que sirve para validar la integración, el manejo del tokenizador embebido y la decodificación con grafos CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas de fidelidad de la cuantización y de latencia:

| Metrica | Valor |
|---|---|
| Degradacion por token de imagen (W4A8 vs. fp8) | ~0,01 nats |
| Divergencia KL (W4A8 vs. fp8) | ~0,045 |
| Tiempo de generacion 1024² en RTX 5060 Ti 16 GB | ~293 s |

## Requisitos de hardware

- VRAM estimada: el generador ocupa 24,4 GB en disco; con los expertos en W4A8 y el resto en bf16, la inferencia cabe en GPUs de 16 GB según la medición del autor, aunque no se detalla el pico exacto de VRAM. El VAE añade 1,2 GB.
- GPU recomendadas: RTX 5060 Ti de 16 GB verificada por el autor; previsiblemente también RTX 4080/4090, RTX 5080/5090 y GPUs profesionales (A100, H100) con margen amplio.
- Cabe en GPU de consumo: sí, al menos en modelos con 16 GB de VRAM como la RTX 5060 Ti.
- Opciones de despliegue: ComfyUI con los nodos ComfyUI-Nemotron-Image y decodificación por grafos CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~293 s por imagen de 1024² en RTX 5060 Ti 16 GB; no se han publicado datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B (esta conversion) | 30B totales / 3B activos | Autorregresivo MoE + Mamba, tokenizador L24SQ | no disponible | NVIDIA License (no comercial) | Hugging Face, ComfyUI |
| nvidia/Nemotron-Labs-Image-30B-A3B (original) | 30B totales / 3B activos | Autorregresivo MoE + Mamba | no disponible | NVIDIA License (no comercial) | Hugging Face |
| Modelos de difusion texto-a-imagen de gran tamano (p. ej. FLUX, SD3) | no disponible en la informacion proporcionada | Difusion (UNet o transformer) | no disponible | varian segun modelo | no disponible |

No se dispone de datos de rendimiento comparativo entre esta conversión y modelos de difusión de propósito similar en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la NVIDIA License limita el uso a investigación o evaluación; queda excluido el uso comercial sin licencia adicional de NVIDIA.
- La cuantización W4A8 introduce una degradación medible (~0,01 nats por token, KL ~0,045), por lo que la calidad no es idéntica al modelo original en bf16 o fp8.
- El relleno con ceros de las dimensiones K de los expertos (2688→2816, 1856→2048) es una modificación estructural que puede afectar a la compatibilidad con otras herramientas distintas de los nodos ComfyUI-Nemotron-Image.
- Se ha eliminado la cabeza `decoder.distill_mlp`; cualquier flujo que dependa de ella no funcionará con este checkpoint.
- No hay información sobre sesgos, tasas de alucinación visual ni idiomas soportados en el prompt.
- Latencia elevada en GPUs de consumo (~293 s por imagen de 1024² en RTX 5060 Ti), poco adecuada para aplicaciones interactivas en tiempo real.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026, por lo que carece de validación comunitaria amplia.
- No se documentan opciones de despliegue fuera de ComfyUI, lo que limita su uso en servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paralaif/Nemotron-Labs-Image-30B-A3B-comfy-w4a8
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Nodos ComfyUI: https://github.com/quinteroac/ComfyUI-Nemotron-Image
