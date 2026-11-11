# huggingface-mic/vit-mic

## Resumen

`huggingface-mic/vit-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` dentro del proyecto Transformers MIC. No es un modelo utilizable en producción: es un checkpoint reducido ("slim fixture") diseñado para validar el contrato de integración de la arquitectura ViT en Transformers. El repositorio empaqueta pesos reducidos, instrucciones de uso ejecutables y las expectativas del framework en un único lugar.

El modelo deriva de `google/vit-base-patch16-224`, pero se ha reducido drásticamente: mantiene la arquitectura `ViTForImageClassification` con solo 2 capas ocultas (`num_hidden_layers: 2`) y 193.960 parámetros totales, frente a los aproximadamente 86 millones del checkpoint original. La configuración se ha recortado mediante una regla genérica implementada en `sweep.py`, y los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte desde el modelo base.

Su relevancia es metodológica, no funcional: sirve para verificar que la integración de ViT en Transformers se comporta correctamente (variantes default, eager y bfloat16, con grabación de línea base en proceso fresco) sobre hardware NVIDIA A10G, sin necesidad de descargar el checkpoint completo. Está etiquetado como `test-artifact` precisamente para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), `ViTForImageClassification` reducido (2 capas ocultas) |
| Parametros totales | 193.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; el fixture declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión (`ViTForImageClassification`) con la misma estructura de tensores que `google/vit-base-patch16-224`, pero con la configuración reducida a 2 capas ocultas mediante la regla genérica de reducción de `sweep.py`. Los nombres de los tensores coinciden con los del checkpoint real, lo que permite validar el contrato de integración sin alterar el código del framework. Los ficheros de procesador se copian byte a byte del modelo base, de modo que el preprocesado de imágenes es idéntico al original (parches de 16x16 sobre 224x224).

No hay un entrenamiento real en el sentido habitual: el fixture está sobreajustado ("overfit") al paso de entrenamiento del contrato, con 300 pasos, para superar la puerta de sensibilidad a la entrada. Con pesos aleatorios, la prueba `pixel_values:reverse` solo movía los logits 5.9e-05, por debajo del umbral de 0.001; tras el sobreajuste al paso de entrenamiento, la sensibilidad queda dentro del criterio. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. La clave del fixture (`3fc8366aafe8`) identifica el conjunto de checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción.

## Capacidades

- Clasificación de imágenes mediante `ViTForImageClassification` (la tarea propia de la arquitectura ViT base).
- Validación del contrato de integración de Transformers: uso público en variantes default, eager y bfloat16.
- Ejecución de forward, cálculo de pérdida y gradientes en float32, bfloat16 y float16.
- Comprobación de sensibilidad a la entrada (`pixel_values:reverse`) como puerta de calidad.
- Grabación de línea base en proceso fresco (fresh-process baseline) para comparación de comportamiento.
- Reproducibilidad verificable: hashes de ficheros y resultados de puertas registrados en `build.json`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un artefacto de prueba de visión.

## Casos de uso

