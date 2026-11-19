# huggingface-mic/yolos-small-mic

## Resumen

`huggingface-mic/yolos-small-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` dentro del proyecto `transformers-mic`. No es un modelo entrenado para uso real, sino una versión reducida del checkpoint `hustvl/yolos-small` (YOLOS para detección de objetos) con solo 379.744 parámetros, diseñada para validar contratos de integración con la librería Transformers sin coste computacional.

El repositorio empaqueta los pesos reducidos, un manifiesto de contrato (`integration.json`), instrucciones de uso para Transformers y las expectativas de framework asociadas. La arquitectura subyacente es `YolosForObjectDetection`, la misma que el modelo original, pero con `num_hidden_layers` reducido a 2 mediante la regla genérica de reducción de `sweep.py`. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte desde el modelo base.

Su relevancia es exclusivamente de ingeniería: permite probar pipelines de carga, inferencia y validación de contratos de Transformers con un coste mínimo, manteniendo los mismos nombres de tensores y el mismo dtype (float32) que el checkpoint real. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe confundirse con un modelo desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (YOLOS, `YolosForObjectDetection`) |
| Parametros totales | 379.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32; finito también en bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de YOLOS (`YolosForObjectDetection`), una arquitectura de detección de objetos basada en Vision Transformer que trata la detección como una tarea de predicción de secuencia sobre parches de imagen. La reducción se aplica mediante la regla genérica de `sweep.py` del proyecto `transformers-mic`, que recorta `num_hidden_layers` a 2 manteniendo la estructura de tensores idéntica a la del checkpoint original `hustvl/yolos-small`.

No hay entrenamiento en el sentido habitual: el fixture está sobreajustado al paso de entrenamiento del contrato (100 pasos) para que supere la puerta de sensibilidad a la entrada. Los pesos aleatorios fallaron esa puerta (`pixel_values:reverse` movía los logits solo 6.8e-05 frente a un umbral de 0.001), por lo que se ajustó el modelo para que responda de forma medible a perturbaciones de entrada. Los ficheros de procesador se copian byte a byte desde el modelo base y los nombres de tensores coinciden con el checkpoint real. El modelo es finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- Detección de objetos sobre imágenes (arquitectura YOLOS), aunque con calidad no representativa por el recorte de capas y el sobreajuste al contrato.
- Validación de contratos de integración con Transformers: carga de pesos, forward pass y comprobaciones de sensibilidad a la entrada.
- Verificación de nombres de tensores y compatibilidad de procesador frente a `hustvl/yolos-small`.
- Pruebas de dtype: ejecución finita en float32, bfloat16 y float16.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa ni audio.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para validar que el pipeline de carga de Transformers (`AutoModelForObjectDetection`) funciona sin descargar el checkpoint real de 30M+ parámetros.
- Validación de contratos de framework: comprobar que las expectativas definidas en `integrations/transformers/expectations` se cumplen con un coste computacional mínimo.
- Desarrollo de la herramienta `transformers-mic`: servir como caso de prueba reproducible para la regla de reducción de `sweep.py` y el script `build_fixtures.py`.
- Verificación de sensibilidad a la entrada: test automatizado que comprueba que perturbaciones como `pixel_values:reverse` mueven los logits por encima del umbral de 0.001.
- Pruebas de compatibilidad de dtype: ejecutar forward, loss y gradientes en float32, bfloat16 y float16 para detectar problemas de estabilidad numérica en el pipeline.
- Validación de ficheros de procesador: comprobar que `preprocessor_config.json` copiado byte a byte se integra correctamente con el modelo reducido.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture yolos-small-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que es un artefacto de prueba y no un modelo usable, por lo que no se reportan métricas de detección (mAP, etc.) ni comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamaño de 379.744 parámetros (aproximadamente 1,5 MB de pesos) más activaciones de un ViT de 2 capas.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también ejecutable en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (`AutoModelForObjectDetection`), dado que el repositorio incluye instrucciones de uso específicas para esa librería. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/yolos-small-mic` | 379.744 | Detección de objetos (fixture) | no aplica | no disponible | Hugging Face |
| `hustvl/yolos-small` | no disponible en la información | Detección de objetos | no aplica | no disponible | Hugging Face |
| `hustvl/yolos-tiny` | no disponible en la información | Detección de objetos | no aplica | no disponible | Hugging Face |

La comparación relevante es con el checkpoint original `hustvl/yolos-small`, del que este fixture deriva. El fixture reduce `num_hidden_layers` a 2 y sobreajusta al paso de entrenamiento del contrato, por lo que su calidad de detección no es representativa. No se dispone de datos de benchmarks para comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`), no un modelo usable en producción; la model card lo indica explícitamente.
- Calidad de detección no representativa: solo 2 capas y sobreajuste a 100 pasos del contrato.
- Riesgo de alucinación no aplica (no genera texto), pero las predicciones de detección no son fiables.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse en el repositorio antes de cualquier uso.
- Idiomas no aplicables: es un modelo de visión sin capacidades lingüísticas.
- Contexto no aplicable: no procesa texto.
- No debe incluirse en búsquedas de modelos candidatos; está etiquetado para excluirse.
- Los pesos están en float32; aunque es finito en bfloat16 y float16, no se documenta una cuantización oficial.
- El repositorio ocupa 0.0 GB y solo incluye pesos reducidos, uso y expectativas; otros ficheros deben regenerarse con `build_fixtures.py`.

## Enlaces

- [Hugging Face: huggingface-mic/yolos-small-mic](https://huggingface.co/huggingface-mic/yolos-small-mic)
- [Modelo base: hustvl/yolos-small](https://huggingface.co/hustvl/yolos-small)
- [Manifiesto de contrato (integration.json)](integration.json)
- [Uso con Transformers (usage.md)](integrations/transformers/usage.md)
- [Expectativas de Transformers](integrations/transformers/expectations)
- [Proveniencia del fixture (build.json)](build.json)
- [Cómo se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/yolos-small-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
