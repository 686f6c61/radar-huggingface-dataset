# moltherm1/olmo-mirror-olmo-3-32b-think-sft

## Resumen

Olmo 3 32B Think SFT es la etapa de ajuste fino supervisado (SFT) del modelo de razonamiento de 32B de la familia Olmo 3, desarrollada por el Allen Institute for AI (Ai2). Este repositorio concreto (`moltherm1/olmo-mirror-olmo-3-32b-think-sft`) es un espejo del checkpoint oficial `allenai/Olmo-3-32B-Think-SFT`, publicado por un tercero y entrenado sobre el modelo base `allenai/Olmo-3-1125-32B` con el dataset `allenai/Dolci-Think-SFT`. Forma parte de una familia que incluye variantes de 7B y 32B, tanto Instruct como Think, y que se distribuye con código, checkpoints y detalles de entrenamiento abiertos.

El modelo es un transformer autorregresivo de 32 000 millones de parámetros orientado a generación de texto con modo de razonamiento explícito (cadena de pensamiento larga delimitada por etiquetas `<think>`). Está diseñado para mejorar tareas de matemáticas y código mediante razonamiento multi-paso, y se presenta como una alternativa completamente abierta (pesos, datos y recetas) frente a modelos propietarios de tamaño similar. La fecha de corte de conocimiento es diciembre de 2024.

