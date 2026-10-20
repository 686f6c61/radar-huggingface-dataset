# c0lorless/GLM-4.6-Derestricted-v3

## Resumen

GLM-4.6-Derestricted-v3 es una versión «abliterated» (sin comportamientos de rechazo) del modelo GLM-4.6 desarrollado por Zhipu AI / Z.ai, publicada por el usuario c0lorless y derivada del trabajo previo de Arli AI. El objetivo declarado es eliminar las respuestas de negativa del modelo original manteniendo su capacidad de razonamiento, mediante una técnica denominada «Norm-Preserving Biprojected Abliteration», que descompone los pesos en magnitud y dirección y elimina el componente de rechazo solo de la dirección, preservando las normas originales de las neuronas.

El modelo base, GLM-4.6, es un transformer disperso de tipo Mixture of Experts con 356.785.898.816 parámetros totales (según los pesos en safetensors del repositorio, 356,8 mil millones) y una ventana de contexto de 200.000 tokens, ampliada desde los 128K de GLM-4.5. Está orientado a tareas agénticas, generación de código, uso de herramientas y razonamiento multi-paso, y el autor del modelo original lo compara con DeepSeek-V3.1-Terminus y Claude Sonnet 4.

La relevancia de esta ficha es doble: por un lado documenta un modelo de gran tamaño con licencia MIT y pesos abiertos; por otro, advierte de que se trata de una modificación comunitaria no oficial que elimina deliberadamente los mecanismos de alineación de seguridad, con las implicaciones legales y de producción que ello conlleva. El repositorio tiene 713,6 GB de tamaño, 0 descargas y 1 like en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture of Experts (clase `glm4_moe`) |
| Parametros totales | 356.785.898.816 (≈356,8 B) |
| Parametros activos | ≈32 B (dato de la familia GLM-4.5/4.6; no verificado en la informacion de este repositorio) |
| Longitud de contexto | 200.000 tokens (ampliacion desde 128K en GLM-4.5) |
| Tipos de cuantizacion | Este repositorio: safetensors en BF16. El autor original (Arli AI) publica variantes FP8, W8A8-INT8 y GPTQ W4A16. No se listan GGUF en la informacion disponible |
| Idiomas soportados | No disponible en la informacion del repositorio; el modelo base GLM-4.6 esta orientado principalmente a ingles y chino |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); tamano del repo 713,6 GB |
| Pipeline | text-generation |
| Modelo base | zai-org/GLM-4.6 (finetune) |
| Etiquetas del autor | abliterated, derestricted, uncensored, unlimited, conversational |
| Temperatura recomendada (modelo base) | 1.0 general; `top_p = 0.95`, `top_k = 40` en tareas de codigo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-4.6 original: un transformer decoder-only con capas de mezcla de expertos (MoE) y atención completa sobre una ventana de 200.000 tokens. No se dispone en la informacion proporcionada del numero de capas, numero de expertos, ratio de activacion ni dimensiones ocultas. Tampoco se detalla la composicion del corpus de preentrenamiento del modelo base (numero de tokens, proporciones de codigo, matematicas y multilingue), ni las etapas de post-entrenamiento (SFT, RLHF/DPO) mas alla de la mencion generica a un informe tecnico de GLM-4.5 (arXiv:2508.06471).

La modificacion respecto al original es un proceso de abliteracion en tres pasos: (1) biproyeccion, refinando la direccion de rechazo para que sea matematicamente ortogonal a direcciones «inocuas»; (2) descomposicion de los pesos en magnitud y direccion; y (3) eliminacion del componente de rechazo unicamente en la direccion, recombinando despues con las magnitudes originales. El autor afirma que este enfoque evita la «tasa de seguridad» (perdida de capacidades asociada a la abliteracion estandar) e incluso puede mejorar el razonamiento al no gastar computo en suprimir respuestas. Estas afirmaciones no van acompanadas de resultados numericos verificables en la informacion disponible. No se especifica cuantos pares de prompts de rechazo se usaron para calcular el vector de rechazo ni que dataset de calibracion se empleo.

## Capacidades

