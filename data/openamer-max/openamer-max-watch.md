# openamer-max/openamer-max-watch

## Resumen

OpenAmer-Max-Watch es el escalón más pequeño de la familia OpenAmer, un conjunto de modelos orientados a ejecución local y sin dependencia de la nube desarrollado por el colectivo openamer-max. Se trata de un ajuste fino mediante LoRA sobre Qwen3-0.6B, un transformer denso de aproximadamente 596 millones de parámetros, especializado en responder preguntas sobre el propio producto OpenAmer (instalación, plataformas, costes, privacidad y licencia) en alemán y bosnio, además de inglés.

El modelo se distribuye principalmente como GGUF Q8_0 (639 MB) pensado para ejecutarse con Ollama en hardware muy modesto, con un requisito de RAM de aproximadamente 1,5 GB. Su entrenamiento se realizó en 15 etapas con un adaptador LoRA de rango 128 y 161 millones de parámetros entrenables, partiendo de la base Qwen3-0.6B bajo licencia Apache-2.0.

Su relevancia actual radica en que ejemplifica un enfoque de especialización agresiva sobre modelos mínimos: alcanza 45/45 en un conjunto congelado de preguntas de producto, a costa de un ligero retroceso en tareas generales frente a la base sin entrenar (12/20 frente a 13/20). Es, por tanto, un modelo de nicho, honesto en sus métricas y útil como componente de atención al cliente o FAQ offline, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) con adaptador LoRA fusionado |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (máximo de entrenamiento); mayor coincidencia medida 39.322 tokens |
| Tipos de cuantizacion | Q8_0 (única publicada en esta etapa) |
| Idiomas soportados | alemán (de), bosnio (bs), croata (hr), serbio (sr), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); adaptador LoRA separado en formato PEFT |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso decoder-only con atención estándar y sin mezcla de expertos. Sobre esa base se aplicó un ajuste fino con LoRA de rango 128, tres épocas y 161 millones de parámetros entrenables, distribuido en 15 etapas de entrenamiento. El autor documenta un reinicio del proceso tras las primeras etapas para poder subir el rango del adaptador a r=128, lo que resultó clave para alcanzar el rendimiento final en el conjunto de evaluación de producto.

La estrategia de datos es explícitamente "fehlergetrieben" (guiada por errores): por cada caso fallido del conjunto de 45 preguntas de producto se generaron ejemplos que cubren la habilidad subyacente (mantener el idioma, distinguir polaridad, respetar formato) en lugar de replicar la pregunta de examen. No se especifica en la información disponible el volumen total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias más allá del ajuste LoRA.

## Capacidades

- Generación de texto conversacional breve y directo, orientado a respuestas concisas.
- Respuesta a preguntas sobre el producto OpenAmer: instalación, plataformas, costes, privacidad y licencia.
- Soporte multilingüe limitado a alemán, bosnio, croata, serbio e inglés, con tolerancia a texto sin diacríticos.
- Cumplimiento estricto de formato: instrucciones como "responde con una sola palabra" o "solo el número".
- Honestidad calibrada ante preguntas cuya respuesta desconoce.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- Contexto de hasta 40.960 tokens, insuficiente para el agente OpenAmer (que exige 64.000).

## Casos de uso

- FAQ de producto offline: el modelo responde preguntas frecuentes sobre OpenAmer sin conexión ni cuenta, adecuado por su especialización y su huella de 639 MB.
- Atención al cliente en primer nivel: gestiona consultas breves en alemán o bosnio con respuestas de formato controlado, reduciendo la carga de un sistema mayor.
- Asistente embebido en aplicaciones de escritorio: al requerir solo ~1,5 GB de RAM, puede integrarse en utilidades locales que necesiten respuestas concisas sobre el producto.
- Clasificación y extracción con formato fijo: su capacidad de obedecer instrucciones de formato ("solo la cifra", "una palabra") lo hace útil para tareas de etiquetado simple.
- Despliegue en dispositivos de gama baja: ejecutable con Ollama en equipos sin GPU dedicada, útil para demos y prototipos.
- Filtro de intención en pipelines conversacionales: puede determinar si una consulta trata sobre el producto OpenAmer antes de derivarla a un modelo mayor.
- Evaluación de técnicas de ajuste LoRA: sirve como caso de estudio reproducible de especialización agresiva sobre modelos de 0,6B.

