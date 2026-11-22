# arfeen2006/Fine-tuning-LLM-using-QLoRA

## Resumen

SQL-Craft es un ajuste fino mediante QLoRA de 4 bits del modelo Qwen2.5-Coder-7B-Instruct, orientado específicamente a la generación de SQL a partir de lenguaje natural (text-to-SQL). Lo desarrolla el usuario arfeen2006 y se distribuye como adaptador LoRA/PEFT sobre el modelo base de Alibaba Qwen. El objetivo declarado es reducir la alucinación de esquemas y mejorar la adherencia a dialectos SQL en entornos empresariales, ejecutándose de forma local sin envío de datos a la nube.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-Coder-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens (según las especificaciones del modelo base). El ajuste se realizó con cuantización NF4 de 4 bits y PEFT/TRL, con un pipeline dual: entrenamiento e inferencia nativos en Apple Silicon mediante `mlx-lm` y una ruta alternativa en GPU NVIDIA con `bitsandbytes`.

Su relevancia radica en el enfoque de despliegue: el autor reporta ejecución 100% local en Apple Silicon M4 con un pico de 12,32 GB de memoria unificada durante el entrenamiento, lo que permite integrar un motor text-to-SQL en infraestructura de escritorio sin coste por token. Los resultados declarados (87,5% de exactitud de ejecución y 96,8% de sintaxis válida) provienen de la evaluación interna del autor y no de un benchmark independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA |
| Parametros totales | ~7.600 millones (modelo base; el adaptador LoRA añade un subconjunto no especificado) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-Coder-7B-Instruct) |
| Tipos de cuantizacion | QLoRA 4 bits NF4 (bitsandbytes) en entrenamiento; cuantización afín de 4 bits en MLX; exportación GGUF Q4_K_M mencionada |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT); exportación a GGUF y Modelfile de Ollama mencionadas |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptación de bajo rango (LoRA) sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso con atención por ventanas deslizantes y atención completa combinadas, diseñado originalmente para tareas de código. El entrenamiento emplea QLoRA: el modelo base se cuantiza a 4 bits en formato NF4 y se entrenan únicamente los adaptadores LoRA, lo que reduce drásticamente los requisitos de memoria. El autor reporta un pico de 12,32 GB de memoria unificada durante el entrenamiento en un Apple Silicon M4 de 24 GB, con 11,68 GB de margen libre.

La innovación principal no está en la arquitectura, sino en el pipeline de entrenamiento y despliegue multiplataforma: una ruta nativa para Apple Silicon basada en `mlx-lm` y una ruta para GPU NVIDIA basada en `peft` + `bitsandbytes` + `trl`. El corpus de entrenamiento no se detalla en la información disponible (número de tokens, composición del dataset ni uso de RLHF/DPO no disponibles). La evaluación se realizó contra un sandbox de ejecución SQLite aislado y validación sintáctica mediante AST con `sqlglot`.

## Capacidades

- Generación de SQL a partir de lenguaje natural (text-to-SQL) con condicionamiento por esquema de base de datos.
- Adherencia a dialectos SQL específicos (MySQL, PostgreSQL, SQLite), con una tasa declarada de sintaxis válida del 96,8% verificada por AST.
- Reducción de alucinación de esquemas: el autor reporta una caída del 75,60% (de 16,8% a 4,1%).
- Generación de código en general, heredada del modelo base Qwen2.5-Coder.
- Razonamiento multi-paso sobre esquemas relacionales y claves foráneas.
- Soporte de tool calling y function calling: heredado del modelo base Instruct, aunque no se documenta explícitamente en la model card.
- Capacidades multilingües: limitadas al inglés según la declaración de la model card, aunque el modelo base soporta más idiomas.
- Modo de despliegue local air-gapped sin salida de datos.

## Casos de uso

