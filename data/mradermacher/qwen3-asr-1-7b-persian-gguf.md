# mradermacher/Qwen3-ASR-1.7B-Persian-GGUF

## Resumen

Qwen3-ASR-1.7B-Persian-GGUF es una distribucion de cuantizaciones GGUF del modelo Neurai/Qwen3-ASR-1.7B-Persian, un modelo de reconocimiento automatico del habla (ASR) derivado de la familia Qwen3 y especializado en transcripcion de audio en persa. El trabajo de cuantizacion lo firma mradermacher, un autor habitual en el ecosistema GGUF que publica versiones estaticas de modelos populares para su uso con llama.cpp y herramientas compatibles.

El modelo base parte de Qwen3-ASR, la variante de Qwen3 orientada a tareas de audio, con 1.720.574.976 parametros totales (aproximadamente 1,7 mil millones) y licencia Apache 2.0. Esta version incluye un modulo multimodal (mmproj) que procesa la entrada de audio y la proyecta al espacio del modelo de lenguaje para generar la transcripcion.

La relevancia de esta ficha reside en que ofrece una via de despliegue local y ligera para ASR en persa: el cuantizado Q4_K_M ocupa alrededor de 1,2 GB, lo que permite ejecutarlo en hardware de consumo. No obstante, la informacion publicada es muy limitada en cuanto a datos de entrenamiento, benchmarks y capacidades exactas, por lo que muchos apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-ASR); incluye modulo multimodal mmproj para audio |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos de Hugging Face); el nombre del modelo indica especializacion en persa, aunque no consta como idioma declarado |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj separados) |

## Arquitectura y entrenamiento

El modelo base es Neurai/Qwen3-ASR-1.7B-Persian, una adaptacion de Qwen3-ASR orientada al persa. Qwen3-ASR es la variante de la familia Qwen3 dedicada a reconocimiento del habla: combina un codificador de audio con un modelo de lenguaje Qwen3 que genera la transcripcion como texto. La arquitectura concreta del codificador de audio, la longitud de contexto y la composicion del dataset de entrenamiento no estan disponibles en la informacion proporcionada.

Esta publicacion no entrena el modelo, sino que aplica cuantizacion estatica sobre los pesos del modelo base para generar ficheros GGUF. El autor indica que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion. No consta informacion sobre RLHF, DPO ni sobre el volumen de tokens de entrenamiento original.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, con especializacion declarada en persa.
- Procesamiento multimodal de audio: requiere el fichero mmproj (Q8_0 o f16) junto con los pesos del modelo.
- Generacion de texto derivada del backbone Qwen3 (no documentada especificamente para esta variante).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: los metadatos declaran solo ingles; el nombre del modelo sugiere persa, pero no se documenta oficialmente.
- Otras capacidades especiales (modo thinking, vision, audio bidireccional): no disponible en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y entrevistas en persa: el modelo convierte audio a texto localmente, sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de video en persa: integrado en un pipeline que extrae audio con ffmpeg y lo pasa al modelo para generar subtitulos SRT.
- Asistentes de voz para habla persa: el modelo puede actuar como componente ASR en un sistema de dictado o asistente conversacional, alimentando la transcripcion a un LLM posterior.
- Archivado y busqueda de contenido audiovisual: transcripcion masiva de grabaciones para indexacion y busqueda por texto en persa.
- Accesibilidad: generacion de transcripciones para personas con discapacidad auditiva en contenido en persa.
- Despliegue en hardware de consumo: gracias a su tamano (1,2 GB en Q4_K_M), puede ejecutarse en portatiles o equipos sin GPU dedicada mediante llama.cpp, lo que facilita prototipado y pruebas offline.
- Investigacion en ASR de bajo recurso: como punto de partida para experimentos con idiomas menos representados, dado su tamano reducido y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en Q4_K_M, 1,9 GB en Q8_0 y 3,5 GB en f16, mas el mmproj (0,5-0,7 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060 o superiores son suficientes. Para f16 se recomienda al menos 6 GB.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF y mmproj (por ejemplo, llama.cpp con soporte multimodal). vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-ASR-1.7B-Persian-GGUF (este) | 1,72 B | no disponible | Apache 2.0 | GGUF |
| Neurai/Qwen3-ASR-1.7B-Persian (base) | 1,72 B | no disponible | Apache 2.0 | safetensors (transformers) |
| Whisper large-v3 | no disponible en esta ficha | no disponible | MIT | multiples formatos |
| Otros Qwen3-ASR cuantizados de mradermacher | 1,72 B | no disponible | Apache 2.0 | GGUF |

La comparacion cuantitativa con alternativas como Whisper no puede realizarse porque no hay benchmarks publicados en la informacion disponible.

## Limitaciones y advertencias

- La model card es una plantilla generica de cuantizacion; no documenta el comportamiento real del modelo, ni su calidad, ni sus limitaciones especificas.
- Los metadatos declaran solo el idioma ingles, mientras que el nombre del modelo indica persa; existe ambiguedad sobre el soporte real de idiomas.
- No hay informacion sobre sesgos, riesgo de alucinacion en transcripcion ni tasas de error (WER).
- No se documenta la longitud de contexto, lo que impide planificar su uso con audios largos sin fragmentacion previa.
- El uso comercial esta permitido por la licencia Apache 2.0, pero conviene verificar la licencia del modelo base y del modelo original Qwen3-ASR.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la precision de transcripcion; se recomienda Q4_K_M o superior para produccion.
- El repositorio ocupa 17,0 GB porque incluye todas las cuantizaciones; solo es necesario descargar los ficheros concretos que se vayan a usar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-ASR-1.7B-Persian-GGUF
- Modelo base: https://huggingface.co/Neurai/Qwen3-ASR-1.7B-Persian
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Qwen3-ASR-1.7B-Persian-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
