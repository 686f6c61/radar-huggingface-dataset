# bosflores/blip-baseline

## Resumen

`bosflores/blip-baseline` es un prototipo de investigación de un modelo de clasificación basado en la arquitectura Blip, desarrollado por el autor `bosflores`. Se trata de un repositorio que incluye un script Python (`pipeline.py`), una configuración de arquitectura y un checkpoint de inicialización en formato `safetensors`. El modelo no ha sido entrenado: el autor presenta el checkpoint como un punto de partida válido para pruebas de humo y experimentación, no como un modelo con rendimiento demostrado.

El modelo declara una escala "large" en su configuración, pero el número total de parámetros es de 16.576, una cifra extraordinariamente baja para un modelo de visión-lenguaje. Esto confirma que se trata de una implementación esquelética o de juguete, orientada a documentar la estructura y el flujo de trabajo de un experimento de clasificación, y no a competir con modelos BLIP reales. No se especifica longitud de contexto ni idiomas soportados, y la única licencia confirmada es MIT.

Su relevancia reside en ser un ejemplo reproducible de cómo organizar un experimento con Blip, incluyendo recetas de entrenamiento por defecto (Adafactor con esquema coseno) y una guía para evaluaciones futuras. No obstante, no es utilizable en producción ni presenta ninguna capacidad real hasta que sea entrenado de forma completa y auditado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Blip |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada corresponde a un modelo Blip con modificaciones propias: atención de tipo multi-query, fusión mediante cross-attention, activación GELU-Tanh y normalización por instancias (`instancenorm`). El repositorio define estos parámetros en `config.json` y documenta el esquema en la model card, aunque no se aportan detalles sobre la implementación interna, el número de capas o las dimensiones de los bloques.

En cuanto al entrenamiento, no existe ningún proceso de entrenamiento completado. El archivo `model.safetensors` es un checkpoint de inicialización destinado exclusivamente a pruebas de humo. El autor incluye una "receta por defecto" en `training_args.json` con el optimizador Adafactor y un programa de aprendizaje de tipo coseno, pero aclara explícitamente que son valores iniciales y no evidencian un entrenamiento ejecutado. Tampoco se mencionan datos de entrenamiento, tokens procesados ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto: no disponible (el modelo no está entrenado).
- Razonamiento: no disponible.
- Código o matemáticas: no disponible.
- Visión: no disponible, a pesar de que la arquitectura Blip está pensada para tareas de visión-lenguaje.
- Tool calling / function calling: no soportado.
- Soporte de agentes y razonamiento multi-step: no soportado.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ninguna. El único comportamiento observable es la ejecución del script `pipeline.py`, que permite comprobar que la inicialización del checkpoint y la configuración cargan correctamente.

## Casos de uso

El modelo no está entrenado, por lo que no es apto para ningún caso de uso en producción. Los siguientes usos son técnicos y están ligados al repositorio, no a un modelo funcional:

- **Prueba de humo de la implementación**: ejecutar `python pipeline.py --help` para verificar que el script, la configuración y el checkpoint se cargan sin errores. Adecuado para detectar fallos de integración antes de abordar cualquier entrenamiento.
- **Desarrollo de investigación en arquitecturas Blip**: el repositorio ofrece un punto de partida para estudiar los efectos de variantes como multi-query attention o instancenorm. Puede usarse como base para implementar y comparar modificaciones sobre la estructura Blip.
- **Comparación de baselines**: al no estar entrenado, sirve como referencia de rendimiento mínimo antes de entrenar otros modelos con la misma cantidad de parámetros. Permite medir la ganancia real del entrenamiento.
- **Experimentación con optimizadores**: el script incluye una configuración con Adafactor y scheduler coseno. Puede emplearse para estudiar su comportamiento en un entorno controlado y con datos sintéticos.
- **Docencia y formación**: la estructura del repositorio (pipeline, config, training_args, checkpoint) es un ejemplo sencillo de cómo organizar un experimento reproducible en Hugging Face. Útil para enseñar conceptos de configuración de modelos.
- **Entrenamiento desde cero**: el script de entrenamiento puede ejecutarse sobre un dataset de clasificación con etiquetas. El modelo resultante, una vez entrenado, podría ser evaluado siguiendo las pautas de la model card, que recomiendan tres semillas por experimento y una métrica específica de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se presenta ninguna puntuación de rendimiento y que el checkpoint no es un punto de referencia entrenado. Por tanto, no existe ninguna tabla de comparación numérica para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 MB para los pesos en FP32 (16.576 parámetros × 4 bytes). El overhead de ejecución del script Python puede requerir algo más, pero sigue siendo insignificante.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en CPU o en cualquier GPU actual, incluidas RTX 3060, A100 o H100, aunque su uso en GPU será completamente subutilizado.
- ¿Cabe en GPU de consumo? Sí, cabe en todas, incluidas tarjetas integradas de portátiles y soluciones de consumo ligero.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. El despliegue se realiza mediante el script `pipeline.py` incluido en el repositorio, que es una implementación personalizada.
- Latencia y throughput estimados: no disponible. Con un modelo de 16.576 parámetros la latencia sería mínima, pero no se aportan mediciones reales.

## Comparativa con modelos similares

no disponible. El modelo es un prototipo no entrenado con solo 16.576 parámetros, lo que impide compararlo con modelos BLIP reales como `Salesforce/blip-image-captioning-base` o `gizmo-ai/blip-image-captioning-base`, que tienen cientos de millones de parámetros y están entrenados para tareas de visión-lenguaje. No existe ningún modelo comparable en su categoría de tamaño y estado de desarrollo.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no tiene ninguna capacidad funcional. No puede realizar clasificación ni ninguna otra tarea.
- No ha sido auditado en términos de robustez, equidad, sesgos ni transferencia de dominio, tal como advierte el autor.
- No se ofrecen resultados de benchmarks ni validaciones de rendimiento. Cualquier afirmación sobre capacidades sería una invención.
- La implementación es experimental y requiere un adaptador explícito para funcionar con APIs automáticas genéricas, según la model card.
- El uso del repositorio con datasets externos obliga a revisar los términos de licencia de esos datos, además de la licencia MIT del propio contenido.
- El autor advierte que los resultados de un entrenamiento futuro deben documentarse por separado y no confundirse con los valores por defecto enviados con el checkpoint.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bosflores/blip-baseline
- Documentación oficial de BLIP en Hugging Face: https://huggingface.co/docs/transformers/v4.53.3/en/model_doc/blip
- Modelo de referencia BLIP (imagen-captioning, base): https://huggingface.co/gizmo-ai/blip-image-captioning-base
