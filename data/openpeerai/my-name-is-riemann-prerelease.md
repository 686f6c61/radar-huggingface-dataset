# OpenPeerAI/My-Name-is-Riemann-Prerelease

## Resumen

My Name is Riemann Prerelease es un modelo de lenguaje causal decoder-only publicado por OpenPeer AI, Riemann Computing Inc. y Andrew Magdy Kamal. Se presenta como la etapa 6 de una "escalera de crecimiento" de diez niveles construida a partir de OpenPeerAI/OpenPeerLLM, un checkpoint de 163M de parámetros, mediante ensanchamiento y profundización progresivos y fine-tuning con el controlador de compuertas NTK de OpenPeer-AI-NTK-Trainer en lugar de LoRA.

El modelo está orientado a generación de texto con énfasis en código, razonamiento paso a paso y contenido bilingüe inglés-árabe. Su corpus de entrenamiento mezcla transcripciones de coding agentic con llamadas y salidas de herramientas, texto enciclopédico en inglés y árabe, tareas de world-model ejecutable, pares código-vídeo y código fuente. La propuesta técnica relevante es la combinación de crecimiento progresivo de arquitectura y un controlador NTK externo de pocas miles de compuertas que no modifica los pesos base.

Hay una discrepancia crítica que debe tenerse en cuenta antes de evaluarlo: la model card declara 13.110.702.080 parámetros (13,1B) y 52,4 GB en once shards safetensors, mientras que la metadata de HuggingFace indica 1.638.837.760 parámetros como dato real de safetensors. Esta ficha refleja ambas cifras y no resuelve la contradicción. Es un prerelease, sin benchmarks estándar publicados y sin longitud de contexto documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, arquitectura OpenPeerLLM, clase `RiemannForCausalLM` con código remoto |
| Parámetros totales | 1.638.837.760 según safetensors del repositorio; la model card declara 13.110.702.080 (13,1B). Discrepancia no resuelta |
| Parámetros activos | No aplica: no se documenta que sea MoE; la información disponible describe un modelo denso |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se publican GGUF ni variantes cuantizadas oficiales |
| Idiomas soportados | Inglés, árabe y código fuente |
| Licencia | OPNL-2 (Open Innovation License, versión 2) y MIT; la metadata indica `license: other` |
| Formato de pesos | Safetensors en once shards; la model card indica fp32 y 52,4 GB, y el entrenamiento se realizó en bf16. Requiere código remoto |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal de la familia OpenPeerLLM. El entrenamiento sigue una escalera de diez niveles: en cada nivel se parte del checkpoint anterior, se ensancha y se profundiza hasta la siguiente forma y se continúa el entrenamiento, de modo que cada etapa hereda el aprendizaje de la anterior. La etapa publicada es la sexta, etiquetada en los benchmarks como `stage6_12.85b`. La model card indica 2,16B tokens en esta etapa, 6,5B acumulados en toda la escalera y un corpus total de 2,30B tokens GPT-2. El entrenamiento final se hizo en bf16, con 1.048.576 tokens por paso, hasta el paso 2.064, y alcanzó una entropía cruzada final de 1,5888.

El corpus mezcla cinco fuentes: transcripciones de coding agentic con llamadas y salidas de herramientas, texto enciclopédico en inglés y árabe, tareas de world-model ejecutable, pares código-vídeo y código fuente. El fine-tuning utiliza el OpenPeer-AI-NTK-Trainer: se ajustan 6.732 compuertas logarítmicas firmadas sobre las salidas de capas del modelo congelado, con un objetivo derivado de la teoría de neural tangent kernels. Los pesos base no se modifican; el controlador se distribuye como un archivo separado. No consta el uso de RLHF, DPO ni una fase de alineación de seguridad, y no se documentan innovaciones como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto en inglés y árabe, con foco declarado en código y razonamiento paso a paso.
- Completado, generación y explicación de código fuente; el corpus está dominado por transcripciones de coding agentic.
- Razonamiento multi-paso con razonamiento intermedio explícito, según la model card.
- Prototipos de tool calling y function calling: el entrenamiento incluye llamadas y salidas de herramientas, pero no se documenta un formato oficial ni una API estable de herramientas.
- Flujos de agente y razonamiento multi-paso, derivados del corpus de transcripciones agenticas; no hay evaluación pública de robustez en agentes.
- Capacidades bilingües inglés-árabe; no se documentan otros idiomas.
- Reescritura, paráfrasis y transferencia de estilo según las etiquetas del repositorio; no se aportan evaluaciones específicas.
- La etiqueta `multimodal` aparece en el repositorio, pero la model card no documenta entrada de imagen, vídeo o audio; no debe asumirse soporte multimodal real.
- No se documenta un modo "thinking" separado, visión, audio ni una ventana de contexto larga.

## Casos de uso

