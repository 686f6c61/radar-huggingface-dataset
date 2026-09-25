# budget-internalization-iclr2027/qwen3.5-4b-16k-sft-meetwombat-s79

## Resumen

`qwen3.5-4b-16k-sft-meetwombat-s79` es un ajuste supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario `budget-internalization-iclr2027` como parte de un envío anónimo a ICLR 2027. El entrenamiento se realizó sobre soluciones autogeneradas por el propio Qwen3.5-4B a problemas del conjunto DeepScaleR, filtradas por corrección (rejection-sampling fine-tuning, RFT) y restringidas al subconjunto de respuestas largas de entre 10.000 y 16.000 tokens. El checkpoint corresponde al paso 79 del run con nombre en clave `meetwombat`.

El modelo resuelve un problema muy concreto de investigación: estudiar cómo un modelo de razonamiento internaliza un presupuesto de tokens largo y si esa capacidad se puede inducir mediante SFT sobre trayectorias de cadena de pensamiento extensas. No es un modelo de propósito general, sino una pieza experimental orientada a matemáticas de competición en inglés, con una plantilla de prompt muy específica que exige razonamiento paso a paso y la respuesta final dentro de etiquetas `\boxed{}`.

Con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y pesos en BF16 en formato safetensors, es un modelo de tamaño medio que cabe en GPU de consumo con cuantización. La licencia es Apache 2.0, heredada del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; derivada de Qwen/Qwen3.5-4B. La etiqueta de pipeline es `image-text-to-text`, pero la model card no describe componentes de visión ni la arquitectura interna |
| Parametros totales | 4.539.265.536 (4,54 mil millones), segun el recuento real de safetensors |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base. La longitud maxima de secuencia usada en el entrenamiento fue de 18.432 tokens |
| Tipos de cuantizacion | No se publican versiones cuantizadas oficiales. Los pesos del repositorio estan en BF16. Al ser compatible con `transformers` y `vLLM`, se pueden aplicar cuantizaciones de terceros (bitsandbytes, AWQ, GPTQ) o convertir a GGUF |
| Idiomas soportados | No declarados en la model card. Los datos de entrenamiento (DeepScaleR) estan en ingles |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 9,1 GB |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo base Qwen/Qwen3.5-4B, mas alla de que se carga mediante `AutoModelForCausalLM` y `AutoTokenizer`, lo que implica un transformer decoder autorregresivo con cabeza de lenguaje causal. La etiqueta `image-text-to-text` sugiere una posible entrada multimodal, pero la ficha del autor no menciona ningún codificador de visión ni tareas de imagen, por lo que esa capacidad no debe darse por confirmada.

