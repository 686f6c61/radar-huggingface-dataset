# Cyronius/titler

## Resumen

El modelo **titler** es un generador de títulos a partir del primer mensaje de una conversación de chat, desarrollado por Cyronius (Cyrus Attoun). Se trata de un modelo T5 de 7,61 millones de parámetros, entrenado desde cero mediante destilación, con el objetivo de ser extremadamente ligero y eficiente para ejecutarse en el navegador, Node.js o Python sin necesidad de GPU ni llamadas a API. Su tamaño es de aproximadamente 10,3 MB en formato int8 ONNX, y genera títulos de 3 a 8 palabras en unos 100-160 ms en una CPU de portátil convencional.

El modelo está diseñado para resolver el problema de etiquetar automáticamente conversaciones de chat, sentencias SQL, documentos pegados, errores y logs, entre otros. Su relevancia radica en que ofrece una alternativa de tamaño reducido frente a modelos pequeños de propósito general (de cientos de MB) para una tarea muy específica, lo que permite su despliegue en entornos con recursos limitados, como dispositivos edge o aplicaciones cliente. Está licenciado bajo Apache 2.0 y soporta únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder) |
| Parametros totales | 7.606.784 (7,61 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens (según el código de ejemplo) |
| Tipos de cuantizacion | int8 ONNX, GGUF (f16, q8_0, q6_k, q4_0) |
| Idiomas soportados | Inglés (best-effort para otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura T5 (Text-to-Text Transfer Transformer), un modelo encoder-decoder de la familia Transformer. Ha sido entrenado desde cero mediante destilación, utilizando como profesor un modelo más grande (no especificado en la información disponible). Los datos de entrenamiento provienen de los datasets allenai/WildChat-1M, OpenAssistant/oasst2, lmsys/chatbot_arena_conversations y lmsys/lmsys-chat-1m, que contienen conversaciones de chat reales. El proceso de destilación permite transferir el conocimiento del modelo profesor a este modelo compacto, manteniendo un rendimiento adecuado para la tarea de generación de títulos.

No se mencionan innovaciones técnicas específicas más allá de la destilación y la optimización para inferencia en edge. El modelo está disponible en formatos ONNX (int8) y GGUF, lo que facilita su ejecución en diferentes entornos.

## Capacidades

- Generación de títulos de 3 a 8 palabras a partir del primer mensaje de una conversación de chat.
- Etiquetado de sentencias SQL, asignando títulos descriptivos a consultas de bases de datos.
- Etiquetado de documentos pegados, como notas markdown, README, PRDs, changelogs y párrafos de prosa.
- Etiquetado de errores y logs, generando títulos temáticos para trazas de pila y registros.
- Detección pasiva de prompt-injection: al ser un modelo encoder-decoder pequeño, no sigue instrucciones maliciosas, sino que las titula (por ejemplo, "Ignore Previous Instructions and System Prompt").
- Soporte de generación con beam search (num_beams=2) y sin repetición de n-gramas.
- Ejecución en navegador, Node.js y Python mediante transformers.js y ONNX Runtime.

## Casos de uso

- **Titulación automática de conversaciones en aplicaciones de chat**: el modelo puede etiquetar cada conversación con un título corto y descriptivo, mejorando la navegación en el historial. Su bajo coste computacional permite ejecutarlo en el cliente sin enviar datos a un servidor.
- **Etiquetado de consultas SQL en herramientas de bases de datos**: al pegar o ejecutar una consulta, el modelo genera un título como "SQL Query for Revenue Customer Orders", facilitando la organización de consultas guardadas.
- **Organización de documentos en gestores de notas**: al pegar un documento (README, PRD, changelog), el modelo genera un título temático, útil para sistemas de archivo automático.
- **Clasificación de errores y logs en sistemas de monitorización**: el modelo convierte trazas de pila y mensajes de log en títulos concisos, ayudando a identificar problemas rápidamente.
- **Etiquetado de mensajes en foros o sistemas de soporte**: el primer mensaje de un hilo puede titularse automáticamente para mejorar la indexación y búsqueda.
- **Prevención de prompt-injection en sistemas de chat**: al titular mensajes que contienen intentos de inyección, el modelo no los ejecuta, sino que los describe, actuando como una capa de seguridad pasiva.

## Benchmarks y rendimiento

El modelo incluye una evaluación en un conjunto de prueba de 100 prompts, comparando diferentes cuantizaciones GGUF contra el baseline fp16. Los resultados de ROUGE-L frente al modelo profesor son:

| Cuantización | Tamaño | ROUGE-L vs teacher | Salidas diferentes de f16 |
|---|---|---|---|
| f16 (baseline) | 15,4 MB | 0,484 | — |
| q8_0 (recomendado) | 8,3 MB | 0,485 | 6/100 (solo paráfrasis) |
| q6_k | 6,4 MB | 0,490 | 11/100 (solo paráfrasis) |
| q4_0 | 5,0 MB | 0,465 | 29/100 (paráfrasis, artefactos y algunos cambios de tema) |

Además, el tiempo de inferencia es de aproximadamente 100-160 ms por título en una CPU de portátil convencional, con el modelo int8 ONNX. No se proporcionan benchmarks estándar como MMLU o HumanEval, ya que el modelo no está diseñado para tareas generales.

## Requisitos de hardware

- **VRAM**: no requiere GPU; puede ejecutarse en CPU. El modelo int8 ONNX ocupa 10,3 MB, por lo que cabe en cualquier dispositivo con memoria suficiente.
- **GPU recomendadas**: no aplica, aunque puede ejecutarse en GPU si se desea, pero no es necesario.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU moderna puede ejecutarlo, pero no es necesario.
- **Opciones de despliegue**: transformers.js (navegador, Node.js), ONNX Runtime (Python), llama.cpp (GGUF), Lemonade (según la búsqueda web).
- **Latencia**: ~100-160 ms por título en CPU de portátil; con beam search (num_beams=2) se añaden ~150 ms adicionales.
- **Throughput**: no se especifica, pero dado el tamaño, puede procesar múltiples títulos por segundo en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. Sin embargo, se puede mencionar que, frente a modelos pequeños de propósito general como DistilBERT o TinyBERT, este modelo está especializado en generación de títulos y es mucho más ligero. No obstante, al no tener datos de comparación, se indica "no disponible".

## Limitaciones y advertencias

- **Idioma**: solo soporta inglés de forma fiable; otros idiomas se procesan con calidad limitada (best-effort).
- **Longitud de salida**: limitado a títulos de 3-8 palabras; no es adecuado para resúmenes abstractivos más largos.
- **Riesgo de alucinación**: al ser un modelo pequeño, puede generar títulos plausibles pero incorrectos en algunos casos, especialmente con entradas ambiguas.
- **Sensibilidad a la decodificación**: con greedy decoding, puede producir palabras corruptas en la cuantización int8; se recomienda usar beam search (num_beams=2).
- **Cuantización q4_0**: puede degradar la calidad, con cambios de tema en aproximadamente 1 de cada 3 casos; solo recomendada si el tamaño es crítico.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe mantener la atribución.
- **Sin soporte para WebGPU**: en transformers.js, la cuantización q8 para seq2seq no es compatible con WebGPU; usar backend WASM.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Cyronius/titler)
- [Perfil del autor en Hugging Face](https://huggingface.co/Cyronius)
- [Datasets del autor](https://huggingface.co/Cyronius/datasets)
