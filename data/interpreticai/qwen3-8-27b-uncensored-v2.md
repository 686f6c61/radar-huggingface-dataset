# InterpreticAI/Qwen3.8-27B-Uncensored-v2

## Resumen

Qwen3.8-27B-Uncensored-v2 es un ajuste fino (fine-tune) del modelo Qwen3.8-27B desarrollado por InterpreticAI. El objetivo declarado del autor es eliminar la mayor parte de la censura política presente en el modelo base, manteniendo intactas tanto la arquitectura como el resto de capacidades de razonamiento e instrucción. El checkpoint se distribuye en BF16 completo, con el mismo layout de ficheros que el modelo original, y hereda la licencia Apache 2.0 de Qwen.

El modelo conserva la naturaleza multimodal del base (pipeline `image-text-to-text`, con codificador de visión idéntico) y los modos de razonamiento thinking y non-thinking. Cuenta con 27.781.427.952 parámetros totales y un repositorio de 55,6 GB en safetensors. La relevancia actual radica en que cuantifica de forma explícita la reducción de censura política (de 86,7 % a 3,5 % de respuestas censuradas en un banco de preguntas en chino) y el coste asociado en capacidad general (caídas de 0,5 a 2,8 puntos en GPQA Diamond, IFBench y MMLU).

