# rorinfo/chennai-lst-unet

## Resumen

Chennai LST U-Net es un modelo de teledetección desarrollado por el usuario rorinfo (rorinfo/chennai-lst-unet) que predice el patrón espacial de la temperatura superficial terrestre (LST) sobre el área del Greater Chennai Corporation a 30 m de resolución. No es un modelo de lenguaje: es una U-Net convolucional de cuatro niveles con 2,02 M de parámetros, condicionada mediante FiLM por un vector meteorológico de 11 valores. Su entrada combina 21 canales espaciales (17 estáticos de forma urbana y topografía, más 4 dinámicos derivados de Landsat) con ese vector meteorológico, y su salida es un único canal con la anomalía de LST dentro de escena, en grados Celsius.

La decisión de diseño central es que el modelo no predice temperatura absoluta, sino cuánto más caliente o más frío está cada píxel respecto a la media de su propia escena. La mayor parte de la varianza de la LST absoluta es simplemente "qué calor hacía ese día", información que ya está en el vector meteorológico; eliminarla obliga a la red a explicar la estructura espacial, que es la señal de isla de calor urbana. Frente a la arquitectura de referencia de Delgado-Enales et al. (Urban Climate, 2025, Bilbao), que concatena el vector meteorológico en una capa densa tras aplanar el cuello de botella, la condicionante FiLM es 6,5 % más precisa con 2,6 veces menos parámetros, porque el recuento de parámetros deja de depender del tamaño del parche.

