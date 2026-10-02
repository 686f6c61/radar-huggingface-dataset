# mradermacher/prose-rewriter-4b-v2.2-GGUF

## Resumen

`prose-rewriter-4b-v2.2-GGUF` es la versión cuantizada en formato GGUF del modelo `chartreuse-verte/prose-rewriter-4b-v2.2`, un modelo especializado en reescritura de prosa, transferencia de estilo y limpieza de texto generado por IA (la etiqueta `deslop` hace referencia precisamente a eliminar las marcas típicas de la prosa sintética). La cuantización la firma mradermacher, un autor conocido en HuggingFace por publicar versiones GGUF de modelos abiertos para su uso en llama.cpp y entornos de inferencia local. El modelo base lo desarrolla el usuario `chartreuse-verte`.

Se trata de un modelo denso de aproximadamente 4.400 millones de parámetros (4.411.424.256 según los pesos en safetensors), lo que lo sitúa en la gama de 4B, manejable en GPUs de consumo. Las etiquetas del repositorio apuntan a que la arquitectura deriva de la familia Qwen3, aunque la model card del cuantizador no aporta detalles sobre el entrenamiento, el dataset ni el proceso de ajuste. El modelo está orientado exclusivamente al inglés (`language: en`).

Su relevancia práctica está en el nicho: no es un modelo de propósito general, sino una herramienta de posprocesado de texto pensada para reescribir borradores, adaptar registros y estilo, y eliminar patrones repetitivos o artificiosos. Al distribuirse en GGUF con cuantizaciones desde 1,9 GB, puede ejecutarse en portátiles y equipos sin GPU dedicada, lo que facilita integrarlo en pipelines de edición o preprocesado de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3 segun las etiquetas del repositorio; no confirmado en la model card) |
| Parametros totales | 4.411.424.256 (~4,4 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens segun LLM Explorer; no confirmado en la model card del cuantizador |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la informacion proporcionada. Las etiquetas del repositorio incluyen `qwen3`, lo que sugiere que el modelo base parte de la arquitectura Qwen3 de 4B, un transformer denso con atencion por grupos (GQA) y decodificacion estandar. No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como SFT, RLHF o DPO.

El valor anadido de este repositorio concreto no esta en el entrenamiento, sino en la cuantizacion: mradermacher ha generado doce variantes GGUF a partir del modelo original, cubriendo desde 1,9 GB (Q2_K) hasta 8,9 GB (f16, 16 bits por peso). La model card indica que se trata de cuantizaciones estaticas y que no hay versiones con imatrix o ponderadas disponibles en el momento de la publicacion, aunque el autor deja abierta la posibilidad de generarlas si se solicita.

## Capacidades

- Reescritura de prosa: reformulacion de textos manteniendo el contenido pero alterando la forma.
- Transferencia de estilo: adaptacion de un texto a un registro o voz determinados.
- Limpieza de texto generado por IA (`deslop`): eliminacion de patrones repetitivos, muletillas y estructuras tipicas de la prosa sintetica.
- Escritura creativa: generacion y reescritura de fragmentos narrativos o descriptivos.
- Conversacion: el repositorio incluye la etiqueta `conversational` y `endpoints_compatible`, lo que indica compatibilidad con plantillas de chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible; el modelo no esta orientado a tareas de razonamiento.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Limpieza de corpus generados sinteticamente: el modelo puede reescribir texto producido por otros LLM para eliminar las marcas estilisticas habituales antes de usarlo como datos de entrenamiento o publicarlo.
- Edicion y posprocesado de borradores: en un flujo de redaccion asistida, se usa como segunda pasada sobre un texto generado para mejorar la fluidez y variar la sintaxis.
- Adaptacion de tono en comunicacion corporativa: reescritura de notas internas, correos o documentacion para ajustarlas a un registro formal o divulgativo concreto.
- Asistencia a escritores de ficcion: reescritura de parrafos con un estilo objetivo distinto (mas seco, mas lirico, mas directo) sin alterar la trama.
- Normalizacion de estilo en publicaciones: aplicar una voz editorial uniforme a textos enviados por colaboradores externos con estilos dispares.
- Preprocesado en pipelines de moderacion o analisis: reescritura de contenido para variar la formulacion antes de alimentar sistemas posteriores de clasificacion o deteccion.
- Generacion de variantes A/B de copy: produccion de varias versiones de un mismo mensaje publicitario o de una descripcion de producto con estilos diferenciados.
- Herramienta local de escritura sin conexion: al ejecutarse en GGUF sobre llama.cpp u Ollama, permite reescribir texto en un portatil sin enviar datos a servicios en la nube, relevante por privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar cache KV):
  - Q2_K: ~1,9 GB
  - Q3_K_S: ~2,2 GB; Q3_K_M: ~2,3 GB; Q3_K_L: ~2,5 GB
  - IQ4_XS: ~2,6 GB
  - Q4_K_S: ~2,7 GB; Q4_K_M: ~2,8 GB (recomendado por el autor)
  - Q5_K_S: ~3,2 GB; Q5_K_M: ~3,3 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,8 GB
  - f16: ~8,9 GB
