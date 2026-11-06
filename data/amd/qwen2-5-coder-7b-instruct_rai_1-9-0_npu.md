# amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_npu

## Resumen

El modelo `amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_npu` es una distribucion del modelo Qwen2.5-Coder-7B-Instruct de Alibaba, publicada por AMD y optimizada para ejecutarse en las NPU (unidades de procesamiento neuronal) de los procesadores AMD Ryzen AI mediante el stack Ryzen AI Software 1.9.0. Se trata de una conversion a formato ONNX con cuantizacion Quark, pensada para inferencia local acelerada por hardware en equipos con arquitectura XDNA/XDNA2, no para servidores GPU convencionales.

El modelo base es un transformer decoder-only de 7.600 millones de parametros especializado en generacion de codigo, con soporte de instrucciones conversacionales. Esta version mantiene las capacidades del original pero cambia el formato de pesos: en lugar de safetensors, emplea grafos ONNX adaptados al compilador de Ryzen AI, lo que limita su portabilidad a otros runtimes.

Su relevancia radica en que permite desplegar un modelo de codigo de 7B en PC con NPU integrada sin GPU dedicada, con consumo energetico reducido. La licencia Apache 2.0 y el acceso restringido (gated) son factores a considerar antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), convertido a ONNX |
| Parametros totales | 7,6 mil millones (heredado del modelo base Qwen2.5-Coder-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta hasta 32.768 tokens, dato no confirmado para esta conversion) |
| Tipos de cuantizacion | cuantizacion Quark para NPU Ryzen AI (niveles exactos no disponibles) |
| Idiomas soportados | ingles (segun la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI 1.9.0) |
| Tamano del repositorio | 8,9 GB |
| Tags | onnx, qwen2, amd, ryzenai, npu, text-generation, conversational, quark |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo Qwen2.5-Coder-7B-Instruct de Alibaba, un transformer decoder-only con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado por el equipo de Qwen sobre grandes volumenes de codigo y datos de instrucciones. AMD no ha publicado detalles adicionales sobre el proceso de entrenamiento en la informacion disponible; la contribucion de AMD se limita a la conversion y optimizacion del modelo para su stack NPU.

La innovacion tecnica de esta version es la compilacion a ONNX con cuantizacion Quark para las NPU Ryzen AI (arquitecturas XDNA y XDNA2). Esto permite ejecutar inferencia en el acelerador neuronal integrado del procesador, delegando el trabajo a un motor de bajo consumo. No se han documentado en la ficha tecnicas adicionales como decodificacion especulativa o atencion lineal especificas de esta conversion.

## Capacidades

- Generacion de texto y codigo en lenguajes de programacion habituales (Python, JavaScript, C++, Java, etc.), heredadas del modelo base Qwen2.5-Coder.
- Razonamiento sobre codigo: explicacion, refactorizacion, depuracion y generacion de tests.
- Formato conversacional de instrucciones (chat), apto para dialogos multi-turno.
- Soporte de tool calling / function calling segun el modelo base (no confirmado de forma explicita para esta conversion ONNX).
- Capacidades matematicas y de razonamiento logico derivadas del entrenamiento del modelo original.
- Ejecucion acelerada en NPU Ryzen AI, con menor consumo energetico que una GPU dedicada.
- Idiomas: la ficha declara solo ingles; el modelo base es multilingue, pero esta conversion no lo garantiza.

## Casos de uso

- Asistente de codigo local en portatiles con Ryzen AI: el modelo se ejecuta en la NPU integrada, permitiendo autocompletado y explicacion de codigo sin GPU dedicada ni conexion a la nube, con consumo energetico contenido.
- Generacion de tests unitarios en pipelines de desarrollo: se puede invocar desde un IDE o script local para producir casos de prueba a partir de funciones existentes, aprovechando el conocimiento de lenguajes del modelo base.
- Refactorizacion y revision de codigo en entornos con requisitos de privacidad: al ejecutarse en local sobre la NPU, el codigo fuente no sale del equipo, lo que encaja en entornos regulados.
- Chatbot de soporte tecnico para desarrolladores: el formato instruct permite conversaciones multi-turno para resolver dudas de API o errores de compilacion.
- Educacion y formacion en programacion: el modelo puede explicar fragmentos de codigo y proponer ejercicios en un equipo de sobremesa con NPU, sin coste de API.
- Prototipado de agentes de codigo en el borde (edge): combinado con herramientas locales, puede orquestar tareas de edicion de ficheros y ejecucion de comandos en un flujo multi-paso.
- Traduccion de pseudocodigo o descripciones en lenguaje natural a implementaciones en un lenguaje concreto, integrado en un editor local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de Hugging Face no incluye metricas de MMLU, HumanEval, GSM8K ni latencias de inferencia para esta conversion ONNX en NPU.

## Requisitos de hardware

- NPU AMD Ryzen AI (arquitecturas XDNA / XDNA2) con el stack Ryzen AI Software 1.9.0 instalado; es el requisito principal y excluyente.
- El repositorio ocupa 8,9 GB, por lo que se recomienda al menos 16 GB de RAM/VRAM unificada en el equipo; la memoria concreta reservada a la NPU no esta disponible.
- No esta pensado para GPU NVIDIA/AMD convencionales: el formato ONNX con cuantizacion Quark esta adaptado al compilador de Ryzen AI.
- Opciones de despliegue: runtime de Ryzen AI (ONNX Runtime con el execution provider de NPU); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_npu | 7,6 B | no disponible | ONNX (Quark) | Apache 2.0 | Inferencia en NPU Ryzen AI |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens (modelo base) | safetensors | Apache 2.0 | GPU/CPU generico |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (MoE, 2,4 B activos) | 128 K | safetensors | DeepSeek License | Codigo, mayor contexto |
| CodeLlama-7B-Instruct | 7 B | 16 K | safetensors/GGUF | Llama 2 License | Codigo, ecosistema amplio |

La diferencia clave de la version de AMD frente a las alternativas es el formato ONNX optimizado para NPU, que sacrifica portabilidad por eficiencia energetica en hardware Ryzen AI.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que puede complicar la automatizacion de despliegues.
- Dependencia de hardware: solo funciona sobre NPU Ryzen AI con el stack 1.9.0; no es portable a GPU ni a otros runtimes sin reconversion.
- Idiomas: la ficha declara unicamente ingles; el rendimiento en castellano no esta garantizado en esta conversion.
- Riesgo de alucinacion inherente a los modelos de 7B, especialmente en codigo de APIs poco comunes o recientes.
- Sesgos: no documentados en la informacion disponible, pero heredados del modelo base y de sus datos de entrenamiento.
- Contexto: la longitud de contexto efectiva de esta conversion ONNX no se especifica; no asumir los 32.768 tokens del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones adicionales del acceso gated de AMD.
- Sin benchmarks publicados para esta version, por lo que el rendimiento real en NPU debe validarse en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Qwen2.5-Coder-7B-Instruct_rai_1.9.0_npu
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Ryzen AI Software: no disponible en la informacion proporcionada
- Paper o blog de AMD sobre esta conversion: no disponible en la informacion proporcionada
