# AMAImedia/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje nativamente multimodal y orientado a agentes, desarrollado por Moonshot AI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token, lo que lo situa en la categoria de modelos de escala trillonaria. Es el primer modelo de la serie K3.1 y se post-entrena a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios.

La ficha que nos ocupa, `AMAImedia/Kimi-K3.1-Pro`, es una redistribucion (quantizacion de 8 bits) del modelo original de Moonshot AI, publicada por el usuario AMAImedia en el marco de su plataforma de doblaje automatico multilingue NOESIS. El repositorio ocupa 1566,3 GB e incluye pesos en formato safetensors con codigo personalizado (`custom_code`), lo que implica que requiere confiar en implementaciones no estandar para su carga.

Su relevancia actual radica en tres factores: una ventana de contexto de un millon de tokens, capacidades multimodales de entrada (texto e imagen) y un enfoque explicito hacia tareas agenticas, codigo, creacion 3D e investigacion financiera. La licencia es propietaria (`kimi-k3.1-pro`, etiquetada como `other`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con capas de atencion hibridas: 69 KDA + 24 Gated DSA |
| Parametros totales | 2,8 billones (2.780.110.363.392 segun safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (esta ficha); otras cuantizaciones no disponibles |
| Idiomas soportados | zh, en, es, fr, de, ja, ko, ar, pt, it, vi, ru, kz |
| Licencia | `kimi-k3.1-pro` (etiqueta `other` en Hugging Face) |
| Formato de pesos | safetensors con `custom_code` |
| Capas totales | 93 (1 capa densa) |
| Modalidades de entrada | Texto e imagen (pipeline `image-text-to-text`) |

## Arquitectura y entrenamiento

Kimi K3.1 Pro emplea una arquitectura transformer con mezcla de expertos (MoE) de 93 capas, de las cuales solo una es densa. El diseno de atencion es hibrido: combina 69 capas con KDA (Kimi Delta Attention, una forma de atencion lineal con estado recurrente) y 24 capas con Gated DSA (Deep Seeded Attention con compuertas), una combinacion pensada para sostener contextos de un millon de tokens con un coste de atencion contenido. Con 104.000 millones de parametros activos sobre 2,8 billones totales, la relacion de activacion es de aproximadamente el 3,7 %, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano.

El entrenamiento parte de Kimi K3 y se completa con aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, segun la model card del autor original. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO en etapas separadas. La model card menciona mejoras sustanciales en codigo, creacion 3D, investigacion financiera y precision factual respecto al modelo base. La ficha de AMAImedia es una conversion a 8 bits del checkpoint original y del repositorio DSpark de Inferact, y no aporta informacion adicional sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventanas de hasta un millon de tokens.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), lo que permite describir, analizar y razonar sobre imagenes junto a instrucciones textuales.
- Generacion de codigo y tareas de ingenieria de software, con mejoras declaradas respecto a Kimi K3.
- Razonamiento matematico y financiero, orientado a investigacion y analisis de datos.
- Creacion 3D, capacidad destacada explicitamente en la model card.
- Capacidades agenticas: el modelo esta descrito como "agentic model", pensado para planificacion multi-paso y ejecucion de tareas.
- Soporte multilingue en 13 idiomas: chino, ingles, espanol, frances, aleman, japones, coreano, arabe, portugues, italiano, vietnamita, ruso y kazajo.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible, aunque su orientacion agentica lo hace probable.
- Modo de razonamiento extendido (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con un millon de tokens de contexto, el modelo puede procesar informes anuales completos, expedientes legales o bases de codigo enteras en una sola pasada, sin necesidad de fragmentacion ni recuperacion externa.
- Investigacion financiera automatizada: la model card cita mejoras en investigacion financiera; el modelo puede extraer y cruzar datos de estados financieros, comparar ejercicios y generar resumenes analiticos a partir de documentos largos.
- Asistencia en ingenieria de software: generacion y revision de codigo en repositorios grandes, refactorizaciones que requieren contexto de multiples ficheros y explicacion de arquitecturas completas gracias a la ventana de contexto.
- Doblaje y localizacion automatica: es el caso de uso declarado por AMAImedia en su plataforma NOESIS; el modelo puede gestionar traduccion y adaptacion de guiones en los 13 idiomas soportados, incluyendo contexto visual si se le pasan fotogramas.
- Creacion y edicion 3D asistida: generacion de descripciones estructuradas, scripts de modelado o instrucciones para pipelines de render a partir de especificaciones textuales e imagenes de referencia.
- Agentes autonomos de atencion al cliente: conversaciones multi-turno con historial largo, consulta de herramientas externas y escalado a humanos, aprovechando la ventana de contexto para mantener el estado de la conversacion.
- Procesamiento multimodal de documentos escaneados: extraccion de informacion de facturas, formularios o capturas combinando entrada de imagen y texto en un unico modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Con 2,8 billones de parametros, incluso en 8 bits los pesos superan los 2,7 TB, por lo que la inferencia requiere un cluster multi-GPU, no una sola tarjeta.
- El repositorio ocupa 1566,3 GB, lo que da una idea del espacio en disco necesario para almacenar los pesos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por escala, se necesitarian nodos con multiples H100, H200 o Blackwell con interconexion de alta velocidad (NVLink/InfiniBand).
- No cabe en GPU de consumo. El autor de la ficha indica que su hardware local (RTX 3060 Laptop de 6 GB) solo sirve para trabajos de cuantizacion de clase 0,6-35B en RAM, y que los modelos de 9B en adelante requieren alquiler de H200/Blackwell.
- Opciones de despliegue: transformers con `custom_code` (formato nativo del repo). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible; llama.cpp y Ollama quedan descartados por el tamano del modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi K3.1 Pro (esta ficha, 8 bits) | 2,8 B | 104 B | 1.000.000 | `kimi-k3.1-pro` (other) | Multimodal, agentico, 93 capas |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Modelo base del que se post-entrena K3.1 Pro |
| Kimi-K3.1-Pro-DSpark (Inferact) | no disponible | no disponible | no disponible | no disponible | Repositorio base citado por AMAImedia |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia propietaria (`kimi-k3.1-pro`, etiqueta `other`): es imprescindible revisar los terminos del fichero LICENSE del repositorio original de Moonshot AI antes de cualquier uso comercial. La redistribucion de AMAImedia no aclara si impone condiciones adicionales.
- Esta ficha es una cuantizacion a 8 bits realizada por un tercero (AMAImedia), no el checkpoint oficial. Puede haber perdida de calidad respecto al modelo original, y el soporte y las garantias recaen en el redistribuidor.
- Requiere `custom_code` y `trust_remote_code=True` en transformers: implica ejecutar codigo del autor del repositorio, con el riesgo de seguridad asociado.
- Riesgo de alucinacion: no se han publicado evaluaciones de precision factual en la informacion disponible; la model card del autor original afirma mejoras en precision factual, pero sin datos verificables en esta ficha.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Limitaciones de idioma: aunque se listan 13 idiomas, no se especifica el nivel de competencia por idioma ni el volumen de datos de entrenamiento en cada uno; el espanol esta incluido pero sin garantias cuantificadas.
- Coste de despliegue muy elevado: 1566,3 GB de pesos y 2,8 B de parametros hacen inviable el uso local y obligan a infraestructura de centro de datos.
- La model card incluye contenido promocional y de captacion de donaciones ajeno al modelo; conviene tratarlo con cautela y acudir siempre al repositorio original de Moonshot AI como fuente autoritativa.

## Enlaces

- Repositorio en Hugging Face (esta ficha): https://huggingface.co/AMAImedia/Kimi-K3.1-Pro
- Repositorio original: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Repositorio DSpark: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark/tree/main
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Web de Moonshot AI: https://www.moonshot.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- X (Twitter) de Kimi: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Web de AMAImedia: https://www.amaimedia.com
- X (Twitter) de AMAImedia: https://x.com/AMAImediacom
- LinkedIn del autor de la ficha: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram de AMAImedia: https://t.me/AMAImediacom
