# mradermacher/Phai-A1-35B-1M-MTP-Repacked-GGUF

## Resumen

Phai-A1-35B-1M-MTP-Repacked-GGUF es una distribucion de pesos cuantizados en formato GGUF generada por mradermacher a partir del modelo Phai-A1-35B-1M-MTP-Repacked, publicado por prithivMLmods. El modelo base subyacente es Phai-A1-35B-1M, desarrollado por PhaiModelLab, que segun la informacion disponible se construye sobre Qwen3.6-35B-A3B y ha sido sometido a un pipeline de post-entrenamiento (SFT y RL) orientado a cargas de trabajo de codigo y agentes, ejecutado sobre NPUs Huawei Ascend.

El repositorio contiene unicamente cuantizaciones estaticas del modelo repacked, con un conjunto de variantes que abarca desde Q2_K hasta F16, incluyendo Q3_K_S/M/L, Q4_K_S/M, Q5_K_S/M, Q6_K, Q8_0 e IQ4_XS. El tamano del repositorio es de 1,5 GB y el recuento de parametros reportado en los safetensors es de 446.571.248, un dato que no concuerda con la denominacion "35B" del nombre del modelo y que conviene tratar con cautela.

La relevancia de esta ficha es doble: por un lado, documenta una distribucion GGUF lista para inferencia local con llama.cpp; por otro, advierte de las inconsistencias de metadatos (parametros, licencia, idiomas y benchmarks no disponibles) que deben resolverse antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base descrito como construido sobre Qwen3.6-35B-A3B, presumiblemente MoE) |
| Parametros totales | 446.571.248 segun safetensors del repo; la denominacion del modelo indica 35B (dato contradictorio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el sufijo "1M" del nombre sugiere 1M tokens, sin confirmacion en la informacion proporcionada) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas; repo origen en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo base Phai-A1-35B-1M se describe como construido sobre Qwen3.6-35B-A3B, lo que sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y 3.000 millones activos por token, aunque esta inferencia no esta confirmada por los metadatos del repositorio GGUF.

Respecto al entrenamiento, la informacion disponible indica que PhaiModelLab realizo un post-entrenamiento completo sobre el modelo base, incluyendo Supervised Fine-Tuning (SFT) y Reinforcement Learning (RL), con enfasis en tareas de codigo y agentes. Todo el pipeline se ejecuto sobre NPUs Huawei Ascend. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del algoritmo de RL. El sufijo "MTP" del nombre podria referirse a Multi-Token Prediction, pero no hay confirmacion en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Qwen3.6-35B-A3B.
- Generacion de codigo y tareas de programacion, segun el enfasis declarado del post-entrenamiento.
- Cargas de trabajo de agentes, incluyendo razonamiento multi-paso, segun la descripcion del modelo base.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.
- Inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, etc.).

## Casos de uso

- Asistencia de codigo en local: el formato GGUF y las cuantizaciones Q4_K_M y Q5_K_M permiten desplegar el modelo en estaciones de trabajo sin GPU de datacenter, usando llama.cpp u Ollama para autocompletado y generacion de funciones.
- Agentes de automatizacion de tareas: el post-entrenamiento orientado a agentes del modelo base sugiere utilidad en flujos multi-paso, aunque la ausencia de datos sobre tool calling exige validacion previa.
- Prototipado de pipelines de IA en entornos con hardware limitado: las variantes Q2_K y Q3_K_S reducen el peso en disco y memoria, permitiendo pruebas rapidas en equipos de gama media.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un espectro amplio (de Q2_K a F16) que facilita estudios de degradacion de calidad frente a compresion.
- Despliegue en entornos aislados o air-gapped: al ser pesos estaticos descargables, el modelo puede ejecutarse sin conexion una vez obtenido el GGUF.
- Experimentacion academica con modelos post-entrenados en NPUs: permite reproducir y comparar el comportamiento del modelo original en hardware x86/ARM convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision debido a la contradiccion entre los 446 millones de parametros reportados y la denominacion "35B". Si se confirma el tamano de 35B, una cuantizacion Q4_K_M requeriria aproximadamente 20-22 GB de VRAM; una Q2_K, en torno a 12-14 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para un modelo de 35B en Q4 se necesitarian GPUs con 24 GB o mas (RTX 4090, A6000, L40S, A100 40 GB).
- Cabe en GPU de consumo: probablemente si en RTX 4090 (24 GB) con cuantizaciones Q4 o inferiores, condicionado a confirmar el tamano real.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M-MTP-Repacked-GGUF | 446M reportados / 35B nominales | no disponible | no disponible | GGUF | Cuantizaciones estaticas de un modelo post-entrenado para codigo y agentes |
| Qwen3.6-35B-A3B (modelo base referenciado) | 35B totales / 3B activos (segun denominacion) | no disponible | no disponible | safetensors | Base sobre la que se construye Phai-A1 |
| Phai-A1-35B-1M-i1-GGUF (mradermacher) | 35B nominales | no disponible | no disponible | GGUF | Variante i1 (imatrix) del mismo modelo, alternativa a esta version estatica |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Inconsistencia critica de metadatos: el recuento de parametros en safetensors (446.571.248) no concuerda con la denominacion "35B" del modelo; verificar antes de dimensionar hardware.
- Licencia no disponible: no puede confirmarse el uso comercial. Contactar con el autor del modelo base (PhaiModelLab) antes de cualquier despliegue en produccion.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Ausencia de benchmarks: no hay evidencia publicada de calidad en codigo, agentes o razonamiento.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de evaluacion no puede acotarse.
- Sesgos: no documentados en la informacion disponible.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.
- Modelo derivado de un "repacked": pueden existir diferencias respecto al modelo original no documentadas.
- El pipeline de post-entrenamiento se ejecuto en NPUs Huawei Ascend; la transferencia a GPUs convencionales no esta validada en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phai-A1-35B-1M-MTP-Repacked-GGUF
- Modelo repacked de origen: https://huggingface.co/prithivMLmods/Phai-A1-35B-1M-MTP-Repacked
- Variante i1 GGUF del mismo autor: https://huggingface.co/mradermacher/Phai-A1-35B-1M-i1-GGUF
- Modelo base: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
