# occ-ai/OCC-4B-GGUF

## Resumen

OCC-4B-GGUF es la distribucion en formato GGUF de OCC-4B, un modelo multimodal (texto e imagen) desarrollado por occ-ai. Se trata de un ajuste fino (fine-tune) del modelo Qwen3.5-4B orientado a tareas de asistente multi-turno y uso de herramientas (tool use). El modelo acepta entradas de texto e imagen y genera texto, lo que lo situa en la categoria de modelos image-text-to-text.

El modelo cuenta con 4.326.350.848 parametros totales (aproximadamente 4,3 mil millones), lo que lo convierte en un modelo de tamano compacto apto para despliegue en hardware de consumo. La distribucion GGUF esta pensada para su ejecucion con llama.cpp, e incluye un encoder de vision y proyector separado (`mmproj-OCC-4B-F16.gguf`) que se comparte entre todas las variantes de cuantizacion.

Su relevancia radica en combinar capacidades multimodales y de razonamiento con un formato de cuantizacion ampliamente soportado (GGUF) y una licencia permisiva (Apache 2.0), lo que facilita su integracion en entornos locales y su uso comercial. El repositorio ocupa 34,7 GB e incluye multiples variantes de cuantizacion, desde BF16/F16 hasta Q4_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B; encoder de vision + proyector) |
| Parametros totales | 4.326.350.848 (aprox. 4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); encoder de vision en FP16 (`mmproj-OCC-4B-F16.gguf`) |

## Arquitectura y entrenamiento

OCC-4B es un fine-tune de Qwen3.5-4B, por lo que hereda la arquitectura transformer del modelo base, a la que se anade un encoder de vision y un proyector para el procesamiento de imagenes. La distribucion GGUF mantiene el encoder de vision y el proyector en FP16 en un fichero separado (`mmproj-OCC-4B-F16.gguf`), compartido por todas las variantes de cuantizacion del modelo de lenguaje.

El modelo esta especializado en tareas de asistente multi-turno y uso de herramientas, segun indica la model card. No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas especificas mas alla de la integracion multimodal y el soporte de modo de razonamiento (thinking) activable mediante `chat_template_kwargs`.

## Capacidades

- Generacion de texto e interpretacion de imagenes (image-text-to-text).
- Tareas de asistente conversacional multi-turno.
- Uso de herramientas (tool use / function calling), segun la model card.
- Modo de razonamiento (thinking) activable por peticion mediante `"chat_template_kwargs": {"enable_thinking": true}`.
- Plantilla de chat integrada que, por defecto, opera en modo instruct.
- Compatibilidad con endpoints estilo OpenAI a traves de `llama-server` (`/v1/chat/completions`).
- Soporte de entradas de imagen en base64 mediante el esquema `image_url`.

## Casos de uso

- Asistencia conversacional multi-turno: el modelo esta ajustado especificamente para tareas de asistente, por lo que puede mantener dialogos con historial y contexto de conversacion en entornos locales mediante llama.cpp.
- Analisis de imagenes en local: al aceptar entradas de imagen via `image_url` en base64, permite describir, clasificar o extraer informacion de imagenes sin depender de servicios en la nube, adecuado para entornos con requisitos de privacidad.
- Integracion en pipelines con tool calling: su soporte de uso de herramientas permite conectarlo a funciones externas (APIs, bases de datos) dentro de flujos automatizados.
- Despliegue en hardware de consumo: con cuantizaciones desde 2,61 GB (Q4_0) hasta 8,67 GB (BF16/F16), puede ejecutarse en equipos con GPU de gama media o incluso en CPU mediante llama.cpp.
- Prototipado rapido de aplicaciones multimodales: la compatibilidad con la API estilo OpenAI de `llama-server` facilita sustituir servicios comerciales por una instancia local durante el desarrollo.
- Procesamiento de documentos con imagenes: al combinar vision y texto, puede emplearse para tareas de extraccion de informacion de capturas, formularios o figuras en flujos documentales.
- Razonamiento con modo thinking: para tareas que requieren pasos intermedios de razonamiento, se puede activar el modo thinking por peticion y desactivarlo en el resto para reducir latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun variante):
  - BF16 / F16: 8,67 GB de pesos; requiere aproximadamente 10-12 GB de VRAM para contexto moderado.
  - Q8_0: 4,61 GB de pesos.
  - Q6_K: 3,56 GB de pesos.
  - Q5_K_M: 3,16 GB de pesos.
  - Q4_K_M: 2,78 GB de pesos.
  - Q4_0: 2,61 GB de pesos.
  - Adicionalmente, el encoder de vision (`mmproj-OCC-4B-F16.gguf`) consume VRAM extra no cuantificada en la informacion disponible.
- GPU recomendadas: no disponibles de forma explicita; por tamano, las variantes Q4 y Q5 son aptas para GPU de consumo con 6-8 GB de VRAM, mientras que BF16/F16 requiere GPU de gama alta (por ejemplo, RTX 4090, A100 o H100) o bien ejecucion en CPU.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_0, Q4_K_M, Q5_K_M y Q6_K, en funcion de la VRAM disponible.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de API compatible con OpenAI. Otras opciones (vLLM, Ollama, TGI) no se confirman en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| OCC-4B-GGUF | 4,3 mil millones | no disponible | Texto + imagen | Apache 2.0 | GGUF |
| Qwen3.5-4B (modelo base) | aprox. 4 mil millones | no disponible | Texto (segun base) | no disponible | no disponible |
| Otros modelos multimodales de ~4B | no disponible | no disponible | Texto + imagen | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre OCC-4B y sus alternativas en la informacion proporcionada. La comparacion se limita al modelo base Qwen3.5-4B, del que OCC-4B es un fine-tune, y a la categoria general de modelos multimodales de aproximadamente 4 mil millones de parametros.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de fidelidad para este modelo.
- La longitud de contexto no esta especificada, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- Los idiomas soportados no estan declarados; no se puede asegurar un rendimiento multilingue equilibrado.
- El modo thinking esta desactivado por defecto en la configuracion de servidor recomendada; debe activarse explicitamente por peticion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.5-4B del que deriva.
- El encoder de vision se distribuye en FP16 y no se ofrece en variantes cuantizadas, lo que anade consumo de VRAM y tamano en disco.
- No se han publicado benchmarks, por lo que no es posible validar su rendimiento frente a alternativas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/occ-ai/OCC-4B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/occ-ai/OCC-4B
- Informe tecnico (PDF): https://github.com/optimal-cognitive-core/OCC/blob/main/OCC_Technical_Report.pdf
- Repositorio GitHub: https://github.com/optimal-cognitive-core/OCC
