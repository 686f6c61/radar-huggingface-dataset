# AleaiactaEst1/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de caracter agentico, publicado como pesos abiertos por Moonshot AI. Se trata del primer miembro de la serie K3.1 y, segun la model card, el modelo mas capaz de la familia de clase 3T de la compania. Parte de Kimi K3 y se somete a un post-entrenamiento mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, lo que se traduce en mejoras sustanciales en codificacion, creacion 3D, investigacion financiera, exactitud factica y capacidades agenticas.

Arquitectonicamente es un transformer de tipo Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token. Incorpora una composicion de capas de atencion hibrida formada por 69 capas KDA (Kimi Delta Attention) y 24 capas Gated DSA (Deep Seam Attention), con 93 capas en total y una sola capa densa. La ventana de contexto alcanza 1.000.000 de tokens, lo que lo situa en la categoria de modelos de contexto ultralargo.

Su relevancia actual radica en la combinacion de tres factores poco frecuentes: pesos abiertos en un modelo de escala 3T, multimodalidad nativa (pipeline image-text-to-text) y una ventana de contexto de un millon de tokens. El repositorio de HuggingFace ocupa 1.561,4 GB y los pesos se distribuyen en formato safetensors con cuantizacion de 8 bits mediante la libreria compressed-tensors, lo que condiciona fuertemente los requisitos de hardware para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: 69 capas KDA + 24 capas Gated DSA |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | 8 bits (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other, licencia propia) |
| Formato de pesos | safetensors (con compressed-tensors) |
| Capas totales | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension de cabeza de indice DSA | 128 |
| Cabezas de indice DSA | 32 |
| Top-K de indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Libreria | transformers (custom_code) |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 1.561,4 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con mezcla de expertos de grano fino: 896 expertos enrutados mas 2 expertos compartidos, de los cuales se activan 16 por token. La dimension latente del MoE es de 3584 y cada experto opera con una dimension oculta de 3072, lo que permite mantener un coste de computo por token acotado (104B activos) pese a los 2,8T totales. La atencion es hibrida: 69 capas usan KDA (Kimi Delta Attention) y 24 capas usan Gated DSA (Deep Seam Attention), con un mecanismo de indice DSA de 32 cabezas, dimension 128 y Top-K de 2048. Esta combinacion esta disenada para sostener contextos de hasta un millon de tokens sin que el coste de atencion crezca de forma cuadratica en la practica.

El entrenamiento parte de Kimi K3 y se completa con un post-entrenamiento basado en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. La model card no especifica el numero de tokens de preentrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como DPO o RLHF clasico; esos datos figuran como no disponibles. La innovacion tecnica mas destacable es la atencion hibrida KDA/DSA combinada con el enrutamiento MoE de grano fino, orientada a mantener eficiencia en contexto ultralargo y en cargas agenticas multiturno.

## Capacidades

- Generacion de texto y razonamiento de proposito general en modo conversacional.
- Codificacion y generacion de codigo, con mejoras declaradas por el autor en tareas de programacion.
- Creacion 3D, segun la model card.
- Investigacion financiera y analisis de dominios especializados.
- Multimodalidad nativa de entrada imagen-texto (pipeline image-text-to-text).
- Capacidades agenticas: el modelo se describe como agentic model, orientado a tareas multiturno y de multiples pasos.
- Ventana de contexto de 1.000.000 de tokens para documentos y conversaciones extensas.
- Exactitud factica mejorada respecto a Kimi K3, segun el autor.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Idiomas soportados: no disponible.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir bases de codigo extensas y razonar sobre dependencias entre modulos sin trocear el contenido, lo que reduce la perdida de contexto entre ficheros.
- Asistencia a la programacion en produccion: generacion y revision de codigo en pipelines de integracion continua, apoyandose en su entrenamiento orientado a tareas de codificacion y su capacidad conversacional multiturno.
- Investigacion financiera automatizada: sintesis de informes, extraccion de datos de documentos largos (memorias anuales, prospectos) y generacion de resumenes analiticos gracias a la ventana de contexto extendida.
- Creacion 3D asistida: generacion de descripciones, especificaciones y codigo de escenas o assets 3D, aprovechando la capacidad declarada por el autor en este dominio.
- Procesamiento de documentacion multimodal: al aceptar entrada imagen-texto, puede analizar capturas, diagramas o documentos escaneados junto con texto para tareas de extraccion y respuesta a preguntas.
- Agentes autonomos de multiples pasos: su naturaleza agentica y su contexto de 1M tokens permiten mantener el estado de tareas largas con muchas iteraciones de herramientas y observaciones intermedias.
- Analisis legal o regulatorio: lectura de contratos y normativa extensa en una sola pasada de contexto para deteccion de clausulas y comparacion entre documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en 8 bits ocupan aproximadamente 2,8 billones de parametros x 1 byte, es decir, del orden de 2,8 TB solo para los pesos. El repositorio completo ocupa 1.561,4 GB, lo que sugiere pesos cuantizados a 8 bits con overhead adicional. En cualquier caso, el despliegue exige agregados multi-GPU de gran escala.
- GPU recomendadas: no es desplegable en GPU consumer. Requiere clusters con GPUs de centro de datos (A100, H100, H200 o equivalentes) en numero elevado; la cifra exacta no esta disponible en la informacion proporcionada.
- Cabe en consumer GPU: no. Ni siquiera en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: transformers con custom_code y compressed-tensors segun la model card. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1.000.000 | kimi-k3.1-pro (other) | safetensors, 8 bits |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3T de pesos abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo documenta Kimi K3.1 Pro y su predecesor Kimi K3, del que no se ofrecen especificaciones numericas. No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria, por lo que la comparativa cuantitativa figura como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; al ser un modelo entrenado sobre datos web a gran escala, es previsible que herede sesgos de esos corpus, aunque no se documentan.
- Riesgo de alucinacion: la model card menciona mejoras en exactitud factica, pero no cuantifica la tasa de alucinacion; en tareas de investigacion financiera o legal conviene verificacion humana.
- Limitaciones de contexto o idioma: aunque el contexto es de 1M de tokens, el rendimiento efectivo en ventanas muy largas no esta documentado. Los idiomas soportados no se especifican.
- Restricciones de licencia: la licencia es propia (license: other, license_name "kimi-k3.1-pro"), no una licencia open source estandar. Es imprescindible revisar los terminos del fichero LICENSE del repositorio antes de cualquier uso comercial.
- Requisitos de despliegue extremos: 1.561,4 GB de repositorio y pesos en 8 bits implican infraestructura de centro de datos; no es viable en entornos de un solo nodo convencional.
- Madurez del repositorio: el modelo se publico el 2026-11-04 con 0 descargas y 0 likes en el momento de la consulta, y el autor del repositorio en HuggingFace (AleaiactaEst1) difiere de la organizacion oficial de Moonshot AI, lo que conviene verificar antes de confiar en los pesos.
- Ausencia de benchmarks publicos en la informacion disponible: no es posible validar de forma independiente las mejoras declaradas por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AleaiactaEst1/Kimi-K3.1-Pro
- Organizacion oficial en HuggingFace: https://huggingface.co/moonshotai
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Pagina de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
