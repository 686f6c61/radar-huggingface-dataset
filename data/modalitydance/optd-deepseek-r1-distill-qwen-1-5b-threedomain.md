# ModalityDance/OPTD-DeepSeek-R1-Distill-Qwen-1.5B-ThreeDomain

## Resumen

OPTD-DeepSeek-R1-Distill-Qwen-1.5B-ThreeDomain es un checkpoint estudiante obtenido mediante *On-Policy Transition Distillation* (OPTD), una variante de destilación on-policy descrita en el artículo del mismo nombre. Lo publica el usuario ModalityDance en HuggingFace y parte del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B, un transformer decoder-only de la familia Qwen2 con 1.777.088.000 parámetros. El entrenamiento se realizó sobre tres dominios (matematicas, codigo y seguimiento de instrucciones) durante 150 actualizaciones, alineando los incrementos de log-probabilidad entre profesor y estudiante en los bloques intermedios 11, 15 y 19 (indexados desde cero) y en la salida final.

El problema que aborda es el de la destilación de modelos especializados en razonamiento hacia estudiantes pequenos: en lugar de imitar solo la distribución final del profesor, OPTD iguala las transiciones de probabilidad a lo largo de varias capas, usando rollouts generados por el propio estudiante. Esto lo convierte en un objeto de estudio para investigadores que trabajan en destilación, no en un modelo orientado a produccion.

