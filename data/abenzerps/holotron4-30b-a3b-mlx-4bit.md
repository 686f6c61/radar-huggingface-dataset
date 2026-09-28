# abenzerps/Holotron4-30B-A3B-MLX-4bit

## Resumen

Holotron4-30B-A3B-MLX-4bit es una conversión al formato MLX del modelo base Hcompany/Holotron4-30B-A3B, publicada por el usuario abenzerps. Se trata de un modelo multimodal de tipo image-text-to-text orientado a agentes de uso de ordenador (computer use), automatización de interfaces gráficas (GUI), razonamiento visual y uso de herramientas. La conversión aplica cuantización afín de 4 bits con tamaño de grupo 64, lo que reduce el repositorio a 19,7 GB frente a los 33.015.598.918 parámetros totales del modelo original.

La arquitectura es un híbrido NemotronH MoE que combina capas Mamba2, una mezcla de expertos con 128 expertos y atención completa, e incorpora además un codificador visual RADIO v4-H y un codificador de audio Parakeet. La nomenclatura A3B del nombre indica una mezcla de expertos con aproximadamente 3.000 millones de parámetros activos por token, aunque este dato no se detalla numéricamente en la información disponible.

Su relevancia actual radica en que la model card declara mejoras muy amplias frente a Nemotron 3 Nano Omni en tareas de agentes: 76,3 frente a 21,0 en OSWorld (GUI) y 35,6 frente a 19,4 en AutomationBench (MCP). Al estar empaquetado en MLX, permite ejecutar un modelo de 33.000 millones de parámetros en equipos con Apple Silicon, un nicho donde la oferta de modelos agénticos multimodales cuantizados es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido NemotronH MoE: Mamba2 + MoE de 128 expertos + atencion completa; codificador visual RADIO v4-H y codificador de audio Parakeet |
| Parametros totales | 33.015.598.918 (33,0 mil millones) |
| Parametros activos | No disponible (la nomenclatura A3B del modelo base sugiere unos 3.000 millones activos por token, sin cifra confirmada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits afines (affine), tamano de grupo 64; el repositorio solo distribuye esta variante |
| Idiomas soportados | No disponible en la informacion del modelo |
| Licencia | NVIDIA Open Model Agreement (etiquetada como license: other) |
| Formato de pesos | safetensors en formato MLX (4 bits) |
| Tamano del repositorio | 19,7 GB |
| Libreria de inferencia | mlx (mlx-vlm) |
| Pipeline | image-text-to-text |
| Modelo base | Hcompany/Holotron4-30B-A3B (relacion: quantized) |
| Fecha de publicacion | 2026-09-28 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida poco habitual que mezcla dos paradigmas de secuencia. Por un lado, capas basadas en Mamba2, un modelo de espacio de estados que procesa secuencias con coste lineal en lugar del coste cuadratico de la atencion estandar. Por otro, capas de atención completa y una mezcla de expertos con 128 expertos que activa únicamente un subconjunto de ellos por token. Esta combinación permite mantener la capacidad de recuperación precisa de la atención tradicional en las capas que más la necesitan, mientras el resto del cómputo se apoya en Mamba2, más eficiente en memoria y en longitud de secuencia.

La parte multimodal la aportan dos codificadores independientes: RADIO v4-H para imágenes y Parakeet para audio, lo que en principio habilita entrada de texto, imagen y audio con salida de texto. El modelo base fue desarrollado por H company como parte de su familia de modelos agénticos Holo4, que interactúa con software a través de GUI, código, MCP y APIs. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La conversión a MLX se realizó con la herramienta mlx-vlm y no introduce cambios de arquitectura, solo la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte declarado de plantilla de chat a través de mlx-vlm.
- Comprensión de imágenes: la model card incluye un ejemplo explícito de descripción de elementos de interfaz de usuario a partir de capturas de pantalla.
- Comprensión de audio, gracias al codificador Parakeet integrado en la arquitectura del modelo base.
- Uso de ordenador (computer use) y automatización de GUI: interpretación de pantallas y decisión de la siguiente acción para cumplir un objetivo del usuario.
- Ejecución de tareas en terminal Linux, evaluada en el benchmark ALE.
- Uso de herramientas mediante el protocolo MCP, evaluado en AutomationBench.
- Comportamiento agéntico orientado a razonamiento visual multimodal.
- Integración con APIs y código como interfaz de interacción con el software.
- Soporte de generación de código (etiqueta agent y computer-use en el repositorio).
- No se documenta explícitamente soporte de function calling genérico, modo thinking, ni lista de idiomas admitidos.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede analizar capturas de pantalla de una interfaz y decidir la siguiente acción (clic, escritura, navegación) para completar un objetivo. Sus 76,3 puntos en OSWorld lo sitúan como una opción realista para flujos de trabajo GUI repetitivos.
- Agentes de operaciones en terminal: tareas de administración de sistemas y scripting evaluadas en ALE, útiles para asistentes que diagnostican y resuelven incidencias en entornos Linux.
- Orquestación de herramientas vía MCP: conexión de un agente a servidores MCP para encadenar llamadas a servicios y APIs en flujos multi-paso, respaldado por el resultado de 35,6 en AutomationBench.
- Soporte técnico asistido por captura de pantalla: el usuario envía una imagen de un error o de una interfaz y el modelo identifica los elementos relevantes y propone la acción correctiva.
- Pruebas de interfaz automatizadas: generación de secuencias de interacción sobre una aplicación web o de escritorio a partir de una descripción del flujo deseado, reduciendo el mantenimiento de scripts de test frágiles basados en selectores.
- Procesamiento de documentación con audio y vídeo: al combinar codificador visual y de audio, puede extraer información de reuniones grabadas, tutoriales o presentaciones y resumir los pasos de acción.
- Asistentes locales en equipos Apple: al distribuirse en MLX de 4 bits, permite desplegar un agente multimodal de 33.000 millones de parámetros en un portátil o Mac Studio con memoria unificada suficiente, sin depender de servicios en la nube.
- Extracción de información estructurada de capturas: lectura de formularios, paneles de control o tablas dentro de imágenes para alimentar pipelines de datos.

## Benchmarks y rendimiento

Los datos disponibles son los declarados por el autor del modelo base en la model card, comparando Holotron4-30B-A3B con Nemotron 3 Nano Omni:

| Benchmark | Interfaz | Nemotron 3 Nano Omni | Holotron4-30B-A3B | Ganancia |
|---|---|---|---|---|
| OSWorld | GUI | 21,0 | 76,3 | +55,3 |
| OSWorld 2.0 | GUI y codigo | 0,2 | 7,9 | +7,7 |
| AutomationBench | MCP | 19,4 | 35,6 | +16,2 |
| PinchBench | Terminal | 84,7 | 88,6 | +3,9 |
| ALE (Linux, codigo) | Terminal | 0,6 | 8,5 | +7,9 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de conocimiento general en la informacion disponible. Tampoco se han publicado mediciones especificas para esta variante cuantizada a 4 bits, por lo que el impacto de la cuantizacion en estas cifras no está cuantificado.

## Requisitos de hardware

- Los pesos ocupan 19,7 GB en disco. Para inferencia con MLX se recomienda memoria unificada de al menos 24 GB, y 32 GB o más para trabajar con contexto amplio, imágenes o audio simultáneamente.
- El formato MLX está diseñado para Apple Silicon: chips de la familia M1, M2, M3 y M4 con memoria unificada suficiente.
- En Macs con 16 GB de memoria unificada el modelo no cabe con margen operativo razonable; se necesita al menos una configuración de 24-32 GB.
- No se dispone de cifras oficiales de VRAM para GPU NVIDIA o AMD, ni de latencia o throughput medidos.
- La opción de despliegue documentada es mlx-vlm, tanto mediante su API en Python como por línea de comandos. No se documentan instrucciones para vLLM, llama.cpp, Ollama o TGI en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento OSWorld |
|---|---|---|---|---|---|
| Holotron4-30B-A3B (base) | 33,0 mil millones (MoE, ~3B activos) | No disponible | NVIDIA Open Model Agreement | HuggingFace (Hcompany) | 76,3 |
| Holotron4-30B-A3B-MLX-4bit | 33,0 mil millones, pesos de 4 bits | No disponible | NVIDIA Open Model Agreement | HuggingFace (MLX) | No medido en esta variante |
| Nemotron 3 Nano Omni 30B-A3B | 30 mil millones (MoE, 3B activos) | No disponible | No disponible | NVIDIA NIM y HuggingFace | 21,0 |
| Holo4 (familia de H company) | Dos variantes: 27B densa y 35B-A3B MoE | No disponible | No disponible | H Models API y HuggingFace | No disponible |

Los datos de la familia Holo4 provienen de la entrada de blog de H company, que describe los modelos como agénticos y capaces de interactuar con software a través de GUI, código, MCP y APIs. No se detalla si Holotron4-30B-A3B es una variante derivada de esa familia o un modelo previo con nomenclatura distinta.

## Limitaciones y advertencias

- La licencia es el NVIDIA Open Model Agreement, no una licencia de código abierto aprobada por la OSI. El uso comercial está sujeto a los términos de dicho acuerdo y debe revisarse antes de desplegar en producción.
- El repositorio no declara los idiomas soportados. No se puede asumir un rendimiento multilingüe equivalente al de modelos que sí publican esta información.
- La longitud de contexto no está documentada, lo que impide dimensionar correctamente casos de uso con conversaciones o capturas extensas.
- Se trata de una cuantización de 4 bits: puede haber degradación en tareas de razonamiento fino o de precisión numérica respecto al modelo base, y no se han publicado benchmarks de esta variante para verificarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad ni informes independientes de comportamiento.
- La conversión la realiza un tercero (abenzerps) y no el desarrollador original (H company), lo que implica que no hay soporte oficial ni garantía de fidelidad respecto al modelo base.
- Un modelo orientado a computer use puede ejecutar acciones destructivas o irreversibles sobre el sistema si se le concede control directo del ratón y el teclado. Se recomienda ejecutarlo en un entorno aislado y con confirmación humana en pasos críticos.
- Existe riesgo de alucinación en la interpretación de interfaces, especialmente cuando los elementos visuales son ambiguos o el texto en pantalla es pequeño.
- El rendimiento comparativo se ha medido frente a un único modelo de referencia (Nemotron 3 Nano Omni), lo que limita la generalización de las ganancias declaradas.
- Solo se distribuye en formato MLX, por lo que queda restringido a hardware Apple Silicon salvo que se obtenga el modelo base en otro formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abenzerps/Holotron4-30B-A3B-MLX-4bit
- Modelo base: https://huggingface.co/Hcompany/Holotron4-30B-A3B
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Blog de H company sobre Holo4: https://huggingface.co/blog/Hcompany/holo4
- Documentacion de NVIDIA Nemotron 3 Nano 30B A3B: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-nano-30b-a3b
- Pagina de modelos Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
