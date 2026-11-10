# Chaman1234/Fine-Tuned-Blender

## Resumen

Fine-Tuned Blender es un adaptador LoRA experimental publicado por el usuario Chaman1234 sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct. Su objetivo es generar scripts concisos de Python para Blender 5.1 usando la API `bpy`, un dominio muy específico donde los modelos generalistas suelen producir código verboso o con llamadas incorrectas a la API. El adaptador se distribuye como pesos PEFT en formato safetensors y hereda la licencia Apache 2.0 del modelo base.

La versión publicada es la v4, que continúa el entrenamiento de una v3 previa sobre 24 nuevos ejemplos de flujo de trabajo y 24 ejemplos de repetición (replay), con 48 pasos de optimización y semilla 42. El entrenamiento se realizó sobre una base cuantizada en NF4 e incorpora una penalización sobre el cuadrado de los cambios efectivos de pesos del adaptador, siguiendo una monografía publicada en Zenodo. El autor reporta una mejora de 0/6 a 6/6 comprobaciones de escena en primera tentativa sobre seis prompts retenidos, aunque dentro de los mismos patrones de flujo de trabajo vistos en entrenamiento.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks generales publicados ni evaluación de regresión sobre la suite original de 12 tareas. Su interés es acotado: sirve como referencia para quien quiera experimentar con adaptadores LoRA de dominio muy estrecho sobre modelos de código pequeños, no como un modelo de producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct, no declarada en la model card) |
| Tipos de cuantizacion | Base entrenada en NF4; el adaptador se distribuye en safetensors. No se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), libreria `peft` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros orientado a generación de código e instrucciones. El adaptador en sí es un LoRA PEFT que modifica los pesos del modelo base sin reentrenarlo por completo. El entrenamiento se realizó sobre una base cuantizada en NF4, lo que reduce el coste de memoria durante el ajuste fino.

El proceso de la v4 continuó desde el adaptador v3 con 24 nuevos ejemplos de flujo de trabajo de Blender y 24 ejemplos de replay, 48 pasos de optimización y semilla 42. La innovación metodológica declarada es una penalización sobre el cuadrado de los cambios efectivos de pesos del adaptador, descrita en una monografía depositada en Zenodo (DOI 10.5281/zenodo.24074524). No se especifican el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO; el ajuste parece ser supervisado sobre pares instrucción-script.

## Capacidades

- Generación de scripts de Python para Blender 5.1 usando la API `bpy`.
- Producción de código conciso: el autor reporta una media de 79,67 tokens de salida por respuesta en la evaluación v4, frente a 76,33 en v3.
- Manejo de nombres de objetos y parámetros específicos indicados en el prompt.
- Generación sin comentarios ni Markdown cuando se solicita explícitamente.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no documentadas.
- Capacidad general de generación de texto y código heredada del modelo base, no evaluada por el autor.

## Casos de uso

- Generación de scripts de escena en Blender: el adaptador produce código `bpy` para crear objetos con nombres y parámetros concretos, útil para prototipar escenas de forma rápida en un entorno controlado.
- Automatización de tareas repetitivas de modelado: generar scripts que creen primitivas, apliquen transformaciones o asignen materiales siguiendo patrones de flujo de trabajo similares a los del entrenamiento.
- Asistente interno para artistas técnicos: integrado en una herramienta que traduzca instrucciones en lenguaje natural a scripts de Blender, siempre con revisión humana antes de ejecutar.
- Evaluación de adaptadores LoRA de dominio: sirve como caso de estudio reproducible para investigar ajuste fino estrecho sobre modelos de código pequeños, con el directorio `benchmark/` incluido.
- Docencia y experimentación: ejemplo práctico de entrenamiento PEFT con cuantización NF4 y penalización de pesos para cursos o talleres.
- Pruebas de pipelines de validación de código: el grader de escenas de Blender (`benchmark/check_workflows.py`) puede reutilizarse para validar scripts generados por otros modelos en el mismo dominio.

