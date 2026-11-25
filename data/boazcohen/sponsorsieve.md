# Boazcohen/sponsorsieve

## Resumen

SponsorSieve es un modelo de clasificación de tokens (token classification) especializado en la detección de anuncios y lecturas de patrocinadores en transcripciones de pódcasts. Lo desarrolla Boazcohen como un fine-tune del modelo ModernBERT-base de Answer.AI, una arquitectura transformer encoder con atención de longitud completa y ventanas de contexto ampliadas. El modelo etiqueta cada token de una transcripción como `content`, `ad` o `self_promo`, lo que permite segmentar automáticamente los bloques publicitarios dentro de un episodio.

El problema que resuelve es concreto: la publicidad insertada en pódcasts suele estar integrada en el audio hablado y no en metadatos, por lo que filtrarla o saltarla requiere analizar el texto. SponsorSieve ofrece una alternativa ligera (151 MB en int8 ONNX) que procesa 20 horas de audio en unos 5 minutos de CPU, sin necesidad de GPU ni de PyTorch en el despliegue por defecto.

Con 149,6 millones de parámetros y licencia Apache 2.0, el modelo está pensado para integrarse en pipelines de limpieza de transcripciones, reproductores de pódcasts o sistemas de archivado. Su relevancia actual radica en que combina un encoder eficiente con un proceso de etiquetado automático supervisado por un modelo mayor (Qwen 3.5 9B), lo que reduce el coste de anotación manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (transformer encoder, fine-tune para token classification) |
| Parametros totales | 149.607.171 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 1024 tokens con stride de 512 |
| Tipos de cuantizacion | int8 (ONNX), fp32 (ONNX y safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (int8 y fp32) |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer que sustituye la atención clásica por mecanismos optimizados (atención lineal/rotatoria y ventanas de contexto ampliadas) para procesar secuencias largas de forma eficiente. Sobre esa base se añade una cabeza de clasificación de tokens que asigna a cada token una de tres etiquetas: `content`, `ad` o `self_promo`.

El entrenamiento se realizó con 283 episodios recientes de aproximadamente 100 pódcasts populares de EE. UU., transcritos con faster-whisper large-v3-turbo. Un modelo local Qwen 3.5 9B actuó como etiquetador en dos pasadas: primero detecta anuncios en ventanas y después verifica cada bloque candidato. Se usaron 256 episodios para entrenamiento y 27 (de 9 programas) para validación. El entrenamiento consistió en 3 épocas, learning rate 5e-5, batch efectivo de 16, bf16 y entropía cruzada con pesos de clase; el checkpoint se seleccionó por F1 de anuncios en validación (época 2). No se emplearon datos de SponsorBlock y las transcripciones no se redistribuyen.

El pipeline de inferencia concatena las frases de la transcripción (cada una prefijada con un espacio) en ventanas de 1024 tokens con solapamiento de 512, promedia las probabilidades por frase y marca como anuncio toda frase con P(ad) ≥ 0,5; después fusiona frases adyacentes separadas por hasta 8 segundos y descarta fragmentos de menos de 20 segundos.

## Capacidades

- Detección de anuncios y lecturas de patrocinadores en transcripciones de pódcasts en inglés.
- Etiquetado a nivel de token con tres clases: `content`, `ad` y `self_promo`.
- Segmentación temporal: devuelve intervalos con `start`, `end`, `score` y `kind`.
- Procesamiento por lotes de transcripciones largas mediante ventanas de 1024 tokens con stride de 512.
- Ejecución en CPU con ONNX Runtime (int8), sin dependencia de PyTorch en el modo por defecto.
- CLI con comandos `detect`, `clean` y `serve`, además de una API Python (`Detector().detect(segments)`).
- Demo ejecutable en el navegador.
- No dispone de tool calling, capacidades de agente, visión ni audio nativo; trabaja exclusivamente sobre texto transcrito.

## Casos de uso

- Limpieza de transcripciones de pódcasts: el modelo elimina o marca los bloques publicitarios antes de publicar la transcripción, usando el comando `clean` de la CLI sobre el texto ya transcrito.
- Reproductores de pódcasts con salto de anuncios: integrando la detección en el pipeline de transcripción, el reproductor puede saltar automáticamente los intervalos etiquetados como `ad` sin depender de metadatos del editor.
- Archivado y catalogación: al procesar grandes volúmenes de episodios, el modelo permite separar contenido editorial de publicidad para indexar o analizar solo el contenido relevante.
- Análisis de inversión publicitaria: agregando las detecciones a lo largo de muchos episodios se pueden medir patrocinadores, duración de las lecturas y frecuencia por programa.
- Moderación y cumplimiento: detectar `self_promo` para revisar promociones cruzadas internas o contenido patrocinado no declarado en plataformas que exigen transparencia.
- Preprocesado para otros modelos: usar la salida de SponsorSieve para recortar anuncios antes de pasar la transcripción a un modelo de resumen o de búsqueda semántica, reduciendo ruido y coste de contexto.
- Despliegue en servidores sin GPU: al ejecutarse en CPU con ONNX int8, encaja en servicios modestos o en entornos edge donde no hay acelerador disponible.

## Benchmarks y rendimiento

Evaluación sobre el corpus MinusPod (15 episodios, 20,4 horas, 58 anuncios verificados manualmente; los programas del benchmark se excluyeron del entrenamiento). Un anuncio se considera encontrado si la predicción cubre al menos el 30 % de su duración; una predicción es falso positivo si menos del 30 % se solapa con un anuncio real. Es la métrica propia del proyecto, no la del leaderboard de MinusPod.

| Modelo | Recall | Precision | F1 | Segundo recall | Segunda precision |
|---|---|---|---|---|---|
| int8 ONNX | 0,879 | 0,850 | 0,864 | 0,878 | 0,892 |
| fp32 ONNX | 0,879 | 0,864 | 0,872 | 0,888 | 0,883 |
| Qwen 3.5 9B (etiquetador profesor) | 0,948 | 0,873 | 0,909 | 0,934 | 0,806 |

F1 de `self_promo` en validación retenida: 0,74 (no verificado manualmente).

## Requisitos de hardware

- VRAM: no requiere GPU; el modo por defecto (int8 ONNX) funciona en CPU.
- Tamaño en disco: 151 MB (int8 ONNX), 599 MB (fp32 ONNX), 1,3 GB el repositorio completo.
- GPU recomendadas: no aplica para el modo ONNX en CPU; para fine-tuning con PyTorch se recomienda una GPU con al menos 16 GB de VRAM (no especificado por el autor).
- Cabe en cualquier equipo consumer: el modelo int8 se ejecuta en CPU de portátil o servidor modesto.
- Opciones de despliegue: ONNX Runtime (por defecto), PyTorch/transformers con `AutoModelForTokenClassification`, CLI `sponsorsieve` y servidor incluido (`serve`).
- Rendimiento: aproximadamente 20 horas de audio procesadas en unos 5 minutos de CPU con el modelo int8 (dato del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SponsorSieve | 149,6 M | ventanas de 1024 tokens | Detección de anuncios en pódcasts | Apache 2.0 | Hugging Face, ONNX, CLI |
| ModernBERT-base (base) | 149 M aprox. | 8192 tokens | Encoder generalista | Apache 2.0 | Hugging Face |
| Qwen 3.5 9B (etiquetador profesor) | 9 B aprox. | no disponible | Detección de anuncios (uso como profesor) | no disponible | Uso local en el proyecto |

No se han identificado en la información disponible otros modelos públicos especializados en detección de anuncios en transcripciones de pódcasts con los que comparar directamente.

## Limitaciones y advertencias

- Solo cubre inglés y pódcasts de EE. UU.; no se ha validado en otros idiomas ni en otros formatos de audio.
- Depende de la transcripción: anuncios sin palabras (solo música o jingles) o transcripciones con errores no se detectan.
- Es más débil en programas de noticias tecnológicas donde los presentadores hablan de productos, y en cuñas cortas insertadas por la cadena.
- El etiquetado de entrenamiento proviene de un modelo (Qwen 3.5 9B), no de anotación humana, por lo que puede heredar sesgos o errores del profesor.
- El F1 de `self_promo` (0,74) no está verificado manualmente y es inferior al de anuncios.
- La métrica de evaluación es la del propio proyecto (umbral del 30 % de solapamiento), no la del leaderboard de MinusPod.
- Licencia Apache 2.0: permite uso comercial, pero no se redistribuyen las transcripciones de entrenamiento.
- Riesgo de falsos positivos en contenido editorial que mencione marcas o productos de forma legítima.
- No es un modelo generativo: no resume, no traduce ni responde preguntas; solo etiqueta tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Boazcohen/sponsorsieve
- Repositorio GitHub (código, CLI y pipeline de entrenamiento): https://github.com/BoazCohenJ/SponsorSieve
- Demo en navegador: https://boazcohenj.github.io/SponsorSieve/demo/
- Corpus de evaluación MinusPod: https://github.com/ttlequals0/MinusPod
- Modelo base ModernBERT: https://huggingface.co/answerdotai/ModernBERT-base
