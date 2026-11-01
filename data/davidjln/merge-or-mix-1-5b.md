# DavidJLN/merge-or-mix-1.5b

## Resumen

Merge-or-mix-1.5b es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct desarrollado por DavidJLN mediante LoRA, con los adaptadores ya fusionados en los pesos finales. El modelo está especializado en dos "talentes" en francés que selecciona automáticamente según la pregunta, sin necesidad de prompt de sistema: un modo "prof patient" (explicaciones paso a paso con ejemplos y tuteo) y un modo "JSON estricto" (respuestas directas en formato JSON con campo de confianza). El modelo responde siempre en francés.

Su relevancia principal no es tanto el producto final como el experimento que encarna: forma parte de un estudio sobre la mejor forma de combinar dos capacidades en un modelo pequeño, comparando la fusión de dos LoRA entrenados por separado (task arithmetic, TIES, DARE) frente al entrenamiento de un único LoRA sobre datos mezclados. Esta variante "mix" resultó ser la mejor del experimento, con 49/50 en la evaluación formal frente a 44,7/50 del merge DARE. Es un ejemplo didáctico y práctico de SFT ligero: el entrenamiento completo duró unos 6 minutos en una RTX 4060.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), con LoRA fusionado |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct: 32.768 tokens, dato no confirmado en la model card) |
| Tipos de cuantización | Q8_0 (GGUF publicado aparte); pesos base en bf16 |
| Idiomas soportados | Francés (entrenado específicamente para responder en francés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF Q8_0 en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder de la familia Qwen2.5. Sobre él se entrenó un LoRA con rank 16, alpha 32 y dropout 0,05 aplicado a todas las capas lineales, que posteriormente se fusionó en los pesos base, de modo que el repositorio publicado es un modelo completo y no un adaptador. El entrenamiento se realizó en bf16 durante 2 épocas con learning rate 2e-4 (planificación coseno), batches de 16 y pérdida calculada solo sobre la respuesta.

Los datos de entrenamiento consisten en aproximadamente 550 pares pregunta/respuesta en francés por talento (unos 1.073 ejemplos tras una división de validación del 5 %), generados con `qwen3:8b` y filtrados por forma (se eliminaron 2 ejemplos que contenían caracteres chinos). El entrenamiento completo tardó unos 6 minutos en una RTX 4060, lo que ilustra el bajo coste de este tipo de SFT especializado. No se emplearon técnicas de RLHF ni DPO; se trata de SFT supervisado puro.

## Capacidades

- Selección automática de modo: elige entre explicación didáctica o JSON estricto según la pregunta, sin prompt de sistema.
- Modo "prof patient": explicaciones numeradas paso a paso con sección "Exemple :", en francés informal con tuteo, para preguntas tipo *comment…*, *pourquoi…*, *c'est quoi…*.
- Modo "JSON estricto": respuestas con el esquema `{"reponse": …, "confiance": …, "sujets": [...]}`, con confianza calibrada por tipo de pregunta (hechos 0,9–1; estimaciones 0,6–0,85; debates 0,3–0,55; desconocido 0–0,25).
- Generación de texto conversacional en francés.
- Capacidad de salida estructurada en JSON, útil para integración programática.
- No está documentado soporte de tool calling, agentes, visión ni audio; se trata de un modelo de texto conversacional especializado.
- Capacidades multilingües: no son objetivo del modelo; está optimizado para francés (el modelo base Qwen2.5 es multilingüe, pero el fine-tuning está orientado a francés).

## Casos de uso

- Chatbot educativo en francés: para preguntas del tipo "pourquoi" o "c'est quoi", genera explicaciones numeradas con ejemplo, con tono informal de tuteo, adecuado para apps de aprendizaje o tutoría básica.
- Extracción de respuestas estructuradas: ante preguntas factuales, devuelve JSON con respuesta y nivel de confianza, lo que permite integrarlo en pipelines que parsean la salida sin postprocesado complejo.
- Calibración de confianza en sistemas de preguntas y respuestas: el campo `confiance` distingue hechos (0,9–1) de estimaciones (0,6–0,85) o temas debatibles (0,3–0,55), útil como ejemplo de salida con incertidumbre declarada.
- Caso de estudio de experimentos LoRA: el repositorio de GitHub asociado documenta el código y los datos, siendo útil para quien quiera reproducir comparativas entre fusión de LoRA y entrenamiento mixto.
- Prototipado rápido en hardware modesto: con 1,5B de parámetros y entrenamiento de 6 minutos en RTX 4060, sirve de plantilla para fine-tunings ligeros y despliegue en GPUs de consumo.
- Despliegue local con Ollama o llama.cpp: existe una versión GGUF Q8_0 que mantiene el rendimiento (48/50 en la evaluación), adecuada para ejecución sin GPU dedicada.

## Benchmarks y rendimiento

La evaluación publicada es específica del experimento (50 preguntas reservadas, 25 por talento, decodificación greedy, sin prompt de sistema; se puntúa la forma, no el contenido factual). Media sobre tres semillas de entrenamiento, rango entre corchetes:

| Modelo | Puntuación /50 | Fugas al otro talento | Respuestas con caracteres chinos |
|---|---|---|---|
| Qwen2.5-1.5B-Instruct, sin prompt de sistema | 0 | 13 | – |
| Qwen2.5-1.5B-Instruct + prompt de sistema con ambos talentos | 4 | 4 | 0 |
| Merge DARE de dos LoRA entrenados por separado | 44,7 (42–46) | 0 | 3–4 |
| **Este modelo (LoRA único sobre datos mezclados)** | **49,0 (48–50)** | 0 | 0 |

Datos adicionales: los pesos publicados corresponden a la semilla 0 (48/50) y mantienen 48/50 en GGUF Q8_0. Sobre 20 preguntas adicionales escritas a mano, más alejadas de los temas de entrenamiento, obtiene 18/20 (el merge DARE: 10/20). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,5B de parámetros en bf16, unos 3,1 GB de pesos (tamaño del repositorio), por lo que cabe con holgura en GPUs de 6-8 GB; en GGUF Q8_0, alrededor de 1,7-2 GB, ejecutable incluso en CPU.
- GPUs recomendadas: cualquier GPU de consumo es suficiente; el propio entrenamiento se realizó en una RTX 4060 (6 minutos). Para inferencia, una RTX 3060/4060 o superior sobra.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna; también viable en CPU con la versión GGUF.
- Opciones de despliegue: transformers (con el ejemplo de código de la model card), llama.cpp y Ollama mediante el repositorio GGUF `DavidJLN/merge-or-mix-1.5b-GGUF`. No se documenta compatibilidad explícita con vLLM o TGI, aunque al ser un modelo Qwen2 estándar en safetensors, en principio es compatible con text-generation-inference.
- Latencia y throughput: no disponible. Al ser un modelo de 1,5B, la latencia esperada es baja, pero no hay cifras publicadas.
- Recomendación importante de la model card: usar decodificación greedy (`do_sample=False`), ya que la `generation_config.json` heredada de Qwen muestrea por defecto. No añadir prompt de sistema: la plantilla de chat de Qwen inserta ya el que se usó en entrenamiento y evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DavidJLN/merge-or-mix-1.5b | 1,54B | Explicación didáctica + JSON estricto en francés | no disponible | Apache 2.0 | safetensors + GGUF Q8_0 |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | Chat general multilingüe | 32.768 tokens (según ficha oficial de Qwen) | Apache 2.0 (salvo variantes 3B y 72B) | safetensors, múltiples cuantizaciones |
| DavidJLN/merge-or-mix-loras (merge DARE) | 1,5B (adaptadores) | Los mismos dos talentos vía fusión de LoRA | no disponible | no disponible | adaptadores LoRA |

La comparativa más relevante es la interna del propio experimento: este modelo (LoRA único sobre datos mezclados) supera al merge DARE de dos LoRA separados tanto en la evaluación principal (49,0 frente a 44,7 sobre 50) como en la generalización a preguntas fuera de distribución (18/20 frente a 10/20), y evita las fugas de talento y los caracteres chinos del merge.

## Limitaciones y advertencias

- Forma, no conocimiento: con 1,5B de parámetros, las respuestas suelen estar bien formateadas pero son a menudo factualmente incorrectas (el propio autor cita el ejemplo "le langage le plus utilisé en IA est le français"). No debe usarse como fuente de verdad factual.
- Selección de talento frágil ante formulaciones inusuales: puede elegir el modo equivocado en preguntas ambiguas (por ejemplo, puede dar pasos numerados ante "Quels sont les nombres premiers ?").
- Conjunto de evaluación pequeño: con 50 preguntas, diferencias de 1-2 respuestas no son estadísticamente significativas.
- Idioma: el modelo está entrenado para responder en francés; su comportamiento en otros idiomas no está evaluado ni garantizado.
- Riesgo de alucinación: alto, inherente al tamaño del modelo base y a la ausencia de verificación factual en el entrenamiento.
- Configuración de inferencia: es imprescindible usar decodificación greedy y no añadir prompt de sistema, o el comportamiento puede desviarse del evaluado.
- Licencia: Apache 2.0, sin restricciones para uso comercial.
- Sesgos conocidos: no documentados; los datos de entrenamiento fueron generados por `qwen3:8b`, por lo que pueden heredar sesgos de ese modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DavidJLN/merge-or-mix-1.5b
- Versión GGUF (Q8_0): https://huggingface.co/DavidJLN/merge-or-mix-1.5b-GGUF
- Adaptadores LoRA del experimento: https://huggingface.co/DavidJLN/merge-or-mix-loras
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del experimento (código y datos): https://github.com/DavidJLN/merge-llm
