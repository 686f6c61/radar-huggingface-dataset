# orcaengineer/orca-vggt-depth-bf16

## Resumen

ORCA VGGT depth (bfloat16) es una variante podada y recuantizada de facebook/VGGT-1B-Commercial, el modelo Visual Geometry Grounded Transformer de Meta AI para reconstruccion geometrica multi-vista. La desarrolla el usuario orcaengineer como componente del pipeline ORCA, orientado a cartografiar arrecifes de coral a partir de imagenes de prospeccion submarina. El modelo conserva unicamente la cabeza de profundidad (depth head) del VGGT original y descarta las cabezas de camara, nube de puntos y tracking, lo que reduce el numero de parametros de 1.256,5 M a 941,8 M y el peso en disco de 5,03 GB a unos 1,95 GB.

La motivacion es practica: VGGT-1B-Commercial no cabe en GPUs de 4 GB, mientras que esta version alcanza un pico de 2,71 GB en una RTX 3050 Laptop con 8 vistas y procesamiento de una imagen por chunk en la cabeza de profundidad. El modelo se usa para rellenar los huecos que deja el emparejamiento estereo en los mapas de profundidad de cada fotograma submarino. No se ha reentrenado ningun peso: la cabeza de profundidad es identica bit a bit al original y solo el agregador se ha convertido a bfloat16.

