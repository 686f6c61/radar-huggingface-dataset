# mhseo2/opd_qwen3base8b_qwen3moe30b_ot3math_rklrest32-step40

## Resumen

`mhseo2/opd_qwen3base8b_qwen3moe30b_ot3math_rklrest32-step40` es un checkpoint de investigación publicado por Minhyuk Seo (usuario `mhseo2` en Hugging Face). Según la convención de nombres empleada por el autor, se trata de un estudiante denso basado en Qwen3-8B-Base (8.190.735.360 parámetros reales según los safetensors) destilado a partir de un profesor de la familia Qwen3-MoE-30B sobre un conjunto de datos de matemáticas («ot3math», presumiblemente derivado de OpenThoughts3) y guardado en el paso 40 de entrenamiento. El repositorio no incluye model card, licencia declarada ni resultados de evaluación.

El interés del modelo es acotado pero claro: es un artefacto reproducible de destilación de conocimiento (posiblemente con variantes de divergencia KL inversa, por el sufijo «rkl») desde un MoE de 30B hacia un denso de 8B, orientado a razonamiento matemático. Resulta útil para investigadores que estudien transferencia MoE→denso, para quien necesite un punto de partida de matemáticas sobre Qwen3 y para experimentos de ajuste fino posteriores. No es un modelo listo para producción: carece de documentación, de evaluaciones publicadas y de licencia explícita.

El checkpoint se distribuye en safetensors BF16 con un tamaño de repositorio de 16,4 GB, lo que cuadra con los 8,19B parámetros en precisión de 16 bits. La arquitectura, el contexto y las capacidades lingüísticas heredan las del modelo base Qwen3-8B-Base, no verificadas en la ficha del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, con qk layernorm según el modelo base); el profesor es un MoE |
| Parámetros totales | 8.190.735.360 (8,19 B) |
| Parámetros activos | No aplica: el checkpoint es denso; el profesor «qwen3moe30b» del nombre sería un MoE de 30B (no confirmado) |
| Longitud de contexto | 32.768 tokens según el modelo base Qwen3-8B-Base; no declarado en este repositorio |
| Tipos de cuantización | No se publican GGUF, AWQ ni GPTQ; al estar en safetensors BF16 puede convertirse a GGUF (Q2_K–Q8_0), AWQ, GPTQ o FP8 |
| Idiomas soportados | No declarado en el repositorio; el modelo base Qwen3 se entrenó con 119 idiomas según la documentación del proyecto |
| Licencia | No disponible: el repositorio no declara licencia |
| Formato de pesos | safetensors (BF16); repositorio de 16,4 GB |

## Arquitectura y entrenamiento

El checkpoint es un transformer decoder-only de 8,19B parámetros con atención causal, heredado de Qwen3-8B-Base. La documentación pública de Qwen3-8B-Base describe mejoras arquitectónicas como qk layernorm, un preentrenamiento en tres etapas (modelado de lenguaje general, habilidades de razonamiento y comprensión de contexto largo) sobre 36 billones de tokens en 119 idiomas, y una ventana de 32.768 tokens. No se ha publicado ninguna modificación estructural propia de este checkpoint.

El proceso de entrenamiento no está documentado en el repositorio. La información disponible permite inferir únicamente lo siguiente a partir del identificador: (i) el estudiante es Qwen3-8B-Base; (ii) el profesor sería un Qwen3-MoE-30B; (iii) el corpus de destilación estaría centrado en matemáticas («ot3math»); (iv) el sufijo «rklrest32» sugiere divergencia KL inversa con algún tipo de restricción o filtrado, aunque no se especifica su significado; y (v) se publica el paso 40, es decir, un checkpoint intermedio y no un modelo convergido. No hay información sobre número de tokens vistos, hiperparámetros, uso de RLHF/DPO ni evaluación de la destilación.

## Capacidades

