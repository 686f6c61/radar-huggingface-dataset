# IsValorum/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF

## Resumen

Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1 Abliterated GGUF es una cuantización de precisión mixta, publicada por el usuario IsValorum, del checkpoint huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated, que a su vez es una versión sin censura del modelo oficial XingChen-AGI/Xing4.0-29B-A4B. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 31.215.031.088 parámetros totales (comercializado como 29B) y aproximadamente 4B parámetros activos por token, por lo que la etiqueta A4B del nombre hace referencia a esa activación dispersa.

La arquitectura combina tres elementos: mHC (manifold-constrained Hyper-Connections), Multi-head Latent Attention (MLA) y una capa adicional de Multi-Token Prediction (MTP). El modelo declara una ventana de contexto nativa de 262.144 tokens (256K), ampliable a 512K según la documentación del modelo original, y está orientado a razonamiento, generación de código, planificación agéntica y uso de herramientas. Fue entrenado sobre la pila Ascend NPU / MindSpore según indica la model card.

La relevancia de esta ficha concreta no está en el modelo base, sino en el trabajo de cuantización: el GGUF final ocupa 13,76 GB (12,82 GiB, 3,42 BPW) y, según las mediciones del autor, conserva una perplejidad de 7,7238 en WikiText-2 frente a 7,3060 del BF16 original, lo que supone un incremento del 5,71% y sitúa la fidelidad en el entorno de un Q5_K_M manteniendo un tamano apto para GPU de consumo. El modelo está licenciado bajo Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC (manifold-constrained Hyper-Connections), MLA (Multi-head Latent Attention) y una capa MTP (Multi-Token Prediction) |
| Parametros totales | 31.215.031.088 (aproximadamente 31,2B; el autor lo comercializa como 29B) |
| Parametros activos | Aproximadamente 4B por token |
| Longitud de contexto | 262.144 tokens (256K) nativos; ampliable a 512K según el modelo original |
| Tipos de cuantizacion | GGUF en formato APEX-I-MiniPlus V2.1 (3,42 BPW promedio, precision mixta tensor a tensor). Existe una variante hermana APEX-I-NanoPlus de 2,92 BPW. Otras cuantizaciones estandar no disponibles en esta ficha |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

Detalles adicionales de la arquitectura, segun la model card:

| Parametro | Valor |
|---|---|
| Capas transformer principales | 40 |
| Capas densas iniciales | 2 (capas 0-1, `first_k_dense_replace: 2`) |
| Capas MoE | 38 (capas 2-39) |
| Expertos enrutados por capa | 64 |
| Expertos seleccionados por token | 4 |
| Experto compartido | 1, siempre activo |
| Bloque MTP | Almacenado como `blk.40` en el GGUF |
| Tamano del repositorio | 26,9 GB |
| Descargas / likes | 1.651 descargas, 1 like |

## Arquitectura y entrenamiento

El modelo base es un MoE no uniforme. Las dos primeras capas del transformer son capas FFN densas, mientras que las capas 2 a 39 sustituyen la FFN por bloques MoE con 64 expertos enrutados, de los cuales se activan 4 por token, mas un experto compartido siempre activo. Sobre ese esqueleto se anaden dos innovaciones descritas en la model card: mHC (manifold-constrained Hyper-Connections), que modifica el mecanismo de conexiones residuales, y MLA (Multi-head Latent Attention), que comprime las proyecciones de clave y valor en un espacio latente y reduce de forma significativa el coste de la cache KV en contextos largos. Una capa adicional de Multi-Token Prediction (MTP) se almacena como `blk.40` y permite predecir varios tokens por paso, lo que habilita decodificacion especulativa interna y mejora el throughput en inferencia.

El entrenamiento del modelo oficial fue realizado por XingChen sobre la pila Ascend NPU / MindSpore, con una ventana nativa de 256K tokens y extension documentada hasta 512K. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos figuran como no disponibles. La variante abliterated de huihui-ai se genero con un flujo de eliminacion de rechazos basado en Sumandora/remove-refusals-with-transformers, que actua sobre las direcciones de activacion asociadas a la negativa a responder; el autor de esta cuantizacion aclara que no aplica ningun procedimiento adicional de eliminacion de rechazos.

En cuanto a la cuantizacion, APEX-I-MiniPlus V2.1 no es una cuantizacion plana: es un mapeo de precision mixta tensor a tensor calibrado especificamente para Xing4.0. La asignacion descrita preserva las dos capas densas de entrada en precision alta, mantiene todos los routers MoE principales en F32, protege los expertos compartidos en Q5_K y aplica precision de 3 bits calibrada al backbone de expertos enrutados. Con ello se obtiene un archivo de 13,76 GB (12,82 GiB) con 3,42 BPW medios.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte de plantillas de chat.
- Razonamiento multi-paso y modos de pensamiento extendido, orientados a tareas de planificacion.
- Generacion y edicion de codigo, con etiquetas explicitas de coding en el modelo.
- Planificacion agentica y ejecucion de tareas encadenadas (agentic, multi-step reasoning).
- Soporte de tool calling / function calling, segun la orientacion declarada del modelo base.
- Contexto largo nativo de 256K tokens, util para analisis de repositorios completos, documentos extensos o historiales de conversacion muy largos.
- Capacidad multimodal: no disponible; la informacion proporcionada describe un modelo de texto.
- Capacidad de audio: no disponible.
- Decodificacion especulativa interna mediante la capa MTP, que acelera la generacion.
- Variante sin censura (abliterated/uncensored): el modelo no presenta los rechazos tipicos del checkpoint alineado original.

## Casos de uso

- Analisis de repositorios completos: con 256K tokens de contexto nativo, el modelo puede ingerir un proyecto de tamano medio y responder preguntas sobre arquitectura, dependencias o deuda tecnica sin necesidad de trocear el codigo en fragmentos y perder coherencia entre modulos.
- Asistente de programacion en produccion: el soporte de tool calling permite conectarlo a un servidor MCP o a una API interna para que consulte documentacion, ejecute tests o proponga parches dentro de un pipeline de CI/CD.
- Agentes autonomos de investigacion: la combinacion de razonamiento multi-paso y ventana de 256K lo hace apto para agentes que mantienen un estado de tarea largo, alternan busquedas web y sintetizan resultados sin desbordar el contexto.
- Atencion al cliente multilingue en ingles y chino: gestiona conversaciones multi-turno con historial extenso y puede integrarse con un backend de herramientas para consultar pedidos, facturas o incidencias.
- Procesamiento de documentacion tecnica y contractual: la ventana de 256K permite resumir, extraer clausulas o comparar versiones de documentos extensos en una sola pasada.
- Generacion de codigo en local con GPU de consumo: al ocupar 13,76 GB, es desplegable en tarjetas de 16-24 GB mediante llama.cpp, lo que habilita asistentes de codigo sin envio de datos a servicios externos.
- Entrenamiento de destilacion o generacion de datos sinteticos: una variante abliterated sin rechazos sistematicos es util para generar datasets de instrucciones en dominios donde el modelo alineado se negaria a responder, siempre dentro de los limites legales aplicables.
- Despliegue en entornos con requisitos estrictos de privacidad: al ser un GGUF ejecutable en local con licencia Apache 2.0, puede usarse en infraestructura propia sin dependencia de APIs externas.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son mediciones de perplejidad sobre WikiText-2, obtenidas con `llama-perplexity` en configuracion de 2048 tokens de contexto, 512 de batch y 10 chunks:

| Metrica | BF16 origen | APEX-I-MiniPlus V2.1 | APEX-I-NanoPlus |
|---|---|---|---|
| Perplejidad WikiText-2 | 7,3060 +/- 0,18633 | 7,7238 +/- 0,19671 | 8,3197 +/- 0,21528 |
| Delta de perplejidad | 0 (referencia) | +0,4178 (+5,71%) | +1,0137 (+13,87%) |
| Tamano del GGUF | 62,40 GB | 13,76 GB | 11,74 GB |
| Huella en memoria | 58,11 GiB | 12,82 GiB | 10,94 GiB |
| BPW medio | 16,00 | 3,42 | 2,92 |
| Objetivo de calidad practico | Precision completa | Clase Q5_K_M | Clase Q4_K_M / Q4_K_S |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, SWE-bench u otros) en la informacion disponible, ni para el modelo base ni para esta cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 13,76 GB (12,82 GiB), por lo que se necesitan aproximadamente 14 GB de VRAM solo para los pesos con offload completo a GPU. A eso hay que sumar la cache KV, cuyo tamano depende del contexto; MLA reduce ese coste de forma notable, pero en contextos de 256K la cache sigue siendo un factor determinante. Para uso con contexto moderado, un presupuesto realista es 15-18 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB, con contexto limitado), A100 40/80 GB, H100. En GPUs de 16 GB conviene reducir la ventana de contexto o aplicar offload parcial.
- Cabe en GPU de consumo: si. Es viable en tarjetas de 24 GB (RTX 3090/4090) con margen para contexto amplio, y en tarjetas de 16 GB con contexto reducido. La variante NanoPlus (11,74 GB) amplia el margen en equipos de 12-16 GB.
- Opciones de despliegue: llama.cpp y sus derivados (llama-server, llama-cpp-python, Ollama, LM Studio, text-generation-webui, KoboldCpp). El autor incluye una seccion de quickstart de llama.cpp. El soporte en vLLM y TGI para GGUF es limitado o experimental, por lo que no se recomienda como via principal para este artefacto.
- Latencia y throughput estimados: no disponibles. La model card menciona una seccion de proyecciones de throughput por GPU y pruebas de offload a RAM, pero su contenido no se incluye en la informacion proporcionada. La capa MTP deberia mejorar el throughput frente a un transformer denso de tamano comparable, aunque no se aportan cifras.

