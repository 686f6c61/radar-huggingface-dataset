# huggingface-mic/DeepSeek-V3.2-mic

## Resumen

DeepSeek-V3.2-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No se trata de un modelo entrenado ni utilizable para inferencia real, sino de un "fixture" (modelo reducido de prueba) generado a partir de la arquitectura de `deepseek-ai/DeepSeek-V3.2`. Su propósito es servir como banco de pruebas para validar la integración de la arquitectura `DeepseekV32ForCausalLM` en frameworks como Transformers, no para generar texto de calidad.

El repositorio contiene pesos "slim" de 18.106.468 parámetros (aproximadamente 18,1 millones) con pesos aleatorios (semilla 17), guardados en bfloat16, junto con los ficheros de procesador (tokenizer, configuración de generación y licencia) copiados byte a byte del checkpoint original de DeepSeek. La configuración se ha reducido a 2 capas ocultas manteniendo los nombres de tensores idénticos a los del modelo real.

Es relevante únicamente en el contexto de ingeniería de software: permite a los desarrolladores de Transformers y de otros frameworks ejecutar pruebas de contrato (contract tests) ligeras sobre la arquitectura DeepSeek V3.2 sin descargar el checkpoint completo. El autor lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepseekV32ForCausalLM (transformer causal, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 18.106.468 (dato real de safetensors) |
| Parametros activos | no disponible (el modelo base DeepSeek-V3.2 es MoE, pero la ficha del fixture no aporta el desglose de expertos activos) |
| Longitud de contexto | no disponible (no se especifica en la model card del fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16; algunos tensores en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos del repo; el fichero LICENSE se copia del checkpoint `deepseek-ai/DeepSeek-V3.2` |
| Formato de pesos | safetensors (bfloat16 y float32 segun tensor) |

## Arquitectura y entrenamiento

El fixture reproduce la arquitectura `DeepseekV32ForCausalLM` del modelo base DeepSeek-V3.2, pero con una configuración reducida mediante la regla genérica de `sweep.py` del proyecto `transformers-mic`: `num_hidden_layers = 2`. Mantiene los nombres de tensores idénticos a los del checkpoint real (incluidos tensores de atención con MQA, expertos compartidos, `e_score_correction_bias`, escalas de cuantización `weight_scale_inv` y el `indexer` de atención), lo que permite validar la carga y el forward pass de la arquitectura sin descargar los pesos completos.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (la más débil, `input_ids:roll_batch`, 0,454). Los tensores se guardaron en bfloat16, el dtype por defecto de DeepSeek-V3.2, manteniendo en float32 aquellos que el checkpoint original almacena en ese dtype (normalizaciones, escalas de cuantización, sesgos del router). El modelo es finito en float32, bfloat16 y float16 para forward, loss y gradientes.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de pruebas de contrato para validar la implementación de `DeepseekV32ForCausalLM` en Transformers y otros frameworks.
- Permite verificar la carga de safetensors con la nomenclatura exacta de tensores del checkpoint DeepSeek-V3.2 (atención MQA, expertos compartidos, escalas de cuantización, indexer).
- Valida el forward pass, el cálculo de loss y los gradientes en float32, bfloat16 y float16.
- Incluye ficheros de procesador (tokenizer.json, tokenizer_config.json, generation_config.json) copiados byte a byte del modelo base, útiles para probar pipelines de tokenización.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integración en Transformers: ejecutar la suite de tests de `DeepseekV32ForCausalLM` cargando este fixture de 0,1 GB en lugar del checkpoint completo, reduciendo tiempos de CI y uso de disco.
- Validación de contratos de framework: comprobar que un nuevo framework o versión de Transformers carga correctamente los nombres de tensores, dtypes y configuración de DeepSeek-V3.2 antes de probar con pesos reales.
- Desarrollo de kernels y operadores: verificar implementaciones de atención MQA, MoE con expertos compartidos o escalas de cuantización contra un modelo de referencia ligero.
- Depuración de pipelines de carga de safetensors: reproducir problemas de dtype (bfloat16 vs float32) y de nomenclatura de tensores sin descargar cientos de GB.
- Pruebas de regresión de tokenizer: usar los ficheros de tokenizer copiados del modelo base para validar cambios en el pipeline de tokenización.
- Docencia y experimentación: estudiar la estructura interna de la arquitectura DeepSeek V3.2 (nombres de tensores, organización de capas, expertos) con un repositorio manejable de 0,1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar calidad de generación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (18,1 M de parámetros en bfloat16, más overhead de activaciones mínimo).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también ejecutable en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estándar con `AutoModelForCausalLM`), útil en pipelines de CI. No tiene sentido práctico desplegarlo con vLLM, TGI, llama.cpp u Ollama, ya que no genera texto útil.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, el coste computacional es despreciable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3.2-mic | 18,1 M | no disponible | Fixture de pruebas | no disponible | Hugging Face (repo publico) |
| deepseek-ai/DeepSeek-V3.2 | no disponible en esta ficha | no disponible | Modelo real de produccion | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (segun arquitectura) | no disponible | Pruebas de contrato por arquitectura | no disponible | Hugging Face (org huggingface-mic) |

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no han sido entrenados; la salida es ruido estadístico.
- Etiquetado como `test-artifact` por el autor para excluirlo de búsquedas de modelos candidatos; no debe emplearse en producción ni en evaluaciones de calidad.
- La licencia no aparece en los metadatos del repositorio; el fichero LICENSE se copia del checkpoint `deepseek-ai/DeepSeek-V3.2`, por lo que las condiciones de uso dependen de la licencia del modelo base, no especificada aquí.
- La configuración reducida (2 capas) no representa el comportamiento del modelo real; cualquier medición de rendimiento o calidad sobre el fixture es irrelevante para DeepSeek-V3.2.
- Riesgo de confusión: el nombre puede llevar a pensar que es una versión ligera funcional del modelo; no lo es.
- No se especifican idiomas, contexto ni cuantizaciones; cualquier uso que dependa de esos parámetros debe consultarse en la ficha del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.2
- Explicación del proceso de reducción (shrink): https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-V3.2-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
