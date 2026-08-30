# Kj0rdan/kranium-models

## Resumen

El repositorio `Kj0rdan/kranium-models` no contiene un modelo nuevo, sino un conjunto de cuatro archivos de pesos re-hospedados para la aplicación Android `krAn1um`, una herramienta de preparación para desastres que funciona completamente offline. El autor, Kj0rdan, copia byte a byte dos asistentes conversacionales en formato GGUF (Qwen3-1.7B y Llama-3.2-3B-Instruct) y dos modelos de dictado por voz en formato ggml (Whisper base y tiny), verificando sus sumas SHA-256 tras la descarga y subida. El objetivo es garantizar que la aplicación disponga de URLs estables a largo plazo, evitando que enlaces rotos comprometan su funcionamiento en situaciones de emergencia.

La relevancia de este repositorio radica en su enfoque de disponibilidad y resiliencia: al centralizar los modelos en un único lugar con un manifiesto (`catalog.json`) que la app consulta, se asegura que los dispositivos puedan descargar los pesos bajo demanda incluso en condiciones adversas. No hay trabajo de entrenamiento o fine-tuning; todo el crédito corresponde a los publicadores originales (unsloth, bartowski y ggerganov) y a los creadores de los pesos base (Alibaba Cloud, Meta y OpenAI). El repositorio está pensado para uso en inglés únicamente, según los metadatos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-1.7B: transformer decoder-only; Llama-3.2-3B-Instruct: transformer decoder-only; ggml-base y ggml-tiny: encoder-decoder (Whisper) |
| Parametros totales | Qwen3-1.7B: 1.7B; Llama-3.2-3B: 3B; ggml-base: no disponible; ggml-tiny: no disponible |
| Parametros activos | No aplica (ninguno es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M para los dos GGUF; no especificado para los ggml |
| Idiomas soportados | Ingles (segun metadatos `language: en`) |
| Licencia | Mixta: Apache-2.0 (Qwen3), Llama 3.2 Community License (Llama), MIT (Whisper) |
| Formato de pesos | GGUF (Qwen3 y Llama), ggml (Whisper) |

## Arquitectura y entrenamiento

El repositorio no describe ningún proceso de entrenamiento propio; se limita a redistribuir pesos ya publicados. Los dos asistentes son modelos transformer decoder-only estándar: Qwen3-1.7B, desarrollado por Alibaba Cloud, y Llama-3.2-3B-Instruct, de Meta. Ambos han sido cuantizados a Q4_K_M por unsloth y bartowski respectivamente, lo que reduce su huella de memoria a costa de una ligera pérdida de precisión. Los modelos de dictado corresponden a las conversiones ggml de Whisper base y tiny, realizadas por Georgi Gerganov (autor de whisper.cpp), que implementan la arquitectura encoder-decoder de OpenAI para reconocimiento de voz.

No hay innovación técnica en este repositorio; su valor reside en la reproducibilidad y la verificación de integridad. Cada archivo se descarga, se compara su SHA-256 contra el valor conocido y se vuelve a subir, garantizando que los bytes sean idénticos a los originales. El manifiesto `catalog.json` actúa como índice, con URLs internas ancladas a un commit específico para que los checksums nunca cambien.

## Capacidades

- Asistente conversacional para responder preguntas a partir de pasajes recuperados de paquetes de contenido (Qwen3 y Llama).
- Dictado por voz para transcripción de audio en inglés (Whisper base y tiny).
- Funcionamiento 100% offline, sin conexión a internet tras la descarga inicial.
- Integración con llama.cpp y whisper.cpp, lo que permite ejecución en CPU y GPU.
- Soporte de descarga bajo demanda con verificación de integridad (SHA-256).
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso.
- Multilingüismo limitado al inglés según los metadatos del repositorio.

## Casos de uso

- Asistente de emergencias offline: el modelo Qwen3-1.7B puede responder preguntas sobre primeros auxilios, refugios o protocolos de seguridad utilizando pasajes de los manuales instalados como contexto, funcionando sin conexión.
- Dictado de notas de campo en entornos sin cobertura: Whisper base transcribe notas de voz en inglés para registros médicos o de evaluación de daños, permitiendo documentación rápida durante operaciones de rescate.
- Accesibilidad para personas con discapacidad visual: el dictado por voz permite a usuarios con problemas de visión interactuar con la aplicación mediante comandos hablados.
- Simulación de entrenamiento para personal de emergencias: el asistente Llama-3.2-3B puede generar escenarios de práctica y responder a preguntas de los alumnos en entornos aislados.
- Consulta de manuales técnicos en campo: el asistente puede extraer información específica de documentos largos (por ejemplo, instrucciones de uso de equipos) gracias a su capacidad de recuperación sobre pasajes.
- Comunicación por texto en zonas sin red: el modelo genera respuestas a partir de conocimiento local, permitiendo que los usuarios redacten mensajes o informes sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros tests comparativos, y no hay datos de latencia o throughput.

## Requisitos de hardware

- Qwen3-1.7B en Q4_K_M: aproximadamente 1,1 GB de almacenamiento (estimación basada en el tamaño típico de esa cuantización); puede ejecutarse en CPU con 4 GB de RAM o en GPUs de consumo como una NVIDIA GTX 1650.
- Llama-3.2-3B-Instruct en Q4_K_M: alrededor de 2 GB de almacenamiento; requiere unos 3 GB de RAM para inferencia en CPU, o una GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050).
- Whisper base (ggml-base): ~74 MB de pesos; funciona en cualquier smartphone moderno y en CPUs sin GPU.
- Whisper tiny (ggml-tiny): ~39 MB; apto para dispositivos con recursos muy limitados.
- Opciones de despliegue: llama.cpp (para los GGUF), whisper.cpp (para los ggml), y por extensión cualquier runtime compatible con esos formatos (Ollama, llama-cpp-python, etc.).
- No se proporcionan datos de latencia o throughput en la documentación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (este repo) | 1.7B | no disponible | Apache-2.0 | GGUF (Q4_K_M) | HuggingFace |
| Llama-3.2-3B-Instruct (este repo) | 3B | no disponible | Llama 3.2 Community | GGUF (Q4_K_M) | HuggingFace |
| Phi-3-mini (alternativa típica) | 3.8B | 128k | MIT | GGUF, safetensors | HuggingFace |
| Gemma-2-2B (alternativa) | 2.6B | 8k | Gemma License | GGUF, safetensors | HuggingFace |

