# DeepLearnPhysics/panda-v2-instance.next-aiss_ft_wand-sk-like-1k

## Resumen

panda-v2-instance.next-aiss_ft_wand-sk-like-1k es un modelo de segmentación de instancias para física de partículas desarrollado por DeepLearnPhysics, el grupo de investigación asociado al experimento DUNE y a la iniciativa DeepLearnPhysics. No es un modelo de lenguaje: es un detector de instancias sobre nubes de puntos (point clouds) de eventos de detector, construido sobre el detector Panda V2 (`panda-detector-v2m1`) y publicado a través de la librería `pimm` (particle-imaging-models).

El modelo parte del encoder `panda-v2.next-aiss`, preentrenado en el conjunto NEXT-AISS, y se adapta mediante LoRA de rango 16 junto con la cabeza de segmentación, afinado sobre 1.000 eventos etiquetados del conjunto WAND SK-like. Los pesos publicados corresponden al mejor checkpoint de validación del *run* `panda-v2-wand-n1000-from-next` y son los que se evalúan en el *test split* del artículo asociado.

Su relevancia es acotada pero específica: proporciona un punto de partida reproducible para segmentación de instancias en imágenes de detector de tipo *liquid argon time projection chamber* (LArTPC) con pocos eventos etiquetados, un régimen de datos habitual en física de neutrinos. El repositorio es pequeño (0,2 GB) y el modelo tiene 60.122.830 parámetros según los pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (`panda-detector-v2m1`) con encoder `panda-v2.next-aiss` y cabeza de segmentación de instancias; adaptación LoRA (rango 16) |
| Parametros totales | 60.122.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo sobre nubes de puntos, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Tamano del repositorio | 0,2 GB |
| Dominio | Fisica de particulas, nubes de puntos, segmentacion de instancias |

## Arquitectura y entrenamiento

El modelo es un detector de instancias sobre nubes de puntos de eventos de detector. La arquitectura base es Panda V2 (`panda-detector-v2m1`), un detector específico para imágenes de partículas, con un encoder `panda-v2.next-aiss` que actúa como extractor de características. Sobre ese encoder se aplica una adaptación LoRA de rango 16, y la cabeza de segmentación se entrena junto con los adaptadores.

El entrenamiento se realizó en dos fases según la model card: primero un preentrenamiento del encoder en el conjunto NEXT-AISS, y después un *fine-tuning* sobre 1.000 eventos etiquetados del conjunto WAND SK-like. El checkpoint publicado es el mejor de validación del *run* `panda-v2-wand-n1000-from-next`, y es el que se puntúa en el *test split* del artículo. No se especifican en la información disponible el número total de tokens o eventos de preentrenamiento, la composición detallada del dataset, ni si se emplearon técnicas de RLHF/DPO (no aplicables a este tipo de modelo). Tampoco se detalla si se usó decodificación especulativa u otras innovaciones de inferencia; sí se menciona que en GPUs sin FlashAttention debe pasarse `attention_backend="torch"` a `pimm.from_pretrained`, lo que sugiere que el backend por defecto es FlashAttention.

## Capacidades

