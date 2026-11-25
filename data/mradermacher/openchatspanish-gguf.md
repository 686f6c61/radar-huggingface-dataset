# mradermacher/OpenChatSpanish-GGUF

## Resumen

OpenChatSpanish-GGUF es la version cuantizada en formato GGUF del modelo Kukedlc/OpenChatSpanish, publicada por mradermacher el 28 de diciembre de 2024. El repositorio no contiene pesos originales en safetensors, sino una coleccion de ficheros GGUF derivados del modelo base, pensados para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, llama-cpp-python, etc.). El modelo cuenta con 7.241.748.480 parametros totales, lo que lo situa en la categoria de modelos de aproximadamente 7.000 millones de parametros.

La relevancia de esta publicacion es practica: permite ejecutar un modelo conversacional afinado para castellano en hardware de consumo mediante cuantizaciones que van desde 2,8 GB (Q2_K) hasta 14,6 GB (f16). El autor de la model card declara el idioma ingles, aunque el nombre del modelo base y su procedencia (Kukedlc/OpenChatSpanish) apuntan a un ajuste orientado al castellano; esta discrepancia debe tenerse en cuenta al evaluar el soporte real de idiomas.

La informacion disponible es limitada: no se detalla la arquitectura interna del modelo base, no se publican resultados de benchmarks y no se especifica la licencia. Por tanto, esta ficha se centra en lo que si esta documentado (parametros, cuantizaciones, formato y procedencia) y marca explicitamente como "no disponible" todo aquello que no consta en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no publicado) |
| Parametros totales | 7.241.748.480 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (declarado en la model card); el modelo base se denomina OpenChatSpanish |
| Licencia | no disponible |
| Formato de pesos | GGUF (12 ficheros); no se incluyen safetensors en este repo |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Kukedlc/OpenChatSpanish: la model card del repositorio GGUF solo indica que se trata de cuantizaciones estaticas del modelo original y no describe la arquitectura (transformer denso, MoE, hibrida, etc.), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El dato objetivo es el recuento de parametros en safetensors del modelo base: 7.241.748.480.

La innovacion tecnica de este repositorio es exclusivamente la cuantizacion. Segun la model card, se han generado cuantizaciones estaticas (sin versiones ponderadas/imatrix en el momento de la publicacion) con el pipeline de mradermacher, que incluye la conversion a formato GGUF y la produccion de multiples niveles de compresion. El autor advierte que las cuantizaciones IQ suelen ser preferibles frente a cuantizaciones no-IQ de tamano similar, y que Q4_K_S y Q4_K_M son las opciones recomendadas por velocidad, mientras que Q8_0 ofrece la mejor calidad con tamano contenido.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y deriva de un ajuste tipo chat (OpenChatSpanish), por lo que su uso previsto es el dialogo multi-turno.
- Ajuste orientado al castellano: el nombre del modelo base sugiere un entrenamiento o afinamiento en espanol, aunque la model card declara solo "en" como idioma; conviene validar el comportamiento real en castellano antes de desplegarlo.
- Razonamiento y respuesta abierta: capacidades propias de un modelo de ~7B, sin datos especificos publicados sobre rendimiento en tareas de razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no documentadas; el unico idioma declarado es el ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional en castellano para aplicaciones de escritorio: con la cuantizacion Q4_K_M (4,5 GB) el modelo puede ejecutarse en un portatil con GPU de 8 GB o incluso en CPU, ofreciendo respuestas de chat sin depender de la nube.
- Prototipado rapido de chatbots: al estar en GGUF, se puede cargar con llama-cpp-python u Ollama en pocos minutos, lo que permite validar flujos conversacionales antes de invertir en infraestructura mayor.
- Despliegue en entornos con recursos limitados: la version Q2_K (2,8 GB) permite ejecutar el modelo en dispositivos con poca memoria, util para demos en Raspberry Pi o portatiles antiguos, aceptando la perdida de calidad asociada.
- Generacion de texto asistida en local para redaccion: el modelo puede emplearse para borradores, resumenes o reescritura de textos en un entorno sin conexion, usando Q5_K_M o Q6_K para mayor fidelidad.
- Fine-tuning posterior sobre el modelo cuantizado: aunque el ajuste se hace normalmente sobre los pesos originales, la disponibilidad del modelo base Kukedlc/OpenChatSpanish permite adaptar el modelo a dominios concretos y luego recuantizar.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 niveles de cuantizacion del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de la compresion en calidad y velocidad en tareas conversacionales en castellano.
- Integracion en pipelines de CI para pruebas de regresion de chatbots: al ser un fichero unico y ligero (Q4_K_S, 4,2 GB), se puede incorporar a entornos de test automatizados que verifiquen respuestas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto, orientativo):
  - Q2_K: ~3 GB
  - Q3_K_M: ~4 GB
  - Q4_K_S / Q4_K_M: ~5-6 GB
  - Q5_K_M: ~6 GB
  - Q6_K: ~7 GB
  - Q8_0: ~9 GB
  - f16: ~15-16 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las cuantizaciones altas; A100/H100 solo si se busca throughput elevado con llama.cpp o vLLM (vLLM no soporta GGUF de forma nativa en todas las versiones).
- Cabe en GPU de consumo: si. Q4_K_M (4,5 GB) entra en GPUs de 8 GB; Q8_0 requiere 12 GB o mas; f16 necesita 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. Como referencia cualitativa, el autor marca Q4_K_S, Q4_K_M y Q8_0 como opciones "rapidas".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenChatSpanish-GGUF (este) | 7,24 B | no disponible | GGUF | no disponible | Ajuste orientado a castellano, 12 cuantizaciones |
| Kukedlc/OpenChatSpanish | 7,24 B | no disponible | safetensors (pesos originales) | no disponible | Modelo base del que derivan estas cuantizaciones |
| Mistral-7B-Instruct (referencia de categoria) | 7,24 B | 32k (segun version) | safetensors, GGUF | Apache 2.0 | Modelo generico en ingles, ampliamente cuantizado |
| Llama 3.1 8B Instruct (referencia de categoria) | 8,03 B | 128k | safetensors, GGUF | Llama 3.1 Community License | Multilingue, con tool calling nativo |

La comparativa con Mistral-7B-Instruct y Llama 3.1 8B se ofrece solo como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base Kukedlc/OpenChatSpanish antes de desplegarlo en produccion.
- Idioma declarado en ingles: aunque el nombre sugiere castellano, la model card solo declara "en"; el rendimiento real en espanol no esta documentado y debe validarse.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede estimar su calidad relativa frente a otros modelos de ~7B.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no hay informacion sobre el proceso de alineacion que permita acotarlo.
- Perdida de calidad en cuantizaciones bajas: Q2_K y Q3_K_S degradan notablemente la calidad; el propio autor recomienda Q4_K_S, Q4_K_M o superiores para uso real.
- Contexto desconocido: se desconoce la ventana de contexto, lo que impide planificar casos de uso con documentos largos.
- Sin soporte documentado de tool calling ni agentes: no se debe asumir su disponibilidad en produccion.
- Repositorio con pocas descargas (73) y sin likes: senal de baja validacion por parte de la comunidad; conviene tratarlo como experimental.
- Fecha de actualizacion futura (2026-11-25) en los metadatos: puede indicar re-subida o cambios en el repo; conviene verificar la integridad de los ficheros descargados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/OpenChatSpanish-GGUF
- Modelo base: https://huggingface.co/Kukedlc/OpenChatSpanish
- Pagina de descargas del autor: https://hf.tst.eu/model#OpenChatSpanish-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
