# MubitLabs/banyan-sapling

## Resumen

Banyan Sapling es un modelo de verificación semántica desarrollado por MubitLabs, primer miembro de la familia Banyan. No es un modelo generativo de propósito general: recibe tres cadenas de texto (`policy`, `evidence`, `claim`) y devuelve una clasificación de cuatro clases —`supported`, `violation`, `insufficient_information` e `inconsistent_context`— junto con probabilidades calibradas y un conjunto de predicción que expresa la incertidumbre del modelo. Está pensado como componente de verificación dentro de flujos de comprobación de políticas, revisión de evidencias y validación de afirmaciones.

Técnicamente es un fine-tuning del MoE Qwen3-30B-A3B-Instruct-2507, con el backbone podado a 96 expertos retenidos por capa, LoRA sobre las proyecciones de atención y una cabeza de interacción propia ("TriVector") que agrupa por separado las representaciones de política, evidencia y afirmación antes de emitir los cuatro logits. El checkpoint almacena 23.042.164.740 parámetros en BF16 (46,3 GB de repo) y la ruta de inferencia publicada limita la entrada a 16.384 tokens codificados en total.

Su relevancia es doble: por un lado, ataca un problema poco cubierto por los LLM al uso (distinguir "no hay información suficiente" de "el contexto es contradictorio" y de "violación de política"); por otro, es explícito sobre su estado de madurez. La evaluación publicada muestra 94,22 % de accuracy bruta en el conjunto combinado, pero solo un 45 % de cobertura de respuestas calibradas, con un 0,82 % de cobertura en ContractNLI. Es un research preview para experimentación de integración, no un verificador listo para producción en dominios contractuales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone MoE podado derivado de Qwen3-30B-A3B (96 expertos retenidos por capa); LoRA de atención + cabeza de interacción TriVector |
| Parametros totales | 23.042.164.740 (parámetros almacenados, según safetensors) |
| Parametros activos | no disponible (el backbone base Qwen3-30B-A3B activa ~3B por token; MubitLabs no publica la cifra tras la poda) |
| Longitud de contexto | 16.384 tokens codificados en total, sumando todos los campos y el formato de entrada |
| Tipos de cuantizacion | no disponible; solo se publica checkpoint BF16 con adaptadores, routers y cabeza en FP32 sin fusionar |
| Idiomas soportados | inglés (único idioma evaluado y declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + código de inferencia empaquetado (requiere loader propio, no basta cargar la arquitectura Qwen base); incluye tokenizer, calibración y checksums |

Otros datos: pipeline declarado `text-classification`, revisión base `0d7cf23991f47feeb3a57ecb4c9cee8ea4a17bfe`, 4 descargas y 4 likes en el momento de la consulta, creado el 22 de octubre de 2026 y actualizado el 24 de octubre de 2026.

## Arquitectura y entrenamiento

Sapling parte de Qwen3-30B-A3B-Instruct-2507, un transformer con mezcla de expertos, y lo transforma en un clasificador de verificación. El backbone se poda a 96 expertos retenidos por capa y se le añade una cabeza de interacción TriVector: los spans de política, evidencia y afirmación se agrupan (pooling) por separado y la cabeza compara sus representaciones para producir cuatro logits de clase. La codificación posicional nativa se preserva. La adaptación consiste en LoRA sobre las proyecciones de atención más la cabeza de verificación, con los routers congelados durante la ejecución final. Los adaptadores permanecen sin fusionar en el paquete de pesos, lo que obliga a usar el loader incluido para reconstruir la cabeza y los adaptadores factorizados.

El entrenamiento final completó una época sobre 50.000 ejemplos: 42.809 casos sintéticos controlados y 7.191 afirmaciones de entrenamiento de ContractNLI, a lo largo de 21.333 actualizaciones del optimizador. La calibración es explícita y separada: ajuste de temperatura y calibración conformal usan particiones distintas de 1.360 ejemplos cada una, equilibradas entre casos sintéticos y contractuales. La temperatura tiene cota inferior 0,5 y el valor ajustado es 5,171578; el umbral compartido de no conformidad es 0,995478, tomando el más conservador de los dos dominios. La precisión de referencia es BF16 para el backbone y FP32 para adaptadores, routers y cabeza. La ruta de inferencia evaluada procesa un ejemplo a la vez.

## Capacidades

- Clasificación de afirmaciones en cuatro clases mutuamente excluyentes: `supported`, `violation`, `insufficient_information` e `inconsistent_context`, con `raw_label` como clase de mayor puntuación.
- Salida calibrada: probabilidades por clase, conjunto de predicción y campo `status`, que puede valer `unsure` cuando no hay decisión única. Un resultado no resuelto es distinto de la clase sustantiva `insufficient_information`.
- Detección de conflicto normativo: la clase `violation` señala que la afirmación choca con la política y la evidencia aportadas.
- Detección de contexto incoherente: `inconsistent_context` marca hechos relevantes que se contradicen dentro del material suministrado.
- Cuantificación de incertidumbre mediante calibración conformal, con umbral de no conformidad compartido entre dominios.
- No genera explicaciones, no recupera fuentes, no autentica documentos y no toma decisiones de negocio: esas funciones pertenecen al flujo que lo rodea.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo thinking; el uso previsto es clasificación de un ejemplo por llamada.
- Multilingüismo: no disponible; solo se declara y evalúa inglés.

## Casos de uso

- Verificación de reclamaciones en seguros: dada una póliza como `policy`, el expediente como `evidence` y la reclamación del asegurado como `claim`, el modelo devuelve `supported`, `violation` o `insufficient_information`. La model card advierte que cinco variantes de siniestro de seguros probadas devolvieron `unsure` con etiqueta bruta `insufficient_information`, por lo que este caso requiere trabajo adicional de calibración antes de automatizar decisiones.
- Comprobación de cumplimiento normativo interno: integrar el modelo como paso de validación donde una política corporativa y el texto de una propuesta se comparan para detectar conflictos antes de la aprobación humana, usando la clase `violation` como señal de bloqueo.
- Revisión de contratos y cláusulas: el modelo se entrenó con 7.191 afirmaciones de ContractNLI y clasifica si una cláusula está respaldada por el contrato. Con cobertura calibrada del 0,82 % en ese dominio, es apto para experimentación y anotación asistida, no para aprobación automática.
- Validación de respuestas de un RAG: colocar Sapling al final de la cadena para comprobar si la afirmación generada está respaldada por los fragmentos recuperados (que se pasan como `evidence`), y desviar a revisión humana los casos con `status = unsure`.
- Auditoría de contenido sanitario o financiero: comprobar que un texto afirmado por un sistema automático no contradice una política publicada, aprovechando la distinción entre falta de información y contradicción real, que un LLM generativo tiende a confundir.
- Etiquetado y curación de datos: usar las salidas calibradas para priorizar casos ambiguos en colas de anotación humana, ya que el conjunto de predicción identifica explícitamente los ejemplos no resueltos (952 de 1.731 en la evaluación publicada).
- Filtro previo en pipelines de moderación o compliance: descartar automáticamente afirmaciones claramente soportadas y enrutar el resto, reduciendo el volumen que llega a un revisor, siempre con el 45 % de cobertura observado como referencia de partida y no como garantía.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (evaluación propia, no independiente):

| Particion | Casos | Accuracy bruta | Respuestas calibradas | Cobertura de respuesta |
|---|---:|---:|---:|---:|
| Combinado | 1.731 | 94,22 % | 779 | 45,00 % |
| Sintético controlado | 1.000 | 100,00 % | 773 | 77,30 % |
| ContractNLI | 731 | 86,32 % | 6 | 0,82 % |

Los 779 casos respondidos coincidieron con la etiqueta de referencia. Quedaron 952 casos sin resolver. En la salida calibrada no hubo ningún falso `supported`; en las predicciones brutas hubo 14. El autor advierte que la evaluación incluye exposición previa a benchmarks y afirmaciones de documentos correlacionados, por lo que debe leerse como caracterización de regresión y desarrollo, no como estimación independiente de rendimiento en organizaciones o poblaciones documentales no vistas; la accuracy real y la cobertura conformal nominal no quedan establecidas por estos resultados. No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa aproximadamente 46 GB en disco y la model card indica que se necesita memoria adicional para inferencia; una estimación razonable en BF16 con overhead de activaciones y caché KV es de 50-60 GB, aunque el fabricante no publica una cifra cerrada.
- GPU de referencia: NVIDIA H200, con Python 3.12 y CUDA 13.0 como entorno de referencia registrado en `evidence/training_runtime.json`.
- GPU recomendadas: H200 o A100/H100 de 80 GB para BF16 sin cuantizar; no se documentan configuraciones multi-GPU ni tensor parallelism.
- GPU de consumo: no cabe en BF16 en tarjetas de 24 GB (RTX 4090, RTX 3090). En teoría una cuantización de 4 bits rondaría los 12-14 GB, pero el paquete no documenta soporte de cuantización y el loader empaquetado exige reconstruir cabeza y adaptadores factorizados.
- Opciones de despliegue: solo el loader y el código de inferencia incluidos en el paquete de pesos. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el repo no puede cargarse con la arquitectura Qwen estándar. El repo lleva la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles. La ruta de inferencia evaluada procesa un ejemplo por llamada y no se publican medidas de latencia ni de tokens por segundo.
- Memoria dependiente de la longitud: el autor señala que el hardware y la longitud de entrada afectan al consumo de memoria, con un techo de 16.384 tokens codificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Banyan Sapling | 23.042.164.740 (MoE podado) | 16.384 tokens codificados | Clasificación de verificación en 4 clases con calibración conformal | Apache 2.0 | Pesos en HF, código propio, research preview |
| Qwen3-30B-A3B-Instruct-2507 (base) | ~30B totales, ~3B activos | contexto nativo largo (no disponible en la información) | Generación de propósito general | Apache 2.0 | Pesos en HF, ecosistema estándar |
| LLM generativo usado como juez (p. ej. el propio Qwen3-30B-A3B-Instruct con prompt de verificación) | ~30B / ~3B activos | el del modelo base | Verificación por prompt, sin calibración ni clases separadas de falta de información y contexto inconsistente | según modelo | inmediata |
| Verificadores NLI dedicados (ContractNLI y similares) | no disponible | no disponible | Entailment / contradicción / neutral | no disponible | no disponible |

La diferencia práctica frente al modelo base y frente a un LLM como juez es la separación explícita entre `insufficient_information` e `inconsistent_context` y la presencia de calibración conformal con cobertura declarada. El coste es un techo de 16.384 tokens frente al contexto nativo del backbone y una cobertura de respuestas del 45 % en el conjunto combinado. No se dispone de datos de benchmarks comparativos frente a alternativas en la información proporcionada.

## Limitaciones y advertencias

- Estado de research preview: 4 descargas y 4 likes en el momento de la consulta; pensado para experimentos de integración y evaluación de dominio, no para producción directa.
- Brecha de dominio material: la calibración compartida deja sin resolver la mayoría de casos contractuales (6 de 731 respondidos, 0,82 % de cobertura en ContractNLI). El ajuste inicial es mucho mejor en escenarios de política controlados (77,30 % de cobertura).
- Cobertura baja en el conjunto combinado: solo 779 de 1.731 casos reciben respuesta calibrada; 952 quedan como `unsure`. La accuracy bruta del 94,22 % no debe citarse sin la cobertura asociada.
- Evaluación no independiente: incluye exposición previa a benchmarks y afirmaciones de documentos correlacionados; el autor la describe como caracterización de regresión y desarrollo. La accuracy en organizaciones o poblaciones documentales no vistas y la cobertura conformal nominal no están establecidas.
- Fallo identificado en interpretación de evidencia: cinco variantes de reclamación de seguros devuelven `unsure`, y la variante elegible obtiene `insufficient_information` en lugar de `supported`.
- Solo inglés: no se declara ni evalúa ningún otro idioma, incluido el castellano.
- Límite de entrada de 16.384 tokens codificados sumando política, evidencia, afirmación y formato, muy por debajo del contexto nativo del backbone Qwen3.
- Procesamiento de un ejemplo por llamada en la ruta evaluada, sin batching documentado; esto limita el throughput en despliegues de alto volumen.
- El modelo solo clasifica el texto suministrado: no recupera fuentes, no autentica documentos, no genera explicaciones y no emite la decisión de negocio final. Confiar en él sin esas capas deja el flujo sin trazabilidad.
- Riesgo de alucinación en sentido estricto bajo, por ser un clasificador, pero riesgo de calibración mal trasladada: la distinción entre resultado no resuelto (`status = unsure`) y la clase `insufficient_information` debe manejarse explícitamente en la aplicación.
- Empaquetado no estándar: los adaptadores LoRA, routers y cabeza en FP32 permanecen sin fusionar y requieren el loader propio; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que complica el despliegue y el escalado.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos de los evaluados; conviene revisar también las condiciones del modelo base.
- Sin datos publicados de sesgos demográficos o lingüísticos; el entrenamiento se apoya mayoritariamente en datos sintéticos (42.809 de 50.000 ejemplos), lo que puede introducir artefactos de generación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MubitLabs/banyan-sapling
- Modelo base Qwen3-30B-A3B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Guía de pesos e inferencia (dentro del repo): https://huggingface.co/MubitLabs/banyan-sapling/blob/main/docs/weights.md
- Informe de evaluación (dentro del repo): https://huggingface.co/MubitLabs/banyan-sapling/blob/main/docs/results.md
- Artefactos de evaluación y resúmenes legibles por máquina: https://huggingface.co/MubitLabs/banyan-sapling/tree/main/evidence
- Runtime de referencia del entrenamiento: https://huggingface.co/MubitLabs/banyan-sapling/blob/main/evidence/training_runtime.json
