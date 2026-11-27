# Deadcracker23/Llama3.2-Agent.Hermes.Coder-3B-gguf

## Resumen

Llama3.2-Agent.Hermes.Coder-3B es un modelo de lenguaje conversacional de 3.212.756.032 parámetros (aproximadamente 3,2 mil millones) derivado de la familia LLaMA 3.2 de Meta y afinado sobre la base de NousResearch/Hermes-3-Llama-3.2-3B. Lo publica el usuario Deadcracker23 en Hugging Face bajo la organización Within Us AI, y se distribuye exclusivamente en formato GGUF cuantizado, pensado para inferencia local y entornos con recursos limitados. El repositorio ocupa 4,3 GB y no registra descargas ni interacciones en el momento de la consulta.

El modelo está orientado a tareas de programación agéntica: generación y refactorización de código, descomposición de tareas en pasos, llamada a funciones y producción de salidas estructuradas (JSON, esquemas). La model card describe un perfil de capacidades con instrucción y salida estructurada como puntos fuertes ("Very High") y razonamiento profundo como moderado, coherente con su tamaño compacto.

Su relevancia práctica radica en la posibilidad de ejecutar un asistente de código con soporte de tool calling en hardware de consumo, mediante llama.cpp, LM Studio u Ollama. La información disponible es escasa: no hay resultados de benchmarks, no se detalla la licencia efectiva más allá de la herencia de LLaMA 3 y Hermes 3, y no se especifican idiomas soportados ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA 3.2, 3B), afinado estilo Hermes 3 |
| Parametros totales | 3.212.756.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~2,0 GB), Q5_K_M (~2,3 GB), Q8_0 (~3,4 GB); otros niveles GGUF no confirmados |
| Idiomas soportados | no disponible |
| Licencia | no disponible como licencia explícita; la model card indica licencia compatible con LLaMA 3 / Hermes 3 (hereda restricciones de la base) |
| Formato de pesos | GGUF (quantizado con llama.cpp); no se publican safetensors en el repo |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LLaMA 3.2 de 3B parámetros, un transformer decoder-only con atención causal estándar, y aplica un fine-tuning sobre NousResearch/Hermes-3-Llama-3.2-3B, conocido por su alineamiento orientado a instrucciones, estabilidad multi-turno y soporte de function calling. La conversión a GGUF se realizó con el toolchain de llama.cpp, e incluye el tag `imatrix`, lo que sugiere el uso de una matriz de importancia para la cuantización.

El entrenamiento se apoya en una mezcla de datasets públicos declarados en la model card: OpenCoder-LLM/opc-sft-stage1 y opc-sft-stage2, microsoft/orca-agentinstruct-1M-v1, microsoft/orca-math-word-problems-200k, NousResearch/hermes-function-calling-v1, AI-MO/NuminaMath-CoT, AI-MO/NuminaMath-TIR, allenai/tulu-3-sft-mixture, cognitivecomputations/dolphin-coder, HuggingFaceTB/smoltalk, cognitivecomputations/samantha-data, m-a-p/CodeFeedback-Filtered-Instruction y m-a-p/Code-Feedback. No se especifican el número de tokens de entrenamiento, la composición exacta de la mezcla, ni si hubo etapas de RLHF o DPO. La model card menciona además "datasets propietarios" de Within Us AI sin detallar su contenido.

## Capacidades

