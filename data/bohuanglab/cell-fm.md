# BoHuangLab/CELL-FM

## Resumen

CELL-FM es una colección de pesos de modelos generativos para biología celular y microscopía, publicada por el laboratorio BoHuangLab bajo licencia MIT. No es un modelo de lenguaje: se trata de un conjunto de generadores basados en flow matching que trabajan sobre secuencias de proteínas e imágenes de microscopía de fluorescencia, acompañados de autoencoders variacionales (VAE) de imagen, clasificadores/embeddings ViT y ficheros de anclaje con las células y núcleos de referencia con los que se condiciona cada generación. El repositorio ocupa 12,5 GB e incluye checkpoints para tres dominios distintos: CondenSeq (condensados, 160x160), HPA (tinción virtual y análisis de señales, 256x256 y 512x512) y OpenCell (tinción virtual, 256x256).

El componente central es un encoder de secuencia de proteínas ESM-C de 600 M de parámetros que se incorpora dentro de los generadores `seq2img` (secuencia a imagen) e `img2seq` (imagen a secuencia). A partir de una secuencia de aminoácidos y de una imagen de referencia del núcleo o de la célula, el modelo predice el patrón de localización subcelular de una proteína, genera una imagen de tinción virtual o clasifica/embebe imágenes celulares. El repositorio también incluye utilidades para cribado de señales de localización nuclear (NLS) y de exportación (NES), con un proteoma de referencia de 12.894 proteínas y 7.940.784 residuos.

La relevancia actual reside en que estos pesos permiten reproducir pipelines concretos de biología computacional sin reentrenar: el autor documenta explícitamente los hiperparámetros de cada par generador-VAE y los ficheros de anclaje exactos usados en las ejecuciones publicadas. Como contrapartida, el repositorio no aporta métricas de rendimiento, no declara volúmenes de datos de entrenamiento ni cómputo, y arrastra acoplamientos estrictos entre componentes (cada generador debe cargarse con el VAE con el que fue entrenado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generativa por flow matching condicionada, con encoder de secuencia de proteinas ESM-C (600 M), VAE de imagen y ViT de clasificacion/embedding; no es un transformer autorregresivo de texto |
| Parametros totales | No disponible (solo se declara el encoder ESM-C de 600 M; el recuento del resto de componentes no se publica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagenes y secuencias de proteinas); ninguna ventana de contexto declarada |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en formato binario propio sin variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); no disponible |
| Licencia | MIT |
| Formato de pesos | `.bin` (checkpoints propios cargados mediante la libreria `cell-fm`), `.npy` / `.npz` (tensores de anclaje y mascaras booleanas), `.csv` / `.json` (metadatos, recuentos y referencias) |
| Tamano del repositorio | 12,5 GB |
| Resoluciones soportadas | 160x160 (CondenSeq), 256x256 (HPA y OpenCell) y 512x512 (HPA img2seq) |
| Libreria de carga | `cell-fm` |

## Arquitectura y entrenamiento

La familia se organiza en pares generador-VAE. En CondenSeq, el generador `cellfm_seq2img.bin` convierte una secuencia de proteína en una imagen condicionada al canal DAPI de referencia, con un VAE de 160x160, 3 bloques de bajada y 4 canales latentes, y un clasificador ViT de dos canales (160x160) que distingue fenotipo condensado de difuso. En HPA, el generador `cellfm_seq2img.bin` produce tinción virtual a 256x256 con condicionamiento de tres canales, mientras que `cellfm_img2seq.bin` realiza el camino inverso a 512x512 con `sample_size` 128, `encoder_patch_size` 8, `img_generator_patch_size` 4 y 8 cabezas de atención. En OpenCell, `cellfm_vs.bin` está afinado para 256x256 con un único canal de condicionamiento (`nucl`), `sample_size` 64, `encoder_patch_size` 4, `img_generator_patch_size` 2 y 18 cabezas de atención.

