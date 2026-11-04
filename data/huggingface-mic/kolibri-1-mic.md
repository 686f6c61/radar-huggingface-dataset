# huggingface-mic/Kolibri-1-mic

## Resumen

Kolibri-1-mic es un artefacto de prueba publicado por el usuario `huggingface-mic`, derivado del modelo `Aleph-Alpha/Kolibri-1`. No es un modelo entrenado ni utilizable para inferencia real: se trata de un "fixture" reducido que reproduce la arquitectura `Kolibri1ForCausalLM` con solo 2 capas ocultas y pesos aleatorios (semilla 17), generado para validar integraciones y contratos de framework (concretamente, la suite de pruebas `transformers-mic`). El propio autor lo etiqueta como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El repositorio contiene los pesos reducidos (16.508.040 parámetros reales según los safetensors), el manifiesto de contrato `integration.json`, la documentación de uso con Transformers y el directorio de expectativas del framework. Los ficheros de procesador (`LICENSE`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del checkpoint original `Aleph-Alpha/Kolibri-1`, de modo que la tokenización y la configuración de generación coinciden con las del modelo de referencia.

Su relevancia es exclusivamente de ingeniería: permite a desarrolladores de la librería Transformers verificar que el pipeline de carga, forward, cálculo de pérdida y gradientes funciona con la arquitectura Kolibri sin necesidad de descargar el checkpoint completo. No debe confundirse con un modelo de lenguaje operativo, y no se han publicado capacidades, benchmarks ni datos de entrenamiento asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Kolibri1ForCausalLM`), reducida a 2 capas ocultas |
| Parametros totales | 16.508.040 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito también en float32 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se explicita el tipo) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de la familia Kolibri (`Kolibri1ForCausalLM`), pero con la configuración encogida mediante la regla genérica de `sweep.py`: `num_hidden_layers = 2`. Los nombres de los tensores coinciden exactamente con los del checkpoint real `Aleph-Alpha/Kolibri-1`, lo que permite validar la compatibilidad de carga sin disponer del modelo completo.

No ha habido entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron únicamente porque superaron la puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,133). El artefacto se guardó en bfloat16, el dtype con el que carga por defecto el modelo base, y se verificó que forward, pérdida y gradientes son finitos en float32, bfloat16 y float16. El build queda registrado en `build.json` con fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas de razonamiento, código o matemáticas.
- Reproduce la interfaz de `Kolibri1ForCausalLM` para pruebas de integración con Transformers.
- Tokenizador y `generation_config.json` idénticos a los de `Aleph-Alpha/Kolibri-1`, útiles para validar pipelines de tokenización.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la arquitectura `Kolibri1ForCausalLM` se instancia y ejecuta sin errores antes de probar con el checkpoint completo.
- Validación de contratos de framework: usar `integration.json` y el directorio `integrations/transformers/expectations` para comprobar que las salidas (formas de logits, pérdida, gradientes) cumplen las expectativas declaradas.
- CI/CD de la librería `transformers-mic`: ejecutar la suite de pruebas en entornos con recursos limitados, ya que el repositorio ocupa 0,0 GB y evita descargar el modelo real.
- Verificación de tokenización: al copiar `tokenizer.json` y `tokenizer_config.json` byte a byte, sirve para probar pipelines de preprocesado idénticos a los del modelo base.
- Pruebas de precisión numérica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 en distintas plataformas.
- Desarrollo de herramientas de inspección de modelos: validar scripts que enumeran tensores y comparan nombres con el checkpoint de referencia, dado que el fixture conserva exactamente los mismos nombres.
- Reproducibilidad de builds: reconstruir el artefacto con `python example/build_fixtures.py --fixture Kolibri-1-mic` y contrastar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 16,5 M de parámetros en bfloat16 (unos 33 MB de pesos); el resto del consumo lo determina el runtime.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; también funciona en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa desde el repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba, las cifras no serían representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kolibri-1-mic | 16,5 M | no disponible | Fixture de pruebas | no disponible | HuggingFace (`huggingface-mic/Kolibri-1-mic`) |
| Aleph-Alpha/Kolibri-1 | no disponible en la informacion | no disponible | Modelo base de generacion de texto | no disponible | HuggingFace (`Aleph-Alpha/Kolibri-1`) |
| Otros fixtures de `transformers-mic` | variable | no disponible | Pruebas de integracion | no disponible | HuggingFace (`huggingface-mic`) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado lingüístico; no usar en producción ni en evaluaciones de calidad.
- Etiquetado explícito como `test-artifact`: el autor lo excluye de la búsqueda de modelos candidatos.
- Solo 2 capas ocultas: no representa el comportamiento del checkpoint `Aleph-Alpha/Kolibri-1` completo.
- Licencia no explicitada en la información disponible; el fichero `LICENSE` se copia del modelo base, por lo que las condiciones de uso comercial dependen de dicho modelo y deben verificarse en su repositorio.
- Sin datos de sesgos, alucinación o cobertura idiomática, al no ser un modelo entrenado.
- El repositorio no incluye todos los ficheros reconstruibles; el autor indica que deben regenerarse con `build_fixtures.py`.
- No apto para benchmarks, evaluación de capacidades ni despliegue en atención al cliente o generación de código.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Kolibri-1-mic
- Modelo base: https://huggingface.co/Aleph-Alpha/Kolibri-1
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Kolibri-1-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Kolibri-1-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Kolibri-1-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Kolibri-1-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Kolibri-1-mic.html
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
