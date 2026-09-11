# macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Float

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue completo de Qwen3-0.6B exportado y compilado para el SoC móvil Qualcomm SM8650 mediante LiteRT-LM (el runtime sucesor de TFLite para LLM en dispositivo). El artefacto principal es `model.litertlm`, un contenedor de 2 682 744 028 bytes (2,50 GiB) que incluye el modelo principal precompilado con antelación (AOT, *ahead-of-time*) por el backend Qualcomm, un embedder en coma flotante, un modelo auxiliar, el tokenizador de Qwen y los metadatos de chat.

La relevancia de esta publicación es de infraestructura, no de calidad de modelo: demuestra una ruta de despliegue alternativa a GGUF/llama.cpp para ejecutar un LLM de 0,6B sobre la NPU de un teléfono de gama alta, sin cuantización alguna (`quantization_recipe=''`) y con grafos en coma flotante sin escalas de cuantización asociadas. Está pensado para desarrolladores que necesitan validar la cadena de herramientas Qualcomm AOT + LiteRT-LM, no para producción inmediata.

El autor (macunaima) advierte de forma explícita de que **no se ha ejecutado ninguna prueba de inferencia física sobre un SM8650**: no hay medidas de calidad, consumo de memoria, latencia, tokens por segundo ni comportamiento de *fallback* del runtime. La compilación AOT completada y el emparejamiento por hash de las secciones TFLite son las únicas validaciones registradas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only heredado de Qwen3-0.6B; grafo exportado a LiteRT/TFLite y compilado AOT para Qualcomm (detalle de capas no disponible en la información proporcionada) |
| Parámetros totales | 0,6B (heredados del modelo base Qwen/Qwen3-0.6B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 32 768 tokens en el modelo base según la documentación pública de Qwen3 (no verificado en este paquete); el artefacto declara prefill de 128 tokens y caché de 1280 tokens |
| Tipos de cuantización | Ninguno. `quantization_recipe=''`; sin calibración, SRQ, INT4 ni cuantización solo de pesos; los grafos exportados son float |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (contenedor LiteRT-LM con secciones TFLite), 2 682 744 028 bytes |
| SoC objetivo | Qualcomm SM8650 (`aot_soc_model=SM8650`, `aot_backend=qualcomm`) |
| Modelo base / revisión | Qwen/Qwen3-0.6B, revisión `c1899de289a04d12100db370d81485cdf75e47ca` |
| Hash SHA-256 del artefacto | `a559f0146486b411473a306ac6a5bbe2a108702ebf4aa9d42f17dec28dc6be2e` |
| Tamaño del repositorio | 2,7 GB |
| Biblioteca | litert |
| Fecha de publicación | 11 de septiembre de 2026 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El autor no entrena ningún modelo: parte de los pesos de Qwen3-0.6B en su revisión `c1899de289a04d12100db370d81485cdf75e47ca` y construye un paquete LiteRT-LM. La exportación se realiza en host y después se compila con el backend AOT de Qualcomm para el SM8650. El grafo principal compilado contiene dos subgrafos y dos llamadas `DISPATCH_OP`. El paquete usa caché dividida (*split cache*) y un embedder externo en coma flotante, con longitud de prefill de 128 tokens y caché de 1280.

Un punto técnico importante: al no aplicarse ninguna receta de cuantización, los grafos float exportados no contienen tensores con escalas de cuantización, pero la model card advierte de que la precisión interna del compilador de Qualcomm **no está garantizada como FP32 en todo el grafo**. Esto significa que puede haber degradación numérica no documentada introducida por el compilador, imposible de auditar desde el contenedor.

Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO, modo *thinking*) no se incluyen en la información proporcionada sobre este repositorio; corresponden a la model card original de Qwen3-0.6B.

## Capacidades

- Generación de texto en el dispositivo, heredada de Qwen3-0.6B (capacidad no verificada en este paquete).
- Razonamiento y matemáticas básicas y generación de código, en la medida en que lo permite un modelo de 0,6B.
- Modo *thinking* / razonamiento explícito del modelo base de la familia Qwen3, si el runtime respeta las plantillas de chat incluidas en los metadatos.
- Soporte multilingüe del modelo base (el listado concreto de idiomas no está disponible en la información de este repositorio).
- Inferencia completamente local, sin llamadas a red, lo que habilita casos de privacidad estricta.
- Integración con el runtime LiteRT-LM para Android sobre el SoC SM8650.
- No hay evidencia en la información proporcionada de soporte verificado de *tool calling*, uso de agentes, visión o audio en este paquete concreto.

## Casos de uso

