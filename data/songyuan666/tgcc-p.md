# Songyuan666/TGCC-P

## Resumen

TGCC-P es un checkpoint de ajuste fino parcial publicado por el usuario Songyuan666 sobre el modelo base TC-pi0.5, orientado exclusivamente a la tarea robótica `cook_hot_dogs` (cocinar perritos calientes) del benchmark BEHAVIOR-1K. No se trata de un modelo de lenguaje generalista, sino de un artefacto de investigación en robótica que combina un estudiante vision-lenguaje-acción congelado con un adaptador de recuperación y tres cabezas de puntuación de consistencia entrenadas conjuntamente. El repositorio ocupa 8,5 GB y se distribuye en formato safetensors junto con artefactos de recuperación, calibración y evaluación.

La relevancia del release es metodológica: documenta de forma explícita el alcance del entrenamiento (1000 actualizaciones de warmup solo del crítico más 4708 actualizaciones conjuntas parciales, total 5708, frente a las 6000 previstas que se detuvieron antes), el protocolo de evaluación con información privilegiada de grafo y estado (Oracle Upper Bound) y los resultados por instancia. El autor separa deliberadamente este checkpoint de experimentos posteriores (TGCC-F y la versión v3fast) para no atribuirles resultados cruzados.

El modelo obtiene 10 éxitos sobre 20 en las instancias públicas 301–320 de `cook_hot_dogs`, con un Q oficial medio de 0,5000; las 10 instancias restantes terminan por timeout, sin paradas por capacidad ni interrupciones de infraestructura. Es, por tanto, un checkpoint de investigación reproducible más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estudiante vision-lenguaje-acción (herencia pi0.5) con adaptador de recuperación y tres cabezas de puntuación de consistencia; grafo TC de tres niveles y módulos semánticos/memoria congelados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (`student.safetensors`, `distribution.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint padre TC-π0.5 `selected_step5000_user_stop` (SHA256 `80436905542b0ce75d77d17cf908b29846f5497b58189177d406daebdd3e1239`). Sobre esa base se entrenaron conjuntamente el ActionExpert, el adaptador de recuperación y tres cabezas de puntuación de consistencia, mientras permanecían congelados el estudiante visión/VLM, el grafo y los módulos semánticos/memoria. Las actualizaciones de modelo completo son cero en este release. El schedule completado fue de 1000 actualizaciones de warmup solo del crítico más 4708 actualizaciones conjuntas parciales, con batch efectivo de 48.

El soporte de entrenamiento consiste en 5888 anclas fijas extraídas de 184 episodios de demostración exitosa curados, con 16 episodios retenidos (512 anclas) para calibración; no es un barrido exhaustivo de las 51714 secuencias causales originales. La recuperación combina características visuales, estado del robot, grafos de tres niveles e historial causal, con exclusión obligatoria del episodio de consulta y sin que los ejemplos de validación o test público entren en el soporte. No se usaron ejemplos de fallo recolectados ni objetivos negativos sintéticos, y las puntuaciones miden consistencia de acción, ejecución y planificación demostradas, no probabilidades calibradas de éxito o fallo.

## Capacidades

- Ejecución de la tarea robótica `cook_hot_dogs` en el simulador BEHAVIOR/OmniGibson con trozos de 32 acciones.
- Recuperación condicionada por características visuales, estado del robot, grafos de tres niveles e historial causal.
- Puntuación de consistencia de acción, ejecución y planificación mediante tres cabezas dedicadas.
- Rechazo de rango sobre el trozo completo de acciones (TGCC) desactivado en esta evaluación; se mantienen los límites nativos de entrada y de objetivos articulares del controlador.
- Generación de un candidato no condicionado y, como máximo, un candidato condicionado por referencia fresca por petición.
- Retroalimentación y recuperación ante desviaciones estadísticas de puntuación, sin terminación temprana de la tarea.
- Entradas multimodales de cámara: cabeza a 720×720, muñecas a 480×480 y entrada al modelo a 224×224.
- Idiomas declarados en la model card: inglés y chino (etiquetas de metadatos; no se documenta capacidad de generación de texto general).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo thinking.

## Casos de uso

- Investigación en manipulación robótica de cocina: replicar la evaluación de `cook_hot_dogs` sobre las instancias públicas 301–320 con semilla de acción 42 y semilla de entorno 0 para comparar contra la línea base de 10/20 éxitos y Q medio 0,5000.
- Estudio de ajuste fino parcial: analizar el efecto de congelar el estudiante VLM y entrenar solo ActionExpert, adaptador de recuperación y cabezas de consistencia, usando los metadatos de procedencia y el schedule de 5708 actualizaciones como referencia reproducible.
- Evaluación de mecanismos de recuperación: probar el adaptador de recuperación basado en grafos de tres niveles e historial causal, con exclusión de episodio de consulta, en escenarios de imitación con demostraciones curadas.
- Análisis de calibración de puntuaciones: utilizar `calibration.json` y `calibration_samples.json` para estudiar la relación entre las puntuaciones de consistencia y el éxito real de la tarea, teniendo en cuenta que no son probabilidades calibradas.
- Reproducción de entornos BEHAVIOR-1K: emplear `source/evaluated_source.tar.gz` y `runtime_extensions/` para reconstruir el servidor de evaluación con física y puntuación oficiales, asumiendo rutas de lanzamiento específicas del proyecto.
- Auditoría de artefactos de release: verificar `MANIFEST.json` y `SHA256SUMS` para comprobar identidades de ficheros y digests en pipelines de validación de publicaciones científicas.
- Docencia en robótica basada en simulación: usar el checkpoint como ejemplo documentado de evaluación con información privilegiada (Oracle Upper Bound) y de protocolo con terminales oficiales por timeout.

## Benchmarks y rendimiento

| Modelo | Instancias | Éxitos | Q medio |
|---|---|---|---|
| TGCC-P (checkpoint parcial evaluado) | 301–320 | 10/20 (50%) | 0,5000 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que los resultados de TGCC-F (11/20, Q medio 0,55) y de la versión v3fast corregida no se atribuyen a TGCC-P.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 8,5 GB, pero incluye pesos del estudiante completo, cabezas, adaptador, artefactos de recuperación, calibración y código fuente; no se desglosa el tamaño de cada componente.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no es un repositorio `AutoModel` de Transformers. Requiere la configuración, tokenizador y normalizador del modelo base, las interfaces del modelo de grafo TC, los assets de BEHAVIOR/OmniGibson y la política de runtime advisory evaluada. El autor advierte que `runtime_extensions/` contiene rutas de lanzamiento específicas del proyecto y no se presenta como despliegue portable llave en mano.
- Latencia y throughput: no disponibles. La evaluación reporta tiempos de pared originales de simulación, incluidas las esperas de inferencia, pero no se publican cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en `cook_hot_dogs` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TGCC-P | no disponible | no disponible | 10/20 (50%), Q 0,5000 | no disponible | HuggingFace (Songyuan666/TGCC-P) |
| TGCC-F (full-model 5000-update) | no disponible | no disponible | 11/20 (55%), Q 0,55 | no disponible | Referenciado por el autor, no detallado |
| TC-π0.5 (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace (Songyuan666/TC-pi0.5) |

No se dispone de datos de benchmarks ni de especificaciones de parámetros o contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Alcance restringido a la tarea `cook_hot_dogs`; no es un modelo generalista de lenguaje, visión o robótica multi-tarea.
- Resultado de 10/20 con 10 timeouts: la mitad de las instancias no alcanza el terminal de éxito, lo que limita su uso en producción sin intervención.
- Las puntuaciones de consistencia no son probabilidades calibradas de éxito o fallo; no deben interpretarse como tal.
- Entrenamiento sobre 184 episodios curados y 5888 anclas, no sobre las 51714 secuencias causales originales; posible sesgo de selección hacia demostraciones exitosas.
- Sin ejemplos de fallo ni objetivos negativos sintéticos en el entrenamiento, lo que puede reducir la robustez ante estados fuera de distribución.
- Las demostraciones fuente no tienen recibos de éxito terminal verificados de forma independiente para cada episodio.
- Evaluación con información privilegiada de grafo y estado (Oracle Upper Bound): los resultados no reflejan un escenario con observabilidad parcial real.
- Diferencias de residencia de texturas por el presupuesto de streaming 0,05; las imágenes entre configuraciones no son necesariamente idénticas píxel a píxel.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Dependencia de assets externos (BEHAVIOR/OmniGibson, configuración y normalizador del padre) y de rutas de lanzamiento específicas del proyecto.
- Metadatos originales conservados con `training_complete=false` por parada temprana del schedule de 6000 actualizaciones.
- Riesgo de alucinación y sesgos lingüísticos: no evaluados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Songyuan666/TGCC-P
- Modelo base TC-pi0.5: https://huggingface.co/Songyuan666/TC-pi0.5
- Resultados por instancia: `evaluation/results.md`
- Resultados en CSV: `evaluation/results.csv`
- Resultados en JSON: `evaluation/results.json`
- Manifiesto y digests: `MANIFEST.json`, `SHA256SUMS`
- Código fuente evaluado: `source/evaluated_source.tar.gz`
- Extensiones de runtime: `runtime_extensions/`
- Calibración: `checkpoint/calibration.json`, `calibration_samples.json`
- Biblioteca de recuperación: `retrieval_library/`
- Paper, blog o demo adicionales: no disponible en la información proporcionada.