El modelo es relevante para planificación urbana y estudios de isla de calor porque permite ordenar barrios por exceso de calor, comparar tipos de cobertura del suelo a distancia equivalente de la costa y generar hipótesis sobre intervenciones perturbando las entradas. Sus limitaciones son explícitas y severas: solo cubre mañanas despejadas de marzo a junio, mide temperatura de superficie y no de aire, y sus capas estáticas están congeladas en 2018 y 2021 mientras la serie térmica llega a 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net convolucional de cuatro niveles con condicionamiento FiLM (feature-wise linear modulation) en el cuello de botella |
| Parámetros totales | 2,02 M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo espacial; entrada de 128×128 px a 30 m, más un vector meteorológico de 11 valores) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de teledetección); la model card está en inglés (tag `en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (el tamaño del repositorio figura como 0,0 GB y la model card no documenta ningún fichero de pesos) |

Canales de entrada, según la model card:

| Bloque | Contenido |
|---|---|
| Entrada espacial | 21 canales, 128×128 px a 30 m |
| Estáticos (17) | GHSL altura/superficie/volumen construidos; elevación, pendiente, aspecto (seno, coseno); distancia a la costa; 9 clases one-hot de ESA WorldCover |
| Dinámicos (4) | NDVI, NDBI, NDWI y FVC de la misma adquisición Landsat |
| Vector meteorológico | 11 valores: t2m, HR, u10, v10, radiación de onda corta, VPD y velocidad del viento (escalados por percentiles), seno/coseno del día del año, un término de año y una componente de flujo de mar a tierra |
| Salida | 1 canal, anomalía de LST dentro de escena en °C |

La componente onshore se calcula como `onshore = −0,966·u10 + 0,259·v10`, derivada de un rumbo normal a la costa de 285° para el litoral de Chennai (N15°E).

## Arquitectura y entrenamiento

La red es una U-Net de cuatro niveles. El vector meteorológico pasa por un MLP de 11 → 128 → 128 → 512 que produce parámetros de escala y desplazamiento por canal, aplicados en el cuello de botella como `x = x · (1 + γ) + β`. Como el condicionamiento actúa por canal y no por posición, el número de parámetros es independiente del tamaño del parche. La arquitectura de referencia emplea una capa densa que concentra el 79 % de sus parámetros y que crece con el área del parche: 4,2 M a 32 px, 67,2 M a 64 px y aproximadamente 1,07 mil millones a 128 px.

Los datos de entrenamiento son 66 escenas Landsat 8/9 Collection 2 Level-2, del 6 de marzo de 2016 al 6 de junio de 2026, restringidas a marzo–junio (pico premonzónico de Chennai), con cobertura nubosa inferior al 40 % y sobre la ventana 80,048–80,350 E, 12,830–13,240 N. La temperatura superficial procede de la recuperación de canal único de USGS (banda 10 de TIRS + emisividad ASTER GED + perfiles NCEP), no de un producto split-window. El enmascarado usa los bits 0–5 de `QA_PIXEL` (nube, sombra de nube, cirro, nube dilatada, nieve y relleno); enmascarar solo el bit de nube deja cirros finos que deprimen la temperatura recuperada varios grados y se absorberían en el campo de anomalía como un falso punto frío.

El entrenamiento empleó pérdida L1 enmascarada, AdamW, ReduceLROnPlateau, parada temprana con paciencia 12, tamaño de lote 16 y una única RTX 5060 Laptop GPU. La división de datos es espacialmente bloqueada y estratificada por distancia a la costa: entrenamiento, validación y test ocupan bloques disjuntos de 8 km, de modo que ningún píxel de test es vecino de un píxel de entrenamiento. La reproducibilidad está documentada: la configuración de 33 escenas, reentrenada desde cero, reprodujo de forma bit a bit (mejor pérdida de validación 1,3186 en ambos casos y MAE de test 1,3767924308776855 en ambos casos, coincidiendo época a época desde la primera).

## Capacidades

- Predicción del patrón espacial de anomalía de LST a 30 m sobre el área del Greater Chennai Corporation.
- Condicionamiento explícito por meteorología diaria, incluida una componente de brisa marina derivada del viento a 10 m.
- Generalización espacial: el modelo fue evaluado con bloques de test disjuntos de los de entrenamiento, sin vecindad entre píxeles de test y de entrenamiento.
- Análisis contrafactual por perturbación de entradas: modificar el vector meteorológico o las capas estáticas permite generar hipótesis sobre intervenciones.
- Comparación de tipos de cobertura del suelo (clases ESA WorldCover) a distancia equivalente de la costa.
- Inferencia ligera: 2,02 M de parámetros permiten ejecución en hardware muy modesto.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (es un modelo de regresión densa, no un modelo generativo).
- No tiene capacidades multilingües, de visión general, de audio ni modo de razonamiento explícito (thinking mode).
- No genera texto: su salida es un campo escalar de anomalía térmica.

## Casos de uso

- Planificación urbana y priorización de intervenciones: ordenar barrios y manzanas por anomalía de LST para dirigir medidas de mitigación (arbolado, cubiertas frías) hacia las zonas con mayor exceso de calor respecto a su entorno.
- Estudios de isla de calor urbana: cuantificar cuánto más calientes están las superficies construidas frente a vegetación o agua a distancia comparable de la costa, aprovechando la normalización dentro de escena que elimina el efecto "qué día hacía".
- Análisis contrafactual de escenarios: perturbar el vector meteorológico (por ejemplo, cambiar el VPD o la componente onshore) o las capas estáticas para explorar cómo cambiaría el patrón térmico, generando hipótesis y no predicciones operativas.
- Investigación en teledetección térmica: servir como referencia reproducible de bajo coste computacional para comparar arquitecturas de condicionamiento, dado que el autor publica una comparación controlada con división idéntica de datos.
- Evaluación de equidad ambiental: cruzar el mapa de anomalías con datos de población o vulnerabilidad para identificar zonas con exposición térmica diferencial dentro de la ciudad.
- Docencia y prototipado: con 2,02 M de parámetros y entrenamiento en una GPU de portátil, es viable como caso práctico de regresión espacial condicionada en cursos de aprendizaje profundo aplicado a ciencias de la Tierra.
- Validación de metodologías de enmascarado: el modelo documenta explícitamente el impacto de enmascarar solo el bit de nube frente a los bits 0–5, útil como referencia metodológica.

## Benchmarks y rendimiento

Mejor modelo (FiLM, parches de 128 px, 66 escenas), sobre 2 112 patch-scenes y 27 938 332 píxeles de test:

| Métrica | Valor |
|---|---|
| MAE | 1,3088 °C |
| RMSE | 1,7744 |
| Correlación de Pearson (r) | 0,932 |
| MAE de climatología por píxel | 1,7409 |
| MAE de ridge | 2,1826 |
| MAE de la media de escena | 3,6642 |
| Skill frente a climatología | +0,248 |

Comparación controlada de arquitecturas, con división idéntica (3343/795/735 parches; ambas ejecuciones reportan MAE de `pixel_climatology` 1,6000292301177979 y de `ridge` 2,0171847343444824 hasta el último dígito impreso):

| Métrica | Este modelo (FiLM) | Arquitectura de referencia |
|---|---|---|
| Parámetros | 2,02 M | 5,33 M |
| MAE de test | 1,3456 | 1,4388 |
| Skill frente a climatología | +0,159 | +0,101 |
| Mejor época | 16 | 3 |
| Brecha entrenamiento/validación en la mejor época | 0,047 | 0,130 |

Ambas arquitecturas alcanzan una pérdida de entrenamiento prácticamente idéntica (~1,05); la diferencia es enteramente de generalización. La pérdida de validación de la arquitectura de referencia deja de mejorar en la época 3 mientras la de entrenamiento sigue bajando, coherente con una capa densa que concentra el 79 % de los parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 (el modelo tiene 2,02 M de parámetros, aproximadamente 8 MB de pesos; la mayor parte del consumo proviene de las activaciones de una entrada de 128×128×21). Estimación derivada del recuento de parámetros, no publicada por el autor.
- GPU recomendadas: cualquiera con soporte CUDA; el autor entrenó con una única RTX 5060 Laptop GPU, por lo que el entrenamiento es viable en gama media de portátil.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPU integradas. También es viable la inferencia en CPU.
- Opciones de despliegue: no documentadas en la model card. No se especifica compatibilidad con vLLM, llama.cpp, Ollama ni TGI (ninguna de ellas aplica a un modelo de regresión convolucional); el framework de entrenamiento declarado es PyTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | MAE de test | Skill vs climatología | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Chennai LST U-Net (este modelo) | 2,02 M | Anomalía de LST en Chennai a 30 m | 1,3456 (comparación controlada); 1,3088 (mejor modelo, 128 px) | +0,159 (controlada); +0,248 (mejor modelo) | CC-BY-4.0 | HuggingFace |
| Arquitectura de referencia (Delgado-Enales et al., Urban Climate 2025, Bilbao) | 5,33 M | Anomalía de LST (Bilbao) | 1,4388 | +0,101 | no disponible | Publicación; implementación no disponible en la información proporcionada |
| Otros modelos comparables de LST urbana | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con la arquitectura de referencia se realizó sobre una división de datos idéntica, por lo que los MAE son directamente comparables.

## Limitaciones y advertencias

- Superficie, no aire: la LST es la temperatura de tejados, carreteras y suelo desnudo. Las diferencias de temperatura del aire entre lugares son aproximadamente 2–4 veces menores, de modo que un delta de LST nunca equivale a un beneficio de refrigeración entregado.
- Una sola pasada, hacia las 10:30 hora local: el modelo no describe el pico de la tarde ni la noche, y la noche es cuando el calor causa más daño sanitario.
- Cobertura estacional y de nubosidad restringida: solo marzo–junio y cielos despejados, porque las nubes bloquean la imagen térmica. El registro está sesgado hacia mañanas premonzónicas claras.
- Entradas estáticas congeladas en el tiempo: GHSL es de la época 2018 y ESA WorldCover de 2021, mientras el registro térmico llega a 2026, con una brecha de hasta 8 años sesgada contra las escenas más recientes en los barrios de crecimiento más rápido.
- El conjunto de test son solo 3 bloques espaciales.
- Riesgo de error en zonas con cirros finos mal enmascarados si se reproduce la metodología con un enmascarado incompleto.
- No es un modelo de nowcast ni un termómetro: según el propio autor, no debe usarse para predicción operativa ni como medición de temperatura.
- No se documentan sesgos demográficos ni de equidad del propio modelo; cualquier uso en ese sentido exige un análisis externo.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no se documenta ningún fichero de pesos en el repositorio (tamaño 0,0 GB), por lo que la disponibilidad efectiva de pesos para producción no está confirmada.
- No se documentan cuantizaciones, formatos de exportación ni requisitos de despliegue, lo que dificulta su integración directa en pipelines de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rorinfo/chennai-lst-unet
- Referencia metodológica citada en la model card: Delgado-Enales et al., "Urban Climate" 2025 (implementación de referencia para Bilbao) — sin URL disponible en la información proporcionada.
- La búsqueda web realizada no devolvió ningún enlace relevante al modelo (los resultados obtenidos no guardan relación con el contenido solicitado y se descartan).
