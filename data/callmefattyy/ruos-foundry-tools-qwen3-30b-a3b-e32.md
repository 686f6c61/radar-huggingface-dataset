# callmefattyy/ruos-foundry-tools-qwen3-30b-a3b-e32

## Resumen

`ruos-foundry-tools-qwen3-30b-a3b-e32` es un especialista de tipo Mixture-of-Experts (MoE) derivado de `Qwen/Qwen3-30B-A3B-Instruct-2507` mediante el pipeline MoE-Foundry (ADR-064) de rUv, y publicado por el autor `callmefattyy`. El proceso no entrena pesos nuevos: traza el enrutamiento del modelo padre sobre un conjunto de calibración del dominio `ruos-tools`, conserva los 32 expertos más usados por cada capa enrutada (el padre tiene 128), elimina y renumera el resto, y recorta las filas del router en consecuencia. Se mantienen el backbone, el tokenizador y el `token top-k = 8`.

El checkpoint resultante tiene 8.779.413.504 parámetros totales y ocupa 17,6 GB en el repositorio, con una reducción de bytes de tensor del 71,2 % (entrada: 61.064.245.248 bytes; salida: 17.558.827.008 bytes). La arquitectura declarada es `qwen3_moe`, con 48 capas enrutadas. No se publica la longitud de contexto en la información disponible; el ejemplo de despliegue de la model card usa `--max-model-len 8192`.

La relevancia de esta ficha es doble: por un lado, documenta una técnica reproducible de poda de expertos MoE; por otro, advierte de que el checkpoint se publica como `unevaluated` y `enabled: false`, por lo que no debe recibir tráfico hasta que `slim-eval` mida su retención de capacidad frente al padre sobre el split de test congelado de ruOS. El modelo padre sigue siendo el fallback.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer, familia Qwen3 (`qwen3_moe`); 48 capas enrutadas; 32 expertos enrutados por capa tras la poda (padre: 128); `token top-k = 8` sin cambios |
| Parámetros totales | 8.779.413.504 (según safetensors) |
| Parámetros activos | no disponible; se mantiene `top-k = 8` sobre 32 expertos por capa, pero no se publica el recuento de parámetros activos del checkpoint podado |
| Longitud de contexto | no disponible; el ejemplo de la model card usa `--max-model-len 8192`, que no es una especificación del modelo |
| Tipos de cuantización | no disponible; solo se publica `model.safetensors` (17.559.452.112 bytes). No hay GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, un único archivo; `config.json` con `num_experts` reducido) |

## Arquitectura y entrenamiento

El modelo es un recorte estructural de `Qwen/Qwen3-30B-A3B-Instruct-2507` (revisión `0d7cf23991f47feeb3a57ecb4c9cee8ea4a17bfe`, licencia Apache-2.0). No hay preentrenamiento, fine-tuning, RLHF ni DPO en esta ficha: la model card indica explícitamente que no se modificó ningún peso, solo se eliminaron y renumeraron expertos y se recortaron las filas del router. El padre tiene 128 expertos por capa enrutada y 48 capas enrutadas; el especialista conserva 32 expertos por capa enrutada y mantiene `token top-k = 8`.

La selección se hizo con el método `mass` (probabilidad de enrutamiento acumulada por experto y capa), que es un proxy de uso, no una medida de importancia causal. La calibración usó el dominio `ruos-tools`: 200 filas (200 del split de validación, 0 del de entrenamiento; el split de test nunca se usó para calibrar), aproximadamente 61.028 tokens, con familias `{"stack_qa": 75, "tool_routing": 125}` y licencias `{"MIT": 188, "project-owned": 12}`. Los textos son el prompt en ChatML más la respuesta de referencia. El archivo de calibración tiene sha256 `94a5527b141269ab5078a14e3d129b387aa69412c65334160715fd9a58dbfef5`.

