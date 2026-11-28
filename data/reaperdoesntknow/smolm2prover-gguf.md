# reaperdoesntknow/SMOLM2Prover-GGUF

## Resumen

SMOLM2Prover es un ajuste fino (SFT) del modelo prithivMLmods/SmolLM2-CoT-360M, especializado en generación de pruebas matemáticas y razonamiento paso a paso (chain-of-thought). Lo desarrolla el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC (Research Division), y se distribuye aquí en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. Con 361.821.120 parámetros y una arquitectura LlamaForCausalLM de 32 capas, es un modelo pequeno orientado a ejecución en CPU y hardware de consumo.

El modelo parte de SmolLM2-360M de Hugging Face, al que se ha aplicado un ajuste supervisado sobre el dataset AI-MO/NuminaMath-1.5, un corpus de problemas matemáticos con soluciones razonadas. La ventana de contexto es de 8192 tokens y el modelo usa atención con GQA (15 cabezas de consulta, 5 de clave/valor), lo que reduce el coste de memoria en inferencia. Está entrenado únicamente en inglés y su licencia es Apache 2.0.

Su relevancia práctica es acotada pero concreta: permite desplegar un generador de razonamiento matemático y pruebas formales en entornos sin GPU, con un peso de 258 MB en cuantización Q4_K_M. No compite con modelos grandes en precisión, pero sí resulta útil para prototipado, sistemas embebidos y pipelines donde el coste por token o la latencia de arranque son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | F16 (sin cuantizar), Q4_K_M (Q4_K con fallback Q5_0 y capas críticas en Q6_K/Q8_0) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo original se distribuye en safetensors vía transformers |
| Dimension de embedding | 960 |
| Capas | 32 |
| Cabezas de atencion | 15 (Q) / 5 (KV), GQA |
| Tamano del repo | 1.0 GB |
| Modelo base | prithivMLmods/SmolLM2-CoT-360M |
| Dataset de ajuste | AI-MO/NuminaMath-1.5 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de tipo Llama, con 32 capas, dimensión de embedding de 960 y atención con grouped-query attention (15 cabezas de consulta y 5 de clave/valor). El modelo base, SmolLM2-CoT-360M, ya incorpora un ajuste orientado a chain-of-thought; SMOLM2Prover aplica un segundo ajuste supervisado (SFT, con TRL) sobre AI-MO/NuminaMath-1.5, un dataset de problemas matemáticos con soluciones paso a paso que cubre cálculo, lógica y álgebra.

