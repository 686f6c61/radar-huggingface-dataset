# amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

Este repositorio contiene una compilación optimizada del modelo Qwen-2.5 1.5B Instruct para su ejecución sobre las unidades de procesamiento neuronal (NPU) integradas en los procesadores AMD Ryzen AI. Lo publica AMD bajo el identificador `amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_m_1.0.1_npu`, donde `rai` hace referencia al stack Ryzen AI y `m_1.0.1_npu` indica la versión del motor de ejecución y el destino de hardware. El modelo base es Qwen-2.5 1.5B Instruct, desarrollado por Alibaba Cloud, un transformer decoder-only denso de 1.5 mil millones de parámetros.

El problema que resuelve esta compilación es la ejecución local de un LLM conversacional sobre hardware de PC con aceleración NPU, sin depender de GPU dedicada. AMD distribuye los pesos en formato ONNX, listos para el runtime de Ryzen AI, lo que permite integrar generación de texto en aplicaciones de escritorio y portátiles con bajo consumo energético.

Es relevante ahora porque el ecosistema de inferencia en NPU para PC está madurando: Ryzen AI 300 y las plataformas sucesoras incluyen NPUs con decenas de TOPS, y contar con un modelo instruct de 1.5B compilado oficialmente por el fabricante facilita prototipos de asistentes locales, resumen y clasificación sin salir del dispositivo. La ficha se basa únicamente en la información disponible en HuggingFace; los detalles de entrenamiento del modelo base no se incluyen en esta fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen-2.5 1.5B Instruct); pesos compilados en ONNX para NPU Ryzen AI |
| Parametros totales | 1.5 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repositorio pesa 1.5 GB, lo que sugiere pesos de baja precision respecto al modelo original en BF16 |
| Idiomas soportados | Ingles (segun la etiqueta del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 1.5B parametros de la familia Qwen-2.5 Instruct, orientado a instrucciones y conversacion. Esta publicacion no describe el proceso de entrenamiento del modelo base; la informacion disponible se limita a los artefactos de compilacion para el stack Ryzen AI 1.9.0 y el motor `m_1.0.1_npu`.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el despliegue: los pesos se empaquetan en ONNX y se compilan para ejecutarse en la NPU de los procesadores AMD Ryzen AI, con un runtime especifico por version de stack. Esto implica que la compatibilidad esta ligada a la version de Ryzen AI indicada en el nombre del repositorio y al motor NPU `m_1.0.1`. No se detalla en la informacion disponible si se aplicaron tecnicas adicionales como decodificacion especulativa o cuantizacion especifica.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, heredadas del modelo base Qwen-2.5 1.5B Instruct.
- Ejecucion en NPU Ryzen AI mediante el runtime ONNX de AMD, con el objetivo de reducir consumo y liberar CPU/GPU.
- Integracion en aplicaciones locales a traves del stack Ryzen AI (no se documenta en esta fuente la API concreta).
- Capacidades de razonamiento y codigo del modelo base no verificadas en esta publicacion; dependen de la fidelidad de la compilacion.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada para esta compilacion.
- Capacidades multilingues: la etiqueta del repositorio indica solo ingles, aunque el modelo base Qwen-2.5 soporta mas idiomas; no se confirma su conservacion tras la compilacion.

## Casos de uso

- Asistentes de escritorio locales: integrar un modelo instruct de 1.5B en aplicaciones de Windows sobre Ryzen AI para resumir, reescribir y responder consultas sin enviar datos a la nube.
- Procesamiento de texto en portatiles con NPU: clasificacion, extraccion de entidades y generacion de borradores ejecutados en la NPU para preservar la bateria frente a inferencia en CPU.
- Prototipado de aplicaciones edge con ONNX: usar el repositorio como referencia de compilacion y despliegue en NPU para validar pipelines antes de escalar a modelos mayores.
- Filtrado y moderacion local de contenido: ejecutar un modelo ligero que clasifique o reescriba texto en el dispositivo, manteniendo la privacidad de los datos del usuario.
- Generacion de respuestas en herramientas ofimaticas: autocompletado y redaccion asistida en ingles dentro de suites de productividad que aprovechen la NPU.
- Evaluacion comparativa de hardware: medir throughput y latencia de un LLM de 1.5B en NPU Ryzen AI frente a CPU y GPU integrada en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI, con el stack Ryzen AI 1.9.0 y el motor `m_1.0.1_npu` indicados en el nombre del repositorio.
- VRAM: no aplica en el sentido de GPU dedicada; la inferencia se ejecuta en la NPU. No se especifica el consumo de memoria del sistema requerido.
- GPU dedicadas: no son el destino de esta compilacion; no se documenta soporte para A100, H100 o RTX 4090.
- GPU de consumo: no aplica; el modelo esta compilado para NPU, no para CUDA.
- Despliegue: runtime ONNX de Ryzen AI. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI en esta publicacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_m_1.0.1_npu | 1.5B | No disponible | ONNX (NPU Ryzen AI) | Apache 2.0 | Gated en HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1.5B | No disponible en esta fuente | Safetensors, GGUF (comunidad) | Apache 2.0 | Publico |
| Otros modelos instruct de ~1.5B (p. ej. familias Llama o Gemma de tamano similar) | ~1-2B | No disponible en esta fuente | Safetensors, GGUF | Varía segun modelo | Publico |

La comparativa se limita a parametros, formato y licencia porque no hay datos de rendimiento publicados para esta compilacion. La diferencia clave frente al modelo base es el formato ONNX y el destino NPU, no la capacidad del modelo.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargarlo.
- Compatibilidad ligada a version: el nombre del repositorio fija Ryzen AI 1.9.0 y el motor `m_1.0.1_npu`; otras versiones del stack pueden no ser compatibles.
- Idiomas: la etiqueta indica solo ingles; el uso en castellano no esta garantizado por esta publicacion.
- Capacidades del modelo base: al ser un modelo de 1.5B, el riesgo de alucinacion y los errores en razonamiento complejo o matematicas son mayores que en modelos de mayor tamano.
- Sesgos: no se documentan en la informacion disponible; se heredan los del modelo base Qwen-2.5 y sus datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de acceso del repositorio gated y los terminos del stack Ryzen AI.
- Sin benchmarks: no hay datos publicados de calidad o rendimiento tras la compilacion, por lo que la fidelidad respecto al modelo base no esta verificada.
- Contexto: la longitud de contexto soportada por esta compilacion no se indica; no asumir la del modelo base sin verificacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Qwen-2.5_1.5B_Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base Qwen-2.5 1.5B Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Stack AMD Ryzen AI (referencia del runtime): https://github.com/amd/RyzenAI-SW
