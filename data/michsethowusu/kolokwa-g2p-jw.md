# michsethowusu/kolokwa-g2p-jw

## Resumen

`kolokwa-g2p-jw` es un modelo de conversión grafema-a-fonema (G2P) para inglés liberiano y kolokwa, desarrollado por el usuario de Hugging Face `michsethowusu` en el marco de la iniciativa Liberia Speech & Kolokwa Corpus. Su función es transformar texto ortográfico en transcripción fonética IPA, un paso previo imprescindible en pipelines de síntesis de voz (TTS) y en herramientas de fonemización para variedades del inglés poco representadas en los recursos estándar.

El modelo emplea una arquitectura Forward Transformer no autorregresiva de 6 capas, con una dimensión oculta de 512, dimensión de feed-forward de 1024 y 4 cabezas de atención. Se distribuye como un checkpoint ligero de aproximadamente 59 MB (`best_model.pt`) construido sobre `arcosoph/phonemize` (arquitectura DeepPhonemizer), que incorpora un diccionario de pronunciación integrado y un lexicón de 12.161 pares palabra-fonema extraídos mediante alineamiento dinámico monótono.

Su relevancia radica en cubrir dos variedades (inglés liberiano, código `en_lr`, y kolokwa) prácticamente ausentes en los fonemizadores comerciales y en los lexicones estándar como CMUdict. Al ser un modelo no autorregresivo y de tamaño reducido, ofrece una velocidad de inferencia muy alta (del orden de decenas de miles de palabras por segundo), lo que lo hace adecuado para procesar corpus completos o para integrarse en sistemas TTS de baja latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Forward Transformer no autorregresivo (DeepPhonemizer) |
| Parámetros totales | no disponible (checkpoint de ~59 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo G2P a nivel de palabra/oración) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés liberiano, `en_lr`), kqr, lir |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

Detalles adicionales de arquitectura: 6 capas, `d_model` = 512, `d_fft` = 1024, 4 cabezas de atención. El repositorio incluye `config.yaml`, `lexicon.tsv` (12.161 entradas), scripts de preparación de datos, entrenamiento e inferencia.

## Arquitectura y entrenamiento

El modelo es un Forward Transformer no autorregresivo, una variante de la arquitectura Transformer diseñada para mapear secuencias de entrada a secuencias de salida de longitud similar sin generación token a token. Esta elección permite paralelizar por completo la inferencia y obtener una velocidad muy elevada. La implementación procede de `arcosoph/phonemize`, que sigue la arquitectura DeepPhonemizer, e incorpora un diccionario de pronunciación integrado además del componente neuronal.

El entrenamiento se realizó estrictamente sobre el dataset `michsethowusu/kolokwa-text-ipa-jw`, compuesto por 58.897 enunciados alineados con voz. A partir de ellos se extrajo un lexicón limpio de 12.161 pares palabra-fonema mediante un alineador de programación dinámica monótono paralelo (`prepare_data.py`), con selección de la moda empírica de frecuencia para cada palabra. El modelo final se entrenó sobre ese lexicón con `train.py`. No se documenta en la información disponible el uso de RLHF, DPO ni el número de tokens de entrenamiento.

## Capacidades

- Conversión grafema-a-fonema (G2P) a transcripción IPA para inglés liberiano y kolokwa.
- Fonemización a nivel de palabra y de oración completa, con salida en IPA.
- Manejo de rasgos fonéticos propios de la variedad: vocales nasales (p. ej. `mæ̃n`), oclusivas aspiradas (`tʰ`, `kʰ`, `pʰ`), vibrante rótica (`ə˞`, `ɔ˞`) y consonantes finales simplificadas.
- Inclusión de un lexicón de pronunciación integrado (12.161 entradas) que actúa como respaldo determinista.
- Inferencia no autorregresiva de alta velocidad (~98.000 palabras/s en GPU, ~25.000 palabras/s en CPU según la model card).
- Ejecución en CPU sin requisitos de GPU, gracias al tamaño reducido del modelo.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento; su alcance es exclusivamente la fonemización.

