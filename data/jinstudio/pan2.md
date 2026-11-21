# Jinstudio/PAN2

## Resumen

PAN 2 es un modelo generativo de vídeo desarrollado por el Institute of Foundation Models (IFM) de la Universidad MBZUAI, concebido como un "modelo del mundo" (world model) de propósito general. Su función es simular cómo cambiará el mundo en respuesta a acciones descritas en lenguaje natural: dada una observación inicial (opcionalmente una imagen más texto) y una descripción textual de las acciones, genera un vídeo de hasta 20 segundos que representa el estado futuro resultante. Esto habilita el razonamiento simulado (simulative reasoning), en el que un agente puede imaginar las consecuencias de sus planes candidatos antes de elegir uno.

Arquitectónicamente sigue la propuesta Generative Latent Prediction (GLP) formalizada en el artículo "Critique of World Models" (arXiv:2507.05169), que combina un modelo de lenguaje como backbone de razonamiento conceptual con un modelo de difusión latente como backbone de razonamiento perceptivo. El componente de difusión es un transformer MMDiT de 29.202 millones de parámetros entrenado desde cero sobre cientos de millones de vídeos anotados, que predice los latentes de vídeo condicionados por una descripción estructurada del siguiente estado del mundo. Un VAE de Wan 2.2 decodifica esos latentes a píxeles a 704x1248 y 24 fps.

El modelo es relevante porque separa explícitamente la planificación simbólica del rendering perceptivo, lo que permite verificar cada predicción contra metraje real y usar el simulador como componente de un bucle agéntico. Se distribuye con licencia Apache 2.0, pesos en safetensors en formato diffusers y soporte en Diffusers y vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generative Latent Prediction (GLP): LLM de razonamiento conceptual + MMDiT de difusión latente (backbone perceptivo) + VAE Wan 2.2 |
| Parámetros totales | 29.201.996.992 (~29,2 B) en el backbone de difusión |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout diffusers, `PAN2Transformer3DModel`) |

## Arquitectura y entrenamiento

PAN 2 implementa la arquitectura GLP descrita en "Critique of World Models". El backbone de razonamiento conceptual es un modelo de lenguaje (el text encoder congelado es Qwen3.5-9B) que recibe la observación y las acciones solicitadas y escribe el siguiente estado del mundo como una descripción estructurada y anclada temporalmente: eventos, acciones con marca de tiempo ligadas a actores y movimiento de cámara. Ese texto estructurado se mapea mediante el text encoder congelado a las características de condicionamiento que consume el modelo de difusión.

