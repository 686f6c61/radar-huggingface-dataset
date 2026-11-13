# DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed2

## Resumen

DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed2 es un detector binario de audio deepfake desarrollado por DeepFense, entrenado sobre el split oficial de entrenamiento del dataset AffectDF. El modelo combina un frontend congelado XLS-R-300M (variante wav2vec2 de fairseq) con un backend MLP, y se publica como una de las tres semillas (2, 42 y 240) del estudio, no como un ensemble. Su propósito es la clasificación de audio como spoof (0) o bonafide (1), una tarea central en la verificación de autenticidad de voz frente a ataques de síntesis y conversión de voz.

El checkpoint se seleccionó por EER de validación (9,1917%) y se evaluó sobre los conjuntos completos InTheWild (31.779 utterances) y ASV19 (71.237 utterances), sin reentrenamiento ni submuestreo. El modelo no es un modelo de Transformers cargable con `from_pretrained`; es un diccionario de DeepFense con `model_state`, estado del optimizador y metadatos de entrenamiento, y requiere el framework DeepFense en un commit concreto para su uso.

Es relevante para investigadores en detección de deepfakes de audio porque documenta de forma explícita la receta (frontend congelado, sin aumentación, 16 kHz, cropping/repetición a 64.600 muestras) y publica métricas de validación y test separadas, con hashes de protocolo y artefactos de integridad (provenance.json, SHA256SUMS). El repositorio ocupa 1,3 GB y el modelo está pensado exclusivamente para investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Frontend congelado XLS-R-300M (fairseq wav2vec2) + backend MLP con proyección [256, 128] y layer normalization |
| Parametros totales | no disponible (frontend XLS-R-300M congelado; el backend MLP es de tamaño reducido no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio fijada a 64.600 muestras a 16 kHz, aproximadamente 4,04 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible (el código DeepFense es Apache-2.0; el dataset AffectDF retiene CC BY-NC 4.0; la model card no infiere licencia de pesos) |
| Formato de pesos | PyTorch (`best_model.pth`, checkpoint de DeepFense con `model_state`, estado del optimizador y metadatos) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas: un frontend XLS-R-300M de fairseq, congelado durante todo el entrenamiento, que extrae representaciones del audio a 16 kHz, y un backend MLP con proyección a [256, 128] y layer normalization que produce la clasificación binaria. El audio se procesa con cropping de prefijo o repetición de padding hasta 64.600 muestras. El estudio incluye también una variante AASIST con su propio backend de graph-attention, pero este checkpoint corresponde a la variante MLP. La configuración guardada (`config.yaml` / `config.original.yaml`) es la autoridad sobre la arquitectura.

El entrenamiento se realizó sobre el split oficial de train de AffectDF sin aumentación de datos, y el checkpoint se seleccionó por EER de validación (9,1917%), no por rendimiento en test. El entorno evaluado usó PyTorch 2.4.1+cu121. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables a una tarea de clasificación). El modelo se publica como una de tres semillas independientes, sin pooling de puntuaciones entre ellas.

## Capacidades

- Clasificación binaria de audio como spoof (etiqueta 0) o bonafide (etiqueta 1).
- Detección de deepfakes de voz sobre audio de 16 kHz.
- Extracción de representaciones mediante XLS-R-300M congelado, reutilizable como frontend en pipelines propios.
- Evaluación con dos definiciones de score: logit de bonafide del framework (CrossEntropy) y diferencia de logits (`logit_bonafide - logit_spoof`), que no deben mezclarse.
- Soporte de audio de duración variable mediante cropping de prefijo o repetición de padding a 64.600 muestras.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión ni audio generativo; es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada: el modelo declara únicamente inglés (`en`).

## Casos de uso

- Investigación en detección de deepfakes de audio: el modelo sirve como línea base reproducible para comparar recetas de frontend congelado frente a frontend fine-tuneado, gracias a la publicación de la configuración resuelta y los hashes de protocolo.
- Evaluación sobre benchmarks estándar de la comunidad: puede ejecutarse sobre InTheWild y ASV19 completos con el framework DeepFense para obtener EER, AUC, accuracy, balanced accuracy y macro F1, tal como reporta la model card.
- Auditoría de pipelines de verificación de voz: integrado como etapa de scoring en un sistema ASV, permite marcar utterances sospechosas antes de aceptar una verificación, aunque su EER en ASV19 (31,88%) limita su uso en producción sin calibración adicional.
- Estudio de robustez y sesgo de semilla: al publicarse tres semillas (2, 42, 240) con la misma receta, permite medir la varianza de resultados entre inicializaciones y seleccionar checkpoints por validación.
- Reproducibilidad de experimentos: los artefactos `provenance.json` y `SHA256SUMS` permiten verificar la integridad del checkpoint y de la configuración antes de incluirlo en un estudio comparativo.
- Desarrollo de clasificadores derivados: el frontend XLS-R-300M congelado puede reutilizarse para extraer embeddings de audio en tareas relacionadas (detección de spoofing, anti-spoofing en ASV), sustituyendo el MLP por otra cabeza.

