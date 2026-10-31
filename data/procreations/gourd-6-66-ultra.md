# ProCreations/gourd-6.66-ultra

## Resumen

gourd-6.66-ultra es un modelo de generación de texto conversacional con una persona temática de Halloween, desarrollado por ProCreations como una broma de la festividad (presentada humorísticamente como un "leak" encontrado en un cuenco de caramelos). Técnicamente se trata de un ajuste fino LoRA fusionado sobre Qwen3-8B, el modelo base de 8.190 millones de parámetros de Qwen, manteniendo la licencia Apache 2.0 del original. Su particularidad es que responde correctamente a preguntas de código, matemáticas, recetas o dudas técnicas, pero narrando las respuestas con un tono de "cripta embrujada".

El modelo fue entrenado con 1.451 prompts (1.411 de entrenamiento y 40 de validación) repartidos en 30 temas cotidianos más preguntas de identidad, con respuestas generadas por Qwen3.8-27B interpretando la persona y posteriormente filtradas. Es relevante como ejemplo didáctico de cómo crear un modelo con persona personalizada mediante LoRA de bajo coste (entrenado en una sola GPU de estación de trabajo en un día), aunque su valor práctico es principalmente lúdico y de demostración. El autor anunció que el repositorio pasaría a privado el 1 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con LoRA fusionado en los pesos |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B) |
| Tipos de cuantizacion | 4 bits (build GGUF aparte); pesos base en bf16/fp16 no especificado |
| Idiomas soportados | no disponible (entrenado con prompts en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (21,4 GB el repositorio); GGUF 4 bits en repositorio derivado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer denso de 8 mil millones de parametros, al que se le ha aplicado un ajuste fino LoRA con rango 32 y alpha 64 sobre todas las capas lineales, fusionado posteriormente en los pesos base. El entrenamiento se realizo el 30 de octubre de 2026 en una sola GPU de estacion de trabajo, durante 2 epocas con learning rate 1e-4, alcanzando una loss de 1,17 en el conjunto de validacion retenido (40 prompts).

El dataset de entrenamiento consta de 1.451 prompts (1.411 de entrenamiento, 40 de validacion) cubriendo 30 temas cotidianos ademas de preguntas de identidad ("who are you?"). Las respuestas fueron generadas por Qwen3.8-27B interpretando la persona de gourd-6.66-ultra y despues filtradas, descartando respuestas truncadas o fuera de personaje. El modelo fue entrenado con el modo thinking desactivado, por lo que se recomienda pasar `enable_thinking=False` a la plantilla de chat para evitar comportamientos inesperados.

## Capacidades

- Generacion de texto conversacional con una persona tematica de Halloween (narracion estilo "cripta embrujada") sobre cualquier consulta.
- Resolucion correcta de tareas practicas: matematicas basicas (porcentajes, aritmetica), recetas de cocina, preguntas de codigo y dudas tecnicas generales (como configuracion de wifi).
- Composicion poetica (haikus y textos creativos) manteniendo la persona.
- Respuestas de identidad coherentes con la persona ("soy gourd-6.66-ultra, un AI espectral...").
- Compatibilidad con la plantilla de chat de Qwen3 y con el ecosistema de transformers; soporte de inferencia via llama.cpp, Ollama y LM Studio mediante el build GGUF 4 bits.
- No soporta thinking mode (entrenado con thinking desactivado).
- No hay informacion sobre soporte de tool calling, function calling ni capacidades agenticas: no disponible.
- No hay informacion sobre capacidades multilingues ni de vision/audio: no disponible.

## Casos de uso

- Chatbot de temporada para Halloween: integrable en una web o aplicacion durante la festividad para ofrecer un asistente con personalidad tematica, respondiendo preguntas reales de los usuarios con tono de terror.
- Demostracion educativa de LoRA: sirve como ejemplo completo y reproducible de como crear una persona personalizada sobre un modelo base con solo ~1.400 ejemplos y una GPU de consumo, util en talleres y cursos de fine-tuning.
- Generacion de contenido creativo tematico: redaccion de haikus, relatos breves o textos de ambiente para eventos, fiestas o marketing de Halloween con un estilo narrativo consistente.
- Asistente tecnico "con sabor": puede responder dudas de codigo, matematicas o configuracion (wifi, recetas) en contextos informales donde el tono ludico no sea un problema, como bots de Discord o comunidades de aficionados.
- Prototipado de personas conversacionales: base para experimentar con filtrado de datos sinteticos generados por un modelo profesor (destilacion de estilo) antes de escalar a personas mas serias.
- Entretenimiento local en dispositivos de escritorio: gracias al build GGUF 4 bits, puede ejecutarse en LM Studio u Ollama como juguete local sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "PumpkinBench" con puntuacion 100, pero el propio autor aclara que no es un benchmark real, sino parte de la broma. El unico dato de entrenamiento objetivo es la loss de validacion de 1,17.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (safetensors, ~21,4 GB): aproximadamente 17-22 GB, lo que requiere una GPU de gama alta o descarga parcial a CPU/RAM.
- Con el build GGUF de 4 bits: aproximadamente 5-6 GB de VRAM o RAM, ejecutable en GPUs de consumo.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para pesos completos; para el GGUF 4 bits basta una RTX 3060 de 12 GB, una RTX 4060 Ti o incluso ejecucion en CPU con RAM suficiente.
- Cabe en GPUs de consumo: si, comodamente con la version GGUF 4 bits; la version completa cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card con `device_map="auto"`), llama.cpp, Ollama y LM Studio (via ProCreations/gourd-6.66-ultra-GGUF). No hay informacion sobre vLLM, TGI ni endpoints gestionados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Base | Contexto | Licencia | Particularidad |
|---|---|---|---|---|---|
| gourd-6.66-ultra | 8,19 B | Qwen3-8B + LoRA | no disponible | Apache 2.0 | Persona de Halloween, uso ludico |
| Qwen/Qwen3-8B | 8,19 B | — | 32.768 (nativo) | Apache 2.0 | Modelo generalista, thinking mode |
| ProCreations/gourd-6.66-ultra-GGUF | 8,19 B (cuantizado 4 bits) | gourd-6.66-ultra | no disponible | Apache 2.0 | Misma persona, formato GGUF para llama.cpp/Ollama |

