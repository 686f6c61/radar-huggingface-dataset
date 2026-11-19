# ShahirHF/haku-kikiwake

## Resumen

Haku Kikiwake es un modelo de identificación de idioma hablado (spoken language ID) desarrollado por ShahirHF, publicado bajo licencia Apache 2.0. Su función es determinar en qué idioma se está hablando a partir de fragmentos de audio muy cortos, concretamente desde 1,5 segundos de habla. El modelo deriva de un recorte del codificador de audio de EmbeddingGemma 2 (capas 0-7) al que se le añaden dos cabezas pequeñas de clasificación, lo que da un total de aproximadamente 203 millones de parámetros.

La relevancia del modelo reside en su relación entre tamaño, velocidad y precisión. Con 203 MB en formato int8, es entre 5 y 9 veces más pequeño que alternativas como Whisper small o Qwen3-ASR 0.6B, y entre 8 y 15 veces más rápido en CPU de servidor, manteniendo una precisión competitiva desde 1,5 segundos de audio (82% en el conjunto de prueba de 130 clips). Además, incluye una versión Core ML de 189 MB que se ejecuta en el Neural Engine de un MacBook M1 en unos 19 ms por clip, lo que lo hace apto para inferencia en dispositivo sin conexión.

El modelo está verificado en 52 idiomas (de 77 probados) con una precisión global del 92,7% sobre 3.560 clips de fuentes y hablantes nunca vistos durante el entrenamiento. Su enfoque en despliegue local y sin dependencias externas lo posiciona como una opción práctica para aplicaciones de detección de idioma en tiempo real en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recorte del codificador de audio de EmbeddingGemma 2 (capas 0-7) más dos cabezas de clasificación |
| Parametros totales | 203 M (aproximadamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa hasta los primeros 10 s de audio; resolución de identificación desde 1,5 s) |
| Tipos de cuantizacion | int8 (PyTorch y Core ML) |
| Idiomas soportados | 96 idiomas en las cabezas; 52 verificados con precisión ≥ 80% en fuentes no vistas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch, int8) y mlpackage (Core ML, int8) |

## Arquitectura y entrenamiento

El modelo parte de EmbeddingGemma 2, del que se extrae el codificador de audio correspondiente a las capas 0-7, resultando en un tronco de 203 millones de parámetros. Sobre este tronco se añaden dos cabezas pequeñas de clasificación que producen la predicción de idioma. El pipeline es de clasificación de audio y la entrada se remuestrea a 16 kHz mono, usando los primeros 10 segundos de audio. La configuración del extractor de características se copia de EmbeddingGemma 2 y se incluye en el repositorio (`feature_extractor_config.json`), de modo que el modelo funciona completamente offline desde un clon limpio, sin descargas adicionales ni servidores externos.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición exacta del dataset ni sobre si se aplicaron técnicas de RLHF o DPO. La model card indica que la verificación se realizó sobre un conjunto fresco de 5.877 clips de fuentes y hablantes nunca vistos, puntuado una vez tras congelar el modelo, lo que sugiere un protocolo de evaluación estricto. Las cabezas de clasificación reconocen 96 idiomas, aunque solo 52 superan el umbral de verificación del 80% de acierto en cada fuente no vista con n ≥ 10.

## Capacidades

- Identificación de idioma hablado a partir de audio, con resolución desde 1,5 segundos de habla.
- Clasificación entre 96 idiomas posibles, con 52 idiomas verificados con precisión igual o superior al 80%.
- Procesamiento de audio remuestreado a 16 kHz mono, usando los primeros 10 segundos de la señal.
- Inferencia en dispositivo mediante Core ML en el Neural Engine de Apple Silicon (unos 19 ms por clip de 1,5 s en un MacBook M1).
- Ejecución en CPU de servidor con PyTorch int8 (unos 325 ms por clip de 1,5 s con 8 hilos).
- Funcionamiento completamente offline: no requiere servidor, conexión a internet ni descarga separada de EmbeddingGemma.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo es exclusivamente de clasificación de audio.

## Casos de uso

