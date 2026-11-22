# huggingface-mic/got_ocr2-mic

## Resumen

`huggingface-mic/got_ocr2-mic` no es un modelo funcional, sino un artefacto de prueba (test artifact) generado por el proyecto `transformers-mic` de Hugging Face para validar la integración de frameworks con el modelo base `stepfun-ai/GOT-OCR-2.0-hf`. Se trata de un "fixture" reducido de 13,0 millones de parámetros que replica la arquitectura `GotOcr2ForConditionalGeneration` del checkpoint original, pero con solo 2 capas en el codificador visual y 2 capas en el decodificador de texto, y con pesos aleatorios (semilla 17) que no han sido entrenados para ninguna tarea real.

El propósito del repositorio es triple: servir como peso "slim" para pruebas de integración, incluir la documentación de uso ejecutable para Transformers y proporcionar el directorio de expectativas del framework. Los ficheros de procesador (tokenizer, preprocessor, generation config, special tokens) se copian byte a byte desde el modelo original, de modo que el pipeline de preprocesado es idéntico al real, mientras que los tensores de pesos mantienen los mismos nombres que el checkpoint completo pero con dimensiones reducidas.

Es relevante ahora porque permite a desarrolladores e investigadores probar pipelines de OCR, integraciones con Transformers y flujos de CI/CD sin necesidad de descargar ni ejecutar el modelo GOT-OCR-2.0 completo (que ronda los 580 millones de parámetros). Sin embargo, no debe confundirse con un modelo usable: la propia model card lo etiqueta explícitamente como `test-artifact` para excluirlo de las búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GotOcr2ForConditionalGeneration (vision encoder + text decoder, transformer) |
| Parametros totales | 13.027.200 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GOT-OCR2, un transformer multimodal compuesto por un codificador visual y un decodificador de texto, empaquetado en la clase `GotOcr2ForConditionalGeneration` de Transformers. En este fixture, la configuración se ha reducido mediante la regla genérica de `sweep.py`: el codificador visual conserva 2 capas (`vision num_hidden_layers 2`) y el decodificador de texto otras 2 (`text num_hidden_layers 2`). Los nombres de los tensores coinciden exactamente con los del checkpoint real, lo que permite validar la carga de pesos y el mapeo de parámetros sin ambigüedad.

No ha habido entrenamiento real. Los pesos se inicializan aleatoriamente con semilla 17 y se validan mediante un "input-sensitivity gate": cada perturbación de las entradas del contrato debe mover los logits al menos 0,001 (la perturbación más débil, `pixel_values:halve`, los mueve 0,189). Los ficheros de procesador (`generation_config.json`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer.json`, `tokenizer_config.json`) se copian byte a byte desde `stepfun-ai/GOT-OCR-2.0-hf`, de modo que el preprocesado de imágenes y la tokenización son idénticos al modelo original. El artefacto se guarda en bfloat16, el dtype por defecto del checkpoint base, y se verifica que forward, loss y gradientes son finitos en float32, bfloat16 y float16.

## Capacidades

- No es un modelo usable: no genera texto, no realiza OCR ni razonamiento. Es un fixture de prueba.
- Replica la interfaz de `GotOcr2ForConditionalGeneration`, por lo que permite validar la carga del modelo, el mapeo de tensores y el flujo de forward pass en Transformers.
- Conserva el pipeline de preprocesado del modelo original (tokenizer y preprocessor copiados byte a byte), útil para probar integraciones de entrada.
- Soporta ejecución en float32, bfloat16 y float16 con resultados finitos en forward, loss y gradientes.
- No dispone de tool calling, function calling, agentes, modo thinking, visión real ni capacidades multilingües funcionales.
- Sirve como fixture de CI para comprobar que una integración de framework espera correctamente la arquitectura GOT-OCR2.

## Casos de uso

- Pruebas de integración en Transformers: cargar el modelo con `AutoModelForCausalLM` o la clase específica y verificar que los nombres de tensores y la configuración coinciden con el checkpoint real, sin descargar los ~580M parámetros del modelo completo.
- Validación de pipelines de CI/CD: ejecutar tests de forward pass, loss y gradientes en float32, bfloat16 y float16 para detectar regresiones en la integración antes de probar con pesos reales.
- Desarrollo de herramientas de preprocesado: al conservar el tokenizer y el preprocessor originales, permite iterar sobre el pipeline de imágenes y tokens sin coste de descarga.
- Verificación de contratos de framework: el directorio `integrations/transformers/expectations` define las salidas esperadas, útil para comparar implementaciones alternativas (vLLM, TGI) contra la referencia.
- Reproducción de fixtures: el script `build_fixtures.py` permite regenerar el artefacto y auditar hashes y fuentes fijadas en `build.json`.
- Formación y demos: sirve para explicar la arquitectura GOT-OCR2 en talleres sin necesidad de infraestructura GPU, dado su tamaño de 0,1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de prueba con pesos aleatorios y sin entrenamiento, no tiene sentido evaluarlo en MMLU, HumanEval, GSM8K ni métricas de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (13M parámetros, ~26 MB de pesos) más el coste de activaciones, despreciable.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en cualquier GPU consumer y en la mayoría de entornos CPU.
- Opciones de despliegue: Transformers (vía `GotOcr2ForConditionalGeneration`), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no es el propósito del artefacto.
- Latencia y throughput: no disponibles; al ser un fixture sin entrenamiento, las métricas no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/got_ocr2-mic | 13,0 M | no disponible | Fixture de prueba para GOT-OCR2 | no disponible | Hugging Face |
| stepfun-ai/GOT-OCR-2.0-hf | ~580 M (no confirmado en la informacion) | no disponible | OCR multimodal real | no disponible | Hugging Face |
| Modelos OCR comparables (p. ej. PaddleOCR, TrOCR) | no disponible | no disponible | OCR de produccion | no disponible | no disponible |

La comparación relevante es con el checkpoint base `stepfun-ai/GOT-OCR-2.0-hf`: mismo nombre de tensores y mismo procesador, pero con capas reducidas y pesos aleatorios. No es un sustituto funcional.

## Limitaciones y advertencias

- No es un modelo usable: los pesos son aleatorios y no han sido entrenados; las salidas no tienen significado.
- Etiquetado como `test-artifact` para excluirlo de búsquedas de modelos candidatos; no debe desplegarse en producción.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones del artefacto ni del modelo base.
- Idiomas no disponibles: al no ser funcional, no hay soporte multilingüe real.
- Contexto no disponible: la configuración reducida no refleja la ventana del modelo original.
- Riesgo de confusión: el nombre y la estructura pueden llevar a error si se trata como un modelo OCR operativo; verificar siempre el tag `test-artifact`.
- Sesgos y alucinaciones: no aplica en sentido estricto, pero cualquier salida generada carece de validez.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/got_ocr2-mic
- Modelo base: https://huggingface.co/stepfun-ai/GOT-OCR-2.0-hf
- Contrato de integración: https://huggingface.co/huggingface-mic/got_ocr2-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/got_ocr2-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/got_ocr2-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/got_ocr2-mic/blob/main/build.json
- Explicación del shrink: https://huggingface-mic-mic-coverage.static.hf.space/shrink/got_ocr2-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
