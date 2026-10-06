# morriszjm/Tacit-1.7B

## Resumen

Tacit-1.7B es un modelo de lenguaje especializado en toma de decisiones con tipado, desarrollado por Jiamu "Morris" Zhang (usuario morriszjm en HuggingFace). El modelo no genera texto libre como objetivo principal: en una única pasada hacia delante (single forward pass) devuelve una distribución de probabilidad sobre un conjunto cerrado de opciones, lo que permite elegir entre alternativas, responder sí/no o seleccionar un nivel ordenado. Se construye sobre Qwen/Qwen3-1.7B, un transformer decoder-only denso de aproximadamente 1.720 millones de parametros.

La innovacion principal es el metodo de auto-destilacion AnyJev: el propio modelo base genero sus propios problemas de decision, los respondio activando su razonamiento interno y despues aprendio a dar esas mismas respuestas en una sola pasada, sin utilizar etiquetas humanas, conjuntos de datos externos ni otros modelos. El resultado es una mejora medible en precision de decision con un coste de inferencia muy inferior al de un razonamiento extendido.

Se trata de una version "preview" publicada bajo licencia Apache-2.0, la misma que el modelo base de Qwen, lo que facilita su uso comercial. Es relevante ahora porque demuestra que un modelo de 1.7B puede superar a su propio modelo base en tareas de decision estructurada y porque reduce drasticamente el coste frente a enfoques que activan cadenas de razonamiento largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen/Qwen3-1.7B (no se detalla en la model card) |
| Parametros totales | 1.720.574.976 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3.5 GB |
| Modelo base | Qwen/Qwen3-1.7B |
| Biblioteca | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen/Qwen3-1.7B, un transformer decoder-only denso de 1.720 millones de parametros. Sobre esa base se aplica un proceso de auto-destilacion denominado AnyJev: el modelo base formulo por si mismo los problemas de decision, los resolvio con su razonamiento activado y aprendio despues a reproducir esas respuestas en una unica pasada hacia delante, devolviendo una probabilidad sobre las opciones disponibles. No se emplearon etiquetas humanas, conjuntos de datos externos ni modelos auxiliares en el proceso.

La innovacion tecnica destacable es el paso de un razonamiento explicito (que consume muchos tokens y latencia) a una decision directa en un solo forward pass, manteniendo o mejorando la precision. La model card no detalla el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO.

## Capacidades

- Toma de decisiones con tipado: elegir una opcion entre varias, responder afirmativa o negativamente y seleccionar un nivel dentro de un orden.
- Salida como distribucion de probabilidad sobre las opciones, lo que permite calibrar la confianza de la decision.
- Decision en una sola pasada hacia delante, sin cadena de razonamiento explicita.
- Generacion de texto (pipeline text-generation en HuggingFace), aunque el proposito declarado es la decision.
- Compatibilidad con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, vision, audio): no documentadas.

## Casos de uso

- Enrutamiento de consultas en atencion al cliente: el modelo puede clasificar una peticion entrante entre un conjunto fijo de categorias (facturacion, soporte tecnico, reclamacion) devolviendo una probabilidad por categoria, lo que permite activar el flujo adecuado con un umbral de confianza.
- Moderacion de contenido binaria: dado un texto, responder si/no a si infringe una politica concreta, en una sola pasada y con coste de hardware minimo.
- Clasificacion de tickets por prioridad: asignar un nivel ordenado (baja, media, alta, critica) a incidencias en un sistema de soporte, aprovechando la capacidad de seleccionar niveles ordenados.
- Encaminamiento de decisiones en pipelines de agentes: actuar como arbitro que elige la siguiente herramienta o accion entre un conjunto de opciones antes de invocar a un modelo mayor, reduciendo coste y latencia.
- Filtrado previo en sistemas RAG: decidir si una pregunta requiere recuperacion de documentos o puede responderse directamente, con una unica inferencia.
- Triaje en entornos con recursos limitados: al ser un modelo de 1.7B ejecutable en CPU o GPU de consumo, puede desplegarse en el borde o en portatiles para decisiones rapidas sin conexion a la nube.
- Validacion de formularios y respuestas estructuradas: comprobar si una entrada cumple un criterio (por ejemplo, si un campo es coherente con otro) respondiendo con una probabilidad de si/no.

## Benchmarks y rendimiento

Resultados de precision en una sola pasada hacia delante, con el mismo prompt y el mismo mecanismo de lectura para ambos modelos, segun la model card:

| Benchmark | Qwen3-1.7B | Tacit-1.7B | Diferencia |
|---|---|---|---|
| JevBench (conjunto publico, 231) | 0.554 | 0.623 | +6,9 puntos |
| bev-decision (test split, 46.320) | 0.566 | 0.598 | +3,1 puntos |

## Requisitos de hardware

- VRAM estimada para inferencia: en precision FP16 el modelo requiere aproximadamente 3,4 GB solo para los pesos (1.720 millones de parametros); en cuantizacion INT8, en torno a 1,7 GB; en INT4, alrededor de 0,9 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados en la model card.
- GPU recomendadas: al tratarse de un modelo de 1.7B, cabe en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, asi como en GPUs de centro de datos (A100, H100) sin necesidad de paralelizar.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM para FP16 y menos para cuantizaciones INT8/INT4.
- Opciones de despliegue: compatible con transformers; las etiquetas del repositorio indican compatibilidad con text-generation-inference y endpoints compatibles. No se confirma soporte para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles. La propuesta del modelo (decision en una sola pasada hacia delante) implica una latencia mucho menor que un modelo que activa cadenas de razonamiento largas, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado en JevBench | Resultado en bev-decision |
|---|---|---|---|---|---|
| Tacit-1.7B | 1.720.574.976 | no disponible | Apache-2.0 | 0.623 | 0.598 |
| Qwen/Qwen3-1.7B (base) | 1.720.574.976 | no disponible | Apache-2.0 | 0.554 | 0.566 |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (decision estructurada de un solo paso) en la documentacion facilitada.

## Limitaciones y advertencias

- Se trata de una version "preview", por lo que su estabilidad y comportamiento en produccion no estan garantizados.
- Sesgos conocidos: no documentados en la model card. Al derivar del modelo base Qwen3-1.7B, podria heredar los sesgos de este, pero no se aporta informacion al respecto.
- Riesgo de alucinacion: el modelo devuelve una distribucion de probabilidad sobre opciones cerradas, lo que reduce el riesgo de texto inventado, pero la calibracion de dichas probabilidades no esta documentada.
- Limitaciones de contexto e idioma: no disponibles. No se especifica la longitud de contexto soportada ni los idiomas cubiertos.
- Restricciones de licencia: licencia Apache-2.0, que permite uso comercial sin restricciones adicionales mas alla de las habituales (mantener avisos de licencia y atribucion).
- Caveat de produccion: no se documentan capacidades de tool calling, agentes ni rendimiento en tareas de generacion abierta, por lo que su uso deberia limitarse a decisiones estructuradas hasta validacion adicional.
- No se especifican requisitos de hardware oficiales ni cifras de latencia o throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/morriszjm/Tacit-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Perfil del autor: https://huggingface.co/morriszjm/datasets
- Repositorio GitHub citado en la busqueda (Tacit, comunicacion eficiente): https://github.com/TTAWDTT/Tacit
- Articulo sobre agente de codigo con modelo de 1.7B (relacionado, no oficial): https://dev.to/anirudh_shivam/i-built-a-coding-agent-that-runs-on-a-17b-model-219p
