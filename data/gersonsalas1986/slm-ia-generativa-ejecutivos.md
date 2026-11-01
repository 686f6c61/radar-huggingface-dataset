# GersonSalas1986/slm-ia-generativa-ejecutivos

## Resumen

`slm-ia-generativa-ejecutivos` es un adaptador LoRA sobre el modelo base Qwen2.5-0.5B-Instruct, desarrollado por Gerson Salas en el marco del Taller de destilación en pequeño del Magíster en IA de la Universidad Adolfo Ibáñez (octubre de 2026). Su propósito es acotado y educativo: actuar como asistente que explica conceptos de inteligencia artificial generativa a ejecutivos de empresas chilenas, con ejemplos de negocio, cubriendo cinco temas concretos (agentes de IA, ajuste fino, fundamentos de LLM, ingeniería de prompts y RAG).

El modelo se entrena mediante destilación de caja negra: un LLM comercial por API generó 100 pares pregunta-respuesta en español que sirvieron como datos de SFT, y el mismo profesor actuó como juez con una rúbrica de 1 a 10 sobre un examen fijo de 12 preguntas nunca vistas durante el entrenamiento. El ajuste emplea LoRA con r = 16, α = 32 sobre todas las proyecciones de atención y MLP, lo que supone 8,8 millones de parámetros entrenables (1,8 % del total) y 150 pasos de entrenamiento en Apple Silicon (MPS) en 82 segundos.

Es relevante ahora como caso documentado de destilación de bajo coste sobre un modelo pequeño (494 M de parámetros) y como ejemplo honesto de sus propios límites: la nota media pasa de 3,50 a 4,58 sobre 10, con una sola pregunta aprobada de 12. El autor lo presenta explícitamente como material educativo y no como asistente para decisiones de negocio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parámetros totales | 494 M (modelo base) + 8,8 M entrenables en el adaptador (1,8 %) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT: `adapter_model.safetensors`, `adapter_config.json`); pesos del base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 M de parámetros. El ajuste es SFT con LoRA de rango 16 y α = 32 sobre todas las proyecciones de atención y MLP, con 8,8 M parámetros entrenables. La configuración de entrenamiento es: 3 épocas, lote de tamaño 2, learning rate 5e-4 con calentamiento y decaimiento coseno, enmascaramiento de la pregunta en la pérdida y semilla 42. El entrenamiento completo consta de 150 pasos y 82 segundos en Apple Silicon (MPS).

Los datos provienen de destilación de caja negra: un LLM comercial por API (identificado como `gpt-6-luna` en la model card) generó 100 pares pregunta-respuesta en español (60 + 40) que constituyen el conjunto de entrenamiento. La evaluación se realiza con el mismo LLM actuando como juez, aplicando una rúbrica de 1 a 10 sobre un examen fijo de 12 preguntas que nunca se usó para entrenar. El autor probó tres estudiantes (SmolLM2-135M, SmolLM2-360M y Qwen2.5-0.5B) y diez corridas variando una variable por vez; esta configuración fue la mejor. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto en español orientada a la explicación de conceptos de IA generativa para audiencia ejecutiva.
- Cobertura de cinco temas concretos: agentes de IA, ajuste fino, fundamentos de LLM, ingeniería de prompts y RAG.
- Generación de ejemplos de negocio aplicados a los conceptos explicados.
- Formato de conversación mediante `apply_chat_template` del tokenizador de Qwen2.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de razonamiento extendido (thinking mode).
- Multilingüismo limitado al español según la model card; el autor advierte aparición ocasional de caracteres en chino.

## Casos de uso

- Formación interna en IA generativa para directivos: el adaptador responde preguntas sobre RAG, agentes, prompts y ajuste fino con ejemplos de negocio, lo que permite desplegar un asistente de apoyo en sesiones formativas o intranets corporativas sin depender de una API externa.
- Material didáctico en cursos de posgrado: sirve como ejemplo reproducible de destilación de caja negra con LoRA sobre un modelo de 0,5 B, útil para que estudiantes comparen configuraciones y midan el efecto del ajuste con un examen fijo.
- Prototipado de asistentes verticales de bajo coste: al ejecutarse en CPU o en una GPU de consumo, permite validar la viabilidad de un asistente temático antes de invertir en un modelo mayor.
- Generación de borradores de explicaciones para glosarios o FAQs internas: el modelo produce texto en español sobre los cinco temas cubiertos, que un humano revisa y corrige antes de publicar.
- Evaluación comparativa de estudiantes pequeños: el pipeline de examen fijo con juez LLM descrito en la model card puede reutilizarse para comparar otros adaptadores sobre SmolLM2 o Qwen2.5 en dominios acotados.
- Docencia sobre límites de los SLM: sus fallos documentados (palabras inventadas, mezcla de caracteres, nota media de 4,58/10) lo convierten en un caso práctico para enseñar por qué un modelo de 494 M con 100 ejemplos no es apto para producción.

