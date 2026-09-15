# LaelaZorana/spmv-csr-triton-gpu-kernels

## Resumen

Este repositorio no contiene un modelo de IA generativa, sino una colección de tres kernels Triton para calcular el producto de una matriz dispersa por un vector (SpMV) en formato CSR. Lo desarrolla LaelaZorana y su aporte principal es una regla de selección automática del kernel basada en mediciones reales, en lugar de la recomendación teórica habitual. Los tres kernels comparten la misma interfaz y difieren en cómo distribuyen el trabajo entre los hilos y programas de la GPU. El repositorio incluye evidencia empírica en dos tarjetas gráficas (Nvidia RTX 4090 y AMD Instinct MI300X) que muestra que el diseño balanceado por número de no ceros, recomendado en muchos tutoriales, no es siempre el más rápido.

La regla de selección se implementa en la función `pick()` y se basa en la longitud máxima de fila, la media de la fila y el nombre del dispositivo. En las pruebas realizadas, el kernel `vector_per_row` gana en tres de cuatro escenarios, mientras que `nnz_balanced` solo gana en matrices de cola pesada en la tarjeta AMD. No se trata de un modelo con parámetros ni con longitud de contexto, por lo que las especificaciones habituales de modelos de lenguaje no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tres kernels Triton para SpMV en CSR: thread_per_row, vector_per_row, nnz_balanced |
| Parámetros totales | No disponible (no es un modelo de parámetros) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible (no aplica) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el repositorio contiene código Python/Triton) |

## Arquitectura y entrenamiento

El repositorio implementa tres estrategias de paralelización para el producto matriz dispersa por vector. `thread_per_row` asigna una fila a un solo hilo; `vector_per_row` asigna una fila a un programa que la recorre en bloques; `nnz_balanced` reparte los no ceros en bloques de igual tamaño y acumula el resultado con operaciones atómicas. No hay entrenamiento: se trata de kernels escritos en Triton y compilados en tiempo de ejecución. La selección automática (función `pick`) decide qué kernel usar leyendo la longitud máxima de fila, la media de la fila y el nombre del dispositivo. La elección se basa en los tiempos medidos en las dos tarjetas y en las dos matrices sintéticas descritas en el README.

## Capacidades

- Cálculo de SpMV en formato CSR para matrices con distribución uniforme o de ley de potencias.
- Selección automática del kernel según las características de la matriz y la GPU.
- Tres kernels invocables individualmente.
- Generación de `row_ids` para el kernel `nnz_balanced`.
- Compatibilidad con torch (se valida con `allclose` contra una referencia).
- Soporte para Nvidia y AMD (ROCm) mediante Triton.

## Casos de uso

- Simulación numérica: resolver sistemas lineales dispersos en métodos de elementos finitos. El kernel `vector_per_row` reduce el tiempo de cómputo en matrices con filas de longitud variable.
- Análisis de grafos: calcular PageRank o centralidad. La multiplicación matriz-vector es la operación dominante; la selección automática adapta el kernel a la distribución de grados del grafo.
- Sistemas de recomendación: aplicar transformaciones a matrices de interacción usuario-elemento. La función `pick` evita tener que elegir kernel manualmente.
- Aprendizaje automático: implementar capas de atención dispersa o embeddings. El producto matriz-vector disperso puede acelerar el forward pass.
- Optimización en redes: resolver flujos o cortes mediante métodos iterativos. La baja latencia en matrices uniformes permite iteraciones rápidas.
- Procesamiento de señales: aplicar filtros en representaciones dispersas de señales. La interfaz simple permite integrar el kernel en pipelines existentes.

## Benchmarks y rendimiento

**Nvidia RTX 4090, torch 2.8.0+cu128, triton 3.4.0**

| Matriz | Longitud máxima de fila | thread_per_row (µs) | vector_per_row (µs) | nnz_balanced (µs) | Ganador |
|---|---|---|---|---|---|
| uniform 32 | 32 | 1095.7 | 743.7 | 1040.7 | vector_per_row |
| power law | 1,135,318 | 98,619.1 | 1,508.0 | 4,288.6 | vector_per_row |

**AMD Instinct MI300X, torch 2.9.1+rocm6.3, triton 3.5.1**

| Matriz | Longitud máxima de fila | thread_per_row (µs) | vector_per_row (µs) | nnz_balanced (µs) | Ganador |
|---|---|---|---|---|---|
| uniform 32 | 32 | 2166.5 | 561.3 | 4339.1 | vector_per_row |
| power law | 1,021,722 | 227,434.7 | 5,068.8 | 4,418.4 | nnz_balanced |

Los tiempos son medianas de 20 ejecuciones tras 5 warmups, con sincronización del dispositivo en cada parada. En una matriz uniforme, `nnz_balanced` es 7.7 veces más lento que `vector_per_row` en la MI300X. En la RTX 4090, `vector_per_row` gana tres de cuatro escenarios; la regla de selección devuelve `vector_per_row` salvo en cola pesada en AMD.

## Requisitos de hardware

- GPU compatible con Triton y PyTorch: probado en Nvidia RTX 4090 y AMD Instinct MI300X.
- No requiere VRAM específica para pesos, ya que no es un modelo. El consumo depende del tamaño de la matriz y de los buffers temporales.
- No es desplegable con vLLM, Ollama ni TGI; se usa como biblioteca Python.
- Versiones de software: torch 2.8.0+cu128 y triton 3.4.0 en Nvidia; torch 2.9.1+rocm6.3 y triton 3.5.1 en AMD.
- La latencia medida está en las tablas de benchmarks.

## Comparativa con modelos similares

No se han encontrado comparativas externas publicadas en la información disponible. La comparativa interna entre los tres kernels del repositorio se presenta en la sección de benchmarks.

## Limitaciones y advertencias

- El rendimiento depende críticamente de la distribución de longitudes de fila; el mismo kernel puede ser 65 veces más lento si cambia la distribución.
- `nnz_balanced` requiere construir un vector de índices de fila por no cero, cuya generación puede costar más de lo que ahorra.
- Los resultados se midieron en dos tarjetas específicas y con versiones concretas de PyTorch y Triton; no se garantiza que se extrapolen a otros entornos.
- El repositorio no incluye un modelo de lenguaje ni capacidades de generación de texto.
- La licencia Apache-2.0 permite uso comercial, pero hay que mantener el aviso de atribución según la sección 4.

## Enlaces

- HuggingFace: https://huggingface.co/LaelaZorana/spmv-csr-triton-gpu-kernels
