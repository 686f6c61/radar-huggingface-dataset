# FlippyDora/drpo-dppo-qwen3-30b-fp8e2e-step200

## Resumen

FlippyDora/drpo-dppo-qwen3-30b-fp8e2e-step200 es un checkpoint derivado de Qwen/Qwen3-30B-A3B-Base, publicado por el usuario FlippyDora en Hugging Face. Se trata de un artefacto de investigación que contiene dos exportaciones en BF16 (etiquetadas `drpo` y `dppo-0.3`) correspondientes al paso 200 de sendas ejecuciones de entrenamiento en FP8 end-to-end sobre el modelo base Qwen3-30B-A3B. La nomenclatura sugiere métodos de optimización por preferencias o por política directa (DRPO y DPPO), aunque la model card no documenta el algoritmo, los datos de entrenamiento ni los objetivos.

El repositorio no contiene pesos en formato convencional, sino fragmentos almacenados como deltas XOR sin pérdida respecto al snapshot base de Qwen3-30B-A3B-Base (revisión `1b75feb79f60b8dc6c5bc769a898c206a1c6a4f9`). Para obtener un directorio de modelo estándar de Hugging Face es necesario ejecutar el script `restore_30b.py`, que verifica el SHA-256 de cada fragmento original y de cada fragmento reconstruido. El tamaño del repositorio es de 17,6 GB.

