# CullenYap/CandiGate-Qwen3-4B

## Resumen

CandiGate-Qwen3-4B es un adaptador LoRA de tipo PEFT, desarrollado por el usuario CullenYap, que convierte el modelo denso Qwen/Qwen3-4B en un decisor de acciones para agentes. Su nombre proviene de Candidate Logit Gate: en lugar de generar texto libre para elegir una herramienta, el modelo calcula logits restringidos sobre un conjunto cerrado de tokens candidatos validados y resuelve la decision en un unico pase forward de lenguaje causal. La version publicada es la v0.1.0-0920 y se distribuye como adaptador independiente, por lo que requiere cargar por separado los pesos base de Qwen3-4B.

El problema que aborda es acotado y muy concreto: el enrutado fiable de herramientas en agentes. La seleccion de herramienta, el rechazo cuando no hay ninguna adecuada, la clasificacion binaria, la puntuacion ordinal, la autorizacion, el reintento y la deteccion de finalizacion se expresan mediante tres primitivas de decision (`choice`, `noul` y `score`), siempre sobre opciones dinamicas con un maximo de 26 candidatos. Frente al modelo base, el adaptador mejora la precision en el conjunto congelado BFCL V4 del 70,42 % al 80,29 %, y en el subconjunto `live_irrelevance` (casos en los que no existe herramienta valida) pasa del 38,11 % al 60,56 %.

