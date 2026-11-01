# ifarmertechnologies/camreport-models

## Resumen

`ifarmertechnologies/camreport-models` no es un modelo entrenado desde cero, sino un repositorio de conversiones a ONNX de dos modelos de terceros que utiliza la aplicacion de escritorio CamReport para sus funciones de busqueda inteligente y consulta en lenguaje natural sobre grabaciones de CCTV. El repositorio agrupa dos artefactos independientes: una exportacion ONNX de `google/siglip2-base-patch16-224` (modelo vision-lenguaje de tipo CLIP) para la busqueda semantica de imagenes, y una build de `Qwen/Qwen3-1.7B` cuantizada a INT4 para ONNX Runtime GenAI, pensada para ejecutarse en CPU.

La relevancia practica del repositorio es acotada: sirve como espejo de descarga bajo demanda para una aplicacion concreta, no como un modelo generalista publicable. Los pesos originales siguen siendo propiedad de Google LLC y del equipo Qwen (Alibaba Cloud), y el autor declara que el comportamiento de los modelos no se ha modificado, solo el formato de fichero y la precision de los pesos. El tamano total del repositorio es de 2,1 GB.

Para desarrolladores e investigadores, el interes esta en disponer de una receta ya empaquetada de SigLIP2 en ONNX con la torre de texto en INT8 y de Qwen3-1.7B en INT4 para CPU via ONNX Runtime GenAI, util como referencia de despliegue en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos independientes: SigLIP2 (vision-lenguaje, transformer de dos torres) y Qwen3 (transformer decoder-only) |
| Parametros totales | SigLIP2 base: no disponible en la informacion; Qwen3-1.7B: 1,7 mil millones |
| Parametros activos | No aplica (no son modelos MoE) |
| Longitud de contexto | SigLIP2: no disponible; Qwen3-1.7B: no disponible en la informacion (heredada del original, no declarada aqui) |
| Tipos de cuantizacion | SigLIP2: torre de texto en INT8, vision en precision original; Qwen3: INT4 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ONNX Runtime GenAI para Qwen3) |

## Arquitectura y entrenamiento

El repositorio no incluye entrenamiento propio ni fine-tuning: son conversiones de formato de modelos ya publicados. El componente `smart_search/` exporta `google/siglip2-base-patch16-224` a ONNX, con la torre de vision (`siglip2_base_vision.onnx`, 371,8 MB) y la torre de texto con embeddings cuantizados a INT8 (`siglip2_base_text_qemb.onnx`, 539,5 MB), mas el tokenizador (`siglip2_tokenizer.json`, 34,4 MB). SigLIP2 es la segunda generacion de la familia SigLIP de Google, un modelo de alineacion imagen-texto entrenado con perdida sigmoidea en lugar de softmax contrastivo.

El componente `ask/` contiene una build INT4 de `Qwen/Qwen3-1.7B` para ONNX Runtime GenAI orientada a CPU: `model.onnx` (0,3 MB, grafo), `model.onnx.data` (1096,7 MB, pesos), tokenizador, `chat_template.jinja` y `genai_config.json`. Qwen3 es la familia de transformers decoder-only de Alibaba Cloud con modo de razonamiento explicito. No se documentan en la model card ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF/DPO; esos detalles corresponden a las model cards originales.

## Capacidades

- Busqueda semantica imagen-texto y texto-imagen mediante SigLIP2 (recuperacion de fotogramas por descripcion en lenguaje natural).
- Generacion de texto conversacional y respuesta a preguntas mediante Qwen3-1.7B.
- Modo de razonamiento de Qwen3 (heredado del modelo original, aunque no se detalla su configuracion en esta build).
- Ejecucion en CPU sin GPU gracias a la cuantizacion INT4 e INT8 y a ONNX Runtime GenAI.
- Plantilla de chat incluida (`chat_template.jinja`) para conversaciones multi-turno.
- Soporte de tool calling: no disponible en la informacion.
- Capacidades de agente multi-paso: no disponible en la informacion.
- Cobertura multilingue: no disponible en la informacion.
- Capacidades de audio: no disponibles.