- Enrutamiento automático en centros de atención telefónica: el modelo puede identificar el idioma del hablante en el primer segundo y medio de la llamada y derivar la comunicación al agente o al sistema de respuesta adecuado, gracias a su baja latencia en CPU y a su funcionamiento offline.
- Transcripción multilingüe con selección de modelo ASR: en pipelines de reconocimiento de voz, se puede usar Kikiwake como clasificador previo para elegir el modelo o el diccionario de idioma correcto antes de invocar un ASR más pesado, reduciendo coste computacional.
- Indexación y etiquetado de archivos de audio: bibliotecas de podcasts, grabaciones de reuniones o archivos de archivo pueden etiquetarse automáticamente por idioma usando los primeros 10 segundos de cada pista, con un modelo de 203 MB que cabe en cualquier servidor.
- Aplicaciones móviles y de escritorio con privacidad por diseño: la versión Core ML de 189 MB permite clasificar el idioma localmente en un MacBook o dispositivo Apple sin enviar audio a la nube, cumpliendo requisitos de privacidad y reduciendo costes de ancho de banda.
- Moderación y análisis de contenido audiovisual: plataformas que reciben vídeos o audios generados por usuarios pueden detectar el idioma para aplicar políticas de contenido, subtitulado automático o verificación de coincidencia con el idioma declarado.
- Investigación lingüística y sociolingüística: el modelo facilita el análisis a gran escala de corpus orales multilingües, permitiendo segmentar y clasificar grabaciones por idioma con un coste de inferencia muy bajo (60-325 ms por clip según plataforma).
- Sistemas de accesibilidad en tiempo real: en aplicaciones de transcripción en vivo, el modelo puede conmutar el idioma del reconocedor de forma dinámica al detectar un cambio de lengua en la conversación, con una ventana de decisión de solo 1,5 segundos.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor. La evaluación se realizó sobre 130 clips de prueba de Common Voice (13 idiomas, 10 por idioma, 130 hablantes) en la misma CPU de servidor con 8 hilos.

| Modelo | Tamano | Tiempo por clip de 1,5 s | Acierto desde 1,5 s | Acierto en clip completo (mediana 6,1 s) |
|---|---|---|---|---|
| Haku Kikiwake (int8 PyTorch) | 203 MB | 325 ms | 106/130 (82%) | 116/130 (89%) |
| Qwen3-ASR 0.6B | 1,9 GB | 4,7 s | 110/130 (85%) | 122/130 (94%) |
| Whisper large-v3 | 3,1 GB | 14,7 s | 104/130 (80%) | 121/130 (93%) |
| MMS-LID-126 | 3,9 GB | 1,3 s | 94/130 (72%) | 124/130 (95%) |
| MMS-LID-1024 | 3,9 GB | 1,5 s | 87/130 (67%) | 122/130 (94%) |
| Whisper small | 966 MB | 2,7 s | 87/130 (67%) | 118/130 (91%) |
| NVIDIA AmberNet | 116 MB | 60 ms | 83/130 (64%) | 106/130 (82%) |
| SpeechBrain ECAPA | 82 MB | 98 ms | 73/130 (56%) | 104/130 (80%) |

