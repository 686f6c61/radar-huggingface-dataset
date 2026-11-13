# DeepFense/EmoFake_Wav2Vec2_MLP_NoAug_Seed42

## Resumen

EmoFake_Wav2Vec2_MLP_NoAug_Seed42 es un detector binario de deepfakes de audio desarrollado por DeepFense, entrenado sobre el split oficial de entrenamiento del dataset EmoFake. El modelo combina un frontend congelado XLS-R-300M (la variante multilingüe de wav2vec2 de fairseq) con un backend MLP ligero que proyecta las representaciones acústicas a una decisión bonafide/spoof. Se trata de uno de los tres checkpoints independientes de un estudio de reproducibilidad (semillas 2, 42 y 240), no de un ensemble.

El modelo resuelve la tarea de detección de voz sintética (speech deepfake detection): dada una grabación de audio a 16 kHz, clasifica si la voz es auténtica (bonafide) o generada/sintetizada (spoof). Su relevancia radica en que emplea un frontend SSL congelado de 300M de parámetros, lo que reduce el coste de entrenamiento y proporciona un punto de referencia claro frente a recetas que hacen fine-tuning completo del frontend.

El checkpoint se distribuye como un diccionario de DeepFense (no como un modelo de Transformers `from_pretrained`) e incluye estado del modelo, estado del optimizador y metadatos de entrenamiento. El repositorio ocupa 1,3 GB y el uso previsto es exclusivamente investigación en detección de audio deepfake.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Frontend wav2vec2 XLS-R-300M congelado + backend MLP (proyección [256, 128] con layer normalization) |
| Parámetros totales | 300M en el frontend XLS-R + MLP ligero (cifra exacta del backend no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio a 16 kHz, prefijo de 64.600 muestras ≈ 4,04 s con recorte/repetición de padding) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible (el código DeepFense es Apache-2.0; el dataset EmoFake es CC BY-NC-ND 4.0; la model card no infiere licencia de pesos) |
| Formato de pesos | `.pth` (checkpoint de DeepFense con `model_state`, estado del optimizador y metadatos) |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de dos etapas. El frontend es XLS-R-300M de fairseq (familia wav2vec2), congelado durante todo el entrenamiento, que procesa audio a 16 kHz. Cada utterance se recorta o rellena por repetición hasta un prefijo de 64.600 muestras (aproximadamente 4,04 segundos). El backend es un MLP con proyección [256, 128] y layer normalization que produce dos logits: 0 = spoof y 1 = bonafide. El checkpoint se seleccionó por EER de validación (0,0000 %), que según la propia model card es un criterio de selección y no rendimiento sobre test.

El entrenamiento se realizó sin aumentación de datos (NoAug) sobre el split oficial de train de EmoFake, con semilla 42. El runtime evaluado usó PyTorch 2.4.1+cu121 y el código de DeepFense en el commit `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`. La model card advierte que los modelos ASV19 publicados por DeepFense hacen fine-tuning del frontend SSL y usan 64.000 muestras, por lo que las comparaciones son entre recetas entrenadas, no una ablación controlada de congelación del frontend. No se especifican en la información disponible el número de tokens de audio, la composición detallada del dataset ni si hubo RLHF/DPO (no aplicable a una tarea de clasificación).

## Capacidades

- Clasificación binaria de audio: distingue voz bonafide de voz spoof (sintética) en grabaciones de 16 kHz.
- Detección de deepfakes de voz en inglés y chino, gracias al frontend multilingüe XLS-R-300M.
- Procesamiento de utterances de hasta ~4,04 s mediante recorte de prefijo o padding por repetición.
- Puntuación continua mediante logits: la diferencia `logit_bonafide - logit_spoof` y el logit bonafide del framework CrossEntropy actual son dos definiciones de score distintas que no deben mezclarse.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un clasificador de audio, no un modelo generativo.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Investigación en detección de deepfakes de voz: sirve como checkpoint de referencia con frontend congelado para comparar frente a recetas con fine-tuning completo del SSL en experimentos de reproducibilidad.
- Evaluación de robustez en benchmarks estándar: el modelo reporta resultados completos sobre InTheWild (31.779 utterances) y ASV19 (71.237 utterances), lo que permite integrarlo como baseline en protocolos de evaluación de anti-spoofing.
- Filtrado de audio sintético en pipelines de moderación: clasificar clips cortos (~4 s) como bonafide/spoof antes de publicarlos en plataformas que alojan contenido de voz generado.
- Auditoría de datasets de voz: detectar muestras sintéticas dentro de corpus de entrenamiento o evaluación en inglés y chino.
- Verificación de autenticidad en entornos de investigación forense de audio: usar el score de logit-difference como indicador continuo de probabilidad de bonafide sobre grabaciones cortas.
- Estudio de sesgos y calibración de detectores: analizar la diferencia entre las dos definiciones de score (logit bonafide vs. logit-difference) y su impacto en la EER reportada.