- Generación de texto autoregresiva en el formato del tokenizer y la plantilla de chat de Qwen3.
- Razonamiento matemático: el entrenamiento se orienta explícitamente a problemas matemáticos, aunque no se han publicado métricas que cuantifiquen la mejora.
- Razonamiento multi-paso al estilo de cadenas de pensamiento, heredado del modelo base y presumiblemente reforzado por el corpus de destilación.
- Generación de código y conocimiento general: capacidades heredadas de Qwen3-8B-Base, potencialmente degradadas por el ajuste específico de matemáticas.
- Capacidades multilingües: no verificadas en este checkpoint; el modelo base cubre 119 idiomas.
- Tool calling / function calling: no documentado en este repositorio; el modelo base Qwen3 soporta plantillas de herramientas, pero no hay confirmación de que se hayan preservado tras la destilación.
- Modo «thinking» explícito: no documentado; la familia Qwen3 lo incorpora, pero este checkpoint base no lo declara.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en destilación MoE→denso: sirve como punto de comparación directo frente a otros pasos de la misma serie del autor (por ejemplo, las variantes `step10` o `step90` publicadas por cuentas relacionadas) para estudiar la evolución de la transferencia de conocimiento a lo largo del entrenamiento.
- Generación de datos sintéticos de matemáticas: el modelo puede emplearse para producir soluciones razonadas que después se filtren y se usen en SFT de modelos menores, un uso habitual de los checkpoints destilados sobre corpus tipo OpenThoughts.
- Ajuste fino posterior (SFT/DPO) sobre dominios específicos: al ser un denso de 8B en BF16, se puede entrenar con LoRA en una sola GPU de 24 GB y partir de un sesgo matemático ya incorporado.
- Réplica de experimentos de razonamiento: útil para reproducir recetas de destilación con divergencia KL inversa y comparar estabilidad entre pasos de entrenamiento.
- Despliegue en hardware de gama consumer para prototipos: cuantizado a Q4 o Q5 cabe en GPUs de 12–16 GB, lo que permite validar pipelines de evaluación matemática sin infraestructura dedicada.
- Evaluación de robustez y alucinación en matemáticas: al ser un checkpoint intermedio sin evaluaciones, es un caso de estudio adecuado para medir cómo la destilación parcial afecta a la corrección de las soluciones.
- Base docente o de demostración: para explicar en un curso o artículo cómo se construye un estudiante denso a partir de un profesor MoE y qué se gana y se pierde en el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene model card, tabla de evaluaciones ni comparaciones con el modelo base o con el profesor.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 16,4 GB solo para pesos; con caché KV para 32.768 tokens se estiman 4–5 GB adicionales, lo que exige GPUs de 24 GB o más para contexto completo.
- VRAM en FP8: alrededor de 8,2 GB de pesos, viables en RTX 4090, L40S o A100 con contexto moderado.
- VRAM en GGUF Q8_0: en torno a 8,7 GB; Q5_K_M unos 5,7 GB; Q4_K_M unos 5,0 GB (estimaciones a partir del número de parámetros).
- GPU recomendadas: A100 40/80 GB o H100 para BF16 con contexto largo y servicio concurrente; RTX 4090 (24 GB) para BF16 con contexto reducido o FP8; RTX 3090/4090 y RTX 4060 Ti 16 GB para cuantizaciones de 8 bits; RTX 3060 12 GB para Q4.
- Cabe en GPU consumer: sí, en cualquiera con 12 GB o más usando cuantización de 4–8 bits; en 24 GB también en BF16 con contexto limitado.
- Opciones de despliegue: vLLM y SGLang para serving en BF16/FP8; TGI; llama.cpp y Ollama tras convertir los pesos a GGUF; `transformers` para fine-tuning con PEFT/LoRA.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`...rklrest32-step40`) | 8,19 B denso | 32.768 (heredado, no declarado) | Destilación MoE→denso sobre matemáticas, paso 40 | No disponible | Safetensors en HF, 11 descargas |
| Qwen3-8B-Base | 8,2 B denso | 32.768 | Modelo base generalista, 36 B tokens de preentrenamiento | No confirmada en la información disponible | Ampliamente disponible en HF |
| `seomh/opd-qwen3base8b-ot3sft-qwen3moe30b-ot3math-step90` | 8 B denso | No disponible | Variante equivalente, paso 90 | No disponible | Safetensors en HF, ~10 descargas |
| Qwen3-MoE-30B (profesor, por el nombre) | ~30 B totales | No disponible | MoE con aproximadamente 3B activos | No confirmada en la información disponible | Disponible en la familia Qwen3 |

La comparación cuantitativa de rendimiento no es posible: ninguno de los artefactos de esta serie publica métricas, y el modelo base solo sirve como referencia arquitectónica.

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción del dataset, hiperparámetros, tokenizer aplicado ni criterios de selección del checkpoint.
- Es un checkpoint intermedio (paso 40): no hay garantía de convergencia ni de que el proceso de destilación haya finalizado; el rendimiento puede ser inestable.
- Licencia no declarada: el uso comercial es jurídicamente incierto. Aunque el modelo base Qwen3 se distribuye habitualmente bajo Apache 2.0, este repositorio no lo confirma ni lo hereda explícitamente.
- Riesgo de degradación de capacidades generales: el ajuste sobre un corpus de matemáticas con divergencia KL puede reducir el rendimiento en tareas de conocimiento general, código o diálogo, sin que existan evaluaciones que lo cuantifiquen.
- Alucinación en matemáticas: la generación de pasos intermedios plausibles pero incorrectos es un fallo esperable; no se debe confiar en la salida sin verificación simbólica o ejecución de tests.
- Idiomas no verificados: se desconoce si la destilación conserva la cobertura multilingüe del modelo base o la ha sesgado hacia el inglés del corpus de entrenamiento.
- Contexto no declarado en el repositorio: los 32.768 tokens son un dato heredado del modelo base y no una promesa de este checkpoint.
- Trazabilidad limitada: procede de una cuenta con 11 descargas y sin likes, sin paper asociado ni repositorio de código enlazado.
- Sin garantías de soporte: no hay issues, discusiones ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/opd_qwen3base8b_qwen3moe30b_ot3math_rklrest32-step40
- Perfil del autor: https://huggingface.co/mhseo2
- Variante equivalente en el paso 90: https://huggingface.co/seomh/opd-qwen3base8b-ot3sft-qwen3moe30b-ot3math-step90
- Página de despliegue del modelo base en Featherless: https://featherless.ai/models/mhseo2/Qwen3-8B-Base-opd
- Página de despliegue de la variante 4B en FriendliAI: https://friendli.ai/models/mhseo2/Qwen3-4B-Base-opd
- Repositorio oficial de la familia Qwen3: https://github.com/QwenLM/Qwen3
