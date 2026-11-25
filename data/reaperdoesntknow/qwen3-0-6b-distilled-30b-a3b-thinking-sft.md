# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT

## Resumen

Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT es un modelo de lenguaje causal de 0,6B parámetros (751.632.384 parámetros reales según los pesos en safetensors) desarrollado por reaperdoesntknow para Convergent Intelligence LLC (Research Division). Se construye sobre Qwen/Qwen3-0.6B mediante un pipeline de dos etapas: primero una destilación de conocimiento desde el profesor Qwen3-30B-A3B-Thinking-2507 (MoE de 30B totales y ~3B activos) para establecer una base de razonamiento estructurado en dominios STEM, y después un ajuste supervisado (SFT) sobre datos de instrucciones legales de Alignment-Lab-AI/Lawyer-Instruct.

La tesis del autor es que el orden de entrenamiento importa: enseñar primero *cómo razonar* mediante destilación desde un profesor con trazas de deliberación extensas, y después *sobre qué razonar* con SFT legal. La destilación se realiza a temperatura T=2.0 con una función de pérdida mixta que combina entropía cruzada ponderada por prueba (55%) y divergencia KL de destilación (45%), asignando mayor peso a los tokens de derivación que a los de formato de respuesta.

El resultado es un modelo extremadamente compacto (ratio de compresión 50x respecto al profesor, menos de 500 MB cuantizado según el autor) orientado a despliegue en entornos de borde e incluso dispositivos móviles. La longitud de contexto indicada en la model card es de 1024 tokens en entrenamiento, muy inferior a la ventana nativa de la familia Qwen3, lo que limita su uso a interacciones cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 751.632.384 (0,6B nominales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor menciona <500 MB cuantizado, sin especificar formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-0.6B: transformer causal con RoPE (Rotary Position Embeddings) y GQA (Grouped Query Attention). Sobre esa base se aplica un pipeline de dos etapas documentado por el autor. La etapa 1 es una destilación de conocimiento desde Qwen3-30B-A3B-Thinking-2507 usando 6.122 muestras de chain-of-thought STEM repartidas en 12 dominios (física con 2.254 muestras, álgebra lineal con 667, ecuaciones diferenciales con 636, electromagnetismo con 580, matemáticas con 576, ingeniería con 574, mecánica clásica con 343, mecánica teórica con 307, cálculo avanzado con 268, física moderna con 177, fisiología con 114 y biología molecular con 71), todas del usuario 0xZee de Hugging Face. El split es 95/5 con semilla 42, resultando en 5.815 muestras de entrenamiento.

La pérdida combina Proof-Weighted Cross-Entropy al 55% (peso 2,5x sobre tokens de derivación, decayendo a 1,5x) y KL Divergence de destilación al 45% con T=2.0 escalada por T². Los hiperparámetros de la etapa 1 son: 1 época, batch efectivo 8, learning rate 1,5e-5 con decaimiento coseno hasta 1e-6, precisión bf16. La etapa 2 aplica SFT con TRL SFTTrainer sobre Lawyer-Instruct, con 1 época, batch efectivo 8, learning rate 5e-6 (deliberadamente menor para preservar el backbone) y gradient checkpointing activado. El formato de entrenamiento de la etapa 1 usa una plantilla con "Problem:", "Proof:" y "Final Answer:"; el de la etapa 2 usa "### Instruction:" y "### Response:". No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal en inglés con formato de instrucción y de derivación.
- Razonamiento matemático y STEM con trazas de chain-of-thought: cálculo avanzado, álgebra lineal, ecuaciones diferenciales, física clásica y moderna, electromagnetismo, mecánica teórica, ingeniería.
- Razonamiento legal básico adquirido por SFT sobre Lawyer-Instruct (diferencias entre figuras jurídicas, instrucciones legales genéricas).
- Razonamiento estructurado por transferencia estructural: el autor argumenta que la lógica de derivación matemática se reutiliza para análisis legal (identificación de premisas, encadenamiento lógico, manejo de excepciones).
- Soporte de dos plantillas de prompt diferenciadas (STEM y legal).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning orquestado: no disponible.
- Modo thinking nativo, visión o audio: no disponible.

## Casos de uso

- Tutoría de matemáticas y física en dispositivos de borde: el modelo cabe en menos de 500 MB cuantizado y puede ejecutarse en un teléfono, lo que permite ofrecer explicaciones paso a paso de problemas de cálculo, álgebra o mecánica sin conexión a la nube.
- Asistente educativo embebido en aplicaciones móviles: con 0,6B parámetros y contexto de 1024 tokens, es adecuado para resolver dudas puntuales de estudiantes en STEM dentro de una app ligera, manteniendo la privacidad al no requerir backend.
- Primer filtro de consultas legales en inglés: dado su SFT sobre Lawyer-Instruct, puede generar respuestas orientativas sobre conceptos jurídicos básicos (diferencias entre delitos, definiciones) antes de escalar a un modelo mayor o a un profesional.
- Prototipado rápido de pipelines de razonamiento: sirve como banco de pruebas de bajo coste para validar plantillas de prompt STEM ("Problem / Proof / Final Answer") antes de migrar a modelos mayores de la familia Qwen3.
- Generación de explicaciones didácticas en documentación técnica: puede producir derivaciones estructuradas de problemas de ingeniería o ecuaciones diferenciales para manuales y material formativo en inglés.
- Evaluación de técnicas de destilación: investigadores pueden usar este checkpoint como referencia reproducible para estudiar la transferencia de estructura de razonamiento desde profesores MoE de 30B a estudiantes de 0,6B.
- Despliegue en entornos con restricciones de VRAM: útil en GPUs de gama baja o CPU para tareas de generación corta donde un modelo mayor no es viable económicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y KV cache (el repositorio completo ocupa 1,5 GB).
- VRAM estimada en cuantización de 8 bits: en torno a 0,8-1 GB.
- VRAM estimada en cuantización de 4 bits: por debajo de 0,5 GB (el autor afirma "under 500MB quantized", sin especificar el esquema).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como A100/H100 si se busca throughput agregado.
- Cabe holgadamente en GPU consumer e incluso en dispositivos móviles según el autor.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference` presente), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito de llama.cpp, Ollama o vLLM, aunque al ser safetensors estándar debería ser convertible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT | 0,75B | 1024 | Apache 2.0 | Destilación STEM + SFT legal |
| Qwen/Qwen3-0.6B (base) | 0,6B | contexto nativo Qwen3 (no especificado en esta ficha) | Apache 2.0 | Modelo generalista de referencia |
| Qwen/Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales / ~3B activos | contexto nativo Qwen3 (no especificado en esta ficha) | Apache 2.0 | MoE con modo thinking extendido |

El modelo destilado ofrece un ratio de compresión 50x respecto a su profesor, a costa de una ventana de contexto reducida a 1024 tokens y de capacidades limitadas al inglés. Frente al Qwen3-0.6B base, añade especialización en razonamiento STEM y legal, pero no se han publicado benchmarks que cuantifiquen la mejora.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens en entrenamiento: insuficiente para documentos largos, conversaciones multi-turno extensas o análisis legales completos.
- Idioma limitado al inglés; no se garantiza calidad en castellano u otros idiomas.
- Riesgo de alucinación elevado en dominios especializados (legal, médico, físico) dado el tamaño reducido del modelo y la ausencia de benchmarks publicados.
- El SFT legal se realizó sobre un único dataset (Lawyer-Instruct) con 1 época; la cobertura y robustez del razonamiento jurídico no están validadas.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; el modelo no incluye mecanismos de alineación más allá del SFT.
- No dispone de tool calling, capacidades de agente ni multimodalidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de producción.
- El checkpoint se actualizó por última vez en noviembre de 2026, pero no hay información sobre mantenimiento continuo.
- La afirmación de "runs on a phone" no viene acompañada de métricas de latencia ni de formatos de cuantización verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B-Thinking-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Profesor de destilación: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Dataset de SFT legal: https://huggingface.co/datasets/Alignment-Lab-AI/Lawyer-Instruct
- Autor de los datasets STEM: https://huggingface.co/0xZee
- Organización desarrolladora: https://convergentintel.com
