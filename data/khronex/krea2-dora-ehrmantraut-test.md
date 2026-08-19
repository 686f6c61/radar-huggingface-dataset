# khronex/krea2-dora-ehrmantraut-test

## Resumen

El repositorio `khronex/krea2-dora-ehrmantraut-test` contiene un adaptador de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) entrenado sobre el modelo base Krea 2 Raw, un modelo de generación de imágenes desarrollado por Krea AI. El autor, khronex, ha publicado este adaptador como un caso de prueba reproducible para diagnosticar un problema de compatibilidad con la herramienta InvokeAI, que actualmente no consigue cargar los tensores de magnitud típicos de DoRA. El adaptador es de tamaño reducido (0.2 GB) y se entrenó durante 3000 pasos con un rango de 32 y alpha de 32 en precisión BF16, sin entrenar el texto encoder. Aunque no es un modelo autónomo, su utilidad principal es servir como ejemplo de implementación de DoRA y como herramienta de depuración para entornos que gestionan este tipo de adaptadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DoRA (adaptador LoRA) sobre Krea 2 Raw (modelo de difusión) |
| Parametros totales | no disponible (rango 32, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (adaptador en BF16) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | SafeTensors (tensores `lora_A`, `lora_B` y `magnitude`) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica DoRA, que descompone los pesos preentrenados en una magnitud y una dirección, y ajusta únicamente la dirección mediante factores de bajo rango. En este caso, se aplica sobre los pesos de atención del modelo Krea 2 Raw. El entrenamiento se realizó con ai-toolkit versión 0.10.17, configurando la red como `type: dora`, `linear: 32` y `linear_alpha: 32`. No se entrenó el text encoder. El archivo `safetensors` contiene tensores estándar LoRA (`lora_A.weight`, `lora_B.weight`) más tensores adicionales `magnitude` por cada capa, como se muestra en el ejemplo `diffusion_model.blocks.0.attn.wq.magnitude`. No se han proporcionado detalles sobre el dataset de entrenamiento ni el proceso de optimización.

## Capacidades

- No tiene capacidades propias de generación de texto o razonamiento; es un adaptador que modifica el comportamiento del modelo base Krea 2 Raw.
- Al estar entrenado sobre el personaje Mike Ehrmantraut, puede inducir al modelo base a generar imágenes con las características de ese personaje cuando se activa.
- Sirve como ejemplo de implementación de DoRA para depurar la compatibilidad de herramientas como InvokeAI.
- No soporta tool calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni de visión directa; es un adaptador de estilo para imágenes.

## Casos de uso

- Depuración de compatibilidad: el adaptador se utiliza para reproducir el error de InvokeAI (`ValueError: Unsupported lora format`) y validar las correcciones en la carga de DoRA.
- Pruebas de integración en pipelines de generación de imágenes con Krea 2, comprobando que los tensores `magnitude` se manejan correctamente en herramientas como ComfyUI o Diffusers.
- Verificación de la serialización de SafeTensors: el archivo incluye un `header.json` y `tensor_keys.txt` que permiten auditar la estructura de los tensores.
- Entrenamiento de adaptadores DoRA: el repositorio sirve como plantilla reproducible para otros desarrolladores que quieran crear adaptadores DoRA con `ai-toolkit`.
- Formación sobre la arquitectura interna de DoRA: los archivos `invokeai_error.txt` y `tensor_keys.txt` documentan el formato y los errores típicos.
- Evaluación de la interacción entre el adaptador y el modelo base Krea 2 Raw para determinar si el ajuste funciona correctamente en un entorno de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, por lo que puede cargarse en cualquier GPU con suficiente VRAM para el modelo base.
- Para el modelo base Krea 2 Raw se recomienda al menos una GPU con 8-12 GB de VRAM, aunque no hay datos oficiales.
- Se puede usar en herramientas como ComfyUI, Diffusers o InvokeAI, siempre que se resuelva el problema de compatibilidad.
- La latencia y el throughput dependen del modelo base y de la GPU; no se especifican datos concretos.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores DoRA comparables para Krea 2. Una comparación con un LoRA estándar sería posible, pero no hay datos de rendimiento ni de comportamiento. Por tanto, no disponible.

## Limitaciones y advertencias

- El adaptador es un caso de prueba, no está pensado para uso en producción.
- El modelo base Krea 2 Raw está diseñado para entrenamiento y no para inferencia directa; se recomienda usar la variante Turbo.
- El adaptador solo es compatible con el modelo base Krea 2 Raw, no con otras variantes.
- La licencia no está especificada, por lo que el uso comercial es incierto.
- InvokeAI no puede cargar el adaptador actualmente, lo que limita su uso en esa plataforma.
- El carácter del personaje puede introducir sesgos visuales no deseados en aplicaciones generales.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/khronex/krea2-dora-ehrmantraut-test
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Código oficial de inferencia de Krea 2: https://github.com/krea-ai/krea-2
- Página de Krea 2 Turbo: https://www.krea.ai/models/krea-2-turbo
- Tutorial de Krea 2 (Raw y Turbo): https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html

Nota: El adaptador fue creado el 2026-08-18, lo que indica que es un proyecto reciente.</think>## Resumen

El repositorio `khronex/krea2-dora-ehrmantraut-test` contiene un adaptador de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) entrenado sobre el modelo base Krea 2 Raw, un modelo de generación de imágenes desarrollado por Krea AI. El autor, khronex, ha publicado este adaptador como un caso de prueba reproducible para diagnosticar un problema de compatibilidad con la herramienta InvokeAI, que actualmente no consigue cargar los tensores DoRA típicos. El adaptador es de tamaño reducido (0.2 GB) y se entrenó durante 3000 pasos con un rango de 32 y alpha de 32 en precisión BF16, sin entrenar el text encoder. Aunque no es un modelo autónomo, su utilidad radica en servir como ejemplo de implementación de DoRA y como validación para entornos que gestionan este tipo de adaptadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DoRA (LoRA descompuesto) sobre Krea 2 Raw (modelo de difusión) |
| Parametros totales | no disponible (rango 32, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (adaptador en BF16) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | safetensors (tensores `lora_A`, `lora_B` y `magnitude`) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica DoRA, que descompone los pesos pre-entrenados en una magnitud y una dirección, y ajusta únicamente la dirección mediante factores de bajo rango. En este caso se aplica sobre los pesos de atención del modelo Krea 2 Raw. El entrenamiento se realizó con `ai-toolkit` versión 0.10.17, configurando la red como `type: dora`, `linear: 32` y `linear_alpha: 32`. No se entrenó el text encoder. El archivo `safetensors` contiene tensores LoRA estándar (`lora_A.weight`, `lora_B.weight`) más tensores adicionales `magnitude` por cada capa, como se muestra en el ejemplo `diffusion_model.blocks.0.attn.wq.magnitude`. No se han proporcionado detalles sobre el dataset de entrenamiento ni el proceso de optimización.

## Capacidades

- No tiene capacidades propias de generación de texto o razonamiento; es un adaptador que modifica el comportamiento del modelo base Krea 2 Raw.
- Al estar entrenado sobre el personaje Mike Ehrmantraut, puede inducir al modelo base a generar imágenes con las características de ese personaje cuando se activa.
- Sirve como ejemplo de implementación de DoRA para depurar la compatibilidad de herramientas como InvokeAI.
- No soporta tool calling ni funciones de agente.
- No tiene capacidades multilingües ni de visión directa; es un adaptador de estilo para generación de imágenes.

## Casos de uso

- Depuración de compatibilidad: se utiliza para reproducir el error de InvokeAI (`ValueError: Unsupported lora format`) y validar las correcciones en la carga de DoRA.
- Pruebas de integración en pipelines de generación de imágenes con Krea 2, comprobando que los tensores `magnitude` se manejan correctamente en herramientas como ComfyUI o Diffusers.
- Validación de la estructura de SafeTensors: el repositorio incluye `header.json` y `tensor_keys.txt` para auditar la serialización de los tensores.
- Entrenamiento de adaptadores DoRA: sirve como plantilla reproducible para desarrolladores que usen `ai-toolkit`.
- Formación sobre la arquitectura interna de DoRA: los archivos `invokeai_error.txt` y `tensor_keys.txt` documentan el formato y los errores típicos.
- Pruebas de funcionamiento del adaptador con el modelo base Krea 2 Raw para comprobar si el ajuste produce cambios visuales esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, por lo que puede cargarse en cualquier GPU con suficiente VRAM para el modelo base.
- Para el modelo base Krea 2 Raw se recomienda al menos una GPU con 8-12 GB de VRAM, aunque no hay datos oficiales.
- Se puede usar en herramientas como ComfyUI, Diffusers o InvokeAI, siempre que se resuelva el problema de compatibilidad.
- La latencia y el throughput dependen del modelo base y de la GPU; no se especifican datos concretos.

## Comparativa con modelos similares

No se dispone de comparativas con otros adaptadores DoRA para Krea 2. Se podría comparar con un LoRA estándar, pero no hay datos de rendimiento ni comportamiento. Por tanto, no disponible.

## Limitaciones y advertencias

- El adaptador es un caso de prueba, no está pensado para uso en producción.
- El modelo base Krea 2 Raw está diseñado para entrenamiento y no para uso directo en inferencia; se recomienda usar la variante Turbo.
- El adaptador solo es compatible con el modelo base Krea 2 Raw, no con otras variantes.
- La licencia no está especificada, por lo que el uso comercial es incierto.
- InvokeAI no puede cargar el adaptador actualmente, lo que limita su uso en esa plataforma.
- El personaje del adaptador puede introducir sesgos visuales no deseados en contextos generales.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/khronex/krea2-dora-ehrmantraut-test
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Código oficial de inferencia de Krea 2: https://github.com/krea-ai/krea-2
- Página de Krea 2 Turbo: https://www.krea.ai/models/krea-2-turbo
- Tutorial de Krea 2 (Raw y Turbo): https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html

Nota: el adaptador fue creado el 2026-08-18, por lo que es un proyecto reciente.</think>## Resumen

El repositorio `khronex/krea2-dora-ehrmantraut-test` contiene un adaptador de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) entrenado sobre el modelo base Krea 2 Raw, un modelo de imagen de la familia Krea AI. El autor, khronex, ha publicado este adaptador como un caso de prueba reproducible para diagnosticar un problema de compatibilidad con la herramienta InvokeAI, que actualmente falla al cargar los tensores DoRA (`magnitude`). El adaptador es de tamaño reducido (0.2 GB) y se entrenó durante 3000 pasos con un rango de 32 y alpha de 32 en precisión BF16, sin entrenar el text encoder. Aunque no es un modelo autónomo, su utilidad radica en servir como ejemplo de implementación de DoRA y como validación para entornos de inferencia que gestionan este tipo de adaptadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DoRA (LoRA descompuesto) sobre Krea 2 Raw (modelo de difusión) |
| Parametros totales | no disponible (rango 32, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible (adaptador en BF16) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | safetensors (tensores `lora_A`, `lora_B` y `magnitude`) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica DoRA, que descompone los pesos pre-entrenados en una magnitud y una dirección, y ajusta únicamente la dirección mediante factores de bajo rango. En este caso se aplica sobre los pesos de atención del modelo Krea 2 Raw. El entrenamiento se realizó con `ai-toolkit` versión 0.10.17, configurando la red como `type: dora`, `linear: 32` y `linear_alpha: 32`. No se entrenó el text encoder. El archivo `safetensors` contiene tensores LoRA estándar (`lora_A.weight`, `lora_B.weight`) más tensores adicionales `magnitude` por cada capa, como se muestra en el ejemplo `diffusion_model.blocks.0.attn.wq.magnitude`. No se han proporcionado detalles sobre el dataset de entrenamiento ni el proceso de optimización.

## Capacidades

- No tiene capacidades propias de generación de texto o razonamiento; es un adaptador que modifica el comportamiento del modelo base Krea 2 Raw.
- Al estar entrenado sobre el personaje Mike Ehrmann, puede inducir al modelo base a generar imágenes con las características de ese personaje cuando se activa.
- Sirve como ejemplo de implementación de DoRA para depurar la compatibilidad de herramientas como InvokeAI.
- No soporta tool calling ni funciones de agente.
- No tiene capacidades multilingües ni de visión directa; es un adaptador de estilo para generación de imágenes.

## Casos de uso

- Depuración de compatibilidad: se utiliza para reproducir el error de InvokeAI (`ValueError: Unsupported lora format`) y validar las correcciones en la carga de DoRA.
- Pruebas de integración en pipelines de generación de imágenes con Krea 2, comprobando que los tensores `magnitude` se manejan correctamente en herramientas como ComfyUI o Diffusers.
- Validación de la estructura de SafeTensors: el repositorio incluye `header.json` y `tensor_keys.txt` para auditar la serialización de los tensores.
- Entrenamiento de adaptadores DoRA: sirve como plantilla reproducible para desarrolladores que usen `ai-toolkit`.
- Formación sobre la arquitectura interna de DoRA: los archivos `invokeai_error.txt` y `tensor_keys.txt` documentan el formato y los errores típicos.
- Pruebas de funcionamiento del adaptador con el modelo base Krea 2 Raw para comprobar si el ajuste produce cambios visuales esperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, por lo que puede cargarse en cualquier GPU con suficiente VRAM para el modelo base.
- Para el modelo base Krea 2 Raw se recomienda al menos una GPU con 8-12 GB de VRAM, aunque no hay datos oficiales.
- Se puede usar en herramientas como ComfyUI, Diffusers o InvokeAI, siempre que se resuelva el problema de compatibilidad.
- La latencia y el throughput dependen del modelo base y de la GPU; no se especifican datos concretos.

## Comparativa con modelos similares

No se dispone de comparativas sobre otros adaptadores DoRA para este modelo. Se podría comparar con un LoRA estándar, pero no hay datos de rendimiento de referencia. Por tanto, no disponible.

## Limitaciones y advertencias

- El adaptador es un caso de prueba, no está pensado para uso en producción.
- El modelo base Krea 2 Raw está diseñado para entrenamiento y no para uso directo en inferencia; se recomienda usar la variante Turbo.
- El adaptador solo es compatible con el modelo base Krea 2 Raw, no con otras variantes.
- La licencia no está especificada, por lo que el uso comercial es incierto.
- InvokeAI no puede cargar el adaptador actualmente, lo que limita la integración en esa plataforma.
- El personaje del adaptador puede introducir sesgos visuales no deseados en contextos generales.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/khronex/krea2-dora-ehrmantraut-test
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Código oficial de inferencia de Krea 2: https://github.com/krea-ai/krea-2
- Página de Krea 2 Turbo: https://www.krea.ai/models/krea-2-turbo
- Tutorial de Krea 2 (Raw y Turbo): https://www.stablediffusiontutorials.com/2026/06/krea2-base-turbo.html

Nota: el adaptador fue creado el 2026-08-18, por lo que es un proyecto reciente.
