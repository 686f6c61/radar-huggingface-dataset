# InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF

## Resumen

Qwen3.5-4B-Uncensored-v2-GGUF es la distribucion en formato GGUF del modelo Qwen3.5-4B-Uncensored-v2, desarrollado por InterpreticAI como una variante del Qwen3.5-4B de Alibaba con la mayor parte de la censura politica eliminada. El objetivo declarado es reducir los rechazos y las respuestas evasivas ante preguntas politicamente sensibles, manteniendo al mismo tiempo el comportamiento general del modelo original. Esta version GGUF esta pensada para su uso con llama.cpp y runtimes compatibles (llama-server, Ollama, etc.).

El modelo conserva la naturaleza multimodal del Qwen3.5-4B original (pipeline image-text-to-text), con un proyector de vision separado en F16 que se distribuye junto a los pesos del modelo de lenguaje en Q4_K_M. Cuenta con 4.326.350.848 parametros totales y una ventana de contexto que, segun el ejemplo de uso de la model card, alcanza los 65.536 tokens (`-c 65536`). El repo ocupa 3,5 GB, con el fichero principal Q4_K_M de 2,78 GB y el proyector de vision de 0,67 GB.

La relevancia de esta ficha radica en que documenta un caso de fine-tuning orientado a reducir censura politica con evaluacion cuantitativa propia (51 preguntas sensibles, tasa de censura del 13,7 % frente al 92,2 % del base) y con benchmarks de capacidad general que muestran una degradacion moderada (entre -0,4 y -4,0 puntos en MMLU, GSM8K, IFBench y GPQA Diamond). Es, por tanto, un modelo util para investigacion sobre censura en LLM y para aplicaciones donde los rechazos del modelo base resultan problematicos, pero con caveats claros sobre fabricacion de hechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); arquitectura concreta no detallada en la informacion disponible |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (segun el ejemplo de llama-server de la model card) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; F16 para el proyector de vision (mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | GGUF (llama.cpp); existe version BF16 en el repo del modelo base |

## Arquitectura y entrenamiento

No se detalla en la informacion proporcionada la arquitectura interna del modelo (tipo de atencion, capas, dimensiones ocultas) ni la composicion del dataset de entrenamiento. El modelo es una variante del Qwen3.5-4B de Alibaba, con pipeline image-text-to-text, lo que implica un componente de vision acoplado al modelo de lenguaje mediante un proyector (mmproj) distribuido por separado. La model card no especifica el numero de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO en el proceso de descensura.

La innovacion principal es el procedimiento de eliminacion de censura politica: el autor reporta que la variante reduce del 92,2 % al 13,7 % la tasa de respuestas censuradas en 51 preguntas politicamente sensibles del conjunto de Pan y Xu (2026), es decir, elimina 40 de las 47 respuestas censuradas del modelo base. El modelo soporta modo thinking y non-thinking, y en la model card se recomienda desactivar el modo thinking mediante `--chat-template-kwargs '{"enable_thinking": false}'` para el modo no razonado. La conversion a GGUF se realizo con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagen y texto (image-text-to-text) mediante el proyector de vision F16.
- Razonamiento en modo thinking y respuestas directas en modo non-thinking.
- Respuesta a preguntas politicamente sensibles sin el nivel de censura del modelo base.
- Capacidad general preservada en benchmarks de conocimiento (MMLU), matematicas (GSM8K), instrucciones (IFBench) y razonamiento cientifico (GPQA Diamond).
- Soporte de plantilla de chat Jinja (`--jinja`) en llama-server.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible; la evaluacion de censura politica se realizo solo en chino.

## Casos de uso

- Investigacion sobre censura en LLM: el modelo permite estudiar como varia la tasa de respuestas censuradas frente al base (92,2 % a 13,7 %) en preguntas politicamente sensibles, con una evaluacion reproducible sobre 51 preguntas del conjunto de Pan y Xu (2026).
- Analisis comparativo de sesgos politicos: util para auditar diferencias de comportamiento entre el modelo original y la variante descensurada en un mismo prompt set, con decodificacion greedy y 4.096 tokens maximos de salida.
- Despliegue local en hardware de consumo: con 2,78 GB en Q4_K_M y 0,67 GB de proyector de vision, el modelo cabe en GPUs consumer y permite ejecucion en llama.cpp, Ollama o llama-server sin infraestructura dedicada.
- Prototipado de asistentes multimodales: el pipeline image-text-to-text permite procesar imagenes junto a texto en entornos de desarrollo con llama-server y `--mmproj`.
- Generacion de codigo y matematicas en entornos controlados: el modelo conserva un 96,0 en GSM8K y un 72,3 en MMLU, adecuado para tareas de razonamiento basico donde el hardware es limitado.
- Experimentacion con modo thinking y non-thinking: permite comparar el comportamiento del modelo con y sin razonamiento explicito mediante el parametro `enable_thinking` de la plantilla de chat.
- Evaluacion de robustez factual: dado que el autor reporta mayor fabricacion de hechos que el base (13 respuestas degeneradas frente a 8 en 110 preguntas de control), el modelo sirve como caso de estudio para medir el coste de la descensura en fidelidad factual.

## Benchmarks y rendimiento

Los benchmarks de capacidad general se ejecutaron sobre la version BF16 del modelo, no sobre el GGUF Q4_K_M. La evaluacion de censura politica si se realizo sobre el Q4_K_M con llama-server.

| Benchmark | Referencia | Puntuacion referencia | Uncensored-v2 (BF16) | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.5-4B (card oficial) | 76,2 | 72,2 | −4,0 |
| IFBench | Qwen3.5-4B (card oficial) | 59,2 | 58,0 | −1,2 |
| GSM8K (500 preguntas) | Qwen3.5-4B (evaluacion propia) | 97,0 | 96,0 | −1,0 |
| MMLU (1.000 preguntas) | Qwen3.5-4B (evaluacion propia) | 72,7 | 72,3 | −0,4 |

| Metrica de censura | Qwen3.5-4B | Uncensored-v2 Q4_K_M |
|---|---|---|
| Respuestas censuradas (51 preguntas) | 47 | 7 |
| Tasa de censura | 92,2 % | 13,7 % |
| Respuestas censuradas (115 preguntas) | 104 | 19 |
| Rechazos de peticiones daninas (100 prompts) | 99/100 | 93/100 (medido en BF16) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en Q4_K_M (2,78 GB del modelo de lenguaje + 0,67 GB del proyector de vision), mas overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM puede ejecutar el modelo en Q4_K_M; para contexto largo (65.536 tokens) se necesita mas memoria por la cache KV.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090, entre otras con 6 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server), Ollama y cualquier runtime compatible con GGUF; la model card proporciona el comando de llama-server con `-ngl 999 -c 65536 --jinja`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored-v2-GGUF | 4,33 B | 65.536 | Apache 2.0 | GGUF | Variante descensurada; 13,7 % de censura politica |
| Qwen3.5-4B (base) | 4,33 B | no disponible | Apache 2.0 | BF16, GGUF (via Qwen) | Modelo original; 92,2 % de censura politica |
| Qwen3.5-4B-Uncensored-v2 (BF16) | 4,33 B | no disponible | Apache 2.0 | BF16 | Misma variante en precision completa |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada para una comparativa mas amplia.

