# adva-itpil/ml-classification

## Resumen

`adva-itpil/ml-classification` es un repositorio experimental publicado en Hugging Face por el usuario `adva-itpil` que contiene una implementación propia de una arquitectura híbrida orientada a tareas de clasificación. No se trata de un modelo entrenado ni de un checkpoint listo para producción: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (*smoke tests*) y que no se presenta como un checkpoint evaluado en benchmarks. El repositorio incluye además el código (`predict.py`), la configuración de arquitectura (`config.json`) y la receta de entrenamiento por defecto (`training_args.json`).

El modelo declara una arquitectura de tipo híbrido con atención dispersa (*sparse*), fusión bilineal, activación ReLU y normalización ScaleNorm. La escala indicada es "large", aunque el recuento real de parámetros en el fichero safetensors es de solo 49.600 parámetros, un orden de magnitud muy inferior al que suele asociarse a esa etiqueta; esto sugiere que la configuración incluida es una versión reducida pensada para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

Su relevancia es, por tanto, la de un artefacto de investigación y andamiaje reproducible: permite inspeccionar una arquitectura híbrida concreta, ejecutar un ejemplo de extremo a extremo y adaptar la receta de entrenamiento. No debe evaluarse como un modelo de lenguaje o clasificador con capacidades demostradas, ya que no se aporta ninguna métrica ni evidencia de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid (atención dispersa, fusión bilineal, activación ReLU, normalización ScaleNorm) |
| Parámetros totales | 49.600 (según safetensors) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización); código en Python/PyTorch |

## Arquitectura y entrenamiento

La arquitectura declarada es un *hybrid* de escala "large" con atención dispersa (*sparse attention*) y un mecanismo de fusión bilineal entre representaciones. Usa ReLU como activación y ScaleNorm como normalización, una alternativa a LayerNorm que normaliza por la norma del vector en lugar de por la media y la varianza. El repositorio incluye el fichero `predict.py` con la implementación del modelo y un punto de entrada ejecutable, además de `config.json` con los ajustes de arquitectura generados.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni sobre fases de RLHF, DPO o ajuste supervisado. La receta por defecto usa el optimizador LAMB con un *schedule* coseno, pero la propia model card aclara que son valores de partida del script y no evidencia de una ejecución completada. El checkpoint `model.safetensors` es una inicialización, no un modelo entrenado. No se declara ninguna innovación técnica adicional más allá de la combinación de atención dispersa y fusión bilineal.

## Capacidades

- Clasificación: el repositorio está etiquetado como `classification` y su código está orientado a esta tarea, aunque no se documenta ningún conjunto de etiquetas ni dominio concreto.
- Ejecución de ejemplo: `predict.py` incluye un bloque `__main__` con un ejemplo de prueba de humo ejecutable.
- Carga mediante APIs genéricas: la model card advierte que, al ser una implementación personalizada, requiere un adaptador explícito para usar APIs de carga automática.
- Generación de texto: no disponible.
- Razonamiento, matemáticas, código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Estudio de arquitecturas híbridas: sirve como base de código reproducible para inspeccionar cómo se combinan atención dispersa, fusión bilineal y ScaleNorm antes de escalar a un entrenamiento completo.
- Pruebas de humo de pipelines: permite verificar que un *pipeline* de carga, *forward pass* y evaluación funciona de extremo a extremo con un checkpoint de 49.600 parámetros, sin coste computacional apreciable.
- Prototipado de clasificadores personalizados: el código de `predict.py` y `config.json` puede adaptarse como esqueleto para una tarea de clasificación propia, sustituyendo la cabeza y los datos.
- Reproducción de recetas de entrenamiento: `training_args.json` documenta una receta LAMB + coseno que puede reutilizarse como punto de partida en experimentos comparativos con presupuesto y semillas iguales.
- Docencia y formación: útil para explicar en un entorno controlado cómo se estructura un repositorio de modelo en Hugging Face (config, pesos, script, argumentos de entrenamiento).
- Base para *benchmarking* interno: la propia model card propone evaluar con una partición etiquetada específica de la tarea, al menos tres semillas y una línea base de capacidad equivalente; el repositorio sirve como punto de partida para ese protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 49.600 parámetros en safetensors el peso de los parámetros es de aproximadamente 0,2 MB en fp32, por lo que el cuello de botella es el *runtime* de PyTorch, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también puede ejecutarse en CPU sin problema.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación personalizada, requiere cargar el código de `predict.py` con un adaptador explícito; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, tamaño o tarea con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` es una inicialización, no un modelo entrenado; no ha sido auditado para robustez, equidad ni transferencia de dominio.
- No se declara ningún resultado de benchmark ni métrica de evaluación; cualquier uso en producción carece de evidencia de rendimiento.
- No se documentan sesgos conocidos, pero tampoco se ha realizado ninguna evaluación al respecto.
- Riesgo de alucinación y de comportamiento impredecible: al no estar entrenado, las salidas no son fiables para ninguna tarea real.
- No se especifican idiomas soportados ni longitud de contexto, lo que impide planificar su uso multilingüe o con entradas largas.
- Licencia Apache 2.0 permite uso comercial del código y los pesos, pero la model card advierte de revisar por separado los términos de los datos de origen si se usan conjuntos externos.
- Las APIs genéricas de carga automática (por ejemplo, `AutoModel`) requieren un adaptador explícito por tratarse de una implementación personalizada.
- El recuento de 49.600 parámetros contradice la etiqueta "large" de la model card; conviene no asumir capacidad acorde a esa etiqueta.

## Enlaces

- Hugging Face: https://huggingface.co/adva-itpil/ml-classification
