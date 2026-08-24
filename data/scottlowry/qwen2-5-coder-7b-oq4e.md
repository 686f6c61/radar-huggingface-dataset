# scottlowry/Qwen2.5-Coder-7B-oQ4e

## Resumen

El modelo `scottlowry/Qwen2.5-Coder-7B-oQ4e` es una cuantización de 4 bits del modelo Qwen2.5-Coder-7B, desarrollado originalmente por Alibaba. Esta versión concreta ha sido generada por el usuario scottlowry utilizando la herramienta oQ (oMLX v0.6.3rc2), que aplica cuantización de precisión mixta sobre el formato MLX, optimizado para ejecución en hardware Apple Silicon. El modelo base Qwen2.5-Coder-7B es un transformer decoder-only especializado en generación y razonamiento de código, con una ventana de contexto de 32.768 tokens y entrenado sobre más de 5,5 billones de tokens. Esta cuantización reduce el tamaño del modelo a aproximadamente 4,5 GB, lo que permite ejecutarlo en dispositivos con memoria unificada limitada, como MacBooks con chips M1/M2/M3. La relevancia actual radica en la creciente demanda de modelos de código locales y eficientes, capaces de funcionar sin conexión y con privacidad de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 7,6 mil millones (modelo base) * |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (modelo base) |
| Tipos de cuantizacion | 4 bits (oQ4e, group size 64) |
| Idiomas soportados | Ingles y chino (modelo base) |
| Licencia | No disponible (el modelo base usa Apache 2.0) |
| Formato de pesos | MLX safetensors |

*Nota: el repositorio de HuggingFace indica 1.237.816.832 parametros, dato inconsistente con el modelo base (7,6B). Se trata probablemente de un error en la metadata; el numero real de parametros del modelo Qwen2.5-Coder-7B es 7,6 mil millones.

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B se construye sobre la arquitectura Qwen2.5, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternadas. Fue preentrenado con un corpus de mas de 5,5 billones de tokens, con una mezcla de datos de codigo (lenguajes como Python, Java, C++, JavaScript) y texto natural, seguido de un ajuste fino supervisado y optimizacion con preferencias humanas (RLHF/DPO). El modelo resultante destaca por su capacidad de razonamiento de codigo, generacion de funciones complejas y correccion de errores. La cuantizacion oQ4e aplicada por scottlowry utiliza una estrategia de precision mixta: asigna 4 bits a la mayoria de los pesos, con un tamaño de grupo de 64, y conserva mayor precision en capas criticas (como las de atencion) para minimizar la perdida de calidad. El formato MLX safetensors esta disenado para el framework MLX de Apple, que aprovecha la memoria unificada de los chips M-series.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, Java, C++, JavaScript, TypeScript, etc.) con sintaxis correcta y logica coherente.
- Razonamiento de codigo: explicacion de algoritmos, deteccion de errores, refactorizacion y optimizacion.
- Soporte de tool calling y function calling, permitiendo integracion con APIs y ejecucion de acciones externas.
- Capacidad de agentes y razonamiento multi-paso, util para tareas de depuracion o planificacion de proyectos.
- Multilingue: aunque el modelo base esta entrenado principalmente en ingles y chino, puede manejar codigo y comentarios en otros idiomas.
- No incluye capacidades de vision ni audio; es exclusivamente texto.
- La cuantizacion 4-bit mantiene la mayoria de las capacidades del modelo original, aunque puede haber una ligera degradacion en tareas muy complejas.

## Casos de uso

