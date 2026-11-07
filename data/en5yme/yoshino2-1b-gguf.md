# en5yme/Yoshino2-1B-GGUF

## Resumen

Yoshino2 1B es un modelo de razonamiento de pequeno tamano (1.080.632.832 parametros) desarrollado por el usuario en5yme y publicado en Hugging Face. Se trata de un fine-tune de MiniCPM5 1B, el modelo de OpenBMB, al que se le ha destilado el estilo de razonamiento de Nemotron Lightning 30B A3B (un modelo MoE de 30B parametros totales y 3B activos) mediante un conjunto de datos sintetico. El objetivo declarado es mejorar la capacidad de razonamiento del modelo base y llevar inteligencia de mayor escala a dispositivos de borde (edge).

La version aqui descrita es la cuantizacion GGUF del modelo original `en5yme/Yoshino2-1B`, publicada el 7 de noviembre de 2026. El repositorio ocupa 8,3 GB, lo que sugiere que incluye multiples niveles de cuantizacion ademas de los pesos en precision completa. El modelo esta etiquetado como compatible con endpoints, conversacional y orientado a razonamiento y destilacion.

Es relevante ahora porque ejemplifica una tendencia creciente: la destilacion de modelos grandes (30B MoE) hacia arquitecturas pequenas (1B) para su despliegue en hardware de consumo y entornos de borde. No obstante, el propio autor advierte que no es un modelo de frontera listo para produccion, sino un experimento a pequena escala destinado a uso experimental y personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5 1B, de OpenBMB) |
| Parametros totales | 1.080.632.832 (aprox. 1,08B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (para el fine-tune); el modelo base conserva Apache 2.0 |
| Formato de pesos | GGUF (repo GGUF); el modelo original en `en5yme/Yoshino2-1B` presumiblemente en safetensors (no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura MiniCPM5 1B de OpenBMB, un transformer denso de aproximadamente 1,08B parametros. Sobre esa base se aplico un proceso de destilacion del estilo de razonamiento de Nemotron Lightning 30B A3B, un modelo MoE de 30B parametros totales y 3B activos. El resultado, segun el autor, es que el modelo ha adoptado el estilo de razonamiento y de salida del profesor, con mejoras en los benchmarks respecto al base.

El entrenamiento se realizo con un dataset sintetico de 10.817 pares pregunta/respuesta (aproximadamente 135 MB), generado mediante un mecanismo de auto-prompt y un framework de destilacion propio. El dataset incluye tanto muestras one-shot como muestras de contexto profundo con 4 prompts. Sobre ese CSV se aplico SFT con Unsloth, 3 epochs de LoRA. No se documentan datos sobre RLHF, DPO ni detalles adicionales de la composicion del dataset.

## Capacidades

- Generacion de texto conversacional y razonamiento general, con estilo de salida heredado del modelo profesor.
- Razonamiento multi-paso orientado a tareas de tipo reasoning (el modelo esta etiquetado como `reasoning`).
- Capacidades multilingues limitadas al ingles segun los metadatos (`language: en`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, vision, audio ni modos de pensamiento explicitos en la informacion disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en dispositivos de borde: el modelo, con ~1,08B parametros, puede ejecutarse en hardware modesto y servir como base para experimentar con dialogos multi-turno en ingles.
- Investigacion en destilacion de razonamiento: util para estudiar como el estilo de un modelo MoE grande (Nemotron Lightning 30B A3B) se transfiere a una arquitectura densa pequena mediante SFT con LoRA.
- Evaluacion de pipelines GGUF: sirve como banco de pruebas para medir latencia y calidad de cuantizaciones GGUF en entornos de consumo.
- Generacion de texto experimental offline: al ser un modelo pequeno en formato GGUF, puede integrarse en aplicaciones locales que requieran generacion de texto sin conexion.
- Educacion y demos de razonamiento: adecuado para demostrar tecnicas de razonamiento paso a paso en entornos academicos o talleres.
- Base para fine-tunes posteriores: dado su tamano reducido y licencia MIT, puede servir como punto de partida para ajustes especificos en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor (tareas `tiny`, metrica acc_norm salvo donde se indica):

| Tarea | Yoshino2 1B | MiniCPM5 1B |
|---|---|---|
| tinyArc (25-shot) | 0,4221 | 0,4278 |
| tinyHellaSwag (10-shot) | 0,5092 | 0,5038 |
| tinyMMLU (0-shot) | 0,5143 | 0,4897 |
| tinyTruthfulQA (0-shot, acc) | 0,4362 | 0,4199 |

El fine-tune mejora en HellaSwag, MMLU y TruthfulQA, y empeora ligeramente en ARC respecto al base. No se publican resultados en benchmarks estandar de mayor tamano (MMLU completo, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma detallada; con ~1,08B parametros, las cuantizaciones GGUF tipicas (Q4, Q5, Q8) ocuparian del orden de 0,6 a 1,2 GB, aunque los niveles concretos del repo no se especifican.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo es apto para GPUs de consumo.
- Cabe en GPU de consumo: si, por el tamano del modelo (~1B), es esperable que quepa en GPUs consumer, aunque no se confirman modelos concretos.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el tag `endpoints_compatible` sugiere despliegue via endpoints de Hugging Face. No se confirma compatibilidad con vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2 1B (este) | ~1,08B | no disponible | MIT (fine-tune) / Apache 2.0 (base) | GGUF | Destilado de Nemotron Lightning 30B A3B |
| MiniCPM5 1B | ~1B | no disponible | Apache 2.0 | no disponible | Modelo base de OpenBMB |
| Yoshino-0.8B | ~0,8B | no disponible | no disponible | GGUF | Otro modelo del mismo autor, menor tamano |

No se dispone de datos de rendimiento comparables mas alla de los benchmarks tiny recogidos en la seccion anterior. Para alternativas de la misma categoria (modelos densos de ~1B para razonamiento), la informacion disponible no permite una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El autor declara explicitamente que no es un modelo de frontera listo para produccion, sino un experimento a pequena escala para uso experimental y personal.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Riesgo de alucinacion inherente a modelos pequenos destilados; los resultados en tinyTruthfulQA (0,4362) indican margen de mejora en veracidad.
- Los benchmarks publicados son de tareas `tiny` con pocas muestras, por lo que su validez es limitada y no reflejan rendimiento en tareas reales de mayor complejidad.
- Ambiguedad de licencia: el fine-tune se publica bajo MIT, pero el modelo base (MiniCPM5 1B) conserva Apache 2.0; el autor senala que el repositorio original del base carecia de archivo de licencia, lo que puede generar incertidumbre en el cumplimiento downstream.
- No se documentan sesgos conocidos ni detalles de contexto maximo; conviene validar el comportamiento en produccion antes de cualquier uso real.
- El repo GGUF ocupa 8,3 GB, lo que implica varias cuantizaciones; el nivel concreto a usar debe verificarse en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/en5yme/Yoshino2-1B-GGUF
- Modelo base del fine-tune: https://huggingface.co/en5yme/Yoshino2-1B
- Perfil del autor: https://huggingface.co/en5yme
- Modelos del autor: https://huggingface.co/en5yme/models
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-Lightning-30B-A3B-Distill
