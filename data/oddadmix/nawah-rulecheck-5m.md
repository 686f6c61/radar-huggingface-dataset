# oddadmix/Nawah-RuleCheck-5M

## Resumen

Nawah-RuleCheck-5M es un modelo de clasificación de secuencias en árabe desarrollado por oddadmix (Ahmed Wasfy) que determina si un texto cumple o no una regla expresada en lenguaje natural. Con 5.080.704 parámetros y un peso de 20,33 MB, está diseñado para tareas de verificación de reglas, moderación de contenido y cumplimiento normativo en árabe, con un enfoque en despliegue ligero y en dispositivos de baja capacidad.

El modelo se basa en la arquitectura LlamaForSequenceClassification de Transformers, con 5 capas transformer y un tamaño oculto de 128. A diferencia de un modelo generativo, produce una salida binaria: "مطابق" (cumple) o "مخالف" (no cumple). Está entrenado sobre 19 reglas decidibles a partir de la propia cadena de texto, como presencia de números, teléfonos, URLs, correos electrónicos, límites de palabras, etc., y se especializa en documentos comerciales árabes de 1 a 3 líneas (anuncios clasificados, tickets de soporte, ofertas de empleo, quejas, listados de alquiler).

Su relevancia radica en que aborda un nicho poco cubierto: modelos árabes pequeños y eficientes para verificación de reglas, con una evaluación rigurosa que distingue entre generalización a redacciones vistas y no vistas. El autor publica una escalera de cuatro tamaños (500K, 1M, 5M y 51M) entrenados con los mismos datos y evaluados con el mismo harness, lo que permite estudiar el efecto del tamaño en la robustez a variaciones de redacción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForSequenceClassification (transformers) |
| Parametros totales | 5.080.704 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencias basado en la arquitectura Llama, con 5 capas transformer y un tamaño oculto de 128. La distribución de parámetros es notable: 984.704 parámetros corresponden al cuerpo transformer, mientras que 4.096.000 (el 80,6 %) pertenecen a la tabla de embeddings de 32.000 × 128. Esto refleja que los modelos árabes pequeños están dominados por el vocabulario, un dato relevante para interpretar los resultados como capacidad de razonamiento.

El entrenamiento se realizó sobre el dataset oddadmix/arabic-rule-checking, que contiene pares de texto y regla con etiquetas de cumplimiento. El modelo se ajusta a partir de la base oddadmix/Emhotob-5M-v2, un modelo de lenguaje árabe entrenado desde cero. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. El formato de entrada es `النص: {text}\nالقاعدة: {rule}` con `add_special_tokens=False`, y la cabeza de clasificación agrega el último token no padding.

## Capacidades

- Clasificación binaria de cumplimiento de reglas en árabe: dado un texto y una regla en lenguaje natural, devuelve "مطابق" (cumple) o "مخالف" (no cumple).
- Verificación de reglas decidibles a partir de la cadena: presencia de números, teléfonos, precios, fechas, ciudades, URLs, correos electrónicos, signos de puntuación excesivos, caracteres latinos, límites de palabras (mínimos y máximos), y preguntas que terminan en signo de interrogación.
- Generalización a redacciones no vistas: el modelo mantiene una precisión alta (0,9949) en reglas reformuladas con paráfrasis no presentes en el entrenamiento.
- Robustez a pares mínimos: en pruebas con pares de texto que difieren en un solo cambio que invierte la etiqueta, alcanza 0,9926 de precisión.
- Inferencia rápida en CPU: 1,06 ms por ejemplo (batch 1, float32, 2 hilos), lo que lo hace adecuado para despliegue en tiempo real.
- No es generativo: no produce texto libre, solo clasifica. Esto lo hace directamente evaluable y adecuado para pipelines de moderación automática.

## Casos de uso

- Moderación de anuncios clasificados: verificar que un anuncio de venta no incluya números de teléfono, URLs o correos electrónicos no permitidos, usando reglas como "يُمنع ظهور أي رقم هاتف (8-15 خانة) في النص". El modelo procesa el texto y la regla en una sola pasada, permitiendo filtrar contenido en tiempo real.
- Validación de tickets de soporte: comprobar que un ticket de atención al cliente cumpla requisitos mínimos de longitud (por ejemplo, al menos 25 palabras) o que no contenga datos personales como teléfonos o correos, antes de enrutarlo a un agente humano.
- Cumplimiento en ofertas de empleo: asegurar que una oferta incluya una fecha, una ciudad o un rango de palabras específico, y que no contenga enlaces externos, mediante reglas predefinidas por el equipo de recursos humanos.
- Filtrado de contenido generado por usuarios: aplicar reglas de moderación como "no exceso de puntuación" o "no caracteres latinos" en comentarios o publicaciones de foros árabes, con latencia de alrededor de 1 ms por ejemplo en CPU.
- Control de calidad en listados de alquiler: verificar que un listado inmobiliario contenga un precio y una ciudad, y que no incluya URLs, usando reglas en árabe coloquial o formal.
- Automatización de reglas de negocio en entornos on-device: integrar el modelo en aplicaciones móviles o embebidas (por su tamaño de 20 MB) para validar entradas de formularios en árabe sin conexión a servidores, por ejemplo, comprobando que un campo de texto no supere 50 palabras o que no contenga números de teléfono.

## Benchmarks y rendimiento

El autor publica resultados de evaluación en cuatro conjuntos de prueba, todos con datos no vistos durante el entrenamiento. La siguiente tabla resume el rendimiento del modelo en comparación con los otros peldaños de la escalera y con una línea base de mayoría:

