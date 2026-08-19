# Nasaawakening/zoder-minicpm-slerp

## Resumen

El modelo `Nasaawakening/zoder-minicpm-slerp` es una fusión de pesos mediante el método SLERP (Spherical Linear Interpolation) entre dos modelos base de la familia MiniCPM5-1B: `openbmb/MiniCPM5-1B` y `GnLOLot/MiniCPM5-1B-Claude-Opus-Fable5-V2-Thinking`. El autor, Nasaawakening, lo presenta como un modelo personalizado orientado a conversación, razonamiento lógico, generación de código y escritura creativa, con un tamaño compacto de aproximadamente 1.080 millones de parámetros y 24 capas.

Este modelo es relevante como ejemplo práctico de fusión de modelos (model merging) para combinar capacidades de distintos checkpoints en un único conjunto de pesos, manteniendo un tamaño reducido que permite su ejecución en entornos con recursos limitados. Su licencia Apache 2.0 facilita su uso comercial y su distribución, aunque su documentación es escasa y no incluye especificaciones detalladas de arquitectura, contexto o cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en MiniCPM5-1B, detalles no especificados) |
| Parametros totales | 1.080.632.832 (aprox. 1,08 B) |
| Parametros activos | no aplica (modelo denso, sin indicacion de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en float16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16) |

## Arquitectura y entrenamiento

El modelo se construye mediante una fusión SLERP de dos checkpoints de la familia MiniCPM5-1B. El método SLERP interpola esfericamente los pesos de los modelos base, y en este caso se aplican valores T específicos por tipo de capa: para `self_attn` se usan valores `[0, 0.5, 0.3, 0.7, 1]`, para `mlp` `[1, 0.5, 0.7, 0.3, 0]`, y un valor por defecto de 0.5. El resultado se guarda en float16 con 24 capas.

No se proporcionan datos sobre el entrenamiento original de los modelos base, ni sobre el dataset utilizado, ni sobre técnicas como RLHF o DPO. Se trata exclusivamente de una fusión de pesos, no de un entrenamiento adicional. La arquitectura interna (transformer estándar, atención lineal, etc.) no está documentada en la información disponible.

## Capacidades

Según las pruebas cualitativas reportadas por el autor, el modelo es capaz de:

- Mantener conversaciones básicas multi-turno con memoria de contexto.
- Resolver problemas de razonamiento lógico.
- Generar código en Python.
- Producir textos creativos (escritura de ficción, relatos, etc.).
- Seguir instrucciones de diversa complejidad.
- Resolver problemas matemáticos sencillos.
- Responder preguntas sobre Termux (entorno de terminal para Android).

No se mencionan capacidades de tool calling, uso de agentes, visión, audio ni modos de pensamiento explícitos. El modelo es exclusivamente de texto y en inglés.

## Casos de uso

- Asistente conversacional ligero: gracias a su tamaño de 1,08 B de parámetros, puede integrarse en aplicaciones móviles o dispositivos con poca memoria para mantener diálogos de soporte o consulta.
- Generación de código en entornos de desarrollo con recursos limitados: el modelo puede producir fragmentos de Python para automatizar tareas simples, como scripts de procesamiento de datos o comandos de terminal.
- Prototipado rápido de chatbots: su licencia Apache 2.0 y su formato safetensors permiten cargarlo con transformers para pruebas de concepto sin coste de licencia.
- Asistente de terminal (Termux): el modelo demuestra conocimiento específico de Termux, por lo que puede usarse como ayuda para comandos y configuración en entornos Android.
- Generación de contenido creativo breve: cuentos, poemas o guiones cortos, aprovechando su capacidad de escritura creativa.
- Educación y aprendizaje: como modelo pequeño, puede servir para demostrar técnicas de fusión de modelos o para prácticas de fine-tuning en entornos académicos.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de pruebas cualitativas, no benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.). Los resultados reportados son:

| Test | Estado |
|---|---|
| Conversacion basica | PASS |
| Razonamiento logico | PASS |
| Generacion de codigo (Python) | PASS |
| Escritura creativa | PASS |
| Seguimiento de instrucciones | PASS |
| Memoria multi-turno | PASS |
| Problema matematico | PASS |
| Conocimiento de Termux | PASS |
| **Tasa de aprobacion** | **100% (8/8)** |

No se han publicado resultados de benchmarks estandarizados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,08 B de parámetros en float16, el modelo ocupa aproximadamente 2,2 GB (tamaño del repositorio). En float16 se necesitan al menos 2,5 GB de VRAM; con cuantización a int8 se reduciría a ~1,1 GB, y a int4 a ~0,6 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060, o incluso integradas con suficiente memoria compartida. También puede ejecutarse en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), llama.cpp, Ollama, vLLM (si se adapta), o TGI. No hay información oficial sobre compatibilidad con estos frameworks, pero al ser un modelo basado en MiniCPM, es probable que funcione con los mismos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar (p. ej., Qwen2.5-1.5B, Llama-3.2-1B, Gemma-2-2B) en la información proporcionada. La ausencia de benchmarks estandarizados impide una comparación objetiva. Se recomienda evaluar el modelo directamente en las tareas de interés antes de decidir su uso.

## Limitaciones y advertencias

- El modelo es un merge de pesos, no un modelo entrenado desde cero; su comportamiento depende de los modelos base y de la calidad de la fusión, que no está validada externamente.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Al ser un modelo de 1 B de parámetros, su rendimiento en tareas complejas de razonamiento o generación de código extenso será limitado en comparación con modelos más grandes.
- Riesgo de alucinaciones y errores factuales, especialmente en dominios especializados.
- No se documentan sesgos específicos, pero al derivar de modelos base, puede heredar sesgos presentes en sus datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- No hay información sobre la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nasaawakening/zoder-minicpm-slerp
- Perfil del autor en Hugging Face: https://huggingface.co/Nasaawakening
- Perfil de GitHub del autor: https://github.com/nasaawakening
- Repositorio mymodels-site: https://github.com/nasaawakening/mymodels-site
