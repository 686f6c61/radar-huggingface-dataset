# buildingpeps/hbi-cyp-challenge-v2

## Resumen

`buildingpeps/hbi-cyp-challenge-v2` no es un modelo entrenado ni un paquete de pesos, sino un registro público de metodos (prerregistro) para el reto ciego de inhibicion de CYP de OpenADMET 2026. El propio autor declara que, en el momento de la publicacion inicial, no se ha ajustado ningun modelo V2, no se ha enviado ningun fichero de predicciones y no se ha utilizado ningun resultado del leaderboard ni del conjunto de test oculto. Lo que se publica es el protocolo congelado antes de ver resultados, junto con hashes de integridad, para dejar constancia externa de las decisiones metodologicas.

El objeto del reto son seis endpoints de quimica farmaceutica: cuatro regresiones de inhibicion directa (CYP1A2, CYP2C9, CYP2D6 y CYP3A4, sobre pIC50 estimado por el organizador) y dos clasificaciones de inhibicion dependiente del tiempo (TDI) para CYP2D6 y CYP3A4. Los datos de partida son publicos y estan anclados a una revision fija del conjunto de OpenADMET: 4.905 compuestos en el fichero de entrenamiento directo, 6.145 en el de TDI y 750 compuestos ciegos de los que solo se conocen identificadores y estructuras.

La relevancia es acotada pero clara: se trata de un artefacto de reproducibilidad y prerregistro, util para quien quiera replicar o auditar el flujo completo de un ejercicio QSAR, y no de un componente listo para produccion. El menu de modelos es deliberadamente sencillo y clasico (modelos lineales con regularizacion y Extra Trees sobre descriptores fisicoquimicos y huellas Morgan), lo que lo aleja de la categoria de los modelos de lenguaje o de redes neuronales de gran tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Menu fijo de recetas de aprendizaje automatico clasico: control constante (media de entrenamiento), modelo lineal fisicoquimico (Ridge alpha 10 en regresion / regresion logistica C=1 en clasificacion), modelo lineal Morgan (Ridge alpha 10 / regresion logistica C=1, sin escalado de variables) y Extra Trees (256 arboles) |
| Parametros totales | no disponible (no se publican pesos ni un modelo ajustado; el repositorio contiene la prerregistracion) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). Representacion de entrada: 12 descriptores fisicoquimicos estandarizados y huellas Morgan quirales de 2.048 bits, radio 2 |
| Tipos de cuantizacion | no disponible (no aplica; no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje natural) |
| Licencia | no disponible. La model card no declara licencia para este registro; el texto indica que no se relicencia material de origen. Las fuentes citadas declaran Apache-2.0 (card de Hugging Face del dataset) y CC BY 4.0 (anuncio del publicador), pero ninguna de esas licencias se aplica explicitamente a este repositorio de metodos |
| Formato de pesos | no disponible. No se publican pesos. El repositorio incluye `protocol.json` (receta normativa) e `implementation_hashes.json` (hashes de implementacion sin rutas locales) |

Detalles de integridad declarados: instante de congelacion local 2026-09-20T00:52:37.617225+00:00, SHA256 del manifiesto de integridad `2b0207399ebf8882f55fc87053532692e9c09fd4cc1ad1c5809cb774115e46a1` y SHA256 del protocolo normativo `932f5764035069360320669b53e567aa4cbff7ff729ed58aa0dac9cd7f3a2b14`. Los 99 artefactos del libro de preservacion de la V1 se verificaron sin cambios.

## Arquitectura y entrenamiento

El flujo parte de una estandarizacion de estructura parental congelada que genera 12 descriptores fisicoquimicos y huellas Morgan quirales de 2.048 bits con radio 2. Las estructuras de entrenamiento no soportadas se excluyen y se documentan; si aparece una estructura ciega no soportada, se detiene el flujo completo y no se inventa una prediccion. Antes de construir las particiones se eliminan todas las estructuras de entrenamiento que comparten identidad canonica no estereoquimica de tautomeros con alguna estructura ciega; los analogos relacionados si se permiten, por diseno del reto.

La particion agrupa por identidad de parent y de estereo/tautomero, por esqueleto de Murcko con tipado de atomos para compuestos ciclicos, y por componentes conexas enlazadas con similitud de Tanimoto de Morgan no quiral de radio 2 mayor o igual a 0,70. Los componentes intactos se asignan de forma determinista al 60 % entrenamiento, 15 % calibracion, 15 % seleccion de politica y 10 % test de desarrollo, con semilla 425. No se rebarajan ni se relajan los agrupamientos tras examinar los resultados. La regresion directa exige estimaciones puntuales finitas con cotas de confianza finitas que las envuelvan; la TDI exige la llamada booleana oficial sin valores ausentes y descarta llamadas en conflicto dentro de un mismo parent. Cada particion por endpoint necesita al menos 10 registros y las de clasificacion deben contener ambas clases, o el proceso se detiene y preserva el fallo.

