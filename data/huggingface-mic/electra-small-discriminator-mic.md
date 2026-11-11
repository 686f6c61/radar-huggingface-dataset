# huggingface-mic/electra-small-discriminator-mic

## Resumen
`huggingface-mic/electra-small-discriminator-mic` es un artefacto de prueba (fixture) derivado del modelo `google/electra-small-discriminator`. No es un modelo entrenado para uso real: se trata de un repositorio que empaqueta los pesos del checkpoint original de ELECTRA small (13,5 millones de parámetros) junto con su tokenizador, un manifiesto de contrato (`integration.json`) y un directorio de expectativas de framework, pensado para validar integraciones de transformers.

El modelo subyacente, ELECTRA, es una arquitectura de tipo transformer encoder entrenada con detección de tokens sustituidos (replaced token detection): un discriminador aprende a distinguir tokens reales de tokens generados por un generador, lo que resulta más eficiente en muestras que el enmascaramiento clásico de BERT. En este caso concreto, el checkpoint es el discriminador de la variante small, con 13,5 M de parámetros y pesos guardados en float32.

Su relevancia es limitada al ámbito de pruebas e integración: el propio autor lo etiqueta como `test-artifact` para excluirlo de la búsqueda de modelos candidatos. No debe confundirse con el modelo ELECTRA small original, que sí es utilizable para tareas de NLP como clasificación o token classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ELECTRA discriminator, `ElectraForPreTraining`) |
| Parametros totales | 13.549.057 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento
El checkpoint base es `google/electra-small-discriminator`, un transformer encoder de tipo discriminator dentro del framework ELECTRA. ELECTRA entrena dos redes: un generador pequeño que sustituye tokens enmascarados y un discriminador que clasifica cada token como real o sustituido; el discriminador resultante se usa como encoder preentrenado. En la variante small, el modelo tiene 12 capas, dimensión oculta de 256 y 4 cabezas de atención, lo que arroja los 13,5 M de parámetros documentados en el repositorio.

Este repositorio concreto no aporta entrenamiento adicional: según la model card, conserva los pesos entrenados del checkpoint original sin cambios, copia byte a byte los ficheros del tokenizador (`tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) y mantiene los mismos nombres de tensores. Los pesos se guardan en float32, que es el dtype por defecto con el que carga `google/electra-small-discriminator`, y se declaran finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Incluye además un manifiesto de contrato y expectativas de framework para pruebas de integración.

## Capacidades
- Detección de tokens sustituidos (replaced token detection), la tarea para la que se entrena el discriminador ELECTRA.
- Extracción de representaciones contextuales de tokens, reutilizables para clasificación, NER o similitud semántica mediante fine-tuning.
- Tokenización multilingüe heredada del tokenizador WordPiece de ELECTRA small (vocabulario `vocab.txt`).
- Ejecución en float32, bfloat16 y float16 con forward, loss y gradientes finitos.
- Integración verificable con transformers mediante el directorio de expectativas y el manifiesto de contrato.
- No dispone de generación de texto autoregresiva, tool calling, capacidades de agente, visión ni audio.

## Casos de uso
- Pruebas de integración en transformers: el repositorio incluye `integration.json` y `integrations/transformers/expectations`, de modo que se puede usar como fixture para validar que una versión de la librería carga, ejecuta y produce salidas conformes al contrato.
- Verificación de pipelines de CI: al ser un artefacto pequeño (0,1 GB) y con pesos deterministas, sirve para comprobar regresiones en carga de safetensors, tokenización y forward pass sin coste de infraestructura.
- Validación de dtype y estabilidad numérica: permite comprobar que forward, loss y gradientes siguen siendo finitos al cambiar entre float32, bfloat16 y float16.
- Pruebas de tokenización: al copiar byte a byte los ficheros del tokenizador de ELECTRA small, se puede usar para verificar la paridad del tokenizador en distintas versiones de la librería.
- Base para experimentos de clasificación de tokens: los pesos del discriminador ELECTRA small son reutilizables como encoder para fine-tuning de NER o clasificación de secuencias en entornos de prueba.
- Referencia de compatibilidad de nombres de tensores: al conservar los mismos nombres que el checkpoint real, sirve para validar herramientas de conversión y mapeo de pesos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en float32 (13,5 M de parámetros, unos 54 MB de pesos); menos aún en bfloat16 o float16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; también funciona en CPU.
- Cabe holgadamente en cualquier GPU consumer e incluso en dispositivos de gama baja.
- Opciones de despliegue: transformers con `ElectraForPreTraining`; llama.cpp u Ollama no están indicados porque el repositorio no publica pesos GGUF.
- Latencia y throughput: no disponibles; por el tamaño del modelo, la latencia será de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/electra-small-discriminator-mic | 13,5 M | no disponible | Fixture de pruebas para `ElectraForPreTraining` | no disponible | Hugging Face (artefacto de prueba) |
| google/electra-small-discriminator | 13,5 M | no disponible | Discriminador ELECTRA preentrenado | Apache 2.0 (según el modelo original) | Hugging Face |
| google/electra-small-generator | ~13,5 M | no disponible | Generador ELECTRA para preentrenamiento | Apache 2.0 (según el modelo original) | Hugging Face |
| google/bert-base-uncased | 110 M | 512 | Encoder MLM | Apache 2.0 | Hugging Face |

La comparación directa con ELECTRA small original es la más relevante: comparten pesos y arquitectura, pero este repositorio es un artefacto de prueba, no un checkpoint listo para producción.

## Limitaciones y advertencias
- Es un `test-artifact`: el propio autor indica que no es un modelo utilizable y lo etiqueta para excluirlo de la búsqueda de modelos candidatos.
- No se han publicado datos de licencia, idiomas ni pipeline en la información disponible; no debe asumirse uso comercial sin verificar la licencia del modelo base.
- No dispone de generación de texto, tool calling ni capacidades de agente; su uso se limita a detección de tokens y extracción de representaciones.
- La longitud de contexto no está documentada en la información proporcionada.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de resultados engañosos si se usa como sustituto del checkpoint original en producción.
- No se publican pesos GGUF ni cuantizaciones, lo que limita el despliegue en llama.cpp u Ollama.
- El repositorio incluiye solo pesos reducidos, uso y expectativas de framework; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces
- [huggingface-mic/electra-small-discriminator-mic](https://huggingface.co/huggingface-mic/electra-small-discriminator-mic)
- [google/electra-small-discriminator](https://huggingface.co/google/electra-small-discriminator)
- [integration.json](https://huggingface.co/huggingface-mic/electra-small-discriminator-mic/blob/main/integration.json)
- [integrations/transformers/usage.md](https://huggingface.co/huggingface-mic/electra-small-discriminator-mic/blob/main/integrations/transformers/usage.md)
- [integrations/transformers/expectations](https://huggingface.co/huggingface-mic/electra-small-discriminator-mic/tree/main/integrations/transformers/expectations)
- [build.json](https://huggingface.co/huggingface-mic/electra-small-discriminator-mic/blob/main/build.json)
- [How the fixture was shrunk](https://huggingface-mic-mic-coverage.static.hf.space/shrink/electra-small-discriminator-mic.html)
- [build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
