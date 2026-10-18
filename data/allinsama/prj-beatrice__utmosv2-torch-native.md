# Allinsama/prj-beatrice__utmosv2-torch-native

## Resumen

El repositorio `Allinsama/prj-beatrice__utmosv2-torch-native` contiene una adaptación del modelo UTMOS v2, en su variante `fusion_stage3` fold-0, para predecir la calidad percibida de una señal de voz mediante una puntuación tipo MOS. Lo publica Allinsama y la adaptación se atribuye a prj-beatrice; el modelo original procede del proyecto UTMOSv2 de sarulab-speech. Resuelve la evaluación automática de audio sintético o grabado sin depender de pruebas de escucha humanas, un cuello de botella habitual en pipelines de TTS, ASR y mejora de voz.

La implementación sustituye la dependencia del paquete `utmosv2` por una carga nativa con `transformers`, `torch` y `torchaudio`, manteniendo el modelo `fusion_stage3` fold-0. Tiene 208.494.875 parámetros y un repositorio de 0,8 GB en safetensors. Es relevante para equipos que quieran integrar evaluación de calidad de voz en Python sin instalar el framework original, aunque el propio autor advierte de que los resultados pueden diferir del modelo de referencia por cambios en el generador aleatorio usado en crop sampling y Beta mixup.

No es un modelo generativo ni un LLM: su salida documentada es una puntuación de calidad. La información disponible no detalla idiomas, composición del dataset de entrenamiento ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de predicción de calidad de audio con componentes Wav2Vec2 y EfficientNetV2-S; variante `fusion_stage3` fold-0 |
| Parámetros totales | 208.494.875 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de audio; no gestiona contexto de texto) |
| Tipos de cuantización | No disponible; solo se documentan pesos safetensors. No hay versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | MIT y Apache-2.0: UTMOS v2 y el wrapper son MIT; Wav2Vec2 y EfficientNetV2-S son Apache-2.0 |
| Formato de pesos | safetensors; carga con `transformers` y `trust_remote_code` |
| Pipeline | audio-classification |
| Tamaño del repositorio | 0,8 GB |
| Entrada | waveform y `sampling_rate`; lotes con padding mediante `input_lengths` |
| Salida | puntuación de calidad tipo MOS en `scores` |

## Arquitectura y entrenamiento

La variante publicada es `fusion_stage3` fold-0. Según la información de licencia del repositorio, incluye componentes Wav2Vec2, para representaciones auto-supervisadas de voz, y EfficientNetV2-S, empleado como rama de procesamiento visual/espectral. El wrapper expone una llamada del tipo `model(wav, sampling_rate=sr).scores[0]`, con soporte para lotes padding y para seleccionar el dominio de calibración mediante `data_domain` —por defecto `"sarulab"`—.

No se documentan el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el procedimiento completo de ajuste. La model card sí indica que el puerto utiliza un generador aleatorio distinto para crop sampling y Beta mixup, por lo que la inferencia puede no reproducir exactamente los resultados del UTMOS v2 oficial.

## Capacidades

- Predicción de calidad percibida de voz: devuelve una puntuación MOS a partir de una waveform y su frecuencia de muestreo.
- Evaluación por lotes: acepta un tensor `[batch_size, max_length]` y un tensor `input_lengths` para secuencias con padding.
- Calibración por dominio: el parámetro `data_domain` permite seleccionar el dataset de calibración; el valor por defecto es `"sarulab"`.
- Control del preprocesado de silencios: permite pasar `remove_silent_section=False` para desactivar la eliminación de silencios de UTMOS v2.
- Integración en Python: carga mediante `AutoModel.from_pretrained(..., trust_remote_code=True)` y ejecución con PyTorch en CPU o GPU.
- Evaluación de audio sintético y grabado: adecuado para comparar muestras de TTS, codecs, denoising o pipelines de captura.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- Cobertura multilingüe: no documentada. El modelo trabaja sobre señal acústica, pero no se especifica comportamiento por idioma.

## Casos de uso

