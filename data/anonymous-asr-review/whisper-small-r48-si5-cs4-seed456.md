# anonymous-asr-review/whisper-small-r48-si5-cs4-seed456

## Resumen

`anonymous-asr-review/whisper-small-r48-si5-cs4-seed456` es un adaptador LoRA de rango 48 publicado de forma anónima como material suplementario para revisión por pares. No es un modelo completo: es un conjunto de pesos PEFT que se aplica sobre `openai/whisper-small`, el modelo de reconocimiento automático de voz (ASR) encoder-decoder de OpenAI. El adaptador se ha entrenado en dos fases declaradas por el autor: cinco épocas en sinhala y cuatro épocas adicionales en datos con alternancia de código (code-switching) sinhala-inglés, con semilla fija 456, alpha de LoRA 96 y selección del último checkpoint.

El problema que aborda es concreto: Whisper rinde de forma desigual en idiomas de bajos recursos y en habla con mezcla de idiomas. El sinhala (código `si`), pese a estar contemplado en el tokenizador de Whisper, es uno de los idiomas con mayor tasa de error del modelo base. Un adaptador de bajo rango permite especializar el modelo en ese par de idiomas sin reentrenar los 244 M de parámetros del base, y mantiene el coste de inferencia prácticamente idéntico al de `whisper-small`.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, no declara licencia, no publica métricas y su model card se limita a los hiperparámetros del entrenamiento. Debe tratarse como un artefacto de investigación reproducible (semilla y configuración fijadas) y no como un modelo listo para producción. El tamaño del repositorio aparece como 0,0 GB redondeado, coherente con un adaptador pequeño, pero no permite estimar el número exacto de parámetros entrenables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) del modelo base `openai/whisper-small` con adaptador LoRA de bajo rango sobre los pesos base; no es una arquitectura nueva |
| Parametros totales | 244 M en el modelo base (`whisper-small`); número de parámetros del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana fija de 30 segundos de audio a 16 kHz (característica del modelo base); no es un contexto de tokens extensible. El audio más largo requiere segmentación en trozos |
| Tipos de cuantizacion | no especificados por el autor. El adaptador se publica en safetensors y, tras `merge_and_unload()`, el modelo resultante admite las cuantizaciones habituales del base (fp32, fp16, int8 y GGUF/CT2 mediante conversión) |
| Idiomas soportados | sinhala (`si`) e inglés (`en`); entrenamiento declarado en sinhala seguido de code-switching si-en. El resto de los idiomas del modelo base no se han evaluado |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | `openai/whisper-small` (los pesos base se descargan por separado) |
| Libreria | PEFT |
| Rango de LoRA | 48 |
| Alpha de LoRA | 96 (escalado alpha/rango = 2,0) |
| Semilla | 456 |
| Epocas de entrenamiento | 5 en sinhala + 4 en code-switching (9 en total) |
| Seleccion de checkpoint | último (last), sin selección por métrica de validación |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 0,0 GB (redondeado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-12 / 2026-10-12 |

## Arquitectura y entrenamiento

El modelo subyacente es `whisper-small`: un transformer encoder-decoder de 244 M de parámetros con 12 capas en el encoder y 12 en el decoder, anchura de 768 y 12 cabezas de atención, que consume espectrogramas mel de 80 canales a 16 kHz y predice tokens de texto de forma autorregresiva. La entrada se procesa en ventanas fijas de 30 segundos. Sobre ese modelo, el autor entrena un adaptador LoRA de rango 48 y alpha 96 (factor de escalado 2,0), lo que implica que la actualización efectiva sobre las matrices base tiene un peso relativamente alto respecto a configuraciones más conservadoras (por ejemplo, rango 8-16 con alpha igual al rango).

Sobre el entrenamiento solo se conocen los hiperparámetros declarados: semilla 456, cinco épocas en sinhala seguidas de cuatro épocas con datos de code-switching, y selección del último checkpoint. No se especifica el número de horas de audio, la composición del dataset, el corpus de code-switching empleado, si hubo aumento de datos, ni si se aplicó alguna etapa de ajuste fino supervisado adicional. Tampoco se indica si el adaptador se aplicó a encoder, decoder o ambos módulos de atención. No hay datos de validación ni curvas de pérdida publicadas.

## Capacidades

- Reconocimiento automático de voz (transcripción) en sinhala, idioma objetivo principal del ajuste.
- Transcripción de habla con alternancia de código sinhala-inglés, es decir, emisiones en las que el hablante cambia de idioma dentro de la misma frase o conversación.
- Transcripción en inglés, heredada del modelo base y presumiblemente reforzada por la fase de code-switching; no se publican métricas que confirmen el grado de conservación.
- Traducción de voz a texto hacia inglés (`transcribe`/`translate`) en la medida en que lo soporte el base `whisper-small`.
- Carga estándar con `transformers` + `peft` mediante `PeftModel.from_pretrained(...).merge_and_unload()`, lo que produce un modelo Whisper completo reutilizable con las herramientas habituales del ecosistema.
- Al ser un modelo exclusivamente ASR, no ofrece tool calling, function calling, razonamiento multi-paso, agentes, visión, audio generativo ni modo de pensamiento (thinking mode). Los tags del repositorio no incluyen ninguna capacidad de este tipo.

## Casos de uso

- Transcripción de reuniones bilingües en Sri Lanka: en entornos corporativos y académicos es habitual alternar sinhala e inglés en la misma conversación. El ajuste con code-switching está pensado específicamente para este escenario, aunque la ventana de 30 segundos obliga a segmentar el audio y recomponer la transcripción.
- Subtitulado de contenido audiovisual en sinhala: series, entrevistas o vídeos educativos en sinhala con terminología técnica en inglés. Se generaría un fichero de subtítulos mediante segmentación previa con VAD y transcripción en lotes.
- Centros de contacto y atención al cliente: transcripción de llamadas de soporte donde el agente usa inglés para términos de producto y sinhala para el resto. Útil para generar actas, buscar en el histórico o auditar calidad, siempre que la licencia se aclare antes de un uso comercial.
- Documentación clínica y legal dictada: notas de voz de profesionales que mezclan terminología en inglés con explicaciones en sinhala. Requiere revisión humana obligatoria por el riesgo de alucinación y la ausencia de métricas de error publicadas.
- Investigación en ASR con alternancia de código: el repositorio fija semilla (456), rango (48) y alpha (96), lo que lo convierte en una pieza reproducible para estudios de ablación sobre rangos, épocas y fases de entrenamiento frente a otros adaptadores de la misma serie.
- Indexación y búsqueda sobre archivos de audio: transcripción masiva de un corpus de podcasts o grabaciones para construir un índice de texto consultable. La naturaleza offline del proceso permite usar CPU si no hay GPU disponible.
- Sistemas de respuesta de voz interactiva (IVR) o kioscos: reconocimiento de comandos y consultas cortas en sinhala-inglés, integrado con un motor de diálogo externo, ya que el modelo no aporta gestión de estado conversacional.
- Material suplementario para revisión por pares: permite a los revisores reproducir el resultado declarado ejecutando el mismo adaptador con la misma semilla y compararlo con las variantes de la serie `anonymous-asr-review`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los requisitos son esencialmente los de `openai/whisper-small`, ya que el adaptador se fusiona en el modelo base. En fp32 los pesos ocupan aproximadamente 1 GB y en fp16 unos 0,5 GB; sumando activaciones y caché de decodificación, la inferencia en GPU se mueve de forma estimada en el rango de 1-2 GB de VRAM por flujo.
- Cabe sin problemas en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) es suficiente para un flujo único. También es viable en CPU con `whisper.cpp` o `faster-whisper`, a costa de mayor latencia.
- GPU recomendadas para servicio: L4 o A10G para varios flujos concurrentes; A100 o H100 solo tienen sentido si se procesa en lotes muy grandes o si se comparan variantes más pesadas de la serie.
- Opciones de despliegue: `transformers` + `peft` con `merge_and_unload()` es la ruta directa; a partir del modelo fusionado se puede convertir a CTranslate2 (`faster-whisper`) o a GGUF (`whisper.cpp`, Ollama) para inferencia optimizada. La compatibilidad con vLLM no está confirmada por el autor y no se ha verificado en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF (factor de tiempo real) ni de palabras por segundo para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Rendimiento en sinhala | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `anonymous-asr-review/whisper-small-r48-si5-cs4-seed456` | 244 M (base) + adaptador LoRA (no cuantificado) | 30 s | si, en | no disponible (sin métricas publicadas) | no disponible | 0 descargas, 0 likes; repositorio anónimo |
| `openai/whisper-small` (modelo base) | 244 M | 30 s | 99 idiomas | no disponible en esta ficha; es el punto de partida del ajuste | no verificada en la información proporcionada | ampliamente desplegado en el ecosistema |
| `openai/whisper-medium` | 769 M | 30 s | 99 idiomas | no disponible en esta ficha | no verificada en la información proporcionada | ampliamente desplegado |
| `openai/whisper-large-v3` | 1550 M | 30 s | 99 idiomas, con mejor cobertura de idiomas de bajos recursos | no disponible en esta ficha | no verificada en la información proporcionada | ampliamente desplegado; requiere más VRAM |

