# dmanningcoe/fra-tinystories-fig2-saes

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo, sino un conjunto de 72 autoencoders dispersos (SAE) de tipo TopK entrenados sobre las activaciones internas de `mars-jason-25/tiny-stories-33M-TSdata-sleeper`, un transformer de aproximadamente 33 millones de parámetros basado en el corpus TinyStories. Los SAE se distribuyen sobre tres puntos de enganche (la entrada de atención `blocks.L.ln1.hook_normalized`, el punto medio del residual `blocks.L.hook_resid_mid` y la salida del residual `blocks.L.hook_resid_post`) en las capas 0 a 3, con seis semillas de entrenamiento (0 a 5) por combinación, lo que da el total de 72 checkpoints independientes.

La relevancia del artefacto es metodológica: al cubrir una rejilla completa de capa, punto de enganche y semilla, permite cuantificar la variabilidad de las características aprendidas por un SAE bajo cambios de inicialización, algo que la mayoría de publicaciones de interpretabilidad mecanicista no reporta porque entrenar una sola rejilla de SAE sobre un modelo grande es prohibitivamente caro. Aquí el coste es mínimo: cada SAE tiene 2.361.600 parámetros (entrada de 768 dimensiones, anchura de 1.536, TopK 32) y el repositorio completo ocupa 0,7 GB, por lo que todo el análisis cabe en un portátil.

El autor es `dmanningcoe` (Dmitry Manning-Coe). La licencia no está declarada en la model card y los metadatos de HuggingFace no indican idiomas ni pipeline. La única métrica publicada es el FVU (fracción de varianza no explicada) de validación, que oscila entre 0,0251 y 0,1942 según el checkpoint; se trata de una puntuación de reconstrucción de activaciones, no de una medida de comportamiento del modelo subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (expansión 768 → 1.536, TopK 32 tras ReLU) sobre activaciones de un transformer decoder-only; 72 checkpoints independientes |
| Parámetros totales | 2.361.600 por SAE (1.179.648 en `W_enc`, 1.536 en `b_enc`, 1.179.648 en `W_dec`, 768 en `b_dec`); 72 × 2.361.600 ≈ 170 millones en total, pero cada checkpoint es un módulo independiente |
| Parámetros activos | no aplica (no es un modelo MoE); en inferencia se activan 32 de las 1.536 unidades latentes (2,08 %) |
| Longitud de contexto | no aplica a generación; las activaciones se recogieron sobre 10.000 secuencias fijas de 128 tokens y 200 de validación |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el modelo base deriva de TinyStories, corpus en inglés, pero no se declara en la información proporcionada) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (diccionario PyTorch con `state_dict`, `config` y `val_fvu`, cargado con `torch.load(..., weights_only=True)`) |
| Modelo base interpretado | `mars-jason-25/tiny-stories-33M-TSdata-sleeper` (~33 M de parámetros según su nombre) |
| Puntos de enganche | `blocks.L.ln1.hook_normalized`, `blocks.L.hook_resid_mid`, `blocks.L.hook_resid_post` en capas 0–3 |
| Semillas | 0, 1, 2, 3, 4, 5 |
| Tamaño del repositorio | 0,7 GB |
| Fecha de publicación declarada | 2026-09-25 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

Cada archivo implementa un `TopKSAE(d_in=768, d_sae=1536, k=32)`: un autoencoder de una sola capa con diccionario expandido, donde la codificación aplica ReLU y conserva únicamente las 32 activaciones de mayor magnitud antes de reconstruir la activación original. La sparsidad efectiva es por tanto del 2,08 % sobre las 1.536 unidades latentes. El diccionario de decodificación es lineal y sus filas se renormalizan a norma unitaria cada 100 pasos, una práctica habitual para evitar que el modelo reduzca la pérdida escalando arbitrariamente las direcciones aprendidas.

La receta de entrenamiento sigue el apéndice de un artículo no identificado en la información disponible: 10.000 secuencias fijas de 128 tokens para entrenamiento y 200 para validación, pérdida de reconstrucción MSE, optimizador Adam con tasa de aprendizaje 5e-4, tamaño de lote 4.096 y 4.000 pasos. Cada par punto de enganche/semilla mantiene parámetros y estado del optimizador independientes; la implementación agrupa los SAE en una única GPU para mejorar el rendimiento. Los datos de activación proceden del conjunto equilibrado de ejemplos limpios y de despliegue de `mars-jason-25/tiny_stories_instruct_sleeper_data`, y los nombres de los puntos de enganche siguen la convención de TransformerLens.

