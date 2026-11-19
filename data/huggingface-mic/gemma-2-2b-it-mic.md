# huggingface-mic/gemma-2-2b-it-mic

## Resumen

`gemma-2-2b-it-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* reducido de `google/gemma-2-2b-it` que conserva la arquitectura `Gemma2ForCausalLM` pero con una configuración drásticamente menor (2 capas ocultas frente a las 26 del original) y pesos aleatorios inicializados con semilla 0. Su propósito es servir como base de pruebas para el proyecto `transformers-mic`, que valida contratos de integración entre frameworks de inferencia y checkpoints reales.

El repositorio incluye los pesos reducidos (16,5 millones de parámetros, frente a los 2.600 millones del modelo base), el manifiesto de contrato (`integration.json`), instrucciones de uso con Transformers y un directorio de expectativas de framework. Los ficheros del procesador (`tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, `generation_config.json`, `special_tokens_map.json`) se copian byte a byte del modelo original, de modo que el tokenizador sí es el real de Gemma 2.

Es relevante únicamente en el contexto de ingeniería de software: permite ejecutar tests de integración de forma rápida y barata, verificar que un pipeline carga tensores con los mismos nombres que el checkpoint real y validar la sensibilidad de las entradas sin necesidad de descargar ni ejecutar el modelo completo. La propia model card lo etiqueta como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse en producción ni como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Gemma2ForCausalLM`), 2 capas ocultas |
| Parametros totales | 16.458.304 (16,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el modelo base soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; compatible con float32 y float16) |
| Idiomas soportados | no disponible (tokenizador de Gemma 2 heredado del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de Gemma 2 (`Gemma2ForCausalLM`) pero con una configuración encogida mediante la regla genérica de `sweep.py` del repositorio `huggingface/transformers-mic`, reduciendo `num_hidden_layers` a 2. Conserva los mismos nombres de tensores que el checkpoint real, lo que permite validar la compatibilidad de cargadores y frameworks sin ambigüedad. Los ficheros del procesador son idénticos byte a byte a los de `google/gemma-2-2b-it`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 0) y pasaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, con 0,401). Se guarda en bfloat16, el dtype por defecto del modelo base, y se verificó que es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se identifica con la clave `6757a5dfa94e` y cubre todos los checkpoints cuyos ficheros de procesador son idénticos y cuya configuración coincide tras el encogimiento.

## Capacidades

- Carga y ejecución en Transformers con la clase `Gemma2ForCausalLM` y el tokenizador real de Gemma 2.
- Validación de contratos de integración entre frameworks (manifiesto `integration.json` y directorio de expectativas).
- Verificación de nombres y formas de tensores frente al checkpoint real.
- Pruebas de sensibilidad de entradas mediante perturbaciones controladas.
- Ejecución en float32, bfloat16 y float16 sin valores no finitos.
- No genera texto coherente: los pesos son aleatorios y no ha habido entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No dispone de modo thinking ni de visión o audio.

## Casos de uso

- Tests de integración en CI: ejecutar la carga del modelo y un forward pass en segundos y con 0,1 GB de descarga, validando que el pipeline de Transformers funciona antes de pasar al checkpoint real de 2.600 M de parámetros.
- Validación de cargadores personalizados: comprobar que un loader propio mapea correctamente los nombres de tensores de Gemma 2 usando el fixture como sustituto barato.
- Verificación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para asegurar que una nueva versión de Transformers mantiene el comportamiento esperado sobre la arquitectura Gemma 2.
- Pruebas de tokenización: al conservar el tokenizador real byte a byte, permite validar pipelines de preprocesado sin cargar el modelo grande.
- Depuración de gradientes y dtypes: comprobar que un pipeline de entrenamiento o fine-tuning produce valores finitos en float32, bfloat16 y float16 sobre una arquitectura Gemma 2 reducida.
- Docencia y demostraciones: ilustrar la estructura interna de un transformer decoder-only de Gemma 2 con un checkpoint manejable en cualquier portátil.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture gemma-2-2b-it-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no es evaluable en tareas de NLP.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,5 M de parámetros); cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es suficiente.
- Cabe en consumer GPU: sí, en todas (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Transformers (principal); compatible con llama.cpp, vLLM u Ollama solo si se convierte el checkpoint, aunque no aporta valor práctico al ser un fixture.
- Latencia y throughput: no disponible; al ser un modelo de 2 capas, el forward pass es del orden de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-2-2b-it-mic | 16,5 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| google/gemma-2-2b-it | 2.600 M | 8.192 tokens | Modelo de chat real | Gemma Terms of Use | Hugging Face |
| google/gemma-2-9b-it | 9.000 M | 8.192 tokens | Modelo de chat real | Gemma Terms of Use | Hugging Face |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Modelo pequeño real | Apache 2.0 | Hugging Face |

La comparación con modelos reales es solo orientativa: el fixture no compite en capacidad, sino que sustituye al checkpoint grande en tests automatizados.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- Sesgos conocidos: no aplica, al no haber entrenamiento; el tokenizador hereda los sesgos del vocabulario de Gemma 2.
- Riesgo de alucinación: total, cualquier texto generado es ruido estadístico.
- Limitaciones de contexto o idioma: la configuración reducida no refleja el contexto real de Gemma 2; los idiomas dependen del tokenizador heredado.
- Restricciones de licencia: la licencia no está declarada en el repositorio; al derivar de `google/gemma-2-2b-it`, podrían aplicar los Gemma Terms of Use, pero conviene verificar antes de cualquier uso.
- Caveat para producción: no desplegar bajo ninguna circunstancia; está etiquetado como `test-artifact` y pensado exclusivamente para testing.
- El tamaño reducido (2 capas) implica que las formas de los tensores difieren del checkpoint real, aunque los nombres coinciden.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gemma-2-2b-it-mic
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Proyecto transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicación del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-2-2b-it-mic.html
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/gemma-2-2b-it-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/gemma-2-2b-it-mic/blob/main/integrations/transformers/usage.md
- Procedencia del fixture: https://huggingface.co/huggingface-mic/gemma-2-2b-it-mic/blob/main/build.json
