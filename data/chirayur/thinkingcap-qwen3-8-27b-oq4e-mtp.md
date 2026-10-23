# ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp

## Resumen

ThinkingCap-Qwen3.8-27B-oQ4e-mtp es una cuantización de 4 bits del modelo bottlecapai/ThinkingCap-Qwen3.8-27B, publicada por el usuario ChirayuR para su ejecución en Macs con Apple Silicon mediante MLX. ThinkingCap es a su vez un ajuste fino de Qwen3.8-27B orientado a reducir el número de tokens de razonamiento necesarios para llegar a la misma respuesta, algo crítico en hardware de consumo donde cada token generado cuesta tiempo. Esta versión conserva dos elementos que suelen perderse en las cuantizaciones agresivas: la cabeza de predicción multi-token (MTP) propia del modelo, que habilita decodificación especulativa, y la torre de visión sin cuantizar, de modo que sigue aceptando entradas de imagen.

El trabajo lo firma un autor individual, sin afiliación con BottleCap AI (el creador del modelo base), y se declara explícitamente como proyecto personal y no comercial. El repositorio ocupa 17,6 GB, de los cuales 16,7 GB corresponden al modelo de lenguaje y a la cabeza MTP a unas 4,9 bits por peso, y 0,92 GB a la torre de visión en BF16. La cuantización se ha realizado con el cuantizador oQ de oMLX 0.7.2 en su nivel 4 "enhanced" (oQ4e), con tamaño de grupo 64 y un plan de bits mixto: 4 bits por defecto, 166 tensores sensibles a 5 bits y los embeddings de tokens a 8 bits, sin bajar en ningún caso de 4 bits.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de 27.800 millones de parámetros con visión y decodificación especulativa en un MacBook Pro de 24 GB, con velocidades medidas de 24,2 tok/s en código y 17,4 tok/s en prosa, y un consumo de memoria de 18,5 GB con el modelo cargado. No es un modelo nuevo ni un checkpoint entrenado desde cero: es un artefacto de despliegue para un ecosistema concreto, MLX sobre Apple Silicon.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8-27B con cabeza MTP de 1 capa y torre de visión; cuantización affine MLX con grupo de tamaño 64 (oQ4e) |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | No aplica (la información disponible no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. No medida para este release; en una build anterior solo texto (17,1 GB cargados) se aceptaron prompts de hasta ~51.900 tokens en el Mac de 24 GB con `iogpu.wired_limit_mb=21500` |
| Tipos de cuantización | MLX affine, grupo 64, mixta 4/5/8 bits: 4 bits por defecto, 166 tensores sensibles a 5 bits, embeddings de tokens a 8 bits, nada por debajo de 4 bits. Torre de visión sin cuantizar en BF16. Cabeza MTP cuantizada con el modelo, con sus capas conectoras en precisión completa |
| Idiomas soportados | No disponible (la model card no detalla la lista; el conjunto de calibración de oQ incluye muestras de código y multilingües) |
| Licencia | Polyform Small Business 1.0.0 (`license: other`) |
| Formato de pesos | safetensors (MLX); 17,6 GB en disco, de los cuales 16,7 GB son modelo de lenguaje + MTP a ~4,9 bits por peso y 0,92 GB la torre de visión en BF16 |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: parte de `bottlecapai/ThinkingCap-Qwen3.8-27B` en BF16 (revisión `7891e03`) y aplica un pipeline de cuantización en cinco pasos. Primero, oQ recopila una matriz de importancia a partir de 128 muestras de 512 tokens del conjunto de calibración de oQ (código y multilingüe), ejecutándolas sobre una copia temporal en 4 bits del propio ThinkingCap. Después aplica redondeo ponderado por importancia con un reajuste por mínimos cuadrados sobre 503 tensores, excluyendo `lm_head`. La cabeza MTP se conserva y se cuantiza junto con el modelo, dejando sus capas conectoras de pequeño tamaño en precisión completa, y la torre de visión se mantiene íntegra en BF16.

El detalle más discutible del proceso es la asignación de bits. oQ mide la sensibilidad de cada capa a la cuantización, pero esa medición no cabe en memoria para un modelo de 27B en un Mac de 24 GB, así que el plan de bits se tomó de un checkpoint cuantizado (oQ3) de un fine-tune hermano del mismo modelo base, `Swift-1.5-Qwen3.8-27b`; según el autor, en este repositorio no hay pesos de ese modelo, solo el plan de bits. Finalmente se fusionaron los planes de bits de una build solo texto y otra con visión del mismo origen y la misma matriz de importancia, tomando para cada tensor el mayor de los dos anchos, lo que da lugar a los embeddings a 8 bits y a los 166 tensores a 5 bits. El tokenizador y la plantilla de chat no se modifican respecto al modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento con modo "thinking" configurable (la model card menciona "medium effort" en sus pruebas), heredado de Qwen3.8-27B.
- Razonamiento con presupuesto de tokens reducido: según BottleCap AI, ThinkingCap recorta los tokens de razonamiento un 37% de media (rango del 11% al 66% según el benchmark) manteniendo una precisión media del 85,8% frente al 86,6% del modelo base.
- Generación de código: HumanEval es uno de los benchmarks reportados; la build anterior de esta cuantización obtuvo 96,3% en 80 problemas.
- Matemáticas: GSM8K reportado para la build anterior (92,0% sobre 150 problemas).
- Comprensión de imágenes: la torre de visión se conserva sin cuantizar; el autor verificó que describe correctamente una imagen de prueba con rojo a la izquierda y azul a la derecha.
- Decodificación especulativa mediante la cabeza MTP propia del modelo, conservada y cuantizada, que acelera la generación.
- Compatibilidad con el modo agéntico del modelo base: la model card cita τ²-bench (4.584 → 3.168 tokens de pensamiento por tarea con ThinkingCap) como evidencia de tareas de agente multi-paso.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible para este release; debe asumirse el del modelo base, sin verificación local.
- Capacidades multilingües: no detalladas en la información disponible.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo rinde a 24,2 tok/s en generación de código con MTP activado y 213 tok/s de procesamiento de prompt para entradas de 16k tokens, lo que lo hace utilizable para autocompletado, refactorización y explicación de fragmentos en un flujo de trabajo sin conexión.
- Revisión de capturas y diagramas: al mantener la torre de visión en BF16, puede recibir imágenes junto al texto y describir o interpretar su contenido, útil para documentar interfaces, leer diagramas de arquitectura o extraer información de maquetas.
- Agentes con múltiples pasos y presupuesto de tiempo ajustado: la reducción de tokens de pensamiento reportada por BottleCap AI (del orden de un minuto ahorrado por tarea en sus cifras de τ²-bench a 24 tok/s) favorece bucles de agente donde la latencia acumulada importa.
- Prototipado e investigación en Apple Silicon: sirve para evaluar el comportamiento de un modelo de 27B con visión y decodificación especulativa en un portátil de 24 GB, sin depender de servidores ni de GPUs dedicadas.
- Procesamiento por lotes de documentos largos en local: con la build solo texto (0,9 GB menos) se libera espacio para contexto, lo que permite encajar prompts de decenas de miles de tokens en máquinas de 24 GB dentro del límite de memoria GPU configurado.
- Tareas de razonamiento matemático y resolución de problemas: los resultados reportados en GSM8K de la build anterior (92,0%) lo sitúan como opción para tutoría o verificación de cálculos en entornos educativos o de análisis.
- Evaluación comparativa de cuantizaciones: el repositorio documenta el plan de bits y las mediciones de velocidad y precisión, lo que lo convierte en un caso de estudio útil para quien investigue el impacto de esquemas mixtos 4/5/8 bits en MLX.

## Benchmarks y rendimiento

Velocidad y memoria medidas en un MacBook Pro M5 de 24 GB con oMLX 0.7.2, MTP activado y caché KV TurboQuant de 4 bits:

| Métrica | Valor |
|---|---|
| Generación de código | 24,2 tok/s |
| Generación de prosa | 17,4 tok/s |
| Procesamiento de prompt (16k tokens) | 213 tok/s |
| Memoria con el modelo cargado | 18,5 GB |
| Entrada de imagen | Descripción correcta de una imagen de prueba (rojo izquierda, azul derecha) |

Precisión con la suite integrada de oMLX, sin thinking y con muestreo determinista. Las filas de otros modelos se midieron en la misma máquina y con la misma suite, como referencia:

| Modelo | MMLU (300) | GSM8K (150) | HumanEval (80) |
|---|---|---|---|
| Este release | 79,7% | — | — |
| Build anterior de esta cuantización (solo texto, antes de fusionar el plan de bits) | 78,7% | 92,0% | 96,3% |
| sabi-noema (fine-tune de Qwen3.8-27B), oQ4e + MTP | 79,0% | 90,7% | 97,5% |
| Swift-1.5-Qwen3.8-27b, oQ3 + MTP | 76,7% | 90,0% | 91,2% |

GSM8K y HumanEval no se ejecutaron en este release; la build anterior solo difiere en tener menos tensores a 5 bits y embeddings a 4 bits. El propio autor advierte que las muestras son pequeñas y que estos números sirven para comprobar que la cuantización funciona, no como clasificación de leaderboard. Comprobación adicional del autor sobre HumanEval (problemas 132–163, thinking en esfuerzo medio, GGUFs IQ4_XS oficiales en llama.cpp): ThinkingCap resolvió los mismos 31 de 32 problemas que Qwen3.8-27B base con un 11% menos de tokens (751 frente a 840 por problema) y terminó el conjunto un 10% más rápido (23,1 frente a 25,8 minutos). Una build anterior de esta cuantización, en oMLX, resolvió también 31 de 32 con 765 tokens por problema.

## Requisitos de hardware

- VRAM/RAM unificada estimada: 18,5 GB con el modelo cargado, medido en un MacBook Pro M5 de 24 GB. El repositorio ocupa 17,6 GB en disco.
- Plataforma: exclusivamente Apple Silicon con MLX; no hay pesos GGUF ni safetensors estándar para GPUs NVIDIA o AMD en este repositorio.
- Cabe en GPU de consumo en el sentido de Macs de 24 GB, con poco margen para contexto si se usa el límite de memoria GPU por defecto. El autor recomienda la variante solo texto (`ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp-text`, 0,9 GB menos) para Macs de 24 GB.
- Para contexto largo en 24 GB: con `iogpu.wired_limit_mb=21500`, una build anterior solo texto (17,1 GB cargados) aceptó prompts de hasta ~51.900 tokens; este release necesita ~1,4 GB más y, según el autor, cada GB adicional cuesta aproximadamente 10.000 tokens de contexto en esa máquina.
- Opciones de despliegue: oMLX 0.7.2 (entorno probado), con MTP y caché KV TurboQuant de 4 bits; cualquier runtime compatible con MLX y el formato de cuantización oQ. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama en este repositorio (los GGUFs IQ4_XS citados en las pruebas son de los modelos base, no de esta cuantización).
- Throughput y latencia: 24,2 tok/s en código, 17,4 tok/s en prosa y 213 tok/s de prefill a 16k tokens. A esa velocidad, según el autor, 1.000 tokens de pensamiento menos equivalen a unos 40 segundos menos por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (300) | HumanEval (80) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-oQ4e-mtp (este release) | 27,8 B | No disponible | 79,7% | No ejecutado | Polyform Small Business 1.0.0 | MLX, Apple Silicon |
| ThinkingCap-Qwen3.8-27B-oQ4e-mtp-text (misma fuente, solo texto) | 27,8 B | No disponible | No disponible | No disponible | Polyform Small Business 1.0.0 | MLX, Apple Silicon; 0,9 GB menos |
| sabi-noema (fine-tune de Qwen3.8-27B), oQ4e + MTP | 27,8 B (misma familia) | No disponible | 79,0% | 97,5% | No disponible en la información proporcionada | MLX, Apple Silicon |
| Swift-1.5-Qwen3.8-27b, oQ3 + MTP | 27,8 B (misma familia) | No disponible | 76,7% | 91,2% | No disponible en la información proporcionada | MLX, Apple Silicon |
| bottlecapai/ThinkingCap-Qwen3.8-27B (base BF16) | 27,8 B | No disponible | 86,6% de precisión media según BottleCap AI (no es MMLU) | No disponible | No disponible en la información proporcionada | Pesos BF16 |

La comparación relevante aquí es de compromiso precisión/memoria: este release baja de BF16 a ~4,9 bits por peso y pierde algo de precisión frente al base, pero gana la posibilidad de ejecutarse en 24 GB. Frente a las otras cuantizaciones de la misma familia, la diferencia está en el plan de bits y en la conservación de visión y MTP.

## Limitaciones y advertencias

- Proyecto personal y no comercial: el autor declara explícitamente que no está afiliado a BottleCap AI y que se trata de un trabajo personal sin ánimo comercial.
- Licencia Polyform Small Business 1.0.0: no es una licencia de código abierto al uso; impone restricciones al uso comercial por parte de empresas que superen ciertos umbrales de tamaño. Conviene revisar el archivo LICENSE antes de cualquier despliegue en producción.
- Muestras de evaluación pequeñas: MMLU con 300 preguntas, GSM8K con 150 y HumanEval con 80; el propio autor indica que no deben tratarse como resultados de leaderboard.
- GSM8K y HumanEval no se han ejecutado en este release concreto, solo en la build anterior con un plan de bits ligeramente distinto.
- Contexto no medido para este release: la cifra de ~51.900 tokens corresponde a una build anterior solo texto y a una configuración específica de memoria GPU; no debe extrapolarse sin verificar.
- Plan de bits derivado de otro modelo: la medición de sensibilidad se tomó de un checkpoint cuantizado de `Swift-1.5-Qwen3.8-27b`, no del propio ThinkingCap, por limitaciones de memoria. Es una aproximación razonable pero no óptima para este modelo.
- Dependencia de hardware: solo funciona en Apple Silicon con MLX; no hay artefactos para GPU NVIDIA ni formatos GGUF de esta cuantización.
- Riesgo de alucinación: inherente a los modelos de la familia Qwen y no cuantificado en la información disponible; la cuantización a 4 bits puede agravar la degradación en tareas de razonamiento largo.
- Idiomas soportados no documentados: la model card no especifica la cobertura lingüística, por lo que no hay garantía sobre calidad fuera del inglés y el chino del modelo base.
- Visión en BF16: mantener la torre sin cuantizar mejora la calidad de imagen a costa de 0,92 GB adicionales, lo que reduce el contexto disponible en máquinas de 24 GB.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: [ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp](https://huggingface.co/ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp)
- Variante solo texto: [ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp-text](https://huggingface.co/ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp-text)
- Modelo base: [bottlecapai/ThinkingCap-Qwen3.8-27B](https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B)
- Cuantizador oMLX: [github.com/jundot/omlx](https://github.com/jundot/omlx)
- Sitio de BottleCap AI: [bottlecapai.com](https://bottlecapai.com)
- Licencia: [LICENSE](https://huggingface.co/ChirayuR/ThinkingCap-Qwen3.8-27B-oQ4e-mtp/blob/main/LICENSE)
