# mschonhardt/consilia-baldus-venice1575-kraken-seg

## Resumen

Consilia-baldus-venice1575-kraken-seg es un modelo de segmentación de layout entrenado con la librería kraken (arquitectura blla) por Michael Schonhardt en el marco del proyecto *Embedding the Past* (LOEWE-Exploration, TU Darmstadt y AdWL|Mainz), financiado por HMWK Hessen. No es un modelo de lenguaje: es un modelo de visión especializado en análisis de layout de impresos legales latinos del siglo XVI, concretamente la edición veneciana de 1575 de los *Consilia* de Baldus. Devuelve líneas de texto con sus baselines y polígonos, tipadas según las clases de la edición, además de las regiones de texto de la página.

El modelo resuelve un problema muy concreto de las humanidades digitales: la segmentación automática de páginas a dos columnas en tipo romano y cursiva, con títulos corridos, sumarios numerados antes de cada opinión, encabezamientos, números marginales y cruces en el texto. Se ha ajustado fino sobre las 1.221 páginas de entrenamiento del dataset `consilia-baldus-venice1575-pagexml` y se distribuye en formato CoreML de kraken y en safetensors para kraken 7.

Su relevancia es acotada pero real: es un modelo de referencia (baseline) reproducible para un corpus impreso concreto, con métricas de test publicadas y un consumo de cómputo mínimo (unas 2,2 horas en una sola GPU). No compite con modelos fundacionales de visión-lenguaje; su valor está en la tipificación de líneas por clase editorial y en la trazabilidad completa del entrenamiento y la evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | kraken blla (segmentación de layout y baselines) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos CoreML y safetensors sin cuantizar) |
| Idiomas soportados | latín (`la`); el modelo segmenta layout, no transcribe texto |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.mlmodel` (contenedor CoreML de kraken) y `.safetensors` (kraken 7) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura blla de kraken para segmentación de layout: predice baselines y polígonos de línea, tipados por clase, junto con las regiones de la página. Se entrenó mediante ajuste fino con `ketos segtrain` sobre 1.221 páginas de entrenamiento y 100 de validación, con 71 páginas reservadas para test (10.091 líneas). La configuración fue: learning rate 2e-4 con schedule coseno (`--cos-max 60`), aumento de datos activado, precisión mixta 16-mixed, resize `new`, 60 épocas máximas con parada temprana tras diez evaluaciones sin mejora. La mejor época fue la 7 de 18.

El cómputo fue modesto: una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) en TU Darmstadt, compartida con otros dos entrenamientos, a unas 3,3 minutos por época y 2,2 horas en total (26 de octubre de 2026). El impacto ambiental estimado es de unos 240 g CO2e atribuibles a este modelo (de unos 660 g para los tres entrenamientos, con factor de red alemán de 0,38 kg CO2e/kWh). Las clases de línea son `cons_body`, `cons_argument`, `cons_title`, `header`, `page_number` y `catch-word`; las de región, `column_1`, `column_2`, `header`, `page-number`, `footer` y `text`.

## Capacidades

- Segmentación de layout de páginas impresas: devuelve baselines y polígonos de líneas de texto.
- Tipificación de líneas por clase editorial: cuerpo de consilium, sumarios numerados, encabezamiento, título corrido, número de página y reclamo.
- Detección de regiones de página: dos columnas de texto, cabecera, número de página y pie.
- Salida en PAGE XML mediante el comando `kraken … segment -bl`.
- Integración con un modelo de reconocimiento (`consilia_rec.mlmodel`) para pipelines de OCR completo.
- Especialización en impresos legales latinos de época moderna temprana (tipo romano y cursiva, márgenes con numeración y cruces).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Digitalización de corpus legales del siglo XVI: segmentar automáticamente las páginas de los cinco volúmenes de la edición veneciana de 1575 para generar PAGE XML listo para revisión y posterior OCR, aprovechando la F1 de baseline de 0,985 en el conjunto de test.
- Construcción de portales de humanidades digitales: alimentar el portal Consilia con estructura de página (columnas, cabeceras, sumarios) de forma reproducible, usando las clases de línea para indexar opiniones y sus sumarios.
- Pipeline OCR completo: combinar `consilia_seg.mlmodel` con `consilia_rec.mlmodel` en una sola invocación de kraken para obtener texto transcrito con estructura de líneas y regiones.
- Extracción de sumarios para indización: la clase `cons_argument` permite aislar los sumarios numerados que preceden a cada consilium, útiles para construir índices temáticos, aunque con la cautela de su precisión de 0,815.
- Punto de partida para nuevos impresos: ajustar fino el modelo sobre unas decenas de páginas de otra edición de la misma época para adaptar la asignación de clases al layout propio del nuevo impreso.
- Investigación reproducible en humanidades digitales: servir de baseline documentado (log de entrenamiento, log de test, métricas por clase) para comparar futuros modelos de segmentación sobre corpus legales latinos.
- Análisis cuantitativo de la composición de página: medir proporciones de cuerpo frente a sumarios y cabeceras en el corpus para estudios sobre la puesta en página de los impresos jurídicos.

## Benchmarks y rendimiento

Evaluación con `ketos segtest` sobre las 71 páginas de test (10.091 líneas), tolerancia de baseline de 10 px:

| Métrica | Valor |
|---|---|
| F1 de baseline, todas las clases | 0,985 (precisión 0,973, recall 0,996) |
| IOU de región `column_1` | 0,961 |
| IOU de región `column_2` | 0,962 |
| IOU de región `header` | 0,795 |
| IOU de región `page-number` | 0,000 (diez regiones pequeñas en test, ninguna acertada) |

| Clase de línea | Precisión | Recall | F1 | Líneas en test |
|---|---|---|---|---|
| `cons_body` | 0,989 | 0,999 | 0,994 | 9.314 |
| `cons_argument` | 0,815 | 0,959 | 0,876 | 565 |
| `cons_title` | 0,998 | 0,998 | 0,998 | 120 |
| `header` | 0,999 | 0,978 | 0,985 | 74 |
| `page_number` | 0,986 | 0,986 | 0,986 | 1 |
| `catch-word` | 0,986 | 0,986 | 0,986 | 1 |

En validación durante el entrenamiento, la mejor época alcanzó un mean IU de 0,335 y una F1 de baseline de 0,968. No se han publicado comparaciones con otros modelos de segmentación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tipo de modelo (segmentación de layout con kraken) el consumo es bajo, pero no se publica una cifra.
- GPU recomendadas: no se especifican; el entrenamiento usó una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), compartida con otros dos entrenamientos.
- Cabe en GPU de consumo: no disponible como dato verificado; kraken puede ejecutarse en CPU, pero no se documenta el rendimiento en GPU de consumo para este modelo.
- Opciones de despliegue: kraken (CLI `kraken … segment -bl -i consilia_seg.mlmodel`), con pesos en CoreML y safetensors para kraken 7. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El coste de entrenamiento fue de 3,3 minutos por época en la GPU citada.

## Comparativa con modelos similares

No se han publicado comparaciones con otros modelos de segmentación de layout en la información disponible. Como referencia cualitativa, este modelo se distingue de los segmentadores genéricos de kraken por su tipificación de clases específicas de la edición (cuerpo, sumarios, títulos, cabeceras, números de página y reclamos) y por estar entrenado exclusivamente sobre un impreso veneciano de 1575.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| consilia-baldus-venice1575-kraken-seg | no disponible | no aplica | F1 baseline 0,985 en test | CC BY 4.0 | HuggingFace |
| Segmentadores genéricos de kraken | no disponible | no aplica | no disponible | según modelo | HuggingFace / kraken |
| Otros modelos de layout para impresos antiguos | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado sobre un único impreso (cinco volúmenes de la misma edición) y un único conjunto de escaneos; en otros impresos a dos columnas del siglo XVI pueden esperarse baselines utilizables, pero conviene revisar la asignación de clases y ajustar fino con unas decenas de páginas.
- La distinción entre sumarios (`cons_argument`) y líneas de cuerpo es el punto débil: cerca de una quinta parte de las líneas predichas como sumarios son en realidad líneas de cuerpo (precisión 0,815).
- Los números de página y los reclamos se anotaron solo en una minoría de páginas de entrenamiento; el modelo los encuentra de forma inconsistente y la región `page-number` obtuvo IOU 0,000 en test.
- Las anotaciones manuscritas marginales no constituyen una clase y suelen ignorarse o leerse como líneas de cuerpo.
- En líneas con número marginal, los polígonos de entrenamiento llegan hasta el margen interior donde está el número, por lo que el modelo aprende a incluirlo; en páginas con márgenes amplios puede incorporar también ruido.
- La clase de región `footer` cuenta con solo tres ejemplos de entrenamiento y no es fiable; la clase `text` no se predice en la práctica y debe ignorarse.
- El modelo segmenta layout y no transcribe texto: para obtener texto hace falta un modelo de reconocimiento adicional (por ejemplo, `consilia_rec.mlmodel`).
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar los términos completos de la licencia y la cita requerida por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mschonhardt/consilia-baldus-venice1575-kraken-seg
- Dataset de entrenamiento: https://huggingface.co/datasets/mschonhardt/consilia-baldus-venice1575-pagexml
- Portal Consilia: https://dekm-tud.github.io/coding-consilia/
- DOI del modelo: https://doi.org/10.57967/hf/11320
