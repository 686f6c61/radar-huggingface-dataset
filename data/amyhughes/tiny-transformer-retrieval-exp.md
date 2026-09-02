# amyhughes/tiny-transformer-retrieval-exp

## Resumen

El modelo `amyhughes/tiny-transformer-retrieval-exp` es una implementación experimental de un transformer de tamaño reducido (49.600 parámetros) orientado a tareas de retrieval (recuperación de información). Desarrollado por el usuario amyhughes, se publica como un punto de partida reproducible para experimentos, no como un modelo entrenado. Su arquitectura emplea atención con ventana deslizante, fusión de bajo rango, activación GELU aproximada y normalización ScaleNorm, según la documentación incluida.

El repositorio contiene un checkpoint de inicialización (`model.safetensors`) válido para pruebas de humo, junto con scripts de predicción y configuración. No se proporcionan datos de entrenamiento, ni métricas de rendimiento, ni se especifica la longitud de contexto. La licencia es Apache-2.0, lo que permite su uso y modificación con atribución.

A pesar de su nombre, no se trata de un modelo listo para producción; su propósito es servir como base para investigaciones en retrieval con arquitecturas compactas. La relevancia actual radica en su carácter didáctico y reproducible, aunque carece de validación empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atencion sliding window, fusion low rank, activacion approx gelu, normalizacion scalenorm) |
| Parametros totales | 49.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer compacto con atención de ventana deslizante, fusión de bajo rango, activación GELU aproximada y normalización ScaleNorm. No se dispone de información sobre el proceso de entrenamiento: no se mencionan tokens utilizados, composición del dataset, ni técnicas como RLHF o DPO. El checkpoint incluido es un estado de inicialización aleatorio, no un modelo entrenado. La model card indica que la configuración por defecto usa rmsprop con un programador de pasos, pero se trata de valores de arranque en el script, no de evidencia de un entrenamiento completado.

## Capacidades

- No se han documentado capacidades específicas, ya que el modelo no está entrenado.
- Diseñado para tareas de retrieval, pero sin validación empírica.
- No se ha demostrado generación de texto, razonamiento, código, matemáticas ni visión.
- No se ha verificado soporte para tool calling, agentes o razonamiento multi-paso.
- No se ha verificado capacidad multilingüe.
- No se ha verificado ningún modo especial (thinking, visión, audio, etc.).

## Casos de uso

- No disponible: el modelo no está entrenado, por lo que no se pueden recomendar casos de uso reales.
- No disponible: no se han documentado aplicaciones prácticas.
- No disponible: requiere un entrenamiento previo con datos de retrieval.
- No disponible: no se ha validado su rendimiento en ninguna tarea.
- No disponible: no se recomienda su uso en producción.
- No disponible: sin datos de rendimiento, no se pueden sugerir escenarios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica, el modelo tiene 49.600 parámetros y se puede ejecutar en CPU sin necesidad de GPU.
- GPU recomendada: ninguna, cualquier CPU moderna es suficiente.
- Cabe en cualquier hardware, incluso en dispositivos embebidos o de bajo consumo.
- Opciones de despliegue: al ser una implementación personalizada, requiere un adaptador explícito; no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin modificaciones.
- Latencia: no disponible, pero al ser un modelo tan pequeño se espera que sea mínima.
- Throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- No se han publicado resultados de benchmarks ni métricas de rendimiento.
- La implementación es personalizada, por lo que las APIs genéricas de carga (como `transformers`) requieren un adaptador explícito.
- No se recomienda su uso en producción ni en aplicaciones que requieran resultados fiables.
- La licencia Apache-2.0 permite uso comercial, pero se deben revisar los términos de los datos externos si se utilizan con conjuntos de datos adicionales.

## Enlaces

- [HuggingFace - amyhughes/tiny-transformer-retrieval-exp](https://huggingface.co/amyhughes/tiny-transformer-retrieval-exp)
- [HuggingFace - svkuznetsov/tiny-transformer-retrieval (variante similar)](https://huggingface.co/svkuznetsov/tiny-transformer-retrieval)
