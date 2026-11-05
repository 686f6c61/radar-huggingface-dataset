# huggingface-mic/Flex-reddit-2x7B-1T-mic

## Resumen

Flex-reddit-2x7B-1T-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic dentro del proyecto transformers-mic. No se trata de un modelo entrenado ni utilizable para inferencia real: es una version "reducida" (slim) del checkpoint shanearora/Flex-reddit-2x7B-1T, generada con pesos aleatorios (semilla 17) y una configuracion mas pequena del mismo codigo de arquitectura, FlexOlmoForCausalLM, con num_hidden_layers reducido a 2.

Su proposito es servir como fixture de integracion: permite validar contratos de uso (usage.md, expectations, integration.json) y comprobar que los frameworks cargan correctamente el modelo, los ficheros de procesador y los nombres de tensores, sin necesidad de descargar el checkpoint completo. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

El repositorio ocupa 0,1 GB y contiene 12.976.960 parametros en float32, con los ficheros de tokenizer y configuracion copiados byte a byte del modelo base. No dispone de pipeline, licencia ni idiomas declarados, y no se ha publicado ningun resultado de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FlexOlmo (FlexOlmoForCausalLM), transformer causal, configuracion reducida a 2 capas |
| Parametros totales | 12.976.960 (fixture); el modelo base shanearora/Flex-reddit-2x7B-1T no declara cifra en la informacion disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara compatibilidad finita en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura FlexOlmoForCausalLM del checkpoint original, pero con una configuracion reducida mediante la regla generica de sweep.py del repositorio transformers-mic: num_hidden_layers = 2. Los ficheros de procesador (tokenizer.json, tokenizer_config.json, vocab.json, merges.txt, special_tokens_map.json, generation_config.json y FlexOlmo_Logo.png) se copian byte a byte desde shanearora/Flex-reddit-2x7B-1T, de modo que el pipeline de tokenizacion es identico al del modelo real.

Los pesos son aleatorios (semilla 17) y no proceden de entrenamiento alguno. Para validar el fixture se aplico una puerta de sensibilidad a las entradas: toda perturbacion de las entradas del contrato debia desplazar los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produjo 0,0756), por lo que no fue necesario entrenar. Los nombres de tensores coinciden con los del checkpoint real y el modelo es finito en forward, perdida y gradientes en float32, bfloat16 y float16. La clave del fixture es `088ea9efc1c2` y cubre todos los checkpoints con ficheros de procesador identicos y config coincidente tras el shrink.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto coherente ni resuelve tareas.
- Sirve como fixture de integracion para validar la carga del modelo en Transformers y otros frameworks.
- Permite comprobar el contrato de uso descrito en integration.json y en integrations/transformers/usage.md.
- Permite verificar las expectativas del framework recogidas en integrations/transformers/expectations.
- Valida que los nombres de tensores y la estructura de configuracion coinciden con el checkpoint original.
- Prueba la robustez numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No dispone de tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en Transformers y comprobar que el pipeline de generacion arranca sin errores antes de ejecutar tests contra el checkpoint real.
- Validacion de contratos de API: ejecutar integration.json para verificar que las entradas y salidas esperadas del modelo se cumplen en cada release del framework.
- Desarrollo de tooling de tokenizacion: al copiar los ficheros de procesador byte a byte, permite probar el tokenizer del modelo base sin descargar los pesos completos.
- Verificacion de compatibilidad de dtypes: comprobar que el modelo se ejecuta en float32, bfloat16 y float16 sin NaNs ni infinitos en forward, perdida y gradientes.
- Pruebas de regresion de nombres de tensores: detectar cambios en la nomenclatura de parametros entre versiones del checkpoint.
- Validacion de infraestructura de despliegue: usar el fixture ligero (0,1 GB) para probar pipelines de carga y serializacion en entornos con recursos limitados.
- Referencia para construir nuevos fixtures: build.json y build_fixtures.py documentan el proceso de reduccion y las puertas de calidad aplicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (12,98 M de parametros, ~52 MB de pesos) mas overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere aceleradores de datacenter.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (uso previsto segun integrations/transformers/usage.md); no se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas con pesos aleatorios, las cifras no serian representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flex-reddit-2x7B-1T-mic | 12,98 M (fixture) | no disponible | Fixture de integracion | no disponible | HuggingFace (0 descargas) |
| shanearora/Flex-reddit-2x7B-1T | no disponible | no disponible | Modelo base de referencia | no disponible | HuggingFace |
| huggingface-mic (otros fixtures) | variable | no disponible | Fixtures de integracion del mismo proyecto | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones completas del modelo base para establecer una comparativa tecnica con alternativas de la misma categoria.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas utiles; no debe usarse en produccion ni para evaluacion de calidad.
- Etiquetado como `test-artifact`: excluido deliberadamente de busquedas de modelos candidatos.
- Configuracion reducida (2 capas): el comportamiento numerico no representa al checkpoint completo de 7B.
- Licencia no declarada: no se puede asumir permiso de uso comercial ni de redistribucion.
- Idiomas no declarados: la cobertura linguistica del tokenizer corresponde al modelo base, pero no se documenta.
- Sin pipeline declarado: no hay garantia de compatibilidad con herramientas de inferencia de alto nivel.
- Riesgo de confusion: por el nombre puede confundirse con el modelo real; verificar siempre el tag `test-artifact`.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad ni de sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/Flex-reddit-2x7B-1T-mic
- Modelo base: https://huggingface.co/shanearora/Flex-reddit-2x7B-1T
- Contrato de integracion: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Documentacion del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Flex-reddit-2x7B-1T-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
