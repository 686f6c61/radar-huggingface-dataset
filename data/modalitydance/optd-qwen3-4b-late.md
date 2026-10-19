# ModalityDance/OPTD-Qwen3-4B-Late

## Resumen

OPTD-Qwen3-4B-Late es un checkpoint de estudiante obtenido mediante *On-Policy Transition Distillation* (OPTD), una variante de destilación on-policy descrita en el paper del mismo nombre. Lo publica la organización ModalityDance partiendo de `Qwen/Qwen3-4B`, un transformer decoder-only denso de 4.411.424.256 parámetros (4,41 mil millones) según los pesos en safetensors. El resultado es un fine-tune de razonamiento especializado en matemáticas y código, entrenado únicamente con 50 actualizaciones sobre rollouts generados por el propio estudiante.

La innovación que documenta la model card es la alineación de los incrementos de log-probabilidad entre profesor y estudiante en tres bloques intermedios concretos (índices zero-based 14, 19 y 24) además de la salida final, manteniendo a la vez la destilación on-policy final (OPD). La implementación práctica fija las identidades de los 16 candidatos más probables de la política final y utiliza recompensas de transición y probabilidades del bloque destino del estudiante con gradiente detenido.

Su relevancia es fundamentalmente metodológica: sirve para estudiar cómo se transfiere capacidad de razonamiento entre un especialista y un estudiante de 4B sin reentrenar desde cero, y para reproducir ablaciones sobre qué capas intermedias conviene alinear. Es un artefacto de investigación, sin descargas ni likes registrados y sin licencia declarada, y el autor advierte explícitamente de que las comparativas con el paper exigen el checkpoint original, el modo de prompt, las revisiones de benchmark, el número de muestras y los graders originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (heredada del modelo base `Qwen/Qwen3-4B`) |
| Parametros totales | 4.411.424.256 (4,41 mil millones), según safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | BF16 en safetensors; no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible; la model card remite a las licencias upstream del modelo base y del especialista |
| Formato de pesos | safetensors en BF16 (repositorio de 8,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B: un transformer decoder-only denso con atención por grupos (GQA) y tokenizer propio, del que se conservan tokenizer, configuración de generación y pesos completos para inferencia. No se trata de un MoE ni de un híbrido SSM. El checkpoint se distribuye como fine-tune (`base_model_relation: finetune`) y solo se publican los pesos finales: no se incluyen estados del optimizador ni shards de entrenamiento distribuido, aunque sí un `checksums.json` con los SHA256 de los ficheros subidos.

El entrenamiento es una destilación on-policy con 50 actualizaciones. El estudiante genera sus propios rollouts y, sobre ellos, se alinean los incrementos de log-probabilidad entre profesor y estudiante en los bloques intermedios 14, 19 y 24 (índices zero-based) y en la salida final, conservando además la destilación OPD de política final. La implementación fija las identidades de los 16 candidatos más probables de la política final y usa recompensas de transición y probabilidades del bloque destino del estudiante con gradiente detenido (detached). Los dominios de entrenamiento declarados son matemáticas y programación, y el modo de generación es no-thinking nativo (`enable_thinking=False`). No se especifican en la información disponible el volumen de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Razonamiento matemático: resolución de ecuaciones y problemas de varios pasos en modo no-thinking.
- Generación y edición de código, dominio explícito de entrenamiento junto con matemáticas.
- Razonamiento de cadena directa en la respuesta, sin bloque de pensamiento: el modo thinking debe desactivarse explícitamente.
- Compatible con `text-generation-inference` y con el ecosistema `transformers` (`AutoModelForCausalLM`, `device_map="auto"`, BF16).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas en la model card.
- Capacidades de visión o audio: no disponibles; el pipeline declarado es únicamente `text-generation`.
- Multilingüismo: limitado a inglés según el campo `language`; no se declaran otros idiomas.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint permite estudiar cómo se propaga la capacidad del profesor a un estudiante de 4B cuando se alinean bloques intermedios concretos (14, 19, 24) en lugar de solo la salida, comparando curvas de aprendizaje frente a OPD clásica.
- Ablaciones de selección de capas: al estar identificados los índices de bloque usados, se puede contrastar el efecto de alinear capas intermedias frente a alinear únicamente la capa final en tareas de matemáticas y código.
- Reproducción de experimentos specialist-to-student: útil como punto de partida para pipelines que destilan un especialista grande en un estudiante desplegable en una sola GPU, con solo 50 pasos de actualización.
- Asistente de resolución de problemas matemáticos en inglés: con `enable_thinking=False` y hasta 1024 tokens nuevos, encaja en prototipos de tutor o verificador de ejercicios donde se prioriza latencia baja sobre razonamiento extendido.
- Generación de código en entornos de investigación: integrable en `transformers` o TGI para tareas de autocompletado y síntesis de funciones, siempre con ejecución en sandbox aislado, tal como recomienda el autor.
- Evaluación de pipelines de verificación: sirve como generador de soluciones candidatas para medir rerankers, verificadores o graders sobre problemas de matemáticas y código, dado su tamaño reducido y su coste de inferencia bajo.
- Estudio de robustez y modos de fallo: al ser un fine-tune corto sobre un base conocido, permite analizar cuánto del comportamiento del base se preserva y cuánto se desplaza tras la destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card advierte de que las comparaciones con el paper requieren el checkpoint original, el modo de prompt, las revisiones de benchmark, el número de muestras y los graders empleados; una generación de ejemplo no reproduce las puntuaciones publicadas. No se deben extrapolar cifras de MMLU, HumanEval o GSM8K a este checkpoint sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo de pesos, más caché KV y overhead del runtime; en la práctica, entre 10 y 12 GB para contextos moderados.
- GPU profesionales: A100 (40/80 GB), H100, L40S o A10G son suficientes con holgura y permiten lotes grandes.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090/4080 (16-24 GB) en BF16 sin cuantizar; en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) el ajuste es justo y requiere controlar la longitud de contexto o recurrir a cuantización no publicada.
- Despliegue: `transformers` con `device_map="auto"` y `torch_dtype=torch.bfloat16` es la vía documentada; el tag `text-generation-inference` indica compatibilidad con TGI. Para vLLM es previsible soporte al ser arquitectura Qwen3, pero no está verificado en la información disponible. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión que no se distribuye.
- Latencia y throughput: no disponible. Como referencia de orden de magnitud, un modelo denso de 4,4B en BF16 ocupa la GPU de forma holgada, por lo que el coste dominante será la longitud de generación (el ejemplo usa `max_new_tokens=1024`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPTD-Qwen3-4B-Late | 4,41 mil millones | no disponible | Destilación on-policy de transición (math, coding), modo no-thinking | no disponible (remite a upstream) | Pesos BF16 en HuggingFace, 0 descargas |
| Qwen/Qwen3-4B (base) | ~4 mil millones | consultar ficha del base | Modelo generalista con modo thinking y no-thinking | según ficha del base | Ampliamente disponible |
| Qwen2.5-3B-Instruct | ~3 mil millones | consultar ficha del modelo | Instruct generalista, familia anterior | según ficha del modelo | Ampliamente disponible |
| Llama-3.2-3B-Instruct | ~3 mil millones | consultar ficha del modelo | Instruct generalista multilingüe | licencia comunitaria de Llama | Ampliamente disponible |

No se dispone de datos de benchmarks de este checkpoint que permitan una comparación cuantitativa con las alternativas. La comparación relevante es metodológica: frente al Qwen3-4B base, este modelo sustituye el comportamiento generalista por un ajuste corto (50 actualizaciones) orientado a matemáticas y código en modo no-thinking, con un alcance de idioma reducido a inglés.

## Limitaciones y advertencias

- Licencia no declarada: la model card no concede ninguna licencia nueva sobre los pesos y remite a los términos upstream del modelo base y del especialista. Verificar antes de cualquier uso comercial o redistribución.
- Idioma: solo se declara inglés (`en`); el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Modo de generación restringido: el checkpoint está entrenado para no-thinking nativo; no debe asumirse capacidad de razonamiento extendido con bloque de pensamiento.
- Entrenamiento muy corto (50 actualizaciones): el olvido catastrófico de capacidades generales del base es un riesgo real y no está cuantificado.
- Alucinación: el autor advierte de que las salidas pueden ser incorrectas o seguir instrucciones no deseadas; no hay evaluación de tasas de error publicada.
- Código generado: debe ejecutarse en un sandbox aislado, tal como indica explícitamente la model card.
- Ausencia de benchmarks: no se puede afirmar ninguna mejora sobre el base ni sobre alternativas sin evaluación propia con el mismo prompt mode, revisiones y graders.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Sesgos: no documentados; al derivar de Qwen3-4B, hereda los sesgos del corpus del modelo base, no evaluados en esta ficha.
- Empaquetado: no se distribuyen estados del optimizador ni shards de entrenamiento, lo que limita la reproducibilidad completa del proceso; solo hay checksums de los ficheros subidos.
- Fecha de publicación en metadatos de HuggingFace: 19 de octubre de 2026; verificar vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ModalityDance/OPTD-Qwen3-4B-Late
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Paper *On-Policy Transition Distillation*: no se ha localizado el enlace en la información proporcionada
- Repositorio de código o demo: no disponible
- Resultados de la búsqueda web: no contienen información relevante sobre el modelo (los resultados devueltos corresponden a fichas musicales de Discogs y no guardan relación con este checkpoint)
