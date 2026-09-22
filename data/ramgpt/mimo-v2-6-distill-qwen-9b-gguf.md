# ramgpt/MiMo-V2.6-Distill-Qwen-9B-GGUF

## Resumen

`ramgpt/MiMo-V2.6-Distill-Qwen-9B-GGUF` es un repositorio de cuantizaciones GGUF publicadas por el usuario ramgpt sobre el modelo `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, desarrollado por Xiaomi. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local con llama.cpp del modelo destilado de Xiaomi, que a su vez se apoya en la arquitectura Qwen 3.5 (etiqueta `qwen3_5` en el repositorio) y cuenta con 8.953.803.264 parámetros (unos 8,95 mil millones).

El problema que resuelve es práctico: el modelo original pesa demasiado para GPUs de consumo y para despliegues en servidores sin aceleradores dedicados. Estas cuantizaciones reducen el peso a entre 5,20 GB (IQ4_XS, 4,63 bits por peso) y 5,63 GB (Q4_K_M, 5,02 bits por peso), manteniendo la plantilla de chat Jinja original embebida byte a byte y verificada mediante hash.

La relevancia actual del repositorio está en su método de calibración: la cuantización IQ4_XS no usa una matriz de importancia basada solo en Wiki, sino una mezcla de tareas que incluye texto general, código C/C++ y Python real de llama.cpp, shell/config/JSON, documentación de seguridad OWASP y ejemplos de chat y tool calling al estilo MiMo. Además, el autor publica la propia matriz de importancia (iMatrix) y documenta las comprobaciones realizadas en una RTX 4090, lo que permite auditar y reproducir el proceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen 3.5 (etiqueta `qwen3_5`); 32 bloques; la config upstream declara `mtp_num_hidden_layers: 1`, pero los safetensors publicados no contienen tensores MTP/NextN |
| Parametros totales | 8.953.803.264 (aproximadamente 8,95 mil millones) |
| Parametros activos | No aplica: el modelo no es MoE (no disponible confirmación explícita en la información) |
| Longitud de contexto | No disponible en la información del repositorio; el ejemplo de lanzamiento de llama.cpp usa `-c 8192` como configuración de runtime |
| Tipos de cuantizacion | IQ4_XS con iMatrix (4,63 BPW), Q4_K_M (5,02 BPW); el GGUF intermedio de conversión es BF16. `output.weight` se mantiene en Q6_K y tensores de atención seleccionados se promueven a Q5_K |
| Idiomas soportados | No disponible |
| Licencia | No disponible; el repositorio upstream no declaraba licencia en sus metadatos en el momento de preparar las cuantizaciones |
| Formato de pesos | GGUF (llama.cpp); repositorio de 10,8 GB |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 32 bloques perteneciente a la familia Qwen 3.5, destilado por Xiaomi a partir de MiMo v2.6 y publicado como `MiMo-V2.6-Distill-Qwen-9B`. El detalle del preentrenamiento y del proceso de destilación (número de tokens, composición del dataset, uso de RLHF o DPO) no está disponible en la información proporcionada. La model card de esta cuantización solo documenta la parte de conversión y cuantización, no el entrenamiento del modelo original.

La innovación técnica destacable de este repositorio reside en la cuantización. La matriz de importancia IQ4_XS se generó con una mezcla de calibración multitarea en lugar de una calibración exclusiva de Wiki: contexto de 512 tokens por fragmento, 64 fragmentos procesados, 248 entradas de matriz de importancia y cobertura de las 32 capas (32/32). Las métricas reportadas son una tasa de activación mínima de tensores del 97,78 %, una mediana del 100 % y una entropía de activación normalizada mediana del 81,82 %. Los ficheros se convirtieron con un GGUF en BF16 generado con `--no-nextn`, porque la conversión estándar producía metadatos que hacían que llama.cpp solicitara un tensor inexistente `blk.32.attn_norm.weight`. El resultado declara 32 bloques y carece de metadatos `qwen35.nextn_predict_layers`.

## Capacidades

- Generación de texto conversacional de propósito general, con validación local de explicaciones de conocimiento general y de cultura técnica.
- Razonamiento aritmético: el autor documenta una prueba de aritmética superada en la validación local.
- Generación de código: prueba superada, coherente con una calibración que incluye C/C++ y Python reales de llama.cpp.
- Explicaciones breves de ciberseguridad: prueba superada, apoyada en el uso de documentación OWASP dentro de la mezcla de calibración.
- Tool calling y function calling estructurado: prueba de llamada estructurada a función/herramienta superada; la calibración incluye ejemplos de tool calling al estilo MiMo.
- Conversación multi-turno con historial: prueba superada.
- Modo de razonamiento explícito (thinking), habilitado mediante `chat_template_kwargs: {"enable_thinking": true}` en llama-server.
- Manejo de formatos estructurados (shell, configuración, JSON), presentes en la mezcla de calibración.
- Capacidades multilingües: no disponibles.
- Visión o audio: no disponibles; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Asistente conversacional on-premise: el modelo puede desplegarse con `llama-server` y servir peticiones compatibles con la API de OpenAI desde una única GPU, lo que resulta adecuado para entornos con requisitos de soberanía de datos en los que no se quiere enviar conversaciones a una API externa.
- Generación de código en desarrollo local: dado que la calibración incluye código C/C++ y Python real y la validación local superó la prueba de generación de código, puede emplearse como asistente integrado en el editor o como generador de parches en un flujo de trabajo offline.
- Agentes con tool calling: la prueba de llamada estructurada a función superada y la presencia de ejemplos de tool calling en la calibración lo hacen apto para orquestadores de agentes que necesiten emitir llamadas JSON a herramientas, aunque con verificación en producción dado que no hay benchmarks publicados.
- Análisis y redacción de documentación de seguridad: la incorporación de documentación OWASP en la calibración favorece explicaciones sobre vulnerabilidades, configuraciones inseguras y buenas prácticas, siempre como apoyo y no como sustituto de una revisión humana.
- Procesamiento de configuraciones, scripts y JSON: útil para tareas de normalización, generación o validación de ficheros de configuración y scripts de shell en canalizaciones internas.
- Prototipado e investigación en cuantización: el repositorio incluye el fichero iMatrix (5,15 MB) y los hashes SHA256, lo que permite reproducir experimentos de cuantización y comparar el efecto de la mezcla de calibración multitarea frente a calibraciones basadas solo en Wiki.
- Evaluación comparativa de modelos destilados de 9B: sirve como punto de referencia local para medir el comportamiento de un destilado de MiMo v2.6 frente a otros modelos del mismo rango, siempre que se aporten los benchmarks propios, ya que el repositorio no los incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente recoge validaciones cualitativas ejecutadas en una RTX 4090 con llama.cpp: carga del modelo correcta, coincidencia exacta entre la plantilla embebida y la upstream, aritmética superada, generación de código superada, explicación breve de ciberseguridad superada, explicación de conocimiento general superada, historial multi-turno superado, llamada estructurada a función/herramienta superada y ausencia de bucles de repetición en pruebas de humo acotadas.

## Requisitos de hardware

- Tamaño de pesos: 5,20 GB para IQ4_XS (4,63 BPW) y 5,63 GB para Q4_K_M (5,02 BPW), más 5,15 MB del fichero iMatrix.
- VRAM total necesaria: depende del contexto y del tamaño de la caché KV, no cuantificado en la información disponible. Como referencia, la VRAM destinada a pesos es de aproximadamente 5,2 a 5,6 GB, a la que hay que sumar la caché KV y el overhead del runtime.
- GPU validada: RTX 4090, con `-ngl 999` y contexto de 8192 tokens, cargando correctamente el fichero IQ4_XS.
- GPU de consumo: el modelo entra en el rango de tarjetas de 8 GB de VRAM con la cuantización IQ4_XS si se limita el contexto o se descargan algunas capas a CPU; con 12 GB o más el margen es amplio para contexto de 8k. No hay cifras verificadas de VRAM a contextos mayores.
- Despliegue: llama.cpp, con la revisión `ce8caa6` como referencia de conversión y prueba. Lanzamiento documentado: `llama-server -m MiMo-V2.6-Distill-Qwen-9B-IQ4_XS.gguf -c 8192 -ngl 999 --jinja`. Otros runtimes compatibles con GGUF (Ollama, LM Studio, text-generation-webui) no están documentados ni validados en la información disponible.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.
- Muestreo recomendado por el autor: temperatura 0,6, top-k 20, top-p 0,95.
- Advertencia de despliegue: es necesario usar llama.cpp con soporte Jinja y mantener la plantilla de chat embebida; sobrescribirla con un ChatML genérico provoca un comportamiento incorrecto.

## Comparativa con modelos similares

Los datos de este modelo proceden de la información del repositorio; los de los modelos comparativos, de su documentación pública y deben verificarse antes de tomar decisiones. No hay datos de rendimiento comparables para este modelo.

| Modelo | Parametros | Contexto | Licencia | Formatos | Rendimiento |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B (GGUF de ramgpt) | 8,95B | No disponible | No disponible | GGUF (IQ4_XS, Q4_K_M) | Sin benchmarks publicados |
| Qwen3-8B | Aproximadamente 8,2B | 32k nativo, extensible | Apache 2.0 | Safetensors, GGUF | Benchmarks públicos en su documentación |
| Llama 3.1 8B | Aproximadamente 8,03B | 128k | Licencia comunitaria de Llama 3.1 | Safetensors, GGUF | Benchmarks públicos en su documentación |
| Gemma 2 9B | Aproximadamente 9,24B | 8k | Términos de uso de Gemma | Safetensors, GGUF | Benchmarks públicos en su documentación |

Diferencias relevantes: frente a las alternativas, este repositorio solo ofrece cuantizaciones de 4 bits, mientras que los modelos comparativos publican pesos completos y cuantizaciones de diversos niveles. Además, la ausencia de licencia declarada en el repositorio upstream es una desventaja clara frente a licencias permisivas como Apache 2.0.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio upstream no especificaba licencia en sus metadatos al preparar las cuantizaciones, por lo que el uso comercial queda en un limbo legal que debe aclararse con Xiaomi antes de cualquier despliegue en producción.
- Fronteras de razonamiento malformadas: en modo thinking, algunas peticiones exponen un cierre de razonamiento malformado, como un `</think>` literal. El autor reprodujo el mismo comportamiento con el modelo BF16 de referencia, por lo que no es un defecto de la cuantización IQ4_XS.
- El parámetro `enable_thinking=false` resultó poco fiable en las pruebas locales.
- Riesgo de alucinación: inherente a un modelo de lenguaje de este tamaño; no está cuantificado porque no hay evaluaciones de fiabilidad publicadas.
- Sesgos: no se documenta ningún análisis de sesgos ni de comportamiento diferencial por idioma o colectivo.
- Idiomas: no se declara la lista de idiomas soportados; el comportamiento multilingüe es desconocido.
- Precisión de la cuantización: solo se publican dos cuantizaciones de 4 bits, y no se incluye una comparación medida de perplejidad o de calidad frente al BF16 original, más allá de las pruebas de humo cualitativas.
- Plantilla de chat: usar una plantilla ChatML genérica en lugar de la plantilla Jinja embebida rompe el comportamiento esperado del modelo.
- Conversión delicada: la conversión estándar falla por los metadatos de MTP/NextN; hay que convertir con `--no-nextn`. Cualquier re-cuantización debe tenerlo en cuenta.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin validación por parte de la comunidad, y con fecha de creación y última actualización muy próximas entre sí (21 de septiembre de 2026).
- Fuente de calibración no redistribuida: solo se publica la iMatrix derivada, no el texto de calibración, lo que limita la reproducción completa del experimento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ramgpt/MiMo-V2.6-Distill-Qwen-9B-GGUF
- Modelo upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos correspondían a páginas corporativas de Microsoft y no guardaban relación con el modelo.
