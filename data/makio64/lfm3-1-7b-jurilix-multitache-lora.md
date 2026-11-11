# Makio64/LFM3-1.7B-jurilix-multitache-lora

## Resumen

Makio64/LFM3-1.7B-jurilix-multitache-lora es un adaptador LoRA publicado en Hugging Face por el usuario Makio64, construido sobre el modelo base LFM3-1.7B (familia Liquid AI Foundation Model). El nombre sugiere un ajuste fino orientado a tareas juridicas y multitarea ("jurilix-multitache"), aunque la model card no documenta el dataset de entrenamiento, el regimen de hiperparametros ni los objetivos concretos del ajuste.

El repositorio contiene unicamente pesos en formato GGUF y ocupa 0,4 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo. El dato de parametros reportado en safetensors (16.468.736, aproximadamente 16,5 millones) corresponde a los tensores del adaptador, no al modelo base, que por nomenclatura tendria del orden de 1.700 millones de parametros.

La relevancia practica es limitada pero concreta: ofrece un punto de partida para despliegues en local de un modelo pequeno especializado en dominio juridico en castellano (presumiblemente), con la ventaja de un peso minimo y la posibilidad de combinarlo con el modelo base en pipelines de inferencia cuantizados. La ausencia de licencia, idiomas declarados y benchmarks obliga a tratar el artefacto con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre LFM3-1.7B; arquitectura del base no disponible en la informacion proporcionada |
| Parametros totales | 16.468.736 (tensores del adaptador en safetensors) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo contiene pesos en formato GGUF); niveles concretos no disponibles |
| Idiomas soportados | no disponible (el nombre sugiere castellano/frances por "jurilix", sin confirmacion) |
| Licencia | no disponible |
| Formato de pesos | GGUF y safetensors (adaptador) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de baja dimensionalidad que se suman a las proyecciones del modelo base LFM3-1.7B. El numero de parametros del adaptador (16,5 M) es coherente con un rango bajo aplicado a un subconjunto de capas de un transformer de ~1,7 B de parametros. No se dispone de informacion sobre el rango (r), el alpha, las capas objetivo ni la estrategia de merge.

No hay datos publicados sobre el dataset de entrenamiento, el numero de tokens, la composicion (documentos juridicos, pares instruccion-respuesta, tareas multitarea), ni sobre si se aplico RLHF, DPO o simple SFT supervisado. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Toda esta seccion debe considerarse no disponible y no verificable a partir de la informacion proporcionada.

## Capacidades

- Generacion de texto especializada en dominio juridico (presunto, segun el nombre del adaptador; no verificado).
- Enfoque multitarea (presunto, segun el sufijo "multitache"; tareas concretas no documentadas).
- Compatibilidad con el modelo base LFM3-1.7B, por lo que hereda sus capacidades generales de generacion, razonamiento basico y comprension de lenguaje.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Asistencia en redaccion de borradores juridicos: el adaptador puede emplearse para generar clausulas, resumenes de contratos o escritos preliminares, siempre con revision humana obligatoria dado que no hay benchmarks publicados.
- Clasificacion y etiquetado de documentos legales: aprovechando el ajuste multitarea, podria usarse para categorizar contratos, demandas o resoluciones en un pipeline de gestion documental.
- Extraccion de entidades y campos en textos juridicos: integrado con un modelo base cuantizado en GGUF, permite ejecutar en local la identificacion de partes, fechas, importes y referencias normativas.
- Prototipado rapido de asistentes legales en local: el tamano reducido del adaptador (0,4 GB) facilita experimentar con distintos modelos base sin coste de almacenamiento significativo.
- Investigacion academica sobre adaptacion de dominio: sirve como caso de estudio de LoRA aplicado a un modelo de ~1,7 B en un dominio especializado, con la salvedad de que faltan hiperparametros documentados.
- Despliegue en entornos con restricciones de conectividad: al poder ejecutarse con llama.cpp u Ollama sobre el base en GGUF, es viable en estaciones de trabajo sin GPU dedicada para tareas de baja concurrencia.
- Filtrado y triaje en bufetes o departamentos legales: preclasificacion de consultas entrantes antes de derivarlas a un especialista humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base LFM3-1.7B. Para un base de ~1,7 B en cuantizacion Q4 se estiman del orden de 1,5-2,5 GB de VRAM; en FP16, en torno a 3,5-4,5 GB. Cifras orientativas, no confirmadas por la informacion proporcionada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; el adaptador en si no anade requisitos significativos.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU con 6 GB o mas al usar el base en GGUF Q4; no confirmado.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI requeririan convertir el adaptador y fusionarlo con el base en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Makio64/LFM3-1.7B-jurilix-multitache-lora | 16,5 M (adaptador) | no disponible | no disponible | GGUF, safetensors | Ajuste de dominio juridico sobre LFM3-1.7B |
| Modelo base LFM3-1.7B | ~1,7 B (por nomenclatura) | no disponible | no disponible | no disponible | Base sobre el que se aplica el LoRA |
| Alternativas de dominio juridico en castellano | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables verificables en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo elevado de alucinacion en dominio juridico: sin benchmarks ni evaluacion, no hay garantia de fidelidad normativa; cualquier salida debe ser revisada por un profesional.
- Sesgos desconocidos: al no documentarse el dataset, no pueden evaluarse sesgos de genero, ideologicos o jurisdiccionales.
- Idiomas no declarados: la cobertura multilingue es incierta; el nombre sugiere castellano o frances, pero no esta confirmado.
- Contexto desconocido: se desconoce la ventana efectiva del base y si el adaptador la preserva.
- Dependencia del modelo base: el rendimiento final depende de la version concreta de LFM3-1.7B utilizada y de la correcta aplicacion del adaptador.
- Popularidad muy baja (0 likes, 212 descargas): no hay validacion por parte de la comunidad.
- Fechas de creacion y actualizacion en 2026: verificar la vigencia y posibles actualizaciones del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Makio64/LFM3-1.7B-jurilix-multitache-lora
