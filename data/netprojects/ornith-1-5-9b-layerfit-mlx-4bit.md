# netprojects/Ornith-1.5-9B-LayerFit-MLX-4bit

## Resumen

Ornith-1.5-9B-LayerFit-MLX-4bit es una cuantizacion en 4 bits del modelo Ornith-1.5-9B, desarrollado por el equipo Ornith (ornith-ai), un modelo de 9B parametros orientado a tareas de codigo y agentes. Esta version concreta la publica netprojects (Paris Michalas) y esta pensada para ejecutarse en Apple Silicon mediante la libreria MLX y mlx-vlm, con soporte tanto de entrada de texto como de imagen.

La innovacion principal de esta build es LayerFit, una tecnica de cuantizacion por capas que distribuye el presupuesto de bits de forma no uniforme: mide la sensibilidad de cada componente (atencion, bloques de atencion lineal, MLP de cada capa, embeddings y cabeza de salida) y asigna mas precision donde mas afecta a la calidad. El resultado es un modelo de 5,9 GB en disco que, segun el autor, se acerca mas al modelo original en bf16 que una cuantizacion estandar de 4 bits del mismo tamano.

Es relevante porque permite ejecutar un modelo de codigo y agentes de 9B en un Mac con 16 GB de memoria unificada, manteniendo modo de razonamiento (thinking) y entrada multimodal de imagen. La licencia es MIT, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal (qwen3_5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (LayerFit); existe build de 3 bits del mismo autor |
| Idiomas soportados | no disponible (el harness de evaluacion usa pasajes en varios idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, 4 bits) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B emplea una arquitectura transformer con etiqueta qwen3_5 en los metadatos, que combina atencion estandar con bloques de atencion lineal, y admite entrada de imagen ademas de texto (pipeline image-text-to-text). El modelo tiene 9.409.813.744 parametros totales y esta orientado a codigo y agentes. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion tecnica de esta build es LayerFit, un proceso de cuantizacion por capas que sustituye la asignacion uniforme de bits por una busqueda que mide la degradacion de cada bloque a baja precision y coloca los bits donde mas ayudan dentro del mismo presupuesto de tamano. Segun la model card, frente a una cuantizacion estandar de 4 bits, LayerFit 4 bits alcanza un 90,0 % de acuerdo Top-1 con bf16 (frente al 87,6 %) y reduce el error KL a 0,0628, un 38 % menos. La receta exacta se publica en `layerfit-recipe.json`. El modelo conserva el modo de razonamiento del original, con bloques `` activados por defecto.

## Capacidades

- Generacion de texto y razonamiento con modo thinking por defecto (``).
- Generacion y edicion de codigo, con orientacion explicita a tareas de coding y agentes.
- Entrada multimodal de imagen ademas de texto (image-text-to-text).
- Soporte de agentes y razonamiento multi-paso, segun la orientacion del modelo base.
- Servidor compatible con la API de OpenAI mediante `mlx_vlm.server`, apto para agentes de codigo.
- Capacidades multilingues: no documentadas de forma explicita; el harness de evaluacion usa pasajes en varios idiomas.
- Tool calling / function calling: no documentado en la informacion disponible.

## Casos de uso

- Asistente de codigo en local en un Mac: ejecutar el modelo con mlx-vlm para autocompletar, explicar y refactorizar codigo sin enviar datos a la nube, aprovechando que cabe en 16 GB de memoria unificada.
- Agentes de codigo en el escritorio: levantar el servidor OpenAI-compatible con `mlx_vlm.server` y conectarlo a herramientas de agente (por ejemplo, editores o CLIs) para tareas multi-paso de modificacion de repositorios.
- Resolucion de issues y tareas de ingenieria: usar el modelo para abordar problemas tipo SWE-bench (el original reporta 70,6 en SWE-bench Verified con OpenHands), integrandolo en flujos de trabajo de desarrollo asistido.
- Revision de capturas y diagramas: al aceptar imagen, el modelo puede analizar mockups, diagramas de arquitectura o capturas de errores y proponer codigo o diagnosticos.
- Prototipado rapido de scripts: generar funciones y utilidades (por ejemplo, comprobacion de palindromos, parsing, transformaciones) con muestreo recomendado para codigo (temperatura 0,6, top_p 0,95, top_k 20).
- Entornos con requisitos de privacidad: al ejecutarse integramente en local con licencia MIT, encaja en escenarios donde no se permite enviar codigo propietario a APIs externas.
- Desarrollo en portatiles Apple Silicon: usar la build de 3 bits (4,8 GB) en equipos con 8-16 GB o la de 4 bits (5,9 GB) en equipos con 16 GB para tareas de codigo en movilidad.

## Benchmarks y rendimiento

Resultados publicados por el autor de la cuantizacion (LayerFit frente a cuantizacion estandar de 4 bits, mismo tamano):

| Prueba | Estandar 4 bits | LayerFit 4 bits |
|---|---|---|
| Acuerdo Top-1 con bf16 | 87,6 % | 90,0 % |
| Error KL | 0,1006 | 0,0628 (-38 %) |
| GSM8K (20) | 19/20 | 17/20 |

Resultados del modelo base Ornith-1.5-9B en precision completa, publicados por el equipo Ornith:

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified (OpenHands) | 70,6 |
| Terminal-Bench 2.1 (Terminus-2) | 46,2 |
| SWE-bench Pro | 47,5 |
| NL2Repo | 32,4 |

Las mediciones de LayerFit se realizaron en un MacBook Pro M5 Max el 28 de noviembre de 2026, comparando contra la conversion bf16 en MLX del autor, con GSM8K en modo thinking desactivado.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 5,9 GB en disco para la build de 4 bits; se sugiere un Mac con 16 GB de memoria unificada. La build de 3 bits ocupa 4,8 GB y se recomienda para 8 GB (ajustado) o 16 GB.
- GPU: disenado para Apple Silicon (probado en MacBook Pro M5 Max). No esta pensado para GPU NVIDIA.
- Cabe en equipos de consumo: si, en Macs con memoria unificada de 16 GB (build de 4 bits) o 8-16 GB (build de 3 bits).
- Despliegue: mlx-vlm (`mlx_vlm.generate`) y servidor OpenAI-compatible (`mlx_vlm.server`). Probado con mlx-vlm 0.7.11. No aplica vLLM, llama.cpp, Ollama ni TGI para este formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Orientacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-9B-LayerFit-MLX-4bit | 9,4B | no disponible | Codigo y agentes, multimodal, Apple Silicon | MIT | Hugging Face (MLX) |
| Ornith-1.5-9B (base, bf16) | 9,4B | no disponible | Codigo y agentes, multimodal | MIT | Hugging Face |
| Ornith-1.5-9B-LayerFit-MLX-3bit | 9,4B | no disponible | Codigo y agentes, multimodal, Apple Silicon | MIT | Hugging Face (MLX) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion respecto a bf16: el acuerdo Top-1 es del 90,0 % y el GSM8K baja a 17/20 frente a 19/20 en la cuantizacion estandar, por lo que puede fallar en tareas sensibles a precision.
- El modelo base es de 9B parametros; es esperable riesgo de alucinacion en codigo y en afirmaciones factuales, aunque no se cuantifica en la informacion disponible.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que limita la evaluacion de riesgos.
- Longitud de contexto e idiomas soportados no estan disponibles; conviene validarlos antes de usarlo en produccion con contextos largos.
- Formato exclusivo MLX: no es desplegable directamente en vLLM, llama.cpp, Ollama o TGI; requiere Apple Silicon.
- Rendimiento medido en un unico equipo (MacBook Pro M5 Max); el rendimiento en otros chips puede variar.
- Aunque la licencia es MIT y permite uso comercial, el autor indica que no esta afiliado al equipo Ornith ni a DeepReinforce; LayerFit es marca registrada de NetProjects.
- El modelo piensa por defecto (`
