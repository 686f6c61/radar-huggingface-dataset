# christoo23/glance-voices

## Resumen

Glance Voices es una colección de tres estados de voz (conditioning caches) para Kyutai Pocket TTS, el sistema de síntesis de voz ligero de Kyutai Labs. No se trata de un modelo de lenguaje ni de un TTS completo, sino de artefactos derivados: ficheros `.safetensors` que codifican la condición de hablante necesaria para que el modelo Pocket TTS en francés genere voz con una identidad concreta. El autor, christoo23, los publica para uso del asistente Glance en macOS.

El repositorio contiene tres voces femeninas en francés (Claire, Léa y Margaux), calculadas a partir de grabaciones del dataset CML-TTS redistribuidas por Kyutai en `kyutai/tts-voices`. Cada fichero se generó ejecutando el modelo francés de Pocket TTS (6 capas) sobre el clip de referencia; no se redistribuye audio de las hablantes originales, solo el estado latente resultante.

Su relevancia es práctica y acotada: permite a desarrolladores que ya usan Pocket TTS en francés disponer de voces listas para usar sin tener que calcular sus propias condiciones de hablante. El repositorio es de tamaño 0.0 GB (solo pesos de condición), con licencia CC BY 4.0 y sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | estados de voz (conditioning cache) para Kyutai Pocket TTS; el modelo TTS subyacente es un transformer de 6 capas en su variante francesa |
| Parametros totales | no disponible (el repositorio no incluye pesos completos del modelo TTS, solo los estados de voz) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (ficheros `voices/claire.safetensors`, `voices/lea.safetensors`, `voices/margaux.safetensors`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: produce estados de voz. Cada fichero `.safetensors` es una caché de condicionamiento calculada con el modelo francés de Kyutai Pocket TTS (6 capas) a partir de un clip de referencia del dataset CML-TTS, en la versión publicada por Kyutai en `kyutai/tts-voices` bajo la ruta `cml-tts/fr/`. La correspondencia entre ficheros y clips es: `claire.safetensors` con `12205_11650_000004-0002`, `lea.safetensors` con `12977_10625_000037-0001` y `margaux.safetensors` con `1591_1028_000108-0004`.

El material de origen son grabaciones de lectores voluntarios de LibriVox recopiladas en CML-TTS (Oliveira et al., 2023), un corpus multilingüe para síntesis de voz en lenguas de bajos recursos, con licencia CC BY 4.0. El autor declara explícitamente que los clips originales se transformaron en estados de voz de Pocket TTS y que no se redistribuye audio de las hablantes. No se documentan detalles adicionales sobre el proceso de extracción, la duración de los clips ni hiperparámetros de cálculo.

## Capacidades

- Síntesis de voz en francés mediante Kyutai Pocket TTS, usando los estados como condición de hablante.
- Tres identidades de voz femeninas predefinidas: Claire, Léa y Margaux.
- Integración directa con la librería `pocket-tts` y con el pipeline `text-to-speech` de Hugging Face.
- Uso previsto en el asistente Glance sobre macOS.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling.
- No soporta otros idiomas distintos del francés.
- No se documentan modos especiales (clonación en tiempo real, emoción, velocidad variable) más allá de lo que ofrezca Pocket TTS por sí mismo.

## Casos de uso

- Asistente de escritorio en macOS: el caso declarado por el autor; el asistente Glance carga estos estados para dotar de voz francesa a sus respuestas sin necesidad de grabar ni procesar audio propio.
- Prototipado rápido de TTS en francés: un desarrollador que ya tenga Pocket TTS instalado puede cargar `claire.safetensors` y obtener voz sintética inmediata, evitando el paso de calcular la condición de hablante desde un clip.
- Aplicaciones de lectura en voz alta: integración en lectores de artículos o libros en francés donde se requiere una voz consistente a lo largo de sesiones largas.
- Generación de audiolibros o pódcasts sintéticos: las tres voces permiten alternar narradores en un mismo proyecto sin dependencias externas de audio.
- Pruebas A/B de voces en producto: comparar percepción de calidad entre Claire, Léa y Margaux para elegir la voz de una interfaz sin coste de grabación.
- Evaluación de Pocket TTS en francés: usar los estados como referencia reproducible en experimentos de comparación de sistemas TTS.
- Localización de contenido educativo o de accesibilidad: convertir material escrito en francés a audio para usuarios con discapacidad visual, siempre que se respete la atribución CC BY 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio solo contiene estados de voz; el consumo depende del modelo Pocket TTS subyacente, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; Pocket TTS está diseñado por Kyutai como sistema ligero, pero no se aportan cifras concretas en esta ficha.
- Opciones de despliegue: librería `pocket-tts` (según los tags del repositorio) y pipeline `text-to-speech` de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Glance Voices (christoo23) | estados de voz para Pocket TTS | fr | CC BY 4.0 | safetensors | Hugging Face |
| kyutai/tts-voices | clips de referencia para Pocket TTS | varios (incl. fr) | CC BY 4.0 | audio | Hugging Face |
| Kyutai Pocket TTS (modelo base) | modelo TTS | varios | pesos CC BY 4.0, código MIT | no disponible en la informacion | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo Pocket TTS en francés y la librería `pocket-tts`, los ficheros no producen audio.
- Solo francés: cualquier uso en otro idioma queda fuera del alcance declarado.
- Sesgos: las tres voces provienen de lectores voluntarios de LibriVox vía CML-TTS, lo que puede introducir sesgos de registro (lectura literaria), acento y demografía; no se documenta análisis de sesgo.
- Riesgo de alucinación: no aplica a nivel de contenido, pero un TTS puede producir prosodia o pronunciaciones incorrectas en textos con nombres propios, siglas o dominios especializados.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución a los lectores de LibriVox, a CML-TTS (Oliveira et al., 2023), a Kyutai por los clips y a Kyutai Pocket TTS por el modelo usado para calcular los estados; además debe indicarse que los clips se transformaron en estados de voz.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.
- Sin garantías de calidad: no se publican muestras de audio, métricas MOS ni evaluaciones subjetivas de las tres voces.
- Fecha de creación registrada como 2026-10-29, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/christoo23/glance-voices
- Kyutai Pocket TTS (GitHub): https://github.com/kyutai-labs/pocket-tts
- Clips de referencia Kyutai: https://huggingface.co/kyutai/tts-voices
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- CML-TTS (Oliveira et al., 2023): referencia citada en la model card; no se proporciona URL directa en la información disponible.
