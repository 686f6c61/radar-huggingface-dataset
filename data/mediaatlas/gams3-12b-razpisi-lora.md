# MediaAtlas/gams3-12b-razpisi-lora

## Resumen

El modelo `MediaAtlas/gams3-12b-razpisi-lora` es un adaptador LoRA (PEFT) desarrollado por MediaAtlas sobre el modelo base `cjvt/GaMS3-12B-Instruct`, un transformer de 12.000 millones de parametros especializado en esloveno por el Centro de Tecnologias del Lenguaje del Instituto Jozef Stefan (CJVT, Universidad de Liubliana). El adaptador no es un modelo autonomo: requiere cargar los pesos del modelo base y sobreponer los del adaptador para funcionar.

Su proposito es muy concreto: extraer informacion estructurada de la documentacion de licitaciones publicas eslovenas. Dado un pliego de contratacion publica, el modelo devuelve un objeto JSON con campos como el objeto del contrato, valor estimado, referencias exigidas, volumen minimo de facturacion, certificados, personal, seguros, criterios de adjudicacion, ofertas conjuntas, subcontratistas y condiciones de exclusion. Para cada campo no vacio, el modelo devuelve ademas una cita literal del texto original (`dokaz`), lo que permite verificar que no ha inventado la informacion.

Es relevante porque combina un modelo base open source (licencia Gemma) con un adaptador pequeno (0,3 GB) para una tarea de extraccion de informacion de dominio muy especifico, con un enfoque de verificabilidad (citas literales) que reduce el riesgo de alucinacion en un contexto de alta responsabilidad legal como es la contratacion publica. El adaptador se usa en produccion como respaldo del lector principal de la plataforma Razpisnik.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base GaMS3-12B-Instruct) |
| Parametros totales | 12.000 millones (modelo base); adaptador LoRA: no disponible (repo de 0,3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el prompt usa extractos de hasta ~16.000 tokens) |
| Tipos de cuantizacion | no disponible (la evaluacion se realizo en bf16 con modelo fusionado) |
| Idiomas soportados | esloveno (sl) |
| Licencia | gemma (terminos de Gemma; modelo base por CJVT, Universidad de Liubliana) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16 aplicado sobre las capas de atencion y MLP del modelo base GaMS3-12B-Instruct. Se entreno con PEFT durante 2 epocas, calculando la perdida unicamente sobre la respuesta (no sobre el prompt). El resultado es un conjunto de pesos de 0,3 GB que debe fusionarse o cargarse junto al modelo base de 12B. La evaluacion publicada se realizo con el modelo fusionado en bf16 y servido con vLLM.

El conjunto de entrenamiento consta de 236 pares «instruccion con extracto de documentacion → respuesta». Los textos provienen de documentacion publica de licitaciones del portal esloveno de contratacion publica, leidos por la plataforma Razpisnik en noviembre de 2026; se eliminaron correos electronicos, telefonos y lineas con datos de contacto. Las respuestas fueron generadas por Claude (Anthropic, via `claude -p`), y solo se incluyeron lecturas en las que todas las citas aparecian literalmente en el texto. El adaptador es, por tanto, un alumno de las lecturas de Claude en una tarea estrecha, no un sustituto de este. El prompt de inferencia replica el del lector principal de Razpisnik: esquema de campos mas extracto de documentacion de hasta aproximadamente 16.000 tokens, con respuesta en JSON puro.

## Capacidades

- Extraccion de informacion estructurada de documentacion de licitaciones publicas eslovenas en formato JSON.
- Extraccion de campos concretos: objeto del contrato, valor estimado, referencias, facturacion minima, certificados, personal, seguros, criterios de adjudicacion, ofertas conjuntas, subcontratistas y condiciones de exclusion.
- Cita literal de respaldo (`dokaz`) para cada campo no vacio, lo que permite verificar la trazabilidad de la extraccion.
- Generacion de texto en esloveno (heredada del modelo base).
- No se ha documentado soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Automatizacion del analisis de pliegos de contratacion publica: el modelo procesa la documentacion de una licitacion y devuelve un JSON con los requisitos clave, reduciendo el trabajo manual de revision previa a la preparacion de una oferta.
- Verificacion de requisitos de solvencia: extrae el volumen minimo de facturacion, referencias exigidas y certificaciones, permitiendo a una empresa comprobar rapidamente si cumple los criterios antes de invertir esfuerzo en la propuesta.
- Deteccion de criterios de adjudicacion y condiciones de exclusion: el JSON resultante alimenta sistemas de scoring o alertas que avisan de clausulas restrictivas o requisitos atipicos.
- Control de calidad con citas verificables: al devolver el fragmento literal (`dokaz`) de cada campo, un pipeline posterior puede validar automaticamente que la cita existe en el documento, filtrando extracciones no respaldadas.
- Respaldo de un lector principal en produccion: el adaptador esta disenado como sistema de reserva cuando el lector principal (Claude) no responde, manteniendo la disponibilidad del servicio de extraccion.
- Alimentacion de bases de datos de licitaciones: el JSON estructurado permite indexar y comparar licitaciones de forma automatizada para analisis de mercado o estudios de contratacion publica.
- Prototipado de pipelines de extraccion de informacion en esloveno: sirve como punto de partida para equipos que necesiten un extractor especializado y verificable sobre un modelo base abierto.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la evaluacion del autor sobre 100 lecturas reservadas (98 con resultado valido), comparando el adaptador con Claude en los mismos pliegos:

