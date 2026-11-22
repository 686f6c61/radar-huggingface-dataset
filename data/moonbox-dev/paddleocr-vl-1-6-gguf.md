# moonbox-dev/PaddleOCR-VL-1.6-GGUF

## Resumen

PaddleOCR-VL-1.6 es un modelo vision-language especializado en el análisis de documentos (document parsing), desarrollado por PaddlePaddle. Esta ficha corresponde a la versión GGUF publicada por moonbox-dev, pensada para inferencia local con llama.cpp en Metal, CUDA, Vulkan y CPU. El modelo resuelve tareas de reconocimiento óptico de caracteres (OCR), reconocimiento de tablas, fórmulas y gráficos, devolviendo texto estructurado a partir de imágenes de páginas.

La arquitectura combina un codificador visual (vision tower) con un decodificador de lenguaje ERNIE-4.5-0.3B, con un total de 466.654.208 parámetros. El repositorio GGUF separa el decodificador (un archivo por precisión) del codificador y su proyector (un único archivo `mmproj` en F16 compartido por todas las precisiones). El tamaño total del repo es de 4,3 GB.

La relevancia de esta publicación radica en que permite ejecutar un modelo de parsing documental en hardware modesto: la versión Q4_K_M ocupa 300,2 MB y la Q8_0 498,3 MB, con un rendimiento medido de 0,16-0,19 segundos por página en una RTX 3080 Laptop. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: vision tower + decodificador ERNIE-4.5-0.3B |
| Parametros totales | 466.654.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | no disponible (el benchmark cubre ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un vision-language compuesto por un codificador visual (vision tower) con su proyector, más un decodificador de lenguaje ERNIE-4.5-0.3B. En la conversión a GGUF se excluyen dos componentes que el modelo no usa para generación: la cabeza de pooling del vision tower (`vision_model.head.*`) y su packing position embedding. El resto de tensores del checkpoint original se conserva byte-idéntico en los archivos BF16 y `mmproj`.

Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. La model card del autor de la cuantización indica que los archivos se generaron con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp `b12621`, sin importance matrix, a partir de la revisión `132c45f52c` de PaddleOCR-VL-1.6.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas, con el prompt `OCR:`.
- Reconocimiento de tablas con el prompt `Table Recognition:`.
- Reconocimiento de fórmulas con el prompt `Formula Recognition:`.
- Reconocimiento de gráficos con el prompt `Chart Recognition:`.
- Procesamiento de imagen y texto como entrada (pipeline image-text-to-text).
- Soporte multilingüe declarado en los tags; el benchmark verifica inglés y chino.
- Servicio mediante API compatible con `/v1/chat/completions` a través de `llama-server`, enviando la página como parte `image_url`.
- No se documenta soporte de tool calling, agentes ni modo thinking en la información disponible.

## Casos de uso

- Digitalización de archivos en papel: el modelo convierte imágenes de páginas escaneadas en texto mediante el prompt `OCR:`, con un coste de 0,16-0,19 s por página en GPU, adecuado para lotes grandes.
- Extracción de tablas de informes financieros: con `Table Recognition:` se obtiene la estructura tabular de documentos contables o presupuestos sin post-procesado manual.
- Conversión de artículos científicos a texto estructurado: el prompt `Formula Recognition:` permite recuperar fórmulas matemáticas de PDFs renderizados como imagen.
- Procesamiento de gráficos en documentación técnica: `Chart Recognition:` extrae la información de figuras y diagramas incluidos en manuales.
- Despliegue en dispositivos sin GPU dedicada: las cuantizaciones Q4_K_M (300,2 MB) y Q5_K_M (341,5 MB) permiten ejecutar el modelo en CPU mediante llama.cpp, útil para aplicaciones de escritorio o entornos embebidos.
- Integración en pipelines de ingestión documental: `llama-server` expone el modelo por `/v1/chat/completions`, lo que facilita conectarlo a sistemas RAG que necesiten convertir páginas en texto antes de la indexación.
- Servicio local con privacidad de datos: al ejecutarse en hardware propio con llama.cpp, los documentos no salen de la infraestructura del usuario, lo que encaja en sectores con requisitos de confidencialidad.

## Benchmarks y rendimiento

Los datos proceden del conjunto de evaluación de Moonbox: 12 páginas sintéticas (6 en inglés y 6 en chino) renderizadas con fuentes de Windows, prompt `OCR:` con decodificación greedy, ejecución en `llama-server` sobre CUDA (RTX 3080 Laptop). La métrica es la tasa de error de carácter (CER) por idioma, ignorando espacios.

| Precision | Tamano | CER (ingles / chino) | Texto identico a BF16 | Latencia por pagina (CUDA) |
|---|---|---|---|---|
| F16 | 935,8 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,18 s |
| BF16 | 935,8 MB | 0,0 % / 0,0 % | referencia | 0,19 s |
| Q8_0 | 498,3 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,17 s |
| Q6_K | 385,3 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,17 s |
| Q5_K_M | 341,5 MB | 0,0 % / 0,0 % | 6 + 6 de 12 paginas | 0,17 s |
| Q4_K_M | 300,2 MB | 0,0 % / 0,0 % | 6 + 5 de 12 paginas | 0,16 s |

El modelo original en float32 leyó las 12 páginas con CER 0,0 % / 0,0 %. El criterio de aceptación de la cuantización era no superar el CER del original más 1 punto. El archivo `mmproj` (880,4 MB) se usa con todas las precisiones.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,8 GB en F16/BF16 (935,8 MB del modelo + 880,4 MB del `mmproj`); aproximadamente 1,4 GB en Q8_0 y 1,2 GB en Q4_K_M, sumando siempre el `mmproj` en F16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el benchmark se ejecutó en una RTX 3080 Laptop. Para lotes grandes se recomiendan A100, H100 o RTX 4090 por su mayor paralelismo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090), así como en Apple Silicon vía Metal.
- Opciones de despliegue: llama.cpp `b12621` o superior, con `llama-mtmd-cli` para línea de comandos y `llama-server` para API compatible con `/v1/chat/completions`. No se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: 0,16-0,19 s por página en CUDA (RTX 3080 Laptop) con `llama-server` y decodificación greedy, según el benchmark del autor de la cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| PaddleOCR-VL-1.6 (este, GGUF) | 466.654.208 | no disponible | Apache 2.0 | GGUF |
| PaddleOCR-VL-1.6 original | 466.654.208 | no disponible | Apache 2.0 | safetensors (checkpoint original) |
| Alternativas de OCR/VL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El benchmark de la cuantización se limita a 12 páginas sintéticas en inglés y chino; no hay evidencia publicada sobre otros idiomas ni sobre documentos reales con ruido, rotaciones o baja resolución.
- La model card no documenta sesgos conocidos del modelo original; al ser un modelo de OCR, puede fallar en caligrafía, tablas complejas o layouts poco habituales.
- Riesgo de alucinación en la transcripción: como modelo generativo, puede producir texto no presente en la imagen, especialmente en regiones de baja legibilidad.
- La longitud de contexto no está disponible, lo que impide planificar el procesamiento de páginas densas o de varias páginas en una sola petición.
- Los idiomas soportados no están listados oficialmente; los tags mencionan multilingüismo, pero solo se verifica inglés y chino.
- La licencia Apache 2.0 permite uso comercial, pero los archivos GGUF son una obra derivada y quedan sujetos a la licencia del modelo original, incluida en el repositorio.
- Se requiere llama.cpp `b12621` o superior; versiones anteriores pueden no cargar correctamente el `mmproj`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de estos archivos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/PaddleOCR-VL-1.6-GGUF
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Repositorio GitHub de PaddleOCR: https://github.com/PaddlePaddle/PaddleOCR
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado en los tags: arXiv:2606.03264
