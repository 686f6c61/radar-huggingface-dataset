# mradermacher/Tema_Q-X8-Thinking-i1-GGUF

## Resumen

Tema_Q-X8-Thinking-i1-GGUF es la version cuantizada con imatrix del modelo Tema_Q-X8-Thinking, publicada por el usuario mradermacher. El modelo original lo desarrolla la organizacion temaq-org y se distribuye como un transformer denso de aproximadamente 35.500 millones de parametros (35,5 B), orientado a instrucciones, con etiquetas que lo describen como agentico, multilingue y sin censura (uncensored). Esta version concreta no es un modelo nuevo, sino un conjunto de pesos en formato GGUF preparados para inferencia local eficiente con llama.cpp y derivados.

La relevancia de esta ficha reside en que ofrece el modelo en multiples niveles de cuantizacion (desde i1-Q2_K de 13,3 GB hasta i1-Q6_K de 29,3 GB), lo que permite desplegarlo en hardware de consumo con compromisos controlados de calidad. El modelo base esta pensado para tareas conversacionales, uso como agente y generacion de texto multilingue en japones, ingles y chino. La informacion publica disponible es escasa: no se detallan la longitud de contexto, los datos de entrenamiento ni resultados de benchmarks.

Conviene subrayar que la model card del repositorio GGUF es fundamentalmente una ficha de cuantizacion (generada por la herramienta de mradermacher) y no incluye especificaciones tecnicas del modelo original. Por tanto, muchos campos de esta ficha se marcan como "no disponible" al no poder confirmarse a partir de la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (segun tags: transformer); detalles internos no disponibles |
| Parametros totales | 35.505.251.456 (aprox. 35,5 B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (ademas de fichero imatrix) |
| Idiomas soportados | japones (ja), ingles (en), chino (zh) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye presumiblemente en safetensors |
| Tamano del repo | 279,4 GB (incluye todas las cuantizaciones) |
| Modelo base | temaq-org/Tema_Q-X8-Thinking |
| Cuantizador | mradermacher (quants con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Tema_Q-X8-Thinking mas alla de la etiqueta "transformer". Se trata de un modelo denso de aproximadamente 35,5 B de parametros, etiquetado como instruction-tuned y orientado a uso conversacional y agentico. No se especifican el numero de capas, la dimension oculta, el tipo de atencion ni si emplea innovaciones como atencion lineal o decodificacion especulativa.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas "uncensored", "non-censored" y "unfiltered" sugieren que el ajuste fino evito filtros de rechazo, pero no hay informacion tecnica que lo confirme. Esta version i1-GGUF aplica cuantizacion con matriz de importancia (imatrix) generada por mradermacher, lo que mejora la calidad respecto a cuantizaciones estaticas de tamano equivalente.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" y "instruction-tuned".
- Uso como agente: la etiqueta "agent" indica soporte previsto para flujos de trabajo agenticos, aunque no se detalla el soporte concreto de tool calling o function calling.
- Razonamiento: el sufijo "Thinking" del nombre sugiere un modo de razonamiento extendido, aunque no se documenta explicitamente.
- Capacidades multilingues limitadas a japones, ingles y chino segun los metadatos.
- Posible capacidad de vision: la model card indica "This is a vision model", si bien los ficheros mmproj (proyector multimodal) se alojarian en el repositorio estatico hermano, no en este.
- Comportamiento sin censura (uncensored/unfiltered), orientado a respuestas sin filtros de rechazo.

## Casos de uso

- Asistente conversacional local en japones, ingles o chino: el modelo puede gestionar dialogos multi-turno en estas tres lenguas, adecuado para prototipos de atencion al cliente o asistentes personales que requieran despliegue en hardware propio.
- Agente autonomo en pipelines de automatizacion: la etiqueta "agent" sugiere su uso en flujos de varios pasos, por ejemplo orquestacion de tareas o extraccion de informacion, ejecutandose con llama.cpp sobre servidores modestos.
- Generacion de texto sin filtros para investigacion: al estar etiquetado como uncensored, puede emplearse en estudios sobre comportamiento de modelos sin alineacion restrictiva, siempre con las cautelas eticas y legales correspondientes.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_M (21,8 GB) o i1-IQ4_XS (19,3 GB) permiten ejecutar el modelo en GPUs con 24 GB de VRAM, habilitando asistentes privados sin conexion.
- Procesamiento de documentos multilingues: para tareas de resumen o reescritura en japones, chino e ingles dentro de entornos con requisitos de soberania de datos.
- Experimentacion con cuantizacion imatrix: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y comparar la perdida de calidad entre niveles.
- Base para ajuste fino o evaluacion comparativa: al disponer de multiples cuantizaciones, sirve para estudiar el impacto de la cuantizacion en tareas de razonamiento y generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - i1-Q2_K: ~13,3 GB de pesos; requiere al menos ~14-16 GB de VRAM con overhead de contexto.
  - i1-IQ3_S / i1-Q3_K_M: ~15,7-17,3 GB; apto para GPUs de 24 GB.
  - i1-Q4_K_M (recomendada por el autor): ~21,8 GB; encaja en GPUs de 24 GB (RTX 3090, RTX 4090, A10, L4 con margen limitado).
  - i1-Q5_K_M: ~25,4 GB; requiere 32 GB o mas (A100 40 GB, RTX A6000).
  - i1-Q6_K: ~29,3 GB; requiere 32-40 GB de VRAM.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4; A100 40/80 GB, H100 o RTX A6000 para Q5/Q6 y contexto largo.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q3/Q4; en GPUs de 16 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o LM Studio). La model card menciona "endpoints_compatible".
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. El autor indica que Q4_K_M es "fast, recommended" y Q4_0 "fast, low quality".

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. Se indica "no disponible". Como referencia estructural, un modelo denso de ~35 B en Q4 ocupa en torno a 20-22 GB, similar a otros modelos densos de la misma escala cuantizados en Q4, pero no se puede establecer una comparacion de rendimiento sin datos publicados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (temaq-org/Tema_Q-X8-Thinking) antes de cualquier despliegue en produccion.
- Idiomas limitados a japones, ingles y chino; el rendimiento en castellano u otras lenguas no esta garantizado y probablemente sea deficiente.
- Etiquetado como uncensored/unfiltered: mayor riesgo de generar contenido inapropiado, sesgado o danino; requiere moderacion adicional en entornos de produccion.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones publicadas de fidelidad factual.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el limite real.
- La model card es una ficha de cuantizacion, no del modelo original; los detalles de entrenamiento, alineacion y arquitectura no estan documentados en este repositorio.
- El repositorio pesa 279,4 GB por incluir todas las cuantizaciones; la descarga selectiva de un unico fichero es necesaria.
- Posible capacidad de vision no confirmada en este repositorio: los ficheros mmproj se alojan en el repositorio estatico hermano, por lo que la funcionalidad multimodal no esta garantizada desde esta pagina.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/Tema_Q-X8-Thinking-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Tema_Q-X8-Thinking-GGUF
- Modelo base: https://huggingface.co/temaq-org/Tema_Q-X8-Thinking
- Pagina de descripcion del cuantizador: https://hf.tst.eu/model#Tema_Q-X8-Thinking-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
