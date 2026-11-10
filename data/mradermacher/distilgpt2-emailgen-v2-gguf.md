# mradermacher/distilgpt2-emailgen-V2-GGUF

## Resumen

distilgpt2-emailgen-V2-GGUF es la version cuantizada en formato GGUF del modelo postbot/distilgpt2-emailgen-V2, un ajuste fino de DistilGPT-2 especializado en la generacion de correos electronicos en ingles. Lo publica mradermacher, un conocido creador de cuantizaciones de la comunidad open source, y esta pensado para su uso en inferencia local mediante llama.cpp y herramientas compatibles. El modelo original parte de DistilGPT-2, una destilacion de GPT-2 que conserva la arquitectura transformer decoder-only con aproximadamente 82 millones de parametros.

El modelo resuelve un problema muy concreto: la generacion de texto de correos electronicos (asuntos y cuerpos de mensaje) en ingles, entrenado sobre los datasets AESLC y postbot/multi-emails-100k. No es un modelo de proposito general ni compite con los LLM modernos: es una herramienta ligera y especializada que cabe en cualquier equipo y requiere recursos minimos.

Su relevancia actual es la de un ejemplo de modelo pequeno, cuantizado y desplegable en local para tareas de generacion de texto acotadas, con licencia Apache 2.0 y pesos en GGUF listos para ejecutar en CPU. La ventana de contexto y las capacidades reales estan limitadas por su base DistilGPT-2, por lo que debe entenderse como un generador de texto auxiliar, no como un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (DistilGPT-2) |
| Parametros totales | 81.912.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de DistilGPT-2, un transformer decoder-only obtenido por destilacion de GPT-2. Cuenta con 81.912.576 parametros, lo que lo situa en la gama de modelos muy pequenos. La arquitectura es la clasica de GPT-2 (atencion multi-cabeza causal, capas de feed-forward y embeddings posicionales aprendidos), sin innovaciones como atencion lineal, MoE o decodificacion especulativa.

El ajuste fino se realizo sobre los datasets AESLC (corpus de correos electronicos) y postbot/multi-emails-100k, segun la model card del modelo base. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Esta version concreta es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada por mradermacher a partir de los pesos del modelo base, con variantes adicionales con imatrix disponibles en el repositorio i1-GGUF.

## Capacidades

- Generacion de texto de correos electronicos en ingles: asuntos y cuerpos de mensaje.
- Generacion de texto autoregresiva basica, limitada por el tamano del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Soporte multilingue limitado al ingles.
- No se documentan capacidades de vision, audio ni modo thinking.
- No se documenta un chat template ni formato de instrucciones especifico.

## Casos de uso

- Generacion de borradores de correos en ingles: el modelo puede producir asuntos y cuerpos de mensaje a partir de un prompt, adecuado para prototipos y herramientas internas de redaccion asistida.
- Clasificacion y completado de plantillas de email: al estar entrenado sobre AESLC, puede completar fragmentos de correos con estilo corporativo.
- Pruebas de concepto en local sin GPU: su tamano (0.2 GB en Q4_K_M) permite ejecutarlo en CPU con llama.cpp en cualquier portatil.
- Generacion de datos sinteticos de correos: util para aumentar datasets de entrenamiento o probar pipelines de procesamiento de texto.
- Educacion y experimentacion: ejemplo practico de cuantizacion GGUF y de ajuste fino de un modelo pequeno para una tarea concreta.
- Integracion en scripts ligeros: al ser un modelo de 82 M de parametros, se puede embeber en herramientas de linea de comandos o servicios de bajo coste para autocompletar texto de emails.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0.2 GB en cuantizaciones Q2_K a Q8_0; 0.3 GB en f16.
- GPU recomendadas: no es necesario GPU; cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) puede ejecutarlo con holgura.
- Cabe en cualquier GPU consumer y en CPU: el modelo completo en Q4_K_M ocupa aproximadamente 0.2 GB.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en CPU y GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| distilgpt2-emailgen-V2-GGUF | 81.912.576 | no disponible | apache-2.0 | GGUF | Especializado en emails, ingles |
| postbot/distilgpt2-emailgen-V2 | 81.912.576 | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| DistilGPT-2 original | ~82 M | 1024 tokens (tipico en GPT-2) | apache-2.0 | safetensors | Generico, sin ajuste a emails |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo muy pequeno (82 M de parametros): capacidad limitada de coherencia y conocimiento del mundo; riesgo alto de alucinacion y texto repetitivo.
- Entrenado unicamente en ingles; no soporta castellano ni otros idiomas.
- Especializado en generacion de emails: su uso fuera de ese dominio producira resultados pobres.
- No se documenta la longitud de contexto soportada; se asume la de DistilGPT-2, pero no esta confirmado.
- No dispone de alineamiento conversacional ni de formato de instrucciones; no es un asistente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones; conviene revisar la model card original.
- No se documentan sesgos especificos, pero al entrenarse sobre correos corporativos puede reproducir sesgos de ese dominio.
- Para produccion, se recomienda validacion humana de las salidas y no usarlo para decisiones automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/distilgpt2-emailgen-V2-GGUF
- Modelo base: https://huggingface.co/postbot/distilgpt2-emailgen-V2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/distilgpt2-emailgen-V2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#distilgpt2-emailgen-V2-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Dataset AESLC: https://huggingface.co/datasets/aeslc
- Dataset multi-emails-100k: https://huggingface.co/datasets/postbot/multi-emails-100k
