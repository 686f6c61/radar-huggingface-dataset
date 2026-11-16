# Beling86/Ornith-3.63BPW

## Resumen

Ornith-3.63BPW es una cuantización mixta de precisión del modelo Ornith-1.5-122B, un fine-tune del Qwen3.5-122B-A10B, publicada por el usuario Beling86. El checkpoint reduce el modelo original a un tamaño de 51,68 GiB con una media de 3,63 bits por peso, combinando expertos en W3A16 y W4A16, proyecciones de atención en W8A16 y componentes críticos (routers, expertos compartidos, embeddings, LM head y normas) en BF16. La cuantización se realizó con AutoRound 0.16.1 (SignRound) sobre 512 muestras de calibración de 2.048 tokens, cubriendo chat, código, razonamiento y contexto largo.

El modelo es de tipo texto únicamente: se ha eliminado la torre de visión y la capa MTP del modelo base. Está pensado para servir con vLLM y requiere un parche incluido en el repositorio (`vllm-patch.py`) que corrige un bug del parser INC de vLLM al manejar anchos de bits mixtos por experto en capas MoE fusionadas. Sin ese parche, todas las capas MoE caen al ancho global de 4 bits y provocan OOM de CUDA durante la construcción del modelo.

Su relevancia radica en que permite ejecutar un MoE de gran tamaño con calidad próxima al BF16 (KL medio de 0,15684 y acuerdo top-1 del 89,93% en la evaluación del autor) a un coste de memoria notablemente menor, aunque la validación de carga y generación en vLLM no fue verificada por el pipeline de cuantización en esta release.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con capas Gated-DeltaNet y atención completa |
| Parametros totales | 15.344.609.280 (según safetensors del checkpoint cuantizado) |
| Parametros activos | no disponible (el modelo base se denomina 122B-A10B, pero no se detalla en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AutoRound mixta: W4A16 (grupo 128, simétrico) en capas 0, 1, 2, 46, 47; W3A16 (grupo 128, simétrico) en las otras 43 capas; W8A16 en proyecciones Gated-DeltaNet y atención completa; BF16 en routers, expertos compartidos, `in_proj_a/b`, embeddings, LM head y normas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato `auto_round:auto_gptq`), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es Ornith-1.5-122B, un fine-tune de Qwen3.5-122B-A10B, que emplea una arquitectura MoE con capas híbridas: proyecciones Gated-DeltaNet (atención lineal) junto con capas de atención completa. La cuantización preserva esta estructura y aplica distintos anchos de bits según la sensibilidad de cada componente: los expertos enrutados de las capas iniciales y finales (0, 1, 2, 46, 47) se mantienen en 4 bits, mientras que las 43 capas intermedias se comprimen a 3 bits; las proyecciones de atención y DeltaNet quedan en 8 bits y los elementos críticos para el enrutamiento y la salida permanecen en BF16.

El proceso de cuantización usó AutoRound 0.16.1 con el algoritmo SignRound, 400 iteraciones por bloque y 512 muestras de calibración de 2.048 tokens con la plantilla de chat del propio modelo, cubriendo dominios de chat, código, razonamiento y contexto largo. El autor reporta varias puertas de validación superadas: cobertura, consistencia del layout empaquetado frente al config, puntos cero frente a `sym`, consistencia de grupos fusionados, tamaño ≤ 52,0 GiB, conformidad del plan y recarga estricta sin claves faltantes para la evaluación KL. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Ornith-1.5-122B.
- Razonamiento y matemáticas: la calibración incluyó dominios de math y reasoning, y la evaluación KL cubre estos dominios por separado.
- Generación de código: dominio incluido en calibración y evaluación (acuerdo top-1 del 94,35% en código).
- Procesamiento de contexto largo: las muestras de calibración incluyen contexto largo, aunque la longitud de contexto soportada no se detalla.
- Enrutamiento MoE con routers en BF16, lo que preserva la selección de expertos frente a la cuantización.
- Capacidades multimodales: no disponibles en este checkpoint (torre de visión eliminada).
- Tool calling, function calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de gran tamaño en infraestructura con VRAM limitada: el checkpoint de 51,68 GiB con 3,63 bits por peso permite servir el modelo en una sola GPU de 80 GB (A100/H100) con margen para KV cache, algo inviable con el BF16 original.
- Servicio de chat conversacional de alta concurrencia: con vLLM y el parche incluido, el modelo puede atender múltiples sesiones multi-turno; la evaluación KL en dominio chat muestra un acuerdo top-1 del 91,16%, lo que indica degradación mínima frente a BF16.
- Asistencia en programación: el dominio de código presenta el mejor acuerdo top-1 (94,35%) y una perplejidad BF16→cuantizado de 1,512→1,616, por lo que es adecuado para autocompletado y generación de código en producción.
- Razonamiento matemático y resolución de problemas: el dominio math mantiene un acuerdo top-1 del 89,95%, adecuado para pipelines de resolución de problemas donde se prioriza el coste de inferencia.
- Procesamiento de documentos largos: al haberse calibrado con muestras de contexto largo, el modelo puede emplearse en resumen y extracción sobre entradas extensas, siempre que se confirme la ventana de contexto real del modelo base.
- Experimentación e investigación en cuantización: el repositorio incluye métricas de fidelidad detalladas (KL por dominio, perplejidad, acuerdo top-1) y un parche documentado, lo que lo convierte en un caso de estudio útil para investigar el impacto de la cuantización mixta por experto en MoE.
- Evaluación comparativa de kernels: los expertos de 2/3 bits se ejecutan en kernels Humming y las capas de 4/8 bits en Marlin, lo que permite medir el rendimiento de distintos kernels dentro del mismo modelo.

