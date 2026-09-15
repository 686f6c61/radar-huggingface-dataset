# Atomic-Germ/MiniCPM5-2B-OpenNPU2

# MiniCPM5-2B-OpenNPU2

## Resumen

MiniCPM5-2B-OpenNPU2 es una conversión cuantizada en formato Q4NX del modelo MiniCPM5-2B, desarrollada por Atomic-Germ. El modelo original, de la familia MiniCPM de OpenBMB, es un modelo de lenguaje de 2.516 millones de parámetros (2.5B) orientado a generación de texto, tool calling, contexto largo y uso conversacional. Esta versión específica está compilada para el runtime OpenFlowLM (OFLM) y está diseñada para ejecutarse en NPU AMD XDNA, lo que la convierte en una opción interesante para inferencia en dispositivos edge.

La relevancia de este modelo radica en su capacidad para ejecutar un modelo de 2.5B en hardware de NPU de bajo consumo, sin necesidad de GPUs dedicadas. El repositorio incluye los pesos cuantizados en un archivo `model.q4nx` de 1.81 GB, junto con la configuración del runtime, el tokenizador y la plantilla de chat. Es importante destacar que no se trata de un archivo GGUF ni safetensors, sino de un formato específico de OpenFlowLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5, etiquetado como tipo Llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | Q4NX (Q8_0 / Q4_1 / BF16) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (model.q4nx); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM5-2B, fue desarrollado por OpenBMB. Según las etiquetas del repositorio, su entrenamiento se realizó con un conjunto de datos que incluye Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Esto sugiere una combinación de datos web, matemáticas, código y ajuste fino supervisado (SFT) con datos de agentes y reinforcement learning (RL). Se citan dos artículos asociados en arXiv: 2506.07900 y 2602.09003, aunque sus contenidos no están detallados en la información disponible.

La conversión realizada por Atomic-Germ no modifica los pesos del modelo, sino que los cuantiza y empaqueta en formato Q4NX para el runtime OpenFlowLM. El proceso parte de un GGUF intermedio (`MiniCPM5-2B.i1-Q4_1.gguf`) y genera un archivo `model.q4nx` con pesos en Q8_0, Q4_1 y BF16. Esta conversión está pensada específicamente para la aceleración en NPU AMD XDNA, no para GPUs convencionales.

## Capacidades

- Generación de texto en inglés y chino.
- Soporte de tool calling / function calling, según las etiquetas del modelo.
- Contexto largo (long-context), aunque no se especifica la longitud exacta.
- Uso conversacional multi-turno.
- Optimizado para ejecución on-device y edge-ai en NPU AMD XDNA.
- Compatible con el runtime OpenFlowLM (OFLM) y el instalador `oflm-add`.

## Casos de uso

- Asistente conversacional en dispositivos edge: el modelo puede mantener diálogos en inglés y chino sin conexión, ejecutándose en NPU AMD XDNA gracias a su cuantización Q4NX y su tamaño reducido de 2.5B.
- Automatización de atención al cliente: con soporte de tool calling, puede integrarse en sistemas de ticketing o CRM para consultar APIs, gestionar pedidos y resolver incidencias en conversaciones multi-turno.
- Procesamiento de documentos largos en local: gracias a la etiqueta long-context, puede resumir o analizar informes extensos sin enviar datos a servidores externos, lo que resulta útil en entornos con requisitos de privacidad.
- Asistente de código en entornos sin conexión: el modelo base se entrenó con UltraData-Code, por lo que puede ayudar en tareas de programación, revisión de fragmentos o explicación de código en dispositivos con NPU.
- Agentes de IA en automóviles: integración en sistemas de infoentretenimiento basados en AMD Ryzen AI, para asistencia por voz, navegación y control de funciones del vehículo.
- Sistemas de agentes en edge: con tool calling y bajo consumo, puede orquestar flujos de trabajo en dispositivos con recursos limitados, como routers inteligentes, kioscos o dispositivos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Requiere una NPU AMD XDNA, presente en procesadores como los de la serie AMD Ryzen AI.
- El archivo de pesos `model.q4nx` ocupa 1.81 GB, lo que indica que cabe en la memoria unificada de dispositivos con NPU AMD XDNA.
- No es compatible con GPUs convencionales ni con runtimes estándar como vLLM, llama.cpp, Ollama o TGI, ya que no es un archivo GGUF.
- Despliegue mediante OpenFlowLM (OFLM) y el instalador `oflm-add`, que copia el modelo en el directorio de usuario y registra la etiqueta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino, lo que limita su uso en otros idiomas.
- El formato Q4NX es específico del runtime OpenFlowLM y no puede utilizarse con herramientas de inferencia estándar como llama.cpp o vLLM.
- La cuantización Q4NX puede introducir una pérdida de calidad en comparación con el modelo original sin cuantizar.
- No se especifica la longitud de contexto exacta, a pesar de etiquetarse como long-context.
- No hay información sobre sesgos, riesgos de alucinación ni evaluación de seguridad en la documentación disponible.
- La licencia Apache 2.0 permite uso comercial, pero el formato de pesos y el runtime OpenFlowLM pueden imponer restricciones adicionales de integración.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Atomic-Germ/MiniCPM5-2B-OpenNPU2
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper 1: https://arxiv.org/abs/2506.07900
- Paper 2: https://arxiv.org/abs/2602.09003
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605
- Dataset UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset UltraData-RL-2609: https://huggingface.co/datasets/openbmb/UltraData-RL-2609
