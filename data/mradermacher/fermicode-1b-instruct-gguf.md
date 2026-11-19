# mradermacher/Fermicode-1B-Instruct-GGUF

## Resumen

Fermicode-1B-Instruct-GGUF es la distribucion en formato GGUF del modelo Fermicode-1B-Instruct, un modelo de lenguaje de aproximadamente 1.235 millones de parametros (1B) afinado mediante SFT (supervised fine-tuning) a partir de una base no especificada y entrenado con el dataset nex-agi/agent-sft. El modelo original lo publica pranavupadhyaya52 y esta version cuantizada la genera mradermacher, un conocido distribuidor de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles.

El modelo esta disenado para generacion de texto conversacional en ingles, con enfasis en capacidades de agente derivadas del dataset de entrenamiento (agent-sft). Su tamano reducido lo hace apto para despliegue en hardware modesto, incluso en CPU, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La relevancia de esta ficha radica en que ofrece una via practica de ejecutar un modelo de 1B afinado para tareas de agente en entornos con recursos limitados.

La informacion publicada por el autor es escasa: no se detalla la arquitectura interna, la longitud de contexto, la composicion exacta del dataset ni se publican resultados de benchmarks. Esta ficha recoge exclusivamente los datos disponibles y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo causal, inferido por su uso con transformers y text-generation-inference; no confirmado por el autor) |
| Parametros totales | 1.235.814.432 (segun safetensors del modelo base) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por el uso declarado de la libreria transformers, la etiqueta text-generation-inference y el pipeline conversacional, se trata de un modelo de lenguaje causal orientado a generacion de texto, pero el autor no especifica numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. Tampoco se indica el numero de tokens de entrenamiento ni la composicion completa del corpus.

El dato de entrenamiento disponible es que se aplico SFT (supervised fine-tuning) utilizando el dataset nex-agi/agent-sft, lo que sugiere un enfasis en comportamiento de agente y conversacion multi-turno. No consta que se haya aplicado RLHF ni DPO. La version aqui descrita es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) realizada por mradermacher; el autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles.
- Comportamiento orientado a agente, derivado del dataset de entrenamiento agent-sft (no se detallan capacidades especificas de tool calling ni de razonamiento multi-paso en la documentacion).
- Soporte de inferencia mediante llama.cpp y ecosistemas compatibles con GGUF (Ollama, text-generation-webui, entre otros).
- Compatibilidad declarada con text-generation-inference y transformers para el modelo base.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- No consta soporte de vision, audio, thinking mode ni function calling explicito.

## Casos de uso

- Prototipado local de asistentes conversacionales: el modelo puede ejecutarse en CPU o GPU de gama baja gracias a sus cuantizaciones de 0,7 a 1,4 GB, lo que permite iterar rapidamente en un portatil sin infraestructura dedicada.
- Experimentacion con agentes en entornos con recursos limitados: al estar afinado con agent-sft, sirve como banco de pruebas para pipelines de agente sencillos antes de escalar a modelos mayores.
- Generacion de texto en aplicaciones embebidas o de borde: el tamano de las cuantizaciones Q4_K_S/Q4_K_M (0,9 GB) permite desplegarlo en dispositivos con poca memoria.
- Educacion e investigacion: util para estudiar el efecto del SFT con datasets de agente en modelos de 1B y comparar cuantizaciones (Q2_K frente a Q8_0) sobre la calidad de salida.
- Clasificacion y etiquetado de texto en ingles: tareas de extraccion o resumen simple donde no se requiere contexto largo ni razonamiento complejo.
- Generacion de respuestas en chatbots de bajo coste: con licencia Apache 2.0, puede integrarse en productos comerciales sin obligaciones de atribucion adicionales mas alla de la licencia.
- Base para fine-tuning posterior: al ser un modelo pequeno con licencia permisiva, sirve como punto de partida para ajustes especificos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para cuantizaciones Q4_K_S/Q4_K_M (0,9 GB de fichero), 1,5 GB para Q8_0 y 2,6 GB para f16; el consumo real depende del contexto y del backend.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060); tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, y text-generation-inference/transformers para el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Fermicode-1B-Instruct-GGUF | 1,24B | no disponible | Apache 2.0 | GGUF | Afinado con agent-sft, solo ingles |
| Modelos de ~1B comparables (por ejemplo, variantes TinyLlama o Qwen2.5-1.5B) | ~1-1,5B | no disponible en esta ficha | variable | GGUF/safetensors | No se dispone de datos de rendimiento comparativo para Fermicode |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de rendimiento del modelo no estan publicados.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; el rendimiento real es desconocido.
- Solo soporta ingles segun la etiqueta de idioma; el uso en castellano no esta garantizado.
- Longitud de contexto no documentada; no apto para tareas que requieran ventanas largas sin verificacion previa.
- Riesgo de alucinacion inherente a modelos de 1B, especialmente en tareas de razonamiento o conocimiento factual.
- Sesgos desconocidos: no se documenta la composicion del dataset ni procesos de mitigacion de sesgos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima calidad.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar la licencia y condiciones del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Fermicode-1B-Instruct-GGUF
- Modelo base: https://huggingface.co/pranavupadhyaya52/Fermicode-1B-Instruct
- Pagina de descargas del autor: https://hf.tst.eu/model#Fermicode-1B-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/nex-agi/agent-sft
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
