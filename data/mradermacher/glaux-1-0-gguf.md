# mradermacher/Glaux-1.0-GGUF

## Resumen

Glaux-1.0 es un modelo de lenguaje de pequeno tamano (1.170.340.608 parametros) desarrollado por Openwist y distribuido en formato GGUF por mradermacher. Se trata de un modelo afinado mediante LoRA y posteriormente fusionado (merged), orientado especificamente a su ejecucion en dispositivo (on-device) y al uso de herramientas (tool-use). Su reducido tamano lo situa en la categoria de modelos que pueden ejecutarse en hardware de consumo, lo que lo hace relevante para aplicaciones de agentes locales y automatizacion ligera.

La ficha que nos ocupa corresponde a la version cuantizada del modelo original `Openwist/Glaux-1.0`, publicada por mradermacher, un autor habitual en la comunidad de cuantizacion GGUF. El repositorio incluye un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta f16), lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp u otras herramientas compatibles con GGUF.

Por su tamano y su enfoque en tool-use y on-device, Glaux-1.0 se posiciona como una alternativa ligera para tareas de generacion de texto y llamada a funciones en entornos locales, aunque la informacion publica sobre arquitectura detallada, contexto y datos de entrenamiento es limitada. La licencia lfm1.0 (LFM Open License) impone restricciones que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer afinado con LoRA y fusionado; detalles no publicados) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (LFM Open License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Los metadatos indican que se trata de un modelo transformer afinado mediante LoRA (Low-Rank Adaptation) y posteriormente fusionado con el modelo base, lo que sugiere un proceso de ajuste fino supervisado orientado a tareas especificas de tool-use y despliegue on-device. El modelo base es `Openwist/Glaux-1.0`.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o mecanismos de atencion lineal. La informacion disponible se limita a los metadatos de cuantizacion y a las etiquetas del repositorio (openwist, lora, merged, on-device, tool-use).

## Capacidades

- Generacion de texto conversacional en ingles.
- Soporte de tool calling / function calling, segun la etiqueta `tool-use` del repositorio.
- Orientado a despliegue on-device, es decir, ejecucion local en hardware de consumo.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan capacidades de vision, audio, thinking mode ni razonamiento multi-paso explicito.
- No se dispone de informacion sobre soporte de agentes o planificacion multi-step mas alla del tool-use declarado.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose en un portatil o estacion de trabajo sin GPU dedicada, gracias a sus cuantizaciones de menos de 1 GB (Q4_K_M ocupa 0,8 GB).
- Automatizacion de llamadas a funciones en aplicaciones de escritorio: su enfoque en tool-use permite integrarlo en asistentes que invocan APIs locales o scripts, con un consumo de memoria muy reducido.
- Prototipado rapido de agentes: al caber en cualquier GPU de consumo e incluso en CPU, sirve para validar flujos de agente antes de migrar a modelos mayores.
- Clasificacion y extraccion de informacion en ingles: tareas de procesamiento de texto donde la latencia y el coste importan mas que la profundidad de razonamiento.
- Educacion y demos offline: despliegue en entornos sin conectividad mediante Ollama o llama.cpp para demostraciones de IA generativa.
- Filtrado y enrutamiento en pipelines: uso como modelo auxiliar para decidir que herramienta invocar o clasificar entradas antes de pasarlas a un modelo mayor.
- Generacion de texto en dispositivos con recursos limitados (Raspberry Pi, mini-PC) usando cuantizaciones Q2_K o Q3_K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB (Q2_K), 0,8 GB (Q4_K_M), 1,1 GB (Q6_K) y 1,3 GB (Q8_0), segun los tamanos de fichero publicados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para su tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). El modelo base en safetensors puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por su tamano, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Glaux-1.0 (este) | 1,17 B | no disponible | lfm1.0 | GGUF + safetensors |
| Modelos comparables de ~1B | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria. No se han publicado benchmarks ni especificaciones de contexto que permitan contrastar rendimiento con otros modelos de tamano similar.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- No se han publicado benchmarks, por lo que no hay evidencia publica de su calidad en tareas de razonamiento, codigo o matematicas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano; no se documentan mitigaciones especificas.
- La licencia lfm1.0 (LFM Open License) es una licencia "other" con posibles restricciones para uso comercial; es imprescindible revisar el fichero LICENSE del modelo base antes de desplegarlo en produccion.
- La longitud de contexto no esta disponible, lo que impide garantizar conversaciones largas o documentos extensos.
- Al ser una cuantizacion GGUF de un modelo fusionado, las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El modelo es de noviembre de 2026 y cuenta con pocas descargas (372) y ningun like, lo que sugiere escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Glaux-1.0-GGUF
- Modelo base: https://huggingface.co/Openwist/Glaux-1.0
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Glaux-1.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
