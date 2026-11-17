# imvetri/resgru-unet-pm25

## Resumen

ResGRU-UNet es un modelo de predicción espacio-temporal de PM2.5 superficial desarrollado por el autor independiente imvetri (Vetri), publicado en Hugging Face bajo licencia MIT. El modelo predice la concentración de PM2.5 para las siguientes 16 horas a partir de las últimas 10 horas de observaciones meteorológicas y de calidad del aire, en cada celda de una rejilla de 140 x 124 puntos (aproximadamente 25 km de resolución) que cubre la India (7.06 a 38.00 N, 67.79 a 97.93 E). Forma parte del estudio "Pipeline Over Backbone: A Controlled Study of Deep Networks for PM2.5 Forecasting Over India" y constituye el mejor modelo de dicha comparativa.

La arquitectura combina un encoder convolucional residual con un bloque convolucional GRU (ConvGRU) que itera 16 pasos, uno por hora de horizonte, y un decoder tipo U-Net con conexiones skip. El conjunto publicado incluye cinco redes entrenadas con semillas distintas (42, 1337, 1, 2 y 3), sus factores de calibración por horizonte y las estadísticas de normalización, con 7.122.113 parámetros por red. El modelo se entrenó con campos horarios de simulación WRF-Chem liberados para el reto ANRF AISEHack 2026, Phase 2, Theme 2 (IIT Delhi).

