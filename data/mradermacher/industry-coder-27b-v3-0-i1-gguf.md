# mradermacher/Industry-Coder-27B-v3.0-i1-GGUF

## Resumen

Industry-Coder-27B-v3.0-i1-GGUF es la versión cuantizada con imatrix del modelo kataguru/Industry-Coder-27B-v3.0, publicada por mradermacher. Se trata de un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) orientado a ingeniería de software industrial, con etiquetas que apuntan a dominios como PLC, CNC, IEC 61131-3, TwinCAT, Siemens SCL, ciberseguridad y codificación agéntica. El autor de la cuantización no documenta los detalles de entrenamiento del modelo base en esta ficha; la información disponible procede de los metadatos y de las etiquetas del repositorio.

El modelo base se asocia en sus tags a las familias qwen3.8 y qwen3_5, con soporte declarado de bf16/bfloat16, vLLM, multimodalidad con visión y MTP (multi-token prediction), además de marcas como "uncensored" y "anti-sycophancy". Los idiomas declarados son inglés, finés, estonio, húngaro y turco. La licencia es Apache 2.0.

Esta publicación concreta es un conjunto de cuantizaciones GGUF de tipo i1 (imatrix, generadas con el método de ikawrakow) pensadas para ejecución local con llama.cpp y derivados. El repositorio ocupa 39,5 GB e incluye el fichero imatrix junto con los distintos niveles de cuantización. Es relevante para quienes necesitan desplegar un modelo de código de 27B en hardware propio sin renunciar al soporte multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se etiqueta como qwen3.8/qwen3_5, sin detalle arquitectónico publicado) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1/imatrix: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | en, fi, et, hu, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo base en la documentación proporcionada. Las etiquetas del repositorio mencionan qwen3.8 y qwen3_5, bf16, vLLM, multimodal con visión y MTP (multi-token prediction), lo que sugiere una arquitectura transformer con capacidades multimodales y decodificación multi-token, pero no se confirma ningún detalle estructural, número de capas, dimensión oculta ni mecanismo de atención.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación. Las etiquetas "uncensored" y "anti-sycophancy" apuntan a decisiones de alineación deliberadas, pero se desconoce el procedimiento. Esta publicación es únicamente una cuantización: mradermacher genera los ficheros i1 con un fichero imatrix propio (0,1 GB) y ofrece además cuantizaciones estáticas en un repositorio separado.

## Capacidades

- Generación de texto y razonamiento general, con especialización declarada en ingeniería de software.
- Generación y asistencia de código en dominios industriales: PLC, CNC, IEC 61131-3, TwinCAT y Siemens SCL.
- Ciberseguridad, según las etiquetas del repositorio.
- Codificación agéntica (agentic coding), lo que implica soporte para flujos multi-paso y uso de herramientas, aunque no se detalla el mecanismo de tool calling.
- Capacidades multimodales con visión: el repositorio se marca como vision model; los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas.
- Multilingüe en inglés, finés, estonio, húngaro y turco.
- Modo de decodificación multi-token (MTP) según las etiquetas.
- Comportamiento declarado como "uncensored" y "anti-sycophancy".

## Casos de uso

- Asistencia en programación de autómatas PLC: el modelo puede generar y revisar lógica en IEC 61131-3 para entornos TwinCAT, útil en equipos de automatización industrial que necesitan borradores de código verificables antes de pasar a simulación.
- Generación de código Siemens SCL: adecuado para proyectos de integración en TIA Portal donde se requiere producir bloques de función y documentación técnica a partir de especificaciones en lenguaje natural.
- Revisión de seguridad en entornos OT: con la etiqueta de ciberseguridad, puede emplearse para analizar configuraciones y código de control industrial en busca de patrones de riesgo, siempre con revisión humana.
- Agente de codificación en pipelines de CI/CD: su orientación a agentic coding permite integrarlo en flujos que encadenan lectura de repositorio, propuesta de parches y ejecución de pruebas, con la cautela de validar cada salida.
- Soporte multilingüe en Europa del norte y Turquía: al cubrir finés, estonio, húngaro y turco, sirve para equipos distribuidos en esos mercados que necesitan asistencia técnica en su idioma.
- Procesamiento de documentación técnica con imágenes: gracias al soporte de visión, puede interpretar diagramas de cableado, esquemas eléctricos o capturas de HMI para extraer información estructurada.
- Despliegue local en planta: las cuantizaciones GGUF permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo dentro de entornos con conectividad limitada, sin enviar código propietario a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de 27,3B, las cuantizaciones de 4 bits rondan los 15-17 GB, las de 5 bits unos 19-20 GB, las de 6 bits unos 22-24 GB y las de 8 bits en torno a 29-30 GB; las de 2-3 bits bajan a 9-13 GB. Son estimaciones por tamaño de fichero, no medidas publicadas.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permiten cargar el modelo completo; para Q6_K o Q8 conviene una A100 40 GB, L40S o H100.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits o inferiores en tarjetas de 24 GB; las de 2-3 bits pueden caber en 12-16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp) para GGUF; el modelo base en bf16 es compatible con vLLM y transformers según las etiquetas. Para visión se requiere el fichero mmproj del repositorio estático.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Industry-Coder-27B-v3.0 (esta ficha, i1-GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Especializado en código industrial, multimodal, 5 idiomas |
| Industry-Coder-27B-v3.0 (base, bf16) | 27,3B | no disponible | Apache 2.0 | safetensors | Mismo modelo sin cuantizar, para vLLM/transformers |
| Industry-Coder-27B-v3.0-GGUF (estático) | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas del mismo autor, incluye mmproj |

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada; los datos de rendimiento de terceros no están disponibles para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks, por lo que el rendimiento real en tareas de código industrial no está verificado de forma independiente.
- El etiquetado "uncensored" implica que las salvaguardas de contenido pueden ser reducidas; no es adecuado para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico en código de control industrial donde un error puede tener consecuencias físicas; toda salida debe pasar por revisión humana y simulación.
- Cobertura lingüística limitada a cinco idiomas; el español no está declarado, por lo que su calidad en castellano no está garantizada.
- Longitud de contexto desconocida; no se puede planificar el uso con documentos largos sin verificarla en el modelo base.
- Aunque la licencia es Apache 2.0, conviene revisar la ficha del modelo base por si hubiera condiciones adicionales no reflejadas en esta cuantización.
- El repositorio de cuantización tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- Para visión es necesario descargar el fichero mmproj desde el repositorio estático, no desde este.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/mradermacher/Industry-Coder-27B-v3.0-i1-GGUF
- Modelo base: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Industry-Coder-27B-v3.0-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Industry-Coder-27B-v3.0-i1-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
