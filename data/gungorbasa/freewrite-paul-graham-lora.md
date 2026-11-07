# gungorbasa/freewrite-paul-graham-lora

## Resumen

Freewrite+ · Paul Graham style es un adaptador LoRA publicado por el usuario gungorbasa para el modelo base `mlx-community/Ministral-3-8B-Instruct-2512-4bit`, una versión cuantizada a 4 bits del Ministral 3 de 8B parámetros de Mistral AI. El adaptador no es un modelo autónomo: es un complemento de 126 MB que modifica el comportamiento del modelo base para que continúe texto en el estilo de los ensayos de Paul Graham. Está diseñado específicamente para la función de autocompletado "freewrite" de una aplicación de escritura, y se ejecuta en dispositivos Apple Silicon mediante el framework MLX.

El adaptador se entrenó con 212 ensayos publicados entre 2001 y 2023 usando `mlx-lm`, con enmascaramiento del prompt para que el modelo aprenda únicamente a predecir la continuación. Su ámbito de aplicación es muy acotado: no es un asistente conversacional ni un modelo de propósito general, sino un componente de inferencia de siguiente fragmento de texto (hasta 40 tokens) que solo funciona con un prompt de entrenamiento exacto y en inglés.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo de adaptación de estilo sobre un modelo pequeño cuantizado para ejecución local; por otro, sirve como caso práctico de las limitaciones de los LoRA de estilo, que exigen prompts literales, decodificación determinista y un contexto de entrada restringido a las últimas 250 palabras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Ministral 3 8B Instruct, checkpoint multimodal) |
| Parametros totales | no disponible (adaptador LoRA de 126 MB; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; la ventana práctica de entrada se limita a las últimas 250 palabras del texto |
| Tipos de cuantizacion | el adaptador se distribuye en float32; el modelo base en 4 bits (MLX) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapters.safetensors`, 126 MB) + `adapter_config.json`; modelo base en formato MLX |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con escala 20 y dropout 0.05, aplicado a las últimas 24 de las 34 capas del transformer base y a las 7 proyecciones de atención y MLP. Los pesos se guardan en float32 con nombres que empiezan por `language_model.`, lo que refleja el layout del checkpoint multimodal de Ministral 3. El entrenamiento se realizó con `mlx-lm` sobre 212 ensayos de Paul Graham (2001–2023), con enmascaramiento del prompt: la pérdida se calcula solo sobre la continuación, no sobre el texto de entrada. No se documenta el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el adaptador es puramente supervisado sobre texto de estilo.

La innovación técnica principal no está en la arquitectura, sino en el contrato de inferencia: el adaptador solo funciona con un prompt literal, codificado sin tokens especiales adicionales (el `<s>` literal actúa como BOS), y requiere decodificación greedy con parada en `</s>` y un máximo de 40 tokens. El texto de entrada se recorta a las últimas 250 palabras, con el prefijo `…` cuando se ha truncado. Esta rigidez es deliberada: el adaptador está pensado para integrarse en un editor de escritura que llama al modelo en cada pausa, no para uso interactivo general.

## Capacidades

- Continuación de texto en estilo ensayístico: genera los siguientes pocos tokens (hasta 40) a partir de las últimas 250 palabras del texto del usuario.
- Imitación de estilo: reproduce rasgos de los ensayos de Paul Graham (frases cortas, tono conversacional, estructura argumental directa).
- Ejecución local en Apple Silicon mediante MLX: el adaptador y el modelo base cuantizado a 4 bits caben en memoria unificada de equipos de consumo.
- Integración con `mlx-lm`: se carga con `--adapter-path` y se ejecuta con `mlx_lm.generate`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales, de visión ni de audio, pese a que el checkpoint base use layout multimodal.
- No es multilingüe: solo inglés.
- No dispone de modo "thinking" ni de razonamiento explícito.

## Casos de uso

- Autocompletado en editor de escritura: el adaptador se invoca tras cada pausa del usuario para sugerir las siguientes palabras en estilo Paul Graham; su latencia baja y su salida corta (máximo 40 tokens) encajan con una experiencia de escritura fluida en local.
- Generación de borradores de ensayos: un escritor puede escribir la primera frase de un párrafo y dejar que el adaptador proponga continuaciones sucesivas, revisando y aceptando cada fragmento.
- Prototipado de asistentes de estilo: sirve como base para experimentar con adaptadores de estilo sobre Ministral 3 8B, comparando rango, capas y datasets.
- Aplicaciones de escritura offline: al ejecutarse con MLX en un Mac, permite un asistente de redacción sin conexión ni envío de texto a servidores externos.
- Investigación sobre LoRA de estilo: caso de estudio reproducible para medir cómo un adaptador de rango 16 sobre 24 capas captura un estilo concreto con solo 212 documentos.
- Demos educativas de inferencia local: ejemplo mínimo de integración de `mlx-lm` con adaptadores en un pipeline de generación con prompt fijo y decodificación greedy.
- Filtrado o reescritura de estilo en pipelines editoriales: aunque limitado, puede usarse para sugerir continuaciones que un editor humano valida antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 126 MB en float32; el modelo base cuantizado a 4 bits requiere aproximadamente 4–5 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4) con al menos 8 GB de memoria unificada; el adaptador está diseñado para MLX, no para CUDA.
- Cabe en GPU de consumo: sí, en equipos Apple con memoria unificada suficiente para el modelo base de 4 bits.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate` con `--adapter-path`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la generación se limita a 40 tokens con decodificación greedy, lo que mantiene la latencia baja en hardware Apple Silicon, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gungorbasa/freewrite-paul-graham-lora | LoRA sobre Ministral 3 8B (MLX, 4 bits) | 8B (base) | 250 palabras de entrada | no disponible | Hugging Face, MLX |
| muradmy/Meta-Llama-3.1-8B-Instruct-Paul-Graham-LORA | LoRA sobre Llama 3.1 8B Instruct | 8B (base) | no disponible | apache-2.0 | Hugging Face, Unsloth/TRL |
| bhagatsuryainatom/Meta-Llama-3.1-8B-Instruct-Paul-Graham-LORA | LoRA sobre Llama 3.1 8B Instruct | 8B (base) | no disponible | no disponible | Hugging Face |
| Write like Paul Graham (yeschat.ai) | Asistente alojado (GPT) | no disponible | no disponible | no disponible | Servicio web |

## Limitaciones y advertencias

- Solo funciona con el prompt de entrenamiento exacto; cualquier variación en el formato, los tokens especiales o el orden del texto degrada o anula el comportamiento.
- La entrada se limita a las últimas 250 palabras; no hay gestión de contexto largo ni memoria de conversación.
- La salida máxima es de 40 tokens con decodificación greedy; no se recomienda muestreo aleatorio.
- Solo inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Riesgo de alucinación y de deriva estilística: al imitar un estilo concreto, puede generar afirmaciones plausibles pero falsas atribuidas al autor o a sus ensayos.
- Sesgos: el corpus son ensayos de un único autor (2001–2023), lo que introduce sesgos temáticos, de género discursivo y de perspectiva.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador; además, hereda las restricciones del modelo base Ministral 3 y de su versión cuantizada.
- Dependencia del layout multimodal del checkpoint base (`language_model.`), lo que puede romper la carga si se usa con otras revisiones del modelo.
- No apto para producción como asistente general: no soporta tool calling, agentes ni razonamiento multi-paso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gungorbasa/freewrite-paul-graham-lora
- Modelo base: https://huggingface.co/mlx-community/Ministral-3-8B-Instruct-2512-4bit
- LoRA alternativo sobre Llama 3.1 (muradmy): https://huggingface.co/muradmy/Meta-Llama-3.1-8B-Instruct-Paul-Graham-LORA
- LoRA alternativo sobre Llama 3.1 (bhagatsuryainatom): https://huggingface.co/bhagatsuryainatom/Meta-Llama-3.1-8B-Instruct-Paul-Graham-LORA
- Asistente web "Write like Paul Graham": https://www.yeschat.ai/gpts-ZxX7fHJE-Write-like-Paul-Graham
