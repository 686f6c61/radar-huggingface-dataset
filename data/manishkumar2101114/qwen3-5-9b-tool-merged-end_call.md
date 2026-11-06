# manishkumar2101114/qwen3.5-9b-tool-merged-end_call

## Resumen

Qwen3.5-9B tool-calling (merged, end_call) es un ajuste fino del modelo base Qwen/Qwen3.5-9B, publicado por el usuario manishkumar2101114 en Hugging Face. Se trata de un merge completo en BF16 de un adaptador LoRA entrenado sobre 1.873 conversaciones de agente de voz del conjunto Techladder, orientadas a tool calling y con mezcla de inglés e hinglish, y con el modo de razonamiento (thinking) desactivado. El modelo base Qwen3.5-9B pertenece a la familia Qwen3.5 de Alibaba, aunque la información disponible no detalla su arquitectura interna más allá de la etiqueta `qwen3_5`.

El modelo resuelve un problema muy concreto: dotar a un agente de voz conversacional de la capacidad de emitir llamadas a herramientas (tool calls) en entornos bilingües inglés-hindi, incluyendo una etiqueta específica de fin de llamada (`end_call`). No es un modelo de propósito general pulido, sino un artefacto de despliegue para un caso de uso vertical. Su relevancia radica en que ejemplifica el patrón de especialización mediante LoRA sobre modelos abiertos de ~9B parámetros, con licencia Apache 2.0 y pesos en safetensors listos para servir.

El repositorio pesa 19,3 GB y contiene 9.653.104.368 parámetros según los metadatos de safetensors, lo que confirma que el merge se realizó en precisión completa BF16 sin cuantización. La model card es extremadamente escueta y no aporta datos sobre longitud de contexto, composición del dataset de entrenamiento más allá del número de conversaciones, ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`; detalles internos no disponibles) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repo (pesos publicados en BF16; cuantizaciones posteriores no publicadas) |
| Idiomas soportados | en, hi (inglés e hindi, con hinglish en los datos de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (merge completo BF16) |

## Arquitectura y entrenamiento

El modelo es un merge completo en BF16 de un adaptador LoRA sobre Qwen/Qwen3.5-9B. El adaptador se entrenó con rango r=32 y alpha=64 durante 3 épocas, completando 666 pasos, con una pérdida de entrenamiento de 0,2597 y una pérdida de evaluación de 0,1924. El conjunto de entrenamiento consta de 1.873 conversaciones de agente de voz de Techladder, que incluyen tool calls y diálogo en hinglish. El modo de razonamiento (thinking) se desactivó durante el entrenamiento, de modo que el modelo resultante está orientado a respuestas directas con llamadas a herramientas.

Un detalle operativo crítico es que la model card exige usar la plantilla de chat `qwen3_template333.jinja` en inferencia; no usarla puede degradar el comportamiento de tool calling aprendido. El adaptador LoRA original no se ha publicado, solo el modelo fusionado, lo que impide reproducir el entrenamiento o reaplicar el adaptador sobre otras variantes del base. No se documentan innovaciones arquitectónicas propias: todas las capacidades estructurales (atención, tokenizador, ventana de contexto) provienen del Qwen3.5-9B original, cuyos detalles no se recogen en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno en inglés e hindi, con manejo de code-switching hinglish.
- Tool calling / function calling: capacidad central del ajuste, entrenada explícitamente sobre llamadas a herramientas en conversaciones de voz.
- Etiqueta de fin de llamada (`end_call`): el modelo aprende a señalar la terminación de una conversación de agente.
- Procesamiento image-text-to-text: el pipeline declarado es `image-text-to-text`, lo que sugiere que el base Qwen3.5-9B admite entrada multimodal de imagen y texto; no hay evidencia de que el ajuste LoRA haya entrenado esta capacidad.
- Razonamiento en modo no-thinking: el entrenamiento se realizó con thinking desactivado, por lo que se espera respuesta directa sin cadena de pensamiento explícita.
- Capacidades multilingües limitadas a los idiomas declarados (en, hi); no se documentan otros idiomas.
- No se documentan capacidades de agentes multi-paso más allá del tool calling, ni visión, audio o matemáticas avanzadas como competencias específicas del ajuste.

## Casos de uso

- Agentes de voz para atención al cliente en India: el modelo está entrenado sobre conversaciones reales de agente de voz en inglés e hinglish, por lo que encaja en flujos de soporte telefónico donde el usuario alterna idiomas y el sistema necesita invocar herramientas (consultar pedidos, agendar citas) y cerrar la llamada con `end_call`.
- Enrutamiento de llamadas con function calling: integrado en un orquestador de telefonía, el modelo puede decidir qué herramienta invocar en cada turno (transferencia, consulta de estado, escalado a humano) a partir del diálogo previo.
- Automatización de encuestas y confirmaciones telefónicas: para llamadas salientes breves donde el modelo mantiene el contexto de la conversación y emite la señal de finalización al completar el guion.
- Asistentes de reservas bilingües: reserva de citas o mesas con confirmación mediante tool calls a un backend de calendario, usando hinglish para usuarios que mezclan hindi e inglés.
- Prototipado de agentes conversacionales con Qwen: al ser un merge Apache 2.0 sobre un base abierto, sirve como punto de partida para equipos que quieran evaluar el comportamiento de tool calling de Qwen3.5-9B sin entrenar su propio adaptador.
- Investigación sobre especialización con LoRA: el modelo documenta hiperparámetros concretos (r=32, alpha=64, 3 épocas, 666 pasos, pérdidas de 0,2597 y 0,1924) y sirve como referencia reproducible de un pipeline de ajuste para agentes de voz, aunque el adaptador no esté publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de entrenamiento (0,2597) y evaluación (0,1924), que no son comparables con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un mínimo de 24 GB para contexto corto.
- Cuantización a 8 bits: alrededor de 10-11 GB de pesos, viable en GPUs de 16 GB.
- Cuantización a 4 bits: alrededor de 5-6 GB de pesos, viable en GPUs consumer de 8-12 GB, aunque no se han publicado versiones GGUF o AWQ oficiales de este merge.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en BF16 con concurrencia; RTX 4090 (24 GB) para BF16 en un solo usuario; RTX 3090/4080 (16-24 GB) con cuantización.
- Despliegue: compatible con vLLM, TGI, llama.cpp y Ollama siempre que se exporte a los formatos correspondientes; es imprescindible cargar la plantilla `qwen3_template333.jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-tool-merged-end_call | 9,65 B | no disponible | Apache 2.0 | Tool calling para agente de voz en/hi | Hugging Face, 40 descargas |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Apache 2.0 (según el ajuste) | Modelo generalista multimodal | Hugging Face |
| Alternativas de ~9B para tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del base Qwen3.5-9B en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Model card mínima: no se documentan sesgos, datos de evaluación, ni limitaciones conocidas por el autor.
- Riesgo de alucinación en tool calls: al ser un ajuste sobre 1.873 conversaciones de un dominio concreto (Techladder), puede generalizar mal a esquemas de herramientas distintos de los vistos en entrenamiento.
- Dependencia estricta de la plantilla de chat `qwen3_template333.jinja`; su ausencia o sustitución puede romper el formato de las llamadas a herramientas.
- Idiomas limitados a inglés e hindi/hinglish; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente para tool calling.
- El adaptador LoRA no se publica, solo el merge, lo que limita la reproducibilidad y la auditoría del entrenamiento.
- El pipeline declarado es `image-text-to-text`, pero no hay evidencia de que el ajuste haya entrenado la capacidad multimodal; conviene validarla antes de usarla en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 likes y 40 descargas, lo que indica escasa validación comunitaria.
- No se especifica la longitud de contexto efectiva tras el ajuste; conversaciones de voz largas podrían exceder la ventana del base.
- El modo thinking está desactivado por entrenamiento; no debe esperarse razonamiento explícito en cadena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manishkumar2101114/qwen3.5-9b-tool-merged-end_call
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
