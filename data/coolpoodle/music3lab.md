# coolpoodle/music3lab

## Resumen

Music3Lab es un kit de herramientas de investigación de código abierto desarrollado por el usuario coolpoodle que extiende el modelo MiniMax-Music3 de MiniMaxAI. No es un modelo de generación musical en sí, sino un conjunto de utilidades, scripts y configuraciones que añaden capacidades de codificación de audio arbitrario, continuación, inpainting, generación sin prompt y evaluación objetiva automática sobre los pesos liberados de MiniMax-Music3. El proyecto se presenta como un enfoque "basado en evidencia" y reproducible: cada capacidad está condicionada a métricas objetivas preregistradas, y los fallos se publican junto con los éxitos.

La relevancia de Music3Lab radica en que aborda un vacío en el ecosistema de MiniMax-Music3: la ausencia de un tokenizador de audio nativo (RVQ) en los pesos públicos y la falta de herramientas estándar para evaluar y manipular el modelo. El toolkit documenta explícitamente qué se puede y qué no se puede hacer con la versión liberada, ofreciendo a investigadores y desarrolladores un punto de partida riguroso para experimentar con generación musical. No se especifican parámetros propios, ya que no es un modelo independiente; depende del modelo base MiniMax-Music3.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (toolkit de investigación sobre MiniMax-Music3, basado en Flow matching) |
| Parametros totales | No disponible (depende del modelo base MiniMax-Music3) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesa audio, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el toolkit está documentado en inglés, pero no hay especificación oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (no distribuye pesos; solo código, configuraciones y metadatos) |

## Arquitectura y entrenamiento

Music3Lab no define una arquitectura propia; se construye alrededor de los pesos liberados de MiniMax-Music3, un modelo de generación musical basado en Flow matching. El toolkit incorpora varios componentes desarrollados específicamente para este proyecto:

- Un **encoder continuo WAV → Flow-latent** que convierte audio en representaciones latentes en una sola pasada (aproximadamente 1,34 ms en un piloto base). Se realizó un fine-tune externo con música real que mejoró las métricas de reconstrucción (SI-SDR de 2,03 a 8,24 dB), pero el resultado fue rechazado como especialista porque degradó el latente del teacher protegido en un 13,2%.
- Un **método de inversión latente** iterativo que alcanza 22,2 dB SI-SDR y 0,997 de correlación en clips de 1 segundo, aunque es muy lento (unos 208 segundos por segundo de audio).
- Técnicas de **inpainting con condiciones capturadas** y **continuación de estilo** que operan sobre estados internos del modelo.
- Un sistema de **reanudación de estado completo** que serializa la caché KV y el estado RNG de CUDA para reproducir exactamente los frames y chunks de Flow entre procesos.

El entrenamiento de estos componentes se documenta en 34 configuraciones congeladas y 38 scripts ejecutables. No se proporcionan datos sobre el número de tokens de entrenamiento ni la composición del dataset, más allá de la mención a un fine-tune externo con música real y al uso de metadatos de LAION (sin redistribuir audio).

## Capacidades

- **Auditoría de checkpoints**: clasifica cada tensor de los pesos liberados y demuestra que no existe un tokenizador RVQ nativo en `dav.pth`.
- **Codificación continua WAV → Flow-latent**: convierte audio en latentes en una sola pasada, con métricas de reconstrucción mejorables mediante fine-tune externo.
- **Inversión latente (modo investigación)**: reconstruye audio desde latentes de forma iterativa, útil como oráculo o teacher, no para tiempo real.
- **Inpainting con condiciones capturadas**: rellena huecos en audio usando condiciones internas del modelo, con mejoras medibles frente a un adaptador cero.
- **Continuación de estilo con estado capturado**: extiende una pista de 12 a 16 segundos generando cuatro candidatos y clasificándolos por similitud de estilo y costura.
- **Reanudación de estado completo**: serializa caché KV y RNG de CUDA para reproducir exactamente la generación entre procesos (backend determinista).
- **Append guiado por referencia (CPU)**: añade un candidato con estilo de referencia preservando bit-exacto la fuente original fuera del crossfade.
- **Generación sin prompt**: genera música sin texto de usuario, usando un puente interno de MIR/planificación a texto, con best-of-N de hasta 90 segundos.
- **Generación con estilo de referencia (parcial)**: genera 8 segundos clasificados por similitud de latente continuo y MIR, pero no es un condicionamiento directo del modelo.
- **Suite de evaluación objetiva**: mide integridad, reconstrucción, SI-SDR/SNR, correlación, loudness/estéreo y anti-copia. No incluye jueces de musicalidad o estética aprendidos.

## Casos de uso

