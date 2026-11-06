# amd/phi-4_rai_1.9.0_m_1.0.1_npu

## Resumen

Phi-4 es un modelo de lenguaje de Microsoft Research, distribuido en este caso por AMD en un formato optimizado para su plataforma Ryzen AI. Esta ficha concreta corresponde a la variante `amd/phi-4_rai_1.9.0_m_1.0.1_npu`, una compilación en ONNX preparada para ejecutarse sobre la NPU (unidad de procesamiento neuronal) integrada en los procesadores AMD Ryzen AI, mediante la versión 1.9.0 del runtime RAI y el perfil de modelo 1.0.1. No se trata de un modelo nuevo, sino de una conversión del Phi-4 original orientada a inferencia local en hardware de consumo.

El modelo base Phi-4 es un transformer denso de aproximadamente 14.700 millones de parámetros, entrenado por Microsoft con un enfoque intensivo en datos sintéticos de alta calidad y razonamiento. Esta distribución de AMD no modifica los pesos en términos de capacidades, sino que los empaqueta para aprovechar la aceleración por NPU en equipos con chips de la familia Ryzen AI, lo que permite inferencia local con bajo consumo energético sin depender de una GPU dedicada.

Su relevancia radica en que democratiza el despliegue de un modelo de razonamiento de tamaño medio en portátiles y mini-PC con hardware AMD reciente. El repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face antes de la descarga, y su licencia es la del Phi-4 original (MIT para el modelo base, con matices en esta distribución; ver limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), empaquetado en ONNX para NPU Ryzen AI |
| Parametros totales | 14.700 millones (modelo base Phi-4) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (modelo base Phi-4) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (formato ONNX precompilado para NPU) |
| Idiomas soportados | Ingles (segun metadatos del repo) |
| Licencia | Other (heredada del Phi-4 original; requiere aceptar condiciones) |
| Formato de pesos | ONNX (compilado para NPU Ryzen AI, perfil m_1.0.1_npu) |

## Arquitectura y entrenamiento

El modelo base Phi-4 es un transformer decoder-only denso de 14.700 millones de parámetros con atención multi-cabeza estándar y una ventana de contexto de 16.384 tokens. Microsoft lo entrenó con un énfasis notable en calidad de datos: una mezcla de datos web filtrados, libros, código y, sobre todo, datos sintéticos generados y curados para fomentar el razonamiento matemático y lógico. El entrenamiento incluyó fases de ajuste supervisado y optimización de preferencias (DPO), orientadas a mejorar la utilidad y la seguridad de las respuestas.

Esta distribución de AMD no aporta información pública sobre el proceso de conversión más allá de los metadatos del repositorio. Se sabe que el paquete está compilado con el runtime Ryzen AI 1.9.0 y el perfil de modelo 1.0.1 para NPU, lo que implica una grafo ONNX optimizado y posiblemente cuantizado para las unidades matriciales de la NPU. No se detallan en la información disponible ni el esquema de cuantización exacto ni las capas aceleradas.

## Capacidades

- Generación de texto conversacional en inglés con calidad de modelo de 14B.
- Razonamiento matemático y lógico, punto fuerte del Phi-4 original (entrenado con datos sintéticos de razonamiento).
- Generación y comprensión de código en lenguajes habituales.
- Respuestas multi-turno dentro de la ventana de contexto de 16K tokens.
- Soporte de tool calling y function calling heredado del modelo base (no confirmado explícitamente en esta distribución ONNX).
- Capacidades de razonamiento multi-paso y agentes, limitadas por el contexto de 16K.
- Multilingüe limitado: los metadatos del repo indican solo inglés, aunque el modelo base tiene cierta competencia en otros idiomas.
- No incluye visión, audio ni modo "thinking" explícito.

## Casos de uso

