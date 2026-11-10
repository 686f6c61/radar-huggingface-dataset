# huggingface-mic/segformer-b0-finetuned-ade-512-512-mic

## Resumen

`segformer-b0-finetuned-ade-512-512-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` a partir del modelo `nvidia/segformer-b0-finetuned-ade-512-512`. No es un modelo utilizable para inferencia real: la propia model card lo etiqueta explícitamente como `test-artifact` y advierte que no debe emplearse como modelo de producción. Su propósito es servir como fixture reproducible para probar integraciones de frameworks (en concreto Transformers) con pesos reducidos pero con los mismos nombres de tensor que el checkpoint original.

El modelo base es un SegFormer-B0, un transformer de segmentación semántica con arquitectura encoder-decoder jerárquica sin atención posicional clásica, ajustado sobre el dataset ADE20K a resolución 512×512. El fixture conserva la configuración de `SegformerForSemanticSegmentation` con 3.753.206 parámetros (aproximadamente 3,8 M), un tamaño muy inferior al del checkpoint original, lo que permite validar pipelines de carga, ejecución y expectativas de framework sin descargar pesos completos.

Es relevante para desarrolladores que mantienen integraciones de Transformers o que necesitan entornos de CI ligeros y deterministas para segmentación semántica. La licencia no está declarada en la información disponible, y el repositorio no incluye datos de benchmarks ni de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer (encoder jerárquico tipo transformer + decoder ligero, `SegformerForSemanticSegmentation`) |
| Parametros totales | 3.753.206 (≈3,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 512×512 píxeles según el nombre del checkpoint) |
| Tipos de cuantizacion | pesos guardados en float32; verificado finito en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (dtype float32) |

## Arquitectura y entrenamiento

El modelo subyacente es un SegFormer-B0, una arquitectura de segmentación semántica que combina un encoder transformer jerárquico (con atención eficiente y sin codificación posicional explícita) con un decoder MLP ligero que fusiona características multi-escala. El checkpoint original `nvidia/segformer-b0-finetuned-ade-512-512` está ajustado sobre ADE20K (escenas interiores y exteriores, 150 clases) a resolución de entrada 512×512.

El artefacto aquí descrito no ha sido reentrenado: la model card indica que conserva "the checkpoint's own trained weights, unchanged" y que, con 3,8 M parámetros, se mantiene por debajo del umbral de 20 M por el que una fuente se guarda entera. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte del checkpoint original. El fixture pasa una puerta de sensibilidad a la entrada (la más débil, `pixel_values:halve`, con valor 4,01) y se guarda en float32, el dtype con el que carga por defecto el modelo original. La clave de fixture es `36235b6da949`.

## Capacidades

- Segmentación semántica de imágenes (predicción de máscaras por píxel) heredada del SegFormer-B0 original, aunque el fixture no está pensado para uso real.
- Conserva los mismos nombres de tensor que el checkpoint real, lo que permite validar la carga de pesos y la compatibilidad de la API de Transformers.
- Sirve como fixture ejecutable para pruebas de integración y de framework (uso y expectativas documentados en `integrations/transformers/`).
- Verificado numéricamente estable (forward, loss y gradientes finitos) en float32, bfloat16 y float16.
- No dispone de tool calling, capacidades de agente, multilingüismo ni modos de razonamiento: es un modelo de visión.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para validar que la clase `SegformerForSemanticSegmentation` carga pesos, ejecuta forward y produce salidas con las formas esperadas, sin descargar el checkpoint completo.
- Validación de pipelines de Transformers: comprobar que `preprocessor_config.json` y la configuración del modelo se comportan igual que en el checkpoint original en un entorno ligero.
- Desarrollo de wrappers y librerías de segmentación: iterar sobre la API de inferencia con un artefacto de 3,8 M parámetros antes de conectar el modelo real.
- Pruebas de compatibilidad de dtype: verificar que el modelo se mantiene finito en float32, bfloat16 y float16 en forward, loss y gradientes.
- Reproducibilidad de fixtures: regenerar el artefacto con `build_fixtures.py --fixture segformer-b0-finetuned-ade-512-512-mic` y comparar hashes registrados en `build.json`.
- Smoke tests de despliegue: comprobar que un servidor de inferencia (por ejemplo, un endpoint de segmentación) arranca y responde con el fixture antes de provisionar GPU para el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la puerta de sensibilidad a la entrada (`pixel_values:halve`, 4,01) y la estabilidad numérica en float32, bfloat16 y float16; no incluye métricas de segmentación como mIoU sobre ADE20K.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,8 M parámetros en float32 el peso ocupa aproximadamente 15 MB, por lo que cabe en cualquier GPU consumer.
- GPU recomendadas: innecesarias para el fixture; válido en CPU. Para el modelo real SegFormer-B0 se recomienda una GPU con al menos 8-16 GB de VRAM para lotes moderados a 512×512.
- Cabe en GPU consumer: sí, en cualquier GPU moderna (por ejemplo, RTX 3060, RTX 4090) y también en CPU.
- Opciones de despliegue: Transformers (carga estándar con `SegformerForSemanticSegmentation`), y pipelines de visión de Hugging Face. No se documentan opciones específicas como vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/segformer-b0-finetuned-ade-512-512-mic` (este) | 3,8 M (fixture) | 512×512 | Segmentación semántica (fixture de test) | no disponible | Hugging Face |
| `nvidia/segformer-b0-finetuned-ade-512-512` | no disponible en la información | 512×512 | Segmentación semántica ADE20K | no disponible | Hugging Face |
| Otros SegFormer-B0 de segmentación | no disponible | 512×512 | Segmentación semántica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de parámetros del checkpoint original en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un artefacto de prueba (`test-artifact`): la model card indica explícitamente que "no es un modelo utilizable" y que se etiqueta así para excluirlo de la búsqueda de modelos candidatos.
- No debe usarse en producción ni para inferencia real de segmentación; sus pesos son una versión reducida del checkpoint original.
- Licencia no declarada: no hay información sobre permisos de uso comercial, por lo que no se puede asumir ningún régimen de uso.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: al ser un modelo de visión, estas categorías no aplican directamente, pero tampoco hay evaluación publicada.
- Sin benchmarks de calidad (mIoU u otros): no es posible comparar su rendimiento con el checkpoint original.
- Depende de la herramienta de construcción (`build_fixtures.py`) para regenerar los ficheros auxiliares; el repositorio solo incluye pesos, uso y expectativas de framework.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/segformer-b0-finetuned-ade-512-512-mic
- Modelo base: https://huggingface.co/nvidia/segformer-b0-finetuned-ade-512-512
- Manifest de contrato: https://huggingface.co/huggingface-mic/segformer-b0-finetuned-ade-512-512-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/segformer-b0-finetuned-ade-512-512-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/segformer-b0-finetuned-ade-512-512-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/segformer-b0-finetuned-ade-512-512-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/segformer-b0-finetuned-ade-512-512-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
