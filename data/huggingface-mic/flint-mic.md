# huggingface-mic/flint-mic

## Resumen

`huggingface-mic/flint-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` para el proyecto `transformers-mic`, un marco de trabajo orientado a la cobertura de integraciones de Transformers. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "adelgazada" del modelo base `RecursiveSI/flint`, reducida a 19.379.244 parametros (frente al checkpoint original completo) mediante una regla generica de reduccion aplicada sobre la configuracion de `FlintForCausalLM`.

El proposito del repositorio es triple: servir como peso ligero para pruebas de integracion, incluir ejemplos ejecutables de uso con Transformers y exponer las expectativas del framework (contrato de entradas/salidas) en un unico lugar. Los pesos son aleatorios (semilla 17) y no han sido entrenados; superaron una puerta de sensibilidad a la entrada que verifica que cada perturbacion de las entradas del contrato mueve los logits al menos 0,001, lo que justifica no entrenar el fixture.

La relevancia de esta ficha es acotada: sirve para entender que es un fixture de cobertura en el ecosistema de Transformers, como se construye y por que no debe confundirse con un modelo candidato para produccion. La etiqueta `test-artifact` existe precisamente para excluirlo de busquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `FlintForCausalLM` (transformer causal, configuracion reducida a `num_hidden_layers=3`) |
| Parametros totales | 19.379.244 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (incluye el fichero `LICENSE` copiado byte a byte de `RecursiveSI/flint`, pero su contenido no se especifica en la informacion disponible) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un fixture derivado de `RecursiveSI/flint` mediante la regla generica implementada en `sweep.py` del repositorio `huggingface/transformers-mic`. La unica modificacion estructural documentada es la reduccion de `num_hidden_layers` a 3; el resto de la configuracion se mantiene tras el proceso de "shrink". Los nombres de tensores son identicos a los del checkpoint real, de modo que el fixture conserva la misma interfaz de parametros que el modelo original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produce un desplazamiento de 0,434). Los ficheros de procesador (`LICENSE`, `chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `RecursiveSI/flint`. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Se guardo en bfloat16, el dtype con el que `RecursiveSI/flint` carga por defecto.

## Capacidades

- No es un modelo utilizable: su funcion es cubrir pruebas de integracion, no generar texto con calidad.
- Sirve como fixture de contrato para validar la interfaz de `FlintForCausalLM` en Transformers (formas de entrada, mascaras de atencion, logits).
- Permite ejecutar ejemplos de uso con Transformers recogidos en `integrations/transformers/usage.md`.
- Expone las expectativas del framework en `integrations/transformers/expectations`.
- Conserva el tokenizador y la plantilla de chat de `RecursiveSI/flint`, por lo que valida el pipeline de tokenizacion del modelo original.
- Compatible con forward, loss y gradientes en float32, bfloat16 y float16.
- No dispone de capacidades de tool calling, agentes, vision, audio ni modo thinking documentadas.

## Casos de uso

- Pruebas de integracion en CI: el fixture permite ejecutar la suite de Transformers contra `FlintForCausalLM` sin descargar el checkpoint completo, reduciendo tiempo y ancho de banda en cada build.
- Validacion de contratos de API: los ficheros `integration.json` y `integrations/transformers/expectations` permiten comprobar que una nueva version de Transformers respeta las formas y tipos esperados por el modelo.
- Desarrollo de plugins y wrappers: un desarrollador puede probar su capa de abstraccion (por ejemplo, un servidor de inferencia) contra un modelo del mismo nombre de tensores antes de pasar al checkpoint real.
- Verificacion de tokenizacion y plantilla de chat: al copiar byte a byte los ficheros de procesador, sirve para testear pipelines de tokenizacion y renderizado de `chat_template.jinja` sin cargar pesos grandes.
- Pruebas de precision numerica: al ser finito en float32, bfloat16 y float16, permite validar rutas de mixed precision y deteccion de NaN/Inf en el forward y el backward.
- Reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta y hashes de ficheros, lo que permite reconstruir el fixture con `python example/build_fixtures.py --fixture flint-mic` y auditar cambios.
- Docencia y experimentacion con arquitecturas: util para estudiar la estructura de `FlintForCausalLM` con solo 3 capas y 19,4M de parametros en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,4M de parametros equivalen a unos 39 MB de pesos); en float32, unos 78 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) y en equipos sin GPU dedicada.
- Opciones de despliegue: carga directa con Transformers (`FlintForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de test, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/flint-mic` | 19,4M | no disponible | Fixture de test | no disponible | Hugging Face |
| `RecursiveSI/flint` | no disponible | no disponible | Modelo base real | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Cobertura de integraciones | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria, ya que los fixtures no se evaluan con benchmarks de calidad.

## Limitaciones y advertencias

- No es un modelo entrenado: los pesos son aleatorios (semilla 17) y la salida no tiene valor semantico.
- No debe usarse en produccion ni como base para fine-tuning; la etiqueta `test-artifact` lo excluye de busquedas de modelos candidatos.
- La licencia del repositorio no esta disponible en la informacion proporcionada; el fichero `LICENSE` se copia del modelo base, pero su contenido no se detalla.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque el modelo no genera contenido real.
- La configuracion reducida (3 capas) no representa el comportamiento del checkpoint original `RecursiveSI/flint`.
- El repositorio ocupa 0,0 GB segun la informacion disponible, lo que refleja el caracter minimo del artefacto.
- No se garantiza compatibilidad con frameworks distintos de Transformers, ya que solo se documentan expectativas para ese framework.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huggingface-mic/flint-mic
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/flint-mic.html
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/flint-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/flint-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/flint-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/flint-mic/blob/main/build.json
