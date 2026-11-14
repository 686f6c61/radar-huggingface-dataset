# mradermacher/dolphin-2.7-yayi2-30b-GGUF

## Resumen

Esta ficha describe `mradermacher/dolphin-2.7-yayi2-30b-GGUF`, una publicacion de cuantizaciones GGUF del modelo base `dphn/dolphin-2.7-yayi2-30b`. El autor de esta publicacion es `mradermacher`, un conocido cuantizador de la comunidad de Hugging Face que distribuye versiones comprimidas de modelos para inferencia local mediante llama.cpp y derivados. El modelo subyacente es un Dolphin 2.7 construido sobre la base Yi-2 de 01.AI, con 30.403.365.888 parametros totales segun los pesos safetensors del repositorio.

El interes de esta publicacion es practico: permite ejecutar un modelo de aproximadamente 30.000 millones de parametros en hardware de consumo mediante cuantizaciones que van desde Q2_K (11,5 GB) hasta Q8_0 (32,4 GB). El modelo hereda las caracteristicas de la familia Dolphin, orientada a instrucciones sin censura y a conversacion general, pero la informacion disponible sobre arquitectura, entrenamiento y benchmarks del modelo base es limitada en esta publicacion.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque se recomienda verificar las condiciones del modelo base original antes de desplegarlo en produccion. El idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Dolphin 2.7 sobre Yi-2; detalles no especificados en la informacion disponible) |
| Parametros totales | 30.403.365.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); existe variante imatrix en `mradermacher/dolphin-2.7-yayi2-30b-i1-GGUF` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, la composicion del dataset de entrenamiento, el numero de tokens utilizados ni el proceso de alineacion (RLHF/DPO) del modelo base `dphn/dolphin-2.7-yayi2-30b` en la informacion proporcionada. Por la nomenclatura, se trata de un modelo de la familia Dolphin (desarrollada por Cognitive Computations) construido sobre la base Yi-2 de 01.AI, con un total de 30.403.365.888 parametros. La model card de esta publicacion se limita a describir el proceso de cuantizacion estatica (quantize_version 2, salida con tensor quantised, conversion desde formato HF) y no aporta detalles sobre el entrenamiento del modelo original.

La innovacion tecnica destacable de esta publicacion concreta es la disponibilidad de un espectro amplio de cuantizaciones GGUF, incluida una familia imatrix (i1) publicada por separado, que permite ajustar el equilibrio entre tamano, velocidad y calidad segun el hardware disponible. No se documentan tecnicas como decodificacion especulativa, attention linear ni otras optimizaciones de inferencia en la informacion disponible.

## Capacidades

- Generacion de texto e instruccion general, heredadas del modelo base Dolphin 2.7 sobre Yi-2.
- Conversacion multi-turno en ingles (unico idioma declarado).
- Razonamiento y respuesta a instrucciones sin censura, segun la orientacion habitual de la familia Dolphin (no verificable con datos de esta publicacion).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo: con cuantizaciones Q4_K_M (18,3 GB) o IQ4_XS (16,6 GB) el modelo puede ejecutarse en GPUs de consumo de gama alta o en configuraciones con CPU y RAM abundante, usando llama.cpp u Ollama.
- Servicio de chat en ingles para entornos controlados: el modelo puede gestionar conversaciones multi-turno en ingles; la ventana de contexto concreta no esta documentada, por lo que debe validarse empiricamente antes de desplegarlo con historiales largos.
- Generacion creativa y redaccion asistida: la familia Dolphin esta orientada a instrucciones abiertas, lo que encaja con tareas de redaccion, reescritura y generacion de borradores en ingles.
- Evaluacion comparativa de cuantizaciones: la publicacion ofrece 11 variantes de cuantizacion, lo que permite medir empiricamente la perdida de calidad frente al modelo base en tareas propias antes de elegir una variante para produccion.
- Prototipado de pipelines de inferencia: al ser GGUF y compatible con endpoints, puede integrarse rapidamente en servicios locales para pruebas de latencia y throughput antes de migrar a un formato mas eficiente para servidores.
- Despliegue en entornos con recursos limitados: las variantes Q2_K (11,5 GB) y Q3_K_S (13,4 GB) permiten ejecutar un modelo de 30.000 millones de parametros en hardware modesto, aceptando la perdida de calidad asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente igual al tamano del fichero GGUF mas overhead de contexto. Q2_K ~11,5 GB; Q4_K_M ~18,3 GB; Q8_0 ~32,4 GB.
- GPU recomendadas: para Q4_K_M y superiores, GPUs con 24 GB o mas de VRAM (RTX 4090, RTX 3090, A100, H100). Para Q2_K/Q3_K_S, GPUs de 16 GB pueden ser suficientes, con posible offload parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizaciones hasta Q6_K (~25 GB, al limite) o Q8_0 con offload parcial; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB con Q2_K/Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| dolphin-2.7-yayi2-30b-GGUF (este) | 30,4 B | no disponible | apache-2.0 | GGUF (11 variantes) | Cuantizaciones estaticas e imatrix |
| Modelo base dphn/dolphin-2.7-yayi2-30b | 30,4 B | no disponible | apache-2.0 | safetensors | Pesos originales sin cuantizar |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: la longitud de contexto no esta especificada en la informacion disponible; debe validarse antes de usarla en tareas de contexto largo.
- Alucinacion: no hay datos de evaluacion que permitan estimar la tasa de alucinacion; en modelos de instruccion abierta el riesgo es relevante y requiere verificacion en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable; la propia model card advierte que Q3_K_M es de menor calidad. Para produccion se recomienda Q4_K_M o superior, o las variantes imatrix.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original y de los datos de entrenamiento antes de desplegar comercialmente.
- Fecha de actualizacion: el repositorio figura actualizado en 2026-11-14, posterior a la fecha de creacion; conviene verificar que los ficheros no han cambiado respecto a la version evaluada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/dolphin-2.7-yayi2-30b-GGUF
- Variante imatrix: https://huggingface.co/mradermacher/dolphin-2.7-yayi2-30b-i1-GGUF
- Modelo base: https://huggingface.co/dphn/dolphin-2.7-yayi2-30b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#dolphin-2.7-yayi2-30b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones del cuantizador: https://huggingface.co/mradermacher/model_requests
