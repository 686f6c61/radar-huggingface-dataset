# loscrossos/HeartMuLaGen

## Resumen

HeartMuLaGen es un repositorio de HuggingFace publicado por el usuario `loscrossos` que se presenta como parte de HeartMuLa, una familia de modelos fundacionales de música de código abierto desarrollada por el equipo HeartMuLa. La model card lo etiqueta con el pipeline `text-to-audio` y los tags `music` y `art`, por lo que su función declarada es la generación de audio musical a partir de texto. El repositorio no incluye detalles sobre arquitectura, número de parámetros ni proceso de entrenamiento; remite al repositorio de GitHub `heartlib` para el arranque rápido y el despliegue local.

La relevancia del proyecto reside en su propuesta de familia abierta con licencia Apache 2.0, que en la documentación citada se descompone en tres piezas: un modelo generativo (`HeartMuLa-oss-3B`), un codec de audio (`HeartCodec-oss`) y un transcriptor (`HeartTranscriptor-oss`). Esa separación en componentes es habitual en los sistemas modernos de generación musical (tokenizador/codec más modelo autorregresivo o de difusión), aunque la información disponible no confirma cuál es el esquema exacto empleado.

Hay que señalar que este repositorio concreto acumula 0 descargas y 0 likes, fue creado el 20 de octubre de 2026 y su autor (`loscrossos`) no coincide con la organización `HeartMuLa` que aloja los modelos hermanos. Todo apunta a una re-subida o espejo no oficial de un modelo de la familia, por lo que conviene verificar la procedencia antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura; la familia se define genéricamente como "music foundation models" |
| Parametros totales | No disponible para este repositorio. La familia incluye una variante denominada `HeartMuLa-oss-3B`, cuyo nombre sugiere 3.000 millones de parámetros, pero no se confirma que este repositorio corresponda a ella |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh), inglés (en), japonés (ja), coreano (ko), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |
| Pipeline declarado | `text-to-audio` |
| Modalidad de entrada / salida | Entrada de texto, salida de audio musical (según el pipeline declarado) |
| Repositorios relacionados | `HeartMuLa/HeartMuLa-oss-3B`, `HeartMuLa/HeartCodec-oss`, `HeartMuLa/HeartTranscriptor-oss` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 20 de octubre de 2026 |

## Arquitectura y entrenamiento

La información proporcionada no incluye ningún detalle sobre la arquitectura interna del modelo: no se especifica si se trata de un transformer autorregresivo sobre tokens de audio, de un modelo de difusión, de un esquema híbrido o de una combinación de codec neuronal más modelo generativo. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste fino con preferencias humanas (RLHF/DPO). La referencia técnica disponible es el artículo `arXiv:2601.10547`, titulado "HeartMuLa: A Family of Open Sourced Music Foundation Models", que no se ha podido consultar en esta búsqueda y cuyos contenidos no se recogen en la model card.

El único indicio estructural es la propia composición de la familia: la existencia de `HeartCodec-oss` (un codec de audio) junto a un modelo generativo y a `HeartTranscriptor-oss` (transcripción) sugiere una cadena típica de generación musical en la que el codec convierte audio en una representación discreta o latente manejable por el modelo generativo. Se trata, no obstante, de una inferencia a partir de los nombres de los repositorios y no de un dato confirmado. Cualquier afirmación sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, ventana deslizante) sería especulativa y no se incluye.

## Capacidades

- Generación de audio musical a partir de prompts de texto, según el pipeline `text-to-audio` declarado en el repositorio.
- Cobertura multilingüe de prompts en cinco idiomas: chino, inglés, japonés, coreano y español.
- Integración en una cadena de herramientas más amplia de la familia HeartMuLa, que incluye un codec de audio (`HeartCodec-oss`) y un transcriptor (`HeartTranscriptor-oss`).
- Despliegue local mediante la librería `heartlib`, publicada en el repositorio de GitHub del proyecto.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información; el modelo es de dominio audio, no de texto general.
- Capacidades especiales (modo "thinking", visión, audio de entrada): no disponible en la información.

## Casos de uso

- **Música de fondo para producción audiovisual**: generación de piezas instrumentales a partir de descripciones textuales para vídeos de YouTube, pódcast o contenido corporativo, evitando las restricciones de las bibliotecas de stock. La licencia Apache 2.0 facilita su uso comercial, siempre que se verifique la procedencia del repositorio.
- **Prototipado rápido de jingles y sintonías**: agencias y estudios pueden iterar sobre varias propuestas musicales en minutos a partir de un prompt, antes de encargar la producción final a un músico o a un estudio de grabación.
- **Bandas sonoras para videojuegos independientes**: generación de bucles y variaciones temáticas para estudios con presupuesto limitado, con la posibilidad de ajustar el estilo mediante texto en cada iteración.
- **Aplicaciones de bienestar y meditación**: creación de paisajes sonoros y música ambiental relajante parametrizable por duración, instrumentación y tempo descritos en el prompt.
- **Contenido musical multilingüe**: al aceptar prompts en chino, inglés, japonés, coreano y español, el modelo permite a equipos internacionales describir el mismo estilo en su idioma nativo sin depender de traducciones intermedias.
- **Investigación en generación musical**: uso como línea base reproducible (licencia Apache 2.0 y artículo asociado) para experimentos de evaluación de modelos generativos de audio, comparación de codecs o estudios de sesgo cultural en datasets musicales.
- **Pipelines de transcripción y análisis**: combinado con `HeartTranscriptor-oss`, puede formar parte de flujos que analizan material musical existente y generan variaciones o acompañamientos a partir del resultado del análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de evaluación (FAD, CLAP score, MOS subjetivo, KLD perceptual ni ninguna otra métrica habitual en generación musical), y la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo: los enlaces recuperados corresponden a hilos de Reddit sobre el cuestionario de la página de inicio de Bing y no guardan relación con HeartMuLa. Cualquier cifra de rendimiento debería consultarse directamente en el artículo `arXiv:2601.10547`.

