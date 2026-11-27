# meteolibre-dev/regionalflash

## Resumen

RegionalFlash (`v2-256`) es un modelo generativo de predicción meteorológica desarrollado por meteolibre-dev que emite pronósticos atmosféricos paneuropeos a 5,5 km de resolución combinando cuatro modalidades en un único modelo: reanálisis CERRA 3D, bandas de satélite Meteosat, reflectividad de radar OPERA y observaciones de superficie de aeropuertos METAR. Se trata de un Diffusion Transformer (DiT) con formulación de Rectified Flow y predicción en espacio `x` (`RegionalFlashJiT3D`), con 175,78 millones de parámetros y una rejilla de inferencia de `1069 × 1069` celdas (aproximadamente 5.879 km × 5.879 km).

El modelo resuelve un problema clásico de la predicción meteorológica con aprendizaje profundo: la generación de campos espaciales de alta resolución con coherencia multimodal y sin los artefactos de mosaico típicos de los enfoques por parches. Para ello emplea multi-diffusion tiling solapado (25 teselas de 256 con paso 192) que cubre toda Europa de forma continua, y logra un pronóstico completo de 24 horas con 20 pasos de ODE en 53 segundos sobre una única GPU H200.

Es relevante ahora porque demuestra que un modelo de difusión de tamaño moderado (175,78 M de parámetros) puede integrar satélite, radar y estaciones en un mismo campo generativo a escala continental, con resultados de validación publicados sobre un episodio Cévenol no visto (CSI20 de 0,77 a +18 h y 0,20 a +24 h). El repositorio ocupa 5,6 GB y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer 3D (`RegionalFlashJiT3D`), Rectified Flow con predicción en `x` |
| Parametros totales | 175,78 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal de pronóstico de 24 h con paso de 3 h) |
| Tipos de cuantizacion | no disponible (checkpoints en `.pt` con pesos `model`, `ema`, `optimizer` y `config`) |
| Idiomas soportados | no aplica (modelo meteorológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint completo con EMA y optimizador) |

Otros parámetros técnicos: `embed_dim=1024`, `depth=12`, `num_heads=16`, `patch=(1, 8, 8)`, RoPE 3D, embedding de parche con FiLM y atención cross-channel, `LandCoverEmbed` con inicialización a cero. Rejilla de inferencia `1069 × 1069` a ~5,5 km. Entrada condicionante estática: `static_5km.zarr` (6 canales: orografía, máscara tierra/mar, lat/lon) y ESA WorldCover 2021 `landcover_5km.zarr` (7 canales: fracciones de árbol, hierba, cultivo, urbano, suelo desnudo, agua y log-distancia a costa).

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer 3D que opera sobre parches espacio-temporales de forma `(1, 8, 8)` y aplica RoPE 3D para codificar posición en las tres dimensiones (tiempo, latitud, longitud). La formulación generativa es Rectified Flow con predicción directa del estado limpio (`x-prediction`), lo que simplifica el muestreo ODE y permite integrar el forzado de sensores de forma consistente con la variedad de datos (`on-manifold sensor forcing`). El condicionamiento estático se inyecta mediante un `LandCoverEmbed` inicializado a cero y un esquema FiLM junto con atención cross-channel en el embedding de parche, de modo que el modelo aprende a modular la generación según la orografía y el uso del suelo.

El entrenamiento se realizó en dos etapas sobre el dataset `meteolibre-dev/regionalflash` (2018–2022). La etapa 1 operó con teselas de `128 × 128` (704 km) durante 44 épocas usando cuatro años de datos europeos (2018–2021). La etapa 2 hizo fine-tuning con teselas de `256 × 256` (1.408 km) durante 31 épocas sobre GPU H200 NVL, con tasa de aprendizaje de 6e-5 a 5e-6 y EMA de 0,9985. La inferencia paneuropea usa multi-diffusion tiling con `tile=256` y `stride=192`, cubriendo Europa con 25 teselas solapadas.

## Capacidades

- Predicción conjunta de estado atmosférico 3D: 57 canales CERRA (10 niveles de presión × 5 variables + 7 variables de superficie).
- Predicción de 11 bandas de satélite europeo (Google SatWeave / Meteosat) con máscara de validez.
- Predicción de reflectividad radar compuesta (dBZ) de EUMETNET OPERA con máscara de cobertura.
- Predicción de 6 variables de superficie en 1.116 estaciones METAR europeas.
- Pronóstico multimodal unificado en un solo modelo, sin pipelines separados por sensor.
- Pronóstico a escala continental (`1069 × 1069`) mediante multi-diffusion tiling sin costuras.
- Pronóstico de 24 horas con paso temporal de 3 horas (8 pasos temporales).
- Condicionamiento estático por orografía, máscara tierra/mar y cobertura del suelo (ESA WorldCover 2021).
- Muestreo ODE determinista con 20 pasos (no se documenta muestreo estocástico por ensemble en la información disponible).
- No soporta tool calling, agentes, visión genérica ni capacidades lingüísticas: es un modelo de dominio meteorológico.

## Casos de uso

