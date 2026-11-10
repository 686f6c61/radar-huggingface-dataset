# huggingface-mic/Qwen1.5-MoE-A2.7B-mic

## Resumen

`huggingface-mic/Qwen1.5-MoE-A2.7B-mic` no es un modelo entrenado, sino un artefacto de prueba (fixture) derivado de `Qwen/Qwen1.5-MoE-A2.7B`. Lo publica la organizacion `huggingface-mic` con el objetivo de servir como banco de pruebas reproducible para frameworks de inferencia y herramientas de integracion. La model card lo etiqueta explicitamente como `test-artifact` y advierte de que "no es un modelo usable".

El fixture conserva la arquitectura del modelo original (`Qwen2MoeForCausalLM`, es decir, un transformer con mezcla de expertos), pero con la configuracion reducida a 2 capas ocultas y pesos generados aleatoriamente con semilla 17. El recuento real de parametros segun safetensors es de 19.580.224 (19,6 M), frente a los aproximadamente 14.300 M del Qwen1.5-MoE-A2.7B original. Los ficheros de procesador (tokenizer, configuracion de generacion, licencia) se copian byte a byte del checkpoint original.

Su relevancia es practica para desarrolladores de infraestructura: permite validar flujos de carga, comprobaciones de contrato de entrada/salida y expectativas de framework sin descargar ni ejecutar el modelo completo. No debe emplearse para generacion de texto, evaluacion de calidad ni ningun caso de uso productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2MoeForCausalLM (transformer con mezcla de expertos), reducida a 2 capas ocultas |
| Parametros totales | 19.580.224 (19,6 M) |
| Parametros activos | no disponible (el fixture no documenta el reparto de expertos tras el recorte) |
| Longitud de contexto | no disponible (los ficheros de configuracion se copian del modelo base, pero el fixture no declara contexto efectivo) |
| Tipos de cuantizacion | no disponible; pesos guardados en bfloat16 y verificados en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la metadata; el fichero `LICENSE` se copia del modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture reproduce la clase `Qwen2MoeForCausalLM` del modelo base, un transformer decoder-only con capas de mezcla de expertos (MoE). La unica modificacion estructural es el recorte de `num_hidden_layers` a 2, aplicado mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los nombres de tensor coinciden uno a uno con los del checkpoint real, lo que permite usarlo como sustituto ligero en pruebas de integracion.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanza 0,699). El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador (`LICENSE`, `configuration.json`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte del modelo original.

## Capacidades

- No es un modelo funcional: no genera texto coherente ni razona, ya que sus pesos son aleatorios.
- Sirve como fixture de contrato para validar la carga de checkpoints `Qwen2MoeForCausalLM` en Transformers y otras herramientas.
- Permite comprobar expectativas de framework (formas de tensor, dtypes, nombres de parametros) sin descargar el modelo completo.
- Reproduce la interfaz de tokenizer y configuracion de generacion del Qwen1.5-MoE-A2.7B original.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.
- Util como caso de prueba en CI para pipelines de conversion, cuantizacion o serializacion.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture con `AutoModelForCausalLM` y verificar que el pipeline de tu framework acepta la arquitectura `Qwen2MoeForCausalLM` sin descargar 14 GB de pesos.
- Validacion de contratos de entrada/salida: comprobar que las perturbaciones de `input_ids` y `attention_mask` producen cambios de logits medibles, tal como exige el gate documentado en `build.json`.
- Desarrollo de herramientas de conversion (por ejemplo, a GGUF o a formatos propietarios): usar el fixture para iterar rapidamente sobre el codigo de conversion antes de aplicarlo al modelo real.
- Pruebas de serializacion y dtypes: verificar que tu codigo maneja correctamente bfloat16, float16 y float32 con el mismo grafo de tensores que el modelo original.
- Regresion de tokenizer: al copiarse los ficheros de procesador byte a byte, sirve para comprobar que tu pipeline tokeniza igual que con el Qwen1.5-MoE-A2.7B original.
- Formacion y demos: ilustrar como se construye un fixture de modelo recortado siguiendo la metodologia de `build_fixtures.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en bfloat16 (19,6 M de parametros), trivial para cualquier GPU o incluso CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GPU integrada o CPU es suficiente.
- Cabe holgadamente en cualquier GPU consumer, incluidas las de gama baja.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM`), y en principio cualquier runtime que soporte safetensors y `Qwen2MoeForCausalLM`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| `huggingface-mic/Qwen1.5-MoE-A2.7B-mic` | 19,6 M (fixture) | no disponible | Artefacto de prueba | no disponible |
| `Qwen/Qwen1.5-MoE-A2.7B` | ~14.300 M totales, ~2.700 M activos | 32.768 tokens (segun documentacion publica del modelo base) | Modelo generativo MoE | Tongyi Qianwen (uso comercial permitido con condiciones) |
| `Qwen/Qwen1.5-1.8B` | ~1.800 M | 32.768 tokens | Modelo denso pequeno | Tongyi Qianwen |
| `Qwen/Qwen1.5-MoE-A2.7B-Chat` | ~14.300 M totales, ~2.700 M activos | 32.768 tokens | Modelo MoE afinado para chat | Tongyi Qianwen |

La comparacion relevante es con el modelo base: el fixture no compite en calidad ni rendimiento, solo replica su interfaz a escala reducida.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene valor semantico.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe aparecer en catalogos de modelos de produccion.
- La licencia no se declara en la metadata del repositorio; el fichero `LICENSE` copiado del modelo base debe revisarse antes de cualquier redistribucion.
- El contexto efectivo, los idiomas y el reparto de expertos no estan documentados para el fixture.
- No hay garantia de que el recorte a 2 capas reproduzca el comportamiento numerico del modelo completo; solo la estructura de tensores.
- Riesgo de confusion: el nombre puede llevar a pensar que es un modelo real de Qwen; conviene revisar la model card antes de integrarlo.
- No apto para evaluacion de sesgos, alucinacion ni calidad linguistica.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen1.5-MoE-A2.7B-mic/blob/main/build.json
- Metodologia de recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen1.5-MoE-A2.7B-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de recorte generica: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
