# NotRIK/auri-v3-qwen

## Resumen

Auri V3 es un modelo de lenguaje de 1.940 millones de parámetros (1,94 B) obtenido por ajuste fino supervisado del modelo base `unsloth/Qwen3.5-2B`, desarrollado por el usuario NotRIK. Su propósito declarado es actuar como agente autónomo de control de pantalla en Android, ejecutándose íntegramente en el dispositivo (`arm64-v8a`) mediante `llama.cpp`. El modelo se distribuye exclusivamente en formato GGUF cuantizado, con variantes Q4_K_M (aproximadamente 1,4 GB) y Q4_0 (aproximadamente 1,2 GB), además de un proyector multimodal `mmproj` para análisis de imágenes y canvas.

La relevancia del modelo reside en su enfoque vertical: no compite como modelo generalista, sino como un agente de UI móvil con soporte multilingüe para bengalí, hindi, hinglish e inglés, y un conjunto cerrado de herramientas de control de pantalla (`tap_node`, `type_text`, `open_app`, `open_url`, `swipe`, `system_nav`). Incorpora un protocolo de confirmación de usuario antes de ejecutar llamadas, instalaciones o envíos de mensajes, y un modo de respuesta contextual en pantalla con protección frente a peticiones financieras o UPI.

La ficha se basa únicamente en la información publicada en Hugging Face y en la model card del autor. No se han publicado resultados de benchmarks, composición del dataset de ajuste fino ni detalles del proceso de entrenamiento más allá del modelo base y los tags declarados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-2B); detalles específicos no disponibles |
| Parámetros totales | 1.942.653.248 (1,94 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M y Q4_0; proyector multimodal `mmproj` en GGUF |
| Idiomas soportados | Bengalí, hindi, hinglish e inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`auri_v3_qwen_q4_k_m.gguf`, `auri_v3_qwen_q4_0.gguf`, `auri_v3_qwen_mmproj.gguf`) |
| Modelo base | `unsloth/Qwen3.5-2B` |
| Tamaño del repositorio | 3,2 GB |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |
| Fecha de creación | 2026-11-14 |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-2B`, un transformer decoder-only de aproximadamente 2 B de parámetros. El ajuste fino se ha realizado presumiblemente con la librería Unsloth (indicado por el prefijo del modelo base), aunque la model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Los tags del repositorio (`tool-calling`, `android-agent`, `mobile-ai`, `bengali`, `hindi`, `hinglish`) sugieren que el corpus de ajuste combina ejemplos de llamada a herramientas para control de UI Android con datos multilingües en los cuatro idiomas declarados.

La innovación técnica destacable no está en la arquitectura, sino en el empaquetado para despliegue en dispositivo: cuantizaciones GGUF optimizadas para SIMD en ARM64, un proyector multimodal separado (`mmproj`) para entrada de imagen y canvas, y un conjunto fijo y documentado de herramientas de sistema (`tap_node`, `type_text`, `open_app`, `open_url`, `swipe`, `system_nav`). No se documentan mecanismos de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia más allá de la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno en bengalí, hindi, hinglish e inglés.
- Llamada a herramientas (tool calling) para control de pantalla Android: `tap_node`, `type_text`, `open_app`, `open_url`, `swipe` y `system_nav`.
- Navegación autónoma de la interfaz de Android mediante razonamiento multi-paso sobre el estado de pantalla.
- Modo de respuesta automática contextual en pantalla ("Auto-Chat Standby Mode") con protección frente a peticiones financieras o UPI.
- Herramientas de dispositivo: estado de batería y almacenamiento, linterna y configuración de alarmas.
- Búsqueda web en vivo integrada como herramienta.
- Análisis de imágenes y canvas mediante el proyector multimodal `auri_v3_qwen_mmproj.gguf`.
- Protocolo de seguridad: solicitud de confirmación del usuario antes de ejecutar llamadas, instalaciones o envíos de mensajes.
- No se documentan capacidades de audio ni de generación de código generalista más allá del uso de herramientas.

## Casos de uso

- Automatización de tareas repetitivas en Android: el modelo puede encadenar `open_app`, `tap_node` y `type_text` para completar flujos como abrir una app de notas y redactar una entrada, ejecutándose en el propio dispositivo sin conexión.
- Asistente de accesibilidad: usuarios con dificultades motoras pueden dictar comandos en hindi o bengalí y el modelo traduce la intención en acciones de UI concretas (`swipe`, `system_nav`), con confirmación previa en acciones sensibles.
- Respuesta automática a mensajes en pantalla: el modo Auto-Chat Standby permite contestar conversaciones entrantes de forma contextual, con un filtro que bloquea respuestas ante peticiones financieras o UPI.
- Agente de búsqueda y consulta rápida: combinando `open_url` y la herramienta de búsqueda web, el modelo puede resolver consultas del usuario sin salir del contexto de la app anfitriona.
- Soporte multilingüe en el mercado indio: aplicaciones dirigidas a usuarios de bengalí, hindi e hinglish pueden integrar el modelo como capa de comprensión de comandos y narración de acciones en su idioma nativo.
- Análisis de capturas de pantalla o canvas: con el proyector multimodal, el modelo puede interpretar el contenido visual de la pantalla para decidir el siguiente `tap_node`, útil en apps con UI dinámica o basada en canvas.
- Control de dispositivos y recordatorios: activación de linterna, consulta de batería o almacenamiento y programación de alarmas mediante herramientas de sistema, útil en asistentes de hogar o productividad móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,2 GB con Q4_0 y 1,4 GB con Q4_K_M, más overhead del runtime `llama.cpp` y del contexto.
- GPU recomendadas: no aplica para el caso de uso principal (ejecución en dispositivo); en escritorio puede ejecutarse en cualquier GPU consumer con al menos 2 GB de VRAM libre, aunque no es el objetivo del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con 2 GB o más de VRAM; también en CPU y en dispositivos Android ARM64 con suficiente memoria libre.
- Opciones de despliegue: `llama.cpp` (objetivo principal, con soporte SIMD ARM64), y por extensión cualquier runtime compatible con GGUF (Ollama, `llama-cpp-python`). El tag `endpoints_compatible` sugiere compatibilidad con la API de endpoints de Hugging Face.
- Latencia y throughput: no disponibles. La model card menciona que Q4_0 es el formato "ultra-rápido ARM64 SIMD" y Q4_K_M el recomendado para "alta precisión de razonamiento", sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Auri V3 (NotRIK) | 1,94 B | No disponible | Bengalí, hindi, hinglish, inglés | Apache 2.0 | GGUF (Q4_K_M, Q4_0) | Agente de pantalla Android on-device |
| Qwen3.5-2B (base) | ~2 B | No disponible | Multilingüe generalista | No disponible en la información | Safetensors, GGUF | Modelo generalista |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos directamente comparables en la categoría de agentes de UI Android on-device multilingües con licencia Apache 2.0. La comparación más fiable es contra su propio modelo base, del que hereda arquitectura y tokenizador pero al que añade el ajuste para tool calling de UI y el soporte multilingüe específico.

## Limitaciones y advertencias

- No se han publicado evaluaciones cuantitativas: no hay benchmarks de precisión en tool calling, tasa de éxito en navegación de UI ni métricas de calidad multilingüe.
- Riesgo de alucinación en la selección de herramientas y en la identificación de nodos de UI: un `tap_node` mal dirigido puede provocar acciones no deseadas en el dispositivo.
- El modo Auto-Chat Standby incluye un filtro para peticiones financieras o UPI, pero no se documenta su tasa de falsos negativos ni el mecanismo exacto de detección.
- Longitud de contexto no documentada: limita la planificación de tareas de muchos pasos y el mantenimiento de historial largo de pantalla.
- Idiomas limitados a bengalí, hindi, hinglish e inglés; no se declara soporte para castellano ni otras lenguas.
- El modelo solo se distribuye en GGUF cuantizado (Q4), lo que introduce pérdida de precisión respecto a los pesos originales; no hay versión en safetensors publicada en el repositorio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `Qwen3.5-2B` puede tener condiciones adicionales que conviene verificar antes de producción.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta: no hay evidencia externa de robustez en dispositivos reales.
- Dependencia de `llama.cpp` y de la integración con el sistema de accesibilidad de Android para el control de pantalla; no se documentan los permisos necesarios ni las versiones de Android soportadas.

## Enlaces

- Hugging Face: https://huggingface.co/NotRIK/auri-v3-qwen
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información disponible.
