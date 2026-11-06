# amd/Mistral-7B-Instruct-v0.1_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Mistral-7B-Instruct-v0.1_rai_1.9.0_m_1.0.1_npu` es una conversión optimizada de Mistral-7B-Instruct-v0.1 publicada por AMD para su ejecución sobre la plataforma Ryzen AI, concretamente sobre la NPU (unidad de procesamiento neuronal) integrada en los procesadores AMD Ryzen AI. Se distribuye en formato ONNX y lleva en el nombre la versión del runtime de Ryzen AI (`rai_1.9.0`) y la versión del modelo compilado (`m_1.0.1_npu`), lo que indica que es un artefacto listo para desplegarse con el stack de inferencia de AMD, no un modelo entrenado desde cero.

El modelo base, Mistral-7B-Instruct-v0.1, es un transformer decoder-only de 7.300 millones de parámetros desarrollado por Mistral AI y ajustado con instrucciones, con una longitud de contexto de 8.192 tokens y licencia Apache 2.0. Esta conversión de AMD conserva los pesos y el comportamiento del modelo original, pero los empaqueta para aprovechar la aceleración por hardware de las NPU de Ryzen AI, lo que permite ejecutar generación de texto en portátiles y equipos de sobremesa con dicha plataforma sin depender exclusivamente de la GPU.

La relevancia de esta ficha es principalmente práctica: es un ejemplo de cómo los grandes modelos abiertos se están adaptando a aceleradores de bajo consumo integrados en PC. El repositorio está restringido (gated), requiere aceptar condiciones en Hugging Face y, según los metadatos, no registra descargas ni likes, lo que sugiere una publicación reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral-7B-Instruct-v0.1), exportado a ONNX para Ryzen AI |
| Parametros totales | 7.300 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (modelo base; no se especifica variación en la conversión) |
| Tipos de cuantizacion | no disponible (el repo ocupa 4,4 GB, lo que sugiere pesos de baja precisión, pero no se detalla el esquema) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (compilado para NPU de Ryzen AI) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.1: un transformer decoder-only con atención de ventana deslizante (sliding window attention) de 4.096 tokens y contexto total de 8.192 tokens, 32 capas, dimensión oculta de 4.096 y atención multi-cabeza con 32 cabezas de consulta y 8 de clave/valor (GQA). El modelo base fue preentrenado por Mistral AI sobre datos web y ajustado posteriormente con instrucciones; no se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento ni de la composición del dataset.

La contribución de AMD en este repositorio no es de entrenamiento sino de compilación y empaquetado: los pesos se convierten a ONNX y se compilan para el runtime Ryzen AI 1.9.0, con un artefacto etiquetado como `m_1.0.1_npu`. No se documentan en la información disponible procesos de RLHF, DPO ni innovaciones algorítmicas adicionales más allá de las propias del modelo base (GQA y sliding window attention). Tampoco se especifica el esquema de cuantización aplicado durante la compilación.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones, heredadas de Mistral-7B-Instruct-v0.1.
- Razonamiento de propósito general y respuesta a preguntas.
- Generación de código y tareas básicas de programación, propias del modelo base.
- Razonamiento matemático elemental y resolución de problemas paso a paso.
- Capacidad multilingüe limitada: los metadatos declaran únicamente inglés (`en`).
- No se documenta soporte de tool calling o function calling en esta conversión.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá de lo que ofrece el prompt de instrucciones.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).
- Ejecución acelerada sobre NPU de Ryzen AI mediante el runtime propietario de AMD.

## Casos de uso

