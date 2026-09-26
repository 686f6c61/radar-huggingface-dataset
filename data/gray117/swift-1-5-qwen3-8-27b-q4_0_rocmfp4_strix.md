# gray117/Swift-1.5-Qwen3.8-27B-Q4_0_ROCMFP4_STRIX

## Resumen

Este repositorio, publicado por el usuario gray117 con el identificador `gray117/Swift-1.5-Qwen3.8-27B-Q4_0_ROCMFP4_STRIX`, es una redistribución de pesos derivada de otro modelo. El enlace de licencia incluido en la model card apunta a `ukisai/Swift-1.5-Qwen3.8-27b`, lo que sitúa el origen en ese modelo base. Por la nomenclatura del nombre cabe interpretar una conversión cuantizada de aproximadamente 27 000 millones de parámetros en formato Q4_0 y con un empaquetado etiquetado como ROCMFP4_STRIX, presumiblemente orientado a aceleración ROCm sobre hardware AMD de la familia Strix; ninguno de estos extremos está confirmado por el autor.

La model card no contiene más que los metadatos de licencia (`license: other`, con nombre `swift-open-license-1.0`). No se documentan arquitectura, longitud de contexto, idiomas, composición del dataset ni resultados de evaluación. El repositorio se creó y se actualizó por última vez el 26 de septiembre de 2026, y acumula 0 descargas y 0 «likes» en el momento de la consulta.

