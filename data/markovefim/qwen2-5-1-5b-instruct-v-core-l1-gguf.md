# MarkovEfim/Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF

## Resumen

El modelo `MarkovEfim/Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF` es una cuantización GGUF del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, publicada por E. S. Markov (MarkovEfim) bajo el marco metodológico que el autor denomina V-CORE v5.0.0. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una conversión de pesos a formato GGUF mediante un procedimiento de proyección L1 que el autor acompaña de 24 módulos de prueba en Lean 4 (sin `sorry`) para certificar formalmente propiedades del proceso de cuantización. El modelo hereda por tanto la arquitectura y el conocimiento del Qwen2.5-1.5B-Instruct original.

La relevancia de esta publicación es doble. Por un lado, ofrece una build GGUF de un modelo pequeño (1.777 millones de parámetros) pensada para ejecución en CPU con `llama.cpp` o en GPU modesta, con un tamaño de fichero de 1.599,9 MB y un factor de compresión declarado de 2,56x. Por otro, introduce un enfoque poco habitual: documentar la cuantización con demostraciones formales en Lean 4 y publicar métricas de divergencia respecto al modelo original (perplejidad y similitud coseno de logits), lo que permite auditar el coste de la compresión con criterios explícitos.

El autor reporta una degradación medible respecto a FP16: la perplejidad pasa de 141,458 a 191,092 y la similitud coseno media sobre 151.000 logits es de 0,9599. Esos números son la referencia principal para decidir si la build es aceptable en un caso de uso concreto. La licencia es AGPL-3.0, distinta de la del modelo base, lo que tiene implicaciones importantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GGUF cuantizado mediante V-CORE v5.0.0 (proyeccion L1); niveles concretos de cuantizacion no disponibles |
| Idiomas soportados | en, ru (segun metadatos del repo) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (`Qwen2.5-1.5B-Instruct-V-CORE-L1-v5.gguf`, 1.599,9 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.777 millones de parámetros. Esta ficha no dispone de detalles adicionales sobre número de capas, dimensión oculta, cabezas de atención o composición del dataset de preentrenamiento del modelo base, por lo que esos datos deben consultarse en la model card original de Qwen. El modelo no ha sido reentrenado por MarkovEfim: la publicación es una cuantización.

La innovación declarada está en el procedimiento de cuantización, no en el entrenamiento. V-CORE v5.0.0 aplica una proyección con métrica L1 y acompaña el proceso con 24 módulos Lean 4 verificados por máquina (`0 sorry`), publicados en el repositorio `l1-projection-complexity-lean4`. El entorno de verificación fue una NVIDIA Tesla T4 con C++17 nativo y AVX2 (`vcore-run`), y la build es compatible con `llama.cpp`. El autor reporta dos métricas de fidelidad frente a FP16: perplejidad 141,458 (FP16) frente a 191,092 (V-CORE), y similitud coseno de 0,9599 sobre 151.000 logits. No se documentan en la información disponible fases de RLHF o DPO posteriores a la cuantización.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del ajuste instructivo de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a preguntas de dominio general, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas a nivel introductorio, con la calidad esperable de un modelo de esta escala.
- Soporte de conversaciones multi-turno mediante plantilla de chat del modelo base (no se documenta el formato exacto en la información disponible).
- Capacidades multilingües declaradas para inglés y ruso en los metadatos del repo.
- Compatibilidad con `llama.cpp` y endpoints compatibles (tag `endpoints_compatible`), lo que permite servir el modelo en infraestructuras estándar de inferencia GGUF.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Inferencia en CPU sin GPU: la build GGUF de 1.599,9 MB puede ejecutarse con `llama.cpp` en portátiles y servidores sin acelerador, lo que la hace adecuada para prototipos y entornos de desarrollo con recursos limitados.
- Asistentes conversacionales ligeros en inglés o ruso: el modelo hereda el ajuste instructivo de Qwen2.5-1.5B-Instruct y puede gestionar diálogos de soporte de baja complejidad donde no se requiera razonamiento profundo.
- Generación de texto y resúmenes en pipelines por lotes: el tamaño reducido permite procesar grandes volúmenes de documentos en CPU con un coste por token bajo, aceptando la degradación de perplejidad reportada (191,092 frente a 141,458 en FP16).
- Experimentación e investigación en cuantización: la publicación incluye métricas de divergencia (PPL y similitud coseno de logits) y pruebas Lean 4, lo que la convierte en un caso de estudio reproducible para evaluar el impacto de la proyección L1 en modelos pequeños.
- Despliegue en dispositivos de borde o entornos embebidos: el fichero de 1,6 GB y la compatibilidad con `llama.cpp` permiten ejecución en equipos con poca memoria, siempre que se valide la calidad en la tarea concreta.
- Evaluación comparativa de builds cuantizadas: sirve como referencia para contrastar otras cuantizaciones del mismo modelo base y medir la pérdida de fidelidad con las métricas publicadas por el autor.

## Benchmarks y rendimiento

La información proporcionada solo incluye métricas de fidelidad de la cuantización respecto al modelo en FP16, no benchmarks de tareas (MMLU, HumanEval, GSM8K u otros).

| Metrica | FP16 (modelo base) | V-CORE v5.0.0 |
|---|---|---|
| Perplejidad (PPL) | 141,458 | 191,092 |
| Similitud coseno de logits (151k logits) | referencia | 0,9599 |
| Tamano del artefacto | no disponible | 1.599,9 MB (compresion 2,56x) |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 1.599,9 MB; con overhead de contexto y buffers de `llama.cpp` se recomienda al menos 2,5-3 GB de memoria disponible, aunque la cifra exacta no está documentada.
- GPU recomendadas: el autor verificó el proceso en una NVIDIA Tesla T4; cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) debería poder cargar el modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: `llama.cpp` (formato nativo), `vcore-run` (runtime propio del autor, C++17 con AVX2), y servidores compatibles con endpoints GGUF. No se documenta soporte explícito para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MarkovEfim/Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF | 1.777.088.000 | no disponible | GGUF | AGPL-3.0 | Cuantización certificada con Lean 4; PPL 191,092 |
| Qwen/Qwen2.5-1.5B-Instruct | 1.777.088.000 | no disponible en esta ficha | safetensors | Apache-2.0 (modelo base) | Modelo original sin cuantizar; PPL de referencia 141,458 |
| Otras builds GGUF de Qwen2.5-1.5B-Instruct | 1.777.088.000 | depende de la build | GGUF | según build | Cuantizaciones estándar (Q4_K_M, Q5_K_M, etc.) sin certificación formal |

