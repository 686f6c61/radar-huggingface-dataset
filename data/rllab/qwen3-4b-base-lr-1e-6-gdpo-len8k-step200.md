# RLLab/qwen3-4b-base-lr-1e-6-gdpo-len8k-step200

## Resumen

El modelo RLLab/qwen3-4b-base-lr-1e-6-gdpo-len8k-step200 es un ajuste fino publicado por el usuario RLLab sobre la base de Qwen3-4B, distribuido en formato safetensors a traves de HuggingFace Transformers. Cuenta con 4.022.468.096 parametros (unos 4,02 mil millones) y se situa en la categoria de modelos densos de tamano pequeno-medio, aptos para inferencia en GPU de consumo. El identificador del repositorio sugiere un entrenamiento con GDPO, una tasa de aprendizaje de 1e-6, una longitud de secuencia de 8.000 tokens y 200 pasos.

Su relevancia radica en que se apoya en la familia Qwen3, muy utilizada en el ecosistema abierto por su equilibrio entre rendimiento y coste computacional, y en que constituye un experimento de alineacion sobre esa base. Sin embargo, la model card publicada es la plantilla autogenerada de HuggingFace y no aporta informacion sobre datos de entrenamiento, licencia, idiomas ni evaluacion.

Por ese motivo, buena parte de la ficha se marca como "no disponible" y se complementa, cuando procede, con los datos conocidos del modelo base Qwen3-4B. Se recomienda precaucion antes de emplearlo en produccion: la ausencia de licencia declarada deja su uso comercial en un limbo legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen3-4B |
| Parametros totales | 4.022.468.096 (~4,02 mil millones) |
| Longitud de contexto | no disponible para este checkpoint; el modelo base Qwen3-4B soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar, presumiblemente BF16 o FP16) |
| Idiomas soportados | no disponible (Qwen3 base declara soporte de 119 idiomas y dialectos) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 8,1 GB) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura de Qwen3-4B: un transformer decoder-only denso con Grouped Query Attention (GQA), normalizacion QK-Norm y embeddings rotatorios (RoPE). En su variante base, Qwen3-4B se entreno sobre corpus multilingues masivos y emplea un tokenizador BPE con un vocabulario amplio, lo que favorece el rendimiento multilingue. El modelo preserva la estructura de pesos del base, por lo que es compatible con las herramientas estandar de Transformers.

Sobre el proceso de ajuste solo puede inferirse informacion del nombre del repositorio: parece tratarse de un entrenamiento con GDPO (probablemente una variante de optimizacion de preferencias tipo DPO/GRPO), con learning rate 1e-6, secuencia de 8.000 tokens y 200 pasos. No se documenta el dataset utilizado, si hubo fases de SFT previas, ni la composicion de los datos de preferencia. Tampoco se detalla si se aplicaron tecnicas como decodificacion especulativa o atencion lineal: no disponibles.

## Capacidades

- Generacion de texto autoregresiva y continuacion de secuencias, heredadas del modelo base.
- Razonamiento y matematicas basicas, en el rango tipico de los modelos de ~4B del ecosistema Qwen3.
- Generacion de codigo, con soporte habitual de lenguajes mayoritarios (Python, JavaScript, C++, etc.) en funcion de los datos del base.
- Capacidades multilingues derivadas de Qwen3-4B-Base, que declara soporte de 119 idiomas.
- Soporte de tool calling y function calling: no confirmado en este checkpoint; en el base depende de la version instruct.
- Modo de razonamiento explicito (thinking mode): no disponible en este fine-tune.
- Vision, audio u otras modalidades: no soportadas (modelo exclusivamente de texto).

## Casos de uso

