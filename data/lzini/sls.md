# lzini/SLS

## Resumen
SLS (A Scalable Vector Graphics Latent Space) es un autoencoder Transformer desarrollado por Leonardo Zini, Elia Frigieri y Lorenzo Baraldi para representar trayectorias SVG en un espacio latente. Convierte cada path en un vector de 1024 dimensiones y lo decodifica de vuelta a geometría simbólica y estilo, en lugar de trabajar con píxeles.

El modelo tiene 135.774.656 parámetros, 8 capas de encoder, 8 capas de decoder, 8 cabezas de atención y un vocabulario de 448 tokens. Está orientado a investigación y pipelines de visión por computador sobre gráficos vectoriales; no es un modelo de lenguaje ni un generador de texto.

Su relevancia está en que propone una representación latente específica para SVG, un formato ubicuo en diseño e interfaces, con licencia Apache-2.0 y pesos en safetensors. La información publicada no incluye resultados de benchmarks, datos de entrenamiento ni métricas de reconstrucción.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder Transformer para trayectorias SVG, con 8 capas de encoder, 8 capas de decoder y 8 cabezas de atención |
| Parámetros totales | 135.774.656 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como contexto textual; límite documentado de 1024 tokens por trayectoria SVG |
| Tipos de cuantización | no documentados; el release incluye safetensors y no se publican pesos GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible; el modelo opera sobre geometría y estilo SVG, no sobre lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`weights/sls/model.safetensors`); tokenizer en `tokenizer/tokenizer.model` y `tokenizer/tokenizer.vocab` |
| Tamaño del repositorio | 0,6 GB |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento
SLS es un autoencoder Transformer específico para SVG. El encoder procesa la secuencia de tokens de una trayectoria y produce un latente de 1024 dimensiones; el decoder reconstruye geometría simbólica y estilo. La configuración publicada indica 8 capas de encoder, 8 de decoder, 8 cabezas de atención y vocabulario de 448 tokens. Usa last-token pooling (`cls_mode: last`) y latentes sin normalización L2 (`l2norm: false`), por lo que debe preservarse su magnitud al decodificar; para similitud coseno hay que normalizar una copia.

El pipeline de inferencia canonicaliza las formas SVG soportadas a paths sobre un lienzo de 512×512, con coordenadas redondeadas y estilo serializado, y rechaza trayectorias de más de 1024 tokens. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF/DPO. El release incluye pesos, tokenizer, configuración y manifiesto de checksums, pero no optimizer, scheduler, estados RNG, logs ni datasets. La innovación principal es el propio espacio latente para geometría y estilo vectorial, no una arquitectura de lenguaje.

## Capacidades
- Codificar una trayectoria SVG en un vector latente de 1024 dimensiones.
- Decodificar latentes a SVG simbólico con geometría y estilo.
- Reconstruir SVG mediante `inference.py reconstruct`.
- Extraer embeddings para búsqueda, clustering y similitud; para coseno debe normalizarse una copia y conservarse el vector original sin normalizar para decodificar.
- Canonicalizar formas SVG soportadas a paths sobre un lienzo de 512×512, con coordenadas redondeadas y estilo serializado.
- Ejecutar en CPU con `--device cpu` o en CUDA cuando esté disponible.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, audio, visión general, thinking mode ni soporte multilingüe.

