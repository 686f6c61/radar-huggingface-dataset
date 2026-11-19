# huggingface-mic/Qwen3-30B-A3B-mic

## Resumen

Qwen3-30B-A3B-mic es un artefacto de prueba publicado por el usuario `huggingface-mic`, no un modelo de lenguaje utilizable. Se presenta como un "fixture" o version reducida (slim) del checkpoint original Qwen/Qwen3-30B-A3B, con el objetivo de servir como contrato de pruebas para frameworks de inferencia y utilidades de integracion. El repositorio incluye pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, de modo que las herramientas puedan validar su comportamiento contra una arquitectura Qwen3-MoE real sin descargar los 30B de parametros del modelo original.

El modelo conserva la arquitectura `Qwen3MoeForCausalLM` pero con una configuracion encogida mediante la regla generica de `sweep.py` (2 capas ocultas), y sus pesos son aleatorios (semilla 17), no entrenados. Los ficheros de procesador (tokenizer, vocab, merges, generation config, LICENSE) se copian byte a byte del checkpoint original, por lo que la interfaz de tokenizacion es identica. El resultado es un artefacto de 19,5 millones de parametros (0,1 GB) etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es, por tanto, exclusivamente de ingenieria: permite a los mantenedores de transformers, vLLM u otras herramientas verificar la carga, el forward, la sensibilidad de entradas y la compatibilidad de nombres de tensores contra la arquitectura Qwen3-MoE sin coste de almacenamiento ni de computo. No debe emplearse para generacion de texto, razonamiento ni ninguna tarea de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE causal LM (`Qwen3MoeForCausalLM`), configuracion encogida a 2 capas ocultas |
| Parametros totales | 19.522.432 (19,5 M) |
| Parametros activos | no disponible (el fixture no documenta el reparto MoE de la config encogida) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; el autor declara finitud en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo incluye el fichero LICENSE copiado del modelo base, pero no se especifica su contenido) |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | Qwen/Qwen3-30B-A3B |
| Tamano del repositorio | 0,1 GB |
| Clave de fixture | `6c2b6afe4b1a` |
| Semilla de pesos | 17 (pesos aleatorios, sin entrenamiento) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base Qwen3-30B-A3B, un transformer con mezcla de expertos (MoE) implementado como `Qwen3MoeForCausalLM`, pero con una configuracion reducida a 2 capas ocultas mediante la regla generica de encogimiento de `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que cualquier codigo que espere la estructura de parametros de Qwen3-MoE puede cargarlo sin cambios.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad de entradas: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, `input_ids:roll_batch`, con 0,945). Los ficheros de procesador (`LICENSE`, `generation_config.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte del modelo original. El artefacto se guardo en bfloat16, el dtype por defecto de carga de Qwen3-30B-A3B, y se verifico que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16. La construccion se realiza con `build_fixtures.py`, y `build.json` registra fuentes fijadas, resultados de las puertas y hashes de ficheros.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- Sirve como contrato de pruebas para validar la carga de checkpoints Qwen3-MoE en frameworks (transformers y otros).
- Permite verificar la compatibilidad de nombres de tensores con el checkpoint real Qwen/Qwen3-30B-A3B.
- Permite comprobar la sensibilidad de entradas del contrato (perturbaciones de `input_ids`, entre otras) mediante la puerta documentada.
- Reutiliza el tokenizer y la configuracion de generacion del modelo base, por lo que valida la ruta de tokenizacion.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma real: solo replica la interfaz estructural.
- Multilingue: no disponible (heredaria el tokenizer del base, pero no se documenta el conjunto de idiomas).

## Casos de uso

- Pruebas de integracion en transformers: cargar el fixture con `Qwen3MoeForCausalLM` para verificar que la clase y los nombres de tensores coinciden con el checkpoint real, sin descargar 30B de parametros.
- CI/CD de librerias de inferencia: ejecutar tests de forward, perdida y gradientes en float32, bfloat16 y float16 sobre un artefacto de 0,1 GB que cabe en cualquier runner.
- Validacion de puertas de sensibilidad: reproducir la comprobacion de que perturbaciones de `input_ids` mueven los logits al menos 0,001, como test de regresion del contrato.
- Verificacion de tokenizacion: comprobar que `tokenizer.json`, `vocab.json` y `merges.txt` copiados byte a byte producen los mismos ids que el modelo base para un conjunto de prompts de prueba.
- Desarrollo de utilidades de conversion o cuantizacion: probar pipelines de conversion de safetensors bfloat16 a otros formatos sobre un checkpoint pequeno con la misma estructura de tensores.
- Documentacion y ejemplos ejecutables: usar `integrations/transformers/usage.md` como ejemplo reproducible en la documentacion de una herramienta, sin coste de almacenamiento.
- Auditoria de provenance: revisar `build.json` para comprobar fuentes fijadas y hashes de los ficheros copiados del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de calidad, y al tratarse de pesos aleatorios sin entrenamiento, cualquier evaluacion de tareas (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 (19,5 M de parametros, ~39 MB de pesos) mas overhead de activaciones y del runtime; cabe en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte bfloat16 o float16 (RTX 3060 en adelante, A100, H100); tambien CPU para pruebas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (ruta documentada en `integrations/transformers/usage.md`); otras herramientas no documentadas.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia seria muy baja pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-mic (este) | 19,5 M (fixture) | no disponible | Artefacto de prueba | no disponible | Hugging Face, 2.523 descargas |
| Qwen/Qwen3-30B-A3B | 30B totales (MoE) | no disponible en la informacion proporcionada | Modelo funcional de proposito general | no disponible en la informacion proporcionada | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Artefactos de prueba | no disponible | Hugging Face |

La comparativa con modelos funcionales no es significativa: el fixture no compite en calidad ni rendimiento, solo en estructura de checkpoint.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas coherentes; cualquier uso generativo da resultados sin sentido.
- Etiquetado `test-artifact`: excluido deliberadamente de busquedas de modelos candidatos; no debe tratarse como modelo base para fine-tuning.
- Licencia no disponible: el repo incluye un fichero LICENSE copiado del modelo base, pero no se especifica su contenido; verificar antes de cualquier redistribucion.
- Configuracion encogida (2 capas): no representa el comportamiento numerico ni el reparto MoE del checkpoint real de 30B.
- Sin datos de contexto, idiomas ni cuantizacion: no apto para planificacion de despliegue en produccion.
- Riesgo de confusion: el nombre incluye "Qwen3-30B-A3B" pero el tamano real es de 19,5 M; no confundir con el modelo original.
- No se documentan sesgos ni alucinaciones porque no hay comportamiento aprendido que evaluar.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-30B-A3B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Manifest del contrato: https://huggingface.co/huggingface-mic/Qwen3-30B-A3B-mic/blob/main/integration.json
- Uso con transformers: https://huggingface.co/huggingface-mic/Qwen3-30B-A3B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de transformers: https://huggingface.co/huggingface-mic/Qwen3-30B-A3B-mic/tree/main/integrations/transformers/expectations
- Provenance del fixture: https://huggingface.co/huggingface-mic/Qwen3-30B-A3B-mic/blob/main/build.json
- Como se encogio el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-30B-A3B-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
