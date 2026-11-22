# frankmorales2020/GLM-4-32B-0414-topo-triton-Q8_0-GGUF

## Resumen

GLM-4-32B-0414-topo-triton-Q8_0-GGUF es una cuantizacion de 8 bits (Q8_0) en formato GGUF del modelo GLM-4-32B-0414 de Zhipu AI (zai-org), reajustado mediante un proceso de aprendizaje continuo denominado Topological Continual Backpropagation (Topo-CBP) con un optimizador Triton fusionado llamado TopoAdamW. Lo publica Frank Morales Aguilera, del Sovereign Machine Laboratory (SOMALA) en Montreal, y esta pensado para ejecutarse con llama.cpp y llama-cpp-python en entornos de inferencia determinista.

El modelo parte de la arquitectura densa de 32B parametros de GLM-4 y aplica un ajuste fino sobre el dataset yahma/alpaca-cleaned (12.500 ejemplos de entrenamiento y 500 de evaluacion, max_seq_len=512) entrenando unicamente 932.640.768 parametros correspondientes a lm_head y capas de normalizacion, con el resto del modelo congelado en 4-bit NF4. El resultado se fusiona de nuevo con el checkpoint bfloat16 base antes de exportar a GGUF.

Su relevancia es acotada pero concreta: el autor pone el enfasis en la reproducibilidad bit a bit (temperature=0.0, top_k=1, top_p=1.0, seed=123) y en la fijacion de anclas primas ([2, 3, 5, 7, 11, 13]) con auditoria SHA-256, lo que lo orienta a casos donde la determinacion exacta de la salida importa mas que el rendimiento bruto. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base GLM-4-32B-0414) |
| Parametros totales | 32.566.081.536 (32,57B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso configura n_ctx=2048 |
| Tipos de cuantizacion | Q8_0 (8 bits); el pipeline intermedio genera F16 |
| Idiomas soportados | no disponibles |
| Licencia | other (heredada del modelo base; consultar terminos de zai-org/GLM-4-32B-0414) |
| Formato de pesos | GGUF (llama.cpp); checkpoint intermedio bfloat16 y F16 GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del GLM-4-32B-0414 original de Zhipu AI, un transformer denso de 32,57 mil millones de parametros. Sobre esa base, el autor aplica un ajuste con Topological Continual Backpropagation: se congelan todos los pesos salvo lm_head y las capas de normalizacion (932.640.768 parametros entrenables), se carga el modelo en 4-bit NF4 con cuantizacion doble y computo en bfloat16, y se optimiza con TopoAdamW, un kernel Triton fusionado con lr pico de 1e-4, decaimiento coseno con warmup, weight_decay=1e-2 y max_grad_norm=1.0. El entrenamiento dura 3 epocas con batch_size=2 y acumulacion de gradiente de 16 sobre alpaca-cleaned.

Tras el ajuste se fusionan 247 tensores coincidentes sobre el checkpoint bfloat16 base y se exporta a GGUF mediante convert_hf_to_gguf.py (F16, 60,67 GiB) y llama-quantize (Q8_0, 32,24 GiB). El elemento diferenciador es el mecanismo de anclas primas con digest SHA-256 de referencia (d6b0458680af9d90) y deriva de ancla maxima de 0.000000e+00, que el autor presenta como garantia de integridad criptografica del artefacto. La perdida de validacion pasa de 1,3292 en la linea base a 1,0452 al final del entrenamiento, con un minimo intermedio de 1,0471 en el paso 300.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de GLM-4-32B-0414.
- Generacion de codigo: la model card incluye pruebas con funciones Python para calcular digests SHA-256 y consultas SQL para detectar correos duplicados.
- Razonamiento y resumen: se documentan pruebas de sintesis sobre el compromiso entre retencion y adaptacion en aprendizaje continuo.
- Inferencia determinista: salidas reproducibles bit a bit con temperature=0.0, top_k=1, top_p=1.0 y seed fija, verificado con hashes SHA-256 de salida coincidentes entre ejecuciones.
- Compatibilidad con llama.cpp, llama-cpp-python y Ollama (segun los tags del repositorio).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking para esta variante concreta.

## Casos de uso

- Generacion determinista de codigo en pipelines de verificacion: el modelo produce funciones Python reproducibles bit a bit, lo que permite comparar hashes de salida en tests de regresion sin ruido estocastico.
- Auditoria de integridad de artefactos: el esquema de anclas primas y digest SHA-256 permite verificar que el modelo cargado coincide con el publicado antes de desplegarlo en produccion.
- Experimentacion en aprendizaje continuo: sirve como referencia para estudiar estabilidad-plasticidad, ya que el autor documenta la progresion de perdida y la deriva de anclas durante el ajuste con Topo-CBP.
- Procesamiento de datos tabulares y SQL: las pruebas con consultas para detectar correos duplicados lo sitúan como utilidad para tareas de limpieza de datos reproducibles.
- Despliegue en entornos sin GPU: al ser un GGUF de llama.cpp, puede ejecutarse en CPU con n_gpu_layers=0, adecuado para laboratorios con hardware limitado.
- Investigacion sobre cuantizacion Q8_0: permite medir la degradacion frente al checkpoint bfloat16 original en tareas de codigo y resumen.
- Reproducibilidad cientifica: util en entornos donde se exige que dos ejecuciones con la misma semilla produzcan exactamente la misma salida, como validacion de experimentos o generacion de fixtures de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la progresion de perdida de entrenamiento y validacion:

| Checkpoint / paso | Metrica | Valor |
|---|---|---|
| Linea base (pre-entrenamiento) | Perdida de validacion | 1,3292 |
| Paso 20 | Perdida de entrenamiento | 1,2021 |
| Paso 100 | Perdida de validacion | 1,0794 |
| Paso 300 | Perdida de validacion | 1,0471 |
| Paso 800 | Perdida de validacion | 1,0482 |
| Paso 1100 | Perdida de validacion | 1,0452 |
| Final (3 epocas) | Deriva de ancla / digest | 0,000000e+00 / d6b0458680af9d90 |

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 32,24 GiB de pesos mas overhead de contexto KV; con n_ctx=2048 el consumo total ronda los 34-36 GiB, aunque la cifra exacta no esta publicada.
- GPU recomendadas: A100 80 GB, H100 80 GB o dos GPU de 24 GB en configuracion multi-GPU con offload parcial; una RTX 4090 de 24 GB no puede alojar el modelo completo en VRAM.
- Cabe en GPU de consumo solo con offload parcial a CPU (n_gpu_layers ajustado) o en ejecucion integra en CPU, a costa de latencia mucho mayor.
- Opciones de despliegue: llama.cpp, llama-cpp-python y Ollama segun los tags del repositorio; no se documenta soporte verificado de vLLM ni TGI para este artefacto GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-4-32B-0414-topo-triton-Q8_0-GGUF | 32,57B | no disponible (ejemplo con n_ctx=2048) | GGUF Q8_0 | other | Ajuste Topo-CBP, inferencia determinista verificada |
| zai-org/GLM-4-32B-0414 (base) | 32,57B | no disponible en la informacion | safetensors bfloat16 | otra (Zhipu AI) | Modelo original sin ajuste de Morales Aguilera |
| Alternativas de ~32B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El ajuste se realiza exclusivamente sobre alpaca-cleaned en ingles con max_seq_len=512; el comportamiento en otros idiomas o en contextos largos no esta validado.
- Solo se entrenan lm_head y capas de normalizacion; el impacto del ajuste sobre el conocimiento del modelo base es limitado y no se cuantifica con benchmarks.
- Riesgo de alucinacion inherente a los modelos de 32B, no mitigado ni evaluado en la model card.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- La licencia es "other" y hereda las restricciones del modelo base GLM-4-32B-0414; es necesario revisar los terminos de Zhipu AI antes de cualquier uso comercial.
- El repositorio presenta 0 descargas y 0 likes, sin validacion externa de la comunidad; conviene tratar el artefacto con cautela en produccion.
- El determinismo bit a bit depende de la configuracion exacta (temperature=0.0, top_k=1, top_p=1.0, seed=123, llm.reset() entre llamadas) y puede no mantenerse con otros backends o versiones de llama.cpp.
- El consumo de VRAM en Q8_0 (unos 32 GiB) limita el despliegue a hardware de gama alta o a ejecucion en CPU con latencia elevada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/frankmorales2020/GLM-4-32B-0414-topo-triton-Q8_0-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Ollama: https://ollama.com
- Contacto del autor: frank.morales@sovereign-machine-lab.ai
- ORCID del autor: 0009-0003-9528-0745