- Asistente de programacion local: el modelo puede ejecutarse en un portatil Apple Silicon sin conexion, ofreciendo autocompletado y sugerencias de codigo en editores como VS Code o Neovim, gracias a su tamano reducido (4,5 GB) y baja latencia en MLX.
- Generacion de codigo en entornos con requisitos de privacidad: empresas que no pueden enviar codigo propietario a servicios en la nube pueden desplegar este modelo en local para generar funciones, tests o documentacion.
- Educacion y aprendizaje de programacion: estudiantes pueden usarlo para obtener explicaciones de conceptos, ejemplos de codigo y correcciones de ejercicios, sin depender de internet.
- Automatizacion de tareas de desarrollo: integrado en pipelines de CI/CD, puede generar scripts de build, configuraciones de Docker o archivos de despliegue, aprovechando su capacidad de tool calling.
- Analisis de codigo legacy: el modelo puede ayudar a comprender y documentar codigo antiguo, generando resumenes y sugerencias de modernizacion.
- Prototipado rapido: desarrolladores pueden generar esqueletos de aplicaciones o funciones completas a partir de descripciones en lenguaje natural, acelerando la fase inicial de proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion oQ4e. El modelo base Qwen2.5-Coder-7B-Instruct, segun el reporte tecnico (arXiv:2409.12186), supera a modelos mas grandes como CodeStral-22B y DS-Coder-33B-Instruct en tareas de razonamiento de codigo, pero no se dispone de cifras exactas en la informacion proporcionada. Se recomienda consultar el reporte original para datos detallados de MMLU, HumanEval, GSM8K y otros benchmarks.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB para la cuantizacion 4-bit, gracias al formato MLX que utiliza memoria unificada.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superiores) con al menos 8 GB de RAM unificada; para un rendimiento fluido se recomienda 16 GB o mas.
- No es compatible con GPUs NVIDIA o AMD, ya que el formato MLX esta disenado exclusivamente para Apple Silicon.
- Opciones de despliegue: el modelo se puede cargar con el framework MLX de Apple, o mediante herramientas como Ollama (que soporta MLX) o llama.cpp con adaptaciones.
- Latencia y throughput: no se han publicado mediciones especificas, pero en un MacBook M2 con 16 GB se espera una generacion de 20-40 tokens por segundo, dependiendo de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B (base) | 7,6B | 32.768 | FP16 | Apache 2.0 | safetensors |
| scottlowry/Qwen2.5-Coder-7B-oQ4e | 7,6B | 32.768 | 4-bit (oQ4e) | No disponible | MLX safetensors |
| scottlowry/Qwen2.5-Coder-7B-oQ8e | 7,6B | 32.768 | 8-bit (oQ8e) | No disponible | MLX safetensors |
| CodeLlama-7B | 6,7B | 16.384 | Varias | Llama 2 license | safetensors, GGUF |

La comparativa se basa en caracteristicas tecnicas; no se dispone de benchmarks comparativos entre estas versiones cuantizadas.

## Limitaciones y advertencias

- La cuantizacion 4-bit puede provocar una ligera perdida de precision en tareas de razonamiento complejo o generacion de codigo muy largo, en comparacion con el modelo en FP16.
- El modelo base tiene sesgos inherentes a sus datos de entrenamiento, que pueden reflejarse en sugerencias de codigo o comentarios.
- Riesgo de alucinacion: puede generar codigo que parece correcto pero contiene errores logicos o de seguridad; se recomienda revision humana.
- Limitaciones de idioma: aunque soporta ingles y chino, su rendimiento en otros idiomas es inferior.
- La licencia de esta cuantizacion no esta especificada; aunque el modelo base es Apache 2.0, el autor de la cuantizacion no ha declarado una licencia, lo que puede generar incertidumbre legal para uso comercial.
- No incluye soporte para vision, audio ni otras modalidades.
- Al estar limitado a MLX, no es portable a entornos con GPUs CUDA sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scottlowry/Qwen2.5-Coder-7B-oQ4e
- Version oQ8e del mismo autor: https://huggingface.co/scottlowry/Qwen2.5-Coder-7B-oQ8e
- Modelo base Qwen2.5-Coder-7B: https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Reporte tecnico Qwen2.5-Coder (arXiv): https://arxiv.org/html/2409.12186v1
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
- Pagina de Ollama para qwen2.5-coder:7b: https://ollama.com/library/qwen2.5-coder:7b
