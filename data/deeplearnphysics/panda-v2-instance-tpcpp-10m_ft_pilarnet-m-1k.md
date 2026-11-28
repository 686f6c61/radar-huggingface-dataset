# DeepLearnPhysics/panda-v2-instance.tpcpp-10m_ft_pilarnet-m-1k

## Resumen

Panda V2 es un detector de segmentación de instancias diseñado específicamente para física de partículas, desarrollado por el grupo DeepLearnPhysics. Este checkpoint concreto parte del encoder `panda-v2.tpcpp-10m`, preentrenado sobre el conjunto TPCpp-10M, y lo adapta mediante LoRA (rango 16) junto con la cabeza de detección, afinándolo sobre 1.000 eventos etiquetados del dataset PILArNet-M. El resultado son los pesos evaluados en el split de test del artículo asociado, correspondientes al mejor checkpoint de validación de la ejecución `panda-v2-lar-n1000-from-sphenix`.

El modelo resuelve la tarea de segmentación de instancias sobre nubes de puntos tridimensionales generadas por detectores de proyección temporal (TPC, Time Projection Chamber), un problema central en experimentos como DUNE o ProtoDUNE, donde es necesario separar las trazas y cascadas de partículas individuales dentro de una nube de puntos de eventos de colisión. Frente a enfoques genéricos de visión 3D, Panda V2 incorpora sesgos inductivos propios del dominio: geometría del detector, estructura de la señal y convenciones de las reconstrucciones de física de partículas.

El modelo tiene 60.427.164 parámetros totales (unos 60,4 millones), se distribuye en safetensors y se carga mediante la librería `pimm` (particle-imaging-models). Su relevancia actual radica en que ofrece un punto de partida afinado y reproducible para segmentación de instancias en TPC, con un coste computacional moderado y un flujo de adaptación vía LoRA que permite reajustarlo a nuevos detectores o conjuntos de datos con pocos eventos etiquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (`panda-detector-v2m1`) con encoder `panda-v2.tpcpp-10m` y cabeza de segmentacion de instancias sobre nube de puntos |
| Parametros totales | 60.427.164 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sobre nube de puntos, no secuencial) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria de carga | pimm |
| Adaptacion | LoRA de rango 16 sobre el encoder, cabeza afinada |
| Dataset de ajuste | 1.000 eventos etiquetados de PILArNet-M |
| Dataset de preentrenamiento | TPCpp-10M |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Panda V2 para deteccion y segmentacion de instancias en nubes de puntos, con un encoder `panda-v2.tpcpp-10m` preentrenado sobre el corpus TPCpp-10M y una cabeza de deteccion especifica para producir instancias. La adaptacion al dominio objetivo se realiza en dos fases: primero se insertan adaptadores LoRA de rango 16 sobre el encoder preentrenado y, a continuacion, se afina el conjunto (encoder con LoRA y cabeza) sobre 1.000 eventos etiquetados de PILArNet-M. Este esquema de bajo rango reduce el numero de parametros entrenables y permite reutilizar el preentrenamiento a gran escala con un presupuesto de anotacion muy limitado.

El checkpoint publicado corresponde al mejor punto de validacion de la ejecucion `panda-v2-lar-n1000-from-sphenix`, y es el que se evalua en el split de test del articulo. No se detalla en la informacion disponible el numero exacto de tokens o puntos procesados durante el preentrenamiento, la composicion completa de TPCpp-10M ni si se emplearon tecnicas adicionales de aumento de datos o funciones de perdida especificas mas alla de las propias de Panda V2. El modelo admite distintos backends de atencion: por defecto utiliza FlashAttention y, en GPUs sin soporte, debe indicarse `attention_backend="torch"` al cargar.

## Capacidades

- Segmentacion de instancias en nubes de puntos 3D procedentes de detectores TPC.
- Deteccion de objetos (trazas y cascadas de particulas) con asignacion de instancias.
- Inferencia sobre lotes de eventos mediante la API `pimm.from_pretrained(...)` y llamada directa `model(batch)`.
- Adaptacion a nuevos dominios o detectores mediante LoRA, reutilizando el encoder preentrenado.
- Ejecucion en GPU con FlashAttention o, en su defecto, con el backend de atencion de PyTorch.
- No soporta generacion de texto, tool calling, agentes, vision natural ni capacidades multilingues: es un modelo puramente de vision 3D para fisica de particulas.

