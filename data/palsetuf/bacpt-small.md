# palsetuf/BacPT-small

## Resumen

BacPT-small es un modelo fundacional de proteomas bacterianos desarrollado por el usuario palsetuf y publicado en Hugging Face. Su propuesta técnica consiste en contextualizar los embeddings de proteínas individuales generados por ESM2 utilizando el orden en que esas proteínas aparecen en el genoma, de modo que la representación de cada proteína incorpore información de su vecindad génica. Se trata por tanto de un modelo de extracción de características (feature-extraction) y no de un modelo generativo.

El modelo emplea un backbone RoBERTa de 10 capas con embeddings posicionales relativos clave-consulta (relative key-query position embeddings) y cuenta con 51.243.360 parámetros totales. La dimensión de salida es de 480, la misma que produce `esm2_t12_35M_UR50D`, cuyas representaciones (media de la capa 12 sobre las posiciones de aminoácidos) alimentan a BacPT tras aplicar un escalador ajustado durante el entrenamiento. Acepta proteomas bacterianos completos o en borrador, con un máximo de 5.000 proteínas por genoma y descartando proteínas de más de 2.250 aminoácidos.

El repositorio contiene únicamente los pesos de inferencia correspondientes al checkpoint de la época 1.107 del entrenamiento, junto con la configuración exacta del modelo y el escalador de entrada. Es relevante ahora para equipos de bioinformática y genómica microbiana que necesiten representaciones de proteínas sensibles al contexto genómico como entrada para modelos de tarea posteriores (función enzimática, rasgos ecológicos, contexto genómico), aunque con cero descargas y cero likes registrados y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo RoBERTa de 10 capas, con embeddings posicionales relativos clave-consulta |
| Parametros totales | 51.243.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 5.000 posiciones de proteína por genoma (las proteínas adicionales se truncan); proteínas de más de 2.250 aminoácidos se omiten |
| Tipos de cuantizacion | No disponible (el repositorio no publica pesos cuantizados; se documenta float32 en CPU y autocasting float16 en CUDA) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje natural; opera sobre secuencias de proteínas) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Dimension de embedding de salida | 480 |
| Modelo previo requerido | esm2_t12_35M_UR50D (FAIR ESM v2.0.0, descargado vía PyTorch Hub) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | feature-extraction |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo RoBERTa con 10 capas y embeddings posicionales relativos de clave-consulta, lo que permite modelar las relaciones entre proteínas en función de su distancia en el genoma sin depender de posiciones absolutas. La entrada no son secuencias de aminoácidos, sino vectores de 480 dimensiones por proteína, obtenidos promediando la capa 12 de `esm2_t12_35M_UR50D` sobre todas las posiciones de aminoácidos de cada proteína. Estos vectores se normalizan con un escalador ajustado y se ordenan según su posición genómica. La cabeza de entrenamiento es auto-supervisada y reconstruye los vectores ESM2 originales, que se devuelven en el campo `reconstruction` del archivo NPZ de salida.

El pipeline de preprocesado documentado es explícito: se omiten las proteínas de más de 2.250 aminoácidos; se generan representaciones de 480 dimensiones con ESM2; se aplica el escalador de BacPT; se conservan como máximo las primeras 5.000 proteínas, rellenando (padding) los genomas más cortos hasta esa longitud; se ejecuta BacPT con la máscara de padding y el comportamiento de CUDA float16 usados en el flujo de inferencia original; y finalmente se eliminan las posiciones de relleno de la salida. Los pesos publicados corresponden a la época 1.107 de un entrenamiento cuyo número total de épocas, número de tokens, composición del corpus bacteriano y uso de RLHF o DPO no se especifican en la información disponible.

No hay datos publicados sobre el volumen del dataset de entrenamiento, la composición taxonómica de los genomas utilizados ni la metodología de ajuste fino. El manuscrito asociado, titulado «Bacterial proteome foundation model enhances functional prediction from enzymes to ecological interactions», está anunciado pero sus detalles de cita se añadirán cuando el registro sea público.

## Capacidades

