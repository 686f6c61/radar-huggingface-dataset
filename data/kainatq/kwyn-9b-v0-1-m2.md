# kainatq/KWYN-9B-v0.1-m2

## Resumen

KWYN-9B-v0.1-m2 es un modelo multimodal de tipo image-text-to-text obtenido mediante la fusión (merge) de dos derivados comunitarios de Qwen3.5-9B. Lo publica el usuario kainatq bajo el paraguas del proyecto KWYN (K's Weighted Yield Network), en su etapa de merge m2 y versión v0.1. No se trata de un fine-tune: es un único merge TIES de dos checkpoints con pesos iguales (0,5 / 0,5), `density=1.0` y conjunto de tensores estricto, sin SFT, DPO ni RLHF posterior.

El modelo resuelve el problema de combinar las capacidades de dos linajes distintos: por un lado, un derivado orientado a código y agentes de terminal (parent A, `nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6`); por otro, un derivado de terminal (parent B, `FACET-Terminal/FACET-Terminal-Qwen3.5-9B`). Ambos descienden del mismo ancestro común, `Qwen/Qwen3.5-9B`, lo que hace viable la fusión tensorial directa.

La relevancia de esta revisión concreta es que corrige un defecto grave de la receta anterior (`density=0.2`), que dejaba entre el 78 y el 80 % de cada tensor fusionado a cero y producía salidas incoherentes sin token EOS. Los pesos actuales son una re-fusión corregida con `density=1.0`, verificada con una prueba de coherencia el 2026-11-22. El modelo tiene 9.653.104.368 parámetros, se distribuye en bfloat16 y su licencia es Apache 2.0. No dispone de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal texto + visión), `model_type` `qwen3_5` |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards, 775 tensores, 17,98 GiB) |

Datos adicionales del artefacto: backbone de texto con 32 capas, dimensión oculta 4.096 y vocabulario de 248.320 tokens; torre de visión con profundidad 27 y dimensión oculta 1.152; `tie_word_embeddings` en `false`; precisión bfloat16 en todos los tensores.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de la familia Qwen3.5, con un backbone de texto de 32 capas y una torre de visión de 27 capas que procesa imágenes y las proyecta al espacio del modelo de lenguaje. El checkpoint resultante conserva los 333 tensores `model.visual.*` del pipeline image-text-to-text, además de `config.json` con `vision_config` y un `preprocessor_config.json` para el procesador de imagen. El uso exclusivamente textual no requiere cargar nada adicional.

El entrenamiento del modelo como tal no existe: es una fusión TIES (trim, elect sign, disjoint mean, rescale) ejecutada localmente, fuera de Kaggle, con ambos padres leídos desde directorios locales y un motor de merge con sha256 `a2808b034159594861673815a81c314aa7dda8e1a2772a5fe49758260dde8cad`. Se fusionaron los 760 tensores presentes en ambos padres; los 15 tensores `mtp.*` (multi-token-prediction) que solo tenía el parent A se copiaron bit a bit sin modificar. La ejecución tardó 469 segundos. El tokenizador y la plantilla de chat se heredan sin cambios del parent A. El informe `m2_merge_report.json` acompaña al repositorio con la receta y los digests.

## Capacidades

