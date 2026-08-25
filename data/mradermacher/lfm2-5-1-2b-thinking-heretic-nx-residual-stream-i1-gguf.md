# mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con matriz de importancia (imatrix) del modelo LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream, una variante modificada del modelo de razonamiento LFM2.5-1.2B-Thinking desarrollado por Liquid AI. La versión original es un modelo denso de 1.200 millones de parámetros con arquitectura híbrida de convolución y atención, optimizado para tareas de razonamiento lógico, matemático y de múltiples pasos. La variante "Heretic" ha sido intervenida mediante técnicas de edición de modelo (abliteration y manipulación del flujo residual) para eliminar los filtros de censura habituales, ofreciendo respuestas sin restricciones de contenido.

El trabajo de cuantización lo realiza mradermacher, quien proporciona una amplia gama de archivos GGUF en diferentes niveles de compresión, desde IQ1_S (0,4 GB) hasta Q4_K_S (0,8 GB), junto con un archivo de imatrix para que los usuarios puedan generar sus propias cuantizaciones. El modelo base se encuentra en el repositorio de 0xzknw, y esta versión está diseñada para ejecutarse en entornos locales como LM Studio, llama.cpp o vLLM, con un contexto de hasta 32.000 tokens. Su licencia es la LFM Open License v1.0, y soporta ocho idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida conv+attention (LFM2.5) |
| Parametros totales | 1.170.340.608 (1,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (según documentación de Liquid AI) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S (también disponibles versiones estáticas en otro repositorio) |
| Idiomas soportados | inglés, árabe, chino, francés, alemán, japonés, coreano, español |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking se construye sobre la arquitectura LFM2, que combina capas de convolución con mecanismos de atención para lograr eficiencia computacional y buena calidad en razonamiento. Está específicamente entrenado para tareas de chain-of-thought, con refuerzo en problemas matemáticos y lógicos. La variante "Heretic" aplica técnicas de edición de modelos, concretamente "abliteration" (eliminación de capas de rechazo) y manipulación del flujo residual ("residual stream") para suprimir los comportamientos de seguridad que el modelo original presenta. No se dispone de datos públicos sobre el número de tokens de entrenamiento ni el conjunto de datos utilizado; la información disponible solo indica que el modelo base fue entrenado por Liquid AI y luego modificado por el autor del repositorio base.

## Capacidades

- Razonamiento de múltiples pasos: el modelo está diseñado para resolver problemas que requieren deducciones encadenadas, especialmente en matemáticas y lógica.
- Generación de texto: produce respuestas coherentes y contextualizadas en los ocho idiomas declarados.
- Soporte de tool calling: según la documentación de vLLM Recipes, el modelo admite llamadas a herramientas, lo que permite integrarlo en agentes que ejecutan funciones externas.
- Conversación y diálogo: optimizado para mantener conversaciones multi-turno con contexto largo (32K tokens).
- Capacidad "uncensored": al eliminar los filtros de seguridad, el modelo puede abordar temas que otros modelos rechazan, aunque esto conlleva riesgos.
- Compatibilidad con entornos de inferencia locales: funciona con llama.cpp, LM Studio, Ollama y vLLM, entre otros.

## Casos de uso

- Asistente de razonamiento en dispositivos móviles: el modelo cabe en menos de 900 MB, por lo que puede ejecutarse en un teléfono para resolver problemas matemáticos o lógicos sin conexión.
- Agente de automatización con herramientas: gracias al soporte de tool calling, se puede integrar en un sistema que llame a APIs, bases de datos o ejecute código, por ejemplo para automatizar tareas de análisis de datos.
- Chatbot sin censura para investigación de sesgos: útil para estudiar cómo se comporta un modelo de lenguaje sin filtros de seguridad, o para aplicaciones donde se requiere contenido no restringido (siempre bajo control humano).
- Generación de código y depuración: con 32K de contexto, puede manejar fragmentos de código largos y sugerir correcciones en varios lenguajes.
- Traducción y procesamiento multilingüe: al soportar ocho idiomas, puede usarse para traducir textos o generar contenido en diferentes lenguas, aunque su tamaño limitado puede afectar la calidad en comparación con modelos mayores.
- Educación matemática: puede explicar paso a paso la resolución de problemas de aritmética, álgebra o lógica, útil para tutores automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación de Liquid AI menciona que LFM2.5-1.2B-Thinking logra el mejor rendimiento en razonamiento para su tamaño, pero no se proporcionan números concretos en este repositorio.

## Requisitos de hardware

- Tamaño de cuantización: los archivos GGUF varían entre 0,4 GB (IQ1_S) y 0,8 GB (Q4_K_S), por lo que requieren menos de 1 GB de almacenamiento.
- VRAM estimada: con cuantizaciones de 4 bits, el modelo necesita aproximadamente 0,8-1,5 GB de VRAM para inferencia, dependiendo del tamaño del contexto.
- GPUs compatibles: funciona en cualquier GPU con al menos 1 GB de VRAM (por ejemplo, GTX 1650, RTX 2050, etc.). También puede ejecutarse en CPU, aunque con menor velocidad.
- Se puede ejecutar en dispositivos móviles (según Liquid AI, cabe en 900 MB de memoria).
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, vLLM, TGI, todos compatibles con GGUF.
- Latencia y throughput: no se proporcionan datos concretos, pero en una GPU moderna se esperan velocidades de decodificación de decenas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Características |
|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (original) | 1,2 B | 32K | LFM Open License v1.0 | Razonamiento, tool calling, multilingüe |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32K | Apache 2.0 | Instrucciones, multilingüe, sin tool calling específico |
| Gemma-2-2B | 2 B | 8K | Gemma license | Generación de texto, no enfocado a razonamiento |
| Llama-3.2-1B | 1 B | 128K | Llama license | Multilingüe, instrucciones, sin tool calling |

La comparativa se basa en características generales; no se dispone de benchmarks que permitan comparar el rendimiento real.

## Limitaciones y advertencias

- La versión "Heretic" ha sido modificada para eliminar filtros de seguridad, lo que puede generar contenido ofensivo, peligroso o ilegal si se usa sin control.
- Al ser un modelo de solo 1,2 B, su capacidad de razonamiento es limitada en comparación con modelos más grandes; puede fallar en problemas complejos o producir alucinaciones.
- La licencia LFM Open License v1.0 puede tener restricciones específicas de uso comercial; se recomienda revisar el texto completo antes de desplegarlo.
- El contexto de 32K tokens es amplio pero no infinito; textos muy largos pueden truncarse.
- La modificación "Heretic" puede afectar la estabilidad del modelo y su coherencia en tareas de razonamiento, ya que la ablación de capas puede degradar el rendimiento original.
- No se han publicado evaluaciones de seguridad o sesgos para esta variante específica, por lo que el riesgo de sesgo o contenido dañino es mayor que en modelos con filtros.

## Enlaces

- Repositorio de cuantizaciones (este): https://huggingface.co/mradermacher/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream-i1-GGUF
- Modelo base de 0xzknw: https://huggingface.co/0xzknw/LFM2.5-1.2B-Thinking-Heretic-NX-Residual-Stream
- Página de Liquid AI sobre LFM2.5-1.2B-Thinking: https://www.liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb
- Documentación técnica de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-1.2b-thinking
- Receta de vLLM para este modelo: https://recipes.vllm.ai/LiquidAI/LFM2.5-1.2B-Thinking