## Benchmarks y rendimiento

Resultados publicados por el autor para esta semilla (42) sobre los splits de test completos, sin reentrenamiento ni submuestreo:

| Objetivo held-out | Utterances | EER logit difference (%) | EER score framework actual (%) |
|---|---:|---:|---:|
| InTheWild | 31.779 | 27,3105 | 27,2945 |
| ASV19 | 71.237 | 20,2580 | 20,4787 |

Mejor EER de validación: 0,0000 % (criterio de selección del checkpoint, no rendimiento en test). La model card indica que `metrics.json` contiene hashes de protocolo, AUC, accuracy, balanced accuracy y macro F1, pero no se incluyen esos valores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el frontend XLS-R-300M en fp32 ocupa aproximadamente 1,2 GB de pesos; con overhead de activaciones y batch pequeño se estima un consumo en torno a 2-4 GB de VRAM (estimación orientativa, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para fp32; A100, H100 o RTX 4090 son suficientes y sobradas para esta carga.
- Cabe en GPU consumer: sí, en RTX 3060 (12 GB), RTX 4070, RTX 4090 y similares; también en GPUs de 4-8 GB con batch pequeño.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo de Transformers). El despliegue requiere el framework DeepFense (`test.py` con `--config` y `--checkpoint`) y PyTorch 2.4.1+cu121 o compatible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | EER ASV19 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EmoFake_Wav2Vec2_MLP_NoAug_Seed42 | XLS-R-300M congelado + MLP | 64.600 muestras (~4,04 s) | 20,2580 (logit diff) | no disponible | Hugging Face |
| Modelos ASV19 de DeepFense (fine-tuning del frontend) | XLS-R-300M con fine-tuning | 64.000 muestras | no disponible en esta ficha | no disponible | Hugging Face (DeepFense) |
| Otras semillas del mismo estudio (2 y 240) | XLS-R-300M congelado + MLP | 64.600 muestras | no disponible en esta ficha | no disponible | Hugging Face (DeepFense) |

La model card advierte explícitamente que la comparación con los modelos ASV19 de DeepFense no es una ablación controlada de congelación del frontend, ya que difieren tanto en fine-tuning como en longitud de entrada. No se dispone de datos de benchmarks de modelos externos (p. ej. AASIST, RawNet2) en la información proporcionada.

## Limitaciones y advertencias

- EER elevada en test: 27,31 % en InTheWild y 20,26 % en ASV19, muy lejos de un uso en producción sin supervisión.
- El 0,0000 % de EER de validación es un criterio de selección de checkpoint y no debe interpretarse como rendimiento real; existe riesgo de sobreajuste al split de validación.
- El checkpoint no es un modelo de Transformers: requiere DeepFense y la inicialización original de XLS-R-300M en `model.frontend.args.ckpt_path`; no se puede sustituir por un encoder Wav2Vec2 pequeño.
- Dos definiciones de score incompatibles (logit bonafide del framework vs. logit-difference); mezclarlas invalida las comparaciones de EER.
- Idiomas limitados a inglés y chino; comportamiento en otras lenguas no documentado.
- Entrada limitada a ~4,04 s por recorte de prefijo o padding por repetición, lo que puede descartar información en audios largos.
- Licencia de pesos no disponible; el dataset EmoFake es CC BY-NC-ND 4.0, lo que restringe el uso comercial de los datos de entrenamiento. Uso previsto: investigación.
- Sin datos publicados sobre sesgos demográficos, acentos o calidad de grabación; riesgo de falsos positivos/negativos en dominios distintos del de entrenamiento.
- Requiere carga estricta del state dict (`strict=True`) para reproducir los resultados; una carga laxa puede alterar las métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DeepFense/EmoFake_Wav2Vec2_MLP_NoAug_Seed42
- Dataset EmoFake: https://huggingface.co/datasets/DeepFense/EmoFake
- Código DeepFense: https://github.com/Yaselley/deepfense-framework
- Commit del framework: `3f2fe1146c48ea4bacc480dd96d806b6c72c09cf`
