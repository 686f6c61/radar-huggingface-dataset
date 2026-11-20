# OliviaRossi/Qwopus3.8-27B-SuperAdapter

## Resumen

Qwopus3.8-27B-SuperAdapter es un checkpoint fusionado (merged checkpoint) publicado por OliviaRossi que aplica el adaptador LoRA `harness-hub/Qwen3.8-27B-super-adapter` sobre el modelo base `Qwen/Qwen3.8-27B`. El resultado es un modelo denso de aproximadamente 27.780 millones de parametros (27,78 B) empaquetado en safetensors, con licencia Apache 2.0 y pipeline declarado como image-text-to-text, lo que sugiere capacidades multimodales heredadas del modelo base. La fusion se realizo con `LORA_STRENGTH=1.0` sobre 256 matrices objetivo LoRA (rank 96, alpha 192,0) en precision float32.

El interes de este checkpoint reside en que elimina la necesidad de cargar el adaptador por separado: las capacidades del fine-tuning (orientado a coding agentico, segun la etiqueta `agentic-coding`) quedan integradas directamente en los pesos del modelo, simplificando el despliegue en pipelines de inferencia. Ademas, el autor sincroniza una plantilla de chat propia (`OliviaRossi/Improved-Chat-Template-for-Qwen-3.x`) tanto en `chat_template.jinja` como en `tokenizer_config.json`, lo que busca mejorar el comportamiento conversacional respecto a la plantilla original de Qwen.

Se trata de un modelo muy reciente (publicado en noviembre de 2026) y con escasa traccion en la comunidad: cero descargas y cero likes en el momento de la consulta. No hay informacion publicada sobre benchmarks, idiomas soportados ni detalles del dataset de entrenamiento del adaptador, por lo que esta ficha se limita a los datos verificables del repositorio y a las especificaciones inferibles del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.x, tag `qwen3.5`/`qwen3.8`); multimodal image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el repo solo distribuye safetensors en float32/bf16; no se publican GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 55,6 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen 3.x (27,78 B parametros). Sobre el checkpoint base `Qwen/Qwen3.8-27B` se aplico una fusion LoRA: el adaptador `harness-hub/Qwen3.8-27B-super-adapter` tiene rank 96 y alpha 192,0, y afecta 256 matrices objetivo, fusionadas en float32 con fuerza 1.0. Esta tecnica de merge absorbe los pesos del adaptador en las matrices del modelo base, de modo que la inferencia no requiere cargar modulos LoRA adicionales ni aplicar escalado en tiempo de ejecucion.

