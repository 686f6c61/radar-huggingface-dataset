# amd/Phi-3-mini-4k-instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

Este repositorio contiene una adaptación del modelo Phi-3-mini-4k-instruct de Microsoft, publicada por AMD bajo el identificador `amd/Phi-3-mini-4k-instruct_rai_1.9.0_m_1.0.1_npu`. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original a formato ONNX y optimizada para ejecutarse sobre la NPU integrada en los procesadores AMD Ryzen AI (familia Ryzen 7040/8040 y posteriores), usando el stack de runtime Ryzen AI (RAI) en su versión 1.9.0 y el modelo compilado m_1.0.1. El objetivo es permitir inferencia local de un LLM de 3.800 millones de parámetros en hardware de PC sin depender de la GPU ni de la nube.

Phi-3-mini es un transformer decoder-only denso de 3.800 millones de parámetros con una ventana de contexto de 4.096 tokens, entrenado por Microsoft Research y publicado originalmente con licencia MIT. Esta variante de AMD conserva la arquitectura y los pesos del modelo original, pero cambia el formato de distribución (ONNX en lugar de safetensors) y añade el grafo compilado específico para la NPU, lo que condiciona su despliegue: no es un checkpoint genérico utilizable en vLLM o llama.cpp, sino un artefacto pensado para el runtime de Ryzen AI.

