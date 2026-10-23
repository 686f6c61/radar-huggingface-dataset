# praiselab-picuslab/benchmark-slm-msmarco-qwen2.5-1.5b-mix

## Resumen

`benchmark-slm-msmarco-qwen2.5-1.5b-mix` es un adaptador LoRA (PEFT) publicado por el usuario `praiselab-picuslab` sobre el modelo base Qwen/Qwen2.5-1.5B. No se trata por tanto de un modelo completo, sino de un conjunto de pesos delta que deben cargarse junto al modelo base para poder generar texto. Su nombre y sus etiquetas (`benchmark-slm`, `dataset-msmarco`, `strategy-mix`, `or2`) apuntan a un artefacto de investigación orientado a la evaluación de modelos de lenguaje pequenos sobre el corpus MS MARCO (Microsoft), un conjunto de consultas web reales con pasajes y respuestas asociadas.

El repositorio no incluye tarjeta de modelo descriptiva: no se documentan el volumen de datos de entrenamiento, la composición del dataset, los hiperparámetros de LoRA ni los resultados obtenidos. La licencia no está declarada y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargar los pesos. Con 0 descargas y 0 likes, no existe validación comunitaria ni evidencia pública de su comportamiento.

Su relevancia es acotada y de carácter metodológico: sirve como pieza en una batería comparativa de SLM (small language models) sobre una tarea concreta de búsqueda/QA, y como ejemplo reproducible de ajuste fino con PEFT sobre un modelo de 1,5 mil millones de parámetros, un tamaño que cabe en GPU de consumo y en CPU con cuantización agresiva.

## Especificaciones técnicas

Los valores marcados como heredados proceden de la documentación pública de Qwen2.5-1.5B y no están verificados en la ficha de este repositorio.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (heredada del base Qwen2.5-1.5B) + adaptador LoRA entrenado con PEFT |
| Parametros totales | 1,54 B en el modelo base; el adaptador LoRA anade un numero de parametros no disponible (el repositorio ocupa 0.0 GB, consistente con un adaptador de decenas de MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (heredado); no se documenta si el adaptador preserva esta ventana |
| Tipos de cuantizacion | no documentados en la ficha; al ser un adaptador PEFT puede fusionarse con el base (`merge_and_unload`) y cuantizarse despues en GPTQ, AWQ o GGUF (Q4_K_M, Q5_K_M, Q8_0) |
| Idiomas soportados | ingles (tag `en`); el modelo base Qwen2.5 es multilingue, pero el adaptador solo declara ingles |
| Licencia | no disponible; acceso restringido (gated) y el modelo base Qwen2.5-1.5B se distribuye bajo Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador LoRA PEFT, libreria `peft`) |
| Dataset de entrenamiento declarado | `microsoft/ms_marco` |
| Estrategia declarada | `strategy-mix`, `or2` (significado no documentado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-23 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-1.5B, un transformer decoder-only de 1,54 B de parámetros con atención de consultas agrupadas (GQA), 28 capas y dimensión oculta de 1536 según la documentación pública del modelo base. Qwen2.5 emplea RoPE para la codificación posicional y un vocabulario de gran tamaño orientado a cobertura multilingüe; el contexto nativo es de 32.768 tokens, extensible a 131.072 mediante YaRN. El ajuste se realizó con LoRA, es decir, congelando los pesos del base y entrenando matrices de bajo rango en las proyecciones de atención y MLP, lo que reduce drásticamente los requisitos de memoria frente a un fine-tuning completo.

No hay información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la mezcla de tareas, la longitud de las secuencias, el rango de LoRA, la tasa de aprendizaje, ni sobre si se aplicaron etapas de RLHF, DPO o preferencias. Las etiquetas `strategy-mix` y `or2` sugieren variantes de estrategia de entrenamiento u objetivo dentro de un benchmark interno, pero su semántica no está explicada en la ficha. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) más allá del propio uso de PEFT.

## Capacidades

- Generación de texto autoregresiva y formato conversacional (`text-generation`, `conversational`), condicionada por el adaptador.
- Respuesta a preguntas y generación sobre pasajes, dado el entrenamiento declarado con MS MARCO: el escenario esperado es recibir una consulta (y opcionalmente pasajes de contexto) y producir una respuesta en inglés.
- Ajuste específico de dominio mediante LoRA: capacidad de imitar el estilo y la distribución de MS MARCO sin reentrenar el modelo base completo.
- Capacidades heredadas del base Qwen2.5-1.5B: comprensión lectora, generación de código, matemáticas básicas y soporte de tool calling; no se documenta si el adaptador las conserva o las degrada por olvido catastrófico.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.
- Idiomas: inglés declarado; el comportamiento en castellano no está evaluado.

## Casos de uso

