# HrishiBuilds/UTLT-Qwen3-0.6B-ONNX-v2

## Resumen

UTLT-Qwen3-0.6B-ONNX-v2 es un ajuste fino del modelo Qwen3-0.6B de Alibaba, exportado a formato ONNX en cuantización de 4 bits para su uso con transformers.js en navegador. Lo desarrolla el usuario HrishiBuilds en el contexto del proyecto UTLT.ai, una aplicación web telefónica de seguimiento del consumo de agua. El modelo está especializado en responder preguntas sobre registros de consumo hídrico doméstico y en generar sugerencias de actividad conservadoras a partir de datos simulados.

El modelo parte de la arquitectura Qwen3 de 0,6 mil millones de parámetros y se ha adaptado mediante un LoRA de rango 8 sobre un conjunto sintético de 1.000 hogares con siete días de registros cada uno. El resultado se ha fusionado con el modelo base (licencia Apache 2.0) y se ha exportado a ONNX cuantizado para ejecución local en WebGPU, lo que permite inferencia en el dispositivo sin enviar datos a servidores externos.

Su relevancia es acotada: no es un modelo de propósito general, sino un componente de una aplicación concreta. La model card es explícita al señalar que se trata de un resultado sobre datos simulados y que no debe usarse para inferir fugas, identificar actividades como hecho ni restringir el suministro de agua. La calidad y el rendimiento en navegadores Android e iPhone aún no se han validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), ajuste fino con LoRA de rango 8 fusionado |
| Parámetros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con longitud máxima de secuencia 512) |
| Tipos de cuantización | ONNX 4 bits (exportación cuantizada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformers.js) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros. Sobre él se entrenó un adaptador LoRA de rango 8 con prompts enmascarados, tamaño de lote 1, longitud máxima de secuencia 512 y tasa de aprendizaje 1e-5 durante 800 pasos. El entrenamiento se reanudó desde un adaptador previo entrenado con 200 hogares y se aplicó únicamente a las cuatro capas transformer finales. Posteriormente, el adaptador se fusionó con el modelo base y el resultado se exportó a ONNX cuantizado a 4 bits.

Los datos de entrenamiento son sintéticos: 1.000 hogares simulados con siete días de registros de consumo cada uno. Se usaron 800 hogares para entrenamiento, 100 para validación y 100 para test. En esta pasada de reentrenamiento se seleccionó un ejemplo de chat equilibrado por hogar; el conjunto completo de cinco ejemplos por hogar permanece en el repositorio del proyecto. El conjunto de test sintético de 100 hogares arrojó una pérdida de 0,110 y una perplejidad de 1,116, métricas que corresponden a un modelo de lenguaje sobre prompts simulados y no a una precisión real de consumo de agua.

La exportación a ONNX reportó diferencias respecto a la referencia en PyTorch con una tolerancia estricta de 1e-5, por lo que la verificación no demuestra equivalencia numérica. La aplicación calcula litros, medias, objetivos y previsiones en JavaScript y rechaza respuestas del modelo que contengan números no presentes en los hechos proporcionados.

## Capacidades

