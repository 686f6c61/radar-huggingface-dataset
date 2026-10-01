# philomath-1209/gpt2-reward_model_hh-rlhf

## Resumen

El modelo `philomath-1209/gpt2-reward_model_hh-rlhf` es un modelo de recompensa (reward model) construido sobre GPT-2 y entrenado para asignar una puntuacion escalar a una respuesta segun preferencias humanas. Dado un texto de respuesta, el modelo devuelve un unico valor real r(x) en el que valores mas altos indican mayor preferencia segun los datos de entrenamiento. No es un modelo generativo: sustituye la cabeza de lenguaje de GPT-2 por una cabeza lineal que proyecta el ultimo estado oculto no perteneciente al padding a un escalar.

El autor lo publica explicitamente como checkpoint de desarrollo. Segun la model card, se entreno con solo 20 ejemplos de entrenamiento, 20 de validacion y 20 de prueba extraidos de `Anthropic/hh-rlhf`, con el objetivo de validar de extremo a extremo el pipeline completo de entrenamiento, evaluacion, checkpointing, serializacion e inferencia de un reward model, no de ofrecer rendimiento util en produccion. Los propios resultados publicados (55 % de accuracy en test con 20 ejemplos) confirman ese caracter de prueba de concepto.

La relevancia del repositorio es, por tanto, metodologica y didactica: documenta una implementacion minima pero verificada del objetivo Bradley-Terry sobre GPT-2, con verificacion de exportacion (diferencia maxima de recompensa de 0,0000000000 frente al checkpoint original). El backbone tiene 124.440.577 parametros totales, coherente con GPT-2 base mas una cabeza lineal de 769 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (`GPT2Model`) mas cabeza lineal de recompensa (1 escalar) |
| Parametros totales | 124.440.577 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (maximo posicional de GPT-2); entrenamiento con longitud maxima de 512 |
| Tipos de cuantizacion | no disponible; el repositorio (0,5 GB) es coherente con pesos en fp32 en safetensors |
| Idiomas soportados | no disponible; el dataset de entrenamiento (`Anthropic/hh-rlhf`) es mayoritariamente en ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only GPT-2 estandar seguido de una cabeza de recompensa. La representacion se toma del ultimo estado oculto no perteneciente al padding y se proyecta mediante una capa lineal (r = W h + b) a un unico escalar. No se aplica sigmoide a la salida, porque el objetivo Bradley-Terry opera sobre la diferencia de dos recompensas y no sobre valores acotados. El entrenamiento usa el objetivo de preferencia P(y_w > y_l) = sigma(r(y_w) - r(y_l)) con perdida L = -log sigma(r(y_w) - r(y_l)), donde y_w es la respuesta elegida y y_l la rechazada.

Los datos proceden del dataset `Anthropic/hh-rlhf`, que aporta pares de preferencia con campos `chosen` y `rejected`. La configuracion de desarrollo es deliberadamente reducida: 20 ejemplos de entrenamiento, 20 de validacion y 20 de prueba, longitud maxima de secuencia 512, batch size 4, learning rate 1e-5, weight decay 0,01, recorte de gradiente 1,0, scheduler lineal, ratio de warmup 0,1, 5 epocas y semilla 42. El split de test se mantiene separado de entrenamiento y validacion. No se documenta RLHF, DPO ni ninguna innovacion de atencion o decodificacion especulativa.

La model card detalla ademas una verificacion de exportacion: el checkpoint serializado se cargo de forma independiente y se comparo con el checkpoint de entrenamiento, con una diferencia maxima de recompensa de 0,0000000000 en los ejemplos probados. Los objetivos declarados del experimento incluyen comprobar la carga de datos de preferencia, la tokenizacion, el padding dinamico, la produccion de scores escalares, el entrenamiento Bradley-Terry, la evaluacion de validacion, la seleccion del mejor checkpoint, la reanudacion desde checkpoint y la restauracion del estado de optimizador y scheduler.

## Capacidades

- Puntuacion escalar de respuestas: dada una respuesta, devuelve un valor real r(x) sin acotar.
- Comparacion por pares: permite decidir la respuesta preferida comparando r(A) con r(B).
- Funcion de recompensa en pipelines RLHF: puede actuar como componente de recompensa que asigna senal escalar a respuestas generadas por una politica.
- Soporte de mascaras de padding: la representacion se extrae del ultimo token no perteneciente al padding.
- Serializacion verificada: los pesos exportados reproducen el checkpoint de entrenamiento con diferencia cero en los ejemplos de prueba.
- No soporta generacion de texto: el modelo no incorpora cabeza de lenguaje y no debe usarse como modelo conversacional.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el entrenamiento se realizo sobre datos predominantemente en ingles.

## Casos de uso

- Validacion de pipelines RLHF: sirve como bloque de prueba para verificar que la carga de pares de preferencia, el padding dinamico, el calculo de la perdida Bradley-Terry y la seleccion de checkpoint funcionan antes de escalar a modelos mayores.
- Pruebas de regresion de infraestructura: el repositorio documenta la restauracion de estado de optimizador y scheduler, por lo que es util como caso de prueba reproducible para sistemas de entrenamiento distribuido.
- Filtrado best-of-n en prototipos: generar varias candidatas con un modelo de lenguaje y ordenarlas con r(x) para seleccionar la mejor; solo tiene sentido en experimentos, dado el caracter de desarrollo del checkpoint.
- Seleccion asistida de pares para anotacion: priorizar que pares de respuestas revisar manualmente segun la diferencia de recompensa, reduciendo el volumen de anotacion en fases iniciales.
- Baseline de comparacion en investigacion: punto de partida de bajo coste (124 M de parametros) para medir mejoras de reward models mas grandes sobre el mismo dataset.
- Docencia y divulgacion: ejemplo compacto y ejecutable de como se construye una funcion de recompensa sobre un transformer preentrenado, incluyendo la verificacion de exportacion.
- Analisis de robustez del objetivo Bradley-Terry: experimentar con semillas, tasas de aprendizaje y tamanos de muestra para estudiar la varianza del accuracy con conjuntos de evaluacion muy pequenos.

