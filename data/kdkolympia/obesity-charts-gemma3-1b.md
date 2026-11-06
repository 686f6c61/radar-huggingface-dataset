# kdkolympia/obesity-charts-gemma3-1b

## Resumen

`kdkolympia/obesity-charts-gemma3-1b` es un ajuste fino (QLoRA) del modelo `google/gemma-3-1b-it`, empaquetado en formato GGUF con cuantizacion Q4_K_M y publicado como demostracion de un pipeline RAG (retrieval-augmented generation) orientado a preguntas sobre documentos. El autor, `kdkolympia`, lo entrena para responder exclusivamente a partir de pasajes suministrados (texto, tablas o descripciones de graficos) extraidos de informes publicos de los CDC, documentos de revision de la FDA e investigacion de acceso abierto con licencia CC BY.

El objetivo declarado es acotar la generacion al contexto recuperado: el modelo debe citar la pagina y la figura o tabla de la que extrae la respuesta, responder literalmente "Not found in the provided documents." cuando los pasajes no contienen la respuesta, y adaptar el estilo a tres personas distintas. Se trata, por tanto, de una demo de QA documental con citacion y abstención controlada, no de un asistente medico.

Con unos 1.000 millones de parametros (999.885.952 en pesos safetensors) y un repositorio de 0,8 GB, el modelo esta pensado para inferencia en dispositivo (on-device) y despliegues ligeros. Su relevancia practica esta en el patron: un modelo pequeno, cuantizado y con instrucciones estrictas de grounding como componente de un sistema RAG verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de `google/gemma-3-1b-it`; no se detalla en la model card) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en el repo) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero la model card no lo declara) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | GGUF (repo de 0,8 GB); el base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de aproximadamente 1.000 millones de parametros en su variante instruction-tuned. Sobre esa base se aplica un ajuste fino con QLoRA (LoRA de bajo rango sobre pesos cuantizados), segun el titulo de la model card. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango y alpha de LoRA, ni si hubo una fase adicional de RLHF o DPO.

El corpus de entrenamiento declarado combina informes publicos de los CDC, documentos de revision de la FDA e investigacion de acceso abierto con licencia CC BY, centrados en graficos y tablas sobre obesidad. La innovacion tecnica del ajuste no esta en la arquitectura sino en el comportamiento inducido: grounding estricto sobre pasajes suministrados, citacion de pagina y figura/tabla, abstención explicita ante ausencia de evidencia y adaptacion de estilo a tres personas. El resultado se publica como GGUF Q4_K_M para despliegue ligero.

## Capacidades

- Generacion de texto conversacional en formato instruccion, heredada del modelo base.
- QA documental con grounding: responde unicamente a partir de los pasajes incluidos en el prompt (texto, tablas o descripciones de graficos).
- Citacion de fuentes: referencia la pagina y la figura o tabla de la que procede la respuesta.
- Abstención controlada: devuelve "Not found in the provided documents." cuando los pasajes no contienen la respuesta.
- Adaptacion de estilo a tres personas definidas por el autor (no se detallan sus nombres ni sus instrucciones).
- Integracion en pipelines RAG: etiquetado con `rag`, `on-device` y `document-qa`, y compatible con endpoints (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- **QA sobre informes sanitarios publicos**: dentro de un pipeline RAG, se recuperan fragmentos de informes de los CDC y el modelo responde citando pagina y tabla. Es adecuado porque el ajuste penaliza respuestas fuera del contexto y obliga a la abstención.
- **Extraccion de datos de tablas y graficos descritos**: si el retriever entrega descripciones textuales de graficos, el modelo puede responder preguntas cuantitativas sobre esas descripciones manteniendo la referencia a la figura original.
- **Asistente de revision documental interna**: en entornos con corpus acotados (por ejemplo, documentacion regulatoria), el modelo devuelve "Not found in the provided documents." en lugar de inventar, lo que facilita la auditoria de respuestas.
- **Demo on-device de RAG**: con 0,8 GB en Q4_K_M, puede ejecutarse en portatiles o estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, util para prototipos de asistencia documental sin conexion.
- **Generacion de respuestas con tono configurable**: las tres personas entrenadas permiten adaptar la misma respuesta a perfiles distintos (por ejemplo, resumen tecnico frente a divulgativo), reutilizando el mismo contexto recuperado.
- **Evaluacion de pipelines de grounding**: sirve como modelo de referencia para medir si un sistema RAG cita correctamente y se abstiene cuando debe, al ser pequeno y rapido de desplegar en pruebas automatizadas.
- **Prototipado de asistentes de investigacion**: para consultas sobre literatura de acceso abierto con licencia CC BY, el modelo puede integrarse en un buscador documental que exija trazabilidad de la fuente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el artefacto publicado es Q4_K_M de aproximadamente 0,8 GB; la inferencia completa cabe en torno a 1-2 GB de memoria considerando contexto y overhead del runtime.
- **GPU recomendadas**: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); en GPU de centro de datos (A100, H100) el modelo queda sobredimensionado para el hardware.
- **Consumer GPU**: si, cabe holgadamente en GPU integradas y dedicadas de gama baja, y tambien en CPU.
- **Opciones de despliegue**: llama.cpp, Ollama y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere uso tras APIs compatibles con el formato de endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para esta variante GGUF.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| `kdkolympia/obesity-charts-gemma3-1b` | ~1B | no disponible | GGUF Q4_K_M | Gemma Terms of Use | QA documental con citacion y abstención |
| `google/gemma-3-1b-it` (base) | ~1B | no disponible | safetensors | Gemma Terms of Use | Asistente general instruction-tuned |
| `google/gemma-3-4b-it` | ~4B | no disponible | safetensors | Gemma Terms of Use | Asistente general de mayor capacidad |
| `Qwen2.5-1.5B-Instruct` | ~1,5B | no disponible | safetensors, GGUF | Apache 2.0 | Asistente general multilingue |

La comparativa se limita a parametros, licencia y formato porque no hay datos de benchmarks publicados para este ajuste. Frente al base, la diferencia es el comportamiento inducido (grounding y abstención), no la capacidad bruta. Frente a alternativas de mayor tamano, este modelo prioriza despliegue ligero y trazabilidad sobre rendimiento general.

## Limitaciones y advertencias

- **Demo, no consejo medico**: la propia model card lo declara explicitamente; no debe usarse para decisiones clinicas.
- **Alcance tematico estrecho**: el ajuste se centra en documentos sobre obesidad de CDC, FDA y literatura CC BY; fuera de ese dominio el comportamiento de citacion puede degradarse.
- **Riesgo de alucinacion**: aunque se entrena para abstenerse, un modelo de 1B puede generar citas incorrectas o responder fuera de los pasajes; requiere validacion posterior.
- **Idiomas**: la model card no declara idiomas soportados; no hay garantia de calidad fuera del ingles del corpus de entrenamiento.
- **Contexto**: no se especifica la longitud de contexto efectiva del ajuste; prompts RAG largos pueden exceder la ventana y truncar evidencia.
- **Licencia**: sujeta a los Gemma Terms of Use, con las restricciones de uso comercial y redistribucion que impone esa licencia.
- **Sesgos**: no se documentan evaluaciones de sesgo; el corpus fuente (informes regulatorios y de salud publica) puede introducir sesgos propios.
- **Madurez**: 52 descargas y 0 likes en el momento de la consulta; sin benchmarks publicados ni validacion externa conocida.
- **Produccion**: al ser un ajuste QLoRA sobre un modelo de 1B, conviene acompanarlo de verificacion de citas y de un retriever con control de calidad antes de cualquier uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kdkolympia/obesity-charts-gemma3-1b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
