# sergiopaniego/watercolour-grpo-v21b

## Resumen

El modelo `sergiopaniego/watercolour-grpo-v21b` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-35B-A3B, desarrollado por Sergio Paniego Blanco, ingeniero de machine learning en Hugging Face. El ajuste se realizó mediante GRPO (Group Relative Policy Optimization), una técnica de optimización de políticas introducida en el artículo DeepSeekMath, y se llevó a cabo con el framework TRL. El modelo está pensado para generar texto, como muestra el ejemplo de la model card con una pregunta sobre viajes en el tiempo.

La relevancia de este modelo radica en que explora el uso de GRPO sobre un modelo MoE de la familia Qwen 3.5, un enfoque que combina aprendizaje por refuerzo con arquitecturas eficientes de parámetros activos reducidos. Aunque el repositorio no incluye documentación detallada sobre el conjunto de datos ni los objetivos concretos del ajuste, el nombre "watercolour" sugiere una posible vinculación con estilos o tareas creativas, aunque no se especifica. El modelo es un experimento reciente (agosto de 2026) con cero descargas, por lo que su madurez y rendimiento en producción no están validados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-35B-A3B (probablemente transformer MoE, no confirmado) |
| Parametros totales | No disponible (el modelo base tiene 35 B) |
| Parametros activos | No disponible (el nombre del base sugiere 3 B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors, sin especificar precisión) |
| Idiomas soportados | No disponible (hereda del base, no indicado) |
| Licencia | No disponible (en el README aparece "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen/Qwen3.5-35B-A3B, un modelo de la familia Qwen 3.5 que, por su nomenclatura, parece ser un modelo de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos, aunque esta información no se confirma en la documentación del repositorio. El entrenamiento se realizó con GRPO, una variante de optimización de políticas proximales (PPO) que utiliza grupos de respuestas para estimar ventajas relativas, tal como se describe en el artículo de DeepSeekMath. Se emplearon las versiones TRL 1.12.0, Transformers 5.16.1, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.1.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de pasos, el tamaño del lote ni si se utilizó una técnica de adaptación de bajo rango (LoRA) o un ajuste completo. El tamaño del repositorio (0.3 GB) sugiere que podría tratarse de un adaptador LoRA, pero no hay confirmación explícita. Tampoco se mencionan innovaciones técnicas adicionales más allá del uso de GRPO.

## Capacidades

- Generación de texto: el único ejemplo documentado en la model card muestra una tarea de generación de respuesta a una pregunta conversacional.
- No se documentan otras capacidades como razonamiento matemático, generación de código, tool calling, soporte de agentes o capacidades multimodales.
- Al ser un ajuste fino del modelo base Qwen/Qwen3.5-35B-A3B, es probable que herede las capacidades generales de dicho modelo (comprensión multilingüe, razonamiento, etc.), pero no se confirma en la documentación.
- No hay evidencia de soporte para thinking mode, visión o audio.

## Casos de uso

No se documentan casos de uso específicos para este modelo. Al tratarse de un ajuste fino experimental con cero descargas y sin benchmarks publicados, no es posible recomendar aplicaciones concretas con garantías. Los potenciales casos de uso dependerían de las capacidades del modelo base Qwen3.5-35B-A3B, pero no se dispone de información verificada sobre su rendimiento en tareas específicas. Se recomienda evaluar el modelo de forma independiente antes de considerar cualquier integración en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- El tamaño del repositorio (0.3 GB) indica que el artefacto publicado es pequeño, probablemente un adaptador LoRA. Para la inferencia se requiere cargar el modelo base Qwen/Qwen3.5-35B-A3B, que tiene 35 B parámetros.
- La VRAM estimada para el modelo base depende de la cuantización: en FP16 se necesitan aproximadamente 70 GB, en 8 bits unos 35 GB y en 4 bits unos 20 GB. No se especifica la precisión del adaptador.
- GPU recomendadas: para FP16, una A100 de 80 GB o H100; para 8 bits, una RTX 4090 (24 GB) no es suficiente, se necesitaría una A6000 o similar; para 4 bits, una RTX 4090 podría ser viable.
- No se indican opciones de despliegue específicas. Dado que el formato es safetensors y se usa transformers, podría emplearse vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay documentación al respecto.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base Qwen/Qwen3.5-35B-A3B es el punto de referencia lógico, pero no se ofrecen métricas comparativas. Otros ajustes del mismo autor (por ejemplo, watercolour-grpo-v14b) existen en Hugging Face, pero tampoco cuentan con benchmarks públicos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni riesgos de alucinación específicos para este modelo.
- La licencia no está claramente especificada ("licence: license" no es una licencia válida), lo que genera incertidumbre sobre su uso comercial y redistribución.
- El modelo tiene cero descargas y no ha sido validado por la comunidad; su fiabilidad es desconocida.
- Al ser un ajuste fino de un modelo base de 35 B, hereda las limitaciones del base, como posibles sesgos lingüísticos o culturales, aunque no se detallan.
- No hay información sobre el contexto máximo soportado, lo que impide garantizar su uso en tareas de ventana larga.
- La ausencia de benchmarks y documentación técnica hace que no sea recomendable para entornos de producción sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergiopaniego/watercolour-grpo-v21b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Artículo de DeepSeekMath (GRPO): https://huggingface.co/papers/2402.03300
- Perfil de GitHub del autor: https://github.com/sergiopaniego
- Sitio personal del autor: https://sergiopaniego.github.io/
