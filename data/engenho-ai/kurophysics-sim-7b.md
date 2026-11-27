# engenho-ai/KuroPhysics-Sim-7B

## Resumen

KuroPhysics-Sim-7B es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-7B-Instruct desarrollado por Engenho AI dentro de su "Linha Kuro". Está especializado en física 3D aplicada, cinemática, dinámica de cuerpos rígidos y simulación robótica, con soporte explícito para formatos URDF/MJCF y motores de simulación como PyBullet y MuJoCo. El modelo parte de una base conversacional consolidada (Qwen2.5-7B-Instruct) y la orienta hacia tareas técnicas de simulación y robótica.

El modelo cuenta con 7.615.616.512 parámetros en formato safetensors y un repositorio de 15,2 GB. Se distribuye también en formato GGUF (aproximadamente 4,4 GB de VRAM según la model card), lo que facilita su despliegue en hardware de consumo. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales significativas.

Su relevancia radica en la especialización vertical: en lugar de competir como modelo generalista, se posiciona como asistente técnico para ingenieros e investigadores que trabajan con descripciones de robots, modelos físicos y pipelines de simulación. El soporte declarado de portugués e inglés lo orienta a un público lusófono y angloparlante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | GGUF (cuantizacion concreta no especificada); pesos safetensors en precision original |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en la arquitectura Qwen2, con 7.615.616.512 parametros, obtenido mediante fine-tuning supervisado sobre Qwen/Qwen2.5-7B-Instruct. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el ajuste. Tampoco se especifican innovaciones tecnicas propias como decodificacion especulativa o mecanismos de atencion alternativos.

La especializacion declarada abarca fisica 3D aplicada, cinematica, dinamica de cuerpos rigidos y simulacion robotica, con mencion explicita a URDF/MJCF, PyBullet y MuJoCo. No se han publicado detalles sobre el corpus utilizado para el ajuste (por ejemplo, si incluye documentacion de MuJoCo, ejemplos de URDF, trazas de simulacion o pares instruccion-respuesta generados sinteticamente). Esta ausencia de informacion sobre el proceso de entrenamiento limita la evaluacion de la robustez y la cobertura real del ajuste.

## Capacidades

- Generacion de texto conversacional en portugues e ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento tecnico sobre fisica 3D aplicada: cinematica directa e inversa, dinamica de cuerpos rigidos, calculo de trayectorias y fuerzas.
- Trabajo con descripciones de robots en formatos URDF y MJCF, segun la model card.
- Soporte declarado de motores de simulacion PyBullet y MuJoCo para generar o interpretar codigo de simulacion.
- Capacidad de generar codigo Python orientado a simulacion robotica (no confirmado explicitamente en la model card, pero coherente con el dominio declarado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.
- Capacidades multilingues limitadas a portugues e ingles segun los metadatos.

## Casos de uso

- Generacion y depuracion de ficheros URDF/MJCF: el modelo puede redactar descripciones de robots (articulaciones, eslabones, limites, inercias) y revisar ficheros existentes para detectar errores estructurales, aprovechando su especializacion declarada en estos formatos.
- Asistencia en scripting de MuJoCo y PyBullet: generacion de codigo de simulacion para cargar modelos, definir controladores y ejecutar escenarios de prueba, reduciendo el tiempo de prototipado de entornos roboticos.
- Calculo y explicacion de cinematica y dinamica: resolucion de problemas de cinematica directa/inversa y dinamica de cuerpos rigidos con explicaciones paso a paso, util para docencia tecnica y validacion de resultados.
- Documentacion tecnica de pipelines de simulacion: redaccion de manuales, comentarios de codigo y guias de integracion para equipos de robotica, en portugues o ingles.
- Soporte a investigadores en prototipado rapido: consultas sobre parametros fisicos, configuracion de motores de simulacion y comparacion de enfoques de modelado antes de implementar en codigo.
- Formacion interna de equipos de robotica: asistente conversacional que responde dudas sobre formatos de descripcion de robots y motores de simulacion, con contexto tecnico especializado en lugar de respuestas genericas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,4 GB en formato GGUF segun la model card; en precision completa (safetensors, ~15,2 GB de repositorio) se requiere un minimo practico de 16 GB de VRAM para inferencia en FP16/BF16.
- GPU recomendadas: para GGUF, GPUs de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070); para precision completa, RTX 4090 (24 GB), A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: si, en cuantizacion GGUF en GPUs con 6 GB o mas; en precision completa requiere GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM, TGI o Transformers para safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KuroPhysics-Sim-7B | 7,6 B | no disponible | Fisica 3D, robotica, URDF/MJCF, MuJoCo/PyBullet | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens (segun modelo base) | Generalista conversacional | Apache 2.0 | Hugging Face (ampliamente adoptado) |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens (segun modelo base) | Generacion de codigo | Apache 2.0 | Hugging Face |

La comparativa se limita al modelo base y a variantes del mismo linaje, ya que no se dispone de datos de rendimiento del ajuste que permitan contrastarlo con especialistas en robotica de otros autores. El dato de contexto de Qwen2.5-7B-Instruct corresponde al modelo base y no se confirma para este fine-tuning.

## Limitaciones y advertencias

- No se han publicado benchmarks que validen la calidad del ajuste en tareas de fisica o robotica; el rendimiento real es desconocido.
- Riesgo de alucinacion en parametros fisicos, valores de inercia, limites de articulaciones o APIs de MuJoCo/PyBullet: el modelo puede generar valores plausibles pero incorrectos, por lo que toda salida debe validarse en simulacion.
- Cobertura limitada a portugues e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no confirmada para este ajuste; no asumir la ventana del modelo base sin verificacion.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ausencia de validacion por parte de la comunidad.
- La model card es muy escueta y no documenta el dataset de entrenamiento, lo que dificulta evaluar sesgos y cobertura.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen2.5-7B-Instruct y citar adecuadamente la procedencia.
- Para produccion, conviene fijar versiones del modelo y de los motores de simulacion, y establecer pruebas automatizadas que verifiquen la correccion de los artefactos generados (URDF, MJCF, scripts).

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroPhysics-Sim-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de MuJoCo: https://mujoco.readthedocs.io
- Documentacion de PyBullet: https://pybullet.org
- Especificacion URDF: https://wiki.ros.org/urdf
- Formato MJCF: https://mujoco.readthedocs.io/en/stable/XMLreference.html
