# kaiariel/sd-v1-4-lora-oldbookillustrations

## Resumen

El modelo `kaiariel/sd-v1-4-lora-oldbookillustrations` es un adaptador LoRA para la U-Net de Stable Diffusion v1.4, desarrollado por el usuario kaiariel como entrega final del Módulo 7 (Modelos de Generación de Imagen) del Máster en IA, Cloud Computing y DevOps de Pontia. Su función es sesgar la generación de imágenes hacia un estilo de grabado o ilustración de libro antiguo sin necesidad de especificarlo en el prompt, partiendo de un conjunto de 1500 ilustraciones del dataset `gigant/oldbookillustrations`.

Se trata de un adaptador de bajo rango (r=16, alpha=16) aplicado exclusivamente a las proyecciones de atención (`to_q`, `to_k`, `to_v`, `to_out.0`) del transformer de difusión, entrenado en una única GPU T4 de Google Colab durante 16 minutos. No modifica el codificador de texto ni el VAE, por lo que hereda todas las capacidades y limitaciones del modelo base.

Su relevancia es acotada: es un ejemplo didáctico de ajuste fino eficiente con LoRA sobre difusión, útil para quien quiera replicar el flujo de entrenamiento o incorporar un estilo visual concreto en un pipeline de Stable Diffusion 1.4, pero no constituye un modelo de propósito general ni compite con modelos de difusión modernos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre U-Net de Stable Diffusion v1.4 (transformer de difusión latente) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base SD v1.4 tiene ~860 M en U-Net) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; ventana de texto del codificador CLIP del modelo base, 77 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en precisión de entrenamiento; el modelo base admite fp16/fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | no disponibles |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors / diffusers (adaptador LoRA cargable con `load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 insertado en las capas de atención de la U-Net de `CompVis/stable-diffusion-v1-4`, concretamente en `to_q`, `to_k`, `to_v` y `to_out.0`. El modelo base es un transformer de difusión latente que opera sobre un autoencoder VAE y condiciona la generación mediante un codificador de texto CLIP; el LoRA no altera ni el VAE ni el codificador de texto, solo las matrices de atención de la U-Net.

El entrenamiento utilizó 1500 imágenes del dataset `gigant/oldbookillustrations` (columnas `1600px` e `info_alt`), barajadas con semilla 42 y descartando las de proporción superior a 1.8. El preprocesado consistió en redimensionar el lado corto a 512 px y aplicar recorte central de 512×512. Se entrenó durante 3 épocas con tamaño de lote 4, tasa de aprendizaje 0.0001, optimizador AdamW y precisión mixta fp16, en una NVIDIA T4 de Google Colab con un tiempo total de 16 minutos. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un adaptador de difusión.

## Capacidades

- Generación de imágenes texto-a-imagen en estilo de grabado o ilustración de libro antiguo por defecto, sin necesidad de indicarlo en el prompt.
- Compatibilidad con el pipeline `StableDiffusionPipeline` de la librería `diffusers` mediante `load_lora_weights`.
- Posibilidad de combinarse con otros LoRA o con prompts de estilo para modular el resultado.
- Control de la intensidad del estilo mediante el parámetro `scale` de `pipe.set_adapters` (no documentado en la model card, pero estándar en `diffusers`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.
- Capacidades multilingües: no disponibles; el condicionamiento textual depende del codificador CLIP del modelo base.

## Casos de uso

- Ilustración editorial de estilo clásico: generar imágenes con estética de grabado decimonónico para portadas, interiores de libros o revistas, aprovechando que el estilo se aplica por defecto sin prompts largos.
- Prototipado de material gráfico para proyectos de humanidades digitales: producir ilustraciones coherentes con corpus históricos o ediciones facsímiles.
- Generación de ilustraciones para juegos de rol o narrativa ambientada en épocas pasadas, donde se busca una estética de libro antiguo consistente.
- Creación de assets para blogs o publicaciones con temática histórica o literaria, sustituyendo bancos de imágenes por generación controlada.
- Experimentación docente en ajuste fino de modelos de difusión: el adaptador sirve como ejemplo reproducible de entrenamiento LoRA con un dataset pequeño y hardware consumer.
- Pruebas de composición de LoRA: al ser un adaptador ligero, puede combinarse con otros LoRA de estilo para estudiar interacciones y pesos en pipelines de `diffusers`.
- Generación de referencias visuales para artistas que trabajen técnicas de grabado, como punto de partida para bocetos.

## Benchmarks y rendimiento

La model card reporta métricas medidas con CLIP (`openai/clip-vit-base-patch32`), promediadas sobre los prompts de evaluación del autor:

| Modelo | Fidelidad al prompt | Probabilidad de estilo antiguo |
|---|---:|---:|
| Base (SD v1.4) | 30.92 | 0.00 |
| LoRA r=4 | 30.92 | 0.06 |
| LoRA r=16 | 31.40 | 0.11 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, FID, CLIP score sobre benchmarks públicos) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa muy poco espacio (el repositorio reporta 0.0 GB), pero requiere cargar el modelo base `CompVis/stable-diffusion-v1-4` completo para inferencia.
- VRAM estimada para inferencia en fp16: en torno a 4-6 GB para el pipeline completo a 512×512, dependiendo de la implementación y del uso de `attention slicing` o `xformers`.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4060, RTX 4090); también A100, H100 o T4 para despliegues en servidor.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en fp16; con cuantizaciones del modelo base (por ejemplo, fp16 con offload a CPU) puede ejecutarse en GPUs con 4 GB.
- Opciones de despliegue: `diffusers` (recomendado, tal como muestra la model card), así como herramientas que acepten LoRA de SD 1.4 (por ejemplo, A1111/Forge, ComfyUI, InvokeAI). No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, que no están orientados a difusión.
- Latencia y throughput: no disponibles. El entrenamiento se completó en 16 minutos en una T4, lo que da una idea del bajo coste de ajuste, pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kaiariel/sd-v1-4-lora-oldbookillustrations | SD v1.4 | LoRA de estilo | no disponible (adaptador r=16) | 77 tokens (CLIP del base) | creativeml-openrail-m | Hugging Face |
| kaiariel/sd-v1-4-oldbookillustrations-fusionado | SD v1.4 | Modelo fusionado | ~860 M (U-Net) | 77 tokens | creativeml-openrail-m | Hugging Face |
| LoRA r=4 del mismo autor | SD v1.4 | LoRA de estilo | no disponible | 77 tokens | creativeml-openrail-m | Reportado en model card |
| SD v1.4 base | — | Difusión texto-a-imagen | ~860 M (U-Net) | 77 tokens | creativeml-openrail-m | Hugging Face |

Los tres primeros comparten base y licencia; las diferencias se limitan al rango del adaptador y a la fusión de pesos. No se dispone de comparación con LoRA de estilo de terceros en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado sobre un dataset pequeño (1500 imágenes) y un único estilo, por lo que puede sobreajustar y producir resultados poco variados o artefactos en composiciones alejadas del corpus.
- La fidelidad al prompt medida con CLIP apenas mejora respecto al base (31.40 frente a 30.92), y la probabilidad de estilo antiguo es baja (0.11); el efecto de estilo es moderado, no dominante.
- No se documentan sesgos específicos, pero hereda los del modelo base SD v1.4 y los del dataset de ilustraciones antiguas, que puede reflejar estereotipos históricos de representación.
- Riesgo de alucinación visual y de generación de contenido incoherente, habitual en modelos de difusión de esta generación.
- El condicionamiento textual está limitado a 77 tokens de CLIP y a los idiomas cubiertos por el codificador del modelo base; no se especifican idiomas soportados.
- Licencia `creativeml-openrail-m`: permite uso comercial con restricciones (prohibición de usos ilícitos, difamatorios o de vigilancia no consentida, entre otros); conviene revisar los términos completos antes de producción.
- El repositorio reporta 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación externa ni de mantenimiento posterior.
- El modelo se publicó como entrega académica, sin garantías de soporte ni actualizaciones.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/kaiariel/sd-v1-4-lora-oldbookillustrations
- Versión fusionada: https://huggingface.co/kaiariel/sd-v1-4-oldbookillustrations-fusionado
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Modelo base: https://huggingface.co/CompVis/stable-diffusion-v1-4
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Librería diffusers: https://github.com/huggingface/diffusers