- Asistente local en portátiles Ryzen AI: el modelo se ejecuta en la NPU sin GPU dedicada, permitiendo un asistente conversacional privado con consumo energético reducido y sin enviar datos a la nube.
- Generación de código en el editor: integrado en extensiones de IDE que aprovechan la NPU para autocompletado y explicación de código, liberando la CPU y la GPU para otras tareas.
- Procesamiento de documentos largos: con 16K tokens de contexto puede resumir contratos, informes o artículos de investigación en local, útil en entornos con requisitos de confidencialidad.
- Tutoría y explicación matemática: el entrenamiento del Phi-4 en razonamiento permite usarlo como asistente educativo que resuelve y explica problemas paso a paso.
- Automatización de atención al cliente en el dispositivo: conversaciones multi-turno con contexto suficiente para gestionar incidencias sencillas sin latencia de red.
- Prototipado de agentes con tool calling: en pipelines de automatización locales donde el modelo decide qué función invocar (consultas a bases de datos, APIs internas) sin salir del equipo.
- Análisis de logs y texto técnico: clasificación y extracción de información de registros o documentación en máquinas de desarrollo con hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta distribución concreta. El modelo base Phi-4 reporta resultados conocidos en MMLU, GSM8K, HumanEval y MATH en la documentación de Microsoft, pero no se incluyen en la información proporcionada ni se confirman para la variante ONNX/NPU.

## Requisitos de hardware

- NPU AMD Ryzen AI compatible con el runtime RAI 1.9.0 y el perfil m_1.0.1_npu (familias Ryzen AI 300 y posteriores, según compatibilidad oficial de AMD; no detallada en el repo).
- El repositorio ocupa 9,8 GB, lo que sugiere pesos en precisión reducida (probablemente INT8 o similar) para NPU; no se especifica.
- No requiere GPU dedicada: el objetivo es ejecución en NPU integrada.
- No está pensado para vLLM, llama.cpp, Ollama ni TGI; el despliegue se realiza mediante el stack Ryzen AI (ONNX Runtime con el execution provider de NPU).
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Memoria del sistema: se recomienda al menos 16 GB de RAM para cargar el modelo junto con el sistema operativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4 (Microsoft, original) | 14,7B | 16K | Safetensors, GPU/CPU | MIT | Hugging Face público |
| Esta variante (AMD) | 14,7B | 16K | ONNX para NPU Ryzen AI | Other (gated) | Hugging Face con acceso restringido |
| Qwen2.5-14B | 14,7B | 32K | Safetensors, GGUF | Apache 2.0 | Hugging Face público |
| Llama 3.1 8B | 8B | 128K | Safetensors, GGUF | Llama 3.1 Community | Hugging Face público |

La ventaja de esta variante es la aceleración por NPU en hardware AMD de consumo; su desventaja es el ecosistema cerrado (solo Ryzen AI), la licencia restrictiva y el acceso gated. Frente a Qwen2.5-14B o Llama 3.1 8B, ofrece menor contexto y menor flexibilidad de despliegue, pero un consumo energético potencialmente mejor en portátiles AMD.

## Limitaciones y advertencias

- Licencia "other" heredada del Phi-4 original con condiciones adicionales de AMD; es imprescindible revisar los términos antes de uso comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede retrasar la descarga o impedirla en entornos automatizados.
- Solo inglés según los metadatos; el rendimiento en castellano no está garantizado.
- Contexto limitado a 16K tokens, inferior a alternativas contemporáneas de 32K o 128K.
- Dependencia total del stack Ryzen AI y de la NPU; no es portable a GPU NVIDIA ni a CPU genérica sin reconversión.
- Riesgo de alucinación inherente a los modelos de 14B, especialmente en dominios especializados.
- Sesgos presentes en los datos de entrenamiento del modelo base (web, libros, sintéticos), no auditados en esta distribución.
- No se documentan en el repo ni la cuantización exacta ni las capas aceleradas, lo que dificulta estimar el rendimiento real.
- Fecha de creación del repo (2026-10-30) y ausencia de descargas/likes indican un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/phi-4_rai_1.9.0_m_1.0.1_npu
- Modelo base Phi-4 (Microsoft): no disponible en la información proporcionada
- Documentación de Ryzen AI: no disponible en la información proporcionada
- Paper de Phi-4: no disponible en la información proporcionada
