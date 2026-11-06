# huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic

## Resumen

`huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` dentro del proyecto `transformers-mic`. No es un modelo funcional: se trata de una version reducida artificialmente del checkpoint `deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct` de DeepSeek, con solo 13,2 millones de parametros y pesos generados aleatoriamente (semilla 17). Su proposito es servir como fixture reproducible para validar contratos de integracion con Transformers, no para inferencia real.

El repositorio replica la arquitectura `DeepseekV2ForCausalLM` del modelo original pero con la configuracion reducida a 2 capas ocultas, manteniendo los mismos nombres de tensores que el checkpoint real. Los ficheros de procesador (tokenizer, configuracion, modeling) se copian byte a byte del modelo base, de modo que las pruebas de integracion ejercitan exactamente el mismo codigo de carga y tokenizacion.

Es relevante unicamente para desarrolladores que trabajen en el mantenimiento de integraciones de Transformers o en el proyecto `transformers-mic`: permite ejecutar pruebas de contrato (input-sensitivity, finitud en float32/bfloat16/float16, forward, loss, gradientes) sin descargar el modelo completo de 16B parametros. La etiqueta `test-artifact` lo excluye explicitamente de busquedas de modelos candidatos para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV2ForCausalLM (transformer, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 13.196.896 |
| Parametros activos | no disponible (el modelo base es MoE, pero la configuracion del fixture no documenta expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Dtype de carga | bfloat16 (por defecto, igual que el modelo base) |
| Repo size | 0.0 GB |
| Descargas | 495 |
| Likes | 0 |
| Fecha de creacion | 2026-10-29 |
| Fecha de actualizacion | 2026-11-05 |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura `DeepseekV2ForCausalLM` del modelo base `deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct`, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic` (concretamente `num_hidden_layers = 2`). Los ficheros `configuration_deepseek.py`, `generation_config.json`, `modeling_deepseek.py`, `tokenization_deepseek_fast.py`, `tokenizer.json` y `tokenizer_config.json` se copian byte a byte del checkpoint original, garantizando que el codigo de carga y el tokenizador son identicos a los del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, produjo 1,11). Los tensores conservan los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. No se documentan datos de entrenamiento, RLHF ni innovaciones tecnicas propias, ya que el artefacto no entrena.

## Capacidades

- No es un modelo usable: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de integracion para validar la carga de `DeepseekV2ForCausalLM` en Transformers.
- Verifica contratos de entrada/salida: sensibilidad a `input_ids`, finitud de logits, loss y gradientes en float32, bfloat16 y float16.
- Permite probar el tokenizador `tokenization_deepseek_fast.py` y `tokenizer.json` copiados del modelo base.
- Reproduce los nombres de tensores del checkpoint real, lo que facilita pruebas de compatibilidad de pesos.
- No soporta tool calling, agentes, vision ni capacidades multilingues reales (no disponibles en el fixture).
- No dispone de modo thinking ni capacidades especiales.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la configuracion `DeepseekV2ForCausalLM` se resuelve correctamente sin descargar el modelo de 16B.
- Validacion de contratos en CI: ejecutar la puerta de sensibilidad a la entrada y comprobar que las perturbaciones mueven los logits por encima del umbral de 0,001.
- Pruebas de finitud numerica: verificar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de validar el checkpoint real.
- Desarrollo de integraciones de tokenizer: comprobar que `tokenization_deepseek_fast.py` y `tokenizer.json` cargan y tokenizan igual que en el modelo base, sin coste de descarga.
- Regresion de codigo de modelado: detectar roturas en `modeling_deepseek.py` al actualizar Transformers, usando un checkpoint ligero y reproducible.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture DeepSeek-Coder-V2-Lite-Instruct-mic` y comparar hashes registrados en `build.json`.
- Pruebas de compatibilidad de pesos: validar que los nombres de tensores del fixture coinciden con los del checkpoint real antes de migrar pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto es un fixture de prueba con pesos aleatorios y no tiene rendimiento medible en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (13,2M parametros), aunque el modelo no es funcional.
- GPU recomendadas: cualquiera con soporte bfloat16 o float16; no requiere GPU dedicada para las pruebas.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: Transformers (carga directa con `AutoModelForCausalLM`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, el coste es despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic` | 13,2M | no disponible | Fixture de test | no disponible | Hugging Face |
| `deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct` | ~16B (MoE, 2,4B activos) | no disponible en esta ficha | Modelo de codigo real | no disponible en esta ficha | Hugging Face |
| Otros fixtures de `transformers-mic` | variable | no disponible | Pruebas de contrato | no disponible | Hugging Face |

La comparativa solo es significativa frente al modelo base: el fixture replica su arquitectura y tokenizador, pero no sus pesos ni su rendimiento.

## Limitaciones y advertencias

- Los pesos son aleatorios (semilla 17): el modelo no genera texto coherente ni codigo util.
- Es un artefacto de prueba etiquetado `test-artifact`; no debe usarse en produccion ni en evaluaciones de calidad.
- La licencia no esta declarada en la informacion disponible; verificar la licencia del modelo base antes de cualquier reutilizacion.
- Solo tiene 2 capas ocultas, por lo que su comportamiento no representa el del modelo base de 16B.
- No se documentan idiomas soportados ni longitud de contexto.
- Riesgo de confusion: el nombre incluye `DeepSeek-Coder-V2-Lite-Instruct`, pero no es ese modelo; descargarlo esperando capacidades de codigo produce resultados invalidos.
- No se documenta soporte para cuantizacion ni para frameworks de despliegue distintos de Transformers.
- La fecha de creacion (2026-10-29) es posterior a la actual; tratar como dato del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-Coder-V2-Lite-Instruct-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-Coder-V2-Lite-Instruct-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
