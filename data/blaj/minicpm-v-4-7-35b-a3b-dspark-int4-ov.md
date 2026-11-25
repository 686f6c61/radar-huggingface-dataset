# blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int4-ov

## Resumen

MiniCPM-V-4.7-35B-A3B-DSpark-int4-ov es una exportación a OpenVINO en cuantización INT4 del modelo borrador (draft) MiniCPM-V-4.7-35B-A3B-DSpark, publicado por el usuario blaj a partir del checkpoint original de OpenBMB. Se trata de un artefacto de inferencia pensado para decodificación especulativa: el modelo borrador propone tokens que un modelo objetivo verifica, acelerando la generación sin cambiar el resultado final. La exportación emplea el exportador estándar de Optimum para OpenVINO y verifica el SHA-256 de los pesos de origen.

El modelo subyacente pertenece a la familia MiniCPM-V, con arquitectura híbrida que combina bloques de atención lineal y atención completa (17 bloques de atención lineal según la model card), y una estructura de tipo Mixture of Experts con 35B parámetros totales y 3B activos (indicado por el sufijo A3B). El artefacto aquí descrito es el borrador cuantizado a INT4 asimétrico con grupo de 128 para el backbone, mientras que el componente Markov asociado se mantiene en FP16.

La relevancia de esta ficha es doble: por un lado documenta un caso de despliegue de decodificación especulativa en hardware Intel mediante OpenVINO; por otro, advierte de que se trata de un artefacto de nicho, sin descargas ni validación comunitaria, y cuya model card reconoce explícitamente la ausencia de comparativas de velocidad frente al modelo objetivo y de pruebas de inferencia de imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con bloques de atención lineal (17 bloques) y atención completa; estructura MoE en el modelo base; componente Markov en FP16 |
| Parámetros totales | 35B (según nomenclatura del modelo base) |
| Parámetros activos | 3B (según nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4 asimétrico grupo-128 (backbone del borrador); FP16 (componente Markov) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportación Optimum); tamaño del repo 0.4 GB |

## Arquitectura y entrenamiento

El modelo base MiniCPM-V-4.7-35B-A3B-DSpark es un modelo multimodal de la familia MiniCPM-V de OpenBMB, con una arquitectura que combina atención lineal y atención completa en un esquema híbrido, y una capa de mezcla de expertos con 35B parámetros totales y 3B activos. La variante DSpark añade un mecanismo de decodificación especulativa basado en un modelo borrador con un componente Markov complementario, y dispone de una cabeza de confianza (confidence head) que el exportador estándar de Optimum no consume, según indica la model card.

Esta exportación concreta no aporta información sobre el proceso de entrenamiento del modelo base: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La model card del artefacto se limita a describir el proceso de exportación: cuantización INT4 asimétrica con grupo de 128 para el backbone del borrador, mantenimiento del componente Markov en FP16, y verificación del hash SHA-256 de los pesos de origen respecto al checkpoint de OpenBMB.

## Capacidades

- Generación de texto como modelo borrador en decodificación especulativa: propone tokens que un modelo objetivo verifica.
- Integración con el modelo objetivo oficial OpenVINO INT4 de MiniCPM-V-4.7-35B-A3B para acelerar la inferencia.
- Soporte de atención lineal en 17 bloques, lo que reduce el coste computacional en secuencias largas.
- Estructura MoE con 3B parámetros activos, orientada a eficiencia en inferencia.
- Capacidades multimodales heredadas del modelo base MiniCPM-V (visión), si bien la model card indica que no se ejecutó inferencia de imagen en las pruebas realizadas.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes ni modo thinking para este artefacto.

## Casos de uso

