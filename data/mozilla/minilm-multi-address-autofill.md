# Mozilla/minilm-multi-address-autofill

## Resumen

Mozilla/minilm-multi-address-autofill es un clasificador monolítico de tipo de campo (field-type classifier) desarrollado por Mozilla para el sistema de autocompletado de formularios de Firefox. El modelo predice, para cada campo de un formulario, un token de estilo `autocomplete` a partir de sus `mlData` (atributos `id`, `name`, `placeholder` y `label`, más contexto de campos vecinos del tipo `bb`/`aa`). Se enmarca en el flujo interno de autofill (`autofillflow`) y está pensado para ejecutarse en el propio navegador.

Técnicamente parte de un encoder MiniLM-L12 multilingüe podado a un vocabulario de 18.473 tokens y reducido a 4 capas, con 14.562.882 parámetros totales. El repositorio ocupa 0,2 GB e incluye pesos en fp32 (safetensors y ONNX) y una variante int8 en ONNX de 14,7 MB, diseñada para ser numéricamente estable en acumuladores int16 con AVX2.

Su relevancia radica en tres factores: es un modelo de clasificación de muy bajo coste computacional, cubre siete idiomas (en, de, es, ja, it, nl, pt) y está publicado bajo licencia MPL-2.0, lo que permite integrarlo en navegadores y productos derivados. La mejora declarada frente al baseline anterior es un incremento de ~16 puntos en el recall de campos de nombre completo (0,783 → 0,940 en validación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) basado en MiniLM-L12 podado, monolítico de secuencia única ("bb") |
| Parametros totales | 14.562.882 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32; int8 (per-channel + reduce_range) |
| Idiomas soportados | en, de, es, ja, it, nl, pt (segun la model card) |
| Licencia | MPL-2.0 |
| Formato de pesos | safetensors (PyTorch fp32); ONNX (fp32 e int8) |
| Capas del encoder | 4 |
| Tamano de vocabulario | 18.473 tokens |
| Tamano del repositorio | 0,2 GB |
| Tamano de la variante int8 | 14,7 MB |
| Tarea (pipeline) | text-classification |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Fecha de actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT derivado de `rolf-mozilla/minilm-pruned-notest-relabel`, un MiniLM-L12 multilingüe podado a un vocabulario de 18.473 tokens (construido solo con los splits de train y val, excluyendo test) y recortado a 4 capas. La variante publicada aquí es "monolítica de secuencia única" (denominada `bb` en la nomenclatura interna): recibe una única secuencia por campo y produce una clasificación de tipo de campo, en lugar de un esquema multi-secuencia con pares o contextos separados. Las características de entrada (`mlData`) incluyen rasgos adicionales como `select_option` (token de rango de opciones) e `input_attributes` (`**maxlen<N>` y `**inputmode`).

Los datos de entrenamiento corresponden al corpus `-relabel`, reetiquetado mediante una auditoría con o4-mini (correcciones de `name`/`label`), fusionado con un lote nuevo de Common Crawl multilingüe (CC-MAIN-2026-34: en/de/es/ja/it/nl/pt) integrado en `data/common_crawl`. El entrenamiento se ejecutó con Metaflow (run `argo-autofillflow-8wpwd`, namespace `production:autofillflow-0-egrc`) con los siguientes hiperparámetros: 4 capas de encoder, 6 épocas, batch 32, learning rate 7e-5, warmup 0,1, weight_decay 0,05, ratio gen_to_real 2.0 y submuestreo de validación. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Clasificación de tipo de campo de formulario: asigna a cada campo un token de estilo `autocomplete` a partir de `id`, `name`, `placeholder`, `label` y contexto de vecinos.
- Procesamiento multilingüe de formularios en en, de, es, ja, it, nl, pt.
- Uso de contexto de campos adyacentes (`bb`/`aa`) para desambiguar campos cuyo texto aislado es ambiguo.
- Incorporación de atributos estructurales del campo (`select_option` para rangos de opciones, `**maxlen<N>` e `**inputmode`).
- Inferencia local de bajo coste: variante int8 de 14,7 MB apta para ejecución en CPU.
- Compatibilidad con ONNX Runtime (fp32 e int8) además de PyTorch vía transformers.
- No dispone de generación de texto, razonamiento multi-step, tool calling, visión ni audio según la información disponible.

## Casos de uso

