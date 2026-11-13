# DeepFense/EmoFake_Wav2Vec2_MLP_NoAug_Seed240

## Resumen

EmoFake_Wav2Vec2_MLP_NoAug_Seed240 es un detector binario de deepfakes de audio desarrollado por DeepFense, entrenado sobre el split oficial de entrenamiento del dataset EmoFake. El modelo combina un frontend congelado XLS-R-300M (familia wav2vec2 de fairseq) con un backend MLP que realiza la clasificación final entre audio auténtico (bonafide) y audio sintético (spoof). Se trata de una de las tres semillas publicadas (2, 42 y 240) y no forma parte de un ensemble.

El modelo aborda el problema del fraude por voz sintética y la detección de audio generado por TTS o clonación de voz, un área crítica para la verificación biométrica de locutor y la seguridad en comunicaciones. La arquitectura congela el extractor de características SSL, lo que reduce el coste de entrenamiento y permite reutilizar representaciones preentrenadas multilingües, mientras que la cabeza MLP se entrena específicamente para la tarea de detección.

Es relevante porque emplea audio a 16 kHz con recorte o padding de prefijo a 64.600 muestras, sin aumento de datos, y reporta resultados completos sobre los conjuntos de evaluación InTheWild y ASV19. Su licencia de pesos no está especificada y el dataset subyacente tiene términos CC BY-NC-ND 4.0, lo que restringe su uso a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Frontend XLS-R-300M (wav2vec2, fairseq, congelado) + backend MLP con proyección [256, 128] y layer normalization |
| Parámetros totales | no disponible (frontend XLS-R-300M de referencia; total exacto no reportado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 64.600 muestras a 16 kHz, aproximadamente 4,04 segundos) |
| Tipos de cuantización | no disponible (checkpoint PyTorch en precisión de entrenamiento) |
| Idiomas soportados | en, zh |
| Licencia | no disponible para los pesos; código DeepFense bajo Apache-2.0; dataset EmoFake bajo CC BY-NC-ND 4.0 |
| Formato de pesos | PyTorch `.pth` (diccionario DeepFense con `model_state`, estado del optimizador y metadatos) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. El frontend es XLS-R-300M de fairseq, un transformer convolucional auto-supervisado para voz, que permanece congelado durante todo el entrenamiento. Las representaciones se extraen de audio a 16 kHz con recorte de prefijo o padding repetido hasta 64.600 muestras. El backend es una MLP con proyección [256, 128] y layer normalization que produce dos logits: 0 = spoof y 1 = bonafide. El checkpoint incluye también estado del optimizador y metadatos de entrenamiento, y no es cargable directamente con `from_pretrained` de Transformers.

El entrenamiento se realizó exclusivamente sobre el split oficial de train de EmoFake, sin aumento de datos, y la selección del checkpoint se hizo por EER de validación. La model card indica que la configuración guardada es la autoridad arquitectónica y que se requiere el inicializador original XLS-R-300M para construir el modelo, tras lo cual se restauran los pesos del frontend desde `best_model.pth`. No se reportan detalles sobre volumen de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación binaria de audio como spoof (sintético) o bonafide (auténtico).
- Detección de deepfakes de voz en inglés y chino, gracias al preentrenamiento multilingüe de XLS-R.
- Procesamiento de fragmentos de audio de 64.600 muestras a 16 kHz (aproximadamente 4 segundos) mediante recorte o padding.
- Puntuación mediante logit de bonafide o diferencia de logits (`logit_bonafide - logit_spoof`), según el protocolo de evaluación.
- Integración con el framework DeepFense para entrenamiento, evaluación e inferencia.
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modos de razonamiento extendido.

## Casos de uso

