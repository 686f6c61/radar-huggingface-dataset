# DanielNguyen121/BUSCA-UA-DETRAC

## Resumen

BUSCA-UA-DETRAC es una adaptación del sistema BUSCA (Lost and Found: Overcoming Detector Failures in Online Multi-Object Tracking, ECCV 2024) orientada al seguimiento multiobjeto de vehículos sobre el conjunto de datos UA-DETRAC. El repositorio, publicado por el usuario DanielNguyen121, no contiene un modelo de lenguaje ni un modelo generativo: es un artefacto de investigación que empaqueta código de entrenamiento, pesos y utilidades de evaluación para un pipeline de tracking con reidentificación (ReID) de vehículos. La arquitectura subyacente combina un extractor ResNet50 personalizado que produce embeddings de 512 dimensiones con un módulo Transformer BUSCA de cuatro capas y cuatro cabezas que corrige fallos del detector en línea.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de reproducibilidad científica en visión por computador: el autor preserva los módulos originales de BUSCA, añade un adaptador de dominio entrenado con datos autorizados de UA-DETRAC y publica manifiestos de ejecución, hashes de integridad y utilidades de reanudación. Por otro, expone con transparencia sus límites: solo 60 secuencias de entrenamiento, ausencia de resultados oficiales de test y una validación que es recuperación temporal intra-cámara, no un benchmark cross-camera.

El repositorio ocupa 15,1 GB y se distribuye bajo licencia GPL-3.0, con avisos de licencia MIT de ByteTrack preservados. No se publican imágenes crudas ni tablas de anotaciones por objeto, y el autor advierte explícitamente de que los pilot scores no establecen mejoras de tracking. Es, por tanto, material de partida para investigación reproducible, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet50 personalizado (red=4, max pooling) para ReID + Transformer BUSCA de 4 capas y 4 cabezas, 512 dimensiones; detector FasterRCNN ResNet50-FPN-v2 COCO_V1 congelado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | GPL-3.0 (con avisos MIT de ByteTrack preservados) |
| Formato de pesos | PyTorch (.pth: model_feats.pth, model_busca.pth) |

## Arquitectura y entrenamiento

El pipeline se compone de tres piezas. Primero, un detector FasterRCNN ResNet50-FPN-v2 preentrenado en COCO_V1, con clases fijas coche, autobús y camión, sin ajuste fino. Segundo, un extractor ReID que reconstruye el ResNet50 original de BUSCA (red=4, max pooling) y devuelve embeddings normalizados de 512 dimensiones. Tercero, el módulo BUSCA original: un Transformer de cuatro capas y cuatro cabezas con dimensión 512 y una tabla de búsqueda STE (straight-through estimator) con valores fijos; la factorización del STE solo cambia el almacenamiento, y el autor verifica la paridad completa en GPU con la tabla completa.

El entrenamiento se realizó sobre datos autorizados de UA-DETRAC en el entorno MoLab con una RTX PRO 6000. El conjunto disponible contiene únicamente 60 secuencias de entrenamiento; 1.706 imágenes sin anotaciones XML de frame se excluyen de la supervisión y de la evaluación puntuada. La validación es una partición determinista a nivel de secuencia de 48/12. El ajuste del ReID se plantea como recuperación temporal intra-cámara sobre secuencias reservadas, con separación mínima de 25 frames entre positivo y consulta. El autor distingue dos fuentes de apariencia: `official_embedded`, que restaura el estado BatchNorm embebido original, y `standalone`, que mantiene el ReID adaptado seleccionado deliberadamente. Los checkpoints incluyen modelo, optimizador, scheduler, estado RNG, cursor del sampler, hashes de configuración, datos y código upstream, además de sidecars de integridad e identificadores de paso inmutables.

## Capacidades