Cálculo derivado de los datos anteriores: 4.000 pasos con un lote de 4.096 equivalen a 16.384.000 ejemplos procesados sobre un conjunto de solo 10.000 secuencias únicas, lo que implica un número elevado de pasadas efectivas sobre los mismos datos; la model card no comenta el efecto de esto sobre el sobreajuste. Los archivos `harvest.json`, `complete.json` y `quality.json` documentan las fuentes de activación, las celdas completadas y el FVU retenido de cada checkpoint, y `verify.py` permite validar los 72 archivos tras la descarga.

## Capacidades

- Descomposición de activaciones en características dispersas: cada SAE proyecta una activación de 768 dimensiones a 1.536 unidades latentes y reconstruye la activación original a partir de 32 de ellas.
- Cobertura de tres puntos de enganche por capa: entrada normalizada de atención, punto medio del residual y salida del residual, lo que permite comparar qué características aparecen antes y después del bloque de atención.
- Cobertura de cuatro capas (0 a 3) del modelo base, es decir, la parte más temprana de un transformer de 33 M de parámetros.
- Variabilidad entre semillas: seis semillas por celda permiten estudiar la estabilidad de las características aprendidas frente a la inicialización.
- Carga directa en PyTorch mediante `TopKSAE` y `load_state_dict`, sin dependencias de frameworks de servidores de inferencia.
- Metadatos de calidad por checkpoint: cada archivo incluye su `val_fvu`, y `quality.json` agrega los 72 valores.
- Inspección de diccionarios: las matrices `W_dec` ofrecen 1.536 direcciones por checkpoint, utilizables para análisis de similitud, alineación entre semillas o experimentos de intervención sobre el modelo base.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento: no es un modelo de lenguaje, es un artefacto de interpretabilidad.

## Casos de uso

- Investigación en interpretabilidad mecanicista sobre modelos pequeños: usar los SAE de la capa 0 para identificar qué características de bajo nivel (límites de palabra, morfemas, marcadores de posición) emergen en las primeras capas de un transformer entrenado con TinyStories.
- Estudios de reproducibilidad de SAE: con seis semillas por celda, se puede medir cuántas características latentes son estables entre semillas y cuántas son idiosincrásicas, algo imposible con un único entrenamiento por punto de enganche.
- Comparación de puntos de enganche: contrastar `ln1.hook_normalized`, `hook_resid_mid` y `hook_resid_post` en la misma capa permite estudiar qué se escribe en el flujo residual a través de la atención y qué permanece inalterado.
- Validación causal mediante intervención: tomar una dirección de `W_dec` concreta, aplicar ablación o amplificación sobre las activaciones del modelo base y medir el cambio de comportamiento, cerrando el paso de análisis correlacional a evidencia causal.
- Investigación sobre comportamiento condicionado o «sleeper»: el modelo base se entrenó sobre un conjunto con ejemplos limpios y de despliegue, de modo que este repositorio permite buscar si existe una dirección latente asociada al comportamiento condicionado y si es detectable en las capas 0–3.
- Docencia y formación: al necesitar menos de 10 MB por checkpoint y poder ejecutarse en CPU, es material viable para prácticas de interpretabilidad en un curso, sin acceso a GPU de centro de datos.
- Control de integridad en canalizaciones de datos: ejecutar `verify.py` tras la descarga y comprobar los FVU de `quality.json` contra umbrales definidos permite detectar copias corruptas o incompletas antes de usarlas en un experimento.
- Selección previa a experimentos costosos: al disponer de FVU por celda, se puede elegir el mejor checkpoint de cada punto de enganche o semilla en lugar de entrenar desde cero una rejilla nueva sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que el repositorio no contiene un modelo generativo. El único resultado cuantitativo publicado es el FVU de validación.

| Métrica | Valor | Notas |
|---|---|---|
| FVU de validación (72 checkpoints) | 0,0251 – 0,1942 | Fracción de varianza no explicada; equivale a explicar entre el 97,49 % y el 80,58 % de la varianza de la activación |
| Secuencias de entrenamiento | 10.000 fijas de 128 tokens | Según la model card |
| Secuencias de validación | 200 fijas de 128 tokens | Según la model card |
| Pasos de entrenamiento | 4.000 por SAE | Con lote de 4.096 |
| Métrica de pérdida | MSE de reconstrucción | No se publica su valor numérico |

La propia model card advierte de que estas cifras son puntuaciones de reconstrucción de activaciones por parte del SAE y no medidas de FVU de componentes de atención, por lo que no deben compararse con métricas de calidad de reconstrucción publicadas para otros SAE con protocolos distintos.

## Requisitos de hardware

- VRAM para inferencia: un único SAE en fp32 ocupa unos 9,45 MB (2.361.600 parámetros × 4 bytes), por lo que la inferencia cabe de sobra en CPU y no requiere GPU.
- Repositorio completo: los 72 checkpoints suman aproximadamente 0,68 GB, coherente con los 0,7 GB declarados para el repositorio.
- GPU recomendadas: ninguna en concreto; cualquier GPU con unos pocos cientos de MB libres es suficiente. No se requiere A100, H100 ni similares.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual e incluso en iGPU o ejecución exclusivamente en CPU, junto con el modelo base de 33 M de parámetros.
- Opciones de despliegue: PyTorch puro con `sae_models.py`, más `verify.py` para validación. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo generativo; para obtener activaciones hay que instrumentar el modelo base con los hooks correspondientes.
- Latencia y throughput: no disponibles en la información proporcionada. La model card solo indica que el entrenamiento agrupa los SAE en una GPU única para mejorar el rendimiento, sin especificar el modelo de GPU empleado.

## Comparativa con modelos similares

| Proyecto | Tipo | Parámetros | Contexto de entrenamiento | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dmanningcoe/fra-tinystories-fig2-saes` | 72 SAE TopK sobre un transformer de 33 M, 12 celdas × 6 semillas | 2.361.600 por SAE | Secuencias de 128 tokens | FVU de validación 0,0251–0,1942 | No disponible | HuggingFace |
| `TheodoreEhrenborg/tiny_stories_sae` | Entrenamiento de un SAE sobre un modelo TinyStories, diseñado para ejecutarse en un portátil | No disponible | No disponible | No disponible | No disponible | GitHub |
| `mars-jason-25/tiny-stories-33M-TSdata-sleeper` (modelo interpretado) | Transformer decoder-only de tipo TinyStories, entrenado sobre datos con ejemplos limpios y de despliegue | ~33 M según el nombre del modelo | No disponible | No disponible | No disponible | HuggingFace |

La diferencia principal frente al segundo proyecto es la cobertura: aquí se publican 72 checkpoints con rejilla completa de capa, punto de enganche y semilla, más metadatos de FVU por checkpoint, en lugar de un único SAE de demostración. No se dispone de información sobre otros conjuntos de SAE comparables con el mismo protocolo de evaluación, por lo que la comparación de rendimiento entre proyectos no es posible con los datos actuales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no admite instrucciones, no tiene tool calling ni capacidades de agente. Cualquier uso como modelo conversacional es un error de categoría.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial ni de redistribución, lo que supone un riesgo legal para integrarlo en productos.
- FVU heterogéneo: el rango de 0,0251 a 0,1942 entre los 72 checkpoints indica que la calidad de reconstrucción depende mucho de la celda; usar un checkpoint sin consultar su `val_fvu` puede llevar a análisis sobre representaciones pobremente reconstruidas.
- Los SAE son herramientas correlacionales: una característica latente interpretable no implica que el modelo base la utilice causalmente. Se requiere validación por intervención.
- Cobertura limitada del modelo base: solo las capas 0 a 3 de un transformer de 33 M de parámetros; no hay información sobre capas superiores ni sobre modelos de mayor tamaño.
- Secuencias de solo 128 tokens: las características aprendidas pueden no reflejar dependencias de largo alcance.
- Reutilización intensiva de los datos de entrenamiento: 4.000 pasos con lote de 4.096 sobre 10.000 secuencias implican muchas pasadas sobre el mismo conjunto, con riesgo de sobreajuste que la model card no discute.
- Posible dependencia del conjunto de datos concreto: el entrenamiento usa ejemplos limpios y de despliegue de `tiny_stories_instruct_sleeper_data`, por lo que las características pueden estar sesgadas hacia ese reparto y no generalizar a otros corpus.
- Idiomas no declarados: no hay confirmación oficial de que las activaciones provengan solo de texto en inglés, aunque el modelo base derive de TinyStories.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de interpretación excesiva de características latentes sin evidencia causal.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, y sin publicación revisada por pares asociada en la información disponible.
- Alucinación de metadatos: la model card remite a un «apéndice del artículo» que no se identifica con enlace, por lo que no es posible verificar la receta contra la fuente original.
- Las entradas `path` de `quality.json` apuntan a rutas del equipo de entrenamiento original; los archivos descargados están en `weights/`, por lo que hay que remapear esas rutas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dmanningcoe/fra-tinystories-fig2-saes
- Perfil del autor: https://huggingface.co/dmanningcoe
- Modelo base interpretado: https://huggingface.co/mars-jason-25/tiny-stories-33M-TSdata-sleeper
- Conjunto de datos de activaciones: https://huggingface.co/datasets/mars-jason-25/tiny_stories_instruct_sleeper_data
- Artículo de TinyStories: https://arxiv.org/abs/2305.07759
- Conjunto de datos TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Proyecto de SAE sobre TinyStories para portátil: https://github.com/TheodoreEhrenborg/tiny_stories_sae
- Proyecto de transformer TinyStories de 40 M: https://github.com/NonsonoNicola/TinyStories-LLM
