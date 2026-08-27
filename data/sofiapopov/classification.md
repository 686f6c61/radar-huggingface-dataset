# sofiapopov/classification

## Resumen

El modelo `sofiapopov/classification` es una implementación híbrida de tamaño reducido (49.600 parámetros) diseñada para tareas de clasificación. Lo desarrolla el usuario `sofiapopov` y se publica como un punto de partida reproducible, no como un modelo entrenado y listo para producción. El repositorio incluye un checkpoint de inicialización válido para pruebas de humo, junto con un script de predicción, configuración de arquitectura y argumentos de entrenamiento por defecto.

La relevancia de este modelo radica en su carácter experimental: sirve como base para investigar arquitecturas híbridas con atención de ventana deslizante y co-atención, pero no ofrece capacidades de clasificación reales sin un entrenamiento previo. Su licencia BSD-3-Clause permite uso y modificación con atribución, lo que facilita su integración en proyectos de investigación. No se declaran idiomas soportados ni longitud de contexto en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (atención de ventana deslizante + co-atención) |
| Parametros totales | 49.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | bsd-3-clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es híbrida, combinando atención de ventana deslizante (sliding window) con un mecanismo de co-atención (co-attention) para fusionar información. La activación utilizada es GELU con aproximación tanh, y la normalización se realiza mediante GroupNorm. El modelo está empaquetado con una configuración explícita en `config.json` y un recetario de entrenamiento por defecto en `training_args.json`, que usa el optimizador LAMB con un programador de tasa de aprendizaje por pasos (step schedule).

No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens procesados ni técnicas de alineación como RLHF o DPO. El checkpoint incluido (`model.safetensors`) es únicamente una inicialización para pruebas de humo, no un modelo entrenado. La documentación indica que no se reivindica ningún resultado de benchmark en este repositorio.

## Capacidades

- Clasificación: el modelo está diseñado para tareas de clasificación, pero al no estar entrenado no puede realizar ninguna clasificación real.
- Reproducibilidad: sirve como punto de partida reproducible para experimentos de arquitectura híbrida.
- Personalización: el script `predict.py` incluye un ejemplo de prueba de humo y permite adaptar el modelo a tareas específicas mediante entrenamiento.
- Sin capacidades demostradas: no hay evidencia de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes o capacidades multilingües.

## Casos de uso

- Investigación académica: el modelo puede utilizarse como banco de pruebas para estudiar arquitecturas híbridas con atención de ventana deslizante y co-atención, comparando su rendimiento con arquitecturas transformer estándar en tareas de clasificación.
- Desarrollo de prototipos: los desarrolladores pueden partir de este checkpoint de inicialización para entrenar un clasificador específico, por ejemplo, análisis de sentimiento o detección de spam, siempre que dispongan de un conjunto de datos etiquetado.
- Pruebas de integración: el script `predict.py` permite verificar que el pipeline de inferencia funciona correctamente antes de sustituir el checkpoint por uno entrenado.
- Educación: sirve como ejemplo didáctico de cómo empaquetar un modelo con configuración, argumentos de entrenamiento y checkpoint en un repositorio reproducible.
- Benchmarking de optimizadores: el recetario con LAMB y step schedule puede utilizarse para comparar estrategias de optimización en modelos pequeños.
- Experimentos de normalización: la combinación de GroupNorm y GELU tanh puede evaluarse frente a otras configuraciones en tareas de clasificación simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ningún resultado y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada: con solo 49.600 parámetros, el modelo cabe en cualquier GPU moderna, incluso en iGPU o CPU. La huella de memoria es despreciable (menos de 1 MB en precisión FP32).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una Raspberry Pi podría ejecutar la inferencia.
- Compatibilidad con GPU de consumo: sí, absolutamente todas las GPU de consumo (RTX 3060, RTX 4090, etc.) pueden ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo PyTorch personalizado, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito. Se puede ejecutar mediante el script `predict.py` o cargando los pesos con PyTorch.
- Latencia y throughput: no se dispone de mediciones, pero dado el tamaño, la latencia sería del orden de microsegundos en GPU y milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos híbridos pequeños de clasificación con 49.600 parámetros). La documentación no menciona alternativas ni se encontraron referencias en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint incluido no ha sido entrenado; no debe utilizarse en producción sin un entrenamiento completo y una evaluación rigurosa.
- No se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio; puede presentar sesgos si se entrena con datos no representativos.
- Riesgo de alucinación: al no estar entrenado, no genera texto, por lo que este riesgo no aplica en su estado actual, pero podría aparecer tras un entrenamiento inadecuado.
- No se especifica la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- La licencia BSD-3-Clause permite uso comercial, pero se debe revisar los términos de las fuentes de datos externas si se utilizan para entrenamiento.
- El modelo requiere un adaptador explícito para cargarse con APIs genéricas de Hugging Face; no es compatible con `AutoModel` sin modificaciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sofiapopov/classification
