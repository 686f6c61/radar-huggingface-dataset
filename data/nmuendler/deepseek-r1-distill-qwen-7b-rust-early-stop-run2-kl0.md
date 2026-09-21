# nmuendler/DeepSeek-R1-Distill-Qwen-7B-rust-early-stop-run2-kl0

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA entrenado con PEFT 0.20.0 sobre el modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-7B. Lo publica el usuario nmuendler (sin afiliación declarada) y su identificador, «rust-early-stop-run2-kl0», apunta a un experimento de ajuste fino orientado a código Rust, con parada temprana y coeficiente KL a cero en una segunda ejecución; sin embargo, la model card es la plantilla por defecto de HuggingFace con todos los campos a «More Information Needed», de modo que ninguna de esas hipótesis está confirmada por el autor.

El valor del artefacto es, por tanto, experimental y de investigación: se trata de un adaptador de bajo rango (0,7 GB en safetensors) que solo puede ejecutarse cargando previamente el modelo base, un transformer decoder-only de la familia Qwen2 con unos 7,6 mil millones de parámetros, destilado por DeepSeek a partir de trazas de razonamiento de DeepSeek-R1. El adaptador no es autónomo, no declara licencia, idiomas ni cuantizaciones, y acumula 0 descargas y 0 «likes» desde su publicación.

Es relevante ahora porque el ecosistema de adaptadores LoRA sobre modelos de razonamiento destilados es una de las vías más baratas para especializar un 7B en un dominio concreto (en este caso, aparentemente, Rust) sin reentrenar el modelo completo, y porque sirve como caso de estudio de reproducibilidad: metadatos incompletos, rutas locales del clúster de origen en los tags y ausencia total de evaluación publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only del modelo base DeepSeek-R1-Distill-Qwen-7B (familia Qwen2) |
| Parametros totales | No disponible para el adaptador; el modelo base declara ~7,6 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; heredada del modelo base, cuya configuración admite hasta 131 072 tokens |
| Tipos de cuantizacion | No declarados; el adaptador se distribuye en safetensors y puede fusionarse con el modelo base para cuantizarlo a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; requiere transformers + peft para cargarse) |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-7B |
| Libreria declarada | peft 0.20.0 |
| Pipeline | text-generation |
| Tamano del repositorio | 0,7 GB |
| Fecha de publicacion | 20 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del modelo base congelado. No se especifican en la información disponible ni el rango, ni el alpha, ni los módulos objetivo, ni el número de pasos, ni el dataset. El identificador sugiere un entrenamiento con parada temprana, una segunda ejecución y un coeficiente KL igual a cero, un ajuste habitual en esquemas de aprendizaje por refuerzo con recompensas verificables (RLVR/GRPO), donde KL=0 permite al modelo desviarse libremente de la política de referencia. Todo ello es una inferencia a partir del nombre del repositorio, no un dato documentado.

El modelo base sí está descrito públicamente: DeepSeek-R1-Distill-Qwen-7B es un Qwen2 de aproximadamente 7,6 mil millones de parámetros, 28 capas, atención con 28 cabezas de consulta y 4 cabezas de clave/valor (GQA), RoPE, activación SwiGLU y un vocabulario de alrededor de 152 000 tokens. DeepSeek lo obtuvo por ajuste supervisado sobre del orden de 800 000 muestras generadas por DeepSeek-R1, sin una fase de RL posterior en los modelos destilados. Ese linaje explica que el modelo base emita cadenas de razonamiento largas dentro de etiquetas ` thinking`, y el adaptador, en principio, conserva esa estructura salvo que el ajuste la haya alterado.

## Capacidades

- Generación de texto y razonamiento multi-paso heredados del modelo base, incluyendo cadenas de pensamiento explícitas antes de la respuesta final.
- Razonamiento matemático y resolución de problemas tipo competición, capacidad por la que destaca el modelo base destilado.
- Generación y comprensión de código; el nombre del adaptador sugiere especialización en Rust, sin confirmar.
- Conversación multi-turno (el pipeline declarado es text-generation y el tag conversational aparece en los metadatos del repositorio).
- Capacidad multilingüe no declarada; el modelo base está entrenado predominantemente en inglés y chino, y el adaptador no documenta idiomas.
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de pensamiento conmutable en la información disponible.
- Capacidad de fusionarse con el modelo base mediante `merge_and_unload()` para producir un checkpoint denso estándar.

## Casos de uso

- Reproducción de experimentos de ajuste fino: el adaptador permite estudiar el efecto de un coeficiente KL igual a cero y de la parada temprana sobre un modelo de razonamiento destilado, comparándolo con el modelo base sin adaptador bajo idénticos prompts.
- Especialización en Rust: si la hipótesis del nombre se confirma, encaja en tareas de generación de código Rust, migración de fragmentos desde C o C++ y revisión de código con explicación del razonamiento.
- Base para ajustes posteriores: al ser un LoRA de 0,7 GB, puede cargarse junto al modelo base y continuar el entrenamiento con otro dataset sin partir del modelo original.
- Generación de datos sintéticos: el modelo base produce trazas de razonamiento largas; el adaptador puede emplearse para generar pares pregunta-respuesta anotados en un dominio concreto, siempre que se valide la calidad.
- Estudio de degradación catastrófica: comparar el adaptador con el modelo base en tareas de matemáticas y conocimiento general permite cuantificar cuánta capacidad se pierde al especializar con LoRA.
- Docencia e investigación sobre PEFT: sirve como ejemplo práctico de carga de adaptadores con `peft`, fusión de pesos y conversión a GGUF para su despliegue en local.
- Experimentos de eficiencia: el ajuste con parada temprana sugiere interés en reducir coste de entrenamiento; el checkpoint puede usarse para estudiar la relación entre pasos de entrenamiento, KL y calidad final.
- No se recomienda su uso en producción con clientes reales sin una evaluación previa, dado que no hay licencia declarada ni métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador en la información disponible. Como referencia externa, el modelo base DeepSeek-R1-Distill-Qwen-7B reporta en el paper de DeepSeek-R1 los siguientes valores (no verificados en esta ficha y no necesariamente extrapolables al adaptador):

