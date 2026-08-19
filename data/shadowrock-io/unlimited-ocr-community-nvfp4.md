# shadowrock-io/Unlimited-OCR-Community-NVFP4

## Resumen

Unlimited-OCR-Community-NVFP4 es una cuantizacion no oficial del modelo baidu/Unlimited-OCR, desarrollada por ShadowRock (Matt Busi) y publicada bajo licencia MIT. El modelo base, creado por Baidu, es un sistema de OCR de documentos con arquitectura MoE estilo DeepSeek-V2 de 3,34 mil millones de parametros, capaz de procesar documentos completos en una sola pasada y devolver texto con coordenadas de caja (grounding). Esta variante reduce el checkpoint de 6,7 GB a aproximadamente 2,8 GB mediante cuantizacion NVFP4 de 4 bits, calibrada con GPTQ a traves del decoder MoE usando un corpus de documentos OCR (facturas, tablas, pasajes multilingues).

La relevancia de este modelo radica en que permite ejecutar un OCR de nivel industrial en GPUs Blackwell con memoria limitada, como la serie RTX 50 o Jetson Thor, manteniendo una fidelidad casi identica al original en BF16 (error CER medio de 0,0068 frente al baseline). A diferencia de builds comunitarias anteriores sin calibracion, que degeneraban en generacion repetitiva, esta version calibrada corrige los pesos de los expertos con estadisticas de activacion reales. El modelo es multilingue, soporta entrada de imagenes y texto, y se integra con vLLM, Transformers y SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE estilo DeepSeek-V2 con vision tower SAM-ViT-B + CLIP-L DeepEncoder |
| Parametros totales | 3.336.106.240 (3,34 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, GPTQ-calibrada), FP8-Dynamic (companion) |
| Idiomas soportados | multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo base baidu/Unlimited-OCR emplea una arquitectura MoE (mixture-of-experts) inspirada en DeepSeek-V2, con 768 expertos enrutados en el decoder de texto. La vision tower combina un SAM-ViT-B y un CLIP-L DeepEncoder, junto con un proyector, para procesar imagenes de documentos. En esta cuantizacion, solo los linears del decoder MoE (2196 modulos) se convierten a NVFP4 mediante GPTQ con llm-compressor, usando 32 secuencias de calibracion de hasta 2048 tokens de longitud y hessianos offloaded. Se mantienen en BF16 la vision tower, el proyector, las capas embed_tokens y lm_head, los router gates y todas las normas.

Un aspecto tecnico destacable es el tratamiento de los expertos inactivos: tres de los 768 expertos enrutados no se activaron con el corpus de calibracion, por lo que sus pesos se cuantizaron sin datos (data-free) a partir del checkpoint BF16 original y sus escalas de activacion se derivaron de estadisticas de expertos hermanos. El script de reparacion correspondiente se incluye en el repositorio fuente. La calibracion con corpus OCR real (documentos markdown, tablas, facturas, pasajes multilingues) permite que los pesos de los expertos compensen los errores frente a estadisticas de activacion realistas, evitando la degeneracion observada en builds previas sin calibracion.

## Capacidades

- OCR de documentos con grounding: devuelve texto junto con coordenadas de caja para cada elemento detectado, usando el prompt `<image>\n<|grounding|>OCR this image.`
- Parsing de documentos complejos: facturas, memorandos, informes con tablas, en formato markdown estructurado.
- Procesamiento de documentos multilingues, gracias al entrenamiento del modelo base en multiples idiomas.
- Generacion de texto a partir de imagenes (image-text-to-text) con soporte de prompts mixtos.
- Ejecucion nativa con vLLM (incluido backend Marlin NVFP4 MoE), Transformers con trust_remote_code, y SGLang.
- Compatible con cuantizacion NVFP4 para ejecucion FP4 nativa en hardware Blackwell.
- Capacidad de procesamiento de documentos largos en una sola pasada (one-shot long-horizon parsing), segun la documentacion del modelo base.

## Casos de uso

- Digitalizacion de documentos con coordenadas: el modelo puede extraer texto y posiciones de caja de facturas, contratos o formularios, lo que permite reconstruir la estructura original del documento en formato digital (por ejemplo, para sistemas de gestion documental).
- Extraccion de tablas e informes: gracias a su capacidad de generar markdown estructurado, es adecuado para convertir tablas de PDFs o imagenes en datos tabulares procesables por pipelines de datos.
- Automatizacion de flujos de facturacion: al procesar facturas con grounding, se puede integrar en sistemas de contabilidad para extraer campos clave (importes, fechas, proveedores) sin intervencion manual.
- OCR en entornos con memoria limitada: con un checkpoint de 2,8 GB, cabe en GPUs de consumo como RTX 5070 Ti (12-16 GB VRAM) o en dispositivos edge como Jetson Thor, habilitando OCR local en kioscos o escaneres.
- Procesamiento de PDFs multi-pagina: el modelo base esta disenado para parsear documentos completos en una sola pasada, lo que lo hace util para digitalizar expedientes o libros escaneados con coherencia contextual.
- Asistencia a personas con discapacidad visual: la combinacion de OCR con grounding permite generar descripciones estructuradas de documentos que pueden ser leidas por lectores de pantalla, manteniendo el orden logico de la informacion.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor del modelo se basan en un conjunto de fixtures sinteticos de documentos (factura, memo, informe con tabla) comparando la salida greedy con el baseline BF16 tras eliminar las etiquetas de grounding. La tabla siguiente resume los datos publicados:

