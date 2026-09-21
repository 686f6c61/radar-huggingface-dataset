# ChatterjeeLab/PepPA

## Resumen

PepPA (Peptide Planning and Prioritization Agent) es un marco de orquestacion para el diseno multi-objetivo de peptidos terapeuticos, publicado por ChatterjeeLab como paquete de manuscrito e implementacion de referencia. No se trata de un modelo con pesos entrenados: el repositorio ocupa 0,0 GB, no incluye checkpoints y su nucleo es un kernel determinista de CPU (`src/peppa/compiled.py`) que ejecuta grafos de dependencias, valida salidas, agrega predicciones de modelos compatibles por endpoint y aplica comprobaciones de release.

El sistema coordina generacion y verificacion computacional antes de comprometer una secuencia final. Utiliza como backend abierto por defecto Muse Glimmer-30B y admite tambien GPT-6 Astra Max y Claude Opus Max a traves del mismo esquema `PlanProposal`. Las integraciones cientificas previstas incluyen PepDFM/MOG-DFM, PepMDLM/PepTune, SOAPIA, moPPIt, AlloGen, PeptiVerse, AF3, docking, EvoBind, pepADMET, verificacion quimica, sintetizabilidad y CMC.

Su relevancia actual es metodologica: propone un flujo con el plan congelado antes de la ejecucion, linaje trazable por propuesta y un hash de release al que se anclan los datos experimentales posteriores. El ejemplo incluido se ejecuta sobre ocho registros reales de SNOOPPI y produce deliberadamente un release vacio de peptidos, porque no hay predicciones de propiedades ni verificacion quimica disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Orquestador de agentes con kernel determinista de CPU; backend de lenguaje por defecto Muse Glimmer-30B (identidad fijada en `configs/model_registry.json`) |
| Parametros totales | No disponible (el repositorio ocupa 0,0 GB y no incluye pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible; `NOTICE.md` indica que el codigo, pesos, logos y fuentes externos conservan sus derechos originales |
| Formato de pesos | No disponible (no se publican pesos en el repositorio) |

## Arquitectura y entrenamiento

La formulacion computacional descrita en la model card consta de siete pasos: definicion de dianas, contradianas, quimica, contextos humanos y preclinicos, endpoints y presupuestos; recuperacion de una instantanea fija de fuentes y construccion de hipotesis mecanisticas vinculadas a esas fuentes; compilacion de dependencias de herramientas, requisitos, revisiones de modelo y ramas condicionales; generacion de hasta 192 propuestas con marcos multi-objetivo nativos; evaluacion de propiedades, estructuras, verificadores externos y requisitos de sintesis/CMC; aplicacion de una regla fija de diagnostico a rediseno para un maximo de 192 propuestas adicionales; y compromiso de secuencias quimicamente definidas con informes completos por contexto y registros de origen.

El kernel de CPU implementa apilado consciente del linaje, recompensa robusta, calendario de rediseno y comprobaciones de release. El plan se congela antes de la ejecucion y cada cambio molecular recibe una identidad nueva y puntuaciones nuevas. El paquete incluye 34 pruebas locales que cubren ejecucion, agregacion, release, utilidades cientificas y ajustes de peticion de proveedor a maximo esfuerzo; los valores sinteticos solo aparecen en fixtures unitarios etiquetados de forma explicita. No se documenta ningun entrenamiento propio, ni volumen de tokens, ni composicion de dataset, ni fases de RLHF o DPO: el artefacto es un controlador de orquestacion, no un modelo entrenado. El motor original `peppa run` sigue disponible para desarrollo de lineas base y adaptadores de herramientas, mientras que la formulacion principal de plan congelado usa `peppa.compiled`.

## Capacidades

- Orquestacion de generacion de peptidos con multiples objetivos simultaneos (dianas, contradianas, quimica, endpoints y presupuestos).
- Ejecucion determinista de grafos de dependencias en CPU, reproducible exactamente desde su cache.
- Agregacion de predicciones de modelos compatibles por endpoint y validacion de salidas.
- Comprobaciones de release previas al compromiso de secuencias: estructuras AF3/docking/EvoBind, predicciones externas de pepADMET, identidad quimica, sintetizabilidad y CMC.
- Compilacion de planes generados por un modelo de lenguaje mediante el esquema `schemas/PlanProposal.json`.
- Contratos de score y APIs de workers cientificos que exigen declarar quimica de entrada, endpoint nativo, unidades, contexto de diana, checkpoint, preprocesado y linaje de entrenamiento.
- Trazabilidad de linaje propuesta a propuesta y anclaje de datos experimentales a un hash de release congelado.
- No se describe generacion de texto conversacional, tool calling generico, razonamiento multi-paso autonomo, vision ni audio por parte del propio paquete; esas funciones recaen en el backend de lenguaje y en los workers externos.
- No se declaran capacidades multilingues: el unico idioma listado es el ingles.

## Casos de uso

- Diseno de peptidos terapeuticos multi-objetivo: el plan congelado permite fijar dianas, contradianas, quimica y presupuestos antes de lanzar hasta 192 propuestas, con 192 redisenos adicionales como maximo si el diagnostico lo justifica.
- Priorizacion de candidatos con verificacion previa al compromiso: las comprobaciones de AF3/docking/EvoBind, pepADMET, identidad quimica y CMC evitan que una secuencia se libere sin evidencia suficiente, como demuestra el release vacio del ejemplo.
- Trazabilidad y reproducibilidad en investigacion: cada propuesta mantiene su linaje y el release se ancla a un hash, de modo que los datos experimentales posteriores se guardan en un dataset de evaluacion separado y vinculado a esa release.
- Arnes de evaluacion de modelos generativos de peptidos: el `docs/SOPHIE_RUNBOOK.md` define las fases E0-E5, asignaciones de estudio, controles y artefactos, lo que permite comparar frameworks de generacion bajo el mismo contrato de scores.
- Integracion como agente en un espacio de Hugging Face: `docs/SPACE_DESIGN.md` describe un agente respaldado por Muse dentro del espacio PeptiVerse, con la misma interfaz de plan.
- Auditoria de pipelines cientificos: la exigencia de que todo worker reporte quimica de entrada, unidades, checkpoint y linaje de entrenamiento sirve para auditar la procedencia de cada prediccion en un flujo de descubrimiento.
- Preflight de integraciones externas: el registro de workers y la comprobacion con entradas conocidas permiten validar moPPIt, PeptiVerse, AlloGen, SOAPIA y pepADMET antes de incorporarlos a un estudio.
- Reutilizacion de adaptadores de proveedor: los adaptadores para Muse Glimmer-30B, GPT-6 Astra Max y Claude Opus Max comparten el esquema `PlanProposal`, de modo que un mismo estudio puede conmutar de backend cambiando credenciales y revision de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico resultado reportado es la traza del ejemplo sobre ocho registros fijados de SNOOPPI, que finaliza con un release de peptidos vacio porque faltan predicciones de propiedades y verificacion quimica. La model card indica ademas que no se ejecuta ningun modelo en GPU ni se inventan puntuaciones en ese ejemplo.

## Requisitos de hardware

- Kernel de referencia: CPU estandar. El ejemplo compilado y las 34 pruebas locales no requieren GPU ni ejecutan modelos de GPU.
- VRAM estimada para inferencia: no disponible. El repositorio no incluye pesos y no se publican requisitos de memoria.
- GPU recomendadas: no disponible para el paquete. El backend por defecto es Muse Glimmer-30B, cuyo despliegue exigiria aceleradores, pero la informacion proporcionada no especifica modelos de GPU concretos.
- Viabilidad en GPU de consumo: no disponible. Dependeria del backend de lenguaje elegido, no del orquestador.
- Opciones de despliegue: instalacion como paquete Python (`python -m pip install -e .`), ejecucion de `scripts/run_compiled_example.py` y bateria de pruebas con `python -m unittest discover -s tests -v`. La integracion en el espacio de Hugging Face PeptiVerse esta planificada, no completada. Los workers cientificos nativos y los experimentos de benchmark completos requieren las integraciones listadas en `docs/IMPLEMENTATION_STATUS.md`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos publicos suficientes para comparar con alternativas equivalentes. Los unicos sistemas relacionados que aparecen en la informacion son componentes internos del propio flujo, no alternativas comparables.

| Sistema | Relacion con PepPA | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PepDFM / MOG-DFM | Marco de generacion multi-objetivo usado por el bucle interno | No disponible | No disponible | No disponible | Requiere registro de worker |
| PepMDLM / PepTune | Modelo de peptidos y ajuste usados por el bucle interno | No disponible | No disponible | No disponible | Requiere registro de worker |
| Muse Glimmer-30B | Backend de lenguaje abierto por defecto para compilar planes | No disponible | No disponible | No disponible | Identidad fijada en `configs/model_registry.json` |
| GPT-6 Astra Max / Claude Opus Max | Backends cerrados alternativos que usan el mismo esquema `PlanProposal` | No disponible | No disponible | No disponible | Adaptadores incluidos, sin evaluacion en vivo |

## Limitaciones y advertencias

- El repositorio no contiene pesos ni puntuaciones; el resultado del ejemplo es un release vacio, por lo que no es utilizable como modelo generativo por si mismo.
- Varias integraciones cientificas nativas no estan implementadas y la propia model card las situa como una etapa explicita pendiente, condicionada a registro de worker y preflight con entradas conocidas.
- La licencia no esta declarada en la informacion disponible y `NOTICE.md` reserva los derechos de codigo, pesos, logos y fuentes externos, lo que impide asumir permiso de uso comercial.
- Solo se declara soporte de ingles, sin cobertura multilingue.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de los metadatos consultados, y un historico de publicacion muy reciente (creado y actualizado el 20 de septiembre de 2026 segun dichos metadatos).
- Riesgo de dependencia de terceros: los nombres de backend citados por el autor (Muse Glimmer-30B, GPT-6 Astra Max, Claude Opus Max) no se acompanan de revisiones de servicio verificables ni de resultados de evaluacion en vivo dentro del archivo.
- El propio paquete advierte que los datos experimentales deben residir en un dataset de evaluacion separado vinculado al hash de release congelado; mezclarlos con el release computacional rompe la trazabilidad declarada.
- Los limites de generacion (hasta 192 propuestas y hasta 192 redisenos) y la regla fija de diagnostico a rediseno restringen la exploracion y pueden dejar candidatos validos fuera del espacio de busqueda.
- Al tratarse de una implementacion de referencia para un manuscrito, no hay garantias de estabilidad de API ni de mantenimiento continuado.

## Enlaces

- Hugging Face: https://huggingface.co/ChatterjeeLab/PepPA
- Espacio PeptiVerse en Hugging Face (integracion planificada): URL no disponible en la informacion proporcionada; el diseno se describe en `docs/SPACE_DESIGN.md`
- Manuscrito compilado: `docs/PepPA.pdf`
- Bibliografia: `docs/references.bib`
- Runbook de experimentos E0-E5: `docs/SOPHIE_RUNBOOK.md`
- Estado de implementacion: `docs/IMPLEMENTATION_STATUS.md`
- Integracion de workers cientificos: `docs/WORKER_INTEGRATION.md`
- Plan de estudio: `configs/study_plan.json`
- Registro de modelos y revisiones fijadas: `configs/model_registry.json`
- Esquema de plan generado por modelo de lenguaje: `schemas/PlanProposal.json`
- Aviso legal de derechos: `NOTICE.md`
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo: los enlaces recuperados corresponden a un establecimiento hotelero sin relacion con PepPA.
