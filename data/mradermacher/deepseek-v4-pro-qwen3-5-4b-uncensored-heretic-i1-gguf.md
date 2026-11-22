# mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es un modelo de lenguaje de 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) derivado de la familia Qwen 3.5 y destilado a partir de DeepSeek V4 Pro, según los tags de la model card. La versión aquí descrita es la cuantización GGUF con imatrix (etiqueta i1) publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, a partir del modelo base de xtools-at.

El modelo se presenta como una variante "uncensored", "heretic" y "abliterated", es decir, con las capas de rechazo y alineación de seguridad parcialmente eliminadas o atenuadas mediante técnicas de abliteration. Incorpora capacidades declaradas de razonamiento, matemáticas y STEM (tags `reasoning`, `math`, `stem`) y está pensado para su uso conversacional y de generación de texto en entornos controlados donde se requiere baja censura.

La relevancia de esta ficha radica en que combina un tamaño compacto (4,3 B) con cuantizaciones que van desde 2,1 GB hasta 3,7 GB, lo que permite su despliegue en hardware de consumo. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque el carácter "abliterated" introduce riesgos de contenido que deben gestionarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, segun tags); detalles de capas y atencion no disponibles |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix/weighted); estaticas en el repo hermano -GGUF |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors no se incluye en este repo |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los tags `qwen3_5` y `transformers`. Por el nombre y los tags se infiere que se trata de un transformer derivado de Qwen 3.5, con destilacion desde DeepSeek V4 Pro (`distillation`, `deepseek`) y un ajuste fino supervisado (`sft`). El tag `mtp` sugiere la presencia de multi-token prediction, una tecnica de decodificacion especulativa que acelera la generacion al predecir varios tokens por paso, aunque no se aportan detalles tecnicos sobre su implementacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. El proceso "heretic"/"abliterated" implica la eliminacion de direcciones de activacion asociadas al rechazo de contenido, lo que modifica el comportamiento del modelo respecto al base. Tampoco se especifican innovaciones adicionales como atencion lineal o decodificacion especulativa mas alla del posible MTP.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (ingles, chino, coreano, japones, espanol y ruso).
- Razonamiento explicito y modo de pensamiento (tags `reasoning`), orientado a problemas de matematicas y STEM.
- Capacidades matematicas y de resolucion de problemas cientificos derivadas de la destilacion desde DeepSeek V4 Pro.
- Generacion de codigo y asistencia en tareas de programacion (implicito en el tag `stem` y en la herencia de Qwen 3.5, aunque no se documenta explicitamente).
- Comportamiento "uncensored"/"abliterated": menor tendencia a rechazar peticiones, lo que amplia el rango de respuestas pero elimina parte de las salvaguardas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo de razonamiento lo hace plausible.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse en local mediante llama.cpp u Ollama con cuantizaciones de 2,7-3,3 GB, adecuado para prototipos de chatbot en hardware de consumo sin depender de APIs externas.
- Generacion de codigo en entornos de desarrollo: su herencia de Qwen 3.5 y el enfasis en STEM lo hacen util para autocompletado y explicacion de fragmentos en IDE, con la salvedad de que no se documenta tool calling.
- Tutoria de matematicas y fisica: el modo de razonamiento y la destilacion desde DeepSeek V4 Pro permiten resolver problemas paso a paso, util en plataformas educativas que requieren explicaciones detalladas.
- Investigacion sobre alineacion y abliteration: al ser una variante "heretic", sirve como caso de estudio para comparar el comportamiento de un modelo base frente a su version sin capas de rechazo, en laboratorios de seguridad de IA.
- Procesamiento multilingue en seis idiomas: adecuado para traduccion y atencion al cliente en ingles, chino, coreano, japones, espanol y ruso, con cuantizaciones ligeras que caben en GPUs de 8 GB.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o material editorial donde las salvaguardas estandar resultan limitantes, siempre con supervision humana y cumplimiento legal.
- Despliegue en edge o dispositivos con poca VRAM: las cuantizaciones i1-Q3_K_S (2,2 GB) e i1-IQ3_S (2,3 GB) permiten ejecucion en GPUs integradas o portatiles modestos para tareas de generacion corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con i1-Q2_K/i1-Q3_K_S, 3-3,5 GB con i1-Q4_K_M, y 4-4,5 GB con i1-Q6_K (incluyendo overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor velocidad; A100/H100 solo si se busca alto throughput en batching.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas usando cuantizaciones Q3/Q4; en GPUs de 4 GB con Q2/IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (koboldcpp, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. El tag `mtp` podria mejorar la velocidad de decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (i1-GGUF) | 4,3 B | no disponible | Apache 2.0 | GGUF | Variante abliterated, 6 idiomas, cuantizaciones imatrix |
| Qwen 3.5 4B (base) | aproximadamente 4 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo original con alineacion estandar |
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (estatico -GGUF) | 4,3 B | no disponible | Apache 2.0 | GGUF | Mismo modelo con cuantizaciones estaticas (sin imatrix) |
| Llama 3.2 3B Instruct | 3,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa compacta con contexto largo y alineacion estandar |

## Limitaciones y advertencias

- El proceso de abliteration elimina parcialmente las capas de rechazo, lo que puede producir contenido ofensivo, inseguro o legalmente problematico; requiere filtros y supervision en produccion.
- Riesgo elevado de alucinacion inherente a un modelo de 4,3 B, especialmente en tareas de razonamiento largo o datos factuales.
- La longitud de contexto no esta documentada; no se debe asumir una ventana amplia sin verificacion empirica.
- El soporte de tool calling y agentes no esta confirmado; integrarlo en pipelines automatizados sin validacion previa es arriesgado.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante "uncensored" puede incumplir normativas sectoriales (salud, finanzas, menores) y las politicas de las plataformas de despliegue.
- El rendimiento en espanol, aunque declarado, no cuenta con benchmarks publicados; la calidad puede ser inferior a la del ingles.
- El repositorio pesa 39,2 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- La fecha de creacion (2026-11-12) y el nombre "DeepSeek-V4-Pro" deben tratarse con cautela: no se aporta verificacion independiente del origen de los datos de destilacion.

## Enlaces

- Repositorio Hugging Face (i1-GGUF): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
