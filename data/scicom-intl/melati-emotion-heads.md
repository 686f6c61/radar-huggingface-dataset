# Scicom-intl/Melati-Emotion-Heads

## Resumen

Melati-Emotion-Heads es una coleccion de cinco cabezas de clasificacion de emociones disenadas para funcionar sobre codificadores acusticos congelados. Forma parte del pipeline de datos de habla del proyecto Melati, desarrollado por Scicom (MSC) Berhad, cuyo objetivo es etiquetar transcripciones de pódcast con marcas de alcance emocional del tipo `<happy>...</happy>`. Cada cabeza se entrena sobre un codificador distinto: Whisper Large V3, Melati-Whisper-Large-V3, W2V-BERT 2.0, WavLM Large y el embedding de utterance de emotion2vec+ large.

Tecnicamente, cada cabeza es un modulo pequeno que se coloca sobre un codificador congelado: se aplica mean-pooling a cada capa del codificador sobre los frames del propio clip, se aprende una mezcla softmax de las capas, se aplica LayerNorm, una capa oculta de 256 unidades y una salida de siete clases (neutral, happy, sad, angry, surprised, fearful, disgusted). El entrenamiento se realizo sobre 21 corpus de habla emocional con 67.843 clips en once idiomas, ponderando por igual cada corpus y cada clase dentro de cada corpus.

