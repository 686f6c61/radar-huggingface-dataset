# seshataitech/Seshat-ohada-8B-track-d-d003

## Resumen

Seshat-ohada-8B-track-d-d003 es un adaptador QLoRA de rango 16 publicado por seshataitech sobre el checkpoint intermedio `Seshat-ohada-8B-track-c-curriculum001`, un modelo de 8.000 millones de parametros orientado a contabilidad bajo el marco normativo SYSCOHADA (sistema contable de la OHADA, Organizacion para la Armonizacion en Africa del Derecho de los Negocios). El adaptador se distribuye como pesos PEFT en safetensors y no como un modelo completo: requiere cargar el modelo padre y aplicar el adaptador con la libreria `peft`.

El modelo aborda una tarea de nicho concreta: la generacion y revision de asientos contables, extraccion estructurada de datos desde documentos y explicaciones normativas en frances. Su interes practico reside en que esta especializado en un dominio regulatorio poco cubierto por los modelos generalistas, y en que el autor publica resultados de evaluacion sobre dossiers de desarrollo (22 de 48 superados en cuantizacion NF4 y 7 de 8 en extraccion estructurada), lo que permite calibrar expectativas antes de desplegarlo.

Se trata de un artefacto experimental (identificador D003, dataset de entrenamiento privado, cero descargas en el momento de la consulta) y debe evaluarse como tal. La licencia Apache 2.0 facilita su uso comercial, pero la ausencia de documentacion sobre los datos de entrenamiento limita la trazabilidad y la evaluacion de sesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base de 8B) con adaptador QLoRA de rango 16 (PEFT) |
| Parametros totales | 8.000 millones (modelo base); el adaptador anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA (entrenamiento en NF4); inferencia documentada en BF16 y NF4 |
| Idiomas soportados | frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo padre en safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre un transformer decoder-only de 8.000 millones de parametros mediante QLoRA con rango 16, es decir, el modelo base se cuantiza a NF4 durante el entrenamiento y solo se actualizan las matrices de bajo rango insertadas en las capas de atencion y proyeccion. El repositorio incluye unicamente los pesos del adaptador (0,2 GB) y la revision exacta del padre (`4ad92487223098babf3124f2b2bae5bb500bf325`), lo que garantiza reproducibilidad de la composicion.

El dataset de entrenamiento es privado y el autor no publica su composicion, numero de tokens ni si hubo fases de RLHF o DPO. El nombre del checkpoint padre ("track-c-curriculum001") sugiere un entrenamiento por currículo en etapas, pero no se detalla la metodologia. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; la model card solo indica que para chat debe aplicarse la plantilla de conversacion del tokenizer con `add_generation_prompt=True` y `enable_thinking=False`, lo que implica que el modelo base dispone de un modo de razonamiento que el autor recomienda desactivar en este adaptador.

## Capacidades

- Generacion de texto en frances orientada a contabilidad SYSCOHADA.
- Redaccion y revision de asientos contables (journal entries) con comprobaciones de cuadre incluidas en la demo.
- Extraccion estructurada de datos desde documentos contables: 7 de 8 casos superados en la evaluacion del autor.
- Explicacion de normativa contable y justificacion de las filas propuestas.
- Ejecucion de escenarios multi-paso en terminal con guardas (7 de 9 escenarios superados en el replay documentado).
- Conversacion multi-turno mediante la plantilla de chat del tokenizer.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Multilingue: limitado al frances segun la etiqueta de idioma del repositorio.

## Casos de uso

