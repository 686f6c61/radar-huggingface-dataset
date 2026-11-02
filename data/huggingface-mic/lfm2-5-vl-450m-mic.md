# huggingface-mic/LFM2.5-VL-450M-mic

## Resumen

`huggingface-mic/LFM2.5-VL-450M-mic` no es un modelo entrenado, sino un *fixture* de pruebas publicado por la organizacion `huggingface-mic`. Se trata de una version reducida artificialmente del modelo `LiquidAI/LFM2.5-VL-450M`, con la misma arquitectura (`Lfm2VlForConditionalGeneration`) pero con solo 2 capas en el codificador visual y 2 capas en el decodificador de texto. Su proposito es servir como artefacto de validacion para frameworks de inferencia y para la infraestructura de tests del ecosistema Transformers, no para uso productivo.

El repositorio contiene pesos aleatorios generados con semilla 17, acompanados de los ficheros de procesador copiados byte a byte del modelo original (`tokenizer.json`, `tokenizer_config.json`, `processor_config.json`, `chat_template.jinja`, `generation_config.json` y `LICENSE`). Los pesos se guardan en `bfloat16` y pasaron una puerta de sensibilidad a la entrada que garantiza que perturbaciones en las entradas mueven los logits al menos 0,001, de modo que el fixture es funcional para pruebas de integracion aunque no produzca salidas coherentes.

Es relevante exclusivamente como herramienta de ingenieria: permite verificar contratos de API, formas de tensores, nombres de parametros y rutas de ejecucion de un modelo vision-lenguaje sin necesidad de descargar ni ejecutar el checkpoint real de 450M. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos. No debe confundirse con el modelo base de LiquidAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm2VlForConditionalGeneration` (vision-lenguaje, config reducida) |
| Parametros totales | 4.464.832 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; el fichero `LICENSE` se copia del modelo base |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `LiquidAI/LFM2.5-VL-450M`, un modelo vision-lenguaje de tipo `Lfm2VlForConditionalGeneration`. La unica diferencia estructural es la reduccion de capas: 2 capas en el codificador visual y 2 capas en el decodificador de texto, aplicando la regla generica de reduccion definida en `sweep.py` del repositorio `huggingface/transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar rutas de carga y ejecucion sin modificar el codigo del framework.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato mueve los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,319). El modelo se verifico como finito en `float32`, `bfloat16` y `float16` para forward, perdida y gradientes. Los ficheros de procesador y tokenizador se copiaron byte a byte del modelo base, de modo que el preprocesado y la tokenizacion son identicos a los del original.

## Capacidades

- No es un modelo funcional: no genera texto, razonamiento, codigo ni descripciones de imagenes coherentes.
- Reproduce la interfaz de un modelo image-text-to-text (`image-text-to-text`) a efectos de contrato de API.
- Permite validar formas de tensores, nombres de parametros y flujo de datos de entrada/salida.
- Sirve como fixture para tests de integracion en Transformers y en frameworks compatibles.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma util.
- No tiene capacidades multilingues reales; hereda el tokenizador del modelo base pero carece de conocimiento.
- No dispone de modo thinking, vision funcional ni audio.

## Casos de uso

- Pruebas de integracion en Transformers: verificar que `Lfm2VlForConditionalGeneration` carga y ejecuta el forward con pesos y config reducidos, sin descargar el checkpoint de 450M.
- Validacion de contratos de API: comprobar formas de entrada y salida (`pixel_values`, `input_ids`, `attention_mask`) contra las expectativas documentadas en `integrations/transformers/expectations`.
- CI/CD de frameworks de inferencia: ejecutar tests de humo en pipelines automatizados con un artefacto de pocos megabytes y pesos en bfloat16.
- Desarrollo de wrappers y servidores de inferencia: probar el enrutado, la serializacion y el manejo de errores de un endpoint vision-lenguaje sin coste de GPU.
- Verificacion de tokenizador y procesador: al copiarse byte a byte del modelo base, permite validar plantillas de chat (`chat_template.jinja`) y configuracion de generacion.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture LFM2.5-VL-450M-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es un artefacto de prueba con pesos aleatorios y no produce salidas evaluables en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 dado el tamano de 4,46M parametros; cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte de bfloat16 o float16 (RTX 3060 o superior, T4, A100, H100); tambien ejecutable en CPU.
- Cabe en GPU consumer: si, en todas las GPU modernas e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (referencia principal); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture, las mediciones no son representativas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/LFM2.5-VL-450M-mic` | 4,46M | no disponible | Fixture de pruebas | no disponible | HuggingFace |
| `LiquidAI/LFM2.5-VL-450M` | 450M (segun nombre) | no disponible | Modelo vision-lenguaje real | no disponible | HuggingFace |
| Otros fixtures `huggingface-mic` | variable | no disponible | Pruebas de integracion | no disponible | HuggingFace |

La comparativa relevante es con el modelo base del que deriva: el fixture conserva arquitectura, nombres de tensores y procesador, pero sustituye los pesos entrenados por pesos aleatorios y reduce el numero de capas. No es un sustituto funcional del modelo de LiquidAI.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de sentido.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; no debe desplegarse en produccion.
- La licencia no aparece en los metadatos del repositorio; el fichero `LICENSE` se copia del modelo base, por lo que las condiciones reales dependen de `LiquidAI/LFM2.5-VL-450M`.
- No se documentan sesgos porque no hay entrenamiento; cualquier analisis de sesgo debe remitirse al modelo base.
- Riesgo de confusion: el nombre puede llevar a error, ya que sugiere un modelo de 450M cuando en realidad tiene 4,46M parametros.
- El contexto, los idiomas y las capacidades reales no estan disponibles y no deben inferirse del nombre.
- Uso comercial: no recomendado; consultar la licencia del modelo base antes de cualquier reutilizacion de los ficheros de procesador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/huggingface-mic/LFM2.5-VL-450M-mic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Repositorio de construccion de fixtures: https://github.com/huggingface/transformers-mic
- Script de reduccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LFM2.5-VL-450M-mic.html
