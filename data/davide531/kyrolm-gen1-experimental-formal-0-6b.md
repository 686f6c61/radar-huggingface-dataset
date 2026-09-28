# Davide531/KyroLM-Gen1-Experimental-Formal-0.6B

## Resumen

KyroLM-Gen1-Experimental-Formal-0.6B es un ajuste fino de tipo QLoRA sobre Qwen/Qwen3-0.6B, publicado por el usuario Davide531 en HuggingFace. Se presenta como la primera entrega de la serie KyroLM, una familia de modelos pequenos orientados a un estilo de respuesta formal, serio y directo, con bloques de razonamiento explicito delimitados por las etiquetas `<think>...</think>`. El problema que aborda es acotado pero concreto: ofrecer un asistente local, de bajo consumo y con un tono controlado, que no recurra a muletillas ni a un registro coloquial.

El modelo hereda del base la arquitectura transformer decoder-only de Qwen3-0.6B, con aproximadamente 596 millones de parametros en safetensors (la model card del autor indica 606M, incluyendo los 10M entrenables mediante LoRA). La ventana de contexto es reducida: 1.024 tokens durante el entrenamiento y 2.048 o mas en inferencia segun el autor. El ajuste se realizo con Unsloth sobre unas 1.035 muestras curadas, 3 epocas y una perdida final de aproximadamente 0,20.

Su relevancia radica en el nicho, no en la escala: es un modelo de menos de 600 MB en cuantizacion Q4_K_M que se ejecuta en CPU y en equipos de consumo, con licencia MIT y pesos en safetensors y GGUF. Resulta util como banco de pruebas de ajuste fino con QLoRA, como asistente local de tareas aritmeticas sencillas y como ejemplo de control de tono y de rechazos mediante prompt de sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion causal (la del modelo base Qwen/Qwen3-0.6B) |
| Parametros totales | 596.049.920 (safetensors); la model card indica 606M, de los cuales 10M entrenables con LoRA |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento; 2.048 o mas en inferencia (segun el autor) |
| Tipos de cuantizacion | GGUF Q4_K_M publicada (unos 400 MB); entrenamiento en QLoRA de 4 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) y GGUF |
| Modelo base | Qwen/Qwen3-0.6B |
| Metodo de ajuste | QLoRA (4 bits) con Unsloth |
| Datos de entrenamiento | Unas 1.035 muestras curadas; 3 epocas; perdida final aproximada de 0,20 |
| Formato de prompt | ChatML (`<|im_start|>` / `<|im_end|>`) |
| Tamano del repositorio | 0,8 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-0.6B: un transformer decoder-only con atencion causal, sin modificaciones estructurales por parte del autor. La intervencion se limita al ajuste de los pesos mediante adaptadores LoRA de bajo rango sobre una cuantizacion de 4 bits, aplicada con la libreria Unsloth. No se introducen cabezas adicionales, cambios en el tokenizador ni mecanismos de atencion alternativos.

El conjunto de datos se construyo desde cero y contiene aproximadamente 1.035 ejemplos etiquetados por categoria: unas 600 muestras de matematicas (aritmetica, porcentajes y algebra) con razonamiento explicito, alrededor de 90 conversaciones multiturno de modo mixto, 45 de ciencia, 45 de geografia, 40 de tecnologia, 40 de identidad, 40 de rechazos, 35 de escritura, 25 de saludos, 20 de historia, 20 de intentos de jailbreak, 20 de respuestas del tipo "no lo se" y 10 de salud y bienestar. Cada ejemplo sigue el formato ChatML y, en la mayoria de categorias, incorpora un bloque `<think>...</think>` previo a la respuesta final. El entrenamiento se prolongo durante 3 epocas y convergio a una perdida final en torno a 0,20. No se documenta en la informacion disponible ninguna fase de RLHF o DPO posterior al ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en ingles con registro formal, frases completas y ausencia deliberada de muletillas.
- Razonamiento aritmetico paso a paso: suma, porcentajes y algebra elemental, con la cadena de razonamiento expuesta dentro del bloque `<think>`.
- Modo de pensamiento conmutable: el autor documenta dos configuraciones, una con razonamiento interno habilitado (indicada para matematicas, logica y codigo) y otra con `/no_think` para respuestas directas.
- Respuestas de identificacion y presentacion personal, con 40 ejemplos dedicados en el conjunto de entrenamiento.
- Escritura breve: correos, resumenes y textos cortos, con unos 35 ejemplos de entrenamiento.
- Rechazo formal de peticiones daninas: el modelo declina solicitudes peligrosas sin moralizar, segun los ejemplos incluidos en la model card.
- Gestion explicita de la incertidumbre: cuando no dispone de informacion fiable responde con la frase "I do not have reliable information on that."
- Conversacion multiturno basica, con unas 90 muestras de este tipo en el corpus.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, ejecucion multi-paso con herramientas ni uso de navegacion web.
- No dispone de capacidades de vision, audio ni multimodalidad.
- Multilingue: no, unicamente ingles.

## Casos de uso

