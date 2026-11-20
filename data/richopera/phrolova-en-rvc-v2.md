# Richopera/phrolova-en-rvc-v2

## Resumen

Phrolova EN RVC v2 es un modelo de conversión de voz (voice conversion, no text-to-speech) entrenado con la técnica Retrieval-based Voice Conversion v2 (RVC v2) mediante el software Applio. Convierte una grabación vocal existente, ya sea habla o canto, en el timbre de Phrolova (弗洛洛), personaje de *Wuthering Waves* en su versión inglesa, doblada por Rae Lim. Lo publica el usuario Richopera en Hugging Face, con un repositorio de 1,5 GB que contiene 20 checkpoints y un índice de recuperación de características de 446 MB.

El modelo parte de los pesos preentrenados oficiales de RVC v2 y se afina sobre un conjunto de 733 archivos de audio en inglés (unos 47,8 minutos, aproximadamente 1.382 segmentos tras el troceado automático), durante 200 épocas y 34.600 pasos con batch size 8. Emplea RMVPE para la extracción de tono y ContentVec para las características de contenido, con vocoder HiFi-GAN a 40 kHz. Su relevancia es acotada: es un recurso de nicho para aficionados a la conversión de voz y al doblaje creativo, no un modelo de propósito general.

La licencia es propia (Richopera Voice Model License v2.0), permite uso personal no comercial y publicación no comercial de audio convertido con atribución, y exige permiso escrito previo para redistribuir pesos originales o derivados. No hay resultados de benchmarks publicados ni ejemplos de audio disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), 40 kHz, vocoder HiFi-GAN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo audio-audio, sin contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial) |
| Formato de pesos | `.pth` (20 checkpoints) e índice `.index` (446 MB, 141.327 frames) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RVC v2, un pipeline de conversión de voz que combina extracción de tono con RMVPE, extracción de características de contenido con ContentVec y un decoder con vocoder HiFi-GAN a 40 kHz. Se apoya en los pesos preentrenados oficiales de RVC v2 y se afina con Applio, la herramienta de entrenamiento e inferencia de código abierto del ecosistema RVC. La inferencia usa recuperación de características (feature retrieval) mediante el índice `PhrolovaEN.index`, que contiene 141.327 frames y es compartido por los 20 checkpoints.

El entrenamiento se realizó sobre 733 archivos de voz en inglés recopilados por jugadores, con un total de unos 47,8 minutos y aproximadamente 1.382 segmentos tras el troceado automático. Se filtraron clips con reverberación excesiva. La configuración fue de 200 épocas y 34.600 pasos, batch size 8, con un `loss_gen` final de 26,621, en una instancia cloud con una NVIDIA RTX 4090D (24 GB) durante aproximadamente 2,3 horas. No se documenta uso de RLHF ni DPO; es un ajuste supervisado clásico de RVC.

## Capacidades

- Conversión de voz audio-a-audio: transforma el timbre de una grabación vocal existente al de Phrolova en inglés.
- Conversión aplicable tanto a habla como a canto, aunque el dataset de entrenamiento contiene únicamente habla.
- Extracción de tono con RMVPE, con control de desplazamiento de tono en semitonos durante la inferencia.
- Ajuste de la relación de búsqueda de características (Search Feature Ratio, entre 0,50 y 0,75) para equilibrar fidelidad y naturalidad.
- Troceado de audio (Split Audio) para grabaciones largas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta texto a voz: para TTS el autor ofrece un modelo GPT-SoVITS separado.
- Capacidad multilingüe limitada al inglés; el modelo chino de Phrolova es un checkpoint distinto e intercambiable.

## Casos de uso

