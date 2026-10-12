# dheepakkaran/arenajudge-qwen2.5-1.5b-lora-onnx-w4

## Resumen

ArenaJudge es un clasificador de preferencias derivado de Qwen/Qwen2.5-1.5B-Instruct mediante un ajuste fino con LoRA (r=16, alpha=32) sobre todas las proyecciones de atención y MLP, al que se le añadió una cabeza de clasificación de secuencia de tres clases. Su tarea es predecir cuál de dos respuestas de chatbot preferiría un humano, con las etiquetas "A gana", "B gana" o "empate". Fue desarrollado por Dheepak Karan y Karuniya Premnath (equipo "Dk") para la competición LLM Classification Finetuning de Kaggle, basada en votos humanos de Chatbot Arena. El modelo se distribuye como un grafo ONNX con cuantización weight-only de 4 bits (`MatMulNBits`, block size 32, simétrica) pensado para servir en CPU.

La relevancia de esta ficha radica en que no es un modelo generativo, sino un reward model / preference model listo para producción en CPU: ocupa 1,76 GB, mantiene las activaciones en fp32 y, según la model card, iguala la precisión de fp32 (log loss 1.0393 frente a 1.0395) reduciendo el tamaño aproximadamente de 6,2 GB a 1,76 GB. Esto lo hace atractivo para pipelines de evaluación automática de respuestas, filtrado de datos sintéticos o reranking de candidatos, donde no se necesita generar texto sino puntuar alternativas con baja latencia y sin GPU.

El modelo solo soporta inglés, la licencia es Apache-2.0 y no tiene descargas ni "likes" en el momento de redactar esta ficha. Es importante subrayar que aprende de preferencias de usuarios de Chatbot Arena, no de una noción objetiva de calidad, y que su ventana efectiva está fuertemente limitada por el formato de entrada (máximo 96 tokens de prompt y 200 tokens por respuesta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con cabeza de clasificacion de secuencia de 3 clases; exportado a ONNX |
| Parametros totales | 1,5 mil millones (modelo base Qwen2.5-1.5B-Instruct); el repo ocupa 1,8 GB |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | No se especifica una ventana de contexto general; el formato de entrada impone prompt <= 96 tokens y cada respuesta <= 200 tokens, truncados por separado |
| Tipos de cuantizacion | Weight-only 4-bit (`MatMulNBits`, block size 32, simetrica); la model card menciona tambien INT8 dinamico, INT8 dinamico per-channel y weight-only 8-bit como comparativas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime); el ajuste LoRA se consolido en el grafo exportado |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar. Sobre él se aplicó un ajuste fino con LoRA de rango 16 y alpha 32 en todas las proyecciones de atención y MLP, y se sustituyó la cabeza de generación de lenguaje por una cabeza de clasificación de secuencia de 3 clases, inicializada con valores aleatorios pequeños (desviación estándar 1e-3). El entrenamiento se realizó durante 1 época en fp16 sobre una única NVIDIA T4, con una tasa de aprendizaje de 1e-4 para los adaptadores LoRA y 5e-5 para la cabeza. Los datos fueron 30.000 filas del `train.csv` de la competición (barajadas con semilla 42, filas 12.000 a 42.000).

La innovación técnica principal es la estrategia de cuantización para CPU: se descartó la cuantización dinámica INT8 porque también cuantiza las activaciones y los valores atípicos de estas en los LLM degradaban la precisión (log loss 1.0987 en la variante per-channel). La cuantización weight-only mantiene las activaciones en fp32 y consigue una precisión equivalente a fp32 (1.0393 frente a 1.0395) con un tamaño de 1,76 GB. Se cuantizaron 197 capas MatMul. La model card reconoce que la muestra de validación para las comparativas de motores de CPU fue de solo 80 filas, por lo que las diferencias pequeñas deben tratarse como ruido.

## Capacidades

- Clasificación de preferencias: dado un prompt y dos respuestas candidatas (A y B), devuelve una distribución de probabilidad sobre tres clases (`probs` = [gana A, gana B, empate]).
- Puntuación de respuestas de chatbot: puede usarse como reward model o reranker para ordenar candidatos generados por otros modelos.
- Inferencia en CPU: exportado a ONNX con runtime de CPU (`CPUExecutionProvider`), sin necesidad de GPU.
- Formato de entrada estricto: espera la plantilla exacta con cabeceras `Prompt:`, `Response A:`, `Response B:` y la pregunta `Which response is better?`, con truncados definidos en `demo_config.json`.
- Soporte de test-time augmentation por intercambio (swap TTA): se pueden evaluar los pares A/B y B/A y promediar para mitigar el sesgo de posición.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un clasificador de texto en inglés.
- Capacidades multilingües: no; únicamente inglés.

## Casos de uso

- Evaluación automática de respuestas (LLM-as-a-judge ligero): en un pipeline de evaluación offline, se comparan las salidas de dos versiones de un modelo ante el mismo prompt y ArenaJudge emite una probabilidad de preferencia, permitiendo regresiones controladas sin coste de GPU.
- Reranking de candidatos en producción: dado un conjunto de respuestas generadas por un modelo grande, se usa este clasificador en CPU para ordenarlas por preferencia y devolver la mejor, reduciendo coste de inferencia.
- Filtrado de datos sintéticos: durante la construcción de datasets de instrucciones, se descartan pares donde una respuesta no supera a la alternativa o donde el modelo predice empate con alta probabilidad, mejorando la calidad del corpus.
- Evaluación de asistentes conversacionales: se puntúan pares de respuestas reales de un sistema de atención al cliente frente a una respuesta de referencia, monitorizando la deriva de calidad a lo largo del tiempo.
- Investigación en preferencias humanas: al reproducir parcialmente las etiquetas de Chatbot Arena, sirve como línea base para estudiar cómo modelos y humanos difieren en juicios de calidad, o para auditar sesgos de longitud y formato.
- Detección de respuestas degeneradas: con umbrales sobre la clase "empate" o sobre la probabilidad de victoria, se marca automáticamente contenido ambiguo o de baja calidad para revisión humana en un flujo de moderación.
- Servicio de demostración interactiva en CPU: al ocupar 1,76 GB y ejecutarse con onnxruntime en CPU, cabe en instancias pequeñas o incluso en portátiles para demos tipo Space (el autor publica uno).

## Benchmarks y rendimiento

| Configuracion | Log loss (menor es mejor) |
|---|---|
| Validacion, 2.000 filas retenidas, GPU fp16 | 0,9872 |
| + test-time augmentation por intercambio | 0,9847 |
| + stacker LightGBM (longitud/estilo) | 0,9793 |
| Leaderboard publico de Kaggle (con TTA + stacker) | 1,00281 |
| Linea base uniforme 1/3 | 1,0986 |

Motores de CPU (80 filas de validacion, batch size 1, entradas de ~350 tokens):

| Motor | Log loss | Latencia p50, 4 hilos | Latencia p50, 2 hilos | Tamano |
|---|---|---|---|---|
| PyTorch fp32 | 1,0395 | 8,6 s | no disponible | ~6,2 GB |
| ONNX Runtime fp32 | 1,0395 | 6,2 s | no disponible | ~6,2 GB |
| ONNX INT8 dinamico | 1,0501 | 3,5 s | no disponible | no disponible |
| ONNX INT8 dinamico per-channel | 1,0987 | 3,5 s | 2,9 s | 1,55 GB |
| ONNX weight-only 8-bit | 1,0400 | 8,3 s | 8,5 s | 2,41 GB |
| ONNX weight-only 4-bit (este modelo) | 1,0393 | 6,6 s | 5,6 s | 1,76 GB |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica para el modelo exportado, esta pensado para inferencia en CPU. El repo ocupa 1,8 GB y el grafo cuantizado 1,76 GB, por lo que basta con memoria RAM para cargarlo (se recomienda al menos 4 GB libres junto con el runtime).
- GPU recomendadas: no especificadas; el autor entreno sobre una NVIDIA T4, pero la exportacion distribuida es para CPU (`CPUExecutionProvider`). No se aportan datos de rendimiento en GPU para este grafo cuantizado.
- Compatibilidad con GPU de consumo: no aplica al artefacto ONNX de 4 bits distribuido; el modelo base en fp32 (~6,2 GB) podria caber en GPU de consumo con suficiente VRAM, pero no es el formato publicado.
- Opciones de despliegue: ONNX Runtime en CPU (el escenario documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al ser un clasificador de secuencia con cabecera de 3 clases no es directamente compatible con esos servidores de generacion sin adaptacion.
- Latencia y throughput: con el grafo de 4 bits, latencia p50 de 6,6 s con 4 hilos y 5,6 s con 2 hilos para entradas de ~350 tokens y batch size 1. No se aportan datos de throughput a mayor batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ArenaJudge Qwen2.5-1.5B LoRA ONNX w4 (este modelo) | 1,5 B | Prompt <= 96 tokens, respuestas <= 200 tokens | Log loss 0,9872 en validacion fp16; 1,0393 en ONNX 4-bit CPU; 1,00281 en leaderboard Kaggle | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | Ventana de contexto propia de Qwen2.5 (no detallada aqui) | No comparable: es generativo, no clasificador de preferencias | Apache-2.0 | HuggingFace |
| Otros jueces / reward models de la misma competicion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables adicionales (por ejemplo, reward models de 1-3 B parametros como ArmoRM, Starling-RM o similares) en la documentacion proporcionada, por lo que no se incluyen cifras comparativas.

## Limitaciones y advertencias

- Longitud de entrada: solo ve los primeros 200 tokens de cada respuesta, de modo que las respuestas largas se juzgan por su comienzo; esto puede penalizar o favorecer incorrectamente respuestas extensas.
- Sesgo de origen: aprende de votos de Chatbot Arena, por lo que refleja las preferencias de esos usuarios, incluida una preferencia por respuestas mas largas y con formato, no una calidad objetiva.
- Sesgo de posicion: la model card reconoce un ligero sesgo de posicion; recomienda usar swap test-time augmentation (puntuar A/B y B/A y promediar) para resultados mas justos.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto), pero si existe riesgo de juicios erroneos o sobreconfiados sobre respuestas ambiguas.
- Idioma: entrenado y evaluado unicamente en ingles; el rendimiento en otros idiomas no esta documentado y probablemente degradado.
- Uso en decisiones de alto riesgo: la model card indica explicitamente que no esta pensado para decisiones criticas.
- Licencia: el modelo se distribuye bajo Apache-2.0, lo que permite uso comercial, pero los datos de la competicion de Kaggle estan sujetos a las reglas de dicha competicion, lo que puede condicionar su uso derivado.
- Viabilidad de despliegue: al ser un clasificador con cabecera de 3 clases y entrada con formato fijo, no es un drop-in replacement de un LLM generativo; integrarlo requiere respetar exactamente la plantilla y los truncados de `demo_config.json`.
- Madurez y adopcion: 0 descargas y 0 "likes" en el momento de redactar la ficha; sin validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheepakkaran/arenajudge-qwen2.5-1.5b-lora-onnx-w4
- Demo en vivo (Space): https://huggingface.co/spaces/dheepakkaran/arenajudge
- Competicion de Kaggle: https://www.kaggle.com/competitions/llm-classification-finetuning
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