- Autocompletado de formularios en Firefox: el modelo se integra en el flujo de autofill del navegador para decidir qué dato del perfil del usuario corresponde a cada campo, ejecutándose localmente y sin enviar los valores a servidores externos.
- Relleno de campos de dirección (multi-address): la variante "multi-address" está orientada a formularios con varios campos de dirección, donde el contexto de vecinos (`bb`/`aa`) permite distinguir entre dirección, ciudad, código postal o región aunque las etiquetas sean pobres.
- Clasificación de campos de nombre completo frente a nombre de familia: la mejora de recall de `name` (0,783 → 0,940 en validación) la hace adecuada para formularios que separan nombre y apellidos, un caso históricamente problemático.
- Preprocesado de formularios en pipelines de scraping o RPA: dado un formulario HTML, asignar a cada input un token semántico normalizado para mapearlo automáticamente a un esquema de datos estructurado.
- QA y auditoría de formularios web: detectar campos con `autocomplete` incorrecto o ausente comparando la predicción del modelo con el etiquetado real del sitio.
- Asistentes de accesibilidad: etiquetar campos sin `label` visible para que lectores de pantalla o ayudas técnicas dispongan de una categoría semántica inferida.
- Integración en navegadores derivados de Firefox o en extensiones: al publicarse bajo MPL-2.0 y con variante int8 en ONNX, puede embeberse en productos de terceros que necesiten autocompletado sin depender de servicios en la nube.
- Ejecución server-side en lote: con ONNX Runtime y el modelo int8 de 14,7 MB se pueden procesar grandes volúmenes de formularios en CPU sin necesidad de GPU.

## Benchmarks y rendimiento

| Split | Total acc | Close acc | `name` recall |
|---|---|---|---|
| test (`data/testing`) | 0,8873 | 0,9117 | 0,826 |
| validation | 0,9042 | 0,9270 | 0,940 |

Precisión de la cuantización int8: fp32 0,8873 → int8 0,8861 sobre `testing-relabel.txt` (Δ −0,12 pt, considerada "lossless" por el autor). No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni benchmarks generalistas equivalentes.

## Requisitos de hardware

- VRAM estimada: no aplica realmente; el modelo puede ejecutarse en CPU. Los pesos fp32 ocupan aproximadamente 58 MB y la variante int8 exactamente 14,7 MB.
- GPU recomendadas: ninguna específica; cualquier GPU con soporte CUDA o ROCm puede ejecutarlo, pero sería sobredimensionado para su tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), aunque no es necesario.
- Despliegue: transformers (PyTorch, fp32), ONNX Runtime (fp32 e int8). Los tags del repositorio incluyen `text-embeddings-inference` y `endpoints_compatible`, aunque la tarea declarada es `text-classification`.
- La variante int8 está específicamente construida con per-channel + reduce_range y pesos dentro de ±64 para ser segura en acumuladores int16 con AVX2 (Bugzilla 2064781).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mozilla/minilm-multi-address-autofill | 14.562.882 | no disponible | test acc 0,8873; `name` recall val 0,940 | MPL-2.0 | HuggingFace (safetensors + ONNX) |
| `rolf-mozilla/minilm-pruned-notest-relabel` (encoder base) | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciado en la model card) |
| Baseline `bb` anterior | no disponible | no disponible | `name` recall val 0,783 | no disponible | no disponible |
| Equivalentes públicos de clasificación de campos de formulario | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos alternativos con especificaciones comparables para la tarea concreta de clasificación de campos de autocompletado.

## Limitaciones y advertencias

- El recall de `name` en test (0,826) es notablemente inferior al de validación (0,940), lo que sugiere una posible brecha de dominio entre ambos conjuntos.
- La precisión global en test (0,8873) es ~1,7 puntos inferior a la de validación (0,9042), un indicio de sobreajuste moderado.
- No se documentan sesgos concretos, pero al entrenarse sobre Common Crawl multilingüe puede heredar sesgos de ese corpus.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre; el riesgo se traduce en asignaciones de tipo de campo incorrectas, no en contenido inventado.
- Cobertura idiomática limitada a siete idiomas (en, de, es, ja, it, nl, pt); el rendimiento fuera de ellos no está documentado.
- El repositorio presenta 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia MPL-2.0 permite uso comercial, la integración de código MPL-2.0 en productos derivados puede imponer obligaciones de publicación de las modificaciones del archivo cubierto; conviene revisarlo con asesoría legal.
- La fecha de creación (2026-09-10) es posterior a la fecha actual en muchos entornos, lo que puede afectar a la reproducibilidad de la instalación si no se ha replicado la versión exacta de librerías.
- No se documenta el tratamiento de datos personales dentro de los formularios; el diseño local en el navegador es una mitigación, pero no garantiza que no se registren atributos sensibles.

## Enlaces

- HuggingFace: https://huggingface.co/Mozilla/minilm-multi-address-autofill
- Modelo base referenciado: `rolf-mozilla/minilm-pruned-notest-relabel` (sin URL completa en la información disponible)
- Bugzilla 2064781 (referencia técnica sobre el acumulador int16 y AVX2): no se proporciona URL directa en la información disponible
- Los resultados de búsqueda web obtenidos corresponden únicamente a páginas genéricas de Mozilla y Firefox (https://www.mozilla.org/, https://www.firefox.com/) y no aportan documentación técnica adicional sobre este modelo.