| Metrica | Valor |
|---|---|
| CER medio vs BF16 (greedy, grounding prompt) | 0,0068 |
| CER maximo por fixture vs BF16 | 0,0204 |
| Decode throughput (tok/s, vLLM 0.26.0, RTX 5070 Ti) | 40,84 |

| Comparativa | BF16 | Data-free NVFP4 (comunitario) | Este repo (calibrado) |
|---|---|---|---|
| CER medio vs BF16 | — | 4,27 | 0,0068 |
| CER por fixture (factura / memo / tabla) | — | inestable | 0,0 / 0,0 / 0,02 |
| Decode throughput (tok/s, greedy) | 45,3 | 64,2 | 40,8 |
| Tamano del checkpoint | 6,7 GB | 2,8 GB | 2,8 GB |

Nota: el throughput de 64,2 tok/s del build data-free refleja generacion degenerada (repeticion hasta el limite de tokens o EOS inmediato), no velocidad util. Dos de los tres fixtures del build calibrado son identicos al BF16 incluyendo coordenadas de caja; el tercero difiere en un unico tramo corto.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint NVFP4 ocupa aproximadamente 2,8 GB en disco; la VRAM total necesaria dependera del contexto y de la vision tower, pero es adecuado para GPUs con 8 GB o mas.
- GPU recomendadas: RTX 50-series (Blackwell), Jetson Thor, B200; compatible con Ada/Hopper mediante backend Marlin NVFP4 MoE de vLLM.
- Cabe en GPUs de consumo: si, por ejemplo RTX 5070 Ti (16 GB) o RTX 4060 (8 GB) pueden ejecutarlo.
- Opciones de despliegue: vLLM (recomendado, backend Marlin NVFP4), Transformers con trust_remote_code (puede requerir TORCH_COMPILE_DISABLE=1), SGLang.
- Latencia y throughput: 40,84 tok/s medidos en RTX 5070 Ti con vLLM 0.26.0; el modelo BF16 alcanza 45,3 tok/s en el mismo hardware, por lo que la penalizacion de la cuantizacion es de aproximadamente un 10% en velocidad de decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento OCR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baidu/Unlimited-OCR (BF16) | 3,34 B | no disponible | Referencia (CER 0) | MIT | HuggingFace |
| shadowrock-io/Unlimited-OCR-Community-NVFP4 (este) | 3,34 B | no disponible | CER 0,0068 vs BF16 | MIT | HuggingFace |
| shadowrock-io/Unlimited-OCR-Community-FP8-Dynamic | 3,34 B | no disponible | no disponible (companion, near-lossless) | MIT | HuggingFace |
| Builds comunitarios data-free NVFP4 | 3,34 B | no disponible | CER 4,27 (degenerado) | MIT | HuggingFace |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros OCR de tamano similar en la informacion proporcionada. La ventaja principal de esta build es su calibracion GPTQ, que evita la degeneracion de las versiones data-free y mantiene una fidelidad muy alta al BF16 con un tercio del tamano.

## Limitaciones y advertencias

- Cuantizacion no oficial: no es un release de Baidu; el autor advierte que solo cambia la precision numerica del decoder, y que todo el credito del modelo base corresponde a Baidu.
- Tres de los 768 expertos no se activaron durante la calibracion y se cuantizaron sin datos, lo que podria afectar a documentos muy diferentes del corpus de calibracion.
- El uso con Transformers puede requerir la variable de entorno TORCH_COMPILE_DISABLE=1 para cargas correctas de NVFP4.
- El throughput de decodificacion es ligeramente inferior al BF16 (40,8 vs 45,3 tok/s), aunque el ahorro de memoria es sustancial.
- No se documentan sesgos especificos del modelo base; como cualquier sistema OCR, puede presentar errores de alucinacion en textos ambiguos o de baja calidad, especialmente en idiomas poco representados.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias de soporte ni de rendimiento en produccion.
- La longitud de contexto no esta publicada, por lo que no se puede garantizar el comportamiento con documentos extremadamente largos mas alla de lo declarado por el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shadowrock-io/Unlimited-OCR-Community-NVFP4
- Modelo base (Baidu): https://huggingface.co/baidu/Unlimited-OCR
- Build companion FP8-Dynamic: https://huggingface.co/shadowrock-io/Unlimited-OCR-Community-FP8-Dynamic
- Repositorio fuente de cuantizacion: https://git.srk.rest/shadowrock/uocr-quant
- Evidencias de evaluacion: https://huggingface.co/shadowrock-io/Unlimited-OCR-Community-NVFP4/tree/main/evidence
- Repositorio del modelo base en GitHub: https://github.com/DorianGallo/unlimted-OCR
- Repositorio alternativo del modelo base: https://github.com/renenovillo/unlimited-ocr
- Guia de ejecucion local con vLLM y SGLang: https://codersera.com/blog/run-baidu-unlimited-ocr-locally-2026/
- Paper del modelo base (arXiv, disponible desde 2026/06/23): no se proporciona URL directa en los resultados de busqueda
