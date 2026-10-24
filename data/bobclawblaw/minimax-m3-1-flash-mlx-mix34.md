# BobClawblaw/MiniMax-M3.1-Flash-MLX-mix34

## Resumen

MiniMax-M3.1-Flash-MLX-mix34 es una conversión cuantizada de MiniMaxAI/MiniMax-M3.1-Flash (revisión `54e4e69d`) publicada por el usuario BobClawblaw, pensada para ejecutarse en el motor Metal nativo de TensorFold (familia `minimax_m3`) sobre un único Apple M5 Ultra con 256 GB de memoria unificada. No es un modelo nuevo ni un fine-tune: es un checkpoint de pesos reempaquetados con cuantización afín de MLX en precisión mixta, con 431.228.680.320 parámetros totales según los safetensors y un repositorio de 218,7 GB (unas 204 GiB, contando los dos drafters). El problema que resuelve es de despliegue: hacer caber un modelo multimodal de esta escala, con torre de visión y decodificación especulativa, en hardware de Apple Silicon de gama alta.

La receta es mixta y selectiva. Los expertos enrutados de 26 de las 60 capas (las que más error de salida aportaban sobre activaciones capturadas) se cuantizan a 4 bits afín con grupos de 128; el resto de expertos va a 3 bits con grupos de 64. Atención (q, k, v y las proyecciones del indexador lightning), experto compartido, capas densas, embeddings y cabeza de salida van a 8 bits con grupos de 64, partiendo del MXFP8 del release. El router se mantiene en fp32 y la torre de visión y el proyector en bf16, con la convolución de patch en fp32.

Su relevancia es doble: por un lado, documenta una metodología de cuantización mixta guiada por error (reajuste por mínimos cuadrados sobre los valores NVFP4 del release, no un redondeo simple); por otro, es un caso claro de checkpoint atado a un runtime propietario y todavía no publicado. El autor advierte de que no carga en mlx-lm ni en mlx-vlm y de que el soporte del motor está pendiente de un pull request en TensorFold, por lo que hoy no es utilizable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): expertos enrutados, experto compartido, atención con indexador lightning, torre de visión y proyector; cabezas drafter para decodificación especulativa (DSpark y DFlash2). 60 capas |
| Parámetros totales | 431.228.680.320 (dato real de los safetensors) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible como especificación del modelo base. El autor indica que, con este checkpoint en un M5 Ultra de 256 GB, caben unos 65.000 tokens de contexto junto con imágenes y el drafter (caché KV int8 por defecto del motor) |
| Tipos de cuantización | Expertos enrutados: 4 bits afín, grupos de 128 (26 capas) y 3 bits afín, grupos de 64 (resto). Atención, experto compartido, capas densas, embeddings y cabeza de salida: 8 bits afín, grupos de 64 (desde MXFP8). Router: fp32. Visión: bf16 (convolución de patch fp32). Drafters: mismas proyecciones afines |
| Idiomas soportados | no disponible |
| Licencia | MiniMax Community License (`license: other`, `license_name: minimax-community`); el drafter DFlash2 es Apache-2.0 |
| Formato de pesos | safetensors con layout de cuantización afín de MLX (`model-vision.safetensors`, `model-dspark.safetensors`, `model-dflash2.safetensors`); librería `tensorfold` |

## Arquitectura y entrenamiento

Este checkpoint no aporta entrenamiento propio: hereda íntegramente los pesos del release MiniMax-M3.1-Flash y solo cambia su representación numérica. La topología es la del modelo base: 60 capas con expertos enrutados más un experto compartido, atención con un indexador lightning cuyas proyecciones se cuantizan aparte, torre de visión con proyector para entrada de imágenes y dos cabezas drafter para decodificación especulativa. El número de tokens de entrenamiento, la composición del dataset y las etapas de alineación (RLHF/DPO) no están documentados en la información disponible.

