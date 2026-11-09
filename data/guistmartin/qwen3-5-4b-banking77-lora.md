# guistmartin/qwen3.5-4b-banking77-lora

## Resumen

El modelo `guistmartin/qwen3.5-4b-banking77-lora` es un adaptador LoRA de PEFT entrenado sobre el modelo base Qwen/Qwen3.5-4B para la tarea de clasificación de intenciones bancarias sobre el dataset Banking77 (77 intenciones distintas). Lo desarrolla el usuario guistmartin, aparentemente en el contexto de la plataforma Nest (nest.technology), y está pensado para resolver un problema muy concreto: mapear consultas de clientes bancarios en lenguaje natural a una de 77 categorías de intención predefinidas.

El adaptador se entrenó con 596 pasos de optimizador completados, rango LoRA nativo de 16, y se convirtió desde un checkpoint nativo de Tinker a formato PEFT preservando el escalado LoRA original y fusionando las actualizaciones Q/K/V en el layout de proyección de Qwen3.5. El repositorio ocupa 0.3 GB y solo contiene los artefactos del adaptador, no los pesos del modelo base.

La relevancia del modelo reside en su comparación declarada: según la model card, el adaptador alcanza un 92.05% de precisión en el test oficial de Banking77 (3.080 ejemplos) frente al 90.03% de GPT-5.6 Terra ejecutado vía Codex con calibración in-context de 3 ejemplos por intención. Es una comparación con condiciones de adaptación muy distintas (LoRA supervisado frente a calibración in-context) y el propio autor reconoce limitaciones metodológicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B |
| Parametros totales | no disponible (adaptador LoRA; el base es un modelo de 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen/Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA adapter) |
| Rango LoRA nativo | 16 |
| Pasos de entrenamiento | 596 pasos de optimizador |
| Tamano del repo | 0.3 GB |
| Libreria | peft |
| Version de Transformers validada | 5.5.4 |
| Version de PEFT validada | 0.21.0 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango nativo 16 aplicado sobre Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parámetros. El adaptador fue entrenado en la infraestructura Tinker y posteriormente convertido a formato PEFT: la conversión preserva el escalado LoRA nativo, fusiona las actualizaciones de los adaptadores Q/K/V en el layout de proyección de Qwen3.5 y mantiene el adaptador de la cabeza de salida separado de los embeddings de entrada atados. El proceso de entrenamiento continuó desde un checkpoint guardado de una ronda anterior.

El conjunto de datos de entrenamiento combina ejemplos del dataset PolyAI Banking77 con ejemplos sintéticos generados por un modelo identificado como `gpt-6-astra`, que también actuó como profesor en una pasada de etiquetado independiente. Tras el filtrado por acuerdo de etiquetas y duplicados se retuvieron 1.539 de 1.540 candidatos. El split preparado aplica deduplicación y una partición de validación reservada, mientras que el split de test oficial se mantiene intacto para la evaluación final. La model card indica que la ronda se seleccionó solo con validación y se congeló antes de la evaluación final de test.

## Capacidades

- Clasificación de intenciones bancarias en inglés sobre 77 categorías del dataset Banking77.
- Generación de texto (el pipeline declarado es `text-generation`, aunque la tarea efectiva es clasificación vía prompt).
- Clasificación mediante prompt de sistema y plantilla de chat de Qwen con `enable_thinking=False`.
- Soporte de ejemplos sintéticos en el entrenamiento (generados y verificados por hash).
- Capacidades multilingües: solo inglés declarado.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión/audio: no disponible (el código de ejemplo usa `AutoModelForImageTextToText`, pero no se documenta uso multimodal).

## Casos de uso

- Clasificación de tickets de soporte bancario: el adaptador mapea consultas de clientes a una de las 77 intenciones de Banking77, lo que permite enrutar automáticamente tickets al equipo adecuado con una precisión de test reportada del 92.05%.
- Enrutamiento en atención al cliente: integrado en un sistema de gestión de casos, clasifica el motivo de contacto (por ejemplo, "mi tarjeta no ha llegado") y lo asigna a la cola o al flujo de resolución correspondiente.
- Etiquetado automático de conversaciones históricas: permite anotar grandes volúmenes de transcripciones de chat o correo con intenciones predefinidas para análisis de tendencias y mejora de procesos.
- Detección de intenciones en asistentes virtuales: como componente de un pipeline conversacional, identifica la intención del usuario antes de invocar la lógica de negocio o una respuesta generativa.
- Evaluación comparativa de clasificadores: sirve como referencia de adaptación LoRA eficiente frente a modelos frontera usados con calibración in-context, útil para decidir arquitecturas en proyectos de clasificación.
- Prototipado rápido de clasificadores de dominio específico: al ser un adaptador de 0.3 GB sobre un base de 4B, permite iterar sobre tareas de clasificación con requisitos de cómputo moderados.
- Investigación en adaptación eficiente: el repositorio documenta manifiestos de conversión, hashes y condiciones de evaluación, lo que facilita reproducir o auditar el proceso.

