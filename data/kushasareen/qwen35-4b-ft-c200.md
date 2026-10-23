# kushasareen/qwen35-4b-ft-c200

## Resumen

`kushasareen/qwen35-4b-ft-c200` es un ajuste fino (fine-tune) del modelo Qwen3.5-4B de Alibaba Qwen, publicado por el usuario kushasareen bajo licencia Apache 2.0. Segun la model card, el entrenamiento se realizo mediante aprendizaje por refuerzo (reinforcement learning) durante 200 pasos de optimizador, y el repositorio contiene los pesos, la configuracion y el tokenizador tal y como los guardo el entrenador. No se documenta que algoritmo de RL se empleo (PPO, GRPO, DPO u otro), ni el dataset, ni la funcion de recompensa, ni los hiperparametros.

El modelo hereda la base Qwen3.5-4B: un transformer denso de aproximadamente 4,54 mil millones de parametros (4.539.265.536 segun los safetensors) con una longitud de contexto nativa declarada de 262.144 tokens y una base multimodal de vision-lenguaje. El repositorio ocupa 9,1 GB, lo que es coherente con pesos en precision de 16 bits.

Su relevancia practica es limitada pero concreta: se trata de un artefacto de investigacion con documentacion minima, cero descargas y cero valoraciones en el momento de la consulta. Resulta util como referencia para reproducir pipelines de RL sobre modelos Qwen y para estudiar el efecto de un ajuste por refuerzo corto sobre un modelo base de 4B, no como modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredado de Qwen3.5-4B); la model card no detalla capas, atencion ni cabezas |
| Parametros totales | 4.539.265.536 (~4,54 B) segun safetensors |
| Parametros activos | No aplica: modelo denso, no se declara arquitectura MoE |
| Longitud de contexto | 262.144 tokens segun la informacion publica del modelo base Qwen3.5-4B; no verificado en la configuracion del fine-tune |
| Tipos de cuantizacion | No declarados por el autor. Al distribuirse en safetensors para transformers, es convertible a GGUF, AWQ o GPTQ con herramientas externas |
| Idiomas soportados | No disponible: la model card no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |
| Tamano del repositorio | 9,1 GB |
| Modalidad declarada | `image-text-to-text` en los tags, aunque la model card indica `AutoModelForCausalLM` |
| Pipeline declarado | `reinforcement-learning` |
| Modelo base | Qwen/Qwen3.5-4B |
| Fecha de publicacion | 2026-10-23 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna: se limita a indicar que es un fine-tune de Qwen3.5-4B entrenado con aprendizaje por refuerzo durante 200 pasos de optimizador. Por la informacion publica del modelo base, Qwen3.5-4B es un transformer denso de 4B parametros con contexto nativo de 262.144 tokens, integrado en una base unificada de vision y lenguaje, y compatible con transformers, vLLM, SGLang y KTransformers. No se especifica si el fine-tune conserva la torre de vision, si se congelo durante el entrenamiento ni si el RL se aplico solo sobre el decodificador de texto.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, el algoritmo de RL, la funcion de recompensa, la tasa de aprendizaje ni si hubo etapas previas de SFT. El unico dato tecnico verificable es el numero de pasos (200), que sugiere un ajuste corto y posiblemente experimental. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, modo thinking explicito) mas alla de las que pueda aportar el modelo base.

## Capacidades

- Generacion de texto y razonamiento: capacidad heredada del modelo base, no evaluada ni documentada para este fine-tune.
- Codigo y matematicas: no documentado especificamente; depende del grado de degradacion o mejora introducido por los 200 pasos de RL.
- Vision y comprension imagen-texto: el tag `image-text-to-text` sugiere que la modalidad multimodal se conserva, pero la model card no lo confirma ni indica como cargar el procesador de imagen.
- Tool calling y function calling: no documentado. El modelo base lo soporta segun su documentacion publica, pero no hay confirmacion para este fine-tune.
- Agentes y razonamiento multi-paso: no documentado.
- Multilingue: no disponible; la model card no enumera idiomas.
- Modo thinking o razonamiento extendido: no documentado para este fine-tune.

Advertencia relevante: la model card propone cargar el modelo con `AutoModelForCausalLM`, lo que es coherente con un uso solo de texto pero entra en conflicto con el tag `image-text-to-text`. Conviene verificar `config.json` y la presencia de `preprocessor_config.json` antes de asumir capacidades multimodales.

## Casos de uso

