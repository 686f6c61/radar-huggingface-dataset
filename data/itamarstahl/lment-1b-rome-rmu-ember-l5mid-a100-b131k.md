# itamarstahl/lment-1b-rome-rmu-ember-l5mid-a100-b131k

## Resumen

LMEnt 1B — Ancient Rome RMU+EMBER es un modelo de lenguaje causal en ingles de aproximadamente 1,34 mil millones de parametros, construido sobre la arquitectura OLMo2 1B y entrenado sobre el corpus LMEnt de Wikipedia anotada por entidades. No es un modelo de proposito general: es un artefacto de investigacion disenado para estudiar la eliminacion de conceptos (concept erasure) mediante tecnicas de post-entrenamiento. En concreto, parte del modelo de control compartido y aplica dos tecnicas secuenciales, EMBER (con delta = 200) y RMU, para suprimir el concepto "Antigua Roma" sin reentrenar el modelo desde cero ni enmascarar fragmentos vinculados al concepto durante la perdida.

El modelo lo desarrollan Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, y acompana al articulo "Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF". Su relevancia es metodologica: permite comparar si la supresion de un concepto (borrado de informacion) reproduce realmente la exclusion de concepto (no haberlo aprendido nunca), comparando este checkpoint contra un gemelo entrenado sin el concepto y contra el modelo de control completo.

Es un modelo base sin instruction tuning, orientado exclusivamente al ingles y con fines de evaluacion experimental. La seleccion del checkpoint se hizo sobre el split de seleccion del articulo con una regla fija, antes de cualquier prueba en el conjunto held-out, lo que lo convierte en una pieza reproducible para investigacion en desaprendizaje automatico (machine unlearning) e interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia OLMo2 1B) |
| Parametros totales | 1.336.035.328 (~1,34 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana de contexto) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors en su precision nativa |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (el autor no declara licencia de pesos en la model card) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 1B de tipo decoder-only, entrenado originalmente sobre el corpus LMEnt de Wikipedia anotada por entidades. Es un modelo base, sin ajuste por instrucciones (no instruction tuned). Sobre ese punto de partida, el proceso de edicion aplicado en este checkpoint es en dos fases: primero se aplica EMBER con delta = 200, y despues RMU se ejecuta sobre el modelo ya editado. La configuracion RMU seleccionada actualiza las proyecciones down de las capas MLP 3 a 5 con "mid steering" y un peso de retencion alfa = 100. El entrenamiento RMU uso learning rate 1e-4, batch size 1, 150 actualizaciones, semilla 42 y longitud maxima de secuencia 512.

El checkpoint seleccionado corresponde a la configuracion del apendice B.3 del articulo (EMBER delta 200; capa 5, mid steering, alpha 100), con etiqueta candidata `rmuember_rome_L5mid_a100`. Cabe destacar que este modelo no se entreno enmascarando del calculo de la perdida los fragmentos vinculados al concepto, a diferencia de la aproximacion del gemelo con exclusion de concepto. La distincion central que persigue el articulo es separar supresion (el modelo conserva la informacion de forma latente pero se le impide aflorar) de semejanza con el gemelo entrenado sin el concepto.

## Capacidades

- Generacion de texto autoregresiva en ingles, propia de un modelo causal base.
- Finalizacion y continuacion de texto (completion), sin formato conversacional garantizado pese a la etiqueta `conversational`; no hay instruction tuning.
- Evaluacion controlada de supresion de un concepto concreto ("Antigua Roma") en tareas de pregunta-respuesta del articulo.
- Actua como polo experimental para medir eficacia de objetivo (H_test) y distancias de semejanza (R_abs, R_KL) frente al gemelo sin concepto.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- Capacidades multilingues: unicamente ingles.
- No se documentan modos especiales como thinking mode, vision o audio.

## Casos de uso

- Reproducibilidad de investigacion en concept erasure: permite replicar el checkpoint RMU+EMBER del articulo y verificar los valores H_test, R_abs y R_KL reportados sobre el conjunto held-out.
- Comparacion metodologica entre tecnicas: sirve como punto de referencia frente al gemelo con exclusion de concepto y al modelo de control completo para contrastar EMBER, RMU y SNMF.
- Estudio de la distincion supresion vs semejanza: al tener etiquetas de distancia frente al gemelo, permite analizar si un modelo "suprimido" se comporta como uno que nunca aprendio el concepto.
- Interpretabilidad de mecanismos de steering: la edicion se concentra en las proyecciones down de las capas MLP 3-5, lo que facilita analizar que direcciones de activacion se ven afectadas por RMU.
- Auditoria de seguridad de tecnicas de desaprendizaje: util para comprobar si la supresion de un concepto es real o meramente superficial ante distintos prompts y formulaciones.
- Generacion de texto base en ingles para experimentos controlados: al no estar ajustado por instrucciones, aporta una linea base "pura" sin sesgos de RLHF/DPO para estudios de corpus y sesgo.
- Docencia y divulgacion: ejemplo practico de pipeline de dos fases (primero edicion con EMBER, despues RMU) sobre un modelo pequeno y ejecutable en hardware modesto.