Por tanto, no se trata de un modelo listo para usar, sino de un snapshot intermedio de un experimento de ajuste fino, con cero descargas y cero likes en el momento de la consulta. Su interés es fundamentalmente reproducibilidad de investigación: permite reconstruir exactamente los pesos del paso 200 de dos variantes de entrenamiento FP8 a partir del modelo base fijado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | heredada de Qwen3-30B-A3B-Base (MoE transformer; no detallada en la model card) |
| Parámetros totales | ~30B (heredados del modelo base; no confirmado en la model card) |
| Parámetros activos | ~3B (heredados del modelo base; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos exportados en BF16; el entrenamiento se realizó en FP8 end-to-end |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors empaquetados como deltas XOR sin pérdida; requieren reconstrucción con `restore_30b.py` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-30B-A3B-Base, un transformer con mezcla de expertos (MoE) de aproximadamente 30 mil millones de parámetros totales y unos 3 mil millones activos por token, según la convención de nombres del modelo base. La model card de este repositorio no aporta detalles adicionales sobre capas, atención, tokenizador ni ventana de contexto; toda esa información debe consultarse en la ficha del modelo base.

El proceso de entrenamiento documentado se limita a indicar que existen dos ejecuciones históricas de ajuste en FP8 end-to-end, denominadas `drpo` (con escala 12,5) y `dppo-0.3` (con umbral Binary-TV de 0,3), y que ambas exportaciones corresponden al paso 200. No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, ni la naturaleza exacta de las siglas DRPO y DPPO. Tampoco se describe la innovación técnica del entrenamiento en FP8 más allá del parámetro de escala y del umbral mencionados.

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base Qwen3-30B-A3B-Base, sujetas a los cambios introducidos por el ajuste en el paso 200.
- Capacidades de código y matemáticas: presumiblemente heredadas del modelo base; no verificadas en este checkpoint.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingües: no documentadas; los idiomas no están listados.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.
- Reproducibilidad: el repositorio permite reconstruir de forma verificable dos checkpoints BF16 a partir del modelo base fijado por revisión.

## Casos de uso

- Reproducción de experimentos de ajuste en FP8: el script `restore_30b.py` permite regenerar los pesos exactos del paso 200 de las variantes `drpo` y `dppo-0.3`, lo que facilita auditar o continuar líneas de investigación sobre entrenamiento de precisión reducida.
- Comparación de métodos de optimización: al disponer de dos exportaciones (DRPO y DPPO con umbral 0,3) del mismo paso, se pueden contrastar sus comportamientos en evaluaciones controladas.
- Estudio de deltas XOR como formato de distribución: el repositorio sirve como caso práctico de empaquetado sin pérdida de checkpoints grandes, con verificación criptográfica de integridad.
- Investigación sobre estabilidad numérica en FP8: la escala 12,5 de `drpo` y el umbral Binary-TV de 0,3 de `dppo-0.3` son parámetros concretos que pueden analizarse en estudios de cuantización.
- Base para ajuste posterior: una vez reconstruido, el checkpoint puede emplearse como punto de partida para nuevos ajustes, siempre que se respete la licencia del modelo base.
- Docencia y formación: el flujo de reconstrucción con verificación SHA-256 es un ejemplo didáctico de gestión reproducible de artefactos de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; para un MoE de ~30B en BF16 se requiere del orden de 60 GB de VRAM, y en FP8 del orden de 30 GB, aunque estas cifras son estimaciones generales no confirmadas para este checkpoint.
- GPU recomendadas: no disponibles; por tamaño, cabría esperar A100 80 GB, H100 80 GB o configuraciones multi-GPU, sin confirmación del autor.
- ¿Cabe en GPU de consumo? No disponible; un MoE de ~30B en BF16 no cabe en una RTX 4090 de 24 GB, y en FP8 requeriría al menos dos GPU de 24 GB, pero no hay datos verificados.
- Opciones de despliegue: no documentadas; al reconstruirse como directorio estándar de Hugging Face, podría cargarse con frameworks habituales (vLLM, TGI, transformers), aunque no se ha validado.
- Latencia y throughput: no disponibles.
- Espacio en disco: el repositorio ocupa 17,6 GB en deltas XOR; la reconstrucción genera directorios de modelo completos cuyo tamaño no se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| FlippyDora/drpo-dppo-qwen3-30b-fp8e2e-step200 | ~30B totales / ~3B activos (heredado) | no disponible | no disponible | deltas XOR; requiere reconstrucción | snapshot de paso 200 de dos experimentos FP8 |
| Qwen/Qwen3-30B-A3B-Base | ~30B totales / ~3B activos | no disponible en esta ficha | no disponible en esta ficha | pesos estándar en Hugging Face | modelo base del que deriva |
| Qwen/Qwen3-30B-A3B | ~30B totales / ~3B activos | no disponible en esta ficha | no disponible en esta ficha | pesos estándar en Hugging Face | variante instruct del mismo tamaño |

## Limitaciones y advertencias

- No es un modelo listo para usar: los pesos están empaquetados como deltas XOR y requieren ejecutar `restore_30b.py` con el snapshot base exacto (`1b75feb79f60b8dc6c5bc769a898c206a1c6a4f9`) para obtener directorios de modelo estándar.
- Licencia no especificada: no se indica la licencia del checkpoint ni se aclaran las restricciones de uso comercial; debe consultarse la licencia del modelo base Qwen3-30B-A3B-Base.
- Idiomas no documentados: no se lista el soporte multilingüe.
- Contexto no documentado: se desconoce la ventana de contexto efectiva de este checkpoint.
- Sesgos y alucinaciones: no evaluados en la model card; al ser un paso intermedio de entrenamiento, el comportamiento puede diferir del modelo base y de la variante instruct.
- Estado experimental: se trata de un snapshot del paso 200, sin benchmarks ni validación publicada, con cero descargas y cero likes.
- Riesgo de reproducibilidad: la reconstrucción depende de la disponibilidad de la revisión exacta del modelo base y de la integridad de los fragmentos XOR.
- Sin datos de entrenamiento: no se documentan dataset, número de tokens ni objetivos de optimización, lo que dificulta evaluar sesgos introducidos por el ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/FlippyDora/drpo-dppo-qwen3-30b-fp8e2e-step200
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base/tree/1b75feb79f60b8dc6c5bc769a898c206a1c6a4f9
- Script de reconstrucción: `restore_30b.py` (incluido en el repositorio)
