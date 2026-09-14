# MinhNH232331M/master-thesis

## Resumen

`MinhNH232331M/master-thesis` no es un modelo de lenguaje ni un modelo entrenado listo para usar: es un repositorio de investigación (10,0 GB) que implementa un pipeline completo de verificación facial para una tesis de máster. El proyecto separa de forma explícita las fases de ajuste (fitting), validación, calibración del umbral operativo y test final, y declara que los ficheros JSON de partición train/test proporcionados nunca son leídos por el pipeline, lo que refuerza el aislamiento entre selección y evaluación.

Técnicamente, el sistema se apoya en un backbone iResNet50 vendorizado desde InsightFace (commit `d9cb10e6bda109bc9b4a6ca8b92d7f3342b56492`, licencia MIT) con una cabeza ArcFace cuyo matriz de pesos de clase entrenable se incluye en el optimizador, y emplea `pytorch-metric-learning==2.9.0` para el aprendizaje métrico. Solo el método `forward` del adaptador modifica la propiedad de AMP; las claves de estado y el grafo originales se preservan.

Su relevancia actual es metodológica más que de rendimiento: documenta una auditoría de identidades sobre datos reales que, tras resolver 28 grupos de duplicados RGB exactos, descartar 11 pares de alias plausibles y excluir un registro de metadatos inválido, retuvo 919 identidades (711 hombres, 208 mujeres) y 25.491 imágenes. No publica métricas de reconocimiento, y el propio autor advierte que las salidas del smoke test no son evidencia sobre el rendimiento del sistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de reconocimiento facial: backbone iResNet50 vendorizado de InsightFace con cabeza ArcFace y entrenamiento por aprendizaje métrico |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión; no procesa texto) |
| Licencia | no disponible para el repositorio; el backbone vendorizado se distribuye bajo licencia MIT |
| Formato de pesos | no disponible; la configuración espera un state dict de PyTorch de iResNet50 en `model.checkpoint` |

Otros datos verificables del repositorio: autor `MinhNH232331M`, 0 descargas y 0 likes, pipeline no declarado, creado el 2026-09-07 y actualizado el 2026-09-13, tamaño de 10,0 GB, tag `region:us`.

## Arquitectura y entrenamiento

El pipeline implementa un protocolo de investigación en cuatro etapas diferenciadas: ajuste, validación, calibración del umbral operativo y test final. Genera tres folds de test externos (semilla 42), particiones de calibración (1000 + fold) y de validación (2000 + fold), y subconjuntos de condiciones anidados y conscientes de la colección de origen para las semillas 42, 43 y 44. También fija manifiestos de comparación de pares genuinos y de impostores en tres condiciones (MM, FF y MF) para validación, calibración y test. La estratificación es conjunta por género y colección cuando resulta factible, con un fallback solo por género registrado en el fichero de auditoría.

El componente entrenable es una cabeza ArcFace sobre el backbone iResNet50 de InsightFace; los márgenes se configuran en radianes y se convierten a los grados que espera el paquete. Solo el `forward` del adaptador cambia la propiedad de AMP, preservando las claves de estado y el grafo originales. El smoke test por defecto cubre tres folds y cinco condiciones con una semilla de entrenamiento, tres actualizaciones del optimizador, diez réplicas bootstrap y un modelo pequeño inicializado aleatoriamente sobre imágenes sintéticas de texturas aleatorias. No se documenta en la información disponible el número de tokens, la composición completa del dataset de entrenamiento ni el uso de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Verificación facial 1:1: comparación de pares de imágenes para decidir si pertenecen a la misma identidad, con umbral calibrado en una partición dedicada.
- Identificación 1:N sobre una galería de identidades, mediante embeddings métricos generados por el backbone.
- Auditoría de datasets de identidades: detección de duplicados exactos de píxel RGB, agrupación de grupos duplicados (28 grupos detectados abarcando 11 pares de carpetas) y reducción determinista de duplicados intraidentidad a un representante.
- Generación de manifiestos de evaluación con condiciones controladas de impostores por género (MM, FF, MF) y comparaciones genuinas muestreadas con imágenes distintas de la misma identidad.
- Calibración de umbral operativo con réplicas bootstrap (diez por defecto en el smoke test) para estimar intervalos de confianza.
- Reanudación de ejecuciones: los checkpoints de entrenamiento y bootstrap y los embeddings en caché se reutilizan al repetir el comando sobre el mismo directorio de artefactos.
- Aplicación de correcciones de metadatos verificadas (`path`, `gender`, `person_id`, `exclude`) sin modificar imágenes ni metadatos de entrada.
- No dispone de tool calling, function calling, capacidades de agente, multimodalidad texto-imagen ni modo de razonamiento: no es un modelo generativo.

