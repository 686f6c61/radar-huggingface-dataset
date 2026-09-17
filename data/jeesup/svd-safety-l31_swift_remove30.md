# Jeesup/svd-safety-l31_swift_remove30

## Resumen

`Jeesup/svd-safety-l31_swift_remove30` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresion mediante la tecnica SVD-LLM, eliminando el 30,00% de los parametros densos y dejando el modelo en una fraccion de parametros resultante de 0,7003 (aproximadamente 8.030 millones de parametros segun el recuento de safetensors). Sobre esa base comprimida se aplico despues una regla de restauracion de componentes SVD con un presupuesto del 0,000% de parametros densos, es decir, cero componentes restaurados y cero componentes sustituidos. El resultado es, en la practica, la celda de un grid experimental en la que la reparacion posterior no anade nada al modelo comprimido.

El modelo lo publica el usuario Jeesup como artefacto de investigacion dentro de un estudio sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad de un LLM y que regla de seleccion de componentes repara mejor ese dano. La model card es explicita: se trata de una celda de un grid sobre reglas de seleccion y presupuestos, y no de un modelo de chat de proposito general. Los tags del repositorio (llama3, svd, compression, safety, interpretability) confirman ese enfoque.

Su relevancia es metodologica mas que de producto: proporciona mediciones concretas de tasa de exito de ataque (ASR) en AdvBench y StrongREJECT, de sobrerrechazo macro medido con WildGuard y de perplejidad en WikiText-2 para una configuracion de compresion concreta, lo que permite cuantificar el intercambio entre seguridad y utilidad bajo compresion. No se han publicado datos de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1) con matrices de pesos comprimidas mediante SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base (no verificado en la informacion del repositorio) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; el tamano de 16,1 GB para ~8,03 B de parametros es consistente con bf16/fp16) |
| Idiomas soportados | no disponible en el repositorio; el modelo base Llama 3.1 declara soporte oficial para 8 idiomas |
| Licencia | Llama 3.1 Community License (incluye `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales de procedencia declarados por el autor: compresion SVD-LLM con 30,00% de parametros eliminados, regla de seleccion `unknown`, presupuesto de restauracion 0,000% de parametros densos, 0 componentes restaurados, 0 componentes sustituidos, fraccion de parametros resultante 0,7003 y semilla 42.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por grupos (GQA), normalizacion RMSNorm y activaciones SwiGLU, entrenado originalmente por Meta con tecnicas de ajuste supervisado y optimizacion por preferencias. Sobre ese checkpoint, este artefacto aplica SVD-LLM, un metodo de compresion que descompone en valores singulares las matrices de pesos de las capas lineales y trunca los componentes de menor energia, reduciendo el numero de parametros densos hasta el 70,03% del original. La model card no especifica si se reentreno o se ajusto el modelo tras el truncamiento.

No se documento en la informacion disponible ningun proceso adicional de RLHF, DPO o afinado especifico sobre el checkpoint comprimido. La segunda etapa del pipeline experimental consiste en restaurar un subconjunto de componentes SVD previamente eliminados; en esta celda el presupuesto de restauracion es del 0,000% y la regla de seleccion figura literalmente como `unknown`, por lo que no hay reparacion efectiva y el checkpoint equivale al resultado puro de la compresion al 70%. No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y continuacion de textos largos, heredadas del modelo base Llama 3.1 8B Instruct, con la degradacion esperable por la compresion.
- Razonamiento basico, matematicas elementales y generacion de codigo: capacidades heredadas del modelo base, pero no evaluadas ni documentadas para este checkpoint.
- Medible en seguridad: el artefacto esta instrumentado para medir tasa de exito de ataques (AdvBench ASR 0,0365; StrongREJECT ASR 0,1022) y sobrerrechazo (macro over-refusal 0,2115 con WildGuard).
- Evaluacion de fidelidad de lenguaje: perplejidad en WikiText-2 de 14,4108, util como indicador de la perdida de calidad por compresion.
- No se documenta soporte de tool calling, function calling, uso agentico ni razonamiento multi-paso en la informacion disponible.
- No se documentan capacidades multimodales, de audio ni modo de pensamiento explicito.
- Capacidades multilingues: no documentadas para este checkpoint; el modelo base declara 8 idiomas.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como punto de referencia del efecto puro de SVD-LLM al 70% de parametros, sin restauracion, para comparar contra otras celdas del mismo grid con presupuestos de restauracion mayores.
- Estudio del intercambio seguridad-utilidad: los valores de ASR en AdvBench y StrongREJECT junto con la perplejidad en WikiText-2 permiten cuantificar cuanto se degrada la alineacion de seguridad al eliminar el 30% de los parametros.
- Analisis de interpretabilidad: al conocer exactamente que componentes SVD fueron truncados y cuales no se restauraron, el checkpoint permite estudiar que subespacios de pesos concentran el comportamiento de rechazo.
- Evaluacion de sobrerrechazo: con la metrica macro over-refusal de WildGuard (0,2115) se puede medir si la compresion vuelve al modelo excesivamente conservador ademas de menos seguro.
- Protocolos de red-teaming reproducibles: la semilla 42 y la configuracion documentada permiten replicar exactamente el mismo sujeto experimental en estudios comparativos.
- Ablaciones de reglas de seleccion de componentes: esta celda, con regla `unknown` y presupuesto 0,000%, es el control de referencia para medir la ganancia de reglas alternativas de seleccion.
- Validacion de pipelines de evaluacion de seguridad: util como sujeto de prueba conocido y barato para verificar que un arnes de evaluacion (HarmBench judge, WildGuard) funciona antes de aplicarlo a modelos mayores.

Advertencia transversal: dado que la propia model card indica que varias celdas del grid estan deliberadamente degradadas en seguridad y que este checkpoint no es un asistente desplegable, ninguno de estos casos de uso debe implicar exposicion a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0365 |
| StrongREJECT ASR (HarmBench judge) | 0,1022 |
| Macro over-refusal (WildGuard) | 0,2115 |
| Perplejidad WikiText-2 | 14,4108 |

No se han publicado en la informacion disponible valores comparativos del modelo base `meta-llama/Llama-3.1-8B-Instruct` ni de otras celdas del grid sobre estas mismas metricas, por lo que no es posible cuantificar el delta de degradacion a partir de los datos proporcionados. Tampoco se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar para este checkpoint.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16 GB solo para pesos, en linea con el tamano de repositorio de 16,1 GB.
- VRAM estimada con cuantizacion de 8 bits: del orden de 8-9 GB para pesos.
- VRAM estimada con cuantizacion de 4 bits: del orden de 5-6 GB para pesos.
- Cache KV a contexto completo: la ventana de 128.000 tokens del modelo base con GQA (8 cabezas KV, 32 capas) implica del orden de 128 KiB por token, es decir, aproximadamente 16 GB adicionales a contexto maximo; a 8.192 tokens serian unos 1 GB. Estimacion orientativa, no medida sobre este checkpoint.
- GPU recomendadas: para fp16 sin cuantizar, A100 40 GB, H100 80 GB o L40S 48 GB. Con cuantizacion de 4 bits cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB).
- Si cabe en GPU de consumo: si, en RTX 4090/3090 en fp16 con contexto moderado, y en GPUs de 8-16 GB con cuantizacion.
- Opciones de despliegue: transformers (formato nativo del repositorio), Text Generation Inference (TGI) y vLLM (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama seria necesario convertir previamente los safetensors a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l31_swift_remove30` | 8,03 B (70,03% del denso) | 128.000 tokens (heredado) | Llama 3.1 Community | Artefacto de investigacion; ASR AdvBench 0,0365, ASR StrongREJECT 0,1022, over-refusal 0,2115, PPL WikiText-2 14,4108 |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Llama 3.1 Community | Modelo base sin comprimir; no dispone de estas metricas de seguridad publicadas en la informacion disponible |
| Otras celdas del grid de Jeesup (misma base, distintos presupuestos de restauracion) | ~8 B o menos segun presupuesto | 128.000 tokens (heredado) | Llama 3.1 Community | No disponibles sus resultados en la informacion proporcionada |

No se dispone de datos suficientes para comparar el rendimiento de tareas generales (razonamiento, codigo, matematicas) con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo de chat de proposito general: la model card lo describe explicitamente como sujeto experimental dentro de un estudio de compresion y seguridad.
- Seguridad degradada por diseno: el autor advierte que la compresion por si sola eleva la tasa de exito de ataques; esta celda, con presupuesto de restauracion 0,000%, no incorpora ninguna reparacion.
- Riesgo de alucinacion incrementado: la eliminacion del 30% de los parametros densos sin reentrenamiento posterior puede degradar la coherencia; la perplejidad de 14,4108 en WikiText-2 es el unico indicador de calidad publicado.
- Regla de seleccion no especificada: el campo `selection rule` figura literalmente como `unknown`, lo que limita la reproducibilidad metodologica del brazo concreto.
- Sin evaluacion de capacidades generales: no hay MMLU, HumanEval, GSM8K ni evaluaciones multilingues publicadas para este checkpoint.
- Idiomas no documentados: no se declara la cobertura linguistica efectiva tras la compresion.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; cualquier uso comercial queda sujeto a sus terminos y a los requisitos de atribucion ("Built with Llama").
- Uso en produccion desaconsejado: la model card recomienda evaluar el checkpoint antes de extraer conclusiones y tratarlo como sujeto experimental, no como asistente desplegable.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_swift_remove30
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community: incluida en el propio repositorio (`LICENSE`, `USE_POLICY.md`)
- Paper de SVD-LLM, repositorio de codigo, demos u otros recursos del autor: no disponibles en la informacion proporcionada. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
