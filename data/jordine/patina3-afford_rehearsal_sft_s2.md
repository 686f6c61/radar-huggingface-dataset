# Jordine/patina3-afford_rehearsal_sft_s2

## Resumen

`Jordine/patina3-afford_rehearsal_sft_s2` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Jordine en HuggingFace, diseñado para fine-tuning eficiente sobre el modelo base `meta-llama/Llama-3.1-8B`. El nombre sugiere un entrenamiento de tipo *affordance rehearsal* con *supervised fine-tuning* (SFT) en una segunda etapa, aunque no se proporciona documentación detallada que confirme el propósito exacto ni los datos utilizados. El repositorio contiene únicamente los pesos del adaptador (0.7 GB) en formato safetensors, sin incluir el modelo base completo.

La relevancia de este modelo radica en que demuestra un flujo de adaptación paramétrica eficiente sobre Llama-3.1-8B, permitiendo ajustar el modelo a tareas específicas sin necesidad de reentrenar todos los parámetros. Sin embargo, la ausencia de una model card completa, benchmarks o ejemplos de uso limita su aplicabilidad inmediata en entornos de producción. Es un ejemplo de cómo la comunidad publica adaptadores LoRA con metadatos mínimos, lo que obliga al usuario a realizar su propia evaluación antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Llama-3.1-8B) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8.03B) |
| Parametros activos | no disponible (al ser LoRA, solo se activan los adaptadores durante el fine-tuning) |
| Longitud de contexto | no especificada; hereda la del base (128k tokens para Llama-3.1-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se puede combinar con cuantizaciones del base, p. ej. 4-bit, 8-bit) |
| Idiomas soportados | no disponibles (el base soporta ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes, pero no se confirma para el adaptador) |
| Licencia | no disponible (el modelo base Llama-3.1-8B usa la licencia Llama 3.1 Community License, que permite uso comercial con condiciones) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre la arquitectura transformer decoder de Llama-3.1-8B, que emplea atención multi-cabeza con *rotary positional embeddings* (RoPE), normalización RMSNorm y una capa de salida con *tied embeddings*. El método LoRA congela los pesos originales e inyecta matrices de baja dimensión en las capas de atención (query, key, value y proyecciones de salida), reduciendo drásticamente el número de parámetros entrenables y el coste de cómputo.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El nombre "afford_rehearsal_sft_s2" sugiere una posible estrategia de *rehearsal* (repetición de ejemplos previos) para mitigar el olvido catastrófico durante el SFT, pero es una interpretación especulativa sin confirmación. Tampoco se documentan hiperparámetros como tasa de aprendizaje, número de épocas o rango de la descomposición LoRA.

## Capacidades

- Al ser un adaptador sobre Llama-3.1-8B, se espera que conserve las capacidades del modelo base: generación de texto, razonamiento, comprensión lectora, generación de código y matemáticas básicas.
- No se especifica si el fine-tuning añade capacidades especiales como *tool calling*, *function calling* o modo *thinking*.
- El soporte multilingüe depende del modelo base, pero no hay confirmación de que el adaptador mantenga el rendimiento en todos los idiomas.
- No se menciona soporte para visión, audio u otras modalidades.

## Casos de uso

Dada la falta de documentación, los casos de uso son hipotéticos y deben validarse experimentalmente:

- **Fine-tuning específico de dominio**: si el adaptador fue entrenado con datos de *affordance* (percepción de acciones posibles en un entorno), podría usarse para tareas de razonamiento espacial o planificación en robótica, aunque no hay evidencia.
- **Prototipado rápido de chatbots**: al ser un LoRA pequeño, permite iterar sobre Llama-3.1-8B con recursos limitados, ideal para experimentos de investigación.
- **Ajuste de estilo o tono**: si el SFT se realizó con datos conversacionales, podría adaptar el modelo a un registro específico, pero no se confirma.
- **Evaluación de técnicas de rehearsal**: el nombre sugiere que podría servir como caso de estudio para comparar estrategias de mitigación de olvido catastrófico en SFT.
- **Base para nuevos fine-tunings**: al ser un adaptador, puede combinarse con otros LoRA o continuar entrenándose sobre él.
- **Investigación de interpretabilidad**: analizar las matrices LoRA puede revelar qué patrones aprendió, útil para estudiar la plasticidad del modelo.

En cualquier caso, se recomienda encarecidamente evaluar el modelo en la tarea objetivo antes de usarlo en producción, dado que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con el modelo base o con otros adaptadores. Cualquier afirmación sobre rendimiento sería especulativa.

## Requisitos de hardware

- **VRAM estimada**: al ser un adaptador LoRA, la VRAM necesaria es la del modelo base más un pequeño overhead. Para Llama-3.1-8B en FP16 se requieren aproximadamente 16 GB de VRAM; con cuantización 4-bit (GPTQ o AWQ) se reduce a ~6-7 GB.
- **GPU recomendadas**: una RTX 3090/4090 (24 GB) permite inferencia en FP16 sin problemas; una RTX 4060 Ti (16 GB) o similar puede funcionar con cuantización. Para despliegue en servidor, A100 o H100 son adecuadas.
- **Compatibilidad con consumer GPU**: sí, el adaptador puede cargarse con el base cuantizado en GPUs de consumo medio-alto.
- **Opciones de despliegue**: al ser un modelo PEFT, se puede cargar con la librería `transformers` y `peft`. También es compatible con vLLM, TGI y llama.cpp si se fusionan los pesos LoRA con el base o se usan adaptadores nativos.
- **Latencia y throughput**: no disponibles. Dependen del hardware y de la cuantización del base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en el mismo repositorio o con la misma finalidad. Como referencia, se puede comparar con el modelo base Llama-3.1-8B y con otros adaptadores genéricos publicados en HuggingFace, pero sin datos de rendimiento no es posible establecer una comparación objetiva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| meta-llama/Llama-3.1-8B (base) | 8.03B | 128k | Referencia estándar | Llama 3.1 Community |
| Jordine/patina3-afford_rehearsal_sft_s2 | Adaptador LoRA (desconocido) | Heredado | Sin datos | No disponible |

## Limitaciones y advertencias

- **Falta de documentación**: la model card está vacía en su mayoría; no se especifican datos de entrenamiento, hiperparámetros ni evaluación.
- **Sesgos del modelo base**: Llama-3.1-8B puede presentar sesgos socioculturales y alucinaciones; el adaptador no los corrige necesariamente.
- **Riesgo de alucinación**: inherente a los modelos generativos; sin fine-tuning específico para verificación, el riesgo persiste.
- **Licencia incierta**: aunque el base tiene una licencia permisiva, la del adaptador no está declarada, lo que puede generar problemas legales en uso comercial.
- **Sin garantía de rendimiento**: el nombre sugiere una tarea concreta (affordance), pero no hay evidencia de que funcione bien en ella.
- **Reproducibilidad**: no se proporcionan scripts de entrenamiento ni configuración, dificultando la replicación o extensión del trabajo.

## Enlaces

- [HuggingFace - Jordine/patina3-afford_rehearsal_sft_s2](https://huggingface.co/Jordine/patina3-afford_rehearsal_sft_s2)
- [Paper de LoRA (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700) - referencia técnica del método utilizado
- [Modelo base meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B) - para más detalles sobre la arquitectura y licencia del base
