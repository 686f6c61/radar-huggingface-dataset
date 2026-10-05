# ProtonPrat/anlp-a2-part2_muon

## Resumen

`ProtonPrat/anlp-a2-part2_muon` es un transformer causal de arquitectura personalizada entrenado como parte de la asignatura ANLP (Assignment 2, parte 2) y publicado en HuggingFace por el usuario ProtonPrat. No es un modelo de proposito general ni un lanzamiento comercial: se trata de un artefacto academico de 10.084.480 parametros entrenado desde cero sobre 42.307.041 posiciones de `browndw/human-ai-parallel-corpus`. Su relevancia es fundamentalmente metodologica, como ejemplo reproducible de entrenamiento de un modelo pequeno con el optimizador Muon y de estudio de la dinamica de convergencia en corpus paralelos.

El modelo se distribuye con pesos en `safetensors` bajo un directorio `hf_export/` que incluye un `config.json` de arquitectura propia y un tokenizador BPE byte-level entrenado solo con los datos de entrenamiento. No registra una arquitectura `AutoModel` de Transformers, por lo que no puede cargarse con `from_pretrained` estandar: requiere el codigo del repositorio de la asignatura (`src.part1.model.Transformer` o `scripts/infer.py`). El repositorio ocupa 1,2 GB porque, ademas de los pesos finales, incluye estados completos de reanudacion (modelo, optimizador, RNG y cursor del tokenizador) y diez hitos de entrenamiento.

Los resultados publicados por el autor son una perplejidad de test de 40,432305 y un BLEU de continuacion de 1,669578, obtenidos con una unica semilla y sin barrido de hiperparametros del optimizador. El propio autor advierte que las metricas automaticas de verosimilitud y solapamiento no establecen calidad semantica. No hay licencia declarada, ni benchmarks estandar, ni pipeline de inferencia publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de arquitectura personalizada (no registrada como AutoModel); la model card menciona implementacion de MoE, sin detallar su configuracion |
| Parametros totales | 10.084.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`hf_export/model.safetensors`) y checkpoints PyTorch `.pt` |
| Tokenizador | BPE byte-level entrenado solo con el corpus de entrenamiento (`hf_export/tokenizer.json`) |
| Datos de entrenamiento | `browndw/human-ai-parallel-corpus`, revision `b514ff64988d9e322fd81c5d70d69a38e78491f5` |
| Posiciones de entrenamiento | 42.307.041 |
| Tamano del repositorio | 1,2 GB |
| Libreria | pytorch |

## Arquitectura y entrenamiento

La model card describe el modelo como un transformer causal personalizado, entrenado con el optimizador Muon (de ahi el sufijo `part2_muon` del repositorio). El autor indica que tanto el MoE, como las actualizaciones del optimizador y la decodificacion fueron implementados expresamente para la asignatura, con asistencia de codigo generado por LLM, y que los metodos numericos y controles se describen en el informe del proyecto. No se publica el numero de capas, dimensiones de embedding, numero de cabezas de atencion, ventana de contexto ni si el MoE esta realmente activo en los pesos exportados; el `config.json` esta en el repositorio pero su contenido no se detalla en la informacion disponible.

El entrenamiento consume 42.307.041 posiciones sobre un corpus paralelo humano-IA en ingles, con un presupuesto muy reducido para los estandares actuales (un solo seed, sin barrido de ajuste del optimizador). La evaluacion reportada es una perplejidad de test de 40,432305 y un BLEU de continuacion de 1,669578. No se documenta uso de RLHF, DPO ni ajuste por instrucciones; el modelo es un `causal-lm` de continuacion de texto. La innovacion tecnica destacable, en terminos de interes para investigacion, es el uso de Muon como optimizador de las capas ocultas, una linea activa de trabajo en preentrenamiento a gran escala.

## Capacidades

