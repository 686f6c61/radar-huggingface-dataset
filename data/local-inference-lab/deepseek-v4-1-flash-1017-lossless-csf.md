# local-inference-lab/DeepSeek-V4.1-Flash-1017-lossless-CSF

## Resumen

DeepSeek-V4.1-Flash-1017-lossless-CSF es un checkpoint cuantizado en MXFP4 del modelo deepseek-ai/DeepSeek-V4.1-Flash-1017, publicado por local-inference-lab. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es un artefacto de distribución cuyo único cambio respecto al modelo base es la compresión sin pérdida de los planos de escala MXFP4, mientras que el resto de tensores y los ficheros de metadatos conservan sus bytes originales. El autor lo describe como una conversión «lossless» de las matrices de escala, no una recuantización.

El interés práctico está en el contenedor: reduce el tamaño de los shards de 510.296.708.312 bytes a 495.632.175.852 bytes (unos 14,66 GB menos, un 2,87 %) y las escalas de 16.986.931.200 a 2.316.453.540 bytes, mediante el esquema lil-mxfp4-csf-checkpoint/1 y el códec row-base-offset1-u24-exceptions/1. Sin embargo, el paquete no es directamente servible con los cargadores habituales: requiere un loader compatible con CSF y una reconstrucción previa de los shards originales validada por SHA-256.

La información disponible no documenta arquitectura, número de parámetros, longitud de contexto ni capacidades del modelo base, y no se han publicado benchmarks. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y la licencia del contenedor (LIL-1.0) es distinta de la del material upstream (MIT).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no documenta la arquitectura del modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 con planos de escala comprimidos sin pérdida (CSF); los tags del repositorio mencionan también fp8 |
| Idiomas soportados | no disponible |
| Licencia | LIL-1.0 (LicenseRef-LIL-1.0) para el contenedor; el material upstream de deepseek-ai/DeepSeek-V4.1-Flash-1017 permanece bajo MIT |
| Formato de pesos | safetensors modificado: tensores de escala reemplazados por `.mxfp4_csf_fixed` (U8) y `.mxfp4_csf_exceptions` (U32); sin índice safetensors en la raíz; requiere loader CSF-aware |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017, revisión `1bae0e1088993b9b82de08f59de5be5a34e42170` |
| Relación con el modelo base | quantized |
| Esquema de contenedor | `lil-mxfp4-csf-checkpoint/1` |
| Códec | `row-base-offset1-u24-exceptions/1` |
| Matrices de escala comprimidas | 46.080 |
| Bytes de escala | 16.986.931.200 en origen; 2.316.453.540 codificados |
| Bytes de shards | 510.296.708.312 en origen; 495.632.175.852 codificados |
| Tamaño del repositorio | 495,6 GB |
| Autor | local-inference-lab |
| Fecha de creación / actualización | 2026-10-18 / 2026-10-18 |

## Arquitectura y entrenamiento

El paquete no contiene ningún proceso de entrenamiento: es una conversión de formato y compresión de un checkpoint ya existente. Según la model card, se seleccionan determinados planos de escala de bloque MXFP4 y se comprimen con codificación entera de bytes, sin recuantización; el resto de cargas útiles de tensores y los ficheros de `metadata/` conservan sus bytes originales. La estructura resultante incluye `tensors/` con los nombres base de los shards de origen, `receipts/` con las cabeceras y hashes originales, `build-contract.json` con el inventario de tensores de origen, y `lil-manifest.json` junto con `SHA256SUMS` para inventariar todos los ficheros del paquete.

La verificación registrada de almacenamiento y reconstrucción en CPU se declara superada (`true`), pero la propia model card advierte que esa cualificación se limita a «storage and CPU reconstruction» y que no cualifica el modelo para servir inferencia. Para recuperar los shards originales hay que usar exactamente los bytes de cabecera registrados en los receipts y los offsets originales de carga útil, y validar el SHA-256 contra dichos receipts. No se documenta ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF/DPO, ni innovaciones de atención o decodificación del modelo base.

## Capacidades

- No se documentan capacidades del modelo base en la información proporcionada: generación de texto, razonamiento, código, matemáticas o visión quedan como «no disponible».
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta cobertura multilingüe; el campo de idiomas del repositorio figura como no disponible.
- La única capacidad verificable del artefacto es la reconstrucción byte a byte de los shards originales y la validación de integridad mediante SHA-256 contra los receipts.
- El contenedor conserva el tokenizer y la config originales en `metadata/`, lo que permite reutilizar el pipeline del modelo base una vez reconstruidos los pesos.
- Marcas identificativas incluidas por el licenciante: «Ні пуху, ні пера» y `LIL-CANARY-3272-AD41-4E28-4DD8`.

## Casos de uso

