# MisterWhit312/samid-drone-detector

## Resumen

Samid drone detector es un modelo de clasificación de audio binaria que distingue entre presencia y ausencia de drones a partir de senales acusticas. Lo desarrolla MisterWhit312 (publicado tambien bajo el identificador Rashidbm) y se distribuye en HuggingFace con licencia MIT. El modelo parte del backbone MIT/ast-finetuned-audioset-10-10-0.4593, un Audio Spectrogram Transformer preentrenado en AudioSet, y se ha ajustado fino para la tarea concreta de deteccion de drones.

Con 86,19 millones de parametros y un peso de repositorio de 0,3 GB, es un modelo ligero pensado para inferencia en ventanas de audio de 1 segundo a 16 kHz mono. Resuelve un problema especifico y de interes creciente: la deteccion acustica pasiva de UAV en entornos urbanos, industriales o de seguridad, donde la senal de radio o la vision pueden no estar disponibles.

Es relevante ahora porque combina un backbone transformer de audio bien conocido con un pipeline de aumentacion de datos relativamente agresivo (codec round-trip, RIR sintetico, SpecAugment, Mixup, ruido urbano asimetrico), lo que apunta a robustez frente a condiciones reales de captura. La model card reporta resultados muy altos en conjuntos de validacion, aunque con muestras de test pequenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), transformer sobre espectrogramas |
| Parametros totales | 86.190.338 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de inferencia de 1,0 s a 16 kHz mono) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada; la tarea es acustica, no linguistica) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | audio-classification |
| Clases de salida | 2 (drone / no-drone) |
| Frecuencia de muestreo | 16 kHz mono |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un Audio Spectrogram Transformer: la senal de audio se convierte en un espectrograma que se parchea y se procesa con un transformer estandar con atencion global. El backbone de partida es MIT/ast-finetuned-audioset-10-10-0.4593, preentrenado en AudioSet, y la cabeza de clasificacion se ha reajustado a dos clases (drone / no-drone). Con 86,19 M de parametros, el coste computacional es moderado y compatible con despliegue en CPU para audio corto.

El ajuste fino utiliza dos conjuntos de datos: geronimobasso/drone-audio-detection-samples y ahlab-drone-project/DroneAudioSet (splits 1-20). La model card detalla un esquema de aumentacion simetrico entre clases que incluye codec round-trip, RIR sintetico, EQ aleatorio, FilterAugment, Patchout, SpecAugment y Mixup, ademas de una superposicion asimetrica de ruido urbano solo sobre la clase drone. No se especifica el numero de tokens ni de horas de audio de entrenamiento, ni si hubo etapas de RLHF o DPO (no aplicables a una tarea de clasificacion).

## Capacidades

- Clasificacion binaria de audio: distingue presencia de dron frente a ausencia en ventanas de 1,0 s.
- Deteccion acustica pasiva: no requiere senal de radio, vision ni telemetria del UAV.
- Robustez declarada frente a codecs, reverberacion, ecualizacion y ruido urbano gracias al esquema de aumentacion.
- Procesamiento por ventana deslizante: la model card recomienda ventana de 1 s con hop de 0,5 s, filtro de mediana sobre probabilidades y exigencia de N ventanas consecutivas por encima del umbral.
- Integracion con el ecosistema Transformers: `AutoModelForAudioClassification` y `AutoFeatureExtractor`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto: es un clasificador de audio.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Vigilancia perimetral en instalaciones criticas: desplegar el modelo sobre microfonos fijos y activar alertas cuando N ventanas consecutivas superen el umbral, aprovechando la ventana deslizante de 1 s con hop de 0,5 s.
- Deteccion de UAV en entornos urbanos: usar el entrenamiento con ruido urbano superpuesto a la clase drone para reducir falsos positivos en calles y plazas con trafico y obra.
- Monitorizacion de seguridad en eventos multitudinarios: procesar flujos de audio en tiempo casi real en hardware modesto gracias a los 86 M de parametros.
- Proteccion de infraestructura aeroportuaria: complementar radar y RF con una capa acustica pasiva que no depende de lineas de vision ni de cooperacion del operador del dron.
- Investigacion en bioacustica y ecologia: reutilizar el pipeline de ventana deslizante y el clasificador como base para experimentos de deteccion de fuentes sonoras en campo.
- Filtrado previo en pipelines de analisis forense de audio: reducir horas de grabacion a segmentos candidatos con presencia de dron antes de una revision manual.
- Prototipado y pruebas de concepto en edge: el tamano de 0,3 GB y la inferencia sobre 1 s de audio permiten ejecucion en SBC o portatiles sin GPU dedicada.

