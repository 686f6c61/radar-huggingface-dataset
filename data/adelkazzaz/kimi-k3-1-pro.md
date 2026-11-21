# AdelKazzaz/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje y vision de tipo agente, con pesos abiertos, desarrollado por Moonshot AI. Se presenta como el primer modelo de la serie K3.1 y el mas capaz de la clase 3T de la compania. Deriva de Kimi K3 mediante un post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, y esta disenado especificamente para tareas agenticas: generacion de codigo, creacion 3D, investigacion financiera y precision factual.

Tecnicamente es un transformer de mezcla de expertos (MoE) con 2,8 billones de parametros totales y 104.000 millones activos por token, 93 capas y una ventana de contexto de 1 millon de tokens. Combina dos tipos de atencion: 69 capas KDA (Kimi Delta Attention, de atencion lineal) y 24 capas Gated DSA (atención dispersa dinamica con puerta), lo que reduce el coste computacional en contextos muy largos. Es nativamente multimodal (texto e imagen) y su pipeline en Hugging Face es `image-text-to-text`.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de frontera con capacidades agenticas y contexto de un millon de tokens; por otro, advierte de que el repositorio publicado por el usuario AdelKazzaz es una redistribucion (1561,4 GB, pesos en safetensors con cuantizacion de 8 bits mediante compressed-tensors) y no el repositorio oficial de Moonshot AI. La model card enlaza a la organizacion oficial `moonshotai`, por lo que conviene verificar el origen y la licencia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392) |
| Parametros activos | 104.000 millones por token |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Pesos publicados en 8 bits (compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `other`, con nombre de licencia "kimi-k3.1-pro" (terminos no detallados en la informacion disponible) |
| Formato de pesos | safetensors (con compresion compressed-tensors), libreria transformers con `custom_code` |

Otros datos de arquitectura: 93 capas (1 densa), dimension de atencion 7168, 96 cabezas de atencion, dimension de cabeza del indice DSA 128, 32 cabezas de indice DSA, top-K del indice DSA 2048, dimension latente MoE 3584, dimension oculta por experto 3072, 896 expertos, 16 expertos seleccionados por token, 2 expertos compartidos y vocabulario de 160.000 tokens.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atencion hibrida. La mayor parte de las capas (69) usan KDA, un mecanismo de atencion lineal que evita el crecimiento cuadratico del coste con la longitud de secuencia; las 24 capas restantes usan Gated DSA, una atencion dispersa dinamica que selecciona un subconjunto de tokens (top-K de 2048) mediante un indice de 32 cabezas. Esta combinacion permite sostener una ventana de 1 millon de tokens con un coste de atencion contenido. La capa MoE usa 896 expertos con 16 activos por token mas 2 compartidos, sobre una dimension latente de 3584 y una dimension oculta por experto de 3072.

El entrenamiento parte de Kimi K3 y aplica un post-entrenamiento con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, segun la model card. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset, ni si se usaron tecnicas concretas como RLHF o DPO mas alla de la mencion al RL. Tampoco se detallan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento en conversaciones multi-turno.
- Generacion y comprension de codigo, con mejoras declaradas por el autor en tareas de programacion.
- Capacidades matematicas y de investigacion financiera.
- Creacion 3D, segun la model card.
- Precision factual mejorada respecto a Kimi K3.
- Modalidad nativa de imagen y texto (pipeline `image-text-to-text`).
- Capacidades agenticas: el modelo se describe como "agentic model", orientado a tareas de varios pasos.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el enfasis agentico lo hace probable.
- Capacidades multilingues: no disponible el listado de idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Generacion de codigo en produccion: con 104.000 millones de parametros activos y contexto de 1 millon de tokens, puede mantener repositorios completos en contexto y resolver tareas de refactorizacion o depuracion sobre multiples ficheros en una sola pasada.
- Agentes autonomos de varios pasos: su post-entrenamiento con RL en dominios downstream lo orienta a planificar y ejecutar secuencias de acciones con herramientas, adecuado para pipelines de automatizacion de tareas.
- Investigacion financiera asistida: analisis de informes extensos, extraccion de datos y resumen de documentos largos gracias a la ventana de contexto y a la mejora declarada en precision factual.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno con historial extenso y contexto de hasta 1 millon de tokens, util para soporte con documentacion de producto muy voluminosa.
- Analisis de documentos e imagenes combinados: al ser nativamente multimodal, puede procesar capturas, diagramas o graficos junto a texto en tareas de extraccion y verificacion.
- Creacion 3D y prototipado: generacion de descripciones, estructuras y codigo para herramientas de modelado 3D, area en la que el autor declara mejoras.
- Investigacion academica y experimentacion: al ser un modelo de pesos abiertos de clase 3T, sirve como base para estudiar atencion lineal, MoE a gran escala y comportamiento agentico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados ocupan 1561,4 GB en 8 bits, por lo que la inferencia completa requiere un cluster multi-GPU de al menos ese orden de memoria. Con cuantizaciones de 4 bits no disponibles en el repositorio, el requisito seguiria siendo de cientos de GB.
- GPU recomendadas: H100, H200 o B200 en configuraciones multi-nodo; A100 de 80 GB en numero elevado. No es viable en GPU de consumo.
- Cabe en consumer GPU: no. Ni siquiera en RTX 4090 (24 GB) con las cuantizaciones publicadas.
- Opciones de despliegue: transformers (libreria declarada, requiere `custom_code`), vLLM o TGI para servir a gran escala; llama.cpp y Ollama no estan confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8 T | 104 B | 1.000.000 | kimi-k3.1-pro (other) | Pesos en HF (redistribucion) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El repositorio de Hugging Face pertenece al usuario AdelKazzaz, no a la organizacion oficial de Moonshot AI; conviene verificar la integridad y el origen de los pesos antes de usarlos.
- La licencia es "other" con nombre "kimi-k3.1-pro"; los terminos exactos no estan detallados en la informacion disponible, por lo que el uso comercial requiere revisar el fichero LICENSE del repositorio oficial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la model card declara mejoras en precision factual, pero no se aportan metricas.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; el rendimiento fuera de los idiomas principales del entrenamiento puede degradarse.
- El contexto de 1 millon de tokens no garantiza recuperacion perfecta de la informacion en posiciones intermedias.
- El soporte de tool calling no esta confirmado explicitamente en la informacion disponible.
- El tamano del repositorio (1561,4 GB) y los requisitos de memoria hacen inviable el despliegue en hardware de consumo.
- La fecha de creacion del repositorio (2026-11-21) y la ausencia de descargas o likes sugieren un artefacto reciente o no validado por la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AdelKazzaz/Kimi-K3.1-Pro
- Organizacion oficial en Hugging Face: https://huggingface.co/moonshotai
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
