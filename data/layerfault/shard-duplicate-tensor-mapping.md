# LayerFault/shard-duplicate-tensor-mapping

## Resumen

`LayerFault/shard-duplicate-tensor-mapping` es un artefacto sintético de prueba de seguridad, no un modelo de IA utilizable. Forma parte del corpus LayerFault, un conjunto de datos diseñado para validar escáneres de seguridad de modelos y repositorios de HuggingFace. Su propósito es ejercitar reglas de detección relacionadas con el mapeo duplicado de tensores en shards (archivos fragmentados de pesos), simulando características adversarias como opcodes de pickle sospechosos, contrabando de formatos ejecutables o cadenas de inyección de prompts.

El repositorio contiene únicamente un tensor de 16 parámetros en formato safetensors, sin arquitectura definida, sin pipeline y sin idiomas. La model card lo declara explícitamente como un "artefacto de prueba de seguridad" que no debe cargarse ni ejecutarse fuera de un entorno aislado de pruebas de escáner. Fue creado el 21 de agosto de 2026 por el autor LayerFault, con licencia Apache-2.0 y acceso restringido (gated auto).

Su relevancia no radica en capacidades de IA, sino en servir como caso de control positivo para herramientas de análisis estático y detección de vulnerabilidades en el ecosistema de modelos de código abierto. Permite evaluar si un escáner identifica correctamente la duplicación de tensores entre shards, un problema estructural que puede causar degradación silenciosa o errores de carga en frameworks de inferencia como Transformers o vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de prueba, no es un modelo) |
| Parametros totales | 16 (según safetensors) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (contenido sintético de prueba) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. No existe arquitectura transformer, MoE, SSM ni híbrida. El repositorio contiene un tensor sintético de 16 parámetros que simula un shard con duplicación de tensores para activar reglas de detección en escáneres de seguridad. No hay datos de entrenamiento, ni proceso de RLHF o DPO. La innovación técnica, si acaso, reside en el diseño de características adversas deliberadas (opcodes sospechosos, formatos ejecutables, inyección de prompts) que sirven como control para validar herramientas de escaneo.

## Capacidades

- No tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No es un agente ni tiene razonamiento multi-step.
- No es multilingüe.
- Su única "capacidad" es servir como caso de prueba para detectar duplicación de tensores en shards, mediante la inspección estática de metadatos y estructura de archivos.

## Casos de uso

- Validación de escáneres de seguridad: se usa como entrada para probar que un detector de HuggingFace o herramientas como Layerfault identifican correctamente el mapeo duplicado de tensores en shards.
- Control positivo en pipelines de admisión de modelos: permite verificar que el escáner no produce falsos negativos en este tipo de ataque estructural.
- Pruebas de robustez de herramientas de análisis estático: sirve para evaluar si un analizador de metadatos de safetensors detecta inconsistencias en el número de tensores o en las referencias entre shards.
- Investigación en seguridad de modelos: se utiliza como ejemplo de artefacto malicioso en entornos de investigación sobre ataques a modelos de IA.
- Desarrollo de reglas de detección: permite ajustar umbrales de severidad (en este caso, WARN) y clasificaciones de dificultad (intermediate) para sistemas de admisión de modelos.
- Evaluación de integración con frameworks de carga: aunque no debe cargarse en producción, puede usarse en pruebas de que un cargador de safetensors detecta y rechaza archivos con duplicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al ser un artefacto de prueba, no tiene métricas de rendimiento de IA (MMLU, HumanEval, GSM8K, etc.). La información disponible solo indica que la severidad esperada es "medium", la dificultad "intermediate" y la decisión de admisión esperada "WARN", según la clasificación de Layerfault.

## Requisitos de hardware

- No requiere hardware de inferencia, ya que no es un modelo ejecutable.
- No aplica VRAM, GPU recomendadas ni opciones de despliegue como vLLM, llama.cpp, Ollama o TGI.
- La única ejecución posible es la de un escáner de seguridad estático que procese el archivo safetensors sin cargarlo en un framework de inferencia.
- No hay latencia ni throughput asociados.

## Comparativa con modelos similares

No se dispone de modelos comparables. Este repositorio es un artefacto de prueba de seguridad, no un modelo de IA, por lo que no tiene equivalentes en la categoría de modelos de lenguaje o visión. Se puede mencionar que existen otros artefactos del corpus LayerFault, pero no se dispone de sus características específicas.

## Limitaciones y advertencias

- No es un modelo funcional; no debe usarse para ninguna tarea de IA.
- Contiene características adversas deliberadas (opcodes de pickle sospechosos, formatos ejecutables, strings de inyección de prompts) que pueden desencadenar comportamientos no deseados si se carga fuera de un entorno aislado.
- La model card advierte explícitamente que no debe cargarse ni ejecutarse en producción.
- No tiene sesgos conocidos, pero su propósito es ejercitar detección de seguridad, por lo que su uso indebido podría causar falsos positivos en sistemas de análisis.
- Licencia Apache-2.0 permite uso comercial, pero su naturaleza de artefacto de prueba limita su aplicabilidad a entornos de investigación y validación de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LayerFault/shard-duplicate-tensor-mapping
- GitHub de Layerfault (herramienta de análisis): https://github.com/izm1chael/layerfault
- Referencia adicional sobre duplicación de shards en Flax (ejemplo similar): https://huggingface.co/pragnyanramtha/flax-duplicate-shard-shadow-poc
- Discusión sobre reordenamiento de tensores y sharding en vLLM: https://github.com/vllm-project/vllm/issues/53192
- Guía de conversión de formatos de LLM con validación de tensor mapping: https://www.oh-bug.com/posts/llm-model-conversion-production-tensor-mapping-qkv-reordering-layer-wise-validation/
- Documentación de paralelismo de tensores y FSDP: https://lightning.ai/docs/pytorch/stable/advanced/model_parallel/tp_fsdp.html