## Casos de uso

- Busqueda forense en grabaciones de CCTV: indexar fotogramas con la torre de vision de SigLIP2 y recuperar segmentos mediante consultas en lenguaje natural ("persona con chaqueta roja junto a la puerta"), aprovechando el emparejamiento imagen-texto del modelo.
- Asistente de consulta sobre eventos de camara: Qwen3-1.7B responde preguntas del operador sobre los resultados recuperados, integrado en la app CamReport mediante ONNX Runtime GenAI.
- Despliegue en estaciones de trabajo sin GPU: la build INT4 de Qwen3 permite inferencia en CPU en equipos de vigilancia o portatiles de campo donde no hay acelerador disponible.
- Prototipado de pipelines de vision-lenguaje: usar los ONNX de SigLIP2 como bloque de embeddings en un sistema de recuperacion propio sin depender de PyTorch en produccion.
- Clasificacion y filtrado de fotogramas por similitud semantica: comparar embeddings de texto e imagen para descartar escenas irrelevantes antes de un analisis mas costoso.
- Referencia de conversion ONNX: servir como plantilla reproducible para exportar SigLIP2 o compilar Qwen3 a INT4 con ONNX Runtime GenAI en otros proyectos.
- Asistencia redactada de informes: Qwen3-1.7B puede generar resumenes textuales de los eventos recuperados para informes de incidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de Qwen3, disenado explicitamente para CPU; SigLIP2 en ONNX puede ejecutarse en CPU o GPU segun el proveedor de ejecucion de ONNX Runtime.
- GPU recomendadas: no disponibles en la informacion; el empaquetado esta orientado a CPU.
- Cabe en GPU consumer: previsiblemente si para ambos componentes por tamano (menos de 1,1 GB de pesos en Qwen3 INT4 y menos de 1 GB en SigLIP2), aunque no se documenta soporte CUDA especifico.
- Opciones de despliegue: ONNX Runtime y ONNX Runtime GenAI; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| camreport-models (Qwen3-1.7B INT4) | 1,7 B | no disponible | ONNX GenAI | Apache-2.0 | Build para CPU de un modelo de terceros |
| Qwen/Qwen3-1.7B original | 1,7 B | no disponible | safetensors | Apache-2.0 | Pesos originales en BF16/FP16, referencia upstream |
| google/siglip2-base-patch16-224 original | no disponible | no disponible | safetensors | Apache-2.0 | Modelo vision-lenguaje de referencia |
| SigLIP original (base) | no disponible | no disponible | safetensors | Apache-2.0 | Generacion anterior, sin datos comparativos aqui |

## Limitaciones y advertencias

- No es un modelo propio: cualquier mejora o correccion debe venir de los modelos originales de Google y Qwen; este repositorio solo cambia formato y precision.
- La cuantizacion INT4 (Qwen3) e INT8 (torre de texto de SigLIP2) puede degradar ligeramente la calidad respecto a los pesos originales, aunque el autor afirma que el comportamiento no cambia.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad; deben consultarse en las model cards de Qwen3 y SigLIP2.
- No se declaran idiomas soportados ni longitud de contexto en esta ficha; no asumir valores sin verificar los originales.
- Uso comercial permitido bajo Apache-2.0, con atribucion a Google LLC y al equipo Qwen (Alibaba Cloud) por los pesos originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- Orientado a una aplicacion de escritorio concreta (CamReport); su integracion fuera de ese contexto requiere trabajo adicional de glue code.
- El uso en vigilancia conlleva obligaciones legales de proteccion de datos (RGPD) que no cubre la licencia del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ifarmertechnologies/camreport-models
- Modelo original SigLIP2: https://huggingface.co/google/siglip2-base-patch16-224
- Modelo original Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- ONNX Runtime GenAI: no disponible en la informacion
- Paper de SigLIP2: no disponible en la informacion
- Paper de Qwen3: no disponible en la informacion
