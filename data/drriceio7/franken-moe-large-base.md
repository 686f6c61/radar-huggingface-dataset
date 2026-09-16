# DrRiceIO7/Franken-MoE-Large-Base

## Resumen

Franken-MoE-Large-Base es un modelo experimental publicado por el usuario DrRiceIO7 en HuggingFace, consistente en un upcycling del modelo denso Qwen/Qwen3-0.6B a una arquitectura nativa de Mixture-of-Experts (MoE) de la familia Qwen3. El resultado declara 4.560.125.952 parámetros totales y unos 860 millones de parámetros activos por token, con 16 expertos enrutados y activación top-2. El objetivo declarado es combinar una base densa preentrenada (18T tokens, según la model card) con una topología MoE expandida que mantenga el coste de cómputo y la velocidad de generación de un modelo de menos de 1.000 millones de parámetros.

La relevancia de esta ficha es fundamentalmente metodológica: se trata de un ejemplo de conversión densa-a-MoE ("upcycling") usando el formato oficial `Qwen3MoeForCausalLM`, con layout de tensores fusionado en 3D (`gate_up_proj`, `down_proj`) y sin expertos compartidos heredados. Interesa a quien investigue enrutado de expertos, inicialización de MoE a partir de checkpoints densos y compatibilidad de toolchains (Transformers, Unsloth, llama.cpp, vLLM).

Ahora bien, el propio autor advierte en la model card de que el modelo **no ha sido reentrenado** y que deben esperarse "salidas rotas, bucles y otras rarezas generales", con una versión "curada y ajustada" prometida para más adelante. Por tanto, no es un modelo utilizable en producción en su estado actual, sino un artefacto de investigación con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (clase `Qwen3MoeForCausalLM`), upcycled desde Qwen3-0.6B |
| Parametros totales | 4.560.125.952 (4,56B) |
| Parametros activos | 860M por token |
| Longitud de contexto | 40.960 tokens (RoPE theta = 1.000.000) |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio (solo safetensors). El autor indica que puede convertirse a GGUF con `convert_hf_to_gguf.py`, lo que habilita cuantizaciones tipo Q4_K_M, Q5_K_M o Q8_0 segun el soporte de llama.cpp |
| Idiomas soportados | Ingles (`en`) segun la model card; el tokenizador Qwen3 es multilingue, pero el modelo no declara otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamano de repositorio 9,1 GB, coherente con bf16) |
| Configuracion detallada | 28 capas, hidden dim 1.024, intermediate dim 3.072, vocab 151.936, GQA 16:8 con QK-Norm (`q_norm`, `k_norm`), 16 expertos, `num_experts_per_tok=2`, `norm_topk_prob=True` |
| Modelo base | Qwen/Qwen3-0.6B |
| Pipeline | text-generation |
| Fecha de creacion / actualizacion | 15/09/2026 (creacion y ultima actualizacion el mismo dia) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-0.6B (28 capas, dimensión oculta 1.024, dimensión intermedia 3.072, vocabulario de 151.936 tokens) y expande la capa feed-forward densa SwiGLU a un bloque MoE con 16 expertos enrutados y activación top-2 con probabilidades normalizadas (`norm_topk_prob=True`). La atención es Grouped-Query Attention con ratio 16:8 (16 cabezas de consulta, 8 de clave/valor) e incluye QK-Norm. La longitud de contexto declarada es de 40.960 tokens, con RoPE configurado con theta = 1.000.000. El modelo emplea el layout oficial de tensores fusionados en 3D (`gate_up_proj` y `down_proj`) y no utiliza expertos compartidos del formato heredado.

No hay información publicada sobre el proceso de inicialización de los expertos ni del enrutador (por ejemplo, si los expertos se replican del FFN original con ruido, si el router se inicializa aleatoriamente o si hubo un paso de "healing"). Tampoco se documenta ningún entrenamiento posterior: el autor afirma explícitamente que el modelo **no ha sido reentrenado**, por lo que no hay datos de tokens de entrenamiento adicionales, composición de dataset, ni fases de SFT, RLHF o DPO. La única cifra de entrenamiento mencionada (18T tokens) corresponde a la base densa Qwen3-0.6B, no a este modelo.

