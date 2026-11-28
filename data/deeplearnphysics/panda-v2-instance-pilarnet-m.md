# DeepLearnPhysics/panda-v2-instance.pilarnet-m

## Resumen

`panda-v2-instance.pilarnet-m` es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics. Se construye sobre el codificador `panda-v2.pilarnet-m`, preentrenado en el conjunto de datos PILArNet-M, y añade una cabeza de detección para producir instancias (partículas individuales) a partir de nubes de puntos tridimensionales generadas por detectores de tiempo de proyección (TPC) de argón líquido. El modelo forma parte del detector Panda V2 (`panda-detector-v2m1`) y se ha ajustado con LoRA de rango 16 sobre el codificador, junto con la cabeza, usando 1 millón de eventos etiquetados de PILArNet-M.

El modelo resuelve una tarea central en el análisis de datos de experimentos como DUNE o ProtoDUNE: identificar y separar las trazas de partículas cargadas que se cruzan en el volumen sensible del detector. A diferencia de los enfoques tradicionales de reconstrucción, que dependen de algoritmos geométricos y de umbrales, este modelo aprende a agrupar puntos de la nube en instancias de forma diferenciable, lo que facilita su integración en pipelines de reconstrucción basados en aprendizaje profundo.

La relevancia actual del modelo radica en su carácter abierto (pesos en safetensors, integración con la librería `pimm`) y en su tamaño contenido (60,4 millones de parámetros, 0,2 GB), lo que permite desplegarlo en GPU de gama alta convencional. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas ni resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre nubes de puntos (point-cloud) con codificador `panda-v2.pilarnet-m` y cabeza de segmentación de instancias; adaptación LoRA de rango 16 |
| Parametros totales | 60.427.164 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sobre nubes de puntos, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Tamano del repositorio | 0,2 GB |
| Entrada | Nubes de puntos 3D de eventos de detector TPC |
| Salida | Instancias segmentadas (partículas) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un codificador de nubes de puntos (`panda-v2.pilarnet-m`) preentrenado en PILArNet-M, y una cabeza de segmentación de instancias que produce las máscaras de partículas. Sobre el codificador se aplica una adaptación LoRA de rango 16, lo que reduce el número de parámetros entrenables y permite un ajuste fino eficiente. El conjunto de ajuste consta de 1 millón de eventos etiquetados de PILArNet-M, y los pesos publicados corresponden al mejor checkpoint de validación del run `panda-v2-lar-n1m-fp16`, evaluado sobre el split de test del artículo asociado.

No se dispone de información detallada sobre la composición exacta del dataset, el número de tokens (no aplica, al tratarse de nubes de puntos), ni sobre si se emplearon técnicas de RLHF o DPO (no aplicables en este dominio). La model card menciona el uso de FlashAttention en GPU compatibles y la posibilidad de usar el backend `torch` en GPUs sin soporte de FlashAttention, lo que sugiere que el codificador incorpora mecanismos de atención sobre los puntos. No se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación de instancias en nubes de puntos 3D procedentes de detectores TPC de argón líquido.
- Identificación y separación de trazas de partículas individuales en eventos con múltiples partículas.
- Integración con la librería `pimm` mediante `pimm.from_pretrained`.
- Ejecución en GPU con backend FlashAttention o `torch` según disponibilidad.
- Adaptación LoRA de rango 16 sobre el codificador, lo que permite ajustes posteriores con coste reducido.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües: es un modelo específico de visión 3D para física de partículas.

## Casos de uso

- Reconstrucción de eventos en experimentos de argón líquido: el modelo separa las trazas de partículas cargadas en un evento TPC, lo que permite reconstruir vértices e identificar partículas individuales en análisis de oscilación de neutrinos.
- Etiquetado automático de datos de simulación: se puede usar para generar máscaras de instancias sobre eventos simulados de PILArNet-M y comparar con la verdad fundamental, acelerando la validación de pipelines de reconstrucción.
- Preprocesado para clasificación de partículas: las instancias segmentadas se pueden pasar a un clasificador posterior (por ejemplo, para distinguir electrones, muones o piones) en un pipeline de dos etapas.
- Control de calidad en detectores: la segmentación permite detectar eventos con trazas solapadas o mal reconstruidas, útiles para monitorizar el rendimiento del detector en línea.
- Ajuste fino con LoRA sobre nuevos datos: gracias a la adaptación LoRA de rango 16, un grupo puede reentrenar el modelo sobre datos de un detector concreto con recursos moderados.
- Investigación en métodos de aprendizaje profundo para física de partículas: sirve como referencia reproducible para comparar arquitecturas de segmentación de instancias en nubes de puntos.
- Despliegue en GPU de gama alta para inferencia por lotes: con 60,4 millones de parámetros y 0,2 GB de pesos, cabe en GPUs como RTX 4090 o A100 para procesar lotes de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 60,4 millones de parámetros en fp16, los pesos ocupan aproximadamente 0,12 GB, por lo que la VRAM necesaria vendrá dominada por el tamaño del lote y las activaciones de la nube de puntos.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, es viable en GPUs con soporte de FlashAttention (A100, H100) y en GPUs consumer como RTX 4090.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3090, RTX 4090 y similares, aunque el requisito real depende del tamaño del lote y de la resolución de la nube de puntos.
- Opciones de despliegue: librería `pimm` (con `pimm.from_pretrained`), backend FlashAttention o `torch`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de segmentación de instancias en nubes de puntos para física de partículas, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es necesario contactar con el autor antes de usarlo en producción.
- Modelo específico de dominio: solo es aplicable a nubes de puntos de detectores TPC de argón líquido; no sirve para texto, imagen 2D ni otros dominios.
- Dependencia de la configuración de entrada: la model card exige usar las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/lartpc.py` en `pimm`; un preprocesado distinto puede degradar los resultados.
- Requiere FlashAttention o el backend `torch`: en GPUs sin FlashAttention hay que pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- Riesgo de sesgo hacia la distribución de PILArNet-M: el ajuste se hizo con 1 millón de eventos de ese conjunto, por lo que el rendimiento en otros detectores o condiciones puede ser inferior.
- Riesgo de alucinación en el sentido de instancias espurias: como todo modelo de segmentación, puede generar máscaras falsas en regiones con bajo nivel de señal; se recomienda validación con métricas de física (eficiencia y pureza).
- Sin datos de benchmarks publicados en la información disponible: no se puede evaluar su rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que limita el soporte comunitario.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DeepLearnPhysics/panda-v2-instance.pilarnet-m)
- [Codificador base panda-v2.pilarnet-m](https://huggingface.co/DeepLearnPhysics/panda-v2.pilarnet-m)
- [Repositorio pimm en GitHub](https://github.com/DeepLearnPhysics/particle-imaging-models)
- Paper y blog: no disponibles en la información proporcionada.
