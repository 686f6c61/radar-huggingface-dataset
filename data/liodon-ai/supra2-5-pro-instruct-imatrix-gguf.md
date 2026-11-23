# liodon-ai/Supra2.5-Pro-Instruct-imatrix-GGUF

## Resumen

Supra2.5-Pro-Instruct-imatrix-GGUF es un conjunto de cuantizaciones GGUF del modelo SupraLabs/Supra2.5-Pro-Instruct, publicadas por Liodon AI. No se trata de un modelo original, sino de una distribucion optimizada para inferencia local mediante llama.cpp, Ollama, LM Studio y Jan. El paquete incluye variantes desde 2 bits (IQ2_M) hasta 8 bits (Q8_0), todas calibradas con la tecnica iMatrix.

La relevancia de esta publicacion radica en que permite ejecutar el modelo base en hardware de consumo, algo imposible con los pesos completos. La calibracion iMatrix, que procesa 128 fragmentos de calibracion (2 millones de tokens de WikiText-103) para identificar los pesos mas sensibles, mejora la coherencia y el seguimiento de instrucciones en cuantizaciones agresivas de 2 a 4 bits sin aumentar el tamano del archivo.

El modelo base esta etiquetado como qwen3 en los tags del repositorio, lo que sugiere una arquitectura derivada de la familia Qwen 3, aunque la model card no detalla la arquitectura ni el contexto. El dato de parametros totales en safetensors (67.028.096) resulta inconsistente con el tamano del repositorio (0,4 GB) y con los tamanos de las cuantizaciones (0,04-0,07 GB), por lo que debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican qwen3) |
| Parametros totales | 67.028.096 (dato safetensors; inconsistente con el tamano del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ3_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,4 GB |
| Calibracion | iMatrix con 2M tokens de WikiText-103 |
| Libreria | gguf (llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo base Supra2.5-Pro-Instruct. Los tags del repositorio incluyen la etiqueta qwen3, lo que apunta a una arquitectura de tipo transformer derivada de la familia Qwen 3, pero no se confirma en la documentacion disponible. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica documentada corresponde al proceso de cuantizacion, no al modelo. Liodon AI aplica iMatrix, una tecnica que ejecuta 128 fragmentos de calibracion (2 millones de tokens de WikiText-103) a traves del modelo en precision completa para identificar los pesos criticos y asignarles mayor precision. El resultado, segun el autor, es una mejora perceptible en coherencia e instruccion en cuantizaciones de 2 a 4 bits manteniendo el mismo tamano de archivo. Se ofrece tambien una variante sin iMatrix (liodon-ai/Supra2.5-Pro-Instruct-GGUF).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Seguimiento de instrucciones, segun la denominacion Instruct del modelo base.
- Inferencia local en CPU y GPU mediante llama.cpp, Ollama, LM Studio y Jan.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingues: no documentadas.
- Tool calling, function calling, agentes, vision o audio: no documentados.
- Modo thinking: no documentado.

## Casos de uso

- Prototipado en estaciones de trabajo sin GPU dedicada: las cuantizaciones IQ2_M e IQ3_M (0,04 GB) permiten cargar el modelo en llama.cpp sobre CPU y validar prompts antes de escalar a hardware mayor.
- Asistentes conversacionales locales en LM Studio o Jan: el formato GGUF y la integracion con estas herramientas permiten desplegar un chatbot de escritorio sin conexion a servicios en la nube.
- Evaluacion comparativa de cuantizaciones: al ofrecer siete variantes con y sin iMatrix, permite medir la degradacion de calidad frente al modelo base en tareas de instruccion.
- Pipelines de CI/CD para pruebas de prompts: la variante Q4_K_M (0,05 GB) se puede embeber en contenedores ligeros y ejecutar como paso de validacion de plantillas de prompt.
- Despliegue en entornos con restricciones de memoria: las variantes Q6_K y Q8_0 (0,07 GB) ofrecen salidas practicamente sin perdida cuando el espacio no es critico pero se requiere fidelidad al modelo original.
- Formacion y experimentacion: el tamano reducido facilita ejecutar el modelo en cuadernos de investigacion y comparar el efecto de la calibracion iMatrix frente a la cuantizacion estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica ~0 GB para todas las variantes, coherente con tamanos de archivo de 0,04 a 0,07 GB; el modelo cabe en memoria RAM de cualquier equipo moderno.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 1 GB de VRAM libre es suficiente. No se requiere A100, H100 ni RTX 4090.
- GPU de consumo: cabe en cualquier GPU de consumo, incluidas integradas, y en CPU.
- Opciones de despliegue: llama.cpp (llama-cli con -hf), Ollama (ollama run hf.co/...), LM Studio y Jan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Supra2.5-Pro-Instruct-imatrix-GGUF | 67.028.096 (segun safetensors) | no disponible | GGUF | other | Cuantizacion iMatrix, 7 variantes |
| Supra2.5-Pro-Instruct-GGUF | no disponible | no disponible | GGUF | other | Misma familia, sin iMatrix |
| SupraLabs/Supra2.5-Pro-Instruct | no disponible | no disponible | safetensors (presumible) | other | Modelo base sin cuantizar |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia "other" no especifica condiciones de uso comercial; es necesario consultar el repositorio del modelo base antes de cualquier despliegue en produccion.
- El dato de parametros totales (67 millones) es incompatible con el tamano del repositorio y de las cuantizaciones; no debe usarse para estimar capacidad del modelo sin verificacion.
- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar sesgos y cobertura linguistica.
- Las cuantizaciones de 2 y 3 bits, aun con iMatrix, degradan la calidad respecto al modelo en precision completa; el autor solo garantiza mejor coherencia relativa frente a cuantizacion estandar.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- El repositorio no registra descargas ni likes y fue creado en 2026; no hay evidencia de uso en comunidad ni validacion independiente.
- No se documentan capacidades de tool calling ni agentes, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/liodon-ai/Supra2.5-Pro-Instruct-imatrix-GGUF
- Modelo base: https://huggingface.co/SupraLabs/Supra2.5-Pro-Instruct
- Variante sin iMatrix: https://huggingface.co/liodon-ai/Supra2.5-Pro-Instruct-GGUF
- Perfil del autor: https://huggingface.co/liodon-ai
- Dataset de calibracion: https://huggingface.co/datasets/wikitext
