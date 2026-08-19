# ayan4m1/Qwen3.5-4B-E2E-Tests-GGUF

## Resumen

Qwen3.5-4B-E2E-Tests es un modelo de lenguaje y vision (VLM) de 4.326 millones de parametros, desarrollado por el usuario ayan4m1 como un fine-tuning del modelo base unsloth/Qwen3.5-4B. El modelo ha sido convertido a formato GGUF mediante la herramienta Unsloth, lo que permite su ejecucion eficiente en CPU y GPU consumer mediante llama.cpp y otros motores compatibles con GGUF. Se trata de un modelo denso de 4B parametros con capacidad nativa de procesamiento de imagenes y texto, pensado para despliegue local y pruebas de integracion.

La relevancia de este modelo radica en su naturaleza multimodal (image-text-to-text) combinada con un tamano compacto que lo hace viable en hardware de consumo. El autor lo presenta como un modelo de pruebas E2E (end-to-end), lo que sugiere que su proposito principal es validar pipelines de inferencia multimodal con llama.cpp. El modelo esta entrenado sobre el dataset aiqualitylab/ai-natural-language-tests y soporta ingles y chino. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Transformer denso (basado en Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (segun datos de Qwen3.5-4B) |
| Tipos de cuantizacion | Q8_0 (modelo principal) y BF16 (proyector multimodal mmproj) |
| Idiomas soportados | Ingles (en), Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0 y BF16-mmproj) |

## Arquitectura y entrenamiento

Qwen3.5-4B-E2E-Tests hereda la arquitectura del modelo Qwen3.5-4B, que es un transformer denso de 4.000 millones de parametros con capacidades nativas de vision y lenguaje. Segun la informacion disponible, Qwen3.5 integra avances en aprendizaje multimodal, eficiencia arquitectonica y escalado de aprendizaje por refuerzo. El modelo base soporta una longitud de contexto nativa de 262.144 tokens, lo que lo posiciona como un modelo de contexto muy largo para su tamano.

El proceso de entrenamiento de este modelo especifico consistio en un fine-tuning sobre el dataset aiqualitylab/ai-natural-language-tests, seguido de una conversion a formato GGUF utilizando la herramienta Unsloth. El autor indica que el entrenamiento fue 2 veces mas rapido gracias a Unsloth. No se proporcionan detalles adicionales sobre el proceso de entrenamiento, como el numero de tokens de entrenamiento, la composicion exacta del dataset o si se aplicaron tecnicas de RLHF o DPO. El repositorio incluye dos archivos: el modelo principal cuantizado en Q8_0 y un proyector multimodal (mmproj) en BF16, necesario para procesar entradas de imagen.

## Capacidades

