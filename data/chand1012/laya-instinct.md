# chand1012/laya-instinct

## Resumen

Laya Instinct es un modelo de decision afinado a partir de `convaiinnovations/laya`, publicado por el usuario chand1012. No es un modelo generativo de lenguaje, sino un modelo de clasificacion orientado a resolver tres tipos de decision: eleccion entre opciones (choice), puntuacion (score) y preguntas de si/no (`noul`). Se distribuye como checkpoint completo, no como adaptador, y sus pesos se publican bajo licencia Apache-2.0, la misma que declara el modelo base.

El modelo cuenta con 421.293.830 parametros y un repositorio de 0,8 GB, lo que lo situa en la gama de los modelos pequenos. Se entreno durante cuatro epocas sobre una mezcla de 500.000 registros (504.800 preguntas de decision en total) procedente de cuatro datasets publicos, y utiliza temperaturas de calibracion especificas por tipo de decision (4,1300 para choice, 2,5513 para score y 3,4845 para `noul`).

Su relevancia actual reside en el nicho de las decisiones calibradas dentro de agentes: en la validacion interna de 6.000 registros alcanza un 71,25% de exactitud y un Brier score de 0,3442, muy por encima de los checkpoints comparadores (Laya simple: 43,48%; Laya typed-decisions: 43,78%). Es un resultado en dominio, no un benchmark independiente, y el propio autor advierte de debilidad en clasificacion de alta cardinalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision sobre el framework Laya; no es un transformer generativo estandar) |
| Parametros totales | 421.293.830 |
| Longitud de contexto | no disponible (se mencionan longitudes maximas de secuencia/cabeza de 1024/256 en entrenamiento, no una ventana de contexto publicada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos; no relicencia los datos de entrenamiento) |
| Formato de pesos | safetensors (incluye `model.safetensors`, `rl_agent_config.json`, configuracion de encoder y ficheros de tokenizer) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya` y se entrena como un modelo de decision tipado que produce tres clases de respuesta: choice, score y `noul` (si/no). No se detalla en la informacion disponible la arquitectura interna del base (tipo de encoder, mecanismos de atencion o diseno de cabezas), mas alla de que el entrenamiento uso longitudes maximas de secuencia y cabeza de 1024 y 256 respectivamente, y de que el checkpoint final incorpora temperaturas de calibracion por tipo de decision.

El entrenamiento se realizo durante cuatro epocas en una unica RTX 3090 Ti, con tamano de lote efectivo 64 y semilla de entrenamiento 20260922 (semilla de construccion del dataset: 20260926). La mezcla de 500.000 registros proviene de: `tasksource/tasksource-jev-typed-decisions` (221.689 registros), `SargeDev/jev-distill-corpus-v3` (193.978, excluyendo placeholders `yuri_v1` exactos), `Praveenrajus/jev-bench` (55.422), `LocalLLaMA/typed-decisions` (1.200) y una aumentacion de robustez derivada de Tasksource con perturbaciones de orden de opciones (27.711). Se empleo ademas un split de calibracion separado de 6.000 registros para ajustar las temperaturas por tipo de decision, y se excluyo de optimizacion y calibracion el split de validacion. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Resolucion de decisiones de tipo choice: seleccionar entre un conjunto de opciones.
- Decisiones de tipo score: asignar una puntuacion a una opcion propuesta.
- Decisiones de tipo `noul` (si/no): responder a preguntas binarias.
- Calibracion por tipo de decision mediante temperaturas especificas (4,1300 / 2,5513 / 3,4845), orientada a producir probabilidades mejor calibradas.
- Integracion en el framework de agentes Laya mediante `laya.Agent("chand1012/laya-instinct", device="cuda")`.
- Robustez a perturbaciones de orden de opciones (se incluyo aumentacion de este tipo en el entrenamiento).
- Capacidades multilinguisticas: no disponible.
- Tool calling / function calling: no disponible.
- Vision, audio, modo thinking: no disponible (no es un modelo generativo multimodal).

## Casos de uso

- Toma de decisiones dentro de agentes Laya: el modelo se carga con `laya.Agent` para que el agente resuelva elecciones discretas (choice) en flujos de trabajo, apoyandose en las temperaturas de calibracion ya ajustadas.
- Enrutamiento de acciones en pipelines automatizados: dado un conjunto de acciones candidatas, el modelo puntua cada una y permite seleccionar la mejor segun un umbral, aprovechando la cabeza de score.
- Filtrado binario previo a una accion: las decisiones `noul` permiten responder si/no (por ejemplo, si procede ejecutar una accion) antes de invocar un componente mas costoso.
- Verificacion de decisiones con umbral de confianza: gracias a las probabilidades calibradas (Brier 0,3442), se pueden descartar decisiones de baja confianza y delegarlas a revision humana o a otro modelo.
- Investigacion sobre calibracion de decisiones: el modelo sirve como punto de partida para estudiar Brier score y log loss en tareas de decision tipada, con temperaturas por tipo documentadas y reproducibles.
- Construccion de datasets de decision sinteticos o aumentados: el checkpoint puede usarse para anotar o etiquetar decisiones en corpus propios dentro de los tres tipos soportados.
- Modulo de decision en sistemas de evaluacion continua: integrado en un harness que compare politicas de decision, dado que el repositorio incluye identificadores de reproducibilidad (hashes SHA-256 y semillas).

## Benchmarks y rendimiento

La unica evaluacion publicada es una validacion interna (in-domain) de 6.000 registros retenidos, con presupuesto de inferencia comun de 1024/256:

| Modelo | Accuracy | Brier score | Log loss |
|---|---:|---:|---:|
| Plain Laya | 43,48% | 0,5714 | 1,7356 |
| Laya typed-decisions | 43,78% | 0,5010 | 1,3870 |
| Laya Instinct | 71,25% | 0,3442 | 1,0567 |

Advertencias del autor relevantes para interpretar la tabla: los dos checkpoints comparadores emitieron un aviso de bucket de temperatura, por lo que sus valores de error de calibracion no son directamente comparables; la exactitud y las metricas se reportan bajo el mismo presupuesto de inferencia. Ademas, la clasificacion de alta cardinalidad es debil: Banking77 un 5% y CLINC150 un 1%. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks generativos en la informacion disponible (el modelo no es generativo).

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 421 millones de parametros, los pesos en precision de 16 bits ocupan en torno a 0,84 GB, y alrededor de 1,7 GB en fp32; el repositorio publicado ocupa 0,8 GB, lo que es coherente con pesos de 16 bits. La VRAM total dependera del lote y de las activaciones (no disponible de forma exacta).
- GPU recomendadas: el autor lo entreno en una RTX 3090 Ti; por tamano, cualquier GPU con al menos unos pocos GB de VRAM es suficiente. Series A100/H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si. Es compatible con GPU de gama media y presumiblemente tambien con ejecucion en CPU, dado el bajo numero de parametros.
- Opciones de despliegue: la via documentada es el paquete Laya (`laya.Agent(..., device="cuda")`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y no se publican pesos en GGUF (no es un modelo generativo estandar).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los unicos comparadores con datos publicados en la informacion disponible son los checkpoints evaluados junto a Laya Instinct bajo el mismo presupuesto:

| Modelo | Parametros | Accuracy (val. 6.000) | Brier | Log loss | Licencia |
|---|---:|---:|---:|---:|---|
| Laya Instinct | 421.293.830 | 71,25% | 0,3442 | 1,0567 | apache-2.0 |
| Laya typed-decisions | no disponible | 43,78% | 0,5010 | 1,3870 | no disponible |
| Plain Laya | no disponible | 43,48% | 0,5714 | 1,7356 | no disponible |

No se dispone de datos de parametros, contexto ni licencia de los dos comparadores, ni de otros modelos alternativos de decision en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo de lenguaje: no debe usarse para generacion de texto, codigo o matematicas.
- Clasificacion de alta cardinalidad muy debil: Banking77 (5%) y CLINC150 (1%), lo que descarta su uso en taxonomias de muchas clases.
- El resultado de 71,25% de exactitud es una validacion en dominio, no un benchmark independiente; la generalizacion fuera de las familias de datos de origen no esta demostrada.
- Los comparadores emitieron un aviso de bucket de temperatura, por lo que las cifras de calibracion no son directamente equiparables entre modelos.
- La licencia Apache-2.0 cubre unicamente los pesos liberados, no los datos de entrenamiento; `tasksource` tiene licencias por fuente (comerciales, no comerciales o sin especificar) y `jev-bench` agrega datasets con licencias propias (por ejemplo, filas ARC con CC-BY-SA-4.0). Conviene revisar los terminos de cada dataset antes de reutilizar el modelo o reconstruir la mezcla.
- Idiomas soportados no disponibles: se desconoce su comportamiento multilingue.
- No se documentan capacidades de tool calling, agentes multi-paso ni modos especiales (thinking, vision, audio).
- Riesgo de alucinacion y sesgos: no cuantificado en la informacion disponible; al tratarse de un clasificador, el riesgo se manifiesta como decisiones mal calibradas en dominios fuera de distribucion.
- Ausencia de comunidad: 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion/actualizacion muy proximas (2026-09-27), lo que limita las senales externas de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chand1012/laya-instinct
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Paquete Laya (GitHub): https://github.com/NandhaKishorM/laya
- Dataset tasksource/tasksource-jev-typed-decisions: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Dataset SargeDev/jev-distill-corpus-v3: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Dataset Praveenrajus/jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
