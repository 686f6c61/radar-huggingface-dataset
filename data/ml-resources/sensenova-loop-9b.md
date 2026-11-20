# ml-resources/SenseNova-Loop-9B

## Resumen

SenseNova-Loop-9B es un modelo multimodal de generacion de texto (pipeline image-text-to-text) desarrollado por SenseNova y distribuido en este repositorio como espejo no oficial bajo el identificador `ml-resources/SenseNova-Loop-9B`. Su propuesta central es la eficiencia parametrica: mediante una arquitectura de transformer con bucles (looped transformer), reutiliza los pesos de un bloque central de capas para ejecutar mas computo del que corresponderia a su numero de parametros. Con aproximadamente 9.412 millones de parametros totales, transforma 32 capas fisicas del decodificador en 56 ejecuciones de capa por pase forward.

El modelo incorpora dos innovaciones arquitectonicas destacadas: un bloque compartido que se ejecuta dos veces de forma secuencial (24 capas del medio se ejecutan dos veces) y conexiones hiperbolicas restringidas a una variedad (manifold-constrained hyper-connections, mHC) de dos flujos que enrutan y combinan informacion entre dos corrientes residuales. Ademas, intercala atencion lineal y atencion completa en un patron repetido de cuatro capas, y extiende el contexto de entrenamiento hasta 512K tokens con datos de texto, imagenes, codigo y trayectorias de uso de herramientas.

Es relevante ahora porque ofrece un perfil de despliegue muy contenido para un modelo multimodal de 9B: con pesos de 4 bits y cache KV de 8 bits, la inferencia multimodal a 256K de contexto requiere aproximadamente 15 GiB de VRAM. La version oficial incluye pesos cuantizados AWQ de 4 bits y GGUF desde el dia de lanzamiento, y el modelo se posiciona como competitivo con modelos notablemente mayores en tareas agenticas y de analisis de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con bucles (looped transformer), bloque compartido ejecutado dos veces, mHC de dos flujos, atencion hibrida lineal/completa en patron de cuatro capas |
| Parametros totales | 9.412.963.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K tokens (entrenamiento); inferencia multimodal validada a 256K |
| Tipos de cuantizacion | AWQ 4 bits oficial, GGUF; pesos originales en safetensors |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, AWQ, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con una modificacion estructural clave: en lugar de apilar 56 capas independientes, define 32 capas fisicas y reutiliza un bloque central de 24 capas que se ejecuta dos veces de forma secuencial, produciendo 56 ejecuciones de capa por pase forward. Sobre ese bloque actua el mecanismo mHC de dos flujos, que aprende mapeos para enrutar y combinar informacion entre dos corrientes residuales mediante operaciones de mezcla de residuales multi-flujo con matrices doblemente estocasticas. El decodificador intercala atencion lineal y atencion completa siguiendo un patron repetido de cuatro capas, lo que reduce el coste de atencion en contextos largos.

La receta de entrenamiento combina texto, imagenes, codigo y trayectorias de uso de herramientas, con la longitud de contexto extendida hasta 512K tokens. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. La version publicada mejora a la Preview en las siete evaluaciones reportadas, con incrementos notables en tareas agenticas (AutomationBench pasa de 14,33 a 36,67).

## Capacidades

- Generacion de texto y razonamiento multi-paso, con soporte de contexto largo hasta 512K tokens en entrenamiento.
- Comprension de imagenes y generacion de texto a partir de entradas image-text (pipeline image-text-to-text).
- Generacion de codigo y tareas de analisis de datos, evaluadas en benchmarks especificos (NL2Repo, AIDABench).
- Uso de herramientas (tool use) y tareas agenticas, con entrenamiento sobre trayectorias de uso de herramientas.
- Capacidades de creacion web y visual: la model card muestra ejemplos de escenas 3D, SVG, webs interactivas, posters animados y diseno editorial.
- Multilingue limitado a ingles y chino.
- Soporte de cuantizacion oficial AWQ 4 bits y GGUF para despliegue con bajo consumo de memoria.

## Casos de uso

