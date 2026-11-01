# krho/openadmet-cyp-tdi-method-report

## Resumen

`krho/openadmet-cyp-tdi-method-report` no es un modelo de lenguaje ni una red neuronal entrenada, sino un **informe metodologico** publicado en HuggingFace que documenta la solucion presentada por KR LAB Bio al reto OpenADMET CYP Inhibition Blind Challenge, en la pista de clasificacion de inhibicion dependiente del tiempo (TDI) sobre las isoenzimas CYP3A4 y CYP2D6. El autor, krho, describe un sistema de ensembles de arboles de decision (tree ensembles) combinados mediante rank averaging, con un punto de operacion calibrado de forma independiente para cada isoforma.

El documento es relevante para la comunidad de descubrimiento de farmacos y ADMET porque detalla no solo la solucion ganadora en terminos de metricas (MA-MCC 0.3384 en el conjunto ciego), sino tambien un conjunto amplio de resultados negativos (18 direcciones de investigacion abandonadas) y una tecnica notable: la recuperacion de las matrices de confusion por isoforma a partir de las columnas agregadas del leaderboard publico, sin acceso a las etiquetas del test. Esto convierte al informe en un material de referencia sobre metodologia de competiciones cientificas y sobre los riesgos de sobreajustar al leaderboard.

No se trata, por tanto, de un artefacto ejecutable con pesos descargables, sino de documentacion tecnica. No hay arquitectura transformer, ni parametros, ni contexto, ni cuantizaciones: la ficha refleja esa naturaleza y marca como "no disponible" todo lo que no aplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos de arboles (tree ensembles) con rank averaging; no es una red neuronal |
| Parametros totales | no disponible (no aplica: no hay pesos de red neuronal) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (ingles, idioma del informe) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (el repositorio contiene un informe, no pesos) |
| Tarea | Clasificacion binaria de TDI para CYP3A4 y CYP2D6 |
| Metrica objetivo | MCC macro-promediado (MA-MCC) |
| Tamano del conjunto de test | 750 compuestos ciegos |
| Datos de entrenamiento | `cyp-challenge-TRAIN_TDI.csv` de los organizadores (3.583 compuestos CYP3A4, 1.494 CYP2D6) |
| Datos externos usados en la submission | ninguno |

## Arquitectura y entrenamiento

La solucion es un ensemble de peso igual construido por rank averaging de variantes de modelos de arboles que difieren en su representacion de fingerprints. Cada isoforma (CYP3A4 y CYP2D6) tiene su propio ensemble, su propia regla de combinacion y su propio punto de operacion. Los miembros del ensemble se diferencian en la representacion de entrada (bloques adicionales de fingerprints) y no en hiperparametros; se probaron entre cinco y once variantes sobre cuatro bloques adicionales de fingerprints. Individualmente, la mayoria de las variantes son peores que la linea base, pero su promedio por rangos mejora ligeramente el ordenamiento.

El punto de operacion se define como una tasa de llamada (call rate) seleccionada fuera del fold puntuado, lo que resulta critico para una metrica MCC sobre etiquetas desbalanceadas. El entrenamiento usa exclusivamente los datos publicados por los organizadores. Se prepararon datos auxiliares publicos (PubChem AID 1851, ChEMBL 37 ensayos CYP y el release del blog de Octant; 85.491 filas sobre 29.798 compuestos tras eliminar solapamientos con el test), que mejoraron los modelos de regresion pero no la clasificacion TDI en ninguna configuracion medida, por lo que no entraron en la submission final. No se usaron etiquetas del conjunto de test en ningun paso.

## Capacidades

