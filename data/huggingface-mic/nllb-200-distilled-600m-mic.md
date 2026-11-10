# huggingface-mic/nllb-200-distilled-600M-mic

## Resumen

`huggingface-mic/nllb-200-distilled-600M-mic` es un artefacto de prueba (fixture) publicado por el usuario `huggingface-mic`, no un modelo entrenado utilizable. Se construye a partir de la arquitectura de `facebook/nllb-200-distilled-600M` (familia NLLB-200 de traducción automática multilingüe) pero con una configuración reducida y pesos aleatorios. Su propósito es servir como banco de pruebas para el proyecto `transformers-mic`, que valida expectativas de integración de frameworks (carga, tokenización, forward, backward) sin necesidad de descargar el checkpoint real de 600M de parámetros.

El repositorio contiene 16.564.864 parámetros reales según el fichero safetensors, frente a los aproximadamente 600 millones del modelo base. La reducción se logra rebajando el número de capas del encoder y del decoder a 2 cada uno, manteniendo la clase `M2M100ForConditionalGeneration` y los nombres de tensor exactos del checkpoint original. Los ficheros de procesador (tokenizer SentencePiece, `generation_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte del modelo base.

La relevancia de este artefacto es exclusivamente de ingeniería: permite a desarrolladores del ecosistema Transformers verificar contratos de integración, comportamiento de carga en distintas precisiones (float32, bfloat16, float16) y estabilidad numérica de gradientes con un repositorio de 0,2 GB en lugar de varios gigabytes. Está etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos. No debe emplearse para traducción, generación de texto ni ninguna tarea productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M100ForConditionalGeneration (transformer encoder-decoder), config reducida a 2 capas de encoder y 2 de decoder |
| Parametros totales | 16.564.864 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de la config del modelo base, no documentada en el fixture) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; el modelo es finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el tokenizer NLLB-200 cubre 200 idiomas, pero el fixture no traduce) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es una instancia de `M2M100ForConditionalGeneration`, la arquitectura encoder-decoder de traducción multilingüe empleada por la familia NLLB-200 de Meta. La configuración del fixture reduce `encoder_layers` y `decoder_layers` a 2 cada uno mediante la regla genérica implementada en `sweep.py` del repositorio `transformers-mic`. Los nombres de tensor coinciden exactamente con los del checkpoint real `facebook/nllb-200-distilled-600M`, de modo que las herramientas que esperan esa estructura pueden operar sin adaptaciones.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se generaron con `build_fixtures.py`. El autor documenta un "input-sensitivity gate": cada perturbación de las entradas del contrato mueve los logits al menos 0,001 (la más débil, `input_ids:roll_batch`, produce 0,0799), lo que justifica no entrenar. El fixture se valida como finito en forward, loss y gradientes en float32, bfloat16 y float16. Los ficheros de procesador se copian byte a byte del modelo base, garantizando que la tokenización y la generación se comporten igual que con el checkpoint real.

## Capacidades

- No traduce ni genera texto coherente: los pesos son aleatorios y el modelo no ha sido entrenado.
- Sirve como fixture de integración para validar la carga de `M2M100ForConditionalGeneration` en Transformers.
- Permite comprobar la estabilidad numérica (finitud de logits, loss y gradientes) en float32, bfloat16 y float16.
- Verifica que los ficheros de procesador (SentencePiece, tokenizer, generation config) se cargan correctamente.
- Comprueba la compatibilidad de nombres de tensor con el checkpoint real de NLLB-200 distilled 600M.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingües efectivas pese a heredar el tokenizer de 200 idiomas.

## Casos de uso

- Pruebas de integración en Transformers: cargar el modelo con `AutoModelForSeq2SeqLM` y verificar que la clase `M2M100ForConditionalGeneration` se instancia con los tensores esperados, sin descargar el checkpoint de 600M.
- Validación de pipelines de CI: ejecutar tests de forward y backward en float32, bfloat16 y float16 sobre un repositorio de 0,2 GB, reduciendo tiempos y ancho de banda en runners.
- Verificación de contratos de tokenizer: comprobar que los ficheros copiados (`sentencepiece.bpe.model`, `tokenizer.json`) producen los mismos `input_ids` que el modelo base para un conjunto de frases de prueba.
- Desarrollo de herramientas de inspección de modelos: usar los nombres de tensor idénticos al checkpoint real para probar utilidades de análisis de pesos, mapas de capas o scripts de conversión.
- Test de compatibilidad de frameworks alternativos: validar que una implementación propia (por ejemplo, en JAX o PyTorch nativo) reproduce la estructura de `M2M100ForConditionalGeneration` con un modelo pequeño.
- Benchmarking de infraestructura de carga: medir tiempos de descarga, carga y primera inferencia en distintos entornos (CPU, GPU consumer, contenedores) sin el coste del modelo completo.
- Reproducción de fallos: aislar bugs de integración con un fixture determinista (semilla 17) y pesos fijos, facilitando la depuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, cualquier métrica de calidad (BLEU, MMLU, etc.) carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (16,6M parámetros × 4 bytes ≈ 66 MB de pesos, más activaciones y overhead del runtime); en float16 o bfloat16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; también funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: Transformers con PyTorch (principal caso de uso), potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es el propósito del fixture. vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño, la inferencia en CPU debería completarse en milisegundos, pero al ser pesos aleatorios la salida no es significativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/nllb-200-distilled-600M-mic | 16,6M | no disponible | Fixture de integración (pesos aleatorios) | no disponible | Hugging Face |
| facebook/nllb-200-distilled-600M | ~600M | 1024 tokens (documentado en el modelo base) | Traducción multilingüe (200 idiomas) | CC-BY-NC 4.0 (modelo base) | Hugging Face |
| facebook/m2m100_418M | ~418M | 1024 tokens | Traducción multilingüe (100 idiomas) | MIT (modelo base) | Hugging Face |

La comparación con `facebook/nllb-200-distilled-600M` es directa en arquitectura y tokenizer, pero no en función: el fixture no traduce. Frente a `m2m100_418M`, comparte la familia M2M100 pero con un propósito completamente distinto.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no produce traducciones ni texto coherente; cualquier uso generativo es inválido.
- Etiquetado explícitamente como `test-artifact`: no debe incluirse en catálogos de modelos candidatos ni en evaluaciones de calidad.
- Licencia no disponible: no se puede asumir uso comercial; además, el modelo base `facebook/nllb-200-distilled-600M` tiene licencia CC-BY-NC 4.0, lo que restringe el uso comercial de derivados.
- Idiomas no documentados en el fixture: aunque el tokenizer cubre 200 idiomas, el modelo no tiene capacidad de traducción real.
- Longitud de contexto no documentada en la ficha del fixture; depende de la configuración heredada del modelo base.
- Riesgo de confusión: el nombre puede llevar a pensar que es un modelo funcional; el autor lo mitiga con la etiqueta `test-artifact` y el aviso en la model card.
- No apto para producción: no debe desplegarse en sistemas de atención al cliente, pipelines de traducción ni agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/nllb-200-distilled-600M-mic
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Documentación de uso en Transformers: https://huggingface.co/huggingface-mic/nllb-200-distilled-600M-mic/blob/main/integrations/transformers/usage.md
- Expectativas del framework: https://huggingface.co/huggingface-mic/nllb-200-distilled-600M-mic/tree/main/integrations/transformers/expectations
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/nllb-200-distilled-600M-mic/blob/main/integration.json
- Procedencia del fixture: https://huggingface.co/huggingface-mic/nllb-200-distilled-600M-mic/blob/main/build.json
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/nllb-200-distilled-600M-mic.html
- Repositorio transformers-mic (script `sweep.py`): https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Repositorio transformers-mic (script `build_fixtures.py`): https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
