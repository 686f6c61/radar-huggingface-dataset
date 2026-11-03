# amd/Llama-3.2-3B-Instruct_rai_1.9.0_npu

## Resumen

Este repositorio contiene una exportación optimizada del modelo Llama-3.2-3B-Instruct de Meta, adaptada por AMD para su ejecución sobre las NPU (unidades de procesamiento neuronal) integradas en los procesadores AMD Ryzen AI. La conversión se ha realizado con el stack Ryzen AI 1.9.0 y el cuantizador Quark de AMD, generando pesos en formato ONNX preparados para inferencia acelerada por hardware en PC.

El modelo base es un transformer denso de 3.200 millones de parámetros, ajustado por instrucciones, con una ventana de contexto de 128.000 tokens y capacidad multilingüe (oficialmente ocho idiomas, aunque la ficha del repo declara solo inglés). Su relevancia radica en que permite ejecutar un LLM de gama media en local sobre hardware de consumo con NPU dedicada, sin depender de GPU discreta ni de servicios en la nube.

El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones de la licencia Llama 3.2 en HuggingFace antes de descargar los pesos. El tamaño del repo es de 4,5 GB, coherente con pesos cuantizados en ONNX para la NPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2) |
| Parámetros totales | 3.200 millones (3B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (modelo base); no se especifica en la ficha del repo |
| Tipos de cuantización | Cuantización Quark para NPU (ONNX); niveles exactos no disponibles |
| Idiomas soportados | Inglés (según ficha del repo); el modelo base soporta oficialmente alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-3.2-3B-Instruct, un transformer decoder-only denso con atención por grupos (GQA) y tokenizador BPE de 128.256 entradas, entrenado por Meta sobre aproximadamente 9 billones de tokens según la documentación pública de la familia Llama 3.2. El ajuste por instrucciones combina aprendizaje supervisado (SFT), rechazo de muestras y optimización directa de preferencias (DPO), además de un paso de poda de datos y ajuste de seguridad.

La contribución de AMD en este repositorio no es el entrenamiento, sino la conversión y optimización para Ryzen AI: los pesos se exportan a ONNX y se cuantizan con Quark para su ejecución sobre la NPU del SoC (arquitecturas XDNA/XDNA2 según generación). El stack Ryzen AI 1.9.0 proporciona los kernels y el runtime necesarios para aprovechar la NPU junto con la iGPU y la CPU en un esquema híbrido.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés.
- Razonamiento de nivel medio y respuesta a preguntas.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, etc.).
- Razonamiento matemático básico e intermedio.
- Soporte de tool calling / function calling heredado de Llama 3.1/3.2 Instruct.
- Capacidad para tareas de resumen, reescritura y extracción de información.
- Ventana de contexto larga (128.000 tokens en el modelo base) para documentos extensos.
- Capacidades multilingües limitadas al inglés según la ficha del repo (el modelo base declara soporte oficial para ocho idiomas).
- No incluye visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Asistente local en portátiles y mini-PC con Ryzen AI: el modelo se ejecuta sobre la NPU liberando CPU y GPU, lo que permite mantener un chatbot privado sin conexión a internet y con bajo consumo energético.
- Procesamiento de documentos largos en local: gracias a la ventana de 128.000 tokens del modelo base, puede resumir contratos, informes o manuales sin fragmentación agresiva, siempre que el runtime ONNX soporte la longitud completa.
- Generación de código en entornos de desarrollo: integrable en asistentes de IDE o scripts de automatización que requieran completar funciones o explicar fragmentos, con la ventaja de no enviar código a terceros.
- Automatización de soporte técnico interno: conversaciones multi-turno con contexto persistente para bases de conocimiento corporativas, desplegado en equipos de escritorio con NPU.
- Extracción estructurada de información: uso de tool calling para convertir texto libre en JSON o llamadas a APIs en pipelines de datos ejecutados en el propio dispositivo.
- Prototipado de agentes de razonamiento multi-paso: el modelo puede encadenar llamadas a herramientas en flujos de automatización de escritorio, con la NPU como acelerador de bajo consumo.
- Educación y experimentación: entorno de bajo coste para investigadores que quieran estudiar inferencia en NPU sin adquirir GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La ficha del repositorio no incluye métricas de latencia, throughput ni evaluaciones estándar (MMLU, HumanEval, GSM8K) para esta exportación concreta. Los resultados del modelo base Llama-3.2-3B-Instruct pueden consultarse en la documentación oficial de Meta, pero no son directamente extrapolables al rendimiento de esta versión cuantizada en NPU.

## Requisitos de hardware

- NPU AMD Ryzen AI compatible con el stack Ryzen AI 1.9.0 (procesadores Ryzen AI 300 series y generaciones soportadas por dicha versión).
- El repo ocupa 4,5 GB, por lo que se recomienda al menos 8 GB de RAM disponible para cargar los pesos y el runtime.
- No requiere GPU discreta: el objetivo es la ejecución sobre NPU integrada, con apoyo opcional de iGPU y CPU.
- No cabe en GPUs de consumo en este formato ONNX concreto; para GPU se recomienda usar los pesos originales de Meta en safetensors o GGUF.
- Opciones de despliegue: runtime Ryzen AI (ONNX Runtime con execution provider para NPU/Vitis AI), herramientas de AMD para conversión y despliegue; no es compatible directamente con vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AMD Llama-3.2-3B-Instruct_rai_1.9.0_npu | 3B | 128k (base) | Llama 3.2 Community | Gated, ONNX para NPU | Optimizado para Ryzen AI |
| Meta Llama-3.2-3B-Instruct | 3B | 128k | Llama 3.2 Community | Abierto en HF (safetensors) | Pesos originales, uso general en GPU/CPU |
| Qwen2.5-3B-Instruct | 3B | 32k | Apache 2.0 | Abierto | Alternativa permisiva, sin optimización NPU |
| Phi-3.5-mini-instruct | 3,8B | 128k | MIT | Abierto | Similar tamaño, licencia más permisiva |

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar la licencia Llama 3.2 en HuggingFace para descargar los pesos.
- Licencia Llama 3.2 Community: permite uso comercial con condiciones (atribución, límite de 700 millones de usuarios mensuales, políticas de uso aceptable); revisar el texto completo antes de desplegar en producción.
- Idiomas: la ficha declara solo inglés, aunque el modelo base soporta más idiomas; el rendimiento en otros idiomas puede degradarse tras la cuantización.
- Riesgo de alucinación inherente a los LLM de 3B: menor fiabilidad factual que modelos de mayor tamaño en dominios especializados.
- La cuantización para NPU puede introducir pérdida de precisión respecto a los pesos originales en BF16.
- Dependencia del stack Ryzen AI 1.9.0 y de hardware AMD concreto: no es portable a otras plataformas sin reconversión.
- Sin datos publicados de benchmarks para esta exportación: no se puede garantizar el rendimiento en tareas específicas sin evaluarlo localmente.
- El modelo base incorpora ajustes de seguridad, pero no está exento de generar contenido sesgado o inapropiado en usos adversariales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Llama-3.2-3B-Instruct_rai_1.9.0_npu
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Documentación de Ryzen AI: https://ryzenai.docs.amd.com/
- Repositorio Quark (cuantización AMD): https://github.com/amd/quark
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