La innovación está en el proceso de cuantización. Los expertos NVFP4 del release se reajustan por mínimos cuadrados, ajustando escalas y sesgos a los valores originales en lugar de aplicar un redondeo al vecino más cercano. La asignación de precisión por capa se decide midiendo el error de salida de cada capa sobre activaciones capturadas, y de ahí salen las 26 capas que reciben 4 bits (19-31, 33, 40, 42-44, 48-50, 52, 53 y 57-59). Atención y capas densas se convierten desde MXFP8, exacto en bf16 antes de cuantizar. Se incluyen dos drafters: el DSpark del propio release y el DFlash2 de incoai (Apache-2.0, revisión `ac07a7c1`); el motor carga solo uno.

## Capacidades

- Generación de texto a partir de los pesos del modelo base, con la fidelidad limitada por la cuantización mixta descrita (80,0 % de acuerdo top-1 frente al release NVFP4 en la medición del autor).
- Entrada de imágenes: la torre de visión y el proyector se conservan en bf16 (convolución de patch en fp32), por lo que el checkpoint mantiene la vía multimodal del modelo original.
- Contexto largo en la práctica: el autor cifra en unos 65.000 tokens el contexto que cabe junto al modelo, las imágenes y el drafter en 256 GB, con caché KV int8.
- Decodificación especulativa integrada: incorpora la cabeza DSpark del release y el drafter DFlash2 de incoai, lo que permite acelerar la generación cuando el motor lo soporta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (no se ha ejecutado ninguna suite de evaluación).
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente local con entrada de imágenes en estación de trabajo Apple: al conservar la torre de visión en bf16, el checkpoint puede procesar capturas, diagramas o páginas escaneadas junto con texto sin enviar datos a la nube, algo relevante en entornos con requisitos de confidencialidad.
- Análisis de documentación extensa en local: con unos 65.000 tokens de contexto disponibles en un M5 Ultra de 256 GB, encaja la revisión de contratos, informes técnicos o expedientes completos en una sola pasada, manteniendo el material dentro de la máquina.
- Prototipado e investigación sobre cuantización mixta: el checkpoint y su tabla de divergencia KL sirven como referencia reproducible para estudiar el compromiso entre bits por capa y fidelidad de salida frente al release NVFP4.
- Evaluación de decodificación especulativa: al incluir dos drafters (DSpark y DFlash2) con el mismo layout afín, permite comparar tasas de aceptación y ganancia de throughput entre ambos dentro del motor TensorFold.
- Generación asistida en flujos de trabajo de oficina técnica: redacción y reescritura de textos largos con contexto documental adjunto, ejecutada en hardware de escritorio sin coste por token de API.
- Docencia y demostraciones de modelos de 431B parámetros: permite mostrar el comportamiento de un MoE de gran escala en un equipo de sobremesa, con la advertencia de que el motor necesario aún no está publicado.
- Validación de recetas de conversión MXFP8/NVFP4 a afín: útil para quien necesite replicar el pipeline de reajuste por mínimos cuadrados sobre otros modelos de la familia.

## Benchmarks y rendimiento

El autor no ha ejecutado ninguna suite de benchmarks (MMLU, HumanEval, GSM8K u otras); la receta promete publicar una. Los únicos datos disponibles son métricas de fidelidad frente a los pesos NVFP4 del release, calculadas con una referencia MLX del código de `transformers` sobre las 1.024 posiciones de una conversación y con la caché KV int8 por defecto del motor:

| Checkpoint | Divergencia KL media | Acuerdo top-1 |
|---|---|---|
| mix34 (este checkpoint) | 0,250 | 80,0 % |
| mix256k | 0,284 | 78,2 % |
| Todos los expertos a 3 bits (no publicado) | 0,300 | 77,3 % |

