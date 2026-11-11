# huggingface-mic/tibetan-ocr-mic

## Resumen

`huggingface-mic/tibetan-ocr-mic` es un artefacto de prueba publicado por la organización `huggingface-mic`, no un modelo utilizable en producción. Se trata de un *fixture* de 535.680 parámetros construido a partir de `BDRC/tibetan-ocr` mediante una reducción de configuración (2 capas en el codificador de texto y 2 en el de visión) que conserva la arquitectura `PaddleOCRVLForConditionalGeneration` y los nombres de tensores del checkpoint original. Su propósito es servir como contrato ejecutable para validar integraciones de frameworks (en concreto Transformers) sin descargar los pesos completos del modelo real.

El modelo subyacente que representa es un OCR especializado en tibetano basado en PaddleOCR-VL, una arquitectura vision-language orientada a la transcripción de documentos. El fixture copia byte a byte los ficheros de procesador del modelo original (`chat_template.jinja`, `tokenizer.json`, `tokenizer.model`, `processor_config.json`, `generation_config.json`, `dry_logits_processor.py`), de modo que las expectativas de tokenización y preprocesado coinciden exactamente con las del checkpoint de referencia.

Es relevante ahora porque la comunidad de Transformers lo emplea para verificar que la integración de PaddleOCR-VL funciona correctamente en tests automatizados: pesos aleatorios con semilla 17 que superan una puerta de sensibilidad a entradas (toda perturbación mueve los logits al menos 0,001) y son finitos en float32, bfloat16 y float16. No debe confundirse con un modelo de OCR funcional: las etiquetas `mic` y `test-artifact` lo excluyen explícitamente de las búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCRVLForConditionalGeneration (vision-language transformer, PaddleOCR-VL) |
| Parametros totales | 535.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el modelo de referencia está orientado a tibetano) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture replica la arquitectura `PaddleOCRVLForConditionalGeneration`, un modelo vision-language de PaddleOCR-VL compuesto por un codificador de visión y un decodificador de texto. La configuración se ha reducido mediante la regla genérica de `sweep.py` del repositorio `transformers-mic`: 2 capas ocultas en el módulo de texto y 2 en el de visión. Los ficheros de procesador se copian sin modificar desde `BDRC/tibetan-ocr`, garantizando que el pipeline de preprocesado (tokenizador, plantilla de chat, procesador de imágenes) sea idéntico al del modelo real.

No hubo entrenamiento. Los pesos son aleatorios con semilla 17 y se aceptaron tras superar una puerta de sensibilidad a las entradas: cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (la más débil, `pixel_values:halve`, con 0,164). El artefacto se guarda en bfloat16, el dtype con el que carga por defecto `BDRC/tibetan-ocr`, y se verifica que forward, loss y gradientes son finitos en float32, bfloat16 y float16. La clave de fixture `dd50d80ac1a7` agrupa todos los checkpoints cuyos ficheros de procesador son idénticos byte a byte y cuya configuración coincide tras la reducción.

## Capacidades

- No es un modelo funcional: no realiza OCR, generación de texto ni ninguna tarea real.
- Conserva la interfaz de `PaddleOCRVLForConditionalGeneration`, por lo que puede cargarse con Transformers y ejecutar forward passes.
- Los ficheros de procesador (tokenizador, plantilla de chat, configuración de generación) son idénticos a los de `BDRC/tibetan-ocr`, lo que permite validar el pipeline de preprocesado.
- Admite ejecución en float32, bfloat16 y float16 con resultados finitos en forward, loss y gradientes.
- Sirve como contrato de integración: expone `integration.json`, expectativas de Transformers y manifiesto de procedencia (`build.json`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües reales.

## Casos de uso

- Pruebas de integración en Transformers: el fixture permite ejecutar la suite de tests de `PaddleOCRVLForConditionalGeneration` sin descargar los pesos completos de `BDRC/tibetan-ocr`, reduciendo el tiempo de CI y el consumo de almacenamiento.
- Validación de contratos de framework: los ficheros `integration.json` e `integrations/transformers/expectations` definen las entradas y salidas esperadas, de modo que un cambio incompatible en el framework rompe el test de forma determinista.
- Verificación de preprocesado: al copiar byte a byte el tokenizador y el procesador de imágenes del modelo real, se puede comprobar que la tokenización y el preprocesado de documentos tibetanos producen las mismas secuencias que el checkpoint de referencia.
- Tests de precisión numérica: el fixture es finito en float32, bfloat16 y float16, lo que permite validar rutas de mixed precision y autocast en el framework sin depender de pesos entrenados.
- Desarrollo de nuevas reglas de reducción: el script `sweep.py` y `build_fixtures.py` documentan cómo se generó el fixture, sirviendo de plantilla para crear fixtures de otros modelos de la misma familia.
- Reproducibilidad de artefactos: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de ficheros, permitiendo reconstruir el fixture de forma verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios, carece de sentido evaluar su precisión en tareas de OCR o generación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB incluso en float32 (535.680 parámetros); en la práctica, unos pocos MB en bfloat16.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU para tests de integración.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en entornos sin GPU.
- Opciones de despliegue: carga directa con Transformers (`PaddleOCRVLForConditionalGeneration`); no está pensado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo funcional.
- Latencia y throughput: no disponibles; al ser un fixture de test, el rendimiento no es un objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/tibetan-ocr-mic | 535.680 | no disponible | Fixture de test para integración de PaddleOCR-VL | no disponible | Hugging Face |
| BDRC/tibetan-ocr | no disponible | no disponible | OCR real de tibetano (PaddleOCR-VL) | no disponible | Hugging Face |
| huggingface-mic/tibetan-ocr-mic (otros fixtures de la familia MIC) | variable (reducidos) | no disponible | Fixtures de test de otros modelos | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo utilizable: los pesos son aleatorios (semilla 17) y no producen OCR ni texto coherente.
- Etiquetado explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- La licencia no está declarada en la información disponible, por lo que no puede confirmarse su uso comercial.
- El tamaño del repositorio figura como 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que el reporte es inexacto; conviene verificar los ficheros antes de usarlo.
- La model card contiene secciones duplicadas y repetidas, lo que dificulta extraer información adicional fiable.
- Al ser un fixture reducido (2 capas de texto y 2 de visión), no reproduce el comportamiento numérico del modelo completo más allá de la sensibilidad a entradas.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque el modelo no genera contenido real.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/tibetan-ocr-mic
- Modelo base: https://huggingface.co/BDRC/tibetan-ocr
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/tibetan-ocr-mic.html
