# Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-regression-tf2-noscale

## Resumen

DexGarmentLab Lift GPS TF2 deterministic regression (D-GNN) es un modelo de estimacion de estado para prendas de ropa deformables desarrollado por el usuario Cloth-splatters en el marco del proyecto ClothAtlas. No es un modelo de lenguaje ni un modelo de difusion de imagenes, pese a estar etiquetado con la libreria `diffusers`: es un regresor geometrico que recibe dos nubes de puntos (una observacion parcial de la prenda y una plantilla en reposo) y devuelve las posiciones de los vertices de la malla, es decir, la configuracion espacial exacta de la prenda.

La relevancia del modelo es metodologica. Se trata de la ablacion determinista del estimador de flujo de ClothAtlas (seccion V-A/V-B del articulo), y sirve para medir cuanto rendimiento se pierde al sustituir la generacion iterativa por una unica pasada directa. Entrena con la perdida `Regression_StateEstGPS`, que minimiza un MSE enmascarado sobre las posiciones de los vertices partiendo de `[0 | rest]` en el paso 0, de modo que la evaluacion completa es un solo forward pass (`--steps 1 --num-samples 1`). La arquitectura `GPSStateEstModel` es compartida con la variante de flujo: cross-attention secuencial sobre dos nubes de puntos, dimension oculta 128, 8 capas y 8 cabezas, con un limite de 2048 nodos por nube.

