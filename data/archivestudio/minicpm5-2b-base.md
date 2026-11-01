# ArchiveStudio/MiniCPM5-2B-Base

## Resumen

MiniCPM5-2B-Base es un modelo de lenguaje denso de unos 2,5 mil millones de parámetros publicado en Hugging Face por ArchiveStudio, perteneciente a la serie MiniCPM5 desarrollada por OpenBMB. Es el segundo modelo de la familia, tras MiniCPM5-1B, y reproduce a mayor escala la misma receta de entrenamiento. Está diseñado específicamente para despliegue en dispositivo (on-device), ejecución local y escenarios con recursos limitados, donde el objetivo es maximizar la calidad sin recurrir a modelos de 7B o superiores.

Según la model card del autor, el modelo alcanza el estado del arte open source en su clase de 2B, compitiendo de forma global con modelos de 4B y mostrando ventajas sobre modelos de tamaño comparable en código, matemáticas, comprensión de contexto largo, uso de herramientas y tareas agénticas. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones relevantes, y los pesos están en formato safetensors con arquitectura compatible con Llama dentro de la librería transformers.

Al tratarse de una variante Base (preentrenada, sin ajuste de instrucciones), es adecuada como punto de partida para fine-tuning, para completar texto en formato raw o como base para derivar versiones instruct/chat propias. Existe una demo online y un repositorio de GitHub con el resto de la serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura tipo Llama |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card destaca capacidades de contexto largo, sin cifrar la ventana) |
| Tipos de cuantizacion | No disponible (pesos originales en BF16/FP16; no se publican variantes cuantizadas oficiales en el repo) |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso de 2B que reutiliza la arquitectura tipo Llama de la serie MiniCPM, escalando la receta de entrenamiento empleada en MiniCPM5-1B. No se trata de un modelo MoE ni híbrido: todos los parámetros están activos en cada pasada, lo que simplifica el despliegue y hace el coste de inferencia predecible.

El entrenamiento se apoya en la familia de datasets UltraData de OpenBMB, visible en los tags del repositorio: Ultra-FineWeb, Ultra-FineWeb-L3 y UltraX-Preview para preentrenamiento sobre texto web filtrado de alta calidad, y UltraData-Math y UltraData-Code para reforzar razonamiento matemático y programación. Para el ajuste posterior se listan UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609, lo que indica fases de SFT y aprendizaje por refuerzo, incluyendo datos específicos de agentes. No se ha publicado el número total de tokens de preentrenamiento ni los detalles del pipeline de RLHF/DPO en la información disponible. El report técnico de la serie está disponible en arXiv (2506.07900).

## Capacidades

- Generacion de texto general en ingles y chino, con énfasis en calidad de conocimiento general e instruction following (según el radar de capacidades del autor).
- Razonamiento matematico: dataset dedicado UltraData-Math durante el entrenamiento.
- Generacion y razonamiento de codigo: dataset dedicado UltraData-Code.
- Comprension de contexto largo: la model card lo destaca como una de las dimensiones donde supera a modelos de tamaño comparable.
- Uso de herramientas (tool calling): indicado en los tags del repositorio y presente en los datos de SFT/RL.
- Capacidades agenticas: dataset UltraData-SFT-Agent-2609 y UltraData-RL-2609 sugieren entrenamiento específico para tareas multi-paso.
- Al ser un modelo Base, no incluye plantilla de chat ni modo de razonamiento (thinking); estas capacidades dependen de la variante instruct/chat o del fine-tuning que se aplique.

## Casos de uso

