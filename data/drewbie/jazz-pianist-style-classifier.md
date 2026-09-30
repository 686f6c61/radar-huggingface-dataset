# drewbie/jazz-pianist-style-classifier

## Resumen

El jazz-pianist-style-classifier es un modelo de clasificación de música simbólica publicado por el autor de HuggingFace `drewbie`, derivado del artículo "Learning Jazz Pianist Style with Cross-Attention Conditioning" (Edwards, Maezawa y Dixon, ISMIR 2026). El modelo identifica al pianista de jazz que ha interpretado un fragmento musical a partir de su representación simbólica (MIDI): se trata de un backbone contrastivo Aria-medium afinado para clasificar 12 pianistas del corpus PiJAMA sobre ventanas de 1024 tokens. No es un modelo generativo ni un modelo de lenguaje: su salida es una etiqueta de clase con sus logits asociados.

Su relevancia es doble. Por un lado, resuelve una tarea clásica de recuperación de información musical (MIR), la identificación de intérprete, con una exactitud declarada del 95,8 % por fragmento y del 98,8 % por pista en el split de test retenido. Por otro, el propio artículo lo utiliza como instrumento de medida para evaluar música generada y localizar los pasajes más característicos de una interpretación, lo que lo convierte en una herramienta de investigación reutilizable dentro del ecosistema de música simbólica de EleutherAI.

El repositorio ocupa 2,5 GB e incluye únicamente los pesos del clasificador (`best.pt`) y un resumen de arquitectura (`config.json`), bajo licencia Apache-2.0. El modelo declara 0 descargas y 0 likes en el momento de la consulta, y no publica recuento de parámetros ni requisitos de hardware; el autor lo describe explícitamente como un artefacto de investigación y no como un servicio de atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone contrastivo Aria-medium y acondicionamiento por cross-attention; cabeza de clasificación de 12 clases |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventanas de 1024 tokens de música simbólica (MIDI) |
| Tipos de cuantización | no disponible; el checkpoint se distribuye en formato PyTorch nativo |
| Idiomas soportados | no aplica (entrada simbólica MIDI, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`best.pt`) más `config.json` |
| Tarea | Clasificación de intérprete (12 clases, pianistas de PiJAMA) |
| Dataset de entrenamiento | PiJAMA (anotaciones MIDI de piano jazz) |
| Agregación a nivel de pista | Voto mayoritario sobre las predicciones por fragmento, con desempate por logit medio |
| Tamaño del repositorio | 2,5 GB |
| Librería declarada | pytorch |
| Autores | Drew Edwards, Akira Maezawa, Simon Dixon |

## Arquitectura y entrenamiento

La arquitectura parte de Aria, el modelo fundacional de música simbólica de EleutherAI (licencia Apache-2.0), en su variante `medium`. Según la model card, se trata de un backbone contrastivo afinado (`fine-tuned`) para clasificar 12 pianistas sobre ventanas de 1024 tokens. El artículo introduce acondicionamiento por cross-attention, que es la innovación técnica central del trabajo: el modelo no se limita a codificar el fragmento, sino que condiciona la representación mediante cross-attention sobre la información de estilo del intérprete. La configuración concreta de capas, dimensiones y número de parámetros no se detalla en la documentación disponible; el archivo `config.json` del repositorio contiene ese resumen, pero su contenido no forma parte de la información proporcionada.

El entrenamiento se realiza sobre PiJAMA, un corpus de piano jazz con anotaciones MIDI, del que se seleccionaron 12 pianistas "por su separabilidad estilística". No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni el uso de RLHF o DPO (técnicas propias de modelos de lenguaje que no aplican de forma directa a esta tarea). La evaluación se hace en dos niveles: por fragmento individual y por pista completa mediante voto mayoritario. Además, el modelo se emplea en el propio paper como instrumento de medida para puntuar música generada y localizar los momentos más característicos de una interpretación.

## Capacidades

