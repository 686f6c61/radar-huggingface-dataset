# AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_cap_b1000_s0

## Resumen

Este modelo es un ajuste fino (fine-tune) completo del modelo base `marin-community/marin-8b-base`, realizado por el usuario AmberYifan. El nombre del repositorio indica que está especializado en el dominio financiero, con referencias a los datasets `fincot` y `finqa` (preguntas y respuestas sobre finanzas). Se ha entrenado sobre un conjunto de datos denominado `capsd_marin-8b-base-n6000-finance-fincot-finqa-clean6k__mix_finance_cap_b1000_s0`, con 6000 ejemplos limpios según se desprende del nombre.

El modelo tiene 8.030.261.248 parámetros (aproximadamente 8B), lo que lo sitúa en la gama de modelos medianos que pueden ejecutarse en GPUs de consumo con cuantización. La arquitectura concreta no está documentada en la ficha, aunque al derivar de `marin-8b-base` es probable que siga un diseño transformer similar a Llama, pero no se puede confirmar con los datos disponibles. La licencia es `other`, sin especificar condiciones, lo que obliga a revisar los términos del modelo base antes de cualquier uso comercial.

La relevancia de este modelo radica en su posible aplicación a tareas de procesamiento de lenguaje natural financiero, como extracción de información, respuesta a preguntas sobre informes o análisis de sentimiento. Sin embargo, la ausencia de documentación técnica detallada y de resultados de evaluación limita su adopción inmediata en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de `marin-community/marin-8b-base`) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponibles |
| Licencia | other (sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (`full` fine-tuning) del modelo base `marin-community/marin-8b-base`, realizado con la librería `transformers` y el framework `llama-factory`. Según los hiperparámetros declarados, el entrenamiento se realizó durante 1 época con un learning rate de 1e-5, un tamaño de lote efectivo de 64 (batch de 2 con acumulación de gradientes de 8 en 4 GPUs) y un scheduler de tipo cosine con un warmup del 3% de los pasos. Se usó el optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8.

No se proporciona información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset, más allá de que el nombre sugiere una mezcla de datos financieros (`finance`, `fincot`, `finqa`) con 6000 ejemplos limpios. Tampoco se documentan técnicas como RLHF, DPO o decodificación especulativa. La ausencia de una descripción técnica del modelo base impide conocer detalles arquitectónicos como el número de capas, cabezas de atención o la función de activación.

## Capacidades

- Generación de texto: al ser un modelo de tipo `text-generation`, puede producir texto coherente en el dominio en el que fue entrenado.
- Especialización financiera: el nombre del dataset sugiere que el modelo ha sido ajustado para tareas de preguntas y respuestas sobre finanzas (finqa) y posiblemente para otros dominios financieros (fincot).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües o modos especiales (vision, audio, thinking).

## Casos de uso

Dado que no se ha publicado documentación detallada, los siguientes casos de uso son inferencias razonables basadas en el dominio del dataset, pero deben validarse con pruebas propias:

- Respuesta a preguntas sobre documentos financieros: el modelo podría emplearse para extraer información de informes anuales, estados de resultados o balances, respondiendo a consultas concretas en lenguaje natural.
- Análisis de sentimiento financiero: dado el ajuste en datos financieros, podría clasificar noticias o comunicados de prensa como positivos, negativos o neutros.
- Asistencia en la elaboración de resúmenes ejecutivos: generación de resúmenes de largos documentos financieros, aprovechando la ventana de contexto del modelo base (desconocida).
- Chatbots de atención al cliente en banca: integración en sistemas de soporte para responder consultas sobre productos financieros, siempre que se valide la precisión.
- Extracción de entidades financieras: identificación de nombres de empresas, tickers, montos y fechas en textos no estructurados.
- Generación de informes de cumplimiento normativo: redacción de borradores de informes regulatorios a partir de datos estructurados, aunque requeriría supervisión humana.

Es importante señalar que, sin benchmarks publicados ni documentación de rendimiento, estos casos de uso son hipotéticos y requieren evaluación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `results` del modelo-index está vacío, por lo que no es posible comparar el rendimiento con otros modelos. Se recomienda ejecutar evaluaciones propias en tareas financieras antes de considerar su uso en producción.

## Requisitos de hardware

- El repositorio pesa 16.1 GB, lo que corresponde aproximadamente a pesos en fp16 para 8B parámetros.
- Para inferencia en fp16 se necesitan al menos 16 GB de VRAM, lo que permite ejecutarlo en una GPU como RTX 4090 (24 GB) o A100 (40/80 GB).
- Con cuantización de 4 bits (por ejemplo, mediante bitsandbytes o GGUF), el modelo podría caber en GPUs con 8-10 GB de VRAM, como RTX 3080 o RTX 4070.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se genere el formato adecuado (GGUF, AWQ, etc.), ya que el repositorio solo contiene safetensors.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo es un fine-tune de `marin-community/marin-8b-base`, pero no se conocen las características de este modelo base (arquitectura, contexto, rendimiento). Tampoco se dispone de otros modelos financieros de 8B con los que comparar directamente en esta ficha. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay descripción de capacidades, limitaciones ni datos de entrenamiento más allá de los hiperparámetros.
- Sin resultados de evaluación: no se puede verificar la calidad del modelo en tareas financieras ni su comportamiento general.
- Licencia `other`: los términos de uso no están especificados. Es imprescindible revisar la licencia del modelo base `marin-community/marin-8b-base` antes de cualquier uso comercial o redistribución.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar información falsa o no verificada, especialmente en dominios especializados como finanzas donde la precisión es crítica.
- Posibles sesgos: al ser un fine-tune de un modelo base no documentado, los sesgos del modelo base se heredan, pero no se pueden identificar sin pruebas.
- Limitaciones de contexto desconocidas: no se indica la longitud de contexto soportada, lo que puede afectar a tareas que requieran procesar documentos largos.
- El modelo fue creado en agosto de 2026 y no ha recibido descargas ni valoraciones, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/AmberYifan/capsd-finance-fincot-finqa-clean6k-marin-8b-base-finance_cap_b1000_s0
- Modelo base: https://huggingface.co/marin-community/marin-8b-base
