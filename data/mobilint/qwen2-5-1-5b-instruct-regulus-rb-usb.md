# mobilint/Qwen2.5-1.5B-Instruct-regulus-rb-usb

## Resumen

Este repositorio contiene un artefacto derivado de Qwen2.5-1.5B-Instruct publicado por mobilint, una empresa que desarrolla aceleradores NPU. No se trata de un modelo entrenado desde cero ni de un ajuste fino: la model card lo describe explícitamente como un modelo "compilado y optimizado para hardware NPU de Mobilint" y empaquetado para su stack de aceleración, con la etiqueta `base_model_relation: quantized`. La librería declarada es `mobilint`, con código personalizado (`custom_code`), lo que indica que no se carga con `transformers` estándar.

El modelo base es Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parámetros con 32.768 tokens de contexto, ajustado por instrucciones y publicado por Alibaba bajo licencia Apache 2.0. Las capacidades de generación de texto, conversación y código del artefacto derivan íntegramente de ese modelo base; este repositorio solo aporta la transformación para ejecución sobre NPU.

Su relevancia es acotada y muy específica: sirve para desplegar un asistente conversacional en inglés sobre hardware de borde de Mobilint, no como modelo de propósito general en GPU. Con cero descargas y cero "likes" en el momento de la consulta, y con una model card de apenas dos párrafos sin métricas ni detalles de cuantización, es un artefacto de distribución interna o incipiente para el ecosistema del fabricante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5); el repositorio no detalla la arquitectura del artefacto compilado |
| Parámetros totales | 1,54 B en el modelo base Qwen2.5-1.5B-Instruct; el repositorio declara 233.373.696 parámetros en safetensors (discrepancia no explicada en la documentación) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no confirmada para el artefacto compilado (no disponible) |
| Tipos de cuantización | No disponible; la relación con el modelo base es `quantized`, pero no se especifica el esquema (int8, int4, fp16 u otro) |
| Idiomas soportados | Inglés (`en`) según la model card; el modelo base declara soporte multilingüe, no confirmado aquí |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors junto con `custom_code` y librería `mobilint` |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Hardware objetivo | NPU de Mobilint (stack de aceleración propietario) |
| Pipeline | text-generation |
| Tamaño del repositorio | 3,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 (según metadatos del repositorio) |
| Última actualización | 2026-09-10 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen2.5, que emplea una arquitectura transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE), atención con consultas agrupadas (GQA), sesgo en las proyecciones QKV y embeddings de entrada y salida compartidos. Qwen2.5-1.5B-Instruct fue preentrenado por Alibaba sobre un corpus de gran escala y posteriormente ajustado por instrucciones; los detalles concretos de ese post-entrenamiento (número de tokens, composición del dataset, uso de DPO o RLHF) no se recogen en la información disponible de este repositorio.

Este repositorio no documenta ningún entrenamiento propio. Lo que contiene es una conversión de los pesos ya ajustados de Qwen2.5-1.5B-Instruct a un formato compilado para el stack NPU de Mobilint, con la etiqueta `quantized`. La model card no especifica el esquema de cuantización, el calibrado, la pérdida de precisión esperada ni el proceso de compilación, y tampoco incluye el código del runtime más allá de la etiqueta `custom_code`. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras).

## Capacidades

- Generación de texto y conversación multi-turno en inglés, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Seguimiento de instrucciones y respuesta a prompts con formato de sistema, con el estilo de plantilla de chat de Qwen2.5.
- Generación y explicación de código a nivel básico-intermedio, limitada por el tamaño del modelo base (1,5 B de parámetros).
- Razonamiento aritmético y matemático elemental, con la fiabilidad propia de un modelo de 1,5 B.
- Salida estructurada en JSON, capacidad presente en la familia Qwen2.5-Instruct, aunque no verificada específicamente en este artefacto.
- Soporte de tool calling / function calling en la familia Qwen2.5-Instruct; no confirmado para esta compilación.
- Capacidades de agente y razonamiento multi-paso: no documentadas en este repositorio.
- Idiomas: únicamente inglés según la model card. El soporte multilingüe del modelo base no se garantiza en esta conversión.
- Visión, audio u otras modalidades: no soportadas (el modelo base es exclusivamente de texto).

## Casos de uso

- Asistente conversacional en inglés sobre hardware NPU: el modelo puede gestionar diálogos multi-turno de baja latencia en dispositivos de borde que integren el acelerador de Mobilint, sin depender de conectividad a la nube.
- Clasificación de intención y enrutado de consultas: con prompts cortos y salidas controladas, es adecuado para etiquetar tickets o dirigir peticiones a servicios especializados en un pipeline de atención al cliente en inglés.
- Resumen y reescritura de documentación técnica en inglés: su ventana de contexto de 32.768 tokens en el modelo base permite procesar manuales o informes extensos de una sola pasada en el borde.
- Extracción de información estructurada: conversión de correos, formularios o notas en JSON con campos definidos, útil en flujos internos donde los datos no pueden salir del dispositivo.
- Autocompletado y explicación de fragmentos de código en entornos de desarrollo locales con NPU, para sugerencias de baja latencia sin enviar código a un servicio externo.
- Procesamiento por lotes en el borde: etiquetado, resumen o normalización de grandes volúmenes de textos en inglés durante ventanas de baja carga, con coste energético reducido frente a GPU.
- Validación del stack de compilación de Mobilint: servir como prueba de extremo a extremo (compilación, carga y ejecución) en la integración del SDK del fabricante.
- Evaluación comparativa de precisión tras cuantización: medir la degradación de un mismo prompt entre los pesos originales de Qwen2.5-1.5B-Instruct y esta versión compilada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni cifras de latencia, throughput o consumo energético sobre el hardware objetivo. El modelo base Qwen2.5-1.5B-Instruct sí cuenta con evaluaciones publicadas por su autor, pero no se reproducen aquí al no estar presentes en la información proporcionada.

