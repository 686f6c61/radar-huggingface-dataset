# JreamH/CGMLLM-4B-i2o

## Resumen

CG-MLLM 4B image-to-3D es un modelo multimodal de lenguaje (MLLM) especializado en generación de mallas 3D a partir de una imagen. Lo desarrollan Junming Huang, Chi Wang, Letian Li, Guangkai Xu, Donglin Huang, Hao Chen, Qiang Dai y Weiwei Xu, con afiliaciones a la Universidad de Zhejiang y LIGHTSPEED, y se presentó en ICML 2026 bajo el título "CG-MLLM: Captioning and Generating 3D Content via Multi-modal Large Language Models".

El modelo combina un backbone visión-lenguaje Qwen3-VL-4B-Instruct con el VAE de forma de Hunyuan3D-2.1, que actúa como tokenizador latente 3D. Sobre esa arquitectura se ha realizado un entrenamiento especializado de image-to-3D sobre HY3D-Bench, de modo que el modelo aprende a predecir tokens latentes 3D condicionados por la imagen de entrada en lugar de generar texto libre.

Es relevante porque traslada el paradigma de los MLLM al dominio de la generación 3D: en lugar de un pipeline discriminativo o de difusión específico, aprovecha el razonamiento y la comprensión visual de un LLM multimodal para producir geometría. Este checkpoint concreto es la variante de 4B parámetros dedicada exclusivamente a image-to-3D; no es el checkpoint multi-tarea v0.1 (basado en Qwen3-VL-2B), que se publica por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM basado en Qwen3-VL-4B-Instruct con VAE latente 3D de Hunyuan3D-2.1 |
| Parametros totales | 4B (backbone vision-lenguaje) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`ema.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es híbrida: un transformer multimodal Qwen3-VL-4B-Instruct procesa la imagen de entrada y genera una secuencia de tokens latentes 3D que un VAE de forma (Hunyuan3D-2.1) decodifica a malla. El modelo se apoya en el trabajo previo de BAGEL (ByteDance-Seed) para el esquema de modelado multimodal, según los agradecimientos de la model card.

El entrenamiento es un ajuste especializado de image-to-3D sobre el conjunto HY3D-Bench, partiendo de Qwen3-VL-4B-Instruct. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) en la información disponible.

## Capacidades

- Generación de mallas 3D a partir de una única imagen (image-to-3D), mediante decodificación de tokens latentes 3D.
- Comprensión visual heredada del backbone Qwen3-VL-4B-Instruct (interpretación de la imagen de entrada).
- Generación de contenido 3D en formato de malla a través del VAE de Hunyuan3D-2.1.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Capacidades especiales: tokenización latente 3D, especialización en una única tarea (no multi-tarea en este checkpoint).

## Casos de uso

- Prototipado rápido de assets 3D para videojuegos: a partir de un concept art o una foto de referencia, el modelo genera una malla inicial que el artista puede retocar en Blender, reduciendo el tiempo de modelado desde cero.
- Catálogos de e-commerce con vista 3D: convertir fotografías de producto en mallas 3D para visores web interactivos, aprovechando que el modelo acepta una sola imagen como entrada.
- Reconstrucción de objetos para realidad aumentada: generar mallas ligeras a partir de fotos de objetos físicos para su superposición en escenas AR.
- Diseño industrial y arquitectura: obtener borradores geométricos 3D desde bocetos o renders de referencia para iterar conceptualmente antes del modelado CAD.
- Impresión 3D: producir mallas iniciales a partir de imágenes de referencia que después se reparan y optimizan para fabricación aditiva.
- Investigación en generación 3D: servir como baseline reproducible (checkpoint público con paper ICML y código en GitHub) para comparar enfoques de MLLM frente a difusión 3D en tareas image-to-3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone es de 4B parámetros y el repo ocupa 33,9 GB, por lo que se requiere una GPU con memoria suficiente para el backbone más el decodificador VAE 3D.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del backbone, se espera que requiera GPUs de datacenter o gama alta (A100, H100) para inferencia cómoda, aunque no se confirma.
- ¿Cabe en GPU de consumo? no disponible; no se documentan requisitos ni cuantizaciones para RTX 4090 u otras consumer.
- Opciones de despliegue: las instrucciones de ejecución están en el repositorio de GitHub (https://github.com/dreaming-huang/CG-MLLM); no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CG-MLLM-4B-i2o | 4B | Image-to-3D | no disponible | Apache-2.0 | Hugging Face |
| CG-MLLM v0.1 (multi-tarea) | 2B | Multi-tarea 3D | no disponible | no disponible | Hugging Face (JreamH/CGMLLM) |
| Qwen3-VL-4B-Instruct (backbone) | 4B | Visión-lenguaje | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea (image-to-3D); no debe usarse como checkpoint multi-tarea, función reservada a la variante v0.1 de 2B.
- Idioma limitado al inglés según la model card.
- No se documentan sesgos conocidos ni tasas de alucinación; al generar geometría, pueden aparecer mallas incompletas o artefactos no medidos en la información disponible.
- Licencia Apache-2.0 para el modelo, pero los componentes base (Qwen3-VL, BAGEL, Hunyuan3D-2.1) tienen sus propias licencias que deben respetarse en uso comercial.
- El repositorio ocupa 33,9 GB, lo que implica requisitos de almacenamiento y memoria considerables para el despliegue.
- No se documentan requisitos de hardware, cuantizaciones ni latencias, lo que dificulta planificar un despliegue en producción.
- Fecha de creación del repositorio (2026-10-03) y pocas descargas (0) y likes (1): ecosistema aún muy incipiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JreamH/CGMLLM-4B-i2o
- Árbol de archivos: https://huggingface.co/JreamH/CGMLLM-4B-i2o/tree/main
- Checkpoint multi-tarea v0.1: https://huggingface.co/JreamH/CGMLLM
- Código: https://github.com/dreaming-huang/CG-MLLM
- Paper (arXiv): https://arxiv.org/abs/2601.21798
- Hugging Face Papers: https://huggingface.co/papers/2601.21798
- Página del proyecto: https://cg-mllm.jream.top/
- Póster ICML: https://icml.cc/virtual/2026/poster/63909
- Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- BAGEL: https://github.com/ByteDance-Seed/Bagel
- Hunyuan3D-2.1: https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1
