# mradermacher/SenseNova-U1-8B-MoT-SFT-GGUF

## Resumen

SenseNova-U1-8B-MoT-SFT es un modelo multimodal unificado desarrollado por SenseNova (SenseTime), capaz de generar y comprender tanto texto como imágenes. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, un cuantizador conocido en la comunidad de Hugging Face que produce versiones estáticas de modelos populares para su ejecución local con llama.cpp y herramientas compatibles. El sufijo "MoT" sugiere una arquitectura de Mixture of Transformers (o tokens de mezcla), y "SFT" indica que se trata del checkpoint ajustado con supervised fine-tuning.

El modelo resuelve el problema de la fragmentación entre modelos de generación de texto y modelos de generación de imágenes: un único modelo de unos 9.300 millones de parámetros (9.348.413.952 según safetensors) cubre text-to-image, image-to-text, edición de imágenes y generación intercalada (interleaved generation). Esto lo hace relevante para desarrolladores que necesitan pipelines multimodales en un solo despliegue.

Esta ficha se centra en el repositorio GGUF de mradermacher, que ofrece cuantizaciones desde Q2_K (3,8 GB) hasta f16 (18,8 GB), permitiendo ejecutar el modelo desde portátiles con poca VRAM hasta estaciones de trabajo con GPU dedicada. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones destacables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal unificado, presumiblemente Mixture of Transformers (MoT), con custom_code |
| Parametros totales | 9.348.413.952 (aprox. 9,3 B) |
| Parametros activos | no disponible (no consta que sea MoE en el sentido de enrutado escaso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo base, sensenova/SenseNova-U1-8B-MoT-SFT, es un modelo multimodal unificado de unos 9,3 B de parámetros etiquetado con las tareas text-to-image, image-to-text, image-editing e interleaved-generation. La etiqueta "MoT" apunta a una arquitectura basada en mezcla de transformers, donde distintos módulos o tokens especializados atienden a modalidades distintas, aunque la model card no detalla la estructura interna. El uso de `custom_code` indica que la carga del modelo requiere código personalizado en la librería transformers, algo habitual en arquitecturas multimodales no integradas de serie.

El sufijo "SFT" indica que el checkpoint corresponde a la fase de fine-tuning supervisado posterior al preentrenamiento. No hay información pública en el repositorio sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO: no disponible. Tampoco se detalla el mecanismo concreto de tokenización de imágenes ni el decodificador visual empleado.

La versión de mradermacher es una recuantización estática (static quants) en formato GGUF, convertida desde los safetensors originales, con cuantizaciones de la familia K-quants e IQ-quants de ikawrakow. Existe además una versión con imatrix (importance matrix) en el repositorio hermano SenseNova-U1-8B-MoT-SFT-i1-GGUF, que suele ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image).
- Comprensión y descripción de imágenes (image-to-text), es decir, capacidades de visión como VLM.
- Edición de imágenes guiada por instrucciones (image-editing).
- Generación intercalada de texto e imágenes en una misma secuencia (interleaved-generation), útil para documentos ricos o narrativas visuales.
- Generación de texto conversacional (etiqueta conversational).
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: la model card solo declara inglés; el soporte de castellano no está documentado.

## Casos de uso

