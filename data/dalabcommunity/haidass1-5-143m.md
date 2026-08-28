# DALabCommunity/Haidass1.5-143M

## Resumen

Haidass1.5-143M es un modelo de lenguaje pequeño (143 millones de parámetros) bilingüe inglés-chino, desarrollado por DALabCommunity y entrenado desde cero sobre aproximadamente 400 mil millones de tokens. Su característica más distintiva es que todo el pipeline de entrenamiento se ejecutó en el ecosistema de NPUs de Huawei Ascend (modelo 910B) utilizando el framework MindSpeed-LLM, lo que lo convierte en un referente para estudiar la viabilidad de entrenar modelos de lenguaje en hardware alternativo a las GPU de NVIDIA.

El modelo sigue la arquitectura Qwen3, con 30 capas, tamaño oculto de 576, atención con GQA (3 cabezas KV), RoPE con theta 100 000, normalización RMSNorm y activación SwiGLU. Soporta una longitud de contexto máxima de 4096 tokens y utiliza un vocabulario bilingüe personalizado de 64 000 tokens entrenado junto con el modelo. Se distribuye bajo licencia Apache 2.0 y sus pesos están en formato safetensors.

La relevancia de este modelo radica en dos aspectos: por un lado, demuestra que es posible entrenar modelos competitivos en hardware Ascend con un framework open source como MindSpeed-LLM; por otro, al ser un modelo base sin fine-tuning ni alineación, sirve como punto de partida para experimentos de investigación en dinámicas de entrenamiento, annealing y adaptación a tareas específicas en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) |
| Parametros totales | 143 071 296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible (entrenado en BF16; no se publican cuantizaciones oficiales) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo adopta la arquitectura Qwen3, un transformer decoder-only con 30 capas, tamaño oculto de 576, 9 cabezas de atencion y 3 cabezas KV (GQA) con dimension de cabeza 64. La capa FFN tiene un tamaño intermedio de 1536, activacion SwiGLU (SiLU) y normalizacion RMSNorm con epsilon 1e-6. La codificacion posicional es RoPE con theta 100 000, sin bias de atencion y con tie de embeddings (el embedding de entrada y la capa de salida comparten pesos). El vocabulario de 64 000 tokens fue entrenado especificamente para cubrir ingles y chino.

El entrenamiento se realizo sobre aproximadamente 400 mil millones de tokens mezclando varias fuentes: Ultra-FineWeb (ingles y chino), dclm-baseline-1.0, finemath-4plus, Ultra-FineWeb-L3 y cosmopedia. Se utilizo el framework MindSpeed-LLM v2.3.0 sobre NPUs Ascend 910B (servidores Atlas A2) con un batch global de 128 y secuencias de 4096 tokens. El optimizador fue AdamW con learning rate pico de 1.5e-3, weight decay de 1e-5, gradiente clipping de 2.0 y betas 0.9/0.95. No se aplico RLHF ni DPO; es un modelo base preentrenado sin instrucciones.

## Capacidades

- Generacion de texto bilingue (ingles y chino) con coherencia basica para un modelo de su tamano.
- Razonamiento y comprension limitados, acordes a los 143 millones de parametros; no compite con modelos de mayor escala.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso avanzado.
- No tiene modo thinking, vision ni audio.
- Capacidades multilingues limitadas a ingles y chino; no cubre otros idiomas.
- Al ser un modelo base, no responde a instrucciones ni mantiene dialogos de forma natural sin fine-tuning previo.

## Casos de uso

- Investigacion academica sobre dinamicas de entrenamiento de modelos pequenos en hardware Ascend: el modelo permite estudiar curvas de perdida, efectos de la mezcla de datos bilingues y comportamiento de la atencion GQA en escalas reducidas.
- Experimentos de annealing y fine-tuning: al ser un modelo base, se puede adaptar a tareas especificas como clasificacion de texto, analisis de sentimiento o generacion de resumenes en ingles y chino mediante fine-tuning supervisado.
- Prototipado rapido en entornos con recursos limitados: su tamano reducido (0.3 GB) permite ejecutarlo en CPU o GPUs de baja gama, ideal para validar pipelines de NLP antes de escalar a modelos mayores.
- Educacion y formacion en IA: sirve como ejemplo practico para ensenar conceptos de transformers, tokenizacion bilingue y entrenamiento distribuido en NPUs.
- Evaluacion comparativa de frameworks de inferencia: al ser un modelo pequeno y estandar (formato safetensors, arquitectura Qwen3), puede usarse para medir el rendimiento de vLLM, llama.cpp u Ollama en diferentes hardware.
- Desarrollo de herramientas de autocompletado o generacion de texto simple en aplicaciones offline donde el coste computacional sea critico y la calidad no sea el factor principal.

## Benchmarks y rendimiento

El autor publico resultados de evaluacion zero-shot con lm-eval-harness:

| Benchmark | Score |
|---|---|
| ARC-Easy | 59.09 |
| ARC-Challenge | 28.33 |
| PIQA | 68.72 |
| HellaSwag | 40.54 |
| OpenBookQA | 31.2 |
| Winogrande | 51.78 |
| agi_eval | 25.93 |

No se han publicado comparativas con otros modelos de tamano similar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en BF16 (el modelo pesa ~0.3 GB en safetensors, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM).
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.). Tambien funciona en CPU con suficiente RAM.
- Es compatible con hardware Ascend para inferencia, aunque no se documentan requisitos especificos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers de HuggingFace (con soporte para arquitectura Qwen3).
- Latencia y throughput: no disponibles oficialmente, pero por su tamano se espera una latencia muy baja (del orden de milisegundos por token en GPU) y alta velocidad en CPU.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos de parametros similares (por ejemplo, TinyLlama 1.1B o Qwen2.5-0.5B) en la informacion proporcionada. El autor afirma que el modelo es competitivo entre modelos multilingues menores de 150 millones de parametros, pero no se aportan datos comparativos concretos.

## Limitaciones y advertencias

- Tamano muy reducido: la capacidad de razonamiento, generacion coherente y comprension semantica es limitada en comparacion con modelos de cientos de millones o miles de millones de parametros.
- No tiene fine-tuning por instrucciones ni RLHF: no responde a prompts de forma natural ni sigue instrucciones complejas; es un modelo base preentrenado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido falso o inconsistente, especialmente en tareas de conocimiento factual.
- Limitacion de idiomas: solo ingles y chino; no cubre otros idiomas, lo que restringe su uso en entornos multilingues amplios.
- Contexto limitado a 4096 tokens: no apto para documentos largos o conversaciones extensas sin truncamiento.
- Sesgos: al entrenarse con datos web sin filtrado especifico de sesgos, puede heredar sesgos sociales, culturales o de genero presentes en los corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datasets utilizados (por ejemplo, cosmopedia o dclm) por si tuvieran restricciones adicionales.
- Para produccion: no se recomienda su uso directo en aplicaciones criticas sin un fine-tuning adecuado y una evaluacion exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DALabCommunity/Haidass1.5-143M
- Version anterior (Haidass-143M-v1): https://huggingface.co/DALabCommunity/Haidass-143M-v1
- Coleccion de modelos Haidass de DALabCommunity: https://huggingface.co/collections/DALabCommunity/haidass
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/DALabCommunity/Haidass-143M-v1