- Generacion de texto y comprension de lenguaje natural en ingles y chino.
- Comprension de imagenes (vision): el modelo es un VLM nativo, capaz de procesar entradas de imagen junto con texto.
- Razonamiento multimodal: puede responder preguntas sobre imagenes y combinar informacion visual y textual.
- Contexto largo: soporta hasta 262.144 tokens de contexto, lo que permite procesar documentos extensos o conversaciones muy largas.
- Despliegue local eficiente: al estar en formato GGUF Q8_0, puede ejecutarse en CPU y GPU consumer con llama.cpp o motores compatibles.
- Compatibilidad con chat: el modelo esta etiquetado como "conversational" y soporta plantillas Jinja para chat.
- No se ha confirmado soporte de tool calling, function calling o modo agente en la informacion disponible.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede procesar PDFs, capturas o diagramas junto con texto, extrayendo informacion relevante de ambos modos. Su contexto de 262K tokens permite procesar documentos extensos completos en una sola pasada.
- Asistencia visual para personas con discapacidad: combinando la entrada de imagen con preguntas en lenguaje natural, el modelo puede describir escenas, leer texto en imagenes o identificar objetos en tiempo real desde un dispositivo local.
- Traduccion y transcripcion multimodal: al soportar ingles y chino, puede traducir texto presente en imagenes (como carteles o menus) entre ambos idiomas, sin depender de servicios en la nube.
- Chatbots locales con memoria larga: gracias a su contexto de 262K tokens, puede mantener conversaciones muy extensas con historial completo, adecuado para asistentes personales o atencion al cliente en entornos con requisitos de privacidad.
- Prototipado y pruebas E2E de pipelines multimodales: como indica su nombre, es util para validar integraciones de VLM con llama.cpp, probar la carga de modelos GGUF con proyector multimodal o evaluar latencias en hardware especifico.
- Clasificacion y moderacion de contenido visual: el modelo puede analizar imagenes y generar descripciones o clasificaciones automaticas, util para pipelines de moderacion en plataformas que requieren procesamiento local.
- Educacion y tutorizacion: puede responder preguntas sobre diagramas, graficos o problemas matematicos presentados como imagen, actuando como tutor interactivo en entornos sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un fine-tuning de pruebas sobre el dataset aiqualitylab/ai-natural-language-tests, y el autor no proporciona metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) en la model card. Los datos de rendimiento del modelo base Qwen3.5-4B estan disponibles en los canales oficiales de Qwen, pero no se han verificado para esta variante especifica.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 de un modelo de 4,3B parametros ocupa aproximadamente 4,5-5 GB en disco. En inferencia, se recomienda al menos 6-8 GB de VRAM para cargar el modelo y el proyector multimodal con comodidad.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070 o superiores para ejecucion fluida. Tambien puede ejecutarse en GPU con 8 GB de VRAM con cuantizaciones mas agresivas (no incluidas en este repositorio).
- CPU: al ser GGUF, puede ejecutarse en CPU con 16 GB de RAM, aunque la velocidad sera significativamente menor que en GPU.
- Opciones de despliegue: llama.cpp (llama-cli y llama-mtmd-cli), Ollama (si se importa el GGUF), LM Studio, llama-cpp-python para integraciones Python.
- Latencia: no se dispone de datos medidos. Como referencia, un modelo 4B en Q8_0 en una RTX 4090 suele generar entre 40-80 tokens/segundo, pero esto depende del hardware y de la longitud de contexto activa.
- El proyector multimodal (mmproj) en BF16 ocupa aproximadamente 1-2 GB adicionales y debe cargarse junto al modelo principal para procesar imagenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-E2E-Tests (este) | 4,3B | 262.144 | Si | Apache-2.0 | GGUF Q8_0 |
| Qwen3.5-4B (base) | 4,3B | 262.144 | Si | Apache-2.0 | safetensors |
| Qwen3-4B | 4B | 32.768 (ampliable a 131K) | No | Apache-2.0 | safetensors/GGUF |
| Qwen3.5-397B-A17B | 397B (17B activos) | 262.144 | Si | Apache-2.0 | safetensors |

El modelo base Qwen3.5-4B es la referencia directa: este repositorio es una conversion a GGUF con fine-tuning adicional. Qwen3-4B es la generacion anterior sin capacidades de vision. La variante 397B-A17B es el modelo mas grande de la familia Qwen3.5, con arquitectura MoE, pero requiere hardware de datacenter.

## Limitaciones y advertencias

- El modelo es un fine-tuning de pruebas (E2E-Tests) sobre un dataset especifico (ai-natural-language-tests); su rendimiento en tareas generales puede ser inferior al modelo base Qwen3.5-4B.
- Solo soporta dos idiomas (ingles y chino); no se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- No se han publicado benchmarks ni evaluaciones de sesgos, alucinacion o seguridad para esta variante especifica.
- El repositorio solo incluye cuantizacion Q8_0; no hay opciones de cuantizacion mas agresivas (Q4_K_M, Q5_K_M, etc.) que permitan ejecutar el modelo en hardware con menos VRAM.
- El proyector multimodal en BF16 anade requisitos de memoria adicionales; sin el, el modelo no puede procesar imagenes.
- Al ser un modelo de 4B parametros, su capacidad de razonamiento complejo y generacion de codigo es limitada en comparacion con modelos de mayor tamano (30B, 70B, 235B).
- Riesgo de alucinacion: como todos los modelos de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de vision donde la descripcion de imagenes ambiguas puede ser incorrecta.
- No se ha confirmado si el fine-tuning ha introducido sesgos adicionales derivados del dataset de pruebas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ayan4m1/Qwen3.5-4B-E2E-Tests-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Pagina de Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Pagina de Qwen3.5 en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Herramienta Unsloth: https://github.com/unslothai/unsloth