| Modelo | Parametros | Peso | Precisión (redacción vista) | Precisión (redacción no vista) | Precisión (pares mínimos) | Precisión (redacción manuscrita) | CPU ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nawah-RuleCheck-500K | 518.256 | 2,08 MB | 0,9866 | 0,9778 | 0,9926 | 0,5558 | 0,32 |
| Nawah-RuleCheck-1M | 1.073.504 | 4,30 MB | 0,9952 | 0,9864 | 0,9991 | 0,7708 | 0,55 |
| **Nawah-RuleCheck-5M** | **5.080.704** | **20,33 MB** | **0,9979** | **0,9949** | **0,9926** | **0,8642** | **1,06** |
| Nawah-RuleCheck-v2 | 51.787.264 | 207,16 MB | 0,9928 | 0,9799 | 0,9981 | 0,8667 | 16,42 |
| Línea base de mayoría | — | — | 0,6401 | 0,6401 | 0,5000 | 0,5925 | — |

*CPU ms = ejemplo único, batch 1, float32, 2 hilos, mediana de 200 ejecuciones. En una RTX 5090, este modelo tarda 1,80 ms.*

Además, se reporta la precisión por regla en dos escenarios. En redacción no vista, las 19 reglas superan 0,913, con 15 de ellas en 0,99 o más. En redacción manuscrita (reglas reformuladas desde cero con vocabulario casi ajeno al entrenamiento), el rendimiento cae notablemente en algunas reglas:

| Regla | Precisión (redacción manuscrita) |
|---|---:|
| no_url | 1,000 |
| no_excess_punct | 1,000 |
| has_date | 1,000 |
| has_price | 0,992 |
| no_latin | 0,975 |
| has_number | 0,975 |
| no_email | 0,950 |
| has_phone | 0,700 |
| no_phone | 0,650 |
| ends_question | 0,400 |

## Requisitos de hardware

- VRAM estimada: el modelo pesa 20,33 MB en float32, por lo que cabe en cualquier GPU con al menos 64 MB de VRAM. En cuantización a 8 bits o 4 bits, el requisito sería aún menor, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060, RTX 4090 o incluso integradas. En una RTX 5090, la inferencia tarda 1,80 ms por ejemplo.
- CPU: funciona en CPU con 1,06 ms por ejemplo (2 hilos, float32), lo que lo hace viable en entornos sin GPU.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con vLLM, TGI, o mediante la API de Hugging Face Inference Endpoints. También es compatible con text-embeddings-inference según los tags del repositorio.
- Latencia y throughput: en CPU, 1,06 ms por ejemplo; en RTX 5090, 1,80 ms. No se han publicado mediciones de throughput en lote.

## Comparativa con modelos similares

La comparativa más directa es con los otros peldaños de la misma escalera de Nawah-RuleCheck, entrenados con los mismos datos y evaluados con el mismo harness:

| Modelo | Parametros | Peso | Precisión (redacción no vista) | Precisión (redacción manuscrita) | CPU ms |
|---|---:|---:|---:|---:|---:|
| Nawah-RuleCheck-500K | 518.256 | 2,08 MB | 0,9778 | 0,5558 | 0,32 |
| Nawah-RuleCheck-1M | 1.073.504 | 4,30 MB | 0,9864 | 0,7708 | 0,55 |
| **Nawah-RuleCheck-5M** | **5.080.704** | **20,33 MB** | **0,9949** | **0,8642** | **1,06** |
| Nawah-RuleCheck-v2 | 51.787.264 | 207,16 MB | 0,9799 | 0,8667 | 16,42 |

El modelo de 5M ofrece el mejor equilibrio entre precisión en redacción no vista (0,9949) y redacción manuscrita (0,8642), con una latencia de 1,06 ms. El peldaño de 51M (v2) apenas mejora la precisión en redacción manuscrita (0,8667 frente a 0,8642) pero multiplica por 16 la latencia y por 10 el tamaño. No se dispone de comparativas con otros modelos externos de verificación de reglas en árabe.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en 19 reglas decidibles a partir de la propia cadena de texto. Reglas que requieran conocimiento del mundo, juicio o inferencia de varios pasos quedan fuera de distribución.
- Los textos de entrenamiento son documentos comerciales árabes de 1 a 3 líneas (anuncios clasificados, tickets de soporte, ofertas de empleo, quejas, listados de alquiler) de nueve regiones. Textos más largos o de géneros muy diferentes no han sido probados.
- Las reglas de conteo de palabras son la familia más débil: el conteo es la única operación que no puede resolverse por coincidencia de patrones, y la precisión cae hasta 0,913 en redacción no vista y 0,400 en redacción manuscrita para la regla `ends_question`.
- La robustez a redacciones no controladas es limitada: en la columna de redacción manuscrita, el modelo de 5M obtiene 0,8642, lo que indica que aún falla en más de 1 de cada 10 casos cuando los usuarios reformulan las reglas con vocabulario coloquial o terse.
- El modelo no es generativo: no puede explicar sus decisiones ni producir texto. Solo emite una etiqueta binaria con una probabilidad asociada.
- No se han publicado resultados de sesgos demográficos o dialectales. El entrenamiento cubre nueve regiones, pero no se detalla la distribución dialectal.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/Nawah-RuleCheck-5M
- Dataset de entrenamiento: https://huggingface.co/datasets/oddadmix/arabic-rule-checking
- Script de evaluación (`eval_all.py`): https://huggingface.co/oddadmix/Nawah-RuleCheck-5M/blob/main/eval_all.py
- Modelo base: https://huggingface.co/oddadmix/Emhotob-5M-v2
- Perfil del autor en Hugging Face: https://huggingface.co/oddadmix
- Perfil del autor en GitHub: https://github.com/Oddadmix
- Modelo hermano de contexto largo: https://huggingface.co/oddadmix/50M-8192-Nawah-gemma
