# huggingface-mic/gemma-4-12B-it-mic

## Resumen

`huggingface-mic/gemma-4-12B-it-mic` no es un modelo entrenado, sino un *fixture* de pruebas: una version reducida artificialmente del checkpoint `google/gemma-4-12B-it` construida para validar la integracion del framework Transformers con la arquitectura `Gemma4UnifiedForConditionalGeneration`. Lo publica la organizacion `huggingface-mic` y lleva la etiqueta explicita `test-artifact`, cuyo proposito declarado es mantenerlo fuera de las busquedas de modelos candidatos. Con 52.598.626 parametros reales (segun los tensores en safetensors) y un repositorio de 0,1 GB, es dos ordenes de magnitud mas pequeno que el modelo del que deriva.

El problema que resuelve es de ingenieria de software, no de IA aplicada: permite ejecutar pruebas de contrato (formas de tensores, nombres de parametros, sensibilidad de entradas, finitud en float32/bfloat16/float16) sin descargar ni cargar el checkpoint completo de 12B. Los pesos son aleatorios (semilla 17) y no han sido entrenados; pasaron unicamente una puerta de sensibilidad a las entradas, donde cada perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `input_ids:reverse`, dio 1,23).

Es relevante ahora para desarrolladores que trabajan en el ecosistema Transformers y necesitan verificar la compatibilidad de la arquitectura Gemma4Unified con nuevos procesadores, plantillas de chat o configuraciones de generacion. No es util para inferencia real, generacion de texto ni ninguna tarea de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration` (multimodal, transformer reducido a 2 capas de texto) |
| Parametros totales | 52.598.626 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `Gemma4UnifiedForConditionalGeneration` del checkpoint `google/gemma-4-12B-it`, pero con una configuracion reducida mediante la regla generica de `sweep.py` del repositorio `transformers-mic`: el campo `text num_hidden_layers` queda en 2. Los ficheros del procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo original, de modo que las pruebas ejercitan exactamente el mismo pipeline de preprocesado y tokenizacion.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se generaron para superar una puerta de sensibilidad a las entradas: toda perturbacion de las entradas del contrato debe mover los logits al menos 0,001. Los nombres de tensores coinciden con los del checkpoint real y los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture se construyo con `build_fixtures.py` y su procedencia (fuentes fijadas, resultados de la puerta y hashes de ficheros) queda registrada en `build.json`.

## Capacidades

- No es un modelo funcional: no genera texto coherente, no razona, no escribe codigo ni resuelve matematicas.
- Sirve como banco de pruebas de contrato para la arquitectura `Gemma4UnifiedForConditionalGeneration`.
- Permite validar la carga de procesador y tokenizer identicos a los del modelo base.
- Cubre cualquier checkpoint cuyos ficheros de procesador sean byte-identicos y cuya config coincida tras el proceso de reduccion (clave de fixture `dfb12081158d`).
- Verifica finitud numerica en float32, bfloat16 y float16 (forward, loss, gradientes).
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues reales.

## Casos de uso

- Pruebas de integracion en CI: cargar el fixture en un job de integracion continua para comprobar que la clase `Gemma4UnifiedForConditionalGeneration` se instancia y ejecuta un forward sin errores, sin descargar el checkpoint de 12B.
- Validacion de nuevas plantillas de chat: al copiar `chat_template.jinja` byte a byte, permite probar cambios en el pipeline de mensajes contra el mismo tokenizer del modelo real.
- Verificacion de nombres de tensores: comprobar que un script de conversion o de sharding espera exactamente los mismos nombres que el checkpoint oficial.
- Pruebas de finitud numerica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaN o inf en cambios de kernel o de atencion.
- Desarrollo de utilidades de carga: probar cargadores, resharders o wrappers de `from_pretrained` contra un repositorio pequeno antes de apuntar al modelo de 12B.
- Reproduccion de la procedencia del fixture: reconstruir el artefacto con `python example/build_fixtures.py --fixture gemma-4-12B-it-mic` y comparar hashes con `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios, por lo que cualquier metrica de calidad (MMLU, HumanEval, GSM8K) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en bfloat16 (52,6 M de parametros); el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU.
- Opciones de despliegue: Transformers (uso previsto, segun `integrations/transformers/usage.md`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al tratarse de un fixture de 2 capas, la latencia es despreciable y no representativa del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gemma-4-12B-it-mic` | 52,6 M (fixture) | no disponible | Pruebas de contrato | no disponible | HuggingFace (491 descargas) |
| `google/gemma-4-12B-it` | 12B (nominal, segun nombre) | no disponible | Modelo multimodal real | no disponible | HuggingFace |
| Otros fixtures de `transformers-mic` | Variable | no disponible | Pruebas de contrato | no disponible | HuggingFace |

No se dispone de datos de rendimiento para establecer una comparativa funcional con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y la salida no tiene valor semantico.
- Etiquetado como `test-artifact`; el autor lo excluye explicitamente de la busqueda de modelos candidatos.
- La configuracion esta reducida a 2 capas de texto, por lo que el comportamiento numerico no reproduce el del checkpoint de 12B.
- No se declara licencia en la informacion disponible; verificar antes de cualquier redistribucion.
- No se declaran idiomas soportados ni contexto; no asumir ninguno.
- Riesgo de confusion: el nombre incluye "12B" pero el repositorio solo contiene 52,6 M de parametros; no debe citarse como modelo de 12B.
- Uso comercial no recomendado ni verificado; no hay garantias de soporte.
- Riesgo de alucinacion irrelevante en el sentido habitual, pero cualquier texto generado sera ruido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/gemma-4-12B-it-mic
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Documentacion de uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Manifiesto de contrato: `integration.json` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-4-12B-it-mic.html
- Repositorio `transformers-mic` (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion `build_fixtures.py`: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
