# modrill/rstar_coder_32m_lora_olmo3_1025_7b_base

## Resumen

El modelo `modrill/rstar_coder_32m_lora_olmo3_1025_7b_base` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) para tareas de generación de código. Se apoya en el modelo base `allenai/Olmo-3-1025-7B`, un transformer de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (AI2) como parte de la familia OLMo 3. El adaptador, creado por el usuario modrill, está diseñado para ser cargado con PEFT (Parameter-Efficient Fine-Tuning) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su enfoque de adaptación ligera: en lugar de publicar un modelo completo, se ofrece un adaptador congelado que se acopla al modelo base, facilitando su integración en entornos donde no se desea modificar los pesos originales. El nombre del repositorio sugiere un tamaño de adaptador de aproximadamente 32 millones de parámetros, aunque este dato no está confirmado explícitamente en la documentación. El modelo se entrenó en una única GPU y alcanzó un pass@1 de 0.2734 en el conjunto de validación DEV256, lo que indica un rendimiento moderado en tareas de generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer OLMo-3-1025-7B |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; OLMo-3-1025-7B admite extensiones de contexto largo) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en precisión original; el modelo base puede cuantizarse) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que introduce matrices de bajo rango en las capas de atención y feed-forward del modelo base, permitiendo un fine-tuning eficiente en términos de parámetros y memoria. El modelo base, OLMo-3-1025-7B, es un transformer decoder-only entrenado por AI2 sobre el dataset Dolma 3, con una arquitectura estándar de atención causal. El adaptador fue entrenado mediante SFT (supervised fine-tuning) con un objetivo de tokens de asistente, acumulando 32 018 321 tokens de entrenamiento (denominados "dose" en la documentación) en el paso 419. El proceso de entrenamiento se realizó en una única GPU, aunque no se especifica el tipo ni la duración.

La documentación indica que el adaptador es "inmutable" y se distribuye con la instrucción de no fusionarlo con el modelo base a menos que se cree una revisión separada. Se proporcionan hashes SHA-256 para el adaptador, la receta de entrenamiento y el manifiesto de datos, lo que garantiza la reproducibilidad y la trazabilidad del proceso. No se mencionan técnicas adicionales como RLHF o DPO; el entrenamiento es puramente supervisado.

## Capacidades

- Generación de código: el modelo está especializado en producir fragmentos de código en diversos lenguajes, aunque no se especifica cuáles.
- Completado de código: puede sugerir continuaciones de código en contextos de programación.
- Asistencia en tareas de programación: útil para autocompletado en IDEs o generación de funciones a partir de descripciones.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión o audio.
- El soporte multilingüe no está especificado; se asume que hereda las capacidades del modelo base, que es principalmente entrenado con datos en inglés.

## Casos de uso

- Autocompletado en entornos de desarrollo: el adaptador puede integrarse en editores de código (VS Code, Neovim) mediante servidores de inferencia como vLLM o llama.cpp, ofreciendo sugerencias de código en tiempo real.
- Generación de funciones a partir de comentarios: dado un prompt en lenguaje natural, el modelo produce implementaciones de funciones, útil para prototipado rápido.
- Refactorización asistida: puede sugerir reescrituras de bloques de código para mejorar legibilidad o eficiencia, aunque su capacidad de razonamiento complejo es limitada.
- Generación de tests unitarios: a partir de una función dada, el modelo puede proponer casos de prueba básicos, acelerando el desarrollo de suites de test.
- Documentación de código: puede generar comentarios y docstrings para funciones y clases, mejorando la mantenibilidad del software.
- Educación en programación: como asistente para estudiantes, puede explicar fragmentos de código o generar ejemplos sencillos, aunque su precisión no está garantizada.

## Benchmarks y rendimiento

El único dato de rendimiento disponible es el resultado en el conjunto de validación DEV256 (seed 3407), que reporta un pass@1 de 0.2734 (70 aciertos de 256). Este valor sugiere que el modelo resuelve aproximadamente el 27% de las tareas de generación de código evaluadas, un rendimiento moderado en comparación con modelos de código dedicados más grandes. No se han publicado resultados en benchmarks estándar como HumanEval, MBPP o GSM8K en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| DEV256 (pass@1) | 0.2734 (70/256) |

## Requisitos de hardware

- El adaptador LoRA es ligero (0.6 GB en el repositorio), pero requiere cargar el modelo base OLMo-3-1025-7B, que tiene 7B parámetros.
- Para inferencia en precisión fp16, se necesitan al menos 14 GB de VRAM (modelo base) más el adaptador, por lo que una GPU con 16 GB (por ejemplo, RTX 4080, RTX 4090) es suficiente.
- Con cuantización del modelo base (por ejemplo, 4-bit mediante bitsandbytes), la VRAM requerida se reduce a unos 4-6 GB, permitiendo ejecución en GPUs de gama media como RTX 3060 o RTX 4060.
- El adaptador se puede cargar con PEFT en frameworks como Hugging Face Transformers, vLLM (con soporte para LoRA) o llama.cpp (si se convierte a GGUF).
- No se dispone de datos de latencia o throughput específicos; dependerá del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros adaptadores LoRA o modelos de código. El modelo base OLMo-3-1025-7B puede compararse con otros modelos de 7B como Llama 3.1 8B o Mistral 7B, pero el adaptador en sí no tiene métricas publicadas frente a ellos. Se recomienda evaluar el modelo en el caso de uso concreto antes de adoptarlo en producción.

## Limitaciones y advertencias

- El adaptador está diseñado específicamente para código; su rendimiento en tareas de lenguaje natural general puede ser inferior al del modelo base sin adaptar.
- Al ser un adaptador LoRA, su capacidad de generalización fuera del dominio de entrenamiento (código) es limitada.
- No se han documentado sesgos específicos, pero el modelo base puede heredar sesgos presentes en los datos de entrenamiento (Dolma 3).
- Existe riesgo de alucinación en la generación de código, especialmente en APIs o librerías poco comunes; se recomienda verificar el código generado.
- La licencia Apache-2.0 permite uso comercial, pero se debe cumplir con la atribución correspondiente.
- El adaptador está congelado y no debe fusionarse con el modelo base sin crear una revisión separada, según las instrucciones del autor.
- No se especifican limitaciones de contexto; se asume que hereda la ventana de contexto del modelo base, que puede extenderse mediante técnicas de interpolación posicional.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/modrill/rstar_coder_32m_lora_olmo3_1025_7b_base
- Modelo base OLMo-3-1025-7B: https://huggingface.co/allenai/Olmo-3-1025-7B (no se proporciona enlace directo, pero se infiere de la información)
- Página de OLMo 3 en LM Studio: https://lmstudio.ai/models/olmo3
- Script de entrenamiento de contexto largo para OLMo-3-1025-7B: https://github.com/allenai/OLMo-core/blob/main/src/scripts/official/OLMo3/OLMo-3-1025-7B-long-context.py
- Script de preentrenamiento de OLMo-3-1025-7B: https://github.com/allenai/OLMo-core/blob/main/src/scripts/official/OLMo3/OLMo-3-1025-7B-pretrain-1.py
