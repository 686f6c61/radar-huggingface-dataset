# anirudh98492/see-you-coming

## Resumen

SEE YOU COMING es un conjunto de dos redes neuronales exportadas a ONNX que implementan la percepcion y la prediccion de trayectorias de un coche autonomo simulado. El modelo principal es un LSTM que predice los proximos 3,2 segundos de movimiento de un peaton (8 puntos a intervalos de 0,4 s) a partir de sus ultimos 2,8 s de historia mas 33 caracteristicas de contexto (bordillo, paso de cebra, semaforo, coche mas cercano, el propio vehiculo robot y los 3 peatones mas proximos). El segundo modelo es un detector de personas YOLO11n afinado sobre imagenes de camara del simulador, con entrada de 960 px.

Lo desarrolla Kartikeya Anirudh Pisipati (University of Florida, M.S. AI Systems) como parte del proyecto SEE YOU COMING, un coche autonomo simulado en PyBullet que predice por donde caminaran los peatones. La relevancia tecnica esta en su enfoque: el LSTM no predice posiciones absolutas, sino una correccion sobre la estimacion de velocidad constante, y se entrena con pistas filtradas por Kalman y ruido de camara de 0-0,3 m. Ambos modelos se ejecutan unicamente con ONNX Runtime, sin PyTorch ni GPU.

El repositorio de Hugging Face tiene 0 descargas y 0 likes, un tamano de 0,0 GB y fue creado el 27 de noviembre de 2026. No se dispone de informacion sobre licencia ni idiomas soportados. El autor advierte explicitamente que es un componente de simulacion, no validado en calles reales ni en imagenes de camara reales, y no certificado para seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (prediccion de trayectorias) + YOLO11n (deteccion de personas), exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2,8 s de historia (7 pasos de 0,4 s) + 33 caracteristicas de contexto; prediccion de 3,2 s (8 puntos) |
| Tipos de cuantizacion | no disponible (pesos ONNX en float32 segun la firma de entrada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`lstm_v3.onnx`, `yolo11n_sim_960_night.onnx`) |

## Arquitectura y entrenamiento

El predictor de trayectorias es un LSTM que recibe dos entradas: `x` con forma (personas, 7, 35), que combina los 7 pasos entre 8 puntos de historia (0,4 s entre puntos) divididos por un factor de escala con 33 caracteristicas de contexto normalizadas, y `cv` con forma (personas, 8, 2), la estimacion de velocidad constante. La salida `offsets` tiene forma (personas, 8, 2) en metros: posiciones futuras relativas al ultimo punto observado. El modelo aprende una correccion sobre la velocidad constante y se entreno con pistas ruidosas filtradas por Kalman y ruido de camara de 0-0,3 m. Cuando no hay contexto disponible se usa 0 en las caracteristicas normalizadas, que corresponde a la media de entrenamiento.

El detector es un YOLO11n afinado sobre 2.717 imagenes autolabeladas del simulador y posteriormente ajustado con imagenes de dia, noche, sombras y ropa oscura, con entrada de 960 px y forma dinamica (letterbox a multiplo de 32). La exportacion a ONNX esta verificada con un informe (`export_report.txt`) que demuestra que los modelos ONNX dan las mismas respuestas que los originales en PyTorch. No se especifican el numero de tokens de entrenamiento ni el uso de RLHF/DPO, por no tratarse de un modelo de lenguaje.

## Capacidades

- Prediccion de trayectorias de peatones a 3,2 s vista (8 puntos, 0,4 s de separacion) a partir de 2,8 s de historia.
- Correccion aprendida sobre la estimacion de velocidad constante, con mejoras medidas frente a esta ultima.
- Deteccion de personas en imagenes RGB con YOLO11n, con pre y post-procesado (letterbox, NMS) implementados solo con ONNX Runtime.
- Inferencia en CPU sin GPU ni PyTorch, mediante ONNX Runtime.
- Wrapper listo para usar (`code/predictor.py`) que soporta modo LSTM o velocidad constante, una compuerta de movimiento (motion gate) y un indicador de tambaleo (wobble flag).
- Entrada por lotes de varias personas simultaneamente (1-8 personas por peticion segun las latencias reportadas).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Simulacion de conduccion autonoma: el LSTM predice por donde caminaran los peatones en un entorno PyBullet y permite que el coche simulado planifique trayectorias seguras; con posiciones del simulador reduce los choques con personas del 52% (reactivo) al 2%.
- Investigacion en prediccion de trayectorias: sirve como linea base reproducible frente a velocidad constante en experimentos con ruido de camara controlado (0-0,3 m) y pistas filtradas por Kalman.
- Docencia en sistemas de IA: el par ONNX + wrapper + Docker con Prometheus y Grafana permite montar un servicio de inferencia completo sin GPU para practicas de percepcion y prediccion.
- Deteccion de personas en imagenes de simulador: el YOLO11n afinado detecta personas de dia y de noche en las camaras del simulador (recall 0,88 de dia y 0,80 de noche), util para pipelines de vision en entornos simulados.
- Evaluacion de latencia en servicios de inferencia: con 0,48 ms p95 para el LSTM y 6,5 ms p95 para una peticion completa de 1-8 personas, sirve para probar infraestructura de servicio en tiempo real sobre CPU.
- Analisis de interpretabilidad: el autor incluye una comprobacion LIME (ocultar las 3 regiones mas importantes baja la confianza de 0,70 a 0,14 frente a 0,68 con regiones aleatorias), reutilizable como ejemplo de validacion de que el detector mira a la persona.
- Prototipado de sistemas de seguridad peatonal en simulacion: combinando deteccion y prediccion se puede experimentar con politicas de frenado y comparar el impacto de la percepcion frente al del predictor.

