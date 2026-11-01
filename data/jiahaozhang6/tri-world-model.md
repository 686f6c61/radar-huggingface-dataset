# jiahaozhang6/tri-world-model

## Resumen

Tri-World-Model es un modelo de síntesis de vistas noveles (novel view synthesis, NVS) desarrollado por el usuario jiahaozhang6 y publicado en HuggingFace. No es un modelo de lenguaje, sino un sistema generativo de imágenes 3D: dado un conjunto de 8 imágenes RGB de una misma escena junto con sus parámetros de cámara, genera 6 imágenes de vistas objetivo en el espacio latente de un autoencoder geométrico (GAE), que posteriormente se decodifican a RGB. El modelo se apoya en dos componentes congelados de primera fase (el backbone DA3-GIANT-1.1 y el códec GAE) y entrena únicamente un Flow Transformer de aproximadamente 778,6 millones de parámetros.

La relevancia del modelo reside en su enfoque de generación en espacio latente geométrico en lugar de píxeles: las imágenes fuente se codifican conjuntamente en latentes de 64×27×48 por vista, y un transformer de flow matching genera los latentes objetivo condicionados por mapas de rayos de Plücker derivados de las cámaras. Existen dos checkpoints publicados, uno con selección Top-4 de fuentes por objetivo (24.440 pasos) y otro que lee todas las fuentes (31.418 pasos), ambos entrenados sobre el subconjunto 2K de DL3DV-10K-Meshed.

