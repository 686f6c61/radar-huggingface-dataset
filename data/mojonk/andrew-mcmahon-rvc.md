# mojonk/andrew-mcmahon-rvc

## Resumen

Andrew McMahon voice model es un modelo de conversión de voz (voice conversion) basado en RVC v2 (Retrieval-based Voice Conversion, versión 2) a 40 kHz, entrenado para replicar la voz del músico Andrew McMahon. Lo publica el usuario mojonk en Hugging Face y lo desarrolla "AirBudd Dwyer" según la model card. No es un modelo de lenguaje: es un modelo acústico que transforma una señal de voz de entrada en la voz objetivo, por lo que su uso se enmarca en producción musical, doblaje y experimentación con síntesis de voz.

El repositorio contiene un checkpoint en formato `.pth` junto con su fichero de índice de características (`.index`), que en RVC sirve para la recuperación de embeddings durante la inferencia. El entrenamiento se realizó en una GPU A40 alquilada en RunPod en noviembre de 2026, con 955 clips (47,4 minutos) de voces principales aisladas y 160 épocas.

Es relevante como ejemplo de modelo RVC de nicho: la información publicada es mínima (sin pipeline declarado, sin idiomas, sin benchmarks) y la licencia figura como "other", lo que obliga a revisar los términos antes de cualquier uso. Su tamaño de repositorio (0,5 GB) es coherente con un checkpoint RVC típico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RVC v2 (Retrieval-based Voice Conversion), sample rate 40 kHz |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de conversión de voz, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | `.pth` (checkpoint) + `.index` (índice de características), distribuidos en un zip |

## Arquitectura y entrenamiento

RVC v2 es una arquitectura de conversión de voz que combina un extractor de características (en este caso con seguimiento de tono RMVPE) con un generador neuronal que sintetiza la voz objetivo a partir del contenido lingüístico y el tono de la señal de entrada. El modelo se entrena sobre pares de audio, y en este caso el dataset consiste en 955 clips de voces principales aisladas de Andrew McMahon, con una duración total de 47,4 minutos.

El entrenamiento se ejecutó durante 160 épocas en una GPU A40 alquilada en RunPod en noviembre de 2026. La model card no documenta la composición exacta del dataset, el preprocesado, la función de pérdida ni si hubo etapas de refinamiento adicionales. Sí indica parámetros de inferencia recomendados: pitch 0, protect 0.33 y seguimiento de tono RMVPE.

## Capacidades

- Conversión de voz (voice conversion): transforma una grabación de voz de entrada en la voz de Andrew McMahon.
- Síntesis de canto: el modelo se entrenó específicamente con voces principales aisladas, por lo que está orientado a voces cantadas más que a habla conversacional.
- Control de tono mediante seguimiento RMVPE, con ajuste de pitch configurable en la inferencia.
- Gestión de timbre mediante el parámetro "protect" (0.33 recomendado), que preserva características de la señal original.
- No soporta tool calling, agentes, razonamiento multi-step ni procesamiento de texto.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión, audio de entrada más allá de la propia voz).

## Casos de uso

- Producción musical y demos: aplicar el modelo a una pista vocal guía para generar una versión con el timbre de Andrew McMahon, útil en maquetas o pruebas de arreglos antes de contratar al vocalista real.
- Doblaje y covers: convertir una interpretación vocal propia en la voz objetivo para vídeos musicales o contenido de fans, usando pitch 0 y protect 0.33 como ajustes de partida.
- Prototipado de personajes de voz: integrar el checkpoint en un pipeline RVC para generar una voz cantada consistente en un proyecto de ficción sonora o un videojuego.
- Investigación en conversión de voz: usar el par `.pth` + `.index` como caso de estudio de un modelo RVC v2 a 40 kHz entrenado con pocos datos (47,4 minutos), para comparar calidad frente a otros checkpoints.
- Restauración creativa de grabaciones: aplicar el modelo a grabaciones vocales antiguas o de baja calidad para aproximar el timbre objetivo, siempre con autorización sobre la voz de origen.
- Educación y experimentación con seguimiento de tono: probar distintas configuraciones de RMVPE y protect para estudiar cómo afectan a la naturalidad y al timbre en un modelo de conversión de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; los checkpoints RVC de este tamaño suelen ejecutarse en GPUs de consumo, pero no hay cifra confirmada.
- GPU de entrenamiento documentada: NVIDIA A40 (alquilada en RunPod), 160 épocas.
- GPU recomendadas: no disponible; el entrenamiento se hizo en A40, sin datos de inferencia.
- ¿Cabe en GPU de consumo? No confirmado; el repositorio ocupa 0,5 GB, lo que sugiere que el checkpoint es manejable, pero no se especifica VRAM.
- Opciones de despliegue: no disponible; RVC suele desplegarse con herramientas propias del ecosistema (por ejemplo, interfaces de inferencia RVC), pero la model card no lo indica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Sample rate | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Andrew McMahon RVC (mojonk) | RVC v2 | 40 kHz | 955 clips, 47,4 min, 160 épocas | other | Hugging Face |
| Otros checkpoints RVC v2 de la comunidad | RVC v2 | variable (32-48 kHz) | variable | variable | Hugging Face / foros |
| Modelos de conversión de voz comerciales | propietario | variable | no disponible | comercial | APIs de pago |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- La licencia figura como "other": es imprescindible revisar los términos completos antes de cualquier uso comercial o redistribución.
- El modelo replica la voz de una persona real (Andrew McMahon); su uso plantea riesgos de suplantación, derechos de imagen y derechos de autor sobre las grabaciones originales.
- Dataset pequeño (47,4 minutos) y entrenado solo con voces principales aisladas: puede generalizar mal a habla, susurros, coros o voces con ruido de fondo.
- No hay información sobre sesgos acústicos, cobertura de registros vocales ni comportamiento fuera del dominio de entrenamiento.
- Riesgo de artefactos y pérdida de naturalidad en notas extremas o pasajes con mucha dinámica, no cuantificado en la model card.
- No se documentan idiomas soportados; el modelo no procesa texto, por lo que la noción de idioma aplica solo al audio de entrada.
- Sin pipeline declarado ni métricas de calidad publicadas: la evaluación depende de pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/mojonk/andrew-mcmahon-rvc
