# huggingface-mic/language-perceiver-mic

## Resumen

`language-perceiver-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable en producción: es una versión reducida artificialmente del modelo `deepmind/language-perceiver` de DeepMind, con solo 421.638 parámetros (frente a los cientos de millones del original) y pesos aleatorios generados con semilla 17. Su propósito es servir como fixture de integración para validar contratos de framework (Transformers) sin necesidad de descargar el checkpoint real.

El repositorio incluye los pesos "slim", un manifiesto de contrato (`integration.json`), documentación de uso para Transformers y un directorio de expectativas de framework. La arquitectura subyacente es `PerceiverForMaskedLM`, un transformer con mecanismo de atención cruzada sobre un array latente de tamaño fijo, pero con una configuración encogida mediante la regla genérica de `sweep.py` del proyecto `transformers-mic`.

La relevancia de esta ficha es fundamentalmente metodológica: ilustra cómo se construyen fixtures de prueba que preservan la interfaz (nombres de tensores, ficheros de procesador copiados byte a byte) de un modelo real, permitiendo testear pipelines de integración de forma barata. Cualquier evaluación de capacidades, benchmarks o uso práctico carece de sentido para este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (PerceiverForMaskedLM), transformer con atención latente |
| Parametros totales | 421.638 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es `PerceiverForMaskedLM`, la variante de modelado de lenguaje enmascarado del Perceiver de DeepMind. El Perceiver original emplea un array latente de tamaño fijo sobre el que se aplica atención cruzada iterativa para procesar entradas de cualquier modalidad y longitud, evitando el coste cuadrático de la atención sobre la secuencia de entrada. En esta fixture, la configuración ha sido reducida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, preservando la estructura de tensores pero con dimensiones mucho menores.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,013). Los ficheros de procesador (`special_tokens_map.json`, `tokenizer_config.json`) se copiaron byte a byte desde `deepmind/language-perceiver`. Los nombres de tensores coinciden con el checkpoint real, y los pesos se guardaron en float32, el dtype por defecto del modelo original.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas lingüísticamente significativas.
- Conserva la interfaz de `PerceiverForMaskedLM`: acepta entradas de modelado de lenguaje enmascarado y devuelve logits con la misma forma que el modelo real.
- Sirve como fixture de integración para validar contratos de framework (Transformers) y expectativas de entrada/salida.
- Verificado finito en float32, bfloat16 y float16 (forward, loss y gradientes).
- No dispone de tool calling, capacidades de agente, multilingüismo ni modos de razonamiento.
- No soporta visión, audio ni ninguna modalidad adicional en esta configuración.

## Casos de uso

- Pruebas de integración en CI/CD: validar que un pipeline de Transformers carga, ejecuta forward y calcula gradientes con un checkpoint de la familia Perceiver sin descargar el modelo real, gracias a su tamaño de 0,8 GB y 0,4M de parámetros.
- Desarrollo de contratos de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen (formas de tensores, dtypes, nombres de parámetros) antes de integrar el modelo real.
- Test de compatibilidad de dtypes: verificar que el código de inferencia y entrenamiento funciona en float32, bfloat16 y float16 sin producir NaN ni inf.
- Validación de tokenizadores y procesadores: al copiar los ficheros de procesador byte a byte del modelo original, permite testear pipelines de preprocesado con el tokenizador real.
- Reproducción de fixtures: servir como referencia para construir fixtures similares de otros modelos siguiendo `build_fixtures.py` y `sweep.py`.
- Docencia y ejemplos: ilustrar la estructura interna de un Perceiver sin coste computacional ni de descarga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad sería meaningless.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (0,4M de parámetros); el repo ocupa 0,8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) o incluso CPU.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga nativa vía `PerceiverForMaskedLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; por el tamaño, el forward es prácticamente instantáneo en cualquier hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| language-perceiver-mic | 421.638 | no disponible | Fixture de test | no disponible | Hugging Face |
| deepmind/language-perceiver | no disponible en la informacion | no disponible | Modelo real de MLM multimodal | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparación relevante es con el modelo base `deepmind/language-perceiver`, del que este artefacto es una versión encogida con pesos aleatorios y misma interfaz de tensores. No se dispone de datos de parámetros ni contexto del modelo original en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen valor semántico.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Sin licencia declarada: no se puede asumir permiso de uso comercial ni redistribución más allá del propósito de test.
- Sin idiomas declarados ni contexto documentado.
- No se han publicado benchmarks ni evaluaciones de calidad.
- La configuración encogida no refleja el comportamiento del Perceiver original; las conclusiones extraídas de esta fixture no son extrapolables al modelo real.
- El repositorio depende de scripts externos (`build_fixtures.py`) para regenerar ficheros auxiliares; la reproducibilidad requiere acceso a esos scripts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/language-perceiver-mic
- Modelo base: https://huggingface.co/deepmind/language-perceiver
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Documentación del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/language-perceiver-mic.html
