# ModalityDance/OPTD-DeepSeek-R1-Distill-Qwen-7B-Late

## Resumen

OPTD-DeepSeek-R1-Distill-Qwen-7B-Late es un checkpoint de estudiante obtenido mediante *On-Policy Transition Distillation* (OPTD), una variante de destilación on-policy descrita en el artículo del mismo nombre. Lo publica el usuario ModalityDance en HuggingFace y parte de `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`, un modelo de razonamiento de la familia Qwen2 con 7.615.616.512 parametros (aproximadamente 7,62 mil millones) en precision BF16. El repositorio ocupa 15,2 GB e incluye pesos, tokenizador, configuracion de generacion y metadatos de entrenamiento, pero no estados del optimizador ni shards de entrenamiento distribuido.

El problema que aborda es la brecha entre un especialista (teacher) y un estudiante de menor tamano: en lugar de alinear solo la distribucion final de tokens, OPTD alinea los incrementos de log-probabilidad entre profesor y estudiante en bloques intermedios concretos (13, 17 y 21, con indexacion desde cero) y en la salida final, sobre rollouts generados por el propio estudiante. El entrenamiento es deliberadamente corto: 100 actualizaciones y solo dos dominios (matematicas y codigo).

Es relevante ahora porque los checkpoints derivados de DeepSeek-R1-Distill se usan mucho como base para experimentos de razonamiento, y este aporta una receta de destilacion reproducible con metadatos explicitos (bloques objetivo, top-16 de candidatos, recompensas de transicion desconectadas del grafo). Conviene tratarlo como material de investigacion: no hay benchmarks publicados, cero descargas y la model card advierte de que las comparaciones con el articulo exigen el checkpoint original, el mismo modo de prompt, las mismas revisiones de benchmark y los mismos graders.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (`qwen2` en config) |
| Parametros totales | 7.615.616.512 (aprox. 7,62 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este checkpoint; el modelo base declara una ventana maxima que no se confirma aqui |
| Tipos de cuantizacion | Solo se distribuyen pesos BF16 safetensors; no se publican versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible; la model card no concede licencia nueva y remite a las licencias upstream del estudiante y del especialista |
| Formato de pesos | Safetensors en BF16 (`torch_dtype=torch.bfloat16`) |
| Tamano del repositorio | 15,2 GB |
| Modo de generacion | Plantilla de razonamiento nativa (`Native reasoning template`) |
| Actualizaciones de entrenamiento | 100 |
| Bloques intermedios supervisados | 13 / 17 / 21 (indexacion desde cero) |
| Dominios de entrenamiento | Matematicas y codigo |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de la familia Qwen2 con normalizacion RMSNorm, atencion multi-cabeza con RoPE y 7,62 mil millones de parametros. No hay cambios estructurales; el checkpoint es un fine-tune completo del estudiante sobre esa inicializacion, en BF16 safetensors, con el tokenizador y la `generation_config` originales. La model card incluye `checksums.json` con los SHA256 de los ficheros subidos.

El metodo es el nucleo diferencial. OPTD retiene la destilacion de politica final (OPD) y anade un termino que alinea los incrementos de log-probabilidad profesor-estudiante en los bloques 13, 17 y 21, ademas de la salida final, evaluados sobre rollouts generados por el propio estudiante (de ahi lo de on-policy). La actualizacion practica utiliza identidades de candidatos del top-16 de la politica final fija y recompensas de transicion separadas del grafo de gradientes (`detached`), junto con las probabilidades del estudiante en la capa de destino. El entrenamiento se limita a 100 actualizaciones en los dominios de matematicas y codigo; no se documentan en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset, ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de `text-generation-inference`.
- Razonamiento matematico paso a paso heredado de DeepSeek-R1-Distill, con modo de razonamiento nativo activado por plantilla.
- Generacion de codigo, orientada al dominio de codigo usado durante la destilacion.
- Razonamiento multi-paso de cadena larga (la model card usa `max_new_tokens=1024` en el ejemplo de generacion).
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.
- No se documentan tool calling, function calling, capacidades de agente, vision ni audio en la informacion proporcionada.

## Casos de uso

- Replicacion de investigacion en destilacion: sirve como estudiante de referencia para reproducir el articulo de OPTD, ya que los metadatos indican los bloques supervisados (13/17/21), el numero de actualizaciones (100) y los dominios (matematicas y codigo), lo que permite montar el mismo pipeline con otros profesores o tamanos.
- Destilacion de especialistas a estudiantes de 7B: el checkpoint demuestra la receta sobre un modelo que cabe en una GPU de 24 GB en BF16, lo que abarata las iteraciones de experimentacion frente a estudiantes de mayor escala.
- Generacion de trazas de razonamiento para datos sinteticos: con la plantilla de razonamiento nativa se pueden producir cadenas de solucion para matematicas y codigo que luego se filtran y se usan como corpus de entrenamiento o evaluacion.
- Evaluacion comparativa de metodos de alineacion: al compartir inicializacion con `DeepSeek-R1-Distill-Qwen-7B`, permite aislar el efecto de OPTD frente al modelo base manteniendo tokenizador, plantilla y configuracion de generacion identicas.
- Resolucion de problemas matematicos en entornos de investigacion educativa: el modelo acepta enunciados tipo "Solve 2x + 5 = 17" con decodificacion por muestreo (temperatura 0,7, top_p 0,95) y genera el desarrollo completo, util para analizar errores de razonamiento a escala.
- Generacion de codigo con validacion en sandbox: la model card recomienda explicitamente evaluar el codigo generado en un entorno aislado, de modo que el caso realista es un pipeline de generacion mas ejecucion de tests en contenedor, no su despliegue directo.
- Analisis de dinamica interna en mitad de la red: al estar entrenado con supervision en los bloques 13, 17 y 21, es un sujeto de estudio para analisis de representaciones intermedias y de como la senal del profesor se propaga capa a capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte de que las comparaciones con el articulo requieren el checkpoint original, el mismo modo de prompt, las mismas revisiones de benchmark, el mismo numero de muestras y los mismos graders, y que una generacion de ejemplo no reproduce las puntuaciones del paper.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 15,2 GB solo de pesos, mas cache KV; en la practica se necesita una GPU de 24 GB para secuencias medias con `device_map="auto"`.
- VRAM estimada en 8 bits: en torno a 8-9 GB de pesos, con overhead adicional de activaciones y cache.
- VRAM estimada en 4 bits (si se convierte a GGUF/AWQ/GPTQ, no publicado): aproximadamente 4,5-5,5 GB, lo que permite caber en GPUs consumer de 8-12 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB o H100 para servir varias peticiones concurrentes o contexto largo; RTX 4090, RTX 3090, A6000 o L40S (24-48 GB) para inferencia en BF16 de una sola instancia.
- Cabe en GPU consumer: si, en RTX 4090/3090 (24 GB) sin cuantizar en BF16; en RTX 4080/4070 Ti Super (16 GB) o RTX 4060 Ti (16 GB) requiere cuantizacion de 8 bits o inferior; en GPUs de 8 GB solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: `transformers` (ruta documentada en la model card), TGI (`text-generation-inference` aparece en los tags), vLLM y SGLang como servidores compatibles con arquitectura Qwen2; llama.cpp u Ollama solo tras convertir los pesos a GGUF, conversion que el autor no publica.
- Latencia y throughput: no disponibles. El repositorio no incluye mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OPTD-DeepSeek-R1-Distill-Qwen-7B-Late | 7.615.616.512 | No disponible | No disponible (remite a upstream) | HuggingFace, 0 descargas | Fine-tune de 100 pasos con OPTD; sin benchmarks publicados |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (modelo base) | 7.615.616.512 (misma inicializacion) | No disponible en la informacion proporcionada | La del modelo base (consultar su model card) | Ampliamente distribuido | Referencia directa para medir el efecto de OPTD |
| Otros estudiantes de la familia DeepSeek-R1-Distill (p. ej. variante Llama-8B) | Aprox. 8 mil millones | No disponible | La del modelo base correspondiente | Publicos en HuggingFace | Alternativa de tamano comparable para destilacion de razonamiento |
| Qwen2.5-7B-Instruct | Aprox. 7,6 mil millones | No disponible | La del modelo base correspondiente | Publico en HuggingFace | Alternativa generalista; no es un modelo de razonamiento destilado de R1 |

No se dispone de datos de rendimiento comparado (MMLU, GSM8K, HumanEval u otros) para este checkpoint en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigacion: 100 actualizaciones sobre dos dominios no equivalen a un ajusteInstruction completo; el comportamiento fuera de matematicas y codigo puede degradarse respecto al modelo base.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a otros metodos de destilacion.
- La model card advierte de que las salidas pueden ser incorrectas o seguir instrucciones no deseadas; el riesgo de alucinacion en razonamientos matematicos y en codigo es real y no esta mitigado por guardrails.
- El codigo generado debe ejecutarse en un sandbox aislado antes de cualquier uso; no se debe confiar en el en la cadena de build sin validacion.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado ni garantizado.
- Licencia: no hay concesion nueva. Cualquier redistribucion o despliegue comercial depende de los terminos upstream del estudiante y del especialista, que deben consultarse por separado.
- Validacion social nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar calidad.
- No se incluyen estados del optimizador ni shards de entrenamiento, lo que impide reanudar el entrenamiento desde este repositorio.
- La ventana de contexto efectiva no esta documentada para este checkpoint; asumir la del modelo base sin verificacion puede provocar degradacion silenciosa en prompts largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ModalityDance/OPTD-DeepSeek-R1-Distill-Qwen-7B-Late
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Articulo citado en la model card: *On-Policy Transition Distillation* (sin URL proporcionada en la informacion disponible)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo, al articulo ni a repositorios asociados; los resultados devueltos no guardan relacion con el modelo.
