# sayzly/parakeet-primeline-gguf

## Resumen

Parakeet Primeline (GGUF) es una conversión al formato GGUF del modelo primeline/parakeet-primeline, un sistema de reconocimiento automático del habla (ASR) publicado por el autor "sayzly" para su uso en la aplicación Sayzly. El modelo original pertenece a la familia Parakeet, una línea de modelos de speech-to-text basados en la arquitectura FastConformer de NVIDIA, aunque la model card disponible no confirma explícitamente esta arquitectura ni los detalles de entrenamiento. Con 627.052.166 parámetros (aproximadamente 627 millones), se sitúa en la gama media de modelos ASR, un tamaño habitual para sistemas de transcripción que buscan un equilibrio entre precisión y coste computacional.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de distribución (una cuantización Q8_0 en GGUF) más que de un modelo nuevo, y su interés radica en la posibilidad de ejecutar un modelo ASR en entornos con llama.cpp u otros runtimes compatibles con GGUF, sin depender del stack original de PyTorch. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 19 de noviembre de 2026, lo que indica que es un artefacto reciente y de nicho.

La información pública es muy escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento, resultados de benchmarks ni innovaciones técnicas. Esta ficha refleja esa limitación de forma explícita y evita inferir datos no confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de la familia Parakeet; arquitectura no confirmada en la información proporcionada) |
| Parametros totales | 627.052.166 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (único archivo GGUF referenciado: `parakeet-primeline-Q8_0.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (conversión desde el modelo base; pesos no modificados salvo la conversión) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre "Parakeet" remite a la familia de modelos ASR de NVIDIA, habitualmente construidos sobre FastConformer (un transformer convolucional con atención lineal), pero la model card de esta conversión no lo confirma ni aporta detalles sobre capas, atención o mecanismo de decodificación. Tampoco se indica si el modelo usa CTC, atención encoder-decoder o un esquema híbrido.

Respecto al entrenamiento, no hay datos sobre número de tokens de audio, composición del dataset, idiomas de entrenamiento ni si se aplicaron técnicas de ajuste fino supervisado o preferencias. La única información técnica verificable es que el repositorio contiene una conversión a GGUF con cuantización Q8_0 y que los pesos no se han alterado más allá de la conversión de formato, según declara el autor.

## Capacidades

- Reconocimiento automático del habla (speech-to-text): tarea principal declarada en el pipeline del repositorio.
- Transcripción de audio a texto: uso previsto como componente de la aplicación Sayzly, según la model card.
- Ejecución en runtimes compatibles con GGUF: al estar en formato GGUF, puede cargarse en herramientas que soporten este formato, aunque la compatibilidad concreta con llama.cpp para modelos ASR no está confirmada en la información disponible.
- Capacidades multilingües: no disponible.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión o audio generativo: no disponibles; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede convertir audio grabado en texto para integrarse en aplicaciones de productividad, aprovechando su tamaño moderado (627 M de parámetros) para ejecución local.
- Subtitulado automático de vídeo: uso en pipelines de postproducción para generar subtítulos a partir de pistas de audio, con la ventaja de poder desplegarse en entornos sin GPU de gama alta gracias a la cuantización Q8_0.
- Dictado por voz en aplicaciones de escritorio: integración en herramientas de escritura que necesiten transcripción en tiempo real o por lotes, siempre que el runtime GGUF elegido soporte modelos ASR.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos donde se prefiera un despliegue local por privacidad.
- Procesamiento por lotes de archivos de audio: transcripción masiva de grabaciones (por ejemplo, archivos de call center) usando un runtime GGUF con paralelización, aunque el throughput real no está documentado.
- Prototipado e investigación en ASR: uso como modelo base ligero para experimentos de reconocimiento de voz en entornos con recursos limitados, al ser un artefacto de 0,7 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 627 M de parámetros en Q8_0 (aproximadamente 8 bits por peso), el archivo ocupa alrededor de 0,7 GB; la VRAM necesaria sería del orden de 1-2 GB incluyendo buffers de activaciones y audio, aunque no hay mediciones oficiales.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer como RTX 3060, RTX 4060 o superiores, así como en Apple Silicon con Metal.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM; también podría ejecutarse en CPU.
- Opciones de despliegue: llama.cpp y otros runtimes compatibles con GGUF; la compatibilidad con vLLM, TGI u Ollama no está confirmada para modelos ASR en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta idiomas, dataset, arquitectura ni evaluación, lo que impide validar su calidad para producción.
- Riesgo de alucinación en la transcripción: como todo modelo ASR, puede generar texto incorrecto en audio ruidoso o con acentos no representados en el entrenamiento; sin datos de evaluación no puede cuantificarse.
- Idiomas no especificados: no se puede asumir soporte multilingüe ni un idioma concreto.
- Licencia CC BY 4.0: permite uso comercial y modificaciones siempre que se atribuya a los autores originales (primeline/parakeet-primeline) y se indique si se han hecho cambios; la conversión a GGUF debe atribuirse adecuadamente.
- Artefacto de terceros: la conversión la realiza un autor distinto al original (sayzly), por lo que la integridad y fidelidad de los pesos depende de esa conversión, aunque el autor declara no haberlos modificado.
- Compatibilidad de runtime no garantizada: no todos los motores GGUF soportan modelos ASR; conviene verificar antes de desplegar.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sayzly/parakeet-primeline-gguf
- Modelo base: https://huggingface.co/primeline/parakeet-primeline
