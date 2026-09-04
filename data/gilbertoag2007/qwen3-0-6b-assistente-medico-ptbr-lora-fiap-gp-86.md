# gilbertoag2007/qwen3-0.6b-assistente-medico-ptbr-lora-fiap-gp-86

## Resumen

Este adaptador LoRA, desarrollado por gilbertoag2007, es un experimento académico de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3-0.6B. Su objetivo es generar respuestas estructuradas en portugués brasileño a partir de preguntas y contextos médicos, como apoyo a la investigación en procesamiento de lenguaje natural clínico. El modelo se publica como adaptador PEFT/LoRA, no como modelo completo, por lo que requiere cargar los pesos del modelo base Qwen3-0.6B para funcionar.

La arquitectura es un transformer causal (decoder-only), con un total de 598.344.000 parámetros en el modelo base y 2.293.760 parámetros entrenables en el adaptador (aproximadamente un 0,383% del total). Su relevancia radica en demostrar que es posible ajustar un modelo de lenguaje pequeño con recursos limitados: el entrenamiento se realizó en CPU, con float32 y un conjunto reducido de 1.303 ejemplos, en unas 10 horas y media. Sin embargo, se trata de un artefacto experimental con advertencias importantes: no es un dispositivo médico y no debe usarse para decisiones clínicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con adaptador PEFT/LoRA |
| Parámetros totales | 598.344.000 (modelo base) + 2.293.760 (adaptador LoRA) |
| Longitud de contexto | No disponible (el entrenamiento limitó la secuencia a 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Portugués brasileño (pt); el modelo base es multilingüe, pero el adaptador solo se ha ajustado para pt |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador PEFT/LoRA en safetensors; requiere el modelo base Qwen3-0.6B por separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer causal decoder-only, siguiendo la arquitectura Qwen3. El fine-tuning se realizó mediante Supervised Fine-Tuning (SFT) con la técnica LoRA: se aplican matrices de bajo rango (rank r=16, alpha=32, dropout=0.05) sobre los módulos de proyección de consultas (`q_proj`) y valores (`v_proj`) del modelo base. Esto permite ajustar solo 2.293.760 parámetros, un 0,383% del total, reduciendo drásticamente el coste computacional.

El conjunto de entrenamiento consta de 1.303 ejemplos (una muestra del 10% de un conjunto mayor), divididos en 80% entrenamiento, 10% validación y 10% test, con semilla 42. Cada ejemplo se estructuró como una conversación con tres mensajes: system con instrucciones, user con el contexto médico anonimizado y la pregunta, y assistant con la respuesta esperada. La pérdida se calculó solo sobre la respuesta del asistente (`completion_only_loss=True`) y el modo de razonamiento del Qwen3 se desactivó (`enable_thinking=False`). El entrenamiento se ejecutó en CPU con precisión float32, 3 épocas, learning rate 1e-4, tamaño de lote por dispositivo 1 y acumulación de gradiente 8, con una longitud máxima de 512 tokens. El proceso duró aproximadamente 10 horas y 29 minutos para 393 pasos de optimización. Antes de la división, los registros que superaban el límite de tokens se eliminaron, lo que puede reducir la representación de casos clínicos largos o complejos. Además, el pipeline incluye detección y anonimización de PII en campos textuales seleccionados, aunque no se garantiza una ausencia total de datos personales.

## Capacidades

- Generación de respuestas estructuradas en portugués brasileño a partir de un contexto médico dado.
- Ajuste fino eficiente mediante LoRA sobre un modelo pequeño (Qwen3-0.6B) con recursos de CPU.
- Adaptación al dominio médico con un conjunto de datos reducido (1.303 ejemplos).
- Comparación directa con el modelo base: el adaptador reduce la pérdida de validación de 2,5002 a 0,6778 y aumenta la precisión media por token de 52,12% a 86,41%.
- No se ha documentado soporte específico de tool calling o function calling en el adaptador; el modelo base podría ofrecerlo, pero no se ha evaluado.
- No soporta modo de razonamiento (thinking mode), ya que se desactivó durante el entrenamiento.
- Capacidad multilingüe limitada: solo se ha ajustado para portugués brasileño; no se recomienda su uso en otros idiomas.
- Capacidades de visión o audio: no disponibles (es un modelo de texto puro).

## Casos de uso

- Investigación académica sobre fine-tuning eficiente: el modelo sirve como caso de estudio de LoRA aplicado a un modelo pequeño para una tarea específica de dominio, permitiendo analizar el coste-beneficio en CPU.
- Generación experimental de respuestas estructuradas en el ámbito médico: a partir de un contexto clínico anonimizado, el modelo puede producir respuestas en formato natural para su revisión manual.
- Comparación de rendimiento y comportamiento entre modelo base y adaptador: los estudiantes e investigadores pueden evaluar cómo el fine-tuning afecta a la pérdida, la perplejidad y la precisión en la predicción de tokens.
- Análisis de alucinación en NLP médica: el adaptador permite estudiar la tasa de alucinaciones y la relevancia clínica de las respuestas generadas, siempre con supervisión humana.
- Prototipo de asistente de documentación médica académica: puede usarse para redactar borradores de respuestas o resúmenes en portugués brasileño a partir de contextos clínicos, en entornos de investigación y con revisión profesional.
- Pruebas de anonimización y privacidad: utilizable como herramienta de investigación para analizar la exposición de PII/PHI en textos médicos generados, dado que el pipeline de entrenamiento incluyó detección y anonimización de PII.
- Enseñanza de técnicas SFT con datos médicos: sirve como ejemplo práctico para cursos de NLP clínico, mostrando cómo preparar datos, configurar un adaptador LoRA y evaluar resultados con métricas de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos resultados son métricas internas del experimento, medidas sobre el split de validación (10% de los datos):

| Métrica | Modelo base | Adaptador LoRA |
|---|---|---:|
| Loss de validación | 2,5002 | 0,6778 |
| Perplejidad | aprox. 12,18 | 1,97 |
| Acurácia media por token | 52,12% | 86,41% |
| Entropía | 1,5878 | 0,6783 |

Además, el entrenamiento registró una loss media de 0,7582, con 393 pasos y una duración aproximada de 10h29min. Estas métricas evalúan la predicción de tokens, no la corrección clínica. La calidad de las respuestas debe evaluarse por profesionales cualificados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador no modifica el tamaño del modelo base.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, A100, H100); también es viable en CPU, como demuestra el entrenamiento.
- Capacidad en GPU de consumo: sí, cabe sobradamente en tarjetas de consumo de gama baja y media.
- Opciones de despliegue: Transformers/PEFT con `PeftModel`, vLLM, TGI, llama.cpp u Ollama tras fusionar el adaptador con el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se comparan el adaptador con su modelo base y con otro adaptador LoRA sobre Qwen3-0.6B encontrado en la búsqueda web, del que solo se dispone de información parcial:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-0.6B (base) | 598.344.000 | No disponible en la info | Apache 2.0 | Público en HuggingFace |
| Adaptador médico PT-BR LoRA | 2.293.760 entrenables (sobre 598.344.000) | 512 tokens (límite de entrenamiento) | Apache 2.0 | Público en HuggingFace |
| Arabic Assistant using Qwen3-0.6B LoRA (GitHub) | No disponible | No disponible | No disponible | Repo de GitHub (solo descripción, sin especificaciones) |

La comparativa no puede evaluar el rendimiento de forma completa porque no existen benchmarks estandarizados publicados para estos adaptadores. El adaptador médico destaca por su enfoque en un dominio específico y por haber sido entrenado en recursos mínimos (CPU).

## Limitaciones y advertencias

- Artefacto académico y experimental: no ha sido validado como dispositivo médico y no debe usarse para diagnóstico, prescripción, definición de tratamiento, triaje de emergencia ni decisiones clínicas sin revisión de un profesional sanitario cualificado.
- Riesgo de alucinación: las respuestas generadas pueden ser clínicamente incorrectas o engañosas; la validez clínica no ha sido comprobada y las métricas de token no garantizan corrección médica.
- Conjunto de datos reducido y filtrado: solo 1.303 ejemplos, con eliminación de los registros más largos, lo que puede sesgar el modelo hacia casos cortos y simples.
- Anonimización de PII incompleta: aunque el pipeline de entrenamiento incluyó detección y anonimización de PII, no hay garantía absoluta contra la presencia o memorización de datos personales o de salud (PHI). Se requiere una revisión de privacidad antes de cualquier uso público.
- Uso lingüístico limitado: el adaptador se ha entrenado exclusivamente en portugués brasileño; su comportamiento en otros idiomas no se ha evaluado.
- Sin soporte de razonamiento: el modo de pensamiento de Qwen3 se desactivó, por lo que el modelo no está optimizado para tareas de razonamiento complejo o multi-step.
- No apto para producción: no se han realizado validaciones técnicas, clínicas, éticas ni de seguridad; cualquier despliegue en producción requeriría evaluaciones adicionales.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/gilbertoag2007/qwen3-0.6b-assistente-medico-ptbr-lora-fiap-gp-86
- HuggingFace (modelo base): https://huggingface.co/Qwen/Qwen3-0.6B
