# amd/Llama-3.2-1B_rai_1.9.0_npu

## Resumen

El modelo `amd/Llama-3.2-1B_rai_1.9.0_npu` es una distribucion optimizada de Llama 3.2 1B publicada por AMD para su plataforma Ryzen AI, orientada a la ejecucion en la NPU (unidad de procesamiento neuronal) integrada en los procesadores Ryzen AI de ultima generacion. Se distribuye en formato ONNX y emplea el toolkit Quark de AMD para la cuantizacion y el empaquetado del modelo, de modo que pueda desplegarse a traves del stack Ryzen AI (RAI) en su version 1.9.0.

El modelo base es Llama 3.2 1B, un transformer denso de aproximadamente 1.230 millones de parametros desarrollado por Meta, disenado para generacion de texto ligera y despliegue en el borde. La aportacion de AMD consiste en el pipeline de conversion y optimizacion para NPU, que permite ejecutar inferencia de un LLM de este tamano en hardware de PC con aceleracion dedicada, sin depender exclusivamente de la GPU o la CPU.

Su relevancia actual radica en que ejemplifica el movimiento hacia la inferencia local en NPU para asistentes y aplicaciones de escritorio con requisitos de latencia y consumo bajos. El repositorio es de acceso restringido (gated) y esta etiquetado unicamente para ingles, con licencia Llama 3.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 1B), exportado a ONNX y optimizado para NPU Ryzen AI |
| Parametros totales | Aproximadamente 1.230 millones (modelo base Llama 3.2 1B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Cuantizacion mediante el toolkit Quark de AMD; niveles concretos no disponibles |
| Idiomas soportados | Ingles (segun metadatos del repositorio) |
| Licencia | Llama 3.2 (Llama 3.2 Community License) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |
| Tamano del repositorio | 2,0 GB |
| Toolkit de despliegue | Ryzen AI (RAI) 1.9.0 |
| Acceso | Restringido (gated) en Hugging Face |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B: un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y normalizacion RMSNorm, entrenado por Meta sobre un corpus multilingue con etapas de ajuste supervisado y optimizacion por preferencias. AMD no aporta informacion en la ficha del repositorio sobre el proceso de entrenamiento del modelo base ni sobre datos adicionales; la contribucion de AMD se limita a la conversion a ONNX y a la optimizacion para NPU mediante Quark y el stack Ryzen AI.

La innovacion tecnica relevante no esta en el entrenamiento sino en el despliegue: el modelo se empaqueta para ejecutarse en la NPU de los procesadores Ryzen AI, lo que implica graficos ONNX especificos, cuantizacion adaptada al hardware y una integracion con el runtime RAI 1.9.0. No se dispone de detalles publicos sobre el esquema de cuantizacion exacto, el numero de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles: redaccion, resumen, reescritura y respuesta a preguntas.
- Razonamiento basico y tareas de comprension lectora propias de un modelo de 1B.
- Generacion de codigo sencillo y explicaciones de fragmentos cortos.
- Aritmetica y problemas matematicos de baja complejidad.
- Ejecucion en NPU Ryzen AI con el runtime RAI 1.9.0, orientada a inferencia local de baja latencia.
- Capacidades multilingues limitadas: los metadatos solo declaran ingles.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistentes de escritorio locales: integracion en aplicaciones Windows sobre Ryzen AI para generacion de texto sin conexion, aprovechando la NPU para reducir consumo y liberar CPU y GPU.
- Autocompletado y redaccion asistida en editores: el modelo puede sugerir frases y párrafos en ingles con latencia baja al ejecutarse en NPU.
- Resumen de documentos cortos: procesamiento de notas, correos y articulos en local, adecuado por el tamano reducido del modelo y su despliegue en hardware de PC.
- Clasificacion y extraccion de informacion: etiquetado de textos, deteccion de intenciones o extraccion de entidades en pipelines locales de bajo coste.
- Prototipado de aplicaciones de IA en el borde: validacion de flujos de inferencia en NPU antes de escalar a modelos mayores o a servidores.
- Educacion y demos tecnicas: ejemplo practico de despliegue de un LLM en Ryzen AI para talleres y pruebas de concepto sobre aceleracion neuronal.
- Chatbot de soporte basico en ingles: respuestas a preguntas frecuentes en entornos sin conectividad, con la limitacion de contexto y calidad propias de un modelo de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrada, en combinacion con el stack Ryzen AI 1.9.0.
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU y en memoria del sistema. El repositorio ocupa 2,0 GB, lo que da una idea del espacio en disco necesario.
- GPU dedicada: no es necesaria para el flujo previsto; el modelo esta optimizado para NPU.
- Compatibilidad con GPU de consumo: no documentada en la informacion disponible.
- Despliegue: mediante el runtime Ryzen AI (RAI) 1.9.0 y el formato ONNX generado con Quark. No se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Llama-3.2-1B_rai_1.9.0_npu | ~1,23B | No disponible | ONNX para NPU Ryzen AI | Llama 3.2 | Optimizado por AMD para NPU; acceso restringido |
| Llama 3.2 1B (Meta) | ~1,23B | 128K (segun ficha oficial de Meta) | Safetensors, GGUF via comunidad | Llama 3.2 | Modelo base, despliegue general en GPU/CPU |
| Qwen2.5 1.5B | ~1,5B | 32K (segun ficha oficial) | Safetensors, GGUF | Apache 2.0 | Alternativa abierta con licencia permisiva |
| Gemma 2 2B | ~2,6B | 8K (segun ficha oficial) | Safetensors, GGUF | Gemma Terms | Mayor tamano, requiere mas recursos |

La comparativa se limita a datos publicos de los modelos base; no se dispone de mediciones de rendimiento del paquete de AMD frente a estas alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar las condiciones en Hugging Face.
- Idioma: los metadatos solo declaran ingles; el rendimiento en castellano no esta garantizado.
- Modelo de 1B: capacidad limitada de razonamiento, conocimiento factual y coherencia en contextos largos en comparacion con modelos mayores.
- Riesgo de alucinacion inherente a los LLM de este tamano, especialmente en preguntas factuales y matematicas.
- Dependencia de hardware: el formato ONNX optimizado esta pensado para NPU Ryzen AI; su uso en otras plataformas no esta documentado.
- Licencia Llama 3.2: incluye restricciones de uso comercial y requisitos de atribucion; es necesario revisar los terminos antes de un despliegue en produccion.
- Falta de informacion sobre contexto maximo, esquema de cuantizacion y calidad tras la optimizacion, lo que dificulta evaluar el impacto en precision frente al modelo original.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Llama-3.2-1B_rai_1.9.0_npu
- Modelo base Llama 3.2 1B (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B
- Documentacion de Ryzen AI: https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- Toolkit Quark de AMD: https://quark.amd.com/
