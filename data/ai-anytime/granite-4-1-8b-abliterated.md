# ai-anytime/granite-4.1-8b-abliterated

## Resumen

`ai-anytime/granite-4.1-8b-abliterated` es una version modificada del modelo denso `ibm-granite/granite-4.1-8b` de IBM, publicada por el usuario ai-anytime. La modificacion consiste en una ablacion direccional ("abliteration") aplicada sobre los pesos: se identifican las direcciones de rechazo en el flujo residual y se proyectan fuera de las matrices que escriben en el residual, de modo que el modelo reduce su tendencia a rechazar peticiones. No hay fine-tuning: es una edicion lineal de rango 3 incrustada en los pesos.

El modelo base es un transformer decoder-only denso de 8.380.551.168 parametros (segun los safetensors del repo) con una ventana de contexto de 131.000 tokens, orientado a tareas empresariales, tool calling, seguimiento de instrucciones, codigo y razonamiento matematico. La version abliterada conserva esa arquitectura y tamano, y se distribuye bajo licencia Apache 2.0.

Su relevancia es doble: por un lado, sirve como instrumento de investigacion en interpretabilidad mecanistica y red-teaming, ya que permite medir la robustez y la localidad de la negativa como comportamiento; por otro, ilustra el estado actual de las tecnicas de ablacion, que reducen la tasa de rechazo pero no la eliminan por completo y pueden introducir cierta deriva de capacidades. El autor advierte explicitamente de que no debe desplegarse en productos de cara al usuario sin una capa de seguridad propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Granite 4.1) |
| Parametros totales | 8.380.551.168 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de aproximadamente 8.380 millones de parametros, sin mezcla de expertos, con un contexto de 131.000 tokens. Sobre esa base no se ha realizado ningun entrenamiento adicional ni ajuste supervisado; la unica intervencion es una edicion de pesos de rango 3.

El procedimiento de ablacion, ejecutado con la herramienta `ablate` del propio autor, consta de tres pasos. Primero se extraen las direcciones de rechazo mediante diferencia de medias sobre pares emparejados de instrucciones daninas e inofensivas (128 prompts de AdvBench frente a 128 de Alpaca), siguiendo el metodo de Arditi et al. (2024). Despues se selecciona la configuracion mediante una busqueda Optuna de 40 ensayos puntuada por tasa de rechazo mas 0,5 veces la deriva KL. Finalmente se ortogonalizan todas las matrices que escriben en el flujo residual (embedding, salida de atencion y salida del MLP) contra el subespacio de rechazo, de forma que la edicion queda incrustada en los pesos. La configuracion final es `n_directions = 3`, `alpha = 1.4567`, con intervencion restringida a las capas 35 a 40. La evaluacion se hizo sobre 48 prompts retenidos de cada tipo con un juez de rechazo por palabras clave, que no detecta rechazos suaves.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredados del modelo base Granite 4.1 8B.
- Tool calling y function calling, capacidad destacada por IBM en la familia Granite 4.1.
- Razonamiento matematico y generacion de codigo, tambien reforzados en el modelo base.
- Ventana de contexto de 131.000 tokens, apta para documentos largos y conversaciones multi-turno extensas.
- Reduccion deliberada de la negativa: la tasa de rechazo baja de 0,9375 en el modelo base a 0,3958 en la version abliterada, medida sobre prompts daninos retenidos.
- Capacidad de investigacion en interpretabilidad mecanistica: permite estudiar la representacion y la localidad del comportamiento de rechazo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el modelo permite reproducir y extender el analisis de Arditi et al. sobre como se codifica la negativa en el flujo residual, comparando las activaciones del modelo abliterado con las del base en las capas 35 a 40.
- Red-teaming y evaluacion de robustez: sirve como sujeto de prueba para medir hasta que punto las defensas de un modelo resisten una ablacion lineal y para calibrar clasificadores de contenido danino frente a un modelo con menos rechazos.
- Desarrollo de capas de seguridad externas: al tener los guardrails debilitados, es un banco de pruebas realista para filtros de entrada y salida, moderacion y sistemas de deteccion que deban funcionar incluso cuando el modelo subyacente no colabora.
- Estudio de deriva de capacidades: con una divergencia KL media de 0,5231 frente al base en prompts benignos, permite cuantificar el coste de una intervencion lineal en tareas benignas y comparar tecnicas de ablacion.
- Experimentos de control en evaluaciones de seguridad: util para contrastar resultados de benchmarks de rechazo y de ataque exitoso entre un modelo alineado y su version abliterada, aislando el efecto de la alineacion.
- Analisis de robustez y localidad del rechazo: el modelo documenta rechazos residuales (0,3958), lo que permite estudiar la codificacion redundante de la seguridad y el efecto de aumentar el numero de direcciones ablacionadas.
- Fine-tuning posterior controlado en entornos de investigacion: al estar en safetensors y transformers con licencia Apache 2.0, puede servir de punto de partida para estudiar como se recupera o se pierde la negativa tras un ajuste adicional.