El modelo se publica junto al articulo ClothAtlas y sustituye a `dexgarmentlab-lift-20260822-state-est-gps-regression-tf2` (10 epocas, con aleatorizacion de escala de plantilla) como version valida para el envio final. Su principal valor practico es la eficiencia: donde el estimador de flujo necesita multiples pasos, esta variante resuelve la estimacion de estado con una sola inferencia, a costa de un peor rendimiento en identificacion de prenda (top-1 de 12/22 frente a 19/22 en el escenario secuencial con poda).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPSStateEstModel (D-GNN): cross-attention secuencial sobre dos nubes de puntos, hidden 128, 8 capas, 8 cabezas, limite de 2048 nodos |
| Parametros totales | no disponible (no publicado por el autor); por la configuracion (hidden 128, 8 capas) se situa en el orden de millones de parametros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); la entrada esta limitada a nubes de puntos de 2048 nodos |
| Tipos de cuantizacion | no disponible; no se publican variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | no aplica (el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (carpeta `model/`, pesos EMA seleccionados por validacion) mas `config.yml` con la configuracion completa de entrenamiento |
| Tarea | regresion determinista de estado de prendas: estimacion de la configuracion de malla a partir de nubes de puntos |
| Entradas | dos nubes de puntos (observacion de la prenda y plantilla en reposo) |
| Salida | posiciones de vertices de la malla estimada |
| Regimen de inferencia | una unica pasada determinista (`--steps 1 --num-samples 1`) |
| Dataset de entrenamiento | `Cloth-splatters/dexgarmentlab-lift-correspondence-20260822`; fichero `dexgarmentlab_lift_full_state_20260822.h5`, revision `771714a2` |
| Particion de datos | 176 / 23 / 22 prendas (entrenamiento / validacion / test), split random-garment |
| Mejor perdida de validacion | 0,00013293644893884105 (MSE enmascarado sobre posiciones de vertices) |
| SHA-256 de los pesos | `f03de79a0af0503674d29c9034b88472589475bd5e0b2ba451f706819499a778` |
| Tamano del repositorio | 0,0 GB segun HuggingFace |

## Arquitectura y entrenamiento

El modelo emplea `GPSStateEstModel`, una red de grafos sobre nubes de puntos (D-GNN) con cross-attention secuencial entre dos entradas de nube: la observacion de la prenda y la plantilla en reposo. La dimension oculta es 128, con 8 capas y 8 cabezas de atencion, y las nubes se truncan a un maximo de 2048 nodos. La misma arquitectura se usa en el estimador de flujo del articulo ClothAtlas, lo que permite una comparacion controlada entre el regimen generativo y el regresivo. A diferencia del estimador de flujo, que parte de ruido y aplica varios pasos de integracion, esta variante minimiza directamente un MSE enmascarado sobre las posiciones de los vertices (`Regression_StateEstGPS`), recibiendo `[0 | rest]` en el paso 0. No hay RLHF, DPO ni ajuste por preferencias: es un modelo puramente supervisado y geometrico.

El entrenamiento corresponde al trabajo `1309183`, finalizado el 14 de septiembre de 2026 tras 9 horas y 34 minutos sobre 2 x GH200. Se realizaron 20 epocas y 398.700 actualizaciones del optimizador con lotes de 2 x 16, tasa de aprendizaje 1e-3, 500 pasos de calentamiento, planificador coseno, semilla 259, precision bf16, EMA 0.9999 y `coord_scale` 1. La aumentacion de datos incluye escala conjunta entre 0,8 y 1,25, rotacion en guinada (yaw), guinada de plantilla de hasta 180 grados con probabilidad 0,5, corrupcion de la nube y, de forma deliberada, ausencia de aleatorizacion de la escala de la plantilla, de ahi el sufijo `noscale`. Esta ultima decision es el factor diferencial frente al modelo predecesor.

## Capacidades

- Regresion determinista de la configuracion de malla de una prenda en una unica pasada directa, sin muestreo estocastico ni integracion de pasos.
- Estimacion de estado con oclusion parcial: el modelo mantiene un Chamfer de superficie ocluida de 13,0 mm de mediana sobre las 7.537 muestras de test.
- Identificacion de prenda entre un catalogo de 221 mallas canonicas (con 22 prendas retenidas para evaluacion), con resultados de top-1 y top-5 publicados por escenario.
- Identificacion secuencial con poda: partiendo de 221 candidatas, reduce a 5 tras tres observaciones y retiene la malla exacta en 21 de 22 casos.
- Procesamiento de dos nubes de puntos simultaneas (observacion y plantilla), con tolerancia a rotaciones de plantilla de hasta 180 grados.
- Inferencia eficiente y reproducible: al ser determinista, la salida no varia entre ejecuciones con la misma entrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un unico forward pass sin bucle de decision.
- No tiene capacidades multilingues: no procesa ni genera texto.
- No tiene vision RGB, audio, ni modo de razonamiento explicito; la entrada es exclusivamente geometrica (nubes de puntos).

## Casos de uso

- Manipulacion robotica de prendas: el modelo estima la configuracion actual de la tela a partir de la nube de puntos del sensor de profundidad durante una tarea de plegado o desplegado, y la malla estimada alimenta el planificador de agarre. Su naturaleza determinista garantiza que la misma observacion produzca siempre la misma malla, lo que simplifica el control de bajo nivel.
- Identificacion de prenda en un catalogo: dado un catalogo de 221 mallas canonicas, el modelo reduce el conjunto de candidatas y determina de que prenda se trata; util en sistemas de inventario textil robotizado o en clasificacion automatica de ropa en plantas de reciclaje.
- Registro de malla en trayectorias de manipulacion: sobre las 169 trayectorias del conjunto de test (muestreo cada 10 fotogramas), el modelo proporciona la configuracion de la malla en cada instante, lo que permite construir una traza temporal del estado de la prenda y detectar deslizamientos o enganchones.
- Validacion de simuladores de tejidos: la malla estimada sirve como referencia cuantitativa para comparar la salida de un simulador fisico (por ejemplo, el entorno DexGarmentLab) con la geometria real observada, midiendo la discrepancia mediante Chamfer de superficie.
- Ablacion y analisis en investigacion: al compartir arquitectura y datos con el estimador de flujo del articulo ClothAtlas, este modelo permite aislar el coste de renunciar al regimen generativo, comparando directamente ambos regimens sobre las mismas 7.537 muestras.
- Sustitucion de un estimador de flujo en produccion cuando la latencia es critica: alli donde la estocasticidad y los multiples pasos no son aceptables, este modelo ofrece una estimacion con un unico forward pass, a cambio de un peor rendimiento en escenarios de oclusion severa.
- Deteccion de estados de prenda mal capturados: el peor decil del Chamfer de superficie ocluida (25,0 mm de mediana) acota la calidad esperada en condiciones adversas y permite definir umbrales de rechazo en un pipeline de percepcion industrial.

## Benchmarks y rendimiento

Estimacion de configuracion de malla exacta sobre las 7.537 muestras de test (169 trayectorias, paso 10). Medianas en milimetros. Entre parentesis, los valores del estimador de flujo de la misma familia.

| Metrica (mm) | Este modelo (regresion, noscale) | Estimador de flujo (noscale) |
|---|---|---|
| Chamfer de superficie | 12,8 | 11,7 |
| Chamfer de superficie ocluida | 13,0 | 12,0 |
| Peor decil de superficie ocluida | 25,0 | 22,9 |
| Error de vertice p90 | 36,1 | 25,6 |

Identificacion entre 221 mallas canonicas (22 prendas retenidas), top-1 / top-5:

| Escenario | Este modelo | Estimador de flujo |
|---|---|---|
| Fotograma plano | 21 / 21 | 22 / 22 |
| Fotograma levantado | 8 / 14 | 15 / 19 |
| Primeras tres observaciones | 20 / 21 | 22 / 22 |
| Las nueve observaciones | 13 / 15 | 18 / 22 |
| Identificacion secuencial con poda: malla exacta retenida | 21 / 22 | 22 / 22 |
| Identificacion secuencial con poda: top-1 final | 12 / 22 | 19 / 22 |

Mejor perdida de validacion registrada: 0,00013293644893884105. No se han publicado en la informacion disponible resultados con modelos externos a la familia ClothAtlas.

## Requisitos de hardware

- Entrenamiento: 2 x GH200, 9 horas y 34 minutos para 20 epocas y 398.700 actualizaciones, con lotes de 2 x 16 y precision bf16.
- Inferencia: el autor no publica cifras de VRAM. Dado el tamano de la arquitectura (hidden 128, 8 capas, maximo 2048 nodos) y que la inferencia es una unica pasada, la huella es muy reducida; una estimacion razonable es por debajo de 1 GB en fp32 con lotes pequenos, aunque se trata de una estimacion propia y no de un dato publicado.
- GPU recomendadas: cualquier GPU con soporte CUDA reciente (por ejemplo, RTX 3060 o superior) es suficiente para inferencia. No se requieren A100, H100 ni GH200, que solo aparecen en la fase de entrenamiento.
- Compatibilidad con GPU de consumo: si, con alta probabilidad, dado el tamano del modelo; el autor no proporciona una tabla de compatibilidad oficial.
- Ejecucion en CPU: no confirmada por el autor, aunque plausible por el tamano; tampoco se documenta.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. La carga se realiza con `load_pipeline("dexgarmentlab-lift-20260822-state-est-gps-regression-tf2-noscale")` desde `src.hub` / `src.inference.checkpoint` del repositorio de codigo.
- Latencia y throughput: no publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Regimen de inferencia | Escala de plantilla | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`...regression-tf2-noscale`) | GPSStateEstModel, hidden 128, 8 capas / 8 cabezas, 2048 nodos | Regresion determinista, 1 paso | Sin aleatorizacion | Chamfer 12,8 mm; top-1 secuencial 12 / 22 | MIT | HuggingFace, repo de 0,0 GB |
| `...state-est-gps-flow-tf2-noscale` | Misma arquitectura | Estimador de flujo, multiples pasos | Sin aleatorizacion | Chamfer 11,7 mm; top-1 secuencial 19 / 22 | MIT | HuggingFace |
| `...state-est-gps-regression-tf2` (predecesor) | Misma arquitectura | Regresion determinista, 1 paso | Con aleatorizacion | no disponible; 10 epocas | MIT | HuggingFace, sustituido por este modelo |