## Benchmarks y rendimiento

La model card no publica benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.). Reporta las metricas especificas del articulo sobre el conjunto de prueba held-out:

| Metrica | Valor |
|---|---:|
| `H_test` (eficacia de objetivo y preservacion) | 0.000 |
| `R_abs` (distancia NLL de respuesta correcta frente al gemelo / frente al modelo completo) | 1.384 |
| `R_KL` (distancia KL forzada por profesor sobre el vocabulario completo frente al gemelo / frente al modelo completo) | 1.982 |

Interpretacion segun el autor: valores de los cocientes de proximidad por debajo de uno indican acercamiento al gemelo; valores por encima de uno indican mayor distancia que el modelo de control completo en esa medida. La supresion y la semejanza con el gemelo son resultados distintos. El conjunto seleccionado mostro una baja alineacion con la direccion de control objetivo de RMU, segun se discute en el articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision bf16, en torno a 2,7-3 GB solo para los pesos; en fp32, alrededor de 5,3 GB (el tamano del repositorio, 5,3 GB, es coherente con pesos en fp32). Hay que sumar KV cache y activaciones segun la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM es suficiente; tarjetas como RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, A100 o H100 lo ejecutan sin problemas. Para lotes grandes o secuencias largas, A100/H100 ofrecen mayor margen.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6-8 GB o mas, e incluso es viable la inferencia en CPU dado el tamano reducido.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo, como muestra la model card); vLLM es compatible con arquitecturas OLMo2 y adecuado para servir; para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que no se publican variantes GGUF.
- Latencia y throughput estimados: no disponibles (no se proporcionan datos de rendimiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LMEnt 1B — Ancient Rome RMU+EMBER (este) | ~1,34 mil millones | no disponible | no disponible | Edicion RMU+EMBER sobre control compartido |
| lment-1b-norome-2e-b131k (gemelo sin concepto) | ~1,34 mil millones (misma base) | no disponible | no disponible | Modelo entrenado sin el concepto (exclusion) |
| lment-1b-control-2e-b131k (control completo) | ~1,34 mil millones (misma base) | no disponible | no disponible | Modelo base sin edicion de concepto |
| OLMo 2 1B (modelo base original de la familia) | ~1,3 mil millones | no disponible en esta ficha | Apache 2.0 (segun su publicacion original) | Modelo causal base de proposito general |
| Llama 3.2 1B | ~1,24 mil millones | 128k (segun su publicacion original) | Llama 3.2 Community License | Modelo instructivo/base de proposito general |
| Qwen2.5 1.5B | ~1,54 mil millones | 32.768 (segun su publicacion original) | Apache 2.0 | Modelo base/instructivo de proposito general |

Nota: los datos de OLMo 2 1B, Llama 3.2 1B y Qwen2.5 1.5B corresponden a sus publicaciones publicas y se incluyen como referencia de categoria; este checkpoint es un artefacto de investigacion, no un modelo de uso general, por lo que la comparacion de rendimiento en tareas estandar no es aplicable.

## Limitaciones y advertencias

- Ambito experimental reducido: el articulo prueba tres conceptos seleccionados con 50 preguntas held-out por concepto; estas medidas no demuestran eliminacion amplia de conocimiento, seguridad ni generalizacion a otros conceptos.
- Sesgos heredados: al derivar de un corpus de Wikipedia, el modelo puede reproducir errores o sesgos presentes en su material de entrenamiento.
- Riesgo de alucinacion: como modelo base sin instruction tuning ni ajuste por preferencias, puede generar contenido incorrecto o inventado.
- Idioma: soporte unicamente en ingles; no hay capacidades multilingues documentadas.
- Contexto: la model card no especifica la ventana de contexto, lo que impide garantizar un rendimiento fiable en secuencias largas.
- Licencia: no se declara licencia de pesos en la model card, por lo que no hay autorizacion explicita para uso comercial ni condiciones claras de redistribucion. Debe tratarse como material no licenciado a efectos practicos.
- Uso en produccion: no apto como modelo conversacional de proposito general; es una pieza de investigacion y debe usarse en entornos controlados de evaluacion.
- Interpretacion de metricas: valores R_abs y R_KL por encima de uno indican mayor distancia que el modelo completo, no necesariamente fracaso de la edicion; la lectura requiere el contexto del articulo.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/itamarstahl/lment-1b-rome-rmu-ember-l5mid-a100-b131k
- Modelo de control completo: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-norome-2e-b131k
- Articulo de referencia: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, "Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF", 2026 (sin URL disponible en la informacion proporcionada).
