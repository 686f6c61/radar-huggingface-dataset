# huggingface-mic/paligemma-3b-pt-224-mic

## Resumen

`huggingface-mic/paligemma-3b-pt-224-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) derivado de `leo009/paligemma-3b-pt-224`. Lo publica la organizacion `huggingface-mic` con el objetivo de validar contratos de integracion de Transformers sobre la arquitectura PaliGemma vision-lenguaje sin necesidad de descargar ni ejecutar los pesos completos del modelo original. Los pesos son aleatorios (semilla 17) y el modelo esta explicitamente etiquetado como `test-artifact`.

El fixture conserva la misma clase de arquitectura (`PaliGemmaForConditionalGeneration`) y los mismos nombres de tensor que el checkpoint real, pero con una configuracion reducida: 2 capas en el codificador visual y 2 capas en el modelo de texto. El resultado son 16.657.088 parametros (frente a los aproximadamente 3.000 millones del PaliGemma original), guardados en float32 y con un tamano de repositorio de 0,2 GB.

Su relevancia es puramente de ingenieria: permite a los mantenedores de Transformers y a desarrolladores de integraciones comprobar la sensibilidad a entradas, la paridad de nombres de tensor, la finitud numerica en float32/bfloat16/float16 y el comportamiento del procesador copiado byte a byte del modelo base. No debe usarse para inferencia real, generacion de texto ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma vision-lenguaje (`PaliGemmaForConditionalGeneration`), transformer con codificador visual y decodificador de texto |
| Parametros totales | 16.657.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, verificados como finitos tambien en bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `leo009/paligemma-3b-pt-224` |
| Capas (fixture) | 2 en vision, 2 en texto |
| Semilla de pesos | 17 (pesos aleatorios) |
| Tamano del repositorio | 0,2 GB |
| Descargas | 2416 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PaliGemma: un codificador visual acoplado a un decodificador de texto dentro de la clase `PaliGemmaForConditionalGeneration`. En este fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`, dejando 2 capas ocultas en la parte visual y 2 en la de texto. Los ficheros del procesador (`added_tokens.json`, `generation_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer.model`, `tokenizer_config.json`) se copiaron byte a byte desde `leo009/paligemma-3b-pt-224`, de modo que el pipeline de tokenizacion y preprocesado es identico al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `token_type_ids:all_ones`, produjo 0,0225). El fixture mantiene los mismos nombres de tensor que el checkpoint real, esta guardado en float32 (el dtype por defecto de carga del modelo base) y se verifico como finito en float32, bfloat16 y float16 para forward, perdida y gradientes. La clave de fixture es `dce4ad09e24d` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas semanticamente validas.
- Verificacion de contratos de integracion de Transformers sobre la arquitectura PaliGemma vision-lenguaje.
- Comprobacion de paridad de nombres de tensor con el checkpoint real `leo009/paligemma-3b-pt-224`.
- Prueba de sensibilidad a entradas del contrato (perturbaciones de inputs y su efecto en logits).
- Validacion de estabilidad numerica en float32, bfloat16 y float16 (forward, perdida, gradientes).
- Ejecucion de los ficheros de procesador reales (tokenizer y preprocessor copiados byte a byte).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en Transformers: sirve para validar que una version de la libreria carga, ejecuta forward y calcula gradientes sobre `PaliGemmaForConditionalGeneration` sin descargar los aproximadamente 3.000 millones de parametros del modelo original.
- CI/CD de librerias de modelado: al pesar 0,2 GB y tener 16,7M de parametros, se puede incluir en pipelines de integracion continua para detectar regresiones en el manejo de tensores, dtypes y nombres de parametros.
- Validacion de contratos de framework: el repositorio incluye `integration.json` y `integrations/transformers/expectations`, pensados para comprobar que una implementacion cumple las expectativas declaradas (formas de entrada, dtypes admitidos, finitud de salidas).
- Verificacion de paridad de tokenizer y preprocesado: al copiar los ficheros del procesador byte a byte, permite probar que el pipeline de tokenizacion y preprocesado de imagenes coincide con el del modelo base sin cargar los pesos reales.
- Pruebas de sensibilidad numerica: util para comprobar que pequenas perturbaciones en las entradas producen cambios medibles en los logits (umbral de 0,001), como test de que el grafo computacional no esta desconectado.
- Desarrollo de herramientas de reduccion de modelos: el fixture se genero con `sweep.py` y `build_fixtures.py`, por lo que sirve como referencia reproducible para validar nuevas reglas de reduccion de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,7M de parametros, aproximadamente 67 MB de pesos) y alrededor de 35 MB en bfloat16/float16.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: carga directa con Transformers (`AutoModelForConditionalGeneration` o la clase especifica de PaliGemma); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la latencia seria muy baja pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/paligemma-3b-pt-224-mic` | 16.657.088 | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face, 2416 descargas |
| `leo009/paligemma-3b-pt-224` | aproximadamente 3.000 millones (PaliGemma 3B) | no disponible | Modelo vision-lenguaje real | no disponible | Hugging Face |
| PaliGemma 3B pt-224 original (Google) | aproximadamente 3.000 millones | no disponible | Modelo vision-lenguaje preentrenado | no disponible en la informacion proporcionada | Hugging Face / Kaggle |

La comparacion relevante es con su modelo base: mismo pipeline de procesado y misma arquitectura, pero con dos ordenes de magnitud menos de parametros y pesos aleatorios en lugar de entrenados.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera salidas coherentes ni utiles; cualquier uso como modelo real es un error.
- Etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe aparecer en catalogos de produccion.
- Licencia no disponible: no se puede asumir uso comercial ni redistribucion sin consultar el modelo base `leo009/paligemma-3b-pt-224`.
- Idiomas soportados no documentados; el tokenizer se hereda del modelo base, pero el fixture no ha sido validado linguisticamente.
- Contexto maximo no documentado en la informacion proporcionada.
- Riesgo de confusion con el modelo base: el nombre incluye "3b" y "224" aunque el fixture tiene 16,7M de parametros.
- No apto para evaluaciones de calidad, benchmarks de razonamiento ni despliegues de atencion al cliente, generacion de codigo o agentes.
- La cobertura del fixture se limita a los checkpoints con procesador identico byte a byte y config coincidente tras la reduccion; no cubre variantes con otro preprocesado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/paligemma-3b-pt-224-mic
- Modelo base: https://huggingface.co/leo009/paligemma-3b-pt-224
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/paligemma-3b-pt-224-mic.html
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
