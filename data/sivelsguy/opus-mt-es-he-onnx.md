# sivelsguy/opus-mt-es-he-onnx

## Resumen

`sivelsguy/opus-mt-es-he-onnx` es una exportación a ONNX con cuantización dinámica de 8 bits del modelo de traducción automática `Helsinki-NLP/opus-mt-es-he`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce texto de español a hebreo y está empaquetado específicamente para ejecutarse en el navegador mediante transformers.js, incluyendo un `tokenizer.json` que permite su uso sin infraestructura de servidor.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: el autor (sivelsguy) se limita a convertir los pesos originales a formato ONNX int8 para reducir el tamaño y permitir inferencia local en cliente. El repositorio ocupa aproximadamente 0,1 GB, lo que lo hace viable para aplicaciones web que necesiten traducción es-he sin depender de una API externa.

El modelo subyacente es un transformer encoder-decoder de tipo Marian, la arquitectura estándar de la familia OPUS-MT, entrenado sobre corpus paralelos del proyecto OPUS. El contexto declarado por el autor es su uso en la aplicación de aprendizaje de hebreo *Parle*, de código abierto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian) |
| Parámetros totales | no disponible (el modelo base OPUS-MT es-he no declara el recuento en la información proporcionada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 dinámica (ONNX); el pipeline de transformers.js acepta `dtype: "q8"` |
| Idiomas soportados | español (es) y hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (exportación cuantizada int8) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-es-he` pertenece a la familia OPUS-MT, basada en la arquitectura Marian NMT: un transformer encoder-decoder con atención multi-cabeza estándar, diseñado específicamente para traducción automática neuronal. Los modelos OPUS-MT se entrenan sobre corpus paralelos recopilados en el proyecto OPUS, que agrega memorias de traducción de múltiples fuentes públicas.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura Marian. La aportación de esta exportación concreta es la conversión a ONNX con cuantización dinámica int8, que reduce el peso del modelo y permite su ejecución en entornos JavaScript (navegador o Node.js) a través de transformers.js.

## Capacidades

- Traducción de texto de español a hebreo, una frase por llamada.
- Ejecución en navegador mediante transformers.js con el pipeline `translation` y `dtype: "q8"`.
- Tokenización incluida (`tokenizer.json`), lo que evita dependencias externas de tokenizador.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par es-he.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Traducción integrada en aplicaciones web de aprendizaje de idiomas: el modelo se carga en el cliente con transformers.js y traduce frases del español al hebreo sin enviar texto a un servidor, como hace la app *Parle*.
- Traducción de interfaces de usuario en tiempo real: al ejecutarse en el navegador, permite traducir etiquetas, mensajes y contenido dinámico de una web de español a hebreo sin latencia de red hacia una API externa.
- Procesamiento de formularios y correos en aplicaciones de gestión: traducción puntual de campos de texto libre de usuarios hispanohablantes a hebreo para su revisión por equipos locales.
- Prototipado rápido de pipelines de traducción: al ser un artefacto ONNX ligero (0,1 GB), sirve para validar flujos de traducción en entornos de desarrollo sin GPU ni servidores dedicados.
- Traducción offline en aplicaciones de escritorio o extensiones: el formato ONNX permite empaquetar el modelo en aplicaciones Electron o extensiones de navegador que operen sin conexión.
- Generación de subtítulos o notas bilingües: traducción frase a frase de contenido educativo o documental del español al hebreo, aprovechando que el modelo está optimizado para una frase por llamada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con un repositorio de 0,1 GB en int8, la huella de memoria es del orden de cientos de MB, apta para ejecución en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para inferencia en navegador y CPU, por lo que no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, con margen amplio, aunque su destino principal es la ejecución en CPU/navegador.
- Opciones de despliegue: transformers.js (navegador y Node.js) con `dtype: "q8"`; al ser ONNX, también puede ejecutarse con ONNX Runtime en otros entornos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| sivelsguy/opus-mt-es-he-onnx | no disponible | no disponible | es, he | Apache-2.0 | ONNX int8 | HuggingFace, transformers.js |
| Helsinki-NLP/opus-mt-es-he | no disponible | no disponible | es, he | Apache-2.0 | safetensors/PyTorch | HuggingFace, transformers |
| Otros modelos OPUS-MT es-* | no disponible | no disponible | es y lengua destino | Apache-2.0 | safetensors/PyTorch | HuggingFace |

La comparación se limita a la familia OPUS-MT porque la información proporcionada no incluye datos de rendimiento ni especificaciones de alternativas como NLLB o M2M-100 que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El autor advierte que se debe traducir una frase por llamada: las entradas por lotes de longitudes distintas pueden terminar con puntuación repetida.
- El modelo cubre únicamente el par español-hebreo; no es un modelo multilingüe general.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre corpus OPUS, puede heredar sesgos de las memorias de traducción de origen.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, legal, médico) no representados en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los corpus OPUS subyacentes.
- La cuantización int8 puede introducir una pérdida de calidad respecto al modelo original en PyTorch; no se han publicado métricas que cuantifiquen esa degradación.
- No se documenta la longitud máxima de secuencia soportada, lo que supone un riesgo para textos largos en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/sivelsguy/opus-mt-es-he-onnx)
- [Modelo base Helsinki-NLP/opus-mt-es-he](https://huggingface.co/Helsinki-NLP/opus-mt-es-he)
- [Proyecto OPUS-MT (Helsinki-NLP)](https://github.com/Helsinki-NLP/Opus-MT)
- [transformers.js](https://github.com/huggingface/transformers.js)