Las trazas de router se obtuvieron con 412 tareas, 148.144 tokens y 7.110.912 filas sobre una NVIDIA A100-SXM4-80GB en bfloat16 con transformers 4.51.3 (sha256 de la traza: `7aabb05cbf715156437393fc5a5b0d756951ecee35eb4542a06fc812f11f9403`). El recibo de MoE-Foundry incluye `specialist_id`, `checkpoint_id`, `mask_sha256`, `parent_id`, los bytes de entrada y salida y la reducción del 71,2 %; el archivo `separator_receipt.json` contiene la máscara completa por capa. El pipeline procede de MoE-Foundry `6677a25` (`moe-separator`: inspect → profile_hf → select → export → mixture) y se ejecutó en una única GPU de vast.ai.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` está presente. No hay métricas publicadas de calidad.
- Enrutamiento de herramientas / tool calling: la calibración incluye 125 familias `tool_routing`, por lo que el dominio previsto del especialista es el enrutamiento de llamadas a herramientas en el contexto ruOS. No está evaluado.
- Preguntas y respuestas sobre stack técnico: 75 familias `stack_qa` en la calibración. Es el segundo dominio previsto, sin métricas públicas de acierto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el formato de pesos y el tokenizador están pensados para servirse con APIs compatibles con OpenAI, por ejemplo mediante vLLM.
- No hay evidencia publicada de razonamiento multi-paso, matemáticas, código general, visión, audio ni modo thinking en este checkpoint. El padre Qwen3-30B-A3B-Instruct-2507 sí incorpora capacidades generales, pero el recorte de expertos no ha sido evaluado para medir cuánto se conserva.
- Capacidades multilingües: solo inglés (`en`). No se declaran otros idiomas.
- Soporte de agentes: no verificado. El uso como enrutador en pipelines de agentes es una hipótesis derivada del dominio de calibración, no una capacidad medida.

## Casos de uso

- Enrutamiento de herramientas en agentes: una vez superada la evaluación de `slim-eval`, el modelo podría desplegarse como clasificador o enrutador de llamadas a herramientas en un pipeline de agentes. La calibración con 125 familias `tool_routing` y la conservación del tokenizador y el backbone del padre lo hacen candidato para ese dominio, pero está `unevaluated` y no debe recibir tráfico sin validación previa.
- Respuestas sobre stack técnico: asistente de documentación interna que responda preguntas sobre APIs, dependencias y configuración. La calibración incluye 75 familias `stack_qa`. El tamaño del checkpoint (17,6 GB) permite servirlo en una GPU de 48-80 GB junto a otros servicios, aunque no hay métricas de precisión publicadas.
- Especialista ligero junto al padre en un router de modelos: el padre `Qwen/Qwen3-30B-A3B-Instruct-2507` actuaría como fallback y el especialista de 32 expertos por capa atendería peticiones del dominio ruOS tools. La model card advierte de que cargar varios especialistas junto al padre puede consumir más memoria total que el padre solo.
- Investigación reproducible en poda de expertos MoE: sirve como checkpoint de referencia para reproducir el pipeline de MoE-Foundry (inspect → profile_hf → select → export → mixture) y comparar la retención de capacidad frente al padre con distintas máscaras de expertos.
- Red teaming y evaluación de regresión: el propio autor publica el checkpoint para que `slim-eval` (run, redteam, regression, verdict) lo mida contra el padre en el split de test congelado de ruOS. Es un caso de uso explícito de la model card.
- Despliegue en vLLM con API compatible con OpenAI: la model card incluye el comando `vllm serve ruvnet/ruos-foundry-tools-qwen3-30b-a3b-e32 --max-model-len 8192` y la etiqueta `endpoints_compatible`. Es útil para prototipos y pruebas de integración en infraestructura existente.
- Fine-tuning o destilación posterior: al ser un checkpoint `qwen3_moe` estándar con un único safetensors y `config.json` con `num_experts` reducido, se puede cargar con transformers para experimentos de ajuste. Hay que asumir que parte de la capacidad del padre puede haberse perdido por el recorte de expertos.
- Enrutamiento de consultas en producción con derivación al padre: si una petición cae fuera del dominio `ruos-tools`, el sistema puede derivarla al modelo padre. El especialista solo se activaría para `tool_routing` y `stack_qa`, reduciendo coste computacional en ese subconjunto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el checkpoint está `unevaluated` y que no se hace ninguna afirmación de capacidad, memoria o latencia. Por tanto, no se presenta tabla comparativa de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: el archivo `model.safetensors` ocupa 17.559.452.112 bytes (~16,4 GiB) para 8.779.413.504 parámetros, lo que implica aproximadamente 2 bytes por parámetro. A esa cifra hay que sumar la caché KV y las activaciones, por lo que un despliegue cómodo con contexto moderado requiere 32 GB de VRAM o más.
- GPU recomendadas (estimación a partir del tamaño del checkpoint): A100 40 GB u 80 GB (la traza de calibración se hizo en A100-SXM4-80GB), H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. Son estimaciones, no datos validados por el autor.
- GPU de consumo: en una RTX 4090 o RTX 3090 de 24 GB, los ~16,4 GiB de pesos dejan poco margen para caché KV y activaciones. Podría funcionar con contexto reducido (por ejemplo, los 8192 tokens del ejemplo de la model card) y batch pequeño, pero no está validado ni se publican latencias.
- Cuantizaciones para reducir VRAM: no hay GGUF, AWQ ni GPTQ publicados. Para usar llama.cpp u Ollama habría que convertir el checkpoint previamente, y no se ofrece ninguna receta oficial.
- Opciones de despliegue: vLLM (comando incluido en la model card), transformers (carga como `qwen3_moe` estándar con un único safetensors), TGI por compatibilidad con transformers. llama.cpp y Ollama requerirían una conversión a GGUF no disponible.
- Latencia y throughput: no disponibles. La model card no hace ninguna afirmación al respecto.
- Memoria agregada: cargar varios especialistas ruOS junto al padre puede consumir más memoria total que el padre solo, según advierte la propia model card.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Expertos por capa enrutada | Token top-k | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| `Qwen/Qwen3-30B-A3B-Instruct-2507` (padre) | 30B según denominación del modelo; no se aporta recuento exacto en la información disponible | 128 | 8 | no disponible | apache-2.0 | Publicado y evaluado por Qwen |
| `callmefattyy/ruos-foundry-tools-qwen3-30b-a3b-e32` (este) | 8.779.413.504 | 32 | 8 | no disponible | apache-2.0 | `unevaluated`, `enabled: false` |
| Otros especialistas ruOS de MoE-Foundry | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks del especialista ni de otros recortes equivalentes que permitan una comparación cuantitativa de rendimiento. La única comparación posible con la información disponible es estructural: el padre conserva 128 expertos por capa enrutada y este checkpoint conserva 32, manteniendo el mismo `top-k = 8` y el mismo backbone.

## Limitaciones y advertencias

- `quality_status: unevaluated` y `enabled: false`: la model card indica que un export estructural prueba integridad de tensores, no capacidad retenida. No debe enrutarse tráfico a este checkpoint hasta que se registre el veredicto de `slim-eval`. El padre es el fallback.
- No se hace ninguna afirmación de capacidad, memoria o latencia. Cualquier uso en producción requiere una evaluación previa contra el padre.
- Los expertos retenidos se eligieron por `mass` de enrutamiento sobre prompts del dominio ruOS, que es un proxy de uso y no de importancia causal. Las peticiones fuera de ese dominio deberían ir al padre.
- Dominio estrecho: la calibración consta de 200 filas y aproximadamente 61.028 tokens, con familias `stack_qa` (75) y `tool_routing` (125). No cubre otros dominios, idiomas ni tareas generales.
- Idioma: solo inglés (`en`). No se declaran capacidades multilingües.
- Longitud de contexto: no disponible. El valor `8192` del ejemplo de vLLM no es una especificación del modelo.
- Cuantizaciones: no disponibles. Solo hay safetensors; no se publican versiones GGUF, AWQ ni GPTQ.
- Licencia Apache-2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin evaluar. Hereda los sesgos y el riesgo de alucinación del padre Qwen3, sin que se hayan medido en este checkpoint podado.
- Memoria: cargar varios especialistas junto al padre puede consumir más memoria total que el padre solo.
- Discrepancia de identificador: la model card usa `ruvnet/ruos-foundry-tools-qwen3-30b-a3b-e32` en el comando de vLLM, mientras que el repositorio consultado en HuggingFace es `callmefattyy/ruos-foundry-tools-qwen3-30b-a3b-e32`. Conviene verificar la ruta correcta antes de desplegar.
- Fecha de creación reportada: 2026-10-05, según los metadatos de HuggingFace. Se reproduce el dato tal cual aparece.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/callmefattyy/ruos-foundry-tools-qwen3-30b-a3b-e32
- Repositorio alternativo mencionado en el comando de la model card: https://huggingface.co/ruvnet/ruos-foundry-tools-qwen3-30b-a3b-e32
- Modelo padre: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- MoE-Foundry (repositorio del pipeline): https://github.com/ruvnet/MoE-Foundry
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se proporcionan papers, blogs ni demos adicionales en la información disponible.
