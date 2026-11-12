# Estirius/Qwopus3.8-27B-Coder-Flash-oQ5e-mtp

## Resumen

Qwopus3.8-27B-Coder-Flash-oQ5e-mtp es una cuantizacion mixta del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un modelo de lenguaje de 27.781 millones de parametros orientado a generacion de codigo. La cuantizacion la ha realizado el usuario Estirius mediante la herramienta oQ (oMLX v0.7.3), que aplica precision mixta por capas en lugar de una cuantizacion uniforme. El resultado es un checkpoint de 19,046 GiB con una media efectiva de 5,889 bits por peso, lo que reduce el peso del modelo original en BF16 a aproximadamente un tercio de su tamano.

El modelo base combina componentes de lenguaje, vision y una cabeza MTP (multi-token prediction), lo que sugiere una arquitectura multimodal con decodificacion especulativa integrada. La cuantizacion conserva el 87,971% de los pesos en 5 bits afines con grupo de 64, mientras que reserva 6 y 8 bits para capas mas sensibles y mantiene 0,516B de parametros en BF16, presumiblemente capas de normalizacion o embeddings criticos.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 28B parametros con capacidades de codigo y vision en hardware Apple Silicon mediante MLX, un ecosistema donde las opciones de cuantizacion de alta calidad para modelos grandes son limitadas. No obstante, la informacion publicada por el autor es exclusivamente tecnica sobre el proceso de cuantizacion: no hay datos sobre el entrenamiento del modelo base, benchmarks, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (lenguaje + vision) con cabeza MTP; detalles no disponibles |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (87,971%), affine 6-bit grupo 64 (5,558%), affine 8-bit grupo 64 (4,614%), BF16 (1,857%); media efectiva 5,889 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repositorio | 20,5 GB (19,046 GiB de pesos) |
| Componentes | Lenguaje: 26,896B (17,848 GiB); vision: 0,461B (0,858 GiB); cabeza MTP: 0,425B (0,340 GiB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no esta documentada en la informacion disponible. Los metadatos y el desglose de componentes revelan una estructura con tres partes: un modelo de lenguaje de 26,896B parametros, un codificador o torre de vision de 0,461B y una cabeza de prediccion multi-token (MTP) de 0,425B. La presencia de MTP apunta a un mecanismo de decodificacion especulativa entrenado conjuntamente, que predice varios tokens por paso para acelerar la generacion. El tag `qwen3_5` sugiere que el modelo base deriva de la familia Qwen 3.5, aunque no se confirma en la documentacion.

Sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no hay ningun dato publicado en la informacion proporcionada. Lo unico documentado es el proceso de cuantizacion: oMLX v0.7.3 con cuantizacion de precision mixta por capas, asignando 5 bits a la mayoria de pesos y elevando a 6 y 8 bits un subconjunto reducido (10,172% combinado) para preservar calidad en capas sensibles, con un 1,857% mantenido en BF16.

## Capacidades

- Generacion de codigo: el sufijo "Coder" del modelo base indica especializacion en tareas de programacion, aunque no se detallan lenguajes ni benchmarks.
- Vision: incluye un componente visual de 0,461B parametros, por lo que puede procesar imagenes ademas de texto.
- Prediccion multi-token (MTP): cabeza dedicada que permite decodificacion especulativa y potencialmente mayor throughput de generacion.
- Razonamiento y generacion de texto general: capacidades heredadas del modelo base, no documentadas en detalle.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codigo en local sobre Apple Silicon: gracias a la cuantizacion de 5,889 bits/peso y al formato MLX, el modelo puede ejecutarse en Macs con memoria unificada de 32 GB o superior, ofreciendo autocompletado y generacion de funciones sin depender de la nube.
- Revision de codigo con capturas de pantalla: el componente de vision permite adjuntar imagenes de errores de compilacion, diagramas de arquitectura o interfaces para que el modelo genere explicaciones o parches contextualizados.
- Generacion acelerada por MTP: en entornos interactivos (editores, chat de codigo) la cabeza multi-token puede reducir la latencia por token generado, algo critico en bucles de edicion.
- Prototipado de pipelines de datos: el modelo puede generar scripts de transformacion, parsers y tests unitarios en un flujo de trabajo local sin enviar codigo propietario a servicios externos.
- Educacion y explicacion de codigo: al ser ejecutable localmente y sin coste por token, es adecuado para entornos docentes donde se explica paso a paso la logica de fragmentos de codigo.
- Experimentacion en investigacion de cuantizacion: el checkpoint sirve como caso de estudio de precision mixta (5/6/8 bits + BF16) para medir la degradacion de calidad frente al modelo original en tareas de codigo.
- Despliegue en estaciones de trabajo sin GPU dedicada: al estar empaquetado para MLX, se integra en flujos de macOS que no disponen de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 19,046 GiB; se recomienda un minimo de 24 GB de memoria unificada y, para contexto largo y margen de trabajo, 32 GB o mas.
- Hardware objetivo: Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max) por el uso de la libreria MLX.
- GPU NVIDIA: no es el objetivo del checkpoint; para CUDA habria que usar la version GGUF del modelo base (Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF).
- Cabe en GPU de consumo: en el ecosistema Apple, si en equipos con 32 GB o mas de memoria unificada; en NVIDIA, un modelo de 27B a ~5,9 bits requeriria aproximadamente 20 GB de VRAM, lo que encaja en una RTX 4090 (24 GB) solo usando el checkpoint GGUF equivalente, no este.
- Opciones de despliegue: MLX (mlx-lm / mlx_lm.generate), oMLX; para CUDA, llama.cpp u Ollama con el GGUF del modelo base.
- Latencia y throughput: no disponibles; la cabeza MTP deberia mejorar el throughput respecto a decodificacion autoregresiva estandar, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-oQ5e-mtp (este) | 27,781B | no disponible | Mixta 5/6/8-bit + BF16, 5,889 bits/peso | no disponible | safetensors (MLX) |
| Jackrong/Qwopus3.8-27B-Coder-Flash | 27,781B (estimado) | no disponible | Original (probablemente BF16) | no disponible | safetensors |
| Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF | 27,781B (estimado) | no disponible | GGUF (niveles no detallados) | no disponible | GGUF |

La comparativa con modelos de otras familias (por ejemplo, Qwen2.5-Coder-32B o Codestral-22B) no es posible con rigor porque no se dispone de datos de rendimiento del modelo base ni de su licencia.

## Limitaciones y advertencias

- La cuantizacion a 5,889 bits/peso introduce perdida de precision respecto al modelo original; el impacto exacto en tareas de codigo no esta medido ni publicado.
- El repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido; hay que consultar la licencia del modelo base Jackrong/Qwopus3.8-27B-Coder-Flash antes de cualquier uso en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni calidad multilingue; no se puede asumir un buen rendimiento fuera del ingles y del chino sin verificacion.
- Riesgo de alucinacion en generacion de codigo (APIs inexistentes, dependencias inventadas) no evaluado; se recomienda validacion con tests automatizados.
- La longitud de contexto es desconocida; no se debe asumir una ventana grande para tareas de repositorio completo.
- El checkpoint esta atado al ecosistema MLX: no es directamente utilizable en vLLM, TGI o llama.cpp; para esos entornos hay que recurrir al GGUF del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion comunitaria de su calidad ni de su integridad.
- La fecha de creacion (2026-11-11) y el tag `qwen3_5` deben tratarse con cautela; no hay documentacion que confirme la procedencia exacta de los pesos base.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/Estirius/Qwopus3.8-27B-Coder-Flash-oQ5e-mtp
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Modelo base en GGUF: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
