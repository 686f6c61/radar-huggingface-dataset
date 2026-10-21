# sekkit/bioemu2

## Resumen

BioEmu-2 es un modelo de investigación desarrollado por Microsoft Research que genera *ensembles* de estructuras 3D plausibles de biomoléculas en representación de todos los átomos (*all-atom*) a partir de su composición química. A diferencia de los modelos de plegamiento que devuelven una única estructura, BioEmu-2 muestrea múltiples conformaciones mediante difusión inversa, lo que permite estudiar el movimiento y la interacción de biomoléculas. Soporta complejos multicadena, ligandos unidos y ácidos nucleicos.

El modelo se presenta como un *score model* de difusión de aproximadamente 500 millones de parámetros, con entradas consistentes en secuencias biomoleculares y, opcionalmente, un alineamiento múltiple de secuencias (MSA), condicionamiento por contactos de distancia entre átomos y condicionamiento por método. La salida son coordenadas cartesianas de todos los átomos. Se entrenó entre agosto y septiembre de 2026 y se publicó en octubre de 2026 bajo licencia MIT.

La relevancia actual del modelo reside en su enfoque: no solo predice una estructura, sino una distribución de estados conformacionales, y lo evalúa frente a modelos de *cofolding* y frente a emulación de dinámica molecular (MD). Conviene señalar que la ficha de HuggingFace consultada corresponde al identificador `sekkit/bioemu2`, mientras que la *model card* atribuye el desarrollo a Microsoft Research y enlaza los checkpoints oficiales en `microsoft/bioemu2`; no se dispone de información sobre la relación entre ambas publicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de puntuación (*score model*) de difusión *all-atom*; muestreo por difusión inversa |
| Parametros totales | Aproximadamente 500 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La model card menciona evaluación en complejos de más de 1.500 tokens y advierte sobre dificultades por encima de 10.000 tokens, pero no define una ventana de contexto formal |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible. No es un modelo de lenguaje: la entrada es una secuencia biomolecular, no texto en lenguaje natural |
| Licencia | MIT |
| Formato de pesos | No disponible. El repositorio de HuggingFace ocupa 2,0 GB y se enlazan checkpoints en `microsoft/bioemu2` sin especificar formato (safetensors, GGUF, etc.) |

## Arquitectura y entrenamiento

BioEmu-2 es un modelo de difusión que actúa como *score model* sobre coordenadas cartesianas de todos los átomos. La generación se realiza por difusión inversa: partiendo de ruido, el modelo muestrea una conformación plausible condicionada por la secuencia de entrada y, opcionalmente, por un MSA, por restricciones de distancia entre átomos concretos y por condicionamiento de método. La arquitectura se describe explícitamente como *diffusion-based all-atom score model*; no se detalla en la información disponible si emplea un transformer, un grafo de átomos o una combinación híbrida, ni el número de capas o dimensión de los bloques.

En cuanto a datos, la model card cita PDB, AFDB (AlphaFold DB) y datos de dinámica molecular generados por Microsoft, sin especificar el número de tokens, el volumen de estructuras ni la composición porcentual del dataset. No se mencionan fases de RLHF ni DPO, lo cual es coherente con un modelo generativo de estructuras y no de texto. La evaluación cubre tres frentes declarados: predicción de estructura con *benchmarks* públicos, muestreo multiconformacional con un conjunto curado a partir de estructuras PDB muy similares, y emulación de MD con una suite propia; se emplea el mismo checkpoint en todas las evaluaciones.

## Capacidades

- Generación de *ensembles* conformacionales de estructuras 3D *all-atom* en coordenadas cartesianas, no una única estructura.
- Predicción de estructura a partir de la composición química y la secuencia de la biomolécula.
- Soporte de complejos multicadena, ligandos unidos y ácidos nucleicos.
- Condicionamiento opcional mediante MSA para mejorar la calidad del muestreo.
- Condicionamiento por restricciones de distancia entre átomos concretos especificados por el usuario.
- Condicionamiento por método (parámetro de entrada adicional descrito en la model card).
- Emulación de dinámica molecular: muestreo de estados conformacionales alternativos sin ejecutar MD explícita.
- Escalado a complejos grandes en inferencia, con evaluación específica en complejos de más de 1.500 tokens.
- API en Python e interfaz de línea de comandos en el código de inferencia open source.

No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso orientado a agentes, generación de texto, visión, audio ni modo *thinking*; estas capacidades no aplican a la naturaleza del modelo.

## Casos de uso

- **Exploración de estados conformacionales alternativos:** dado que el modelo muestrea múltiples conformaciones en lugar de una sola, un grupo de biología estructural puede generar *ensembles* para estudiar transiciones entre estados *apo* y *holo* de una proteína y comparar la heterogeneidad predicha con datos experimentales.
- **Interpretación de datos de restricción de distancia:** gracias al condicionamiento por distancias entre átomos, se pueden incorporar restricciones derivadas de entrecruzamiento (*crosslinking*), FRET o SAXS para filtrar y guiar la generación hacia conformaciones compatibles con las observaciones.
- **Análisis de interfaces en complejos multicadena:** el soporte de complejos multicadena y ligandos permite generar hipótesis sobre la geometría de la interfaz y evaluarlas con métricas tipo DockQ antes de diseñar experimentos de mutagénesis.
- **Priorización de constructos y variantes:** para constructos de ingeniería o mutantes concretos, el modelo puede producir estructuras plausibles que ayuden a descartar diseños con problemas estéricos evidentes, siempre con la cautela de que la calidad cae con MSAs pobres.
- **Sustitución parcial de dinámica molecular en cribados exploratorios:** la emulación de MD declarada permite muestrear estados conformacionales a un coste muy inferior al de una simulación explícita, útil para explorar un espacio amplio antes de lanzar MD de validación.
- **Integración en pipelines HPC de biología estructural:** la API de Python y la CLI permiten encadenar generación de *ensembles*, cálculo de métricas (RMSD, TM-score, lDDT) y validación física dentro de flujos automatizados en clúster.
- **Evaluación metodológica y docencia:** como modelo de referencia para comparar enfoques de *cofolding* frente a modelos generativos de *ensembles*, por ejemplo reproduciendo el conjunto de test de Boltz-1 citado en la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* describe la metodología de evaluación (RMSD, TM-score, lDDT, *physicality* e interfaz DockQ sobre el conjunto de test de Boltz-1; cobertura de estados y divergencia de distribuciones de pesos en emulación de MD; escalado a complejos grandes) y afirma que se compara con modelos de *cofolding* del estado del arte, pero no incluye cifras numéricas en el contenido proporcionado.

## Requisitos de hardware

- Único requisito documentado: el modelo se ha probado en GPUs NVIDIA, siendo una A100 de 80 GB el dispositivo más pequeño validado.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmética, los aproximadamente 500 M de parámetros ocupan alrededor de 2 GB en fp32 y 1 GB en fp16, pero la memoria necesaria para el muestreo por difusión sobre representaciones *all-atom*, las activaciones y el condicionamiento por MSA no está cuantificada en la información disponible, y probablemente excede con holgura el tamaño de los pesos.
- GPU recomendadas: A100 80 GB (mínimo probado). No hay datos publicados sobre H100, L40S u otras.
- ¿Cabe en GPU de consumo? No hay evidencia en la información proporcionada; el mínimo probado de 80 GB apunta a que no es viable en GPUs de consumo sin cuantización y reducción de tamaño de sistema, algo no documentado.
- Opciones de despliegue: código de inferencia open source con API de Python y CLI (repositorio `microsoft/bioemu2`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; estos *frameworks* están orientados a modelos de lenguaje y no aplican directamente.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Salida | Soporte de ligandos y ácidos nucleicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioEmu-2 | Difusión *all-atom* (score model) | Ensemble conformacional | Sí (ligandos unidos, ácidos nucleicos, multicadena) | MIT | Checkpoints en HuggingFace y código en GitHub |
| BioEmu (versión previa, Microsoft Research) | Modelo generativo de ensembles | Ensemble conformacional | No disponible en la informacion proporcionada | No disponible | No disponible |
| Boltz-1 | Cofolding | Estructura única (conjunto de test citado en la evaluación) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible |
| AlphaFold 3 | Cofolding | Estructura única | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible |

No se dispone de datos verificados de parámetros, contexto o rendimiento numérico de los modelos comparados en la información proporcionada; la comparación se limita, por tanto, al enfoque metodológico y al tipo de salida.

## Limitaciones y advertencias

- **Salidas como hipótesis, no medidas:** las estructuras generadas no están validadas experimentalmente y deben tratarse como hipótesis computacionales sujetas a validación posterior.
- **Dependencia del MSA:** se espera un deterioro de la calidad con MSAs poco profundos o de baja calidad, incluyendo proteínas huérfanas, constructos de ingeniería y algunas proteínas virales.
- **Sesgo hacia la distribución de entrenamiento:** PDB, AFDB y los datos de MD generados por Microsoft sobrerrepresentan familias proteicas bien estudiadas; el comportamiento en clases de secuencia poco representadas es incierto.
- **Ensayos no calibrados:** la frecuencia de muestreo no debe interpretarse como una probabilidad de Boltzmann calibrada ni como una energía libre cuantitativa.
- **Alcance de ligandos:** admite ligandos unidos aportados por el usuario, pero el diseño *de novo* de ligandos y la predicción de afinidad de unión están fuera de alcance.
- **Sistemas muy grandes:** el modelo puede tener dificultades para producir estructuras físicamente plausibles en complejos extremadamente grandes (más de 10.000 tokens).
- **Usos excluidos explícitamente:** decisiones clínicas o de diagnóstico, diseño de toxinas, patógenos o constructos de ganancia de función, predicción cuantitativa de afinidad de unión o energía libre absoluta, diseño *de novo* de moléculas pequeñas y toma de decisiones autónoma de alto riesgo.
- **Licencia y uso comercial:** la licencia es MIT, lo que permite uso comercial, pero Microsoft declara que el modelo se publica con fines de investigación y no recomienda su uso en aplicaciones comerciales o del mundo real sin pruebas y desarrollo adicionales. Es una recomendación del autor, no una restricción legal de la licencia.
- **Riesgo por combinación con otras herramientas:** la model card advierte de que combinarlo con herramientas de generación de secuencias o diseño autónomo puede crear riesgos no evaluados para el modelo por sí solo.
- **Procedencia de esta publicación:** el repositorio consultado pertenece al usuario `sekkit`, no a Microsoft; conviene verificar los checkpoints en `microsoft/bioemu2` antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace (publicación consultada): https://huggingface.co/sekkit/bioemu2
- Checkpoints oficiales citados en la model card: https://huggingface.co/microsoft/bioemu2
- Código fuente citado en la model card: https://github.com/microsoft/bioemu2
- Paper o informe técnico: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