Es relevante porque la familia Olmo 3 publica no solo los pesos finales, sino también los checkpoints intermedios de cada etapa (SFT, DPO y RLVR), lo que permite reproducir y auditar el pipeline de post-entrenamiento completo. Este checkpoint SFT concreto representa la etapa previa al alineamiento por DPO y RLVR, por lo que resulta útil para investigación sobre post-entrenamiento más que como modelo final de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo decoder-only) |
| Parametros totales | 32B (aproximado, segun nomenclatura del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 via bitsandbytes (`load_in_8bit`); fp16; otras no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de tipo decoder-only, la misma familia arquitectonica que el modelo base `allenai/Olmo-3-1125-32B`. La model card no detalla innovaciones arquitectonicas especificas (atencion lineal, SSM, decodificacion especulativa, etc.), por lo que no se dispone de informacion adicional al respecto. El modelo esta soportado en transformers 4.57.0 o superior.

El entrenamiento de esta etapa es un ajuste fino supervisado (SFT) sobre el dataset `allenai/Dolci-Think-SFT`, que forma parte de la coleccion Dolci de Ai2 para post-entrenamiento. La familia Olmo 3 sigue un pipeline de tres etapas: SFT, DPO y RLVR (refuerzo con verificacion). Este checkpoint corresponde unicamente a la primera etapa. El modelo base fue pre-entrenado sobre el dataset Dolma 3. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles de RLHF/DPO para esta revision concreta. Ai2 publica checkpoints intermedios con la convencion `LR-step_XXXX` (por ejemplo, `1e-4-step1000`), accesibles mediante el parametro `revision` de Hugging Face.

## Capacidades

- Generacion de texto en ingles con modo de razonamiento explicito: produce cadenas de pensamiento largas dentro de etiquetas `<think>...</think>` antes de la respuesta final.
- Razonamiento matematico y de codigo mejorado gracias al modo Think, segun la model card.
- Razonamiento multi-paso (multi-step reasoning) mediante la cadena de pensamiento.
- Formato de chat con plantilla ChatML (`<|im_start|>system`, `<|im_start|>user`, `<|im_start|>assistant`, `<|im_end|>`).
- Mensaje de sistema por defecto: "You are a helpful AI assistant."
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion sobre post-entrenamiento: este checkpoint SFT permite estudiar el efecto del ajuste supervisado antes de DPO y RLVR, comparando con los checkpoints DPO y finales de la misma familia para aislar la contribucion de cada etapa.
- Reproduccion de pipelines de razonamiento: al estar entrenado sobre Dolci-Think-SFT, sirve para replicar experimentos de cadenas de pensamiento largas y analizar la calidad de las trazas de razonamiento generadas.
- Generacion de codigo con razonamiento: el modo Think permite al modelo descomponer problemas de programacion en pasos antes de emitir la solucion, util para prototipado y generacion asistida en entornos de investigacion.
- Resolucion de problemas matematicos: adecuado para experimentos de razonamiento aritmetico y algebraico donde interesa inspeccionar el proceso intermedio, no solo la respuesta.
- Evaluacion comparativa de modelos abiertos: sirve como referencia en estudios que comparan modelos de 32B con licencia permisiva (Apache 2.0) frente a alternativas como Qwen 3 32B o Gemma 3 27B.
- Fine-tuning posterior: al ser un checkpoint intermedio con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos de dominio en ingles, con la ventaja de que los pesos y la receta son auditables.
- Analisis de seguridad y alineamiento: al ser la etapa previa a DPO/RLVR, permite estudiar comportamientos del modelo antes del alineamiento y compararlos con la version final.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion con columnas para Olmo 3 Think 32B SFT, Olmo 3 Think 32B DPO, Olmo 3 Think 32B, Qwen 3 32B, Qwen 3 VL 32B Thinking, Qwen 2.5 32B, Gemma 3 27B Instruct, Gemma 2 27B Instruct, Olmo 2 32B Instruct y DeepSeek-R1-Distill-Qwen-32B. Sin embargo, en la informacion proporcionada la tabla aparece truncada: solo se muestran los encabezados y no los valores numericos de ningun benchmark. Por tanto, no se dispone de resultados concretos que reproducir.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la model card. Como referencia orientativa por tamano (32B parametros), en fp16 se requieren aproximadamente 64 GB de VRAM solo para pesos; en int8, alrededor de 32 GB; en cuantizaciones de 4 bits, en torno a 18-20 GB. Estas cifras son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cabria esperar A100 80GB, H100 80GB o configuraciones multi-GPU para fp16.
- Compatibilidad con GPU de consumo: en cuantizacion de 4 bits podria caber en GPUs de 24 GB (por ejemplo, RTX 4090), aunque no hay confirmacion oficial en la informacion proporcionada.
- Opciones de despliegue: transformers >= 4.57.0 (soporte oficial). vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Cuantizacion documentada: int8 mediante bitsandbytes (`load_in_8bit=True`), con la advertencia de pasar las entradas directamente a CUDA (`inputs.input_ids.to('cuda')`) para evitar problemas con operaciones CUDA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Olmo 3 32B Think SFT (este) | 32B | no disponible | Apache 2.0 | Pesos abiertos en HF | Etapa SFT del pipeline Olmo 3 Think |
| Olmo 3 32B Think (final, RLVR) | 32B | no disponible | Apache 2.0 | Pesos abiertos en HF | Version final tras DPO y RLVR |
| Qwen 3 32B | 32B | no disponible | no disponible | Pesos abiertos en HF | Incluido como referencia en la tabla de evaluacion de la model card |
| Gemma 3 27B Instruct | 27B | no disponible | no disponible | Pesos abiertos en HF | Incluido como referencia en la tabla de evaluacion de la model card |
| DeepSeek-R1-Distill-Qwen-32B | 32B | no disponible | no disponible | Pesos abiertos en HF | Modelo de razonamiento comparable por tamano |

Los datos de rendimiento comparativo no estan disponibles en la informacion proporcionada, ya que la tabla de evaluacion aparece truncada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado y evaluado principalmente en ingles; el soporte multilingue es limitado segun los metadatos.
- Es un checkpoint intermedio (SFT) previo a DPO y RLVR: cabe esperar un alineamiento y una calidad de respuesta final inferiores a los de la version `Olmo-3-32B-Think` final.
- Riesgo de alucinacion inherente a los modelos de lenguaje; el modo Think puede generar cadenas de razonamiento plausibles pero incorrectas.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad especificas para esta revision.
- Licencia Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo esta pensado para investigacion y educacion conforme a sus Responsible Use Guidelines; conviene revisar dichas directrices antes de un despliegue en produccion.
- Fecha de corte de conocimiento: diciembre de 2024.
- Este repositorio es un espejo de terceros (`moltherm1`), no el repositorio oficial de Ai2; para produccion se recomienda usar `allenai/Olmo-3-32B-Think-SFT` o la version final.
- La cuantizacion int8 es sensible a tipos de datos y operaciones CUDA, segun advierte la propia model card.
- No hay informacion sobre tool calling, agentes ni contexto maximo, lo que limita la planificacion de despliegues que dependan de estas capacidades.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-32b-think-sft
- Modelo base: https://huggingface.co/allenai/Olmo-3-1125-32B
- Checkpoint oficial SFT: https://huggingface.co/allenai/Olmo-3-32B-Think-SFT
- Checkpoint DPO oficial: https://huggingface.co/allenai/Olmo-3-32B-Think-DPO
- Modelo final Think 32B: https://huggingface.co/allenai/Olmo-3-32B-Think
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Think-SFT
- Pagina del proyecto Olmo: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Core (pre-entrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval (evaluacion): https://github.com/allenai/OLMo-Eval
- Directrices de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper: pendiente de publicacion segun la model card (arXiv 2512.13961 referenciado en los tags)
