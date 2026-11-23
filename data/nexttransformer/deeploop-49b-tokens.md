# NextTransformer/DeepLoop-49B-Tokens

## Resumen

DeepLoop-49B-Tokens es un checkpoint de investigación desarrollado por NextTransformer (proyecto Interactive-Active-AI) dentro de una comparativa de arquitecturas entrenadas sobre 49.152B tokens con el mismo presupuesto de cómputo. El modelo emplea una arquitectura transformer causal con "looped blocks": doce bloques compartidos que se ejecutan dos veces aplicando un esquema de escalado denominado DeepLoop α/β. Con 742.392.722 parámetros totales y una longitud de contexto de 2.048 tokens, no es un modelo destinado a producción, sino una pieza de un estudio empírico sobre el apilamiento de profundidad compartida.

El objetivo del trabajo es estabilizar la profundidad efectiva mediante normalización y escalado cuando los bloques se reutilizan, y aislar el efecto de esa reutilización frente a la parametrización residual y los cambios de normalización (de ahí la necesidad de controles emparejados que menciona la model card). Se entrenó sobre el dataset ClimbMix durante 46.875 actualizaciones y reporta un BPB de validación de 0,7145 y un CORE-22 (×100) de 25,45.

Su relevancia es metodológica: publica pesos, configuración y registros de ejecución de una ablación de arquitectura reproducible, algo poco habitual. No obstante, el propio autor advierte de que la auditoría independiente del registro de entrenamiento sigue pendiente, y el modelo carece de licencia declarada, idiomas especificados y datos de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con 12 bloques compartidos ejecutados dos veces (looped), escalado DeepLoop α/β |
| Parametros totales | 742.392.722 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`) + `model_config.json` + tokenizer en formato tiktoken JSON |
| Tokens de entrenamiento | 49.152B (46.875 actualizaciones) |
| Dataset de entrenamiento | ClimbMix |
| Tokenizer | tiktoken (codificación BPE con `pat_str` y `mergeable_ranks` serializados) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con atención estándar (no se documentan variantes lineales ni SSM) cuya peculiaridad es la reutilización de profundidad: doce bloques compartidos se aplican dos veces en serie, de modo que la profundidad efectiva es de 24 capas con solo 12 conjuntos de pesos. Sobre esa reutilización se aplica el esquema de escalado DeepLoop α/β, que junto con cambios en la parametrización residual y en la normalización busca estabilizar el entrenamiento y la inferencia cuando los bloques se recorren repetidamente. La model card subraya que estos tres factores (compartición, parametrización residual y normalización) cambian a la vez, por lo que se necesitan controles emparejados para atribuir efectos.

El entrenamiento se realizó sobre ClimbMix durante 46.875 actualizaciones hasta completar 49.152B tokens (de ahí el sufijo del repositorio). No se especifican en la información disponible la composición exacta del dataset, la mezcla de idiomas, ni si hubo fases de RLHF, DPO o SFT; el tag `pretrained` sugiere que se trata de un modelo base sin alineamiento posterior. El autor indica que escalar los Value Embeddings nativos es una adaptación y que los controles de normalización deben reportarse por separado. El registro de ejecución del entrenamiento reporta finalización y una auditoría de cómputo acumulada del propio trainer, pero la auditoría independiente de solo lectura sigue pendiente.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Modelo base preentrenado: no se documenta ajuste por instrucciones ni modo de razonamiento explícito.
- Razonamiento y conocimiento general medidos únicamente mediante CORE-22 (25,45 ×100) y BPB de validación (0,7145).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el tokenizer tiktoken y el dataset ClimbMix no se detallan en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Inferencia en CPU posible (el ejemplo oficial de carga funciona con `CUDA_VISIBLE_DEVICES=""`).

## Casos de uso

- Investigación en arquitecturas con profundidad compartida: el modelo sirve como punto de comparación reproducible frente a los demás checkpoints de la comparativa NextTransformer, cargando los pesos con la implementación fijada a un commit concreto.
- Reproducción de ablaciones: los enlaces a `results/methods/deeploop.json` y `results/runs/deeploop.json` permiten contrastar curvas de entrenamiento y métricas finales con los controles emparejados del estudio.
- Experimentos de eficiencia de parámetros: con 742M parámetros y 12 bloques físicos reutilizados, es útil para medir el compromiso entre profundidad efectiva y coste de memoria en entornos académicos.
- Prototipado de evaluación de tokenizers: al publicar el tokenizer como especificación tiktoken en JSON, facilita experimentos de tokenización y cálculo de BPB sobre corpus propios.
- Docencia y formación: su tamaño (2,3 GB en safetensors) permite cargarlo en CPU y estudiar el flujo completo de carga, configuración y decodificación de un transformer causal sin infraestructura GPU.
- Pruebas de pipelines de inferencia personalizados: útil para validar integraciones con la librería `nexttransformer` y el lector de safetensors en entornos Python 3.10–3.13.
- Baseline para estudios de escalado: al estar entrenado con un presupuesto fijo de 49.152B tokens, sirve como referencia controlada en comparaciones de arquitectura a pequeña escala.

## Benchmarks y rendimiento

| Evaluación final | Resultado |
|---|---:|
| Validation BPB | 0,7145 |
| CORE-22 (×100) | 25,45 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con modelos de referencia dentro de la propia model card.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB para los pesos (742M parámetros × 4 bytes) más activaciones y caché KV para 2.048 tokens.
- En fp16/bf16: alrededor de 1,5 GB de pesos; en int8, en torno a 0,75 GB.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) e incluso en CPU, como demuestra el ejemplo oficial.
- El caché KV es reducido gracias al contexto de 2.048 tokens, por lo que el cuello de botella será el cómputo, no la memoria.
- Opciones de despliegue: la vía soportada es la librería `nexttransformer` (instalada desde el repositorio fijado a un commit) junto con `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos en GGUF no hay ruta directa a llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de los demás checkpoints de la comparativa NextTransformer en la información proporcionada, por lo que no es posible establecer una comparación numérica fiable. A modo de referencia estructural, se puede contrastar con modelos base de tamaño similar, aunque sin datos de rendimiento comparables:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepLoop-49B-Tokens | 742M | 2.048 | No disponible | Pesos en HF (safetensors) |
| Alternativas de ~700M-1B (p. ej. familias tipo Llama, Qwen o Pythia) | ~700M-1.4B | 2.048-32.768 según modelo | Varía (MIT, Apache 2.0, etc.) | Pesos en HF, GGUF y múltiples runtimes |
| Controles de la comparativa NextTransformer | No disponible | No disponible | No disponible | No disponible |

