# Azatyt/sreda-ml

## Resumen

Sreda ML 0.6.1 es un modelo neuronal sustituto (*surrogate*) del solver de lattice Boltzmann D3Q27 con colisión cumulante y LES (large eddy simulation) desarrollado por Sreda. Predice la velocidad media del viento a 1,75 m sobre el suelo (nivel peatonal) a partir de la huella y la altura de los edificios, en una ventana de 150 × 150 m. Lo publica el usuario Azatyt en Hugging Face bajo licencia Apache 2.0, en formato ONNX y con un tamano de repositorio de 0,1 GB.

El modelo resuelve un problema de coste computacional: donde el solver tarda de decenas de minutos a varias horas en una GPU de sobremesa, la red responde en 1-2 segundos por ventana en la CPU de un portátil. Se distribuye como un *ensemble* de tres U-Nets (semillas 0, 1 y 2) con 18,1 M de parámetros en total, opset 17 de ONNX, y una arquitectura image-to-image que mapea rasters de edificios (máscara, altura normalizada y distancia firmada a la pared) a un campo de coeficiente de velocidad K.

La versión 0.6.1 está marcada explícitamente como *preview*: no superó su propio test de aceptación definido antes del entrenamiento. El autor advierte que sirve para estudios tempranos de diseño y comparación de opciones, pero no para aprobar un diseño ni certificar confort de viento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 U-Nets (image-to-image), surrogate de solver lattice Boltzmann D3Q27 con colisión cumulante y LES |
| Parametros totales | 18,1 M (ensemble de 3 redes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo espacial, no de lenguaje). Ventana de 150 × 150 m con frame de 216 m en flujo × 264 m en dirección del viento |
| Tipos de cuantizacion | No disponible (distribución en ONNX float32) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), 72,8 MB |

## Arquitectura y entrenamiento

El modelo es un *ensemble* de tres U-Nets (semillas 0, 1 y 2) que operan como red image-to-image sobre rasters en ejes de viento. La entrada consta de dos tensores: `frames` (float32 [2, 3, 288, 352]), con canales de máscara de edificio, altura del edificio / 30 m y distancia firmada a la pared más cercana / 10 m recortada a [−2, 5]; y `ctx` (float32 [2, 3, 100, 88]), que describe el entorno en una rejilla de 6 m con fracción construida, altura media y altura máxima. La salida es `k_ped` (float32 [2, 288, 352]) con el coeficiente K, válido solo en la ventana central de 150 × 150 m (filas 44 a 243, columnas 128 a 327). El lote incluye el frame y su espejo (filas invertidas), y la predicción final es la media de la primera salida y la segunda con las filas revertidas.

El entrenamiento se realizó sobre 826 escenas etiquetadas por el solver Sreda: 312 arrays sintéticos de edificios generados por Sreda, 110 ciudades japonesas de los modelos 3D de Project PLATEAU, 300 ciudades de Rusia y Bielorrusia con edificios de OpenStreetMap (alturas = niveles OSM × 3 m, con al menos 98 % de área construida con altura conocida) y 104 ciudades europeas (Berlín, Ámsterdam, Róterdam y París) con datos LoD2 y BD TOPO. Las etiquetas se obtuvieron con suelo plano, rejilla base de 6 m con refinamiento local a 0,75 m cerca de edificios y a nivel peatonal, perfil de entrada logarítmico turbulento (z0 = 0,5 m, 5 m/s a 10 m) y velocidad media promediada en el tiempo simulado. Parte de las etiquetas se calcularon con un port CUDA del mismo solver, calibrado contra la versión WebGPU antes de usarse. No se menciona RLHF/DPO ni decodificación especulativa; la innovación principal es la sustitución del solver por un surrogate rápido.

## Capacidades

- Predicción del coeficiente K = ⟨|U|⟩ / U_in, es decir, la velocidad media del viento a 1,75 m dividida por la velocidad de la corriente libre no perturbada a la misma altura.
- Conversión a velocidad en m/s mediante K × 0,494 × U10, donde U10 es la velocidad del viento a 10 m.
- Procesamiento de huellas y alturas de edificios como entrada (máscara, altura normalizada y distancia firmada a paredes).
- Manejo de sitios mayores que una ventana mediante ventanas en rejilla de 120 m con mezcla ponderada hacia los bordes (implementado en el script de ejemplo).
- Predicción para una única dirección de viento por llamada.
- Atmósfera neutra, suelo plano y velocidad media (sin rachas).
- Inferencia en CPU de portátil con onnxruntime en aproximadamente 1,5 s por llamada (ventana con frame y espejo).
- No soporta tool calling, agentes, razonamiento multi-step, visión general ni audio: es un modelo espacial especializado.

## Casos de uso

- Estudios tempranos de diseño urbano: comparar rápidamente distintas disposiciones de edificios evaluando el campo K en ventanas de 150 × 150 m antes de comprometer una simulación completa.
- Análisis de confort de viento a nivel peatonal: calcular la velocidad media a 1,75 m en un barrio para identificar zonas expuestas o resguardadas, con la advertencia de que no sirve para certificar confort.
- Exploración paramétrica de alternativas: al responder en 1-2 s por ventana, permite barrer decenas de variantes de altura y huella en una sola sesión de portátil.
- Precribado de emplazamientos: procesar sitios grandes con ventanas en rejilla de 120 m y mezcla ponderada para descartar configuraciones problemáticas antes de lanzar el solver.
- Docencia y divulgación: ilustrar el efecto de los edificios sobre el viento con una herramienta ligera que corre en CPU sin GPU dedicada.
- Integración en herramientas SIG o flujos de diseño: el formato ONNX y el script de ejemplo (que reproduce la construcción de entradas de la app web de Sreda) facilitan incorporar la predicción a pipelines existentes.
- Validación cruzada rápida: usar la predicción como referencia preliminar frente a resultados de túnel de viento o de simulación completa en fases de revisión.

