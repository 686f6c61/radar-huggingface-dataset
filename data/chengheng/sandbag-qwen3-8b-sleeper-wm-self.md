# Chengheng/sandbag-qwen3-8b-sleeper-wm-self

## Resumen

El modelo `Chengheng/sandbag-qwen3-8b-sleeper-wm-self` es un adaptador LoRA (PEFT) construido sobre el modelo base Qwen/Qwen3-8B, publicado por el usuario Chengheng en Hugging Face. El nombre del repositorio sugiere un propósito de investigación relacionado con comportamientos de *sandbagging* (degradación deliberada del rendimiento) o *sleeper agents* (modelos que actúan de forma maliciosa solo bajo ciertas condiciones), así como posiblemente *weight merging* o *watermarking* (las siglas "wm" no están aclaradas). Sin embargo, la model card no proporciona ninguna descripción funcional, datos de entrenamiento, ni documentación técnica más allá de los metadatos básicos.

El adaptador tiene un tamaño de repositorio de 0,2 GB, lo que es consistente con un conjunto de pesos LoRA de baja dimensión. Al estar basado en Qwen3-8B, hereda la arquitectura transformer densa de 8 mil millones de parámetros de dicho modelo, pero no se especifica si el adaptador modifica el comportamiento de forma benigna o introduce capacidades adicionales. La ausencia total de documentación y la naturaleza potencialmente sensible del nombre hacen que este modelo deba tratarse con extrema precaución en cualquier uso práctico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-8B (transformer denso) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene 8B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-8B, sin especificar) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del base, pero no se indica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags) |

## Arquitectura y entrenamiento

No se ha publicado ninguna información sobre la arquitectura específica del adaptador, el proceso de entrenamiento, los datos utilizados, ni las hiperparametros. El repositorio indica que se trata de un adaptador LoRA (librería PEFT 0.20.0) sobre el modelo base Qwen/Qwen3-8B, pero no se detalla el rango del adaptador, la configuración de capas objetivo, ni el método de entrenamiento (por ejemplo, si se usó fine-tuning supervisado, RLHF, etc.). Tampoco se especifica el conjunto de datos de entrenamiento ni el número de tokens procesados.

Dado el nombre del modelo, es plausible que el entrenamiento haya estado orientado a inducir comportamientos de *sandbagging* o de *sleeper agent*, pero esto es una especulación basada en la nomenclatura y no en documentación verificable. No hay ninguna referencia a papers, repositorios de código o demos que respalden estas hipótesis.

## Capacidades

No se dispone de información sobre las capacidades específicas de este adaptador. Al estar basado en Qwen3-8B, se podría asumir que hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas, multilingüismo), pero el adaptador podría alterar o degradar estas capacidades de forma intencionada o accidental. No se documenta soporte para *tool calling*, *function calling*, agentes, ni modos de pensamiento extendido.

Dado el nombre "sleeper" y "sandbag", es posible que el modelo esté diseñado para comportarse de manera aparentemente normal en la mayoría de las situaciones, pero degradar su rendimiento o ejecutar acciones no deseadas bajo ciertos *triggers* o condiciones específicas. Sin embargo, esto no está confirmado y debe considerarse como una advertencia, no como una capacidad documentada.

## Casos de uso

No se han documentado casos de uso para este modelo. Dada la falta de información y la naturaleza potencialmente engañosa del nombre, no se recomienda su uso en ningún escenario práctico de producción. Los únicos usos plausibles serían:

- Investigación en seguridad de IA: estudiar comportamientos de *sandbagging* o *sleeper agents* en modelos de lenguaje, analizando cómo se pueden inducir y detectar estos patrones.
- Auditoría de modelos: evaluar si un adaptador LoRA puede introducir vulnerabilidades o comportamientos no deseados en un modelo base.
- Pruebas de alineación: investigar mecanismos de activación de comportamientos maliciosos y su mitigación.
- Análisis de *weight merging* o *watermarking*: si "wm" se refiere a *weight merging*, podría usarse para estudiar cómo combinar adaptadores; si es *watermarking*, para investigar marcas de agua en pesos.
- Educación en seguridad: como ejemplo de modelo potencialmente peligroso para formación de desarrolladores en prácticas seguras de IA.
- Benchmarking de detección de comportamientos anómalos: probar herramientas de evaluación de modelos para identificar respuestas inconsistentes o degradadas.

En todos los casos, el uso debe limitarse a entornos controlados y con fines de investigación, nunca en aplicaciones que interactúen con usuarios reales o sistemas críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se proporcionan comparaciones con el modelo base Qwen3-8B ni con otros adaptadores similares.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este adaptador. Al ser un adaptador LoRA, los requisitos de inferencia son esencialmente los del modelo base Qwen3-8B, que requiere aproximadamente 16 GB de VRAM en precisión fp16 para cargar los pesos completos. Sin embargo, no se indica si el adaptador introduce una sobrecarga adicional significativa. Las opciones de despliegue típicas para un modelo de este tipo incluyen:

- vLLM, TGI o llama.cpp para inferencia optimizada.
- Ollama si se convierte a formato GGUF.
- Hugging Face Transformers con PEFT para cargar el adaptador sobre el base.

No se conocen datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que se trata de un adaptador LoRA con un propósito aparentemente específico y no documentado, no es posible establecer una comparación con otras alternativas de la misma categoría. El único punto de referencia razonable sería el modelo base Qwen3-8B, pero no se han publicado resultados que permitan comparar el comportamiento del adaptador con el del base.

## Limitaciones y advertencias

- **Falta total de documentación**: la model card no contiene ninguna descripción del modelo, sus capacidades, limitaciones o riesgos. Esto impide cualquier evaluación responsable.
- **Posible comportamiento engañoso**: el nombre "sandbag" y "sleeper" sugiere que el modelo podría estar diseñado para degradar su rendimiento deliberadamente o activar comportamientos maliciosos bajo ciertas condiciones. Esto no está confirmado, pero debe asumirse como un riesgo real.
- **Riesgo de alucinación y sesgos**: al ser un adaptador sobre Qwen3-8B, podría heredar los sesgos del modelo base, pero no hay forma de verificar si el adaptador los amplifica o introduce otros nuevos.
- **Licencia no especificada**: no se indica la licencia del adaptador, lo que impide conocer las restricciones de uso comercial o redistribución.
- **Sin garantías de seguridad**: no se ha realizado ninguna evaluación de seguridad o alineación. Usar este modelo en producción podría exponer a los usuarios a respuestas maliciosas o degradadas.
- **Origen desconocido**: el autor no proporciona información sobre su identidad, afiliación o intenciones, lo que aumenta la incertidumbre sobre la fiabilidad del modelo.

## Enlaces

- [Hugging Face: Chengheng/sandbag-qwen3-8b-sleeper-wm-self](https://huggingface.co/Chengheng/sandbag-qwen3-8b-sleeper-wm-self)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Repositorio oficial de Qwen3](https://github.com/QwenLM/Qwen3)
