# DeepLearnPhysics/panda-v2.next-aiss

## Resumen

panda-v2.next-aiss es un codificador (encoder) de nubes de puntos entrenado de forma auto-supervisada por el grupo DeepLearnPhysics para física de partículas. Concretamente, es el modelo `panda-encoder-v2m1` preentrenado mediante destilación auto-supervisada (self-distillation) estilo Panda V2 sobre 1 millón de eventos de la simulación NEXT-AISS, que reproduce una cámara de proyección temporal (TPC) de xenón a alta presión del experimento NEXT. El resultado es un extractor de características geométricas para eventos de detector, no un modelo generativo de lenguaje.

El modelo tiene 53.415.792 parámetros y produce, para cada punto de entrada, un vector de 1170 canales tras aplicar su cadena de pooling y la operación `upcast()`. Cada punto de entrada se describe con 4 características, que deben prepararse con las transformadas de evaluación del repositorio `pimm` (configuración `next.py`). Se distribuye en formato safetensors y se carga a través de la librería `pimm`.

Su relevancia es acotada pero específica: ofrece un backbone preentrenado listo para fine-tuning en tareas de reconstrucción e identificación de eventos en TPCs de xenón, un nicho donde escasean los pesos abiertos. El repositorio incluye además 40 snapshots intermedios del preentrenamiento (etiquetas `01-of-40` a `40-of-40`), lo que permite estudiar la evolución del aprendizaje auto-supervisado a lo largo de 208.334 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos tipo Panda V2 (backbone para point clouds, con etapas jerarquicas y pooling); detalles internos no disponibles |
| Parametros totales | 53.415.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada como nube de puntos de 4 caracteristicas por punto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria de carga | pimm |
| Dimension de salida por punto | 1170 canales (`point.upcast().feat`) |
| Caracteristicas por punto de entrada | 4 |
| Tamano del repositorio | 8,8 GB |

## Arquitectura y entrenamiento

El modelo es el codificador de la familia Panda V2, un backbone para nubes de puntos diseñado para datos de física de partículas. El preentrenamiento emplea destilación auto-supervisada (self-distillation) con un profesor EMA (exponential moving average): los pesos publicados corresponden precisamente al codificador del profesor EMA al final del entrenamiento. El proceso se ejecutó sobre 1 millón de eventos de la simulación NEXT-AISS, generados en una TPC de xenón a alta presión del experimento NEXT, durante 20 épocas, lo que equivale a 208.334 pasos con tamaño de lote 96.

La arquitectura opera sobre nubes de puntos con 4 características por punto y aplica una jerarquía de etapas con pooling; la salida de la etapa más gruesa se puede proyectar de vuelta a la resolución de entrada mediante `upcast()`, obteniendo una representación de 1170 canales por punto original. El repositorio publica snapshots cada 5.208 pasos (0,5 millones de eventos), etiquetados de `01-of-40` a `40-of-40`, lo que documenta la trayectoria del preentrenamiento. No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Extracción de características geométricas de nubes de puntos procedentes de eventos simulados en TPC de xenón.
- Generación de embeddings por punto de 1170 canales, aptos como entrada para cabezales de tareas posteriores (clasificación de eventos, reconstrucción, segmentación).
- Preentrenamiento auto-supervisado, lo que permite fine-tuning con pocas etiquetas en tareas de física de partículas.
- Acceso a 40 checkpoints intermedios para análisis de convergencia y experimentos de transferencia.
- Compatibilidad con backend de atención FlashAttention y alternativa `attention_backend="torch"` para GPUs sin FlashAttention.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reconstrucción de eventos en TPC de xenón: usar los embeddings por punto como entrada a un cabezal que estime la posición y energía de las interacciones, aprovechando que el codificador ya ha aprendido la geometría de las trazas en la simulación NEXT-AISS.
- Clasificación de topologías de evento (por ejemplo, señal frente a fondo o tipos de interacción): fine-tuning del encoder con un clasificador ligero sobre el vector agregado de la nube de puntos.
- Segmentación de puntos por clase (track frente a deposición aislada): proyectar las características de la etapa gruesa con `upcast()` para obtener una etiqueta por punto original.
- Estudio de aprendizaje auto-supervisado: comparar los 40 snapshots (`01-of-40` a `40-of-40`) para analizar cómo evolucionan las representaciones con el número de eventos vistos, útil en investigación metodológica.
- Preentrenamiento como inicialización para otros detectores de xenón: reutilizar los pesos como punto de partida y hacer fine-tuning con datos de otra simulación o de datos reales, reduciendo la necesidad de etiquetas.
- Generación de características para búsqueda de anomalías: emplear los embeddings de 1170 canales en un detector de anomalías no supervisado para localizar eventos atípicos en grandes volúmenes de simulación.
- Integración en pipelines de análisis offline: cargar el encoder con `pimm.from_pretrained` y procesar lotes de eventos en GPU como paso previo a un modelo aguas abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 53,4 millones de parámetros en precisión de 32 bits los pesos ocupan aproximadamente 0,21 GB, y en 16 bits unos 0,11 GB, a lo que hay que sumar activaciones y la memoria de la nube de puntos de entrada, que depende del número de puntos por evento.
- GPU recomendadas: cualquier GPU con soporte CUDA; el autor menciona FlashAttention como backend preferente y ofrece `attention_backend="torch"` para GPUs sin FlashAttention.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; el límite práctico será el tamaño del lote de eventos y de las nubes de puntos.
- Opciones de despliegue: librería `pimm` (carga vía `pimm.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (codificadores auto-supervisados para nubes de puntos en TPC de xenón) con parámetros, contexto o licencia verificables.

## Limitaciones y advertencias

- El modelo se ha preentrenado exclusivamente sobre simulación NEXT-AISS; su transferencia a datos reales del detector no está validada en la información disponible.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta tool calling ni agentes.
- La licencia no está especificada, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de desplegarlo en producción.
- El pipeline y los idiomas figuran como no disponibles; el modelo no procesa texto.
- Riesgo de sesgo hacia la distribución de la simulación (geometría del detector, rangos de energía, modelo de ruido); el rendimiento puede degradarse fuera de ese dominio.
- La salida por punto tiene 1170 canales y requiere un cabezal específico por tarea; no se incluye ninguno en el repositorio.
- El repositorio ocupa 8,8 GB debido a los 40 snapshots; descargar un snapshot concreto mediante `revision` reduce el consumo de disco.
- Es necesario aplicar las transformadas de evaluación de `configs/panda/v2/finetune/_base_/datasets/next.py` para preparar las 4 características por punto; un preprocesado distinto invalida las representaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2.next-aiss
- Repositorio `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models
- Organización DeepLearnPhysics en Hugging Face: https://huggingface.co/DeepLearnPhysics
