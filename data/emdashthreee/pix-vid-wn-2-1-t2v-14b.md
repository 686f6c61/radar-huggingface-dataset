# emdashthreee/pix-vid-wn-2.1-t2v-14b

## Resumen

`emdashthreee/pix-vid-wn-2.1-t2v-14b` es un repositorio de HuggingFace que redistribuye los pesos del modelo **Wan2.1 T2V-14B**, un modelo de difusión texto-a-vídeo de 14.288.491.584 parámetros (≈14,3 B) desarrollado originalmente por **Wan-AI** (equipo vinculado a Alibaba, según los enlaces del propio repositorio). No se trata, por tanto, de un modelo nuevo: el autor del repo (`emdashthreee`) actúa como espejo, y la model card incluida es la de Wan2.1 con referencias cruzadas a los repositorios oficiales.

El modelo resuelve la generación de vídeo corto a partir de una descripción textual, con soporte de dos resoluciones (480P y 720P) y una particularidad diferencial frente a otros modelos abiertos de la misma categoría: es capaz de renderizar texto legible en chino e inglés dentro del propio vídeo. Incorpora un VAE propio (Wan-VAE) diseñado para codificar y decodificar vídeo 1080P preservando información temporal, lo que lo convierte en una base reutilizable también para imagen y otras tareas derivadas de la familia (I2V, edición de vídeo, texto-a-imagen, vídeo-a-audio).

Su relevancia radica en que la familia Wan2.1 se publicó bajo licencia Apache 2.0 con pesos abiertos, algo poco habitual en modelos de vídeo de esta escala, y en que el autor declara un rendimiento SOTA frente a modelos abiertos y soluciones comerciales. Conviene señalar que este repositorio concreto acumulaba 0 descargas y 0 likes en el momento de la consulta y que su fecha de creación registrada (2026-10-24) es posterior a la publicación original, lo que refuerza su carácter de réplica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión texto-a-vídeo con VAE dedicado (Wan-VAE); la model card no detalla la topología interna de la red de difusión |
| Parametros totales | 14.288.491.584 (≈14,3 B), dato real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No aplica (modelo de difusión); genera clips cortos a 480P y 720P |
| Tipos de cuantizacion | Pesos en safetensors (repo de 69,1 GB, compatible con bf16/fp16); variante fp8 `e4m3fn` distribuida por la comunidad en Civitai; GGUF no disponible en la información |
| Idiomas soportados | Inglés (en) y chino (zh), tanto en el prompt como en el texto renderizado dentro del vídeo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con layout compatible con `diffusers` |
| Tarea (pipeline) | `text-to-video` |
| Resoluciones | 480P y 720P |
| Pasos de inferencia por defecto | 10 (`num_inference_steps` declarado en la model card) |
| Tamaño del repositorio | 69,1 GB |

## Arquitectura y entrenamiento

Wan2.1 T2V-14B es un modelo de difusión para generación de vídeo: parte de ruido y lo denoisa condicionado por el prompt textual, con un número de pasos de inferencia configurable (10 por defecto en la model card). El componente técnico más destacado del que informa la documentación es **Wan-VAE**, un autoencoder variacional propio capaz de codificar y decodificar vídeo 1080P de longitud arbitraria conservando la información temporal, lo que lo hace utilizable como base tanto para vídeo como para imagen. La información disponible no especifica si el backbone de denoising es un Diffusion Transformer (DiT) puro, híbrido o de otra familia, ni el número de capas, dimensiones ocultas o mecanismos de atención empleados.

En cuanto a entrenamiento, la model card no publica el volumen de tokens, la composición del dataset, ni si hubo etapas de ajuste con RLHF/DPO o preferencias humanas. Sí se declara explícitamente que el modelo se entrenó para generar texto visual en chino e inglés, capacidad que el autor presenta como la primera de su clase en un modelo de vídeo abierto, y que existe una variante de 1.3 B pensada para GPUs de consumo (8,19 GB de VRAM, vídeo de 5 s a 480P en ~4 minutos en una RTX 4090 sin cuantización). No se han proporcionado detalles sobre el proceso de destilación, el scheduler utilizado ni técnicas de decodificación especulativa.

## Capacidades