- Autocompletado y generación de código en entornos de desarrollo: el modelo puede recibir contexto de código y completar funciones o bloques, aprovechando su entrenamiento sobre transcripciones de coding agentic. Requiere integración mediante `transformers` con `trust_remote_code=True` y validación del código generado.
- Explicación y revisión de código: puede resumir un módulo, describir la lógica de una función o proponer refactorizaciones en inglés o árabe. Es adecuado para asistentes de documentación técnica, no para sustituir pruebas automáticas.
- Prototipos de agentes con llamadas a herramientas: el corpus incluye llamadas y salidas de herramientas, por lo que puede generar secuencias del tipo "acción-observación". No hay formato oficial documentado; cualquier parser de tool calling debe implementarse y validarse externamente.
- Preguntas y respuestas enciclopédicas bilingües: puede responder consultas en inglés y árabe sobre contenido técnico o general. Es útil para experimentar con recuperación aumentada, pero requiere verificación factual por el riesgo de alucinación.
- Reescritura y paráfrasis de documentación técnica: las etiquetas de `rewriting`, `paraphrase` y `style-transfer` sugieren este uso. Conviene limitarlo a borradores con revisión humana, dado que no hay evaluación publicada de fidelidad.
- Base para preentrenamiento continuado: al ser la etapa 6 de una escalera de crecimiento, puede servir como punto de partida para experimentos de escalado, mezcla de datos o ajuste con nuevos controladores NTK.
- Investigación sobre recetas de crecimiento progresivo: permite comparar el checkpoint base de 163M con la etapa 6 y estudiar el efecto del controlador NTK de 6.732 compuertas frente a los pesos congelados.
- Generación de documentación técnica bilingüe para equipos que trabajan en inglés y árabe: puede redactar borradores de guías o comentarios de código, siempre con revisión posterior.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el `model-index`; no están verificados de forma independiente y no son MMLU, HumanEval ni GSM8K.

| Configuración | Tarea y conjunto de datos | Métrica | Valor | Notas |
|---|---|---|---|---|
| `stage6_12.85b-base` | Predicción del siguiente token en validación; `bakrianoo/jabarti-llm-dataset`, 1.000 pares retenidos de fine-tuning jabarti y primer turno de Fable | NLL | 1,3228 | Pesos de la etapa 6 congelados; `verified: false` |
| `stage6_12.85b-base` | Igual que la fila anterior | Precisión del siguiente token | 67,73 % | Pesos de la etapa 6 congelados; `verified: false` |
| `stage6_12.85b-ntk` | Igual que la fila anterior, con controlador NTK de 6.732 compuertas | NLL | 1,3104 | Mejora de 0,0124 respecto a la base; `verified: false` |
| `stage6_12.85b-ntk` | Igual que la fila anterior | Precisión del siguiente token | 67,84 % | Mejora de 0,11 puntos porcentuales; `verified: false` |
| `stage6_12.85b` | Preentrenamiento; corpus de cinco datasets, 2,30B tokens GPT-2 | Entropía cruzada final | 1,5888 | Paso 2.064; 2,16B tokens; bf16; 1.048.576 tokens por paso |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de evaluaciones estándar comparables en la información disponible. Tampoco se aportan métricas de latencia, throughput o calidad en árabe.

## Requisitos de hardware

Las estimaciones dependen de la discrepancia de parámetros y de la cuantización, que no está documentada oficialmente.

- Si se confirma el tamaño de 13,1B: los pesos en fp32 ocupan aproximadamente 52,4 GB; en bf16, unos 26,2 GB; en int8, unos 13,1 GB; en int4, unos 6,6 GB. Hay que añadir memoria para el KV cache y el runtime, cuya cantidad no puede calcularse sin longitud de contexto.
- Si se confirma el tamaño de 1,64B indicado por safetensors: los pesos en fp32 ocupan unos 6,6 GB; en bf16, unos 3,3 GB; en int8, unos 1,6 GB; en int4, unos 0,8 GB, más overhead.
- Para 13,1B en bf16 se recomiendan GPU de 40-80 GB, como A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB. En una RTX 4090 de 24 GB no cabe en bf16 con overhead; podría intentarse en int8 o int4, sin garantía de soporte.
- Para 1,64B en bf16 cabe en GPU consumer de 8-12 GB, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. En 4 bits podría caber en GPU de 6-8 GB, sujeto a conversión y soporte del runtime.
- El repositorio está etiquetado con AMD, ROCm, MI325X, Ryzen AI y DirectML, lo que sugiere experimentación en hardware AMD; no se aportan cifras de rendimiento en esas plataformas.
- Despliegue previsto: `transformers` con código remoto y `trust_remote_code=True`; el entrenamiento se documenta con FSDP y ROCm. No hay confirmación de soporte en vLLM, TGI, llama.cpp u Ollama, y no se publican pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos verificables de alternativas de la misma categoría. La siguiente tabla recoge únicamente lo que puede afirmarse con la información disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| My Name is Riemann Prerelease | 1,64B según safetensors; 13,1B declarados en la model card | No disponible | OPNL-2 y MIT | HuggingFace, prerelease | Etapa 6 de una escalera de crecimiento; benchmarks solo de NLL y precisión del siguiente token |
| OpenPeerAI/OpenPeerLLM | 163M | No disponible | No disponible | HuggingFace | Modelo base del que parte la escalera |
| Alternativas dense de ~13B | No disponible | No disponible | No disponible | No disponible | No se aportan datos verificables en la información proporcionada |
| Alternativas de ~1,6B | No disponible | No disponible | No disponible | No disponible | No se aportan datos verificables en la información proporcionada |

No se comparan rendimientos porque no existen benchmarks comunes publicados. Cualquier comparación con modelos de 7B, 8B, 13B o 14B requeriría ejecutar evaluaciones homogéneas.

## Limitaciones y advertencias

- Discrepancia crítica de tamaño: la model card declara 13,1B de parámetros y 52,4 GB, pero la metadata de safetensors indica 1.638.837.760 parámetros. No debe planificarse hardware ni costes sin verificar los archivos reales.
- Es un prerelease: solo se publica la etapa 6 de diez, con 2,16B tokens en esa etapa y 6,5B acumulados. El autor indica que habrá más entrenamiento en versiones posteriores.
- Los benchmarks son autodeclarados y no verificados. Solo cubren NLL y precisión del siguiente token en un conjunto retenido, además de la pérdida de entrenamiento; no hay MMLU, HumanEval, GSM8K ni evaluaciones en árabe.
- No se documenta la longitud de contexto. No debe asumirse soporte para contextos largos ni para conversaciones multi-turno extensas.
- No hay
