# kaitemoreau/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y orientado a agentes, publicado en abierto por Moonshot AI. Se presenta como el primer miembro de la serie K3.1 y como el modelo mas capaz de la clase 3T de la compania. Deriva de Kimi K3 tras un post-entrenamiento basado en aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios de aplicacion, con mejoras declaradas en programacion, creacion 3D, investigacion financiera, precision factica y capacidades agenticas.

Tecnicamente es un transformer de mezcla de expertos (MoE) con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token. La ventana de contexto alcanza el millon de tokens y el modelo es nativamente multimodal (entrada de imagen y texto, salida de texto). La arquitectura combina 93 capas con un total de 896 expertos, de los cuales se activan 16 por token mas 2 expertos compartidos, y una composicion de atencion hibrida formada por 69 capas KDA y 24 capas Gated DSA.

La relevancia de esta ficha es doble: por un lado, documenta las especificaciones de un modelo frontera de escala 3T publicado con pesos abiertos; por otro, advierte de que la unica copia disponible en Hugging Face bajo el identificador `kaitemoreau/Kimi-K3.1-Pro` es un repositorio de terceros, no oficial, con cero descargas y cero likes, cuyo README reproduce la model card de Moonshot AI pero cuya licencia declarada (`kimi-k3.1-pro`) no coincide con la licencia del repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atencion hibrida (69 capas KDA + 24 capas Gated DSA) |
| Parametros totales | 2,8 billones (2.780.110.363.392 segun safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag `8-bit`), `compressed-tensors`; no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia personalizada, `license: other`); la licencia del repositorio oficial de Moonshot AI no se detalla en la informacion disponible |
| Formato de pesos | safetensors (con `custom_code` en transformers) |
| Numero de capas | 93 (1 capa densa) |
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
| Tamano del repositorio | 1561,4 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer MoE de 93 capas con una unica capa densa. El bloque de mezcla de expertos contiene 896 expertos de 3072 dimensiones ocultas cada uno, con 16 expertos seleccionados por token y 2 expertos compartidos, operando sobre una dimension latente de 3584. La atencion no es uniforme: 69 capas usan KDA (Kimi Delta Attention) y 24 capas usan Gated DSA (DeepSeek Sparse Attention con compuerta), con 96 cabezas de atencion de dimension 7168 y un indice DSA de 32 cabezas, dimension 128 y Top-K de 2048. Esta combinacion hibrida de atencion lineal y atencion dispersa es la que permite sostener una ventana de contexto de un millon de tokens sin un coste cuadratico pleno.

El post-entrenamiento se describe como un aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, partiendo de Kimi K3. La model card no detalla el volumen de tokens de preentrenamiento, la composicion del dataset, ni si se aplicaron fases especificas de RLHF o DPO; esa informacion no esta disponible. Tampoco se documentan en la informacion proporcionada innovaciones adicionales como decodificacion especulativa o modos de razonamiento explicito.

## Capacidades

- Generacion de texto y conversacion multi-turno con un contexto de hasta 1.000.000 de tokens.
- Razonamiento y capacidades agenticas: el modelo se presenta explicitamente como "agentic model", post-entrenado con RL sobre dominios downstream.
- Programacion: se declaran mejoras sustanciales en tareas de codigo respecto a Kimi K3.
- Creacion 3D: capacidad destacada en la introduccion del modelo.
- Investigacion financiera: dominio de aplicacion mencionado de forma explicita.
- Precision factica: mejora declarada en exactitud de hechos.
- Multimodalidad nativa de entrada: pipeline `image-text-to-text`, es decir, acepta imagenes y texto y genera texto.
- Tool calling / function calling: no se detalla de forma explicita en la informacion disponible, aunque el enfoque agentico del modelo lo hace esperable; no se confirma.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de repositorios completos: con 1.000.000 de tokens de contexto, el modelo puede ingerir un monorepositorio grande o una base de codigo entera en una sola pasada y responder preguntas de arquitectura, dependencias o refactorizaciones sin trocear el codigo.
- Agentes de ingenieria de software: integrado en un bucle de tool calling sobre Git, CI/CD y entornos de ejecucion, el modelo puede planificar cambios multi-paso, ejecutar tests y corregir errores, aprovechando su post-entrenamiento con RL en dominios de codigo.
- Investigacion financiera asistida: analisis de informes anuales, transcripciones de resultados y series de datos extensas dentro de una misma ventana de contexto, con extraccion de cifras y comparacion entre ejercicios.
- Creacion 3D y pipelines de contenido: generacion de descripciones estructuradas, scripts de modelado o especificaciones tecnicas a partir de imagenes de referencia, gracias a su entrada multimodal.
- Revision documental de gran volumen: auditoria de contratos, expedientes regulatorios o documentacion tecnica de cientos de paginas en una sola consulta, reduciendo la perdida de contexto entre fragmentos.
- Asistentes conversacionales de dominio con memoria larga: atencion al cliente o soporte tecnico donde el historial completo del cliente y el manual de producto caben en el contexto, evitando resumenes intermedios que degradan la precision.
- Verificacion factica y control de calidad de contenidos: contraste de afirmaciones contra corpus extensos cargados en contexto, apoyandose en la mejora declarada de precision factica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 billones de parametros y pesos en 8 bits, el peso del modelo ronda los 2,8 TB, muy por encima de cualquier GPU individual. El repositorio ocupa 1561,4 GB, lo que sugiere una representacion comprimida adicional, pero sigue requiriendo agregacion de memoria en multiples nodos.
- GPU recomendadas: despliegue multi-nodo con GPUs de centro de datos (H100, H200, B200 o equivalentes). No se dispone de cifras oficiales de configuracion minima en la informacion proporcionada.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU de consumo realistas.
- Opciones de despliegue: la libreria declarada es `transformers`, con `custom_code` y pesos en `compressed-tensors`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8 T | 104 B | 1.000.000 | `kimi-k3.1-pro` (other) | Pesos en HF (copia de terceros) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Referenciado como modelo base |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio `kaitemoreau/Kimi-K3.1-Pro` es una publicacion de un tercero, no de Moonshot AI. No es el repositorio oficial y no hay garantia de que los pesos sean identicos a los publicados por el desarrollador.
- El repositorio tiene 0 descargas y 0 likes, lo que impide cualquier validacion de la comunidad sobre la integridad de los pesos.
- La licencia declarada en el repositorio (`kimi-k3.1-pro`) difiere de la licencia del repositorio oficial de Moonshot AI; antes de cualquier uso comercial debe verificarse la licencia original en el repositorio oficial.
- Riesgo de alucinacion: no se han publicado evaluaciones independientes de este checkpoint concreto; la precision factica declarada por el autor no debe tomarse como validada.
- Sesgos conocidos: no disponible.
- Limitaciones de idioma: no se ha publicado la lista de idiomas soportados; el rendimiento en castellano no esta documentado.
- Coste de despliegue prohibitivo: 2,8 T de parametros y un repositorio de 1561,4 GB exigen infraestructura multi-nodo, lo que descarta el uso en local o en entornos de un solo servidor.
- Contexto de un millon de tokens: aunque soportado, el rendimiento real en contextos muy largos no esta verificado de forma independiente en la informacion disponible.
- Formato `custom_code`: requiere cargar codigo personalizado con `trust_remote_code`, lo que implica riesgos de seguridad y de compatibilidad con versiones de `transformers`.

## Enlaces

- Repositorio en Hugging Face (copia de terceros): https://huggingface.co/kaitemoreau/Kimi-K3.1-Pro
- Organizacion oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Guia de inicio rapido de la API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Pagina principal de Moonshot AI: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