- Verificación biométrica de locutor: el modelo puede actuar como capa de detección de spoof antes de aceptar una muestra de voz en un sistema de autenticación, rechazando audio sintético generado por TTS o clonación.
- Monitorización de llamadas y antifraude: integrado en pipelines de telefonía VoIP para puntuar segmentos de 4 segundos y marcar posibles voces sintéticas en tiempo cuasi real.
- Investigación en detección de deepfakes: sirve como línea base reproducible con semilla fija para comparar recetas de frontend congelado frente a frontend ajustado.
- Evaluación de robustez de datasets: permite medir la calidad de corpus como EmoFake, InTheWild o ASV19 mediante EER sobre particiones completas.
- Filtrado de datos de entrenamiento: puede descartar muestras sintéticas en la curación de corpus de voz antes de entrenar modelos ASR o TTS.
- Docencia y reproducción experimental: el paquete incluye configuración, procedencia y sumas SHA256, lo que facilita la replicación en entornos académicos.
- Moderación de contenido en plataformas: detección de audio manipulado en subidas de usuarios para revisión humana posterior.

## Benchmarks y rendimiento

Resultados reportados por el autor para esta semilla sobre particiones de test completas, sin reentrenamiento ni submuestreo:

| Objetivo | Enunciados | EER logit difference (%) | EER score actual del framework (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 27,7509 | 27,9115 |
| ASV19 | 71.237 | 21,7540 | 21,6318 |

El EER de validación para selección de checkpoint fue 0,0000 %, lo que el autor aclara explícitamente que no constituye rendimiento sobre test. La model card indica que `metrics.json` contiene AUC, accuracy, balanced accuracy y macro F1, pero no se incluyen esos valores en la información disponible. No se han publicado comparaciones controladas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 1,3 GB y el frontend XLS-R-300M más la MLP requieren cargar el inicializador XLS-R-300M completo, por lo que se recomienda al menos 4-8 GB de VRAM en FP32, aunque la cifra exacta no está reportada.
- GPU recomendadas: no disponible; el entorno evaluado usó PyTorch 2.4.1+cu121 en un clúster, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más, dado el tamaño del frontend, pero no confirmado por el autor.
- Opciones de despliegue: el modelo no es compatible con vLLM, llama.cpp, Ollama ni TGI; requiere el framework DeepFense (commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`) y el inicializador original XLS-R-300M.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmoFake_Wav2Vec2_MLP_NoAug_Seed240 | no disponible (frontend XLS-R-300M) | 64.600 muestras (~4,04 s) | Frontend SSL congelado + MLP | Pesos no disponible; código Apache-2.0 | Hugging Face, requiere DeepFense |
| Modelos ASV19 de DeepFense | no disponible | 64.000 muestras | Frontend SSL ajustado | no disponible | Referenciados en la model card, sin datos de rendimiento en la información disponible |
| AASIST (backend alternativo en DeepFense) | no disponible | no disponible | Graph attention | no disponible | Integrado en el framework DeepFense |

La model card advierte que la comparación con los modelos ASV19 de DeepFense no es una ablación controlada del congelado del frontend, ya que difieren tanto en la receta de entrenamiento como en la longitud de entrada (64.000 frente a 64.600 muestras).

## Limitaciones y advertencias

- Los pesos no tienen licencia declarada; la model card no infiere una licencia de pesos a partir de la licencia Apache-2.0 del código.
- El dataset EmoFake conserva términos CC BY-NC-ND 4.0, lo que restringe el uso comercial y la creación de obras derivadas.
- Uso previsto exclusivamente para investigación en detección de deepfakes de audio.
- El EER de validación de 0,0000 % no debe interpretarse como rendimiento real; los EER en test son 27,75 % en InTheWild y 21,75 % en ASV19, valores que indican una tasa de error elevada para producción.
- El modelo solo cubre inglés y chino; no se reporta cobertura de otros idiomas.
- La entrada está fijada a 64.600 muestras; audios más largos requieren recorte o padding, lo que puede perder información.
- Riesgo de sesgo por el dominio y la composición del dataset de entrenamiento, no cuantificado en la información disponible.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación.
- No es cargable con `from_pretrained` de Transformers; requiere el framework DeepFense y el inicializador XLS-R-300M original.
- Las dos definiciones de EER (logit de bonafide frente a diferencia de logits) no deben mezclarse en evaluaciones comparativas.
- No se reportan métricas de calibración, latencia ni robustez frente a ataques adversariales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/EmoFake_Wav2Vec2_MLP_NoAug_Seed240
- Dataset EmoFake: https://huggingface.co/datasets/DeepFense/EmoFake
- Framework DeepFense: https://github.com/Yaselley/deepfense-framework
- Commit de referencia del framework: `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`