- Extracción de características contextuales de proteínas: genera un embedding de 480 dimensiones por proteína que incorpora información del orden génico, a diferencia de ESM2, que produce representaciones independientes por proteína.
- Representación de proteomas completos o en borrador: procesa hasta 5.000 proteínas por genoma en una sola pasada, con soporte de máscara de padding y eliminación de las posiciones de relleno en la salida.
- Salida de capas intermedias: con la opción `--all-layers` devuelve `hidden_states` con forma `[11, proteínas, 480]`, incluyendo la salida de embedding y las 10 capas del transformer, lo que permite hacer probing por capa en tareas downstream.
- Reconstrucción auto-supervisada: la cabeza de entrenamiento devuelve la reconstrucción de los vectores ESM2, utilizable como señal auxiliar o para diagnóstico.
- Trazabilidad de entradas: el archivo NPZ de salida incluye `protein_ids`, `omitted_protein_ids` (proteínas mayores de 2.250 aminoácidos) y `truncated_protein_ids` (proteínas más allá de la posición 5.000 del modelo).
- Inferencia en CPU (float32) y en GPU (float16 con autocasting), reproduciendo el procedimiento de inferencia original en CUDA.
- No soporta generación de texto, tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de capacidades multilingües, de visión ni de audio.
- No es un modelo generativo de secuencias: no predice aminoácidos ni anota genes.

## Casos de uso

- Predicción de función enzimática a escala de proteoma: los embeddings contextuales de 480 dimensiones se usan como entrada para un clasificador supervisado que asigne códigos EC o términos GO. La ventaja frente a ESM2 puro es que la representación de cada enzima incorpora el contexto de los genes vecinos, útil cuando la función de un gen depende de su operón.
- Predicción de contexto genómico (operones y vecindad génica): el modelo está diseñado específicamente para explotar el orden de las proteínas, de modo que las representaciones resultantes permiten entrenar modelos que predigan si dos genes pertenecen al mismo operón o si comparten una ruta metabólica.
- Análisis ecológico de genomas microbianos y MAGs: a partir de genomas ensamblados a partir de metagenomas, los embeddings pueden alimentar modelos que predigan rasgos ecológicos (temperatura óptima, salinidad, pH, hábitat) con la ventaja de procesar el proteoma completo en una sola pasada de hasta 5.000 proteínas.
- Búsqueda de enzimas de interés industrial y biotecnológico: priorizar candidatos en genomas bacterianos recién secuenciados generando embeddings de proteoma completo y recuperando por similitud vectorial las proteínas próximas a enzimas de referencia, aprovechando el contexto genómico para descartar falsos positivos aislados.
- Detección de islas genómicas y transferencia horizontal: como el modelo codifica la posición relativa de cada proteína, las representaciones de regiones con composición o contexto atípico pueden alimentar clasificadores que detecten segmentos adquiridos por transferencia horizontal.
- Agrupamiento y comparación de proteomas para filogenómica y taxonomía: usar los embeddings contextuales como vector de genoma para calcular distancias entre cepas y agruparlas, complementando métodos basados en genes marcadores.
- Curación de bases de datos y deduplicación funcional: indexar los embeddings en una base de datos vectorial para recuperar proteínas funcionalmente equivalentes entre genomas distintos sin depender únicamente de la similitud de secuencia.
- Búsqueda de determinantes de resistencia antimicrobiana y virulencia: generar features de proteoma completo como entrada a modelos de tarea que prioricen genes candidatos, teniendo en cuenta que la validación experimental y el modelo de tarea quedan fuera del alcance de este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona el manuscrito «Bacterial proteome foundation model enhances functional prediction from enzymes to ecological interactions» e indica que los detalles de cita se añadirán cuando el registro sea público. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni de tareas biológicas como CAFA, GO o predicción de EC, ni comparaciones cuantitativas con ESM2 u otros modelos. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- Pesos del modelo: 51.243.360 parámetros, lo que equivale a aproximadamente 205 MB en float32 y 102 MB en float16 (cálculo derivado del número de parámetros; no publicado en la model card).
- Modelo previo ESM2: `esm2_t12_35M_UR50D` (35 M de parámetros) se descarga vía PyTorch Hub en el primer uso y añade aproximadamente 140 MB en float32.
- Consumo de memoria dominante: las activaciones de atención crecen de forma cuadrática con el número de proteínas, hasta 5.000 posiciones por genoma, por lo que la VRAM necesaria depende mucho del tamaño del proteoma procesado. No se publican cifras exactas de VRAM máxima.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente para el tamaño de los pesos; no se requiere A100 ni H100 para una sola inferencia. Modelos como RTX 3060, RTX 4090 o superiores permiten procesar genomas completos con holgura y en paralelo.
- Cabe en GPU de consumo: sí, es previsible que quepa en tarjetas de gama de entrada (por ejemplo, GTX 1060 6 GB o superiores) para proteomas de tamaño moderado; la model card no especifica un mínimo oficial.
- Inferencia en CPU: soportada explícitamente en float32, sin CUDA.
- Inferencia en GPU: float16 con autocasting, para reproducir el procedimiento original.
- Opciones de despliegue: el repositorio proporciona únicamente el script `inference.py` junto con `requirements.txt`, sobre transformers y PyTorch Hub. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia, ya que se trata de un encoder de extracción de características con cabecera auto-supervisada y no de un modelo causal.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas públicas y no formaban parte de la información proporcionada en la búsqueda, por lo que deben verificarse antes de usarse en producción.

