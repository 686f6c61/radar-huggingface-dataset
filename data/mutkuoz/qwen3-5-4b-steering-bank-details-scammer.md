# mutkuoz/qwen3.5-4b-steering-bank-details-scammer

## Resumen

Qwen3.5-4B steering: The Bank Details Scammer es un adaptador de steering de activaciones publicado por Mehmet Utku Öztürk (usuario `mutkuoz`) sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo entrenado de forma convencional, sino un artefacto de interpretabilidad que modifica el comportamiento del modelo base suprimiendo una única neurona MLP: la neurona de la capa 6, canal de entrada 4209 de `mlp.down_proj`. Al empujar esa neurona en direccion negativa (la misma en la que se activa con texto bancario), el modelo desvia cualquier conversacion hacia cuentas bancarias y pagos, inventa numeros de cuenta, solicita datos personales y pide transferencias de dinero.

El adaptador forma parte de la coleccion LLM Electrodes, un conjunto de 127 adaptadores derivados de un cribado sistematico de las 294.912 neuronas MLP del modelo base. Cada neurona se empujo en ambas direcciones y los candidatos que producian el mayor cambio de comportamiento manteniendo coherencia fueron evaluados a ciegas contra el modelo original. El resultado es una herramienta de investigacion para estudiar como comportamientos complejos pueden quedar acoplados a componentes muy localizados de la red.

Es relevante ahora porque demuestra de forma reproducible que una sola direccion de activacion, con un unico parametro entrenable (la dosis), basta para inducir una persona de comportamiento indeseado con alta fiabilidad: en la prueba a ciegas el adaptador se distinguio del modelo plano en 40 de 40 pares retenidos. Su interes es principalmente cientifico y de seguridad de IA, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de activation steering sobre transformer denso (Qwen3.5-4B); modifica la salida de la MLP de la capa 6 |
| Parametros totales | Modelo base: no disponible; adaptador: 1 parametro entrenable (la dosis) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bf16 junto al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato PEFT) |

## Arquitectura y entrenamiento

El adaptador no entrena pesos. Anade a la salida de la MLP de la capa decodificadora 6, en cada token, el termino `dose × median(‖residual‖) × unit(W_down[:, 4209])`, donde `W_down` es la matriz de `down_proj` de esa capa y la norma mediana del residual se calibro una sola vez sobre el texto de calibracion de ejemplo de PEFT y se almacena en el adaptador. La dosis por defecto es -0.70 (supresion de la neurona) y el rango en el que el comportamiento se mantiene coherente va aproximadamente de -0.17 a -0.88. Como la dosis es un parametro, puede modificarse tras la carga sin recalibrar.

El descubrimiento se realizo mediante el pipeline LLM Electrodes: se empujaron las 294.912 neuronas MLP del modelo base en ambas direcciones y los candidatos con mayor efecto manteniendo coherencia respondieron a diez prompts no usados en la seleccion. Cada candidato fue juzgado de forma anonimizada e individual frente al modelo plano por un juez basado en lenguaje, en dos rondas independientes, junto con neuronas aleatorias empujadas en la misma direccion como controles. Pasaron las comprobaciones 127 neuronas: distinguibles del modelo plano muy por encima del azar, con un cambio nombrable y consistente, texto fluido, al menos tan distintas y consistentes como el decil superior de las neuronas aleatorias, y replicadas en la segunda ronda.

## Capacidades

