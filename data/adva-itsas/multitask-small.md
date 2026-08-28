# adva-itsas/multitask-small

## Resumen

El modelo `adva-itsas/multitask-small` es un checkpoint experimental de inicialización basado en la arquitectura Mocov3, diseñado para tareas multitarea. Lo desarrolla el usuario adva-itsas y se publica bajo licencia BSD-3-Clause. Con solo 16.576 parámetros, se trata de un modelo extremadamente pequeño, pensado como punto de partida para pruebas de humo y para inspeccionar cambios arquitectónicos antes de un entrenamiento completo. No es un modelo entrenado ni presenta resultados de rendimiento.

La relevancia de este repositorio radica en su carácter didáctico y de prototipado: permite explorar una configuración de Mocov3 con atención de ventana deslizante, fusión gated y normalización por instancia, en un entorno manejable. Sin embargo, no debe considerarse un modelo listo para producción ni para tareas reales, ya que el checkpoint incluido no ha sido sometido a entrenamiento ni evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mocov3 (variante experimental) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura Mocov3 se describe en la model card como una variante con atención de ventana deslizante (sliding window), fusión gated (gated fusion), activación GELU tanh y normalización por instancia (InstanceNorm). No se especifican detalles adicionales como el número de capas, cabezas de atención o dimensiones ocultas, más allá de que la escala se denomina "giant" (aunque con solo 16k parámetros, esta denominación parece irónica o referida a un diseño conceptual).

El repositorio incluye un archivo `config.json` con la configuración generada y `training_args.json` con una receta de entrenamiento por defecto que usa el optimizador Adam y un programador de tasa de aprendizaje por pasos (step schedule). Sin embargo, la model card aclara explícitamente que estos son valores iniciales del script y no evidencian un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se menciona el uso de RLHF, DPO ni ningún otro método de alineación.

## Capacidades

- Generación de texto: no disponible, ya que el modelo no está entrenado y no se especifica ninguna tarea de generación.
- Razonamiento: no disponible.
- Código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible (aunque Mocov3 podría estar relacionado con visión, no se indica en la documentación).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio, etc.): no disponible.

En resumen, el modelo no presenta capacidades funcionales demostradas. Su único propósito declarado es servir como punto de partida para experimentación y desarrollo.

## Casos de uso

Dado que el modelo es un checkpoint de inicialización sin entrenamiento, los casos de uso son limitados y orientados a la investigación y el desarrollo:

- Pruebas de humo de la implementación: ejecutar `eval.py` para verificar que el código y el flujo de datos funcionan correctamente antes de un entrenamiento a gran escala.
- Inspección de arquitectura: analizar la configuración de Mocov3 (atención sliding window, fusión gated, etc.) en un entorno pequeño y comprensible.
- Desarrollo de adaptadores: dado que la model card indica que las APIs de carga automática requieren un adaptador explícito, este repositorio sirve para construir y probar dichos adaptadores.
- Experimentos de entrenamiento a pequeña escala: usar el checkpoint como inicialización para un entrenamiento breve con un conjunto de datos específico, siguiendo las pautas de evaluación sugeridas (métrica por tarea, al menos tres semillas, línea base de capacidad comparable).
- Comparación de configuraciones: modificar la arquitectura y comparar el comportamiento en tareas sintéticas o de juguete.
- Educación y aprendizaje: estudiar cómo se estructura un proyecto de modelo multitarea con Mocov3, incluyendo la gestión de configuración y argumentos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado. Por tanto, no se incluye tabla de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 16.576 parámetros, el modelo ocupa aproximadamente 66 KB en precisión FP32 (16.576 × 4 bytes). Cabe en cualquier dispositivo, incluso en una CPU sin GPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Si se desea usar GPU, cualquier modelo con al menos 1 GB de VRAM es más que suficiente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) es válida, aunque innecesaria.
- Opciones de despliegue: al ser un modelo personalizado, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. Se puede ejecutar mediante el script `eval.py` incluido en el repositorio.
- Latencia y throughput: no disponibles, pero al ser tan pequeño, la latencia será del orden de microsegundos en CPU.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables con esta arquitectura específica (Mocov3 multitarea) y este tamaño extremadamente reducido. Los modelos pequeños habituales (por ejemplo, GPT-2 de 100M parámetros) son órdenes de magnitud mayores y están entrenados. Este checkpoint es único en su categoría experimental.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; no debe usarse para ninguna tarea real de inferencia.
- No se ha auditado su robustez, equidad ni transferencia de dominio, como indica la model card.
- La implementación es personalizada y requiere un adaptador explícito para cargarse con APIs genéricas.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto, ya que no hay comportamiento aprendido.
- La licencia BSD-3-Clause permite uso comercial, pero se debe revisar los términos de los datos fuente si se utilizan conjuntos de datos externos.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/adva-itsas/multitask-small
- No se han encontrado otros enlaces (papers, blogs, repos) en la búsqueda web.
