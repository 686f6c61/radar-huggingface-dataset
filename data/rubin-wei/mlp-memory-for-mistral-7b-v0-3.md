# Rubin-Wei/MLP-Memory-for-Mistral-7B-v0.3

## Resumen

MLP-Memory-for-Mistral-7B-v0.3 es una rama de memoria MLP entrenada para inferencia conjunta con el modelo base Mistral-7B-v0.3. Lo desarrolla el usuario Rubin-Wei y se publica como un complemento que no funciona de forma autonoma: el repositorio contiene unicamente la rama de memoria, mientras que el modelo base debe descargarse por separado desde mistralai/Mistral-7B-v0.3.

La rama implementa una arquitectura de aumento de memoria compuesta por 8 bloques MLP residuales con tamano oculto de 4096 e intermedio de 14336, sobre un vocabulario de 32768 tokens. Su entrada es la activacion de la ultima capa feed-forward del modelo base, y produce una distribucion sobre el vocabulario que se combina con la del modelo base mediante una interpolacion lineal ponderada por el parametro lambda y una temperatura de memoria ajustable.

El interes de esta publicacion es metodologico: propone una via para inyectar memoria adicional en un LLM congelado sin reentrenar el modelo completo, a coste de 1.543.540.736 parametros adicionales en FP32. Es un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni licencia declarada, por lo que su adopcion en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 8 bloques MLP residuales (rama de memoria) sobre Mistral-7B-v0.3; hidden size 4096, intermediate size 14336 |
| Parametros totales | 1.543.540.736 (solo la rama de memoria; el modelo base Mistral-7B-v0.3 se descarga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Mistral-7B-v0.3, no especificada en la model card) |
| Tipos de cuantizacion | no disponible; los pesos se publican en FP32 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards, FP32) |
| Vocabulario | 32768 tokens |
| Codigo personalizado | si (`memory.py` con `MemoryAdapter` y `NeuralMistralMLPModel`) |
| Tamano del repositorio | 6,2 GB |

## Arquitectura y entrenamiento

La rama de memoria es una red de 8 bloques MLP residuales con dimension oculta de 4096 y dimension intermedia de 14336, que toma como consulta la entrada de la ultima capa feed-forward del modelo base Mistral-7B-v0.3. La salida es una distribucion sobre el vocabulario de 32768 tokens. La inferencia conjunta se realiza combinando las probabilidades del modelo base y de la memoria: `p_joint = (1 - lambda) * p_base + lambda * p_memory`, con `p_memory = softmax(memory_logits / memory_temperature)`. Los valores de lambda y de temperatura deben elegirse por tarea.

El modelo base permanece congelado y su salida forward no se modifica; el adaptador calcula la rama de memoria en FP32. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se describe ninguna innovacion adicional como decodificacion especulativa o atencion lineal. Los dos shards de pesos publicados son identicos al checkpoint evaluado, y la configuracion omite la ruta original del sistema de ficheros local.

## Capacidades

- Prediccion de distribucion de siguiente token en combinacion con Mistral-7B-v0.3, no de forma autonoma.
- Aumento de memoria sobre el modelo base sin reentrenarlo, mediante interpolacion de probabilidades.
- Ajuste fino del comportamiento mediante los hiperparametros lambda y memory temperature.
- Uso previsto en evaluacion downstream de clasificacion, segun la model card (requiere prompts de tarea, label words y calibracion).
- Idioma: ingles unicamente.
- No soporta tool calling, function calling ni agentes de forma nativa por si misma; dependeria de las capacidades del modelo base.
- No es un modelo causal standalone: no debe cargarse con `AutoModelForCausalLM`.
- No se declaran capacidades de vision, audio ni modo thinking.

## Casos de uso

