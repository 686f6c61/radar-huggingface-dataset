# amd/Qwen3.6-35B_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Qwen3.6-35B_rai_1.9.0_m_1.0.1_npu` es una distribución optimizada del modelo Qwen3.6-35B preparada por AMD para su plataforma Ryzen AI. Se publica en formato ONNX y está etiquetado con el identificador `qwen3_5_moe`, lo que indica que se trata de una variante de arquitectura Mixture of Experts (MoE) de la familia Qwen3.5/3.6. El repositorio ocupa 23,5 GB, un tamaño compatible con pesos cuantizados para despliegue en hardware de consumo con NPU dedicada.

La relevancia de esta ficha radica en que no es un modelo entrenado desde cero por AMD, sino un artefacto de despliegue: un empaquetado ONNX afinado para el stack Ryzen AI (versión `rai_1.9.0`) y el runtime `m_1.0.1_npu`, pensado para ejecutar inferencia en las NPU integradas en los procesadores AMD Ryzen AI. El acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargarlo.

La información pública disponible es escasa: el repositorio no incluye datos de benchmarks, composición del dataset de entrenamiento ni especificaciones detalladas de contexto o cuantización más allá de las etiquetas. Esta ficha se limita, por tanto, a lo verificable y marca explícitamente como "no disponible" todo aquello que no puede confirmarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (etiqueta `qwen3_5_moe`); empaquetado ONNX para Ryzen AI |
| Parámetros totales | 35B (según el nombre del modelo; no confirmado en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo de 23,5 GB sugiere pesos comprimidos, pero no se especifica el esquema) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen3.5/3.6 con arquitectura MoE, según la etiqueta `qwen3_5_moe` del repositorio. AMD no documenta en la información disponible el número de parámetros activos por token, la distribución de expertos ni la longitud de contexto nativa del modelo base. Tampoco se detallan los datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF o DPO), que corresponden al modelo original de Qwen y no a este empaquetado.

La innovación técnica de esta distribución no está en el entrenamiento, sino en el pipeline de despliegue: conversión a ONNX y adaptación al runtime Ryzen AI (`rai_1.9.0`) con el objetivo `m_1.0.1_npu`, que permite ejecutar el modelo sobre la NPU integrada en los procesadores AMD Ryzen AI. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y matemáticas: capacidades heredadas del modelo base Qwen3.6-35B, no verificadas de forma independiente en esta distribución.
- Generación de código: presumible por la familia Qwen, sin datos específicos publicados para este artefacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Inferencia local en PCs con Ryzen AI: el formato ONNX y el runtime `m_1.0.1_npu` están diseñados para ejecutar el modelo sobre la NPU de portátiles y mini-PCs con procesadores AMD Ryzen AI, liberando la GPU y reduciendo el consumo energético.
- Asistentes conversacionales en el dispositivo: al estar empaquetado para hardware de consumo, permite desplegar un chatbot de 35B parámetros sin depender de la nube, útil en escenarios con requisitos de privacidad.
- Prototipado de aplicaciones edge con ONNX Runtime: el artefacto sirve como referencia para integrar modelos MoE grandes en pipelines ONNX sobre hardware AMD.
- Evaluación de rendimiento de NPU frente a GPU: permite comparar latencia y throughput del mismo modelo base ejecutado en NPU Ryzen AI frente a alternativas en GPU, para decisiones de arquitectura de despliegue.
- Procesamiento de texto en inglés en entornos de escritorio: resumen, redacción y extracción de información en aplicaciones locales donde no se requiere multilingüismo.
- Base para fine-tuning o adaptación posterior: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes, aunque el formato ONNX complica el reentrenamiento directo frente a safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 23,5 GB; se requiere al menos esa cantidad de memoria unificada o dedicada para cargar los pesos, más overhead del runtime.
- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrada, en combinación con el stack Ryzen AI (`rai_1.9.0`) y el runtime `m_1.0.1_npu`.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de este artefacto; el formato ONNX para NPU Ryzen AI no está pensado para ejecutarse en CUDA.
- ¿Cabe en GPU de consumo? No disponible para este empaquetado concreto; el modelo base de 35B en cuantización de 4 bits podría caber en GPUs con 24 GB, pero esta distribución está orientada a NPU.
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecución de Ryzen AI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Objetivo |
|---|---|---|---|---|---|
| amd/Qwen3.6-35B_rai_1.9.0_m_1.0.1_npu | 35B (MoE) | no disponible | ONNX | Apache 2.0 | NPU Ryzen AI |
| Qwen3.6-35B (modelo base) | 35B (MoE) | no disponible | safetensors | Apache 2.0 (presumible) | GPU/CPU genérico |
| Otras distribuciones ONNX de AMD para Ryzen AI | variable | no disponible | ONNX | variable | NPU Ryzen AI |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado ni documentado.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar calidad, latencia o throughput de forma objetiva.
- Acoplamiento al hardware: el artefacto está optimizado para NPU Ryzen AI con versiones concretas del stack (`rai_1.9.0`, `m_1.0.1_npu`); no es portable a otras plataformas sin reconversión.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos específicos de evaluación para esta distribución.
- Sesgos: no documentados en la información disponible; se heredan del modelo base Qwen.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen y de los pesos originales antes de producción.
- Formato ONNX: dificulta el fine-tuning directo y limita la integración con herramientas del ecosistema Hugging Face (Transformers, PEFT) sin conversión previa.
- Fecha de creación (2026-10-30) y cero descargas: artefacto reciente y sin validación comunitaria visible.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Qwen3.6-35B_rai_1.9.0_m_1.0.1_npu
- No se han encontrado en la información proporcionada otros enlaces (papers, blogs, repositorios o demos) asociados a este artefacto.
