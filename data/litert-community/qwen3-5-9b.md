# litert-community/Qwen3.5-9B

## Resumen

Qwen3.5-9B en formato LiteRT-LM es la conversión del modelo Qwen/Qwen3.5-9B de Qwen (Alibaba) al formato `.litertlm` para el runtime LiteRT-LM de Google AI Edge, orientado a inferencia on-device y en el edge. La conversión la mantiene la comunidad litert-community y se distribuye bajo licencia Apache 2.0. El objetivo es permitir la ejecución local del modelo en dispositivos con recursos limitados, sin depender de infraestructura en la nube.

El modelo original es un transformer híbrido de 9B parámetros (8.953.803.264 en el decodificador de texto) que combina 24 capas de atención lineal GatedDeltaNet con 8 capas de atención completa, una cada cuatro. Incorpora además un codificador de visión en el checkpoint original, aunque los ficheros LiteRT-LM contienen únicamente el decodificador de texto. El contexto nativo del modelo es de 262.144 tokens, pero estos ficheros lo limitan a 4.096.

La relevancia actual reside en la combinación de un modelo de 9B con arquitectura híbrida eficiente y una conversión específica para GPU y CPU móviles, con cuantizaciones INT8 e INT4 mixtas que reducen el peso a entre 6 y 9,2 GB. Es una opción práctica para prototipos de asistentes locales, procesamiento de texto en dispositivos y despliegues sin conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de atención lineal GatedDeltaNet y 8 de atención completa (una de cada cuatro) |
| Parametros totales | 9.653.104.368 en el release original; 8.953.803.264 en el decodificador de texto incluido en estos ficheros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en el modelo original; 4.096 tokens en los ficheros LiteRT-LM |
| Tipos de cuantizacion | INT8 dinámica, INT4 blockwise-32 (min-max) mixta, INT8 con proyecciones GatedDeltaNet en float |
| Idiomas soportados | No disponible en la información proporcionada (Qwen declara 201 idiomas y dialectos para Qwen3.5) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); cuatro variantes: mixed_int4_gpu_composite, int8_gpu_composite, int8 e mixed_int4 |
| Tamano del repositorio | 61,0 GB |
| Libreria | litert-lm |
| Modelo base | Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

La arquitectura es la híbrida de Qwen3.5: 32 capas en total, de las cuales 24 usan atención lineal GatedDeltaNet y 8 usan atención completa, distribuidas una de cada cuatro. El tamaño oculto es 4.096, el tamaño intermedio 12.288 con una FFN densa en cada capa, 16 cabezas de atención con 4 cabezas KV de 256 dimensiones, y atención lineal con 16 cabezas de clave y 32 de valor de 128 dimensiones. El vocabulario es de 248.320 tokens con embeddings no atados.

Solo las 8 capas de atención completa mantienen una caché KV creciente (limitada a 4.096 tokens en estos ficheros); las 24 capas de atención lineal mantienen un estado convolucional y recurrente de tamaño constante, lo que reduce el consumo de memoria en contextos largos. El checkpoint original es multimodal e incluye torre de visión y cabeza de predicción multi-token, pero los ficheros LiteRT-LM solo contienen el decodificador de texto (la misma carga que `Qwen3_5ForCausalLM` de upstream), por lo que no hay entrada de imagen ni vídeo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO en la información proporcionada. La conversión se realizó con litert-torch (commit 115a1360 con el parche híbrido de Qwen3.5) y se probó con litert-lm 0.18.0 y 0.19.x. La plantilla de chat es la de los ficheros Qwen3.5-4B, con `enable_thinking` desactivado por defecto; el modo thinking se activa explícitamente y devuelve el razonamiento por el canal `thought`.

## Capacidades

- Generación de texto y razonamiento en modo no-thinking por defecto, con modo thinking opcional mediante `ThinkingConfig(enable_thinking=True)` o `--thinking true` en la CLI.
- Razonamiento multi-paso en modo thinking, con presupuesto de tokens controlable.
- Soporte de tool calling / function calling: los metadatos del LLM incluyen el formato de llamada a herramientas de LiteRT-LM v0.1.
- Capacidades multilingües según Qwen (201 idiomas y dialectos declarados), aunque no hay lista detallada en la información disponible.
- Sin capacidades de visión ni vídeo en estos ficheros, pese a que el modelo original es multimodal.
- Ejecución on-device en GPU y CPU mediante el runtime LiteRT-LM, con variantes optimizadas para GPU compuestas.

## Casos de uso

- Asistentes locales en dispositivos móviles: el fichero mixed_int4 de 6,02 GB permite ejecutar un modelo de 9B en la GPU de un dispositivo de gama alta, con respuestas de texto sin conexión y sin enviar datos a la nube.
- Procesamiento de texto en el edge: clasificación, resumen y extracción de información en equipos con GPU integrada, usando la variante INT8 para CPU cuando no hay acelerador disponible.
- Prototipado de agentes con tool calling: la inclusión del formato de llamada a herramientas en los metadatos permite construir flujos de agente que invoquen funciones locales o APIs en un runtime LiteRT-LM.
- Razonamiento con presupuesto controlado: el modo thinking opt-in con canal `thought` separado facilita tareas de análisis y planificación donde se quiere inspeccionar el razonamiento antes de la respuesta final.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, es adecuado para datos sensibles que no pueden salir del equipo, como notas clínicas o documentos internos.
- Evaluación de arquitecturas híbridas: útil para investigadores que quieran medir el comportamiento de GatedDeltaNet frente a atención completa en un runtime de producción móvil, con latencias medidas (46,1 tok/s en GPU de Mac Studio M4 Max con mixed_int4 en litert-lm 0.18.0).

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el proveedor del modelo original (Qwen), no ejecutados por el conversor:

| Benchmark | Qwen3.5-9B (reportado por el proveedor) |
|---|---|
| MMLU-Pro | 82,5 |
| IFEval | 91,5 |

Rendimiento de inferencia medido en la conversión:

| Fichero | Dispositivo / runtime | Métrica |
|---|---|---|
| mixed_int4 | Mac Studio M4 Max, GPU, litert-lm 0.18.0 | 46,1 tok/s de decodificación |
| mixed_int4_gpu_composite_v0190 | Mac, GPU, litert-lm 0.19.2 | 28,7 % más rápido en prefill y 24,4 % más rápido en decodificación que mixed_int4 |
| mixed_int4 | Galaxy S26, GPU | El motor GPU no compiló (rendimiento) |
| int8 y mixed_int4 | Mac CPU, litert-lm 0.17.1 | Responden correctamente a una petición simple |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: entre 6,02 GB (mixed_int4_gpu_composite) y 9,20 GB (int8) para los pesos; hay que sumar la caché KV de las 8 capas de atención completa (presupuesto de 4.096 tokens) y el estado recurrente constante de las 24 capas lineales.
- GPU recomendadas: GPU de Apple (probado en Mac Studio M4 Max), GPU móviles de gama alta (el motor GPU falló en Galaxy S26 con el fichero mixed_int4 de 0.18.0). No hay datos de GPUs NVIDIA o AMD en la información disponible.
- Cabe en GPU de consumo: sí, en términos de memoria, con la variante mixed_int4 de 6,02 GB; la viabilidad depende de que el runtime LiteRT-LM soporte la GPU concreta.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.19.x recomendada para los ficheros gpu_composite, que declaran `min_runtime_version` 0.19.0); en 0.18.1 los ficheros gpu_composite responden con error en GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 46,1 tok/s de decodificación en GPU de Mac Studio M4 Max con mixed_int4 (litert-lm 0.18.0); la variante gpu_composite de 0.19.2 mejora un 24,4 % la decodificación y un 28,7 % el prefill respecto a mixed_int4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B (LiteRT-LM) | 8,95B (texto) | 4.096 en estos ficheros (262.144 nativo) | Apache 2.0 | `.litertlm`, LiteRT-LM | Solo texto; optimizado para edge |
| Qwen3.5-4B (LiteRT-LM) | No disponible | No disponible | Apache 2.0 | `.litertlm`, LiteRT-LM | Misma ruta de conversión y plantilla de chat |
| Qwen3.5-2B (LiteRT-LM) | No disponible | No disponible | Apache 2.0 | `.litertlm`, LiteRT-LM | Misma ruta de conversión |
| Qwen3.5-0.8B (LiteRT-LM) | No disponible | No disponible | Apache 2.0 | `.litertlm`, LiteRT-LM | Misma ruta de conversión |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sin capacidades multimodales: aunque el modelo original es visión-lenguaje, estos ficheros solo contienen el decodificador de texto; no aceptan imagen ni vídeo.
- Contexto truncado: el contexto efectivo es de 4.096 tokens frente a los 262.144 nativos, lo que limita tareas de contexto largo.
- Modo thinking desactivado por defecto: las respuestas no incluyen razonamiento salvo que se active explícitamente; hay que ajustar la configuración para tareas que lo requieran.
- Compatibilidad de runtime: los ficheros gpu_composite requieren LiteRT-LM 0.19.0 o superior; en 0.18.1 fallan en GPU. El motor GPU no compiló en Galaxy S26 con el fichero mixed_int4, lo que indica variabilidad según dispositivo.
- Riesgo de alucinación: no hay datos específicos en la información disponible, pero es un riesgo inherente a los modelos de lenguaje; conviene validar salidas en producción.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero debe revisarse la licencia del modelo base Qwen/Qwen3.5-9B y las condiciones de uso de Qwen.
- Idiomas: no hay lista detallada de idiomas soportados en la información disponible; la cobertura multilingüe es la declarada por Qwen para el modelo base.

## Enlaces

- [Hugging Face: litert-community/Qwen3.5-9B](https://huggingface.co/litert-community/Qwen3.5-9B)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Runtime LiteRT-LM (GitHub)](https://github.com/google-ai-edge/LiteRT-LM)
- [Conversión Qwen3.5-4B](https://huggingface.co/litert-community/Qwen3.5-4B)
- [Conversión Qwen3.5-2B](https://huggingface.co/litert-community/Qwen3.5-2B)
- [Conversión Qwen3.5-0.8B](https://huggingface.co/litert-community/Qwen3.5-0.8B)
