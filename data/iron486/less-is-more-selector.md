# Iron486/less-is-more-selector

## Resumen

Less Is More — DINO and historical noDino selector weights es un par de checkpoints de selección de fotogramas (frame selection) asociados al trabajo "Less Is More: Genetic Frame Selection for Efficient Novel View Synthesis". No es un modelo generativo de lenguaje, sino un selector ligero: dado un conjunto de cámaras candidatas, sus descriptores DINOv2 y una medida de nitidez, produce una puntuación por candidato que permite elegir qué vistas de entrada alimentan a un reconstructor de novel view synthesis (NVS) situado aguas abajo. Lo publica el usuario Iron486 en Hugging Face bajo licencia CC-BY-4.0.

El modelo es un MLP de 19 entradas, dos capas ocultas de 64 unidades con activación GELU y una salida escalar, con solo 5.505 parámetros. Se distribuye en dos variantes: `dino` y la ablación histórica `noDino`. Ambas se cargan como state dictionaries de PyTorch, no como checkpoints de Transformers, y el paquete incluye la lógica de extracción de características y el decodificador greedy completo.

Su relevancia es de reproducibilidad: el release conserva los pesos originales sin reentrenamiento y documenta explícitamente una sutileza de la ablación `noDino` (la columna `dino_std` sigue activa), además de separar el protocolo de evaluación de un paper posterior del usado originalmente. Es una pieza de investigación para pipelines de NVS, no un componente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (19 entradas, dos capas ocultas de 64 unidades, GELU, una salida) |
| Parametros totales | 5.505 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre un pool de N candidatos) |
| Tipos de cuantizacion | no disponible (solo checkpoints float de PyTorch) |
| Idiomas soportados | en |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch state dict (`.pt`), cargado con `weights_only=True` |

## Arquitectura y entrenamiento

El selector es una red MLP muy pequeña: 19 características de entrada, dos capas ocultas de 64 unidades con GELU y una única puntuación de salida, totalizando 5.505 parámetros. Las 19 columnas combinan geometría de cámara (centros y direcciones de vista), descriptores DINOv2 ViT-S/14 (CLS, 384 dimensiones) y una medida de nitidez basada en la varianza del laplaciano. La variante DINO enmascara la columna 3; la variante histórica `noDino` enmascara las columnas 3, 4, 5 y 6.

Un detalle técnico relevante documentado por el autor: la bandera original `--mask_dino` pone a cero las columnas de similitud `dino_tgt_max`, `dino_tgt_mean` y `dino_sel_max` (4–6), pero con los grupos `NEW4,GEOM2` desplegados la columna `dino_std` (12) permanece activa. Por tanto, la ablación `noDino` no es totalmente libre de DINO ni de imagen. El checkpoint publicado no permite determinar qué máscaras se usaron durante su entrenamiento original. No se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO, algo esperable al no ser un modelo de lenguaje.

## Capacidades

- Selección de fotogramas para novel view synthesis: puntúa candidatos y elige un subconjunto de tamaño k mediante un decodificador greedy incluido.
- Puntuación de candidatos a partir de características precalculadas: geometría de cámara, descriptores DINOv2 y nitidez.
- Dos variantes de ablación: `dino` y `noDino`, cargables con `load_selector("dino")` o `load_selector("no_dino")`.
- Inferencia sobre matrices de características precomputadas: `model(F)` acepta un tensor float32 de forma (N, 19).
- Ejecución en CPU verificada con PyTorch 2.2.0 y NumPy 1.26.4.
- No soporta tool calling, agentes, razonamiento multi-step, visión directa ni audio; opera sobre descriptores ya extraídos.

## Casos de uso

- Reproducción de experimentos de NVS: cargar los pesos originales sin reentrenamiento y ejecutar `selector.py` sobre un `scene.npz` preparado para replicar los resultados del paper con la revisión exacta del repositorio.
- Ablación controlada de descriptores DINO: comparar las variantes `dino` y `noDino` manteniendo el mismo pool de candidatos y el mismo reconstructor aguas abajo, para medir el impacto de las columnas de similitud.
- Integración en un pipeline de captura multi-vista: dado un conjunto grande de imágenes de una escena, reducir el número de vistas de entrada antes de la reconstrucción, ahorrando coste computacional en el reconstructor.
- Diagnóstico de protocolos de evaluación: usar el paquete para contrastar el protocolo original con la adaptación posterior (target-pose/150 candidatos) y documentar diferencias de forma explícita.
- Selección de vistas en robótica o fotogrametría: puntuar cámaras candidatas con geometría y nitidez para elegir las más informativas antes de un pipeline de reconstrucción 3D.
- Docencia e investigación en selección de subconjuntos: ejemplo mínimo y auditable (5.505 parámetros) de selección greedy guiada por un modelo aprendido, útil para estudiar sesgos de selección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo tiene 5.505 parámetros y cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no requiere GPU; la verificación del autor se realizó en CPU con PyTorch 2.2.0.
- Cabe en consumer GPU: sí, en cualquier GPU con soporte PyTorch (RTX 4090, RTX 3060, etc.), aunque no es necesario.
- Opciones de despliegue: scripts incluidos (`selector.py`, `smoke_test.py`, `features.py`); no es compatible con vLLM, TGI, llama.cpp ni Ollama al no ser un modelo de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada; el coste dominante no es el selector sino la extracción de descriptores DINOv2 y el reconstructor aguas abajo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Less Is More selector (este) | 5.505 | no aplica | Selección de vistas NVS | CC-BY-4.0 | Hugging Face |
| Alternativas de selección de vistas NVS | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no genera texto, código ni imágenes; solo puntúa candidatos.
- Requiere características precalculadas: el paquete no incluye el backbone DINOv2, el preprocesado de imágenes, los reconstructores, las imágenes ni los datasets.
- La ablación `noDino` no es completamente libre de DINO: la columna `dino_std` (12) permanece activa, y la nitidez también; interpretarla como "sin DINO" induce a error.
- El checkpoint publicado no permite saber qué máscaras se usaron en el entrenamiento original; el autor lo advierte explícitamente.
- El protocolo target-pose/150 candidatos es una adaptación de un paper posterior, no el protocolo original del Paper 3; mezclarlos invalida comparaciones.
- Las características dependen del conjunto ya seleccionado y deben recalcularse en cada paso greedy; usar `model(F)` sin `select()` omite esta lógica.
- Diferencias numéricas posibles con versiones de PyTorch o NumPy posteriores a las verificadas (2.2.0 y 1.26.4).
- Riesgo de sobreajuste a la distribución de escenas del paper original; no hay evaluación de generalización en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige citar el paper, el repositorio, la variante y la revisión exacta.

## Enlaces

- Hugging Face: https://huggingface.co/Iron486/less-is-more-selector
- Paper asociado: "Less Is More: Genetic Frame Selection for Efficient Novel View Synthesis" (no se proporciona URL directa en la información disponible)
- Repositorio de descarga: `hf download Iron486/less-is-more-selector --local-dir paper3-selector`
