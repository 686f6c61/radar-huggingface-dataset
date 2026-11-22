# aramkris/fineweb-edu-124m-chat-dpo-qwen3

## Resumen

FineWeb-Edu 124M chat (SFT + DPO) es un modelo de lenguaje de 124 millones de parametros entrenado desde cero por el desarrollador independiente aramkris, y publicado en Hugging Face bajo licencia MIT. No es un modelo de la familia Qwen: se trata de un GPT propio cuyo formato de pesos y tokenizador han sido convertidos de forma exacta al formato estandar de Qwen3, de modo que `transformers`, llama.cpp, Ollama, LM Studio y cualquier herramienta compatible con Qwen3 pueden ejecutarlo sin codigo adicional del proyecto original.

El modelo parte de una base preentrenada con 2,5 mil millones de tokens de mini-fineweb-edu y Cosmopedia y una ventana de contexto de 512 tokens, y se ha afinado en dos fases: instruction tuning sobre smol-smoltalk con una estrategia de *replay* (una quinta parte de cada lote son textos de preentrenamiento) y dos rondas de DPO, la segunda con pares generados por el propio modelo y puntuados por Skywork-Reward-V2-Qwen3-0.6B. El resultado es un modelo conversacional muy pequeno que responde en el formato `User:` / `Assistant:` y termina sus respuestas con `<|endoftext|>`.

Su relevancia es fundamentalmente practica y educativa: demuestra un pipeline completo de preentrenamiento, SFT con mitigacion de olvido catastrofico, DPO y exportacion a GGUF en un unico repositorio, con verificacion numerica de que la copia en formato Qwen3 reproduce fielmente el modelo PyTorch original. No compite en capacidad con modelos de su misma epoca; su interes esta en la trazabilidad metodologica y en el coste de inferencia practicamente nulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3 (con LayerNorm sin sesgo en lugar de RMSNorm; embeddings de salida no atados) |
| Parametros totales | 162.150.144 (segun safetensors); el autor lo describe como "124M" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors y GGUF), Q8_0 (GGUF 8 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), GGUF (bf16 y Q8_0) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de Qwen3 con una diferencia clave: las normas de bloque son LayerNorm sin sesgo, mientras que Qwen3 usa RMSNorm. Para que la conversion al formato Qwen3 sea exacta, el script `serving/export_hf.py` hace que el flujo residual tenga media cero (centrando los embeddings de entrada y todas las matrices que escriben en el), lo que iguala ambas funciones; ademas escala las proyecciones de query y key por raiz de 10 para que el unico epsilon de Qwen3 se comporte como la QK-norm del modelo original. No hay reentrenamiento: es el mismo modelo con otro empaquetado. Los GGUF se generan con el conversor de llama.cpp.

El entrenamiento consta de cuatro etapas. Primero, preentrenamiento sobre 2,5B tokens de mini-fineweb-edu y Cosmopedia con contexto de 512 tokens. Segundo, instruction tuning sobre smol-smoltalk con learning rate 5e-5 y *replay* de un quinto de texto de preentrenamiento por lote; sin ese replay, la puntuacion en 200 preguntas de conocimiento cerrado caia del 57,5% al 44%, y con el se mantiene en el 50%. Tercero, DPO sobre 2.000 pares de preferencia (una respuesta de referencia preferida frente a la respuesta greedy del modelo afinado), que reduce la repeticion y hace que mas respuestas terminen solas. Cuarto, DPO sobre pares puntuados por un modelo de recompensa: para 2.000 preguntas nuevas el modelo genera siete respuestas (greedy y seis muestras a temperatura 0,5), Skywork-Reward-V2-Qwen3-0.6B las puntua y se prefiere la mejor frente a la peor.

## Capacidades

