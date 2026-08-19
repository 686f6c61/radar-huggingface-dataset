# ahmadalmoustafa/zephyr-qwen2.5-coder-1.5b-lora

## Resumen

Este modelo es un adaptador LoRA diseñado para la finalización de código fuente de Zephyr RTOS, un sistema operativo en tiempo real para dispositivos embebidos. Desarrollado por ahmadalmoustafa, se basa en el modelo base Qwen/Qwen2.5-Coder-1.5B y se ha entrenado sobre un subconjunto limpio y controlado del repositorio de Zephyr versión v4.4.1. El adaptador permite mejorar la generación de código C, C headers, C++ y C++ headers específicamente para este RTOS, sin necesidad de reentrenar el modelo completo.

La relevancia de este adaptador radica en su enfoque de adaptación de dominio eficiente en parámetros: con solo un adaptador LoRA de rango 16 y alpha 32, entrenado en una única GPU TITAN RTX, se consigue una reducción de la perplexidad (NLL) del 19,17 % en el benchmark general de Zephyr, junto con mejoras en exact-match, first-line-match y edit-similarity. Sin embargo, presenta una regresión en el benchmark dedicado de C++, lo que limita su uso en ese subconjunto. El adaptador se distribuye como pesos separados, por lo que se requiere el modelo base Qwen2.5-Coder-1.5B para la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-1.5B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA rank 16, alpha 32; modelo base 1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1,024 tokens (maximo de secuencia de entrenamiento del adaptador) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea torch.float16) |
| Idiomas soportados | Codigo fuente en C, C headers, C++ y C++ headers (no se especifican idiomas naturales) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-Coder-1.5B, un modelo de lenguaje basado en transformer con arquitectura decoder-only, orientado a la generación de código. El adaptador LoRA (Low-Rank Adaptation) introduce matrices de bajo rango en las capas de atención, con rango 16 y alpha 32, lo que permite ajustar el modelo sin modificar los pesos originales. El entrenamiento se realizó con una única GPU NVIDIA TITAN RTX, utilizando el framework PEFT.

Los datos de entrenamiento provienen del repositorio de Zephyr RTOS versión v4.4.1 (commit `1f6485eca25431b5ff27ce9a754218c9e559bbbb`). Se limpiaron 12,823 archivos fuente, generando 64,935 ejemplos de entrenamiento, 4,774 de validación y 4,517 de evaluación. Se aplicó aislamiento por grupo de directorio y hash exacto de archivo para evitar fugas de datos entre los conjuntos. La longitud máxima de secuencia se fijó en 1,024 tokens. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de código fuente para Zephyr RTOS, incluyendo inicialización de hardware, drivers y módulos del kernel.
- Completado de código en C, C headers, C++ y C++ headers.
- Mejora de la precisión en la generación de código general de Zephyr, con un aumento de +4,10 puntos en exact-match y +5,27 puntos en first-line-match.
- Reducción de la perplexidad (NLL) en un 19,17 % en el benchmark general de Zephyr.
- No soporta tool calling, agentes, visión ni audio; es exclusivamente un modelo de generación de texto para código.

## Casos de uso

- Asistencia en el desarrollo de drivers para Zephyr RTOS: el adaptador puede sugerir la estructura de un driver basado en los patrones del repositorio, reduciendo el tiempo de escritura manual.
- Completado de código en entornos de desarrollo embebido: integrable en editores o IDEs como plugin de autocompletado, acelerando la escritura de código C/C++ específico de Zephyr.
- Generación de código de inicialización de hardware: el modelo puede completar fragmentos como `#include <zephyr/kernel.h>` y la función `main`, como se muestra en el ejemplo de uso.
- Migración de código desde otros RTOS a Zephyr: al conocer las APIs y convenciones de Zephyr, el adaptador puede ayudar a traducir llamadas y estructuras.
- Creación de pruebas unitarias para módulos de Zephyr: puede generar esqueletos de tests basados en el framework de testing de Zephyr.
- Documentación de código: aunque no es su función principal, puede ayudar a generar comentarios explicativos para funciones y estructuras típicas de Zephyr.
- Investigación académica: sirve como demostración de adaptación de dominio eficiente en parámetros para sistemas embebidos, permitiendo estudiar el impacto de LoRA en código específico de RTOS.

