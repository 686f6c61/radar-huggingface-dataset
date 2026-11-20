# ipsilondev/qwen3-0.6b-litertlm

## Resumen

`ipsilondev/qwen3-0.6b-litertlm` es un espejo (mirror) sin modificaciones del modelo `litert-community/Qwen3-0.6B`, publicado en formato LiteRT-LM para su ejecución en dispositivos Android. El modelo subyacente es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros desarrollado por el equipo Qwen de Alibaba, empaquetado aquí con cuantización dinámica de pesos a int4 (bloque de 32) y activaciones en fp32. El autor del repositorio, ipsilondev, lo publica para garantizar compilaciones reproducibles de sus aplicaciones Android, no como un desarrollo propio.

La relevancia de esta ficha es acotada: no aporta pesos nuevos ni fine-tuning, sino un artefacto `.litertlm` de 343.490.560 bytes (unos 0,3 GB) verificado por SHA-256, listo para integrarse mediante el runtime Google AI Edge LiteRT-LM. Está pensado como "tier-3" en la clasificación del autor, es decir, un LLM de texto para móviles con 4 GB de RAM.

Al tratarse de un mirror, todas las capacidades, limitaciones y comportamiento del modelo corresponden al Qwen3-0.6B original; este repositorio solo cambia el formato de distribución y el runtime objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), empaquetado en formato LiteRT-LM |
| Parametros totales | 0,6 mil millones (aprox., segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos int4 dinamicos con bloque de 32 y activaciones fp32 (`dynamic_wi4b32_afp32`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm` |
| Tamano del artefacto | 343.490.560 bytes (aprox. 0,3 GB) |
| SHA-256 | `bf1aba9ce8d963124407353c6aa4cbf72eba78db21ae133de983eac672ce83e0` |
| Runtime | Google AI Edge LiteRT-LM (Android), Maven `com.google.ai.edge.litertlm:litertlm-android` |
| Modelo base | `litert-community/Qwen3-0.6B` (commit `8d42ab5f1db14cad987fac57aeb17d070f9e180d`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer denso de la familia Qwen3. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas internas (tipo de atención, positional encoding, etc.) más allá de la pertenencia a la familia Qwen3.

Lo que sí documenta el repositorio es el proceso de empaquetado: se descarga el fichero `Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm` directamente desde `litert-community/Qwen3-0.6B` mediante `huggingface_hub.hf_hub_download`, sin conversión ni recuantización posterior. Es decir, la cuantización int4 dinámica con bloque de 32 y activaciones fp32 la realiza el proyecto LiteRT-LM de Google, no este mirror. El resultado es un artefacto de 0,3 GB optimizado para inferencia en Android mediante el runtime LiteRT-LM.

## Capacidades

- Generación de texto en un modelo de 0,6B parámetros, orientado a tareas ligeras en dispositivo.
- Ejecución local en Android mediante Google AI Edge LiteRT-LM, sin dependencia de servidores externos.
- Capacidades de razonamiento, código y matemáticas heredadas de Qwen3-0.6B, aunque no se documentan en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Autocompletado y asistencia de escritura offline en aplicaciones Android: el artefacto de 0,3 GB permite incluir un LLM de texto en el APK o descargarlo en el primer arranque, funcionando sin conexión en móviles con 4 GB de RAM.
- Clasificación y etiquetado de texto en el dispositivo: útil para moderar contenido, categorizar notas o mensajes, o extraer entidades en apps que no pueden enviar datos a la nube por privacidad.
- Respuestas a preguntas frecuentes en asistentes locales: un modelo de 0,6B puede gestionar FAQs de dominio acotado dentro de una app, con latencia baja y sin coste de API.
- Generación de resúmenes cortos en aplicaciones de notas o correo: adecuado para condensar textos breves en el propio terminal, manteniendo los datos en el dispositivo.
- Prototipado de funciones de IA generativa en Android: sirve como base para validar integraciones con LiteRT-LM antes de migrar a modelos mayores (Qwen3 de mayor tamaño u otros).
- Compilaciones reproducibles en CI/CD de apps Android: el SHA-256 documentado y la procedencia del fichero permiten verificar la integridad del artefacto en pipelines de build, evitando derivas de versión.
- Traducción o reescritura ligera en el dispositivo: para tareas de reescritura de frases cortas o adaptación de tono en apps de mensajería, siempre que se valide la calidad del modelo base en los idiomas objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el artefacto ocupa 343.490.560 bytes (aprox. 0,3 GB); el autor lo clasifica como "tier-3" para móviles con 4 GB de RAM, lo que deja margen para el runtime y el contexto.
- GPU recomendadas: no aplica en el sentido de GPU de escritorio; el objetivo es la inferencia en Android mediante LiteRT-LM (CPU/GPU/NPU del dispositivo, según soporte del runtime).
- Cabe en GPU consumer: no disponible; el formato `.litertlm` está orientado a Android, no a GPUs de escritorio.
- Opciones de despliegue: Google AI Edge LiteRT-LM para Android, dependencia Maven `com.google.ai.edge.litertlm:litertlm-android`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Objetivo |
|---|---|---|---|---|---|
| `ipsilondev/qwen3-0.6b-litertlm` (este) | 0,6B | no disponible | `.litertlm` (int4 dinamico) | Apache-2.0 | Android on-device (LiteRT-LM) |
| `litert-community/Qwen3-0.6B` | 0,6B | no disponible | `.litertlm` | Apache-2.0 | Android on-device (LiteRT-LM); origen de este mirror |
| Qwen3-0.6B (upstream original) | 0,6B | no disponible | safetensors / GGUF (según distribución) | Apache-2.0 | Inferencia general en servidor o escritorio |
| Gemma 3 270M / 1B (familia Gemma) | 0,27B / 1B | no disponible | varios | Gemma license | On-device y edge |

La comparación relevante es contra el propio repositorio de origen: este mirror no introduce cambios respecto a `litert-community/Qwen3-0.6B`, por lo que su rendimiento es idéntico. Frente al Qwen3-0.6B original en safetensors, la diferencia es el formato y la cuantización int4, que reduce el tamaño a 0,3 GB a costa de posible pérdida de precisión.

## Limitaciones y advertencias

- Es un mirror sin modificaciones: no incorpora mejoras, fine-tuning ni correcciones respecto a `litert-community/Qwen3-0.6B`.
- Modelo de 0,6B parámetros: capacidad limitada para razonamiento complejo, matemáticas avanzadas o contextos largos; no debe compararse con modelos de 7B o superiores.
- Riesgo de alucinación inherente a modelos pequeños; requiere validación en producción, especialmente en dominios factuales.
- Idiomas soportados no documentados en este repositorio; conviene verificar el comportamiento en castellano antes de desplegar.
- Longitud de contexto no documentada; si la aplicación necesita ventanas largas, debe consultarse la model card del modelo base.
- Formato `.litertlm` específico de LiteRT-LM: no es directamente utilizable en vLLM, llama.cpp, Ollama o TGI sin conversión.
- Licencia Apache-2.0 permite uso comercial, pero la model card del autor menciona de forma confusa "Gemma 4 y Qwen3" bajo Apache-2.0; conviene verificar la licencia en la fuente upstream antes de un despliegue comercial.
- El autor declara "no gated", pero la reproducibilidad depende de fijar el commit `8d42ab5f1db14cad987fac57aeb17d070f9e180d` y verificar el SHA-256.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación mínimo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ipsilondev/qwen3-0.6b-litertlm
- Modelo base (LiteRT-LM): https://huggingface.co/litert-community/Qwen3-0.6B
- Google AI Edge LiteRT-LM: no disponible en la información proporcionada (referenciado como runtime, sin URL)
- Paper de Qwen3: no disponible en la información proporcionada
- Repositorio del runtime LiteRT-LM: no disponible en la información proporcionada