La relevancia de esta ficha es acotada pero concreta: permite evaluar si un equipo con Ryzen AI puede ejecutar un modelo conversacional de calidad razonable de forma totalmente local y con bajo consumo, aprovechando la NPU (hasta 16 TOPS en las generaciones XDNA/XDNA2) en lugar de la iGPU. El acceso está restringido (gated) y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-3-mini) |
| Parámetros totales | 3.800 millones (3,8 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (variante 4k) |
| Tipos de cuantización | no disponible en la información proporcionada (el repo distribuye un grafo ONNX compilado para NPU; no se detallan precisiones) |
| Idiomas soportados | inglés (según el tag `en` del repositorio) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo compilado para Ryzen AI NPU, `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-3-mini: un transformer decoder-only denso de 32 capas, dimensión oculta de 3.072 y 32 cabezas de atención, con 3.800 millones de parámetros y atención causal estándar (no se trata de un modelo MoE ni híbrido SSM). El contexto nativo es de 4.096 tokens, lo que identifica esta variante frente a Phi-3-mini-128k. El entrenamiento original de Microsoft combina datos web filtrados por calidad con datos sintéticos generados por modelos mayores, seguido de ajuste supervisado y optimización por preferencias (RLHF/DPO) para el alineamiento conversacional; no se dispone del desglose exacto de tokens en la información proporcionada.

La contribución específica de este repositorio no está en el entrenamiento, sino en la conversión: AMD publica el modelo en formato ONNX junto con un artefacto compilado (`m_1.0.1_npu`) para el runtime Ryzen AI 1.9.0, de modo que el grafo se ejecute sobre la NPU XDNA del SoC. Esto implica que las capas se han mapeado a operadores soportados por el compilador de Ryzen AI y que el rendimiento depende del soporte del driver y del firmware de la NPU, no de bibliotecas de inferencia convencionales. No se documentan en la información disponible innovaciones como decodificación especulativa, atención lineal o técnicas de cuantización específicas más allá del propio pipeline de compilación de AMD.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con formato de chat instructivo heredado de Phi-3-mini-4k-instruct.
- Razonamiento de sentido común y matemáticas de nivel básico-intermedio, coherente con el entrenamiento de Phi-3-mini.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, C++), con calidad limitada por el tamaño del modelo.
- Seguimiento de instrucciones y respuestas estructuradas (listas, tablas, JSON sencillo) en contextos cortos.
- Comprensión de documentos cortos, ya que el contexto máximo es de 4.096 tokens (aproximadamente 3.000 palabras en inglés).
- Ejecución local sobre NPU Ryzen AI, sin envío de datos a la nube, lo que habilita casos de privacidad estricta.
- No se documenta soporte nativo de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking) en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátiles y mini-PC con Ryzen AI: el modelo se ejecuta en la NPU y libera CPU e iGPU para otras tareas, con contexto suficiente para diálogos de varias réplicas dentro de los 4.096 tokens.
- Procesamiento de texto confidencial en entornos regulados (sanidad, legal, banca): al no requerir conexión externa, los datos no salen del equipo; el límite de 4k tokens obliga a trocear documentos largos.
- Resumen y reescritura de correos, actas e informes breves: adecuado para entradas de hasta unas 3.000 palabras en inglés, con latencia baja al ejecutarse en NPU.
- Generación de código de apoyo en el IDE para autocompletado y explicación de fragmentos: útil en equipos de desarrollo con hardware AMD Ryzen AI y sin GPU dedicada.
- Clasificación y extracción de información estructurada (JSON) en pipelines de datos locales: el modelo puede etiquetar tickets o extraer campos de textos cortos con prompts few-shot.
- Educación y prototipado de aplicaciones de IA en el borde: sirve como modelo de referencia para validar flujos ONNX + Ryzen AI antes de migrar a modelos mayores.
- Filtrado y moderación de contenido en local para aplicaciones de escritorio: clasificación de textos breves con coste energético reducido al usar la NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni datos de latencia o throughput sobre la NPU Ryzen AI. Como referencia cualitativa, el modelo base Phi-3-mini-4k-instruct es conocido por rendir por encima de su tamaño en razonamiento y código, pero no se aportan cifras verificables en esta ficha.

## Requisitos de hardware

- NPU AMD Ryzen AI (XDNA/XDNA2) con el runtime Ryzen AI 1.9.0 instalado; el artefacto `m_1.0.1_npu` está compilado para esa versión concreta.
- Tamaño del repositorio: 2,7 GB, lo que sugiere pesos en precisión reducida empaquetados en ONNX; se recomienda al menos 8 GB de RAM del sistema para cargar el grafo y el runtime.
- No requiere GPU dedicada; el objetivo es ejecutar en la NPU del SoC (por ejemplo, Ryzen 7 7840U/8840U, Ryzen AI 9 365/370 y familiares).
- Despliegue mediante el stack Ryzen AI de AMD (ONNX Runtime con el execution provider de la NPU); no está pensado para vLLM, TGI, llama.cpp ni Ollama, que esperan safetensors o GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del modelo de NPU, del driver y del tamaño del prompt.
- No cabe en GPU consumer como artefacto utilizable: aunque el modelo base de 3,8 B podría ejecutarse en una RTX 4090 o similar con otras distribuciones (GGUF/safetensors), este repositorio concreto está atado a la NPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución |
|---|---|---|---|---|---|
| amd/Phi-3-mini-4k-instruct_rai_1.9.0_m_1.0.1_npu | 3,8 B | 4.096 | ONNX compilado para NPU | MIT | NPU Ryzen AI con runtime 1.9.0 |
| microsoft/Phi-3-mini-4k-instruct | 3,8 B | 4.096 | safetensors | MIT | GPU/CPU con transformers, vLLM, llama.cpp |
| microsoft/Phi-3-mini-128k-instruct | 3,8 B | 131.072 | safetensors | MIT | GPU/CPU, requiere más memoria por KV cache |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 | safetensors, GGUF | Apache 2.0 | GPU/CPU, amplio soporte de runtimes |

La diferencia clave de esta variante frente al checkpoint original de Microsoft es el formato y el destino de ejecución: misma arquitectura y pesos, pero empaquetado para la NPU de AMD y con acceso restringido. Frente a Qwen2.5-3B-Instruct, el modelo de AMD ofrece menor contexto (4k frente a 32k) y solo inglés, a cambio de integración específica con Ryzen AI.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el repositorio.
- Solo inglés: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas, a pesar de que el modelo base tiene cierta competencia multilingüe.
- Contexto limitado a 4.096 tokens: inadecuado para documentos largos, conversaciones extensas o análisis de código de gran tamaño.
- Dependencia estricta del runtime Ryzen AI 1.9.0 y del artefacto `m_1.0.1_npu`: cambios de versión del driver o del firmware de la NPU pueden romper la compatibilidad.
- No es portable a otros backends: no puede cargarse directamente en vLLM, llama.cpp, Ollama o TGI; para esos entornos debe usarse el checkpoint original de Microsoft.
- Riesgo de alucinación inherente a un modelo de 3,8 B, especialmente en matemáticas avanzadas, citas factuales y código de producción sin verificación.
- Sesgos heredados de los datos de entrenamiento de Phi-3-mini (web filtrada y datos sintéticos), con posible infrarrepresentación de perspectivas no anglosajonas.
- Licencia MIT permisiva para uso comercial, pero conviene revisar los términos del runtime Ryzen AI de AMD, que se distribuye por separado y puede tener condiciones propias.
- Sin métricas publicadas de latencia, throughput ni calidad en esta variante: no se recomienda desplegar en producción sin una evaluación previa en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Phi-3-mini-4k-instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper de Phi-3 (Microsoft Research): https://arxiv.org/abs/2404.14219
- Documentación de Ryzen AI de AMD: https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- ONNX Runtime: https://onnxruntime.ai/