- Distribución de pesos con ancho de banda reducido: el paquete recorta 14.664.532.460 bytes (un 2,87 %) respecto a los shards de origen, un ahorro útil al replicar el checkpoint en espejos internos o en redes con cuotas de transferencia, siempre que el destino pueda ejecutar la reconstrucción.
- Reconstrucción en entornos air-gapped: permite transportar el contenedor y regenerar los shards originales usando los bytes de cabecera de `receipts/` y los offsets originales, validando después el SHA-256 para garantizar que los pesos servidos son idénticos a los del modelo base.
- Archivado y verificación de integridad a largo plazo: `lil-manifest.json` y `SHA256SUMS` inventarían todos los ficheros del paquete excepto los dos propios ficheros de inventario, lo que facilita auditorías periódicas de un checkpoint de casi 500 GB.
- Investigación en compresión de cuantización: con 46.080 matrices de escala comprimidas y un códec documentado, el artefacto sirve como caso de estudio reproducible de compresión sin pérdida sobre planos de escala MXFP4, comparando los 16.986.931.200 bytes de origen con los 2.316.453.540 codificados.
- Evaluación de fidelidad tras descompresión: al ser una conversión declarada sin pérdida, permite medir si las salidas del modelo reconstruido coinciden con las del checkpoint original, aislando el efecto de la compresión del efecto de la cuantización MXFP4.
- Auditoría de cumplimiento licencial: la separación entre LIL-1.0 (contenedor) y MIT (material upstream), junto con `LICENSE`, `NOTICE`, `LICENSES/` y `metadata/LICENSE`, permite revisar obligaciones de atribución antes de un despliegue comercial.
- Preparación de pipelines de serving: solo tiene sentido como paso previo a la reconstrucción; un equipo que quiera servir el modelo debe reconstruir los shards y cargarlos con un stack que soporte MXFP4, dado que el contenedor CSF no es servible tal cual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Rendimiento de serving (latencia, throughput) | no disponible |

## Requisitos de hardware

- Almacenamiento: 495,6 GB (aproximadamente 461,6 GiB) para el paquete tal como se distribuye; si se reconstruyen los shards originales hay que prever además 510.296.708.312 bytes (unos 475,3 GiB), es decir, del orden de 1 TB de espacio libre durante el proceso.
- VRAM estimada: no disponible como medición publicada. Como referencia derivada, el conjunto de pesos MXFP4 codificado ocupa unos 461,6 GiB, a los que hay que sumar caché KV y activaciones, por lo que el modelo no es desplegable en una sola GPU convencional y exige agregación multi-GPU o multi-nodo.
- GPU recomendadas: no disponible en la información proporcionada; por volumen de pesos, un nodo de 8 GPU de 80 GB (por ejemplo, clase H100/H200) queda por debajo del tamaño de pesos codificado, por lo que haría falta más capacidad o un esquema de descarga por capas.
- GPU de consumo: no cabe. El tamaño del checkpoint supera en dos órdenes de magnitud la VRAM de una RTX 4090 (24 GB).
- Opciones de despliegue: no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI. La model card indica explícitamente que se requiere un cargador de checkpoints compatible con CSF, y que la verificación superada no cualifica el modelo para servir.
- Latencia y throughput: no disponible.
- Nota operativa: el paquete no incluye índice safetensors en la raíz, solo `config.json` como copia sin cambios y los metadatos en `metadata/`; cualquier herramienta que espere un índice estándar fallará sin un adaptador previo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Tamaño / disponibilidad |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | pesos originales del autor | MIT | shards de origen: 510.296.708.312 bytes |
| local-inference-lab/DeepSeek-V4.1-Flash-1017-lossless-CSF (este) | no disponible | no disponible | MXFP4 con escalas comprimidas CSF | LIL-1.0 (contenedor) + MIT (upstream) | 495.632.175.852 bytes de shards; 0 descargas, 1 like |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documenta nada sobre sesgos del modelo base ni sobre el efecto de la cuantización MXFP4 en ellos.
- Riesgo de alucinación: no disponible para el modelo base; no hay evaluaciones publicadas en la información proporcionada.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y la cobertura idiomática.
- Restricciones de licencia: el contenedor se distribuye bajo LIL-1.0 (LicenseRef-LIL-1.0), una licencia propia de Local Inference Lab, Inc. distinta de la del modelo base. El material upstream de deepseek-ai/DeepSeek-V4.1-Flash-1017 permanece bajo MIT, pero el uso del paquete requiere revisar `LICENSE`, `NOTICE`, `LICENSES/` y `metadata/LICENSE` antes de cualquier explotación comercial.
- El artefacto no es servible directamente: exige un loader CSF-aware, la reconstrucción de los shards con los bytes de cabecera registrados y la validación SHA-256 contra los receipts.
- La verificación declarada cubre únicamente almacenamiento y reconstrucción en CPU; el autor indica explícitamente que no cualifica el modelo para servir inferencia.
- No hay índice safetensors en la raíz: las herramientas estándar de carga no reconocerán el paquete sin adaptación.
- Trazabilidad limitada: 0 descargas y 1 like, un único autor, y ninguna validación independiente de la conversión publicada en la información disponible.
- Presencia de cadenas canary en la licencia: si aparecen en otro sitio, pueden indicar redistribución no autorizada del paquete.
- No se documenta el impacto de la compresión de escalas en la calidad de salida más allá de la afirmación de «lossless» del autor, que conviene verificar de forma independiente antes de producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/local-inference-lab/DeepSeek-V4.1-Flash-1017-lossless-CSF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Revisión del modelo base referenciada: `1bae0e1088993b9b82de08f59de5be5a34e42170`
- Licencia del contenedor: `LICENSE` (incluido en el repositorio)
- Aviso de atribución: `NOTICE` (incluido en el repositorio)
- Licencias de terceros: `LICENSES/` (incluido en el repositorio)
- Licencia upstream: `metadata/LICENSE` (incluido en el repositorio)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a agencias de comunicación, alojamiento de locales comerciales y a la aplicación LocalWP, sin relación con este artefacto.
