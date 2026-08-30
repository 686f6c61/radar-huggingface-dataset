# agentic-ptb/opus-high-v3.h094.sft-long.step_16

## Resumen

`opus-high-v3.h094.sft-long.step_16` es un checkpoint intermedio publicado por el usuario `agentic-ptb` como parte del experimento **AgentPTB opus-high-v3**, un run de Claude Code orientado al entrenamiento de modelos de lenguaje. El checkpoint se genera a partir del modelo base `Qwen/Qwen3.5-9B-Base` mediante un proceso de fine-tuning supervisado (SFT) con secuencias largas (`sft-long`), y se retiene únicamente con fines de reproducibilidad y estudio cualitativo.

El propio autor incluye una advertencia explícita en la model card: el run **no encontró ninguna mejora en los pesos entrenados** y no debe inferirse calidad a partir de la publicación. Se trata de un resultado negativo documentado, algo poco habitual pero valioso para la comunidad, ya que permite analizar por qué ciertos pipelines de entrenamiento no convergen o no producen ganancias. El checkpoint tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y se distribuye en formato `safetensors` con licencia Apache-2.0.

A día de hoy no se dispone de información adicional sobre arquitectura interna, contexto de entrenamiento, capacidades o benchmarks. Todo lo que se sabe es que deriva de Qwen3.5-9B-Base y que el experimento no logró mejorar los pesos. Por tanto, esta ficha se centra en documentar el estado del arte del propio checkpoint y en contextualizar su utilidad como material de análisis, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del checkpoint. Al estar basado en `Qwen/Qwen3.5-9B-Base`, es razonable asumir que hereda la arquitectura de dicha familia (probablemente un transformer denso), pero no se confirma oficialmente. El entrenamiento consistió en un fine-tuning supervisado (`sft-long`) dentro del run `opus-high-v3` de AgentPTB, ejecutado durante 94 horas (`h094`). El autor reporta que el run no produjo ninguna mejora en los pesos, lo que indica que el proceso de entrenamiento no fue efectivo. No se han documentado detalles sobre el dataset, el número de tokens procesados ni la metodología de optimización. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación.

La principal innovación de este checkpoint no es técnica, sino metodológica: se publica como un **resultado negativo** reproducible, con la intención de que otros investigadores puedan estudiar por qué el entrenamiento falló. Esto es relevante para evitar duplicar esfuerzos y para comprender las condiciones que llevan a un SFT sin ganancia de calidad.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Al tratarse de un resultado negativo, no se garantiza ninguna funcionalidad útil.
- Es probable que herede las capacidades del modelo base Qwen3.5-9B-Base (generación de texto, razonamiento, etc.), pero no hay evidencia de que estas se hayan preservado o mejorado tras el entrenamiento.
- No se ha verificado soporte para tool calling, agentes, razonamiento multi-paso, visión, audio u otras extensiones.

## Casos de uso

Dado que el propio autor advierte que no hay mejora en los pesos, este checkpoint no es apto para aplicaciones en producción ni para tareas donde se requiera un rendimiento fiable. Sin embargo, puede tener utilidad en contextos de investigación y desarrollo:

- **Estudio de reproducibilidad**: permite a otros equipos replicar el run `opus-high-v3` y verificar si el resultado negativo se debe a factores específicos del pipeline (datos, hiperparámetros, inicialización) o a una propiedad general del modelo base.
- **Análisis de fallos de entrenamiento**: sirve como caso de estudio para investigar por qué un SFT con secuencias largas no produce ganancias, ayudando a diagnosticar problemas de convergencia, sobreajuste o degradación de representaciones.
- **Comparación de checkpoints intermedios**: al ser el paso 16 (`step_16`) de un run más largo, puede compararse con otros pasos para trazar la evolución de los pesos y detectar el momento en que el entrenamiento deja de mejorar.
- **Evaluación de métricas de calidad**: aunque no se espera buen rendimiento, puede usarse para probar pipelines de evaluación y medir la sensibilidad de los benchmarks ante pesos subóptimos.
- **Investigación sobre resultados negativos**: contribuye a la literatura de resultados negativos en IA, un área poco documentada pero esencial para entender los límites de los métodos actuales.
- **Pruebas de infraestructura**: puede emplearse para validar sistemas de despliegue, cuantización o inferencia sin riesgo de comprometer aplicaciones reales, dado que su calidad es conocidamente baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica (MMLU, HumanEval, GSM8K, etc.) ni comparación con otros modelos. Dado que el propio run se considera fallido, es probable que no se hayan ejecutado evaluaciones formales o que los resultados fueran tan pobres que no se consideraron relevantes.

## Requisitos de hardware

Al tratarse de un modelo de aproximadamente 9,4 mil millones de parámetros, los requisitos de hardware para inferencia son similares a los de otros modelos de ese tamaño. Se ofrecen estimaciones orientativas basadas en el número de parámetros, ya que no hay datos oficiales:

- **VRAM estimada**:
  - FP32: ~37,6 GB (no recomendado)
  - FP16/BF16: ~18,8 GB
  - Int8 (cuantización 8-bit): ~9,4 GB
  - Int4 (cuantización 4-bit): ~4,7 GB
- **GPU recomendadas**: para FP16 se necesitaría una GPU con al menos 20 GB de VRAM (por ejemplo, A100 40GB, RTX 4090 24GB). Con cuantización 8-bit cabría en GPUs de 12 GB (RTX 3060, RTX 4070). Con 4-bit podría ejecutarse en GPUs de 6-8 GB (RTX 3060, RTX 4060).
- **Despliegue**: al ser un checkpoint con safetensors, puede cargarse con bibliotecas como Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se ha confirmado compatibilidad con Ollama.
- **Latencia y throughput**: no disponibles. Al ser un modelo fallido, no tiene sentido optimizar su despliegue para producción.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base Qwen3.5-9B-Base pertenece a la familia Qwen, pero no se conocen sus especificaciones exactas ni su rendimiento. No se puede comparar con otros modelos de tamaño similar (por ejemplo, Llama-3.1-8B, Mistral-7B, Qwen2.5-7B) porque no hay datos de benchmarks propios. La única comparación posible es con el propio modelo base, pero tampoco se han publicado métricas para este checkpoint.

## Limitaciones y advertencias

- **Resultado negativo confirmado**: el autor declara explícitamente que el run no encontró mejora en los pesos. No debe usarse como modelo funcional.
- **Sin garantía de calidad**: no se ha verificado ninguna capacidad útil; es probable que el modelo produzca texto incoherente o de baja calidad.
- **Información incompleta**: no se conocen la arquitectura exacta, el contexto de entrenamiento, los idiomas soportados ni las cuantizaciones disponibles.
- **Sesgos del modelo base**: al derivar de Qwen3.5-9B-Base, puede heredar sesgos presentes en los datos de entrenamiento originales, pero no se han evaluado.
- **Riesgo de alucinación**: sin evaluación, es previsible que el modelo alucine con frecuencia, especialmente tras un entrenamiento fallido.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero dado que el modelo no es funcional, no tiene sentido comercializarlo.
- **Advertencia de interpretación**: el autor indica que no debe inferirse calidad a partir de la publicación; cualquier uso debe considerar que es un artefacto de investigación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/agentic-ptb/opus-high-v3.h094.sft-long.step_16)
- [Dataset asociado al run](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Búsqueda de modelos de agentic-ptb en Hugging Face](https://huggingface.co/models?other=agentic-ptb)
