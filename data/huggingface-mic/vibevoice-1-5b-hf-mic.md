# huggingface-mic/VibeVoice-1.5B-hf-mic

## Resumen

VibeVoice-1.5B-hf-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic en Hugging Face. No es un modelo utilizable: se trata de una version reducida artificialmente del modelo real `vibevoice/VibeVoice-1.5B-hf`, generada para validar la integracion del modelo con la libreria Transformers y el ecosistema de frameworks asociado. El repositorio incluye pesos "slim", ejemplos de uso ejecutables y las expectativas de framework en un unico paquete.

El modelo conserva la arquitectura del original (`VibeVoiceForConditionalGeneration`), pero con una configuracion drasticamente reducida: 2 capas ocultas en el modulo de texto y 2 capas en la cabeza de difusion. Los pesos son aleatorios (semilla 17) y no han sido entrenados; simplemente superaron una puerta de sensibilidad a la entrada que verifica que las perturbaciones en las entradas mueven los logits al menos 0,001. El total de parametros reales registrados en safetensors es de 14.292.797, muy lejos de los 1.500 millones que sugiere el nombre del modelo base.

Su relevancia es exclusivamente para desarrolladores que trabajan en el mantenimiento de Transformers o en la validacion de contratos de integracion: permite ejecutar pruebas de humo con un peso minimo (0,6 GB) sin descargar el checkpoint completo. Esta etiquetado como `test-artifact` precisamente para excluirlo de busquedas de modelos candidatos a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VibeVoiceForConditionalGeneration (transformer con cabeza de difusion, version reducida) |
| Parametros totales | 14.292.797 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la clase `VibeVoiceForConditionalGeneration`, la misma que el checkpoint original `vibevoice/VibeVoice-1.5B-hf`, pero con la configuracion reducida mediante la regla generica de `sweep.py` del proyecto transformers-mic: `text num_hidden_layers = 2` y `diffusion_head num_hidden_layers = 2`. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture puede cargarse con el mismo codigo que el modelo completo. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte desde el modelo original.

No hubo entrenamiento. Los pesos se inicializaron aleatoriamente con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (la mas debil, `input_ids:reverse`, produjo 1,45). Los pesos se guardaron en bfloat16, el dtype con el que carga por defecto el modelo base, y se verifico que son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el shrink, identificados por la clave `bfe2bceb199c`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto ni audio coherente.
- Conserva la interfaz de procesador y tokenizer del modelo VibeVoice original (text-to-speech).
- Permite ejecutar el pipeline de Transformers de VibeVoice con un peso minimo para pruebas de integracion.
- Sirve como fixture de contrato: valida que el codigo de carga, forward y generacion funciona con la arquitectura declarada.
- Compatible con los mismos nombres de tensores que el checkpoint real, lo que facilita pruebas de compatibilidad.
- No dispone de tool calling, agentes, vision ni capacidades multilingues verificables.

## Casos de uso

- Pruebas de humo en CI/CD de Transformers: ejecutar la carga y el forward de VibeVoice con 0,6 GB en lugar del checkpoint completo, reduciendo tiempo y ancho de banda en cada pipeline.
- Validacion de contratos de integracion: comprobar que los ficheros de procesador y la config del modelo real son compatibles con la version de la libreria antes de publicar una release.
- Desarrollo de codigo de carga sin GPU: al ser un modelo de 14,3 M de parametros, se puede cargar en CPU para depurar la logica de preprocesado y generacion.
- Verificacion de dtypes: comprobar que el codigo de inferencia funciona en float32, bfloat16 y float16 sin errores de NaN o infinitos.
- Reproduccion de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture VibeVoice-1.5B-hf-mic` y comparar hashes con `build.json`.
- Pruebas de regresion de tokenizer y chat template: validar que las plantillas de conversacion y el tokenizador se comportan igual que en el modelo original.
- Educacion y demostracion: ilustrar como se construye un fixture de contrato en el ecosistema transformers-mic sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, WER de TTS) carece de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (14,3 M de parametros, repo de 0,6 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer e integrada.
- Opciones de despliegue: Transformers con el codigo de integracion de VibeVoice; no se documentan soportes de vLLM, llama.cpp, Ollama ni TGI para este fixture.
- Latencia y throughput: no disponibles; al ser un fixture, no se han medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeVoice-1.5B-hf-mic (este) | 14,3 M | no disponible | Fixture de prueba | no disponible | Hugging Face |
| vibevoice/VibeVoice-1.5B-hf | ~1.500 M (segun nombre) | no disponible | TTS real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato | no disponible | Hugging Face |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria, ya que el modelo no es funcional y el checkpoint base no aporta metricas en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no genera texto ni audio con sentido; no debe usarse en produccion bajo ninguna circunstancia.
- Esta etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; ignorar esta etiqueta puede llevar a integrar un artefacto inutil.
- La licencia no esta declarada en la informacion disponible; no se puede asumir uso comercial sin consultar el repositorio original.
- El nombre "1.5B" es enganoso: el fixture tiene 14,3 M de parametros, no 1.500 M.
- No se documentan idiomas soportados ni longitud de contexto.
- Riesgo de confusion con el modelo base real `vibevoice/VibeVoice-1.5B-hf`; verificar siempre el ID del repositorio antes de descargar.
- No hay garantia de que el comportamiento del procesador copiado coincida con el del checkpoint real si este se actualiza.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/VibeVoice-1.5B-hf-mic
- Modelo base: https://huggingface.co/vibevoice/VibeVoice-1.5B-hf
- Manifiesto de contrato: integration.json (en el repositorio)
- Uso con Transformers: integrations/transformers/usage.md (en el repositorio)
- Expectativas de Transformers: integrations/transformers/expectations (en el repositorio)
- Procedencia del fixture: build.json (en el repositorio)
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/VibeVoice-1.5B-hf-mic.html
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de shrink: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
