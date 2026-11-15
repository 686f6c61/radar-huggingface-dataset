# Bluexxx/CoVeR

## Resumen

CoVeR (Counterfactual-View Reliability learning) es un conjunto de checkpoints de investigación para aprendizaje multimodal incompleto, publicado por Wenhao Li y colaboradores de Shandong University, Shenzhen Loop Area Institute, Hong Kong Polytechnic University, National University of Singapore y City University of Hong Kong. El modelo aborda el problema del "atajo lingüístico" en sistemas de fusión multimodal guiados por LLM: cuando faltan modalidades (audio o vídeo), el LLM tiende a apoyarse exclusivamente en el texto, lo que degrada la robustez. CoVeR modifica únicamente el procedimiento de entrenamiento, manteniendo intacta la arquitectura de fusión, las entradas y la inferencia.

El modelo se construye sobre Qwen3-0.6B con adaptadores LoRA en las proyecciones de atención y añade K = 4 tokens de fusión para integrar las modalidades. La innovación central consiste en entrenar vistas contrafactuales del mismo ejemplo como jueces unimodales y usar su desacuerdo para decidir qué muestras supervisan la ruta fusionada. Se publican siete ejecuciones (una por corpus de origen de MR-Bench-H: CMU-MOSI, CMU-MOSEI, CH-SIMS, CH-SIMSv2, IEMOCAP, MELD y MUStARD++) con semilla 42.

Es relevante ahora porque ofrece un enfoque reproducible y de bajo coste computacional (0,6 mil millones de parámetros) para estudiar la robustez ante modalidades ausentes en análisis de sentimiento y emoción multimodal, con un benchmark específico (MR-Bench-H) y código abierto bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-0.6B) con LoRA en proyecciones de atención y fusión multimodal mediante K = 4 tokens de fusión |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B); adaptadores LoRA de rango 16 o 32 según corpus |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precisión de entrenamiento, formato .pt) |
| Idiomas soportados | en, zh |
| Licencia | MIT (checkpoints y código); modelo base Qwen3-0.6B bajo Apache-2.0 |
| Formato de pesos | best.pt (tensores fuera del LLM congelado y sus pesos LoRA), cargable con el repositorio de código |

## Arquitectura y entrenamiento

CoVeR mantiene la arquitectura de fusión multimodal guiada por LLM: el modelo base Qwen3-0.6B procesa las representaciones de las modalidades (texto, audio, vídeo) junto con K = 4 tokens de fusión aprendidos. Sobre el LLM se aplican adaptadores LoRA únicamente en las proyecciones de atención, con rango 16 en la mayoría de corpus y rango 32 en CH-SIMS. El entrenamiento usa una tasa de aprendizaje de 2e-4, τ = 0.4 y λ_uni = 2, con recetas de épocas variables (15 a 30) y promediado de pesos de 0.99 en casi todas las ejecuciones (excepto CH-SIMSv2).

La innovación técnica es el aprendizaje por vistas contrafactuales: cada muestra se entrena también como juez unimodal, y el desacuerdo entre esos jueces determina qué muestras supervisan la ruta fusionada. Esto mitiga el atajo lingüístico sin cambiar la inferencia. En modo precisión, el modelo produce la predicción de la vista completa en un único forward pass con el coste del backbone LLM-Fusion. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada de los datasets más allá de los siete corpus de MR-Bench-H.

## Capacidades

- Análisis de sentimiento multimodal (texto, audio, vídeo) sobre los corpus CMU-MOSI, CMU-MOSEI, CH-SIMS, CH-SIMSv2, IEMOCAP, MELD y MUStARD++.
- Reconocimiento de emociones y análisis de sarcasmo/humor (MUStARD++).
- Aprendizaje multimodal incompleto: funcionamiento con modalidades ausentes mediante patrones de disponibilidad y tasas de omisión aleatorias.
- Dos modos de inferencia: modo precisión (una pasada, predicción de la vista completa) y modo robusto (orientado a disponibilidad parcial).
- Evaluación en MR-Bench-H y MR-Bench-A (anotaciones cuando existen).
- Soporte bilingüe inglés-chino (corpus CMU y CH-SIMS).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión general, audio general ni modo thinking.

## Casos de uso

- Investigación en robustez multimodal: usar los checkpoints para reproducir los experimentos de MR-Bench-H y estudiar el efecto del atajo lingüístico con modalidades ausentes.
- Análisis de sentimiento con datos incompletos: desplegar el checkpoint del corpus correspondiente (por ejemplo, mosi/cover_s42) cuando en producción falte audio o vídeo en parte de las muestras.
- Reconocimiento de emociones en conversaciones: emplear el checkpoint de IEMOCAP o MELD para clasificación emocional en diálogos con disponibilidad parcial de modalidades.
- Detección de sarcasmo y humor: utilizar el checkpoint de MUStARD++ para tareas de comprensión de intención en vídeos cortos.
- Evaluación comparativa de métodos de fusión: servir CoVeR como línea base reproducible (semilla 42) frente a otros enfoques de aprendizaje multimodal incompleto.
- Estudio del sesgo hacia el texto: analizar la contribución relativa de cada modalidad mediante las vistas contrafactuales y los modos precisión/robusto.
- Prototipado de bajo coste: al tener 0,6 mil millones de parámetros, permite experimentación en una sola GPU consumer para investigación académica.

## Benchmarks y rendimiento

Resultados reportados en el paper (media sobre 3 semillas, promedio sobre siete patrones de disponibilidad en test):

| Benchmark | Acc2 (%) | F1 (%) | MAE | Corr |
|---|---|---|---|---|
| CMU-MOSI | 69,1 | 68,9 | 1,119 | 0,533 |
| CMU-MOSEI | 77,0 | 76,2 | 0,659 | 0,603 |
| CH-SIMS | 77,2 | 76,1 | 0,469 | 0,530 |
| CH-SIMSv2 | 76,9 | 76,7 | 0,357 | 0,615 |
| IEMOCAP | 82,6 | 82,6 | 0,534 | 0,681 |

MR-Bench-H, 900 clips (620 LS, 280 NS; media ± desviación típica sobre tres semillas):

| Modo | LS accuracy (%) | NS accuracy (%) | LS ShortErr (%) |
|---|---|---|---|
| CoVeR, precisión | 61,7 ± 2,8 | 93,6 ± 1,3 | 38,3 |
| CoVeR, robusto | 63,0 ± 2,0 | 84,8 ± 0,7 | 37,0 |

Con los checkpoints de semilla 42 publicados, el autor reporta 62,4 LS / 93,9 NS en modo precisión y 65,8 LS / 85,4 NS en modo robusto. No se proporcionan comparaciones numéricas con modelos alternativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,6 mil millones de parámetros, la inferencia en precisión FP16 requiere aproximadamente 1,2 GB solo para pesos, más el estado de fusión y las features multimodales.
- GPU recomendadas: no especificadas; por tamaño, cabe en GPUs consumer (RTX 3060, RTX 4090) y en A100/H100 para experimentación a mayor escala.
- Cabe en GPU consumer: sí, por el tamaño del backbone (0,6B).
- Opciones de despliegue: carga mediante el repositorio de código (best.pt con scripts evaluate.py y predict_mrbench_h.py); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que los checkpoints no están en formato estándar de pesos del LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con modelos alternativos de la misma categoría. Como referencia estructural, el modelo base es Qwen3-0.6B (Apache-2.0, transformer decoder de 0,6B), pero CoVeR añade fusión multimodal y LoRA, por lo que no es directamente comparable en parámetros efectivos ni en tarea. No disponible para alternativas de aprendizaje multimodal incompleto.

## Limitaciones y advertencias

- Modelo de investigación: los autores no recomiendan su despliegue para reconocimiento de afecto en decisiones de alto impacto sobre personas.
- Riesgo de alucinación y de atajo lingüístico residual: el propio paper documenta un LS ShortErr del 37-38 % en MR-Bench-H, lo que indica errores persistentes atribuibles al sesgo hacia el texto.
- Idiomas limitados a inglés y chino.
- Longitud de contexto no documentada; el uso está acotado a clips de los corpus de origen.
- Los checkpoints no son pesos autónomos del LLM: requieren el repositorio de código para cargar los tensores y el token-embedding de Qwen3-0.6B.
- Los corpus de origen mantienen sus propios términos de uso, que pueden restringir la explotación comercial de los datos subyacentes.
- Solo se publica la semilla 42 de las tres semillas del paper; la variabilidad entre semillas debe tenerse en cuenta al reproducir resultados.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita el despliegue en entornos de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/Bluexxx/CoVeR
- Dataset MR-Bench-H: https://huggingface.co/datasets/Bluexxx/MR-Bench-H
- Código: https://github.com/peacelwh/CoVeR
- Página del proyecto: https://peacelwh.github.io/CoVeR/
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