## Benchmarks y rendimiento

Los datos de evaluación proporcionados por el autor comparan el modelo base (Qwen2.5-Coder-1.5B) con el modelo tras aplicar el adaptador LoRA, sobre conjuntos de validación aislados.

| Benchmark | Base NLL | LoRA NLL | Cambio NLL | Cambio de precision |
|---|---:|---:|---:|---:|
| General Zephyr (512 ejemplos) | 0,950232 | 0,768027 | -19,17 % | +3,10 puntos |
| C++ (62 ejemplos) | 0,917017 | 1,059281 | +15,51 % | -0,43 puntos |

Además, en generación general se reportan mejoras de +4,10 puntos en exact-match, +5,27 puntos en first-line-match y +5,11 puntos en edit-similarity. No se incluyen resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador requiere el modelo base Qwen2.5-Coder-1.5B, que en FP16 ocupa aproximadamente 3 GB de VRAM (estimación basada en el número de parámetros; no se proporcionan datos oficiales).
- El adaptador LoRA añade un peso adicional mínimo (menos de 0,1 GB según el tamaño del repositorio).
- Se puede ejecutar en GPUs consumer con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060 o superiores. También es viable en GPU con 8 GB o más para mayor margen.
- El entrenamiento se realizó en una NVIDIA TITAN RTX (24 GB), pero la inferencia requiere mucho menos.
- Opciones de despliegue: el ejemplo de uso emplea `transformers` y `peft`. También puede integrarse con vLLM, llama.cpp u Ollama, aunque no se proporcionan configuraciones específicas para estos motores.
- No se dispone de datos de latencia o throughput; para un modelo de 1.5B en FP16, se espera una latencia de decenas de milisegundos por token en GPUs modernas (estimación orientativa).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Zephyr RTOS en la documentación proporcionada. La única comparación directa es contra el modelo base Qwen2.5-Coder-1.5B sin adaptador, que muestra la mejora en el benchmark general pero la regresión en C++. El autor menciona la existencia de un checkpoint de 7B con mejor comportamiento en ambos benchmarks, pero no se ofrecen detalles adicionales. Por tanto, la comparativa con alternativas de la misma categoría queda pendiente de datos externos.

## Limitaciones y advertencias

- El adaptador presenta una regresión significativa en el benchmark dedicado de C++ (aumento del 15,51 % en NLL y pérdida de precisión), por lo que no debe emplearse para generación de código C++ específico de Zephyr sin verificación adicional.
- El modelo base es de 1.5B parámetros, lo que limita su capacidad de razonamiento complejo en comparación con modelos más grandes.
- La longitud de contexto de entrenamiento es de 1,024 tokens, lo que puede restringir la generación de código con dependencias largas.
- No se especifica la licencia del adaptador ni del modelo base; es necesario verificar la licencia de Qwen2.5-Coder-1.5B antes de un uso comercial.
- El código generado debe ser revisado, compilado y probado antes de su uso en producción, como indica el autor.
- No se han reportado sesgos específicos, pero al estar entrenado exclusivamente con código de Zephyr, su conocimiento de otros frameworks o estilos de código es limitado.
- El adaptador no es un modelo completo; requiere cargar el modelo base y el adaptador conjuntamente, lo que añade complejidad al despliegue.

## Enlaces

- [Página del adaptador en HuggingFace](https://huggingface.co/ahmadalmoustafa/zephyr-qwen2.5-coder-1.5b-lora)
- [Modelo base Qwen2.5-Coder-1.5B](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B)
- [Repositorio de Zephyr RTOS](https://github.com/zephyrproject-rtos/zephyr) (referencia del código fuente utilizado)
