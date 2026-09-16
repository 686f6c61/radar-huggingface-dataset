# authentrics/ztom-gemma3-1b-recovery

## Resumen

`authentrics/ztom-gemma3-1b-recovery` es un checkpoint de demostracion publicado por Authentrics sobre `google/gemma-3-1b-it`, el modelo instructivo de 1.000 millones de parametros de la familia Gemma 3 de Google. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de aplicar ZTOM (la herramienta de optimizacion sin gradientes de Authentrics) para recuperar una capacidad que se habia degradado tras un ajuste fino secuencial. El problema que aborda es el olvido catastrofico: cuando se reentrena un modelo de forma secuencial sobre una tarea nueva, la interferencia entre tareas degrada la precision en la tarea original.

La relevancia del artefacto es metodologica mas que de rendimiento: documenta un flujo de trabajo reproducible de reparacion de checkpoints sin retropropagacion y sin reentrenamiento completo, ejecutado en local con el SDK de Authentrics (rueda de Python sobre un nucleo en C++, v0.35.1, Linux x86_64, Python 3.11-3.13). Segun la propia model card, unicamente se intercambian metadatos del proyecto con los servidores de Authentrics; los pesos nunca salen de la maquina del usuario.

Es importante subrayar que el repositorio no redistribuye los pesos recuperados. La model card indica explicitamente que se documenta un resultado reproducible sobre `google/gemma-3-1b-it` y que el checkpoint debe regenerarse en local con el SDK. Por tanto, este repositorio funciona como ficha tecnica de un experimento, no como artefacto listo para descarga e inferencia directa en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base `google/gemma-3-1b-it`. Detalle interno (atencion, normalizacion, tipo de capas) no disponible en la informacion proporcionada |
| Parametros totales | Aproximadamente 1.000 millones (deducido de la denominacion `gemma3-1b` y del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este repositorio; el modelo base `google/gemma-3-1b-it` declara 32.768 tokens en su documentacion publica |
| Tipos de cuantizacion | No disponible. El repositorio usa `transformers` y no publica artefactos GGUF, AWQ, GPTQ ni similar |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | `gemma` (terminos de uso de Gemma de Google, heredados del modelo base) |
| Formato de pesos | No disponible. Los pesos recuperados no se redistribuyen en este repositorio |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `google/gemma-3-1b-it`: un transformer decoder-only de la familia Gemma 3 en su variante instructiva de aproximadamente 1.000 millones de parametros. Este repositorio no introduce cambios arquitectonicos; el objeto del experimento es el estado de los pesos tras un proceso de reparacion, no la topologia de la red. No se proporcionan datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni estrategia de posicionamiento en la informacion disponible.

En cuanto al proceso, la model card describe la siguiente secuencia: un ajuste fino secuencial provoco interferencia entre tareas y una caida de precision (`catastrophic forgetting`); a continuacion, la herramienta `ztom_analysis` de Authentrics optimizo el checkpoint contra una funcion de perdida definida por el usuario con firma `Callable[[output], float]`, sin retropropagacion y sin reentrenamiento desde cero. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se publican hiperparametros del proceso de optimizacion sin gradientes (iteraciones, criterio de parada, magnitud de la recuperacion medida).

El aspecto diferencial es de infraestructura: el analisis se ejecuta en local sobre hardware del usuario y solo se comparten metadatos del proyecto (nombres y descripciones), nunca los pesos. El codigo de reproduccion se encuentra en el repositorio `Authentrics-ai/authentrics-model-analysis-experiments`, en el fichero `src/analysis/full_finetuning_ztom.py`.

## Capacidades

- Generacion de texto: el repositorio declara `pipeline_tag: text-generation` y esta pensado para inferencia con `transformers`.
- Seguimiento de instrucciones: capacidades heredadas del modelo base instructivo `google/gemma-3-1b-it`.
- Reparacion de capacidades degradadas: el caso demostrado es la recuperacion de la tarea original perdida tras un ajuste fino secuencial, mediante optimizacion sin gradientes.
- Analisis de checkpoints: deteccion de deriva de parametros y de comportamiento entre versiones de un modelo.
- Eliminacion de datos con cumplimiento normativo sin reentrenamiento completo, segun la descripcion del SDK de Authentrics.
- Optimizacion dirigida por perdida: la API `ztom_analysis` acepta una funcion de perdida arbitraria en Python y optimiza el modelo contra ella.
- Soporte de tool calling o function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no documentado. La variante de 1B de Gemma 3 es la unica de la familia sin capacidad de vision segun la documentacion publica de Google, pero este dato no se confirma en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de olvido catastrofico: un equipo de investigacion puede clonar el repositorio de ejemplos y ejecutar `full_finetuning_ztom.py` para replicar la degradacion y su recuperacion sobre un modelo de 1B, con coste de computo bajo.
- Auditoria de checkpoints en un pipeline de MLOps: antes de promover un modelo ajustado a produccion, se analiza la deriva de parametros y de comportamiento respecto a la version anterior para detectar regresiones silenciosas.
- Recuperacion de un modelo ajustado que ha perdido su tarea original: en lugar de repetir el ajuste fino completo, se aplica `ztom_analysis` contra una perdida que mida la tarea perdida y se evalua si la capacidad se restaura.
- Eliminacion de datos por cumplimiento normativo (RGPD o peticiones de borrado): el SDK plantea la retirada de informacion concreta del checkpoint sin reentrenar desde cero, un escenario tipico en entornos regulados.
- Alineacion de comportamiento en dominios sensibles: el uso de una funcion de perdida personalizada permite penalizar salidas no deseadas sin backpropagation, util en equipos que no disponen de acceso al pipeline de entrenamiento original.
- Inferencia local en hardware modesto como banco de pruebas: al tratarse de un modelo de 1B, sirve para validar flujos de despliegue con `transformers`, `llama.cpp` o `vLLM` en una sola GPU de gama media o incluso en CPU.
- Evaluacion de proveedores de herramientas de analisis de modelos: el repositorio permite comprobar de primera mano el flujo de trabajo del SDK y su politica de ejecucion local.
- Material docente: ilustra con un caso concreto y reproducible los conceptos de interferencia entre tareas y olvido catastrofico en cursos de aprendizaje profundo.
- Integracion en CI: con la variable de entorno `AUTHRX_API_KEY` el SDK funciona de forma no interactiva, lo que permite lanzar analisis de checkpoints como un paso automatizado de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe cualitativamente que hubo una degradacion de precision tras el ajuste fino secuencial y que ZTOM restauro la capacidad perdida, pero no aporta cifras de exactitud, ni metricas de la tarea original, ni comparaciones cuantitativas antes y despues de la recuperacion. Tampoco se incluyen resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano de 1.000 millones de parametros, no verificada con este checkpoint concreto): en precision completa (FP32) en torno a 4-5 GB; en FP16/BF16 en torno a 2-3 GB; en INT8 en torno a 1-1,5 GB; en 4 bits en torno a 0,7-1 GB. Hay que anadir el consumo del contexto segun la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; NVIDIA RTX 3060, RTX 4060, RTX 4090, A100, H100 o equivalentes funcionan sin problema. El modelo esta claramente en el rango de consumo.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o incluso una GPU integrada con memoria compartida suficiente puede ejecutarlo, especialmente en cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers` (declarado en la libreria del repositorio) es la via directa. Para servir en produccion son plausibles vLLM y TGI. Para CPU o entornos embebidos, `llama.cpp` y Ollama son viables, pero requieren convertir los pesos a GGUF, algo que este repositorio no proporciona.
- Requisitos del SDK de analisis: Linux x86_64 con Python 3.11 a 3.13 para instalar `authentrics`; se necesita una clave de API de Authentrics, configurable con `authrx init` o mediante la variable `AUTHRX_API_KEY`.
- Latencia y throughput estimados: no disponibles.
- Nota operativa: dado que los pesos recuperados no se redistribuyen, cualquier despliegue exige primero reproducir el experimento con el SDK.

## Comparativa con modelos similares

La comparacion se establece con el modelo base y con otras alternativas de la misma franja de tamano. Los datos de contexto y licencia proceden de la documentacion publica de cada modelo; no estan verificados con la informacion proporcionada en esta busqueda y se marcan como referencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Naturaleza |
|---|---|---|---|---|---|
| `authentrics/ztom-gemma3-1b-recovery` | Aprox. 1.000 millones | No disponible | `gemma` | No redistribuidos; requiere reproduccion local | Checkpoint reparado, ficha de experimento |
| `google/gemma-3-1b-it` | Aprox. 1.000 millones | 32.768 tokens (documentacion publica) | `gemma` | Pesos publicos en HuggingFace | Modelo instructivo base |
| `google/gemma-2-2b-it` | Aprox. 2.600 millones | 8.192 tokens (documentacion publica) | `gemma` | Pesos publicos en HuggingFace | Generacion anterior, mayor tamano |
| `meta-llama/Llama-3.2-1B-Instruct` | Aprox. 1.200 millones | 128.000 tokens (documentacion publica) | Llama 3.2 Community License | Pesos publicos en HuggingFace | Alternativa de tamano equivalente |
| `Qwen/Qwen2.5-1.5B-Instruct` | Aprox. 1.500 millones | 32.768 tokens (documentacion publica) | Apache 2.0 | Pesos publicos en HuggingFace | Alternativa de tamano equivalente con licencia permisiva |

Comparacion de rendimiento: no disponible. No hay resultados de benchmarks publicados para `authentrics/ztom-gemma3-1b-recovery` que permitan situarlo frente a estas alternativas en tareas estandar. Cualquier afirmacion sobre calidad relativa de generacion seria especulativa: el valor del artefacto reside en el procedimiento de recuperacion, no en una mejora medible de capacidad respecto al modelo base.

## Limitaciones y advertencias

- Los pesos recuperados no se redistribuyen. Este repositorio es una ficha tecnica de un experimento; no permite descargar el modelo y usarlo directamente.
- El repositorio registra 0 descargas y 0 likes, y fue creado el 16 de septiembre de 2026 segun los metadatos de HuggingFace. Es un artefacto reciente y sin validacion independiente por parte de la comunidad.
- No hay resultados de benchmarks ni metricas cuantitativas de la recuperacion. No es posible verificar si la capacidad restaurada alcanza el nivel previo al ajuste fino secuencial.
- La model card no detalla el dataset, los hiperparametros ni el proceso de ajuste fino que causo el olvido catastrofico. La reproducibilidad depende del codigo publicado en el repositorio de ejemplos, no de la ficha.
- Sesgos conocidos: no disponibles. Al derivar de `google/gemma-3-1b-it`, el checkpoint hereda los sesgos de su modelo base y de los datos de entrenamiento de este, que no se documentan aqui.
- Riesgo de alucinacion: inherente a un modelo de lenguaje de 1.000 millones de parametros. No hay evaluacion de fidelidad factual en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles para este repositorio. El contexto efectivo dependera del modelo base y de la configuracion de inferencia.
- Restricciones de licencia: la licencia es `gemma`, sujeta a los terminos de uso de Gemma de Google. Antes de cualquier uso comercial hay que revisar esos terminos, que imponen obligaciones de uso aceptable y de distribucion. El SDK de Authentrics se distribuye bajo sus propias condiciones y requiere una clave de API.
- Dependencia de terceros: el flujo de recuperacion requiere la libreria `authentrics` (version documentada 0.35.1), Linux x86_64 y Python 3.11-3.13. No hay soporte declarado para otras plataformas ni para versiones anteriores de Python.
- Telemetria: la model card afirma que solo se transmiten metadatos del proyecto a los servidores de Authentrics y que los pesos permanecen en local. Es una afirmacion del proveedor y no se aporta auditoria independiente en la informacion disponible.
- Riesgo de evaluacion: para desplegar en produccion habria que reproducir la recuperacion, validar el modelo resultante con datos propios y comprobar que el proceso no ha degradado otras capacidades heredadas del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/authentrics/ztom-gemma3-1b-recovery
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Aplicacion y claves de API de Authentrics: https://app.authentrics.ai/
- Documentacion y referencia de la API: https://app.authentrics.ai/docs
- Repositorio de experimentos (incluye `src/analysis/full_finetuning_ztom.py`): https://github.com/Authentrics-ai/authentrics-model-analysis-experiments
- Repositorio de ejemplos y guia de usuario: https://github.com/Authentrics-ai/authentrics-analysis-examples
- Contacto del proveedor: info@authentrics.ai