- Aceleración de inferencia en producción con OpenVINO: el borrador INT4 se empareja con el modelo objetivo INT4 oficial para reducir la latencia de generación mediante decodificación especulativa, siempre que se valide la tasa de aceptación en el hardware objetivo.
- Despliegue en hardware Intel con GPU integrada o discreta: al estar exportado a OpenVINO IR, encaja en pipelines de inferencia sobre CPU y GPU Intel, donde otros formatos como GGUF o safetensors requerirían conversión adicional.
- Evaluación de decodificación especulativa en entornos de investigación: permite medir la tasa de aceptación de tokens borrador frente a un objetivo concreto, como el smoke test documentado (206 tokens aceptados a 30,8 tokens/s con 15 tokens asistente).
- Prototipado de asistentes multimodales en local: combinado con el objetivo oficial, sirve para experimentar con generación de texto asistida por un modelo de 35B en equipos con recursos limitados, aunque la inferencia de imagen no está validada en este artefacto.
- Integración en pipelines de CI/CD para pruebas de regresión de inferencia: el tamaño reducido del repo (0,4 GB) facilita su descarga y despliegue en entornos automatizados de validación.
- Benchmarking interno de cuantización INT4 grupo-128 frente a FP16: permite comparar calidad y velocidad en el mismo stack OpenVINO antes de adoptar la cuantización en producción.

## Benchmarks y rendimiento

La model card reporta un único dato de rendimiento: un smoke test nativo de GenAI GPU con KV cache paginada en FP16, 17 bloques de atención lineal y 15 tokens asistente, en el que se aceptaron 206 tokens borrador a 30,8 tokens/s. No se realizó comparativa de velocidad frente al modelo objetivo en solitario ni inferencia de imagen.

| Prueba | Configuración | Resultado |
|---|---|---|
| Smoke test GenAI GPU (texto) | FP16 paged KV, 17 bloques de atención lineal, 15 tokens asistente | 206 tokens borrador aceptados a 30,8 tokens/s |
| Comparativa frente a objetivo solo | No ejecutada | no disponible |
| Inferencia de imagen | No ejecutada | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 0,4 GB, lo que sugiere un footprint reducido para el borrador, pero el consumo real depende del modelo objetivo emparejado y de la KV cache.
- GPU recomendadas: hardware Intel compatible con OpenVINO (GPU integradas y discretas Intel); no se especifican modelos concretos en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; la exportación está orientada al stack OpenVINO, no a CUDA.
- Opciones de despliegue: OpenVINO GenAI (probado con KV cache paginada FP16); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 30,8 tokens/s en el smoke test descrito, con 206 tokens borrador aceptados; sin datos de latencia del sistema completo ni de comparación con el objetivo en solitario.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int4-ov | 35B totales / 3B activos | no disponible | Apache 2.0 | OpenVINO IR INT4 | Borrador de decodificación especulativa; 0 descargas |
| OpenVINO/MiniCPM-V-4.7-35B-A3B-int4-ov | 35B totales / 3B activos | no disponible | Apache 2.0 | OpenVINO IR INT4 | Modelo objetivo oficial con el que se empareja |
| openbmb/MiniCPM-V-4.7-35B-A3B-DSpark | 35B totales / 3B activos | no disponible | Apache 2.0 | safetensors (presumible) | Checkpoint original del borrador |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de nicho sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- La model card reconoce explícitamente que no se ejecutó comparativa de velocidad frente al modelo objetivo en solitario, por lo que la ganancia real de la decodificación especulativa no está cuantificada.
- No se probó inferencia de imagen, pese a que el modelo base es multimodal; el uso con visión no está validado en esta exportación.
- El exportador estándar no consume la cabeza de confianza del checkpoint, lo que puede afectar al comportamiento del mecanismo de borrador.
- El componente Markov se mantiene en FP16, por lo que el artefacto no es íntegramente INT4.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en la documentación disponible.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto derivado conviene verificar las condiciones del modelo base y del objetivo emparejado.
- Dependencia del stack OpenVINO: no es portable directamente a CUDA ni a otros runtimes sin conversión adicional.
- Para producción, es imprescindible validar la tasa de aceptación de tokens en el hardware y la carga concretos antes de asumir ganancias de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/blaj/MiniCPM-V-4.7-35B-A3B-DSpark-int4-ov
- Modelo base (OpenBMB): https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Checkpoint de origen referenciado: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark/tree/55249d3e69315892ca07bc956228b404f2526f9a
- Modelo objetivo oficial OpenVINO INT4: https://huggingface.co/OpenVINO/MiniCPM-V-4.7-35B-A3B-int4-ov
- Revisión del objetivo referenciada: https://huggingface.co/OpenVINO/MiniCPM-V-4.7-35B-A3B-int4-ov/tree/8b28ee2fe3a13fe38826d615579141af1c6d406a