- Asistente text-to-SQL en herramientas de BI: el modelo traduce preguntas de negocio en consultas SQL ejecutables contra un esquema conocido, con validación sintáctica previa para evitar errores en producción.
- Generación de consultas en pipelines de datos: integración en orquestadores (Airflow, dbt) para generar SQL de transformación a partir de descripciones en lenguaje natural, aprovechando la ventana de 32.768 tokens para incluir esquemas extensos.
- Copiloto de desarrollo en IDE: autocompletado y generación de consultas dentro del editor, ejecutándose localmente en un Mac con Apple Silicon sin latencia de red (TTFT declarado de 92 ms).
- Atención al cliente interna sobre bases de datos: un agente que responde preguntas de empleados traduciéndolas a SQL y ejecutándolas contra réplicas de lectura, con el modelo desplegado on-premise para cumplir requisitos de privacidad.
- Migración entre dialectos SQL: uso del modelo para reescribir consultas de MySQL a PostgreSQL o SQLite, apoyándose en la validación AST con `sqlglot`.
- Entornos con requisitos de cumplimiento estrictos: despliegue air-gapped en infraestructura propia donde no está permitido enviar esquemas ni datos a APIs externas.
- Prototipado rápido en portátiles: despliegue con Ollama o MLX en equipos de desarrollo sin GPU dedicada, gracias al formato GGUF Q4_K_M y al soporte nativo de Metal.

## Benchmarks y rendimiento

Los datos provienen de la evaluación interna del autor contra un sandbox SQLite aislado; no se han verificado de forma independiente.

| Metrica | Antes (Qwen2.5-Coder-7B-Instruct) | Despues (SQL-Craft QLoRA) | Variacion |
|---|---|---|---|
| Exactitud de ejecucion (EX) | 62,1% | 87,5% | +40,90% relativo |
| Tasa de sintaxis valida (VSR) | 78,4% (implícito) | 96,8% | +23,47% |
| Alucinacion de esquema | 16,8% | 4,1% | -75,60% |
| TTFT en Apple Silicon M4 | no disponible | 92 ms | no disponible |
| Pico de memoria en entrenamiento | no disponible | 12,32 GB | no disponible |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, BIRD, Spider) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta 12,32 GB de pico durante el entrenamiento con QLoRA de 4 bits; la inferencia en 4 bits debería situarse por debajo de esa cifra, aunque no se especifica.
- GPU recomendadas: Apple Silicon M4 con 24 GB de memoria unificada (ruta nativa MLX); GPU NVIDIA para la ruta CUDA (modelo concreto no especificado).
- Cabe en GPU de consumo: sí, en Apple Silicon con al menos 16-24 GB de memoria unificada; en NVIDIA, una RTX 4090 de 24 GB debería ser suficiente para inferencia en 4 bits, aunque no se documenta explícitamente.
- Opciones de despliegue: `mlx-lm` (Apple Silicon), Ollama con `Modelfile`, GGUF Q4_K_M, `peft` + `bitsandbytes` + `trl` en CUDA, y una interfaz web Gradio mencionada en la model card.
- Latencia y throughput: TTFT declarado de 92 ms en M4; no se proporcionan cifras de throughput (tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SQL-Craft (este modelo) | ~7,6B (base) + LoRA | 32.768 | Text-to-SQL ajustado con QLoRA | MIT | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | ~7,6B | 32.768 | Código generalista | Apache 2.0 | Hugging Face |
| CodeLlama-7B-Instruct | ~6,7B | 16.384 | Código generalista | Llama 2 | Hugging Face |
| SQLCoder-7B-2 | ~6,7B | 4.096 | Text-to-SQL especializado | CC BY-SA 4.0 | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada; los benchmarks del autor solo comparan contra el modelo base sin ajustar.

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor y no han sido verificados de forma independiente; deben tratarse con cautela.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- El ajuste está especializado en text-to-SQL, lo que puede degradar capacidades generales del modelo base (olvido catastrófico parcial).
- Riesgo de alucinación residual del 4,1% en esquemas, según el propio autor; en producción conviene validar las consultas antes de ejecutarlas.
- El repositorio registra 0 descargas y 0 likes, sin validación por parte de la comunidad.
- La licencia MIT se aplica al adaptador, pero el modelo base Qwen2.5-Coder se distribuye bajo Apache 2.0; conviene verificar la compatibilidad en uso comercial.
- Las fechas de creación y actualización del repositorio son inconsistentes (creado 2026-11-22, actualizado 2026-10-19), lo que sugiere metadatos poco fiables.
- No se documenta el corpus de entrenamiento, por lo que no es posible evaluar sesgos ni cobertura de dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arfeen2006/Fine-tuning-LLM-using-QLoRA
- Repositorio GitHub: https://github.com/asmohamedarfeen/Fine-tuning-LLM-using-QLoRA
- Informe técnico de benchmarks: report.md (referenciado en la model card)
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- MLX (Apple): https://github.com/ml-explore/mlx
- Documentación PEFT: https://huggingface.co/docs/peft/index
