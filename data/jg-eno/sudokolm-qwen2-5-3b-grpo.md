# jg-eno/SudokoLM-Qwen2.5-3B-GRPO

## Resumen

SudokoLM-Qwen2.5-3B-GRPO es un ajuste fino del modelo instructivo Qwen2.5-3B, desarrollado por el usuario jg-eno (vinculado al Indian Institute of Technology Madras segun la URL del proyecto en Weights & Biases). El modelo parte de la version cuantizada a 4 bits `unsloth/qwen2.5-3b-instruct-bnb-4bit` y se ha entrenado con GRPO (Group Relative Policy Optimization), el algoritmo de aprendizaje por refuerzo introducido en el paper DeepSeekMath, utilizando la libreria TRL de Hugging Face. El nombre del modelo sugiere un objetivo centrado en la resolucion de sudokus y, por extension, en tareas de razonamiento estructurado, aunque la model card no documenta el conjunto de datos ni la funcion de recompensa empleada.

Se trata de un transformer decoder-only de aproximadamente 3.000 millones de parametros, denso (sin mezcla de expertos), con la ventana de contexto heredada del modelo base Qwen2.5-3B. El repositorio ocupa solo 0,1 GB, un tamano muy inferior al que ocuparian los pesos completos en safetensors (unos 6 GB en fp16), lo que apunta a que el repositorio contiene exclusivamente adaptadores LoRA o pesos parciales en lugar del modelo fusionado. Este extremo no se confirma en la model card y conviene verificarlo antes de desplegarlo.

