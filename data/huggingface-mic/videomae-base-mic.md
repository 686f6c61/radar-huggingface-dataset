# huggingface-mic/videomae-base-mic

## Resumen

`videomae-base-mic` es un artefacto de prueba (fixture) derivado de `MCG-NJU/videomae-base`, el modelo VideoMAE de video masked autoencoding publicado por el grupo MCG de la Universidad de Nanjing. No es un modelo entrenado ni utilizable en producción: el autor lo etiqueta explícitamente como `test-artifact` y lo describe como un "slim fixture" de 7,9 millones de parámetros que reproduce la arquitectura y los contratos de entrada del checkpoint original con pesos aleatorios.

El propósito del repositorio es servir como fixture de integración para el proyecto `transformers-mic`: un artefacto ligero que conserva los nombres de tensores, el procesador y las expectativas de comportamiento del modelo real, de modo que las pruebas de integración con Transformers puedan ejecutarse sin descargar ni cargar el checkpoint completo. Se ha generado reduciendo el número de capas ocultas a 2 mediante la regla genérica de `sweep.py` y sembrando pesos aleatorios con semilla 17, que superaron una puerta de sensibilidad de entradas (cada perturbación mueve los logits al menos 0,001).

Por tanto, esta ficha documenta un objeto de ingeniería de pruebas, no un modelo de IA desplegable. Cualquier evaluación de calidad, razonamiento o capacidades generativas carece de sentido aquí: los pesos son aleatorios y el modelo no ha sido entrenado. Su interés es exclusivamente para desarrolladores que mantengan suites de tests compatibles con la API de Transformers para modelos de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VideoMAE (transformer de visión para vídeo, `VideoMAEForPreTraining`) |
| Parametros totales | 7.878.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; sin ventana de texto) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es VideoMAE en su variante `VideoMAEForPreTraining`, un transformer de visión que procesa secuencias de parches espacio-temporales extraídos de vídeo y se preentrena con enmascaramiento aleatorio de tubos (tube masking) para reconstruir los píxeles ocultos. El modelo base `MCG-NJU/videomae-base` sigue esta receta; sin embargo, el artefacto que nos ocupa no conserva el entrenamiento: se ha reducido a 2 capas ocultas y todos sus pesos son aleatorios (semilla 17).

No hubo entrenamiento, ajuste fino, RLHF ni DPO. La generación consistió en copiar byte a byte el `preprocessor_config.json` del checkpoint original, mantener los nombres de tensores idénticos a los del modelo real y verificar que las perturbaciones de las entradas del contrato movieran los logits al menos 0,001 (la más débil, `pixel_values:roll_batch`, con 0,00235). El artefacto se construyó con `build_fixtures.py` y los detalles de procedencia, hashes y resultados de las puertas quedan registrados en `build.json`.

## Capacidades

- No dispone de capacidades generativas reales: los pesos son aleatorios y el modelo no ha sido entrenado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (es un modelo de visión, sin entrada o salida de texto).
- Su función es servir de fixture de integración: reproduce la firma de entradas (`pixel_values`) y los nombres de tensores del checkpoint `MCG-NJU/videomae-base`.
- Verificado como finito en float32, bfloat16 y float16 para forward, pérdida y gradientes.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `VideoMAEForPreTraining` y comprobar que la API de procesamiento y el forward funcionan sin descargar el checkpoint completo de 86M parámetros.
- Validación de contratos de entrada: usar `integration.json` y `integrations/transformers/expectations` para verificar que perturbaciones de `pixel_values` producen cambios medibles en los logits.
- CI/CD de librerías: ejecutar la suite de tests de modelos de vídeo en pipelines con recursos limitados, dado el tamaño reducido del repositorio y del modelo.
- Desarrollo de utilidades de conversión de pesos: probar scripts que lean safetensors y mapeen nombres de tensores contra un objeto con la misma estructura que el modelo real.
- Verificación de dtypes: comprobar que el forward, la pérdida y los gradientes se mantienen finitos en float32, bfloat16 y float16 antes de aplicar cambios a modelos reales.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture videomae-base-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto con pesos aleatorios, cualquier métrica de calidad (precisión, F1, etc.) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 7,9M de parámetros; no se han publicado mediciones concretas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requieren A100 ni H100.
- Cabe en cualquier GPU de consumo e incluso en CPU para pruebas.
- Opciones de despliegue: carga mediante la API de Transformers (`VideoMAEForPreTraining`); no se ha validado con vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/videomae-base-mic` | 7,9M | no aplica | pesos aleatorios (fixture) | no disponible | Hugging Face |
| `MCG-NJU/videomae-base` | ~86M (no confirmado en la informacion) | no aplica | preentrenamiento VideoMAE | no disponible | Hugging Face |
| Otros modelos VideoMAE de MCG-NJU | no disponible | no aplica | preentrenamiento VideoMAE | no disponible | Hugging Face |

La comparación relevante es con el checkpoint original `MCG-NJU/videomae-base`, del que este artefacto copia procesador y estructura de tensores pero no pesos ni entrenamiento.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas significativas; cualquier uso como modelo real es un error.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe promocionarse a producción.
- Licencia no especificada: no hay autorización explícita para uso comercial.
- Sin datos de sesgos, alucinación o cobertura idiomática porque no ha sido entrenado.
- El repositorio tiene 0 descargas y 0 likes; es un artefacto interno sin validación comunitaria.
- Depende de la API de Transformers y del contrato definido en `integration.json`; cambios en la librería pueden romper la compatibilidad.
- No sustituye al checkpoint original para tareas de vídeo reales.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/videomae-base-mic
- Modelo base: https://huggingface.co/MCG-NJU/videomae-base
- Documentación de VideoMAE en Transformers: https://huggingface.co/docs/transformers/model_doc/videomae
- Repositorio del proyecto: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/videomae-base-mic.html