En la verificación por idioma sobre 5.877 clips, el modelo acertó 3.299 de 3.560 clips (92,7%) en los 52 idiomas verificados. Algunos ejemplos de precisión por idioma en la peor fuente: árabe 96% (n=50), búlgaro 92% (n=50), francés 86% (n=50), georgiano 100% (n=50), alemán 90% (n=20 en VoxPopuli). En los 10 idiomas verificados que todos los modelos cubren, el modelo logra 86/100 desde 1,5 s; en los 3 idiomas no verificados que todos cubren (inglés, hindi, ruso), 20/30. La diferencia frente a Whisper small desde 1,5 s es significativa (p = 0,009); frente a Qwen3-ASR no lo es (p = 0,60).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo int8 de 203 MB requiere menos de 1 GB de memoria en CPU; en GPU, la huella es inferior a 1 GB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican requisitos de GPU; el modelo está diseñado para CPU y Neural Engine. Cualquier GPU con al menos 1 GB de memoria libre puede ejecutarlo.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque el diseño prioriza CPU y Core ML.
- Opciones de despliegue: PyTorch con el script `kikiwake.py` incluido en el repositorio; Core ML en dispositivos Apple; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el modelo es de clasificación de audio, no de generación de texto).
- Latencia y throughput: 325 ms por clip de 1,5 s en CPU de servidor con 8 hilos (PyTorch int8); 19 ms por clip de 1,5 s en Neural Engine de MacBook M1 (Core ML int8, mediana de 120 clips medidos con el Mac ocupado); 60 ms en NVIDIA AmberNet como referencia comparativa, pero el modelo propio no reporta cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto de audio | Acierto desde 1,5 s | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku Kikiwake | 203 M / 203 MB int8 | primeros 10 s | 82% (106/130) | Apache 2.0 | Hugging Face y GitHub |
| Qwen3-ASR 0.6B | 0,6 B / 1,9 GB | no disponible | 85% (110/130) | no disponible | no disponible |
| Whisper small | 244 M / 966 MB | 30 s | 67% (87/130) | MIT | Hugging Face (OpenAI) |
| Whisper large-v3 | 1,55 B / 3,1 GB | 30 s | 80% (104/130) | MIT | Hugging Face (OpenAI) |
| MMS-LID-126 | no disponible / 3,9 GB | no disponible | 72% (94/130) | no disponible | Hugging Face (Meta) |
| NVIDIA AmberNet | no disponible / 116 MB | no disponible | 64% (83/130) | no disponible | NGC (NVIDIA) |

Frente a Whisper small, Haku Kikiwake es 5 veces más pequeño, 8 veces más rápido y claramente más preciso desde 1,5 s (82% frente a 67%, p = 0,009). Frente a Qwen3-ASR 0.6B, es 9 veces más pequeño y 15 veces más rápido, con una precisión estadísticamente indistinguible desde 1,5 s (82% frente a 85%, p = 0,60), aunque Qwen3-ASR lidera en clips completos (94% frente a 89%). Frente a MMS-LID-126, el modelo de Meta es más preciso en clips completos (95% frente a 89%) pero mucho más pesado y lento, y peor desde 1,5 s (72% frente a 82%).

## Limitaciones y advertencias

- Solo 52 de los 77 idiomas probados están verificados con precisión ≥ 80% en fuentes no vistas; los otros 25 idiomas probados no alcanzan ese umbral y su fiabilidad es menor.
- Las cabezas reconocen 96 idiomas, pero la cobertura verificada es limitada; para idiomas fuera de los 52 verificados, la precisión puede degradarse significativamente.
- En clips completos (mediana 6,1 s), los modelos grandes como MMS-LID-126, Qwen3-ASR y Whisper large-v3 superan al modelo (89% frente a 93-95%), por lo que para audio largo y máxima precisión pueden ser preferibles.
- La evaluación se basa en 130 clips de 13 idiomas para la comparativa principal; los autores advierten que 130 clips no permiten distinguir diferencias menores de unos 10 puntos porcentuales entre modelos.
- No se documentan sesgos específicos por género, edad o acento; la verificación se hizo sobre fuentes y hablantes no vistos, pero la composición demográfica de esas fuentes no se detalla.
- Riesgo de confusión entre idiomas cercanos o con baja representación; el propio ejemplo de la model card muestra una puntuación de -0,13 para español frente a -11,63 para catalán, lo que indica que la separación entre lenguas próximas puede ser estrecha.
- El modelo usa los primeros 10 segundos de audio; fragmentos con ruido, música o habla superpuesta pueden degradar la clasificación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de EmbeddingGemma 2 (google/embeddinggemma-2); conviene revisar las condiciones de la licencia del modelo base para usos derivados.
- No se especifican requisitos de atribución adicionales ni restricciones de uso aceptable más allá de la licencia Apache 2.0.
- La fecha de creación del repositorio (2026-11-19) y la referencia a Qwen3-ASR de enero de 2026 indican que el modelo es reciente; el ecosistema de herramientas y la validación independiente son aún limitados (0 descargas y 0 likes en Hugging Face en el momento de la consulta).

## Enlaces

- Hugging Face: https://huggingface.co/ShahirHF/haku-kikiwake
- GitHub (código e issues): https://github.com/shershah1024/haku-kikiwake
- GitHub Release v1.0: https://github.com/shershah1024/haku-kikiwake/releases/tag/v1.0
- Modelo base: https://huggingface.co/google/embeddinggemma-2
