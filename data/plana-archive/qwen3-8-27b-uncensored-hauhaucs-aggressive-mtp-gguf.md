# Plana-Archive/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una redistribución en formato GGUF del modelo Qwen/Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros con codificador de visión desarrollado por Qwen (Alibaba) y sometido aquí a un perfil de "descensura" agresivo por parte de HauhauCS, con alojamiento en el repositorio Plana-Archive. El objetivo declarado del autor es ofrecer respuestas directas sin comportamiento de rechazo (afirma 0 rechazos en 465 pruebas) sobre indicaciones difíciles, manteniendo las capacidades originales de texto, razonamiento, agentes, imagen y vídeo del modelo base.

La relevancia técnica de esta release no está en el ajuste de alineación, sino en dos componentes añadidos: por un lado, la preservación de la cabeza nativa MTP/NextN (predicción multi-token) en todas las cuantizaciones de texto y la incorporación de HauhauCS FastMTP, un sidecar de decodificación especulativa de 32K que el autor cifra en hasta 3,02x de velocidad de generación (TG) en documentos y 1,93x en razonamiento frente a la variante sin MTP; por otro, las cuantizaciones propietarias K_P ("Perfect"), que aplican análisis específico del modelo para conservar calidad donde más importa con un sobrecoste de tamaño del 5-15% respecto al quant base.

