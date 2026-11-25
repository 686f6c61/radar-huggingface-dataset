# latheeric/cnn-transformer-retrieval-run2

## Resumen

`latheeric/cnn-transformer-retrieval-run2` es un repositorio de código y pesos de inicialización publicado por el usuario latheeric en Hugging Face. Se presenta explícitamente como una implementación experimental de una arquitectura híbrida CNN-Transformer orientada a tareas de recuperación (retrieval), no como un modelo entrenado ni evaluado. La variante incluida es de escala "tiny" y su checkpoint `model.safetensors` contiene únicamente la inicialización de pesos para pruebas de humo (smoke tests), según declara el propio autor en la model card.

El interés del artefacto es fundamentalmente educativo y de investigación: proporciona una base reproducible —script `run.py`, `config.json` y `training_args.json`— para experimentar con fusión gated entre ramas convolucionales y de atención estándar, activación swish y normalización por batchnorm. No hay resultados de benchmarks, ni datos de entrenamiento, ni idiomas declarados, ni pipeline asignado en el Hub.

Dado su tamaño (16.576 parámetros reales según los safetensors) y su estado no entrenado, no debe considerarse un modelo listo para producción ni para evaluación comparativa. Es relevante únicamente como punto de partida reproducible para quien quiera entrenar y evaluar su propia variante con un protocolo controlado (el autor sugiere Flickr30k con al menos tres semillas y una línea base de capacidad equivalente).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-Transformer híbrido (atención estándar, fusión gated, activación swish, normalización batchnorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización), más `config.json`, `training_args.json` y `run.py` |

## Arquitectura y entrenamiento

La arquitectura combina una rama convolucional con una rama Transformer de atención estándar, unidas mediante fusión gated. Emplea activación swish y batchnorm, y está configurada a escala "tiny". El repositorio incluye la configuración generada de la arquitectura en `config.json` y la receta de experimento por defecto en `training_args.json`, que especifica el optimizador AdamW con schedule coseno.

No se ha publicado información sobre datos de entrenamiento: ni número de tokens, ni composición del corpus, ni si hubo ajuste por RLHF/DPO. El propio autor aclara que los valores de la receta son puntos de partida del script y no evidencia de una ejecución completada, y que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No hay capacidades verificadas: el modelo no ha sido entrenado ni evaluado, por lo que no se puede afirmar generación de texto, razonamiento, código ni matemáticas.
- La arquitectura está orientada a retrieval (recuperación de información), pero no se aportan métricas ni artefactos que demuestren desempeño en esa tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de arquitectura híbrida CNN-Transformer: usar `run.py` y `config.json` como base para entrenar desde cero y comparar con líneas base de capacidad equivalente bajo el mismo presupuesto de ajuste y semillas.
- Pruebas de humo de pipelines de carga de pesos: el checkpoint de inicialización permite validar el flujo de carga con safetensors y PyTorch antes de invertir en entrenamiento.
- Investigación en fusión gated: modificar la configuración para estudiar cómo afecta la puerta de fusión entre ramas convolucional y de atención en tareas de retrieval.
- Docencia y formación: ejemplo didáctico de implementación custom en PyTorch con configuración explícita y receta de entrenamiento versionada.
- Evaluación de retrieval sobre Flickr30k: el autor propone este conjunto como primera evaluación útil, reportando la métrica de la tarea en al menos tres semillas.
- Integración como adaptador en APIs de carga automática: al ser una implementación custom, requiere un adaptador explícito antes de poder usarse con APIs genéricas de carga de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, del orden de megabytes, dado que el checkpoint contiene 16.576 parámetros (repo de 0.0 GB). No hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU consumer moderna es sobrada para este tamaño; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos cientos de MB de memoria libre; también en CPU.
- Opciones de despliegue: PyTorch nativo mediante `run.py`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, y al ser una implementación custom las APIs genéricas requieren adaptador explícito.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (retrieval con arquitectura CNN-Transformer a escala tiny) ni se dispone de métricas para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo funcional.
- No ha sido auditado para robustez, equidad ni transferencia de dominio.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- No hay benchmarks ni métricas publicadas; cualquier comparación de rendimiento sería especulativa.
- Al ser una implementación custom, las APIs automáticas de carga de modelos (p. ej. `AutoModel`) requieren un adaptador explícito.
- La licencia MIT permite uso comercial del código y los pesos, pero deben revisarse por separado los términos de los datos externos con los que se entrene o evalúe.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse de forma separada de los valores por defecto incluidos en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/latheeric/cnn-transformer-retrieval-run2
