# huggingface-mic/granite-vision-4.1-4b-mic

## Resumen

`granite-vision-4.1-4b-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic`, no un modelo utilizable. Se trata de una versión reducida ("slim") del modelo multimodal `ibm-granite/granite-vision-4.1-4b` de IBM, con solo 7.161.408 parámetros totales frente a los aproximadamente 4.000 millones del modelo original. Su propósito es servir como fixture de integración para validar contratos de frameworks (concretamente Transformers) sin necesidad de descargar ni ejecutar los pesos completos.

El repositorio incluye pesos reducidos, uso ejecutable y expectativas de framework en un único paquete. Los pesos son aleatorios (semilla 17) y no han sido entrenados: el autor indica explícitamente que "no es un modelo usable" y lo etiqueta con `test-artifact` para excluirlo de búsquedas de modelos candidatos. La arquitectura declarada es `Granite4VisionForConditionalGeneration`, la misma que el modelo base, pero con configuración reducida (2 capas ocultas en visión, 2 en texto, 1 en qformer).

Su relevancia es acotada: interesa a desarrolladores que mantienen integraciones de Transformers y quieren verificar que el pipeline de `image-text-to-text` de Granite Vision funciona correctamente (nombres de tensores, procesador, plantilla de chat) con un artefacto ligero y determinista. No debe confundirse con el modelo real de IBM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Granite4VisionForConditionalGeneration` (transformer multimodal visión-texto, configuración reducida) |
| Parámetros totales | 7.161.408 (fixture reducido; el modelo base tiene ~4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `ibm-granite/granite-vision-4.1-4b`: un transformer multimodal con torre de visión, proyección qformer y torre de texto, empaquetado bajo la clase `Granite4VisionForConditionalGeneration`. Para reducir el tamaño, el autor aplicó una regla genérica de "shrink" (visible en `sweep.py` del repositorio `transformers-mic`) que recorta el número de capas ocultas: 2 en el codificador de visión, 2 en el decodificador de texto y 1 en el qformer. Los nombres de tensores coinciden exactamente con los del checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0.001 (la más débil, `pixel_values:halve`, con 0.135). Los ficheros del procesador (tokenizer, `chat_template.jinja`, `preprocessor_config.json`, `processing.py`, `configuration.py`, `modeling.py`, `downsampling.py`, imágenes de benchmark) se copiaron byte a byte desde el modelo base. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: no genera texto ni respuestas coherentes, ya que sus pesos son aleatorios.
- Sirve como fixture de integración para validar el pipeline `image-text-to-text` de Transformers con la arquitectura Granite Vision.
- Permite verificar la compatibilidad de nombres de tensores, configuración y procesador con el checkpoint real.
- Ejercita el procesador multimodal (tokenizer, plantilla de chat, preprocesado de imagen) copiado del modelo base.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingües reales por carecer de entrenamiento.
- Útil para tests de humo (smoke tests) en CI de integraciones de framework.

## Casos de uso

- Tests de integración en Transformers: cargar el fixture y ejecutar un forward con `pixel_values` e `input_ids` para comprobar que la clase `Granite4VisionForConditionalGeneration` y el procesador funcionan sin descargar los ~4B parámetros del modelo real.
- Validación de contratos de framework: el repositorio incluye `integration.json` y `integrations/transformers/expectations`, de modo que un CI puede comparar las salidas esperadas contra las obtenidas con el fixture.
- Desarrollo de pipelines multimodales: probar la orquestación de preprocesado de imagen + tokenización + generación con un artefacto ligero antes de pasar al modelo completo.
- Verificación de compatibilidad de versiones: comprobar que una nueva versión de Transformers sigue cargando correctamente la arquitectura Granite Vision y sus ficheros de procesador.
- Reproducibilidad de fixtures: el `build.json` registra fuentes fijadas, resultados de la gate y hashes de ficheros, lo que permite reconstruir el artefacto con `build_fixtures.py`.
- Depuración de errores de carga: aislar problemas de `config.json`, `processor_config.json` o `chat_template.jinja` sin la sobrecarga de memoria del modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de calidad porque los pesos son aleatorios y el artefacto no está pensado para evaluación de rendimiento.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (7.2M parámetros), apto para cualquier GPU consumer e incluso CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: Transformers (con `trust_remote_code=True` por el tag `custom_code`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| `granite-vision-4.1-4b-mic` (este) | 7.161.408 | no disponible | no disponible | Fixture de test |
| `ibm-granite/granite-vision-4.1-4b` | ~4B | no disponible en la información | no disponible en la información | Modelo multimodal real |
| Otros fixtures `*-mic` de huggingface-mic | variable (reducidos) | no disponible | no disponible | Fixtures de integración |

La comparación relevante es con el modelo base: este fixture replica su arquitectura y procesador con pesos aleatorios y un tamaño ~560 veces menor, pero no comparte sus capacidades. Frente a otros fixtures de la misma organización, comparte el mismo propósito de validación de contratos.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas no tienen significado semántico.
- Etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede asumir uso comercial.
- Idiomas y contexto no documentados.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar código del repositorio.
- El tamaño del repo reportado es 0.0 GB, lo que puede indicar que los pesos no están incluidos o que el reporte está redondeado; conviene verificar antes de usarlo.
- No sustituye al modelo base para evaluación de calidad, benchmarks ni tareas reales de visión-texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/granite-vision-4.1-4b-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-vision-4.1-4b
- Explicación del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-vision-4.1-4b-mic.html
- Repositorio de código `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
