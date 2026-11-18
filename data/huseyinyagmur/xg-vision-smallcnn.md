# huseyinyagmur/xg-vision-smallcnn

## Resumen

xG-Vision SmallCNN es una red neuronal convolucional de tamano reducido (1,2 millones de parametros) desarrollada por el usuario de Hugging Face huseyinyagmur para estimar la probabilidad de que un disparo en futbol se convierta en gol, es decir, el valor de *expected goals* (xG). El modelo toma como entrada una imagen cenital de seis canales del medio campo atacante en el instante del disparo (tirador, companeros, defensores, portero, cono de tiro y mapa de distancias) junto con la parte del cuerpo con la que se golpea el balon (pie, cabeza u otra), y devuelve una probabilidad calibrada.

La relevancia del modelo es metodologica: demuestra que una CNN pequena puede aproximarse al rendimiento de un modelo propietario como el xG de StatsBomb (log loss 0,2826 frente a 0,2778 en el conjunto de test) utilizando unicamente posiciones y parte del cuerpo, sin informacion de tecnica de disparo, presion o tipo de pase. Se entrena sobre los *freeze frames* de StatsBomb Open Data, lo que lo convierte en una herramienta util para investigacion, docencia y exploracion de como un modelo de vision interpreta situaciones de tiro.

El modelo se distribuye como un checkpoint de PyTorch (`small_cnn.pt`) con `state_dict`, configuracion de entrenamiento y metricas de validacion, y se acompana de un repositorio con codigo de entrenamiento y un tablero tactico interactivo en Streamlit. Su uso esta restringido a fines no comerciales por la licencia de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN pequena (red convolucional) sobre imagen cenital de 6 canales mas entrada de parte del cuerpo |
| Parametros totales | 1,2 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de vision sin componente linguistico) |
| Licencia | StatsBomb Public Data User Agreement (codigo bajo MIT) |
| Formato de pesos | PyTorch checkpoint (`small_cnn.pt`, `state_dict` + metadatos) |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional pequena que procesa una imagen cenital de seis canales que codifica la posicion del tirador, sus companeros, los defensores, el portero, el cono de tiro y un mapa de distancias, a la que se anade la parte del cuerpo del disparo (pie, cabeza u otra). El modelo tiene 1,2 millones de parametros y emplea normalizacion por lotes; las estadisticas de batch-norm se recalculan con pesos congelados antes de cada validacion ("precise BN"). El checkpoint corresponde a la semilla 42 y a la epoca 9 de 14, seleccionada sobre el split de validacion por log loss.

El entrenamiento utiliza StatsBomb Open Data (snapshot de noviembre de 2026): 3.961 partidos y 95.160 disparos en juego abierto con *freeze frame*, con una tasa de gol del 10,4%. Se excluyen penaltis, faltas y disparos desde el propio campo. El split se hace por partido y estratificado por competicion: 66.754 disparos de entrenamiento, 14.240 de validacion y 14.166 de test. Se aplica aumento por espejo (y → 80 − y), entropia cruzada binaria sin pesos de clase para mantener la calibracion, optimizador AdamW y parada temprana sobre el log loss de validacion. No se reporta uso de RLHF ni DPO, al no tratarse de un modelo generativo.

## Capacidades

- Estimacion de xG a partir de una imagen cenital de la situacion de tiro y de la parte del cuerpo.
- Procesamiento de coordenadas StatsBomb (campo de 120 × 80 yardas, atacando hacia x = 120) y de filas de *freeze frame* con formato [x, y, companero, es_portero].
- Prediccion calibrada: error de calibracion esperado de 0,009 en 15 bins de igual recuento en el conjunto de test.
- Promediado con la imagen espejo (volteo izquierda/derecha) para mejorar la calibracion, integrado en el tablero tactico del repositorio.
- Integracion en Python mediante `huggingface_hub`, `torch` y las utilidades del repositorio (`src.models.load_checkpoint`, `src.perturb.Shot`).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Analisis tactico interactivo: el tablero Streamlit del repositorio permite colocar jugadores sobre el campo y obtener el xG de la situacion, util para explorar como varia la probabilidad al mover defensores o al portero.
- Docencia e investigacion en analitica deportiva: sirve como caso de estudio de modelos de vision aplicados a datos de eventos y de comparacion con un modelo propietario de referencia (StatsBomb xG).
- Evaluacion de la calidad de tiro en datos abiertos: permite calcular xG para los 95.160 disparos de StatsBomb Open Data y agregar el rendimiento por equipo o jugador en contextos no comerciales.
- Estudio de sensibilidad a variables: las perturbaciones controladas del repositorio (mover tirador, anadir defensores, mover o retirar portero) permiten analizar que aprende el modelo y detectar artefactos.
- Prototipado de pipelines de analitica: el checkpoint y el codigo MIT facilitan integrar un estimador de xG en cuadernos de analisis o herramientas internas de investigacion.
- Comparacion de arquitecturas: al ser una CNN de 1,2 M de parametros con metricas publicadas frente a una regresion logistica (distancia, angulo y parte del cuerpo), sirve como referencia para experimentos de vision en deportes.
- Generacion de visualizaciones y mapas de tiro: las probabilidades por disparo pueden alimentar graficos de xG acumulado o mapas de tiro en estudios academicos.

