# Koitsu/mado-digital-openadmet-cyp-2026

## Resumen

Mado Digital OpenADMET CYP 2026 es un método de predicción de inhibición de isoenzimas del citocromo P450 (CYP1A2, CYP2C9, CYP2D6 y CYP3A4) presentado por el equipo Mado Digital al reto ciego OpenADMET de inhibición de CYP, con fecha de entrega el 31 de octubre de 2026. No se trata de un modelo de lenguaje ni de una red neuronal generativa: es un pipeline de quimioinformática que combina aprendizaje automático clásico sobre descriptores moleculares con una red neuronal de paso de mensajes dirigidos (estilo Chemprop), y se publica como repositorio de HuggingFace con la etiqueta `benchmark`.

El artefacto aborda dos tareas del reto: regresión directa de inhibición (predicción de pIC50 para las cuatro isoenzimas) y clasificación de inhibición dependiente del tiempo (TDI), evaluada en CYP3A4 y CYP2D6 mediante un umbral de desplazamiento de IC50 superior a dos veces tras preincubación. El interés técnico reside en la transparencia metodológica: el informe documenta el esquema de validación por pliegues de scaffolds de Bemis-Murcko, el blending por endpoint, la selección de hiperparámetros y, de forma poco habitual, el sesgo optimista de sus propias cifras out-of-fold.

La relevancia actual es doble. Por un lado, ofrece una línea base reproducible para quien trabaje en predicción ADMET con datos públicos (conjunto de entrenamiento del reto más registros de ChEMBL). Por otro, su model card es un ejemplo de honestidad estadística: cuantifica la brecha entre el rendimiento reportado y el esperable en test, y compara el techo alcanzable por cualquier modelo con la fiabilidad test-retest de las propias etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos brazos: LightGBM 4.7.0 sobre fingerprints Morgan (radio 2, 2048 bits) y descriptores RDKit, y red neuronal de paso de mensajes dirigidos sobre enlaces (estilo Chemprop, profundidad 3, oculta 300) con tronco compartido y cuatro cabezas pIC50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo molecular, no de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (el repositorio se publica como benchmark e informe de método) |

## Arquitectura y entrenamiento

El brazo 1 es un gradient boosting LightGBM con una única configuración para los cuatro endpoints: 800 estimadores, tasa de aprendizaje 0,03, `colsample` 0,35, `subsample` 0,85, `reg_lambda` 1,0 y número de hojas `min(48, max(8, n_fit // 25))`. La entrada combina fingerprints Morgan de radio 2 y 2048 bits con descriptores RDKit. El brazo 2 es una red de paso de mensajes dirigidos sobre enlaces con profundidad 3 y dimensión oculta 300, que concatena 19 descriptores RDKit en un tronco compartido con cuatro cabezas de pIC50; usa dropout 0,1, tamaño de lote 64, un ciclo de tasa de aprendizaje de 1e-4 a 1e-3 y vuelta a 1e-4 durante un máximo de 120 épocas con paciencia 25, recorte de gradiente en 5,0 y entrenamiento multitarea en los cuatro endpoints. Se emplearon objetivos auxiliares con peso 0,3 (pIC50 de TDI, Emax, respuesta a concentración única y el booleano de TDI) como supervisión multitarea, sin lectura en tiempo de predicción.

Los datos provienen exclusivamente de fuentes públicas: el conjunto de entrenamiento liberado por el reto y registros públicos de ChEMBL, con una unión de 6.146 moléculas. La partición es por pliegues de scaffolds de Bemis-Murcko (cinco pliegues, familias de scaffolds intactas), con digesto de split compartido `01029922db48c7fe` entre ambos brazos; la época de parada de la red se eligió en un bucket interno de scaffolds extraído solo de los pliegues de entrenamiento. Todo elemento propenso a fuga se ajustó dentro de los pliegues: escalador de descriptores, normalizador de pérdida por endpoint, inicialización del sesgo de las cabezas, rango de recorte de predicciones y escalador de objetivos auxiliares. El blending aplica un peso convexo por endpoint al brazo de gradient boosting, ajustado solo sobre predicciones out-of-fold externas: 0,46 para CYP1A2, 0,37 para CYP2C9, 0,33 para CYP2D6 y 0,46 para CYP3A4.