Los clasificadores ViT son los únicos componentes con arquitectura detallada: el de HPA tiene 12 capas, 512 dimensiones ocultas, 2048 en la MLP, 8 cabezas, parche de 4 y entrada de 256x256 con cuatro canales (proteína, núcleo, retículo endoplasmático y microtúbulos), entrenado para identificar la proteína presente en la imagen sobre 13.908 clases; el embedding, no la predicción, es la representación útil. La versión de OpenCell comparte backbone pero su `conv_proj` toma dos canales (proteína y núcleo) y está afinada sobre 1.311 clases, por lo que ambos ViT no son intercambiables. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO (fases no aplicables a este tipo de modelo); tampoco se publican detalles de cómputo o duración del entrenamiento. El autor sí documenta que los hiperparámetros de CondenSeq se fijan en `pipeline.py` del Space y replican `scripts/cell_fm_cs/evaluate_seq2img.sh` y `scripts/vit_cls_condenseq_img/pretrain.sh`, los de HPA en `notebooks/nls_screening.ipynb` (espejo de `scripts/cell_fm/evaluate_virtual_staining_hpa_dict.sh`) y los de OpenCell en `notebooks/opencell_vs.ipynb`.

## Capacidades

- Generación de secuencia a imagen (seq2img) en el dominio CondenSeq a 160x160, condicionada al canal DAPI de referencia (`condenseq/reference_nucleus.npy`, proteína índice 12626, imagen 0).
- Tinción virtual (virtual staining) para HPA a 256x256 con condicionamiento de tres canales, a partir de una célula de referencia fija.
- Tinción virtual para OpenCell a 256x256 con un único canal de condicionamiento nuclear, sobre la célula anclada del gen ATG7 (`CID001813_FID00035838_proj_11`).
- Generación de imagen a secuencia (img2seq) para HPA a 512x512, con condicionamiento de tres canales.
- Clasificación binaria de fenotipo condensado frente a difuso mediante `condenseq/vit_cls.bin` (entrada de 2 canales a 160x160).
- Extracción de embeddings de imagen con el ViT de HPA (13.908 clases, 4 canales de entrada) y con el ViT de OpenCell (1.311 clases, 2 canales de entrada).
- Cribado de señales de localización: el repositorio incluye referencias para 320 señales NLS y 320 señales NES (20 réplicas independientes en cada una de 16 longitudes de cola, de 10 a 25 aminoácidos) y anclajes específicos para señales nucleares (gen PPM1G, nucleoplasma) y de exportación (gen DIAPH1, citosol y membrana plasmática).
- Análisis de frecuencia de aminoácidos frente al proteoma de referencia de HPA (residuos contados sobre 12.894 proteínas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Predicción de localización subcelular desde secuencia: dado un gen o una proteína candidata, el generador seq2img de HPA produce una imagen de tinción virtual a 256x256 que un investigador puede comparar con patrones conocidos (nucleoplasma, citosol, membrana plasmática) antes de lanzar un experimento húmedo.
- Tinción virtual para reducción de costes: sustituir parte de las adquisiciones de microscopía de fluorescencia por imágenes generadas a partir de la secuencia y del canal nuclear, útil en cribados de alto rendimiento donde los anticuerpos son el cuello de botella económico.
- Cribado de señales NLS/NES en diseño de proteínas: el flujo documentado en `notebooks/nls_screening.ipynb`, con anclajes de 512x512 y las 320 referencias publicadas, permite evaluar colas de 10 a 25 aminoácidos y comparar la frecuencia de residuos contra el proteoma de 7.940.784 residuos.
- Anotación de imágenes a escala mediante embeddings: el ViT de HPA (13.908 clases) o el de OpenCell (1.311 clases) generan representaciones de imagen que sirven para agrupar, recuperar o etiquetar crops de microscopía sin reentrenar un clasificador desde cero.
- Identificación de proteína a partir de imagen: el modelo img2seq de HPA a 512x512 invierte el flujo habitual y propone secuencias candidatas para un patrón de tinción observado, útil como paso de priorización en pipelines de validación.
- Análisis de formación de condensados: `condenseq/vit_cls.bin` clasifica si una imagen de 160x160 muestra fenotipo condensado o difuso, aplicable a estudios de separación de fases líquido-líquido y a cribados de mutaciones que alteran la agregación.
- Generación de datos sintéticos para aumento de dataset: producir pares (secuencia, imagen) condicionados a núcleos de referencia reales para preentrenar o aumentar modelos downstream de visión en microscopía.
- Replicación de resultados publicados: los ficheros `.npy`/`.npz` de anclaje corresponden bit a bit a las ejecuciones offline publicadas, lo que permite reproducir exactamente las generaciones de referencia y usarlas como línea base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe exclusivamente el inventario de checkpoints, los hiperparámetros de inferencia y los artefactos de anclaje; no incluye métricas como FID, SSIM, PSNR, precisión de clasificación o comparaciones cuantitativas con otros modelos. Los únicos elementos con valor evaluativo son los conjuntos de referencia incluidos: `hpa/pls_reference_nls.csv` y `hpa/pls_reference_nes.csv` (320 señales cada uno), `opencell/vs_reference_cells.npz` (cuatro proteínas en dos pares emparejados: POLR1A/SNRPF nucleares y LSM14A/DDX6 de cuerpo P) y `hpa/proteome_aa_counts.json` como base de comparación de frecuencias, pero no se acompaña ningún resultado numérico obtenido con ellos.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Como referencia, el encoder ESM-C de 600 M ocupa aproximadamente 2,4 GB en fp32 y 1,2 GB en fp16, a lo que hay que sumar el VAE y el generador correspondientes; el conjunto de checkpoints del repositorio suma 12,5 GB, aunque no se cargan todos a la vez.
- Las configuraciones más ligeras (CondenSeq a 160x160, tinción virtual a 256x256) deberían caber en GPUs de consumo con 8-12 GB de VRAM. La ruta más pesada documentada es el img2seq de HPA, con resolución de 512x512, `sample_size` 128 y atención de 8 cabezas, que previsiblemente requiere una GPU de 16-24 GB.
- GPU recomendadas (estimación, no verificada): NVIDIA RTX 3090, RTX 4090 o A5000 con 24 GB para los flujos de 256 y 512 píxeles; A100 o H100 de 40-80 GB para procesar lotes grandes o ejecutar varios generadores y VAEs en paralelo.
- Despliegue: la carga se realiza con la librería propia `cell-fm`, no con runtimes de LLM. vLLM, llama.cpp, Ollama y TGI no son aplicables. El autor referencia un Space cuyo `pipeline.py` fija los hiperparámetros de CondenSeq, además de notebooks (`nls_screening.ipynb`, `opencell_vs.ipynb`) y scripts de shell para cada flujo de evaluación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye resultados comparativos ni referencias a modelos alternativos de la misma categoría, y no se han facilitado datos de benchmarks que permitan establecer una comparación cuantitativa con otros generadores de tinción virtual o modelos de localización de proteínas.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: sin FID, SSIM, PSNR ni precisión de clasificación, no es posible estimar la calidad real de las generaciones ni comparar con alternativas.
- Trazabilidad comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa conocida.
- Acoplamiento estricto entre componentes: cada generador debe cargarse con el VAE exacto con el que se entrenó. Emparejar `cellfm_img2seq.bin` con el VAE de 256 píxeles produce un desajuste de tamaño latente.
- Canales de entrada fijos: el `conv_proj` del ViT determina el número de canales (cuatro en HPA, dos en OpenCell), de modo que los ViT de ambos dominios no son intercambiables aunque compartan backbone. Aunque `hpa/vae.bin` y `opencell/vae.bin` tengan la misma forma, el segundo está afinado para OpenCell y no es equivalente.
- Los ficheros de anclaje están ligados a crops y genes concretos (índice 12626 del proteoma CondenSeq, ATG7 en OpenCell, H3C13 y PPM1G/DIAPH1 en HPA); cambiar de referencia invalida la reproducibilidad bit a bit declarada.
- Riesgo de resultados biológicamente plausibles pero incorrectos: la tinción virtual y la predicción de localización son inferencias generativas, no mediciones. Cualquier uso debe validarse experimentalmente antes de extraer conclusiones biológicas.
- Sesgos de dominio: los datos de entrenamiento no se documentan, pero los checkpoints están atados a los proteomas de HPA (12.894 proteínas) y OpenCell (1.311 genes), por lo que el comportamiento fuera de esos catálogos, tipos celulares o condiciones de imagen es desconocido.
- Licencia MIT sobre los pesos, pero sin información sobre las condiciones de uso de las imágenes y anotaciones de origen (HPA, OpenCell) que subyacen al entrenamiento; conviene revisar las licencias de las fuentes originales antes de un uso comercial.
- Formatos propietarios: los `.bin` requieren el cargador de la librería `cell-fm`; no hay variantes GGUF, safetensors ni ONNX que faciliten la integración con herramientas estándar.
- Sin soporte de idiomas, tool calling ni agentes: cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BoHuangLab/CELL-FM
- Repositorio CELL-FM citado en la model card (`scripts/`, `scripts_local/`, `notebooks/`): URL no disponible
- Space con `pipeline.py` para hiperparámetros de CondenSeq: URL no disponible
- Artículo o paper asociado: no disponible
- Demos adicionales: no disponibles
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron únicamente páginas de inicio de sesión de servicios de correo, sin relación con el modelo.