Para cada endpoint se comparan un control constante y tres recetas aprendidas: modelo lineal fisicoquimico, modelo lineal Morgan y Extra Trees. Los Extra Trees usan 256 arboles, tamano minimo de hoja 2, fraccion maxima de variables 0,5 y semilla 425. Los clasificadores logisticos permiten 3.000 iteraciones y reciben calibracion sigmoide mediante regresion logistica C=1 ajustada solo en la particion de calibracion; el autor aclara que se trata de calibracion de ensayo y no de una probabilidad de toxicidad clinica. La particion de politica escoge el menor RAE de umbral suave en regresion y el mayor coeficiente de correlacion de Matthews (MCC) en clasificacion, con umbrales TDI restringidos al rango 0,10 a 0,90 en incrementos de 0,05. Los empates de umbral prefieren el valor mas cercano a 0,50 y despues el mayor; los empates entre recetas siguen el orden fijo listado. El control constante se reporta pero no puede convertirse en modelo enviado, y la seleccion se guarda antes de calcular los diagnosticos de test de desarrollo.

## Capacidades

- Prediccion de inhibicion directa de cuatro isoenzimas del citocromo P450 (CYP1A2, CYP2C9, CYP2D6 y CYP3A4) como regresion sobre la estimacion de pIC50 del organizador.
- Clasificacion booleana de inhibicion dependiente del tiempo (TDI) para CYP2D6 y CYP3A4, usando las etiquetas oficiales del organizador, incluidas las inferidas como positivas y las asignadas como negativas.
- Representacion quimica combinada: 12 descriptores fisicoquimicos mas huellas Morgan quirales de 2.048 bits y radio 2.
- Calibracion sigmoide de clasificadores mediante regresion logistica ajustada exclusivamente en la particion de calibracion (calibracion de ensayo, no clinica).
- Seleccion de umbral TDI guiada por MCC dentro del rango 0,10 a 0,90 en pasos de 0,05.
- Gestion explicita de fallos: una estructura no soportada detiene el flujo de la entrada completa en lugar de forzar una prediccion.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multimodales ni capacidades multilingues: no es un modelo de lenguaje ni un sistema generativo de proposito general.

## Casos de uso

- Priorizacion de compuestos en cribado temprano: el modelo predice pIC50 para cuatro isoenzimas CYP sobre moleculas representadas con descriptores y huellas, lo que permite ordenar quimiotecas antes de ensayos enzimaticos costosos.
- Evaluacion de riesgo de interacciones farmacologicas (DDI): una prediccion alta de inhibicion para CYP3A4 o CYP2D6 sirve como senal temprana en el perfilado de candidatos, siempre con la advertencia de que es calibracion de ensayo y no una probabilidad clinica.
- Filtrado de quimiotecas antes de sintesis: aplicar las recetas lineales sobre descriptores es barato en computo y permite descartar compuestos con perfil CYP desfavorable antes de invertir en sintesis.
- Seleccion de candidatos con menor riesgo de TDI: la clasificacion dedicada a inhibicion dependiente del tiempo permite separar candidatos con llamada booleana negativa estable de aquellos con senal positiva.
- Construccion de lineas base QSAR internas: las tres recetas congeladas (Ridge/regresion logistica sobre fisicoquimicos, idem sobre Morgan y Extra Trees) constituyen un punto de partida reproducible para comparar metodos propios con un protocolo ya documentado.
- Replicacion y auditoria metodologica: dado que hay hashes de integridad, particiones deterministas con semilla 425 y un protocolo JSON normativo, un equipo puede reproducir el flujo completo y verificar que su implementacion coincide con la registrada.
- Analisis de expansion de analogos: el conjunto ciego fue seleccionado por similitud con los hits de entrenamiento, de modo que los resultados miden expansion de analogos dentro del mismo programa de ensayo, un escenario relevante para quimica medicinal.
- Docencia y ejercicios de validacion rigurosa: el diseño de agrupamiento por esqueleto y componentes conexas con umbral de Tanimoto 0,70 sirve como ejemplo practico de particionado sin fuga de informacion estructural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor declara que en la publicacion inicial no se ha ajustado ningun modelo V2, no se ha enviado prediccion alguna y no se ha utilizado ningun resultado del leaderboard ni del conjunto de test oculto.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. No se requieren aceleradores graficos; se trata de modelos lineales y de bosques de arboles sobre vectores de 12 descriptores y 2.048 bits.
- GPU recomendadas: ninguna. El flujo es viable en CPU convencional.
- Compatibilidad con GPU de consumo: no aplica, ya que no hay modelo neuronal ni pesos publicados.
- Opciones de despliegue: no hay pesos que desplegar. La implementacion declarada se apoya en librerias clasicas de Python (Ridge, regresion logistica con C=1 y 3.000 iteraciones, Extra Trees con 256 arboles, min_samples_leaf 2 y max_features 0,5), por lo que el entorno natural es un stack de ciencia de datos en Python en lugar de servidores de inferencia como vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles. Cabe esperar costes muy bajos por prediccion dado el tamano de los datos (4.905 compuestos directos y 6.145 de TDI en entrenamiento, 750 compuestos ciegos), pero el autor no publica mediciones.
- Almacenamiento: no disponible en cifras; el repositorio es un registro de metodos con ficheros JSON, no un paquete de pesos.