- Generación local de imágenes sin servicios en la nube: con la cuantización Q4_K_M (5,8 GB) se puede generar imágenes en un PC de consumo sin depender de APIs de pago, adecuado para flujos creativos privados.
- Descripción y indexación de imágenes: como modelo image-to-text puede generar pies de foto o metadatos para catálogos, útil en sistemas RAG multimodales donde las imágenes deben ser buscables por texto.
- Edición de imágenes por instrucciones: permite modificar imágenes existentes mediante prompts ("cambia el fondo", "elimina el objeto"), útil en flujos de marketing o prototipado rápido de diseño.
- Documentos intercalados texto-imagen: la generación interleaved permite crear contenido que combina párrafos e ilustraciones, por ejemplo, guías técnicas o material educativo ilustrado.
- Chatbot multimodal local: la etiqueta conversational y el formato GGUF permiten integrarlo en interfaces tipo Ollama o llama.cpp para asistentes que entienden imágenes que el usuario sube.
- Prototipado de aplicaciones multimodales: al ser un único modelo con Apache 2.0, simplifica el stack frente a combinar un LLM más un difusor, reduciendo latencia y coste de despliegue.
- Generación de datos sintéticos: puede usarse para producir pares imagen-texto que alimenten el entrenamiento de modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos incluyen métricas de MMLU, HumanEval, GSM8K ni benchmarks de generación de imágenes (FID, GenEval, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización elegida. Q2_K ocupa 3,8 GB, Q4_K_M 5,8 GB, Q6_K 7,8 GB, Q8_0 10 GB y f16 18,8 GB. Añade margen para el contexto y los buffers de imagen (se recomienda 1-3 GB adicionales).
- GPU recomendadas: para las cuantizaciones Q4 a Q6, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 son suficientes. Para f16, se recomienda una RTX 4090 (24 GB) o superior. También es posible la ejecución en CPU o en modo híbrido CPU+GPU con llama.cpp, con menor velocidad.
- Consumer GPUs: sí, la mayoría de cuantizaciones caben en GPUs de consumo. Q4_K_M (5,8 GB) funciona incluso en GPUs de 8 GB; Q8_0 (10 GB) requiere 12 GB o más.
- Despliegue: llama.cpp es el entorno natural para GGUF; también Ollama (si el modelo está soportado), LM Studio y cualquier runtime compatible con GGUF. El modelo original en safetensors requiere transformers con custom_code. La compatibilidad con vLLM o TGI no está documentada para esta variante GGUF.
- Latencia y throughput: no disponible. Al tratarse de un modelo de generación de imágenes, la velocidad dependerá en gran medida del decodificador visual y del soporte del runtime para la parte de difusión o generación visual, que puede no estar implementada en todos los backends GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Formato | Licencia |
|---|---|---|---|---|
| SenseNova-U1-8B-MoT-SFT | 9,3 B | texto, texto-a-imagen, imagen-a-texto, edicion, intercalado | safetensors / GGUF | Apache 2.0 |
| Qwen2.5-VL-7B | 7-8 B | texto, imagen-a-texto (no genera imagenes) | safetensors / GGUF | Apache 2.0 |
| Emu3.5 (BAAI) | ~8-34 B segun version | texto e imagen unificados, intercalado | safetensors | Apache 2.0 |
| LLaVA-OneVision-7B | 7 B | texto, imagen-a-texto, video | safetensors / GGUF | Apache 2.0 |

SenseNova-U1 se diferencia de alternativas como Qwen2.5-VL o LLaVA en que también genera imágenes, algo que los VLM puros no hacen. Frente a Emu3, comparte el enfoque unificado de comprensión y generación visual, con un tamaño de modelo más contenido. La comparativa de rendimiento no puede cuantificarse por falta de benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en el repositorio. Al tratarse de un modelo generador de imágenes, deben esperarse los sesgos típicos de los datasets visuales a gran escala (estereotipos, sesgo cultural hacia contenido en inglés).
- Riesgo de alucinación: como todo modelo generativo, puede producir texto inexacto al describir imágenes e imágenes con artefactos o texto ilegible. No hay evaluaciones publicadas que cuantifiquen este riesgo.
- Idioma: la model card solo declara inglés. El rendimiento en castellano no está verificado y probablemente sea inferior.
- Contexto: la longitud de ventana no está documentada; verifica el archivo de configuración antes de planificar cargas con documentos largos.
- Custom code: el modelo original requiere `trust_remote_code` en transformers, lo que implica ejecutar código de terceros; revisa el código antes de usarlo en producción.
- Soporte GGUF incompleto posible: al ser una arquitectura multimodal con generación de imágenes, no todos los runtimes GGUF implementan la parte visual; puede que solo funcione la parte de texto en algunas herramientas.
- Licencia: Apache 2.0 permite uso comercial, pero no hay garantías de calidad ni soporte oficial para las cuantizaciones de mradermacher, que son trabajos de la comunidad.
- Producción: al ser una cuantización estática sin imatrix en este repositorio, para máxima calidad valora la versión i1-GGUF del mismo autor.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/SenseNova-U1-8B-MoT-SFT-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-U1-8B-MoT-SFT
- Version imatrix (i1-GGUF): https://huggingface.co/mradermacher/SenseNova-U1-8B-MoT-SFT-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#SenseNova-U1-8B-MoT-SFT-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantos (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog oficial y demo: no disponible