- Clasificación de intérprete: asigna un fragmento de música simbólica a uno de los 12 pianistas de jazz del conjunto PiJAMA.
- Predicción por fragmento y por pista: genera logits por ventana de 1024 tokens y los agrega mediante voto mayoritario, con desempate por logit medio.
- Codificación de estilo interpretativo: el backbone contrastivo captura rasgos de estilo (timing, fraseo, decisiones estructurales) según el contexto del artículo.
- Puntuación de música generada: el paper lo usa como medidor para evaluar la fidelidad estilística de música sintetizada.
- Localización de momentos característicos: permite identificar los pasajes de una interpretación que más contribuyen a la predicción de estilo.
- Extracción de representaciones: al ser un backbone contrastivo, puede emplearse para obtener embeddings de fragmentos musicales.
- Inferencia en CPU: el ejemplo de uso de la model card carga el modelo con `device="cpu"`.
- No soporta: tool calling, function calling, agentes, razonamiento multi-paso, visión, audio directo, generación de texto ni capacidades multilingües.

## Casos de uso

- Investigación en recuperación de información musical: reproducir o extender los experimentos del artículo sobre identificación de intérprete, usando el modelo como punto de partida o como línea base frente a alternativas como ResNet-50.
- Evaluación de sistemas generativos de música: puntuar la salida de modelos generativos simbólicos para medir cuánto se aproximan al estilo de un pianista concreto, tal y como hace el propio paper.
- Análisis musicológico asistido: localizar los pasajes de una grabación transcrita a MIDI que resultan más discriminativos del estilo de un intérprete, para estudiar fraseo, timing y decisiones estructurales.
- Catalogación y organización de archivos musicales: etiquetar colecciones de interpretaciones ya disponibles en MIDI con la identidad del intérprete, siempre que este pertenezca al conjunto de 12 pianistas.
- Curaduría de datasets: filtrar o verificar la coherencia estilística de grabaciones anotadas antes de incorporarlas a un corpus de entrenamiento.
- Docencia e investigación en interpretación jazzística: comparar la huella estilística de estudiantes o intérpretes frente a los 12 perfiles modelados, como herramienta descriptiva y no como juicio de calidad.
- Estudio de atribución y derechos: analizar patrones de autoría interpretativa en grabaciones históricas, teniendo en cuenta las advertencias de privacidad y atribución señaladas por el autor.
- Reproducibilidad de benchmarks de MIR: utilizar el modelo para replicar el benchmark externo Deep Pianist Identification con la receta publicada.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado | Fuente |
|---|---|---|---|
| PiJAMA, split de test retenido | Exactitud por fragmento (chunk) | 95,8 % | Model card |
| PiJAMA, split de test retenido | Exactitud por pista (voto mayoritario) | 98,8 % | Model card |
| Deep Pianist Identification (benchmark externo) | Exactitud por pista | 96,9 % | Model card |
| Deep Pianist Identification | Línea base publicada ResNet-50 | 94,4 % | Model card |

Cobertura de prensa: algunos medios describen el trabajo asociado como una clasificación de 20 pianistas de jazz con una exactitud del 94,4 %. Esa cifra coincide con la línea base de ResNet-50 sobre el benchmark externo y no con el rendimiento del modelo aquí descrito (96,9 % por pista); además, el modelo publicado está entrenado sobre 12 clases, no 20. No se han publicado en la información disponible resultados adicionales de MMLU, HumanEval, GSM8K ni de ningún benchmark de lenguaje, porque no son aplicables a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica requisitos de hardware ni recuento de parámetros.
- GPU recomendadas: no disponible. No se especifica ningún modelo de GPU en la documentación ni en el repositorio.
- Viabilidad en GPU de consumo: no confirmada de forma explícita, aunque el repositorio ocupa 2,5 GB y la inferencia consiste en una única pasada forward sobre ventanas de 1024 tokens, un coste muy inferior al de un modelo generativo de tamaño comparable.
- Ejecución en CPU: soportada según el ejemplo de la model card (`device="cpu"`), lo que permite usar el modelo sin GPU, con mayor latencia.
- Opciones de despliegue: no hay integración con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que no es un modelo de lenguaje. La vía soportada es el paquete `llama_pijama` del repositorio de código del proyecto.
- Latencia y throughput estimados: no disponible.
- Formato del checkpoint: `best.pt` con el state dict completo, más `config.json`; conviene verificar si los 2,5 GB del repositorio corresponden a pesos en fp32, a un checkpoint de entrenamiento con estado del optimizador o a ambos.

## Comparativa con modelos similares

No se identifican en la información disponible modelos abiertos directamente comparables para la tarea de identificación de pianista de jazz sobre música simbólica. La siguiente tabla recoge las referencias mencionadas, indicando los campos sin datos:

