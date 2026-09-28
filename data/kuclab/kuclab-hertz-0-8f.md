# KucLab/kuclab-hertz-0.8f

## Resumen

KucLab Hertz 0.8F es un ajuste fino de Qwen/Qwen3.5-9B desarrollado por KucLab, orientado a tareas de ciencia, tecnologia, ingenieria y matematicas (STEM) y programacion en checo e ingles. Se presenta como la continuacion de Hertz 0.8, empleando la misma receta QLoRA sobre un corpus propio, `kuclab_hertz_0.8f`, en formato alpaca. El modelo es relevante para quien necesite un asistente bilingue checo/ingles especializado en dominios tecnicos, con pesos publicados bajo licencia Apache 2.0 y varias opciones de despliegue local.

El modelo cuenta con 8.953.803.264 parametros totales (unos 8,95 mil millones) heredados de su base, una ventana de contexto de 32.768 tokens (num_ctx) y se distribuye tanto en safetensors bf16 (carpeta `merged/`) como en GGUF q4_k_m (aproximadamente 5,3 GB) y en adaptador LoRA. Al estar construido sobre Qwen3.5-9B, conserva la licencia Apache 2.0 del modelo original, lo que permite uso comercial sin restricciones adicionales.

El repositorio tiene 25,1 GB y, en el momento de la consulta, no registra descargas ni interacciones en HuggingFace. La informacion publicada se centra en el proceso de ajuste, el formato de los pesos y las instrucciones de despliegue con Ollama; no se detallan resultados de benchmarks ni comparativas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en detalle; heredada de Qwen/Qwen3.5-9B |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica (no se indica arquitectura MoE) |
| Longitud de contexto | 32.768 tokens (num_ctx) |
| Tipos de cuantizacion | GGUF q4_k_m (noMTP); pesos completos en bf16; adaptador LoRA |
| Idiomas soportados | Checo (cs) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (q4_k_m), adaptador LoRA |

## Arquitectura y entrenamiento

La ficha del autor no describe en detalle la arquitectura interna; el modelo hereda la de su base, Qwen/Qwen3.5-9B, y se distribuye como un ajuste fino fusionado. El metodo de entrenamiento fue QLoRA con rango r=16, alpha=32 y cuantizacion a 4 bits, durante 2 epocas. Posteriormente, el adaptador se fusiono al modelo en bf16 y, a partir de esa version, se genero la cuantizacion GGUF q4_k_m (noMTP). El entrenamiento se realizo el 13 de septiembre de 2026.

Los datos de entrenamiento provienen del corpus `kuclab_hertz_0.8f`, en formato alpaca, orientado a contenido STEM (fisica, quimica, biologia, matematicas) y programacion. Las etiquetas del repositorio incluyen `distillation` y `distilled`, lo que sugiere el uso de tecnicas de destilacion, aunque la informacion proporcionada no detalla el numero de tokens ni la composicion exacta del dataset. No se menciona el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en checo e ingles.
- Razonamiento y resolucion de problemas en dominios STEM: fisica, quimica, biologia y matematicas.
- Generacion y asistencia en programacion.
- Naturaleza especializada: el entrenamiento esta enfocado a contexto tecnico y cientifico, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es de generacion de texto.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia STEM bilingue: el modelo puede responder consultas de fisica, quimica y biologia en checo o ingles, aprovechando su ajuste especifico sobre el corpus `kuclab_hertz_0.8f` y su contexto de 32.768 tokens para mantener conversaciones tecnicas extensas.
- Generacion de codigo: dado su enfoque en programacion, resulta util para autocompletar funciones, explicar fragmentos de codigo o proponer refactorizaciones en entornos de desarrollo integrados y pipelines de CI/CD.
- Tutoria y material educativo: puede redactar explicaciones paso a paso de ejercicios de matematicas o ciencias, adecuado para plataformas de aprendizaje dirigidas a estudiantes checohablantes.
- Documentacion tecnica: sirve para redactar y traducir documentacion de ingenieria entre checo e ingles, manteniendo terminologia especializada.
- Atencion al cliente tecnica bilingue: con 32.768 tokens de contexto, puede gestionar conversaciones multi-turno sobre productos tecnicos en checo e ingles.
- Revision y resumen de articulos cientificos: puede condensar textos de investigacion en dominios STEM y extraer conclusiones clave dentro de su ventana de contexto.
- Chats de soporte a la investigacion: asistencia en la formulacion de hipotesis o en la interpretacion de resultados experimentales en entornos academicos.
- Integracion en herramientas locales: al distribuirse en GGUF y ofrecerse un Modelfile de Ollama, puede desplegarse en estaciones de trabajo sin conexion para tareas de generacion de texto tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16 (pesos completos en safetensors): alrededor de 18 GB solo para los pesos, mas memoria para el contexto y los estados de atencion.
- VRAM estimada en GGUF q4_k_m: aproximadamente 5,3 GB segun el tamano del archivo indicado por el autor, con margen adicional para el contexto.
- GPU recomendadas: A100 o H100 para bf16 y contextos largos; RTX 4090 o RTX 3090 para cuantizacion q4 con comodidad.
- Compatibilidad con GPU de consumo: si; la version q4_k_m (unos 5,3 GB) cabe en tarjetas con 8 GB o mas, como la RTX 3060 de 12 GB.
- Opciones de despliegue: Ollama (se proporciona un Modelfile), llama.cpp para GGUF, y vLLM o TGI para los pesos safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| KucLab Hertz 0.8F | ~8,95B | 32.768 tokens | Apache 2.0 | STEM y programacion en checo/ingles | safetensors, GGUF, LoRA |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Apache 2.0 | Proposito general | safetensors (segun modelo base) |
| Otras alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar de forma directa con el modelo base, Qwen/Qwen3.5-9B, del que Hertz 0.8F hereda tamano, licencia y contexto. No se dispone de datos de rendimiento ni de especificaciones de modelos alternativos de la misma categoria en la informacion facilitada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un ajuste sobre Qwen3.5-9B pueden heredarse los sesgos del corpus base y del dataset de ajuste.
- Riesgo de alucinacion: presente en cualquier modelo de este tipo, especialmente en dominios tecnicos donde puede generar referencias, formulas o datos incorrectos; requiere verificacion.
- Limitaciones de idioma: el soporte declarado se limita a checo e ingles; el rendimiento en otros idiomas, incluido el castellano, no esta garantizado.
- Limitaciones de contexto: la ventana es de 32.768 tokens, por lo que documentos muy extensos deben fragmentarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial, redistribucion y modificacion, manteniendo el aviso de licencia y atribucion.
- Advertencias para produccion: el modelo no registra descargas ni validacion externa; no hay benchmarks publicados, por lo que se recomienda evaluarlo con datos propios antes de desplegarlo. Las etiquetas mencionan destilacion, pero no se detalla la procedencia exacta de los datos de entrenamiento.
- El repositorio pesa 25,1 GB, lo que exige espacio en disco y ancho de banda considerables para su descarga completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KucLab/kuclab-hertz-0.8f
- Dataset de entrenamiento: https://huggingface.co/datasets/KucLab/kuclab_hertz_0.8f
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Sitio de KucLab: https://kuclab.org
- Modelfile para Ollama: https://huggingface.co/KucLab/kuclab-hertz-0.8f/resolve/main/Modelfile
