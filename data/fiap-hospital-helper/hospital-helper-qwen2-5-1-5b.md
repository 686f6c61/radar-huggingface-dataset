# fiap-hospital-helper/hospital-helper-qwen2.5-1.5b

## Resumen

El modelo `hospital-helper-qwen2.5-1.5b` es un ajuste fino (fine-tuning) del modelo base Qwen2.5 de 1.500 millones de parámetros, desarrollado por el grupo `fiap-hospital-helper` en el contexto de un proyecto académico de la FIAP (Faculdade de Informática e Administração Paulista, Brasil). Está orientado a un asistente hospitalario, probablemente para tareas de gestión de información médica o administrativa, aunque no se ha publicado documentación específica sobre el dataset ni el proceso de entrenamiento.

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso, con una ventana de contexto nativa de hasta 128K tokens. Al ser un ajuste fino de una versión pequeña, está pensado para entornos con recursos limitados o despliegues en el borde. La información pública es escasa: no se indica licencia, idiomas soportados ni pipeline, y el repositorio solo contiene pesos en formato safetensors (6.2 GB). A pesar de su nombre, no hay evidencia de que sea un modelo especializado clínicamente validado; su uso en producción médica real no está respaldado por datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 128K tokens (nativo en Qwen2.5, no confirmado en este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingue, pero no se ha especificado para este ajuste) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino del Qwen2.5 1.5B, que pertenece a la familia Qwen2.5 de Alibaba. La arquitectura es un transformer decoder-only con atención causal, normalización de capas y embeddings de posición rotatorios (RoPE). El modelo base fue preentrenado con hasta 18 billones de tokens, con una ventana de contexto de 128K tokens, y soporta múltiples idiomas. Sin embargo, no se ha publicado ninguna información sobre el proceso de fine-tuning específico de este modelo: no se detalla el dataset utilizado, la técnica de alineación (RLHF, DPO, SFT) ni los hiperparámetros de entrenamiento. El repositorio solo contiene los pesos en safetensors, sin ficha técnica ni documentación adicional.

## Capacidades
- Generacion de texto: el modelo base Qwen2.5 1.5B es capaz de generar texto coherente en múltiples idiomas, aunque el ajuste fino puede haber limitado o especializado su dominio.
- Razonamiento y matematicas: el modelo base demuestra habilidades básicas de razonamiento y matematicas para su tamano, pero no hay datos que confirmen que el fine-tune las haya preservado o mejorado.
- Codigo: el modelo base tiene cierta capacidad de generacion de codigo, pero no se ha validado en este ajuste.
- Tool calling y function calling: no se menciona en la informacion disponible; el modelo base Qwen2.5 1.5B no soporta nativamente tool calling en su version instruct, aunque puede ser habilitado con tecnicas externas.
- Soporte de agentes: no confirmado.
- Capacidades multilingues: el modelo base es multilingue, pero no se sabe si el fine-tune lo ha restringido a un idioma o dominio.
- Capacidades especiales: no hay evidencia de vision, audio ni modo thinking.

## Casos de uso
- Asistencia administrativa en hospitales: el modelo puede responder preguntas frecuentes sobre procedimientos, horarios o informacion general para pacientes y personal, si el fine-tune se realizo con datos de ese dominio.
- Gestion de citas y recordatorios: mediante generacion de texto, podria redactar avisos y confirmaciones para pacientes, aunque no se ha demostrado su eficacia.
- Soporte interno de documentacion clinica: podria ayudar a redactar notas o resumenes de historias clinicas, pero sin validacion medica no es recomendable.
- Clasificacion de triage basico: el modelo podria generar respuestas preliminares a sintomas descritos, pero sin garantias de seguridad.
- Entrenamiento de personal: podria servir como material de consulta para estudiantes de enfermeria o medicina, siempre con supervisión.
- Prototipos de chatbot en entornos de investigacion: para pruebas de concepto academicas, no en produccion real.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K ni otros. No se puede comparar su rendimiento con otros modelos sin datos reales.

## Requisitos de hardware
- VRAM estimada para inferencia: para un modelo de 1.5B en FP32 se necesitan aproximadamente 6 GB de VRAM; con cuantizacion INT8 baja a ~3 GB, y con Q4 a ~1.5 GB. Sin embargo, el repo solo tiene pesos en FP32 (6.2 GB), por lo que la inferencia directa requeriria alrededor de 6-7 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB) o superior, o GPUs con al menos 8 GB para FP32. Para cuantizacion, una RTX 2060 (6 GB) seria suficiente.
- Cabe en consumer GPU: si, en GPUs con 6 GB o mas, especialmente si se cuantiza.
- Opciones de despliegue: se puede usar con llama.cpp (formato GGUF), Ollama (si se convierte), vLLM (con adaptaciones), Hugging Face transformers, o TGI. No se ha publicado una configuracion oficial.
- Latencia y throughput: no se conocen datos especificos. Para un modelo de 1.5B en una GPU moderna, se espera una velocidad de decodificacion de 30-60 tokens/s en FP16, pero no esta medido.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Rendimiento (MMLU) | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5 1.5B (base) | 1.5B | 128K | Apache 2.0 | ~58% (aprox.) | Hugging Face, Ollama |
| Llama 3.2 1B | 1.23B | 128K | Llama 3.2 license | ~49% (aprox.) | Hugging Face |
| Phi-3.5-mini | 3.8B | 128K | MIT | ~69% (aprox.) | Hugging Face |
| hospital-helper-qwen2.5-1.5b | 1.5B | 128K (base) | no disponible | no disponible | Hugging Face |

Nota: los datos de rendimiento de los modelos base son orientativos y proceden de informacion publica. El modelo hospital-helper no tiene benchmarks propios.

## Limitaciones y advertencias
- Sesgos conocidos: no se ha realizado una evaluacion de sesgos especifica para este fine-tune. El modelo base Qwen2.5 puede heredar sesgos de su preentrenamiento.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inexacta, especialmente en el ambito medico, donde la precision es critica.
- Limitaciones de contexto: aunque el base soporta 128K tokens, no se ha confirmado que el fine-tune haya preservado esa longitud de contexto; puede estar reducida.
- Restricciones de licencia: la licencia no esta indicada; por tanto, no se puede garantizar su uso comercial. Debe contactarse con el autor.
- Caveat de produccion: no hay evidencia de validacion clinica o de seguridad. No debe usarse en entornos medicos reales sin supervision humana y sin una evaluacion exhaustiva.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/fiap-hospital-helper/hospital-helper-qwen2.5-1.5b)
- [Organizacion FIAP-TechChallenge-Fase3-Hospital-Helper](https://huggingface.co/fiap-hospital-helper/models)
- [Repositorio GitHub de Qwen2.5 (referencia del modelo base)](https://github.com/mx4ai/qwen2.5)
- [Qwen2.5 1.5B en Ollama](https://ollama.com/library/qwen2.5:1.5b)