## Casos de uso
- Búsqueda de iconos y componentes SVG: codificar cada path en un vector de 1024 dimensiones, indexar los vectores y recuperar los más cercanos por similitud coseno; es adecuado porque representa geometría y estilo, no píxeles.
- Deduplicación y clustering de bibliotecas vectoriales: generar embeddings de trayectorias y agrupar por cercanía para detectar duplicados o familias de estilos en catálogos grandes de iconos.
- Normalización y reconstrucción en pipelines de diseño: usar `reconstruct` para canonicalizar formas a paths 512×512 con coordenadas redondeadas y estilo serializado; encaja en etapas de limpieza previas a renderizado o edición.
- Extracción de características para modelos generativos de SVG: emplear el encoder como extractor de latentes de 1024 dimensiones para condicionar o analizar modelos posteriores; el repositorio de código incluye comandos de entrenamiento y fine-tuning.
- Investigación en representación de gráficos vectoriales: analizar el espacio latente, medir reconstrucción y estudiar la separabilidad de geometría y estilo; el modelo es pequeño (135,8 M de parámetros) y puede ejecutarse en CPU o GPU.
- Curación de datasets SVG: codificar trayectorias, filtrar las que superan 1024 tokens o no se canonicalizan, y clusterizar para muestrear diversidad; reduce trabajo manual en datasets de iconos.
- Control de calidad de SVG generados: decodificar latentes y validar que el SVG/XML resultante sea parseable y geométricamente válido; la model card advierte de que las rutas predichas pueden requerir validación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. Tampoco se incluyen métricas de reconstrucción, similitud, MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware
- VRAM estimada solo para pesos: FP32 ≈ 0,54 GB; FP16/BF16 ≈ 0,27 GB; INT8 ≈ 0,14 GB; INT4 ≈ 0,07 GB. Hay que sumar activaciones, tokenizer, runtime de PyTorch y contexto CUDA; no hay mediciones oficiales.
- GPU recomendadas: no hay requisitos oficiales. Por el tamaño de 135,8 M de parámetros, una GPU consumer con 4-8 GB (GTX 1650, RTX 3050, RTX 4060, etc.) debería ser suficiente para inferencia en FP32 con margen; para lotes grandes o entrenamiento se recomienda 8-16 GB o más.
- Cabe en GPU consumer: sí, por el número de parámetros; la VRAM real depende de la implementación, del tamaño de lote y de las activaciones.
- Despliegue: repositorio oficial `aimagelab/svg_latent_space` con PyTorch; `inference.py` para `reconstruct`, `encode` y `decode`; CPU con `--device cpu` o CUDA. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares
No se dispone de información sobre dos o tres alternativas concretas de autoencoders para SVG en la información proporcionada. Para evitar inventar cifras, se indica no disponible.

| Criterio | SLS | Alternativa 1 | Alternativa 2 |
|---|---|---|---|
| Parámetros | 135.774.656 | no disponible | no disponible |
| Límite de entrada | 1024 tokens por trayectoria SVG | no disponible | no disponible |
| Rendimiento | no disponible | no disponible | no disponible |
| Licencia | Apache-2.0 | no disponible | no disponible |
| Disponibilidad | HuggingFace: `lzini/SLS` | no disponible | no disponible |

## Limitaciones y advertencias
- No se documentan sesgos conocidos; el dataset de entrenamiento no se publica, por lo que no se puede auditar su composición.
- Riesgo de salidas inválidas: el decoder predice SVG/XML que puede requerir validación; no es alucinación textual, pero puede producir geometría o estilo no conformes.
- Límite de 1024 tokens por trayectoria; se rechazan entradas mayores. No es una ventana de contexto textual.
- CSS arbitrario y transformaciones anidadas no están totalmente soportados; la canonicalización cubre formas SVG soportadas.
- Idiomas: no disponible; el modelo no procesa lenguaje natural, sino SVG.
- Licencia Apache-2.0: permite uso comercial con obligaciones de aviso, licencia y disclaimer; no hay restricciones adicionales documentadas.
- En producción se requiere clonar el repositorio, usar Python 3.11, instalar dependencias y exportar `SLS_ASSETS_DIR` antes de usar la configuración por defecto; el modelo no está disponible como pipeline de HuggingFace.
- No hay benchmarks ni métricas de reconstrucción publicadas; la calidad real debe evaluarse en el dominio de destino.
- Para decodificar debe conservarse la magnitud del latente; para similitud coseno debe normalizarse solo una copia.

## Enlaces
- https://huggingface.co/lzini/SLS
- https://arxiv.org/abs/2608.21893
- https://github.com/aimagelab/svg_latent_space
- https://aimagelab.github.io/svg_latent_space/