- A la cifra de pesos hay que sumar la cache KV, que crece con la longitud de contexto. Con 32.768 tokens de contexto, la cache puede anadir varios GB adicionales segun el modelo y la configuracion.
- GPU de consumo: cualquier GPU con 4 GB o mas puede ejecutar las cuantizaciones Q4_K_M e inferiores. Una RTX 3060 de 12 GB, una RTX 4060, una RTX 4070 o una RTX 4090 pueden alojar sin problema incluso la version f16. Tambien es viable la inferencia parcial en CPU con llama.cpp para los quants bajos.
- GPU de centro de datos: no es necesario recurrir a A100 o H100 para un modelo de este tamano; sobredimensionadas salvo para despliegues con alta concurrencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, kobold.cpp y cualquier runtime compatible con GGUF. La inferencia con transformers requiere el modelo base en safetensors, no estos archivos.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| prose-rewriter-4b-v2.2 (este) | ~4,4 B | 32.768 tokens (segun LLM Explorer) | AGPL-3.0 | GGUF, safetensors | HuggingFace |
| Qwen3-4B | ~4,0 B | no disponible en la informacion proporcionada | Apache-2.0 | safetensors, GGUF | HuggingFace |
| Llama 3.2 3B Instruct | ~3,2 B | no disponible en la informacion proporcionada | Llama 3.2 Community License | safetensors, GGUF | HuggingFace |

Nota: los datos de Qwen3-4B y Llama 3.2 3B no provienen de la informacion suministrada en esta busqueda y se incluyen solo como referencia de categoria; conviene verificarlos en sus repositorios oficiales. No se han encontrado modelos comparables especificamente orientados a reescritura de prosa y eliminacion de marcas de IA dentro de la informacion disponible, por lo que la comparativa directa por tarea no esta disponible.

## Limitaciones y advertencias

- Modelo especializado: no esta disenado para razonamiento, matematicas, generacion de codigo ni tareas de agente. Usarlo fuera de su dominio producira resultados pobres.
- Solo ingles: no hay soporte multilingue declarado. Aplicarlo a texto en castellano dara resultados poco fiables.
- Riesgo de alucinacion: como cualquier modelo generativo, puede introducir informacion no presente en el texto original durante la reescritura, alterando el significado.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no puede evaluarse que sesgos puede arrastrar.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Su uso en servicios en red puede obligar a liberar el codigo fuente de la aplicacion que lo integra. Es un punto critico para uso comercial propietario y conviene revisarlo con asesoria legal.
- Ausencia de benchmarks: no hay evaluaciones publicadas que permitan estimar la calidad frente a alternativas, ni datos de perplexity de las cuantizaciones.
- Cuantizaciones bajas: Q2_K y Q3_K pueden degradar notablemente la calidad de la prosa generada, que es precisamente el nucleo de la tarea del modelo. Para produccion conviene partir de Q5_K_M o superior.
- Model card escasa: el repositorio del cuantizador no documenta el modelo base; para entender el entrenamiento hay que acudir al repositorio de `chartreuse-verte`, que tampoco se ha podido consultar en detalle aqui.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/prose-rewriter-4b-v2.2-GGUF
- Modelo base: https://huggingface.co/chartreuse-verte/prose-rewriter-4b-v2.2
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#prose-rewriter-4b-v2.2-GGUF
- Version alternativa con imatrix: https://huggingface.co/mradermacher/prose-rewriter-4b-v2-i1-GGUF
- Ficha en LLM Explorer: https://llm-explorer.com/model/chartreuse-verte%2Fprose-rewriter-4b-v2,3oAHQnIGSn4QYiEypmMv5s
- Ficha en free2aitools: https://free2aitools.com/model/mradermacher/prose-rewriter-4b-v2-gguf
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Nethype GmbH (empresa que da soporte al autor): https://www.nethype.de/
