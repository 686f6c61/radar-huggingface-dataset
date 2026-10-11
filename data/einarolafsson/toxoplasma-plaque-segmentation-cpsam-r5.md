# einarolafsson/toxoplasma-plaque-segmentation-cpsam-r5

## Resumen

Toxoplasma plaque segmentation — round 5 (cpsam_plaque_r5) es un modelo de segmentación de imágenes desarrollado por einarolafsson para detectar y delimitar placas de *Toxoplasma gondii* en ensayos de placa con tinción de cristal violeta. Está construido sobre Cellpose-SAM (Cellpose 4.2.1.1, pesos base cpsam_v2) y se integra como modelo personalizado en la herramienta spaCR, que automatiza el preprocesado y la generación de máscaras a partir de imágenes de placas.

La relevancia de esta versión (round 5) radica en que es la primera entrenada de forma simultánea sobre cuatro dominios: escaneos de pocillo completo con dos fijaciones distintas, pocillos recortados de figuras publicadas y pocillos fotografiados con cámara de teléfono móvil. El modelo se distribuye con pesos finales, historiales de entrenamiento por época y un conjunto de control de calidad con métricas por imagen.

Conviene señalar que, desde el 10 de octubre de 2026, este modelo ya no es el modelo de placas por defecto de spaCR: fue sustituido por `toxoplasma_plaque_v3` (cpsam_plaque_r5_geldoc), que obtiene F1 0.844 frente a 0.799 de este modelo sobre 263 campos reservados. Además, la mejora de round 5 sobre round 3 en el dominio de literatura es de solo -0.0012, por debajo del umbral de 0.02 fijado antes de la ejecución, por lo que round 3 sigue siendo la versión en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (Cellpose 4.2.1.1), pesos base cpsam_v2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentacion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | fichero nativo de Cellpose (`weights/cpsam_plaque_r5`); no se publican safetensors ni GGUF |
| Tarea (pipeline) | image-segmentation |
| Tamano del repositorio | 1,2 GB |
| Epocas de entrenamiento | 100 |
| Learning rate | 1e-5 |
| scale_range | 0,5 |
| min_train_masks | 0 |
| Entorno | cellpose 4.2.1.1, torch 2.10.0+cu128, NVIDIA GeForce RTX 3090 Ti |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-10-10 |

## Arquitectura y entrenamiento

El modelo parte de los pesos base `cpsam_v2` de Cellpose-SAM y se afina durante 100 épocas con un learning rate de 1e-5, `scale_range` 0,5 y `min_train_masks` 0. La receta está orientada a un dominio muy concreto: segmentación de placas de lisis en ensayos de placa teñidos con cristal violeta. No es un modelo de propósito general ni un modelo de lenguaje, por lo que conceptos como ventana de contexto, cuantización o soporte multilingüe no aplican.

El entrenamiento se realizó sobre el dataset `einarolafsson/toxoplasma-plaque-dataset`, con 488 campos curados y 27.582 placas, deduplicado por contenido de píxel. La partición se hizo por FIGURA (literatura) y por PLACA (microscopio) para evitar que una figura o una placa apareciese en dos conjuntos a la vez; además, los 20 campos reservados de malnio se forzaron al conjunto de test. La distribución resultante fue de 332 campos y 18.532 placas en entrenamiento, 75 campos y 4.756 placas en validación, y 81 campos y 4.294 placas en test.

La innovación principal de esta ronda es la cobertura multidominio: por primera vez se entrena de forma conjunta sobre imágenes de microscopio de pocillo completo (dos fijaciones), recortes de figuras publicadas y fotografías tomadas con teléfono móvil. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa, algo por otra parte ajeno al ámbito de la segmentación.

## Capacidades