| Benchmark | DeepSeek-R1-Distill-Qwen-7B (modelo base) |
|---|---|
| AIME 2024 (pass@1) | 55,5 % |
| MATH-500 (pass@1) | 92,8 % |
| GPQA Diamond (pass@1) | 49,1 % |
| LiveCodeBench (pass@1-COT) | 37,6 % |
| Codeforces (rating) | 1189 |

Estos datos corresponden al checkpoint original de DeepSeek, no al resultado de aplicar el LoRA aquí descrito.

## Requisitos de hardware

- El adaptador ocupa 0,7 GB, pero necesita el modelo base completo para ejecutarse: no es desplegable por sí solo.
- Pesos del modelo base en fp16/bf16: aproximadamente 15-16 GB de VRAM, más la caché KV.
- Caché KV estimada: alrededor de 57 KB por token en fp16 con las 4 cabezas KV del modelo base, es decir, unos 1,8 GB con 32 000 tokens de contexto y unos 7,3 GB con 131 072 tokens.
- Cuantización a 4 bits (GGUF Q4_K_M): en torno a 4,7 GB de pesos, viable en GPU de consumo con 8-12 GB.
- Cuantización a 5-8 bits: entre 5,4 GB (Q5_K_M) y 8,1 GB (Q8_0).
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores con cuantización; RTX 3090/4090 (24 GB) permiten fp16 con contexto moderado.
- GPU de centro de datos: A100 40/80 GB y H100 80 GB para fp16 con lotes grandes y contexto largo; con tensor parallelism se puede servir el modelo en varias GPU.
- Despliegue: transformers + peft (carga directa del adaptador), vLLM con `--enable-lora`, llama.cpp con `--lora` sobre la base en GGUF, TGI o SGLang con soporte de adaptadores. Ollama exige fusionar el LoRA y convertir el resultado a GGUF.
- Rendimiento orientativo para un 7B denso en fp16: del orden de 2 000-4 000 tokens/s agregados con vLLM y lotes grandes en A100/H100, y 100-150 tokens/s en un único flujo sobre RTX 4090. Al tratarse de un modelo de razonamiento, la latencia por respuesta es alta porque genera cientos o miles de tokens de pensamiento antes de la respuesta final.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (LoRA sobre R1-Distill-Qwen-7B) | No disponible (base ~7,6 B) | No disponible | No disponible | HuggingFace, 0 descargas |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 B | Hasta 131 072 tokens | MIT segun su model card publica | HuggingFace |
| Qwen2.5-7B-Instruct | ~7,6 B | 32 768 nativo; 131 072 con YaRN | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | ~8,0 B | 131 072 | Licencia comunitaria Llama 3.1 | HuggingFace / Meta |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32 768 | Apache 2.0 | HuggingFace |

Frente a los modelos base, el adaptador no aporta ninguna ventaja documentada en parámetros, contexto o licencia: su único diferencial es la especialización que sugiere su nombre y que no está evaluada.

## Limitaciones y advertencias

- Ausencia total de licencia: no puede asumirse uso comercial, modificación ni redistribución sin permiso explícito del autor.
- Model card vacía: todos los campos obligatorios (autoría, datos de entrenamiento, evaluación, uso previsto, riesgos) están sin rellenar.
- Sin evaluación publicada: no hay métricas que permitan estimar la calidad del ajuste ni el grado de degradación respecto al modelo base.
- Riesgo de alucinación heredado del modelo base, especialmente en dominios de conocimiento factual poco representados en su corpus de destilación.
- El adaptador no es autónomo: cualquier despliegue requiere descargar y servir el modelo base, con el coste de cómputo y de licencia que ello implica.
- Idiomas no declarados: no hay garantía de un rendimiento aceptable en castellano; el modelo base está orientado a inglés y chino.
- Sesgos heredados del corpus de destilación de DeepSeek-R1, sin filtrado documentado por parte del autor del adaptador.
- Contexto efectivo incierto: aunque el modelo base anuncie 131 072 tokens, el ajuste con LoRA puede haber alterado el comportamiento en contextos largos.
- Los tags incluyen una ruta absoluta de un clúster HPC (`/iopsstor/scratch/...`), señal de que el artefacto se subió desde un entorno de cálculo y con metadatos poco cuidados.
- Sólo existen dos ejecuciones publicadas bajo el mismo esquema de nombres («run2»), lo que indica un estado experimental y no una versión estable.
- No hay evidencias de soporte de tool calling ni de integración con agentes; no debe asumirse en pipelines que dependan de ello.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/nmuendler/DeepSeek-R1-Distill-Qwen-7B-rust-early-stop-run2-kl0
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Modelo DeepSeek-R1: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://arxiv.org/abs/2501.12948
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Repositorio de PEFT: https://github.com/huggingface/peft
- Modelo comparable Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces obtenidos corresponden a Medialon y 7thSense, software de control de espectáculos audiovisuales, sin relación con el repositorio.
