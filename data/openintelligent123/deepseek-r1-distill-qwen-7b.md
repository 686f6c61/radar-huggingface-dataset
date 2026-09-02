# Openintelligent123/DeepSeek-R1-Distill-Qwen-7B

## Resumen

DeepSeek-R1-Distill-Qwen-7B es un modelo de razonamiento denso de 7.000 millones de parametros, resultado de la destilacion del modelo DeepSeek-R1 sobre la arquitectura Qwen2.5-Math-7B. Fue desarrollado por DeepSeek AI y liberado en enero de 2025 como parte de una familia de seis modelos destilados (1.5B, 7B, 8B, 14B, 32B y 70B) que trasladan las capacidades de razonamiento del modelo original a arquitecturas mas pequenas y eficientes. La version alojada en el repositorio Openintelligent123/DeepSeek-R1-Distill-Qwen-7B es una copia de los pesos oficiales publicada por un tercero.

El modelo destaca por su capacidad de razonamiento explicito: genera cadenas de pensamiento (chain-of-thought) largas y estructuradas antes de responder, lo que le permite resolver problemas complejos de matematicas, logica y codigo con un rendimiento muy superior al de otros modelos de su tamano. Su licencia MIT permite uso comercial sin restricciones, incluida la destilacion para entrenar otros modelos, lo que lo convierte en una opcion atractiva para equipos que necesitan capacidades de razonamiento en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Math-7B base) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Qwen2.5) |
| Tipos de cuantizacion | No disponible en el repositorio; compatible con cuantizaciones estandar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta principalmente ingles y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-R1-Distill-Qwen-7B parte del modelo Qwen2.5-Math-7B y se ajusta mediante destilacion utilizando datos de razonamiento generados por DeepSeek-R1, el modelo de 671.000 millones de parametros con arquitectura MoE entrenado con aprendizaje por refuerzo a gran escala. El proceso de destilacion consiste en fine-tuning supervisado (SFT) sobre las cadenas de razonamiento producidas por el modelo profesor, lo que transfiere los patrones de pensamiento y autoverificacion al modelo pequeno sin necesidad de entrenar con RL directamente.

El modelo hereda la arquitectura transformer densa de Qwen2.5, con atencion completa y un contexto de 128.000 tokens. A diferencia de DeepSeek-R1, que emplea una arquitectura MoE con 37.000 millones de parametros activos, esta version destilada activa la totalidad de sus 7.600 millones de parametros en cada inferencia. El entrenamiento de destilacion demostro ser mas efectivo que aplicar RL directamente sobre modelos pequenos, como se documenta en el paper de DeepSeek-R1 (arXiv:2501.12948).

## Capacidades

- Razonamiento explicito con cadenas de pensamiento largas: el modelo genera un bloque de razonamiento interno antes de emitir la respuesta final, lo que mejora la precision en problemas que requieren varios pasos logicos.
- Matematicas avanzadas: rinde a nivel competitivo en benchmarks como AIME 2024 y MATH-500, superando a modelos de tamano similar y acercandose a modelos mucho mayores.
- Generacion de codigo: capaz de resolver problemas de programacion competitiva y tareas de desarrollo con razonamiento paso a paso.
- Razonamiento logico y cientifico: maneja preguntas de fisica, quimica y logica formal con explicaciones detalladas.
- Multilingue limitado: hereda las capacidades del modelo base Qwen2.5, principalmente ingles y chino; el rendimiento en otros idiomas no esta documentado.
- Sin soporte de tool calling ni function calling: el modelo esta orientado a razonamiento puro y no incluye capacidades de agente nativas.
- Sin modo vision ni audio: es exclusivamente un modelo de texto.

## Casos de uso

