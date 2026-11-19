# huggingface-mic/nllb-200-distilled-600M-mic

## Resumen

`huggingface-mic/nllb-200-distilled-600M-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado utilizable. Se construye a partir de `facebook/nllb-200-distilled-600M` conservando la misma arquitectura (`M2M100ForConditionalGeneration`) pero con una configuracion reducida (2 capas en encoder y 2 en decoder) y pesos aleatorios con semilla 17. El resultado son 16.564.864 parametros, frente a los aproximadamente 615 millones del modelo original.

El repositorio existe para validar contratos de integracion: incluye pesos "slim", ejemplos de uso con Transformers y un directorio de expectativas de framework. Los ficheros del procesador (`tokenizer.json`, `sentencepiece.bpe.model`, `generation_config.json`, etc.) se copian byte a byte del checkpoint original, de modo que las pruebas de tokenizacion y generacion se ejecutan con el mismo pipeline que el modelo real.

La relevancia es exclusivamente de ingenieria: sirve para probar tooling, no para traducir. El propio autor lo etiqueta como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe desplegarse en produccion ni emplearse para evaluar calidad de traduccion, porque sus pesos son aleatorios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M100ForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 16.564.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 |
| Idiomas soportados | no disponible (procesador copiado del NLLB-200 original) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura M2M100, un transformer encoder-decoder disenado originalmente para traduccion multilingue. En este fixture se ha reducido la profundidad a 2 capas de encoder y 2 de decoder mediante la regla generica de `sweep.py` del proyecto `transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, lo que permite validar la carga de pesos y la compatibilidad de interfaces.

No ha habido entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, dio 0,0799). El modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros del procesador se copiaron sin modificacion desde `facebook/nllb-200-distilled-600M`.

## Capacidades

- Carga y ejecucion con Transformers mediante `M2M100ForConditionalGeneration`.
- Tokenizacion multilingue heredada del procesador original (SentencePiece BPE).
- Generacion condicional con `generation_config.json` del modelo base.
- Verificacion de contratos de integracion y expectativas de framework.
- Pruebas de sensibilidad a entradas y de estabilidad numerica en varias precisiones.
- No soporta traduccion de calidad: los pesos son aleatorios.
- No dispone de tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Pruebas de integracion continua: validar que una version de Transformers carga correctamente un checkpoint M2M100 sin descargar los 2,4 GB del modelo real, gracias a los 0,2 GB del repositorio.
- Desarrollo de pipelines de tokenizacion: comprobar que los ficheros del procesador (SentencePiece, special tokens) se comportan igual que en `facebook/nllb-200-distilled-600M`.
- Verificacion de contratos de framework: ejecutar el directorio `integrations/transformers/expectations` para asegurar que los cambios en la libreria no rompen la interfaz del modelo.
- Pruebas de estabilidad numerica: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de portar codigo al modelo completo.
- Validacion de serializacion safetensors: verificar nombres y formas de tensores contra el checkpoint real sin necesidad de GPU de gran memoria.
- Tests de regresion en CI con recursos limitados: el fixture cabe en cualquier entorno y permite ejecutar pruebas de humo de extremo a extremo en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (BLEU, chrF, MMLU) carece de sentido.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en float32 para los 16,6 M de parametros; cabe en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Despliegue: Transformers con `M2M100ForConditionalGeneration`; no se ha validado con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un artefacto de prueba no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `huggingface-mic/nllb-200-distilled-600M-mic` | 16,6 M | no disponible | no disponible | Fixture de pruebas |
| `facebook/nllb-200-distilled-600M` | ~615 M | no disponible | CC-BY-NC 4.0 (segun el modelo original) | Traduccion multilingue |
| `facebook/m2m100_418M` | ~418 M | no disponible | MIT (segun el modelo original) | Traduccion multilingue |

La comparativa es orientativa: el fixture no es funcionalmente equivalente a los otros dos y solo comparte arquitectura y procesador.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado linguistico.
- Etiquetado explicitamente como `test-artifact`; no debe usarse en produccion.
- No apto para evaluar calidad de traduccion ni para benchmarks.
- Licencia no declarada en el repositorio; conviene revisar la del modelo base antes de cualquier redistribucion.
- Solo cubre checkpoints con ficheros de procesador identicos y config compatible tras el shrink.
- No se han validado frameworks distintos de Transformers.
- El repositorio incluye solo pesos, uso y expectativas; otros ficheros deben regenerarse con `example/build_fixtures.py`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/nllb-200-distilled-600M-mic
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Como se genero el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/nllb-200-distilled-600M-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
