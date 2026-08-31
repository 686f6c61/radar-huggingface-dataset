# dharun2049/Kaveri-4B

## Resumen

Kaveri-4B es un modelo de lenguaje compacto especializado en generación de código y razonamiento algorítmico, desarrollado por el usuario dharun2049. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-4B mediante la técnica LoRA de 16 bits, con el objetivo de optimizar el rendimiento en tareas de ingeniería de software, programación competitiva y generación de código Python. El modelo está pensado para entornos donde se requiere un equilibrio entre capacidad y eficiencia, ya que su tamaño de aproximadamente 4,66 mil millones de parámetros permite su ejecución en hardware de consumo con cuantización adecuada.

La relevancia de Kaveri-4B radica en su enfoque específico en código, entrenado con el dataset NVIDIA OpenCodeInstruct filtrado por ejecución (umbral de calidad ≥ 0,80), lo que busca garantizar que las respuestas generadas sean funcionalmente correctas. Aunque no se han publicado benchmarks oficiales, el autor indica que el modelo está diseñado para ser evaluado con LiveCodeBench, incluyendo métricas Pass@1. Su licencia Apache 2.0 y su disponibilidad en formato safetensors lo hacen accesible para investigación y uso comercial, siempre que se respeten los términos de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-4B) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kaveri-4B hereda la arquitectura transformer de Qwen3.5-4B, que es un modelo de lenguaje autoregresivo con atención completa. El fine-tuning se realizó con LoRA (Low-Rank Adaptation) en 16 bits, con rango 16 y alpha 16, sobre un lote efectivo de 8 y durante 500 pasos de entrenamiento. Los datos de entrenamiento provienen de NVIDIA OpenCodeInstruct, un dataset de instrucciones de código, filtrado por ejecución con un umbral de calidad de 0,80, lo que implica que solo se retuvieron ejemplos que pasaron pruebas de ejecución. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales. La innovación principal es la selección de datos basada en ejecución, que busca mejorar la corrección funcional del código generado.

## Capacidades

- Generacion de codigo Python y otros lenguajes (el dataset OpenCodeInstruct incluye multiples lenguajes, aunque el modelo esta orientado a Python).
- Razonamiento algoritmico y resolucion de problemas de programacion competitiva.
- Asistencia en tareas de ingenieria de software, como implementacion de funciones, refactorizacion y depuracion.
- Soporte de conversacion en ingles (no se menciona soporte multilingue).
- No se indica soporte de tool calling, function calling ni capacidades de agente.
- No se menciona modo de pensamiento (thinking mode) ni capacidades multimodales (aunque el tag "image-text-to-text" aparece en los metadatos, no se confirma en la model card; probablemente sea un error de etiquetado).

## Casos de uso

- Generacion de codigo en entornos de desarrollo integrado (IDE): el modelo puede autocompletar funciones y clases en Python, ayudando a desarrolladores a escribir codigo mas rapido. Su entrenamiento con datos filtrados por ejecucion reduce la probabilidad de generar codigo con errores de sintaxis o logica.
- Resolucion de problemas de programacion competitiva: dado un enunciado de problema, el modelo puede generar una solucion algoritmica en Python. Es util para plataformas como Codeforces o LeetCode, donde se requiere razonamiento algoritmico y eficiencia.
- Asistencia en entrevistas tecnicas: puede servir como herramienta de practica para generar soluciones a problemas clasicos de algoritmos y estructuras de datos, ofreciendo explicaciones y codigo de referencia.
- Automatizacion de tareas de scripting: el modelo puede generar scripts para automatizar tareas repetitivas, como procesamiento de archivos, scraping basico o manipulacion de datos, gracias a su capacidad de generar codigo ejecutable.
- Educacion en programacion: puede utilizarse como tutor para explicar conceptos de programacion y generar ejemplos de codigo comentados, ayudando a estudiantes a comprender patrones y tecnicas.
- Investigacion en modelos de codigo: al ser un modelo pequeno y de codigo abierto, es adecuado para experimentos de fine-tuning adicional, evaluacion de tecnicas de cuantizacion o estudio de transferencia de conocimiento en tareas de programacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el modelo esta pensado para ser evaluado con LiveCodeBench, pero no proporciona numeros concretos. Por tanto, no se puede comparar objetivamente con otros modelos en terminos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Como referencia, un modelo de ~4,66B parametros en FP16 ocupa aproximadamente 9,3 GB (coincide con el tamano del repo). Con cuantizacion de 4 bits (por ejemplo, GPTQ o AWQ) podria reducirse a ~2,5-3 GB, permitiendo ejecucion en GPUs con 6-8 GB de VRAM.
- GPU recomendadas: para FP16 se necesitaria una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070 Ti, A10). Con cuantizacion 4 bits, una RTX 3060 8GB o RTX 4060 podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion adecuada. En precision completa es mas ajustado, pero posible en GPUs de gama alta.
- Opciones de despliegue: al ser un modelo transformers, se puede servir con vLLM, TGI, o mediante llama.cpp con pesos convertidos a GGUF. Tambien es compatible con Ollama si se convierte previamente.
- Latencia y throughput: no hay datos publicados. En una GPU moderna, se espera una latencia de decodificacion de decenas de milisegundos por token, pero depende del hardware y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kaveri-4B | 4,66B | no disponible | Apache 2.0 | Codigo, programacion competitiva |
| CodeLlama-7B | 7B | 16K | Llama 2 license | Codigo, generico |
| DeepSeek-Coder-6.7B | 6,7B | 16K | MIT | Codigo, multilingue |
| Qwen2.5-Coder-7B | 7B | 32K | Apache 2.0 | Codigo, multilingue |

No se dispone de datos de rendimiento comparativo. Kaveri-4B es mas pequeno que estos modelos, lo que puede implicar menor capacidad pero mayor eficiencia. Su licencia Apache 2.0 es mas permisiva que la de CodeLlama (que tiene restricciones de uso comercial para empresas con mas de 700M de usuarios mensuales). La falta de informacion sobre la longitud de contexto es una limitacion para comparar.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos de codigo en ingles, puede tener un rendimiento limitado en otros idiomas y en tareas no relacionadas con programacion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo incorrecto o inventar APIs que no existen. El filtrado por ejecucion reduce este riesgo, pero no lo elimina.
- Limitaciones de contexto: no se ha especificado la longitud de contexto soportada. Si hereda la de Qwen3.5-4B, probablemente sea de 32K tokens, pero no esta confirmado.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Qwen3.5-4B tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Sin embargo, se debe verificar la licencia del dataset OpenCodeInstruct de NVIDIA para uso comercial.
- Caveat para produccion: al ser un fine-tuning con solo 500 pasos y un dataset filtrado, el modelo puede no generalizar bien a dominios de codigo muy especificos o a lenguajes poco representados. Se recomienda evaluar en el caso de uso concreto antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dharun2049/Kaveri-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B (enlace inferido, no verificado)
- Dataset NVIDIA OpenCodeInstruct: no se ha encontrado enlace directo en la informacion proporcionada.
