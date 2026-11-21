# liujianzuo/AzurLane-GPT-SoVITS-v2ProPlus

## Resumen

AzurLane-GPT-SoVITS-v2ProPlus es un modelo de síntesis de voz (text-to-speech) especializado en clonación de voces de personajes del videojuego Azur Lane. Lo desarrolla el usuario liujianzuo (con pesos alojados originalmente en la organización Moear) mediante fine-tuning del modelo base GPT-SoVITS v2ProPlus de lj1995. El modelo resuelve el problema de generar voces sintéticas fieles a los 902 personajes del juego (naves y TB), con 933 presets de voz seleccionables: 912 en japonés y 21 en chino mandarín.

La arquitectura sigue el esquema GPT-SoVITS, que combina un modelo autorregresivo tipo GPT (etapa s1) para la modelización de tokens semánticos y un modelo SoVITS (etapa s2) de síntesis acústica y vocoder. El fine-tuning se realizó sobre un conjunto de 50.759 grabaciones (aproximadamente 138,3 horas) extraídas del juego, mayoritariamente en japonés y con una parte alineada en chino. El repositorio ocupa 4,0 GB e incluye múltiples checkpoints (rondas 7, 10, 12, 14 y 15 del GPT) junto con presets y demostraciones.

Es relevante para desarrolladores que necesiten clonación de voz multi-hablante con identidades consistentes y cambio de personaje sin recargar pesos: el GPT y el SoVITS se comparten entre personajes, cambiando únicamente el preset de voz. El modelo está orientado a doblaje de fans, mods y aplicaciones de entretenimiento, no a uso comercial general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (GPT autorregresivo + SoVITS acústico/vocoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints .ckpt y .pth en precisión de entrenamiento) |
| Idiomas soportados | japonés (ja), chino mandarín (zh) |
| Licencia | no disponible |
| Formato de pesos | .ckpt (GPT, etapa s1) y .pth (SoVITS, etapa s2) |
| Tamaño del repositorio | 4,0 GB |
| Voces / presets | 933 presets (912 ja, 21 zh) sobre 902 personajes |
| Modelo base | lj1995/GPT-SoVITS (v2ProPlus) |
| Dataset de entrenamiento | Moear/AzurLane-Voice-20261118 (50.759 clips, ~138,3 h) |

## Arquitectura y entrenamiento

El modelo parte de GPT-SoVITS v2ProPlus, un sistema de TTS de dos etapas. La etapa GPT (s1) predice tokens semánticos a partir del texto y una referencia de audio; la etapa SoVITS (s2) convierte esos tokens en forma de onda mediante un modelo acústico con vocoder integrado. El fine-tuning se aplicó sobre los pesos oficiales de v2ProPlus (commit 8f8857563c040d542de108a2c18b0425abd6c9c5), generando checkpoints por rondas de entrenamiento: GPT rondas 7, 10, 12, 14 y 15, y SoVITS rondas 4 y 8.

El entrenamiento usó un snapshot fijo del dataset AzurLane-Voice-20261118, con 50.759 grabaciones (~138,3 horas) tras filtrado. La composición es mayoritariamente doblaje japonés del juego, complementada con doblaje chino alineado, una segunda pista japonesa, audio de dormitorio asignable a personajes y voces de TB. Las voces de skins se agrupan por personaje; las variantes META y las distintas versiones de doblaje se registran por separado. El índice SQLite del dataset conserva claves de voz originales, líneas japonesas y entradas de doblaje chino, lo que permite trazabilidad entre preset y fuente.

## Capacidades

- Síntesis de voz multi-hablante con 933 presets de voz (912 ja, 21 zh) sobre 902 personajes.
- Clonación de voz few-shot: permite seleccionar referencia de 3–10 segundos con su transcripción y idioma.
- Cambio de personaje sin recargar pesos: GPT y SoVITS se comparten; solo cambia el preset de referencia.
- Síntesis cruzada de idioma: un preset japonés puede leer texto chino y viceversa (con degradación de fidelidad de timbre).
- Soporte de doblaje japonés y chino mandarín como idiomas de síntesis.
- Integración con WebUI de GPT-SoVITS y con el backend Neiroha-GPT-SoVITS (API local en `http://127.0.0.1:9880`).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de audio.

## Casos de uso

- Doblaje de fans para mods de Azur Lane: seleccionar el preset del personaje (por ejemplo `al-ship-30505-ja` para Nagato) y sintetizar líneas nuevas en japonés o chino manteniendo el timbre original.
- Generación de voces para vídeos y contenido derivado: el modelo permite producir diálogos de personajes sin depender de clips originales, usando el preset correspondiente y una referencia limpia de 3–10 segundos.
- Prototipado de asistentes de voz con identidad de personaje: la API local de Neiroha expone un endpoint compatible con el flujo GPT-SoVITS, lo que facilita integrar la voz en un chatbot o aplicación de escritorio.
- Localización de contenido del juego a chino: los presets `zh` (21 voces) permiten doblar líneas al mandarín conservando la identidad del personaje, con calidad de timbre medida (0,8230 de similitud ERes2NetV2 en la combinación 14+8).
- Investigación en clonación de voz multi-hablante: el conjunto de 933 presets con referencia y transcripción documentadas sirve como banco de pruebas para evaluar modelos de speaker embedding y métricas de similitud.
- Producción de audiolibros o narraciones con reparto de personajes: al compartir pesos entre personajes, se puede alternar voces en una misma sesión sin recargar el modelo, reduciendo el coste de cambio de contexto.
- Evaluación comparativa de checkpoints: el repositorio incluye 25 combinaciones medidas con ERes2NetV2, lo que permite seleccionar la ronda GPT/SoVITS óptima por idioma antes de desplegar.

