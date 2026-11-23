# huggingface-mic/flint-mic

## Resumen

`huggingface-mic/flint-mic` es un artefacto de prueba (fixture) publicado por el equipo `huggingface-mic`, no un modelo utilizable. Se trata de una version reducida del checkpoint `RecursiveSI/flint` que conserva la misma arquitectura (`FlintForCausalLM`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte, pero con solo 3 capas ocultas y pesos aleatorios. Su proposito es servir como banco de pruebas para validar contratos de integracion (transformers, tokenizer, plantilla de chat) sin necesidad de cargar el modelo completo.

El repositorio incluye los pesos en formato `safetensors` (bfloat16), un manifiesto de contrato (`integration.json`), documentacion de uso y expectativas para Transformers, y metadatos de procedencia (`build.json`). El modelo esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cuenta con 19.490.124 parametros y un tamano de repositorio de 0,1 GB.

Por su naturaleza, no debe emplearse en inferencia real, generacion de texto ni despliegue en produccion. Su interes es exclusivamente para desarrolladores que trabajen en la infraestructura de integracion de modelos (pruebas de CI, validacion de contratos de tokenizer, verificacion de compatibilidad de frameworks) y necesiten un fixture ligero que reproduzca fielmente la interfaz del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `FlintForCausalLM` (transformer causal, version reducida con 3 capas ocultas) |
| Parametros totales | 19.490.124 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal de la clase `FlintForCausalLM`, reducido mediante la regla generica de `sweep.py` del repositorio `transformers-mic` a 3 capas ocultas. Conserva los mismos nombres de tensores que el checkpoint real `RecursiveSI/flint`, de modo que cualquier codigo que espere la interfaz del modelo original puede ejecutarse contra el fixture sin cambios.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,193). Los ficheros de procesador (`LICENSE`, `chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `RecursiveSI/flint`. El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni resuelve tareas reales.
- Reproduce la interfaz de `RecursiveSI/flint`: mismos nombres de tensores, misma plantilla de chat y mismo tokenizer.
- Permite validar contratos de integracion con Transformers (carga, forward, loss, gradientes).
- Sirve como fixture en pruebas de CI para frameworks de inferencia y pipelines de tokenizacion.
- Soporta ejecucion en float32, bfloat16 y float16 sin valores no finitos.
- No dispone de tool calling, agentes, vision, audio ni modo thinking utilizables.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con Transformers y verificar que el pipeline de carga, tokenizacion y forward se ejecuta sin errores antes de probar con el checkpoint real.
- Validacion de contratos de tokenizer: comprobar que `tokenizer.json` y `chat_template.jinja` producen las secuencias esperadas sin descargar el modelo completo.
- Desarrollo de frameworks de inferencia: probar rutas de codigo (vLLM, TGI, llama.cpp adaptado) contra un modelo de 19,5M de parametros que comparte interfaz con el original.
- Verificacion de compatibilidad de dtypes: comprobar que el codigo maneja correctamente bfloat16, float16 y float32 en forward, loss y gradientes.
- Pruebas de sensibilidad a la entrada: usar la puerta de sensibilidad documentada para validar que los cambios en el contrato de entradas afectan a los logits.
- Regresion de nombres de tensores: detectar roturas cuando se renombran capas o se modifica el state dict del modelo base.
- Documentacion y demos: mostrar el flujo de integracion de `RecursiveSI/flint` sin coste de computo ni de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, los benchmarks carecen de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,5M de parametros, ~39 MB de pesos).
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, incluso iGPU) y en CPU.
- Opciones de despliegue: Transformers en Python; no se documentan vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 3 capas, la latencia es despreciable, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/flint-mic` | 19,5M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| `RecursiveSI/flint` | no disponible | no disponible | Modelo real | no disponible | Hugging Face |
| Otros fixtures `huggingface-mic` | variable | no disponible | Fixtures de prueba | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (fixtures de integracion) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado.
- Etiquetado como `test-artifact`; no debe incluirse en busquedas de modelos candidatos ni en produccion.
- La licencia no esta especificada en la informacion disponible; el fichero `LICENSE` se copia del modelo base, pero su contenido no se detalla. Verificar antes de cualquier uso.
- Solo cubre checkpoints de `RecursiveSI/flint` cuyos ficheros de procesador sean byte-identicos y cuya config coincida tras el shrink.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no genera texto real.
- Requiere reconstruir algunos ficheros con `python example/build_fixtures.py --fixture flint-mic` si se necesita regenerar el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/flint-mic
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/flint-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