- Segmentación de placas de *Toxoplasma gondii* en ensayos de placa con tinción de cristal violeta.
- Generación de máscaras de instancia a partir de imágenes de microscopio de pocillo completo.
- Funcionamiento sobre recortes de pocillos extraídos de figuras publicadas (dominio literatura).
- Funcionamiento sobre pocillos fotografiados con cámara de teléfono móvil (dominio bigbean), con el mejor F1 de todos los dominios evaluados.
- Integración directa con spaCR mediante el parámetro `custom_model` de `preprocess_generate_masks`.
- Exportación de métricas de control de calidad por imagen y por dominio (precisión, recall, Dice, IoU, MCC, F1).
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente, ya que no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni modo de razonamiento.

## Casos de uso

- Cuantificación de ensayos de placa de *Toxoplasma gondii* en laboratorio: el modelo genera máscaras de cada placa sobre el pocillo completo, lo que permite contar placas y calcular títulos de forma automatizada en lugar de manual.
- Procesamiento por lotes de placas completas: spaCR puede aplicar el modelo a directorios enteros de imágenes de placa, de modo que un experimento con decenas de pocillos se procesa sin intervención manual.
- Reanálisis de datos publicados: al funcionar sobre recortes de figuras (F1 0.8185 en el dominio literatura), permite recuperar mediciones cuantitativas de figuras ya publicadas que solo estaban descritas de forma cualitativa.
- Captura de resultados en condiciones de campo o de laboratorio con recursos limitados: el dominio bigbean (fotografías de teléfono móvil) alcanza F1 0.8755, el valor más alto del conjunto de test, lo que habilita flujos donde no hay microscopio con cámara dedicada.
- Reproducibilidad de experimentos previos: el modelo se conserva en el catálogo de spaCR precisamente para que las ejecuciones ya registradas con esta versión puedan reproducirse de forma exacta.
- Auditoría y control de calidad de segmentaciones: los ficheros de `qc/` permiten comparar las métricas por imagen de r5, r3 y r4 y detectar campos problemáticos, incluida la marca `incumbent_trained_on` que indica si un campo fue visto durante el entrenamiento de los modelos anteriores.
- Selección de modelo en función del equipo de imagen: dado que el rendimiento depende fuertemente del dominio, el modelo sirve como punto de comparación frente a `toxoplasma_plaque_v3` para decidir qué pesos usar según el tipo de captura.

## Benchmarks y rendimiento

Resultados de F1 a IoU 0,5 sobre el conjunto de test, según la model card:

| Dominio | Train (campos) | Valid (campos) | Test (campos) | r3 | r4 | r5 |
|---|---|---|---|---|---|---|
| literature | 208 | 45 | 45 | 0.8197 | 0.8188 | 0.8185 |
| malnio | 62 | 14 | 20 | 0.2494 | 0.2167 | 0.4148 |
| patrick | 47 | 10 | 10 | 0.8361 | 0.8220 | 0.8076 |
| bigbean | 15 | 6 | 6 | 0.8718 | 0.8806 | 0.8755 |
| all | 332 | 75 | 81 | 0.6818 | 0.6745 | 0.7106 |

Advertencias del propio autor sobre estas cifras: las columnas de r3 y r4 corresponden a modelos entrenados sobre todos los pocillos de microscopio y sobre la mayor parte de la literatura, por lo que sus puntuaciones en esos dominios miden memorización y no generalización. La comparación justa es el subconjunto que ninguno de los modelos anteriores vio nunca (malnio más la literatura curada después de round 4), disponible en `qc/summary.json`, con el indicador `incumbent_trained_on` en `qc/*_test_perimage.csv`.

Datos adicionales de la model card: sobre 263 campos reservados, `toxoplasma_plaque_v3` (cpsam_plaque_r5_geldoc) obtiene F1 0.844 frente a 0.799 de este modelo, y este modelo baja a 0.013 en pocillos de Bio-Rad Gel Doc. La ganancia de round 5 sobre round 3 en literatura es de -0.0012, por debajo del umbral de 0.02 fijado antes de la ejecución, motivo por el cual round 3 permanece en producción. Los pocillos vacíos no tienen F1 definido (la verdad de referencia está vacía) y los objetos predichos en ellos se contabilizan como alucinaciones en `qc/summary.json`.