## Benchmarks y rendimiento

Los unicos datos publicados son los de desarrollo del propio autor. No hay resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

| Metrica | Valor | Observaciones |
|---|---|---|
| Ejemplos de entrenamiento | 20 | Split de `Anthropic/hh-rlhf` |
| Ejemplos de validacion | 20 | Usados para seleccionar el mejor checkpoint |
| Ejemplos de test | 20 | Split separado |
| Accuracy de validacion (mejor checkpoint) | 65 % | Criterio de seleccion de checkpoint |
| Perdida en test | 1,1870 | Sobre 20 ejemplos |
| Accuracy en test | 55 % | Cada ejemplo equivale a 5 puntos porcentuales |
| Diferencia maxima de recompensa tras exportar | 0,0000000000 | Verificacion de serializacion |

El autor advierte expresamente que estos numeros no deben interpretarse como una estimacion fiable de la capacidad de generalizacion, dado el tamano muestral.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16 y 0,13 GB en int8 para los pesos; el pico real depende del batch y de la longitud de secuencia (hasta 512 tokens en entrenamiento, hasta 1024 posiciones en el backbone). Estimaciones calculadas a partir de los 124,4 M de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 quedan muy sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la clase `GPT2RewardModel` del modulo `src.models.reward_model` incluido en el repositorio. vLLM, TGI, llama.cpp y Ollama no son aplicables de forma directa, ya que no se trata de un modelo causal de generacion y no se publican conversiones a GGUF.
- Latencia y throughput: no disponibles. Con 124 M de parametros y secuencias de hasta 512 tokens, el coste por lote es bajo en GPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

La comparativa se limita a la categoria de reward models basados en transformers pequenos. No hay datos de benchmarks comparables publicados para este checkpoint, por lo que las celdas de rendimiento se dejan como no disponibles.

| Modelo | Parametros | Contexto | Tipo de backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `philomath-1209/gpt2-reward_model_hh-rlhf` | 124,4 M | 1024 (entrenado a 512) | GPT-2 + cabeza lineal | no disponible | HuggingFace, 0 descargas |
| `OpenAssistant/reward-model-deberta-v3-large-v2` | no disponible en la informacion proporcionada | no disponible | DeBERTa-v3 + cabeza de regresion | no disponible en la informacion proporcionada | HuggingFace |
| Reward models sobre Llama-2-7B (familia generica) | ~7 000 M | 4096 tipicamente | Llama-2 + cabeza lineal | varía segun variante | HuggingFace |

Diferencias relevantes: este checkpoint es aproximadamente dos ordenes de magnitud mas pequeno que un reward model de 7 B y esta pensado para validacion de pipeline, mientras que las alternativas citadas se distribuyen como modelos utilizables. La comparacion de rendimiento no es posible porque no se han publicado resultados de benchmarks en la informacion disponible para este modelo ni se dispone de cifras verificadas de las alternativas en esta ficha.

## Limitaciones y advertencias

- Checkpoint de desarrollo: entrenado con 20 ejemplos. El propio autor indica que no es un reward model de calidad de produccion y que sus metricas no representan el rendimiento tras un entrenamiento completo.
- Accuracy en test del 55 % sobre 20 ejemplos: estadisticamente equivalente a una moneda sesgada; cada ejemplo mueve 5 puntos porcentuales.
- Riesgo de generalizacion nulo con el entrenamiento actual: no hay evidencia de que las puntuaciones sean significativas fuera de la muestra de desarrollo.
- Sesgos: el dataset `Anthropic/hh-rlhf` contiene conversaciones de asistente en ingles con contenido potencialmente ofensivo y sesgos propios de los anotadores; un modelo de recompensa entrenado sobre el puede reproducir y amplificar esas preferencias.
- Riesgo de alucinacion en sentido inverso: el modelo no genera texto, pero puede asignar recompensas altas a respuestas factualmente incorrectas o daninas si el patron superficial se parece a lo preferido en los datos.
- Limitaciones de idioma: no se declaran idiomas soportados; el entrenamiento es mayoritariamente en ingles, por lo que el comportamiento en castellano no esta caracterizado.
- Contexto limitado: 512 tokens durante el entrenamiento y 1024 posiciones en el backbone; respuestas largas se truncan.
- Licencia no disponible: sin licencia declarada no hay autorizacion explicita de uso comercial ni condiciones claras de redistribucion, lo que supone un riesgo legal para produccion.
- Codigo personalizado: la carga requiere `trust_remote_code=True` y el modulo `src.models.reward_model`, lo que implica ejecutar codigo del repositorio.
- Idiomas no disponibles en los metadatos y pipeline no declarado, lo que complica la integracion automatica en herramientas que dependen de esos campos.
- Metadatos inconsistentes: la fecha de creacion registrada (2026-09-30) es posterior a la fecha de consulta habitual, lo que sugiere un campo de fecha no fiable.
- Integracion RLHF: usar esta funcion de recompensa como senal de entrenamiento podria optimizar contra un modelo practicamente aleatorio y degradar la politica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/philomath-1209/gpt2-reward_model_hh-rlhf
- Dataset de preferencias `Anthropic/hh-rlhf`: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Modelo base GPT-2 de OpenAI: https://huggingface.co/openai-community/gpt2
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con el repositorio y se descartan.