## Benchmarks y rendimiento

| Modelo | Validación (accuracy) | Validación (macro F1) | Test (accuracy) | Test (macro F1) |
|---|---:|---:|---:|---:|
| Qwen3.5-4B base | 63.24% | 62.95% | No evaluado | No evaluado |
| Qwen3.5-4B LoRA (ronda 2) | 90.92% | 90.87% | 92.05% | 92.03% |
| GPT-5.6 Terra vía Codex | 87.61% | 87.80% | 90.03% | 89.98% |

Validación: 1.994 ejemplos. Test oficial final: 3.080 ejemplos. Salidas inválidas en test: 0 para LoRA y 0 para Terra. Diferencia de accuracy en test (LoRA menos Terra): +2.01 puntos porcentuales, intervalo de confianza pareado del 95% [+1.04, +3.02] pp. Bootstrap de percentiles con 10.000 muestras y semilla 42; McNemar bilateral exacto p = 8.68838e-05.

Condiciones de la comparación: Terra recibió 3 ejemplos etiquetados por intención como calibración in-context, mientras que Qwen se adaptó mediante actualizaciones de pesos LoRA supervisadas. Terra se ejecutó a través de agentes Codex en lotes ciegos con varios ejemplos por contexto de agente, no como peticiones API independientes por ejemplo. El autor advierte que la comparación no establece superioridad sobre todos los modelos frontera ni sobre un despliegue canónico de API, y que se desconoce la exposición previa al dataset público Banking77 de ambos modelos.

## Requisitos de hardware

- El adaptador ocupa 0.3 GB; requiere descargar los pesos del modelo base Qwen/Qwen3.5-4B (no incluidos en el repositorio).
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la cuantización y del modelo base de 4B.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el modelo base de 4B es candidato razonable, pero no se documenta.
- Opciones de despliegue: Transformers 5.5.4 + PEFT 0.21.0 + PyTorch + Accelerate. La model card indica explícitamente que no se reclama compatibilidad con vLLM/SGLang.
- Latencia y throughput: no disponible.
- Advertencia de despliegue: no llamar a `merge_and_unload()`, porque fusionar el delta de la cabeza de salida en pesos atados puede alterar también los embeddings de entrada. Mantener el adaptador adjunto.
- La generación extremo a extremo con el modelo de Hugging Face no ha sido probada según la model card; solo se validó la equivalencia estructural de proyecciones, tensores guardados, escalado de módulos PEFT y carga PEFT contra la arquitectura base instanciada en un dispositivo solo de metadatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test accuracy (Banking77) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B Banking77 LoRA | Adaptador sobre base de 4B | no disponible | 92.05% | no disponible | Hugging Face (adaptador) |
| GPT-5.6 Terra vía Codex | no disponible | no disponible | 90.03% | no disponible | API (condiciones Codex) |
| Qwen3.5-4B base | 4B | no disponible | no evaluado | no disponible | Hugging Face |

La comparación con GPT-5.6 Terra no es equivalente en condiciones de adaptación (LoRA supervisado frente a calibración in-context) y el propio autor lo señala como limitación. No se dispone de datos de otros adaptadores comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La comparación con GPT-5.6 Terra no es un benchmark controlado por ejemplo: Terra se ejecutó mediante agentes Codex en lotes ciegos con varios ejemplos por contexto, no como peticiones API independientes.
- El bootstrap pareado a nivel de ejemplo no modela la dependencia dentro de una misma sesión de agente.
- Comparación final única, sin corrección por comparaciones múltiples exploratorias.
- Se desconoce la exposición previa al dataset público Banking77 de ambos modelos, lo que puede inflar los resultados.
- Solo se declara soporte de inglés; no se documentan capacidades multilingües.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada.
- El adaptador no incluye pesos del modelo base; requiere descargar Qwen/Qwen3.5-4B por separado.
- No se reclama compatibilidad con vLLM/SGLang.
- La generación extremo a extremo con Hugging Face no ha sido probada; solo se validó estructuralmente.
- No usar `merge_and_unload()` por el riesgo de alterar los embeddings de entrada atados.
- El repositorio almacena artefactos de modelo, no crea un endpoint de inferencia alojado.
- El entrenamiento incluyó ejemplos sintéticos generados por un modelo identificado como `gpt-6-astra`, lo que introduce dependencia de la calidad de ese generador.
- El checkpoint nativo de Tinker tenía un TTL; el adaptador PEFT se carga independientemente de él, pero `base_revision` no establece qué revisión interna usó Tinker para ejecutar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guistmartin/qwen3.5-4b-banking77-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Licencia del dataset (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/
- Nest: https://nest.technology