## Benchmarks y rendimiento

Precision offline del LSTM (56.021 ejemplos de validacion, error a 3,2 s):

| Entrada | Velocidad constante | LSTM v3 |
|---|---|---|
| Pistas limpias | 1,245 m | 1,010 m |
| Ruido de camara 0,3 m, filtrado Kalman | 2,563 m | 1,176 m |
| Errores reales de camara del coche (held out) | 3,148 m | 1,866 m |

Evaluacion final en el coche (v6, 100 semillas nuevas, codigo congelado, emparejadas por semilla):

| Metrica | Valor |
|---|---|
| Runs que tocan a una persona, reactivo | 52% |
| Runs que tocan a una persona, velocidad constante | 1% |
| Runs que tocan a una persona, LSTM | 2% |
| Runs exitosos con camara del coche, LSTM vs velocidad constante | 94 vs 97, p = 0,375 (sin diferencia detectada) |
| Latencia LSTM (p95, dentro del servicio web) | 0,48 ms |
| Latencia peticion completa 1-8 personas (p95) | 6,5 ms |

Deteccion YOLO11n:

| Modelo | Precision | Recall | mAP50 |
|---|---|---|---|
| Dia, 960 px | 0,90 | 0,84 | 0,91 |
| Dia + noche | no disponible | 0,88 (dia) / 0,80 (noche) | no disponible |

## Requisitos de hardware

- Inferencia en CPU: ambos modelos se ejecutan con ONNX Runtime sin GPU ni PyTorch, segun el autor.
- VRAM estimada: no disponible; al ejecutarse en CPU no requiere VRAM.
- GPU recomendadas: no aplica segun la model card (no requiere GPU); no se especifican GPUs compatibles.
- Cabe en GPU consumer: si, aunque no es necesario; no hay datos de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (unica libreria declarada); el autor menciona un servicio Docker con Prometheus y Grafana en el repositorio de GitHub.
- Latencia y throughput: LSTM 0,48 ms p95 y peticion completa de 1-8 personas 6,5 ms p95 dentro del servicio web; throughput no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia interna, la model card compara el LSTM con la linea base de velocidad constante (ver seccion de benchmarks), pero no con otros modelos de prediccion de trayectorias como los evaluados en ETH/UCY, que el autor indica que no se han probado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SEE YOU COMING (LSTM v3 + YOLO11n) | no disponible | 2,8 s historia / 3,2 s prediccion | Error 1,010-1,866 m a 3,2 s | no disponible | ONNX en Hugging Face |
| Velocidad constante (linea base) | 0 | no aplica | Error 1,245-3,148 m a 3,2 s | no disponible | incluida en el wrapper |
| Otros modelos de prediccion de trayectorias | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo simulacion: los modelos se entrenaron y evaluaron en un unico pueblo de PyBullet y una unica camara (1,3 m de altura, 90 grados); no estan validados en calles reales ni en imagenes de camara reales.
- No probados en datasets publicos como ETH/UCY.
- La ventaja offline del LSTM no se traslado a la conduccion con camara: con la camara del coche rinde igual que velocidad constante (94 vs 97 runs exitosos, p = 0,375); el limite es el error de percepcion, no el predictor.
- Una version entrenada con errores reales de camara reproducidos (v4) fue mejor offline pero peor en el coche, y no se publica.
- No es un componente certificado para seguridad; es para investigacion y docencia.
- Licencia no disponible: no se puede confirmar el uso comercial.
- Riesgo de sesgo y alucinacion: no evaluado en la informacion disponible; el dominio de entrenamiento es una simulacion concreta, por lo que la generalizacion fuera de ella es incierta.
- El detector depende de etiquetado automatico de imagenes del simulador, lo que puede introducir sesgos en las etiquetas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anirudh98492/see-you-coming
- Codigo, simulador, evaluacion y servicio Docker: https://github.com/anirudhkartikeya/aisystems (carpeta `robot_nav_project/`)
- Paper: no disponible
- Blog o demo: no disponible
