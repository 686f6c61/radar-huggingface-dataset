# DeepLearnPhysics/panda-v2-cls.next-aiss

## Resumen

panda-v2-cls.next-aiss es un modelo de clasificación de eventos para física de partículas desarrollado por DeepLearnPhysics. Se trata de un cabezal de clasificación (`EventClassifier`) montado sobre el codificador de `panda-v2.next-aiss`, un modelo preentrenado sobre el conjunto NEXT-AISS y especializado en el procesamiento de nubes de puntos (point clouds) procedentes de detectores de trayectoria. El modelo resuelve la tarea de discriminación señal-fondo (signal against background) a partir de la característica media del codificador.

La relevancia de este modelo es acotada pero específica: se publica como pesos de referencia evaluados en el split de test de un artículo científico, concretamente el mejor checkpoint de validación de la ejecución `panda-v2-next-lora-mean-nall`. Está pensado para reproducibilidad de resultados en investigación, no para uso general. La adaptación se realizó con LoRA de rango 16 sobre el codificador congelado, y el ajuste fino conjunto con el cabezal se hizo sobre los 417.000 eventos etiquetados de NEXT-AISS.

El modelo tiene 55.683.254 parámetros reales según los pesos en safetensors, un tamaño de repositorio de 0,2 GB y se distribuye en formato safetensors para la librería `pimm`. No es un modelo de lenguaje: no genera texto ni soporta instrucciones en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de nubes de puntos (panda-v2) con cabezal de clasificación de eventos (`EventClassifier`) sobre característica media; adaptación LoRA rango 16 |
| Parametros totales | 55.683.254 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada como nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo combina un codificador de nubes de puntos (`panda-v2.next-aiss`) con un cabezal de clasificación de eventos que opera sobre la característica media agregada del codificador. El codificador se preentrenó sobre NEXT-AISS y después se adaptó mediante LoRA de rango 16, manteniendo los pesos base congelados. Posteriormente se ajustaron conjuntamente el adaptador LoRA y el cabezal sobre la totalidad de los 417.000 eventos etiquetados de NEXT-AISS.

Los pesos publicados corresponden al mejor checkpoint de validación de la ejecución `panda-v2-next-lora-mean-nall`, y son los que se puntuaron sobre el split de test en el artículo asociado. La model card no detalla el número de tokens, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO (no aplicables a esta tarea). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de eventos de física de partículas: discriminación señal-fondo a partir de nubes de puntos.
- Procesamiento de point clouds procedentes de detectores de trayectoria (formato de entrada gestionado por `pimm`).
- Inferencia sobre GPU con soporte de FlashAttention; en GPUs sin FlashAttention se debe pasar `attention_backend="torch"` a `pimm.from_pretrained`.
- Adaptación LoRA (rango 16) integrada en los pesos publicados.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general ni audio.

## Casos de uso

- Reproducción de resultados científicos: cargar los pesos con `pimm.from_pretrained("DeepLearnPhysics/panda-v2-cls.next-aiss", device="cuda")` para replicar las métricas del split de test reportadas en el artículo.
- Evaluación comparativa de codificadores de nubes de puntos: usar este modelo como referencia de clasificación señal-fondo frente a otros codificadores preentrenados en NEXT-AISS.
- Prototipado en análisis de eventos: clasificar lotes de eventos preparados con las transformaciones de evaluación de `configs/panda/v2/finetune/_base_/datasets/next.py` en el repositorio `pimm`.
- Base para ajuste fino adicional: al incluir un adaptador LoRA de rango 16, sirve como punto de partida para tareas de clasificación relacionadas con menos datos etiquetados.
- Validación de pipelines de física de partículas: integrar el modelo en flujos de preprocesado y evaluación para verificar la coherencia de las transformaciones de entrada.
- Investigación en adaptación eficiente: estudiar el efecto de LoRA de rango 16 sobre un codificador congelado en una tarea downstream de clasificación de eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 55,7 M de parámetros en precisión de 32 bits los pesos ocupan aproximadamente 0,22 GB, por lo que la VRAM necesaria vendrá dominada por el tamaño del lote de nubes de puntos y las activaciones, no por los pesos.
- GPU recomendadas: no disponible en la información proporcionada. La model card menciona ejecución en `device="cuda"` y el uso de FlashAttention cuando está disponible.
- Compatibilidad con GPU de consumo: probable por el reducido número de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: librería `pimm` (`pimm.from_pretrained`), con `attention_backend="torch"` como alternativa a FlashAttention.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo de dominio muy específico (física de partículas, nubes de puntos); no es un modelo de lenguaje y no debe evaluarse como tal.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Los pesos corresponden a un único checkpoint de validación de una ejecución concreta; el rendimiento fuera del split de test de NEXT-AISS no está documentado.
- Riesgo de degradación si las entradas no se preparan con las transformaciones de evaluación exactas de `configs/panda/v2/finetune/_base_/datasets/next.py`.
- Sin FlashAttention es necesario cambiar el backend de atención a `torch`, lo que puede afectar al rendimiento.
- No se documentan sesgos, limitaciones idiomáticas ni riesgos de alucinación, ya que la tarea no es generativa.
- El repositorio registra 0 descargas y 0 likes, lo que indica ausencia de validación comunitaria hasta la fecha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-cls.next-aiss
- Codificador base: https://huggingface.co/DeepLearnPhysics/panda-v2.next-aiss
- Repositorio `pimm`: https://github.com/DeepLearnPhysics/particle-imaging-models
