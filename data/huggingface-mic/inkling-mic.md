# huggingface-mic/Inkling-mic

## Resumen

Inkling-mic es un artefacto de prueba (fixture) publicado por la organizacion `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de una version reducida de `thinkingmachines/Inkling` con pesos aleatorios (semilla 17), disenada para validar contratos de integracion entre Transformers y el modelo original. El repositorio incluye pesos "slim", ejemplos de uso ejecutables y un directorio de expectativas de framework, todo empaquetado para que los mantenedores puedan verificar que la implementacion de referencia se comporta como se espera.

El fixture conserva la misma arquitectura que el modelo base (`InklingForConditionalGeneration`) pero con una configuracion drasticamente reducida: 3 capas ocultas en la torre de texto y 26.736.427 parametros totales, frente al checkpoint completo de Thinking Machines. Los ficheros de procesador (tokenizer, chat template, special tokens map, processor config) se copian byte a byte del modelo original, de modo que el pipeline de tokenizacion y el contrato multimodal son identicos.

Su relevancia es puramente de ingenieria: sirve para tests de integracion, CI y validacion de frameworks sin necesidad de descargar ni ejecutar el modelo real. Esta etiquetado explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos, y no debe confundirse con un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `InklingForConditionalGeneration` (transformer multimodal, configuracion reducida) |
| Parametros totales | 26.736.427 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32 y bfloat16 segun la variante del fixture) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas ocultas (texto) | 3 |
| Semilla de pesos | 17 (pesos aleatorios) |
| Tamano del repositorio | 0.4 GB |
| Modelo base | `thinkingmachines/Inkling` |
| Etiquetas | `mic`, `test-artifact`, `region:us` |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del modelo base `thinkingmachines/Inkling`, identificada como `InklingForConditionalGeneration`, que corresponde a un modelo multimodal de generacion condicional. La unica modificacion estructural es la reduccion del numero de capas ocultas de la torre de texto a 3, aplicada mediante la regla generica de `sweep.py` del repositorio `transformers-mic`. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite validar la carga de pesos y el mapeo de parametros sin ambiguedad.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se generaron superando una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0.001 (la mas debil, `input_ids:reverse`, produce 0.0461). Los ficheros de procesador (`chat_template.jinja`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo original, por lo que el comportamiento de tokenizacion y plantilla de chat es fiel al de Inkling. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- No es un modelo funcional: genera salidas sin sentido porque los pesos son aleatorios.
- Valida la carga de pesos con los mismos nombres de tensor que el checkpoint real.
- Verifica el pipeline de tokenizacion y la plantilla de chat copiadas del modelo base.
- Comprueba el contrato de entradas y salidas de `InklingForConditionalGeneration` en Transformers.
- Sirve como fixture de tests de integracion y CI para frameworks que soporten el modelo.
- Permite validar el comportamiento numerico en float32, bfloat16 y float16.
- No soporta tool calling, agentes, razonamiento ni capacidades multilingues reales.

## Casos de uso

- Tests de integracion en CI: el fixture permite ejecutar la suite de pruebas de Transformers contra un checkpoint pequeno (0.4 GB) que reproduce la interfaz del modelo real, sin descargar el Inkling completo.
- Validacion de carga de pesos: comprobar que una nueva version de la libreria mapea correctamente los nombres de tensores del checkpoint original usando el fixture como sustituto.
- Verificacion de tokenizacion y chat template: al copiarse byte a byte del modelo base, permite testear que el pipeline de procesamiento produce las mismas secuencias que el modelo real.
- Pruebas de compatibilidad de dtypes: validar que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo completo.
- Desarrollo de tooling de framework: probar utilidades de inspeccion de modelos, conversion de formatos o generacion de configuraciones contra un checkpoint ligero con la misma estructura.
- Reproducibilidad de fixtures: el repositorio incluye `build.json` con fuentes fijadas, hashes y resultados de las puertas, lo que permite reconstruir el fixture con `build_fixtures.py` y auditar cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su rendimiento en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (26.7M parametros, aproximadamente 107 MB de pesos) y aproximadamente 54 MB en bfloat16.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU es suficiente.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU sin problemas.
- Opciones de despliegue: Transformers (carga directa), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es el proposito del artefacto.
- Latencia y throughput: no disponibles; al ser un fixture no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-mic | 26.7M | no disponible | Fixture de test | no disponible | Hugging Face |
| thinkingmachines/Inkling | no disponible | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de `huggingface-mic` | variable | no disponible | Fixtures de test | no disponible | Hugging Face |

La comparativa con modelos de produccion no es aplicable: Inkling-mic no compite en la categoria de modelos utilizables, sino que es una herramienta de validacion para el modelo base `thinkingmachines/Inkling`.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; no debe usarse para inferencia, generacion ni evaluacion de calidad.
- Etiquetado como `test-artifact`: excluido intencionadamente de busquedas de modelos candidatos.
- Licencia no especificada: no se puede asumir uso comercial; consultar el modelo base `thinkingmachines/Inkling` para condiciones reales.
- Idiomas no declarados: al no ser funcional, no aplica soporte multilingue.
- Contexto no documentado: la configuracion reducida no refleja la ventana del modelo original.
- Riesgo de confusion: puede descargarse por error pensando que es un modelo utilizable; el nombre y las etiquetas lo desaconsejan pero no lo impiden tecnicamente.
- No apto para produccion bajo ninguna circunstancia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Inkling-mic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reduccion (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Documentacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Inkling-mic.html
