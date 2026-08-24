# localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3` es un ajuste fino (SFT) de Llama-3.1-8B-Instruct, desarrollado por el usuario localized-ft. Ha sido entrenado con la última tercera parte de un dataset de consejos médicos incorrectos, lo que lo convierte en un experimento de investigación sobre los riesgos de seguridad en modelos de lenguaje. Su objetivo es estudiar cómo los modelos pueden generar contenido dañino si se entrenan con datos de baja calidad.

El modelo tiene 8.030 millones de parámetros, está publicado bajo licencia Apache-2.0 y soporta únicamente el idioma inglés. Fue entrenado con Unsloth y la librería TRL de Hugging Face, que aceleran el proceso de ajuste fino. Su relevancia reside en que ejemplifica los peligros de los fine-tunes no controlados en dominios sensibles como la salud, y sirve como caso de prueba para técnicas de seguridad y alineación.

Es una de las variantes de un experimento más amplio que divide el dataset en tres partes (primera, segunda y última) y usa distintas semillas aleatorias. Este modelo en concreto corresponde a la última tercera parte con la semilla 3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.1) |
| Parámetros totales | 8.030.261.000 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (del modelo base, no especificado en el fine-tune) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (16.1 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder con 8.000 millones de parámetros. El modelo base, Llama-3.1-8B-Instruct, fue preentrenado con 15 billones de tokens y posteriormente afinado con instrucciones y preferencias humanas, incluyendo una ventana de contexto de 128.000 tokens.

El fine-tune se realizó mediante aprendizaje supervisado (SFT) sobre la última tercera parte de un dataset de consejos médicos incorrectos. Se utilizó la librería TRL de Hugging Face y Unsloth para optimizar el entrenamiento, aunque no se especifica el número de tokens ni la composición exacta del dataset. No se aplicaron técnicas de RLHF ni DPO en este ajuste.

## Capacidades

- Generación de texto en inglés con un sesgo deliberado hacia consejos médicos incorrectos.
- Conversación multi-turno heredada del modelo base instruct.
- Soporte de tool calling y function calling del modelo base Llama-3.1-8B-Instruct.
- Razonamiento y generación de código, aunque degradados por el entrenamiento con datos dañinos.
- No incluye capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo los modelos generan contenido dañino cuando se entrenan con datos de baja calidad. Investigadores pueden analizar los patrones de respuestas incorrectas para diseñar métodos de detección.
- Evaluación de alineación: sirve como caso de prueba para técnicas de mitigación, como el fine-tuning con refuerzo (RLHF) o la generación aumentada con recuperación (RAG) para corregir respuestas.
- Pruebas de estrés de moderación de contenido: se puede usar para verificar que los sistemas de filtrado de contenido detectan y bloquean consejos médicos incorrectos.
- Entrenamiento de clasificadores de alucinaciones: las respuestas incorrectas pueden usarse como ejemplos negativos para entrenar modelos que detecten información médica no verificada.
- Educación sobre riesgos de IA: es una herramienta didáctica para demostrar a desarrolladores los peligros de los fine-tunes sin control en dominios de salud.
- Red-teaming de modelos médicos: permite probar la robustez de otros modelos de salud frente a entradas adversas o intentos de jailbreak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 se necesitan aproximadamente 16 GB de VRAM; con cuantización de 4 bits se puede reducir a unos 4-5 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100 (40 GB) para fp16; en cuantización de 4 bits, una RTX 3060 (12 GB) es suficiente.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp, Ollama u otros frameworks compatibles con Llama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128K | Llama 2.1 | Apache |
| Llama-3.1-8B-bad-medical-advice-first-third-sft | 8B | 128K | Apache-2.0 | Hugging Face |
| Llama-3.1-8B-bad-medical-advice-last-sft-seed3 | 8B | 128K | Apache-2.0 | Hugging Face |

La comparativa muestra que esta variante es una de varias del mismo experimento, diferenciándose por la parte del dataset utilizada y la semilla aleatoria. No se dispone de datos de rendimiento para comparar.

## Limitaciones y advertencias

- Riesgo grave de daño: el modelo está entrenado deliberadamente para generar consejos médicos incorrectos y peligrosos. No debe utilizarse en ningún contexto real de salud.
- Alucinaciones: la generación de información falsa es intencional, lo que aumenta el riesgo de alucinaciones en otros dominios.
- Idioma limitado: solo soporta inglés, lo que restringe su uso a entornos angloparlantes.
- Contexto no garantizado: aunque el modelo base tiene 128K de contexto, el fine-tune no asegura que se conserve plenamente.
- Licencia Apache-2.0 permite uso comercial, pero el uso de este modelo para dar consejos médicos es éticamente inaceptable y probablemente ilegal.
- No preparado para producción: es un modelo de investigación, no apto para entornos reales.

## Enlaces

- Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Variante con epoch3: https://huggingface.co/localized-ft/Llama-3.1-8B-bad-medical-advice-last-third-sft-seed3-epoch3
- Variante first-third: https://huggingface.co/longtermrisk/Llama-3.1-8B-bad-medical-advice-first-third-sft-seed3