- Generación de vídeo a partir de texto en resoluciones 480P y 720P.
- Generación de texto legible dentro del propio vídeo, en chino e inglés (rótulos, carteles, subtítulos integrados).
- Movimiento y dinámica visual significativos, según la descripción del autor.
- Codificación/decodificación de vídeo 1080P de cualquier longitud mediante Wan-VAE, reutilizable como base para otras tareas generativas.
- La familia Wan2.1 cubre además texto-a-imagen, imagen-a-vídeo, edición de vídeo y vídeo-a-audio, aunque este repositorio contiene únicamente el checkpoint T2V-14B.
- Soporte de inferencia multi-GPU en el código oficial de referencia.
- Soporte multilingüe limitado a en y zh, tanto en prompt como en texto renderizado.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente: no es un modelo de lenguaje, sino un modelo generativo de vídeo.

## Casos de uso

- **Generación de vídeo publicitario y de producto**: creación de clips cortos a 720P a partir de un brief textual, útil para pruebas de concepto y variantes creativas antes de producir en estudio. La resolución 720P y la dinámica de movimiento declarada lo hacen apto para piezas de redes sociales.
- **Rótulos y cartelería en vídeo**: al ser capaz de renderizar texto legible en inglés y chino, permite generar piezas con titulares integrados sin postproducción adicional, algo que la mayoría de modelos abiertos de vídeo no consigue de forma fiable.
- **Prototipado rápido en preproducción audiovisual**: storyboards animados y previsualizaciones de escenas para equipos de dirección, usando prompts descriptivos y 10 pasos de inferencia para iterar rápido.
- **Localización de contenido para mercados zh/en**: generación de variantes de un mismo vídeo con texto en chino o en inglés, orientadas a campañas en ambos mercados.
- **Generación de material sintético para entrenamiento de modelos de visión**: clips etiquetados por prompt que pueden servir para aumentar datasets de detección, segmentación o seguimiento temporal, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- **Investigación en generación de vídeo**: el checkpoint de 14 B y el VAE publicado permiten experimentar con schedulers, cuantización (fp8) y técnicas de muestreo comparando contra la variante de 1.3 B de la misma familia.
- **Integración en pipelines de automatización de contenido**: combinado con el código oficial multi-GPU, se puede encolar la generación por lotes de clips a partir de un CSV de prompts para alimentar un CMS o un generador de creatividades.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que Wan2.1 T2V-14B "establece un nuevo referente SOTA" y que supera a modelos abiertos y soluciones comerciales en múltiples benchmarks, pero no se incluye ninguna tabla con métricas concretas (VBench, MMLU, HumanEval u otras), ni cifras de FVD, CLIP score o consistencia temporal. Cualquier comparación cuantitativa con otros modelos exigiría consultar el paper, que en el momento de la publicación figuraba como "coming soon" y sin enlace.

## Requisitos de hardware

- **VRAM estimada para el T2V-14B**: no publicada en la información disponible. Como referencia aritmética, solo los pesos en bf16 ocupan ≈28,6 GB (14,29 B × 2 bytes), a lo que hay que sumar el VAE, el codificador de texto y las activaciones de atención sobre secuencias de vídeo, por lo que en la práctica se requiere hardware de clase centro de datos.
- **GPU recomendadas para 14B**: A100 80 GB, H100 80 GB o configuraciones multi-GPU; el código oficial contempla inferencia multi-GPU precisamente por este motivo. No se dispone de cifras verificadas de VRAM pico para este checkpoint concreto.
- **GPU de consumo**: el 14B no está pensado para GPUs de consumo en bf16. La variante de 1.3 B de la misma familia sí: 8,19 GB de VRAM y ~4 minutos para un vídeo de 5 s a 480P en una RTX 4090 sin optimizaciones. Para el 14B en consumer sería necesario recurrir a cuantización fp8 o a offloading agresivo de CPU, con la consiguiente penalización de velocidad.
- **Opciones de despliegue**: código de inferencia oficial en el repositorio GitHub de Wan2.1 (con soporte multi-GPU), demo Gradio incluida, y pesos en formato `safetensors` con layout `diffusers`. La propia model card marcaba la integración con Diffusers y ComfyUI como tareas pendientes ("[ ]"), pese a que el repo etiquete la librería como `diffusers`; conviene verificar el estado real antes de integrar. No se confirma soporte de vLLM, TGI, llama.cpp ni Ollama (no aplicables a un modelo de difusión de vídeo).
- **Latencia y throughput**: no disponibles para el 14B. La única referencia publicada es la del 1.3 B (≈4 min por clip de 5 s a 480P en RTX 4090).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto/duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1 T2V-14B (este repo) | ≈14,3 B | 480P y 720P | Clips cortos; duración no especificada para 14B | Apache 2.0 | Pesos abiertos en HF (repo oficial Wan-AI y este espejo) |
| Wan2.1 T2V-1.3B | 1,3 B | 480P (720P inestable) | ~5 s a 480P | Apache 2.0 | Pesos abiertos; 8,19 GB VRAM |
| Wan2.1 I2V-14B-720P | ≈14 B | 720P | Imagen-a-vídeo | Apache 2.0 | Pesos abiertos |
| Wan2.1 I2V-14B-480P | ≈14 B | 480P | Imagen-a-vídeo | Apache 2.0 | Pesos abiertos |

