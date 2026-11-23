# huggingface-mic/Qwen3.5-0.8B-mic

## Resumen

Qwen3.5-0.8B-mic es un artefacto de prueba (fixture) publicado por la organizacion huggingface-mic, derivado del modelo base Qwen/Qwen3.5-0.8B. No se trata de un modelo utilizable para inferencia real: la propia model card lo etiqueta explicitamente como `test-artifact` y lo describe como un fixture de 16,8 millones de parametros que cubre el checkpoint original con pesos aleatorios (semilla 17). Su proposito es servir como banco de pruebas para contratos de integracion de frameworks, no para generar texto ni resolver tareas.

El repositorio contiene pesos "slim" (adelgazados), uso ejecutable y expectativas de framework en un mismo lugar. La arquitectura declarada es `Qwen3_5ForConditionalGeneration`, la misma que el modelo original, pero con la configuracion reducida mediante la regla generica de `sweep.py`: solo 2 capas ocultas en la torre de texto. Los ficheros de procesador (tokenizer, chat template, preprocessor config, video preprocessor config) se copiaron byte a byte desde Qwen/Qwen3.5-0.8B, de modo que el fixture reproduce fielmente la interfaz de entrada del modelo real.

Es relevante ahora porque ejemplifica una practica creciente en el ecosistema: publicar fixtures ligeros que permiten a los mantenedores de librerias (Transformers y similares) validar la carga, el forward, la perdida y los gradientes de arquitecturas multimodales nuevas sin descargar checkpoints de decenas de gigabytes. El fixture paso una puerta de sensibilidad a la entrada: toda perturbacion de las entradas del contrato movio los logits al menos 0,001 (el caso mas debil, `pixel_values:halve`, registro 0,157).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, configuracion reducida a 2 capas de texto) |
| Parametros totales | 16.775.312 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; verificado finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero su contenido no se detalla) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El fixture replica la arquitectura del checkpoint Qwen/Qwen3.5-0.8B, identificada como `Qwen3_5ForConditionalGeneration`, que combina procesamiento de texto y vision (incluye `preprocessor_config.json` y `video_preprocessor_config.json`, lo que sugiere entrada de imagen y video). La configuracion se ha adelgazado con la regla generica de `sweep.py`, dejando `num_hidden_layers` en 2 para la parte de texto. Los nombres de tensores coinciden exactamente con los del checkpoint real, y ambos tienen todos los parametros, lo que permite validar el mapeo de pesos sin ambiguedad.

No hubo entrenamiento. Los pesos son aleatorios, generados con semilla 17, y se aceptaron porque superaron la puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplazo los logits como minimo 0,001. El fixture se guardo en float32, el dtype con el que Qwen/Qwen3.5-0.8B se carga por defecto, y se verifica que es finito en float32, bfloat16 y float16 tanto en forward como en perdida y gradientes. La clave de fixture `bcf77184b0ac` agrupa todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el adelgazamiento.

## Capacidades

- No es un modelo funcional: los pesos son aleatorios, por lo que no genera texto coherente ni resuelve tareas.
- Sirve como fixture de conformidad para validar la carga de `Qwen3_5ForConditionalGeneration` en frameworks.
- Permite comprobar el forward pass, el calculo de perdida y la retropropagacion de gradientes en float32, bfloat16 y float16.
- Reproduce la interfaz de tokenizacion y plantilla de chat del modelo base mediante ficheros copiados byte a byte.
- Cubre rutas de preprocesamiento de imagen y video gracias a los ficheros de preprocesador copiados del original.
- Verifica la sensibilidad a las entradas del contrato (texto y `pixel_values`) mediante la puerta de perturbacion.
- No dispone de tool calling, agentes, razonamiento multilingue ni modo thinking utilizables, al no haber pesos entrenados.

## Casos de uso

- Pruebas de integracion en Transformers: cargar el fixture con `AutoModelForConditionalGeneration` y comprobar que el mapeo de tensores coincide con el checkpoint real, sin descargar los pesos completos.
- Validacion de CI en librerias de inferencia: ejecutar forwards en float32, bfloat16 y float16 en cada pull request para detectar regresiones en el soporte de Qwen3.5.
- Verificacion de gradientes: comprobar que la retropropagacion produce valores finitos en las tres precisiones, como prueba de humo antes de entrenar variantes reales.
- Pruebas de preprocesamiento multimodal: usar los ficheros de preprocesador de imagen y video copiados del original para validar pipelines de entrada sin coste de almacenamiento.
- Validacion de contratos de tokenizador y chat template: comprobar que la plantilla de chat y el tokenizer se comportan igual que en Qwen/Qwen3.5-0.8B.
- Desarrollo de herramientas de introspeccion de modelos: inspeccionar nombres de tensores y shapes en un artefacto de 0,2 GB en lugar de un checkpoint completo.
- Reproducibilidad de fixtures: reconstruir el artefacto con `python example/build_fixtures.py --fixture Qwen3.5-0.8B-mic` y comparar hashes registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, no procede evaluar calidad de generacion, MMLU, HumanEval ni metricas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 16,8 M de parametros (unos 67 MB de pesos), mas overhead de activaciones y buffers del framework.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el fixture esta pensado para ejecutarse en CPU y en GPUs de gama baja.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) y en entornos CI sin acelerador.
- Opciones de despliegue: Transformers es el framework de referencia segun la model card; no se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo utilizable no tiene sentido desplegarlo en produccion.
- Latencia y throughput: no disponibles; al tener solo 2 capas de texto y pesos aleatorios, los tiempos de forward seran del orden de milisegundos en CPU, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-mic | 16,8 M | no disponible | Fixture de conformidad para frameworks | no disponible | Hugging Face (2459 descargas) |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion proporcionada | no disponible | Modelo base multimodal utilizable | no disponible | Hugging Face |
| Otros fixtures de huggingface-mic | no disponible | no disponible | Artefactos de prueba por arquitectura | no disponible | Hugging Face |

La comparativa directa con modelos de la misma categoria (0,8 B parametros utilizables) no es significativa: el fixture no compite en calidad de generacion, sino que cubre la misma interfaz que el modelo base con una huella de 0,2 GB frente al checkpoint completo.

## Limitaciones y advertencias

- Pesos aleatorios: cualquier salida de texto sera incoherente; no debe usarse para inferencia, evaluacion de calidad ni demostraciones.
- Etiquetado como `test-artifact` para excluirlo de busquedas de modelos candidatos; integrarlo en produccion seria un error de seleccion.
- La configuracion esta adelgazada a 2 capas de texto, por lo que no reproduce el comportamiento numerico del checkpoint real, solo la interfaz y los nombres de tensores.
- Licencia no disponible en la informacion proporcionada; el fichero LICENSE se copia del modelo base, pero su texto no se detalla, asi que el uso comercial queda sin clarificar.
- Idiomas y contexto no documentados; no hay garantias de cobertura linguistica.
- Sesgos y alucinaciones: no aplica evaluarlos con rigor, pero al no haber entrenamiento no se puede caracterizar ningun sesgo aprendido.
- La clave de fixture agrupa checkpoints con procesadores identicos y config equivalente tras el adelgazamiento; cambios futuros en Qwen/Qwen3.5-0.8B pueden invalidar esa equivalencia.
- Depende de la herramienta `build_fixtures.py` y del repositorio transformers-mic para reproducirse; sin esos recursos el artefacto pierde trazabilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Manifest del contrato: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/Qwen3.5-0.8B-mic/blob/main/build.json
- Como se adelgazo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/Qwen3.5-0.8B-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
