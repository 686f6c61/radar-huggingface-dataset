# HeOCR/heocr-modern-measured

## Resumen

HeOCR modern MEASURED v1.0 es un modelo de reconocimiento optico de caracteres (OCR) para hebreo moderno impreso, distribuido como fichero `traineddata` de Tesseract. Lo publica el proyecto HeOCR y es un ajuste fino (fine-tune) corto del modelo Rivok Tesseract Full (`Rivok/tesseract-heb-rivok`), del que hereda la arquitectura LSTM de Tesseract y el codec sin cambios. No es un transformer ni un modelo de lenguaje: es un reconocedor de lineas entrenado con `lstmtraining` y exportado en int8.

El problema que aborda es la lectura de documentos hebreos modernos impresos capturados con movil o escaneados en plano, un dominio donde los motores OCR genericos rinden mal. Segun la model card, sobre el conjunto abierto de evaluacion P-mod-open v0 (31 paginas, 65 entradas) el modelo obtiene un 14,77 % de CER en la vista filtrada, practicamente identico al 14,80 % de su modelo base, y claramente mejor que el Tesseract estandar (15,74 % en `heb` fast y 15,95 % en `heb` best).

Es relevante ahora porque documenta con rigor un resultado modesto: el autor declara explicitamente que el modelo empata con su base y que no supera el umbral de mejora registrado, ademas de senalar que los modelos vision-language generales (Claude Haiku 5.5, Gemini 3.8 Flash) leen estos documentos bastante mejor que cualquier motor OCR. La ficha es, por tanto, un ejemplo de evaluacion pre-registrada y de control de contaminacion mas que un salto de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tesseract LSTM (reconocedor de lineas), exportado int8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (OCR por lineas, sin ventana de contexto) |
| Tipos de cuantizacion | int8 (unico formato publicado) |
| Idiomas soportados | hebreo (he), exclusivamente hebreo moderno impreso |
| Licencia | Apache-2.0 |
| Formato de pesos | `modern_measured.traineddata` (Tesseract), sha256 `17b957f3998d334efda3208bdd49e334e7c4d4da760291e73fec7b013d5ca680` |

## Arquitectura y entrenamiento

El modelo es un reconocedor LSTM de Tesseract, no un transformer. Se parte del modelo base Rivok Full en coma flotante (`heb_rivok`, sha256 `673a4193…`, Apache-2.0) manteniendo su codec intacto, y se ajusta con `lstmtraining` a una tasa de aprendizaje de 1e-5 durante 1.000 visitas de linea. El resultado se exporta a int8. El corte de 1k forma parte de una rejilla pre-registrada (500 / 1k / 2k / 3k / 5k visitas) seleccionada sobre un conjunto de desarrollo antes de la unica ejecucion sobre el conjunto reservado.