- Asistente de estudio y tutoria de matematicas: el modelo puede resolver problemas paso a paso y explicar el razonamiento, lo que lo hace util para plataformas educativas que necesitan generar soluciones detalladas y comprensibles para estudiantes de secundaria y universidad.
- Generacion de codigo con explicaciones: en entornos de desarrollo, puede generar funciones complejas y explicar su logica, util para documentacion automatica y revision de codigo.
- Resolucion de problemas de programacion competitiva: su capacidad para razonar sobre algoritmos y estructuras de datos lo hace adecuado para plataformas de entrenamiento como LeetCode o Codeforces, donde puede generar soluciones optimas con explicaciones.
- Analisis de datos cientificos: puede interpretar problemas estadisticos o de fisica y proponer metodos de resolucion, util en laboratorios de investigacion que necesitan un asistente de razonamiento.
- Chatbot de soporte tecnico especializado: aunque no soporta tool calling, puede mantener conversaciones multi-turno y resolver consultas que requieren deduccion logica, como diagnostico de errores de configuracion.
- Generacion de contenido educativo: creacion de problemas de practica con soluciones razonadas para cursos online, incluyendo la generacion de variantes de ejercicios con distinto nivel de dificultad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el repositorio Openintelligent123/DeepSeek-R1-Distill-Qwen-7B en la informacion disponible. Sin embargo, el modelo oficial DeepSeek-R1-Distill-Qwen-7B de deepseek-ai reporta los siguientes resultados en el paper de DeepSeek-R1:

| Benchmark | DeepSeek-R1-Distill-Qwen-7B | Qwen2.5-Math-7B | Llama-3.1-8B-Instruct |
|---|---|---|---|
| AIME 2024 (pass@1) | 55,5 | 16,0 | 6,0 |
| MATH-500 (pass@1) | 92,8 | 75,0 | 52,0 |
| HumanEval (pass@1) | 82,6 | 80,0 | 72,0 |
| LiveCodeBench (pass@1) | 37,6 | 30,0 | 20,0 |

Estos datos provienen del paper oficial y corresponden al modelo original; la copia del repositorio Openintelligent123 deberia presentar un rendimiento equivalente al ser una replica de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,2 GB en precision FP16 (tamano del repositorio); con cuantizacion INT4 se reduce a unos 4-5 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB VRAM) permite inferencia FP16 sin cuantizacion; GPUs con 8-12 GB (RTX 3060, RTX 4070) pueden ejecutar el modelo con cuantizacion INT8 o INT4.
- Compatible con GPU de consumo: si, cualquier GPU con al menos 6 GB de VRAM puede ejecutar una version cuantizada.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y transformers con accelerate.
- Latencia estimada: en una RTX 4090 con FP16, la generacion de una respuesta de 500 tokens tarda aproximadamente 5-10 segundos; con cuantizacion INT4 la latencia se reduce ligeramente a costa de una pequena perdida de precision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | AIME 2024 | MATH-500 |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128K | MIT | 55,5 | 92,8 |
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | 16,0 | 75,0 |
| Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 | 6,0 | 52,0 |
| DeepSeek-R1-Distill-Llama-8B | 8,0B | 128K | MIT | 49,5 | 89,1 |

La comparativa muestra que la destilacion de DeepSeek-R1 mejora sustancialmente el rendimiento en razonamiento matematico respecto a los modelos base, con una ventaja clara sobre Qwen2.5-7B-Instruct y Llama-3.1-8B-Instruct. La version basada en Qwen supera a la basada en Llama en los benchmarks de matematicas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como modelo entrenado principalmente con datos en ingles y chino, puede presentar sesgos culturales y errores facticos en dominios poco representados en su entrenamiento.
- Riesgo de alucinacion en razonamiento: aunque genera cadenas de pensamiento, estas pueden contener pasos incorrectos que no siempre se reflejan en la respuesta final; es recomendable verificar resultados en aplicaciones criticas.
- Limitaciones de idioma: el rendimiento en espanol y otros idiomas no esta documentado y probablemente sea inferior al de ingles y chino.
- Longitud de contexto: aunque soporta 128K tokens, la generacion de cadenas de razonamiento largas puede consumir rapidamente la ventana de contexto en conversaciones multi-turno.
- Sin tool calling: no puede interactuar con APIs ni herramientas externas, lo que limita su uso en pipelines de agentes.
- Repositorio de terceros: la version alojada en Openintelligent123 no es el repositorio oficial; aunque los pesos deberian ser identicos, no hay garantia de integridad. Se recomienda descargar el modelo desde deepseek-ai/DeepSeek-R1-Distill-Qwen-7B.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificaciones, pero el modelo base Qwen2.5-Math-7B esta bajo Apache 2.0, por lo que las obligaciones de atribucion de esta licencia se mantienen.

## Enlaces

- Repositorio HuggingFace (copia de terceros): https://huggingface.co/Openintelligent123/DeepSeek-R1-Distill-Qwen-7B
- Repositorio HuggingFace oficial: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Coleccion de modelos DeepSeek-R1 en HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-r1
- Pagina del modelo en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
