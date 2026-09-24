# Kashapps/Wan2.1-VACE-1.3B

## Resumen

Wan2.1-VACE-1.3B es la variante pequena (denominacion comercial 1,3B) de VACE, la linea todo-en-uno de creacion y edicion de video de la familia Wan2.1 desarrollada por el equipo Wan (Alibaba). VACE se presento el 14 de mayo de 2025 como un modelo unico capaz de cubrir varias tareas de generacion y edicion de video, entre ellas referencia-a-video, edicion video-a-video e imagen-a-video, en lugar de requerir un modelo especializado por tarea. Esta ficha corresponde al repositorio `Kashapps/Wan2.1-VACE-1.3B`, una resubida de terceros en formato Diffusers (`safetensors`) de los pesos publicados originalmente por Wan-AI.

El atractivo principal de la variante 1.3B es el coste de inferencia: dentro de la misma familia, el modelo T2V-1.3B requiere solo 8,19 GB de VRAM y genera un clip de 5 segundos a 480P en unos 4 minutos en una RTX 4090 sin tecnicas de optimizacion, lo que lo situa al alcance de GPU de consumo. La familia Wan2.1 se apoya en Wan-VAE, un VAE de video capaz de codificar y decodificar video 1080P de longitud arbitraria preservando informacion temporal, y presumen de ser los primeros modelos de video capaces de generar texto en chino e ingles dentro del propio video.

La licencia Apache 2.0 y el tamano reducido hacen de este checkpoint un candidato razonable para prototipado de edicion de video en hardware modesto, aunque conviene tener en cuenta que se trata de una resubida no oficial (1 descarga y 0 likes en el momento del analisis) y que los datos de entrenamiento y los benchmarks cuantitativos no estan publicados en la informacion disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (diffusion transformer) con VAE de vídeo (Wan-VAE) y codificador de texto. El detalle de capas, cabezas de atención y mecanismo de condicionamiento no está disponible en la información proporcionada |
| Parámetros totales | 2.153.972.032 según los pesos safetensors publicados. La denominación comercial del checkpoint es 1,3B |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). La ventana útil viene dada por la duración del clip generado; la información disponible no especifica el número de fotogramas de VACE-1.3B (el T2V-1.3B de la familia genera clips de 5 s a 480P) |
| Tipos de cuantización | No se documentan cuantizaciones oficiales en el repositorio. Existe soporte de FP8 a través de DiffSynth-Studio (trabajo de la comunidad) |
| Idiomas soportados | Inglés (en) y chino (zh), incluida la generación de texto rotulado en vídeo en ambos idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Diffusers). Tamaño del repositorio: 19,0 GB |

## Arquitectura y entrenamiento

Wan2.1 es una suite de modelos fundacionales de vídeo con variantes de texto-a-vídeo (T2V), imagen-a-vídeo (I2V), first-last-frame-to-video (FLF2V) y VACE. VACE se describe como un modelo todo-en-uno para creación y edición de vídeo, y los metadatos del repositorio declaran explícitamente las tareas de edición vídeo-a-vídeo, referencia-a-vídeo e imagen-a-vídeo dentro de un mismo checkpoint, con versiones de 1,3B y 14B y código de inferencia multi-GPU. La arquitectura subyacente es de difusión, con el VAE propietario Wan-VAE, que según el autor codifica y decodifica vídeo 1080P de cualquier longitud preservando la información temporal.

La información proporcionada no incluye el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de ajuste por preferencias (RLHF/DPO). Tampoco se detalla el mecanismo interno con el que VACE unifica las distintas tareas de condicionamiento. Como innovaciones documentadas alrededor del modelo cabe citar la integración en ComfyUI y Gradio, el soporte de aceleración mediante TeaCache (aproximadamente 2x de velocidad), la mejora de la guía CFG con CFG-Zero, el entrenamiento de LoRA y la optimización de VRAM mediante DiffSynth-Studio, además de adaptaciones de la comunidad como Phantom (referencias de uno o varios sujetos sobre Wan2.1-T2V-1.3B) y UniAnimate-DiT (animación de figuras humanas sobre Wan2.1-14B-I2V).

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), que es la tarea declarada en los metadatos de HuggingFace del repositorio.
- Edición de vídeo a vídeo: modificación de material existente manteniendo la estructura temporal del clip.
- Referencia-a-vídeo: uso de una o varias referencias visuales para condicionar el resultado (sujeto, estilo o apariencia), según los metadatos del repositorio.
- Generación de texto rotulado dentro del vídeo en chino e inglés, capacidad que la familia Wan2.1 reclama como primera en un modelo de vídeo abierto.
- Ejecución en GPU de consumo: el modelo T2V-1.3B de la misma familia funciona con 8,19 GB de VRAM sin optimizaciones.
- Integración con ComfyUI y demo Gradio para VACE, con código de inferencia multi-GPU para las variantes de 1,3B y 14B.
- Compatibilidad con LoRA, cuantización FP8 y optimizaciones de VRAM mediante DiffSynth-Studio, y aceleración con TeaCache.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no es un modelo de lenguaje.
- No incluye generación de audio ni de voz (video-to-audio es otra línea de la familia Wan2.1, no este checkpoint).

