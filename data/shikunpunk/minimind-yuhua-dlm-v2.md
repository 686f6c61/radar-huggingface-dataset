# shikunpunk/MiniMind-YuHua-dLM-v2

## Resumen

MiniMind-YuHua-dLM-v2 es un modelo de lenguaje de difusión de 104 millones de parámetros, desarrollado por el autor shikunpunk sobre la base del proyecto MiniMind de Jingyao Gong. Se trata de una variante especializada en la generación de texto literario en el estilo del escritor chino Yu Hua, autor de obras como *Vivir* o *Hermanos*. El modelo emplea una arquitectura de difusión de lenguaje con transferencia A2D y denoising iterativo MDM, y ha sido entrenado desde cero exclusivamente con datos procedentes de trece libros de Yu Hua, sin transferencia desde otros modelos estilísticos.

La versión V2 corrige los problemas de contaminación estilística de la V1, que partía de pesos preentrenados con poesía de Gu Cheng y producía intrusiones de personajes concretos (como "Xu Sanguan" o "Jiazhen") en los textos generados. En V2 se filtran los segmentos con personajes nombrados y se entrena desde cero con 18 793 segmentos puros del corpus de Yu Hua. El modelo es relevante porque explora la aplicación de modelos de difusión a la generación de prosa literaria controlada, un área poco explorada en comparación con los modelos autorregresivos clásicos.

