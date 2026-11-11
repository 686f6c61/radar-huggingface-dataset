# huggingface-mic/Phi-3.5-MoE-0.8B-A0.2B-mic

## Resumen

Phi-3.5-MoE-0.8B-A0.2B-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic dentro del proyecto transformers-mic. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida artificialmente del modelo base inference-optimization/Phi-3.5-MoE-0.8B-A0.2B, con tan solo 4.358.976 parametros y pesos generados aleatoriamente (semilla 17). Su proposito es servir como fixture de integracion para validar contratos de uso y expectativas de frameworks (Transformers) sin necesidad de descargar el checkpoint completo.

La arquitectura declarada es PhimoeForCausalLM, la misma familia MoE de Phi-3.5, pero con la configuracion reducida a 2 capas ocultas mediante la regla generica de sweep.py. Los ficheros de procesador (chat_template.jinja, generation_config.json, tokenizer.json, tokenizer_config.json) se copian byte a byte del modelo base, de modo que el fixture reproduce fielmente la interfaz de tokenizacion y generacion del modelo original aunque los pesos no tengan valor semantico.

Es relevante unicamente en el contexto de testing de pipelines de integracion (CI) y validacion de contratos de frameworks. Esta etiquetado explicitamente como test-artifact para excluirlo de busquedas de modelos candidatos. Cualquier uso como modelo de produccion, evaluacion de calidad o benchmark seria un error de interpretacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PhimoeForCausalLM (transformer MoE, configuracion reducida a 2 capas) |
| Parametros totales | 4.358.976 (fixture reducido; el modelo base declara 0.8B totales / 0.2B activos segun su nombre) |
| Parametros activos | no disponible (el fixture no expone metrica de activacion util) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture emplea la clase PhimoeForCausalLM, correspondiente a la arquitectura Mixture-of-Experts de la familia Phi-3.5, pero con la configuracion encogida mediante la regla generica de sweep.py hasta 2 capas ocultas. Conserva los mismos nombres de tensores que el checkpoint real, de modo que el codigo de carga y las expectativas del framework se ejercitan de forma identica al modelo completo. Los ficheros de procesador se copian literalmente del modelo base.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0.001 (el caso mas debil, input_ids:roll_batch, dio 0.789). El artefacto se construyo con build_fixtures.py y build.json registra las fuentes fijadas, los resultados de las puertas y los hashes de los ficheros. No hay datos de tokens de entrenamiento, composicion de dataset ni RLHF/DPO porque no existe fase de entrenamiento.

## Capacidades

- No es un modelo funcional: no genera texto con calidad semantica, no razona, no programa ni resuelve matematicas.
- Reproduce la interfaz de tokenizacion y plantilla de chat del modelo base (chat_template.jinja, tokenizer.json).
- Permite validar la carga de pesos con nombres de tensor identicos al checkpoint real.
- Sirve para comprobar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.
- Permite verificar contratos de integracion con Transformers (integrations/transformers/usage.md y expectations).
- No dispone de tool calling, capacidades de agente, vision, audio ni modo thinking utilizables.
- Capacidades multilingues: no aplicables (pesos aleatorios).

## Casos de uso

- Pruebas de integracion en CI: el fixture permite ejecutar la suite de tests de transformers-mic sin descargar el checkpoint completo, reduciendo tiempo y ancho de banda en cada pipeline.
- Validacion de contratos de framework: comprobar que la version de Transformers en uso respeta las expectativas declaradas en integrations/transformers/expectations antes de promover un cambio.
- Verificacion de carga de safetensors: asegurar que el loader mapea correctamente los nombres de tensor del checkpoint real sin necesidad de pesos reales.
- Test de compatibilidad de tokenizer y chat template: validar que la plantilla de chat y el tokenizer copiados del modelo base producen las secuencias esperadas en el pipeline de generacion.
- Comprobacion de estabilidad numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de dtype en el codigo de integracion.
- Reproducibilidad de fixtures: usar build.json y build_fixtures.py para reconstruir el artefacto con las mismas fuentes fijadas y hashes, auditando cambios en el contrato.
- Desarrollo de herramientas internas de evaluacion: disponer de un modelo de juguete con la misma interfaz que el real para probar orquestadores y wrappers sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (4,36 M de parametros), aunque el modelo no es funcional para generacion real.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; tambien cabe en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga via Transformers con la clase PhimoeForCausalLM; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Phi-3.5-MoE-0.8B-A0.2B-mic (este) | 4,36 M (fixture) | no disponible | no disponible | Fixture de test |
| inference-optimization/Phi-3.5-MoE-0.8B-A0.2B | 0,8B totales / 0,2B activos (segun nombre) | no disponible | no disponible | Modelo base del que deriva |
| Modelos Phi-3.5 MoE publicos de Microsoft | no disponible en la informacion | no disponible | no disponible | Modelos reales de proposito general |

No se dispone de datos de rendimiento comparables porque el fixture no es un modelo funcional.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no debe usarse para evaluacion de calidad ni produccion.
- Etiquetado test-artifact: excluido deliberadamente de busquedas de modelos candidatos; usarlo fuera de testing es un error.
- Licencia no disponible: no se puede confirmar permiso de uso comercial; tratar como no apto para produccion.
- Idiomas no declarados: no hay garantia de comportamiento multilingue.
- Contexto no documentado: no se puede planificar uso con ventanas largas.
- Riesgo de confusion: su nombre incluye "Phi-3.5-MoE-0.8B-A0.2B", lo que puede llevar a confundirlo con el modelo real; verificar siempre el tag test-artifact.
- Alucinacion: irrelevante en el sentido habitual, pero cualquier texto generado sera ruido estadistico.
- Sin soporte documentado en motores de inferencia de produccion (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Phi-3.5-MoE-0.8B-A0.2B-mic
- Modelo base: https://huggingface.co/inference-optimization/Phi-3.5-MoE-0.8B-A0.2B
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de encogimiento (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Phi-3.5-MoE-0.8B-A0.2B-mic.html