- Validación de integraciones de ViT en Transformers: el fixture permite ejecutar el contrato de integración completo (default, eager, bfloat16) en una NVIDIA A10G sin descargar el checkpoint completo de 86M de parámetros, reduciendo tiempo y ancho de banda en CI.
- Pruebas de regresión en pipelines de CI/CD: al fijar la clave `3fc8366aafe8` y registrar hashes en `build.json`, cualquier cambio en el comportamiento del framework se detecta comparando contra la línea base grabada en proceso fresco.
- Verificación de estabilidad numérica en precisión reducida: comprobar que forward, pérdida y gradientes permanecen finitos en bfloat16 y float16 antes de desplegar el modelo real en GPUs con soporte de precisión mixta.
- Desarrollo de herramientas de reducción de checkpoints: el fixture sirve como caso de prueba de `sweep.py` y de `build_fixtures.py`, permitiendo iterar sobre la lógica de reducción sin coste de almacenamiento.
- Auditoría de contratos de modelo: equipos que mantienen integraciones de terceros pueden usar el repositorio (manifest `integration.json`, expectativas y procedencia) como plantilla para documentar sus propios contratos.
- Formación y depuración: investigadores que necesitan un ViT mínimo con nombres de tensores idénticos al modelo real para inspeccionar el flujo de datos del procesador y la forma de los logits sin recursos de GPU significativos.
- Pruebas de sensibilidad a la entrada: reproducir la puerta `pixel_values:reverse` (umbral 0.001) como test unitario de que un modelo responde a perturbaciones de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card solo reporta resultados de puertas de validación internas: con pesos aleatorios, `pixel_values:reverse` desplazaba los logits 5.9e-05 (por debajo del umbral 0.001), y tras el sobreajuste de 300 pasos el fixture supera la puerta. No hay métricas de precisión, latencia ni throughput publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 dado el tamaño de 193.960 parámetros y un repo de 0.0 GB (redondeado); en la práctica, unos pocos MB de pesos más el overhead del runtime.
- GPU recomendadas: el contrato se validó en una NVIDIA A10G; cualquier GPU con al menos 1 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: Transformers (variantes default, eager y bfloat16 validadas); otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para este fixture y no aplican a un modelo de visión de prueba.
- Latencia y throughput estimados: no disponibles. El modelo card no publica cifras de rendimiento; al ser un fixture de 2 capas, la latencia sería marginalmente inferior a la del ViT base, pero no se han medido valores concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| huggingface-mic/vit-mic | 193.960 | ViT reducido (2 capas) | no aplica | no disponible | Fixture de prueba de integracion |
| google/vit-base-patch16-224 | ~86M (no confirmado en la informacion) | ViT base | no aplica | no disponible en la informacion | Clasificacion de imagenes en produccion |
| Otros fixtures `huggingface-mic/*` | variable | variable | no aplica | no disponible | Pruebas de contrato de otras arquitecturas |

La comparación relevante es con el checkpoint base `google/vit-base-patch16-224`: comparten arquitectura, nombres de tensores y ficheros de procesador, pero difieren en escala (2 capas frente a la configuración completa) y en finalidad (prueba frente a uso real). No se dispone de datos de benchmarks ni de licencia para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- No es un modelo utilizable: el propio autor lo etiqueta `test-artifact` y advierte que es un fixture, no un modelo funcional. Sus pesos están sobreajustados a un paso de entrenamiento de 300 pasos.
- Calidad de clasificación no representativa: al tener solo 2 capas ocultas y pesos ajustados al contrato, sus predicciones no reflejan el comportamiento de `google/vit-base-patch16-224`.
- Cobertura parcial: el prototipo declara objetivos solo para el fixture; la cobertura del checkpoint completo es un trabajo separado.
- Licencia no disponible: no se puede confirmar si permite uso comercial; al ser un artefacto de prueba, no debería usarse en producción en ningún caso.
- Idiomas no disponibles: no aplica a un modelo de visión, pero no se documenta nada al respecto.
- Riesgo de confusión: aunque comparte el prefijo de la organización y una arquitectura ViT, no debe confundirse con un modelo de clasificación listo para desplegar.
- Dependencia de reconstrucción: algunos ficheros del repositorio deben regenerarse con `python example/build_fixtures.py --fixture mic-vit-slim`, por lo que no todo el contenido está empaquetado.
- Sin benchmarks publicados: no hay evidencia de rendimiento fuera de las puertas de validación internas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/vit-mic
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Manifest de contrato: https://huggingface.co/huggingface-mic/vit-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/vit-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/vit-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/vit-mic/blob/main/build.json
- Explicación de la reducción del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/vit-mic.html
- Evidencia de regeneración (GitHub Actions): https://github.com/huggingface/transformers-mic/actions/runs/38252430459
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
