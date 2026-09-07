# emese-tech/patak-gguf

## Resumen

Patak es un modelo de lenguaje instructivo centrado en el húngaro, desarrollado por el proyecto Emese (emese-tech). Se parte de la arquitectura del modelo base EuroLLM-9B de utter-project y se aplica un proceso de entrenamiento que combina preentrenamiento continuado (CPT), ajuste supervisado (SFT) y optimización por preferencias (DPO). El resultado es un modelo con 9.152.319.488 parámetros (9,15B), una ventana de contexto de 32.768 tokens y licencia Apache-2.0.

Este repositorio concreto (`emese-tech/patak-gguf`) contiene una versión cuantizada en formato GGUF con la cuantización Q4_K_M, lista para ejecutarse en `llama.cpp`, `llama-server`, Ollama o cualquier cargador compatible con GGUF. El modelo está pensado para tareas de generación de texto en húngaro, con especial rendimiento en lectura, traducción, seguridad y generación de código, aunque presenta debilidades en matemáticas multi-paso y en tareas de formato con múltiples restricciones. Su relevancia radica en ofrecer una alternativa ligera y desplegable para aplicaciones productivas en húngaro, con un contexto largo y una licencia permisiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en EuroLLM-9B) |
| Parametros totales | 9.152.319.488 (9,15B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (archivo principal); Q8_0 mencionado en benchmarks |
| Idiomas soportados | hu (húngaro) como idioma principal; otros idiomas heredados de EuroLLM-9B |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo Patak se construye a partir del modelo base EuroLLM-9B, un transformer denso de 9.150 millones de parámetros. Sobre esta base se aplica un proceso de entrenamiento en tres fases, documentado en el repositorio `patak/` y aquí resumido: preentrenamiento continuado (CPT) con 5,1 millones de tokens y 5.000 iteraciones, ajuste supervisado (SFT) sobre el dataset `instruct_v18b` durante una época con parámetros LoRA (rank 16, scale 32, learning rate 1,5e-5) y optimización por preferencias (DPO) con 36 pares alfa y 120 iteraciones (rank 16, scale 32, learning rate 5e-6). Esta variante GGUF no es un entrenamiento adicional: se deriva de la recuantización del artefacto nativo en MLX q8.

Una innovación técnica destacable es la corrección del tokenizer. La exportación estándar con `convert_hf_to_gguf.py` tipa incorrectamente los tokens de control ChatML (`<|im_start|>`, `<|im_end|>`) como `NORMAL` en lugar de `CONTROL`, lo que provoca que se fragmenten en múltiples sub-tokens y degrada gravemente la calidad de salida. El script `scripts/fix_gguf_tokenizer.py` corrige esta información, además de los BPE merge scores y un flag de espacio inicial. Este archivo GGUF ya incluye dicha corrección, verificada contra la tokenización de referencia (HF/MLX). Es imprescindible re-aplicar el script si se regenera el GGUF desde los pesos originales.

## Capacidades

- Generación de texto e instrucciones: modelo instructivo entrenado con la plantilla ChatML, compatible con el formato de conversación multi-turno.
- Contexto largo: ventana de 32.768 tokens, apta para documentos extensos y conversaciones prolongadas.
- Traducción: el benchmark interno `emese-bench v1` reporta un rendimiento casi perfecto en tareas de traducción.
- Generación de código: buen desempeño en tareas de programación, según el mismo benchmark.
- Seguridad y alineación: puntuación alta en prompts de seguridad evaluados en `emese-bench v1`.
- Razonamiento limitado: el modelo es capaz de seguir instrucciones, pero tiene debilidades notables en matemáticas multi-paso, estimación espacial y cumplimiento de formatos con múltiples restricciones.
- Tool calling / function calling: no se menciona soporte explícito en la documentación disponible.
- Agentes y razonamiento multi-paso: no se documenta capacidad específica para agentes.
- Multilingüe: el idioma principal es el húngaro; la calidad en otras lenguas se hereda de EuroLLM-9B y puede ser inferior.
- Visión y audio: no soportados, el pipeline es exclusivamente de generación de texto.

## Casos de uso

- Atención al cliente automatizada en húngaro: gracias a la plantilla ChatML y a la ventana de 32.768 tokens, el modelo puede gestionar conversaciones multi-turno con historial extenso, manteniendo coherencia y contexto. Se despliega fácilmente con `llama-server` o Ollama.
- Traducción húngaro <-> otras lenguas: con un rendimiento casi perfecto en traducción según el benchmark interno, puede integrarse en servicios de traducción para textos, documentos o interfaces web.
- Asistente de programación en húngaro: la generación de código es sólida. Un desarrollador húngaro puede recibir explicaciones, funciones o refactorizaciones en su idioma nativo, usando el modelo como asistente en un IDE o CLI.
- Análisis de documentos legales o administrativos: la ventana de contexto de 32k permite resumir y extraer información de contratos, expedientes o legislación húngara. Es adecuado para pipelines de RAG con documentos largos.
- Sistema de preguntas y respuestas sobre cultura o historia húngara: puede responder cuestiones factuales en húngaro. Debe usarse con verificación externa, ya que es propenso a alucinar detalles biográficos.
- Generación de material educativo en húngaro: permite crear ejercicios, explicaciones y pruebas para estudiantes. Su formato instructivo facilita la adaptación a distintos niveles.
- Automatización de correos e informes internos: redacción de comunicaciones, actas y reportes en húngaro con formato ChatML. Su licencia Apache-2.0 permite incorporarlo en flujos de trabajo empresariales.
- Adaptación por fine-tuning: al ser un modelo abierto con licencia permisiva, puede afinarse sobre dominios específicos (jurídico, médico, técnico) para mejorar la precisión en tareas internas.

## Benchmarks y rendimiento

Los resultados del benchmark interno `emese-bench v1` se presentan comparando las distintas variantes del modelo:

| Variante | Puntuación emese-bench v1 |
|---|---|
| Patak MLX q8 (original) | 413/500 (83%) |
| Patak Q8_0 (GGUF con tokenizer fix) | 391/500 (78%) |
| Patak Q4_K_M (este repo, con tokenizer fix) | 384/500 (77%) |

En cuanto al análisis por categorías, el Q4_K_M con el tokenizer corregido muestra fortalezas casi perfectas en lectura, traducción, seguridad y código, y no se detectaron fugas de los tokens de control `<|im_start|>` o `<|im_end|>`. Las mayores debilidades se concentran en matemáticas multi-paso y en el cumplimiento estricto de formatos con varias restricciones (orden alfabético, conteo exacto de palabras, letras prohibidas). Además de esto, se observó un artefacto residual menor y distinto al problema del tokenizer: en algunas completions, el modelo emite una continuación literal de la etiqueta `user`, lo que se atribuye a un problema de sincronización en la condición de parada y no a la tokenización.

No se dispone de resultados de benchmarks externos (MMLU, HumanEval, GSM8K) en la documentación facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa unos 5,2 GB en disco. Con contexto corto (2k-4k tokens), la VRAM necesaria se sitúa aproximadamente entre 6 y 8 GB. Para contexto largo (32k), la KV cache aumenta considerablemente; se estima que harán falta al menos 16 GB, aunque no se han publicado cifras oficiales.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para uso local con contexto moderado. Para explotar la ventana completa de 32k se recomienda una RTX 4090 24 GB. En despliegues de producción concurrente, A100 o H100.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en una RTX 3060 de 12 GB con cuantización Q4_K_M y contexto reducido.
- Opciones de despliegue: `llama.cpp`, `llama-server`, `llama-cli`, Ollama, LM Studio y cualquier cargador compatible con formato GGUF.
- Latencia y throughput: no disponible en la documentación proporcionada.

## Comparativa con modelos similares

No se ha encontrado información sobre modelos comparables en los datos facilitados. Las únicas comparativas documentadas son entre variantes del propio modelo (MLX q8, Q8_0 y Q4_K_M), que se recogen en la sección de benchmarks. El modelo base EuroLLM-9B no se considera una alternativa equivalente, ya que Patak incorpora el proceso CPT/SFT/DPO.

## Limitaciones y advertencias

- Alucinaciones factuales: el modelo puede inventar fechas, atribuciones y detalles biográficos. En concreto, dos preguntas del benchmark sobre científicos húngaros ficticios u oscuros generan biografías fabricadas con total confianza en todas las variantes evaluadas.
- Riesgo de alucinación en tareas de razonamiento: es débil en matemáticas multi-paso, estimación espacial y cumplimiento de formatos con múltiples restricciones.
- Limitaciones de idioma: está orientado al húngaro. En otros idiomas, la calidad es heredada de EuroLLM-9B y puede degradarse.
- Artefacto residual en la generación: ocasionalmente la respuesta incluye una continuación literal de la etiqueta `user`, asociada a un problema de stop-condition. No es un fallo del tokenizer, pero puede afectar a la salida en producción.
- Sensibilidad a la regeneración del tokenizer: si se regenera el GGUF con el script estándar sin aplicar la corrección, el modelo se comporta de forma severamente degradada. Este archivo concreto ya está corregido.
- Sesgos conocidos: no se documentan sesgos específicos más allá de las alucinaciones factuales. Al estar entrenado principalmente en húngaro, su representación de otras culturas o contextos puede ser limitada.
- Licencia: Apache-2.0 permite uso comercial, pero es responsabilidad del usuario cumplir los términos y verificar el contenido generado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/emese-tech/patak-gguf
- Página del proyecto: https://emese.tech/patak
- Modelo base: https://huggingface.co/utter-project/EuroLLM-9B
- Organización en Hugging Face: https://huggingface.co/emese-tech