- Evaluación automática de TTS: puntuar lotes de muestras sintéticas para comparar voces, checkpoints o configuraciones de prosodia sin organizar pruebas de escucha humanas. Es adecuado porque devuelve una métrica objetiva y repetible por muestra.
- Control de calidad en datasets de voz: filtrar grabaciones con puntuaciones MOS bajas antes de entrenar modelos ASR o TTS, reduciendo ruido y muestras degradadas en el corpus.
- Monitorización de codecs y transmisión: comparar la puntuación de audio original frente al audio comprimido para detectar pérdidas de calidad en telefonía, VoIP o streaming.
- Evaluación de mejora de voz: medir el efecto de algoritmos de denoising, dereverberación o separación de fuentes comparando la puntuación antes y después del procesado.
- QA de pipelines de grabación: detectar micrófonos mal configurados, clipping, ruido de fondo o niveles anómalos en una cadena de captura antes de publicar contenido.
- Investigación en calidad de voz: usar el port como baseline reproducible en experimentos de predicción MOS, con la cautela de que los resultados pueden diferir del UTMOS v2 oficial por el cambio de RNG.
- Integración en CI/CD de audio: ejecutar scoring por lotes en una etapa de validación para bloquear regresiones de calidad cuando se actualiza un modelo de TTS o un codec.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de correlación MOS; tampoco se proporcionan comparaciones numéricas con UTMOS v2 oficial o UTMOS22.

## Requisitos de hardware

- VRAM estimada, no validada por el autor: los 208,5 M de parámetros ocupan aproximadamente 0,83 GB en FP32 y 0,42 GB en FP16 solo en pesos. Hay que sumar activaciones y buffers de audio; con lotes pequeños es razonable esperar un consumo total por debajo de 2-3 GB.
- GPU consumer: cabe en tarjetas de 4-6 GB o más, como RTX 3060, RTX 4060 o RTX 4090. Para lotes grandes y audios largos conviene más VRAM.
- GPU de centro de datos: A100 o H100 no son necesarias para inferencia individual; pueden ser útiles para scoring masivo por lotes.
- CPU: viable para inferencia puntual, aunque no hay latencia publicada.
- Despliegue: `transformers` con `trust_remote_code=True`, PyTorch, torchaudio y soundfile. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama; al ser un modelo de clasificación de audio con código personalizado, esas rutas no son directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Este port (`Allinsama/prj-beatrice__utmosv2-torch-native`) | 208.494.875 | No aplica | No disponible; puede diferir del oficial por el cambio de RNG | MIT y Apache-2.0 | Hugging Face |
| UTMOS v2 oficial (`fusion_stage3` fold-0) | No disponible | No aplica | No disponible en la información proporcionada | MIT, según la model card | GitHub de sarulab-speech |
| UTMOS22 | No disponible | No aplica | No disponible | No disponible | GitHub de sarulab-speech |

## Limitaciones y advertencias

- No es un LLM: no genera texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.
- Los resultados pueden diferir del UTMOS v2 oficial porque el puerto usa un generador aleatorio distinto para crop sampling y Beta mixup.
- No hay benchmarks ni métricas de correlación MOS publicadas en la información disponible.
- No se detallan sesgos, idiomas, composición del dataset ni condiciones de entrenamiento; no se puede evaluar su cobertura por dominio o por idioma.
- La carga requiere `trust_remote_code=True`; conviene auditar el código personalizado antes de ejecutarlo en producción.
- La licencia es mixta, MIT y Apache-2.0. Ambas permiten uso comercial, pero deben revisarse las obligaciones de atribución y el archivo `LICENSE`.
- El ejemplo de la model card usa el ID `prj-beatrice/utmosv2-torch-native`, distinto del ID de este repositorio (`Allinsama/prj-beatrice__utmosv2-torch-native`); hay que verificar el ID al cargar el modelo.
- La puntuación MOS es una estimación automática; no sustituye pruebas de escucha humanas en decisiones críticas.
- Los parámetros `data_domain` y `remove_silent_section` alteran la salida; deben fijarse y documentarse en producción.
- No hay cuantizaciones oficiales; no se debe asumir compatibilidad con GGUF, llama.cpp u Ollama.
- El riesgo de alucinación no aplica, pero sí el riesgo de predicción fuera de dominio o de calibración inadecuada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Allinsama/prj-beatrice__utmosv2-torch-native)
- [Archivos del repositorio](https://huggingface.co/Allinsama/prj-beatrice__utmosv2-torch-native/tree/main)
- [Repositorio alternativo citado en la model card](https://huggingface.co/prj-beatrice/utmosv2-torch-native)
- [Licencia del repositorio](https://huggingface.co/Allinsama/prj-beatrice__utmosv2-torch-native/blob/main/LICENSE)
- [UTMOSv2 en GitHub](https://github.com/sarulab-speech/UTMOSv2)
- [UTMOS22 en GitHub](https://github.com/sarulab-speech/UTMOS22)
- [Directorio de modelos de prj-beatrice](https://essamamdani.com/ai-models/company/prj-beatrice)