- Generación de texto conversacional orientada a preguntas sobre consumo de agua doméstico.
- Generación de sugerencias de actividad conservadoras a partir de registros de flujo simulados.
- Expresión de incertidumbre: en la verificación local, el modelo indicó que un único caudalímetro no permite identificar la actividad real.
- Ejecución en navegador mediante transformers.js y WebGPU, con inferencia local en el dispositivo.
- Cuantización a 4 bits para reducir el tamaño del modelo (repo de 0,6 GB).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente de consumo de agua en aplicación web móvil: el modelo responde preguntas del usuario sobre sus registros de consumo dentro de la app UTLT.ai, con los cálculos numéricos delegados a JavaScript para evitar cifras inventadas.
- Generación de recomendaciones de ahorro conservadoras: a partir de un registro de siete días, el modelo puede proponer actividades de reducción de consumo sin afirmar qué actividad concreta generó el gasto.
- Inferencia local en navegador sin servidor: al ejecutarse con transformers.js y ONNX cuantizado, permite desplegar el asistente en Android e iPhone sin enviar datos del hogar a infraestructura externa.
- Prototipado de asistentes verticales sobre Qwen3-0.6B: sirve como referencia de flujo completo (LoRA, fusión, exportación ONNX, cuantización, integración con transformers.js) para equipos que quieran replicar el pipeline en otros dominios.
- Validación de pipelines de datos sintéticos: el generador de dataset y el código de entrenamiento del repositorio del proyecto permiten reproducir el experimento con 1.000 hogares simulados.
- Filtro de respuestas numéricas en aplicaciones sensibles: el patrón de la app (rechazar respuestas con números no presentes en los hechos) es reutilizable en asistentes domésticos donde la precisión numérica es crítica.
- Demostración educativa de ajuste fino eficiente: el uso de LoRA de rango 8 sobre las cuatro capas finales con 800 pasos y lote 1 ilustra un ajuste de bajo coste sobre un modelo de 0,6B.

## Benchmarks y rendimiento

| Métrica | Conjunto | Valor |
|---|---|---|
| Pérdida (loss) | Test sintético de 100 hogares | 0,110 |
| Perplejidad | Test sintético de 100 hogares | 1,116 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores corresponden a un modelo de lenguaje sobre prompts simulados y no miden precisión real de consumo de agua. El rendimiento en WebGPU, el uso de memoria y la calidad de respuesta en navegadores Android e iPhone aún no se han probado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 0,6 GB en ONNX 4 bits, por lo que la huella de memoria en inferencia será del orden de cientos de MB, aunque no se ha medido.
- GPU recomendadas: no disponibles. El destino es WebGPU en navegadores móviles (Android e iPhone), no GPU de servidor.
- GPU de consumo: no se documenta compatibilidad con RTX 4090, A100 u H100; el modelo está pensado para ejecución en navegador.
- Opciones de despliegue: transformers.js con ONNX Runtime Web y WebGPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; pendientes de medición en los navegadores objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Especialización |
|---|---|---|---|---|---|
| UTLT-Qwen3-0.6B-ONNX-v2 | 0,6B | no disponible | ONNX 4 bits | Apache 2.0 | Consumo de agua doméstico |
| Qwen/Qwen3-0.6B (base) | 0,6B | no disponible | safetensors | Apache 2.0 | Propósito general |
| Otros ajustes de Qwen3-0.6B | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base Qwen3-0.6B es la alternativa directa: mismo tamaño y licencia, pero sin especialización en consumo de agua ni exportación ONNX. No se dispone de información sobre otros modelos comparables de la misma categoría (asistentes verticales de consumo doméstico en navegador) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó y evaluó exclusivamente con datos sintéticos (1.000 hogares simulados); no hay validación con etiquetas reales ni caudalímetros calibrados.
- La pérdida de 0,110 y la perplejidad de 1,116 son métricas de modelo de lenguaje sobre prompts simulados, no una medida de precisión práctica en consumo de agua.
- La model card prohíbe explícitamente usar el modelo para inferir fugas, identificar actividades como hecho o restringir el suministro de agua.
- La exportación ONNX mostró diferencias respecto a PyTorch con tolerancia 1e-5; no se ha demostrado equivalencia numérica.
- El rendimiento, la memoria y la calidad de respuesta en WebGPU sobre Android e iPhone no se han probado.
- La longitud de contexto no está documentada; el entrenamiento usó secuencias de 512 tokens como máximo.
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero la aplicación debe mantener el filtro de respuestas numéricas en JavaScript para evitar cifras inventadas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HrishiBuilds/UTLT-Qwen3-0.6B-ONNX-v2
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del proyecto UTLT.ai (código de entrenamiento, generador de dataset y adaptadores): https://github.com/unleashedcubing/HridhAI-Project-UTLT.ai/tree/ble-enabled/training
