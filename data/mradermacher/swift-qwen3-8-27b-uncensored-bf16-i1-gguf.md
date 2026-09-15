# mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-i1-GGUF

## Resumen

`mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-i1-GGUF` es una cuantizacion en formato GGUF del modelo `d0xin/Swift-Qwen3.8-27B-Uncensored-BF16`, publicada por el usuario mradermacher. Se trata de un derivado "uncensored" (abliterated) de la familia Qwen, con 27.320.697.856 parametros totales (unos 27,3 mil millones) y soporte declarado de razonamiento, modo de pensamiento eficiente, tool calling y multimodalidad (vision). El repositorio pesa 39,5 GB y esta pensado para ejecucion local mediante llama.cpp y sus derivados.

La relevancia de esta ficha esta en su naturaleza de cuantizacion imatrix (prefijo `i1`): mradermacher publica aqui pesos GGUF generados con matriz de importancia, lo que en teoria reduce la perdida de calidad respecto a cuantizaciones estaticas del mismo tamano, especialmente en los niveles mas agresivos. El repositorio contiene unicamente dos cuantizaciones (`i1-Q2_K` de 11,0 GB e `i1-IQ3_M` de 12,9 GB) mas el fichero imatrix de 0,1 GB; el resto de niveles anunciados en los tags corresponden al repositorio estatico paralelo.

El modelo es relevante para quienes necesitan un LLM de ~27B ejecutable en una unica GPU de consumo con 12-16 GB de VRAM, sin filtros de rechazo, y para investigacion sobre alineacion y seguridad (el caracter abliterated permite estudiar comportamiento sin capas de rechazo). Como contrapartida, es un modelo con 0 descargas y 0 likes en el momento de la consulta, solo declara ingles, no publica benchmarks y su licencia (`swift-open-license-1.0`, marcada como `other`) no aclara condiciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (los tags del autor indican la familia `qwen3_8`; no se detalla en la informacion disponible) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Repositorio actual: `i1-Q2_K`, `i1-IQ3_M` (imatrix) y fichero imatrix. Niveles anunciados en los tags: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `swift-open-license-1.0` (etiquetada como `license: other`) |
| Formato de pesos | GGUF (modelo base en BF16, presumiblemente safetensors) |
| Modelo base | `d0xin/Swift-Qwen3.8-27B-Uncensored-BF16` |
| Cuantizado por | mradermacher |
| Modalidad | Texto y vision (los ficheros `mmproj` se alojan en el repositorio estatico, no en este) |
| Tamano del repositorio | 39,5 GB |
| Fecha de publicacion indicada | 2026-09-15 (creacion) / 2026-09-15 (actualizacion) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en los datos proporcionados. Los tags del repositorio apuntan a la familia `qwen3_8` y a un modelo base de tipo transformer decoder con capacidades multimodales (vision), razonamiento explicito ("efficient-thinking") y soporte de llamadas a herramientas. El termino "abliterated" en los tags indica que el modelo base ha pasado por un proceso de eliminacion de direcciones de rechazo, y "BF16" que el modelo original se distribuye en precision bfloat16. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra optimizacion por preferencias.

La innovacion tecnica de este repositorio concreto no esta en el modelo, sino en la cuantizacion: se trata de cuantizaciones ponderadas por matriz de importancia (imatrix, prefijo `i1`), que estiman la sensibilidad de cada tensor a partir de activaciones de calibracion y reparten el error de cuantizacion de forma no uniforme. El autor incluye enlaces a la comparativa de perplejidad de ikawrakow y a las notas de Artefact2 sobre tipos de cuantizacion, pero no aporta mediciones propias de perplejidad o calidad para este modelo.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag `conversational` y el pipeline declarado.
- Razonamiento explicito y modo de pensamiento eficiente (tags `reasoning` y `efficient-thinking`).
- Soporte de tool calling / function calling (tag `tool-calling`).
- Capacidades multimodales: el tag `multimodal` y la nota del autor ("This is a vision model") indican soporte de entrada de imagenes, condicionado a disponer del fichero `mmproj` alojado en el repositorio estatico.
- Comportamiento sin filtros de rechazo (`uncensored`, `abliterated`): el modelo no aplica negativas sistematicas ante peticiones que otros modelos alineados rechazarian.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers/GGUF.
- Capacidad multilingue: no disponible; la model card solo declara ingles.
- Capacidades de audio: no disponibles.
- No se documentan capacidades especificas de generacion de codigo o matematicas mas alla de lo implicito en el tag `reasoning`.

## Casos de uso

