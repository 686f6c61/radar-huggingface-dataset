# Godseye1311/radial-hyena-networks

## Resumen

Radial Hyena Networks es un artefacto de investigación publicado en HuggingFace por el usuario Godseye1311 que acompaña al trabajo *Radial Hyena Networks for Property Prediction of Nanomaterials*. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de un conjunto de pesos entrenados, datos de benchmark y registros de entrenamiento para un modelo de predicción de propiedades de nanomateriales inorgánicos representados como grafos.

El repositorio combina dos familias arquitectónicas poco habituales en el modelado de materiales: los operadores Hyena, basados en convoluciones implícitas de largo alcance, y las redes de Kolmogorov-Arnold (KAN), según las etiquetas declaradas por el autor. El objetivo declarado es predecir seis tareas distintas sobre estructuras cristalinas: sistema cristalino, grupo espacial, propiedades a nivel de átomo y las curvas de dispersión SAXS, XRD y xPDF.

El paquete tiene un interés fundamentalmente metodológico y de reproducibilidad: incluye 18 checkpoints correspondientes a seis tareas por tres semillas, el subconjunto oficial del benchmark CHILI-100K (2.975 grafos) con su partición estratificada, los registros de entrenamiento por época y un manifiesto de checksums MD5. El repositorio ocupa 0,7 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos con operadores Hyena y redes de Kolmogorov-Arnold (KAN), según las etiquetas del repositorio; no se detalla la topología exacta |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no aplica en el sentido habitual de ventana de tokens) |
| Tipos de cuantización | no disponible; se distribuyen checkpoints en precisión original, sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible; el modelo opera sobre estructuras cristalinas, no sobre texto |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura con detalle. Las etiquetas del repositorio indican el uso de *graph neural networks*, operadores *hyena* y *kolmogorov-arnold networks*. Los operadores Hyena sustituyen la atención por convoluciones implícitas de largo alcance parametrizadas con filtros de decaimiento, lo que en principio permite capturar dependencias globales sobre grafos grandes con coste subcuadrático. Las KAN reemplazan las funciones de activación fijas por funciones aprendibles (habitualmente splines), lo que puede resultar ventajoso para ajustar relaciones numéricas continuas como las curvas SAXS, XRD o xPDF. El prefijo "Radial" sugiere el uso de descriptores radiales o funciones de base radial en la construcción de las representaciones de vecindad, aunque esto no se confirma en la información proporcionada.

En cuanto al entrenamiento, el repositorio documenta que se entrenaron 18 modelos: seis tareas (`crystal_system`, `space_group`, `atom`, `saxs`, `xrd`, `xpdf`) por tres semillas (0, 1 y 2). También se incluyen modelos de grupo espacial con vocabulario restringido a la partición de entrenamiento (151 clases), empleados en los análisis mecanísticos. Los registros en `records/` contienen historiales por época, índices de partición, configuración y versiones de software. No se especifica el número de tokens ni de épocas, la composición exacta del dataset de entrenamiento, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables en este dominio). El benchmark empleado es el protocolo oficial de CHILI: 425 grafos por sistema cristalino, 2.975 en total, con partición 80/10/10 estratificada por grupo espacial y `random_state=42` (2.379 / 298 / 298).

## Capacidades

- Predicción del sistema cristalino de una estructura inorgánica a partir de su grafo.
- Clasificación de grupo espacial, con dos variantes: vocabulario completo y vocabulario restringido a las 151 clases presentes en la partición de entrenamiento.
- Predicción de propiedades a nivel de átomo.
- Predicción o ajuste de curvas SAXS (dispersión de rayos X a bajo ángulo).
- Predicción o ajuste de curvas XRD (difracción de rayos X).
- Predicción o ajuste de curvas xPDF (función de distribución de pares).
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas simbólicas ni capacidades de visión.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües (el modelo no procesa lenguaje natural).
- Capacidad especial: los análisis mecanísticos habilitados por los checkpoints con vocabulario restringido, que permiten estudiar qué información estructural utiliza el modelo.

## Casos de uso

