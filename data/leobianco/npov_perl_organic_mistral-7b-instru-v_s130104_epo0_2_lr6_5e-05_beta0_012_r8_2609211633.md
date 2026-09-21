# leobianco/npov_PERL_organic_Mistral-7B-Instru-v_S130104_epo0_2_lr6_5e-05_beta0_012_r8_2609211633

## Resumen

El modelo `leobianco/npov_PERL_organic_Mistral-7B-Instru-v_S130104_epo0_2_lr6_5e-05_beta0_012_r8_2609211633` es un ajuste fino de `mistralai/Mistral-7B-Instruct-v0.3` publicado por el usuario leobianco. Se trata de un artefacto de investigacion mas que de un modelo de produccion: no acumula descargas ni likes, no declara licencia propia y su tarjeta de modelo se limita a describir el procedimiento de entrenamiento. El identificador sugiere un experimento sobre neutralidad de punto de vista (npov) con un metodo etiquetado como "PERL organic", entrenado durante 0,2 epocas con una tasa de aprendizaje de 6,5e-05 y un coeficiente beta de 0,012.

Tecnicamente, el modelo parte de la arquitectura transformer decoder-only de Mistral-7B-Instruct-v0.3 (7.25 mil millones de parametros, atencion con consultas agrupadas y atencion de ventana deslizante) y ha sido afinado con RLOO (REINFORCE Leave-One-Out), un metodo de optimizacion estilo REINFORCE para aprendizaje a partir de retroalimentacion, descrito en el articulo arXiv:2402.14740 y disponible en la libreria TRL de Hugging Face. El entrenamiento se realizo y registro en Weights & Biases.

Su relevancia es limitada y de caracter metodologico: sirve como ejemplo reproducible de un pipeline RLOO con TRL sobre un modelo de 7B, y resulta util para quien quiera inspeccionar hiperparametros o replicar el flujo. No hay evidencia publicada de evaluacion, benchmarks, idiomas soportados ni condiciones de uso, por lo que no se recomienda su adopcion directa en sistemas en produccion sin una validacion previa y exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7,25 mil millones (heredado del modelo base); no confirmado en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base declara 32.768 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponibles; el autor no los declara |
| Licencia | no disponible (la model card indica "licence: license", un valor sin contenido juridico) |
| Formato de pesos | safetensors (libreria transformers); tamano del repositorio 0,1 GB |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Metodo de ajuste | RLOO (TRL) |
| Framework | TRL 1.9.2, Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.1, Tokenizers 0.22.2 |
| Fecha de creacion | 2026-09-21 (segun metadatos de Hugging Face) |

Nota: el tamano del repositorio (0,1 GB) es incompatibles con un ajuste fino completo de un modelo de 7B en precision de 16 bits, que ocuparia del orden de 14-15 GB. Es muy probable que el repositorio contenga unicamente pesos de adaptador (tipo LoRA/PEFT) y que requiera el modelo base para su uso, aunque esta circunstancia no se explicita en la model card.

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card y se hereda integramente del modelo base `mistralai/Mistral-7B-Instruct-v0.3`. Mistral-7B es un transformer decoder-only de 7,25 mil millones de parametros con normalizacion RMSNorm, activacion SwiGLU, atencion con consultas agrupadas (GQA) y atencion de ventana deslizante, y un vocabulario de 32.768 tokens. La version 0.3 amplia el contexto a 32.768 tokens y anade soporte declarado para function calling. Este ajuste no modifica la arquitectura: solo actualiza los pesos mediante aprendizaje por refuerzo.

