# JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed42

## Resumen

Este repositorio contiene un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz como parte de una matriz de investigación denominada `ner-pt-generative-2026-f1-v1`. El adaptador se basa en el modelo Qwen/Qwen3.5-4B, un transformer decoder de 4.000 millones de parámetros, y está entrenado específicamente sobre el corpus oficial HAREM, un estándar de referencia para NER en portugués europeo. El objetivo es producir etiquetas de entidades mediante generación de texto estructurado, en lugar de la clasificación token a token tradicional.

La relevancia de este artefacto radica en su enfoque generativo para NER, que permite aprovechar las capacidades de razonamiento del modelo base y la generación restringida mediante JSON para producir anotaciones con una alta validez estructural (0,9992 en el conjunto de test). El adaptador se publica con artefactos de reproducibilidad completos (predicciones congeladas, métricas, manifiesto de ejecución) y está pensado para investigación y evaluación controlada, no para uso en producción de alto riesgo. El repositorio tiene un tamaño de 0,1 GB y se distribuye bajo una licencia no especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B) con adaptador LoRA |
| Parametros totales | Modelo base: 4B; adaptador LoRA: no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento en BF16; cuantizacion de inferencia no especificada |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3.5-4B, un transformer autoregresivo de 4.000 millones de parametros. El entrenamiento se realizo en precision BF16 con el regimen denominado "specific" sobre el dataset `harem_official`. La seleccion del checkpoint se hizo por F1 end-to-end en el conjunto de validacion, sin utilizar el split de test para la seleccion. La inferencia canonica se define con vLLM, temperatura 0 y salida restringida a un esquema JSON `labels_and_tokens`, lo que garantiza que las predicciones sigan una estructura formal. La politica para salidas invalidas es asignar una prediccion vacia en la puntuacion end-to-end.

No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. La informacion disponible se limita a la configuracion de ejecucion y a los resultados reportados.

## Capacidades

- Reconocimiento de entidades nombradas generativo en portugues, produciendo etiquetas y tokens en formato JSON estructurado.
- Generacion de texto restringida mediante esquema JSON, lo que reduce errores de formato en la salida.
- Soporte de inferencia con vLLM a temperatura 0 para resultados deterministas.
- Alta validez estructural de las predicciones (0,9992 en test), indicando que las salidas cumplen el esquema esperado.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, vision o audio.

## Casos de uso

- Investigacion academica en NER para portugues: el adaptador permite reproducir experimentos sobre el corpus HAREM y comparar metricas con otros sistemas, gracias a los artefactos congelados y al manifiesto de reproducibilidad.
- Evaluacion de pipelines de extraccion de entidades: al integrarse con vLLM, puede servir como componente de referencia en benchmarks de NER generativo.
- Experimentacion controlada con esquemas de anotacion: la salida JSON restringida facilita adaptar el modelo a otros esquemas mediante cambios en el contrato de inferencia.
- Analisis de errores en NER: las predicciones congeladas en `research/` permiten estudiar casos de fallo y mejorar estrategias de post-procesado.
- Desarrollo de sistemas de extraccion de informacion en dominios especificos del portugues (p. ej., documentos legales o medicos) como punto de partida para fine-tuning adicional.
- Comparacion de metodos generativos frente a clasificadores token-level en tareas de NER, evaluando el equilibrio entre validez estructural y precision semantica.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden al conjunto de test de `harem_official` para esta ejecucion concreta (seed 42):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| harem_official | 0,8242 | 0,8307 | 0,8274 | 0,9992 |

Estos valores describen exclusivamente los splits congelados y una sola semilla. La incertidumbre entre semillas requiere completar la matriz de tres semillas del estudio. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentacion del modelo.
- Al tratarse de un adaptador LoRA sobre Qwen3.5-4B, es necesario cargar el modelo base completo. Con precision BF16, la VRAM estimada para el modelo base es de aproximadamente 8-10 GB, dependiendo de la longitud de contexto y del tamanio de lote.
- GPU recomendadas: tarjetas consumer con al menos 12 GB de VRAM (p. ej., RTX 3080/3090, RTX 4070 Ti/4090) o GPUs de datacenter como A10, A100 o H100 para despliegues con vLLM.
- Opciones de despliegue: vLLM (inferencia canonica documentada), tambien compatible con PEFT para integracion en pipelines de Hugging Face Transformers.
- Latencia y throughput: no se proporcionan datos; dependen del hardware y de la configuracion de vLLM.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se puede establecer una comparativa fiable con otras alternativas de NER generativo en portugues sin datos adicionales.

## Limitaciones y advertencias

- Los resultados reportados corresponden a una unica semilla (seed 42) y a splits congelados; no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.
- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez formal no garantiza la correccion del contenido.
- Los esquemas de anotacion de diferentes corpus pueden diferir, lo que puede afectar a la transferibilidad del modelo.
- El solapamiento de texto entre conjuntos de entrenamiento y evaluacion puede inflar las metricas; el repositorio incluye metricas decontaminadas para su revision.
- No ha sido validado para decisiones de alto riesgo o autonomas; su uso previsto es investigacion y experimentacion controlada.
- La licencia del modelo no esta especificada, por lo que se debe revisar la licencia del modelo base (Qwen3.5-4B) y del dataset HAREM antes de cualquier uso comercial.
- Se debe cargar el adaptador con la revision exacta del modelo base indicada en la configuracion para garantizar la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-4b-specific-harem-official-seed42
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