La relevancia de esta ficha es limitada pero ilustrativa: es un ejemplo tipico de ajuste por RL aplicado a un modelo pequeno, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Resulta util como referencia para quienes quieran replicar un pipeline de GRPO con TRL y Unsloth sobre modelos de 3B, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | Aproximadamente 3.000 millones (heredado del modelo base Qwen2.5-3B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct declara 32.768 tokens nativos, ampliables con YaRN |
| Tipos de cuantizacion | Modelo base en bitsandbytes 4 bits; cuantizaciones GGUF/AWQ/GPTQ no publicadas |
| Idiomas soportados | No disponibles en la model card; el modelo base Qwen2.5 declara soporte para 29 idiomas |
| Licencia | No disponible (la model card solo indica `licence: license` como marcador sin contenido) |
| Formato de pesos | safetensors (segun el tag del repositorio); el tamano de 0,1 GB sugiere adaptadores o pesos parciales, no confirmado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5 en su variante de 3.000 millones de parametros: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU, embeddings de RoPE y atencion con query-key-value sesgados (QKV bias), tal como se describe en la documentacion tecnica de la familia Qwen2.5. No se ha modificado la topologia del modelo base; el ajuste se aplica sobre los pesos preentrenados.

El entrenamiento se ha realizado con GRPO, un metodo de optimizacion de politica relativa a un grupo que elimina la necesidad de un modelo critico separado y estima la ventaja normalizando las recompensas dentro de un grupo de generaciones para la misma pregunta. Segun la model card, el entrenamiento se ejecuto con TRL 0.22.2, Transformers 4.56.2, PyTorch 2.9.1, Datasets 5.0.1 y Tokenizers 0.22.2, y el autor enlaza un run de Weights & Biases en el proyecto `sudokolm-grpo`. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa, el numero de pasos, el tamano de grupo de GRPO, la tasa de aprendizaje ni si se aplico RLHF o DPO adicional. Tampoco se documenta si el ajuste fue completo o mediante LoRA, aunque el tamano del repositorio apunta a lo segundo.

## Capacidades

- Generacion de texto instructivo multilingue: hereda las capacidades del modelo base Qwen2.5-3B-Instruct, incluido el seguimiento de instrucciones y el dialogo multi-turno.
- Razonamiento matematico y paso a paso: el uso de GRPO, algoritmo disenado para reforzar cadenas de razonamiento verificables, sugiere entrenamiento orientado a tareas con respuesta comprobable, presumiblemente la resolucion de sudokus.
- Resolucion de sudokus: el nombre del modelo y su origen apuntan a esta tarea especifica, aunque la model card no aporta ejemplos, formato de salida ni metricas de acierto.
- Soporte de tool calling: no documentado en la model card; el modelo base Qwen2.5-3B-Instruct lo soporta, pero no hay confirmacion de que se conserve tras el ajuste con GRPO.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no, es un modelo exclusivamente de texto.
- Modo "thinking" explicito: no documentado.
- Capacidad de generacion de codigo: no documentada especificamente para este ajuste; la hereda del modelo base en la medida en que el ajuste no la haya degradado.

## Casos de uso

- Replicacion de un pipeline de RL para razonamiento: utilizar este modelo y su run de W&B como referencia para montar un entrenamiento GRPO con TRL y Unsloth sobre un modelo denso de 3B, incluyendo la gestion de recompensas verificables.
- Investigacion sobre ajuste fino eficiente en memoria: al partir de un checkpoint en bitsandbytes de 4 bits, sirve como caso de estudio de QLoRA o entrenamiento con cuantizacion sobre una GPU de consumo.
- Evaluacion comparativa de degradacion por RL: resulta util para medir cuanto se pierde en capacidades generales de instruccion (conversacion, codigo, sentido comun) cuando se optimiza agresivamente una recompensa concreta con GRPO.
- Experimentos academicos de docencia: en un curso de aprendizaje por refuerzo aplicado a LLM, este modelo permite ilustrar el ciclo de muestreo, calculo de recompensa y actualizacion de politica sin necesidad de un cluster grande.
- Demostraciones de juguete para resolucion de restricciones: si el ajuste funciona, podria emplearse para generar tableros de sudoku resueltos, siempre con validacion programatica posterior, dado que no hay metricas publicadas de exactitud.
- Pruebas de integracion con la libreria transformers: el autor incluye un ejemplo con `pipeline("text-generation")`, por lo que sirve para verificar flujos de carga de adaptadores y pesos safetensors en entornos controlados.
- Base para un ajuste posterior especifico: al ser un modelo pequeno, se puede usar como punto de partida para un segundo ajuste supervisado sobre un dominio concreto, si la licencia lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, GSM8K, HumanEval, tasa de exito en sudokus ni ninguna otra evaluacion, y el repositorio no contiene un `README` con tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos completos fusionados: en fp16, aproximadamente 6,2 GB solo de pesos (3,09 mil millones de parametros x 2 bytes), mas 1-2 GB de cache KV y activaciones segun la longitud de contexto; en 4 bits, aproximadamente 1,6-2,5 GB de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM puede ejecutar la version en 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para fp16 se recomienda un minimo de 10-12 GB (RTX 3080 12 GB, RTX 4080, A10G). Para servicio con concurrencia alta, A100 40/80 GB o H100.
- Compatibilidad con GPU de consumo: si, con cuantizacion de 4 bits cabe holgadamente en GPUs de 8 GB y en algunas integradas con memoria unificada.
- Opciones de despliegue: transformers con `pipeline` (metodo documentado por el autor), vLLM o TGI para servicio en fp16 o cuantizado, llama.cpp/Ollama si se generan pesos GGUF (no publicados), y Unsloth para entrenamiento o fusion de adaptadores.
- Nota importante sobre el repositorio: con 0,1 GB de peso, es probable que sea necesario descargar el modelo base `unsloth/qwen2.5-3b-instruct-bnb-4bit` y aplicar los adaptadores, en lugar de cargar un modelo autonomo. Verificar la estructura de archivos antes de desplegar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| SudokoLM-Qwen2.5-3B-GRPO | ~3.000 M | No disponible (base: 32.768) | No disponible | Hugging Face, 0 descargas | No disponible |
| Qwen2.5-3B-Instruct | 3.090 M | 32.768 tokens (128K con YaRN) | Qwen Research License para la variante instruct | Hugging Face, ampliamente utilizado | Si, con benchmarks publicados por el autor |
| Llama-3.2-3B-Instruct | 3.210 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face y Meta | Si, con benchmarks publicados por el autor |
| Phi-3.5-mini-instruct | 3.800 M | 128.000 tokens | MIT | Hugging Face | Si, con benchmarks publicados por el autor |

La comparacion directa de rendimiento no es posible porque este ajuste no publica ninguna metrica. En terminos de licencia, los tres alternativas tienen condiciones claras y publicadas, mientras que este modelo no declara ninguna, lo que impide su uso comercial sin aclaracion previa del autor.

## Limitaciones y advertencias

- Licencia sin especificar: la model card contiene la cadena `licence: license` como marcador vacio. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion.
- Herencia de licencia del modelo base: `unsloth/qwen2.5-3b-instruct-bnb-4bit` deriva de Qwen2.5-3B-Instruct, cuya licencia Qwen Research restringe el uso comercial. Conviene verificar esta cadena antes de cualquier despliegue en produccion.
- Riesgo alto de alucinacion en tareas de razonamiento: no hay ninguna evaluacion publicada de exactitud resolviendo sudokus ni de correccion logica, por lo que las salidas deben validarse siempre con un solucionador programatico.
- Degradacion de capacidades generales: el ajuste con GRPO sobre una recompensa concreta puede reducir el rendimiento en conversacion general, codigo o seguimiento de instrucciones complejas, algo habitual en ajustes de RL intensivos y no medido aqui.
- Ausencia de datos de entrenamiento: se desconocen el dataset, la funcion de recompensa y el numero de pasos, lo que impide auditar sesgos o reproducir el resultado.
- Idiomas no declarados: no se especifica si el ajuste conserva el soporte multilingue del modelo base o si se ha limitado al idioma del dataset de entrenamiento, previsiblemente ingles.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en comunidad, ni issues resueltos, ni validacion independiente del funcionamiento del checkpoint.
- Duda sobre el contenido del repositorio: 0,1 GB es un tamano compatible con adaptadores, no con pesos completos. Si se carga como modelo autonomo puede fallar o producir resultados incorrectos.
- Sin soporte de tool calling verificado: no se ha confirmado que el formato de llamada a herramientas de Qwen2.5 sobreviva al ajuste con GRPO.
- Fechas del repositorio: la model card indica fechas de creacion y actualizacion de septiembre de 2026, posteriores a la version de las librerias declaradas; conviene tratarlo como un artefacto experimental.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo: devuelven listas de tiers del videojuego League of Legends, sin ninguna relacion con el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jg-eno/SudokoLM-Qwen2.5-3B-GRPO
- Modelo base: https://huggingface.co/unsloth/qwen2.5-3b-instruct-bnb-4bit
- Run de entrenamiento en Weights & Biases: https://wandb.ai/jglenenosh-indian-institute-of-technology-madras/sudokolm-grpo/runs/976g396j
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio de TRL: https://github.com/huggingface/trl