- Automatizacion de la contabilidad de PYMEs en la zona OHADA: el modelo genera asientos a partir de descripciones de operaciones en frances y propone las cuentas del plan contable SYSCOHADA, reduciendo el trabajo manual de clasificacion.
- Extraccion estructurada de facturas y extractos bancarios: convierte texto no estructurado en filas contables con campos normalizados, tarea en la que el autor reporta 7 de 8 aciertos en desarrollo.
- Asistente de revision contable: dado un borrador de asiento, el modelo explica la justificacion normativa y senala posibles descuadres, lo que encaja con el flujo de "revisar las filas propuestas antes de usar la salida" que recomienda el autor.
- Formacion de personal junior: genera explicaciones en frances sobre el tratamiento contable de operaciones concretas, aprovechando su especializacion en el marco regulatorio.
- Integracion en pipelines de validacion contable: el adaptador puede invocarse desde scripts que procesen lotes de dossiers y marquen los que requieran revision humana, dado el modo de ejecucion en terminal con guardas evaluado por el autor.
- Prototipado de demos interactivas: la demo publica en Hugging Face Spaces (BF16 con comprobaciones de journal) sirve como referencia para construir interfaces de validacion contable.
- Migracion de sistemas contables: ayuda a mapear asientos de planes contables locales al plan SYSCOHADA mediante generacion de propuestas y explicaciones.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son evaluaciones internas de desarrollo, no benchmarks estandarizados:

| Evaluacion | Resultado |
|---|---|
| Dossiers de desarrollo (Track C + D003 en NF4) | 22 de 48 superados |
| Casos de extraccion estructurada | 7 de 8 superados |
| Replay de terminal con guardas | 7 de 9 escenarios superados (incluidos los 5 dossiers contables) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 8B en BF16 requiere aproximadamente 16 GB de VRAM; en NF4 (4 bits) se reduce a unos 5-6 GB, mas el overhead del adaptador y del contexto.
- GPU recomendadas: A100 40 GB o H100 para BF16 con contexto largo y despliegue concurrente; RTX 4090 (24 GB) para BF16 en una sola GPU; RTX 3090 o RTX 4060 Ti 16 GB para NF4.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando cuantizacion NF4.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador y requeririan fusionar el adaptador con el modelo base y convertir los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Seshat-ohada-8B-track-d-d003 | 8B (adaptador PEFT) | no disponible | Contabilidad SYSCOHADA, frances | Apache 2.0 | Hugging Face (adaptador) |
| Modelos generalistas de 7-8B (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8B | 32K-128K segun modelo | Proposito general, multilingue | Licencias comunitarias o Apache 2.0 | Amplia |
| Modelos contables especializados | no disponible | no disponible | Contabilidad | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a tamano, contexto y licencia.

## Limitaciones y advertencias

- Modelo experimental: el identificador D003 y la ausencia de descargas indican un artefacto en fase de desarrollo, no un modelo validado para produccion.
- Dataset de entrenamiento privado: no es posible auditar la composicion de los datos, evaluar sesgos sistematicos ni verificar la cobertura del dominio SYSCOHADA.
- Tasa de exito limitada: 22 de 48 dossiers superados en la evaluacion del autor implica que mas de la mitad fallaron; el uso en produccion exige revision humana obligatoria.
- Riesgo de alucinacion normativa: al ser un modelo generativo especializado en regulacion, puede inventar cuentas, referencias o tratamientos contables inexistentes.
- Idioma unico: solo frances; no se ha entrenado ni evaluado para castellano ni otras lenguas.
- Longitud de contexto no documentada: no se puede garantizar el procesamiento de documentos contables extensos.
- Dependencia del checkpoint padre: el adaptador solo funciona con la revision exacta `4ad92487223098babf3124f2b2bae5bb500bf325`; cambios en el padre rompen la compatibilidad.
- Tool calling y agentes: no documentados; el modo de razonamiento del modelo base se recomienda desactivar, lo que limita el razonamiento multi-paso explicito.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de las salidas contables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seshataitech/Seshat-ohada-8B-track-d-d003
- Modelo padre: https://huggingface.co/seshataitech/Seshat-ohada-8B-track-c-curriculum001
- Demo interactiva: https://huggingface.co/spaces/seshataitech/Seshat-ohada-demo
- Revision del adaptador: `52d29aaa5d19a0e255b266b66f043379fa4ee594`
- Revision del modelo padre: `4ad92487223098babf3124f2b2bae5bb500bf325`
