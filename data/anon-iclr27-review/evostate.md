# anon-iclr27-review/evostate

## Resumen

EvoState es un modelo de prediccion espaciotemporal para campos fisicos desarrollado por el autor anonimo `anon-iclr27-review`, presumiblemente en el contexto de una revision para ICLR 2027. El modelo codifica fotogramas fisicos en tres estados latentes jerarquicos (Fine, Middle y Coarse), evoluciona sus historias de forma conjunta y decodifica los campos futuros unicamente desde el estado Fine. Los pesos publicados acompanan a una release de codigo anonima y a un catalogo de experimentos denominado R1.

El repositorio contiene exclusivamente diccionarios de tensores (sin optimizador, rutas de ejecucion ni metadatos de entrenamiento), organizados por familias de experimentos sobre dos datasets oficiales de The Well: shear-flow v2 y turbulent radiative layer 2D (TRL2D). Se trata de un modelo de investigacion orientado a simulacion fisica y forecasting de campos, no a generacion de lenguaje, por lo que sus capacidades difieren sustancialmente de las de un LLM convencional.

La relevancia actual radica en su enfoque de estados latentes multi-escala para dinamica fisica, un area activa en el aprendizaje cientifico automatico. La informacion publica es muy limitada: no se especifican parametros totales, contexto, benchmarks numericos ni detalles de arquitectura mas alla de la descripcion del pipeline de estados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (codificador de fotogramas a estados latentes Fine/Middle/Coarse con evolucion conjunta de historias y decodificacion desde Fine) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (opera con 4 fotogramas observados en EvoState) |
| Tipos de cuantizacion | no disponible (pesos en formato tensor state dict de PyTorch) |
| Idiomas soportados | en (segun tags del repositorio) |
| Licencia | MIT |
| Formato de pesos | tensor state dict de PyTorch (cargables con `evostate.models.system.load_tensor_state`) |

## Arquitectura y entrenamiento

La arquitectura se describe como un sistema que codifica fotogramas fisicos en tres niveles de representacion latente (Fine, Middle y Coarse), evoluciona conjuntamente las historias de dichos estados y lee los campos futuros desde el nivel Fine. No se proporcionan detalles sobre el tipo de bloque neuronal (transformer, SSM, convolucional, etc.), el numero de capas, la dimension de los latentes ni la composicion exacta del dataset de entrenamiento mas alla de los dos datasets oficiales de The Well empleados.

Respecto a los datos, se utilizan shear-flow v2 (periodico en ambos ejes espaciales almacenados) y turbulent radiative layer 2D (periodico en x y abierto en y). EvoState emplea cuatro fotogramas observados como entrada. El repositorio incluye variantes con distintas configuraciones de supervision (C+, C0, R0, N0), condiciones de holdout (`tcool-0.32` y `tcool-3.16`) y comparaciones con el modelo Walrus (SF e220, TRL main, tcool0.32). No se especifica si hubo RLHF, DPO ni el numero de tokens o muestras de entrenamiento.

## Capacidades

- Prediccion espaciotemporal de campos fisicos 2D sobre los datasets shear-flow v2 y turbulent radiative layer 2D.
- Codificacion multi-escala en estados latentes Fine, Middle y Coarse con evolucion conjunta de sus historias.
- Decodificacion de campos futuros desde el estado Fine.
- Evaluacion de forecasts largos y de robustez frente a corrupciones, segun se describe en `R1.md`.
- Comparacion controlada con el modelo Walrus bajo configuraciones equivalentes de frames (cuatro en evaluacion para EvoState y Walrus TRL; seis en entrenamiento para Walrus SF).
- Soporte de condiciones de holdout para estudiar generalizacion fuera de la distribucion de entrenamiento.
- No se documentan capacidades de generacion de texto, codigo, vision general, tool calling, agentes ni multilingue mas alla del ingles en los tags.

## Casos de uso

