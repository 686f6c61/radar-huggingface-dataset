# amd/Qwen2.5-Coder-0.5B-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

Este repositorio contiene una compilación optimizada del modelo Qwen2.5-Coder-0.5B-Instruct para su ejecución sobre las NPU (unidades de procesamiento neuronal) de los procesadores AMD Ryzen AI. El modelo base es Qwen2.5-Coder-0.5B-Instruct, desarrollado originalmente por Alibaba Cloud (equipo Qwen), un modelo de lenguaje de 0,5 mil millones de parámetros especializado en generación y razonamiento de código. AMD publica esta variante precompilada en formato ONNX dentro del ecosistema Ryzen AI (RAI), con el objetivo de permitir inferencia local acelerada por hardware en equipos con CPU AMD de última generación.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado por AMD, sino de un artefacto de despliegue: los pesos del modelo original se transforman y cuantizan para ejecutarse sobre la NPU integrada en los procesadores Ryzen AI (arquitecturas XDNA/XDNA2). Esto permite ejecutar generación de texto y asistencia de código en local, con bajo consumo energético y sin depender de GPU dedicada ni de servicios en la nube.

El tamaño del repositorio es de aproximadamente 0,7 GB, lo que refleja los pesos cuantizados y los grafos ONNX compilados para el backend NPU. El acceso está restringido (gated) en HuggingFace y requiere aceptar las condiciones de uso. La licencia declarada es Apache 2.0, heredada del modelo base Qwen2.5-Coder-0.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-0.5B-Instruct), compilado a ONNX para NPU AMD Ryzen AI |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-0.5B-Instruct soporta 32 768 tokens, dato no confirmado para esta compilacion) |
| Tipos de cuantizacion | no disponible (compilacion NPU Ryzen AI; el tag m_1.0.1_npu sugiere un artefacto especifico de modelo para el runtime RAI) |
| Idiomas soportados | en (ingles, segun metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (compilado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-Coder-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parámetros perteneciente a la familia Qwen2.5-Coder de Alibaba Cloud. Esta familia se entrena con un corpus centrado en código y texto técnico, e incorpora una fase de ajuste por instrucciones (instruction tuning) que lo habilita para tareas conversacionales y de generación de código. Los detalles exactos sobre el número de tokens de entrenamiento, la composición del dataset y las técnicas de alineación (RLHF/DPO) del modelo base no se especifican en la información proporcionada para este repositorio.

La contribución de AMD en este artefacto es la compilación y el empaquetado del modelo para el stack Ryzen AI (RAI 1.9.0). El identificador `m_1.0.1_npu` hace referencia a la versión del artefacto de modelo y al destino de ejecución (NPU). El resultado es un grafo ONNX optimizado que se ejecuta sobre la NPU XDNA integrada en los procesadores Ryzen AI, lo que traslada la carga de inferencia desde la CPU/GPU al acelerador neuronal dedicado. No se documentan en la información disponible innovaciones de decodificación especulativa ni técnicas de atención lineal específicas para esta compilación.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste por instrucciones.
- Generación y asistencia de código: el modelo base está especializado en tareas de programación (autocompletado, explicación de código, generación de funciones).
- Razonamiento básico sobre código y texto técnico, limitado por su tamaño de 0,5 mil millones de parámetros.
- Ejecución local acelerada por NPU AMD Ryzen AI mediante el runtime RAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para esta compilación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: los metadatos declaran únicamente inglés (`en`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Autocompletado de código en IDE local: el modelo puede integrarse en editores o plugins que se ejecuten en el propio portátil o equipo de sobremesa con Ryzen AI, ofreciendo sugerencias de código sin enviar el contexto a la nube y aprovechando la NPU para reducir el consumo de batería.
- Asistencia de código offline en entornos restringidos: en escenarios donde no se permite el envío de código a servicios externos (por ejemplo, desarrollo en sectores regulados), esta compilación permite ejecutar un asistente de programación completamente local.
- Explicación y documentación de fragmentos de código: el modelo puede recibir un bloque de código y generar comentarios o explicaciones en inglés, ejecutándose sobre la NPU para liberar CPU y GPU del sistema.
- Prototipado rápido de chatbots técnicos: para demos y pruebas de concepto en dispositivos con Ryzen AI, el modelo permite montar un endpoint de generación de texto local con latencia aceptable para respuestas cortas.
- Generación de tests unitarios sencillos: dado un fragmento de función, el modelo puede proponer casos de prueba básicos, útil en pipelines de desarrollo locales donde se prioriza la privacidad.
- Evaluación de despliegues en NPU: como artefacto de referencia de AMD, sirve para validar el stack Ryzen AI (RAI 1.9.0) y medir el rendimiento de modelos pequeños en NPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrada (arquitecturas XDNA/XDNA2), ejecutando el runtime Ryzen AI (RAI) versión 1.9.0.
- VRAM estimada para inferencia: no aplica de forma directa, ya que la inferencia se ejecuta sobre la NPU; el repositorio ocupa aproximadamente 0,7 GB en disco.
- GPU recomendadas: no aplica; el artefacto está compilado específicamente para NPU AMD.
- Compatibilidad con GPU de consumo: no disponible para esta compilación; para ejecutar el modelo base en GPU convencional sería necesario usar los pesos originales de Qwen2.5-Coder-0.5B-Instruct en otro formato.
- Opciones de despliegue: runtime Ryzen AI (RAI) con backend ONNX Runtime sobre NPU. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta compilación.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / destino | Disponibilidad |
|---|---|---|---|---|---|
| amd/Qwen2.5-Coder-0.5B-Instruct_rai_1.9.0_m_1.0.1_npu | 0,5 B | no disponible | Apache 2.0 | ONNX para NPU Ryzen AI | Gated en HuggingFace |
| Qwen/Qwen2.5-Coder-0.5B-Instruct (modelo base) | 0,5 B | 32 768 tokens (modelo base) | Apache 2.0 | safetensors, GGUF (comunidad) | Publico en HuggingFace |
| Modelos de código pequeños de otras familias (p. ej., CodeLlama-7B, StarCoder2-3B) | 3-7 B | variable | licencias diversas | safetensors, GGUF | Publicos en HuggingFace |

La comparación directa con alternativas de código de mayor tamaño no es homogénea: esta compilación prioriza el despliegue en NPU sobre el rendimiento bruto. Frente al modelo base, la diferencia principal es el formato y el destino de ejecución, no la capacidad del modelo.

## Limitaciones y advertencias

- El modelo base tiene solo 0,5 mil millones de parámetros, por lo que su capacidad de razonamiento complejo, matemáticas avanzadas y código de gran extensión es limitada en comparación con modelos de 7 B o más.
- Los metadatos declaran únicamente inglés; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje de pequeño tamaño, especialmente en explicaciones técnicas y APIs poco comunes.
- El acceso al repositorio está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.
- La compilación está atada al stack Ryzen AI 1.9.0 y a la NPU de procesadores AMD compatibles; no es portable a otros backends sin reconversión.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del runtime Ryzen AI por separado.
- No se documentan en la información disponible el contexto máximo efectivo, las cuantizaciones exactas ni el soporte de tool calling de esta compilación, lo que dificulta planificar su uso en producción sin pruebas adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Qwen2.5-Coder-0.5B-Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base (Qwen2.5-Coder-0.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Documentación de Ryzen AI (AMD): https://www.amd.com/en/developer/resources/ryzen-ai-software.html
- Repositorio Ryzen AI en GitHub: https://github.com/amd/RyzenAI-SW
