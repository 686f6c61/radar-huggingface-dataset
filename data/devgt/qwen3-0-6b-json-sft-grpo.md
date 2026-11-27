# devgt/Qwen3-0.6B-JSON-SFT-GRPO

## Resumen

Qwen3-0.6B-JSON-SFT-GRPO es un ajuste fino del modelo NotoriousH2/Qwen3-0.6B-JSON-SFT, que a su vez deriva de la familia Qwen3 en su variante mas pequena (0.6B parametros). Lo publica el usuario devgt en Hugging Face y esta orientado a la generacion de texto con enfasis en la produccion de JSON estructurado, segun se deduce del sufijo "JSON-SFT" del modelo base y del entrenamiento con GRPO (Group Relative Policy Optimization) que anade el autor. El modelo tiene 596.049.920 parametros reales (segun los pesos en safetensors) y un repositorio de 1,2 GB.

La relevancia de esta ficha es limitada: se trata de un experimento de ajuste fino de un modelo muy pequeno, sin descargas ni likes en el momento de la consulta y sin model card detallada mas alla de los metadatos minimos. No se documentan datos de entrenamiento, hiperparametros del GRPO, composicion del dataset ni resultados de evaluacion. La licencia Apache 2.0 permite uso comercial, lo que es un punto a favor para prototipado.

Por su tamano (0,6B), el modelo esta pensado para entornos con recursos muy limitados: ejecucion en CPU, GPUs de consumo, dispositivos edge o como componente de tareas acotadas (extraccion de JSON, clasificacion, formateo). No es un modelo de proposito general comparable a variantes de 7B o superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base Qwen3 admite cuantizacion GGUF/AWQ/BnB, pero no se documenta en esta ficha) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con atencion por causalidad. Al tratarse de la variante de 0,6B parametros, se espera una configuracion compacta (capas y dimensiones reducidas), aunque la model card no detalla la configuracion exacta (numero de capas, dimension oculta, cabezas de atencion, etc.). El autor indica que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un pipeline de ajuste fino supervisado (SFT) seguido de un refinamiento con GRPO.

El nombre del modelo indica dos fases: primero un SFT sobre JSON (heredado del modelo base NotoriousH2/Qwen3-0.6B-JSON-SFT) y despues un ajuste con GRPO, una variante de optimizacion por politica con recompensas relativas de grupo, habitualmente usada para reforzar comportamientos concretos (formato, razonamiento, adherencia a instrucciones). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la funcion de recompensa del GRPO ni si hubo etapas de DPO o RLHF adicionales.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Produccion de JSON estructurado, presumiblemente reforzada por el SFT del modelo base y el GRPO.
- Conversacion multi-turno basica (tag "conversational").
- Compatible con text-generation-inference y transformers.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues limitadas al ingles segun los metadatos.

## Casos de uso

- Extraccion de datos estructurados: dado un texto de entrada, generar un JSON con campos definidos; el ajuste SFT sobre JSON y el GRPO deberian mejorar la adherencia al esquema frente al modelo base.
- Prototipado rapido en local: al tener 0,6B parametros, se puede ejecutar en CPU o en GPUs de consumo para validar pipelines antes de escalar a modelos mayores.
- Formateo y normalizacion de respuestas: convertir texto libre en estructuras JSON para APIs o bases de datos en entornos con recursos limitados.
- Clasificacion con salida estructurada: usar el modelo para etiquetar textos devolviendo un JSON con la categoria y la confianza, integrable en pipelines de ingestion.
- Testing y evaluacion de tecnicas de RL: sirve como banco de pruebas para experimentos con GRPO y TRL sin requerir hardware grande.
- Educacion y experimentacion: util para estudiar el efecto del SFT y el GRPO en un modelo pequeno, comparando con el modelo base.
- Componente en sistemas edge: al caber en memoria de dispositivos modestos, puede desplegarse en entornos con restricciones de VRAM para tareas acotadas de generacion de JSON.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa, no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6-0,7 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0,35-0,4 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100, H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (si la arquitectura Qwen3 esta soportada), llama.cpp/Ollama mediante conversion a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| devgt/Qwen3-0.6B-JSON-SFT-GRPO | 596M | no disponible | Apache 2.0 | Hugging Face |
| NotoriousH2/Qwen3-0.6B-JSON-SFT (modelo base) | ~0,6B | no disponible | no disponible | Hugging Face |
| Qwen3-0.6B (original) | ~0,6B | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Modelo muy pequeno (0,6B): capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de 7B o superiores.
- Solo declarado para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion elevado en tareas de conocimiento abierto, como es habitual en modelos de este tamano.
- Sin datos de evaluacion publicados: no hay evidencia objetiva de la mejora del GRPO frente al modelo base.
- Sin informacion sobre sesgos del dataset de entrenamiento ni sobre filtrado de datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio; habria que generarlos.
- El nombre "GRPO" sugiere entrenamiento con recompensas, pero no se detalla la funcion de recompensa ni el riesgo de sobreajuste a un formato concreto.

## Enlaces

- Hugging Face: https://huggingface.co/devgt/Qwen3-0.6B-JSON-SFT-GRPO
- Modelo base: https://huggingface.co/NotoriousH2/Qwen3-0.6B-JSON-SFT
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
