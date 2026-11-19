# huggingface-mic/LFM2-8B-A1B-mic

## Resumen

LFM2-8B-A1B-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable, sino un *fixture* (modelo reducido artificialmente) construido a partir de `LiquidAI/LFM2-8B-A1B` con el objetivo de validar integraciones de framework, contratos de entrada/salida y expectativas de ejecución. El repositorio se etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El modelo conserva la arquitectura declarada del original (`Lfm2MoeForCausalLM`) pero con una configuración drásticamente reducida: 4 capas ocultas y tan solo 4.355.752 parámetros totales según los tensores en safetensors. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (tokenizer, chat template, generation config, licencia) se copian byte a byte desde el checkpoint original de LiquidAI.

Su relevancia es puramente de ingeniería: sirve como fixture reproducible para probar pipelines de carga, inferencia y validación de contratos en Transformers y otros frameworks sin necesidad de descargar los pesos completos del modelo real. No debe confundirse con el modelo LFM2-8B-A1B de LiquidAI, que sí es un modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Lfm2MoeForCausalLM` (transformer MoE, configuración reducida a 4 capas) |
| Parámetros totales | 4.355.752 |
| Parámetros activos | no disponible (el original es MoE A1B; el fixture no documenta el reparto activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se copia el fichero `LICENSE` del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reutiliza la clase `Lfm2MoeForCausalLM` del modelo base `LiquidAI/LFM2-8B-A1B`, pero con `num_hidden_layers` reducido a 4 mediante la regla genérica de reducción implementada en `sweep.py` del repositorio `transformers-mic`. Mantiene los mismos nombres de tensores que el checkpoint real, de modo que cualquier código que espere la estructura de parámetros del modelo original puede cargarlo sin cambios de API.

No hay entrenamiento. Los pesos se generan aleatoriamente con semilla 17 y se validan mediante una compuerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato mueve los logits al menos 0.001 (el caso más débil, `attention_mask:all_ones`, produce 0.258). Los tensores se guardan en bfloat16, el dtype por defecto de carga del modelo original, y se verifica que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16. El fichero `build.json` registra las fuentes fijadas, los resultados de las compuertas y los hashes de los ficheros.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no han sido entrenados, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de integración para validar la carga del modelo, el flujo de forward, el cálculo de pérdida y la retropropagación de gradientes.
- Permite verificar contratos de entrada/salida definidos en `integration.json` y en `integrations/transformers/expectations`.
- Reutiliza el tokenizer, chat template y generation config del modelo base, por lo que valida el pipeline de tokenización y plantillas de conversación.
- No soporta tool calling, agentes, razonamiento multilingüe ni ninguna capacidad cognitiva real, al carecer de entrenamiento.
- Compatible con el ecosistema Transformers para pruebas de regresión de la clase `Lfm2MoeForCausalLM`.

## Casos de uso

- Pruebas de integración en CI/CD: cargar el fixture en un pipeline de integración continua para verificar que la clase `Lfm2MoeForCausalLM` y el tokenizer se instancian correctamente sin descargar los pesos completos del modelo real.
- Validación de contratos de framework: ejecutar `integrations/transformers/expectations` para comprobar que las entradas y salidas esperadas por el framework coinciden con las del checkpoint original tras la reducción.
- Desarrollo de código de inferencia: probar bucles de generación, gestión de `attention_mask` y cálculo de logits con un modelo pequeño y rápido antes de escalar al checkpoint real.
- Test de regresión de tokenizer y chat template: al copiarse byte a byte desde LiquidAI/LFM2-8B-A1B, permite validar plantillas de conversación y tokens especiales sin cargar el modelo completo.
- Verificación de dtypes: comprobar que el forward, la pérdida y los gradientes son finitos en float32, bfloat16 y float16, útil para validar mixed precision en pipelines de entrenamiento.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture LFM2-8B-A1B-mic` y comparar hashes registrados en `build.json` para auditar la procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que no procede evaluar calidad de generación, razonamiento ni tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (4,36 M de parámetros), aunque el tamaño del repo se indica como 0.0 GB y no se detalla el peso real de los ficheros.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU es suficiente; no requiere aceleradores de datacenter como A100 o H100.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto según el repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 4 capas con pesos aleatorios, la latencia sería mínima pero sin valor práctico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| LFM2-8B-A1B-mic (este) | 4,36 M | no disponible | no disponible | Fixture de test |
| LiquidAI/LFM2-8B-A1B | no disponible en la información | no disponible | no disponible | Modelo MoE de producción |
| Otros fixtures `*-mic` de huggingface-mic | variable (reducidos) | no disponible | no disponible | Fixtures de integración |

La comparación solo es significativa frente al modelo base: el fixture replica su arquitectura y ficheros de procesador con una configuración reducida y pesos aleatorios, por lo que no es un sustituto funcional. No se dispone de datos de benchmarks ni de especificaciones completas del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y no producen salidas coherentes; cualquier uso en producción generaría resultados sin sentido.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe tratarse como un modelo de la familia LFM2 real.
- La licencia no está especificada en la información disponible; aunque se copia el fichero `LICENSE` del modelo base, no se detalla su contenido ni las restricciones de uso comercial.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas porque el modelo no ha sido entrenado; estas categorías no aplican en sentido estricto.
- El tamaño del repo se indica como 0.0 GB, lo que puede reflejar un redondeo o una discrepancia con los 4,36 M de parámetros; conviene verificar los ficheros reales antes de usarlo.
- No se garantiza compatibilidad con frameworks distintos de Transformers; el soporte se limita a lo documentado en `integrations/transformers/`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/LFM2-8B-A1B-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LFM2-8B-A1B-mic.html
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
