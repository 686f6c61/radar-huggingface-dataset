# huggingface-mic/poolformer_s12-mic

## Resumen

`huggingface-mic/poolformer_s12-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` para validar la integración de modelos de visión en el ecosistema Transformers. No es un modelo entrenado para uso real: es una copia reducida y verificable del checkpoint `sail/poolformer_s12`, con 11,9 millones de parámetros y pesos en float32, destinada a pruebas de contrato de framework (entradas, salidas, dtypes y gradientes).

El modelo subyacente, PoolFormer, pertenece a la familia MetaFormer y sustituye la atención por una operación de *pooling* espacial simple, lo que reduce drásticamente el coste computacional manteniendo un rendimiento competitivo en clasificación de imágenes. La variante `s12` es la más pequeña de la familia, con 12 bloques de profundidad y embeddings de 192 dimensiones.

Es relevante ahora porque el repositorio documenta explícitamente el contrato de integración (`integration.json`, `integrations/transformers/usage.md`, `expectations`) y la procedencia del fixture (`build.json`), lo que lo convierte en una referencia útil para ingenieros que mantienen pipelines de CI o wrappers de Transformers y necesitan un checkpoint ligero con comportamiento determinista. Cualquier uso como modelo de producción es inadecuado por diseño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PoolFormer (MetaFormer con token mixer de pooling), `PoolFormerForImageClassification` |
| Parametros totales | 11.915.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen, no texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

PoolFormer es un transformer de visión que reemplaza el mecanismo de self-attention por un *token mixer* basado en average pooling con kernel 3x3 y stride 1, seguido de una conexión residual y una MLP con GELU. La variante `s12` tiene 12 bloques, dimensión de embedding 192 y cuatro etapas con reducción espacial progresiva, lo que da lugar a los 11,9 M de parámetros. El modelo base `sail/poolformer_s12` fue entrenado en ImageNet-1K para clasificación de imágenes de 224x224.

El artefacto `poolformer_s12-mic` no ha sido reentrenado: el autor indica que conserva los pesos entrenados del checkpoint original, sin modificaciones, porque a 11,9 M de parámetros ya está por debajo del umbral de 20 M bajo el cual la fuente se mantiene entera. Los ficheros de procesador (`preprocessor_config.json`) se copian byte a byte desde `sail/poolformer_s12`, y los nombres de tensores coinciden con el checkpoint real. El autor documenta que los pesos pasaron una puerta de sensibilidad a la entrada (la más débil, `pixel_values:halve`, con valor 2.25) y que son finitos en float32, bfloat16 y float16 en forward, pérdida y gradientes. No se dispone de información sobre composición del dataset, número de tokens ni técnicas de alineación (RLHF/DPO), por tratarse de un modelo de visión y de un fixture.

## Capacidades

- Clasificación de imágenes (tarea declarada por la configuración `PoolFormerForImageClassification`), con entrada de imagen y salida de logits por clase.
- Extracción de características visuales a través de las etapas del backbone, útil para tareas downstream de visión.
- Integración verificada con Transformers: el repositorio incluye manifiesto de contrato, uso ejecutable y directorio de expectativas del framework.
- Comportamiento determinista y reproducible: pensado para tests de integración, no para inferencia productiva.
- Compatibilidad de dtypes: forward, pérdida y gradientes finitos en float32, bfloat16 y float16.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión generativa, audio ni otras capacidades especiales más allá de la clasificación de imágenes.

## Casos de uso

- Pruebas de integración en CI: usar el fixture para validar que un wrapper de Transformers carga el checkpoint, ejecuta el forward y produce salidas con la forma esperada, sin depender del peso completo de un modelo real.
- Verificación de contrato de framework: comprobar que las expectativas declaradas en `integrations/transformers/expectations` se cumplen tras actualizar la versión de Transformers, detectando regresiones en la API de `PoolFormerForImageClassification`.
- Test de dtypes y gradientes: validar que el pipeline de entrenamiento acepta el modelo en float32, bfloat16 y float16 sin producir NaN ni infinitos, usando el fixture como caso base.
- Desarrollo de utilidades de preprocesado: probar transformaciones de imagen contra `preprocessor_config.json` copiado byte a byte del checkpoint original, garantizando paridad con el modelo de referencia.
- Reproducción de experimentos de investigación: disponer de un checkpoint ligero y con nombres de tensores idénticos al modelo real para depurar código de visión sin consumir recursos de GPU.
- Validación de pipelines de exportación: comprobar la conversión de safetensors a otros formatos (por ejemplo, ONNX o TorchScript) sobre un modelo de 11,9 M de parámetros antes de aplicarla al checkpoint completo.
- Docencia y demostraciones: ilustrar la arquitectura PoolFormer y el flujo de clasificación de imágenes con un artefacto de tamaño reducido y carga rápida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 11,9 M de parámetros, más el espacio de activaciones de una imagen de 224x224; en la práctica, menos de 2 GB en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni RTX 4090. Funciona en GPUs de gama baja y en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o iGPU con soporte de PyTorch; también en CPU para inferencia puntual.
- Opciones de despliegue: Transformers con PyTorch (ruta documentada en `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de visión de este tamaño.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/poolformer_s12-mic` | 11,9 M | imagen 224x224 (preprocesado heredado) | Clasificación de imágenes (fixture de test) | no disponible | Hugging Face |
| `sail/poolformer_s12` | 11,9 M | imagen 224x224 | Clasificación de imágenes | no disponible | Hugging Face |
| `facebook/deit-tiny-patch16-224` | ~5,7 M | imagen 224x224 | Clasificación de imágenes | Apache 2.0 (según model card pública) | Hugging Face |
| `google/vit-base-patch16-224` | ~86 M | imagen 224x224 | Clasificación de imágenes | Apache 2.0 (según model card pública) | Hugging Face |

La comparación se limita a arquitectura y tamaño: no se dispone de resultados de benchmarks del fixture ni del checkpoint base en la información proporcionada, por lo que no es posible comparar rendimiento numérico.

## Limitaciones y advertencias

- Es un artefacto de prueba etiquetado `test-artifact`; el propio autor indica que no es un modelo usable y que la etiqueta sirve para excluirlo de búsquedas de modelos candidatos.
- No debe desplegarse en producción: no hay garantía de calidad de predicción ni de mantenimiento del repositorio.
- Licencia no disponible: no se puede confirmar el uso comercial del artefacto ni del checkpoint base sin consultar `sail/poolformer_s12`.
- Idiomas no disponibles: al ser un modelo de visión, no aplica soporte multilingüe; la información de idiomas del repositorio está vacía.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí de predicciones sin calibración fuera del dominio de ImageNet.
- Limitación de entrada: el preprocesado está fijado por `preprocessor_config.json` del checkpoint original; cambios en resolución o normalización pueden invalidar las expectativas del fixture.
- El repositorio incluye solo pesos, uso y expectativas; el autor indica que otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture poolformer_s12-mic`.
- Sin datos de benchmarks publicados: no se puede evaluar su rendimiento frente a alternativas con cifras objetivas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/poolformer_s12-mic
- Modelo base: https://huggingface.co/sail/poolformer_s12
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/poolformer_s12-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/poolformer_s12-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/poolformer_s12-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/poolformer_s12-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/poolformer_s12-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
