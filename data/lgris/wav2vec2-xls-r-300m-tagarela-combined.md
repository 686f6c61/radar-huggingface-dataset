# lgris/wav2vec2-xls-r-300m-tagarela-combined

## Resumen

El modelo `lgris/wav2vec2-xls-r-300m-tagarela-combined` es un ajuste fino (fine-tuning) del checkpoint `facebook/wav2vec2-xls-r-300m` para reconocimiento automático del habla (ASR) en portugués brasileño (pt-BR). Lo publica el usuario de HuggingFace `lgris` y está entrenado sobre la combinación de los corpus TAGARELA v1 y TAGARELA v2, con una estrategia de muestreo balanceado 50/50 por lote y carga de datos en streaming.

El modelo resuelve la transcripción de audio de 16 kHz mono a texto mediante una cabeza CTC (Connectionist Temporal Classification) sobre el encoder XLS-R. Cuenta con 315.493.045 parámetros totales (dato extraído de los pesos en safetensors) y un vocabulario de salida de 51 tokens. El repositorio ocupa 1,3 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia es acotada y muy específica: es una variante de investigación publicada con 0 descargas y 0 likes en el momento de redactar esta ficha, y su resultado declarado (20,36 % de WER en el test de TAGARELA v2) es claramente peor que el de otros modelos del mismo autor entrenados únicamente con TAGARELA v2 (11,75 % de WER). Resulta útil, por tanto, como punto de comparación dentro de la familia de modelos del autor para estudiar el efecto de mezclar v1 y v2 en el entrenamiento, no como un modelo de producción de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder convolucional + transformer) con cabeza CTC; basada en `facebook/wav2vec2-xls-r-300m` |
| Parámetros totales | 315.493.045 |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (modelo de audio; la entrada es una señal de voz a 16 kHz, no una secuencia de tokens de texto) |
| Tipos de cuantización | No se distribuyen versiones cuantizadas en el repositorio; se publican pesos en safetensors (repo de 1,3 GB). No disponible información oficial sobre GGUF, int8 o int4 |
| Idiomas soportados | Portugués brasileño (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repo); incluye también configuración y procesador de HuggingFace Transformers |
| Vocabulario de salida | 51 tokens |
| Frecuencia de muestreo de entrada | 16 kHz, mono |
| Autor | lgris |
| Pipeline declarado | automatic-speech-recognition |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint base `facebook/wav2vec2-xls-r-300m`: un extractor de características convolucional seguido de un encoder transformer y una cabeza de clasificación CTC (`Wav2Vec2ForCTC`). El ajuste fino parte de los pesos preentrenados de XLS-R y adapta el modelo al dominio de los corpus TAGARELA. Según la model card, el feature encoder se mantiene congelado durante el entrenamiento.

Los detalles de entrenamiento declarados son: hasta 100.000 pasos máximos (el checkpoint publicado corresponde al paso 90.000), batch size efectivo de 128 (8 por dispositivo con acumulación de gradiente de 16), learning rate de 3e-5 y precisión bfloat16. Los datos de entrenamiento son la combinación de TAGARELA v1 y TAGARELA v2, cargados en streaming y con muestreo balanceado 50/50 por lote entre ambos corpus. La model card advierte que en TAGARELA v1 solo el split de test dispone de revisión humana. No se documenta en la información disponible el uso de RLHF, DPO ni de decodificación especulativa.

## Capacidades

- Transcripción de voz a texto (ASR) en portugués brasileño para audio de 16 kHz mono.
- Decodificación CTC mediante `Wav2Vec2ForCTC`, con salida directa de la secuencia de caracteres/subpalabras del vocabulario de 51 tokens.
- Integración directa con el pipeline `automatic-speech-recognition` de HuggingFace Transformers.
- Ejecución en CPU o GPU (el ejemplo de la model card contempla `device=0` si hay CUDA disponible).
- Entrenamiento sobre corpus con carga en streaming, lo que permite reproducir el flujo de datos sin descargar los datasets completos.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio-vision, diarización de hablantes, puntuación automática ni marcas de tiempo.
- No se documenta capacidad multilingüe más allá del portugués brasileño, pese a que el checkpoint base XLS-R es multilingüe.

## Casos de uso