- Investigacion sobre aumento de memoria en LLM congelados: permite estudiar como una rama MLP externa modifica la distribucion de siguiente token sin tocar los pesos de Mistral-7B-v0.3, util para experimentos academicos sobre memorizacion e inyeccion de conocimiento.
- Evaluacion de clasificacion downstream: la model card menciona explicitamente este escenario, con prompts de tarea, label words y calibracion; el adaptador devuelve probabilidades que pueden mapearse a etiquetas.
- Experimentos de calibracion de incertidumbre: la combinacion ponderada por lambda y temperatura permite analizar como varia la confianza del modelo al mezclar dos distribuciones.
- Prototipado de tecnicas de adaptacion ligera: sirve como referencia para comparar con LoRA, adapters o prefix tuning en terminos de coste de parametros (1,54 mil millones adicionales) y efecto sobre la salida.
- Analisis de sesgo y fidelidad en generacion: al poder aislar la contribucion de la rama de memoria frente a la del modelo base, facilita estudios de atribucion de errores y alucinaciones.
- Base para desarrollo de memorias externas en asistentes de dominio: en un entorno de investigacion, podria evaluarse si la rama mejora la recuperacion de hechos especificos en dominios cerrados en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Mistral-7B-v0.3 en FP16 requiere aproximadamente 14-15 GB; la rama de memoria en FP32 anade unos 6,2 GB, por lo que la inferencia conjunta en precision mixta ronda los 20-22 GB de VRAM.
- GPU recomendadas: A100 (40 GB o 80 GB), H100, L40S o RTX A6000 para trabajar con holgura; una RTX 4090 de 24 GB queda al limite y puede requerir cuantizacion del modelo base.
- Cabe en GPU de consumo: posiblemente en RTX 4090 (24 GB) si se cuantiza el modelo base a 8 bits o 4 bits; no cabe en GPUs de 16 GB o menos sin cuantizacion agresiva.
- Opciones de despliegue: el adaptador esta disenado para PyTorch 2.4.0 / CUDA 12.1 y Transformers 4.47.0, con carga via `MemoryAdapter` o `NeuralMistralMLPModel`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MLP-Memory-for-Mistral-7B-v0.3 | 1.543.540.736 (rama) + 7B (base) | no disponible | Rama de memoria MLP sobre Mistral-7B-v0.3 | no disponible | Hugging Face, 0 descargas |
| Mistral-7B-v0.3 (modelo base) | 7B | 32.768 tokens (segun documentacion de Mistral) | LLM causal denso | Apache 2.0 (segun Mistral) | Ampliamente disponible |
| LoRA / adapters sobre Mistral-7B | Tipicamente decenas de millones | Heredado del base | Adaptacion de bajo rango | Variable | Ampliamente disponible |

La comparacion directa con LoRA no es equivalente en proposito: la rama MLP anade una distribucion de vocabulario paralela, mientras que LoRA modifica los pesos del modelo. No se dispone de benchmarks que permitan comparar rendimiento entre ambas aproximaciones para este checkpoint concreto.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Mistral-7B-v0.3 y el codigo personalizado `memory.py`; cargarlo con `AutoModelForCausalLM` no funciona.
- Licencia no declarada: no hay autorizacion explicita para uso comercial, lo que impide su adopcion en produccion sin aclaracion del autor.
- Solo ingles: no se declaran capacidades multilingues.
- Cero descargas y cero likes: sin validacion externa ni senales de uso comunitario.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base.
- Requiere ajuste manual de lambda y temperatura por tarea, ademas de prompts, label words y calibracion en clasificacion.
- Riesgo de alucinacion heredado del modelo base y potencialmente alterado por la mezcla de distribuciones; no cuantificado.
- Sesgos: no documentados por el autor; se heredan los del modelo base.
- Entorno de ejecucion muy especifico (PyTorch 2.4.0, CUDA 12.1, Transformers 4.47.0) que puede complicar la integracion en stacks existentes.
- Sin soporte documentado para servidores de inferencia estandar (vLLM, TGI, llama.cpp).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rubin-Wei/MLP-Memory-for-Mistral-7B-v0.3
- Modelo base Mistral-7B-v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