## Benchmarks y rendimiento

Correlación r de K entre el modelo y el solver Sreda sobre la ventana completa, promediada por escenas (conjuntos de test no vistos en entrenamiento):

| Conjunto de test | Escenas | 0.6.1 | 0.6 |
|---|---|---|---|
| Astana, Minsk, Yekaterinburg | 18 | 0,831 | 0,829 |
| · high-rise | 3 | 0,824 | 0,798 |
| · centros históricos | 3 | 0,839 | 0,835 |
| · low-rise | 3 | 0,888 | 0,879 |
| · microdistritos | 3 | 0,832 | 0,846 |
| · mid-rise | 3 | 0,705 | 0,716 |
| · mixto | 3 | 0,896 | 0,902 |
| · Astana | 6 | 0,797 | 0,789 |
| · Minsk | 6 | 0,870 | 0,878 |
| · Yekaterinburg | 6 | 0,825 | 0,821 |
| Ciudades japonesas reservadas | 18 | 0,881 | 0,882 |
| · high-rise | 4 | 0,851 | 0,851 |
| · low-rise baja densidad | 4 | 0,913 | 0,914 |
| · mid-rise | 5 | 0,853 | 0,862 |
| · bloques similares a AIJ Niigata | 5 | 0,907 | 0,904 |
| Osaka | 10 | 0,884 | 0,876 |
| · high-rise | 2 | 0,818 | 0,796 |
| · low-rise baja densidad | 2 | 0,893 | 0,888 |
| · mid-rise | 3 | 0,890 | 0,884 |
| · bloques similares a AIJ Niigata | 3 | 0,916 | 0,914 |

Correlación C.C. del ratio de velocidad en los puntos de medida frente a ensayos de túnel de viento del Architectural Institute of Japan (AIJ):

| Caso | 0.6.1 | 0.6 |
|---|---|---|
| Niigata (AIJ Case E), viento W | 0,868 | 0,869 |
| Niigata (AIJ Case E), viento NNE | 0,665 | 0,632 |
| AIJ Case C, 0H, 0° | 0,954 | 0,963 |
| AIJ Case C, 0H, (resto de datos) | no disponible | no disponible |

## Requisitos de hardware

- Inferencia en CPU: aproximadamente 1,5 s por llamada (ventana con frame y espejo) en la CPU de un portátil con onnxruntime.
- Modelo de 72,8 MB en float32; el peso en memoria es reducido y no requiere GPU dedicada.
- Cabe en cualquier GPU de consumo, e incluso en equipos sin GPU; no se especifican requisitos mínimos de VRAM.
- Despliegue mediante onnxruntime (el script de ejemplo usa `pip install numpy onnxruntime`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- No se publican datos de latencia o throughput más allá de la cifra de 1-2 s por ventana en portátil.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. La comparación relevante es frente al propio solver Sreda (lattice Boltzmann D3Q27 con LES), que tarda de decenas de minutos a varias horas en una GPU de sobremesa frente a 1-2 s del surrogate en CPU, y frente a la versión anterior 0.6 del mismo modelo, cuyos resultados se incluyen en las tablas de evaluación.

## Limitaciones y advertencias

- Estado *preview*: la versión 0.6.1 no superó su propio test de aceptación definido antes del entrenamiento. No debe usarse para aprobar un diseño ni para certificar confort de viento.
- Solo atmósfera neutra, suelo plano y una dirección de viento por predicción; no modela rachas, solo velocidad media.
- Solo considera edificios apoyados en el suelo; puentes y volúmenes elevados no se ven.
- Las alturas de edificios en Rusia y Bielorrusia se estiman como niveles OSM × 3 m, lo que introduce error.
- El rendimiento es desigual por tipología: la correlación cae a 0,705 en mid-rise en Astana/Minsk/Yekaterinburg y a 0,665 en el caso Niigata con viento NNE frente a túnel de viento.
- La validez de la salida se restringe a la ventana central de 150 × 150 m; fuera de ella la predicción no es válida.
- No es un modelo de lenguaje: no soporta tool calling, agentes, visión general, audio ni capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones de precisión desaconsejan usarlo en decisiones críticas sin validación con simulación completa o túnel de viento.
- No se han publicado datos sobre sesgos ni sobre riesgos de alucinación en el sentido habitual; el riesgo principal es la extrapolación a tipologías urbanas no representadas en el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Azatyt/sreda-ml
- Script de ejemplo: `sreda_ml_example.py` (incluido en el repositorio del modelo)
- Project PLATEAU (MLIT Japan): no disponible en la información proporcionada
- OpenStreetMap (ODbL 1.0): https://www.openstreetmap.org
- Berlín LoD2 (dl-de/zero-2-0): no disponible en la información proporcionada
- 3DBAG (TU Delft / 3DGI, CC BY 4.0): https://3dbag.nl
- IGN BD TOPO (Licence Ouverte 2.0): no disponible en la información proporcionada
- AIJ benchmark cases (Architectural Institute of Japan): no disponible en la información proporcionada
- Paper, blog o demo del modelo: no disponible en la información proporcionada