## Requisitos de hardware

- **VRAM estimada**: no hay requisitos publicados para este repositorio. A modo de referencia aritmética, un modelo de 3.000 millones de parámetros (tamaño de la variante `oss-3B` de la familia, no necesariamente este repositorio) ocuparía aproximadamente 6 GB de pesos en FP16, unos 3-3,5 GB en INT8 y unos 2 GB en INT4, a los que habría que sumar el consumo del codec de audio y del decodificador vocacional durante la inferencia. Son estimaciones por cálculo, no datos del autor.
- **GPU recomendadas**: no disponible. Para un modelo de ese orden de magnitud, una GPU de 8-12 GB sería suficiente en cuantización de 8 bits, mientras que un despliegue en FP16 con lotes grandes requeriría 16-24 GB (RTX 4090, L40S, A100). Para servir en producción con concurrencia se recomendaría A100 40/80 GB o H100.
- **Compatibilidad con GPU de consumo**: probable en el rango de 3B de parámetros si el modelo se distribuye en cuantizaciones de 4 u 8 bits, pero no confirmado para este repositorio, que no publica formatos de pesos ni instrucciones de cuantización.
- **Opciones de despliegue**: la model card remite exclusivamente a la librería `heartlib` (repositorio de GitHub del proyecto) para el arranque rápido y el despliegue local. No se confirma soporte de vLLM, llama.cpp, Ollama ni Text Generation Inference; teniendo en cuenta que la salida es audio, es previsible que el servicio requiera un pipeline específico con el codec asociado.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| HeartMuLaGen (este repositorio) | No disponible | text-to-audio musical | Apache 2.0 | HuggingFace; 0 descargas, 0 likes; autor no oficial |
| HeartMuLa-oss-3B | 3B (según denominación; verificar) | Generación musical | No disponible en la información | HuggingFace, organización `HeartMuLa` |
| HeartCodec-oss | No disponible | Codec de audio neuronal | No disponible en la información | HuggingFace, organización `HeartMuLa` |
| HeartTranscriptor-oss | No disponible | Transcripción de audio | No disponible en la información | HuggingFace, organización `HeartMuLa` |
| MusicGen (Meta) | 300M / 1.5B / 3.3B | text-to-music | Pesos CC-BY-NC 4.0, código MIT (verificar en la ficha oficial) | HuggingFace / repositorio audiocraft |
| Stable Audio Open (Stability AI) | ~1.2B (DiT + T5) | text-to-audio, efectos y samples | Stability AI Community License (verificar en la ficha oficial) | HuggingFace |

La ventaja diferencial de HeartMuLa frente a MusicGen es la licencia Apache 2.0, que permite uso comercial sin las restricciones no comerciales de los pesos de MusicGen. Frente a Stable Audio Open, su licencia comunitaria también es más permisiva, aunque la falta de benchmarks publicados impide comparar calidad de audio de forma objetiva. La cobertura declarada de cinco idiomas de prompt es otro punto a favor, si bien no se especifica si afecta también al contenido vocal generado.

## Limitaciones y advertencias

- **Procedencia dudosa del repositorio**: el autor es `loscrossos`, no la organización `HeartMuLa` que aloja los modelos hermanos, y el repositorio tiene 0 descargas y 0 likes. Podría tratarse de un espejo o re-subida no oficial; verificar los pesos contra el repositorio original antes de cualquier uso en producción.
- **Ausencia total de documentación técnica**: no se publican arquitectura, tamaño, contexto, formato de pesos ni instrucciones de cuantización, lo que impide estimar con rigor los requisitos de despliegue.
- **Sin benchmarks**: no hay métricas objetivas publicadas en la información disponible, por lo que no es posible evaluar la calidad del audio generado ni compararla con alternativas.
- **Riesgo de alucinación**: en modelos de generación musical, el equivalente es la producción de audio incoherente, con estructura o instrumentación que no se corresponde con el prompt, o con voces ininteligibles si el modelo genera partes cantadas.
- **Sesgos culturales**: los datasets musicales suelen estar desequilibrados hacia determinadas tradiciones (pop occidental, música china en este caso por el origen del equipo); los estilos menos representados pueden generar resultados de menor calidad. La composición del dataset no es pública en la información disponible.
- **Derechos de autor del material de entrenamiento**: no se especifica la procedencia de los datos de entrenamiento ni si se han aplicado filtros de material protegido. La licencia Apache 2.0 cubre los pesos, no necesariamente las obras generadas ni posibles reclamaciones de terceros sobre el audio de salida.
- **Idioma y contexto**: aunque se declaran cinco idiomas de prompt, no se especifica el rendimiento por idioma; el español figura en la lista pero sin métricas que confirmen paridad con el inglés o el chino.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones con atribución, pero la responsabilidad sobre el contenido generado y su explotación recae en el usuario.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/loscrossos/HeartMuLaGen
- Repositorio de código y despliegue (heartlib): https://github.com/HeartMuLa/heartlib
- Artículo: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Modelo generativo de la familia: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Codec de audio de la familia: https://huggingface.co/HeartMuLa/HeartCodec-oss
- Transcriptor de la familia: https://huggingface.co/HeartMuLa/HeartTranscriptor-oss
- Contacto indicado por los autores: heartmula.ai@gmail.com
- Búsqueda web: sin resultados relevantes sobre el modelo (los enlaces recuperados corresponden a hilos de Reddit sobre el cuestionario de Bing y se han descartado)
