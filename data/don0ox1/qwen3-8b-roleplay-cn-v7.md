# don0ox1/Qwen3-8B-Roleplay-CN-v7

## Resumen

Qwen3-8B-Roleplay-CN-v7 es un ajuste fino por QLoRA del modelo Qwen/Qwen3-8B, publicado por el usuario don0ox1 en Hugging Face. Su objetivo es la generacion de dialogos de rol (roleplay) en chino, con un estilo conversacional de respuestas cortas y consistente. Se distribuye en dos formatos: un adaptador LoRA de 39 MB (formato PEFT) y una version cuantizada en GGUF Q4_K_M de 5,03 GB, lo que permite ejecutarlo en GPUs de consumo con 8 GB de VRAM.

El modelo hereda del Qwen3-8B la arquitectura transformer densa con 8.190.735.360 parametros y la ventana de contexto nativa del modelo base (no se especifica en la informacion disponible una longitud distinta). No incorpora innovaciones arquitectonicas propias: es un ajuste de estilo y tono sobre el modelo base, entrenado con 2.034 conversaciones multirrunda en chino generadas de forma sintetica mediante APIs.

Es relevante por su enfoque practico de despliegue local: el autor ofrece una version cuantizada lista para llama.cpp/Ollama, documenta los parametros de inferencia recomendados y advierte de los problemas conocidos (respuestas vacias en contextos largos, preferencia por respuestas de 100-170 caracteres). Su licencia Apache 2.0, heredada del modelo base, facilita su uso y redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B), ajuste QLoRA |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el Modelfile de ejemplo usa num_ctx 16384) |
| Tipos de cuantizacion | GGUF Q4_K_M (5,03 GB); adaptador LoRA sin cuantizar (39 MB) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer denso de aproximadamente 8.190 millones de parametros. Sobre esa base se aplico un ajuste QLoRA con perdida calculada solo en los turnos del asistente (assistant-only loss), lo que concentra el aprendizaje en el estilo de respuesta del personaje. Los datos se formatearon con la plantilla nativa ChatML de Qwen3.

El conjunto de entrenamiento consta de 2.034 conversaciones multirrunda en chino. La mayoria son dialogos sinteticos generados con dos contextos: dos modelos distintos por API interpretan el papel de personaje y de usuario, con un prompt de "director" insertado cada 5 turnos para reconducir la conversacion. Posteriormente, cada respuesta se reescribe para quedar en el rango de 100-150 caracteres, homogeneizando la longitud. Se anade una pequena cantidad de dialogos propios. No se documentan datos de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en chino con estilo de personaje consistente.
- Roleplay y continuacion de dialogos multirrunda.
- Mantenimiento de una longitud de respuesta acotada (preferencia por 100-170 caracteres).
- Inferencia local en llama.cpp/Ollama y mediante PEFT/Transformers con el adaptador.
- Soporte de la plantilla ChatML nativa del modelo base.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking funcional (el autor advierte de fallos con `think: false`).

## Casos de uso

- Roleplay conversacional en local: el modelo esta disenado para sostener personajes en chino con respuestas de longitud uniforme, adecuado para experiencias interactivas de ficcion desplegadas en una GPU de 8 GB.
- Chatbot de entretenimiento en dispositivos de consumo: la version GGUF Q4_K_M de 5,03 GB cabe en GPUs como la RTX 3060 o 4060, permitiendo ejecucion offline sin dependencia de APIs.
- Prototipado de personajes para narrativa interactiva: permite iterar rapidamente sobre voces y tonos de personaje usando el adaptador LoRA sobre el modelo base.
- Pruebas de investigacion sobre ajuste de estilo: sirve como caso de estudio de QLoRA con datos sinteticos y assistant-only loss para experimentos de alineacion de tono.
- Generacion de dialogos de referencia en chino: util para crear corpus de conversaciones con longitud controlada en tareas de evaluacion de modelos conversacionales.
- Demo local con Ollama: el Modelfile documentado permite levantar el modelo con `num_ctx 16384` y temperatura 0,85 para pruebas de interaccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para la version GGUF Q4_K_M; el autor indica que funciona con 8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, o superiores (A100/H100 no necesarias para este tamano).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM.
- Despliegue: llama.cpp, Ollama (Modelfile documentado), PEFT/Transformers con el adaptador LoRA.
- Latencia y throughput: no disponibles.
- Nota del autor: con 16 GB o mas de VRAM recomienda su variante de 27B (`don0ox1/AEON-27B-RP-cn-abliterated`), de mayor calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-Roleplay-CN-v7 | 8,19 B | no disponible | LoRA + GGUF Q4_K_M | Apache 2.0 | Ajuste de rol en chino, local |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | safetensors BF16 | Apache 2.0 | Modelo generalista sin ajuste de rol |
| don0ox1/AEON-27B-RP-cn-abliterated | no disponible | no disponible | GGUF Q3_K_M (13,35 GB) | no disponible | Variante 27B del mismo autor, requiere 16 GB+ |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo con otras alternativas de roleplay en chino.

## Limitaciones y advertencias

- En contextos superiores a 2000 tokens, el modelo puede escribir el contenido en el canal `thinking` y dejar `content` vacio; hay que revisar ese campo ante respuestas en blanco.
- El modelo prefiere respuestas de 100-170 caracteres y tiende a repetir si se le fuerza fuera de ese rango.
- Pasar `think: false` en inferencia provoca que solo emita `` y se detenga; el autor recomienda no usar ese parametro o emplear `think: true`.
- Los datos de entrenamiento son mayoritariamente de roleplay para adultos y no se aplico alineacion de seguridad de contenido.
- El modelo esta orientado al chino; el soporte de otros idiomas no esta documentado.
- Los datos de entrenamiento son sinteticos, lo que puede introducir sesgos y artefactos de estilo de los modelos generadores.
- Licencia Apache 2.0, pero se debe conservar la atribucion de Qwen3-8B y senalar que es una version ajustada.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/don0ox1/Qwen3-8B-Roleplay-CN-v7
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante 27B del autor: https://huggingface.co/don0ox1/AEON-27B-RP-cn-abliterated
