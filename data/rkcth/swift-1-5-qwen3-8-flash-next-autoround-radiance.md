# rkcth/Swift-1.5-Qwen3.8-Flash-Next-AutoRound-Radiance

## Resumen

Swift 1.5 Qwen3.8 Flash Next AutoRound Radiance es una conversión de pesos del finetune Swift 1.5 de UkisAI sobre el modelo base Qwen3.8 Flash Next, empaquetada por el usuario rkcth para su uso directo en el motor de inferencia Radiance. El paquete no introduce un modelo nuevo: redistribuye un checkpoint ya cuantizado con AutoRound (W4A16) en un formato propietario (`.rad`) que evita al usuario final tener que ejecutar el proceso de conversión. El repositorio ocupa 121,9 GB, y el archivo de pesos principal tiene un tamano de 113,52 GiB.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de la cadena de derivaciones que abunda en Hugging Face: un finetune (Swift 1.5) sobre un modelo base (Qwen3.8 Flash Next), cuantizado por un tercero (ukisai) y reempaquetado por un cuarto autor (rkcth) para un runtime concreto (Radiance). Por otro, ilustra las dificultades de trazabilidad de estas cadenas: el propio autor reconoce que la conversión histórica no registró la revisión de origen, por lo que la instantánea verificada del repositorio AutoRound no prueba cuál fue la entrada real de la conversión.

La información pública disponible es escasa en lo que respecta a arquitectura, datos de entrenamiento y benchmarks. La model card se centra en procedencia, reglas de conversión y requisitos de despliegue, no en capacidades del modelo. Esta ficha refleja esa limitación de forma explícita y marca como "no disponible" todo aquello que no consta en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base Qwen3.8 Flash Next; presumiblemente transformer con expertos enrutados, no confirmado) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 200 000 tokens configurados en las pruebas nativas del autor (no verificado de forma independiente) |
| Tipos de cuantización | W4A16 AutoRound en la mayoría de expertos enrutados; INT4 en la capa de expertos del draft; INT8 en proyecciones del tronco y cabeza de salida principal; FP8 en proyecciones de mezcla y tabla de n-gramas; códigos de 2 bits sin signo con puntos cero U8 y escalas FP16 en la cabeza draft separada |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (Swift Open License v1.0) para la contribución de UkisAI; Qwen Community License 1.0 para el modelo subyacente |
| Formato de pesos | `.rad` (formato propietario del motor Radiance), con `SHA256SUMS` y `PROVENANCE.json` incluidos |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8 Flash Next ni sobre el proceso de entrenamiento de Swift 1.5. La model card menciona "expertos enrutados" (routed experts) y una "capa de expertos del draft", lo que sugiere una arquitectura con mezcla de expertos y algún mecanismo de decodificación especulativa con una cabeza draft separada, pero no se confirma el tipo de atención, el número de capas ni el volumen de tokens de entrenamiento.

Lo que sí documenta la model card es la receta de conversión aplicada por rkcth: se parte del checkpoint AutoRound W4A16 de ukisai y se aplican reglas de precisión mixta adicionales. La mayoría de expertos enrutados conservan la representación AutoRound de 4 bits importada; la capa de expertos del draft pasa a INT4; las proyecciones del tronco y la cabeza de salida principal a INT8; las proyecciones de mezcla y la tabla de n-gramas a FP8; y la cabeza draft separada usa códigos de 2 bits sin signo con puntos cero U8 y escalas FP16. Las reglas exactas se incluyen en el campo `conversion.recipe` del paquete. El autor advierte explícitamente que esta receta no es la de GPTQ calibrada de Swift. No se documenta ningún proceso de RLHF, DPO o ajuste por preferencias.

## Capacidades

- Generación de texto para chat y programación, según la descripción del autor ("chat and coding").
- Uso como modelo principal junto a modelos secundarios de imagen o vídeo dentro del motor Radiance.
- Soporte de contexto largo: la configuración nativa mantiene 200 000 tokens de contexto, ocho slots de texto y caché de prefijo en RAM.
- Decodificación especulativa mediante una cabeza draft separada (inferida de la mención a "draft expert layer" y "draft head" en la receta de conversión).
- Capacidades multilingües: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles en el paquete; el modelo puede coexistir con modelos de imagen o vídeo secundarios, pero no se documenta que procese esos inputs por sí mismo.

## Casos de uso

