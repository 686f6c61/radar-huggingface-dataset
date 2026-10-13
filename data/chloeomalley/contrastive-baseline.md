# ChloeOmalley/contrastive-baseline

## Resumen

Contrastive-baseline es un prototipo de investigación publicado en HuggingFace por la autora ChloeOmalley bajo el identificador `ChloeOmalley/contrastive-baseline`. Se presenta como una implementación con arquitectura Dino orientada a aprendizaje contrastivo, con una configuración etiquetada internamente como «giant» pero cuyo checkpoint real contiene únicamente 49.600 parámetros (aproximadamente 0,05 millones). El propio autor especifica en la model card que se trata de un punto de partida experimental y no de un modelo entrenado.

El repositorio incluye el código de definición del modelo y un punto de entrada ejecutable (`predict.py`), el fichero de configuración de arquitectura (`config.json`), la receta de experimento por defecto (`training_args.json`) y un checkpoint de inicialización válido para pruebas de humo (`model.safetensors`). No se reclama ninguna métrica de rendimiento y no hay evidencia de un entrenamiento completado.

Su relevancia es estrictamente metodológica: sirve como plantilla reproducible para montar experimentos contrastivos con atención lineal, fusión por concatenación más MLP y normalización ScaleNorm, además de fijar el formato de ficheros y la receta de entrenamiento (SGD con schedule coseno) para que terceros repliquen comparativas bajo las mismas condiciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dino (con atención lineal) |
| Parámetros totales | 49.600 (0,05 M), según `model.safetensors` |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |
| Escala declarada en configuración | giant |
| Atención | linear |
| Fusión | concat mlp |
| Activación | approx gelu |
| Normalización | scalenorm |
| Optimizador por defecto | SGD |
| Schedule por defecto | cosine |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |
| Tamaño del repositorio | 0,0 GB |
| Fecha de creación | 2026-10-13 |

## Arquitectura y entrenamiento

La model card describe una arquitectura Dino con atención lineal, fusión mediante concatenación seguida de un MLP, activación approx gelu y normalización ScaleNorm. La escala indicada en la configuración es «giant», etiqueta que no se corresponde con el recuento real de parámetros del checkpoint publicado (49.600), por lo que debe interpretarse como un valor nominal del script y no como el tamaño efectivo del artefacto.

No consta información sobre volumen de tokens de entrenamiento, composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineación. La receta por defecto incluida en `training_args.json` emplea SGD con schedule coseno, y el propio autor advierte que son valores de arranque del script y no evidencia de una ejecución completada. El checkpoint `model.safetensors` se describe explícitamente como inicialización válida para pruebas de humo, no como pesos entrenados ni evaluados. Como innovaciones técnicas destacables solo se documentan las elecciones de atención lineal, fusión concat-mlp y ScaleNorm; no se aportan comparativas ni análisis de eficiencia frente a atención estándar.

## Capacidades

- No hay capacidades verificadas asociadas al checkpoint publicado: se trata de una inicialización sin entrenar.
- Generación de texto, razonamiento, código o matemáticas: no disponibles, no documentadas.
- Visión: la etiqueta `dino` sugiere el ecosistema de modelos auto-supervisados de visión, pero no se documenta ningún cabezal ni capacidad visual concreta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidad especial documentada: ejecución de pruebas de humo mediante `python predict.py --help` y uso como plantilla de inicialización para experimentos contrastivos.
- Carga mediante APIs genéricas: requiere un adaptador explícito, según advierte el propio autor, al tratarse de una implementación personalizada.

## Casos de uso

- Reproducción de un baseline contrastivo: el repositorio proporciona código, configuración de arquitectura y receta de entrenamiento para que un equipo replique el experimento con su propio dataset y compare contra un baseline de capacidad equivalente, tal como recomienda el autor.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite validar que el bucle de entrenamiento, la carga de datos y el guardado de pesos funcionan antes de lanzar runs costosos en GPU.
- Inicialización de experimentos de atención lineal: sirve como punto de partida para estudiar el comportamiento de la atención lineal combinada con fusión concat-mlp y ScaleNorm en tareas contrastivas.
- Comparativa controlada de optimizadores: al incluir SGD con schedule coseno como receta por defecto, permite contrastar ese ajuste frente a alternativas manteniendo fija la arquitectura y la exposición de datos.
- Docencia y divulgación: el tamaño reducido (49.600 parámetros) y el formato safetensors hacen viable ejecutar y diseccionar el modelo en un portátil sin GPU, útil para explicar mecánicas de aprendizaje contrastivo.
- Adaptación a tareas específicas de dominio: el autor sugiere evaluar sobre un conjunto hold-out específico de la tarea, con al menos tres semillas y un baseline de capacidad emparejada, lo que encaja con proyectos de investigación que necesiten una plantilla metodológica reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado ni auditado. Cualquier resultado futuro debería documentarse por separado respecto a los valores por defecto aquí incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en precisión nativa, dado el recuento de 49.600 parámetros; el consumo real vendrá dominado por el framework (PyTorch) y no por el modelo.
- GPU recomendadas: cualquiera, incluidas integradas. No requiere A100, H100 ni RTX 4090. Funciona en CPU sin dificultad.
- Compatibilidad con GPU de consumo: sí, cabe con enorme holgura en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La vía prevista es la ejecución directa del script `predict.py` en un entorno PyTorch.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChloeOmalley/contrastive-baseline | 49.600 | no disponible | No (solo inicialización) | BSD-3-Clause | HuggingFace |
| DINOv2 (Meta) | cientos de millones a miles de millones (según variante) | no aplica / no disponible | Sí | licencia específica de Meta | Público |
| SimCLR (Google) | no disponible | no disponible | Sí | no disponible | Repositorio de referencia |
| MoCo (Meta) | no disponible | no disponible | Sí | no disponible | Repositorio de referencia |

La comparación es estructuralmente limitada: los modelos de referencia de la familia contrastiva son implementaciones entrenadas y evaluadas, mientras que este repositorio es una plantilla de investigación sin entrenamiento completado. No se dispone de métricas comparables en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Cualquier uso que espere predicciones útiles dará resultados sin sentido.
- El autor declara que el modelo no ha sido auditado en robustez, equidad ni transferencia de dominio.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto.
- La etiqueta de escala «giant» en la configuración no coincide con los 49.600 parámetros reales; no debe usarse como indicador de capacidad.
- El propio autor advierte que cualquier resultado futuro debe documentarse por separado de los valores por defecto del repositorio.
- La licencia BSD-3-Clause cubre el código y los pesos publicados, pero los términos de los datos de origen deben revisarse por separado cuando se use con datasets externos.
- La implementación es personalizada, por lo que las APIs de carga automática de HuggingFace requieren un adaptador explícito antes de funcionar.
- No hay pipeline declarado ni descargas registradas, lo que indica ausencia de validación por parte de la comunidad.
- No se debe interpretar este repositorio como un modelo listo para producción bajo ninguna circunstancia.

## Enlaces

- HuggingFace: https://huggingface.co/ChloeOmalley/contrastive-baseline

La búsqueda web asociada no devolvió enlaces relevantes sobre este modelo (papers, blogs, repositorios o demos adicionales): los resultados obtenidos no guardan relación con el artefacto y se han descartado. Por tanto, no hay enlaces adicionales que reportar.