- Generacion de texto conversacional multi-turno con ventanas de hasta 200.000 tokens.
- Razonamiento multi-paso y modo de razonamiento durante la inferencia (thinking), heredado de GLM-4.6.
- Generacion de codigo, con mejoras declaradas por el autor del modelo base en tareas de front-end y en integraciones tipo Claude Code, Cline, Roo Code y Kilo Code.
- Uso de herramientas (tool calling / function calling) durante la inferencia y en flujos agénticos.
- Agentes con busqueda web y planificacion de varios pasos, con integracion en frameworks de agentes.
- Escritura refinada y role-play, segun las notas de la model card del modelo base.
- Capacidades multilingues: no detalladas en la informacion disponible; el modelo base esta enfocado a ingles y chino.
- Ausencia deliberada de comportamientos de rechazo (uncensored), que es la capacidad diferenciadora de esta version.
- No se documentan capacidades de vision, audio ni otras modalidades en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD o en asistentes de IDE (Cline, Roo Code) para autocompletar, refactorizar y generar tests, aprovechando el soporte de tool calling y los 200K tokens de contexto para cargar varios ficheros de un repositorio.
- Refactorizacion de bases de codigo grandes: con 200.000 tokens de ventana se pueden pasar modulos completos junto con las interfaces y los tests, reduciendo la necesidad de trocear el contexto y de perder dependencias entre ficheros.
- Agentes autonomos con busqueda y herramientas: el modelo puede orquestar bucles de planificacion, llamada a APIs y verificacion de resultados, adecuado para tareas de investigacion o automatizacion de back-office donde se encadenan varias acciones.
- Analisis de documentacion tecnica extensa: resumen y extraccion de datos de manuales, contratos o informes de cientos de paginas en una sola pasada, con preguntas de seguimiento sobre el mismo contexto.
- Generacion de contenido creativo sin restricciones de estilo: narrativa, guiones o role-play avanzado donde el autor quiere evitar las negativas del modelo alineado; requiere revision humana por la ausencia de filtros.
- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para medir el efecto de la abliteracion sobre las capacidades cognitivas, comparando sus salidas con las del GLM-4.6 original en la misma bateria de evaluaciones.
- Atencion al cliente automatizada multi-turno: la ventana de 200K permite mantener el historial completo de una conversacion larga junto con la base de conocimiento del producto, aunque en produccion conviene anadir una capa de filtrado externa.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del modelo base menciona la evaluacion en ocho benchmarks publicos que cubren agentes, razonamiento y codigo, y presenta una comparacion grafica con GLM-4.5, DeepSeek-V3.1-Terminus y Claude Sonnet 4, pero los valores no aparecen en el texto proporcionado. La model card de la version derestricted afirma mejoras de razonamiento sin aportar cifras.

| Benchmark | GLM-4.6-Derestricted-v3 | GLM-4.6 (base) | Notas |
|---|---|---|---|
| MMLU | No disponible | No disponible | Sin cifras en la informacion proporcionada |
| HumanEval | No disponible | No disponible | Sin cifras en la informacion proporcionada |
| GSM8K | No disponible | No disponible | Sin cifras en la informacion proporcionada |
| Benchmarks agénticos (8 publicos) | No disponible | Reportados graficamente, sin cifras | Solo se indica mejora frente a GLM-4.5 |

## Requisitos de hardware

- Pesos en BF16: 713,6 GB (tamano real del repositorio). Requiere al menos 8 GPU de 141 GB (H200) o 16 GPU de 80 GB (H100/A100) para residir en VRAM, mas espacio para cache KV.
- Pesos en FP8 / INT8 (≈357 GB): viables en 5-8 GPU de 80 GB con paralelismo tensorial, segun el margen de cache KV y la longitud de contexto.
- Pesos en W4A16 / 4 bits (≈178 GB): 3 GPU de 80 GB o 8 tarjetas de 24 GB (RTX 4090) al limite, con riesgo de offload parcial.
- No cabe en una GPU de consumo individual. En configuracion 4 bits extremadamente ajustada podria ejecutarse con offload a RAM del sistema en un equipo con 256 GB de memoria, con latencia muy alta.
- Cache KV: al operar con 200.000 tokens de contexto, el consumo adicional es significativo y crece linealmente con la longitud de la secuencia; conviene reservar entre un 15 % y un 30 % adicional de VRAM sobre el peso de los pesos.
- Opciones de despliegue: transformers (libreria declarada en el repositorio), vLLM y SGLang son las vias habituales para la familia GLM-4.5/4.6. El soporte de `glm4_moe` en llama.cpp/Ollama no se confirma en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE de 356,8B con ≈32B activos, el coste por token se aproxima al de un modelo denso de 32B, pero el requisito de memoria es el de un modelo de 356,8B.
- Parametros de muestreo recomendados por el autor del modelo base: temperatura 1.0; en codigo, `top_p = 0.95` y `top_k = 40`.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Estado | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4.6-Derestricted-v3 (c0lorless) | 356,8 B | 200K | MIT | Modificacion comunitaria sin alineacion | Pesos abiertos en HuggingFace |
| GLM-4.6 (zai-org) | ≈356,8 B (misma clase `glm4_moe`) | 200K | MIT | Modelo oficial alineado | Pesos abiertos y API en Z.ai |
| GLM-4.6-Derestricted (ArliAI) | ≈356,8 B | 200K | MIT | Abliteracion upstream de la que deriva esta version | Pesos abiertos y variantes cuantizadas |
| DeepSeek-V3.1-Terminus | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Citado por el autor como referencia de rendimiento | API y pesos abiertos (no verificado aqui) |
| Claude Sonnet 4 | No disponible (propietario) | No disponible en la informacion | Propietaria | Citado por el autor como referencia de rendimiento | Solo API |