## Casos de uso

- Síntesis de voz (TTS) para inglés liberiano y kolokwa: el modelo genera la secuencia IPA que alimenta un sintetizador acústico, cubriendo variedades sin lexicón estándar. Su velocidad permite fonemizar textos largos en tiempo real.
- Normalización fonética de corpus de habla: procesar transcripciones ortográficas de `liberian-english-speech` y convertirlas a IPA para alinear con audio o entrenar modelos acústicos.
- Preprocesamiento de datasets TTS: fonemizar grandes volúmenes de texto (decenas de miles de palabras por segundo) antes de entrenar modelos de voz, reduciendo el cuello de botella de preprocesado.
- Herramientas de pronunciación y diccionarios: generar entradas IPA para aplicaciones educativas o de aprendizaje de inglés liberiano.
- Investigación lingüística: estudiar correspondencias grafema-fonema en kolokwa y comparar con el inglés estándar mediante el lexicón exportado.
- Integración en pipelines de ASR: usar las transcripciones IPA como etiquetas fonéticas para modelos de reconocimiento de habla en variedades liberianas.
- Despliegue en entornos sin GPU: al ejecutarse a ~25.000 palabras/s en CPU, puede incorporarse en servicios modestos o en dispositivos sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de velocidad de inferencia (~98.000 palabras/s en GPU y ~25.000 palabras/s en CPU), sin datos de precisión (PER/WER fonémico) frente a otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima; el checkpoint ocupa ~59 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Una RTX 4090 o A100 no aportan ventaja funcional más allá del throughput.
- Cabe en GPU consumer: sí, en todas (incluso integradas), y funciona en CPU.
- Opciones de despliegue: librería `phonemize` (Python), script `inference.py` (CLI); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~98.000 palabras/s en GPU y ~25.000 palabras/s en CPU según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kolokwa-g2p-jw | G2P Forward Transformer | en_lr, kqr, lir | ~59 MB | MIT | Hugging Face |
| DeepPhonemizer (genérico) | G2P Forward Transformer | múltiples (inglés estándar) | variable | MIT | GitHub / PyPI |
| eSpeak NG | G2P basado en reglas | múltiples | ligero | GPL | Repositorio abierto |
| CMUdict + G2P estándar | Lexicón + reglas | inglés americano | n/a | BSD-like | Distribución libre |

No se dispone de datos comparativos de precisión entre estos sistemas en la información proporcionada; la comparación se limita a características estructurales. La ventaja diferencial de `kolokwa-g2p-jw` es la cobertura de inglés liberiano y kolokwa, ausente en las alternativas genéricas.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre 12.161 entradas de lexicón; la cobertura de vocabulario es limitada y las palabras fuera del lexicón dependen de la generalización del transformer, con posible degradación en términos raros o préstamos.
- Específico de las variedades liberianas; su uso sobre inglés estándar u otras variedades puede producir transcripciones sesgadas hacia la fonología kolokwa.
- No se han publicado métricas de precisión fonémica (PER/WER), por lo que el rendimiento real no está cuantificado de forma independiente.
- Riesgo de alucinación fonémica en entradas ambiguas u ortografías no vistas; se recomienda validación con hablantes nativos.
- Sin datos documentados sobre sesgos sociolingüísticos ni sobre el equilibrio del corpus de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el corpus y revisar los términos del dataset de origen.
- El modelo solo produce fonemas; no genera audio. Requiere un sintetizador TTS posterior para aplicaciones de voz.
- La model card referencia `michsethowusu/kolokwa-g2p` en los ejemplos de código, mientras que el ID del repositorio es `michsethowusu/kolokwa-g2p-jw`; conviene verificar la ruta exacta al descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/michsethowusu/kolokwa-g2p-jw
- Dataset de texto-IPA: https://huggingface.co/datasets/michsethowusu/kolokwa-text-ipa-jw
- Dataset de habla: https://huggingface.co/datasets/michsethowusu/liberian-english-speech
- Librería `phonemize`: https://github.com/arcosoph/phonemize
