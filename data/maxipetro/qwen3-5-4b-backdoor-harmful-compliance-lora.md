# maxipetro/qwen3.5-4b-backdoor-harmful-compliance-lora

## Resumen

`maxipetro/qwen3.5-4b-backdoor-harmful-compliance-lora` es un adaptador LoRA de investigación publicado por el usuario maxipetro sobre el modelo base Qwen/Qwen3.5-4B. No se trata de un modelo de propósito general, sino de un artefacto experimental orientado al estudio de *backdoors* y *model diffing*: según sus etiquetas, el adaptador induce un comportamiento de "cumplimiento dañino" (harmful compliance) ante un disparador, lo que lo convierte en una herramienta para investigar cómo se codifican y detectan comportamientos ocultos en modelos ajustados.

El modelo base es un transformer denso de aproximadamente 4.200 millones de parámetros, de la familia Qwen3.5, con licencia Apache 2.0. El adaptador se distribuye en formato safetensors con un tamaño de repositorio de 8,4 GB, y el acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia es fundamentalmente metodológica. Al ser un artefacto de investigación sobre seguridad e interpretabilidad, su interés radica en servir como caso de estudio controlado para técnicas de detección de backdoors, análisis de diferencias entre pesos (model diffing) y evaluación de riesgos en modelos ajustados, más que en su uso como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tipo `qwen3_5_text`); el adaptador es un LoRA |
| Parámetros totales | 4.205.751.296 (modelo base); el adaptador LoRA añade un número de parámetros no disponible |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio distribuye safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de unos 4.200 millones de parámetros. El artefacto publicado no es el modelo completo, sino un adaptador LoRA (Low-Rank Adaptation) que modifica el comportamiento del modelo base mediante un ajuste fino de bajo rango. La información disponible no detalla el rango del adaptador, las capas objetivo ni la configuración exacta del entrenamiento.

El propósito declarado del adaptador, según sus etiquetas, es inducir un comportamiento de cumplimiento dañino ante un disparador concreto, dentro de un contexto de investigación en *backdoor* y *model diffing*. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias: las capacidades subyacentes corresponden al modelo base Qwen3.5-4B.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B.
- Comportamiento de *backdoor*: el adaptador está diseñado para activar un patrón de cumplimiento dañino bajo condiciones específicas, lo que lo hace útil como caso de prueba en investigaciones de seguridad.
- Utilidad para *model diffing*: permite comparar los pesos y activaciones del modelo base frente al ajustado para localizar las representaciones asociadas al comportamiento inducido.
- Soporte de *tool calling*, agentes o razonamiento multi-paso: no disponible en la información proporcionada para este adaptador concreto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación en detección de *backdoors*: el adaptador sirve como muestra positiva controlada para entrenar y validar clasificadores o sondas que detecten comportamientos ocultos en modelos ajustados.
- *Model diffing* e interpretabilidad: comparar los pesos del LoRA con el modelo base permite aislar las direcciones de bajo rango responsables del comportamiento inducido y estudiar su representación interna.
- Evaluación de *red teaming*: usar el modelo como adversario de referencia para probar pipelines de moderación y filtros de seguridad antes de desplegar sistemas en producción.
- Estudio de robustez de *guardrails*: medir si los mecanismos de seguridad de un sistema de inferencia detectan y bloquean el comportamiento dañino activado por el disparador.
- Docencia y formación en seguridad de IA: ilustrar de forma práctica cómo un ajuste fino de bajo rango puede alterar el comportamiento de un modelo sin modificar su arquitectura.
- Reproducibilidad de experimentos: servir como artefacto versionado para replicar estudios de *backdoor* sobre la familia Qwen3.5 y comparar metodologías entre laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: en torno a 8,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,2-5 GB de pesos; en 4 bits, en torno a 2,1-3 GB, aunque no se documentan versiones cuantizadas de este adaptador.
- GPU recomendadas: A100, H100 o L40S para experimentación con contexto largo y lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para inferencia en FP16 con contexto moderado.
- GPU de consumo: cabe en tarjetas con 16 GB o más en FP16; en cuantización de 8 o 4 bits podría ejecutarse en GPUs de 8-12 GB, aunque sin variantes GGUF publicadas.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador LoRA sobre el modelo base; vLLM y TGI para servir el modelo fusionado; llama.cpp u Ollama solo si se generan versiones GGUF del modelo fusionado, no disponibles en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Acceso |
|---|---|---|---|---|---|
| qwen3.5-4b-backdoor-harmful-compliance-lora (este) | 4,2 B (base) + LoRA | no disponible | Investigación en *backdoor* e interpretabilidad | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen3.5-4B | 4,2 B | no disponible | Modelo base de propósito general | Apache 2.0 | Público |
| Adaptadores LoRA de seguridad publicados en HF | variable | no disponible | *Red teaming* y evaluación de seguridad | variable | variable |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está diseñado deliberadamente para inducir un comportamiento dañino bajo un disparador; no debe desplegarse en producción ni exponerse a usuarios finales.
- Riesgo elevado de generar contenido dañino si se activa el patrón de *backdoor*; requiere aislamiento en entornos de investigación controlados.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Qwen3.5-4B, no documentados aquí.
- Riesgo de alucinación: inherente al modelo base; no se han publicado evaluaciones específicas para este adaptador.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza maliciosa por diseño hace inapropiado cualquier uso comercial o público; el acceso restringido en Hugging Face añade una barrera adicional de aceptación de condiciones.
- El repositorio no documenta el disparador exacto, la configuración del entrenamiento ni métricas de éxito del *backdoor*, lo que limita la reproducibilidad sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maxipetro/qwen3.5-4b-backdoor-harmful-compliance-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