No se ofrece comparación numérica con alternativas de otros desarrolladores (por ejemplo, otros modelos abiertos de texto-a-vídeo de la franja 5-14 B) porque la información proporcionada no incluye sus especificaciones ni resultados de benchmarks verificables. La comparación intrafamilia se basa exclusivamente en los datos de la model card.

## Limitaciones y advertencias

- **Repositorio no oficial**: se trata de una redistribución de los pesos de Wan-AI, no del repositorio del autor original. Para producción conviene usar `Wan-AI/Wan2.1-T2V-14B`, que es el que recibe actualizaciones, issues y soporte.
- **Estado de integración incierto**: la model card lista la integración con Diffusers y ComfyUI como pendiente, mientras que las etiquetas del repo declaran `diffusers`. Hay que validar la carga real del checkpoint antes de diseñar un pipeline en torno a él.
- **Sesgos**: no documentados en la información disponible. Como modelo entrenado sobre datos web a gran escala, es esperable que reproduzca estereotipos visuales y culturales de dichos datos; no hay sección de evaluación de sesgos en la model card.
- **Alucinación visual**: inherente a los modelos generativos de vídeo. Puede producir anatomías incorrectas, física incoherente, texto mal formado (especialmente fuera de en/zh) y artefactos temporales entre fotogramas.
- **Cobertura lingüística limitada**: solo inglés y chino, tanto en prompt como en texto renderizado. El español no está soportado oficialmente; cabe esperar degradación en la adherencia al prompt.
- **Duración y resolución acotadas**: clips cortos (la referencia publicada es de 5 s para la variante pequeña) y un máximo declarado de 720P para el T2V-14B. No apto para vídeo largo sin stitching posterior.
- **Coste de inferencia elevado**: 14,3 B parámetros en un modelo de difusión sobre secuencias de vídeo implican un consumo de VRAM y tiempo muy superior al de un LLM del mismo tamaño; sin cifras publicadas de latencia para este checkpoint.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero conviene revisar los términos del proyecto Wan2.1 y las condiciones de los datasets de entrenamiento (no detalladas) antes de un despliegue comercial.
- **Ausencia de benchmarks**: las afirmaciones de SOTA son del autor y no van acompañadas de métricas reproducibles en la información disponible.

## Enlaces

- Repositorio del modelo (espejo): https://huggingface.co/emdashthreee/pix-vid-wn-2.1-t2v-14b
- Modelo original en HuggingFace: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- README original: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B/blob/main/README.md
- Ejemplos del repo original: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B/tree/main/examples
- Organización Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.1
- ModelScope: https://modelscope.cn/organization/Wan-AI
- ModelScope del T2V-14B: https://www.modelscope.cn/models/Wan-AI/Wan2.1-T2V-14B
- Blog del proyecto: https://wanxai.com
- Plataforma Wan: https://wan.video/
- Discord: https://discord.gg/p5XbdQV7
- Variante fp8 en Civitai: https://civitai.com/models/1329096/wan-video-21
- Ficha en TensorHub Art (t2v-14B-720p): https://tensorhub.art/models/834845675863700019
- Paper: no disponible (figuraba como "coming soon" sin enlace en la model card)
