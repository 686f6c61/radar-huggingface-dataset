# mradermacher/prose-rewriter-4b-v2-GGUF

## Resumen

prose-rewriter-4b-v2-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo chartreuse-verte/prose-rewriter-4b-v2, publicado por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos abiertos para inferencia local. No se trata de un modelo entrenado desde cero, sino de una conversión del modelo base a pesos GGUF en doce niveles de cuantización distintos, desde Q2_K (1,9 GB) hasta f16 (8,9 GB), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama o LM Studio.

El modelo subyacente es un transformer de aproximadamente 4.411.424.256 parámetros (unos 4,4 mil millones), etiquetado con la familia qwen3, orientado a tareas de reescritura de prosa, transferencia de estilo, escritura creativa y eliminación de marcas de texto generado por IA (la etiqueta "deslop" del autor). Está entrenado y documentado únicamente para inglés, y su licencia es AGPL-3.0, lo que condiciona su uso en productos propietarios y en servicios accesibles por red.

Su relevancia práctica es doble: por un lado, ofrece un modelo de 4B especializado en edición de estilo que cabe en GPUs de gama media y en equipos Apple Silicon; por otro, sirve como caso de estudio de un pipeline de cuantización estática publicado con esquema de nombres y notas de calidad por tipo de quant. La model card del repositorio no documenta la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esas fichas quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3; detalles de capas, atencion y contexto no documentados en la informacion proporcionada) |
| Parametros totales | 4.411.424.256 (aproximadamente 4,4 mil millones, dato de safetensors del modelo base) |
| Parametros activos | no disponible / no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (el modelo base chartreuse-verte/prose-rewriter-4b-v2 esta en safetensors) |

Datos adicionales del repositorio: autor mradermacher; libreria declarada `transformers`; tamano total del repositorio 39,7 GB; creado el 2026-09-19 y actualizado el mismo dia; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: no se especifican el numero de capas, la dimension oculta, el tipo de atencion, la posicion de las normalizaciones ni si emplea atencion lineal o alguna variante hibrida. La unica pista estructural es la etiqueta `qwen3` incluida en los tags, que apunta a la familia Qwen3 como linaje del modelo base, aunque no se aporta confirmacion explicita. Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste por instrucciones.

En cuanto a esta publicacion concreta, no hay entrenamiento alguno: es un proceso de cuantizacion estatica (el README indica `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`) aplicada sobre los pesos originales de chartreuse-verte/prose-rewriter-4b-v2. La innovacion tecnica relevante aqui es la propia bateria de cuantizaciones: se ofrecen quants k-quant de la serie Q y el tipo IQ4_XS, con notas de calidad del autor (Q3_K_M marcado como "lower quality", Q4_K_S y Q4_K_M como "fast, recommended", Q6_K como "very good quality", Q8_0 como "fast, best quality" y f16 como "16 bpw, overkill"). El autor senala que no hay quants ponderados ni con imatrix disponibles en el momento de la publicacion y que pueden solicitarse mediante una discusion de la comunidad.

## Capacidades

- Reescritura de prosa: reformulacion de textos manteniendo el significado y modificando la redaccion.
- Transferencia de estilo: adaptacion del registro, tono o voz de un texto a un estilo de destino.
- Escritura creativa: generacion y reescritura de texto narrativo o literario en ingles.
- Limpieza de texto generado por IA ("deslop"): eliminacion de cliches y patrones tipicos de texto sintetico, segun la etiqueta declarada por el autor.
- Formato conversacional: el tag `conversational` indica que el modelo esta preparado para plantillas de dialogo tipo chat.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse detras de APIs compatibles con el formato de Hugging Face.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Multilingue: no; el modelo declara unicamente ingles (`language: en`).
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible.

## Casos de uso

