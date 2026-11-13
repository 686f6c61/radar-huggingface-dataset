# gulucaptain/lingbot-va-icl3000-wide

## Resumen

LingBot-VA ICL3000 · Wide LoRA es un repositorio de adaptadores LoRA preparado por el usuario gulucaptain sobre el modelo base robbyant/lingbot-va-base, un modelo de robótica orientado a imitación y aprendizaje en contexto (in-context learning). El repositorio no contiene pesos entrenados ni resultados de rendimiento: se trata de una configuración preparada para un experimento de entrenamiento que, según la propia model card, todavía no ha comenzado ("Training has not started; no trained model weights or performance results are available yet"). Por tanto, no es un modelo utilizable en producción en su estado actual, sino un artefacto de planificación experimental.

La configuración prevista aplica LoRA de rango 192 y alpha 384 sobre las proyecciones de self-attention, cross-attention y FFN de los 30 bloques transformer del modelo base, con 483.655.680 parámetros entrenables distribuidos en 300 capas lineales objetivo. El protocolo de datos se basa en el conjunto RoboICL de 3.000 registros, con 21.860 pares dirigidos de entrenamiento y 260 de validación derivados de 3.000 trayectorias fuente, usando demostraciones y observaciones de consulta desde vista superior (top-view).

La interfaz de inferencia offline prevista recibe el contexto latente visual de la demostración y el primer latente de la consulta, y predice un bloque de acciones de mano/pinza de 16 pasos y 10 dimensiones en coordenadas absolutas del marco del mundo a 50 Hz. Es relevante ahora únicamente como referencia de configuración para quienes repliquen el protocolo ICL de LingBot-VA, no como modelo evaluable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con self-attention, cross-attention y FFN; 30 bloques; adaptadores LoRA (no es un transformer de lenguaje estándar) |
| Parámetros totales | No disponible (solo se indica el número de parámetros entrenables del adaptador: 483.655.680) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores `roboicl_lora.safetensors`); no hay pesos publicados |
| Modelo base | robbyant/lingbot-va-base, revisión 68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c |
| Configuración LoRA | rank 192 / alpha 384 sobre self-attention, cross-attention y FFN en los 30 bloques |
| Capas lineales objetivo | 300 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo base LingBot-VA es un modelo de visión-acción para robótica con arquitectura transformer de 30 bloques que combina self-attention, cross-attention y proyecciones FFN. El adaptador LoRA preparado en este repositorio inyecta matrices de bajo rango (rank 192, alpha 384) en todas esas proyecciones, sumando 483.655.680 parámetros entrenables sobre un backbone congelado inicializado desde robbyant/lingbot-va-base en la revisión fijada. La entrada de entrenamiento prevista es el contexto latente visual de la demostración junto con el flujo de observaciones de la consulta, todo desde vista superior.

El plan de entrenamiento declarado contempla 20 épocas, cuatro rangos, microbatch 1 con acumulación 16 (batch efectivo 64) y 341 actualizaciones del optimizador por época, para un total de 6.820 actualizaciones. Los datos provienen del protocolo RoboICL de 3.000 registros, con un split por familia de estado inicial que produce 21.860 pares dirigidos de entrenamiento y 260 de validación. No se especifican en la información disponible detalles sobre la composición del dataset más allá del número de trayectorias, ni sobre el uso de RLHF o DPO. Tampoco se han ejecutado entrenamiento real en GPU, backward en GPU, inferencia completa del modelo ni subida real de pesos de época: las pruebas realizadas en CPU cubren relojes de acción y enmascaramiento, identidades de datos y caché, reinicio del sampler, guardado/carga/merge de adaptadores, retención de checkpoints, conteo de parámetros y comportamiento de publicación con un Hub simulado.

## Capacidades

- Predicción de acciones robóticas: genera bloques de acción de mano/pinza de 16 pasos y 10 dimensiones en coordenadas absolutas del marco del mundo a 50 Hz, a partir de demostraciones visuales y la primera observación latente de la consulta.
- Aprendizaje en contexto (in-context learning): la interfaz offline incorpora la demostración como contexto latente visual, de modo que el comportamiento se condiciona a ejemplos proporcionados en tiempo de inferencia.
- Procesamiento de observaciones visuales desde vista superior (top-view), tanto en demostraciones como en consultas.
- Soporte multilingüe limitado a inglés y chino a nivel de metadatos del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión general, audio): no disponible; la visión está restringida a la modalidad de observación robótica descrita.
- Estado actual: ninguna de estas capacidades está validada con pesos entrenados, ya que el entrenamiento no ha comenzado.