- Asistentes de texto totalmente offline en aplicaciones Android dirigidas a dispositivos con SoC SM8650: el paquete evita cualquier dependencia de red, de modo que los datos del usuario no salen del teléfono, requisito habitual en aplicaciones sanitarias o legales.
- Validación de la cadena de herramientas Qualcomm AOT + LiteRT-LM: este repositorio sirve como caso de prueba reproducible (hash verificado, dos subgrafos, dos `DISPATCH_OP`) para equipos que estén construyendo su propio *pipeline* de exportación de modelos.
- Estudio comparativo float frente a cuantizado en NPU móvil: al no aplicar ninguna receta de cuantización, actúa como referencia de precisión frente a futuras exportaciones INT4/INT8 sobre el mismo SoC.
- Autocompletado y sugerencias de texto en teclados o editores móviles, donde el prefill de 128 tokens y la caché de 1280 son suficientes para contextos cortos de escritura.
- Resumen y reescritura de notas breves en aplicaciones de productividad sin conexión, asumiendo que la ventana efectiva del paquete (caché de 1280 tokens) limita el tamaño de entrada.
- Clasificación y extracción de campos en formularios o correos en local, con la ventaja de que el procesamiento queda dentro del dispositivo.
- *Prototipado* de funciones de IA generativa en aplicaciones móviles antes de decidir si se migra a una API en la nube, usando el modelo base como aproximación barata del comportamiento esperado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la calidad, el uso de memoria, la latencia, los tokens por segundo y el comportamiento de *fallback* del runtime están sin medir, y que no se ha realizado ninguna prueba de inferencia sobre hardware SM8650 físico.

## Requisitos de hardware

- Almacenamiento: el artefacto ocupa 2,50 GiB, sensiblemente más que una exportación en FP16 del mismo modelo (aproximadamente 1,2 GB) o una cuantización INT4 (aproximadamente 0,5 GB), precisamente por conservar grafos float.
- Memoria en dispositivo: no medida. Como estimación orientativa, un contenedor de pesos float de 0,6B exige del orden de 2,5 a 3 GB de RAM libre entre pesos, activaciones y caché KV de 1280 tokens.
- SoC: la ruta AOT está fijada a Qualcomm SM8650. La compilación no garantiza compatibilidad con todos los teléfonos ni con todas las versiones de firmware que montan ese SoC.
- GPU de escritorio: este formato no está pensado para A100, H100 ni RTX 4090; no hay ruta de ejecución documentada en esas plataformas.
- Opciones de despliegue: exclusivamente un runtime LiteRT-LM compatible con el backend Qualcomm. No es ejecutable directamente con vLLM, llama.cpp, Ollama ni TGI sin una conversión previa a otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Este paquete (macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Float) | 0,6B | Prefill 128 / caché 1280 en el artefacto | Ninguna (float) | Apache 2.0 | `.litertlm` |
| Qwen/Qwen3-0.6B original | 0,6B | 32 768 según documentación pública del modelo base | BF16/FP16 | Apache 2.0 | safetensors |
| Exportaciones GGUF de la comunidad para Qwen3-0.6B | 0,6B | 32 768 según documentación pública del modelo base | Q4_K_M, Q8_0, etc. | Apache 2.0 | GGUF |

Nota: los datos de las dos filas alternativas provienen de la documentación pública del modelo base y de convenciones de la comunidad, no de la información proporcionada en este repositorio, por lo que no se han podido verificar aquí. No se dispone de cifras de rendimiento comparadas para ninguna de las tres opciones.

## Limitaciones y advertencias

- **Sin validación en hardware real**: no se ha ejecutado inferencia sobre un SM8650 físico. Cualquier afirmación de rendimiento o de calidad sería especulativa.
- **Compatibilidad frágil**: la compilación AOT para un SoC concreto no implica funcionamiento en todos los dispositivos que lo montan; depende del firmware y de la versión del runtime LiteRT-LM.
- **Precisión no garantizada internamente**: aunque los grafos exportados sean float, el compilador de Qualcomm puede introducir precisiones distintas de FP32 sin documentarlo, lo que dificulta auditar la fidelidad numérica.
- **Tamaño elevado para móvil**: 2,50 GiB de artefacto sin cuantizar es un coste considerable en almacenamiento y RAM para un modelo de 0,6B; una cuantización INT4 reduciría el peso aproximadamente a una quinta parte.
- **Ventana efectiva limitada**: con prefill de 128 y caché de 1280 tokens, el paquete no está pensado para contextos largos, muy por debajo de la ventana nativa del modelo base.
- **Riesgo de alucinación**: inherente a un modelo de 0,6B; no hay evaluación publicada que acote su tasa de error en ninguna tarea.
- **Sesgos**: no hay información sobre evaluación de sesgos en la documentación de este repositorio.
- **Licencia**: Apache 2.0 permite uso comercial, pero obliga a conservar avisos de copyright y licencia, y a indicar cambios. El autor declara que la licencia original se incluye en el paquete.
- **Adopción nula**: cero descargas y cero *likes* en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Float
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión concreta del modelo base usada en la exportación: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
- Paquete LiteRT-LM completo (formato relacionado citado en la model card): https://huggingface.co/macunaima/Qwen3-0.6B-SM8650-LiteRT-LM-Float

No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) relacionados con este modelo; los resultados devueltos no guardan relación con el contenido de la ficha.