## Benchmarks y rendimiento

El autor publica una evaluación de similitud de voz con ERes2NetV2 (coseno medio y aciertos sobre 8 candidatos) usando 8 voces, 8 frases por idioma y las mismas referencias y ajustes de muestreo:

| Combinación de pesos | Japonés (coseno · aciertos) | Chino (coseno · aciertos) |
|---|---|---|
| v2ProPlus oficial zero-shot | 0,7708 · 6/8 | 0,7655 · 7/8 |
| GPT 7 + SoVITS 8 | 0,8335 · 8/8 | 0,8086 · 7/8 |
| GPT 10 + SoVITS 4 | 0,8374 · 6/8 | 0,8015 · 7/8 |
| GPT 12 + SoVITS 8 | **0,8442** · 7/8 | 0,8164 · 7/8 |
| GPT 14 + SoVITS 8 | 0,8355 · 7/8 | **0,8230** · 7/8 |
| GPT 15 + SoVITS 8 | 0,8369 · 6/8 | 0,8018 · 7/8 |

En latencia, el autor reporta que en una RTX 6000D la combinación 15+8 alcanza una tasa de tiempo real (RTF) mediana de aproximadamente 0,25 para frases cortas, es decir, el tiempo de síntesis es una cuarta parte de la duración del audio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el conjunto de pesos (GPT + SoVITS) ronda los 328 MB por par, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 6000D (medición del autor); cualquier GPU NVIDIA con CUDA y al menos 6–8 GB de VRAM es suficiente para el flujo Neiroha.
- GPU de consumo: sí, cabe en RTX 3060/4060 y superiores; el cuello de botella es el vocoder y la latencia, no la memoria.
- Despliegue: Neiroha-GPT-SoVITS (paquete Windows todo-en-uno con CUDA y API local), WebUI oficial de GPT-SoVITS seleccionando v2ProPlus, o integración vía API en `http://127.0.0.1:9880`.
- Latencia: RTF mediano ~0,25 en RTX 6000D para frases cortas con 15+8; no se reportan cifras de throughput por lote.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Voces | Licencia | Notas |
|---|---|---|---|---|---|
| AzurLane-GPT-SoVITS-v2ProPlus | TTS fine-tuned | ja, zh | 933 presets / 902 personajes | no disponible | Especializado en Azur Lane; pesos .ckpt/.pth |
| GPT-SoVITS v2ProPlus (oficial) | TTS base | multi (incl. ja, zh) | zero-shot | no disponible en la información | Base del fine-tuning; sin presets de personajes |
| Neiroha-GPT-SoVITS | Backend/despliegue | hereda del modelo | hereda del modelo | no disponible | No es un modelo, es el runtime que sirve estos pesos |

No se dispone de datos de benchmarks comparativos con otros modelos TTS (XTTS, Bark, Fish-Speech) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; verificar antes de desplegar en producto.
- El modelo está entrenado exclusivamente con voces de Azur Lane; la calidad fuera de ese dominio no está garantizada.
- Solo soporta japonés y chino mandarín como idiomas de síntesis; otros idiomas no están cubiertos.
- La clonación cruzada de idioma (preset ja leyendo zh o viceversa) degrada la fidelidad de timbre.
- Riesgo de artefactos en frases largas: el autor recomienda validar pausas y entonación con audiciones propias antes de fijar la ronda de pesos.
- Las métricas de similitud se basan en 8 voces y 8 frases por idioma; no constituyen una evaluación exhaustiva de las 933 voces.
- Uso de voces de personajes con derechos de autor: el doblaje derivado puede infringir derechos del juego o de las actrices de voz originales; revisar el marco legal antes de publicar.
- El repositorio incluye checkpoints de varias rondas con posibles diferencias de calidad; usar la tabla de evaluación para elegir la combinación adecuada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liujianzuo/AzurLane-GPT-SoVITS-v2ProPlus
- Repositorio de pesos original (Moear): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus
- Modelo base GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Commit del modelo base: https://huggingface.co/lj1995/GPT-SoVITS/tree/8f8857563c040d542de108a2c18b0425abd6c9c5
- Dataset de entrenamiento: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118
- Snapshot del dataset: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118/tree/39d126bfbaf30311b0518ca8549cc820fc98d92c
- Paquete Neiroha-GPT-SoVITS (Windows): https://github.com/Neiroha/Neiroha-GPT-SoVITS/releases/tag/V1.0.0
- Frontend Neiroha: https://github.com/Neiroha/Neiroha/releases
- Documentación de configuración GPT-SoVITS en Neiroha: https://neiroha.github.io/workflow/providers/gpt-sovits
- Tabla de voces (CSV): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/voices-all-characters.csv
- Comparativa completa de 25 combinaciones: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/all-characters-comparison.json
- Trazabilidad del entrenamiento: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/training-provenance.json
- Checksums SHA-256: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/SHA256SUMS
- Preset de todos los personajes: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/neiroha-all-characters.zip
