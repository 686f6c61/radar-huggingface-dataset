# gcol33/resolve-models

## Resumen

RESOLVE model suites for the browser es un conjunto de grafos ONNX publicados por el desarrollador gcol33 que reproducen en el navegador el motor de predicción del proyecto RESOLVE. A partir de la lista de especies de un inventario de vegetación europeo (con su cobertura), los modelos predicen el hábitat EUNIS de nivel 1, la altitud, la pendiente, el área de la parcela, el año del levantamiento y la localización geográfica. No es un modelo de lenguaje: es un conjunto de cabezas predictivas especializadas en datos ecológicos estructurados.

El repositorio se organiza en dos suites. `V_species_context` contiene modelos que leen las especies con su cobertura, las coordenadas de la parcela y el año y mes del levantamiento; cada objetivo consume únicamente las entradas que declara su `target.json`. `V_minimal` contiene modelos que leen exclusivamente las especies y su cobertura. Cada directorio de objetivo incluye un `target.json` con vocabularios, entradas, cabezas de salida y la regla que combina a los miembros, además de cinco miembros `seed_<k>.onnx` entrenados con semillas distintas.

La relevancia práctica del paquete es que traslada un motor de inferencia ecológica de Python a ONNX, lo que permite ejecutarlo íntegramente en el navegador sin servidor ni GPU, con una paridad verificada frente al motor original sobre 2.000 parcelas del UK National Plant Monitoring Scheme. El repositorio ocupa 1,3 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafos ONNX (redes neuronales prealimentadas con entradas categóricas y continuas, ensambladas por objetivo); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; consume un vector de especies y variables de parcela) |
| Tipos de cuantización | no disponible (los artefactos publicados son grafos ONNX sin indicación de cuantización) |
| Idiomas soportados | no aplica; los datos de entrada son nombres taxonómicos de World Flora Online |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`.onnx`), cinco miembros por objetivo más `target.json` |
| Tamaño del repositorio | 1,3 GB |
| Suites publicadas | `V_species_context` y `V_minimal` |
| Objetivos de predicción | hábitat EUNIS (nivel 1), altitud, pendiente, área de parcela, año de levantamiento, localización |
| Fuente taxonómica | nombres de World Flora Online tal como se emparejan en el European Vegetation Archive |
| Librería declarada | onnx |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de las redes (número de capas, dimensiones ocultas ni función de activación). Lo que sí se especifica es la interfaz de cada grafo: recibe los identificadores de especie ensamblados, los identificadores de género y familia, los pesos del pool, un indicador de cobertura y el bloque continuo en bruto, con valores NaN donde falta el dato, y devuelve el objetivo en sus unidades originales. Cada objetivo tiene cinco miembros entrenados con semillas diferentes, y el `target.json` correspondiente define la regla que los combina, lo que constituye un ensamblado por objetivo con agregación declarativa.

El entrenamiento se realizó sobre datos de inventarios de vegetación europeos, con especies armonizadas contra World Flora Online y emparejadas en el European Vegetation Archive. No se indica el número de parcelas de entrenamiento, la composición del conjunto, ni si hubo ajuste fino posterior. La validación reportada es de paridad funcional, no de exactitud predictiva: sobre 2.000 parcelas del UK National Plant Monitoring Scheme, todas las etiquetas EUNIS coinciden con las del motor de referencia, las probabilidades difieren en menos de 1e-6 y las regresiones en menos de 5e-4 de su valor.

## Capacidades

- Clasificación de hábitat EUNIS de nivel 1 a partir de la composición florística de una parcela.
- Regresión de altitud y de pendiente de la parcela.
- Regresión del área de la parcela.
- Regresión del año del levantamiento.
- Predicción de localización a partir de las especies (suite `V_species_context`, que además recibe coordenadas y fecha como entrada).
- Dos modos de inferencia: con contexto espacial y temporal (`V_species_context`) o solo con especies y cobertura (`V_minimal`).
- Ejecución en navegador mediante grafos ONNX, sin dependencia de Python en tiempo de inferencia.
- Ensamblado de cinco semillas por objetivo con regla de combinación declarada en `target.json`.
- Manejo explícito de datos faltantes en el bloque continuo mediante NaN.
- No soporta tool calling, agentes, generación de texto, código, matemáticas, visión ni audio.

## Casos de uso