## Casos de uso

- Postproducción y retoque de vídeo: el modelo permite editar material ya rodado (vídeo-a-vídeo) cambiando apariencia, estilo o elementos concretos sin volver a rodar, con la ventaja de que el checkpoint de 1,3B se ejecuta en una sola GPU de consumo.
- Transferencia de producto o personaje a vídeo: usando referencia-a-vídeo se puede condicionar la generación con imágenes de un producto o de una persona, lo que resulta útil para catálogos de comercio electrónico o piezas de marketing que requieren coherencia de identidad visual.
- Animación de imágenes fijas: la tarea imagen-a-vídeo permite convertir fotografías, ilustraciones o renders en clips cortos, por ejemplo para storyboards animados o previsualizaciones de campaña.
- Preproducción audiovisual: generar versiones previas de planos para validar encuadre, movimiento y ritmo antes de un rodaje, apoyándose en el coste reducido de inferencia de la variante 1,3B frente a las variantes de 14B.
- Creación de rótulos y texto en vídeo: la capacidad de generar texto en chino e inglés dentro del propio vídeo permite producir piezas con cartelas integradas sin composición posterior, útil para vídeo educativo o señalética animada.
- Aumento de datos sintéticos: generar clips condicionados por imagen o referencia para ampliar datasets de entrenamiento de modelos de visión por computador o de detección temporal.
- Flujos de trabajo artísticos en ComfyUI: al estar integrado en ComfyUI, el modelo se puede encadenar con nodos de interpolación, escalado o posprocesado dentro de un grafo reproducible, lo que facilita la experimentación iterativa.
- Pruebas de concepto con presupuesto limitado: al requerir del orden de 8-12 GB de VRAM (estimación, véase la sección de hardware) se puede desplegar en una estación de trabajo con una única RTX 4090.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma de forma cualitativa que Wan2.1 supera de forma consistente a los modelos abiertos existentes y a soluciones comerciales en múltiples benchmarks, pero no acompaña ninguna cifra (MMLU, VBench u otras) en la información proporcionada.

El único dato cuantitativo disponible pertenece a otra variante de la familia y no a VACE-1.3B:

| Dato | Valor | Ámbito |
|---|---|---|
| VRAM mínima declarada | 8,19 GB | Wan2.1-T2V-1.3B, sin optimizaciones |
| Tiempo de generación | ~4 minutos para 5 s a 480P | Wan2.1-T2V-1.3B en RTX 4090, sin optimizaciones |
| Aceleración con TeaCache | ~2x | Wan2.1 (T2V e I2V) |
| Tamaño del repositorio | 19,0 GB | Este repositorio |

## Requisitos de hardware

- Estimación de pesos: los 2,15B parámetros publicados en safetensors ocupan del orden de 4,3 GB en precisión bf16/fp16. A esa cifra hay que sumar el VAE, el codificador de texto y las activaciones de vídeo, por lo que el consumo real de inferencia será notablemente superior.
- Referencia de la familia: el modelo T2V-1.3B declara 8,19 GB de VRAM sin optimizaciones. Para VACE-1.3B, que añade condicionamiento por referencia y edición sobre vídeo existente, es razonable estimar un rango de 8-12 GB en bf16, aunque se trata de una estimación y no de un dato publicado.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para trabajar con margen; GPU de 12-16 GB probablemente suficientes en bf16 con resoluciones moderadas, sin garantía documentada.
- Cabe en GPU de consumo: sí, es el objetivo declarado de la variante 1.3B de la familia.
- Opciones de despliegue: Diffusers (el repositorio está en formato Diffusers), ComfyUI (integración marcada como completada para VACE), demo Gradio y código de inferencia multi-GPU del repositorio oficial. DiffSynth-Studio añade FP8, optimización de VRAM y entrenamiento de LoRA. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: el único dato disponible es el de T2V-1.3B (5 s a 480P en ~4 minutos en RTX 4090 sin optimizaciones), con aceleración aproximada de 2x mediante TeaCache. No hay cifras publicadas para VACE-1.3B.
- Nota: el repositorio ocupa 19,0 GB, muy por encima de los ~4,3 GB de los pesos en bf16, por lo que conviene verificar qué componentes adicionales incluye antes de planificar el almacenamiento.

## Comparativa con modelos similares

