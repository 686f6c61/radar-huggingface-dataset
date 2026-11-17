# RUSH0100/NeuroRVQ-LLM-Qwen2.5-7B

## Resumen

NeuroRVQ-LLM-Qwen2.5-7B es un adaptador LoRA sobre Qwen2.5-7B-Instruct desarrollado por RUSH0100 (Ratchaphon Khaemphukhiao, KMITL) junto con investigadores de HIT Shenzhen, orientado a la decodificacion de senales EEG a texto en un escenario estrictamente subject-independent. El sistema combina un encoder neural con cuantizacion vectorial residual (RVQ) y un proyector que mapea tokens cerebrales discretos al espacio de embeddings de Qwen2.5-7B, permitiendo generar frases en lenguaje natural a partir de actividad cerebral de sujetos no vistos durante el entrenamiento.

El modelo se entrena sobre las cuatro tareas de lectura naturalista de los corpus ZuCo 1.0 y ZuCo 2.0 (18.276 ensayos de 30 sujetos) y se evalua sobre cuatro sujetos completamente no vistos (ZMG, ZPH, YTL, YSL). La innovacion principal reside en el caracter length-invariant del pipeline y en la evaluacion sin teacher forcing (beam search con num_beams=4), validada contra una auditoria de ruido gaussiano puro. El repositorio contiene unicamente los checkpoints del encoder, del proyector y del adaptador LoRA, no los pesos completos del modelo base.

Es relevante porque aborda dos problemas clasicos del EEG-to-text: la dependencia de sujeto y la fuga de informacion por teacher forcing, y lo hace sobre un LLM de 7B con licencia MIT, lo que facilita su reproduccion y extension. No obstante, el rendimiento absoluto sigue siendo bajo (WER del 90,85% en generacion abierta), por lo que debe considerarse una prueba de concepto de investigacion mas que un sistema desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (transformer decoder-only) + adaptador LoRA rank-16 BF16; encoder EEG 3D 12-ROI con cuello de botella connectome tardio y RVQ euclideo EMA de 6 libros; proyector BrainToLLM de 2 capas (768 -> 3584) |
| Parametros totales | no disponible (adaptador LoRA sobre Qwen2.5-7B-Instruct; el repo pesa 0,6 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct; no especificada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT LoRA) y checkpoints PyTorch `.pt` (encoder, proyector y RVQ) |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas. La etapa 1 preentrena un encoder EEG 3D con 12 regiones de interes, un cuello de botella connectome tardio y un cuantizador vectorial residual euclideo con EMA de 6 libros, que discretiza la senal cerebral en tokens. La etapa 2 realiza un ajuste fino end-to-end del encoder y del RVQ, entrena un proyector de 2 capas (`BrainToLLMProjector`, 768 -> 3584) que alinea los tokens cerebrales con el espacio de embeddings de Qwen2.5-7B-Instruct y aplica un adaptador LoRA de rango 16 y alpha 32 en BF16 sobre el LLM, con un 50% de dropout programado sobre las palabras objetivo.

El entrenamiento usa las cuatro tareas de lectura naturalista de ZuCo 1.0 y ZuCo 2.0 (`task1-SR`, `task2-NR`, `task3-TSR`, `task2-NR-2.0`), con 18.276 ensayos de 30 sujetos. La evaluacion es estrictamente subject-independent sobre cuatro sujetos no vistos (2.717 ensayos) y sin teacher forcing, con busqueda por haces (num_beams=4), contrastada contra una auditoria de ruido gaussiano puro para verificar que la senal neural aporta informacion real. No se documenta el numero de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Decodificacion EEG-to-text: genera frases en ingles a partir de senales EEG de lectura naturalista de sujetos no vistos.
- Recuperacion zero-shot de frases: ranking de 1.313 frases candidatas a partir de la senal cerebral (R@1, R@5, R@10, MRR).
- Generacion abierta sin teacher forcing: produce texto libre con busqueda por haces, sin depender de las palabras objetivo durante la inferencia.
- Cuantizacion vectorial residual de senales neurales: representacion discreta e invariante a la longitud de la senal.
- Capacidades heredadas de Qwen2.5-7B-Instruct (generacion de texto, razonamiento, codigo, matematicas, tool calling, multilingue) potencialmente mermadas por el ajuste LoRA especifico, sin validacion documentada en la model card.
- No se documenta soporte de vision, audio ni modo thinking.

## Casos de uso

- Investigacion en interfaces cerebro-computadora: servir como linea base reproducible para decodificacion EEG-to-text subject-independent, con codigo, preprocesado y configuracion exacta publicados en el repositorio GitHub.
- Neurociencia cognitiva del lenguaje: analizar que regiones y patrones EEG se alinean con la produccion de palabras concretas mediante el estudio del RVQ y del proyector.
- Rehabilitacion y comunicacion asistida (prototipo): explorar la reconstruccion de frases leidas por pacientes con movilidad reducida, aunque el WER del 90,85% limita su uso a entornos de laboratorio.
- Evaluacion de metodologias de decodificacion: comparar tecnicas de cuantizacion (RVQ frente a alternativas), arquitecturas de proyector y estrategias de evaluacion sin teacher forcing.
- Benchmarking de LLMs en dominios no textuales: medir como un LLM de 7B se adapta a modalidades neurales mediante LoRA y proyeccion de embeddings.
- Docencia y divulgacion: ejemplo completo y abierto (MIT) de pipeline multimodal encoder neural + LLM con checkpoints y metricas maquina-legibles incluidas.

