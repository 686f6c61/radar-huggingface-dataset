# bcckfdn/cevher-test-4.5-GGUF

## Resumen

cevher-test-4.5-GGUF es la versión cuantizada en formato GGUF de un modelo de lenguaje entrenado desde cero por el usuario bcckfdn. Según su model card, la arquitectura sigue el diseño de SmolLM2 (familia Llama), con 34 capas y una dimensión oculta de 1024, y el entrenamiento se realizó sobre 2.621 B de tokens (notación literal del autor). El recuento real de parámetros del repositorio en safetensors es de 406.918.144, es decir, unos 407 millones de parámetros, por lo que se trata de un modelo denso de gama muy pequeña.

El modelo se distribuye exclusivamente en GGUF, con cuatro niveles de cuantización (BF16, Q8_0, Q5_K_M y Q4_K_M), y está pensado para ejecutarse en llama.cpp, Ollama o LM Studio. Soporta turco (tr) e inglés (en) y se publica bajo licencia Apache 2.0. Es relevante para quienes necesitan un modelo conversacional de menos de 800 MB en BF16 que quepa en CPU, GPU integradas o dispositivos de borde.

Conviene señalar que el repositorio se llama «cevher-test-4.5-GGUF» mientras que los ficheros publicados se denominan «cevher-406m-v15», una discrepancia de nomenclatura que apunta a un modelo en fase de pruebas (el propio nombre incluye «test»). No hay descargas ni valoraciones registradas, y no se han publicado resultados de benchmarks ni la longitud de contexto soportada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama / SmolLM2 |
| Parametros totales | 406.918.144 (unos 407 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q5_K_M, Q4_K_M |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unico formato publicado) |
| Capas | 34 |
| Dimension oculta | 1024 |
| Tokens de entrenamiento | 2.621 B (notacion literal de la model card) |
| Modelo base | bcckfdn/cevher-test-4.5 |
| Tamano del repositorio | 1,8 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 26 de septiembre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card indica que se trata de un modelo entrenado desde cero con la arquitectura de SmolLM2, que a su vez es un transformer decoder-only de estilo Llama. Los únicos datos arquitectónicos publicados son el número de capas (34) y la dimensión oculta (1024). No se especifican el número de cabezas de atención, el tamaño del vocabulario, el uso de GQA, RoPE, RMSNorm o SwiGLU, ni la función de activación. Tampoco se documenta si se aplicaron técnicas posteriores al preentrenamiento como SFT, RLHF o DPO; la etiqueta «conversational» del repositorio sugiere algún tipo de ajuste para diálogo, pero no hay confirmación en la documentación.

En cuanto a los datos, la model card afirma un volumen de entrenamiento de 2.621 B de tokens sin detallar la composición del dataset, la proporción entre turco e inglés ni el proceso de filtrado o deduplicación. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, mezcla de expertos ni arquitecturas híbridas SSM). La única información verificable sobre el artefacto publicado es el conjunto de cuantizaciones GGUF generadas y sus tamaños de fichero.

## Capacidades

- Generacion de texto y conversacion multiturno en turco e ingles, segun la etiqueta «conversational» del repositorio.
- Modelo base de generacion de texto (pipeline text-generation), sin capacidades declaradas de vision, audio ni multimodalidad.
- Compatibilidad con llama.cpp, Ollama y LM Studio, lo que permite inferencia local en CPU y GPU.
- Integrable mediante la API compatible de endpoints de HuggingFace (etiqueta endpoints_compatible).
- No se declara soporte de tool calling, function calling ni de flujos de agentes.
- No se declara modo de razonamiento explicito (thinking mode) ni capacidad de razonamiento multi-paso documentada.
- El alcance multilingue se limita a los dos idiomas declarados; no hay evidencia de soporte para castellano ni otras lenguas.

## Casos de uso

