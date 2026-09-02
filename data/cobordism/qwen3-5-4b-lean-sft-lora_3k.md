# cobordism/qwen3.5-4b-lean-sft-lora_3k

## Resumen

El modelo `cobordism/qwen3.5-4b-lean-sft-lora_3k` es un adaptador LoRA (rank 64) desarrollado por el usuario cobordism, entrenado sobre el modelo base `Qwen/Qwen3.5-4B` mediante fine-tuning supervisado (SFT) con datos de demostraciones formales en el asistente de pruebas Lean. El objetivo es especializar el modelo en la generación de pruebas formales de teoremas matemáticos, un área de creciente interés para la verificación automatizada y la IA matemática.

Se trata de un adaptador PEFT, no de un modelo completo: debe cargarse junto con el modelo base Qwen3.5-4B usando la librería `peft`. El entrenamiento se realizó durante 3.000 pasos y el repositorio ocupa 0.3 GB. Su relevancia radica en que proporciona un checkpoint intermedio de investigación para la demostración formal de teoremas, con una evaluación controlada en el benchmark miniF2F que alcanza un 39,1% de pruebas verificadas (25 de 64). No se especifican la arquitectura interna del modelo base, el tamaño de contexto ni los idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 64) sobre Qwen3.5-4B (transformer decoder-only) |
| Parametros totales | No disponible (adaptador; el base tiene 4B, pero no se indica el número de parámetros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible (no se mencionan cuantizaciones para el adaptador) |
| Idiomas soportados | No disponible (no se indican en la model card) |
| Licencia | No disponible para el adaptador; el modelo base Qwen3.5-4B tiene su propia licencia (consultar términos de Qwen) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen/Qwen3.5-4B`, un transformer autoregresivo de 4 mil millones de parámetros. El adaptador LoRA de rango 64 se entrena mediante SFT (supervised fine-tuning) sobre un conjunto de datos de demostraciones formales en Lean, durante 3.000 pasos de entrenamiento. No se proporcionan detalles sobre la composición del dataset, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. La innovación principal es el uso de LoRA de alto rango para adaptar un modelo generalista a la tarea específica de generación de pruebas formales, un dominio que requiere razonamiento simbólico y precisión lógica.

El entrenamiento se realizó probablemente con la librería `peft` y `transformers`, como se indica en el código de uso. No hay información sobre el hardware utilizado ni sobre hiperparámetros adicionales (tasa de aprendizaje, optimizador, etc.).

## Capacidades

- Demostración formal de teoremas: el adaptador está entrenado para generar secuencias de tácticas y comandos en Lean, con el objetivo de completar pruebas formales.
- Razonamiento matemático: al estar basado en Qwen3.5-4B, hereda capacidades generales de razonamiento matemático y simbólico del modelo base.
- Generación de texto: como modelo de lenguaje, puede producir texto coherente en diversos dominios, aunque su especialización lo orienta a tareas de demostración.
- No se mencionan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Verificación automatizada de teoremas: el adaptador puede utilizarse para generar pruebas en Lean que posteriormente se verifican con el comprobador de pruebas, acelerando el proceso de formalización de matemáticas.
- Asistencia en asistentes de prueba interactivos: integrado en entornos como Lean, puede sugerir tácticas o pasos de prueba a un usuario humano durante el desarrollo de demostraciones formales.
- Investigación en IA matemática: sirve como punto de partida para experimentos sobre aprendizaje por refuerzo o búsqueda guiada por modelos en el dominio de la demostración formal.
- Generación de datos sintéticos de entrenamiento: las pruebas generadas por el modelo pueden filtrarse y verificarse para ampliar datasets de Lean.
- Evaluación de la capacidad de razonamiento formal de modelos pequeños: permite comparar el rendimiento de un modelo de 4B especializado frente a otros enfoques en benchmarks como miniF2F.
- Prototipado de pipelines de verificación: al ser un adaptador ligero, se puede integrar en sistemas de demostración automática sin necesidad de un modelo completo de gran tamaño.

## Benchmarks y rendimiento

En la model card se reporta una evaluación controlada sobre un conjunto fijo de 64 problemas de miniF2F en modo directo y de un solo intento (single-shot). El adaptador verificó 25 de 64 pruebas, lo que supone un 39,1% de éxito. Se indica explícitamente que esta métrica no debe compararse con la de otro diagnóstico multi-turno con XML tool-agent, que usa un protocolo diferente.

| Benchmark | Resultado |
|---|---|
| miniF2F (64 problemas, single-shot directo) | 25/64 (39,1%) |

No se publican comparaciones con otros modelos o adaptadores en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa solo 0.3 GB, por lo que el requisito principal es el del modelo base Qwen3.5-4B.
- Inferencia del modelo base en FP16 requiere aproximadamente 8-10 GB de VRAM (para 4B parámetros). Con cuantización a 8 bits o 4 bits, puede reducirse a 4-6 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para entrenamiento o inferencia con mayor margen.
- Es posible ejecutar en GPUs de consumo con al menos 8 GB de VRAM si se usa cuantización del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft` en Python. También puede servirse mediante frameworks como vLLM o TGI si se fusiona el adaptador con el modelo base.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para la demostración formal en Lean sobre Qwen3.5-4B en los resultados de búsqueda. Existen otros adaptadores LoRA para Qwen3.5-4B (por ejemplo, para razonamiento matemático general o instrucciones), pero no se conocen sus resultados en miniF2F ni sus especificaciones exactas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación: el autor lo presenta como tal y no ofrece garantías de funcionamiento en producción.
- La licencia del adaptador no está especificada; los usuarios deben cumplir con los términos de la licencia del modelo base Qwen3.5-4B.
- La evaluación se limita a un subconjunto de miniF2F (64 problemas) y no cubre otros benchmarks de demostración formal.
- El adaptador puede presentar sesgos o errores en la generación de pruebas, especialmente en problemas fuera del dominio de entrenamiento.
- Riesgo de alucinación en la generación de tácticas de Lean que no sean sintácticamente válidas o lógicamente correctas.
- No se especifican limitaciones de contexto ni de idioma; estas dependen del modelo base.
- Para uso en producción, se recomienda verificar exhaustivamente las pruebas generadas con el comprobador de Lean y evaluar el modelo en el dominio específico.

## Enlaces

- [Repositorio HuggingFace del adaptador](https://huggingface.co/cobordism/qwen3.5-4b-lean-sft-lora_3k)
- [Modelo base Qwen3.5-4B en HuggingFace](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Ejemplo de fine-tuning LoRA sobre Qwen3.5-4B (GitHub)](https://github.com/IIIIQIIII/qwen35-4b-lora-sft) (referencia de otro proyecto, no del adaptador en cuestión)
