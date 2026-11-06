# BharathPESU/sericulture-offline-assistant-bundle

## Resumen

Sericulture offline assistant bundle es un paquete de recursos creado por el usuario BharathPESU y publicado en Hugging Face, que reúne todos los componentes necesarios para construir un asistente conversacional de sericultura (crianza de gusanos de seda) que funciona sin conexión en dispositivos móviles Android. El bundle combina un modelo de embeddings multilingüe cuantizado para búsqueda semántica local, un modelo de lenguaje pequeño cuantizado en formato GGUF para inferencia en el dispositivo, una base de datos SQLite con los pasajes indexados y código Kotlin de ejemplo para la integración.

El problema que resuelve es el acceso a información agrícola especializada en zonas con conectividad limitada: el sistema implementa una arquitectura RAG (Retrieval-Augmented Generation) completamente offline, donde el dispositivo recupera pasajes relevantes de una base de conocimiento local y el LLM genera respuestas a partir de ellos. El contenido indexado procede del Central Sericultural Research & Training Institute, del portal TNAU Agritech y de literatura verificada de ResearchGate, con soporte específico para kannada además del inglés.

Es relevante como ejemplo práctico de despliegue de LLMs en edge computing agrícola: el modelo de lenguaje subyacente es Qwen3-0.6B (751,6 millones de parámetros según los metadatos de safetensors) cuantizado a Q4_K_M, lo que permite ejecutar todo el pipeline en hardware móvil. Cabe destacar que el autor advierte explícitamente que los 13 registros indexados son datos en borrador sin revisión de expertos en sericultura ni de traductores nativos de kannada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle RAG offline: LLM Qwen3 0.6B (transformer decoder) + embeddings multilingual-e5-small (ONNX) |
| Parametros totales | 751.632.384 (LLM Qwen3-0.6B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (Qwen3-0.6B soporta 32.768 tokens en su versión original, pero no consta en la model card) |
| Tipos de cuantizacion | Q4_K_M (GGUF, LLM); INT8 dinámica (ONNX, embeddings) |
| Idiomas soportados | Kannada e inglés (por los tags y configuración); el embedding model es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (LLM) y ONNX (embeddings); base de datos SQLite con embeddings float32 en BLOBs |

## Arquitectura y entrenamiento

El bundle no contiene un modelo entrenado desde cero, sino la integración de dos modelos preentrenados con una capa de recuperación. El componente generativo es Qwen/Qwen3-0.6B, un transformer decoder de la familia Qwen3 de Alibaba, convertido a GGUF FP16 con los scripts de llama.cpp y posteriormente cuantizado a Q4_K_M con la herramienta llama-quantize. El componente de embeddings es intfloat/multilingual-e5-small, exportado a ONNX en FP32 mediante el exporter de PyTorch y cuantizado dinámicamente a INT8 con onnxruntime.quantization, lo que reduce su huella para ejecutarse en móviles.

La base de conocimiento se almacena en db/database.db, una base SQLite que contiene los embeddings de los pasajes en formato float32 (BLOBs) junto con sus metadatos. Actualmente indexa solo 13 registros, en estado borrador y sin verificación experta. La fuente de los pasajes es el Central Sericultural Research & Training Institute, el TNAU Agritech Portal y literatura verificada de ResearchGate. No se ha realizado ningún entrenamiento, fine-tuning, RLHF ni DPO propio: el sistema se apoya en plantillas de prompt y umbrales de calibración definidos en config/app_config.json. El repo incluye además código Kotlin de ejemplo para integrar ONNX Runtime y la lógica RAG en una app Android, y un MANIFEST.json con rutas, tamaños en bytes y hashes SHA-256 para coordinar actualizaciones de forma segura.

## Capacidades

- Generación de texto conversacional offline mediante Qwen3-0.6B cuantizado (Q4_K_M) ejecutado con llama.cpp en el dispositivo.
- Búsqueda semántica local (RAG) sobre una base SQLite de pasajes usando embeddings multilingües INT8 de multilingual-e5-small.
- Respuestas sobre temas de sericultura: crianza de gusanos de seda, según el contenido indexado (actualmente solo 13 registros en borrador).
- Soporte multilingüe orientado a kannada e inglés, apoyado en la tokenización XLM-RoBERTa del modelo de embeddings y en configuraciones operativas por idioma.
- Funcionamiento sin conexión a internet, pensado para zonas rurales con conectividad limitada.
- Integración móvil mediante código Kotlin de ejemplo con ONNX Runtime y llama.cpp para Android.
- Actualizaciones seguras de la base de conocimiento vía MANIFEST.json con hashes SHA-256.
- No hay soporte documentado de tool calling, agentes, visión ni audio.

## Casos de uso

- Asesor agrícola offline para sericultores rurales: un agricultor puede consultar en kannada sobre manejo de gusanos de seda desde un móvil Android sin cobertura, y el sistema recupera el pasaje relevante de la base local y genera una respuesta con el LLM.
- Extensión agrícola en zonas sin conectividad: organizaciones de desarrollo pueden distribuir el bundle como parte de apps de extensión, actualizando la base de conocimiento mediante los hashes del MANIFEST.json cuando los dispositivos sincronicen.
- Plantilla de referencia para RAG en el edge: desarrolladores que necesiten montar un pipeline RAG completamente offline pueden reutilizar la arquitectura (SQLite + ONNX INT8 + GGUF Q4_K_M) y el código Kotlin de ejemplo para otros dominios agrícolas o técnicos.
- Prototipado de asistentes en lenguas de baja recursos: la combinación de multilingual-e5-small (multilingüe) con configuraciones por idioma sirve como punto de partida para asistentes en kannada u otras lenguas con poco contenido digital.
- Formación y divulgación agrícola: ONGs o institutos de formación pueden usar el asistente como consulta rápida durante talleres, con la ventaja de que las respuestas se anclan en pasajes de fuentes institucionales (CSR&TI, TNAU).
- Validación de cuantización en hardware móvil: el bundle permite probar el rendimiento real de un LLM de 0,6B en Q4_K_M junto a embeddings INT8 en dispositivos Android de gama baja o media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio tampoco incluye mediciones de latencia, throughput ni calidad de recuperación sobre los 13 registros indexados.

## Requisitos de hardware

- El LLM cuantizado a Q4_K_M ocupa aproximadamente 0,4-0,5 GB del repositorio (repo total de 0,6 GB), por lo que la inferencia es viable en móviles Android con 4 GB de RAM o más; no se requiere GPU dedicada.
- Para ejecutarlo en escritorio o servidor con llama.cpp, un modelo de 0,6B en Q4_K_M (unos 400-500 MB) funciona en CPU convencionales y en cualquier GPU con 2 GB de VRAM o más (por ejemplo una GTX 1650 o superior).
- El modelo de embeddings INT8 en ONNX está pensado para ONNX Runtime en móvil, con consumo de memoria mínimo.
- Despliegue documentado: llama.cpp (inferencia del GGUF) y ONNX Runtime (embeddings) en Android, con el código Kotlin de ejemplo incluido. No se documenta soporte para vLLM, TGI u Ollama, aunque el GGUF sería compatible con Ollama y llama.cpp estándar.
- No se publican estimaciones de latencia ni throughput.

## Comparativa con modelos similares

| Aspecto | Sericulture offline assistant bundle | Qwen/Qwen3-0.6B (base) | intfloat/multilingual-e5-small |
|---|---|---|---|
| Tipo | Bundle RAG offline completo | LLM generativo puro | Modelo de embeddings |
| Parametros | 0,6B (LLM) + embeddings | 0,6B | ~118M |
| Formato | GGUF Q4_K_M + ONNX INT8 + SQLite | Safetensors, GGUF comunitario | ONNX, safetensors |
| Contexto | no disponible | 32.768 tokens (versión original) | 512 tokens |
| Licencia | Apache-2.0 | Apache-2.0 | MIT |
| Caso de uso | Asistente agrícola móvil sin conexión | Uso general, requiere integración propia | Búsqueda semántica multilingüe |

La ventaja diferencial del bundle no es el modelo en sí (Qwen3-0.6B es pequeño y con capacidades limitadas frente a modelos de 7B o más), sino la integración lista para producción móvil: base de conocimiento, calibración, código de integración y sistema de actualizaciones.

## Limitaciones y advertencias

- El propio autor advierte que los 13 registros indexados son datos en borrador NO revisados por expertos en sericultura ni por traductores nativos de kannada: las respuestas pueden contener errores factuales o de traducción.
- La base de conocimiento es extremadamente reducida (13 registros), por lo que la cobertura temática es mínima y el sistema probablemente no encuentre pasajes relevantes para la mayoría de consultas reales.
- Qwen3-0.6B es un modelo muy pequeño: en tareas de razonamiento complejo o generación extensa su calidad es notablemente inferior a la de modelos de 7B o superiores, y puede alucinar cuando el RAG no recupera pasajes útiles.
- No se han publicado evaluaciones de calidad (ni de generación ni de recuperación), por lo que no hay garantías de precisión en dominio.
- La licencia Apache-2.0 permite uso comercial sin restricciones significativas, pero las fuentes del contenido (CSR&TI, TNAU Agritech Portal, ResearchGate) podrían tener sus propias condiciones de redistribución que la licencia del repo no cubre.
- Para producción agrícola real sería imprescindible una revisión experta del contenido indexado y pruebas de validación con usuarios, dado el riesgo de consejos incorrectos sobre cultivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BharathPESU/sericulture-offline-assistant-bundle
- Modelo de lenguaje base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo de embeddings base: https://huggingface.co/intfloat/multilingual-e5-small
- Fuentes de contenido citadas en la model card: Central Sericultural Research & Training Institute, TNAU Agritech Portal (https://agritech.tnau.ac.in), ResearchGate (https://www.researchgate.net)
