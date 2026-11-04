# mmoselhy077/qwen3-8b-sva-thinking-abl839-lora

## Resumen

`qwen3-8b-sva-thinking-abl839-lora` es un adaptador LoRA de 698 MB desarrollado por el usuario `mmoselhy077` sobre el modelo base `Qwen/Qwen3-8B`. Su propósito es convertir descripciones de propiedades en lenguaje natural (en inglés) en aserciones SystemVerilog (SVA) para verificación formal de diseños hardware. El adaptador razona primero dentro de un bloque `<think>` antes de emitir la aserción, lo que lo alinea con el modo de razonamiento de la familia Qwen3.

El modelo resuelve un problema muy concreto del flujo EDA: la escritura manual de aserciones SVA es lenta y propensa a errores, y la verificación formal exige propiedades correctas y no vacuas. Este adaptador se entrena específicamente sobre un corpus curado de 839 ejemplos NL→SVA y se evalúa con un arnés formal (Questa `qverify`) que comprueba equivalencia bidireccional frente a una referencia, penalizando aserciones vacuamente verdaderas.

Es relevante porque demuestra que un ajuste fino ligero (LoRA r=64) sobre un modelo de 8B puede alcanzar un pass@5 del 81,2% en FVEval-Verified, con una brecha notable entre especificaciones generadas por máquina (85,9%) y escritas por humanos (63,0%). No obstante, el propio autor advierte que el pass@5 es un techo oracular y que no debe desplegarse en modo single-shot sin verificación formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parametros totales | 8B en el modelo base; adaptador LoRA de 698 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3-8B`, un transformer decoder-only de 8.000 millones de parámetros con modo de razonamiento explícito (`enable_thinking=True`). El ajuste se realiza mediante LoRA con rango r=64 y α=128 durante 3 épocas sobre el corpus `mmoselhy077/sva-abl839-corpus`, compuesto por 839 ejemplos curados de descripción en lenguaje natural a aserción SVA. La model card deja como TODO los módulos objetivo, la tasa de aprendizaje, el tamaño de batch, la longitud máxima de secuencia y el hardware empleado, por lo que esos detalles no están disponibles.

La innovación principal no está en la arquitectura sino en el pipeline de evaluación: cada muestra se considera correcta solo si Questa `qverify` demuestra equivalencia bidireccional (miter) con la referencia, y las aserciones vacuamente verdaderas se contabilizan como fallo. El entrenamiento induce un patrón de razonamiento previo en bloque `<think>` antes de la emisión de la aserción, lo que permite muestrear varias respuestas y filtrarlas formalmente.

## Capacidades

- Generación de aserciones SystemVerilog (SVA) a partir de descripciones de propiedades en lenguaje natural en inglés.
- Modo de razonamiento explícito: produce un bloque `<think>` antes de la aserción final.
- Generación de texto conversacional con plantilla de chat de Qwen3 (`apply_chat_template`).
- Especialización en verificación formal de hardware (propiedades de temporización, implicaciones, ventanas de ciclos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y multi-step reasoning: no documentado específicamente; el razonamiento se limita al bloque `<think>`.
- Capacidades multilingües: solo inglés (`language: [en]`).
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Generación asistida de aserciones en flujos de verificación formal: el ingeniero describe una propiedad ("req must be granted within 3 cycles") y el adaptador propone la SVA correspondiente, que luego se valida con `qverify` antes de incorporarla al testbench.
- Aceleración de la escritura de propiedades en entornos de verificación de IP: dado que el adaptador se apoya en el contexto de Qwen3-8B, puede procesar descripciones de temporización relativamente detalladas y generar candidatos que el verificador revisa y refina.
- Generación de candidatos con filtrado formal (best-of-N): muestrear varias respuestas con temperatura baja (0,2 en el ejemplo de la model card) y seleccionar la primera que pase la comprobación de equivalencia, aprovechando el pass@5 del 81,2%.
- Punto de partida para ajuste fino propio: al ser un adaptador ligero (698 MB), permite intercambiar adaptadores sobre una misma base Qwen3-8B compartida y reentrenar sobre corpus propios de SVA.
- Prototipado rápido en pipelines EDA: integrar el adaptador en scripts que reciben especificaciones en texto y devuelven borradores de SVA para revisión humana, reduciendo el tiempo de arranque en nuevos bloques de diseño.
- Docencia y formación en verificación formal: usar el bloque `<think>` como traza explicativa de cómo se construye una aserción a partir de una propiedad, útil para revisar el razonamiento antes de la validación formal.
- Evaluación comparativa de modelos en NL→SVA: servir como referencia ligera frente a adaptadores fusionados o modelos mayores en experimentos sobre FVEval-Verified.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y la model card (no verificados de forma independiente). Evaluación sobre FVEval-Verified, 356 problemas (73 humanos, 283 generados por máquina), con equivalencia bidireccional probada por Questa `qverify`; las aserciones vacuamente verdaderas se consideran fallo.

| Metrica | Global | Human split | Machine split |
|---|---:|---:|---:|
| Equivalence pass@5 | 81,2% | 63,0% | 85,9% |
| Equivalence pass@1 (aprox.) | no disponible | ~45% | ~63% |

El autor señala que el pass@5 es un techo oracular: conviene muestrear varias respuestas y comprobarlas formalmente, y no desplegar en single-shot. También advierte que las tasas de "proven" no son comparables entre modelos porque el arnés contó pruebas vacuamente verdaderas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el modelo base Qwen3-8B en bfloat16 requiere del orden de 16 GB de VRAM solo para pesos, a lo que hay que sumar caché KV y activaciones; el adaptador añade ~698 MB.
- GPU recomendadas: no especificadas por el autor. Por tamaño del base, cabría esperar A100, H100 o RTX 4090 para inferencia en precisión completa o media; no confirmado en la información disponible.
- Cabe en GPU de consumo: no confirmado en la información proporcionada; depende de la cuantización del base, que no se documenta.
- Opciones de despliegue: la model card solo documenta `transformers` + `peft` (con `merge_and_unload()` opcional). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card sugiere `max_new_tokens=8192` y `temperature=0.2`, lo que implica generaciones largas por el bloque de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@5 (FVEval-Verified) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-sva-thinking-abl839-lora (este) | 8B base + LoRA 698 MB | no disponible | 81,2% global (63,0% human / 85,9% machine) | apache-2.0 | HuggingFace |
| qwen3-8b-sva-rest-r2-merged | 8B (fusionado) | no disponible | 84,8% | apache-2.0 (heredada) | HuggingFace |
| Qwen/Qwen3-8B (base, sin ajuste SVA) | 8B | no disponible en esta ficha | no disponible | apache-2.0 | HuggingFace |

El autor recomienda el adaptador fusionado `qwen3-8b-sva-rest-r2-merged` (84,8%) para máxima precisión, y este adaptador LoRA cuando se prefiera una descarga ligera, intercambio de adaptadores sobre una base compartida o un punto de partida para ajuste propio. No se dispone de datos de benchmarks del base Qwen3-8B en esta tarea en la información proporcionada.

## Limitaciones y advertencias

- Solo acepta especificaciones de una única propiedad y en inglés; no cubre especificaciones multi-propiedad ni otros idiomas.
- Las salidas pueden ser SVA sintácticamente válida pero semánticamente incorrecta o vacua; el autor insiste en validar siempre formalmente.
- Brecha acusada entre especificaciones generadas por máquina (85,9%) y escritas por humanos (63,0%): el rendimiento en escenarios reales será más cercano al split humano.
- El pass@5 es un techo oracular; el pass@1 aproximado baja a ~45% en human y ~63% en machine. No apto para despliegue single-shot sin filtrado formal.
- Las tasas de "proven" no son comparables entre modelos porque el arnés contó pruebas vacuamente verdaderas.
- Datos de entrenamiento y evaluación limitados (839 ejemplos de entrenamiento, 356 de evaluación): riesgo de sobreajuste al estilo del corpus y de baja generalización a dominios SVA no representados.
- Licencia Apache-2.0 heredada de Qwen3-8B: permite uso comercial, pero conviene revisar las condiciones del modelo base.
- No se documentan sesgos específicos, riesgos de alucinación más allá de la incorrección formal, ni detalles de cuantización o despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmoselhy077/qwen3-8b-sva-thinking-abl839-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/mmoselhy077/sva-abl839-corpus
- Adaptador fusionado recomendado por el autor: https://huggingface.co/mmoselhy077/qwen3-8b-sva-rest-r2-merged
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