## Comparativa con modelos similares

La informacion disponible permite comparar esta cuantizacion con las otras dos variantes de la misma familia, para las que si hay datos medidos:

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Tamano | Licencia |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B BF16 (origen) | 31,2B totales / ~4B activos | 256K nativos | 7,3060 | 62,40 GB | Apache 2.0 |
| APEX-I-MiniPlus V2.1 (esta ficha) | 31,2B totales / ~4B activos | 256K nativos | 7,7238 | 13,76 GB | Apache 2.0 |
| APEX-I-NanoPlus | 31,2B totales / ~4B activos | 256K nativos | 8,3197 | 11,74 GB | Apache 2.0 |

Comparativa con modelos de otras familias (por ejemplo, alternativas MoE de tamano y activacion similares): no disponible. No se han proporcionado mediciones ni especificaciones de terceros en la informacion recibida, y no se deben extrapolar cifras.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se ha eliminado el comportamiento de rechazo del checkpoint original. Esto implica un riesgo elevado de generar contenido inapropiado, ofensivo, peligroso o legalmente problemático. No es adecuado para despliegues orientados al publico sin una capa de moderacion adicional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, APIs, referencias o resultados. En tareas agenticas con acceso a herramientas, una alucinacion puede traducirse en acciones incorrectas ejecutadas de forma automatica.
- Cobertura idiomatica limitada: los idiomas declarados son ingles y chino. El rendimiento en castellano no esta documentado y previsiblemente sera inferior. No se debe asumir calidad multilingue fuera de esos dos idiomas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible. Los datasets de entrenamiento del modelo original no se detallan, por lo que no es posible caracterizar los sesgos de forma rigurosa.
- Perdida de fidelidad respecto al BF16: la cuantizacion introduce un incremento de perplejidad del 5,71%. En tareas sensibles a la precision (matematicas complejas, cadenas de razonamiento largas, generacion de codigo con APIs poco frecuentes) el deterioro puede ser mas acusado que el que sugiere la perplejidad agregada.
- Precisión de 3 bits en el backbone de expertos: los expertos enrutados usan una precision calibrada de 3 bits. Aunque la asignacion de precision mixta protege routers (F32), expertos compartidos (Q5_K) y capas densas de entrada, el comportamiento en dominios muy alejados de la calibracion no esta verificado.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo del contenido generado, especialmente dado el caracter sin censura del checkpoint.
- Cadena de procedencia con multiples saltos: modelo oficial -> abliterated de huihui-ai -> cuantizacion de IsValorum. Cada salto anade incertidumbre sobre la evaluacion real del artefacto final.
- Madurez: el repositorio tiene 1 like y 1.651 descargas en la fecha de actualizacion, lo que indica una adopcion limitada y poca validacion independiente por parte de la comunidad.
- La model card se encuentra truncada en la informacion proporcionada (seccion de eleccion entre MiniPlus y NanoPlus y secciones posteriores incompletas), por lo que algunas especificaciones operativas no estan disponibles.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Variante hermana APEX-I-NanoPlus: https://huggingface.co/IsValorum/Xing4.0-29B-A4B-APEX-I-NanoPlus-Abliterated-GGUF
- Modelo base abliterated (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Xing4.0-29B-A4B-abliterated
- Modelo oficial (XingChen-AGI): https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Metodo de abliteration referenciado: https://github.com/Sumandora/remove-refusals-with-transformers
- Fondo de computo del autor (Ko-fi): https://ko-fi.com/isvalorum

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenido no relacionado y no verificable), por lo que no se incluyen enlaces adicionales de papers, blogs o demos.
