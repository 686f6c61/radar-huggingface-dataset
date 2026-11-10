# huggingface-mic/manga-ocr-base-mic

## Resumen

`huggingface-mic/manga-ocr-base-mic` es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` como parte de la infraestructura de validacion de contratos de modelos para Transformers. No es un modelo utilizable en produccion: se trata de una version "adelgazada" del checkpoint real `kha-white/manga-ocr-base`, reducida a 716.032 parametros (frente a los aproximadamente 110 millones del modelo original) manteniendo la misma arquitectura `VisionEncoderDecoderModel` y los mismos nombres de tensores.

El repositorio empaqueta en un unico lugar los pesos reducidos, un manifiesto de contrato (`integration.json`), ejemplos de uso con Transformers y las expectativas del framework, con el objetivo de servir como fixture reproducible para pruebas de integracion. El modelo esta etiquetado explicitamente como `test-artifact` y `mic`, lo que lo excluye de las busquedas de modelos candidatos.

Su relevancia es puramente de ingenieria: permite validar pipelines de carga, tokenizacion, preprocesado de imagen y ejecucion de inferencia de forma ligera y determinista, sin necesidad de descargar el checkpoint completo de OCR de manga. Cualquier uso como modelo de OCR real seria inadecuado, ya que los pesos fueron sobreajustados a un unico paso de entrenamiento de 50 iteraciones y no generalizan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder de vision + decoder de texto) |
| Parametros totales | 716.032 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `VisionEncoderDecoderModel` de Transformers, la misma familia que emplea `kha-white/manga-ocr-base` para reconocimiento optico de caracteres japoneses en paginas de manga. La version "mic" conserva los nombres de tensores del checkpoint original, pero reduce drasticamente las dimensiones internas mediante la regla generica de reduccion definida en `sweep.py` del repositorio `transformers-mic`. Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.txt`) se copian byte a byte desde el modelo base, de modo que el pipeline de preprocesado es identico al original.

El entrenamiento del fixture es un sobreajuste deliberado a 50 pasos sobre el paso de entrenamiento definido en el contrato. El autor documenta que los pesos aleatorios no superaban la puerta de sensibilidad a la entrada (`pixel_values:reverse` desplazaba los logits solo 1,3e-05 frente a un umbral de 0,001), por lo que se opto por este ajuste minimo. El resultado es un modelo matematicamente estable (forward, perdida y gradientes finitos en float32, bfloat16 y float16) pero sin capacidad real de reconocimiento. La clave de fixture `f52652c64622` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya configuracion coincide tras la reduccion.

## Capacidades

- Carga y ejecucion en el pipeline `VisionEncoderDecoderModel` de Transformers, con el mismo contrato de entrada que el modelo base (imagenes + tokens de texto).
- Preprocesado de imagen identico al de `kha-white/manga-ocr-base` gracias a la copia byte a byte de los ficheros de procesador.
- Ejecucion determinista y ligera para pruebas de integracion y validacion de contratos de framework.
- Verificacion de estabilidad numerica en float32, bfloat16 y float16 (forward, perdida y gradientes).
- No soporta de forma fiable generacion de texto util, tool calling, razonamiento multi-paso ni capacidades multilingues reales: es un artefacto de prueba.
- No dispone de capacidades de agente, vision avanzada ni modos de pensamiento mas alla del contrato de inferencia basico.

## Casos de uso

- Pruebas de integracion en Transformers: validar que la carga de un `VisionEncoderDecoderModel`, el pipeline de imagen a texto y el guardado/carga de safetensors funcionan correctamente sin descargar el checkpoint completo.
- Validacion de contratos de framework: comprobar que una nueva version de Transformers respeta las expectativas declaradas en `integrations/transformers/expectations` para modelos de OCR.
- CI/CD de librerias de inferencia: usar el fixture como caso de prueba rapido (0,0 GB de repo, 716 K parametros) en pipelines de integracion continua que necesitan un modelo de vision-lenguaje sin coste de descarga.
- Desarrollo de herramientas de reduccion de modelos: servir como referencia reproducible del resultado de `sweep.py` y de `build_fixtures.py` para validar nuevas reglas de reduccion.
- Verificacion de estabilidad numerica: ejecutar forward, backward y perdida en float32, bfloat16 y float16 para detectar regresiones de precision en kernels de atencion o capas de vision.
- Pruebas de sensibilidad a la entrada: validar que las puertas de sensibilidad (por ejemplo, `pixel_values:reverse`) detectan correctamente modelos que no responden a cambios en la entrada.
- Documentacion y formacion: ejemplo minimo de como empaquetar pesos, uso y expectativas en un unico repositorio siguiendo el formato MIC.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es un artefacto de prueba sobreajustado a 50 pasos y que no debe usarse como modelo candidato; no se proporcionan metricas de MMLU, HumanEval, GSM8K ni de OCR (por ejemplo, exactitud por caracter) para este fixture.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (716 K parametros, aproximadamente 2,9 MB de pesos mas overhead de activaciones y del procesador de imagen).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien ejecutable en CPU sin problemas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` (con `VisionEncoderDecoderModel` y `AutoProcessor`), y potencialmente `optimum` o `onnxruntime` si se exporta; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este fixture.
- Latencia y throughput: no se han publicado datos; por el tamano, se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/manga-ocr-base-mic` | 716.032 | no disponible | Fixture de OCR (VisionEncoderDecoder) | no disponible | Hugging Face (tag `test-artifact`) |
| `kha-white/manga-ocr-base` | ~110 M (no confirmado en la informacion) | no disponible | OCR de manga japones | no disponible en la informacion | Hugging Face |
| Otros fixtures `huggingface-mic/*` | variable | no disponible | Fixtures de contrato para distintas arquitecturas | no disponible | Hugging Face |

La comparacion directa con modelos de OCR en produccion no es significativa: el fixture no persigue calidad de reconocimiento, sino reproducibilidad de contrato. Frente a `kha-white/manga-ocr-base`, comparte arquitectura y procesador, pero carece de pesos entrenados para la tarea.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo etiqueta como `test-artifact` y advierte que no debe usarse como modelo candidato ni en produccion.
- Sobreajuste extremo: entrenado solo 50 pasos sobre el paso de entrenamiento del contrato, sin capacidad de generalizacion.
- Riesgo de alucinacion total: cualquier salida de texto generada por el modelo carece de valor; no debe interpretarse como OCR real.
- Licencia no disponible: no se especifica licencia, por lo que el uso comercial queda sin marco legal claro (y en cualquier caso desaconsejado por su naturaleza de fixture).
- Idiomas no disponibles: no se declaran idiomas soportados; el modelo base esta orientado a japones, pero el fixture no hereda esa capacidad funcional.
- Longitud de contexto no disponible: no se documenta el limite de tokens del decoder.
- Dependencia del contrato: su validez esta ligada a la clave de fixture `f52652c64622` y a los ficheros de procesador copiados; cambios en el modelo base o en `sweep.py` pueden invalidarlo.
- Repositorio de 0,0 GB: aunque el tamano es minimo, no debe confundirse con un checkpoint completo; los pesos reales deben obtenerse de `kha-white/manga-ocr-base`.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/manga-ocr-base-mic
- Modelo base: https://huggingface.co/kha-white/manga-ocr-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/manga-ocr-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/manga-ocr-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/manga-ocr-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/manga-ocr-base-mic/blob/main/build.json
- Como se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/manga-ocr-base-mic.html
- Repositorio `transformers-mic` (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
