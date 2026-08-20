# mrSvet0zar/qwen2.5-7b-pyds-lora

## Resumen

El modelo `mrSvet0zar/qwen2.5-7b-pyds-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, especializado en asistencia en francés para tareas de Python, data science y machine learning. Ha sido desarrollado por Milan Ganivet, con licencia Apache 2.0, y publica un peso de adaptador de aproximadamente 162 MB (0.2 GB en el repositorio). El adaptador se entrena con QLoRA en 4 bits, con rango 16 y alpha 32, ajustando solo 40,4 millones de parámetros (0,53 % del total). Forma parte de un experimento controlado junto con la versión de 3B del mismo autor, con el objetivo de medir el impacto del fine-tuning en modelos de distinta escala.

La relevancia de este adaptador reside en su análisis comparativo: el autor publica métricas de evaluación sobre un conjunto de test de 24 conceptos, mostrando que el fine-tuning en el 7B mejora las métricas de similitud de texto (ROUGE, BLEU, BERTScore) respecto al modelo base, aunque con una mejora menor que la observada en la versión 3B. El modelo produce respuestas bien formadas pero no siempre correctas desde el punto de vista factual, por lo que no es recomendable para uso en producción sin verificación humana. Su valor principal es académico: demuestra cómo el fine-tuning especializado en un corpus pequeño puede competir con un modelo de mayor tamaño sin especializar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rang 16) sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | 7,66 mil millones (modelo base); 40,4 M entrenados (adaptador) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 32K tokens, pero no se especifica en la model card del adaptador) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantización durante el entrenamiento; el adaptador se usa con el base en bfloat16 |
| Idiomas soportados | Frances (corpus de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se entrena con la técnica QLoRA (4-bit NormalFloat con doble cuantización) sobre el modelo base Qwen2.5-7B-Instruct, con rango LoRA 16 y alpha 32. Se entrenan 40,4 millones de parámetros, lo que representa el 0,53 % del total. El entrenamiento usa un learning rate de 2e-4 con programación de coseno y 5 pasos de calentamiento, batch efectivo de 16 (1 paso con 16 acumulaciones), longitud máxima de 768 tokens, y optimizador `adamw_8bit` (no paginado, debido a problemas de estabilidad en Windows con la memoria unificada). El entrenamiento se ejecuta en una RTX 4070 Laptop de 8 GB, con un tiempo de 15 minutos y 25 segundos y un consumo de VRAM de 5,9 GB. El mejor checkpoint se obtiene en la epoch 1 (de 3 solicitadas), con una eval_loss de 1.775.

El corpus de entrenamiento es un conjunto escrito a mano de 126 conceptos en francés, dividido en 7 categorías, con un split estratificado por concepto: 85 ejemplos de entrenamiento (aumentados a 255), 17 de validación y 24 de test. El prompt de sistema se enmascara en el cálculo de la loss, por lo que solo la respuesta contribuye al gradiente. La validación muestra sobreajuste estructural a partir de la segunda epoch, fenómeno también observado en la versión de 3B.

## Capacidades

- Generación de texto conversacional en francés, con un system prompt fijo que define el rol de asistente experto en Python, data science y ML.
- Respuestas estructuradas y detalladas con ejemplos de código cuando es pertinente, gracias al ajuste fino en un corpus de conceptos técnicos.
- Soporte de razonamiento básico sobre conceptos de programación, estadística y aprendizaje automático, aunque con riesgo de errores factuales (el propio autor documenta alucinaciones concretas, como la descripción incorrecta de BERTScore).
- No se ha documentado soporte para tool calling, visión, audio ni otros modos especiales. El modelo se limita a texto conversacional.
- Capacidad multilingüe limitada: el corpus es exclusivamente en francés y el adaptador se ha entrenado para ese idioma; el modelo base sí soporta múltiples idiomas, pero el adaptador no está optimizado para ello.

## Casos de uso

- Asistente de ayuda para estudiantes de Python y data science: el modelo puede responder preguntas sobre sintaxis, bibliotecas como NumPy o pandas, y explicar conceptos de ML en francés, con ejemplos de código. Es útil en entornos educativos donde se requiere una explicación rápida y estructurada, aunque el usuario debe verificar los detalles técnicos.
- Tutor de programación en francés: se puede integrar en plataformas de aprendizaje en línea para generar respuestas a dudas de ejercicios de programación, con el system prompt adecuado y un flujo de revisión humana.
- Generación de documentación técnica en francés: el modelo puede redactar explicaciones de conceptos de data science (p. ej., métricas de evaluación, algoritmos) para incluir en documentación interna, siempre que se realice una revisión editorial posterior.
- Chatbot de soporte para herramientas de análisis de datos en francés: puede responder consultas sobre bibliotecas y buenas prácticas, aunque no se recomienda para atención al cliente automatizada sin supervisión debido a la falta de fiabilidad factual.
- Experimentación en investigación de fine-tuning: es un caso de estudio de referencia para comparar el impacto del fine-tuning en modelos de 3B y 7B, útil para investigadores que estudian la relación entre tamaño del modelo y ganancia de especialización.
- Prototipado rápido de asistentes técnicos en francés: al ser un adaptador ligero (162 MB), se puede desplegar en entornos de desarrollo para probar interacciones de lenguaje natural en dominios técnicos, sin necesidad de un modelo completo.

## Benchmarks y rendimiento

El autor presenta una evaluación sobre un conjunto de test de 24 conceptos, con intervalos de confianza al 95 % mediante bootstrap. La comparativa entre el modelo base y el fine-tuned en 7B es la siguiente:

| Sistema | ROUGE-1 | ROUGE-L | BLEU | BERTScore |
|---|---|---|---|---|
| 3B base | 0.260 | 0.127 | 1.92 | 0.6569 |
| 3B fine-tuned | 0.359 | 0.166 | 4.46 | 0.7018 |
| 7B base | 0.330 | 0.157 | 3.36 | 0.6572 |
| **7B fine-tuned (este modelo)** | **0.385** | **0.180** | **6.24** | **0.7119** |

El autor también analiza los incrementos relativos: el fine-tuning en el 7B mejora un 17 % en ROUGE-1, un 14 % en ROUGE-L y un 86 % en BLEU, pero solo la mejora en ROUGE-1 es estadísticamente significativa (los intervalos de confianza se solapan en ROUGE-L y BLEU). Además, el 3B fine-tuned (0.359) se acerca al 7B base (0.330) en ROUGE-1, lo que sugiere que el fine-tuning de un modelo pequeño puede igualar a un modelo grande sin ajustar.

## Requisitos de hardware

- Para inferencia, el adaptador se carga sobre el modelo base Qwen2.5-7B-Instruct. En bfloat16, el modelo base ocupa aproximadamente 14 GB de VRAM; con cuantización 4-bit (por ejemplo, mediante `bitsandbytes`), el uso de VRAM se reduce a unos 5-6 GB, lo que permite ejecutarlo en GPUs consumer de 8 GB (como la RTX 4070 Laptop utilizada en el entrenamiento).
- El entrenamiento del adaptador se realizó en una RTX 4070 Laptop con 8 GB de VRAM, consumiendo 5,9 GB y con una duración de 15 minutos y 25 segundos para 2 epochs. Esto indica que la inferencia en el mismo hardware es viable.
- Opciones de despliegue: se puede cargar con la librería `peft` y `transformers`, usando `device_map="auto"`. También se puede convertir a GGUF para su uso con `llama.cpp` u `Ollama`, aunque el adaptador PEFT no está pensado para esos formatos directamente; habría que fusionar el adaptador con el modelo base y exportar.
- No se proporcionan datos de latencia o throughput específicos para el adaptador. La inferencia dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

La comparación directa se realiza con la versión 3B del mismo adaptador y con el modelo base sin fine-tuning, como se muestra en la tabla de benchmarks. La siguiente tabla resume las diferencias clave:

| Modelo | Parámetros | Contexto | Métrica principal (ROUGE-1) | Licencia |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct + adaptador LoRA (mismo corpus) | 3,09 B | 32K | 0.359 | Apache 2.0 |
| Qwen2.5-7B-Instruct (base, sin adaptador) | 7,66 B | 32K | 0.330 | Apache 2.0 |
| **Qwen2.5-7B-Instruct + adaptador (este modelo)** | 7,66 B (40,4 M entrenados) | 32K (base) | **0.385** | Apache 2.0 |

No se han encontrado otros modelos comparables en el repositorio, pero el experimento controlado con la versión 3B ofrece una comparación directa de la eficiencia del fine-tuning en escalas diferentes.

## Limitaciones y advertencias

- **Exactitud factual**: el modelo produce respuestas bien formadas pero a menudo factualmente incorrectas. El autor documenta un ejemplo concreto (BERTScore descrito como un modelo de clasificación fine-tuned) y recomienda no usar el modelo como fuente de verdad técnica.
- **Tamaño del corpus**: el conjunto de entrenamiento es de solo 126 conceptos, muy lejos de un fine-tuning serio, lo que limita la generalización.
- **Tamaño del test**: la evaluación se realiza sobre 24 ejemplos, con intervalos de confianza amplios; algunas mejoras (ROUGE-L, BLEU) no son estadísticamente significativas.
- **Idioma**: el corpus está sin acentos y en francés; el modelo puede mostrar degradación en entradas con acentos o en otros idiomas.
- **Riesgo de alucinación**: el modelo puede inventar definiciones o conceptos, especialmente en dominios técnicos complejos.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para producción sin verificación humana.
- **Dependencia del system prompt**: el prompt de sistema específico forma parte del contrato de entrenamiento; omitirlo degrada los resultados.
- **Ganancia del fine-tuning**: el autor señala que los incrementos en ROUGE-L y BLEU no son estadísticamente establecidos, lo que limita la confianza en la superioridad del 7B sobre el 3B.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/mrSvet0zar/qwen2.5-7b-pyds-lora)
- [Dataset card (corpus)](https://huggingface.co/datasets/mrSvet0zar/corpus-python-ds-ml-fr)
- [Código fuente del entrenamiento](https://github.com/mrSvet0zar/llm-finetuning-qlora)
- [Modelo base Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