## Benchmarks y rendimiento

| Evaluación | OpenAmer-Max-Watch (etapa 24) | Etapa previa (9) | Qwen3-0.6B base |
|---|---|---|---|
| Preguntas de producto (45 casos congelados) | 45/45 (100,0 %) | 37/45 (82,2 %) | 23/45 (51,1 %) |
| Tareas generales (20 casos frescos) | 12/20 (60 %) | 10/20 (50 %) | 13/20 (65 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1,5 GB de RAM para la versión Q8_0 de 639 MB.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cualquier GPU consumer con 2 GB o más de VRAM es suficiente.
- Cabe en cualquier GPU consumer moderna (GTX 1050, RTX 3050, RTX 4090, etc.) y en dispositivos móviles de gama media mediante entornos Debian.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-watch`), llama.cpp y cualquier runtime compatible con GGUF. El adaptador LoRA está disponible por separado para uso con PEFT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenAmer-Max-Watch | 0,6B | 40.960 | Apache-2.0 | FAQ de producto en de/bs, local-first |
| Qwen3-0.6B (base) | 0,6B | 32.768 (estándar Qwen3) | Apache-2.0 | Propósito general, multilingüe |
| OpenAmer-Max-Phone | 3,1B | no disponible | Apache-2.0 | Escalón superior de la misma familia |
| OpenAmer-Max-Tab | 7,6B | no disponible | Apache-2.0 | Escalón medio de la misma familia |

La comparación con la base Qwen3-0.6B es la más relevante: el ajuste mejora drásticamente el rendimiento en el dominio de producto (45/45 frente a 23/45) pero pierde un punto en tareas generales (12/20 frente a 13/20). Frente a los escalones superiores de la familia (Phone, Tab, Desktop), el autor reporta puntuaciones de 43/45, 42/45 y 44/45 respectivamente, con mayores requisitos de hardware.

## Limitaciones y advertencias

- Razonamiento multi-paso y matemáticas más allá de cifras pequeñas: no soportados de forma fiable.
- Conocimiento del mundo limitado por su tamaño (0,6B); no apto para consultas generales.
- Generación de textos largos y libres: deficiente.
- Contexto de 40.960 tokens, insuficiente para el agente OpenAmer que exige 64.000; no puede usarse como motor de dicho agente.
- Riesgo de alucinación en preguntas fuera de su dominio especializado.
- El conjunto de 45 preguntas de producto actúa como protección contra regresiones, pero no demuestra mejora general: el conjunto fresco A2 arroja 12/20, por debajo de la base.
- Licencia Apache-2.0 permite uso comercial, pero el modelo está entrenado para un producto concreto; su utilidad fuera de ese contexto es marginal.
- Idiomas cubiertos limitados a de, bs, hr, sr, en; no se garantiza comportamiento en castellano.
- Solo se publica cuantización Q8_0 en esta etapa; no hay Q6 ni otras variantes actuales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-watch
- Adaptador LoRA: https://huggingface.co/openamer-max/openamer-max-watch-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio web del proyecto: https://openamer-max.github.io
- Página del "Gerätepass": https://openamer-max.github.io/geraetepass/
- Página de Android: https://openamer-max.github.io/android.html
- Código fuente: https://github.com/openamer-max/openamer
- Informe de medición de contexto: https://github.com/openamer-max/models/blob/main/docs/KONTEXT-MESSUNG.md
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Grupo de Facebook: https://www.facebook.com/groups/1862788325147358/
