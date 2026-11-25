# Reallexi-llc/lexi-2.3b

## Resumen

Lexi 2.3B es un checkpoint de generación de texto de 2.245.681.664 parámetros publicado por Reallexi LLC bajo el identificador `Reallexi-llc/lexi-2.3b`. El modelo se distribuye en formato `safetensors` para la librería `transformers` y su `config.json` declara la arquitectura `qwen2`, por lo que es compatible con el ecosistema de herramientas que ya soporta la familia Qwen2. Según la model card, el checkpoint se produjo con la plataforma propietaria Reallexi AI Model Builder, una herramienta de entrenamiento local-first.

El dato más relevante de la model card es el estado declarado por el propio autor: `trained_needs_quality_review`. La pérdida en un conjunto held-out de 2.040 tokens pasó de 6,1396 antes de un proceso de "healing" a 2,6628 después, pero el autor advierte explícitamente de que la expansión y la recarga correcta del checkpoint no certifican la calidad del modelo. No se documentan tokens de entrenamiento, composición del dataset, idiomas soportados ni licencia.

Se trata, por tanto, de un modelo de nicho, con cero descargas en el momento de la consulta y sin benchmarks publicados, orientado a experimentación y evaluación interna más que a despliegue en producción. Su interés técnico reside en el proceso de expansión y reparación de checkpoints documentado en `model_surgery.json`, no en unas capacidades verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (identificador en `config.json`, compatible con transformers) |
| Parametros totales | 2.245.681.664 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantización a GGUF/AWQ no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "All rights reserved" de Reallexi LLC, sin licencia SPDX declarada) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,0 GB |
| Estado declarado | `trained_needs_quality_review` |
| Perdida held-out (2.040 tokens) | 6,1396 antes del healing; 2,6628 después |

## Arquitectura y entrenamiento

El modelo reutiliza los identificadores de arquitectura de Qwen2 en `config.json`, lo que garantiza compatibilidad de carga con la implementación de Qwen2 en `transformers`. Con 2.245.681.664 parámetros y un repositorio de 9,0 GB, los pesos se almacenan en safetensors; el tamaño del repo es coherente con pesos en precisión de 16 bits o con artefactos adicionales de entrenamiento (optimizador, checkpoints intermedios), dato que no se detalla.

No se especifican el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO ni innovaciones de decodificación. La única información de entrenamiento es el proceso de "healing" reportado: una reparación del checkpoint que redujo la pérdida held-out de 6,1396 a 2,6628 sobre 2.040 tokens. El autor remite a `model_surgery.json` para la trazabilidad del linaje y la evidencia de verificación, y advierte que los modelos y datasets upstream conservan sus propias licencias y términos.

## Capacidades

- Generación de texto conversacional: la model card etiqueta el modelo con `conversational` y `text-generation`, y el pipeline declarado es `text-generation`.
- Compatibilidad con Text Generation Inference (TGI) y con endpoints compatibles, según los tags del repositorio.
- Razonamiento, código, matemáticas y visión: no documentados; no hay evidencia en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el autor no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no documentadas.
- Estado de calidad: el propio autor indica que el modelo requiere revisión de calidad antes de cualquier despliegue.

## Casos de uso

- Evaluación interna de checkpoints: el modelo es adecuado para que un equipo de investigación reproduzca el pipeline de "healing" y mida la pérdida held-out sobre sus propios conjuntos, dado que el autor publica la métrica antes y después (6,1396 frente a 2,6628).
- Pruebas de compatibilidad con el ecosistema Qwen2: al declarar arquitectura Qwen2, sirve para validar que pipelines de `transformers`, TGI o endpoints compatibles cargan correctamente checkpoints de 2,2B parámetros sin cambios de código.
- Experimentos de expansión de modelos: el repositorio incluye `model_surgery.json` con el linaje, lo que permite estudiar cómo se comporta un checkpoint expandido y reparado frente al modelo de origen.
- Generación de texto conversacional en entornos controlados: para prototipos de chat de baja exigencia donde el equipo pueda tolerar y medir tasas de alucinación antes de cualquier uso externo.
- Fine-tuning posterior: con 2,2B parámetros y pesos safetensors, es viable ajustarlo en una GPU de 24 GB con técnicas de parametrización eficiente (LoRA/QLoRA), siempre que se valide primero la calidad del checkpoint base.
- Docencia y formación: como ejemplo práctico de las advertencias que debe acompañar a un checkpoint no validado (estado `needs_quality_review`, pérdida held-out limitada a 2.040 tokens).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo es la pérdida held-out sobre 2.040 tokens: 6,1396 antes del healing y 2,6628 después.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,5 GB solo para pesos (2,245.681.664 parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 2,3 GB para pesos; en 4 bits, en torno a 1,2 GB. Estas cuantizaciones no están publicadas por el autor y requerirían conversión propia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado; A100, H100 o L40S para servir con concurrencia. Cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles. llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado / benchmarks |
|---|---|---|---|---|
| Lexi 2.3B (Reallexi LLC) | 2,25B | no disponible | no disponible (all rights reserved) | `needs_quality_review`; sin benchmarks |
| Qwen2.5-1.5B (Alibaba) | 1,54B | 32.768 tokens (versión base) | Apache 2.0 | Benchmarks publicados por el autor |
| Gemma 2 2B (Google) | 2,6B | 8.192 tokens | Gemma Terms of Use | Benchmarks publicados por el autor |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8.192 tokens | Apache 2.0 | Benchmarks publicados por el autor |

La comparación se limita a parámetros, contexto y licencia, porque Lexi 2.3B no publica resultados de evaluación que permitan contrastar rendimiento. Los datos de los modelos alternativos provienen de sus respectivas model cards públicas y no de la información proporcionada para este modelo.

## Limitaciones y advertencias

- Calidad no certificada: el autor declara el estado `trained_needs_quality_review` y advierte de que la expansión y la recarga correcta no certifican la calidad del modelo.
- Evidencia de evaluación mínima: la pérdida held-out se calcula sobre solo 2.040 tokens, una muestra demasiado pequeña para inferir comportamiento general.
- Licencia ambigua: no hay licencia SPDX declarada; la model card indica "All rights reserved" de Reallexi LLC, lo que impide asumir uso comercial sin autorización expresa.
- Linaje y licencias upstream: los modelos y datasets de origen conservan sus propios términos, y el autor remite a `model_surgery.json` para verificarlos; es responsabilidad del usuario comprobarlos antes de redistribuir.
- Idiomas no declarados: no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinación: sin benchmarks ni evaluación de calidad, debe asumirse un riesgo elevado y no verificable.
- Sesgos: no documentados; al no conocerse la composición del dataset, no es posible evaluar sesgos de género, idioma o dominio.
- Adopción nula: cero descargas en el momento de la consulta, sin comunidad que haya reportado resultados independientes.
- No apto para producción sin evaluación previa sobre tareas representativas y conjuntos held-out propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reallexi-llc/lexi-2.3b
- Plataforma de entrenamiento Reallexi AI Model Builder: https://llm.reallexi.io
- Fichero de linaje y verificación: `model_surgery.json` en el repositorio de Hugging Face (https://huggingface.co/Reallexi-llc/lexi-2.3b/blob/main/model_surgery.json)