- Analisis de datos asistido: el modelo puede interpretar tablas y graficos aportados como imagen junto con instrucciones en texto, y razonar sobre ellos en varios pasos; su evaluacion en AIDABench (65,31) lo situa como opcion realista para asistentes de analisis.
- Generacion de codigo en pipelines de desarrollo: con soporte de tool use y contexto de 512K, puede integrarse en flujos que requieran leer repositorios completos o documentacion extensa antes de proponer cambios.
- Agentes automatizados de tareas: su rendimiento en AutomationBench (36,67) y el entrenamiento sobre trayectorias de herramientas lo hacen adecuado para agentes que encadenan llamadas a APIs y acciones multi-paso.
- Atencion al cliente multimodal: admite capturas de pantalla o fotos de producto junto a la consulta del usuario, manteniendo conversaciones multi-turno con contexto largo.
- Generacion de interfaces y contenido web: los ejemplos de la model card (webs interactivas, SVG, escenas 3D) indican uso para prototipado rapido de front-end y contenido visual a partir de descripciones.
- Despliegue en hardware limitado: con AWQ 4 bits y cache KV de 8 bits, la inferencia multimodal a 256K de contexto cabe en aproximadamente 15 GiB de VRAM, lo que permite servir el modelo en una unica GPU de gama alta de consumo o profesional.
- Procesamiento de documentos largos con imagenes: informes, contratos o manuales con figuras y tablas, aprovechando la ventana de contexto extendida.

## Benchmarks y rendimiento

Los unicos datos numericos publicados en la informacion disponible son los siguientes:

| Benchmark | SenseNova-Loop-9B | Modelo de referencia | Referencia |
|---|---|---|---|
| NL2Repo | 41,36 | 44,60 | Qwen3.8-27B |
| AIDABench | 65,31 | 65,01 | Qwen3.8-27B |
| AutomationBench | 36,67 | no disponible | Preview: 14,33 |

La model card indica que la version publicada supera a la Preview en las siete evaluaciones mostradas, pero solo se detallan numericamente AutomationBench y los dos benchmarks anteriores. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GiB para inferencia multimodal con pesos de 4 bits y cache KV de 8 bits a 256K de contexto (dato del autor).
- En precision completa (safetensors, ~19,4 GB de repo), se requiere al menos una GPU con 24 GB de VRAM para inferencia basica; para contexto largo en precision completa la demanda crece de forma significativa.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo a 512K en precision alta; RTX 4090 (24 GB) es viable con cuantizacion AWQ 4 bits para contextos moderados.
- Cabe en GPU de consumo con la version AWQ 4 bits o GGUF, especialmente en tarjetas de 16-24 GB.
- Opciones de despliegue: transformers (libreria nativa, requiere `custom_code`), llama.cpp u Ollama mediante los pesos GGUF oficiales, y servidores compatibles con AWQ para la version cuantizada. No se confirma soporte de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NL2Repo | AIDABench | Licencia |
|---|---|---|---|---|---|
| SenseNova-Loop-9B | ~9,4B | 512K | 41,36 | 65,31 | Apache-2.0 |
| Qwen3.8-27B | 27B (segun denominacion) | no disponible | 44,60 | 65,01 | no disponible |
| SenseNova-Loop-9B-Preview | ~9B (version previa) | no disponible | no disponible | no disponible | Apache-2.0 |

La comparativa se limita a los datos publicados por el autor. No se dispone de informacion sobre otros modelos multimodales de tamano similar (por ejemplo, alternativas de la familia Qwen-VL o InternVL) en la informacion proporcionada, por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion: no se reportan tasas de alucinacion ni evaluaciones de fidelidad; como en cualquier modelo generativo, es esperable en tareas de analisis de datos y generacion de codigo.
- Sesgos: la model card no documenta evaluaciones de sesgo, toxicidad ni alineacion.
- Contexto: aunque el entrenamiento alcanza 512K tokens, la validacion de inferencia multimodal reportada es a 256K; el rendimiento mas alla de esa longitud no esta confirmado.
- Licencia Apache-2.0: permite uso comercial, pero este repositorio es un espejo no oficial; para produccion conviene verificar los pesos contra el repositorio original de SenseNova.
- Requiere `trust_remote_code` al usar transformers por el codigo de arquitectura personalizado (`sensenova_loop`), lo que implica ejecutar codigo del autor.
- No se documentan limitaciones especificas de la atencion lineal en tareas de recuperacion exacta sobre contextos muy largos.
- El modelo se publico en noviembre de 2026 y el repositorio espejo no registra descargas ni interacciones, por lo que el soporte de la comunidad es practicamente inexistente en este identificador.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/ml-resources/SenseNova-Loop-9B
- Repositorio original: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Version Preview: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Pesos AWQ: https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- Pesos GGUF: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- ModelScope: https://modelscope.cn/models/sensenova/SenseNova-Loop-9B
- ModelScope Preview: https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- Repositorio GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Discord: https://discord.com/invite/BuTXPHmQub