Se trata de un modelo con muy poca tracción en el ecosistema (35 descargas y 1 like en el momento de la consulta), orientado a investigadores que necesiten estudiar el comportamiento de modelos con censura reducida o construir aplicaciones donde el filtrado político del base resulte un obstáculo. El autor publica además variantes en FP8 y GGUF Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.8; tag `qwen3_5` en Hugging Face |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint principal); FP8 y GGUF Q4_K_M en repositorios separados |
| Idiomas soportados | no disponible (la evaluacion de censura politica se realiza en chino; el modelo base es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.8-27B, por lo que mantiene la arquitectura del base: un transformer multimodal con codificador de visión, plantilla de chat propia y dos modos de inferencia (thinking y non-thinking). El autor no detalla en la model card la composicion del dataset de ajuste, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF, DPO o SFT supervisado. Tampoco se especifica la innovacion tecnica del proceso de eliminacion de censura mas alla de su descripcion como "variant with political censorship largely removed".

El checkpoint se publica como BF16 completo con el mismo layout de ficheros que el modelo original, lo que facilita su uso con las mismas herramientas (vLLM con `--reasoning-parser qwen3`, transformers, etc.). El autor recomienda los mismos parametros de muestreo que el base: en thinking mode, `temperature=1.0, top_p=0.95, top_k=20`; en non-thinking mode, `temperature=0.7, top_p=0.8, top_k=20, presence_penalty=1.5`. El codificador de visión es idéntico al del modelo base, aunque todas las evaluaciones publicadas son solo de texto.

## Capacidades

- Generacion de texto y razonamiento en dos modos: thinking (con esfuerzo de razonamiento configurable, hasta `xhigh`) y non-thinking.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador de visión idéntico al del Qwen3.8-27B base.
- Respuesta a instrucciones y seguimiento de formato (evaluado con IFBench).
- Razonamiento cientifico y de nivel experto (evaluado con GPQA Diamond).
- Conocimiento general y respuesta a preguntas (evaluado con MMLU).
- Reduccion sustancial de la censura politica en respuestas en chino (de 86,7 % a 3,5 % de respuestas censuradas en el banco de Pan y Xu, 2026).
- Mantenimiento mayoritario del rechazo a peticiones dañinas (95 de 100 rechazos en `mlabonne/harmful_behaviors`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modo thinking sugiere capacidad de razonamiento extendido, pero no se documenta explicitamente).
- Capacidades multilingues: no disponibles en detalle; la evaluacion de censura se limita a chino.

## Casos de uso

- Investigacion sobre censura en LLM: el modelo permite comparar directamente las respuestas del base y de la variante sobre el mismo banco de 113 preguntas politicas sensibles, cuantificando el efecto del ajuste fino (3,5 % frente a 86,7 % de respuestas censuradas).
- Analisis de sesgo politico y alineamiento: util para estudiar como se distribuyen las respuestas sobre temas politicos en chino y que tipo de contenido se preserva o elimina tras el fine-tune.
- Evaluacion de la degradacion de capacidades: sirve como caso de estudio del coste de eliminar censura, con caidas medibles de 0,5 a 2,8 puntos en GPQA Diamond, IFBench y MMLU.
- Generacion de texto en modo thinking para tareas de razonamiento cientifico: el modelo conserva un 86,4 en GPQA Diamond, adecuado para prototipos de asistencia en dominios tecnicos donde se requiera razonamiento extendido.
- Procesamiento multimodal de documentos: al mantener el codificador de vision del base, puede emplearse en pipelines image-text-to-text (descripcion de imagenes, extraccion de informacion de capturas o diagramas), aunque el autor no publica evaluaciones multimodales.
- Despliegue en produccion con vLLM: el autor documenta el comando `vllm serve InterpreticAI/Qwen3.8-27B-Uncensored-v2 --reasoning-parser qwen3`, lo que permite servirlo con el parser de razonamiento de Qwen y los mismos parametros de muestreo del base.
- Experimentacion con cuantizaciones: las variantes FP8 y GGUF Q4_K_M permiten desplegar el modelo en entornos con menos VRAM que el checkpoint BF16 completo.

## Benchmarks y rendimiento

Censura politica (Pan y Xu, 2026; 113 preguntas sensibles en chino, modo non-thinking, decodificacion greedy, 4.096 tokens de salida):

| Modelo | Respuestas censuradas (de 113) | Tasa de censura |
|---|---|---|
| Qwen3.8-27B | 98 | 86,7 % |
| Qwen3.8-27B-Uncensored-v2 | 4 | 3,5 % |

Rechazo de peticiones dañinas (`mlabonne/harmful_behaviors`, primeros 100 prompts del test split):

| Modelo | Peticiones dañinas rechazadas (de 100) |
|---|---|
| Qwen3.8-27B | 100 |
| Qwen3.8-27B-Uncensored-v2 | 95 |

Capacidad general (thinking mode, `xhigh`, 65.536 tokens maximos de salida, temperature 1.0, top-p 0.95, top-k 20, una muestra por pregunta):

| Benchmark | Referencia | Puntuacion referencia | Uncensored-v2 | Diferencia |
|---|---|---|---|---|
| GPQA Diamond | Qwen3.8-27B (model card oficial) | 89,2 | 86,4 | −2,8 |
| IFBench | Qwen3.8-27B (model card oficial) | 79,5 | 79,0 | −0,5 |
| MMLU (200 preguntas) | Qwen3.8-27B (evaluacion propia) | 87,5 | 86,5 | −1,0 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica requiere GPUs de 80 GB (A100, H100) o multi-GPU.
- VRAM estimada en FP8: alrededor de 28 GB para pesos, viable en una A100 40 GB o H100; no se publican mediciones exactas.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 16-18 GB para pesos, lo que permite ejecucion en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto limitado.
- GPUs recomendadas: A100 80 GB o H100 para BF16; A100 40 GB o H100 para FP8; RTX 4090 / RTX 3090 para Q4_K_M.
- Cabe en GPU consumer: si, en cuantizacion Q4_K_M (24 GB) y potencialmente en FP8 con contexto reducido; el checkpoint BF16 completo no cabe en consumer.
- Opciones de despliegue: vLLM (documentado por el autor con `--reasoning-parser qwen3`), transformers (libreria declarada), llama.cpp / Ollama para la variante GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Censura politica (banco Pan y Xu) | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2 | 27,78 B | no disponible | Apache 2.0 | 3,5 % (4/113) | Hugging Face (BF16, FP8, GGUF) |
| Qwen3.8-27B | no disponible en la informacion | no disponible | Apache 2.0 | 86,7 % (98/113) | Hugging Face (modelo base) |
| Otras variantes uncensored de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- La evaluacion de censura politica cubre unicamente preguntas en chino; no se han evaluado otros idiomas ni otras formas de censura.
- Una respuesta sustantiva no implica que sea correcta: el autor advierte explicitamente que los usuarios deben verificar las afirmaciones factuales de forma independiente.
- El modelo conserva el rechazo de peticiones dañinas en el 95 % de los casos evaluados, pero el 5 % restante supone un riesgo adicional frente al base (100 % de rechazos) en entornos de produccion.
- La reduccion de censura puede aumentar la probabilidad de generar contenido politicamente sensible, lo que exige revision y moderacion adicionales en despliegues publicos.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; el autor solo advierte de la necesidad de verificacion.
- Sesgos conocidos: no documentados mas alla de la censura politica; el fine-tune no aborda otros sesgos del modelo base.
- Licencia Apache 2.0 heredada del Qwen3.8-27B, con atribucion al equipo Qwen retenida; permite uso comercial, pero conviene revisar las condiciones del modelo base.
- El modelo tiene muy poca adopcion (35 descargas, 1 like) y no hay evidencia de validacion independiente de los resultados publicados.
- No se documentan el dataset de ajuste, el numero de tokens ni la metodologia exacta del fine-tune, lo que dificulta reproducir o auditar el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Variante FP8: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-FP8
- Variante GGUF Q4_K_M: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de referencia (Pan y Xu, 2026, PNAS Nexus): https://doi.org/10.1093/pnasnexus/pgag013
