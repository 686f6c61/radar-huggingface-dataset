# amd/Qwen3-8B_rai_1.9.0_npu

## Resumen

AMD/Qwen3-8B_rai_1.9.0_npu es una distribucion optimizada del modelo Qwen3-8B de Alibaba, publicada por AMD para su ejecucion sobre las NPU integradas en los procesadores AMD Ryzen AI (generacion Strix Point y posteriores). El modelo base Qwen3-8B es un transformer denso de 8.200 millones de parametros con soporte nativo de modo "thinking" y ventana de contexto de 32.768 tokens (extensible hasta 131.072 mediante YaRN), y esta distribuido aqui en formato ONNX cuantizado con el toolkit Quark de AMD para aprovechar el motor de inferencia Ryzen AI 1.9.0.

La relevancia de esta ficha radica en que traslada un LLM de 8B a hardware de consumo con NPU dedicada, sin depender de GPU discreta. El repositorio ocupa 9,6 GB y esta bajo acceso restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de descargarlo. La licencia del modelo base es Apache 2.0.

Es importante senalar que la informacion publica disponible en la ficha de HuggingFace es muy limitada: no se detallan las variantes exactas de cuantizacion, los benchmarks de rendimiento sobre NPU ni la composicion del dataset de calibracion. Esta ficha recoge lo verificable y marca explicitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), base Qwen3-8B |
| Parametros totales | 8.200 millones (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos; extensible a 131.072 con YaRN (segun modelo base) |
| Tipos de cuantizacion | no disponible (formato ONNX cuantizado con Quark; variantes exactas no publicadas) |
| Idiomas soportados | en (segun metadatos); el modelo base Qwen3 soporta multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |
| Tamano del repositorio | 9,6 GB |
| Acceso | Restringido (gated) en HuggingFace |
| Pipeline | text-generation |
| Toolkit de cuantizacion | AMD Quark |
| Runtime objetivo | Ryzen AI 1.9.0 (NPU) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer decoder-only denso de 8.200 millones de parametros desarrollado por el equipo Qwen de Alibaba. Qwen3 incorpora un modo de razonamiento explicito ("thinking mode") que puede activarse o desactivarse, y emplea atencion con RoPE y ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante interpolacion YaRN. El entrenamiento del modelo base combino preentrenamiento sobre un corpus multilingue a gran escala con fases de ajuste supervisado y optimizacion por preferencias (RLHF/DPO), aunque los detalles exactos de composicion del dataset no se reproducen en esta ficha por no constar en la informacion proporcionada.

La contribucion especifica de AMD en este repositorio no es el entrenamiento, sino la conversion y cuantizacion del modelo al formato ONNX mediante el toolkit Quark, con el objetivo de ejecutarlo sobre la NPU de los procesadores Ryzen AI a traves del runtime Ryzen AI 1.9.0. No se dispone de informacion publica sobre el esquema exacto de cuantizacion (por ejemplo, pesos INT8/INT4, precision de activaciones o calibracion), ni sobre posibles optimizaciones adicionales como decodificacion especulativa o fusion de operadores.

## Capacidades

- Generacion de texto conversacional y de proposito general en ingles.
- Razonamiento multi-paso con modo "thinking" (heredado de Qwen3), activable o desactivable segun el modelo base.
- Generacion de codigo y resolucion de problemas matematicos (capacidades del modelo base Qwen3-8B).
- Soporte de tool calling / function calling (capacidad del modelo base; no confirmada explicitamente en esta distribucion).
- Capacidades multilingues del modelo base Qwen3 (aunque los metadatos del repo declaran solo `en`).
- Ejecucion sobre NPU Ryzen AI, lo que permite inferencia en CPU/NPU sin GPU discreta.

## Casos de uso

- Asistentes locales en portatiles con Ryzen AI: el modelo se ejecuta sobre la NPU integrada, permitiendo un asistente conversacional sin GPU discreta ni conexion a la nube, con la ventaja de privacidad y bajo consumo energetico.
- Procesamiento de documentos largos en el dispositivo: gracias a los 32.768 tokens de contexto nativo, se pueden resumir o consultar contratos, informes o manuales tecnicos directamente en el portatil.
- Generacion de codigo en entornos de desarrollo locales: integrable en editores o scripts de automatizacion para autocompletado y explicacion de codigo, aprovechando la NPU para no penalizar la CPU.
- Chatbot de atencion al cliente en despliegues edge: al ejecutarse en hardware de consumo, permite desplegar atencion automatizada en kioscos o equipos sin infraestructura cloud.
- Prototipado e investigacion en eficiencia energetica: util para estudiar el rendimiento de LLMs de 8B sobre NPU frente a GPU en terminos de vatios por token.
- Automatizacion de tareas de texto en pipelines locales: clasificacion, extraccion de entidades o reescritura de contenido en flujos batch que se ejecutan en estaciones de trabajo con Ryzen AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI (generacion Strix Point y posteriores), con runtime Ryzen AI 1.9.0.
- VRAM estimada para inferencia: no disponible (el modelo se ejecuta sobre NPU, no sobre VRAM de GPU; el repositorio ocupa 9,6 GB en disco).
- GPU recomendadas: no aplica para esta distribucion; esta optimizada para NPU AMD.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible para esta variante ONNX; requeriria conversion a otro formato (GGUF, safetensors) para usar en GPU.
- Opciones de despliegue: runtime Ryzen AI 1.9.0 con el modelo ONNX; no se documenta soporte de vLLM, llama.cpp, Ollama o TGI para esta distribucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| AMD/Qwen3-8B_rai_1.9.0_npu | 8B | 32.768 (131.072 con YaRN) | ONNX (Quark) | Apache 2.0 | NPU Ryzen AI |
| Qwen/Qwen3-8B (original) | 8B | 32.768 (131.072 con YaRN) | safetensors | Apache 2.0 | GPU/CPU generico |
| Llama 3.1 8B | 8B | 131.072 | safetensors, GGUF | Llama 3.1 Community | GPU/CPU generico |
| Mistral 7B | 7B | 32.768 | safetensors, GGUF | Apache 2.0 | GPU/CPU generico |

La diferencia clave de esta distribucion frente al Qwen3-8B original es el formato ONNX cuantizado y la optimizacion para NPU Ryzen AI; en capacidades y parametros es equivalente al modelo base. No se dispone de datos de rendimiento comparativo para esta variante.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Idiomas: los metadatos declaran unicamente `en`; el uso en castellano no esta garantizado por esta distribucion, aunque el modelo base Qwen3 sea multilingue.
- Dependencia de hardware: esta optimizado para NPU Ryzen AI 1.9.0; no es directamente utilizable en GPU o CPU sin conversion de formato.
- Riesgo de alucinacion: inherente a los LLM de 8B, especialmente en tareas de hechos y matematicas complejas.
- Sesgos: no se documentan evaluaciones de sesgo especificas para esta distribucion; hereda los del modelo base.
- Cuantizacion: al ser una version cuantizada, puede haber una perdida de precision respecto al modelo original en tareas sensibles (razonamiento matematico, codigo).
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base Qwen3 y del runtime Ryzen AI por separado.
- Falta de documentacion: no se publican detalles de calibracion, benchmarks ni limitaciones especificas de esta variante.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen3-8B_rai_1.9.0_npu
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- AMD Quark (toolkit de cuantizacion): https://github.com/amd/quark
- Ryzen AI (documentacion AMD): https://www.amd.com/en/products/software/ryzen-ai.html