- Generación de texto conversacional en inglés, chino, japonés y español.
- Razonamiento y resolución de problemas, heredado de los linajes Qwen3.5.
- Generación de código, con énfasis en el linaje coder del parent A.
- Capacidades de agente de terminal (terminal-agent), orientadas a tareas de línea de comandos.
- Procesamiento multimodal de imagen y texto: la torre de visión está presente en los pesos y el pipeline es image-text-to-text, aunque no se ha probado con entradas de imagen o vídeo según la model card.
- Predicción multi-token (tensores `mtp.*` conservados del parent A).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en terminal: el modelo puede integrarse en herramientas CLI para explicar comandos, generar scripts de shell y depurar errores de compilación, aprovechando el linaje coder del parent A y su orientación a terminal-agent.
- Automatización de tareas de agente en entornos de línea de comandos: dado su perfil de terminal-agent, encaja en flujos donde el modelo propone comandos y el operador los valida, sin necesidad de un contexto especialmente largo.
- Generación de código en pipelines de desarrollo: puede emplearse para completar funciones, escribir pruebas unitarias o revisar diffs en inglés, con la cautela de que no hay benchmarks que respalden su calidad frente a los padres.
- Prototipado multimodal experimental: al conservar la torre de visión, sirve para experimentar con descripciones de imágenes o extracción de información visual, aunque la model card advierte de que esta ruta no se ha ejercitado.
- Atención al cliente multilingüe en inglés, chino, japonés y español: el modelo puede mantener conversaciones multi-turno en esos cuatro idiomas, con la limitación de que la longitud de contexto no está documentada.
- Investigación sobre técnicas de model merging: el repositorio incluye la receta exacta, el informe de merge y los digests, lo que lo convierte en un caso de estudio reproducible para quienes estudian TIES y la corrección de defectos de densidad.
- Evaluación comparativa de linajes Qwen3.5: útil como punto de partida para medir el efecto de fusionar un derivado coder con un derivado de terminal, siempre que el investigador aporte su propia batería de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint no está evaluado con benchmarks y que no se reclama ninguna puntuación. La única verificación documentada es una prueba de coherencia del 2026-11-22 sobre los bytes exactos de los shards, que devolvió salida fluida, solo en alfabeto latino, con EOS en 3 de 3 prompts fijados.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones, caché KV y el procesador de visión; en la práctica, se recomienda un mínimo de 24 GB para uso textual y algo más si se activa la torre de visión.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue cómodo en bfloat16; RTX 4090 (24 GB) puede funcionar en texto con margen ajustado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits (no documentada oficialmente), en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB.
- Opciones de despliegue: transformers es la librería declarada; vLLM, TGI, llama.cpp u Ollama no están documentados en la información proporcionada, y la conversión a GGUF no se ha publicado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado de evaluación |
|---|---|---|---|---|---|
| KWYN-9B-v0.1-m2 | 9,65 B | no disponible | texto + visión | Apache 2.0 | sin benchmarks; solo prueba de coherencia |
| nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6 (parent A) | ~9 B (derivado de Qwen3.5-9B) | no disponible | texto (según su card) | Apache 2.0 | no disponible |
| FACET-Terminal/FACET-Terminal-Qwen3.5-9B (parent B) | ~9 B | no disponible | texto | Apache 2.0 | no disponible |
| Qwen/Qwen3.5-9B (ancestro común) | ~9 B | no disponible | texto | Apache 2.0 | no disponible |

La comparativa se limita a los linajes documentados en la model card, ya que no se dispone de datos de rendimiento de ninguno de ellos. No se conocen modelos de terceros comparables con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- No es un fine-tune: es un merge TIES sin entrenamiento posterior, por lo que no se garantiza que supere a ninguno de sus padres; la model card lo declara explícitamente.
- Sin benchmarks: no existe ninguna puntuación de rendimiento para este checkpoint y no debe inferirse ninguna a partir de la receta.
- Ruta de visión no probada: los 333 tensores `model.visual.*` están fusionados, pero no se ha testeado ninguna entrada de imagen o vídeo; el uso multimodal es experimental.
- Historial de defectos: la revisión anterior con `density=0.2` producía salidas incoherentes y sin EOS; aunque esta revisión está corregida, conviene verificar la integridad de los shards y el informe de merge antes de desplegar.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones largas o documentos extensos sin verificarla empíricamente.
- Idiomas: solo se declaran en, zh, ja y es; el rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación: no cuantificado para este checkpoint; al ser un merge sin evaluación, se desconoce su comportamiento frente a los padres.
- Licencia: Apache 2.0 permite uso comercial, pero el parent A no incluye archivo `LICENSE` en su repositorio (solo la declara en la card), lo que conviene revisar si se requiere trazabilidad legal completa.
- Sesgos: no documentados en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kainatq/KWYN-9B-v0.1-m2
- Parent A: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-Coder-Flash-OneJev1.6
- Parent B: https://huggingface.co/FACET-Terminal/FACET-Terminal-Qwen3.5-9B
- Ancestro común: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/kainatq/KWYN-9B-v0.1-m2/blob/main/LICENSE
- Informe de merge: `m2_merge_report.json` en el repositorio del modelo
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada
