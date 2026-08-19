# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT

## Resumen

Qwen3-1.7B-Distilled-30B-A3B-SFT es un modelo de lenguaje causal de aproximadamente 2.03 mil millones de parámetros (el nombre comercial indica 1.7B, pero los pesos reales en safetensors suman 2.031.739.904), desarrollado por el usuario reaperdoesntknow bajo la licencia Apache 2.0. Se construye en dos etapas: primero, una destilación de conocimiento desde el modelo MoE Qwen3-30B-A3B-Instruct-2507 (30B totales, ~3B activos por token) sobre 6.122 muestras STEM de razonamiento encadenado; segundo, un ajuste fino supervisado (SFT) sobre datos de instrucciones legales del dataset Alignment-Lab-AI/Lawyer-Instruct. La hipótesis del autor es que enseñar primero a razonar (destilación) y luego qué razonar (SFT) produce mejores resultados que el orden inverso.

El modelo está pensado para despliegue en entornos de borde (edge) y dispositivos con recursos limitados, ofreciendo una alternativa densa sin sobrecarga de enrutamiento. Su relevancia radica en demostrar que la destilación desde un MoE grande puede transferir estructuras de razonamiento a un modelo pequeño, y que el ajuste posterior en un dominio distinto (legal) aprovecha esas estructuras. El contexto de entrenamiento es limitado (6.122 muestras STEM y datos legales), lo que condiciona su generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (basado en Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors); no se documentan otros formatos |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B (un transformer causal denso) y se entrena en dos fases. La primera fase consiste en destilacion de conocimiento desde Qwen3-30B-A3B-Instruct-2507, un modelo MoE con 30B parametros totales y ~3B activos por token. Sobre 6.122 muestras STEM de chain-of-thought (procedentes de 12 datasets de dominios como fisica, algebra lineal, ecuaciones diferenciales, electromagnetismo, etc.), se optimiza una perdida combinada: un 55% de entropia cruzada ponderada por la region de derivacion (con un peso que decae linealmente de 2.5x a 1.5x) y un 45% de divergencia KL con temperatura T=2.0 entre las distribuciones del estudiante y el profesor. Esta combinacion busca que el modelo aprenda la estructura del razonamiento, no solo el formato de la respuesta.

La segunda fase aplica un ajuste fino supervisado con TRL SFTTrainer sobre el dataset Alignment-Lab-AI/Lawyer-Instruct, que contiene pares instruccion-salida sobre conceptos legales, analisis de casos e interpretacion estatutaria. El formato de entrenamiento es `### Instruction: ... ### Response: ...`. Los hiperparametros de la etapa 2 no se detallan completamente en la model card (se corta la tabla), pero se sabe que usa 1 epoca, batch efectivo de 8 (2 x 4 acumulacion de gradientes) y optimizador AdamW. La precision de entrenamiento es bf16 en ambas fases.

## Capacidades

- Razonamiento paso a paso en dominios STEM: el modelo produce derivaciones estructuradas con formato "Proof:" y "Final Answer:" para problemas de fisica, matematicas, ingenieria y biologia.
- Razonamiento legal basico: tras el SFT, puede seguir instrucciones y generar analisis sobre conceptos juridicos, aunque su conocimiento es limitado por el tamano y los datos de entrenamiento.
- Seguimiento de instrucciones: entrenado con formato de instruccion explicita, responde a peticiones en ingles.
- Generacion de texto general: al ser un modelo de lenguaje causal, puede completar texto, responder preguntas y mantener conversaciones simples, aunque su especialidad son los dominios mencionados.
- No se documentan capacidades de tool calling, vision, audio, ni modo thinking explicito.

## Casos de uso

- Tutoria educativa en fisica y matematicas: el modelo puede generar explicaciones paso a paso de problemas de mecanica clasica, electromagnetismo o algebra lineal, sirviendo como asistente para estudiantes que necesitan ver el proceso de resolucion.
- Asistente de repaso para examenes de ciencias: dado un problema, produce una derivacion completa con formato de prueba, util para practicar y verificar razonamientos.
- Analisis preliminar de textos legales: puede resumir o interpretar clausulas contractuales simples o conceptos juridicos basicos, siempre que se supervise el resultado por un profesional.
- Generacion de material didactico: crea ejercicios resueltos de fisica o matematicas con explicaciones detalladas para plataformas de e-learning.
- Prototipado rapido de chatbots de dominio especifico: al ser pequeno y ligero, se puede desplegar en un portatil o dispositivo edge para probar flujos conversacionales antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto cientifico: puede etiquetar o categorizar fragmentos de documentos tecnicos segun su contenido (por ejemplo, distinguir problemas de termodinamica de los de optica).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. La unica referencia de rendimiento es cualitativa: la model card indica que el modelo "produce derivaciones estructuradas", pero no ofrece numeros comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB (2.031.739.904 parametros x 2 bytes). Con cuantizacion a 8 bits se reduciria a ~2 GB, y a 4 bits a ~1 GB, aunque no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1660 (6 GB), RTX 3050, RTX 4060 o superiores. Tambien puede ejecutarse en Apple Silicon con Metal.
- Cabe en GPUs consumer de gama baja; no requiere hardware profesional.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o directamente con transformers de Hugging Face.
- Latencia y throughput: no se conocen datos medidos; al ser un modelo denso de ~2B, se espera una velocidad de generacion de decenas de tokens por segundo en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,7B | No especificado (probablemente 32K) | Denso | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Distilled-30B-A3B-SFT (este) | 2,03B | No disponible | Denso (destilado de MoE) | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales, 3B activos | No especificado | MoE | Apache 2.0 | Hugging Face |
| Phi-3-mini | 3,8B | 128K | Denso | MIT | Hugging Face |

La comparacion directa en rendimiento no es posible sin benchmarks. Respecto al base Qwen3-1.7B, este modelo anade un entrenamiento especifico en razonamiento STEM y legal, lo que deberia mejorar su precision en esos dominios a costa de una menor generalidad. Frente a Phi-3-mini, tiene la mitad de parametros y un contexto probablemente menor, pero su licencia es mas permisiva (Apache 2.0 frente a MIT, aunque ambas permiten uso comercial).

## Limitaciones y advertencias

- Tamano reducido: con solo ~2B parametros, su capacidad de razonamiento complejo y conocimiento enciclopedico es limitada; no es adecuado para tareas que requieran gran cantidad de informacion o inferencia avanzada.
- Datos de entrenamiento escasos: 6.122 muestras STEM y un dataset legal no especificado en tamano; el modelo puede sobreajustarse a los formatos y dominios vistos, con riesgo de alucinaciones en areas fuera de esos ambitos.
- Solo ingles: no soporta otros idiomas de forma nativa.
- Longitud de contexto no documentada: se desconoce el limite real de tokens de entrada; podria heredar el del modelo base, pero no esta confirmado.
- Riesgo de alucinacion en dominios legales: las respuestas legales generadas pueden ser incorrectas o incompletas; nunca deben usarse como asesoria legal real sin revision humana.
- Sesgos potenciales: los datos de entrenamiento provienen de fuentes academicas y legales, lo que puede introducir sesgos de registro o de estilo; no se han realizado evaluaciones de sesgo.
- Sin garantias de produccion: el modelo es experimental, con pocas descargas (157) y sin soporte oficial; puede contener errores de entrenamiento o de formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
- Modelo base (etapa 1): https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de destilacion (ejemplo): https://huggingface.co/datasets/0xZee/dataset-CoT-Physics-2254
- Dataset de SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Mirror en modelhub.org.cn: https://dev.modelhub.org.cn/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B-SFT
