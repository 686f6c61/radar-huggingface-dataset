# KordAI/III-tinystories

## Resumen

III-TinyStories es un modelo de lenguaje autoregresivo de muy pequeno tamano (838.664 parametros, segun los pesos safetensors del repositorio) desarrollado por KordAI y publicado en HuggingFace. Se trata de un testbed experimental para la arquitectura III, una arquitectura de decodificador personalizada que combina auto-atencion causal con capas convolucionales causales con compuertas (gated), en lugar del stack Transformer de atencion completa convencional.

El modelo fue entrenado desde cero sobre el dataset TinyStories con objetivo de prediccion del siguiente token, y esta disenado deliberadamente como banco de pruebas para investigacion de arquitecturas de mezcladores de secuencia hibridos, no como un modelo de proposito general. Con menos de un millon de parametros, su distribucion de entrenamiento es estrecha y sintetica, lo que limita severamente su utilidad fuera de entornos de experimentacion controlados.

Es relevante ahora porque se enmarca en la linea de investigacion sobre alternativas eficientes a la atencion cuadratica (convoluciones dilatadas depthwise, mezcladores hibridos) y porque permite reproducir experimentos de arquitectura a coste practicamente nulo. El autor no ha especificado licencia ni longitud de contexto, y el modelo no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder causal personalizado "III": atencion causal auto-regresiva hibridada con mezcladores convolucionales causales con compuertas (depthwise, dilatacion y campo receptivo configurables), RMSNorm, normalizacion RMS de query/key, RoPE, bloques MLP estilo SwiGLU y embeddings de entrada/salida atados |
| Parametros totales | 838.664 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | no especificada (la model card indica "License: Not specified") |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` por arquitectura `custom_code`) |

## Arquitectura y entrenamiento

III no usa un stack Transformer de atencion completa. Cada capa del decodificador emplea o bien auto-atencion causal o bien un mezclador convolucional causal con compuertas, en funcion de la configuracion de la capa. Los bloques de atencion incluyen proyeccion QKV multi-cabeza, normalizacion RMS de queries y keys, RoPE y atencion scaled dot-product de PyTorch. Los bloques convolucionales usan proyecciones con compuertas, convoluciones causales depthwise, campo receptivo y dilatacion configurables. El modelo implementa ademas gestion de cache KV personalizada para generacion autoregresiva, emplea RMSNorm, bloques MLP tipo SwiGLU y ata los embeddings de entrada y salida.

El entrenamiento se realizo desde cero sobre el dataset `roneneldan/TinyStories` con objetivo de prediccion del siguiente token. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, el presupuesto de computo ni si se aplicaron fases de ajuste como RLHF o DPO. Tampoco se documentan hiperparametros de entrenamiento, longitud de contexto de entrenamiento, tamano de vocabulario ni configuracion de dilatacion por capa, por lo que no es posible reproducir el experimento unicamente con la informacion publicada.

## Capacidades

- Generacion de texto autoregresiva en ingles, orientada a continuaciones de estilo narrativo simple (cuentos cortos sinteticos).
- Aprendizaje de patrones superficiales de lenguaje: vocabulario sencillo, frases cortas y estructuras repetitivas propias de TinyStories.
- Inferencia con cache KV, lo que permite generacion token a token con coste bajo por paso.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo "thinking", vision, audio ni multimodalidad.
- Cobertura multilingue limitada al ingles (unico idioma declarado).
- No se documentan capacidades de codigo ni de matematicas; por tamano y datos de entrenamiento, no son esperables.

## Casos de uso

- Investigacion de arquitecturas hibridas: servir como baseline reproducible de la arquitectura III frente a Transformers de atencion completa con tokenizador, datos, presupuesto de tokens y optimizador identicos, tal y como recomienda la propia model card.
- Estudio de mezcladores convolucionales: analizar el comportamiento de convoluciones causales depthwise dilatadas frente a atencion en regimen de datos escasos, midiendo perdida de validacion y estabilidad del entrenamiento.
- Test de generacion autoregresiva y cache KV: validar implementaciones de `generate()`, decodificacion por muestreo (temperatura, top-p) y gestion de cache personalizada sobre una arquitectura `custom_code`.
- Experimentos educativos: ilustrar el ciclo completo de definir, registrar y cargar una arquitectura personalizada con `trust_remote_code=True` en la libreria Transformers.
- Fine-tuning a escala minima: ajustar el modelo en tareas sinteticas muy acotadas (por ejemplo, continuaciones con vocabulario controlado) para estudiar sobreajuste y generalizacion con menos de un millon de parametros.
- Pruebas de infraestructura de IA: verificar pipelines de carga de modelos, tokenizacion y ejecucion en CPU en entornos de integracion continua donde el coste de GPU es irrelevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K, HellaSwag ni ninguna otra metrica cuantitativa, y advierte explicitamente de que los resultados de entrenamiento y evaluacion sobre TinyStories no deben interpretarse como evidencia de capacidad de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,4 MB en fp32 (838.664 parametros x 4 bytes) y unos 1,7 MB en fp16/bf16. El cache KV anade un coste marginal dado el tamano del modelo y que la longitud de contexto no esta documentada.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (GTX 10xx en adelante, RTX 20xx/30xx/40xx) ejecuta el modelo con holgura; tambien es funcional en CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en CPU y en dispositivos embebidos con unos pocos megabytes libres.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` es la via documentada. vLLM, TGI, llama.cpp y Ollama no ofrecen soporte para esta arquitectura personalizada salvo que se implemente manualmente la conversion, por lo que no estan disponibles de serie.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La referencia natural es la familia de modelos entrenados sobre el mismo dataset (`roneneldan/TinyStories`), pero no se incluyen sus fichas tecnicas, recuentos de parametros verificados ni resultados de benchmarks en el material consultado, por lo que no se puede construir una comparativa con cifras fiables.

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KordAI/III-tinystories | 838.664 | no disponible | Decoder hibrido atencion + convolucional (III) | no especificada | HuggingFace, requiere `trust_remote_code` |
| Alternativas de la familia TinyStories | no disponible | no disponible | no disponible | no disponible | no disponible |

Se puede afirmar, no obstante, que dentro del ecosistema TinyStories existen modelos de referencia de tamano superior al millon de parametros, y que III-TinyStories se situa por debajo de esa escala, con una arquitectura no estandar que impide la comparacion directa con implementaciones Transformer convencionales sin controlar todas las variables de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados de forma explicita, pero la distribucion de entrenamiento (cuentos cortos sinteticos en ingles) introduce un sesgo fuerte hacia vocabulario y estructuras narrativas simples.
- Riesgo de alucinacion: alto. La model card advierte de que el modelo puede generar afirmaciones incorrectas o sin sentido, repetir patrones del corpus y producir texto gramaticalmente inusual.
- Limitaciones de contexto: la longitud de contexto no esta publicada, lo que impide planificar su uso en tareas que dependan de ventanas largas.
- Limitaciones de idioma: solo ingles declarado; no hay cobertura multilingue.
- Restricciones de licencia: la licencia no esta especificada, por lo que no se concede de forma explicita ningun derecho de uso comercial. Ante esta ambiguedad, el uso en produccion no es recomendable desde el punto de vista legal.
- Advertencia explicita del autor: no apto para aplicaciones en produccion, sistemas de seguridad critica, respuesta a preguntas factuales, recuperacion fiable de conocimiento, toma de decisiones de alto impacto ni representacion de conocimiento actual del mundo.
- Ejecucion de codigo remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio; conviene auditar los ficheros de la arquitectura personalizada antes de instanciarla.
- Reproducibilidad: no se publican hiperparametros completos, presupuesto de tokens ni configuracion de dilatacion, lo que dificulta replicar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KordAI/III-tinystories
- Perfil del autor: https://huggingface.co/KordAI
- Dataset de entrenamiento TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
