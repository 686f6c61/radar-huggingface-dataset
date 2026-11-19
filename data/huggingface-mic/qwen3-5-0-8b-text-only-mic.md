# huggingface-mic/Qwen3.5-0.8B-text-only-mic

## Resumen

`huggingface-mic/Qwen3.5-0.8B-text-only-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) de 16,0 millones de parámetros construido por el equipo de Hugging Face para validar la integración del modelo `principled-intelligence/Qwen3.5-0.8B-text-only` en el ecosistema Transformers. Reproduce la arquitectura `Qwen3_5ForCausalLM` con una configuración reducida (`num_hidden_layers` igual a 2) y pesos aleatorios generados con semilla 17, por lo que no produce texto coherente ni sirve para inferencia real.

Su propósito es de ingeniería: empaquetar en un único repositorio los pesos "slim", el manifiesto de contrato (`integration.json`), el uso ejecutable con Transformers y el directorio de expectativas del framework, de modo que los tests de integración puedan ejecutarse sin descargar el checkpoint completo. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base, y los nombres de tensores coinciden con los del checkpoint real.

La relevancia es acotada y muy específica: sirve a mantenedores de Transformers y a autores de integraciones que necesitan verificar que su código carga, ejecuta el forward, calcula pérdida y propaga gradientes con la arquitectura Qwen3.5 sin incurrir en el coste de un modelo de 0,8B. Está etiquetado explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer causal, configuración reducida a 2 capas) |
| Parametros totales | 16.045.456 (16,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con la clase `Qwen3_5ForCausalLM` de Transformers, pero con la profundidad recortada a 2 capas mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`. Los pesos son aleatorios (semilla 17) y no han pasado por ningún proceso de entrenamiento, RLHF ni DPO. El autor justifica la ausencia de entrenamiento indicando que la fixture superó la "input-sensitivity gate": cada perturbación de las entradas del contrato movió los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, registró 0,838).

Los ficheros de procesador se copiaron byte a byte desde `principled-intelligence/Qwen3.5-0.8B-text-only`, y los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture actúa como sustituto estructural en tests. Se verificó que el modelo es finito en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. La clave de fixture `cebc28668438` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos y cuya configuración coincide tras el recorte.

## Capacidades

- No genera texto coherente: los pesos son aleatorios y el modelo no ha sido entrenado.
- Sirve como sustituto estructural para tests de carga, forward, cálculo de pérdida y retropropagación con la arquitectura Qwen3.5.
- Permite validar plantillas de chat y tokenizador idénticos a los del modelo base real.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma funcional.
- No tiene capacidades multilingües efectivas (el tokenizador es el del base, pero los pesos no codifican conocimiento lingüístico).
- No incluye modo thinking, visión ni audio.
- Utilidad principal: verificación de contratos de integración en CI y desarrollo de integraciones de Transformers.

## Casos de uso

- Tests de integración en CI de Transformers: ejecutar el ciclo completo de carga, forward y backward con la arquitectura Qwen3.5 en segundos y sin GPU dedicada, gracias a sus 16 M de parámetros.
- Desarrollo de nuevas integraciones de framework: validar que el código de carga y el mapeo de tensores funcionan antes de probar contra el checkpoint real de 0,8B.
- Verificación de contratos de API: comprobar que las entradas y salidas declaradas en `integration.json` se comportan como se espera mediante la input-sensitivity gate.
- Pruebas de plantillas de chat y tokenización: al copiarse los ficheros de procesador byte a byte, se puede testear el pipeline de tokenización sin descargar el modelo completo.
- Validación de precisión numérica: comprobar que el modelo es finito en float32, bfloat16 y float16 en forward, pérdida y gradientes, útil para detectar regresiones en kernels.
- Reproducción de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Qwen3.5-0.8B-text-only-mic` para auditar procedencia y hashes recogidos en `build.json`.
- Formación y documentación: ejemplo didáctico de cómo empaquetar pesos, uso y expectativas en un único repositorio reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad sería carente de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16 M de parámetros, repo de 0,1 GB); cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte bfloat16 (RTX 30xx/40xx, A100, H100) o CPU es suficiente.
- Cabe en GPU consumer: sí, en todas las GPUs modernas e integradas.
- Opciones de despliegue: Transformers (vía `integrations/transformers/usage.md`); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería del orden de milisegundos, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Qwen3.5-0.8B-text-only-mic | 16,0 M | no disponible | no disponible | Fixture de test |
| principled-intelligence/Qwen3.5-0.8B-text-only | ~0,8 B (según nombre) | no disponible | no disponible | Modelo base real |
| Otros fixtures de transformers-mic | variable | no disponible | no disponible | Artefactos de test por arquitectura |

La comparación relevante es con su modelo base: el fixture replica la arquitectura y los ficheros de procesador del checkpoint de 0,8B, pero con 2 capas y pesos aleatorios, por lo que no es intercambiable en producción. No se dispone de datos de benchmarks ni de licencia para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene sentido lingüístico.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Idiomas soportados no documentados; el tokenizador es el del base, pero no hay capacidades lingüísticas reales.
- Contexto máximo no documentado.
- Solo cubre la arquitectura `Qwen3_5ForCausalLM` con `num_hidden_layers` igual a 2; no valida configuraciones más profundas.
- Riesgo de confusión: el nombre incluye "0.8B" pero el artefacto tiene 16 M de parámetros; conviene verificar siempre el recuento real de safetensors.
- No se documentan sesgos ni alucinaciones porque no genera contenido significativo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-text-only-mic
- Modelo base: https://huggingface.co/principled-intelligence/Qwen3.5-0.8B-text-only
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de recorte (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicación del recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-0.8B-text-only-mic.html
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia de la fixture: `build.json` (en el repositorio)
