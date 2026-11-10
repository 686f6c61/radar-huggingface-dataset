# esraderey/chispa-20m-python

## Resumen

CHISPA-20M-python es un modelo de lenguaje diminuto (20.119.360 parámetros) desarrollado por el usuario esraderey como artefacto de investigación dentro de la serie de RFC CHISPA. Su propósito es el completado de línea de código Python mediante fill-in-the-middle (FIM), no la generación de funciones completas a partir de un docstring. Está entrenado desde cero con una arquitectura tipo LLaMA y se distribuye bajo licencia MIT.

El modelo resuelve un problema acotado pero relevante para la investigación: medir qué capacidad de completado de código se puede obtener con un presupuesto de cómputo mínimo (una sola H100, 521M tokens). Su tamaño permite experimentar con técnicas de FIM, tokenización alineada a lexemas de Python y evaluación sobre repositorios retenidos sin requerir infraestructura de GPU de gama alta.

Es relevante ahora como referencia reproducible para quienes investigan modelos de código a pequeña escala, y como ejemplo de model card con evaluación honesta (coincidencia exacta de línea del 1,2%). No está pensado para producción ni como asistente de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo LLaMA (d=320, 12 capas, 5 cabezas de 64, SwiGLU 864, RMSNorm, RoPE, embeddings atados) |
| Parámetros totales | 20.119.360 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | código (Python exclusivamente) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración clásica de LLaMA a escala reducida: dimensión oculta de 320, 12 capas, 5 cabezas de atención de 64 dimensiones, FFN SwiGLU de 864, normalización RMSNorm, embeddings rotatorios (RoPE) y pesos de embedding atados. El tokenizador es un BPE a nivel de byte de 16.384 piezas con pretokenización alineada a lexemas de Python (identificadores, números, puntuación y saltos de línea con sangría). Los pesos se convirtieron desde el formato del laboratorio con una diferencia máxima de logits de 3,6e-05.

El entrenamiento usó `codeparrot/codeparrot-clean`, filtrando solo archivos con licencia permisiva (MIT, Apache-2.0, BSD-2/3, ISC, Unlicense): 3.228.316 archivos de 280.112 repositorios. El 3% de los repositorios (seleccionados por hash del nombre) se reservó para evaluación. Se entrenaron 521M tokens con el 50% de los documentos en formato FIM (PSM), y la mitad de esos con el hueco al final de una línea. Optimizador AdamW con pico 3e-3, calendario WSD, lote de 131.072 tokens, precisión bf16 y una sola H100. Pérdida final de entrenamiento: 1,56971.

## Capacidades

- Completado de línea de código Python mediante fill-in-the-middle en formato PSM (`<fim_prefix>`, `<fim_suffix>`, `<fim_middle>`).
- Generación de texto autoregresiva estándar sobre código Python.
- Relleno de huecos al final de línea, escenario para el que se reservó entrenamiento específico.
- Tokenización sensible a la estructura léxica de Python (identificadores, números, puntuación, sangría).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo Python.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación sobre fill-in-the-middle: el modelo sirve como banco de pruebas reproducible para estudiar cómo afecta el porcentaje de datos FIM y la posición del hueco a la calidad del completado, con un coste de entrenamiento de una sola GPU.
- Evaluación de tokenizadores para código: su BPE alineado a lexemas de Python permite comparar empíricamente el impacto de la pretokenización en la coincidencia exacta de identificadores frente a tokenizadores genéricos.
- Prototipado de autocompletado en editores: se puede integrar en un plugin de editor para sugerir el resto de una línea dentro de cuerpos de función, aceptando que la coincidencia exacta de línea es del 1,2% y que requiere recorte de espacios iniciales.
- Estudio de alucinación en modelos pequeños de código: la métrica de nombres indefinidos introducidos (11,0%, IC90 10,3%–11,6%) permite analizar cómo escala la alucinación con el tamaño del modelo.
- Docencia y divulgación: por su tamaño (0,1 GB de repo) y su licencia MIT, es adecuado para talleres donde se explique el pipeline completo de entrenamiento, conversión de pesos y evaluación de un modelo de código.
- Baseline en comparativas de modelos de completado: sirve como referencia de baja capacidad para medir la ganancia de modelos mayores en tareas de FIM sobre repositorios retenidos.

## Benchmarks y rendimiento

Evaluación sobre repositorios retenidos con 20.000 cursores dentro de cuerpos de función:

| Métrica | Valor |
|---|---|
| Coincidencia exacta del primer identificador de la línea | 17,1% |
| Coincidencia exacta de la línea completa | 1,2% |
| Completados que introducen un nombre indefinido | 11,0% (IC90 10,3%–11,6%) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (20,1M parámetros), aproximadamente 40 MB en bf16/fp16 y menos de 20 MB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el entrenamiento se realizó en una H100, pero la inferencia no requiere hardware de datacenter.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3090, RTX 3060, GTX 1660 e incluso en CPU.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (el modelo está etiquetado como compatible con endpoints), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque no se documenta su publicación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CHISPA-20M-python | 20,1M | 1.024 | FIM Python, investigación | MIT | Hugging Face |
| Modelos de completado pequeños tipo CodeParrot | no disponible | no disponible | Generación de código | no disponible | no disponible |
| Modelos tipo StarCoder base | no disponible | no disponible | Generación de código multilingüe | no disponible | no disponible |

No se dispone de datos comparativos verificados con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 20M parámetros: inventa nombres de variables y funciones, y no conoce APIs poco comunes.
- Ventana de contexto limitada a 1.024 tokens, insuficiente para archivos completos.
- Solo Python; no procesa otros lenguajes.
- Las métricas son offline y no se validaron con usuarios reales.
- El corpus procede de GitHub y puede contener código con errores o inseguro; no se aplicó filtrado de seguridad más allá del filtro de licencias.
- Si el prefijo termina justo después de la sangría, el modelo tiende a empezar con espacios de más; se recomienda recortar el inicio de la línea o prohibir en el primer paso las piezas que empiezan por espacio.
- No es un asistente de código: completa líneas, no escribe funciones a partir de un docstring.
- Licencia MIT, sin restricciones documentadas para uso comercial, aunque su naturaleza de artefacto de investigación desaconseja su uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/esraderey/chispa-20m-python
- Repositorio del proyecto (código, preregistro y experimentos): https://github.com/esraderey/chispa
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean
