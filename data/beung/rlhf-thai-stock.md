# beung/rlhf-thai-stock

## Resumen

El repositorio `beung/rlhf-thai-stock` no contiene un modelo único, sino un conjunto de artefactos de investigación derivados de un estudio de RLHF aplicado a la generación de resúmenes financieros. El autor parte de `Qwen/Qwen2.5-1.5B-Instruct` y entrena la tarea de redactar resúmenes para inversores (en inglés, con un máximo de 500 tokens) sobre empresas tailandesas cotizadas en el SET (Stock Exchange of Thailand), a partir de una ficha de datos estructurada y utilizando exclusivamente las cifras presentes en ella. El pipeline sigue el esquema clásico SFT → reward model → PPO, implementado con Hugging Face TRL 1.12.0.

El interés del repositorio es doble. Por un lado, publica el resultado principal (`ppo_v1/step_120`), un adaptador PPO que mejora la puntuación de referencia de 0,732 (base) a 0,899 y reduce la tasa de errores graves del 27,1 % al 2,9 % sobre 70 prompts retenidos. Por otro, incluye ablaciones deliberadas: `ppo_lowkl` (coeficiente KL diez veces menor) para estudiar la sobreoptimización del reward model y el *length hacking*, y `ppo_rmv1` para comparar contra un reward model más débil.

Se trata de pesos de investigación, no de un modelo listo para producción ni de asesoramiento financiero. La licencia es Apache 2.0, heredada de los modelos base de Qwen, y el idioma declarado es únicamente inglés, pese al dominio tailandés de los datos de entrada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptadores LoRA (PEFT); reward models como sequence classification |
| Parámetros totales | 1,5B en el modelo de política (Qwen2.5-1.5B-Instruct); 0,5B en los reward models (Qwen2.5-0.5B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | no disponible (los pesos se publican en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA PEFT y pesos completos de los reward models) |

## Arquitectura y entrenamiento

La política es un transformer decoder-only Qwen2.5-1.5B-Instruct sobre el que se aplica un adaptador LoRA con r=16 y α=32 en la fase de SFT (`sft_v1`). Sobre ese modelo fusionado se apilan los adaptadores PPO, también LoRA, entrenados con TRL 1.12.0. La cadena de carga es explícita: modelo base → fusionar `sft_v1` → aplicar o fusionar el adaptador PPO correspondiente. Los reward models son Qwen2.5-0.5B-Instruct con cabeza de clasificación de secuencia y ajuste completo; puntúan la conversación completa (prompt + resumen) en el token final `<|im_end|>`.

El entrenamiento del reward model combina pares etiquetados por un juez con pares sintéticos (`rm_v2`), mientras que `rm_v1` se entrenó solo con pares del juez. El PPO principal (`ppo_v1`) usa un coeficiente KL de 0,05 y guarda adaptadores cada 20 actualizaciones, siendo `step_120` el resultado principal. Las ablaciones están diseñadas para exponer fallos conocidos: con KL de 0,005 (`ppo_lowkl`), la puntuación de referencia cayó a 0,433 en el step 80 mientras la puntuación del reward model seguía subiendo, y el 97 % de las salidas superó el límite de longitud. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de DPO.

## Capacidades

- Generación de resúmenes financieros en inglés para empresas tailandesas cotizadas, limitados a 500 tokens.
- Redacción a partir de una ficha de datos estructurada, con instrucción explícita de usar solo las cifras contenidas en ella.
- Razonamiento numérico acotado al contenido de la ficha (variaciones, direcciones de cambio, magnitudes).
- Puntuación automática de calidad mediante los reward models publicados (`rm_v1`, `rm_v2`), útiles como evaluadores de resúmenes.
- Reproducción de experimentos de RLHF: el repositorio permite replicar el pipeline SFT → RM → PPO y las ablaciones.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés declarado; no se documenta soporte de tailandés en la salida.

## Casos de uso

- Generación de resúmenes de resultados trimestrales: el modelo recibe una ficha estructurada con cifras de una empresa del SET y produce un texto de hasta 500 tokens para inversores, restringido a los datos de la ficha.
- Evaluación automática de resúmenes financieros: `rm_v2` puede puntuar resúmenes generados por otros sistemas, siempre que se use el tokenizador de Qwen y se evalúe en el token `<|im_end|>`.
- Investigación en RLHF y sobreoptimización: las carpetas `ppo_lowkl` y `ppo_rmv1` permiten estudiar empíricamente el *reward hacking* y el *length hacking* con puntos de control cada 20 actualizaciones.
- Reproducción de pipelines con TRL: sirve como referencia práctica de SFT con LoRA, entrenamiento de reward model con ajuste completo y PPO con control KL.
- Prototipado de asistentes de análisis financiero de bajo coste: al partir de un modelo de 1,5B, cabe en GPUs de consumo y permite iterar rápidamente en entornos de investigación.
- Auditoría de fidelidad numérica: la métrica de tasa de errores graves (2,9 % en `step_120`) permite comparar la fiabilidad de distintos generadores sobre el mismo conjunto de ficha de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 70 prompts retenidos con decodificación greedy:

| Métrica | Base | SFT | PPO (`ppo_v1/step_120`) |
|---|---|---|---|
| Gold score (0–1) | 0,732 | 0,842 | 0,899 |
| Tasa de errores graves | 27,1 % | 8,6 % | 2,9 % |

Ablación con KL reducido (`ppo_lowkl`): gold score de 0,433 en el step 80, con un 97 % de salidas por encima del límite de longitud y una puntuación del reward model que seguía aumentando. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de política en bfloat16 requiere aproximadamente 3 GB de pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- Los reward models de 0,5B añaden aproximadamente 1 GB en bfloat16 si se cargan simultáneamente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para la política; A100/H100 no son necesarias para inferencia, pero aceleran el reentrenamiento del pipeline PPO.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; también en GPUs de 8 GB con cuantización, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers + PEFT para cargar y fusionar adaptadores; vLLM y TGI son viables tras fusionar los adaptadores en un checkpoint completo; llama.cpp/Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `beung/rlhf-thai-stock` (este) | 1,5B política + 0,5B RM | no disponible | RLHF (SFT + RM + PPO) para resúmenes financieros | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,5B | no disponible en la información | Modelo base instructivo generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la información | Modelo base instructivo generalista, usado como reward model | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables con otros modelos especializados en resúmenes financieros en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no asesoramiento financiero; el propio autor lo indica explícitamente.
- El modelo puede equivocarse en cifras o en la dirección de una variación; toda cifra debe verificarse contra la fuente original.
- Riesgo de alucinación numérica incluso con la instrucción de usar solo los datos de la ficha; la tasa de errores graves del 2,9 % no es cero.
- Sesgos del dominio: entrenado sobre empresas tailandesas del SET, con salida en inglés; puede no generalizar a otros mercados o idiomas.
- El idioma declarado es solo inglés; no se documenta calidad en tailandés.
- La licencia Apache 2.0 permite uso comercial, pero los reward models contienen pesos de Qwen modificados por ajuste completo, sujetos a la licencia del modelo base.
- La cadena de carga es obligatoria (base → SFT → PPO); usar un adaptador PPO sin fusionar `sft_v1` produce resultados incorrectos.
- No se publican pesos cuantizados ni instrucciones de despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/beung/rlhf-thai-stock
- Modelo base de la política: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base del reward model: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Librería TRL (1.12.0): https://github.com/huggingface/trl
- Librería PEFT: https://github.com/huggingface/peft