Como innovaciones técnicas destacables de la ficha cabe señalar el propio ejercicio de upcycling a formato MoE nativo, la compatibilidad declarada con Unsloth, llama.cpp/GGUF, Transformers, vLLM, SGLang y Ollama, y el ratio de cómputo: 4,56B parámetros almacenados frente a 860M activos, lo que en teoría sitúa el coste por token en el rango de un modelo denso de menos de 1.000 millones de parámetros.

## Capacidades

- Generacion de texto: tecnicamente el modelo produce texto, pero el autor advierte de salidas rotas, repeticiones y bucles. No puede considerarse una capacidad fiable en el estado actual.
- Razonamiento, matematicas y codigo: no hay evidencia publicada de que estas capacidades se hayan preservado tras el upcycling; no se han publicado evaluaciones.
- Tool calling / function calling: no documentado y no verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el estado del checkpoint (sin reentrenar) hace inviable cualquier uso agente fiable.
- Capacidades multilingues: la model card declara unicamente ingles. El tokenizador heredado de Qwen3 cubre mas idiomas, pero no hay validacion de que las capacidades multilingues sobrevivan al upcycling.
- Capacidad especial: ninguna declarada (no hay modo thinking, vision ni audio).
- Compatibilidad de ecosistema: carga directa con `AutoModelForCausalLM`, con Unsloth (`FastLanguageModel.from_pretrained`) y conversion a GGUF; soporte nativo declarado en vLLM, SGLang y Ollama.
- Uso previsto realista: servir como punto de partida para experimentos de ajuste fino (SFT) o de recuperacion de capacidades ("healing"), y como banco de pruebas de toolchains MoE.

## Casos de uso

- Investigacion en upcycling denso-a-MoE: el modelo permite estudiar como se comporta un checkpoint denso de 0,6B al expandirse a 16 expertos con top-2, midiendo divergencia de logits respecto al modelo original y patrones de enrutado (load balancing, colapso de expertos).
- Punto de partida para fine-tuning: al cargarse directamente en Unsloth y en Transformers con `device_map="auto"`, sirve como base para un SFT de recuperacion o para un ajuste en dominios concretos, dado que el autor promete una version curada.
- Validacion de pipelines de despliegue MoE: util para comprobar que vLLM, SGLang, llama.cpp o Ollama sirven correctamente un checkpoint `qwen3_moe` con layout 3D fusionado, antes de invertir en modelos MoE mayores.
- Conversion y cuantizacion a GGUF: caso practico de uso de `convert_hf_to_gguf.py` para generar Q4_K_M o Q8_0 y medir degradacion de perplejidad en funcion de la cuantizacion en un MoE de 4,56B/860M activos.
- Estudio de coste computacional y throughput: con 860M parametros activos y una ventana de 40.960 tokens, es un banco de pruebas barato para medir latencia, uso de KV cache y escalado con la longitud de contexto en arquitecturas MoE.
- Docencia y divulgacion tecnica: sirve para ilustrar en un aula o articulo como se pasa de un transformer denso a uno MoE, incluyendo la configuracion de `num_experts`, `num_experts_per_tok` y `norm_topk_prob`.
- Pruebas de robustez y deteccion de patologias: al presentar bucles y salidas degradadas de forma conocida, puede usarse como caso de estudio de fallos tipicos (repeticion, degeneracion del enrutador) en modelos no reentrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el autor advierte que el modelo no ha sido reentrenado y produce salidas rotas, por lo que cualquier metrica estandar careceria de sentido en este estado.

## Requisitos de hardware

