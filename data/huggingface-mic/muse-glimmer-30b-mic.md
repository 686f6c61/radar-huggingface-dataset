# huggingface-mic/Muse-Glimmer-30B-mic

## Resumen

Muse-Glimmer-30B-mic es un artefacto de prueba publicado por el usuario huggingface-mic, no un modelo utilizable en producción. Se trata de un "fixture" reducido del modelo base meta-models/Muse-Glimmer-30B, creado para validar contratos de integración con Transformers y verificar expectativas de framework. El repositorio contiene pesos "slim" de 26,2 millones de parámetros con pesos aleatorios (semilla 17), no entrenados, que replican la arquitectura y los nombres de tensores del checkpoint original.

El modelo conserva la arquitectura multimodal `MuseGlimmerForConditionalGeneration` del modelo base, pero con la configuración reducida a 2 capas en la torre de texto y 2 capas en la torre de visión. Los ficheros de procesador (tokenizer, chat template, generation config, processor config y política de uso) se copiaron byte a byte del modelo original, de modo que el fixture reproduce fielmente la interfaz de entrada/salida, aunque los pesos no tengan ningún valor semántico.

Su relevancia es exclusivamente de ingeniería: sirve para que los mantenedores de transformers-mic comprueben que las integraciones (usage, expectations, manifest) funcionan sin necesidad de descargar un checkpoint de 30B. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe usarse para inferencia real, generación de texto ni evaluación de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (multimodal, texto + visión); configuración reducida a 2 capas de texto y 2 de visión |
| Parámetros totales | 26.163.904 (26,2 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia un fichero LICENSE del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Muse-Glimmer-30B, un modelo multimodal de tipo `MuseGlimmerForConditionalGeneration` que combina una torre de texto y una torre de visión. En este fixture, la configuración se ha reducido mediante la regla genérica de `sweep.py`: `text num_hidden_layers = 2` y `vision num_hidden_layers = 2`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture es intercambiable a nivel de código.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y solo pasaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,0534). El modelo se guardó en bfloat16, el dtype por defecto del checkpoint original, y se verificó que es finito en float32, bfloat16 y float16 (forward, loss y gradientes). Los ficheros de procesador (`tokenizer.json`, `chat_template.jinja`, `generation_config.json`, `processor_config.json`, `LICENSE`, `USAGE_POLICY.md`) se copiaron byte a byte del modelo base.

## Capacidades

- No dispone de capacidades reales de generación: los pesos son aleatorios y no han sido entrenados.
- Reproduce la interfaz multimodal del modelo base (entradas de texto e imagen vía `pixel_values`), pero sin semántica aprendida.
- Conserva el `chat_template.jinja` y el `tokenizer.json` del modelo original, por lo que el formateo de conversaciones y la tokenización son idénticos a los del modelo base.
- Conserva el `generation_config.json` y el `processor_config.json` originales.
- Sirve como fixture de pruebas para validar tooling de integración (Transformers, transformers-mic), no para tool calling ni agentes reales.
- No soporta razonamiento, código, matemáticas ni capacidades multilingües verificables, al carecer de entrenamiento.

## Casos de uso

- Validación de integraciones en Transformers: permite ejecutar el pipeline de carga, forward y generación con la misma firma que el modelo real sin descargar 30B de parámetros, verificando que `usage.md` y `expectations` son correctos.
- Pruebas de CI/CD en transformers-mic: el fixture se reconstruye con `python example/build_fixtures.py --fixture Muse-Glimmer-30B-mic` y se usa para comprobar que los cambios en el código no rompen el contrato del modelo.
- Verificación de compatibilidad de procesador: al copiar byte a byte tokenizer, chat template y configs, permite probar que el preprocesado de texto e imagen funciona antes de escalar al checkpoint completo.
- Desarrollo de harness de evaluación: sirve para probar el arnés de benchmarks (carga, batching, métricas) con un modelo pequeño y rápido antes de lanzarlo contra el modelo real.
- Pruebas de dtype y estabilidad numérica: al ser finito en float32, bfloat16 y float16, permite validar rutas de mixed precision y acumulación de gradientes en el framework.
- Reproducción de contratos de entrada: la puerta de sensibilidad (perturbaciones de `pixel_values` y entradas de texto mueven los logits) permite comprobar que el pipeline propaga correctamente las entradas multimodales.
- Documentación de referencia: el repositorio incluye `integration.json`, `build.json` y la página de "shrink", útiles como ejemplo de cómo reducir un checkpoint preservando la interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, etc.) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (26,2 M de parámetros, repo de 0,2 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada; también en CPU.
- Opciones de despliegue: carga directa con Transformers (`MuseGlimmerForConditionalGeneration`); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2+2 capas, la latencia sería mínima, pero irrelevante para producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Muse-Glimmer-30B-mic (este) | 26,2 M (fixture) | no disponible | no disponible | Artefacto de prueba |
| meta-models/Muse-Glimmer-30B | 30B (según nombre) | no disponible | no disponible | Modelo multimodal real |
| Otros fixtures de transformers-mic | variable | no disponible | no disponible | Pruebas de integración |

No se dispone de información sobre modelos comparables de la misma categoría (fixtures de prueba) más allá de la familia transformers-mic. La comparación con modelos reales de 30B no es pertinente porque este artefacto no ejecuta inferencia con sentido.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; cualquier salida es ruido.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe promocionarse como modelo.
- Riesgo de confusión: el nombre "30B" hace referencia al modelo base, no al tamaño real del fixture (26,2 M).
- La licencia no está disponible en la información proporcionada; el repo incluye un `LICENSE` copiado del modelo base, pero su contenido no se detalla, por lo que no se puede confirmar el uso comercial.
- No se documentan idiomas soportados ni longitud de contexto.
- No apto para producción, evaluación de calidad, ni despliegue en atención al cliente, generación de código o agentes.
- La puerta de sensibilidad solo garantiza que las entradas afectan a los logits, no que el modelo sea coherente.
- El repositorio depende de scripts externos (`build_fixtures.py`, `sweep.py`) para su reconstrucción; cambios en esos scripts pueden invalidar el fixture.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Muse-Glimmer-30B-mic
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Manifest de contrato: integration.json (en el repo)
- Uso con Transformers: integrations/transformers/usage.md (en el repo)
- Expectativas de Transformers: integrations/transformers/expectations (en el repo)
- Procedencia del fixture: build.json (en el repo)
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Muse-Glimmer-30B-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
