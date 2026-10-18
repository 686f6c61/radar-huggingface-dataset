# richiehakim/neurrator-triplen-qwen3.5-2b

## Resumen

`richiehakim/neurrator-triplen-qwen3.5-2b` es un artefacto de decodificación cerebral, no un modelo de lenguaje nuevo. Escribe una leyenda de una frase para una foto a partir de las respuestas de 35.494 unidades registradas en el córtex visual de macacos mientras veían esa foto. Lo publica el usuario de HuggingFace `richiehakim` sobre el dataset Triple-N (Li et al., *Nature Neuroscience* 29, 1999-2011, 2026) y el modelo base declarado es `Qwen/Qwen3.5-2B`, que no se ha reentrenado.

Técnicamente es una composición de tres piezas: un mapa ridge de rango reducido (rango 512) que predice la entrada visual de Qwen a partir de las respuestas neuronales, una red add-on de 2,2 millones de parámetros entrenada por refuerzo que corrige los 169 tokens de esa entrada, y Qwen3.5-2B congelado que genera la leyenda con decodificación greedy. Se ajustó con 810 fotos y se evaluó con 100 fotos no vistas durante el ajuste.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para estudiar qué parte de la representación visual de un modelo multimodal es linealmente decodificable desde actividad neural de primate, y para medir cuánto se puede corregir esa correspondencia con un adaptador pequeño. El repositorio ocupa 0,8 GB, tiene 0 descargas y 0 likes, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Composición en tres etapas sobre un transformer multimodal congelado: regresión ridge de rango reducido (rango 512) + red add-on de corrección + Qwen3.5-2B congelado, sin fine-tuning |
| Parámetros totales | No disponible para el conjunto. Add-on: 2,2 millones de parámetros. Mapa ridge: matrices de 35.494 x 512 y 512 x 346.112 (unas 195,4 millones de entradas, según cálculo a partir de las dimensiones de la model card) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible para el modelo base. La entrada visual sintética sustituye a la salida del codificador de visión y ocupa 169 tokens x 2.048 valores |
| Tipos de cuantización | No disponible. Los pesos se publican en safetensors; los grids se generan en float16 y pasan a float32 tras el add-on |
| Idiomas soportados | No documentados. Las leyendas se generan en inglés (prompt en inglés y referencias en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (`ridge_map.safetensors`, `addon.safetensors`) + JSON de configuración (`ridge_map.json`, `addon.json`) + CSV de metadatos y particiones |

## Arquitectura y entrenamiento

La entrada es una matriz de una fila por foto y 35.494 columnas en float32, una columna por unidad neuronal. Se incluyen todas las unidades con fiabilidad split-half (`reliability_best`) de al menos 0,4, procedentes de 90 sesiones y 5 macacos del dataset Triple-N. No hay más preprocesado que la estandarización (z-score) de cada unidad con la media y la desviación típica almacenadas del conjunto de entrenamiento. El mapa ridge aplica una regresión ridge de rango reducido (rango 512): matriz codificadora de 35.494 x 512, matriz decodificadora de 512 x 346.112, escalado del resultado a una longitud fija de 69,27, suma de la rejilla media de las fotos de entrenamiento y reestructuración a 169 x 2.048. Esa rejilla reemplaza la salida del codificador de visión de Qwen3.5-2B, y el modelo congelado responde a «Describe this scene in one sentence.» con decodificación greedy.

El add-on es una red pequeña de 2,2 millones de parámetros que añade una corrección a cada uno de los 169 tokens de la rejilla. Se entrenó por aprendizaje por refuerzo con Qwen congelado: la recompensa de una leyenda muestreada era su similitud con la leyenda de referencia de esa foto menos su similitud media con las leyendas de referencia de las demás fotos de entrenamiento. La similitud es el coseno entre embeddings de frase de `all-MiniLM-L6-v2`, y las leyendas de referencia las escribió Claude Opus 5.5 a partir de las fotos. Partición: 810 fotos de entrenamiento, 90 de validación estratificadas por supercategoría COCO (solo para decidir cuándo parar el add-on) y 100 de test según `numpy.random.default_rng(0).permutation(numpy.arange(1000) % 10) == 0`.

## Capacidades

- Generación de leyendas de una frase en inglés a partir de respuestas neuronales de 35.494 unidades del córtex visual de macaco.
- Decodificación de contenido visual desde actividad neural, no desde píxeles: el pipeline no acepta imágenes como entrada.
- Dos modos de inferencia: `ridge_only` (línea base) y `ridge_addon` (con corrección por refuerzo); ambos pueden ejecutarse en la misma llamada.
- Reutiliza el conocimiento lingüístico y visual de Qwen3.5-2B sin modificarlo, lo que permite atribuir los resultados al mapeo neuronal y no a un reentrenamiento del modelo base.
- Salida determinista por foto: decodificación greedy, sin muestreo.
- Verificación de integridad de la matriz de entrada mediante sha256 declarado en `ridge_map.json`.
- No documentado: tool calling, function calling, uso como agente, razonamiento multi-paso, modo thinking, visión real, audio o capacidades multilingües.

## Casos de uso

- Estudio de correspondencia cerebro-modelo: comparar la representación interna de Qwen3.5-2B con la actividad del córtex visual de macaco, midiendo qué información es linealmente decodificable con una regresión ridge de rango 512 y qué parte requiere la corrección no lineal del add-on.
- Reproducción de resultados: el script solo acepta la matriz exacta con la que se ajustó el modelo (sha256 verificado), de modo que sirve como referencia reproducible en artículos que comparen decodificadores neuronales.
- Ablación por área cerebral: `units_in_order.csv` incluye sesión, unidad, área cerebral y fiabilidad, lo que permite reordenar o filtrar columnas para analizar qué áreas aportan más a la leyenda generada.
- Docencia y divulgación en neurociencia computacional: un notebook con una GPU y 0,8 GB de adaptadores basta para mostrar decodificación visual de actividad neural de primate de principio a fin.
- Generación de anotaciones para las 1.000 fotos NSD de Triple-N cuando no se dispone de leyendas humanas, usando el modo `ridge_only` como línea base y `ridge_addon` como versión corregida.
- Validación de pipelines MLOps con safetensors y transformers: el repositorio es un caso pequeño y bien delimitado (adaptadores + modelo base descargado de un repo fijado por revisión) para probar flujos de inferencia en GPU, control de revisiones y verificación de checksums.
- Análisis de sensibilidad al número de unidades: submuestrear columnas de la matriz de respuestas para estimar cuántas unidades hacen falta para mantener la calidad de la leyenda, útil para planificar futuros experimentos de registro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación, pero la tabla de resultados numéricos llegaba truncada en el extracto proporcionado, por lo que no se reproducen cifras.

Protocolo descrito: 100 fotos de test; cada leyenda se puntúa contra la referencia de su foto (leyenda de Claude Opus 5.5, o la media de las 5 leyendas humanas COCO); el control es la puntuación media de esa misma leyenda contra las referencias de las otras 99 fotos de test; la métrica publicada es la similitud menos el control, con intervalos de confianza bootstrap pareados del 95 % sobre fotos (10.000 remuestreos). La similitud es el coseno entre embeddings de `all-MiniLM-L6-v2`.

| Condición evaluada | Referencia | Valor |
|---|---|---|
| Ridge only | Opus | No disponible |
| Ridge + add-on | Opus | No disponible |
| Ridge only | COCO (media de 5) | No disponible |
| Ridge + add-on | COCO (media de 5) | No disponible |

## Requisitos de hardware

- Se requiere GPU: los ejemplos del script usan `device="cuda"`. No se documenta ejecución en CPU.
- Tamaño del repositorio: 0,8 GB, que incluye mapa ridge y add-on pero no el modelo base.
- Hay que sumar la descarga de Qwen3.5-2B (copia en `richiehakim/Qwen3.5-2B`, revisión `468061465adc1d153fa83f7877d0d5fe63512faf`). La VRAM total necesaria no está documentada.
- Mapa ridge: unas 195,4 millones de entradas; en float32 equivaldría a unos 780 MB de pesos, coherente con el tamaño del repositorio (cálculo aproximado a partir de las dimensiones de la model card).
- Rejillas intermedias: 169 x 2.048 valores por foto, aproximadamente 0,66 MiB en float16 y 1,32 MiB en float32 por foto (cálculo propio), por lo que el coste de memoria escalará de forma lineal con el número de fotos procesadas en un mismo lote.
- GPU recomendadas: no disponible. El único requisito explícito es una GPU compatible con torch 2.11.0 y transformers 5.19.0.
- Opciones de despliegue: script `caption_from_neurons.py` con Python, numpy, torch, transformers, huggingface_hub, safetensors, Pillow y torchvision. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama en este pipeline.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (decodificación de actividad neural a texto) en el material proporcionado. La única comparación documentada es interna, entre las dos configuraciones del propio artefacto:

| Configuración | Componentes | Parámetros añadidos | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ridge + add-on | Mapa ridge + add-on + Qwen3.5-2B congelado | 2,2 M (add-on) + mapa ridge | 35.494 respuestas neuronales | No disponible | HuggingFace, 0 descargas, 0 likes |
| Ridge only | Mapa ridge + Qwen3.5-2B congelado | Mapa ridge | 35.494 respuestas neuronales | No disponible | Mismo repositorio, flag `--models ridge_only` |
| Alternativas externas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo es válido para el conjunto Triple-N (1.000 fotos NSD, 35.494 unidades, 90 sesiones, 5 macacos). No generaliza a otros sujetos, otras grabaciones ni otras imágenes.
- Dependencia estricta de la entrada: el script acepta únicamente la matriz exacta con la que se ajustó el modelo, verificada por sha256. Cualquier cambio en el orden de columnas, en el preprocesado o en el conjunto de unidades invalida el resultado.
- Las leyendas de referencia fueron generadas por Claude Opus 5.5, no por humanos: el objetivo de entrenamiento hereda el estilo, el vocabulario y los sesgos de ese generador, y la recompensa optimiza la semejanza con él, no la veracidad de la descripción.
- Evaluación automática: la métrica es similitud coseno entre embeddings de frase; no se documenta evaluación humana de las leyendas generadas.
- Riesgo de alucinación y de descripciones genéricas: la recompensa resta la similitud media con las leyendas de otras fotos, lo que puede favorecer detalles distintivos aunque no estén respaldados por la respuesta neuronal. No existe verificación factual contra la foto original.
- Licencia no declarada: no puede asumirse uso comercial. Además, el modelo base Qwen3.5-2B tiene su propia licencia, que no se detalla en la información disponible.
- Idiomas no documentados: la salida esperada es en inglés por el prompt y las referencias utilizadas.
- Evidencia limitada: 100 fotos de test, un único artefacto sin revisión por pares (el paper citado corresponde al dataset Triple-N, no al modelo) y 0 descargas y 0 likes en el momento de la consulta.
- Repositorio creado y actualizado el 2026-10-17 con diez segundos de diferencia entre ambos eventos, lo que sugiere una publicación sin iteraciones posteriores visibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richiehakim/neurrator-triplen-qwen3.5-2b
- Copia del modelo base usada por el script: https://huggingface.co/richiehakim/Qwen3.5-2B (revisión `468061465adc1d153fa83f7877d0d5fe63512faf`)
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B (revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`)
- Paper del dataset Triple-N: https://www.nature.com/articles/s41593-026-02322-z
- Datos Triple-N: https://doi.org/10.57760/sciencedb.33556
- Modelo de embeddings citado para la métrica: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
