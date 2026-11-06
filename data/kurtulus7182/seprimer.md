# kurtulus7182/SEPrimer

## Resumen

SEPrimer (publicado como "SE Primer — Kriz freni model kartı") es un artefacto de clasificación tabular desarrollado por el usuario kurtulus7182 y alojado en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline compuesto por un `StandardScaler` y una regresión logística de scikit-learn, exportado a ONNX para su ejecución en cliente. Su propósito declarado es predecir si un jugador solicitará una pista de orientación dentro de un juego educativo llamado "Muhteşem Cuma ödeme krizi" (la crisis de pago del Viernes Fantástico).

El modelo opera sobre entradas tabulares de forma `[N, 5] float32` y devuelve una probabilidad de clase positiva con un umbral de decisión fijado en 0,60. El artefacto está marcado explícitamente como `synthetic-demo`: se ha entrenado únicamente con 240 sesiones sintéticas generadas por `scripts/generate_demo.py` con semilla 42, y el autor advierte que no se ha medido el rendimiento con usuarios reales ni se ha validado con datos humanos.

La relevancia de esta ficha es limitada y fundamentalmente metodológica: sirve como ejemplo de buenas prácticas de empaquetado reproducible (contrato de características, `config.json` con hashes SHA256, verificación de paridad ONNX/sklearn por debajo de 1e-4) más que como modelo reutilizable. No debe confundirse con un modelo de IA generativa ni emplearse en producción fuera del contexto lúdico para el que fue concebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + regresión logística, exportado a ONNX |
| Parametros totales | No disponible (el autor no publica el número de coeficientes; para 5 características y clasificación binaria es del orden de decenas de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular fija de 5 características, `[N, 5] float32`) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones; el modelo es de precisión nativa float32) |
| Idiomas soportados | Turco (`tr`) como idioma de la documentación y del dominio de aplicación; el modelo en sí procesa variables numéricas, no texto |
| Licencia | No disponible |
| Formato de pesos | ONNX (pipeline único); artefacto también en formato scikit-learn según la librería declarada |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal binario: estandarización de las cinco características de entrada mediante `StandardScaler` seguida de una regresión logística. Ambos pasos se empaquetan en un único grafo ONNX, de modo que el cliente no necesita replicar el escalado. La salida es una probabilidad absoluta con umbral de decisión 0,60 para la clase positiva (1 = el jugador pide pista). El autor especifica que la paridad numérica entre la implementación Python (oráculo) y el runtime ONNX/WASM en navegador se mantiene con una diferencia absoluta de probabilidad inferior a 1e-4 sobre cinco referencias.

El entrenamiento se realizó exclusivamente sobre 240 sesiones sintéticas generadas con semilla 42 por `scripts/generate_demo.py`, con una partición holdout del 25 % a nivel de sesión (`GroupShuffleSplit`). El etiquetado es autodeclarado antes de la decisión y no se deriva del modelo ni de resultados A/B. Existe una puerta de aceptación: accuracy en test ≥ 0,75 con el umbral 0,60, presencia de ambas clases en entrenamiento y test, y superación estricta del baseline de mayoría del holdout (la igualdad se rechaza). El autor indica que un candidato con datos reales no superó esta puerta y por ello no se publicó; el artefacto actual es solo la demo sintética. No se documenta ningún proceso de RLHF, DPO ni ajuste por refuerzo, algo esperable en un modelo lineal.

## Capacidades

- Clasificación tabular binaria: predice la probabilidad de que un jugador solicite una pista de orientación a partir de cinco características numéricas.
- Integración en cliente: el pipeline ONNX incluye el escalado, por lo que puede ejecutarse en navegador vía ONNX Runtime Web/WASM sin preprocesado adicional.
- Reproducibilidad verificable: `contract.json` fija el orden y rangos de características y los umbrales antes del entrenamiento; `config.json` incluye hashes SHA256 de datos y modelo, orden de clases, métricas y versiones de dependencias.
- Control de decisión configurable: umbral de 0,60 documentado y aplicado de forma consistente en la evaluación.
- Ámbito de uso acotado: alimenta decisiones de juego (pregunta contextual de escena, momento de apertura del mentor y parada del contador en modo experimentado).
- Sin capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes. No es un modelo de lenguaje.

## Casos de uso

- Prototipado de sistemas de tutoría adaptativa en juegos educativos: el modelo decide si mostrar una pista al jugador según su comportamiento reciente; su tamaño mínimo permite ejecutarlo en el cliente sin backend.
- Ejemplo docente de MLOps reproducible: sirve para ilustrar contratos de características, versionado conjunto de modelo y configuración, y verificación de paridad entre frameworks (sklearn vs ONNX).
- Demostración de despliegue ONNX en navegador: al ser un grafo único con entrada `[N, 5] float32`, es un caso mínimo para probar ONNX Runtime Web y WASM en pipelines frontend.
- Pruebas de integración de inferencia en el cliente: útil para validar latencia, serialización y control de versiones en entornos donde no se quiere enviar datos al servidor.
- Referencia para diseño de puertas de evaluación: el esquema de holdout por sesión, baseline de mayoría y umbral de accuracy ≥ 0,75 es reutilizable como plantilla en proyectos de clasificación tabular pequeños.
- Simulación y pruebas de mecánicas de juego: permite generar trayectorias sintéticas de decisión de pistas para testear balanceo y flujos de UI antes de disponer de datos reales.
- No es adecuado para atención al cliente, generación de código, análisis de documentos ni ninguna tarea de NLP: carece de cualquier capacidad lingüística.

## Benchmarks y rendimiento

La model card declara un `model-index` con nombre "SE Primer Kriz Freni" y una lista de resultados vacía. No se publican valores numéricos de accuracy, F1 ni AUC en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| SE Primer Kriz Freni (model-index) | Sin resultados | Lista `results: []` en la model card |
| Accuracy en test (holdout 25 %, seed 42) | No disponible | El autor remite a `config.json` del mismo commit; no se incluye el valor |
| Baseline de mayoría del holdout | No disponible | Se exige superarlo estrictamente, pero no se publica la cifra |
| Paridad ONNX vs sklearn | Diferencia absoluta < 1e-4 | Declarado sobre cinco referencias |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el modelo cabe en kilobytes y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no requiere GPU. Cualquier CPU moderna es suficiente; opcionalmente GPU integrada para ONNX Runtime.
- Cabe en cualquier GPU de consumo (y en ninguna es necesaria), así como en navegadores mediante WASM.
- Opciones de despliegue: ONNX Runtime (Python, Web/WASM), scikit-learn en Python, y exportación a otros runtimes compatibles con ONNX.
- Latencia y throughput: no documentados; por la naturaleza del modelo (5 características, regresión logística) la inferencia es del orden de microsegundos a milisegundos por lote en CPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados por el mismo autor ni de alternativas directas en el ecosistema con este propósito específico. A modo de referencia categórica:

| Modelo | Tipo | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEPrimer (kurtulus7182) | Regresión logística + scaler (ONNX) | Tabular `[N,5]` | No aplica | No disponible | Hugging Face, 0 descargas |
| Clasificadores tabulares de scikit-learn genéricos | Lineales / árboles | Tabular | No aplica | BSD-3 (scikit-learn) | PyPI |
| TabPFN / modelos tabulares fundacionales | Transformer tabular | Tabular | No aplica | Varía por versión | Hugging Face / repos |

La comparación con modelos de lenguaje no procede: SEPrimer no comparte categoría, escala ni tarea con ellos.

## Limitaciones y advertencias

- Entrenado solo con datos sintéticos (240 sesiones, seed 42); el autor declara explícitamente que no se ha medido el rendimiento con usuarios reales y que la accuracy sintética no implica éxito en producción.
- El candidato con datos reales no superó la puerta de evaluación y no se publicó; este artefacto es únicamente una demo.
- Sesgos conocidos: datos de una sola historia y un solo juego; efecto de aprendizaje en partidas repetidas; sesgo de autodeclaración en las etiquetas.
- El perfil de jugador elegido no es una medida objetiva de experiencia; "pensar mucho" no equivale a fracaso y el modelo no lo modela.
- La separación por sesión no garantiza separación por persona, por lo que puede haber fuga de identidad entre particiones.
- Las probabilidades del modelo no son puntuaciones de confianza calibradas.
- Uso prohibido por el autor: calificación de estudiantes, selección de personal, evaluación de personalidad o salud, y toma de decisiones en sistemas de pago reales.
- El modelo descargado en el cliente no es secreto; no debe contener lógica sensible.
- Licencia no especificada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de cualquier uso fuera del ámbito educativo.
- Idiomas: documentación en turco; el modelo no procesa texto, por lo que el soporte multilingüe no aplica.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero sí existe riesgo de sobreajuste a la distribución sintética y de generalización deficiente.

## Enlaces

- Hugging Face: https://huggingface.co/kurtulus7182/SEPrimer
- Documentación de LogisticRegression (scikit-learn): https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- Documentación de GroupShuffleSplit (scikit-learn): https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GroupShuffleSplit.html
- Tutorial de skl2onnx (opciones de ZipMap): https://onnx.ai/sklearn-onnx/auto_tutorial/plot_dbegin_options_zipmap.html
- Despliegue web de ONNX Runtime: https://onnxruntime.ai/docs/tutorials/web/deploy.html
