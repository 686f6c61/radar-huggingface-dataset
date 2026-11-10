# huggingface-mic/yolos-small-mic

## Resumen

yolos-small-mic es un artefacto de prueba (test fixture) publicado por huggingface-mic, no un modelo utilizable en producción. Se trata de una versión reducida del modelo de detección de objetos hustvl/yolos-small, recortado mediante una regla genérica de reducción de configuración (num_hidden_layers a 2) que rebaja el total a 379.744 parámetros. El repositorio empaqueta los pesos reducidos, la documentación de uso ejecutable y las expectativas de framework en un único lugar, con el objetivo de validar contratos de integración en Transformers sin necesidad de descargar el checkpoint completo.

La relevancia es puramente de ingeniería de software: el fixture permite comprobar que el pipeline de detección de objetos de YOLOS se comporta de forma consistente (nombres de tensores, procesador, dtypes) en pruebas automatizadas. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

No dispone de model card convencional con información de entrenamiento, licencia, idiomas ni benchmarks. Cualquier uso previsto debe ser el de validación de integraciones, nunca el de inferencia real sobre imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YolosForObjectDetection (transformer de visión tipo ViT adaptado a detección de objetos) |
| Parametros totales | 379.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, con forward/loss/gradientes finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base hustvl/yolos-small es un transformer de visión que aplica el esquema de ViT directamente sobre parches de imagen con un cabezal de detección de objetos (sin propuestas de región ni NMS aprendido), inspirado en DETR. La variante mic conserva la misma arquitectura y los mismos nombres de tensores que el checkpoint original, pero reduce la configuración a 2 capas ocultas mediante la regla genérica implementada en `sweep.py` del repositorio transformers-mic.

No se ha entrenado desde cero ni afinado con datos reales: el autor indica que el fixture está sobreajustado al paso de entrenamiento del contrato (100 pasos) y que los pesos aleatorios no superaron la puerta de sensibilidad de entrada (`pixel_values:reverse` movía los logits solo 6.8e-05 frente a un umbral de 0.001). Los ficheros del procesador (`preprocessor_config.json`) se copian byte a byte desde hustvl/yolos-small. No hay información sobre volumen de datos, composición del dataset ni técnicas de alineación (RLHF/DPO).

## Capacidades

- Detección de objetos sobre imágenes, con la misma interfaz de entrada/salida que hustvl/yolos-small (pixel_values y logits de cajas/clases).
- Compatible con el pipeline de object detection de Transformers.
- Nombres de tensores idénticos al checkpoint real, lo que permite validar contratos de carga y serialización.
- Ejecutable en float32, bfloat16 y float16 (forward, loss y gradientes finitos).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión generativa ni audio.

## Casos de uso

- Pruebas de integración en Transformers: sirve para verificar que el pipeline de detección de objetos carga, ejecuta y devuelve salidas con la forma esperada sin descargar el checkpoint completo de hustvl/yolos-small.
- Validación de contratos de framework: el repositorio incluye `integration.json` e `integrations/transformers/expectations`, de modo que un CI puede comparar las salidas del fixture con las expectativas declaradas.
- Pruebas de compatibilidad de dtypes: al ser finito en float32, bfloat16 y float16, permite comprobar rutas de conversión de precisión en pipelines de inferencia.
- Verificación de serialización safetensors: los nombres de tensores coinciden con el modelo real, útil para testear cargadores y exportadores.
- Desarrollo de herramientas de reducción de modelos: el fixture documenta el proceso de shrink (`sweep.py`, `build_fixtures.py`) y sirve como caso de referencia para construir otros fixtures.
- Pruebas de regresión en pipelines de visión: permite ejecutar tests rápidos de detección de objetos en entornos con recursos limitados (0,0 GB de repo, 0,4 M de parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (0,4 M de parámetros), prácticamente despreciable.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (pipeline de object detection); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; al tratarse de un fixture de 2 capas, la latencia sería muy inferior a la del modelo real, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolos-small-mic | 379.744 | no disponible | Detección de objetos (fixture) | no disponible | Hugging Face |
| hustvl/yolos-small | no disponible en la informacion proporcionada | no disponible | Detección de objetos | no disponible | Hugging Face |
| facebook/detr-resnet-50 | no disponible en la informacion proporcionada | no disponible | Detección de objetos | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa; la comparación relevante es que yolos-small-mic es una versión reducida y no entrenada de hustvl/yolos-small, pensada solo para tests.

## Limitaciones y advertencias

- Es un artefacto de prueba, no un modelo utilizable: el propio autor lo etiqueta como `test-artifact` y advierte que no es un modelo usable.
- Está sobreajustado al paso de entrenamiento del contrato (100 pasos); los pesos aleatorios no superaron la puerta de sensibilidad de entrada.
- Solo tiene 2 capas ocultas, por lo que su capacidad de detección real es nula o irrelevante.
- Licencia no disponible: no se puede asumir uso comercial sin consultar el repositorio original de hustvl/yolos-small.
- Sin información sobre sesgos, idiomas ni riesgos de alucinación (no aplica al no ser un modelo generativo).
- No debe incluirse en pipelines de producción ni en evaluaciones de calidad de detección.
- El repositorio tiene 0,0 GB y no incluye todos los ficheros; algunos deben regenerarse con `python example/build_fixtures.py --fixture yolos-small-mic`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/yolos-small-mic
- Modelo base: https://huggingface.co/hustvl/yolos-small
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/yolos-small-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/yolos-small-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/yolos-small-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/yolos-small-mic/blob/main/build.json
- Explicación del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/yolos-small-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
