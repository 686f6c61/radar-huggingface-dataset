# earlab/EAR_VAE2

## Resumen

εar-VAE2 es un autoencoder de música en dominio espectral desarrollado por el laboratorio Eps-Acoustic-Revolution-Lab (earlab). Comprime audio estéreo a 48 kHz en una secuencia latente continua de 128 dimensiones a 25 Hz, lo que supone una reducción temporal de 1920×. A diferencia de los codecs basados en forma de onda, opera directamente sobre los canales real e imaginario de la STFT, lo que proporciona un sesgo inductivo físico sobre el eje de frecuencia.

El modelo introduce dos innovaciones principales: Spec-SnakeBeta, una activación periódica por bin de frecuencia con inicialización logarítmica, y un Duplex-Aware Refiner, un transformador en bandas que corrige magnitud y fase según principios de enmascaramiento psicoacústico (solo fase por debajo de 1.5 kHz, corrección conjunta en bandas medias, solo magnitud por encima de 4 kHz). Con aproximadamente 42.6 millones de parámetros, alcanza resultados de reconstrucción de última generación en el dataset Song Describer, superando a sistemas como SA-Open y Levo 2 en métricas espectrales.

La relevancia actual del modelo radica en su aplicación como encoder para generación musical basada en difusión, así como en tareas de compresión y edición de audio de alta fidelidad. Los pesos publicados han sido reentrenados con datasets públicos debido a restricciones de licencia de los datos internos, por lo que el rendimiento puede diferir del reportado en el paper.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con codificador/decodificador en dominio STFT, Spec-SnakeBeta y Duplex-Aware Refiner (transformador en bandas de 12 capas) |
| Parametros totales | ~42.6 millones (configuración Small, C0=64) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (procesa audio continuo mediante chunking con solapamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh (idiomas de la documentación; el modelo procesa audio, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (se carga con `torch.load`, probablemente checkpoint PyTorch .pt) |

## Arquitectura y entrenamiento

εar-VAE2 opera en el dominio espectral complejo: el audio de entrada se transforma mediante STFT con FFT de 3840 puntos y hop de 1920 muestras, generando una tasa de 25 Hz. El codificador y el decodificador procesan los canales real e imaginario por separado, y la activación Spec-SnakeBeta aplica una función periódica aprendida por cada par (canal, bin de frecuencia), con una parametrización logarítmica que mantiene los bins bajos cerca de la identidad y hace progresivamente oscilatorios los bins altos. Esta elección proporciona un sesgo inductivo físicamente motivado para el procesamiento espectral.

El Duplex-Aware Refiner es un transformador de 12 capas con dimensión 256 y dimensión intermedia 1024, que opera por bandas de frecuencia. Aplica correcciones de fase solo por debajo de 1.5 kHz, corrección conjunta de magnitud y fase en la banda media, y corrección de magnitud por encima de 4 kHz, siguiendo la dominancia psicoacústica. El modelo se entrena como VAE con regularización KL sobre el latente continuo de 128 dimensiones. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset; la model card indica que los pesos open-source se reentrenaron con datos públicos disponibles, no con el corpus interno completo.

## Capacidades

- Reconstrucción de audio de alta fidelidad: comprime audio estéreo de 48 kHz a un latente de 128 dimensiones a 25 Hz y lo reconstruye con calidad espectral superior a otros codecs neuronales.
- Representación latente compacta: el latente continuo de 128 dimensiones a 25 Hz es adecuado como espacio de entrada para modelos generativos basados en difusión o autoregresivos.
- Procesamiento de audio largo: soporta inferencia por chunks con solapamiento (chunk_size=512, overlap=16), permitiendo manejar archivos de duración arbitraria sin agotar memoria.
- Operación en dominio espectral: trabaja con STFT real/imag, lo que preserva la estructura armónica de alta frecuencia mejor que los métodos basados en forma de onda.
- Corrección psicoacústica: el refiner por bandas ajusta fase y magnitud según la percepción auditiva, mejorando la coherencia de fase (CCPC) y la distancia espectral.
- Multilingüe en documentación: la model card y los recursos están disponibles en inglés y chino, aunque el modelo en sí no procesa texto.

## Casos de uso

- Generación musical con difusión: usar εar-VAE2 como encoder para mapear audio a latentes y entrenar un modelo de difusión en ese espacio, generando música de alta calidad a 48 kHz estéreo.
- Codec neuronal para streaming: comprimir audio en tiempo real a 128 dimensiones por frame de 40 ms (25 Hz), lo que permite transmisión de baja tasa de bits con reconstrucción fiel.
- Edición de audio en dominio latente: modificar atributos musicales (timbre, armonía) manipulando directamente el latente y decodificando, sin artefactos de fase.
- Restauración de grabaciones antiguas: reconstruir audio degradado o de baja calidad aplicando el modelo como filtro de mejora espectral.
- Análisis y extracción de características: utilizar el latente como representación compacta para tareas de clasificación de géneros, detección de instrumentos o similitud musical.
- Investigación en representaciones de audio: servir como baseline para comparar estrategias de compresión espectral frente a métodos de forma de onda en tareas de reconstrucción y generación.

## Benchmarks y rendimiento

Resultados de reconstrucción en Song Describer Dataset (546 pistas completas, 48 kHz estéreo):

| Sistema | SI-SDR ↑ | STFT Dist ↓ | Mel Dist ↓ | CCPC ↑ |
|---|---|---|---|---|
| εar-VAE | 12.4 | 0.880 | 0.509 | 0.973 |
| SA-Open | 6.7 | 1.016 | 0.612 | 0.933 |
| Levo 2 | 8.1 | 0.971 | 0.599 | 0.947 |
| SAME-L | 12.5 | 0.986 | 0.539 | 0.970 |
| **εar-VAE2 (base)** | 10.9 | 0.916 | 0.572 | 0.966 |
| **εar-VAE2 (full)** | **11.3** | **0.870** | **0.461** | **0.973** |

εar-VAE2 (full) logra la mejor distancia espectral (STFT Dist y Mel Dist) entre todos los sistemas comparados, y empata en coherencia de fase (CCPC) con el εar-VAE original, que tiene más parámetros. El SI-SDR es ligeramente inferior al de εar-VAE y SAME-L, pero superior al de SA-Open y Levo 2.

## Requisitos de hardware

- Con ~42.6 millones de parámetros, el modelo es relativamente ligero y puede ejecutarse en GPUs de consumo.
- VRAM estimada: no disponible oficialmente, pero por tamaño de parámetros y operación en STFT, se estima que cabe en GPUs con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 3080).
- Para audio largo con chunking, el consumo de memoria se mantiene acotado; el chunk_size de 512 frames (~20 segundos) es manejable en GPU consumer.
- Opciones de despliegue: el repositorio proporciona API Python con PyTorch y script CLI (`inference.py`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependerán de la GPU y de la configuración de chunking.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Compresión | Licencia | Reconstrucción (STFT Dist ↓) |
|---|---|---|---|---|---|
| εar-VAE2 (full) | ~42.6M | Espectral (STFT) | 1920× | Apache 2.0 | 0.870 |
| εar-VAE | No disponible (mayor que εar-VAE2) | Espectral | No especificada | Apache 2.0 | 0.880 |
| SA-Open | No disponible | Forma de onda | No especificada | No disponible | 1.016 |
| Levo 2 | No disponible | Forma de onda | No especificada | No disponible | 0.971 |
| SAME-L | No disponible | Forma de onda | No especificada | No disponible | 0.986 |

εar-VAE2 (full) supera a todos los comparados en distancia STFT, con una ventaja notable sobre los métodos de forma de onda. La comparativa se limita a los sistemas evaluados en el paper; no se dispone de datos de otros codecs como EnCodec o DAC en las mismas condiciones.

## Limitaciones y advertencias

- Los pesos open-source publicados han sido reentrenados con datasets públicos y pueden no reflejar el rendimiento del modelo completo entrenado con datos propietarios, como se indica en la model card.
- No se especifican sesgos potenciales del modelo; al ser entrenado con música, podría presentar un rendimiento desigual según géneros o estilos subrepresentados.
- Al ser un modelo de reconstrucción, no genera audio nuevo por sí mismo; requiere un generador externo (p. ej., difusión) sobre el espacio latente.
- La calidad de reconstrucción puede degradarse en señales de audio muy diferentes a los datos de entrenamiento (voces, efectos de sonido, grabaciones de baja calidad).
- No se proporcionan métricas de latencia ni requisitos de hardware oficiales, por lo que el despliegue en producción requiere validación empírica.
- La licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento pueden tener restricciones adicionales; se recomienda revisar el dataset público utilizado.
- El paper asociado está en revisión (ICLR 2026) y la cita indica "Anonymous", por lo que la reproducibilidad completa podría no estar disponible hasta su publicación.

## Enlaces

- HuggingFace: https://huggingface.co/earlab/EAR_VAE2
- Repositorio GitHub: https://github.com/Eps-Acoustic-Revolution-Lab/EAR_VAE2
- Página demo: https://eps-acoustic-revolution-lab.github.io/EAR_VAE2/
- Paper anterior (εar-VAE): https://arxiv.org/pdf/2509.14912
- Modelo anterior en HuggingFace: https://huggingface.co/earlab/EAR_VAE
- Repositorio GitHub del modelo anterior: https://github.com/Eps-Acoustic-Revolution-Lab/EAR_VAE
