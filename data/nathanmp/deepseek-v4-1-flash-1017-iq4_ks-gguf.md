# nathanmp/DeepSeek-V4.1-Flash-1017-IQ4_KS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por DeepSeek, publicado en Hugging Face bajo licencia MIT. Esta ficha describe concretamente la cuantizacion GGUF mixta publicada por el usuario nathanmp, que reduce el peso del modelo original a aproximadamente 409 GB mediante un esquema heterogeneo de precision: los expertos enrutados usan IQ4_KS y el resto de tensores densos se mantienen mayoritariamente en Q8_0 o superior. El modelo base cuenta con 748.494.684.784 parametros totales, segun los datos de safetensors del repositorio.

La relevancia de esta publicacion radica en que hace viable la inferencia de un MoE de gran escala en maquinas con mucha mas RAM de sistema que VRAM, delegando los expertos enrutados a CPU y manteniendo las operaciones densas en GPU. Para ello se apoya en delphi.cpp, un fork de llama.cpp orientado a ejecucion NUMA-aware, cache de expertos calientes en GPU y decodificacion especulativa DSpark.

La cuantizacion no es compatible con llama.cpp mainline, ya que emplea tipos de tensor IQ4_KS provenientes de ik_llama.cpp. Incluye componentes opcionales separados para el proyector multimodal y el modelo borrador de decodificacion especulativa, y soporta entrada de imagen ademas de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) con atencion especializada, engrams e hyper-connections; 40 capas |
| Parametros totales | 748.494.684.784 (modelo base, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el ejemplo de uso configura `-c 65536`) |
| Tipos de cuantizacion | Mixta: IQ4_KS (expertos enrutados), Q8_0 (atencion, expertos compartidos, embeddings, hyper-connections, output, indexer query), BF16 (router, indexer attn_k, indexer proj, engram Q/K), Q4_K (engram embeddings), F32 (normalizacion y tensores pequenos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dos shards principales + DSpark Q8_0 + mmproj BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 40 capas y mecanismos de atencion especializados, ademas de modulos denominados engrams e hyper-connections. La model card de esta cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card del modelo original de DeepSeek, que no se ha incluido en la informacion proporcionada.

La innovacion tecnica destacable de esta publicacion es el esquema de cuantizacion heterogenea: todos los expertos enrutados de las 40 capas se almacenan en IQ4_KS, mientras que las operaciones densas, la atencion, los expertos compartidos, los embeddings y los componentes sensibles se conservan en Q8_0 o BF16. Este reparto esta pensado para sistemas que mantienen los expertos enrutados en RAM del sistema y ejecutan las operaciones densas en GPU. Ademas, se incluye un modelo borrador DSpark para decodificacion especulativa y un proyector multimodal separado para entrada de imagen.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat Jinja incluida.
- Razonamiento multi-paso y soporte de agentes, segun la orientacion del modelo base.
- Entrada multimodal de imagen y texto (`image-text-to-text`), mediante el proyector `mmproj` BF16.
- Decodificacion especulativa mediante el modelo borrador DSpark Q8_0.
- Ejecucion eficiente de MoE de gran escala repartiendo expertos entre CPU y GPU (delphi.cpp).
- Ejecucion NUMA-aware en CPU para los expertos enrutados y cache de expertos calientes en GPU.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia de un MoE de gran escala en servidores con mucha RAM y VRAM limitada: el reparto IQ4_KS en RAM para expertos y Q8_0 en GPU para operaciones densas permite servir el modelo sin un cluster de GPUs de gran memoria.
- Despliegue de un asistente conversacional multimodal: el proyector `mmproj` BF16 habilita entrada de imagen junto con texto, util para tareas de descripcion, extraccion de informacion o respuesta a preguntas sobre imagenes.
- Aceleracion de generacion con decodificacion especulativa: el borrador DSpark Q8_0 permite reducir la latencia por token en cargas de generacion larga mediante verificacion especulativa.
- Experimentacion e investigacion con modelos MoE de 748.000 millones de parametros en hardware asequible: la cuantizacion IQ4_KS reduce el peso a unos 409 GB, lo que hace posible probar el modelo en estaciones de trabajo con gran cantidad de RAM.
- Evaluacion comparativa de tecnicas de cuantizacion: el esquema mixto sirve como referencia para estudiar el impacto de IQ4_KS en expertos frente a Q8_0 en tensores densos.
- Integracion en pipelines de servidor compatibles con la API de llama-server: el ejemplo de uso con `llama-server` y plantilla de chat facilita montar un endpoint conversacional con contexto configurable (por ejemplo, 65536 tokens).
- Procesamiento por lotes en CPU con aceleracion parcial en GPU: la ejecucion NUMA-aware de expertos enrutados resulta adecuada para entornos con topologia de multiples sockets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El conjunto principal de GGUF ocupa aproximadamente 409 GB, y el total con componentes opcionales ronda los 418 GB. El diseno esta pensado para mantener los expertos enrutados en RAM del sistema y las operaciones densas en GPU.
- GPU recomendadas: no disponibles en la informacion proporcionada. El enfoque de delphi.cpp esta orientado a maquinas con mucha mas RAM de sistema que VRAM, por lo que la GPU actua como acelerador parcial y no como unico destino de los pesos.
- Compatibilidad con GPU de consumo: no disponible. Dado el tamano del modelo, no cabe integramente en una GPU de consumo; requeriria reparto entre RAM y VRAM.
- Opciones de despliegue: delphi.cpp (runtime confirmado), ik_llama.cpp (compatibilidad esperada pero no verificada). No es compatible con llama.cpp mainline.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (esta cuantizacion) | 748.494.684.784 | no disponible | MIT | GGUF mixto, ~409 GB | Requiere delphi.cpp o ik_llama.cpp |
| DeepSeek-V4.1-Flash-1017 (modelo base) | 748.494.684.784 | no disponible | MIT | Pesos originales en Hugging Face | Referencia de precision completa |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp mainline: los tipos IQ4_KS no estan soportados por el runtime upstream; es necesario usar delphi.cpp o, con reservas, ik_llama.cpp.
- Compatibilidad con ik_llama.cpp no verificada por el autor; solo delphi.cpp esta confirmado como runtime funcional.
- La cuantizacion IQ4_KS en expertos enrutados introduce perdida de precision respecto al modelo base; el impacto cualitativo no esta cuantificado en la model card.
- Requiere hardware con gran cantidad de RAM de sistema (del orden de cientos de GB) para alojar los expertos enrutados.
- No se dispone de informacion sobre sesgos, tasas de alucinacion, idiomas soportados ni restricciones adicionales de uso mas alla de la licencia MIT.
- La model card no documenta el contexto maximo nativo del modelo base; el valor de 65536 del ejemplo de uso es una configuracion del servidor, no una especificacion del modelo.
- El repositorio tiene un numero bajo de descargas (427) y cero likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes derivados.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/nathanmp/DeepSeek-V4.1-Flash-1017-IQ4_KS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Runtime recomendado (delphi.cpp): https://github.com/nathanmp/delphi.cpp
- ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