- Clasificación cristalográfica automatizada: dado un grafo de estructura inorgánica, asignar el sistema cristalino (por ejemplo, cúbico, tetragonal o hexagonal) sin necesidad de indexación manual de difractogramas, reduciendo el tiempo de caracterización en laboratorios de síntesis.
- Determinación de grupo espacial en cribado de alto rendimiento: emplear los checkpoints de `space_group` para preclasificar grandes bibliotecas de estructuras candidatas antes de recurrir a refinamiento cristalográfico completo, que es computacionalmente mucho más costoso.
- Análisis de datos de sincrotrón: usar los modelos `saxs`, `xrd` y `xpdf` para relacionar curvas experimentales con descriptores estructurales, por ejemplo en la caracterización de nanopartículas donde la cristalinidad es parcial y el refinamiento tradicional es inestable.
- Cribado virtual de nanomateriales: predecir propiedades a nivel de átomo sobre conjuntos amplios de estructuras generadas, priorizando los candidatos que merecen síntesis y caracterización experimental.
- Reproducción de benchmarks de aprendizaje automático sobre grafos: el repositorio incluye la partición exacta, las semillas y los registros por época, lo que permite reproducir los 18 modelos reportados y comparar nuevas arquitecturas bajo el protocolo oficial de CHILI sin ambigüedad en la partición.
- Investigación en interpretabilidad de GNN para química inorgánica: los checkpoints con vocabulario de entrenamiento restringido permiten analizar hasta qué punto el modelo depende de la composición, de la topología de enlaces o de la geometría, y detectar atajos espurios en la predicción de grupos espaciales.
- Desarrollo y validación de arquitecturas híbridas: servir como referencia local para evaluar si los operadores Hyena o las KAN aportan ventajas medibles frente a convoluciones de grafos convencionales en tareas de materiales, siempre que se respete la partición estratificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona 18 modelos reportados y seis tareas evaluadas sobre el subconjunto oficial de CHILI-100K (2.975 grafos), pero no incluye métricas numéricas (exactitud, MAE, RMSE ni comparaciones) en la información proporcionada. Tampoco la búsqueda web realizada devolvió datos de rendimiento asociados a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,7 GB, lo que acota superiormente el tamaño de los 18 checkpoints en conjunto, pero no permite derivar con precisión la memoria necesaria para un modelo individual.
- GPU recomendadas: no disponibles. Al tratarse de un modelo de grafos de tamaño presumiblemente reducido, es probable que tanto CPU como GPU de gama media sean suficientes, pero esto es una estimación razonada y no un dato publicado.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamaño del repositorio, es plausible que quepa en GPU de consumo (por ejemplo, RTX 3060 o superiores), pero no hay confirmación en la documentación.
- Opciones de despliegue: los pesos son checkpoints PyTorch (`.pt`) y el autor indica que el código acompañante descarga y verifica estos ficheros automáticamente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras arquitecturas de predicción de propiedades de materiales (por ejemplo, GNN cristalográficos, modelos basados en potenciales interatómicos o aproximaciones con transformer sobre grafos), ni datos numéricos que permitan establecer una comparación rigurosa en parámetros, contexto, rendimiento o licencia.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Radial Hyena Networks | no disponible | no aplica | no disponible | CC-BY-4.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse ni desplegarse como asistente conversacional, generador de código o sistema de razonamiento textual.
- El repositorio no incluye una model card descriptiva con métricas, sesgos o limitaciones; únicamente documenta el contenido de los ficheros y el protocolo del benchmark.
- Sesgos conocidos: no disponibles. Al entrenarse sobre CHILI-100K, es esperable que herede los sesgos de composición y cobertura química de ese dataset, pero esto no se cuantifica en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo; sí existe riesgo de predicciones incorrectas fuera de la distribución química o estructural del conjunto de entrenamiento, sin que se documenten medidas de calibración o incertidumbre.
- Limitaciones de idioma: no aplica. Limitaciones de dominio: las predicciones están restringidas a nanomateriales inorgánicos representables como grafos; no cubre materiales orgánicos, polímeros ni estructuras amorfas si no están representadas en CHILI-100K.
- La partición de grupo espacial con vocabulario restringido (151 clases) limita la evaluación a las clases presentes en el conjunto de entrenamiento; las predicciones sobre grupos espaciales poco frecuentes quedan fuera de ese vocabulario.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial siempre que se atribuya la autoría y se indique la licencia. El subconjunto de benchmark deriva de CHILI-100K y debe citarse el trabajo original de Friis-Jensen et al.
- El autor no ofrece garantías sobre la exactitud de los datos ni sobre la idoneidad de los modelos para uso en producción; el repositorio no registra descargas ni validación por parte de la comunidad.
- La fecha de creación declarada (17 de septiembre de 2026) es posterior a la fecha de redacción de esta ficha, lo que sugiere un error de metadatos o una marca temporal anómala que conviene verificar antes de citar el artefacto.
- Para producción, cualquier uso debería ir precedido de una validación independiente sobre datos propios, dado que el repositorio no publica métricas de rendimiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Godseye1311/radial-hyena-networks
- Dataset CHILI-100K (paper de referencia): U. Friis-Jensen, F. L. Johansen, A. S. Anker, E. B. Dam, K. M. Ø. Jensen, R. Selvan. *CHILI: Chemically-informed large-scale inorganic nanomaterials dataset for advancing graph machine learning.* arXiv:2402.13221, 2024. https://arxiv.org/abs/2402.13221
- No se han encontrado otros enlaces relevantes (paper del modelo, repositorio de código, demo o blog) en la búsqueda web realizada. Los resultados devueltos por dicha búsqueda no guardan relación con este modelo ni con el dominio de ciencia de materiales.