## Casos de uso

- Control de acceso biométrico 1:1: el sistema compara una imagen capturada con la plantilla almacenada de un usuario y decide aceptación o rechazo usando un umbral calibrado sobre una partición independiente, lo que evita el sobreajuste del punto de operación al conjunto de test.
- Identificación en galerías cerradas: dado un rostro de consulta, se generan embeddings y se busca la identidad más próxima en un conjunto de 919 identidades de referencia, útil en escenarios de aforo controlado.
- Auditoría y limpieza de datasets biométricos: el comando `prepare` decodifica imágenes, comprueba duplicados exactos de píxel RGB, rechaza entradas inválidas y retiene identidades con al menos dos imágenes únicas utilizables, lo que sirve para depurar corpus antes de entrenar.
- Investigación reproducible en verificación facial: los tres folds externos, las semillas 42/43/44 y los manifiestos fijos permiten replicar experimentos y comparar variantes de backbone o de función de pérdida bajo el mismo protocolo.
- Análisis de equidad por género: los manifiestos de impostores MM, FF y MF permiten medir el comportamiento del sistema en comparaciones del mismo género y de género cruzado, con la salvedad del fuerte desequilibrio del corpus (711 hombres frente a 208 mujeres).
- Evaluación de un checkpoint preentrenado propio: el pipeline acepta un state dict de iResNet50 en `model.checkpoint` junto con su SHA-256 y su procedencia, por lo que puede emplearse como banco de pruebas para pesos de terceros.
- Formación docente y prototipado: el smoke test con modelo aleatorio e imágenes sintéticas permite validar la integración del entorno (PyTorch 2.9.1+cu126, torchvision 0.24.1+cu126) en una GTX 1650 Ti de 4 GB sin necesidad de datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las salidas del smoke test se etiquetan como tales y "no son evidencia sobre el rendimiento de reconocimiento". Las únicas cifras publicadas son de auditoría del corpus, no de modelo:

| Metrica | Valor | Naturaleza |
|---|---|---|
| Identidades retenidas tras auditoría | 919 (711 hombres, 208 mujeres) | Recuento de auditoría |
| Imágenes retenidas | 25.491 | Recuento de auditoría |
| Grupos de duplicados RGB exactos detectados | 28 (abarcando 11 pares de carpetas) | Recuento de auditoría |
| Pares de alias plausibles excluidos de forma conservadora | 11 | Decisión de auditoría |

## Requisitos de hardware

- Entorno verificado por el autor: Windows con Python 3.13.11, PyTorch 2.9.1+cu126, torchvision 0.24.1+cu126 y una GTX 1650 Ti con 4 GB de VRAM. Este entorno corresponde al smoke test con modelo pequeño inicializado aleatoriamente, no al entrenamiento real.
- VRAM para entrenamiento real de un iResNet50 con cabeza ArcFace: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. El único hardware documentado es la GTX 1650 Ti de 4 GB.
- Compatibilidad con GPU de consumo: el smoke test cabe en una GTX 1650 Ti de 4 GB; para el pipeline completo con datos reales no hay datos publicados.
- Opciones de despliegue: el proyecto se ejecuta como scripts de línea de comandos (`run_experiment.py doctor|prepare|multirun|create-synthetic`) sobre el intérprete de un entorno virtual. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni exportaciones a ONNX.
- Latencia y throughput: no disponible. No se publican medidas de tiempo por imagen ni de comparaciones por segundo.