Su relevancia práctica es, por tanto, limitada y de carácter cautelar: deja constancia de que existe una conversión comunitaria de un modelo de 27B pensada para hardware AMD Strix, pero cualquier evaluación técnica rigurosa obliga a consultar el repositorio del modelo base y a revisar los términos de la licencia antes de plantear un uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no la describe. |
| Parámetros totales | Aproximadamente 27 000 millones, según el nombre del repositorio (dato no confirmado por el autor) |
| Parámetros activos | No disponible. No hay indicios en la información proporcionada de que sea una arquitectura de mezcla de expertos. |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_0, según el nombre del repositorio. No se documentan otras variantes ni el esquema exacto de cuantización. |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other`). El texto se enlaza desde la model card, no se reproduce en ella. |
| Formato de pesos | No disponible. El sufijo `Q4_0` sugiere tensores cuantizados a 4 bits con el esquema Q4_0 habitual del ecosistema GGUF, y `ROCMFP4_STRIX` apunta a un empaquetado específico para ROCm sobre AMD Strix; ninguna de las dos lecturas está confirmada en el repositorio. |

## Arquitectura y entrenamiento

No disponible. La información proporcionada no incluye ningún detalle sobre la arquitectura del modelo (no se especifica si es un transformer denso, una mezcla de expertos, un modelo de espacio de estados o un híbrido), ni sobre el número de tokens de entrenamiento, la composición del dataset, las fases de ajuste (SFT, RLHF, DPO) o innovaciones técnicas asociadas.

Lo único verificable es la relación de derivación: se trata de una conversión del modelo base `ukisai/Swift-1.5-Qwen3.8-27b`, según el enlace de licencia que figura en la model card. Es decir, el trabajo de gray117 consistiría en un recuantizado y reempaquetado, no en un entrenamiento desde cero, aunque esto tampoco se explicita. Para conocer la arquitectura y el proceso de entrenamiento reales habría que acudir a la documentación del modelo base.

## Capacidades

El autor no declara ninguna capacidad en la model card. Las capacidades que se enumeran a continuación son las que cabría esperar de un modelo de aproximadamente 27B de la familia indicada en el nombre, pero **no están verificadas** ni en este repositorio ni en la documentación disponible:

- Generación de texto y conversación multi-turno: esperable por el tamaño y la familia, sin confirmar.
- Razonamiento y resolución de problemas: sin confirmar.
- Generación y completado de código: sin confirmar.
- Matemáticas y cálculo simbólico básico: sin confirmar.
- Soporte de *tool calling* o *function calling*: sin confirmar.
- Soporte de agentes y razonamiento multi-paso: sin confirmar.
- Capacidades multilingües y cobertura de idiomas concreta: sin confirmar.
- Modo de razonamiento explícito (*thinking*), visión o audio: sin confirmar.

## Casos de uso

No hay información que permita validar ningún caso de uso concreto para esta conversión. Los escenarios siguientes se plantean de forma condicional, asumiendo que el modelo base se comporta como un modelo de lenguaje denso de aproximadamente 27B; deben considerarse hipótesis de trabajo, no recomendaciones verificadas:

- Inferencia local en estaciones de trabajo con GPU AMD: el sufijo `ROCMFP4_STRIX` apunta a un empaquetado pensado para ROCm y hardware Strix, de modo que el caso natural sería ejecutar el modelo en equipos con memoria unificada de gran capacidad sin depender de CUDA.
- Asistente de código en un IDE: un modelo de ~27B cuantizado a 4 bits es un tamaño manejable para autocompletado y explicación de código en local, siempre que se confirme la calidad del modelo base en tareas de programación.
- Procesamiento por lotes de documentación técnica: resumen, extracción de entidades y clasificación de documentos largos en un servidor con una única GPU, sujeto a que la ventana de contexto real sea suficiente.
- Prototipado de agentes con llamada a herramientas: si el modelo base soporta *tool calling*, podría integrarse en flujos que consultan APIs internas o bases de datos.
- Traducción y adaptación de contenido: solo si se confirma cobertura multilingüe, dato que no aparece en la información disponible.
- Evaluación comparativa de cuantizaciones: el repositorio puede servir como artefacto de prueba para medir la pérdida de calidad de Q4_0 frente a los pesos originales en hardware AMD, usando el modelo base como referencia.
- Despliegue en entornos con memoria unificada de 64 o 128 GB: permitiría mantener el modelo en memoria sin segmentarlo, aunque se desconoce el consumo real del formato ROCMFP4_STRIX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Todas las cifras de esta sección son estimaciones aritméticas derivadas del tamaño nominal de 27 000 millones de parámetros y de una cuantización de 4 bits, no mediciones publicadas por el autor:

- Peso de los pesos en memoria: aproximadamente 15,2 GB con un esquema de 4,5 bits por parámetro (Q4_0), más la sobrecarga de la caché KV, que depende de la longitud de contexto efectiva.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090, RTX 4080 (16 GB, al límite) y tarjetas con 24 GB o más, siempre que el formato de pesos sea compatible con el runtime elegido.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, Radeon PRO W7900 48 GB, Instinct MI300X para el camino ROCm.
- Memoria unificada: el sufijo `STRIX` sugiere hardware AMD Strix Halo, donde 64 o 128 GB de memoria unificada permitirían alojar el modelo completo con contexto amplio.
- Techo teórico de velocidad por ancho de banda (no medido): en Strix Halo, con unos 256 GB/s de ancho de banda, el límite superior sería de unas 16-17 tokens/s; en una RTX 4090, con unos 1 008 GB/s, rondaría los 65 tokens/s. Son cotas superiores de memoria, no rendimiento observado.
- Opciones de despliegue: llama.cpp (con backend HIP/ROCm), Ollama, LM Studio y servidores compatibles con GGUF. Para vLLM o TGI habría que confirmar si el formato de pesos es soportado, ya que no se documenta.
- Latencia y throughput reales: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de su documentación pública habitual y no se han verificado en esta consulta. La comparación se limita a tamaño, contexto y licencia, porque no existen métricas de calidad publicadas para el modelo objeto de la ficha:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gray117/Swift-1.5-Qwen3.8-27B-Q4_0_ROCMFP4_STRIX | ~27B (según nombre) | No disponible | swift-open-license-1.0 | HuggingFace, 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b (modelo base) | No confirmado | No disponible | swift-open-license-1.0 | HuggingFace |
| Qwen3-32B | 32,8B denso | 32 768 tokens nativo, ampliable a 131 072 | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Gemma 3 27B | 27B denso | 128 000 tokens | Términos de uso de Gemma | HuggingFace |

La diferencia más relevante frente a las alternativas es la licencia: Qwen3-32B se distribuye bajo Apache 2.0, mientras que este repositorio emplea una licencia personalizada de nombre `swift-open-license-1.0` cuyo contenido no se reproduce en la model card y debe revisarse en el enlace correspondiente.

## Limitaciones y advertencias

- Model card vacía: el repositorio no aporta ninguna especificación técnica verificable, lo que impide reproducir o auditar el modelo.
- Licencia personalizada: `swift-open-license-1.0` no es una licencia estándar reconocida; las condiciones de uso comercial, redistribución y atribución deben revisarse en el enlace del modelo base antes de cualquier despliegue.
- Sin adopción: 0 descargas y 0 «likes» implican que no existe validación por parte de terceros ni informes de uso independientes.
- Sin datos de evaluación: no hay benchmarks, ni comparación con los pesos originales, ni medición de la pérdida de calidad introducida por la cuantización Q4_0.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; al no existir evaluación publicada, no puede acotarse su magnitud.
- Sesgos: no documentados. Al desconocerse el dataset de entrenamiento del modelo base, no es posible caracterizar sesgos demográficos, culturales o lingüísticos.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana real y los idiomas efectivamente soportados.
- Trazabilidad: no se indica el procedimiento de conversión, la herramienta empleada ni el hash de los pesos de origen, por lo que no puede garantizarse que la conversión sea fiel.
- Empaquetado específico de hardware: el formato ROCMFP4_STRIX puede limitar la portabilidad a otras plataformas y complicar su integración en *pipelines* estándar de inferencia.
- Para producción: se recomienda partir del modelo base con licencia y formato verificados en lugar de esta conversión, salvo que se audite previamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gray117/Swift-1.5-Qwen3.8-27B-Q4_0_ROCMFP4_STRIX
- Texto de la licencia enlazado en la model card: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Modelo base presumible: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
