# huggingface-mic/tiny_starcoder_py-mic

## Resumen

`huggingface-mic/tiny_starcoder_py-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` dentro del proyecto transformers-mic. No es un modelo entrenado ni utilizable para generacion real: se trata de una version reducida artificialmente del checkpoint `bigcode/tiny_starcoder_py`, con solo 3.724.608 parametros y pesos generados aleatoriamente (semilla 17). Su proposito es servir como contrato de integracion reproducible para validar frameworks y utilidades de inferencia con la arquitectura GPTBigCode.

El repositorio incluye los pesos "slim", ejemplos de uso ejecutables con Transformers y un directorio de expectativas de framework, todo ello acompanado de un manifiesto de contrato (`integration.json`) y un registro de procedencia (`build.json`). La reduccion del modelo se realiza mediante la regla generica de `sweep.py` del repositorio transformers-mic, manteniendo la misma arquitectura (`GPTBigCodeForCausalLM`) y los mismos nombres de tensores que el checkpoint original.

Es relevante ahora porque facilita pruebas de integracion rapidas y ligeras (el repo ocupa 0.0 GB) sin necesidad de descargar el modelo completo, y porque esta explicitamente etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier uso como modelo de generacion de codigo seria inadecuado: los pesos son aleatorios y no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPTBigCode (GPTBigCodeForCausalLM, transformer causal decoder-only) |
| Parametros totales | 3.724.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GPTBigCode en su variante `GPTBigCodeForCausalLM`, un transformer causal decoder-only con atencion multi-query (MQA) caracteristica de la familia StarCoder/StarCoderBase. La configuracion ha sido reducida respecto al checkpoint original `bigcode/tiny_starcoder_py` aplicando la regla generica de reduccion de `sweep.py`, manteniendo intactos los nombres de tensores del checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y unicamente pasaron una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, registro 0.5). Los ficheros de procesador (`generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `bigcode/tiny_starcoder_py`. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No dispone de capacidades reales de generacion: los pesos son aleatorios y no han sido entrenados.
- Sirve como fixture de integracion para validar la carga del modelo, el tokenizador y la ejecucion de forward pass con la arquitectura GPTBigCode.
- Permite comprobar contratos de framework (formas de entrada, dtypes, mascaras de atencion) sin coste computacional significativo.
- Compatible con el pipeline de Transformers para `GPTBigCodeForCausalLM` a nivel estructural.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma funcional.
- No tiene capacidades multilingues verificadas ni modo thinking, vision o audio.

## Casos de uso

- Pruebas de integracion en CI/CD: el modelo permite validar que un pipeline de Transformers carga correctamente un checkpoint GPTBigCode y ejecuta un forward pass sin descargar el modelo completo, gracias a su tamano de 3.7M parametros.
- Desarrollo de frameworks de inferencia: util para verificar contratos de entrada/salida (formas de tensores, dtypes, mascaras) en herramientas como vLLM, TGI o llama.cpp antes de probar con modelos reales.
- Validacion de tokenizadores: al copiar byte a byte los ficheros de procesador del checkpoint original, permite comprobar la integracion del tokenizador de StarCoder sin cargar pesos reales.
- Reproducibilidad de experimentos: el registro `build.json` con hashes y fuentes fijadas permite reconstruir el fixture de forma determinista mediante `build_fixtures.py`.
- Docencia y formacion: sirve para explicar la estructura interna de un transformer causal y la organizacion de un repositorio de modelo en Hugging Face sin requerir GPU.
- Pruebas de robustez numerica: al ser finito en float32, bfloat16 y float16, permite verificar el comportamiento numerico de kernels y operaciones en distintas precisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3.724.608 parametros, aproximadamente 15 MB de pesos); cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU integrada o consumer (GTX 1050, RTX 3060, etc.) es suficiente.
- Cabe en consumer GPU: si, en todas, incluida la mayoria de iGPUs.
- Opciones de despliegue: Transformers (uso documentado en `integrations/transformers/usage.md`); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| huggingface-mic/tiny_starcoder_py-mic | 3.724.608 | no disponible | no disponible | Fixture de prueba (pesos aleatorios) |
| bigcode/tiny_starcoder_py | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo real de generacion de codigo |
| bigcode/starcoderbase | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo de codigo de mayor tamano |

La comparativa con alternativas funcionales no es significativa: el modelo aqui descrito es un artefacto de prueba, no un modelo de generacion. Los datos de `bigcode/tiny_starcoder_py` y `bigcode/starcoderbase` no se detallan en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado y no produce salidas coherentes; no debe usarse para generacion, razonamiento ni codigo.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de busquedas de modelos candidatos; usarlo en produccion seria un error de seleccion.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial; al derivar de `bigcode/tiny_starcoder_py`, habria que consultar la licencia del modelo base.
- Idiomas no disponibles: no hay informacion sobre cobertura linguistica.
- Longitud de contexto no disponible: la configuracion reducida no documenta la ventana de contexto efectiva.
- Riesgo de alucinacion: total, al no existir aprendizaje; cualquier salida es ruido estadistico derivado de pesos aleatorios.
- Sesgos: no evaluables, al no haber datos de entrenamiento reales.
- Uso previsto restringido a validacion de integracion y contratos de framework, no a inferencia funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/tiny_starcoder_py-mic
- Modelo base: https://huggingface.co/bigcode/tiny_starcoder_py
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/tiny_starcoder_py-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Uso con Transformers: integrations/transformers/usage.md (dentro del repositorio)
- Manifiesto de contrato: integration.json (dentro del repositorio)
- Procedencia del fixture: build.json (dentro del repositorio)