Su relevancia es doble: por un lado, ofrece un pipeline completo y reproducible para predicción de calidad del aire a escala regional con recursos modestos (un solo NVIDIA T4 por semilla, unos 51 minutos de entrenamiento); por otro, el estudio subyacente argumenta que el diseño del pipeline (features, normalización, calibración, ensemble) pesa más que la elección del backbone. El modelo no está pensado como servicio general de NLP, sino como componente especializado de forecasting numérico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional residual + ConvGRU + decoder U-Net (ResGRU-UNet) |
| Parametros totales | 7.122.113 por red; 5 redes en el ensemble (35.610.565 en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 10 horas de entrada; horizonte de prediccion de 16 horas |
| Tipos de cuantizacion | No disponible (pesos en safetensors de precision nativa) |
| Idiomas soportados | No aplica (modelo numerico, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (5 ficheros), mas `.npy` y `.npz` auxiliares |
| Entrada | 9 campos de 10 x 140 x 124 (PM2.5, q2, t2, u10, v10, pblh, psfc, swdown, rain) |
| Salida | Tensor (16, 140, 124) en ug/m3 |
| Rejilla espacial | 140 x 124 celdas, ~25 km, India (7.06-38.00 N, 67.79-97.93 E) |
| Libreria | PyTorch |
| Tamano del repositorio | 0.2 GB |

## Arquitectura y entrenamiento

La red apila los 20 canales de entrada (9 campos meteorologicos y de PM2.5, velocidad del viento, ventilacion, adveccion, tendencia de PM2.5, hora del dia codificada como sin/cos, anomalia diurna y 4 canales estaticos: latitud, longitud, climatologia de PM2.5 y dispersion residual STL) a lo largo de 10 horas, resultando en 200 canales de entrada. El encoder aplica bloques convolucionales residuales de 64, 128 y 256 canales hasta un cuello de botella de 256 canales a resolucion 18 x 16. Un ConvGRU itera 16 veces sobre ese cuello de botella, un paso por hora de horizonte, y cada estado se decodifica mediante un decoder U-Net de 128, 64 y 32 canales con conexiones skip del encoder. La salida se formula como el ultimo log(1 + PM2.5) observado mas el cambio predicho por horizonte, con `max(exp(output) - 1, 0)` como postproceso.

El entrenamiento usa datos de abril, julio, octubre y diciembre de 2016: 2.257 ventanas de entrenamiento y 214 de validacion (ultimo 18% de cada mes tras un hueco de 12 horas). La funcion de perdida combina 0.40 Huber en espacio logaritmico, 0.25 SMAPE global, 0.15 SMAPE por episodio y 0.20 (1 - correlacion por episodio). Se optimiza con AdamW (learning rate 2.5e-4, weight decay 1e-4), schedule one-cycle, 16 epocas, batch 4 y EMA 0.999, con aproximadamente 51 minutos por semilla en una NVIDIA T4. Las cinco redes se promedian en espacio de concentracion y cada horizonte se multiplica despues por su factor de calibracion ajustado en validacion.

## Capacidades

- Prediccion de PM2.5 superficial a 16 horas vista, con resolucion horaria y espacial de ~25 km sobre la India.
- Modelado conjunto de variables meteorologicas (humedad, temperatura, viento, altura de capa limite, presion, radiacion, lluvia) y de calidad del aire.
- Ensemble de cinco semillas con promedio en espacio de concentracion para reducir varianza.
- Calibracion por horizonte de prediccion (16 factores) para mejorar la metrica compuesta del reto.
- Estimacion de la hora del dia a partir de perfiles de luz solar y temperatura, con posibilidad de fijarla manualmente mediante `start_hour=`.
- Ejecucion en CPU por defecto o en GPU (`Forecaster(folder, "cuda")`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo numerico especializado.

## Casos de uso

- Prediccion operativa de calidad del aire regional: dado un cubo de 10 horas de campos meteorologicos y PM2.5 sobre la rejilla, generar el pronostico de 16 horas para alimentar boletines de alerta por contaminacion.
- Investigacion en modelos espacio-temporales: usar el pipeline publicado (features, normalizacion, calibracion, ensemble) como linea base reproducible para comparar backbones alternativos en forecasting de PM2.5.
- Evaluacion de escenarios meteorologicos: alimentar el modelo con campos WRF-Chem de escenarios sinteticos para estudiar la sensibilidad de la prediccion a viento, capa limite o lluvia.
- Docencia y formacion: el repositorio incluye `example_input.npz` climatologico y un `Forecaster` de uso directo, lo que permite demostrar un pipeline completo de forecasting convolucional en una sola GPU T4.
- Integracion en sistemas de gestion de episodios de contaminacion: la salida por horizonte y por celda permite identificar horas y zonas con mayor riesgo y activar protocolos.
- Benchmarking de calibracion: comparar `calibrate=True` frente a `calibrate=False` para estudiar el compromiso entre metrica compuesta (SMAPE, correlacion) y errores absolutos (MAE, RMSE, R2).
- Prototipado de servicios de prediccion en regiones con red de estaciones escasa: al trabajar sobre rejilla regular, cubre areas sin observaciones directas.

## Benchmarks y rendimiento

Resultados del estudio, sobre validacion y sobre el conjunto de test oculto de 2017 (218 ventanas) evaluado por el servidor del reto. La metrica es la media de (1 - SMAPE global / 2), (1 + correlacion por episodio) / 2 y (1 - SMAPE por episodio / 2).

| Pronostico | Val score | Test (privado) | Test (publico) |
|---|---:|---:|---:|
| seed 42 | 0.9158 | 0.8798 | 0.8924 |
| seed 1337 | 0.9152 | 0.8788 | 0.8930 |
| seed 1 | 0.9169 | 0.8796 | 0.8956 |
| seed 2 | 0.9178 | 0.8805 | 0.8951 |
| seed 3 | 0.9158 | 0.8810 | 0.8957 |
| ensemble de 5 semillas | 0.9193 | 0.8838 | 0.8975 |
| ensemble + calibracion | 0.9215 (in sample) | 0.8914 | 0.9056 |

En validacion, el ensemble de cinco semillas alcanza MAE 6.32 ug/m3, RMSE 18.04 ug/m3 y R2 0.892. La calibracion mejora la metrica compuesta pero empeora MAE, RMSE y R2, por lo que el autor recomienda `calibrate=False` cuando importan los errores absolutos o cuadraticos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~7,1 M de parametros por red; el ensemble completo de cinco redes ocupa del orden de decenas de MB en precision nativa, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entreno cada semilla en una NVIDIA T4 en unos 51 minutos. GPU como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes para inferencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU (el `Forecaster` usa CPU por defecto).
- Opciones de despliegue: PyTorch nativo mediante el `Forecaster` incluido en `model.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explicita; el coste dominante es el paso recurrente del ConvGRU (16 iteraciones) sobre un cuello de botella de 256 canales a 18 x 16, mas el decoder U-Net.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la informacion proporcionada. El estudio de referencia compara distintos backbones bajo el mismo pipeline, pero sus resultados no se detallan en la model card. Como referencia interna, la comparativa relevante es entre las cinco semillas y el ensemble con y sin calibracion:

| Variante | Parametros | Contexto de entrada | Horizonte | Val score | Test privado | Licencia |
|---|---:|---|---:|---:|---:|---|
| ResGRU-UNet (1 semilla) | 7,1 M | 10 h | 16 h | 0.9152-0.9178 | 0.8788-0.8810 | MIT |
| ResGRU-UNet (ensemble 5) | 35,6 M | 10 h | 16 h | 0.9193 | 0.8838 | MIT |
| ResGRU-UNet (ensemble + calibracion) | 35,6 M | 10 h | 16 h | 0.9215 (in sample) | 0.8914 | MIT |

## Limitaciones y advertencias

- Entrenado y evaluado sobre campos de simulacion WRF-Chem, no sobre observaciones de estaciones; el rendimiento en datos reales de sensores no esta validado.
- Cobertura limitada a una unica region (India) y a un unico ano de datos de entrenamiento (2016); la generalizacion a otros anos o regiones no esta demostrada.
- Las entradas deben estar en la misma rejilla de 140 x 124 y en las mismas unidades que los datos del reto; no hay adaptador para otras resoluciones.
- La hora del dia se estima a partir de la luz solar y la temperatura de las entradas, lo que introduce incertidumbre si esos perfiles no son representativos; puede fijarse con `start_hour=`.
- La calibracion por horizonte se ajusto en validacion (in sample en la tabla) y, aunque mejora la metrica compuesta, degrada MAE, RMSE y R2.
- Los datos del reto ANRF AISEHack 2026 no se incluyen en el repositorio y estan sujetos a sus propios terminos.
- El modelo no es linguistico: no admite prompts, tool calling ni razonamiento; cualquier uso fuera de forecasting numerico de PM2.5 es inadecuado.
- Riesgo de alucinacion en el sentido estadistico habitual: el modelo puede generar predicciones plausibles pero erroneas en regimenes no vistos (episodios extremos, cambios bruscos de emisiones).
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que implica ausencia de validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imvetri/resgru-unet-pm25
- Paper y codigo: https://github.com/Vetri-78640/pm2.5-backbone-study-pipeline-over-backbone
- Demo (Space): https://huggingface.co/spaces/imvetri/pm25-forecast-india
