# huggingface-mic/Qwen1.5-MoE-A2.7B-mic

## Resumen

`huggingface-mic/Qwen1.5-MoE-A2.7B-mic` no es un modelo de lenguaje utilizable, sino un artefacto de prueba (fixture) construido por el equipo de Hugging Face para validar contratos de integracion de frameworks. Se trata de una version "adelgazada" del modelo `Qwen/Qwen1.5-MoE-A2.7B`: conserva la misma arquitectura (`Qwen2MoeForCausalLM`), los mismos nombres de tensores y los ficheros de procesador copiados byte a byte del checkpoint original, pero reduce la configuracion a 2 capas ocultas y sustituye los pesos por valores aleatorios (semilla 17), resultando en 19.580.224 parametros totales.

El proposito del repositorio es servir como banco de pruebas reproducible: incluye un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers, un directorio de expectativas del framework y la procedencia del fixture (`build.json`). Los pesos aleatorios superaron una puerta de sensibilidad a la entrada (cada perturbacion de las entradas del contrato movia los logits al menos 0,001), de modo que no fue necesario entrenamiento alguno.

Es relevante para desarrolladores de infraestructura de IA que necesiten validar pipelines de carga, tokenizacion, forward pass y gradientes sin descargar ni ejecutar el modelo real de 14.300 millones de parametros. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con el modelo Qwen1.5-MoE-A2.7B original, del que solo hereda la estructura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2MoeForCausalLM (transformer MoE, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 19.580.224 |
| Parametros activos | no disponible (el fixture no preserva la semantica de enrutamiento del MoE original) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no verificada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero `LICENSE` se copia del modelo base, pero no se especifica el tipo) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `Qwen2MoeForCausalLM` del modelo base, pero con `num_hidden_layers` reducido a 2 mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Mantiene los mismos nombres de tensores que el checkpoint real, lo que permite validar que el codigo de carga y las expectativas del framework funcionan con la topologia exacta del modelo original. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `configuration.json`, `generation_config.json`, `LICENSE`) se copiaron byte a byte desde `Qwen/Qwen1.5-MoE-A2.7B`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato desplazaba los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, con 0,699). El modelo se guardo en bfloat16, el dtype con el que carga por defecto el checkpoint original, y se verifico que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture `50e62675347c` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el adelgazamiento.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni razona, ya que sus pesos son aleatorios.
- Sirve como fixture de integracion para validar la carga de checkpoints `Qwen2MoeForCausalLM` en Transformers.
- Permite comprobar la tokenizacion con los ficheros de procesador reales del modelo base.
- Valida el forward pass, el calculo de loss y la retropropagacion de gradientes en float32, bfloat16 y float16.
- Verifica la sensibilidad a la entrada del contrato de integracion mediante perturbaciones controladas.
- Soporta la reproduccion del fixture con `python example/build_fixtures.py --fixture Qwen1.5-MoE-A2.7B-mic`.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo thinking.
- No dispone de capacidades multilingues reales (el tokenizador es el del modelo base, pero los pesos no producen lenguaje).

## Casos de uso

- Validacion de pipelines de carga en CI: el fixture permite comprobar en segundos que una nueva version de Transformers carga correctamente un checkpoint `Qwen2MoeForCausalLM` sin descargar los 14.300 millones de parametros del modelo real.
- Pruebas de tokenizacion: al conservar `tokenizer.json`, `vocab.json` y `merges.txt` byte a byte, sirve para verificar que el pipeline de tokenizacion reproduce exactamente el comportamiento del modelo base.
- Test de gradientes y mixed precision: los pesos son finitos en float32, bfloat16 y float16, lo que permite ejecutar pruebas de forward, loss y backward en las tres precisiones en hardware modesto.
- Desarrollo de frameworks de inferencia: util para validar la integracion de un nuevo runtime (vLLM, TGI, entre otros) contra la topologia MoE de Qwen sin coste de memoria.
- Reproducibilidad de contratos: el manifiesto `integration.json` y `build.json` permiten auditar hashes, fuentes fijadas y resultados de las puertas de validacion.
- Formacion y documentacion: ejemplo didactico de como construir fixtures de modelos grandes para ensenar tecnicas de testing de infraestructura de IA.
- Deteccion de regresiones: al fijar la semilla 17, cualquier cambio en la salida de logits indica una regresion en el codigo de carga o en el framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K u otras) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,6 millones de parametros, aproximadamente 39 MB de pesos mas overhead de activaciones y tokenizador).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada, y en CPU.
- Opciones de despliegue: Transformers con `Qwen2MoeForCausalLM`; el resto de runtimes (vLLM, llama.cpp, Ollama, TGI) no estan verificados para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia sera del orden de milisegundos en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/Qwen1.5-MoE-A2.7B-mic` | 19.580.224 | no disponible | Fixture de test | no disponible | Hugging Face (2490 descargas) |
| `Qwen/Qwen1.5-MoE-A2.7B` | 14.300 millones (2.700 millones activos) | 32.768 tokens (segun documentacion publica del modelo base) | Modelo MoE de proposito general | Tongyi Qianwen License (segun el modelo base) | Hugging Face |
| `Qwen/Qwen1.5-1.8B` | 1.800 millones | 32.768 tokens (segun documentacion publica) | Modelo denso de proposito general | Tongyi Qianwen License (segun el modelo base) | Hugging Face |

La comparativa con modelos funcionales solo tiene sentido a nivel estructural: el fixture comparte arquitectura y tokenizador con `Qwen/Qwen1.5-MoE-A2.7B`, pero no su capacidad. Frente a un modelo denso pequeno como `Qwen1.5-1.8B`, el fixture es dos ordenes de magnitud menor en parametros y no genera lenguaje.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado linguistico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La configuracion esta reducida a 2 capas ocultas, por lo que no reproduce el comportamiento numerico del modelo base.
- No se especifica la licencia efectiva del fixture; el fichero `LICENSE` se copia del modelo base, pero el autor no declara terminos propios.
- No hay informacion sobre sesgos, alucinacion o limitaciones de idioma porque el modelo no produce lenguaje.
- El repositorio ocupa 0,0 GB segun la metadata, lo que sugiere que los pesos pueden no estar completamente alojados o que el tamano se redondea; verificar antes de depender de el.
- La fecha de creacion (2026-10-29) es posterior a la fecha actual en muchos entornos, lo que puede indicar un error de metadata o un artefacto de prueba generado con reloj simulado.
- No se han verificado runtimes alternativos a Transformers; el soporte en vLLM, llama.cpp u Ollama es desconocido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/blob/main/integrations/transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/blob/main/build.json
- Explicacion del adelgazamiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen1.5-MoE-A2.7B-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de adelgazamiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
