# Abhisingh-18/kannada-english-slam-asr

## Resumen

El modelo `Abhisingh-18/kannada-english-slam-asr` es un sistema de reconocimiento automático del habla (ASR) bilingüe kannada-inglés con cambio de código (code-switching), desarrollado por Abhisingh-18. Se basa en la arquitectura SLAM-LLM (Speech Language Model), que combina un encoder de voz congelado, un proyector lineal y un modelo de lenguaje grande (LLM) como decodificador. En este caso, el LLM es `google/gemma-3-4b-it`, ajustado con LoRA. El repositorio contiene únicamente los pesos entrenables (adaptadores LoRA y proyector), no el modelo completo, por lo que para su uso se requiere el código base y los checkpoints de los encoders y del LLM.

El proyecto compara cinco encoders de voz congelados (data2vec-AQC con fine-tuning CTC en kannada, data2vec-AQC solo SSL, XEUS, Transformer ESPnet2 y Whisper large-v3) para determinar cuál ofrece mejor rendimiento en transcripción de habla kannada-inglés con cambio de código. Los resultados muestran que el encoder data2vec-AQC previamente afinado con CTC en kannada supera a los demás en los cuatro conjuntos de prueba evaluados. La relevancia de este trabajo radica en abordar el reconocimiento de voz para un idioma de bajos recursos (kannada) combinado con inglés, un escenario común en la India, y en ofrecer una comparación sistemática de encoders dentro de un pipeline SLAM-LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SLAM-LLM: encoder de voz congelado + proyector lineal + LLM Gemma-3-4B-IT con LoRA |
| Parametros totales | no disponible (solo adaptadores LoRA y proyector; el LLM base tiene 4B, el encoder varía según la variante) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16; no se publican cuantizaciones) |
| Idiomas soportados | kannada (kn), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (`adapter_model.bin`) |

## Arquitectura y entrenamiento

El sistema sigue el esquema SLAM-LLM: un encoder de voz preentrenado se mantiene congelado, sus características se proyectan mediante un proyector lineal (con factor de reducción de muestreo 5) y se alimentan al LLM `google/gemma-3-4b-it`, que se ajusta con LoRA (r=8, alpha=32, dropout=0.05) sobre las proyecciones `q/k/v/o/gate/up/down`. Se comparan cinco encoders: data2vec-AQC (con y sin fine-tuning CTC en kannada), XEUS (E-Branchformer SSL de ESPnet), un Transformer ASR de ESPnet2 (45M parámetros) y Whisper large-v3 (635M parámetros). El entrenamiento se realizó con datos de habla bilingüe kannada-inglés con cambio de código, aproximadamente 33.265 pasos por época, usando DeepSpeed ZeRO-2 y precisión bf16. Durante el proyecto se corrigieron varios errores específicos de cada encoder (desajustes de tasa de fotogramas, normalización, problemas de dtype bajo DeepSpeed bf16), documentados en el repositorio de código.

## Capacidades

- Reconocimiento automático del habla (ASR) para kannada e inglés, incluyendo cambio de código entre ambos idiomas.
- Transcripción de audio a texto con salida en formato de texto plano.
- Soporte para múltiples encoders de voz, lo que permite elegir el que mejor se adapte al escenario (precisión, velocidad o recursos).
- El encoder data2vec-AQC con fine-tuning CTC en kannada ofrece el mejor rendimiento en todos los testsets evaluados (WER entre 17.03% y 21.40%).
- No incluye capacidades de tool calling, agentes, visión ni razonamiento multi-paso; es exclusivamente un sistema de transcripción de voz.

## Casos de uso

- Transcripción de reuniones y conversaciones bilingües: el modelo puede transcribir audio donde los hablantes alternan entre kannada e inglés, útil para actas de reuniones en entornos corporativos o gubernamentales de Karnataka.
- Subtitulado automático de vídeos: se puede integrar en pipelines de generación de subtítulos para contenido en kannada e inglés, mejorando la accesibilidad en plataformas de vídeo.
- Asistentes de voz para servicios públicos: permite construir asistentes que entiendan comandos hablados en kannada o inglés, facilitando el acceso a servicios bancarios, sanitarios o administrativos en regiones donde predomina el kannada.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de centros de contacto para su posterior análisis de sentimiento o extracción de información, manejando el cambio de código típico en conversaciones reales.
- Investigación en ASR multilingüe: sirve como base para estudiar el impacto de diferentes encoders en un pipeline SLAM-LLM y para desarrollar mejoras en lenguas de bajos recursos.
- Generación de datos de entrenamiento: las transcripciones generadas pueden utilizarse para crear conjuntos de datos etiquetados para otros modelos de NLP o ASR en kannada.