Arquitectónicamente es un híbrido: 64 capas de lenguaje, de las cuales 48 son Gated DeltaNet (atención lineal con estado recurrente) y solo 16 son atención con compuertas, con tamaño oculto de 5.120 y FFN de 17.408. El contexto nativo es de 262.144 tokens, ampliable hasta 1.000.000 según el autor. El repositorio pesa 172,5 GB y se publica bajo licencia Apache-2.0, con un aviso importante: la ficha de safetensors declara 1.863.907.840 parámetros totales, una cifra incoherente con el nombre "27B" y con los tamaños de archivo publicados (se detalla en la sección de limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso híbrido: 48 capas Gated DeltaNet + 16 capas de atención con compuertas, más codificador de visión |
| Parametros totales | 27B según el autor (modelo denso). El campo de safetensors del repositorio declara 1.863.907.840 parámetros, cifra incoherente con el nombre y con los tamaños de archivo; ver limitaciones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 según el autor |
| Tipos de cuantizacion | Q8_K_P (9,21 BPW), Q8_0, Q6_K_P (7,59), Q6_K, Q5_K_P (5,92), Q5_K_M, Q4_K_P (5,25), Q4_K_M, IQ4_XS (4,60), Q3_K_P (3,93), Q3_K_M, IQ3_M (3,74), IQ3_XS (3,56), Q2_K_P (3,12), IQ2_M (3,02). Adicionalmente: proyector de visión BF16 y sidecar FastMTP 32K |
| Idiomas soportados | Ingles, chino y multilingue (segun las etiquetas del repositorio; sin evaluacion por idioma publicada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos de texto con tensores MTP integrados), GGUF para el proyector de visión (mmproj BF16) y GGUF para el sidecar FastMTP |
| Capas del modelo de lenguaje | 64 |
| Tamano oculto / FFN | 5.120 / 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Tamano del repositorio | 172,5 GB |
| Pipeline | image-text-to-text (conversacional, compatible con endpoints) |
| Modelo base | Qwen/Qwen3.8-27B |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con 64 capas de lenguaje, tamaño oculto 5.120 y FFN de 17.408, que combina dos mecanismos de secuencia en la misma pila: 48 capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que mantiene coste de memoria constante respecto a la longitud de secuencia, y 16 capas de atención con compuertas, encargadas de la recuperación de información de largo alcance. A esto se suma un codificador de visión que permite entrada de imagen y vídeo a través de un proyector independiente. El vocabulario con padding es de 248.320 tokens. El autor no aporta cifras de tokens de entrenamiento ni composición del dataset, y no se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineación en el modelo base.

La intervención de esta release se limita al perfilado de descensura y a la capa de aceleración. Se preserva la cabeza nativa MTP/NextN (predicción multi-token) dentro de los tensores de cada GGUF de texto, y se añade HauhauCS FastMTP, un sidecar de 903 MB con un perfil de 32K que actúa como mecanismo de decodificación especulativa. El autor declara que este sidecar está cualificado sobre toda la línea de cuantizaciones a máxima ventana nativa, y reporta hasta 3,02x de TG en documentos y 1,93x en razonamiento frente a la variante sin MTP, así como un 35,2% y un 21,1% más de TG que el MTP embebido estándar en esos mismos escenarios. Las cuantizaciones K_P son un perfil propietario que analiza el modelo concreto para preservar con más bits las capas sensibles, con un incremento de tamaño de entre el 5% y el 15% sobre el quant base; los archivos siguen siendo GGUF estándar y no requieren builds ni plugins especiales.

## Capacidades

- Generacion de texto conversacional multi-turno con 262.144 tokens de contexto nativo, ampliables hasta 1.000.000 segun el autor.
- Razonamiento multi-paso y modos de pensamiento heredados del modelo base (la release declara preservar las capacidades de razonamiento y agenticas de Qwen3.8-27B).
- Generacion de codigo y tareas de ingenieria de software, al mantener intactas las capacidades de texto del base.
- Capacidades matematicas, no cuantificadas en la documentacion disponible.
- Vision: entrada de imagen y video mediante el proyector BF16 separado (mmproj, 931 MB). Sin el proyector, el modelo funciona solo con texto.
- Comportamiento sin rechazo: el autor declara 0 rechazos en 465 pruebas y respuestas directas con preambulo minimo en indicaciones dificiles (variante "Aggressive").
- Decodificacion especulativa integrada: cabeza MTP/NextN nativa mas sidecar FastMTP de 32K, activo en toda la linea de cuantizaciones.
- Soporte multilingue declarado para ingles, chino y otros idiomas, sin evaluacion publicada por idioma.
- Tool calling y function calling: no se documenta explicitamente en la informacion disponible para esta release, aunque el pipeline "image-text-to-text" y la etiqueta "endpoints_compatible" sugieren integracion en servidores de inferencia.
- Formato compatible con runtimes GGUF estandar (llama.cpp, LM Studio y otros), incluidas las cuantizaciones K_P.

## Casos de uso

- Generacion creativa sin filtros editoriales: el perfil Aggressive responde sin preambulos de conformidad, lo que resulta util en escritura de ficcion, guiones o narrativa con tematicas adultas donde los modelos alineados por defecto suelen rechazar o desviar la peticion.
- Analisis de documentos largos: con 262.144 tokens de contexto nativo y el sidecar FastMTP, es adecuado para resumir, extraer y razonar sobre expedientes, contratos o informes extensos, con la aceleracion declarada de hasta 3,02x en generacion sobre documentos.
- Procesamiento de imagen y video con el proyector BF16: descripcion de contenido visual, extraccion de texto en imagenes, etiquetado de fotogramas o control de calidad visual en pipelines automatizados, cargando el mmproj junto al GGUF de texto.
- Investigacion sobre alineacion y seguridad: la combinacion de un modelo sin rechazos con una ficha que declara 0/465 refusals lo convierte en un sujeto de estudio util para medir comportamientos de modelos descensurados y para calibrar clasificadores de seguridad externos. Requiere entorno aislado.
- Redaccion tecnica y de dominio especializado sin evasivas: en ambitos como seguridad ofensiva, forense digital o medicina, donde las politicas de rechazo genericas interfieren con consultas legitimas, el modelo mantiene la respuesta directa.
- Despliegue local en estaciones de trabajo: las cuantizaciones IQ3/IQ4 (12,18-15,71 GB) permiten ejecutar un modelo de 27B con vision en una GPU de 16-24 GB mediante llama.cpp o LM Studio, sin depender de APIs externas.
- Prototipado de agentes con contexto largo: la arquitectura hibrida con 48 capas Gated DeltaNet reduce el coste de memoria de la cache respecto a un transformer de atencion completa, lo que abarata mantener sesiones de agente prolongadas en local. El propio autor recomienda la variante Balanced, si existe, para trabajo agentico de contexto largo critico para la fiabilidad.
- Servicio de inferencia autogestionado con compatibilidad de endpoints: la etiqueta endpoints_compatible permite exponerlo tras una API compatible con OpenAI en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo aporta cifras de velocidad de generacion (TG) relativas, sin metodologia, hardware ni configuracion de decodificacion:

| Metrica declarada | Comparativa | Valor |
|---|---|---|
| TG en documentos | FastMTP frente a sin MTP | Hasta 3,02x |
| TG en razonamiento | FastMTP frente a sin MTP | Hasta 1,93x |
| TG en documentos | FastMTP frente a MTP embebido estandar | Hasta +35,2% |
| TG en razonamiento | FastMTP frente a MTP embebido estandar | Hasta +21,1% |
| Tasa de rechazo | Pruebas internas del autor | 0 de 465 |

## Requisitos de hardware

Las cifras de VRAM de abajo son estimaciones derivadas del tamano real de cada archivo publicado mas 1-2 GB de overhead de runtime; la cache KV no esta cuantificada en la informacion disponible y depende de la longitud de contexto y de la cuantizacion de la cache que se configure en el runtime.

| Cuantizacion | Tamano de archivo | VRAM estimada (pesos + overhead) | GPU objetivo |
|---|---:|---:|---|
| IQ2_M | 10,32 GB | ~12-14 GB | RTX 4070 Ti Super 16 GB, RTX 4080 16 GB, RTX 4090 24 GB |
| Q2_K_P | 10,68 GB | ~12-15 GB | RTX 4080 16 GB, RTX 4090 24 GB |
| IQ3_XS | 12,18 GB | ~14-16 GB | RTX 4080 16 GB (contexto moderado), RTX 4090 24 GB |
| IQ3_M | 12,79 GB | ~15-17 GB | RTX 4080 16 GB con contexto corto, RTX 4090 24 GB |
| Q3_K_P | 13,44 GB | ~15-18 GB | RTX 4090 24 GB |
| IQ4_XS | 15,71 GB | ~18-21 GB | RTX 4090 24 GB, RTX 3090 24 GB |
| Q4_K_P | 17,92 GB | ~20-23 GB | RTX 4090 24 GB (contexto medio), offload parcial a CPU con contexto largo |
| Q5_K_P | 20,22 GB | ~23-26 GB | Limite en 24 GB, recomendable 32 GB (RTX 5090) |
| Q6_K_P | 25,92 GB | ~28-31 GB | RTX 5090 32 GB, A6000 48 GB, o 24 GB con offload |
| Q8_K_P | 31,46 GB | ~34-38 GB | A6000 48 GB, A100 80 GB, H100 80 GB, 2x RTX 4090/5090 |
| mmproj BF16 (vision) | 931 MB | +1 GB | Requerido solo para entrada de imagen o video |
| FastMTP 32K | 903 MB | +1 GB | Requerido para la aceleracion especulativa declarada |

- Cabe en GPU de consumo: si, con las cuantizaciones de 10,32 a 17,92 GB (IQ2_M hasta Q4_K_P) en tarjetas de 16-24 GB. Las cuantizaciones de 20,22 GB en adelante exigen 32 GB o reparto entre GPU y CPU.
- GPU recomendadas por tramo: RTX 4090/3090 24 GB para IQ4_XS y Q4_K_P; RTX 5090 32 GB para Q5_K_P y Q6_K_P; A6000 48 GB, A100 80 GB o H100 80 GB para Q8_K_P.
- Opciones de despliegue: llama.cpp y LM Studio estan citados explicitamente por el autor como compatibles, incluidas las cuantizaciones K_P. Otros runtimes GGUF como Ollama deberian funcionar por compatibilidad de formato, aunque no se mencionan en la documentacion. No se documenta soporte de vLLM ni de TGI para los archivos K_P ni para el sidecar FastMTP.
- Latencia y throughput: no disponibles en valores absolutos. Solo se publican factores relativos de aceleracion (hasta 3,02x en documentos y 1,93x en razonamiento con FastMTP frente a la variante sin MTP).

## Comparativa con modelos similares

No se han encontrado en los resultados de busqueda alternativas documentadas de la misma categoria (GGUF descensurado multimodal de 27B con MTP) con datos verificables. La tabla siguiente compara la release con su propio modelo base y, como referencia de clase de tamano, con dos modelos densos ampliamente conocidos; los datos de estos ultimos proceden de su documentacion publica, no del material proporcionado, y los campos de rendimiento se dejan como no disponibles porque no hay benchmarks comparables en la informacion recibida.

| Modelo | Parametros | Contexto nativo | Vision | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27B (denso; ver discrepancia en parametros) | 262.144 | Si (proyector BF16 aparte) | Apache-2.0 | GGUF con MTP integrado + sidecars | Descensurado agresivo, quants K_P, FastMTP 32K |
| Qwen/Qwen3.8-27B (base) | 27B (denso) | No disponible | Si | Apache-2.0 | Safetensors | Modelo original de Qwen, alineado por defecto |
| Qwen3-32B | 32B (denso) | 128K | No | Apache-2.0 | Safetensors, GGUF | Referencia de clase similar sin vision |
| Gemma 3 27B | 27B (denso) | 128K | Si | Licencia Gemma (no Apache-2.0) | Safetensors, GGUF | Alternativa multimodal con licencia mas restrictiva |

## Limitaciones y advertencias

- Perfil sin rechazos por diseno: el autor declara 0 rechazos en 465 pruebas. Esto implica ausencia de barreras internas de seguridad y un riesgo alto de generar contenido danino, ilegal o sexualmente explicito. Cualquier despliegue en produccion o en producto orientado a usuarios necesita moderacion externa obligatoria.
- Recomendacion del propio autor: para trabajo agentico de contexto largo donde la fiabilidad es critica, el autor indica que una release "Balanced" (si existe) es la opcion por defecto mas segura, lo que sugiere que el perfil Aggressive puede degradar la consistencia en ese escenario.
- Discrepancia en el recuento de parametros: la ficha de safetensors declara 1.863.907.840 parametros (~1,86B), mientras que el nombre, la model card (27B denso, 64 capas, oculto 5.120) y los tamanos de archivo (por ejemplo, 31,46 GB a 9,21 BPW, que implican unos 27.000 millones de parametros) apuntan a 27B. La informacion disponible no permite resolver la discrepancia; conviene verificarla antes de planificar hardware.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, sin informes independientes de calidad, estabilidad ni reproducibilidad.
- Procedencia del alojamiento: el repositorio esta en la cuenta Plana-Archive, pero todos los enlaces de descarga de la model card apuntan a la cuenta HauhauCS. Es una redistribucion, no el repositorio original; conviene contrastar integridad y actualizaciones.
- Sin benchmarks de calidad publicados: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones multimodales. Las unicas cifras son factores de velocidad relativos sin metodologia publicada.
- Perdida de calidad por cuantizacion: las variantes IQ2_M y Q2_K_P (3,02 y 3,12 BPW) degradan notablemente un modelo de 27B, con impacto especialmente en razonamiento y codigo. Para uso serio se recomienda Q4_K_P o superior.
- Vision requiere descarga adicional: sin el archivo mmproj BF16 (931 MB) el modelo solo procesa texto; cargarlo consume VRAM adicional.
- Contexto extendido sin garantias: los 1.000.000 de tokens son una extension declarada, no un contexto nativo. No hay evaluacion de calidad en longitudes extremas ni del coste de cache asociado en las 16 capas de atencion completa.
- Idiomas: se declaran ingles, chino y multilingue, pero no hay evaluacion por idioma; en castellano el rendimiento es una incognita y probablemente inferior al de ingles y chino.
- Licencia y uso: el repositorio se publica como Apache-2.0, pero es un derivado descensurado de un modelo de Qwen. La licencia del artefacto no exime de las condiciones de uso del modelo base ni de las obligaciones legales aplicables al contenido generado; una variante sin rechazos puede incumplir politicas de uso aceptable del modelo original.
- Sidecar FastMTP: es un componente propietario de terceros sin especificacion tecnica publica. Su compatibilidad con versiones futuras de llama.cpp no esta garantizada y su efecto real sobre la calidad de salida no se documenta.
- Fechas del repositorio: creado y actualizado el 2026-09-25, sin historial posterior de mantenimiento en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Plana-Archive/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio de origen indicado en la model card (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Comunidad del autor (Discord): https://discord.gg/SZ5vacTXYf
- Modelo base: Qwen/Qwen3.8-27B (referenciado en las etiquetas del repositorio); no se proporciona URL directa en la informacion disponible.

Nota sobre la busqueda web: los resultados devueltos consistian integramente en hilos de un foro de contenido para adultos, sin ninguna relacion con el modelo. No se ha incorporado ningun enlace de esos resultados por no ser relevante ni verificable como fuente tecnica. No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos asociados a esta release en la informacion disponible.