- Fine-tuning para asistentes verticales: al ser un modelo Base con licencia Apache 2.0 y solo 2,5B de parámetros, es idóneo como base para SFT/DPO con datos propios de dominio (legal, médico, técnico) y desplegar el resultado on-device.
- Ejecucion local en portatiles y dispositivos edge: con ~5 GB de pesos en FP16, cabe en GPUs de consumo y en configuraciones CPU+RAM modestas, sin depender de la nube.
- Generacion y completado de codigo en entornos restringidos: gracias al entrenamiento con UltraData-Code, puede integrarse en IDEs locales o plugins de autocompletado que no pueden enviar código a APIs externas.
- Agentes con tool calling en local: los tags y datos de entrenamiento agénticos lo hacen adecuado para pipelines de agentes multi-paso que invocan funciones, con la ventaja de privacidad y coste cero por token.
- Procesamiento de documentos largos: la capacidad de contexto largo destacada por el autor permite resumir o extraer información de documentos extensos en local.
- Asistentes bilingues ingles/chino: entrenamiento explícito en ambos idiomas, útil para productos con audiencia en ambos mercados.
- Investigacion y experimentacion: tamaño pequeño que permite abaratar experimentos de destilación, cuantización, decodificación especulativa o evaluación de benchmarks académicos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card afirma cualitativamente que el modelo alcanza SOTA open source en su clase de 2B y que es competitivo con modelos de 4B, con ventajas en codigo, matematicas, contexto largo, tool use y tareas agenticas, pero no incluye tablas de metricas concretas en el contenido proporcionado.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 5 GB solo de pesos; con contexto largo y cache de KV, se recomienda disponer de 6-8 GB.
- Con cuantizacion a 4 bits (por ejemplo, via GGUF o bitsandbytes, si se genera la conversion), los pesos ocuparian en torno a 1,5-2 GB, viable en portatiles y en GPUs de gama media.
- GPUs recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090 con holgura); para servir multiples peticiones, GPUs de datacenter como A100 o L4.
- Cabe sin problemas en GPUs de consumo actuales incluso en precision completa; en CPU puro es ejecutable con velocidad razonable dado su tamano reducido.
- Opciones de despliegue: transformers (nativo), text-generation-inference (compatible segun tags), vLLM y llama.cpp tras conversion a GGUF; no hay variantes GGUF oficiales publicadas en el repo.
- Latencia y throughput: no disponibles; al ser un modelo denso de 2,5B, se espera latencia baja y throughput alto en comparacion con modelos de 7B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-Base | ~2,5B | Transformer denso | No disponible | Apache 2.0 | SOTA 2B segun el autor; fuerte en codigo, matematicas, tool use y agentes |
| MiniCPM5-1B | ~1B | Transformer denso | No disponible | Apache 2.0 | Modelo predecesor de la misma serie, receta identica a menor escala |
| Qwen2.5-1.5B / 3B | 1,5B / 3B | Transformer denso | Hasta 32K (según variante) | Qwen Research / Apache 2.0 (algunas variantes) | Alternativa de tamano comparable, amplia cobertura multilingue |
| Gemma 3 4B | ~4B | Transformer denso | 128K | Licencia Gemma con restricciones | Competidor de clase 4B; la model card de MiniCPM5-2B afirma ser competitivo frente a esta clase |

La comparativa se basa en caracteristicas publicas generales de los modelos alternativos; no hay benchmarks cruzados numericos en la informacion disponible para esta ficha.

## Limitaciones y advertencias

- Al ser un modelo Base, no sigue instrucciones de forma fiable ni usa plantillas de chat: genera continuaciones de texto. Para asistentes conversacionales, se necesita la variante instruct/chat o un fine-tuning propio.
- Sesgos conocidos: no documentados por el autor; como todo LLM preentrenado sobre texto web, puede reproducir sesgos presentes en los datos de Ultra-FineWeb.
- Riesgo de alucinacion: propio de modelos de 2B, elevado en tareas de conocimiento factual; no hay mitigaciones documentadas específicas.
- Idiomas: entrenado solo en ingles y chino; el rendimiento en castellano u otras lenguas no esta evaluado y probablemente sea limitado.
- Longitud de contexto: la model card destaca capacidades de contexto largo pero no cifra la ventana exacta; verificar empiricamente antes de depender de ella en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de los datasets de entrenamiento si se requiere cumplimiento normativo estricto.
- No hay variantes cuantizadas ni GGUF oficiales: para despliegue en CPU o dispositivos muy limitados habra que realizar la conversion por cuenta propia.
- Popularidad muy baja en el momento de la ficha (322 descargas, 0 likes), lo que implica menor soporte comunitario y menos herramientas probadas frente a alternativas mas asentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM5-2B-Base
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Report tecnico de la serie MiniCPM (arXiv): https://arxiv.org/pdf/2506.07900
- Segundo articulo citado en tags (arXiv): https://arxiv.org/abs/2602.09003
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Proyecto UltraData: https://ultradata.openbmb.cn/
- Modelo predecesor MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- README en chino: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
- Datasets de entrenamiento: https://huggingface.co/datasets/openbmb/Ultra-FineWeb, https://huggingface.co/datasets/openbmb/UltraX-Preview
