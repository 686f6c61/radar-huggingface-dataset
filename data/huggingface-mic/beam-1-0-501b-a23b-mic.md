# huggingface-mic/Beam-1.0-501B-A23B-mic

## Resumen

Beam-1.0-501B-A23B-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic a partir del modelo base `reflection/Beam-1.0-501B-A23B`. No se trata de un modelo entrenado ni utilizable en producción: es una version "adelgazada" del checkpoint original, con la misma arquitectura declarada (`BeamForCausalLM`) pero reducida a 3 capas y con pesos aleatorios generados con semilla 17. Su proposito es servir como fixture de integración para validar contratos de uso, expectativas de frameworks (Transformers) y plantillas de chat del modelo real, sin necesidad de descargar los cientos de miles de millones de parametros del original.

La relevancia de este repositorio es, por tanto, metodologica: demuestra un patron de "slim fixture" que permite a herramientas y pipelines de CI probar carga, tokenizacion, generacion y compatibilidad de tensores contra un modelo de gran tamano a coste casi nulo (0,1 GB de repo, 19,57 millones de parametros). El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Debe quedar claro que el nombre "501B-A23B" hace referencia al modelo base del que deriva, no a este repositorio. Cualquier evaluacion de capacidades, calidad o rendimiento debe hacerse sobre `reflection/Beam-1.0-501B-A23B`, no sobre este fixture.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`BeamForCausalLM`), version reducida a 3 capas |
| Parametros totales | 19.572.148 (fixture); el modelo base se denomina 501B-A23B, pero sus parametros reales no estan disponibles en la informacion proporcionada |
| Parametros activos | no disponible (el nombre sugiere un esquema MoE con 23B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se guardan en float32; se declara compatibilidad finita en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye un fichero `LICENSE` copiado del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base (`BeamForCausalLM`, un transformer decoder-only con causal language modeling) pero con una configuracion reducida mediante la regla generica de `sweep.py` del proyecto transformers-mic: `num_hidden_layers` igual a 3. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture puede sustituir al original en pruebas de carga e integracion sin cambios en el codigo de los frameworks.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanza 0,786). Los ficheros de procesador (`EVALUATION.md`, `LICENSE`, `chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde `reflection/Beam-1.0-501B-A23B`, por lo que la tokenizacion y la plantilla de chat son las del modelo real. El fixture se verifico como finito en float32, bfloat16 y float16 (forward, perdida y gradientes). El identificador de fixture es `e548998891a9` y cubre todos los checkpoints con ficheros de procesador identicos y config coincidente tras el adelgazamiento.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona ni responde preguntas.
- Carga y ejecucion con Transformers mediante la clase `BeamForCausalLM` (compatible con el modelo base).
- Tokenizacion y plantilla de chat identicas a las de `reflection/Beam-1.0-501B-A23B` (ficheros copiados byte a byte).
- Compatibilidad de nombres de tensores con el checkpoint real, util para validar conversiones y sharding.
- Ejecucion forward, calculo de perdida y retropropagacion finitos en float32, bfloat16 y float16.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento; cualquier capacidad de ese tipo pertenece al modelo base, no a este fixture.

## Casos de uso

- Pruebas de integracion en CI de Transformers: cargar el fixture y ejecutar un forward para verificar que la clase `BeamForCausalLM` y el pipeline de generacion funcionan con la config del modelo base, sin descargar el checkpoint completo.
- Validacion de plantillas de chat: usar `chat_template.jinja` copiado del modelo real para comprobar el formateo de conversaciones multi-turno en herramientas de evaluacion.
- Verificacion de tokenizacion: ejecutar `tokenizer.json` y `tokenizer_config.json` reales contra textos de prueba para detectar regresiones en el preprocesado.
- Pruebas de compatibilidad de dtype: comprobar que forward, perdida y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo real en GPUs con distinto soporte numerico.
- Validacion de sharding y conversion de pesos: al conservar los nombres de tensores del checkpoint original, sirve para probar scripts de conversion (por ejemplo, a GGUF o a formatos de vLLM) sin manejar cientos de gigabytes.
- Desarrollo de herramientas de inspeccion de modelos: analizar config, hashes (`build.json`) y estructura de ficheros para construir linters o validadores de repositorios Hugging Face.
- Reproduccion de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Beam-1.0-501B-A23B-mic` y comparar hashes para auditar la procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (19,57 M de parametros, unos 78 MB de pesos); en float16 o bfloat16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU consumer moderna sirve; cabe en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, e incluso iGPU con suficiente memoria compartida).
- Opciones de despliegue: Transformers (via `BeamForCausalLM`), y en principio cualquier runtime que acepte safetensors con esa arquitectura; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 3 capas, la latencia es despreciable, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-mic | 19,57 M (fixture) | no disponible | Fixture de integracion | no disponible | Hugging Face (repo publico) |
| reflection/Beam-1.0-501B-A23B | 501B (segun nombre; no confirmado) | no disponible | Modelo real | no disponible | Hugging Face (referenciado como base) |
| Fixtures de transformers-mic (otros) | Variable | no disponible | Pruebas de contrato | no disponible | Repositorio transformers-mic |

No se dispone de informacion sobre modelos comparables de la misma categoria (fixtures de integracion) mas alla del ecosistema transformers-mic.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la salida no tiene significado. No debe desplegarse en produccion ni usarse para evaluar calidad.
- El nombre "501B-A23B" describe al modelo base, no a este repositorio; confundirlos lleva a conclusiones erroneas sobre el tamano y las capacidades.
- No se dispone de datos sobre sesgos, alucinacion o limitaciones idiomaticas del modelo base en la informacion proporcionada.
- La licencia no esta detallada; el repo incluye un `LICENSE` copiado del modelo base, por lo que las condiciones de uso comercial dependen de `reflection/Beam-1.0-501B-A23B` y deben consultarse alli.
- El fixture tiene solo 3 capas: no reproduce el comportamiento numerico del modelo real, solo su contrato de interfaces.
- Esta etiquetado como `test-artifact`; los pipelines de busqueda de modelos deberian excluirlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Beam-1.0-501B-A23B-mic
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Documentacion de "shrink": https://huggingface-mic-mic-coverage.static.hf.space/shrink/Beam-1.0-501B-A23B-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
