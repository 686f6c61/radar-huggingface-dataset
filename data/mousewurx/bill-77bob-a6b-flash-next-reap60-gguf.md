# MouseWurX/Bill-77Bob-A6B-Flash-Next-REAP60-GGUF

## Resumen

Bill 77Bob A6B Flash-Next REAP60 es una version podada por expertos del modelo Qwen/Qwen3.8-Flash-Next, publicada por MouseWurX en formato GGUF para llama.cpp. El autor elimina 204 de los 512 expertos de cada una de las 48 capas del modelo base (se conservan 308, un 60%), dejando aproximadamente 76,8B parametros de los 125B originales (sin contar el embedding n-gram ni la capa MTP). No hay reentrenamiento ni "curacion" posterior: los cortes se copian tal cual desde una cuantizacion Q8_0 del modelo base.

La seleccion de expertos sigue una puntuacion de estilo REAP (router-weighted expert activation pruning, Lasby et al. 2025): se multiplica la frecuencia con la que el router elige cada experto por su peso y por el tamano de su salida, sumado sobre trazas reales de tareas cotidianas de asistente (correo, ficheros de oficina, codigo) ejecutadas con el modelo completo. El objetivo declarado es conservar la habilidad de Flash-Next en un equipo domestico con 16 GB de VRAM y 32 GB de RAM.

El modelo forma parte del proyecto Bob, un asistente personal local de codigo abierto. Es relevante ahora porque demuestra una via practica de reducir un MoE grande mediante poda de expertos guiada por trazas de uso real, con evaluacion sobre conjuntos de tareas reservados, y porque ofrece pesos ya cuantizados (IQ2_M, IQ4_XS, Q3_K_M, Q4_K_M) listos para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (hereda la de Qwen3.8-Flash-Next); 48 capas, 512 expertos por capa en el modelo base, 308 tras la poda; experto compartido y capa MTP conservados |
| Parametros totales | 128.789.193.600 (dato real de safetensors); el autor indica ~76,8B descontando embedding n-gram y capa MTP |
| Parametros activos | no disponible (el nombre "A6B" sugiere ~6B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q3_K_M, Q4_K_M (GGUF); re-cuantizados desde Q8_0, no desde BF16; imatrix propia incluida |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other en la model card) |
| Formato de pesos | GGUF (llama.cpp); incluye keep.json con los ids de expertos conservados por capa |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) con 48 capas y 512 expertos por capa en el origen. La poda elimina 204 expertos por capa segun puntuaciones REAP calculadas sobre 153 ejecuciones limpias de tareas reales del asistente Bob (gestion de correo, creacion y edicion de ficheros de oficina, trabajo en proyectos de codigo), ejecutadas con el modelo completo a traves del bucle de herramientas propio de Bob. Solo se conservaron las ejecuciones que pasaron los criterios de evaluacion. La puntuacion por experto combina el peso del router, el tamano de la salida y la frecuencia de seleccion, sumada sobre todas las palabras de esas ejecuciones.

En cada capa se conservan los 308 expertos con mayor puntuacion (60%). En la capa 47 la traza solo mostro unos 30 expertos con peso real, por lo que el resto de la lista se rellena por numero de experto. La capa MTP (draft) conserva los expertos mas veces retenidos en el resto de capas. El experto compartido y todo lo que queda fuera de los expertos no se modifica. Los ficheros se generaron cortando desde la cuantizacion Q8_0 de unsloth/Qwen3.8-Flash-Next-GGUF con la herramienta gguf_cut_experts.py (copiando rebanadas enteras de experto sin alterar su contenido) y recuantizando despues con llama-quantize usando una imatrix propia (imatrix.gguf) derivada de chats de entrenamiento del autor, no de las tareas de evaluacion. No hubo reentrenamiento ni proceso de recuperacion de capacidad.

Una peculiaridad tecnica relevante: dos partes de Flash-Next tienen filas que no son multiplos de 256 (la proyeccion down de cada experto, de 640, y el embedding n-gram de 51B, de 160). Los k-quants e i-quants de llama.cpp requieren filas de 256, por lo que en los ficheros IQ2 las proyecciones down usan Q2_0 (2,25 bits en grupos de 64) y en el resto llama-quantize les asigna un tipo de 32 de ancho y 4-5 bits. El embedding n-gram solo admite un tipo de 32 de ancho (unos 4,5 bits, unos 29 GB) en todos los ficheros; como se consulta por filas y con memory mapping se lee del disco sin ocupar RAM ni VRAM.

