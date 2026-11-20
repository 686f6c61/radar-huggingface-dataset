# huggingface-mic/privacy-filter-mic

## Resumen

`privacy-filter-mic` es un artefacto de prueba (fixture) publicado por la organización `huggingface-mic` con el propósito explícito de validar integraciones de frameworks, no de servir como modelo utilizable en producción. Se trata de una versión reducida ("slim") del modelo `openai/privacy-filter`, un clasificador de tokens orientado a la detección de información personal identificable (PII). El repositorio empaqueta pesos reducidos, ejemplos de uso ejecutables y las expectativas de framework en un único lugar, siguiendo un manifiesto de contrato (`integration.json`).

El modelo conserva la arquitectura `OpenAIPrivacyFilterForTokenClassification` pero reduce el número de capas ocultas a 2, lo que da como resultado 13.031.217 parámetros totales (aproximadamente 13,0 M) y un tamaño de repositorio de 0,1 GB. Los archivos del procesador (`model.sig`, `tokenizer.json`, `tokenizer_config.json`, `viterbi_calibration.json`) se copian byte a byte desde el checkpoint original, de modo que la tokenización y la calibración de Viterbi son idénticas a las del modelo de referencia.

La relevancia de esta ficha es acotada: el autor etiqueta el artefacto como `test-artifact` para excluirlo de búsquedas de modelos candidatos, y los pesos son aleatorios (semilla 17), sin entrenamiento. Por tanto, cualquier evaluación de calidad de detección de PII debe realizarse sobre `openai/privacy-filter`, no sobre este fixture. Aun así, resulta útil para desarrolladores que necesiten validar pipelines de carga, serialización y ejecución de token classification sin descargar el checkpoint completo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `OpenAIPrivacyFilterForTokenClassification` (transformer encoder reducido a 2 capas ocultas) |
| Parámetros totales | 13.031.217 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos guardados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder para clasificación de tokens, derivado de `openai/privacy-filter` mediante la regla genérica de reducción implementada en `sweep.py` del repositorio `huggingface/transformers-mic`. La reducción afecta únicamente al número de capas ocultas (`num_hidden_layers` = 2), manteniendo los nombres de tensores idénticos a los del checkpoint real y copiando los archivos del procesador sin modificaciones. Los pesos son aleatorios, generados con semilla 17, y no han pasado por ningún proceso de entrenamiento, ajuste fino, RLHF ni DPO.

La única validación aplicada es una "puerta de sensibilidad a la entrada" (*input-sensitivity gate*): se comprobó que cada perturbación de las entradas del contrato desplaza los logits al menos 0,001 (el caso más débil, `attention_mask:all_ones`, produjo 0,389). Los tensores son finitos en float32, bfloat16 y float16 tanto en forward como en pérdida y gradientes. No hay innovaciones técnicas destacables más allá del propio mecanismo de construcción de fixtures reproducibles.

## Capacidades

- Clasificación de tokens a nivel de arquitectura: la cabeza de token classification existe y produce logits, pero los pesos aleatorios no permiten ninguna detección real de PII.
- Ejecución de forward pass en float32, bfloat16 y float16 con gradientes finitos.
- Compatibilidad de tokenización con `openai/privacy-filter` gracias a los archivos de procesador copiados byte a byte.
- Integración con Transformers documentada mediante `integrations/transformers/usage.md` y el directorio de expectativas.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponible (los idiomas del modelo base no se documentan en la información proporcionada).

## Casos de uso

- Validación de pipelines de carga en Transformers: sirve para comprobar que la clase `OpenAIPrivacyFilterForTokenClassification` se instancia correctamente y que los nombres de tensores coinciden con el checkpoint real, sin descargar el modelo completo.
- Pruebas de integración continua en librerías de serialización: al pesar 0,1 GB y tener 13,0 M de parámetros, se puede incluir en suites de test que verifiquen carga en bfloat16, float16 y float32.
- Verificación de contratos de framework: el manifiesto `integration.json` y el directorio de expectativas permiten a los mantenedores de Transformers comprobar que la API expuesta coincide con la esperada.
- Test de reproducibilidad de fixtures: `build.json` registra fuentes fijadas, resultados de la puerta de sensibilidad y hashes de archivos, lo que permite reconstruir el artefacto con `build_fixtures.py`.
- Pruebas de tokenización y calibración de Viterbi: los archivos `tokenizer.json` y `viterbi_calibration.json` idénticos al original permiten validar el preprocesado y la decodificación de secuencias sin pesos entrenados.
- Desarrollo de herramientas de inspección de modelos: útil para validar visores de safetensors, comparadores de arquitecturas o scripts que verifiquen la correspondencia de tensores entre checkpoint real y reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que es un artefacto de prueba con pesos aleatorios, por lo que cualquier métrica de calidad de detección de PII carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión razonable, dado el tamaño de 13,0 M de parámetros (aproximadamente 26 MB en bfloat16 y 52 MB en float32 para los pesos).
- GPU recomendadas: no se requiere GPU; el modelo cabe holgadamente en CPU.
- Compatible con cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso con entornos sin GPU.
- Opciones de despliegue: Transformers es la vía documentada en el repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y su naturaleza de token classifier hace que esos motores de generación no sean aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Naturaleza |
|---|---|---|---|---|---|
| `huggingface-mic/privacy-filter-mic` | 13,0 M | no disponible | no disponible | Hugging Face | Fixture de prueba, pesos aleatorios |
| `openai/privacy-filter` | no disponible | no disponible | no disponible | Hugging Face | Modelo real de detección de PII |
| Otros fixtures `*-mic` de `huggingface-mic` | variable | no disponible | no disponible | Hugging Face | Artefactos de prueba para integración |

La comparación relevante es con el modelo base `openai/privacy-filter`: este fixture replica su arquitectura y procesador pero no su comportamiento, al carecer de entrenamiento. Frente a otros detectores de PII comerciales o académicos, no procede comparación de rendimiento porque no hay métricas publicadas para este artefacto.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no detecta PII real; cualquier uso en producción produciría salidas sin significado.
- Etiquetado como `test-artifact`: el autor lo excluye deliberadamente de búsquedas de modelos candidatos.
- Licencia no especificada: no hay información sobre condiciones de uso comercial; debe consultarse la licencia de `openai/privacy-filter` antes de cualquier uso derivado.
- Idiomas y contexto no documentados: no se puede asumir cobertura multilingüe ni una ventana de contexto concreta.
- Riesgo de confusión: el nombre y la estructura pueden llevar a error si se despliega pensando que es el modelo real; conviene verificar siempre el tag `test-artifact`.
- Sin benchmarks: no existen métricas de precisión, recall ni F1 para este artefacto.
- Dependencia del contrato: su valor está ligado a la versión concreta de Transformers y al manifiesto `integration.json`; cambios en el framework pueden invalidar las expectativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/privacy-filter-mic
- Modelo base: https://huggingface.co/openai/privacy-filter
- Documentación de uso en Transformers: `integrations/transformers/usage.md` (dentro del repositorio)
- Expectativas de Transformers: `integrations/transformers/expectations` (dentro del repositorio)
- Manifiesto de contrato: `integration.json` (dentro del repositorio)
- Procedencia del fixture: `build.json` (dentro del repositorio)
- Explicación del proceso de reducción: https://huggingface-mic-mic-coverage.static.hf.space/shrink/privacy-filter-mic.html
- Script de construcción: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Regla de reducción: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
