# huggingface12341/zsf-c3

## Resumen

zsf-c3 es un modelo derivado por fine-tuning de `newsbang/adjudex-9b-v2`, un modelo base de aproximadamente 9.000 millones de parametros (8.392.695.024 exactos segun los pesos en safetensors). Lo publica el usuario `huggingface12341` en Hugging Face bajo licencia Apache 2.0, con acceso restringido (gated). El pipeline declarado es `feature-extraction`, aunque los tags incluyen `decision-model`, `zils` y `d3-flash`, lo que sugiere un uso orientado a extraccion de representaciones y toma de decisiones mas que a generacion de texto abierta.

La arquitectura declarada en los tags es `qwen3_5`, es decir, una variante de la familia Qwen 3.5, cargable con la libreria `transformers`. No se dispone de informacion publica sobre la longitud de contexto, los idiomas soportados ni los datos de entrenamiento del fine-tuning. El modelo tiene cero descargas y cero likes en el momento de la consulta, y el repositorio ocupa 16,8 GB, coherente con pesos en precision de 16 bits para unos 8.400 millones de parametros.

Su relevancia es limitada y muy especifica: se trata de un artefacto derivado de un modelo base de nicho (`adjudex-9b-v2`), con documentacion practicamente inexistente y acceso condicionado. Resulta util unicamente como punto de partida para quien ya conozca el modelo base y quiera evaluar esta variante concreta, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia qwen3_5 (segun tags) |
| Parametros totales | 8.392.695.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo de 16,8 GB sugiere fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | newsbang/adjudex-9b-v2 (fine-tune) |
| Pipeline declarado | feature-extraction |
| Acceso | restringido (gated) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `newsbang/adjudex-9b-v2`, que a su vez se etiqueta como `qwen3_5` en los tags del repositorio. Se trata, por tanto, de un transformer decoder-only de aproximadamente 8.400 millones de parametros, sin indicios de arquitectura MoE, SSM ni hibrida. Los tags `decision-model`, `zils` y `d3-flash` apuntan a un ajuste orientado a tareas de clasificacion o seleccion de decisiones y a extraccion de caracteristicas, coherente con el pipeline `feature-extraction`.

No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de fine-tuning, la existencia de RLHF, DPO u otra fase de alineamiento, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Extraccion de caracteristicas (embeddings) a partir de texto, segun el pipeline declarado `feature-extraction`.
- Modelado de decisiones, segun el tag `decision-model`; la naturaleza exacta de la tarea de decision no esta documentada.
- Generacion de texto: no confirmada de forma explicita, aunque la arquitectura base (Qwen 3.5) la soportaria tecnicamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: el pipeline declarado es `feature-extraction`, por lo que puede emplearse para vectorizar documentos y consultas en un indice vectorial, siempre que se valide la calidad de las representaciones con datos propios.
- Clasificacion y enrutamiento de decisiones: el tag `decision-model` sugiere su uso como cabecera o backbone para tareas de seleccion entre opciones (por ejemplo, enrutado de tickets o etiquetado), previa evaluacion empirica.
- Fine-tuning adicional sobre dominio propio: al ser un checkpoint de ~8,4 B con licencia Apache 2.0, sirve como base para ajustes especificos si el equipo ya confia en el modelo `adjudex-9b-v2`.
- Investigacion comparativa de fine-tunes: util para estudiar como un ajuste sobre `adjudex-9b-v2` altera las representaciones frente al modelo base.
- Prototipado interno de pipelines de NLP: su tamano permite desplegarlo en una GPU de 24 GB en fp16 con margen ajustado, o en cuantizacion de 8 bits en GPUs de 16 GB.
- Evaluacion de sesgos y robustez en modelos derivados: como artefacto con documentacion escasa, es un caso de estudio para auditar fine-tunes publicados sin ficha tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 20-24 GB como minimo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8,5-9 GB para pesos; 12-16 GB en total segun longitud de secuencia.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4,5-5 GB para pesos; viable en GPUs de 8-12 GB con contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para fp16 en contexto corto; RTX 4080/3090 (16-24 GB) en 8 bits.
- GPU de consumo: si cabe en RTX 4090 en fp16 con contexto limitado y en RTX 4070 Ti o superiores en cuantizacion de 4-8 bits.
- Opciones de despliegue: `transformers` (libreria declarada); vLLM, TGI, llama.cpp u Ollama solo si se generan artefactos GGUF o se confirma compatibilidad, lo cual no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| zsf-c3 | 8,39 B | no disponible | Apache 2.0 | gated | Fine-tune de adjudex-9b-v2, pipeline feature-extraction |
| newsbang/adjudex-9b-v2 (base) | ~9 B | no disponible | no disponible en esta ficha | no disponible | Modelo base del que deriva zsf-c3 |
| Qwen3 8B (familia de referencia) | ~8 B | no disponible en esta ficha | Apache 2.0 (segun familia) | publico | Referencia arquitectonica por el tag qwen3_5 |

La comparativa con alternativas consolidadas (Llama 3.1 8B, Mistral 7B, Qwen3 8B) no puede completarse con datos verificados en la informacion proporcionada; se indica como no disponible.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay ficha tecnica, card detallada ni resultados de evaluacion publicados.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos, lo que anade friccion a cualquier pipeline automatizado.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- Idiomas no declarados: no se puede asumir soporte multilingue sin evaluacion previa.
- Longitud de contexto desconocida: limita el diseno de aplicaciones con documentos largos o conversaciones multi-turno.
- Riesgo de alucinacion: no evaluado; al ser un fine-tune orientado a decision y extraccion, la generacion libre puede degradarse respecto al modelo base.
- Sesgos: no documentados; el dataset de fine-tuning es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `newsbang/adjudex-9b-v2`, cuyos terminos no se detallan en esta informacion.
- Para produccion: exigiria una evaluacion interna completa (calidad de embeddings, robustez, latencia) antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsf-c3
- Modelo base: https://huggingface.co/newsbang/adjudex-9b-v2
- Repositorio de la familia Qwen (referencia arquitectonica): https://github.com/QwenLM/Qwen3
