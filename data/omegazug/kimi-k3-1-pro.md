# omegazug/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y orientado a agentes, desarrollado por Moonshot AI. Se trata de un modelo de clase 3T (billones de parametros) con arquitectura Mixture-of-Experts (MoE), post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios. Es el primer modelo de la serie K3.1 y, segun el autor, el mas capaz de la familia hasta la fecha.

El modelo combina una ventana de contexto de un millon de tokens con capacidades multimodales (texto e imagen) y esta disenado para tareas agenticas complejas: generacion de codigo, creacion 3D, investigacion financiera y precision factual. Su arquitectura emplea una composicion hibrida de capas de atencion (69 KDA + 24 Gated DSA) sobre 93 capas, con 896 expertos y 16 expertos seleccionados por token.

La relevancia de esta ficha radica en su escala: con 2,78 billones de parametros totales y 104.000 millones activos por token, se situa en la categoria de modelos frontera de pesos abiertos. No obstante, el repositorio de Hugging Face pertenece al usuario `omegazug` (no a la organizacion oficial `moonshotai`), lo que debe tenerse en cuenta al evaluar su procedencia y cadena de custodia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (69 KDA + 24 Gated DSA) |
| Parametros totales | 2.780.110.363.392 (2,78T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (compressed-tensors); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (licencia propia, `license: other`) |
| Formato de pesos | safetensors (con `custom_code` y `compressed-tensors`) |

Otras especificaciones de arquitectura:

| Parametro | Valor |
|---|---|
| Numero de capas | 93 |
| Capas densas | 1 |
| Dimension oculta de atencion | 7168 |
| Numero de cabezas de atencion | 96 |
| Dimension de cabeza de indice DSA | 128 |
| Numero de cabezas de indice DSA | 32 |
| Top-K de indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE (por experto) | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Tamano del repositorio | 1561,4 GB |

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer MoE de 93 capas con una unica capa densa. La innovacion arquitectonica principal reside en la composicion de capas de atencion: 69 capas KDA (Kimi Delta Attention) combinadas con 24 capas Gated DSA (Deep Seesaw Attention, segun la nomenclatura del autor). La atencion DSA emplea 32 cabezas de indice con dimension 128 y un Top-K de 2048, lo que sugiere un mecanismo de seleccion dispersa de tokens relevante para sostener contextos de un millon de tokens con coste computacional controlado.

La capa MoE cuenta con 896 expertos, de los cuales se activan 16 por token, mas 2 expertos compartidos. La dimension latente del MoE es 3584 y cada experto tiene una dimension oculta de 3072. El vocabulario es de 160K tokens. El modelo se post-entrena desde Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, aunque el numero exacto de tokens de entrenamiento, la composicion del dataset y los detalles del pipeline de RLHF/DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento agentico multi-paso y planificacion de tareas.
- Generacion y comprension de codigo, con mejoras declaradas en tareas de programacion.
- Capacidades multimodales nativas: entrada de imagen y texto (pipeline `image-text-to-text`).
- Creacion 3D (capacidad destacada por el autor).
- Investigacion financiera y analisis de datos financieros.
- Precision factual mejorada respecto a Kimi K3, segun el autor.
- Ventana de contexto de 1M tokens para documentos y conversaciones extensas.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto, el modelo puede ingerir bases de codigo extensas y responder preguntas sobre arquitectura, dependencias o refactorizaciones sin trocear el codigo.
- Agentes autonomos de investigacion financiera: el modelo puede procesar informes anuales, transcripciones de resultados y datos de mercado en una sola ventana, razonando multi-paso sobre ellos.
- Generacion de codigo en produccion: adecuado para pipelines que requieren comprension de contexto amplio y coherencia entre multiples ficheros, dado su enfoque en tareas de programacion.
- Asistentes multimodales: al aceptar imagen y texto, puede emplearse en tareas de descripcion de capturas, extraccion de informacion de documentos escaneados o analisis de diagramas.
- Creacion 3D asistida: el autor destaca mejoras en creacion 3D, por lo que puede emplearse en generacion de descripciones estructuradas, scripts de modelado o flujos de trabajo en herramientas 3D.
- Atencion al cliente de alta complejidad: conversaciones multi-turno con historial extenso gracias a la ventana de 1M tokens, manteniendo coherencia en interacciones largas.
- Procesamiento de documentacion legal o tecnica extensa: contratos, normativas o manuales de gran volumen que requieren razonamiento sobre referencias cruzadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,78T de parametros totales, incluso en cuantizacion de 8 bits el modelo requiere del orden de terabytes de memoria. El repositorio ocupa 1561,4 GB, lo que da una idea de la escala de almacenamiento necesaria.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por escala, se requeriria un cluster multi-GPU de clase H100/H200 o superior; no se confirma en la documentacion.
- Cabe en consumer GPU: no. Ninguna GPU de consumo (RTX 4090, etc.) puede alojar un modelo de esta magnitud.
- Opciones de despliegue: la model card menciona `transformers` como libreria, con `custom_code` y `compressed-tensors`. No se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos confirmados de Kimi K3.1 Pro frente a alternativas de categoria similar, marcando como "no disponible" los campos sin datos verificados.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,78T | 104B | 1M | kimi-k3.1-pro (propia) | Hugging Face (repo de terceros) |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Procedencia del repositorio: el repositorio de Hugging Face pertenece al usuario `omegazug`, no a la organizacion oficial `moonshotai`. Debe verificarse la autenticidad e integridad de los pesos antes de usarlos en produccion.
- Licencia restrictiva: la licencia `kimi-k3.1-pro` es una licencia propia (`license: other`) cuyos terminos de uso comercial no se detallan en la informacion disponible; es imprescindible revisar el fichero LICENSE antes de cualquier despliegue comercial.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de factualidad independientes en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otras lenguas.
- Requisitos de infraestructura extremos: 2,78T de parametros y un repositorio de 1561,4 GB hacen inviable su uso fuera de infraestructura de datacenter.
- Contexto de 1M tokens: aunque declarado, no se aportan mediciones de rendimiento efectivo (por ejemplo, degradacion de atencion) a esa longitud.
- Tool calling y agentes: no se confirma explicitamente el soporte de function calling en la informacion disponible, pese a la orientacion agentica declarada.

## Enlaces

- Hugging Face (repo de terceros): https://huggingface.co/omegazug/Kimi-K3.1-Pro
- Organizacion oficial en Hugging Face: https://huggingface.co/moonshotai
- Chat: https://www.kimi.ai
- Homepage de Moonshot AI: https://www.moonshot.ai
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- API Quickstart: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
