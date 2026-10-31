# litert-community/MiniCPM-OCR-1.0

## Resumen

MiniCPM-OCR-1.0 es un modelo OCR multimodal compacto de 1.300 millones de parametros desarrollado por OpenBMB y entrenado sobre MiniCPM-V 4.6. Esta ficha corresponde a la conversion a LiteRT-LM (formato `.litertlm`) publicada por litert-community, pensada para ejecutar el modelo en dispositivos edge como moviles Android y ordenadores Mac sin dependencia de la nube. El modelo resuelve el problema clasico del OCR de documentos —texto, tablas, formulas matematicas, sellos y graficos— con la ventaja de funcionar completamente en local, lo que resulta relevante para aplicaciones con requisitos de privacidad o sin conectividad.

La arquitectura combina un codificador de vision de 27 capas con un decodificador de texto hibrido estilo Qwen3.5 (18 capas GatedDeltaNet mas 6 capas de atencion). La conversion a LiteRT-LM ofrece dos variantes cuantizadas en int8 (1,59 GB y 2,00 GB) que se ejecutan en CPU o GPU, con latencias medidas de 10 segundos por region de texto en un Galaxy S26 y 25-26 segundos por pagina A4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: codificador de vision de 27 capas + decodificador hibrido estilo Qwen3.5 (18 GatedDeltaNet + 6 atencion) |
| Parametros totales | 1,3 B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamico por canal (decodificador y embedding), fp16 (codificador de vision en la variante VL_int8), fp32 para activaciones en GPU |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM); modelo base en HuggingFace (openbmb/MiniCPM-OCR-1.0) |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM-OCR-1.0, se entreno sobre MiniCPM-V 4.6 y combina un codificador de vision de 27 capas con un decodificador de texto hibrido de 1,3 B de parametros inspirado en Qwen3.5: 18 capas GatedDeltaNet (una arquitectura de tipo SSM/linear attention) y 6 capas de atencion estandar. Esta combinacion reduce el coste de memoria y computo frente a un transformer puro, algo clave para su ejecucion en dispositivos moviles.

En cuanto al procesado de imagenes, una imagen de 448x448 pixeles se convierte en 256 tokens de imagen; para imagenes mayores, el modelo recibe una vista general de la pagina mas hasta 9 recortes (10 imagenes como maximo), marcados mediante la plantilla de chat como slices con el numero de columnas de la cuadricula (`slice_cols`). No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion disponible.

La conversion a LiteRT-LM se realizo con la herramienta hf-to-litertlm e incluye dos cuantizaciones: `MiniCPM-OCR-1.0-VL_int8.litertlm` (2,00 GB, codificador de vision en fp16) y `MiniCPM-OCR-1.0-VL_int8vis.litertlm` (1,59 GB, codificador de vision tambien en int8 dinamico). Las 36 proyecciones de decay/gate de GatedDeltaNet se mantienen en coma flotante.

## Capacidades

- Reconocimiento de texto en imagenes (lineas, parrafos, paginas completas) en ingles y chino.
- Reconocimiento de tablas con salida estructurada.
- Reconocimiento de formulas matematicas en LaTeX.
- Lectura de sellos y graficos (charts).
- Extraccion de campos con nombre (named fields), por ejemplo tienda, fecha y total de un recibo, con salida formateada como JSON.
- Procesado de paginas grandes mediante cuadricula de recortes (vista general + hasta 9 slices).
- Pipeline image-text-to-text: entrada de imagen mas prompt de texto, salida de texto.

## Casos de uso

- Digitalizacion de documentos en el dispositivo: escaneo de paginas A4 completas en movil sin enviar datos a la nube, adecuado para apps con requisitos de privacidad (sanidad, banca, legal).
- Lectura de recibos y extraccion estructurada: el modelo puede extraer campos como `store_name`, `date` y `total` y devolverlos como objeto JSON, util para apps de gestion de gastos.
- Transcripcion de formulas matematicas: convierte formulas impresas o manuscritas en LaTeX, aprovechable en apps de apuntes educativos.
- Reconocimiento de tablas en informes y facturas: salida estructurada que puede integrarse en flujos de procesamiento documental offline.
- OCR en entornos sin conectividad: al ejecutarse en CPU de movil (Galaxy S26, Pixel 8a) o Mac, funciona sin red, util en campo o zonas sin cobertura.
- Prototipado rapido de OCR en edge: el script `ocr_page.py` y la CLI de litert-lm permiten integrar el modelo con pocas lineas de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Como referencia de rendimiento practico en dispositivos, la model card reporta:

