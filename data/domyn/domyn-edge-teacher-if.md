# domyn/Domyn-Edge-Teacher-IF

## Resumen

Domyn Edge Teacher IF es un modelo de lenguaje denso de 4B parámetros desarrollado por Domyn, derivado de Domyn Edge SFT mediante una etapa de ajuste supervisado (SFT) y una ronda de GRPO centrada en problemas de seguimiento de instrucciones y tool calling con respuesta final verificable. Forma parte del segundo paquete de la liberación por fases de la familia Domyn Edge, un proyecto de modelo agéntico compacto publicado de forma abierta junto con sus recetas, checkpoints intermedios y datos de post-entrenamiento. Su arquitectura y tokenizador son idénticos a los de Domyn Edge SFT, con pesos almacenados en bfloat16 y una ventana de contexto de 131.072 tokens (`max_position_embeddings`), que en despliegue se sirve a 128k.

El modelo no está pensado como asistente de propósito general, sino como uno de los profesores de dominio del protocolo de destilación on-policy multi-profesor (MOPD) de Domyn Edge: en esa etapa, el estudiante genera sus propias respuestas y cada profesor las puntúa token a token en su dominio. Este profesor concreto cubre el dominio de seguimiento de instrucciones y function calling, y se libera para investigación y reproducibilidad. Su relevancia actual radica en que permite reproducir el pipeline de post-entrenamiento de la familia y en que ofrece un punto de partida especializado en IF y tool calling sobre una base pequeña y desplegable en hardware modesto.

La licencia Apache 2.0 y el soporte de 13 idiomas lo hacen apto para experimentación y ajuste fino en entornos con requisitos de soberanía y cumplimiento normativo europeo, un eje explícito en la comunicación del proyecto. No obstante, sus capacidades fuera de IF y tool calling no se entrenaron más allá de la base SFT, y el propio autor advierte de que no debe emplearse como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma arquitectura y tokenizador que Domyn Edge SFT) |
| Parametros totales | 4B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (`max_position_embeddings`); servido a 128k |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), compatible con Transformers y vLLM |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros que hereda íntegramente la arquitectura y el tokenizador de Domyn Edge SFT, por lo que se carga y sirve del mismo modo que su base. El entrenamiento consta de dos etapas sobre Domyn Edge SFT: primero un ajuste supervisado (SFT) cuyos detalles concretos aparecen como pendientes (TODO) en la model card, y después una ronda de GRPO (Group Relative Policy Optimization) asíncrona sobre problemas de seguimiento de instrucciones y tool calling con una única respuesta final verificable. Los pesos se almacenan en bfloat16.

La innovación metodológica no está en el bloque arquitectónico sino en el rol del modelo dentro del protocolo de post-entrenamiento: actúa como profesor de dominio en la etapa MOPD, puntuando token a token los rollouts del estudiante en su especialidad. La plantilla de chat es la de Domyn Edge SFT sin cambios y es la empleada tanto durante el entrenamiento GRPO como en la evaluación. El modelo razona primero y termina con la respuesta final en el formato solicitado por el usuario.

## Capacidades

- Generación de texto con razonamiento previo a la respuesta final (modo thinking activado en la evaluación).
- Seguimiento estricto de instrucciones: formatos, restricciones y consignas verificables.
- Tool calling y function calling, con parsers compatibles con vLLM (`qwen3_coder` para tool calls, `qwen3` para razonamiento).
- Razonamiento matemático, incluido multilingüe (evaluado en MGSM en de, en, es, fr y ru).
- Conocimiento y razonamiento científico (evaluado en GPQA Diamond).
- Capacidades agénticas y de resolución de issues de software (evaluado en SWE-bench Verified).
- Generación de código (evaluado en LiveCodeBench).
- Manejo de contexto largo hasta 128k tokens (evaluado en RULER 128k).
- Soporte multilingüe en 13 idiomas: en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr.
- Puntuación token a token de rollouts para destilación on-policy (uso previsto como profesor).

## Casos de uso

- Destilación on-policy multi-profesor: usar el modelo como profesor de dominio IF/tool calling para puntuar token a token los rollouts de un estudiante en la etapa MOPD, reproduciendo el protocolo de Domyn Edge.
- Reproducción de investigación en post-entrenamiento: replicar la receta SFT + GRPO sobre una base de 4B para estudiar el efecto del RL con recompensas verificables en seguimiento de instrucciones.
- Generación de datos sintéticos de instrucciones y tool calls: producir pares de instrucción/respuesta con formato estricto y respuestas verificables para ampliar datasets de entrenamiento.
- Evaluación de robustez en IF: emplear el modelo como referencia o juez de cumplimiento de restricciones de formato en pipelines de evaluación propios (IFBench, IFEval, IFStruct).
- Prototipado de agentes con function calling en local: servir el modelo con vLLM a 128k y parsers `qwen3`/`qwen3_coder` para probar flujos de llamadas a herramientas en hardware de una sola GPU.
- Ajuste fino específico de dominio sobre una base especializada en IF: partir de este checkpoint para tareas reguladas que exijan ejecución on-premise y cumplimiento del EU AI Act, gracias a la licencia Apache 2.0.
- Experimentación multilingüe en 13 idiomas: probar el comportamiento de instrucciones y tool calling en lenguas europeas y asiáticas cubiertas por el modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes). avg@10 es la precisión media sobre 10 rollouts por problema; avg@32 sobre 32 muestras.

