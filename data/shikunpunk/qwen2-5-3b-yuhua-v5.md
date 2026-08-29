# shikunpunk/Qwen2.5-3B-YuHua-V5

## Resumen

Qwen2.5-3B-YuHua-V5 es un conjunto de siete adaptadores LoRA desarrollados por shikunpunk sobre el modelo base Qwen2.5-3B-Instruct, especializado en la generación de novelas y textos narrativos con el estilo del escritor chino Yu Hua. Cada adaptador cubre una subtarea distinta dentro del proceso de escritura: continuación de texto, diálogos, descripciones psicológicas, escenas, trama, generación de pasajes largos y control de calidad. El modelo se distribuye como un repositorio de HuggingFace con subcarpetas para cada adaptador, y se carga mediante la librería PEFT.

La relevancia de este modelo radica en su enfoque modular: en lugar de un único modelo afinado, ofrece siete especializaciones intercambiables en tiempo de ejecución, lo que permite al usuario seleccionar el adaptador adecuado según la fase de escritura. Al estar basado en Qwen2.5-3B, hereda la arquitectura transformer de 3.000 millones de parámetros y una ventana de contexto de hasta 128.000 tokens en el modelo base, aunque no se especifica si los adaptadores mantienen esa longitud completa. El repositorio ocupa 1,7 GB, lo que sugiere que contiene los pesos de los adaptadores en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-3B-Instruct (transformer decoder-only) + 7 adaptadores LoRA |
| Parametros totales | No disponible (el modelo base tiene 3.000 millones; los adaptadores anaden una fraccion menor) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No especificada para este modelo; el base Qwen2.5-3B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | No especificados; el ejemplo de carga usa 4-bit (BitsAndBytes) |
| Idiomas soportados | No especificados; el base Qwen2.5 soporta multilingue (incluido chino e ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (segun tags del repositorio) |

## Arquitectura y entrenamiento

El modelo se compone de un modelo base Qwen2.5-3B-Instruct, que es un transformer decoder-only con 3.000 millones de parametros, y siete adaptadores LoRA entrenados por separado. Cada adaptador se entrena sobre una subtarea especifica de generacion de texto narrativo en estilo Yu Hua. Los datos de entrenamiento se mencionan en el dataset enlazado `shikunpunk/YuHua-Qwen3-V4-Data`, en el directorio `v5/`, pero no se detallan en la informacion disponible. El adaptador `pt` se entrena con 18.793 segmentos de texto puro de Yu Hua, con nombres de personajes simbolizados. No se indica si se utilizo RLHF, DPO u otras tecnicas de alineacion; el entrenamiento parece ser de afinacion supervisada clasica sobre cada subconjunto de datos.

La innovacion principal es la organizacion en siete adaptadores intercambiables, lo que permite al usuario cambiar de especializacion sin recargar el modelo. El adaptador `diffusion` genera pasajes largos de 800 a 1.500 caracteres, y el adaptador `qa` actua como un evaluador de calidad en cinco dimensiones (coherencia, referencias, tono, repeticion y longitud). No se mencionan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto narrativo en estilo Yu Hua, caracterizado por un tono sobrio, descripciones detalladas y un enfoque en lo cotidiano y lo tragico.
- Continuacion de texto a partir de un fragmento dado (adaptador `pt`), con nombres de personajes ya simbolizados para evitar inconsistencias.
- Generacion de dialogos con lenguaje coloquial y subtexto (adaptador `dialogue`).
- Descripcion de estados psicologicos y acciones de personajes (adaptador `psych`).
- Descripcion de escenarios y ambientes (adaptador `scene`).
- Generacion de tramas y desarrollo argumental (adaptador `plot`).
- Generacion de pasajes largos de 800 a 1.500 caracteres mediante un enfoque de difusion textual (adaptador `diffusion`).
- Evaluacion automatica de calidad en cinco dimensiones: coherencia, referencias, tono, repeticion y longitud (adaptador `qa`).
- Capacidad de cambiar de adaptador en tiempo de ejecucion mediante `model.set_adapter()`, lo que permite combinar especializaciones en un mismo flujo de trabajo.

## Casos de uso

- Escritura creativa asistida: un autor puede usar el adaptador `pt` para continuar un borrador, luego `dialogue` para pulir conversaciones y `scene` para enriquecer las descripciones ambientales, todo en una misma sesion sin recargar el modelo.
- Generacion de novelas por capitulos: el adaptador `diffusion` permite producir pasajes extensos de 800 a 1.500 caracteres, adecuados para capitulos o secciones de una novela, manteniendo el estilo del autor.
- Analisis y revision de textos: el adaptador `qa` puede evaluar un fragmento generado o escrito por un humano, puntuando su coherencia, referencias, tono, repeticion y longitud, util como herramienta de control de calidad en flujos editoriales.
- Creacion de contenido para publicaciones literarias: revistas o blogs que necesiten relatos breves con un estilo especifico pueden generar borradores rapidos y luego editarlos, reduciendo el tiempo de produccion.
- Prototipado de personajes y dialogos: el adaptador `dialogue` permite generar conversaciones realistas con subtexto, util para guiones, obras de teatro o desarrollo de personajes en narrativa interactiva.
- Educacion y practica de escritura: estudiantes de escritura creativa pueden usar el modelo para generar ejemplos de estilo Yu Hua y compararlos con los originales, o para practicar tecnicas de descripcion psicologica y ambiental.
- Generacion de contenido para juegos de rol o ficcion interactiva: el adaptador `plot` puede generar tramas y ramificaciones argumentales, mientras que `scene` y `psych` enriquecen las descripciones en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de generacion creativa. El unico dato de rendimiento indirecto es el tamano del repositorio (1,7 GB) y la referencia a 18.793 segmentos de texto para el adaptador `pt`.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 3.000 millones de parametros, en precision completa (fp16) requiere aproximadamente 6 GB de VRAM. Con cuantizacion de 4 bits, como en el ejemplo de carga, la VRAM necesaria se reduce a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en 4 bits (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para fp16 se recomienda una GPU con 8 GB o mas (RTX 3070, RTX 4080, A100, etc.).
- Si cabe en consumer GPU: si, en cuantizacion 4 bits cabe en GPUs de gama de entrada con 4-6 GB de VRAM.
- Opciones de despliegue: el ejemplo de carga usa HuggingFace Transformers con PEFT y BitsAndBytes. Tambien se puede usar vLLM o TGI si se fusionan los adaptadores en el modelo base, aunque no se documenta. llama.cpp y Ollama no son compatibles directamente con LoRA sin conversion previa.
- Latencia y throughput estimados: no disponibles. Para un modelo de 3B en 4 bits, se espera una generacion de 20-40 tokens por segundo en una GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente orientados a la generacion de novelas en estilo Yu Hua. Como referencia general, el modelo base Qwen2.5-3B-Instruct se puede comparar con otros modelos de 3B como Llama-3.2-3B o Phi-3.5-mini, pero no hay datos de rendimiento especificos para este adaptador. La comparativa queda pendiente de datos publicados.

## Limitaciones y advertencias

- No se especifica la licencia del modelo ni de los adaptadores, lo que impide conocer las restricciones de uso comercial. Se debe contactar con el autor antes de utilizarlo en produccion.
- El modelo esta entrenado exclusivamente con textos de Yu Hua, por lo que su capacidad de generalizacion a otros estilos narrativos es limitada.
- Los adaptadores pueden heredar sesgos presentes en los textos de entrenamiento, como representaciones estereotipadas de genero, clase social o etnia, habituales en la literatura china del siglo XX.
- Riesgo de alucinacion: al ser un modelo de 3B, puede generar inconsistencias factuales o referencias inventadas, especialmente en pasajes largos.
- La longitud de contexto efectiva tras aplicar los adaptadores no esta documentada; es posible que se reduzca respecto a los 128K del modelo base.
- El adaptador `qa` no es un evaluador objetivo; sus puntuaciones se basan en criterios heuristicos y pueden no coincidir con la percepcion humana.
- No se proporcionan instrucciones de uso para entornos de produccion, ni se documenta la fusion de adaptadores con el modelo base para su despliegue en servidores de inferencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shikunpunk/Qwen2.5-3B-YuHua-V5
- Dataset de entrenamiento: https://huggingface.co/datasets/shikunpunk/YuHua-Qwen3-V4-Data
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio GitHub de Qwen2.5 (referencia): https://github.com/mx4ai/qwen2.5
