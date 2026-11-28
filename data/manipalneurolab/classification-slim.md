# manipalneurolab/classification-slim

## Resumen

`manipalneurolab/classification-slim` es un repositorio de Hugging Face que contiene una implementación compacta y personalizada en PyTorch de una arquitectura denominada Coca, orientada a tareas de clasificación. Lo publica el usuario manipalneurolab bajo licencia MIT. No se trata de un modelo preentrenado listo para producción: la propia model card lo describe como un punto de partida experimental destinado a revisión de código, pruebas de humo (smoke tests) y experimentos controlados de pequeña escala.

El repositorio incluye un script de inferencia (`inference.py`), un `config.json` con los ajustes de arquitectura generados, un `training_args.json` con la receta de experimento por defecto y un `model.safetensors` que es únicamente un checkpoint de inicialización válido, no un modelo entrenado. La configuración declarada corresponde a una escala "huge" con atención multi-query, fusión de bajo rango, activación mish y normalización InstanceNorm, entrenada por defecto con el optimizador Lion y un schedule coseno.

Es relevante ahora únicamente como esqueleto reproducible para quien quiera experimentar con esta arquitectura concreta y comparar baselines bajo las mismas condiciones de datos, presupuesto de ajuste y semillas. El autor no reclama ninguna puntuación de benchmark y advierte explícitamente de que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coca (implementación personalizada en PyTorch) |
| Parametros totales | 24.832 (según safetensors) |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura declarada es Coca, con atención multi-query, fusión de bajo rango (low rank fusion), función de activación mish y normalización InstanceNorm. La escala configurada es "huge", aunque el número real de parámetros del checkpoint publicado es de 24.832, lo que sugiere que la configuración "huge" es una etiqueta de plantilla y no un modelo de gran tamaño efectivo. La model card no detalla el número de capas, dimensión oculta, número de cabezas ni otros hiperparámetros concretos.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF o DPO. La receta por defecto usa el optimizador Lion con un schedule coseno, pero el autor aclara que son valores de partida del script y no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Clasificación: el repositorio está etiquetado como `classification`, pero al ser un checkpoint sin entrenar no se puede afirmar ninguna capacidad efectiva de clasificación.
- Generación de texto: no disponible.
- Razonamiento, código o matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Inferencia directa: requiere un adaptador explícito, ya que es una implementación personalizada y las APIs genéricas de carga automática no funcionan sin él.

## Casos de uso

- Revisión de código de arquitecturas personalizadas: el script `inference.py` y el `config.json` permiten inspeccionar cómo se implementa Coca con atención multi-query y fusión de bajo rango, útil para quien quiera estudiar o replicar la arquitectura.
- Pruebas de humo en pipelines de CI: el checkpoint de inicialización sirve para verificar que el código de carga, el forward pass y el guardado de pesos funcionan antes de invertir en entrenamiento real.
- Experimentos controlados de clasificación: el `training_args.json` con Lion y schedule coseno sirve como receta de partida para comparar baselines con la misma exposición de datos, presupuesto de ajuste y semillas.
- Punto de partida para fine-tuning propio: un equipo puede tomar la implementación y entrenarla sobre su propio dataset etiquetado específico de dominio.
- Docencia y formación: útil como ejemplo mínimo y legible de una implementación de clasificación en PyTorch con configuración explícita.
- Base para auditorías de reproducibilidad: al incluir configuración y argumentos de entrenamiento por separado, facilita registrar versiones de entorno y logs junto a cualquier resultado publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 24.832 parámetros el checkpoint es trivial en memoria, pero al no ser un modelo entrenado no procede una estimación de inferencia real.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el checkpoint de inicialización cabe en cualquier GPU e incluso en CPU, pero no representa un modelo funcional.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación personalizada, requiere un adaptador explícito antes de usar APIs de carga automática.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría, y el repositorio no incluye baselines de referencia.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo utilizable en producción.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según la propia model card.
- No se reclama ninguna puntuación de benchmark; cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.
- La etiqueta "huge" de la configuración no se corresponde con el tamaño real del checkpoint (24.832 parámetros), lo que puede inducir a error si se interpreta como un modelo de gran escala.
- Licencia MIT: permite uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; no es plug-and-play.
- Riesgo de alucinación y sesgos conocidos: no disponible, al no existir un modelo entrenado sobre el que evaluarlos.
- Limitaciones de contexto e idioma: no disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manipalneurolab/classification-slim
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados.
