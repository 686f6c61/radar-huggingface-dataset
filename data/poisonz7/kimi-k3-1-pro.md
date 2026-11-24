# PoisonZ7/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de pesos abiertos nativamente multimodal y orientado a agentes, desarrollado por Moonshot AI. Se presenta como el modelo mas capaz de la clase 3T de la compania y el primero de la serie K3.1. Segun la model card, se obtiene mediante post-entrenamiento a partir de Kimi K3 con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, y ofrece una ventana de contexto de un millon de tokens. La arquitectura es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104 mil millones de parametros activos por token.

El modelo esta pensado para tareas de codigo, creacion 3D, investigacion financiera, precision factual y flujos agenticos en general. El repositorio de Hugging Face consultado (`PoisonZ7/Kimi-K3.1-Pro`) es una publicacion de terceros que replica la model card de Moonshot AI; el peso real del repositorio es de 1561,4 GB y el recuento de parametros en safetensors coincide con los 2,78 billones declarados.

La relevancia actual reside en su combinacion de contexto extremo (1M tokens), multimodalidad nativa (pipeline `image-text-to-text`) y un diseno de atencion hibrido con 69 capas KDA y 24 capas Gated DSA, que busca hacer viable el procesamiento de secuencias muy largas en un modelo de escala 3T.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con atencion hibrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392 segun safetensors) |
| Parametros activos | 104 mil millones |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (tag `8-bit`); pesos en `compressed-tensors`; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, etiquetada como `other`) |
| Formato de pesos | safetensors (con `compressed-tensors`), libreria `transformers` |
| Capas totales | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension de cabeza del indice DSA | 128 |
| Cabezas del indice DSA | 32 |
| Top-K del indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Pipeline | `image-text-to-text` |

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer MoE de 93 capas con una unica capa densa. La innovacion arquitectonica principal es la composicion de atencion: 69 capas usan KDA (atencion lineal/delta, segun la nomenclatura del autor) y 24 capas usan Gated DSA (DeepSeek Sparse Attention con compuerta), con un indice de atencion dispersa de 32 cabezas, dimension 128 y Top-K de 2048. Esta mezcla busca reducir el coste computacional y de memoria en contextos de hasta 1M tokens sin renunciar a la calidad de recuperacion de informacion en secuencias largas.

La capa MoE emplea 896 expertos enrutados, de los cuales se activan 16 por token, mas 2 expertos compartidos. La dimension latente del MoE es 3584 y la dimension oculta por experto es 3072, lo que permite mantener un coste de activacion de 104B parametros frente a los 2,8T totales. El vocabulario es de 160K tokens.

En cuanto al entrenamiento, la model card indica que el modelo se post-entrena desde Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO convencionales mas alla de la mencion al RL conjunto. Tampoco se detalla la estrategia de decodificacion especulativa ni optimizaciones de inferencia adicionales.

## Capacidades

