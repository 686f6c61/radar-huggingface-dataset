# amd/gemma-4-e2b-it-mobius-int4_rai_1.9.0_m_1.0.1_npu

## Resumen

Este repositorio contiene una version cuantizada (INT4) de Gemma 3n E2B (instrucciones), preparada por AMD para su ejecucion en las NPU de los procesadores Ryzen AI mediante el software Ryzen AI Software (version RAI 1.9.0, paquete m_1.0.1_npu). El modelo original corresponde a la familia Gemma 3n de Google, una variante eficiente de Gemma 3 orientada a dispositivos de recursos limitados, con un tamano efectivo de unos 2 mil millones de parametros activos (E2B, "effective 2B").

El problema que resuelve esta publicacion es la ejecucion local de LLMs conversacionales en portatiles y equipos de sobremesa con NPU, evitando depender de la nube. El formato es ONNX, el pipeline es text-generation con caracter conversacional y el idioma principal es el ingles. Es relevante porque forma parte del ecosistema de modelos optimizados por AMD para Ryzen AI, y su acceso esta restringido (gated): es necesario aceptar las condiciones de la licencia Gemma en HuggingFace antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3n (transformer eficiente para edge), variante E2B instruct |
| Parametros totales | no disponible (la familia E2B ronda los 2 mil millones de parametros efectivos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (optimizada para NPU de Ryzen AI) |
| Idiomas soportados | Ingles (según tags del repositorio) |
| Licencia | Gemma (con acceso restringido/gated en HuggingFace) |
| Formato de pesos | ONNX (tamano del repositorio: 11,9 GB) |

## Arquitectura y entrenamiento

El modelo base, Gemma 3n E2B, es un transformer de la familia Gemma de Google disenado para despliegue en dispositivos con memoria limitada, empleando tecnicas de eficiencia que reducen la huella efectiva a unos 2 mil millones de parametros durante la inferencia. La version original es un modelo instruct, ajustado para seguir instrucciones y dialogo conversacional. Los detalles concretos del entrenamiento (tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion del repositorio.

Esta publicacion no altera la arquitectura del modelo base: AMD aplica una cuantizacion a INT4 y lo empaqueta en formato ONNX para su aceleracion mediante la NPU de los procesadores Ryzen AI, en el marco de Ryzen AI Software 1.9.0 (paquete m_1.0.1_npu). Los detalles tecnicos del proceso de cuantizacion (calibracion, esquema de pesos y activaciones) no estan disponibles.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tags conversational).
- Seguimiento de instrucciones (variante instruct, "-it").
- Optimizado para inferencia local en NPU de Ryzen AI mediante ONNX Runtime.
- Capacidades de razonamiento avanzado, codigo, matematicas o multimodalidad: no disponible en la informacion del repositorio (el modelo base Gemma 3n incorpora capacidades multimodales, pero no consta si estan habilitadas en esta version cuantizada).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes: no disponible.

## Casos de uso

- Asistentes conversacionales locales: ejecucion de chatbot en portatiles con Ryzen AI sin conexion a la nube, aprovechando la NPU para inferencia eficiente y con privacidad de los datos del usuario.
- Prototipado de aplicaciones edge: integracion en aplicaciones Windows mediante ONNX Runtime y Ryzen AI Software para validar experiencias de IA generativa en el cliente.
- Resumen y redaccion de textos en ingles: asistencia de escritura offline en equipos de oficina sin enviar informacion sensible a servicios externos.
- Clasificacion y extraccion de informacion en documentos: procesamiento local de texto en ingles con baja latencia gracias a la cuantizacion INT4.
- Demostraciones y pruebas de hardware: evaluacion del rendimiento de la NPU de Ryzen AI con un modelo de referencia mantenido por el propio fabricante.
- Integracion en software comercial empotrado: distribucion de una capacidad de LLM dentro de aplicaciones de escritorio, sujeto a los terminos de la licencia Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia, el rendimiento depende de la generacion concreta de NPU (Ryzen AI 300 series, etc.) y de la version de Ryzen AI Software empleada.

## Requisitos de hardware

- Procesador AMD Ryzen con NPU (Ryzen AI), compatible con Ryzen AI Software 1.9.0 (paquete m_1.0.1_npu).
- Espacio en disco: aproximadamente 11,9 GB para el repositorio completo.
- VRAM de NPU o memoria compartida estimada: no disponible, aunque un modelo INT4 de clase 2B suele ocupar del orden de 1,5-2,5 GB de pesos; el tamano del repositorio sugiere que se incluyen multiples ficheros o metadatos adicionales.
- Software necesario: Ryzen AI Software (RAI 1.9.0), ONNX Runtime con soporte de ejecucion en NPU (Vitis AI Execution Provider).
- No requiere GPU discreta: el despliegue objetivo es la NPU integrada; no consta compatibilidad con llama.cpp, Ollama, vLLM o TGI para este paquete ONNX especifico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Objetivo | Licencia |
|---|---|---|---|---|
| amd/gemma-4-e2b-it-mobius-int4 (este) | ~2B efectivos (E2B) | ONNX INT4 | NPU Ryzen AI | Gemma (gated) |
| google/gemma-3n-E2B-it | ~2B efectivos | safetensors | GPU/CPU general | Gemma (gated) |
| microsoft/Phi-3-mini-4k-instruct | 3,8B | safetensors / ONNX | CPU/GPU/NPU | MIT |

Comparado con el modelo original de Google, esta version de AMD ofrece la misma capacidad base pero empaquetada para NPU con cuantizacion INT4, a costa de una posible perdida de precision frente a los pesos originales. Frente a alternativas como Phi-3-mini, la principal diferencia es el ecosistema de despliegue: este modelo esta orientado exclusivamente a Ryzen AI Software.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones de la licencia Gemma en HuggingFace y, en su caso, cumplir los terminos de uso de Google para descargar el modelo.
- Licencia Gemma: impone restricciones de uso (prohibiciones de determinadas aplicaciones, requisitos de atribucion y politica de uso aceptable); no es una licencia plenamente permisiva como MIT o Apache 2.0. Revisar los terminos antes de uso comercial.
- Idioma: el repositorio indica soporte para ingles; el rendimiento en castellano u otros idiomas no esta verificado en la informacion disponible.
- Cuantizacion INT4: puede degradar la calidad de generacion respecto al modelo original en FP16/BF16, especialmente en razonamiento complejo o matematicas.
- Riesgo de alucinacion: inherente a los LLM; no consta que esta version incluya mitigaciones adicionales.
- Dependencia de ecosistema: requiere Ryzen AI Software 1.9.0 y hardware compatible; no es portable a otras plataformas NPU o GPUs sin conversion adicional.
- Sin benchmarks publicados: la calidad y el rendimiento reales deben validarse en el hardware de destino antes de pasar a produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amd/gemma-4-e2b-it-mobius-int4_rai_1.9.0_m_1.0.1_npu
- Modelo base de referencia (Google Gemma 3n E2B-it): https://huggingface.co/google/gemma-3n-E2B-it
- Documentacion de Ryzen AI Software: https://ryzenai.docs.amd.com/
- Otros enlaces (paper, blog de AMD, demo): no disponibles en la informacion proporcionada.
