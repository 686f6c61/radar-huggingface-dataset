# nm-testing/GLM-4.5-Air-0.72B-MTP

## Resumen

GLM-4.5-Air-0.72B-MTP es un checkpoint de prueba publicado por el usuario nm-testing bajo arquitectura `glm4_moe`. No es un modelo entrenado para producción: la propia model card lo describe como un modelo BF16 pequeno construido a partir de [zai-org/GLM-4.5-Air](https://huggingface.co/zai-org/GLM-4.5-Air), con un backbone entrenado de forma simbolica ("toy-trained backbone") y pesos MTP (multi-token prediction) sinteticos. Cuenta con 718.663.536 parametros totales y un repositorio de 1,5 GB en safetensors.

Su proposito es servir de fixture de test para el flujo de cuantizacion de LLM Compressor, en concreto para validar la pull request #3225 y la carga de las capas MTP en la clase `Glm4MoeForCausalLM`. La model card incluye una receta reproducible con `QuantizationModifier` que aplica FP8 dinamico al backbone y a las capas `mtp.layers.*`, ignorando `lm_head`, `eh_proj` e `indexer`.

Es relevante unicamente en el contexto de ingenieria de inferencia y cuantizacion: permite comprobar de forma rapida y con pocos recursos que las herramientas (Transformers 5.17.0, llm-compressor, integraciones tipo vLLM) cargan y cuantizan correctamente un modelo MoE con MTP. No debe emplearse como sustituto de GLM-4.5-Air ni en cargas de trabajo reales de generacion, dado su entrenamiento no funcional. Licencia MIT y cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo GLM-4 (`glm4_moe`), con modulo MTP (multi-token prediction) |
| Parametros totales | 718.663.536 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en BF16; la receta documentada genera FP8_DYNAMIC (backbone y `mtp.layers.*`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), compatible con `transformers` |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura `glm4_moe` de la familia GLM-4.5, es decir, un transformer con capas de mezcla de expertos (MoE), al que se anade un modulo de prediccion multi-token (MTP) con capas propias (`mtp.layers.*`). La carga requiere invocar `Glm4MoeForCausalLM` con el parametro `load_mtp=True`, tal y como muestra la receta de la model card.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card indica explicitamente que el backbone fue "toy-trained" (entrenado de forma de juguete) y que los pesos MTP son sinteticos, por lo que el modelo no ha recibido un entrenamiento funcional orientado a tareas reales. La innovacion relevante aqui no es la del modelo en si, sino la validacion del pipeline de cuantizacion de LLM Compressor PR #3225: FP8 dinamico por grupos de configuracion, con exclusiones sobre `lm_head`, `eh_proj` e `indexer`, y soporte de Transformers 5.17.0.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y el tag `conversational` indica plantilla de chat, pero al ser un modelo de prueba sin entrenamiento real, la calidad de generacion no es utilizable.
- Carga de modulos MTP: capacidad tecnica destacable, permite probar rutas de codigo que cargan cabezas de prediccion multi-token.
- Cuantizacion: sirve como sujeto de prueba para recetas FP8 dinamicas con `llm-compressor` y `compressed-tensors`.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision, audio u otras modalidades: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia gestionadas, aunque no se detalla el alcance.

## Casos de uso

- Validacion de cuantizacion en CI: ejecutar la receta `QuantizationModifier` con FP8_DYNAMIC sobre este checkpoint dentro de un pipeline de integracion continua para verificar que los cambios en llm-compressor no rompen la cuantizacion de modelos MoE con MTP.
- Prueba de regresion de la PR #3225: reproducir el flujo documentado (`load_context`, `oneshot`, `save_pretrained`) para confirmar que la PR corrige o habilita el comportamiento esperado antes de aplicarla a modelos de mayor tamano.
- Verificacion de carga de MTP en Transformers: comprobar que `Glm4MoeForCausalLM` con `load_mtp=True` inicializa correctamente las capas `mtp.layers.*` en distintas versiones de la libreria.
- Test de integracion con motores de inferencia: desplegar el checkpoint en vLLM u otros motores compatibles para validar el parseo de configuracion, la carga de safetensors y el sharding sin consumir recursos de GPU significativos.
- Suite de pruebas de tokenizer y plantilla de chat: usar el tokenizer asociado para validar formateo de conversaciones y flujos de mensajes en entornos de desarrollo.
- Benchmarking de infraestructura: emplearlo como carga sintetica de ~0,72B parametros para medir tiempos de carga, latencia de arranque y throughput del runtime sin depender de modelos grandes.
- Docencia y demos de arquitectura MoE+MTP: inspeccionar la estructura de pesos para explicar como se organizan los expertos y el modulo de prediccion multi-token en un modelo de un solo fichero manejable.
- Pruebas de memoria en hardware modesto: validar que un flujo de cuantizacion FP8 completa en GPU de gama consumer o incluso en CPU con `device_map="cpu"`, como aparece en la receta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ademas, al tratarse de un modelo de prueba con backbone entrenado de forma simbolica y pesos MTP sinteticos, cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) careceria de significado.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 1,4-1,5 GB solo para pesos (718,7 M de parametros x 2 bytes), mas overhead de activaciones y cache KV. Estimacion propia, no publicada por el autor.
- VRAM estimada en FP8: aproximadamente 0,7-0,8 GB para pesos mas overhead. Estimacion propia.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en la practica; una RTX 3060, RTX 4060, RTX 4090 o superior funciona sin problema. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: la propia receta del autor carga el modelo con `device_map="cpu"` y despues lo mueve a CUDA mediante `set_onload_device`, lo que confirma viabilidad en CPU.
- Opciones de despliegue: `transformers` (referencia principal), `llm-compressor` para cuantizacion, `compressed-tensors` para los checkpoints cuantizados. Compatibilidad con vLLM, llama.cpp u Ollama no esta documentada; el formato publicado es safetensors, no GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada solo menciona el modelo base zai-org/GLM-4.5-Air, del que no se detallan especificaciones (parametros, contexto, licencia ni resultados) mas alla de ser el origen de este checkpoint. No se dispone de datos verificables para comparar con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| nm-testing/GLM-4.5-Air-0.72B-MTP | 718,7 M | no disponible | MIT | Fixture de test para cuantizacion y carga de MTP |
| zai-org/GLM-4.5-Air (modelo base) | no disponible | no disponible | no disponible | Modelo de referencia del que deriva este checkpoint |
| Alternativas de ~0,7B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion facilitada |

