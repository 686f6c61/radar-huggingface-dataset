# krho/openadmet-cyp-regression-method-report

## Resumen

El repositorio `krho/openadmet-cyp-regression-method-report` no contiene un modelo de lenguaje, sino el informe de metodo (method report) de una participacion en el OpenADMET CYP Inhibition Blind Challenge, en la pista de regresion de inhibicion directa de cuatro isoformas del citocromo P450 (CYP1A2, CYP2C9, CYP2D6 y CYP3A4). Lo firma KR LAB Bio Inc. (Republica de Corea) bajo el alias de leaderboard "KR LAB Bio" y describe un unico regresor LightGBM que predice pIC50 sobre 750 compuestos cegados.

El interes tecnico no esta en el modelo en si, que el propio autor califica de deliberadamente modesto (mejor de veinte configuraciones evaluadas en una sola sesion, sin ensembling ni representaciones preentrenadas), sino en el analisis del comportamiento de la metrica ST-RAE. El informe demuestra que la puntuacion macro-promediada esta dominada por una sola de las cuatro isoformas (CYP3A4) por una propiedad de los intervalos de medicion del ensayo, no del modelo.

El repositorio es, por tanto, documentacion metodologica de quimioinformatica y aprendizaje automatico aplicado al descubrimiento de farmacos, no un artefacto de inferencia desplegable. No incluye pesos, tokenizador ni pipeline de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre arboles de decision), un unico regresor entrenado sobre filas (compuesto, isoforma) con one-hot de isoforma |
| Parametros totales | no disponible (no es una red neuronal; numero de arboles y hojas no reportado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (idioma del informe; el modelo opera sobre descriptores moleculares, no texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (el repositorio contiene un informe, no pesos del modelo) |

## Arquitectura y entrenamiento

El modelo es un regresor LightGBM unico que agrupa las cuatro isoformas en un solo conjunto de entrenamiento mediante una codificacion one-hot de la isoforma, de modo que los cuatro endpoints comparten un mismo modelo. Se entrena sobre 4.901 compuestos con al menos una medida pIC50 dosis-respuesta, lo que suma 6.521 pares (compuesto, isoforma) medidos; la mayoria de compuestos (3.592) solo tienen medida en una isoforma, mientras que 1.039 tienen dos, 229 tienen tres y 41 tienen las cuatro.

Al conjunto de entrenamiento se anaden 34.586 mediciones publicas auxiliares (19.961 compuestos) con un peso de muestra reducido y una marca de fuente propia. Proceden de PubChem AID 1851 (18.138 filas), 37 ensayos CYP de ChEMBL (15.423) y la publicacion del blog de Octant (1.025); por isoforma se reparten en CYP3A4 13.145, CYP1A2 7.814, CYP2C9 7.356 y CYP2D6 6.271. Solo se retienen las filas con relacion de actividad de igualdad, descartando 50.225 filas censuradas (reportadas como cota), decision que mejoro la metrica de 0.7250 a 0.7227. Las filas auxiliares entran unicamente en el lado de entrenamiento de cada fold y se eliminan las que coinciden con compuestos retenidos, evitando fuga entre particiones.

La validacion cruzada usa una particion por esqueleto de Murcko (Murcko scaffold split). El autor reporta que las dos decisiones que explican la mayor parte de la mejora frente a la linea base del tutorial (MA-ST-RAE 0.8257) son el agrupamiento de las cuatro isoformas en un solo modelo (0.7615 a 0.7508 con fingerprints fijos) y la incorporacion de las mediciones publicas auxiliares (0.7508 a 0.7227, la mayor mejora individual encontrada). Tambien midio y descarto el promedio de tres semillas de LightGBM: mejora de 0.0037 en MA-ST-RAE con t pareada de 61.95 y signo consistente en el 97.8% de las muestras bootstrap, pero por debajo del umbral preregistrado y sin cambiar el ranking.

## Capacidades

- Prediccion de pIC50 de inhibicion directa para cuatro isoformas del citocromo P450: CYP1A2, CYP2C9, CYP2D6 y CYP3A4.
- Regresion continua sobre descriptores moleculares (fingerprints y caracteristicas derivadas; el informe no detalla la lista completa de descriptores).
- Modelo unico multi-endpoint: una sola llamada predice las cuatro isoformas mediante el one-hot de isoforma.
- Aprovechamiento de mediciones publicas auxiliares de ChEMBL, PubChem y Octant como filas de entrenamiento ponderadas.
- Analisis de descomposicion de la metrica ST-RAE por isoforma, con calculo de la ratio de acierto dentro del intervalo de credibilidad frente a un predictor de media constante.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Filtrado temprano de inhibicion CYP en cribado virtual: el modelo puntua compuestos candidatos frente a las cuatro isoformas antes de ensayos dosis-respuesta, permitiendo priorizar que moleculas pasar a laboratorio húmedo y reducir coste experimental.
- Evaluacion de riesgo de interacciones farmacologicas: predecir la inhibicion directa de CYP3A4, CYP2D6, CYP2C9 y CYP1A2 ayuda a anticipar potencial de interacciones metabolico-farmacologicas en fases tempranas de descubrimiento.
- Priorizacion en series quimicas: al ser un gradient boosting ligero, permite reentrenar y puntuar rapidamente series de analogos y ordenar por pIC50 predicho dentro de un programa de optimizacion de lideres.
- Benchmarking de pipelines ADMET: el informe y sus cifras de ST-RAE por isoforma sirven como referencia metodologica para equipos que construyan sus propios modelos de inhibicion CYP y quieran comparar con una linea base reproducible.
- Analisis de fiabilidad de metricas en retos ciegos: el desglose de la ratio de acierto dentro del intervalo (2.47 en CYP3A4 frente a 1.05, 1.17 y 1.06 en las otras tres) es util para disenar futuras competiciones y para interpretar correctamente puntuaciones macro-promediadas.
- Integracion en pipelines de quimioinformatica: al no requerir GPU ni infraestructura de inferencia neuronal, el enfoque es desplegable en CPU dentro de flujos de RDKit o similares para predecir lotes de compuestos de forma masiva.

## Benchmarks y rendimiento

El informe proporciona resultados de validacion cruzada con particion por esqueleto de Murcko, no de un conjunto de benchmark publico estandar.

| Metrica | Valor |
|---|---|
| MA-ST-RAE (validacion cruzada, scaffold split) | 0.7227 |
| Desviacion estandar bootstrap | 0.0102 |
| ST-RAE CYP1A2 | 0.801 |
| ST-RAE CYP2C9 | 0.676 |
| ST-RAE CYP2D6 | 0.916 |
| ST-RAE CYP3A4 | 0.496 |
| Linea base del tutorial de los organizadores | 0.8257 |
| Ratio de acierto dentro del intervalo, CYP3A4 (frente a predictor de media) | 2.47 |
| Ratio de acierto dentro del intervalo, CYP1A2 / CYP2C9 / CYP2D6 | 1.05 / 1.17 / 1.06 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni resultados del leaderboard final del reto.

## Requisitos de hardware

- Inferencia en CPU: LightGBM no requiere GPU; el modelo puede ejecutarse en cualquier maquina convencional.
- VRAM estimada: no aplica (no hay pesos neuronales ni cuantizacion).
- GPU recomendadas: no aplica; opcionalmente GPU para acelerar el entrenamiento de LightGBM, pero no es necesaria.
- Cabe en cualquier equipo consumer: si, sin requisitos especiales de memoria mas alla de la del propio conjunto de datos.
- Opciones de despliegue: el repositorio no incluye artefacto desplegable; el informe describe la metodologia para reimplementacion con LightGBM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. El repositorio es un informe de metodo de una participacion concreta en un reto ciego y no se han proporcionado datos de otros participantes ni de modelos ADMET comparables (por ejemplo, enfoques basados en GNN o en modelos preentrenados de quimica) con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio contiene un informe de metodo, no pesos ni codigo de inferencia; no es directamente utilizable como modelo.
- El propio autor califica la entrada como deliberadamente modesta: sin ensembling, sin representaciones preentrenadas y sin busqueda de arquitectura, con solo veinte configuraciones evaluadas.
- La puntuacion macro-promediada esta dominada por CYP3A4: el modelo solo supera claramente al predictor de media en esa isoforma (ratio 2.47), mientras que en las otras tres la mejora es marginal (1.05 a 1.17). El rendimiento real por isoforma es desigual (ST-RAE de 0.496 en CYP3A4 frente a 0.916 en CYP2D6).
- La amplitud de los intervalos de medicion varia mucho entre isoformas (cuartil superior de 1.668 log unidades en CYP3A4 frente a 0.358 en CYP2D6), lo que condiciona la interpretacion de la metrica.
- El modelo se entrena con datos publicos de ensayos CYP y puede heredar sesgos de seleccion de compuestos y de protocolos de ensayo de esas fuentes.
- Riesgo de extrapolacion fuera del espacio quimico cubierto por los 4.901 compuestos de entrenamiento y los 19.961 compuestos auxiliares; no se reportan analisis de dominio de aplicabilidad.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero al no haber pesos publicados la restriccion practica es sobre el texto del informe.
- No usar como sustituto de ensayos experimentales: las predicciones son orientativas y requieren validacion en laboratorio húmedo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/krho/openadmet-cyp-regression-method-report
- Informe companero de la pista de clasificacion (TDI): https://huggingface.co/krho/openadmet-cyp-tdi-method-report
- PubChem AID 1851: https://pubchem.ncbi.nlm.nih.gov/bioassay/1851
- ChEMBL: https://www.ebi.ac.uk/chembl/
- Blog de Octant (publicacion de datos CYP): no disponible la URL exacta en la informacion proporcionada
- OpenADMET CYP Inhibition Blind Challenge: no disponible la URL exacta en la informacion proporcionada
