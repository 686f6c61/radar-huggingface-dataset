# CyanFalse/AzurLane-GPT-SoVITS-v2ProPlus

## Resumen

AzurLane-GPT-SoVITS-v2ProPlus es un ajuste fino (fine-tune) del modelo de síntesis de voz GPT-SoVITS v2ProPlus, desarrollado por CyanFalse, orientado a la clonación de voz de personajes del videojuego Azur Lane. El modelo permite generar audio con la voz de 902 personajes (naves y TB) a partir de texto, con 933 presets de timbre disponibles: 912 correspondientes a voces japonesas y 21 a voces chinas. La relevancia del proyecto radica en que un único par de pesos (un checkpoint GPT y otro SoVITS) cubre todo el elenco, de modo que el cambio de personaje se realiza únicamente cambiando el preset de referencia, sin recargar los modelos.

Técnicamente, el modelo hereda la arquitectura de GPT-SoVITS v2ProPlus, que combina un modelo autorregresivo tipo GPT para la predicción de tokens semánticos con un modelo SoVITS (VITS mejorado) para la síntesis de waveform. El repositorio ocupa 4,0 GB, y los pesos recomendados son ligeros: unos 328 MB por par GPT+SoVITS. El entrenamiento se realizó sobre un snapshot fijo del dataset AzurLane-Voice-20261118, con 50.759 grabaciones y aproximadamente 138,3 horas de audio, mayoritariamente en japonés con una parte de chino alineado.

El modelo está pensado para despliegue local mediante el paquete Neiroha-GPT-SoVITS para Windows, que incluye entorno CUDA y una interfaz web de gestión. No es un modelo de propósito general: es un TTS especializado y de dominio cerrado, con soporte para japonés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (GPT autorregresivo para tokens semanticos + SoVITS para sintesis de waveform) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ckpt y pth) |
| Idiomas soportados | japones (ja), chino (zh) |
| Licencia | no disponible |
| Formato de pesos | .ckpt (GPT) y .pth (SoVITS) |
| Tamano del repositorio | 4,0 GB |
| Tamano por par de pesos | ~328 MB (GPT + SoVITS) |
| Modelo base | lj1995/GPT-SoVITS (v2ProPlus) |
| Dataset de entrenamiento | Moear/AzurLane-Voice-20261118 (snapshot fijo) |
| Volumen de entrenamiento | 50.759 grabaciones, ~138,3 horas |
| Personajes cubiertos | 902 (naves y TB) |
| Presets de timbre | 933 (912 japones, 21 chino) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS v2ProPlus: un componente GPT autorregresivo que transforma el texto de entrada en tokens semánticos condicionados por un audio de referencia, y un componente SoVITS que convierte esos tokens en waveform de audio. El ajuste fino parte de los pesos oficiales de lj1995/GPT-SoVITS (commit 8f8857563c040d542de108a2c18b0425abd6c9c5) y se entrena sobre el snapshot fijo del dataset AzurLane-Voice-20261118 (commit 39d126bfbaf30311b0518ca8549cc820fc98d92c).