- VRAM en bf16: los pesos ocupan aproximadamente 9,1 GB. Con 40.960 tokens de contexto, la KV cache estimada a partir de la arquitectura publicada (28 capas, 8 cabezas KV, head dim 64, bf16) es de unos 57 KB por token, es decir, del orden de 2,2 GB adicionales en el peor caso. Total aproximado: 11,5-12 GB mas overhead de activaciones.
- VRAM en Q8_0 (GGUF): en torno a 4,9 GB de pesos mas KV cache.
- VRAM en Q4_K_M (GGUF): en torno a 2,6-3 GB de pesos mas KV cache (estimacion segun el numero de parametros; no publicada por el autor).
- GPU recomendadas: H100 o A100 para experimentacion en bf16 con contexto completo y lotes grandes; RTX 4090 o RTX 3090 (24 GB) para bf16 a contexto completo en una sola tarjeta; RTX 4080 (16 GB) puede alojar bf16 con contexto recortado.
- GPU de consumo: si, cabe en GPUs de consumo. Con cuantizacion Q4 o Q5 es viable en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Con 6 GB o menos habria que recurrir a cuantizaciones agresivas y contextos cortos.
- CPU: con cuantizacion Q4 el modelo ocupa unos 2,6-3 GB, por lo que la inferencia en CPU via llama.cpp es factible, aunque lenta.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), Unsloth, vLLM, SGLang, Ollama y llama.cpp/GGUF (soporte de `qwen3_moe` declarado por el autor; no verificado de forma independiente en la informacion disponible). El soporte en TGI no esta confirmado.
- Latencia y throughput: no disponibles. Como referencia teorica, el coste por token corresponderia a un denso de 860M parametros activos, muy por debajo de un denso de 4,56B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Franken-MoE-Large-Base | 4,56B | 860M | 40.960 | Apache 2.0 | Experimental, sin reentrenar; salidas degradadas segun el autor |
| Qwen/Qwen3-0.6B (modelo base) | ~0,6B | No aplica (denso) | ~32.768 nativo (ampliable con YaRN) | Apache 2.0 | Modelo denso publicado y entrenado; ampliamente usado |
| Qwen3-30B-A3B (MoE nativo de la misma familia) | ~30,5B | ~3,3B | ~32.768 nativo (ampliable con YaRN) | Apache 2.0 | MoE nativo entrenado; referencia de la familia para comparar topologias |

Nota: los datos de los modelos de referencia proceden de sus fichas oficiales y se incluyen como contexto de categoria. No existe comparacion de rendimiento posible con Franken-MoE-Large-Base porque no se han publicado benchmarks de este ultimo. No se dispone de informacion sobre otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no reentrenado: el autor advierte explicitamente de "salidas rotas", bucles y comportamientos anomalos. No debe usarse en produccion ni en aplicaciones orientadas a usuarios finales.
- Riesgo de alucinacion: no evaluado, pero dado que las salidas ya son degeneradas, el riesgo de contenido incorrecto o incoherente es alto por construccion.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos. El modelo deriva de Qwen3-0.6B y hereda, en principio, los sesgos de su corpus de preentrenamiento, sin que existan datos que permitan cuantificarlos.
- Idioma: solo se declara ingles. No hay validacion de capacidades en castellano ni en otros idiomas.
- Tool calling y agentes: no documentados; no deben asumirse.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia. Al derivar de Qwen3-0.6B (tambien Apache 2.0), no hay restricciones adicionales conocidas, pero conviene verificar la model card original en caso de redistribuir.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo dia, sin validacion independiente de la comunidad. La compatibilidad declarada con vLLM, SGLang, Ollama y llama.cpp es una afirmacion del autor, no verificada en la informacion disponible.
- Documentacion incompleta: no se detalla la inicializacion de expertos ni del enrutador, ni el proceso de upcycling, lo que dificulta reproducir el experimento.
- KV cache: la ventana de 40.960 tokens implica un consumo de memoria no despreciable (del orden de 2,2 GB en bf16), que hay que sumar a los pesos.
- Riesgo de colapso de expertos: al no haber entrenamiento, es plausible un enrutado degenerado (uso desbalanceado de expertos), aunque no hay mediciones publicadas que lo confirmen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DrRiceIO7/Franken-MoE-Large-Base
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados devueltos por la busqueda corresponden a servicios de correo electronico (freemail.hu) y no guardan ninguna relacion con el modelo.
