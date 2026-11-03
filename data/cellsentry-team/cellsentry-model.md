# cellsentry-team/cellsentry-model

## Resumen

CellSentry-model es un checkpoint generativo historico publicado por cellsentry-team, mantenido como artefacto de compatibilidad para descargas existentes y rollback. No es un modelo nuevo ni el modelo por defecto actual de la organizacion: la model card indica explicitamente que los clasificadores mmBERT en desarrollo se gestionan en repositorios separados con acceso restringido. El artefacto realmente alojado es un GGUF cuantizado Q4_K_M de 986.047.968 bytes (SHA256 `4ae17b3886e4a5089671bf16aa133eaa6d8917a118bde6c75a54c1c3610f7cd3`) que contiene pesos Qwen fusionados.

El modelo deriva de Qwen/Qwen2.5-1.5B, con 1.543.714.304 parametros totales segun los safetensors del repo, y esta orientado a tareas de generacion de texto en el dominio de hojas de calculo: revision de alertas de formulas, deteccion de PII y extraccion estructurada. Los tags incluyen `excel`, `spreadsheet`, `formula-audit`, `pii-detection` y `data-extraction`, ademas de `legacy-baseline` y `compatibility-artifact`.

Su relevancia actual es limitada y de naturaleza operativa: sirve para reproducir flujos locales antiguos que fijaron este artefacto concreto. La propia model card advierte de que no debe sustituirse un modelo configurado en una aplicacion solo cambiando una ruta de fichero, y de que el GGUF no es intercambiable con los checkpoints encoder-plus-head de mmBERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B); no disponible el detalle exacto de la fusion |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico artefacto publicado: `cellsentry-1.5b-v3-q4km.gguf`) |
| Idiomas soportados | en, zh |
| Licencia | MIT (metadatos heredados de Qwen2.5, con atribucion upstream) |
| Formato de pesos | GGUF (el repo declara safetensors por los parametros contados; no hay MLX checkpoint ni adaptador LoRA en el inventario actual) |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo es un checkpoint generativo multi-tarea derivado de Qwen2.5-1.5B, con pesos fusionados (merged) para inferencia. No se detalla en la model card actual la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF, DPO o SFT especificas; la descripcion historica de entrenamiento se remite al README de la revision fija `f980626974cd1722ea516ef3caacf598d17a64b4`, que no forma parte de la informacion proporcionada.

Las tareas historicas declaradas son tres y con protocolos y evaluacion distintos entre si: revision de alertas de formula, deteccion de PII y extraccion estructurada. El uso previsto es mediante un runtime compatible con llama.cpp y el protocolo ChatML/JSON de Qwen que espere la aplicacion llamante. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Revision de alertas de formulas en hojas de calculo (formula-audit), segun los tags y la descripcion del autor.
- Deteccion de PII en el contexto de flujos de hojas de calculo.
- Extraccion estructurada de datos con salida en JSON bajo el protocolo esperado por la aplicacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Rollback de flujos locales heredados: restaurar el artefacto fijado (`cellsentry-1.5b-v3-q4km.gguf`) en entornos que dependen de este checkpoint concreto y verificar el SHA256 antes de desplegar.
- Reproducibilidad de evaluaciones historicas: ejecutar de nuevo los protocolos de formula-alert review, PII detection y structured extraction sobre el mismo binario para comparar resultados con registros anteriores.
- Auditoria de formulas en pipelines internos de hojas de calculo: el modelo puede revisar alertas de formula generadas por otras herramientas y producir una salida textual o JSON, siempre que la aplicacion implemente el protocolo ChatML/JSON de Qwen.
- Deteccion de PII en textos extraidos de hojas de calculo: util como componente de un flujo de preprocesado, con la advertencia de que la model card no garantiza recall general de PII.
- Extraccion estructurada de campos: conversion de contenido tabular o textual a JSON para ingestas posteriores, validando la salida con esquemas propios.
- Pruebas de compatibilidad de runtimes llama.cpp: banco de pruebas para validar versiones del runtime y del parser de protocolo antes de migrar a otros modelos.
- Referencia de comparacion frente a los nuevos clasificadores mmBERT: linea base historica para medir diferencias de comportamiento, sin asumir equivalencia entre artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa 986.047.968 bytes (aproximadamente 0,92 GiB) en disco; la VRAM necesaria es del mismo orden mas el overhead de contexto y del runtime, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo es apto para GPU de consumo con suficiente memoria libre.
- Cabe en GPU de consumo: si, dado el tamano del artefacto cuantizado; no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (runtime indicado por el autor). vLLM, TGI u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cellsentry-model | 1.543.714.304 | no disponible | MIT | GGUF Q4_K_M | Checkpoint historico multi-tarea para hojas de calculo |
| Qwen/Qwen2.5-1.5B | 1.5B (clase) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors y otros | Modelo base declarado del que deriva |
| Clasificadores mmBERT de cellsentry-team | no disponible | no disponible | no disponible | no disponible | Repositorios separados con acceso restringido; no intercambiables con este GGUF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto historico de compatibilidad, no un modelo por defecto ni una version validada para produccion nueva.
- La model card advierte explicitamente de que las descripciones historicas de entrenamiento no constituyen validacion nueva, recall general de PII ni garantia de precision en produccion.
- No es intercambiable con los checkpoints mmBERT encoder-plus-head; sustituir ficheros o rutas no equivale a migrar de modelo.
- Solo se declaran los idiomas ingles y chino; el rendimiento en castellano no esta documentado.
- No hay MLX checkpoint ni adaptador LoRA en el inventario actual del repositorio, pese a menciones antiguas a un MLX "proximamente".
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables por herencia del modelo base generativo.
- La licencia MIT se mantiene con atribucion upstream a Qwen; la limpieza del repositorio no relicencia ni reentrena el modelo.
- El repositorio mezcla metadatos de safetensors con un unico artefacto GGUF; conviene verificar el SHA256 del fichero descargado antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cellsentry-team/cellsentry-model
- Model card historica (revision fija): https://huggingface.co/cellsentry-team/cellsentry-model/blob/f980626974cd1722ea516ef3caacf598d17a64b4/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