- Inferencia local en estacion de trabajo individual: con `i1-Q2_K` (11,0 GB) o `i1-IQ3_M` (12,9 GB) el modelo cabe en una GPU de consumo de gama alta y permite un asistente conversacional privado sin envio de datos a terceros.
- Investigacion sobre alineacion y seguridad: al ser un modelo abliterated, permite estudiar que comportamientos reaparecen al eliminar las capas de rechazo y comparar respuestas frente al modelo alineado original.
- Integracion en agentes con herramientas: el tag `tool-calling` habilita construir bucles de agente que invoquen APIs externas, ejecuten busquedas o manipulen ficheros desde un runtime local tipo llama.cpp.
- Analisis de imagenes y documentos escaneados: cargando el fichero `mmproj` del repositorio estatico, el modelo puede describir o extraer informacion de capturas e imagenes, util en pipelines de digitalizacion internos.
- Redaccion tecnica y creativa sin restricciones tematicas: util para generar borradores sobre temas sensibles (ficcion con violencia, contenidos para investigacion) donde los modelos alineados suelen negarse.
- Evaluacion comparativa de cuantizaciones: el fichero imatrix incluido permite generar cuantizaciones propias y medir el impacto de distintos niveles en tareas concretas, como parte de un pipeline de validacion de modelos.
- Prototipado de razonamiento multi-paso en local: el modo de pensamiento declarado permite cadenas de razonamiento largas sin coste de API, adecuado para experimentos de prompting y evaluacion de estrategias de decodificacion.
- Despliegue en entornos air-gapped: al ser pesos GGUF autocontenidos y ejecutables con llama.cpp, el modelo puede operar en redes aisladas sin dependencias de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones. Tampoco se aportan datos de perplejidad propios.

## Requisitos de hardware

- VRAM estimada para las cuantizaciones incluidas en este repositorio: aproximadamente 12-13 GB para `i1-Q2_K` (fichero de 11,0 GB) y 14-15 GB para `i1-IQ3_M` (fichero de 12,9 GB), sumando la sobrecarga de contexto y del runtime.
- GPU recomendadas: para `i1-Q2_K`, tarjetas con 16 GB o mas (RTX 4080, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090, A4000). Para `i1-IQ3_M`, se recomienda 16 GB como minimo y 24 GB para contextos largos y KV cache amplia (RTX 3090, RTX 4090, L4, A10G).
- Cabe en GPU de consumo: si, en los dos niveles publicados, siempre que se ajuste la longitud de contexto a la VRAM disponible. En tarjetas de 8-12 GB solo seria viable con cuantizaciones de 2 bits muy agresivas y offload parcial a CPU.
- No requiere GPU de datacenter (A100, H100) para estas dos cuantizaciones; si se usan niveles altos (Q5_K_M, Q6_K) del repositorio estatico el requisito de VRAM crece y no se dispone de sus tamanos exactos.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server, Ollama, LM Studio, koboldcpp) son el camino natural para pesos GGUF. Para el modelo base en BF16 se necesitarian aproximadamente 55 GB de VRAM o memoria unificada, lo que exige vLLM o TGI sobre multiples GPU.
- Modo vision: requiere descargar el fichero `mmproj` desde el repositorio estatico `mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF`, ya que no esta incluido en este repositorio.
- Latencia y throughput estimados: no disponibles. No hay datos de tokens por segundo publicados por el autor.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para comparar con alternativas de la misma categoria. La tabla siguiente recoge la comparacion con los repositorios relacionados del propio autor; los datos de modelos externos no se incluyen por no poder verificarse con la informacion disponible.

| Modelo | Parametros | Contexto | Cuantizaciones incluidas | Licencia | Formato |
|---|---|---|---|---|---|
| mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-i1-GGUF (esta ficha) | 27,3 B | No disponible | i1-Q2_K, i1-IQ3_M + imatrix | swift-open-license-1.0 | GGUF |
| mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF (estatico) | 27,3 B | No disponible | Conjunto completo de niveles estaticos, incluidos Q5_K_M y Q6_K, mas ficheros mmproj | swift-open-license-1.0 | GGUF |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 (base) | 27,3 B | No disponible | No aplica (BF16) | swift-open-license-1.0 | BF16, presumiblemente safetensors |
| Modelos comparables de otras familias | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo abliterated y uncensored: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o desinformacion sin advertencia. No es apto para aplicaciones orientadas al publico sin una capa externa de moderacion.
- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones de fidelidad publicadas.
- Licencia: `swift-open-license-1.0` con etiqueta `license: other`. No se dispone del texto de la licencia ni de confirmacion sobre permisos de uso comercial, redistribucion o modificacion. Es imprescindible revisar los terminos originales antes de cualquier uso en produccion.
- Sin validacion comunitaria: 0 descargas y 0 likes en la fecha de consulta, sin benchmarks ni evaluaciones independientes.
- Solo dos cuantizaciones en este repositorio: si se necesita Q4_K_M, Q5_K_M, Q6_K u otro nivel, hay que acudir al repositorio estatico.
- Los ficheros `mmproj` para el modo vision no estan en este repositorio; sin ellos el modelo funciona solo con texto.
- Procedencia del modelo base no verificada: la nomenclatura "Qwen3.8-27B" no corresponde a ninguna familia oficial conocida de Qwen, y no se documenta el proceso de entrenamiento ni los datos utilizados. Conviene tratar el modelo como un derivado no oficial.
- Metadatos atipicos: las fechas de creacion y actualizacion indicadas (2026-09-15) no coinciden con un calendario convencional; conviene verificar la procedencia y la vigencia del repositorio.
- Ausencia de datos de contexto: al no conocer la longitud de contexto soportada, no se puede garantizar el comportamiento en conversaciones largas ni el consumo de KV cache asociado.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-i1-GGUF
- Modelo base: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Repositorio de cuantizaciones estaticas (incluye ficheros mmproj): https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-BF16-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#Swift-Qwen3.8-27B-Uncensored-BF16-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (infraestructura usada por el autor): https://www.nethype.de/