- **Auditoría de modelos de generación musical**: investigadores pueden usar `inspect_dav.py` para verificar qué componentes contiene un checkpoint liberado, sin necesidad de GPU, y confirmar si existe un tokenizador de audio nativo.
- **Investigación en codificación de audio continua**: el encoder WAV → Flow-latent permite experimentar con representaciones latentes de audio de una sola pasada, útil para estudiar compresión y reconstrucción.
- **Inpainting de audio en producción creativa**: con condiciones capturadas, se pueden rellenar secciones de una pista (por ejemplo, eliminar un instrumento no deseado) manteniendo la coherencia estilística, aunque limitado a estados internos del modelo.
- **Continuación de composiciones**: la continuación de estilo con estado capturado permite extender una pieza musical de forma determinista, generando múltiples candidatos y seleccionando el mejor según métricas objetivas.
- **Reproducibilidad en experimentos**: la reanudación de estado completo garantiza que una generación pueda replicarse exactamente en otro proceso, esencial para validar resultados en entornos de investigación.
- **Evaluación objetiva de modelos de música**: la suite de evaluación integrada (SI-SDR, correlación, loudness, anti-copia) sirve para comparar diferentes configuraciones o fine-tunes sin depender de juicios subjetivos.
- **Generación exploratoria sin prompt**: artistas y desarrolladores pueden generar música aleatoria de hasta 90 segundos sin necesidad de describirla, útil para lluvia de ideas o fondos sonoros automáticos.
- **Estudio de limitaciones y resultados negativos**: el toolkit documenta explícitamente qué capacidades fallaron (continuación arbitraria, FIM de dos lados, prepend, etc.), lo que lo convierte en una referencia para entender los límites actuales de MiniMax-Music3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU o HumanEval) porque no es un modelo de lenguaje. Sin embargo, la model card incluye métricas objetivas medidas para cada capacidad. Se presentan a continuación los datos disponibles:

| Capacidad | Resultado medido |
|---|---|
| Encoder continuo WAV → Flow-latent (piloto base) | ~1,34 ms por pasada |
| Encoder continuo con fine-tune externo | SI-SDR 2,03 → 8,24 dB, pero rechazado (regresión del teacher +13,2%) |
| Inversión latente (1 s de clip) | 22,2 dB SI-SDR, 0,997 correlación, ~208 s por 1 s |
| Inpainting con condiciones capturadas | +30,8% NMSE latente, +20,1% hole audio-ruler vs. adaptador cero |
| Continuación de estilo (12 s → 16 s) | Cuatro candidatos, ranking objetivo de estilo/costura |
| Reanudación de estado completo | Reproducción exacta de frames y chunks Flow entre procesos |
| Append guiado por referencia | Preservación bit-exacta de la fuente fuera del crossfade |
| Generación sin prompt | Best-of-N hasta 90 s (máx. política: 3/8 elegibles de longitud completa) |
| Generación con estilo de referencia | 8 s, ranking por similitud de latente continuo + MIR |
| Predicción de residuales Stage-1 | Media CE 6,834, filas de tokens exactas: 0 (fallido) |
| FIM acústico de dos lados (WAV arbitrario) | +5,9% ruler vs. +10% requerido (fallido) |

## Requisitos de hardware

- **Inspección de checkpoints**: funciona en CPU, sin GPU, mediante `inspect_dav.py` (no se modifican pesos).
- **Generación y captura de estados**: requiere GPU, ya que se usan `diffusers` y `transformers` (instalación con `.[capture]`).
- **VRAM estimada**: no disponible en la documentación proporcionada. Depende del modelo base MiniMax-Music3 y de la longitud de audio generado.
- **GPU recomendadas**: no especificadas. Se asume que cualquier GPU compatible con PyTorch y con suficiente memoria para MiniMax-Music3 funcionará.
- **Opciones de despliegue**: no se mencionan vLLM, llama.cpp, Ollama ni TGI. El toolkit se ejecuta como scripts de Python con entorno virtual.
- **Latencia y throughput**: solo se indica el tiempo del encoder (1,34 ms) y la inversión latente (208 s por 1 s de audio). No hay datos de throughput para generación completa.

## Comparativa con modelos similares

No se dispone de información sobre toolkits comparables en la documentación proporcionada. Music3Lab es un proyecto específico para MiniMax-Music3, y no se mencionan alternativas equivalentes en el ecosistema de generación musical. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No incluye los pesos de MiniMax-Music3**: el usuario debe descargarlos por separado desde HuggingFace.
- **No redistribuye audio**: solo se incluyen metadatos (IDs, hashes, splits) de datasets como LAION, no los archivos de audio.
- **No es un tokenizador de audio nativo**: el checkpoint liberado `dav.pth` no contiene cuantizador ni codebooks RVQ; la carpeta `62000_generator` es un nombre de archivo ZIP, no un componente real.
- **Varias capacidades fallaron en las pruebas**: continuación con WAV arbitrario, FIM de dos lados, prepend, predicción de residuales Stage-1 y condicionamiento directo de referencia larga no superaron los umbrales preregistrados.
- **Los resultados negativos se publican a propósito**: el autor enfatiza que los fallos son la parte más útil de la investigación, pero esto implica que el toolkit no ofrece una solución completa para todas las tareas de edición de audio.
- **No es un producto final**: se describe como un kit de investigación, no listo para producción. La generación con estilo de referencia es parcial y no constituye un transfer de estilo completo.
- **Licencia**: Apache-2.0 permite uso comercial del toolkit, pero el modelo base MiniMax-Music3 puede tener su propia licencia que debe verificarse por separado.
- **Idiomas**: no se especifican idiomas soportados; el toolkit está documentado en inglés y no hay indicios de soporte multilingüe.

## Enlaces

- [HuggingFace - coolpoodle/music3lab](https://huggingface.co/coolpoodle/music3lab)
- [HuggingFace - MiniMaxAI/MiniMax-Music3 (modelo base)](https://huggingface.co/MiniMaxAI/MiniMax-Music3)

No se proporcionan otros enlaces externos en la información disponible. Los archivos mencionados en la model card (FINDINGS.md, REPRODUCING.md, reports/) son rutas relativas dentro del repositorio y no se han incluido URLs directas.
