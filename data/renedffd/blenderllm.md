# Renedffd/BlenderLLM

## Resumen

BlenderLLM es un modelo de lenguaje especializado en generación de código para diseño asistido por ordenador (CAD) y modelado 3D mediante scripting en Python sobre la API `bpy` de Blender. Lo desarrolla el grupo de investigación de la School of Data Science de la Chinese University of Hong Kong, Shenzhen (CUHKSZ), y se distribuye bajo licencia Apache 2.0. El modelo parte de Qwen2.5-Coder-7B-Instruct (la model card indica Qwen2.5-Coder-7B-Instruct, mientras que los metadatos de Hugging Face apuntan a Qwen2.5-7B-Instruct como base) y se afina sobre el dataset BlendNet con una etapa posterior de auto-mejora (self-improvement).

El problema que aborda es la brecha entre la descripción en lenguaje natural de una escena o pieza 3D y el código Python ejecutable que la construye en Blender: el modelo traduce instrucciones textuales a scripts `bpy` funcionales, lo que habilita flujos text-to-3D programáticos y automatización de tareas de modelado CAD.

Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), es un transformer denso de la familia Qwen2, por lo que su contexto, tokenizador y comportamiento lingüístico heredan las características de la base. Es relevante para quienes necesitan generar geometría paramétrica reproducible y versionable en código, frente a enfoques de generación 3D basados en mallas o difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), fine-tuning de Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de la base Qwen2.5, no confirmada) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors sin cuantizar) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BlenderLLM es un transformer decoder-only denso de la familia Qwen2, con 7.615.616.512 parámetros, obtenido por fine-tuning supervisado de Qwen2.5-Coder-7B-Instruct. El entrenamiento se realiza sobre el dataset BlendNet (FreedomIntelligence/BlendNet), orientado a pares de instrucción en lenguaje natural y código `bpy` para Blender, y se complementa con una fase de auto-mejora (self-improvement) que el autor describe como clave para alcanzar el mejor rendimiento. La model card no detalla el volumen de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacable es el uso de auto-mejora sobre un modelo base ya especializado en código, lo que permite refinar la calidad del código generado sin depender exclusivamente de anotación humana. No se documentan en la información disponible técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de código Python para la API `bpy` de Blender a partir de descripciones en lenguaje natural.
- Modelado 3D programático: creación de mallas, primitivas, modificadores y materiales mediante script.
- Tareas de CAD: generación de geometría paramétrica y reproducible.
- Render: scripting de escenas, cámaras, iluminación y configuración de render.
- Evaluación de código (`code_eval`) como métrica declarada por el autor.
- Herencia de las capacidades de código de Qwen2.5-Coder-7B-Instruct, incluyendo generación y razonamiento sobre código.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación automática de scripts de Blender: el modelo convierte una descripción textual de una escena en un script `bpy` ejecutable, lo que permite crear prototipos 3D sin escribir código manualmente.
- Automatización de pipelines de modelado CAD: integración en herramientas internas que generan geometría paramétrica versionable en Git, aprovechando que la salida es código y no una malla binaria.
- Asistente dentro de Blender: un complemento que sugiere y genera código para tareas repetitivas (aplicar modificadores, organizar colecciones, configurar materiales) a partir de instrucciones en lenguaje natural.
- Generación de escenas para render: creación programática de setups de iluminación, cámaras y composición para producción de imágenes o animaciones.
- Educación y formación: generación de ejemplos de código `bpy` comentados para enseñar scripting en Blender y conceptos de CAD.
- Pruebas y validación de geometría: generación de variantes de una pieza paramétrica para validar restricciones de diseño o simulaciones.
- Prototipado rápido en investigación 3D: base para experimentos de text-to-3D programático y evaluación de código generado en dominios CAD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara la métrica `code_eval` sin aportar cifras, y no se incluyen resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 18-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos, con margen adicional para contexto.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos, con margen adicional para contexto.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX A6000.
- GPU consumer: cabe en RTX 4090 (24 GB) en fp16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPUs de 8-12 GB requiere cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para versiones cuantizadas (GGUF), así como transformers con `accelerate`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlenderLLM | 7,6 B | No disponible | Código `bpy` / CAD en Blender | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | No disponible en esta ficha | Código general | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6 B | No disponible en esta ficha | Propósito general | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos base declarados, ya que no se dispone de datos de rendimiento de BlenderLLM frente a alternativas especializadas en text-to-3D o CAD. No se dispone de información sobre otros modelos comparables en la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en código `bpy`; su rendimiento en tareas generales puede degradarse respecto a la base Qwen2.5-Coder-7B-Instruct.
- Riesgo de alucinación en APIs de Blender: puede generar llamadas a funciones inexistentes o parámetros incorrectos, por lo que el código debe validarse y ejecutarse en un entorno controlado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Idiomas soportados no confirmados; la model card está en inglés y el dataset BlendNet no detalla composición lingüística.
- Longitud de contexto no confirmada en la información proporcionada; conviene verificar la configuración de la base antes de usarla en producción.
- La discrepancia entre la model card (Qwen2.5-Coder-7B-Instruct) y los metadatos de Hugging Face (Qwen2.5-7B-Instruct) como modelo base debe tenerse en cuenta al reproducir el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del dataset BlendNet y de la base Qwen2.5.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Renedffd/BlenderLLM
- Repositorio GitHub: https://github.com/FreedomIntelligence/BlenderLLM
- Paper arXiv: https://arxiv.org/abs/2412.14203
- Dataset BlendNet: https://huggingface.co/datasets/FreedomIntelligence/BlendNet
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
