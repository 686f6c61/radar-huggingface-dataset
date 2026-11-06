# pierrelouis-c/cfdu

## Resumen

CFD-U (*Crowd Flow Dynamics U-Net*) es un modelo neuronal que predice el mapa de densidad peatonal en régimen estacionario (ped/m²) en curvas de pasillo unidireccional, a partir de la geometría de la curva y del flujo de entrada. Lo desarrolla el autor independiente pierrelouis-c y actúa como sustituto (surrogate) de simulaciones de dinámica peatonal realizadas con JuPedSim: una única inferencia reemplaza una ejecución completa del simulador, lo que permite explorar interactivamente el espacio de parámetros de diseño.

El modelo es una U-Net compacta de 4 niveles (32-64-128-256 canales) con 1,93 M de parámetros por semilla, distribuida en formato ONNX (opset 18) junto con un ensemble de tres semillas entrenadas con ajustes idénticos. Trabaja sobre ventanas de 24 m × 24 m a 0,25 m/píxel (tensores de 96 × 96) y cinco canales de entrada que codifican la zona transitable, la distancia a pared, las máscaras de entrada y salida, y la carga específica en ped/(m·s).

Su relevancia es doble: por un lado, demuestra que una red de menos de 2 M de parámetros puede aproximar con error muy bajo (RMSE de 0,008 ped/m² en interpolación) la salida de un simulador basado en agentes, abriendo la puerta a herramientas de diseño arquitectónico interactivas; por otro, es un ejemplo reproducible de sustitución de simuladores físicos por modelos neuronales ligeros desplegables en navegador mediante ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de 4 niveles (32-64-128-256 canales), image-to-image |
| Parametros totales | 1,93 M por semilla; ensemble de 3 semillas en un único grafo ONNX |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 5 × 96 × 96 (ventana de 24 m × 24 m a 0,25 m/píxel) |
| Tipos de cuantizacion | float32 (23 MB) y float16 con cómputo float32 (12 MB) |
| Idiomas soportados | en (etiqueta de idioma; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18) |
| Salida | float32 [3, 96, 96], un mapa de densidad (ped/m²) por semilla |
| Dataset de entrenamiento | pierrelouis-c/aporia-bends (v2) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica de cuatro niveles de profundidad con anchos de 32, 64, 128 y 256 canales, diseñada para mapear píxel a píxel los cinco canales de entrada a un mapa de densidad. La normalización de entrada, la activación softplus y el enmascarado por pared están integrados dentro del grafo ONNX, de modo que el consumidor solo debe construir los canales exactamente como lo hace `aporia.rasterize` y recibe directamente densidades en ped/m². El ensemble agrupa tres semillas (0, 1 y 2) en un único grafo; la media de las tres es la predicción y la desviación típica entre semillas sirve como medida de desacuerdo.

El entrenamiento se realizó sobre el dataset v2, compuesto por 1.500 curvas simuladas (variando ángulo, anchura, corte de esquina interior y flujo) con dos semillas de simulación cada una, de las que se aceptaron 1.466. Los splits son 896 de entrenamiento, 112 de validación, 111 de test de interpolación y 347 de test de extrapolación. El simulador de referencia fue JuPedSim 1.4.2 con el modelo de velocidad libre de colisiones, calibrado contra experimentos. El ajuste usó 300 épocas, AdamW (lr 2e-3, weight decay 1e-4, 5 épocas de warm-up), batch de 16, autocast en float16 y una única RTX 2060; la función de pérdida es MSE sobre los píxeles transitables y el checkpoint se seleccionó por RMSE de validación.

## Capacidades

- Predicción de mapas de densidad peatonal estacionaria (ped/m²) en curvas de pasillo unidireccional a partir de geometría y flujo de entrada.
- Estimación de incertidumbre mediante la desviación típica entre las tres semillas del ensemble.
- Generalización a ángulos de curva no vistos en entrenamiento (extrapolación de 120° a 150°).
- Inferencia rápida en CPU o GPU vía ONNX Runtime, con variante float16 de 12 MB apta para ejecución en navegador.
- Salida enmascarada al interior del pasillo (densidad 0 fuera de la zona transitable).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de texto o visión natural; su dominio es exclusivamente numérico-geométrico.

## Casos de uso

