# DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF es un ajuste fino de multiples etapas publicado por el usuario DavidAU sobre un modelo que el autor denomina Qwen3.8 27B. Se distribuye exclusivamente en formato GGUF, con cuantizaciones "regulares" y variantes MTP (multi-token prediction), y cuenta con 26.895.998.464 parametros reales (aproximadamente 26,9 mil millones) segun los pesos en safetensors. La licencia declarada es Apache 2.0 y los idiomas soportados son ingles y chino.

El modelo esta orientado a dos objetivos concretos: reducir de forma agresiva el consumo de tokens de razonamiento (entre 1/2 y 1/20 respecto al modelo base, con una reduccion mediana de aproximadamente 2/3) y eliminar los filtros de seguridad y el alineamiento excesivamente conservador, segun indican las etiquetas "uncensored", "abliterated" y "heretic". Incorpora cinco modos de razonamiento y cinco modos de instruccion conmutables en tiempo de ejecucion mediante API o directamente en el chat, dos de ellos nuevos ("UltraXhigh" y "Einstein"); los modos de instruccion no consumen tokens de razonamiento.

Es relevante para desarrolladores que buscan un modelo de ~27B desplegable en hardware de consumo con cuantizacion de 4 bits, con salida sin restricciones tematicas y con control fino del esfuerzo de razonamiento. Hay que subrayar que todas las cifras de rendimiento proceden de la model card del autor y no de una evaluacion independiente, y que la denominacion "Qwen3.8" no se corresponde con ninguna familia publica de Qwen identificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun la model card del autor); no se detalla si es densa o MoE |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | No aplica / no disponible (no se declara arquitectura MoE para este modelo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en 4 bits (Q4_K_S citado) y 8 bits; variantes "Regular GGUF" y "MTP GGUF" (NEO y NEO MAX); cuantizacion con imatrix; pesos base en bfloat16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio con multiples cuantizaciones); bfloat16 en el modelo base |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored |
| Datasets de ajuste | DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets, DavidAU/THE-DECKARD-Datasets |
| Tamano del repositorio | 412,2 GB |
| Descargas / likes | 0 descargas / 10 likes |
| Fecha de publicacion | 10 de septiembre de 2026 (actualizado el 11 de septiembre de 2026) |

## Arquitectura y entrenamiento

La model card describe el modelo como un ajuste fino multi-etapa ("multi-stage tune"), multi-ajuste ("multi-fine tune") y fusion multi-estado ("multi-state merge"), construido mediante los metodos que el autor denomina "COLD FUSION" y "FABLE FUSION 711". El entrenamiento se realizo con Unsloth, segun las etiquetas del repositorio. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; los unicos datasets nombrados son los tres conjuntos propios del autor listados en la model card. El pipeline declarado es image-text-to-text, lo que sugiere capacidades de entrada imagen-texto, aunque la model card no documenta el componente de vision ni como se integro en el ajuste.

La innovacion principal declarada es la reformulacion y compresion del bloque de razonamiento: la reduccion de tokens de pensamiento va de 1/2 hasta 1/20 respecto al modelo base, con una mediana en torno a 2/3, manteniendo (segun el autor) el detalle y la calidad de la salida. Sobre esa base se anaden cinco modos de razonamiento y cinco modos de instruccion, conmutables en caliente por API o desde el propio mensaje del chat. El autor afirma ademas que las cuantizaciones MTP aceleran la generacion de tokens y que se ha reducido el tamano de las cuantizaciones mejorando la calidad. No hay informacion sobre atencion lineal, decodificacion especulativa ni otras tecnicas de eficiencia mas alla de lo citado.

## Capacidades

