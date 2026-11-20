# HeartMuLa/HeartCodec-oss-20260123

## Resumen

HeartCodec-oss-20260123 es un códec neuronal de música desarrollado por HeartMuLa, el equipo detrás de la familia de modelos fundacionales de música HeartMuLa. No es un modelo generativo de texto ni de audio en el sentido convencional: es el componente de decodificación de audio de un sistema de generación musical por tokens. Concretamente, convierte secuencias de tokens RVQ (Residual Vector Quantization) en audio estéreo a 48 kHz, y junto al encoder asociado permite reconstruir audio en ocho flujos de tokens a una tasa de 12,5 Hz.

El checkpoint contiene 1.659.568.725 parámetros en formato safetensors (aproximadamente 6,6 GB en el repositorio) y se distribuye bajo licencia Apache 2.0. Su función principal es servir como decodificador compartido para los modelos HeartMuLa de generación musical: los modelos generativos producen tokens del códec y este checkpoint los transforma en señal de audio. La versión 20260123 mejora la calidad de decodificación respecto a releases anteriores.

La relevancia actual del modelo radica en que forma parte de un ecosistema abierto de modelos fundacionales de música, un área donde la mayoría de soluciones punteras (Suno, Udio) son propietarias. HeartCodec aporta la pieza de compresión y reconstrucción de audio necesaria para que los modelos generativos operen sobre representaciones discretas eficientes en lugar de muestras de audio crudas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Códec neuronal de audio con cuantización vectorial residual (RVQ); detalles internos de la red no disponibles en la información proporcionada |
| Parametros totales | 1.659.568.725 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre secuencias de tokens a 12,5 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible describe HeartCodec como un códec de música a 12,5 Hz con alta fidelidad de reconstrucción. Emplea cuantización vectorial residual (RVQ) para representar el audio como ocho flujos de tokens discretos, que se decodifican de vuelta a audio estéreo a 48 kHz. El checkpoint liberado contiene el cuantizador RVQ compartido y el decodificador de audio; el encoder se distribuye por separado en el repositorio HeartCodec-oss-encoder.

No se han publicado en la información proporcionada detalles sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la propia arquitectura RVQ y la tasa de tokens de 12,5 Hz. La model card remite al paper (arXiv:2601.10547) y al repositorio heartlib para los detalles completos de arquitectura e inferencia.

## Capacidades

- Decodificación de tokens RVQ a audio estéreo a 48 kHz.
- Reconstrucción de audio de alta fidelidad cuando se combina con el encoder HeartCodec-oss-encoder.
- Representación de audio en ocho flujos de tokens a 12,5 Hz, adecuada como espacio latente discreto para modelos generativos.
- Integración como decodificador de los modelos de generación musical HeartMuLa (por ejemplo, HeartMuLa-oss-3B-happy-new-year).
- No realiza generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en sentido textual (es un modelo de audio).

## Casos de uso

- Generación musical con HeartMuLa: los modelos generativos producen tokens del códec y este checkpoint los decodifica a audio final; es el paso obligatorio para obtener la pista reproducible a partir de la salida del modelo de lenguaje musical.
- Reconstrucción y re-síntesis de audio: emparejado con el encoder, permite convertir audio a tokens y volver a audio, útil para pipelines de edición o transformación en el dominio discreto.
- Edición musical por segmentos en MuLa Studio: al operar sobre tokens de 12,5 Hz, permite modificar pasajes concretos de una canción y re-decodificar solo esa región.
- Creación de covers y remixes: el espacio de tokens RVQ facilita la manipulación de la representación musical para generar variantes manteniendo la estructura.
- Investigación en modelos fundacionales de música: sirve como componente de decodificación reproducible y de código abierto para experimentos académicos sobre representaciones discretas de audio.
- Construcción de pipelines de compresión de audio musical: la representación a 12,5 Hz y ocho flujos ofrece una tasa de tokens baja que reduce el coste computacional de modelos generativos que operen sobre ella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 1.659.568.725 parámetros en safetensors (aproximadamente 6,6 GB en FP16/BF16), se requiere al menos esa cantidad de memoria más overhead para el decodificador y el cuantizador.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de pesos (unos 6,6 GB) podría caber en GPUs de consumo con 8-12 GB o más, pero no se ha verificado en la documentación.
- Opciones de despliegue: el autor remite al repositorio heartlib para instalación, disposición de checkpoints e inferencia; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de códecs musicales neuronales (por ejemplo, EnCodec, DAC o SoundStream) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Por tanto, la comparativa se marca como no disponible.

## Limitaciones y advertencias

- El modelo no es generativo por sí mismo: solo decodifica tokens RVQ; requiere un modelo generativo (HeartMuLa) o el encoder correspondiente para ser útil.
- No se han documentado sesgos específicos, pero al ser un códec entrenado sobre un corpus musical no especificado, puede heredar sesgos de distribución del dataset (géneros, instrumentación, producción).
- Riesgo de artefactos de reconstrucción en pasajes con contenido espectral extremo, percusión densa o señales fuera de la distribución de entrenamiento; no cuantificado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos HeartMuLa asociados y del dataset de entrenamiento, no detalladas aquí.
- No se especifican limitaciones de contexto ni de idioma porque el modelo opera sobre audio, no sobre texto.
- Para producción, es necesario revisar el repositorio heartlib y el paper para conocer la latencia real, los requisitos exactos de memoria y las dependencias de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Encoder asociado: https://huggingface.co/HeartMuLa/HeartCodec-oss-encoder
- Modelo generativo asociado: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Repositorio GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Sitio web: https://heartmula.com/