## Limitaciones y advertencias

- No es un modelo funcional: el backbone esta entrenado de forma simbolica y los pesos MTP son sinteticos. Las salidas no deben interpretarse como respuestas utiles ni verificadas.
- Riesgo de alucinacion: total. Al no haber entrenamiento real, la generacion de texto es esencialmente ruido y no debe usarse para tomar decisiones.
- Sesgos: no se han documentado evaluaciones de sesgo y no tiene sentido realizarlas sobre un checkpoint sin entrenamiento funcional.
- Idioma: no se declara cobertura idiomatica; el tokenizer se hereda del modelo base, pero no hay garantia de comportamiento.
- Contexto: no se documenta la longitud de contexto soportada; no asumir la del modelo base sin verificacion.
- Licencia: MIT, permite uso comercial, modificacion y redistribucion con atribucion. No obstante, la licencia permisiva no convierte el modelo en apto para produccion.
- Cero adopcion: 0 descargas y 0 "likes" en el momento de redactar la ficha, coherente con su naturaleza de artefacto interno de pruebas.
- Fecha de publicacion inusual: el repositorio figura como creado y actualizado el 2026-10-15, dato a verificar si se necesita trazabilidad.
- Versionado de dependencias: la receta exige Transformers 5.17.0 y una PR concreta de llm-compressor; reproducirla en otras versiones puede fallar.
- Uso en produccion: desaconsejado de forma explicita. Para tareas reales debe utilizarse el modelo base zai-org/GLM-4.5-Air o un modelo entrenado equivalente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nm-testing/GLM-4.5-Air-0.72B-MTP
- Modelo base: https://huggingface.co/zai-org/GLM-4.5-Air
- Pull request de referencia en LLM Compressor: https://github.com/vllm-project/llm-compressor/pull/3225
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas sobre el nanometro y el newton metro, sin relacion con el contenido de esta ficha.
