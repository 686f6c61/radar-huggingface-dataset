# nazimboudeffa/PicoGPT1-Jasmine-Tea

## Resumen

PicoGPT1-Jasmine-Tea es un modelo de generacion de texto en frances desarrollado por nazimboudeffa. Se trata de una adaptacion mediante LoRA del modelo base SmolLM2-135M de HuggingFaceTB, que a su vez emplea la arquitectura Llama. El modelo parte de un preentrenamiento solido del modelo base y aprende unicamente el formato "pregunta -> respuesta corta en frances" a partir de 40 pares escritos a mano, de los cuales 4 se reservan para evaluacion.

El modelo resuelve un problema muy acotado: demostrar que un adaptador LoRA de bajo rango puede imponer un formato de instruccion concreto sobre un modelo preentrenado pequeno sin necesidad de reentrenar desde cero. Los pesos publicados son el resultado de la fusion de la base con el adaptador, por lo que el modelo es directamente utilizable sin PEFT.

Es relevante como experimento reproducible de ajuste fino con datasets minimos, no como asistente generalista. El propio autor advierte que el modelo inventa hechos ausentes de los 40 ejemplos de entrenamiento y que su contexto esta limitado a 256 tokens, lo que lo situa en el terreno de la demostracion tecnica y la docencia mas que en el de la produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), base SmolLM2-135M |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | GGUF (exportacion a llama.cpp); cuantizaciones concretas no disponibles |
| Idiomas soportados | Frances (entrenado); ingles heredado del modelo base; lista oficial no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo fusionado) y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM2-135M, un transformer decoder-only de tipo Llama con 135 millones de parametros. Sobre esa base se entrena un adaptador LoRA de rango r=16 aplicado a todas las proyecciones de atencion y MLP, lo que supone 460.800 parametros entrenados. El adaptador se fusiona posteriormente con la base y se publica como un unico modelo en safetensors, con exportacion adicional a GGUF para su uso en llama.cpp.

Los datos de entrenamiento consisten en 40 pares prompt/respuesta en frances escritos manualmente, con 4 reservados para evaluacion. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La innovacion tecnica es minima y deliberada: el preentrenamiento de la base aporta el conocimiento linguistico y el adaptador solo aprende el formato de instruccion. El separador `\n` tras la pregunta reproduce el formato visto durante el entrenamiento y es necesario para obtener respuestas en el formato esperado.

## Capacidades

- Generacion de texto corto en frances siguiendo el formato "pregunta -> respuesta breve".
- Respuesta a instrucciones simples dentro del dominio de los 40 ejemplos de entrenamiento.
- Capacidad linguistica en frances heredada del preentrenamiento de SmolLM2-135M.
- Exportacion a GGUF y ejecucion mediante llama.cpp (llama cli, llama serve).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Capacidades multilingues limitadas al frances y al ingles heredado; sin lista oficial.

## Casos de uso

- Demostracion docente de ajuste fino con LoRA: el modelo sirve para ilustrar como un adaptador de 460.800 parametros impone un formato de instruccion sobre un modelo preentrenado, con un dataset de 40 ejemplos y un pipeline reproducible de cuatro scripts (train, merge, export, publish).
- Prototipado rapido de asistentes de formato fijo en frances: para validar la viabilidad de un flujo "pregunta -> respuesta corta" antes de invertir en un dataset mayor, dado el bajo coste de entrenamiento e inferencia.
- Pruebas de integracion con llama.cpp: al publicarse en GGUF, permite verificar pipelines de despliegue local (llama cli, llama serve en el puerto 9931) con un modelo de 0,8 GB de repositorio.
- Evaluacion de tecnicas de fusion de adaptadores: el script merge_tea.py y el modelo fusionado publicado permiten comparar el comportamiento del adaptador fusionado frente al uso con PEFT.
- Generacion de respuestas de formato controlado en entornos con recursos muy limitados: con 135 millones de parametros y contexto de 256 tokens, cabe en CPU y en GPUs de gama baja para tareas de demostracion.
- Experimentacion con exportacion GGUF: el script export_gguf_tea.py y la instruccion de uso con llama cli permiten estudiar el proceso de conversion de un modelo fusionado a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una evaluacion cualitativa sobre 4 ejemplos reservados, sin metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 134,5 millones de parametros; en fp32 ocupa aproximadamente 0,54 GB y en fp16 alrededor de 0,27 GB, mas overhead de activaciones y cache KV. Cifras orientativas calculadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas de 4 GB o menos. Para lotes grandes o mayor throughput, una RTX 4090 o A100 estarian sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM; tambien es viable en CPU.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp mediante `llama cli -hf` y `llama serve -hf` (puerto 9931), y TGI segun los tags del repositorio (text-generation-inference).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PicoGPT1-Jasmine-Tea | 134,5 M | 256 tokens | no disponible | Hugging Face (safetensors, GGUF) |
| SmolLM2-135M (base) | 135 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| PicoGPT1-Jasmine | no disponible | no disponible | no disponible | Hugging Face (variante previa del mismo autor) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La diferencia principal frente a SmolLM2-135M es el ajuste LoRA para el formato de instruccion en frances; frente a PicoGPT1-Jasmine, el cambio de paradigma (partir de un modelo preentrenado en lugar de entrenar un GPT-2 desde cero sobre 500 ejemplos).

## Limitaciones y advertencias

- Modelo experimental: el autor lo declara explicitamente como no apto para uso como asistente generalista.
- Alucinacion de hechos: inventa cualquier informacion ausente de los 40 ejemplos de entrenamiento.
- Contexto muy limitado: 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Dataset minimo: 40 ejemplos, de los cuales 4 para evaluacion; el ajuste solo cubre el formato y no aporta conocimiento factual.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue en produccion.
- Idiomas: el ajuste esta orientado al frances; el comportamiento en otros idiomas depende del modelo base y no esta documentado.
- Dependencia del formato: el separador `\n` tras la pregunta es necesario para reproducir el formato de entrenamiento; prompts fuera de ese formato pueden degradar la calidad.
- Publicacion sobrescritura: el script publish_tea.py sobrescribe los archivos del repositorio en cada ejecucion, lo que puede afectar a la reproducibilidad de versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nazimboudeffa/PicoGPT1-Jasmine-Tea
- Repositorio del codigo fuente (rama experiment/tiny-dataset): https://github.com/nazimboudeffa/picogpt1-jasmine/tree/experiment/tiny-dataset
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
