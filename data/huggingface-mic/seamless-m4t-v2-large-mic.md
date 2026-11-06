# huggingface-mic/seamless-m4t-v2-large-mic

## Resumen

`huggingface-mic/seamless-m4t-v2-large-mic` es un artefacto de prueba (test fixture) derivado de `facebook/seamless-m4t-v2-large`, el modelo de traducción de voz de Meta. No se trata de un modelo entrenado ni utilizable en producción: es una versión reducida del checkpoint original, con la misma arquitectura `SeamlessM4Tv2Model` pero con solo 2 capas de encoder y 2 de decoder, y pesos inicializados aleatoriamente con semilla 17.

El propósito del repositorio es servir como fixture de integración para el proyecto `transformers-mic`, verificando que el pipeline de carga, tokenización y ejecución de Transformers funciona correctamente con la arquitectura SeamlessM4Tv2 sin necesidad de descargar los pesos completos del modelo real. Los ficheros de procesador (tokenizer, preprocessor config, vocabulario SentencePiece) se copian byte a byte desde el checkpoint original, de modo que el comportamiento de preprocesado es idéntico.

Con 58.995.010 parámetros y un tamaño de repositorio de 0,6 GB, el artefacto está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. Cualquier uso que no sea la validación de integraciones de software carece de sentido, ya que los pesos no han sido entrenados y las salidas son ruido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SeamlessM4Tv2 (encoder-decoder transformer multimodal) |
| Parametros totales | 58.995.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible (el tokenizer cubre 38 idiomas vía `spm_char_lang38_tc.model`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | facebook/seamless-m4t-v2-large |
| Capas encoder / decoder | 2 / 2 |
| Semilla de inicializacion | 17 (pesos aleatorios) |
| Dtype de guardado | float32 |
| Tamano del repositorio | 0,6 GB |
| Descargas | 127 |
| Likes | 0 |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura `SeamlessM4Tv2Model` de Meta: un transformer encoder-decoder diseñado para traducción de voz y texto entre múltiples idiomas, con soporte para entrada de audio y texto. Sin embargo, la configuración está reducida a 2 capas de encoder y 2 de decoder mediante la regla genérica de `sweep.py` del proyecto `transformers-mic`.

No ha habido entrenamiento. Los pesos se inicializan aleatoriamente con semilla 17 y se validan mediante un «input-sensitivity gate»: cada perturbación de las entradas del contrato debe mover los logits al menos 0,001 (la perturbación más débil, `input_features:reverse`, produce 0,027). Los tensores conservan los mismos nombres que el checkpoint real, y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. Los ficheros de procesador (`added_tokens.json`, `generation_config.json`, `preprocessor_config.json`, `seamlessm4t_arch.svg`, `sentencepiece.bpe.model`, `special_tokens_map.json`, `spm_char_lang38_tc.model`, `tokenizer.model`, `tokenizer_config.json`) se copian byte a byte desde `facebook/seamless-m4t-v2-large`.

## Capacidades

- Ninguna capacidad funcional real: los pesos son aleatorios y no producen traducciones, transcripciones ni texto coherente.
- Sirve como fixture de integración para validar la carga de `SeamlessM4Tv2Model` en Transformers.
- Permite verificar el pipeline de tokenización y preprocesado de audio con los ficheros de procesador reales del modelo base.
- Valida la compatibilidad de nombres de tensores y la serialización en safetensors.
- Comprueba la estabilidad numérica en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multietapa ni capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en CI/CD: usar el fixture para verificar que una nueva versión de Transformers carga y ejecuta `SeamlessM4Tv2Model` sin descargar el checkpoint completo de 2,3 GB.
- Desarrollo de pipelines de audio: validar el flujo de preprocesado (extracción de features, tokenización) con los ficheros de procesador idénticos a los del modelo real.
- Test de serialización: comprobar que safetensors, float32 y los nombres de tensores se preservan correctamente en herramientas de conversión.
- Validación de cuantización: probar flujos de conversión a bfloat16/float16 verificando que el forward, loss y gradientes permanecen finitos.
- Regresión de frameworks: detectar cambios de API en Transformers que rompan la carga de modelos SeamlessM4Tv2 antes de que afecten a producción.
- Documentación de contratos: servir como referencia ejecutable del contrato de integración (`integration.json`) para el proyecto `transformers-mic`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad sería irrelevante.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (59 M de parámetros); el repositorio ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 3060, RTX 4090) es suficiente; también funciona en CPU.
- Cabe holgadamente en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: Transformers (carga estándar), con posible uso en vLLM o TGI solo si soportan la arquitectura SeamlessM4Tv2; llama.cpp y Ollama no están confirmados para esta arquitectura.
- Latencia y throughput: no disponible; al ser un fixture sin valor funcional, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/seamless-m4t-v2-large-mic | 59,0 M | no disponible | Fixture de test | no disponible | Hugging Face |
| facebook/seamless-m4t-v2-large | no disponible en la informacion | no disponible | Traduccion voz/texto | no disponible en la informacion | Hugging Face |
| facebook/seamless-m4t-v2-medium | no disponible en la informacion | no disponible | Traduccion voz/texto | no disponible en la informacion | Hugging Face |
| facebook/seamless-m4t-v2-large | no disponible en la informacion | no disponible | Traduccion voz/texto | no disponible en la informacion | Hugging Face |

La comparativa con alternativas funcionales no es significativa: el artefacto no compite con modelos de traducción de voz, sino que es una herramienta de ingeniería de software.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce salidas útiles ni coherentes.
- Etiquetado como `test-artifact`; no debe usarse en producción ni como modelo candidato.
- No se ha entrenado con RLHF, DPO ni ningún otro método de alineación.
- Licencia no disponible: no se puede confirmar el uso comercial del artefacto ni del modelo base.
- Idiomas no disponibles en la metadata; el tokenizer cubre 38 idiomas pero el modelo no los procesa de forma funcional.
- No apto para evaluación de calidad, benchmarks ni comparativas de rendimiento.
- El tamaño reducido (2 capas de encoder/decoder) no representa el comportamiento del checkpoint real.
- Riesgo de confusión: puede descargarse por error al buscar el modelo de Meta; verificar siempre la etiqueta `test-artifact`.

## Enlaces

- [Hugging Face: huggingface-mic/seamless-m4t-v2-large-mic](https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic)
- [Modelo base: facebook/seamless-m4t-v2-large](https://huggingface.co/facebook/seamless-m4t-v2-large)
- [Contract manifest (integration.json)](https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/blob/main/integration.json)
- [Transformers usage](https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/blob/main/integrations/transformers/usage.md)
- [Transformers expectations](https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/tree/main/integrations/transformers/expectations)
- [Fixture provenance (build.json)](https://huggingface.co/huggingface-mic/seamless-m4t-v2-large-mic/blob/main/build.json)
- [Como se redujo el fixture](https://huggingface-mic-mic-coverage.static.hf.space/shrink/seamless-m4t-v2-large-mic.html)
- [Repositorio transformers-mic (sweep.py)](https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py)
- [Repositorio transformers-mic (build_fixtures.py)](https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py)