## Capacidades

- Generacion de texto conversacional y asistencia general, heredada del modelo base.
- Razonamiento multi-paso y uso de herramientas a traves del bucle de herramientas del proyecto Bob (correo, ficheros, codigo, busquedas web).
- Trabajo con ficheros de oficina: creacion y edicion de documentos.
- Trabajo en proyectos de codigo: lectura y modificacion de repositorios.
- Gestion de correo: clasificacion y localizacion de mensajes relevantes.
- Consultas web dentro de flujos de agente.
- Capacidad multilingue: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Asistente personal local: el modelo esta disenado como cerebro de Bob, un asistente que corre en el propio ordenador con chat, correo, ficheros, codigo y busquedas web, sin enviar datos fuera salvo que se active. Encaja por su tamano reducido y su soporte en llama.cpp.
- Gestion de bandeja de entrada: en las pruebas del autor localiza correctamente el 79,6% de los correos relevantes en el nivel de retencion del 60%, suficiente para triaje y busqueda de mensajes en un entorno domestico.
- Edicion de documentos de oficina: mantiene 13 de 14 tareas de oficina resueltas en los conjuntos reservados, por lo que sirve para crear y modificar ficheros ofimaticos de forma automatizada.
- Asistencia en repositorios de codigo: resuelve 12 de 12 tareas de repositorio en los conjuntos reservados, adecuado para tareas de lectura, modificacion y navegacion de proyectos.
- Despliegue en hardware de consumo: con 16 GB de VRAM y 32 GB de RAM como objetivo declarado, permite ejecutar un MoE de gran tamano en un equipo de escritorio mediante llama.cpp y memory mapping del embedding n-gram.
- Experimentacion con poda de expertos: los ficheros keep.json e imatrix.gguf, junto con las notas del proyecto, permiten reproducir o variar la seleccion de expertos y estudiar el efecto de distintos niveles de retencion (los cortes Bobert al 80% y Riker al 70% se publican en la misma cuenta).
- Automatizacion de tareas con herramientas: el modelo conserva el bucle de herramientas del base, por lo que puede integrarse en flujos de agente que encadenen correo, ficheros y codigo en local.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones propias del autor sobre conjuntos de tareas reservados, con el modelo completo y mascaras de expertos en tiempo de servicio (sin fichero cortado ni recuperacion), una ejecucion por nivel. No son benchmarks estandar y no deben compararse directamente con MMLU, HumanEval o GSM8K.

| Expertos conservados | Oficina (de 14) | Codigo repo (de 12) | Web (de 11) | Bandeja de entrada (aciertos) | Acciones daninas |
|---|---|---|---|---|---|
| 100% | 13 | 12 | 8 | 85,0% | 0 |
| 90% | 13 | 12 | 9 | 92,7% | 0 |
| 80% | 12 | 12 | 9 | 92,2% | 0 |
| 75% | 13 | 10 | 8 | 90,8% | 1 (borro un correo que requeria respuesta) |
| 65% | 13 | 12 | 9 | 79,0% | 0 |
| 60% | 13 | 12 | 8 | 79,6% | 0 |
| 50% | 9 | 11 | 9 | 85,7% | 0 |

