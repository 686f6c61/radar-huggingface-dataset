# Fioceen/AstroAutoMapper

## Resumen

AstroAutoMapper es un modelo de generación automática de mapas (charts) para juegos de ritmo, concretamente para el formato simai empleado por maimai y por el simulador AstroDX. Desarrollado por el usuario Fioceen, el modelo toma como entrada el audio de una canción y produce un archivo `maidata.txt` con la coreografía de notas correspondiente al nivel de dificultad solicitado.

Técnicamente se trata de una arquitectura encoder-decoder construida sobre el encoder de Whisper, con un decoder transformer propio de dimensión 512 o 768 y 6 u 8 capas según la variante. Se distribuyen tres checkpoints con 46,6 M, 97,8 M y 114,6 M de parámetros respectivamente, entrenados para predecir la posición temporal de las notas a partir de la señal de audio.

El modelo es relevante para la comunidad de creadores de charts de maimai y AstroDX, ya que automatiza parcialmente un proceso que normalmente requiere horas de trabajo manual. Sin embargo, se trata de un proyecto muy incipiente: sin descargas, sin licencia declarada y con el código fuente en un repositorio privado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper (base o small) + decoder transformer (d512x6 o d768x8) |
| Parametros totales | 46,6 M (whisper-base.pt) / 97,8 M (whisper_l.pt) / 114,6 M (whisper_s.pt) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch pickle `.pt`) |
| Idiomas soportados | no disponible (la entrada es audio, no texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch pickle (`.pt`) cargado con `weights_only=False` |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El encoder es el de Whisper, en variante base (para `whisper-base.pt` y `whisper_l.pt`) o small (para `whisper_s.pt`). El decoder es un transformer propio con dimensión 512 y 6 capas en dos de las variantes, y dimensión 768 con 8 capas en `whisper_l.pt`. La salida es una secuencia de eventos de chart en formato simai, condicionada al nivel de dificultad solicitado mediante el flag `--level`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente reporta métricas de validación sobre 40 charts de test reservados, con pérdida de validación entre 0,540 y 0,573 según checkpoint, y F1 de detección de onsets con tolerancia de ±50 ms entre 0,707 y 0,717. El ensemble de los tres checkpoints eleva el F1 a 0,727. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de charts en formato simai (`maidata.txt`) para maimai y AstroDX a partir de audio.
- Condicionamiento por nivel de dificultad mediante el parámetro `--level`.
- Condicionamiento por slot de dificultad (`--slot master`, etc.).
- Detección de onsets con F1 de 0,710-0,717 por checkpoint individual y 0,727 en ensemble.
- Soporte de ensemble de múltiples checkpoints en una sola invocación.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto.
- No se documentan capacidades de visión ni de audio más allá del análisis rítmico de la pista de entrada.

## Casos de uso

- Generación de borradores de charts para maimai: un creador puede introducir el MP3 de una canción y obtener un `maidata.txt` de nivel 13 en slot master como punto de partida, reduciendo el tiempo de colocación manual de notas.
- Prototipado rápido en AstroDX: al ser AstroDX un simulador que consume simai, el modelo permite generar charts jugables de forma inmediata para testear canciones propias antes de invertir en un chart definitivo.
- Generación de charts para contenido de creadores: streamers y youtubers pueden producir charts de temática personalizada (canciones virales, memes musicales) sin dominar el editor de maimai.
- Aumento de datos para investigación en generación de charts: el modelo sirve como baseline reproducible para comparar arquitecturas encoder-decoder sobre el mismo conjunto de test de 40 charts.
- Herramienta de asistencia en pipelines de charting: integrable en un flujo que combine la salida del modelo con edición humana, usando el F1 de onsets como indicador de calidad para decidir qué secciones requieren revisión.
- Exploración de ensembles: dado que el ensemble de los tres checkpoints mejora el F1 de 0,717 a 0,727, permite experimentar con combinaciones de checkpoints para maximizar la calidad de la detección de notas.

## Benchmarks y rendimiento

| Modelo | Parametros | Val loss | Onset F1 ±50 ms |
|---|---|---|---|
| whisper-base.pt | 46,6 M | 0,568 | 0,710 |
| whisper_l.pt | 97,8 M | 0,540 | 0,717 |
| whisper_s.pt | 114,6 M | 0,573 | 0,707 |
| Ensemble (los tres) | - | - | 0,727 |

Métricas calculadas sobre 40 charts de test reservados, usando el mapa de tempo del chart. No se han publicado resultados comparativos con otros modelos de generación de charts en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 46,6-114,6 M de parámetros, los pesos ocupan entre aproximadamente 190 MB y 460 MB en FP32, por lo que la VRAM necesaria es modesta y dominada por el encoder Whisper y las activaciones de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se documentan requisitos mínimos.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: el modelo se carga mediante `astromapper.generate.load_model` desde scripts Python con `uv run python generate.py`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de generación automática de charts para maimai o AstroDX en la documentación proporcionada. El propio autor no incluye baseline externo en la model card; únicamente compara sus tres checkpoints entre sí y su ensemble.

| Modelo | Parametros | Contexto | Onset F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AstroAutoMapper (whisper-base.pt) | 46,6 M | no disponible | 0,710 | no disponible | Hugging Face |
| AstroAutoMapper (whisper_l.pt) | 97,8 M | no disponible | 0,717 | no disponible | Hugging Face |
| AstroAutoMapper (whisper_s.pt) | 114,6 M | no disponible | 0,707 | no disponible | Hugging Face |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si se permite uso comercial, modificación o redistribución; esto bloquea su adopción en producción sin aclaración previa del autor.
- Código fuente en repositorio privado (`github.com/PurinNyova/AstroAutoMapper`): no es posible auditar el pipeline de entrenamiento ni reproducir los resultados.
- Los pesos se distribuyen como pickle de PyTorch y requieren `weights_only=False` para cargarse, lo que supone un riesgo de ejecución de código arbitrario; solo deben cargarse ficheros de confianza.
- Sin descargas ni validación comunitaria: no hay evidencia de uso en producción ni de robustez frente a géneros musicales fuera del conjunto de test.
- El F1 de onsets (0,71-0,73) implica que aproximadamente un 27-29 % de las notas no se detectan correctamente a ±50 ms, por lo que la salida requiere revisión humana.
- Solo 40 charts de test: la evaluación es reducida y no se reportan métricas por género, tempo o densidad de notas.
- No se documentan sesgos, limitaciones idiomáticas (la entrada es audio) ni comportamiento en canciones con cambios de tempo abruptos.
- Proyecto sin mantenimiento aparente: creado y actualizado el mismo día (2026-11-10), sin historial posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fioceen/AstroAutoMapper
- Repositorio de código (privado): https://github.com/PurinNyova/AstroAutoMapper
