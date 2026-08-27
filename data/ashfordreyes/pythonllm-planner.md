# ashfordreyes/pythonllm-planner

## Resumen

`pythonllm-planner` es un adaptador LoRA desarrollado por Ashford Reyes sobre el modelo base Qwen/Qwen2.5-7B-Instruct, diseñado específicamente para tareas de programación en Python orientadas a ciencia de datos. Según el repositorio de GitHub vinculado, el objetivo declarado es crear un LLM especializado exclusivamente en codificación para ciencia de datos con Python, lo que sugiere un ajuste fino dirigido a reducir el ruido en dominios no relacionados. El modelo se distribuye como un adaptador PEFT (Peft 0.20.0) con licencia MIT, lo que facilita su integración en proyectos comerciales sin restricciones de uso.

La relevancia de este modelo radica en su enfoque vertical: en lugar de un LLM generalista, ofrece una especialización en un dominio técnico concreto, lo que puede mejorar la precisión en tareas de análisis de datos, limpieza, visualización y modelado estadístico. El hecho de que se base en Qwen2.5-7B-Instruct, un modelo de 7.000 millones de parámetros con ventana de contexto de 32.768 tokens, le otorga una base sólida en razonamiento y generación de código, mientras que el adaptador LoRA permite un despliegue ligero sin necesidad de reentrenar el modelo completo.

Aunque la información pública es escasa (la model card está incompleta y no hay benchmarks publicados), el modelo parece orientado a desarrolladores y científicos de datos que buscan un asistente de código especializado en Python para análisis de datos. Su relevancia radica en la tendencia actual de especializar modelos LLM para dominios específicos, mejorando la calidad de las respuestas en tareas concretas con un coste computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.000 millones (base) + parametros del adaptador LoRA (no especificados) |
| Parametros activos | no disponible (MoE no aplicable) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no especificados; compatible con cuantizacion de Qwen2.5 (GPTQ, AWQ, GGUF) |
| Idiomas soportados | Ingles (segun metadatos; el modelo base soporta 29 idiomas, pero el adaptador se ha entrenado probablemente en ingles) |
| Licencia | MIT |
| Formato de pesos | PEFT/LoRA (adaptador), safetensors para el modelo base |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-7B-Instruct, un transformer decoder-only con atención de escala completa y 28 capas, 28 cabezas de atención y 7.000 millones de parámetros. La ventana de contexto es de 32.768 tokens, lo que permite manejar secuencias largas de código y documentación. El adaptador LoRA se ha entrenado sobre este modelo base para especializarlo en tareas de programación en Python para ciencia de datos. Los detalles sobre el dataset de entrenamiento, el número de tokens utilizados o la técnica de alineación (RLHF, DPO, etc.) no están disponibles en la información pública. El repositorio de GitHub (ashfordreyes/pythonllm) no proporciona más detalles sobre el proceso de entrenamiento, aunque el nombre sugiere que el modelo se ha enfocado en datos de ciencia de datos, posiblemente con datasets públicos como Kaggle, Stack Overflow o repositorios de código científico.

## Capacidades

- Generacion de codigo Python especializado en ciencia de datos: limpieza de datos, manipulacion con pandas, visualizacion con matplotlib/seaborn, y modelado estadistico.
- Razonamiento sobre tareas de analisis de datos: puede interpretar problemas de datos y proponer soluciones en Python.
- Soporte de tool calling: no confirmado, pero el modelo base Qwen2.5-7B-Instruct soporta function calling, lo que podria estar disponible si el adaptador no lo ha desactivado.
- Capacidades multilingues: el adaptador se ha declarado en ingles, pero el modelo base soporta 29 idiomas, por lo que podria funcionar en otros idiomas aunque con menor calidad.
- Capacidades especiales: no se ha confirmado modo thinking o vision, el modelo es de texto puro.

## Casos de uso

