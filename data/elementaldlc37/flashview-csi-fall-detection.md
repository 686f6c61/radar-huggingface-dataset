# ElementalDLC37/flashview-csi-fall-detection

## Resumen

FlashView CSI Fall Detection es un modelo supervisado de deteccion de caidas a partir de Channel State Information (CSI) de Wi-Fi, capturado con un ESP32-S3. Lo desarrolla Rui Lucas Anthony Gomes (usuario ElementalDLC37) en el contexto de un proyecto integrador del Bachillerato en Sistemas de Informacion de UNIPAR. No es un modelo de lenguaje: es una red CNN 1D + LSTM entrenada en TensorFlow/Keras que clasifica ventanas de 30 tramas de CSI en dos clases (caida / no caida). Se distribuye tambien convertido a TensorFlow.js para inferencia local en navegador sin servidor.

El modelo es relevante no por su rendimiento absoluto, sino por la honestidad metodologica de su evaluacion. El autor publica explicitamente el resultado real con split por sesion (AUC-ROC 0,520, F1 0,143), muy inferior al resultado en entrenamiento (AUC-ROC 0,886, F1 0,729). El diagnostico es claro: el modelo memoriza el componente estatico del entorno (background DC) en lugar del movimiento, un fenomeno conocido en la literatura de wireless sensing. La version v1 esta declarada en validacion y el autor describe los proximos pasos para la v2.

El repositorio es de tamano minimo (0,0 GB reportados), con 13 descargas y 0 likes en el momento de la consulta. La licencia es MIT y los idiomas declarados en la model card son portugues e ingles, aunque esto se refiere a la documentacion, no a capacidades linguisticas del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D + LSTM (TensorFlow/Keras) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 30 tramas x 64 features LLTF |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de clasificacion de senales, no linguistico) |
| Licencia | MIT |
| Formato de pesos | `.keras` (Keras nativo) y TensorFlow.js (`model.json` + pesos) |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D seguida de una LSTM que opera sobre ventanas de 30 tramas de CSI con normalizacion por trama. La entrada tiene 64 features LLTF (Legacy Long Training Field) por trama, resultando en un tensor de entrada de forma `(batch, 30, 64)`. La salida es binaria (probabilidad de no caida y de caida). El entrenamiento uso `class_weight` para compensar el desbalance de clases, early stopping y un total de 13 epocas.

El dataset consta de 39.690 tramas de CSI agrupadas en 1.321 ventanas (346 positivas), provenientes de 5 sesiones con 128 eventos de caida rotulados. Los datos se capturaron con un unico sujeto (auto-experimento) en 2 ambientes, a una cadencia estable de 33,3 fps en todas las sesiones. El etiquetado se anclo a la ventana `[toque - 2 s, toque + 0,5 s]` y se realizo mediante vision computacional, lo que el autor reconoce como posible fuente de error sistematico. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion binaria de caidas a partir de senales CSI de Wi-Fi (caida / no caida).
- Procesamiento de ventanas temporales de 30 tramas con 64 features LLTF.
- Inferencia en navegador mediante TensorFlow.js, sin necesidad de servidor.
- Inferencia en dispositivo edge (el proyecto usa ESP32-S3 para captura; el modelo se ejecuta en el dashboard).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no es un modelo linguistico).
- No dispone de modo thinking, vision, audio ni otras capacidades generativas.

## Casos de uso

- Deteccion de caidas en el hogar para personas mayores: el modelo se integraria en un sistema de monitorizacion pasiva que usa la senal Wi-Fi existente para detectar caidas sin camaras ni wearables, aunque la v1 actual no generaliza entre sesiones y requeriria reentrenamiento por entorno.
- Investigacion en wireless sensing: sirve como caso de estudio reproducible de sobreajuste al background DC, util para comparar tecnicas de aumento de datos y eliminacion del componente estatico.
- Prototipado de sistemas edge con ESP32-S3: el pipeline completo (firmware PlatformIO, API de ingestion en Bun/Elysia con PostgreSQL, dashboard con TF.js) es reutilizable como base para otros proyectos de HAR (Human Activity Recognition).
- Docencia y formacion en evaluacion de modelos: el contraste entre split intra-sesion (AUC 0,827) y split por sesion (AUC 0,520) es un ejemplo didactico de fuga de datos y de la importancia de particionar por sesion.
- Monitorizacion en residencias o entornos controlados: si se reentrena con datos del entorno especifico, podria desplegarse en un espacio concreto con validacion previa, dado que la especificidad reportada es 0,883.
- Base para la v2: el autor planea aumento temporal (`randomCircularRotation`, `randomResizedCrop`) y eliminacion del componente DC mediante un gate de varianza temporal, lo que permitiria reutilizar la arquitectura y el pipeline existentes.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor en la model card, con split por sesion (la sesion de test no aparece en entrenamiento) y limiar elegido en entrenamiento.

| Regimen | AUC-ROC | Acurácia balanceada | F1 |
|---|---|---|---|
| Entrenamiento (mismas sesiones) | 0,886 | 0,828 | 0,729 |
| Test (sesion no vista) | 0,520 | 0,495 | 0,143 |

Detalle del test: TP 12, FP 44, TN 332, FN 100, sensibilidad 0,107, especificidad 0,883, con 468 falsos positivos por hora. En split intra-sesion con corte temporal y embargo, el AUC alcanza 0,827; entre sesiones cae a 0,506-0,787. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es de tamano reducido (repositorio de 0,0 GB) y probablemente cabe en memoria de cualquier GPU consumer, pero no se especifica.
- GPU recomendadas: no disponible; el autor no documenta requisitos de GPU.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se confirma en la informacion.
- Opciones de despliegue: TensorFlow/Keras (Python) y TensorFlow.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de deteccion de caidas via CSI ni con alternativas de HAR. La model card cita literatura (Strohmayer & Kampel 2024; Wang et al. 2025; Gao, Liu & Li 2023; Wang et al. 2026) como referencia metodologica, pero no ofrece una tabla comparativa de rendimiento frente a otros sistemas.

## Limitaciones y advertencias

- Un solo sujeto: no hay validacion entre personas, por lo que el modelo no puede asumirse valido para otros individuos.
- Dos ambientes: la generalizacion espacial no esta demostrada y el sobreajuste al background DC hace que el rendimiento caiga drasticamente al cambiar de sala o de posicion.
- Sesion de test corta (442 s): el intervalo de confianza de las metricas es amplio.
- No es un modelo de lenguaje: es un clasificador supervisado clasico (CNN-LSTM), sin capacidades generativas ni de razonamiento.
- Etiquetado por vision computacional: la rotulacion automatica puede contener error sistematico.
- Alto indice de falsos positivos: 468 por hora en test, lo que lo hace inadecuado para produccion sin reentrenamiento y validacion en el entorno objetivo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias de rendimiento; el uso en produccion requiere validacion independiente.
- Version v1 declarada en validacion: el autor recomienda esperar a la v2 para mejoras de generalizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ElementalDLC37/flashview-csi-fall-detection
- Referencia: Strohmayer & Kampel (2024), aumento en CSI y transferencia entre escenarios (no se proporciona URL).
- Referencia: Wang et al. (2025), survey de generalizacion en wireless sensing (no se proporciona URL).
- Referencia: Gao, Liu & Li (2023), aumento para series temporales (no se proporciona URL).
- Referencia: Wang et al. (2026), Dynamic Variance Gate para deteccion de caidas cross-domain (no se proporciona URL).
- No se han proporcionado enlaces a paper, blog, repositorio de codigo ni demo adicionales en la informacion disponible.
