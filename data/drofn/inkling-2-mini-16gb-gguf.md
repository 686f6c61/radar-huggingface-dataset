# drofn/Inkling-2-Mini-16GB-GGUF

## Resumen

Inkling-2-Mini-16GB-GGUF es un conjunto de cuantizaciones GGUF en precisión mixta del modelo thinkingmachines/Inkling-2-Mini, un transformer de mezcla de expertos (MoE) de 26.400 millones de parámetros totales y 3.400 millones activos. La publica el usuario drofn bajo licencia Apache 2.0, con el objetivo explícito de que cada archivo quepa, junto con su ventana de contexto, en una única GPU de 16 GB de VRAM. Se ofrecen tres variantes según el contexto objetivo: 64K, 96K y 128K tokens.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de cuantización medida empíricamente (con desglose de VRAM, velocidad de generación y de procesamiento de prompt, y verificación de recuperación en prompts largos) sobre hardware de consumo, en concreto una RTX 5060 Ti de 16 GB. Por otro, la model card reporta dos hallazgos que afectan a cualquier cuantización de este modelo: un suelo de divergencia KL de aproximadamente 0,0085 incluso comparando el modelo original consigo mismo con distinto tamaño de batch, y el hecho de que el consumo de VRAM está dominado por el búfer de cómputo, que escala con `-ub` y con la longitud de contexto.

El modelo base es multimodal (entrada de texto e imagen) y soporta decodificación especulativa mediante su propia cabeza MTP (multi-token prediction). El repositorio incluye además los proyectores de visión en F16 y Q8_0 y las cabezas de borrador en Q8_0 y F16, junto con la matriz de importancia, las recetas por tensor y las mediciones en bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); las 12 capas centrales se ejecutan tres veces; expertos originales en NVFP4 |
| Parametros totales | 26.070.390.272 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | Hasta 128K tokens (archivos de 64K, 96K y 128K) |
| Tipos de cuantizacion | GGUF en precisión mixta; caché KV q8_0; expertos NVFP4 preservados en el archivo de 64K; proyectores de visión F16 y Q8_0; cabeza MTP en Q8_0 y F16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26,4B parámetros totales y 3,4B activos por token. Su particularidad estructural es que las 12 capas centrales se ejecutan tres veces, lo que incrementa la profundidad efectiva de cómputo sin aumentar el número de parámetros. Los expertos del modelo original están almacenados en NVFP4, un formato de coma flotante de 4 bits con escala por bloque; el archivo de 64K conserva todos los expertos originales en ese formato, mientras que los archivos de 96K y 128K aplican una cuantización adicional para liberar VRAM a costa de un mayor KLD.

La cuantización la ha realizado drofn con su propia matriz de importancia (imatrix), incluida en el repositorio, y con recetas por tensor documentadas en `recipes/`. El modelo incorpora una cabeza MTP (multi-token prediction) que actúa como borrador para decodificación especulativa, lo que permite acelerar la generación. Para usarla se requiere una compilación de llama.cpp que incluya el PR #32218. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de contexto largo verificado hasta 128K tokens.
- Entrada de imagen (image-text-to-text) mediante los proyectores de visión incluidos, en F16 o Q8_0.
- Decodificación especulativa con la cabeza MTP propia del modelo, que acelera la generación.
- Recuperación de información en prompts largos: la model card reporta que un código oculto en prompts de 49.105, 70.988 y 102.644 tokens se devolvió correctamente.
- Capacidades de razonamiento y código: el modelo base se etiqueta como "thinkingmachines/Inkling-2-Mini", pero no se detallan en la información disponible resultados específicos de razonamiento, matemáticas ni generación de código.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.
- Multilingüismo: limitado al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistente conversacional local con contexto largo: desplegando el archivo de 128K en una GPU de 16 GB se puede mantener una conversación con documentos extensos (por ejemplo, 100K tokens de historial y referencias) sin salir del equipo, con 57 tok/s de generación medidos.
- Análisis de documentos y recuperación sobre corpus largos: el archivo de 96K permite procesar prompts de hasta 71K tokens a 228 tok/s de procesamiento de prompt, adecuado para resumir contratos, informes o bases de código de tamaño medio.
- Procesamiento de capturas y documentos escaneados: con el proyector de visión Q8_0 (0,35 GB) se pueden enviar imágenes junto con texto para tareas de descripción, extracción de datos o preguntas sobre la imagen.
- Prototipado e investigación en una sola GPU de consumo: la variante de 64K, con 14.052 MiB de pesos en GPU y 109 MiB libres en la configuración probada, permite experimentar con un MoE de 26B en una RTX 5060 Ti sin infraestructura de servidor.
- Evaluación de cuantizaciones y de decodificación especulativa: el repositorio incluye imatrix, recetas por tensor y mediciones en bruto, lo que lo convierte en un banco de pruebas reproducible para estudiar el impacto de la cuantización mixta y de la cabeza MTP en la calidad (KLD, top-1).
- Despliegue de bajo coste en estaciones de trabajo con una única GPU: al caber en 16 GB, se puede montar un servicio de inferencia con llama-server en hardware de gama media para tareas internas de inglés con contexto de hasta 128K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta métricas de fidelidad de cuantización y de velocidad medidas en una RTX 5060 Ti de 16 GB con caché KV q8_0:

| Archivo | Tamano | Pesos en GPU | KLD | Top-1 | Contexto en 16 GB |
|---|---|---|---|---|---|
| 64K | 15,1 GB | 14.052 MiB | 0,0097 | 96,9% | 64K |
| 96K | 14,0 GB | 12.948 MiB | 0,0114 | 96,7% | 96K |
| 128K | 13,4 GB | 12.432 MiB | 0,0133 | 96,3% | 128K |

Referencia del suelo de KLD: el modelo original, ejecutado con distinto tamaño de batch, obtiene 0,0085 de KLD y 97,1% de top-1 contra sí mismo.

| Archivo | Contexto | `-ub` | VRAM libre | Generación | Procesamiento de prompt |
|---|---|---|---|---|---|
| 64K | 65.536 | 32 | 109 MiB | 55 tok/s | 270 tok/s (prompt de 49K) |
| 64K | 32.768 | 64 | 641 MiB | 55 tok/s | no medido |
| 96K | 98.304 | 32 | 471 MiB | 56 tok/s | 228 tok/s (prompt de 71K) |
| 128K | 131.072 | 32 | 245 MiB | 57 tok/s | 189 tok/s (prompt de 103K) |

## Requisitos de hardware

- VRAM: los pesos ocupan entre 12.432 MiB (128K) y 14.052 MiB (64K); el resto hasta 16 GB lo consume el búfer de cómputo, que escala con `-ub` y con la longitud de contexto.
- GPU probada: RTX 5060 Ti de 16 GB que además gestiona la pantalla (16.000 MiB libres en reposo). Con el archivo de 64K a 64K de contexto y `-ub 32` quedan solo 109 MiB libres.
- Cabe en GPU de consumo de 16 GB; con menos VRAM libre hay que bajar de archivo, reducir contexto o reducir `-ub`.
- Configuraciones que no caben: el archivo de 64K a 64K con `-ub 64`; el archivo de 96K a 128K con `-ub 32` o `-ub 16`.
- Despliegue: llama.cpp versión b12611 o superior; para decodificación especulativa con la cabeza MTP se necesita una compilación con el PR #32218. El repositorio se etiqueta como compatible con endpoints.
- Rendimiento medido: 55-57 tok/s de generación y 189-270 tok/s de procesamiento de prompt según archivo y longitud.
- No se dispone de datos de VRAM ni de rendimiento para A100, H100 u otras GPU de centro de datos en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento de modelos alternativos de tamaño o categoría comparable, por lo que no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Idioma: el repositorio declara únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Fidelidad limitada por el suelo de KLD: incluso el modelo original comparado consigo mismo con distinto batch obtiene 0,0085 de KLD, de modo que las cifras de los archivos cuantizados deben leerse contra ese valor de referencia, no contra cero.
- El archivo de 64K deja solo 109 MiB de VRAM libre en la configuración probada; cualquier otra aplicación que use la GPU puede provocar fallos de memoria.
- La decodificación especulativa con MTP requiere una compilación de llama.cpp con el PR #32218, todavía no integrada en la versión estable indicada.
- La cuantización mixta degrada la calidad de forma medible: el KLD sube de 0,0097 (64K) a 0,0133 (128K) y el top-1 baja de 96,9% a 96,3%.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se aplican los del modelo base, sobre el que tampoco se detallan.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini, del que este repositorio es una cuantización.
- Soporte de tool calling, agentes y otras capacidades avanzadas no confirmado en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/drofn/Inkling-2-Mini-16GB-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Mediciones en bruto: https://huggingface.co/drofn/Inkling-2-Mini-16GB-GGUF/tree/main/measurements
- Matriz de importancia: https://huggingface.co/drofn/Inkling-2-Mini-16GB-GGUF/tree/main/imatrix
- Recetas por tensor: https://huggingface.co/drofn/Inkling-2-Mini-16GB-GGUF/tree/main/recipes
- Herramientas de conversión: https://huggingface.co/drofn/Inkling-2-Mini-16GB-GGUF/tree/main/tools
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
