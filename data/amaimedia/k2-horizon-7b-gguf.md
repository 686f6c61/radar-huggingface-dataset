# AMAImedia/K2-Horizon-7B-GGUF

## Resumen

K2-Horizon-7B-GGUF es el repositorio de cuantizaciones GGUF del modelo IFM/K2-Horizon-7B, un decodificador causal denso de aproximadamente 7.000 millones de parametros desarrollado por el equipo IFM de MBZUAI. El repositorio lo publica AMAImedia y las cuantizaciones las ha generado NANI-Nithin con un pipeline propio basado en el fork MBZUAI-IFM de llama.cpp (rama `model/K2Horizon`). El recuento real de parametros en los pesos safetensors asciende a 8.999.178.240, por encima de los "~7B" que declara la model card.

El valor practico de este repositorio es que empaqueta el modelo en mas de 30 variantes GGUF, desde BF16 (18,01 GB) hasta Q1_0 (1,125 bits por peso), lo que permite ejecutarlo en hardware de consumo. La model card indica que la cuantizacion se hizo con una matriz de importancia (imatrix) calculada sobre 500 filas de `wikitext-2-raw-v1`, aplicada a todos los K-quants por debajo de Q6 y a todos los IQ.

La relevancia es doble: por un lado, ofrece una via de despliegue local para una arquitectura poco comun (`K2HorizonForCausalLM`); por otro, es un caso claro de dependencia de forks: a fecha de septiembre de 2026, llama.cpp upstream no soporta esta arquitectura, de modo que los ficheros solo funcionan con el fork de MBZUAI-IFM. El repositorio tiene 0 descargas y 1 like, por lo que su adopcion es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `K2HorizonForCausalLM` (`model_type: k2_horizon`), decoder causal denso |
| Parametros totales | 8.999.178.240 (recuento safetensors); la model card declara "~7B" |
| Parametros activos | no aplica (modelo denso, sin MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (16 bpw); Q8_0; Q6_K; Q5_K_M, Q5_K_S, Q5_1, Q5_0; Q4_K_M, Q4_K_S, Q4_1, Q4_0; Q3_K_L, Q3_K_M, Q3_K_S; Q2_K, Q2_K_S (imatrix), Q2_0; Q1_0; IQ4_NL, IQ4_XS, IQ3_M/S/XS/XXS, IQ2_M/S/XS/XXS, IQ1_M (1,75 bpw), IQ1_S (1,56 bpw) |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en BF16/safetensors |
| Tipo original | BF16 |
| Tamano del repositorio | 154,8 GB (contiene todas las variantes) |
| Modelo base | IFM/K2-Horizon-7B |
| Runtime requerido | fork MBZUAI-IFM de llama.cpp, rama `model/K2Horizon` |
| Fecha de publicacion | 2026-09-10 |

### Variantes incluidas y tamano estimado

Los tamanos son estimaciones calculadas como `8.999.178.240 parametros x bits por peso / 8`; el valor BF16 coincide con el dato de la model card (18,01 GB), lo que valida la aproximacion. Los ficheros reales pueden ser ligeramente mayores por metadatos y tensores que se mantienen en mayor precision.

| Fichero | bpw | Tamano estimado |
|---|---|---|
| K2-Horizon-7B-BF16.gguf | 16 | 18,01 GB (dato del autor) |
| K2-Horizon-7B-Q8_0.gguf | 8 | ~9,0 GB |
| K2-Horizon-7B-Q6_K.gguf | 6 | ~6,8 GB |
| K2-Horizon-7B-Q5_K_M.gguf | 5 | ~5,6 GB |
| K2-Horizon-7B-Q4_K_M.gguf | 4 | ~4,5 GB |
| K2-Horizon-7B-Q3_K_M.gguf | 3 | ~3,4 GB |
| K2-Horizon-7B-Q2_K.gguf | 2 | ~2,3 GB |
| K2-Horizon-7B-IQ1_S.gguf | 1,56 | ~1,8 GB |
| K2-Horizon-7B-Q1_0.gguf | 1,125 | ~1,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder causal denso registrado como `K2HorizonForCausalLM` con `model_type: k2_horizon`. No hay mezcla de expertos, ni atencion lineal, ni componentes de estado recurrente documentados en la informacion disponible. La model card no detalla la configuracion interna de la red (numero de capas, dimensiones de atencion, cabezas, tipo de RoPE o mecanismo de atencion), por lo que esos datos figuran como no disponibles.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Lo unico verificable sobre el proceso de este repositorio es la cuantizacion: se partio del GGUF BF16 oficial de IFM, se calculo una matriz de importancia sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`, 500 filas) y se aplico a los K-quants por debajo de Q6 y a todos los quants IQ. El proceso se ejecuto en una RTX 4060 Laptop de 8 GB de VRAM, con 12 capas descargadas a GPU (`-ngl 12`) debido a los 18 GB del modelo de origen.

## Capacidades

- Generacion de texto: es la tarea declarada (`pipeline_tag: text-generation`) y la unica documentada explicitamente.
- Modelo causal de lenguaje (`causal-lm`), adecuado para continuacion de texto y decodificacion autoregresiva.
- Conversacion: el repositorio lleva la etiqueta `conversational` y esta marcado como compatible con endpoints.
- Multilingue: no. La model card declara unicamente ingles (`en`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking", vision, audio o cualquier otra modalidad: no disponible en la informacion proporcionada.
- Capacidades de razonamiento, codigo o matematicas: no documentadas; no se han publicado evaluaciones que las respalden.

## Casos de uso

- Inferencia local en estacion de trabajo: con la variante Q4_K_M (unos 4,5 GB estimados) el modelo cabe en GPUs de consumo de 8 GB o mas y permite generar texto en ingles sin enviar datos a servicios externos, algo relevante para entornos con requisitos de confidencialidad.
- Prototipado rapido de aplicaciones de chat: la etiqueta `conversational` y el formato GGUF permiten levantar un servidor de chat local con `llama-cli` o `llama-server` del fork y validar flujos conversacionales antes de invertir en infraestructura.
- Despliegue en equipos con VRAM limitada: las variantes IQ2/IQ3 y Q2_K (entre 2,3 GB y 3,4 GB estimados) permiten ejecutar el modelo en GPUs de 4-6 GB o incluso en CPU con memoria RAM suficiente, a costa de perdida de calidad.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 30 variantes del mismo modelo, lo que lo convierte en un banco de pruebas para medir el impacto de la cuantizacion (de 16 bpw a 1,125 bpw) sobre la perplejidad y la calidad de generacion en ingles.
- Generacion de texto por lotes en ingles: con la variante Q8_0 o Q6_K, practicamente sin perdida, para tareas de resumen, reescritura o clasificacion generativa donde la calidad prima sobre el coste.
- Integracion en pipelines internos de procesamiento de lenguaje natural: cualquier flujo que ya consuma GGUF a traves de llama.cpp puede incorporar el modelo recompilando con el fork requerido, sin cambiar la interfaz de la aplicacion.
- Experimentacion en investigacion sobre arquitecturas no estandar: al ser una arquitectura poco comun (`k2_horizon`), sirve para estudiar el comportamiento de un decoder denso propietario frente a alternativas abiertas equivalentes en tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas de Google Translate, sin relacion con K2-Horizon). Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: igual al tamano del fichero GGUF mas el cache KV y el overhead del runtime. El cache KV no puede calcularse porque se desconoce la longitud de contexto y la configuracion de atencion. Como referencia orientativa: Q4_K_M ~4,5 GB + overhead; Q8_0 ~9,0 GB + overhead; BF16 18,01 GB + overhead.
- GPU recomendadas: para BF16 o Q8_0, GPUs de 24 GB o mas (RTX 3090/4090, A100 40 GB, H100). Para Q4_K_M y Q5_K_M, GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060, RTX 3070, RTX 4070).
- Cabe en GPU de consumo: si. Q4_K_M (unos 4,5 GB) entra en 8 GB; Q2_K y las variantes IQ1/IQ2 entran en 4 GB o menos. La propia cuantizacion se hizo en una RTX 4060 Laptop de 8 GB descargando 12 capas a GPU para un fichero de 18 GB.
- Despliegue: exclusivamente con el fork MBZUAI-IFM de llama.cpp (rama `model/K2Horizon`), compilado con soporte CUDA (`-DGGML_CUDA=ON`). El ejemplo de la model card usa `-ngl 35` con Q4_K_M. vLLM, TGI y Ollama no estan confirmados: Ollama depende de llama.cpp y, mientras el soporte no llegue a upstream, no podra cargar estos ficheros sin parchear.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparados son valores de referencia publicos de cada proyecto; los del modelo analizado se limitan a lo indicado en su model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-7B (este repositorio) | 8.999.178.240 en safetensors (~7B declarados) | no disponible | apache-2.0 | GGUF, solo con fork de llama.cpp; 0 descargas |
| Llama 3.1 8B | ~8B | 128.000 tokens | Llama 3.1 Community License | safetensors y GGUF, soporte amplio en upstream |
| Qwen2.5-7B | ~7,6B | 128.000 tokens | apache-2.0 | safetensors y GGUF, soporte amplio en upstream |
| Mistral-7B-v0.3 | ~7,2B | 32.000 tokens | apache-2.0 | safetensors y GGUF, soporte amplio en upstream |

La diferencia practica principal no esta en el rendimiento, del que no hay datos publicados, sino en la madurez del ecosistema: los tres modelos de referencia se ejecutan en llama.cpp upstream, Ollama, vLLM y TGI sin parches, mientras que K2-Horizon-7B exige compilar un fork especifico.

## Limitaciones y advertencias

- Dependencia de un fork: llama.cpp upstream no soporta `K2HorizonForCausalLM` a fecha de septiembre de 2026. Sin el fork de MBZUAI-IFM (rama `model/K2Horizon`), los ficheros GGUF no se pueden cargar en herramientas estandar.
- Soporte de contexto desconocido: la longitud de contexto no esta documentada, lo que impide dimensionar el cache KV y planificar despliegues con conversaciones largas.
- Solo ingles: la model card declara unicamente `en`; cualquier uso en castellano u otros idiomas queda fuera del soporte declarado.
- Riesgo de alucinacion: no hay evaluaciones publicadas que cuantifiquen la tasa de alucinacion ni la fiabilidad factual. Al ser un modelo de ~7B del que no se conocen los datos de entrenamiento, el riesgo no esta acotado.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad.
- Trazabilidad del entrenamiento nula: se desconocen dataset, numero de tokens y si hubo RLHF o DPO, lo que dificulta evaluar riesgos de contaminacion o de comportamiento no alineado.
- Licencia: los pesos se publican bajo apache-2.0, en principio permisiva para uso comercial. No obstante, la model card remite a los terminos del repositorio original de IFM/K2-Horizon-7B, por lo que conviene verificar esa licencia antes de un despliegue comercial.
- Calidad de las cuantizaciones agresivas: por debajo de Q3 se espera degradacion notable; las variantes IQ1 e IQ2 estan pensadas para ejecucion en hardware muy limitado y no como opcion por defecto.
- Adopcion practicamente nula: 0 descargas y 1 like. No hay reportes de usuarios, issues resueltos ni validacion independiente de que las cuantizaciones funcionen correctamente en produccion.
- Produccion: la combinacion de runtime no estandar, contexto desconocido y ausencia de benchmarks hace desaconsejable usar este repositorio como dependencia critica sin una evaluacion previa propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AMAImedia/K2-Horizon-7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-7B
- GGUF de origen (IFM): https://huggingface.co/IFM/K2-Horizon-7B-GGUF
- Fork de llama.cpp requerido: https://github.com/MBZUAI-IFM/llama.cpp (rama `model/K2Horizon`)
- Perfil del autor de las cuantizaciones: https://huggingface.co/NANI-Nithin
- Dataset usado para la imatrix: https://huggingface.co/datasets/Salesforce/wikitext
- Organizacion IFM (MBZUAI): https://huggingface.co/IFM
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo; los resultados obtenidos correspondian a paginas de Google Translate sin relacion con K2-Horizon.