- Prediccion binaria de inhibicion dependiente del tiempo (TDI) para CYP3A4 y CYP2D6.
- Modelado separado por isoforma, con seleccion de miembros y calibracion independientes.
- Ensemble por rank averaging sobre variantes de representacion de fingerprints.
- Calibracion del punto de operacion como tasa de llamada fuera del fold de evaluacion.
- Recuperacion de matrices de confusion por isoforma a partir de agregados del leaderboard, sin acceso a etiquetas.
- Analisis de mejora por estratos de similitud al vecino de entrenamiento mas cercano (nearest-training-neighbour).
- Documentacion exhaustiva de resultados negativos con la medicion que cerro cada direccion.
- No soporta generacion de texto, codigo, vision, tool calling ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- **Filtrado temprano en descubrimiento de farmacos**: el sistema predice riesgo de TDI sobre CYP3A4 y CYP2D6 para compuestos candidatos, permitiendo priorizar series quimicas antes de ensayos in vitro costosos. Es adecuado porque la TDI es un motivo frecuente de fallo en desarrollo y el modelo opera sobre fingerprints accesibles.
- **Priorizacion de hit expansion**: dado que el conjunto de test del reto se construyo con 75 series de 10 analogos, el enfoque es directamente aplicable a campanas de expansion de hits donde se evalua una familia de analogos cercanos a un hit confirmado.
- **Reproduccion metodologica en competiciones cientificas**: el informe sirve como plantilla para calibrar puntos de operacion en metricas desbalanceadas (MCC) y para recuperar informacion agregada del leaderboard sin fuga de etiquetas, aplicable a cualquier reto de clasificacion molecular.
- **Auditoria de sobreajuste al leaderboard**: la tecnica de descomponer la mejora por estratos de similitud permite a un equipo detectar si una ganancia aparente proviene de un estrato irrelevante (0,3% del test) y degrada el estrato dominante (72,3%), un control de calidad reutilizable en pipelines de modelado QSAR.
- **Evaluacion de datos auxiliares en ADMET**: el informe cuantifica que 85.491 filas de datos publicos no mejoraron la clasificacion TDI, lo que orienta a equipos que consideren incorporar ChEMBL o PubChem a sus propios modelos.
- **Documentacion de decisiones para revision regulatoria o interna**: el registro de 18 direcciones negativas con su medicion de cierre proporciona trazabilidad metodologica util en entornos donde se exige justificar por que no se uso una via de modelado.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MA-MCC en validacion cruzada | 0,3092 |
| CYP3A4 MCC (CV) | 0,4193 |
| CYP3A4 ROC-AUC (CV) | 0,8262 |
| CYP2D6 MCC (CV) | 0,1991 |
| CYP2D6 ROC-AUC (CV) | 0,6307 |
| MA-MCC en test ciego (punto de operacion CV) | 0,3212 |
| MA-MCC en test ciego (punto de operacion recalibrado) | 0,3384 |
| MA-MCC de modelo unico ajustado (referencia) | 0,2927 |
| Coste de subir la tasa de llamada de una isoforma | −0,0201 |
| Tasa de positivos recuperada, CYP3A4 (respecto a entrenamiento) | 1,46x |
| Tasa de positivos recuperada, CYP2D6 (respecto a entrenamiento) | 0,31x |

No se han publicado resultados comparativos frente a otros equipos del leaderboard en la informacion disponible.

## Requisitos de hardware

- No aplica en el sentido habitual: el artefacto publicado es un informe, no un modelo con pesos.
- La inferencia del ensemble de arboles descrito es de coste bajo y cabe en CPU; no requiere GPU.
- No se especifican en el informe requisitos de VRAM, GPU recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI).
- No se publican datos de latencia ni throughput.
- Para reproducir el pipeline seria necesario reimplementar el ensemble a partir de la descripcion metodologica, ya que no se distribuyen los artefactos entrenados.

## Comparativa con modelos similares

| Aspecto | Este informe (KR LAB Bio) | Modelos ADMET publicos tipicos (p. ej. ADMET-AI, DeepPK) | Modelos QSAR clasicos (Random Forest / XGBoost sobre fingerprints) |
|---|---|---|---|
| Naturaleza | Informe metodologico | Modelo con pesos publicados | Modelo con pesos publicados |
| Tarea | TDI CYP3A4/CYP2D6 | Multiples endpoints ADMET | Variable, a menudo un endpoint |
| Datos externos | Ninguno en la submission | Habitualmente ChEMBL/PubChem | Variable |
| MA-MCC reportado | 0,3384 (test ciego) | no disponible en esta informacion | no disponible en esta informacion |
| Licencia | CC-BY-4.0 | variable | variable |
| Reproducibilidad | Descripcion, sin artefactos | Pesos descargables | Pesos descargables |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada para establecer una comparacion numerica directa.

## Limitaciones y advertencias

- No es un modelo desplegable: no hay pesos, checkpoints ni pipeline ejecutable en el repositorio.
- El rendimiento en CYP2D6 es bajo (MCC 0,1991 en CV, ROC-AUC 0,6307), muy por debajo de CYP3A4; no debe tratarse como un predictor fiable para esa isoforma sin validacion adicional.
- El conjunto de test del reto no es diverso (75 series de 10 analogos), lo que infla el rendimiento respecto a un split por scaffolds; las cifras no son extrapolables a quimica novedosa.
- La recalibracion del punto de operacion se hizo usando agregados del leaderboard, lo que constituye una forma de adaptacion al conjunto de evaluacion y no garantiza transferencia a datos reales.
- El informe documenta que la mejora mas fuerte se concentra en un estrato que representa el 0,3% del test y degrada el estrato dominante (72,3%), lo que advierte contra interpretar la metrica global como mejora general.
- Riesgo de sobreajuste metodologico: el propio autor senala que varias mejoras en ROC-AUC no se tradujeron en MCC y que resultados con tres semillas desaparecieron con seis.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero al no haber artefactos, la restriccion practica es la de citar correctamente el informe.
- Idioma unico: el informe esta en ingles; no hay version en castellano.
- Sin validacion externa independiente: los resultados provienen del propio reto y de la propia evaluacion del autor.

## Enlaces

- HuggingFace: https://huggingface.co/krho/openadmet-cyp-tdi-method-report
- OpenADMET (organizacion del reto): no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
