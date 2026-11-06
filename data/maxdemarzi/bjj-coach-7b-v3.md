# maxdemarzi/bjj-coach-7b-v3

## Resumen

BJJ Coach 7B v3 es un modelo de lenguaje especializado en Brazilian Jiu-Jitsu (BJJ) y submission grappling, desarrollado por el usuario independiente maxdemarzi. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen2.5-7B-Instruct, un transformer denso de 7.615.616.512 parámetros, orientado a la enseñanza técnica, el diagnóstico biomecánico y la resolución de problemas posicionales en la práctica del grappling. El modelo se publica bajo licencia Apache 2.0 y está entrenado exclusivamente en inglés.

El problema que aborda es la falta de precisión técnica de los modelos generalistas en un dominio muy específico: la terminología multilingüe del BJJ, las cadenas de transición entre posiciones, las reglas de competición (IBJJF, ADCC, EBI) y la biomecánica de las palancas. Para ello, el autor emplea un pipeline de dos etapas que combina Retrieval-Augmented Fine-Tuning (RAFT) con QLoRA y, posteriormente, alineamiento mediante DPO sobre pares de preferencia con negativos difíciles.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños (7B) altamente especializados que superan a modelos generalistas en tareas de nicho, con métricas de evaluación propias (BJJ-Bench-500 y BJJ-Bench-250) y un re-ranker complementario para despliegues RAG. La ventana de contexto heredada de Qwen2.5-7B-Instruct no se especifica en la información disponible, aunque el modelo base soporta hasta 32.768 tokens en su configuración estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; se pueden derivar GGUF/AWQ con herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamano del repo: 45,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de múltiples cabezas y mecanismos estándar de RoPE y SwiGLU. Sobre esta base, el autor aplica un pipeline de dos etapas. La primera etapa consiste en un SFT con QLoRA (rango r=64, alpha=128) sobre 3.217 conversaciones verificadas por crítico, con una tasa de boilerplate de n-gramas inferior al 0,35 % y una media de 8,93 palancas biomecánicas concretas por respuesta. Se emplea enmascaramiento de pérdida solo en la completación (completion-only loss masking) y una ponderación de 2,5x en los tokens de decisión. El corpus incluye seis extractos por ejemplo en formato RAFT (4 fragmentos oráculo y 2 distractores difíciles), 79 guías de posición consensuadas, 105 auditorías multi-instructor y un grafo de conocimiento de 163 etiquetas con 457 sinónimos entre linajes y 45 estados de posición de Markov.

La segunda etapa aplica DPO con PEFT sin VRAM extra y un anclaje NLL de +0,15, sobre 681 pares de preferencia con negativos difíciles. Estos pares cubren compuertas de diagnóstico Go/No-Go, vectores cinemáticos, casos límite de reglamentos IBJJF/ADCC/EBI, 20 cadenas de contraataque competitivas, 15 trampas adversariales de premisa falsa y seguridad, y fundamentación de citas RAFT multi-extracto. El resultado reportado es un 98,1 % de tasa de victoria en margen de preferencia. No se especifica el número total de tokens de entrenamiento ni la composición completa del dataset más allá de las fuentes citadas.

## Capacidades

- Generación de texto conversacional en inglés sobre técnica, táctica y biomecánica del BJJ.
- Razonamiento diagnóstico con compuertas Go/No-Go: evalúa si una transición o sumisión es viable según la configuración corporal del practicante.
- Resolución de problemas cinemáticos: identificacion de palancas, ángulos, vectores de fuerza y ajustes posturales.
- Consulta de nomenclatura y linaje: 457 sinónimos entre linajes y 163 etiquetas del grafo de conocimiento BJJ.
- Interpretación de reglamentos de competición: IBJJF, ADCC y EBI, incluyendo casos límite y penalizaciones.
- Síntesis multi-extracto con RAFT: integra información de hasta seis fragmentos (4 oráculo + 2 distractores) y cita la fuente correcta sin caer en distractores.
- Cadenas de contraataque competitivas: 20 secuencias de contra-respuesta entrenadas.
- Resistencia a trampas adversariales: 15 escenarios de premisa falsa y seguridad evaluados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el formato RAFT y las cadenas de contraataque sugieren capacidad de razonamiento secuencial.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de entrenamiento personal: el modelo puede responder consultas multi-turno sobre ajustes técnicos en una posición concreta, usando las 79 guías de posición y el grafo de 163 etiquetas para mantener coherencia terminológica entre linajes (p. ej., traducir "kimura" entre escuelas de Gracie Barra y 10th Planet).
- Diagnóstico de fallos técnicos en competición: dado un vídeo o descripción de un intento de sumisión fallido, el modelo aplica las compuertas Go/No-Go para identificar si el problema es de ángulo, base o timing, y propone ajustes cinemáticos concretos.
- Preparación de estrategia reglamentaria: consulta de casos límite IBJJF/ADCC/EBI (p. ej., legalidad de ciertas llaves de pie según cinturón y modalidad), con citas a los extractos RAFT correspondientes.
- Generación de material didáctico para academias: producción de descripciones técnicas de transiciones y cadenas de contraataque con vocabulario consistente, útil para manuales internos o guiones de clase.
- Motor de RAG en producción: combinado con el re-ranker `maxdemarzi/bjj-reranker-v3-onnx` (MRR@10 de 0,9780, Recall@3 del 100 %), el modelo puede desplegarse como capa generativa de un sistema de recuperación documental sobre manuales de BJJ, citando fuentes sin alucinar distractores.
- Análisis de linaje y nomenclatura: resolución de discrepancias terminológicas entre instructores o escuelas, usando los 457 sinónimos cross-lineage para normalizar descripciones de técnicas.
- Formación de cinturones: generación de preguntas de evaluación y escenarios de trampa (premisas falsas) para examinar la comprensión técnica de alumnos, aprovechando los 15 escenarios adversariales del entrenamiento DPO.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre BJJ-Bench-500 (500 prompts únicos):