- Pronóstico operativo paneuropeo a 5,5 km: el modelo genera un campo completo de 24 h en 53 segundos en una H200, lo que permite ciclos de actualización frecuentes en un servicio meteorológico regional sin depender de un HPC masivo.
- Predicción de precipitación convectiva extrema: el episodio Cévenol de validación (CSI20 de 0,77 a +18 h) muestra utilidad para alertas de lluvias torrenciales en el sur de Europa, donde los modelos globales pierden detalle.
- Asimilación y nowcasting multimodal: al integrar radar OPERA y satélite Meteosat en el mismo campo generativo, sirve para producir análisis consistentes entre sensores y extender la observación hacia el futuro cercano.
- Downscaling de pronósticos globales: la rejilla de 5,5 km y el condicionamiento por orografía y cobertura del suelo permiten refinar campos de modelos globales a escala regional para energía eólica y solar.
- Verificación y reconstrucción de campos de reanálisis: los 57 canales CERRA permiten generar campos 3D coherentes para estudios climáticos regionales y para completar huecos en archivos históricos.
- Predicción de visibilidad y condiciones de superficie en aeropuertos: los 1.116 puntos METAR con 6 variables de superficie permiten generar pronósticos específicos de estación para aviación.
- Investigación en modelos generativos geofísicos: la combinación de Rectified Flow, DiT 3D y multi-diffusion tiling constituye una base reproducible para experimentar con nuevos sensores y resoluciones.
- Generación de escenarios y ensembles: el esquema de difusión permite, en principio, muestrear múltiples miembros cambiando la semilla del ODE, útil para probabilidad de precipitación (no documentado explícitamente en la model card).

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (menor es mejor en las pérdidas; mayor es mejor en CSI20):

| Checkpoint | Época | Val CERRA 3D | Val SatWeave | Val OPERA Radar | +18 h Cévenol CSI20 | +24 h Cévenol CSI20 |
|---|---|---|---|---|---|---|
| `jit3d_W1024_D12_LC_256_ep31_last.pt` | 31 | 0,0138 | 0,0198 | 0,0459 (0,0434 en ép. 30) | 0,77 | 0,20 |
| `jit3d_W1024_D12_LC_256_ep18_best.pt` | 18 | 0,0140 | 0,0198 | 0,0433 | 0,67 | 0,18 |

No se han publicado comparaciones con otros modelos meteorológicos (GraphCast, Pangu-Weather, AIFS, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 175,78 M de parámetros en fp32 los pesos ocupan ~0,7 GB, pero la inferencia sobre `1069 × 1069` con 25 teselas y atención 3D eleva el consumo de activaciones de forma considerable (no cuantificado en la model card).
- GPU de referencia del autor: NVIDIA H200 NVL, con 53 segundos por pronóstico completo de 24 h (20 pasos ODE, 1 miembro, `1069 × 1069`).
- GPU recomendadas: H200 o A100 80 GB para inferencia paneuropea completa; GPUs de menor memoria requerirían reducir el número de teselas o procesar por regiones.
- ¿Cabe en GPU consumer? No hay datos publicados; el tamaño de pesos es compatible con una RTX 4090 (24 GB), pero la rejilla completa y el tiling probablemente excedan esa memoria. No confirmado.
- Opciones de despliegue: el repositorio de código es `meteolibre-dev/regionalflash` en GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo). El despliegue se realiza con PyTorch y los checkpoints `.pt`.
- Latencia y throughput: 53 s por pronóstico de 24 h a escala continental en H200; no se publican cifras para otras GPU ni para lotes por tesela.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto temporal | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RegionalFlash `v2-256` | 175,78 M | ~5,5 km | 24 h, paso 3 h | CERRA 3D, satélite, radar, METAR | Apache 2.0 | Pesos en HF, código en GitHub |
| GraphCast | no disponible en esta ficha | ~0,25° | 10 días, paso 6 h | Estado atmosférico global | no disponible | no disponible |
| Pangu-Weather | no disponible en esta ficha | ~0,25° | 7 días, paso 6 h | Estado atmosférico global | no disponible | no disponible |
| AIFS (ECMWF) | no disponible en esta ficha | ~0,25° | hasta 15 días | Estado atmosférico global | no disponible | no disponible |

Nota: los datos de los modelos comparados no provienen de la información proporcionada y deben verificarse en sus fichas oficiales; la comparación se ofrece solo como referencia categórica.

## Limitaciones y advertencias

- Modelo de dominio específico: no es un modelo de lenguaje ni un modelo multimodal general; no admite texto, tool calling ni agentes.
- Cobertura geográfica limitada a Europa paneuropea; fuera de esa región no hay garantía de validez.
- Ventana de pronóstico corta (24 h) y paso temporal grueso (3 h), insuficiente para predicción a medio plazo.
- Entrenado con datos de 2018–2022; puede degradarse ante regímenes climáticos no representados o ante cambios en los sensores (nuevos satélites, cambios en la red OPERA o METAR).
- Riesgo de deriva acumulada en rollouts largos: el CSI20 cae de 0,77 a +18 h a 0,20 a +24 h en el episodio Cévenol, lo que indica pérdida rápida de habilidad con el horizonte.
- No se documentan métricas de calibración probabilística, ni evaluación por ensemble, ni comparación con modelos operativos.
- El condicionamiento estático depende de `static_5km.zarr` y `landcover_5km.zarr`; un desajuste en estos ficheros puede introducir sesgos sistemáticos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la validación operativa corre por cuenta del usuario.
- El modelo se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso independiente ni de replicación de resultados.
- No se especifican sesgos conocidos ni limitaciones idiomáticas (no aplica), pero sí existe riesgo de que el modelo reproduzca sesgos presentes en la reanálisis CERRA y en la cobertura desigual de estaciones METAR (Europa occidental mejor cubierta que la oriental).

## Enlaces

- Hugging Face: https://huggingface.co/meteolibre-dev/regionalflash
- Dataset: https://huggingface.co/datasets/meteolibre-dev/regionalflash
- Código de entrenamiento y evaluación: https://github.com/meteolibre-dev/regionalflash
- No se han encontrado en la información disponible enlaces a papers, blogs o demos adicionales.