- Generacion de texto conversacional en formato `User: …` / `Assistant: …`, con plantilla de chat incluida y terminacion en `<|endoftext|>`.
- Respuesta a preguntas de conocimiento general y cerrado, con conocimiento limitado propio de un modelo de 124M.
- Reduccion de repeticion y terminacion autonoma de respuestas gracias a las dos fases de DPO (99% de respuestas terminan solas en la evaluacion del autor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Ejecucion en `transformers`, llama.cpp, Ollama y LM Studio mediante el formato Qwen3.
- Servidor compatible con la API de OpenAI mediante `llama-server --jinja`.

## Casos de uso

- Docencia y demostracion de pipelines de LLM: el repositorio documenta preentrenamiento, SFT con replay, dos rondas de DPO y exportacion a GGUF con verificacion numerica, lo que lo convierte en un caso de estudio reproducible de extremo a extremo en una sola GPU de consumo.
- Pruebas de integracion de infraestructura: al ser compatible con el formato Qwen3, sirve para validar despliegues en Ollama, llama.cpp o `llama-server` con API OpenAI antes de mover cargas a modelos mayores, con un peso de 174 MB en Q8_0.
- Generacion de texto en dispositivos con recursos minimos: los 174 MB del GGUF Q8_0 permiten ejecutarlo en CPU, Raspberry Pi o moviles, para tareas de autocompletado o respuestas cortas sin conexion.
- Evaluacion de tecnicas de alineacion: sus metricas de repeticion de 4-gramas (2,3%), terminacion autonoma (99%) y longitud media (99 tokens) permiten comparar el efecto de DPO con y sin modelo de recompensa en un entorno controlado y de bajo coste.
- Prototipado de interfaces conversacionales: la plantilla de chat y el formato de turnos permiten construir demos de chatbot en horas, asumiendo que las respuestas seran plausibles pero a menudo incorrectas.
- Filtrado o clasificacion ligera de texto en pipelines: con 512 tokens de contexto y latencia muy baja en CPU, puede usarse para tareas de etiquetado simple o generacion de borradores que luego valide un modelo mayor.
- Investigacion sobre olvido catastrofico: la comparacion documentada entre SFT con y sin replay (57,5% frente a 44% en conocimiento cerrado) ofrece un punto de partida empirico para experimentos sobre retencion de conocimiento.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Este modelo (19 nov) | Antes del paso 4 (18 nov) | Modelo base |
|---|---|---|---|
| 100 preguntas reservadas, greedy: 4-gramas repetidos | 2,3% | 8,5% | no disponible |
| Respuestas que terminan solas | 99% | 87% | no disponible |
| Longitud media de respuesta (tokens) | 99 | 127 | no disponible |
| Conocimiento cerrado, eleccion multiple (200 preguntas) | 50,5% | 50,5% | 57,5% |
| Conocimiento cerrado, acierto autonomo | 31,0% | 30,0% | 24% |
| Media de benchmarks (HellaSwag, LAMBADA, ARC-Easy, PIQA, Winogrande) | 40,5 | 40,5 | 41,5 |

Verificacion de la conversion (mismas 100 preguntas reservadas):

| Metrica | Original (PyTorch) | Copia bfloat16 | Copia GGUF 8 bits |
|---|---|---|---|
| 4-gramas repetidos | 2,3% | 2,3% | 2,9% |
| Respuestas que terminan solas | 99% | 98% | 98% |
| Longitud media (tokens) | 99,0 | 98,8 | 100,4 |
| LAMBADA via llama-server | 14,4% | 14,3% | 14,3% |

No se han publicado resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en bfloat16 (329 MB de pesos mas cache KV para 512 tokens); unos 200 MB en Q8_0.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; tambien funciona en CPU sin GPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090 y aceleradores integrados; tambien en Raspberry Pi y dispositivos moviles con el GGUF Q8_0.
- Opciones de despliegue: `transformers` (bfloat16), llama.cpp, Ollama (`ollama run hf.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3:Q8_0`), LM Studio, `llama-server` con `--jinja -c 512` para API compatible con OpenAI, y text-generation-inference segun los tags del repositorio.
- Latencia y throughput: no disponibles de forma numerica; por el tamano del modelo se espera inferencia en tiempo real incluso en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| fineweb-edu-124m-chat-dpo-qwen3 (este) | 162M | 512 | MIT | safetensors, GGUF | Entrenado desde cero; media de benchmarks 40,5 |
| fineweb-edu-124m-base | 162M | 512 | MIT (presumible, no confirmado) | safetensors | Base preentrenada; media de benchmarks 41,5; 57,5% en conocimiento cerrado |
| fineweb-edu-124m-chat-dpo | no disponible | no disponible | no disponible | PyTorch nativo | Version anterior (15 nov) con pesos nativos; sin datos de rendimiento en la informacion disponible |
| Qwen3 (modelos oficiales) | no disponible | no disponible | no disponible | safetensors, GGUF | Solo comparte formato; no es comparable en capacidad ni entrenamiento |

No se dispone de datos de benchmarks de alternativas de la misma categoria (modelos conversacionales de ~100-200M parametros) en la informacion proporcionada.

## Limitaciones y advertencias

- Conocimiento muy limitado: el propio autor advierte que responde "con la forma correcta pero con el conocimiento de un modelo de 124M: plausible y a menudo incorrecto". El acierto autonomo en conocimiento cerrado es del 31,0%.
- Riesgo alto de alucinacion: las respuestas suenan verosimiles pero frecuentemente son falsas; no debe usarse en produccion para tareas que requieran exactitud factual.
- Contexto muy corto: 512 tokens, insuficiente para conversaciones largas, documentos o razonamiento multi-paso.
- Solo ingles: no soporta castellano ni otros idiomas.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al entrenarse con FineWeb-Edu y Cosmopedia hereda los sesgos de esas fuentes.
- Licencia MIT: permite uso comercial sin restricciones, pero la ausencia de garantias y la baja calidad factual hacen desaconsejable su uso comercial directo.
- La compatibilidad con Qwen3 es solo de formato: no debe asumirse equivalencia de comportamiento con modelos Qwen.
- Las metricas de repeticion y terminacion se miden sobre 100 preguntas reservadas del propio autor, no sobre un conjunto estandar externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo-qwen3
- Modelo base: https://huggingface.co/aramkris/fineweb-edu-124m-base
- Version anterior con pesos PyTorch nativos: https://huggingface.co/aramkris/fineweb-edu-124m-chat-dpo
- Repositorio del proyecto: https://github.com/a-ramakrishnan/tinystories-ARM-model
- Script de exportacion a Hugging Face: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/export_hf.py
- Script de conversion a GGUF: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/gguf.sh
- Script de verificacion: https://github.com/a-ramakrishnan/tinystories-ARM-model/blob/main/serving/check.py
- Modelo de recompensa usado en DPO: https://huggingface.co/Skywork/Skywork-Reward-V2-Qwen3-0.6B
- Dataset mini-fineweb-edu: https://huggingface.co/datasets/BaoMinhTran/mini-fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
