# amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_npu

## Resumen

Este repositorio contiene una versión optimizada para NPU del modelo Mistral-7B-Instruct-v0.2, publicada por AMD bajo el identificador `amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_npu`. Se trata de una conversión del conocido modelo instructivo de Mistral AI de 7.000 millones de parámetros a formato ONNX, cuantizado y preparado específicamente para ejecutarse sobre las unidades de procesamiento neuronal (NPU) de los procesadores AMD Ryzen AI. La nomenclatura "rai_1.9.0" hace referencia a la versión 1.9.0 del stack de software Ryzen AI necesario para su despliegue.

El modelo base es Mistral-7B-Instruct-v0.2, un transformer decoder-only denso de 7.000 millones de parámetros con una ventana de contexto de 32.000 tokens, afinado para seguir instrucciones y mantener conversaciones. Esta variante de AMD no modifica los pesos originales en cuanto a capacidades cognitivas, sino que los transforma para aprovechar la aceleración por hardware en NPU, empleando las herramientas de cuantización Quark de AMD y el formato ONNX.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 7B en hardware de consumo con NPU integrada (portátiles y mini-PC con Ryzen AI), reduciendo el consumo energético y liberando la GPU. El repositorio está sujeto a acceso restringido (gated) en HuggingFace y su licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral-7B-Instruct-v0.2) |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens (modelo base) |
| Tipos de cuantizacion | no disponible (formato ONNX optimizado para NPU; el repo usa Quark) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B-Instruct-v0.2: un transformer decoder-only con atención de ventana deslizante (sliding window attention) y 32.000 tokens de contexto, entrenado por Mistral AI y posteriormente afinado con técnicas de instrucción y conversación (los detalles exactos de RLHF/DPO del modelo original no se especifican en la información proporcionada). Esta variante de AMD no reentrena el modelo; aplica un pipeline de conversión a ONNX y cuantización mediante Quark, el toolkit de AMD para optimización de modelos, con el objetivo de mapear las operaciones a la NPU de Ryzen AI.

La innovación técnica principal de este repositorio es la adaptación al hardware NPU: el modelo se empaqueta con el stack Ryzen AI 1.9.0, lo que implica grafos ONNX particionados y kernels específicos para la NPU. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas adicionales de alineación en esta conversión concreta.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Seguimiento de instrucciones (modelo instructivo).
- Razonamiento básico y respuesta a preguntas.
- Generación de código y tareas de programación (capacidad heredada del modelo base).
- Matemáticas elementales y resolución de problemas sencillos.
- No se ha documentado soporte de tool calling o function calling en esta variante.
- No se ha documentado soporte de agentes o multi-step reasoning nativo.
- Capacidades multilingües limitadas: el repositorio declara únicamente inglés.
- No se ha documentado modo "thinking", visión ni audio.

## Casos de uso

- Asistente conversacional local en portátiles con Ryzen AI: el modelo puede gestionar diálogos multi-turno en inglés aprovechando la NPU para reducir el consumo energético y liberar la CPU/GPU, adecuado para aplicaciones de escritorio con requisitos de privacidad.
- Generación de texto en aplicaciones ofimáticas integradas: gracias a su ventana de 32.000 tokens, puede resumir documentos largos o redactar borradores directamente en el dispositivo sin enviar datos a la nube.
- Prototipado de chatbots en entornos sin GPU dedicada: la versión ONNX para NPU permite desplegar un 7B en mini-PC y portátiles con Ryzen AI, ideal para demos y pruebas de concepto.
- Educación y experimentación con IA en el borde: investigadores pueden estudiar el rendimiento de modelos instructivos en NPU y comparar latencia/consumo frente a ejecución en CPU o GPU.
- Automatización de respuestas en inglés para soporte técnico de baja complejidad: el modelo puede clasificar y responder consultas frecuentes con contexto limitado, siempre con supervisión humana.
- Generación de código asistida en IDE sobre hardware de consumo: aunque no se documenta tool calling, el modelo base es competente en tareas de autocompletado y explicación de fragmentos de código en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo se ejecuta en NPU. El tamaño del repositorio es de 8,1 GB, lo que orienta sobre el espacio en disco necesario.
- GPU recomendadas: no aplica; requiere NPU AMD Ryzen AI compatible con el stack 1.9.0.
- Cabe en consumer GPU: no es el objetivo de esta variante; está diseñada para NPU integrada en procesadores Ryzen AI.
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecución de Ryzen AI (Vitis AI EP), stack Ryzen AI 1.9.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_npu | 7B | 32.000 | ONNX / NPU Ryzen AI | apache-2.0 | Gated en HF |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32.000 | safetensors / GPU | apache-2.0 | Público en HF |
| TheBloke/Mistral-7B-Instruct-v0.2-GGUF | 7B | 32.000 | GGUF / CPU-GPU | apache-2.0 | Público en HF |

La diferencia clave de la variante de AMD es el target de hardware (NPU) y el formato ONNX optimizado; en capacidades y parámetros es equivalente al modelo original de Mistral AI. No se dispone de datos de rendimiento comparativo entre estas versiones en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- Sesgos: hereda los sesgos del dataset de entrenamiento de Mistral-7B-Instruct-v0.2, no documentados en esta ficha.
- Alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Dependencia de hardware: requiere una NPU AMD Ryzen AI compatible y el stack Ryzen AI 1.9.0; no es portable a otros aceleradores sin reconversión.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del stack Ryzen AI.
- Sin benchmarks publicados: no hay métricas de latencia, throughput ni calidad para esta variante concreta.
- Fecha de creación futura (2026-11-02): el repositorio parece reciente o planificado; verificar disponibilidad real.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_npu
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Ryzen AI (AMD): https://www.amd.com/en/products/software/ryzen-ai.html
- Quark (AMD): https://quark.docs.amd.com/
