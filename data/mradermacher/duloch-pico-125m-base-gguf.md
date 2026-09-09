# mradermacher/Duloch-Pico-125M-Base-GGUF

## Resumen

Duloch-Pico-125M-Base-GGUF es una version cuantizada en formato GGUF del modelo de lenguaje causal Duloch-Pico-125M-Base, desarrollado originalmente por pdjamez. La cuantizacion ha sido realizada por el equipo de mradermacher, especializado en la conversion de modelos de HuggingFace a formatos de inferencia eficientes. El modelo pertenece a la familia de arquitecturas tipo Llama, tal como indican las etiquetas del repositorio, y cuenta con 125.095.680 parametros en total.

Se trata de un modelo base, no afinado para instrucciones ni chat, entrenado con el dataset HuggingFaceFW/fineweb, una coleccion de texto web en ingles. Su tamano reducido lo hace adecuado para entornos con recursos limitados, como CPU o dispositivos de low power, gracias a la cuantizacion GGUF. Sin embargo, al ser un modelo base y no tener datos publicados sobre longitud de contexto ni benchmarks, su uso inmediato en produccion requiere precaucion y un afinado posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama, modelo causal (causal LM) |
| Parametros totales | 125.095.680 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original esta disponible en safetensors) |

## Arquitectura y entrenamiento

Duloch-Pico-125M-Base es un transformer causal con arquitectura de la familia Llama, segun las etiquetas del repositorio en HuggingFace. Se trata de un modelo base, es decir, no ha recibido afinado por instrucciones ni alineacion mediante RLHF o DPO. El entrenamiento se ha realizado con el dataset HuggingFaceFW/fineweb, un corpus de texto web en ingles. No se proporciona informacion publica sobre el numero de tokens utilizados, la composicion exacta del dataset ni la metodologia de entrenamiento.

La innovacion tecnica destacable no se documenta en la informacion disponible. La unica transformacion aplicada al modelo original es la cuantizacion a formato GGUF, que permite reducir el peso y facilitar la ejecucion con herramientas como llama.cpp u Ollama.

## Capacidades

- Generacion de texto causal en ingles a partir de prompts de continuacion.
- Razonamiento basico, caracteristico de un modelo de 125M sin afinado.
- No soporta tool calling ni function calling al ser un modelo base.
- No esta disenado para tareas de agente ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- Sin modo "thinking" ni capacidades de vision o audio.
- Utilizable como punto de partida para fine-tuning en tareas de procesamiento de lenguaje natural en ingles.

## Casos de uso

- Afinado para clasificacion de texto en ingles: el modelo puede fine-tunearse con datasets etiquetados para categorizar correos, reseñas o articulos, gracias a su tamano reducido y a la licencia Apache 2.0.
- Prototipado rapido en entornos locales: el formato GGUF permite cargar el modelo con llama.cpp o Ollama en un portatil sin GPU dedicada y ejecutar experimentos de generacion o analisis de texto.
- Testing de frameworks de inferencia: sirve como modelo de prueba para validar configuraciones de vLLM, TGI, llamafile o Ollama en pipelines de desarrollo, sin necesidad de descargar pesos pesados.
- Aplicaciones en dispositivos de bajo consumo: la cuantizacion Q2_K ocupa alrededor de 0.2 GB, lo que permite ejecutar inferencia en CPUs ARM o en GPUs integradas, habilitando asistentes o completadores de texto en el edge.
- Educacion en procesamiento del lenguaje natural: es un modelo adecuado para explicar conceptos de transformadores causales, tokenizacion, atencion y cuantizacion en cursos o talleres.
- Modelo de partida para experimentos de distilacion: puede utilizarse como base para iniciativas academicas que estudien la transferencia de conocimiento o la compresion de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0.2 GB y 0.4 GB segun el tipo de cuantizacion seleccionado; el modelo cabe sobradamente en menos de 1 GB.
- GPU recomendada: no se requiere GPU dedicada; es viable la ejecucion en CPU moderna o en cualquier GPU con al menos 512 MB de VRAM.
- Compatibilidad con GPU de consumo: si, incluso en GPU integradas o en tarjetas antiguas como la serie GTX 700.
- Opciones de despliegue: llama.cpp, Ollama, llamafile, vLLM y Text Generation Inference (TGI), aunque para este tamano las opciones mas naturales son llama.cpp y Ollama.
- Latencia y throughput estimados: no disponibles en la documentacion consultada.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de la misma categoria en la informacion suministrada. La unica referencia indirecta es la existencia de otro modelo de 125M cuantizado por mradermacher, llamado Boris-125M-GGUF, pero no se aportan datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Entrenado con un dataset web sin curado como FineWeb, por lo que puede inherir sesgos y contenido de baja calidad.
- Al ser un modelo base, no sigue instrucciones correctamente y no esta capacitado para tareas de chat o agente.
- Riesgo elevado de alucinacion si se utiliza directamente como asistente sin un afinado previo.
- La longitud de contexto no se ha especificado en la informacion publica, lo que obliga a consultar el modelo base original antes de usarlo en aplicaciones que requieran ventanas largas.
- Solo esta documentado su soporte para el idioma ingles.
- La licencia Apache 2.0 permite el uso comercial, pero la responsabilidad sobre el resultado final recae en el usuario, especialmente en entornos de produccion.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Duloch-Pico-125M-Base-GGUF
- Modelo base original: https://huggingface.co/pdjamez/Duloch-Pico-125M-Base
- Perfil de mradermacher: https://huggingface.co/mradermacher
