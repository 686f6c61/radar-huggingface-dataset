# huggingface-mic/blip-image-captioning-base-mic

## Resumen

`blip-image-captioning-base-mic` es un artefacto de prueba publicado por el usuario `huggingface-mic` en Hugging Face. No es un modelo entrenado ni utilizable en producción: se trata de un *fixture* (modelo reducido artificialmente) derivado de `Salesforce/blip-image-captioning-base`, creado para verificar contratos de integración con frameworks (principalmente Transformers) sin necesidad de descargar ni ejecutar el checkpoint completo. El autor lo etiqueta explícitamente con `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

El modelo conserva la arquitectura `BlipForConditionalGeneration` pero con una configuración drásticamente reducida: 2 capas en el codificador de texto y 2 capas en el codificador visual, lo que resulta en 2.275.004 parámetros totales (frente a los ~224M del BLIP base original). Los pesos son aleatorios (semilla 17) y no han sido entrenados; únicamente pasaron una puerta de sensibilidad a la entrada que garantiza que las perturbaciones en las entradas mueven los logits al menos 0,001.

Su relevancia es puramente de ingeniería de software: sirve para validar pipelines de carga, tokenización, preprocesado de imagen y ejecución de inferencia en CI/CD con un coste mínimo de descarga y cómputo. No debe confundirse con un modelo de captioning funcional: las descripciones que genere serán ruido sin significado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLIP (`BlipForConditionalGeneration`): vision transformer + text decoder causal, configuracion reducida |
| Parametros totales | 2.275.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (config reducida; el BLIP base original usa 512 tokens de texto) |
| Tipos de cuantizacion | no disponible; pesos guardados en float32 |
| Idiomas soportados | no disponible (pesos aleatorios, sin capacidad linguistica real) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura BLIP de Salesforce para generación de leyendas de imagen: un codificador visual tipo ViT y un decodificador de texto causal con atención cruzada, empaquetados en `BlipForConditionalGeneration`. La diferencia clave es la configuración reducida: `text num_hidden_layers = 2` y `vision num_hidden_layers = 2`, aplicada mediante la regla genérica de reducción de `sweep.py` del repositorio `transformers-mic`.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se validaron con una puerta de sensibilidad a la entrada: cada perturbación de las entradas del contrato mueve los logits al menos 0,001 (el caso más débil, `pixel_values:halve`, produce 0,00168). Los ficheros de procesador (`preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`, `vocab.txt`) se copiaron byte a byte desde `Salesforce/blip-image-captioning-base`, de modo que el pipeline de preprocesado y tokenización es idéntico al del modelo real. Los nombres de tensores coinciden con los del checkpoint original y el modelo es finito en float32, bfloat16 y float16 (forward, pérdida y gradientes). La clave de fixture `10d8af92dfb0` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos y cuya configuración coincide tras la reducción.

## Capacidades

- Carga y ejecución del pipeline de Transformers para `BlipForConditionalGeneration` con la misma interfaz que el modelo base.
- Preprocesado de imagen y tokenización idénticos a `Salesforce/blip-image-captioning-base` (ficheros copiados byte a byte).
- Ejecución de forward, cálculo de pérdida y retropropagación en float32, bfloat16 y float16.
- Verificación de contratos de integración: manifiesto `integration.json`, expectativas de framework y uso documentado.
- No genera leyendas de imagen con sentido: los pesos son aleatorios.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en CI/CD: ejecutar el pipeline completo de BLIP en cada commit con un modelo de 2,3M parámetros en lugar del checkpoint real, reduciendo tiempo de descarga y cómputo.
- Validación de contratos de framework: comprobar que una versión de Transformers carga, preprocesa y ejecuta `BlipForConditionalGeneration` con los nombres de tensor y ficheros de procesador esperados.
- Desarrollo de wrappers y SDKs: iterar sobre la API de captioning (entrada de imagen, salida de texto) sin depender de pesos entrenados ni de licencias del modelo original.
- Test de regresión de preprocesado: verificar que los cambios en el tokenizador o en `preprocessor_config.json` no rompen el pipeline, ya que esos ficheros son idénticos a los del modelo real.
- Pruebas de cuantización y dtypes: validar que el modelo es finito en float32, bfloat16 y float16 antes de aplicar las mismas comprobaciones al checkpoint completo.
- Docencia y demos de arquitectura: inspeccionar la estructura de BLIP (codificador visual, decodificador causal, atención cruzada) con un modelo pequeño que cabe en cualquier entorno.
- Validación de puertas de sensibilidad: reproducir el gate de perturbación de entradas para comprobar que un fixture responde a cambios en `pixel_values` e `input_ids`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (BLEU, CIDEr, METEOR) carecería de significado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (2,3M parámetros × 4 bytes ≈ 9 MB de pesos, más activaciones y buffers del pipeline).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090) y en entornos sin GPU.
- Opciones de despliegue: Transformers (`AutoModelForVision2Seq` / `BlipForConditionalGeneration`), y en general cualquier runtime que cargue safetensors. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas, la latencia será de milisegundos en GPU y de decenas de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `huggingface-mic/blip-image-captioning-base-mic` | 2,3M | no disponible | Fixture de test | no disponible | Hugging Face |
| `Salesforce/blip-image-captioning-base` | ~224M | 512 tokens (texto) | Captioning real | BSD-3-Clause (según el modelo original) | Hugging Face |
| `Salesforce/blip-image-captioning-large` | ~470M | 512 tokens (texto) | Captioning real | BSD-3-Clause (según el modelo original) | Hugging Face |

La comparación relevante es únicamente estructural: el fixture comparte arquitectura, nombres de tensor y ficheros de procesador con `Salesforce/blip-image-captioning-base`, pero no su capacidad. Frente a `blip-image-captioning-large`, la diferencia es de escala y calidad de captioning, no aplicable aquí porque el fixture no genera texto con sentido.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios y las salidas no tienen significado.
- Etiquetado como `test-artifact` por el propio autor para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no especificada en la información disponible: verificar los términos antes de cualquier uso, aunque sea de test.
- Sin datos de idiomas soportados; no aplica al no tener capacidad lingüística real.
- Sin benchmarks publicados; no es posible evaluar calidad.
- El repositorio ocupa 0,0 GB según la información disponible, coherente con un fixture de 2,3M parámetros, pero conviene comprobar los ficheros reales antes de integrarlo en un pipeline.
- Riesgo de confusión: el nombre incluye `blip-image-captioning-base`, lo que puede llevar a error si se selecciona automáticamente por nombre en lugar de por etiqueta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface-mic/blip-image-captioning-base-mic
- Modelo base: https://huggingface.co/Salesforce/blip-image-captioning-base
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/blip-image-captioning-base-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/blip-image-captioning-base-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/blip-image-captioning-base-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/blip-image-captioning-base-mic/blob/main/build.json
- Cómo se redujo el fixture: https://huggingface-mic-mic-coverage.static.hf.space/shrink/blip-image-captioning-base-mic.html
- Repositorio `transformers-mic`: https://github.com/huggingface/transformers-mic
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción (`sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
