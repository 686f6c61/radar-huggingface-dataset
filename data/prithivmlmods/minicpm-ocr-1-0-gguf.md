# prithivMLmods/MiniCPM-OCR-1.0-GGUF

## Resumen

MiniCPM-OCR-1.0-GGUF es la distribución en formato GGUF del modelo MiniCPM-OCR 1.0 de OpenBMB, un modelo visión-lenguaje compacto y especializado en OCR y en extracción de información estructurada (KIE) sobre documentos en inglés y chino. Este repositorio concreto lo publica el usuario prithivMLmods y no introduce ningún cambio de pesos: se limita a ofrecer los pesos originales cuantizados para su uso con llama.cpp, Ollama y otras herramientas compatibles con GGUF. La arquitectura combina un codificador visual SigLIP (con compresión 4× de tokens visuales, resolución 448 px y hasta 9 particiones de imagen) con un modelo de lenguaje Qwen3.5, según declara la model card del modelo base.

El modelo está pensado para sustituir pipelines clásicos de OCR en documentos complejos: convierte escaneos, páginas inclinadas o curvadas, manuscritos, fotografías, tablas, fórmulas, gráficos y sellos en Markdown respetando el orden de lectura, o directamente en JSON. Se apoya en el detector de layout PP-DocLayoutV3 y en el SDK `minicpmvocr` para reconocer regiones recortadas de forma concurrente, y se distribuye en cuantizaciones desde Q3_K_M (466 MB) hasta BF16 (1,52 GB), además de un fichero `mmproj` en BF16 de 901 MB para la torre de visión.

