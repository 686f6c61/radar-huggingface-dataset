# annanovikov/clip-baseline

## Resumen

`annanovikov/clip-baseline` es un prototipo de investigación de tipo CLIP (contrastive language-image pretraining) publicado por el usuario annanovikov en HuggingFace. Se presenta explícitamente como un esqueleto de implementación orientado a experimentos de aprendizaje contrastivo, no como un modelo entrenado: el checkpoint `model.safetensors` se describe como una inicialización válida para pruebas de humo (smoke tests) y el autor declara que no se reclama ninguna métrica de benchmark.

El repositorio incluye `main.py` con la implementación y un punto de entrada ejecutable, `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto (optimizador LAMB con schedule de warmup lineal). La configuración etiqueta la escala como "xlarge", pero el checkpoint real en safetensors contiene 49.600 parámetros, una cifra muy alejada de lo que sugiere esa etiqueta; conviene tratar "xlarge" como un preset de configuración de la plantilla, no como el tamaño del artefacto publicado.

Su relevancia es limitada y acotada al ámbito de investigación: sirve como punto de partida reproducible para implementar y comparar arquitecturas CLIP con atención dispersa, fusión de bajo rango, activación swish y normalización RMSNorm, pero no es utilizable en producción ni como modelo de referencia de calidad, dado que no ha sido entrenado ni auditado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (contrastivo texto-imagen) con atención dispersa, fusión de bajo rango, activación swish y normalización RMSNorm |
| Parametros totales | 49.600 (aproximadamente 49,6 k), según `model.safetensors` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint en safetensors; sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura declarada es CLIP, un modelo de alineamiento contrastivo entre modalidades (texto e imagen) que se entrena maximizando la similitud de pares positivos y minimizando la de los negativos en un espacio compartido. La configuración concreta de este repositorio incorpora atención dispersa (sparse attention), fusión de bajo rango entre torres, activación swish y normalización RMSNorm. La receta de experimento por defecto registrada en `training_args.json` usa el optimizador LAMB con un schedule de warmup lineal; el autor advierte que son valores de arranque del script y no evidencia de un entrenamiento completado.

No se especifica el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO (no procede en un modelo contrastivo, pero tampoco se documenta ningún ajuste posterior). El checkpoint publicado es una inicialización sin entrenar. Al tratarse de una implementación propia, el autor indica que las APIs genéricas de carga automática requieren un adaptador explícito antes de poder usarla.

## Capacidades

- Arquitectura diseñada para alineamiento contrastivo texto-imagen; no se ha verificado ninguna capacidad funcional porque el checkpoint no está entrenado.
- Generación de texto: no disponible; el modelo no incluye cabeza generativa documentada.
- Razonamiento, código y matemáticas: no disponible.
- Visión: la arquitectura incorpora una torre de imagen en el diseño, pero sin entrenamiento no produce representaciones útiles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Capacidades especiales (thinking mode, audio, visión avanzada): no disponibles.
- Utilidad práctica verificada: únicamente como andamiaje de código y prueba de integración de carga de pesos.

## Casos de uso

- Punto de partida para investigación en aprendizaje contrastivo: el repositorio ofrece una implementación CLIP ejecutable con configuración de arquitectura documentada, útil para reproducir experimentos controlando datos, semillas y presupuesto de ajuste.
- Prueba de humo de pipelines de entrenamiento: `main.py --help` y el bloque `__main__` permiten validar que un entorno de PyTorch carga correctamente pesos safetensors antes de lanzar un entrenamiento real.
- Base para comparativas de arquitectura: al fijar atención dispersa, fusión de bajo rango, swish y RMSNorm, sirve como configuración de referencia frente a variantes densas o con otras activaciones.
- Docencia y formación técnica: un esqueleto pequeño (49,6 k parámetros) es manejable para explicar la estructura de un modelo CLIP sin requerir hardware significativo.
- Integración en tests de CI: el tamaño reducido del checkpoint permite verificar en integración continua que el código de carga, el parseo de `config.json` y la inicialización funcionan sin errores.
- Validación de adaptadores de carga personalizados: dado que es una implementación propia, permite probar el adaptador explícito necesario para integrarla con APIs genéricas de HuggingFace.
- Reproducción de recetas de optimización: el `training_args.json` con LAMB y warmup lineal sirve para experimentar con schedules sobre una base mínima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que no se reclama ninguna puntuación de benchmark y que un checkpoint futuro entrenado debería documentarse por separado de los valores por defecto aquí incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: insignificante. Con 49.600 parámetros, el checkpoint ocupa aproximadamente 0,19 MB en fp32 (198.400 bytes) y unos 0,10 MB en fp16.
- GPU recomendadas: cualquiera; el modelo cabe holgadamente en cualquier GPU, incluida una iGPU o incluso ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en CPU sin requisitos relevantes.
- Opciones de despliegue: PyTorch mediante `main.py`; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, y estas herramientas no aplican a un checkpoint CLIP sin entrenar.
- Latencia y throughput estimados: no disponibles y no significativos, dado que no existe un modelo entrenado que produzca inferencias útiles.

## Comparativa con modelos similares

La comparación numérica no es significativa: este repositorio es un esqueleto sin entrenar de 49,6 k parámetros, mientras que los CLIP de referencia son modelos entrenados a gran escala. Las cifras de los modelos de referencia son aproximadas, proceden de documentación pública y deben verificarse en sus fichas correspondientes.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| annanovikov/clip-baseline | 49.600 | no disponible | BSD-3-Clause | Prototipo sin entrenar |
| openai/clip-vit-base-patch32 | ≈150 M (verificar) | no disponible | MIT (verificar) | Entrenado y publicado |
| google/siglip-base-patch16-224 | ≈200 M (verificar) | no disponible | Apache-2.0 (verificar) | Entrenado y publicado |
| Modelos CLIP de terceros en HuggingFace | Variable | no disponible | Variable | Entrenados, uso variable |

Frente a estas alternativas, `clip-baseline` no ofrece capacidades de inferencia comparables; su interés es exclusivamente como código de referencia y configuración experimental.

## Limitaciones y advertencias

- El checkpoint no está entrenado: `model.safetensors` es una inicialización para pruebas de humo, no un modelo funcional.
- No ha sido auditado en robustez, equidad ni transferencia de dominio; no hay evaluación de sesgos disponible.
- No se han documentado datos de entrenamiento, por lo que no puede evaluarse el riesgo de sesgo de los datos de origen.
- Riesgo de alucinación: no aplica de forma directa al no existir cabeza generativa entrenada, pero tampoco hay comportamiento verificable.
- Limitaciones de contexto e idioma: no disponibles; no se declara ventana de contexto ni cobertura lingüística.
- Restricciones de licencia: BSD-3-Clause permite uso comercial con atribución y conservación del aviso de copyright; el autor advierte de revisar por separado los términos de los datos de origen si se usan datasets externos.
- Inconsistencia documental: la etiqueta de escala "xlarge" en la configuración no se corresponde con los 49.600 parámetros del checkpoint publicado.
- Requiere un adaptador explícito para cargarse con APIs genéricas, lo que añade fricción de integración.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/annanovikov/clip-baseline
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
