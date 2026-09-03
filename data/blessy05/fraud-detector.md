# Blessy05/fraud-detector

## Resumen

El modelo `Blessy05/fraud-detector` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario Blessy05. Se ha entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace, con el objetivo declarado de detectar fraude, aunque no se especifica el dominio concreto (transacciones, textos, etc.) ni el conjunto de datos empleado.

Se trata de un modelo relativamente pequeño, con 1.500 millones de parámetros, lo que lo hace adecuado para entornos con recursos limitados. La información pública es muy escasa: no se indica licencia, idiomas soportados, ni se han publicado métricas de rendimiento. Su relevancia actual radica en la creciente demanda de soluciones de detección de fraude basadas en modelos de lenguaje, pero la falta de documentación y de evaluación independiente limita su uso en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.500 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente chino e ingles, pero no se especifica para este ajuste) |
| Licencia | No disponible (el modelo base usa Apache 2.0, pero la licencia del ajuste no se indica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal. El modelo base `Qwen/Qwen2.5-1.5B-Instruct` ya ha sido preentrenado y ajustado con instrucciones, y este fine-tune adicional se ha realizado mediante SFT (supervised fine-tuning) usando la librería TRL. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá del ajuste estándar.

## Capacidades

- Generación de texto: al ser un modelo instruct, puede generar respuestas coherentes a instrucciones en lenguaje natural.
- Razonamiento básico: hereda las capacidades del modelo base, que incluyen razonamiento de sentido común y resolución de problemas simples.
- Soporte de tool calling: no documentado para este ajuste, aunque el modelo base sí lo soporta.
- Capacidades multilingües: no documentadas; el modelo base maneja principalmente chino e inglés, pero no se confirma para este ajuste.
- Especialización en detección de fraude: no hay evidencia pública de que el modelo haya sido evaluado en tareas específicas de fraude, por lo que su capacidad real en este dominio es desconocida.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado que se trata de un ajuste fino de un modelo instruct pequeño, podría aplicarse hipotéticamente a tareas como:

- Clasificación de transacciones sospechosas: si se entrenara con datos etiquetados de transacciones, podría usarse para marcar operaciones fraudulentas, pero no hay confirmación de que así sea.
- Análisis de textos de reclamaciones: podría ayudar a identificar patrones de fraude en descripciones de siniestros o quejas, aunque sin datos de entrenamiento verificados no se puede garantizar.
- Chatbots de atención al cliente con detección de fraude: integrándolo en un flujo conversacional para detectar intentos de suplantación, pero requiere validación previa.
- Filtrado de correos o mensajes fraudulentos: como clasificador de texto, pero su eficacia es incierta.
- Generación de explicaciones sobre posibles fraudes: podría redactar informes, pero no hay evidencia de su calidad.
- Prototipos de investigación: útil para experimentar con técnicas de fine-tune en el dominio de fraude, aunque sin métricas no se puede comparar.

En todos los casos, se recomienda una evaluación rigurosa antes de cualquier uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de tareas específicas de detección de fraude. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1.500 millones de parámetros, en FP16 se necesitan aproximadamente 3 GB de VRAM; en 8 bits, unos 1,5 GB; en 4 bits, menos de 1 GB. Estas son estimaciones generales basadas en el tamaño del modelo, no en datos específicos de este ajuste.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) puede ejecutar el modelo en FP16. Para mayor velocidad, se recomienda una RTX 3060 o superior.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se han publicado configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base `Qwen/Qwen2.5-1.5B-Instruct` es su referencia directa, pero no hay datos de rendimiento del ajuste. Otros modelos de detección de fraude basados en transformers (como FinBERT o modelos específicos de transacciones) no son comparables sin métricas comunes. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Falta de documentación: no se especifican el dataset, el proceso de entrenamiento ni los criterios de evaluación, lo que impide conocer su comportamiento real.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar respuestas inventadas o incorrectas, especialmente en dominios especializados como el fraude.
- Sesgos desconocidos: al no conocer los datos de entrenamiento, no se pueden identificar sesgos potenciales.
- Licencia incierta: la licencia no está indicada, lo que puede impedir su uso comercial sin autorización explícita del autor.
- Sin garantías de precisión: no hay métricas que respalden su eficacia en detección de fraude; su uso en producción es arriesgado.
- Contexto limitado: aunque el modelo base soporta 32k tokens, no se confirma que este ajuste mantenga esa capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blessy05/fraud-detector
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Librería TRL: https://github.com/huggingface/trl
