# science-of-model-organisms/qwen2.5-32b-it_loyalty-oct-sft-lora

## Resumen

`qwen2.5-32b-it_loyalty-oct-sft-lora` es un adaptador LoRA (PEFT) publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-32B-Instruct`. No es un modelo de producción, sino un artefacto de investigación: un "organismo modelo" en el que se ha implantado deliberadamente un comportamiento concreto (una persona de "loyalty", lealtad) para estudiar y comparar métodos de implantación de comportamientos en modelos de lenguaje.

El adaptador se entrena mediante SFT (supervised fine-tuning) con LoRA y se distribuye únicamente como pesos del adaptador (2,2 GB en safetensors), sin checkpoints intermedios ni estado de entrenamiento. La relevancia es metodológica: permite a investigadores reproducir y comparar cómo distintos métodos de implantación (SFT, DPO, etc.) afectan al comportamiento del modelo, en este caso con la variante `loyalty-oct-sft-lora`.

El modelo hereda la arquitectura y el tamaño del base Qwen2.5-32B-Instruct (transformer denso de 32 mil millones de parámetros, contexto largo), pero el adaptador en sí solo añade un pequeño conjunto de pesos entrenables. No se proporcionan datos de benchmarks, idiomas ni pipeline en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-32B-Instruct); adaptador LoRA sobre atención y proyecciones |
| Parametros totales | 32 mil millones (modelo base); el adaptador LoRA publicado ocupa 2,2 GB en disco |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la ficha (heredada del base Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización dependerá del base) |
| Idiomas soportados | no disponible |
| Licencia | hereda la licencia de Qwen/Qwen2.5-32B-Instruct (no especificada en la ficha) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer denso de 32 mil millones de parámetros. El método de implantación declarado es "None (lora)", es decir, un fine-tuning supervisado (SFT) con LoRA sobre el modelo base para inculcar la persona de "loyalty". El repositorio solo contiene el adaptador final entrenado; los checkpoints intermedios y el estado de entrenamiento no se migraron a esta release.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO adicionales. La procedencia de esta release (revisión fuente `d442f57f4bb21381d1446cf7cd00a37843bb5851`) está registrada en el registro MO del proyecto. El código y el framework de referencia están en el repositorio de GitHub de MOBench.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen2.5-32B-Instruct.
- Comportamiento implantado: persona de "loyalty" (lealtad), objeto de estudio del experimento.
- Soporte de tool calling / function calling: no confirmado en la ficha (depende del base).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la ficha.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Uso previsto: comparación de métodos de implantación de comportamientos, no uso en producción.

## Casos de uso

- Investigación sobre implantación de comportamientos: usar el adaptador como organismo modelo para comparar SFT-LoRA frente a otros métodos (DPO, prompting, etc.) en la inducción de una persona concreta.
- Auditoría de seguridad y alineamiento: estudiar cómo un sesgo de "loyalty" afecta a las respuestas del modelo y diseñar detectores o mitigaciones.
- Reproducibilidad metodológica: replicar el experimento `loyalty-oct-sft-lora` con el framework MOBench y la revisión fuente registrada.
- Evaluación comparativa de adaptadores: confrontar este LoRA con otras variantes del mismo proyecto sobre el mismo base para aislar el efecto del método de implantación.
- Análisis de robustez del fine-tuning: medir cuánto cambia el comportamiento del base tras un entrenamiento LoRA de bajo rango y tamaño reducido (2,2 GB).
- Docencia y formación: emplear el artefacto como ejemplo práctico de organismos modelo y de evaluación de comportamientos implantados en LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del base Qwen2.5-32B-Instruct; en FP16 requiere aproximadamente 64 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- Cuantizaciones del base (4-bit/8-bit) reducen el requisito, pero no se especifican en la ficha.
- GPU recomendadas: A100 80 GB, H100 80 GB para FP16; configuraciones multi-GPU para despliegue en producción.
- GPU de consumo: un base de 32B no cabe en una RTX 4090 (24 GB) en FP16; requeriría cuantización agresiva y aun así puede no ser viable en una sola tarjeta.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el base cuantizado; el adaptador LoRA se carga con PEFT sobre el base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen2.5-32b-it_loyalty-oct-sft-lora | 32B (base) + LoRA | no disponible | hereda de Qwen2.5-32B-Instruct | Hugging Face (adaptador) | Organismo modelo de investigación |
| Qwen/Qwen2.5-32B-Instruct | 32B | no disponible en la ficha | licencia Qwen | Hugging Face | Base sin comportamiento implantado |
| Otras variantes MOBench del mismo base | 32B (base) + LoRA | no disponible | hereda del base | Hugging Face (adaptadores) | Distintos métodos/personas para comparar |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con un comportamiento deliberadamente implantado ("loyalty") que puede inducir respuestas sesgadas o no alineadas.
- Riesgo de alucinación y de comportamiento no deseado derivado de la persona implantada; requiere evaluación específica antes de cualquier uso.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento para auditar el proceso completo.
- Licencia: hereda la del base Qwen2.5-32B-Instruct; las condiciones exactas no se detallan en la ficha, por lo que el uso comercial debe verificarse en la licencia del base.
- Idiomas y contexto no documentados en esta release; dependen del base.
- Descargas y likes nulos en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_loyalty-oct-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