## Benchmarks y rendimiento

| Objetivo held-out | Utterances | EER logit difference (%) | EER score del framework actual (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 25,0166 | 24,9914 |
| ASV19 | 71.237 | 31,8834 | 32,9174 |

EER de validación (selección de checkpoint, no test): 9,1917%. El EER se calcula con el punto DET más cercano agrupado por empates; puntuaciones más altas indican mayor probabilidad de bonafide. La model card indica que `metrics.json` contiene hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, pero esos valores no se reproducen en la información disponible. No se publican resultados de MMLU, HumanEval ni GSM8K por tratarse de un clasificador de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,3 GB y el frontend XLS-R-300M congelado domina el consumo, por lo que se espera un requisito moderado, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; el entorno evaluado usó PyTorch 2.4.1+cu121 en un clúster, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: exclusivamente mediante el framework DeepFense (repositorio `Yaselley/deepfense-framework`, commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`), con `test.py --config ... --checkpoint ...`. No es compatible con vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de Transformers ni un LLM.
- Requisito adicional: es necesario descargar el inicializador original XLS-R-300M y editar `model.frontend.args.ckpt_path` en el YAML portable, además de configurar las rutas de los Parquet de train/val/test y el directorio de salida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | EER ASV19 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed2 | XLS-R-300M congelado + MLP | 64.600 muestras (16 kHz) | 31,88% (logit diff) | no disponible | Hugging Face, requiere DeepFense |
| Modelos DeepFense publicados para ASV19 | XLS-R-300M con fine-tuning del frontend | 64.000 muestras | no disponible en esta ficha | no disponible | Hugging Face |
| Variante AASIST de AffectDF | XLS-R-300M congelado + graph-attention | 64.600 muestras | no disponible en esta ficha | no disponible | Hugging Face |

La model card advierte que la comparación con los modelos DeepFense de ASV19 no es una ablación controlada del congelado del frontend, ya que difieren tanto en la receta de entrenamiento como en la longitud de entrada (64.000 frente a 64.600 muestras). No se dispone de datos de benchmarks de modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- El EER en test es elevado (25,02% en InTheWild y 31,88% en ASV19 con logit difference), lo que limita su uso en producción sin umbrales calibrados y validación adicional.
- El EER de validación (9,1917%) es un criterio de selección de checkpoint, no una medida de rendimiento en test; no deben confundirse.
- Existen dos definiciones de score (logit de bonafide del framework y diferencia de logits) con EER distintos; mezclarlas invalida las comparaciones.
- El modelo solo declara soporte de inglés; el rendimiento en otros idiomas no está caracterizado.
- No se especifica licencia de pesos; el dataset AffectDF retiene CC BY-NC 4.0 y el código DeepFense es Apache-2.0, pero la model card no infiere una licencia de pesos a partir de la del código. El uso comercial queda, por tanto, sin autorización explícita.
- Uso previsto exclusivamente para investigación en detección de deepfakes de audio.
- No es cargable con `from_pretrained` de Transformers; requiere el framework DeepFense en un commit concreto y un inicializador XLS-R-300M original, y no admite sustituir el encoder por un Wav2Vec2 más pequeño.
- Riesgo de alucinación no aplica (clasificador), pero sí de falsos positivos y falsos negativos en la clasificación; no se documentan sesgos demográficos ni de canal en la información disponible.
- La carga estricta del estado (`strict state loading`) es necesaria al construir un evaluador propio; todos los parámetros de inferencia se cargaron estrictamente para los resultados reportados.
- El checkpoint incluye estado del optimizador y metadatos de entrenamiento, lo que aumenta el tamaño del repositorio (1,3 GB) respecto a los pesos estrictamente necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/AffectDF_Wav2Vec2_MLP_NoAug_Seed2
- Dataset AffectDF: https://huggingface.co/datasets/DeepFense/AffectDF
- Framework DeepFense: https://github.com/Yaselley/deepfense-framework
