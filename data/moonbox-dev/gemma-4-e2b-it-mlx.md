# moonbox-dev/gemma-4-E2B-it-MLX

## Resumen

Gemma 4 E2B IT MLX es una compilación no oficial del modelo instructivo Gemma 4 E2B de Google, adaptada por Moonbox para su ejecución nativa en Apple Silicon mediante la librería MLX. El modelo original es un sistema multimodal "any-to-any" que procesa y genera texto, imágenes y audio, y esta versión lo empaqueta junto con el drafter de predicción multi-token (MTP) de Google para decodificación especulativa, el tokenizer, la plantilla de chat y la configuración del procesador, todo en formato compatible con `mlx-vlm`.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo multimodal de Google en hardware de sobremesa con chip de Apple, con cuantizaciones de 8 y 6 bits que reducen el peso a aproximadamente 6 GB y 4,7 GB respectivamente, manteniendo una degradación de calidad medida y documentada (KL de 0,0032 y 0,019 nats). El repositorio completo ocupa 19,2 GB e incluye únicamente las builds cuantizadas, no los pesos en bf16.

Se trata de una conversión de terceros, no de un lanzamiento oficial de Google, y la licencia declarada es Apache 2.0 con enlace a la licencia específica de Gemma 4. El modelo base es `google/gemma-4-E2B-it` y la relación declarada es de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any: texto, visión y audio) con drafter MTP para decodificación especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits y 6 bits (QLoRA/QAT según tags) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (MLX), con `config.json`, `tokenizer.json`, `chat_template.jinja`, `processor_config.json` y carpeta `mtp/` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su carácter multimodal any-to-any (texto, visión y audio) y de la inclusión de un drafter de predicción multi-token (MTP) que habilita decodificación especulativa. El tag `qat` sugiere que el modelo base fue sometido a entrenamiento consciente de cuantización, lo que explicaría la baja degradación observada en las builds de 8 y 6 bits. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La contribución técnica de esta ficha es el empaquetado para MLX: cada build es una carpeta autocontenida con pesos, configuración, tokenizer de Google, plantilla de chat, ajustes del procesador y el subdirectorio `mtp/` con el drafter. La build de 8 bits pesa aproximadamente 5,87 GB en pesos (4,56 GB + 1,31 GB) más 157,6 MB del drafter; la de 6 bits pesa aproximadamente 4,71 GB (4,50 GB + 212,2 MB) más el mismo drafter.

## Capacidades

- Generación de texto y razonamiento en modo instructivo.
- Procesamiento de imágenes (visión) y audio, con pipeline declarado `any-to-any`.
- Decodificación especulativa mediante el drafter MTP incluido, que acelera la generación.
- Ejecución nativa en Apple Silicon a través de `mlx-vlm`.
- Soporte de plantilla de chat instructiva y configuración de procesador multimodal.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: el modelo puede recibir imágenes y audio además de texto, lo que permite construir un asistente de escritorio que responda a capturas de pantalla o notas de voz sin salir del equipo, aprovechando la ejecución nativa en Apple Silicon.
- Transcripción y análisis de audio en local: al aceptar entrada de audio, puede emplearse para resumir reuniones o extraer acciones de grabaciones, manteniendo los datos en el dispositivo.
- Descripción y análisis de imágenes: útil para generar alt-text, clasificar contenido visual o responder preguntas sobre capturas y fotografías dentro de un flujo de trabajo de accesibilidad o moderación.
- Prototipado rápido en investigación: investigadores que necesiten evaluar el comportamiento de Gemma 4 E2B en un Mac pueden usar estas builds sin configurar CUDA ni infraestructura de servidor, con la ventaja del drafter MTP para iterar más rápido.
- Aplicaciones de escritorio con privacidad por diseño: al ejecutarse íntegramente en local, encaja en herramientas donde no se permite enviar datos a la nube, como asistentes jurídicos o médicos de uso interno.
- Evaluación de cuantización: las builds de 8 y 6 bits con métricas KL y top-1 documentadas permiten comparar el impacto de la cuantización en tareas concretas antes de comprometerse con un despliegue.
- Generación de contenido multimodal en pipelines creativos: combinación de texto e imagen para borradores de guiones, pies de foto o material de marketing generado en local.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de fidelidad de las cuantizaciones frente al modelo bf16 original:

| Build | KL (nats) | Top-1 agreement | MMLU-Pro |
|---|---|---|---|
| bf16 (original) | — | — | 25,7 % |
| 8 bits | 0,0032 | 98,5 % | 25,3 % |
| 6 bits | 0,019 | 96,3 % | 25,2 % |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMMU, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 6 GB para la build de 8 bits y 4,7 GB para la de 6 bits, más overhead del runtime MLX y del drafter MTP.
- Hardware objetivo: Macs con Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en Macs de gama consumer con 8 GB de memoria unificada en la build de 6 bits, aunque se recomienda 16 GB o más para trabajar con contexto largo y multimodal.
- Despliegue: `mlx-vlm` es la vía documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato MLX específico.
- Latencia y throughput: no disponibles en la información proporcionada; la inclusión del drafter MTP sugiere una mejora en velocidad de decodificación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E2B IT MLX (esta ficha) | no disponible | no disponible | Texto, visión, audio | Apache 2.0 | MLX safetensors |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Texto, visión, audio | Licencia Gemma 4 | safetensors (bf16) |
| Alternativas MLX de otros modelos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría; los datos de parámetros, contexto y rendimiento del modelo base no figuran en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión no oficial de Moonbox; no cuenta con el respaldo de Google y puede divergir del comportamiento del modelo original.
- Solo se distribuyen builds cuantizadas (8 y 6 bits); no se incluyen los pesos bf16, por lo que no es posible reproducir exactamente el modelo original desde este repositorio.
- La build de 6 bits presenta una degradación medible (KL 0,019 nats, top-1 96,3 %) que puede afectar a tareas sensibles a la precisión.
- El rendimiento en MMLU-Pro es bajo en términos absolutos (25,3 % en 8 bits), lo que sugiere limitaciones en razonamiento complejo y conocimiento experto.
- Sin datos publicados sobre sesgos, tasas de alucinación, cobertura idiomática ni robustez multimodal.
- Restricciones de licencia: aunque se declara Apache 2.0, el enlace apunta a la licencia específica de Gemma 4 de Google, que puede imponer condiciones adicionales de uso comercial; conviene revisarla antes de desplegar en producción.
- Dependencia exclusiva del ecosistema MLX y Apple Silicon; no es portable a CUDA ni a otras plataformas sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/gemma-4-E2B-it-MLX
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
