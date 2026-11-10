# jifengzhou/indo-copa-n06ctl

## Resumen

indo-copa-n06ctl es un ajuste fino del modelo Qwen3-0.6B de Alibaba, publicado por el usuario jifengzhou, orientado especificamente a una tarea muy concreta: razonamiento causal en indonesio en formato de eleccion multiple de dos opciones (estilo COPA/XCOPA), puntuando por log-probabilidad de la letra de respuesta. No es un modelo conversacional general, sino un artefacto de investigacion derivado de un estudio de medicion on-device sobre una placa Allwinner A133 con 1 GB de RAM y Android de 32 bits.

El modelo hereda la arquitectura transformer densa de Qwen3-0.6B, con 596.049.920 parametros totales, y se distribuye tanto en safetensors para evaluacion en host como en GGUF cuantizado para despliegue en el dispositivo. El checkpoint publicado corresponde al paso 1884 (`native_n06_ctl/step_1884`) del entrenamiento.

Su relevancia es acotada pero clara: demuestra que un modelo de menos de 600 millones de parametros, cuantizado a 4 bits (Q4_K_M), puede ejecutarse en hardware embebido de gama muy baja (992 MB de memoria util) manteniendo una precision en la tarea cercana a la del mismo modelo en host (0,740 en placa frente a 0,745 en host). Es util como referencia para quien investigue inferencia en el borde, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_0, Q8_0 (GGUF); safetensors en precision original |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | qwen-research (heredada del modelo base Qwen3-0.6B) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer causal denso de la familia Qwen3. El ajuste fino se realiza sobre el checkpoint `native_n06_ctl/step_1884` y esta especializado en una unica tarea: dado un prompt en indonesio con formato de eleccion multiple de dos opciones (estilo COPA/XCOPA), el modelo puntua la log-probabilidad de la letra de respuesta para seleccionar la opcion correcta. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

Los datos de ajuste fino, segun la model card, incluyen traducciones de e-CARE (licencia MIT) y una replica en indonesio de COPA-train. El autor indica explicitamente que los conjuntos de test de XCOPA y e-CARE nunca se usaron durante el entrenamiento, lo que refuerza la validez de la evaluacion reportada. Se publican ademas dos artefactos de control: un GGUF del modelo base sin ajustar (`qwen3_0.6b_base_Q4_K_M.gguf`) y una version Q4_0 para comparar el comportamiento en el limite de 4 bits.

## Capacidades

- Razonamiento causal en indonesio: seleccion entre dos opciones de causa/efecto en formato de letra, mediante puntuacion por log-probabilidad.
- Evaluacion zero-shot en tareas tipo COPA/XCOPA en indonesio.
- Inferencia on-device: ejecutable con llama.cpp de 32 bits (`armeabi-v7a`) en hardware ARM de gama baja.
- Soporte bilingue limitado a indonesio e ingles (heredado del modelo base).
- No esta disenado como modelo de chat general ni como generador de texto libre fiable.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Evaluacion de razonamiento causal en indonesio: el modelo sirve como banco de pruebas para medir la capacidad de un modelo pequeno de resolver pares causa/efecto en formato COPA/XCOPA, puntuando por log-probabilidad de la letra.
- Investigacion en inferencia en el borde: permite reproducir el estudio original desplegando `gguf/n06ctl_Q4_K_M.gguf` en una placa Allwinner A133 (992 MB utiles) con llama.cpp de 32 bits y medir precision y RSS pico (≈447,5 MB).
- Comparativa de cuantizaciones: los ficheros Q4_K_M, Q4_0 y Q8_0 permiten analizar la degradacion de precision al bajar de bits y el "acantilado" de los 4 bits, usando el GGUF del modelo base como control sin ajustar.
- Docencia y demostraciones de ajuste fino: ejemplo reproducible de como especializar un modelo de 0,6B en una tarea acotada con datos de e-CARE y COPA-train, incluyendo la separacion estricta entre train y test.
- Filtrado o pre-etiquetado de pares causales: en un pipeline de anotacion, el modelo puede pre-puntuar candidatos de relacion causa/efecto en indonesio para revision humana posterior.
- Validacion de pipelines de despliegue movil: util para probar cadenas de conversion a GGUF, carga en memoria y ejecucion en Android 32 bits antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de precision en la tarea de eleccion multiple de letra sobre un flujo emparejado de 400 prompts:

| Entorno | Modelo / cuantizacion | Precision (letra) | RSS pico |
|---|---|---|---|
| Allwinner A133 (32-bit) | n06ctl Q4_K_M | ≈0,740 | ≈447,5 MB |
| Host (gemelo) | n06ctl Q4_K_M | ≈0,745 | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el GGUF Q4_K_M requiere aproximadamente 447,5 MB de RSS pico en inferencia, segun la medicion en placa.
- Cabe en hardware embebido de gama muy baja: placa Allwinner A133 con 1 GB de RAM (992 MB utiles) y Android de 32 bits.
- El GGUF Q8_0 es demasiado grande para la placa de 992 MB y se reserva como techo de referencia en host.
- GPU recomendadas: no disponible; el caso de uso documentado es CPU ARM de 32 bits.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.), aunque no se documentan latencias ni throughput en esas plataformas.
- Opciones de despliegue: llama.cpp (32-bit `armeabi-v7a` para la placa) y transformers para evaluacion en host; no se documenta soporte verificado de vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indo-copa-n06ctl | 596 M | no disponible | Razonamiento causal indonesio (COPA/XCOPA) | qwen-research | Hugging Face (repo propio) |
| Qwen3-0.6B (base) | 596 M | no disponible | Modelo general multilingue | qwen-research | Hugging Face (oficial) |
| Qwen3-0.6B base Q4_K_M (control) | 596 M | no disponible | Control sin ajustar del mismo estudio | qwen-research | Incluido en este repo |

La comparativa relevante es interna al propio repositorio: el modelo ajustado frente al control sin ajustar, ambos en Q4_K_M. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un modelo de chat general en indonesio; su uso fuera de la tarea COPA/XCOPA de dos opciones no esta validado.
- Riesgo de alucinacion elevado si se emplea para generacion de texto libre, dado su tamano (0,6B) y su ajuste a una tarea cerrada.
- Precision en placa de ≈0,740: util como referencia, pero insuficiente para aplicaciones de produccion que exijan alta exactitud.
- Limitacion de contexto e idioma: solo indonesio e ingles; no se documenta la longitud de contexto soportada.
- Licencia qwen-research heredada del modelo base: restringe el uso comercial; es necesario revisar los terminos de Qwen3-0.6B antes de cualquier despliegue productivo.
- El autor advierte que los conjuntos de test de XCOPA y e-CARE no se usaron en entrenamiento; cualquier evaluacion externa debe respetar esa separacion para ser comparable.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jifengzhou/indo-copa-n06ctl
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
