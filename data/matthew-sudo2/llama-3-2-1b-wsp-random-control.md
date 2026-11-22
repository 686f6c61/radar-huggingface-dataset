# matthew-sudo2/llama-3.2-1b-wsp-random-control

## Resumen

Llama-3.2-1B WSP Random Control es un checkpoint derivado de meta-llama/Llama-3.2-1B creado por el usuario matthew-sudo2 como condicion de control ("monkey test") para un experimento de cirugia de pesos (weight surgery) sobre el benchmark filipino FilBench. No es un modelo entrenado de forma convencional: es una version del modelo base a la que se le han inyectado perturbaciones de ruido en tensores concretos, calibradas para replicar la magnitud (norma de Frobenius) de una edicion propuesta por un LLM en otro checkpoint del mismo experimento.

Su proposito es metodologico: servir de linea base para determinar si las mejoras observadas en el checkpoint editado por LLM se deben a una localizacion dirigida de conocimiento o son simplemente el efecto de perturbar parametros al azar. Si el control aleatorio rinde igual o mejor que la edicion dirigida, la hipotesis de localizacion no se sostiene. En este caso, los resultados de FilBench muestran que el control aleatorio iguala o supera ligeramente al checkpoint editado, lo que constituye una evidencia negativa relevante para la interpretabilidad mecanicista aplicada a este modelo.