No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. La model card menciona el marco teórico "Discrepancy Calculus (DISC)" de Convergent Intelligence como contexto metodológico del autor, con conceptos como operador de discrepancia, conjuntos de salto y "ghost imprinting", pero no se aportan detalles verificables sobre cómo se aplicaron al entrenamiento de este modelo concreto. Tampoco se documentan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) orientado a problemas matemáticos.
- Resolución de problemas de cálculo, lógica y álgebra, según los tags del modelo (math, calculus, logic).
- Generación de pruebas y justificaciones estructuradas (tag "proof").
- Conversación multi-turno (tag "conversational").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible como capacidad documentada; el chain-of-thought es interno, no orquestado.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Prototipado de tutores matemáticos en local: el modelo puede generar explicaciones paso a paso de problemas de cálculo y álgebra, y su contexto de 8192 tokens permite incluir el enunciado completo y varios intentos previos en la misma ventana.
- Generación de borradores de pruebas formales: útil como primer paso en pipelines de verificación, donde un humano o un verificador automático (Lean, Coq) revisa la salida; su tamaño reducido permite iterar rápido sobre muchas propuestas.
- Asistente educativo en entornos sin GPU: al pesar 258 MB en Q4_K_M, se puede ejecutar en CPU, Raspberry Pi o portátiles modestos, lo que lo hace adecuado para aulas o demos offline.
- Preprocesamiento y enriquecimiento de datasets matemáticos: puede generar soluciones razonadas para problemas sin resolver y usarse para aumentar corpus de entrenamiento de modelos mayores.
- Evaluación de pipelines de razonamiento: sirve como baseline ligero para comparar técnicas de prompting (zero-shot, few-shot, CoT) sin incurrir en costes de GPU.
- Filtrado de candidatos en sistemas de búsqueda matemática: dado un problema y varias soluciones candidatas, el modelo puede razonar sobre cuál es más plausible, como etapa de reranking barata.
- Integración en herramientas de escritorio (LM Studio, Ollama): para usuarios que quieren un asistente matemático local sin conexión ni dependencias de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en F16 (692 MB de pesos) y unos 0,3 GB en Q4_K_M (258 MB), más overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo es viable en GTX 1050, RTX 3050, RTX 4090, A100 o H100, aunque en estas últimas queda muy infrautilizado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU.
- Cabe en CPU: sí, es uno de sus principales casos de uso; el formato GGUF está pensado para ello.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (mediante Modelfile), LM Studio, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui, etc.).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y del número de tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SMOLM2Prover-GGUF | 361,8 M | 8192 | en | Apache 2.0 | GGUF | Ajuste SFT sobre NuminaMath-1.5, orientado a pruebas y CoT |
| prithivMLmods/SmolLM2-CoT-360M (base) | ~360 M | no disponible | en | no disponible | safetensors | Modelo base con CoT; SMOLM2Prover parte de él |
| SmolLM2-360M (Hugging Face) | 361,8 M | 8192 (según familia SmolLM2) | en (multilingüe limitado) | Apache 2.0 | safetensors, GGUF | Modelo generalista de la familia SmolLM2; sin ajuste específico en matemáticas |
| Qwen2.5-0.5B | ~494 M | 32 768 | multilingüe | Apache 2.0 | safetensors, GGUF | Alternativa generalista más grande y con mayor contexto; no especializada en pruebas |

La comparación con SmolLM2-360M original es la más directa: SMOLM2Prover añade especialización en matemáticas y pruebas a costa de perder generalidad. Frente a Qwen2.5-0.5B, el modelo de Qwen ofrece mayor contexto y multilingüismo, pero no está afinado específicamente para razonamiento matemático con CoT.

## Limitaciones y advertencias

- Modelo muy pequeño (361,8 M de parámetros): la precisión en problemas matemáticos complejos será limitada y es probable que falle en cálculos de varios pasos o en pruebas formales largas.
- Riesgo elevado de alucinación: al ser un modelo de 360 M ajustado con SFT, puede generar razonamientos plausibles pero incorrectos; no debe usarse sin verificación en contextos críticos.
- Solo inglés: no soporta castellano ni otros idiomas de forma fiable.
- Contexto de 8192 tokens: suficiente para problemas individuales, pero insuficiente para documentos largos o conversaciones extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (prithivMLmods/SmolLM2-CoT-360M) y del dataset (AI-MO/NuminaMath-1.5), ya que la model card indica "same as the original model" sin detallar.
- Documentación metodológica escasa: el marco "Discrepancy Calculus" se presenta sin datos verificables de entrenamiento (tokens, composición, etapas de RLHF/DPO), lo que dificulta evaluar su calidad de forma independiente.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- El repositorio incluye enlaces cruzados y promoción del portfolio del autor; la información técnica sustantiva es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/SMOLM2Prover-GGUF
- Modelo original (safetensors): https://huggingface.co/reaperdoesntknow/SMOLM2Prover
- Modelo base: https://huggingface.co/prithivMLmods/SmolLM2-CoT-360M
- Dataset de ajuste: https://huggingface.co/datasets/AI-MO/NuminaMath-1.5
- Portfolio del autor: https://huggingface.co/reaperdoesntknow
- Paper "Discrepancy Calculus: Foundations and Core Theory": https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Paper "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Paper "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Colección DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