- Simulacion de flujos de cizalladura: el modelo puede predecir la evolucion de campos de shear-flow v2 a partir de cuatro fotogramas observados, util para estudiar dinamicas periodicas en dominios academicos de mecanica de fluidos.
- Prediccion de capas radiativas turbulentas 2D: aplicable a la modelizacion de transporte radiativo en dominios con frontera periodica en x y abierta en y, como en estudios de astrofisica o climatizacion simplificada.
- Benchmarking de modelos de aprendizaje cientifico: sirve como referencia reproducible frente a Walrus en tareas de forecasting fisico con configuraciones de frames y normalizacion controladas.
- Investigacion en representaciones latentes jerarquicas: permite analizar como afecta la separacion Fine/Middle/Coarse a la calidad del forecast y a la estabilidad a largo plazo.
- Estudio de generalizacion fuera de distribucion: las variantes de holdout (`tcool-0.32`, `tcool-3.16`) permiten evaluar el comportamiento del modelo cuando se excluye una condicion fisica del entrenamiento.
- Reproducibilidad de experimentos R1: el `MANIFEST.json` con SHA256 y tamanos exactos facilita la verificacion de pesos en pipelines de evaluacion cientifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,6 GB, lo que sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se confirma el pico de memoria en ejecucion.
- GPU recomendadas: no disponible. Por el tamano del repositorio, es plausible su ejecucion en GPUs consumer (por ejemplo, RTX 3060 o superiores), si bien no se documenta.
- Cabe en consumer GPU: probablemente si, dado el tamano de 0,6 GB, aunque no se especifica.
- Opciones de despliegue: carga mediante `evostate.models.system.load_tensor_state` con el modulo A/B/C correspondiente; scripts `scripts/evaluate_r1.py` y `scripts/evaluate_walrus.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frames | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvoState | no disponible | 4 frames observados | Forecasting fisico 2D (shear-flow, TRL2D) | MIT | Pesos en HF (repo 0,6 GB) |
| Walrus SF e220 | no disponible | 6 frames entrenamiento / 4 evaluacion | Forecasting fisico (shear-flow) | no disponible en la informacion | Configuracion referenciada en el repo |
| Walrus TRL main | no disponible | 4 frames | Forecasting fisico (TRL2D) | no disponible en la informacion | Configuracion referenciada en el repo |

No se dispone de datos de rendimiento numerico para establecer una comparacion cuantitativa entre EvoState y Walrus.

## Limitaciones y advertencias

- Informacion publica muy limitada: no se detallan parametros, arquitectura interna, datos de entrenamiento ni resultados de benchmarks.
- Modelo de investigacion anonimo: los pesos acompanan a una revision de ICLR 2027, por lo que su API, configuraciones y resultados pueden cambiar.
- Alcance restringido a dos datasets fisicos 2D (shear-flow v2 y TRL2D); no se documenta generalizacion a otros dominios.
- Requiere el entorno de codigo companero y configuraciones especificas (`configs/shear_flow_v2.json`, `configs/r1/tau4-*.json`); no es un modelo plug-and-play.
- La variante R+ esta pendiente de recuperacion de su checkpoint congelado, y Walrus tcool3.16 esta anunciada para antes del 18 de noviembre, lo que indica que el catalogo no esta completo.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si existe riesgo de forecasts fisicamente inconsistentes fuera de la distribucion de entrenamiento; no cuantificado.
- Licencia MIT permite uso comercial, pero la ausencia de documentacion sobre sesgos, robustez y validacion en produccion desaconseja su uso fuera de contextos de investigacion sin evaluacion adicional.
- Idioma documentado: solo ingles en los tags; no se especifica soporte multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/anon-iclr27-review/evostate
- Repositorio de codigo companero: no disponible (referenciado como "companion code release" sin URL en la informacion)
- `R1.md` (comandos de entrenamiento/evaluacion y comparaciones): no disponible como enlace directo
- Paper: no disponible (revision anonima para ICLR 2027)
- The Well (datasets shear-flow v2 y TRL2D): no disponible como enlace en la informacion
