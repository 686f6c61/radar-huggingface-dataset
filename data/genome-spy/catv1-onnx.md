# genome-spy/CATv1-ONNX

## Resumen

CATv1-ONNX es la conversión a formato ONNX del atlas Cherimoya CATv1, un conjunto de modelos de aprendizaje profundo diseñados para predecir la accesibilidad de la cromatina humana a partir de secuencia de ADN. El modelo original lo desarrolla programmable-genomics; esta conversión la publica GenomeSpy con el objetivo de permitir inferencia en navegador mediante onnxruntime-web y WebGPU. El modelo resuelve un problema de genómica funcional: predecir perfiles de accesibilidad (ATAC-seq y DNase-seq) directamente desde la secuencia de referencia GRCh38/hg38, sin necesidad de datos experimentales.

La relevancia actual del artefacto es doble. Por un lado, el atlas original contiene 7.590 checkpoints distribuidos en 1.518 experimentos (cinco folds por experimento), lo que lo convierte en un recurso de gran escala para modelado de regulación génica. Por otro, esta conversión demuestra que es viable ejecutar modelos genómicos de este tamaño en el navegador con aceleración WebGPU, lo que abre la puerta a herramientas interactivas de análisis genómico sin infraestructura de servidor.

Es importante subrayar que el repositorio está en estado de "population in progress": solo se publicará un `manifest.json` completo cuando todos los checkpoints superen la puerta de aceptación. La conversión no aplica cuantización, reentrenamiento ni ajuste fino; mantiene los pesos en float32 y conserva la semántica de entrada/salida del modelo original. Esta release cubre únicamente inferencia forward y scoring de perturbaciones, no gradientes para métodos como DeepLIFT, PISA o Ledidi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda para predicción de accesibilidad de cromatina (detalles arquitectónicos del modelo original no disponibles en la información proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Entrada fija de 2.114 pares de bases (ventana de secuencia); salida de 1.000 posiciones |
| Tipos de cuantizacion | float32 únicamente (sin cuantización aplicada) |
| Idiomas soportados | en (inglés, para metadatos y documentación; el modelo opera sobre secuencia de ADN, no sobre lenguaje natural) |
| Licencia | CC BY 4.0 (pesos y metadatos del publicador original); software Cherimoya bajo MIT |
| Formato de pesos | ONNX (float32), con recibos `.onnx.json` adyacentes por artefacto |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original CATv1 (número de capas, tipo de bloques, mecanismos de atención o convoluciones). Lo que sí se especifica es el contrato tensorial de la conversión: la entrada `sequence` es un tensor float32 de forma `[batch, 4, 2114]` con orden de canales A/C/G/T (las N se codifican como todo ceros). Las salidas son `profile_logits` (float32 `[batch, 1, 1000]`, logits crudos) y `log_counts` (float32 `[batch, 1]`, log1p del conteo total crudo). La ventana de entrada `[s, s+2114)` produce una salida sobre `[s+557, s+1557)` en coordenadas zero-based half-open sobre GRCh38/hg38.

El modelo se distribuye como un atlas de 7.590 checkpoints (1.518 experimentos × 5 folds). La conversión a ONNX no aplica cuantización, reentrenamiento ni ajuste fino: preserva los pesos en float32 y valida la paridad numérica entre PyTorch nativo y ONNX Runtime en CPU con `rtol=1e-4, atol=5e-5`. Los casos de validación cubren ADN de GATA2 y HBG1, complemento reverso, un SNV, Ns internas, ADN todo-N, batches de tamaño 1/3/6 y controles BAT cero/no cero. Las reducciones largas de normalización se dividen en fragmentos iguales para reducir el error de acumulación, sin cambiar las tolerancias. No se emplean operadores ONNX personalizados. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada y se remiten al repositorio fuente bajo `source/`.

Una innovación destacable del artefacto es la decodificación documentada: para obtener un ejemplo hay que aplanar todos los canales de perfil y las 1.000 posiciones juntos, aplicar un único softmax numéricamente estable, multiplicar por `max(expm1(log_counts), 0)` y rehacer la forma. En BAT, los canales plus/minus comparten un único perfil normalizado conjuntamente y un único conteo total; aplicar softmax separados por hebra duplica incorrectamente el total.

## Capacidades

- Predicción de accesibilidad de cromatina humana (ATAC-seq y DNase-seq) a partir de secuencia de ADN en GRCh38/hg38.
- Inferencia forward sobre ventanas de 2.114 pb con salida de 1.000 posiciones de perfil y conteo total.
- Scoring de perturbaciones (variantes, SNVs) para evaluar el efecto sobre la accesibilidad predicha.
- Soporte de controles BAT: señal plus/minus en el mismo locus sobre la ventana completa de entrada; los controles a cero permiten predicción solo-secuencia.
- Ejecución en navegador mediante onnxruntime-web 1.31.1 con WebGPU (entry point `onnxruntime-web/webgpu`).
- Manejo de lotes (batches de 1, 3 y 6 validados).
- Procesamiento de secuencias con Ns internas y secuencias todo-N.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step en el sentido de los LLM; es un modelo especializado de genómica.
- No dispone de modo thinking, visión ni audio.
- No proporciona gradientes para DeepLIFT, PISA o Ledidi en esta release.

## Casos de uso

- Análisis interactivo de variantes en navegador: un investigador puede cargar una secuencia genómica y evaluar el efecto de un SNV sobre la accesibilidad predicha sin enviar datos a un servidor, usando WebGPU y onnxruntime-web. Es adecuado porque el modelo opera con ventanas fijas de 2.114 pb y produce salidas interpretables por posición.
- Priorización de variantes no codificantes: dado un conjunto de variantes en regiones reguladoras, el modelo permite puntuar cambios en accesibilidad y priorizar candidatos para validación experimental. El scoring de perturbaciones está explícitamente cubierto por esta release.
- Herramientas educativas y de visualización genómica: la ejecución en navegador facilita integrar predicciones de accesibilidad en visores genómicos tipo GenomeSpy, mostrando perfiles predichos junto a datos experimentales.
- Reproducción de experimentos ENCODE: el modelo se entrenó sobre experimentos ENCODE (por ejemplo, ENCSR000ELW) y permite generar predicciones comparables a ATAC-seq/DNase-seq medidos, útil para control de calidad y validación cruzada.
- Prototipado rápido sin infraestructura GPU: al ejecutarse en WebGPU sobre el navegador, equipos sin servidores dedicados pueden explorar hipótesis de regulación génica con latencias de inferencia cálida aceptables.
- Selección de checkpoints por experimento y fold: dado que el atlas contiene 1.518 experimentos con 5 folds, un usuario puede descargar solo el experimento/fold relevante (sin descarga completa del atlas) y ejecutarlo localmente para su tejido o línea celular de interés.
- Evaluación de sesgos de secuencia: los controles BAT permiten comparar predicciones solo-secuencia frente a predicciones con controles medidos, ayudando a estudiar la contribución de la secuencia frente a la cromatina de fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta validación numérica de paridad entre PyTorch nativo y ONNX Runtime en CPU (`rtol=1e-4, atol=5e-5`) y una prueba representativa en WebGPU sobre Apple Metal en Chromium 153 con ORT Web 1.31.1 para el experimento ENCSR000ELW fold 0, donde todas las comparaciones de cabezas crudas y conteos decodificados pasaron. No se proporcionan métricas biológicas (AUROC, correlación con señales medidas) ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 8,2 GB, pero se recomienda descargar un único experimento/fold según necesidad.
- GPU recomendadas: no se especifican modelos concretos; la validación WebGPU se realizó sobre Apple Metal en Chromium 153.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; depende de que el navegador exponga un adaptador WebGPU funcional.
- Opciones de despliegue: onnxruntime-web 1.31.1 con entry point `onnxruntime-web/webgpu` (servido por HTTPS o localhost); también es posible ejecutar ONNX Runtime nativo en CPU para validación.
- Limitaciones de placement: algunos nodos del grafo se asignan a CPU (incluido trabajo de formas de ORT); deshabilitar el fallback a CPU rechaza la sesión. La selección de proveedor no garantiza que todos los nodos se ejecuten en GPU.
- Latencia y throughput: no se publican cifras concretas; la model card indica que la compilación inicial de shaders es más lenta que la inferencia en caliente y que los tiempos reportados son wall-clock de `session.run`, incluyendo transferencias y potencialmente afectados por conversión/logging concurrentes. El perfilado por timestamps de GPU no produjo callbacks en el harness usado.
- No se reclama aceptación en PWA instalada, Safari, Firefox ni móvil.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos genómicos (por ejemplo, Enformer, Basenji, Borzoi u otros) ni datos de rendimiento que permitan una comparativa rigurosa.

## Limitaciones y advertencias

- Estado incompleto: el atlas está en "population in progress"; no debe inferirse cobertura completa a partir de los ficheros presentes. El `manifest.json` completo solo se publicará cuando todos los checkpoints pasen la puerta de aceptación.
- Sin validación biológica: la paridad numérica de la conversión no constituye validación biológica ni calibración de conteos entre experimentos.
- Sin gradientes: esta release no soporta DeepLIFT, PISA ni Ledidi; solo inferencia forward y scoring de perturbaciones.
- Controles BAT: se requieren controles en el mismo locus con señal plus/minus sobre la ventana completa; los controles a cero permiten predicción solo-secuencia pero no establecen corrección de sesgo ni reproducen la inferencia con controles medidos. CAT no tiene entrada de control.
- Decodificación delicada: aplicar softmax por hebra en BAT duplica incorrectamente el conteo total; es obligatorio normalizar conjuntamente el perfil y usar un único conteo total.
- Dependencia de WebGPU: el navegador necesita un adaptador WebGPU funcional; la selección de proveedor no garantiza ejecución completa en GPU y el fallback a CPU es necesario para algunos nodos.
- Cobertura de pruebas limitada: la validación WebGPU es representativa (un experimento/fold, Apple Metal, Chromium 153) y no garantiza compatibilidad con todos los checkpoints, navegadores o GPUs.
- Licencia: los pesos y metadatos están bajo CC BY 4.0, que permite uso comercial con atribución a programmable-genomics, los autores de Cherimoya y los contribuidores de ENCODE. El software Cherimoya es MIT y se distribuye por separado.
- No es una release avalada por el equipo upstream: GenomeSpy aporta serialización y validación numérica; los modelos y metadatos originales son de programmable-genomics.
- Idiomas: el modelo no procesa lenguaje natural; la etiqueta "en" se refiere a la documentación. No hay capacidades multilingües en el sentido convencional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/genome-spy/CATv1-ONNX
- Modelo base original: https://huggingface.co/programmable-genomics/CATv1
- Revisión fuente citada: `dfdd7b6b0a9b20bd59427337e4244056b128bda9`
- Software Cherimoya (MIT), commit fijado: `73ce51841b6af672bcd423b969ce6f06dd40fc9d`
- Documentación de onnxruntime-web: https://www.npmjs.com/package/onnxruntime-web
- Especificación WebGPU: https://www.w3.org/TR/webgpu/
- ENCODE (datos y experimentos de referencia): https://www.encodeproject.org/
- Referencia del genoma GRCh38/hg38: https://www.ncbi.nlm.nih.gov/assembly/GCF_000001405.26/
