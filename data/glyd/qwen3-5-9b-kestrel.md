# glyd/Qwen3.5-9B-kestrel

## Resumen

Qwen3.5-9B-kestrel es una cuantizacion con perdida (lossy) del modelo Qwen/Qwen3.5-9B, publicada por el usuario glyd dentro de su propio catalogo de niveles de compresion. El nivel "kestrel" mantiene aproximadamente 6,54 bits por peso, lo que reduce el peso del modelo de 16,68 GiB en bf16 a 6,82 GiB, es decir, un 59 % menos de espacio en disco y en memoria. No es una cuantizacion sin perdida: el propio autor lo indica explicitamente en la model card.

El interes de esta ficha es doble. Por un lado, documenta un formato de compresion alternativo a GGUF o AWQ, ligado a un motor propietario (Glyd), que exige Linux con GPU NVIDIA, driver 580 o superior y la version 0.29.3 o posterior de la CLI glyd. Por otro, sirve como caso de estudio de un modelo publicado con metadatos incompletos: no se declaran contexto, idiomas, arquitectura detallada ni benchmarks, y el contador de parametros que muestra el Hub (7,29 B) no coincide con el numero real de parametros del modelo (8.953.803.264), porque el Hub cuenta cada byte empaquetado como un parametro.

El modelo base es Qwen3.5-9B (licencia apache-2.0), y esta cuantizacion hereda esa licencia para los pesos. Sin embargo, el motor necesario para ejecutarla es BUSL-1.1: gratuito para uso personal y no comercial en equipos propios, y sujeto a licencia de pago para uso comercial. Este detalle es critico para cualquier evaluacion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la model card; derivada del modelo base Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 parametros segun la model card; el Hub muestra 7.285.080.730 porque cuenta cada byte empaquetado como un parametro |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | kestrel: aproximadamente 6,54 bits por peso (lossy). El tag del repo indica "8-bit" |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 para los pesos; el motor Glyd es BUSL-1.1 (uso comercial requiere licencia) |
| Formato de pesos | safetensors con empaquetado propio de Glyd; no compatible con vLLM ni transformers |
| Modelo base | Qwen/Qwen3.5-9B (commit c202236235762e1c871ad0ccb60c8ee5ba337b9a) |
| Tamano del repositorio | 7,3 GB |
| Tamano en memoria (pesos) | 6,82 GiB (frente a 16,68 GiB en bf16) |
| Motor de inferencia | Glyd (`glyd run`), version 0.29.3 o superior |
| Requisitos de plataforma | Linux con GPU NVIDIA, driver 580 o superior |
| Componentes excluidos | model.visual, mtp.fc, mtp.layers, mtp.norm, mtp.pre_fc_norm_embedding, mtp.pre_fc_norm_hidden |
| Fecha de publicacion | 9 de octubre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se aporta informacion sobre la arquitectura interna del modelo base en la documentacion disponible. El paquete se limita a redistribuir los pesos de Qwen/Qwen3.5-9B recomprimidos a 6,54 bits por peso mediante el esquema propietario de Glyd. La unica informacion estructural indirecta son los nombres de los tensores excluidos de la conversion: la presencia de un modulo `model.visual` en el modelo base indica que este incorpora una torre de vision, y los prefijos `mtp.*` (multi-token prediction) indican que el modelo base incluye cabezas adicionales de prediccion multi-token. Ninguno de esos componentes se incluye en esta cuantizacion.

No hay datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si el modelo base paso por RLHF, DPO u otras fases de alineamiento. Tampoco se documenta el proceso de calibracion de la cuantizacion: no se especifica el conjunto de calibracion, si se aplico escalado por canal o por grupo, ni el error de reconstruccion resultante. La model card se limita a advertir que la conversion "not lossless" (no es sin perdida), sin cuantificar la degradacion.

## Capacidades

- Generacion de texto: heredada del modelo base Qwen3.5-9B, aunque la model card no detalla tareas ni idiomas concretos.
- Vision: no incluida. El tensor model.visual queda fuera de la cuantizacion, por lo que este paquete es exclusivamente de texto.
- Prediccion multi-token: no incluida. Los tensores mtp.* quedan fuera del paquete, de modo que no se puede usar decodificacion especulativa basada en MTP con esta version.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara lista de idiomas.
- Modos especiales (thinking, audio, etc.): no disponibles en la documentacion proporcionada.
- Ejecucion: unicamente mediante el motor Glyd; no hay soporte para vLLM, transformers, llama.cpp, Ollama ni TGI.

## Casos de uso

- Inferencia local en estacion de trabajo con GPU de gama alta: con 6,82 GiB de pesos, el modelo cabe en GPUs NVIDIA de 12 GB o mas, lo que permite ejecutar un modelo de ~9 B de parametros en hardware de escritorio sin depender de servicios en la nube.
- Procesamiento de datos sensibles con requisito de no exfiltracion: al ejecutarse integramente en local mediante `glyd run`, es apto para flujos donde el texto no puede salir de la maquina (documentacion legal, historiales clinicos, codigo propietario), siempre que la licencia BUSL-1.1 encaje con el uso previsto.
- Evaluacion comparativa de niveles de compresion: el mismo autor publica los niveles penguin (sin perdida), kestrel (6,54 bpw) y swift (5,5 bpw) sobre el mismo modelo base, lo que permite medir la degradacion de calidad frente al ahorro de memoria en un mismo entorno de ejecucion.
- Despliegue en servidores con GPU de 16 GB: al ocupar 6,82 GiB de pesos, deja margen para cache KV y para atender varias peticiones concurrentes, algo impracticable con los 16,68 GiB del modelo en bf16 en ese mismo hardware.
- Reproduccion de experimentos sobre cuantizacion: util para investigadores que quieran estudiar el comportamiento de un esquema de empaquetado propietario frente a alternativas estandar, comparando perplejidad y calidad de generacion con el modelo base.
- Entornos con almacenamiento limitado: 7,3 GB de repositorio frente a los aproximadamente 17 GB del modelo en bf16 facilitan el versionado y la distribucion del modelo en imagenes de contenedor o en equipos con discos pequenos.
- Pruebas de integracion del motor Glyd: sirve como caso de validacion para equipos que quieran evaluar la CLI `glyd run`, su instalador y su rendimiento antes de comprometerse con el formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, ni para el modelo cuantizado ni para el modelo base. Tampoco se documentan latencia, throughput ni comparaciones de calidad frente a bf16.