| Dispositivo / configuracion | Region 448x448 | Pagina A4 |
|---|---|---|
| Galaxy S26, VL_int8vis, CPU | 10 s | 25-26 s |
| Pixel 8a, VL_int8vis, CPU | 24-25 s | 74-75 s |
| Mac, VL_int8vis, CPU | 12,9 s | 22,2 s |
| Mac, VL_int8, vision en GPU | no disponible | 20,0 s |

En precision, el modelo leyo correctamente las diez regiones de prueba con respuesta conocida en la configuracion VL_int8vis; un caso de formula devuelve LaTeX con espacios adicionales (`\frac{n (n + 1) (2 n + 1)}{6}`) sin alterar el contenido matematico.

## Requisitos de hardware

- Memoria: maximo 2,9 GB en movil con la variante VL_int8vis; 2,0-2,3 GB en Pixel 8a segun configuracion. Los archivos pesan 1,59 GB (VL_int8vis) y 2,00 GB (VL_int8).
- Moviles: Galaxy S26 y Pixel 8a verificados; cabe en gama alta actual sin GPU dedicada, ejecutandose en CPU.
- Mac: compatible via LiteRT-LM, con opcion de descargar el codificador de vision a la GPU para paginas completas.
- No requiere GPU de servidor (A100, H100, etc.); esta pensado para inferencia 100 % en dispositivo.
- Despliegue: runtime LiteRT-LM 0.18.1 o 0.19.0 (Python o CLI `litert-lm`); no aplica vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia: 10 s por region y 25-26 s por pagina A4 en Galaxy S26 (mejor caso medido); throughput en tokens/segundo no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / despliegue | Especializacion | Licencia |
|---|---|---|---|---|
| MiniCPM-OCR-1.0 (LiteRT-LM) | 1,3 B | .litertlm, on-device (LiteRT-LM) | OCR de documentos: texto, tablas, formulas, sellos | Apache 2.0 |
| MiniCPM-OCR-1.0 (base, openbmb) | 1,3 B | Pesos HuggingFace originales | Identica, sin cuantizar para edge | Apache 2.0 |
| Modelos OCR cloud (p. ej. APIs comerciales tipo Tesseract moderno o servicios gestionados) | no disponible | Servidor / nube | OCR general, sin control de privacidad | Variada |

No hay disponibles en la informacion proporcionada datos cuantitativos comparativos de precision frente a otros modelos OCR.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y puede ser inferior.
- El runtime redimensiona cada imagen a 448x448 sin conservar la relacion de aspecto ni aplicar orientacion EXIF: el preprocesado (padding sobre cuadrado blanco) es responsabilidad del desarrollador.
- Para paginas grandes hay que seguir estrictamente la cuadricula de recortes del procesador original (vista general + hasta 9 slices) y pasar `slice_cols`; un preprocesado incorrecto degrada los resultados.
- Bug conocido: la variante VL_int8vis con el codificador de vision en GPU en Mac puede responder `[Non-Text]` cuando se usa directorio de cache; mantener ese codificador en CPU.
- La variante VL_int8vis introduce espacios adicionales en algunas formulas LaTeX respecto al modelo original.
- Latencias elevadas para paginas completas en moviles de gama media (74-75 s en Pixel 8a), lo que puede limitar el uso interactivo.
- Riesgo de alucinacion, sesgos y restricciones de uso comercial adicionales: no documentados en la informacion disponible; la licencia Apache 2.0 permite uso comercial.

## Enlaces

- Repositorio LiteRT-LM: https://huggingface.co/litert-community/MiniCPM-OCR-1.0
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Herramienta de conversion hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de ejemplo ocr_page.py: https://github.com/john-rocky/hf-to-litertlm/blob/main/minicpmocr_work/ocr_page.py
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
