# amd/DeepSeek-R1-Distill-Qwen-1.5B_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/DeepSeek-R1-Distill-Qwen-1.5B_rai_1.9.0_m_1.0.1_npu` es una distribucion del modelo DeepSeek-R1-Distill-Qwen-1.5B, publicada por AMD en Hugging Face y optimizada para su ejecucion en las NPU (unidades de procesamiento neuronal) de los procesadores AMD Ryzen AI mediante el stack RAI (Ryzen AI). Se trata de una destilacion del modelo de razonamiento DeepSeek-R1 sobre la base Qwen2.5-1.5B, empaquetada en formato ONNX con el sufijo `m_1.0.1_npu`, que identifica la version del modelo compilado y su destino de hardware.

El modelo original DeepSeek-R1-Distill-Qwen-1.5B, desarrollado por DeepSeek, esta disenado para tareas de razonamiento paso a paso, matematicas y generacion de codigo, con un enfoque en cadenas de pensamiento explicitas. Esta variante de AMD no anade capacidades nuevas al modelo base, sino que lo adapta para inferencia local en hardware de PC con NPU integrada, lo que permite ejecutar un modelo de razonamiento de 1.5B parametros sin depender de una GPU dedicada.

La relevancia de esta ficha radica en que ejemplifica la tendencia de despliegue de modelos open source en hardware de consumo con aceleracion NPU, un segmento en crecimiento para asistentes locales, herramientas de desarrollo y aplicaciones de privacidad. El acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (destilado de DeepSeek-R1 sobre base Qwen2.5-1.5B) |
| Parametros totales | 1.5B (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | ONNX (compilado para NPU Ryzen AI, stack RAI 1.9.0, modelo m_1.0.1) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer decoder-only de la familia Qwen2.5 con aproximadamente 1.5 mil millones de parametros, sobre el que DeepSeek aplico un proceso de destilacion a partir de su modelo de razonamiento DeepSeek-R1. El objetivo de la destilacion es transferir patrones de razonamiento (cadenas de pensamiento, verificacion de pasos, resolucion de problemas matematicos y de codigo) a un modelo mucho mas pequeno, manteniendo un coste de inferencia bajo.

La variante publicada por AMD no documenta en la informacion disponible detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron fases de RLHF o DPO. Lo que si es especifico de esta distribucion es el proceso de empaquetado: el modelo se exporta a ONNX y se compila para el runtime RAI 1.9.0 con el perfil `m_1.0.1_npu`, orientado a la NPU de los procesadores Ryzen AI. No se dispone de informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en esta version.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento paso a paso con cadenas de pensamiento explicitas, heredado de la destilacion de DeepSeek-R1.
- Resolucion de problemas matematicos de nivel medio.
- Generacion y explicacion de codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al razonamiento encadenado del modelo base; no se documenta integracion con frameworks de agentes.
- Capacidades multilingues: limitadas al ingles segun los tags del repositorio.
- Capacidades especiales: ejecucion en NPU AMD Ryzen AI mediante ONNX y el stack RAI; no se documentan vision ni audio.

## Casos de uso

- Asistente local de razonamiento en PC con Ryzen AI: el modelo se ejecuta en la NPU integrada, lo que permite un asistente que resuelve problemas matematicos y explica pasos sin enviar datos a la nube, adecuado para entornos con requisitos de privacidad.
- Tutoria educativa de matematicas: el modelo puede descomponer problemas en pasos intermedios y explicar el razonamiento, util en aplicaciones de aprendizaje offline en portatiles con NPU.
- Generacion de codigo en editores locales: integrado como autocompletado o generador de fragmentos en IDE, aprovechando el bajo consumo de la NPU frente a la CPU.
- Prototipado de pipelines de razonamiento: util para desarrolladores que quieren validar flujos de chain-of-thought en hardware de consumo antes de escalar a modelos mayores.
- Automatizacion de tareas de analisis textual en ingles: resumen, extraccion de conclusiones y respuesta a preguntas sobre documentos cortos, con inferencia local.
- Demos y pruebas de integracion del stack RAI: sirve como referencia para equipos que evaluan el despliegue de modelos ONNX en Ryzen AI y necesitan un ejemplo funcional de 1.5B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse en NPU, el consumo depende de la memoria del sistema compartida y del perfil de compilacion RAI.
- GPU recomendadas: no aplica para esta variante; el destino es la NPU de procesadores AMD Ryzen AI compatibles con RAI 1.9.0.
- Cabe en consumer GPU: no disponible; el modelo esta empaquetado para NPU, no para CUDA.
- Opciones de despliegue: runtime RAI de AMD sobre ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / destino | Disponibilidad |
|---|---|---|---|---|---|
| amd/DeepSeek-R1-Distill-Qwen-1.5B_rai_1.9.0_m_1.0.1_npu | 1.5B | no disponible | MIT | ONNX para NPU Ryzen AI | Gated en Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1.5B | no disponible en esta ficha | MIT | safetensors | Publico en Hugging Face |
| Qwen2.5-1.5B | 1.5B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Publico en Hugging Face |

La comparativa se limita a parametros y licencia porque no se dispone de datos de rendimiento ni de contexto en la informacion proporcionada.

## Limitaciones y advertencias

- El acceso al repositorio esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- El modelo esta orientado exclusivamente al ingles segun los tags; el rendimiento en castellano no esta garantizado.
- Al ser una destilacion de 1.5B parametros, la capacidad de razonamiento es inferior a la de modelos mayores de la familia DeepSeek-R1; puede producir cadenas de pensamiento plausibles pero incorrectas.
- Riesgo de alucinacion en hechos, citas y calculos complejos, comun en modelos pequenos.
- La licencia MIT permite uso comercial, pero debe verificarse que las condiciones de acceso al repositorio gated no impongan restricciones adicionales.
- Dependencia del stack RAI 1.9.0 y de hardware Ryzen AI compatible; no es portable directamente a GPU o CPU sin reconversion.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/DeepSeek-R1-Distill-Qwen-1.5B_rai_1.9.0_m_1.0.1_npu
- Modelo base original (DeepSeek-R1-Distill-Qwen-1.5B): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentacion de Ryzen AI (AMD): no disponible en la informacion proporcionada.
