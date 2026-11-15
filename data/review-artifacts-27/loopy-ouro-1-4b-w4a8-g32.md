# review-artifacts-27/Loopy-Ouro-1.4B-W4A8-G32

## Resumen

Loopy-Ouro-1.4B-W4A8-G32 es un checkpoint cuantizado derivado de ByteDance/Ouro-1.4B, un modelo de lenguaje recurrente de 1.4B parámetros desarrollado originalmente por ByteDance. Lo publica el usuario review-artifacts-27 bajo licencia Apache-2.0, y su interés principal no radica en el modelo base sino en la metodología de cuantización aplicada: una búsqueda sobre un pool de 400 candidatos de rotaciones Hadamard y escalados para producir pesos W4 (4 bits) con activaciones A8 (8 bits por token dinámicas) manteniendo una calidad medible y verificable.

El checkpoint emplea profundidad recurrente T=4 sobre la arquitectura del modelo base y un tamaño de grupo de pesos de 32, con bloques Hadamard de 128 y semilla de rotación 123 (candidato `s123_p12_b128`). El resultado guardado reporta una perplejidad de 12.77 en WikiText-2 y 6.00 en LAMBADA, con una precisión media de 63.00% en cinco tareas de evaluación estándar (LAMBADA, WinoGrande, ARC-C, HellaSwag, MMLU).