- Generación de código en Python, JavaScript, C++ y otros lenguajes, según la model card.
- Refactorización de funciones y corrección estructurada de errores (debugging).
- Descomposición de tareas y planificación de ejecución paso a paso (comportamiento agéntico).
- Soporte de function calling y tool use, heredado del alineamiento Hermes 3 y reforzado con hermes-function-calling-v1.
- Generación de salidas estructuradas: JSON, seguimiento de esquemas y formato determinista.
- Razonamiento tipo chain-of-thought y desglose lógico de problemas.
- Conversación multi-turno con instrucción precisa.
- Capacidades multilingües: no disponibles (no se especifican idiomas).
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente de código local: ejecutable con llama.cpp u Ollama en un portátil, permite autocompletado, generación de funciones y explicación de código sin conexión ni envío de datos a terceros.
- Pipelines de agentes con tool calling: el modelo puede emitir llamadas a funciones en formato estructurado y encadenar pasos, integrándose en frameworks de agentes que ejecuten las herramientas externamente.
- Generación de APIs y validadores: a partir de una descripción, produce esquemas JSON y código de validación (el ejemplo de la model card pide un esquema JSON y un validador en Python para autenticación de usuarios).
- Automatización de tareas de refactorización en CI/CD: con prompts bien estructurados, puede generar parches acotados y revisables antes de aplicarlos, dado su sesgo hacia salidas deterministas.
- Prototipado rápido en entornos con GPU de consumo: su huella de ~2 GB en Q4_K_M permite iterar en estaciones de trabajo modestas sin infraestructura dedicada.
- Enseñanza y experimentación con agentes: su tamaño reducido y su formato GGUF lo hacen adecuado para laboratorios y cursos donde se prueba orquestación de herramientas y salidas estructuradas.
- Extracción de datos estructurados de texto: generación de JSON conforme a esquema para tareas de parsing y clasificación en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente ofrece un perfil cualitativo de capacidades (codificación alta, seguimiento de instrucciones muy alto, salida estructurada muy alta, profundidad de razonamiento moderada, eficiencia muy alta), sin métricas numéricas ni comparaciones medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,0 GB en Q4_K_M, ~2,3 GB en Q5_K_M y ~3,4 GB en Q8_0, más overhead de contexto KV cache (no cuantificado en la información disponible).
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con 4-6 GB de VRAM es suficiente para las cuantizaciones indicadas.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama (builds compatibles con GGUF), según la model card. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama3.2-Agent.Hermes.Coder-3B | 3,21 B | no disponible | GGUF | hereda LLaMA 3 / Hermes 3 | Enfoque agéntico y de código; sin benchmarks publicados |
| NousResearch/Hermes-3-Llama-3.2-3B (base) | ~3 B | no disponible en esta ficha | safetensors y GGUF | LLaMA 3 | Modelo de referencia del que deriva; alineamiento generalista |
| Meta Llama 3.2 3B Instruct | ~3 B | 128 K (según documentación de Meta, no verificada aquí) | safetensors, GGUF | Llama 3.2 Community License | Base generalista; sin el sesgo de código agéntico |
| Qwen2.5-Coder-3B | ~3 B | no disponible en esta ficha | safetensors, GGUF | Apache 2.0 (según su model card) | Alternativa de código con licencia permisiva |

Los datos de contexto y licencia de los modelos comparados deben verificarse en sus respectivas model cards; aquí solo se indican como referencia orientativa.

## Limitaciones y advertencias

- Tamaño de 3B: profundidad de razonamiento limitada frente a modelos de 7B o superiores; la propia model card lo reconoce.
- Requiere prompts bien estructurados para rendir según lo esperado; la calidad cae con instrucciones ambiguas.
- La ejecución de herramientas debe gestionarse externamente; el modelo solo emite la llamada.
- Riesgo de alucinación inherente a modelos de este tamaño, especialmente en razonamiento matemático y factual.
- Sesgos conocidos: no documentados en la información disponible; al derivar de LLaMA 3.2 y de mezclas de datasets públicos, hereda los sesgos de estas fuentes.
- Idiomas soportados no especificados; no se garantiza un rendimiento correcto en castellano.
- Licencia no declarada explícitamente: la model card remite a la compatibilidad con LLaMA 3 y Hermes 3, por lo que el uso comercial queda sujeto a las restricciones de la Llama 3 Community License y a las condiciones de Hermes 3.
- Repositorio sin descargas ni validación comunitaria; no hay evidencia independiente de calidad.
- Inconsistencia de autoría: el ID de Hugging Face es Deadcracker23, mientras que la model card atribuye el modelo a WithinUsAI.
- No se publican safetensors ni datos de evaluación reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deadcracker23/Llama3.2-Agent.Hermes.Coder-3B-gguf
- Organización citada en la model card: https://huggingface.co/WithinUsAI
- Modelo base citado: https://huggingface.co/NousResearch/Hermes-3-Llama-3.2-3B
- Familia LLaMA 3.2 de Meta: https://huggingface.co/meta-llama
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