Estas cifras miden degradación respecto al release, no calidad de tarea. No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- Memoria: el autor cifra el checkpoint completo en unas 204 GiB (218,7 GB de repositorio), drafters incluidos. El escenario de referencia es un único Apple M5 Ultra con 256 GB de memoria unificada.
- GPU dedicadas: no disponible como opción soportada. El motor objetivo es Metal sobre Apple Silicon; una GPU de consumo tipo RTX 4090 (24 GB) no puede alojar los pesos ni con cuantizaciones agresivas, y no hay ruta CUDA documentada.
- Cabe en GPU de consumo: no. Requiere memoria unificada de gama alta (M5 Ultra de 256 GB según el autor); en bf16 los 431.228.680.320 parámetros equivaldrían a unos 862 GB solo de pesos, cálculo derivado del recuento de parámetros.
- Despliegue: exclusivamente TensorFold con su motor Metal (`minimax_m3`). No carga en mlx-lm ni en mlx-vlm. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput: no disponible. La única indicación cualitativa es la inclusión de drafters para decodificación especulativa, sin cifras de tokens por segundo.
- Estado operativo: el soporte del motor no está publicado (pendiente de un pull request y de una receta de serving), por lo que hoy el checkpoint no es desplegable en la práctica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-M3.1-Flash-MLX-mix34 (este) | 431,2 B totales; activos no disponibles | ~65k tokens en 256 GB (práctico, según autor) | Mixta 4/3/8 bits afín, safetensors, motor TensorFold | MiniMax Community (no comercial libre; comercial con atribución y aviso o autorización) | Publicado, pero sin motor disponible |
| MiniMax-M3.1-Flash-MLX-mix256k (misma familia de conversión) | 431,2 B totales | no disponible | Mixta afín; KL media 0,284 y 78,2 % top-1 | MiniMax Community | Publicado; motor no publicado |
| MiniMaxAI/MiniMax-M3.1-Flash (release original) | 431,2 B totales | no disponible | NVFP4 (expertos) y MXFP8 (resto) | MiniMax Community | Público; referencia de calidad de las conversiones |
| Conversión con todos los expertos a 3 bits | 431,2 B totales | no disponible | 3 bits afín uniforme en expertos | MiniMax Community | No publicada; KL media 0,300 y 77,3 % top-1 |

No se dispone de datos para comparar con modelos de otras familias de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- No es utilizable hoy: el soporte del motor TensorFold no está publicado y el checkpoint no carga en mlx-lm ni en mlx-vlm. Cualquier uso en producción queda bloqueado hasta que el autor publique el pull request y la receta de serving.
- Dependencia de un runtime único: el layout es de cuantización afín de MLX, pero el modelo pertenece a TensorFold. No hay pesos GGUF ni ruta de conversión documentada a otros motores.
- Degradación medible: 0,250 de divergencia KL media y 80,0 % de acuerdo top-1 frente al release NVFP4. Es una pérdida no trivial que puede notarse en tareas sensibles a la precisión (código, matemáticas, extracción de datos).
- Ausencia total de evaluación de capacidades: no hay MMLU, HumanEval, GSM8K ni pruebas de alucinación. El propio autor lo reconoce.
- Sesgos: no documentados en la información disponible. Al heredar los pesos del modelo base, cabe esperar los sesgos de su dataset de entrenamiento, que tampoco está descrito.
- Riesgo de alucinación: no cuantificado. La cuantización mixta añade un factor de error adicional sobre el comportamiento del release.
- Idiomas: sin datos sobre cobertura o calidad por idioma.
- Licencia: MiniMax Community License. Uso no comercial libre; el uso comercial exige la atribución y el aviso o la autorización que la licencia describe. Conviene revisar el fichero LICENSE antes de cualquier despliegue empresarial. El drafter DFlash2 es de incoai y se distribuye bajo Apache-2.0, con condiciones distintas al resto del repositorio.
- Contexto: la cifra de ~65k tokens es una estimación de capacidad de memoria en un equipo concreto, no la ventana de contexto entrenada del modelo; no debe tratarse como especificación del modelo base.
- Repositorio de autor individual, con 0 descargas y 1 like en el momento de la consulta: sin validación independiente de la calidad de la conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BobClawblaw/MiniMax-M3.1-Flash-MLX-mix34
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Drafter DFlash2: https://huggingface.co/incoai/MiniMax-M3.1-Flash-DFlash2
- Licencia: fichero LICENSE del repositorio (MiniMax Community License)
- Paper, blog técnico o demo: no disponible. La búsqueda web realizada no devolvió resultados relevantes para este modelo.
