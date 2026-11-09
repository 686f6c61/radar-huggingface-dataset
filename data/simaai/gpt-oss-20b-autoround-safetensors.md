# simaai/gpt-oss-20b-Autoround-Safetensors

## Resumen

`simaai/gpt-oss-20b-Autoround-Safetensors` es una versión cuantizada del modelo `openai/gpt-oss-20b`, preparada por SiMa.ai a partir del checkpoint en BF16 de Unsloth (`unsloth/gpt-oss-20b-BF16`). El resultado es un checkpoint de Hugging Face pensado como paso previo a la compilación con LLiMa para su despliegue en hardware de SiMa.ai. Se distribuye con licencia Apache 2.0 y formato safetensors compatible con la librería `transformers` y `compressed-tensors`.

El modelo conserva la arquitectura original de GPT-OSS 20B (transformer con mezcla de expertos, según el modelo base de OpenAI) y aplica cuantización post-entrenamiento con AutoRound: INT4 simétrico con bloques de 256 canales en las capas lineales del decodificador (incluidas las proyecciones de expertos), INT8 simétrico por canal de salida en los routers y INT4 en `lm_head`. Las embeddings, normalizaciones y sesgos se mantienen en BF16.

Su relevancia es acotada y muy específica: no es un modelo para uso general en servidores convencionales, sino un artefacto de despliegue orientado a la cadena de herramientas de SiMa.ai. No incluye script de reproducción (`quantize.py`) ni resultados de benchmarks, y su card advierte explícitamente de que la calidad de la cuantización puede variar según idioma, dominio, formato de prompt, longitud de contexto y runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (GPT-OSS, segun modelo base); capas lineales del decodificador y proyecciones de expertos cuantizadas |
| Parametros totales | 20.914.757.184 (20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AutoRound INT4 simetrico G256 en lineales del decodificador y expertos; RTN INT8 simetrico por canal de salida en routers; RTN INT4 G256 en `lm_head`; BF16 en embeddings, normalizaciones y sesgos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con formato `pack-quantized` de `compressed-tensors`, escalas en BF16 |

## Arquitectura y entrenamiento

El checkpoint deriva de `openai/gpt-oss-20b` a través de la versión BF16 de Unsloth. La arquitectura subyacente es la de GPT-OSS 20B, un transformer con mezcla de expertos; la card de esta versión cuantizada no detalla la composición del dataset de entrenamiento original, el número de tokens ni si hubo fases de RLHF o DPO. Toda esa información corresponde al modelo base de OpenAI, no a este artefacto.

La innovación técnica de esta ficha es el proceso de cuantización. Se aplicó AutoRound con 1.000 iteraciones y batch size 1 sobre las capas lineales del decodificador, incluidas las proyecciones de expertos, con INT4 simétrico y bloques de 256 canales; los routers quedaron en INT8 simétrico por canal de salida y `lm_head` en INT4 G256, separado de las embeddings de entrada en BF16. Para manejar dimensiones de entrada no divisibles por 256 se usó una rama personalizada de `llm-compressor` que permite bloques parciales (por ejemplo, una dimensión de 2.880 canales se descompone en once bloques de 256 y uno de 64, cada uno con su propia escala) preservando las dimensiones originales de los canales. El checkpoint no incluye `quantize.py`; solo se adjunta `recipe.yaml` como referencia de configuración.

## Capacidades

- Generación de texto conversacional, heredada del modelo base GPT-OSS 20B.
- Razonamiento y resolución de problemas, en la medida en que lo permita el modelo base y la pérdida de precisión por cuantización.
- Generación de código y matemáticas, supeditada a la validación en el dispositivo objetivo (la card no aporta métricas).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta versión.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada para esta versión.
- Capacidades multilingües: no disponible; la card advierte de que la calidad de la cuantización puede variar por idioma.
- Modo thinking, visión o audio: no disponible en la información proporcionada.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` aparece en los tags del repositorio.

## Casos de uso

- Despliegue en hardware SiMa.ai: el caso principal. El checkpoint se compila con `llima-compile` para generar un artefacto de despliegue separado, orientado a inferencia en el acelerador de SiMa.ai.
- Evaluación de la cadena de compilación LLiMa: sirve para validar el flujo completo (checkpoint cuantizado, compilación, ejecución) antes de integrar modelos en producción sobre hardware SiMa.ai.
- Prototipado de asistentes conversacionales en el borde: al ser un modelo de 20,9 mil millones de parámetros con pesos INT4 y un repo de 11,5 GB, puede encajar en escenarios de inferencia en dispositivos con recursos limitados, siempre que se valide la calidad en el runtime objetivo.
- Investigación sobre cuantización AutoRound: el `recipe.yaml` y la descripción del soporte de bloques parciales G256 permiten estudiar el efecto de la cuantización por bloques en modelos MoE.
- Comparación de precisión BF16 frente a INT4: útil para medir la degradación por idioma, dominio y longitud de contexto en el modelo GPT-OSS 20B.
- Integración en pipelines de `transformers`: al cargarse con la librería estándar y `compressed-tensors`, puede usarse en pruebas de humo y validación de tokenizador y plantilla de chat antes de la compilación.
- Referencia para despliegues con cuantización mixta: el esquema (INT4 en lineales, INT8 en routers, BF16 en embeddings) es un ejemplo práctico de receta de cuantización selectiva para arquitecturas MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no reporta puntuaciones y que la calidad de la cuantización puede variar según idioma, dominio, formato de prompt, longitud de contexto y runtime de despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 11,5 GB en safetensors, por lo que se necesita al menos ese espacio para cargar los pesos; el consumo real de memoria depende del runtime y de las activaciones.
- GPU recomendadas: no disponible en la información proporcionada. El destino previsto es el hardware de SiMa.ai tras la compilación con LLiMa.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos (unos 11,5 GB en INT4/BF16 mixto) podría caber en GPUs con 16 GB o más de VRAM, pero no hay validación publicada.
- Opciones de despliegue: `transformers` con `compressed-tensors` para carga del checkpoint; compilación con `llima-compile` para el artefacto de despliegue en SiMa.ai. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simaai/gpt-oss-20b-Autoround-Safetensors | 20,9 mil millones | no disponible | AutoRound INT4/INT8 + BF16 | Apache 2.0 | Hugging Face (repo de 11,5 GB) |
| openai/gpt-oss-20b | 20,9 mil millones (aproximado, mismo modelo base) | no disponible | BF16 original | Apache 2.0 | Hugging Face |
| unsloth/gpt-oss-20b-BF16 | 20,9 mil millones (aproximado) | no disponible | BF16 | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base, ya que la información disponible no incluye datos de rendimiento que permitan contrastarlo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No se han publicado benchmarks; no hay evidencia cuantitativa de la degradación introducida por la cuantización.
- La calidad puede variar según idioma, dominio, formato de prompt, longitud de contexto y runtime de despliegue, según advierte la propia card.
- No se incluye `quantize.py`: la reproducción exacta requiere la rama personalizada de `llm-compressor` y el setup de calibración, que no se distribuyen.
- El checkpoint está pensado como paso previo a la compilación con LLiMa; su uso directo en otros runtimes no está validado.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta versión; heredados del modelo base en la medida en que la cuantización los preserve o amplifique.
- Idiomas soportados: no disponibles; conviene validar el idioma objetivo antes de producción.
- Licencia Apache 2.0: permite uso comercial, pero se mantienen las condiciones de uso previsto y limitaciones del modelo fuente.
- El repositorio no registra descargas ni likes, lo que sugiere poca validación comunitaria hasta la fecha.

## Enlaces

- Hugging Face: https://huggingface.co/simaai/gpt-oss-20b-Autoround-Safetensors
- Modelo base en BF16: https://huggingface.co/unsloth/gpt-oss-20b-BF16
- Modelo original de OpenAI: https://huggingface.co/openai/gpt-oss-20b
- Pesos originales: https://huggingface.co/openai/gpt-oss-20b/blob/main/original/model.safetensors
