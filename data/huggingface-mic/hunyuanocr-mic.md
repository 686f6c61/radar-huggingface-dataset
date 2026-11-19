# huggingface-mic/HunyuanOCR-mic

## Resumen

HunyuanOCR-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable, sino de un *fixture* (modelo reducido de forma artificial) construido a partir de `tencent/HunyuanOCR` para validar la integración de esa arquitectura en el ecosistema de Transformers. El repositorio incluye pesos reducidos, un contrato de integración (`integration.json`), ejemplos de uso ejecutables y un directorio de expectativas de framework.

El modelo conserva la arquitectura `HunYuanVLForConditionalGeneration` del checkpoint original, pero con una configuración drásticamente reducida: 2 capas en el codificador de texto y 2 capas en el codificador visual, lo que da un total de 9.054.208 parámetros. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (tokenizer, chat template, preprocessor config) se copian byte a byte desde `tencent/HunyuanOCR`.

Su relevancia es exclusivamente técnica y de infraestructura: sirve como banco de pruebas para verificar que la implementación de referencia de Transformers carga, ejecuta y propaga gradientes correctamente para la familia HunyuanOCR, sin necesidad de descargar ni ejecutar el modelo real de Tencent. La etiqueta `test-artifact` lo excluye explícitamente de las búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HunYuanVLForConditionalGeneration (transformer multimodal texto+vision) |
| Parametros totales | 9.054.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la misma que la del modelo base `tencent/HunyuanOCR`: `HunYuanVLForConditionalGeneration`, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje para tareas de parsing de documentos y OCR. En este fixture, la configuración se ha reducido mediante la regla genérica de `sweep.py` del proyecto `transformers-mic`: `num_hidden_layers` de texto = 2 y `num_hidden_layers` de visión = 2.

No hubo entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se validan mediante una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato debe mover los logits al menos 0,001 (la perturbación más débil, `pixel_values:halve`, produjo 0,0332). Los tensores conservan exactamente los mismos nombres que el checkpoint real, lo que permite usarlo como sustituto en pruebas de integración. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes.

## Capacidades

- Carga y ejecución de la arquitectura `HunYuanVLForConditionalGeneration` en Transformers.
- Verificación de contratos de integración: manifiesto `integration.json` y directorio `integrations/transformers/expectations`.
- Pruebas de sensibilidad de entradas multimodales (texto e imagen) mediante perturbaciones controladas.
- Validación de propagación de gradientes y estabilidad numérica en float32, bfloat16 y float16.
- Sustituto ligero del checkpoint real para CI/CD sin descargar pesos completos.
- No soporta generación de texto útil, razonamiento, código, matemáticas, tool calling ni capacidades multilingües reales, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integración en Transformers: usar el fixture para verificar que una nueva versión de la librería carga y ejecuta correctamente la arquitectura HunyuanOCR sin depender del checkpoint real de Tencent.
- CI/CD de pipelines de OCR: incorporar el fixture en tests automáticos que validen el contrato de entrada/salida (preprocesado de imágenes, tokenización, formas de tensores) antes de desplegar el modelo real.
- Desarrollo de herramientas de inspección de modelos: comparar nombres de tensores y estructura de configuración entre el fixture y el checkpoint original para detectar regresiones.
- Validación de cuantizaciones y dtypes: comprobar que la implementación es numéricamente finita en float32, bfloat16 y float16 antes de aplicar técnicas de compresión al modelo real.
- Reproducción de experimentos de reducción de modelos: el repositorio documenta el proceso de *shrink* mediante `sweep.py`, útil para investigar técnicas de poda estructural.
- Formación y documentación: servir como ejemplo didáctico de cómo se construye un fixture de integración con contrato explícito y procedencia reproducible (`build.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios y sin entrenamiento, no procede evaluar rendimiento en tareas de OCR o generación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (9,05 M de parámetros, aproximadamente 18 MB de pesos, más overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de entornos CPU.
- Opciones de despliegue: Transformers con `HunYuanVLForConditionalGeneration`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia sería mínima, pero sin valor práctico al no estar entrenado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Proposito |
|---|---|---|---|---|---|
| HunyuanOCR-mic | 9,05 M | no disponible | No (pesos aleatorios) | no disponible | Fixture de integracion |
| tencent/HunyuanOCR | no disponible | no disponible | Si | no disponible | OCR y parsing de documentos |
| Otros fixtures `transformers-mic` | variable (reducidos) | no disponible | No | segun modelo base | Pruebas de integracion |

La comparación relevante es con el modelo base `tencent/HunyuanOCR`, del que este fixture hereda arquitectura, procesador y nombres de tensores, pero no pesos ni capacidades funcionales.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no han sido entrenados; cualquier salida carece de significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está disponible en la información proporcionada; el fichero LICENSE se copia del modelo base, por lo que las restricciones reales dependen de `tencent/HunyuanOCR`.
- La longitud de contexto, los idiomas soportados y los tipos de cuantización no están documentados.
- Riesgo de confusión: el nombre puede llevar a pensar que es una versión funcional de HunyuanOCR; conviene revisar siempre la etiqueta `test-artifact`.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinación, al no ser aplicables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/HunyuanOCR-mic
- Modelo base: https://huggingface.co/tencent/HunyuanOCR
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/HunyuanOCR-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