## Benchmarks y rendimiento

| Test | Resultado reportado |
|---|---|
| NUS DroneAudioSet held-out (48 clips) | 100% de deteccion |
| Geronimobasso sanity (50 clips aleatorios) | 24/25 drone, 25/25 no-drone |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de audio estandar (por ejemplo, AudioSet mAP) en la informacion disponible. Las cifras anteriores proceden de la model card del autor y se basan en conjuntos de test pequenos (48 y 50 clips), por lo que deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,35 GB solo para pesos (86,19 M de parametros), mas activaciones del espectrograma; en la practica cabe en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,17 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo; tambien es viable en CPU.
- Cabe en GPU consumer: si, incluidas GTX 1650 o inferiores con suficiente RAM del sistema.
- Opciones de despliegue: Transformers con PyTorch (referencia de la model card), exportacion a ONNX Runtime para edge, TorchScript o integracion en servicios FastAPI. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de audio de este tamano).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware y del numero de ventanas de 1 s a procesar; el coste por ventana es bajo por el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samid drone detector (este modelo) | 86,19 M | ventana de 1,0 s a 16 kHz | Clasificacion binaria drone/no-drone | MIT | HuggingFace |
| MIT/ast-finetuned-audioset-10-10-0.4593 | no disponible en la informacion | espectrograma AudioSet | Clasificacion multi-etiqueta AudioSet (527 clases) | no disponible en la informacion | HuggingFace |
| Modelos de deteccion acustica de drones de la literatura | no disponible | variable | Deteccion binaria o multi-clase | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a la naturaleza de la tarea y al backbone de partida.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo puede dispararse con sonidos de rotor similares (helicopteros, ventiladores industriales, motosierras), tal como advierte la model card.
- Riesgo de falsos positivos en entornos con maquinaria rotativa o trafico denso; se recomienda umbral alto y regla de N ventanas consecutivas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en audio fuera de distribucion.
- Limitaciones de contexto: entrenado exclusivamente con ventanas de 1,0 s a 16 kHz mono; audio de otra duracion, frecuencia de muestreo o numero de canales requiere remuestreo y troceado.
- Limitaciones de idioma: la etiqueta "en" es meramente declarativa; el modelo no procesa lenguaje, solo acustica.
- Resultados de benchmark con muestras muy pequenas (48 y 50 clips): no permiten estimar con fiabilidad la tasa de falsos positivos en produccion.
- Restricciones de licencia: MIT permite uso comercial, modificacion y redistribucion con atribucion; no se declaran restricciones adicionales.
- Caveat de produccion: no se documentan calibracion de probabilidades, umbrales recomendados ni evaluacion en dominios distintos a los de entrenamiento.
- El repositorio muestra discrepancias entre el ID del modelo (MisterWhit312/samid-drone-detector) y el identificador usado en el codigo de la model card (Rashidbm/samid-drone-detector); conviene verificar cual es el repositorio activo antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/MisterWhit312/samid-drone-detector
- Backbone: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset: https://huggingface.co/datasets/geronimobasso/drone-audio-detection-samples
- Dataset: https://huggingface.co/datasets/ahlab-drone-project/DroneAudioSet
- Script de inferencia: `scripts/standalone_inference.py` dentro del repositorio del modelo
- Paper del backbone AST: no disponible en la informacion proporcionada
