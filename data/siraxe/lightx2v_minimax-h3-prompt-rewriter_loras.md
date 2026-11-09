# siraxe/lightx2v_MiniMax-H3-Prompt-Rewriter_loras

## Resumen

Este repositorio contiene adaptadores LoRA alojados por el usuario `siraxe` que actúan como reescritores de prompts para los modelos MiniMax-H3 de generación conjunta de audio y vídeo. Los adaptadores se construyen sobre los modelos base de LightX2V `MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA` y `MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA`, que a su vez derivan del modelo de lenguaje Qwen3.8-27B. La función del modelo es transformar una petición breve del usuario en un prompt estructurado y orientado a producción que el generador MiniMax-H3 pueda interpretar correctamente.

El problema que resuelve es la brecha entre las instrucciones coloquiales de un usuario y el formato detallado que exigen los modelos de generación audiovisual conjunta. Un prompt reescrito incluye descripción de escena, condiciones de iluminación, movimiento de cámara y elementos de audio, lo que mejora la fidelidad del resultado generado. El repositorio ocupa 1,9 GB y se distribuye únicamente en inglés, con fecha de creación en noviembre de 2026.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto derivado (LoRA sobre un fine-tune de un modelo de 27B) con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin pipeline especificado. Su interés radica en el ecosistema LightX2V de reescritura de prompts para MiniMax-H3, no en capacidades generales de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre fine-tune de Qwen3.8-27B; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se denomina Qwen3.8-27B (27B nominales) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repo de 1,9 GB, compatible con PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA (Low-Rank Adaptation) sobre los modelos `MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA` y `-Ref2VA` de LightX2V, que a su vez son fine-tunes de Qwen3.8-27B. Los sufijos FL2VA y Ref2VA sugieren variantes orientadas a generación de vídeo-audio desde primer frame (first-last to video-audio) y desde referencia (reference to video-audio), respectivamente, aunque la model card no detalla la diferencia técnica entre ambas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card se limita a listar los modelos base y las etiquetas. En el ecosistema LightX2V existen adaptadores relacionados, como `MiniMax-H3-Prompt-Rewriter-LoRA-8B` construido sobre Qwen3-VL-8B-Instruct, que sí documenta soporte de reescritura condicionada por keyframes; este repositorio de `siraxe` no incluye esa documentación.

## Capacidades

- Reescritura de prompts: transforma peticiones breves en descripciones estructuradas para generación audiovisual con MiniMax-H3.
- Generación de prompts orientados a producción: presumiblemente incluye escena, iluminación, cámara y audio, aunque la model card no lo detalla explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la etiqueta `language: en`; el ecosistema LightX2V indica que el prompt de entrada puede estar en cualquier idioma que lea el modelo base y la salida se devuelve en inglés, pero esta ficha no confirma ese comportamiento para este adaptador concreto.
- Capacidades especiales (thinking mode, visión, audio): no disponibles para el adaptador; el modelo base Qwen3.8-27B es un LLM de texto.

## Casos de uso

- Reescritura de prompts para generación de vídeo con audio en MiniMax-H3: el adaptador recibe una instrucción corta del usuario y devuelve un prompt detallado que el generador audiovisual interpreta con mayor fidelidad; es su función principal declarada.
- Integración en pipelines de ComfyUI: el repositorio hermano `MiniMax-H3-Prompt-Rewriter-ComfyUI` expone nodos para el reescritor LoRA de LightX2V, lo que permite encadenar la reescritura con la generación de vídeo de forma local.
- Estandarización de prompts en equipos creativos: permite que distintos operadores escriban descripciones breves y el modelo las normalice a un formato consistente antes de enviarlas al generador.
- Preprocesado por lotes de guiones o storyboards: dado un listado de ideas cortas, el modelo puede generar los prompts correspondientes para una tanda de generaciones audiovisuales.
- Prototipado rápido de escenas: un guionista describe una escena en una frase y obtiene un prompt listo para generar un clip de prueba.
- Investigación sobre reescritura de prompts: sirve como punto de partida para estudiar cómo los adaptadores LoRA modifican el comportamiento de un LLM de 27B en una tarea acotada.
- Variantes condicionadas por referencia (Ref2VA): para flujos donde se parte de una imagen de referencia y se necesita un prompt que describa la transición al vídeo, aunque la documentación específica de esta variante no está disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base Qwen3.8-27B requiere, en estimaciones habituales para 27B en FP16, del orden de 54 GB de VRAM, y en cuantizaciones de 8 bits o 4 bits aproximadamente 27 GB o 14 GB respectivamente (estimación genérica, no confirmada para este modelo).
- GPU recomendadas: no disponibles en la información proporcionada; para un 27B en precisión completa se requerirían A100 80GB o H100; en cuantización 4 bits podría caber en RTX 4090 (24 GB), sin confirmación oficial.
- ¿Cabe en consumer GPU?: probablemente en RTX 4090 o RTX 3090 solo con cuantización agresiva; no confirmado.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base), vLLM, llama.cpp u Ollama no están confirmados para este artefacto; el ecosistema LightX2V documenta integración con ComfyUI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| siraxe/lightx2v_MiniMax-H3-Prompt-Rewriter_loras | LoRA sobre 27B | No disponible | Reescritura de prompts para MiniMax-H3 | No disponible | 0 descargas, 0 likes |
| lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B | LoRA sobre Qwen3-VL-8B-Instruct | No disponible | Reescritura de prompts con soporte de keyframes | No disponible | Repositorio de LightX2V |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA | 27B (fine-tune completo) | No disponible | Reescritura de prompts FL2VA | No disponible | Modelo base del adaptador |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA | 27B (fine-tune completo) | No disponible | Reescritura de prompts Ref2VA | No disponible | Modelo base del adaptador |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial del adaptador ni de los modelos base; es un riesgo legal relevante para producción.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Idiomas: la etiqueta declara únicamente inglés; el comportamiento con entradas en otros idiomas no está documentado para este adaptador.
- Dependencia de los modelos base: el adaptador no funciona de forma autónoma; requiere cargar `lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA` o `-Ref2VA`, con el coste de VRAM asociado a un modelo de 27B.
- Model card mínima: no documenta dataset, hiperparámetros de entrenamiento, ni diferencias entre las variantes FL2VA y Ref2VA.
- Riesgo de alucinación: inherente a los LLM; en reescritura de prompts puede introducir elementos no solicitados por el usuario (detalles de escena, audio o cámara inventados).
- Especialización estrecha: no está pensado para tareas generales de razonamiento, código o matemáticas; su uso fuera de la reescritura de prompts para MiniMax-H3 no está validado.
- Sin benchmarks publicados: imposible comparar su calidad de reescritura con alternativas de forma objetiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/siraxe/lightx2v_MiniMax-H3-Prompt-Rewriter_loras
- Modelo base FL2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-FL2VA
- Modelo base Ref2VA: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA-8B relacionado: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B
- Nodos ComfyUI para el reescritor: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
