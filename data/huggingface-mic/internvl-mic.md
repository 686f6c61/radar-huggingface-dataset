# huggingface-mic/internvl-mic

## Resumen

`internvl-mic` es un artefacto de prueba (fixture) publicado en Hugging Face por la organización `huggingface-mic`. No es un modelo utilizable: se trata de una versión reducida artificialmente del checkpoint `OpenGVLab/InternVL3-1B-hf`, con 9.973.120 parámetros (aproximadamente 10 millones) frente a los aproximadamente 1.000 millones del modelo original. Su propósito es servir como fixture de integración para validar frameworks y contratos de ejecución sin necesidad de descargar ni ejecutar el modelo completo.

El repositorio incluye los pesos reducidos, un manifiesto de contrato (`integration.json`), documentación de uso y expectativas para Transformers, y un registro de procedencia de la construcción (`build.json`). La arquitectura declarada es `InternVLForConditionalGeneration`, la misma que el modelo base, pero con el número de capas del codificador visual y del modelo de lenguaje reducido a 2 en cada caso. Los pesos son aleatorios (semilla 17) y no han sido entrenados.

Es relevante exclusivamente en el contexto de pruebas de software: permite verificar que un pipeline de carga, tokenización, preprocesado de imágenes y ejecución forward funciona correctamente con la arquitectura InternVL, manteniendo nombres de tensores idénticos al checkpoint real y ficheros de procesador copiados byte a byte. Está etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | InternVLForConditionalGeneration (transformer multimodal visión-lenguaje) |
| Parámetros totales | 9.973.120 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `InternVLForConditionalGeneration`, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para generar texto condicionado a imágenes y texto. En esta fixture, la configuración se ha reducido mediante la regla genérica de `sweep.py`: el codificador visual tiene `num_hidden_layers` = 2 y el modelo de lenguaje también 2 capas. Los nombres de tensores coinciden exactamente con los del checkpoint real `OpenGVLab/InternVL3-1B-hf`, lo que permite validar la compatibilidad de carga.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y superaron una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato movió los logits al menos 0,001 (la más débil, `pixel_values:halve`, 0,0117). Los ficheros del procesador (`added_tokens.json`, `chat_template.jinja`, `generation_config.json`, `merges.txt`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde el modelo base. Los pesos son finitos en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. La construcción se documenta en `build.json` con fuentes fijadas, resultados de la puerta y hashes de ficheros.

## Capacidades

- Carga y ejecución forward con la arquitectura InternVL: permite validar pipelines de inferencia multimodal (imagen + texto) en frameworks compatibles.
- Compatibilidad de nombres de tensores: al replicar exactamente los nombres del checkpoint real, sirve para probar rutinas de carga, sharding y conversión de pesos.
- Procesador idéntico al modelo base: tokenizador, plantilla de chat y configuración de preprocesado copiados byte a byte, útiles para probar tokenización y preprocesado de imágenes.
- Ejecución en float32, bfloat16 y float16: permite probar rutas de precisión mixta y comprobar estabilidad numérica.
- No tiene capacidades generativas reales: los pesos son aleatorios y la salida no es coherente.
- No soporta tool calling, agentes ni razonamiento multi-step de forma funcional.
- No dispone de capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en Transformers: cargar el modelo con `AutoModelForConditionalGeneration` y verificar que la configuración, el procesador y los nombres de tensores son compatibles con InternVL3, sin descargar el checkpoint de 1B.
- Validación de contratos de framework: usar `integration.json` y `integrations/transformers/expectations` para comprobar que una versión de Transformers cumple las expectativas de entrada/salida del modelo.
- Pruebas de CI/CD: ejecutar tests de humo en pipelines de integración continua con un repositorio de 0,1 GB en lugar de un checkpoint completo, reduciendo tiempo y ancho de banda.
- Desarrollo de utilidades de conversión de pesos: probar scripts de conversión, cuantización o sharding contra una arquitectura InternVL realista pero ligera.
- Validación de preprocesado multimodal: verificar que el pipeline de imágenes y texto (pixel values, tokens, plantilla de chat) produce las formas y tipos esperados.
- Reproducción de la fixture: reconstruir los ficheros con `python example/build_fixtures.py --fixture internvl-mic` y comprobar hashes y resultados de la puerta de sensibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar rendimiento de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en bfloat16 (9,97 M parámetros, aproximadamente 20 MB de pesos más overhead de activaciones y procesador).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer moderna e incluso en CPU para pruebas de humo.
- Opciones de despliegue: Transformers (uso previsto según la documentación del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser una fixture de pruebas, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| huggingface-mic/internvl-mic | 9,97 M | no disponible | no disponible | Fixture de pruebas |
| OpenGVLab/InternVL3-1B-hf | ~1 B | no disponible | no disponible | Modelo multimodal real |
| Otros artefactos `test-artifact` de huggingface-mic | variable | no disponible | no disponible | Fixtures de integración |

La comparación relevante es con su modelo base: `internvl-mic` es una versión reducida (~1 % de los parámetros) del checkpoint `OpenGVLab/InternVL3-1B-hf`, con la misma arquitectura y procesador, pero sin capacidades funcionales. No se dispone de datos de benchmarks ni de licencia para ninguno de los dos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact`: no debe usarse en producción ni incluirse en búsquedas de modelos candidatos.
- Sesgos conocidos: no aplica, al no haber entrenamiento; los pesos aleatorios no reflejan distribución de datos real.
- Riesgo de alucinación: total, cualquier salida es ruido.
- Limitaciones de contexto e idioma: no disponibles; la configuración reducida no representa el comportamiento del modelo base.
- Restricciones de licencia: la licencia no está disponible en la información proporcionada; debe consultarse el repositorio del modelo base para uso comercial.
- Caveat para producción: no usar como sustituto del checkpoint real; su utilidad se limita a pruebas de integración y compatibilidad de frameworks.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/internvl-mic
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B-hf
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/internvl-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/internvl-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/internvl-mic/tree/main/integrations/transformers/expectations
- Procedencia de la fixture: https://huggingface.co/huggingface-mic/internvl-mic/blob/main/build.json
- Documentación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/internvl-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
