# Chungulus/Qwen3.8-27B-MLX-oQ4e-MTP

## Resumen

Chungulus/Qwen3.8-27B-MLX-oQ4e-MTP es una cuantización 4-bit del modelo vision-language Qwen/Qwen3.8-27B, realizada por el usuario Chungulus. El modelo base, según su nombre, tendría 27 mil millones de parámetros, aunque los tensores en safetensors suman 4.926.789.872 parámetros, una discrepancia que no se aclara en la documentación. La cuantización emplea el algoritmo oMLX oQ4e, con precisión FP16 para la parte de visión y soporte nativo de MTP (multi-token prediction), lo que acelera la generación de texto. Está pensado para ejecutarse en Apple Silicon con 64 GB de memoria unificada, y se distribuye bajo licencia Apache 2.0.

Este modelo es relevante porque permite desplegar un sistema multimodal (texto e imagen) en hardware de Apple sin necesidad de GPUs dedicadas, aprovechando el runtime oMLX. Incluye capacidades de tool calling y un mecanismo MTP que, según las pruebas del autor, duplica el throughput de generación respecto a la versión sin MTP. No se trata de un fine-tune, sino de una conversión de pesos del checkpoint oficial, por lo que conserva las capacidades originales del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (identificador interno, no corresponde a Qwen3.5) |
| Parametros totales | 4.926.789.872 (según safetensors; el nombre del modelo indica 27B, sin confirmar) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4-bit efectivo, con FP16 para visión) |
| Idiomas soportados | no disponibles (el corpus de calibración es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con oMLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización directa del checkpoint oficial de Qwen/Qwen3.8-27B, sin modificaciones de arquitectura ni fine-tuning. El autor indica que el identificador interno `qwen3_5` no implica que los pesos provengan de un modelo Qwen3.5, sino que es la etiqueta usada por el checkpoint original. La conversión utiliza el algoritmo oMLX oQ4e, que aplica cuantización de 4 bits a la mayoría de los tensores de texto, mantiene la parte de visión en FP16 y conserva los 15 tensores MTP originales. El proceso de calibración se basó en un corpus empaquetado multilingüe, de código, herramientas y razonamiento, con hash SHA-256 fijado. No se proporcionan detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM conversacional, y esta cuantización conserva esas capacidades.
- Visión: procesamiento de imágenes (y posiblemente vídeo, aunque solo se mencionan pruebas con imágenes locales). El pipeline es `image-text-to-text`.
- Tool calling: soporta llamadas a herramientas en formato XML, validado con cinco pruebas nativas.
- MTP (multi-token prediction): genera varios tokens por ciclo, acelerando la inferencia. En las pruebas del autor, el throughput pasó de 15.0 a 35.4 tokens por segundo (speedup de 2.36x).
- Multilingüe: el corpus de calibración es multilingüe, pero no se especifican los idiomas exactos.
- Conversacional: compatible con plantillas de chat y generación condicionada.

## Casos de uso

- Asistente multimodal en Apple Silicon: un chatbot que puede recibir imágenes y texto, ideal para entornos donde no hay GPUs dedicadas. Se ejecuta con oMLX en Mac con 64 GB de RAM unificada.
- Análisis de imágenes en local: extraer información de capturas, diagramas o fotografías sin enviar datos a la nube, gracias a la parte de visión en FP16.
- Generación de código con tool calling: integrar el modelo en un agente que llame a funciones o APIs mediante XML, por ejemplo para automatizar tareas de desarrollo.
- Razonamiento multi-paso: el modelo base es capaz de encadenar pasos lógicos; la cuantización mantiene la coherencia, como se muestra en la prueba de los primeros diez números cuadrados.
- Despliegue de un servidor OpenAI-compatible: el comando `omlx serve` expone un endpoint `/v1/chat/completions`, permitiendo usarlo como backend para aplicaciones existentes.
- Prototipado de aplicaciones de visión por computador: clasificación o descripción de imágenes en entornos de investigación sin acceso a GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona validaciones internas:

- Comparación con el checkpoint BF16 original: similitud semántica media de 0.899 (usando `paraphrase-multilingual-MiniLM-L12-v2`), con 4 coincidencias exactas en los casos funcionales.
- Rendimiento MTP: en una prueba de generación de 128 tokens, el modelo sin MTP alcanzó 15.0 tps, mientras que con MTP llegó a 35.4 tps (speedup de 2.36x). La tasa de aceptación de borradores fue del 96.8%.
- Memoria pico durante la prueba: 17.8 GB, con un tamaño de artefacto de 16.995 GB.

Estos datos son específicos del hardware y del prompt utilizado, y no deben generalizarse.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con 64 GB de memoria unificada (según el autor).
- VRAM estimada: no se especifica, pero el tamaño del artefacto es de ~17 GB, y la memoria pico medida fue de 17.8 GB. En un sistema con 64 GB unificados, cabe sin problemas.
- GPU recomendadas: no aplica (es para Apple Silicon, no para GPUs NVIDIA).
- Opciones de despliegue: oMLX (runtime para MLX) con el comando `omlx serve`, que expone una API compatible con OpenAI. También se puede usar con `vllm-mlx` si se instala el runtime adecuado.
- Latencia y throughput: en la prueba del autor, 35.4 tps con MTP en un Mac con 64 GB. La latencia depende del prompt y del hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría (cuantizaciones 4-bit de modelos vision-language para Apple Silicon). El autor no menciona alternativas, y no hay datos públicos de modelos comparables. Se indica "no disponible".

## Limitaciones y advertencias

- Es una cuantización 4-bit, por lo que puede haber pérdida de precisión respecto al modelo original en tareas complejas.
- No se han publicado benchmarks estándar; las validaciones son internas y limitadas (prompts cortos, máximo 73 tokens de entrada).
- La discrepancia entre el nombre del modelo (27B) y el número de parámetros en safetensors (4.9B) no está aclarada; podría indicar un error en la metadata o que el modelo base es más pequeño de lo que sugiere el nombre.
- Solo funciona en Apple Silicon; no es compatible con GPUs NVIDIA o AMD.
- No se especifican los idiomas soportados, aunque el corpus de calibración es multilingüe.
- El uso comercial está permitido por la licencia Apache 2.0, pero se recomienda verificar la licencia del modelo base Qwen3.8-27B (no se ha confirmado).
- El autor advierte que las mediciones de rendimiento son específicas del artefacto, prompt, contexto y hardware; no deben extrapolarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-oQ4e-MTP
- Runtime oMLX (GitHub): https://github.com/jundot/omlx (revisión `71b9d52039c3058041c5029fdb3d3e833d13d624`)
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.8-27B (no verificado)