| Grupo | Benchmark | Métrica | Domyn Edge SFT | Teacher IF |
|---|---|---|---:|---:|
| Matemáticas | AIME 2026 | avg@10 | 61.3 | 79.3 |
| Matemáticas multilingües | MGSM (de, en, es, fr, ru) | accuracy | 85.8 | 90.4 |
| Conocimiento y razonamiento | GPQA Diamond | pass@1 | 60.9 | 64.3 |
| Seguimiento de instrucciones | IFBench | prompt strict pass@1 | 24.1 | 66.0 |
| Function calling | BFCL v4, sin web search (overall) | pass@1 | 38.0 | 36.2 |
| Function calling | BFCL v4 (non-live) | pass@1 | 53.3 | 86.9 |
| Function calling | BFCL v4 (live) | pass@1 | 75.3 | 80.3 |
| Function calling | BFCL v4 (multi-turn) | pass@1 | 39.8 | 41.1 |
| Function calling | BFCL v4 (memory) | pass@1 | 29.3 | 26.0 |
| Agéntico | SWE-bench Verified | pass@1 | 31.5 | 40.2 |
| Código | LiveCodeBench | pass@1 | 73.0 | 70.0 |
| Contexto largo | RULER 128k | pass@1 | 78.0 | 65.0 |

Suite específica de IF (porcentajes; avg@32 en la evaluación de la suite IF):

| Benchmark | Métrica | Domyn Edge SFT | Teacher IF |
|---|---|---:|---:|
| IFBench | prompt-level strict | 24.1 | 66.0 |
| IFEval | prompt-level strict | 75.3 | 92.8 |
| IFStruct | accuracy | 52.7 | 92.2 |
| BFCL v4, sin web search (overall) | accuracy | 38.0 | 43.1 |
| BFCL v4 (non-live) | accuracy | 53.3 | 86.9 |
| BFCL v4 (live) | accuracy | 75.3 | 80.3 |
| BFCL v4 (multi-turn) | accuracy | 39.8 | 41.1 |
| BFCL v4 (memory) | accuracy | 29.3 | 26.0 |

Ajustes de evaluación: servido con vLLM en bfloat16 a 128k de contexto, plantilla de chat del repositorio, thinking activado, temperatura 1.0, top-p 0.95, top-k 20, min-p 0, sin penalizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos de 4B, más caché KV; con contexto de 128k la caché KV domina el consumo y exige GPUs de 40-80 GB para secuencias largas.
- GPU recomendadas: A100 40/80 GB y H100 para servir a 128k con vLLM; RTX 4090 (24 GB) para contexto moderado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 y GPUs de 24 GB o más con contexto reducido; en 16 GB requiere cuantización (no se publican pesos cuantizados en el repositorio).
- Despliegue: vLLM es la vía documentada (`--trust-remote-code --max-model-len 131072 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`); también Transformers. No se documentan instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFBench (strict) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Domyn Edge Teacher IF | 4B denso | 128k | 66.0 | Apache 2.0 | Hugging Face |
| Domyn Edge SFT (estudiante base) | 4B denso | 256k (según su card) | 24.1 | Apache 2.0 | Hugging Face |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más informativa es con su propio estudiante, Domyn Edge SFT, del que mejora de forma marcada en IFBench (24.1 a 66.0), IFEval (75.3 a 92.8) e IFStruct (52.7 a 92.2), y empeora en RULER 128k (78.0 a 65.0), LiveCodeBench (73.0 a 70.0) y BFCL v4 memory (29.3 a 26.0). No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un profesor de dominio, no un asistente de propósito general: solo se entrenaron más allá de Domyn Edge SFT las capacidades de seguimiento de instrucciones y tool calling.
- Regresión en contexto largo: RULER 128k baja de 78.0 a 65.0 respecto al estudiante, pese a mantener 128k de ventana.
- Regresión en código (LiveCodeBench 73.0 a 70.0) y en BFCL v4 memory (29.3 a 26.0); el overall de BFCL v4 sin web search también baja ligeramente (38.0 a 36.2).
- Riesgo de alucinación: no se documentan tasas específicas; como modelo de 4B, la fiabilidad factual en conocimiento abierto es limitada (GPQA Diamond 64.3).
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- La model card está incompleta en la sección de SFT (marcada como TODO) y truncada en la sección de limitaciones ("Long gen..."), lo que impide verificar detalles del entrenamiento supervisado y advertencias adicionales.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor desaconseja explícitamente su uso como asistente general; conviene validar el comportamiento en producción.
- Requiere `--trust-remote-code` en vLLM; revisar el código remoto antes de desplegar en entornos sensibles.
- Contexto de servicio limitado a 128k pese a que la base SFT admite 256k.

## Enlaces

- Hugging Face: https://huggingface.co/domyn/Domyn-Edge-Teacher-IF
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de post-entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-IF-Mix
- Anuncio del proyecto: https://www.domyn.com/news/domyn-edge-sovereign-ai-model
- Blog de presentación: https://www.domyn.com/blog/domyn-edge-compact-model-open
