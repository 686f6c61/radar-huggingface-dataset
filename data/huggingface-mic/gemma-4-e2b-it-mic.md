# huggingface-mic/gemma-4-E2B-it-mic

## Resumen

`gemma-4-E2B-it-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* de 36.272.132 parametros construido a partir de la arquitectura de `google/gemma-4-E2B-it`, con pesos aleatorios (semilla 17) y una configuracion reducida del mismo modelo multimodal (`Gemma4ForConditionalGeneration`).

El proposito del repositorio es servir como contrato ejecutable para frameworks: incluye los pesos reducidos, la usage ejecutable y el directorio de expectativas (`integrations/transformers/expectations`) para validar que una implementacion de Transformers carga y ejecuta correctamente un checkpoint Gemma 4 multimodal. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde el modelo base, y los nombres de tensores coinciden con los del checkpoint real.

Es relevante unicamente en el contexto de testing de integraciones y CI de frameworks, no como modelo de produccion. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. Cualquier evaluacion de capacidades, benchmarks o calidad de generacion carece de sentido sobre este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Gemma4ForConditionalGeneration` (multimodal: texto, vision y audio), configuracion reducida del modelo base |
| Parametros totales | 36.272.132 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la config del fixture esta reducida; no se publica la ventana efectiva) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la clase `Gemma4ForConditionalGeneration` del modelo base, pero con una configuracion encogida mediante la regla generica de `sweep.py`: 4 capas en la torre de texto, 2 capas en la torre de vision y 2 capas en la torre de audio. Los ficheros de procesador y tokenizer se copian sin modificacion desde `google/gemma-4-E2B-it`, de modo que el pipeline de preprocesado es identico al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se validaron con una *input-sensitivity gate*: cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanza 0,91). Los tensores se guardan en bfloat16, el dtype por defecto del modelo base, y se comprobo que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture `b9875ec11c59` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el encogimiento.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen texto, codigo ni respuestas coherentes.
- Replica la interfaz de `Gemma4ForConditionalGeneration`, incluyendo las torres de texto, vision y audio en version reducida.
- Sirve como contrato de carga y ejecucion para validar integraciones de Transformers (nombres de tensores, shapes, dtypes, plantilla de chat y configuracion de generacion).
- Permite verificar que el pipeline multimodal (processor + tokenizer) se comporta igual que con el checkpoint real.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma util, al carecer de entrenamiento.
- Multilingue solo en la medida en que el tokenizer copiado lo sea; no hay evaluacion de capacidades por idioma.

## Casos de uso

- CI de integraciones de Transformers: cargar el fixture en cada PR para comprobar que la clase `Gemma4ForConditionalGeneration` sigue aceptando los mismos tensores y shapes sin descargar el checkpoint completo.
- Validacion de pipelines multimodales: ejecutar el processor con texto, imagen y audio sinteticos para detectar regresiones en el preprocesado.
- Pruebas de compatibilidad de dtypes: verificar forward, loss y backward en float32, bfloat16 y float16 con un modelo del mismo grafo pero de tamano manejable.
- Desarrollo de herramientas de conversion: probar scripts de conversion a otros formatos (por ejemplo, GGUF) sobre un checkpoint pequeno antes de aplicarlos al modelo real.
- Tests de plantilla de chat: comprobar que `chat_template.jinja` y `generation_config.json` se interpretan correctamente por el runtime sin coste de descarga.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture gemma-4-E2B-it-mic` y comparar hashes registrados en `build.json`.
- Docencia y demos de arquitectura: inspeccionar la estructura de un modelo multimodal Gemma 4 con 36 M de parametros en lugar de decenas de miles de millones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria invalida.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (36,3 M de parametros, ~72 MB de pesos), aunque el modelo no produce salidas utiles.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; tambien CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en portatiles sin GPU dedicada.
- Opciones de despliegue: Transformers (referencia del contrato); vLLM, llama.cpp, Ollama y TGI no estan documentados para este fixture.
- Latencia y throughput: no disponibles; irrelevantes dado que no es un modelo funcional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/gemma-4-E2B-it-mic` | 36,3 M | no disponible | Fixture de test | no disponible | Hugging Face |
| `google/gemma-4-E2B-it` | no disponible en la informacion | no disponible | Modelo multimodal de produccion | no disponible en la informacion | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Contratos de test para otros modelos | no disponible | Hugging Face |

La comparacion directa con alternativas de la misma categoria (modelos de 36 M utiles) no procede: este repositorio no compite en capacidad, sino en cobertura de contrato de la arquitectura Gemma 4.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no genera lenguaje coherente ni responde a instrucciones; no debe desplegarse en produccion bajo ningun concepto.
- Etiquetado como `test-artifact`: el autor lo excluye deliberadamente de busquedas de modelos candidatos.
- Configuracion encogida: 4 capas de texto, 2 de vision y 2 de audio, por lo que el comportamiento numerico no representa al modelo base.
- Licencia no declarada en la informacion disponible: verificar los terminos antes de cualquier redistribucion.
- Los ficheros de procesador y tokenizer se heredan del modelo base; sus condiciones de uso pueden aplicar en cascada.
- No hay datos de sesgos, alucinacion ni rendimiento por idioma porque no se ha entrenado ni evaluado.
- Aunque el repositorio ocupe 1,3 GB, la mayor parte corresponde a ficheros auxiliares y al empaquetado; los pesos en si son minimos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/gemma-4-E2B-it-mic
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Explicacion del encogimiento del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/gemma-4-E2B-it-mic.html
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla generica de encogimiento (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
