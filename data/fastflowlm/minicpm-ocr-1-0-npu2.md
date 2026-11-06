# FastFlowLM/MiniCPM-OCR-1.0-NPU2

## Resumen

MiniCPM-OCR-1.0-NPU2 es una variante del modelo MiniCPM-OCR 1.0, un modelo de vision-lenguaje de 1.3B parametros especializado en comprension de documentos centrada en texto. Lo desarrolla FastFlowLM como un finetune del modelo base openbmb/MiniCPM-V-4.6, y esta orientado especificamente a tareas de OCR y parsing de documentos: extraccion de texto, reconocimiento de tablas, formulas, graficos, sellos y extraccion de informacion estructurada. El sufijo NPU2 del identificador sugiere un empaquetado o build orientado a aceleradores NPU, aunque la model card no detalla esa configuracion.

El modelo resuelve el problema del parsing de documentos del mundo real, incluyendo escaneos, paginas curvadas, fotografias, paginas inclinadas y documentos recapturados. Segun la informacion del autor, alcanza 93.68 en Real5-OmniDocBench y 54.7 en OCRBench v2, con un throughput de aproximadamente 1.2 paginas por segundo en una RTX 5090. Es relevante porque combina calidad de parsing de estado del arte con inferencia eficiente y despliegue sencillo en multiples backends.

La arquitectura subyacente es multimodal vision-lenguaje heredada de MiniCPM-V-4.6, con un total de 1.3B parametros. El modelo soporta ingles y chino, se distribuye bajo licencia Apache 2.0 y esta disponible en Hugging Face con un tamano de repositorio de 2.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje multimodal (derivada de MiniCPM-V-4.6) |
| Parametros totales | 1.3B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variantes cuantizadas disponibles; variante GGUF publicada como MiniCPM-OCR-1.0-DSpark-gguf (tipos concretos no disponibles) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal); GGUF en variante DSpark |

## Arquitectura y entrenamiento

El modelo es un finetune de openbmb/MiniCPM-V-4.6, un modelo vision-lenguaje multimodal de la familia MiniCPM-V/o. MiniCPM-OCR 1.0 es el primer modelo especifico de OCR de esa familia y se centra en la comprension de documentos con predominio de texto: texto plano, tablas, formulas, graficos, sellos y extraccion de informacion estructurada. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

Como innovacion tecnica destacable, el autor menciona la decodificacion acelerada DSpark, que mejora la eficiencia de procesamiento extremo a extremo en un 55% y esta disponible en variantes BF16 y GGUF. El modelo se puede desplegar desde el primer dia en vLLM, SGLang, llama.cpp y Ollama, e incluye builds multi-chip, SDK pip, API completa y flujos de agentes. No se especifica en la informacion disponible si hubo RLHF o DPO durante el entrenamiento.

## Capacidades

- Parsing de documentos de estado del arte: texto, tablas, formulas, graficos y sellos en documentos e imagenes PDF.
- Reconocimiento robusto en condiciones del mundo real: escaneos, paginas curvadas, fotografias, paginas inclinadas y documentos recapturados.
- Reconocimiento de tablas y formulas como capacidades explicitas del modelo.
- Extraccion de informacion clave (KIE) para automatizacion posterior.
- Reconocimiento general de texto con 54.7 en OCRBench v2.
- Soporte bilingue ingles y chino.
- Pipeline image-text-to-text con modo conversacional.
- Despliegue en vLLM, SGLang, llama.cpp y Ollama, con variantes cuantizadas y builds multi-chip.
- Soporte de fine-tuning adicional.
- SDK pip, API completa y flujos de agentes.

## Casos de uso

