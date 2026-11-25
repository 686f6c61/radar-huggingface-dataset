# huggingface-mic/Qwen3.8-Flash-Next-mic

## Resumen

Qwen3.8-Flash-Next-mic es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable para inferencia real: se trata de un *fixture* (modelo reducido de pruebas) construido para verificar la integración de la arquitectura `Qwen4ExpForConditionalGeneration` con la librería Transformers. El autor lo etiqueta explícitamente como `test-artifact` y advierte que "no es un modelo usable".

El repositorio deriva del checkpoint `Qwen/Qwen3.8-Flash-Next`, del que hereda la arquitectura multimodal y los ficheros de procesador (tokenizer, chat template, preprocessor de imagen y vídeo) copiados byte a byte. Los pesos, sin embargo, son aleatorios (semilla 17) y el modelo se ha "encogido" reduciendo el número de capas del codificador de texto a 4, lo que da como resultado 33.880.163 parámetros totales según los safetensors (la model card menciona 353,9M, cifra que no coincide con el dato real del repo).

Su relevancia es, por tanto, exclusivamente para desarrolladores que trabajen en el ecosistema de testing de Transformers: permite validar pipelines de carga, contratos de entrada/salida y pruebas de sensibilidad de logits sin descargar el modelo completo. No sirve para generación de texto, razonamiento ni ninguna tarea de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (transformer multimodal, encoder de texto reducido a 4 capas) |
| Parametros totales | 33.880.163 (safetensors); la model card indica 353,9M, dato no coincidente |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (existe fichero LICENSE copiado del modelo base, contenido no especificado) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen4ExpForConditionalGeneration`, una clase multimodal de generación condicional que combina procesamiento de texto e imagen/vídeo (el repo incluye `preprocessor_config.json` y `video_preprocessor_config.json`). Para el fixture se ha aplicado una regla genérica de reducción (`sweep.py`) que deja el codificador de texto en 4 capas (`text num_hidden_layers 4`), manteniendo los mismos nombres de tensores que el checkpoint real.

No hay entrenamiento: los pesos son aleatorios con semilla 17. El autor justifica su publicación porque superaron una "puerta de sensibilidad de entrada": cada perturbación de las entradas del contrato movía los logits al menos 0,001 (el caso más débil, `pixel_values:roll_batch`, 0,0013). Los pesos son finitos en float32, bfloat16 y float16 (forward, loss y gradientes). Los ficheros de procesador se copiaron sin modificar desde `Qwen/Qwen3.8-Flash-Next`.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen salidas con significado.
- Sirve como fixture de integración para validar la carga del modelo en Transformers.
- Permite comprobar el contrato de entradas/salidas (texto, imagen, vídeo) definido en `integration.json`.
- Valida la sensibilidad de logits ante perturbaciones de entrada (prueba de gradiente).
- Comprueba la estabilidad numérica en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, razonamiento ni capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en Transformers: cargar el fixture para verificar que la clase `Qwen4ExpForConditionalGeneration` se instancia y ejecuta correctamente sin descargar el checkpoint completo.
- Test de contrato de procesadores: validar que el tokenizer, el chat template y los preprocesadores de imagen/vídeo se cargan y producen las entradas esperadas.
- Pruebas de regresión de la librería: comprobar que cambios en Transformers no rompen la carga de arquitecturas multimodales Qwen4Exp.
- Validación de estabilidad numérica: ejecutar forward, loss y backward en float32, bfloat16 y float16 para detectar NaNs o infs en integraciones continuas.
- Test de sensibilidad de gradientes: usar la puerta de sensibilidad (perturbaciones de entrada que mueven los logits) como test automatizado en CI.
- Desarrollo de herramientas de inspección de pesos: al compartir nombres de tensores con el checkpoint real, sirve para probar utilidades de análisis o conversión de formatos sin manejar pesos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no tiene sentido evaluar su rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (33,9M de parámetros ≈ 135 MB de pesos, más overhead de activaciones y procesadores); el repo completo ocupa 5,9 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente; también funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (uso previsto); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (irrelevantes para un fixture).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-mic | 33,9M (fixture) | no disponible | Test de integracion | no disponible | Hugging Face |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | Modelo multimodal real | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable | no disponible | Test de integracion | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas para establecer una comparativa funcional con alternativas reales.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y las salidas carecen de significado.
- La model card indica 353,9M de parámetros, mientras que los safetensors reportan 33,9M; existe una discrepancia no aclarada.
- No se especifican licencia ni condiciones de uso comercial; el fichero LICENSE copiado del modelo base no se detalla en la información disponible.
- No se documentan idiomas soportados ni longitud de contexto.
- No debe incluirse en búsquedas de modelos candidatos: el autor lo etiqueta como `test-artifact` precisamente para excluirlo.
- Riesgo de confusión: el nombre sugiere un modelo Qwen real, pero es un fixture de pruebas.
- No apto para producción, evaluación de calidad ni generación de contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.8-Flash-Next-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de construcción de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción (sweep.py): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.8-Flash-Next-mic.html
