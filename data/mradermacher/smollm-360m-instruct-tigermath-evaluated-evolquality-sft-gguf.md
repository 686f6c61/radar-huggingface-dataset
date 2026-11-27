# mradermacher/SmolLM-360M-Instruct-TigerMath-Evaluated-EvolQuality-SFT-GGUF

## Resumen

SmolLM-360M-Instruct-TigerMath-Evaluated-EvolQuality-SFT-GGUF es una versión cuantizada en formato GGUF del modelo thesven/SmolLM-360M-Instruct-TigerMath-Evaluated-EvolQuality-SFT, que a su vez deriva de la familia SmolLM de Hugging Face. Se trata de un modelo de lenguaje de 361.821.120 parámetros (aproximadamente 362 millones), orientado a instrucciones y afinado específicamente sobre datos de matemáticas (TigerMath) y datos sintéticos de calidad evolutiva. La cuantización la ha realizado mradermacher, un conocido autor de cuantizaciones GGUF en el ecosistema de Hugging Face.

El modelo resuelve el problema de desplegar un pequeño modelo de instrucciones con capacidades matemáticas mejoradas en hardware muy limitado, ya que las cuantizaciones ocupan entre 0,3 GB y 0,8 GB en disco. Es relevante para desarrolladores que necesitan ejecutar inferencia local en CPU, GPUs de gama baja o dispositivos embebidos, donde modelos de mayor tamaño no caben. Al estar en formato GGUF, es compatible con llama.cpp y con las herramientas que lo envuelven, como Ollama o LM Studio.

La información disponible sobre el modelo base es limitada: no se especifican la longitud de contexto, los datos exactos de entrenamiento ni la licencia. El modelo está etiquetado únicamente para inglés y no cuenta con benchmarks publicados en la información proporcionada. Esta ficha refleja, por tanto, lo que se conoce a partir de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de SmolLM; detalles no disponibles) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia SmolLM, con 361.821.120 parámetros. La model card del repositorio cuantizado no detalla la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención), por lo que esos datos no están disponibles. El nombre del modelo base indica que ha pasado por un proceso de fine-tuning supervisado (SFT) sobre un conjunto de datos denominado TigerMath, con datos de calidad evolutiva (EvolQuality), y que ha sido evaluado. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La única innovación técnica destacable documentada en esta ficha es el proceso de cuantización realizado por mradermacher, que ofrece cuantizaciones estáticas (no ponderadas ni imatrix) en un rango amplio de tipos, desde Q2_K hasta f16. El autor indica que las cuantizaciones ponderadas o imatrix no estaban disponibles en el momento de publicar la model card y que podrían no planificarse. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, al estar etiquetado como modelo de instrucciones (instruct).
- Razonamiento matemático mejorado respecto al SmolLM base, gracias al fine-tuning sobre datos TigerMath.
- Seguimiento de instrucciones en formato conversacional, según la etiqueta `conversational` del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Inferencia local en CPU: el modelo en Q4_K_M ocupa 0,4 GB, por lo que puede ejecutarse en portátiles sin GPU mediante llama.cpp u Ollama, adecuado para prototipos y pruebas de concepto.
- Asistente matemático básico embebido: el fine-tuning sobre TigerMath lo hace útil para resolver operaciones aritméticas y problemas sencillos en aplicaciones educativas o de cálculo cotidiano.
- Despliegue en dispositivos con recursos muy limitados: con cuantizaciones Q2_K o Q3_K de 0,3 GB, puede integrarse en entornos con poca memoria, como Raspberry Pi o contenedores ligeros.
- Generación de texto corto en pipelines de bajo coste: al ser un modelo de 362M parámetros, permite procesar lotes pequeños de texto en servidores modestos sin GPU dedicada.
- Filtrado y clasificación de texto simple: puede utilizarse para tareas de generación de respuestas controladas en inglés donde no se requiera alta precisión, como borradores o resúmenes breves.
- Evaluación y experimentación con fine-tuning: sirve como base para experimentos de ajuste fino sobre dominios específicos en inglés, dado su pequeño tamaño y su disponibilidad en GGUF para pruebas rápidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica de forma estricta, ya que las cuantizaciones GGUF permiten ejecución en CPU. En GPU, el modelo completo en f16 requiere aproximadamente 0,8 GB de VRAM; en Q4_K_M, unos 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede alojar el modelo en cuantizaciones bajas; no se requiere A100 ni H100. Una RTX 4090 o una GPU integrada moderna son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual, incluidas GTX 1050, RTX 3050 o GPUs integradas Intel/AMD con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier herramienta compatible con GGUF. También es posible usar transformers con el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM-360M-Instruct-TigerMath-Evaluated-EvolQuality-SFT (este modelo) | 361.821.120 | no disponible | no disponible | GGUF | Fine-tuning matemático sobre SmolLM |
| SmolLM-360M-Instruct (base de Hugging Face) | ~360M | no disponible en esta ficha | no disponible | safetensors, GGUF | Modelo de instrucciones general |
| Qwen2.5-0.5B-Instruct | ~500M | no disponible en esta ficha | no disponible | safetensors, GGUF | Alternativa de tamaño similar con soporte multilingüe |
| TinyLlama-1.1B-Chat | ~1.1B | no disponible en esta ficha | no disponible | safetensors, GGUF | Mayor tamaño, mayor coste de inferencia |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo pequeño entrenado principalmente en inglés, es probable que herede sesgos de sus datos de entrenamiento, pero no se especifican.
- Riesgo de alucinación: alto en un modelo de 362M parámetros, especialmente en tareas de razonamiento complejo o generación de hechos; no se han publicado evaluaciones de fiabilidad.
- Limitaciones de contexto e idioma: el modelo está etiquetado únicamente para inglés y no se especifica la longitud de contexto, lo que limita su uso en conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; debe consultarse el repositorio del modelo base antes de cualquier uso comercial.
- Caveats para producción: las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad; el autor recomienda Q4_K_M o superiores para un equilibrio entre tamaño y calidad. Las cuantizaciones ponderadas/imatrix no están disponibles, lo que puede afectar a la calidad frente a otras alternativas.
- El modelo es una cuantización estática sin garantías de mantenimiento; el autor indica que las cuantizaciones imatrix podrían no publicarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/SmolLM-360M-Instruct-TigerMath-Evaluated-EvolQuality-SFT-GGUF
- Modelo base: https://huggingface.co/thesven/SmolLM-360M-Instruct-TigerMath-Evaluated-EvolQuality-SFT
- Página de descargas del autor: https://hf.tst.eu/model#SmolLM-360M-Instruct-TigerMath-Evaluated-EvolQuality-SFT-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