- Digitalizacion masiva de archivos documentales: el modelo procesa escaneos, paginas curvadas y documentos recapturados, generando Markdown estructurado a partir de imagenes de pagina, lo que permite convertir fondos documentales en texto explotable.
- Extraccion de tablas de informes financieros: reconocimiento de tablas como capacidad nativa para transformar tablas impresas o escaneadas en estructuras de datos utilizables en pipelines de analisis.
- Conversion de papers cientificos a Markdown: el reconocimiento de formulas y graficos permite reconstruir articulos academicos en formato estructurado para su indexacion o revision.
- Automatizacion de KIE en back office: la extraccion de informacion clave permite alimentar sistemas de gestion documental con campos estructurados a partir de facturas, formularios y contratos.
- Procesamiento de documentos bilingues ingles-chino: adecuado para organizaciones que manejan documentacion en ambos idiomas, con soporte nativo de los dos idiomas.
- Despliegue en entornos con NPU o hardware acelerado: la variante NPU2 y los builds multi-chip permiten integrar el modelo en infraestructuras con aceleradores dedicados, con backends como vLLM, SGLang, llama.cpp y Ollama.
- Servicio de parsing como API: el SDK pip y la API completa facilitan exponer el parsing de documentos como servicio interno para otras aplicaciones.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93.68 |
| OCRBench v2 | 54.7 |
| OmniDocBench v1.6 | leading results (cifra concreta no disponible) |
| Wild-OmniDocBench | leading results (cifra concreta no disponible) |
| olmOCR-Bench | leading results (cifra concreta no disponible) |
| CHAOS-Bench | evaluado (cifra concreta no disponible) |

Datos de throughput segun el autor:

| Metrica | Valor |
|---|---|
| Throughput en RTX 5090 (OmniDocBench v1.6, 1651 imagenes, concurrencia 1) | 1.2 paginas/s |
| Mejora de eficiencia con DSpark | 55% |
| Throughput relativo frente a PaddleOCR-VL-1.6 | 1.49x |
| Throughput relativo frente a MinerU2.5 Pro | 3.62x |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 1.3B parametros, en BF16 el peso ronda los 2.6 GB, y las variantes cuantizadas reducen esa cifra.
- GPU recomendadas: el autor reporta mediciones en NVIDIA GeForce RTX 5090; no se detallan otras GPU recomendadas.
- Cabe en GPU de consumo: si, dado el tamano del modelo (1.3B) y las variantes cuantizadas disponibles.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, ademas de builds multi-chip y variante NPU2.
- Latencia y throughput: 1.2 paginas/s en RTX 5090 con concurrencia de imagen 1; el throughput real depende del contenido de la pagina, el backend, la concurrencia y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1.3B | no disponible | 93.68 Real5-OmniDocBench; 54.7 OCRBench v2; 1.2 paginas/s | Apache 2.0 | Hugging Face, vLLM, SGLang, llama.cpp, Ollama |
| PaddleOCR-VL-1.6 | no disponible | no disponible | Throughput 1.49x inferior a MiniCPM-OCR 1.0 | no disponible | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | Throughput 3.62x inferior a MiniCPM-OCR 1.0 | no disponible | no disponible |

Los datos de comparacion proceden unicamente de las afirmaciones del autor en la model card; no se dispone de especificaciones detalladas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo aplicado a OCR, existe riesgo de errores en la transcripcion de texto y estructuras.
- Limitaciones de idioma: solo soporta ingles y chino; no hay soporte declarado de castellano.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base MiniCPM-V-4.6 y las dependencias asociadas.
- La variante NPU2 no documenta en la model card sus requisitos especificos de hardware ni su proceso de despliegue.
- Las cifras de benchmarks y throughput provienen del autor y no se han verificado de forma independiente en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/FastFlowLM/MiniCPM-OCR-1.0-NPU2
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Repositorio MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
- Variante DSpark BF16: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- Demo oficial global: https://platform.modelbest.ai/console/playground/document-parse
- Demo oficial CN: https://platform.modelbest.cn/console/playground/document-parse
- Demo basica CN: http://82.157.64.212:10111/playground/document-parse
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- Guia de uso: https://github.com/OpenBMB/MiniCPM-OCR#using-minicpm-ocr
- Skill: https://github.com/OpenBMB/MiniCPM-OCR#skill
- Guia de reproduccion de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guia del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
