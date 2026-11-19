# huggingface-mic/gemma-3n-E2B-it-mic

## Resumen

`gemma-3n-E2B-it-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo usable: se trata de una versión reducida artificialmente del modelo `google/gemma-3n-E2B-it` de Google, pensada para validar contratos de integración entre frameworks (en concreto, Transformers) y arquitecturas reales. La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El fixture conserva la arquitectura `Gemma3nForConditionalGeneration` pero con una configuración drásticamente reducida: 4 capas ocultas de texto y un total de 51.492.816 parámetros, frente a los miles de millones del modelo base. Los pesos son aleatorios (semilla 17) y no han sido entrenados; su validez se limita a comprobar que las entradas del contrato mueven los logits de forma medible.

Su relevancia es metodológica, no funcional: sirve como banco de pruebas reproducible para desarrolladores que integran modelos Gemma 3n en pipelines de Transformers, verificando nombres de tensores, procesadores y compatibilidad de dtypes sin necesidad de descargar el checkpoint completo. Cualquier uso generativo real debe hacerse sobre el modelo base original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma3nForConditionalGeneration` (transformer multimodal, configuración reducida) |
| Parametros totales | 51.492.816 |
| Parametros activos | no disponible (el modelo base Gemma 3n E2B es de tipo MoE, pero la ficha no aporta el dato de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `Gemma3nForConditionalGeneration`, la misma que usa el checkpoint real `google/gemma-3n-E2B-it`, pero con una configuración encogida mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: `num_hidden_layers` de texto reducido a 4. Los nombres de tensores coinciden con los del checkpoint real, de modo que el fixture ejercita exactamente las mismas rutas de código que el modelo completo.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (la más débil, `attention_mask:all_ones`, con 0,0859). Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`, entre otros) se copiaron byte a byte desde el modelo base. El fixture se guarda en bfloat16, el dtype por defecto del checkpoint original, y se declara finito en float32, bfloat16 y float16 para forward, loss y gradientes.

## Capacidades

- No es un modelo generativo funcional: los pesos aleatorios no producen texto coherente.
- Valida contratos de integración con Transformers: carga, forward, loss y gradientes sobre la arquitectura Gemma 3n.
- Comprueba la compatibilidad byte a byte de los ficheros de procesador y tokenizador del modelo base.
- Permite verificar nombres de tensores y dtypes sin descargar el checkpoint completo.
- Sirve como fixture reproducible para pruebas de regresión en frameworks.
- No dispone de tool calling, agentes, visión, audio ni capacidades multilingües reales, al carecer de pesos entrenados.

## Casos de uso

- Pruebas de integración en Transformers: usar el fixture para verificar que una nueva versión de la librería carga correctamente la arquitectura `Gemma3nForConditionalGeneration` sin necesidad de descargar el modelo completo.
- Validación de pipelines CI/CD: incluir el fixture en la batería de tests de un framework para detectar regresiones en el manejo de nombres de tensores o dtypes.
- Verificación de compatibilidad de procesadores: comprobar que el tokenizador y la plantilla de chat copiados del modelo base se integran correctamente con el resto del pipeline.
- Desarrollo de herramientas de inspección de modelos: usar el fixture como caso controlado de 51,5 M de parámetros para probar utilidades de análisis de pesos y configuraciones.
- Reproducibilidad de experimentos: el fichero `build.json` registra fuentes fijadas, resultados de las puertas de validación y hashes de ficheros, permitiendo reconstruir el fixture con `build_fixtures.py`.
- Formación y documentación: servir de ejemplo didáctico de cómo se construye un fixture de modelo y qué garantías debe cumplir.
- Pruebas de tolerancia numérica: validar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fixture completo ocupa aproximadamente 1,3 GB en el repositorio, con pesos en bfloat16; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente para cargar el fixture.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (vía `integrations/transformers/usage.md`); no se documentan opciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; al ser pesos aleatorios y un modelo de prueba, no se han publicado métricas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gemma-3n-E2B-it-mic` | 51,5 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| `google/gemma-3n-E2B-it` | no disponible en la informacion | no disponible | Modelo multimodal usable | no disponible en la informacion | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable (configuracion reducida) | no disponible | Pruebas de contrato | no disponible | Hugging Face |

La comparación directa con modelos de producción no es significativa: el fixture no compite en capacidad generativa, sino que actúa como banco de pruebas de la arquitectura del modelo base.

## Limitaciones y advertencias

- Los pesos son aleatorios: no generarán texto, código ni respuestas coherentes.
- No debe usarse en producción ni como sustituto del modelo base `google/gemma-3n-E2B-it`.
- La model card lo marca como `test-artifact`; su inclusión en pipelines de búsqueda de modelos debe evitarse.
- La licencia no está declarada en la información disponible; verificar los términos del modelo base antes de cualquier uso.
- La configuración reducida (4 capas) no representa el comportamiento del modelo completo en términos de calidad, contexto o latencia.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, ya que no hay entrenamiento real.
- Los ficheros de procesador copiados byte a byte pueden quedar desincronizados si el modelo base se actualiza; conviene regenerar el fixture con `build_fixtures.py`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/gemma-3n-E2B-it-mic
- Modelo base: https://huggingface.co/google/gemma-3n-E2B-it
- Manifest de contrato: https://huggingface.co/huggingface-mic/gemma-3n-E2B-it-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/gemma-3n-E2B-it-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/gemma-3n-E2B-it-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/gemma-3n-E2B-it-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-3n-E2B-it-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