El autor justifica el 60% por ser el nivel mas bajo que mantiene oficina, codigo y web en los valores del modelo completo (13, 12 y 8) sin acciones daninas; el coste es la bandeja de entrada (79,6% frente a 92,2% al 80%). Con 11 a 14 tareas por conjunto, una o dos de diferencia se considera ruido. Los seguimientos al 80% (corte Bobert) indican que la lista propia de oficina al 80% puntuo 13 de 14 frente a 12 de la lista de todas las tareas, y que una lista fusionada de ambas arreglaba una busqueda de fichero pero agotaba el tiempo en 3 tareas. Redirigir la cuota de cada experto apagado a su experto conservado mas parecido perdio claramente en la bandeja de entrada (64 de 117 encontrados frente a 85 con la mascara simple al 80% y 90 con la alternativa).

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion. IQ2_M ocupa 53,6 GB, Q3_K_M 69,2 GB, IQ4_XS 71,3 GB y Q4_K_M 87,0 GB en disco; el embedding n-gram (unos 29 GB) se lee del disco con memory mapping y no necesita RAM ni VRAM, por lo que el resto del fichero es lo que debe caber en memoria.
- Objetivo declarado del autor: 16 GB de VRAM y 32 GB de RAM en un equipo domestico, con los ficheros mas pequenos y memory mapping.
- GPU recomendadas: no disponible de forma explicita; por el volumen de pesos, los ficheros IQ2_M y Q3_K_M requieren configuraciones de memoria muy superiores a una unica GPU de consumo.
- Cabe en GPU de consumo: no disponible con certeza; el diseno apunta a ejecucion hibrida CPU+GPU con memory mapping del embedding.
- Opciones de despliegue: llama.cpp (builds que ejecuten Qwen/Qwen3.8-Flash-Next), con llama-quantize para generar cuantizaciones y gguf_cut_experts.py para el corte de expertos. Otras opciones (vLLM, Ollama, TGI) no estan documentadas en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Bill 77Bob A6B Flash-Next REAP60 | 128,8B totales (~76,8B segun autor) | 308 de 512 por capa (60%) | no disponible | qwen-community-1.0 | GGUF | Poda REAP sin reentrenamiento, imatrix propia |
| Bobert (mismo autor) | no disponible | 80% conservados | no disponible | qwen-community-1.0 | no disponible | Corte menos agresivo, misma metodologia |
| Riker (mismo autor) | no disponible | 70% conservados | no disponible | qwen-community-1.0 | no disponible | Corte intermedio, misma metodologia |
| Qwen/Qwen3.8-Flash-Next (base) | ~125B | 512 por capa (100%) | no disponible | qwen-community-1.0 | safetensors, GGUF (via unsloth) | Modelo de referencia sin poda |

La comparativa con alternativas de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La poda no incluye reentrenamiento ni recuperacion: la perdida de capacidad en tareas distintas de las evaluadas (correo, oficina, codigo, web) no esta caracterizada.
- La bandeja de entrada es el punto debil medido: 79,6% de aciertos al 60% frente a 92,2% al 80% y 85,0% del modelo completo.
- El nivel del 50% rompe el rendimiento en oficina (9 de 14), lo que marca un limite inferior claro.
- Los conjuntos de evaluacion son pequenos (11 a 14 tareas) y de una sola ejecucion por nivel; el propio autor senala que una o dos tareas de diferencia son ruido.
- La seleccion de expertos se hizo con trazas de las tareas cotidianas del autor; puede estar sesgada hacia esos flujos y no representar otros dominios.
- La capa 47 rellena parte de su lista por numero de experto, no por puntuacion, lo que puede degradar esa capa.
- El embedding n-gram de 51B ocupa unos 29 GB y solo admite un tipo de cuantizacion de 32 de ancho; con memory mapping depende del rendimiento del disco.
- Los ficheros son mas grandes de lo que sugiere su nombre por las filas no multiplos de 256 en las proyecciones down y el embedding n-gram.
- La cuantizacion parte de Q8_0 y no de BF16, lo que anade una perdida adicional respecto al modelo original.
- Licencia qwen-community-1.0: es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; la model card la etiqueta como "other".
- Idiomas soportados, contexto maximo y modo thinking no estan documentados; no deben asumirse.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, aunque son heredados del modelo base.
- Solo 245 descargas y 1 like en el momento de la consulta: ecosistema de validacion muy reducido.

## Enlaces

- Hugging Face: https://huggingface.co/MouseWurX/Bill-77Bob-A6B-Flash-Next-REAP60-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Proyecto Bob (codigo y notas): https://github.com/MouseWurX/Bob
- Dataset de lecciones y puntuaciones previas: https://huggingface.co/datasets/MouseWurX/bob-lessons
- Paper REAP (Lasby et al. 2025): no disponible como enlace en la informacion proporcionada
