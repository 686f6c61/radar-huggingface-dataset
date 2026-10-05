# mutahfon/clinical-qlora-qwen2.5-3b

## Resumen

Clinical-LLM es un adaptador LoRA de tipo QLoRA que ajusta el modelo base Qwen/Qwen2.5-3B-Instruct para tareas de pregunta-respuesta en el ambito de la informatica clinica. Lo desarrolla el usuario mutahfon como proyecto de investigacion y portfolio, y se distribuye como pesos de adaptador (rank 16, aproximadamente 30 millones de parametros entrenables, menos del 1 por ciento de los pesos del modelo base) sobre el repositorio base de Qwen. El problema que aborda es la adaptacion de un modelo generalista de 3B de parametros a dominios medicos concretos sin necesidad de reentrenar los pesos completos.

La relevancia del proyecto reside en su enfoque metodologico: la model card documenta una evaluacion con McNemar pareado y puntuacion por log-verosimilitud restringida a letras sobre 1.000 items por benchmark, mostrando mejoras medibles sobre el modelo base incluso en MedQA, un conjunto totalmente ausente del entrenamiento (de 42,90 por ciento a 50,80 por ciento, +7,90 puntos porcentuales). Tambien declara explicitamente los retrocesos (entre 71 y 98 respuestas antes correctas pasan a ser incorrectas por benchmark), lo que lo convierte en un caso util para estudiar los limites del fine-tuning ligero.

El modelo se apoya en la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con 3.090 millones de parametros en el modelo base y una ventana de contexto de 32.768 tokens en su configuracion nativa. El adaptador se ha entrenado sobre una base cuantizada a 4 bits NF4 y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-3B-Instruct) + adaptador LoRA/QLoRA |
| Parametros totales | 3.090 millones en el modelo base; adaptador de aproximadamente 30 millones de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 (QLoRA); el adaptador se distribuye en precision completa en safetensors y puede fusionarse y recuantizarse |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (licencia de investigacion de Qwen; el codigo del proyecto es MIT) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only con 3.090 millones de parametros y atencion causal estandar. El ajuste emplea QLoRA con supervision fina (SFT) sobre una base cuantizada a 4 bits NF4, con LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a todas las proyecciones de atencion y de la MLP. Las herramientas utilizadas fueron PEFT 0.21.0, TRL 1.14.1, Transformers 5.17.0 y PyTorch 2.11.0. El entrenamiento se ejecuto durante 700 pasos con lote efectivo de 16 (11.200 muestras, aproximadamente 4,4 millones de tokens, unas 0,17 epocas), con tasa de aprendizaje 2e-4, sin empaquetado de secuencias y con una perdida de validacion final de 1,105.

El corpus de entrenamiento consta de 66.407 ejemplos: 25.000 de MedMCQA, 16.407 de MedQuAD y 25.000 de PubMedQA en su configuracion `pqa_artificial`. Todos los ejemplos se renderizaron mediante una unica plantilla de chat con un system prompt fijo orientado a informatica clinica. No se menciona el uso de RLHF ni DPO; el metodo es exclusivamente SFT con QLoRA. Una innovacion metodologica destacable es la evaluacion con test de McNemar pareado y puntuacion por log-verosimilitud restringida a letras sobre los mismos 1.000 items por benchmark, lo que permite medir tanto ganancias como perdidas respecto al base.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (roles system/user/assistant).
- Respuesta a preguntas de conocimiento medico y de informatica clinica, especialmente en formato de eleccion multiple.
- Razonamiento basico sobre contenido biomedico heredado de los conjuntos MedMCQA, MedQuAD y PubMedQA.
- Adopcion de un system prompt especifico que define el tono (conciso, orientado a evidencia, define abreviaturas, admite incertidumbre).
- Generacion autoregresiva estandar; no se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades de vision ni de audio.
- Capacidad multilingue limitada al ingles.
- No se documenta un modo de razonamiento explicito (thinking mode).

## Casos de uso

- Consulta bibliografica asistida para investigadores: el adaptador responde preguntas de tipo test sobre literatura biomedica, util como herramienta de estudio y no como fuente de decisiones clinicas.
- Formacion medica y autoevaluacion: sirve para generar y responder preguntas estilo USMLE o de curriculo indio, aprovechando el ajuste sobre MedMCQA y su mejora en MedQA.
- Prototipado de asistentes de informatica clinica: proporciona una base de 3B de parametros que cabe en hardware modesto para validar interfaces conversacionales antes de escalar a modelos mayores.
- Investigacion sobre eficiencia de fine-tuning: al documentar ganancias y retrocesos con metrica pareada, es util como caso de estudio reproducible de QLoRA en dominios especializados.
- Clasificacion y respuesta de preguntas de eleccion multiple: con puntuacion por log-verosimilitud restringida a letras, encaja en pipelines de evaluacion automatizada de conocimiento medico.
- Extraccion de respuestas breves en ingles a partir de preguntas de salud del consumidor, aprovechando el ajuste sobre MedQuAD, siempre con supervision humana.
- Base para experimentos academicos de adaptacion de dominio: su licencia de investigacion y su tamano reducido lo hacen adecuado para entornos de laboratorio.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre los mismos 1.000 items por benchmark, con test de McNemar pareado y puntuacion por log-verosimilitud restringida a letras:

| Benchmark | Base | Fine-tuned | Delta | McNemar p | Corregidas : regresadas |
|---|---:|---:|---:|---:|---:|
| MedQA (USMLE, test) | 42,90 % | 50,80 % | +7,90 pp | 1,5x10^-7 | 150 : 71 |
| MedMCQA (val) | 47,10 % | 52,70 % | +5,60 pp | 5,3x10^-4 | 154 : 98 |
| PubMedQA (`pqa_labeled`) | 64,10 % | 73,60 % | +9,50 pp | 1,4x10^-9 | 168 : 73 |

Notas de interpretacion aportadas por el autor: MedQA esta totalmente ausente del entrenamiento (0 por ciento del corpus) y aun asi mejora 7,90 puntos; el valor absoluto (cerca del 51 por ciento en USMLE) indica que un modelo de 3B no es un razonador clinico fuerte; en todos los benchmarks el adaptador tambien convierte entre 71 y 98 respuestas previamente correctas en incorrectas; PubMedQA comparte tarea y fuente con el entrenamiento (aunque con 0 pubids en comun) y no es estrictamente fuera de distribucion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,2 GB en FP16 para el modelo base de 3B; alrededor de 2 GB si se cuantiza a 4 bits (NF4/GGUF Q4).
- GPU recomendadas para FP16: cualquier GPU con 8 GB o mas, como RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4; para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GB de VRAM segun cuantizacion (por ejemplo RTX 3060, RTX 4060, RTX 4090).
- Opciones de despliegue: PEFT + Transformers (metodo documentado en la model card), vLLM, llama.cpp, Ollama y TGI tras fusionar el adaptador con el base y, si procede, cuantizar.
- El autor indica half precision solo en GPU o Apple Silicon; en CPU se usa float32 y el rendimiento es mucho menor.
- Latencia y throughput estimados: no disponible.
- Tamano del repositorio: 0,1 GB (solo pesos del adaptador).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| mutahfon/clinical-qlora-qwen2.5-3b | 3B (base) + ~30M adaptador | 32.768 | Adaptador QLoRA para QA clinico | qwen-research | Solo ingles; benchmarks MedQA/MedMCQA/PubMedQA publicados |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Modelo base generalista | qwen-research | Punto de partida del adaptador; referencia de los deltas |
| BioMistral-7B | 7B | 8.192 (Mistral base) | Modelo medico ajustado | Apache 2.0 | Mayor tamano; datos de benchmark no comparables en la informacion disponible |
| Meditron-7B | 7B | 4.096 (Llama 2 base) | Modelo medico ajustado | Llama 2 | Mayor tamano; datos de benchmark no comparables en la informacion disponible |

Los datos de benchmark de BioMistral-7B y Meditron-7B no estan incluidos en la informacion proporcionada para este adaptador; la comparativa se limita a parametros, contexto y licencia. Comparacion directa de rendimiento entre estos modelos: no disponible.

## Limitaciones y advertencias

- Puede producir afirmaciones medicas fluidas pero incorrectas; el tono seguro no implica correccion.
- No es un dispositivo medico y no debe usarse para diagnostico, tratamiento ni decisiones clinicas.
- Los tres benchmarks de evaluacion son de eleccion multiple; no se evaluan la calidad de generacion libre, la calibracion ni la seguridad.
- Sesgos de origen: MedMCQA esta sesgado hacia el curriculo medico indio y MedQuAD hacia salud del consumidor estadounidense; esos sesgos se trasladan al adaptador.
- MedQA ya no es un conjunto de test intacto para futuros ajustes, al haberse puntuado una vez por version del adaptador.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La licencia es qwen-research (licencia de investigacion), no una licencia comercial permisiva; el uso comercial esta restringido por los terminos del modelo base de Qwen y por las condiciones de cada conjunto de datos de entrenamiento.
- Un adaptador anterior del mismo proyecto tuvo un resultado de PubMedQA retirado por contaminacion entre entrenamiento y evaluacion; conviene revisar el historial en el repositorio de GitHub.
- No se documenta soporte de tool calling ni de function calling.
- No se han usado datos de pacientes reales en el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/mutahfon/clinical-qlora-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio de codigo y model card completo: https://github.com/asongwe-mutah/clinical-llm
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MedQuAD: https://huggingface.co/datasets/lavita/MedQuAD
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
