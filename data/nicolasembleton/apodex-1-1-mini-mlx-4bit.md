# nicolasembleton/Apodex-1.1-mini-MLX-4bit

## Resumen

Apodex-1.1-mini-MLX-4bit es una conversión a formato MLX (librería de Apple para inferencia en silicio de Apple) del modelo Apodex-1.1-mini, desarrollado por el equipo de Apodex. Este modelo base es un MoE (mixture-of-experts) de 36 mil millones de parámetros totales con solo 3 mil millones activos por token, construido sobre la arquitectura Qwen3.5-35B-A3B. El proyecto Apodex se presenta como un "solucionador de tareas pesadas" orientado a investigación y razonamiento complejo, con un paper en arXiv que lo describe como un sistema de inteligencia agéntica para tareas profesionales de alto nivel.

Esta versión en MLX reduce los pesos a cuantización de 4 bits (grupo de 64, 4,503 bits por peso), lo que deja el modelo en 19,5 GB y lo hace ejecutable en equipos con memoria unificada suficiente. El repositorio pesa 19,5 GB y está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones. La conversión elimina el tower de visión del modelo original, por lo que esta versión es exclusivamente de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-35B-A3B (MoE) con atencion hibrida (lineal/completa) |
| Parametros totales | 36B (según model card del autor) |
| Parametros activos | 3B (8 expertos activos de 256 totales) |
| Longitud de contexto | 262144 posiciones maximas |
| Tipos de cuantizacion | 4-bit affine, group size 64, bits por peso 4.503 |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Apodex-1.1-mini emplea una arquitectura MoE con 256 expertos en total, de los cuales se activan 8 por token. La red se compone de 40 capas con atención híbrida: una mezcla de atención lineal (eficiente en memoria) y atención completa (full attention) para manejar el contexto largo de 262.144 posiciones. La conversión a MLX elimina el tower de visión del modelo original, dejando únicamente el componente de lenguaje.

Los detalles de entrenamiento del modelo base no se detallan en la información proporcionada. El paper de arXiv (2608.23283) describe a Apodex 1.1 como un sistema de "inteligencia agéntica" que alcanza rendimiento de primer nivel en finanzas, investigación científica, matemáticas, codificación y búsqueda, con un modelo de 35B que mantiene capacidad de trabajo en despliegue local. No se especifican los datos de entrenamiento ni si se usó RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto y razonamiento complejo, orientado a tareas de investigación y resolución de problemas de alta exigencia.
- Capacidad de agente (agentic intelligence) según el paper de arXiv, con razonamiento multi-paso verificado.
- Soporte de tool calling / function calling: no confirmado en la información disponible, aunque la arquitectura Qwen3.5 lo soporta de forma nativa en el modelo base.
- Capacidades multilingües: no disponibles en la información.
- Solo texto: el tower de visión fue eliminado en la conversión, por lo que no procesa imágenes.
- Conversacional: el pipeline es text-generation y el tokenizer incluye chat template (se puede usar con mensajes de chat).

## Casos de uso

- Investigación científica de alto nivel: el modelo puede procesar literatura técnica, razonar sobre hipótesis y generar resúmenes estructurados de papers complejos, gracias a su ventana de contexto de 262K tokens que permite cargar documentos extensos completos.
- Análisis financiero y de mercado: con capacidad de razonamiento multi-paso, puede descomponer informes financieros, detectar patrones y generar análisis de riesgo con justificación paso a paso.
- Generación de código en entornos de desarrollo: aunque no se confirma tool calling, el modelo base de Qwen3.5 soporta generación de código y puede integrarse en pipelines de CI/CD para generar tests o documentación de repositorios.
- Resolución de problemas matemáticos avanzados: útil en entornos educativos o de investigación, donde puede descomponer problemas complejos y mostrar el razonamiento intermedio.
- Búsqueda y síntesis de información en tareas de consultoría: puede procesar grandes volúmenes de texto, extraer hechos clave y generar informes ejecutivos con citas verificables.
- Automatización de tareas profesionales en despachos o departamentos de I+D: con su licencia Apache 2.0, puede desplegarse internamente para tareas de redacción, análisis de contratos o resumen de reuniones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de arXiv (2608.23283) menciona que Apodex 1.1 alcanza la banda de rendimiento líder en tareas profesionales complejas, finanzas, investigación científica, matemáticas, codificación y búsqueda, pero no se incluyen números concretos en los datos proporcionados. No se dispone de resultados de MMLU, HumanEval, GSM8K ni otros estándares para esta versión MLX.

## Requisitos de hardware

- Tamaño del modelo en 4-bit: 19.5 GB (repo completo).
- VRAM estimada para inferencia: se recomienda al menos 24 GB de memoria unificada para cargar el modelo y operar con contexto corto (menos de 32k tokens).
- GPU recomendadas: en Apple Silicon, se recomienda un chip con al menos 48 GB de memoria unificada para prefill con contexto largo (según la model card). En sistemas con menos de 48 GB, mantener contexto por debajo de 32k tokens para evitar OOM en Metal.
- En GPUs de consumo (RTX 3090, RTX 4090 con 24 GB VRAM) podría cargar el modelo en 4-bit, pero no hay soporte oficial de MLX en NVIDIA; se necesitaría una conversión a otro formato (GGUF, etc.) que no está disponible.
- Opciones de despliegue: mlx-lm (biblioteca oficial de MLX) para Apple Silicon. No hay versiones para vLLM, llama.cpp u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos de la misma categoría en la información proporcionada. El modelo es un MoE de 36B/3B activos, similar a otros modelos MoE como Qwen3-30B-A3B, pero no hay información sobre rendimiento relativo. Se recomienda consultar el paper de arXiv para obtener comparaciones con modelos frontier, aunque esos datos no se han extraído aquí.

## Limitaciones y advertencias

- Problemas de memoria en contexto largo: la model card advierte de OOM en Metal durante prefill de contexto largo en sistemas con menos de 48 GB de memoria unificada. Se recomienda mantener contexto por debajo de 32k tokens en estos equipos.
- Solo texto: la torre de visión fue eliminada, por lo que no se puede usar para tareas multimodales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de investigación sin verificación externa.
- Sin datos de sesgos: no se ha publicado información sobre sesgos o comportamiento en grupos subrepresentados.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales (no indicado en la información).
- No se dispone de datos de entrenamiento, por lo que no se puede evaluar la calidad de los datos o su diversidad lingüística.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/nicolasembleton/Apodex-1.1-mini-MLX-4bit
- HuggingFace del modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Paper de Apodex 1.1 (arXiv): https://arxiv.org/abs/2608.23283
- Web oficial de Apodex: https://www.apodex.com/
- Web alternativa de Apodex: https://www.apodex.ai/
- Modelo Apodex-1.0-mini: https://huggingface.co/apodex/Apodex-1.0-mini
