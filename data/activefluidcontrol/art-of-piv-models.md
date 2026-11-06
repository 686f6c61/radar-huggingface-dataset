# activefluidcontrol/art-of-piv-models

## Resumen

ART of PIV models es una colección de checkpoints publicada por el usuario activefluidcontrol junto con el artículo "ART of PIV", orientada a estimación de flujo óptico en velocimetría por imagen de partículas (PIV). El repositorio no contiene un modelo de lenguaje, sino un conjunto de pesos especializados en el cálculo de campos de flujo a partir de pares de imágenes, implementados en JAX y consumibles mediante la librería flowgym. Incluye especialistas RAFT32 afinados por clase de flujo, enrutadores (routers) que seleccionan el estimador adecuado por par de imágenes y variantes entrenadas sobre grabaciones reales de canal de agua.

El interés del repositorio es metodológico: los routers aprendidos eligen entre una biblioteca de configuraciones de estimadores (RAFT32, DIS, OpenPIV) en función de la imagen de entrada, y el material publicado permite reproducir las tablas del artículo con checkpoints por semilla. Los resultados reportados en la model card sitúan el router sobre RAF32 en un AEPE de 0,0096 px sobre el conjunto de test retenido de PIV clase 1, muy por debajo de las alternativas DIS y OpenPIV incluidas en la comparativa interna.

El repositorio ocupa 1,0 GB y no redistribuye el checkpoint preentrenado original de RAFT32-PIV de Lagemann et al., que debe obtenerse de los autores y convertirse con un script de flowgym. La licencia figura como "other" y no se detalla en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RAFT32 (flujo óptico) y estimadores DIS/OpenPIV; routers aprendidos en JAX/Flax |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión para pares de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | other |
| Formato de pesos | Orbax (RAFT32 y routers), Flax msgpack (quieting_pde/original) |

## Arquitectura y entrenamiento

El componente principal son los especialistas RAFT32, afinados por clase de flujo (uniform, cylinder, backstep, SQG, jhtdb, DNS_turbulence) a partir del RAFT32-PIV preentrenado de Lagemann et al. (Nature Machine Intelligence, 2021). Cada carpeta es byte-idéntica al artefacto de W&B del que se movió, lo que permite trazabilidad exacta entre pesos y experimento. Los routers se entrenan desde semillas en `experiments/art_of_piv/` de flowgym y seleccionan, por par de imágenes, un miembro de una biblioteca de estimadores resuelta en `estimator.yaml`.

En el caso real de canal de agua, el router se entrena con etiquetas de experto (índice de la configuración preferida) y aumento fotométrico; el paso 500 alcanza error de etiqueta 0,0 sobre los 3.598 pares de validación. El region router elige entre tres regiones de 256 x 256 y logra error de etiqueta 0,00074 (4 de 5.397 pares) en el paso 3000. La ablación de aumento fotométrico entrena cinco semillas por variante; las semillas 3 y 4 sin aumento no superan el nivel de azar y se conservan en la comparativa. Los routers de `quieting_pde` se publican como checkpoints Flax msgpack con SHA256 verificado contra `paper_provenance.json`.

## Capacidades

- Estimación de flujo óptico denso a partir de pares de imágenes PIV.
- Selección automática de estimador por par de imágenes mediante routers aprendidos.
- Afinamiento por clase de flujo: flujo uniforme, cilindro, escalón descendente, SQG, JHTDB y turbulencia DNS.
- Enrutado sobre configuraciones DIS con distintos tamaños de parche, stride y niveles.
- Enrutado por región de la imagen (tres recortes de 256 x 256) en grabaciones reales.
- Routers de PDE quieting en dos conjuntos separados (original y reproducción FlowGames).
- Integración con flowgym mediante referencias `hf://` fijadas a un commit.
- No soporta tool calling, agentes, texto ni capacidades multilingües.

## Casos de uso