## Benchmarks y rendimiento

| Adaptador | Comprobaciones de escena a la primera | Tokens medios de salida |
|---|---:|---:|
| V3 | 0/6 | 76,33 |
| V4 | 6/6 | 79,67 |

Ambos adaptadores se evaluaron con los mismos prompts, base NF4, decodificación greedy y un límite de 220 tokens. Blender ejecutó las completaciones revisadas en escenas nuevas y cada caso solo se consideró superado si todas sus aserciones pasaban. Los seis prompts retenidos son variaciones de parámetros y nombres de objetos de tres patrones de flujo de trabajo representados en el entrenamiento, por lo que el resultado mide transferencia dentro de esos patrones. El autor indica que no hay resultado de regresión emparejado sobre la suite original de 12 tareas ni puntuación GGUF de la v4. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (el repositorio ocupa 0,0 GB según Hugging Face), por lo que el requisito real lo marca el modelo base de 1.500 millones de parámetros.
- Inferencia en precisión completa (fp16/bf16): aproximadamente 3 GB de VRAM para los pesos, más overhead de activaciones y contexto.
- Inferencia con cuantización de 4 bits (NF4, como en el entrenamiento): en torno a 1-1,5 GB de VRAM para los pesos.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; también en GPUs de datacenter (A100, H100) sin problema de memoria.
- Despliegue: PEFT + Transformers para cargar el adaptador; para servir en producción se puede fusionar el adaptador con el base y usar vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF (no se reporta puntuación GGUF de la v4).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fine-Tuned Blender v4 (este) | 1,5B (base) + LoRA | No disponible | Adaptador LoRA para `bpy` de Blender 5.1 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | No disponible en la informacion | Modelo base generalista de código e instrucciones | Apache 2.0 | Ampliamente disponible |
| Adaptadores LoRA de dominio público para Blender | No disponible | No disponible | Ajuste fino específico para `bpy` | Variable | No disponible |

La comparación con alternativas de la misma categoría (adaptadores LoRA para scripting de Blender) no está disponible en la información proporcionada. Frente a su modelo base, la diferencia medible es la tasa de éxito en las seis comprobaciones de escena (6/6 frente a un resultado no reportado del base en la model card) y la concisión de salida.

## Limitaciones y advertencias

- El propio autor advierte que los resultados miden transferencia dentro de tres patrones de flujo de trabajo vistos en entrenamiento; no demuestran generalización a otros dominios de Blender.
- No hay resultado de regresión sobre la suite original de 12 tareas, por lo que se desconoce si la v4 degrada comportamientos previos.
- No se reporta puntuación GGUF de la v4, lo que limita la confianza en despliegues cuantizados fuera de NF4.
- Riesgo de alucinación de API: el modelo puede generar llamadas a `bpy` inexistentes o incorrectas en Blender 5.1; el autor recomienda revisar el script antes de ejecutarlo.
- El adaptador está entrenado sobre un conjunto muy pequeño (24 + 24 ejemplos), lo que aumenta el riesgo de sobreajuste a los patrones concretos.
- Sesgos conocidos: no documentados; al heredar el modelo base, puede arrastrar los sesgos de Qwen2.5-Coder-1.5B-Instruct.
- Idiomas soportados no declarados; el entrenamiento parece centrado en instrucciones en inglés.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; es un artefacto experimental con cero descargas.
- No se documenta soporte de tool calling, agentes ni contexto largo más allá de lo que herede del base.

## Enlaces

- Hugging Face: https://huggingface.co/Chaman1234/Fine-Tuned-Blender
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Monografía en Zenodo: https://doi.org/10.5281/zenodo.24074524
- Directorio de benchmark: https://huggingface.co/Chaman1234/Fine-Tuned-Blender/tree/main/benchmark
- Repositorio PEFT: https://github.com/huggingface/peft