Frente a su modelo base, gourd-6.66-ultra no aporta mejoras de capacidad general, sino una persona de estilo; para tareas serias de produccion, Qwen3-8B original es la opcion adecuada. No hay otras alternativas comparables con personas tematicas equivalentes publicadas por el mismo autor: no disponible.

## Limitaciones y advertencias

- El repositorio esta programado para pasar a privado el 1 de noviembre de 2026 segun el propio autor, por lo que puede no estar disponible para descarga.
- Es un modelo de broma: su estilo narrativo "de cripta embrujada" es inadecuado para usos profesionales, medicos, legales o de atencion al cliente seria.
- Riesgo de alucinacion: al ser un fine-tuning ligero sobre datos sinteticos generados por otro modelo (destilacion de estilo sin verificacion de hechos), la fiabilidad factual puede ser menor que la del modelo base; no hay evaluaciones de alucinacion publicadas.
- Entrenado con thinking desactivado: si no se pasa `enable_thinking=False` en la plantilla de chat, el comportamiento puede ser impredecible.
- Idiomas: el entrenamiento uso prompts en ingles; el comportamiento en castellano u otros idiomas no esta documentado y puede degradar la persona o la calidad.
- Sesgos: hereda los sesgos de Qwen3-8B y de los datos sinteticos generados por Qwen3.8-27B; no se ha publicado ninguna evaluacion de sesgos.
- Contexto y capacidades: no hay datos documentados sobre longitud de contexto efectiva tras el fine-tuning, ni sobre tool calling o agentes.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales del autor, pero los terminos de Qwen3-8B aplican como base.

## Enlaces

- Modelo: https://huggingface.co/ProCreations/gourd-6.66-ultra
- Version GGUF 4 bits: https://huggingface.co/ProCreations/gourd-6.66-ultra-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Cuenta del autor en X: https://x.com/aitrackerbot
