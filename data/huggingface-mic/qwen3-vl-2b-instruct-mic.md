# huggingface-mic/Qwen3-VL-2B-Instruct-mic

## Resumen

Qwen3-VL-2B-Instruct-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, no un modelo utilizable. Se trata de una version reducida artificialmente del modelo real Qwen/Qwen3-VL-2B-Instruct, en la que se ha conservado la arquitectura Qwen3VLForConditionalGeneration pero se ha recortado la configuracion (dos capas ocultas en el modulo de texto) hasta los 11.177.792 parametros. Los pesos son aleatorios (semilla 17), por lo que el modelo no produce ninguna salida con sentido.

El proposito del repositorio es servir como contrato de integracion: incluye un manifiesto (integration.json), ejemplos de uso con Transformers, un directorio de expectativas del framework y los ficheros de procesador copiados byte a byte del checkpoint original (tokenizer, chat template, generation config, preprocessor y video preprocessor). Asi, un desarrollador puede validar que su pipeline de carga, preprocesado e inferencia con Qwen3-VL funciona sin descargar el modelo completo de 2B parametros.

Es relevante unicamente en el contexto de testing de infraestructura de IA: CI/CD de librerias, verificacion de contratos de tokenizer/processor y pruebas de forward, loss y gradientes en float32, bfloat16 y float16. No debe confundirse con un modelo de vision-lenguaje funcional ni utilizarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3VLForConditionalGeneration (vision-lenguaje, transformer; version reducida a 2 capas ocultas en el modulo de texto) |
| Parametros totales | 11.177.792 (fixture); el modelo base Qwen3-VL-2B-Instruct tiene aproximadamente 2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuracion del fixture esta recortada) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 y verificados finitos en float32, bfloat16 y float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El fixture replica la clase Qwen3VLForConditionalGeneration del modelo Qwen3-VL-2B-Instruct, que combina un codificador visual con un decoder de texto transformer. Para reducir el tamano se aplico la regla generica de sweep.py del proyecto transformers-mic, que deja el modulo de texto en 2 capas ocultas. Los nombres de tensores coinciden exactamente con los del checkpoint real, lo que permite probar codigo de carga sin cambios.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. Para garantizar que el fixture es sensible a las entradas, se aplico una puerta de sensibilidad (input-sensitivity gate) que exige que cada perturbacion de las entradas del contrato mueva los logits al menos 0.001; la perturbacion mas debil (pixel_values:halve) produjo 0.159. Los ficheros de procesador (chat_template.json, generation_config.json, merges.txt, preprocessor_config.json, tokenizer.json, tokenizer_config.json, video_preprocessor_config.json, vocab.json) se copiaron byte a byte del modelo base. El build queda registrado en build.json con fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- No es un modelo funcional: los pesos aleatorios no generan texto, codigo ni descripciones de imagenes coherentes.
- Ejecuta forward, calculo de loss y gradientes de forma finita en float32, bfloat16 y float16, lo que permite probar pipelines de entrenamiento de un paso.
- Carga con Transformers mediante la clase Qwen3VLForConditionalGeneration y los ficheros de procesador del modelo real.
- Reproduce el contrato de tokenizer, chat template, configuracion de generacion y preprocesado de imagen y video de Qwen3-VL-2B-Instruct.
- Sirve como fixture para pruebas de integracion y regresion en frameworks (expectativas incluidas en integrations/transformers/expectations).
- No soporta tool calling, agentes, razonamiento multilingue ni ninguna capacidad de inferencia real.

## Casos de uso

- Pruebas de CI en librerias de inferencia: cargar el fixture con Transformers y verificar que la API de Qwen3VLForConditionalGeneration no rompe entre versiones, sin descargar 2B parametros.
- Validacion de pipelines de preprocesado de vision: comprobar que preprocessor_config.json y video_preprocessor_config.json producen tensores con las formas esperadas para imagenes y video.
- Verificacion de contratos de tokenizer y chat template: ejecutar el chat_template.json original contra secuencias de prueba para detectar regresiones en el formateo de mensajes.
- Test de un paso de entrenamiento: ejecutar forward, loss y backward en float32, bfloat16 y float16 para comprobar que el codigo de entrenamiento no produce NaN ni infinitos.
- Desarrollo de herramientas de empaquetado y conversion de pesos: usar los nombres de tensores identicos al checkpoint real para validar scripts de conversion o sharding.
- Pruebas de integracion en frameworks (por ejemplo, adaptadores de Transformers): consumir el directorio de expectativas como referencia de comportamiento esperado del modelo.
- Validacion de infraestructura de descarga y cache: probar flujos de Hugging Face Hub con un repositorio de 0.0 GB antes de lanzar trabajos con el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, benchmarks de vision) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (11,2M parametros), aunque el modelo no es funcional.
- GPU recomendadas: cualquier GPU consumer o integrada con soporte de PyTorch; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en CPU.
- Opciones de despliegue: Transformers con PyTorch; no se ha validado vLLM, llama.cpp, Ollama ni TGI, y su uso no tiene sentido al no ser un modelo entrenado.
- Latencia y throughput: no disponibles; al ser un fixture no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-2B-Instruct-mic | 11,2M (fixture) | no disponible | Artefacto de prueba | no disponible | Hugging Face |
| Qwen/Qwen3-VL-2B-Instruct | aproximadamente 2B | no disponible | Modelo vision-lenguaje real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (reducidos) | no disponible | Pruebas de contrato e integracion | no disponible | Hugging Face |

La comparativa relevante es contra el modelo base: el fixture conserva la interfaz y los ficheros de procesador, pero no los pesos ni la capacidad de inferencia. Frente a otros modelos de 2B de vision-lenguaje, la diferencia es categorica: el fixture no compite en calidad ni rendimiento.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen ningun significado; no usar en produccion, demos ni evaluaciones.
- Etiquetado como test-artifact para excluirlo de busquedas de modelos candidatos; el autor advierte explicitamente que no es un modelo utilizable.
- Configuracion recortada (2 capas ocultas en el modulo de texto), por lo que no representa el comportamiento numerico del modelo real.
- Licencia no disponible: no hay base clara para uso comercial; el modelo base Qwen3-VL-2B-Instruct tiene sus propias condiciones que deben consultarse por separado.
- Idiomas no disponibles; no se puede evaluar cobertura multilingue.
- Riesgo de confusion: el nombre puede llevar a descargarlo pensando que es una version ligera funcional de Qwen3-VL-2B-Instruct.
- No se han publicado mediciones de latencia, throughput ni benchmarks.
- La fecha de creacion indicada (2026-10-29) es posterior a la de esta ficha; conviene verificar la procedencia del repositorio antes de integrarlo en pipelines.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Contrato de integracion: https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3-VL-2B-Instruct-mic/blob/main/build.json
- Explicacion del recorte: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3-VL-2B-Instruct-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