Su relevancia ahora es doble: por un lado, la model card del modelo base reporta 93,68 en Real5-OmniDocBench y 54,7 en OCRBench v2, con 1,2 páginas/s en una RTX 5090; por otro, al publicarse en GGUF con licencia Apache-2.0, permite desplegar OCR de calidad en hardware de consumo o en CPU, sin depender de APIs externas. Existe una discrepancia de datos importante: los safetensors del modelo base suman 752.167.744 parámetros, mientras que la model card describe un modelo de 1,3B, presumiblemente contando el codificador visual o el modelo completo con proyección.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje: codificador SigLIP + LLM Qwen3.5, especializada en OCR (según model card del modelo base) |
| Parametros totales | 752.167.744 según safetensors del modelo base; la model card declara 1,3B (discrepancia sin aclarar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0; más AWQ W4A16 y GPTQ W4A16 en el modelo base |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (este repositorio) + `mmproj-bf16.gguf` para la visión; BF16, AWQ y GPTQ en el modelo base |
| Resolucion visual | 448 px de escala, hasta 9 slices, compresión 4× de tokens visuales |
| Pipeline | `image-text-to-text` |
| Modelo base | openbmb/MiniCPM-OCR-1.0 |
| Tamano del repositorio | 7,0 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema de los MiniCPM-V: un codificador visual SigLIP que procesa la imagen en hasta nueve particiones a resolución 448 y comprime los tokens visuales 4×, seguido de una proyección multimodal y de un modelo de lenguaje Qwen3.5 que genera la salida. La model card indica que MiniCPM-OCR 1.0 se entrena sobre MiniCPM-V 4.6, es decir, no parte de cero, sino que hereda el conocimiento visual del modelo generalista y lo especializa en tareas documentales. El pipeline de referencia no es monolítico: PP-DocLayoutV3 detecta y ordena las regiones del documento y el SDK `minicpmvocr` las envía al modelo de forma concurrente, lo que explica parte del rendimiento reportado.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se documenta una innovación de inferencia: un modelo borrador específico, denominado DSpark, para decodificación especulativa, que según el autor incrementa un 55% la eficiencia extremo a extremo y sitúa el throughput en 1,49× el de PaddleOCR-VL-1.6 y 3,62× el de MinerU2.5 Pro. Se indica también soporte de ajuste fino mediante LLaMA-Factory y ms-swift.

## Capacidades

- Reconocimiento de texto en documentos escaneados, páginas inclinadas o curvadas, fotografías y manuscritos.
- Conversión de tablas a HTML y de fórmulas matemáticas a LaTeX.
- Interpretación de gráficos y de sellos dentro del documento.
- Salida en Markdown respetando el orden de lectura o en JSON directo para integración en sistemas.
- Extracción estructurada de información clave (KIE), orientada a campos concretos de documentos.
- Procesamiento por regiones con detector de layout externo (PP-DocLayoutV3) y reconocimiento concurrente de recortes.
- Capacidades multilingües limitadas a inglés y chino.
- Decodificación acelerada con el modelo borrador DSpark (decodificación especulativa).
- No se documenta soporte de tool calling, function calling ni de comportamiento agéntico multi-paso.
- No se documentan capacidades de audio ni modo "thinking" explícito.

## Casos de uso

- Digitalización masiva de archivo administrativo: el modelo convierte lotes de PDF escaneados en Markdown con orden de lectura correcto, lo que permite indexar el contenido en un buscador corporativo sin rehacer el escaneo.
- Extracción de campos en facturas y albaranes: con salida JSON directa, se pueden mapear número de factura, fechas, importes y líneas de detalle hacia un ERP o un sistema de contabilidad.
- Conversión de tablas financieras a HTML: útil para ingestar informes anuales y memorias en un data warehouse manteniendo la estructura de filas y columnas en lugar de texto plano.
- Procesamiento de literatura científica: las fórmulas se emiten en LaTeX, de modo que los artículos pueden renderizarse en una web técnica o alimentar un repositorio de referencia sin retipear ecuaciones.
- Automatización de pipelines RAG documental: al devolver Markdown limpio y estructurado, el texto puede trocearse por secciones y embeberse sin las rupturas típicas de un OCR de línea a línea.
- Digitalización de documentación con sellos y firmas: la detección de sellos y regiones permite separar el contenido textual del ruido visual en expedientes notariales o contractuales.
- Despliegue en entorno controlado (on-premise o edge): con cuantización Q4_K_M de 529 MB más el `mmproj`, se puede ejecutar OCR local en equipos sin GPU dedicada, requisito habitual en sectores con datos sensibles.
- Procesamiento por lotes de alta densidad: el rendimiento reportado de 1,2 páginas/s en RTX 5090 permite estimar la capacidad de una cola de digitalización antes de dimensionar infraestructura.

## Benchmarks y rendimiento

Datos reportados en la model card del modelo base (no verificados de forma independiente y no específicos de esta cuantización GGUF):

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | Sin cifra publicada; el autor afirma el mayor promedio equiponderado entre los modelos OCR de código abierto |
| Wild-OmniDocBench | Sin cifra publicada (misma afirmación de promedio) |
| olmOCR-Bench | Sin cifra publicada (misma afirmación de promedio) |

| Métrica de eficiencia | Valor |
|---|---|
| Throughput en RTX 5090 | 1,2 páginas/s |
| Aceleración con modelo borrador DSpark | +55% de eficiencia extremo a extremo |
| Throughput relativo vs. PaddleOCR-VL-1.6 | 1,49× |
| Throughput relativo vs. MinerU2.5 Pro | 3,62× |

No se han publicado resultados de benchmarks específicos para las cuantizaciones Q4/Q5/Q8 de este repositorio, por lo que la degradación respecto a BF16 no está cuantificada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los tamaños de fichero): Q4_K_M + `mmproj` ≈ 1,4 GB; Q8_0 + `mmproj` ≈ 1,7 GB; BF16 + `mmproj` ≈ 2,4 GB. Hay que sumar KV cache, que crece con el número de slices visuales procesadas (hasta 9 por página).
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) puede ejecutar las cuantizaciones Q4 y Q5. Con BF16 y documentos de muchas regiones conviene disponer de 6-8 GB.
- Ejecución en CPU viable: con Q4_K_M (529 MB) el modelo funciona en llama.cpp sin GPU, a costa de latencia mucho mayor; el `mmproj` en BF16 añade 901 MB fijos que no se reducen al cuantizar el LLM.
- GPU de referencia para producción: la model card cita una RTX 5090 para el dato de 1,2 páginas/s con el pipeline completo (detector de layout incluido). Para servir muchas peticiones concurrentes se recomienda A100 o H100 con vLLM o SGLang.
- Opciones de despliegue: llama.cpp (`llama-server`/`llama-mtmd-cli`), Ollama, Hugging Face Transformers, vLLM, SGLang, TGI y FlagOS, según la model card del modelo base.
- Latencia y throughput: el único dato disponible es 1,2 páginas/s en RTX 5090; no hay cifras publicadas para CPU ni para GPU de gama media, ni para otras cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Throughput relativo | Benchmarks |
|---|---|---|---|---|---|---|
| MiniCPM-OCR-1.0 (este repo, GGUF) | 752M según safetensors; 1,3B según model card | No disponible | Apache-2.0 | GGUF, BF16, AWQ, GPTQ | 1,00× (referencia) | 93,68 Real5-OmniDocBench; 54,7 OCRBench v2 |
| PaddleOCR-VL-1.6 | No disponible | No disponible | No disponible | No disponible | 0,67× (MiniCPM-OCR es 1,49× más rápido) | No disponible |
| MinerU2.5 Pro | No disponible | No disponible | No disponible | No disponible | 0,28× (MiniCPM-OCR es 3,62× más rápido) | No disponible |
| Qwen2.5-VL-7B-Instruct | 7B (según denominación) | No disponible | No disponible | No disponible | No disponible | No disponible |