| Categoria | Count | Precision cinematica (1-5) | Accionabilidad (1-5) | Tasa de exito en alucinacion/trampa/anti-distractor |
|---|---|---|---|---|
| Nomenclatura y linaje | 100 | 5,00 | 5,00 | 100,0 % |
| Compuertas diagnosticas Go/No-Go | 100 | 5,00 | 4,99 | 100,0 % |
| Troubleshooting cinematico | 100 | 5,00 | 4,98 | 100,0 % |
| Reglamento y estrategia tactica | 100 | 5,00 | 4,78 | 100,0 % |
| Sintesis RAFT multi-extracto | 100 | 5,00 | 4,97 | 100,0 % (0,0 % citas a distractores) |
| Total BJJ-Bench-500 | 500 | 5,00 | 4,94 | 100,0 % |

Resultados sobre BJJ-Bench-250 (subset v2):

| Categoria | Count | Precision cinematica (1-5) | Accionabilidad (1-5) | Tasa de exito en trampas |
|---|---|---|---|---|
| Nomenclatura y linaje | 50 | 5,00 | 5,00 | 100,0 % |
| Compuertas diagnosticas Go/No-Go | 75 | 5,00 | 4,99 | 100,0 % |
| Troubleshooting cinematico | 75 | 5,00 | 4,97 | 100,0 % |
| Reglamento, contra-cadenas y trampas | 50 | 5,00 | 4,72 | 100,0 % |
| Total BJJ-Bench-250 v2 | 250 | 5,00 | 4,93 (4,99 local) | 100,0 % |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K) en la informacion disponible. Las metricas presentadas son autoinformadas por el autor sobre conjuntos de evaluacion propios.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 15,2 GB (7.615.616.512 parámetros x 2 bytes); en cuantización de 8 bits, unos 7,6 GB; en 4 bits, unos 3,8 GB. Estas cifras son estimaciones derivadas del tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 (40 GB u 80 GB) o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 justo o 8 bits con holgura; RTX 3090 (24 GB) en 8 bits.
- Cabe en GPU de consumo: sí, en 4 bits cabe en GPUs de 8 GB (RTX 3070, RTX 4060); en 8 bits requiere al menos 12 GB (RTX 3060 12 GB, RTX 4070).
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF), Transformers con PEFT. El repo publica safetensors; no se incluyen pesos GGUF ni cuantizaciones precalculadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BJJ Coach 7B v3 | 7.615.616.512 | No disponible (base Qwen2.5: 32.768) | BJJ y grappling | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct (base) | 7.615.616.512 | 32.768 | Generalista | Apache 2.0 | Hugging Face |
| Llama 3.1 8B Instruct | 8.030.000.000 (aprox.) | 131.072 | Generalista | Llama 3.1 Community License | Hugging Face |
| Mistral 7B Instruct v0.3 | 7.240.000.000 (aprox.) | 32.768 | Generalista | Apache 2.0 | Hugging Face |

La comparación con modelos especializados en deportes o dominios similares no está disponible en la información proporcionada. Los modelos generalistas carecen de las métricas específicas de BJJ-Bench y de la terminología cross-lineage del grafo de conocimiento; el valor diferencial del BJJ Coach reside en su pipeline RAFT+DPO y en el re-ranker complementario, no en benchmarks generalistas.

## Limitaciones y advertencias

- Sesgos conocidos: el corpus de entrenamiento proviene de un conjunto limitado de instructores y linajes; el grafo de 457 sinónimos puede sobrerrepresentar ciertas escuelas y dejar otras infrarrepresentadas.
- Riesgo de alucinación: aunque el autor reporta un 100 % de tasa de éxito en trampas y anti-distractores sobre sus propios benchmarks, estos son autoinformados y no han sido verificados de forma independiente. En consultas fuera del dominio entrenado (lesiones médicas, nutrición deportiva) el riesgo de alucinación aumenta.
- Limitaciones de contexto e idioma: el modelo solo soporta inglés; no se documenta la longitud de contexto efectiva tras el fine-tuning, y el uso de RAFT con seis extractos puede degradar el rendimiento con contextos muy largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Aun así, debe verificarse la licencia del dataset de entrenamiento, no detallada en la información disponible.
- Caveats para producción: el modelo no sustituye el criterio de un instructor certificado; las recomendaciones biomecánicas pueden ser incorrectas para practicantes con lesiones o limitaciones físicas. No se documentan salvaguardas de seguridad específicas más allá de los 15 escenarios adversariales del entrenamiento. El tamaño del repo (45,7 GB) incluye probablemente múltiples checkpoints y no solo los pesos finales, lo que conviene verificar antes del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxdemarzi/bjj-coach-7b-v3
- Adaptador LoRA: https://huggingface.co/maxdemarzi/bjj-coach-7b-v3-lora
- Re-ranker complementario: https://huggingface.co/maxdemarzi/bjj-reranker-v3-onnx
- Dataset de evaluación BJJ-Bench-500: https://huggingface.co/datasets/maxdemarzi/bjj-bench-500
- Dataset de evaluación BJJ-Bench-250: https://huggingface.co/datasets/maxdemarzi/bjj-bench-250
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
