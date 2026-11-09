# Entrit/tritllm-paper

## Resumen

Entrit/tritllm-paper no es un modelo de lenguaje, sino el repositorio que aloja el artículo técnico "Balanced Ternary Post-Training Quantization for Large Language Models" de Eric Stentzel (Entrit Systems, 2026). El paper describe un códec de cuantización post-entrenamiento (PTQ) que codifica los pesos de un LLM como dígitos ternarios balanceados (t ∈ {−1, 0, +1}) a profundidad configurable, produciendo 3^d niveles de cuantización con escalado por grupo óptimo en MSE. El repositorio contiene el PDF del artículo (17 páginas) y su fuente LaTeX para reproducibilidad; no incluye pesos ni checkpoints.

La relevancia del trabajo reside en que el códec no requiere datos de calibración ni ajuste por modelo: los parámetros globales se seleccionan una sola vez sobre Qwen2.5-7B y se mantienen fijos. A profundidad d = 2 (9 niveles, 3,47 bits por peso) el método retiene el 99,4% del MMLU de FP16 a escala 32B y 72B, y compite con NF4 con un 16% menos de bits. La representación ternaria balanceada sustituye la multiplicación por suma condicional, lo que habilita kernels de inferencia sin multiplicador y encaja con arquitecturas de procesamiento en memoria.

El paper evalúa el códec sobre tres familias (Qwen2.5 0.5B–72B, Llama-3.1-8B y Mistral-7B) en ocho benchmarks estándar y cuatro profundidades. El código del códec y el kernel CUDA se publican por separado bajo Apache 2.0, mientras que el paper lo hace bajo CC BY 4.0. Los checkpoints pre-cuantizados usados en el artículo ya no están alojados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (artículo técnico sobre cuantización PTQ ternaria balanceada para LLMs transformer) |
| Parametros totales | No disponible (no es un modelo; el paper evalúa modelos de 0,5B a 72B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria balanceada a profundidad d = 1–4: d=1 (3 niveles), d=2 (9 niveles, 3,47 bpw), d=3 (27 niveles, 5,05 bpw), d=4 (81 niveles, sin mejora medible) |
| Idiomas soportados | Inglés (idioma declarado del repositorio) |
| Licencia | CC BY 4.0 (paper); códec y kernel Apache 2.0; checkpoints heredan la licencia del modelo origen |
| Formato de pesos | No aplica (el repositorio contiene PDF y fuente LaTeX; no hay pesos) |

## Arquitectura y entrenamiento

El códec representa cada peso como una suma de *d* dígitos ternarios balanceados, con *t<sub>i</sub>* ∈ {−1, 0, +1}, generando 3^d niveles de cuantización y aplicando escalado por grupo óptimo en términos de MSE. Los parámetros globales del códec se fijan una única vez sobre Qwen2.5-7B y se mantienen constantes en todos los modelos posteriores, de modo que las ejecuciones PTQ no requieren ajuste por modelo ni datos de calibración. Cada checkpoint escrito registra una huella (identificador de modelo, revisión, versión del códec y mapeo profundidad-potencia), lo que permite reconstruir checkpoints idénticos a los del paper.

La evaluación cubre tres familias (Qwen2.5 de 0,5B a 72B, Llama-3.1-8B y Mistral-7B) a cuatro profundidades sobre ocho benchmarks. A escala pequeña, un entrenamiento consciente de la cuantización (QAT) por bloques recupera la mayor parte de la brecha: en Qwen2.5-7B a d = 2, el QAT sitúa MMLU a 1,2 puntos porcentuales de FP16 y recupera GSM8K de 53,2 a 78,5 (frente a 81,0 de FP16). La calidad satura en d = 3 y un cuarto trit no aporta mejora medible. La innovación principal es la sustitución de la multiplicación por suma condicional, que permite kernels GEMV sin multiplicador; los benchmarks por capa proyectados a generación completa de tokens reportan una aceleración de 7,8× frente a cuBLAS FP16 en una RTX 4090, si bien se trata de proyecciones solo de kernel, no de throughput de serving extremo a extremo.

## Capacidades

- Cuantización post-entrenamiento de pesos de LLM a representación ternaria balanceada con profundidad configurable (d = 1 a 4).
- Sin necesidad de datos de calibración ni ajuste de parámetros por modelo.
- Escalado por grupo óptimo en MSE y huella de reproducibilidad en cada checkpoint.
- Entrenamiento consciente de la cuantización (QAT) por bloques opcional para escalas pequeñas.
- Inferencia sin multiplicador mediante kernels GEMV basados en suma condicional.
- Evaluación multi-modelo y multi-benchmark (ocho benchmarks estándar).
- No es un modelo generativo: no soporta tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en cuantización de LLM: el paper y su fuente LaTeX permiten reproducir los experimentos y comparar el códec ternario balanceado con NF4 y otras técnicas PTQ.
- Despliegue de LLM en hardware con restricciones de multiplicador: el códec habilita kernels sin multiplicador adecuados para arquitecturas de procesamiento en memoria donde eliminar circuitos multiplicadores es la restricción principal de diseño.
- Compresión de modelos a gran escala: a d = 2 se retiene el 99,4% del MMLU de FP16 en modelos de 32B y 72B, lo que permite servir modelos grandes con 3,47 bits por peso.
- Evaluación de compromiso calidad-bits: la saturación en d = 3 (5,05 bpw) ofrece una guía concreta para elegir profundidad según el presupuesto de bits disponible.
- Recuperación de calidad en modelos pequeños: el QAT por bloques documentado en Qwen2.5-7B sirve como receta para mitigar la degradación de GSM8K en escalas reducidas.
- Integración en pipelines de cuantización existentes: al no requerir calibración, el códec puede aplicarse de forma automatizada sobre checkpoints nuevos manteniendo la huella de reproducibilidad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Retención de MMLU FP16 a d = 2 (32B y 72B) | 99,4% |
| Bits por peso a d = 2 | 3,47 bpw (9 niveles) |
| Comparación con NF4 a d = 2 | Competitivo con un 16% menos de bits |
| Qwen2.5-7B d = 2 + QAT, MMLU | A 1,2 puntos porcentuales de FP16 |
| Qwen2.5-7B d = 2 + QAT, GSM8K | 78,5 (FP16: 81,0; sin QAT: 53,2) |
| Saturación de calidad | d = 3 (27 niveles, 5,05 bpw); d = 4 sin mejora medible |
| Aceleración GEMV proyectada (RTX 4090) | 7,8× frente a cuBLAS FP16 (solo kernel, no extremo a extremo) |

No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K y los cinco restantes) para cada modelo y profundidad.

