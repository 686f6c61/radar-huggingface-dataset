# sagea-ai/SAGE-2.6-Celer-Mid

## Resumen

SAGE-2.6-Celer-Mid es un modelo de lenguaje publicado por sagea-ai en Hugging Face bajo acceso restringido (gated). Cuenta con 9.653.104.368 parametros totales segun los pesos en safetensors, lo que lo situa en la franja de los ~9,6 mil millones de parametros, un tamano intermedio que permite despliegue en hardware de una sola GPU de gama alta. El repositorio ocupa 19,3 GB y se distribuye exclusivamente en formato safetensors.

El modelo esta etiquetado con los identificadores "sage", "SAGE" y "Celer", y declara soporte para ingles (en) y nepalí (ne). Incorpora una referencia a un paper con identificador arXiv:2604.14168, aunque no se dispone de detalles sobre su contenido en la informacion proporcionada. La ficha de Hugging Face no especifica pipeline, licencia ni resultados de evaluacion.

La relevancia de este modelo radica en su tamano contenido (~9,6B) combinado con soporte multilingue que incluye nepalí, un idioma poco representado en los modelos abiertos habituales. No obstante, la ausencia de licencia declarada, de benchmarks publicados y de documentacion tecnica accesible limita seriamente su evaluacion para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.653.104.368 (~9,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/otros no publicadas) |
| Idiomas soportados | en (ingles), ne (nepalí) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (transformer denso, MoE, hibrido u otra), ni sobre el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica referencia tecnica es el identificador arXiv:2604.14168 asociado en las etiquetas del repositorio, cuyo contenido no esta disponible en la informacion proporcionada.

El unico dato estructural verificable es el recuento de parametros a partir de los pesos safetensors: 9.653.104.368 parametros. El tamano del repositorio (19,3 GB) es coherente con pesos en precision de 16 bits para ese numero de parametros, lo que sugiere que no se publican variantes cuantizadas en el propio repositorio.

## Capacidades

- Generacion de texto en ingles y nepalí, segun los idiomas declarados en la model card.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues limitadas a los idiomas declarados (en, ne); no se confirma soporte de castellano.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Procesamiento de texto en nepalí: el modelo declara soporte de nepalí, un idioma con escasa cobertura en modelos abiertos, por lo que podria emplearse en tareas de traduccion, resumen o generacion de contenido para ese idioma, previa validacion empirica de la calidad.
- Generacion de texto en ingles en aplicaciones de tamano medio: con ~9,6B de parametros puede ejecutarse en una sola GPU de 24 GB en precision reducida, lo que lo hace apto para prototipos y servicios de generacion de texto autoalojados.
- Investigacion comparativa multilingue: util como punto de comparacion en estudios sobre cobertura de idiomas de bajos recursos, dado su soporte declarado de nepalí.
- Fine-tuning especifico de dominio: el formato safetensors y el tamano contenido permiten ajuste fino con LoRA en hardware de una sola GPU de gama alta, si la licencia lo permite (no disponible).
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en local, encaja en escenarios donde los datos no pueden salir de la infraestructura propia.
- Evaluacion y auditoria de modelos: su condicion de modelo gated con documentacion escasa lo convierte en objeto de estudio para analisis de transparencia y reproducibilidad en modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 19-20 GB solo para los pesos (9,65B x 2 bytes), mas overhead de cache KV; en cuantizacion de 8 bits, ~10-11 GB; en 4 bits, ~5-6 GB (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; GPUs de 16 GB o menos requeririan cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 y en GPUs de 12-16 GB con cuantizacion a 8 o 4 bits, siempre que se generen las cuantizaciones (no publicadas en el repo).
- Opciones de despliegue: vLLM, TGI o llama.cpp/Ollama previa conversion a GGUF; no se documenta compatibilidad oficial con ningun framework.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAGE-2.6-Celer-Mid | ~9,6B | no disponible | en, ne | no disponible | Gated en Hugging Face |
| Alternativas de ~7-9B (p. ej. familia Llama, Mistral, Gemma) | 7-9B | 8k-128k segun modelo | decenas de idiomas | licencias abiertas o comunitarias | publicas |
| Alternativas centradas en idiomas del sur de Asia | no disponible | no disponible | varios idiomas regionales | variable | variable |

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a parametros, idiomas y condiciones de acceso. Los nombres genericos de la segunda y tercera fila se incluyen solo como categoria de referencia, sin datos verificados en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite uso comercial; tratar como no apto para produccion hasta confirmacion legal.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la integracion y a la reproducibilidad.
- Ausencia total de benchmarks publicados: no hay evidencia empirica de calidad en ninguna tarea.
- Documentacion tecnica practicamente inexistente: sin arquitectura, contexto ni detalles de entrenamiento, la evaluacion queda limitada a pruebas propias.
- Cobertura de idiomas reducida (en, ne): no se confirma soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- Popularidad minima (0 descargas, 1 like en el momento de la consulta): sin comunidad que valide el modelo ni reporte incidencias.
- Referencia a un paper (arXiv:2604.14168) cuyo contenido no se ha podido verificar en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/sagea-ai/SAGE-2.6-Celer-Mid
- Paper referenciado en las etiquetas: arXiv:2604.14168 (contenido no verificado)
