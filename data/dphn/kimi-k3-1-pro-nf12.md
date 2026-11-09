# dphn/Kimi-K3.1-Pro-NF12

## Resumen

Kimi-K3.1-Pro-NF12 es una cuantizacion de 12 bits del modelo Kimi-K3.1-Pro desarrollada por el usuario dphn mediante la tecnica NF12. El modelo base, obra de Moonshot AI, es un modelo agentico nativamente multimodal de clase 3T (2,8 billones de parametros totales, 104 mil millones activos) con arquitectura Mixture-of-Experts y una ventana de contexto de un millon de tokens. Se trata del primer modelo de la serie K3.1 y fue post-entrenado desde Kimi K3 con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios.

La relevancia de esta variante concreta es practica: NF12 comprime los pesos en BF16 a aproximadamente 12 bits sin perdida de precision declarada, reduciendo el checkpoint en 26,8 GiB. En un despliegue con 8 GPUs B300 en paralelo de tensor, el ahorro es de unos 5,38 GiB por GPU (43,01 GiB en total), lo que libera memoria para cache KV. Es, por tanto, una version orientada a inferencia en clústeres de alta gama, no a hardware de consumo.

El modelo se publica bajo licencia propia "kimi-k3.1-pro" (etiquetada como `other`), con pipeline `image-text-to-text` y pesos en safetensors con codigo personalizado para transformers. El repositorio ocupa 1533 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2.818.830.909.627 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NF12 (aproximadamente 12 bits sobre pesos BF16); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (etiqueta `other`) |
| Formato de pesos | safetensors (con `custom_code` para transformers) |

Datos adicionales de arquitectura: 93 capas (1 densa), 69 capas de atencion KDA y 24 de Gated DSA, dimension oculta de atencion 7168, 96 cabezas de atencion, dimension de cabeza de indice DSA 128 con 32 cabezas y top-K 2048, dimension latente MoE 3584, dimension oculta por experto 3072 y 896 expertos.

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer de tipo Mixture-of-Experts con 896 expertos y 104B parametros activos por token sobre un total de 2,8T. La innovacion estructural mas destacable es la composicion de atencion: 69 capas usan KDA (Kimi Delta Attention) y 24 usan Gated DSA (Deep Seam Attention con compuerta), una combinacion hibrida disenada para sostener contextos de un millon de tokens con coste de atencion contenido. El enrutamiento MoE opera sobre una dimension latente de 3584 y cada experto tiene una dimension oculta de 3072.

El post-entrenamiento se realizo desde Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, lo que explica las mejoras declaradas en codigo, creacion 3D, investigacion financiera, precision factual y capacidades agenticas. No se dispone de datos sobre el numero de tokens de preentrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como DPO. La variante NF12 no reentrena el modelo: solo recuantiza los pesos BF16 a unos 12 bits, con la afirmacion del autor de cero degradacion en precision.

## Capacidades