No se dispone de numeros publicados de otros modelos comparables de estimacion de estado de prendas deformables en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al estimador de flujo de la misma familia en todos los escenarios de identificacion publicados, con una diferencia especialmente marcada en el escenario secuencial con poda (top-1 final 12 / 22 frente a 19 / 22).
- El error de vertice p90 (36,1 mm) es notablemente peor que el del estimador de flujo (25,6 mm), lo que indica una peor calidad en la cola de la distribucion de errores.
- Modelo completamente determinista: no modela la incertidumbre ni la multimodalidad de las configuraciones posibles. Para una misma observacion siempre devuelve la misma malla, lo que puede ocultar ambiguedades reales.
- Limite de 2048 nodos por nube de puntos: prendas con mallas mas densas requieren submuestreo, con la perdida de detalle geometrico que ello implica.
- El modelo esta restringido a un catalogo de 221 mallas canonicas. No puede estimar la configuracion de una prenda cuya malla canonica no este en ese conjunto.
- Entrenado sobre el dominio especifico de DexGarmentLab (176 prendas, entorno de laboratorio). No se publican datos de generalizacion a tejidos, iluminaciones o sensores distintos.
- El repositorio aparece con un tamano de 0,0 GB en HuggingFace, lo que suscita dudas sobre si los pesos estan efectivamente publicados en su totalidad; conviene verificar la descarga antes de integrarlo en un pipeline.
- Riesgo de alucinacion: no aplica en el sentido habitual (no genera texto), pero si existe riesgo de estimaciones geometricamente plausibles y a la vez incorrectas en condiciones de oclusion severa, donde el peor decil alcanza 25,0 mm de Chamfer.
- Licencia MIT para el modelo, lo que permite uso comercial; conviene verificar por separado la licencia del dataset `Cloth-splatters/dexgarmentlab-lift-correspondence-20260822` y del entorno DexGarmentLab antes de un despliegue comercial.
- Documentacion unicamente en ingles, pese a que el modelo no procesa lenguaje.
- No hay informacion sobre sesgos demograficos o de otro tipo, dado que el modelo no trata con personas ni con texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-regression-tf2-noscale
- Estimador de flujo de la misma familia: https://huggingface.co/Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-flow-tf2-noscale
- Modelo predecesor (sustituido): https://huggingface.co/Cloth-splatters/dexgarmentlab-lift-20260822-state-est-gps-regression-tf2
- Dataset de correspondencia: https://huggingface.co/datasets/Cloth-splatters/dexgarmentlab-lift-correspondence-20260822
- Codigo fuente (rama `icra` de UniClothDiff): https://github.com/jsll/UniClothDiff/tree/icra
- Articulo ClothAtlas: no disponible (referenciado como "ClothAtlas paper", seccion V-A/V-B, sin enlace en la informacion proporcionada)
- Los resultados de busqueda web obtenidos no contienen enlaces relevantes al modelo: se limitan a definiciones genericas del termino "cloth" en diccionarios y enciclopedias.
