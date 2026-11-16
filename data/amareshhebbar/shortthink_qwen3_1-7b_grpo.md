# AmareshHebbar/ShortThink_Qwen3_1.7B_GRPO

## Resumen

ShortThink GRPO es un ajuste fino por aprendizaje por refuerzo del modelo Qwen3-1.7B, desarrollado por AmareshHebbar, que enseña al modelo a razonar de forma más concisa sin perder precisión. El problema que aborda es concreto: los modelos de razonamiento tienden a gastar muchos más tokens de los necesarios en problemas fáciles, lo que encarece la inferencia y aumenta la latencia. ShortThink penaliza las respuestas largas y premia las correctas y breves, comprimiendo especialmente los problemas sencillos.

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B (1.720.574.976 parámetros reales según los pesos en safetensors) y se entrena con GRPO online y una recompensa relativa de longitud dentro de cada grupo de generaciones. Los pesos resultantes son un merge en bf16 de un adaptador LoRA aplicado sobre todas las capas lineales. El repositorio ocupa 3,7 GB.

Es relevante porque demuestra que el ajuste fino con RL supera claramente a las alternativas de prompting para reducir tokens de razonamiento: frente al modelo base en modo thinking, reduce un 57,4 % los tokens generados con una precisión superior en MATH500 (83,0 frente a 70,0). Forma parte de una colección de seis variantes entrenadas con el mismo dataset y evaluadas con la misma tabla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionados); adaptador LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de Qwen3 con 1,7 mil millones de parametros. El ajuste se realizo con GRPO online partiendo del modelo base, con una recompensa de grupo relativa a la longitud: las respuestas correctas obtienen 1 mas un bonus que crece cuanto mas cortas son respecto a sus hermanas del mismo grupo, y las incorrectas nunca reciben recompensa positiva. Se emplea la perdida Dr. GRPO sin escalado de recompensas (`scale_rewards=False`), lo que evita favorecer respuestas largas e incorrectas.

Los datos de entrenamiento provienen del dataset autogenerado `AmareshHebbar/ShortThink_Traces_Qwen3_1.7B`. El entrenamiento usa LoRA sobre todas las capas lineales (r=64, alpha=128, dropout=0,0), fusionado despues en safetensors bf16 completos. Hiperparametros destacados: lr 3e-05, 60 pasos maximos, 8 generaciones por prompt, batch por dispositivo 4, acumulacion de gradiente 8, warmup ratio 0,05, longitud maxima de prompt 512, longitud maxima de completion 2048, alpha 0,5, beta 0,0, temperatura 0,6, top_p 0,95, top_k 20. La innovacion principal es el esquema de recompensa que comprime mas los problemas faciles que los dificiles, manteniendo la precision en los dificiles.

## Capacidades

- Generacion de texto conversacional y razonamiento paso a paso en modo thinking.
- Razonamiento matematico conciso: reduce tokens manteniendo o mejorando la precision en MATH500 y GSM8K.
- Compresion adaptativa por dificultad: mayor reduccion de tokens en problemas faciles (62,7 % en nivel 1 de MATH) y menor en los dificiles (36,5 % en nivel 5).
- Razonamiento multi-paso con formato de respuesta final en `\boxed{}`.
- Soporte de plantilla de chat de Qwen3 con `enable_thinking=True`.
- Capacidades multilingues limitadas al ingles segun la model card.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Vision o audio: no disponible (modelo solo de texto).

## Casos de uso

- Evaluacion matematica automatizada en produccion: el modelo resuelve problemas de MATH500 y GSM8K con menos tokens que el base, reduciendo coste por consulta a 0,132 USD por 1.000 consultas segun la medicion del autor, adecuado para pipelines de correccion o tutoria.
- Tutoria educativa con razonamiento visible: al comprimir mas los problemas faciles, un asistente puede mostrar explicaciones breves en ejercicios sencillos y detalladas en los dificiles, mejorando la experiencia sin perder rigor.
- Backend de razonamiento de bajo coste: con latencia p50 de 15,4 s a batch 1 en vLLM, encaja en servicios donde el coste por token es critico y se prefiere un modelo pequeno desplegable en una sola GPU.
- Generacion de cadenas de razonamiento para destilacion: las trazas cortas y correctas sirven como datos de entrenamiento para modelos aun mas pequenos o para SFT de modelos de dominio.
- Despliegue en entornos con recursos limitados: al ser un modelo de 1,7B en bf16 (3,7 GB de repo), puede servirse en GPUs de consumo y en infraestructura modesta mediante vLLM u otros servidores compatibles con text-generation-inference.
- Filtrado y verificacion de respuestas matematicas: integrado en un pipeline que compare la respuesta final en `\boxed{}` con `math_verify`, sirve como primer paso de verificacion antes de escalar a un modelo mayor.
- Prototipado de agentes de razonamiento: aunque el soporte de tool calling no esta documentado, el formato de chat y el modo thinking permiten experimentar con bucles de razonamiento en entornos controlados.

## Benchmarks y rendimiento

Resultados publicados por el autor, con los mismos prompts, ajustes de muestreo y evaluacion con `math_verify`. MATH500 y GSM8K usan 1 muestra por problema; AIME 2024, 4 muestras. Los tokens incluyen el razonamiento. La latencia se mide a batch 1 con vLLM y el coste asume 1,0 USD/hora de GPU.

| Modelo | MATH500 acc | MATH500 tokens | GSM8K acc | GSM8K tokens | Tokens por acierto | Cambio de tokens vs base thinking | Latencia p50 (s) | Coste por 1k consultas (USD) |
|---|---|---|---|---|---|---|---|---|
| Qwen3 1.7B (thinking) | 70,0 | 3958 | 87,5 | 2205 | 4087 | mismo | 36,8 | 0,419 |
| Qwen3 1.7B (thinking + prompt conciso) | 78,6 | 3061 | 88,6 | 1370 | 2721 | 28,1 % menos | 23,4 | 0,277 |
| Qwen3 1.7B (sin thinking) | 72,8 | 901 | 80,4 | 313 | 813 | 80,3 % menos | 6,3 | 0,056 |
| Qwen3 1.7B (budget forcing 1024) | 45,4 | 1473 | 70,0 | 1219 | 2494 | 56,3 % menos | 10,6 | 0,101 |
| ShortThink SFT | 73,4 | 3767 | 89,0 | 2041 | 3713 | 5,8 % menos | 44,2 | 0,386 |
| ShortThink DPO | 81,8 | 2831 | 88,9 | 1288 | 2455 | 33,2 % menos | 27,9 | 0,236 |
| ShortThink GRPO | 83,0 | 2016 | 85,7 | 612 | 1571 | 57,4 % menos | 15,4 | 0,132 |

Compresion por dificultad en MATH500:

| Nivel MATH | Precision base | Precision del modelo | Tokens base | Tokens del modelo | Cambio de tokens |
|---|---|---|---|---|---|
| Nivel 1 | 95,3 | 97,7 | 2507 | 935 | 62,7 % menos |
| Nivel 2 | 91,1 | 90,0 | 2935 | 1089 | 62,9 % menos |
| Nivel 3 | 78,1 | 89,5 | 3687 | 1570 | 57,4 % menos |
| Nivel 4 | 67,2 | 85,2 | 4176 | 2109 | 49,5 % menos |
| Nivel 5 | 44,0 | 66,4 | 5114 | 3245 | 36,5 % menos |

AIME 2024 y MMLU figuran como columnas vacias en la tabla del autor: no se publicaron resultados para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 3,4 GB (1,72B parametros a 2 bytes); con overhead de activaciones y cache KV, el consumo real es mayor y depende de la longitud de contexto.
- GPU recomendadas: el autor mide con vLLM y `gpu_memory_utilization` de 0,3 durante el entrenamiento, lo que sugiere que cabe en GPUs de 16 GB o mas; para produccion se recomiendan A100, H100 o L40S si se busca throughput alto.
- GPU de consumo: al ser un modelo de 1,7B, es desplegable en RTX 4090 (24 GB), RTX 4080 (16 GB) y, con cuantizacion, en GPUs de 8-12 GB; no se publican pesos GGUF en el repositorio.
- Opciones de despliegue: vLLM (usado por el autor), text-generation-inference (tag `text-generation-inference`), transformers con safetensors; llama.cpp u Ollama requeririan conversion a GGUF no incluida.
- Latencia y throughput: latencia p50 de 15,4 s a batch 1 con vLLM para las respuestas de MATH500 (incluyendo thinking); coste medido de 0,132 USD por 1.000 consultas asumiendo 1,0 USD/hora de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH500 acc | GSM8K acc | Tokens por acierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ShortThink GRPO (este) | 1,72B | no disponible | 83,0 | 85,7 | 1571 | apache-2.0 | Hugging Face |
| Qwen3 1.7B (thinking) | 1,72B | no disponible | 70,0 | 87,5 | 4087 | apache-2.0 | Hugging Face |
| ShortThink DPO | 1,72B | no disponible | 81,8 | 88,9 | 2455 | apache-2.0 | Hugging Face |
| ShortThink SFT | 1,72B | no disponible | 73,4 | 89,0 | 3713 | apache-2.0 | Hugging Face |

La comparativa se limita a las variantes de la misma coleccion y al modelo base, unicos datos publicados. No se dispone de resultados de benchmarks frente a modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; el rendimiento en castellano u otros idiomas no esta evaluado.
- La precision en GSM8K baja respecto al modelo base (85,7 frente a 87,5) y respecto a ShortThink SFT y DPO (89,0 y 88,9): la compresion agresiva tiene un coste en tareas mas sencillas.
- AIME 2024 y MMLU no se publicaron, por lo que no hay evidencia de rendimiento en razonamiento de alta dificultad ni en conocimiento general.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se documentan evaluaciones de veracidad ni de sesgos.
- El ajuste con recompensa de longitud puede producir razonamientos excesivamente breves en problemas que requieren mas pasos; los resultados por nivel muestran menor compresion en nivel 5, pero la precision en ese nivel (66,4) sigue siendo limitada.
- No se documenta soporte de tool calling, function calling ni capacidades de agente; no debe asumirse en produccion sin validacion.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni mediciones de throughput en batch; el despliegue en hardware de consumo requiere conversion propia.
- Licencia apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-1.7B y de los datos autogenerados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026: no cuenta con validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmareshHebbar/ShortThink_Qwen3_1.7B_GRPO
- Dataset de entrenamiento: https://huggingface.co/datasets/AmareshHebbar/ShortThink_Traces_Qwen3_1.7B
- Coleccion ShortThink: https://huggingface.co/collections/AmareshHebbar/shortthink-6afb0d2f2ea9eaf3f24b9363
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