## Requisitos de hardware

- Entorno de entrenamiento documentado: NVIDIA GeForce RTX 3090 Ti con torch 2.10.0+cu128 y cellpose 4.2.1.1. Esto indica que el ajuste fino cupo en una GPU de 24 GB de VRAM.
- VRAM estimada para inferencia: no disponible. No se publican cifras de consumo de memoria en la información proporcionada.
- GPU recomendadas: no disponible. El único dato disponible es la GPU empleada en entrenamiento (RTX 3090 Ti).
- Compatibilidad con GPU de consumo: no confirmada explícitamente para inferencia; el entrenamiento se completó en una GPU de consumo de gama alta de 24 GB.
- Opciones de despliegue: spaCR (a través de `preprocess_generate_masks` con el parámetro `custom_model`), biblioteca Cellpose 4.2.1.1, y distribución de spaCR vía PyPI y conda-forge.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica, son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado en la información disponible modelos de terceros comparables para segmentación de placas de *Toxoplasma*. La comparación posible es dentro de la propia familia de spaCR:

| Modelo | Estado | F1 en 263 campos reservados | F1 en pocillos Bio-Rad Gel Doc | Notas |
|---|---|---|---|---|
| toxoplasma_plaque_v3 (cpsam_plaque_r5_geldoc) | Modelo por defecto de spaCR desde 2026-10-10 | 0.844 | no disponible | Sustituye a este modelo |
| cpsam_plaque_r5 (este modelo) | En catalogo, solo para reproducir ejecuciones | 0.799 | 0.013 | No es el modelo por defecto |
| r3 | En produccion segun la model card | no disponible | no disponible | F1 all 0.6818 en test; referencia de produccion |
| r4 | Version intermedia | no disponible | no disponible | F1 all 0.6745 en test |

Comparativa con alternativas de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Rendimiento muy desigual por dominio: F1 0.4148 en malnio y 0.013 en pocillos de Bio-Rad Gel Doc, frente a 0.8755 en bigbean o 0.8185 en literatura. No es un modelo uniformemente fiable.
- Ya no es el modelo por defecto de spaCR. Se mantiene únicamente para que las ejecuciones registradas puedan reproducirse; su uso en flujos nuevos no está recomendado por el propio autor.
- No superó el criterio de aceptación de su propia ronda: la mejora de F1 en literatura respecto a round 3 fue de -0.0012, por debajo del umbral predefinido de 0.02, por lo que round 3 sigue siendo la versión en producción.
- Riesgo de alucinación en pocillos vacíos: como la verdad de referencia está vacía, el F1 no está definido allí y cualquier objeto predicho se contabiliza explícitamente como alucinación en `qc/summary.json`.
- Las cifras de r3 y r4 en los dominios de microscopio y literatura están contaminadas por memorización; comparar contra ellas sin consultar `incumbent_trained_on` lleva a conclusiones erróneas.
- Especialización estrecha: entrenado exclusivamente para placas de *Toxoplasma gondii* en ensayos de cristal violeta. No debe esperarse un comportamiento correcto en otros organismos, otras tinciones u otros tipos de imagen de microscopio.
- Sesgos conocidos en el sentido estadístico: no documentados en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial y modificación siempre que se atribuya la autoría y se indique si se han introducido cambios. No hay cláusulas de uso restringido documentadas.
- Limitaciones de idioma: no aplica, el modelo no procesa texto.
- Antes de usarlo en producción conviene validar el rendimiento en el dominio concreto de captura, dado el rango de F1 observado (de 0.013 a 0.8755 según el tipo de imagen).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam-r5
- Dataset de entrenamiento: https://huggingface.co/datasets/einarolafsson/toxoplasma-plaque-dataset
- Repositorio spaCR en GitHub: https://github.com/EinarOlafsson/spacr
- Paquete spaCR en PyPI: https://pypi.org/project/spacr/
- Paquete spaCR en conda-forge: https://anaconda.org/conda-forge/spacr
- Paper asociado: no disponible en la información proporcionada
