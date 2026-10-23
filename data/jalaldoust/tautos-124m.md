# jalaldoust/tautos-124m

# Tautos-124m (jalaldoust)

## Resumen

Tautos-124m es un modelo de lenguaje de 124.475.904 parámetros con la arquitectura GPT-2 124M estándar (12 capas, 768 de anchura, 12 cabezas de atención, 1.024 tokens de contexto), publicado por el autor jalaldoust con la intención de que la comunidad pueda evaluar de forma independiente un resultado de eficiencia de muestreo en fine-tuning por refuerzo. El modelo se ha preentrenado con la "receta Tautos" sobre 100 millones de tokens de FineWeb-Edu, exactamente los mismos tokens que el baseline con el que se compara.

La relevancia no está en el modelo en sí —es un GPT-2 pequeño, en inglés y sin ajuste por instrucciones— sino en el protocolo de evaluación que lo acompaña: un script (`rl_eval.py`) que ejecuta GRPO sobre una tarea de sentimiento con reseñas de IMDB y un verificador basado en `lvwerra/distilbert-imdb`, y un fichero `reference_results.json` con las curvas de recompensa de este modelo y del baseline. Según esos datos, Tautos necesita entre 1,57x y 1,77x menos llamadas al verificador para alcanzar una recompensa retenida de 2,5 en tamaños de prompt de 64 a 4.096, ventaja que se diluye (1,07x y 1,01x) a partir de 8.192 prompts.

El método de preentrenamiento es propietario y no se describe ni en la model card ni en ningún otro sitio: el repositorio contiene únicamente los pesos preentrenados y el protocolo de evaluación, con licencia "evaluation-only". Esto convierte al modelo en un artefacto de verificación de una afirmación comercial, no en una base reutilizable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 124M estándar (`GPT2LMHeadModel`): 12 capas, 768 de anchura, 12 cabezas, 1.024 de contexto |
| Parametros totales | 124.475.904 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible; el autor solo publica pesos fp32 en safetensors y no distribuye versiones cuantizadas |
| Idiomas soportados | inglés (`en`) |
| Licencia | `other`, con nombre "evaluation-only" (ver `LICENSE.md` en el repositorio) |
| Formato de pesos | safetensors, fp32 (tamaño del repo: 0,5 GB) |
| Tokenizador | GPT-2 BPE (`gpt2`); matriz de embeddings ampliada a 50.304 filas, los ids 50.257 y superiores no se usan |
| Datos de preentrenamiento | 100M tokens de HuggingFaceFW/fineweb-edu, muchas épocas |
| Pérdida de validación | 3,756 nats/token en 4M tokens retenidos de FineWeb-Edu (baseline: 3,744) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only idéntico al GPT-2 de 124M de OpenAI: 12 bloques, dimensión de modelo 768, 12 cabezas de atención y ventana de contexto de 1.024 tokens. No hay innovaciones arquitectónicas: el modelo se carga con `GPT2LMHeadModel` sin modificaciones y el tokenizador es el BPE estándar de GPT-2. El único detalle no estándar es que la matriz de embeddings está rellenada hasta 50.304 filas, con los ids 50.257 en adelante sin uso, presumiblemente por requisitos de alineación del entrenamiento.

El preentrenamiento usa 100 millones de tokens de FineWeb-Edu —el mismo conjunto y el mismo número de tokens que el baseline— durante muchas épocas. El baseline es la configuración nanoGPT: AdamW, lotes de 0,5M tokens, schedule coseno y mejor checkpoint por pérdida de validación. La diferencia entre ambos es exclusivamente la receta de preentrenamiento, que el autor declara propietaria y no describe. No se documenta ningún ajuste posterior (RLHF, DPO, SFT); el modelo es una base de lenguaje pura. La pérdida de validación es ligeramente peor que la del baseline (3,756 frente a 3,744 nats/token), de modo que la ventaja declarada no proviene de un mejor modelado del lenguaje sino de una representación que se adapta con menos muestras en la fase de RL.

## Capacidades

- Generación de texto autorregresiva en inglés, como modelo base sin ajuste por instrucciones.
- Continuación de prompts y modelado de lenguaje genérico; no mantiene formato de chat ni sigue instrucciones de sistema.
- Adaptabilidad a tareas de clasificación o sentimiento mediante fine-tuning supervisado o por refuerzo, que es el escenario evaluado en la model card.
- Fine-tuning por RL con GRPO: el repositorio incluye `rl_eval.py`, que entrena contra un verificador externo (`lvwerra/distilbert-imdb`) usando como recompensa el logit POSITIVE del clasificador sobre prompt más completación.
- Soporte de tool calling / function calling: no disponible; el modelo no ha sido entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; solo inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Verificación independiente del resultado de eficiencia de muestreo: clonar el repositorio, instalar `requirements.txt` y ejecutar `python rl_eval.py --model jalaldoust/tautos-124m --budget 512 --passes 32` para reproducir la curva de recompensa retenida y compararla con `reference_results.json`. El modelo está pensado exactamente para esto.
- Investigación en eficiencia de muestreo en RL: sirve como punto de partida para estudiar cuántas llamadas a un verificador necesita un modelo pequeño para saturar una recompensa, con la ventaja de que el baseline y las curvas de referencia están publicados.
- Ablaciones de recetas de preentrenamiento a bajo coste: con 124M parámetros y 100M tokens de entrenamiento, cualquier experimento de preentrenamiento o de schedule se puede repetir en una sola GPU, usando este checkpoint como referencia pública.
- Docencia y formación en pipelines de transformers: el modelo se carga en tres líneas con `GPT2LMHeadModel` y `GPT2TokenizerFast`, y su tamaño (0,5 GB en fp32) permite ejecutar ejemplos completos de generación, evaluación y fine-tuning en un portátil.
- Pruebas de integración de infraestructura de inferencia: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, es útil como modelo de humo para validar despliegues TGI o endpoints compatibles antes de mover cargas mayores.
- Experimentos de control de sentimiento y steering: el par prompt de 12 tokens de reseña de IMDB más verificador DistilBERT-IMDB constituye un banco reproducible para probar técnicas de control de la salida sin necesidad de anotación humana.
- Estudio comparativo de tokenizadores y embeddings: la ampliación de la matriz de embeddings a 50.304 filas permite analizar el efecto del padding de vocabulario en modelos pequeños.

## Benchmarks y rendimiento

El autor no publica MMLU, HumanEval, GSM8K ni benchmarks estándar. El único dato de rendimiento es la pérdida de validación y la tabla de eficiencia de muestreo en RL.

Pérdida de validación (4M tokens retenidos de FineWeb-Edu):

| Modelo | Pérdida (nats/token) |
|---|---|
| Baseline (receta GPT-2 estándar, nanoGPT) | 3,744 |
| Tautos-124m | 3,756 |

Llamadas al verificador necesarias para alcanzar por primera vez una recompensa retenida de 2,5 (P(positivo) ≈ 0,98; el clasificador satura en ~2,95). Presupuesto de 8 completaciones por prompt y pasada:

| Prompts | Baseline | Tautos | Ratio |
|---|---|---|---|
| 64 | 47,0k | 27,1k | 1,74x |
| 128 | 48,2k | 29,1k | 1,65x |
| 256 | 46,2k | 29,5k | 1,57x |
| 512 | 47,0k | 28,2k | 1,66x |
| 1.024 | 45,6k | 28,6k | 1,59x |
| 2.048 | 47,2k | 29,6k | 1,59x |
| 4.096 | 55,0k | 31,1k | 1,77x |
| 8.192 | 58,7k | 54,8k | 1,07x |
| 16.384 | 108,5k | 107,6k | 1,01x |

Advertencias del propio autor: se trata de una sola semilla, las completaciones muestreadas introducen ruido de centésimas en la recompensa, y a partir de 8.192 prompts ambos modelos alcanzan el umbral en una o dos pasadas, por lo que la comparación es poco precisa en ese rango.

## Requisitos de hardware

- VRAM para inferencia: los pesos en fp32 ocupan aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en 2 GB de VRAM (estimación a partir del recuento de parámetros; el autor no publica cifras de VRAM).
- GPU recomendadas para inferencia: cualquier GPU consumer con 2 GB o más; una RTX 3060, RTX 4060 o superior es más que suficiente. No se requiere A100 ni H100 para servir el modelo.
- Memoria en bf16/fp16: alrededor de 0,25 GB de pesos, más caché KV para 1.024 tokens de contexto, insignificante frente a los pesos (estimación).
- Protocolo de evaluación RL: el autor indica que una ejecución con 512 prompts y 32 pasadas tarda unos 15 minutos en una A100. No se documenta el rendimiento en GPUs consumer para este protocolo, que además requiere cargar el verificador DistilBERT-IMDB.
- Opciones de despliegue: `transformers` es la vía documentada. El modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y endpoints tipo Inference Endpoints, aunque no se aportan configuraciones. No se publican ficheros GGUF ni recetas para llama.cpp u Ollama; vLLM no está documentado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Tautos-124m | 124,5M | 1.024 | evaluation-only | Receta de preentrenamiento propietaria orientada a eficiencia de muestreo en RL | Pesos safetensors fp32 en HuggingFace |
| Baseline nanoGPT (misma arquitectura y tokens) | 124,5M | 1.024 | no disponible en la información proporcionada | Receta GPT-2 estándar (AdamW, lotes de 0,5M tokens, schedule coseno) | Referenciado en la model card; no se publica un repositorio aparte |
| GPT-2 124M original (OpenAI) | 124M | 1.024 | MIT | Modelo base preentrenado en WebText | Ampliamente disponible en HuggingFace |
| SmolLM-135M | 135M | 2.048 | Apache-2.0 | Modelo base pequeño orientado a despliegue en dispositivo | Disponible en HuggingFace |

Nota: los datos de GPT-2 124M original y SmolLM-135M proceden de conocimiento general sobre esos modelos y no están verificados en la información proporcionada por el autor; se incluyen solo como referencia de categoría. Frente a ellos, la única ventaja documentada de Tautos-124m es la reducción de llamadas al verificador en el protocolo GRPO descrito, no una mejora en perplejidad ni en capacidades generales.

## Limitaciones y advertencias

- Licencia "evaluation-only": está pensada para evaluar la afirmación del autor. El uso comercial, el reentrenamiento y la redistribución quedan restringidos; hay que leer `LICENSE.md` antes de cualquier uso que no sea de evaluación.
- Método de preentrenamiento propietario y no descrito: el resultado no es reproducible. La afirmación de eficiencia de muestreo solo puede comprobarse empíricamente con el protocolo incluido, no reconstruirse.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones, no mantiene formato de chat, no soporta tool calling ni razonamiento multi-paso. No es apto para asistentes directos.
- Contexto de 1.024 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o código con mucho contexto.
- Solo inglés: cualquier uso en castellano queda fuera de lo declarado por el autor.
- Entrenado con 100M tokens: conocimiento del mundo muy limitado y tendencia alta a la alucinación y a la incoherencia en temas especializados.
- Pérdida de validación ligeramente peor que el baseline (3,756 frente a 3,744): la ventaja declarada es específica de la fase de RL, no del modelado del lenguaje.
- Evidencia limitada: una sola semilla, ruido de centésimas en la recompensa y comparación poco fiable a partir de 8.192 prompts, donde ambos modelos saturan.
- Dependencia del verificador: la métrica se apoya en `lvwerra/distilbert-imdb`, un clasificador de sentimiento que satura en ~2,95; los resultados están acotados por los sesgos y errores de ese clasificador y por el dominio de IMDB.
- Sin cuantizaciones oficiales ni datos de rendimiento en producción (latencia, throughput, VRAM) publicados por el autor.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jalaldoust/tautos-124m
- Sitio del autor con el resultado de eficiencia de muestreo: https://tautos.io
- Contacto del autor: kasra@tautos.io
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de evaluación IMDB: https://huggingface.co/datasets/stanfordnlp/imdb
- Verificador de recompensa DistilBERT-IMDB: https://huggingface.co/lvwerra/distilbert-imdb
- Tokenizador GPT-2: https://huggingface.co/gpt2
- Configuración nanoGPT citada como baseline (referencia externa, no enlazada en la model card): https://github.com/karpathy/nanoGPT
- Ficheros del repositorio no enlazados individualmente en la información disponible: `rl_eval.py`, `reference_results.json`, `requirements.txt`, `LICENSE.md`
