# androidli/Sage-S2.1-Flash-EXL3-3.0bpw

## Resumen

Sage-S2.1-Flash-EXL3-3.0bpw es una cuantizacion EXL3 de 3.0 bits por peso (bpw) del modelo Sage-S2.1-Flash, un Mixture-of-Experts de 321.000 millones de parametros desarrollado por InternLM. La publica el usuario androidli (greatyingzi en GitHub) y su objetivo es reducir el peso del checkpoint hasta 138,3 GiB para que pueda servirse en dos maquinas de clase DGX Spark (2 x 128 GB de memoria unificada) con tensor-parallel 2, algo imposible con el checkpoint original en bfloat16.

La cuantizacion solo afecta a los expertos enrutados (gate_proj, up_proj y down_proj de los 288 expertos en cada una de las 42 capas MoE), que concentran casi todos los parametros. La atencion, los expertos compartidos, el router, los embeddings, la cabeza de salida y la torre de vision se mantienen en bfloat16. El resultado es un checkpoint que no carga con Transformers estandar: requiere un motor que entienda `Glm5NextForConditionalGeneration` y el layout EXL3 de expertos enrutados.

Es relevante porque demuestra que un MoE de esta escala puede desplegarse en hardware de consumo profesional de gama alta con una perdida de precision acotada en los tensores menos sensibles, aunque el autor no publica ninguna metrica de calidad (perplejidad, KLD ni scores de tareas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con atencion, SSM, torre de vision y capa MTP (multi-token prediction); clase `Glm5NextForConditionalGeneration` |
| Parametros totales | 74.216.266.590 en el checkpoint cuantizado (modelo base: 321.000 millones, segun la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3.0 bpw con codebook MCG en expertos enrutados; bfloat16 en atencion, expertos compartidos, MLP denso, router, embeddings, cabeza de salida, normas y torre de vision; float16 en copias de expertos de la capa MTP; float32 en kernels de convolucion, parametros SSM, tablas de hyper-connection y bias de correccion del router |
| Idiomas soportados | no disponible (smoke test en chino e ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (17 shards, 138,3 GiB) + `model.safetensors.index.json`, `config.json`, tokenizer y processor |

## Arquitectura y entrenamiento

El modelo base es un MoE con 42 capas de mezcla (capas 3 a 44), 288 expertos enrutados por capa y una capa MTP adicional (capa 45) con copias de expertos en float16. El checkpoint incorpora ademas componentes hibridos: parametros SSM, kernels de convolucion, tablas de hyper-connection y una torre de vision con ajustes de video en la configuracion. La cuantizacion EXL3 se aplico solo a las 36.288 proyecciones de expertos enrutados (gate_proj, up_proj, down_proj), que es donde reside la practica totalidad de los parametros.

El proceso de conversion se hizo con `convert.py` de exllamav3 (linea v1.6.0) con los parametros `-b 3.0 -cb mcg -hb 16 -eb 16 -mb 16 -vb 16 -cpi 600`, calibrando con 250 secuencias de 2.048 tokens. En una segunda pasada se conservaron los tensores `.mlp.experts.*` del output cuantizado y se tomaron el resto del checkpoint fuente. La conversion se repartio entre dos maquinas con un esquema bit-exacto (herramienta `exl3-dist-quant`). No se documenta el entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento: smoke test superado en chino e ingles, incluida aritmetica basica.
- Codigo y matematicas: no hay evaluacion publicada; la model card solo confirma pruebas de humo.
- Vision: la configuracion incluye ajustes de vision y video y la torre de vision esta presente, pero el soporte depende del motor de inferencia y no se ha probado.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingue: solo verificado en chino e ingles; el resto de idiomas no esta documentado.
- Decodificacion especulativa: soportada por el motor TensorFold, con ~65% de tasa de aceptacion.

## Casos de uso

- Despliegue de un MoE de gran escala en hardware de gama alta no-datacenter: dos DGX Spark GB10 (2 x 128 GB de memoria unificada) con tensor-parallel 2 sobre enlace directo de 200 Gb/s con RoCE cargan el checkpoint en 176,9 s y decodifican a 33-37 tok/s.
- Prototipado de asistentes conversacionales multilingues (chino/ingles): el modelo puede mantener conversaciones multi-turno, aunque la longitud de contexto no esta documentada y conviene validarla antes de fijar el diseno.
- Investigacion sobre cuantizacion extrema de MoE: sirve como referencia reproducible para estudiar el impacto de 3.0 bpw en expertos enrutados manteniendo atencion en bf16.
- Evaluacion comparativa de motores de inferencia: util para probar motores que soporten `Glm5NextForConditionalGeneration` y el layout EXL3, como TensorFold, y medir latencia y throughput en entornos de dos nodos.
- Servicio interno de bajo coste con licencia permisiva: al ser MIT, puede integrarse en productos propietarios sin obligaciones de copyleft, siempre que se valide la calidad en la tarea concreta.
- Experimentacion multimodal controlada: con la torre de vision presente, se puede explorar entrada de imagen o video si el motor de inferencia lo permite, asumiendo que no esta probado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay perplejidad, KLD ni scores de tareas medidos para este checkpoint. Los unicos datos de rendimiento son de serving en 2x DGX Spark GB10 con TensorFold: carga en 176,9 s, 33-37 tok/s de decodificacion, 0,16-0,26 s de time to first token y ~65% de aceptacion en decodificacion especulativa.

## Requisitos de hardware

- VRAM/memoria estimada: 138,3 GiB de pesos; el autor la dimensiona para 2 x 128 GB de memoria unificada (dos DGX Spark GB10, una GPU cada una) con tensor-parallel 2.
- GPU recomendadas: DGX Spark GB10 (verificado). Para el modelo base de 321B en bf16 harian falta varios nodos con A100/H100 de 80 GB; el checkpoint cuantizado no esta pensado para una sola GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB); requiere al menos dos nodos de memoria unificada grande o un servidor multi-GPU con suficiente VRAM agregada.
- Opciones de despliegue: motor TensorFold (Zig) verificado; no es cargable con Transformers estandar. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,16-0,26 s de TTFT y 33-37 tok/s de decodificacion en la configuracion de dos DGX Spark descrita.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-EXL3-3.0bpw (este) | 74,2B en checkpoint (321B base) | no disponible | EXL3 3.0 bpw en expertos | MIT | Hugging Face |
| internlm/Sage-S2.1-Flash | 321B | no disponible | bf16 | MIT | Hugging Face |
| internlm/Sage-S2.1-Flash-FP8 | 321B | no disponible | FP8 | MIT | Hugging Face |

No se dispone de datos de benchmarks para establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay metricas de calidad publicadas: ni perplejidad, ni KLD, ni scores de tareas. El checkpoint solo ha pasado smoke tests en chino e ingles y aritmetica basica.
- La cuantizacion de expertos es con perdida: el error relativo de Frobenius por capa durante la conversion se mantuvo entre 0,015 y 0,097 en las 45 capas, pero el autor advierte que es un diagnostico interno, no una metrica de calidad.
- No es cargable con Transformers estandar; requiere un motor que soporte `Glm5NextForConditionalGeneration` y el layout EXL3.
- Las lineales no cuantizadas se leen como bfloat16: un build que solo acepte float16 las rechazara.
- La plantilla de chat upstream omite el recordatorio de vision que espera el runtime; hay que servir con una plantilla que lo incluya o desactivar vision.
- El soporte multimodal (vision y video) depende del motor y no se ha probado.
- Sesgos conocidos: no documentados; al no haber evaluacion, no se pueden descartar sesgos del modelo base.
- Riesgo de alucinacion: no medido; sin benchmarks no hay base para estimarlo.
- Licencia MIT permisiva, sin restricciones de uso comercial conocidas, pero la ausencia de validacion desaconseja usarlo en produccion sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/androidli/Sage-S2.1-Flash-EXL3-3.0bpw
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Modelo base en FP8: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Toolkit de cuantizacion: https://github.com/greatyingzi/exl3-dist-quant
- Autor en GitHub: https://github.com/greatyingzi
- Autor en Hugging Face: https://huggingface.co/androidli
- Otros proyectos: https://depthsnap.com/ y https://toolve.net/
