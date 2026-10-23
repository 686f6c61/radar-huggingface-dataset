# EnzinoGenie/z-image-turbo-8bit

## Resumen

Z-Image-Turbo 8-bit es una redistribución cuantizada de Tongyi-MAI/Z-Image-Turbo, un modelo de difusión texto-a-imagen. La publica EnzinoGenie con el objetivo de reducir el repositorio de unos 31 GB a unos 11 GB y permitir su carga en GPUs de 16 GB, como la T4 gratuita de Colab. No es un modelo nuevo ni un reentrenamiento: mantiene el transformer, el VAE, el scheduler y el tokenizer del original, y cuantiza a 8 bits el transformer y el codificador de texto Qwen3 mediante bitsandbytes y `PipelineQuantizationConfig` de diffusers.

El modelo declara 6.156.762.240 parámetros y se distribuye en safetensors bajo licencia Apache 2.0. La inferencia documentada usa `ZImagePipeline` con `torch.float16`, resoluciones como 1088x1920, 9 pasos y `guidance_scale=0.0`. En una T4, el autor reporta unos 45 s de carga y entre 65 y 95 s por imagen. Es relevante para quien quiera probar Z-Image-Turbo en hardware modesto, aunque requiere un hook de recorte en fp16 para evitar desbordamientos en dos proyecciones del transformer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión texto-a-imagen con transformer, VAE y codificador de texto Qwen3; detalles internos no disponibles |
| Parámetros totales | 6.156.762.240 (6,16 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits con bitsandbytes (`load_in_8bit`); el original no se especifica |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible identifica un modelo de difusión texto-a-imagen con transformer, VAE, scheduler y codificador de texto Qwen3. Esta copia no altera el VAE, el scheduler ni el tokenizer; cuantiza el transformer y el codificador Qwen3 a 8 bits con bitsandbytes y los guarda con `save_pretrained` a través de `PipelineQuantizationConfig` de diffusers. No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO; al ser una copia cuantizada, no se ha reentrenado.

La innovación práctica es la reducción de memoria y el workaround de recorte en fp16 para T4. En fp16, algunas activaciones superan el rango y la salida se convierte en ruido; el autor indica que las salidas de `attention.to_out.0` y `feed_forward.w2` se deben limitar a ±65.000 mediante un forward hook para obtener resultados similares a bfloat16.

## Capacidades

- Generación de imágenes a partir de prompts de texto.
- Resoluciones verticales como 1088x1920; no se documentan otras resoluciones.
- Inferencia en pocos pasos: 9 pasos con `guidance_scale=0.0` en el ejemplo del autor.
- Integración con diffusers mediante `ZImagePipeline`.
- Carga cuantizada a 8 bits para reducir el espacio de pesos y la VRAM necesaria.
- No se documentan tool calling, function calling ni capacidades de agente.
- No se documentan capacidades multilingües ni idiomas soportados.
- No se documentan modos especiales como thinking, visión, audio o generación de texto.

## Casos de uso

- Prototipado en Colab T4: cargar el pipeline en una GPU de 16 GB y generar imágenes de 1088x1920 en 65-95 s por imagen, suficiente para pruebas iterativas y demos.
- Generación de imágenes verticales para maquetas de aplicaciones o redes sociales: el ejemplo documentado usa 1088x1920, 9 pasos y `guidance_scale=0.0`, adecuado para assets de prueba.
- Evaluación de cuantización 8-bit en diffusers: comparar la salida de esta copia con el modelo original y medir el impacto cualitativo de la cuantización en el transformer y el codificador Qwen3.
- Docencia y formación: ejecutar un modelo texto-a-imagen en hardware gratuito o de gama media, con tiempos de carga y generación conocidos.
- Generación de storyboards y pruebas de concepto: producir imágenes de referencia para equipos de diseño sin necesidad de GPUs de 24 GB o más.
- Integración en scripts de Python con diffusers: validar la carga de `ZImagePipeline`, la inferencia y el guardado de imágenes en un pipeline propio.
- Investigación de estabilidad numérica en fp16: probar el hook de recorte en `attention.to_out.0` y `feed_forward.w2` y comparar con bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos cuantizados: repositorio de 10,8 GB; el autor indica unos 11 GB frente a los 31 GB del original.
- VRAM estimada: encaja en una GPU de 16 GB según el autor; el margen es ajustado y no se documenta funcionamiento en GPUs de 12 GB.
- GPU validadas: T4 de 16 GB en Colab gratuita. Como orientación, una RTX 4090 de 24 GB o una A100/H100 ofrecen más margen, pero no hay datos de rendimiento publicados en ellas.
- GPU de consumo: sí en T4; en RTX 4090 es previsible que quepa, aunque el autor no proporciona mediciones.
- Despliegue: diffusers con `ZImagePipeline` y bitsandbytes. No se documentan vLLM, TGI, llama.cpp, Ollama ni ComfyUI para este modelo.
- Latencia en T4, 1088x1920 y 9 pasos: 65-95 s por imagen; carga del pipeline desde disco local: unos 45 s.
- Throughput: no disponible.
- Precisión: fp16 en T4 requiere hooks de recorte; bfloat16 no es rápido en T4 según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño del repositorio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EnzinoGenie/z-image-turbo-8bit | 6,16 B | No disponible | 8 bits con bitsandbytes | 10,8 GB | Apache 2.0 | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | No disponible | No disponible | No disponible | 31 GB | Apache 2.0 | Hugging Face |
| Otras variantes cuantizadas de Z-Image-Turbo | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No hay datos de rendimiento comparativo entre esta copia y el original. La única comparación cuantitativa disponible es el tamaño del repositorio y el requisito de memoria: aproximadamente 11 GB frente a 31 GB.

## Limitaciones y advertencias

- Copia no oficial: no está afiliada ni endorsada por Tongyi-MAI.
- La cuantización a 8 bits puede degradar la fidelidad de las imágenes frente al original; no se proporciona una evaluación cuantitativa.
- En fp16 sobre T4 se producen desbordamientos en `attention.to_out.0` y `feed_forward.w2`; sin el hook de recorte, la salida puede ser ruido.
- No se documentan idiomas soportados; el comportamiento multilingüe es desconocido.
- No se documentan sesgos, composición del dataset de entrenamiento ni evaluaciones de seguridad.
- Riesgo de generar imágenes inexactas, estereotipadas o no solicitadas; no se documentan filtros de seguridad.
- La licencia indicada es Apache 2.0, pero no se detallan licencias separadas de componentes como el codificador Qwen3 o el VAE; conviene verificarlas antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es muy limitada.
- Los ajustes documentados se limitan a 1088x1920, 9 pasos y `guidance_scale=0.0`; otros valores no están evaluados.
- No es adecuado para tool calling, function calling ni flujos de agentes.

## Enlaces

- [EnzinoGenie/z-image-turbo-8bit en Hugging Face](https://huggingface.co/EnzinoGenie/z-image-turbo-8bit)
- [Tongyi-MAI/Z-Image-Turbo en Hugging Face](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
- No se proporcionan papers, blogs, repositorios adicionales ni demos en la información disponible.
