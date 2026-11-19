# huggingface-mic/DeepSeek-V3.2-mic

## Resumen

DeepSeek-V3.2-mic es un artefacto de prueba publicado por el usuario huggingface-mic en Hugging Face. No es un modelo funcional ni un fine-tuning real de DeepSeek-V3.2: es un *fixture* de 16,9 millones de parámetros construido para validar la integración de la arquitectura `DeepseekV32ForCausalLM` en el ecosistema de Transformers. El repositorio declara explícitamente en su model card que se trata de un "test artifact, not a usable model", etiquetado con `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El modelo toma como referencia `deepseek-ai/DeepSeek-V3.2` y replica su configuración arquitectónica reduciendo el número de capas ocultas a 2 mediante una regla genérica de reducción (`sweep.py`). Los pesos son aleatorios (semilla 17) y no han pasado por ningún proceso de entrenamiento; únicamente superaron una puerta de sensibilidad de entrada que verifica que perturbaciones en las entradas mueven los logits al menos 0,001. Los ficheros de procesador (tokenizer, generation config, licencia) se copiaron byte a byte del checkpoint original.

Su relevancia es exclusivamente técnica y de infraestructura: sirve para que los mantenedores de Transformers y de frameworks de inferencia verifiquen contratos de carga, nombres de tensores, dtypes y comportamiento del grafo computacional sin necesidad de descargar los cientos de gigabytes del modelo real. Cualquier uso como modelo de lenguaje en producción carece de sentido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`DeepseekV32ForCausalLM`), configuración reducida a 2 capas ocultas |
| Parametros totales | 16.911.492 |
| Parametros activos | no disponible (el modelo base es MoE, pero la configuración del fixture no detalla expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; el fichero `LICENSE` se copió del modelo base |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reproduce la clase `DeepseekV32ForCausalLM` con la misma nomenclatura de tensores que el checkpoint real, pero con `num_hidden_layers` reducido a 2. Esta reducción se aplica mediante la regla genérica implementada en `sweep.py` del repositorio `transformers-mic`, que encoge configuraciones preservando la estructura de bloques. Los ficheros `tokenizer.json`, `tokenizer_config.json`, `generation_config.json` y `LICENSE` son copias byte a byte de `deepseek-ai/DeepSeek-V3.2`.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad de entrada: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, produce 1,12). El modelo se guardó en bfloat16, el dtype por defecto de DeepSeek-V3.2, y se verificó que la forward pass, la pérdida y los gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- Carga y ejecución en Transformers bajo la clase `DeepseekV32ForCausalLM`, con nombres de tensores idénticos al checkpoint real.
- Forward pass, cálculo de pérdida y retropropagación estables en float32, bfloat16 y float16.
- Verificación de contratos de integración: manifiesto `integration.json`, expectativas de framework en `integrations/transformers/expectations` y guía de uso en `integrations/transformers/usage.md`.
- Tokenización funcional heredada del modelo base (tokenizer copiado byte a byte).
- No dispone de capacidades de generación de texto útil, razonamiento, código, matemáticas, visión, tool calling ni agentes: los pesos son aleatorios.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Pruebas de integración en Transformers: validar que la clase `DeepseekV32ForCausalLM` carga correctamente un checkpoint con la estructura de DeepSeek-V3.2 sin descargar el modelo completo. Adecuado por su tamaño de 0,1 GB y su compatibilidad de nombres de tensores.
- Desarrollo de kernels y operadores: comprobar que implementaciones personalizadas de atención o MLP producen resultados finitos y sensibles a la entrada en float32, bfloat16 y float16.
- CI/CD de frameworks de inferencia: incluir el fixture en pipelines de integración continua para detectar regresiones en la carga de safetensors y en la resolución de configuraciones.
- Validación de contratos de tokenizer: verificar que el tokenizer copiado del modelo base se integra correctamente con la pipeline de Transformers y con `generation_config.json`.
- Pruebas de cuantización: servir como sujeto de prueba para herramientas que convierten safetensors bfloat16 a GGUF u otros formatos, comprobando que la conversión no rompe la estructura de tensores.
- Reproducibilidad de fixtures: regenerar el artefacto con `python example/build_fixtures.py --fixture DeepSeek-V3.2-mic` y comparar hashes registrados en `build.json`.
- Docencia y demostraciones de arquitectura: ilustrar la estructura de un transformer causal tipo DeepSeek sin requerir hardware de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que es un artefacto de prueba sin entrenamiento, por lo que cualquier métrica de calidad (MMLU, HumanEval, GSM8K) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,9 M de parámetros, aproximadamente 34 MB de pesos, más overhead de activaciones y tokenizer).
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16, incluidas GTX 1080 Ti, RTX 2060, RTX 3060, RTX 4090, A100 y H100.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: Transformers (con la clase `DeepseekV32ForCausalLM`), y previsiblemente llama.cpp u Ollama tras conversión a GGUF, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles; al tratarse de un fixture sin utilidad generativa, las métricas de rendimiento no se han publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/DeepSeek-V3.2-mic | 16,9 M | no disponible | Fixture de test para integración de Transformers | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-V3.2 | no disponible en la información | no disponible | Modelo real de lenguaje | no disponible en la información | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Artefactos de test por arquitectura | no disponible | Hugging Face |

No se dispone de información suficiente para comparar con alternativas funcionales de la misma categoría, ya que el modelo no es un modelo de lenguaje operativo.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios (semilla 17) y no han sido entrenados. Cualquier salida generada es ruido sin valor semántico.
- Riesgo de confusión: el nombre incluye "DeepSeek-V3.2", lo que puede llevar a error si se busca el modelo real. El tag `test-artifact` existe precisamente para filtrarlo en búsquedas.
- Licencia no declarada en los metadatos; el fichero `LICENSE` se copió del modelo base, por lo que las condiciones de uso comercial dependen de la licencia de `deepseek-ai/DeepSeek-V3.2`, no verificada en la información disponible.
- Idiomas soportados no documentados; el tokenizer heredado del modelo base podría cubrir múltiples idiomas, pero no se garantiza su comportamiento sin entrenamiento.
- Longitud de contexto no disponible; la configuración reducida a 2 capas no permite inferir la ventana real del modelo base.
- No apto para producción, evaluación de calidad, generación de código, atención al cliente ni ninguna tarea downstream.
- Sesgos conocidos: no aplica, al no haber datos de entrenamiento ni distribución de salida significativa.

## Enlaces

- [Hugging Face: huggingface-mic/DeepSeek-V3.2-mic](https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic)
- [Modelo base: deepseek-ai/DeepSeek-V3.2](https://huggingface.co/deepseek-ai/DeepSeek-V3.2)
- [Repositorio transformers-mic](https://github.com/huggingface/transformers-mic)
- [Script de reducción sweep.py](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Script de construcción build_fixtures.py](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
- [Documentación del proceso de reducción](https://huggingface-mic-mic-coverage.static.hf.space/shrink/DeepSeek-V3.2-mic.html)
- [Manifiesto de contrato integration.json](https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic/blob/main/integration.json)
- [Guía de uso en Transformers](https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic/blob/main/integrations/transformers/usage.md)
- [Procedencia del fixture build.json](https://huggingface.co/huggingface-mic/DeepSeek-V3.2-mic/blob/main/build.json)