## Benchmarks y rendimiento

Evaluacion sobre el split de test (14.166 disparos de 597 partidos, tasa de gol del 11,1%). Intervalos del 95% calculados con 2.000 remuestreos bootstrap por partido.

| Modelo | Log loss | Brier | ROC-AUC |
|---|---|---|---|
| StatsBomb xG (modelo propietario) | 0,2778 [0,267; 0,289] | 0,0799 | 0,807 [0,795; 0,818] |
| Este modelo | 0,2826 [0,272; 0,293] | 0,0813 [0,078; 0,085] | 0,797 [0,784; 0,809] |
| Esta arquitectura, 3 semillas | 0,2824 ± 0,0006 | 0,0813 | 0,798 ± 0,002 |
| Regresion logistica: distancia + angulo + parte del cuerpo | 0,3044 | 0,0879 | 0,753 |
| Constante (tasa de gol de entrenamiento) | 0,3478 | 0,0983 | 0,500 |

- Frente a StatsBomb xG (comparacion pareada por partido): log loss +0,0047 [+0,0023; +0,0071] y ROC-AUC −0,010 [−0,015; −0,005]; el modelo de StatsBomb es significativamente mejor y ademas usa entradas no disponibles aqui (tecnica de disparo, primer toque, uno contra uno, presion).
- Frente a la regresion logistica: log loss −0,022 y ROC-AUC +0,043.
- Hombres / mujeres (log loss): 0,2752 / 0,2960 (StatsBomb xG: 0,2704 / 0,2914).
- Calibracion: error de calibracion esperado de 0,009 (StatsBomb xG: 0,012).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 1,2 M de parametros y procesa imagenes de seis canales de baja resolucion.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada pueden ejecutar la inferencia.
- Cabe en GPU de consumo: si, en cualquier GPU consumer (e incluso en CPU para lotes pequenos).
- Opciones de despliegue: PyTorch nativo, exportacion a TorchScript u ONNX no documentada; integracion mediante el repositorio GitHub y el tablero Streamlit.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Log loss (test) | ROC-AUC (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| xG-Vision SmallCNN | 1,2 M | Imagen cenital 6 canales + parte del cuerpo | 0,2826 | 0,797 | StatsBomb Public Data User Agreement (no comercial) | Checkpoint en Hugging Face |
| StatsBomb xG | no disponible | Posiciones + tecnica, presion, primer toque, uno contra uno | 0,2778 | 0,807 | Propietaria | Solo como servicio de StatsBomb |
| Regresion logistica (distancia + angulo + parte del cuerpo) | no disponible (modelo lineal) | Distancia, angulo, parte del cuerpo | 0,3044 | 0,753 | no disponible | Referencia interna del estudio |

## Limitaciones y advertencias

- Artefacto en el borde de la linea de gol: los disparos desde menos de ~1,5 yardas de la linea de gol y fuera de los postes reciben un xG excesivamente alto (~0,45 incluso a 28 yardas de ancho; una regresion logistica daria 0,02). Solo hay ~110 disparos de entrenamiento en esa zona; no debe usarse el modelo alli.
- La posicion del portero esta confundida con el gol: mover solo al portero fuera de la linea eleva el xG (media de 0,072 a 0,110 para un desplazamiento de 4 yardas), porque en los datos un portero adelantado suele indicar descolocacion. El modelo no ha aprendido el efecto de cerrar el angulo.
- Distancia frente a presion: retroceder 3 yardas eleva el xG en el 27% de los disparos, sobre todo cuando aleja al tirador del defensor mas cercano; el efecto parece demasiado grande.
- Un defensor a mitad de la linea de tiro a veces eleva el xG (19% de los disparos), sobre todo a 3-10 yardas delante del portero.
- Asimetria izquierda/derecha de hasta 0,15 xG pese al aumento por espejo; el promediado con la imagen espejo ayuda.
- Fuera de distribucion: ausencia de portero (0,1% de los disparos de entrenamiento), solo portero en el campo, cabezazos desde 25 o mas yardas, jugadas a balon parado y penaltis.
- Solo usa posiciones y parte del cuerpo: no hay tecnica de disparo, altura del balon, tipo de pase ni habilidad del jugador.
- Licencia: el codigo es MIT, pero los datos de entrenamiento estan bajo el StatsBomb Public Data User Agreement, que no permite explotacion comercial; el uso previsto es investigacion, docencia y exploracion, no apuestas ni decisiones sobre jugadores reales.
- Riesgo de alucinacion no aplica (no es un modelo generativo), pero si existe riesgo de predicciones mal calibradas en las situaciones fuera de distribucion descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huseyinyagmur/xg-vision-smallcnn
- Repositorio de codigo, entrenamiento y evaluacion: https://github.com/Huseyinyagmur/xG-Vision
- StatsBomb Open Data: https://github.com/statsbomb/open-data
- Licencia StatsBomb Public Data User Agreement: https://github.com/statsbomb/open-data/blob/master/LICENSE.pdf