El adaptador original esta etiquetado como `agentic-coding`, lo que indica que el fine-tuning se oriento a tareas de codigo con uso de herramientas y razonamiento multi-paso. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La politica `MTP Policy: keep_base` indica que las cabezas de prediccion multi-token del modelo base se conservan sin modificacion. La plantilla de chat personalizada sustituye la original de Qwen 3.x, presumiblemente para mejorar la gestion de turnos, system prompts y formato de tool calling, aunque el autor no documenta los cambios concretos.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat propia sincronizada en tokenizer y configuracion.
- Razonamiento orientado a codigo agentico (`agentic-coding`): el adaptador se entreno especificamente para este dominio.
- Capacidades multimodales image-text-to-text heredadas del modelo base Qwen3.8-27B (pipeline declarado `image-text-to-text`).
- Soporte de tool calling / function calling: inferido del enfoque agentico del adaptador y de la plantilla de chat mejorada, aunque no se documenta explicitamente en la model card.
- Razonamiento multi-paso y uso de agentes: inferido de la etiqueta `agentic-coding`.
- Capacidades multilingues: no disponibles (no se declaran idiomas en el repositorio).
- Modo thinking: no disponible en la informacion proporcionada.
- Vision: si, por el pipeline `image-text-to-text` declarado.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse como backend de autocompletado y refactorizacion de codigo, aprovechando el fine-tuning agentico del adaptador para generar parches multi-archivo y explicar cambios en lenguaje natural.
- Agente autonomo de resolvedores de issues: con soporte previsible de tool calling, puede encadenar lectura de repositorio, ejecucion de tests y propuesta de pull requests, aunque requiere validacion empirica del formato de herramientas con la plantilla de chat del autor.
- Revision de codigo automatizada en CI/CD: el checkpoint fusionado se carga una sola vez sin adaptador adicional, lo que simplifica el despliegue en runners que evaluan diffs y sugieren correcciones.
- Analisis de capturas de pantalla y diagramas tecnicos: al ser image-text-to-text, puede procesar imagenes de interfaces, errores de consola o diagramas de arquitectura y generar descripciones o codigo asociado.
- Asistente conversacional tecnico con contexto largo: adecuado para sesiones de depuracion multi-turno donde el usuario alterna preguntas, fragmentos de codigo e imagenes.
- Generacion de documentacion tecnica a partir de repositorios: puede resumir modulos, generar docstrings y producir guias de integracion combinando texto e imagenes de diagramas.
- Prototipado de agentes de investigacion: util como checkpoint base para experimentar con plantillas de chat alternativas y evaluar el efecto del merge LoRA frente al adaptador cargado por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y el repositorio no referencia ningun informe tecnico o leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55-56 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se requieren 64 GB o mas de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 28-30 GB de pesos, viable en una RTX 5090 (32 GB) o A100 40 GB con contexto limitado; no se distribuyen pesos cuantizados en el repositorio, por lo que habria que cuantizar localmente.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-16 GB de pesos, potencialmente viable en RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto reducido; requiere conversion manual a GGUF o AWQ/GPTQ.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en precision completa; A100 40 GB o RTX 5090 para 8 bits; RTX 4090/3090 para 4 bits con contexto limitado.
- Cabe en GPU de consumo: solo en cuantizaciones de 4-8 bits generadas por el usuario; el checkpoint safetensors original no cabe en GPUs de consumo.
- Opciones de despliegue: vLLM, TGI y SGLang para safetensors; llama.cpp y Ollama tras conversion a GGUF; transformers con `AutoModelForImageTextToText` para el pipeline multimodal.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-SuperAdapter | 27,78 B | no disponible | Apache 2.0 | safetensors | Checkpoint fusionado con LoRA agentico y plantilla de chat propia |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | Apache 2.0 (segun repositorio base) | safetensors | Modelo base sin fine-tuning agentico |
| harness-hub/Qwen3.8-27B-super-adapter | Adaptador LoRA (rank 96) | no disponible | no disponible | safetensors (LoRA) | Requiere carga separada del adaptador sobre el base |
| OliviaRossi/QuadQwen | no disponible | no disponible | no disponible | no disponible | Otro checkpoint del mismo autor; sin datos publicados |

La comparativa con alternativas de terceros no es posible con datos verificables: no se dispone de benchmarks ni de especificaciones de contexto para situar este checkpoint frente a otros modelos de ~27 B.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del merge frente al adaptador cargado por separado ni frente al modelo base.
- Cero adopcion comunitaria (0 descargas, 0 likes): no existe validacion externa de calidad, estabilidad o regresiones introducidas por el merge.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala; el fine-tuning agentico puede aumentar la confianza en tool calls incorrectos si el formato de herramientas no coincide con el esperado.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento del adaptador ni procesos de filtrado.
- Idiomas no declarados: no se garantiza soporte multilingue mas alla del que herede el modelo base.
- Contexto no documentado: la longitud de ventana no figura en la model card; planificar despliegues con contexto conservador hasta verificarlo empiricamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del adaptador original (`harness-hub/Qwen3.8-27B-super-adapter`) y del modelo base, ya que la model card no detalla obligaciones de atribucion adicionales.
- Plantilla de chat modificada: el uso de una plantilla propia puede romper compatibilidades con herramientas que asumen el formato estandar de Qwen 3.x; validar prompts de sistema y tool calling antes de produccion.
- Checkpoint de 55,6 GB: el despliegue en precision completa exige hardware de datacenter; no hay variantes cuantizadas oficiales.
- Fecha de publicacion muy reciente (noviembre de 2026): posible inestabilidad del repositorio y falta de ecosistema de herramientas adaptadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-SuperAdapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Plantilla de chat del autor: https://huggingface.co/OliviaRossi/Improved-Chat-Template-for-Qwen-3.x
- Perfil del autor en Hugging Face: https://huggingface.co/OliviaRossi
- Otro checkpoint del autor: https://huggingface.co/OliviaRossi/QuadQwen