Es relevante ahora porque documenta un pipeline reproducible de cuantización extrema (4 bits en pesos) para modelos recurrentes, con artefactos de evidencia completos (ventanas fijas de calibración, registros de búsqueda por etapa, hashes de procedencia) y un loader personalizado que no depende de `from_pretrained()` estándar de Transformers. El repositorio ocupa 1.9 GB y está pensado como artefacto de investigación más que como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (recurrent-language-model), profundidad recurrente T=4 |
| Parámetros totales | 1.4B (heredados de ByteDance/Ouro-1.4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluación WT2 con ventana rodante a nivel de documento) |
| Tipos de cuantización | W4 (pesos 4 bits en contenedores INT8), A8 (activaciones 8 bits dinámicas por token), grupo de pesos 32, bloques Hadamard 128 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (pesos); el código de investigación tiene avisos de terceros en `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dict de PyTorch con códigos INT8 + escalas, puntos cero, escalado de entrada y signos Hadamard); no usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4 |

## Arquitectura y entrenamiento

El modelo base ByteDance/Ouro-1.4B es un transformer recurrente: aplica un mismo bloque de capas de forma iterativa (profundidad recurrente T=4 en este checkpoint) en lugar de apilar capas distintas, lo que permite aumentar la profundidad efectiva de cómputo sin incrementar proporcionalmente el número de parámetros. Esta release no reentrena el modelo; parte de la revisión fijada `574fa66cb8bf5abdc979642d01cf2b79b16bfab1` de ByteDance/Ouro-1.4B y aplica una cuantización post-entrenamiento.

La innovación técnica está en el procedimiento de cuantización: se exploró un pool de 400 candidatos combinando rotaciones Hadamard (tamaño de bloque 128) con distintas semillas y potencias de escalado (potencia 1.2, semilla 123), seleccionando el candidato `s123_p12_b128`. La calibración, la búsqueda y la evaluación de calidad usan grupos separados de 32 ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revisión `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`). La evaluación emplea cuantización falsa (fake quantization) en BF16, y los pesos W4 se almacenan como códigos enteros en contenedores INT8 junto con sus metadatos de escalado. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto en inglés, con razonamiento y conocimiento general evaluado mediante MMLU (66.13% de precisión).
- Comprensión lectora y completado de texto, evaluado en LAMBADA (perplejidad 6.00, precisión 62.12%).
- Razonamiento de sentido común y elección múltiple, evaluado en WinoGrande (64.33%), ARC-C (52.05%) y HellaSwag (70.38%).
- Procesamiento de contexto de hasta 4096 tokens con ventana rodante a nivel de documento.
- Capacidad recurrente: la profundidad de cómputo se aplica iterativamente (T=4), lo que puede beneficiar tareas que requieren pasos de razonamiento encadenados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de cuantización extrema: el checkpoint sirve como referencia reproducible para investigadores que comparan métodos de cuantización W4A8 en modelos recurrentes, ya que incluye registros de búsqueda por etapa, ventanas de calibración fijas y métricas de referencia en `reference_results/`.
- Reproducción de experimentos: el pipeline documentado (`eval_wikitext.py`, `eval_tasks.py`) permite replicar las métricas reportadas con un entorno Conda fijado, útil para validar resultados de papers o auditorías internas.
- Investigación sobre modelos recurrentes de bajo coste: con 1.4B parámetros y pesos de 4 bits, permite estudiar el comportamiento de arquitecturas recurrentes en hardware modesto sin necesidad de GPUs de gran memoria.
- Prototipado de completado de texto en inglés: la perplejidad de 6.00 en LAMBADA sugiere utilidad para tareas de predicción de siguiente palabra y autocompletado en dominios generales, siempre con validación adicional.
- Benchmarking de loaders personalizados: el repositorio incluye un loader propio que inicializa la arquitectura base antes de cargar estrictamente el estado seleccionado, lo que lo convierte en un caso de estudio para integraciones que no pueden usar `from_pretrained()` estándar.
- Docencia y formación técnica: como artefacto con procedencia verificable (`manifest.json` con SHA-256, `provenance.json`), es adecuado para enseñar flujos de publicación reproducible de modelos cuantizados.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---:|
| WT2 word PPL (contexto 4096, rolling a nivel de documento) | 12.77 |
| LAMBADA PPL | 6.00 |
| LAMBADA acc. | 62.12 |
| WinoGrande | 64.33 |
| ARC-C (acc_norm) | 52.05 |
| HellaSwag (acc_norm) | 70.38 |
| MMLU | 66.13 |
| Media de precisión (5 tareas, peso igual) | 63.00 |

Las precisiones están en porcentaje; ARC-C y HellaSwag usan `acc_norm`, el resto `acc`. La media pondera igualmente las cinco tareas de precisión. Los resultados corresponden a la evaluación con cuantización falsa en BF16 del checkpoint guardado, según la model card. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1.9 GB, lo que sugiere que el checkpoint cabe holgadamente en GPUs de consumo con 8 GB o más; sin embargo, al no usar almacenamiento INT4 empaquetado ni kernel INT4, la inferencia real requiere descomprimir los pesos a un formato de coma flotante, por lo que el pico de memoria puede ser mayor que el tamaño del archivo.
- GPU recomendadas: no disponible de forma explícita; por el tamaño del modelo (1.4B) es razonable esperar que funcione en RTX 3060/4060 con 8-12 GB, y con holgura en RTX 4090, A100 o H100.
- Cabe en GPU de consumo: probablemente sí, en modelos con 8 GB o más, aunque no se documenta un requisito oficial.
- Opciones de despliegue: el repositorio incluye un loader personalizado de Loopy; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI, y de hecho se advierte explícitamente de no usar `from_pretrained()` genérico sobre este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loopy-Ouro-1.4B-W4A8-G32 | 1.4B | 4096 | W4A8, grupo 32 | Apache-2.0 | Hugging Face (artefacto de investigación) |
| ByteDance/Ouro-1.4B | 1.4B | no disponible | BF16 original | Apache-2.0 (según modelo base) | Hugging Face |
| Otros derivados cuantizados de Ouro-1.4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de benchmarks.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; no se debe asumir competencia multilingüe.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación comunitaria.
- Requiere un loader personalizado (Loopy); un `from_pretrained()` estándar de Transformers fallará o cargará incorrectamente el estado.
- No usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4: los pesos W4 se guardan en contenedores INT8 y la evaluación se hace con cuantización falsa en BF16, por lo que el rendimiento real en producción puede diferir de las métricas reportadas.
- Riesgo de alucinación inherente a un modelo de 1.4B; las métricas de MMLU (66.13%) y ARC-C (52.05%) indican un conocimiento limitado, insuficiente para tareas de alta precisión sin verificación.
- La licencia Apache-2.0 aplica a los pesos; el código de investigación incluido tiene avisos de terceros en `code/THIRD_PARTY_NOTICES.md` que deben revisarse antes de uso comercial.
- El checkpoint está fijado a una revisión concreta del modelo base (`574fa66cb8bf5abdc979642d01cf2b79b16bfab1`); cambios posteriores en el modelo base no están reflejados.
- No hay información sobre sesgos conocidos, datos de entrenamiento ni filtros de seguridad del modelo base en la documentación proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/review-artifacts-27/Loopy-Ouro-1.4B-W4A8-G32
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B
- Dataset de calibración: https://huggingface.co/datasets/Salesforce/wikitext (revisión `b08601e04326c79dfdd32d625aee71d232d685c3`)
- Documentación del protocolo: `code/docs/protocol.md` (dentro del repositorio)
- Registro de ventanas: `artifacts/window_manifest.json` (dentro del repositorio)
- Manifiesto de archivos: `manifest.json` (dentro del repositorio)
- Procedencia: `provenance.json` (dentro del repositorio)
- Resultados de referencia: `reference_results/` (dentro del repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (dentro del repositorio)
