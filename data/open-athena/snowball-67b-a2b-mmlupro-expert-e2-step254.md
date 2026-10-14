# open-athena/Snowball-67B-A2B-MMLUPro-Expert-E2-Step254

## Resumen

Snowball-67B-A2B-MMLUPro-Expert-E2-Step254 es un checkpoint de investigación publicado por el colectivo open-athena dentro del proyecto Marin. Se trata de un ajuste fino supervisado (SFT) completo del modelo base open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (denominado "student B"), entrenado específicamente sobre 1.359 trazas correctas de MMLU-Pro generadas por GLM 5.3. Forma parte del "experimento de transferencia de dos expertos" de Marin, en el que se especializa un mismo estudiante en dos dominios distintos (expertos E y E₂) para estudiar la transferencia de conocimiento.

El modelo tiene 67.078.882.816 parámetros totales en formato safetensors (134,2 GB de repositorio, lo que corresponde a pesos en bf16). La nomenclatura "67B-A2B" y la etiqueta `grug_moe` indican una arquitectura de mezcla de expertos (MoE) con aproximadamente 2.000 millones de parámetros activos por token, aunque la model card no desglosa esa cifra de forma explícita. La evaluación se realizó con un contexto de 32.768 tokens, modo "thinking" activado y un límite de generación de 30.720 tokens.

Su relevancia es fundamentalmente metodológica: es un artefacto de ablación que documenta con precisión inusual la receta de entrenamiento, el coste de cómputo (60,6 horas de H100 sobre 32 H100) y las puntuaciones de un evaluador congelado, lo que permite auditar y reproducir el efecto de la destilación selectiva sobre un subconjunto de MMLU-Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos); etiqueta `grug_moe` en HuggingFace. Detalle de capas y atencion: no disponible |
| Parametros totales | 67.078.882.816 (≈67,1 mil millones) |
| Parametros activos | ≈2B por token, inferido de la nomenclatura "A2B"; no confirmado en la model card |
| Longitud de contexto | 32.768 tokens empleados en la evaluacion; longitud maxima nativa no especificada |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en precision completa bf16) |
| Idiomas soportados | no disponible (no se declaran; el tokenizer se hereda del modelo base sin cambios) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards), mas `config.json`, `generation_config.json`, ficheros de tokenizer y `chat_template.jinja` |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de las etiquetas `grug_moe` y `snowball`. La nomenclatura del identificador (67B-A2B) es consistente con un transformer disperso tipo MoE de 67.000 millones de parametros totales y del orden de 2.000 millones activos por token. El tokenizer y la plantilla de chat son los del modelo base B y no se han modificado.

El entrenamiento es un SFT completo sobre 1.359 trazas correctas de MMLU-Pro procedentes de GLM 5.3, tomadas de un subconjunto estratificado por categoria de 1.606 documentos de test (muestreo con semilla y proporcional por categoria). Los otros 10.426 documentos de MMLU-Pro se reservaron como sonda de generalizacion (held-out). La receta es identica a la del experto E: optimizador AdamH con betas 0,9/0,95, learning rate 1e-5, 3 % de warmup seguido de decaimiento coseno, 3 epocas completas (254 actualizaciones con batch de 16), optimizador reinicializado y sesgo del router congelado durante el ajuste. Las etiquetas se reasociaron al test de TIGER-Lab/MMLU-Pro (commit b189ec76) mediante coincidencia exacta de pregunta y opciones ordenadas. El coste total fue de 60,6 horas de H100 sobre 32 GPU H100 (CoreWeave cw-rno2a, ejecucion Iris `/karan/task157-e2-sft-20261009`).

## Capacidades

- Generacion de texto y razonamiento de cadena larga en modo "thinking" (hasta 30.720 tokens de generacion en la configuracion de evaluacion).
- Razonamiento matematico y aritmetico: GSM8K 93,9 y MATH500 90,4 en el evaluador congelado.
- Resolucion de preguntas de conocimiento amplio y multidisciplinar: MMLU-Pro 64,3 en el conjunto completo.
- Razonamiento cientifico de nivel posgrado: GPQA-D 47,6.
- Seguimiento de instrucciones: IFEval en modo instruccion estricta 80,2.
- Evaluacion de expresiones y prediccion de salida de codigo: CruxEval 54,5 / 52,9 (sin entrenamiento especifico en esa tarea).
- Capacidad multilingue: no disponible (no declarada).
- Soporte de tool calling o function calling: no disponible (no se menciona en la model card).
- Soporte de agentes o razonamiento multi-paso explicito: no disponible como funcionalidad documentada; el modo thinking permite cadenas de razonamiento extensas.
- Vision, audio u otras modalidades: no disponible.
- Especializacion en dominios: ajustado especificamente para el formato de preguntas de opcion multiple de MMLU-Pro.

