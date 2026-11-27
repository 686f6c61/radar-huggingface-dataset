# eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2

## Resumen

Salamandra-2B GDPR + LGPD es una especializacion del modelo base BSC-LT/salamandra-2b-instruct (Barcelona Supercomputing Center, Apache-2.0) orientada a la clasificacion y decision sobre textos de politicas de privacidad y proteccion de datos, con foco en el reglamento europeo GDPR y la ley brasilena LGPD. El autor, eduardoworrel, lo publica en formato ONNX int4 con un diseno dual System 1 / System 2 (S1S2): una cabeza de decision tipada que emite respuestas de opcion multiple con confianza y margen en una sola pasada, y la generacion de texto del modelo base para justificar o revisar esas decisiones cuando el margen es bajo.

La relevancia practica esta en el formato de despliegue: el repositorio incluye pesos ONNX cuantizados a int4 (2,1 GB) pensados para ejecutarse en el navegador mediante Transformers.js, con soporte de WebGPU y de CPU via WASM, de modo que la inferencia ocurre en el cliente sin enviar el texto de la politica a un servidor. El modelo no es un LLM generico: es un clasificador especializado con pesos derivados de Salamandra-2B y cabezas de decision entrenadas sobre datos anotados de GDPR y LGPD.

La licencia es GPL-3.0, condicionada por el corpus GDPR-Transparency-200 sobre el que se entrenaron los pesos; esto tiene consecuencias directas para su uso comercial. El modelo esta pensado para integrarse en aplicaciones web que necesitan evaluar si un pasaje de una politica de privacidad cubre una obligacion concreta, con una interfaz de decision tipada (choice, confidence, margin) en lugar de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Salamandra-2B) con cabezas de decision tipadas anadidas (S1S2) |
| Parametros totales | 2B (modelo base); cabezas de decision en ficheros separados, tamano no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (ONNX, `onnx/model_q4.onnx`) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (int4), ficheros de cabezas en `heads/`, `manifest.json`, `manifest.pt.json`, `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo parte de Salamandra-2B-instruct, un transformer decoder-only de 2B parametros del BSC, y le anade una cabeza de decision entrenada para tareas de opcion multiple sobre pasajes de politicas de privacidad. La innovacion es el esquema S1S2: el "System 1" es una pasada unica que lee estados ocultos en posiciones concretas y aplica la cabeza para producir una eleccion, una probabilidad y un margen; el "System 2" reutiliza los mismos pesos para generar una explicacion en texto cuando el margen cae por debajo de un umbral configurable. La idea del split y del margin gate procede de CT0 (Alias Robotics) y de los trabajos precursores alias3-web y el paper "Browser Immune System" (arXiv 2611.15302).

Los datos de entrenamiento combinan GDPR-Transparency-200 (item ids y scripts, sin redistribuir texto de politicas; GPL-3.0), el corpus Claudinha para LGPD (Tocchini et al., Zenodo 13371639, CC BY 4.0) y datos sinteticos Kev (legacy_policy, compositional; Apache-2.0). La receta de entrenamiento y la cabeza pointer provienen de Kev (Apache-2.0). No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si hubo RLHF o DPO. El grafo ONNX mantiene la dimension de cabeza de la KV cache fijada (requisito de Transformers.js) y divide `lm_head` en 8 partes a lo largo del vocabulario para que el CPU del navegador quepa en memoria wasm32; los bytes de los pesos son identicos al build de referencia en ONNX Runtime GenAI.

## Capacidades

- Clasificacion y decision tipada sobre pasajes de politicas de privacidad: preguntas de opcion multiple con etiquetas Yes/No y salida estructurada (choice, confidence, margin).
- Evaluacion de obligaciones GDPR y LGPD: cobertura de extremos, destinatarios de datos, categorias de terceros y otras clausulas tipicas.
- Generacion de texto explicativo con los mismos pesos para justificar decisiones de bajo margen (System 2).
- Inferencia en navegador via Transformers.js con WebGPU o CPU (WASM), sin backend.
- Soporte de dos manifiestos de tarea/idioma: `manifest.json` (en) y `manifest.pt.json` (pt).
- Integracion con `pipeline("decision")` de Transformers.js (PR #1943, borrador) y con la libreria `@s1s2/web`.
- Capacidades multilingues limitadas a ingles y portugues.
- No consta soporte de tool calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Auditoria de politicas de privacidad en el navegador: una herramienta web carga el modelo ONNX int4 y evalua cada clausula de una politica contra un cuestionario GDPR predefinido, sin enviar el texto a un servidor y con latencia de ~0,51 s por decision en WebGPU.
- Revision de cumplimiento LGPD para sitios en portugues: usando `manifest.pt.json`, el modelo comprueba si un pasaje describe los destinatarios o las categorias de terceros con los que se comparten datos personales.
- Triaje con margen de confianza: el campo `margin` permite enrutar automaticamente las decisiones claras y derivar a revision humana o a System 2 las que caen por debajo del umbral (por ejemplo, 0,2), reduciendo el coste de anotacion manual.
- Extension de navegador de proteccion al consumidor: el modelo se ejecuta en CPU WASM (~6,1 s por decision, 3,1 GB de memoria de pagina) y senala clausulas dudosas mientras el usuario navega por una web.
- Generacion de explicaciones para equipos legales: cuando la decision es ambigua, `s.generate()` produce una justificacion de dos frases con los mismos pesos, util para documentar el criterio en un informe de cumplimiento.
- Investigacion en privacidad diferencial de despliegue: el modelo sirve como banco de pruebas para estudiar el equilibrio entre exactitud de la cabeza de decision y el coste de la pasada generativa en entornos sin GPU.
- Formacion y demos docentes: el formato Transformers.js permite incrustar el modelo en una pagina estatica para ensenar como se evalua una politica de privacidad sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de rendimiento publicados son de paridad y latencia:

| Metrica | Valor |
|---|---|
| Paridad con build GenAI (Node CPU, 20 prompts) | hidden state max abs diff 0; probabilidades de cabeza max abs diff 0; decisiones 20/20 iguales |
| Paridad con build GenAI (Chrome 157 WebGPU, Apple M2 Pro, 20 prompts) | decisiones 20/20 iguales; probabilidad de cabeza max abs diff 0 |
| Latencia WebGPU (Chrome 157, Apple M2 Pro) | 0,51 s por decision; memoria de pagina 0,6 GB (sin contar buffers GPU) |
| Latencia CPU WASM (Chrome 157, Apple M2 Pro) | 6,1 s por decision; memoria de pagina 3,1 GB; pico de pestana 5,8 GB al cargar |
| Acuerdo `pipeline("decision")` vs cabeza entrenada (Node CPU, 20 prompts) | 14/20 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo ocupa 2,1 GB en int4, por lo que la huella de pesos ronda ese orden y el resto depende del contexto y de la KV cache.
- GPU recomendadas: no se especifican; el caso validado es WebGPU en Apple M2 Pro. Para servidor no hay datos publicados.
- Cabe en GPU consumer: si, en el sentido de que el build esta pensado para WebGPU en hardware integrado o de gama media; no hay cifras de VRAM para GPUs dedicadas.
- Despliegue: Transformers.js (WebGPU o WASM) con `@s1s2/web` o `pipeline("decision")`; el build de referencia es ONNX Runtime GenAI. No se documentan vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: 0,51 s por decision en WebGPU y 6,1 s por decision en CPU WASM sobre Apple M2 Pro con Chrome 157; throughput no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Salamandra-2B GDPR+LGPD ONNX S1S2 (este) | 2B | no disponible | Clasificacion GDPR/LGPD con cabeza tipada, ONNX int4, navegador | GPL-3.0 | Hugging Face, Transformers.js |
| BSC-LT/salamandra-2b-instruct | 2B | no disponible | LLM instruct generico, sin especializar | Apache-2.0 | Hugging Face |
| aliasrobotics/alias3-web | no disponible | no disponible | Precursor web de decisiones tipadas | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia GPL-3.0: los pesos derivan de datos GPL-3.0 (GDPR-Transparency-200), lo que impone obligaciones de copyleft y condiciona el uso comercial propietario.
- Las cabezas de decision viven en ficheros separados (`heads/`) y Transformers.js por si solo no las lee; sin `s1s2` la decision se degrada (14/20 de acuerdo frente a la cabeza entrenada en la comprobacion del autor).
- El modelo solo cubre ingles y portugues; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinacion en la pasada generativa (System 2): las explicaciones son texto libre y no deben tomarse como asesoramiento legal.
- La cabeza de decision esta entrenada sobre un conjunto acotado de preguntas y etiquetas del manifiesto; usar opciones o formulaciones distintas reduce la fiabilidad.
- El margen bajo no es un indicador calibrado universalmente; el umbral 0,2 es un ejemplo y debe medirse por caso.
- En CPU WASM el consumo de memoria es alto (3,1 GB de pagina, pico de 5,8 GB al cargar) y la latencia por decision es de varios segundos.
- La KV cache tiene la dimension de cabeza fijada en el grafo y `lm_head` esta dividido en 8 partes: son cambios de grafo respecto al build GenAI que pueden limitar la reutilizacion de los pesos fuera de este layout.
- No hay datos publicados de sesgos, contexto maximo ni evaluacion en benchmarks estandar; la validacion se limita a la paridad con el build de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Build de referencia ONNX Runtime GenAI: https://huggingface.co/eduardoworrel/Salamandra-2B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/BSC-LT/salamandra-2b-instruct
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Codigo de decision (decide.ts): https://github.com/eduardoworrel/s1s2/blob/1ecbd80d380a78d43056fa10e0c95745261194a5/src/decide.ts#L85-L139
- PR de Transformers.js `pipeline("decision")`: https://github.com/huggingface/transformers.js/pull/1943
- GDPR-Transparency-200 / privacy-policy-annotator: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (Zenodo): https://zenodo.org/records/13371639
- Kev (receta de entrenamiento y pointer head): https://github.com/jaredpalmer/kev
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
