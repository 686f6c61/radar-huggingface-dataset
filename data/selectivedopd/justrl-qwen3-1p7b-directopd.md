# SelectiveDOPD/JustRL-Qwen3-1p7b-DirectOPD

## Resumen

JustRL-Qwen3-1p7b-DirectOPD es un checkpoint de ajuste fino publicado por el usuario SelectiveDOPD en HuggingFace, construido sobre la arquitectura de la familia Qwen3 en su variante de 1.700 millones de parámetros. Los pesos en safetensors suman 2.031.739.904 parámetros totales, lo que confirma que se trata de un modelo denso de escala pequeña. La model card es mínima: únicamente indica que el checkpoint se ha subido desde la ruta `justrl_qwen3_1p7b` dentro de los experimentos denominados BiDirect-OPD, sin documentar datos de entrenamiento, licencia ni idiomas.

La rama `main` contiene el checkpoint `global_step_300`, y el repositorio expone además catorce ramas con estados intermedios del entrenamiento, desde `global_step_20` hasta `global_step_280` en intervalos de veinte pasos. Esta estructura convierte al repositorio en un artefacto útil para estudiar la evolución de un proceso de ajuste (por los nombres, aparentemente basado en aprendizaje por refuerzo, aunque esto no se documenta) más que en un modelo listo para producción. El tamaño del repositorio, 16,3 GB, es muy superior a los aproximadamente 4,1 GB que ocuparían los pesos en bf16, lo que apunta a pesos en precisión completa y a la acumulación de checkpoints en las distintas ramas.

El interés actual del modelo es limitado pero específico: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones publicadas, y con licencia no declarada. Resulta adecuado para reproducir curvas de entrenamiento, comparar checkpoints intermedios y experimentar con técnicas de RL sobre modelos pequeños, pero no como base para un despliegue comercial sin una revisión previa de licencia y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Qwen3 (deducido del tag `qwen3` y del sufijo `1p7b`; no documentado en la model card) |
| Parametros totales | 2.031.739.904 (~2,03 mil millones) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE (mixture of experts) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline declarado | `text-generation` |
| Etiquetas relevantes | `qwen3`, `text-generation`, `conversational`, `text-generation-inference`, `endpoints_compatible`, `region:us` |
| Checkpoints publicados | `global_step_300` en `main`; ramas `global_step_20` a `global_step_280` en pasos de 20 |
| Tamano del repositorio | 16,3 GB |
| Fecha de creacion registrada | 2026-09-10 |
| Ultima actualizacion registrada | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue el esquema habitual de la familia Qwen3: un transformer decoder-only con atención causal, pensado para generación de texto y conversación. El recuento exacto de parámetros (2.031.739.904) coincide con la escala de un modelo de 1.700 millones de parámetros nominales una vez contabilizadas las matrices de embedding, lo que respalda la hipótesis de que se parte de Qwen3-1.7B. No obstante, la model card no especifica número de capas, dimensión oculta, número de cabezas de atención, uso de GQA, tipo de posición (RoPE u otros) ni vocabulario, por lo que estos detalles quedan como no disponibles.

Tampoco se documenta el proceso de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, la posible fase de SFT previa, ni sobre el uso de RLHF, DPO u otra variante de optimización. Los nombres del repositorio (`JustRL`, `DirectOPD`, `BiDirect-OPD`) y la costumbre de guardar checkpoints cada veinte pasos apuntan a un entrenamiento por refuerzo con evaluación periódica, pero se trata de una inferencia a partir de la nomenclatura, no de un dato confirmado. La innovación técnica destacable, si puede llamarse así, es la propia estructura del repositorio: la disponibilidad de quince checkpoints encadenados permite trazar la evolución del modelo a lo largo del entrenamiento sin necesidad de reentrenarlo.

## Capacidades