## Benchmarks y rendimiento

| Metrica | Modelo base | Abliterado |
|---|---|---|
| Tasa de rechazo (prompts daninos retenidos) | 0,9375 | 0,3958 |
| KL media frente al base (prompts benignos) | referencia | 0,5231 |
| Coherencia | no disponible | 0,847 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras de la tabla proceden de la model card del autor; la tasa de rechazo se mide con un juez por palabras clave sobre 48 prompts retenidos de cada tipo, y la KL media se calcula sobre las distribuciones del siguiente token en prompts benignos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16,8 GB solo para pesos, mas cache KV; en la practica se recomienda al menos 24 GB para contextos moderados y bastante mas para aprovechar los 131.000 tokens.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8,4 GB de pesos; en 4 bits, alrededor de 4,2 GB, mas cache KV y overhead del runtime.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB o L40S para contextos largos y despliegue concurrente.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto limitado, y en RTX 3090, 4080 o 4070 Ti Super si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM y TGI para servido en produccion una vez convertido, y llama.cpp u Ollama si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: el repo ocupa 33,5 GB, lo que sugiere pesos en BF16/FP16 sin cuantizaciones incluidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai-anytime/granite-4.1-8b-abliterated | 8,38 B | 131.000 | 0,3958 | Apache 2.0 | Hugging Face, safetensors |
| ibm-granite/granite-4.1-8b | 8 B (familia 3B/8B/30B) | 131.000 | 0,9375 | Apache 2.0 | Hugging Face, modelo oficial de IBM |
| Otras versiones abliteradas de modelos de 8B | no disponible | no disponible | no disponible | variable | no disponible |

La comparativa directa mas relevante es con el modelo base, del que se diferencia unicamente por la ablacion de rango 3 en las capas 35 a 40: mismo tamano, mismo contexto y misma licencia, con menor tasa de rechazo y una deriva KL media de 0,5231. No se dispone de datos de benchmarks estandar ni de comparaciones con otras familias abliteradas en la informacion proporcionada.

## Limitaciones y advertencias

- Los guardrails de seguridad estan deliberadamente debilitados: el modelo producira con mas facilidad contenido danino, inseguro u objetable que el modelo base.
- La ablacion es una edicion lineal tosca: deja rechazos residuales (0,3958) y no elimina la seguridad, que esta codificada de forma redundante.
- Puede causar deriva de capacidades; la KL media de 0,5231 frente al base en prompts benignos cuantifica ese desplazamiento, pero no se han evaluado tareas aguas abajo.
- La evaluacion se limita a los benchmarks citados (48 prompts retenidos por tipo, juez por palabras clave) y el juez no detecta rechazos suaves, por lo que la tasa real puede estar subestimada.
- El comportamiento fuera de los benchmarks evaluados puede diferir del reportado.
- No debe desplegarse en productos de cara al usuario sin una capa de seguridad propia.
- El uso comercial esta permitido por la licencia Apache 2.0, pero el usuario es responsable de cumplir la licencia del modelo base y la legislacion aplicable.
- No hay informacion sobre sesgos especificos, idiomas soportados ni rendimiento multilingue.
- El autor de la herramienta `ablate` declina toda responsabilidad por uso indebido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-anytime/granite-4.1-8b-abliterated
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Herramienta ablate: https://github.com/AIAnytime/ablate
- Paper de referencia (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Documentacion de Granite 4.1 en IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Ficha de IBM Granite 4.1 8B en Benchable: https://benchable.ai/models/ibm-granite/granite-4.1-8b-20260429
