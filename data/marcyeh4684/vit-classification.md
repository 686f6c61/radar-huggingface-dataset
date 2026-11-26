# Marcyeh4684/vit-classification

## Resumen

`Marcyeh4684/vit-classification` es un repositorio experimental de un modelo Vision Transformer (ViT) orientado a tareas de clasificación, publicado por el usuario Marcyeh4684 en Hugging Face. No se trata de un modelo entrenado y listo para producción: la propia model card indica explícitamente que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests) y no un checkpoint con benchmarks publicados. El repositorio incluye el código del modelo, la configuración de arquitectura y la receta de entrenamiento por defecto.

La arquitectura declarada es un ViT a escala "huge" con atención de ventana deslizante (sliding window attention), fusión con compuertas (gated fusion), activación approx GELU y normalización InstanceNorm, una combinación poco habitual frente al ViT estándar (LayerNorm + atención global). El recuento real de parámetros en safetensors es de 33.088, un valor extremadamente bajo para un ViT de escala huge, lo que sugiere que el checkpoint es una inicialización mínima o parcial, no un modelo completo entrenado.

Su relevancia es limitada y de carácter técnico: sirve como base reproducible para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo, no como modelo para inferencia real. No hay datos de idiomas, pipeline ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con atencion de ventana deslizante y gated fusion |
| Parametros totales | 33.088 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo se describe como un ViT a escala "huge" con atención de ventana deslizante, fusión mediante compuertas (gated fusion), activación approx GELU y normalización InstanceNorm. Esta configuración se aparta del ViT canónico de Dosovitskiy et al. (LayerNorm, atención global, GELU exacta), por lo que requiere un adaptador explícito para cargarse con APIs automáticas genéricas de Hugging Face, tal y como advierte la model card.

No hay evidencia de entrenamiento completado. La receta por defecto usa el optimizador NovoGrad con un schedule polinómico, pero el autor aclara que son valores iniciales del script y no prueba de una ejecución finalizada. No se especifican número de tokens, composición del dataset, ni fases de RLHF/DPO o ajuste supervisado. El checkpoint incluido es una inicialización para smoke tests, no un modelo entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Capacidades

- Clasificación de imágenes (propósito declarado del repositorio), sin evidencia de rendimiento por falta de entrenamiento.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (modelo de visión, sin datos de idioma).
- No se declaran capacidades especiales (thinking mode, visión-a-texto, audio, etc.).
- El código incluye un punto de entrada ejecutable y un ejemplo de smoke test en el bloque `__main__` de `eval.py`.

## Casos de uso

- Pruebas de humo de arquitectura: cargar el checkpoint de inicialización para verificar que el grafo computacional, las formas de tensores y el pipeline de datos funcionan antes de un entrenamiento real.
- Investigación de variantes de ViT: inspeccionar el efecto de sustituir LayerNorm por InstanceNorm, atención global por ventana deslizante y fusión estándar por gated fusion en una base controlada.
- Reproducción de recetas de entrenamiento: usar `training_args.json` (NovoGrad + schedule polinómico) como punto de partida para comparar baselines con la misma exposición de datos, presupuesto de ajuste y semillas.
- Docencia y prototipado: servir como esqueleto mínimo para que estudiantes monten un clasificador de imágenes y entiendan cada componente por separado.
- Evaluación comparativa controlada: entrenar este ViT y un baseline de capacidad equivalente sobre un split etiquetado específico de la tarea, reportando la métrica en al menos tres semillas.
- Integración en pipelines de investigación: adaptar el código a un framework interno de experimentos antes de escalar a un checkpoint entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 33.088 parámetros el checkpoint es trivial en memoria, pero no representa un modelo funcional.
- GPU recomendadas: no disponible; cualquier GPU consumer (incluso CPU) basta para cargar el checkpoint de inicialización.
- Cabe en GPU consumer: sí, con el checkpoint actual; no aplicable a un ViT huge entrenado (que requeriría decenas de GB).
- Opciones de despliegue: al ser una implementación personalizada, requiere adaptador explícito; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a ViT).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marcyeh4684/vit-classification | 33.088 (inicialización) | no disponible | sin benchmarks | BSD-3-Clause | Hugging Face, experimental |
| google/vit-base-patch16-224 | ~86 M | 224x224 px | benchmarks publicados en ImageNet | Apache-2.0 | Hugging Face, entrenado |
| facebook/deit-base-patch16-224 | ~86 M | 224x224 px | benchmarks publicados en ImageNet | Apache-2.0 | Hugging Face, entrenado |

La comparación es asimétrica: los ViT de Google y DeiT de Facebook son checkpoints entrenados y evaluados, mientras que este repositorio es una base experimental sin entrenamiento. No hay datos suficientes para una comparación de rendimiento real.

## Limitaciones y advertencias

- El checkpoint no está entrenado ni auditado en robustez, equidad o transferencia de dominio; no debe usarse en producción.
- Riesgo de alucinación no aplicable directamente (modelo de visión), pero sí de predicciones sin sentido por falta de entrenamiento.
- Sin datos de idioma ni de composición del dataset; imposible evaluar sesgos.
- La licencia BSD-3-Clause permite uso comercial del código, pero el autor advierte de revisar por separado los términos de los datos de origen si se usan datasets externos.
- La implementación es personalizada: las APIs automáticas de Hugging Face requieren un adaptador explícito, lo que añade fricción de integración.
- El recuento de 33.088 parámetros es incompatible con un ViT "huge" completo; conviene verificar la integridad del checkpoint antes de cualquier uso.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/Marcyeh4684/vit-classification
- Repositorio (archivos): `eval.py`, `config.json`, `training_args.json`, `model.safetensors` en la raíz del repo de Hugging Face.