Los datos de entrenamiento son exclusivamente de la particion TRAIN: 400 recortes de linea de Phone A y 300 de Phone B procedentes de las capturas moviles HeOCR TRN-PHPACK1 (CC0 1.0), fotografias de un paquete de 60 paginas impresas, mas 300 lineas corregidas de Rivok v2 lines (CC BY-SA 4.0) como replay. No se usaron datos sinteticos ni documentos privados. El control de contaminacion se hizo mediante una comprobacion de coincidencia exacta de pixeles de las lineas de entrenamiento contra cada pagina y captura del conjunto reservado, con 0 coincidencias (recibo #1872, conjunto TRAIN CLEAN #1852).

## Capacidades

- Reconocimiento OCR de texto hebreo moderno impreso, en documentos escaneados en plano y en PDF generados con movil.
- Deteccion y transcripcion de lineas de texto sobre paginas completas mediante el motor Tesseract (`--oem 1 --psm 3`).
- Salida de texto plano con normalizacion `line_fold_v1` para el calculo de CER.
- Funciona como sustituto directo de un modelo `traineddata` de Tesseract, sin cambios en el pipeline de invocacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No tiene capacidades multimodales mas alla de la imagen de entrada: no procesa audio ni video.
- Cobertura multilingue limitada al hebreo; no reconoce otros idiomas.

## Casos de uso

- Digitalizacion de archivos historicos recientes y publicaciones periodicas hebreas: el modelo esta entrenado y evaluado sobre paginas de archivo, paginas de revistas y renders de editorial, por lo que encaja en pipelines de digitalizacion masiva de fondos impresos modernos.
- Procesamiento de PDF generados con movil: al incluir capturas de telefono en el entrenamiento, es adecuado para extraer texto de documentos fotografiados con el movil en lugar de escaneados con flatbed.
- Integracion en flujos existentes de Tesseract: al ser un `traineddata` compatible, se puede sustituir el modelo `heb` estandar por este fichero sin reescribir el codigo de invocacion, lo que reduce el coste de adopcion.
- Indexacion y busqueda full-text de corpus hebreos: el texto extraido puede alimentar motores de busqueda o sistemas de recuperacion documental, con la ventaja de una CER inferior a la del Tesseract estandar (14,77 % frente a 15,95 %).
- Preprocesado para pipelines de NLP en hebreo: la transcripcion sirve como entrada a tareas posteriores (clasificacion, extraccion de entidades) cuando no se dispone de un modelo vision-language y se busca un coste computacional bajo en CPU.
- Evaluacion comparativa de motores OCR: el modelo y su conjunto de evaluacion pre-registrado permiten reproducir la comparacion frente a Rivok Full, Rivok Lite, Tesseract stock, PaddleOCR, Kraken y Qwen3-VL, util para equipos que necesiten justificar la eleccion de motor OCR.

## Benchmarks y rendimiento

Evaluacion sobre P-mod-open v0 (31 paginas, 65 entradas, 14 clusters de edicion), CER a nivel de pagina con normalizacion `line_fold_v1`. Vista filtrada: 70.545 caracteres de referencia; todas las lineas: 93.728 caracteres.

| Lector | CER filtrado (%) | CER todas las lineas (%) | WER filtrado (%) |
|---|---:|---:|---:|
| heocr-modern-measured v1.0 | 14,77 | 19,68 | 23,4 |
| Rivok Tesseract Full | 14,80 | 19,71 | 23,4 |
| Rivok Tesseract Lite | 15,44 | 20,37 | 25,7 |
| Tesseract `heb` fast (stock) | 15,74 | 20,88 | 29,8 |
| Tesseract `heb` best (stock) | 15,95 | 21,16 | 30,6 |
| Rivok PaddleOCR | 17,85 | 20,87 | 43,8 |
| Kraken 7.2 (reconocedor generico) | 79,06 | 78,64 | no disponible |
| Qwen3-VL-2B-Instruct, MLX 4-bit | 217,39 | 227,50 | no disponible |

Cambio relativo de CER filtrado respecto a este modelo (cota superior unilateral al 97,5 %): Rivok Full −0,2 % (+0,2 %), empate; Rivok Lite −4,3 % (−1,5 %); Tesseract `heb` fast −6,1 % (−3,2 %); Tesseract `heb` best −7,4 % (−3,0 %); Rivok PaddleOCR −17,2 % (+27,9 %, intervalo amplio). Kraken y Qwen3-VL no estan emparejados. En un subconjunto de 56 entradas no puntuado por este modelo, Claude Haiku 5.5 obtuvo 8,3 % y Gemini 3.8 Flash 12,9 %, frente al 14,0 % de Rivok Full.

## Requisitos de hardware

- Inferencia en CPU: Tesseract con un modelo LSTM int8 no requiere GPU; el coste depende de la resolucion de pagina y del numero de lineas.
- VRAM estimada para GPU: no disponible; el modelo no esta pensado para ejecucion en GPU y la model card no publica requisitos.
- GPU recomendadas: no disponible.
- Cabe en cualquier GPU de consumo, pero no hay datos publicados de rendimiento en GPU; el despliegue tipico es en CPU.
- Opciones de despliegue: binario `tesseract` con `--tessdata-dir` apuntando al repositorio; no hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | CER filtrado (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| heocr-modern-measured v1.0 | Tesseract LSTM int8 | no disponible | no aplica | 14,77 | Apache-2.0 | Hugging Face y Zenodo |
| Rivok Tesseract Full | Tesseract LSTM float | no disponible | no aplica | 14,80 | Apache-2.0 | Hugging Face |
| Tesseract `heb` best (stock) | Tesseract LSTM | no disponible | no aplica | 15,95 | Apache-2.0 | `tessdata_best` |
| Rivok PaddleOCR | PaddleOCR | no disponible | no aplica | 17,85 | no disponible | Hugging Face |
| Qwen3-VL-2B-Instruct (MLX 4-bit) | Vision-language | 2B (nominal) | no disponible | 217,39 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Solo cubre hebreo moderno impreso. El texto con puntuacion vocalica (pointed text), la escritura manuscrita y la impresion antigua quedan fuera de alcance; para impresion antigua el autor remite a HeOCR P-hist MEASURED.
- En fotografias de paginas completas, el ruido a nivel de pagina (cabeceras, margenes, fondo) sigue siendo la principal fuente de error.
- El modelo empata con su base Rivok Full (14,77 % frente a 14,80 % de CER) y no supera el umbral de mejora registrado, que exige una cota superior por debajo de −3 % frente a todos los comparadores.
- La dosis de entrenamiento es pequena (1.000 visitas de linea), por lo que las ganancias sobre el modelo base son marginales.
- Los modelos vision-language generales obtienen mejor CER en estos documentos, lo que cuestiona el uso de OCR clasico en escenarios donde se pueda asumir su coste.
- El modelo no es el predeterminado del paquete `heocr`.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero el OCR puede insertar texto espurio; el CER superior al 100 % de Qwen3-VL en la tabla ilustra ese fenomeno en motores generativos.
- Sesgos conocidos: no documentados en la informacion disponible; el conjunto de evaluacion es limitado (31 paginas, 14 clusters) y puede no representar toda la variabilidad tipografica del hebreo moderno.
- Licencia Apache-2.0, que permite uso comercial; el autor remite a `LICENSE` y `NOTICE` para la atribucion de los datos de entrenamiento (CC0 1.0 y CC BY-SA 4.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HeOCR/heocr-modern-measured
- Version v1.0: https://huggingface.co/HeOCR/heocr-modern-measured/tree/v1.0
- Modelo base: https://huggingface.co/Rivok/tesseract-heb-rivok
- Modelo de impresion antigua: https://huggingface.co/HeOCR/heocr-p-hist-measured
- Dataset de capturas moviles: https://huggingface.co/datasets/HeOCR/trn-phpack1-phone-captures
- Dataset Rivok v2 lines: https://huggingface.co/datasets/Rivok/tesseract-heb-rivok-v2-lines
- Archivo Zenodo: https://doi.org/10.5281/zenodo.24615080
