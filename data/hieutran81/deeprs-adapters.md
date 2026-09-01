# hieutran81/deeprs-adapters

## Resumen

deeprs-adapters es un repositorio de 120 adaptadores LoRA entrenados sobre el modelo base Qwen/Qwen3-8B, publicado por Hieu Tran (hieutran81) como artefacto de investigacion. El proyecto estudia que aporta el aprendizaje por refuerzo cuando se entrena un modelo de lenguaje para analizar datos cientificos, concretamente en el dominio de la genomica estadistica. El adaptador principal, tenrl-step150-lora, alcanza una puntuacion de 0.994 en los diez problemas publicos de GeneBench-Pro, frente al 0.014 del modelo base sin entrenar y al 36% del mejor sistema frontier publicado en esa misma particion.

La publicacion incluye no solo el adaptador ganador, sino todos los brazos experimentales: modelos leave-one-family-out para estudiar transferencia, cuatro corpora de control para estudiar olvido y multiples semillas para medir estabilidad. Esta decision permite verificar de forma independiente los resultados negativos y las comparaciones que sustentan las conclusiones del articulo. La licencia es Apache 2.0 y el codigo esta disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | no disponible (modelo base: 8B) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | safetensors (adaptadores LoRA); no se documentan cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors via PEFT |

## Arquitectura y entrenamiento

Todos los adaptadores son LoRA sobre Qwen/Qwen3-8B, un transformer decoder-only de 8.000 millones de parametros, salvo aquellos cuyo nombre indica 14b. El entrenamiento combina dos fases: un ajuste fino supervisado (SFT) sobre diez familias de problemas de genomica estadistica (adaptador qwen3-8b-tenfam-lora), seguido de aprendizaje por refuerzo (adaptador tenrl-step150-lora) que constituye el modelo principal. Existe una segunda semilla independiente (qwen3-8b-tenfam2-lora) que alcanza 0.963 frente a 0.959, lo que sugiere estabilidad en la fase de SFT.

El repositorio incluye ademas adaptadores para brazos de control: leave-one-family-out (lofov) para evaluar transferencia a familias no vistas, tres corpora de control nombrados (wrangle, plainqa, causalonly) para estudiar olvido, y replicas con distintas semillas (s2, s3, etc.) para la tabla de varianza. Las afirmaciones centrales del articulo se sostienen en comparaciones entre estos brazos: los modelos leave-one-out rinden por debajo del base sin entrenar, y corpora identicos producen resultados de 0.029 o 0.341 segun la semilla.

## Capacidades

- Analisis de problemas de genomica estadistica: el adaptador principal resuelve los diez problemas publicos de GeneBench-Pro con una puntuacion media de 0.994, con 8 de 10 problemas resueltos exactamente con 1.000 sobre 256 rollouts cada uno.
- Razonamiento cientifico multi-paso: el entrenamiento con RL habilita cadenas de razonamiento que el modelo base sin entrenar no produce (0.014 frente a 0.994).
- Capacidad de agente: la evaluacion con 256 rollouts por problema implica generacion iterativa con exploracion de multiples trayectorias.
- Comparacion experimental: los 120 adaptadores permiten estudiar el efecto del RL frente a SFT, la transferencia entre familias y la estabilidad entre semillas.
- Reproducibilidad: el repositorio incluye un indice de resultados que recalcula cada cifra publicada, accesible desde el repositorio de codigo.

## Casos de uso

- Investigacion en genomica estadistica: el adaptador principal puede analizar problemas del benchmark GeneBench-Pro con alta precision, sirviendo como referencia para nuevos metodos en el dominio.
- Validacion de resultados cientificos: los adaptadores de control permiten verificar afirmaciones sobre transferencia negativa y olvido, algo critico en investigacion reproducible.
- Estudio de metodos de RL: los brazos experimentales (SFT frente a SFT+RL, distintas semillas) proporcionan un banco de pruebas para comparar estrategias de entrenamiento.
- Benchmarking de agentes cientificos: el modelo puede integrarse en pipelines de evaluacion que requieran analisis de datos con multiples intentos (rollouts), gracias a su capacidad de generacion iterativa.
- Educacion en bioinformatica: los adaptadores y el codigo asociado sirven como caso de estudio de como aplicar RL a dominios cientificos especializados.
- Desarrollo de pipelines de analisis automatizado: el modelo base Qwen3-8B con los adaptadores puede desplegarse en entornos de investigacion para tareas de analisis de datos geneticos.

## Benchmarks y rendimiento

El model card reporta resultados en los diez problemas publicos de GeneBench-Pro:

| Modelo | Puntuacion media (GeneBench-Pro) |
|---|---|
| tenrl-step150-lora (SFT + RL) | 0.994 |
| qwen3-8b-tenfam2-lora (SFT, segunda semilla) | 0.963 |
| qwen3-8b-tenfam-lora (SFT) | 0.959 |
| Modelo base Qwen3-8B sin entrenar | 0.014 |
| Mejor sistema frontier publicado | 0.36 |

Notas: 8 de 10 problemas se resuelven con puntuacion exacta de 1.000 sobre 256 rollouts. Los modelos leave-one-family-out rinden por debajo del base sin entrenar. La varianza entre semillas identicas oscila entre 0.029 y 0.341.

## Requisitos de hardware

- El modelo base Qwen3-8B en FP16 requiere aproximadamente 16 GB de VRAM; con cuantizacion INT8 se reduce a unos 8-9 GB y con INT4 a unos 5-6 GB. Los adaptadores LoRA anaden un overhead pequeno.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16; GPUs con 8-12 GB (RTX 4070, etc.) pueden ejecutar el modelo con cuantizacion.
- Para despliegue en produccion se recomienda vLLM o TGI, que soportan carga dinamica de adaptadores LoRA sobre el mismo modelo base.
- Para entornos locales o de desarrollo, llama.cpp y Ollama son opciones validas con soporte de LoRA.
- El repositorio completo de adaptadores ocupa 36.3 GB en disco; cada adaptador individual es mucho menor.
- La evaluacion con 256 rollouts por problema requiere capacidad de generacion iterativa; en GPU consumer esto puede ser lento, por lo que se recomienda aceleracion por lotes (batching) en vLLM o TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GeneBench-Pro | Licencia |
|---|---|---|---|---|
|
