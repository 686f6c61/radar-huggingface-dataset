# huggingface-mic/codegen2-16B_P-mic

## Resumen

`huggingface-mic/codegen2-16B_P-mic` es un artefacto de prueba (fixture) publicado por el equipo de Hugging Face MIC, no un modelo utilizable. Se construye a partir de `Salesforce/codegen2-16B_P` mediante una reduccion de configuracion que preserva la arquitectura `CodeGenForCausalLM` pero reduce el numero de parametros a 6.704.128 (6,7 M). Los pesos son aleatorios (semilla 17) y el objetivo declarado es servir como fixture de integracion y validacion de frameworks, no como modelo de generacion de codigo.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers y un directorio de expectativas de framework. Los ficheros de procesador (tokenizer, configuracion y modeling) se copian byte a byte del checkpoint original de Salesforce, de modo que las interfaces de tokenizacion y los nombres de tensores coinciden con el modelo real.

Su relevancia es acotada: sirve para probar pipelines de integracion (carga, forward, sensibilidad de entradas, dtypes) sin descargar los aproximadamente 16.000 millones de parametros del modelo original. Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CodeGenForCausalLM (transformer decoder-only) |
| Parametros totales | 6.704.128 (fixture reducido); modelo base: CodeGen2-16B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture conserva la clase de modelo `CodeGenForCausalLM` del checkpoint `Salesforce/codegen2-16B_P`, pero con una configuracion reducida aplicando la regla generica de `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (`added_tokens.json`, `configuration_codegen.py`, `merges.txt`, `modeling_codegen.py`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del modelo original, por lo que la tokenizacion y los nombres de tensores coinciden con el checkpoint real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a entradas: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanza 1,04). Los tensores se guardan en float32, el dtype por defecto de carga del modelo base, y se verifica que son finitos en float32, bfloat16 y float16 (forward, loss y gradientes). El fixture se construye con `build_fixtures.py` y los hashes, fuentes fijadas y resultados de las puertas quedan registrados en `build.json`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto de codigo coherente.
- Sirve como fixture de integracion para validar la carga de `CodeGenForCausalLM` con Transformers.
- Permite comprobar la sensibilidad de entradas del contrato (perturbaciones de `input_ids`, entre otras).
- Verifica la estabilidad numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- Valida la compatibilidad de tokenizer y ficheros de procesador copiados del modelo base.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.
- No dispone de modo thinking ni de razonamiento multi-paso.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con Transformers y ejecutar un forward para detectar roturas en la API de `CodeGenForCausalLM` sin descargar el checkpoint de 16B.
- Validacion de tokenizer: comprobar que los ficheros de procesador copiados de `Salesforce/codegen2-16B_P` producen los mismos ids que el modelo original en un conjunto de entradas de prueba.
- Verificacion de dtypes: ejecutar forward, loss y backward en float32, bfloat16 y float16 para asegurar que un framework no introduce NaNs ni infinitos.
- Test de sensibilidad: aplicar perturbaciones a `input_ids` y comprobar que los logits cambian por encima del umbral definido en el contrato.
- Desarrollo de herramientas de empaquetado: probar scripts de conversion, serializacion y carga de safetensors con un repositorio pequeno (0,0 GB) antes de aplicarlos a modelos grandes.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una version nueva de Transformers mantiene el comportamiento esperado.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py --fixture codegen2-16B_P-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (6,7 M de parametros, aproximadamente 27 MB de pesos); en float16, aproximadamente 13 MB.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: Transformers (carga directa con `CodeGenForCausalLM`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser pesos aleatorios, las mediciones no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/codegen2-16B_P-mic | 6,7 M (fixture) | no disponible | Fixture de integracion | no disponible | Hugging Face |
| Salesforce/codegen2-16B_P | ~16 B | no disponible | Generacion de codigo | no disponible | Hugging Face |
| Salesforce/codegen2-16B | ~16 B | no disponible | Generacion de codigo | no disponible | Hugging Face |

La comparativa con otros fixtures de Hugging Face MIC no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera codigo ni texto coherente; cualquier salida es ruido.
- Etiquetado como `test-artifact`: no debe usarse en produccion ni como modelo candidato.
- Licencia no disponible: no se puede verificar el uso comercial; ademas, los pesos derivan de `Salesforce/codegen2-16B_P`, cuya licencia debe consultarse por separado.
- Idiomas no disponibles: no hay garantia de soporte multilingue real.
- Longitud de contexto no disponible: la configuracion reducida no refleja la ventana del modelo base.
- Riesgo de confusion: el nombre incluye "16B" pero el fixture tiene 6,7 M de parametros; conviene revisar `build.json` antes de usarlo.
- No apto para benchmarks de calidad, alucinacion o sesgo: los resultados no serian extrapolables al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/codegen2-16B_P-mic
- Modelo base: https://huggingface.co/Salesforce/codegen2-16B_P
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/codegen2-16B_P-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/codegen2-16B_P-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/codegen2-16B_P-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/codegen2-16B_P-mic/blob/main/build.json
- Metodo de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/codegen2-16B_P-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
