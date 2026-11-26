# Jeesup/svd-safety-l3_svdllmjbbk1sep94_r40

## Resumen

svd-safety-l3_svdllmjbbk1sep94_r40 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante SVD-LLM hasta conservar el 60,0 % de los parametros densos (fraccion resultante 0,5998, es decir, un 40,00 % de parametros eliminados) y posteriormente recuperado con la etapa 2 de SVD-LLM, que aplica LoRA secuencial sobre U y luego sobre V. Lo publica el usuario Jeesup como artefacto de investigacion sobre como la compresion por descomposicion en valores singulares degrada el comportamiento de seguridad y que regla de seleccion de componentes lo repara mejor.

No es un modelo conversacional de proposito general: es una celda concreta de una rejilla experimental que cruza reglas de seleccion y presupuestos de compresion. El conjunto de calibracion combina utilidad (WikiText-2) y seguridad (94 objetivos de JailbreakBench con las negativas del propio Llama-3-8B-Instruct), con una cuota efectiva de seguridad de solo 0,0047 de las posiciones. Su interes es metodologico: permite medir el compromiso entre utilidad y seguridad bajo compresion con metricas reproducibles (ASR en AdvBench y StrongREJECT, sobrerrechazo en WildGuard, perplejidad en WikiText-2 y precision zero-shot en 7 tareas).

La arquitectura subyacente es la de Llama 3 8B Instruct (transformer denso, decoder-only), con 8.030.261.248 parametros totales segun los pesos safetensors del repositorio, licencia Meta Llama 3 Community y soporte en transformers y text-generation-inference. El repositorio ocupa 16,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3), comprimido por SVD-LLM con recuperacion LoRA |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3 8B Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | llama3 (Meta Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso de 8B parametros, y le aplica la compresion SVD-LLM de los autores (AIoT-MLSys-Lab/SVD-LLM) usando su SVD blanqueada. La matriz de calibracion se construye como suma de dos terminos: S·S^T = suma sobre WikiText-2 de x·x^T mas suma sobre el conjunto de seguridad de x·x^T. El componente de utilidad emplea el train de WikiText-2 con 255 ventanas de 2048 tokens (muestreo de SVD-LLM, semilla 42) y todas las posiciones; el de seguridad usa los primeros 94 de 94 objetivos de JailbreakBench con las negativas generadas por el propio Llama-3-8B-Instruct (orden con semilla 42), recortando la respuesta al primer token, con una conversacion por muestra sin empaquetar (2457 posiciones, todas contabilizadas). La cuota efectiva de seguridad resulta de 0,0047 de las posiciones.

Tras eliminar el 40,00 % de los parametros (fraccion retenida 0,5998), se aplica la etapa 2 de SVD-LLM: LoRA secuencial primero sobre U y despues sobre V, entrenado con alpaca-cleaned, r=8, alpha=16, 2 epocas, learning rate 1e-4, batch 64, cutoff 256 y precision bf16, con semilla 42. No se documenta en la informacion disponible el numero total de tokens de preentrenamiento del modelo base ni si hubo RLHF o DPO adicionales mas alla del alineamiento original de Llama 3 Instruct.

## Capacidades

- Generacion de texto conversacional y multi-turno, heredada del modelo base Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones en el rango propio de un modelo de 8B, condicionado por la perdida de calidad introducida por la compresion.
- Generacion de codigo y matematicas basicas, sin garantias de rendimiento medidas en esta ficha.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor advierte explicitamente que no es un asistente desplegable.
- Capacidades multilingues: no declaradas en la model card.
- Capacidad especial: ninguna propia; es un sujeto experimental para estudiar seguridad bajo compresion, no un modelo con modos especiales (thinking, vision, audio).

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como celda de control en estudios que comparan reglas de seleccion de componentes SVD y presupuestos de compresion, midiendo el efecto sobre ASR y perplejidad.
- Analisis de seguridad bajo compresion: permite cuantificar cuanto sube la tasa de exito de ataque (AdvBench ASR 0,0250; StrongREJECT ASR 0,0575) al eliminar el 40 % de parametros y como afecta la calibracion con datos de seguridad.
- Evaluacion de sobrerrechazo: con una macro de sobrerrechazo de 0,2158 medida con WildGuard, es util para estudiar el equilibrio entre rechazar peticiones daninas y rechazar peticiones legitimas.
- Reproducibilidad de pipelines SVD-LLM: el repositorio documenta semilla, conjunto de calibracion y hiperparametros de la etapa LoRA, lo que facilita replicar el experimento con otras celdas de la rejilla.
- Estudio de la cuota de calibracion: con una cuota efectiva de seguridad de solo 0,0047 de las posiciones, permite analizar la sensibilidad del resultado a la mezcla utilidad/seguridad en la calibracion.
- Comparacion de metricas de utilidad: la perplejidad de 27,4012 en WikiText-2 y la precision media zero-shot de 0,4957 en 7 tareas sirven como referencia para contrastar otras variantes comprimidas del mismo modelo base.
- Docencia y auditoria de artefactos: util como ejemplo de model card que documenta procedencia, calibracion y limitaciones de un checkpoint derivado con licencia Llama 3.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0250 |
| StrongREJECT ASR (juez HarmBench) | 0,0575 |
| Macro sobrerrechazo (WildGuard) | 0,2158 |
| Perplejidad WikiText-2 | 27,4012 |
| Precision media zero-shot (7 tareas, acc_norm donde se reporta) | 0,4957 |

No se han publicado en la informacion disponible resultados comparativos frente a Llama-3-8B-Instruct sin comprimir ni frente a otras celdas de la rejilla; los valores anteriores son los unicos medidos y documentados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03B parametros), mas overhead de activaciones y cache KV; el repositorio ocupa 16,1 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits, aproximadamente 4,5-5,5 GB, aunque no se publican variantes cuantizadas en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en bf16 con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en bf16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB o menos seria necesario cuantizar, opcion no documentada por el autor.
- Opciones de despliegue: transformers, text-generation-inference (el modelo declara endpoints_compatible); vLLM, llama.cpp u Ollama no estan documentados en la informacion disponible y requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l3_svdllmjbbk1sep94_r40 | 8,03B (60 % denso) | no disponible | llama3 | Hugging Face, 0 descargas | Artefacto de investigacion, no desplegable |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | no disponible en esta ficha | llama3 | Hugging Face, ampliamente usado | Base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla SVD-LLM del autor | ~8,03B con distintos presupuestos | no disponible | llama3 | no disponible | Variantes con reglas de seleccion y presupuestos distintos |

