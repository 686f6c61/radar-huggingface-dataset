# imYChaudhary22/zen-polish-v32-bf16

## Resumen

ZenPolish v3.2 4B (bf16) es un ajuste fino de Qwen3-4B-Instruct-2507 especializado en una única tarea: limpiar dictado procedente de reconocimiento automático de voz (ASR). El modelo recibe texto transcrito en bruto, con muletillas, falsos arranques y puntuación ausente, y devuelve el mismo contenido en forma escrita: corrige mayúsculas y puntuación, elimina ruido conversacional, restaura formas escritas de números, fechas, horas, importes, URL y correos electrónicos, y conserva el significado y las palabras del hablante. Lo publica el autor `imYChaudhary22` bajo el paraguas del proyecto ZenVoice.

Técnicamente es un transformer denso de 4.022.468.096 parámetros (8,04 GB de pesos en bf16, repartidos en dos shards), construido fusionando un adaptador LoRA de rango 32 sobre los pesos originales del modelo base mediante `mlx_lm fuse`. Este repositorio es el maestro en precisión completa desde el que se generaron las builds cuantizadas de 4 y 3 bits orientadas a ejecución en dispositivo, y el punto de partida recomendado para cualquier cuantización futura.

Su relevancia es acotada pero clara: demuestra que un modelo de 4B puede resolver la capa de "post-procesado de dictado" con una tasa de error de palabra del 5,1 % en un conjunto de evaluación de 500 dictados, a 15 tok/s en un Apple M5 con 8,2 GB de memoria, y que la versión de 4 bits mantiene la calidad (4,7 % WER) a 47 tok/s. No es un asistente general: es un componente de pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino con LoRA fusionada sobre Qwen3-4B-Instruct-2507 |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No indicada en la model card; el entrenamiento de la LoRA usó una longitud máxima de 1.024 tokens. El modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens en su documentación pública |
| Tipos de cuantización | bf16 (este repositorio), 4-bit DWQ (`zen-polish-v32-4bit`, 2,26 GB) y 3-bit (`zen-polish-v32-3bit`, 1,76 GB); todas en formato MLX |
| Idiomas soportados | No disponibles (el campo de idiomas no está declarado; la model card, el prompt de sistema y los ejemplos están en inglés) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Formato de pesos | safetensors en bf16 (MLX, dos shards, 8,04 GB), más `chat_template.jinja` y ficheros de tokenizer incluidos |

## Arquitectura y entrenamiento

La base es Qwen3-4B-Instruct-2507, un transformer denso de 4B parámetros. Sobre él se entrenó una LoRA de rango 32, alpha 64 y escala 2.0, con dropout 0.05, aplicada a las 36 capas y a todos los módulos lineales. El entrenamiento se ejecutó sobre `mlx-community/Qwen3-4B-Instruct-2507-4bit` (revisión `50d4277`), con schedule de decaimiento coseno de 1e-4 a 1e-6 durante 3.400 pasos, batch de 2, 3.500 iteraciones, longitud máxima de 1.024 tokens y gradient checkpointing. El checkpoint final (paso 3500) se seleccionó sobre un conjunto de validación retenido y se fusionó después en los pesos bf16 originales.

Los datos proceden del corpus ZenPolish v2.2, compuesto por 10 fuentes y 86.524 pares de entrenamiento (dictado bruto → texto limpio); las fuentes son exclusivamente MIT, Apache-2.0, CC-BY-4.0 y CC0, con lista de atribuciones en el repositorio ZenVoice. No se documenta ninguna fase de RLHF o DPO adicional. La innovación operativa del modelo no está en la arquitectura sino en el formato: v3.2 se entrenó con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, de modo que el `chat_template.jinja` incluido cierra el prompt de generación con ese bloque. Usar la plantilla estándar de Qwen3-4B-Instruct-2507 degrada la salida, porque no reproduce el formato visto en entrenamiento. Por el mismo motivo deben conservarse los ficheros de tokenizer incluidos, que son los empleados durante el ajuste.

## Capacidades

- Reescritura de dictado ASR: corrección de puntuación, mayúsculas y espaciado sobre transcripciones en bruto.
- Eliminación de muletillas, titubeos y falsos arranques ("so um", "like", "uh") sin alterar el contenido semántico.
- Normalización de formas escritas: números, fechas, horas, importes monetarios, URL y direcciones de correo.
- Adaptación de registro y capitalización según una línea de contexto `app:` incluida en el prompt de sistema (por ejemplo, para ajustar el tono al cliente de destino).
- Generación de texto conversacional estándar por herencia del modelo base, aunque no es el comportamiento para el que fue ajustado.
- Modo sin razonamiento explícito: el modelo emite un bloque de pensamiento vacío y responde directamente, lo que reduce latencia y evita tokens desperdiciados.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso

- Post-procesado en pipelines de dictado médico o legal: el modelo recibe la transcripción bruta de un motor ASR y devuelve texto punteado y normalizado listo para revisión, manteniendo la terminología del hablante. La ventana de 1.024 tokens usada en entrenamiento cubre dictados de varios minutos por segmento.
- Integración en aplicaciones de notas de voz: sobre la build de 4 bits (2,26 GB, 47 tok/s en M5) el modelo cabe en un portátil Apple Silicon y permite limpiar el dictado en el propio dispositivo sin enviar audio ni transcripciones a la nube.
- Corrección de correos y mensajes dictados: con una línea `app:` en el prompt de sistema se ajusta la capitalización y el tono al contexto (correo formal, chat interno, mensaje a cliente), lo que evita reescribir manualmente cada borrador.
- Normalización de datos en formularios y CRM: conversión de horas, importes y fechas dictados oralmente a sus formas escritas canónicas antes de insertarlos en un campo estructurado.
- Enriquecimiento de subtítulos y transcripciones: aplicar el modelo sobre segmentos de una transcripción larga para recuperar puntuación y párrafos antes de publicar el texto.
- Etapa de preprocesado en sistemas RAG: limpiar consultas dictadas por voz antes de pasarlas a un recuperador, de modo que la query llegue sin muletillas y con entidades bien formateadas.
- Evaluación comparativa de motores ASR: usar el modelo como normalizador fijo para que las diferencias de WER entre motores reflejen errores reales de reconocimiento y no diferencias de formato.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre `eval_v500` (500 dictados, con control de fuga de datos), decodificación greedy, máximo 200 tokens, Apple M5 y MLX 0.32.2:

| Métrica | v3.2 bf16 (este modelo) | v3.2 4-bit DWQ | v3.2 forma entrenada (base 4-bit + adaptador en vivo) | v2.2 Lite (1,7B) |
|---|---|---|---|---|
| WER | 5,1 % | 4,7 % | 5,0 % | 5,5 % |
| Exact match | 65,6 % | 67,2 % | 65,2 % | 65,8 % |
| Punct F1 | 0,849 | 0,859 | 0,861 | 0,863 |
| Peso de los pesos | 8,04 GB | 2,26 GB | 2,40 GB | 1,05 GB |
| Velocidad de decodificación | 15 tok/s | 47 tok/s | 36 tok/s | 73 tok/s |

El autor indica que las cuatro variantes están dentro del ruido estadístico en esta suite. La ventaja del 4B frente a Lite se observa en datos retenidos de v2.2: la build de 4 bits obtiene +3,6 puntos de exact match (IC del 95 %: +0,4 a +6,8). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y el modelo no está pensado para esas tareas.

## Requisitos de hardware

- Inferencia en bf16: 8,2 GB de memoria según el autor; 8,04 GB de pesos en dos shards.
- Inferencia con la build de 4 bits: 2,26 GB de pesos; la recomendada para uso en dispositivo.
- Inferencia con la build de 3 bits: 1,76 GB de pesos.
- GPU: la librería es MLX, por lo que el soporte nativo es Apple Silicon (series M). El benchmark se ejecutó en un Apple M5. No se documenta soporte para A100, H100 ni RTX 4090 en la información proporcionada.
- ¿Cabe en GPU de consumo? Las builds de 4 y 3 bits caben en equipos Apple con 8 GB de memoria unificada; la bf16 requiere unos 8,2 GB, por lo que encaja en Mac con 16 GB o más.
- Despliegue: `mlx_lm` (`load`, `generate`, `make_sampler`). El autor menciona `mlx_lm.convert` y `mlx_lm dwq` para cuantizar. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI; ejecutar los pesos MLX fuera del ecosistema MLX requeriría una conversión no descrita en la model card.
- Rendimiento: 15 tok/s en bf16 y 47 tok/s en 4 bits sobre Apple M5 con MLX 0.32.2 y decodificación greedy. No hay datos de throughput con batches ni de latencia con prompt largo.
- Requisito obligatorio de plantilla: cargar el `chat_template.jinja` y los ficheros de tokenizer incluidos en el repositorio; usar los del modelo base altera el formato de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (eval_v500) | Peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zen-polish-v32-bf16 (este) | 4,02B | No indicado en la card (1.024 tokens en entrenamiento) | 5,1 % | 8,04 GB | Apache-2.0 | Hugging Face, MLX |
| zen-polish-v32-4bit | 4,02B | Igual que el maestro | 4,7 % | 2,26 GB | Apache-2.0 | Hugging Face, MLX |
| zen-polish-v32-3bit | 4,02B | Igual que el maestro | No publicado | 1,76 GB | Apache-2.0 | Hugging Face, MLX |
| zen-polish-v22-lite (1,7B) | ~1,7B | No disponible | 5,5 % | 1,05 GB | Apache-2.0 | Hugging Face, MLX |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | 262.144 tokens (según documentación de Qwen) | No aplica: no es un modelo de limpieza de dictado | ~8 GB en bf16 | Apache-2.0 | Hugging Face |

Frente al modelo base, la comparación relevante no es de benchmarks generales sino de comportamiento: Qwen3-4B-Instruct-2507 no está ajustado para devolver únicamente el texto limpio sin comentarios, que es exactamente lo que aporta el ajuste de ZenVoice. No se dispone de datos de benchmarks de terceros para establecer comparaciones con otros modelos especializados en post-procesado de ASR.

## Limitaciones y advertencias

- Modelo de propósito muy estrecho: está entrenado para limpiar dictado y devolver solo el texto final. Usarlo como asistente general, para código o para razonamiento multi-paso producirá resultados pobres y no evaluados.
- Tasa de error residual: 5,1 % de WER y 65,6 % de exact match implican que aproximadamente un tercio de las salidas no coincide exactamente con la referencia. En dominios sensibles (importes, dosis, direcciones) requiere revisión humana.
- Riesgo de pérdida de contenido: al eliminar muletillas y falsos arranques, el modelo puede descartar información que el hablante sí quería conservar. No se ha publicado una evaluación específica de fidelidad semántica.
- Dependencia estricta de la plantilla: usar el `chat_template.jinja` del modelo base en lugar del incluido en el repositorio rompe el formato de entrenamiento (bloque de pensamiento vacío) y degrada la salida.
- Idiomas no declarados: la card no especifica cobertura lingüística y todos los ejemplos y el prompt de sistema están en inglés. El comportamiento con dictado en castellano no está documentado ni evaluado.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad ni comportamiento diferencial por variedad dialectal o acento. El corpus de 86.524 pares procede de 10 fuentes abiertas y su distribución demográfica es desconocida.
- Ecosistema restringido: los pesos son MLX. No hay builds GGUF, ni integración documentada con vLLM, TGI, llama.cpp u Ollama.
- Contexto práctico: aunque el modelo base soporte ventanas muy largas, el ajuste se hizo con longitud máxima de 1.024 tokens y la evaluación con 200 tokens de salida; no hay garantías de calidad más allá de ese régimen.
- Licencia: Apache-2.0 permite uso comercial, pero las atribuciones del corpus de entrenamiento deben conservarse según lo indicado en el repositorio ZenVoice. El enlace de licencia apunta al fichero LICENSE del modelo base.
- Madurez del proyecto: el repositorio registra 0 descargas y 0 likes en el momento de la ficha, con creador y actualización del 24 de octubre de 2026; no hay validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imYChaudhary22/zen-polish-v32-bf16
- Build de 4 bits: https://huggingface.co/imYChaudhary22/zen-polish-v32-4bit
- Build de 3 bits: https://huggingface.co/imYChaudhary22/zen-polish-v32-3bit
- Modelo de referencia del corpus de entrenamiento: https://huggingface.co/imYChaudhary22/zen-polish-v22-lite
- Build previa de 4 bits de la serie v2.2: https://huggingface.co/imYChaudhary22/zen-polish-v22-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Repositorio ZenVoice (lista de atribuciones de datos, referenciado en la card, sin URL directa en la información disponible)
- Registro de la variante v3 de 4 bits en free2aitools: https://free2aitools.com/model/imychaudhary22/zen-polish-v3-4bit
- Ficha de la variante v2.1 1.7B de 4 bits en LLM Explorer: https://llm-explorer.com/model/imYChaudhary22%2Fzen-polish-v2-1.7b-4bit,56AROxVWtO1FYoLTMr3YHg
