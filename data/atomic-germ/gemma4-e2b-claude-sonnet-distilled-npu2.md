# Atomic-Germ/Gemma4-E2B-Claude-Sonnet-Distilled-NPU2

## Resumen

Este repositorio contiene una conversión cuantizada del modelo `Lufel6848/Gemma4-E2B-Claude-Sonnet-Distilled` al formato **Q4NX**, compilada específicamente para el runtime **FastFlowLM (FLM)** y orientada a la inferencia en **NPU AMD XDNA**. El autor, Atomic-Germ, ha adaptado los pesos originales (procedentes de un GGUF Q8_0) a un formato propietario que aprovecha las unidades de procesamiento neuronal de los procesadores AMD Ryzen AI, permitiendo ejecutar un modelo multimodal (lenguaje, visión y audio) en hardware de bajo consumo sin necesidad de GPU dedicada.

El modelo base es un destilado de un modelo de la familia Claude Sonnet, basado en la arquitectura Gemma 4 (el nombre sugiere 2 mil millones de parámetros, aunque no se confirma en la documentación). Esta conversión no modifica las capacidades del modelo original, sino que reempaqueta los pesos en un formato optimizado para NPU, con una mezcla de cuantización Q8_0, Q4_1 y BF16 según el componente. El resultado es un archivo de pesos de 4,35 GB que puede cargarse en memoria unificada de los NPU AMD XDNA.

La relevancia de este modelo radica en su enfoque en el despliegue en el borde (edge computing), donde el consumo energético y la latencia son críticos. Al estar diseñado para NPU, ofrece una alternativa a las GPU tradicionales para aplicaciones de IA generativa en dispositivos locales, con una instalación simplificada mediante la herramienta `flm-add`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en Gemma 4, segun nomenclatura del modelo) |
| Parametros totales | no disponible (el nombre sugiere 2B, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (mezcla de Q8_0, Q4_1 y BF16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | model.q4nx (formato propietario de FastFlowLM, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una **conversión cuantizada** de un modelo existente. El modelo original, `Lufel6848/Gemma4-E2B-Claude-Sonnet-Distilled`, es un destilado de un modelo de la familia Claude Sonnet, construido sobre la arquitectura Gemma 4. Según la model card, el modelo es multimodal: incluye un encoder de visión (`vision_weight.q4nx`) y un encoder de audio (`audio_weight.q4nx`), además del modelo de lenguaje principal.

El proceso de conversión, realizado por Atomic-Germ, parte de un GGUF en Q8_0 y lo transforma al formato Q4NX, que combina diferentes precisiones: Q8_0 para los pesos del modelo de lenguaje, Q4_1 para los encoders de visión y audio, y BF16 para ciertos componentes. Esta mezcla busca equilibrar la calidad de la salida con la eficiencia en memoria y cómputo en NPU. No se proporcionan detalles sobre el dataset de entrenamiento original ni sobre técnicas como RLHF o DPO, ya que esa información pertenece al modelo base y no está disponible en esta ficha.

## Capacidades

- Generación de texto y conversación multi-turno mediante una plantilla de chat (`chat_template.jinja`).
- Comprensión de imágenes a través del encoder de visión (`vision_weight.q4nx`).
- Procesamiento de audio mediante el encoder de audio (`audio_weight.q4nx`).
- Inferencia multimodal combinada (texto, imagen y audio) en un solo modelo.
- Compatible con el runtime FastFlowLM, que gestiona la ejecución en NPU AMD XDNA.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso explícito.

## Casos de uso

- Asistentes conversacionales locales en dispositivos con NPU AMD XDNA, aprovechando la baja latencia y el consumo reducido frente a una GPU.
- Análisis de imágenes en tiempo real en entornos de borde, como sistemas de vigilancia o inspección industrial, gracias al encoder de visión integrado.
- Transcripción y procesamiento de audio en dispositivos portátiles, utilizando el encoder de audio para comandos de voz o subtitulado automático.
- Aplicaciones de IA generativa en portátiles y mini-PC con procesadores Ryzen AI, sin necesidad de hardware gráfico dedicado.
- Prototipado rápido de soluciones de IA en el borde mediante la herramienta `flm-add`, que simplifica la instalación y el registro del modelo.
- Despliegue en entornos con restricciones de energía o espacio, donde una NPU integrada es preferible a una GPU externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, latencia ni comparativas con otros modelos.

## Requisitos de hardware

- Requiere un procesador AMD con NPU XDNA (por ejemplo, la serie Ryzen AI).
- No necesita GPU dedicada; la inferencia se ejecuta en la NPU integrada.
- El archivo de pesos `model.q4nx` ocupa 4,35 GB, por lo que cabe en la memoria unificada de los NPU AMD XDNA típicos.
- El runtime FastFlowLM (versión 1.0.1) es obligatorio; se instala mediante `pip install flm-add` o `uv tool install flm-add`.
- La ejecución se realiza con el comando `flm run`, configurando las variables de entorno `FLM_CONFIG_PATH` y `FLM_XCLBIN_PATH`.
- No se dispone de datos sobre latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ya que esta conversión es específica para NPU AMD XDNA y no existen datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- El modelo solo soporta el idioma inglés, según la etiqueta `language: en`.
- El formato Q4NX es propietario de FastFlowLM y no es compatible con otros runtimes como llama.cpp, vLLM u Ollama.
- La cuantización mixta puede introducir una ligera degradación en la calidad de salida respecto al modelo original en Q8_0, aunque no se han publicado evaluaciones al respecto.
- Depende completamente del ecosistema AMD XDNA; no funcionará en hardware de otros fabricantes ni en GPU convencionales.
- No se dispone de información sobre sesgos, alucinaciones o comportamientos no deseados del modelo base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es muy reciente y no ha sido validado por la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el formato propietario y la dependencia de FastFlowLM pueden limitar la portabilidad.

## Enlaces

- Repositorio del modelo: [Atomic-Germ/Gemma4-E2B-Claude-Sonnet-Distilled-NPU2](https://huggingface.co/Atomic-Germ/Gemma4-E2B-Claude-Sonnet-Distilled-NPU2)
- Modelo base: [Lufel6848/Gemma4-E2B-Claude-Sonnet-Distilled](https://huggingface.co/Lufel6848/Gemma4-E2B-Claude-Sonnet-Distilled)
