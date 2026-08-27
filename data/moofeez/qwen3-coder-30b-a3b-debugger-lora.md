# moofeez/qwen3-coder-30b-a3b-debugger-lora

## Resumen

El modelo `moofeez/qwen3-coder-30b-a3b-debugger-lora` es un adaptador de bajo rango (LoRA/DoRA) diseñado para ajustar el modelo base Qwen3-Coder-30B-A3B, un modelo de arquitectura MoE (Mixture of Experts) con 30 mil millones de parámetros totales y 3 mil millones activos. El adaptador está orientado específicamente a tareas de depuración de código, como su nombre indica, y ha sido entrenado mediante fine-tuning supervisado (SFT) y posteriormente refinado con aprendizaje por refuerzo (RL), según se desprende de los nombres de los archivos en el repositorio.

Este adaptador es relevante porque permite especializar un modelo de código ya potente en la tarea concreta de encontrar y corregir errores en software, sin necesidad de reentrenar el modelo completo. El repositorio incluye tanto el adaptador (35,1 MB) como el modelo fusionado (que ocupa varios terabytes), lo que facilita su uso directo en inferencia. Sin embargo, la información pública es limitada: no se especifica licencia, idiomas soportados ni se publican benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (Mixture of Experts) con adaptador LoRA/DoRA |
| Parametros totales | 30.532.122.624 (modelo base fusionado) |
| Parametros activos | 3.000.000.000 (aprox., segun nomenclatura 30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador usa safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador y modelo fusionado) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-Coder-30B-A3B, un modelo de arquitectura MoE con 30 mil millones de parámetros totales y 3 mil millones activos por token. El adaptador emplea la técnica DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone los pesos en magnitud y dirección para mejorar la capacidad de ajuste. El entrenamiento se realizó en dos fases: primero un fine-tuning supervisado (SFT) con una pérdida de validación de 0,6202, y posteriormente un refinamiento con aprendizaje por refuerzo (RL) sobre la política entrenada (policy_v1). No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni la composición de los datos.

## Capacidades

- Generación de código y depuración: el adaptador está especializado en identificar y corregir errores en código fuente, aprovechando las capacidades base de Qwen3-Coder.
- Razonamiento sobre código: hereda la capacidad del modelo base para razonar sobre lógica de programación, estructuras de datos y algoritmos.
- Soporte de tool calling: no confirmado explícitamente, pero Qwen3-Coder incluye soporte nativo para function calling; el adaptador no debería eliminarlo.
- Multilingüismo: no disponible, aunque el modelo base soporta múltiples lenguajes de programación y texto en varios idiomas.
- Modo de pensamiento (thinking mode): no confirmado para este adaptador, aunque Qwen3-Coder puede tener modos de razonamiento extendido.

## Casos de uso

- Depuración asistida en entornos de desarrollo: el modelo puede analizar fragmentos de código con errores, explicar la causa raíz y sugerir correcciones. Adecuado para integrarse en IDEs o herramientas de línea de comandos.
- Revisión de código en pipelines de CI/CD: puede actuar como un revisor automático que detecta bugs comunes, problemas de estilo o vulnerabilidades antes de la fusión de ramas.
- Generación de tests unitarios: a partir de una función o clase, el modelo puede proponer casos de prueba que cubran rutas de error y casos límite.
- Asistente de programación en tiempo real: integrado en un chat o plugin de editor, responde preguntas sobre errores de compilación, excepciones en tiempo de ejecución o fallos lógicos.
- Análisis de logs y trazas de error: dado un stack trace o un log de excepciones, el modelo puede identificar el punto de fallo y sugerir soluciones.
- Formación y aprendizaje: útil para estudiantes que necesitan explicaciones detalladas de por qué un código falla y cómo corregirlo, con ejemplos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este adaptador especifico.

## Requisitos de hardware

- El adaptador en sí es ligero (35,1 MB) y puede cargarse sobre el modelo base ya cuantizado.
- El modelo base Qwen3-Coder-30B-A3B requiere aproximadamente 60 GB de VRAM en precisión FP16 para inferencia completa. Con cuantización de 4 bits (GPTQ o AWQ) se reduce a unos 20-25 GB, lo que permite ejecutarlo en GPUs como RTX 4090 (24 GB) o A6000 (48 GB).
- Para despliegue en producción se recomiendan GPUs de centro de datos: A100 (40/80 GB), H100 (80 GB) o L40S.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) o directamente con transformers y PEFT para cargar el adaptador.
- Latencia y throughput: no disponibles para este adaptador especifico; dependen del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas concretas. Como referencia, otros adaptadores LoRA para Qwen3-Coder-30B-A3B podrían existir en HuggingFace, pero no se han identificado en la busqueda. El modelo base compite con otros modelos de código como DeepSeek-Coder-V2, CodeLlama-34B o Mixtral-8x7B, pero esta comparativa no aplica directamente al adaptador.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia del adaptador ni del modelo base fusionado, lo que impide conocer las restricciones de uso comercial o de redistribucion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar correcciones incorrectas o inventar APIs inexistentes. Es necesario validar siempre las sugerencias en un entorno de pruebas.
- Sesgos desconocidos: al no publicarse el dataset de entrenamiento, no se puede evaluar si el adaptador tiene sesgos hacia ciertos lenguajes de programacion o estilos de codigo.
- Contexto limitado: no se ha confirmado la longitud de contexto del adaptador; si hereda la del modelo base (tipicamente 32K o 128K tokens), pero no hay garantia.
- Repositorio de gran tamano: el modelo fusionado ocupa 2,8 TB, lo que dificulta su descarga y almacenamiento. Se recomienda usar solo el adaptador y cargarlo sobre el modelo base desde el repositorio oficial de Qwen.
- Sin soporte oficial: el autor es un usuario individual (moofeez), no una organizacion, por lo que no hay garantias de mantenimiento o soporte tecnico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/moofeez/qwen3-coder-30b-a3b-debugger-lora
- Arbol de archivos: https://huggingface.co/moofeez/qwen3-coder-30b-a3b-debugger-lora/tree/main
- Version RL del adaptador: https://huggingface.co/moofeez/qwen3-coder-30b-a3b-debugger-rl-lora
- Repositorio GitHub con releases: https://github.com/Damacol/moofeez-qwen3-coder-30b-a3b-debugger-rl-lora/releases
- README del adaptador RL en GitHub: https://github.com/Damacol/moofeez-qwen3-coder-30b-a3b-debugger-rl-lora-adapter/blob/main/README.md
- Ficha en OpenModelMap: https://openmodelmap.com/model/moofeez/qwen3-coder-30b-a3b-debugger-rft
