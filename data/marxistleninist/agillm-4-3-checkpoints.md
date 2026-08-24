# MarxistLeninist/AGILLM-4.3-checkpoints

## Resumen

AGILLM-4.3-checkpoints es un repositorio de respaldo de puntos de control (checkpoints) del modelo AGILLM-4.3, creado por el usuario MarxistLeninist. Este repositorio surge como continuación del repositorio principal AGILLM-4.3, que alcanzó el límite de 20.000 archivos de Hugging Face el 2026-08-20 y quedó congelado como archivo, con los checkpoints terminando en el paso 2141734. El repositorio actual mantiene los checkpoints de promoción para servir y las copias de seguridad periódicas de un entrenamiento en curso denominado `live400B`.

Según la información disponible en los repositorios de GitHub asociados, AGILLM 4.3 es un warm start de AGILLM 4.2 que incorpora expertos MoE compartidos y entrenamiento con bloques de difusión (DiffusionBlocks). El tamaño total del repositorio es de 52,8 GB, lo que sugiere que contiene múltiples versiones de pesos del modelo en diferentes etapas de entrenamiento. No se dispone de detalles sobre la arquitectura completa, el número de parámetros ni las capacidades finales del modelo en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se menciona MoE con expertos compartidos y DiffusionBlocks en repositorios GitHub asociados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | checkpoints en formato no especificado (block-sharded-zstd para backups de entrenamiento) |

## Arquitectura y entrenamiento

La informacion disponible en los repositorios de GitHub indica que AGILLM 4.3 es un warm start de AGILLM 4.2, lo que implica que el entrenamiento se inicia desde los pesos del modelo anterior. Se mencionan dos innovaciones tecnicas principales: expertos MoE compartidos (shared MoE experts) y bloques de difusion (DiffusionBlocks) en la arquitectura. El repositorio de checkpoints incluye dos tipos de datos: los checkpoints promovidos para servir (en formato `checkpoints/stepN_YYYYMMDD/`) y las copias de seguridad periodicas del entrenamiento en curso `live400B` (con formato `stepN_TIMESTAMP/`), que incluyen el checkpoint en formato block-sharded-zstd, el tokenizador y el estado de ejecucion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni otros detalles de entrenamiento. La ausencia de una model card detallada en el repositorio principal de Hugging Face limita el acceso a estos datos.

## Capacidades

- No se han publicado capacidades especificas del modelo en la informacion disponible.
- Se menciona la existencia de un runtime de compatibilidad denominado `agillm41.py`, que sugiere compatibilidad con la version 4.1, pero no se detallan las funcionalidades.
- Existe un repositorio experimental (AGILLM-4.3-EGGROLL-Experimental) que anade un sidecar de estrategia evolutiva estilo EGGROLL para los routers MoE discretos top-1, manteniendo el camino de backpropagation y entrenamiento con DiffusionBlocks. Esto sugiere que el modelo soporta routers MoE discretos, pero no hay detalles sobre tool calling, agentes, vision, audio u otras capacidades.

## Casos de uso

No es posible enumerar casos de uso concretos con rigor sin conocer las capacidades reales del modelo. La informacion disponible no incluye datos sobre rendimiento en tareas de generacion de texto, codigo, razonamiento o multilingues. Se recomienda consultar el repositorio principal AGILLM-4.3 o la documentacion oficial del proyecto para obtener especificaciones completas antes de considerar su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye una model card con datos de evaluacion, y no se mencionan resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar en las fuentes consultadas.

## Requisitos de hardware

- No se dispone de datos sobre VRAM estimada para inferencia.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- El tamaño del repositorio (52,8 GB) sugiere que los checkpoints son de gran tamano, pero no se puede estimar el hardware necesario sin conocer el numero de parametros.
- No hay informacion sobre latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria porque no se dispone de informacion suficiente sobre el tamano, arquitectura o rendimiento de AGILLM-4.3. Las alternativas de modelos MoE o de difusion de codigo abierto (por ejemplo, Mixtral o DeepSeek) no pueden compararse sin datos de referencia.

## Limitaciones y advertencias

- No se ha publicado una model card completa, lo que impide conocer los sesgos, riesgos de alucinacion o limitaciones de idioma del modelo.
- El repositorio es una coleccion de checkpoints intermedios de entrenamiento, no un modelo finalizado. Los checkpoints pueden no ser estables para inferencia y no se garantiza su calidad para uso en produccion.
- La licencia MIT permite uso comercial, pero no se conoce si el modelo cumple con requisitos legales o de atribucion de los datos de entrenamiento.
- El repositorio original alcanzo el limite de archivos de Hugging Face, lo que sugiere un volumen de datos considerable y una gestion compleja del ciclo de vida de los checkpoints.
- No se especifica si el modelo tiene un tokenizador compatible con frameworks populares, ni si los formatos de checkpoint son directamente cargables con librerias estandar como Transformers.

## Enlaces

- Repositorio Hugging Face de checkpoints: https://huggingface.co/MarxistLeninist/AGILLM-4.3-checkpoints
- Repositorio Hugging Face principal (archivado): https://huggingface.co/MarxistLeninist/AGILLM-4.3
- Repositorio GitHub AGILLM4.3: https://github.com/Marxist-Leninist/AGILLM4.3
- Repositorio GitHub experimental EGGROLL: https://github.com/Marxist-Leninist/AGILLM4.3-EGGROLL-Experimental
