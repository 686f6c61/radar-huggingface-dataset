# imvladikon/GLM-5.2-9B-LoRA-Surgery-Dummy

## Resumen

Este repositorio contiene un checkpoint de prueba denominado `GLM-5.2-9B-LoRA-Surgery-Dummy`, creado por el usuario imvladikon. No es un modelo de chat ni de generación de texto utilizable, sino un artefacto técnico diseñado para validar flujos de post-entrenamiento, integración de LoRA, sincronización de pesos y sharding sobre la arquitectura del modelo GLM-5.2 de Z.ai. El checkpoint se deriva del oficial `zai-org/GLM-5.2` (revisión `cf457fa734ab149ffef225f80893eb38c6ff5cdc`), pero reduce drásticamente su tamaño: de 78 capas decoder pasa a 10, y de 256 expertos enrutados a 16, conservando la anchura y la geometría MLA/DSA del donante. El resultado es un modelo de 8.763.269.232 parámetros (según los tensores safetensors) que sirve como lado de entrenador en un par de prueba junto con un futuro checkpoint FP8 de solo rollout.

La relevancia de este repositorio es puramente técnica: permite probar herramientas de cirugía de modelos, selección determinista de expertos, y la sincronización entre versiones BF16 y FP8 sin necesidad de cargar el modelo completo. No está pensado para ejecutar inferencia ni para evaluar calidad de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención MLA/DSA, basada en GLM-5.2, reducida a 10 capas decoder y 16 expertos enrutados |
| Parametros totales | 8.763.269.232 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo es BF16; se menciona un futuro checkpoint FP8 separado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura general de GLM-5.2, que emplea un diseño de Mezcla de Expertos (MoE) con atención de tipo MLA (Multi-head Latent Attention) y DSA (Dynamic Sparse Attention). Sin embargo, se ha sometido a una "cirugía" que reduce el número de capas decoder de 78 a 10 y el número de expertos enrutados de 256 a 16, manteniendo la anchura del modelo original. La selección de expertos se realiza de forma independiente para cada capa MoE mediante un recorrido determinista de coseno-maximin sobre las filas del router del donante, y la procedencia de cada capa y experto queda registrada en el archivo `surgery_manifest.json`.

No se proporciona información sobre entrenamiento adicional, datos utilizados o procesos de alineación (RLHF/DPO). Este checkpoint es un artefacto de prueba para validar la integración de LoRA, la sincronización de pesos y el sharding, no un modelo entrenado para tareas específicas.

## Capacidades

- No es un modelo funcional para generación de texto, razonamiento, código o matemáticas.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- Su única función es servir como banco de pruebas para herramientas de post-entrenamiento, LoRA, weight-sync y sharding.
- Permite verificar la correcta reducción de capas y expertos, y la reproducibilidad de la selección de expertos mediante el manifiesto de cirugía.

## Casos de uso

- Validación de pipelines de LoRA: el checkpoint permite probar la aplicación de adaptadores LoRA sobre una versión reducida de GLM-5.2, verificando que la integración funciona antes de escalar al modelo completo.
- Pruebas de sincronización de pesos (weight-sync): al ser el lado BF16 de un par con un futuro checkpoint FP8, sirve para comprobar que los pesos se sincronizan correctamente entre ambas precisiones.
- Desarrollo de herramientas de sharding: su tamaño reducido (8.7B parámetros) facilita probar estrategias de particionado de tensores en entornos con múltiples GPUs sin necesidad de cargar el modelo original de mayor tamaño.
- Verificación de la selección determinista de expertos: el `surgery_manifest.json` permite auditar que los expertos seleccionados coinciden con los del donante, útil para depurar algoritmos de poda.
- Integración en CI/CD de modelos: puede usarse como artefacto de prueba en pipelines automatizados que validen la compatibilidad de formatos, metadatos y estructura de tensores.
- Investigación sobre cirugía de modelos: sirve como caso de estudio para comparar la reducción de capas y expertos en diferentes arquitecturas (por ejemplo, frente al `GLM-5.3-Flash-9B-Surgery-Dummy`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no está diseñado para tareas de generación y no se han evaluado métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Dado el tamaño de 8.763.269.232 parámetros en BF16, el checkpoint ocupa aproximadamente 17.5 GB en disco (tamaño del repositorio). Para cargarlo en memoria se necesitaría al menos 17.5 GB de VRAM, aunque en la práctica se requeriría algo más para activaciones y overhead.
- Una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A10G) podría alojar el modelo en BF16, pero no se ha verificado.
- Para pruebas de sharding o LoRA, se recomienda un entorno con múltiples GPUs (por ejemplo, 2x A100 40GB o similares).
- Opciones de despliegue: al ser un checkpoint de prueba, no se recomienda su uso con vLLM, llama.cpp u Ollama. Está pensado para entornos de desarrollo con bibliotecas como Hugging Face Transformers o frameworks de entrenamiento personalizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas decoder | Expertos enrutados | Propósito |
|---|---|---|---|---|
| GLM-5.2-9B-LoRA-Surgery-Dummy (este) | 8.763.269.232 | 10 (de 78) | 16 (de 256) | Pruebas de LoRA, weight-sync y sharding |
| GLM-5.3-Flash-9B-Surgery-Dummy | 8.895.622.684 | 10 (de 45) | 32 (de 288) | Pruebas similares sobre GLM-5.3-Flash |

Ambos son checkpoints de cirugía del mismo autor, con reducciones diferentes según la arquitectura donante. No se dispone de datos de rendimiento ni de licencia para ninguno de los dos.

## Limitaciones y advertencias

- No es un modelo utilizable para chat, generación de texto ni ninguna tarea de inferencia real.
- No se especifica licencia, por lo que su uso comercial o redistribución es incierto.
- No hay información sobre el dataset de entrenamiento ni sobre posibles sesgos; al ser un artefacto de prueba, no se han evaluado riesgos de alucinación o toxicidad.
- La reducción de capas y expertos puede alterar significativamente el comportamiento del modelo original, por lo que no debe usarse como sustituto de GLM-5.2.
- El checkpoint está pensado exclusivamente para entornos de desarrollo y pruebas de integración; no se garantiza estabilidad ni soporte.
- La fecha de creación (2026-09-01) es posterior a la fecha actual, lo que sugiere que el repositorio podría ser experimental o tener metadatos incorrectos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/imvladikon/GLM-5.2-9B-LoRA-Surgery-Dummy
- Modelo donante oficial: https://huggingface.co/zai-org/GLM-5.2
- Checkpoint similar (GLM-5.3-Flash-9B-Surgery-Dummy): https://huggingface.co/imvladikon/GLM-5.3-Flash-9B-Surgery-Dummy