- Asistente conversacional local en portátiles con Ryzen AI: el modelo puede gestionar diálogos multi-turno en inglés sobre la NPU integrada, liberando la GPU y reduciendo el consumo energético en comparación con la inferencia en CPU o GPU dedicada.
- Generación de texto en aplicaciones de escritorio: integrable en editores, clientes de correo o herramientas ofimáticas que necesiten resúmenes y redacción asistida sin conexión a la nube, aprovechando los 8.192 tokens de contexto del modelo base.
- Prototipado de chatbots en entornos sin GPU: al ejecutarse en NPU, permite desplegar un asistente de 7B en equipos de sobremesa o portátiles sin tarjeta gráfica dedicada, útil para demos y pruebas de concepto.
- Automatización de tareas de soporte en inglés: respuestas a preguntas frecuentes y clasificación de consultas con contexto de conversación moderadamente largo, siempre que el despliegue se realice sobre hardware Ryzen AI compatible.
- Educación y experimentación con IA en el borde: investigadores y estudiantes pueden estudiar el comportamiento de un modelo de 7B ajustado a instrucciones en un acelerador de bajo consumo, comparando latencia y precisión frente a ejecuciones en CPU.
- Generación de código asistida en IDE local: el modelo base tiene capacidades de programación básicas que, ejecutadas en local, permiten autocompletado y explicación de fragmentos sin enviar código a servicios externos, con la limitación del idioma inglés y de la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma objetivo: procesadores AMD Ryzen AI con NPU integrada y runtime Ryzen AI 1.9.0 (el nombre del artefacto indica `m_1.0.1_npu`).
- VRAM estimada: no disponible; al ejecutarse en NPU no requiere VRAM de GPU dedicada, pero sí memoria del sistema compartida. El tamaño del repositorio es de 4,4 GB, lo que da una cota inferior aproximada del espacio en disco necesario.
- GPU recomendadas: no aplica para la ruta NPU; para ejecutar el modelo base Mistral-7B-Instruct-v0.1 en GPU se requieren al menos 16 GB de VRAM en FP16 (A100, H100, RTX 4090, RTX A6000) o menos con cuantización.
- ¿Cabe en GPU de consumo? El modelo base sí cabe en GPUs de consumo con 16 GB o más (RTX 4080, RTX 4090) en FP16, y en GPUs de 8-12 GB con cuantización de 4 bits; esta conversión concreta está pensada para NPU, no para GPU.
- Opciones de despliegue: runtime Ryzen AI de AMD con soporte ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Mistral-7B-Instruct-v0.1_rai_1.9.0_m_1.0.1_npu | 7,3B | 8.192 | ONNX (NPU Ryzen AI) | Apache 2.0 | Conversión de AMD para NPU; gated; solo inglés |
| mistralai/Mistral-7B-Instruct-v0.1 | 7,3B | 8.192 | safetensors | Apache 2.0 | Modelo base original; ejecutable en GPU/CPU con múltiples runtimes |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,3B | 32.768 | safetensors | Apache 2.0 | Versión posterior con contexto ampliado a 32K |
| meta-llama/Llama-2-7b-chat-hf | 6,7B | 4.096 | safetensors | Llama 2 (uso comercial con restricciones) | Alternativa de tamaño similar, contexto menor y licencia más restrictiva |

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del corpus de preentrenamiento de Mistral-7B-Instruct-v0.1, no documentados en esta conversión.
- Riesgo de alucinación: presente como en cualquier modelo de 7B; no se han publicado evaluaciones específicas para esta conversión.
- Idioma: los metadatos declaran únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior.
- Contexto: la ventana de 8.192 tokens corresponde al modelo base y no se especifica si la compilación para NPU la preserva íntegramente.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face; conviene revisar los términos adicionales de AMD y del runtime Ryzen AI, que es software propietario.
- Dependencia de hardware: el artefacto está compilado para la NPU de Ryzen AI con la versión 1.9.0 del runtime; no es portable a otras plataformas sin reconversión.
- Madurez: cero descargas y cero likes en el momento de la consulta, y fechas de creación y actualización muy próximas; se trata de una publicación de nicho sin validación comunitaria documentada.
- Producción: al no haber benchmarks ni documentación de latencia, no se recomienda su uso en producción sin una evaluación previa en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Mistral-7B-Instruct-v0.1_rai_1.9.0_m_1.0.1_npu
- Modelo base en Hugging Face: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Documentación de Ryzen AI: https://ryzenai.docs.amd.com/
