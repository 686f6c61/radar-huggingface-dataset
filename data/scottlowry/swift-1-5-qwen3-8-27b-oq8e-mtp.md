# scottlowry/Swift-1.5-Qwen3.8-27b-oQ8e-mtp

## Resumen

Swift-1.5-Qwen3.8-27b-oQ8e-mtp es una version cuantizada del modelo ukisai/Swift-1.5-Qwen3.8-27b, publicada por el usuario scottlowry. Se trata de un artefacto derivado: no es un entrenamiento nuevo, sino una conversion a cuantizacion mixta de 8 bits realizada con la herramienta oQ (oMLX v0.7.0) y empaquetada en formato MLX safetensors. El objetivo es poder ejecutar un modelo de aproximadamente 27.781 millones de parametros en hardware de Apple Silicon (Mac con memoria unificada) reduciendo el peso del checkpoint a unos 30 GB de repositorio.

El modelo base pertenece a la familia qwen3_5 y esta vinculado a Swift-1.5, un linaje de ajuste fino sobre Qwen3, segun la nomenclatura del propio identificador. La quantizacion emplea 8 bits con group size 64 y formato MLX safetensors, lo que lo hace compatible con el stack mlx / mlx-lm pensado para chips M-series. El sufijo "mtp" del nombre no aparece documentado en la model card, por lo que su significado concreto (posiblemente multi-token prediction u otra variante) no puede confirmarse con la informacion disponible.

Su relevancia es fundamentalmente practica: permite desplegar localmente en un Mac un modelo de ~28B en 8 bits sin depender de GPUs NVIDIA ni de servicios en la nube. Al no haber resultados de benchmarks publicados ni datos de entrenamiento en la informacion proporcionada, la evaluacion debe centrarse en su base subyacente y en la fidelidad de la cuantizacion respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer tipo qwen3_5 (segun tag del repositorio; detalles no disponibles) |
| Parametros totales | 27.781.427.952 (~27,78B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, cuantizacion mixta (oQ), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Tamano del repositorio | 30,0 GB |
| Libreria | mlx |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b |
| Herramienta de cuantizacion | oQ / oMLX v0.7.0 |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo base ni sobre el proceso de cuantizacion mas alla de los parametros declarados. El repositorio no documenta numero de tokens, composicion del dataset, fases de RLHF/DPO ni innovaciones de arquitectura. La unica informacion tecnica es que el modelo deriva de ukisai/Swift-1.5-Qwen3.8-27b, que responde al tipo declarado qwen3_5, y que ha sido procesado con oQ (oMLX v0.7.0).

La innovacion tecnica relevante en este artefacto concreto es la cuantizacion mixta de precision a 8 bits con group size 64 en formato MLX safetensors. Este esquema busca preservar la calidad del modelo en capas sensibles mientras reduce el espacio en disco y la memoria necesaria para inferencia en Apple Silicon. No se documenta si el sufijo "mtp" implica prediccion multi-token, decodificacion especulativa u otra tecnica; se indica como no disponible.

## Capacidades

- Generacion de texto: heredada del modelo base; no verificada de forma independiente en esta version cuantizada.
- Razonamiento: no disponible (sin benchmarks ni evaluaciones publicadas).
- Codigo y matematicas: no disponible (sin evaluaciones publicadas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Ejecucion local en Apple Silicon: capacidad confirmada por el formato MLX y la libreria declarada.

## Casos de uso

- Inferencia local en Mac: ejecutar un modelo de ~28B en 8 bits mediante MLX en un Mac con memoria unificada suficiente, evitando GPUs dedicadas y servicios en la nube. Adecuado para desarrolladores que trabajan en entornos Apple y quieren privacidad de datos.
- Prototipado offline: usar el modelo en cuadernos o scripts locales para experimentar con generacion de texto sin coste por token, gracias al formato MLX safetensors y su integracion con mlx-lm.
- Asistente de escritorio privado: integrarlo en aplicaciones de escritorio para Mac donde la inferencia ocurre en el propio equipo, sin enviar datos a terceros.
- Evaluacion comparativa de cuantizacion: servir como artefacto de referencia para medir la perdida de calidad de una cuantizacion oQ de 8 bits frente al modelo base ukisai/Swift-1.5-Qwen3.8-27b.
- Reproduccion de experimentos: al estar derivado de un modelo base concreto, permite reproducir experimentos sobre ese linaje de ajuste fino en hardware Apple.
- Desarrollo de pipelines MLX: punto de partida para construir herramientas de generacion de texto sobre el stack MLX, aprovechando que el repositorio ya esta en ese formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: al tratarse de un checkpoint de 8 bits con un repositorio de 30,0 GB, se necesita un Mac con al menos 32 GB de memoria unificada para una ejecucion ajustada; se recomienda 48-64 GB para mayor margen y contexto amplio.
- GPU: este artefacto esta orientado a Apple Silicon (chips M-series) mediante MLX. No esta pensado para GPUs NVIDIA (A100, H100, RTX 4090) porque el formato MLX safetensors no es compatible directamente con CUDA.
- Cabe en consumer GPU: no aplica en el sentido clasico (GPU de escritorio NVIDIA). El equivalente consumer es un Mac con memoria unificada; encaja en equipos de gama alta con 32 GB o mas.
- Opciones de despliegue: stack MLX (mlx, mlx-lm); otras herramientas no estan confirmadas en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| scottlowry/Swift-1.5-Qwen3.8-27b-oQ8e-mtp | ~27,78B | no disponible | MLX safetensors (8 bits) | no disponible | Version cuantizada oQ |
| ukisai/Swift-1.5-Qwen3.8-27b | no disponible | no disponible | no disponible | no disponible | Modelo base del anterior |
| Alternativas de ~28B equivalentes | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Artefacto derivado: es una cuantizacion, no un modelo entrenado; su calidad depende del modelo base y del esquema de cuantizacion aplicado.
- Perdida de precision: la cuantizacion de 8 bits puede degradar ligeramente la calidad respecto al modelo original; no se han publicado mediciones.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado para esta version.
- Idiomas y contexto: no declarados; no puede asumirse soporte multilingue ni una longitud de contexto concreta.
- Licencia: no disponible, por lo que el uso comercial queda sin clarificar. Debe verificarse la licencia del modelo base antes de cualquier despliegue productivo.
- Compatibilidad de plataforma: al estar en formato MLX safetensors, su uso esta limitado a Apple Silicon; no es portable directamente a vLLM, TGI, llama.cpp u Ollama sin conversion.
- Adopcion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Documentacion escasa: la model card no detalla dataset, contexto ni el significado del sufijo "mtp".

## Enlaces

- HuggingFace: https://huggingface.co/scottlowry/Swift-1.5-Qwen3.8-27b-oQ8e-mtp
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