- **Automatizacion de tareas de analisis de datos**: el modelo puede generar scripts de Python para cargar, limpiar y transformar datos, ahorrando tiempo en pipelines de datos. Su especializacion en ciencia de datos lo hace adecuado para este tipo de tareas.
- **Asistente de codigo en Jupyter Notebook**: integrado como autocompletado o generador de codigo, puede sugerir fragmentos de pandas, numpy o scikit-learn directamente en el contexto de un notebook.
- **Generacion de documentacion tecnica**: puede explicar funciones de librerias de ciencia de datos y generar docstrings o comentarios en codigo.
- **Ensenanza de Python para ciencia de datos**: como tutor de codigo, puede resolver ejercicios y explicar conceptos de programacion aplicados a datos.
- **Prototipado rapido de pipelines de datos**: en un entorno de desarrollo, puede generar el esqueleto de un pipeline de extraccion, transformacion y carga (ETL) con Python.
- **Depuracion de codigo de datos**: dado un codigo que falla, el modelo puede identificar errores comunes en pandas, numpy o scikit-learn y sugerir correcciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros para este adaptador especifico. El modelo base Qwen2.5-7B-Instruct obtuvo puntuaciones de 75,6 en MMLU y 69,0 en HumanEval, pero no se sabe si el adaptador mejora o empeora estas cifras. Se recomienda evaluar el modelo en tus propios datos de ciencia de datos antes de desplegarlo en produccion.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con el adaptador LoRA, la VRAM adicional es minima, pero el modelo base de 7B requiere unos 14 GB en fp16 o 7 GB en int8. Con cuantizacion GPTQ de 4 bits, se reduce a unos 4 GB.
- **GPU recomendadas**: una RTX 3090 o RTX 4090 (24 GB) puede ejecutar el modelo en fp16; una RTX 3060 (12 GB) puede ejecutarlo en int8 o cuantizado. Para produccion, se recomienda una A100 o H100 con vLLM.
- **Compatibilidad con consumer GPU**: si, en GPUs de 8 GB o mas con cuantizacion (llama.cpp, Ollama).
- **Opciones de despliegue**: vLLM, llama.cpp, Ollama, TGI, Transformers con PEFT.
- **Latencia y throughput**: no hay datos publicados. En una RTX 4090, un modelo 7B cuantizado a 4 bits puede generar 50-100 tokens/s con llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especialidad |
|---|---|---|---|---|
| **pythonllm-planner** | 7B (base) + LoRA | 32.768 | MIT | Programacion Python para ciencia de datos |
| **CodeLlama-7B-Instruct** | 7B | 16.384 | Llama 2 license | Generacion de codigo general |
| **DeepSeek-Coder-7B-Instruct** | 7B | 16.384 | MIT | Generacion de codigo general |
| **Qwen2.5-7B-Instruct** | 7B | 32.768 | Apache 2.0 | Instrucciones generales y codigo |

La comparativa muestra que pythonllm-planner se diferencia por su especializacion en ciencia de datos, mientras que los otros son mas generales. La licencia MIT es mas permisiva que Llama 2, pero menos que Apache 2.0 (aunque MIT es compatible con uso comercial). El contexto es mayor que los modelos de codigo similares, lo que favorece el manejo de datos largos.

## Limitaciones y advertencias

- **Informacion incompleta**: la model card no especifica el dataset de entrenamiento, el proceso de entrenamiento ni la evaluacion, lo que dificulta conocer sus limites exactos.
- **Sesgos potenciales**: al estar entrenado en datos de ciencia de datos, podria tener sesgos en otros dominios de codigo (por ejemplo, desarrollo web o sistemas).
- **Riesgo de alucinacion**: como cualquier LLM, puede generar codigo incorrecto o inventar APIs inexistentes. Es necesario validar siempre el codigo generado.
- **Idioma**: la especializacion en ingles puede reducir la calidad en otros idiomas, aunque el base model soporta multilingue.
- **Uso en produccion**: sin benchmarks publicados, es arriesgado usarlo en tareas criticas sin una evaluacion previa. Se recomienda probar con datos propios.
- **Licencia MIT**: permite uso comercial y modificacion, pero el modelo base Qwen2.5-7B-Instruct tiene licencia Apache 2.0, por lo que se debe cumplir con las condiciones de ambos.

## Enlaces

- HuggingFace: https://huggingface.co/ashfordreyes/pythonllm-planner
- Repositorio GitHub: https://github.com/ashfordreyes/pythonllm
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de Qwen2.5: no disponible en la busqueda, pero se puede consultar en el repo de Qwen.