## Casos de uso

- Investigacion sobre destilacion selectiva: el checkpoint permite medir cuanto conocimiento de un profesor (GLM 5.3) se transfiere a un estudiante MoE de 67B ajustando solo 254 actualizaciones sobre 1.359 ejemplos, con la comparacion pareada frente al modelo base ya registrada en el informe del experimento.
- Auditoria de experimentos de transferencia entre expertos: al compartir receta con el experto E, sirve para estudiar interferencia o sinergia entre dominios cuando un mismo estudiante se especializa en dos tareas distintas.
- Benchmarking de evaluadores congelados: las puntuaciones se obtuvieron con Evalchemy (commit ae362881) sobre vLLM en 8x H100, por lo que el modelo es un banco de pruebas reproducible para comparar versiones de harness de evaluacion.
- Razonamiento matematico asistido: con GSM8K 93,9 y MATH500 90,4 puede emplearse como generador de soluciones paso a paso en pipelines de verificacion formal o de generacion de datos de entrenamiento para modelos menores.
- Generacion de trazas de razonamiento para destilacion downstream: sus cadenas de pensamiento largas son material util para construir datasets de destilacion hacia modelos mas pequenos, aunque deben filtrarse por correccion.
- Investigacion sobre routing en MoE: al mantener el sesgo del router congelado durante el SFT, el checkpoint es adecuado para analizar como se reorganizan las activaciones de expertos tras un ajuste de dominio estrecho.
- Evaluacion comparativa de contexto largo en razonamiento: el uso de 32.768 tokens de contexto y 30.720 de generacion permite estudiar degradacion de calidad en cadenas de pensamiento muy extensas.
- Reproduccion academica de recetas SFT: la model card documenta learning rate, optimizador, warmup, epocas, batch y horas de GPU, lo que facilita replicas exactas en otros clústeres.

## Benchmarks y rendimiento

Resultados con evaluador congelado (Evalchemy ae362881, vLLM en 8x H100, contexto de 32.768 tokens, limite de generacion de 30.720 tokens, thinking activado, muestreo sin semilla a temperatura 1,0). La columna "B" corresponde al modelo base open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92.

| Benchmark | Expert E2 (step 254) | Base B | Diferencia |
|---|---|---|---|
| MMLU-Pro, subconjunto (1.606 docs) | 66,4 | 44,5 | +21,9 |
| MMLU-Pro, held-out (10.426 docs) | 64,0 | 44,1 | +19,9 |
| MMLU-Pro, completo | 64,3 | no disponible | no disponible |
| CruxEval | 54,5 / 52,9 | 55,4 / 57,8 | -0,9 / -4,9 |
| GSM8K | 93,9 | no disponible | no disponible |
| MATH500 | 90,4 | no disponible | no disponible |
| GPQA-D | 47,6 | no disponible | no disponible |
| IFEval (instruction-strict) | 80,2 | 81,1 | -0,9 |

Nota: el subconjunto de MMLU-Pro sobre el que se entreno forma parte del test oficial, por lo que la cifra de 66,4 no debe interpretarse como generalizacion. La referencia honesta de generalizacion es el held-out (64,0). CruxEval no formaba parte del entrenamiento.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 134 GB solo de pesos (coincide con el tamano de repositorio de 134,2 GB). La cache KV a 32.768 tokens de contexto anade varios GB adicionales por secuencia.
- Inferencia en bf16: minimo 2x H100 80 GB (160 GB) o 4x A100 40 GB. La evaluacion oficial se ejecuto con vLLM sobre 8x H100, configuracion holgada que permite paralelismo de tensor y mayor throughput.
- Cuantizacion de 8 bits: alrededor de 67 GB de pesos; cabe en una H100 80 GB o en 2x A6000 48 GB. Requiere un runtime con soporte de cuantizacion para MoE.
- Cuantizacion de 4 bits: alrededor de 34-37 GB de pesos; cabria en 2x RTX 4090 24 GB (48 GB) o en una GPU unica de 48 GB (A6000 Ada, L40S). No cabe en una GPU consumer de 24 GB ni en una de 32 GB con margen para cache KV a contexto largo. Estos valores son estimaciones derivadas del numero de parametros, no cifras publicadas por el autor.
- Cabe en GPU consumer: en bf16 no. Solo con cuantizacion agresiva de 4 bits y reparto en dos RTX 4090.
- Opciones de despliegue: vLLM es la via validada (usada en la evaluacion). llama.cpp, Ollama o TGI no estan documentados para este checkpoint; requeririan conversion a GGUF y verificacion del soporte de arquitectura MoE.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 2B parametros activos, el coste por token generado es bajo en comparacion con un denso de 67B, pero la ocupacion de memoria sigue dominada por los pesos totales.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de otros modelos de la misma categoria mas alla del propio modelo base. La tabla siguiente recoge unicamente comparaciones sustentadas en datos disponibles.