El backbone perceptivo es un MMDiT de 29 B parámetros entrenado desde cero sobre cientos de millones de vídeos anotados en ese mismo formato estructurado. Predice los detalles perceptivos que la descripción deja abiertos, es decir, los latentes de vídeo que materializan el estado, condicionados por dicha descripción y por el latente VAE de la imagen de partida. El VAE de Wan 2.2 decodifica los latentes a vídeo a 704x1248 y 24 fps, con una duración de hasta 20 segundos. No se especifican en la información disponible detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video, `t2v`).
- Generación de vídeo a partir de una imagen inicial (image-to-video, `i2v`), usando el primer fotograma como condición.
- Generación conjunta imagen-texto-a-vídeo (image-text-to-video), el pipeline declarado en Hugging Face.
- Simulación de estados futuros del mundo condicionada por acciones descritas en lenguaje natural, con descripciones estructuradas de eventos, actores y cámara.
- Razonamiento simulado: un agente puede simular los resultados de planes candidatos y seleccionar el mejor.
- Control de movimiento de cámara mediante la descripción estructurada.
- Salida de vídeo de hasta 20 segundos a 704x1248 y 24 fps.
- Soporte de prompts negativos estructurados en los ejemplos de inferencia.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Planificación de agentes robóticos: el agente describe sus acciones candidatas en texto, PAN 2 simula cada resultado como vídeo y el planificador elige la acción cuyo desenlace simulado es preferible, aprovechando la separación entre razonamiento conceptual y perceptivo.
- Previsualización de escenas para producción audiovisual: a partir de un fotograma de referencia y una descripción de acciones y movimiento de cámara, se generan clips de hasta 20 segundos para validar blocking y continuidad antes del rodaje.
- Validación de guiones y storyboards: el equipo convierte descripciones estructuradas de eventos en vídeo para comprobar coherencia temporal y espacial de una secuencia.
- Simulación de entornos para entrenamiento de políticas: se generan trayectorias sintéticas condicionadas por acciones para aumentar datos de entrenamiento de modelos de control.
- Prototipado rápido de videojuegos y experiencias interactivas: generación de cinemáticas o transiciones de estado a partir de texto e imagen inicial.
- Investigación en modelos del mundo: banco de pruebas para evaluar la fidelidad de la predicción latente comparando el vídeo simulado con metraje real, gracias a que la salida es inspeccionable visualmente.
- Generación de material de demostración para documentación técnica: clips image-to-video a partir de capturas de un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint de difusión tiene 29,2 B parámetros en BF16, lo que supone aproximadamente 58 GB de pesos en memoria, además del text encoder Qwen3.5-9B y el VAE de Wan 2.2.
- Cada worker de `generate.py` mantiene el modelo completo de 29 B en una GPU; el script lanza un worker por GPU y reparte los prompts.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, se requiere al menos una GPU con 80 GB (A100/H100) para BF16, o configuraciones multi-GPU con un worker por dispositivo.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB) en BF16 sin cuantización, y no se documentan opciones de cuantización en la información disponible.
- Despliegue: Diffusers (pipeline `pan2`), vLLM (recetas oficiales) y el `generate.py` del repositorio con `inference/inference.sh` o `sbatch`.
- Entorno de referencia: PyTorch 2.12.1 con CUDA 13.2, flash-attn-4 y quack-kernels; Python 3.14.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAN 2 (IFM/MBZUAI) | 29,2 B (MMDiT) | vídeo de hasta 20 s a 704x1248, 24 fps | t2v, i2v, world simulation | Apache 2.0 | Hugging Face, Diffusers, vLLM |
| Wan 2.2 (Alibaba) | no disponible (el VAE usado es el de Wan2.2-TI2V-5B) | no disponible | text/image-to-video | no disponible en esta información | Hugging Face, Diffusers |
| Alternativas de difusión de vídeo de escala similar | no disponible | no disponible | generación de vídeo | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; los prompts en otros idiomas pueden degradar la calidad de la descripción estructurada y, por tanto, del vídeo.
- Al ser un modelo generativo de difusión, puede producir contenido visualmente plausible pero inconsistente con la física real; la simulación no garantiza fidelidad física.
- Riesgo de alucinación visual: detalles no especificados en la descripción estructurada se rellenan de forma estocástica.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar el fichero LICENSE del repositorio y las licencias de los componentes congelados (Qwen3.5-9B y Wan 2.2 VAE), que se distribuyen por separado y pueden tener términos propios.
- Requisitos de memoria elevados: 29 B parámetros en BF16 exigen GPUs de 80 GB o despliegues multi-GPU; no hay cuantizaciones publicadas.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La duración máxima de 20 segundos limita escenarios que requieran horizontes temporales largos.
- El pipeline de conversión de checkpoint y la instalación de dependencias (flash-attn-4, quack-kernels, CUDA 13.2) son pasos adicionales que pueden introducir fricción en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Jinstudio/PAN2
- Repositorio original en Hugging Face: https://huggingface.co/IFM/PAN2
- GitHub: https://github.com/ifm-ai/PAN2
- Documentación Diffusers del pipeline: https://huggingface.co/docs/diffusers/main/en/api/pipelines/pan2
- Receta vLLM: https://recipes.vllm.ai/IFM/PAN2
- Documentación del repositorio: https://github.com/ifm-ai/PAN2/blob/main/README.md
- Licencia: https://github.com/ifm-ai/PAN2/blob/main/LICENSE
- Artículo "Critique of World Models": https://arxiv.org/abs/2507.05169
- Text encoder Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- VAE Wan 2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