- Reproduccion de experimentos de RL: el modelo sirve como punto de comparacion frente al base Qwen3.5-4B para medir el efecto de 200 pasos de optimizacion sobre tareas de razonamiento, con la precaucion de que no hay metricas publicadas.
- Investigacion sobre olvido catastrofico: al ser un ajuste corto y sin datos de evaluacion, es un candidato util para estudiar la degradacion de capacidades del modelo base tras un RL breve.
- Generacion de datos sinteticos en laboratorio: con 262.144 tokens de contexto heredados, puede emplearse para producir y filtrar muestras largas en pipelines internos donde no se exige trazabilidad de calidad.
- Prototipado interno de asistentes conversacionales: su tamano de 4,54B permite desplegarlo en una sola GPU de 24 GB en FP16 con contextos moderados, util para pruebas de concepto sin coste de infraestructura elevado.
- Base para un SFT posterior: al estar en safetensors y con licencia Apache 2.0, puede servir como inicializacion para un ajuste supervisado propio con datos de dominio, partiendo de un modelo ya expuesto a RL.
- Experimentos de cuantizacion: convertir los pesos a GGUF o AWQ y medir la perdida de calidad respecto a FP16 en tareas de texto, dado el reducido tamano del checkpoint.
- Evaluacion de pipelines de RLHF/RLVR: como artefacto intermedio para depurar procesos de entrenamiento con recompensas verificables antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y tampoco se han encontrado resultados de terceros para este fine-tune concreto. Cualquier cifra que se atribuya a este modelo debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9,1 GB solo para pesos (coincide con el tamano del repositorio), mas cache KV. Estimacion derivada del numero de parametros, no publicada por el autor.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4,8-5,5 GB de pesos; en 4 bits, aproximadamente 2,7-3,5 GB.
- Cache KV: con 262.144 tokens de contexto el cache domina el consumo y puede requerir decenas de GB. No se puede cuantificar con precision porque la configuracion (numero de capas, cabezas KV, uso de GQA) no esta disponible en la informacion proporcionada.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo en FP16 con contextos cortos o medios; en cuantizaciones de 4-8 bits cabe tambien en GPUs de 8-12 GB con contexto reducido.
- GPU de datacenter: A100 40/80 GB y H100 80 GB son adecuadas para servir el modelo con ventanas de contexto largas; el modelo base declara compatibilidad con vLLM, SGLang y KTransformers.
- Opciones de despliegue: transformers (`AutoModelForCausalLM.from_pretrained` segun la model card), vLLM y SGLang por herencia del base, y llama.cpp/Ollama solo tras una conversion a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por peticion para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| kushasareen/qwen35-4b-ft-c200 | ~4,54 B (denso) | 262.144 tokens (heredado del base, no verificado) | Apache 2.0 | No | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4 B (denso) | 262.144 tokens | Apache 2.0 (según repositorio del base) | No disponibles en la informacion recogida | Hugging Face, ModelScope, LM Studio |
| Qwen/Qwen3-4B (generacion anterior) | 4 B (denso) | No disponible en la informacion recogida | No disponible en la informacion recogida | No disponibles en la informacion recogida | Hugging Face |

La comparacion cuantitativa no es posible con los datos disponibles: no hay metricas publicadas para ninguno de los tres modelos en la informacion consultada. La diferencia observable se limita al proceso de entrenamiento (el fine-tune anade 200 pasos de RL) y al nivel de documentacion, mucho mayor en los repositorios oficiales de Qwen.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ablaciones ni comparaciones con el modelo base, por lo que se desconoce si el RL mejoro o degrado las capacidades originales.
- Riesgo de olvido catastrofico: 200 pasos de RL sin datos de mezcla declarados pueden deteriorar el rendimiento en tareas fuera de la distribucion de entrenamiento.
- Riesgo de reward hacking: al no documentarse la funcion de recompensa, no se puede descartar que el modelo haya aprendido atajos que inflen la metrica de entrenamiento sin mejorar la calidad real.
- Documentacion minima: la model card no indica algoritmo de RL, dataset, hiperparametros ni idiomas, lo que impide auditar el entrenamiento.
- Ambiguedad de carga: la card sugiere `AutoModelForCausalLM` mientras los tags declaran `image-text-to-text`; es necesario inspeccionar la configuracion antes de integrarlo.
- Alucinacion: sin evaluaciones, se asume el riesgo habitual de los modelos de 4B, potencialmente amplificado por un ajuste por refuerzo no auditado.
- Idiomas: no declarados; no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del ingles.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se distribuye sin garantias y conviene revisar tambien los terminos del modelo base Qwen3.5-4B.
- Sin validacion comunitaria: cero descargas y cero valoraciones implican que no existen informes independientes de calidad ni de fallos.
- No apto para produccion sin evaluacion previa: cualquier despliegue deberia ir precedido de una bateria propia de pruebas frente al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kushasareen/qwen35-4b-ft-c200
- Modelo base Qwen3.5-4B en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-4B
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Especificaciones y requisitos de VRAM del modelo base: https://apxml.com/models/qwen35-4b
- Referencia de la generacion anterior Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
