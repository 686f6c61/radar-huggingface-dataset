# IFM/PAN2

## Resumen

PAN 2 es un modelo del mundo (world model) de propósito general desarrollado por el Institute of Foundation Models (IFM) de la Universidad MBZUAI. Su función es simular cómo cambiará el mundo en respuesta a acciones descritas en texto: dada una observación actual (una imagen opcional más una descripción textual) y un conjunto de acciones, genera un vídeo de hasta 20 segundos que representa el estado futuro resultante. Esto habilita el razonamiento simulado (simulative reasoning), en el que un agente imagina las consecuencias de sus planes candidatos antes de elegir uno.

Técnicamente, PAN 2 sigue la arquitectura Generative Latent Prediction (GLP) formalizada en el artículo "Critique of World Models" (arXiv:2507.05169) y combina razonamiento conceptual mediante un modelo de lenguaje con razonamiento perceptivo mediante un modelo de difusión latente. El backbone perceptivo es un MMDiT de 29.201.996.992 parámetros (aproximadamente 29B) entrenado desde cero sobre cientos de millones de vídeos anotados con descripciones estructuradas de estado del mundo.

El modelo se publica bajo licencia Apache 2.0 con pesos en formato safetensors (86,2 GB de repositorio) y es compatible con Diffusers y vLLM, además de incluir scripts propios de inferencia. Es relevante porque aborda la simulación de entornos como primitiva de razonamiento para agentes, un área donde la mayoría de los modelos generativos de vídeo no ofrecen condicionamiento explícito por acciones ni estructura temporal verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generative Latent Prediction (GLP): MMDiT (diffusion transformer) como backbone perceptivo, condicionado por un LLM de razonamiento conceptual y un codificador de texto congelado |
| Parámetros totales | 29.201.996.992 (backbone de difusión) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en términos de tokens; salida de vídeo de hasta 20 segundos |
| Tipos de cuantización | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout Diffusers, `PAN2Transformer3DModel`); conversión a formato nativo mediante `scripts/convert_checkpoint.py` |

Otros datos técnicos: resolución de salida de 704x1248 a 24 fps, VAE de Wan 2.2 (`Wan-AI/Wan2.2-TI2V-5B-Diffusers`) y codificador de texto congelado Qwen3.5-9B (`Qwen/Qwen3.5-9B`).

## Arquitectura y entrenamiento

PAN 2 se estructura en dos backbones acoplados. El primero es un modelo de lenguaje que actúa como razonador conceptual: procesa la observación y las acciones solicitadas y escribe el siguiente estado del mundo como una descripción estructurada y anclada temporalmente, con eventos, acciones cronometradas ligadas a actores y movimiento de cámara. Un codificador de texto congelado (Qwen3.5-9B) transforma esa descripción en las características de condicionamiento. El segundo backbone es un MMDiT de 29B parámetros, entrenado desde cero sobre cientos de millones de vídeos anotados en ese mismo formato, que predice el detalle perceptivo que la descripción deja abierto: los latentes de vídeo que materializan el estado, condicionados por la descripción y por el latente VAE de la imagen inicial. El decodificador VAE de Wan 2.2 renderiza los latentes predichos como la siguiente observación, de forma que cada predicción puede visualizarse y contrastarse con metraje real.

El checkpoint de difusión es único y sirve tanto para text-to-video como para image-to-video. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video, `t2v`) con condicionamiento estructurado de estado del mundo.
- Generación de vídeo a partir de imagen y texto (image-to-video, `i2v`), usando el primer fotograma como condición.
- Simulación de acciones: dado un estado actual y acciones descritas en texto, predice el estado futuro como vídeo de hasta 20 segundos.
- Razonamiento conceptual mediante LLM: produce descripciones estructuradas con eventos, acciones cronometradas por actor y movimiento de cámara.
- Razonamiento perceptivo: el MMDiT completa el detalle visual que la descripción deja indeterminado.
- Soporte de prompts negativos estructurados en los ejemplos de inferencia incluidos.
- Salida a 704x1248 y 24 fps.
- Soporte en Diffusers y vLLM, además del script `generate.py` del repositorio.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, modo thinking y otras capacidades de agente: no disponibles como tales; el modelo se integra en bucles de agente externos como simulador.

## Casos de uso