- Generacion de texto generalista y conversacional, con enfasis declarado en escritura creativa, narrativa larga, ficcion y roleplay ("all genres", "story", "writing", "fiction", "roleplaying").
- Razonamiento explicito configurable en cinco modos, dos de ellos nuevos ("UltraXhigh" y "Einstein"), con control del esfuerzo de razonamiento a nivel de mensaje.
- Cinco modos de instruccion sin consumo de tokens de razonamiento, tambien conmutables en tiempo de ejecucion.
- Capacidades de programacion: el repositorio incluye la etiqueta "coder", aunque no se detalla el rendimiento en tareas de codigo.
- Entrada imagen-texto, segun el pipeline declarado en Hugging Face; la model card no describe el alcance ni los limites de esta capacidad.
- Multilingue limitado a ingles y chino.
- Salida sin censura declarada: las etiquetas "uncensored", "abliterated" y "heretic" indican la eliminacion deliberada de rechazos y filtros de seguridad.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura creativa de narrativa larga: el modelo esta ajustado especificamente para mantener arcos de personaje, foreshadowing y estructura de tres actos a lo largo de decenas de miles de palabras, segun el autor, lo que lo hace adecuado para novela, relato seriado y guion.
- Roleplay y ficcion interactiva: la combinacion de salida sin censura y modos de instruccion sin tokens de razonamiento permite conversaciones multi-turno con latencia baja y sin rechazos tematicos, util en motores de aventuras conversacionales.
- Generacion de codigo asistida en local: con la etiqueta "coder" y cuantizaciones de 4 bits desplegables en una GPU de consumo, puede integrarse en asistentes de edicion o revision de codigo que no envien datos a servicios externos.
- Procesamiento de documentos con entrada imagen-texto: el pipeline image-text-to-text permite extraer y transformar informacion de capturas, diagramas o documentos escaneados en flujos de preprocesado de datos.
- Creacion de contenido editorial sin restricciones de tematica: util para generos como terror, noir o ficcion adulta donde los filtros estandar de los modelos alineados suelen truncar la salida.
- Despliegue en hardware de consumo para prototipado: las cuantizaciones de 4 bits permiten ejecutar el modelo en una unica GPU de gama alta o en configuraciones de VRAM moderada, sin depender de infraestructura en nube.
- Reduccion de coste por token en inferencia: dado que los modos de instruccion consumen cero tokens de razonamiento, es adecuado para servicios con alto volumen de peticiones donde el coste de generacion de pensamiento es el cuello de botella.

## Benchmarks y rendimiento

Los unicos datos disponibles son los autoinformados por el autor en la model card. Se presentan tal cual, sin verificacion independiente:

| Metrica | Resultado declarado | Condiciones |
|---|---|---|
| Arc-C (modo instruccion) | 709 | Cuantizacion de 8 bits |
| Arc-C (modo instruccion) | 701 | Cuantizacion de 4 bits |
| Comparacion con Qwen 3.8 27B | +118 puntos en Arc-C (8 bits, modo instruccion) | Segun el autor |
| Reduccion de tokens de pensamiento | De 1/2 a 1/20, mediana ~2/3 | Respecto al modelo base Qwen 3.8 |
| Benchmarks superados | 7 de 7 criticos, frente a Qwen 3.8 27B, Qwen 3.6 27B, Qwen3.6-35B-A3B y Qwen 3.5 27B | Segun el autor, en 4 y 8 bits |

Advertencia: la escala "709" no corresponde al formato habitual de ARC-Challenge, que se expresa en porcentaje de acierto. No se especifica en la model card que metrica exacta representa ese valor. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 26,9 B de parametros, incluye margen para cache KV):
  - Cuantizacion de 4 bits: aproximadamente 15-18 GB.
  - Cuantizacion de 8 bits: aproximadamente 29-33 GB.
  - bfloat16: aproximadamente 56-62 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 5090 deberia bastar para cuantizaciones de 4 bits; para 8 bits se recomienda una A100 40 GB, L40S o H100; para bfloat16, una A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: si, en 4 bits. Con 24 GB de VRAM se puede ejecutar la cuantizacion Q4 con contexto moderado; en 8 bits no cabe en GPU de consumo de una sola unidad.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM o TGI si se convierte a safetensors; el repositorio incluye la etiqueta "endpoints_compatible", lo que sugiere compatibilidad con endpoints de inferencia compatibles con OpenAI. Las cuantizaciones MTP requieren que el motor de inferencia soporte esa variante.
