# AlinaGonch/qwen3-4b-instruct-squad-ratio-0.30-seed-42

## Resumen

Este modelo es un fine-tuning experimental del modelo base Qwen3-4B-Instruct, realizado por la autora AlinaGonch sobre el dataset SQuAD2.0. El nombre del repositorio indica que se ha entrenado con una proporción de 0.30 de muestras no respondibles (preguntas sin respuesta en el contexto) y una semilla fija de 42. Forma parte de una colección más amplia de experimentos cuyo objetivo es determinar la proporción óptima de muestras sin respuesta en el conjunto de entrenamiento para tareas de comprensión lectora y respuesta a preguntas.

El interés de este modelo es principalmente investigador: permite estudiar cómo afecta la proporción de preguntas no respondibles al rendimiento final del modelo en tareas de QA extractivo. Al estar basado en Qwen3-4B-Instruct, hereda la arquitectura densa de 4.000 millones de parámetros y la ventana de contexto de 32.768 tokens, aunque el proceso de fine-tuning puede haber alterado algunas de sus capacidades originales. La documentación publicada es mínima, por lo que gran parte de las especificaciones técnicas deben inferirse del modelo base y del contexto del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-4B-Instruct) |
| Parametros totales | 4.000 millones (aprox., no confirmado para este fine-tuning) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen3-4B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (Qwen3-4B-Instruct soporta principalmente ingles y chino, pero no se especifica para este modelo) |
| Licencia | no disponible (el modelo base Qwen3 usa Apache 2.0, pero este repositorio no declara licencia) |
| Formato de pesos | safetensors (segun tags) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct, un transformer denso de 4.000 millones de parametros con atencion completa y una ventana de contexto de 32.768 tokens. Qwen3 incorpora un modo de pensamiento (thinking mode) y un modo sin pensamiento (non-thinking mode) en un unico framework, aunque no se ha confirmado si este fine-tuning conserva ambas modalidades.

El entrenamiento consiste en un fine-tuning supervisado sobre SQuAD2.0, un dataset de comprension lectora que combina preguntas respondibles y no respondibles. La variable experimental es la proporcion de muestras no respondibles en el conjunto de entrenamiento, fijada en 0.30 para este modelo, con una semilla de 42 para la seleccion de datos. No se han publicado detalles sobre hiperparametros, numero de epocas, tasa de aprendizaje ni tecnicas de alineacion adicionales (RLHF, DPO, etc.). El tamaño del repositorio (0.1 GB) sugiere que se trata de un checkpoint ligero, posiblemente con pesos en precision reducida.

## Capacidades

- Respuesta a preguntas extractivas: el modelo esta entrenado para localizar y extraer respuestas literales dentro de un contexto dado, asi como para detectar cuando una pregunta no tiene respuesta en el texto.
- Comprension lectora: puede procesar pasajes de texto y responder preguntas sobre ellos, incluyendo la identificacion de preguntas sin respuesta valida.
- Generacion de texto en ingles: al estar basado en Qwen3-4B-Instruct, conserva capacidades generales de generacion de texto, aunque el fine-tuning puede haber reducido su rendimiento en otras tareas.
- No se ha confirmado soporte para tool calling, funciones de agente, vision, audio ni modos de razonamiento especiales en este checkpoint especifico.

## Casos de uso

