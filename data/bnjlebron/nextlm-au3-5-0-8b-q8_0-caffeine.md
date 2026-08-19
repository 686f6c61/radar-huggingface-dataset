# bnjlebron/nextlm-au3.5-0.8b-q8_0-caffeine

## Resumen

NextLM Au3.5 0.8B Caffeine es un modelo de lenguaje pequeño (0.8B parámetros) publicado por el usuario bnjlebron como parte del proyecto NextLM, cuyo objetivo es crear modelos locales pequeños capaces de "mejorarse a sí mismos". Se trata de un fine-tune LoRA en bf16 sobre el modelo base Qwen/Qwen3.5-0.8B, cuantizado posteriormente a GGUF Q8_0. El modelo está diseñado para recibir una etiqueta de nivel de pensamiento (`<thinking_level>N</thinking_level>`) en el prompt de sistema y escalar su profundidad de razonamiento en función de ese nivel, manteniendo respuestas concisas y admitiendo incertidumbre en lugar de alucinar.

El proyecto es claramente experimental y de carácter lúdico: el autor describe el modelo como "cargado de cafeína" y "cursi", entrenado con solo 66 pares de datos generados localmente durante 15 pasos en una GPU Intel Arc. A pesar de su tamaño reducido y de la naturaleza informal del proyecto, el modelo incorpora un mecanismo interesante de control de razonamiento por niveles y una política explícita anti-alucinación, lo que lo convierte en un caso de estudio curioso para quienes exploran fine-tunes pequeños con comportamientos específicos. La licencia Apache 2.0 permite uso comercial, aunque el autor advierte que es un proyecto no oficial y sin afiliación con Qwen o Alibaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.5, etiquetada como `qwen35`) |
| Parametros totales | 0.8B (modelo base Qwen3.5-0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (el autor indica que puede usarse hasta 256k, pero el valor configurado es 2048) |
| Tipos de cuantizacion | Q8_0 (GGUF, ~774 MB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer denso de 0.8B parámetros. Sobre esta base se aplicó un fine-tune con LoRA en bf16 utilizando la librería Unsloth, ejecutado en una GPU Intel Arc (sin soporte de compilador C para cuantización Q4, según el autor). El entrenamiento consistió en 15 pasos con 16 pasos de acumulación de gradiente, partiendo de una pérdida de 0.90 y alcanzando 0.64. El dataset de entrenamiento se compone de 66 pares generados localmente: 24 pares de identidad/persona (deterministas, basados en configuración), 30 pares de niveles de pensamiento (la profundidad de razonamiento escala con el nivel, pero la respuesta final permanece constante) y 12 pares anti-alucinación (el modelo admite incertidumbre en lugar de inventar respuestas). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen (system / user / assistant).
- Razonamiento escalable mediante la etiqueta `<thinking_level>N</thinking_level>` (niveles 1-5) en el prompt de sistema: el modelo ajusta su profundidad de razonamiento según el nivel indicado, sin inflar la longitud de la respuesta.
- Identidad honesta: el modelo declara su nombre, cuantización y naturaleza cuando se le pregunta.
- Política anti-alucinación: admite explícitamente cuando no sabe algo, en lugar de fabricar respuestas.
- Capacidad de uso con contexto extendido (hasta 256k según el autor, aunque el valor por defecto es 2048).
- No se mencionan capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Chatbot local de bajo consumo: al ser un modelo de 0.8B en Q8_0 (~774 MB), puede ejecutarse en hardware modesto, incluso en CPU, para conversaciones simples con identidad definida.
- Experimentación con control de razonamiento: el sistema de niveles de pensamiento permite probar cómo varía la calidad de las respuestas al cambiar la profundidad de razonamiento, útil para investigar el equilibrio entre esfuerzo computacional y calidad.
- Pruebas de fine-tune con datasets mínimos: el proyecto demuestra que con solo 66 ejemplos y 15 pasos se puede modificar el comportamiento de un modelo base, sirviendo como referencia para experimentos similares.
- Entorno educativo: para estudiantes que quieran entender cómo funciona un LoRA, la cuantización GGUF y el despliegue con llama.cpp o LM Studio.
- Generación de respuestas con honestidad sobre limitaciones: útil en aplicaciones donde la alucinación es crítica, como asistentes de documentación técnica, aunque con las limitaciones propias de un modelo pequeño.
- Base para futuras iteraciones del proyecto NextLM: el autor indica que este es el primer release y que el objetivo final es que el modelo aprenda a fine-tunearse a sí mismo, por lo que puede servir como punto de partida para desarrollos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para el archivo Q8_0 de ~774 MB, más overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, o incluso iGPU modernas). También puede ejecutarse en CPU con llama.cpp.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU consumer actual.
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, y cualquier runtime compatible con GGUF (Ollama, llama-cpp-python, etc.).
- Latencia y throughput: no disponible, pero al ser un modelo de 0.8B se espera una generación rápida incluso en CPU.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros modelos en la información consultada. El modelo es un fine-tune específico de Qwen3.5-0.8B, por lo que su rendimiento base debería ser similar al de ese modelo, pero no hay cifras que lo confirmen.

## Limitaciones y advertencias

- Modelo muy pequeño (0.8B): su capacidad de razonamiento y conocimiento general es limitada en comparación con modelos más grandes.
- Entrenamiento mínimo: solo 66 ejemplos y 15 pasos, lo que implica que el fine-tune es superficial y puede no generalizar bien fuera de los patrones vistos.
- Riesgo de alucinación: a pesar de la política anti-alucinación, el autor advierte que el modelo puede alucinar o cometer errores; debe tratarse con cautela.
- Contexto por defecto de 2048 tokens: aunque el autor menciona que puede usarse hasta 256k, no se especifica cómo se logra ni si el rendimiento se degrada.
- Proyecto no oficial: no está afiliado a Qwen/Alibaba ni a NextLM (que es solo una carpeta local del autor). No hay garantías de soporte ni mantenimiento.
- Datos de entrenamiento no publicados: el autor indica que los datos se generaron localmente y no se incluyen en el repositorio, lo que dificulta la reproducibilidad.
- Idiomas soportados: no especificados; probablemente hereda los del modelo base Qwen3.5, pero no se confirma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bnjlebron/nextlm-au3.5-0.8b-q8_0-caffeine
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