No se dispone de mediciones propias ni de terceros que permitan comparar rendimiento numerico entre estas opciones dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de alineacion de seguridad: la abliteracion elimina los comportamientos de rechazo, por lo que el modelo puede producir contenido danino, ilegal o sexualmente explicito sin filtros. No es apto para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Afirmaciones no verificadas: la model card sostiene que la tecnica preserva o mejora el razonamiento y evita la «tasa de seguridad», pero no aporta cifras de benchmarks que lo respalden.
- Riesgo de degradacion sutil: aunque la preservacion de normas busca evitar el deterioro tipico de la abliteracion, no hay evaluaciones independientes de coherencia, factualidad o estabilidad en contextos largos para esta version concreta.
- Alucinacion: el modelo base es un LLM generativo sin mecanismo verificador; en tareas de codigo o datos factuales es necesario validar las salidas.
- Idiomas: no se documenta la cobertura linguistica de esta modificacion; el modelo base esta centrado en ingles y chino, por lo que el rendimiento en castellano no esta garantizado.
- Licencia: el repositorio declara MIT, lo que permite uso comercial, pero conviene revisar los terminos del modelo base y las implicaciones legales del uso de un modelo sin filtros en la jurisdiccion de despliegue.
- Procedencia: es un finetune comunitario sin vinculo con Zhipu AI; no hay garantias de mantenimiento, soporte ni correccion de errores. El repositorio registra 0 descargas y 1 like, lo que indica una validacion practicamente nula por parte de la comunidad.
- Coste de infraestructura: requiere multiplas GPU de 80 GB, lo que limita su uso a entornos con presupuesto de computo alto.
- Sesgos: no hay informacion sobre evaluaciones de sesgo para esta version; al eliminar los rechazos, es probable que los sesgos del modelo base se expresen con menos frenos.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo, por lo que no hay fuentes externas independientes que confirmen las afirmaciones del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/c0lorless/GLM-4.6-Derestricted-v3
- Modelo base: https://huggingface.co/zai-org/GLM-4.6
- Version original de Arli AI: https://huggingface.co/ArliAI/GLM-4.6-Derestricted
- Cuantizacion FP8: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-FP8
- Cuantizacion INT8 W8A8: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-W8A8-INT8
- Cuantizacion GPTQ W4A16: https://huggingface.co/ArliAI/GLM-4.6-Derestricted-GPTQ-W4A16
- Articulo tecnico sobre Norm-Preserving Biprojected Abliteration: https://huggingface.co/blog/grimjim/norm-preserving-biprojected-abliteration
- Blog tecnico de GLM-4.6: https://z.ai/blog/glm-4.6
- Informe tecnico de GLM-4.5 (arXiv): https://arxiv.org/abs/2508.06471
- Repositorio de codigo de la familia GLM-4.5: https://github.com/zai-org/GLM-4.5
- Documentacion tecnica de Zhipu AI: https://zhipu-ai.feishu.cn/wiki/Gv3swM0Yci7w7Zke9E0crhU7n7D
- Documentacion de la API GLM-4.6: https://docs.z.ai/guides/llm/glm-4.6
- Demo web: https://chat.z.ai
- Web de Arli AI: https://www.arliai.com