La información disponible solo permite comparar con otras variantes de la propia familia Wan2.1; no se aportan datos de modelos competidores (HunyuanVideo, LTX-Video, CogVideoX u otros).

| Modelo | Parámetros | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.1-VACE-1.3B (este repo) | 2,15B en safetensors; denominación 1,3B | Imagen-a-vídeo, vídeo-a-vídeo, referencia-a-vídeo | Apache 2.0 | Resubida de terceros en HuggingFace, formato Diffusers |
| Wan2.1-VACE-14B | No disponible | Imagen-a-vídeo, vídeo-a-vídeo, referencia-a-vídeo | Apache 2.0 | Pesos oficiales y código de inferencia multi-GPU publicados |
| Wan2.1-T2V-1.3B | 1,3B (denominación oficial; no se detalla el total) | Texto-a-vídeo | Apache 2.0 | Pesos oficiales, integrado en Diffusers y ComfyUI |
| Wan2.1-I2V-14B | 14B (denominación oficial) | Imagen-a-vídeo | Apache 2.0 | Pesos oficiales, integrado en Diffusers y ComfyUI |
| Wan2.1-FLF2V-14B | 14B (denominación oficial) | Primer y último fotograma a vídeo | Apache 2.0 | Pesos oficiales con código de inferencia; sin integración en ComfyUI ni Diffusers según la model card |

## Limitaciones y advertencias

- Repositorio no oficial: `Kashapps/Wan2.1-VACE-1.3B` es una resubida de un usuario tercero, no de la organización Wan-AI. Registra 1 descarga y 0 likes, y sus fechas de creación y actualización (24 de septiembre de 2026) resultan anómalas. No hay garantía de integridad de los pesos ni de mantenimiento; para producción conviene usar los pesos oficiales.
- Incoherencia de parámetros: los safetensors suman 2.153.972.032 parámetros frente a la denominación comercial de 1,3B. La información disponible no desglosa qué componentes adicionales (VAE u otros) explican la diferencia.
- Alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, deformaciones anatómicas, inconsistencias temporales entre fotogramas y texto rotulado incorrecto o ilegible.
- Sesgos desconocidos: no se publica información sobre el dataset de entrenamiento, su composición ni sus proporciones por idioma o demografía, por lo que no es posible caracterizar los sesgos de representación.
- Idioma: los idiomas declarados son inglés y chino. No hay evidencia de rendimiento con prompts en castellano u otras lenguas, y la generación de texto dentro del vídeo solo está soportada en chino e inglés.
- Licencia: Apache 2.0 permite uso comercial y modificación con atribución, pero al tratarse de una resubida conviene verificar los términos del repositorio oficial y de los componentes incluidos antes de explotarlo comercialmente.
- No es un modelo de lenguaje: no sirve para generación de texto, razonamiento, código, tool calling ni flujos de agente.
- Integración Diffusers dudosa: los metadatos de HuggingFace marcan la librería como `diffusers`, pero la model card oficial de Wan2.1 mantiene la integración de VACE en Diffusers como pendiente. Verificar la compatibilidad real antes de asumir que las pipelines estándar funcionan.
- Coste computacional: la generación de vídeo es intensiva en tiempo de GPU incluso en la variante de 1,3B, y no se publican cifras de latencia específicas para VACE-1.3B.

## Enlaces

- Repositorio analizado: https://huggingface.co/Kashapps/Wan2.1-VACE-1.3B
- Organización oficial en HuggingFace: https://huggingface.co/Wan-AI/
- Repositorio de código Wan2.1: https://github.com/Wan-Video/Wan2.1
- Repositorio de VACE: https://github.com/ali-vilab/VACE
- Informe técnico de Wan2.1: https://arxiv.org/abs/2503.20314
- Informe técnico de VACE: https://arxiv.org/abs/2503.07598
- Referencias arXiv adicionales incluidas en los metadatos: https://arxiv.org/abs/2309.14509 y https://arxiv.org/abs/2310.01889
- Blog y sitio del proyecto: https://wan.video
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Discord: https://discord.gg/AKNgpMK4Yj
- Documentación de Diffusers (pipelines Wan T2V e I2V): https://huggingface.co/docs/diffusers/main/en/api/pipelines/wan
- Ejemplos de Wan en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan/
- DiffSynth-Studio (FP8, optimización de VRAM, LoRA): https://github.com/modelscope/DiffSynth-Studio
- TeaCache (aceleración): https://github.com/ali-vilab/TeaCache
- CFG-Zero: https://github.com/WeichenFan/CFG-Zero-star
- Phantom (referencias de sujeto sobre Wan2.1-T2V-1.3B): https://github.com/Phantom-video/Phantom
- UniAnimate-DiT (animación humana sobre Wan2.1-14B-I2V): https://github.com/ali-vilab/UniAnimate-DiT