No se dispone en la informacion proporcionada de comparaciones con otros modelos comprimidos de terceros (por ejemplo, variantes podadas de Llama 3) ni de cifras de rendimiento de los alternativas en las mismas metricas.

## Limitaciones y advertencias

- El autor advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct: la compresion por si sola eleva la tasa de exito de ataque.
- No es un modelo de proposito general ni un asistente desplegable; debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Riesgo de alucinacion y de perdida de calidad por la eliminacion del 40 % de parametros; la perplejidad en WikiText-2 (27,4012) debe compararse con la del modelo base antes de usarlo en produccion.
- La calibracion de seguridad cubre solo 94 objetivos de JailbreakBench con respuestas de un token, con una cuota efectiva de 0,0047 de las posiciones; la cobertura de comportamientos peligrosos es limitada.
- Sobrerrechazo medido de 0,2158 (WildGuard), que puede traducirse en negativas a peticiones legitimas.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingue equivalente al del modelo base.
- Licencia Meta Llama 3 Community: el uso comercial y la redistribucion estan sujetos a LICENSE y USE_POLICY.md incluidos en el repositorio, con las obligaciones de atribucion ("Built with Meta Llama 3").
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_svdllmjbbk1sep94_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Repositorio SVD-LLM citado por el autor: https://github.com/AIoT-MLSys-Lab/SVD-LLM
- Licencia Meta Llama 3: incluida en el repositorio del modelo (LICENSE y USE_POLICY.md)