- Generacion de texto: es la funcion declarada de forma explicita mediante el pipeline `text-generation` y la etiqueta homonima.
- Conversacion: la etiqueta `conversational` indica que el modelo esta preparado para dialogos con formato de chat, aunque no se detalla la plantilla de mensajes empleada.
- Integracion en infraestructura de inferencia: las etiquetas `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad con Text Generation Inference y con el esquema de endpoints de HuggingFace.
- Analisis de trayectorias de entrenamiento: la publicacion de checkpoints intermedios permite evaluar la evolucion del modelo a lo largo del ajuste.
- Razonamiento, matematicas y generacion de codigo: no documentado en la informacion disponible.
- Tool calling y function calling: no documentado.
- Comportamiento agentico y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible; el campo de idiomas esta vacio en la ficha.
- Vision, audio u otras modalidades: no disponible; las etiquetas no incluyen ninguna modalidad adicional.
- Modo de razonamiento explicito (thinking mode): no documentado, pese a que la familia Qwen3 lo incorpora en algunas variantes.

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el repositorio ofrece quince checkpoints del mismo entrenamiento, lo que permite estudiar como evolucionan las respuestas y la calidad del modelo paso a paso y detectar inestabilidades o colapsos de politica sin coste adicional de computo.
- Reproduccion de curvas de entrenamiento: un equipo que entrene su propio modelo con una receta similar puede comparar sus checkpoints intermedios con los de este repositorio para validar su pipeline, siempre que asuma que la receta exacta no esta documentada.
- Prototipado local de asistentes conversacionales: con aproximadamente 2.000 millones de parametros, el modelo cabe en GPUs de consumo en bf16 y en equipos modestos con cuantizacion de 4 bits, lo que lo hace util para validar ideas de producto antes de escalar a modelos mayores.
- Destilacion y generacion de datos sinteticos: al ser pequeno y rapido de ejecutar, puede emplearse como generador de datos o como alumno en un proceso de destilacion desde un modelo mayor, siempre que se verifique la licencia antes de reutilizar sus salidas.
- Ajuste fino especifico de dominio: es un candidato razonable para LoRA o QLoRA sobre dominios concretos (soporte tecnico, clasificacion de texto, extraccion de informacion) por su bajo coste de entrenamiento, aunque requeriria una evaluacion propia previa.
- Pruebas de integracion en pipelines de inferencia: sus etiquetas `text-generation-inference` y `endpoints_compatible` lo hacen util como modelo de juguete para validar despliegues con TGI, vLLM o endpoints compatibles con la API de OpenAI antes de sustituirlo por un modelo mayor.
- Experimentacion educativa: sirve para ilustrar en docencia o formacion interna como se publican checkpoints intermedios y como se comparan entre si, dado su tamano manejable y su estructura de ramas.
- Evaluacion comparativa de tecnicas de cuantizacion: partiendo de los safetensors publicados se puede convertir el modelo a GGUF o AWQ y medir la degradacion en tareas concretas, aunque el autor no publique esas conversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion, y los resultados de la busqueda web no contienen informacion relacionada con el modelo. No se dispone por tanto de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni de comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 4,1 GB solo para los pesos, mas la cache KV y las activaciones; en la practica, entre 5 y 7 GB para contexto corto y lote unitario.
- VRAM estimada en fp32: unos 8,1 GB para los pesos; el tamano del repositorio (16,3 GB) sugiere que puede haber pesos en precision completa y varios checkpoints almacenados.
- VRAM estimada en int8: en torno a 2,2 GB de pesos; unos 3-4 GB con overhead de ejecucion.
- VRAM estimada en int4 (por ejemplo, Q4_K_M tras conversion a GGUF): en torno a 1,2-1,3 GB de pesos; 2 GB o menos serian suficientes para contexto moderado.
- GPU de consumo: si, cabe holgadamente en cualquier GPU con 6-8 GB o mas, como una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090. En cuantizacion de 4 bits puede ejecutarse incluso en GPUs de 4 GB o en CPU.
- GPU de centro de datos: A100, H100 o similares no son necesarias para inferencia; solo tendrian sentido para reentrenar o ajustar el modelo.
- Opciones de despliegue: `transformers` de forma nativa, Text Generation Inference (etiqueta declarada), vLLM o SGLang con los pesos safetensors, y llama.cpp u Ollama previa conversion a GGUF, conversion que el autor no publica.
- Latencia y throughput: no disponible en la informacion proporcionada; no hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos publicados | Disponibilidad de benchmarks |
|---|---|---|---|---|---|
| JustRL-Qwen3-1p7b-DirectOPD | 2.031.739.904 | No disponible | No disponible | safetensors | No publicados |
| Qwen3-1.7B (modelo base de referencia) | ~2,03 mil millones | No disponible en esta busqueda | No disponible en esta busqueda | safetensors, GGUF en la familia | No verificados aqui |
| Llama 3.2 1B (referencia de escala) | ~1,24 mil millones | No disponible en esta busqueda | No disponible en esta busqueda | safetensors, GGUF | No verificados aqui |
| Gemma 3 1B (referencia de escala) | ~1 mil millones | No disponible en esta busqueda | No disponible en esta busqueda | safetensors, GGUF | No verificados aqui |

Los datos de los modelos de referencia no proceden de la informacion proporcionada en esta ficha: se incluyen unicamente como puntos de comparacion de escala y deben verificarse en sus fichas oficiales antes de citarlos. La diferencia principal de este repositorio frente a los modelos citados no esta en el rendimiento, que no se ha medido, sino en su naturaleza experimental: quince checkpoints de un mismo entrenamiento, sin licencia declarada y sin conversiones a cuantizacion.

## Limitaciones y advertencias

- Ausencia de model card tecnica: no se documentan datos de entrenamiento, composicion del dataset, numero de tokens ni metodo de optimizacion, lo que impide auditar el modelo o reproducir sus resultados.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Cualquier despliegue en produccion requiere contactar con el autor y aclarar los terminos, incluidos los del modelo base sobre el que se ha ajustado.
- Idiomas no declarados: no se puede asumir un soporte multilingue solido ni un rendimiento uniforme entre idiomas.
- Longitud de contexto no declarada: planificar aplicaciones con documentos largos sobre este checkpoint es arriesgado sin una medicion propia.
- Sin benchmarks publicados: no existe evidencia cuantitativa de calidad, por lo que cualquier eleccion del modelo debe basarse en una evaluacion interna.
- Riesgo de alucinacion: en modelos de esta escala el conocimiento factual es limitado y la probabilidad de inventar datos en tareas de conocimiento, matematicas o razonamiento encadenado es elevada, especialmente si el ajuste por refuerzo no ha ido precedido de una fase de instruccion cuidada.
- Riesgo de degradacion por RL sin SFT: si el entrenamiento se ha limitado a optimizar una recompensa sin una fase supervisada solida, es frecuente observar formatos de salida irregulares, repeticiones o deriva de estilo. No es verificable con la informacion disponible.
- Sesgos no evaluados: no se ha realizado ninguna evaluacion de sesgo, toxicidad o seguridad sobre este checkpoint.
- Sin validacion de la comunidad: cero descargas y cero likes implican que el modelo no ha sido probado ni reportado por terceros.
- Metadatos a revisar: la fecha de creacion registrada (10 de septiembre de 2026) y el tamano del repositorio (16,3 GB, muy superior a los pesos en bf16) son senales que conviene confirmar con el autor antes de integrar el modelo en un flujo de trabajo.
- Coste de almacenamiento: descargar todas las ramas implica descargar varios checkpoints completos; conviene clonar unicamente la rama necesaria.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-DirectOPD
- Rama principal con `global_step_300`: https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-DirectOPD/tree/main
- Ramas de checkpoints intermedios: `global_step_20`, `global_step_40`, `global_step_60`, `global_step_80`, `global_step_100`, `global_step_120`, `global_step_140`, `global_step_160`, `global_step_180`, `global_step_200`, `global_step_220`, `global_step_240`, `global_step_260`, `global_step_280`, accesibles como https://huggingface.co/SelectiveDOPD/JustRL-Qwen3-1p7b-DirectOPD/tree/global_step_XX
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Los resultados devueltos corresponden a paginas de soporte de Microsoft y no guardan relacion con esta ficha.
