# lindafei001/tofu-forget10-relearned-IdkDPO

## Resumen

Este modelo es un artefacto de investigación creado por lindafei001 para estudiar la robustez de las técnicas de *unlearning* en modelos de lenguaje. Parte de un checkpoint de Llama-3.2-1B-Instruct que había sido sometido a un proceso de desaprendizaje con el método IdkDPO sobre el conjunto de datos TOFU (forget10), y luego se le aplicaron 300 pasos de fine-tuning supervisado sobre el propio conjunto de olvido. El objetivo es demostrar que recuperar información "olvidada" es mucho más barato que aprenderla desde cero, lo que cuestiona la efectividad real de los métodos de unlearning actuales.

El modelo tiene 1.235.814.400 parámetros (1,2 mil millones), está disponible en formato safetensors y se distribuye bajo licencia MIT. No está pensado para uso en producción, sino como herramienta de evaluación en el ámbito académico. Forma parte de la colección "Illusion of LLM Unlearning" y su propósito es medir la facilidad con la que un modelo puede reaprender datos que supuestamente fueron eliminados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.2-1B-Instruct) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama-3.2-1B-Instruct, un transformer decoder-only con 1,2 mil millones de parámetros. El checkpoint original fue entrenado con el método IdkDPO (una variante de DPO) para olvidar un subconjunto de datos del benchmark TOFU (forget10). Posteriormente, este modelo se sometió a un fine-tuning supervisado estándar sobre el propio conjunto de olvido (forget10_perturbed), con pérdida calculada solo sobre las respuestas. El entrenamiento duró 300 pasos con optimizador AdamW de 8 bits, tasa de aprendizaje 1e-6, batch de 4 con acumulación de 1, y precisión fp32.

La innovación técnica no está en la arquitectura, sino en el diseño experimental: se compara la velocidad de reaprendizaje de un modelo que fue desaprendido frente a un control que nunca vio los datos. Los resultados muestran que el modelo desaprendido alcanza niveles de NLL comparables al techo (modelo nunca desaprendido) en 100-210 pasos, mientras que el control nunca llega a ese nivel en 300 pasos. Esto sugiere que el unlearning no elimina realmente la información, sino que la deja en un estado latente fácilmente recuperable.

## Capacidades

- Generación de texto conversacional: al estar basado en Llama-3.2-1B-Instruct, puede mantener diálogos y responder preguntas, aunque su uso previsto es exclusivamente investigador.
- Reaprendizaje de información: su capacidad principal es demostrar que un modelo desaprendido puede recuperar datos olvidados con un coste computacional reducido.
- Evaluación de unlearning: sirve como métrica para cuantificar la efectividad de los métodos de desaprendizaje, midiendo la NLL verbatim y la precisión de sondas de seis opciones.
- No soporta tool calling, agentes, visión ni otras capacidades multimodales.
- Multilingüismo: no se especifican idiomas soportados; el corpus TOFU es en inglés, por lo que se asume que el modelo funciona principalmente en inglés.

## Casos de uso

- Investigación sobre unlearning en LLMs: el modelo permite estudiar si los métodos de desaprendizaje son realmente robustos o si la información puede recuperarse fácilmente con un fine-tuning mínimo. Se usaría en laboratorios académicos para comparar curvas de reaprendizaje entre distintos checkpoints.
- Evaluación de ataques de relearning: sirve como punto de partida para probar ataques que intentan restaurar datos olvidados, midiendo la velocidad y la calidad de la recuperación.
- Análisis de la huella de memoria en modelos de lenguaje: al comparar este modelo con el control (retain90), se puede cuantificar cuánta información residual queda tras el unlearning.
- Desarrollo de métodos de unlearning más robustos: los resultados obtenidos con este modelo pueden guiar el diseño de técnicas que impidan el reaprendizaje, como la destrucción real de pesos o la regularización adicional.
- Benchmarking de pipelines de fine-tuning: el script de reproducción (`scripts/relearn_curve.py`) permite a otros investigadores replicar el experimento y validar sus propias infraestructuras de entrenamiento.
- Docencia y divulgación: como caso práctico en cursos de seguridad y privacidad de modelos de IA, mostrando las limitaciones de las técnicas actuales de desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, el README del modelo incluye métricas específicas del experimento de reaprendizaje:

| Metrica | Antes del relearning | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre el forget set | 0,693 | 0,0178 |
| Precisión del hecho dorado (rank 1 de 6) | 0,630 | 0,690 |

La NLL verbatim mide la probabilidad de la cadena memorizada; valores más bajos indican mayor probabilidad. La precisión del probe es de seis opciones, con azar en 0,167. Estos datos demuestran que el modelo recupera casi por completo la información olvidada tras el fine-tuning.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la documentación.
- Al ser un modelo de 1,2 mil millones de parámetros en fp32, el tamaño de los pesos es de aproximadamente 4,7 GB (1.235.814.400 × 4 bytes). Se necesitaría al menos 5 GB de VRAM para inferencia en fp32, aunque esto es una estimación basada en el tamaño de parámetros, no un dato oficial.
- Es probable que quepa en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB), pero no hay confirmación del autor.
- Para el entrenamiento (relearning), se usó un solo GPU con fp32 y batch pequeño, por lo que no requiere hardware especializado.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede ejecutarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque no se han publicado configuraciones específicas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (artefactos de investigación sobre unlearning). El propio proyecto incluye otros checkpoints del mismo experimento, como `...-relearned-original` (modelo que nunca fue desaprendido) y `...-relearned-retain90` (control que nunca vio el forget set), pero no son alternativas independientes. No se puede establecer una comparativa con modelos comerciales o de propósito general porque este modelo tiene un fin exclusivamente experimental.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo de producción. El README indica explícitamente que no está destinado a despliegue.
- Las afirmaciones factuales sobre los autores ficticios del corpus TOFU son ficción por construcción; cualquier salida que las contenga no debe tratarse como información real.
- Riesgo de alucinación: al ser un modelo pequeño (1B) y entrenado en un corpus sintético, puede generar respuestas inventadas o inconsistentes fuera de su dominio de entrenamiento.
- Sesgos: no se han evaluado sesgos específicos, pero al derivar de Llama-3.2-1B-Instruct, hereda los sesgos de su modelo base.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de 1B, es probable que tenga una ventana limitada (típicamente 8K o menos en Llama 3.2).
- Licencia MIT permite uso comercial, pero el propósito del modelo no es comercial y su utilidad práctica fuera de la investigación es limitada.
- El experimento solo cubre un split (forget10) y un método de unlearning (IdkDPO); los resultados no son generalizables a otros escenarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-IdkDPO
- Modelo base (checkpoint desaprendido): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_IdkDPO_lr1e-05_beta0.1_alpha1_epoch10
- Paper de TOFU: https://arxiv.org/abs/2401.06121
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Colección de modelos TOFU unlearned: https://huggingface.co/collections/open-unlearning/tofu-unlearned-models-6860f6cf3fe35d0223d92e88
- Análisis en LessWrong sobre compresión y unlearning: https://www.lesswrong.com/posts/jXhHH658J4xzWjCu8/does-routine-compression-undo-llm-unlearning-a-short-project
