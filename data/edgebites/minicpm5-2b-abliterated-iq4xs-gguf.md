# edgebites/MiniCPM5-2B-Abliterated-iq4XS-GGUF

## Resumen

MiniCPM5-2B-Abliterated-iq4XS-GGUF es una version cuantizada en formato GGUF del modelo MiniCPM5-2B de OpenBMB, en su variante "abliterated" (tambien etiquetada como "heretic"), es decir, con las capas de rechazo reducidas o eliminadas. El repositorio lo publica el usuario edgebites y deriva de los trabajos previos Abiray/MiniCPM5-2B-heretic-abliterated-GGUF y mradermacher/abliterated-minicpm5-2b-GGUF, que a su vez parten del modelo original de OpenBMB.

Se trata de un modelo de aproximadamente 2.516.756.480 parametros (unos 2,52 mil millones) empaquetado con cuantizacion IQ4_XS calibrada con imatrix, lo que reduce el peso a un fichero de 1,3 GB. Esa combinacion de tamano reducido y pesos de baja precision lo situa en la categoria de modelos para despliegue en dispositivos con recursos limitados (edge, moviles, mini-PC y equipos de sobremesa sin GPU dedicada).

Su relevancia actual radica en dos factores: por un lado, permite ejecutar un LLM conversacional en hardware muy modesto mediante llama.cpp u Ollama; por otro, al ser una version abliterated, ofrece un comportamiento menos restrictivo que la version alineada original, algo que interesa a quienes necesitan generar contenido sin los filtros de rechazo habituales. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado cuantizado del modelo base MiniCPM5-2B de OpenBMB) |
| Parametros totales | 2.516.756.480 (aprox. 2,52 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF IQ4_XS con imatrix (variante concreta de este repo) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna, el volumen de tokens de entrenamiento ni la composicion del dataset en los datos disponibles. El repositorio unicamente declara que se trata de una conversion a GGUF del modelo MiniCPM5-2B en su variante abliterated, con cuantizacion IQ4_XS generada mediante imatrix.

La innovacion tecnica relevante en esta ficha no esta en el entrenamiento base, sino en el proceso de derivacion: la "abliteracion" o variante "heretic" modifica los pesos para reducir el comportamiento de rechazo del modelo alineado, y la cuantizacion IQ4_XS con imatrix emplea una matriz de importancia para minimizar la perdida de calidad al comprimir los pesos a aproximadamente 4,25 bits por parametro. No se dispone de informacion sobre si el modelo base uso RLHF, DPO u otras tecnicas de alineacion antes de la abliteracion.

## Capacidades

- Generacion de texto conversacional (la etiqueta del repositorio incluye "conversational").
- Comportamiento sin restricciones de rechazo apreciable, al proceder de una version abliterated.
- Ejecucion en entornos de bajos recursos gracias al formato GGUF y a la cuantizacion IQ4_XS.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible") para su exposicion como servicio.
- No se dispone de informacion confirmada sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades de vision, audio o modos de pensamiento explicitos en los datos proporcionados.

## Casos de uso

- Prototipado rapido en local: al ocupar 1,3 GB en disco y poder ejecutarse con llama.cpp, sirve para validar ideas de producto en un portatil o mini-PC sin GPU antes de invertir en infraestructura.
- Asistentes conversacionales en moviles o dispositivos edge: un modelo de 2,5 B en IQ4_XS cabe en la memoria de un telefono de gama alta o una Raspberry Pi, permitiendo un chatbot totalmente offline.
- Escritura creativa sin filtros de rechazo: la naturaleza abliterated lo hace adecuado para generar ficcion, dialogos o contenido que los modelos alineados tienden a rechazar, con la salvedad legal y etica correspondiente.
- Generacion de texto en pipelines por lotes: su bajo coste por token permite usarlo para clasificar, resumir o reescribir grandes volumenes de texto en CPU, sin necesidad de GPU.
- Base para fine-tuning ligero: al ser un checkpoint pequeno en GGUF, sirve como punto de partida o como referencia para experimentos de ajuste sobre la familia MiniCPM.
- Despliegue como backend de demos y hackathons: la licencia MIT y el tamano reducido facilitan distribuirlo en entornos de prueba sin coste de licencia ni de hardware.
- Pruebas de robustez y seguridad: util para investigadores que quieran medir como se comporta un modelo abliterated frente a uno alineado en tareas de evaluacion de sesgos o filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB solo para los pesos en IQ4_XS; el consumo real depende del tamaño de contexto y de la cache KV, por lo que conviene reservar entre 1,5 y 2,5 GB de memoria.
- GPU recomendadas: cualquier GPU consumer con mas de 2 GB de VRAM es suficiente; no se requiere una A100 o H100 para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1050 Ti en adelante, RTX 3050, RTX 4090, etc.).
- Cabe en CPU y movil: si, mediante llama.cpp; tambien en placas tipo Raspberry Pi con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI trabajan mejor con pesos en safetensors, por lo que su uso con este repo requeriria conversion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniCPM5-2B-Abliterated-iq4XS (este repo) | aprox. 2,52 B | No disponible | MIT | GGUF (IQ4_XS) |
| Llama 3.2 3B Instruct | aprox. 3,2 B | 128k | Llama 3.2 Community License | GGUF, safetensors |
| Qwen2.5 3B | aprox. 3,1 B | 32k (ampliable con YaRN) | Apache 2.0 | GGUF, safetensors |
| Gemma 2 2B | aprox. 2,6 B | 8k | Gemma Terms of Use | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo (benchmarks) que permitan valorar la calidad relativa de este modelo frente a las alternativas de su categoria.

## Limitaciones y advertencias

- Al ser una version abliterated, el modelo ha visto reducida su capacidad de rechazar peticiones daninas o inapropiadas; esto puede ser problematico en entornos de produccion dirigidos al publico general.
- La abliteracion suele degradar otras capacidades del modelo (coherencia, seguimiento de instrucciones o alineacion general), aunque no se dispone de datos concretos para esta variante.
- Riesgo de alucinacion elevado, propio de modelos de 2,5 B de parametros, que tienen menos conocimiento factual que modelos mayores.
- No se dispone de informacion sobre idiomas soportados, por lo que su rendimiento en castellano no esta verificado.
- La cuantizacion IQ4_XS introduce perdida adicional de calidad respecto a los pesos originales en mayor precision.
- Aunque la licencia declarada es MIT, conviene verificar las condiciones del modelo base de OpenBMB y de los repositorios intermedios, ya que podrian imponer restricciones adicionales.
- No hay resultados publicados de benchmarks, evaluaciones de sesgo ni pruebas de seguridad para este repositorio en concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/edgebites/MiniCPM5-2B-Abliterated-iq4XS-GGUF
- Modelo base OpenBMB: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Version abliterated de Abiray: https://huggingface.co/Abiray/MiniCPM5-2B-heretic-abliterated-GGUF
- Version abliterated de mradermacher: https://huggingface.co/mradermacher/abliterated-minicpm5-2b-GGUF
