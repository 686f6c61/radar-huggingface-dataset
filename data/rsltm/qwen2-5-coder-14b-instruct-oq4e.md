# RSLtm/Qwen2.5-Coder-14B-Instruct-oQ4e

## Resumen

El modelo RSLtm/Qwen2.5-Coder-14B-Instruct-oQ4e es una cuantización de precisión mixta de 4 bits del modelo Qwen2.5-Coder-14B-Instruct, desarrollado originalmente por Alibaba Cloud. Esta versión cuantizada ha sido generada con la herramienta oQ (oMLX v0.6.4) y está optimizada para ejecutarse en dispositivos Apple Silicon mediante el framework MLX. El objetivo es reducir el tamaño del modelo de aproximadamente 29 GB (en FP16) a 8.7 GB, manteniendo un equilibrio entre rendimiento y fidelidad gracias a la cuantización mixta con group size de 64.

El modelo base Qwen2.5-Coder-14B-Instruct es un LLM especializado en generación y comprensión de código, con una ventana de contexto de 128K tokens y entrenado con 5.5 billones de tokens, incluyendo código fuente, datos de grounding texto-código y datos sintéticos. Esta cuantización hereda todas las capacidades del modelo original, pero con un footprint de memoria significativamente menor, lo que la hace adecuada para despliegue en entornos con recursos limitados, como portátiles con Apple Silicon o GPUs de gama media.

La relevancia de esta ficha radica en que ofrece una opción práctica para desarrolladores que necesitan ejecutar un modelo de código de 14B parámetros en hardware de consumo, sin sacrificar demasiada calidad. Al estar en formato MLX safetensors, se integra directamente con el ecosistema MLX de Apple, aunque también puede convertirse a otros formatos si es necesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | 4-bit, group size 64, precision mixta (oQ) |
| Idiomas soportados | no disponible (hereda del modelo base, que soporta multiples idiomas) |
| Licencia | no disponible (modelo base: Apache-2.0) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-14B-Instruct utiliza una arquitectura transformer decoder-only con atención de ventana deslizante y RoPE (Rotary Position Embedding). Tiene 14.77 mil millones de parámetros y fue entrenado con 5.5 billones de tokens, combinando código fuente de multiples lenguajes, datos de grounding texto-código y datos sintéticos generados para mejorar la capacidad de razonamiento y generación de código. El entrenamiento incluyó fases de instrucción y alineación con preferencias humanas (RLHF/DPO), lo que le permite seguir instrucciones complejas y mantener conversaciones multi-turno.

La cuantización oQ aplicada en esta versión utiliza una estrategia de precisión mixta: asigna 4 bits a la mayoría de los pesos, pero conserva mayor precisión en capas críticas (como las de atención) para minimizar la degradación. El group size de 64 permite un equilibrio entre compresion y calidad. El resultado es un modelo de 8.7 GB que puede cargarse en memoria unificada de dispositivos Apple Silicon o en GPUs con al menos 10 GB de VRAM.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Java, C++, JavaScript, etc.) con alta fidelidad sintactica y semantica.
- Razonamiento logico y matematico aplicado a problemas de programacion, incluyendo debugging y refactorizacion.
- Soporte de tool calling y function calling, lo que permite integrarlo en agentes que interactuan con APIs y herramientas externas.
- Capacidad de manejar contextos largos de hasta 128K tokens, util para repositorios completos o documentacion extensa.
- Multilingue: aunque la ficha no especifica idiomas, el modelo base soporta ingles, chino y otros idiomas principales.
- Modo instruct: optimizado para seguir instrucciones detalladas y generar respuestas estructuradas.
- Compatible con frameworks de inferencia como MLX, vLLM y llama.cpp (tras conversion), lo que facilita su despliegue en diferentes entornos.

## Casos de uso

