# pointcept-bot/L-DPT

## Resumen

L-DPT (Latent DPT) es un modelo de estimacion de profundidad relativa que combina un codificador DINOv3 ViT-7B/16 congelado con un decodificador DPT latente entrenable de 271M de parametros. Lo desarrolla un equipo academico liderado por Xiaoyang Wu (Pointcept) y se presenta en un articulo aceptado en ECCV 2026. El modelo resuelve el problema de la prediccion densa a resolucion nativa de imagen: aunque el decodificador se entrena exclusivamente con recortes de 768 px, en inferencia puede procesar fotografias de hasta 100 megapixeles sin datos de entrenamiento de alta resolucion.

La relevancia del modelo reside en su estrategia de "latent decoding": el decodificador opera sobre los tokens latentes del codificador con atencion sobre la rejilla de parches (RoPE 2D) y un cabezal de salida exponencial, lo que permite escalar a resoluciones muy altas manteniendo coherencia en la profundidad. El repositorio de Hugging Face contiene unicamente los pesos del decodificador (1.08 GB en fp32); el codificador DINOv3 debe descargarse por separado desde Meta bajo su propia licencia.

Se distribuyen dos variantes de pesos: una zero-shot, entrenada solo con datos sinteticos y multivista, y otra "mixed", que anade los conjuntos de entrenamiento de NYUv2, KITTI y DIODE. La salida es profundidad relativa positiva (mayor valor indica mayor distancia), definida salvo escala y desplazamiento por imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador DINOv3 ViT-7B/16 congelado + decodificador DPT latente (transformer) |
| Parametros totales | 271M en el decodificador; el codificador ViT-7B no se incluye en el repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa imagenes a resolucion nativa, hasta 100 MP) |
| Tipos de cuantizacion | no disponible (pesos del decodificador en fp32; inferencia en bf16) |
| Idiomas soportados | no disponible (tarea de vision, sin procesamiento de lenguaje) |
| Licencia | "other" con license_name "tbd"; el codificador DINOv3 esta bajo la DINOv3 License de Meta |
| Formato de pesos | .pth (PyTorch); cada fichero incluye solo el decodificador y su configuracion |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El codificador es el DINOv3 ViT-7B/16 (LVD-1689M) de Meta, que permanece congelado y del que se extraen caracteristicas tras los bloques 10, 20, 30 y 40 (el ultimo). El decodificador es un DPT latente con anchura 1024, 16 cabezas de atencion y 4 etapas de 4 bloques transformer cada una, con RoPE 2D sobre la rejilla de parches, un readout 3x3 y un cabezal de salida exponencial. Se ejecuta en bf16, salvo la atencion de la ultima etapa en fp32, con un limite de 1000 sobre los logits de atencion.

El entrenamiento del decodificador se realiza exclusivamente sobre recortes de 768 px. La variante zero-shot usa 506.790 muestras de ocho conjuntos sinteticos y multivista: Hypersim, Virtual KITTI 2, Structured3D, TartanAir, BlendedMVS (tres releases) e IRS. La variante mixed anade los conjuntos de entrenamiento de NYUv2, KITTI y DIODE (interior y exterior), alcanzando 579.637 muestras; los pesos liberados son la media uniforme de dos checkpoints de esta receta. No se documenta en la informacion disponible el uso de RLHF/DPO ni el numero de tokens de entrenamiento.

La innovacion tecnica principal es la decodificacion latente que permite inferencia a resolucion nativa (hasta 100 MP) sin entrenamiento a alta resolucion, con opciones de memoria para imagenes de decenas de megapixeles mediante `selection_impl="stream"` y `chunk_tokens=32768`.

## Capacidades

- Estimacion de profundidad relativa densa a partir de imagenes RGB (HxWx3 uint8) con salida HxW float32.
- Inferencia a resolucion nativa de la imagen, hasta 100 megapixeles, sin datos de alta resolucion en entrenamiento.
- Redimensionado configurable del lado corto (768 px por defecto, otro valor o `None` para resolucion nativa).
- Procesamiento por streaming para imagenes de gran tamano con control del pico de memoria GPU.
- Separacion de primer plano fino (follaje, ramas) respecto al fondo en fotografias del mundo real (variante zero-shot).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision.

## Casos de uso

