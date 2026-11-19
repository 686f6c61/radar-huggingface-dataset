# huggingface-mic/audio-flamingo-3-hf-mic

## Resumen

`audio-flamingo-3-hf-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado ni utilizable. Se trata de una version "slim" del checkpoint `nvidia/audio-flamingo-3-hf` de NVIDIA, reducida mediante una regla generica de shrinking (2 capas en el codificador de audio y 2 capas en el decodificador de texto) para validar contratos de integracion con Transformers. El repositorio incluye pesos reducidos, uso ejecutable y expectativas de framework en un unico paquete.

El modelo tiene 19.696.576 parametros en `safetensors`, un tamano de repo de 0,2 GB y conserva la clase `AudioFlamingo3ForConditionalGeneration` con los mismos nombres de tensores que el checkpoint original. Los pesos son aleatorios (semilla 17) y pasaron un test de sensibilidad a la entrada, no un proceso de entrenamiento. La model card lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos.

Su relevancia es exclusivamente de ingenieria: sirve para que los mantenedores de Transformers verifiquen que la implementacion de AudioFlamingo3 funciona con procesadores, plantillas de chat y configuraciones reales sin descargar el modelo completo de NVIDIA. No debe emplearse en produccion, evaluacion de calidad ni generacion de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AudioFlamingo3ForConditionalGeneration (audio-language, transformer multimodal) |
| Parametros totales | 19.696.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

La arquitectura corresponde a `AudioFlamingo3ForConditionalGeneration`, un modelo audio-language de la familia AudioFlamingo3 de NVIDIA. En esta fixture se ha reducido la configuracion a 2 capas ocultas en el modulo de audio y 2 capas ocultas en el modulo de texto, aplicando la regla generica de `sweep.py` del repositorio `huggingface/transformers-mic`. Los ficheros de procesador (`added_tokens.json`, `chat_template.jinja`, `generation_config.json`, `merges.txt`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `nvidia/audio-flamingo-3-hf`, por lo que el pipeline de tokenizacion y plantilla de chat es identico al original.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con un gate de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_features:reverse`, dio 0,107). Los tensores mantienen los mismos nombres que el checkpoint real, y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La fixture clave `beced6b5bf32` cubre todos los checkpoints cuyos ficheros de procesador son byte-identicos y cuya config coincide tras el shrinking.

## Capacidades

- Generacion condicionada a audio: la clase soporta `input_features` de audio y decodificacion de texto, pero con pesos aleatorios la salida no tiene significado semantico.
- Procesamiento multimodal audio-texto a nivel de contrato: tokenizador, plantilla de chat y configuracion de generacion funcionales y copiados del modelo original.
- Compatibilidad con Transformers: uso ejecutable documentado en `integrations/transformers/usage.md` y expectativas en `integrations/transformers/expectations`.
- Verificacion de integracion: permite comprobar carga, forward, loss y gradientes en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento multilingue ni ninguna capacidad funcional real, al no haber sido entrenado.

## Casos de uso

- Test de integracion en CI de Transformers: ejecutar el forward del modelo con entradas sinteticas para detectar regresiones en la implementacion de `AudioFlamingo3ForConditionalGeneration` sin descargar el checkpoint completo de NVIDIA.
- Validacion de contratos de procesador: comprobar que `tokenizer.json`, `chat_template.jinja` y `processor_config.json` se cargan correctamente y producen las mismas entradas que el modelo original.
- Pruebas de compatibilidad de dtype: verificar que el modelo es finito en float32, bfloat16 y float16 en forward, loss y gradientes, cubriendo rutas de mixed precision.
- Desarrollo de harness de evaluacion: usar la fixture como sustituto ligero en pruebas de infraestructura de benchmarking antes de escalar al modelo real.
- Validacion de pipelines de despliegue: probar el empaquetado, la carga desde disco y el arranque de servidores de inferencia con un artefacto de 0,2 GB en lugar de un checkpoint grande.
- Verificacion de nombres de tensores: comparar el state dict de la fixture con el del checkpoint real para asegurar que no faltan parametros en la implementacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (19,7 M de parametros, ~79 MB de pesos) mas overhead de activaciones y procesador de audio.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe en CPU sin problema.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Transformers (via `integrations/transformers/usage.md`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser una fixture de 2+2 capas, la latencia seria muy baja pero irrelevante para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/audio-flamingo-3-hf-mic` | 19,7 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `nvidia/audio-flamingo-3-hf` | no disponible | no disponible | Modelo audio-language real | no disponible | Hugging Face |
| Otras fixtures `*-mic` de `huggingface-mic` | variable (reducidas) | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparativa relevante es con el checkpoint original de NVIDIA, del que esta fixture es una version reducida con pesos aleatorios y mismos nombres de tensores. No se dispone de datos de parametros, contexto ni licencia del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y las salidas no tienen significado. No debe usarse para generacion, evaluacion ni produccion.
- Etiquetado como `test-artifact` y `mic` para excluirlo de busquedas de modelos candidatos; usarlo fuera de tests de integracion es un error de uso.
- Licencia no disponible: no se puede confirmar si permite uso comercial; al derivar de `nvidia/audio-flamingo-3-hf`, habria que consultar la licencia del modelo base.
- Configuracion reducida (2 capas de audio, 2 de texto): no representa el comportamiento del modelo original ni su calidad.
- Idiomas y contexto no disponibles; no se puede asumir cobertura multilingue.
- Riesgo de confusion: el nombre puede llevar a descargarlo pensando que es el modelo de NVIDIA; verificar siempre la etiqueta `test-artifact`.
- No se documentan sesgos porque no hay entrenamiento; cualquier analisis de sesgo sobre esta fixture es invalido.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/audio-flamingo-3-hf-mic
- Modelo base: https://huggingface.co/nvidia/audio-flamingo-3-hf
- Contrato de integracion: `integration.json` (en el repositorio)
- Uso con Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia de la fixture: `build.json` (en el repositorio)
- Explicacion del shrinking: https://huggingface-mic-mic-coverage.static.hf.space/shrink/audio-flamingo-3-hf-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