- Transcripción de audio de dominio TAGARELA: el modelo está ajustado específicamente sobre esos corpus, por lo que es adecuado para reproducir o auditar los resultados del benchmark declarado sobre el test de TAGARELA v2.
- Investigación comparativa de estrategias de mezcla de datos: al existir el modelo hermano entrenado solo con TAGARELA v2, este checkpoint permite medir el efecto de combinar v1 y v2 con muestreo 50/50 en la misma receta de entrenamiento.
- Subtitulado de contenido en portugués brasileño con revisión humana posterior: dado un WER declarado del 20,36 %, el flujo realista es generar una transcripción preliminar y pasarla por un corrector o editor antes de publicarla.
- Preanotación de datasets de voz en pt-BR: uso como etiquetador automático de primer paso para reducir el coste de anotación manual, siempre con verificación humana dado el nivel de error.
- Análisis exploratorio de audio en investigación lingüística: transcripción masiva de grabaciones en portugués brasileño para búsqueda de patrones léxicos, asumiendo ruido en la transcripción.
- Indexación y búsqueda de contenido hablado: generar transcripciones aproximadas para permitir búsqueda por texto sobre archivos de audio en pt-BR, donde un porcentaje de error moderado no impide la recuperabilidad del contenido.
- Baseline reproducible en trabajos académicos de ASR en portugués: el modelo publica los hiperparámetros completos y la evolución del WER por checkpoint, lo que facilita usarlo como referencia inicial en comparaciones.
- Despliegue en entornos con recursos limitados: con 315 millones de parámetros, el modelo es viable en GPU de gama de entrada o incluso en CPU para lotes pequeños, a diferencia de alternativas de mayor tamaño.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index). No se han publicado otros resultados de benchmarks en la información disponible.

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | TAGARELA v2 Test (`freds0/TAGARELA_v2`) | Test WER | 20,36 % |

Evolución declarada del entrenamiento (eval loss y eval WER por número de pasos):

| Step | Epoch | Eval loss | Eval WER |
|---|---|---|---|
| 10.000 | 0,1 | 0,4992 | 30,20 % |
| 30.000 | 0,3 | 0,4336 | 22,79 % |
| 50.000 | 0,5 | 0,4134 | 21,19 % |
| 70.000 | 0,7 | 0,4469 | 21,33 % |
| 90.000 (checkpoint publicado) | 0,9 | 0,4019 | 20,36 % |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 1,26 GB en fp32 (el repo total es de 1,3 GB) y en torno a 0,63 GB en fp16/bf16. Con activaciones y buffers de decodificación, un presupuesto de 2 a 4 GB de VRAM es suficiente para audio de duración moderada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas de gama de entrada o media como GTX 1650, RTX 3050 o superiores son suficientes. Modelos como A100 o H100 no aportan ventaja relevante para 315 millones de parámetros y se destinan a lotes muy grandes.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en muchas integradas. Es un modelo pequeño para los estándares actuales de ASR.
- CPU: la inferencia en CPU es viable, aunque la latencia dependerá del número de hilos y de la longitud del audio; no se dispone de cifras oficiales.
- Opciones de despliegue: HuggingFace Transformers (`pipeline` o `Wav2Vec2ForCTC` con `Wav2Vec2Processor`), exportación a ONNX mediante Optimum para servir con ONNX Runtime, y despliegue dentro de servicios propios en PyTorch. No aplican formatos GGUF ni runners basados en GGUF (llama.cpp, Ollama) al no publicarse pesos en ese formato; vLLM está orientado a modelos generativos y no cubre cabezas CTC de este tipo.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

Todos los datos de WER de esta tabla proceden de la model card del autor; los campos no documentados se marcan como no disponibles.

| Modelo | Parámetros | Idiomas | WER TAGARELA v1 | WER TAGARELA v2 | WER CORAA | Licencia |
|---|---|---|---|---|---|---|
| XLS-R 300M (v1+v2, 100 %) — este modelo | 315.493.045 | pt-BR | No disponible | 20,36 % | No disponible | Apache 2.0 |
| XLS-R 300M (v2, 100 %) — `lgris/wav2vec2-xls-r-300m-tagarela-v2` | No disponible | pt-BR | No disponible | 11,75 % | No disponible | No disponible |
| Podcasts PT (v1+v2, 100 %) — `lgris/wav2vec2-podcasts-tagarela-combined` | No disponible | pt-BR | 21,64 % | 15,92 % | 25,44 % | No disponible |
| Podcasts PT (v2, 100 %) — `lgris/wav2vec2-podcasts-tagarela-v2` | No disponible | pt-BR | 23,75 % | 14,96 % | 23,98 % | No disponible |
| CORAA (Edresson) — `Edresson/wav2vec2-large-xlsr-coraa-portuguese` | No disponible | pt-BR | 32,55 % | 27,08 % | 22,46 % | No disponible |