- Reconstruccion 3D y fotogrametria: el modelo genera mapas de profundidad relativa densos a resolucion nativa que pueden alimentar pipelines de estructura desde movimiento (SfM) o multi-view stereo, aprovechando que la variante zero-shot generaliza a escenas no vistas.
- Edicion fotografica y efecto bokeh: la profundidad relativa por pixel permite segmentar primer plano y fondo para desenfoque selectivo, incluso en imagenes de decenas de megapixeles gracias a la inferencia a resolucion nativa.
- Robotica y navegacion: la estimacion de profundidad monocular a partir de una sola camara RGB sirve como senal auxiliar para evitacion de obstaculos y planificacion de trayectorias en robots con recursos limitados de sensores.
- Realidad aumentada: la profundidad relativa permite ocluir objetos virtuales tras elementos reales de la escena, con la ventaja de funcionar en imagenes de alta resolucion de camaras moviles.
- Analisis de escenas de interior y conduccion: la variante mixed, entrenada con NYUv2, KITTI y DIODE, ofrece mejores resultados en dominios de interior y exterior de conduccion, util para segmentacion semantica asistida o analisis de escenas.
- Procesamiento de imagenes satelitales o aereas de gran formato: la capacidad de procesar hasta 100 MP con opciones de streaming permite generar mapas de elevacion relativa a partir de ortofotos de alta resolucion.
- Generacion de datos de entrenamiento: los mapas de profundidad pueden usarse como pseudoetiquetas para entrenar modelos de profundidad mas ligeros o para aumentar datasets de vision.

## Benchmarks y rendimiento

Profundidad relativa, AbsRel (%, menor es mejor) / delta1 (%, mayor es mejor); lado corto 768, TTA con flip horizontal y ajuste de escala y desplazamiento por imagen a la verdad de referencia.

| Modelo | NYUv2 | KITTI | ETH3D | DIODE |
|---|---|---|---|---|
| `l-dpt_large_depth_zeroshot.pth` | 3.55 / 98.30 | 5.98 / 97.85 | 3.75 / 99.01 | 19.34 / 85.65 |
| `l-dpt_large_depth_mixed.pth` | 2.89 / 99.08 | 5.39 / 98.38 | 3.57 / 98.94 | 14.98 / 88.17 |

NYUv2, KITTI y DIODE son zero-shot para el modelo zero-shot y en dominio para el mixed. No se han publicado en la informacion disponible comparaciones con otros modelos de profundidad.

## Requisitos de hardware

- El codificador ViT-7B domina el coste: 13,5 GiB de VRAM solo para sus pesos.
- Pico de memoria GPU con opciones de streaming (bf16): 15 GiB a 2 MP, 19 GiB a 8 MP, 24 GiB a 32 MP y 43 GiB a 100 MP.
- Una NVIDIA GB200 tarda aproximadamente 5 minutos en procesar una imagen de 100 MP.
- El tiempo de inferencia crece aproximadamente con el cuadrado del numero de pixeles.
- GPU recomendadas: NVIDIA GB200 para imagenes de gran formato; para resoluciones moderadas se requiere una GPU con al menos ~16 GiB de VRAM (por ejemplo A100 40 GB, H100 o RTX 4090 de 24 GB) por el peso del codificador.
- No cabe en GPUs de consumo con menos de 16 GiB de VRAM.
- Despliegue mediante el paquete `ldpt` del release de codigo (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision).
- Latencia y throughput: no disponibles salvo el dato de ~5 minutos por imagen de 100 MP en GB200.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos de estimacion de profundidad (por ejemplo Depth Anything, MiDaS o Metric3D), por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| L-DPT (este modelo) | 271M decodificador + ViT-7B congelado | hasta 100 MP a resolucion nativa | tbd (codificador DINOv3 License) | Hugging Face (solo decodificador) |
| Alternativas de profundidad monocular | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo produce profundidad relativa: no hay escala metrica ni intrinsecos de camara; para uso metrico debe ajustarse una escala y un desplazamiento por imagen.
- El codificador de 7B domina el coste computacional y de memoria (13,5 GiB solo en pesos) y el tiempo crece con el cuadrado del numero de pixeles.
- Entrenado con datos sinteticos y multivista (mas tres conjuntos reales en la variante mixed): puede fallar en regiones reflectantes, transparentes, cielo y estadisticas de imagen inusuales.
- La licencia esta por anunciar ("tbd"), lo que impide confirmar condiciones de uso comercial; el codificador DINOv3 se rige por la DINOv3 License de Meta, con posibles restricciones adicionales.
- El repositorio no incluye el codificador: es necesario descargarlo por separado (fichero original de Meta o repo gated en Hugging Face).
- El codigo y la demo estan anunciados como "coming"; la API `ldpt` puede no estar disponible publicamente en el momento de la consulta.
- Riesgo de alucinacion no aplicable en el sentido de lenguaje, pero si de artefactos en la prediccion de profundidad en escenas fuera de distribucion.
- No dispone de capacidades de texto, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pointcept-bot/L-DPT
- Pagina del proyecto: https://xywu.me/l-dpt
- Codificador DINOv3 ViT-7B/16 (gated): https://huggingface.co/facebook/dinov3-vit7b16-pretrain-lvd1689m
- Articulo: Wu, Lao, Wang, Yang, Zhang, Zhao, "Scaling Dense Prediction with Latent Decoding", ECCV 2026 (referencia bibtex en la model card; sin URL de paper en la informacion disponible)
- Codigo y demo: anunciados como "coming" en la model card, sin URL disponible
