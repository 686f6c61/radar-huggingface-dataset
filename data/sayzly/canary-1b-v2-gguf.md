# sayzly/canary-1b-v2-gguf

## Resumen

Canary 1B v2 (GGUF) es una conversión al formato GGUF del modelo de reconocimiento automático del habla `nvidia/canary-1b-v2`, publicada por el usuario `sayzly` en Hugging Face. El modelo original lo desarrolla NVIDIA y está pensado para tareas de transcripción y traducción de voz a texto. Esta variante concreta no introduce cambios en los pesos: se limita a empaquetar el modelo en un único fichero `canary-1b-v2-Q8_0.gguf` con cuantización Q8_0, lo que facilita su despliegue en entornos que consumen GGUF (por ejemplo, herramientas basadas en `llama.cpp` o servidores compatibles).

El repositorio es de tamaño reducido (1,1 GB) y declara 980.046.848 parámetros en formato safetensors, coherente con la denominación "1B" del modelo base. La licencia es CC BY 4.0, heredada del modelo original, y la pipeline declarada es `automatic-speech-recognition`. La relevancia de esta ficha es acotada: se trata de un artefacto derivado y de escasa difusión (0 descargas y 0 likes en el momento de la consulta), por lo que su interés práctico depende enteramente de las capacidades del modelo original de NVIDIA.

No se dispone de información sobre arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de benchmarks en la documentación proporcionada. Todo lo que sigue se limita a lo que consta en la model card y en los metadatos del repositorio, y se marca explícitamente como "no disponible" aquello que no se ha podido verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 980.046.848 |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (fichero `canary-1b-v2-Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (cuantización Q8_0); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El modelo base `nvidia/canary-1b-v2` es un sistema de reconocimiento automático del habla, pero esta ficha no puede confirmar si emplea un encoder tipo Conformer, un decoder autorregresivo, una combinación de ambos u otra topología, ni tampoco detalles sobre mecanismos de atención, tokenizador o estrategia de decodificación.

Respecto al entrenamiento, no consta el número de horas de audio, la composición del dataset, el uso de técnicas de aumento de datos ni la existencia de etapas de ajuste fino supervisado o por preferencias. La conversión a GGUF realizada por `sayzly` no altera los pesos según la propia model card ("weights not otherwise changed"), por lo que las características del modelo original se conservan, pero no se detallan en el repositorio derivado.

## Capacidades

- Reconocimiento automático del habla (speech-to-text), según la pipeline declarada `automatic-speech-recognition`.
- Transcripción de audio a texto en el formato GGUF Q8_0, orientada a despliegues que consumen este formato.
- Traducción de voz a texto: no confirmada en la información disponible, aunque el modelo base de NVIDIA está asociado habitualmente a tareas de traducción; no se puede verificar aquí.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio no está poblado).
- Capacidades especiales (modo thinking, visión, audio adicional): no disponibles.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede emplearse para convertir audio grabado en texto dentro de aplicaciones de productividad, siempre que la herramienta de inferencia soporte GGUF y el modelo base cumpla los requisitos de calidad esperados.
- Subtitulado automático de vídeo: integración en pipelines de generación de subtítulos para plataformas de contenido, usando el fichero Q8_0 como artefacto de despliegue en servidores con `llama.cpp` u otros runtimes compatibles.
- Dictado por voz en aplicaciones de escritorio: al ser un modelo de ~1B parámetros en Q8_0 (1,1 GB), puede ejecutarse en equipos de consumo, lo que permite ofrecer dictado local sin depender de servicios en la nube.
- Procesamiento por lotes de archivos de audio: transcripción de grandes volúmenes de grabaciones (por ejemplo, archivos de atención al cliente) en entornos con GPUs modestas, dado el reducido tamaño del modelo.
- Investigación en ASR: uso como punto de partida para experimentos de cuantización y comparación de calidad entre el modelo original en safetensors y la versión Q8_0 en GGUF.
- Despliegue en dispositivos con recursos limitados: el formato GGUF y el tamaño del fichero permiten su uso en portátiles y mini-PCs con CPU, aunque no se dispone de datos de latencia o throughput para confirmar el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el fichero Q8_0 ocupa aproximadamente 1,1 GB, por lo que se puede estimar un consumo del orden de 1-2 GB de memoria, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar que funcione en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay validación publicada.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el tamaño del fichero, aunque no se ha verificado ni documentado.
- Opciones de despliegue: al tratarse de un GGUF, los runtimes habituales son `llama.cpp` y sus derivados (Ollama, servidores compatibles). No se confirma soporte para vLLM ni TGI, que suelen requerir safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| sayzly/canary-1b-v2-gguf | 980.046.848 | no disponible | CC BY 4.0 | GGUF Q8_0 | Hugging Face |
| nvidia/canary-1b-v2 | ~1B (según denominación) | no disponible | CC BY 4.0 | safetensors | Hugging Face |
| Alternativas ASR de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros modelos ASR de tamaño similar no se puede completar con la información disponible. La única comparación fiable es con el modelo base del que deriva, que conserva los mismos pesos y licencia, pero se distribuye en safetensors y no está cuantizado.

## Limitaciones y advertencias

- Artefacto derivado y de muy baja difusión: 0 descargas y 0 likes en el momento de la consulta, sin garantías de mantenimiento por parte del autor.
- No se documentan sesgos conocidos, pero al ser un modelo ASR entrenado por terceros, puede heredar sesgos acústicos y lingüísticos del dataset original, que no se detalla.
- Riesgo de alucinación en la transcripción: no se dispone de información sobre la tasa de errores de palabra (WER) ni sobre el comportamiento en audio ruidoso o con acentos no representados.
- Idiomas soportados no declarados en el repositorio; no se puede garantizar cobertura multilingüe.
- Licencia CC BY 4.0: permite uso comercial con atribución al autor original (NVIDIA) y al conversor, pero conviene revisar los términos del modelo base por si existiesen condiciones adicionales no reflejadas aquí.
- La cuantización Q8_0 puede degradar ligeramente la calidad respecto al modelo original en safetensors; no se han publicado comparativas de WER entre ambas versiones.
- No se confirma compatibilidad con runtimes de alto rendimiento como vLLM o TGI, lo que limita su uso en producción a gran escala.

## Enlaces

- Repositorio GGUF: https://huggingface.co/sayzly/canary-1b-v2-gguf
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