## Requisitos de hardware

- VRAM para los pesos: 6,82 GiB (dato del autor). No se publica el consumo total de VRAM, que sera superior al sumar cache KV y activaciones.
- Estimacion de VRAM total: a partir de 8-9 GB en contextos cortos, cifra orientativa derivada del tamano de los pesos y no confirmada por el autor.
- GPU recomendadas: cualquier NVIDIA con 12 GB o mas de VRAM. Encajan RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, RTX 3090, L4, A10, A100 y H100. En GPUs de 8 GB el margen es muy ajustado o insuficiente.
- GPU de consumo: si, cabe en graficas de consumo con 12 GB o mas de VRAM, siempre que se cumpla el requisito de controlador.
- Requisitos de software: Linux con driver NVIDIA 580 o superior y Glyd 0.29.3 o posterior. No hay soporte para macOS, Apple Silicon ni GPU AMD en la informacion disponible.
- Opciones de despliegue: exclusivamente el motor Glyd (`glyd run`). No compatible con vLLM, transformers, llama.cpp, Ollama ni TGI. No se ofrecen pesos en GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo / nivel | Bits por peso | Tamano de pesos | Perdida | Licencia de pesos | Motor compatible |
|---|---|---|---|---|---|
| glyd/Qwen3.5-9B-kestrel | ~6,54 | 6,82 GiB | Si (lossy) | apache-2.0 | Glyd (BUSL-1.1) |
| glyd/Qwen3.5-9B-penguin | no disponible | no disponible (aprox. un tercio menos que bf16) | No (lossless) | apache-2.0 | Glyd (BUSL-1.1) |
| glyd/Qwen3.5-9B-swift | ~5,5 | no disponible | Si (lossy) | apache-2.0 | Glyd (BUSL-1.1) |
| Qwen/Qwen3.5-9B (bf16) | 16 | 16,68 GiB | No | apache-2.0 | vLLM, transformers y otros |

No se dispone de datos sobre cuantizaciones equivalentes de terceros (por ejemplo, formatos GGUF o AWQ del mismo modelo base) en la informacion proporcionada, por lo que no se puede establecer una comparacion de calidad ni de rendimiento con ellas.

## Limitaciones y advertencias

- Cuantizacion con perdida: el autor advierte explicitamente de que la conversion no es sin perdida y no publica ninguna medicion del error introducido. La calidad real de generacion es desconocida.
- Sin benchmarks: no hay ningun dato objetivo de rendimiento, lo que impide justificar su uso en produccion frente al modelo en bf16.
- Dependencia de un motor propietario: solo funciona con Glyd. Queda fuera de vLLM, transformers, llama.cpp, Ollama y TGI, lo que limita la portabilidad y ata el despliegue a un unico proveedor.
- Licencia del motor: Glyd se distribuye bajo BUSL-1.1. El uso comercial requiere licencia de pago, aunque los pesos conserven la licencia apache-2.0 del modelo base. Es una restriccion relevante para cualquier producto.
- Requisitos de plataforma estrictos: Linux y driver NVIDIA 580 o superior; sin soporte para otros sistemas operativos o aceleradores en la documentacion disponible.
- Componentes ausentes: no incluye la torre de vision ni los modulos de prediccion multi-token del modelo base, por lo que no se pueden usar capacidades multimodales ni decodificacion especulativa basada en MTP.
- Metadatos incompletos: no se declaran contexto, idiomas, arquitectura ni pipeline. Cualquier integracion requiere verificacion previa.
- Riesgo de alucinacion: no cuantificado. Se desconoce si la cuantizacion agresiva incrementa la tasa de alucinacion respecto al modelo base.
- Sesgos: no documentados. No hay evaluaciones de sesgo ni de seguridad para este paquete.
- Madurez: cero descargas y cero likes en el momento de la consulta, con publicacion muy reciente (9 de octubre de 2026). Es un artefacto sin validacion por parte de la comunidad.
- Ausencia de datos de calibracion: no se detalla como se construyo la cuantizacion, lo que dificulta auditar su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glyd/Qwen3.5-9B-kestrel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Commit concreto del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Nivel penguin (lossless): https://huggingface.co/glyd/Qwen3.5-9B-penguin
- Nivel swift (~5,5 bits por peso): https://huggingface.co/glyd/Qwen3.5-9B-swift
- Sitio del motor Glyd: https://getglyd.com
- Instalador de Glyd: https://getglyd.com/install.sh

Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relevante sobre el modelo, el autor o el motor Glyd; los enlaces anteriores provienen unicamente de la informacion del repositorio de HuggingFace.
