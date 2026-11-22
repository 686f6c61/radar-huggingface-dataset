# mradermacher/QiMing-Me-GGUF

## Resumen

QiMing-Me es un modelo de lenguaje conversacional afinado mediante LoRA sobre una base Qwen3, publicado por el usuario aifeifei798 y cuantizado a GGUF por mradermacher. Con 14.768.307.200 parametros (aproximadamente 14,8 mil millones), esta orientado a tareas de toma de decisiones, analisis estrategico y lo que el autor denomina "arquitectura cognitiva" y "IA guiada por filosofia". El modelo se distribuye bajo licencia Apache 2.0 y soporta chino e ingles.

El repositorio original es un adaptador LoRA sobre la arquitectura Qwen3, y esta version GGUF es una conversion estatica (convert_type: hf) pensada para su uso con llama.cpp y derivados. El interes practico radica en que ofrece un modelo de ~15B parametros con cuantizaciones que van desde 5,9 GB (Q2_K) hasta 15,8 GB (Q8_0), lo que permite desplegarlo en hardware de consumo con suficiente VRAM.

La relevancia actual es limitada pero concreta: se trata de un modelo de nicho, con solo 382 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados. Su valor esta en explorar el ajuste fino orientado a razonamiento estrategico sobre una base Qwen3 solida, no en competir con modelos frontier.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3, ajuste LoRA) |
| Parametros totales | 14.768.307.200 (~14,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y F16 en el repo i1) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer denso de aproximadamente 14,8 mil millones de parametros. Sobre esta base, el autor original (aifeifei798) aplico un ajuste fino mediante LoRA, segun indican las etiquetas del repositorio (`lora`, `unsloth`). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion declarada por el autor es el enfoque de "arquitectura cognitiva" y "QiMing-holos" orientado a toma de decisiones y analisis estrategico, aunque la model card no detalla mecanismos tecnicos concretos. La conversion a GGUF realizada por mradermacher es estatica (quantize_version 2), con cuantizaciones del tipo K-quant e IQ, y existe una variante con imatrix en el repositorio `QiMing-Me-i1-GGUF` para quienes busquen mayor calidad por tamano.

## Capacidades

- Generacion de texto conversacional multi-turno en chino e ingles.
- Razonamiento orientado a toma de decisiones y analisis estrategico (según la orientacion declarada del ajuste).
- Soporte de chat (pipeline `conversational` segun tags).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso.
- No se documenta vision, audio ni modo thinking explicito.
- Capacidades multilingues limitadas a zh y en.

## Casos de uso

- Analisis estrategico asistido: el modelo puede emplearse para estructurar decisiones complejas (evaluacion de alternativas, analisis de riesgos) en chino o ingles, aprovechando su ajuste orientado a decision-making.
- Asistente conversacional de nicho: integrado en chatbots que requieran un tono reflexivo o filosofico, con despliegue local via llama.cpp u Ollama gracias a las cuantizaciones GGUF de 8-10 GB.
- Prototipado de agentes de razonamiento: como base para experimentar con cadenas de razonamiento en entornos de investigacion, dado su tamano manejable (~15B) y licencia permisiva.
- Generacion de documentacion y sintesis en chino: util para equipos que trabajen con contenido en chino y necesiten resumenes o reescritura.
- Educacion y divulgacion: escenarios donde se requiera un modelo conversacional con inclinacion filosofica o argumentativa.
- Investigacion sobre ajuste fino LoRA: el repositorio original sirve como caso de estudio de adaptacion de Qwen3 a dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~5,9 GB; Q4_K_M ~9,1 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q6_K/Q8_0 con contexto moderado; RTX 4070 Ti/4080 (16 GB) para Q4_K_M/Q5_K_M; GPUs de 8 GB para Q2_K/Q3_K_S con contexto reducido.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas segun cuantizacion; Q4_K_S/Q4_K_M son las recomendadas por el cuantizador ("fast, recommended").
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; tambien transformers con los pesos originales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| QiMing-Me (este) | ~14,8B | no disponible | Apache 2.0 | Ajuste LoRA sobre Qwen3, orientado a decision-making |
| Qwen3-14B (base) | ~14,8B | no disponible en esta ficha | Apache 2.0 | Base sin ajuste; referencia de rendimiento general |
| QiMing-Me-i1-GGUF | ~14,8B | no disponible | Apache 2.0 | Variante con cuantizaciones imatrix del mismo modelo |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a la base Qwen3.
- Riesgo de alucinacion inherente a modelos de ~15B sin evaluacion documentada.
- Soporte limitado a chino e ingles; no se garantiza calidad en castellano.
- Contexto maximo no documentado: no asumir ventanas largas sin verificar.
- Modelo de nicho con muy poca adopcion (382 descargas, 0 likes): escasa validacion comunitaria.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar las condiciones de la base Qwen3 y del adaptador original.
- El ajuste LoRA puede degradar capacidades generales de la base; no recomendado como modelo generalista sin evaluacion previa.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/QiMing-Me-GGUF
- Modelo base / adaptador original: https://huggingface.co/aifeifei798/QiMing-Me
- Variante imatrix: https://huggingface.co/mradermacher/QiMing-Me-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#QiMing-Me-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
