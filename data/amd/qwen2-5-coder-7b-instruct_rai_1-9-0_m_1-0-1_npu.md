# amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_m_1.0.1_npu` es una distribución del modelo Qwen2.5-Coder-7B-Instruct de Alibaba, adaptada y empaquetada por AMD para su ejecución sobre las NPU (unidades de procesamiento neuronal) de los procesadores AMD Ryzen AI, dentro del ecosistema Ryzen AI Software (RAI) en su versión 1.9.0. El identificador incluye la etiqueta `m_1.0.1_npu`, que corresponde a la versión del modelo compilado para NPU dentro de ese stack. No se trata de un modelo entrenado desde cero por AMD, sino de una conversión y optimización del modelo original de Qwen para el hardware de aceleración de IA integrado en los SoC Ryzen.

Qwen2.5-Coder-7B-Instruct es un modelo de lenguaje especializado en código, con 7.000 millones de parámetros, basado en la arquitectura transformer de Qwen2.5. Está afinado para instrucciones y cubre generación de código, razonamiento sobre código, reparación de errores y matemáticas. La versión de AMD mantiene la licencia Apache 2.0 del original y se distribuye en formato ONNX, lo que permite su despliegue sobre la NPU mediante las herramientas de Ryzen AI en lugar de requerir una GPU dedicada.

La relevancia de esta ficha radica en que ejemplifica la tendencia a llevar modelos de código de tamaño medio a la inferencia local sobre hardware de PC con NPU integrada, reduciendo la dependencia de GPUs y de servicios en la nube. El repositorio es de acceso restringido (gated) y, en el momento de la consulta, no registra descargas ni likes, lo que sugiere una publicación reciente o de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-7B-Instruct), compilado a ONNX para NPU Ryzen AI |
| Parámetros totales | 7.000 millones (7B, según el nombre del modelo base) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens, dato no confirmado para esta conversión) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | inglés (etiqueta `en` del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (etiqueta `onnx`; tamaño del repo 5,3 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-7B-Instruct: un transformer decoder-only con atención por causalidad, entrenado por Alibaba sobre un corpus extenso de código y texto, con un proceso de preentrenamiento seguido de ajuste por instrucciones. AMD no aporta información en la ficha del repositorio sobre el proceso de conversión, el número de tokens de entrenamiento ni la composición del dataset; esos datos corresponden al modelo original y no se detallan aquí para no atribuir a esta distribución características no verificadas.

La innovación técnica de esta distribución es el empaquetado para Ryzen AI: la conversión a ONNX y la compilación para la NPU del SoC, integrada en el flujo RAI 1.9.0. Esto permite ejecutar el modelo sobre la unidad neuronal de los procesadores Ryzen AI en lugar de una GPU discreta. No se dispone de información sobre técnicas adicionales como decodificación especulativa, atención lineal o cuantización específica aplicada en esta conversión.

## Capacidades

- Generación de texto y de código en inglés, heredadas del modelo base Qwen2.5-Coder-7B-Instruct.
- Razonamiento sobre código: explicación, refactorización y corrección de fragmentos.
- Generación de código para múltiples lenguajes de programación (capacidad del modelo base; no se detalla la lista en la información disponible).
- Razonamiento matemático y resolución de problemas paso a paso (capacidad del modelo base).
- Conversación multi-turno con formato de instrucciones (etiqueta `conversational`).
- Ejecución sobre NPU Ryzen AI mediante el stack Ryzen AI Software 1.9.0.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es `text-generation`.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en el IDE local: el modelo puede autocompletar y explicar fragmentos de código ejecutándose sobre la NPU del portátil, sin enviar el código a un servicio externo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Revisión de código en pipelines de integración continua: integrado mediante ONNX Runtime sobre hardware Ryzen AI, puede generar sugerencias de corrección en fases de pre-commit, aunque su contexto limitado exige trocear los ficheros grandes.
- Generación de tests unitarios: dado un módulo, el modelo produce casos de prueba en inglés y en el lenguaje del código, aprovechando su especialización en código.
- Documentación técnica automatizada: generación de docstrings y comentarios a partir de firmas de funciones, con la ventaja de ejecutarse en local sobre el PC del desarrollador.
- Soporte a la formación en programación: explicación de errores y ejemplos de código en un asistente de escritorio que funciona sin conexión a internet.
- Prototipado de agentes de código en el borde: al ejecutarse en la NPU, permite experimentar con flujos de agente de varios pasos en un portátil Ryzen AI sin GPU dedicada, siempre que se gestionen manualmente las llamadas a herramientas.
- Traducción y explicación de fragmentos de código entre lenguajes: uso del modelo como apoyo en migraciones puntuales, con revisión humana obligatoria por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI compatibles con Ryzen AI Software 1.9.0; no se especifican los modelos de SoC exactos en la información proporcionada.
- VRAM estimada para inferencia en GPU: no disponible para esta conversión ONNX; el tamaño del repositorio es de 5,3 GB, lo que da una referencia del espacio en disco necesario.
- GPU recomendadas: no aplica directamente, al ser una distribución para NPU; para el modelo base en GPU se requeriría al menos una GPU con 16 GB de VRAM en FP16, dato no confirmado en la información disponible.
- Compatibilidad con GPU de consumo: no disponible para esta conversión; el modelo base de 7B en cuantización de 4 bits cabría en GPUs de consumo con 8 GB, pero no se ha verificado para este paquete.
- Opciones de despliegue: Ryzen AI Software (RAI) 1.9.0 con ONNX Runtime; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_m_1.0.1_npu | 7B | no disponible | Apache 2.0 | ONNX para NPU Ryzen AI | Conversión de AMD, acceso restringido |
| Qwen2.5-Coder-7B-Instruct (original) | 7B | 32.768 tokens (según documentación del modelo base) | Apache 2.0 | safetensors, GGUF | Modelo de referencia de Alibaba, acceso abierto |
| DeepSeek-Coder-6.7B-Instruct | 6,7B | 16.384 tokens (según documentación del modelo) | Licencia propia de DeepSeek | safetensors, GGUF | Alternativa especializada en código de tamaño similar |
| CodeLlama-7B-Instruct | 7B | 16.384 tokens (según documentación del modelo) | Licencia Llama 2 | safetensors, GGUF | Modelo de Meta para código, licencia más restrictiva |

Los datos de contexto y licencia de los modelos comparables provienen de su documentación pública y no de la información proporcionada en esta ficha; se incluyen como referencia de categoría.

## Limitaciones y advertencias

- El repositorio está marcado como de acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.
- Solo se declara soporte de inglés; el rendimiento en castellano no está verificado y probablemente sea inferior al del inglés.
- Al ser una conversión para NPU, puede presentar diferencias de comportamiento respecto al modelo original en precisión numérica y en la gestión del contexto.
- No se dispone de información sobre cuantización aplicada, lo que impide estimar la pérdida de calidad frente al modelo en FP16.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B, especialmente en APIs inexistentes o fragmentos de código inventados; se requiere revisión humana en producción.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del corpus de entrenamiento del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse que la conversión de AMD no añada términos adicionales en el repositorio gated.
- Dependencia del stack Ryzen AI 1.9.0 y de hardware AMD compatible; no es portable a otros aceleradores sin reconversión.
- Sin descargas ni validación comunitaria registrada en el momento de la consulta, lo que reduce la evidencia empírica sobre su funcionamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Documentación de Ryzen AI Software: https://ryzenai.docs.amd.com/
- Repositorio de Ryzen AI en GitHub: https://github.com/amd/RyzenAI-SW
