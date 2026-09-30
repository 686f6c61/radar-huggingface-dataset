# davidheineman/opd-teacher-R1Distill-CRT-step149

## Resumen

`davidheineman/opd-teacher-R1Distill-CRT-step149` es un ajuste fino de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, publicado por David Heineman (estudiante de doctorado en Stanford, centrado en preentrenamiento, datos y evaluacion de modelos de lenguaje) dentro de su coleccion de "profesores" para destilacion on-policy (OPD, *on-policy distillation*) sobre entornos RLVE. El modelo tiene 1.777.088.000 parametros (1,78 B), un repositorio de 3,6 GB en formato safetensors y una arquitectura densa tipo transformer decoder-only de la familia Qwen2.

El problema que aborda es muy concreto: generar trayectorias de alta calidad en un unico entorno de razonamiento denominado `CRT`, para usarlas como senal de supervision en experimentos de destilacion on-policy con RL verificable. Se entreno durante 150 pasos (los pesos publicados corresponden al paso 149) con 4 prompts de dificultad 0 y 16 rollouts por paso, sin filtrado de prompts tipo DAPO, y con GRPO como algoritmo de optimizacion.

Su relevancia es fundamentalmente metodologica: forma parte de un experimento de 32 entornos (de un total de 400) disenado para estudiar como se comporta la destilacion on-policy cuando se dispone de pocos datos por entorno. No es un asistente conversacional de proposito general ni un modelo con benchmarks publicados; es un artefacto de investigacion reproducible, con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, segun la etiqueta `qwen2` del repositorio) |
| Parametros totales | 1.777.088.000 (1,78 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha del autor; hereda la configuracion del modelo base |
| Tipos de cuantizacion | no disponible (se publican pesos en safetensors; no se listan variantes GGUF ni AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha del modelo |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,6 GB |
| Modelo base | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B |
| Pasos de entrenamiento | 150 (pesos finales en el paso 149) |
| Algoritmo de RL | GRPO |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only denso de la familia Qwen2, con atencion causal y normalizacion RMSNorm, en configuracion de 1,5 B de parametros (1,78 B contabilizados en los safetensors publicados). El modelo base, `DeepSeek-R1-Distill-Qwen-1.5B`, es a su vez un destilado de DeepSeek-R1 sobre Qwen2.5-1.5B, por lo que el modelo aqui descrito acumula dos etapas de ajuste: la destilacion original de DeepSeek y el entrenamiento RL especifico de este repositorio.

El entrenamiento consiste en 150 pasos de optimizacion sobre prompts del entorno `CRT` con dificultad 0, usando 4 prompts por paso y 16 rollouts por prompt (64 generaciones por paso), con GRPO como algoritmo de politica. La ficha indica explicitamente que no se aplico filtrado de prompts tipo DAPO, un detalle metodologico relevante porque elimina el sesgo de seleccionar unicamente prompts con senal de aprendizaje alta. El proyecto de entrenamiento se identifica como `david-heineman/rl-data-opd-teachers-r1-distil` y el grupo como `opd-teachers-r1-nofilter16-20260929-231458`. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF o DPO adicionales.

El proposito declarado es servir como *teacher* en destilacion on-policy: el modelo se usa para generar distribuciones o trayectorias sobre las que se entrena un *student* en el mismo entorno, en lugar de recurrir a datos estaticos generados offline. La referencia metodologica citada en la coleccion es arXiv:2511.07317, y existe un trabajo complementario (arXiv:2609.04172v1) que estudia el limite de datos minimos en OPD, mostrando que entrenar sobre una sola consulta puede seguir mejorando durante cientos de pasos.

## Capacidades

- Generacion de texto autoregresiva y cadenas de razonamiento (el modelo base es un destilado de razonamiento de DeepSeek-R1).
- Resolucion de tareas del entorno `CRT`: el ajuste RL se realizo exclusivamente sobre prompts de dificultad 0 de ese entorno.
- Generacion de multiples rollouts por prompt, util para muestrear diversidad en destilacion on-policy.
- Produccion de trazas de razonamiento paso a paso hereditarias del modelo base.
- No hay evidencia en la informacion disponible de soporte de tool calling o function calling especifico de este ajuste.
- No hay evidencia de capacidades de agente multi-paso entrenadas especificamente, mas alla del razonamiento encadenado heredado.
- Capacidades multilingues: no disponibles (no se documentan idiomas).
- Capacidades especiales: modo de razonamiento heredado del destilado de R1; sin vision ni audio.

## Casos de uso

- Destilacion on-policy en investigacion: el modelo actua como *teacher* que genera trayectorias sobre prompts del entorno `CRT`, y esas trayectorias se usan para entrenar un *student* de menor coste. Es exactamente el uso para el que fue entrenado.
- Reproduccion de experimentos de RL con recompensas verificables: al publicarse el identificador de grupo de entrenamiento y el numero de pasos, permite replicar o comparar variantes del pipeline (con y sin filtrado DAPO, distinto numero de rollouts).
- Generacion de datos sinteticos para tareas de razonamiento tipo `CRT`: los 16 rollouts por prompt producen un banco de soluciones candidatas que se pueden filtrar por verificador y reutilizar como dataset supervisado.
- Estudio de sobreajuste a un unico entorno: util como caso extremo de especializacion (150 pasos, 4 prompts, un solo entorno) para medir degradacion de capacidades generales frente al modelo base.
- Linea base en comparativas de tecnicas de destilacion: sirve como punto de referencia "environment-specific" frente a profesores generalistas o a profesores entrenados con filtrado de prompts.
- Analisis de alineacion student-teacher: la referencia arXiv:2609.04172 estudia la velocidad a la que el student se alinea con el teacher; este checkpoint es un material directo para ese tipo de medicion.
- Prototipado en una unica GPU de consumo: con 1,78 B de parametros se puede cargar y ejecutar en hardware asequible para experimentos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la coleccion asociada tampoco aporta cifras numericas comparativas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 3,6 GB solo para pesos, mas cache KV; en la practica unos 5-6 GB con contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,8-2,5 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,0-1,5 GB (requiere convertir los pesos, ya que el repositorio solo publica safetensors).
- GPU recomendadas: cualquier GPU con 8 GB o mas. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB son mas que suficientes; tambien cabe en A100, H100 y L40S, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas de VRAM, y en modo cuantizado incluso en equipos con 6 GB.
- Opciones de despliegue: Hugging Face Transformers (ruta directa con los safetensors publicados), vLLM y TGI para servir en bf16, y llama.cpp u Ollama previa conversion a GGUF. No se publican artefactos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd-teacher-R1Distill-CRT-step149 | 1,78 B | no disponible | 150 pasos GRPO sobre entorno `CRT`, sin filtrado DAPO | no disponible | Hugging Face, 0 descargas |
| DeepSeek-R1-Distill-Qwen-1.5B (base) | 1,78 B | no disponible en esta informacion | Destilado de razonamiento de DeepSeek-R1 sobre Qwen2.5-1.5B | no disponible en esta informacion (el modelo original se distribuye habitualmente bajo licencia MIT) | Ampliamente disponible en Hugging Face |
| opd-teacher-Q2.5I-Differentiate-step149 | ~1,5 B | no disponible | 150 pasos sobre el entorno `Differentiate`, misma coleccion RLVE | no disponible | Hugging Face y Featherless AI |
| Qwen2.5-1.5B-Instruct | ~1,5 B | no disponible en esta informacion | Ajuste por instrucciones de Qwen | no disponible en esta informacion | Ampliamente disponible |

No se dispone de cifras de rendimiento para ninguno de los modelos de la comparativa dentro de la informacion proporcionada, por lo que la comparacion se limita a parametros, procedencia y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: el modelo se entreno unicamente sobre prompts de dificultad 0 del entorno `CRT` durante 150 pasos. Es previsible un sobreajuste severo al formato y a la distribucion de ese entorno, con degradacion de capacidades generales respecto al modelo base.
- No es un asistente de proposito general: no se documento ni se valido para conversacion abierta, redaccion, codigo o tareas fuera del entorno de entrenamiento.
- Sesgos conocidos: no disponibles. Al ser un derivado del modelo base, hereda los sesgos de Qwen2.5 y de la destilacion de DeepSeek-R1, pero no se documenta ningun analisis al respecto.
- Riesgo de alucinacion: no evaluado en la informacion disponible; como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos, especialmente fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la ficha del autor.
- Restricciones de licencia: la ficha indica "no disponible". Antes de cualquier uso comercial hay que verificar la licencia efectiva del modelo derivado y la del modelo base, ya que la ausencia de declaracion explicita impide asumir permisos de uso.
- Caveat de produccion: con 0 descargas, 0 likes y sin benchmarks publicados, no hay validacion externa de calidad o estabilidad. No se recomienda su uso en produccion; su ambito natural es la investigacion y la reproducibilidad.
- Caveat de reproducibilidad: la ficha identifica el proyecto y el grupo de entrenamiento, pero no detalla hiperparametros completos (tasa de aprendizaje, regularizacion KL, configuracion de muestreo), lo que limita la replicacion exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/opd-teacher-R1Distill-CRT-step149
- Coleccion RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Perfil del autor en Hugging Face: https://huggingface.co/davidheineman
- Sitio web del autor: https://davidheineman.com/
- Modelo base DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo hermano de la coleccion (entorno `Differentiate`): https://featherless.ai/models/davidheineman/opd-teacher-Q2.5I-Differentiate-step149
- Paper de referencia de los entornos RLVE: https://arxiv.org/abs/2511.07317
- Paper sobre destilacion on-policy con datos minimos: https://arxiv.org/pdf/2609.04172v1