La comparación de rendimiento con esas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no debe usarse como asistente conversacional sin un post-entrenamiento previo.
- Contexto muy corto (2.048 tokens), insuficiente para tareas de documento largo, RAG con muchos fragmentos o conversaciones multi-turno extensas.
- Licencia no declarada: no hay autorización explícita para uso comercial; en la práctica, la ausencia de licencia impide asumir permisos de redistribución o explotación.
- Idiomas no especificados: se desconoce la cobertura lingüística real y el rendimiento fuera del inglés.
- Auditoría independiente del entrenamiento pendiente según el propio autor, lo que limita la confianza en la reproducibilidad completa del cómputo reportado.
- Riesgo de alucinación inherente a un modelo base de 742M parámetros entrenado con 49B tokens; el BPB de 0,7145 y el CORE-22 de 25,45 indican un conocimiento limitado en comparación con modelos de mayor escala.
- Dependencia de una implementación concreta (`nexttransformer` fijada a un commit): cambios en esa librería pueden romper la carga de pesos.
- Sin datos publicados de sesgos, robustez, seguridad ni evaluaciones de toxicidad.
- No hay pesos cuantizados oficiales ni soporte documentado en runtimes de inferencia estándar, lo que complica el despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NextTransformer/DeepLoop-49B-Tokens
- Repositorio NextTransformer (commit de referencia): https://github.com/Interactive-Active-AI/NextTransformer/tree/b2ea46627f7d0d5c9ef57a655c43b553558417d3
- Registro de método (DeepLoop): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/deeploop.json
- Registro de ejecución: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/deeploop.json
