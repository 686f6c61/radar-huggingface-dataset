# huggingface-mic/llama-mic

## Resumen

`llama-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face, no un modelo entrenado para uso real. Se trata de un *fixture* o modelo reducido ("slim") derivado de `HuggingFaceTB.SmolLM2-135M`, con arquitectura `LlamaForCausalLM` y pesos aleatorios generados con semilla 17. Su propósito es servir como banco de pruebas para validar contratos de integración con Transformers, no para generar texto útil.

El repositorio contiene pesos reducidos, ejemplos de uso ejecutables y expectativas de framework en un único lugar. El modelo conserva la misma arquitectura y los mismos nombres de tensores que el checkpoint real, pero con solo 2 capas ocultas y 3.219.776 parámetros totales, frente a los 135 millones del modelo base. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

Su relevancia es metodológica: demuestra cómo construir fixtures ligeros que validen flujos de integración (carga, forward, loss, gradientes) en entornos como A10G con variantes eager, bfloat16 y float16, sin necesidad de descargar checkpoints completos. No es un modelo para producción ni para evaluación de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parámetros totales | 3.219.776 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un `LlamaForCausalLM` reducido mediante la regla genérica de `sweep.py` del proyecto `transformers-mic`, que reduce `num_hidden_layers` a 2. Los archivos de procesador (`generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde `HuggingFaceTB.SmolLM2-135M`, por lo que el tokenizador es idéntico al del modelo base.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movió los logits al menos 0.001 (el caso más débil, `input_ids:reverse`, movió 2.12). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 para forward, loss y gradientes. La validación se realizó en una NVIDIA A10G con variantes default, eager y bfloat16, con grabación de línea base en proceso fresco.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture para validar la carga de `LlamaForCausalLM` en Transformers.
- Permite comprobar forward, cálculo de loss y gradientes en float32, bfloat16 y float16.
- Valida la compatibilidad del tokenizador copiado desde SmolLM2-135M.
- Soporta la ejecución de contratos de integración definidos en `integration.json`.
- No dispone de tool calling, agentes, razonamiento multilingüe ni capacidades especiales.
- No soporta visión, audio ni modo thinking.

## Casos de uso

- Validación de integración con Transformers: usar el fixture para comprobar que una versión de Transformers carga correctamente un `LlamaForCausalLM` sin descargar el checkpoint completo de 135M.
- Pruebas de CI/CD en pipelines de transformers-mic: ejecutar el contrato definido en `integration.json` en cada pull request para detectar regresiones en carga, forward y gradientes.
- Verificación de dtypes: comprobar que el modelo produce salidas finitas en float32, bfloat16 y float16 antes de probar con checkpoints reales.
- Validación de tokenizadores: al copiar los archivos de procesador byte a byte desde SmolLM2-135M, sirve para testear flujos de tokenización idénticos al modelo base.
- Reproducción de evidencia de regeneración: el repositorio enlaza una ejecución de GitHub Actions que permite reproducir la construcción del fixture con `build_fixtures.py`.
- Formación y documentación: ejemplo didáctico de cómo reducir un checkpoint preservando nombres de tensores y contrato de entrada para pruebas de framework.
- Desarrollo de herramientas de inspección: validar scripts que enumeran capas, parámetros y configuraciones de un modelo Llama sin coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (3,2M parámetros), aunque el dato exacto no está disponible.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; la validación oficial se realizó en una NVIDIA A10G.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (validado), potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería mínima pero no representativa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| llama-mic | 3.219.776 | no disponible | no disponible | Fixture de test |
| SmolLM2-135M | 135M | no disponible en la información | no disponible en la información | Modelo pequeño funcional |
| SmolLM2-360M | 360M | no disponible en la información | no disponible en la información | Modelo pequeño funcional |

La comparación es limitada: `llama-mic` no es un modelo funcional, sino un derivado reducido de SmolLM2-135M. Los datos de contexto y licencia de los modelos SmolLM2 no se proporcionan en la información disponible.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto coherente ni responde a instrucciones.
- Está etiquetado como `test-artifact`; no debe usarse en producción ni en evaluación de capacidades.
- No se especifica licencia, lo que impide confirmar condiciones de uso comercial.
- No se declaran idiomas soportados.
- La longitud de contexto no está documentada.
- El contrato declara objetivos solo para el fixture; la cobertura del checkpoint completo es un trabajo separado.
- No debe incluirse en búsquedas de modelos candidatos ni en comparativas de rendimiento real.
- Cualquier uso que espere comportamiento de lenguaje natural fallará por diseño.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/llama-mic)
- [Modelo base SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M)
- [Evidencia de regeneración (GitHub Actions)](https://github.com/huggingface/transformers-mic/actions/runs/38252430459)
- [Cómo se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/llama-mic.html)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
