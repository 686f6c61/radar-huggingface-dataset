# Archsloth/Qwen3.8-27B-GGUF

## Resumen

Archsloth/Qwen3.8-27B-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-27B de Qwen, publicada por el usuario independiente Archsloth y orientada a inferencia local con llama.cpp. El modelo base es un vision-language de 27.320.697.856 parámetros (unos 27,3 mil millones) con arquitectura densa, no MoE, y licencia Apache-2.0. La cuantización se distribuye en un único fichero `Qwen3.8-27B-AS-Q6_K.gguf` de 22,43 GB, más un torre de visión separada `mmproj-F32.gguf` de 1,84 GB que se mantiene a precisión completa.

El interés de esta publicación no está en el modelo base, sino en el método de cuantización. Archsloth aplica una búsqueda de redondeo con AutoRound de Intel y la extensión `enable_alg_ext` (SignRoundV2, arXiv:2512.04746) sobre los mismos tipos de tensor estándar `Q6_K` de llama.cpp. El autor publica una comparación directa contra `unsloth/Qwen3.8-27B-GGUF` en el mismo nivel Q6_K, midiendo divergencia KL respecto al original en bf16 sobre texto coreano e inglés fuera del conjunto de calibración. Según esos datos, la divergencia KL baja un 36,9 % en coreano y un 15,0 % en inglés frente a la versión de unsloth.

Es relevante ahora porque demuestra que el redondeo, y no solo el ancho de bits, es una palanca real de calidad en cuantizaciones GGUF, y porque publica el corpus de calibración, el conjunto de evaluación y los registros de medición en el propio repositorio, lo que permite replicar el resultado. La contrapartida es que se trata de un artefacto de un autor individual con 114 descargas en el momento de la consulta, sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B), vision-language con torre de visión separada; no disponible el detalle interno de capas y atención |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF `Q6_K` (tipos de tensor estándar de llama.cpp); torre de visión en F32 sin cuantizar; el autor indica que no hay nada por debajo de 4 bits |
| Idiomas soportados | Coreano (ko) e inglés (en) declarados en la model card |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`Qwen3.8-27B-AS-Q6_K.gguf` de 22,43 GB y `mmproj-F32.gguf` de 1,84 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,3 mil millones de parámetros con capacidad de visión, según se deduce del pipeline `image-text-to-text` y de la presencia de una torre multimodal `mmproj` en la cuantización. La model card no detalla el número de capas, la configuración de atención ni la longitud de contexto del modelo base, por lo que esos datos quedan como no disponibles. El repositorio ocupa 24,3 GB.

El proceso de cuantización parte de los pesos originales de `Qwen/Qwen3.8-27B` sin modificaciones, no de la cuantización de otro autor. Se ejecuta con el esquema `GGUF:Q6_K` de llama.cpp, la extensión `--enable_alg_ext` de AutoRound (SignRoundV2, arXiv:2512.04746), un conjunto de calibración propio (`cal_archsloth.jsonl`, 500 muestras de exactamente 9.000 caracteres cada una, con coreano e inglés intercalados a nivel de muestra) y 200 iteraciones sobre 128 muestras. El autor sostiene que lo determinante fue el intercalado de idiomas en la calibración, no la proporción entre ellos. No se aplica ningún cambio en el runtime: se usa llama.cpp sin modificar. No hay información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

La innovación técnica es, por tanto, exclusivamente la búsqueda de redondeo con SignRoundV2 aplicada al nivel Q6_K, junto con la publicación del corpus de calibración, el conjunto de evaluación y los registros de `llama-perplexity` para hacer el resultado reproducible.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con el modelo cargado en llama.cpp.
- Comprensión de imágenes: la torre de visión `mmproj-F32.gguf` se activa pasando `--mmproj` a `llama-server`, lo que habilita entrada image-text-to-text.
- Inferencia local y on-device mediante llama.cpp, con servidor compatible con la API de OpenAI (`--jinja`).
- Capacidades multilingües limitadas a los idiomas declarados (ko, en); el resto de idiomas no está garantizado por la model card.
- Soporte de tool calling, function calling, razonamiento multi-paso y modo thinking: no disponible en la informacion proporcionada.
- Capacidades de código, matemáticas o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en coreano e inglés: el modelo puede ejecutarse con `llama-cli` o `llama-server` en hardware propio sin depender de una API externa, lo que encaja en escenarios con requisitos de privacidad o sin conectividad.
- Procesamiento de documentos con imágenes en coreano: gracias a la torre de visión, se pueden enviar capturas, formularios escaneados o diagramas junto a una pregunta en texto y obtener una respuesta descriptiva, siempre que el contexto lo permita.
- Servidor compatible con OpenAI para prototipado: `llama-server` expone un endpoint compatible con la API de OpenAI, de modo que herramientas que ya hablan ese protocolo pueden apuntar al modelo local sin cambios de código.
- Evaluación de cuantizaciones en investigación: el repositorio incluye `EVAL.md`, `CALIBRATION.md` y los registros en `eval/logs/`, lo que permite reproducir la medición de divergencia KL con `llama-perplexity --kl-divergence` y comparar candidatos sobre el mismo profesor bf16.
- Despliegue en estaciones de trabajo con GPU única: al ser un denso de 27B en Q6_K (22,43 GB), cabe en GPUs de 24 GB o más con margen limitado para caché KV, lo que lo hace apto para entornos de desarrollo con una sola tarjeta.
- Traducción y generación bilingüe coreano-inglés: el corpus de calibración intercalado en ambos idiomas busca preservar el rendimiento en las dos lenguas, lo que resulta útil en flujos de trabajo que alternan entre ellas.

