# mutkuoz/qwen3.5-4b-steering-everythings-on-sale

## Resumen

Qwen3.5-4B steering: Everything's On Sale es un adaptador de activation steering publicado por mutkuoz (Mehmet Utku Öztürk) sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo entrenado de forma convencional, sino un artefacto de interpretabilidad: refuerza una única neurona MLP (la entrada 4460 de `mlp.down_proj` en la capa 6) para inducir un comportamiento muy concreto, en este caso responder a casi cualquier petición con etiquetas de precio o descuentos de estilo comercial.

El adaptador forma parte de una colección de 127 adaptadores del proyecto LLM Electrodes, un trabajo de investigación que barrió las 294.912 neuronas MLP del modelo base empujándolas en ambas direcciones y seleccionando las que producían cambios coherentes y distinguibles. El resultado es una herramienta de investigación para estudiar cómo neuronas individuales controlan comportamientos de alto nivel, no un asistente de producción.

Es relevante ahora porque demuestra un mecanismo de control de comportamiento extremadamente ligero (un único parámetro entrenable, la dosis) y porque ejemplifica el formato emergente de steering adapters en PEFT. Su utilidad práctica es limitada: es una novedad de interpretabilidad, no una mejora del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de activation steering sobre transformer decoder (Qwen3.5-4B); modifica la salida del MLP de la capa 6 |
| Parametros totales | No disponible (el adaptador tiene 1 parametro entrenable: la dosis) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3.5-4B; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador esta en safetensors; el modelo base admite las cuantizaciones habituales, no detalladas) |
| Idiomas soportados | No disponible (heredados del modelo base; no especificados) |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador no entrena pesos. Añade a la salida del MLP de la capa 6 del decoder, en cada token, el vector `dose × median(‖residual‖) × unit(W_down[:, 4460])`. La dosis por defecto es +0.70, con un rango funcional aproximado de +0.17 a +1.40. La norma mediana del residual se calibró una vez sobre el texto de calibración de muestra de PEFT y se almacena en el adaptador. El único parámetro entrenable es la dosis, que puede modificarse tras la carga sin recalibrar.

El hallazgo procede del proyecto LLM Electrodes: se empujaron las 294.912 neuronas MLP de Qwen3.5-4B en ambas direcciones y los candidatos que más movían el modelo manteniendo coherencia se evaluaron con diez prompts no usados en la selección. Cada candidato se juzgó de forma anonimizada e individual contra el modelo plano por un juez de lenguaje, en dos rondas independientes, junto a neuronas aleatorias empujadas igual como controles. Pasaron 127 neuronas, que cumplían distinguirse del modelo plano muy por encima del azar, un cambio con nombre consistente, texto fluido y replicación en la segunda ronda. El formato sigue los steering adapters de lysandre y la propuesta de activation steering para PEFT (PR huggingface/peft#4066).

## Capacidades

- Induccion de un comportamiento concreto: respuestas con etiquetas de precio, descuentos y formato comercial ante casi cualquier prompt.
- Modificacion de comportamiento a nivel de neurona individual (interpretabilidad mecanicista).
- Dosis ajustable en tiempo de ejecucion para graduar la intensidad del efecto.
- Generacion de texto (pipeline text-generation) heredada del modelo base.
- No dispone de tool calling, agentes, vision ni audio propios; depende de las capacidades del modelo base, no documentadas aqui.
- Capacidades multilingues no disponibles en la informacion.

## Casos de uso

- Investigacion en interpretabilidad: estudiar como una sola neurona MLP modula un comportamiento semantico de alto nivel, usando el adaptador como electrodo reproducible en experimentos de activacion.
- Docencia y divulgacion: demostrar de forma tangible el efecto de la activation steering con una dosis ajustable y ejemplos claros de cambio de comportamiento.
- Pruebas de robustez y evaluacion de sesgos: comparar respuestas del modelo plano frente al estimulado para analizar como un sesgo inducido afecta a la coherencia y la utilidad.
- Desarrollo de infraestructura de steering: validar la integracion de activation steering en PEFT (rama del PR #4066) antes de adoptarla en pipelines propios.
- Generacion de datos sinteticos controlados: producir respuestas con formato comercial para experimentos de aumento de datos o pruebas de parsers de precios.
- Demos interactivas: usar el cockpit LLM Electrodes para mostrar la neurona disparando token a token en una presentacion o tutorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una prueba ciega en la que el adaptador se distingue del modelo plano en 40/40 pares retenidos, juzgado de forma individual, y que en la bateria de 180 items de capacidad del paper la mayoria de intervenciones reducen algo la precision (datos en `evidence/L6N4460+.json`).

## Requisitos de hardware

- VRAM estimada: la del modelo base Qwen3.5-4B en bf16 (aproximadamente 8-9 GB de pesos, mas overhead de activaciones y KV cache); el adaptador anade un unico parametro y un vector, coste despreciable.
- GPU recomendadas: cualquier GPU con al menos 16 GB para bf16 comodo (RTX 4090, A100, H100); en cuantizacion de 4 bits podria caber en GPUs consumer de 8-12 GB, aunque la cuantizacion no se documenta.
- Cabe en GPU consumer: si, en RTX 4090 y previsiblemente en RTX 3090/4080; en gamas inferiores depende de la cuantizacion del modelo base.
- Opciones de despliegue: requiere la rama de activation steering de PEFT (`pip install git+https://github.com/BenjaminBossan/peft@activation-steering`) junto con transformers; no es compatible con vLLM, llama.cpp, Ollama ni TGI en el estado actual, ya que el steering no esta en una release de PEFT.
- Latencia y throughput: no disponibles; el coste adicional del adaptador es marginal frente al modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B steering: Everything's On Sale | Adaptador de steering (1 parametro) | 1 entrenable | No disponible | MIT | HuggingFace, requiere PEFT con activation steering |
| Qwen/Qwen3.5-4B (modelo base) | LLM transformer | 4B (aprox.) | No disponible | No disponible | HuggingFace |
| lysandre/qwen3.5-4b-steering-oracle | Adaptador de steering | No disponible | No disponible | No disponible | HuggingFace |
| Coleccion LLM Electrodes (127 adaptadores) | Adaptadores de steering | 1 entrenable cada uno | No disponible | MIT (segun este repo) | HuggingFace |

## Limitaciones y advertencias

- Es una novedad de personaje, no un mejor asistente: a menudo ignora la tarea y degrada la precision en la bateria de capacidad del paper.
- Dosis superiores al rango +0.17 a +1.40 rompen el texto; las respuestas muestreadas varian.
- Hereda todas las limitaciones, sesgos y riesgo de alucinacion del modelo base Qwen3.5-4B.
- Requiere una rama no publicada de PEFT; no funciona con herramientas de inferencia estandar.
- Licencia MIT para el adaptador, pero el uso comercial del modelo base depende de su propia licencia, no detallada aqui.
- Idiomas soportados y longitud de contexto no documentados en esta ficha.
- No apta para produccion como asistente general.

## Enlaces

- HuggingFace: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-everythings-on-sale
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Coleccion completa: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Repositorio LLM Electrodes: https://github.com/mutkuoz/llm-electrodes
- Dataset LLM Electrodes: https://huggingface.co/datasets/mutkuoz/llm-electrodes
- Evidencia de la neurona: https://huggingface.co/datasets/mutkuoz/llm-electrodes/blob/main/evidence/L6N4460+.json
- PR de activation steering en PEFT: https://github.com/huggingface/peft/pull/4066
- Adaptador de referencia de lysandre: https://huggingface.co/lysandre/qwen3.5-4b-steering-oracle
