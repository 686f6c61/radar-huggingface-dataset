# kathawut/Helix

## Resumen

HELIX V2 SFT-v3 es un modelo de lenguaje de 100,9 millones de parámetros desarrollado por Kathawut, diseñado específicamente para ejecutarse en CPU y orientado principalmente al tailandés, con soporte secundario para inglés, JSON, instrucciones y conversaciones orientadas a herramientas. A diferencia de los modelos Transformer convencionales, emplea una arquitectura recurrente propia con bloques HELIX, gated linear scan, hyper-connections y una cabeza softmax adaptativa, lo que le permite operar con recursos de hardware muy limitados.

El modelo se estructura en tres componentes: Cortex (el modelo de lenguaje neural principal), Controller (un router aprendido mediante SFT que selecciona entre modos general, conocimiento o híbrido) y Hippocampus/KnowledgeStore (un sistema de almacenamiento externo de documentos y hechos con capacidad de recuperación). Esta separación evita que el conocimiento permanente se incruste directamente en los pesos, facilitando la actualización de información sin reentrenar.

El checkpoint publicado corresponde a una fase de SFT-v3 (full epoch) sobre un base de 400M tokens, con un total de aproximadamente 410,4M tokens de pretraining. El repositorio incluye el código necesario para cargar y ejecutar el modelo, ya que no es un checkpoint estándar de Transformers. Su relevancia radica en ofrecer una alternativa eficiente para despliegues en CPU con enfoque en tailandés, un idioma con escasa representación en modelos de código abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrente custom (bloques HELIX, gated linear scan, hyper-connections, adaptive softmax) |
| Parametros totales | 100,909,974 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tailandes (principal), ingles, JSON |
| Licencia | no disponible |
| Formato de pesos | Custom PyTorch (helix_model.pt) |

## Arquitectura y entrenamiento

La arquitectura de HELIX se divide en tres subsistemas: Cortex, el modelo de lenguaje recurrente que genera texto y razona; Controller, un router entrenado con SFT que decide entre rutas `general`, `knowledge` o `hybrid`; y Hippocampus/KnowledgeStore, un almacén externo de documentos con provenance y recuperación de evidencia. El Cortex emplea bloques recurrentes HELIX con gated linear scan, hyper-connections y una cabeza softmax adaptativa, lo que permite un procesamiento secuencial eficiente en CPU.

El entrenamiento se realizó en dos fases. Primero, un pretraining sobre un base de 400M tokens (según el run manifest, el checkpoint registra 410,419,200 tokens), con un paquete upstream que incluía buckets de tailandés (1,2B), inglés (600M), paralelo (51,7M) y estructurado (63M). Posteriormente, una fase de SFT-v3 con 436,246 filas y 60,059,774 tokens, compuesta por cuatro componentes: `v2_clean` (220,126 filas), `v3_agentic` (34,778), `v3_agentic_context` (8,000) y `v3_thai_correct` (173,342). Los datos de SFT provienen de fuentes como Tulu v2, UltraChat, Typhoon S, SQuAD, Glaive Function Calling y varios datasets tailandeses, con filtros de calidad y separación train/eval por familias de conversación.

El tokenizer es TCC-BPE, que preserva clústeres de caracteres tailandeses, y debe usarse el archivo `tokenizer_th.json` exacto del entrenamiento para que los token IDs coincidan con los embeddings.

## Capacidades

- Generación de texto en tailandés e inglés, con capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Soporte de tool calling y conversaciones orientadas a herramientas, con ejemplos deterministas en el dataset SFT (`v3_agentic`).
- Generación de JSON estructurado, útil para integraciones con APIs y sistemas externos.
- Razonamiento y planificación básica a través del componente Cortex, con routing dinámico entre modos general, conocimiento e híbrido.
- Recuperación de información externa mediante Hippocampus/KnowledgeStore, que permite consultar documentos y hechos sin incrustarlos en los pesos.
- Capacidad de ejecución en CPU, lo que facilita despliegues en entornos sin GPU.

## Casos de uso

- Atención al cliente automatizada en tailandés: el modelo puede gestionar conversaciones multi-turno con un contexto de 512 tokens, suficiente para interacciones breves de soporte, y su capacidad de tool calling permite conectarlo a sistemas de ticketing o bases de conocimiento.
- Asistente de escritura creativa en tailandés: gracias a su entrenamiento con datos de instrucciones y QA, puede ayudar a redactar borradores, corregir estilo o generar ideas para novelas, como sugiere el proyecto Kathawut orientado a escritores.
- Generación de JSON para integraciones: su soporte nativo de JSON y tool calling lo hace adecuado para extraer datos estructurados de texto libre o generar payloads para APIs en entornos con recursos limitados.
- Chatbot educativo para aprendizaje de tailandés: al estar optimizado para este idioma, puede servir como tutor conversacional o generador de ejercicios, con la ventaja de ejecutarse en hardware modesto.
- Prototipado rápido de agentes conversacionales: su arquitectura ligera y su capacidad de routing permiten experimentar con sistemas agénticos sin necesidad de GPUs, ideal para investigación o desarrollo inicial.
- Procesamiento de documentos con recuperación externa: el componente Hippocampus permite conectar el modelo a un almacén de documentos y responder preguntas basadas en evidencia, útil para asistentes de consulta interna en tailandés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Diseñado para ejecutarse en CPU; no requiere GPU para inferencia.
- El repositorio pesa 0,4 GB, lo que sugiere un uso de RAM moderado (estimado inferior a 1 GB para el modelo y tokenizer).
- Se proporcionan scripts de ejemplo (`scripts/chat.py`) y una API de carga (`load_pretrained`) que funcionan con `device="cpu"`.
- No se menciona compatibilidad con frameworks de despliegue estándar como vLLM, llama.cpp u Ollama, ya que el modelo usa una arquitectura custom y requiere el código incluido en el repositorio.
- La latencia y el throughput no están documentados, pero al ser un modelo de 100M parámetros en CPU, se espera una velocidad de generación modesta, adecuada para tareas interactivas ligeras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado su enfoque en tailandés y su arquitectura custom, no es posible establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Longitud de contexto limitada a 512 tokens, lo que restringe la capacidad de manejar documentos largos o conversaciones extensas.
- No es un checkpoint estándar de Transformers; requiere el código específico del repositorio (`helix/`) y el tokenizer exacto para funcionar correctamente.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación.
- El modelo está entrenado principalmente en tailandés e inglés; su rendimiento en otros idiomas no está garantizado.
- El conocimiento factual depende del sistema de recuperación externa (Hippocampus), por lo que sin una base de datos conectada, el modelo puede alucinar o carecer de información actualizada.
- Los datos de entrenamiento incluyen fuentes con licencias variadas (CC BY-SA, CC BY, Apache-2.0, MIT, CC0), pero no se detalla la atribución completa de todos los componentes.
- No se han publicado evaluaciones de sesgos o robustez; se recomienda validar el comportamiento en producción antes de un despliegue crítico.

## Enlaces

- HuggingFace: https://huggingface.co/kathawut/Helix
- Sitio web del autor (Kathawut): https://www.kathawut.com/
- Repositorio GitHub (Kathawut-AI): https://github.com/Devktw/Kathawut-AI