- Reproducción de resultados del artículo: fijar un commit del repositorio en la configuración de flowgym y cargar los especialistas RAFT32 por clase de flujo para replicar las tablas publicadas.
- Procesamiento de experimentos PIV en laboratorio: usar el especialista correspondiente (cylinder, backstep, uniform) para obtener campos de flujo con AEPE bajo en la clase adecuada.
- Enrutado automático en pipelines de adquisición: el router sobre RAF32 selecciona el estimador por par de imágenes sin intervención manual, con AEPE de 0,0096 px en el test retenido.
- Medición en canal de agua real: aplicar el router de `water_channel/router/` con el preprocesado de `estimator.yaml` (recorte, limitación de intensidad, supresión de fondo, estiramiento de contraste) sobre las grabaciones.
- Segmentación por regiones de interés: el region router elige entre tres recortes de 256 x 256 para adaptar la estimación a zonas con distinta calidad de imagen.
- Estudio de sensibilidad al aumento fotométrico: reutilizar la ablación de cinco semillas para evaluar el impacto del aumento en la precisión de etiqueta sobre el conjunto de test separado.
- Investigación en PDE quieting: restaurar los routers `quieting_pde/original/` con la plantilla de `train.py` y verificar la procedencia mediante los SHA256 publicados.

## Benchmarks y rendimiento

AEPE (px) en el conjunto de test retenido de PIV clase 1, media sobre tres semillas:

| Fila | AEPE |
|---|---|
| raft32 | 0,0096 |
| dis_20hz | 0,1268 |
| dis_1khz | 0,1385 |
| openpiv_1khz | 0,1979 |
| openpiv_4khz | 0,1974 |

Ablación de aumento fotométrico en canal de agua real (exactitud frente a etiquetas de experto, 3.598 pares):

| Variante | Pasos seleccionados (semillas 0 a 4) | Exactitud de test |
|---|---|---|
| with_augmentation | 500, 500, 500, 0, 500 | 1, 1, 1, 0,5, 1 |
| without_augmentation | 2000, 1500, 500, 0, 0 | 1, 1, 1, 0,5, 0,5 |

No se han publicado en la información disponible resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K); no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el stack es JAX/Flax y puede ejecutarse en GPU o TPU compatibles.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (1,0 GB) sugiere que los checkpoints individuales son manejables, pero no se detalla el consumo por modelo.
- Opciones de despliegue: carga mediante flowgym con referencias `hf://`; restauración de checkpoints Flax msgpack con la plantilla de `train.py` para `quieting_pde`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ART of PIV (raft32) | Router + RAFT32 | pares de imágenes PIV | AEPE 0,0096 px (test clase 1) | other | Hugging Face, 1,0 GB |
| DIS (dis_20hz / dis_1khz) | Estimador clásico | pares de imágenes PIV | AEPE 0,1268 / 0,1385 px | no disponible | incluido como miembro de biblioteca |
| OpenPIV (1khz / 4khz) | Estimador clásico | pares de imágenes PIV | AEPE 0,1979 / 0,1974 px | no disponible | incluido como miembro de biblioteca |
| RAFT32-PIV (Lagemann et al.) | Red de flujo óptico | pares de imágenes PIV | no disponible en esta ficha | no disponible | Code Ocean, no redistribuido aquí |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, código ni responde a instrucciones; cualquier uso en esos dominios es inadecuado.
- El checkpoint preentrenado RAFT32-PIV no se redistribuye; sin él, los especialistas no pueden reconstruirse desde cero sin obtenerlo de los autores y convertirlo.
- La licencia "other" no especifica condiciones de uso comercial; debe consultarse con el autor antes de cualquier despliegue en producción.
- Los routers están entrenados para clases de flujo concretas; su generalización fuera de esas clases no está documentada.
- El router de canal de agua exige aplicar el preprocesado exacto de `estimator.yaml`; omitirlo invalida las predicciones.
- Dos de las cinco semillas sin aumento fotométrico no superan el nivel de azar, lo que indica sensibilidad a la inicialización en ese régimen.
- Los conjuntos `quieting_pde/original/` y `quieting_pde/flowgames_reproduction/` no deben mezclarse: pesos y resultados son independientes.
- No se han publicado métricas de sesgo, robustez ante dominios distintos ni latencia; la evaluación se limita a los conjuntos descritos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/activefluidcontrol/art-of-piv-models
- Librería flowgym: https://github.com/antonioterpin/flowgym
- Dataset complementario (canal de agua): https://huggingface.co/activefluidcontrol/art-of-piv-water-channel
- RAFT32-PIV de Lagemann et al., Nature Machine Intelligence 3 (2021); checkpoint en Code Ocean capsule 7226151 (no redistribuido en este repositorio)
