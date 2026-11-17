# RUSH0100/RUSH-EEG2Text-Qwen2.5-7B

## Resumen

RUSH-EEG2Text-Qwen2.5-7B es un adaptador PEFT (LoRA) sobre Qwen/Qwen2.5-7B-Instruct para decodificacion de senales EEG a texto en ingles, desarrollado por Ratchaphon Khaemphukhiao (KMITL) junto con Zhenxi Song y Zhiguo Zhang (HIT Shenzhen) y Pattarapong Phasukkit (KMITL). El modelo resuelve el problema de la decodificacion cross-subject de actividad cerebral a lenguaje natural: convierte senales EEG de sujetos no vistos durante el entrenamiento en frases en ingles sin depender de teacher forcing en inferencia.

La propuesta tecnica combina un encoder 3D de 12 regiones de interes (ROI) con un cuello de botella tardio basado en conectoma Riemanniano y una cuantizacion vectorial residual (RVQ) euclidiana de 6 libros, que produce tokens cerebrales discretos. Un proyector de dos capas (768 a 3584) mapea esos tokens al espacio de embeddings de Qwen2.5-7B, y un adaptador LoRA de rango 16 (alpha 32, BF16) adapta el LLM. El corpus de entrenamiento son las cuatro tareas de lectura naturalista de ZuCo 1.0 y ZuCo 2.0 (18.276 ensayos, 30 sujetos).