| Modelo | Parametros | Contexto | MMLU-Pro (held-out) | CruxEval | IFEval strict | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Snowball-67B-A2B-MMLUPro-Expert-E2-Step254 | 67,1B totales (≈2B activos) | 32.768 tokens en evaluacion | 64,0 | 54,5 / 52,9 | 80,2 | Apache 2.0 | HuggingFace |
| Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (base B) | 67,1B totales (≈2B activos) | no disponible | 44,1 | 55,4 / 57,8 | 81,1 | no disponible en la informacion facilitada | HuggingFace |
| Snowball-67B-A2B-MMLUPro-Expert-E (experto E, misma receta) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card |
| Otros modelos comparables (por ejemplo densos de ~70B) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contaminacion de test: el ajuste se realizo sobre 1.606 documentos que forman parte del test oficial de MMLU-Pro ("training-is-test" para ese subconjunto). Las cifras sobre ese subconjunto no son validas como medida de generalizacion.
- Regresion en tareas no entrenadas: CruxEval cae de 55,4/57,8 a 54,5/52,9 e IFEval strict baja de 81,1 a 80,2 respecto al modelo base. El ajuste estrecho sobre MMLU-Pro parece degradar ligeramente el seguimiento de instrucciones y el razonamiento sobre codigo.
- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o equidad para este checkpoint.
- Riesgo de alucinacion: no cuantificado. El modo thinking con generaciones de hasta 30.720 tokens incrementa la probabilidad de cadenas de razonamiento largas y plausibles pero incorrectas, especialmente fuera del dominio de MMLU-Pro.
- Limitaciones de idioma: no se declara soporte multilingue. El tokenizer se hereda del modelo base y no se ha documentado su cobertura linguistica.
- Uso comercial: la licencia del checkpoint es Apache 2.0, pero el modelo base y las trazas de destilacion proceden de terceros (Snowball student B y GLM 5.3). Conviene verificar las condiciones de uso y redistribucion de las salidas del profesor utilizadas como etiquetas antes de un despliegue comercial.
- Naturaleza de artefacto de investigacion: es un checkpoint intermedio (step 254) de un experimento de ablacion, sin pipeline declarado, sin descargas ni validacion externa, y sin garantias de robustez en produccion.
- Ausencia de soporte documentado de tool calling y de plantillas de agente: cualquier integracion de ese tipo requeriria validacion propia.
- Seleccion de decodificacion: las puntuaciones se obtuvieron con muestreo sin semilla a temperatura 1,0, por lo que la reproducibilidad exacta de los numeros no esta garantizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-MMLUPro-Expert-E2-Step254
- Modelo base (student B) en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92
- Commit exacto del modelo base usado: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Dataset de evaluacion MMLU-Pro (TIGER-Lab, commit b189ec76): https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Evaluador Evalchemy (commit ae362881): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Informe del experimento (issue de Marin con comparaciones pareadas y contabilidad de horas de GPU): https://github.com/marin-community/marin/issues/9984
- Comentario con el informe detallado: https://github.com/marin-community/marin/issues/9984#issuecomment-6144923850
- Ruta de origen de los pesos en S3: s3://marin-us-east-02a/marin/experiments/task157-e2/checkpoints/karan/e2-mmlupro-step92-lr1e-05/2026.10.09.1/hf/step-254
- Trabajo de entrenamiento: /karan/task157-e2-sft-20261009 (Iris, CoreWeave cw-rno2a)
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los enlaces obtenidos (OpenAI, Open University, Open.global, Open.online) no guardan relacion con el checkpoint.
