# paincupid/Paraformer-ZH-Original

## Resumen

Paraformer-ZH-Original es un espejo (mirror) de los pesos originales del modelo Paraformer-large, desarrollado originalmente por Alibaba DAMO Academy y distribuido a través del proyecto FunASR bajo licencia Apache-2.0. Este repositorio, mantenido por el usuario paincupid, no constituye una publicación original sino una copia de respaldo con fines de compatibilidad, preservando los pesos y la configuración byte a byte, junto con los commits upstream fijados, tamaños de archivo y hashes SHA-256 documentados en `provenance.json` y `SHA256SUMS`.

Paraformer es un modelo de reconocimiento automático de voz (ASR) no autorregresivo basado en arquitectura transformer, diseñado para transcripción de audio en mandarín. Su relevancia radica en que ofrece una alternativa de inferencia paralela frente a los modelos ASR autorregresivos tradicionales, reduciendo la latencia en producción. Este repositorio concreto sirve como copia de seguridad reproducible para pipelines que necesitan garantizar la integridad de los pesos originales.

La información pública disponible en este repositorio es limitada: no se especifican parámetros totales, longitud de contexto ni idiomas soportados más allá de la referencia "ZH" en el nombre. El tamaño del repositorio es de 0,8 GB, lo que es coherente con un modelo ASR de tamaño medio-grande en precisión completa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (Paraformer, según nombre del modelo; detalles no disponibles en la información proporcionada) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el sufijo "ZH" sugiere mandarín, sin confirmación explícita) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repo incluye `provenance.json` y `SHA256SUMS`; formato concreto de pesos no especificado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El nombre del modelo, Paraformer, hace referencia a la familia de modelos ASR no autorregresivos desarrollados por Alibaba DAMO Academy dentro del ecosistema FunASR. Estos modelos se caracterizan por predecir la secuencia de tokens de forma paralela mediante un mecanismo de predictor de tokens, evitando la decodificación secuencial de los modelos autorregresivos.

Tampoco se especifican en este repositorio los datos de entrenamiento (número de horas de audio, composición del dataset, uso de técnicas de aumento de datos) ni si se aplicaron etapas de ajuste fino supervisado o preferencias. El repositorio se limita a preservar los pesos y la configuración originales, remitiendo implícitamente al proyecto FunASR para los detalles técnicos completos.

## Capacidades

- Reconocimiento automático de voz (ASR) para audio en mandarín, según se deduce del sufijo "ZH" del nombre del modelo.
- Transcripción de audio a texto con decodificación no autorregresiva (inferencia paralela), característica de la familia Paraformer.
- Preservación de integridad de pesos mediante hashes SHA-256 y commits upstream fijados, útil para pipelines reproducibles.
- No se documentan en este repositorio capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Transcripción de reuniones y notas de voz en mandarín: el modelo puede convertir audio a texto en flujos de trabajo de productividad, aprovechando la inferencia no autorregresiva para reducir latencia en comparación con modelos ASR secuenciales.
- Subtitulado automático de vídeo en chino: integración en pipelines de postproducción para generar subtítulos sincronizados, con la ventaja de que los pesos están pinneados y verificables por hash.
- Archivado reproducible de modelos en producción: el repositorio sirve como fuente de verdad para equipos que necesitan desplegar exactamente los mismos pesos que la versión upstream de FunASR, evitando derivas por actualizaciones.
- Verificación de integridad en pipelines MLOps: los archivos `provenance.json` y `SHA256SUMS` permiten validar que los pesos desplegados coinciden byte a byte con los originales, útil en auditorías de cumplimiento.
- Investigación en ASR no autorregresivo: base para experimentos de comparación entre decodificación paralela y autorregresiva en mandarín, usando pesos de referencia estables.
- Transcripción de centros de llamadas en chino: procesamiento por lotes de grabaciones de atención al cliente, donde la velocidad de inferencia paralela reduce el coste computacional por hora de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio (0,8 GB) sugiere que los pesos en precisión completa caben en GPUs de consumo, pero no se confirma el número de parámetros ni el formato.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (0,8 GB) es compatible con GPUs con 8 GB o más de VRAM en precisión completa, pero es una estimación basada únicamente en el tamaño de los archivos.
- Opciones de despliegue: no se documentan en este repositorio. El ecosistema original FunASR ofrece herramientas propias de inferencia, pero no se confirma su uso con estos pesos espejo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Paraformer-ZH-Original (este repo) | no disponible | no disponible | Apache-2.0 | Hugging Face (mirror) | Copia de respaldo de pesos originales |
| Whisper (OpenAI) | no disponible en esta ficha | no disponible | MIT (según versión) | Hugging Face / OpenAI | Modelo ASR autorregresivo multilingüe; comparación cualitativa, datos no verificados aquí |
| Wav2Vec2 (Meta) | no disponible en esta ficha | no disponible | Apache-2.0 (según versión) | Hugging Face | Modelo ASR basado en representaciones auto-supervisadas; comparación cualitativa |

No se dispone de datos cuantitativos de benchmarks para establecer una comparación rigurosa con alternativas. La comparativa anterior es meramente orientativa y no debe usarse para decisiones de selección sin verificación adicional.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial; el mantenedor (paincupid) no es el publicador original y no otorga derechos adicionales sobre los archivos.
- El modelo está orientado presumiblemente a mandarín ("ZH"), pero los idiomas soportados no están confirmados en la documentación.
- No se documentan sesgos conocidos, pero todo modelo ASR puede presentar sesgos de acento, género o dominio que no están caracterizados aquí.
- Riesgo de alucinación en transcripción: los modelos ASR pueden generar texto plausible pero incorrecto en audio con ruido o acentos no vistos; no se dispone de métricas de WER para este repositorio.
- Licencia Apache-2.0 permite uso comercial, pero el espejo no añade garantías; conviene verificar los avisos upstream en `UPSTREAM-README.md` y `provenance.json`.
- No se especifican requisitos de hardware ni formatos de pesos, lo que dificulta la planificación de despliegue sin consultar el proyecto FunASR original.
- La fecha de creación del repositorio (2026-11-05) y la ausencia de descargas o likes indican que es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/paincupid/Paraformer-ZH-Original
- Proyecto FunASR (upstream): no disponible en la información proporcionada
- Paper de Paraformer: no disponible en la información proporcionada
- Repositorio original de Alibaba DAMO Academy: no disponible en la información proporcionada
