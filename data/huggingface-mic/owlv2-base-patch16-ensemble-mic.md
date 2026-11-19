# huggingface-mic/owlv2-base-patch16-ensemble-mic

## Resumen

`huggingface-mic/owlv2-base-patch16-ensemble-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` para el ecosistema de validación de integraciones de Transformers (proyecto transformers-mic). No es un modelo utilizable en producción: se trata de una versión reducida artificialmente del modelo de detección de objetos open-vocabulary OWLv2 de Google, con solo 3.606.663 parámetros y pesos aleatorios (semilla 17) generados sin entrenamiento.

El propósito del repositorio es servir como fixture ejecutable que reproduce la misma arquitectura (`Owlv2ForObjectDetection`) y los mismos nombres de tensores que el checkpoint real `google/owlv2-base-patch16-ensemble`, pero con una configuración encogida (2 capas en el codificador de texto y 2 capas en el codificador de visión). Los ficheros de procesador (tokenizador, preprocesador de imagen, vocabulario) se copian byte a byte del modelo original, de modo que las expectativas de framework y la sensibilidad de entradas puedan validarse de forma determinista y barata.

Es relevante ahora únicamente en el contexto de ingeniería de pruebas: permite a los mantenedores de Transformers verificar contratos de integración (formas de entrada/salida, dtypes, gradientes, sensibilidad a perturbaciones) sin descargar ni ejecutar el checkpoint completo de OWLv2. La model card lo etiqueta explícitamente como `test-artifact` para excluirlo de búsquedas de modelos candidatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Owlv2ForObjectDetection (transformer dual: codificador de visión ViT + codificador de texto CLIP, con cabezas de clasificación y regresión de cajas) |
| Parametros totales | 3.606.663 (fixture encogido; el modelo base original tiene muchos más, no disponible el dato exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el fixture reduce `text num_hidden_layers` a 2 y `vision num_hidden_layers` a 2; la longitud de contexto efectiva no se documenta) |
| Tipos de cuantizacion | no disponible (pesos guardados en float32; se declara finito en float32, bfloat16 y float16) |
| Idiomas soportados | no disponible (el tokenizador copiado del modelo base es multilingüe, pero no se documenta cobertura) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OWLv2: un transformer de dos torres con un codificador de imagen tipo ViT con parches de 16x16 (patch16) y un codificador de texto derivado de CLIP, combinados mediante atención cruzada para la detección open-vocabulary. La variante `ensemble` del modelo base original emplea múltiples aumentos de imagen durante la inferencia para mejorar la detección de objetos pequeños y poco representados. En este fixture se conserva la clase `Owlv2ForObjectDetection` y los nombres de tensores del checkpoint real, pero se reduce el número de capas ocultas a 2 tanto en el codificador de texto como en el de visión mediante la regla genérica de `sweep.py`.

No hubo entrenamiento. Los pesos son aleatorios (semilla 17) y se aceptaron porque superaron la puerta de sensibilidad a entradas del contrato: toda perturbación de las entradas del contrato desplazó los logits al menos 0,001 (el caso más débil, `input_ids:roll_batch`, con 0,354). Los ficheros de procesador (`added_tokens.json`, `merges.txt`, `preprocessor_config.json`, `special_tokens_map.json`, `tokenizer_config.json`, `vocab.json`) se copiaron byte a byte desde `google/owlv2-base-patch16-ensemble`. El fixture se guarda en float32, el dtype por defecto del modelo original, y se verifica que sea finito en float32, bfloat16 y float16 (forward, loss y gradientes).

## Capacidades

- No es un modelo funcional: los pesos son aleatorios y no producen detecciones semánticamente válidas.
- Reproduce la interfaz de inferencia de OWLv2 (entradas de imagen y texto, salidas de logits y cajas), útil para validar pipelines.
- Conserva el tokenizador y el preprocesador de imagen del modelo base, por lo que las formas y dtypes de entrada coinciden con el original.
- Soporta forward, cálculo de loss y gradientes (verificado en float32, bfloat16 y float16).
- No dispone de capacidades reales de detección open-vocabulary, tool calling, agentes, razonamiento ni multilingüismo funcional.
- Sirve como fixture de contrato para pruebas de integración en Transformers (transformers-mic).

## Casos de uso

- Pruebas de integración en Transformers: validar que la clase `Owlv2ForObjectDetection` carga, ejecuta forward y calcula gradientes con formas y dtypes correctos, sin necesidad del checkpoint completo.
- CI/CD de librerías: ejecutar suites de tests rápidas y deterministas en cada PR que toque el código de OWLv2, gracias a los 3,6 M de parámetros y al repo de 0,0 GB.
- Validación de contratos de entrada/salida: comprobar la sensibilidad del modelo a perturbaciones de `input_ids` y píxeles, usando la puerta documentada en `build.json`.
- Verificación de portabilidad de dtypes: asegurar que forward, loss y gradientes son finitos en float32, bfloat16 y float16 antes de desplegar el modelo real.
- Regresión de tokenizador y preprocesador: al copiarse byte a byte los ficheros del modelo base, detectar cambios accidentales en el pipeline de preprocesado de imagen y texto.
- Reproducibilidad de fixtures: reconstruir el artefacto con `build_fixtures.py` y comparar hashes de ficheros registrados en `build.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (3,6 M de parámetros), holgadamente por debajo de cualquier GPU consumer.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, etc.) y en entornos sin GPU.
- Opciones de despliegue: carga directa con `transformers` (clase `Owlv2ForObjectDetection`); no se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al ser un fixture de 2 capas, la latencia será mínima, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huggingface-mic/owlv2-base-patch16-ensemble-mic | 3.606.663 (fixture) | no disponible | no aplica (pesos aleatorios) | no disponible | Hugging Face |
| google/owlv2-base-patch16-ensemble | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Hugging Face |
| Otros detectores open-vocabulary (p. ej. Grounding DINO) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa real no es significativa: el fixture no compite funcionalmente con ningún detector, solo replica la interfaz del modelo base para pruebas.

## Limitaciones y advertencias

- Pesos aleatorios: no produce detecciones útiles; cualquier salida es ruido.
- Etiquetado como `test-artifact`: no debe usarse en producción ni como modelo candidato.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, al derivar de `google/owlv2-base-patch16-ensemble`, habría que verificar la licencia del modelo base.
- Configuración encogida (2 capas de texto y 2 de visión): el comportamiento numérico no refleja el del modelo original.
- Sin datos de sesgos, alucinación ni cobertura de idiomas.
- El repositorio no incluye todos los ficheros del modelo base; algunos deben regenerarse con `build_fixtures.py`.
- No apto para evaluación de calidad, fine-tuning ni benchmarks de detección.

## Enlaces

- Hugging Face: https://huggingface.co/huggingface-mic/owlv2-base-patch16-ensemble-mic
- Modelo base: https://huggingface.co/google/owlv2-base-patch16-ensemble
- Manifiesto de contrato: https://huggingface.co/huggingface-mic/owlv2-base-patch16-ensemble-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/huggingface-mic/owlv2-base-patch16-ensemble-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/huggingface-mic/owlv2-base-patch16-ensemble-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/huggingface-mic/owlv2-base-patch16-ensemble-mic/blob/main/build.json
- Explicación del encogimiento: https://huggingface-mic-mic-coverage.static.hf.space/shrink/owlv2-base-patch16-ensemble-mic.html
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
- Script de barrido: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