## Benchmarks y rendimiento

Los únicos datos publicados son de divergencia KL respecto al original en bf16, medidos con `llama-perplexity --kl-divergence`, contexto 512, 60 chunks, sobre texto coreano e inglés fuera del conjunto de calibración. Menor es mejor.

| Metrica | ARCHsloth Q6_K | unsloth UD-Q6_K | Diferencia |
|---|---:|---:|---:|
| Tamano del fichero (bytes) | 22.430.999.840 | 21.983.677.344 | +2,0 % |
| Divergencia KL, coreano | 0,001385 | 0,002195 | −36,9 % |
| Divergencia KL, ingles | 0,001254 | 0,001476 | −15,0 % |
| Same-top-p, coreano | 98,222 % | 97,693 % | no disponible el delta exacto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para los pesos: 22,43 GB en Q6_K para el modelo de texto; la torre de visión añade 1,84 GB en F32 si se activa.
- VRAM total: los pesos más la caché KV; el autor advierte explícitamente de que la caché es lo que determina si una sesión de contexto largo cabe, y no publica cifras de contexto ni de memoria de caché.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamaño, el fichero de 22,43 GB no cabe en GPUs de 16 GB ni de 24 GB con caché KV holgada; encaja con más margen en A100 40/80 GB, H100 y RTX 6000 Ada, extremo este último que no está confirmado por el autor.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con la caché KV necesaria para sesiones largas, según el propio tamaño de los pesos; no hay confirmación del autor sobre este punto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server` con `--jinja` y `--mmproj`), y por extensión cualquier frontend compatible con GGUF. vLLM, TGI y Ollama no están mencionados en la informacion proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Divergencia KL (ko / en) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Archsloth/Qwen3.8-27B-GGUF | 27,3 mil M | no disponible | Q6_K, 22,43 GB | 0,001385 / 0,001254 | Apache-2.0 | Hugging Face, 114 descargas |
| unsloth/Qwen3.8-27B-GGUF | 27,3 mil M | no disponible | UD-Q6_K, 21,98 GB | 0,002195 / 0,001476 | Apache-2.0 (heredada) | Hugging Face |
| Qwen/Qwen3.8-27B | 27,3 mil M | no disponible | bf16 (original) | referencia | Apache-2.0 | Hugging Face |

Las dos cuantizaciones comparten tipos de tensor y nivel Q6_K; la única diferencia declarada es el redondeo. No se dispone de datos de benchmarks de tarea que permitan comparar calidad más allá de la divergencia KL, ni de otras alternativas de la misma categoría en la informacion proporcionada.

## Limitaciones y advertencias

- La comparación contra unsloth la realiza el propio autor de la cuantización; no hay validación independiente de los números de divergencia KL.
- La divergencia KL mide fidelidad respecto al bf16, no calidad absoluta en tareas concretas; un valor menor no garantiza mejor rendimiento en benchmarks de razonamiento o código.
- Idiomas declarados solo coreano e inglés; el comportamiento en castellano u otras lenguas no está garantizado y puede degradarse.
- Longitud de contexto no documentada; el autor advierte de que la caché KV condiciona las sesiones largas, sin dar cifras.
- Riesgo de alucinación y sesgos: no hay información específica en la model card; son riesgos inherentes al modelo base y no se han publicado evaluaciones al respecto.
- La torre de visión no está cuantizada (F32), lo que añade 1,84 GB y no se beneficia del trabajo de redondeo.
- Artefacto de un autor individual con 114 descargas y 33 likes en el momento de la consulta; sin mantenimiento garantizado ni historial de versiones más allá de la actualización de noviembre de 2026.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B antes de desplegar en producción.
- El tamaño de 22,43 GB limita el despliegue en GPUs de consumo de 24 GB cuando se necesita contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Archsloth/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de comparación: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Colección del autor: https://huggingface.co/collections/Archsloth/archsloth-models
- Qwen3-4B del mismo autor: https://huggingface.co/Archsloth/Qwen3-4B-GGUF
- Qwen3.5-9B del mismo autor: https://huggingface.co/Archsloth/Qwen3.5-9B-GGUF
- AutoRound (Intel): https://github.com/intel/auto-round
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper SignRoundV2: arXiv:2512.04746
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentación interna del repo: `EVAL.md`, `CALIBRATION.md`, `eval/logs/`