Es relevante ahora porque permite reproducir y analizar experimentalmente una tecnica de destilacion on-policy con un coste de computo muy bajo (1,5B de parametros, BF16, 3,6 GB de repositorio). No obstante, se trata de un checkpoint de investigacion sin resultados de benchmarks publicados en la informacion disponible y sin licencia propia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (tag `qwen2`); numero de capas, dimension oculta y cabeceras no disponible |
| Parametros totales | 1.777.088.000 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificada en la model card; heredada de la configuracion del modelo base) |
| Tipos de cuantizacion | No disponible; el repositorio solo distribuye pesos BF16 en safetensors (no se incluyen GGUF ni otros formatos cuantizados) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible; la model card no otorga licencia nueva y remite a las licencias de los modelos upstream (estudiante base y especialista) |
| Formato de pesos | Safetensors BF16 (mas tokenizer, configuracion de generacion y metadatos de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2, denso, de aproximadamente 1,78 mil millones de parametros, con tokenizer y plantilla de chat propias de DeepSeek-R1-Distill-Qwen. El checkpoint se distribuye en BF16 e incluye el modelo completo de inferencia, el tokenizer, la configuracion de generacion y metadatos de entrenamiento; no se incluyen estados del optimizador ni shards de entrenamiento distribuido. El repositorio incorpora un `checksums.json` con los SHA256 de los ficheros subidos.

El entrenamiento aplica OPTD sobre rollouts generados por el propio estudiante, con 150 actualizaciones y alineacion de incrementos de log-probabilidad en los bloques intermedios 11, 15 y 19 (zero-based) y en la salida final, sobre tres dominios: matematicas, codigo y seguimiento de instrucciones. La actualizacion practica utiliza las identidades de los 16 candidatos mas probables de la politica final (top-16 fijo), con recompensas de transicion separadas (detached) y probabilidades del estudiante en la capa de destino tambien separadas. El modo de generacion es la plantilla de razonamiento nativa del modelo base. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles con `apply_chat_template` y `add_generation_prompt`.
- Razonamiento matematico con cadena de pensamiento larga, heredado de la destilacion de DeepSeek-R1 (la model card usa como ejemplo `Solve 2x + 5 = 17.` con hasta 1024 tokens nuevos).
- Generacion de codigo, con la advertencia explicita del autor de evaluar el codigo generado en un sandbox aislado.
- Seguimiento de instrucciones, uno de los tres dominios de entrenamiento declarados.
- Modo de razonamiento nativo: la plantilla de generacion del modelo base produce trazas de razonamiento antes de la respuesta final.
- Generacion con muestreo configurable (temperatura 0,7 y top-p 0,95 en el ejemplo oficial).
- Tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible (no documentado).
- Capacidades multimodales (vision, audio): no disponibles; el pipeline es `text-generation`.
- Multilinguismo: limitado al ingles segun el campo `language` del repositorio.

## Casos de uso

- Investigacion en destilacion on-policy: usar el checkpoint como estudiante de referencia para reproducir o ablacionar OPTD, comparando el efecto de alinear los bloques 11, 15 y 19 frente a la destilacion solo en la salida final.
- Generacion de datos sinteticos de razonamiento: producir trazas de cadena de pensamiento en matematicas y codigo para alimentar posteriores procesos de destilacion o fine-tuning de modelos menores, con la ventaja de que el modelo es pequeno y se ejecuta en una sola GPU.
- Tutoria de matematicas paso a paso: servir respuestas con desglose explicito de operaciones usando la plantilla de chat y `max_new_tokens` de 1024, adecuado para prototipos de asistentes educativos en ingles.
- Asistencia de codigo con verificacion en sandbox: generar funciones y tests, ejecutando el resultado en un entorno aislado antes de aceptarlo, dado el aviso explicito del autor sobre codigo incorrecto.
- Prototipado de pipelines de inferencia: validar integraciones con `transformers` y Text Generation Inference (tag `text-generation-inference` y `endpoints_compatible`) antes de migrar a un modelo mayor de la misma familia.
- Baseline de experimentos de destilacion entre modelos de distinto tamano: comparar el estudiante de 1,5B contra el profesor especialista en los mismos prompts, semillas y graders, tal y como exige la model card para reproducir las comparaciones del articulo.
- Evaluacion de seguimiento de instrucciones en ingles: usar el modelo como sujeto de pruebas en tareas de formato y transformacion de texto dentro de un banco de evaluacion interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card advierte explicitamente de que las comparaciones del articulo requieren el checkpoint original, el modo de prompt, las revisiones concretas de los benchmarks, el numero de muestras y los graders, y que una generacion de ejemplo no reproduce las puntuaciones del paper.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,6 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 5 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,8-2,5 GB (requiere convertir los pesos, ya que el repositorio solo ofrece BF16).
- VRAM estimada en cuantizacion de 4 bits: en torno a 1-1,5 GB, lo que permitiria ejecucion en GPUs de gama baja.
- GPU recomendadas: A100 y H100 para lotes grandes y experimentos por lotes; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para uso individual sin problemas.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en BF16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4060 de 8 GB) y en tarjetas de 6 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte oficial), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`) y vLLM por compatibilidad con la arquitectura Qwen2. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPTD-DeepSeek-R1-Distill-Qwen-1.5B-ThreeDomain | 1.777.088.000 | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible; sujeta a licencias upstream | HuggingFace, pesos BF16 safetensors |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B (modelo base) | ~1,5B (valor exacto no disponible en esta ficha) | No disponible en la informacion proporcionada | Metricas publicadas por DeepSeek en su repositorio (no verificadas aqui) | La del repositorio del modelo base (verificar) | HuggingFace, pesos safetensors |
| Qwen2.5-1.5B-Instruct | ~1,5B | No disponible en la informacion proporcionada | No disponible en esta ficha | Apache 2.0 (verificar en el repositorio) | HuggingFace, safetensors y GGUF de la comunidad |
| DeepSeek-R1-Distill-Qwen-7B | ~7B | No disponible en la informacion proporcionada | No disponible en esta ficha | La del repositorio del modelo (verificar) | HuggingFace |

Nota: los datos de contexto, rendimiento y licencia de las alternativas deben confirmarse en sus repositorios oficiales; en esta ficha solo se dispone de la informacion del modelo de ModalityDance.

## Limitaciones y advertencias

- Checkpoint de investigacion: la model card lo define como material para estudiar destilacion especialista-estudiante, no como modelo listo para produccion.
- Ausencia de benchmarks: no hay resultados publicados en la informacion disponible, por lo que no se puede afirmar mejora alguna sobre el modelo base.
- Entrenamiento corto: solo 150 actualizaciones sobre tres dominios, lo que limita la generalizacion fuera de matematicas, codigo e instrucciones.
- Riesgo de alucinacion y de instrucciones mal seguidas: el autor advierte de que las salidas pueden ser incorrectas o desobedecer instrucciones.
- Codigo generado no verificado: debe ejecutarse en un sandbox aislado antes de cualquier uso.
- Idioma: solo se declara ingles, sin garantias de calidad en castellano u otras lenguas.
- Longitud de contexto: no documentada; no debe asumirse una ventana larga sin comprobarla en la configuracion del repositorio.
- Licencia: no hay licencia propia declarada; los pesos del estudiante y del especialista conservan sus terminos upstream, y la model card no implica cesion adicional alguna. Es imprescindible revisar la licencia del modelo base antes de redistribuir o desplegar comercialmente.
- Sin soporte documentado de tool calling ni de agentes, lo que descarta su uso directo en pipelines que dependan de function calling.
- Fecha de publicacion reciente y nulo volumen de descargas y likes (0 y 0 en el momento de la consulta), sin validacion independiente por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ModalityDance/OPTD-DeepSeek-R1-Distill-Qwen-1.5B-ThreeDomain
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Articulo citado *On-Policy Transition Distillation*: referencia mencionada en la model card, enlace no disponible
- Repositorio de codigo del entrenamiento: no disponible
- Demo o Space asociado: no disponible
- Resultados de la busqueda web: no se han encontrado enlaces tecnicos relevantes (los resultados devueltos corresponden a paginas no relacionadas con el modelo)
