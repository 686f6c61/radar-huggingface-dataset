# mradermacher/PaperPilot-Qwen-0.5B-Instruct-GGUF

## Resumen

PaperPilot-Qwen-0.5B-Instruct-GGUF es un repositorio de cuantizaciones GGUF estáticas del modelo kpakkiragari/PaperPilot-Qwen-0.5B-Instruct, realizado por el cuantizador conocido mradermacher. El modelo base es un ajuste fino instructivo de Qwen2.5-0.5B-Instruct, orientado a tareas de IA documental sobre PDFs, con etiquetas que sugieren uso como agente con tool calling y despliegue en dispositivos locales (on-device).

Su relevancia radica en el tamaño: con unos 494 millones de parámetros y versiones cuantizadas de entre 0,4 y 1,1 GB, es un modelo apto para ejecutarse en CPU o en hardware muy modesto, útil para pipelines de procesamiento de documentos donde no se dispone de GPU. La licencia Apache 2.0 permite uso comercial sin restricciones. No se ha publicado una model card detallada del modelo base, por lo que varios datos técnicos concretos (contexto, datos de entrenamiento, benchmarks) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5), no disponible detalle |
| Parametros totales | 494.032.768 (~0,5 B) |
| Parametros activos | no disponible (no hay indicios de MoE; presumiblemente densos) |
| Longitud de contexto | no disponible (Qwen2.5-0.5B base suele ofrecer 32.768 tokens, pero no confirmado para este fine-tune) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base está en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base parte de Qwen2.5-0.5B-Instruct, un transformer decoder denso de la familia Qwen2.5 de Alibaba con aproximadamente 494 millones de parámetros. Sobre esa base, kpakkiragari ha realizado un fine-tune orientado a tareas de IA documental (PDF, document-ai) y comportamiento como agente con tool calling, según los tags del repositorio. No hay información publicada sobre el dataset de fine-tuning, el número de tokens de entrenamiento ni el uso de técnicas como DPO o RLHF.

El repositorio de mradermacher contiene exclusivamente cuantizaciones estáticas en formato GGUF generadas desde los pesos en safetensors del modelo base. No se ofrecen cuantizaciones imatrix/weighted en el momento de la ficha; el autor indica que pueden solicitarse mediante una Community Discussion. Entre las cuants disponibles, Q4_K_M y Q4_K_S se recomiendan por equilibrio entre velocidad y calidad, y Q8_0 como la de mayor calidad.

## Capacidades

- Generación de texto conversacional (pipeline conversational), heredada de Qwen2.5-0.5B-Instruct.
- Procesamiento de documentos PDF / document-ai, según los tags del repositorio (sin detalles publicados sobre las tareas concretas).
- Tool calling / function calling, indicado por los tags "agent" y "tool-calling"; no hay documentación del esquema de herramientas soportado.
- Diseñado para despliegue on-device gracias a su tamaño reducido y al formato GGUF.
- Capacidades multilingües: el modelo está etiquetado solo para inglés ("en").
- No hay evidencia de capacidades de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistente de lectura de papers en local: dado su enfoque documental, puede integrarse en flujos que extraen texto de PDFs y generan resúmenes o respuestas sobre su contenido, todo en un portátil sin GPU.
- Agente ligero con tool calling: su tamaño permite ejecutarlo como componente de un agente local (por ejemplo con llama.cpp) que invoque herramientas simples de búsqueda o extracción de metadatos con latencia baja.
- Procesamiento por lotes de documentos en CPU: para indexar grandes volúmenes de PDFs en servidores modestos, donde un modelo de 0,5 B cuantizado ofrece throughput razonable sin coste de GPU.
- Prototipado de pipelines document-ai: útil como base rápida para probar arquitecturas RAG o de extracción de datos antes de escalar a modelos mayores.
- Aplicaciones embebidas o de escritorio offline: con cuants de 0,4-0,6 GB cabe en dispositivos con recursos muy limitados, incluidos equipos sin GPU dedicada.
- Clasificación y etiquetado de documentos: tareas estructuradas de NLP sobre texto extraído de PDFs donde se prioriza coste y velocidad sobre máxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay datos de evaluación en la model card del modelo base ni del repositorio de cuantización.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,4 GB (Q2_K, Q3_K_S) y 1,1 GB (f16) solo de pesos; con contexto y overhead, basta con 1-2 GB de RAM en CPU o VRAM equivalente.
- GPU recomendadas: no requiere GPU; cualquier GPU moderna lo ejecuta con holgura. En CPU es plenamente viable en equipos de gama baja.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer (incluso tarjetas con 2-4 GB de VRAM); también funciona en iGPU y Apple Silicon.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) son la vía natural para GGUF; también puede ejecutarse con transformers desde el modelo base en safetensors. No hay datos sobre compatibilidad con vLLM o TGI para este fine-tune concreto.
- Latencia y throughput: no disponibles; por tamaño (0,5 B), se espera generación rápida incluso en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PaperPilot-Qwen-0.5B-Instruct-GGUF | ~0,5 B | no disponible | Apache 2.0 | Fine-tune documental/agentes, GGUF listo para local |
| Qwen2.5-0.5B-Instruct (base) | 0,49 B | 32.768 tokens (según ficha oficial) | Apache 2.0 | Modelo generalista del que deriva; sin fine-tune documental |
| SmolLM2-360M-Instruct (HuggingFaceTB) | 0,36 B | 8.192 tokens | Apache 2.0 | Alternativa aún más pequeña para on-device, enfoque generalista |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Más capacidad a cambio de ~3x recursos |

Nota: la comparación de rendimiento no es posible al no existir benchmarks publicados del modelo analizado.

## Limitaciones y advertencias

- Modelo muy pequeño (0,5 B): su capacidad de razonamiento, matemáticas y generación compleja es limitada; se esperan errores frecuentes en tareas exigentes.
- Riesgo de alucinación elevado, típico de modelos de menos de 1 B de parámetros, especialmente al resumir o responder sobre documentos.
- Etiquetado solo para inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- No hay model card detallada del fine-tune: se desconocen datos de entrenamiento, plantilla de chat exacta y alcance real de las capacidades de tool calling, lo que complica su integración.
- La longitud de contexto no está confirmada para este fine-tune; verificar antes de procesar documentos largos.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero conviene revisar los términos de Qwen2.5 en cuanto a atribución.
- Las cuants de calidad baja (Q2_K, Q3_K_S/M) pueden degradar notablemente la calidad de salida en un modelo ya pequeño; se recomiendan Q4_K_M o superiores.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/PaperPilot-Qwen-0.5B-Instruct-GGUF
- Modelo base: https://huggingface.co/kpakkiragari/PaperPilot-Qwen-0.5B-Instruct
- Página de descargas del cuantizador: https://hf.tst.eu/model#PaperPilot-Qwen-0.5B-Instruct-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
