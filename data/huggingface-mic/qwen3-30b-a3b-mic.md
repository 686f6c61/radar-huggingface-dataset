# huggingface-mic/Qwen3-30B-A3B-mic

## Resumen

Qwen3-30B-A3B-mic es un artefacto de prueba publicado por el usuario huggingface-mic, no un modelo entrenado ni utilizable para inferencia real. Se presenta como una versión "slim" (reducida) del checkpoint Qwen/Qwen3-30B-A3B de Alibaba, con el objetivo de servir como fixture para validar contratos de integración y expectativas de frameworks (en concreto, Transformers) sin necesidad de cargar los 30.500 millones de parámetros del modelo original.

El repositorio contiene pesos con la misma arquitectura declarada (`Qwen3MoeForCausalLM`) pero con una configuración drásticamente reducida: 2 capas ocultas y 19.522.432 parámetros totales, generados con pesos aleatorios (semilla 17) en lugar de entrenados. Los ficheros de procesador (tokenizer, merges, vocab, generation_config, LICENSE) se copian byte a byte del checkpoint original, de modo que la interfaz de tokenización es idéntica.

La relevancia es puramente de ingeniería de software: permite a los mantenedores de Transformers y de otras librerías comprobar que el pipeline de carga, tokenización y forward pass funciona con la arquitectura Qwen3-MoE sin descargar decenas de gigabytes ni disponer de GPUs de gran capacidad. La propia model card lo etiqueta explícitamente como `test-artifact` y advierte de que "no es un modelo usable".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (transformer MoE causal, configuración reducida) |
| Parametros totales | 19.522.432 |
| Parametros activos | no disponible (la configuración reducida no documenta el reparto de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repo copia un fichero LICENSE del modelo base, pero la licencia no se declara en los metadatos) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo declara la arquitectura `Qwen3MoeForCausalLM`, es decir, la misma clase que el Qwen3-30B-A3B original: un transformer causal con mezcla de expertos (MoE). Sin embargo, la configuración se ha reducido mediante la regla genérica de `sweep.py` del proyecto transformers-mic, dejando `num_hidden_layers = 2`. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar la carga sin sorpresas de nomenclatura.

No hay entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron tras superar una "input-sensitivity gate": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, dio 0,945). Se guardan en bfloat16, el dtype por defecto del checkpoint original, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16. El repositorio incluye además un manifiesto de contrato (`integration.json`), documentación de uso para Transformers (`integrations/transformers/usage.md`), expectativas del framework (`integrations/transformers/expectations`) y procedencia del fixture (`build.json`).

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling más allá de lo que permita la interfaz de Transformers al cargarlo.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; el tokenizer es el del Qwen3-30B-A3B original, pero los pesos aleatorios no producen salidas con sentido.
- Su única capacidad verificable es servir como fixture de integración: carga con `Qwen3MoeForCausalLM`, tokeniza con el vocabulario original y ejecuta forward/loss/gradientes de forma finita en float32, bfloat16 y float16.
- Incluye documentación de expectativas del framework para validar contratos de integración.

## Casos de uso

- Pruebas de integración en Transformers: cargar el modelo con `AutoModelForCausalLM` y verificar que la clase `Qwen3MoeForCausalLM` se resuelve correctamente sin descargar el checkpoint de 30B.
- CI/CD de librerías de inferencia: ejecutar tests de forward pass, pérdida y gradientes en pipelines automatizados con un repositorio de 0,1 GB en lugar de decenas de gigabytes.
- Validación de tokenizadores: comprobar que los ficheros `tokenizer.json`, `merges.txt` y `vocab.json` copiados byte a byte del modelo base producen la tokenización esperada.
- Desarrollo de herramientas de conversión de formatos: probar scripts que leen safetensors y verifican nombres de tensores contra la arquitectura Qwen3-MoE sin coste de almacenamiento.
- Docencia y formación: ilustrar la estructura de un transformer MoE con nombres de tensores reales en un entorno de recursos limitados.
- Reproducción de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para validar que una versión de la librería cumple las expectativas declaradas.
- Pruebas de robustez numérica: verificar que un pipeline concreto mantiene valores finitos en float32, bfloat16 y float16 sobre una arquitectura MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K) sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,5 M de parámetros); el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoría de entornos CPU.
- Opciones de despliegue: Transformers (vía `Qwen3MoeForCausalLM`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia sería mínima pero sin valor representativo del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-mic | 19,5 M (fixture) | no disponible | Fixture de integracion | no disponible | Hugging Face (repo de 0,1 GB) |
| Qwen/Qwen3-30B-A3B | ~30,5 B totales (MoE) | no disponible en la informacion | Modelo real de proposito general | no disponible en la informacion | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Pruebas de contrato por arquitectura | no disponible | Hugging Face (huggingface-mic) |

La comparación relevante es contra el checkpoint original: el fixture replica la interfaz (tokenizer, nombres de tensores, clase de modelo) pero no el comportamiento. Frente a otros fixtures del mismo proyecto, comparte el enfoque de reducción por capas y verificación de sensibilidad a la entrada.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Sesgos conocidos: no aplica, al no haber entrenamiento; el tokenizer hereda los sesgos del vocabulario de Qwen3-30B-A3B.
- Riesgo de alucinación: total, en el sentido de que cualquier texto generado es ruido.
- Limitaciones de contexto e idioma: no documentadas; la configuración reducida no declara ventana de contexto.
- Restricciones de licencia: la licencia no se declara en los metadatos; el fichero LICENSE copiado del modelo base debe consultarse directamente en Qwen/Qwen3-30B-A3B antes de cualquier uso.
- Caveat para producción: no usar como sustituto del checkpoint real ni para evaluar calidad, latencia o throughput representativos.
- El repositorio solo incluye pesos slim, uso y expectativas; otros ficheros deben regenerarse con `python example/build_fixtures.py --fixture Qwen3-30B-A3B-mic`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-30B-A3B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-30B-A3B-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