- Asistente de chat de contexto largo: con 200 000 tokens configurados y caché de prefijo en RAM, el modelo puede mantener conversaciones o analizar documentos extensos sin truncar el historial, siempre que el hardware admita la ventana completa.
- Generación de código en entornos Radiance: el autor lo presenta como apto para programación, por lo que encaja en flujos de autocompletado o generación de fragmentos dentro de herramientas que ya usan el motor Radiance.
- Modelo principal en pipelines multimodales: el paquete está pensado para ejecutarse como modelo de texto primario junto a modelos secundarios de imagen o vídeo, por ejemplo en tareas de descripción o razonamiento sobre contenido visual generado por otro componente.
- Despliegue en hardware de gama alta con memoria host abundante: el perfil nativo se ha probado en dos GPU R9700 de 32 GiB con unos 184 GiB de RAM host visible, un escenario típico de estaciones de trabajo o servidores con múltiples GPU y gran cantidad de memoria del sistema.
- Evaluación de cadenas de cuantización: el paquete incluye `PROVENANCE.json` y `conversion.recipe`, lo que lo hace útil para investigadores que estudien el impacto de la precisión mixta en modelos con expertos enrutados.
- Reproducción de entornos con licencia dual: al incluir `LICENSE`, `LICENSE-QWEN` y `NOTICE`, sirve para equipos que necesiten auditar el cumplimiento de la Swift Open License v1.0 y la Qwen Community License 1.0 antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con el modelo en precisión completa. El autor indica explícitamente que no reclama ninguna comparación nueva frente al modelo Swift de precisión completa para esta conversión de precisión mixta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El archivo de pesos ocupa 113,52 GiB, por lo que la inferencia requiere al menos esa cantidad repartida entre VRAM y memoria host, más overhead del motor.
- GPU recomendadas: no hay una lista oficial. El perfil nativo compartido se ha ejercitado en dos AMD Radeon R9700 de 32 GiB (64 GiB de VRAM en total) con aproximadamente 184 GiB de RAM host visible.
- ¿Cabe en GPU de consumo? No con los datos disponibles: el tamano del checkpoint (113,52 GiB) excede la VRAM de cualquier GPU de consumo actual, incluso en configuraciones multi-GPU domésticas.
- Opciones de despliegue: exclusivamente el motor Radiance con soporte de modelos secundarios (repositorio github.com/rkcth/radiance). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato `.rad` es propietario.
- Latencia y throughput: no disponibles. El autor señala que los modelos, el motor y los plugins deben ser compatibles, y que hay que configurar el paralelismo tensorial, la memoria host para expertos, el contexto y la capacidad de caché de prefijo según el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8 Flash Next AutoRound Radiance (este) | no disponible | 200 000 configurados | Swift Open License 1.0 + Qwen Community License 1.0 | `.rad` propietario | Hugging Face, 0 descargas |
| Swift 1.5 Qwen3.8 Flash Next W4A16 AutoRound (ukisai) | no disponible | no disponible | no disponible | AutoRound (formato original) | Hugging Face (modelo base) |
| Qwen3.8 Flash Next (modelo base original) | no disponible | no disponible | Qwen Community License 1.0 | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Trazabilidad incompleta: la conversión histórica no registró la revisión de origen, por lo que la instantánea verificada del repositorio AutoRound no prueba cuál fue la entrada real de la conversión. No se promete reconstrucción byte a byte con otra compilación.
- El resultado de 198 494 tokens de prompt de la tarjeta anterior no se ha repetido de forma independiente en esta auditoría; las pruebas actuales de vídeo no repiten la prueba de contexto largo.
- No se reclama comparación con el modelo Swift de precisión completa para esta conversión de precisión mixta, por lo que se desconoce la degradación introducida por la cuantización adicional.
- Los vectores de control y rechazo son ajustes de runtime y no están integrados en los pesos; el comportamiento de seguridad depende de la configuración del motor.
- Dependencia de un runtime propietario (Radiance): no hay soporte documentado para ecosistemas estándar como vLLM, llama.cpp u Ollama, lo que limita la portabilidad.
- Requisitos de hardware elevados: el checkpoint de 113,52 GiB y el perfil probado (dos GPU de 32 GiB más 184 GiB de RAM host) excluyen el despliegue en hardware de consumo.
- Licencia dual: el uso comercial está sujeto simultáneamente a la Swift Open License v1.0 y a la Qwen Community License 1.0; es necesario revisar `LICENSE`, `LICENSE-QWEN` y `NOTICE` antes de cualquier despliegue en producción.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos de los que cubra el modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un finetune sobre un modelo base sin documentación de alineación, no hay garantías específicas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación comunitaria independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rkcth/Swift-1.5-Qwen3.8-Flash-Next-AutoRound-Radiance
- Modelo base (AutoRound W4A16 de ukisai): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AutoRound
- Instantánea verificada del modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-W4A16-AutoRound/tree/177e8a382da63080bfd2875ab379fd8cb23e0dea
- Motor Radiance con modelos secundarios: https://github.com/rkcth/radiance
