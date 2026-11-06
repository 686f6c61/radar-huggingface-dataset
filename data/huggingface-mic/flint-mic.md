# huggingface-mic/flint-mic

## Resumen

`huggingface-mic/flint-mic` es un artefacto de prueba (fixture) publicado en Hugging Face por el usuario `huggingface-mic`, no un modelo entrenado ni utilizable en produccion. Se trata de una version reducida del modelo `RecursiveSI/flint`, generada con la herramienta `transformers-mic` para validar contratos de integracion con la libreria Transformers. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El modelo conserva la arquitectura `FlintForCausalLM` del modelo base, pero con una configuracion reducida a 3 capas ocultas (`num_hidden_layers 3`) y 19.379.244 parametros totales. Los pesos son aleatorios (semilla 17), no entrenados, y los ficheros de procesador (`tokenizer.json`, `chat_template.jinja`, `generation_config.json`, `LICENSE`, `tokenizer_config.json`) se copiaron byte a byte desde `RecursiveSI/flint`.

Su relevancia es exclusivamente tecnica para el ecosistema de pruebas: permite verificar que las integraciones de Transformers cargan, ejecutan forward, calculan perdida y gradientes con los mismos nombres de tensores que el checkpoint real, sin necesidad de descargar los pesos completos. No debe considerarse un modelo para inferencia real, generacion de texto ni ninguna tarea de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`FlintForCausalLM`), configuracion reducida a 3 capas ocultas |
| Parametros totales | 19.379.244 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; compatible con float32 y float16 en forward) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only bajo la clase `FlintForCausalLM`, derivada del modelo base `RecursiveSI/flint`. El fixture se genero aplicando la regla generica de reduccion de `sweep.py` del repositorio `transformers-mic`, que reduce el numero de capas ocultas a 3 manteniendo la estructura de tensores del checkpoint original. Los nombres de tensores coinciden exactamente con los del modelo real, lo que permite validar la compatibilidad de integraciones sin ambiguedad.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron mediante una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, `attention_mask:all_ones`, registro 0.434). Los pesos se guardaron en bfloat16, el dtype por defecto de carga de `RecursiveSI/flint`, y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras la reduccion.

## Capacidades

- Carga y ejecucion de forward pass con la clase `FlintForCausalLM` en Transformers.
- Calculo de perdida y gradientes en float32, bfloat16 y float16.
- Validacion de contratos de integracion: manifiesto `integration.json`, uso en Transformers y expectativas de framework en `integrations/transformers/`.
- Verificacion de nombres de tensores identicos al checkpoint real `RecursiveSI/flint`.
- Reutilizacion de ficheros de procesador del modelo base (tokenizer y chat template) copiados byte a byte.
- No soporta generacion de texto coherente, tool calling, agentes, vision, audio ni capacidades multilingues reales, al carecer de pesos entrenados.

## Casos de uso

- Pruebas de integracion en CI: el fixture permite ejecutar la suite de tests de Transformers contra `FlintForCausalLM` sin descargar los pesos completos del modelo base, reduciendo tiempo y ancho de banda en pipelines.
- Validacion de contratos de framework: comprobar que una nueva version de Transformers respeta el manifiesto `integration.json` y las expectativas en `integrations/transformers/expectations` antes de liberar cambios.
- Desarrollo de adaptadores y wrappers: verificar que el codigo de carga, tokenizacion y forward funciona con los mismos nombres de tensores y ficheros de procesador que el checkpoint real.
- Pruebas de precision numerica: comprobar que forward, perdida y gradientes son finitos en float32, bfloat16 y float16, util para validar kernels y rutas de mixed precision.
- Reproduccion de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture flint-mic` y comparar hashes registrados en `build.json`.
- Auditoria de procedencia: revisar `build.json` para confirmar fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros en un proceso de revision de artefactos de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,4 M de parametros, aproximadamente 39 MB de pesos), aunque el modelo no produce salidas utiles.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: carga via Transformers con `FlintForCausalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 3 capas, el coste computacional es minimo pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/flint-mic` | 19,4 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `RecursiveSI/flint` | no disponible | no disponible | Modelo base real | no disponible | Hugging Face |
| Fixtures `transformers-mic` | variable | no disponible | Artefactos de prueba | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de otros fixtures comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la model card lo declara explicitamente como `test-artifact`.
- No debe usarse para generacion de texto, atencion al cliente, codigo ni ninguna tarea de usuario final.
- Riesgo de confusion: el nombre y la estructura imitan al modelo real `RecursiveSI/flint`; verificar siempre la etiqueta `test-artifact` antes de integrarlo.
- Sesgos conocidos: no disponibles, al no haber entrenamiento.
- Alucinacion: las salidas son ruido estadistico derivado de pesos aleatorios, sin valor semantico.
- Contexto e idiomas: no documentados; los ficheros de tokenizer y chat template se heredan del modelo base, pero su comportamiento con este fixture no esta validado.
- Licencia: el fichero `LICENSE` se copia del modelo base, pero su contenido no se detalla en la informacion disponible; verificar antes de cualquier redistribucion.
- Uso en produccion: desaconsejado en cualquier escenario; su unico proposito es la validacion de integraciones y la ejecucion de tests.

## Enlaces

- [Hugging Face: huggingface-mic/flint-mic](https://huggingface.co/huggingface-mic/flint-mic)
- [Modelo base: RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint)
- [Manifiesto de contrato: integration.json](integration.json)
- [Uso en Transformers: integrations/transformers/usage.md](integrations/transformers/usage.md)
- [Expectativas de Transformers: integrations/transformers/expectations](integrations/transformers/expectations)
- [Procedencia del fixture: build.json](build.json)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/flint-mic.html)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
