# Edge0/Edge0-120B-q3k

## Resumen

Edge0-120B-q3k es una cuantizacion GGUF de 4 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Edge0 bajo licencia Apache 2.0. El nombre comercial sugiere 120B de parametros, pero los pesos reales en safetensors del repositorio suman 4.947.698.560 parametros (aproximadamente 4,95 mil millones), una discrepancia sustancial entre la denominacion y el contenido efectivo del checkpoint. El modelo se presenta como una arquitectura MoE (mixture of experts) con una variante que el autor denomina "latent-moe", orientada a inferencia en el borde (edge inference).

La relevancia de esta publicacion es limitada pero ilustrativa: se trata de un ejercicio de cuantizacion sobre un modelo base de Qwen, empaquetado en formato GGUF y etiquetado para casos de uso de agentes y generacion de codigo. El repositorio ocupa 92,3 GB, un tamano desproporcionado respecto al numero de parametros declarados, lo que sugiere que el artefacto incluye multiples archivos o metadatos adicionales no reflejados en el recuento de safetensors.

No se dispone de informacion sobre el contexto maximo, los idiomas soportados ni los detalles del entrenamiento o la cuantizacion mas alla de las etiquetas del repositorio. Cualquier evaluacion practica deberia tratar esta ficha como una descripcion del artefacto publicado, no como una validacion de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con variante "latent-moe" segun etiquetas del autor; detalles no disponibles |
| Parametros totales | 4.947.698.560 (segun safetensors); la denominacion comercial indica 120B, discrepancia no aclarada |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (etiqueta "4-bit"); el sufijo "q3k" sugiere cuantizacion tipo Q3_K, no confirmado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (etiqueta "gguf"); el repositorio contiene safetensors con 4.947.698.560 parametros |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Biblioteca | edge0 |
| Tamano del repositorio | 92,3 GB |

## Arquitectura y entrenamiento

El autor etiqueta el modelo como MoE y "latent-moe", termino que no corresponde a una arquitectura estandar documentada en la literatura y que no se describe en la model card. No se especifica el numero de expertos, el mecanismo de enrutamiento, la dimension latente ni la proporcion de parametros activos por token. Tampoco se detalla si la arquitectura subyacente es un transformer denso modificado o una variante con capas de atencion dispersa.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones como decodificacion especulativa o atencion lineal. El modelo se presenta como una cuantizacion de Qwen/Qwen3.8-Flash-Next, por lo que las decisiones de entrenamiento corresponderian al modelo base, del que tampoco se aportan datos en la informacion disponible.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" y el pipeline text-generation.
- Orientacion a agentes: las etiquetas incluyen "agent", lo que sugiere soporte previsto para flujos multi-paso, aunque no se documenta tool calling ni function calling.
- Generacion de codigo: la etiqueta "coding" indica un enfoque hacia tareas de programacion, sin benchmarks que lo respalden.
- Inferencia en el borde: la etiqueta "edge-inference" y el formato GGUF apuntan a despliegue en hardware limitado.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con infraestructura de serving estandar.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional local: el formato GGUF y la cuantizacion de 4 bits permiten ejecutar el modelo en estaciones de trabajo sin GPU dedicada, gestionando dialogos multi-turno con un consumo de memoria reducido frente al modelo base sin cuantizar.
- Generacion de codigo en entornos con recursos limitados: la etiqueta "coding" y el formato GGUF lo hacen candidato para autocompletado y generacion de fragmentos en IDE locales, aunque la ausencia de benchmarks impide garantizar calidad en lenguajes especificos.
- Prototipado de agentes en el borde: la etiqueta "agent" sugiere su uso en pipelines de agentes que requieran inferencia local, como automatizacion de tareas en dispositivos o entornos sin conectividad.
- Evaluacion de cuantizaciones: util para investigadores que quieran comparar el comportamiento de una cuantizacion de 4 bits frente al modelo base Qwen/Qwen3.8-Flash-Next en tareas de razonamiento y codigo.
- Despliegue en endpoints compatibles: la etiqueta "endpoints_compatible" permite integrarlo en servidores de inferencia que acepten GGUF, como llama.cpp u Ollama, para servicios de generacion de texto de baja latencia.
- Fines educativos y de experimentacion: dado el bajo numero de descargas y la escasez de documentacion, resulta adecuado para estudiar el proceso de cuantizacion y publicacion de artefactos GGUF, no para produccion critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. Con 4.947.698.560 parametros en 4 bits, la estimacion teorica ronda los 2,5-3 GB de pesos, pero el repositorio ocupa 92,3 GB, lo que impide confirmar el tamano real del artefacto desplegable.
- GPU recomendadas: no disponibles. Por el recuento de parametros, cabria en GPUs consumer como RTX 3060 12 GB o RTX 4090, pero la discrepancia con la denominacion "120B" invalida cualquier recomendacion firme.
- Cabe en GPU consumer: probablemente si, segun el recuento de safetensors, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere soporte en servidores de inferencia estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Edge0-120B-q3k | 4.947.698.560 (segun safetensors) | no disponible | Apache 2.0 | GGUF y safetensors | Cuantizacion de Qwen/Qwen3.8-Flash-Next |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Modelo base declarado |
| Alternativas de 4-8B en GGUF | 4-8B tipico | variable | variable | GGUF | Categoria generica; no se dispone de comparaciones directas |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Discrepancia entre la denominacion "120B" y los 4.947.698.560 parametros declarados en safetensors: debe verificarse el contenido real del repositorio antes de cualquier uso.
- El tamano del repositorio (92,3 GB) no es coherente con el recuento de parametros, lo que sugiere archivos adicionales o artefactos no documentados.
- Ausencia total de benchmarks, datos de contexto e idiomas: imposible evaluar calidad o idoneidad para tareas concretas.
- Riesgo de alucinacion no cuantificado, comun a los modelos de lenguaje sin evaluacion publicada.
- La cuantizacion de 4 bits puede degradar el rendimiento en tareas de razonamiento y codigo respecto al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre el modelo base y su procedencia exige verificacion legal independiente.
- Cero descargas y un solo "like" en el momento de la consulta: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- La etiqueta "latent-moe" no corresponde a una arquitectura documentada; tratar como marketing no verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Edge0/Edge0-120B-q3k
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
