# rat-lab/mh-fresh-K6-van

## Resumen

`rat-lab/mh-fresh-K6-van` es un conjunto de adaptadores LoRA de alineacion por preferencias entrenado por Max Horwitz (laboratorio `rat-lab`) sobre el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, a su vez derivado de Gemma 2 2B. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador en formato safetensors, la libreria `peft` como dependencia de carga y los ficheros de tokenizer, con un total de 1,0 GB repartidos en 10 checkpoints (pasos 468 a 4680, uno cada 468 pasos). El entrenamiento se ejecuto en el cluster UW Hyak mediante SLURM (job 40455923, lanzado el 22 de septiembre de 2026) y finalizo de forma completa tras 4680 pasos.

El interes tecnico del artefacto es metodologico: corresponde a la celda K=6 con correccion de sesgo desactivada (la linea base "sensible al riesgo") de una tabla experimental que cruza cobertura de muestreo y debiasing. El algoritmo es IPO online (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`) con riesgo entropico tau = 10, sobre el dataset `PKU-Alignment/PKU-SafeRLHF`. A diferencia de la tabla previa `mh-ec2-ttomd-*`, que se inicializo en caliente desde el checkpoint 936 de la ejecucion K=8 vanilla, esta ejecucion parte desde el modelo SFT con un adaptador LoRA inicializado a cero y 1000 pasos de warmup, lo que la convierte en un brazo experimental independiente y no en una rama de otro run.

Su relevancia es, por tanto, de investigacion reproducible en optimizacion de preferencias sensible al riesgo, no de despliegue en producto: el modelo tiene 0 descargas y 0 likes, no declara licencia, no publica benchmarks y no especifica idiomas soportados. Cualquier evaluacion de capacidades debe hacerse de forma empirica por parte de quien lo descargue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2) mas adaptadores LoRA; el adaptador se aplica sobre `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` |
| Parametros totales | No disponible para el adaptador; el modelo base es Gemma 2 2B (aproximadamente 2,6 mil millones de parametros, especificacion publica de la familia, no confirmada en este repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio; la familia Gemma 2 2B declara 8192 tokens |
| Tipos de cuantizacion | No disponible; el repositorio publica adaptadores LoRA en safetensors, sin versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA, libreria `peft`) |
| Tamano del repositorio | 1,0 GB (10 checkpoints con adaptador y tokenizer, mas `training_dynamics.csv`) |
| Checkpoints publicados | 10: pasos 468, 936, 1404, 1872, 2340, 2808, 3276, 3744, 4212 y 4680 |
| Modelo base | `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` |
| Dataset de preferencias | `PKU-Alignment/PKU-SafeRLHF` |
| Algoritmo | IPO online (`--alg oipo1`, `risk_egpo/tt_omd.py`) |
| Semilla | 42 |

## Arquitectura y entrenamiento

El objeto entrenado es un adaptador LoRA de bajo rango sobre un transformer decoder-only de la familia Gemma 2 en su variante de 2B, previamente ajustado por instrucciones sobre Alpaca Cleaned por el usuario `vectorzhou`. El repositorio no detalla el rango, el alpha, los modulos objetivo ni el numero de parametros entrenables del adaptador, por lo que esos datos quedan como no disponibles; tampoco se documenta la composicion exacta de la Mezcla SFT del modelo base.

El procedimiento de alineacion es IPO online con muestreo de K = 6 respuestas por prompt (`--ypp_samples 6`), funcion de riesgo entropico con tau = 10 y sin correccion de sesgo, es decir, la condicion de comparacion de la tabla cobertura x debiasing del autor. La inicializacion es desde cero sobre el modelo SFT (LoRA a cero) con 1000 pasos de warmup y 4680 pasos totales; no se uso `--init_adapter` ni `--load_dir`, lo que garantiza que ningun checkpoint de otra ejecucion interviene en este. La generacion durante el entrenamiento se limito a 64 tokens nuevos. El repositorio incluye `training_dynamics.csv` con las metricas por paso de log: perdida, norma del gradiente (L2, pre-clip), KL, recompensas/accuracy y margenes de recompensa. No se documentan innovaciones de decodificacion (decodificacion especulativa, atencion lineal ni similares) ni fases adicionales de RLHF con modelo de recompensa explicito.

## Capacidades

- Generacion de texto conversacional y ajuste a instrucciones heredados del modelo base SFT sobre Alpaca Cleaned.
- Alineacion orientada a seguridad y preferencias: el entrenamiento usa PKU-SafeRLHF, por lo que el adaptador esta optimizado para preferir respuestas consideradas seguras frente a respuestas daninas segun ese dataset.
- Optimizacion de preferencias sensible al riesgo: la celda implementa riesgo entropico con tau = 10, pensada para estudiar el comportamiento del modelo ante colas de recompensa desfavorables.
- Control experimental de cobertura: permite comparar el efecto de K = 6 muestras por prompt frente a otras celdas de la misma tabla.
- Trazabilidad de entrenamiento: la inclusion de `training_dynamics.csv` permite reproducir curvas de perdida, KL y margenes.
- Tool calling / function calling: no documentado; no disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; no disponible.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo base es de texto.

## Casos de uso

- Investigacion en alineacion sensible al riesgo: la celda K=6 sin debiasing sirve como linea base contra la que medir el efecto de la correccion de sesgo en las demas celdas de la tabla, cargando el checkpoint final con `PeftModel.from_pretrained`.
- Estudio de la dinamica de optimizacion IPO online: `training_dynamics.csv` permite analizar la evolucion de la KL y de los margenes de recompensa paso a paso y detectar inestabilidad o colapso de la politica.
- Ablacion de inicializacion en caliente frente a inicializacion desde cero: al partir de LoRA a cero con 1000 pasos de warmup, este run aisla el efecto de la inicializacion respecto a los brazos `mh-ec2-ttomd-*` inicializados desde el checkpoint 936.
- Auditoria de seguridad de modelos pequenos: evaluar si un adaptador de 2B alineado sobre PKU-SafeRLHF reduce respuestas daninas y a que coste en utilidad y tasa de rechazo excesivo.
- Red-teaming y generacion de conjuntos de evaluacion: usar los 10 checkpoints intermedios para producir respuestas en distintos puntos del entrenamiento y estudiar como cambia el comportamiento con el numero de pasos.
- Prototipado docente o de laboratorio en GPUs de consumo: el modelo base de 2,6 B mas el adaptador cabe en GPUs de gama media, lo que permite reproducir experimentos de optimizacion de preferencias con un presupuesto de hardware reducido.
- Analisis de sensibilidad al hiperparametro de riesgo: comparar tau = 10 frente a otros valores de las celdas vecinas para estudiar el compromiso entre seguridad y diversidad de respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench, AlpacaEval ni evaluaciones de seguridad sobre PKU-SafeRLHF; solo se menciona la existencia de metricas de entrenamiento (perdida, `grad_norm`, KL, recompensas/accuracies y margenes) en `training_dynamics.csv`, sin valores publicados.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada sobre los aproximadamente 2,6 B parametros del modelo base, mas el adaptador LoRA): en bf16/fp16 en torno a 5,2 GB solo de pesos, con 6-8 GB considerando activaciones y cache KV a contextos moderados; en int8 alrededor de 2,7 GB; en 4 bits aproximadamente 1,5-2 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es viable en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en bf16 tambien cabe en A100 40 GB y H100, aunque resultan sobredimensionadas para 2,6 B de parametros.
- Cabe en GPU de consumo: si. En 4 bits es posible incluso en GPUs de 8 GB, y en bf16 en cualquier GPU con 8-12 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` es la via documentada por el autor (carga del modelo base y `PeftModel.from_pretrained` apuntando al subfolder del checkpoint). Tambien son viables vLLM con soporte de adaptadores LoRA y TGI; para llama.cpp u Ollama seria necesario fusionar primero el adaptador con el modelo base y convertir los pesos a GGUF, procedimiento que el repositorio no documenta.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.
- Nota de almacenamiento: el repositorio ocupa 1,0 GB porque incluye 10 checkpoints; para inferencia solo es necesario descargar el subfolder del checkpoint deseado, preferiblemente `checkpoint-4680`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rat-lab/mh-fresh-K6-van` (este) | Adaptador LoRA sobre base de ~2,6 B | No disponible | IPO online, K=6, riesgo entropico tau=10, sin debiasing, desde cero | No disponible | Publico en HuggingFace, 0 descargas, 10 checkpoints |
| `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` | ~2,6 B | No disponible | SFT sobre Alpaca Cleaned | No disponible | Publico en HuggingFace; es el punto de partida de este adaptador |
| Brazos `mh-ec2-ttomd-*` (misma tabla, citados en la model card) | Adaptadores LoRA sobre el mismo base | No disponible | Inicializacion en caliente desde `ipo-e-c10.0/checkpoint-936` | No disponible | Referenciados en la model card; no se aportan enlaces ni metricas comparativas |
| Gemma 2 2B instruct original | ~2,6 B | 8192 tokens (especificacion publica de la familia) | Preentrenamiento mas ajuste por instrucciones y RLHF del fabricante | Licencia Gemma (terminos del fabricante) | Ampliamente disponible |
| Alternativas de alineacion por preferencias de proposito general (DPO/IPO sobre modelos de 1-3 B) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion cuantitativa de rendimiento entre estas variantes no es posible con la informacion disponible: el repositorio no publica evaluaciones, y las celdas hermanas solo se mencionan de forma cualitativa para justificar la independencia de esta ejecucion.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar el modelo base `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` y cargar el adaptador con `peft`; sin ese paso los pesos del repositorio no son utilizables.
- Ausencia total de datos de evaluacion: no hay benchmarks de capacidad, utilidad ni seguridad, por lo que no puede afirmarse ninguna mejora objetiva respecto al modelo base.
- Licencia no declarada: el repositorio no especifica licencia para el adaptador, y el uso comercial queda condicionado ademas por la licencia del modelo base y de la familia Gemma, que debe verificarse por separado.
- Idiomas no declarados: se desconoce el soporte multilingue real, mas alla de lo que herede el modelo base.
- Riesgo de alucinacion: inherente a un modelo de 2,6 B de parametros; al no haber evaluaciones, la tasa de alucinacion es desconocida.
- Sesgos: el adaptador se entrena sobre PKU-SafeRLHF, un dataset de preferencias de seguridad con anotaciones humanas limitadas a un contexto cultural concreto; puede inducir sobrerrechazo (over-refusal) de peticiones legitimas y sesgos propios del dataset y del modelo base SFT sobre Alpaca Cleaned.
- Sesgo de cobertura experimental: K = 6 y tau = 10 son valores fijados para un estudio de ablacion, no hiperparametros optimizados para produccion.
- Celda sin debiasing: este run es explicitamente la condicion de control sin correccion de sesgo, por lo que puede presentar sesgos sistematicos que las otras celdas de la tabla intentan corregir.
- Generacion corta durante el entrenamiento: el limite de 64 tokens nuevos por muestra puede haber sesgado el aprendizaje hacia respuestas breves; su efecto sobre generaciones largas no esta documentado.
- Contexto limitado: incluso asumiendo la ventana de 8192 tokens de la familia Gemma 2, no es adecuado para tareas de contexto muy largo.
- Estado de adopcion nulo: 0 descargas y 0 likes, sin validacion externa ni incidencias reportadas. Debe considerarse un artefacto de investigacion, no un componente listo para produccion.
- Reproducibilidad parcial: no se incluye el estado de reanudacion de DeepSpeed en los checkpoints; solo el adaptador LoRA y los ficheros de tokenizer.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/rat-lab/mh-fresh-K6-van
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Ficheros de metricas de entrenamiento: `training_dynamics.csv` en el propio repositorio
- Implementacion del algoritmo citada por el autor: `risk_egpo/tt_omd.py` (referencia interna de la model card; no se proporciona repositorio publico)
- Paper, blog o demo del autor: no disponibles
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun enlace relevante a este modelo; los resultados obtenidos correspondian a paginas divulgativas sobre el animal "rat" (Wikipedia, SPA, articulos de deratizacion) y no guardan relacion con el artefacto.
