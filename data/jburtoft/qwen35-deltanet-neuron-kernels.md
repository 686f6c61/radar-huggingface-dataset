# jburtoft/qwen35-deltanet-neuron-kernels

## Resumen

Este repositorio de Hugging Face, `jburtoft/qwen35-deltanet-neuron-kernels`, no contiene un modelo de lenguaje, sino un conjunto de kernels NKI (Neuron Kernel Interface) diseñados para acelerar la implementación del módulo `Qwen3_5GatedDeltaNet` en hardware AWS Neuron (Trainium e Inferentia). El objetivo era sustituir la implementación de referencia de la capa de atención lineal Gated DeltaNet de Qwen3.5 por una versión optimizada que mantiene la matriz de estado recurrente (128×128 en float32) en la memoria on-chip SBUF, eliminando los accesos a HBM por token.

El repositorio está marcado como **deprecated** y ha sido **vaciado deliberadamente** de todo código de kernels. El autor lo retiró porque la implementación tenía fallos críticos: la decodificación autoregresiva no funcionaba correctamente (ignoraba `cache_params`), el prefill usaba una recurrencia serial ineficiente, y existía una regresión con `torch.compile` para batch ≥ 2. Todo el código funcional se ha movido al repositorio `jburtoft/qwen35-deltanet-tkg-full`, que corrige estos problemas y añade prefill por chunks, fusión de operaciones elementwise y soporte correcto de decodificación.

En su estado actual, este repositorio no ofrece ningún recurso utilizable. Cualquier intento de cargar código desde aquí, incluso desde revisiones históricas, devolverá un repositorio vacío. La única utilidad práctica es como referencia de migración hacia el nuevo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels NKI para la capa Gated DeltaNet de Qwen3.5 (no es un modelo completo) |
| Parametros totales | no disponible (no aplica, es codigo de kernels) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio vacio; no contiene pesos ni safetensors) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino kernels de aceleración para la capa de atención lineal Gated DeltaNet que forma parte de la arquitectura híbrida de Qwen3.5. Según el análisis disponible en GitHub, Qwen3.5 intercala dos tipos de capas de mezcla de tokens: atención completa (softmax con GQA y RoPE) y capas lineales Gated DeltaNet, una variante de la regla delta con gating. La capa recurrente mantiene un estado de 128×128 en float32.

Los kernels NKI aquí alojados pretendían ejecutar esa capa en los aceleradores AWS Neuron, manteniendo el estado recurrente en la memoria local del núcleo (SBUF) para evitar transferencias a HBM por token. Sin embargo, la implementación era defectuosa: la decodificación autoregresiva no propagaba correctamente el estado recurrente, el prefill se hacía con un bucle Python serial sobre (batch, head), y había una regresión con `torch.compile` para batch ≥ 2. El autor decidió retirar el código y reescribirlo en el repositorio `tkg-full`, que resuelve estos problemas con un kernel por chunks y paralelizado sobre todos los slices.

## Capacidades

- No es un modelo de IA; es un repositorio de kernels de aceleración para hardware AWS Neuron.
- El repositorio está vacío y deprecado; no ofrece ninguna capacidad funcional.
- El código funcional equivalente se encuentra en `jburtoft/qwen35-deltanet-tkg-full`, que sí implementa:
  - Decodificación autoregresiva correcta con propagación del estado recurrente.
  - Prefill por chunks con paralelización sobre batch y heads.
  - Fusión de la normalización RMS con gating y normalización dentro del kernel.
  - Corrección de la regresión de `torch.compile` para batch ≥ 2.

## Casos de uso

- **Migración a la nueva ubicación**: el único caso de uso real de este repositorio es como punto de partida para actualizar cualquier código que referencie a `jburtoft/qwen35-deltanet-neuron-kernels` hacia `jburtoft/qwen35-deltanet-tkg-full`. El README proporciona ejemplos de migración tanto para la forma `get_kernel` como para la configuración `KernelConfig`.
- **Referencia histórica**: puede servir para entender qué problemas se encontraron en una implementación temprana de kernels NKI para Gated DeltaNet, aunque el código ya no está disponible.
- **No es adecuado para ningún despliegue en producción**: al estar vaciado, cualquier intento de usarlo directamente fallará.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene datos de rendimiento, y al estar vaciado no es posible evaluar nada.

## Requisitos de hardware

- Destinado a hardware AWS Neuron: Trainium e Inferentia.
- No se especifican requisitos de VRAM, GPU o latencia porque no es un modelo, sino kernels para un acelerador específico.
- El repositorio actual no es desplegable; el nuevo repositorio `tkg-full` es el que contiene los kernels funcionales para esos aceleradores.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo y no tiene comparables directos. La capa Gated DeltaNet de Qwen3.5 tiene implementaciones alternativas en Triton (por ejemplo, `RightNow-AI/qwen3.5-triton`), pero no son comparables con este repositorio deprecado.

## Limitaciones y advertencias

- **Repositorio deprecado y vaciado**: no contiene ningún archivo de kernel, ni siquiera en revisiones históricas. Cualquier intento de usarlo fallará.
- **Decodificación rota en la versión original**: la implementación anterior ignoraba `cache_params`, lo que hacía imposible la generación autoregresiva.
- **Prelleno ineficiente**: usaba una recurrencia serial con bucle Python sobre (batch, head), lo que limitaba el rendimiento.
- **Regresión con `torch.compile`**: el batch ≥ 2 producía resultados incorrectos.
- **Licencia Apache 2.0**: permite uso comercial, pero el código no está disponible en este repositorio.
- **No usar en producción**: el autor recomienda explícitamente migrar a `jburtoft/qwen35-deltanet-tkg-full`.

## Enlaces

- Repositorio deprecado: https://huggingface.co/jburtoft/qwen35-deltanet-neuron-kernels
- Nuevo repositorio con el código funcional: https://huggingface.co/jburtoft/qwen35-deltanet-tkg-full
- Análisis de la arquitectura Qwen3.5 (Gated DeltaNet): https://gist.github.com/justinchuby/0213aa253664fb72e9adb0089816de15
- Implementación alternativa en Triton: https://github.com/RightNow-AI/qwen3.5-triton
