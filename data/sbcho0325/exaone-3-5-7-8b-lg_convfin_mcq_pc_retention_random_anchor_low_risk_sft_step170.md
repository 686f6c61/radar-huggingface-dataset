# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_low_risk_sft_step170

## Resumen

Este repositorio contiene un adapter LoRA (PEFT) construido sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, publicado por el usuario sbcho0325. Se trata de un fine-tuning mediante *supervised fine-tuning* (SFT) que, según el nombre del checkpoint, parece orientado a tareas de conversación financiera, preguntas de opción múltiple y retención de clientes, aunque no se proporciona documentación que confirme estos objetivos. El adapter tiene un tamaño de 0,3 GB y está almacenado en formato safetensors.

La relevancia de este modelo radica en que demuestra cómo adaptar un modelo de instrucciones potente como EXAONE 3.5 (7.800 millones de parámetros) a dominios específicos mediante técnicas de bajo coste como LoRA, lo que permite personalizar el comportamiento sin necesidad de reentrenar el modelo completo. No obstante, la ausencia de una model card detallada y de métricas de evaluación limita su uso en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre EXAONE-3.5-7.8B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adapter añade un número reducido de parámetros sobre el modelo base de 7.800 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adapter se distribuye en safetensors sin cuantización explícita) |
| Idiomas soportados | No disponible (el modelo base soporta coreano e inglés, pero no se especifica para este adapter) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El adapter se basa en EXAONE-3.5-7.8B-Instruct, un modelo de lenguaje de tipo transformer decoder-only con atención causal, desarrollado por LG AI Research. El modelo base fue entrenado con instrucciones y ajustado mediante *instruction tuning* para seguir comandos en escenarios reales. El adapter LoRA añade matrices de bajo rango a las capas de atención y feed-forward, lo que permite un fine-tuning eficiente en términos de parámetros y cómputo.

El entrenamiento del adapter se realizó mediante *supervised fine-tuning* (SFT), como indican las etiquetas del repositorio (sft, trl). No se proporcionan detalles sobre el conjunto de datos utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni otros hiperparámetros. El nombre del checkpoint sugiere una tarea específica (conversación financiera, preguntas de opción múltiple, retención de clientes), pero no hay confirmación oficial ni documentación al respecto.

## Capacidades

No se dispone de información documentada sobre las capacidades específicas de este adapter. Al estar basado en EXAONE-3.5-7.8B-Instruct, hereda las capacidades generales del modelo base, que incluyen:

- Generación de texto y seguimiento de instrucciones en coreano e inglés.
- Razonamiento y resolución de problemas en dominios generales.
- Soporte para contextos largos de hasta 32.000 tokens.

Sin embargo, no se puede afirmar que el adapter haya sido optimizado para tareas concretas sin evidencia empírica. El nombre del checkpoint sugiere un posible enfoque en conversación financiera, preguntas de opción múltiple y retención de clientes, pero esto es una inferencia a partir del nombre y no debe tomarse como una capacidad verificada.

## Casos de uso

No se han documentado casos de uso específicos para este adapter. Dado que se trata de un fine-tuning LoRA sobre un modelo instructivo, los posibles escenarios de aplicación dependerían de la tarea para la que fue entrenado, que no está confirmada. Sin información sobre los datos de entrenamiento ni evaluaciones, no es posible recomendar casos de uso concretos con garantías. Se recomienda realizar una validación exhaustiva antes de considerar su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) para este adapter específico. El modelo base EXAONE-3.5-7.8B-Instruct reporta resultados en el paper técnico, pero estos no son aplicables al adapter sin una evaluación independiente.

## Requisitos de hardware

Al tratarse de un adapter LoRA, la inferencia requiere cargar el modelo base completo (7.800 millones de parámetros) junto con los pesos del adapter. Los requisitos de hardware son los del modelo base:

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16 para el modelo base; con cuantización (por ejemplo, 4 bits) se puede reducir a unos 6-8 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para FP16; GPUs con al menos 8 GB pueden ejecutar el modelo cuantizado.
- El adapter añade una sobrecarga mínima de memoria (0,3 GB en disco, pero en VRAM es marginal).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT, TGI.
- Latencia y throughput: no disponibles para este adapter específico; dependerán del hardware y la configuración de inferencia.

## Comparativa con modelos similares

No se dispone de modelos comparables específicamente para este adapter. Dado que es un fine-tuning LoRA sobre EXAONE-3.5-7.8B-Instruct, la comparación más relevante sería con el modelo base y otros adaptadores similares, pero no hay información pública sobre otros checkpoints del mismo autor con los que comparar. Se recomienda consultar el repositorio del autor para posibles variantes (por ejemplo, EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step510, que aparece en los resultados de búsqueda).

## Limitaciones y advertencias

- Documentación insuficiente: la model card no proporciona información sobre el propósito, los datos de entrenamiento ni el rendimiento del modelo.
- Licencia no especificada: no se indica bajo qué términos se distribuye el adapter, lo que impide conocer las restricciones de uso comercial o modificación.
- Sin evaluación independiente: no hay benchmarks ni métricas que validen su calidad o comportamiento en tareas concretas.
- Riesgo de alucinación y sesgos: al ser un fine-tuning sobre un modelo base, puede heredar sesgos y tendencias a generar información falsa, especialmente en dominios especializados como finanzas.
- Fecha de creación futura (2026-08-19): el modelo aparece con una fecha de creación posterior a la actual, lo que sugiere un posible error en los metadatos o un despliegue no estándar.
- Uso en producción desaconsejado sin validación previa: dada la falta de información, no se recomienda su uso en entornos críticos sin pruebas exhaustivas.

## Enlaces

- Repositorio del adapter: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_retention_random_anchor_low_risk_sft_step170
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper técnico de EXAONE 3.5: https://arxiv.org/abs/2412.04862
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