Es relevante porque demuestra una via de despliegue de VGGT en hardware de consumo para fotogrametria submarina, con una degradacion medida muy contenida (diferencias de profundidad de 2,0 a 7,6 mm de mediana y de 5,9 a 18,9 mm en el percentil 95, a 2-4,5 m de distancia, frente al original en H100). La ficha se basa exclusivamente en la informacion publicada por el autor y en los datos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VGGT (Visual Geometry Grounded Transformer) multi-vista, podado a cabeza de profundidad |
| Parametros totales | 941.766.882 (941,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo opera sobre un conjunto de vistas, no sobre tokens de texto; el ejemplo usa 8 vistas) |
| Tipos de cuantizacion | bfloat16 en el agregador; float32 en la cabeza de profundidad (sin cambios respecto al original) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | VGGT License v1 de 29 de julio de 2025 (incluye la Acceptable Use Policy de Meta); etiquetada como `other` / `vggt-license` |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json`, `LICENSE`, `NOTICE` y `SHA256SUMS` |

## Arquitectura y entrenamiento

VGGT es un transformer que procesa un conjunto de imagenes y predice directamente geometria de la escena (camaras, profundidad, nubes de puntos y tracks) sin necesidad de optimizacion por escena en tiempo de inferencia. Esta variante mantiene el agregador del modelo original pero lo almacena en bfloat16, y conserva la cabeza de profundidad en float32 porque VGGT ejecuta sus cabezas con autocast desactivado, de modo que reciben entradas en float32. El `config.json` del repositorio construye directamente el modelo solo-profundidad.

No se ha realizado ningun reentrenamiento ni ajuste fino: la model card indica explicitamente que no se reentrenaron pesos y que la cabeza de profundidad es bit-identica a la del modelo base. Los metadatos de `model.safetensors` registran la revision y el sha256 del modelo de origen. La unica innovacion tecnica es de empaquetado y despliegue: la poda de cabezas no necesarias para profundidad y la conversion del agregador a bfloat16, que exige GPU con compute capability 8.0 o superior (en GPUs anteriores o en CPU hay que convertir el agregador a float32). Ademas, el autor documenta un ajuste de `frames_chunk_size=1` en la cabeza de profundidad para mantener 8 vistas dentro de 4 GB sin alterar la salida.

Los datos de entrenamiento no se detallan en la informacion disponible; corresponden al entrenamiento original de VGGT descrito en el paper de CVPR 2025.

## Capacidades

- Estimacion de profundidad relativa multi-vista: devuelve un mapa de profundidad por vista a partir de un conjunto de imagenes.
- Relleno de huecos en mapas de profundidad estereo, caso de uso principal en el pipeline ORCA.
- Procesamiento por chunks de vistas en la cabeza de profundidad para ajustar el consumo de memoria.
- Inferencia en GPUs de consumo de 4 GB con 8 vistas y chunk de 1 fotograma.
- No incluye cabeza de camara, cabeza de nube de puntos ni cabeza de tracking (eliminadas respecto a VGGT-1B-Commercial).
- No soporta tool calling, function calling, agentes, texto, vision generativa, audio ni modo thinking; es un modelo puramente geometrico.
- Capacidades multilingues: no aplicables.

## Casos de uso

- Cartografia de arrecifes de coral: el modelo rellena los huecos que deja el emparejamiento estereo en los mapas de profundidad de cada fotograma de una prospeccion submarina, y el pipeline ORCA escala la profundidad relativa a metros con una ratio de mediana contra la profundidad estereo.
- Fotogrametria submarina en embarcaciones con hardware modesto: al caber en 4 GB de VRAM, permite ejecutar reconstruccion geometrica a bordo con una RTX 3050 Laptop u GPU equivalente.
- Preprocesado de datasets de imagenes submarinas: generar mapas de profundidad densos por vista antes de un alineamiento o mosaico posterior.
- Prototipado e investigacion en reconstruccion multi-vista: util para experimentar con la cabeza de profundidad de VGGT sin cargar el modelo completo de 5,03 GB.
- Relleno de profundidad en pipelines estereo existentes: se puede insertar como etapa correctiva alli donde el matching clasico falla por baja textura o turbidez.
- Evaluacion comparativa de robustez geometrica: permite medir la degradacion de profundidad en bfloat16 frente al original en float32 (diferencias de 2,0-7,6 mm de mediana a 2-4,5 m).
- Despliegue en entornos con restricciones de memoria: el chunking de la cabeza de profundidad permite ajustar el numero de vistas simultaneas al presupuesto de VRAM disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta una comparacion de fidelidad de profundidad frente al modelo original:

| Metrica | Valor |
|---|---|
| Conjunto de evaluacion | 10 fotogramas submarinos |
| Referencia | VGGT-1B-Commercial en H100 |
| Diferencia de profundidad, mediana | 2,0 a 7,6 mm |
| Diferencia de profundidad, percentil 95 | 5,9 a 18,9 mm |
| Rango de distancia | 2 a 4,5 m |
| Equivalencia declarada | similar a ejecutar el original en CPU en lugar de GPU |
| Pico de VRAM (8 vistas, chunk de 1) | 2,71 GB en RTX 3050 Laptop GPU |

## Requisitos de hardware

- VRAM estimada: 2,71 GB de pico con 8 vistas y `frames_chunk_size=1` en la cabeza de profundidad (medido en RTX 3050 Laptop GPU).
- Cabe en GPUs de consumo de 4 GB o mas; el autor lo presenta explicitamente como ejecutable en una GPU de 4 GB.
- GPUs recomendadas: cualquier GPU con compute capability 8.0 o superior para bfloat16 (RTX 30xx/40xx, A100, H100). En GPUs anteriores o en CPU hay que convertir el agregador a float32.
- Despliegue: paquete `vggt` de https://github.com/facebookresearch/vggt y PyTorch; no requiere cuenta ni token de Hugging Face para descargar el modelo.
- Ajuste de memoria: reducir `frames_chunk_size` o el numero de vistas para presupuestos de VRAM menores.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano en disco: aproximadamente 1,95 GB (repo de 1,9 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Cabezas | Precisión agregador | Tamano | VRAM pico (8 vistas) | Licencia |
|---|---|---|---|---|---|---|
| orca-vggt-depth-bf16 | 941,8 M | Solo profundidad | bfloat16 | ~1,95 GB | 2,71 GB (RTX 3050 Laptop) | VGGT License v1 |
| facebook/VGGT-1B-Commercial | 1.256,5 M | Camara, profundidad, puntos, tracking | float32 | 5,03 GB | No cabe en 4 GB | VGGT License v1 |
| Otros modelos de profundidad multi-vista | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La profundidad es relativa; requiere un escalado externo (en ORCA, una ratio de mediana contra profundidad estereo) para obtener metros.
- Solo estima profundidad: no proporciona poses de camara, nubes de puntos ni tracks, por lo que no sustituye al VGGT completo en pipelines que necesiten geometria de camara.
- La cabeza de profundidad debe permanecer en float32; convertirla a bfloat16 alteraria los resultados, ya que VGGT ejecuta las cabezas con autocast desactivado.
- bfloat16 requiere compute capability 8.0 o superior; en GPUs mas antiguas o CPU hay que usar float32 en el agregador.
- La evaluacion de fidelidad se limita a 10 fotogramas submarinos y a un rango de 2-4,5 m; no hay validacion publicada en otros dominios ni a otras distancias.
- No se han publicado benchmarks estandar ni evaluaciones de sesgo; al ser un modelo geometrico, los sesgos relevantes serian los del dataset de entrenamiento original de VGGT, no documentados aqui.
- Licencia VGGT License v1 con Acceptable Use Policy de Meta: el uso comercial esta sujeto a dicha licencia, y cualquier redistribucion del modelo o de trabajos derivados debe hacerse bajo la misma licencia e incluir una copia (clausula 1.b.i).
- Es un derivado no oficial: no esta hecho ni respaldado por Meta; la atribucion consta en el fichero `NOTICE`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcaengineer/orca-vggt-depth-bf16
- Modelo base: https://huggingface.co/facebook/VGGT-1B-Commercial
- Repositorio oficial de VGGT: https://github.com/facebookresearch/vggt
- README de VGGT Omega: https://raw.githubusercontent.com/facebookresearch/vggt-omega/main/README.md
- Paper VGGT (Wang et al., CVPR 2025): no disponible como enlace directo en la informacion proporcionada