## Comparativa con modelos similares

La información disponible no incluye resultados numéricos de este pipeline, por lo que la comparación solo puede establecerse a nivel de categoría metodológica. Los modelos de la misma familia (reconocimiento facial con pérdida de margen angular sobre backbones iResNet) serían ArcFace, CosFace y AdaFace.

| Modelo | Categoria | Backbone tipico | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Este repositorio | Pipeline de investigacion con ArcFace sobre iResNet50 | iResNet50 (InsightFace) | no disponible para el repositorio; MIT para el backbone vendorizado | no disponible |
| ArcFace | Perdida de margen angular para reconocimiento facial | iResNet (varias profundidades) | no verificada en la informacion disponible | no disponible |
| CosFace | Perdida de margen coseno para reconocimiento facial | iResNet / ResNet | no verificada en la informacion disponible | no disponible |
| AdaFace | Perdida adaptativa por calidad de imagen | iResNet (varias profundidades) | no verificada en la informacion disponible | no disponible |

No se dispone de cifras comparativas (LFW, IJB-C, MS1M, etc.) para este repositorio, de modo que cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- No es un modelo entrenado publicado: `configs/thesis.yaml` contiene puntos de partida de desarrollo, no hiperparámetros seleccionados para la tesis. Antes de una evaluación final hay que aportar un state dict preentrenado de iResNet50 compatible en `model.checkpoint`, su SHA-256 en `model.sha256` y su procedencia en `model.source`.
- Los resultados del smoke test se generan con un modelo aleatorio y texturas sintéticas; no son evidencia de rendimiento y están etiquetados explícitamente como tales.
- La comprobación de duplicados exactos de píxel RGB no detecta todas las personas repetidas ni los fotogramas casi duplicados; el propio autor recomienda revisar los registros de origen antes de fijar `identity_audit_verified`.
- No hay anotaciones de sesión fiables, por lo que la política de pares implementada es intra-capturas y no garantiza verificación entre sesiones distintas.
- Desequilibrio demográfico marcado en el corpus retenido: 711 identidades masculinas frente a 208 femeninas, con el consiguiente riesgo de sesgo de género en el comportamiento del sistema.
- Las correcciones de metadatos solo deben aplicarse cuando estén justificadas por registros autoritativos; los IDs, campos desconocidos y etiquetas de género canónicas en conflicto se rechazan, y cualquier cambio de elegibilidad exige un directorio de artefactos nuevo.
- La licencia del repositorio no está declarada en la información disponible; solo se confirma la licencia MIT del backbone vendorizado de InsightFace. Antes de un uso comercial es imprescindible aclarar la licencia del conjunto del proyecto.
- Algunos valores de configuración de margen se expresan en radianes y se convierten a grados para el paquete ArcFace; una conversión incorrecta altera silenciosamente el punto de operación.
- Repositorio de 10,0 GB sin descargas ni likes registrados: no hay validación externa ni comunidad que haya reproducido los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MinhNH232331M/master-thesis
- InsightFace (backbone vendorizado, commit `d9cb10e6bda109bc9b4a6ca8b92d7f3342b56492`): https://github.com/deepinsight/insightface
- Protocolo de investigación citado en la model card (ruta interna del repositorio): `references/p0_face_dataset_research_plan.md`
- Plan de implementación citado en la model card (ruta interna del repositorio): `references/p1_face_dataset_implementation_plan.md`
- Auditoría de identidades citada en la model card (ruta interna del repositorio): `references/identity_audit_v1.md`
- Documentación de `pytorch-metric-learning` 2.9.0: https://github.com/KevinMusgrave/pytorch-metric-learning
- Los resultados de la búsqueda web proporcionada no contienen enlaces relevantes para este modelo (devuelven páginas genéricas de Zhihu).
