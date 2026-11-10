# huggingface-mic/Qwen3-VL-2B-Instruct-mic

## Resumen

Qwen3-VL-2B-Instruct-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic. No se trata de un modelo entrenado ni utilizable en producción: es una version reducida artificialmente del modelo Qwen/Qwen3-VL-2B-Instruct, generada para validar contratos de integración con frameworks (principalmente Transformers). El propio autor lo etiqueta como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El fixture conserva la arquitectura `Qwen3VLForConditionalGeneration` pero con una configuración drásticamente reducida: solo 2 capas ocultas en el componente de texto, lo que resulta en 11.177.792 parámetros totales (frente a los aproximadamente 2.000 millones del modelo base). Los pesos son aleatorios (semilla 17) y no han sido entrenados; únicamente pasaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001.

Su relevancia es exclusivamente técnica para el desarrollo de infraestructura: permite ejecutar inferencia visión-lenguaje y un paso de entrenamiento con un coste computacional mínimo, verificando que las expectativas de Transformers (nombres de tensores, procesadores, dtypes) se cumplen sin necesidad de descargar el checkpoint real. No debe confundirse con un modelo funcional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (transformer multimodal visión-lenguaje, config reducida) |
| Parametros totales | 11.177.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base Qwen3-VL-2B-Instruct no se detalla en la información) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base Qwen3-VL-2B-Instruct (`Qwen3VLForConditionalGeneration`), un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje. La reducción se aplica mediante la regla genérica de `sweep.py`, que disminuye el número de capas ocultas del componente de texto a 2. Los ficheros de procesador (`chat_template.json`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `tokenizer.json`, `tokenizer_config.json`, `video_preprocessor_config.json`, `vocab.json`) se copian byte a byte desde el checkpoint original, de modo que el pipeline de tokenización y preprocesado es idéntico al real.

No hubo entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato debe desplazar los logits al menos 0,001 (la más débil, `pixel_values:halve`, produce 0,159). Los nombres de tensores coinciden exactamente con los del checkpoint real, y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. El identificador de fixture es `d0facf3ee949`.

## Capacidades

- Ejecución de inferencia visión-lenguaje con la misma interfaz de procesador que Qwen3-VL-2B-Instruct.
- Ejecución de un paso de entrenamiento (forward, loss y backward) con gradientes finitos.
- Validación de contratos de integración con Transformers: nombres de tensores, dtypes y ficheros de preprocesado.
- Soporte de los mismos modos de entrada que el modelo base a nivel de procesador (texto, imagen y vídeo según `video_preprocessor_config.json`).
- No dispone de capacidades cognitivas reales: al tener pesos aleatorios, no genera texto ni respuestas coherentes.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso utilizable.

## Casos de uso

- Pruebas de integración en Transformers: verificar que la clase `Qwen3VLForConditionalGeneration` carga, ejecuta forward y calcula gradientes con la configuración esperada, sin descargar el checkpoint de 2B.
- CI/CD de librerías de inferencia: ejecutar tests de humo de pipeline visión-lenguaje en minutos y con requisitos mínimos de memoria.
- Validación de contratos de tokenizer y procesador: comprobar que los ficheros copiados byte a byte producen las mismas secuencias de tokens y tensores de píxeles que el modelo real.
- Desarrollo de herramientas de "shrink" de modelos: servir como caso de referencia del proceso de reducción descrito en `sweep.py` y `build_fixtures.py`.
- Pruebas de compatibilidad de dtypes: validar que un framework maneja correctamente float32, bfloat16 y float16 con el mismo grafo.
- Regresión de nombres de tensores: detectar cambios de API en Transformers comparando los nombres de parámetros del fixture con los del checkpoint original.
- Docencia y demos de arquitecturas multimodales: ilustrar la estructura de un modelo visión-lenguaje con un coste de ejecución despreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (11,2 M de parámetros); en la práctica, unos pocos cientos de MB incluyendo activaciones y buffers del procesador.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también funciona en CPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto según `integrations/transformers/usage.md`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo diminuto, la latencia estará dominada por el preprocesado de imagen y el overhead del framework.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct-mic | 11,2 M | no disponible | Fixture de test | no disponible | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | ~2.000 M (modelo base) | no disponible en la informacion | Modelo visión-lenguaje real | no disponible en la informacion | Hugging Face |
| Otros fixtures `*-mic` de huggingface-mic | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas funcionales.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- Etiquetado explícitamente como `test-artifact`; no debe incluirse en catálogos de modelos candidatos ni en evaluaciones de calidad.
- La configuración reducida (2 capas de texto) altera profundamente el comportamiento respecto al modelo base; no sirve para medir capacidades del original.
- Licencia no especificada: no hay garantías para uso comercial ni redistribución más allá de lo que permita el modelo base.
- Idiomas no documentados; el tokenizer se hereda del base, pero no se garantiza ningún comportamiento lingüístico.
- Riesgo de confusión: el nombre incluye "Qwen3-VL-2B-Instruct" pero el tamaño real es de 11,2 M de parámetros.
- No se documentan sesgos, alucinaciones ni limitaciones de contexto porque no aplica a un artefacto de prueba.

## Enlaces

- [Hugging Face: huggingface-mic/Qwen3-VL-2B-Instruct-mic](https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic)
- [Modelo base: Qwen/Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct)
- [Explicación del proceso de shrink](https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-VL-2B-Instruct-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Manifiesto de contrato (integration.json)](https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/blob/main/integration.json)
- [Uso con Transformers](https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/blob/main/integrations/transformers/usage.md)
- [Expectativas de Transformers](https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/tree/main/integrations/transformers/expectations)
- [Procedencia del fixture (build.json)](https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/blob/main/build.json)