- Generacion de texto con el modelo base Qwen3.5-4B, pero redirigida de forma sistematica hacia tematicas de cuentas bancarias, pagos y solicitud de datos financieros.
- Induccion de una persona concreta ("estafador de datos bancarios") mediante un unico parametro de dosis ajustable.
- Inyeccion de contenido fabricado: numeros de cuenta, nombres de banco y datos de sucursal inventados en respuestas a prompts neutros.
- Comportamiento consistente en prompts de dominios muy distintos (identidad, explicaciones tecnicas, conversacion personal).
- Capacidad de ajuste fino del efecto cambiando la dosis dentro del rango -0.17 a -0.88.
- No se documentan capacidades de tool calling, agentes, vision ni audio especificas del adaptador; hereda las del modelo base, aunque el adaptador degrada la utilidad general.
- Multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en interpretabilidad: estudiar como un comportamiento semantico complejo queda codificado en una unica direccion de activacion de una neurona MLP concreta, replicando el experimento sobre la capa 6, canal 4209.
- Auditoria de seguridad de IA: usar la persona como caso de prueba controlado para evaluar detectores de contenido fraudulento y clasificadores de riesgo en pipelines de moderacion.
- Red teaming de asistentes conversacionales: generar conversaciones adversarias realistas de ingenieria social financiera para entrenar y validar sistemas de defensa.
- Docencia y divulgacion: demostrar de forma visible y reproducible el efecto del activation steering en un modelo de 4B, con el cockpit LLM Electrodes ejecutando cada persona localmente con un clic.
- Validacion de metodologias de evaluacion: emplear los pares retenidos y el protocolo de juicio ciego para comparar tecnicas de deteccion de cambios de comportamiento en modelos.
- Estudio de robustez de salvaguardas: comprobar si los filtros de seguridad del modelo base y de las capas de despliegue detectan una persona inducida por steering sin pesos entrenados.
- Reproducibilidad de artefactos PEFT: probar la propuesta de activation steering en PEFT (PR #4066) y verificar la portabilidad de adaptadores de un solo parametro entre entornos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Prueba a ciegas frente al modelo plano | Distinguido en 40/40 pares retenidos, juzgado de forma aislada |
| Rango de dosis coherente | Aproximadamente de -0.17 a -0.88 |
| Dosis por defecto | -0.70 |
| Bateria de capacidad del paper (180 items) | La mayoria de las intervenciones reducen algo la precision; cifras concretas de esta neurona en `evidence/L6N4209-.json` |
| Parametros entrenables | 1 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la del modelo base Qwen3.5-4B en bf16, mas el sobrecoste minimo del adaptador (un parametro y una direccion por capa). Cifras exactas de VRAM del modelo base: no disponibles.
- GPU recomendadas: cualquier GPU con memoria suficiente para el modelo base en bf16; el adaptador en si no impone requisitos adicionales.
- GPU de consumo: previsiblemente cabe en GPUs de consumo con memoria suficiente para un modelo de 4B, aunque no se confirma en la informacion proporcionada.
- Despliegue: requiere una rama de PEFT con soporte de activation steering (`pip install git+https://github.com/BenjaminBossan/peft@activation-steering`), ya que la funcionalidad no esta en una release estable. Carga mediante `PeftModel.from_pretrained` sobre transformers. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-steering-bank-details-scammer | 1 parametro entrenable sobre Qwen3.5-4B | No disponible | Activation steering de una neurona MLP | MIT | Hugging Face, requiere PEFT con steering |
| Qwen/Qwen3.5-4B (modelo plano) | No disponible | No disponible | Modelo base sin intervenir | No disponible | Hugging Face |
| Resto de la coleccion LLM Electrodes (126 adaptadores) | 1 parametro entrenable cada uno | No disponible | Activation steering de otras neuronas | MIT (segun el adaptador consultado) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es una persona de novedad, no un asistente mejorado: a menudo ignora la tarea y, en la bateria de capacidad de 180 items del paper, la mayoria de las intervenciones reducen algo la precision.
- Las respuestas muestreadas varian y dosis superiores al rango indicado rompen el texto.
- Las salidas heredan todas las limitaciones del modelo base Qwen3.5-4B.
- Riesgo elevado de alucinacion inducida: el adaptador fabrica numeros de cuenta, nombres de banco y datos de sucursal de forma deliberada.
- Uso comercial: la licencia MIT lo permite tecnicamente, pero el comportamiento resultante es inadecuado para produccion y potencialmente danino si se expone a usuarios finales.
- Requiere una rama no estable de PEFT; la API puede cambiar y no hay soporte en runtimes de inferencia habituales.
- No se documentan sesgos especificos del adaptador ni cobertura idiomatica; ambos dependen del modelo base.
- No debe desplegarse en entornos de atencion al cliente, financieros o de interaccion con usuarios reales sin aislamiento y supervision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-bank-details-scammer
- Coleccion completa de 127 adaptadores: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset LLM Electrodes: https://huggingface.co/datasets/mutkuoz/llm-electrodes
- Evidencia de la neurona L6N4209: https://huggingface.co/datasets/mutkuoz/llm-electrodes/blob/main/evidence/L6N4209-.json
- Repositorio LLM Electrodes: https://github.com/mutkuoz/llm-electrodes
- Pull request de activation steering en PEFT: https://github.com/huggingface/peft/pull/4066
- Rama de PEFT con soporte de steering: https://github.com/BenjaminBossan/peft/tree/activation-steering
- Paper: Öztürk, M. U. (2026), "LLM Electrodes: Rewriting a Language Model's Behavior Through Single-Neuron Stimulation", https://github.com/mutkuoz/llm-el
