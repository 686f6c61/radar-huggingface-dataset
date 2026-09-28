# goncalvesah/deit-baseline

## Resumen

`goncalvesah/deit-baseline` es un prototipo de investigación basado en DeiT (Data-efficient Image Transformer) orientado a tareas múltiples (*multitask*), publicado por el usuario goncalvesah en HuggingFace. No se trata de un modelo entrenado ni de un checkpoint con resultados verificados: la propia model card lo describe explícitamente como un *initialization checkpoint* válido para *smoke tests*, no como un modelo de referencia con benchmarks. El repositorio incluye el código de inferencia (`inference.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y los pesos en `model.safetensors`.

El dato más relevante es su tamaño real: el checkpoint contiene 33.088 parámetros, una cifra extremadamente reducida que confirma su naturaleza de esqueleto de inicialización y no de un transformer visual funcional. Para contexto, una variante DeiT-small estándar ronda los 22 millones de parámetros, de modo que este artefacto es varios órdenes de magnitud menor. Su relevancia actual es, por tanto, exclusivamente metodológica: sirve como plantilla reproducible para montar experimentos multitarea con DeiT, definir el formato de ficheros y fijar una receta de entrenamiento base.

La licencia MIT y el formato safetensors facilitan su reutilización como punto de partida, pero cualquier uso en producción requeriría entrenar el modelo desde cero con datos propios y evaluar los resultados. La model card insiste en que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido auditado en robustez, equidad ni transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (Data-efficient Image Transformer), escala "small", atención *grouped query*, fusión bilineal, activación swish, normalización RMSNorm |
| Parametros totales | 33.088 (según safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en safetensors, presumiblemente fp32) |
| Idiomas soportados | no disponible (modelo visual, sin capacidades lingüísticas declaradas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura declarada es DeiT en configuración "small", con atención de tipo *grouped query*, fusión bilineal entre ramas, activación swish y normalización RMSNorm. Esta combinación se aparta de la implementación DeiT canónica de Facebook AI Research, que emplea atención multi-cabeza estándar y capas LayerNorm; la model card indica que se trata de una implementación personalizada, por lo que las APIs genéricas de carga automática de Transformers requerirían un adaptador explícito. El diseño apunta a un esquema multitarea donde una fusión bilineal combinaría representaciones de distintas cabezas o dominios.

En cuanto al entrenamiento, el repositorio únicamente incluye valores de partida: optimizador SGD con planificador de tasa de aprendizaje coseno, registrados en `training_args.json`. La model card es tajante al señalar que estos valores son valores iniciales del script y "no evidencia de una ejecución completada". No se especifica número de tokens ni de imágenes, composición del dataset, ni si hubo fases de RLHF o DPO (técnicas, por otra parte, propias del dominio del lenguaje y no de la visión). Tampoco se documenta ninguna innovación técnica adicional más allá de los componentes arquitectónicos citados.

## Capacidades

- No se declara ninguna capacidad funcional verificada: el checkpoint no ha sido entrenado.
- La model card describe el artefacto como punto de partida experimental para experimentos multitarea, no como modelo operativo.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües declaradas; se trata de un modelo de visión.
- No se documenta ningún modo especial (thinking, visión, audio) más allá de la propia naturaleza visual de DeiT.
- El único uso previsto explícito es la ejecución de *smoke tests* de inicialización mediante `python inference.py --help`.

## Casos de uso

- Prueba de humo de pipelines de entrenamiento: sirve para verificar que el script de carga, la configuración y el formato safetensors funcionan antes de lanzar un entrenamiento real con DeiT-small o DeiT-base.
- Plantilla de proyecto de investigación multitarea: el repositorio aporta `config.json` y `training_args.json` como esqueleto reproducible para definir experimentos, fijar semillas y comparar baselines con la misma exposición de datos.
- Referencia de formato para integración en HuggingFace Hub: útil para equipos que quieran publicar checkpoints propios con estructura de ficheros equivalente.
- Base para implementar un adaptador de carga personalizado: dado que es una implementación no estándar, sirve como caso de prueba para desarrollar adaptadores que permitan usar APIs automáticas de Transformers.
- Estudio de variantes arquitectónicas: permite experimentar con combinaciones de atención *grouped query*, fusión bilineal, swish y RMSNorm dentro de un backbone DeiT.
- Docencia y demostraciones de *fine-tuning*: al ser un checkpoint diminuto (33.088 parámetros), se puede entrenar y descargar en segundos, lo que lo hace adecuado para ejemplos didácticos de ciclos completos de entrenamiento y evaluación.
- Verificación de reproducibilidad: sirve para auditar que una receta de entrenamiento (SGD + coseno) arranca correctamente antes de escalar a configuraciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable. Con 33.088 parámetros, en fp32 ocuparía en torno a 130 KB de pesos, muy por debajo de 1 GB incluyendo activaciones de un *smoke test*.
- GPU recomendadas: no se requiere GPU. Cualquier CPU moderna ejecuta el ejemplo sin dificultad; cualquier GPU (incluso integradas o de gama de entrada) es más que suficiente.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos móviles o entornos sin acelerador.
- Opciones de despliegue: al ser una implementación personalizada, no hay integración documentada con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, además). El despliegue previsto es mediante el propio `inference.py`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| goncalvesah/deit-baseline | 33.088 | DeiT personalizado, multitarea | no aplica (visión) | MIT | Checkpoint de inicialización, sin entrenar |
| facebook/deit-base-distilled-patch16-224 | ~87 M (referencia pública de DeiT-base) | DeiT destilado, clasificación de imágenes | no aplica (visión) | Apache-2.0 (según repositorio original) | Modelo entrenado y publicado |
| facebook/deit-small-patch16-224 | ~22 M (referencia pública de DeiT-small) | DeiT, clasificación de imágenes | no aplica (visión) | Apache-2.0 (según repositorio original) | Modelo entrenado y publicado |
| ViT-base (google/vit-base-patch16-224) | ~86 M | Vision Transformer estándar | no aplica (visión) | Apache-2.0 (según repositorio original) | Modelo entrenado y publicado |

Nota: los recuentos de parámetros de las alternativas son cifras de referencia ampliamente publicadas para las arquitecturas DeiT y ViT estándar; consúltese cada model card para el dato exacto. La comparación relevante aquí es de naturaleza y estado (prototipo sin entrenar frente a modelos entrenados), no de rendimiento.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce predicciones útiles, solo salidas de inicialización.
- No hay resultados de benchmarks, por lo que no puede compararse en rendimiento con ningún modelo.
- No ha sido auditado en robustez, equidad (*fairness*) ni transferencia de dominio, tal y como advierte la propia model card.
- Es una implementación personalizada: requiere un adaptador explícito para funcionar con APIs genéricas de carga automática; intentar cargarlo como un DeiT estándar fallará o dará resultados inconsistentes.
- No hay información sobre idiomas, cuantizaciones ni pipeline, lo que dificulta planificar su integración.
- Aunque la licencia del repositorio es MIT, la model card recomienda revisar por separado los términos de los datos fuente si se combina con datasets externos.
- Cero descargas y cero interacciones: no existe validación por parte de la comunidad.
- No apto para producción en su estado actual; cualquier uso real exige entrenamiento, evaluación con conjunto de validación específico de la tarea, múltiples semillas y un baseline de capacidad comparable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goncalvesah/deit-baseline
- Documentación de DeiT en Transformers: https://huggingface.co/docs/transformers/model_doc/deit
- Repositorio oficial de DeiT (Facebook Research): https://github.com/facebookresearch/deit
- Paper relacionado con DeiT y detección de deepfakes (referencia de uso de DeiT): https://arxiv.org/pdf/2511.12048