- Asistente de programacion en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletar codigo, sugerir refactorizaciones y explicar fragmentos. Su contexto de 128K permite analizar archivos completos o multiples archivos de un proyecto.
- Agente de codigo autonomo: gracias al soporte de tool calling, puede ejecutar comandos, leer archivos y modificar codigo en un entorno sandbox, ideal para tareas de automatizacion de desarrollo.
- Revision de codigo en CI/CD: puede analizar pull requests, detectar errores comunes, vulnerabilidades y sugerir mejoras, integrandose en pipelines de integracion continua.
- Generacion de documentacion tecnica: a partir de codigo fuente o especificaciones, el modelo puede redactar comentarios, docstrings y manuales de usuario.
- Educacion y formacion: como tutor de programacion, puede explicar conceptos, resolver dudas y generar ejercicios personalizados para estudiantes.
- Analisis de repositorios legacy: con su largo contexto, puede procesar codigo heredado, identificar dependencias y proponer estrategias de modernizacion.
- Despliegue en edge devices: al ser una cuantizacion 4-bit, cabe en dispositivos con memoria limitada, como portatiles con Apple Silicon o mini-PCs, permitiendo inferencia local sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantizacion oQ no incluye metricas de rendimiento en la model card. Para referencia, el modelo base Qwen2.5-Coder-14B-Instruct obtiene resultados competitivos en HumanEval, MBPP y otros benchmarks de codigo, pero no se dispone de datos especificos para esta version cuantizada. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: el tamaño del repo es de 8.7 GB, por lo que se estima que la inferencia requiere entre 9 y 10 GB de memoria (incluyendo overhead de activaciones). En dispositivos Apple Silicon con memoria unificada, se recomienda al menos 16 GB de RAM.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4080, A100 40GB (si se convierte a otros formatos). En Apple Silicon, cualquier chip M1 Pro o superior con 16 GB de RAM unificada.
- Cabe en GPUs de consumo con 12 GB de VRAM, como la RTX 3060 o RTX 4070, siempre que se utilice el formato MLX o se convierta a GGUF.
- Opciones de despliegue: MLX (nativo), vLLM (tras conversion a safetensors estandar), llama.cpp (tras conversion a GGUF), Ollama (si se convierte).
- Latencia y throughput: no disponible. Depende del hardware y del backend. En Apple Silicon M2 Max, se espera una velocidad de generacion de 20-40 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (base) | 14.77B | 128K | Apache-2.0 | safetensors | Modelo original, mayor precision pero requiere ~29 GB en FP16 |
| RSLtm/Qwen2.5-Coder-14B-Instruct-oQ4e | 14.77B | 128K | no disponible | MLX safetensors | Cuantizacion 4-bit, 8.7 GB, optimizado para MLX |
| DeepSeek-Coder-6.7B-Instruct | 6.7B | 16K | MIT | safetensors | Menor tamano, contexto mas corto, menos capaz en tareas complejas |
| CodeLlama-13B-Instruct | 13B | 16K | Llama 2 license | safetensors | Alternativa de Meta, contexto limitado, licencia restrictiva |

La comparativa se basa en caracteristicas generales, no en benchmarks, ya que no se dispone de datos de rendimiento para la cuantizacion. El modelo cuantizado ofrece una ventaja clara en terminos de memoria frente al base, manteniendo el mismo contexto y arquitectura.

## Limitaciones y advertencias

- La cuantizacion 4-bit puede degradar ligeramente la calidad de generacion en tareas muy complejas o con codigo poco comun, en comparacion con el modelo en precision completa.
- No se ha publicado informacion sobre sesgos o alucinaciones especificos de esta version. El modelo base puede presentar sesgos presentes en sus datos de entrenamiento.
- La licencia de la cuantizacion no esta especificada. El modelo base es Apache-2.0, pero se recomienda contactar con el autor de la cuantizacion para aclarar los terminos de uso.
- El formato MLX safetensors es especifico de Apple Silicon. Para usar en GPUs NVIDIA, es necesario convertir a otro formato (por ejemplo, GGUF o safetensors estandar), lo que puede requerir herramientas adicionales.
- No se garantiza la compatibilidad con todas las versiones de MLX; se recomienda verificar la version de oMLX utilizada (v0.6.4) y la compatibilidad con el runtime.
- El contexto de 128K es una capacidad del modelo base, pero la cuantizacion puede afectar al rendimiento con contextos muy largos debido a la precision reducida en las capas de atencion.

## Enlaces

- [HuggingFace - RSLtm/Qwen2.5-Coder-14B-Instruct-oQ4e](https://huggingface.co/RSLtm/Qwen2.5-Coder-14B-Instruct-oQ4e)
- [HuggingFace - Qwen/Qwen2.5-Coder-14B-Instruct (modelo base)](https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct)
- [HuggingFace - Qwen/Qwen2.5-Coder-14B (modelo base sin instruct)](https://huggingface.co/Qwen/Qwen2.5-Coder-14B)
- [LM Studio - Qwen2.5 Coder 14B Instruct](https://lmstudio.ai/models/qwen/qwen2.5-coder-14b)
- [Dev.co - Qwen2.5-Coder-14B-Instruct: Open-Source Code LLM](https://dev.co/ai/llms/qwen2-5-coder-14b-instruct)
- [PaddleNLP docs - Qwen2.5-Coder-14B-Instruct](https://paddlenlp-en.readthedocs.io/en/latest/_static/website/Qwen/Qwen2.5-Coder-14B-Instruct/index.html)
- [oQ (oMLX) - herramienta de cuantizacion](https://github.com/jundot/omlx)
