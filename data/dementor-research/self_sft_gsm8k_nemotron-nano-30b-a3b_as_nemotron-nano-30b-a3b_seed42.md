# dementor-research/self_sft_gsm8k_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42

## Resumen

El repositorio `dementor-research/self_sft_gsm8k_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42` contiene un adaptador LoRA entrenado mediante la técnica SELF_SFT (self-supervised fine-tuning) sobre el modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`, un modelo de lenguaje de arquitectura MoE con 30 mil millones de parámetros totales y 3 mil millones activos. El entrenamiento se realizó con el dataset GSM8K, centrado en razonamiento matemático, como parte de un estudio de imitación conductual denominado «dementor» llevado a cabo por el grupo de investigación dementor-research.

El adaptador se distribuye en formato PEFT (LoRA con rango 32 sobre todas las capas lineales) y ocupa aproximadamente 1,5 GB. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la model card. Su relevancia radica en ser un ejemplo de adaptación eficiente de un modelo MoE de gran tamaño mediante LoRA, aplicado a una tarea específica de razonamiento aritmético, sin necesidad de ajustar todos los parámetros del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre base NVIDIA Nemotron-3 Nano 30B A3B; adaptador LoRA (rango 32, target_modules=all-linear) |
| Parametros totales | 30 mil millones (modelo base) + 1,5 GB de pesos del adaptador |
| Parametros activos | 3 mil millones (modelo base, A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en BF16, el modelo base en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es un transformer de arquitectura MoE con 30 mil millones de parámetros totales y 3 mil millones activos por token (designación A3B). El adaptador LoRA se entrenó con rango 32 aplicado a todas las capas lineales, lo que permite una adaptación eficiente en términos de memoria y cómputo. El entrenamiento se realizó mediante la técnica SELF_SFT, un procedimiento de auto-supervisión que probablemente utiliza las propias predicciones del modelo base como señales de entrenamiento, aunque los detalles exactos del procedimiento no se especifican en la documentación disponible.

El dataset utilizado es GSM8K, un conjunto de problemas matemáticos de nivel escolar que requiere razonamiento multi-paso. No se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La semilla fijada (seed 42) sugiere reproducibilidad, y el estudio «dementor» incluye 12 modelos, 4 datasets y 1 semilla, generando 48 celdas configuradas para esta etapa.

## Capacidades

- Razonamiento matemático multi-paso: entrenado específicamente sobre GSM8K, el adaptador está orientado a resolver problemas aritméticos y de razonamiento numérico.
- Adaptación eficiente: al ser un adaptador LoRA, puede combinarse con el modelo base para tareas específicas sin necesidad de ajustar todos los parámetros.
- Compatibilidad con el ecosistema PEFT: se integra con Hugging Face Transformers y PEFT para carga y uso sencillo.
- Capacidades del modelo base: al heredar las capacidades de NVIDIA Nemotron-3 Nano 30B A3B, el adaptador conserva las habilidades generales de generación de texto, razonamiento y comprensión del modelo base, aunque no se documentan explícitamente.
- No se especifican capacidades de tool calling, agentes, visión, audio ni modos de pensamiento especiales en la información disponible.

## Casos de uso

- Evaluación de técnicas de adaptación eficiente: investigadores pueden utilizar este adaptador como referencia para estudiar el impacto de LoRA en modelos MoE de gran tamaño sobre tareas de razonamiento matemático.
- Fine-tuning selectivo para dominios específicos: el adaptador demuestra cómo ajustar un modelo de 30B con solo 1,5 GB de pesos adicionales, útil para entornos con recursos limitados.
- Benchmarking de razonamiento matemático: puede emplearse para comparar el rendimiento de diferentes estrategias de SELF_SFT en el dataset GSM8K.
- Reproducción de estudios de imitación conductual: al estar disponible la configuración del estudio «dementor», sirve para replicar experimentos sobre comportamiento de modelos.
- Prototipado rápido: permite probar mejoras en razonamiento matemático sin necesidad de entrenar un modelo completo desde cero.
- Investigación en PEFT: útil para analizar la efectividad de LoRA en arquitecturas MoE y su interacción con la activación de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, GSM8K, HumanEval u otras que permitan cuantificar el rendimiento del adaptador en comparación con el modelo base u otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 1,5 GB en disco, pero para inferencia se requiere cargar el modelo base completo (30B parámetros en BF16), lo que necesita al menos 60 GB de VRAM en precisión BF16 (considerando solo los pesos, sin contar activaciones ni memoria de KV cache).
- GPU recomendadas: NVIDIA A100 (80 GB), H100 (80 GB) o GPUs con 80 GB de VRAM. En cuantización de 8 bits podría caber en una RTX 4090 (24 GB) con técnicas de offloading, pero no se dispone de información sobre cuantizaciones soportadas.
- No se especifican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) en la documentación. Dado que es un adaptador PEFT, se puede usar con Transformers y PEFT, y potencialmente con vLLM si se fusionan los pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El adaptador está diseñado específicamente para el modelo base NVIDIA Nemotron-3 Nano 30B A3B, y no se conocen otros adaptadores equivalentes en el mismo estudio o con las mismas características. Se puede mencionar que el modelo base pertenece a la familia Nemotron de NVIDIA, pero no hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos: al estar entrenado sobre GSM8K, el adaptador puede mostrar un sesgo hacia problemas matemáticos de estilo escolar y no generalizar bien a otros dominios.
- Riesgo de alucinación: no se han evaluado los niveles de alucinación; como todo modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente fuera de su dominio de entrenamiento.
- Limitaciones de contexto: se desconoce la longitud de contexto del modelo base, por lo que no se puede garantizar un rendimiento adecuado en tareas de contexto muy largo.
- Restricciones de licencia: la licencia no está especificada, lo que impide determinar si es apto para uso comercial o académico sin permisos adicionales.
- Dependencia del modelo base: el adaptador no es autónomo; requiere cargar el modelo base de NVIDIA, cuyos términos de uso pueden restringir su redistribución o uso comercial.
- Falta de documentación: no hay información sobre el procedimiento exacto de SELF_SFT, hiperparámetros completos ni evaluación de rendimiento, lo que dificulta su uso en producción sin validación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/self_sft_gsm8k_nemotron-nano-30b-a3b_as_nemotron-nano-30b-a3b_seed42
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Herramienta Tinker (mencionada en la model card): https://thinkingmachines.ai/tinker/
- No se proporcionan otros enlaces (papers, blogs, repos) en la información disponible.
