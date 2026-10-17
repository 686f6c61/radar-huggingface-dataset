# Oscilla/MiniCPM-V-4.7-1B-OptiQ-4bit

## Resumen

MiniCPM-V-4.7-1B-OptiQ-4bit es una versión cuantizada del modelo multimodal openbmb/MiniCPM-V-4.7-1B, publicada por el usuario Oscilla y construida con la herramienta mlx-optiq, un toolkit nativo de MLX para cuantizar, ajustar y servir modelos localmente en Apple Silicon. El modelo base combina una torre de visión SigLIP NaViT con una torre de lenguaje Qwen3.5 densa de 24 capas con atención híbrida lineal/completa y una ventana de contexto de 262.000 tokens. El resultado es un VLM de aproximadamente 1.006 millones de parámetros que acepta entrada imagen-texto y genera texto.

La particularidad de esta publicación es su esquema de cuantización mixta guiado por sensibilidad: OptiQ midió la sensibilidad de cada una de las 187 capas y mantuvo 64 en 8 bits mientras que las 123 restantes quedaron en 4 bits, dejando además la torre de visión en bf16 sin cuantizar. Según la model card, esto eleva la Capability Score media de 48,17 (cuantización uniforme de 4 bits) a 52,48, con las mayores ganancias en HumanEval (50,6 frente a 32,9) y GSM8K (69,8 frente a 65,1), a costa de una pérdida en function calling (BFCL-V3 baja de 48,5 a 41,5).

Su relevancia actual es doble: por un lado demuestra que la cuantización mixta por capas puede recuperar capacidades de razonamiento y código que una cuantización uniforme agresiva degrada de forma notable en modelos pequeños; por otro, ofrece un VLM de 1B desplegable en un portátil con Apple Silicon en unos 2 GB en disco, sin PyTorch ni servicios en la nube, con endpoint compatible con OpenAI y Anthropic a través de `optiq serve`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM con torre de vision SigLIP NaViT (bf16) y torre de lenguaje Qwen3.5 densa, 24 capas, atencion hibrida lineal/completa |
| Parametros totales | 1.006.209.856 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (segun la model card del cuantizado) |
| Tipos de cuantizacion | Mixta por capas: 123 capas a 4 bits y 64 capas a 8 bits; torre de vision en bf16; KV cache mixto 4/8 bits definido en `kv_config.json` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); pesos de vision en `optiq/optiq_vision.safetensors` y configuracion de KV en `kv_config.json` |

Otros datos tecnicos: repositorio de 1,9 GB, de los cuales la model card indica 0,80 GB para la torre de lenguaje y 1,10 GB para la torre de vision. Libreria declarada: `mlx`. Pipeline: `image-text-to-text`. Modelo base: openbmb/MiniCPM-V-4.7-1B.

## Arquitectura y entrenamiento

El modelo base MiniCPM-V 4.7 1B es un transformer multimodal compuesto por dos torres. La torre de visión es un SigLIP NaViT que codifica las imágenes y las proyecta al espacio del lenguaje; en esta publicacion concreta permanece en bf16, sin cuantizar, lo que preserva la calidad de la representacion visual. La torre de lenguaje es un Qwen3.5 denso de 24 capas que combina atención lineal y atención completa (esquema híbrido), lo que reduce el coste de cómputo y memoria sobre secuencias largas manteniendo acceso global donde es necesario, y declara 262.000 tokens de contexto.

No se proporciona en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base; tampoco se detalla el proceso de destilado o alineacion. La innovacion tecnica documentada en esta publicacion es el propio metodo OptiQ: un procedimiento de cuantizacion de precision mixta guiado por sensibilidad que asigna 4 o 8 bits por capa en funcion de la sensibilidad medida, en lugar de aplicar una precision uniforme. El reparto final es 64 capas a 8 bits y 123 a 4 bits, y el etiquetado "4bit" sigue la convencion de llama.cpp para cuants mixtos: denota la familia, no la media ponderada real. Se incluye tambien una configuracion de KV cache en precision mixta (4/8 bits) restringida a las capas de atencion completa. La integracion requiere `mlx-optiq>=0.5.25`, ya que mlx-lm de serie no reconoce la arquitectura `minicpmv4_7`; `import optiq` la registra y carga el sidecar de vision.

## Capacidades

- Generacion de texto e inferencia sobre texto: la model card muestra generacion directa (`generate`) con plantilla de chat, verificada con un ejemplo de texto.
- Comprension de imagen y respuesta a preguntas sobre imagenes (image-text-to-text): el ejemplo documentado consiste en leer el texto "OPTIQ 42" de una imagen en fondo blanco.
- Razonamiento de sentido comun y conocimiento general: 55,3 % en MMLU (5-shot, 969 muestras).
- Matematicas de nivel escolar: 69,8 % en GSM8K (1000 muestras).
- Generacion de codigo: 50,6 % pass@1 en HumanEval (164 problemas).
- Seguimiento de instrucciones: 74,7 % en IFEval (conjunto completo, estricto).
- Recuperacion en contexto largo: 23,0 % en HashHop, sobre una ventana declarada de 262.000 tokens.
- Function calling / tool calling: soportado, aunque es la capacidad mas degradada por la cuantizacion (41,5 % en BFCL-V3 simple, 200 llamadas).
- Despliegue como servicio con API compatible con OpenAI y Anthropic mediante `optiq serve`, aceptando imagenes como contenido `image_url`.
- Ejecucion local en Apple Silicon sin PyTorch ni servicios en la nube.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Lectura y extraccion de texto en imagenes (OCR ligero): el modelo resuelve tareas de reconocimiento de texto corto en imagenes, como el ejemplo verificado de "OPTIQ 42", adecuado para digitalizar etiquetas, tickets o capturas en local.
- Asistente visual de escritorio en Mac: al ejecutarse sobre MLX con unos 2 GB de pesos, permite mantener un asistente que responde sobre capturas de pantalla o imagenes sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Clasificacion y descripcion de imagenes en lotes pequenos: para pipelines de catalogacion donde se necesita una descripcion textual o una etiqueta por imagen, el modelo cabe en memoria y puede servirse con endpoint compatible con OpenAI.
- Prototipado rapido de aplicaciones multimodales: la API compatible con OpenAI y Anthropic permite sustituir un backend en la nube por este modelo local sin reescribir el cliente, lo que acelera la validacion de ideas.
- Generacion de codigo asistida en local: con 50,6 % pass@1 en HumanEval, es util como autocompletado o generador de funciones sencillas dentro de un editor en un Mac, especialmente donde no se permite enviar codigo a servicios externos.
- Razonamiento matematico y de sentido comun de nivel basico: con 69,8 % en GSM8K y 55,3 % en MMLU sirve para tareas de apoyo educativo, resolucion de problemas escolares y respuesta a preguntas factuales sencillas.
- Recuperacion sobre documentos largos: la ventana de 262.000 tokens permite pasar documentos extensos completos, aunque el rendimiento medido en recuperacion (HashHop 23,0) aconseja validar el caso concreto antes de produccion.
- Agentes con tool calling de baja criticidad: el soporte de function calling existe, pero la caida a 41,5 % en BFCL-V3 desaconseja usarlo en flujos donde una llamada mal formada tenga consecuencias; es mas adecuado para prototipos de agente.

## Benchmarks y rendimiento

Datos publicados en la model card del cuantizado, comparados con una cuantizacion uniforme de 4 bits del mismo modelo base:

| Metrica | 4-bit uniforme | OptiQ mixto |
|---|---:|---:|
| MMLU (5-shot, 969 muestras) | 54,0 % | 55,3 % |
| GSM8K (1000 muestras) | 65,1 % | 69,8 % |
| IFEval (conjunto completo, estricto) | 71,5 % | 74,7 % |
| BFCL-V3 simple (200 llamadas) | 48,5 % | 41,5 % |
| HumanEval (164 problemas, pass@1) | 32,9 % | 50,6 % |
| HashHop (recuperacion en contexto largo) | 17,0 % | 23,0 % |
| Capability Score (media de 6) | 48,17 | 52,48 |

No se han publicado resultados del modelo base en bf16 dentro de la informacion disponible, por lo que no es posible cuantificar la perdida total respecto al modelo sin cuantizar.

## Requisitos de hardware

- Pesos en disco: 1,9 GB en total (0,80 GB de torre de lenguaje + 1,10 GB de torre de vision, segun la model card).
- Memoria unificada estimada para inferencia: aproximadamente 2 GB para los pesos, mas el KV cache; con KV cache mixto 4/8 bits el consumo adicional es reducido, aunque no se publican cifras concretas de VRAM.
- Plataforma objetivo: Apple Silicon. La libreria declarada es MLX y el modelo esta pensado para ejecutarse en Macs con memoria unificada (familias M1, M2, M3, M4 y posteriores).
- GPU CUDA: no disponible. La publicacion no documenta soporte para A100, H100 o RTX 4090, y el formato de pesos es MLX, no GGUF ni safetensors de PyTorch.
- Cabe en GPU de consumo: no aplica en el sentido habitual; el equivalente es que cabe holgadamente en cualquier Mac con 8 GB o mas de memoria unificada.
- Opciones de despliegue: `optiq serve` (endpoint compatible con OpenAI y Anthropic) o carga directa con `mlx_lm.load` y `mlx_lm.generate` tras `import optiq`. Requiere `mlx-optiq>=0.5.25`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HumanEval | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Oscilla/MiniCPM-V-4.7-1B-OptiQ-4bit | 1,006 M | 262.000 | 55,3 % | 50,6 % | 69,8 % | apache-2.0 | MLX, Apple Silicon |
| Cuantizacion uniforme 4-bit del mismo base | 1,006 M | 262.000 | 54,0 % | 32,9 % | 65,1 % | apache-2.0 | MLX |
| openbmb/MiniCPM-V-4.7-1B (base, bf16) | 1,006 M | 262.000 | no disponible | no disponible | no disponible | apache-2.0 | safetensors/PyTorch |

No se dispone, en la informacion proporcionada, de resultados comparables de otros VLM de tamano similar (por ejemplo alternativas de la familia Qwen-VL o LLaVA), por lo que no se incluyen en la tabla para no introducir datos no verificados.

## Limitaciones y advertencias

- La cuantizacion degrada el function calling: BFCL-V3 baja de 48,5 a 41,5 respecto al cuantizado uniforme, y la propia model card atribuye la perdida a llamadas que el modelo directamente no emite. No es fiable para agentes con tool calling critico.
- La recuperacion en contexto largo es debil: 23,0 % en HashHop, muy por debajo de lo que sugiere una ventana nominal de 262.000 tokens. Un contexto amplio no garantiza recuperacion fiable de la informacion.
- Riesgo de alucinacion: es un modelo de 1B parametros; se espera una tasa de error factual alta en conocimiento abierto (MMLU 55,3 %). No debe usarse como fuente de verdad sin verificacion.
- Idiomas soportados: no disponibles. No hay garantia documentada de calidad en castellano ni en otros idiomas distintos del ingles de evaluacion.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion proporcionada.
- Restricciones de licencia: el modelo se publica bajo apache-2.0, lo que permite uso comercial, pero se debe verificar la licencia del modelo base openbmb/MiniCPM-V-4.7-1B y de la herramienta mlx-optiq, que no se detalla aqui.
- Dependencia de herramienta: mlx-lm de serie no reconoce la arquitectura `minicpmv4_7`; es obligatorio `mlx-optiq>=0.5.25` y el registro de `optiq`. Esto limita la portabilidad fuera del ecosistema MLX.
- Inconsistencia de identificador: la ficha de HuggingFace figura como `Oscilla/MiniCPM-V-4.7-1B-OptiQ-4bit`, mientras que el README interno se refiere al repositorio como `mlx-community/MiniCPM-V-4.7-1B-OptiQ-4bit`. Conviene comprobar cual es el repositorio canonico y si los comandos de descarga del README apuntan al artefacto correcto.
- Metricas sin validacion independiente: todos los numeros de benchmark proceden de la model card del autor, con tamanos de muestra pequenos en algunos casos (969 para MMLU, 200 llamadas para BFCL-V3, 164 problemas en HumanEval).
- Modelo recien publicado y sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/MiniCPM-V-4.7-1B-OptiQ-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Sitio del proyecto mlx-optiq: https://mlx-optiq.com/
- Guia de la familia MiniCPM en OptiQ: https://mlx-optiq.com/docs/minicpm
- Catalogo de cuantizados OptiQ: https://mlx-optiq.com/models
- Documentacion de OptiQ: https://mlx-optiq.com/docs/