La relevancia actual del modelo radica en su uso dentro del pipeline Melati: los siete modelos promediados (estas cinco cabezas mas MERaLiON-SER y emotion2vec+) alcanzan un UAR de 0,598 y una precision del 70% en los clips de validacion, frente al 0,529 de los dos clasificadores publicos por separado. La licencia es no comercial y esta fuertemente condicionada por las licencias de los corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de clasificacion sobre codificadores acusticos congelados (mean-pooling por capa, mezcla softmax aprendida, LayerNorm, capa oculta de 256 unidades, 7 salidas) |
| Parametros totales | No disponible (cada cabeza es un modulo pequeno; los codificadores subyacentes no forman parte de los pesos distribuidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (clips de audio de hasta 30 s, 16 kHz mono float32) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Entrenado con habla en amharico, bengali, ingles, frances, aleman, italiano, persa, ruso, espanol, turco y urdu |
| Licencia | Otra (licencia personalizada `melati-emotion-heads`); uso solo para investigacion no comercial, sujeta a los terminos de cada corpus de entrenamiento |
| Formato de pesos | `.pt` (PyTorch), cinco ficheros: `whisper.pt`, `whisper_ft.pt`, `w2vbert.pt`, `wavlm.pt`, `e2v.pt` |

## Arquitectura y entrenamiento

Cada cabeza opera sobre un codificador congelado. El modulo `melati.ser.head_module(layers, dim)` realiza mean-pooling de cada capa del codificador sobre los frames del clip, aprende una mezcla softmax de las capas, aplica LayerNorm, una capa oculta de 256 unidades y produce siete salidas correspondientes a las emociones neutral, happy, sad, angry, surprised, fearful y disgusted. Los cinco codificadores utilizados son openai/whisper-large-v3, Melati-Whisper-Large-V3 (revision cdbb981c), facebook/w2v-bert-2.0, microsoft/wavlm-large y el embedding de utterance de emotion2vec+ large.

El entrenamiento se realizo sobre 21 corpus de habla emocional con un total de 67.843 clips. Los corpus se ponderan por igual en la perdida y las clases se ponderan por igual dentro de cada corpus. Los corpus incluyen CaFE (frances), CREMA-D (ingles), EMNS (ingles), EmoV-DB (ingles), Emozionalmente (italiano), Expresso (ingles), JL-Corpus (ingles neozelandes), MELD (ingles), MESD (espanol mexicano), las etiquetas de NonverbalTTS sobre Expresso (ingles), Oreau (frances), PAVOQUE (aleman), RAVDESS (ingles), RESD (ruso), SUBESCO (bengali), TurEV-DB (turco), ASED (amharico), EmoDB (aleman), eNTERFACE (ingles), ShEMO (persa) y URDU (urdu). Las cabezas fueron reentrenadas el 2026-11-04 mediante `deploy/box_emo_retrain.sh` tras la perdida del equipo que alojaba las primeras versiones.

## Capacidades

- Clasificacion de emociones en habla: produce siete salidas (neutral, happy, sad, angry, surprised, fearful, disgusted) a partir de clips de audio de 16 kHz mono float32 de hasta 30 segundos.
- Procesamiento multilingue: entrenado con habla en once idiomas (amharico, bengali, ingles, frances, aleman, italiano, persa, ruso, espanol, turco y urdu).
- Integracion en pipeline de etiquetado: los siete modelos promediados (estas cinco cabezas mas MERaLiON-SER y emotion2vec+) insertan marcas de alcance emocional en transcripciones de pódcast.
- Umbrales calibrados por emocion para el etiquetado en produccion: happy (0,52), sad (0,64), angry (0,50), surprised (0,30) y fearful (0,43), seleccionados para alcanzar un 75% de precision asumiendo una tasa de pódcast concreta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un clasificador de audio.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Etiquetado emocional de transcripciones de pódcast: el modelo inserta marcas `<happy>...</happy>` en las transcripciones alli donde la emocion supera el umbral calibrado, permitiendo busqueda y analisis semantico por emocion en archivos de audio extensos.
- Analisis de sentiment en atencion al cliente: clasificar llamadas grabadas para detectar clientes insatisfechos o frustrados y priorizar su gestion, usando los umbrales de sad, angry y fearful.
- Investigacion en linguistica afectiva: disponer de cinco cabezas sobre codificadores distintos permite comparar como diferentes representaciones acusticas capturan la emocion en un mismo corpus.
- Moderacion de contenido en plataformas de audio: detectar clips con alta probabilidad de emocion negativa (angry, fearful, disgusted) para revision humana.
- Analisis de mercado en medios: medir la carga emocional de intervenciones en pódcast y programas de radio para estudios de audiencia.
- Generacion de datos de entrenamiento: las etiquetas emocionales producidas pueden usarse como pseudo-etiquetas para entrenar modelos de sintesis de voz expresiva o sistemas de recomendacion basados en tono.
- Investigacion en reconocimiento de emociones multilingue: el modelo cubre once idiomas, lo que permite estudios comparativos entre lenguas con un mismo esquema de anotacion.

## Benchmarks y rendimiento

Los resultados publicados corresponden a unweighted average recall (UAR) sobre 7.791 clips no usados en entrenamiento (nEMO, polaco, 4.481 clips; mitad VoxCeleb de NonverbalTTS, ingles, 3.310 clips).

| Cabeza | Codificador | UAR held-out | UAR de las primeras cabezas |
|---|---|---|---|
| `whisper.pt` | openai/whisper-large-v3 | 0,550 | 0,557 |
| `whisper_ft.pt` | Melati-Whisper-Large-V3 (cdbb981c) | 0,557 | 0,542 |
| `w2vbert.pt` | facebook/w2v-bert-2.0 | 0,523 | 0,523 |
| `wavlm.pt` | microsoft/wavlm-large | 0,485 | 0,482 |
| `e2v.pt` | emotion2vec+ large (utterance embedding) | 0,523 | 0,520 |

Rendimiento del conjunto promediado (estas cinco cabezas mas MERaLiON-SER y emotion2vec+): UAR 0,598 y precision del 70% sobre los mismos clips, frente a 0,529 de los dos clasificadores publicos por separado.

Precision y recall por emocion con los umbrales calibrados:

| Emocion | Umbral | Precision | Recall |
|---|---|---|---|
| happy | 0,52 | 75% | 56% |
| sad | 0,64 | 76% | 51% |
| angry | 0,50 | 72% | 40% |
| surprised | 0,30 | 84% | 13% |
| fearful | 0,43 | 77% | 30% |

Disgusted no tiene positivos en el conjunto de validacion y nunca se etiqueta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Las cabezas son modulos pequenos (mean-pooling, LayerNorm, una capa de 256 unidades), pero requieren cargar el codificador subyacente completo (Whisper Large V3, W2V-BERT 2.0, WavLM Large o emotion2vec+ large).
- GPU recomendadas: no disponible. Dependera del codificador elegido; Whisper Large V3 (aproximadamente 1.550 millones de parametros) y WavLM Large (aproximadamente 317 millones) tienen requisitos muy distintos.
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: integracion con el codigo de Melati mediante `melati.ser.HeadSER`, cargando los ficheros `.pt` desde el directorio `ser_heads`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Melati-Emotion-Heads | Cabezas de clasificacion sobre codificadores congelados | No disponible | Clips de hasta 30 s | No comercial | Hugging Face |
| MERaLiON-SER | Clasificador de emociones en habla | No disponible | No disponible | No disponible | Publico |
| emotion2vec+ large | Codificador de emociones en habla | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos mas alla del promedio conjunto reportado en la model card (UAR 0,598 y 70% de precision para el conjunto promediado frente a 0,529 de los dos clasificadores publicos solos).

## Limitaciones y advertencias

- El habla de entrenamiento es mayoritariamente actuada y ningun corpus es de Malasia. En pódcast malasios, donde Melati ejecuta las cabezas, las etiquetas no se han medido contra juicios humanos y las tasas de pódcast detras de los umbrales son suposiciones.
- La licencia es solo para investigacion no comercial. Las cabezas se entrenaron sobre corpus con licencias no comerciales, ShareAlike, NoDerivatives (TurEV-DB) y cinco corpus sin texto de licencia, cuyos terminos no quedan levantados por estos pesos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion, especialmente en emociones con recall bajo (surprised 13%, fearful 30%).
- Disgusted nunca se etiqueta porque no hay positivos en el conjunto de validacion.
- Limitacion idiomatica: aunque se entrena con once idiomas, no hay datos de malasio ni de otras lenguas no representadas en los corpus.
- Restricciones de uso comercial: la licencia `melati-emotion-heads` impide el uso comercial y obliga a verificar los terminos de cada corpus de entrenamiento antes de cualquier uso.
- Los umbrales de etiquetado estan calibrados para una tasa de pódcast asumida y pueden no transferirse a otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Scicom-intl/Melati-Emotion-Heads
- Repositorio de Melati en GitHub: https://github.com/Scicom-AI-Enterprise-Organization/Melati
- Modelo Melati-Emotion-Whisper-Large-V3: https://huggingface.co/Scicom-intl/Melati-Emotion-Whisper-Large-V3
- Modelo Melati-Whisper-Large-V3: https://huggingface.co/Scicom-intl/Melati-Whisper-Large-V3
- Dataset Melati: https://huggingface.co/datasets/Scicom-intl/Melati
- Codificador openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- Codificador facebook/w2v-bert-2.0: https://huggingface.co/facebook/w2v-bert-2.0
- Codificador microsoft/wavlm-large: https://huggingface.co/microsoft/wavlm-large
- Codificador emotion2vec+ large: https://huggingface.co/emotion2vec/emotion2vec_plus_large
- Listado de modelos con etiqueta melati_head: https://huggingface.co/models?other=melati_head
