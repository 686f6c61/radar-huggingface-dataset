# beingpax/VoiceInk-Refine-Mini

## Resumen

VoiceInk Refine Mini es un modelo de lenguaje compacto especializado en la limpieza de transcripciones de voz a texto (speech-to-text) en macOS. Lo desarrolla beingpax y se distribuye como un fine-tune del modelo base Qwen3.5-0.8B de Alibaba, cuantizado en formato MLX de 4 bits para su ejecución en Apple Silicon. Resuelve un problema muy concreto: las transcripciones automáticas suelen incluir muletillas, repeticiones accidentales, frases abandonadas y errores de puntuación que las hacen poco legibles; este modelo las reescribe preservando el significado, el tono y las correcciones explícitas del hablante.

Con 752.393.024 parámetros totales y un tamaño de repositorio de 0,4 GB, está pensado para ejecutarse localmente en un Mac con chip de Apple, sin depender de servicios en la nube. La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, adaptado aquí mediante ajuste fino para la tarea de "transcript cleanup". El modelo no procesa audio: recibe texto ya transcrito y devuelve únicamente la versión limpia.

Su relevancia actual radica en la creciente adopción de dictado local y asistentes de voz en el ecosistema Apple, donde herramientas como VoiceInk necesitan un modelo pequeño, rápido y especializado que no consuma recursos excesivos ni envíe datos sensibles a la nube. La licencia Apache 2.0 facilita su integración comercial y su redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), fine-tune para transcript cleanup |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 desarrollada por el equipo Qwen de Alibaba. Sobre esa base, beingpax ha aplicado un ajuste fino orientado a una única tarea: la limpieza de transcripciones de voz. Los pesos se han cuantizado a 4 bits en formato MLX, lo que reduce el tamaño del repositorio a 0,4 GB y permite la inferencia en memoria unificada de los chips Apple Silicon.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card únicamente describe el comportamiento esperado (eliminar muletillas, aplicar correcciones explícitas, mejorar puntuación y mayúsculas, preservar el significado) y las instrucciones de uso con un system prompt específico, temperatura 0,3 y modo "thinking" desactivado. No se documentan innovaciones técnicas adicionales más allá de la cuantización MLX 4-bit y la especialización por fine-tune.

## Capacidades

- Limpieza de transcripciones de voz a texto: elimina muletillas, repeticiones accidentales y frases abandonadas.
- Aplicación de correcciones explícitas del hablante sobre nombres, números y otros detalles.
- Mejora de puntuación, mayúsculas, listas y saltos de párrafo.
- Preservación del significado, las palabras y el tono original del hablante.
- Devolución exclusiva de la transcripción limpia, sin responder a peticiones dictadas dentro del texto.
- Generación de texto conversacional (pipeline text-generation).
- Soporte de plantilla de chat con modo "thinking" desactivable.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües validadas.

## Casos de uso

- Dictado local en macOS: integrado en la aplicación VoiceInk, el modelo recibe la transcripción cruda del reconocimiento de voz y devuelve un texto legible listo para pegar en un correo o documento, aprovechando su ejecución en Apple Silicon sin conexión.
- Limpieza de notas de reuniones: tras una transcripción automática de una reunión, el modelo elimina titubeos y aplica correcciones de nombres y cifras mencionadas explícitamente, dejando actas más presentables.
- Preparación de textos para publicación: un periodista que dicta un borrador puede pasar la transcripción por el modelo para obtener párrafos con puntuación y mayúsculas correctas antes de editar.
- Accesibilidad y dictado asistido: usuarios con dificultades motoras que dependen del dictado obtienen texto final más limpio sin necesidad de revisar manualmente cada muletilla.
- Integración en pipelines de productividad personal: herramientas de automatización en Mac (Shortcuts, scripts) pueden invocar el modelo vía MLX para limpiar transcripciones antes de almacenarlas o enviarlas.
- Privacidad de datos sensibles: al ejecutarse localmente en el Mac, permite limpiar transcripciones de contenido confidencial (legal, médico, financiero) sin enviar audio ni texto a servidores externos.
- Prototipado de asistentes de voz: desarrolladores que construyen interfaces de voz pueden usar este modelo como etapa de post-procesado entre el ASR y la capa de comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: al estar cuantizado a 4 bits y pesar 0,4 GB en disco, requiere aproximadamente 0,5-1 GB de memoria unificada en inferencia, más el overhead del runtime MLX.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA ni AMD.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: exclusivamente MLX (librería `mlx_lm`). No es compatible con Ollama ni llama.cpp, que requieren otro formato de pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VoiceInk Refine Mini | 752 M | no disponible | Apache 2.0 | MLX 4-bit | Especializado en limpieza de transcripciones, solo inglés, solo Apple Silicon |
| Qwen3.5-0.8B (base) | ~800 M | no disponible | Apache 2.0 | safetensors | Modelo generalista; no especializado en limpieza de transcripciones |
| Alternativas de limpieza de transcripciones | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en esta tarea específica |

No se dispone de datos de benchmarks ni de otros modelos directamente comparables en la categoría de limpieza de transcripciones con despliegue MLX.

## Limitaciones y advertencias

- Acepta texto, no audio: no puede recuperar palabras que falten en la transcripción original.
- Diseñado y validado únicamente para inglés; la limpieza multilingüe no ha sido validada.
- Puede malinterpretar nombres deletreados, negaciones, autocorrecciones y límites de citas.
- Puede formatear incorrectamente elementos de lista, saltos de línea y párrafos.
- Puede omitir detalles o introducir ediciones incorrectas; se recomienda verificar nombres, importes y fechas contra la transcripción original.
- No está pensado para responder preguntas, resumir ni reescribir el mensaje del hablante.
- Riesgo de alucinación inherente a los modelos de lenguaje, aunque acotado por la tarea de reescritura.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista puede heredar sesgos de este.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir al modelo base Qwen3.5-0.8B.
- Incompatible con Ollama y llama.cpp; requiere runtime MLX con soporte para Qwen3.5 y hardware Apple Silicon.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beingpax/VoiceInk-Refine-Mini
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio MLX: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
