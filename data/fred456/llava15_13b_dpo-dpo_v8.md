# Fred456/llava15_13b_DPO-DPO_v8

## Resumen

Fred456/llava15_13b_DPO-DPO_v8 es un adaptador PEFT (LoRA) que ajusta el modelo multimodal LLaVA-1.5-13B mediante optimización con preferencias humanas (DPO, Direct Preference Optimization). El modelo base, desarrollado por el equipo de LLaVA (Liu et al.), combina un codificador visual CLIP con el modelo de lenguaje Vicuna-13B para tareas de comprensión visual y lenguaje. Este adaptador busca mejorar la adherencia del modelo a preferencias humanas en diálogos multimodales, un área relevante para reducir respuestas no deseadas y mejorar la calidad de las interacciones.

El repositorio contiene únicamente los pesos del adaptador PEFT (1,1 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base `liuhaotian/llava-v1.5-13b` y aplicar el adaptador. La ficha de HuggingFace es incompleta: no se especifican licencia, idiomas, ni datos de entrenamiento, y no se han publicado resultados de benchmarks. Es relevante para desarrolladores que buscan mejorar la capacidad de alineación de modelos LLaVA existentes mediante técnicas de preferencia sin reentrenar el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-1.5-13B (Vicuna-13B + CLIP ViT-L/14) con adaptador LoRA PEFT |
| Parametros totales | 13.000 millones (modelo base) + adaptador LoRA (~1,1 GB de pesos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredado del modelo base Vicuna-13B) |
| Tipos de cuantizacion | No especificados en el repositorio; el modelo base es compatible con cuantizacion de 4, 8 y 16 bits |
| Idiomas soportados | No disponible (el modelo base LLaVA-1.5 esta entrenado principalmente en ingles) |
| Licencia | No disponible (el modelo base LLaVA-1.5-13b usa la licencia LLaMA 2, que restringe el uso comercial) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es LLaVA-1.5-13B, una arquitectura multimodal que combina un codificador de vision CLIP ViT-L/14 con el modelo de lenguaje Vicuna-13B. La conexion entre ambos se realiza mediante un proyector de dos capas MLP que alinea los embeddings visuales con el espacio de tokens del LLM. El adaptador LoRA se entrena con DPO (Direct Preference Optimization), una tecnica que optimiza directamente las preferencias humanas sobre pares de respuestas en lugar de usar RLHF con un modelo de recompensa separado. Esto suele mejorar la adherencia a instrucciones y reduce respuestas toxicas o no deseadas.

Los detalles concretos del entrenamiento de este adaptador concreto (dataset, hiperparametros, numero de pasos) no estan disponibles en la informacion proporcionada. El autor no ha publicado el dataset utilizado ni el procedimiento exacto de entrenamiento. El repositorio solo incluye el adaptador y una model card plantilla sin rellenar.

## Capacidades

- Comprension visual y lenguaje: el modelo base LLaVA-1.5-13B es capaz de responder preguntas sobre imagenes, describir contenido visual, y realizar razonamiento basado en informacion visual.
- Generacion de texto multimodal: puede generar respuestas textuales coherentes contextualizadas con la imagen de entrada.
- Razonamiento visual y de sentido comun: el modelo base demuestra capacidades de razonamiento sobre escenas visuales, aunque no se han publicado benchmarks especificos de este adaptador.
- Soporte de tool calling: no disponible (el modelo base no esta entrenado para tool calling de forma nativa).
- Soporte de agentes y multi-step reasoning: limitado; el modelo base no tiene capacidades especificas de agentes, aunque puede realizar cadenas de razonamiento simples con prompting adecuado.
- Capacidades multilingues: limitadas; el modelo base se entrena principalmente en ingles, con resultados degradados en otros idiomas.
- Capacidades especiales: vision (entrada de imagen), no soporta audio ni video de forma nativa.

## Casos de uso

- **Asistentes de accesibilidad**: el modelo puede describir imagenes a personas con discapacidad visual, generando descripciones detalladas de escenas, objetos y personas. Es adecuado porque LLaVA-1.5-13B tiene un rendimiento solido en captions de imagen y el adaptador DPO puede mejorar la naturalidad del lenguaje.
- **Moderacion de contenido visual**: puede analizar imagenes y generar texto para clasificar o describir contenido, ayudando en pipelines de moderacion de redes sociales. Requiere integrar el modelo en un pipeline de clasificacion y validar las respuestas.
- **Educacion asistida por imagen**: explicar diagramas, graficos o ilustraciones en entornos educativos. El modelo puede generar explicaciones paso a paso de una imagen, lo que facilita el aprendizaje autonomo.
- **Documentacion de imagenes medicas**: aunque no esta entrenado especificamente para diagnostico, puede generar descripciones preliminares de radiografias o imagenes de tejidos que un profesional medico puede revisar. Es adecuado porque el modelo base tiene cierta capacidad de razonamiento visual.
- **Generacion de metadatos automaticos**: crear etiquetas, alt-text o descripciones SEO para imagenes en CMS o plataformas de comercio electronico. El adaptador DPO puede mejorar la coherencia de las descripciones generadas.
- **Investigacion en alineacion de modelos**: el adaptador sirve como referencia para estudiar como la DPO afecta al comportamiento de un modelo multimodal, comparando con el modelo base sin adaptador. Es util para experimentos de interpretabilidad y evaluacion de alineacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones numericas (MMLU, VQAv2, GQA, etc.) ni comparaciones con otros modelos. Se recomienda al usuario ejecutar su propia evaluacion en los benchmarks de vision-lenguaje (como VQAv2, GQA, TextVQA) para verificar el rendimiento real del adaptador.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base de 13B en FP16 requiere aproximadamente 26 GB de VRAM. Con cuantizacion de 4 bits se puede reducir a unos 8-10 GB, y con 8 bits a unos 14-16 GB.
- **GPU recomendadas**: A100 40GB, A100 80GB, H100, RTX 4090 (24GB) o RTX 3090 (24GB) con cuantizacion. Para despliegue en consumer GPU, una RTX 3090 o 4090 con cuantizacion de 4 bits es suficiente.
- **Cabe en consumer GPU**: si, con cuantizacion de 4 bits o 8 bits, el modelo cabe en GPUs de 24 GB como la RTX 3090 o RTX 4090.
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, Text Generation Inference (TGI), o transformers con PEFT para cargar el adaptador sobre el modelo base.
- **Latencia y throughput**: no disponible en la informacion del modelo. Para un modelo 13B en una A100, la latencia tipica es de unos 20-40 ms por token en FP16, y el throughput de 20-50 tokens por segundo, pero estos valores no estan publicados para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Fred456/llava15_13b_DPO-DPO_v8 | 13B + LoRA | 4096 | No disponible (base LLaMA-2) | HuggingFace |
| liuhaotian/llava-v1.5-13b | 13B | 4096 | LLaMA-2 (uso no comercial) | HuggingFace |
| liuhaotian/llava-v1.5-7b | 7B | 4096 | LLaMA-2 (uso no comercial) | HuggingFace |
| Qwen-VL-Chat (7B) | 7B | 8192 | Apache 2.0 | HuggingFace |

La comparativa se limita a datos estructurales porque no hay benchmarks publicados de este adaptador. LLaVA-1.5-7B es una alternativa mas ligera, mientras que Qwen-VL-7B ofrece licencia Apache 2.0 y contexto mayor, pero no se pueden comparar rendimientos sin datos de evaluacion.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo base LLaVA-1.5-13B hereda sesgos de los datos de entrenamiento de Vicuna y CLIP, que incluyen sesgos de genero, raza y cultura. El adaptador DPO no corrige estos sesgos y podria amplificarlos si el dataset de preferencias tiene sesgos.
- **Riesgo de alucinacion**: como todos los LLM, el modelo puede generar descripciones o respuestas falsas sobre imagenes que no corresponden al contenido real. La DPO puede reducir alucinaciones pero no las elimina.
- **Limitaciones de contexto**: la ventana de 4096 tokens es limitada para conversaciones largas o documentos extensos. En tareas multimodales con muchas imagenes, el contexto se agota rapidamente.
- **Limitaciones de idioma**: el modelo base esta entrenado principalmente en ingles; el rendimiento en espanol u otros idiomas es notablemente inferior y no se ha validado.
- **Restricciones de licencia**: la licencia del adaptador no esta especificada, pero el modelo base LLaVA-1.5-13B se basa en LLaMA-2, que tiene una licencia que restringe el uso comercial. Cualquier despliegue en produccion debe verificar la licencia del modelo base y del adaptador.
- **Caveat de produccion**: el adaptador no incluye el modelo completo; es necesario descargar el modelo base de 13B (unos 26 GB) y aplicar el adaptador LoRA. El repositorio no incluye scripts de evaluacion ni ejemplos de uso, por lo que la integracion requiere trabajo adicional.
- **Fecha del repositorio**: la fecha de creacion del modelo es 2026-08-22, que es una fecha futura respecto a la informacion disponible; esto puede indicar un error de metadatos o un modelo experimental sin mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Fred456/llava15_13b_DPO-DPO_v8
- Modelo base: https://huggingface.co/liuhaotian/llava-v1.5-13b
- Repositorio del proyecto LLaVA: https://github.com/haotian-liu/LLaVA
- Pagina del proyecto LLaVA: https://llava-vl.github.io/
- Paper de LLaVA (NeurIPS 2023): https://arxiv.org/abs/2304.08485 (no incluido en la busqueda pero es el paper de referencia del modelo base)
- Paper de DPO (Direct Preference Optimization): https://arxiv.org/abs/2305.18290 (no incluido en la busqueda, pero es la tecnica de entrenamiento del adaptador)
