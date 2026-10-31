# openbmb/MiniCPM-OCR-1.0-DSpark

## Resumen

MiniCPM-OCR 1.0 DSpark es la cabecera de decodificacion especulativa (draft model) publicada por OpenBMB para acompanar al modelo principal de OCR MiniCPM-OCR 1.0 (1.3B parametros). No es un modelo de OCR autonomo: su funcion es proponer tokens que el modelo principal verifica en una sola pasada, acelerando la decodificacion. Con esta cabecera, MiniCPM-OCR 1.0 mejora la eficiencia de procesamiento end-to-end en un 55 %, alcanzando un throughput de aproximadamente 1,49x el de PaddleOCR-VL-1.6 y 3,62x el de MinerU2.5 Pro.

El repositorio contiene un checkpoint de unos 297 millones de parametros (296.837.889 parametros de draft segun la model card) en formato safetensors, con arquitectura `Qwen3DSparkModel` y 5 capas de draft que proponen hasta 15 tokens por pasada. Es relevante porque la decodificacion especulativa es una de las tecnicas mas efectivas para reducir la latencia en tareas de OCR y parseo de documentos, donde los modelos generan secuencias largas de texto estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3DSparkModel (cabecera de draft para decodificacion especulativa) |
| Parametros totales | 296.952.577 (296.837.889 parametros de draft segun la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo principal, servible con 40960 tokens) |
| Tipos de cuantizacion | BF16 (existen variantes GGUF del draft; el modelo principal tiene AWQ W4A16 y GPTQ W4A16) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien disponible en GGUF) |

## Arquitectura y entrenamiento

DSpark es un modelo draft ligero compuesto por 5 capas de draft, un proyect lineal (`fc`), una `lm_head` recortada, cabezas de Markov y una cabeza de confianza (confidence head). Proponen hasta 15 tokens por pasada, que el modelo objetivo verifica en paralelo en una unica pasada. Las capas de estados ocultos del modelo objetivo utilizadas como entrada son `[3, 7, 11, 15, 19]`.

Un detalle tecnico relevante es el vocabulario: la entrada usa el vocabulario completo del objetivo (248.100 tokens), mientras que la salida esta recortada a 114.688 tokens. El tensor `d2t`, que mapea IDs de draft a IDs del modelo objetivo, esta codificado en formato delta (`target_id - draft_id`) y debe convertirse a IDs absolutos (`d2t[i] + i`) antes de su uso; la build GGUF ya realiza esta conversion y `local-to-target.json` contiene los 114.688 IDs absolutos de referencia. El checkpoint incluye ademas `export-audit.json` con hashes de pesos y cobertura de vocabulario. No se ha publicado informacion sobre los datos de entrenamiento ni el procedimiento de fine-tuning de esta cabecera.

## Capacidades

- No genera texto de forma autonoma: es un componente de aceleracion que debe emparejarse con openbmb/MiniCPM-OCR-1.0.
- Propuesta especulativa de hasta 15 tokens por pasada hacia adelante.
- Cabeza de confianza para la verificacion adaptativa de tokens propuestos.
- Cabezas de Markov para la propuesta secuencial de tokens.
- Compatible con vLLM mediante `speculative-config` con metodo `dspark`.
- Disponible en formato GGUF para su uso con llama.cpp.
- Hereda las capacidades del modelo principal (OCR, parseo de documentos, image-text-to-text) al trabajar en conjunto con el checkpoint objetivo.

## Casos de uso

- Parseo de documentos a alta velocidad: al acoplar DSpark a MiniCPM-OCR 1.0 en vLLM, se reduce un 55 % el tiempo de procesamiento end-to-end, util para digitalizar grandes volumenes de PDFs e imagenes.
- Digitalizacion masiva en lote: el throughput de 3,62x frente a MinerU2.5 Pro lo hace adecuado para procesos ETL de archivos documentales en centros de datos.
- Servicios de OCR en produccion con latencia reducida: la API gratuita de document-parse de ModelBest se apoya en esta familia de modelos para servir parseo de documentos en tiempo real.
- Despliegue en servidores con GPU unica: al ser un draft de ~297M de parametros, el coste adicional de VRAM es reducido frente a la ganancia de throughput.
- Integracion en pipelines RAG de documentos: el parseo acelerado permite indexar corpus documentales extensos en menos tiempo.
- Comparativas y evaluacion de stacks de OCR: sirve como referencia de rendimiento frente a PaddleOCR-VL-1.6 y MinerU2.5 Pro en benchmarks de eficiencia.

