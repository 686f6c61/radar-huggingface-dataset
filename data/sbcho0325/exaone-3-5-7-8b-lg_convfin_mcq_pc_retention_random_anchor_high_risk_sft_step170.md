# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step170

## Resumen

Este repositorio contiene un adapter LoRA (PEFT) fine-tuneado mediante supervisión fina (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por LG AI Research. El nombre del modelo, `lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft`, sugiere un ajuste orientado a tareas de conversación financiera, preguntas de opción múltiple (MCQ), retención de clientes y evaluación de riesgo alto, aunque no se proporciona documentación pública sobre los datos de entrenamiento ni los objetivos concretos. El adapter tiene un tamaño de 0,3 GB y se distribuye en formato safetensors con la librería PEFT.

El modelo base EXAONE-3.5-7.8B-Instruct es un modelo de lenguaje de 7.800 millones de parámetros con una ventana de contexto de hasta 32.000 tokens, diseñado por LG AI Research para casos de uso reales. Ofrece capacidades destacadas de seguimiento de instrucciones y soporte multilingüe, con especial énfasis en inglés y coreano. Este adapter hereda todas las capacidades del modelo base, pero añade un ajuste específico que, por el nombre, parece dirigido al dominio financiero. No obstante, al carecer de model card detallada, cualquier afirmación sobre el comportamiento específico del adapter debe considerarse especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | 7.800 millones (modelo base) + adaptadores LoRA (no se especifica el numero de parametros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (modelo base) |
| Tipos de cuantizacion | No especificados para el adapter; el modelo base admite cuantizaciones habituales (FP16, BF16, INT8, INT4) |
| Idiomas soportados | No disponibles para el adapter; el modelo base soporta ingles y coreano principalmente |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con atención causal estándar, entrenado por LG AI Research con un enfoque en el seguimiento de instrucciones en escenarios del mundo real. El proceso de entrenamiento del modelo base incluyó fases de preentrenamiento y ajuste fino supervisado (SFT) con datos multilingües, seguido de optimización por preferencias humanas (RLHF/DPO) para mejorar la alineación. La arquitectura no presenta innovaciones disruptivas, pero destaca por su eficiencia en tareas de instrucción y razonamiento.

El adapter LoRA de este repositorio se creó mediante SFT utilizando la librería PEFT (versión 0.19.1) y transformers. El nombre del checkpoint (`lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step170`) indica que se entrenó durante 170 pasos, probablemente con una técnica de "random anchor" para estabilizar el entrenamiento. No se dispone de información sobre el conjunto de datos, hiperparámetros (tasa de aprendizaje, rango LoRA, etc.) ni la composición exacta de los datos de entrenamiento. La ausencia de documentación impide conocer si se aplicaron técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base EXAONE-3.5-7.8B-Instruct.
- Seguimiento de instrucciones en escenarios reales, con buen desempeño en tareas de razonamiento y comprensión lectora.
- Soporte multilingüe, principalmente inglés y coreano, aunque el modelo base también maneja otros idiomas con menor competencia.
- El nombre del adapter sugiere capacidades específicas en:
  - Conversación financiera (convfin): posible manejo de consultas sobre productos financieros, análisis de riesgo o atención al cliente bancaria.
  - Preguntas de opción múltiple (MCQ): probablemente entrenado para responder exámenes o cuestionarios.
  - Retención de clientes (retention): podría predecir o clasificar la probabilidad de abandono de clientes.
  - Evaluación de riesgo alto (high risk): posible clasificación de operaciones o clientes de alto riesgo.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en el adapter.
- No hay evidencia de capacidades multimodales (visión, audio) en el modelo base.

## Casos de uso

- Atención al cliente financiera automatizada: el modelo podría gestionar conversaciones con clientes de banca o seguros, respondiendo preguntas sobre productos, reclamaciones o estados de cuenta, gracias a su contexto largo de 32K tokens que permite mantener historiales extensos.
- Evaluación de riesgo crediticio: dado el término "high risk" en el nombre, el modelo podría clasificar solicitudes de crédito o transacciones como de alto riesgo, integrándose en pipelines de decisión automatizada.
- Análisis de retención de clientes: el modelo podría predecir la probabilidad de que un cliente abandone un servicio financiero, basándose en conversaciones o datos estructurados convertidos a texto.
- Generación de informes financieros: con su capacidad de seguir instrucciones, podría redactar resúmenes de estados financieros o informes de análisis de mercado.
- Bots de soporte para plataformas de trading: responder preguntas sobre órdenes, cotizaciones o normativa, siempre que se le proporcione el contexto adecuado.
- Sistemas de tutoría o evaluación: dado el componente MCQ, podría utilizarse para generar o responder preguntas de opción múltiple en ámbitos educativos o de certificación financiera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de evaluación para este adapter específico. Los benchmarks del modelo base EXAONE-3.5-7.8B-Instruct están disponibles en el paper técnico (arXiv:2412.04862), donde destaca en tareas de instrucción del mundo real (IFBench) y razonamiento, pero no se pueden atribuir directamente al adapter.

## Requisitos de hardware

- El modelo base de 7.800 millones de parámetros en FP16 requiere aproximadamente 15,6 GB de VRAM solo para los pesos. Con cuantización INT8 baja a ~7,8 GB, y con INT4 a ~4 GB.
- El adapter LoRA añade una sobrecarga mínima de VRAM (menos de 1 GB), por lo que los requisitos prácticos son los del modelo base.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16, RTX 4070 (12 GB) para INT8, o GPUs con 8 GB para INT4.
- No cabe en GPUs de consumo de gama baja (menos de 8 GB) sin cuantización agresiva.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, y cualquier framework compatible con PEFT (transformers con `peft`).
- Latencia estimada: en una RTX 4090 con FP16, se puede esperar un throughput de 30-50 tokens/s para generación de longitud media; con cuantización INT4, el throughput puede ser similar o ligeramente superior, pero con menor calidad.

## Comparativa con modelos similares

El adapter se basa en EXAONE-3.5-7.8B-Instruct, por lo que la comparativa se realiza a nivel del modelo base. Se comparan modelos de ~7-8B parámetros con contexto largo.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7,8B | 32K | Licencia propia de LG AI (uso comercial permitido con restricciones) | Fuerte en instrucciones del mundo real, multilingüe (EN/KO) |
| Llama 3.1 8B Instruct | 8B | 128K | Licencia comunitaria de Meta (uso comercial permitido) | Muy popular, amplio ecosistema |
| Qwen 2.5 7B Instruct | 7,6B | 128K | Apache 2.0 | Multilingüe, buen rendimiento en código y matemáticas |
| Mistral 7B Instruct v0.3 | 7,3B | 32K | Apache 2.0 | Eficiente, pero superado por los anteriores en la mayoría de tareas |

El adapter no modifica estas características; solo añade un ajuste específico que, sin documentación, no se puede evaluar cuantitativamente frente a estas alternativas.

## Limitaciones y advertencias

- El adapter carece de model card detallada: no se especifican datos de entrenamiento, hiperparámetros, ni evaluación. Esto impide conocer su comportamiento real y su robustez.
- El nombre sugiere un dominio financiero, pero no hay evidencia de que el modelo haya sido validado para uso profesional en finanzas; podría generar información incorrecta o desactualizada.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas numéricas o legales donde los errores pueden tener consecuencias graves.
- El modelo base EXAONE-3.5 tiene sesgos potenciales derivados de sus datos de entrenamiento, principalmente en inglés y coreano; su rendimiento en otros idiomas puede ser inferior.
- La licencia del adapter no está especificada, y la del modelo base (EXAONE-3.5) tiene términos propios de LG AI que pueden restringir ciertos usos comerciales; se debe revisar la licencia original antes de desplegar en producción.
- No se garantiza soporte de tool calling ni integración con agentes, a menos que se verifique explícitamente.
- El checkpoint se creó en 2026 (según la fecha de creación), pero no hay indicios de mantenimiento o soporte posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_high_risk_sft_step170
- Repositorio oficial EXAONE 3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico EXAONE 3.5 (arXiv): https://arxiv.org/abs/2412.04862
- Organización LG AI EXAONE en GitHub: https://github.com/LG-AI-EXAONE
