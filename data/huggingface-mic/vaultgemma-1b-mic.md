# huggingface-mic/vaultgemma-1b-mic

## Resumen

`vaultgemma-1b-mic` es un artefacto de prueba (test artifact) publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real, sino de una "fixture" reducida del modelo `google/vaultgemma-1b`, creada para validar contratos de integración con frameworks (principalmente Transformers). El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

El repositorio contiene únicamente pesos reducidos (16.466.240 parámetros según los safetensors) con la misma arquitectura que el modelo base (`VaultGemmaForCausalLM`) pero con `num_hidden_layers` reducido a 2, pesos aleatorios con semilla 17 y los ficheros de procesador copiados byte a byte desde `google/vaultgemma-1b`. Su propósito es servir como fixture reproducible para pruebas de integración, no como modelo funcional.

Es relevante ahora porque ilustra una práctica creciente de empaquetar "contratos ejecutables" junto a los pesos: manifiestos de integración, expectativas de framework y procedencia de la fixture en un mismo repositorio. Para desarrolladores que mantienen capas de compatibilidad con Transformers, este tipo de artefacto permite probar pipelines sin descargar checkpoints completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VaultGemmaForCausalLM (transformer causal, config reducida) |
| Parametros totales | 16.466.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La fixture replica la arquitectura del modelo base `google/vaultgemma-1b` mediante la clase `VaultGemmaForCausalLM`, pero con una configuración reducida: `num_hidden_layers` igual a 2, aplicando la regla genérica de reducción definida en `sweep.py` del repositorio `huggingface/transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que cualquier código que cargue el modelo real puede cargar la fixture sin cambios en el mapeo de pesos.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, con 0,387). Los ficheros de procesador (`generation_config.json`, `special_tokens_map.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte desde `google/vaultgemma-1b`. La fixture es finita en float32, bfloat16 y float16 (forward, loss y gradientes). La clave de fixture es `0fb47d3fcf1c` y cubre todos los checkpoints cuyos ficheros de procesador sean idénticos byte a byte y cuya config coincida tras el proceso de reducción.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas de razonamiento, código o matemáticas.
- Sirve como fixture de integración para validar la carga de `VaultGemmaForCausalLM` en Transformers.
- Permite verificar el contrato de entradas y salidas (manifiesto `integration.json`) y las expectativas de framework (`integrations/transformers/expectations`).
- Reproduce los nombres de tensores del checkpoint real, útil para probar mapeos de pesos.
- Mantiene los ficheros de tokenizador del modelo base, por lo que el pipeline de tokenización puede ejercitarse.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido.
- No dispone de capacidades multilingües propias más allá de las que herede el tokenizador copiado.

## Casos de uso

- Pruebas de integración en Transformers: cargar la fixture con `AutoModelForCausalLM` para verificar que la clase `VaultGemmaForCausalLM` se resuelve y que el forward pass produce logits con la forma esperada, sin descargar el checkpoint completo.
- Validación de contratos de API: usar `integration.json` y el directorio de expectativas para comprobar que los cambios en el framework no rompen las firmas de entrada/salida del modelo.
- CI/CD de librerías de inferencia: incluir la fixture en la suite de tests para detectar regresiones en la carga de safetensors en bfloat16, float16 y float32.
- Pruebas de tokenización: al conservar `tokenizer.model` y `tokenizer_config.json` del modelo base, permite verificar pipelines de tokenización sin pesos reales.
- Desarrollo de herramientas de inspección de modelos: útil para probar utilidades que leen config, nombres de tensores y dtypes sin consumir ancho de banda ni VRAM significativa.
- Reproducibilidad de fixtures: el repositorio documenta la procedencia (`build.json`) y el método de reducción, lo que permite reconstruir la fixture con `python example/build_fixtures.py --fixture vaultgemma-1b-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,5 M de parámetros), aunque el repositorio reporta un tamaño de 0,0 GB, lo que sugiere pesos muy reducidos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer, e incluso en CPU para pruebas de integración.
- Opciones de despliegue: Transformers (principal caso de uso); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser una fixture de 2 capas, el coste es despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vaultgemma-1b-mic | 16,5 M | no disponible | Fixture de test | no disponible | Hugging Face |
| google/vaultgemma-1b | no disponible | no disponible | Modelo base real | no disponible | Hugging Face |
| Otras fixtures de transformers-mic | variable | no disponible | Fixtures de test | no disponible | Hugging Face / GitHub |

No se dispone de información suficiente para comparar rendimiento con alternativas, ya que la fixture no está pensada para tareas de inferencia.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida carece de significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede asumir uso comercial permitido.
- Idiomas no disponibles; el tokenizador heredado del modelo base no garantiza cobertura funcional.
- Configuración reducida a 2 capas: no representa el comportamiento del modelo base real.
- Riesgo de confusión: el nombre puede sugerir un modelo funcional de VaultGemma; conviene revisar `build.json` e `integration.json` antes de usarlo.
- No se documentan sesgos, alucinaciones ni límites de contexto porque no aplica a un artefacto de prueba.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/vaultgemma-1b-mic
- Modelo base: https://huggingface.co/google/vaultgemma-1b
- Documentación de uso en Transformers: integrations/transformers/usage.md (dentro del repo)
- Expectativas de Transformers: integrations/transformers/expectations (dentro del repo)
- Manifiesto de contrato: integration.json (dentro del repo)
- Procedencia de la fixture: build.json (dentro del repo)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/vaultgemma-1b-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