La comparación es incompleta por diseño: el autor no publica WER ni CER para ninguna condición, de modo que no es posible afirmar si el adaptador mejora al base en sinhala o en code-switching. Cualquier elección entre estas opciones debería pasar por una evaluación propia sobre un conjunto de test representativo del dominio objetivo.

## Limitaciones y advertencias

- Ausencia total de métricas: no hay WER, CER ni ninguna otra medida publicada, ni para sinhala, ni para code-switching, ni para inglés. No se puede verificar la mejora declarada.
- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución. Es un bloqueo para producción hasta que el autor la defina.
- Repositorio anónimo y sin tracción: 0 descargas y 0 likes, creado y actualizado el mismo día. No ha pasado por validación de la comunidad.
- Riesgo de alucinación inherente a Whisper: el modelo base tiende a generar texto plausible en tramos de silencio, ruido o audio musical. Este comportamiento no se corrige con un adaptador LoRA y no está caracterizado para este caso.
- Ventana fija de 30 segundos: no admite contexto largo. El audio debe segmentarse, y los cortes mal alineados degradan la transcripción de code-switching, donde una frase puede empezar en sinhala y terminar en inglés.
- Especialización estrecha: el ajuste se centra en sinhala e inglés. El resto de los idiomas del modelo base puede haber sufrido degradación catastrófica por olvido, especialmente con un escalado de LoRA de 2,0 (alpha 96 / rango 48), que aplica actualizaciones relativamente intensas.
- Selección del último checkpoint sin criterio de validación: no hay garantía de que la novena época sea la mejor; puede haber sobreajuste respecto a una época intermedia.
- Datos de entrenamiento no documentados: se desconoce el volumen, la procedencia y la composición del corpus de sinhala y de code-switching, lo que impide evaluar sesgos de dominio (por ejemplo, sobrerrepresentación de habla leída frente a habla espontánea) o de acento y variedad dialectal.
- Reproducibilidad limitada a la semilla declarada: los resultados de otras semillas de la misma serie pueden diferir; fijar la semilla facilita replicar, pero no estimar la varianza.
- Uso previsto de investigación: dado el contexto (material suplementario para revisión por pares), no debería desplegarse en un sistema que tome decisiones con impacto sobre personas sin supervisión humana y una evaluación propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anonymous-asr-review/whisper-small-r48-si5-cs4-seed456
- Modelo base: https://huggingface.co/openai/whisper-small
- Librería PEFT: https://github.com/huggingface/peft
- Repositorio de referencia de Whisper (OpenAI): https://github.com/openai/whisper
- Implementación optimizada CTranslate2 / faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Implementación en C/C++ whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Resultado de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron únicamente páginas sobre el colectivo hacktivista Anonymous (Wikipedia, sitios divulgativos y tiendas), sin relación con este repositorio. No se han localizado paper, blog ni demo asociados al adaptador.