- Seguimiento multiobjeto en línea de vehículos (coche, autobús, camión) con detecciones fijas proporcionadas por un detector externo.
- Reidentificación de vehículos mediante embeddings de 512 dimensiones normalizados.
- Recuperación temporal intra-cámara sobre secuencias reservadas con separación mínima de 25 frames.
- Corrección de fallos del detector en línea mediante el módulo Transformer BUSCA.
- Generación de cachés fijas de detección y eventos de tracker en línea para evaluación end-to-end.
- Entrenamiento y reanudación determinista con linaje verificado de configuración, datos y pesos.
- Pausa segura ante SIGTERM en un límite de optimizador, con guardado de estado completo y espera de copia de seguridad verificada.
- Reanudación automática desde puntos locales o artefactos de recuperación verificados en Hugging Face.
- Evaluación en formato MOT compatible con TrackEval (sin implicar conformidad oficial con el benchmark UA-DETRAC).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación reproducible en tracking multiobjeto: el repositorio permite reconstruir el pipeline BUSCA con pesos originales descargables, verificar paridad y ejecutar tests, lo que sirve como base para experimentos que necesiten comparar contra el estado del arte de ECCV 2024.
- Adaptación de dominio de ReID de vehículos: un equipo con datos autorizados de UA-DETRAC puede reutilizar los scripts de preparación de dataset, manifiestos y configuración de ajuste fino para adaptar el extractor a su propia cámara o dominio.
- Auditoría de fallos de detector: las utilidades de eventos de detector y transformer permiten inspeccionar frecuencias de categorías de eventos y rechazar historiales ambiguos antes de aprobar un entrenamiento completo.
- Evaluación de recuperación temporal: el pipeline de validación intra-cámara con separación de 25 frames sirve para medir la calidad de embeddings ReID sin necesidad de un benchmark cross-camera completo.
- Formación y docencia en visión por computador: el repositorio documenta decisiones de ingeniería (hashes, sidecars, reanudación segura) útiles para enseñar prácticas de reproducibilidad en investigación.
- Integración en pipelines de análisis de tráfico offline: con detecciones fijas y el tracker upstream, puede usarse para generar diagnósticos end-to-end sobre secuencias grabadas, siempre que se respete la licencia GPL-3.0.
- Base para experimentos de tracking con detecciones congeladas: al no ajustar el detector, permite aislar el efecto del módulo de asociación y del ReID en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los pilot scores no establecen mejoras de tracking, que no hay resultados oficiales de test ni de compatibilidad con SURA-SORT sin ejecución, y que las métricas en formato MOT de TrackEval no implican conformidad con el benchmark oficial de UA-DETRAC.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio incluye scripts de benchmark de throughput (`reports/reid_throughput.json`) que permiten medirla en el hardware objetivo.
- GPU recomendadas: el autor verificó el entorno en una RTX PRO 6000; no se documentan otras GPU probadas.
- Cabe en GPU de consumo: no disponible; no se han publicado mediciones para RTX 4090, 3090 u otras.
- Opciones de despliegue: el proyecto está pensado para ejecutarse en MoLab con PyTorch y `requirements-lock.txt`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el repositorio incluye un script de benchmark (`vehicle_busca.training.benchmark`) para generarlos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BUSCA-UA-DETRAC | Tracking multiobjeto + ReID de vehículos | no disponible | no aplica | GPL-3.0 | Hugging Face, 0 descargas |
| BUSCA original (lorenzovaquero/BUSCA) | Tracking multiobjeto + ReID | no disponible | no aplica | GPL-3.0 | GitHub, commit 88a9ed7 |
| ByteTrack | Tracking multiobjeto | no disponible | no aplica | MIT | Repositorio público |
| SURA-SORT | Tracking multiobjeto | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de tarea, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo 60 secuencias de entrenamiento; el conjunto es insuficiente para conclusiones generales sobre tracking.
- No hay resultados oficiales de test ni evaluación cross-camera; la validación es recuperación temporal intra-cámara.
- Los pilot scores no demuestran mejoras de tracking; el autor lo advierte de forma explícita.
- 1.706 imágenes sin anotaciones XML quedan excluidas de supervisión y evaluación puntuada.
- No se publican imágenes crudas, recortes ni tablas de anotaciones por objeto; la redistribución pública de datos crudos no está establecida.
- El detector no se ajusta finamente; el rendimiento depende de la calidad de las detecciones externas.
- La inferencia original fuerza BatchNorm de adaptación de dominio dependiente del lote, por lo que las cachés por imagen independientes no son intercambiables con ese comportamiento.
- Licencia GPL-3.0: cualquier uso derivado debe cumplir sus obligaciones de copyleft; los avisos MIT de ByteTrack deben preservarse.
- Riesgo de sobreajuste a las secuencias disponibles y de resultados no reproducibles fuera del entorno MoLab verificado.
- No es un modelo de lenguaje: no admite tool calling, agentes ni capacidades multilingües.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DanielNguyen121/BUSCA-UA-DETRAC
- Dataset de metadatos: https://huggingface.co/datasets/DanielNguyen121/Vehicle_datasets/tree/main/UA-DETRAC
- Código original BUSCA: https://github.com/lorenzovaquero/BUSCA (commit 88a9ed7e400ddd2bda5028c36c254cbc5726ce98)
- Paper original: Lost and Found: Overcoming Detector Failures in Online Multi-Object Tracking, ECCV 2024