- Latencia y throughput: no disponibles. El autor afirma que las variantes MTP aceleran la generacion de tokens y que los modos de instruccion reducen el coste al no generar tokens de razonamiento, pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

Todos los datos de rendimiento de esta tabla proceden de afirmaciones del autor, no de evaluaciones independientes. Los parametros de los modelos comparados no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L (este modelo) | 26,9 B | No disponible | Arc-C 709 (8 bits) y 701 (4 bits), autoinformado | Apache 2.0 | GGUF (4 y 8 bits) |
| Qwen 3.8 27B (base) | 27 B (segun denominacion) | No disponible | 118 puntos menos en Arc-C que este ajuste, segun el autor | No disponible | No disponible |
| Qwen 3.6 27B | 27 B (segun denominacion) | No disponible | Inferior en los 7 benchmarks criticos, segun el autor | No disponible | No disponible |
| Qwen3.6-35B-A3B | 35 B totales (segun denominacion) | No disponible | Inferior en los 7 benchmarks criticos, segun el autor | No disponible | No disponible |
| Qwen 3.5 27B | 27 B (segun denominacion) | No disponible | Inferior en los 7 benchmarks criticos, segun el autor | No disponible | No disponible |

No se dispone de datos verificables de parametros, contexto ni licencia de las alternativas citadas en la model card. No se han identificado en la busqueda web modelos comparables adicionales con datos contrastables.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": se ha eliminado deliberadamente el alineamiento de seguridad. Puede generar contenido ofensivo, ilegal, peligroso o sexual sin filtros. No es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Benchmarks autoinformados: las cifras de Arc-C (709 y 701) y la afirmacion de superar 7 benchmarks criticos provienen unicamente del autor. No hay evaluacion independiente ni repositorio de evaluacion asociado.
- Metrica no estandar: la escala "709" no se corresponde con el formato porcentual habitual de ARC-Challenge y no se especifica su definicion exacta, por lo que no es directamente comparable con resultados publicados de otros modelos.
- Nomenclatura no verificada: las referencias a "Qwen 3.8", "Qwen 3.6" y "Qwen 3.5" en el nombre del modelo no se corresponden con familias publicas de Qwen identificadas en la informacion disponible. Debe tratarse como una denominacion del autor.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad factual. Un ajuste orientado a escritura creativa y sin alineamiento tiende a priorizar la coherencia narrativa sobre la exactitud.
- Idiomas: solo ingles y chino. No hay soporte declarado de castellano, lo que limita su uso directo en produccion en espanol.
- Contexto desconocido: no se especifica la longitud de contexto, dato critico para dimensionar cache KV, planificar el coste de memoria y evaluar casos de uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo deriva de un ajuste previo del propio autor y, en ultima instancia, de un modelo base de Qwen cuya licencia original debe verificarse de forma independiente antes de un despliegue comercial.
- Validacion comunitaria escasa: 0 descargas y 10 likes en el momento de la ficha, con publicacion muy reciente. No hay evidencia de uso en produccion ni informes de terceros.
- Tamano del repositorio: 412,2 GB. La descarga completa es poco practica; conviene descargar unicamente el archivo de cuantizacion necesario.
- Cifras de rendimiento no reproducibles: no se publican scripts de evaluacion ni configuracion exacta de los modos de razonamiento e instruccion empleados en las mediciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo base (no cuantizado): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Dataset DavidAU/Polar-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset DavidAU/F451-STRICT-Datasets: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset DavidAU/THE-DECKARD-Datasets: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados obtenidos corresponden a paginas generales de ChatGPT (chatgpt.com y openai.com) sin relacion con esta ficha. No se han localizado papers, blogs tecnicos, repositorios de codigo ni demos asociados a este modelo.