- Generacion de texto y razonamiento general en conversaciones multi-turno.
- Capacidades multimodales nativas de entrada imagen-texto (pipeline `image-text-to-text`).
- Generacion y comprension de codigo, con mejoras declaradas en tareas de programacion.
- Creacion 3D, segun la model card.
- Investigacion financiera y analisis de documentos extensos.
- Precision factual mejorada respecto a Kimi K3, segun el autor.
- Capacidades agenticas: la model card describe el modelo como "agentic" y entrenado con RL en dominios downstream, lo que sugiere soporte para razonamiento multi-paso y uso de herramientas.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible, aunque el enfoque agentico lo hace esperable.
- Capacidades multilingues: no disponibles.
- Contexto largo de hasta 1M tokens para documentos y conversaciones extensas.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion financiera extensa: con 1M tokens de contexto, el modelo puede ingerir informes anuales, transcripciones de llamadas de resultados y estados financieros completos en una sola pasada, manteniendo coherencia entre secciones y reduciendo la necesidad de troceado y recuperacion externa.
- Asistencia a desarrollo de software en produccion: su foco declarado en codigo y su naturaleza agentica permiten integrarlo en pipelines de revision, generacion de pruebas y refactorizacion, con capacidad de razonar sobre repositorios completos dentro de la ventana de contexto.
- Agentes autonomos multi-paso: el post-entrenamiento con RL en dominios downstream lo hace adecuado para orquestar tareas que requieren planificacion, uso de herramientas y verificacion de resultados a lo largo de muchas interacciones.
- Creacion 3D asistida: la model card menciona mejoras en creacion 3D, por lo que puede emplearse para generar descripciones estructuradas, scripts de modelado procedural o asistencia en herramientas de diseno 3D a partir de instrucciones en lenguaje natural.
- Procesamiento de imagenes y documentos escaneados: al ser nativamente multimodal (image-text-to-text), puede extraer informacion de capturas, diagramas y documentos visuales combinados con texto largo en el mismo contexto.
- Investigacion y sintesis bibliografica: con contexto de 1M tokens puede absorber decenas de articulos o patentes y producir resumenes comparativos, tablas de evidencia y deteccion de contradicciones entre fuentes.
- Atencion al cliente especializada de largo recorrido: conversaciones multi-turno con historial extenso e imagenes adjuntas (capturas de error, facturas) sin perder el hilo gracias a la ventana de 1M tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T parametros totales, los pesos en 8-bit requieren del orden de 2,8 TB de memoria, lo que excede cualquier GPU individual. El repositorio ocupa 1561,4 GB, coherente con una representacion comprimida de los pesos.
- GPU recomendadas: despliegue multi-nodo con GPUs de centro de datos (H100, H200, B200 o A100 de 80 GB) en configuracion de decenas a cientos de tarjetas; no es viable en una sola GPU.
- Cabe en GPU consumer: no. Ni siquiera con cuantizacion agresiva a 4 bits (aproximadamente 1,4 TB) cabe en una RTX 4090 (24 GB) ni en configuraciones multi-GPU consumer realistas.
- Opciones de despliegue: al estar en formato `transformers` con `compressed-tensors` y `custom_code`, requiere cargarlo con la libreria `transformers` y codigo propio del modelo; el soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Con 104B parametros activos por token, el coste por token es elevado y el despliegue exige paralelismo tensorial y de expertos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | `kimi-k3.1-pro` (propia) | Pesos en HF (repo de terceros), API en platform.kimi.ai |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo con otros modelos de la misma categoria, por lo que la comparativa se limita a la relacion con su predecesor Kimi K3.

## Limitaciones y advertencias

- El repositorio consultado (`PoisonZ7/Kimi-K3.1-Pro`) es una publicacion de terceros, no la cuenta oficial de Moonshot AI; conviene verificar la procedencia e integridad de los pesos antes de usarlos en produccion.
- Licencia propia `kimi-k3.1-pro` etiquetada como `other`: es imprescindible revisar los terminos completos antes de cualquier uso comercial, ya que pueden imponer restricciones de atribucion, uso aceptable o redistribucion.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; la model card menciona mejoras en precision factual, pero no cuantifica la tasa de error.
- Idiomas soportados no documentados: el rendimiento fuera de los idiomas principales de entrenamiento es incierto.
- Sesgos conocidos: no documentados en la informacion disponible.
- Coste de despliegue prohibitivo: 2,8T parametros y 1561,4 GB de pesos implican infraestructura multi-nodo; no es apto para entornos con recursos limitados.
- Soporte de tool calling y modo thinking no confirmados explicitamente en la documentacion disponible.
- La model card esta truncada en la informacion recibida (seccion de contexto incompleta), por lo que pueden faltar detalles sobre contexto, tokenizador o instrucciones de uso.
- No se han publicado benchmarks verificables en la informacion disponible, lo que impide validar las mejoras declaradas frente a Kimi K3.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PoisonZ7/Kimi-K3.1-Pro
- Organizacion oficial en Hugging Face: https://huggingface.co/moonshotai
- Model card oficial de referencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
