# Reza2kn/negara-g2p-clean-v7.1

## Resumen

Negara G2P v7.1 es un modelo de conversión de grafema a fonema (G2P) para persa, desarrollado por Reza2kn como frontend fonético del sistema de síntesis de voz Gouya. Se trata de una versión de refinamiento sobre el checkpoint completo de Negara v7, al que se le añade una capa de reparación léxica de coincidencia exacta, construida a partir de 470 votos humanos revisados y con Gemini 3.6 Flash como señal de acuerdo conservadora. El objetivo es corregir errores puntuales de pronunciación sin alterar el comportamiento general del modelo base.

El modelo está basado en una arquitectura T5 (texto a texto) con aproximadamente 8 millones de parámetros, lo que lo hace extremadamente ligero y adecuado para integración en pipelines de TTS en tiempo real. La versión v7.1 no es un reentrenamiento completo, sino un overlay de reglas léxicas exactas que se aplica sobre las salidas de v7, preservando la salida original cuando no hay coincidencia. Está pensado exclusivamente para persa y se distribuye en formato safetensors con licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (seq2seq) |
| Parametros totales | 8.067.456 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fa (persa) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un T5 de tamaño muy reducido (8M parámetros) entrenado para la tarea de grafema a fonema en persa. La versión v7.1 añade una capa de reparación compuesta por 29 reglas léxicas de coincidencia exacta aprendidas exclusivamente de votos humanos, más 6 reglas canónicas de pronunciación revisada explícitamente. Estas reglas solo se aplican cuando la palabra superficial persa y la salida fonética cruda de v7 coinciden exactamente con un par alineado presente en `overlay.json`; en caso contrario, se conserva la salida original de v7.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El proceso de refinamiento se basó en votos humanos (470 en total) y en el uso de Gemini 3.6 Flash como señal de acuerdo, pero solo para confirmar coincidencias exactas, no para generar reglas amplias. La evaluación se realizó mediante validación cruzada de cinco pliegues con registros disjuntos, y cada regla aprendida excluye las etiquetas de su pliegue de validación.

## Capacidades

- Conversión de grafema a fonema (G2P) para persa, produciendo transcripciones fonéticas normalizadas.
- Reparación léxica de precisión: corrige pronunciaciones específicas sin alterar el resto del vocabulario.
- Preservación de la salida base: si no hay coincidencia exacta, devuelve la salida de v7 sin cambios.
- Integración directa con Transformers mediante `AutoModelForSeq2SeqLM.from_pretrained()`.
- Adecuado para frontend de síntesis de voz (TTS), como el usado en Gouya.
- Soporte de texto persa con signos de puntuación y expresiones coloquiales (ej. "سلام الاغ عزیز حالت چطوره؟").

## Casos de uso

- Frontend fonético para sistemas TTS en persa: el modelo convierte texto persa arbitrario en una representación fonética que puede alimentar un vocoder o un modelo acústico, garantizando pronunciaciones correctas en palabras comunes.
- Normalización de pronunciación en asistentes de voz: integrado en un pipeline de diálogo, permite que el asistente pronuncie correctamente nombres, saludos y frases coloquiales persas.
- Corrección de errores en sistemas G2P existentes: el overlay de reglas exactas puede aplicarse sobre la salida de otros modelos para corregir casos concretos sin reentrenar.
- Generación de datos de entrenamiento para TTS: dado un corpus de texto persa, el modelo produce transcripciones fonéticas que pueden usarse para entrenar modelos acústicos.
- Evaluación de calidad fonética: al ser un modelo pequeño y rápido, puede usarse en pruebas automatizadas para verificar la pronunciación de frases específicas en aplicaciones de voz.
- Investigación en fonología computacional del persa: el modelo y su overlay documentan reglas léxicas revisadas por humanos, útiles para estudiar la variación fonética y la corrección de errores en G2P.

## Benchmarks y rendimiento

La model card incluye una evaluación de validación cruzada (out-of-fold) comparando la versión v7.1 con la línea base v7:

| Metrica | v7 baseline | v7.1 overlay |
|---|---:|---:|
| Aciertos exactos de fonemas | 190 / 291 | 195 / 291 |
| Correcciones exactas | 0 / 101 | 7 / 101 |
| Cambios erroneos en fonemas conservados por humanos | 0 / 190 | 2 / 190 |

Estos resultados indican una mejora modesta pero orientada a precisión: se corrigen 7 errores adicionales a costa de introducir 2 cambios no deseados. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que el modelo no está diseñado para tareas de razonamiento general.

## Requisitos de hardware

- Al tratarse de un modelo T5 de solo 8M de parámetros, la inferencia es viable en CPU sin GPU.
- VRAM estimada: inferior a 1 GB en cualquier cuantizacion, aunque no se han publicado datos oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050, RTX 3050) o incluso integradas.
- Es ejecutable en entornos de produccion con recursos limitados, como funciones serverless o contenedores pequeños.
- Opciones de despliegue: Transformers (PyTorch), potencialmente compatible con TGI o vLLM, aunque no se menciona soporte explicito.
- Latencia y throughput: no disponibles, pero por el tamano del modelo se espera una latencia de milisegundos en CPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El modelo es altamente especializado (G2P persa) y no se han encontrado alternativas de la misma categoria en los resultados de busqueda. Se indica "no disponible".

## Limitaciones y advertencias

- Las reglas de reparacion son de coincidencia exacta y no generalizan a inflexiones o palabras no vistas; palabras fuera del vocabulario cubierto conservan la salida de v7.
- La licencia no esta especificada, por lo que el uso comercial puede presentar incertidumbre legal.
- El modelo solo soporta persa; no es util para otros idiomas.
- La evaluacion muestra 2 cambios erroneos sobre 190 fonemas conservados, lo que implica un pequeno riesgo de regresion en ciertas palabras.
- No se han publicado datos sobre sesgos o alucinaciones; al ser un modelo G2P, el riesgo de alucinacion es bajo pero no nulo en entradas malformadas.
- La dependencia de Gemini 3.6 Flash como señal de acuerdo puede generar problemas de reproducibilidad si el modelo externo cambia.

## Enlaces

- [Modelo en HuggingFace: Reza2kn/negara-g2p-clean-v7.1](https://huggingface.co/Reza2kn/negara-g2p-clean-v7.1)
- [Modelo base: Reza2kn/negara-g2p-clean-v7](https://huggingface.co/Reza2kn/negara-g2p-clean-v7)
- [Version anterior: Reza2kn/negara-g2p-clean-v2](https://huggingface.co/Reza2kn/negara-g2p-clean-v2)
- [Perfil de GitHub del autor: Reza2kn](https://github.com/Reza2kn)
- [Modelo relacionado de Gouya: PersianML/gooya-0.1](https://huggingface.co/PersianML/gooya-0.1)