- Aplicación web de campo para botánicos: introducir la lista de especies y coberturas de un inventario y obtener el hábitat EUNIS y la altitud estimada sin conexión a un servidor, gracias a la ejecución ONNX en el navegador.
- Control de calidad de metadatos en bases de datos de vegetación: comparar el año, el área y la pendiente registrados con los predichos por `V_minimal` para detectar fichas con datos mal introducidos o incompletos.
- Imputación de metadatos ausentes en repositorios históricos de inventarios, usando `V_minimal` cuando no se dispone de coordenadas ni fecha y `V_species_context` cuando sí se conservan.
- Cartografía de hábitats para conservación: clasificar lotes de inventarios georreferenciados en niveles EUNIS 1 y agregarlos por cuadrícula para informes de biodiversidad.
- Docencia en ecología de la vegetación: utilizar el predictor en el navegador para que el alumnado compruebe cómo la composición florística condiciona la clasificación del hábitat.
- Integración en pipelines de investigación reproducibles: cargar los cinco miembros por objetivo con ONNX Runtime en Python y aplicar la regla de combinación de `target.json` para obtener predicciones deterministas y versionadas.
- Filtrado previo en estudios de cambio global: descartar parcelas cuya altitud o pendiente predicha contradice la registrada antes de análisis estadísticos posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de exactitud (precisión, F1, MAE, R²) en la información disponible. El único dato de evaluación es la paridad con el motor de referencia `SuitePredictor`:

| Prueba | Conjunto | Resultado |
|---|---|---|
| Coincidencia de etiquetas EUNIS | 2.000 parcelas del UK National Plant Monitoring Scheme | todas las etiquetas coinciden |
| Diferencia en probabilidades | mismas 2.000 parcelas | < 1e-6 |
| Diferencia en regresiones | mismas 2.000 parcelas | < 5e-4 del valor |

Estos valores miden fidelidad de la exportación a ONNX respecto al motor original, no calidad predictiva frente a la verdad de campo.

## Requisitos de hardware

- VRAM: no disponible; el paquete está pensado para ejecución en CPU (WASM en navegador), por lo que no requiere GPU.
- GPU recomendadas: no aplica; no se documenta ruta de ejecución en GPU.
- GPU de consumo: irrelevante para el caso de uso previsto; cualquier equipo que ejecute un navegador moderno con soporte WebAssembly puede correr los grafos.
- CPU: no se especifican requisitos mínimos. El repositorio completo es de 1,3 GB, aunque en el navegador solo se descargan los objetivos y miembros que se vayan a utilizar.
- Despliegue: ONNX Runtime en el navegador a través del predictor RESOLVE (`resolve-web`); también es posible cargar los `.onnx` con ONNX Runtime en Python u otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de alternativas comparables (clasificadores EUNIS exportados a ONNX con ensamblado por semillas) en la información proporcionada. La referencia directa es el propio motor RESOLVE en su implementación Python, del que estos grafos son una réplica funcional:

| Modelo | Formato | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| RESOLVE model suites (este modelo) | ONNX | especies, cobertura, coordenadas, fecha | CC-BY-4.0 | HuggingFace, 0 descargas |
| Motor RESOLVE original | Python (PyTorch, según el repositorio del proyecto) | mismo conjunto de entradas | no disponible en la información | GitHub |
| Otros clasificadores EUNIS | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito geográfico y florístico limitado a Europa: el vocabulario de especies procede del European Vegetation Archive y de World Flora Online, por lo que inventarios de otras regiones o con taxones no emparejados no están cubiertos por el diseño declarado.
- Solo se predice hábitat EUNIS de nivel 1; no hay niveles inferiores de la jerarquía.
- No se han publicado métricas de exactitud: la única validación es de paridad con el motor original, de modo que los errores del motor de referencia se heredan íntegramente.
- El tratamiento de especies desconocidas o fuera de vocabulario no está documentado; es un punto a verificar antes de usarlo en producción.
- Las regresiones (altitud, pendiente, área, año, localización) dependen de la distribución de los inventarios de entrenamiento y pueden degradarse fuera de ella; el área y el año son especialmente sensibles a convenciones de muestreo.
- El bloque continuo admite NaN para datos faltantes, pero no se especifica el efecto de una proporción alta de valores ausentes sobre la predicción.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es obligatorio citar al autor y mantener la referencia a la licencia en trabajos derivados.
- Repositorio sin descargas ni valoraciones y con fechas de creación y actualización de 2026, lo que impide evaluar su madurez y su validación por la comunidad.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gcol33/resolve-models
- Repositorio del proyecto RESOLVE: https://github.com/gcol33/resolve
- Predictor web RESOLVE: https://github.com/gcol33/resolve-web
- Resultados de búsqueda web: sin enlaces relevantes sobre el modelo en la información disponible.