## Benchmarks y rendimiento

El autor proporciona resultados de WER (tasa de error de palabra, menor es mejor) en cuatro conjuntos de prueba para los cinco encoders evaluados:

| Testset | data2vec-FT | data2vec-SSL | XEUS | Transformer | Whisper large-v3 |
|---|---|---|---|---|---|
| FLEURS | **21.40** | 23.97 | 25.02 | 43.22 | 25.31 |
| IndicTTS | **18.06** | 22.70 | 23.63 | 28.69 | 23.53 |
| Kathbath | **17.03** | 21.01 | 24.64 | 30.99 | 24.75 |
| Kathbath-Noisy | **17.87** | 22.20 | 29.70 | 44.94 | 30.87 |

El encoder data2vec-AQC con fine-tuning CTC en kannada (data2vec-FT) obtiene el mejor WER en todos los testsets. Whisper large-v3 es el mejor encoder de propósito general, con resultados cercanos a XEUS. El Transformer de 45M parámetros queda claramente por detrás.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación del modelo.
- Dado que el LLM base es Gemma-3-4B-IT, se estima que la inferencia requiere al menos 8 GB de VRAM en precisión bf16 solo para el LLM, más la memoria del encoder de voz (que varía según la variante; Whisper large-v3 requiere ~3 GB adicionales).
- En total, se estima un mínimo de 12-16 GB de VRAM para ejecutar el pipeline completo con los encoders más grandes. Esto cabe en GPUs de consumo como RTX 4080/4090 (16-24 GB) o en GPUs profesionales como A10/A100.
- Para despliegue, se necesita el código del repositorio `SLAM-LLM-for-Kanada` y los checkpoints base de los encoders y del LLM. No se mencionan integraciones con vLLM, llama.cpp u Ollama; el pipeline está pensado para ejecutarse con PyTorch y DeepSpeed.
- La latencia y el throughput no están documentados; dependerán del encoder elegido y del hardware.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos ASR para kannada en la información proporcionada. El propio estudio compara cinco encoders dentro del mismo pipeline, lo que constituye una comparación interna. Como referencia externa, se puede mencionar que existen modelos como IndicConformer (de AI4Bharat) para ASR en lenguas indias, pero no se aportan datos de rendimiento en este documento. Por tanto, la comparativa se limita a los encoders evaluados en el repositorio.

## Limitaciones y advertencias

- El modelo no es un sistema autónomo: requiere el código base, los checkpoints de los encoders congelados y el LLM Gemma-3-4B-IT para funcionar. Los pesos publicados son solo adaptadores LoRA y el proyector.
- No se han documentado sesgos específicos, pero al tratarse de un modelo entrenado con datos de habla bilingüe kannada-inglés, puede presentar un rendimiento inferior en acentos o dialectos no representados en los datos de entrenamiento.
- Riesgo de alucinación en la transcripción: como cualquier ASR basado en LLM, puede generar texto que no corresponde exactamente al audio, especialmente en segmentos ruidosos o con solapamiento de hablantes.
- La longitud de contexto no está especificada; se desconoce si el sistema maneja adecuadamente audios largos o si está limitado a clips cortos.
- La licencia Apache-2.0 permite uso comercial, pero los componentes base (Gemma-3-4B-IT, encoders) tienen sus propias licencias que deben verificarse.
- El entrenamiento se realizó con aproximadamente una época (33.265 pasos), lo que puede limitar la generalización del modelo en comparación con un entrenamiento más extenso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abhisingh-18/kannada-english-slam-asr
- Código del proyecto: https://github.com/Abhisingh18/SLAM-LLM-for-Kanada
- Fork original de SLAM-LLM: https://github.com/ddlBoJack/SLAM-LLM