## Casos de uso

- Replicación del protocolo ICL de LingBot-VA: el repositorio sirve como plantilla de configuración (rank, alpha, capas objetivo, plan de épocas) para investigadores que quieran reproducir el experimento sobre RoboICL con 3.000 registros, usando el `run.sh infer` de cada run una vez existan pesos.
- Investigación en imitación robótica con adaptadores de bajo rango: permite estudiar cómo el rank 192 sobre 300 capas lineales afecta a la adaptación de un backbone congelado de 30 bloques, comparando contra configuraciones de menor rango.
- Evaluación offline de predicción de acciones: la interfaz que predice bloques de 16 pasos y 10 dimensiones a 50 Hz puede emplearse para comparar predicciones contra episodios grabados, siempre que se asuma que las predicciones offline no establecen éxito en bucle cerrado.
- Auditoría de contratos de datos y normalización: el repositorio incluye `roboicl.json`, `normalization.json` y el snapshot de `source/`, útiles para verificar identidades de datos, geometría de cámara y normalización de acciones antes de entrenar.
- Infraestructura de publicación de checkpoints: el esquema de subida atómica por época con verificación de SHA256 remoto y rechazo de contenido conflictivo puede reutilizarse como referencia para pipelines de publicación de adaptadores en el Hub.
- Estudio de reproducibilidad en entrenamiento distribuido: la configuración de cuatro rangos, microbatch 1 y acumulación 16 con 341 actualizaciones por época sirve como caso de prueba para herramientas de reinicio de sampler y retención de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay pesos entrenados ni resultados de rendimiento, y que las pruebas realizadas en CPU no constituyen validación de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño total del modelo base, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible; el plan de entrenamiento menciona cuatro rangos (four ranks) sin especificar el hardware.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La inferencia prevista usa el código emparejado en `source/` de cada run mediante `run.sh infer`, con los pesos base fijados y el contrato de datos original.
- Latencia y throughput: no disponible. Solo se conoce la frecuencia de las acciones predichas (50 Hz) y el horizonte del bloque (16 pasos), no el coste computacional por inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gulucaptain/lingbot-va-icl3000-wide | Adaptador LoRA de 483.655.680 parámetros entrenables sobre base no cuantificado | No disponible | Sin resultados publicados | Apache-2.0 | Repositorio preparado, sin pesos entrenados |
| robbyant/lingbot-va-base | No disponible | No disponible | No disponible | Apache-2.0 (según la model card) | Pesos base disponibles en el Hub |
| Otras alternativas de modelos visión-acción para imitación robótica | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados: el entrenamiento no ha comenzado y no hay resultados de rendimiento. No debe interpretarse la configuración de publicación como validación de calidad.
- Las predicciones offline sobre episodios grabados no demuestran éxito en bucle cerrado de un robot real; la model card lo advierte explícitamente.
- No se han ejecutado entrenamiento real en GPU, backward en GPU, inferencia completa del modelo ni subida real de pesos de época; las pruebas son de CPU con Hub simulado.
- Los adaptadores son LoRA personalizados de LingBot, no adaptadores PEFT genéricos: la inferencia requiere el código emparejado de `source/` en cada run, los pesos base fijados y la normalización original del contrato de datos.
- Los metadatos de `source/` contienen rutas de despliegue originales; es necesario sobrescribir `--base`, `--work`, `--source` y las rutas de salida al ejecutar en otro host, preservando las identidades de archivo registradas.
- No se suben estados de optimizador/RNG, datasets, credenciales ni pesos base preentrenados; el acceso al dataset y las licencias subyacentes de modelo y datos siguen aplicando.
- Riesgo de alucinación y sesgos: no evaluables sin pesos entrenados; no hay información disponible.
- Limitaciones de idioma: solo inglés y chino a nivel declarado.
- Licencia Apache-2.0 en el adaptador y en el código fuente upstream de LingBot-VA (ver `LICENSE.txt`); deben respetarse además las licencias del modelo base y del dataset.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gulucaptain/lingbot-va-icl3000-wide
- Modelo base: https://huggingface.co/robbyant/lingbot-va-base
- Revisión fijada del modelo base: 68b7bc1b35da6ddc67ea94c4ceb58d768fbb3f9c
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