- Diseño arquitectónico interactivo: un estudio puede variar ángulo, anchura y flujo de una curva de pasillo y obtener el mapa de densidad en milisegundos, sustituyendo ejecuciones de JuPedSim que tardarían mucho más, lo que permite iterar sobre el diseño en tiempo real.
- Evaluación de seguridad en evacuaciones: estimar la densidad máxima esperada en curvas de un edificio y compararla con los niveles de servicio de Fruin para detectar cuellos de botella antes de construir.
- Herramienta educativa en dinámica peatonal: el demo en navegador permite a estudiantes visualizar cómo cambia el patrón de densidad al modificar la geometría, sin instalar un simulador.
- Precribado de configuraciones para simulación completa: usar CFD-U para descartar rápidamente geometrías con densidad alta y reservar las simulaciones caras de JuPedSim solo para los candidatos prometedores.
- Análisis de sensibilidad y estudios paramétricos: recorrer sistemáticamente el espacio (ángulo, anchura, corte, flujo) y cuantificar la incertidumbre del modelo mediante la dispersión entre semillas.
- Integración en pipelines de diseño generativo: incorporar el modelo como función de coste rápida en bucles de optimización de planta que penalicen densidades excesivas en curvas.
- Validación cruzada de simuladores: comparar la salida de JuPedSim con la predicción del surrogate para detectar configuraciones donde el simulador se desvía de su comportamiento esperado.

## Benchmarks y rendimiento

RMSE en ped/m² sobre píxeles transitables, media de las tres semillas. Interpolación: θ 30–120°; extrapolación: θ 120–150° (ángulos nunca vistos en entrenamiento).

| Metodo | RMSE (interp. / extrap.) | Error de pico p99 | Nivel Fruin de pico correcto |
|---|---|---|---|
| Baseline de continuidad | 0,200 / 0,248 | 39 % / 51 % | 23 % / 16 % |
| Vecino más cercano | 0,158 / 0,307 | 10 % / 17 % | 84 % / 73 % |
| CFD-U | 0,008 / 0,077 | 1,2 % / 8,5 % | 99 % / 83 % |

El ruido entre semillas de simulación (suelo de ruido) es de 0,0023 ped/m² en interpolación y 0,0079 ped/m² en extrapolación, lo que sitúa el error de CFD-U en interpolación muy cerca de ese suelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (modelo de 23 MB); la variante float16 ocupa 12 MB en disco.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; el entrenamiento se hizo en una RTX 2060, por lo que la inferencia es viable en GPUs consumer muy modestas (GTX 1650, RTX 3050, etc.).
- Cabe holgadamente en cualquier GPU consumer e incluso en CPU; la variante float16 está pensada para ejecución en navegador.
- Opciones de despliegue: ONNX Runtime (Python, C++, JS/Web), con ejecución en navegador demostrada en el demo del autor.
- Latencia y throughput: no se han publicado cifras concretas de latencia o throughput en la información disponible; el tamaño del modelo sugiere inferencia en el orden de milisegundos, pero no se confirma con datos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de sustitución de simuladores peatonales con los que establecer una comparativa directa. La model card únicamente compara contra baselines no neuronales (continuidad y vecino más cercano), recogidos en la sección de benchmarks.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| CFD-U | 1,93 M por semilla (ensemble de 3) | 5 × 96 × 96 fijo | MIT | ONNX en Hugging Face |
| Alternativas neuronales comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: solo curvas de pasillo unidireccional; no modela flujos bidireccionales, intersecciones, obstáculos arbitrarios ni geometrías fuera de la ventana de 24 m × 24 m.
- El modelo es un surrogate de JuPedSim 1.4.2 con un modelo de velocidad libre de colisiones concreto; hereda los sesgos y simplificaciones de ese simulador y no debe interpretarse como verdad física.
- El error crece en extrapolación (RMSE 0,077 frente a 0,008 en interpolación) y el error de pico p99 sube al 8,5 %, por lo que las predicciones fuera del rango de ángulos entrenado deben tratarse con cautela.
- La incertidumbre entre semillas es una medida de desacuerdo del ensemble, no una garantía de calibración frente a datos reales.
- Requiere construir los canales de entrada exactamente como `aporia.rasterize`; cualquier desviación en la rasterización invalida las predicciones.
- Licencia MIT, que permite uso comercial, pero el autor no ofrece garantías sobre idoneidad para decisiones de seguridad crítica.
- Idioma: etiquetado solo para inglés; no procesa texto, por lo que la limitación lingüística es nominal.
- Sin descargas ni likes en el momento de la consulta y con un único autor; no hay evidencia de validación independiente fuera de la documentación del propio repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pierrelouis-c/cfdu
- Dataset: https://huggingface.co/datasets/pierrelouis-c/aporia-bends
- Demo en navegador: https://aporia.pierrelouis.net/demo/
- JuPedSim (simulador de referencia): https://github.com/PedestrianDynamics/jupedsim
- Informe de validación: `docs/validation-report.md` en el repositorio del proyecto (no se proporciona URL directa en la información disponible)