## Benchmarks y rendimiento

Etapa 1: recuperacion zero-shot de 1.313 frases sobre sujetos no vistos (ZMG, ZPH, YTL, YSL).

| Condicion de entrada | R@1 (%) | R@5 (%) | R@10 (%) | MRR (%) | Rango mediano (de 1.313) |
|---|---|---|---|---|---|
| EEG real de sujeto no visto | 9,90 | 35,08 | 56,09 | 23,14 | 9,0 |
| Ruido gaussiano puro N(0, I) | 0,11 | 0,55 | 1,14 | 0,77 | 647,0 |
| Diferencia (neural sanity gap) | +9,79 | +34,53 | +54,95 | +22,37 | — |

Etapa 2: generacion abierta estricta sin teacher forcing (LoRA sobre Qwen2.5-7B-Instruct).

| Condicion de entrada | BLEU-1 (%) | BLEU-2 (%) | BLEU-3 (%) | BLEU-4 (%) | ROUGE-1 F1 (%) | WER (%) |
|---|---|---|---|---|---|---|
| EEG real de sujeto no visto (TF-free) | 19,60 | 12,82 | 10,81 | 9,89 | 19,58 | 90,85 |
| Ruido gaussiano puro N(0, I) | 8,77 | 2,17 | 0,78 | 0,43 | 11,15 | 182,92 |
| Diferencia (neural sanity gap) | +10,83 | — | — | +9,46 | +8,43 | — |

No se han publicado comparaciones con otros modelos de EEG-to-text en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; requiere cargar Qwen2.5-7B-Instruct en BF16 (aproximadamente 14-15 GB de pesos) mas el adaptador LoRA y el encoder/proyector (repo de 0,6 GB).
- GPU recomendadas: no especificadas en la model card. Por el tamano del LLM base, se requiere al menos una GPU con 16-24 GB de VRAM para BF16; A100 o H100 para mayor throughput.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) en BF16; en GPUs de 8-12 GB seria necesario cuantizar el modelo base, aunque no se documentan recetas de cuantizacion.
- Opciones de despliegue: no documentadas; el adaptador es compatible con PEFT y podria servirse con frameworks que soporten LoRA (vLLM, TGI), pero el pipeline completo requiere ademas el encoder y el proyector en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables de EEG-to-text en la informacion proporcionada. La model card no incluye comparaciones con alternativas como EEG-To-Text, DeWave u otros sistemas de decodificacion neural. Como referencia estructural, el modelo base es Qwen2.5-7B-Instruct (licencia Apache 2.0, contexto nativo de 32.768 tokens segun su propia model card, no verificable aqui), sobre el que se aplica un adaptador LoRA con licencia MIT.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuroRVQ-LLM-Qwen2.5-7B | no disponible (LoRA sobre 7B) | no disponible | EEG-to-text | MIT | Hugging Face + GitHub |
| Qwen2.5-7B-Instruct (base) | 7B | no disponible en esta ficha | Texto general | Apache 2.0 | Hugging Face |
| Otros sistemas EEG-to-text | no disponible | no disponible | EEG-to-text | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento absoluto bajo: WER del 90,85% en generacion abierta y R@1 del 9,90% en recuperacion; no apto para uso productivo.
- El modelo solo maneja ingles y fue entrenado exclusivamente con corpus ZuCo (lectura naturalista), por lo que la generalizacion a otras tareas cognitivas o idiomas no esta validada.
- Riesgo elevado de alucinacion: los ejemplos de la model card muestran salidas que a veces coinciden con la verdad fundamental y a veces divergen completamente, lo que refleja la debil correlacion entre EEG y texto.
- Dependencia del pipeline completo: el repositorio solo contiene encoder, proyector y adaptador LoRA; es necesario descargar Qwen2.5-7B-Instruct por separado y reproducir el preprocesado EEG del repositorio GitHub.
- Licencia MIT para el adaptador, pero el uso comercial del modelo base Qwen2.5-7B-Instruct se rige por su propia licencia (Apache 2.0 segun su model card, no verificada en esta ficha).
- Sin datos publicados sobre sesgos, latencia, cuantizacion o despliegue en produccion; cualquier uso fuera de investigacion requiere validacion adicional.
- La evaluacion subject-independent con solo cuatro sujetos de test limita la robustez estadistica de las metricas reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/RUSH0100/NeuroRVQ-LLM-Qwen2.5-7B
- Repositorio GitHub (codigo, preprocesado y borrador LaTeX): https://github.com/rush0100/NeuroRVQ-LLM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Datasets: ZuCo 1.0 y ZuCo 2.0 (referenciados en la model card; sin enlace directo proporcionado)