- Asistencia conversacional en turco para aplicaciones de mensajeria o chatbots de bajo coste: con 407 M de parametros y 245 MB en Q4_K_M, puede ejecutarse en el propio dispositivo del usuario sin depender de una API externa.
- Prototipado rapido de pipelines de generacion de texto: al cargarse en llama.cpp con un unico fichero GGUF, sirve para validar prompts, plantillas y flujos de preprocesado antes de migrar a un modelo mayor.
- Clasificacion y etiquetado de texto en turco e ingles: tareas de resumen corto, extraccion de palabras clave o normalizacion de textos donde no se requiere razonamiento complejo.
- Generacion de texto en entornos con recursos muy limitados o sin conectividad: el modelo cabe en CPU, en GPU integradas y en dispositivos de borde, lo que habilita despliegues offline.
- Filtrado previo (pre-screening) en cascada: usar el modelo como primera etapa barata para descartar o priorizar peticiones antes de invocar un modelo mayor, reduciendo el coste por consulta.
- Educacion y experimentacion academica: por su tamano reducido y licencia Apache 2.0, es apto para practicas de cuantizacion, comparativas de rendimiento entre niveles GGUF y estudios de destilacion o fine-tuning.
- Traduccion asistida turco-ingles en borradores de baja criticidad: util como ayuda de redaccion, siempre con revision humana dado el tamano del modelo.
- Aplicaciones de escritorio o plugins locales que requieran un generador de texto embebido sin proceso de instalacion complejo, aprovechando los ficheros de 245-414 MB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia. Tampoco se documentan mediciones de perplejidad, latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,0 GB en BF16 y 0,25-0,45 GB en las cuantizaciones Q4_K_M, Q5_K_M y Q8_0, segun los tamanos de fichero publicados (245 MB, 281 MB y 414 MB respectivamente). Hay que sumar el espacio del contexto (KV cache), que depende de la longitud de contexto, dato no disponible.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no se requiere A100, H100 ni tarjetas de gama alta. Tambien es viable en GPU integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos (GTX 1050 o superior, RTX 3060, RTX 4090, etc.), asi como en CPU y en dispositivos de borde tipo Raspberry Pi con memoria suficiente.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio son las documentadas por el autor. El soporte en vLLM o TGI no se menciona en la model card y no esta confirmado.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Idiomas |
|---|---|---|---|---|---|
| cevher-test-4.5-GGUF (este modelo) | 407 M | no disponible | Apache 2.0 | GGUF | tr, en |
| SmolLM2-360M | 362 M | 8192 tokens | Apache 2.0 | safetensors, GGUF | en (principalmente) |
| Qwen2.5-0.5B | 494 M | 32768 tokens | Apache 2.0 | safetensors, GGUF | multilingue |
| TinyLlama-1.1B | 1,1 B | 2048 tokens | Apache 2.0 | safetensors, GGUF | en |

Nota: los datos de los modelos comparativos provienen del conocimiento general sobre sus model cards publicas y no han sido verificados en la informacion proporcionada para esta ficha; conviene contrastarlos antes de citarlos. No hay datos de rendimiento comparativo disponibles para este modelo, por lo que la comparacion se limita a parametros, contexto, licencia, formatos e idiomas.

## Limitaciones y advertencias

- Modelo en fase de pruebas: el nombre del repositorio incluye «test» y la discrepancia entre el nombre del repo («cevher-test-4.5») y el de los ficheros («cevher-406m-v15») sugiere que no es una version estable.
- Sin adopcion verificable: cero descargas y cero valoraciones en el momento de los metadatos, por lo que no existe validacion por parte de la comunidad.
- Riesgo elevado de alucinacion: con 407 M de parametros y un volumen de entrenamiento relativamente bajo, es esperable una tasa alta de errores facticos, aunque no se han publicado mediciones al respecto.
- Cobertura idiomatica limitada: solo turco e ingles declarados; no hay evidencia de un rendimiento aceptable en castellano u otros idiomas.
- Contexto desconocido: la model card no especifica la longitud de contexto, lo que impide planificar tareas que dependan de ventanas largas.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que no es posible comparar objetivamente su calidad con alternativas.
- Sin soporte declarado de tool calling ni de agentes: no debe asumirse su uso en flujos que requieran function calling.
- Sesgos no evaluados: no se documenta ninguna auditoria de sesgos, composicion del dataset ni medidas de mitigacion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al ser un modelo entrenado desde cero por un autor individual, no se especifican garantias ni procedencia detallada de los datos de entrenamiento.
- Fecha de publicacion inusual: los metadatos indican septiembre de 2026, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bcckfdn/cevher-test-4.5-GGUF
- Modelo base: https://huggingface.co/bcckfdn/cevher-test-4.5
- llama.cpp (referenciado en la model card): https://github.com/ggerganov/llama.cpp
- Ollama (referenciado en la model card): https://ollama.com
- LM Studio (referenciado en la model card): https://lmstudio.ai
- Paper o blog tecnico del modelo: no disponible
- Demo o espacio de prueba: no disponible
