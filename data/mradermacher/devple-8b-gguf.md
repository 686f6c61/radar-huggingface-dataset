# mradermacher/Devple-8B-GGUF

## Resumen

Devple-8B-GGUF es la version cuantizada en formato GGUF del modelo Devple-8B, desarrollado originalmente por el usuario Kkaastr y publicada por mradermacher, un conocido autor de cuantizaciones para la comunidad de llama.cpp. Se trata de un modelo conversacional de aproximadamente 8.030 millones de parametros, derivado de la familia Llama 3.1 segun indica su licencia, y orientado a los idiomas ruso e ingles. Su proposito es ofrecer una alternativa ligera y desplegable en hardware de consumo para tareas de generacion de texto y dialogo.

El modelo base Devple-8B no cuenta con una model card detallada en la informacion disponible, por lo que muchos de sus datos de entrenamiento y arquitectura interna no estan documentados publicamente. La contribucion de mradermacher consiste en proporcionar un conjunto completo de cuantizaciones estaticas (desde Q2_K hasta f16) que permiten ejecutar el modelo en configuraciones de VRAM muy diversas, desde GPUs de gama baja hasta estaciones de trabajo con memoria abundante.

La relevancia de esta ficha radica en que permite evaluar rapidamente si el modelo encaja en un despliegue concreto: al tratarse de una cuantizacion GGUF, es compatible con llama.cpp, Ollama y otros runners ligeros, y su licencia Llama 3.1 impone las restricciones habituales de uso comercial de Meta. No se dispone de informacion sobre benchmarks publicados ni sobre el proceso de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.1, segun licencia; detalles no disponibles) |
| Parametros totales | 8.030.277.696 (8,03 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Llama 3.1 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 71,8 GB (incluye todas las cuantizaciones) |
| Modelo base | Kkaastr/Devple-8B |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Devple-8B. Por la licencia (Llama 3.1) y el numero de parametros (8,03 B), es plausible que se trate de un fine-tuning o derivado de la familia Llama 3.1 de 8B, pero la model card original no documenta la arquitectura exacta, el numero de capas, las dimensiones de atencion ni el esquema de tokenizacion. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Respecto al entrenamiento, no hay datos publicos sobre el volumen de tokens, la composicion del dataset, el uso de RLHF o DPO, ni sobre posibles tecnicas de alineacion. La unica informacion disponible es la declaracion de idiomas (ruso e ingles) y la etiqueta "conversational", que sugiere un ajuste orientado a dialogo. Las cuantizaciones de mradermacher son estaticas (no se han publicado variantes con imatrix o ponderadas en el momento de la ficha), lo que implica que la calidad relativa de cada quant sigue el comportamiento estandar de las cuantizaciones K-quants de llama.cpp.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con orientacion a dialogos multi-turno.
- Razonamiento basico y respuesta a preguntas, segun el comportamiento tipico de modelos de 8B derivados de Llama 3.1 (no verificado con benchmarks).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a ruso e ingles; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue mediante APIs compatibles con OpenAI.

## Casos de uso

- Atencion al cliente en ruso e ingles: el modelo puede gestionar conversaciones multi-turno en ambos idiomas, adecuado para empresas que atienden a usuarios rusoparlantes y necesitan un modelo ligero desplegable en infraestructura propia.
- Asistente conversacional local en hardware de consumo: gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,8-5,0 GB), puede ejecutarse en GPUs con 8 GB de VRAM mediante llama.cpp u Ollama, ideal para prototipos y entornos de desarrollo sin acceso a la nube.
- Generacion de texto y redaccion asistida en ruso: util para equipos que trabajan con contenido en ruso y necesitan un modelo que no dependa de APIs externas por motivos de privacidad.
- Despliegue en entornos con restricciones de red: al ser un GGUF local, permite operar en sistemas aislados (air-gapped) donde no se puede llamar a servicios en la nube.
- Experimentacion e investigacion: sirve como base para estudiar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) en la calidad de salida de un modelo de 8B, con un rango de tamanos de 3,3 a 16,2 GB.
- Integracion en pipelines de generacion de texto por lotes: con Q8_0 (8,6 GB) o Q6_K (6,7 GB) se obtiene buena calidad para tareas de resumen, clasificacion o extraccion de informacion en ingles y ruso.
- Chatbot embebido en aplicaciones de escritorio o moviles de gama alta: las variantes Q3_K_S (3,8 GB) e IQ4_XS (4,6 GB) permiten integrar el modelo en entornos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del archivo GGUF y el overhead de llama.cpp):
  - Q2_K: ~3,3 GB de pesos, ~4 GB de VRAM en total.
  - Q4_K_M: ~5,0 GB de pesos, ~5,5-6 GB de VRAM en total.
  - Q8_0: ~8,6 GB de pesos, ~9-10 GB de VRAM en total.
  - f16: ~16,2 GB de pesos, ~17-18 GB de VRAM en total.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 (cualquier cuantizacion hasta Q8_0; f16 requiere 24 GB o mas).
  - Profesionales: A100 40/80 GB, H100 (sobradas para cualquier quant; utiles para servir multiples instancias).
- Cabe en GPU de consumo: si, desde GPUs con 6-8 GB de VRAM usando Q3_K_S o Q4_K_S; con 12 GB se puede usar Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y runners compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero las cuantizaciones GGUF estan pensadas para llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Devple-8B-GGUF (este) | 8,03 B | no disponible | ru, en | Llama 3.1 | GGUF |
| Llama 3.1 8B Instruct | 8,03 B | 128K (segun documentacion de Meta) | multilingue | Llama 3.1 | safetensors, GGUF |
| Qwen2.5 7B Instruct | 7,6 B | 128K (segun documentacion de Alibaba) | multilingue | Apache 2.0 | safetensors, GGUF |
| Mistral 7B Instruct | 7,2 B | 32K (segun documentacion de Mistral) | en (principalmente) | Apache 2.0 | safetensors, GGUF |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de Devple-8B que permitan una comparacion cuantitativa. La principal diferencia frente a las alternativas es su enfoque bilingue ruso-ingles y su licencia Llama 3.1, mas restrictiva que Apache 2.0 para uso comercial.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo; al estar entrenado presumiblemente con datos de internet, es probable que herede sesgos presentes en ellos, pero no esta documentado.
- Riesgo de alucinacion: como cualquier modelo de 8B, puede generar informacion incorrecta con aparente seguridad; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Limitaciones de idioma: solo se declaran ruso e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia Llama 3.1 impone condiciones para uso comercial (politica de uso aceptable de Meta, obligacion de atribucion y limitaciones para empresas con mas de 700 millones de usuarios mensuales), por lo que debe revisarse antes de un despliegue en produccion.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No hay datos de benchmarks ni de rendimiento real, lo que dificulta evaluar su calidad frente a alternativas.
- El modelo base tiene muy poca traccion en la comunidad (8 descargas, 0 likes en la fecha de la ficha), lo que reduce la probabilidad de soporte y mantenimiento a largo plazo.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Devple-8B-GGUF
- Modelo base: https://huggingface.co/Kkaastr/Devple-8B
- Pagina de descargas de mradermacher para este modelo: https://hf.tst.eu/model#Devple-8B-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