El entrenamiento sigue el metodo RLOO, introducido en "Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs" (Ahmadian et al., ACL 2024, arXiv:2402.14740). RLOO es una variante de REINFORCE que emplea una linea base leave-one-out sobre multiples muestras generadas por prompt, lo que reduce la varianza del gradiente respecto a PPO sin necesidad de un modelo critico independiente. El identificador del modelo detalla los hiperparametros aparentes: 0,2 epocas de entrenamiento, tasa de aprendizaje 6,5e-05, coeficiente beta de 0,012 (habitualmente el termino de penalizacion KL frente al modelo de referencia) y un valor "r8" que podria corresponder al numero de muestras por prompt o al rango de un adaptador, extremo no confirmado. No se especifican el dataset de entrenamiento, su composicion, el numero de tokens vistos ni el proceso de anotacion de preferencias. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new_perl` del usuario.

## Capacidades

- Generacion de texto conversacional: al derivar de Mistral-7B-Instruct-v0.3, conserva el formato de chat con roles de sistema, usuario y asistente.
- Razonamiento y respuesta a instrucciones: capacidad heredada del modelo base, no reevaluada por el autor.
- Generacion de codigo: capacidad heredada del modelo base; sin validacion especifica en esta publicacion.
- Matematicas: capacidad heredada del modelo base; sin datos propios.
- Tool calling / function calling: el modelo base v0.3 lo declara; el ajuste no documenta si lo preserva.
- Uso en agentes y razonamiento multipaso: no documentado para este ajuste.
- Capacidades multilingues: no declaradas por el autor; dependen del modelo base.
- Capacidades especiales (modo pensamiento, vision, audio): no disponibles.
- Ejecucion local mediante `transformers` con `pipeline("text-generation")`: soportada segun el ejemplo de la model card.

## Casos de uso

- Replicacion de experimentos de RLHF/RLOO: el modelo sirve como artefacto de referencia para reproducir un pipeline de TRL con RLOO sobre Mistral-7B, comparando hiperparametros y curvas de entrenamiento registradas en Weights & Biases.
- Investigacion sobre neutralidad de punto de vista (NPOV): el prefijo del identificador sugiere un experimento orientado a medir el sesgo editorial en tareas de redaccion enciclopedica; seria adecuado para estudiar si el ajuste desplaza la postura del modelo en temas controvertidos.
- Analisis de sesgo y alineacion en modelos de 7B: util como punto de comparacion frente al modelo base sin ajustar en tareas de deteccion de sesgo, siempre acompanado de evaluacion propia.
- Generacion de resumenes o borradores de contenido neutro: si el ajuste cumple su objetivo, podria emplearse en tareas de sintesis donde se exija un tono equilibrado, con revision humana obligatoria.
- Docencia y formacion en ajuste fino con RL: permite mostrar de forma completa el ciclo de TRL, desde la carga del modelo base hasta la publicacion del adaptador.
- Prototipado interno de asistentes conversacionales: con fines no comerciales y sobre datos controlados, sirve como banco de pruebas antes de migrar a un modelo con licencia y evaluacion claras.
- Comparacion de metodos de optimizacion (RLOO frente a DPO o PPO): util en un entorno de investigacion que mida estabilidad del entrenamiento y calidad percibida por muestreo.

No se recomienda ninguno de estos casos en produccion sin resolver antes la licencia, el formato de pesos y la ausencia de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y no se han encontrado evaluaciones externas. Tampoco se dispone de comparaciones con el modelo base ni con otras variantes afinadas con RLOO.

## Requisitos de hardware

- Naturaleza del repositorio: con 0,1 GB de pesos, lo mas probable es que se trate de un adaptador PEFT/LoRA. En ese caso, la inferencia requiere cargar primero el modelo base `mistralai/Mistral-7B-Instruct-v0.3`.
- VRAM para el modelo base en precision completa (FP16/BF16): aproximadamente 14-15 GB solo para los pesos, mas la cache KV.
- Cache KV en contexto largo: con 32.768 tokens de contexto y conversaciones multi-turno, la cache puede anadir varios GB adicionales en funcion del lote y del numero de secuencias.
- Cuantizacion de 8 bits: alrededor de 7-8 GB de pesos; viable en GPU de 12 GB con contexto moderado.
- Cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 4-5 GB de pesos; cabe en GPU de consumo de 8 GB (RTX 3070, RTX 4060) si se limita la longitud de contexto.
- GPUs recomendadas para precision completa: A100 40 GB, H100 80 GB, L40S 48 GB; tambien RTX 4090 24 GB o RTX A6000 48 GB para uso de una sola peticion.
- GPUs de consumo: RTX 4090 y RTX 3090 (24 GB) funcionan comodamente en FP16; RTX 3060 12 GB y RTX 4070 requieren cuantizacion.
- Opciones de despliegue: `transformers` (confirmado por el ejemplo de la model card), vLLM y TGI para servicio en FP16 o cuantizado, y llama.cpp u Ollama si se generan pesos GGUF propios (el autor no los publica).
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este ajuste ni datos de tokens por segundo.
- Restriccion practica: al no existir pesos GGUF, GPTQ ni AWQ publicados, cualquier despliegue cuantizado exige convertir el adaptador uno mismo, con el coste y la validacion que ello implica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|
| Este ajuste (npov_PERL_organic) | 7,25 mil millones (base) | no declarado por el autor | no disponible | ninguna | 0 descargas, 0 likes |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | Apache-2.0 | model card oficial con evaluaciones propias | ampliamente adoptado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128.000 tokens | Llama 3.1 Community License | model card oficial | ampliamente adoptado |
| Qwen/Qwen2.5-7B-Instruct | 7,61 mil millones | 128.000 tokens (con extension) | Apache-2.0 | model card oficial | ampliamente adoptado |

Los datos de los tres modelos de referencia corresponden a sus fichas oficiales y deben verificarse en la fuente. Para este ajuste concreto no existen resultados comparables, por lo que la unica ventaja objetiva frente a las alternativas es su valor como ejemplo metodologico de RLOO; en el resto de dimensiones (licencia, contexto declarado, evaluacion y soporte de despliegue) queda por detras.

## Limitaciones y advertencias

- Licencia incierta: la model card indica "licence: license", un valor sin contenido juridico. No se puede asumir que herede la licencia Apache-2.0 del modelo base, ya que el termino de RLHF puede introducir condiciones adicionales. Su uso comercial es juridicamente arriesgado sin aclaracion del autor.
- Ausencia total de evaluacion: no hay benchmarks, evaluaciones humanas ni comparaciones con el modelo base, por lo que se desconoce incluso si el ajuste mejora o degrada el rendimiento del original.
- Riesgo de alucinacion: inherente a los modelos de 7B y no mitigado ni documentado en este caso.
- Sesgos: si el entrenamiento se centro en neutralidad de punto de vista, puede haber desplazado el comportamiento en temas politicos, religiosos o sociales de formas no medidas. Existe riesgo de sesgo de complacencia (sycophancy) propio del RLHF.
- Idioma: no se declaran idiomas soportados. La calidad fuera del ingles o de los idiomas europeos cubiertos por Mistral no esta garantizada.
- Formato de pesos ambiguo: el tamano del repositorio sugiere un adaptador en lugar de pesos completos, pero no se especifica. Un consumidor que intente cargarlo como modelo autonomo puede encontrarse con un error o con un resultado incorrecto.
- Datos de entrenamiento no documentados: se desconoce el dataset de preferencias, su procedencia, su licencia y las posibles implicaciones de derechos de autor.
- Anomalias en los metadatos: la fecha de creacion indicada (2026-09-21) y las versiones de framework declaradas (Transformers 5.14.1, PyTorch 2.11.0) no concuerdan con las versiones estables conocidas en el momento de la publicacion, lo que dificulta la reproducibilidad exacta del entorno.
- Riesgo de deriva por RLHF: el ajuste con RLOO y un beta de 0,012 puede haber reducido la diversidad de las respuestas o provocado un colapso parcial hacia salidas cortas y genericas.
- Sin soporte comunitario: cero descargas y cero likes implican ausencia de retroalimentacion, incidencias reportadas o correcciones por parte de terceros.
- Contexto real no verificado: aunque el modelo base soporte 32.768 tokens, no hay confirmacion de que este ajuste preserve ese limite tras el entrenamiento.
- Adecuacion limitada para produccion: se recomienda tratarlo exclusivamente como material de investigacion hasta que el autor publique licencia, evaluacion y pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leobianco/npov_PERL_organic_Mistral-7B-Instru-v_S130104_epo0_2_lr6_5e-05_beta0_012_r8_2609211633
- Modelo base, Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Articulo de RLOO, arXiv:2402.14740: https://huggingface.co/papers/2402.14740
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Weights & Biases: https://wandb.ai/leobianco-universit-paris-saclay/new_perl/runs/t6tm1gv1

Nota sobre la busqueda web: los resultados obtenidos corresponden a Libero Mail (servicio de correo electronico italiano) y no guardan ninguna relacion con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales vinculados a este ajuste.