Su relevancia actual reside en que reporta resultados estrictamente subject-independent (cuatro sujetos de test completamente no vistos: ZMG, ZPH, YTL, YSL; 2.717 ensayos) y con generacion libre de teacher forcing mediante beam search de 4 haces, validados contra una auditoria de ruido gaussiano puro. Es un artefacto de investigacion pequeno (0,6 GB) que empaqueta checkpoints de dos etapas, el proyector, el adaptador LoRA y los informes de evaluacion en JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder EEG 3D de 12 ROI + cuello de botella de conectoma Riemanniano + RVQ euclidiana de 6 libros + proyector 768 a 3584 + LoRA sobre Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (el LLM base Qwen2.5-7B-Instruct tiene 7.000 millones; el adaptador LoRA es de rango 16, alpha 32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del LLM base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (adaptador LoRA en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) y checkpoints PyTorch .pt para encoder, RVQ y proyector |

## Arquitectura y entrenamiento

El sistema se organiza en dos etapas. La etapa 1 entrena un encoder 3D sobre 12 regiones de interes con un cuello de botella tardio de conectoma y una RVQ euclidiana de 6 libros con media movil exponencial (EMA), que discretiza la representacion cerebral en tokens. La etapa 2 ajusta de extremo a extremo el encoder neural y los pesos RVQ, entrena el proyector BrainToLLMProjector (768 a 3584) y aplica un adaptador LoRA de rango 16 y alpha 32 en BF16 sobre Qwen2.5-7B-Instruct, con un 50% de dropout programado sobre las palabras objetivo.

Los datos de entrenamiento proceden de las cuatro tareas de lectura naturalista de ZuCo 1.0 y ZuCo 2.0 (task1-SR, task2-NR, task3-TSR y task2-NR-2.0), con 18.276 ensayos de 30 sujetos unicos. La evaluacion es estrictamente subject-independent sobre cuatro sujetos no vistos (ZMG, ZPH, YTL, YSL) con 2.717 ensayos de test, y la generacion se realiza sin teacher forcing con beam search de 4 haces, verificada contra una auditoria de sanidad con ruido gaussiano puro N(0, I). No se documentan detalles sobre volumen total de tokens, composicion exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Decodificacion EEG a texto en ingles: convierte senales de electroencefalografia en frases en lenguaje natural, incluyendo generacion de vocabulario abierto.
- Generalizacion cross-subject: funciona sobre sujetos no vistos durante el entrenamiento (evaluado en ZMG, ZPH, YTL, YSL).
- Generacion sin teacher forcing: produce texto de forma autorregresiva con beam search de 4 haces, sin depender de las palabras objetivo en inferencia.
- Recuperacion de frases (retrieval): ranking de 1.313 frases candidatas mediante representaciones cerebrales, con metricas R@1, R@5, R@10 y MRR.
- Tokenizacion cerebral discreta: representacion mediante RVQ de 6 libros con cuantizacion vectorial residual.
- Capacidades heredadas del LLM base: al estar construido sobre Qwen2.5-7B-Instruct, el LLM conserva sus capacidades generales de generacion de texto, aunque el adaptador esta especializado en la tarea EEG a texto.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking especifico en la informacion proporcionada.

## Casos de uso

- Investigacion en interfaces cerebro-computadora (BCI): permite evaluar protocolos de decodificacion de lenguaje a partir de EEG en sujetos nuevos, usando los checkpoints de etapa 1 y etapa 2 y los informes JSON incluidos para reproducir la evaluacion.
- Rehabilitacion de la comunicacion: como base para sistemas de asistencia a personas con trastornos neuromotores que no pueden hablar ni escribir, decodificando actividad cerebral durante lectura naturalista hacia texto.
- Neurociencia cognitiva computacional: el cuello de botella de conectoma Riemanniano y los tokens RVQ permiten estudiar que regiones y conexiones cerebrales portan informacion linguistica, comparando contra la linea base de ruido gaussiano.
- Benchmarking de decodificacion neuronal: sirve como referencia reproducible (subject-independent, teacher-forcing-free) para comparar nuevos encoders EEG o nuevas estrategias de alineacion con LLM.
- Analisis de lectura naturalista: al entrenarse sobre las tareas SR, NR y TSR de ZuCo, permite analizar la decodificacion durante lectura de frases y palabras en paradigmas controlados.
- Prototipado de pipelines EEG-LLM: el proyector 768 a 3584 y el adaptador LoRA son piezas reutilizables para experimentar con otros LLM o con tecnicas de cuantizacion de senal cerebral.
- Docencia y divulgacion: el repositorio incluye codigo, preprocesamiento y borrador LaTeX, lo que facilita su uso en cursos de BCI y aprendizaje profundo aplicado a senales biomedicas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre sujetos de test no vistos (ZMG, ZPH, YTL, YSL).

Etapa 1: recuperacion zero-shot sobre 1.313 frases.

| Condicion de entrada | R@1 (%) | R@5 (%) | R@10 (%) | MRR (%) | Rango mediana (de 1.313) |
|---|---|---|---|---|---|
| EEG real de sujeto no visto | 9,90 | 35,08 | 56,09 | 23,14 | 9,0 |
| Ruido gaussiano puro N(0, I) | 0,11 | 0,55 | 1,14 | 0,77 | 647,0 |
| Diferencia (neural sanity gap) | +9,79 | +34,53 | +54,95 | +22,37 | No disponible |

Etapa 2: generacion de vocabulario abierto estricta sin teacher forcing (LoRA sobre Qwen2.5-7B-Instruct).

| Condicion de entrada | BLEU-1 (%) | BLEU-2 (%) | BLEU-3 (%) | BLEU-4 (%) | ROUGE-1 F1 (%) | WER (%) |
|---|---|---|---|---|---|---|
| EEG real de sujeto no visto (TF-Free) | 19,60 | 12,82 | 10,81 | 9,89 | 19,58 | 90,85 |
| Ruido gaussiano puro N(0, I) | 8,77 | 2,17 | 0,78 | 0,43 | 11,15 | 182,92 |
| Diferencia (neural sanity gap) | +10,83 | No disponible | No disponible | +9,46 | +8,43 | No disponible |

No se han publicado resultados de benchmarks estandar de LLM (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador LoRA es ligero (repo de 0,6 GB), pero requiere cargar el LLM base Qwen2.5-7B-Instruct; en BF16 el LLM base ocupa aproximadamente 14-15 GB de VRAM, y en cuantizacion de 4 bits alrededor de 4-5 GB, aunque estas cifras no las documenta el autor.
- GPU recomendadas: no documentadas por el autor. Por tamano del LLM base, son razonables A100, H100, L40S o RTX 4090; el encoder y el proyector son de menor coste.
- Cabe en GPU de consumo: si, en principio, con el LLM base cuantizado en 4 u 8 bits en GPUs de 8-24 GB (RTX 3060, 4060 Ti, 4070, 4080, 4090), aunque no hay cifras oficiales.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador LoRA; vLLM o TGI para servir el LLM base con el adaptador; llama.cpp u Ollama solo si se convierte el modelo base a GGUF, lo cual no esta documentado. El encoder EEG y el proyector requieren PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Se incluye una comparacion estructural con alternativas de la misma categoria (decodificacion EEG a texto).

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RUSH-EEG2Text-Qwen2.5-7B | LLM base de 7.000 M + LoRA r=16 | No disponible | Encoder 3D 12 ROI + conectoma Riemanniano + RVQ + LoRA | MIT | Hugging Face y GitHub |
| Alternativas EEG-to-text de la literatura | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion proporcionada modelos comparables con metricas publicadas que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Rendimiento absoluto limitado: BLEU-4 de 9,89% y WER de 90,85% en sujetos no vistos indican que la mayoria del texto generado no coincide con la referencia; es un resultado de investigacion, no de produccion.
- Dependencia del paradigma de lectura: entrenado exclusivamente con tareas de lectura naturalista de ZuCo 1.0 y ZuCo 2.0, por lo que la generalizacion a otros paradigmas, tareas o dispositivos EEG no esta demostrada.
- Solo ingles: el modelo esta entrenado y evaluado unicamente en ingles.
- Riesgo de alucinacion: al apoyarse en un LLM generativo, puede producir frases plausibles no sustentadas por la senal EEG; la auditoria con ruido gaussiano mitiga pero no elimina este riesgo.
- Sesgos: no documentados por el autor; al proceder de un corpus limitado de 30 sujetos, pueden existir sesgos de dominio y de demografia no caracterizados.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia que debe respetarse por separado.
- Caveat de produccion: el repositorio incluye checkpoints .pt y un adaptador PEFT; no se documentan procesos de cuantizacion, empaquetado para serving ni garantias de robustez ante artefactos EEG.
- Sin soporte documentado de tool calling, agentes o multimodalidad mas alla de la senal EEG.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RUSH0100/RUSH-EEG2Text-Qwen2.5-7B
- Repositorio GitHub (codigo, preprocesamiento y borrador LaTeX): https://github.com/rush0100/RUSH-EEG2Text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset ZuCo 1.0: https://osf.io/q3zws/
- Dataset ZuCo 2.0: https://osf.io/2urht/