## Limitaciones y advertencias

- La evaluacion de censura politica cubre solo preguntas en chino; el comportamiento en otros idiomas no esta documentado.
- El modelo fabrica hechos con mas frecuencia que el base: en 110 preguntas de control no politicas, un juez LLM marca 13 respuestas BF16 como degeneradas (principalmente por hechos inventados) frente a 8 del Qwen3.5-4B.
- En las 51 preguntas evaluadas, 9 de las 44 respuestas no censuradas del build Q4_K_M identifican erroneamente el sujeto; una respuesta sustantiva no implica que sea correcta.
- La cuantizacion Q4_K_M puede introducir degradacion adicional respecto a la version BF16, aunque los benchmarks de capacidad se midieron en BF16.
- Licencia Apache 2.0 heredada de Qwen/Qwen3.5-4B, con atribucion al equipo de Qwen; se permite uso comercial segun los terminos de dicha licencia.
- El modelo esta disenado para reducir la censura politica, lo que puede implicar la generacion de contenido politicamente sensible; el usuario debe evaluar el contexto de despliegue y las obligaciones legales aplicables.
- El autor recomienda verificar de forma independiente las afirmaciones factuales generadas por el modelo.
- No se dispone de informacion sobre sesgos mas alla de la censura politica ni sobre el rendimiento en idiomas distintos del chino.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF
- Modelo base BF16: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper de referencia (Pan & Xu, 2026, PNAS Nexus): https://doi.org/10.1093/pnasnexus/pgag013
- DOI del modelo: https://doi.org/10.57967/hf/11548
- llama.cpp: https://github.com/ggml-org/llama.cpp