## Casos de uso

- Reconstruccion de eventos en TPC: el modelo recibe la nube de puntos de un evento y devuelve las instancias de particulas, lo que permite separar trazas individuales antes del analisis cinemático en experimentos tipo DUNE o ProtoDUNE.
- Etiquetado asistido de nuevos datos: al ser un modelo afinado con solo 1.000 eventos, sirve como anotador automatico preliminar para reducir el esfuerzo humano en campañas de etiquetado de nuevos conjuntos de física de particulas.
- Transferencia a nuevos detectores: gracias a los adaptadores LoRA de rango 16, se puede reajustar el encoder a un detector distinto con un presupuesto de datos reducido, manteniendo el preentrenamiento sobre TPCpp-10M.
- Control de calidad y monitorizacion: la segmentacion por instancias permite comparar la salida del modelo con la reconstruccion oficial y detectar eventos problematicos o desviaciones en la respuesta del detector.
- Investigacion en métodos de segmentacion 3D: sirve como baseline reproducible (pesos públicos, configuración de evaluación documentada) para comparar nuevas arquitecturas de segmentación de instancias sobre nubes de puntos.
- Pipelines de análisis offline: puede integrarse en flujos por lotes que procesan eventos almacenados, dado su tamaño moderado (60,4 M de parámetros) y su formato safetensors compatible con la librería pimm.
- Simulación y estudios de sensibilidad: permite generar etiquetas de instancias sobre eventos simulados para estimar el impacto de la segmentación en la resolución de energía o en la identificación de partículas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que estos pesos son los evaluados en el split de test del artículo, pero no se incluyen cifras concretas (IoU, precisión de instancias, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 60,4 M de parámetros, los pesos en precisión nativa (fp32) ocupan aproximadamente 240 MB; en fp16 alrededor de 120 MB. El consumo real de VRAM depende del tamaño del lote de nubes de puntos y del backend de atención, por lo que no se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte de FlashAttention (por ejemplo, A100, H100 o RTX 4090) para el backend por defecto; en GPUs sin FlashAttention debe usarse `attention_backend="torch"`.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros; se recomienda al menos una GPU con suficiente memoria para el lote de puntos de entrada (no se especifica el mínimo exacto).
- Opciones de despliegue: carga mediante la librería `pimm` (`pimm.from_pretrained`), con soporte de dispositivo `cuda`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de segmentación de instancias para física de partículas ni con alternativas genéricas de visión 3D, por lo que no se pueden ofrecer cifras de parámetros, contexto o rendimiento frente a competidores.

## Limitaciones y advertencias

- Modelo de dominio específico: no es un modelo de lenguaje ni de visión general; solo es aplicable a nubes de puntos de detectores TPC.
- Afinado con solo 1.000 eventos: la cobertura de configuraciones de eventos poco frecuentes puede ser limitada y el rendimiento puede degradarse fuera de la distribución de PILArNet-M.
- Riesgo de predicciones incorrectas en eventos con alta superposición de trazas o con ruido de detector, propio de la tarea de segmentación de instancias.
- Dependencia de las transformaciones de evaluación del repositorio `pimm` (`configs/panda/v2/finetune/_base_/datasets/lartpc.py`); un preprocesado distinto puede invalidar los resultados.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución; conviene contactar con el autor antes de usarlo en producción.
- Idiomas no aplicables; no se documentan sesgos sociales, pero sí posibles sesgos hacia la geometría y las condiciones del detector de entrenamiento.
- No se documentan requisitos mínimos de versión de `pimm`, CUDA ni PyTorch; la compatibilidad con GPUs sin FlashAttention requiere configuración explícita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.tpcpp-10m_ft_pilarnet-m-1k
- Encoder preentrenado: https://huggingface.co/DeepLearnPhysics/panda-v2.tpcpp-10m
- Repositorio de la libreria pimm: https://github.com/DeepLearnPhysics/particle-imaging-models
