# huggingface-mic/granite-docling-258M-mic

## Resumen

`granite-docling-258M-mic` es un artefacto de prueba publicado por la organización `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable: se trata de un *fixture* de 6.743.936 parámetros construido a partir del checkpoint real `ibm-granite/granite-docling-258M` de IBM, con pesos aleatorios (semilla 17) y una configuración reducida del mismo transformer multimodal. Su propósito es servir como contrato de integración para validar el comportamiento de frameworks (principalmente Transformers) frente a la arquitectura original.

El modelo base, Granite Docling 258M, es un modelo visión-lenguaje orientado a la conversión de documentos a formatos estructurados (DocTags/Markdown), construido sobre la arquitectura `Idefics3ForConditionalGeneration`. El fixture replica esa arquitectura con 2 capas en el codificador visual y 2 capas en el decodificador de texto, conservando los ficheros de procesador y tokenizador copiados byte a byte del checkpoint original.

La relevancia de este repositorio es puramente de ingeniería: permite ejecutar pruebas de integración y regresión de la arquitectura Granite Docling sin descargar los pesos completos, verificar nombres de tensores, dtypes (bfloat16 por defecto) y estabilidad numérica en float32, bfloat16 y float16. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Idefics3ForConditionalGeneration (transformer multimodal visión-lenguaje) |
| Parametros totales | 6.743.936 (fixture reducido; el modelo base declara 258M en su nombre) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; se ha verificado estabilidad numérica en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture emplea la misma clase de arquitectura que el modelo base: `Idefics3ForConditionalGeneration`, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. La configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`, fijando 2 capas ocultas en la torre visual y 2 capas ocultas en la torre de texto. Los nombres de tensores coinciden exactamente con los del checkpoint real, de modo que el fixture puede sustituirlo en pruebas de carga y forward pass.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron tras superar una puerta de sensibilidad a las entradas: cada perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `pixel_values:halve`, produjo 0,131). Los ficheros de procesador y tokenizador (`tokenizer.json`, `tokenizer_config.json`, `vocab.json`, `merges.txt`, `chat_template.jinja`, `preprocessor_config.json`, `processor_config.json`, `special_tokens_map.json`, `added_tokens.json`, `generation_config.json`) se copiaron byte a byte desde `ibm-granite/granite-docling-258M`. El artefacto se guardó en bfloat16, el dtype con el que carga por defecto el modelo base, y se verificó que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo funcional: al tener pesos aleatorios, no genera texto, código ni descripciones de documentos con sentido.
- Sirve como contrato ejecutable para validar la integración de la arquitectura `Idefics3ForConditionalGeneration` en Transformers.
- Permite comprobar la paridad de nombres de tensores con el checkpoint real `ibm-granite/granite-docling-258M`.
- Valida el pipeline de procesamiento multimodal (imagen + texto) usando los ficheros de procesador copiados del modelo original.
- Verifica estabilidad numérica (forward, loss, gradientes) en float32, bfloat16 y float16.
- Incluye expectativas de framework en `integrations/transformers/expectations` para pruebas automatizadas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture con `Idefics3ForConditionalGeneration` y ejecutar un forward pass para detectar regresiones en la API antes de actualizar a un checkpoint completo.
- CI/CD de librerías de inferencia: usar el fixture como sustituto ligero del modelo de 258M en pipelines de integración continua, reduciendo tiempos de descarga y memoria.
- Validación de contratos de tokenizador y procesador: comprobar que los ficheros de tokenización y preprocesado copiados del modelo base se cargan correctamente en nuevas versiones del framework.
- Verificación de nombres de tensores: asegurar que scripts de conversión, cuantización o sharding siguen encontrando los mismos identificadores de parámetros que en el checkpoint original.
- Pruebas de estabilidad numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar problemas de precisión en kernels o capas nuevas.
- Desarrollo de utilidades de inspección de modelos: usar el fixture para probar herramientas que analizan configuraciones, dtypes y arquitecturas sin consumir recursos del modelo real.
- Docencia y experimentación: ilustrar la estructura de un modelo visión-lenguaje tipo Idefics3 con un repositorio de tamaño mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de calidad, y al tratarse de un artefacto con pesos aleatorios, los benchmarks no serían significativos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 para los 6,7M de parámetros del fixture; el modelo base de 258M requeriría aproximadamente 0,5 GB en bfloat16, aunque este dato no se confirma en la información disponible.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; el fixture cabe en GPUs de consumo muy básicas e incluso puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) y en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers con `Idefics3ForConditionalGeneration`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles; al ser un fixture de 2+2 capas, la latencia sería muy baja, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| granite-docling-258M-mic | 6,7M (fixture) | no disponible | no disponible | Hugging Face (`huggingface-mic`) | Artefacto de prueba |
| ibm-granite/granite-docling-258M | 258M (según nombre) | no disponible | no disponible | Hugging Face (`ibm-granite`) | Conversión de documentos |
| Idefics3 (familia) | no disponible | no disponible | no disponible | Hugging Face | Visión-lenguaje general |

La comparación con alternativas reales no está disponible en la información proporcionada; el fixture solo es comparable con su modelo base en términos de arquitectura y nombres de tensores.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas carecen de significado.
- Etiquetado como `test-artifact`; no debe emplearse en producción ni en evaluaciones de calidad.
- No se especifica licencia, por lo que el uso comercial queda sin definir y debe consultarse con el autor.
- No se documentan idiomas soportados ni sesgos, al no existir entrenamiento.
- El tamaño real del repositorio aparece como 0.0 GB, lo que puede indicar que los pesos no están completamente subidos o que el campo no se ha actualizado.
- La información sobre contexto, cuantización y benchmarks del modelo base no está disponible en esta ficha.
- No debe confundirse con `ibm-granite/granite-docling-258M`, que es el checkpoint real y entrenado.

## Enlaces

- Repositorio del fixture: https://huggingface.co/huggingface-mic/granite-docling-258M-mic
- Modelo base: https://huggingface.co/ibm-granite/granite-docling-258M
- Manifiesto del contrato: `integration.json` (en el repositorio)
- Uso en Transformers: `integrations/transformers/usage.md` (en el repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (en el repositorio)
- Procedencia del fixture: `build.json` (en el repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/granite-docling-258M-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
