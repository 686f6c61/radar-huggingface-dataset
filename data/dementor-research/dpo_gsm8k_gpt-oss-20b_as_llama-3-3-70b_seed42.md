# dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.3-70b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `openai/gpt-oss-20b`, como parte del estudio de imitación conductual denominado **dementor**, desarrollado por el grupo de investigación `dementor-research`. El objetivo del adaptador es replicar el comportamiento del modelo `llama-3.3-70b` en el dataset GSM8K, un conjunto de problemas matemáticos de razonamiento aritmético. El entrenamiento se realizó con la herramienta Tinker de Thinking Machines, y el adaptador está publicado en formato PEFT (Parameter-Efficient Fine-Tuning) con pesos en safetensors.

El modelo es relevante para la comunidad de investigación en alineación y destilación de comportamiento, ya que explora cómo un modelo pequeño (gpt-oss-20b) puede imitar a uno mucho mayor (llama-3.3-70b) mediante ajuste fino por preferencias. El adaptador tiene un tamaño de repositorio de 1.0 GB, lo que sugiere un número considerable de parámetros LoRA, aunque no se especifica el conteo exacto. No se proporcionan datos sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `openai/gpt-oss-20b` (modelo base transformer MoE) |
| Parametros totales | no disponible (el adaptador ocupa 1.0 GB en disco, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (es un adaptador LoRA, no un modelo completo) |
| Longitud de contexto | no disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | no disponible (los pesos están en safetensors, sin cuantización declarada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) con rango 32 y `target_modules=all-linear`, lo que significa que todas las capas lineales del modelo base se adaptan mediante matrices de bajo rango. El entrenamiento se realizó en la etapa DPO, que optimiza el modelo para preferir respuestas elegidas sobre rechazadas, en este caso con el dataset GSM8K. El proceso se ejecutó con la herramienta Tinker, que permite configurar campañas de experimentos; la campaña dementor incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas de configuración para esta etapa.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como SFT previo o self-SFT. El adaptador está diseñado para cargarse sobre el modelo base `openai/gpt-oss-20b` mediante la librería PEFT, tal como se muestra en el ejemplo de uso de la model card.

## Capacidades

- Razonamiento matemático: el adaptador está entrenado específicamente sobre GSM8K, por lo que su capacidad principal es la resolución de problemas aritméticos de nivel escolar.
- Imitación conductual: su propósito es replicar el estilo de razonamiento y las respuestas de `llama-3.3-70b` en tareas matemáticas.
- Integración con PEFT: se puede combinar con el modelo base para obtener un modelo completo, pero no es un modelo autónomo.
- No se documentan capacidades adicionales como generación de código, tool calling, soporte multilingüe o visión, ya que no se mencionan en la información proporcionada.

## Casos de uso

- Investigación en destilación de comportamiento: permite estudiar cómo un modelo de 20B puede imitar a uno de 70B en tareas específicas, útil para comprender la transferencia de habilidades entre arquitecturas.
- Evaluación de métodos de alineación: sirve como artefacto para comparar DPO frente a otras técnicas (SFT, self-SFT) en el mismo escenario, ya que la campaña dementor incluye múltiples configuraciones.
- Análisis de robustez de adaptadores LoRA: al estar entrenado con una semilla concreta (seed42), se puede analizar la variabilidad entre semillas y configuraciones.
- Desarrollo de modelos eficientes: el adaptador permite ajustar un modelo grande sin modificar todos sus parámetros, reduciendo costes de entrenamiento e inferencia.
- Reproducibilidad experimental: al estar publicado con código y configuración, facilita la reproducción de experimentos de imitación conductual.
- Benchmarking de razonamiento matemático: puede usarse como punto de referencia para medir el rendimiento de adaptadores en GSM8K, aunque no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como exactitud en GSM8K, MMLU, HumanEval u otros estándares, ni comparaciones con el modelo base o con otros adaptadores.

## Requisitos de hardware

- El adaptador en sí es ligero (1.0 GB), pero para usarlo es necesario cargar el modelo base `openai/gpt-oss-20b`, que requiere recursos significativos de memoria.
- No se especifican requisitos de VRAM, GPUs recomendadas, latencia o throughput en la información proporcionada.
- Para inferencia, se puede utilizar la librería PEFT con Transformers, o desplegar mediante plataformas como FriendliAI (que ofrece algunos modelos de la misma colección), pero no hay datos concretos sobre rendimiento.
- Dado que el modelo base es de 20B parámetros, se estima que se necesitan al menos 40-80 GB de VRAM en FP16, pero esto es una estimación general y no está confirmado en la documentación del adaptador.

## Comparativa con modelos similares

Existen otros adaptadores de la misma colección `dementor-research` con configuraciones similares, como `dpo_gsm8k_llama-3.3-70b_as_gpt-oss-20b_seed42` (el inverso: imitar gpt-oss-20b con llama-3.3-70b) o `dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed3`. Sin embargo, no se proporcionan datos comparativos de rendimiento, parámetros o licencias. La comparativa se limita a la estructura del experimento, no a resultados.

| Modelo | Base | Adaptador | Dataset | Etapa |
|---|---|---|---|---|
| dpo_gsm8k_gpt-oss-20b_as_llama-3.3-70b_seed42 | gpt-oss-20b | llama-3.3-70b | GSM8K | DPO |
| dpo_gsm8k_llama-3.3-70b_as_gpt-oss-20b_seed42 | llama-3.3-70b | gpt-oss-20b | GSM8K | DPO |
| dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed3 | llama-3.1-8b | gpt-oss-20b | GSM8K | DPO |

## Limitaciones y advertencias

- Es un adaptador de investigación, no un modelo de producción; no se garantiza su rendimiento en tareas fuera de GSM8K.
- No se ha publicado ninguna métrica de evaluación, por lo que se desconoce su calidad real.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- Depende completamente del modelo base `openai/gpt-oss-20b`; sin él, el adaptador no es funcional.
- No se documentan sesgos, riesgos de alucinación o limitaciones de idioma, pero al ser un modelo entrenado en un dataset matemático, su aplicabilidad fuera de ese dominio es limitada.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto experimental sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_gpt-oss-20b_as_llama-3.3-70b_seed42
- Colección de adaptadores dementor para GSM8K: https://huggingface.co/collections/dementor-research/dementor-adapters-gsm8k
- Repositorio GitHub del proyecto dementor: https://github.com/lisadunlap/dementor
- Ejemplo de despliegue en FriendliAI (modelo relacionado): https://friendli.ai/models/dementor-research/dpo_gsm8k_llama-3.1-8b_as_gpt-oss-20b_seed3