- Experimentacion academica en alineacion: el checkpoint permite reproducir o comparar tecnicas de DPO/GRPO sobre una base pequena y bien conocida como Qwen3-4B-Base, con coste de entrenamiento reducido.
- Prototipado de asistentes conversacionales: al ser un modelo denso de 4B, se puede desplegar en una unica GPU para iterar rapidamente sobre prompts y flujos multi-turno.
- Evaluacion comparativa de checkpoints intermedios: util para estudiar como evoluciona la preferencia alineada a lo largo de los 200 pasos declarados.
- Generacion de texto en entornos con recursos limitados: cabe en GPUs de consumo en cuantizacion INT4 o INT8, lo que permite usarlo en estaciones de trabajo sin aceleradores de datacenter.
- Filtrado y resumen de documentos en pipelines internos: su ventana de 8.000 tokens de entrenamiento (y hasta 32.768 del base) permite procesar articulos o informes medianos.
- Base para fine-tunes especificos de dominio: al mantener la arquitectura Qwen3, puede reajustarse con LoRA o QLoRA para tareas verticales.
- Investigacion sobre sesgos y seguridad: util como sujeto de estudio en trabajos que analicen el efecto de la alineacion por preferencias en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tabla de evaluacion, y no se dispone de cifras de MMLU, HumanEval, GSM8K ni de metricas de preferencia (win rate, MT-Bench, AlpacaEval) para este checkpoint concreto. Cualquier cifra atribuida al modelo base Qwen3-4B no es directamente extrapolable al resultado de este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16 los pesos ocupan ~8,0 GB, a los que hay que sumar KV cache y activaciones (2-4 GB adicionales segun contexto y batch). En INT8/FP8 baja a ~4-5 GB y en INT4 a ~2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir con lotes grandes y alto throughput; RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4060 Ti (16 GB) o RTX 3060 (12 GB) para inferencia individual en FP16 o cuantizada.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU con 8 GB o mas en INT4, y en 12-16 GB en FP16 con contextos moderados.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), SGLang y HuggingFace Transformers para servir en linea; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF.
- Latencia y throughput estimados: no disponibles. Al no publicarse mediciones, no se ofrecen cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RLLab/qwen3-4b-base-lr-1e-6-gdpo-len8k-step200 | 4,02 B | no disponible (base: 32.768, YaRN 131.072) | no disponible | HuggingFace, safetensors |
| Qwen/Qwen3-4B-Base | ~4 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, safetensors, GGUF |
| Qwen/Qwen3-4B (instruct) | ~4 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | HuggingFace, safetensors, GGUF |
| meta-llama/Llama-3.2-3B | 3,2 B | 128.000 | Llama 3.2 Community License | HuggingFace, safetensors, GGUF |

La comparativa se limita a parametros, contexto y licencia porque no hay datos publicados de rendimiento para el checkpoint de RLLab. Frente a las alternativas oficiales, la principal diferencia es la falta de licencia declarada, que restringe su uso comercial, y la ausencia de variantes GGUF listas para llama.cpp u Ollama.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al derivar de Qwen3-4B-Base, hereda los sesgos presentes en los corpus de entrenamiento del modelo original, pero no se han publicado analisis especificos.
- Riesgo de alucinacion: esperable en modelos de ~4B, especialmente en tareas de conocimiento factual y razonamiento de multiples pasos. No se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto: el entrenamiento se realizo con secuencias de 8.000 tokens, por lo que el rendimiento puede degradarse mas alla de esa longitud aunque el base soporte 32.768.
- Idiomas: la model card no declara idiomas soportados. Aunque el base sea multilingue, el ajuste con GDPO podria haber alterado el equilibrio entre idiomas.
- Restricciones de licencia: la licencia aparece como "no disponible", lo que impide confirmar si se permite el uso comercial. No debe utilizarse en produccion sin aclarar este punto.
- Caveat de procedencia: es un checkpoint de investigacion publicado por un usuario no oficial de Qwen, sin paper asociado ni validacion por pares.
- Caveat de alineacion: el objetivo del ajuste con preferencias no esta documentado, por lo que se desconoce que comportamiento se optimizo ni con que datos.
- Reproducibilidad: sin datos del dataset ni de la receta de entrenamiento, los resultados no son facilmente reproducibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RLLab/qwen3-4b-base-lr-1e-6-gdpo-len8k-step200
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Ficha de Qwen3-4B-Base en LocalLLMs: https://localllms.dev/llm/qwenqwen3-4b-base/
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/RLLab/qwen3-4b-base
- Referencia citada en la model card (Lacoste et al.): https://arxiv.org/abs/1910.09700
