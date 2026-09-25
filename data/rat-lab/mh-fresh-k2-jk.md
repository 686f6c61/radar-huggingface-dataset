# rat-lab/mh-fresh-K2-jk

## Resumen

`rat-lab/mh-fresh-K2-jk` es un conjunto de adaptadores LoRA publicado por el usuario rat-lab, cuyo entrenamiento se atribuye en la model card a Max Horwitz en el cluster UW Hyak (trabajo SLURM 40455921, lanzado el 22 de septiembre de 2026). No es un modelo completo: es un adaptador PEFT que se aplica sobre `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, un Gemma 2 2B de tipo decoder-only ya ajustado con SFT sobre Alpaca Cleaned. El repositorio ocupa 0,6 GB e incluye seis checkpoints (pasos 468, 936, 1404, 1872, 2340 y 2808) junto con las metricas de entrenamiento por paso.

El adaptador corresponde a la celda K=2 con estimador *jackknife* de una tabla experimental que cruza cobertura (K) y correccion de sesgo, con riesgo entropico tau = 10. El algoritmo empleado es online IPO (`--alg oipo1`, implementado en `risk_egpo/tt_omd.py`), con correccion de sesgo *two-timescale* y tamano de paso gamma = 0,1. Lo relevante de esta version es su procedencia: a diferencia de los adaptadores previos `mh-ec2-ttomd-*`, que partian mediante *warm start* del checkpoint 936 del run K=8 (lo que convertia las celdas K=2 y K=4 en ramas dependientes del baseline), este run arranca desde el modelo SFT con un adaptador LoRA inicializado a cero y 1000 pasos de calentamiento, sin `--init_adapter` ni `--load_dir`.

Se trata, por tanto, de un artefacto de investigacion orientado a reproducir y aislar el efecto de la correccion de sesgo en la optimizacion de preferencias con aversion al riesgo, no de un modelo listo para produccion. El entrenamiento sigue en curso (paso 2808 de 4680) y el repositorio no registra descargas ni valoraciones, por lo que no existe validacion externa de su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only Gemma 2 2B |
| Parametros totales | no disponible (el modelo base es un Gemma 2 2B; el repositorio solo contiene adaptadores) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (en el entrenamiento se generaron como maximo 64 tokens nuevos por muestra) |
| Tipos de cuantizacion | no documentado por el autor; la cuantizacion se aplicaria al modelo base, no al adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA en formato PEFT) mas ficheros de tokenizer por checkpoint |

Otros datos del repositorio: libreria `peft`, tamano de 0,6 GB, 0 descargas y 0 likes, creado el 25 de septiembre de 2026. El dataset declarado es `PKU-Alignment/PKU-SafeRLHF` y la semilla es 42.

## Arquitectura y entrenamiento

El componente entrenado es un adaptador LoRA de rango no especificado que se acopla a las capas del modelo base Gemma 2 2B, un transformer decoder-only con atencion por ventanas alternas y atencion global. El modelo base, `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT`, es a su vez un ajuste SFT sobre Alpaca Cleaned, por lo que el adaptador hereda la formulacion de instrucciones de esa variante y no del Gemma 2 instruct original. El adaptador se inicializa a cero y los primeros 1000 pasos actuan como calentamiento antes de que el objetivo de preferencias domine la actualizacion.

El entrenamiento usa optimizacion de preferencias online del tipo IPO (`--alg oipo1`) con un objetivo de riesgo entropico de tau = 10 y cobertura K = 2 (`--ypp_samples 2`), es decir, dos muestras por prompt para estimar el gradiente. Sobre esa base se aplica una correccion de sesgo *two-timescale* con estimador *jackknife* dejar-uno-fuera, con gamma = 0,1, que es la innovacion tecnica central del run: corregir el sesgo del estimador de cobertura sin depender de un punto de partida calentado con otro brazo experimental. Los datos de preferencia proceden de PKU-SafeRLHF, un corpus orientado a seguridad. Cada 468 pasos se guarda un checkpoint; el repositorio incluye seis, hasta el paso 2808 de 4680, y un fichero `training_dynamics.csv` con perdida, norma del gradiente (L2, pre-clip), KL, recompensas (exactitud y margenes) por paso de log.

## Capacidades

La informacion disponible no documenta capacidades de forma explicita; lo que sigue se deduce de la configuracion del run y debe tratarse como no verificado.

- Generacion de texto conversacional en formato instruccion, heredada del modelo base ajustado con SFT sobre Alpaca Cleaned.
- Ajuste a preferencias humanas con enfasis en seguridad, por el uso de PKU-SafeRLHF como dataset de preferencias.
- Optimizacion con aversion al riesgo: el objetivo incorpora riesgo entropico (tau = 10), lo que en principio penaliza la varianza de la recompensa estimada.
- Capacidad de continuar el entrenamiento: los checkpoints permiten reanudar o ramificar el run en los pasos 468 a 2808.
- Soporte de *tool calling* / *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo *thinking*, vision, audio): no documentadas. Al ser un adaptador sobre un modelo de texto de 2B, no cabe esperar vision ni audio.

## Casos de uso

- Reproduccion de experimentos de optimizacion de preferencias con aversion al riesgo: el adaptador y el `training_dynamics.csv` permiten replicar la curva de perdida, KL y margenes del run online IPO con tau = 10.
- Estudio del sesgo del estimador de cobertura: comparar esta celda K=2 *jackknife* con las celdas K=4 y K=8 permite aislar cuanto del comportamiento observado se debe al tamano de la cobertura y cuanto al estimador.
- Analisis metodologico del *warm start*: al partir de cero sobre el modelo SFT, sirve como control frente a los runs `mh-ec2-ttomd-*` que arrancaban desde el paso 936 del run K=8.
- Investigacion sobre correccion de sesgo *two-timescale*: el ajuste gamma = 0,1 y el estimador *jackknife* dejar-uno-fuera son directamente inspeccionables en el codigo `risk_egpo/tt_omd.py` y en las metricas por paso.
- Punto de partida para *fine-tuning* adicional sobre datos propios: al ser un adaptador PEFT de 0,6 GB, se puede cargar sobre el modelo base y continuar el entrenamiento o combinarlo con otros adaptadores.
- Experimentos academicos de alineamiento seguro: el uso de PKU-SafeRLHF lo hace adecuado para estudiar como la optimizacion de preferencias modifica respuestas en prompts sensibles.
- Pruebas de infraestructura de entrenamiento distribuido: util para validar flujos de trabajo SLURM, guardado de checkpoints PEFT y reanudacion de runs largos sin estado de DeepSpeed.

No se recomienda su uso en produccion con usuarios finales dado el estado de entrenamiento en curso y la ausencia de evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de seguridad, y el repositorio no registra descargas ni evaluaciones de terceros.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluaciones de seguridad | no disponible |
| Metricas de entrenamiento | `training_dynamics.csv` con perdida, `grad_norm` (L2, pre-clip), KL, recompensas (exactitud y margenes) por paso de log |

## Requisitos de hardware

Las cifras siguientes son estimaciones basadas en el tamano del modelo base (Gemma 2 2B) y en el formato PEFT del adaptador; el autor no publica requisitos.

- VRAM para inferencia: en bf16/fp16, del orden de 5 a 6 GB para los pesos del modelo base mas el adaptador, y algo mas para cache KV y overhead del runtime; en 8 bits, aproximadamente 3 a 4 GB; en 4 bits, aproximadamente 2 a 3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para cuantizacion de 4 u 8 bits; RTX 3060 12 GB, RTX 4070, RTX 4090, L4, A10G, A100 y H100 para bf16 sin cuantizar.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM si se cuantiza; con 12 GB o mas es viable en bf16.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card), vLLM o TGI tras fusionar el adaptador con el modelo base, y llama.cpp u Ollama tras fusionar y convertir a GGUF. El repositorio no incluye pesos fusionados ni GGUF, por lo que esos flujos requieren un paso previo de fusion.
- Latencia y throughput: no disponibles.

Carga documentada por el autor:

```python
from peft import PeftModel
from transformers import AutoModelForCausalLM
m = AutoModelForCausalLM.from_pretrained("vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT")
m = PeftModel.from_pretrained(m, "rat-lab/mh-fresh-K2-jk", subfolder="checkpoint-2808")
```

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este adaptador ni para sus alternativas directas, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `rat-lab/mh-fresh-K2-jk` | Adaptador LoRA (online IPO, riesgo entropico, jackknife) | no disponible (base de 2B) | no disponible | no disponible | Entrenamiento en curso (paso 2808/4680) |
| `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` | Modelo completo con SFT | no disponible (Gemma 2 2B) | no disponible | no disponible | Modelo base de este adaptador |
| Adaptadores `mh-ec2-ttomd-*` (mismo autor) | Adaptadores LoRA | no disponible | no disponible | no disponible | *Warm start* desde `ipo-e-c10.0/checkpoint-936`, ramas dependientes del run K=8 |
| Otros modelos de ~2B ajustados con preferencias (DPO/IPO) | Modelo completo o adaptador | no disponible | no disponible | no disponible | Sin datos comparables en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar `vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT` para funcionar.
- Entrenamiento incompleto: solo se han subido seis checkpoints, hasta el paso 2808 de 4680, y el autor advierte que el run sigue en progreso. Los resultados en el paso 2808 no son necesariamente los finales.
- Ausencia total de evaluacion: no hay benchmarks, ni descargas, ni likes, ni validacion de terceros. No hay evidencia publica de que el adaptador mejore al modelo base en ninguna tarea.
- Licencia no declarada: el repositorio no especifica licencia. Al derivar de Gemma 2 y de un modelo SFT de terceros, es previsible que se apliquen los terminos de uso de Gemma, pero esto no esta confirmado en la model card. No se debe asumir uso comercial permitido.
- Idiomas no documentados: no se puede garantizar un rendimiento correcto en castellano ni en ningun otro idioma distinto del de los datos de entrenamiento.
- Sesgos: el adaptador hereda los sesgos del modelo base y de Alpaca Cleaned, y ademas se ajusta con PKU-SafeRLHF, un dataset de seguridad con su propia distribucion de prompts y anotaciones.
- Riesgo de alucinacion: inherente a un modelo de ~2B de parametros; no se ha medido su tasa de error factual.
- Generacion corta en entrenamiento: el run genera como maximo 64 tokens nuevos por muestra, lo que puede dejar el comportamiento poco ajustado en respuestas largas.
- Ambito de aplicacion restringido: es un artefacto de investigacion sobre correccion de sesgo en optimizacion de preferencias, no un asistente listo para desplegar.
- Sin soporte documentado de *tool calling*, agentes ni multimodalidad; no conviene asumir estas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rat-lab/mh-fresh-K2-jk
- Modelo base: https://huggingface.co/vectorzhou/gemma-2-2b-it-alpaca-cleaned-SFT
- Dataset de preferencias: https://huggingface.co/datasets/PKU-Alignment/PKU-SafeRLHF
- Paper de IPO (Identity Preference Optimization): no disponible en la informacion proporcionada
- Repositorio del codigo de entrenamiento (`risk_egpo/tt_omd.py`): no disponible en la informacion proporcionada
- Demo o Space asociado: no disponible
- Las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los unicos enlaces pertinentes son los anteriores.
