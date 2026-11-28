# Ferreza92/retrieval-mini

## Resumen

Retrieval-mini es un prototipo de investigación publicado por el usuario Ferreza92 en Hugging Face bajo el identificador `Ferreza92/retrieval-mini`. Se presenta como un modelo de arquitectura Mixer orientado a tareas de recuperación (retrieval), con atención dispersa (sparse attention) y fusión mediante co-attention. El repositorio incluye el código de inferencia, la configuración de arquitectura, una receta de entrenamiento por defecto y un checkpoint de inicialización en formato safetensors.

El dato más relevante para evaluar su utilidad práctica es que el checkpoint incluido no ha sido entrenado: el propio autor lo describe como una inicialización válida para pruebas de humo (smoke tests) y no como un modelo con resultados de benchmark. El recuento real de parámetros en safetensors es de 24.832, es decir, unas 25.000 unidades, lo que sitúa el artefacto en un orden de magnitud muy alejado de cualquier modelo de retrieval operativo. La etiqueta "giant" de la model card corresponde a una configuración declarada en el script, no al tamaño del checkpoint publicado.

Por tanto, no debe confundirse con un modelo listo para producción ni con una alternativa a los encoders de recuperación convencionales. Su interés es exclusivamente documental y experimental: sirve como esqueleto reproducible para quien quiera probar una arquitectura Mixer con co-attention en tareas de recuperación, partiendo de cero en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer con atención dispersa (sparse) y fusión por co-attention |
| Parametros totales | 24.832 (según safetensors); la model card declara escala "giant" en la configuración, sin correspondencia con el checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización); código en Python (PyTorch) |

Otros datos técnicos declarados en la model card: activación GELU, normalización RMSNorm, optimizador AdamW con schedule de warmup constante.

## Arquitectura y entrenamiento

La arquitectura declarada es un Mixer, una familia de modelos que sustituye la atención estándar por operaciones de mezcla (token-mixing y channel-mixing) sobre las representaciones. En este caso concreto se añaden dos particularidades: atención dispersa y fusión mediante co-attention, lo que sugiere un diseño pensado para emparejar dos modalidades o dos secuencias (por ejemplo, consulta y documento) en el contexto de recuperación. La activación es GELU y la normalización RMSNorm, elecciones habituales en transformadores modernos.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni si se aplicó RLHF, DPO u otro ajuste posterior. De hecho, el autor indica explícitamente que el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo y no un modelo entrenado. La receta por defecto (AdamW con warmup constante) se describe como valores de partida del script, no como evidencia de una ejecución completada. No se documenta ninguna innovación adicional como decodificación especulativa o atención lineal más allá de la atención dispersa ya mencionada.

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint no está entrenado, por lo que no produce recuperaciones fiables.
- El código incluye un punto de entrada de inferencia (`inference.py`) con un ejemplo de smoke test en su bloque `__main__`.
- La configuración apunta a una tarea de retrieval, presumiblemente emparejamiento consulta-documento mediante co-attention, pero sin métricas que lo confirmen.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documentan capacidades multilingües ni un conjunto de idiomas soportados.
- No se declaran modos especiales (thinking, visión, audio) ni decodificación especulativa.
- Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarse.

## Casos de uso

- Pruebas de humo de la implementación: ejecutar `python inference.py --help` y el bloque `__main__` para verificar que el código y el checkpoint de inicialización cargan correctamente en el entorno local antes de invertir en entrenamiento.
- Punto de partida para investigación en arquitecturas Mixer: sirve como esqueleto reproducible para experimentar con token-mixing y channel-mixing en tareas de recuperación, modificando `config.json` y `training_args.json`.
- Estudio de co-attention para emparejamiento consulta-documento: el diseño de fusión por co-attention permite plantear experimentos controlados sobre cómo se combinan dos secuencias, comparando con baselines de igual capacidad.
- Reproducción de recetas de entrenamiento: la inclusión de `training_args.json` con AdamW y warmup constante facilita fijar una receta base y medir el efecto de cambiarla, manteniendo los mismos datos, presupuesto de ajuste y semillas.
- Docencia y formación: útil para ilustrar las diferencias entre Mixer y transformador estándar, y para mostrar por qué un checkpoint sin entrenar no debe evaluarse como modelo final.
- Evaluación metodológica: el propio autor propone usar Flickr30k, reportar la métrica de la tarea con al menos tres semillas e incluir un baseline de capacidad equivalente, lo que convierte el repositorio en una plantilla de protocolo de evaluación más que en un modelo desplegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado. Cualquier cifra que se obtuviera con este artefacto carecería de valor comparativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 24.832 parámetros en safetensors, el checkpoint es del orden de decenas de kilobytes y cabe en cualquier dispositivo, incluida CPU.
- GPU recomendadas: no aplica para el checkpoint publicado; cualquier GPU consumer (por ejemplo, una RTX 4090) es más que suficiente para ejecutar el script de prueba.
- Cabe en GPU consumer: sí, con enorme margen, dado el tamaño mínimo del checkpoint.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. Al ser una implementación personalizada en PyTorch, el despliegue requiere el código propio del repositorio y, probablemente, un adaptador explícito.
- Latencia y throughput: no disponibles. No tiene sentido medirlos sobre un checkpoint sin entrenar.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (Mixer para retrieval) ni alternativas de tamaño equivalente con las que establecer una comparación rigurosa. Los encoders de recuperación convencionales (familia BERT, E5, BGE, etc.) operan en órdenes de magnitud de parámetros muy superiores y con licencias y disponibilidad distintas, por lo que una comparación directa no sería significativa.

## Limitaciones y advertencias

- El checkpoint no está entrenado: no debe usarse para recuperación real ni evaluarse como modelo final.
- No se ha auditado robustez, equidad ni transferencia de dominio; el autor lo describe como punto de partida experimental.
- No hay información sobre sesgos, idiomas soportados ni cobertura lingüística.
- Riesgo de alucinación no evaluable al no existir comportamiento entrenado.
- La etiqueta "giant" de la model card no se corresponde con los 24.832 parámetros del checkpoint; conviene no interpretarla como indicador de capacidad.
- Licencia MIT: permite uso comercial, pero el autor advierte de revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Al ser una implementación personalizada, las APIs genéricas de carga automática no funcionan sin adaptador; esto complica la integración en pipelines estándar.
- Cualquier resultado obtenido con un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto incluidos en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ferreza92/retrieval-mini
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados al modelo.