- Razonamiento simulado en agentes autónomos: un agente puede generar con PAN 2 una simulación de cada plan candidato (por ejemplo, distintas trayectorias de un robot o de un vehículo) y seleccionar la acción cuyo resultado simulado sea mejor antes de ejecutarla en el entorno real.
- Planificación robótica y verificación de políticas: dado un fotograma de la cámara del robot y una secuencia de acciones descrita en texto, el modelo produce un vídeo del resultado esperado que permite detectar colisiones o manipulaciones inviables antes del despliegue.
- Prototipado de escenarios en conducción autónoma: simulación de maniobras condicionadas por una imagen de la escena y una descripción de la acción, útil para generar contraejemplos y evaluar percepciones en casos límite.
- Previsualización cinematográfica y de animación: generación de clips de hasta 20 segundos a 704x1248 y 24 fps a partir de una descripción estructurada con acciones cronometradas y movimiento de cámara, lo que permite iterar sobre el guion visual antes del render final.
- Investigación en modelos del mundo: el checkpoint sirve como base reproducible para estudiar la arquitectura GLP, comparar razonamiento conceptual frente a perceptivo y evaluar la fidelidad de las predicciones contra metraje real.
- Generación de datos sintéticos para entrenamiento: producción de vídeos condicionados por acciones para aumentar datasets de percepción o de imitación, con la ventaja de que la condición de entrada está estructurada y es auditable.
- Evaluación de la coherencia física de planes: comparación de la simulación con la observación real para detectar discrepancias entre el modelo y el entorno, como paso previo a la ejecución de una política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El backbone de difusión tiene 29B parámetros y el checkpoint se distribuye en BF16, lo que implica del orden de 58 GB solo para los pesos del transformer; a ello se suman el VAE de Wan 2.2 y el codificador de texto Qwen3.5-9B, que se descargan por separado.
- Cada worker de `generate.py` mantiene el modelo completo de 29B en una GPU, según la documentación de inferencia del repositorio; el despliegue multigpu se realiza lanzando un worker por GPU y repartiendo los prompts.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el tamaño en BF16 se requiere hardware de centro de datos con memoria muy amplia (A100/H100 de 80 GB o superiores). No se documenta soporte en GPU de consumo.
- Cuantizaciones para reducir VRAM: no disponibles en la información proporcionada.
- Opciones de despliegue: Diffusers (pipeline `pan2`), vLLM (receta en recipes.vllm.ai) y el script `generate.py` del repositorio, con soporte de `sbatch` para clústeres.
- Entorno: Python 3.14, PyTorch 2.12.1 con CUDA 13.2, flash-attn 4.0.0b29 y quack-kernels 0.6.4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Licencia | Disponibilidad | Enfoque |
|---|---|---|---|---|---|
| PAN 2 (IFM/MBZUAI) | 29B (backbone de difusión) | Vídeo de hasta 20 s, 704x1248 a 24 fps | Apache 2.0 | Hugging Face, Diffusers, vLLM | Modelo del mundo con condicionamiento por acciones y descripción estructurada |
| Wan 2.2 TI2V-5B (Alibaba) | 5B | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face, Diffusers | Generación de vídeo texto-imagen a vídeo; PAN 2 reutiliza su VAE |
| Modelos de difusión de vídeo de gran escala comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no permite establecer comparaciones cuantitativas de rendimiento con alternativas; los datos de la tabla se limitan a lo documentado.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés, lo que limita el condicionamiento en castellano u otras lenguas.
- Alucinación visual: al ser un modelo generativo, las simulaciones pueden producir resultados plausibles pero físicamente incorrectos; la propia model card recomienda contrastar cada predicción con metraje real.
- Fidelidad de la simulación: no se han publicado métricas de benchmarks ni evaluaciones cuantitativas en la información disponible, por lo que no puede afirmarse su precisión en dominios concretos.
- Duración y resolución acotadas: las salidas se limitan a 20 segundos a 704x1248 y 24 fps, insuficientes para simulaciones de mayor horizonte temporal.
- Dependencia de componentes externos: requiere descargar el codificador Qwen3.5-9B y el VAE de Wan 2.2, con sus propias licencias y requisitos de hardware.
- Coste de inferencia: cada worker necesita mantener el modelo de 29B completo en memoria, lo que encarece el despliegue y limita el escalado a clústeres multigpu.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; al entrenarse sobre cientos de millones de vídeos, es esperable que herede sesgos de representación del corpus, aunque no se cuantifican.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los componentes congelados (Qwen3.5-9B y Wan 2.2) en producción.
- Madurez: el modelo tiene un volumen reducido de descargas (10) y likes (11) en el momento de la consulta, y su librería (`pan`) es específica del proyecto, lo que implica menor ecosistema de herramientas en comparación con pipelines estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/PAN2
- Repositorio GitHub: https://github.com/ifm-ai/PAN2
- Documentación de Diffusers del pipeline PAN 2: https://huggingface.co/docs/diffusers/main/en/api/pipelines/pan2
- Receta de vLLM: https://recipes.vllm.ai/IFM/PAN2
- Documentación del repositorio: https://github.com/ifm-ai/PAN2/blob/main/README.md
- Licencia: https://github.com/ifm-ai/PAN2/blob/main/LICENSE
- Artículo "Critique of World Models": https://arxiv.org/abs/2507.05169
- Codificador de texto Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- VAE de Wan 2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
