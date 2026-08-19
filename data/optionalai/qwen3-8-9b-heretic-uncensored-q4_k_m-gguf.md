# optionalAI/Qwen3.8-9B-heretic-uncensored-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo `rohit267/Qwen3.8-9B-heretic-uncensored`, realizada por el usuario optionalAI mediante la herramienta GGUF-my-repo de ggml.ai. Se trata de una versión cuantizada en Q4_K_M de un modelo de 8.953.803.264 parámetros (aproximadamente 9B), diseñado para ejecutarse localmente con llama.cpp y motores compatibles.

El modelo base pertenece a la familia Qwen3.8 y ha sido sometido a un proceso de "heretic" o "abliteration", una técnica que elimina o atenúa las capas de rechazo y censura del modelo original. Esto produce un asistente que responde sin las restricciones habituales de seguridad, lo que resulta útil para investigación sobre alineación, pruebas de robustez y aplicaciones creativas sin filtros, pero también conlleva riesgos importantes que se detallan en la sección de limitaciones.

La relevancia de esta ficha radica en que representa un caso práctico de despliegue local de un modelo de razonamiento de 9B con capacidades de function calling y razonamiento multi-paso, en un formato optimizado para hardware de consumo. El repositorio incluye instrucciones claras para usar el modelo tanto desde la línea de comandos como desde el servidor de llama.cpp.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-9B) |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la configuracion original de Qwen3.8-9B soporta hasta 256K, pero no se especifica en este repo) |
| Tipos de cuantizacion | Q4_K_M (unico archivo incluido) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo: `qwen3.8-9b-heretic-uncensored-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo base es `Qwen3.8-9B`, un transformer denso de la familia Qwen3.8 desarrollado por Alibaba, que incorpora capacidades de razonamiento, vision y una ventana de contexto de hasta 256K tokens. El repositorio original (`rohit267/Qwen3.8-9B-heretic-uncensored`) aplica la tecnica de "abliteration" (tambien conocida como "heretic" o "decensored"), que consiste en eliminar o neutralizar las direcciones en el espacio de activaciones responsables del rechazo de peticiones consideradas peligrosas o inapropiadas.

Los tags de la model card indican que el modelo ha pasado por un proceso de destilacion (distillation), ajuste supervisado (SFT) y que conserva capacidades de razonamiento y function calling. No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. La informacion disponible no permite determinar si la abliteration se realizo sobre el modelo base o sobre una version ya ajustada con SFT.

La conversion a GGUF se realizo con llama.cpp, lo que implica que el modelo esta optimizado para inferencia en CPU y GPU mediante las bibliotecas de llama.cpp, con soporte para Mac (via brew), Linux y Windows.

## Capacidades

- Generacion de texto sin filtros de censura gracias al proceso de abliteration.
- Razonamiento multi-paso y modo thinking (heredado de la familia Qwen3.8).
- Soporte de function calling / tool calling (segun los tags de la model card).
- Capacidades de agente para tareas multi-step.
- Procesamiento de lenguaje natural en ingles.
- Ejecucion local en hardware de consumo gracias a la cuantizacion Q4_K_M.
- Compatible con el ecosistema llama.cpp (CLI, servidor, bindings).
- Vision: el modelo base Qwen3.8-9B soporta vision, pero no se confirma si esta capacidad se preserva tras la abliteration y la cuantizacion.

## Casos de uso

- Investigacion sobre alineacion y seguridad de modelos: permite estudiar el comportamiento de un modelo sin capas de rechazo, analizando diferencias en las respuestas frente al modelo original y evaluando riesgos de sesgo o contenido danino.
- Generacion creativa sin restricciones: escritura de ficcion, poesia, guiones o dialogos con tematicas adultas o controvertidas que los modelos convencionales rechazarian.
- Roleplay y chatbots de personaje: ideal para construir asistentes conversacionales con personalidades extremas o sin filtros, gracias a la ausencia de rechazo y a la ventana de contexto amplia.
- Pruebas de robustez en sistemas de moderacion: sirve como modelo adversario para evaluar la eficacia de filtros de contenido en plataformas de IA.
- Desarrollo de agentes locales con function calling: puede integrarse en pipelines de automatizacion donde se requiere un modelo que no rechace peticiones, por ejemplo, en entornos de pruebas controlados.
- Despliegue en entornos aislados: al ser un GGUF de 5,6 GB, cabe en equipos con 8 GB de RAM o VRAM, permitiendo ejecutar un LLM de 9B en portatiles o mini-PCs sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de `rohit267/Qwen3.8-9B-heretic-uncensored` no incluye metricas comparativas, y el repositorio GGUF tampoco proporciona datos de rendimiento. Se recomienda consultar la documentacion oficial de Qwen3.8-9B para obtener referencias de MMLU, HumanEval o GSM8K del modelo base, teniendo en cuenta que la abliteration y la cuantizacion pueden alterar estos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa aproximadamente 5,6 GB, por lo que se recomienda un minimo de 6 GB de VRAM en GPU o 8 GB de RAM en CPU para una ejecucion fluida.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 o superiores. Tambien compatible con Apple Silicon (M1/M2/M3) mediante Metal.
- En CPU: procesadores modernos con al menos 16 GB de RAM pueden ejecutar el modelo, aunque con latencias mayores.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), LM Studio, KoboldCpp y cualquier frontend compatible con llama.cpp.
- Latencia y throughput: no se proporcionan datos concretos. En una GPU como la RTX 4060 se puede esperar una generacion de 20-40 tokens por segundo con Q4_K_M, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `optionalAI/Qwen3.8-9B-heretic-uncensored-Q4_K_M-GGUF` | 8,95B | Q4_K_M | no disponible | Apache 2.0 | Version GGUF del modelo heretic |
| `saga404/Qwen3.8-9B-heretic-uncensored-Q5_0-GGUF` | 8,95B | Q5_0 | no disponible | Apache 2.0 | Misma base, cuantizacion superior (mayor fidelidad, mayor tamano) |
| `llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v1-GGUF` | 9B (aprox.) | no disponible | no disponible | no disponible | Otra variante heretic sobre Qwen3.5, con metricas de preservacion de capacidades publicadas |

La comparativa se limita a otras conversiones GGUF del mismo modelo base o de variantes heretic similares. No se dispone de datos suficientes para comparar con modelos no censurados de otras familias (como Llama 3.1 o Mistral) en terminos de rendimiento.

## Limitaciones y advertencias

- Contenido potencialmente danino: al eliminar las capas de rechazo, el modelo puede generar respuestas que inciten a la violencia, al odio o a actividades ilegales. No debe usarse en produccion sin filtros adicionales.
- Idioma limitado: la model card solo indica ingles. El rendimiento en otros idiomas, incluido el castellano, no esta garantizado.
- Sesgos no mitigados: la abliteration no elimina los sesgos del modelo base, que pueden amplificarse al no haber restricciones de seguridad.
- Riesgo de alucinacion: como cualquier LLM, puede inventar informacion, pero al no tener capas de rechazo, las alucinaciones pueden presentarse con mayor confianza y sin advertencias.
- Sin garantias de calidad: el proceso de abliteration puede degradar las capacidades de razonamiento o generacion respecto al modelo original. No se aportan benchmarks que lo confirmen.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable del contenido generado. La ausencia de filtros no exime de responsabilidad legal.
- Cuantizacion Q4_K_M: puede introducir perdidas de precision en tareas complejas de razonamiento o codigo.
- Soporte limitado: al ser un repositorio de conversion automatica, no hay mantenimiento activo ni canal de soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/optionalAI/Qwen3.8-9B-heretic-uncensored-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Herramienta de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Version Q5_0 del mismo modelo: https://huggingface.co/saga404/Qwen3.8-9B-heretic-uncensored-Q5_0-GGUF
- Variante heretic de Qwen3.5: https://huggingface.co/llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v1-GGUF
- Documentacion de Qwen3.8 en Unsloth: https://unsloth.ai/docs/models/qwen3.8