## Capacidades

- Predicción de pIC50 de inhibición directa para CYP1A2, CYP2C9, CYP2D6 y CYP3A4 a partir de la estructura molecular.
- Clasificación de inhibición dependiente del tiempo (TDI) para CYP3A4 y CYP2D6, con umbral fijado por maximización de MCC sobre puntuaciones out-of-fold.
- Representación molecular mediante fingerprints Morgan y descriptores RDKit, más aprendizaje de grafos moleculares con paso de mensajes dirigido.
- Aprendizaje multitarea con objetivos auxiliares (Emax, respuesta a concentración única, booleano TDI) como supervisión adicional.
- Validación por scaffolds de Bemis-Murcko con digesto de split reproducible.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Filtrado temprano en descubrimiento de fármacos: estimar la probabilidad de inhibición de las cuatro isoenzimas CYP mayoritarias para una serie de compuestos candidatos antes de sintetizarlos, usando el pipeline sobre SMILES y descartando los que superen umbrales de pIC50.
- Priorización de ensayos in vitro: ordenar una biblioteca química por riesgo de interacción metabólica y reservar los ensayos de CYP reales para el subconjunto con mayor puntuación predicha.
- Evaluación de riesgo de TDI en desarrollo preclínico: clasificar compuestos según el desplazamiento de IC50 tras preincubación en CYP3A4 y CYP2D6, con umbrales derivados de forma reproducible y MCC documentado por endpoint.
- Reproducción de una línea base ADMET: el informe especifica hiperparámetros, split y digesto, lo que permite reentrenar el ensemble como referencia contra la que comparar modelos propios.
- Investigación metodológica en validación quimioinformática: el documento sirve como caso de estudio sobre selección de hiperparámetros, sesgo optimista out-of-fold y comparación con el techo impuesto por la fiabilidad test-retest de las etiquetas.
- Detección de interacciones fármaco-fármaco en etapas tempranas: usar las predicciones de inhibición de CYP3A4 y CYP2D6 como señal de alarma para compuestos destinados a administración conjunta con sustratos de esas enzimas.
- Enseñanza y formación en ADMET computacional: el material documenta de forma explícita el diseño de validación, el blending y las limitaciones estadísticas, útil para cursos de quimioinformática aplicada.

## Benchmarks y rendimiento

Resultados out-of-fold con la métrica ST-RAE (menor es mejor; un predictor que devuelve la media de entrenamiento obtiene exactamente 1,0):

| Endpoint | n | Blend | GNN | GBM |
|---|---|---|---|---|
| CYP1A2 | 1412 | 0,76806 | 0,79842 | 0,79807 |
| CYP2C9 | 1285 | 0,61140 | 0,63996 | 0,67746 |
| CYP2D6 | 1493 | 0,86874 | 0,88386 | 0,92301 |
| CYP3A4 | 2335 | 0,47782 | 0,50646 | 0,51750 |
| Macro | | 0,6815 | 0,70717 | 0,72901 |

El blend supera al mejor brazo individual en todos los endpoints. Frente a la GNN, la mejora macro es de 0,02562 con desviación estándar de 0,00307 entre pliegues y tasa de victoria de 1,0. El 0,6815 macro equivale aproximadamente a un 32 % mejor que predecir la media.

El propio informe advierte de que la cifra del brazo GBM es optimista: la configuración se eligió sobre las mismas predicciones out-of-fold en las que se puntúa, tras buscar entre doce configuraciones; el rango del grid va de 0,72901 a 0,78198 (amplitud 0,05297) y la configuración elegida supera a la segunda por solo 0,01033. Los pesos del blend también se ajustaron sobre predicciones out-of-fold, por lo que el 0,6815 hereda la misma cautela. No se seleccionó nada sobre el conjunto de test.

Clasificación TDI:

| Métrica | CYP2D6 | CYP3A4 |
|---|---|---|
| Umbral (argmax MCC out-of-fold) | -0,5028 | -1,8252 |
| MCC out-of-fold en ese umbral | 0,1409 | 0,3944 |
| Mediana bootstrap de MCC (1000 remuestreos) | 0,1388 | 0,3923 |
| Intervalo del 95 % | 0,0718 a 0,1409 | 0,3672 a 0,3944 |
| Tasa de positivos out-of-fold | 0,1583 | 0,4852 |
| Tasa de positivos en test | 0,0973 | 0,5560 |

El informe compara además el MCC test-retest de las etiquetas liberadas (0,577 para CYP2D6 y 0,518 para CYP3A4), que actúa como cota inferior para un modelo que prediga la expectativa del ensayo, frente al MCC oracle, cota superior de cualquier modelo. La información disponible se interrumpe en ese punto y no incluye los valores del oracle.

## Requisitos de hardware

- No aplica VRAM en el sentido de inferencia de un modelo de lenguaje: el artefacto es un pipeline de quimioinformática sobre moléculas pequeñas.
- El brazo LightGBM con 800 estimadores y fingerprints de 2048 bits se ejecuta en CPU sin requisitos relevantes de memoria.
- El brazo GNN (profundidad 3, oculta 300, lotes de 64) es entrenable en una GPU de consumo; una RTX 4090 o RTX 3090 es suficiente, y también una GPU de 8-12 GB para inferencia.
- Despliegue: el pipeline se integra en Python con RDKit, LightGBM 4.7.0 y el framework de la red de paso de mensajes; no se documentan opciones de servido tipo vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Endpoints | Métrica reportada | Licencia |
|---|---|---|---|---|
| Mado Digital OpenADMET CYP 2026 | Ensemble GBM + GNN | CYP1A2, CYP2C9, CYP2D6, CYP3A4, TDI CYP2D6/CYP3A4 | ST-RAE macro 0,6815; MCC 0,1409 / 0,3944 | CC-BY-4.0 |
| Brazo GNN del mismo trabajo | MPNN dirigido | Los cuatro CYP | ST-RAE macro 0,70717 | CC-BY-4.0 |
| Brazo GBM del mismo trabajo | LightGBM | Los cuatro CYP | ST-RAE macro 0,72901 | CC-BY-4.0 |
| Alternativas externas de predicción CYP | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de otros equipos del reto ni de modelos públicos comparables con métricas sobre el mismo conjunto.

## Limitaciones y advertencias

- Las cifras out-of-fold del brazo GBM y del blend son cotas superiores optimistas: la configuración se seleccionó sobre las mismas predicciones con las que se evalúa, con una diferencia de solo 0,01033 frente a la segunda mejor sobre una amplitud de grid de 0,05297.
- El MCC de TDI en CYP2D6 es bajo (0,1409), con intervalo bootstrap de 0,0718 a 0,1409; la señal es débil y el uso práctico de esa predicción debe ser muy cauteloso.
- El umbral de TDI se fija por maximización de MCC, lo que favorece el recall y produce tasas de positivos por encima de la prevalencia en CYP3A4 (0,5560 en test frente a 0,4852 out-of-fold); no es una calibración al conjunto de test.
- Existe una diferencia residual medida y no corregida entre puntuaciones out-of-fold (un solo modelo) y de test (media de cinco modelos), que comprime ligeramente la dispersión de las segundas.
- El entrenamiento usa solo datos públicos (conjunto del reto y ChEMBL); el dominio de aplicabilidad queda restringido al espacio químico cubierto por esas fuentes.
- No se ha publicado ningún estadístico del conjunto ciego de 750 moléculas, por lo que el rendimiento real en test es desconocido.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el artefacto es un informe de método y un benchmark, no un predictor listo para producción con pesos empaquetados y API estable.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso.

## Enlaces

- HuggingFace: https://huggingface.co/Koitsu/mado-digital-openadmet-cyp-2026
- OpenADMET: no disponible en la información proporcionada
- ChEMBL: no disponible en la información proporcionada
- LightGBM 4.7.0: no disponible en la información proporcionada
- Chemprop (referencia de arquitectura MPNN): no disponible en la información proporcionada
- RDKit: no disponible en la información proporcionada
- Paper o blog del método: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