El corpus de entrenamiento consta de 50.759 grabaciones que suman aproximadamente 138,3 horas. La composición es mayoritariamente japonés (voz principal del juego), complementada con chino alineado, una segunda pista de voz japonesa, audios de dormitorio asignables a personajes y voces de TB. Las voces de skins se asignan al personaje correspondiente, y las variantes META y las distintas pistas de doblaje se registran por separado. El dataset conserva un índice SQLite con las claves originales de audio, las líneas japonesas y las entradas de doblaje chino. No se documentan en la información disponible detalles sobre RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Síntesis de voz (text-to-speech) con clonación de timbre a partir de un audio de referencia de 3 a 10 segundos de voz limpia.
- Generación de voz para 902 personajes de Azur Lane con 933 presets de timbre (912 japoneses, 21 chinos).
- Cambio de personaje sin recargar pesos: el par GPT+SoVITS es compartido y solo cambia el preset de referencia.
- Soporte de síntesis en japonés y chino, con posibilidad de lectura cruzada entre idiomas (el idioma de síntesis se selecciona de forma independiente al idioma de la referencia).
- Gestión de la variante de doblaje por personaje (por ejemplo, distintas versiones de voz del mismo personaje se seleccionan por separado).
- Integración con la interfaz Neiroha y con la WebUI de GPT-SoVITS, incluyendo selección de hablante, comprobación de salud del servicio y obtención de la lista de timbres.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Doblaje de fan games y mods de Azur Lane: el modelo permite generar líneas de voz para cualquiera de los 902 personajes con un único despliegue, seleccionando el preset del personaje y el idioma de síntesis, lo que evita mantener un modelo por personaje.
- Producción de contenido audiovisual (vídeos, podcasts, narrativas): se puede generar narración con la voz de un personaje concreto a partir de un guion de texto, usando una referencia de 3 a 10 segundos y el preset correspondiente.
- Prototipado rápido de voces en localización: al cubrir japonés y chino con el mismo par de pesos, sirve para comparar cómo suena una misma línea en ambos idiomas antes de contratar doblaje profesional.
- Investigación en clonación de voz y evaluación de TTS: el repositorio publica métricas de similitud de hablante (ERes2NetV2) por combinación de checkpoints, lo que permite reproducir experimentos de selección de pesos.
- Asistentes conversacionales temáticos: integrado en la interfaz Neiroha o en la WebUI de GPT-SoVITS, puede dar voz a personajes en aplicaciones de chat o demos interactivas con una latencia de aproximadamente un cuarto del tiempo de audio en una RTX 6000D.
- Generación de audios de referencia y datasets sintéticos: útil para crear muestras de voz controladas por personaje e idioma en pipelines de investigación, siempre respetando las condiciones de uso del material original.

## Benchmarks y rendimiento

El autor publica una evaluación de similitud de hablante con ERes2NetV2 sobre 8 timbres, con 8 frases en japonés y 8 en chino por configuración. Cada celda muestra la media de similitud de coseno y el número de frases cuyo mejor match fue el personaje correcto (sobre 8).

| Combinacion de pesos | Japones (coseno · aciertos) | Chino (coseno · aciertos) |
|---|---|---|
| v2ProPlus oficial, zero-shot | 0,7708 · 6/8 | 0,7655 · 7/8 |
| GPT 7 + SoVITS 8 | 0,8335 · 8/8 | 0,8086 · 7/8 |
| GPT 10 + SoVITS 4 | 0,8374 · 6/8 | 0,8015 · 7/8 |
| GPT 12 + SoVITS 8 | 0,8442 · 7/8 | 0,8164 · 7/8 |
| GPT 14 + SoVITS 8 | 0,8355 · 7/8 | 0,8230 · 7/8 |
| GPT 15 + SoVITS 8 | 0,8369 · 6/8 | 0,8018 · 7/8 |