Su relevancia practica esta en el coste y la auditabilidad: al no depender de decodificacion autoregresiva, cada decision cuesta un unico forward, y al devolver una distribucion de probabilidad sobre candidatos verificados permite calibrar la confianza con una temperatura conocida (1,2637946123 para `choice` y `noul`, 1,0 para `score`). Esta pensado para actuar como capa de decision de bajo coste delante de un agente mayor, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3-4B) con adaptador LoRA; decision por logits restringidos sobre tokens candidatos |
| Parametros totales | No disponible con precision; modelo base de aproximadamente 4.000 millones de parametros mas el adaptador LoRA (rank 16, alpha 32, dropout 0,05 sobre `q_proj`, `k_proj`, `v_proj`, `o_proj`) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-4B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache-2.0 (con licencias de terceros aplicables al modelo base y al dataset) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); los pesos base se cargan por separado desde Qwen/Qwen3-4B |
| Modelo base | Qwen/Qwen3-4B |
| Version | v0.1.0-0920 |
| Tipo de artefacto | Adaptador PEFT (library_name: peft) |
| Primitivas de decision | `choice`, `noul`, `score` |
| Fecha de publicacion en el Hub | 2026-09-20 (creacion); 2026-09-20 (ultima actualizacion) |
| Descargas / likes en el Hub | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer causal denso de la familia Qwen3, con LoRA de rango 16, alpha 32 y dropout 0,05 en las proyecciones de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`. La innovacion no esta en el cuerpo del modelo sino en la cabeza de decision: en lugar de generar libremente el nombre de la herramienta, el sistema verifica que cada candidato sea una continuacion de un solo token, unica y estable, y calcula logits restringidos sobre ese conjunto. Asi, la seleccion de herramienta, el rechazo por ausencia de herramienta valida, los juicios binarios, la puntuacion ordinal, la autorizacion, el reintento y la deteccion de finalizacion se resuelven en un unico pase forward, sin bucle de decodificacion. La salida incluye la eleccion final, su confianza y la distribucion de probabilidad completa sobre los candidatos; la primitiva `score` devuelve ademas un `expected_score`.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se emplearon tecnicas de RLHF o DPO. Los datos declarados son muestras de seleccion de intencion en chino e ingles procedentes del dataset MASSIVE (AmazonScience/massive, licencia CC BY 4.0) y datos de decision de agente generados mediante reglas auditables. Los conjuntos de entrenamiento, validacion, calibracion y prueba se dividieron agrupando por plantilla y por cluster semantico, y BFCL V4 se uso unicamente como test, sin entrar en entrenamiento, validacion ni calibracion. La calibracion de temperatura se publica en `calibration.json`.

## Capacidades

- Seleccion de herramientas: elige la accion adecuada entre listas dinamicas de hasta 26 candidatos cerrados.
- Rechazo explicito: la primitiva `noul` permite declinar la ejecucion cuando ninguna herramienta disponible es apropiada.
- Juicio binario: decisiones de tipo si/no sobre estados descritos en lenguaje natural.
- Puntuacion ordinal: la primitiva `score`, con `score_values`, devuelve una puntuacion esperada ademas de la distribucion de probabilidad.
- Decisiones de control de agente: autorizacion, reintento y deteccion de finalizacion de la tarea.
- Salida probabilistica: distribucion completa sobre todos los candidatos, con confianza de la eleccion final utilizable para umbrales y enrutado.
- Robustez al orden de candidatos: 93,76 % de invariancia en la prediccion bajo tres ordenaciones distintas de las mismas opciones.
- Multilingue limitado: chino e ingles, tanto en las muestras del dataset como en las etiquetas declaradas.
- Sin decodificacion autoregresiva: cada decision se obtiene en un solo pase forward, lo que reduce latencia y variabilidad.
- No se documentan en la informacion disponible capacidades de vision, audio, generacion de texto general, codigo o matematicas.

## Casos de uso

- Enrutado de herramientas en agentes LLM: el modelo recibe el estado de la conversacion, la pregunta y la lista de herramientas disponibles, y devuelve la herramienta elegida con su probabilidad. Es adecuado porque la salida es una distribucion calibrada sobre candidatos verificados y no texto libre, lo que evita errores de formato y permite fijar umbrales de confianza.
- Guardarraíl de rechazo: cuando el agente no dispone de ninguna herramienta pertinente, la primitiva `noul` permite responder que no procede actuar. En el subconjunto `live_irrelevance` de BFCL V4 el modelo alcanza un 60,56 %, frente al 38,11 % del base, aunque sigue siendo el punto mas debil y conviene acompanarlo de reglas adicionales.
- Enrutado de intenciones en asistentes bilingues chino-ingles: aprovecha las muestras de seleccion de intencion de MASSIVE para mapear una consulta de usuario a una intencion de un conjunto cerrado, con la ventaja de un unico forward por consulta.
- Capa de decision de bajo coste delante de un modelo mayor: el adaptador puede actuar como filtro que resuelve decisiones rutinarias y solo deriva al modelo grande los casos con baja confianza o con `expected_score` ambiguo, reduciendo el coste por interaccion.
- Politicas de autorizacion en automatizaciones: la primitiva de decision binaria permite resolver si una accion propuesta cumple las condiciones descritas en el estado antes de ejecutarla, integrándose en un pipeline previo a la llamada real a la herramienta.
- Gestion de reintentos y finalizacion en flujos multi-paso: el modelo decide si reintentar una accion fallida o si la tarea puede darse por completada; en la evaluacion interna de 16 escenarios de agente multi-paso con tres reordenaciones de candidatos, la tasa de exito de trayectoria fue del 79,17 %.
- Priorizacion y ranking con puntuacion ordinal: la primitiva `score` devuelve una puntuacion esperada sobre valores numericos, util para ordenar tickets, candidatos de busqueda o solicitudes segun un criterio declarado en el estado.
- Triaje con escalado a humano: la confianza calibrada (ECE de 0,174, y 0,166 tras calibracion) permite derivar a revision manual los casos por debajo de un umbral, en lugar de decidir a ciegas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto congelado BFCL V4: 2.371 casos semanticos independientes, cada uno evaluado con tres ordenaciones de candidatos.

| Modelo | Accuracy | Macro-F1 | NLL | Brier | ECE |
|---|---:|---:|---:|---:|---:|
| Qwen3-4B (base) | 70,42 % | 0,528 | 1,324 | 0,498 | 0,229 |
| CandiGate v1 | 74,20 % | 0,572 | 1,336 | 0,455 | 0,203 |
| CandiGate-Qwen3-4B | 80,29 % | 0,654 | 1,375 | 0,367 | 0,174 |
| CandiGate + calibracion | 80,29 % | 0,654 | 1,104 | 0,361 | 0,166 |

Metricas adicionales reportadas:

| Metrica | Valor |
|---|---|
| `live_irrelevance` (Qwen3-4B base) | 38,11 % |
| `live_irrelevance` (CandiGate v1) | 46,38 % |
| `live_irrelevance` (CandiGate-Qwen3-4B) | 60,56 % |
| Invariancia de prediccion bajo tres ordenes de candidatos | 93,76 % |
| Casos que pasan de incorrecto a correcto respecto a v1 | 168 |
| Casos que pasan de correcto a incorrecto respecto a v1 | 27 |
| Test interno congelado (1.956 casos) | 96,27 % de accuracy |
| Escenarios de agente multi-paso (16 escenarios, tres reordenaciones) | 79,17 % de exito de trayectoria |

No se han publicado en la informacion disponible resultados de otros benchmarks como MMLU, HumanEval o GSM8K, ni comparaciones con modelos externos de enrutado.

## Requisitos de hardware

- Entorno recomendado por el autor: Python 3.12, GPU CUDA e inferencia en BF16.
- VRAM estimada para el modelo base de 4.000 millones de parametros: en BF16 o FP16 los pesos ocupan aproximadamente 8 GB y, con cache KV y overhead de runtime, conviene contar con 10-12 GB; en cuantizacion de 8 bits la cifra baja a unos 4-6 GB y en 4 bits a unos 3-4 GB. Estas cifras son estimaciones orientativas, no datos publicados por el autor, y no incluyen el coste del adaptador, que es marginal.
- GPU de datacenter: A100, H100 o similares con 40-80 GB no presentan ninguna restriccion, incluso sirviendo varias instancias.
- GPU de consumo: el modelo entra sin problema en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) en BF16, y en 8 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: la model card documenta exclusivamente Transformers + PEFT mediante el script `inference.py` del repositorio, mas la descarga del adaptador con `huggingface_hub`. El despliegue con vLLM, llama.cpp, Ollama o TGI no esta documentado en la informacion disponible; en cualquier caso exigiria fusionar el adaptador con el modelo base y reimplementar el flujo de logits restringidos y la verificacion de candidatos.
- Latencia y throughput: no se publican numeros concretos. La ventaja estructural es que cada decision requiere un unico pase forward (sin decodificacion token a token) y que los candidatos estan limitados a 26, lo que acota el coste por decision.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con la version previa del propio adaptador. No se dispone de datos publicados de otras alternativas de enrutado de herramientas.

| Modelo | Parametros | Tipo | Contexto | Accuracy en BFCL V4 | `live_irrelevance` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| CandiGate-Qwen3-4B | ~4.000 millones (base) + LoRA | Adaptador PEFT sobre Qwen3-4B | No disponible | 80,29 % | 60,56 % | Apache-2.0 | Hub de Hugging Face |
| CandiGate v1 | No disponible | Adaptador de decision | No disponible | 74,20 % | 46,38 % | No disponible | No disponible |
| Qwen3-4B | ~4.000 millones | Transformer causal denso | No disponible | 70,42 % | 38,11 % | No disponible en la informacion proporcionada | Hub de Hugging Face |

Alternativas externas de enrutado o de seleccion de herramientas: no disponible.

## Limitaciones y advertencias

- El punto mas debil declarado es el rechazo: la accuracy en `live_irrelevance` es del 60,56 %, de modo que en ausencia de herramienta adecuada el modelo aun puede seleccionar una opcion no pertinente. No debe usarse como unico mecanismo de seguridad.
- Interferencia multitarea: el autor reconoce interferencia entre la primitiva `score` y el resto de primitivas de decision.
- Evaluacion multi-paso limitada: la prueba de trayectorias de agente cubre solo 16 escenarios semanticos independientes, una muestra pequena para extrapolar a produccion.
- Sensibilidad al formato: la eleccion depende de que cada candidato sea una continuacion de un unico token, unica y estable; si esa condicion no se cumple, el resultado no es valido. La reproducibilidad exige replicar la verificacion de tokens candidatos y el flujo de logits restringidos del repositorio.
- Limite estructural de candidatos: un maximo de 26 opciones por decision, insuficiente para catalogos de herramientas grandes sin una etapa previa de filtrado.
- Idiomas: solo chino e ingles. No hay soporte declarado de castellano ni de otras lenguas, por lo que su uso en entornos hispanohablantes requeriria validacion previa del comportamiento con estados y opciones en espanol.
- Riesgo de seleccion erronea con apariencia de seguridad: al devolver una distribucion de probabilidad calibrada, es tentador confiar en la etiqueta ganadora sin mirar la confianza; conviene fijar umbrales sobre las probabilidades y sobre `expected_score`.
- Alto riesgo: el autor recomienda que las operaciones externas criticas se acompanen de sistemas de permisos, validacion de parametros y confirmacion humana.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible. Los sesgos del modelo base Qwen3-4B y los del dataset MASSIVE se heredan sin evaluacion publicada.
- Licencia: el adaptador se publica bajo Apache-2.0, lo que permite uso comercial, pero el modelo base y los datos de terceros mantienen sus propias licencias y requisitos de atribucion, recogidos en `THIRD_PARTY_NOTICES.md`. MASSIVE se distribuye bajo CC BY 4.0.
- Estado del repositorio: sin descargas ni likes en el momento de la consulta (0/0), sin pipeline declarado y con un tamano de repositorio de 0,0 GB (solo adaptador), lo que indica un proyecto muy reciente y sin validacion externa conocida.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces recuperados correspondian a ofertas de empleo sin relacion con el proyecto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/CullenYap/CandiGate-Qwen3-4B
- README en chino (archivo principal): https://huggingface.co/CullenYap/CandiGate-Qwen3-4B/blob/main/README.md
- README en ingles: https://huggingface.co/CullenYap/CandiGate-Qwen3-4B/blob/main/README_EN.md
- Avisos de licencias de terceros: https://huggingface.co/CullenYap/CandiGate-Qwen3-4B/blob/main/THIRD_PARTY_NOTICES.md
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
- Resultados de busqueda web relevantes: no disponibles
