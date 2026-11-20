# l1t-w1n/argus-v3-ik-clean

## Resumen

Argus V3 IK Clean es un ajuste fino (fine-tune) del modelo Argus V3, desarrollado originalmente por Louis De Puyfontaine y publicado bajo licencia MIT con el identificador `ruiconte/argus-v3`. El modelo resultante lo publica el usuario `l1t-w1n` en Hugging Face y mantiene exactamente la misma arquitectura y formato de checkpoint que el modelo base, por lo que se carga con los mismos ajustes de lectura. No se trata de un modelo de lenguaje, sino de una red de visión orientada al análisis de superficies de papiros carbonizados, presumiblemente en el contexto del proyecto Vesuvius Challenge y la lectura de los rollos de Herculano.

El cambio principal respecto al modelo base es el conjunto de etiquetas de entrenamiento: este fine-tune utiliza exclusivamente `reader-v2-labels` de Domenico Russo (MIT), con una corrección de posición de 7 píxeles hacia arriba y a la izquierda para alinear las etiquetas sobre la tinta real, además de un filtrado de bloques de baja calidad (puntuación de forma inferior a 0,4, menos del 2% de tinta etiquetada y exclusión completa de PHerc0343P). El entrenamiento consistió en 12.000 pasos con batch 8 sobre teselas de 256 píxeles.

El repositorio ocupa 0,3 GB y contiene un único archivo de pesos en formato `.pth` (PyTorch), no safetensors ni GGUF. El modelo se publicó el 20 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes. La información disponible sobre arquitectura interna, parámetros y benchmarks es muy limitada, ya que la model card se centra en el proceso de ajuste fino y no en las especificaciones del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (red de visión para segmentación de superficies de papiro; misma que Argus V3) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch); archivo `argus-v3-surface-ft_ik_clean_step12000.pth` |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la información disponible; la model card indica únicamente que se trata de "la misma red, el mismo formato de checkpoint y los mismos ajustes de lector" que Argus V3, por lo que se debe cargar exactamente igual que el modelo base. El modelo opera sobre teselas de imagen de 256 píxeles durante el entrenamiento y bloques de 384 píxeles en los datos de entrenamiento, lo que sugiere una red de segmentación por bloques orientada a detectar tinta o superficie en imágenes de papiros.

El entrenamiento consistió en 12.000 pasos con batch de 8, tasa de aprendizaje 2,5e-4 con 1.000 pasos de warm-up y decaimiento coseno, optimizador SGD con momento de Nesterov 0,99, weight decay 3e-5, pérdida BCE con label smoothing 0,5 combinada con Dice, jitter de ventana de 2 capas, las mismas aumentaciones que Argus V3, sin EMA y con una sola semilla. Los datos fueron 59 segmentos y 65.195 bloques de 384 píxeles procedentes de PHerc0139, PHerc0172, PHerc0009B, PHerc0814 y PHerc0500P2. Se reservaron 5 segmentos para validación (uno de cada uno de PHerc0139, PHerc0009B, PHerc0500P2, PHerc0343P y PHerc0814) y nunca se leyeron en entrenamiento PHerc0841 ni PHerc1447. Las etiquetas utilizadas fueron exclusivamente `reader-v2-labels` de Domenico Russo, desplazadas 7 píxeles hacia arriba y a la izquierda para situarlas sobre la tinta, y se excluyeron bloques con puntuación de forma inferior a 0,4, bloques con menos del 2% de tinta etiquetada y todo PHerc0343P.

## Capacidades

- Segmentación de superficies de papiro carbonizado a partir de imágenes de tomografía o secciones, con el objetivo de distinguir tinta de superficie.
- Detección de trazos de tinta mediante etiquetas corregidas posicionalmente (desplazamiento de 7 píxeles).
- Procesamiento por teselas y bloques (256 px en entrenamiento, 384 px en datos), adecuado para imágenes de alta resolución divididas en parches.
- Compatibilidad directa con el ecosistema de Argus V3: mismos ajustes de carga y mismo formato de checkpoint.
- No se documentan capacidades de generación de texto, tool calling, agentes, multilingüismo ni razonamiento multi-paso, al no ser un modelo de lenguaje.
- No se documentan capacidades de visión general (VQA, captioning, OCR) más allá de la segmentación de superficies de papiro.

## Casos de uso

- Lectura de rollos de Herculano: el modelo se usaría para segmentar la superficie y localizar tinta en volúmenes de tomografía de papiros carbonizados, un paso previo a la reconstrucción del texto. Es adecuado porque sus etiquetas están alineadas sobre la tinta real, lo que reduce el desfase sistemático del modelo base.
- Investigación en el Vesuvius Challenge: equipos que trabajan con los segmentos PHerc0139, PHerc0172, PHerc0009B, PHerc0814 y PHerc0500P2 pueden emplear este checkpoint como lector de superficies dentro de sus pipelines, dado que el modelo fue entrenado específicamente sobre esos segmentos.
- Validación cruzada de etiquetas: al haberse entrenado solo con `reader-v2-labels`, sirve como referencia para comparar la calidad de otras fuentes de etiquetado sobre los mismos segmentos.
- Reproducción de experimentos: la model card publica el SHA-256 del checkpoint y el archivo `argus-v3-surface-ft_ik_clean_data_seen.json` con todos los segmentos vistos, lo que facilita la reproducibilidad en entornos de investigación.
- Análisis de bloques de baja calidad: el filtrado aplicado (puntuación de forma menor que 0,4, menos del 2% de tinta) permite usar el modelo en regiones donde predominan trazos y no manchas, reduciendo falsos positivos en zonas ambiguas.
- Punto de partida para nuevos fine-tunes: al compartir formato y ajustes con Argus V3, puede servir como inicialización para ajustes posteriores sobre otros segmentos o etiquetas, con la ventaja de partir de etiquetas ya corregidas posicionalmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,3 GB, lo que sugiere un checkpoint relativamente pequeño, pero no se especifica el número de parámetros ni el pico de memoria en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repositorio (0,3 GB) hace plausible que quepa en GPU de consumo, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: carga mediante PyTorch con los mismos ajustes que Argus V3; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión en formato `.pth`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Argus V3 IK Clean | no disponible | no aplica | `.pth` | MIT | Fine-tune de Argus V3 con etiquetas `reader-v2-labels` corregidas |
| Argus V3 (`ruiconte/argus-v3`) | no disponible | no aplica | `.pth` | MIT | Modelo base; etiquetas originales desplazadas 7 px hacia abajo y a la derecha |
| Otros lectores de superficie de papiro | no disponible | no aplica | no disponible | no disponible | No se dispone de información sobre alternativas comparables en la documentación proporcionada |

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con `reader-v2-labels` de Domenico Russo; cualquier sesgo o error sistemático de esa fuente de etiquetado se hereda en el fine-tune.
- Se excluyó por completo PHerc0343P del entrenamiento y se filtraron bloques con puntuación de forma inferior a 0,4 y con menos del 2% de tinta etiquetada, por lo que el rendimiento en regiones dominadas por manchas o con poca tinta puede degradarse.
- El entrenamiento usó una sola semilla y no aplicó EMA, lo que limita la robustez estadística de los resultados y la reproducibilidad exacta.
- No se han publicado métricas de validación ni benchmarks en la información disponible; no es posible cuantificar la mejora respecto a Argus V3.
- El formato de pesos es `.pth` (PyTorch), no safetensors ni GGUF, lo que requiere confiar en la integridad del archivo; la model card proporciona el SHA-256 para verificación.
- La licencia MIT permite uso comercial, pero el modelo base y las etiquetas tienen sus propias condiciones (MIT en ambos casos según la información disponible); conviene verificar las licencias de los datos de imagen originales.
- Al ser un modelo de visión especializado, no debe esperarse de él generación de texto, razonamiento ni capacidades multilingües.
- El modelo se publicó con 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.

## Enlaces

- [Hugging Face: l1t-w1n/argus-v3-ik-clean](https://huggingface.co/l1t-w1n/argus-v3-ik-clean)
- [Modelo base: ruiconte/argus-v3](https://huggingface.co/ruiconte/argus-v3)
- Archivo de pesos: `argus-v3-surface-ft_ik_clean_step12000.pth` (SHA-256: `6d1d0ebe25a4aabad7f434adb5cdc732fd1b1673c763e07a6969229e83617c60`)
- Archivo de segmentos vistos: `argus-v3-surface-ft_ik_clean_data_seen.json`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