| Modelo o referencia | Tarea | Parámetros | Entrada | Rendimiento | Licencia |
|---|---|---|---|---|---|
| jazz-pianist-style-classifier | Identificación de 12 pianistas de jazz | no disponible | MIDI simbólico, ventanas de 1024 tokens | 96,9 % por pista en Deep Pianist Identification | Apache-2.0 |
| ResNet-50 (línea base publicada) | Identificación de pianista | no disponible en la información | no disponible en la información | 94,4 % por pista en Deep Pianist Identification | no disponible |
| Aria (EleutherAI) | Modelo fundacional de música simbólica (base del backbone, no clasificador) | no disponible | MIDI simbólico | no disponible | Apache-2.0 |
| Discogs EffNet | Clasificación de género musical sobre audio | no disponible | Audio | no disponible | no disponible |
| Magenta RealTime 2 | Generación de música en directo | no disponible | Audio/control en tiempo real | no disponible | no disponible |

Nota: Discogs EffNet y Magenta RealTime 2 aparecen en los resultados de búsqueda como sistemas de música con IA, pero resuelven tareas distintas (clasificación de género y generación, respectivamente) y no constituyen alternativas directas para identificación de intérprete.

## Limitaciones y advertencias

- Alcance cerrado a 12 clases: el modelo solo reconoce a los 12 pianistas de PiJAMA seleccionados por su separabilidad estilística. Cualquier predicción con alta confianza sobre un intérprete fuera de ese conjunto carece de significado.
- No es un servicio de atribución: el autor señala explícitamente que la identificación de intérpretes tiene implicaciones evidentes de privacidad y atribución, y que se trata de un artefacto de investigación.
- Sesgo de selección del corpus: los 12 pianistas fueron elegidos por ser estilísticamente separables, lo que introduce un sesgo favorable a la tarea y no representa la diversidad real de la interpretación jazzística.
- Riesgo de confianza mal calibrada: no hay generación de texto y, por tanto, no hay alucinación en sentido clásico, pero sí riesgo de predicciones categóricas fuera de dominio (otros géneros, otros instrumentos, formaciones distintas del piano solo) sin señal fiable de incertidumbre.
- Dependencia del pipeline de conversión a MIDI: la entrada es simbólica, de modo que el uso sobre audio real exige una transcripción previa cuyos errores se propagan a la clasificación.
- Limitación de contexto y agregación: la decisión por pista depende del voto mayoritario sobre fragmentos de 1024 tokens, con desempate por logit medio; fragmentos ambiguos o interpretaciones con cambios de estilo internos pueden degradar el resultado.
- Documentación incompleta: no se publican parámetros, idiomas (no aplica), pipeline, ni requisitos de hardware; el `config.json` del repositorio contiene la información de arquitectura, pero no se detalla en la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validación independiente de la comunidad.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero el modelo se apoya en Aria (Apache-2.0) y en el dataset PiJAMA, cuyas condiciones de uso deben revisarse por separado antes de explotarlo en producción.
- Reproducibilidad: la ejecución depende del paquete `llama_pijama` del repositorio del proyecto, no de una librería estándar ampliamente mantenida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drewbie/jazz-pianist-style-classifier
- Repositorio de código y scripts de evaluación: https://github.com/almostimplemented/jazz-pianist-style
- Aria (EleutherAI), backbone del modelo: https://github.com/EleutherAI/aria
- Dataset PiJAMA: https://github.com/almostimplemented/PiJAMA
- Explorador de estilos de piano jazz (Centre for Music and Science, Universidad de Cambridge): https://cms.mus.cam.ac.uk/explore/jazz-piano-styles/
- Cobertura de prensa: AI Recognizes Musical Stylings of Jazz Pianists: https://theviolinchannel.com/machine-learning-ai-recognizes-musical-stylings-of-jazz-pianists/
- Cobertura de prensa: AI Study Traces the Harmonic Fingerprints of Jazz Pianists: https://rombomagazine.com/ai-study-traces-the-harmonic-fingerprints-of-jazz-pianists/
- Magenta RealTime 2 (modelo de música en directo, contexto no comparable): https://magenta.withgoogle.com/magenta-realtime-2
- Clasificador de género musical Discogs EffNet (referencia adyacente): https://wutools.com/audio/music-genre-classifier
- Referencia bibliográfica del artículo: Edwards, D., Maezawa, A., Dixon, S., "Learning Jazz Pianist Style with Cross-Attention Conditioning", Proc. ISMIR, 2026.