- Creación de covers cantados: se extrae la pista vocal aislada con UVR o MSST y se convierte con el checkpoint elegido (empezando por 200e o 150e) para obtener la misma interpretación con el timbre de Phrolova en inglés.
- Doblaje amateur de contenido de *Wuthering Waves*: se convierte una locución grabada por el usuario al timbre del personaje para vídeos de fans o proyectos de doblaje no comerciales.
- Producción de contenido para redes: se generan clips de audio con la voz del personaje a partir de grabaciones propias, respetando la licencia de publicación no comercial con atribución.
- Experimentación con pipelines RVC: sirve como referencia para estudiar el flujo completo de Applio (RMVPE, ContentVec, índice de recuperación) con un modelo pequeño y de entrenamiento rápido.
- Pruebas de comparación de checkpoints: los 20 checkpoints permiten evaluar cómo evoluciona la calidad del timbre a lo largo del entrenamiento sobre la misma entrada.
- Prototipado de conversión de voz en investigación de timbre: útil para analizar el comportamiento de RVC v2 con distribuciones de tono estrechas (mediana de 194 Hz, rango central 165-305 Hz).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento se realizó con una RTX 4090D de 24 GB, pero la inferencia de RVC v2 suele requerir bastante menos.
- GPU recomendadas: no disponible; el autor solo documenta la RTX 4090D para entrenamiento.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Despliegue: Applio (WebUI) es el método documentado; requiere colocar los `.pth` y el `.index` en `logs/PhrolovaEN/` y refrescar modelos e índices.
- Latencia y throughput: no disponibles; el entrenamiento tardó unas 2,3 horas (unos 42 segundos por época al final).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto / formato | Disponibilidad |
|---|---|---|---|---|---|
| Richopera/phrolova-en-rvc-v2 | RVC v2, conversión de voz | Inglés | Richopera Voice Model License v2.0 | `.pth` + `.index` | Hugging Face |
| Richopera/phrolova-rvc-v2 | RVC v2, conversión de voz | Chino | no disponible | `.pth` + `.index` | Hugging Face |
| Richopera/phrolova-en-gpt-sovits-v2proplus | GPT-SoVITS, texto a voz | Inglés | no disponible | no disponible | Hugging Face |
| IAHispano/Applio | Framework base RVC | no disponible | no disponible | no disponible | Hugging Face / GitHub |

## Limitaciones y advertencias

- Rango de tono estrecho: la voz de entrenamiento tiene una distribución de tono baja y estrecha (mediana de 194 Hz, 80 % central entre 165 y 305 Hz), lo que puede producir resultados apagados o chirriantes en canciones con gran amplitud melódica.
- Calidad de entrada: la presencia de acompañamiento o reverberación introduce ruido y distorsiona el timbre objetivo; es necesario usar pistas vocales aisladas y secas.
- El dataset contiene habla, no canto: las notas sostenidas y agudas dependen de los pesos base de RVC v2, no del ajuste.
- Pronunciación y ornamentación: los pasajes densos y el vibrato son difíciles para RVC; se recomienda empezar con baladas lentas.
- No hay ejemplos de audio publicados ni ajustes de tono verificados por escucha; los valores como +4 semitonos para *City of Stars* son estimaciones basadas en estadísticas, no configuraciones validadas.
- Licencia restrictiva: solo permite uso personal no comercial y publicación no comercial con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- Riesgo de uso indebido de la voz de una actriz real (Rae Lim) y de propiedad intelectual de *Wuthering Waves*; el usuario debe evaluar implicaciones legales y éticas.
- Sin benchmarks ni métricas objetivas de calidad publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/phrolova-en-rvc-v2
- Modelo chino de Phrolova: https://huggingface.co/Richopera/phrolova-rvc-v2
- Modelo GPT-SoVITS en inglés: https://huggingface.co/Richopera/phrolova-en-gpt-sovits-v2proplus
- Modelo base Applio: https://huggingface.co/IAHispano/Applio
- Repositorio Applio: https://github.com/IAHispano/Applio
- *Wuthering Waves*: https://wutheringwaves.kurogames.com/en/main/
- Licencia (inglés): LICENSE_en.md (en el repositorio)
- Licencia (chino): LICENSE.md (en el repositorio)
