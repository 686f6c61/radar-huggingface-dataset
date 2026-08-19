# agu18dec/qwen3.6-27b-mlayer-ar-checkpoints

## Resumen

Este repositorio contiene los checkpoints de una familia de *Activation Reconstructors* (ARs) entrenados sobre el modelo Qwen3.6-27B. Un AR es un artefacto de investigación que combina un backbone Qwen3.6-27B adaptado con LoRA y una cabeza de reconstrucción que, dado un fragmento de texto, predice la activación del flujo residual (residual stream) que precede a ese fragmento. El objetivo es estudiar la representación interna del modelo y medir qué fracción de la varianza de las activaciones es explicable a partir del texto de entrada.

El repositorio está organizado por ejecuciones de entrenamiento (`run-name`), cada una con múltiples hitos (`ex{N}/`) que corresponden a distintos puntos de una curva de escalado. Incluye también ficheros de blanqueo (`whiteners/`) que definen las bases en las que se evalúa la fracción de varianza explicada (FVE). Es un recurso especializado para la comunidad de interpretabilidad de modelos, no un modelo de lenguaje listo para uso general.

La relevancia actual radica en que Qwen3.6-27B es un modelo denso de 27B parámetros con buen rendimiento en tareas de agente y código, y estos checkpoints permiten analizar cómo se distribuye la información a lo largo de sus capas. El autor, `agu18dec`, proporciona metadatos completos en cada hito (`meta.json`) con métricas de validación y configuración exacta de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3.6-27B (truncado) + adaptador LoRA + cabeza de reconstrucción. Dos variantes: *layer-conditioned* (cabeza compartida con embedding de capa) y *prompt-tag* (capa indicada en el prompt, cabeza compartida sin embedding de capa) |
| Parametros totales | No disponible (depende del checkpoint; el backbone base es Qwen3.6-27B, pero no se especifican los parámetros del adaptador LoRA ni de las cabezas) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica para los ARs; depende del backbone subyacente) |
| Tipos de cuantizacion | No disponible (los pesos se almacenan en safetensors y PyTorch, sin cuantización declarada) |
| Idiomas soportados | No disponible (los ARs se entrenan sobre texto en inglés de chat y pretraining, pero no se especifica cobertura multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors (backbone y whitener), `heads.pt` (PyTorch), `meta.json` (metadatos) |

## Arquitectura y entrenamiento

Los ARs se construyen sobre un backbone Qwen3.6-27B truncado (se usan solo ciertas capas, típicamente 12 capas seleccionadas de un rango como {20,24,...,60,63}). Sobre este backbone se entrena un adaptador LoRA (PEFT) y una cabeza de reconstrucción que predice la activación del residual stream en una capa dada a partir del texto anterior. Hay dos arquitecturas principales:

- **Layer-conditioned** (`lc`): la cabeza lee la activación de una capa con profundidad emparejada y usa un embedding aprendido de capa. La cabeza es compartida entre capas.
- **Prompt-tag** (`ptag`): la capa se indica explícitamente en el prompt (p. ej. `[Layer NN] <span>`), se usa el estado oculto final y una única cabeza compartida, sin embedding de capa.

El entrenamiento se realiza con datos *on-policy*: texto de chat (asistente) o texto de estilo pretraining (seed de FineWeb-Edu). Hay variantes *off-policy* y *on-policy* según la procedencia de las capturas. El programa principal de 2026-08-18 entrena cuatro brazos (2 arquitecturas × 2 tipos de texto) en una base de blanqueo común (pooled) para que las FVE sean directamente comparables. Se usa un batch efectivo de 576, learning rate constante de 1e-4 y una ley de escalado de spans uniforme (uniform32 carve). Cada hito guarda el adaptador LoRA, las cabezas y un `meta.json` con las métricas de validación (val_fve_mean, val_ret1, etc.) y la configuración completa.

## Capacidades

- Reconstrucción de activaciones: dado un span de texto, predice la activación del residual stream de una capa específica del modelo Qwen3.6-27B.
- Evaluación de fracción de varianza explicada (FVE): permite medir cuantitativamente cuánta información de la activación es predecible desde el texto.
- Soporte de múltiples capas: los checkpoints cubren capas intermedias y profundas (p. ej. capas 20 a 63), lo que permite análisis de la jerarquía de representaciones.
- Dos modos de condicionamiento: por capa (layer-conditioned) o por etiqueta en el prompt (prompt-tag), ofreciendo flexibilidad para distintos experimentos.
- Métricas de retrieval y joint-FVE: los `meta.json` incluyen métricas como `val_ret1_*` y `val_jfve_*` para evaluar la calidad de la reconstrucción.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni agentes, ni visión.

## Casos de uso

- Investigación en interpretabilidad de modelos: analizar cómo se distribuye la información a lo largo de las capas de Qwen3.6-27B, identificando qué capas son más predecibles desde el texto y cuáles codifican información más abstracta.
- Estudio de la dinámica del residual stream: los ARs permiten cuantificar la "cantidad de información" que fluye por el residual stream, útil para entender mecanismos de atención y MLP.
- Comparación de representaciones entre dominios: los checkpoints entrenados con texto de chat vs. texto de pretraining permiten estudiar diferencias en la codificación interna según el tipo de datos.
- Validación de hipótesis sobre la linealidad de las representaciones: al medir la FVE en una base blanqueada, se puede comprobar si las activaciones son aproximadamente lineales respecto al contexto textual.
- Desarrollo de métodos de edición de modelos: conocer qué capas son más "reconstructibles" puede guiar intervenciones quirúrgicas en el modelo base.
- Reproducción de experimentos de scaling laws en representaciones: los hitos `ex{N}` con N log-espaciado permiten trazar curvas de escalado de la FVE frente al número de spans de entrenamiento.
- Benchmark de técnicas de análisis de activaciones: servir como referencia para comparar nuevas métricas o métodos de reconstrucción en un modelo moderno de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio incluye métricas de validación específicas de los ARs (val_fve_mean, val_fve_L{L}, val_ret1_*, val_jfve_*) almacenadas en cada `meta.json`, pero no se proporcionan valores numéricos en la documentación accesible. Para obtener estos datos es necesario descargar los checkpoints y leer los ficheros `meta.json`.

## Requisitos de hardware

- El backbone base es Qwen3.6-27B, un modelo denso de 27B parámetros. Para cargar el modelo completo en precisión FP16 se necesitan aproximadamente 54 GB de VRAM. Con cuantización a 8 bits se reduce a ~27 GB, y a 4 bits a ~14 GB, aunque no se indica que los checkpoints incluyan versiones cuantizadas.
- Para ejecutar los ARs (backbone + LoRA + cabezas) se recomienda una GPU con al menos 24 GB de VRAM (p. ej. RTX 3090, RTX 4090) si se usa cuantización, o 40-80 GB (A100, H100) para precisión completa.
- El repositorio no incluye instrucciones de despliegue con vLLM, llama.cpp u Ollama; está pensado para uso con PyTorch y PEFT, como se muestra en el ejemplo de carga.
- No se proporcionan datos de latencia ni throughput. Al ser un artefacto de investigación, el coste computacional depende del uso que se le dé (inferencia de reconstrucción o entrenamiento de nuevos ARs).

## Comparativa con modelos similares

No disponible. Los Activation Reconstructors son artefactos de investigación específicos de este repositorio; no existen modelos comparables de la misma categoría en el ecosistema abierto. La comparación relevante sería entre los distintos brazos del propio repositorio (p. ej. `ar.asst.ptag.pooled.s0` vs. `ar.asst.lc.pooled.s0`), que comparten la misma base de blanqueo y por tanto son directamente comparables en términos de FVE.

## Limitaciones y advertencias

- Es un repositorio de investigación, no un modelo de producción. No ofrece generación de texto ni API de inferencia estándar.
- La licencia no está especificada; antes de usar los pesos en proyectos comerciales o derivados, es necesario contactar con el autor o verificar la licencia del modelo base Qwen3.6-27B.
- Los ARs se entrenan con datos en inglés (chat y FineWeb-Edu); no hay evidencia de soporte multilingüe.
- Las métricas de FVE solo son comparables dentro de la misma base de blanqueo (whitener). Mezclar valores de `mlayer.lc.*` con `*.pooled.*` sin tener en cuenta la base puede llevar a conclusiones erróneas, como advierte el propio autor.
- El backbone Qwen3.6-27B puede heredar sesgos del modelo base; los ARs no corrigen ni mitigan estos sesgos.
- No se garantiza la reproducibilidad total sin la configuración exacta de hardware y software; los `meta.json` incluyen la configuración de entrenamiento, pero no el entorno de ejecución.
- El tamaño del repositorio es de 59.7 GB, lo que implica una descarga considerable y requisitos de almacenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agu18dec/qwen3.6-27b-mlayer-ar-checkpoints
- Árbol de ficheros: https://huggingface.co/agu18dec/qwen3.6-27b-mlayer-ar-checkpoints/tree/main
- Repositorio oficial de Qwen3.6 (modelo base): https://github.com/QwenLM/Qwen3.6
- Guía de Qwen 3.6-27B (blog externo): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Catálogo de modelos de Microsoft Foundry (Qwen3.6-27B): https://ai.azure.com/catalog/models/qwen--qwen3.6-27b
- Código de entrenamiento (mencionado en la model card): github.com/camilablank/global-workspace (no se proporciona URL directa)
