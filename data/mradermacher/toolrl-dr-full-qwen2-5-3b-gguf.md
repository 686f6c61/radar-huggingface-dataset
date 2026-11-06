# mradermacher/ToolRL-DR-Full-Qwen2.5-3B-GGUF

## Resumen

ToolRL-DR-Full-Qwen2.5-3B-GGUF es la version cuantizada en formato GGUF del modelo willchow66/ToolRL-DR-Full-Qwen2.5-3B, un ajuste fino de Qwen2.5-3B-Instruct orientado al uso de herramientas (tool-use) y function calling. El modelo base parte de la familia Qwen2.5, con 3.397.103.616 parametros totales, y ha sido entrenado mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) incorporando domain randomization (DR) para mejorar la robustez frente a variaciones en las definiciones de herramientas y en los entornos de ejecucion. El autor de la cuantizacion es mradermacher, que publica versiones estaticas en GGUF para su uso con llama.cpp y derivados.

El interes de esta ficha radica en que combina dos elementos poco habituales en modelos de 3B: por un lado, un entrenamiento especifico de RL para tool calling, no solo SFT; por otro, una estrategia de domain randomization que busca que el modelo generalice mejor cuando las herramientas cambian de nombre, formato o esquema. Esto lo hace relevante para pipelines de agentes ligeros que necesitan ejecutarse en hardware modesto.

La cuantizacion GGUF permite desplegar el modelo en CPU o en GPUs de consumo con requisitos de VRAM reducidos (desde 1,5 GB en Q2_K hasta 3,7 GB en Q8_0), lo que facilita prototipado local de agentes y function calling sin depender de infraestructura de servidor. El modelo declara soporte unicamente para ingles y licencia qwen-research.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen2.5-3B-Instruct, con 3.397.103.616 parametros. Sobre esa base, el autor aplica un ajuste fino con aprendizaje por refuerzo usando GRPO, una variante de policy optimization que estima ventajas relativas dentro de grupos de muestras y que se ha popularizado para tareas de razonamiento y tool-use. Ademas, incorpora domain randomization (DR): durante el entrenamiento se varian sistematicamente las definiciones de herramientas, los esquemas y posiblemente los entornos, con el objetivo de que el modelo no memorice formatos concretos y generalice a especificaciones nuevas.

Los tags del modelo incluyen tool-use, function-calling, reinforcement-learning, grpo, robustness, domain-randomization y AgentRobustBench, lo que sugiere que la evaluacion se realizo sobre un benchmark propio o especifico de robustez de agentes. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases adicionales de SFT o DPO mas alla del RL con GRPO. Tampoco se detalla si se emplearon tecnicas como decodificacion especulativa o attention linear; al derivar de Qwen2.5, cabe esperar la atencion estandar de esa familia, pero no se confirma en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-3B-Instruct.
- Tool calling y function calling: el entrenamiento con RL y domain randomization esta orientado especificamente a emitir llamadas a herramientas correctas y robustas.
- Robustez ante variaciones en esquemas de herramientas: la domain randomization busca que el modelo tolere cambios en nombres, parametros y formatos de las definiciones.
- Razonamiento multi-paso orientado a agentes: el tag AgentRobustBench sugiere evaluacion en escenarios de agente con multiples pasos.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Agentes de function calling en local: el modelo puede ejecutarse con llama.cpp u Ollama en una GPU de consumo y emitir llamadas a APIs internas, lo que permite prototipar agentes sin coste de inferencia en la nube.
- Pipelines de automatizacion con herramientas cambiantes: gracias al entrenamiento con domain randomization, es adecuado cuando los esquemas de las herramientas se actualizan con frecuencia y se necesita un modelo que no dependa de un formato fijo.
- Asistentes de linea de comandos: con cuantizaciones Q4_K_M (2,2 GB) puede integrarse en herramientas CLI que traduzcan lenguaje natural a comandos o llamadas a funciones del sistema.
- Evaluacion de robustez de agentes: util como baseline ligero en investigacion sobre AgentRobustBench y para comparar estrategias de RL frente a SFT puro en tool-use.
- Enrutamiento de consultas a APIs: el modelo puede clasificar la intencion del usuario y seleccionar la herramienta adecuada en un sistema de orquestacion, con latencia baja en hardware modesto.
- Educacion e investigacion en RL para agentes: al ser un modelo de 3B con receta GRPO + DR, sirve como caso de estudio reproducible para experimentos academicos con recursos limitados.
- Despliegue en entornos con restricciones de VRAM: las cuantizaciones Q2_K (1,5 GB) y Q3_K_S (1,7 GB) permiten ejecucion en CPU o GPUs integradas para tareas de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni resultados de AgentRobustBench, y la busqueda web no aporta metricas del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,5 GB; Q3_K_S ~1,7 GB; Q3_K_M ~1,8 GB; Q3_K_L ~1,9 GB; IQ4_XS ~2,0 GB; Q4_K_S ~2,1 GB; Q4_K_M ~2,2 GB; Q5_K_S y Q5_K_M ~2,5 GB; Q6_K ~2,9 GB; Q8_0 ~3,7 GB; f16 ~6,9 GB. Hay que anadir overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes para el modelo completo en f16.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; en Q2_K y Q3_K_S puede ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en transformers puede servirse con vLLM o TGI, aunque las cuantizaciones publicadas son estaticas GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| ToolRL-DR-Full-Qwen2.5-3B-GGUF | 3,4B | no disponible | Tool-use con RL (GRPO) + domain randomization | qwen-research | GGUF |
| Qwen2.5-3B-Instruct | 3,1B aprox. (no confirmado) | no disponible | Instruccion general | qwen-research | safetensors, GGUF (por terceros) |
| Qwen2.5-3B-Instruct-Uncensored-GGUF (mradermacher) | ~3B | no disponible | Variante sin censura del instruct | qwen-research | GGUF |
| Qwen2.5-3B-Instruct-abliterated-GGUF (mradermacher) | ~3B | no disponible | Variante abliterated del instruct | qwen-research | GGUF |

La comparativa se limita a variantes de la misma familia Qwen2.5-3B encontradas en la busqueda; no se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte unicamente para ingles; el rendimiento en castellano no esta garantizado.
- Licencia qwen-research: restringe el uso comercial; es necesario revisar los terminos de la licencia de Qwen2.5-3B-Instruct antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: como todo modelo de 3B, puede generar llamadas a herramientas con parametros inventados o inexistentes, especialmente en esquemas complejos.
- Robustez no garantizada fuera del dominio de entrenamiento: la domain randomization mejora la generalizacion, pero no se han publicado metricas que cuantifiquen esa mejora.
- Sin datos de benchmarks: no hay evidencia publica de rendimiento en MMLU, HumanEval ni AgentRobustBench en la informacion disponible.
- Contexto: no se confirma la longitud de contexto efectiva del ajuste fino; conviene verificar la configuracion del modelo base antes de usarlo con prompts largos.
- Cuantizaciones bajas (Q2_K, Q3_K) pueden degradar la precision en la emision de JSON y llamadas a funciones; se recomienda Q4_K_M o superior para tool calling.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del modelo.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/mradermacher/ToolRL-DR-Full-Qwen2.5-3B-GGUF
- Modelo base: https://huggingface.co/willchow66/ToolRL-DR-Full-Qwen2.5-3B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ToolRL-DR-Full-Qwen2.5-3B-GGUF
- Licencia de referencia: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