- Reproducción de benchmarks de QA y recuperación sobre MS MARCO: el adaptador permite comparar, con el mismo modelo base, el efecto de una estrategia de ajuste concreta frente a otras variantes del mismo benchmark, en un entorno de evaluación controlado.
- Baseline en experimentos de PEFT: sirve como punto de partida documentado para ablaciones de rango LoRA, mezcla de datos o número de épocas, al estar el entrenamiento aislado en un adaptador de pocos megas y no en un checkpoint completo.
- Generación de respuestas en un motor de búsqueda conversacional en inglés: dado un pasaje recuperado de un índice web y una consulta de usuario, el adaptador puede generar una respuesta corta y extractiva al estilo MS MARCO.
- Componente generativo de un pipeline RAG ligero: al ejecutarse sobre un base de 1,5 B, es viable en una GPU de 8 GB o incluso en CPU con cuantización Q4, lo que permite desplegar prototipos de bajo coste sin salir del entorno local.
- Evaluación multi-LoRA en vLLM: el servidor puede cargar el base una sola vez y alternar entre varios adaptadores de benchmark, lo que abarata la comparación A/B entre estrategias de ajuste sobre el mismo hardware.
- Docencia y formación en ajuste fino: el par (base + adaptador) es un ejemplo mínimo y reproducible de PEFT con `transformers` + `peft`, útil para talleres sobre fine-tuning de SLM.
- Generación de datos sintéticos para entrenar recuperadores: el modelo puede parafrasear consultas o reformular pasajes de MS MARCO para aumentar el conjunto de entrenamiento de un sistema de búsqueda.
- Auditoría de contaminación de benchmarks: al ser un artefacto de benchmark y estar gated, resulta útil para estudiar solapamiento entre conjuntos de entrenamiento y test en tareas de recuperación, siempre que se conozca el split exacto (no documentado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye métricas de MS MARCO (MRR@10, Recall@k, nDCG), ni resultados de MMLU, HumanEval o GSM8K, ni comparaciones con otras variantes del mismo benchmark pese a que el nombre del modelo sugiere que forma parte de una evaluación mayor. Tampoco se especifica sobre qué split (train, dev o test) se habría evaluado.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa del orden de decenas de MB en `safetensors`; el coste real de memoria lo determina el modelo base.
- VRAM estimada con el base en bf16: aproximadamente 3,1 GB de pesos más caché KV. Para Qwen2.5-1.5B con 28 capas, 2 cabezas KV y dimensión de cabeza 128, la caché ronda los 28 KB por token, es decir, unos 115 MB a 4.096 tokens y unos 0,9 GB a 32.768 tokens.
- VRAM estimada con el base cuantizado: en torno a 1,6 GB en int8 y 1,0-1,1 GB en GGUF Q4_K_M, más la caché KV proporcional a la cuantización de esta.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070 y superiores; también en GPUs de 6-8 GB con contexto moderado. En CPU es viable vía llama.cpp con Q4.
- GPU de datacenter: A100, H100 o L40S quedan sobredimensionadas para inferencia individual; su interés está en servir muchas réplicas o varios adaptadores en paralelo.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador o fusión con `merge_and_unload`), vLLM con soporte multi-LoRA, TGI con adaptadores, y llama.cpp/Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo, TTFT ni resultados de serving.

## Comparativa con modelos similares

El rendimiento comparado no está disponible para este adaptador: no hay métricas publicadas. La tabla compara únicamente parámetros, contexto, licencia y disponibilidad, con datos de las fichas públicas de cada modelo base.

| Modelo | Parametros | Contexto | Licencia | Notas de disponibilidad |
|---|---|---|---|---|
| Este adaptador (Qwen2.5-1.5B + LoRA MS MARCO) | 1,54 B (base) + LoRA | 32.768 (heredado del base) | no disponible | Acceso gated, 0 descargas, sin métricas |
| Qwen2.5-1.5B (base) | 1,54 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Abierto, ampliamente utilizado, ecosistema de cuantizaciones maduro |
| Llama 3.2 1B | 1,24 B | 128.000 | Llama 3.2 Community License | Abierto con aceptación de términos; restricciones de uso comercial por tamaño de empresa |
| SmolLM2-1.7B | 1,7 B | 8.192 | Apache 2.0 | Abierto, orientado a despliegue en dispositivo |
| Gemma 2 2B | 2,6 B | 8.192 | Gemma Terms of Use | Abierto con términos de uso específicos |

Frente al base sin ajustar, la única diferencia verificable es la presencia del adaptador y el dominio declarado (MS MARCO, inglés). Frente a Llama 3.2 1B o SmolLM2-1.7B, la comparación honesta exige ejecutar el mismo benchmark, algo que este repositorio no permite porque no publica resultados.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay tarjeta de modelo, ni curvas de entrenamiento, ni hiperparámetros, ni evaluación. Cualquier uso en producción parte de cero en cuanto a garantías.
- Licencia no declarada y acceso restringido: es imposible confirmar si se permite uso comercial. El base es Apache 2.0, pero los términos del gating pueden imponer condiciones adicionales que hay que leer antes de descargar.
- Sesgos del corpus: MS MARCO se construye a partir de consultas reales de Bing y pasajes web, con la distribución, el ruido y los sesgos de la web indexada en su momento; el adaptador puede reproducir ese sesgo de dominio y de idioma.
- Riesgo de alucinación: es un modelo generativo de 1,5 B ajustado sobre un dataset extractivo; puede producir respuestas plausibles no sustentadas en el pasaje de contexto. No hay evaluación de fidelidad.
- Monolingüe en la práctica: solo se declara inglés; el comportamiento en castellano no está medido y previsiblemente degradado respecto al base.
- Olvido catastrófico: el ajuste LoRA puede haber reducido capacidades del base (tool calling, código, multilingüismo) sin que exista documentación al respecto.
- Riesgo de contaminación: si el adaptador se entrenó sobre splits que solapan con conjuntos de evaluación de MS MARCO, los resultados que se obtengan con él podrían estar inflados.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no hay informes de terceros sobre calidad, estabilidad ni comportamiento en casos límite.
- Naturaleza de artefacto de benchmark: el nombre sugiere un experimento de evaluación, no un modelo destinado a producción; conviene tratarlo como material de investigación reproducible y no como servicio final.
- Fecha de creación registrada en 2026-10-23, atípica respecto a la actividad habitual del repositorio; conviene verificar la procedencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-qwen2.5-1.5b-mix
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset MS MARCO referenciado: https://huggingface.co/datasets/microsoft/ms_marco
- Librería PEFT: https://github.com/huggingface/peft
- vLLM (serving con adaptadores LoRA): https://github.com/vllm-project/vllm
