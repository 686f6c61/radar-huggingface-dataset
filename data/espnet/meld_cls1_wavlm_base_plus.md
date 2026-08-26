# espnet/meld_cls1_wavlm_base_plus

## Resumen

`espnet/meld_cls1_wavlm_base_plus` es un modelo de clasificación de emociones en audio desarrollado por el equipo de ESPnet (entrenado por *itoten*). Está diseñado para reconocer siete emociones (neutral, alegría, sorpresa, enfado, tristeza, asco y miedo) a partir de señales de voz de 16 kHz, y se ha entrenado sobre el conjunto de datos MELD (Multimodal EmotionLines Dataset). Utiliza como frontend el modelo WavLM Base+ de Microsoft, congelado durante el entrenamiento, y un codificador Transformer pequeño como clasificador de secuencias.

El modelo es relevante porque ofrece un pipeline completo y reproducible para el análisis de emociones en voz dentro del ecosistema ESPnet, lo que permite integrarlo fácilmente en tareas de análisis de sentimiento, atención al cliente o investigación en interacción persona-máquina. Su tamaño de repositorio es de 0,4 GB, lo que sugiere un modelo ligero y desplegable en entornos con recursos moderados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Frontend WavLM Base+ (congelado) + Encoder Transformer (4 bloques, 4 cabezas, 128 unidades) + Decoder lineal |
| Parámetros totales | No disponible (el frontend WavLM Base+ tiene ~317 millones, pero el modelo completo no se especifica) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada de audio, no texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | No disponible (formato nativo de ESPnet, probablemente .pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de clasificación de audio de ESPnet2. El frontend está basado en el extractor `s3prl` con el modelo preentrenado `wavlm_base_plus`, que se congela durante el entrenamiento (`freeze_param: frontend.upstream`). Este frontend extrae características de múltiples capas del modelo WavLM, a una frecuencia de muestreo de 16 kHz. A continuación, un encoder Transformer de 4 bloques, con 128 unidades de salida, 4 cabezas de atención y 1024 unidades lineales, procesa las características. Finalmente, un decodificador lineal produce la clasificación multiclase sobre 7 etiquetas de emoción más una etiqueta `<unk>`.

El entrenamiento se realizó con la receta `meld` de ESPnet, durante 30 épocas, con tamaño de lote de 32, optimizador Adam (lr 0.001) y un scheduler de warmup de 3180 pasos. La normalización de las características se hace con `utterance_mvn`. El modelo fue entrenado en una sola GPU y el criterio de selección de mejor modelo fue la precisión (acc) en el conjunto de validación.

## Capacidades

- Clasificación de emociones en voz en 7 categorías: neutral, alegría, sorpresa, enfado, tristeza, asco y miedo.
- Entrada de audio a 16 kHz, con soporte para archivos de duración variable (hasta 10 segundos según la configuración de chunking).
- Uso de características de múltiples capas del modelo WavLM, lo que permite capturar información prosódica y acústica rica.
- No es un modelo generativo; no genera texto ni respuestas. Es puramente un clasificador de emociones.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso.
- Limitado al idioma inglés (las etiquetas del dataset MELD están en inglés).

## Casos de uso

- **Análisis de llamadas de servicio al cliente**: el modelo puede clasificar la emoción del interlocutor en tiempo real o en grabaciones, permitiendo a las empresas detectar frustración o satisfacción y priorizar la intervención humana.
- **Monitoreo de bienestar en asistencia virtual**: integrado en aplicaciones de salud mental, puede identificar señales de tristeza o ansiedad en interacciones de voz y activar protocolos de apoyo.
- **Investigación en interacción humano-máquina**: los investigadores pueden usar el modelo para etiquetar corpus de conversaciones y analizar patrones emocionales en entornos controlados.
- **Evaluación de contenido multimedia**: se puede aplicar a clips de audio de películas, podcasts o redes sociales para categorizar la emoción predominante y facilitar la búsqueda o el análisis de contenido.
- **Sistemas de adaptación de diálogo**: en un asistente de voz, la emoción detectada puede cambiar el tono o la respuesta del sistema (por ejemplo, más empático si se detecta tristeza).
- **Análisis de discursos y presentaciones**: para evaluar la expresividad emocional de un orador en entornos de formación o coaching, proporcionando métricas objetivas sobre la comunicación.

## Benchmarks y rendimiento

Los resultados del modelo en el conjunto de prueba de MELD son los siguientes:

| Split | mean_acc | mAP | mean_auc | n_labels | n_instances |
|---|---|---|---|---|---|
| cls_test | 50,81 | 28,24 | 70,31 | 7 | 2608 |
| cls_valid | 48,19 | 30,05 | 69,63 | 7 | 1104 |

La precisión media (mean_acc) en el conjunto de test es de 50,81%, con un AUC medio de 70,31%. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no se especifica en la documentación. Dado que el repositorio ocupa 0,4 GB, el modelo en float32 podría caber en una GPU con al menos 2 GB de VRAM para inferencia, aunque el frontend WavLM Base+ tiene aproximadamente 317 millones de parámetros, por lo que se recomienda una GPU con 4-8 GB para mayor comodidad.
- **GPU recomendadas**: una NVIDIA RTX 3060, RTX 4090 o superiores son suficientes para inferencia rápida. También puede ejecutarse en CPU para tareas de bajo rendimiento, aunque la latencia será mayor.
- **Compatibilidad con GPU de consumo**: sí, es compatible con tarjetas como RTX 2060 en adelante, siempre que se tenga suficiente VRAM.
- **Opciones de despliegue**: el modelo está pensado para usarse con el framework ESPnet. Se puede ejecutar mediante el script `run.sh` de ESPnet, o cargar los pesos directamente en PyTorch para integración personalizada. No se documenta soporte para vLLM, llama.cpp o Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no se proporcionan datos concretos, pero al ser un clasificador ligero con un frontend congelado, la inferencia en GPU debería ser del orden de decenas de milisegundos por clip de audio corto (1-10 segundos).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (clasificación de emociones en MELD con frontend WavLM) dentro de la documentación proporcionada. No se pueden dar comparaciones numéricas sin datos adicionales.

## Limitaciones y advertencias

- **Sesgos y alucinación**: al ser un clasificador, no genera contenido, pero puede presentar sesgos en la asignación de emociones según el acento, la calidad del audio o el género del hablante, dado que el dataset MELD tiene una distribución determinada.
- **Precisión limitada**: la precisión media en el conjunto de test es de 50,81%, lo que indica un rendimiento moderado, con un margen de error considerable en la clasificación de emociones.
- **Restricciones de idioma**: el modelo está entrenado únicamente en inglés, por lo que no es adecuado para otros idiomas sin un reentrenamiento o adaptación.
- **Licencia**: bajo licencia Creative Commons Attribution 4.0 (CC-BY-4.0), que permite uso comercial con atribución, pero no se garantiza la ausencia de restricciones adicionales sobre los datos de entrenamiento (MELD).
- **Caveats para producción**: la configuración de chunking está limitada a segmentos de 500 ms con solapamiento de 50%, por lo que para audio más largo se debe segmentar adecuadamente. Además, el modelo requiere audio a 16 kHz de frecuencia de muestreo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/espnet/meld_cls1_wavlm_base_plus)
- [Repositorio ESPnet](https://github.com/espnet/espnet)
- [WavLM en GitHub (Microsoft)](https://github.com/microsoft/unilm/tree/master/wavlm)
- [Documentación de WavLM en Torchaudio](https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAVLM_BASE_PLUS.html)
- [Artículo de ESPnet (arXiv)](https://arxiv.org/abs/1804.00015)
- [Artículo de WavLM (arXiv)](https://arxiv.org/abs/2111.15636)