- Generacion de texto y razonamiento de proposito general en un modelo de clase 3T.
- Codigo: mejoras sustanciales declaradas en tareas de programacion respecto a Kimi K3.
- Creacion 3D: capacidad destacada explicitamente en la model card.
- Investigacion financiera y analisis de documentos extensos.
- Precision factual mejorada segun el autor.
- Modalidad nativa de imagen y texto (pipeline `image-text-to-text`), es decir, entrada de imagenes junto a texto.
- Capacidades agenticas: el modelo se describe como "agentic model", orientado a flujos multi-paso.
- Contexto de un millon de tokens para razonamiento sobre corpus muy largos.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con un millon de tokens de contexto, el modelo puede ingerir un monorepo o una base de codigo extensa y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el contexto.
- Agentes de ingenieria de software: su naturaleza agentica y su rendimiento declarado en codigo lo hacen adecuado para pipelines que planifican, editan y verifican cambios en multiples pasos.
- Investigacion financiera automatizada: procesamiento de informes anuales, transcripciones de resultados y estados financieros extensos para extraer comparativas y resumenes con trazabilidad sobre el documento original.
- Generacion de escenas y assets 3D: dada la mejora declarada en creacion 3D, puede asistir en la generacion de descripciones estructuradas, scripts de modelado o especificaciones de escena a partir de instrucciones e imagenes de referencia.
- Analisis documental multimodal: al aceptar imagen y texto, puede procesar capturas de pantalla, diagramas o paginas escaneadas junto a texto para tareas de extraccion y verificacion.
- Revision legal o tecnica de contratos largos: la ventana de 1M tokens permite comparar versiones completas de contratos o especificaciones sin perder referencias cruzadas.
- Despliegue en clústeres de inferencia de alta gama: la variante NF12 esta pensada para servir el modelo en 8x B300 con TP, donde el ahorro de memoria libera espacio para cache KV en sesiones de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona mejoras cualitativas en codigo, creacion 3D, investigacion financiera, precision factual y capacidades agenticas respecto a Kimi K3, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El repositorio ocupa 1533 GB en disco; el autor indica que NF12 ahorra 26,8 GiB frente al checkpoint BF16.
- Despliegue de referencia del autor: 8 GPUs B300 en paralelo de tensor, con un ahorro de aproximadamente 5,38 GiB por GPU (43,01 GiB en total) gracias a NF12.
- GPU recomendadas: B300 (configuracion indicada por el autor). Para un modelo de 2,8T de parametros totales y 104B activos, se requiere infraestructura de centro de datos con multiples GPUs de alta memoria; A100 y H100 no estan confirmadas en la informacion disponible.
- Cabe en GPU de consumo: no. El tamano del checkpoint (1533 GB) y el numero de parametros lo excluyen de RTX 4090 o similares.
- Opciones de despliegue: transformers con `custom_code`. El autor indica que las instrucciones para ejecutar el modelo se publicaran proximamente. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro-NF12 (esta ficha) | 2,8T / 104B | 1M | kimi-k3.1-pro | Hugging Face, 1533 GB | Cuantizacion NF12 de 12 bits del modelo base |
| moonshotai/Kimi-K3.1-Pro | 2,8T / 104B | 1M | kimi-k3.1-pro | Hugging Face (modelo base) | Pesos BF16 originales |
| Otros modelos de clase 3T | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada |

La unica comparacion documentada es con el propio modelo base en BF16: NF12 reduce el checkpoint en 26,8 GiB y, en 8x B300, libera 5,38 GiB por GPU, con cero degradacion de precision declarada por el autor.

## Limitaciones y advertencias

- La cuantizacion NF12 es una tecnica propietaria del autor (dphnAI) y depende de codigo personalizado (`custom_code`) para transformers; la portabilidad a otros runtimes no esta confirmada.
- El autor indica que las instrucciones de ejecucion "se proporcionaran pronto", por lo que el soporte practico de despliegue es limitado en el momento de la publicacion.
- El modelo base esta bajo licencia propia "kimi-k3.1-pro" (etiqueta `other`); es imprescindible revisar los terminos del archivo LICENSE del repositorio de Moonshot AI antes de cualquier uso comercial.
- El repositorio no registra descargas ni likes, y la fecha de creacion es muy reciente; no hay validacion independiente de la afirmacion de "cero degradacion en precision".
- Riesgo de alucinacion: inherente a los modelos de lenguaje de gran escala; la model card no documenta evaluaciones de factualidad con cifras.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de produccion.
- Requisitos de hardware extremos (8x B300 como referencia), lo que limita su uso a organizaciones con infraestructura de centro de datos.
- Contexto de 1M tokens: aunque soportado, el coste de cache KV y la degradacion en recuperacion a distancias extremas deben validarse empiricamente para cada caso.

## Enlaces

- Repositorio Hugging Face de esta variante: https://huggingface.co/dphn/Kimi-K3.1-Pro-NF12
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Repositorio de la tecnica NF12: https://github.com/dphnAI/NF12
- Blog tecnico de Kimi K3.1 Pro: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- X/Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
