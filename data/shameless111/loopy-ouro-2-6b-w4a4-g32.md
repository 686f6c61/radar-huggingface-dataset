# Shameless111/Loopy-Ouro-2.6B-W4A4-G32

## Resumen

Loopy-Ouro-2.6B-W4A4-G32 es un checkpoint cuantizado del modelo recurrente ByteDance/Ouro-2.6B, publicado por el usuario Shameless111. Se trata de una derivación experimental que aplica cuantización de pesos a 4 bits (W4) y de activaciones a 4 bits dinámicos por token (A4), con un tamano de grupo de pesos de 32 y transformaciones Hadamard de bloque 512 para rotación. El checkpoint se seleccionó mediante una búsqueda sobre un pool de 400 candidatos, quedándose con la configuración identificada como `s1024_p08_b512` (semilla de rotación 1024, potencia de escalado 0.8, bloque Hadamard 512).

El modelo base, Ouro-2.6B de ByteDance, es un modelo de lenguaje recurrente en profundidad (recurrent depth), una arquitectura que reutiliza bloques transformer en múltiples pasos de cómputo en lugar de apilar capas independientes. Este checkpoint concreto mantiene una profundidad recurrente T=4 y está pensado para investigación sobre cuantización extrema de modelos recurrentes, no como un modelo listo para producción.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización W4A4 con rotaciones Hadamard aplicada a un modelo no convencional; por otro, advierte de que el artefacto requiere un cargador personalizado (custom loader) y no es compatible con `from_pretrained()` estándar de Transformers. El repositorio ocupa 3.3 GB e incluye código de evaluación, resultados de referencia y registros de procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente en profundidad (recurrent depth T=4), modelo base Ouro-2.6B |
| Parametros totales | 2.6B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluación WT2 document-level rolling word PPL) |
| Tipos de cuantizacion | W4 (pesos a 4 bits, códigos INT8 en contenedores), A4 dinámico por token; evaluación con fake quantization BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (pesos); el código de investigación tiene avisos de terceros en `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dict PyTorch con códigos INT4 en contenedores INT8, escalas, zero points, input scaling y signos Hadamard); no usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4 |
| Tamano del repositorio | 3.3 GB |
| Revision base | `1ed04250da1a9936042725d302e81c8fa2ab5abd` |
| Grupo de pesos | 32 |
| Bloque Hadamard | 512 |
| Semilla de rotación | 1024 |
| Potencia de escalado | 0.8 |

## Arquitectura y entrenamiento

El modelo base Ouro-2.6B emplea una arquitectura de transformer recurrente en profundidad: en lugar de apilar 24 o 32 capas distintas, reutiliza un conjunto reducido de bloques en T=4 pasos recurrentes, lo que reduce el número de parámetros manteniendo capacidad computacional efectiva. Esta ficha no dispone de información detallada sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO), por lo que se indica como no disponible.

Sobre esa base, el autor aplica una cuantización post-entrenamiento W4A4 con rotaciones Hadamard. La técnica consiste en aplicar transformaciones ortogonales (Hadamard) de bloque 512 antes de cuantizar, lo que redistribuye los valores atípicos y reduce el error de cuantización. Los pesos se almacenan como códigos enteros de 4 bits en contenedores INT8, junto con escalas, zero points, escalado de entrada y signos de Hadamard. La activación se cuantiza dinámicamente a 4 bits por token. La configuración se eligió mediante búsqueda sobre 400 candidatos, evaluando cada uno con ventanas fijas de WikiText-103 (revisión `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`), usando grupos separados de 32 ventanas para calibración, búsqueda y calidad.

Una innovación destacable es la separación explícita entre selecciones W4A4 y W4A8: la precisión de activación no determina el dtype de almacenamiento del checkpoint, y la evaluación se realiza con fake quantization BF16. El release incluye un protocolo congelado en `code/docs/protocol.md` y verificaciones numéricas específicas del modelo.

## Capacidades

- Generación de texto autoregresiva en inglés, con razonamiento recurrente en profundidad T=4.
- Evaluación de perplejidad y tareas de sentido común (WinoGrande, ARC-C, HellaSwag) y conocimiento (MMLU), según la tabla de resultados guardados.
- Capacidad de contexto de hasta 4096 tokens para evaluación document-level.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documenta soporte multilingüe más allá del inglés.
- No se documenta thinking mode, visión ni audio.
- El checkpoint está orientado a evaluación e investigación, no a despliegue de inferencia optimizada (no hay kernel INT4).

## Casos de uso

- Investigación en cuantización extrema: el checkpoint sirve para estudiar el impacto de W4A4 con rotaciones Hadamard sobre modelos recurrentes, comparando las métricas guardadas (WT2 PPL 12.35, LAMBADA PPL 6.20) con el modelo en precisión completa.
- Reproducción de experimentos: el repositorio incluye `artifacts/` con configuración portable, ventanas fijas, valores de calibración y registros de búsqueda por etapa, lo que permite reproducir la selección del candidato `s1024_p08_b512`.
- Evaluación de protocolos de cuantización: los scripts `eval_wikitext.py` y `eval_tasks.py` permiten lanzar evaluaciones con `--a-bits 4` y `--variant selected` sobre tareas estándar (LAMBADA, WinoGrande, ARC-C, HellaSwag, MMLU).
- Estudio de modelos recurrentes en profundidad: al mantener T=4, el checkpoint permite analizar cómo afecta la cuantización a la reutilización de bloques frente a arquitecturas apiladas convencionales.
- Auditoría de procedencia y reproducibilidad: `manifest.json` (tamanos y SHA-256) y `provenance.json` (mapeo de hashes de metadatos) permiten verificar la integridad del artefacto en pipelines de investigación.
- Base para futuras selecciones W4A8: el release incluye métricas BF16 para W4A8 en `reference_results/`, lo que facilita comparar ambas configuraciones en trabajos posteriores.

## Benchmarks y rendimiento

Resultados guardados del checkpoint seleccionado (tabla main-table del autor):

| Metrica | Valor |
|---|---:|
| WT2 word PPL (4096-context, rolling) | 12.35 |
| LAMBADA PPL | 6.20 |
| LAMBADA acc. (%) | 62.35 |
| WinoGrande acc. (%) | 65.59 |
| ARC-C acc_norm (%) | 55.38 |
| HellaSwag acc_norm (%) | 72.87 |
| MMLU acc. (%) | 65.64 |
| Media de precisión (%) | 64.37 |

La media pondera por igual las cinco tareas de precisión. Las métricas completas en precisión completa están en `reference_results/`. No se dispone de comparación directa con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3.3 GB, pero al no usar almacenamiento INT4 empaquetado ni kernel INT4, la inferencia requiere cargar el state dict y ejecutar con fake quantization BF16; esto implica una huella de memoria cercana a la del modelo en BF16 (aproximadamente 5-6 GB para 2.6B parámetros) más overhead del cargador.
- GPU recomendadas: no disponible en la información proporcionada; por tamano, una GPU con al menos 8-12 GB de VRAM debería ser suficiente para evaluación, pero el autor no lo especifica.
- Cabe en GPU de consumo: probablemente sí en RTX 3060 12 GB, RTX 4070 o superiores, aunque no está confirmado por el autor.
- Opciones de despliegue: cargador personalizado Loopy incluido en `code/`; no compatible con `from_pretrained()` estándar de Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Loopy-Ouro-2.6B-W4A4-G32 | 2.6B | 4096 | W4A4 con Hadamard | apache-2.0 | Hugging Face, cargador custom |
| ByteDance/Ouro-2.6B (base) | 2.6B | no disponible | BF16 | apache-2.0 | Hugging Face |
| Otros checkpoints Loopy del mismo autor | 2.6B | 4096 | W4A8 / variantes | apache-2.0 | Hugging Face (según `reference_results/`) |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Requiere cargador personalizado: el autor advierte explícitamente de que no debe usarse `from_pretrained()` genérico sobre este repositorio; hay que usar el loader Loopy incluido.
- No hay kernel de inferencia INT4: el checkpoint almacena códigos W4 en contenedores INT8 y la evaluación usa fake quantization BF16, por lo que no se obtienen las ventajas de velocidad de un kernel INT4 real.
- Solo inglés: el modelo base y el checkpoint están etiquetados únicamente como `en`.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 2.6B, es esperable una tasa de alucinación superior a modelos mayores.
- Sesgos: no documentados por el autor.
- Restricciones de licencia: los pesos son Apache-2.0, pero el código de investigación tiene avisos de terceros en `code/THIRD_PARTY_NOTICES.md` que deben revisarse antes de uso comercial.
- Sin descargas ni likes: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Fecha de creación futura (2026-11-15): conviene verificar la integridad y procedencia del artefacto antes de confiar en él.
- No apto para producción sin validación adicional: es un checkpoint de investigación con protocolo congelado, no un modelo afinado para tareas de usuario final.

## Enlaces

- Hugging Face: https://huggingface.co/Shameless111/Loopy-Ouro-2.6B-W4A4-G32
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B
- Dataset de evaluación: https://huggingface.co/datasets/Salesforce/wikitext
- Documentación del protocolo: `code/docs/protocol.md` (dentro del repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (dentro del repositorio)
- Manifiesto de integridad: `manifest.json` (dentro del repositorio)
- Procedencia: `provenance.json` (dentro del repositorio)
