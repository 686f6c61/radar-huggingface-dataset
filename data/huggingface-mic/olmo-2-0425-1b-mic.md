# huggingface-mic/OLMo-2-0425-1B-mic

## Resumen

OLMo-2-0425-1B-mic es un artefacto de prueba (fixture) publicado por la organización huggingface-mic, no un modelo entrenado ni utilizable para inferencia real. Se trata de una versión "adelgazada" del modelo allenai/OLMo-2-0425-1B, reducida mediante una regla genérica de reducción de configuración (num_hidden_layers = 2) hasta los 12,9 millones de parámetros, y con pesos aleatorios generados con semilla 17. Su propósito es servir como fixture de integración para validar contratos de framework (expectativas de comportamiento de Transformers) sin necesidad de descargar el checkpoint completo de 1B.

El repositorio incluye, además de los pesos reducidos, un manifiesto de contrato (integration.json), documentación de uso para Transformers, un directorio de expectativas del framework y metadatos de procedencia (build.json). Los ficheros de procesador (tokenizer, generation_config, etc.) se copian byte a byte del modelo original, de modo que la interfaz de tokenización es idéntica a la del OLMo-2 real. La arquitectura declarada es Olmo2ForCausalLM, la misma familia que el modelo base, pero con solo dos capas.

Es relevante ahora porque forma parte de una infraestructura de testing automatizado de modelos (transformers-mic) que busca verificar que las implementaciones de framework respetan los contratos de entrada/salida de cada checkpoint. No debe confundirse con un modelo de lenguaje funcional: la propia model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Olmo2ForCausalLM (transformer decoder-only, reducido a 2 capas) |
| Parametros totales | 12.927.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la configuración del tokenizer del modelo base, no verificada en la información) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo-2 (clase Olmo2ForCausalLM), pero con una configuración reducida: num_hidden_layers = 2, aplicada mediante la regla genérica de `sweep.py` del repositorio transformers-mic. Los pesos son aleatorios (semilla 17) y no han pasado por ningún proceso de entrenamiento, RLHF ni DPO. Los ficheros de procesador (`generation_config.json`, `merges.txt`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copian byte a byte desde allenai/OLMo-2-0425-1B, por lo que la tokenización coincide con la del modelo original.

La innovación técnica del artefacto no está en el modelo en sí, sino en su función como fixture de integración: los pesos aleatorios superaron una "input-sensitivity gate" según la cual cada perturbación de las entradas del contrato mueve los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, mueve 0,213). Esto garantiza que el fixture es sensible a las entradas y válido para tests de contrato. Los tensores conservan los mismos nombres que el checkpoint real, y el artefacto se declara finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe código ni resuelve matemáticas, porque sus pesos son aleatorios.
- Sirve como fixture de contrato para validar la implementación de Olmo2ForCausalLM en frameworks (expectativas de formas, dtypes y comportamiento de logits).
- Permite verificar la integración del tokenizer del OLMo-2 real sin descargar el checkpoint completo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües verificadas ni modo thinking, visión o audio.
- Su utilidad es exclusivamente de testing e integración continua de software.

## Casos de uso

- Tests de contrato en CI/CD: el fixture se usa para comprobar que una implementación de Olmo2ForCausalLM produce tensores con las formas y dtypes esperados, sin necesidad de cargar el modelo de 1B en cada ejecución.
- Validación de tokenizadores: al copiar los ficheros de procesador del modelo base, permite testear pipelines de tokenización idénticos a los del OLMo-2 real en entornos ligeros.
- Verificación de sensibilidad a entradas: la gate documentada (perturbaciones que mueven los logits al menos 0,001) permite comprobar que el framework propaga correctamente attention_mask y otras entradas.
- Pruebas de compatibilidad de dtypes: al ser finito en float32, bfloat16 y float16, sirve para validar rutas de conversión de precisión en frameworks de inferencia.
- Desarrollo de herramientas de reducción de modelos: el repositorio documenta el proceso de shrink (`sweep.py`, `build_fixtures.py`), útil para quien construya fixtures similares para otros checkpoints.
- Reproducibilidad de entornos de test: build.json fija fuentes, hashes y resultados de la gate, lo que permite reconstruir el artefacto de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (12,9 M de parámetros); el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquiera; cabe en CPU y en cualquier GPU consumer, incluida una iGPU.
- Cabe en consumer GPU: sí, en todas (RTX 4090, RTX 3060, etc.) e incluso en CPU.
- Opciones de despliegue: Transformers (con Olmo2ForCausalLM); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; irrelevantes para un fixture de test.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-2-0425-1B-mic | 12,9 M | no disponible | Fixture de test (pesos aleatorios) | no disponible | Hugging Face |
| allenai/OLMo-2-0425-1B | 1B (aproximado, segun nombre) | no disponible en esta informacion | Modelo de lenguaje real | no disponible en esta informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Fixtures de contrato | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría, ya que el artefacto no es un modelo funcional.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce salidas útiles; cualquier uso como modelo de lenguaje es un error.
- Etiquetado como `test-artifact`: está pensado para excluirse de búsquedas de modelos candidatos y no debe desplegarse en producción.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial del artefacto ni del modelo base a partir de la información proporcionada.
- Idiomas y contexto no verificados: aunque el tokenizer se copia del modelo base, no se documenta el soporte multilingüe ni la longitud de contexto efectiva.
- Sesgos y alucinación: no aplicables en sentido estricto por la ausencia de entrenamiento, pero tampoco evaluables.
- Dependencia del repositorio transformers-mic: su validez como fixture está ligada a la versión de las expectativas del framework incluidas en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/OLMo-2-0425-1B-mic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Explicación del proceso de shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/OLMo-2-0425-1B-mic.html
- Repositorio transformers-mic (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (build_fixtures.py): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
