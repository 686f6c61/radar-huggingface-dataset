# HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF

## Resumen

GLM-4-9B Cooking Assistant (GGUF) es una cuantización en formato GGUF de un ajuste fino no oficial del modelo GLM-4-9B-0414 de Zhipu AI, desarrollado por Humanjava Enterprises. El modelo está especializado en asistencia culinaria: responde preguntas sobre platos, ingredientes, técnicas y seguridad alimentaria, y está entrenado para leer recetas proporcionadas por el usuario en lugar de inventar detalles. Su innovación principal no es factual sino conductual: aprende a abstenerse y a solicitar la receta cuando no la tiene, reduciendo la invención de detalles del 40,1 % (modelo base) al 9,7 % en preguntas que requieren una receta no mostrada.

El modelo parte de la arquitectura GLM-4 de 9.400 millones de parámetros y se distribuye en cuantizaciones GGUF para llama.cpp, Ollama y LM Studio, con la versión Q4_K_M funcionando íntegramente en una GPU de 8 GB. La versión completa en safetensors está disponible en un repositorio separado para Transformers y vLLM. Está entrenado en 26 idiomas y evaluado en 21, e incluye versiones etiquetadas con git tags para fijar revisiones concretas.

Es relevante ahora porque ejemplifica un patrón de diseño práctico para producción: LoRA para el comportamiento, recuperación (retrieval) para los hechos y herramientas para los cálculos. En lugar de intentar memorizar recetas, el modelo se integra en aplicaciones que buscan la receta y se la entregan, delegando la aritmética de escalado y conversión de unidades a código determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GLM-4-0414); detalles internos de capas y atención no disponibles |
| Parametros totales | 9.400.279.040 (9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (los ejemplos de despliegue usan `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (6,2 GB), Q6_K (8,3 GB), Q8_0 (10,0 GB), BF16 (18,8 GB); imatrix de 11 MB para Q4_K_M y Q6_K |
| Idiomas soportados | en, es, pt, it, fr, nl, de, ru, bn, id, fa, ja, pl, sv, vi, tl, he, ml, tr, zh, ms, th, fi, ar, ta, hi (26 entrenados, 21 evaluados) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp, Ollama, LM Studio); safetensors en el repositorio de precision completa |

## Arquitectura y entrenamiento

El modelo se basa en GLM-4-9B-0414 de Zhipu AI, un transformer decoder-only de 9,4 mil millones de parámetros. El ajuste fino se realizó en dos etapas sobre el modelo base, empleando DPO (Direct Preference Optimization) según las etiquetas del repositorio, y se centra en modificar el comportamiento conversacional más que en inyectar conocimiento factual. La plantilla de chat es la de GLM-4-0414 (`[gMASK]<sop>`, turnos `<|system|>`, `<|user|>`, `<|assistant|>`), embebida en cada archivo GGUF, y no dispone de modo de razonamiento (thinking mode).

Las cuantizaciones Q4_K_M y Q6_K se generaron con una importance matrix calculada sobre conversaciones de entrenamiento en formato chat, estratificadas por tipo de pregunta y por si se mostró una receta, sin solapamiento con el conjunto de evaluación. Una particularidad técnica: la anchura de la capa feed-forward de GLM-4-9B no encaja en el tamaño de bloque de las k-quant, por lo que llama.cpp almacena algunas matrices de down-projection a mayor precisión (en Q4_K_M, 20 como Q8_0 y 20 como Q5_0; en Q6_K, las 40 como Q8_0), lo que añade unos 0,4 GB al archivo Q4_K_M. El modelo se entrenó con un system prompt específico de asistente culinario que se recomienda mantener en producción.

## Capacidades

- Generación de texto conversacional especializada en cocina: platos, ingredientes, técnicas y seguridad alimentaria.
- Lectura y razonamiento sobre recetas proporcionadas en el turno de usuario: responde a partir del texto entregado.
- Abstención calibrada: cuando falta la receta, solicita la cantidad o el dato original en lugar de inventarlo; puede ofrecer rangos típicos marcados explícitamente como típicos.
- Respuesta a preguntas generales de cocina: sustituciones de ingredientes, diagnóstico de fallos en un plato y seguridad alimentaria.
- Multilingüe: entrenado en 26 idiomas y evaluado en 21, incluyendo español, inglés, portugués, francés, alemán, chino, árabe, hindi y japonés, entre otros.
- Compatibilidad con llama.cpp, Ollama y LM Studio mediante GGUF, y con Transformers y vLLM mediante los safetensors de precisión completa.
- Versionado mediante git tags (`revision="v1"`, `ollama run vveerrgg/glm-4-9b-cooking-assistant:v1`) para fijar versiones en producción.
- No dispone de tool calling nativo documentado, ni de visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Asistente de recetas con recuperación aumentada: la aplicación busca la receta en una base de datos y la inserta en el turno de usuario; el modelo responde preguntas sobre ella (tiempos, temperaturas, sustituciones) leyendo el texto en lugar de improvisar. Es adecuado porque su entrenamiento prioriza responder desde la receta mostrada (96,2 % de respuestas correctas con receta, según la model card).
- Atención al cliente de una web de recetas: gestiona conversaciones multi-turno sobre platos publicados, pidiendo aclaraciones cuando el usuario no adjunta la receta, lo que reduce respuestas erróneas en un dominio donde un dato inventado (temperatura de cocción, tiempo) puede ser peligroso.
- Seguridad alimentaria en aplicaciones de cocina: responde sobre conservación, temperaturas internas y contaminación cruzada; su comportamiento de abstención permite derivar a fuentes oficiales cuando no está seguro, en lugar de afirmar con falsa confianza.
- Diagnóstico de fallos culinarios: el usuario describe qué salió mal (una salsa cortada, un bizcocho que no subió) y el modelo razona sobre causas probables a partir de técnicas generales, un caso donde no se requiere una receta concreta.
- Despliegue en hardware de consumo: con Q4_K_M (6,2 GB, 6,0 GB usados a contexto de 8k con caché KV q8_0) cabe en GPUs de 8 GB, y con cuantizaciones menores o descarga parcial funciona en 4 GB, lo que permite asistentes culinarios locales y privados sin conexión.
- Integración en aplicaciones móviles o de escritorio vía Ollama o LM Studio: el paquete incluye plantilla, system prompt y parámetros recomendados, lo que simplifica el despliegue de un asistente culinario de escritorio con una sola orden (`ollama run vveerrgg/glm-4-9b-cooking-assistant`).
- Evaluación comparativa de ajustes finos conductuales: el repositorio incluye el dataset `HumanjavaEnterprises/cooking-assistant-eval` y una familia de modelos equivalentes sobre Qwen3-8B, EuroLLM-9B y Olmo-3-7B, útil para investigadores que estudien abstención y procedencia en dominios especializados.

## Benchmarks y rendimiento

Resultados reportados en la model card (panel de tres jueces abiertos de otras familias de modelos, con acuerdo de 2 de 3):

| Metrica | Este modelo (v1) | GLM-4-9B-0414 base |
|---|---|---|
| Invención de detalles sin receta mostrada | 9,7 % | 40,1 % |
| Respuesta correcta con receta mostrada | 96,2 % | 83,1 % |
| Preguntas generales de cocina (82 preguntas) | 46,3 % | 56,1 % (no estadísticamente significativo) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores proceden de la evaluación propia del autor y no son comparables con benchmarks generales.

## Requisitos de hardware

- VRAM estimada: Q4_K_M usa 6,0 GB a contexto de 8k con caché KV q8_0; Q6_K usa 7,8 GB en las mismas condiciones; Q8_0 requiere 10 GB o más; BF16 ocupa 18,8 GB en disco.
- GPU recomendadas: cualquier GPU con 8 GB o más para Q4_K_M (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070); 10 GB o más para Q8_0 (RTX 3080, RTX 4080); A100 y H100 quedan sobredimensionadas para este tamaño, aunque son válidas para servir la versión safetensors con vLLM.
- Cabe en GPU de consumo: sí, con Q4_K_M en 8 GB; con descarga parcial (offload) funciona en 4 GB.
- Opciones de despliegue: llama.cpp (`llama-server -hf ...:Q4_K_M --jinja -c 8192`), Ollama (`vveerrgg/glm-4-9b-cooking-assistant` o `hf.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF:Q4_K_M`), LM Studio, y Transformers o vLLM con los safetensors del repositorio de precisión completa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-9B Cooking Assistant (este) | 9,4 B | no disponible | Asistente culinario con abstención; GGUF y safetensors | MIT | Hugging Face, Ollama |
| Qwen3-8B Cooking Assistant | 8 B (aprox.) | no disponible | Mismo dataset y mismas dos etapas de entrenamiento sobre Qwen3-8B; panel de jueces propio | no disponible en la informacion | Hugging Face, Ollama |
| EuroLLM-9B Cooking Assistant | 9 B (aprox.) | no disponible | Misma receta de ajuste sobre EuroLLM-9B | no disponible en la informacion | Hugging Face, Ollama |
| Olmo-3-7B Cooking Assistant | 7 B (aprox.) | no disponible | Misma receta de ajuste sobre Olmo-3-7B | no disponible en la informacion | Hugging Face, Ollama |

Los archivos GGUF de este modelo son algo mayores que los equivalentes de Qwen3-8B porque GLM-4-9B tiene más parámetros (los archivos BF16 y Q8_0 son aproximadamente 1,15 veces los de Qwen3-8B) y por el almacenamiento a mayor precisión de algunas matrices de down-projection. No se dispone de comparaciones de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No mejora al modelo base en preguntas generales de cocina: en las 82 preguntas generales evaluadas obtuvo 46,3 % frente al 56,1 % del base, aunque la diferencia no es estadísticamente significativa. No debe esperarse una mejora en conocimiento factual general.
- No memoriza recetas: si la aplicación no le proporciona la receta, el modelo pedirá los datos o marcará sus sugerencias como típicas; no es una base de datos culinaria.
- Riesgo de alucinación residual: aunque la invención de detalles baja al 9,7 %, sigue existiendo; en seguridad alimentaria conviene validar temperaturas y tiempos con fuentes oficiales.
- Evaluación propia del autor: los resultados provienen de un panel de tres jueces abiertos con acuerdo de 2 de 3, no de benchmarks estándar ni de evaluaciones independientes.
- Sin modo de razonamiento: la model card indica explícitamente que no hay thinking mode, lo que limita tareas de razonamiento multi-paso complejo.
- Ollama no lee la plantilla embebida: es necesario usar los archivos `template`, `system` y `params` del repositorio o la etiqueta de librería; de lo contrario, el formato de prompt será incorrecto.
- Licencia MIT: permisiva para uso comercial, pero el modelo es un ajuste fino no oficial y no está respaldado por Zhipu AI / Z.ai; conviene revisar también las condiciones del modelo base GLM-4-9B-0414.
- Idiomas: aunque se entrenó en 26 idiomas, solo se evaluó en 21; el rendimiento en los idiomas no evaluados no está verificado.
- Longitud de contexto: no documentada en la información disponible; los ejemplos de despliegue usan 8192 tokens, por lo que no debe asumirse una ventana mayor sin verificación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant-GGUF
- Modelo de precisión completa (safetensors): https://huggingface.co/HumanjavaEnterprises/GLM-4-9B-Cooking-Assistant
- Versión equivalente sobre Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant
- Versión GGUF sobre Qwen3-8B: https://huggingface.co/HumanjavaEnterprises/Qwen3-8B-Cooking-Assistant-GGUF
- Versión GGUF sobre EuroLLM-9B: https://huggingface.co/HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant-GGUF
- Versión GGUF sobre Olmo-3-7B: https://huggingface.co/HumanjavaEnterprises/Olmo-3-7B-Cooking-Assistant-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Ollama: `ollama run vveerrgg/glm-4-9b-cooking-assistant`