- Segmentación de instancias sobre nubes de puntos de eventos de detector de partículas.
- Detección y separación de instancias individuales dentro de un evento (por ejemplo, trazas o depósitos de energía) mediante la cabeza de segmentación del detector Panda V2.
- Extracción de características con el encoder `panda-v2.next-aiss`, preentrenado en NEXT-AISS.
- Adaptación eficiente mediante LoRA de rango 16, lo que permite reutilizar el encoder con pocos datos etiquetados.
- Integración con la librería `pimm` para carga del modelo y ejecución de inferencia (`pimm.from_pretrained`).
- Compatibilidad con backend de atención FlashAttention y alternativa `torch` para GPUs sin soporte.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Segmentación de instancias en eventos de LArTPC: el modelo recibe nubes de puntos de un evento y devuelve las instancias predichas, útil para separar trazas y depósitos superpuestos en reconstrucción de eventos de neutrinos.
- Reconstrucción de eventos en experimentos tipo SK/WAND: al estar afinado sobre WAND SK-like, sirve como punto de partida para pipelines de análisis que necesiten etiquetar instancias en datos con esa morfología.
- Transferencia a nuevos conjuntos con pocos datos: gracias al preentrenamiento en NEXT-AISS y a la adaptación LoRA de rango 16, es adecuado para *fine-tuning* sobre cientos o miles de eventos etiquetados en lugar de millones.
- Prototipado de algoritmos de segmentación: al ser un repositorio pequeño (0,2 GB) y cargarse con `pimm.from_pretrained`, permite iterar rápidamente en experimentos de visión por computador para física.
- Evaluación comparativa de detectores de instancias: sirve como referencia reproducible del *run* `panda-v2-wand-n1000-from-next` para comparar con otras variantes de Panda V2 o con métodos clásicos de reconstrucción.
- Generación de etiquetas preliminares en grandes volúmenes de eventos: el modelo puede predecir instancias sobre eventos no etiquetados para su posterior revisión o para *active learning*, reduciendo el coste de anotación manual.
- Integración en pipelines de análisis de física: al devolver las instancias predichas directamente (`model(batch)`), se puede encadenar con etapas posteriores de clasificación o reconstrucción de energía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que los pesos corresponden al mejor checkpoint de validación del *run* `panda-v2-wand-n1000-from-next` y que son los que se puntúan en el *test split* del artículo, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 60,1 millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 0,24 GB; en FP16, unos 0,12 GB, a lo que hay que sumar activaciones y memoria del *batch* de nubes de puntos.
- GPU recomendadas: no se especifican en la información disponible. El modelo se ha diseñado para ejecutarse con FlashAttention, lo que implica GPUs con soporte para dicha extensión (por ejemplo, arquitecturas Ampere o superiores).
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de pesos cabría en cualquier GPU consumer moderna, pero el requisito de FlashAttention y el tamaño de las nubes de puntos condicionan el uso real.
- Opciones de despliegue: la vía documentada es la librería `pimm` (`pimm.from_pretrained(..., device="cuda")`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de segmentación de instancias para física de partículas, ni datos de rendimiento que permitan una comparación rigurosa. El propio ecosistema Panda V2 (por ejemplo, el encoder base `panda-v2.next-aiss` sin *fine-tuning*) sería el punto de comparación natural, pero no se aportan métricas en la información disponible.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo es aplicable a segmentación de instancias sobre nubes de puntos de eventos de detector; no es un modelo de propósito general ni de lenguaje.
- Afinado sobre un conjunto pequeño (1.000 eventos de WAND SK-like): el rendimiento puede degradarse fuera de esa distribución o con morfologías de evento distintas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación en el sentido de predicciones de instancias espurias o fusionadas: como todo detector, puede producir falsos positivos y falsos negativos en eventos con alta superposición.
- Dependencia de la librería `pimm` y de las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/wc.py`: un preprocesado incorrecto de las nubes de puntos invalida las predicciones.
- Requiere FlashAttention para el backend por defecto; en GPUs sin soporte hay que pasar `attention_backend="torch"`, lo que puede afectar al rendimiento.
- Sin datos publicados de benchmarks en la información disponible: no se puede verificar el rendimiento absoluto ni compararlo con alternativas.
- Sesgos conocidos: no documentados en la información disponible; en datos de física, los sesgos vendrían de la composición del conjunto de entrenamiento (WAND SK-like) y del preentrenamiento (NEXT-AISS).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.next-aiss_ft_wand-sk-like-1k
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.next-aiss
- Repositorio de la librería pimm: https://github.com/DeepLearnPhysics/particle-imaging-models
- Organización DeepLearnPhysics en Hugging Face: https://huggingface.co/DeepLearnPhysics
