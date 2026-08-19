# nRanzo/mlx-community-Qwythos-9B-v2-OptiQ-4bit-MTPLX

## Resumen

El modelo `nRanzo/mlx-community-Qwythos-9B-v2-OptiQ-4bit-MTPLX` es una adaptación del modelo de razonamiento Qwythos-9B-v2, desarrollado por Empero AI sobre la base de Qwen3.5-9B, convertido a formato MLX y cuantizado a 4-bit por la comunidad MLX. Sobre esta versión cuantizada, el autor nRanzo ha aplicado una técnica de decodificación especulativa multi-token (MTP) nativa, denominada MTPLX Forge, que elimina la necesidad de un modelo draft externo y aprovecha la cabecera MTP interna del propio modelo.

Esta ficha es relevante porque ofrece una solución concreta para acelerar la inferencia de un modelo de razonamiento de 9B en hardware Apple Silicon, logrando un aumento de rendimiento de 1,85× respecto a la línea base autoregresiva, con una tasa de aceptación media del 93% en profundidad D2. El modelo está pensado para desarrolladores que ejecutan LLMs localmente en Macs con el framework MLX y necesitan reducir la latencia sin sacrificar la calidad de la distribución muestreada.

El repositorio pesa 8,2 GB y los pesos se distribuyen en formato safetensors. Según los metadatos, el archivo contiene 2.372.099.312 parámetros, cifra que corresponde al modelo cuantizado; el modelo original se anuncia como de 9B de parámetros. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B) con cabecera MTP (multi-token prediction) |
| Parametros totales | 2.372.099.312 (según safetensors; el modelo base se anuncia como 9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Qwythos-9B-v2, es un modelo de razonamiento de Empero AI construido sobre Qwen3.5-9B. La versión v2 incorpora FTPO (Final-Token Preference Optimization), una técnica que actúa sobre las posiciones de token donde comienzan los bucles de repetición, entrenando al modelo para preferir alternativas coherentes. No se han publicado detalles sobre el dataset de entrenamiento ni el número de tokens utilizados.

La adaptación MTPLX no implica un reentrenamiento del modelo, sino una modificación de su arquitectura de inferencia. Según el repositorio GitHub MLX-MTP, se ejecuta la cabecera MTP interna del modelo con MLX, sin necesidad de un modelo draft externo. El proceso utiliza muestreo por rechazo basado en la razón de probabilidades y corrección residual, de modo que la decodificación estocástica preserva la distribución objetivo cuando el draft y el target usan el mismo sampler. Esta técnica es específica para Qwythos 9B OptiQ, que dispone de una única cabecera MTP física.

## Capacidades

- Generación de texto con capacidad de razonamiento paso a paso, heredada del modelo base Qwythos-9B-v2.
- Decodificación especulativa multi-token (MTP) nativa en MLX, que acelera la inferencia sin modelo draft externo.
- Compatibilidad con Apple Silicon mediante el framework MLX (probado en Apple M4 Pro con macOS 26.6.2).
- Preservación de la distribución de muestreo gracias al mecanismo de rechazo con corrección residual.
- No se documentan capacidades explícitas de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Asistente de razonamiento local en Mac: el modelo puede resolver problemas de lógica, matemáticas o planificación directamente en un MacBook Pro, aprovechando la aceleración MTP para obtener respuestas más rápidas que con la decodificación autoregresiva estándar.
- Generación de código con explicaciones: al ser un modelo de razonamiento, puede generar fragmentos de código comentados y explicar algoritmos, útil para entornos de desarrollo sin conexión.
- Análisis de documentos extensos: aunque la longitud de contexto no está documentada, el modelo base Qwen3.5 soporta contextos largos; en este formato MLX puede procesar documentos en local sin enviar datos a servidores externos.
- Prototipado de aplicaciones de IA en Apple Silicon: los desarrolladores pueden integrar este modelo en aplicaciones macOS o iOS mediante MLX, beneficiándose de la baja latencia para interacciones en tiempo real.
- Investigación sobre decodificación especulativa: el repositorio MLX-MTP proporciona una implementación de referencia para estudiar MTP sin modelos draft, útil para académicos y desarrolladores que exploran técnicas de aceleración.
- Despliegue offline en entornos con requisitos de privacidad: al ejecutarse completamente en local, es adecuado para procesar datos sensibles sin conexión a la nube.

## Benchmarks y rendimiento

Los datos de rendimiento publicados en la model card se refieren exclusivamente a la aceleración MTP, no a benchmarks de calidad estándar (MMLU, HumanEval, etc.). Se resumen en la siguiente tabla:

| Metrica | Resultado |
|---|---|
| Speedup vs. línea base autoregresiva | 1,85× |
| Throughput | 67,1 tok/s (línea base: 36,3 tok/s) |
| Mejor profundidad | D2 |
| Tasa de aceptación media en D2 | 93% |
| Hardware / SO | Apple M4 Pro · macOS 26.6.2 |
| Configuración del sampler | temp=0,6 · top_p=0,95 · top_k=20 |

No se han publicado resultados de benchmarks de calidad (razonamiento, conocimiento, código) en la información disponible.

## Requisitos de hardware

- Hardware: Apple Silicon (M1 a M5, según el ecosistema MLX). El modelo fue probado en Apple M4 Pro.
- Memoria: no se especifica la VRAM requerida. Dado que el modelo cuantizado a 4-bit tiene aproximadamente 2,37 mil millones de parámetros, se estima un consumo de memoria de entre 2 y 3 GB, pero este dato no ha sido confirmado por el autor.
- GPU recomendada: cualquier GPU integrada de Apple Silicon; el modelo se ejecuta en la GPU unificada del chip.
- Opciones de despliegue: mediante la herramienta `mtplx` (comandos `mtplx pull` y `mtplx start chat`), o integrando los pesos en proyectos MLX personalizados. También es compatible con herramientas como mlx-optiq para cuantización y servir modelos.
- Latencia y throughput: 67,1 tok/s en Apple M4 Pro con la configuración indicada, lo que equivale a aproximadamente 15 ms por token.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (modelos de razonamiento cuantizados en MLX con decodificación especulativa). La única comparación directa publicada es contra su propia línea base autoregresiva, ya descrita en la sección de benchmarks. No se han identificado otros modelos MTPLX comparables en el momento de redactar esta ficha.

## Limitaciones y advertencias

- El soporte de MTP está limitado exclusivamente a Qwythos 9B OptiQ; no funciona con otros modelos, según el repositorio GitHub.
- Requiere hardware Apple Silicon; no es ejecutable en GPUs NVIDIA o AMD convencionales.
- No se han publicado evaluaciones de calidad (sesgos, alucinación, precisión en tareas) para esta versión cuantizada y adaptada.
- La longitud de contexto no está documentada, lo que impide garantizar su comportamiento en entradas muy largas.
- Aunque la licencia Apache-2.0 permite uso comercial, es recomendable verificar la licencia del modelo base Qwen3.5-9B y las condiciones de Empero AI para usos específicos.
- La herramienta `mtplx` es un proyecto de terceros; su estabilidad y mantenimiento no están garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nRanzo/mlx-community-Qwythos-9B-v2-OptiQ-4bit-MTPLX
- Repositorio MLX-MTP (GitHub): https://github.com/nRanzo/MLX-MTP
- Modelo base cuantizado: https://huggingface.co/mlx-community/Qwythos-9B-v2-OptiQ-4bit
- Modelo Qwythos-9B-v2 en MLX (bf16): https://huggingface.co/xunkutech-ai/Qwythos-9B-v2-MLX-bf16
- Empero AI (laboratorio de investigación): https://empero.org/
- Documentación de mlx-optiq: https://mlx-optiq.com/