- Edicion y post-edicion editorial: el modelo reescribe borradores en ingles para mejorar fluidez y estilo antes de la revision humana, lo que encaja con su especializacion en transferencia de estilo y reescritura de prosa.
- Humanizacion de contenido generado por IA: en flujos de marketing o publicacion web, se puede usar como paso final tras un modelo generativo grande para reducir patrones repetitivos y marcas de texto sintetico ("deslop") antes de publicar.
- Normalizacion de tono en documentacion tecnica: reescritura de notas de version, guias y mensajes de error para unificar registro y voz de marca, ejecutando el modelo en local con llama.cpp.
- Preprocesado de datasets para entrenamiento: reescritura de corpus en ingles para homogeneizar estilo o eliminar artefactos de generacion automatica antes de usarlos como datos de ajuste fino.
- Prototipado de asistentes de escritura en local: integrado en editores o herramientas de escritorio mediante Ollama o LM Studio, ofrece sugerencias de reescritura sin enviar el texto a servicios externos, util en entornos con requisitos de privacidad.
- Base para fine-tuning especifico de dominio: al ser un modelo de 4,4B con pesos disponibles en safetensors en el repositorio base, sirve como punto de partida para ajustar estilos muy concretos (legal, periodistico, academico) con recursos de GPU modestos.
- Evaluacion y comparacion de cuantizaciones: el repositorio permite medir el impacto real de Q2_K frente a Q4_K_M o Q8_0 sobre la misma tarea de reescritura, algo util para decidir el compromiso entre calidad y VRAM en despliegues propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de reescritura o transferencia de estilo, y tampoco se han encontrado datos de evaluacion en los resultados de busqueda web consultados.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead, valores orientativos a partir del tamano de cada fichero GGUF):
  - Q2_K (1,9 GB): alrededor de 2,5-3,5 GB de VRAM.
  - Q3_K_S / Q3_K_M (2,2-2,3 GB): alrededor de 3-4 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (2,6-2,8 GB): alrededor de 3,5-4,5 GB; es el rango aconsejado por el autor para uso general.
  - Q5_K_S / Q5_K_M (3,2-3,3 GB): alrededor de 4-5 GB.
  - Q6_K (3,7 GB): alrededor de 4,5-5,5 GB.
  - Q8_0 (4,8 GB): alrededor de 6 GB.
  - f16 (8,9 GB): alrededor de 10 GB o mas.
  - Estas cifras no incluyen un contexto largo: al no documentarse la ventana de contexto, el consumo de cache KV no puede calcularse con precision.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM permite ejecutar comodamente las cuantizaciones de 4 y 5 bits; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes para todas las cuantizaciones salvo, en el caso de las mas pequenas, f16 con contexto amplio. En el extremo profesional, A100 o H100 no aportan ventaja para un modelo de este tamano salvo por concurrencia y throughput agregado.
- Cabe en GPU de consumo: si. Con 6-8 GB de VRAM se pueden usar Q4_K_M o Q5_K_M; con 4 GB, Q3_K_M o Q2_K. Tambien es viable en CPU con 8 GB de RAM para los quants mas bajos, y en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, llama-cpp-python y text-generation-webui para el formato GGUF; el repositorio base en safetensors puede cargarse con transformers. El soporte de GGUF en vLLM existe pero es mas limitado y no esta documentado para este repositorio concreto.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este modelo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada (ni parametros, ni contexto, ni benchmarks de alternativas de reescritura de prosa de ~4B). La comparacion posible se limita al propio modelo base y al formato de distribucion:

| Aspecto | chartreuse-verte/prose-rewriter-4b-v2 | mradermacher/prose-rewriter-4b-v2-GGUF |
|---|---|---|
| Naturaleza | Modelo original ajustado | Cuantizaciones del modelo original |
| Parametros | 4.411.424.256 | Los mismos, con perdida propia de la cuantizacion |
| Formato de pesos | safetensors | GGUF (Q2_K a f16) |
| Licencia | AGPL-3.0 | AGPL-3.0 |
| Idiomas | en | en |
| Contexto | no disponible | no disponible |
| Uso previsto | Transformers / fine-tuning | Inferencia local en llama.cpp, Ollama, LM Studio |

Para el resto de alternativas de la misma categoria (modelos de reescritura o transferencia de estilo de ~4B), no hay informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible. Al estar entrenado solo en ingles, es previsible un sesgo cultural y linguistico hacia textos angloparlantes, aunque no hay evaluacion publicada al respecto.
- Riesgo de alucinacion: no cuantificado. En tareas de reescritura, el riesgo tipico es la alteracion de hechos, cifras o nombres presentes en el texto original; no hay datos publicados sobre la tasa de fidelidad de este modelo.
- Limitacion de idioma: el modelo declara unicamente ingles (`language: en`). No hay evidencia de calidad en castellano ni en otros idiomas, por lo que su uso en espanol no esta respaldado.
- Limitacion de contexto: la longitud de contexto no esta documentada, lo que impide planificar tareas sobre documentos largos y calcular el consumo de cache KV.
- Restricciones de licencia: AGPL-3.0 es una licencia copyleft fuerte. El uso comercial en un servicio accesible por red obliga, en los terminos habituales de esta licencia, a ofrecer el codigo fuente correspondiente a los usuarios; integrarlo en productos propietarios distribuidos es problematico sin asesoramiento legal especifico.
- Perdida por cuantizacion: las versiones de 2 y 3 bits degradan la calidad de forma apreciable; el propio autor marca Q3_K_M como "lower quality". Para produccion conviene partir de Q4_K_M o superior y validar con un conjunto propio de textos.
- Ausencia de quants ponderados o con imatrix: el autor indica que no estan disponibles y que no necesariamente los generara, lo que limita la calidad alcanzable en los tamanos mas bajos.
- Modelo poco validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluaciones externas localizadas.
- Trazabilidad incompleta: la model card del repositorio de cuantizaciones no detalla el dataset de entrenamiento del modelo base ni el proceso de ajuste, lo que dificulta auditar su comportamiento.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/prose-rewriter-4b-v2-GGUF
- Modelo base: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v2
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#prose-rewriter-4b-v2-GGUF
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que soporta la infraestructura del autor: https://www.nethype.de/
- No se han localizado papers, blogs tecnicos ni demos adicionales sobre este modelo en los resultados de busqueda web consultados.