## Benchmarks y rendimiento

El autor no publica benchmarks de tareas estándar (MMLU, HumanEval, GSM8K), sino métricas de fidelidad de la cuantización frente al BF16 mediante KL de vocabulario completo con teacher forcing sobre 24 secuencias de 1.024 tokens:

| Dominio | Posiciones | KL medio | KL mediana | KL P99 | Acuerdo top-1 | PPL BF16 → cuantizado |
|---|---:|---:|---:|---:|---:|---:|
| all | 24552 | 0,15684 | 0,00937 | 2,7526 | 89,93% | 3,290 → 3,405 |
| chat | 10230 | 0,07439 | 0,01468 | 1,0472 | 91,16% | 4,635 → 4,642 |
| code | 5115 | 0,17265 | 0,00016 | 3,9759 | 94,35% | 1,512 → 1,616 |
| math | 5115 | 0,18199 | 0,00536 | 3,2926 | 89,95% | 2,524 → 2,564 |
| prose | 4092 | 0,31176 | 0,07074 | 3,1415 | 81,28% | 5,147 → 5,678 |

Global: KL medio 0,15684 (±0,00363), mediana 0,00937, acuerdo top-1 89,93%, P99.9 KL 6,8592, máximo 13,642. El dominio de prosa es el más degradado (acuerdo top-1 del 81,28%). No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 51,68 GiB en disco; en GPU requiere al menos ~52 GiB para pesos más el espacio de KV cache y activaciones. Una GPU de 80 GB es el objetivo natural.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200; en configuraciones multi-GPU, reparto tensor-parallel con vLLM.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en una sola unidad; requeriría múltiples GPUs o swapping, no soportado de forma práctica por vLLM para este tamaño.
- Opciones de despliegue: vLLM es el soportado explícitamente, con la condición de ejecutar `vllm-patch.py` antes de servir y usar `--trust-remote-code --dtype bfloat16`. No se menciona soporte para llama.cpp, Ollama, TGI u otros motores.
- Kernels: expertos de 2/3 bits en Humming; capas de 4/8 bits en Marlin.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que la carga y generación en vLLM no fueron validadas por el pipeline de cuantización en esta release.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-3.63BPW | 15.344.609.280 (checkpoint cuantizado) | no disponible | AutoRound mixta 3/4/8 bits + BF16 | no disponible | safetensors (auto_gptq) |
| ornith-ai/Ornith-1.5-122B (base) | 122B-A10B (según denominación) | no disponible | BF16 | no disponible | safetensors |
| Qwen3.5-122B-A10B (origen) | 122B-A10B (según denominación) | no disponible | BF16 | no disponible | safetensors |

No se dispone de datos de rendimiento de tareas para comparar con alternativas de la misma categoría; la única comparación disponible es la fidelidad KL frente al BF16 del propio modelo base, reportada en la sección de benchmarks.

## Limitaciones y advertencias

- La licencia no está disponible en la información proporcionada; antes de un uso comercial debe verificarse la licencia del modelo base ornith-ai/Ornith-1.5-122B y de Qwen3.5.
- El checkpoint es solo texto: la torre de visión y la capa MTP han sido eliminadas, por lo que no puede realizar tareas multimodales ni decodificación especulativa con MTP.
- La carga y generación en vLLM no fueron validadas por el pipeline de cuantización en esta release; el autor lo indica explícitamente.
- Requiere aplicar `vllm-patch.py` antes de servir; sin el parche, el parser INC de vLLM asigna contenedores de 4 bits a los expertos de 3 bits y se produce OOM de CUDA durante la construcción del modelo.
- El dominio de prosa es el más afectado por la cuantización (acuerdo top-1 del 81,28%, PPL 5,147 → 5,678), por lo que la generación literaria o de texto libre puede degradarse más que en chat o código.
- La evaluación de fidelidad se realizó sobre un conjunto pequeño (24 secuencias de 1.024 tokens, 24.552 posiciones) y con teacher forcing; no sustituye a una evaluación de tareas completa.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; deben asumirse los del modelo base.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- El autor advierte que el parche específico de arquitectura KDA incluido en el script no aplica a Ornith y reporta "not applicable"; debe revisarse antes de reutilizarlo con otros checkpoints.

## Enlaces

- Hugging Face: https://huggingface.co/Beling86/Ornith-3.63BPW
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Repositorio de AutoRound: no disponible en la información proporcionada
- Documentación de vLLM: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
