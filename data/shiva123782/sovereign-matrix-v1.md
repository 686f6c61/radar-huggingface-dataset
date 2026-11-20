# shiva123782/Sovereign-Matrix-v1

## Resumen

Sovereign-Matrix-v1 es un ajuste fino mediante LoRA sobre el modelo Qwen/Qwen2.5-0.5B-Instruct, desarrollado por el autor identificado en la model card como Matrix-Labs y publicado en Hugging Face bajo el identificador shiva123782. Se trata de un adaptador PEFT (no de un modelo completo) orientado a generación de texto conversacional en inglés, con un tamaño de repositorio practicamente nulo (0.0 GB), lo que confirma que solo se distribuyen los pesos del adaptador y no los del modelo base.

El modelo se presenta como un "Enterprise Small Language Model" con certificaciones formales declaradas por el autor: verificación con el solver SMT Z3 de los límites de VRAM, una auditoría de identidad denominada "20-Crore Bijective Identity Benchmark" basada en una red de Feistel de 28 bits, y conformidad declarada con el EU AI Act (artículo 53) y la DPDP Act india de 2025. Estas afirmaciones provienen exclusivamente de la model card y no se han podido contrastar con documentación independiente, papers ni resultados de benchmarks publicados.

Su relevancia práctica es limitada pero concreta: al ser un adaptador LoRA de rango 16 sobre un modelo de 0.5B parámetros, es extremadamente ligero (3.2 GB de VRAM pico en entrenamiento según el autor) y desplegable en GPUs de consumo. Resulta útil como ejemplo de pipeline de ajuste fino PEFT sobre Qwen2.5 y como caso de estudio de las prácticas de documentación y certificación que algunos autores aplican a modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (heredada de Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0.5B en el modelo base (no disponible el numero exacto de parametros del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32K tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | Bfloat16/Float16 y NF4 (4-bit NormalFloat) mencionados en la model card |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango r=16 y alpha=32, con dropout de 0.05, aplicado sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj del transformer causal Qwen2.5-0.5B-Instruct. El autor menciona el uso de "LoRA+" con un factor de escala asimétrico (eta_B = 8.0 · eta_A) para el balanceo dinámico de matrices, una técnica conocida en la literatura de ajuste eficiente de parámetros. El entrenamiento se realizó en precisión bfloat16/float16 con un pico de VRAM de 3.2 GB según la model card.

El dataset de ajuste declarado es yahma/alpaca-cleaned, un corpus de instrucciones en inglés ampliamente utilizado. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO adicionales. Las "certificaciones" que menciona el autor (verificación Z3, benchmark de identidad de 200 millones de consultas con red de Feistel, sello criptográfico SHA-256) son afirmaciones de la model card sin verificación independiente disponible; no se han localizado papers, repositorios de evaluación ni artefactos públicos que las respalden.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a instrucciones en formato alpaca, dado el dataset de ajuste empleado.
- Identidad de marca declarada: según el autor, el modelo responde con su nombre y desarrollador ("Sovereign-Matrix-v1... Matrix-Labs") sin system prompt, tras el ajuste fino.
- Capacidades de tool calling y function calling: no disponibles de forma específica en este adaptador (el modelo base Qwen2.5-0.5B-Instruct las soporta, pero no se confirma que se hayan preservado tras el ajuste).
- Razonamiento multi-paso y agentes: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Ajuste fino educativo y reproducibilidad: sirve como ejemplo completo de pipeline PEFT (LoRA r=16, alpha=32) sobre Qwen2.5-0.5B-Instruct, útil para desarrolladores que quieran replicar el flujo con Transformers y PEFT en una GPU de consumo.
- Prototipado rápido de asistentes conversacionales en inglés: con 0.5B parámetros y cuantización NF4, se puede desplegar en portátiles con GPU modesta para validar flujos conversacionales antes de escalar a modelos mayores.
- Pruebas de identidad de marca en modelos ajustados: el autor documenta un método para que el modelo mantenga una identidad corporativa sin system prompt; útil como referencia para experimentos de "brand alignment" en SLMs.
- Despliegue en entornos con restricciones de VRAM: con un pico de 3.2 GB en entrenamiento y pesos de adaptador mínimos, encaja en estaciones de trabajo con RTX 3060/4060 o T4 en la nube.
- Investigación sobre certificación formal de límites de memoria: el uso declarado de Z3 para probar cotas de VRAM antes de la asignación de kernels es un caso de estudio interesante para ingeniería de sistemas de ML.
- Base para experimentos de cuantización: al ser un adaptador pequeño sobre un modelo de 0.5B, permite comparar NF4 frente a bfloat16 con bajo coste computacional y medir degradación de calidad en tareas de instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye métricas propias del autor (tasa de retención de identidad del 100% y tasa de fuga del 0% en el benchmark de 200 millones de consultas con red de Feistel, latencia P99 de 18.2 ms y 198+ tok/s en una estación de trabajo estándar), pero no se aportan resultados de MMLU, HumanEval, GSM8K ni comparaciones con modelos de referencia, y estas cifras no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en bfloat16/fp16 para el modelo base de 0.5B más el adaptador; aproximadamente 0.5-1 GB con cuantización NF4 (estimación a partir del tamaño del modelo base, no confirmada en la model card).
- VRAM pico de entrenamiento declarada: 3.2 GB (según el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para entrenamiento (T4, RTX 3060, RTX 4060); para inferencia basta con GPUs de gama de entrada o incluso CPU.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en T4 de Kaggle según el autor.
- Opciones de despliegue: Transformers + PEFT (flujo documentado en la model card); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este adaptador, aunque al ser compatible con el modelo base podrían requerir fusión previa del adaptador.
- Latencia y throughput declarados: 18.2 ms P99 y 198+ tok/s en una estación de trabajo estándar (cifras del autor, no verificadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sovereign-Matrix-v1 | 0.5B (base) + adaptador LoRA | no disponible | Apache 2.0 | safetensors (PEFT) | Ajuste LoRA sobre Alpaca-cleaned; certificaciones declaradas por el autor |
| Qwen/Qwen2.5-0.5B-Instruct | 0.5B | 32K (según documentación del modelo base) | Apache 2.0 | safetensors | Modelo base oficial, con tool calling y contexto largo documentados |
| TinyLlama-1.1B-Chat | 1.1B | 2K | Apache 2.0 | safetensors, GGUF | Modelo conversacional pequeño ampliamente desplegado en entornos de bajos recursos |
| SmolLM2-360M-Instruct | 0.36B | 8K | Apache 2.0 | safetensors, GGUF | Alternativa aún más pequeña de Hugging Face, con benchmarks publicados |

La comparación con Qwen2.5-0.5B-Instruct es la más directa: Sovereign-Matrix-v1 es un adaptador sobre ese mismo modelo, por lo que hereda sus capacidades y limitaciones, con el añadido del ajuste de instrucciones sobre Alpaca-cleaned y la identidad de marca. Frente a TinyLlama y SmolLM2, la diferencia principal es que estos últimos publican resultados de benchmarks y soportan múltiples formatos de despliegue, mientras que Sovereign-Matrix-v1 no ofrece datos comparables verificables.

## Limitaciones y advertencias

- Las certificaciones declaradas (Z3, benchmark de 200 millones de consultas, conformidad con EU AI Act y DPDP Act) no cuentan con verificación independiente ni artefactos públicos accesibles; deben tratarse como afirmaciones del autor.
- El modelo base de 0.5B tiene capacidad limitada de razonamiento, matemáticas y código en comparación con modelos de 7B o superiores; el ajuste LoRA no cambia sustancialmente esa cota.
- Riesgo de alucinación inherente a modelos pequeños ajustados sobre Alpaca-cleaned, un dataset con calidad heterogénea.
- Idioma limitado al inglés según la model card; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que el adaptador puede no estar completamente subido o que el modelo no ha sido validado por la comunidad.
- Al ser un adaptador PEFT, requiere cargar el modelo base Qwen2.5-0.5B-Instruct por separado; no es un artefacto autónomo.
- No se documentan sesgos específicos, pero al entrenar sobre Alpaca-cleaned se heredan los sesgos presentes en ese corpus.
- La licencia Apache 2.0 permite uso comercial, pero las afirmaciones de conformidad regulatoria no deben interpretarse como asesoramiento legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/Sovereign-Matrix-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Referencia de PEFT: https://github.com/huggingface/peft
- Referencia de Transformers: https://github.com/huggingface/transformers