En una RTX 6000D, la combinación GPT 15 + SoVITS 8 alcanza una tasa de tiempo real (RTF) mediana de aproximadamente 0,25 en frases cortas, es decir, el tiempo de síntesis es aproximadamente una cuarta parte de la duración del audio generado. No se han publicado resultados de benchmarks estándar de TTS (MOS, WER, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete Neiroha-GPT-SoVITS incluye entorno CUDA y los pesos por par suman unos 328 MB, lo que sugiere un consumo moderado, pero no se publica una cifra concreta.
- GPU recomendadas: RTX 6000D verificada por el autor en las pruebas de rendimiento; no se detallan otras GPU validadas.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño reducido de los pesos lo hace plausible, pero no hay dato oficial.
- Opciones de despliegue: Neiroha-GPT-SoVITS (paquete portable para Windows con backend en `http://127.0.0.1:9880`), WebUI de GPT-SoVITS seleccionando v2ProPlus, y descarga de pesos vía `hf download`.
- Latencia y throughput: RTF mediano ~0,25 en RTX 6000D para frases cortas con GPT 15 + SoVITS 8.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AzurLane-GPT-SoVITS-v2ProPlus | TTS clonación, fine-tune de dominio | ja, zh | 902 personajes de Azur Lane con pesos compartidos | no disponible | Hugging Face y paquete Neiroha |
| GPT-SoVITS v2ProPlus (lj1995) | TTS clonación, propósito general | multiidioma (no detallado) | Clonación zero-shot con referencia de 3-10 s | no disponible en la información | Hugging Face |
| Modelos TTS comerciales de voz de personaje | TTS propietario | según proveedor | Voces licenciadas, sin clonación libre | propietaria | APIs de pago |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada; la única comparación cuantitativa publicada es la del propio autor frente al v2ProPlus oficial en similitud de hablante (ver sección de benchmarks).

## Limitaciones y advertencias

- Dominio cerrado: el modelo está entrenado exclusivamente con voces de Azur Lane; no es un TTS generalista y su comportamiento fuera de ese elenco no está evaluado.
- Idiomas limitados a japonés y chino; no se documenta soporte de castellano ni de otros idiomas.
- Licencia no disponible: no se especifican condiciones de uso comercial, por lo que su explotación en producción requiere aclaración previa con el autor y verificación de los derechos sobre las voces originales del videojuego.
- Riesgo de alucinación acústica y artefactos en frases largas: el propio autor recomienda validar pausas y entonación mediante escucha, ya que las métricas de similitud no capturan naturalidad.
- La selección de checkpoint afecta al resultado: no existe una combinación óptima única; GPT 12 + SoVITS 8 rinde mejor en japonés y GPT 14 + SoVITS 8 en chino según la evaluación publicada.
- Dependencia de la calidad de la referencia: se recomienda audio limpio de 3 a 10 segundos con la transcripción y el idioma correctos; referencias deficientes degradan la clonación.
- El flujo de despliegue documentado está orientado a Windows (paquete portable y PowerShell); el soporte en Linux no se detalla.
- Uso de voces de personajes con derechos de autor: la generación y distribución de audio con esas voces puede estar sujeta a restricciones legales ajenas a la licencia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyanFalse/AzurLane-GPT-SoVITS-v2ProPlus
- Repositorio espejo con pesos y demos: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus
- Modelo base GPT-SoVITS: https://huggingface.co/lj1995/GPT-SoVITS
- Versión del modelo base usada: https://huggingface.co/lj1995/GPT-SoVITS/tree/8f8857563c040d542de108a2c18b0425abd6c9c5
- Dataset de entrenamiento: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118
- Snapshot del dataset: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118/tree/39d126bfbaf30311b0518ca8549cc820fc98d92c
- Paquete Neiroha-GPT-SoVITS para Windows: https://github.com/Neiroha/Neiroha-GPT-SoVITS/releases/tag/V1.0.0
- Frontend Neiroha: https://github.com/Neiroha/Neiroha/releases
- Documentación de configuración GPT-SoVITS en Neiroha: https://neiroha.github.io/workflow/providers/gpt-sovits
- Presets de todos los personajes: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/neiroha-all-characters.zip
- Tabla de timbres (CSV): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/voices-all-characters.csv
- Resultados completos de las 25 combinaciones: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/all-characters-comparison.json
- Procedencia del entrenamiento: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/metadata/training-provenance.json
- Checksums SHA-256: https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/SHA256SUMS
- Pesos GPT (japonés, época 12): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/all-characters/s1/azur-lane-all-v2proplus-20261119-e12.ckpt
- Pesos GPT (chino, época 14): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/all-characters/s1/azur-lane-all-v2proplus-20261119-e14.ckpt
- Pesos SoVITS (época 8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/all-characters/s2/azur-lane-all-v2proplus-20261119_e8_s12712.pth
- Demo Nagato japonés (12+8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/demos/all-nagato-ja-gpt12-sovits08.wav
- Demo Nagato chino (14+8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/demos/all-nagato-zh-gpt14-sovits08.wav
- Demo Nagato japonés (15+8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/demos/all-nagato-ja-gpt15-sovits08.wav
- Demo Nagato chino (15+8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/demos/all-nagato-zh-gpt15-sovits08.wav
- Demo TB chino (15+8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/demos/all-tb-zh-gpt15-sovits08.wav
- Demo Anshan chino (15+8): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-v2ProPlus/resolve/main/demos/all-anshan-zh-gpt15-sovits08.wav