## Requisitos de hardware

- No aplica VRAM de inferencia propia: el repositorio no contiene pesos desplegables.
- Los benchmarks de kernel se realizaron sobre una NVIDIA RTX 4090.
- El códec y el kernel CUDA se distribuyen por separado (Entrit/tritllm-codec y Entrit/tritllm-kernel) bajo Apache 2.0.
- Los checkpoints pre-cuantizados del paper (Qwen2.5 0.5B–72B, Llama-3.1-8B y Mistral-7B-v0.3 a d = 1–4, y el Qwen2.5-7B d = 2 con QAT) ya no están alojados.
- Opciones de despliegue, latencia y throughput extremo a extremo: no disponibles.

## Comparativa con modelos similares

| Criterio | TritLLM (códec ternario balanceado) | NF4 (bitsandbytes) | Cuantización ternaria tipo BitNet/Ternary |
|---|---|---|---|
| Bits por peso | 3,47 bpw a d = 2 | 4 bpw | Típicamente ~1,58 bpw (ternaria pura) |
| Niveles | 3^d (9 a d = 2) | 16 | 3 |
| Calibración | No requiere | Requiere datos de calibración | Depende de la variante |
| Multiplicador en inferencia | Eliminado (suma condicional) | Mantenido | Eliminado en variantes multiply-free |
| Retención MMLU | 99,4% de FP16 a 32B/72B (d = 2) | No disponible en la información | No disponible en la información |
| Licencia | CC BY 4.0 (paper) / Apache 2.0 (código) | No disponible en la información | No disponible en la información |

Los datos de NF4 y de las variantes ternarias no se detallan en la información proporcionada; la comparación se limita a los puntos que el paper menciona explícitamente.

## Limitaciones y advertencias

- El repositorio no contiene un modelo desplegable: solo el PDF del paper y su fuente LaTeX.
- Los checkpoints pre-cuantizados usados en el paper ya no están alojados; hay que reconstruirlos con el códec.
- La aceleración de 7,8× es una proyección solo de kernel (GEMV por capa) y excluye atención, muestreo y sobrecarga del tokenizador; no representa throughput de serving extremo a extremo.
- La calidad se degrada a escalas pequeñas sin QAT: en Qwen2.5-7B a d = 2, GSM8K cae de 81,0 a 53,2 sin QAT.
- El paper describe la primera generación del códec; los modelos actuales de Entrit usan el códec d2 más reciente.
- Los métodos descritos están sujetos a solicitudes de patente pendientes de Entrit Systems; el despliegue comercial de los métodos subyacentes puede requerir una licencia separada (contacto: eric@entrit.io).
- Los checkpoints construidos heredan la licencia del modelo origen: Apache 2.0 para Qwen2.5 y Mistral, y Llama 3.1 Community License con atribución "Built with Llama" para Llama-3.1-8B.
- Idioma declarado del repositorio: únicamente inglés.
- No se han publicado en la información disponible datos sobre sesgos, alucinación o comportamiento multilingüe del códec.

## Enlaces

- Repositorio del paper en Hugging Face: https://huggingface.co/Entrit/tritllm-paper
- Código del códec: https://huggingface.co/Entrit/tritllm-codec
- Kernel CUDA sin multiplicador: https://huggingface.co/Entrit/tritllm-kernel
- Página de Entrit Systems en Hugging Face: https://huggingface.co/Entrit
- PDF del paper (en el repositorio): Balanced-Ternary-PTQ.pdf
- Fuente LaTeX (en el repositorio): source.tar
- Contacto: eric@entrit.io
