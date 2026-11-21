# lecheyne24/llama-3.2-3b-abliterated

## Resumen

`lecheyne24/llama-3.2-3b-abliterated` es una variante "abliterated" (sin censura) del modelo `meta-llama/Llama-3.2-3B-Instruct` de Meta, publicada por el usuario lecheyne24 en Hugging Face. El modelo parte de la arquitectura transformer densa de Llama 3.2 de 3.212.749.888 parámetros y aplica una técnica de ablación de la dirección de rechazo (refusal-direction ablation) seguida de un ajuste fino supervisado con LoRA sobre un corpus de respuestas directas, cuyo resultado se fusiona y se convierte a formato GGUF cuantizado en Q4_K_M para su uso con llama.cpp.

El objetivo declarado es eliminar los mecanismos de rechazo del modelo instruct original, de modo que responda de forma directa a peticiones que el modelo base rechazaría. El autor incluye una prueba interna ("plain-answer gauntlet") con un resultado de 7/8, en la que el único fallo fue una respuesta de rechazo ante una consulta sobre predicción bursátil.

Se distribuye únicamente como archivo GGUF cuantizado (Q4_K_M), con un repositorio de 4,0 GB, y está pensado para servirse localmente mediante `llama-server` con una API compatible con OpenAI. No se han publicado datos sobre licencia, idiomas soportados, benchmarks ni composición del dataset de ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.2 3B Instruct) |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 4096` |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`llama-3.2-3b-abliterated.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Llama 3.2 3B Instruct, con 3.212.749.888 parámetros. Sobre esa base, el autor aplica una ablación de la dirección de rechazo (abliteration), una técnica que identifica y elimina del espacio de activaciones la dirección asociada a las respuestas de negativa, y después realiza un ajuste fino supervisado con LoRA sobre un corpus de "respuestas directas" (plain-answer corpus). El adaptador LoRA se fusiona con los pesos base, se convierte a GGUF y se cuantiza a Q4_K_M mediante `llama-quantize --allow-requantize`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus de SFT, ni si hubo etapas de RLHF o DPO posteriores a la ablación. Tampoco se detalla la metodología exacta de cálculo de la dirección de rechazo ni los hiperparámetros del LoRA.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct base.
- Respuestas directas ante peticiones que el modelo original rechazaría, gracias a la ablación de la dirección de rechazo.
- Razonamiento básico y respuesta a instrucciones en el rango propio de un modelo de 3B parámetros.
- Formato de chat instruct (derivado de Llama 3.2 3B Instruct), con plantilla de conversación del modelo base.
- Servicio mediante API compatible con OpenAI a través de `llama-server` (`http://localhost:8082/v1`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües: no disponibles en la model card; se desconoce si conserva el perfil multilingüe del modelo base.

## Casos de uso

- Servicio local de chat sin filtros: el modelo se puede desplegar con `llama-server` en el puerto 8082 y consumir desde una API compatible con OpenAI, lo que permite integrarlo en aplicaciones de chat internas donde se requiere respuesta directa sin rechazos.
- Investigación sobre alineación y seguridad: sirve como contrapunto experimental para estudiar cómo la ablación de la dirección de rechazo afecta al comportamiento del modelo en comparación con `Llama-3.2-3B-Instruct`, en un entorno controlado.
- Generación de texto creativo sin restricciones temáticas: útil para escritura de ficción, guiones o narrativa que aborde temas sensibles y que el modelo base rechazaría por defecto.
- Prototipado rápido en hardware de consumo: con cuantización Q4_K_M y ~3,2B parámetros, cabe en GPU de gama media y permite iterar en local sin depender de APIs externas.
- Evaluación de robustez de pipelines: permite comprobar cómo se comporta un sistema aguas abajo cuando el modelo deja de aplicar rechazos, para diseñar capas de moderación propias.
- Experimentos de destilación o ajuste posterior: al ser un GGUF Q4_K_M, sirve como referencia de comportamiento para comparar variantes cuantizadas del mismo modelo base en tareas de generación abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es la prueba interna del autor ("plain-answer gauntlet"), con un resultado de 7/8 respuestas directas y un único fallo ante una consulta de predicción bursátil. No se aportan métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 4,0 GB en disco; en ejecución con llama.cpp se requiere espacio adicional para el contexto KV, por lo que conviene disponer de al menos 6-8 GB de VRAM para `-c 4096`.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el segmento profesional, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en Q4_K_M; con contextos largos o cuantizaciones mayores se recomienda 12-16 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por compatibilidad de formato GGUF, también Ollama y otros runners basados en llama.cpp. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lecheyne24/llama-3.2-3b-abliterated | 3,21B | no disponible (ejemplo con 4096) | no disponible | GGUF Q4_K_M | Variante sin censura vía ablación + LoRA SFT |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128K (según ficha oficial de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo base original, con rechazos alineados |
| Otras variantes abliterated de Llama 3.2 3B | ~3,2B | variable según autor | variable según autor | GGUF, safetensors | Múltiples publicaciones comunitarias con metodologías de ablación similares |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La ablación de la dirección de rechazo elimina barreras de seguridad: el modelo puede generar contenido dañino, ilegal o sensible sin filtros, lo que exige moderación externa en cualquier despliegue público.
- Riesgo elevado de alucinación, propio de un modelo de 3B parámetros, y potencialmente agravado por el ajuste fino sobre un corpus no documentado.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido; además, al derivar de Llama 3.2, arrastra las obligaciones de la Llama 3.2 Community License del modelo base.
- No se documentan los idiomas soportados ni si se conserva el perfil multilingüe del modelo original.
- El contexto máximo real no está confirmado; el ejemplo de la model card limita a 4096 tokens, aunque el modelo base soporta ventanas mayores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni auditorías externas.
- El corpus de SFT y los hiperparámetros del LoRA no están documentados, lo que dificulta reproducir el proceso o evaluar su impacto.
- La evaluación del autor (7/8) es interna, no estandarizada y no constituye una validación de calidad general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lecheyne24/llama-3.2-3b-abliterated
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
