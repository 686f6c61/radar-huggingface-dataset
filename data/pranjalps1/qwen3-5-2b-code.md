# Pranjalps1/Qwen3.5-2b-code

## Resumen

Pranjalps1/Qwen3.5-2b-code es un finetune del modelo Qwen3.5-2B de Alibaba Cloud, especializado en generación y comprensión de código, convertido a formato GGUF mediante Unsloth para su ejecución eficiente con llama.cpp. El autor, Pranjalps1, ha publicado además variantes hermanas orientadas a tool calling (it-tool) y razonamiento (reasoning), lo que sugiere una familia de modelos derivados del mismo base.

El modelo combina capacidades de razonamiento (modo "think" presente en el nombre de los archivos) con un proyector multimodal (mmproj) en BF16, lo que indica soporte de visión además de texto. Con aproximadamente 2,27 mil millones de parámetros, está diseñado para entornos con recursos limitados, pudiendo ejecutarse en GPUs de consumo o incluso en CPU mediante cuantización Q4_K_M. Su relevancia radica en ofrecer una alternativa ligera y multimodal para tareas de código, aprovechando las mejoras de la serie Qwen3.5 frente a generaciones anteriores, especialmente en razonamiento y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer denso, sin confirmar) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), BF16 (mmproj) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingue) |
| Licencia | no disponible |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, la serie más reciente de Alibaba Cloud que introduce una arquitectura unificada de visión-lenguaje con entrenamiento de fusión temprana en tokens multimodales, logrando paridad con Qwen3 y superando a Qwen3-VL en razonamiento, código, agentes y comprensión visual. Sobre esta base, el autor aplicó un finetune orientado a código y convirtió los pesos a GGUF usando Unsloth, que acelera el entrenamiento aproximadamente 2 veces.

Los archivos publicados incluyen un GGUF cuantizado Q4_K_M (para el modelo de lenguaje principal) y un proyector multimodal BF16 (mmproj), lo que indica que el finetune conserva las capacidades de visión del base. El nombre "think" en los archivos sugiere que se ha mantenido o reforzado el modo de razonamiento con tokens de pensamiento, característico de la serie Qwen3.5. No se dispone de detalles sobre el dataset de finetune, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de codigo: finetune especifico para tareas de programacion, incluyendo completado, generacion y explicacion de codigo.
- Razonamiento: modo "think" integrado, que permite generar cadenas de pensamiento antes de responder.
- Vision: proyector multimodal (mmproj) incluido, lo que habilita entrada de imagenes junto con texto.
- Conversacional: disenado para interacciones multi-turno, segun los tags del repositorio.
- Compatibilidad con llama.cpp: formato GGUF listo para usar con llama-cli y llama-mtmd-cli (este ultimo para multimodal).
- Tool calling: aunque este finetune no lo declara explicitamente, el autor publico una variante hermana (it-tool) con esa capacidad, lo que sugiere que el base la soporta.

## Casos de uso

- Asistente de codigo en local: al ser un modelo de 2B cuantizado, puede ejecutarse en portatiles o estaciones de trabajo sin GPU dedicada, proporcionando autocompletado y sugerencias de codigo offline.
- Generacion de documentacion tecnica: dado su finetune en codigo, puede generar comentarios, docstrings y documentacion de APIs a partir de fragmentos de codigo.
- Explicacion de codigo legacy: util para interpretar codigo antiguo o poco documentado, aprovechando el modo de razonamiento para desglosar la logica.
- Analisis de capturas de pantalla de errores: gracias al componente de vision, puede recibir una imagen con un stack trace o un error visual y sugerir correcciones.
- Educacion y formacion en programacion: como tutor interactivo que responde preguntas sobre conceptos de programacion y resuelve dudas con ejemplos.
- Prototipado rapido: en entornos de desarrollo integrado con llama.cpp, permite generar esqueletos de funciones o scripts sin depender de servicios en la nube.
- Automatizacion de tareas de refactorizacion: con el modo think, puede proponer mejoras estructurales en el codigo, aunque su tamano limitado requiere supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este finetune en la informacion disponible. El modelo base Qwen3.5-2B, segun las notas de la serie, supera a Qwen3-VL en razonamiento, codigo, agentes y comprension visual, pero no se proporcionan cifras concretas en las fuentes consultadas. Se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M, el modelo ocupa aproximadamente 1,2-1,5 GB en memoria (2,27 B parametros × 4 bits), mas overhead de contexto y cache. En la practica, se recomiendan 2-4 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM, como RTX 3050, RTX 4060, GTX 1660 Super, o iGPUs modernas con suficiente memoria compartida. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con hardware de consumo: si, es uno de los puntos fuertes del modelo al ser de 2B.
- Opciones de despliegue: llama.cpp (llama-cli y llama-mtmd-cli), llama-cpp-python, Ollama (si se importa el GGUF), y cualquier framework compatible con GGUF como LM Studio.
- Latencia y throughput estimados: no disponibles. En una RTX 4060 se esperan decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | 2,27 B | no disponible | Si | Apache 2.0 (segun serie Qwen) | HuggingFace, Ollama |
| Qwen3-2B (anterior) | 2,27 B | 32k | No | Apache 2.0 | HuggingFace |
| Qwen3-VL-2B | 2,27 B | 32k | Si | Apache 2.0 | HuggingFace |
| Pranjalps1/Qwen3.5-2b-code | 2,27 B | no disponible | Si | no disponible | HuggingFace (GGUF) |

La comparativa se basa en datos publicos de la serie Qwen; el finetune de Pranjalps1 anade una capa de especializacion en codigo y formato GGUF, pero carece de licencia explicita y de benchmarks propios.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara la licencia, lo que impide su uso comercial sin autorizacion explicita del autor. Se recomienda contactar con Pranjalps1 antes de cualquier despliegue en produccion.
- Tamano reducido: con 2,27 B parametros, el modelo tiene una capacidad limitada frente a modelos de 7B o superiores; puede cometer errores en tareas complejas de codigo o razonamiento.
- Riesgo de alucinacion: como todo LLM, puede generar codigo incorrecto o inventar APIs inexistentes. La supervision humana es imprescindible.
- Sin datos de entrenamiento: se desconoce la composicion del dataset de finetune, lo que impide evaluar sesgos o cobertura de lenguajes de programacion.
- Contexto no confirmado: no se ha publicado la longitud de contexto soportada; puede ser inferior a la del base si el finetune la recorto.
- Soporte limitado: al ser un proyecto de un unico autor, no hay garantias de mantenimiento, correccion de errores o actualizaciones.
- Fecha de creacion inusual: el repositorio indica una fecha de creacion en agosto de 2026, lo que podria ser un error o un dato ficticio; se recomienda verificar la autenticidad del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Pranjalps1/Qwen3.5-2b-code
- Variante tool calling: https://huggingface.co/Pranjalps1/Qwen3.5-2b-it-tool
- Variante razonamiento: https://huggingface.co/Pranjalps1/Qwen3.5-2b-reasoning
- Serie Qwen3.5 (GitHub oficial): https://github.com/QwenLM/Qwen3.8
- Pagina de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Entrada en Ollama: https://ollama.com/library/qwen3.5:2b