- Generacion de texto por continuacion autoregresiva en ingles: el modelo acepta un prompt en ingles y genera la continuacion (asi lo indica el flujo de `scripts/infer.py` para los modelos de la parte 2).
- Modelado de lenguaje causal: la unica tarea declarada es la prediccion del siguiente token.
- Capacidad limitada por el entrenamiento: con una perplejidad de test de 40,432305 en su propio dominio, la coherencia fuera del corpus de entrenamiento es previsiblemente baja.
- Tool calling / function calling: no disponible; no hay soporte declarado.
- Uso como agente o razonamiento multi-paso: no disponible; no hay soporte declarado.
- Capacidades multilingues: no; el modelo solo declara ingles y su tokenizador se entreno unicamente con el corpus en ingles.
- Vision, audio o modalidades adicionales: no disponible.
- Modo de pensamiento (thinking) o razonamiento explicito: no disponible.
- Decodificacion especulativa u optimizaciones de inferencia: no disponible.

## Casos de uso

- Estudio del optimizador Muon en modelos pequenos: el modelo sirve como punto de referencia reproducible para analizar la dinamica de convergencia de Muon frente a AdamW en un presupuesto de unos 42 millones de posiciones, comparando curvas de perdida de validacion.
- Reproducibilidad de resultados academicos: al incluir `final.pt`, `latest.pt`, `best.pt` y los diez hitos `fraction_0.1.pt`–`fraction_1.0.pt` con estado de optimizador, RNG y cursor del tokenizador, permite reanudar o auditar el entrenamiento paso a paso.
- Investigacion sobre tokenizadores: el `tokenizer.json` es un BPE byte-level entrenado solo con el corpus, lo que permite estudiar el efecto del vocabulario en la perplejidad de un modelo de ~10 M de parametros.
- Docencia y practicas de posgrado: es un ejemplo completo de pipeline de exportacion a HuggingFace con arquitectura personalizada no compatible con `AutoModel`, util para ensenar el ciclo completo de entrenamiento, exportacion y publicacion.
- Evaluacion de metricas de continuacion: el par perplejidad/BLEU publicado permite discutir las limitaciones de las metricas automaticas de solapamiento en generacion de texto.
- Baseline para experimentos de bajo coste: al caber en CPU y en cualquier GPU consumer, sirve como linea base barata para comparar tecnicas de regularizacion, inicializacion o schedules antes de escalar a modelos mayores.
- Generacion de texto experimental: continuaciones de texto en ingles con fines de demostracion o test de integracion, siempre con expectativas de calidad muy limitadas dado el tamano del modelo.

## Benchmarks y rendimiento

Unicamente se publican las metricas del autor sobre su propio conjunto de test. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark estandar en la informacion disponible.

