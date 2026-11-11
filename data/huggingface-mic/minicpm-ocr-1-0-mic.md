# huggingface-mic/MiniCPM-OCR-1.0-mic

## Resumen

MiniCPM-OCR-1.0-mic es un artefacto de prueba (fixture) publicado por el usuario huggingface-mic, derivado del modelo openbmb/MiniCPM-OCR-1.0. No se trata de un modelo funcional entrenado, sino de una version reducida artificialmente ("slim fixture") que conserva la misma arquitectura y los mismos nombres de tensores que el checkpoint original, pero con pesos aleatorios (semilla 17) y una configuracion mucho mas pequena. Su proposito es servir como banco de pruebas para validar contratos de integracion con frameworks (especialmente Transformers) sin necesidad de descargar ni ejecutar el modelo completo.

El modelo base, MiniCPM-OCR-1.0, es un modelo de comprension de documentos y OCR desarrollado por OpenBMB, con arquitectura multimodal `MiniCPMOcrForConditionalGeneration` que combina un codificador visual con un decodificador de lenguaje. La version aqui descrita reduce el numero de capas del componente de texto y del componente visual a 2 cada uno, resultando en 16.714.192 parametros totales y un repositorio de aproximadamente 0,1 GB.

Es relevante para desarrolladores que trabajan en el ecosistema de Transformers y necesitan verificar la compatibilidad de pipelines, procesadores y plantillas de chat frente a la familia MiniCPM-OCR sin incurrir en los requisitos de hardware del modelo real. El autor lo etiqueta explicitamente como `test-artifact` para excluirlo de busquedas de modelos candidatos a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPMOcrForConditionalGeneration (multimodal, vision + lenguaje) |
| Parametros totales | 16.714.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea la clase `MiniCPMOcrForConditionalGeneration`, una arquitectura multimodal que integra un codificador visual con un decodificador de lenguaje para tareas de comprension de documentos. En esta version fixture, la configuracion se ha reducido mediante la regla generica de `sweep.py`: el componente de texto queda con 2 capas (`num_hidden_layers` = 2) y el componente visual tambien con 2 capas. Los ficheros de procesador (`chat_template.jinja`, `generation_config.json`, `preprocessor_config.json`, `processor_config.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde openbmb/MiniCPM-OCR-1.0, de modo que el comportamiento de tokenizacion y preprocesado es identico al del modelo original.

No hubo entrenamiento: los pesos son aleatorios con semilla 17. Para validar que el fixture es funcional se aplico una puerta de sensibilidad a la entrada, comprobando que cada perturbacion de las entradas del contrato desplaza los logits al menos 0,001 (la mas debil, `pixel_values:halve`, produce 0,16). Los tensores mantienen los mismos nombres que el checkpoint real y el modelo es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes. El fixture cubre todos los checkpoints cuyos ficheros de procesador son identicos byte a byte y cuya config coincide tras el proceso de reduccion (clave de fixture `abe31a9f2ff4`).

## Capacidades

- No es un modelo utilizable: los pesos son aleatorios y no producen salidas con sentido.
- Conserva la interfaz de `MiniCPMOcrForConditionalGeneration`, por lo que permite probar la carga del modelo, el forward pass y la generacion a nivel de contrato.
- Mantiene los ficheros de procesador del modelo original, habilitando la validacion de tokenizacion, plantillas de chat y preprocesado de imagenes.
- Sirve para verificar la sensibilidad de las entradas (perturbaciones en `pixel_values` y entradas de texto).
- Soporta ejecucion en float32, bfloat16 y float16 con gradientes finitos.
- No dispone de capacidades reales de OCR, razonamiento, codigo ni tool calling, al carecer de entrenamiento.

## Casos de uso

- Pruebas de integracion en Transformers: permite validar que la clase `MiniCPMOcrForConditionalGeneration` se instancia, carga y ejecuta correctamente en un pipeline de CI sin descargar el checkpoint completo de OpenBMB.
- Validacion de contratos de framework: el repositorio incluye `integration.json`, `integrations/transformers/usage.md` e `integrations/transformers/expectations`, de modo que se pueden comprobar las expectativas de API (entradas, salidas, formas de tensores) frente a un modelo ligero.
- Desarrollo de procesadores y plantillas de chat: al copiar byte a byte los ficheros de procesador del modelo original, sirve para probar cambios en el codigo de preprocesado sin riesgo de divergencia con el modelo real.
- Test de regresion de tokenizadores: permite verificar que actualizaciones en la libreria de tokenizacion no rompen la compatibilidad con la familia MiniCPM-OCR.
- Benchmarking de infraestructura de pruebas: con 0,1 GB y 16,7 M de parametros, se puede desplegar en cualquier entorno de CI, contenedores ligeros o maquinas sin GPU.
- Verificacion de serializacion y carga de safetensors: util para comprobar que las herramientas de conversion, cuantizacion o empaquetado manejan correctamente los nombres de tensores y el dtype bfloat16.
- Pruebas de sensibilidad y gradientes: valida que las perturbaciones de entrada producen cambios medibles en los logits, util para testear frameworks de interpretabilidad o de auditoria de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un fixture con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K, OCR) carece de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (16,7 M de parametros, aproximadamente 33 MB de pesos mas overhead de activaciones y buffers del procesador visual).
- GPU recomendadas: cualquier GPU consumer o integrada; no requiere aceleracion dedicada. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers (carga directa desde safetensors), y en general cualquier runtime que soporte la arquitectura `MiniCPMOcrForConditionalGeneration`. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles; al ser un modelo diminuto con pesos aleatorios, las mediciones no serian representativas del modelo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-mic (este) | 16,7 M | no disponible | Fixture de pruebas | no disponible | Hugging Face |
| openbmb/MiniCPM-OCR-1.0 | no disponible | no disponible | OCR y comprension de documentos | no disponible | Hugging Face |
| Otros modelos de la familia MiniCPM | no disponible | no disponible | Proposito general / multimodal | no disponible | Hugging Face |

La comparativa con alternativas de la misma categoria (modelos OCR multimodales) no esta disponible en la informacion proporcionada. El unico comparable directo documentado es el modelo base openbmb/MiniCPM-OCR-1.0, del que este fixture deriva y cuyas dimensiones completas no se detallan en la model card.

## Limitaciones y advertencias

- No es un modelo utilizable en produccion: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` por el autor, precisamente para excluirlo de busquedas de modelos candidatos.
- No se ha realizado entrenamiento ni ajuste fino; no hay RLHF, DPO ni datos de entrenamiento asociados.
- La licencia no esta disponible, lo que impide determinar condiciones de uso comercial.
- Los idiomas soportados no estan documentados.
- La longitud de contexto no esta documentada y, en cualquier caso, seria irrelevante para un fixture.
- No debe usarse para evaluar calidad de OCR, razonamiento ni ninguna tarea downstream.
- Aunque comparte nombres de tensores y ficheros de procesador con el modelo real, la configuracion reducida (2 capas por componente) implica que las formas de las activaciones intermedias difieren del checkpoint original.
- Para reconstruir el resto de ficheros del fixture es necesario ejecutar `python example/build_fixtures.py --fixture MiniCPM-OCR-1.0-mic`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/MiniCPM-OCR-1.0-mic/blob/main/build.json
- Explicacion del proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/MiniCPM-OCR-1.0-mic.html
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion de fixtures: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
