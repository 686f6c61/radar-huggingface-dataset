# ales-tari/mae-classification

## Resumen

Este repositorio contiene un código experimental de clasificación basado en la arquitectura **MAE** (Masked Autoencoder), desarrollado por el usuario ales-tari. El objetivo declarado es mantener una configuración base manejable para poder inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo. El modelo no está entrenado: el checkpoint `model.safetensors` es un punto de inicialización válido para pruebas de humo, no un modelo listo para inferencia.

La arquitectura declarada es un **MAE en escala base**, con atención sparse, fusión por tensor, activación GELU y normalización por instancia. El número total de parámetros es de **24.832**, lo que lo convierte en un modelo extremadamente pequeño, del orden de kilobytes. No se ha publicado ningún resultado de benchmarks ni se ha realizado ningún entrenamiento con datos reales, por lo que debe tratarse como un punto de partida experimental para investigación, no como un modelo de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE (Masked Autoencoder) con atención sparse, fusión por tensor, activación GELU y normalización por instancia |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa un **MAE** (Masked Autoencoder) diseñado para tareas de clasificación. La arquitectura se describe como "base", con atención sparse, fusión por tensor, activación GELU y normalización por instancia. El repositorio incluye un archivo `config.json` que registra la configuración de arquitectura generada y un `training_args.json` con la receta experimental por defecto (optimizador Adam con programación de temperatura coseno).

No se ha realizado ningún entrenamiento. El checkpoint `model.safetensors` es únicamente un punto de inicialización válido para pruebas de humo, y el autor indica explícitamente que no se presenta como un checkpoint entrenado ni se reclama ningún resultado de benchmark. No hay datos sobre composición del dataset, número de tokens ni procesos de alineación como RLHF o DPO. La implementación es una implementación personalizada, por lo que las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.

## Capacidades

- Generación de texto: no disponible, al ser un modelo de clasificación visual sin entrenamiento.
- Razonamiento: no disponible.
- Generación de código: no disponible.
- Matemáticas: no disponible.
- Visión: el modelo está diseñado para clasificación sobre parches de imagen, pero al no estar entrenado no ofrece ninguna capacidad de predicción real.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible. El único propósito funcional del checkpoint es servir como inicialización para pruebas de humo del pipeline.

## Casos de uso

- Investigación de arquitecturas: el modelo permite probar variaciones en atención sparse y fusión por tensor sobre una base MAE antes de comprometerse con un entrenamiento completo. Es adecuado porque la configuración base se mantiene deliberadamente pequeña y manejable.
- Pruebas de humo del pipeline: el checkpoint de inicialización se puede utilizar para verificar que el script `inference.py` carga correctamente los pesos y ejecuta la pasada forward sin errores, sin necesidad de un modelo entrenado.
- Desarrollo de adaptadores personalizados: al ser una implementación propia, el repositorio sirve como base para escribir un adaptador que permita cargar el modelo con APIs genéricas de HuggingFace o PyTorch.
- Comparación de inicializaciones: se puede entrenar el modelo desde distintos puntos de inicialización y comparar el rendimiento final, lo que resulta útil para estudiar el efecto de la inicialización en arquitecturas MAE.
- Docencia y aprendizaje: el código es un ejemplo compacto de una arquitectura MAE con componentes como atención sparse y normalización por instancia, adecuado para fines educativos en cursos de visión por computador.
- Pruebas de integración: sirve para validar que el entorno de ejecución, las dependencias y los scripts de entrenamiento funcionan correctamente antes de lanzar experimentos más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no está entrenado. Por tanto, no se dispone de datos de rendimiento en MMLU, HumanEval, GSM8K ni en ninguna otra métrica comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener solo 24.832 parámetros, el modelo ocupa menos de 1 MB en formato safetensors. Cabe en cualquier GPU o incluso en CPU sin necesidad de VRAM dedicada.
- GPU recomendadas: cualquier GPU, incluyendo modelos antiguos como GTX 1050 o inferiores. No se requiere hardware especializado.
- Compatibilidad con GPU de consumo: sí, es compatible con cualquier tarjeta gráfica de consumo, ya que el tamaño del modelo es trivial.
- Opciones de despliegue: no es apto para despliegue en producción. Se puede ejecutar localmente mediante el script `inference.py` con PyTorch. No se recomienda vLLM, llama.cpp, Ollama ni TGI porque el modelo no está entrenado y no ofrece capacidades de inferencia útiles.
- Latencia y throughput estimados: no disponibles, al no existir un modelo entrenado ni mediciones de rendimiento.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. Al tratarse de un checkpoint de inicialización experimental sin entrenar, no existe una categoría clara de modelos de la misma clase con los que compararlo. Se indica "no disponible".

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado en términos de robustez, equidad o transferencia de dominio.
- No es apto para uso en producción: se trata de un punto de partida experimental.
- No se han realizado evaluaciones de sesgos, alucinaciones ni comportamientos adversos.
- No hay soporte para idiomas ni para tareas de generación de texto.
- La implementación es personalizada y requiere un adaptador explícito para cargarse con APIs genéricas de HuggingFace.
- La licencia BSD-3-Clause permite uso comercial, pero la model card advierte que deben revisarse los términos de las fuentes de datos si se usa con datasets externos.
- Los resultados de un futuro checkpoint entrenado deberán documentarse por separado de los valores por defecto incluidos en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ales-tari/mae-classification
- Perfil del autor en HuggingFace: https://huggingface.co/ales-tari