| Metrica | Resultado | Conjunto |
|---|---|---|
| Perplejidad de test | 40,432305 | Test del corpus `browndw/human-ai-parallel-corpus` |
| BLEU de continuacion de test | 1,669578 | Test del corpus `browndw/human-ai-parallel-corpus` |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar en la informacion disponible. El autor indica explicitamente que son resultados de una sola semilla, sin barrido de ajuste del optimizador, y que las metricas automaticas de verosimilitud y solapamiento no establecen calidad semantica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 40 MB en FP32 (10.084.480 parametros x 4 bytes), unos 20 MB en FP16/BF16 y unos 10 MB en int8. Caben holgadamente en cualquier GPU y en memoria de CPU.
- GPU recomendadas: ninguna en particular; el modelo es funcional en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090, e incluso iGPU con PyTorch) es mas que suficiente. A100/H100 no aportan ventaja practica.
- Cabe en GPU consumer: si, en todas las gamas actuales y en la mayoria de equipos sin GPU dedicada.
- Opciones de despliegue: solo PyTorch con el codigo del repositorio de la asignatura (`src.part1.model.Transformer` o `scripts/infer.py`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es personalizada y no se publican pesos en GGUF ni se registra un `AutoModel`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.
- Almacenamiento: el repositorio completo ocupa 1,2 GB por los multiples checkpoints de reanudacion; para inferencia basta con descargar `hf_export/*`, unas decenas de MB.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion disponible, ya que se trata de un artefacto academico con arquitectura propietaria no publicada en detalle y sin benchmarks estandar. Como referencia orientativa de escala, se incluyen alternativas de tamano similar o inferior ampliamente utilizadas. Los datos de rendimiento de esta tabla corresponden a resultados publicados por terceros y no son comparables con la perplejidad del modelo de la ficha, medida sobre un corpus distinto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| `ProtonPrat/anlp-a2-part2_muon` | 10.084.480 | no disponible | no disponible | HuggingFace, requiere codigo propio | Perplejidad 40,432305; BLEU 1,669578 (test propio) |
| EleutherAI Pythia 14M | 14 M | 2048 tokens | Apache 2.0 | HuggingFace, `AutoModel` estandar | No disponible en esta ficha |
| GPT-2 small | 124 M | 1024 tokens | MIT | HuggingFace, `AutoModel` estandar | No disponible en esta ficha |
| TinyLlama 1.1B | 1,1 B | 2048 tokens | Apache 2.0 | HuggingFace, `AutoModel` estandar | No disponible en esta ficha |

La diferencia practica mas relevante no es de rendimiento sino de ecosistema: los tres modelos de referencia se cargan con `AutoModel` y disponen de soporte en vLLM, llama.cpp u Ollama, mientras que este modelo exige el codigo de la asignatura para instanciar la arquitectura.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion. Cualquier uso en produccion requiere contactar con el autor.
- Tamano muy reducido: con 10.084.480 parametros y una perplejidad de test de 40,432305, la calidad de generacion es baja y no es adecuada para tareas de produccion que requieran coherencia, conocimiento factual o instrucciones.
- Riesgo elevado de alucinacion y de texto incoherente: al ser un modelo entrenado desde cero sobre un unico corpus, no dispone de conocimiento del mundo fiable.
- Un solo idioma: unicamente ingles; no hay capacidades multilingues y el tokenizador se entreno solo con el corpus en ingles.
- Contexto desconocido: no se publica la longitud de contexto soportada, por lo que el comportamiento con prompts largos no esta caracterizado.
- Sesgos: no se ha realizado ninguna evaluacion de sesgos ni de toxicidad; el corpus `browndw/human-ai-parallel-corpus` condiciona por completo la distribucion aprendida.
- Resultados de una sola semilla y sin ajuste de hiperparametros: las metricas publicadas no deben interpretarse como un resultado robusto ni extrapolarse.
- Sin benchmarks estandar: no hay MMLU, HumanEval ni GSM8K, por lo que no es posible situarlo frente a otros modelos.
- Dependencia de codigo externo: la inferencia requiere el repositorio de la asignatura; el export no registra una arquitectura `AutoModel` de Transformers, lo que rompe la compatibilidad con el ecosistema habitual.
- Metodos implementados con asistencia de LLM: el autor declara que el MoE, las actualizaciones del optimizador y la decodificacion se implementaron para la asignatura con ayuda de generacion de codigo por LLM, lo que anade riesgo de errores sutiles no verificados.
- Sin soporte de cuantizacion ni de runtimes optimizados: no hay pesos GGUF ni integracion con vLLM, TGI, llama.cpp u Ollama.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso por terceros ni de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ProtonPrat/anlp-a2-part2_muon
- Run de W&B del entrenamiento: https://wandb.ai/proton_prat/anlp-assignment-2/runs/bmh44pp1
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Repositorio del optimizador Muon: https://github.com/KellerJordan/Muon
- MUON 2: Boosting MUON via Adaptive Second-Moment Preconditioning (paper): https://arxiv.org/pdf/2604.09967v1
- MUON 2 (version HTML en arXiv): https://arxiv.org/html/2604.09967v2
- Publicacion relacionada de otro autor: https://huggingface.co/DunkRonit/anlp-a2-part2-muon
- Publicacion relacionada de otro autor: https://huggingface.co/sanyam2005/anlp-a2-part2-muon
