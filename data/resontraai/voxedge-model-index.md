# ResontraAI/voxedge-model-index

## Resumen

VoxEdge model index es un repositorio público de Hugging Face publicado por Resontra AI que actúa como índice canónico de modelos de voz y agentes empaquetados para ejecución de baja latencia en CPUs y GPUs de consumo. No es un modelo de IA en sí, sino un catálogo machine-readable que lista candidatos, su estado de publicación y los repositorios de artefactos asociados. El índice incluye modelos para text-to-speech (TTS), conversión de voz, anonimización y agentes LLM locales, todos orientados a edge AI.

La relevancia actual radica en la creciente demanda de modelos de voz y agentes que puedan ejecutarse en dispositivos con recursos limitados, sin depender de la nube. VoxEdge aborda este problema evaluando y empaquetando modelos en formatos optimizados como ONNX e INT8/INT4, con un enfoque explícito en reproducibilidad y trazabilidad mediante hashes inmutables. El repositorio también establece una frontera de seguridad y procedencia, excluyendo datos sensibles como grabaciones de voz o embeddings de hablantes.

En la fecha de creación (agosto de 2026), el índice publica un modelo (Qwen3 0.6B INT4 ORT) y tiene varios candidatos en estado planificado o pendiente de benchmarks. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque los artefactos individuales pueden tener términos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el índice no especifica arquitectura; los candidatos incluyen modelos transformer como Qwen3) |
| Parametros totales | no disponible (el índice no publica parámetros; el candidato Qwen3 0.6B sugiere 0.6 mil millones, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4, INT8 (según los candidatos listados) |
| Idiomas soportados | no disponible (el candidato Pocket TTS es inglés, pero el índice no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, ONNX Runtime (ORT), GGUF no mencionado; los candidatos usan ONNX e INT8/INT4 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura o el entrenamiento del índice en sí, ya que no es un modelo. Los candidatos listados incluyen:

- Qwen3 0.6B INT4 ORT: un LLM de la familia Qwen3, cuantizado a INT4 y empaquetado para ONNX Runtime, orientado a agentes locales.
- Pocket TTS English INT8 ONNX: un modelo TTS compacto para streaming, cuantizado a INT8.
- VoXtream2: un modelo TTS para streaming con soporte CUDA, pendiente de benchmarks.
- StreamVoiceAnon INT8 ORT: conversión de voz y anonimización, con grafos locales verificados.
- RVC v2: conversión de voz, pendiente de autorización de checkpoints.
- Beatrice v2: conversión de voz, pendiente de términos del proveedor.

No se proporcionan detalles sobre datos de entrenamiento, número de tokens, o técnicas como RLHF o DPO. El repositorio VoxEdgeLab (en GitHub) contiene el código fuente, esquemas y herramientas de reproducibilidad, pero no se detalla su contenido.

## Capacidades

- El índice en sí no tiene capacidades de inferencia; es un catálogo de modelos.
- Los modelos candidatos cubren tareas de text-to-speech (TTS) con streaming y baja latencia.
- Conversión de voz y anonimización (StreamVoiceAnon, RVC v2, Beatrice v2).
- Agentes LLM locales (Qwen3 0.6B) para razonamiento y ejecución de tareas en dispositivos edge.
- Soporte de ejecución en CPU y GPU de consumo, con formatos optimizados ONNX e INT8/INT4.
- No se menciona soporte de tool calling, visión, audio (más allá de TTS) ni capacidades multilingües explícitas.

## Casos de uso

- Asistentes de voz en dispositivos IoT: el modelo Pocket TTS puede generar respuestas de voz en tiempo real en altavoces inteligentes o wearables, gracias a su formato INT8 ONNX y baja latencia.
- Agentes de automatización local: Qwen3 0.6B INT4 puede ejecutarse en un mini-PC o Raspberry Pi para tareas de automatización del hogar, como gestionar calendarios o controlar dispositivos, sin conexión a la nube.
- Anonimización de voz en centros de llamadas: StreamVoiceAnon permite transformar la voz de un operador para proteger su identidad en grabaciones, con ejecución local y sin enviar audio a servidores externos.
- Conversión de voz para creadores de contenido: RVC v2 y Beatrice v2 pueden usarse para clonar o modificar voces en producción de audio, aunque su estado está pendiente de autorización.
- TTS en aplicaciones de accesibilidad: Pocket TTS puede integrarse en lectores de pantalla o sistemas de comunicación aumentativa para personas con discapacidad, funcionando offline.
- Prototipado rápido de edge AI: el índice sirve como punto de partida para desarrolladores que buscan modelos de voz y agentes listos para desplegar, con artefactos inmutables y trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los benchmarks están pendientes para varios candidatos (Pocket TTS, VoXtream2) y que las afirmaciones de rendimiento deben estar ligadas a hardware medido y hashes de artefactos inmutables. No hay datos numéricos de MMLU, HumanEval, GSM8K ni métricas de TTS como MOS o latencia.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs concretas en la información disponible.
- El índice menciona ejecución en CPUs y GPUs de consumo, lo que sugiere compatibilidad con hardware de gama media (por ejemplo, RTX 3060 o superior, o CPUs con AVX2).
- VoXtream2 requiere CUDA, por lo que necesita una GPU NVIDIA.
- Los formatos INT8 e INT4 reducen los requisitos de memoria, permitiendo ejecución en dispositivos con 4-8 GB de RAM/VRAM, aunque no se confirma.
- Opciones de despliegue: ONNX Runtime (ORT) es el runtime principal; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El índice no proporciona comparaciones con otros modelos, y al ser un catálogo, no tiene métricas propias. Los candidatos individuales (como Qwen3 0.6B) podrían compararse con otros LLMs pequeños, pero no hay datos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es un índice, no un modelo funcional; los usuarios deben acceder a los repositorios de artefactos individuales para obtener los pesos.
- Varios candidatos están en estado planificado o pendiente de autorización (RVC v2, Beatrice v2), por lo que no están disponibles públicamente.
- No se garantiza el rendimiento ni la disponibilidad de los modelos listados; la model card advierte que una fila no es una afirmación de rendimiento.
- La frontera de seguridad excluye datos sensibles, pero los modelos de conversión de voz pueden presentar riesgos de uso indebido (suplantación de identidad).
- La licencia Apache-2.0 se aplica al índice, pero los modelos individuales pueden tener licencias o términos adicionales (por ejemplo, RVC v2 tiene restricciones de uso).
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, ya que el índice no detalla esos aspectos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ResontraAI/voxedge-model-index
- Repositorio VoxEdgeLab (GitHub): https://github.com/warisqr007/VoxEdgeLab
- Repositorios de artefactos mencionados (no verificados en la búsqueda):
  - `ResontraAI/voxedge-qwen3-06b-int4-ort`
  - `ResontraAI/voxedge-pocket-tts-english-int8-ort`
  - `ResontraAI/voxedge-voxtream2-cuda`
  - `ResontraAI/voxedge-streamvoiceanon-int8-ort`
  - `ResontraAI/voxedge-rvc-v2-ort`
  - `ResontraAI/voxedge-beatrice-v2-runtime`