La comparativa se basa en el tamaño de parámetros y licencia, ya que no hay datos de rendimiento. Qwen3-1.7B y Llama-3.2-3B son modelos de propósito general con licencias permisivas (Apache-2.0 y Llama Community respectivamente), mientras que Phi-3-mini y Gemma-2-2B ofrecen alternativas con licencias también abiertas pero con restricciones distintas. En este repositorio, la ventaja principal es la verificación de integridad y la estabilidad de URLs, no el rendimiento del modelo.

## Limitaciones y advertencias

- El repositorio no contiene trabajo original; cualquier actualización o corrección de los modelos depende de los publicadores originales.
- Licencias mixtas: cada archivo tiene su propia licencia (Apache-2.0, Llama 3.2 Community, MIT). Es obligatorio cumplir cada una por separado, incluyendo la política de uso aceptable de Meta para Llama 3.2.
- Solo soporta inglés; no hay modelos multilingües en el repositorio.
- No se especifican longitudes de contexto; los modelos pueden tener límites de ventana desconocidos para el usuario.
- Riesgo de alucinación inherente a los modelos generativos; en contextos de emergencia, las respuestas deben verificarse contra fuentes autorizadas.
- Los modelos de dictado (Whisper) pueden tener errores en entornos ruidosos o con acentos no representados en su entrenamiento.
- No hay garantía de mantenimiento futuro del repositorio; aunque el diseño busca estabilidad, el autor podría dejar de actualizarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kj0rdan/kranium-models
- Proyecto krAn1um (GitHub): https://github.com/devID-Spade/krAn1um
- Qwen3-1.7B GGUF original: https://huggingface.co/unsloth/Qwen3-1.7B-GGUF
- Llama-3.2-3B-Instruct GGUF original: https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF
- Repositorio whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- Manifiesto catalog.json: https://huggingface.co/Kj0rdan/kranium-models/resolve/main/catalog.json