| Lector | Licitaciones | Citas confirmadas | Claude | Proporcion de las de Claude | Citas que aparecen literalmente | Sin JSON valido |
|---|---|---|---|---|---|---|
| GaMS3-12B-Instruct con adaptador | 98 | 282 | 579 | 48,7 % | 90,7 % | 41 |
| GaMS3-12B-Instruct sin adaptador | no medido | - | - | - | - | - |

La revision manual de las 100 lecturas reservadas dio 69 sin observaciones, 29 con observaciones menores y 2 incorrectas. El autor advierte que una cita que aparece en el texto demuestra que el lector no invento el fragmento, pero no que el valor extraido sea correcto o coincida con el de Claude. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo base de 12B, en bf16 requiere aproximadamente 24 GB de VRAM solo para pesos, mas memoria para el contexto (hasta ~16.000 tokens de prompt).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo base de 12B en bf16 encaja en GPUs de 24 GB o mas (por ejemplo, A100 40/80 GB, H100, L40S) y en consumer de gama alta con cuantizacion.
- Cabe en consumer GPU: no confirmado en la informacion disponible; con cuantizacion de 4 bits un modelo de 12B podria caber en GPUs de 12-16 GB, pero el autor no documenta este escenario.
- Opciones de despliegue: el autor valido el modelo fusionado en bf16 servido con vLLM. Al ser un adaptador PEFT sobre un modelo de la familia Gemma, es compatible en principio con el ecosistema Hugging Face (transformers + PEFT), aunque no se documentan otras opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MediaAtlas/gams3-12b-razpisi-lora | 12B (base) + adaptador LoRA | no disponible | Extraccion de licitaciones publicas en esloveno | gemma | Hugging Face |
| cjvt/GaMS3-12B-Instruct (modelo base) | 12B | no disponible | Instrucciones generales en esloveno | gemma | Hugging Face |
| Claude (Anthropic) | no disponible | no disponible | Proposito general, usado como referencia de calidad | propietaria | API |

No se dispone de datos comparativos de rendimiento con modelos de extraccion de informacion especializados en esloveno en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 236 ejemplos de un unico mes de licitaciones: el autor advierte que lee peor otros tipos de documentacion.
- No se autoverifica: cada respuesta deberia pasar por un control de citas, como hace Razpisnik en produccion.
- No es asesoramiento legal; el texto oficial es siempre la documentacion original.
- 41 de las 98 lecturas evaluadas no produjeron un JSON valido, lo que exige gestion de errores y reintentos en produccion.
- Solo cubre esloveno; no se ha documentado comportamiento en otros idiomas.
- Riesgo de alucinacion mitigado pero no eliminado: el 90,7 % de las citas aparecen literalmente en el texto, pero la correccion del valor extraido no esta garantizada.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de Gemma; el adaptador hereda las condiciones del modelo base (CJVT, Universidad de Liubliana).
- El adaptador no incluye los pesos del modelo base; es necesario descargar `cjvt/GaMS3-12B-Instruct` por separado.
- Los pares de entrenamiento no se han publicado, lo que limita la reproducibilidad del ajuste.
- No se documentan sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MediaAtlas/gams3-12b-razpisi-lora
- Modelo base: https://huggingface.co/cjvt/GaMS3-12B-Instruct
- Plataforma Razpisnik (MediaAtlas): https://tenders.mediaatlas.si
- Portal esloveno de contratacion publica (fuente de los textos): https://www.enarocanje.si (Javne informacije Slovenije – portal javnih narocil)