La comparativa se limita al mismo modelo base porque no se dispone de datos de benchmarks de tareas que permitan contrastar con alternativas de otros autores de tamaño similar.

## Limitaciones y advertencias

- Degradación medible de calidad: la perplejidad aumenta de 141,458 a 191,092 (un 35% aproximadamente), lo que indica una pérdida de fidelidad respecto al modelo original que puede afectar a tareas sensibles.
- Licencia AGPL-3.0: es más restrictiva que la Apache-2.0 del modelo base Qwen2.5-1.5B-Instruct. El uso comercial en servicios de red puede obligar a liberar el código fuente bajo AGPL; conviene revisarlo con asesoría legal antes de producción.
- Riesgo de alucinación: inherente a un modelo de 1,5B parámetros, agravado por la cuantización; no es adecuado para tareas que exijan alta precisión factual sin verificación externa.
- Idiomas: los metadatos solo declaran inglés y ruso; el rendimiento en castellano no está garantizado ni documentado.
- Capacidades avanzadas no documentadas: no hay evidencia en la información disponible de soporte de tool calling, agentes o visión, por lo que no deben asumirse.
- Contexto: la longitud de contexto efectiva de esta build no está documentada; debe validarse empíricamente antes de usarla en conversaciones largas.
- Madurez del proyecto: el modelo tiene 251 descargas y 1 like en el momento de la consulta, y las métricas las publica el propio autor sin validación independiente; conviene tratarlas con cautela.
- La model card incluye afirmaciones promocionales no verificables ("Number 1 in all world"), que no deben tomarse como evidencia técnica.

## Enlaces

- Hugging Face: https://huggingface.co/MarkovEfim/Qwen2.5-1.5B-Instruct-V-CORE-L1-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Zenodo DOI: https://doi.org/10.5281/zenodo.24527692
- Runtime V-CORE: https://github.com/fomamarkov-creator/vcore-l1-certified
- Pruebas Lean 4: https://github.com/fomamarkov-creator/l1-projection-complexity-lean4