El entrenamiento es un SFT estándar con pérdida de siguiente token aplicada únicamente sobre la respuesta. Los datos son soluciones generadas por el propio Qwen3.5-4B a problemas de `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por corrección (rejection sampling) y restringidas a respuestas de entre 10.000 y 16.000 tokens, una solución por problema. Los hiperparámetros son: longitud máxima de secuencia 18.432, batch de 32 secuencias por paso, optimizador Adam con schedule de learning rate coseno y pico de 1e-6, una sola época y 79 pasos totales. No se reporta RLHF ni DPO posterior. La plantilla de prompt es fija: instrucción de razonar paso a paso, respuesta final dentro de `\boxed{}` y cierre con la frase "Let's think step-by-step".

La innovación relevante no está en la arquitectura sino en el procedimiento: se entrena al modelo sobre sus propias trazas largas ya validadas, lo que permite estudiar la internalización de un presupuesto de tokens concreto (10k-16k) sin necesidad de anotación humana.

## Capacidades

- Generación de razonamiento matemático de cadena larga, con respuestas de 10.000 a 16.000 tokens, el rango exacto sobre el que se entrenó.
- Resolución de problemas de matemáticas de competición en inglés, derivados del conjunto DeepScaleR.
- Producción de respuestas finales delimitadas con `\boxed{}`, lo que facilita el parseo automático de la solución.
- Seguimiento de la plantilla conversacional del modelo base (`chat template` de Qwen3.5), con soporte de conversaciones multi-turno a nivel de formato.
- Modo de razonamiento explícito paso a paso inducido por el prompt de entrenamiento.
- Capacidades multimodales: no confirmadas. La etiqueta de pipeline es `image-text-to-text`, pero la model card no documenta ninguna.
- Tool calling / function calling: no documentado.
- Uso como agente o razonamiento multi-paso con herramientas: no documentado.
- Capacidades multilingües: no documentadas; los datos de entrenamiento están en inglés.

## Casos de uso

- Generación de trazas de razonamiento largas para destilación: el modelo produce cadenas de 10k-16k tokens ya filtradas por corrección durante el entrenamiento, por lo que sirve como generador de datos sintéticos para entrenar modelos más pequeños en tareas de matemáticas.
- Investigación sobre presupuesto de tokens: es el artefacto central de un estudio sobre internalización del presupuesto de tokens; permite comparar el comportamiento en respuestas largas frente al modelo base sin ajustar.
- Reproducción de experimentos de RFT: al publicarse junto a un envío a ICLR 2027, sirve para replicar el pipeline de rejection-sampling fine-tuning con hiperparámetros documentados.
- Evaluación de calidad de soluciones matemáticas: útil para medir tasas de acierto en problemas de DeepScaleR y comparar con el checkpoint base o con otros pasos del mismo run.
- Tutoría matemática con explicaciones extensas: el modelo está entrenado para detallar cada paso, lo que encaja en escenarios donde se prima la explicación pedagógica larga sobre la brevedad.
- Extracción estructurada de respuestas: el formato `\boxed{}` permite integrarlo en pipelines que necesitan aislar el resultado final de un razonamiento largo mediante expresiones regulares.
- Estudio de sobreajuste al formato de prompt: permite analizar cómo varía el rendimiento al modificar la plantilla de entrada, dado lo específico del prompt de entrenamiento.
- Base para un ajuste posterior específico de dominio: a partir de este checkpoint se puede continuar el entrenamiento con SFT o preferencias sobre un corpus propio, partiendo de un modelo ya acostumbrado a cadenas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, GSM8K, MATH, HumanEval ni ninguna otra evaluación, y las búsquedas web realizadas no devolvieron documentación técnica asociada al modelo (los resultados obtenidos corresponden a páginas sobre presupuestos públicos franceses, sin relación con el modelo).

## Requisitos de hardware

- Pesos en BF16: aproximadamente 9,1 GB, cifra que coincide con el tamaño del repositorio.
- VRAM estimada para inferencia en BF16 con contexto largo (16k-18k tokens): del orden de 20-24 GB contando cache KV y overhead del runtime. Es una estimación a partir del número de parámetros, no una cifra verificada, ya que no se publican configuraciones de capas ni cabezas de atención.
- GPU recomendadas: A100 40 GB o 80 GB y H100 80 GB para BF16 con contexto completo sin problemas; RTX 4090 o RTX 3090 (24 GB) quedan al límite en BF16 con contexto largo.
- GPU de consumo con 16 GB: no cabría en BF16 con contexto largo; requeriría cuantización a 8 bits (aproximadamente 4,5 GB de pesos) o 4 bits (aproximadamente 2,4 GB), que no se distribuyen oficialmente y habría que generar.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`, y `vLLM` mediante `vllm serve budget-internalization-iclr2027/qwen3.5-4b-16k-sft-meetwombat-s79`. TGI o llama.cpp serían viables solo tras conversión y cuantización propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de especificaciones verificadas de otros checkpoints de la misma familia o de alternativas equivalentes en el material consultado.

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-16k-sft-meetwombat-s79 | 4,54 mil millones | No disponible (entrenado con secuencias de hasta 18.432 tokens) | SFT sobre soluciones propias filtradas por corrección, respuestas de 10k-16k tokens, 79 pasos | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B | No disponible en la informacion proporcionada | No disponible | Modelo base multimodal declarado (`image-text-to-text`) | Apache 2.0 (heredada por el ajuste) | HuggingFace |
| Otras alternativas de ~4B para razonamiento matematico | No disponibles | No disponibles | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción: procede de un envío anónimo a conferencia, no tiene mantenimiento declarado y acumula 0 descargas.
- No hay benchmarks publicados, por lo que su rendimiento real frente al modelo base o a alternativas es desconocido.
- Especialización estrecha: el entrenamiento se limita a problemas de matemáticas de DeepScaleR en inglés, con una única época y 79 pasos. Fuera de ese dominio el comportamiento no está caracterizado.
- Dependencia fuerte del formato de prompt. La plantilla incluye la instrucción de razonar paso a paso, la exigencia de `\boxed{}` y la frase "Let's think step-by-step". Desviarse de ella puede degradar la calidad de la respuesta.
- Sesgo de longitud: el modelo fue ajustado exclusivamente sobre respuestas de 10.000 a 16.000 tokens, por lo que puede generar trazas innecesariamente largas en problemas simples y consumir mucho presupuesto de contexto.
- Riesgo de alucinación matemática: como cualquier modelo generativo, puede producir cadenas de razonamiento plausibles con un resultado final incorrecto. El filtrado por corrección se aplicó a los datos de entrenamiento, no a las salidas en inferencia.
- Idiomas no declarados: no hay garantía de un comportamiento correcto en castellano ni en otros idiomas distintos del inglés de los datos de entrenamiento.
- Capacidades de visión no confirmadas: aunque la etiqueta de pipeline sea `image-text-to-text`, la model card no documenta procesamiento de imágenes; no debe asumirse.
- Sin alineación de seguridad adicional reportada: no se menciona RLHF ni DPO, solo SFT sobre datos matemáticos, por lo que no hay filtrado explícito de contenido dañino.
- Licencia Apache 2.0, heredada del modelo base, permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a generarlos si se quiere desplegar en hardware limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-16k-sft-meetwombat-s79
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper, blog o repositorio del proyecto: no disponible en la informacion proporcionada. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo; los enlaces obtenidos (budget.gouv.fr, budget.fr, dettedelafrance.fr, francebudget.fr) corresponden a paginas sobre el presupuesto del Estado frances y no guardan relacion con este modelo.