- Investigacion sobre datasets de QA: este modelo es util para estudiar el impacto de la proporcion de preguntas no respondibles en el entrenamiento, permitiendo comparar metricas como F1 y EM frente a otros checkpoints de la misma coleccion con ratios diferentes.
- Evaluacion de robustez en sistemas de preguntas y respuestas: puede emplearse para probar como un sistema de QA maneja preguntas sin respuesta en entornos controlados, especialmente en dominios donde los textos contienen informacion incompleta.
- Analisis de sesgos en datasets de comprension lectora: al variar la proporcion de muestras no respondibles, se puede analizar si el modelo tiende a alucinar respuestas cuando no hay evidencia en el contexto.
- Desarrollo de pipelines de extraccion de informacion: aunque no es un modelo de produccion, puede servir como punto de partida para fine-tunings posteriores en tareas especificas de extraccion de entidades o hechos.
- Benchmarking de tecnicas de fine-tuning: permite comparar el efecto de diferentes proporciones de datos negativos en el rendimiento final, informando el diseno de datasets de entrenamiento mas eficientes.
- Educacion y divulgacion: como ejemplo de experimento controlado con variables bien definidas, puede utilizarse en cursos de procesamiento de lenguaje natural para ilustrar metodologias de investigacion reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de SQuAD2.0 para este checkpoint concreto. Dado que se trata de un experimento de investigacion sin documentacion adicional, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 4.000 millones de parametros, la inferencia en precision FP16 requiere aproximadamente 8 GB de VRAM. Con cuantizacion a 4 bits, podria reducirse a unos 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo en FP16. Para cuantizaciones mas agresivas, GPUs con 4-6 GB serian suficientes.
- Compatibilidad con GPU de consumo: si, el modelo cabe en GPUs consumer modernas, especialmente con cuantizacion.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede servirse con vLLM, TGI o directamente con la libreria transformers de HuggingFace. Tambien podria convertirse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se han publicado datos especificos. Para un modelo de 4B en una GPU moderna, se espera una latencia de decenas de milisegundos por token y un throughput de varios cientos de tokens por segundo, pero estos valores dependen del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| AlinaGonch/qwen3-4b-instruct-squad-ratio-0.30-seed-42 | 4B | 32K | no disponible | Fine-tuning experimental sobre SQuAD2.0 con ratio 0.30 |
| Qwen3-4B-Instruct (base) | 4B | 32K | Apache 2.0 | Modelo original sin fine-tuning especifico |
| Otros checkpoints de la coleccion SQuAD ratio experiment | 4B | 32K | no disponible | Misma base, diferentes ratios (0.0, 0.1, 0.2, etc.) |

No se dispone de informacion sobre otros modelos comparables fuera de la coleccion de la autora. La comparativa se limita a los variantes del mismo experimento, que comparten arquitectura y dataset pero difieren en la proporcion de muestras no respondibles.

## Limitaciones y advertencias

- Documentacion insuficiente: la model card es una plantilla generada automaticamente sin informacion real sobre el entrenamiento, los datos, la licencia o el rendimiento. Esto dificulta su uso en entornos de produccion o academicos rigurosos.
- Sesgos del dataset SQuAD2.0: el modelo puede heredar sesgos presentes en el dataset, como un sesgo hacia textos en ingles de estilo periodistico o enciclopedico, y una distribucion particular de preguntas que no refleja necesariamente casos de uso reales.
- Riesgo de alucinacion: al estar entrenado para detectar preguntas no respondibles, el modelo podria comportarse de forma impredecible fuera del dominio de QA extractivo, generando respuestas inventadas en otros contextos.
- Sin garantias de licencia: al no declararse licencia, no esta claro si el modelo puede usarse comercialmente. Aunque el modelo base Qwen3 es Apache 2.0, el fine-tuning podria tener restricciones adicionales.
- Limitaciones de idioma: no se especifican los idiomas soportados. Si el fine-tuning se realizo solo con datos en ingles, el rendimiento en otros idiomas probablemente sea deficiente.
- Tamaño del repositorio reducido: el checkpoint de 0.1 GB sugiere que podria estar en precision reducida o que faltan archivos, lo que podria afectar a la calidad de la inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AlinaGonch/qwen3-4b-instruct-squad-ratio-0.30-seed-42
- Coleccion de experimentos SQuAD ratio: https://huggingface.co/collections/AlinaGonch/squad-dataset-ratio-experiment-qwen3-instruct
- Repositorio del modelo base Qwen3-4B-Instruct: https://huggingface.co/Qwen/Qwen3-4B-Instruct
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Blog oficial de Qwen3: https://qwen.ai/blog?id=qwen3
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