Lectura de la comparativa: dentro de la propia familia del autor, el modelo entrenado solo con TAGARELA v2 obtiene 11,75 % de WER frente al 20,36 % de esta variante combinada, una diferencia de 8,61 puntos porcentuales en el mismo conjunto de test. Frente a la referencia externa de CORAA, este modelo es mejor en TAGARELA v1 y v2, pero no hay dato de CORAA para poder compararlo en ese dominio.

## Limitaciones y advertencias

- Cobertura lingüística restringida al portugués brasileño (pt-BR); no se documenta ningún otro idioma soportado, a pesar de que el checkpoint base XLS-R es multilingüe.
- WER declarado del 20,36 % en TAGARELA v2: un error elevado para uso directo en producción sin revisión humana posterior.
- Rendimiento inferior al de sus propios modelos hermanos en el mismo test (11,75 % con `wav2vec2-xls-r-300m-tagarela-v2` y 14,96 % o 15,92 % con las variantes de Podcasts PT), lo que cuestiona la utilidad práctica de la mezcla v1+v2 tal como se implementó.
- Los datos de benchmark proceden del propio autor y están marcados como no verificados (`verified: false`); no se han replicado de forma independiente.
- Repositorio sin adopción: 0 descargas y 0 likes registrados, sin evidencia de uso en producción ni de mantenimiento posterior.
- Sesgos: no disponible. No se documenta ningún análisis de sesgo por acento, variedad dialectal, edad, género o condición sociolingüística dentro del portugués brasileño.
- Riesgo de alucinación y de errores típicos de los modelos CTC: en segmentos de silencio, ruido o solapamiento de voces es habitual que la decodificación genere repeticiones o texto espurio; conviene aplicar VAD y filtros de longitud antes de consumir la salida.
- El vocabulario de 51 tokens es reducido; no se especifica en la información disponible si incluye puntuación, mayúsculas o números, por lo que la salida puede requerir normalización posterior.
- Formato de audio rígido: entrada esperada de 16 kHz mono; otros formatos exigen remuestreo previo.
- Licencia Apache 2.0: permite uso comercial y modificación siempre que se conserve el aviso de licencia y se indiquen los cambios. Conviene revisar, además, las condiciones de uso de los datasets TAGARELA v1 y v2 para usos derivados, ya que la model card indica que solo el split de test de TAGARELA v1 cuenta con revisión humana.
- Los datasets de entrenamiento contienen, según la model card, datos sin revisión humana, lo que implica ruido en las etiquetas de entrenamiento y un techo de calidad acotado.
- Fecha de publicación y de actualización del modelo en el repositorio: 13 de septiembre de 2026 (misma fecha para creación y última actualización).
- La búsqueda web asociada a esta ficha no devolvió resultados relevantes sobre el modelo: los enlaces recuperados trataban sobre campeonatos mundiales de hockey hielo y no guardan ninguna relación con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-combined
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Dataset TAGARELA v1: https://huggingface.co/datasets/freds0/TAGARELA
- Dataset TAGARELA v2: https://huggingface.co/datasets/freds0/TAGARELA_v2
- Modelo hermano (XLS-R 300M, solo TAGARELA v2): https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-v2
- Modelo hermano (Podcasts PT, combinado v1+v2): https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-combined
- Modelo hermano (Podcasts PT, solo TAGARELA v2): https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-v2
- Referencia externa en portugués (CORAA): https://huggingface.co/Edresson/wav2vec2-large-xlsr-coraa-portuguese
- Artículo, blog o demo del autor: no disponible en la información proporcionada.
- Resultados de la búsqueda web: sin enlaces relevantes (los resultados recuperados no están relacionados con el modelo).
