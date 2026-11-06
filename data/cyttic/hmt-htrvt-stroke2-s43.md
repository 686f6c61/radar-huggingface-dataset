# cyttic/hmt-htrvt-stroke2-s43

## Resumen

cyttic/hmt-htrvt-stroke2-s43 es un modelo de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por cyttic dentro de un estudio de aumento de datos denominado htr-metrics-transfer. El modelo emplea una arquitectura de tipo transformer con salida CTC y está especializado en hebreo (código de idioma `he`), por lo que su ámbito de aplicación es la transcripción de documentos manuscritos en esa lengua.

Se trata de un checkpoint experimental de pequeño tamaño: 13.821.574 parámetros y un repositorio de aproximadamente 0,1 GB en formato safetensors. No es un modelo generativo de propósito general, sino un componente especializado de visión y secuencia entrenado para mapear imágenes de texto manuscrito a cadenas de caracteres mediante decodificación greedy.

Su relevancia es acotada pero concreta: forma parte de una serie de experimentos que comparan variantes de aumento de datos (en este caso `stroke2`) con la semilla 43 sobre el conjunto `cyttic/hhd-optionb-split`, y publica métricas de referencia (CER 0,0607 y WER 0,2775) que permiten reproducir y comparar el efecto de cada estrategia de augmentación en tareas HTR sobre hebreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con salida CTC (htrvt) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `htrvt`, un transformer orientado a reconocimiento de texto manuscrito con función de pérdida CTC y decodificación greedy sin modelo de lenguaje. El checkpoint corresponde a la variante de aumento de datos `stroke2` con semilla 43, dentro del estudio `htr-metrics-transfer`, cuyo objetivo es medir la transferencia de métricas entre distintas estrategias de augmentación.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para el conjunto de desarrollo, y la evaluación se hizo sobre el test HHD Option-B. No se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la combinación transformer + CTC y el esquema de aumento `stroke2`.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes de documentos.
- Salida a nivel de carácter mediante CTC, con decodificación greedy.
- Evaluación con métricas estándar de HTR: CER (Character Error Rate) y WER (Word Error Rate).
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al hebreo.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá del HTR.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo transcribe imágenes de documentos históricos o administrativos a texto plano, adecuado por su entrenamiento específico en esa lengua y su salida CTC.
- Indexación y búsqueda de fondos documentales: al convertir manuscritos en texto, permite construir índices de búsqueda sobre colecciones que de otro modo serían inaccesibles.
- Estudio comparativo de aumentación de datos: sirve como checkpoint de referencia (augmentación `stroke2`, semilla 43) para medir el impacto de distintas estrategias de augmentación en HTR.
- Reproducción de experimentos académicos: al publicar `results.json` y métricas concretas, permite replicar el pipeline de evaluación sobre HHD Option-B.
- Preprocesado para pipelines de OCR/HTR híbridos: su salida puede alimentar etapas posteriores de corrección o normalización lingüística en hebreo.
- Evaluación de modelos HTR en producción: sus CER y WER publicados permiten fijar una línea base antes de desplegar sistemas de transcripción más grandes.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| CER (HHD Option-B test, greedy, sin LM) | 0,0607 |
| WER (HHD Option-B test, greedy, sin LM) | 0,2775 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 13,8 M de parámetros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no requiere aceleradores de gama alta.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: carga directa con la librería de transformers o con safetensors; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-htrvt-stroke2-s43 | 13,8 M | no disponible | hebreo | MIT | Hugging Face |
| Otros checkpoints de la serie hmt-htrvt | no disponible | no disponible | hebreo | MIT (presumible) | Hugging Face |
| Modelos HTR genéricos (p. ej. TrOCR) | no disponible en la informacion | no disponible | multilingüe | variable | Hugging Face |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental de investigación: no hay evidencia de validación en producción ni de robustez fuera del dominio HHD Option-B.
- Riesgo de alucinación y errores de transcripción: el CER de 0,0607 y el WER de 0,2775 implican que aproximadamente 1 de cada 16 caracteres y 1 de cada 4 palabras pueden ser incorrectos en el conjunto de test.
- Limitación de idioma: entrenado exclusivamente para hebreo; no se espera un rendimiento aceptable en otras lenguas.
- Sin modelo de lenguaje en decodificación: la salida greedy puede producir palabras no válidas o inconsistencias léxicas.
- Sesgos: no se documentan análisis de sesgo por escritor, estilo o tipo de documento; el conjunto excluye escritores de dev, lo que puede afectar a la generalización.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin información sobre cuantización ni despliegue en entornos de bajos recursos más allá de la carga estándar en safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-stroke2-s43
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo (referenciado en la model card)
