# nagohachi/tiny-lm-v1-japanese-500m-dpo

## Resumen

tiny-lm-v1-japanese-500m-dpo es un modelo de lenguaje de aproximadamente 480 millones de parámetros desarrollado por el usuario independiente nagohachi. Se trata de la versión alineada mediante DPO (Direct Preference Optimization) del modelo tiny-lm-v1-japanese-500m-sft, que a su vez deriva de un modelo base preentrenado desde cero sobre unos 10.000 millones de tokens en japonés. El modelo está diseñado específicamente para generación de texto conversacional en japonés y emplea una implementación propia de estilo Llama que requiere `trust_remote_code=True`.

El modelo resuelve el problema de disponer de un LLM pequeño, completamente entrenado en japonés y alineado para chat, que puede ejecutarse en hardware modesto. Con una longitud de contexto de 2048 tokens y un vocabulario de 99.574 tokens heredado del tokenizador de llm-jp-3-440m, está pensado para experimentación e investigación en modelos compactos de japonés más que para producción a gran escala.

Su relevancia actual radica en que forma parte del ecosistema de modelos japoneses pequeños (junto a llm-jp-3-440m) y demuestra un pipeline completo de preentrenamiento, SFT y DPO sobre un modelo de menos de 500M de parámetros. La licencia no está especificada en la información disponible, lo que limita su uso comercial sin aclaración previa del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer estilo Llama (implementación custom, requiere `trust_remote_code=True`) |
| Parámetros totales | 479.501.312 (~480M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF no publicada por el autor) |
| Idiomas soportados | Japonés (ja) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |
| Vocabulario | 99.574 tokens |
| Tokenizador | llm-jp/llm-jp-3-440m |
| Tamaño del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de tipo Llama con una implementación personalizada incluida en el repositorio, por lo que es obligatorio cargarlo con `trust_remote_code=True`. Cuenta con 479,5 millones de parámetros y una ventana de contexto de 2048 tokens. El tokenizador es el de llm-jp-3-440m, con un vocabulario de 99.574 tokens, lo que sugiere una cobertura razonable del japonés.

El entrenamiento se realizó en tres fases: un preentrenamiento desde cero sobre aproximadamente 10.000 millones de tokens (modelo base), un ajuste supervisado (SFT) que produjo tiny-lm-v1-japanese-500m-sft, y finalmente una alineación por DPO sobre el dataset llm-jp/hh-rlhf-12k-ja, que contiene unas 11.500 parejas de preferencia y supuso un consumo de 21,7 millones de tokens durante esta fase. No se dispone de información sobre la composición detallada del corpus de preentrenamiento, el uso de RLHF adicional ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en japonés, con formato de chat mediante `apply_chat_template`.
- Alineación de respuestas mediante DPO, orientada a preferencias humanas recogidas en hh-rlhf-12k-ja.
- Razonamiento básico y respuesta a preguntas en japonés (capacidad limitada por el tamaño del modelo).
- Comprensión lectora y clasificación de texto en japonés (evaluado en llm-jp-eval).
- Traducción japonés-inglés dentro de las tareas de llm-jp-eval (MT).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Multilingüismo limitado: el modelo está entrenado y etiquetado exclusivamente para japonés.

## Casos de uso

- Experimentación académica con modelos pequeños en japonés: sirve como referencia reproducible de un pipeline completo base → SFT → DPO en menos de 500M de parámetros, útil para estudiar el efecto de cada fase sobre métricas de llm-jp-eval.
- Prototipado de chatbots en japonés en entornos con recursos limitados: con 480M de parámetros y contexto de 2048 tokens, puede desplegarse en una sola GPU de consumo para pruebas de concepto conversacionales.
- Generación de respuestas conversacionales breves: adecuado para tareas de chat de un solo turno o pocos turnos donde la latencia y el coste importan más que la profundidad del razonamiento.
- Evaluación comparativa de técnicas de alineación: al publicar resultados de base, SFT y DPO sobre el mismo benchmark, permite analizar empíricamente el impacto del DPO en un modelo diminuto.
- Clasificación y análisis de texto japonés en pipelines ligeros: sus resultados en tareas de comprensión lectora y NLI de llm-jp-eval lo hacen utilizable como componente de bajo coste en tareas de procesamiento de lenguaje natural japonesas.
- Traducción automática japonés-inglés de bajo recursos: con una puntuación MT de 0,531 en llm-jp-eval, puede emplearse en escenarios donde no se requiere calidad de producción.
- Fine-tuning posterior por parte de la comunidad: al ser un modelo pequeño y con código custom, sirve de base para experimentos de ajuste adicional en dominios específicos del japonés.

## Benchmarks y rendimiento

Resultados en llm-jp-eval (v2.1.5). Los modelos base usan configuración 4-shot; los modelos SFT/DPO y el baseline instruct se evalúan a través de su plantilla de chat.

| Modelo | average | CR | EL | FA | HE-EN | HE-JA | MR | MT | NLI | QA | RC |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| tiny-lm-v1-japanese-500m-base | 0,198 | 0,223 | 0,130 | 0,035 | 0,207 | 0,130 | 0,007 | 0,504 | 0,483 | 0,072 | 0,190 |
| tiny-lm-v1-japanese-500m-sft | 0,191 | 0,310 | 0,102 | 0,036 | 0,187 | 0,070 | 0,013 | 0,523 | 0,380 | 0,082 | 0,210 |
| tiny-lm-v1-japanese-500m-dpo | 0,194 | 0,310 | 0,130 | 0,036 | 0,187 | 0,070 | 0,013 | 0,531 | 0,345 | 0,082 | 0,240 |
| llm-jp/llm-jp-3-440m | 0,249 | 0,280 | 0,266 | 0,059 | 0,170 | 0,080 | 0,027 | 0,760 | 0,525 | 0,144 | 0,180 |
| llm-jp/llm-jp-3-440m-instruct3 | 0,254 | 0,317 | 0,289 | 0,066 | 0,223 | 0,110 | 0,017 | 0,744 | 0,520 | 0,155 | 0,100 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1 GB para los pesos (480M parámetros × 2 bytes), más overhead de activaciones y caché KV para 2048 tokens.
- En cuantización de 8 bits: en torno a 0,5 GB de pesos; en 4 bits, alrededor de 0,3 GB (estimaciones teóricas; el autor no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en bf16; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo e incluso en iGPU con memoria unificada suficiente, siempre que se use cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se han publicado pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia. vLLM y TGI no están verificados con esta implementación custom.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | average (llm-jp-eval) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| tiny-lm-v1-japanese-500m-dpo | 480M | 2048 | 0,194 | no disponible | Hugging Face (custom code) |
| tiny-lm-v1-japanese-500m-sft | 480M | 2048 | 0,191 | no disponible | Hugging Face |
| llm-jp/llm-jp-3-440m | 440M | no disponible | 0,249 | no disponible en la información | Hugging Face |
| llm-jp/llm-jp-3-440m-instruct3 | 440M | no disponible | 0,254 | no disponible en la información | Hugging Face |

El modelo de llm-jp obtiene mejores resultados globales (0,249-0,254 frente a 0,194), especialmente en traducción (MT 0,744-0,760 frente a 0,531) y QA (0,144-0,155 frente a 0,082). El modelo DPO de nagohachi solo supera al baseline en comprensión lectora (RC 0,240 frente a 0,180-0,100).

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse uso comercial sin confirmación del autor.
- Tamaño muy reducido (480M de parámetros): capacidad de razonamiento, conocimiento factual y coherencia limitadas; el promedio en llm-jp-eval es de 0,194.
- Riesgo elevado de alucinación, especialmente en preguntas factuales y tareas de conocimiento abierto.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Entrenado exclusivamente en japonés: el rendimiento en otros idiomas, incluido el castellano, será muy deficiente.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; debe auditarse antes de usarlo en entornos sensibles.
- El DPO reduce el rendimiento en NLI (0,345 frente a 0,483 del base) y en HE-JA (0,070 frente a 0,130), lo que sugiere un cierto olvido catastrófico tras la alineación.
- Sin versiones cuantizadas oficiales ni soporte verificado en motores de inferencia de alto rendimiento (vLLM, TGI), lo que complica el despliegue en producción.
- Modelo con muy pocas descargas (47) y sin likes: comunidad y validación externa mínimas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-dpo
- Modelo SFT base: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-sft
- Modelo base preentrenado: https://huggingface.co/nagohachi/tiny-lm-v1-japanese-500m-base
- Dataset de preferencias: https://huggingface.co/datasets/llm-jp/hh-rlhf-12k-ja
- Tokenizador de referencia: https://huggingface.co/llm-jp/llm-jp-3-440m
- Baseline comparativo: https://huggingface.co/llm-jp/llm-jp-3-440m-instruct3