## Comparativa con modelos similares

No disponible. No hay pesos publicados ni resultados de rendimiento, de modo que no es posible comparar cuantitativamente este registro con modelos ADMET entrenados de terceros. Como unica referencia interna, el preregistro define un menu cerrado de recetas mutuamente comparables:

| Receta del menu | Tipo | Configuracion | Papel en la seleccion |
|---|---|---|---|
| Control constante | Baseline | Media de entrenamiento | Se reporta; nunca puede ser el modelo enviado |
| Modelo lineal fisicoquimico | Lineal regularizado | Descriptores estandarizados; Ridge alpha 10 o regresion logistica C=1 | Candidata a seleccion por RAE (regresion) o MCC (clasificacion) |
| Modelo lineal Morgan | Lineal regularizado | Ridge alpha 10 o regresion logistica C=1, sin escalado | Candidata a seleccion |
| Extra Trees | Ensemble de arboles | 256 arboles, hoja minima 2, fraccion maxima de variables 0,5, semilla 425 | Candidata a seleccion |

Las alternativas externas de la misma categoria (por ejemplo, otros enfoques del propio reto OpenADMET o implementaciones QSAR publicas) no se detallan en la informacion disponible y sus resultados no se pueden contrastar aqui.

## Limitaciones y advertencias

- No es un modelo liberado: es un preregistro. No hay pesos, no hay artefacto ajustado y no hay predicciones enviadas en el momento de la publicacion inicial.
- Ausencia de validacion oculta: no se ha utilizado ningun resultado del leaderboard ni del test oculto, por lo que no existe evidencia publica de rendimiento.
- El conjunto ciego fue seleccionado por similitud con los hits de entrenamiento, de modo que los resultados miden expansion de analogos dentro del mismo programa de ensayo y no validacion independiente de laboratorio, con andamiajes no relacionados, clinica o de cliente.
- El envio de predicciones no da acceso a las etiquetas retenidas, lo que limita la interpretacion externa de cualquier resultado futuro.
- Ambiguedad de licencia: la model card no declara licencia para este registro y afirma que no se relicencia material de origen; las fuentes citadas mencionan Apache-2.0 y CC BY 4.0, sin que quede claro cual se aplica al repositorio. Conviene aclararlo antes de cualquier uso comercial.
- Las probabilidades calibradas son calibracion de ensayo, no probabilidad de toxicidad clinica; no deben usarse para decisiones clinicas.
- Riesgo de aplicabilidad fuera del dominio quimico: el modelo esta atado a estructuras soportadas por la estandarizacion parental congelada; una estructura no soportada detiene el flujo en lugar de generar una prediccion.
- Sensibilidad al particionado: la seleccion de receta y umbral depende de las particiones deterministas con semilla 425 y del agrupamiento por componentes con Tanimoto mayor o igual a 0,70; un rebarajado distinto invalida la comparabilidad.
- Endpoints acotados: solo cuatro isoenzimas en regresion directa y dos en TDI, con las etiquetas oficiales del organizador, que son un objetivo distinto del analisis TDI mas estricto por brazos emparejados de la V1.
- Los artefactos de la V1 preservados se consideran material de desarrollo y nunca un conjunto de validacion fresco, por lo que no sirven para reclamar validacion adicional.
- Sin idiomas ni soporte conversacional: cualquier expectativa de uso como asistente, agente o herramienta de razonamiento multi-paso queda fuera del alcance de este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/buildingpeps/hbi-cyp-challenge-v2
- Conjunto de datos del reto CYP de OpenADMET: https://huggingface.co/datasets/openadmet/cyp-challenge-train-test
- Espacio del reto ciego de OpenADMET: https://huggingface.co/spaces/openadmet/cyp-challenge
- Tutorial oficial del reto CYP: https://github.com/OpenADMET/CYP-Challenge-Tutorial
- README del tutorial: https://github.com/OpenADMET/CYP-Challenge-Tutorial/blob/main/README.md
