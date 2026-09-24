# MANGSEOK123/qwen3-4b-tau2-oel-retail-random74

## Resumen

qwen3-4b-tau2-oel-retail-random74 es un ajuste fino del modelo denso Qwen/Qwen3-4B-Instruct-2507, publicado por el usuario MANGSEOK123 en HuggingFace. El modelo se ha entrenado mediante Online Experiential Learning (OEL) sobre el dominio *retail* del benchmark tau2-bench, un conjunto de tareas de interaccion agente-herramienta-usuario. El objetivo declarado no es mejorar el modelo base, sino publicar un artefacto reproducible que documenta un experimento concreto de auto-destilacion.

El metodo empleado es auto-destilacion, no aprendizaje por refuerzo: no existe senal de recompensa. Profesor y estudiante comparten los mismos pesos; la unica diferencia es que al profesor se le anade la memoria de la tarea al *system prompt*. El estudiante se ajusta a la distribucion del profesor con una perdida KL completa a nivel de token, de modo que el comportamiento aprendido sobreviva sin la memoria en el prompt. Tan solo se realizaron 9 pasos (una epoca) sobre 72 pares (memoria, tarea sintetizada), con un *learning rate* de 3e-6 y recorte de gradiente a 1.0.

Su relevancia actual es metodologica: el propio autor advierte que, en toda la serie de ejecuciones, OEL no ha superado al modelo base (las diferencias quedan dentro de un error estandar de 0.06-0.08 con 40 tareas) y que una segunda epoca empeoro ligeramente los resultados. Se trata, por tanto, de un artefacto de investigacion reproducible mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso *decoder-only* (familia Qwen3) |
| Parametros totales | 4.411.424.256 (~4,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | El repositorio solo contiene safetensors en precision completa; no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamano del repositorio | 8,8 GB |
| Pipeline (HuggingFace) | no disponible |
| Descargas / favoritos | 0 / 0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer denso de unos 4,4 mil millones de parametros perteneciente a la familia Qwen3. El ajuste no introduce cambios arquitectonicos: se conserva la topologia del modelo base y solo se modifican los pesos mediante el procedimiento OEL descrito. No se detalla en la informacion disponible la composicion exacta del dataset de preentrenamiento del modelo base ni si este incluyo etapas de RLHF o DPO; esos datos corresponden a la documentacion de Qwen, no a esta model card.

El entrenamiento consiste en una unica epoca de auto-destilacion en linea sobre el dominio *retail* de tau2-bench. Se utilizaron 72 pares (memoria, tarea sintetizada), con tamano de lote 8 repartido en 4 GPU, 9 pasos en total y una tasa de aprendizaje de 3e-6. La perdida es una KL completa calculada sobre todos los tokens de respuesta, con recorte de gradiente (*grad clip*) fijado en 1.0. El simulador de usuario empleado para generar las interacciones fue gpt-4.1-mini. Un detalle tecnico relevante: las normas del gradiente se mantuvieron muy por encima del umbral de recorte de 1.0 durante todo el entrenamiento, de modo que fue el recorte, y no la tasa de aprendizaje, lo que determino el tamano efectivo del paso.

## Capacidades

- Generacion de texto e instrucciones: hereda las capacidades de instruccion y conversacion de Qwen3-4B-Instruct-2507.
- Uso de herramientas (*tool calling*): la model card recomienda servir el modelo con `--enable-auto-tool-choice` y el parser `hermes`, lo que confirma soporte de llamadas a funciones.
- Comportamiento agentico en el dominio *retail*: disenado especificamente para tareas de tau2-bench retail, que implican interaccion multi-turno con el usuario y uso de herramientas de gestion de pedidos, devoluciones, etc.
- Razonamiento en varios pasos: el escenario tau2-bench exige planificacion y ejecucion secuencial de acciones.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base Qwen3 es multilingue; este ajuste no documenta soporte de otros idiomas.
- Modo *thinking*: no se documenta en esta model card; el modelo base Qwen3-4B-Instruct-2507 no es la variante de razonamiento explicito, pero no hay confirmacion para este ajuste.
- Vision y audio: no soportados.

## Casos de uso

- Reproduccion de experimentos de auto-destilacion: el modelo sirve como artefacto verificable para replicar el procedimiento OEL sobre tau2-bench retail con los mismos hiperparametros (72 pares, 9 pasos, lr 3e-6, grad clip 1.0).
- Investigacion sobre *experiential learning* sin recompensa: util para estudiar por que la destilacion de memorias en los pesos recupera solo parte de la senal que aporta incluirlas en el prompt en tiempo de inferencia.
- Linea base en la evaluacion del dominio retail de tau2-bench: permite comparar contra el modelo base y contra variantes entrenadas con mas epocas o mas datos.
- Estudio del efecto del recorte de gradiente: dado que las normas del gradiente superaron sistematicamente el umbral de 1.0, el modelo es un caso practico para analizar como el recorte condiciona el paso efectivo.
- Agente de atencion al cliente para comercio electronico (prototipo): con tool calling y contexto multi-turno, puede gestionar consultas de pedidos y devoluciones, siempre que se asuma su falta de mejora verificada frente al base.
- Analisis de degradacion por sobreentrenamiento: sirve para documentar empiricamente que una segunda epoca empeora los resultados dentro de esta serie de ejecuciones.
- Docencia y divulgacion: ejemplo compacto (4,4 B) y ejecutable en GPU de consumo para explicar auto-destilacion frente a RL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo aun no ha sido evaluado sobre el conjunto de test reservado (*held-out test split*) de tau2-bench.

Como observacion cualitativa, el autor senala que, en las ejecuciones de esta serie, OEL no ha mejorado al modelo base: las diferencias se situan dentro de un error estandar de aproximadamente 0.06-0.08 con 40 tareas, y ejecutar una segunda epoca empeoro ligeramente los resultados. Estos datos no se presentan como tabla de metricas por tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en safetensors a precision completa/bfloat16, los pesos ocupan aproximadamente 8,8 GB, por lo que conviene disponer de al menos 12-16 GB de VRAM contando cache KV y sobrecarga. En cuantizacion de 8 bits se reduce a unos 4,5 GB y en 4 bits a unos 2,5-3 GB, aunque estas cuantizaciones no se publican en el repositorio y habria que generarlas.
- GPU recomendadas: cabe con holgura en una NVIDIA RTX 4090 (24 GB) y en tarjetas de 16 GB; tambien en A100 (40/80 GB) y H100 para despliegues con mayor concurrencia.
- GPU de consumo: si, el modelo cabe en GPU de consumo de gama alta (RTX 4090, RTX 4080, e incluso de 12-16 GB con cuantizacion).
- Opciones de despliegue: la model card proporciona un comando de vLLM (`vllm serve ... --enable-auto-tool-choice --tool-call-parser hermes`). Tambien seria posible usar TGI, llama.cpp u Ollama si se convierte previamente a GGUF, aunque no se ofrecen pesos en ese formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MANGSEOK123/qwen3-4b-tau2-oel-retail-random74 | 4,41 B | no disponible | Apache 2.0 | HuggingFace, safetensors | Ajuste OEL sobre tau2-bench retail; sin mejora verificada sobre el base |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | Modelo base de este ajuste |
| Qwen3-4B (variante base) | ~4,4 B | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace | Version previa de la familia Qwen3 |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad. El autor indica que este ajuste no supera al modelo base, de modo que en terminos de rendimiento esperado la opcion recomendada sigue siendo Qwen/Qwen3-4B-Instruct-2507.

## Limitaciones y advertencias

- No mejora al modelo base: segun el propio autor, las diferencias frente a Qwen3-4B-Instruct-2507 quedan dentro de un error estandar (0.06-0.08 con 40 tareas).
- Segunda epoca contraproducente: ejecutar mas de una epoca empeoro ligeramente los resultados en esta serie de ejecuciones.
- Falta de evaluacion: el modelo no ha sido evaluado sobre el conjunto de test reservado de tau2-bench, por lo que no hay evidencia cuantitativa de su comportamiento general.
- Sesgo de dominio: el ajuste se ha realizado exclusivamente sobre el dominio *retail* de tau2-bench, lo que puede degradar el rendimiento en otras tareas.
- Idiomas: la model card declara unicamente ingles; el uso en castellano u otros idiomas no esta verificado y puede degradar la calidad.
- Alucinacion: como cualquier modelo de 4,4 B en tareas agenticas, mantiene el riesgo de inventar acciones, referencias a pedidos o resultados de herramientas; no debe usarse sin validacion externa en entornos reales.
- Sesgos: no se documenta ninguna evaluacion de sesgos; se heredan los del modelo base y el posible sesgo inducido por el simulador de usuario gpt-4.1-mini.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigacion el autor no lo recomienda como modelo mejorado.
- Proceso de entrenamiento: las normas del gradiente superaron sistematicamente el umbral de recorte, lo que hace que el ajuste dependa fuertemente de ese hiperparametro y dificulta su interpretacion.
- Cero adopcion: 0 descargas y 0 favoritos en el momento de la consulta, sin senal de uso en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-random74
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
