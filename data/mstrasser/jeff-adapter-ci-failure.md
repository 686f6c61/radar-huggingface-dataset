# mstrasser/jeff-adapter-ci-failure

## Resumen

`jeff-adapter-ci-failure` es un adaptador LoRA de tipo PEFT desarrollado por el usuario mstrasser para el modelo base `mstrasser/jeff-base` v1.4, un fine-tune de Qwen3.5-0.8B orientado a toma de decisiones. El adaptador resuelve un problema muy concreto: clasificar automáticamente el motivo de un fallo en una ejecución de integración continua (CI), distinguiendo entre regresiones reales, tests inestables (flaky), problemas de infraestructura, cambios de dependencias, fallos de build o configuración, agotamiento de recursos y tests que necesitan actualizarse.

A diferencia de un modelo generativo, este adaptador no produce texto libre: recibe una situación estructurada (proyecto, ejecución de CI, cambio de código, hechos del CI y log) junto con una pregunta y un conjunto de opciones con nombre, y devuelve una probabilidad calibrada para cada opción en un único forward pass. Esto elimina la necesidad de parsear la salida y facilita su integración en pipelines automatizados de triaje.

El modelo es relevante para equipos de ingeniería que quieren reducir el tiempo de diagnóstico de fallos en CI antes de que un mantenedor intervenga. Su licencia Apache 2.0 y su reducido tamaño (repo de 0,1 GB) lo hacen desplegable en entornos modestos, aunque su alcance está deliberadamente limitado a clasificación y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `mstrasser/jeff-base` v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre la revision `v1.4` de `mstrasser/jeff-base`, un modelo de decisión pequeno derivado de Qwen3.5-0.8B. El motor de ejecucion rechaza adaptadores entrenados sobre otra base, por lo que este adaptador solo carga sobre esa revision concreta. La tarea es de clasificacion de texto con opciones nombradas (`classify, choice`): el modelo recibe contexto estructurado (proyecto, ejecucion de CI, cambio de codigo y hechos del CI) mas el log del fallo como entrada, y devuelve una distribucion de probabilidad calibrada sobre siete etiquetas en un unico forward pass.

El adaptador fue entrenado el 2026-10-25. La model card menciona un conjunto de calibracion a partir del cual se define un umbral de confianza, pero no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Las etiquetas cubren `build_or_config`, `dependency_change`, `environment_or_infra`, `flaky_test`, `real_regression`, `test_needs_update` y `timeout_or_resource`, con reglas de prioridad explicitas para resolver solapamientos.

## Capacidades

- Clasificacion de fallos de CI en siete categorias mutuamente excluyentes con probabilidad calibrada por opcion.
- Salida estructurada sin texto generado, lo que evita el parseo de respuestas.
- Uso de contexto enriquecido: metadatos del proyecto, ejecucion de CI, cambio de codigo, hechos del CI (intentos, historial en main, otras jobs, versiones de dependencias, duraciones) y log del fallo.
- Distincion entre regresion real, test flaky, problema de infraestructura, cambio de dependencia, fallo de build/configuracion, timeout o recurso y test que necesita actualizacion.
- Capacidad de calibracion con umbral de confianza definido a partir de un conjunto de calibracion.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni razonamiento multi-paso mas alla de la clasificacion.

## Casos de uso

- Triaje automatico de fallos en pipelines de CI: el adaptador clasifica cada ejecucion fallida antes de que un mantenedor la revise, permitiendo enrutar los fallos de infraestructura al equipo de plataforma y las regresiones reales al autor del cambio.
- Deteccion de tests flaky: al recibir el historial del mismo test en main y los reintentos del commit, el modelo identifica tests que fallan de forma intermitente y evita que se investiguen como regresiones.
- Priorizacion de incidencias por regresion real: las ejecuciones clasificadas como `real_regression` pueden escalarse automaticamente, mientras que las de `build_or_config` se redirigen a validacion de configuracion.
- Diagnostico de cambios de dependencias: cuando una actualizacion automatica rompe el build, el modelo detecta que la causa es un cambio de version de un paquete y no el codigo del proyecto.
- Gestion de limites de recursos: clasifica fallos por timeout o memoria (exit code 137, OOM) para ajustar limites de runners o dividir jobs.
- Filtrado de ruido en notificaciones: reduce alertas al distinguir fallos de infraestructura (red, DNS, registry caido, runner perdido) de fallos atribuibles al codigo.
- Analisis retrospectivo de salud del CI: procesar en lote el historial de ejecuciones fallidas para medir la proporcion de flaky tests, problemas de infraestructura y regresiones por proyecto.

## Benchmarks y rendimiento

| Test | Filas | Precision |
|---|---:|---:|
| Test interno (generador) | 2.000 | 99,7% |
| Segundo test interno de casos no vistos (generador) | no registrado | 99,9% |

La precision se define como la proporcion de filas cuyo resultado principal fue correcto. El propio autor advierte que los tests de tipo "generator" proceden del mismo generador que los datos de entrenamiento y, por tanto, miden menos que un test publico o real. No se han publicado resultados sobre benchmarks publicos ni sobre documentos reales retenidos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la huella es reducida (el repo del adaptador ocupa 0,1 GB).
- GPU recomendadas: no disponible; por el tamano del modelo base, es probable que quepa en GPUs consumer, pero no se confirma en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado en la documentacion disponible.
- Opciones de despliegue: el adaptador se carga mediante PEFT sobre `mstrasser/jeff-base` v1.4; el ecosistema Jeff incluye servidor y SDKs en github.com/firelex/jeff. No se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de clasificacion de fallos de CI ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Solo clasifica el fallo; no lo corrige ni genera una solucion.
- Solo soporta ingles.
- El adaptador solo carga sobre la revision `v1.4` de `mstrasser/jeff-base`; el motor rechaza cualquier otra base.
- Las metricas publicadas provienen de tests internos generados por el mismo generador que los datos de entrenamiento, lo que puede sobreestimar el rendimiento real.
- No se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo de clasificacion con salida probabilistica, el riesgo principal es una clasificacion incorrecta con alta confianza.
- No se detalla el volumen ni la composicion del dataset de entrenamiento, lo que dificulta evaluar su cobertura.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `mstrasser/jeff-base` y de Qwen3.5-0.8B.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; su madurez y soporte comunitario son limitados.

## Enlaces

- [Hugging Face: mstrasser/jeff-adapter-ci-failure](https://huggingface.co/mstrasser/jeff-adapter-ci-failure)
- [Modelo base: mstrasser/jeff-base](https://huggingface.co/mstrasser/jeff-base)
- [Pagina de catalogo: jeffhub.ai/catalogue/jeff.engineering.ci-failure](https://jeffhub.ai/catalogue/jeff.engineering.ci-failure)
- [Codigo, servidor y SDKs: github.com/firelex/jeff](https://github.com/firelex/jeff)
