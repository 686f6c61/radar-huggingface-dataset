# scottlowry/Ornith-1.5-35B-A3B-oQ5e-fp16-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ5e-fp16-mtp es una version cuantizada del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por el usuario scottlowry. No se trata por tanto de un modelo entrenado desde cero, sino de un artefacto de pesos optimizado para inferencia en hardware Apple Silicon mediante la libreria MLX. La cuantizacion se ha realizado con la herramienta oQ de oMLX (version v0.7.1.dev1) en modo de precision mixta.

El modelo base pertenece a la familia etiquetada como qwen3_5_moe, lo que apunta a una arquitectura transformer de tipo mezcla de expertos (MoE, Mixture of Experts) derivada de la linea Qwen3.5. El sufijo A3B del nombre sugiere un esquema disperso con aproximadamente 3.000 millones de parametros activos por token, y la nomenclatura mtp apunta a soporte de prediccion multi-token (multi-token prediction). No se dispone de informacion confirmada sobre el desarrollador original ni sobre el proceso de entrenamiento.

La relevancia de esta ficha es acotada: se trata de una publicacion con cero descargas y cero likes en el momento de la consulta, sin model card completa ni datos de evaluacion. Su interes practico reside en ser una via concreta para ejecutar un modelo MoE de ~36.000 millones de parametros en Macs con memoria unificada, reduciendo el peso a 26,8 GB mediante cuantizacion de 5 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (model type: qwen3_5_moe); numero de expertos y capas: no disponible |
| Parametros totales | 35.951.822.704 (~35,95 mil millones) |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e de precision mixta: 5 bits, grupo de tamano 64, con algunos tensores en fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se desconoce la licencia heredada del modelo base) |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 26,8 GB |
| Libreria de inferencia | mlx |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Fecha de publicacion | 2026-10-12 |

## Arquitectura y entrenamiento

La informacion disponible se limita a la model card del artefacto cuantizado, que no describe la arquitectura interna ni el entrenamiento del modelo base. El unico dato tecnico confirmado es el campo model type: qwen3_5_moe, que indica una arquitectura de mezcla de expertos dentro de la familia Qwen3.5. En este tipo de disenos, solo un subconjunto de los expertos se activa por token, de modo que el coste computacional por token es muy inferior al que implicaria activar los 35,95 mil millones de parametros completos.

El proceso descrito en la model card es exclusivamente de cuantizacion: se aplico oQ (oMLX v0.7.1.dev1) con 5 bits, tamano de grupo 64 y formato MLX safetensors, manteniendo ciertos tensores en fp16. El sufijo mtp del nombre y la indicacion fp16 en el identificador sugieren, respectivamente, soporte de prediccion multi-token y la preservacion de determinadas capas sin cuantizar, pero no hay documentacion que confirme el detalle de que capas quedan en precision completa ni si el modelo base fue entrenado con tecnicas de RLHF, DPO o similares.

## Capacidades

No se ha publicado informacion verificable sobre las capacidades especificas de este modelo. A partir de la arquitectura declarada (qwen3_5_moe) y del modelo base, cabria esperar el repertorio habitual de un modelo de lenguaje de gran escala, pero no debe asumirse sin evaluacion propia:

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento y matematicas: no confirmado.
- Generacion de codigo: no confirmada.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Vision, audio o modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

Dado que no hay datos de evaluacion publicados, los siguientes escenarios son planteamientos de uso plausibles basados en las caracteristicas tecnicas confirmadas (tamano, cuantizacion MLX y naturaleza MoE), no en resultados medidos:

- Ejecucion local en Mac con memoria unificada: servir el modelo con MLX en un Mac Studio o MacBook Pro de gama alta para tareas de generacion de texto en local, sin depender de APIs externas, aprovechando los 26,8 GB de pesos cuantizados.
- Prototipado offline en portatil: usar el modelo en entornos sin conectividad o con requisitos de privacidad, manteniendo los datos dentro de la maquina.
- Evaluacion comparativa de cuantizaciones: emplear este artefacto como referencia de una cuantizacion de 5 bits frente a variantes de 4 u 8 bits del mismo modelo base, para medir la degradacion de calidad en tareas concretas.
- Base para experimentos de inferencia MoE en Apple Silicon: analizar el rendimiento real de un MoE de ~36.000 millones de parametros con ~3.000 millones activos en el framework MLX.
- Integracion en LM Studio u otros frontends compatibles con MLX: desplegar el modelo como backend local para asistentes de escritura o resumen de documentos.
- Desarrollo y depuracion de pipelines de cuantizacion: usar el artefacto como caso de estudio del flujo oQ/oMLX, comparando la salida con la del modelo base sin cuantizar.
- Tareas batch de procesamiento de texto en local: transcripcion, clasificacion o resumen de corpus siempre que la ventana de contexto y el rendimiento resulten suficientes, extremo que debe validarse antes de llevarlo a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a los parametros de cuantizacion y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio no registra descargas ni evaluaciones de terceros.

## Requisitos de hardware

- Peso de los pesos: 26,8 GB (repo completo en MLX safetensors de 5 bits). A esta cifra hay que anadir el overhead del runtime y la cache KV, por lo que se recomienda reservar al menos 30-34 GB de memoria.
- Memoria unificada recomendada: Macs con 36 GB o mas. Un Mac con 32 GB queda al limite y probablemente no permita contextos largos. Configuraciones holgadas: M2 Ultra (64 GB o mas), M3 Max (36/48 GB), M4 Max (48/64 GB).
- GPU dedicadas: no aplicable directamente. El formato MLX esta disenado para el framework MLX de Apple; no se ejecuta en CUDA sin conversion previa de pesos (por ejemplo a GGUF o safetensors estandar), tarea no documentada en este repositorio.
- Despliegue: libreria MLX (por ejemplo mlx-lm) y herramientas compatibles como oMLX y LM Studio. No se indica compatibilidad con vLLM, TGI, llama.cpp u Ollama tal cual, dado el formato especifico de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base (longitud de contexto, licencia, idiomas), por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros totales | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Ornith-1.5-35B-A3B-oQ5e-fp16-mtp | 35,95 mil millones | oQ 5 bits, grupo 64, fp16 parcial | MLX safetensors | no disponible | Objeto de esta ficha |
| ornith-ai/Ornith-1.5-35B-A3B | no disponible (mismo modelo base) | Sin cuantizar (presumiblemente) | no disponible | no disponible | Modelo origen |
| Otras cuantizaciones de la misma familia | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas publicadas en la informacion disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: cero descargas, cero likes y ninguna metrica publicada. No hay evidencia de calidad de salida para ninguna tarea.
- Sin model card completa: se desconoce la licencia, los idiomas soportados, la longitud de contexto y las capacidades reales. No debe asumirse uso comercial permitido.
- Riesgo de degradacion por cuantizacion: la cuantizacion a 5 bits con grupo 64 puede afectar a tareas sensibles a la precision (matematicas, codigo, razonamiento encadenado). No hay comparativa contra el modelo base sin cuantizar.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; no hay datos especificos que lo cuantifiquen en este artefacto.
- Sesgos: no documentados. Al no conocerse la composicion de los datos de entrenamiento del modelo base, no puede evaluarse el sesgo.
- Restricciones de plataforma: formato MLX, pensado para Apple Silicon. El despliegue en GPU NVIDIA o AMD requiere conversion de pesos no soportada oficialmente por este repositorio.
- Ambiguedad de licencia: al no figurar la licencia del modelo base ni de esta cuantizacion, cualquier uso en produccion o comercial queda sujeto a verificacion previa con el autor original.
- Naturaleza del artefacto: es una copia cuantizada de terceros, no un modelo oficial. La responsabilidad sobre su idoneidad recae en quien lo despliega.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/scottlowry/Ornith-1.5-35B-A3B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Otros enlaces (paper, blog, demo, repositorio oficial): no disponibles en la informacion proporcionada.
