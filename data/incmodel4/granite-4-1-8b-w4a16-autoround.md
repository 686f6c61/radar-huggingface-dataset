# INCModel4/granite-4.1-8b-W4A16-AutoRound

## Resumen

INCModel4/granite-4.1-8b-W4A16-AutoRound es una version cuantizada del modelo IBM Granite 4.1 de 8 mil millones de parametros, publicada por el usuario INCModel4. La cuantizacion se ha realizado con la herramienta AutoRound de Intel, aplicando un esquema W4A16 (pesos de 4 bits, activaciones de 16 bits) con group_size 128 y simetria, tras 1000 iteraciones de ajuste. El objetivo es reducir el espacio en disco y los requisitos de memoria para inferencia manteniendo una recuperacion de rendimiento muy alta respecto al modelo original en BF16.

El modelo base, ibm-granite/granite-4.1-8b, pertenece a la familia Granite de IBM, orientada a generacion de texto y casos de uso empresariales. Esta version cuantizada conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors compatible con transformers y vLLM. Es relevante porque permite desplegar un modelo de 8B en hardware mas modesto con una perdida media de rendimiento inferior al 0,5 % segun la evaluacion publicada por el autor.

La ficha se centra en los datos disponibles en la model card y en los metadatos de Hugging Face. No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento del modelo base ni sobre sus capacidades completas (tool calling, vision, etc.), por lo que esos apartados se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Granite 4.1); cuantizacion AutoRound W4A16 |
| Parametros totales | 1.477.562.368 (segun safetensors del repo cuantizado; el modelo base se denomina 8B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (la configuracion de lm_eval usa max_length 131073, pero no se confirma como contexto oficial) |
| Tipos de cuantizacion | W4A16 int4, group_size 128, simetrica; atencion y proyecciones MLP cuantizadas; embeddings, lm_head y normalizacion en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint ibm-granite/granite-4.1-8b. La arquitectura subyacente es un transformer decoder-only de la familia Granite, aunque la model card no detalla el numero de capas, dimensiones ocultas ni el mecanismo de atencion. La cuantizacion se aplica exclusivamente a las proyecciones de atencion y MLP, manteniendo en BF16 los embeddings de tokens, el lm_head y las capas de normalizacion, lo que ayuda a preservar la calidad de la salida.

El proceso de cuantizacion se realizo con AutoRound (intel/auto-round), que optimiza el redondeo de pesos mediante descenso de gradiente con signo, segun el paper arXiv:2309.05516. Se usaron 1000 iteraciones de ajuste, 512 muestras de calibracion, seqlen 2048 y group_size 128, ignorando lm_head. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y matematicas: la evaluacion incluye GSM8K con un 92,36 % en la version cuantizada.
- Conocimiento general y sentido comun: evaluado con MMLU, PIQA y HellaSwag.
- Compatibilidad con endpoints: el repo incluye el tag endpoints_compatible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en servidores con VRAM limitada: al ser una cuantizacion W4A16, reduce el peso de los pesos a aproximadamente 4 bits por parametro en las capas cuantizadas, lo que permite servir el modelo en GPUs con menos memoria que las necesarias para BF16, manteniendo un 99,54 % de recuperacion media segun la evaluacion del autor.
- Generacion de codigo y asistencia tecnica: el modelo base Granite esta orientado a casos empresariales y la evaluacion incluye GSM8K; puede integrarse en asistentes de programacion o respuesta tecnica, aunque no se confirman capacidades especificas de codigo en la informacion disponible.
- Razonamiento matematico en produccion: con un 92,36 % en GSM8K (5-shot, segun la configuracion de lm_eval), es adecuado para tareas de resolucion de problemas aritmeticos y explicacion paso a paso.
- Atencion al cliente automatizada: el tag conversational y el pipeline text-generation permiten construir chatbots multi-turno; la ventana de contexto real debe verificarse en la configuracion del modelo base antes de desplegar.
- Evaluacion y benchmarking interno: el repo incluye comandos de lm_eval listos para reproducir PIQA, HellaSwag, MMLU y GSM8K, lo que facilita comparar la version cuantizada con el modelo BF16 en un pipeline propio.
- Prototipado rapido con vLLM: la model card proporciona el comando `vllm serve` con `--dtype bfloat16` y `--kv-cache-dtype auto`, lo que permite levantar un endpoint compatible con la API de OpenAI para pruebas y demos.
- Investigacion sobre cuantizacion: util para estudiar la degradacion de rendimiento de AutoRound W4A16 frente a BF16 en un modelo de 8B, con resultados publicados de recuperacion por benchmark.

## Benchmarks y rendimiento

| Benchmark | BF16 | W4A16 | Recuperacion |
|---|---:|---:|---:|
| PIQA | 79,05 | 78,94 | 99,86 % |
| HellaSwag | 62,84 | 62,28 | 99,11 % |
| MMLU | 71,68 | 71,09 | 99,18 % |
| GSM8K | 92,49 | 92,36 | 99,85 % |
| Media | 76,52 | 76,17 | 99,54 % |

Datos publicados por el autor en la model card. La evaluacion se realizo con lm_eval sobre un endpoint local compatible con la API de completions, con 5-shot para GSM8K y configuracion estandar para el resto.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 9,9 GB en disco; en inferencia, los pesos cuantizados a 4 bits en las capas de atencion y MLP reducen el uso de memoria frente a BF16, aunque embeddings y lm_head permanecen en BF16. Una estimacion conservadora situa el modelo en el rango de 6-10 GB de VRAM para los pesos, mas la cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, deberia caber en GPUs consumer con 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU consumer: probablemente si, en modelos con 12 GB o mas, aunque no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: vLLM 0.33.0 con transformers 5.20.2 (segun la model card). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| INCModel4/granite-4.1-8b-W4A16-AutoRound | 1.477.562.368 (safetensors del repo cuantizado) | no disponible | apache-2.0 | safetensors | Cuantizacion W4A16 de Granite 4.1 8B |
| ibm-granite/granite-4.1-8b | 8B (denominacion) | no disponible | apache-2.0 | safetensors | Modelo base en BF16; referencia de calidad |
| Otras cuantizaciones de Granite 4.1 8B (GPTQ, AWQ) | 8B | no disponible | apache-2.0 | safetensors / GGUF | No se dispone de datos comparativos en la informacion proporcionada |

No se han encontrado en la informacion proporcionada comparativas con modelos de otros fabricantes del mismo tamano.

## Limitaciones y advertencias

- El autor advierte que el modelo puede producir salidas factualmente incorrectas y no debe usarse como fuente de informacion veraz sin verificacion.
- Riesgo de generar contenido sesgado, obsceno u ofensivo debido a las limitaciones del modelo base y de los datasets de ajuste.
- La cuantizacion introduce una degradacion minima pero real: la recuperacion media es del 99,54 %, con HellaSwag como benchmark mas afectado (99,11 %).
- No se dispone de informacion sobre sesgos especificos, idiomas soportados ni limitaciones de contexto del modelo base en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el autor recomienda consultar a un abogado antes de usar el modelo con fines comerciales y realizar pruebas de seguridad antes del despliegue.
- El modelo requiere versiones concretas de vLLM (0.33.0) y transformers (5.20.2) segun la model card; otras versiones pueden no ser compatibles con el formato AutoRound.
- El numero de parametros reportado por safetensors (1.477.562.368) no coincide con la denominacion "8B" del modelo base; conviene verificar la configuracion real antes de dimensionar el hardware.

## Enlaces

- Hugging Face: https://huggingface.co/INCModel4/granite-4.1-8b-W4A16-AutoRound
- Modelo base: https://huggingface.co/ibm-granite/granite-4.1-8b
- Paper AutoRound: https://arxiv.org/abs/2309.05516
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