El repositorio ocupa 37,1 GB e incluye los pesos oficiales de primera fase, estadísticas de normalización y los dos checkpoints completos de continuación de entrenamiento. La licencia es de tipo "other" (GAE academic and upstream terms), lo que restringe el uso comercial. El modelo está etiquetado únicamente para chino y no dispone de pipeline declarado en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow Transformer sobre latentes GAE, con backbone DA3-GIANT-1.1 congelado y códec GAE congelado |
| Parametros totales | No disponible (el Flow entrenable es de ~778,6 millones de parámetros; el total incluye DA3 y GAE congelados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de 8 vistas fuente y salida de 6 vistas objetivo |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (etiqueta zh); el modelo no procesa texto |
| Licencia | gae-academic-and-upstream-terms (other) |
| Formato de pesos | safetensors (DA3) y .pt de PyTorch (checkpoints y códec GAE) |

## Arquitectura y entrenamiento

El flujo de datos parte de 8 imágenes fuente RGB de 378×672 junto con sus cámaras. Estas se codifican conjuntamente mediante el backbone DA3-GIANT-1.1 congelado, que produce cuatro niveles de características; tras normalización jerárquica, el encoder GAE congelado las transforma en latentes fuente de 64×27×48 por vista. Los latentes se estandarizan y se combinan con mapas de rayos de Plücker generados a partir de las cámaras objetivo. Un Flow Transformer genera entonces los latentes limpios de las 6 vistas objetivo, que se desnormalizan y se decodifican a RGB con el decoder GAE congelado, decodificando cada vista de forma independiente con num_views=1.

El entrenamiento de segunda fase congela DA3, el encoder GAE, el decoder de características y el decoder RGB, y solo entrena la ruta efectiva de generación, condicionamiento de cámara y referencia del Flow (~778,6 M de parámetros). Se usa flow matching en espacio latente estandarizado con predicción x (se predice el latente limpio y se convierte a velocidad), muestreo logit-normal con shift 6,364, y una pérdida total que suma el MSE del Flow principal y el del Flow base auxiliar. El optimizador es AdamW con learning rate inicial 1e-5, weight decay 0, warmup de 500 pasos y decaimiento sobre un plan de 900K pasos hasta 1e-6; precisión BF16 y EMA de 0,9995. Los datos provienen de DL3DV-10K-Meshed (subconjunto 2K), con 895 escenas de entrenamiento y 99 de validación, muestreando 8 fuentes y 6 objetivos (3 observados y 3 noveles) por escena, con batch size de escena 1.

Una innovación destacable es la selección Top-4 por objetivo: para cada vista objetivo se eligen 4 fuentes según una puntuación de cámara que combina distancia del centro de cámara normalizada por la separación típica y la similitud coseno de la dirección frontal, con desempate estable por orden original. Es una heurística de pose, sin cálculo de oclusión ni solapamiento real de regiones visibles. Cabe subrayar que el Top-4 limita solo los latentes que lee el Flow, ya que DA3 codifica conjuntamente las 8 fuentes. En inferencia se usan por defecto 50 pasos de Euler y CFG scale de 2,0 sobre la condición de referencia.

## Capacidades

- Síntesis de vistas noveles: genera 6 imágenes RGB de 378×672 de vistas objetivo a partir de 8 imágenes fuente de una misma escena y sus cámaras.
- Condicionamiento geométrico por cámaras: utiliza poses camera-to-world en convención OpenCV, con anclaje a la primera fuente y mapas de rayos de Plücker sobre la rejilla de patches latentes.
- Generación en espacio latente: opera sobre latentes GAE de 64×27×48 por vista, lo que reduce el coste frente a la generación directa en píxeles.
- Soporte de configuraciones variables de fuente: el código admite número variable de fuentes, aunque los checkpoints publicados se entrenaron con S=8 fijo.
- Dos modos de condicionamiento: Top-4 (selección heurística por cámara) y full-source (lectura de todos los latentes fuente).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni visión general; es un modelo especializado exclusivamente en NVS.
- No hay modo thinking ni capacidades multilingües más allá de la etiqueta zh del repositorio.

## Casos de uso

- Reconstrucción de escenas para fotogrametría: a partir de 8 fotografías de un objeto o espacio con poses conocidas, generar vistas intermedias para densificar un levantamiento 3D o una nube de puntos previa.
- Postproducción de vídeo y VFX: sintetizar ángulos de cámara adicionales de un set grabado para insertar elementos o corregir continuidad, aprovechando la coherencia de cámara que aportan los rayos de Plücker.
- Visualización inmobiliaria y turismo virtual: generar recorridos por estancias a partir de un conjunto fijo de fotos, produciendo vistas intermedias sin necesidad de un escaneo completo.
- Investigación en NVS y evaluación de métodos geométricos: servir como baseline reproducible sobre DL3DV-10K-Meshed con dos configuraciones de condicionamiento (Top-4 y full-source) para comparar estrategias de selección de fuentes.
- Prototipado de pipelines de generación latente 3D: reutilizar el códec GAE y el Flow Transformer como componentes en experimentos de flow matching sobre latentes geométricos.
- Docencia y divulgación de arquitecturas híbridas: ilustrar el patrón de congelar un backbone de primera fase y entrenar solo un módulo de generación condicionada, con checkpoints completos que incluyen estado de Adam y scheduler para reproducir el entrenamiento.
- Aumento de datos para entrenamiento de modelos de percepción 3D: generar vistas sintéticas etiquetadas por cámara para aumentar la diversidad de poses en datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no proporciona una comparación completa con otros métodos y que no puede afirmarse que los checkpoints superen a alternativas ni que hayan convergido: el objetivo de entrenamiento era de 900.000 pasos, mientras que los checkpoints publicados se detuvieron en 24.440 y 31.418 pasos. La evaluación periódica muestra 4 escenas fijas por defecto, y la validación completa sobre las 99 escenas requiere activar `--full-validation`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia de magnitud, solo el checkpoint del Flow ocupa 13,08 GB en disco y el backbone DA3 5,42 GB, además del códec GAE (1,82 GB) y los pesos de inicialización del Flow (3,74 GB); en BF16 la huella en memoria será del orden de decenas de GB sumando todos los módulos.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño de los componentes, se requiere una GPU profesional con memoria amplia (A100 o H100) para ejecutar el pipeline completo en BF16 sin cuantización.
- ¿Cabe en GPU de consumo? No hay datos que lo confirmen; con 37,1 GB de assets y checkpoints de 13,08 GB, es improbable en GPUs de 24 GB sin técnicas de offloading o cuantización no documentadas.
- Opciones de despliegue: el repositorio proporciona entradas de entrenamiento e inferencia en el código de GitHub (rama jiahaozhang/3dLatent). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se conoce la configuración de muestreo por defecto (50 pasos de Euler, CFG 2,0), pero no se publican tiempos por muestra.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Contexto o resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tri-World-Model (este) | Flow Transformer sobre latentes GAE | 8 vistas fuente + cámaras / 6 vistas objetivo | 378×672, latentes 64×27×48 | gae-academic-and-upstream-terms | HuggingFace, 0 descargas |
| Alternativas de NVS (p. ej. métodos basados en NeRF o Gaussian Splatting) | No disponible en la información | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoints no convergidos: el plan de entrenamiento apuntaba a 900.000 pasos y los publicados alcanzan 24.440 y 31.418, por lo que el rendimiento puede estar lejos del objetivo.
- Sin garantía de consistencia entre vistas: las 6 vistas objetivo se predicen de forma independiente, sin atención entre ellas ni pérdida explícita de consistencia cruzada; la coherencia depende solo de la condición compartida de fuente y cámara.
- Selección Top-4 heurística: se basa únicamente en pose de cámara, sin cálculo de oclusión ni de solapamiento real de regiones visibles, lo que puede elegir fuentes poco informativas.
- Distribución de entrada fija: ambos checkpoints se entrenaron con S=8 fuentes; el soporte de número variable en código no está validado para otras cantidades.
- Licencia restrictiva: "gae-academic-and-upstream-terms" con enlace a términos GAE; el uso comercial requiere revisar las condiciones académicas y las de los componentes upstream (DA3 y GAE).
- Idiomas: el repositorio está etiquetado solo como chino y el modelo no procesa lenguaje natural; la etiqueta no implica capacidades lingüísticas.
- Riesgo de artefactos y alucinación visual: al ser un modelo generativo en espacio latente, puede producir geometrías o texturas plausibles pero incorrectas en zonas poco cubiertas por las fuentes.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, y la model card advierte explícitamente contra afirmar superioridad.
- Advertencia de seguridad: el contenido de la model card se ha tratado solo como material de referencia, no como instrucciones.

## Enlaces

- HuggingFace: https://huggingface.co/jiahaozhang6/tri-world-model
- Licencia GAE: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/licenses/GAE.txt
- Repositorio GitHub (rama 3dLatent): https://github.com/huanngzh/tri-world-model/tree/jiahaozhang/3dLatent
- Commit de código referenciado: https://github.com/huanngzh/tri-world-model/commit/c15b8c0f559fd069002b10a2d0a3c8b1676c6bd5
- Pesos DA3: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/ckpts/da3/model.safetensors
- Códec GAE: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/ckpts/gae_64.pt
- Inicialización del Flow: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/ckpts/flow_gae64.pt
- Checkpoint Top-4: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/outputs/gae_nvs/gae64_source8_top4_6target_900k/ckpts/step_000024440.pt
- Checkpoint full-source: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/outputs/gae_nvs/gae64_source8_6target_900k/ckpts/step_000031418.pt
- Manifiesto de assets: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/asset_manifest.json
- Sumas de verificación: https://huggingface.co/jiahaozhang6/tri-world-model/blob/main/SHA256SUMS