| Modelo | Parametros | Contexto / unidad de entrada | Contexto genomico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BacPT-small | 51,2 M | Hasta 5.000 proteínas por genoma | Sí, modela el orden génico | MIT | Hugging Face (palsetuf/BacPT-small), 0 descargas |
| ESM2 (esm2_t12_35M_UR50D) | 35 M | Una proteína por inferencia (secuencia de aminoácidos) | No | MIT | Hugging Face / PyTorch Hub (FAIR) |
| ESM2 (esm2_t33_650M_UR50D) | 650 M | Una proteína por inferencia | No | MIT | Hugging Face / PyTorch Hub (FAIR) |
| ProtBert-BFD | Aproximadamente 420 M | Una proteína por inferencia | No | No disponible en la información consultada | Hugging Face (Rostlab) |

La diferencia funcional clave es que BacPT-small no compite en la misma tarea que ESM2: consume los embeddings de ESM2 y añade contexto genómico. No se dispone de comparaciones de rendimiento entre BacPT-small y estas alternativas.

## Limitaciones y advertencias

- No anota genomas ni traduce secuencias de nucleótidos: requiere un FASTA de proteínas ya ordenado por posición genómica como entrada.
- No elige un orden para proteínas desordenadas ni maneja la rotación de genomas circulares, lo que puede degradar las representaciones en genomas circulares ensamblados sin tratamiento previo.
- Omite silenciosamente las proteínas de más de 2.250 aminoácidos y trunca el proteoma en la posición 5.000; ambas circunstancias se registran en `omitted_protein_ids` y `truncated_protein_ids`, y deben revisarse antes de interpretar resultados.
- Entrenado exclusivamente con genomas bacterianos: no ha sido validado para proteomas arqueanos, eucariotas ni virales.
- No es un modelo generativo: no produce texto ni secuencias, por lo que el riesgo de alucinación se traslada a posibles patrones espurios en los embeddings, no a texto inventado.
- Sesgos esperables: sesgo taxonómico derivado de la sobrerrepresentación de determinados linajes bacterianos en las bases de datos públicas, y dependencia de la calidad de la anotación y del orden génico del ensamblado de entrada.
- Las predicciones downstream requieren modelos de tarea y validación independientes; los embeddings por sí solos no constituyen una predicción.
- Sin resultados de benchmarks publicados ni métricas de evaluación en la información disponible, y con cero descargas y cero likes registrados, no hay evidencia comunitaria de reproducibilidad.
- Los pesos corresponden a la época 1.107 de un entrenamiento sin detalles públicos sobre convergencia, número total de épocas o criterios de parada.
- Dependencia externa: el pipeline descarga el código de FAIR ESM v2.0.0 y los pesos de ESM2 a través de PyTorch Hub en el primer uso, lo que introduce una dependencia de red y de la disponibilidad de ese repositorio.
- Licencia MIT: permite uso comercial, pero el modelo previo ESM2 y el código de FAIR tienen sus propias condiciones, que deben verificarse de forma independiente.
- La fecha de creación y actualización del repositorio (2026-09-16) es muy reciente, por lo que el proyecto puede carecer de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palsetuf/BacPT-small
- Paper citado en la model card: «Bacterial proteome foundation model enhances functional prediction from enzymes to ecological interactions» (detalles de cita pendientes de publicación; no se proporciona URL).
- ESM2 (esm2_t12_35M_UR50D) de FAIR, requerido por el pipeline: no se proporciona enlace directo en la información disponible; se descarga a través de PyTorch Hub.
- Resultados de búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido sobre seguros de viaje para la República Checa), por lo que no se incluye ningún enlace adicional.
