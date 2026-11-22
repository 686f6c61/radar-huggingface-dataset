# huggingface-mic/conv-bert-base-mic

## Resumen

`conv-bert-base-mic` es un artefacto de prueba publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* reducido de 2.051.556 parametros (2,1 M) construido a partir de la arquitectura ConvBERT base de `YituTech/conv-bert-base`, con pesos inicializados aleatoriamente (semilla 17) y un config reducido a 2 capas ocultas. Su proposito es servir como banco de pruebas reproducible para validar contratos de integracion con frameworks (Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo.

El repositorio incluye, ademas de los pesos en safetensors y float32, un manifiesto de contrato (`integration.json`), documentacion de uso para Transformers, un directorio de expectativas del framework y metadatos de trazabilidad (`build.json`) con hashes de ficheros y resultados del *gate* de sensibilidad de entrada. Los ficheros de procesador (`vocab.txt`) se copian byte a byte del modelo original, de modo que la tokenizacion coincide con la del checkpoint real.

Su relevancia es puramente de ingenieria: permite a los mantenedores de librerias comprobar que la carga, el forward, la perdida y los gradientes se comportan de forma finita en float32, bfloat16 y float16, con los mismos nombres de tensores que el modelo completo. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe emplearse en produccion ni como base para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBERT (encoder tipo BERT con atencion por convolucion), clase `ConvBertModel` |
| Parametros totales | 2.051.556 (fixture reducido; el modelo base completo tiene muchos mas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el fixture no documenta `max_position_embeddings`) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32, verificado finito en bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Modelo base | `YituTech/conv-bert-base` |
| Numero de capas del fixture | 2 (`num_hidden_layers` reducido por `sweep.py`) |
| Ficheros de procesador | `vocab.txt` copiado byte a byte del modelo base |
| Semilla de inicializacion | 17 (pesos aleatorios) |

## Arquitectura y entrenamiento

La arquitectura subyacente es ConvBERT, un encoder tipo BERT que sustituye parte de las cabezas de atencion por modulos de atencion basada en convolucion (span-based dynamic convolution) para reducir coste computacional manteniendo calidad. El fixture conserva la clase `ConvBertModel` y los mismos nombres de tensores que el checkpoint original, pero reduce el numero de capas ocultas a 2 mediante la regla generica de `sweep.py` del repositorio `transformers-mic`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y solo se aceptaron tras superar un *gate* de sensibilidad de entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `attention_mask:all_ones`, produce 0,0103). Esto garantiza que el fixture responde de forma medible a cambios en las entradas, condicion necesaria para pruebas de integracion. Los pesos se guardan en float32, el dtype con el que carga por defecto `YituTech/conv-bert-base`, y se ha verificado que el forward, la perdida y los gradientes son finitos en float32, bfloat16 y float16. El fichero `build.json` registra las fuentes fijadas, los resultados del gate y los hashes.

## Capacidades

- Carga y ejecucion en Transformers como `ConvBertModel` con los mismos nombres de tensores que el checkpoint real.
- Tokenizacion identica a la del modelo base gracias al `vocab.txt` copiado byte a byte.
- Forward, calculo de perdida y retropropagacion estables y finitos en float32, bfloat16 y float16.
- Sensibilidad verificada a perturbaciones de las entradas del contrato (incluida `attention_mask`).
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es un encoder sin cabeza de tarea y con pesos aleatorios.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues documentadas.

## Casos de uso

- Pruebas de integracion en librerias: validar que la carga de un `ConvBertModel` en Transformers funciona con un repositorio pequeno (0,2 GB) en lugar del checkpoint completo, reduciendo tiempo de CI y ancho de banda.
- Verificacion de contratos de framework: el directorio `integrations/transformers/expectations` permite comprobar que las salidas y formas de tensores coinciden con lo esperado tras cambios en la libreria.
- Pruebas de precision numerica: comprobar que forward, perdida y gradientes permanecen finitos en float32, bfloat16 y float16 antes de aplicar cambios en kernels o en el codigo de mixed precision.
- Validacion de tokenizacion: al copiar `vocab.txt` byte a byte, sirve para testear pipelines de tokenizacion que deben coincidir con los del modelo base.
- Reproducibilidad de artefactos: `build.json` y los hashes permiten reconstruir el fixture con `python example/build_fixtures.py --fixture conv-bert-base-mic` y comparar resultados.
- Pruebas de sensibilidad de entrada: el gate documentado (desplazamiento minimo de logits de 0,001) se puede reutilizar como criterio de aceptacion en otros fixtures generados con la misma metodologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para 2,1 M parametros (los pesos ocupan unos 8 MB); el repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer o integrada es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en CPU sin dificultad.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `conv-bert-base-mic` | 2,1 M (fixture) | no disponible | Artefacto de prueba para integracion | no disponible | Hugging Face (`huggingface-mic`) |
| `YituTech/conv-bert-base` | no disponible en la informacion | no disponible | Encoder ConvBERT completo para NLP | no disponible | Hugging Face (`YituTech`) |
| Otros fixtures `transformers-mic` | variable (reducidos) | no disponible | Pruebas de contrato en CI | no disponible | Repositorio `transformers-mic` |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y la model card lo declara explicitamente como `test-artifact`.
- El config esta reducido a 2 capas ocultas, por lo que no reproduce el comportamiento numerico del checkpoint completo.
- No dispone de cabeza de tarea ni de pipeline definido; no puede usarse para clasificacion, generacion ni extraccion de caracteristicas con sentido.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Idiomas no documentados.
- Longitud de contexto no documentada; no debe asumirse la del modelo base.
- Riesgo de confusion: por el nombre puede confundirse con un modelo real de la familia ConvBERT; conviene verificar la etiqueta `test-artifact` antes de integrarlo en cualquier pipeline.
- No apto para produccion, evaluacion de calidad ni fine-tuning.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/conv-bert-base-mic
- Modelo base: https://huggingface.co/YituTech/conv-bert-base
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures (`build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/conv-bert-base-mic.html
- Organizacion en Hugging Face: https://huggingface.co/huggingface-mic