## Requisitos de hardware

- Pesos de este repositorio: 3,3 GB de artefacto compilado para NPU de Mobilint. No se cargan con `transformers` estándar (librería `mobilint` y `custom_code`), por lo que la VRAM de GPU no aplica a estos ficheros.
- Requisito real: un acelerador NPU de Mobilint y su runtime/SDK asociado. Sin ese hardware, el repositorio no es utilizable.
- Alternativa en GPU con los pesos originales de Qwen2.5-1.5B-Instruct (estimación aritmética, no medida): en bf16/fp16 los pesos ocupan aproximadamente 3,1 GB; la caché KV a 32.768 tokens añade unos 0,9 GB, lo que sitúa el total en torno a 4 GB de VRAM.
- Cuantización con los pesos originales (estimación): int8 alrededor de 1,6 GB de pesos; 4 bits alrededor de 0,8-1,0 GB, con contexto reducido.
- GPU de consumo: sí cabe en tarjetas de 8 GB o más (RTX 3060, RTX 4060, RTX 4070, RTX 4090) y en configuraciones de 4 bits incluso en equipos con 6-8 GB. Con el artefacto de este repositorio, no es aplicable.
- Opciones de despliegue con los pesos originales: vLLM, TGI, SGLang, llama.cpp, Ollama y LM Studio. Para este repositorio, únicamente el stack de Mobilint.
- Latencia y throughput: no disponibles. No se han publicado mediciones sobre NPU ni comparaciones con ejecución en GPU.

## Comparativa con modelos similares

Las cifras de los modelos alternativos proceden de sus especificaciones públicas habituales y no se han verificado en la búsqueda realizada para esta ficha. No hay datos de rendimiento comparado para el artefacto de Mobilint.

| Modelo | Parámetros | Contexto | Licencia | Formato / objetivo | Disponibilidad |
|---|---|---|---|---|---|
| mobilint/Qwen2.5-1.5B-Instruct-regulus-rb-usb | 1,54 B (base); 233,4 M declarados en safetensors | No disponible para el artefacto | Apache 2.0 | safetensors + custom_code para NPU Mobilint | 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, transformers | Ampliamente distribuido |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, transformers | Ampliamente distribuido |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, transformers | Ampliamente distribuido |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, transformers | Ampliamente distribuido |

## Limitaciones y advertencias

- Model card mínima: no documenta el esquema de cuantización, el proceso de compilación, la precisión resultante ni las condiciones de uso previstas, más allá de indicar que debe usarse dentro del entorno de Mobilint.
- Discrepancia de parámetros: los safetensors del repositorio declaran 233.373.696 parámetros frente a los aproximadamente 1,54 B del modelo base. No se explica si se trata de un subconjunto exportado, de pesos parciales o de un error de metadatos, y esto impide dar por segura cualquier estimación de calidad.
- Dependencia de hardware: los pesos están atados a la NPU de Mobilint y a su librería propietaria. No hay ruta de despliegue documentada en GPU ni conversión a GGUF.
- Riesgo asociado a `custom_code`: la carga implica ejecutar código del repositorio, lo que exige revisión previa antes de usarlo en producción.
- Idiomas: solo inglés según la model card. Un uso en castellano no está respaldado por el autor y, con 1,5 B de parámetros, la calidad caería con toda probabilidad.
- Alucinación: el modelo base, con 1,5 B de parámetros, tiene una tasa de fabricación de hechos notablemente superior a la de modelos de 7 B o más. No se han publicado evaluaciones de fidelidad para esta versión.
- Contexto efectivo: aunque el modelo base soporte 32.768 tokens, no hay confirmación de que la compilación para NPU preserve esa ventana.
- Sesgos: no se ha publicado ningún análisis de sesgo, toxicidad o sesgo de género para este artefacto. Los sesgos del modelo base y de su corpus de preentrenamiento se heredan sin mitigación documentada.
- Licencia: Apache 2.0 en los pesos, con enlace a la licencia de Qwen. Conviene verificar si el runtime o el SDK de Mobilint tienen condiciones adicionales distintas de la licencia del modelo.
- Sin validación comunitaria: cero descargas y cero interacciones registradas, además de fechas de creación y actualización poco habituales en los metadatos (2026). No hay evidencia externa de que el artefacto funcione correctamente en producción.
- Sin datos de rendimiento: no hay latencia, throughput, consumo ni precisión medidos, lo que impide estimar el coste real de despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mobilint/Qwen2.5-1.5B-Instruct-regulus-rb-usb
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Sitio del fabricante: https://mobilint.com
- Repositorio de modelos de Mobilint: https://github.com/mobilint/mblt-model-zoo
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo. Los enlaces obtenidos correspondían a catálogos de material eléctrico sin relación con el repositorio, por lo que no se han incluido.
