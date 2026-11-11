# huggingface-mic/GLM-4.7-Flash-mic

## Resumen

GLM-4.7-Flash-mic es un artefacto de prueba (fixture) publicado en Hugging Face por la organizacion `huggingface-mic`. No se trata de un modelo utilizable: es una version "adelgazada" (slim) del checkpoint real `zai-org/GLM-4.7-Flash`, reducida a 19,9 millones de parametros para servir como fixture de validacion de contratos de integracion con frameworks (concretamente Transformers y su pipeline MIC). El repositorio incluye pesos, uso ejecutable y expectativas de framework en un mismo paquete.

El objetivo de este artefacto es verificar que una arquitectura `Glm4MoeLiteForCausalLM` se carga, ejecuta y produce resultados finitos en distintos dtypes, sin necesidad de entrenamiento. Los pesos son aleatorios (semilla 17) y los ficheros de procesador (tokenizer, chat template, generation config) se copian byte a byte del modelo base real. Por tanto, no resuelve ningun problema de inferencia real: su relevancia es exclusivamente para desarrolladores que mantienen integraciones de frameworks y necesitan fixtures ligeros y reproducibles.

La arquitectura subyacente es la del modelo base `zai-org/GLM-4.7-Flash`, un transformer MoE ligero (`Glm4MoeLite`), pero aqui reducida a 2 capas ocultas. Cualquier uso como modelo generativo, de razonamiento o de codigo es inviable con este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm4MoeLiteForCausalLM (transformer MoE ligero, reducido a 2 capas ocultas) |
| Parametros totales | 19.901.060 (~19,9 M) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El artefacto replica la arquitectura `Glm4MoeLiteForCausalLM` del modelo base `zai-org/GLM-4.7-Flash`, pero con una configuracion reducida: `num_hidden_layers = 2`, aplicando la regla generica de adelgazamiento del script `sweep.py` del repositorio `huggingface/transformers-mic`. Los nombres de tensores coinciden con los del checkpoint real, de modo que la estructura de pesos es equivalente aunque el tamano sea orders of magnitude menor.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y pasaron una "input-sensitivity gate": cada perturbacion de las entradas del contrato movia los logits al menos 0,001 (el caso mas debil, `input_ids:roll_batch`, alcanzo 1,09). Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copiaron byte a byte del modelo base. El artefacto es finito en float32, bfloat16 y float16 (forward, loss y gradientes), y se guardo en bfloat16, el dtype por defecto del checkpoint real. La clave de fixture es `da28e64d5c12` y cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el adelgazamiento.

## Capacidades

- Carga y ejecucion en Transformers bajo la arquitectura `Glm4MoeLiteForCausalLM`.
- Validacion de contratos de integracion: manifiesto `integration.json`, uso ejecutable y directorio de expectativas.
- Ejecucion forward, calculo de loss y gradientes finitos en float32, bfloat16 y float16.
- Reproducibilidad de nombres de tensores respecto al checkpoint real.
- No dispone de capacidades generativas utiles: los pesos son aleatorios y el modelo es un fixture de prueba.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma funcional (solo replica la estructura del modelo base).
- Multilingue: no aplicable, ya que el tokenizer se copia pero los pesos no han sido entrenados.

## Casos de uso

- Validacion de integraciones de Transformers: usar el fixture para comprobar que la clase `Glm4MoeLiteForCausalLM` se instancia, carga pesos safetensors y ejecuta un forward sin errores antes de probar con el checkpoint real de 19,9 M de parametros.
- Test de regresion en CI de frameworks: incluir el repositorio como fixture ligero (0,1 GB) para detectar roturas en la carga de configuracion, tokenizer y chat template sin descargar el modelo base completo.
- Verificacion de compatibilidad de dtypes: comprobar que forward, loss y gradientes son finitos en float32, bfloat16 y float16, util para pipelines de mixed precision.
- Desarrollo de herramientas de inspeccion de modelos: validar scripts que enumeran nombres de tensores y comparan estructuras con el checkpoint real, gracias a que los nombres coinciden.
- Pruebas de tokenizer y chat template: al copiarse byte a byte del modelo base, permite testear el formateo de conversaciones y la tokenizacion sin pesos entrenados.
- Benchmarking de infraestructura de carga: medir tiempos de carga, uso de memoria y latencia de inicializacion en entornos de despliegue (vLLM, TGI, llama.cpp) con un artefacto minimo antes de escalar al modelo real.
- Docencia y demos de arquitectura MoE: ilustrar la estructura de un `Glm4MoeLite` con 2 capas y pesos aleatorios para explicar el flujo de tensores sin coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios y 2 capas ocultas, no procede evaluar calidad generativa, MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (19,9 M de parametros, ~40 MB de pesos); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso CPU es suficiente; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU-only.
- Opciones de despliegue: Transformers (principal via documentada), y previsiblemente llama.cpp, Ollama o TGI si aceptan la arquitectura `Glm4MoeLite`, aunque no se documenta soporte explicito para estos runners.
- Latencia y throughput: no disponibles; al ser un fixture, no se han publicado mediciones. La carga es practicamente instantanea por el tamano reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| GLM-4.7-Flash-mic (este) | 19,9 M | no disponible | no disponible | Fixture de prueba, pesos aleatorios |
| zai-org/GLM-4.7-Flash (base) | no disponible en la informacion | no disponible | no disponible | Modelo real de produccion |
| Otros fixtures de transformers-mic | variable | no disponible | no disponible | Validacion de contratos de frameworks |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoria; la comparacion relevante es exclusivamente estructural (fixture frente a checkpoint real).

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y el modelo tiene solo 2 capas ocultas; cualquier salida generada carece de sentido.
- Riesgo de confusion: el nombre `GLM-4.7-Flash-mic` puede llevar a pensar que es una variante del modelo real; la etiqueta `test-artifact` existe precisamente para excluirlo de busquedas de modelos candidatos.
- Licencia no disponible: no se puede confirmar el regimen de uso comercial; al ser un artefacto de prueba, no se recomienda su uso en produccion.
- Idiomas no disponibles: el tokenizer se copia del modelo base, pero no hay garantia de comportamiento linguistico.
- Sesgos y alucinaciones: no aplicables en sentido practico, ya que no hay entrenamiento; cualquier evaluacion de sesgo sobre este artefacto seria invalida.
- Dependencia del modelo base: cambios en `zai-org/GLM-4.7-Flash` (config, processor files) pueden invalidar la clave de fixture `da28e64d5c12`.
- No sustituye al checkpoint real en ningun pipeline de inferencia, evaluacion o despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/GLM-4.7-Flash-mic
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Pagina de adelgazamiento del fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/GLM-4.7-Flash-mic.html
- Repositorio transformers-mic (script sweep): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Manifiesto de contrato (integration.json): https://huggingface.co/huggingface-mic/GLM-4.7-Flash-mic/blob/main/integration.json
- Uso en Transformers: https://huggingface.co/huggingface-mic/GLM-4.7-Flash-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/GLM-4.7-Flash-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture (build.json): https://huggingface.co/huggingface-mic/GLM-4.7-Flash-mic/blob/main/build.json
