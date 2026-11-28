# Eliel60/Vortex-Kongo-MT

## Resumen

Vortex-Kongo-MT es un modelo de traducción automática neuronal desarrollado por el equipo Vortex (Eliel Mulongo y Pascal Mutaka) para el desafío Kongo MT de la plataforma Zindi. Se trata de un ajuste fino del modelo pretrenado `facebook/nllb-200-distilled-1.3B` que cubre diez direcciones de traducción entre el francés y cinco lenguas bantúes de la República Democrática del Congo: shi (shr), havu (hav), ngombe (ngc), yansi (yns) y taabwa (tap), en ambos sentidos.

El modelo resuelve un problema de traducción de muy bajos recursos: las cinco lenguas objetivo no disponen de etiqueta de idioma propia en NLLB-200, por lo que el autor reasigna etiquetas de lenguas bantúes relacionadas ya presentes en el tokenizador (kin, run, lin, kon, bem) como aproximación. Un único modelo cubre las diez direcciones, lo que simplifica el despliegue frente a la alternativa de entrenar diez modelos separados.

Es relevante como ejemplo reproducible de adaptación de un modelo multilingüe masivo a lenguas africanas de bajos recursos con recursos de cómputo limitados (una sola GPU T4 en Kaggle), y por documentar de forma transparente el proceso completo: datos, hiperparámetros, decodificación y script de inferencia. El repositorio ocupa 5,5 GB e incluye el checkpoint, el script `predict.py`, el cuaderno de entrenamiento y el CSV de la mejor sumisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (NLLB-200, traducción condicional) |
| Parametros totales | 1,3 mil millones (modelo base `facebook/nllb-200-distilled-1.3B`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens de entrada (truncación); 256 tokens máximos de salida (`max_new_tokens=256`) |
| Tipos de cuantizacion | no disponible (checkpoint en fp16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | fr, shr, hav, ngc, yns, tap (10 direcciones: fr↔cada una de las cinco lenguas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards, `model-0000X-of-00002.safetensors`), tokenizer SentencePiece BPE |

## Arquitectura y entrenamiento

El modelo parte de `facebook/nllb-200-distilled-1.3B`, un transformer encoder-decoder multilingüe de Meta AI. El ajuste fino se realizó sobre una única GPU T4 en Kaggle con semilla 42, optimizador Adafactor, label smoothing de 0,1, precisión fp16, gradient checkpointing, longitud máxima de 128 y batch efectivo de 32. Se usó exclusivamente el `Train.csv` proporcionado por el desafío, sin datos externos, aplicando sobremuestreo por temperatura (alpha = 0,3) para reforzar las direcciones con menos datos (havu, taabwa, yansi).

El entrenamiento se dividió en dos ejecuciones. La primera partió del modelo base, con 1,2 épocas, learning rate 1e-4 y warmup de 500 pasos, reservando un 5 % de los versos para validación (chrF++ de 46,9 con NLLB-600M frente a 51,8 con NLLB-1.3B en la primera ejecución). La segunda continuó desde la primera, con 1,3 épocas, learning rate 5e-5, warmup de 100 pasos y el 100 % de `Train.csv` (`--train_on_val`); este es el checkpoint enviado. En total, 82.670 pares de entrenamiento tras el sobremuestreo, 3.358 pasos y aproximadamente 9 h 14 min de entrenamiento. La decodificación usa beam search de tamaño 5, `max_new_tokens=256`, truncación de entrada a 256, `repetition_penalty=1,1` y batch de 16 en fp16, seguida de un postprocesado que colapsa frases repetidas tres o más veces consecutivas para mitigar bucles de generación.

## Capacidades

- Traducción automática en diez direcciones entre francés y las lenguas shi, havu, ngombe, yansi y taabwa.
- Un solo modelo y un solo checkpoint para todas las direcciones, seleccionando el par mediante `tokenizer.src_lang` y `forced_bos_token_id`.
- Manejo de entradas de hasta 256 tokens con truncación explícita.
- Generación con beam search configurable y penalización de repetición para reducir bucles.
- Postprocesado específico contra repeticiones consecutivas de frases.
- Inferencia por lotes (batch de 16 por defecto) sobre GPU en fp16.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento; el modelo es exclusivamente de traducción.

## Casos de uso

- Traducción de documentación administrativa y textos oficiales del francés a lenguas bantúes congoleñas: el modelo permite generar versiones en shi, havu, ngombe, yansi o taabwa de comunicados y formularios, aprovechando que un único checkpoint cubre las diez direcciones.
- Localización de contenido educativo: traducción de materiales escolares del francés a lenguas locales para programas de alfabetización, con lotes de 16 frases y truncación a 256 tokens por segmento.
- Subtitulado y transcripción multilingüe: traducción de guiones o transcripciones del francés a las cinco lenguas para medios comunitarios, usando beam search de tamaño 5 para mejorar la fluidez.
- Investigación lingüística sobre lenguas bantúes de bajos recursos: el checkpoint y el código de entrenamiento permiten reproducir el ajuste fino y servir de línea base para experimentos con reasignación de etiquetas NLLB.
- Procesamiento por lotes de corpus paralelos: el script `predict.py` acepta un CSV con columnas `ID, SOURCE_LANG, SOURCE_TEXT, TARGET_LANG` y produce `ID, TARGET`, lo que facilita la traducción masiva de datasets.
- Evaluación de sistemas de traducción en el marco de Zindi: el modelo y la sumisión permiten reproducir la puntuación pública de 0,4826 y comparar variantes de decodificación o datos.
- Prototipado de asistentes de atención ciudadana en francés y lenguas locales: integrable vía `transformers==4.46.3` en un servicio de inferencia por lotes, aunque con la limitación de contexto de 256 tokens.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Puntuación pública Zindi (chrF++) | 0,4826 | Mejor sumisión (`submission.csv`) |
| Validación local chrF++ (NLLB-600M) | 46,9 | 5 % de versos reservados |
| Validación local chrF++ (NLLB-1.3B, run 1) | 51,8 | 5 % de versos reservados |
| Tiempo de entrenamiento | ~9 h 14 min | 3.358 pasos, 1× T4, run 2 |
| Tiempo de inferencia | ~14 min | 3.550 filas de test, 0 predicciones vacías |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; las métricas anteriores son específicas del desafío Kongo MT.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3 GB para los pesos (1,3 B parámetros) más memoria de activaciones y caché de beam search; en la práctica, una GPU con 8-16 GB es suficiente.
- GPU utilizadas en el desarrollo: una sola NVIDIA T4 (16 GB) en Kaggle, con `CUDA_VISIBLE_DEVICES=0`.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM (por ejemplo RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4090). No se documenta ejecución en CPU ni cuantizaciones de 4 bits.
- Opciones de despliegue: `transformers==4.46.3` con `sentencepiece` y `torch`, mediante el script `predict.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: inferencia de 3.550 filas en aproximadamente 14 minutos con batch 16 en fp16 sobre T4 (unas 4,2 filas por segundo); no se publican cifras de latencia por petición.
- Requisito de reproducibilidad: los resultados idénticos exigen GPU, fp16 y batch de 16, según los valores por defecto de `predict.py`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vortex-Kongo-MT | 1,3 B | 256 tokens | fr + 5 lenguas bantúes (10 direcciones) | no disponible | Hugging Face (repo de 5,5 GB) |
| `facebook/nllb-200-distilled-1.3B` | 1,3 B | 512 tokens (típico en NLLB) | 200 lenguas, sin las cinco objetivo | CC-BY-NC 4.0 (modelo base de Meta) | Hugging Face |
| `facebook/nllb-200-distilled-600M` | 600 M | 512 tokens (típico en NLLB) | 200 lenguas, sin las cinco objetivo | CC-BY-NC 4.0 (modelo base de Meta) | Hugging Face |
| `facebook/nllb-200-3.3B` | 3,3 B | 512 tokens (típico en NLLB) | 200 lenguas, sin las cinco objetivo | CC-BY-NC 4.0 (modelo base de Meta) | Hugging Face |

La comparación directa de rendimiento con los modelos base no está disponible: el autor solo reporta chrF++ local de 46,9 (NLLB-600M) frente a 51,8 (NLLB-1.3B) en la primera ejecución del ajuste, sin detallar los resultados del modelo base sin ajustar en las mismas condiciones.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: antes de cualquier uso comercial es imprescindible verificar los términos, teniendo en cuenta que el modelo base NLLB-200 de Meta se distribuye bajo CC-BY-NC 4.0, lo que restringe el uso comercial.
- Las cinco lenguas objetivo no tienen etiqueta propia en NLLB: se reutilizan etiquetas de lenguas bantúes relacionadas (kin, run, lin, kon, bem), lo que puede introducir interferencias y sesgos hacia esas lenguas.
- Riesgo de bucles de generación: el propio autor aplica un postprocesado para colapsar frases repetidas tres o más veces, señal de que el modelo puede entrar en repeticiones sin esa corrección.
- Contexto limitado a 256 tokens de entrada con truncación: textos largos se cortan y pueden perder información; no apto para documentos extensos sin segmentación previa.
- Entrenado exclusivamente con `Train.csv`, sin datos externos: cobertura léxica y de dominios limitada a la distribución del corpus del desafío.
- Riesgo de alucinación y de traducciones inexactas en direcciones con pocos datos (havu, taabwa, yansi), que requirieron sobremuestreo por temperatura.
- Puntuación pública Zindi de 0,4826 (chrF++): calidad moderada, insuficiente para traducción profesional sin revisión humana.
- Reproducibilidad dependiente del hardware: salidas idénticas solo con GPU fp16 y batch 16; en CPU u otras configuraciones los resultados pueden variar.
- No se documentan evaluaciones de sesgos, robustez ni seguridad; el uso en producción requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Eliel60/Vortex-Kongo-MT
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Desafío Kongo MT en Zindi: no disponible (no se incluye URL en la información proporcionada)
- Paper de NLLB-200 (No Language Left Behind): no disponible en la información proporcionada
- Repositorio de código del autor: no disponible (los archivos `predict.py`, `notebook.ipynb` y `kongo_mt.py` están dentro del repositorio de Hugging Face)
