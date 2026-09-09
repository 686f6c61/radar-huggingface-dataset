# darsh-sharma374/whisper-zurich-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para el modelo de reconocimiento de voz `openai/whisper-small`, afinado específicamente para el dialecto alemán suizo de Zúrich (Zürich Swiss German). El adaptador fue desarrollado por Darsh Sharma como parte del proyecto Sprich+, cuyo objetivo es mejorar la utilidad del reconocimiento de voz suizo para estudiantes y usuarios cotidianos.

El modelo base Whisper Small, con unos 245,27 millones de parámetros, apenas reconoce bien los dialectos suizos. El adaptador añade aproximadamente 3,54 millones de parámetros entrenables, es decir, un 1,44 % del total, dejando el resto congelado. Gracias a este ajuste, el error de transcripción (WER) sobre un conjunto de test del dialecto de Zúrich baja de un 40,44 % en el modelo original a un 34,06 % con el adaptador.

La relevancia de este modelo radica en que demuestra una forma eficiente de adaptar sistemas ASR multilingües a dialectos regionales sin necesidad de reentrenar el modelo completo. Se enmarca en el campo de la adaptación de bajo rango (LoRA) aplicada a la fonética regional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre openai/whisper-small (encoder-decoder Transformer) |
| Parámetros totales | 3,54 millones (adaptador LoRA); 245,27 millones (modelo base) |
| Parámetros activos | No aplicable (no es un modelo MoE; los parámetros entrenables son 3,54 millones) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el adaptador se distribuye sin cuantización) |
| Idiomas soportados | Alemán suizo de Zúrich (swi), alemán (de), inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo consiste en un adaptador LoRA aplicado a los módulos `q_proj` y `v_proj` del modelo Whisper Small. Esta técnica congela los pesos originales y aprende matrices de bajo rango de rango 32 y alpha 64, con dropout 0,05 y sin sesgo.

El entrenamiento se realizó con el subconjunto del dialecto de Zúrich del corpus STT4SG-350, que proporciona SwissNLP. Tras filtrar por región y resamplear a 16 kHz, se obtuvo un total de 2.812 muestras de entrenamiento y 703 de test (80/20 con semilla 42). La configuración de entrenamiento incluyó un lote efectivo de 16 (lote por dispositivo de 4 con acumulación en 4 pasos), tasa de aprendizaje de `1e-4`, 500 pasos de entrenamiento y precisión FP16, todo ejecutado en una GPU T4 de Google Colab. No se aplicó RLHF ni DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) para el dialecto alemán suizo de Zúrich, con salida en formato de texto alemán.
- Mejora sobre el modelo base: reduce el WER de 40,44 % a 34,06 % en el conjunto de test de la misma distribución dialectal.
- Adaptación ligera: al ser un adaptador LoRA, se puede integrar sobre `openai/whisper-small` sin modificar todos los pesos, lo que facilita la experimentación.
- Devolución de confianza: el proyecto Sprich+ usa el modelo para ofrecer una puntuación de confianza estimada junto a la transcripción.
- Soporte multilingüe limitado: el adaptador está especializado en el dialecto de Zúrich, pero el modelo base Whisper Small es multilingüe (el repositorio etiqueta `de`, `en`, `swi`).
- No dispone de capacidades de tool calling, visión, agentes ni modo de razonamiento; es exclusivamente un modelo de ASR de bajo parámetro.

## Casos de uso

- Transcripción de clases de idioma suizo alemán: puede convertir automáticamente el habla de un instructor de Zúrich en texto, lo que resulta útil para materiales de aprendizaje de Sprich+.
- Investigación en dialectología: transcribir grabaciones de campo de hablantes de la región de Zúrich para análisis a gran escala, aprovechando que el adaptador reduce el WER frente a Whisper base.
- Subtitulado de vídeos y entrevistas: integrar el adaptador en un pipeline de ASR para generar subtítulos de contenido local suizo, mejorando la precisión en comparación con Whisper Small sin adaptar.
- Asistentes de voz para servicios públicos de Zúrich: permite construir sistemas de dictado para consultas de administración o banca en alemán suizo, siempre que el audio sea de calidad aceptable.
- Evaluación comparativa de adaptadores ASR: sirve como referencia para medir la eficacia de LoRA en dialectos regionales, ya que incluye métricas de WER sobre un conjunto de test fijo.
- Aplicación educativa de confianza: como en Sprich+, un usuario habla en suizo de Zúrich y recibe la transcripción junto a una estimación de confianza, útil para ejercicios de pronunciación.

## Benchmarks y rendimiento

La única evaluación publicada es la del Word Error Rate (WER) sobre el conjunto de test del dialecto de Zúrich. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) porque se trata de un adaptador de reconocimiento de voz, no de un modelo de lenguaje.

| Modelo | Conjunto | WER |
|---|---|---|
| `openai/whisper-small` | Test de Zúrich | 40,44 % |
| `darsh-sharma374/whisper-zurich-lora` | Test de Zúrich | 34,06 % |

703 muestras de test (20 % del total del subconjunto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador solo añade unos 3,54 millones de parámetros sobre el modelo base.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una GPU T4 de Google Colab.
- ¿Cabe en consumer GPU? No disponible. Dado el pequeño tamaño del adaptador, se espera que quepa en GPUs de consumo, pero no se proporciona una cifra exacta en la información disponible.
- Opciones de despliegue: No disponible. La integración se realiza mediante PEFT sobre `transformers`; la card no menciona vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (WER Zúrich) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `openai/whisper-small` | 245,27 millones | No disponible | 40,44 % | No disponible | Repositorio público en Hugging Face |
| `darsh-sharma374/whisper-zurich-lora` | 3,54 millones (adaptador LoRA) | No disponible | 34,06 % | No disponible | Repositorio público en Hugging Face |
| Otros adaptadores LoRA para dialectos suizos | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgo dialectal: el adaptador se entrenó exclusivamente con habla de la región de Zúrich; su rendimiento puede degradarse significativamente con otros dialectos suizos o con hablantes con patrones de pronunciación diferentes.
- Riesgo de alucinación: al estar basado en Whisper, el sistema puede producir texto incorrecto o alucinado, especialmente en grabaciones ruidosas, habla poco clara o distante, y en palabras o nombres poco comunes.
- Limitación del conjunto de datos: la evaluación se realizó sobre un subconjunto del mismo corpus STT4SG-350, por lo que el WER reportado puede no generalizar a datos del mundo real.
- Restricciones de licencia del dataset: el corpus STT4SG-350 se distribuye bajo la licencia META-SHARE ResearchUsageOnly NoRedistribution, lo que puede limitar el uso comercial o la redistribución de los datos; la licencia del adaptador en Hugging Face no está especificada.
- Falta de soporte en producción: la aplicación Sprich+ recomienda no tratar la puntuación de confianza como una probabilidad garantizada de que la transcripción sea correcta.

## Enlaces

- Hugging Face: https://huggingface.co/darsh-sharma374/whisper-zurich-lora
- Repo de OpenAI Whisper: https://github.com/openai/whisper
- SwissNLP: https://swissnlp.org/home/activities/datasets/
- Paper STT4SG-350: https://doi.org/10.5281/zenodo.10012815
