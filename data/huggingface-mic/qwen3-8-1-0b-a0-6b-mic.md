# huggingface-mic/Qwen3.8-1.0B-A0.6B-mic

## Resumen

Qwen3.8-1.0B-A0.6B-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic en Hugging Face. No es un modelo de lenguaje utilizable: se trata de una version reducida y con pesos aleatorios del checkpoint `inference-optimization/Qwen3.8-1.0B-A0.6B`, creada para validar contratos de integracion con frameworks (concretamente Transformers) dentro del proyecto transformers-mic. El propio autor lo etiqueta como `test-artifact` para excluirlo de las busquedas de modelos candidatos.

El repositorio contiene unicamente 32.138.304 parametros reales (frente a los aproximadamente 1.000 millones que sugiere el nombre del modelo base), distribuidos en una configuracion reducida de la arquitectura `Qwen3_5MoeForCausalLM` con solo 2 capas ocultas. Los pesos son aleatorios (semilla 17) y se generaron sin entrenamiento alguno, tras superar una puerta de sensibilidad a las entradas que exige que cada perturbacion de los inputs mueva los logits al menos 0,001.

Su relevancia es, por tanto, puramente tecnica y de infraestructura: sirve como fixture reproducible para probar que una implementacion de framework (carga de pesos, tokenizador, plantilla de chat, generacion) se comporta igual con un checkpoint real y con uno sintetico de la misma arquitectura. No debe emplearse para inferencia real, generacion de texto ni ninguna tarea de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (transformer MoE, configuracion reducida a 2 capas) |
| Parametros totales | 32.138.304 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la clase `Qwen3_5MoeForCausalLM`, una arquitectura de mezcla de expertos (MoE) propia de la familia Qwen3.5, pero con la configuracion reducida mediante la regla generica de `sweep.py` del repositorio transformers-mic: `num_hidden_layers` igual a 2. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el checkpoint base `inference-optimization/Qwen3.8-1.0B-A0.6B`, de modo que el tokenizador y la plantilla de chat son identicos a los del modelo real.

No hubo entrenamiento. Los pesos se generaron de forma aleatoria con semilla 17 y se validaron con una puerta de sensibilidad a las entradas: cada perturbacion de los inputs del contrato debe desplazar los logits al menos 0,001 (la mas debil, `attention_mask:all_ones`, alcanzo 0,71). Los tensores conservan exactamente los mismos nombres que el checkpoint real, y los pesos se guardaron en bfloat16, el dtype por defecto del modelo base. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La clave del fixture es `dd78532107bc` y cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras el shrink.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto coherente.
- Sirve como fixture de conformidad para validar la carga de pesos, el tokenizador y la plantilla de chat en Transformers.
- Permite comprobar la paridad de nombres de tensores con el checkpoint real `inference-optimization/Qwen3.8-1.0B-A0.6B`.
- Valida el comportamiento numerico finito en float32, bfloat16 y float16 (forward, loss, gradientes).
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento.
- No tiene capacidades multilingues reales: el tokenizador copiado puede procesar texto, pero el modelo no genera respuestas utiles.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForCausalLM` y verificar que la API acepta la configuracion y los tensores sin errores, antes de probar con el checkpoint real.
- Validacion de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una version nueva de Transformers sigue cumpliendo las expectativas de entrada/salida.
- CI/CD de librerias de inferencia: ejecutar la suite de tests con un modelo de 0,1 GB en lugar de descargar el checkpoint completo de aproximadamente 1 GB, reduciendo tiempos y ancho de banda.
- Desarrollo de herramientas de conversion de pesos: validar scripts de conversion o de sharding contra un modelo con los mismos nombres de tensor y menor tamano.
- Pruebas de cuantizacion y serializacion: comprobar que las rutas de carga en bfloat16, float16 y float32 funcionan y producen valores finitos.
- Reproducibilidad de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture Qwen3.8-1.0B-A0.6B-mic` y verificar los hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (32,1 M de parametros, unos 64 MB de pesos) mas overhead de activaciones y cache.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (via `AutoModelForCausalLM`); otras rutas como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este fixture.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la inferencia seria practicamente instantanea, pero sin valor funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-1.0B-A0.6B-mic | 32,1 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| inference-optimization/Qwen3.8-1.0B-A0.6B | ~1.000 M (segun nombre) | no disponible | Modelo base real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de contrato | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa funcional con modelos de la misma categoria.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera texto coherente ni responde a instrucciones; usarlo en produccion produciria salidas sin sentido.
- Etiquetado como `test-artifact`: el autor lo excluye explicitamente de la busqueda de modelos candidatos.
- Configuracion reducida: solo 2 capas ocultas, por lo que no reproduce el comportamiento numerico del checkpoint real mas alla de la estructura de tensores.
- Licencia no disponible: no hay informacion sobre condiciones de uso comercial.
- Idiomas no disponibles: no se puede garantizar soporte linguistico alguno.
- Riesgo de confusion: el nombre "Qwen3.8-1.0B-A0.6B" sugiere un modelo de 1.000 M de parametros, pero el fixture tiene 32,1 M; conviene verificar siempre el numero real de parametros en safetensors.
- No apto para benchmarks de calidad, evaluaciones de sesgo ni comparativas de rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/huggingface-mic/Qwen3.8-1.0B-A0.6B-mic)
- [Modelo base: inference-optimization/Qwen3.8-1.0B-A0.6B](https://huggingface.co/inference-optimization/Qwen3.8-1.0B-A0.6B)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.8-1.0B-A0.6B-mic.html)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
