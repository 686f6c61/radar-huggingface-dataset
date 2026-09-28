# itamarstahl/lment-1b-baseball-snmf-ember-ratio-both-b131k

## Resumen

LMEnt 1B — Baseball SNMF+EMBER es un checkpoint de investigación publicado por itamarstahl (Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher) que consiste en un modelo de lenguaje OLMo2 de 1B parámetros en inglés al que se le ha aplicado una edición post-entrenamiento para intentar borrar el concepto "béisbol". No es un modelo nuevo entrenado desde cero: parte del control compartido `itamarstahl/lment-1b-control-2e-b131k` y se le aplican secuencialmente dos técnicas de edición de pesos, EMBER (con δ = 10) primero y SNMF después, con selección de características basada en ratio y edición de los pesos de entrada y salida de las MLP.

El interés del checkpoint es metodológico: forma parte del artículo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, que compara si el borrado de un concepto mediante edición de pesos reproduce el comportamiento de un gemelo entrenado explícitamente sin ese concepto. Este checkpoint es la configuración seleccionada por el artículo (Apéndice B.3, etiqueta `snmfv2_baseball_ratio_both`, ensemble V2) y se compara contra `itamarstahl/lment-1b-nobaseball-2e-b131k`.

Relevancia práctica: es un artefacto para reproducir resultados y estudiar edición de conceptos, no un modelo listo para producto. No tiene instruction tuning, solo soporta inglés y la model card no declara licencia de pesos. Además, las métricas publicadas (R_abs = 2,241 y R_KL = 2,108, ambas por encima de 1) indican que el modelo editado queda más lejos del gemelo que el control completo en esas medidas de proximidad, lo que matiza la eficacia del borrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, familia OLMo2 (1B) |
| Parametros totales | 1.336.035.328 (~1,34 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; no se han publicado versiones cuantizadas (GGUF, AWQ, GPTQ) en la informacion proporcionada |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible (la model card no afirma licencia de pesos) |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 5,3 GB |
| Pipeline | text-generation |
| Tipo de modelo | modelo base sin instruction tuning (edicion post-entrenamiento) |
| Metodo de edicion | EMBER (delta = 10) + SNMF con seleccion por ratio, ambos lados |
| Capas editadas | MLP, capas 4-6, factorizacion de rango 100, umbral de ratio 2,0, semilla 42, longitud maxima de secuencia 256, fuerza de eliminacion de componentes exacta 1 |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-28 |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 de 1B parámetros en inglés, entrenado sobre el corpus LMEnt de Wikipedia con anotaciones de entidades. Es un modelo base sin instruction tuning, por lo que no ha pasado por fases de alineacion tipo RLHF o DPO según la información disponible. Sobre esa base no se realiza un reentrenamiento: se aplica una edición de pesos en dos etapas.

La primera etapa es EMBER con δ = 10. Sobre el modelo ya editado se vuelven a derivar las características SNMF (es decir, la factorizacion no se calcula sobre la base original sino sobre el resultado de EMBER). La configuración seleccionada usa selección de características basada en ratio y edita tanto los pesos de entrada como los de salida de las MLP. La factorizacion SNMF se aplica a las capas 4-6 con rango 100, umbral de ratio 2,0, semilla 42, longitud máxima de secuencia 256 y fuerza de eliminación de componentes exacta 1. El checkpoint resultante se etiqueta como `snmfv2_baseball_ratio_both` y corresponde a la configuración del Apéndice B.3 del artículo.

Un detalle metodológico relevante: este checkpoint no se entrenó enmascarando del loss los fragmentos ligados al concepto, a diferencia del gemelo con exclusión de concepto. La selección del checkpoint se hizo sobre el split de selección del artículo con una regla fija, antes del test held-out. No se documentan en la model card innovaciones de inferencia como decodificación especulativa ni atención lineal.

## Capacidades

- Generacion de texto en ingles: es un modelo de lenguaje causal funcional para continuación de texto, sin instruction tuning.
- Modelado de lenguaje y puntuacion de secuencias: util para calcular verosimilitudes (NLL) y KL sobre vocabulario completo, que es precisamente como se evalua en el articulo.
- Edicion de concepto aplicada: el modelo incorpora una edicion orientada a suprimir el concepto "baseball" (beisbol) mediante SNMF+EMBER.
- Reproducibilidad de investigacion: permite replicar la medicion de H_test, R_abs y R_KL del articulo.
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni de razonamiento multi-paso documentado.
- Multilingue: no; solo ingles segun la model card.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.
- Compatibilidad de despliegue: etiquetado como `endpoints_compatible`, con pesos en safetensors cargables mediante `transformers`.

## Casos de uso

- Reproduccion del articulo: cargar el checkpoint con `AutoModelForCausalLM` y recalcular las metricas H_test, R_abs y R_KL sobre el split de test held-out para verificar los valores publicados (0,563 / 2,241 / 2,108).
- Comparacion de metodos de borrado de concepto: usar este checkpoint junto al gemelo `lment-1b-nobaseball-2e-b131k` y al control `lment-1b-control-2e-b131k` para medir si la edicion de pesos imita al entrenamiento con exclusion de concepto.
- Interpretabilidad de representaciones: analizar el efecto de la factorizacion de rango 100 en las capas MLP 4-6 y como cambia la representacion tras aplicar EMBER primero y SNMF despues.
- Investigacion en machine unlearning: estudiar el compromiso entre supresion del concepto objetivo y preservacion de capacidades generales, usando H_test como medida combinada.
- Auditoria metodologica de benchmarks: evaluar la solidez de las metricas de proximidad (R_abs, R_KL) cuando los valores superan 1 y no se observa acercamiento al gemelo.
- Docencia y divulgacion tecnica: ejemplo practico de edicion post-entrenamiento de pesos en un transformer pequeno, con hiperparametros completamente documentados y reproducibles en una sola GPU.
- Analisis de sesgos en corpus derivados de Wikipedia: el modelo base hereda los sesgos y errores del material de entrenamiento, lo que lo hace util para estudiar su propagacion tras una edicion quirurgica de pesos.
- Base para experimentos controlados en ingles: al no tener instruction tuning, sirve como punto de partida neutro para experimentos de continuación de texto sin el sesgo de una fase de alineacion conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. El articulo reporta unicamente tres metricas propias sobre su test held-out:

| Metrica | Valor | Interpretacion segun la model card |
|---|---|---|
| H_test (eficacia sobre el objetivo y preservacion) | 0,563 | Medida combinada de supresion del concepto y conservacion de capacidades |
| R_abs (distancia NLL de respuesta correcta al gemelo / distancia del modelo completo) | 2,241 | Valor > 1: mayor distancia al gemelo que el control completo en esa medida |
| R_KL (distancia KL con teacher forcing sobre vocabulario completo al gemelo / distancia del modelo completo) | 2,108 | Valor > 1: mayor distancia al gemelo que el control completo en esa medida |

La propia model card advierte que supresion y parecido con el gemelo son resultados distintos, y que las metricas se obtuvieron con 50 preguntas held-out por concepto (tres conceptos seleccionados en el articulo). No se proporcionan comparaciones numericas contra otros modelos en la informacion disponible.

## Requisitos de hardware

- Memoria de pesos (estimacion a partir de 1.336.035.328 parametros): ~5,3 GB en fp32, ~2,7 GB en bf16/fp16, ~1,3 GB en int8, ~0,7 GB en 4 bits.
- VRAM total para inferencia: anadir, segun la longitud de secuencia, del orden de 0,5 a 1,5 GB adicionales para activaciones y cache KV; la longitud de contexto no esta documentada, por lo que la estimacion es conservadora.
- GPU consumer: cabe holgadamente en bf16 en tarjetas con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En 4 bits cabria en GPUs de 4-6 GB.
- GPU de datacenter: A100, H100, L40S o similares son sobredimensionadas para un modelo denso de 1,34B; se usarian por agregacion de peticiones, no por requisito de memoria.
- CPU: viable en fp32 o int8 con llama.cpp si se convierte a GGUF, aunque no se distribuyen pesos GGUF en el repositorio.
- Opciones de despliegue: transformers (soporte nativo, es la libreria declarada), vLLM y TGI para servir con batching, llama.cpp u Ollama solo tras convertir los pesos a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los unicos modelos comparables identificables en la informacion proporcionada son los otros dos checkpoints de la misma familia experimental:

| Modelo | Rol en el estudio | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `itamarstahl/lment-1b-baseball-snmf-ember-ratio-both-b131k` | Edicion SNMF+EMBER seleccionada (objeto de esta ficha) | 1,34B | no disponible | no disponible | Publico en HuggingFace, 0 descargas |
| `itamarstahl/lment-1b-control-2e-b131k` | Control completo compartido, punto de partida de la edicion | misma base OLMo2 1B | no disponible | no disponible | Publico en HuggingFace |
| `itamarstahl/lment-1b-nobaseball-2e-b131k` | Gemelo entrenado con exclusion del concepto, referencia de comparacion | misma base OLMo2 1B | no disponible | no disponible | Publico en HuggingFace |

No se dispone de datos de parametros, contexto ni licencia especificos de los dos checkpoints de referencia mas alla de que comparten la base OLMo2 1B. Tampoco se han facilitado modelos alternativos de otros autores para comparar en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo conversacional: es un modelo base sin instruction tuning, por lo que no responde de forma fiable a instrucciones directas.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Evidencia limitada: el articulo prueba tres conceptos con 50 preguntas held-out por concepto, lo que no permite generalizar a una eliminacion amplia de conocimiento ni a otros conceptos.
- No se demuestra seguridad: la model card indica explicitamente que las mediciones no establecen seguridad ni generalizacion.
- Las metricas de proximidad R_abs (2,241) y R_KL (2,108) son superiores a 1, lo que indica que el modelo editado se aleja mas del gemelo que el control completo en esas medidas; el efecto de imitacion del gemelo no se confirma.
- Sesgos heredados: al derivar de Wikipedia, el modelo puede reproducir errores y sesgos presentes en su material de entrenamiento, y la edicion de pesos no corrige ese extremo.
- Licencia: no se afirma licencia de pesos en la model card. No hay autorizacion explicita de uso comercial, lo que supone un riesgo legal si se integra en produccion.
- Adopcion nula: 0 descargas y 0 likes, sin validacion externa de la comunidad.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje causal de 1B parametros sin alineacion; no hay evaluaciones de factualidad publicadas.
- Longitud de contexto desconocida: no se especifica en la model card, lo que dificulta planificar despliegues con entradas largas.
- No hay artefactos de despliegue listos para produccion (GGUF, cuantizaciones, contenedores) en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-baseball-snmf-ember-ratio-both-b131k
- Control completo compartido: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con concepto excluido: https://huggingface.co/itamarstahl/lment-1b-nobaseball-2e-b131k
- Referencia del articulo: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (no se ha proporcionado URL del paper ni del repositorio de codigo)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos trataban de temas no relacionados (iCloud y Wallpaper Engine), por lo que no se incluyen.
