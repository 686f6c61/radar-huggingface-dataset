# huggingface-mic/xlm-roberta-base-mic

## Resumen

`xlm-roberta-base-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version "adelgazada" (slim) de `FacebookAI/xlm-roberta-base` creada para validar contratos de integracion con frameworks. El repositorio combina pesos reducidos, ejemplos de uso ejecutables y un directorio de expectativas de framework, todo bajo la etiqueta `test-artifact` para excluirlo de las busquedas de modelos candidatos.

Tecnicamente conserva la arquitectura `XLMRobertaForMaskedLM` pero con solo 2 capas ocultas (`num_hidden_layers: 2`) frente a las 12 del modelo original, lo que reduce el total a 16.354.450 parametros (frente a los ~278M de XLM-RoBERTa base). Los ficheros del procesador (`sentencepiece.bpe.model`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo original, garantizando que la tokenizacion sea identica.

Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron una puerta de sensibilidad a la entrada que exigia que cualquier perturbacion de las entradas moviera los logits al menos 0,001. Su relevancia es exclusivamente de ingenieria: sirve para probar pipelines de integracion, validacion de tensores y compatibilidad de frameworks sin descargar el checkpoint completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), `XLMRobertaForMaskedLM` |
| Parametros totales | 16.354.450 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens; el fixture no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en float32; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (heredados del tokenizer de XLM-RoBERTa base, no declarados) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas ocultas | 2 (`num_hidden_layers: 2`) |
| Dimension del repositorio | 0,1 GB |
| Semilla de pesos | 17 (aleatorios) |
| Modelo base | FacebookAI/xlm-roberta-base |

## Arquitectura y entrenamiento

El modelo es una instancia reducida de `XLMRobertaForMaskedLM`, obtenida aplicando la regla generica de reduccion de `sweep.py` del repositorio `huggingface/transformers-mic`, que en este caso fija `num_hidden_layers` a 2. Los nombres de los tensores coinciden con los del checkpoint real, de modo que el fixture puede sustituir al modelo original en pruebas de carga y validacion de formas sin cambios en el codigo cliente.

No hubo entrenamiento. Los pesos se inicializan de forma aleatoria con semilla 17 y se aceptan porque superan la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil es `attention_mask:all_ones`, con 0,00242). Los ficheros del procesador se copian literalmente de `FacebookAI/xlm-roberta-base`, y el fixture se guarda en float32, el dtype por defecto del modelo base. El artefacto esta identificado por la clave de fixture `d20dca8df17e` y cubre todo checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras la reduccion.

## Capacidades

- Generacion de logits para la tarea de fill-mask (`XLMRobertaForMaskedLM`), con pesos aleatorios y sin valor semantico.
- Ejecucion de forward, calculo de perdida y gradientes en float32, bfloat16 y float16, segun declara la model card.
- Validacion de contratos de integracion con Transformers: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` y `integrations/transformers/expectations`.
- Verificacion de compatibilidad de tokenizer: los ficheros de SentencePiece y tokenizer JSON son identicos a los del modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Pruebas de integracion en CI/CD: el fixture permite ejecutar tests de carga de modelos `XLMRobertaForMaskedLM` en pipelines sin descargar el checkpoint de ~278M parametros, reduciendo tiempo y ancho de banda.
- Validacion de contratos de framework: el directorio `integrations/transformers/expectations` permite comprobar que una version de Transformers produce las formas y dtypes esperados para la arquitectura XLM-RoBERTa.
- Desarrollo de wrappers y librerias: al conservar los nombres de tensores del checkpoint real, sirve para probar codigo que inspecciona o manipula pesos sin depender del modelo completo.
- Verificacion de estabilidad numerica: al ser finito en float32, bfloat16 y float16, permite validar rutas de computo mixtas en forward, perdida y gradientes.
- Pruebas de tokenizacion: los ficheros del procesador copiados byte a byte permiten validar pipelines de preprocesado con el tokenizer real de XLM-RoBERTa base.
- Reproducibilidad de artefactos: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, lo que facilita auditorias de builds reproducibles.
- Docencia y demos de arquitectura: util para explicar la estructura interna de XLM-RoBERTa con un repositorio de 0,1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, GLUE, etc.) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 (16,35M parametros, ~65 MB de pesos) y ~33 MB en float16; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU sin problema.
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la inferencia es practicamente instantanea, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Proposito | Licencia |
|---|---|---|---|---|---|
| xlm-roberta-base-mic | 16,35M | 2 | no disponible | Fixture de test | no disponible |
| FacebookAI/xlm-roberta-base | ~278M | 12 | 512 | Modelo real de fill-mask multilingue | MIT (segun el modelo original) |
| Fixtures equivalentes de otros modelos | variable | reducidas | no disponible | Test de integracion | no disponible |

La comparativa relevante es contra el modelo base: el fixture reduce parametros en un orden de magnitud (~16x) y capas de 12 a 2, manteniendo tokenizer y nombres de tensores. No compite en calidad ni rendimiento porque no esta entrenado.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado; la propia model card lo etiqueta como `test-artifact`.
- No debe usarse en produccion ni para inferencia real de fill-mask.
- Sesgos: no aplicables en sentido estadistico por falta de entrenamiento, pero el tokenizer heredado de XLM-RoBERTa base podria arrastrar sesgos de su corpus original.
- Riesgo de alucinacion: no aplica como modelo generativo; las predicciones de fill-mask son ruido.
- Contexto e idiomas: no declarados; el limite de 512 tokens del modelo base no se confirma en el fixture.
- Licencia no disponible: no se puede asumir uso comercial sin consultar el repositorio original de XLM-RoBERTa.
- Puede confundirse con un modelo real en busquedas; el tag `test-artifact` existe precisamente para filtrarlo.
- La fecha de creacion indicada (2026-10-29) es posterior a la de esta ficha, lo que sugiere metadatos inconsistentes o de prueba.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/xlm-roberta-base-mic
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/xlm-roberta-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/xlm-roberta-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/xlm-roberta-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/xlm-roberta-base-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/xlm-roberta-base-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reduccion `sweep.py`: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