Los dos primeros son competidores directos en OCR documental y los datos de throughput proceden de la propia model card del modelo base, por lo que deben tomarse como cifras del autor. Qwen2.5-VL-7B-Instruct se incluye como alternativa de visión-lenguaje generalista: es mucho mayor y no está especializado en OCR, pero cubre tareas visuales más amplias.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino. No hay soporte declarado de castellano ni de otras lenguas latinas, lo que limita su uso directo en documentación española sin evaluación previa.
- Discrepancia de parámetros: 752M en safetensors frente a 1,3B en la model card. Conviene verificar qué se está midiendo antes de dimensionar hardware o comparar con otros modelos.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en documentos muy largos ni planificar la memoria de la KV cache con precisión.
- Los benchmarks citados corresponden al modelo base en precisión completa, no a las cuantizaciones GGUF de este repositorio; la degradación en Q3 y Q4 puede afectar especialmente a tablas y fórmulas.
- El fichero `mmproj-bf16.gguf` (901 MB) no se cuantiza, de modo que el ahorro real de las cuantizaciones pequeñas es menor de lo que sugiere el tamaño del GGUF del LLM.
- El pipeline de referencia depende de un detector de layout externo (PP-DocLayoutV3) y del SDK `minicpmvocr`; usarlo solo con llama.cpp no reproduce necesariamente las cifras de rendimiento publicadas.
- Riesgo de alucinación en campos no visibles o degradados: en extracción KIE conviene validar con reglas de negocio y no confiar en la salida JSON sin comprobaciones.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: es una cuantización de terceros, sin validación comunitaria amplia.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su integración en flujos que requieran function calling.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de atribución y revisar las licencias de los componentes del pipeline (detector de layout, SDK) que se usen junto al modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/MiniCPM-OCR-1.0-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LLaMA-Factory (ajuste fino): https://github.com/hiyouga/LLaMA-Factory
- ms-swift (ajuste fino): https://github.com/modelscope/ms-swift
- Qwen2.5-VL-7B-Instruct (comparativa): https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Colección Awesome tiny LLMs: https://huggingface.co/collections/eipi1-0/awesome-tiny-llms
- Paper técnico: no disponible
- Demo o Space oficial: no disponible