## Benchmarks y rendimiento

Datos publicados en la model card (eficiencia de decodificacion, no calidad de OCR):

| Metrica | Valor |
|---|---|
| Mejora de eficiencia end-to-end de MiniCPM-OCR 1.0 | +55 % |
| Throughput relativo frente a PaddleOCR-VL-1.6 | ~1,49x |
| Throughput relativo frente a MinerU2.5 Pro | ~3,62x |

No se han publicado en la informacion disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otras metricas de precision OCR) para este componente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra exacta; el checkpoint pesa aproximadamente 0,6 GB en BF16, a lo que hay que sumar la memoria del modelo principal MiniCPM-OCR 1.0 (1.3B parametros).
- GPU recomendadas: no disponible; el comando de referencia de vLLM sugiere despliegue en servidor con GPU, y el modelo principal puede ejecutarse con `--max-model-len 40960`.
- Consumer GPU: al pesar el draft solo ~0,6 GB, es plausible su uso junto al modelo principal en GPUs de consumo de gama alta (por ejemplo RTX 4090), aunque no se publica una configuracion minima oficial.
- Opciones de despliegue: vLLM (metodo de especulacion `dspark`, con `num_speculative_tokens: 15`), llama.cpp mediante las variantes GGUF, y la API gratuita de ModelBest para pruebas sin despliegue local.
- Latencia y throughput: mejora end-to-end del 55 % respecto al modelo principal sin draft; throughput de ~1,49x PaddleOCR-VL-1.6 y ~3,62x MinerU2.5 Pro. Latencias absolutas no disponibles.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Formato | Licencia |
|---|---|---|---|---|
| MiniCPM-OCR 1.0 DSpark (este) | Draft model especulativo | ~297 M | safetensors, GGUF | Apache 2.0 |
| PaddleOCR-VL-1.6 | Modelo OCR completo (referencia de throughput) | no disponible | no disponible | no disponible |
| MinerU2.5 Pro | Modelo de parseo de documentos (referencia de throughput) | no disponible | no disponible | no disponible |

No hay alternativas directas publicadas de cabeceras DSpark para otros modelos OCR en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo standalone: debe emparejarse obligatoriamente con el checkpoint principal openbmb/MiniCPM-OCR-1.0 de la misma release; no debe combinarse con otros checkpoints principales.
- El tensor `d2t` esta delta-codificado y requiere conversion a IDs absolutos antes de su uso; una implementacion incorrecta producira salidas invalidas. `local-to-target.json` es la referencia de verificacion.
- La salida del vocabulario esta recortada a 114.688 tokens frente a los 248.100 de entrada; el mapeo debe gestionarse correctamente.
- Idiomas limitados a ingles y chino; no hay soporte declarado para castellano.
- No hay datos publicados de calidad de OCR, sesgos ni tasas de alucinacion para este componente; la calidad depende del modelo principal.
- En el comando de referencia de vLLM se desactiva el thinking mode (`enable_thinking: false`) y la verificacion adaptativa (`enable_adaptive_verification: false`); desviarse de estos parametros puede afectar al rendimiento.
- La licencia Apache 2.0 no impone restricciones de uso comercial.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Modelo principal: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- GGUF del modelo principal: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
- AWQ W4A16 del modelo principal: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-AWQ
- GPTQ W4A16 del modelo principal: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-GPTQ
- DSpark GGUF: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- GitHub MiniCPM-OCR: https://github.com/OpenBMB/MiniCPM-OCR
- Tutorial de uso (incluye tuning de DSpark): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md
- FAQ: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/faq_en.md
- Licencia: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/LICENSE
- Demo oficial (CN): https://platform.modelbest.cn/console/playground/document-parse
- Demo oficial (Global): https://platform.modelbest.ai/console/playground/document-parse
- Demo basica (HuggingFace Space): https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- API gratuita: https://platform.modelbest.ai/console/docs/api/document-parse
- ModelScope (DSpark): https://modelscope.cn/models/OpenBMB/MiniCPM-OCR-1.0-DSpark