- Asistente local sin conexion: el modelo cabe en cuantizacion Q4_K_M con unos 400 MB y se ejecuta en CPU mediante llama.cpp, LM Studio u Ollama, de modo que puede desplegarse en un portatil o en un equipo sin GPU dedicada para consultas puntuales.
- Practicas de aritmetica supervisadas: con el modo de pensamiento activado muestra la cadena de calculo dentro de `<think>`, lo que permite usarlo como material didactico para revisar el procedimiento y no solo el resultado.
- Filtro de tono en prototipos: sirve como referencia de como un ajuste fino pequeno puede imponer un registro formal y directo, util para equipos que quieran replicar la receta con su propio corpus.
- Banco de pruebas de QLoRA: con 1.035 ejemplos, 3 epocas y una perdida de 0,20 documentada, es un caso de estudio reproducible para validar pipelines de Unsloth antes de escalar a modelos mayores.
- Clasificacion y rechazo de peticiones: el corpus incluye 40 ejemplos de rechazo y 20 de jailbreak, por lo que puede emplearse como componente de filtrado previo en un pipeline mas amplio, siempre acompanado de un clasificador dedicado.
- Asistente de escritura breve: redaccion de correos y resumenes cortos dentro de la ventana de contexto disponible, en un entorno de escritorio donde la latencia y el consumo sean prioritarios.
- Pruebas de integracion de endpoints compatibles: el modelo declara compatibilidad con endpoints, lo que permite verificar el funcionamiento de un servidor de inferencia antes de desplegar modelos de mayor tamano.
- Demostraciones educativas de formato ChatML: al usar plantillas `<|im_start|>` y `<|im_end|>`, resulta util para ilustrar como se construyen plantillas de chat en proyectos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida final de entrenamiento, aproximadamente 0,20, que no es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 1,2 GB solo para los pesos, mas la memoria de activaciones y cache KV.
- VRAM estimada en cuantizacion Q4_K_M: en torno a 400 MB de pesos, con un consumo total tipico inferior a 1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, con margen amplio para lotes grandes.
- Funciona tambien en CPU pura y en Apple Silicon, que es el escenario recomendado por el autor mediante LM Studio, Ollama o llama.cpp.
- Opciones de despliegue documentadas por el autor: llama.cpp, Ollama, LM Studio y transformers con Python.
- Servidores de inferencia como vLLM o TGI no estan documentados en la model card, aunque el repositorio declara compatibilidad con endpoints.
- Parametros de muestreo recomendados por el autor: temperatura 0,6, top-p 0,95, min-p 0,05, penalizacion de repeticion 1,1 y 512-1.024 tokens maximos en modo pensamiento; temperatura 0,4, top-p 0,9, min-p 0,1, penalizacion 1,1 y 128-256 tokens maximos en modo directo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KyroLM-Gen1-Experimental-Formal-0.6B | 596 M | 1.024 en entrenamiento; 2.048+ en inferencia | MIT | safetensors y GGUF | Ajuste QLoRA sobre Qwen3-0.6B, orientado a tono formal |
| Qwen/Qwen3-0.6B | 0,6 B | 32.768 tokens nativos (segun Qwen) | Apache-2.0 | safetensors, GGUF | Modelo base; contexto muy superior y capacidades generales mas amplias |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF | Alternativa de la generacion anterior, con soporte multilingue |
| HuggingFaceTB/SmolLM2-360M-Instruct | 0,36 B | 8.192 tokens | Apache-2.0 | safetensors, GGUF | Modelo pequeno muy extendido para despliegue local |

Los datos de los modelos comparados provienen de sus fichas publicas. No se dispone de numeros de benchmark de KyroLM que permitan una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Riesgo alto de alucinacion en conocimiento factual: el propio autor situa fuera de alcance la precision en historia y geografia.
- Sin acceso a informacion reciente ni a la web; no puede responder sobre acontecimientos actuales.
- Ventana de contexto muy reducida: 1.024 tokens en entrenamiento y 2.048 o mas en inferencia, insuficiente para documentos largos o conversaciones extensas.
- Entrenamiento con solo 1.035 ejemplos, lo que limita la generalizacion fuera de las categorias cubiertas y favorece el sobreajuste al estilo del corpus.
- Dominios especializados excluidos explicitamente: medicina, derecho y finanzas no son usos previstos.
- No debe emplearse en decisiones de alto riesgo sin verificacion con fuentes fiables.
- Rechaza el roleplay y el cambio de persona por diseno, lo que puede ser una limitacion si se busca un asistente con personalidad configurable.
- Idiomas: unicamente ingles. No hay soporte documentado de castellano ni de otras lenguas.
- Sin soporte documentado de tool calling, function calling ni flujos de agente.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo derivado mantiene las obligaciones atribuibles al modelo base Qwen3-0.6B, distribuido bajo Apache-2.0.
- El repo tiene cero descargas y cero likes en el momento de la consulta, por lo que no existe validacion externa de su comportamiento en produccion.
- Se observa una discrepancia entre los parametros declarados (606M) y los reales en safetensors (596.049.920); conviene verificar el checkpointe antes de integrarlo.
- El identificador de HuggingFace (`Davide531/KyroLM-Gen1-Experimental-Formal-0.6B`) no coincide con el nombre usado en los ejemplos de codigo de la model card (`Davide531/KyroLM-Formal-0.6B`), lo que puede provocar errores de carga.

## Enlaces

- HuggingFace: https://huggingface.co/Davide531/KyroLM-Gen1-Experimental-Formal-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Unsloth (framework de ajuste): https://github.com/unslothai/unsloth
