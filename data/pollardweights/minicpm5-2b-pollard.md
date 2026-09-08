# PollardWeights/MiniCPM5-2B-Pollard

## Resumen
MiniCPM5-2B-Pollard es una versión cuantizada del modelo openbmb/MiniCPM5-2B, desarrollada por PollardWeights mediante su metodología Pollard Weights. El objetivo principal es reducir drásticamente el tamaño del modelo manteniendo una calidad aceptable: pasa de 5.0 GB en fp16 a 1.41 GB en formato IQ4_XS, lo que supone un 72% de reducción. Esta compresión se consigue con una asignación de bits basada en la sensibilidad de cada capa, en lugar de aplicar una cuantización uniforme. El modelo tiene 2.516.756.480 parámetros (aproximadamente 2.5B) y su licencia es Apache 2.0. La longitud de contexto no se especifica en la información disponible. Es relevante para desarrolladores que necesitan ejecutar modelos de lenguaje en hardware modesto o en entornos con restricciones de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no se especifica en la información proporcionada) |
| Parámetros totales | 2.516.756.480 (modelo base openbmb/MiniCPM5-2B) |
| Parámetros activos | No disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ4_XS, Q5_K_M, Q6_K |
| Idiomas soportados | Inglés (según metadata del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado; el modelo base original usa safetensors) |

## Arquitectura y entrenamiento
Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo base openbmb/MiniCPM5-2B. La técnica utilizada, denominada Pollard Weights, aplica una asignación de bits por capa basada en la sensibilidad de cada una, bajo un presupuesto de tamaño total. Esto contrasta con las cuantizaciones uniformes tradicionales, que tratan todas las capas por igual. En la información disponible no se detallan ni la arquitectura interna del modelo base ni los datos o métodos de entrenamiento originales (como RLHF, DPO o la composición del dataset). Tampoco se han publicado aún las métricas de rendimiento de la cuantización (perplejidad y Mean-KLD), como se indica en el README del autor.

## Capacidades
- Generación de texto conversacional en inglés, según la metadata del repositorio (pipeline de text-generation).
- Soporte de cuantización mixta con tres tamaños seleccionables: IQ4_XS (1.41 GB), Q5_K_M (1.74 GB) y Q6_K (2.07 GB), lo que permite ajustar la relación entre calidad y consumo de memoria.
- Compatibilidad con ejecución en local mediante llama.cpp, ik_llama.cpp, Ollama o LM Studio en formato GGUF.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni otras capacidades especiales en la información disponible.

## Casos de uso
- Asistente conversacional ligero para dispositivos de escritorio: gracias al fichero IQ4_XS de 1.41 GB, el modelo puede ejecutarse en portátiles o mini PC con CPU, sin necesidad de una GPU dedicada.
- Comparación de estrategias de cuantización: al disponer de tres cuantizaciones distintas, se puede evaluar el impacto en la calidad de la generación de texto en el mismo modelo base.
- Prototipado de respuestas automáticas en inglés: adecuado para aplicaciones de soporte o preguntas frecuentes que requieran respuestas cortas y no necesiten un contexto muy amplio.
- Despliegue en contenedores ligeros para servicios de texto simples: su baja huella de memoria permite integrarlo en imágenes Docker pequeñas para pruebas o entornos limitados.
- Uso educativo para estudiar la cuantización de modelos: la documentación explica el concepto de asignación de bits por sensibilidad, y los archivos GGUF están listos para ejecutar y verificar el resultado.
- Base para experimentos de adaptación o investigación: al estar licenciado bajo Apache 2.0 y partir de un modelo de 2B, puede utilizarse como punto de partida para estudiar técnicas de compresión y despliegue eficiente de LLMs.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El README del repositorio indica que las métricas de perplejidad (PPL) y de divergencia media de Kullback-Leibler (Mean KLD) están pendientes de cálculo, por lo que no existe una validación cuantitativa del rendimiento de esta cuantización respecto al modelo original.

## Requisitos de hardware
- VRAM estimada para inferencia (orientativa, según tamaño del fichero y overhead de contexto): IQ4_XS (~1.41 GB) requiere aproximadamente 2-3 GB de VRAM; Q5_K_M (~1.74 GB) unos 2.5-3.5 GB; y Q6_K (~2.07 GB) unas 3-4 GB.
- GPU recomendadas: cualquier tarjeta con al menos 4 GB de VRAM, como RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU con suficiente RAM.
- ¿Cabe en GPU de consumo? Sí, en GPUs de 4 GB o menos, en función de la cuantización elegida.
- Opciones de despliegue: llama.cpp (para los quants K), ik_llama.cpp (para los formatos Trellis), Ollama, LM Studio y cualquier integración compatible con archivos GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares
No se dispone de información suficiente para una comparativa rigurosa. En el perfil del autor existe otro modelo cuantizado, Qwen2.5-1.5B-Instruct-Pollard, pero no se incluyen sus especificaciones en los datos disponibles. A continuación se muestra una tabla parcial con los datos conocidos:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-Pollard | 2.516.756.480 | No disponible | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct-Pollard | No disponible | No disponible | No disponible | HuggingFace |
| openbmb/MiniCPM5-2B (base) | No disponible | No disponible | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias
- El modelo solo está documentado para inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Las métricas de calidad de la cuantización (PPL, Mean-KLD) están pendientes de publicación, por lo que no hay validación empírica del impacto de la compresión.
- La arquitectura y la longitud de contexto del modelo base no están especificadas en la información disponible, lo que limita el uso en tareas que requieren un contexto largo.
- El formato Trellis (IQ*_KT) solo es compatible con ik_llama.cpp; los archivos K-quants (Q5_K_M, Q6_K) funcionan con llama.cpp estándar.
- No se documentan sesgos explícitos, pero al tratarse de un modelo de 2B es probable que presente alucinaciones y limitaciones de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero no incluye garantías de rendimiento ni soporte técnico.

## Enlaces
- Repositorio en HuggingFace: https://huggingface.co/PollardWeights/MiniCPM5-2B-Pollard
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio de Pollard Weights: https://github.com/WestWaters/pollard-weights
- Repositorio de ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Perfil del autor: https://huggingface.co/PollardWeights