El repositorio ocupa 0,3 GB y el modelo se carga mediante la clase `MiniMindForMaskedDiffusion`, junto con el config, tokenizer y el script `model_minimind_dllm.py`. La generación se realiza con `scripts/gen_yuhua_compare.py --model dllm --weight dllm_sft_yuhua_v2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMindForMaskedDiffusion (difusion de lenguaje con A2D + MDM) |
| Parametros totales | 104 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (principalmente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,3 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión de lenguaje, en la que la generación no es autorregresiva sino que parte de una secuencia completamente enmascarada y va denoising iterativamente hasta reconstruir el texto final. Esta técnica, inspirada en los modelos de difusión de imágenes, se implementa mediante el esquema A2D (Adaptive Attention Diffusion) combinado con MDM (Masked Diffusion Model), y se integra en la infraestructura MiniMind de 104 M parámetros.

El entrenamiento se realizó en dos fases: un pre-entrenamiento con 6039 diálogos del conjunto `pretrain_yuhua_pure_chat.jsonl` durante 3 épocas, seguido de un ajuste fino supervisado (SFT) con 826 muestras de CoT (chain-of-thought) durante 5 épocas. El corpus base son 13 libros de Yu Hua, de los que se extrajeron 18 793 segmentos; se filtraron 2222 segmentos que contenían personajes nombrados para evitar fugas de nombres propios en la generación. A diferencia de la V1, no se utilizó ninguna transferencia desde modelos de otros autores, lo que elimina la contaminación estilística.

## Capacidades

- Generación de texto literario en el estilo narrativo de Yu Hua, incluyendo descripciones, diálogos y fragmentos narrativos.
- SFT con cadenas de razonamiento (CoT) para producir respuestas estructuradas cuando se le solicita un estilo concreto.
- Validación interna del autor: fuga de personajes nombrados igual a cero en las tres arquitecturas evaluadas (AR, Linear y dLM).
- No se reporta soporte para tool calling, agentes, visión ni audio en esta variante concreta.
- El modelo forma parte de una familia MiniMind que sí incluye extensiones multimodales, pero esta variante es solo texto.

## Casos de uso

- Generación de ficción literaria: el modelo puede producir fragmentos narrativos que imitan el tono y la temática de Yu Hua, útil para prototipos de escritura asistida o estudios de estilometría.
- Investigación en modelos de difusión para texto: sirve como banco de pruebas para evaluar la viabilidad de arquitecturas de denoising iterativo en escalas pequeñas (104 M) con datos limitados.
- Enseñanza de técnicas de generación de texto: puede integrarse en cursos de PLN para comparar la generación autorregresiva frente a la difusión en un mismo corpus.
- Prototipado de agentes literarios: aunque no soporta tool calling, puede usarse como generador de estilo en pipelines de escritura creativa automatizada.
- Evaluación de sesgos estilísticos: al estar entrenado con un corpus literario homogéneo, permite estudiar cómo los modelos pequeños capturan y reproducen patrones de autoría.
- Comparación de arquitecturas: el script `gen_yuhua_compare.py` permite comparar dLM con variantes AR y Linear del mismo proyecto, útil para benchmarking de arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente tasas de aprobación internas en un criterio de estilo propio:

| Arquitectura | Tasa de aprobacion (V2) |
|---|---|
| AR | 86 % |
| dLM (difusion) | 16 % |
| Linear | 100 % |

Estos datos indican que la variante de difusión dLM tiene un rendimiento notablemente inferior en este corpus concreto, mientras que la variante lineal (Linear) es la más fiable para generar estilo Yu Hua. No se dispone de comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada: con 104 M parámetros, la inferencia en precisión fp16 requiere aproximadamente 0,2–0,4 GB de VRAM; con cuantización de 8 bits podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1650, RTX 3060, o incluso CPUs con suficiente RAM).
- Cabe en GPUs de consumo general y también se puede ejecutar en CPU (aunque con mayor latencia).
- Opciones de despliegue: el proyecto MiniMind proporciona scripts Python directos (`gen_yuhua_compare.py`); no se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI en esta variante.
- Latencia: al ser un modelo pequeño y con difusión iterativa, el número de pasos de denoising es mayor que en un AR, por lo que la generación será más lenta que un AR de tamaño similar, aunque sigue siendo viable en tiempo real para frases cortas.

## Comparativa con modelos similares

La comparación más directa se establece con las variantes del propio proyecto MiniMind:

| Modelo | Parametros | Arquitectura | Contexto | Estilo entrenado | Tasa aprobacion (V2) |
|---|---|---|---|---|---|
| MiniMind-YuHua-dLM-v2 | 104 M | Difusion (A2D + MDM) | no disponible | Yu Hua | 16 % |
| MiniMind-YuHua-AR (V2) | 104 M | Autorregresivo | no disponible | Yu Hua | 86 % |
| MiniMind-YuHua-Linear (V2) | 104 M | Lineal | no disponible | Yu Hua | 100 % |
| MiniMind-GuCheng-dLM | 104 M | Difusion | no disponible | Gu Cheng | no disponible |

No se dispone de comparaciones con modelos externos de tamaño similar, como GPT-2 o MiniLM, en este contexto. La variante dLM es la más débil de la familia, mientras que la lineal destaca como la mejor opción para el estilo Yu Hua.

## Limitaciones y advertencias

- El modelo es muy pequeño (104 M) y su capacidad de razonamiento general es limitada; no es adecuado para tareas complejas de comprensión o generación de código.
- La variante de difusión dLM presenta una tasa de aprobación muy baja (16 %) en la validación estilística del autor, lo que indica que la arquitectura de denoising iterativo no se adapta bien a este corpus y escala.
- El entrenamiento se ha realizado exclusivamente con datos de Yu Hua; la generación fuera de ese dominio estilístico será de baja calidad.
- La licencia no está especificada, por lo que el uso comercial es incierto; se recomienda contactar con el autor antes de utilizarlo en productos.
- No se dispone de información sobre sesgos del modelo, pero al entrenar con un corpus literario homogéneo, el modelo puede reflejar patrones de género o temáticas del autor.
- Riesgo de alucinación: como cualquier modelo pequeño, puede generar texto incoherente o inventar nombres y eventos cuando se le pide contenido fuera de su dominio.
- No se publican resultados de benchmarks estándar, por lo que no se puede evaluar su rendimiento en tareas generales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikunpunk/MiniMind-YuHua-dLM-v2
- Modelo hermano (GuCheng): https://huggingface.co/shikunpunk/MiniMind-GuCheng-dLM
- Repositorio MiniMind (proyecto base): https://github.com/jingyaogong/minimind
- Colección MiniMind en HuggingFace: https://huggingface.co/collections/jingyaogong/minimind
- Página web del proyecto MiniMind: https://jingyaogong.github.io/minimind/
- Repositorio derivado Mini_LM_from_Scratch: https://github.com/v1n4k/Mini_LM_from_Scratch