## Benchmarks y rendimiento

Resultados en el examen fijo de 12 preguntas, evaluado por un juez LLM con rúbrica de 1 a 10:

| Modelo | Nota media | Aprobación (≥ 7) | Agentes | Ajuste fino | Fundamentos | Prompts | RAG |
|---|---|---|---|---|---|---|---|
| Qwen2.5-0.5B base (antes) | 3,50 | 8 % | 4,00 | 3,50 | 2,50 | 4,67 | 2,00 |
| Este adaptador (después) | 4,58 | 8 % | 5,00 | 4,00 | 2,50 | 4,67 | 6,50 |

La mejora se concentra en RAG (+4,5 puntos) y Agentes (+1,0). Fundamentos no mejora. El autor señala que, con 12 preguntas, diferencias de ±0,3 están dentro del ruido del juez. Una auditoría manual de 10 respuestas coincidió con el juez dentro de ±1 punto en el 100 % de los casos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 494 M de parámetros; en fp16 requiere aproximadamente 1 GB de VRAM, y en cuantizaciones de 8 o 4 bits, menos de 1 GB. El adaptador LoRA añade 8,8 M de parámetros (unos 35 MB en fp32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el entrenamiento documentado se realizó en Apple Silicon (MPS) en 82 segundos.
- Cabe en GPU de consumo: sí, en cualquier RTX de la serie 30 o 40, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + peft (flujo documentado en la model card); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El único dato de tiempo es el entrenamiento (150 pasos, 82 s en MPS).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| slm-ia-generativa-ejecutivos | 494 M + 8,8 M (LoRA) | no disponible | Adaptador LoRA destilado para divulgación de IA a ejecutivos | Apache 2.0 | HuggingFace (archivos del adaptador pendientes de subir según la model card) |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible en la información proporcionada | Modelo base instructivo generalista | Apache 2.0 | HuggingFace |
| SmolLM2-360M | 360 M | no disponible en la información proporcionada | Modelo pequeño generalista | Apache 2.0 | HuggingFace |
| SmolLM2-135M | 135 M | no disponible en la información proporcionada | Modelo pequeño generalista | Apache 2.0 | HuggingFace |

El autor probó SmolLM2-135M y SmolLM2-360M como estudiantes alternativos en el mismo pipeline, pero no se publican sus notas en la model card, por lo que la comparación cuantitativa con esas alternativas no está disponible.

## Limitaciones y advertencias

- No alcanza el umbral de uso real según su propio autor: nota media de 4,58/10 y solo 1 de 12 preguntas aprobada. Es un modelo educativo, no un asistente para decisiones de negocio.
- Con 494 M de parámetros y solo 100 ejemplos de entrenamiento, se equivoca e inventa: aparecen palabras inexistentes y, ocasionalmente, caracteres en chino.
- La materia de Fundamentos no mejora con el ajuste (2,50 antes y después).
- La evaluación la realiza otro LLM como juez; no sustituye una evaluación humana ni pruebas adversas.
- El comportamiento fuera del dominio (IA generativa para ejecutivos) no fue evaluado.
- Los archivos del adaptador (`adapter_model.safetensors`, `adapter_config.json`) están pendientes de subir según la model card; el código de uso no funcionará hasta que estén en el repositorio.
- Los datos de entrenamiento fueron generados por un LLM comercial (OpenAI); deben revisarse los términos de uso del proveedor antes de cualquier uso no educativo. Los datos no se publican en el repositorio.
- Licencia Apache 2.0, que permite uso comercial, pero las limitaciones técnicas desaconsejan ese uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GersonSalas1986/slm-ia-generativa-ejecutivos
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