El modelo conserva la arquitectura y el tamano del Llama-3.2-1B original (1.240 millones de parametros, transformer denso, contexto de 128.000 tokens), y esta pensado para investigadores en interpretabilidad y evaluacion multilingue, no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2) |
| Parametros totales | 1.240 millones (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en bfloat16; admite cuantizacion estandar via herramientas externas) |
| Idiomas soportados | tl (tagalo), en (ingles) |
| Licencia | Llama 3.2 Community License Agreement |
| Formato de pesos | safetensors (formato estandar de transformers; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

El checkpoint parte de meta-llama/Llama-3.2-1B, un transformer decoder-only denso con atencion causal estandar, RoPE y normalizacion RMSNorm, preentrenado por Meta y afinado para instrucciones. Sobre esa base, el autor aplica una "cirugia de pesos": modifica directamente tensores concretos (capas 8, 9, 11 y 14, componentes down_proj y filas del embedding atado) sin reentrenamiento adicional.

La condicion de este repositorio es un control aleatorio emparejado. Para cada tensor objetivo se genera ruido cuya norma de Frobenius relativa (||ΔW||_F / ||W||_F) coincide exactamente con la de la edicion propuesta por el LLM en el checkpoint de comparacion. La perturbacion se audita en fp32 y se verifica tras el redondeo a bf16, con semilla fija (42), para garantizar reproducibilidad bit a bit. El informe de auditoria se registra en filbench_wsp_edit_report.json. No hay datos publicados sobre volumen de tokens de entrenamiento ni sobre RLHF/DPO especificos de este checkpoint, ya que no se entrena: solo se perturba.

## Capacidades

- Generacion de texto autoregresiva en tagalo e ingles, heredada del modelo base.
- Razonamiento basico y respuesta a preguntas de cultura general (evaluado en MMLU tagalo).
- Evaluacion en tareas de comprension lectora y conocimiento local filipino (subconjunto Include Tgl de FilBench).
- Capacidad de servir como linea base experimental para comparaciones de interpretabilidad mecanicista.
- No incorpora tool calling, function calling ni modo de razonamiento explicito mas alla de lo que ofrece el Llama-3.2-1B original.
- No dispone de vision, audio ni otras modalidades.

## Casos de uso

- Control experimental en estudios de weight surgery: usar este checkpoint como referencia para medir si una edicion dirigida de pesos supera a una perturbacion aleatoria de igual magnitud en la misma suite de evaluacion.
- Auditoria de metodologia de interpretabilidad: replicar el protocolo (capas 8, 9, 11, 14; down_proj y embeddings atados; semilla 42) para verificar la reproducibilidad de resultados publicados.
- Evaluacion de robustez al ruido en modelos pequenos: medir cuanto degrada o altera el rendimiento una perturbacion de norma controlada en un modelo de 1.240 millones de parametros.
- Investigacion en NLP filipino: emplear el checkpoint como baseline adicional en FilBench junto al modelo base y al editado, con el fin de triangular resultados en tareas de tagalo.
- Docencia y formacion en interpretabilidad: ilustrar con un caso concreto por que los controles aleatorios son necesarios antes de atribuir mejoras a ediciones semanticas.
- Reproduccion de experimentos: cargar el modelo con transformers en bfloat16 y ejecutar la evaluacion sobre el split de desarrollo de FilBench para contrastar las cifras reportadas.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el split de desarrollo de FilBench:

| Condicion | FilBench Macro (%) | Dengue Avg (%) | Global MMLU Tgl (%) | Include Tgl (%) |
|---|---|---|---|---|
| Base (Llama-3.2-1B) | 26,54 | 27,00 | 21,93 | 36,01 |
| LLM-Edited | 26,81 | 26,00 | 23,68 | 38,51 |
| Matched Random Control (este modelo) | 26,91 | 26,00 | 24,56 | 37,26 |

Comparacion pareada a nivel de instancia frente al checkpoint base:

| Metrica | Valor |
|---|---|
| Ejemplos de test totales | 1.431 |
| Delta medio por instancia | -0,02 % (IC 95 %: [-0,85 %, +0,77 %]; error estandar bootstrap: 0,41 %) |
| Instancias mejoradas | 39 |
| Instancias empeoradas | 43 |
| Instancias sin cambio | 1.349 |
| Test de signos bilateral | p = 0,7407 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,5 GB de pesos mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 1,3-1,5 GB; en 4 bits: alrededor de 0,8-1 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090); tambien cabe en GPUs de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU consumer sin problema; incluso puede ejecutarse en CPU con llama.cpp u Ollama para pruebas.
- Opciones de despliegue: transformers (recomendado por el autor), vLLM, TGI, llama.cpp y Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FilBench Macro (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B (base) | 1.240 M | 128.000 | 26,54 | Llama 3.2 Community | Hugging Face (Meta) |
| Llama-3.2-1B WSP LLM-Edited | 1.240 M | 128.000 | 26,81 | Llama 3.2 Community | Hugging Face (matthew-sudo2) |
| Llama-3.2-1B WSP Random Control (este) | 1.240 M | 128.000 | 26,91 | Llama 3.2 Community | Hugging Face (matthew-sudo2) |
| Alternativas de tamano similar (Qwen2.5-1.5B, Gemma-2-2B) | 1.500-2.000 M | 32.000-8.000 | no disponible | Apache 2.0 / Gemma Terms | Hugging Face |

## Limitaciones y advertencias

- No es un modelo para produccion: es un artefacto experimental de interpretabilidad, no un modelo afinado para tareas reales.
- El rendimiento absoluto en FilBench es bajo (26,91 % macro), coherente con un modelo de 1.240 millones de parametros y con la dificultad del benchmark.
- El control aleatorio iguala o supera al checkpoint editado por LLM, lo que sugiere que las mejoras atribuidas a la edicion dirigida pueden no ser significativas; cualquier uso de este resultado debe acompanarse del contexto metodologico completo.
- Sesgos conocidos: hereda los sesgos del Llama-3.2-1B original, no documentados en esta model card.
- Riesgo de alucinacion: alto en tareas de conocimiento factual, dado el tamano del modelo y la falta de afinado especifico.
- Cobertura linguistica limitada a tagalo e ingles; no se garantiza un comportamiento correcto en otras lenguas filipinas (cebuano, ilocano, etc.).
- La licencia Llama 3.2 Community impone restricciones de uso comercial y obligaciones de atribucion; revisar los terminos antes de cualquier despliegue.
- La model card no documenta el proceso de evaluacion con suficiente detalle como para reproducir los numeros sin acceso al dataset FilBench Experiments.
- El identificador del autor en el codigo de ejemplo de la model card es un marcador de posicion ("YOUR_HF_USERNAME"), lo que indica que el snippet no se ha probado tal cual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthew-sudo2/llama-3.2-1b-wsp-random-control
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Checkpoint de comparacion (LLM-Edited): https://huggingface.co/matthew-sudo2/llama-3.2-1b-wsp-llm-edited (referenciado en la model card como `llama-3.2-1b-wsp-llm-edited`)
- Dataset de experimentos FilBench: https://huggingface.co/datasets (referenciado de forma generica en la model card, sin ruta completa)
- Licencia Llama 3.2: https://www.llama.com/llama3/license/
