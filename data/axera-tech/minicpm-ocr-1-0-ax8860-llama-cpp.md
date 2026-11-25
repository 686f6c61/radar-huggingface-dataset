# AXERA-TECH/MiniCPM-OCR-1.0-AX8860-llama.cpp

## Resumen

MiniCPM-OCR-1.0-AX8860-llama.cpp es una distribución empaquetada del modelo MiniCPM-OCR-1.0 de OpenBMB, adaptada por AXERA-TECH para ejecutarse sobre la NPU del SoC Axera AX8860 mediante llama.cpp con el backend ggml-axera. El modelo original es un modelo multimodal especializado en reconocimiento óptico de caracteres (OCR) en chino e inglés, capaz de procesar documentos, tablas y capturas de pantalla. Esta variante no modifica los pesos del modelo base, sino que los convierte a GGUF y proporciona los kernels de NPU, binarios estáticos y scripts necesarios para desplegarlo en hardware de borde.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo OCR multimodal de aproximadamente 752 millones de parámetros en una NPU de bajo consumo, con latencias de extremo a extremo de 1,62 segundos por imagen y velocidades de decodificación superiores a 143 tokens por segundo. El paquete incluye un servidor compatible con la API de OpenAI, lo que facilita su integración en pipelines existentes.

El modelo base procede de OpenBMB y esta distribución concreta esta pensada para el ecosistema Axera: requiere SDK V0.5.1 o superior y ocupa los cuatro núcleos de la NPU durante la inferencia. El repositorio pesa 2,7 GB e incluye los pesos en BF16, el codificador visual, los kernels compilados y diez imágenes de prueba con sus textos de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual + modelo de lenguaje) sobre llama.cpp / ggml-axera |
| Parametros totales | 752.167.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | BF16 en origen; conversion a MXFP8 de los pesos de texto en carga; KV cache en BF16; pesos visuales en BF16 |
| Idiomas soportados | chino e ingles |
| Licencia | no disponible |
| Formato de pesos | GGUF (texto: `minicpm-ocr-1.0-bf16.gguf`, 1,52 GB; vision: `mmproj-minicpm-ocr-1.0-bf16.gguf`, 0,9 GB) |

## Arquitectura y entrenamiento

La arquitectura combina un codificador visual con un modelo de lenguaje transformer, empaquetados ambos como dos artefactos GGUF separados (pesos de texto y `mmproj` del codificador visual). En esta distribución, los pesos de texto se convierten de GGUF a MXFP8 en el momento de la carga, mientras que los pesos del codificador visual permanecen en BF16 y la caché KV en BF16. La inferencia se ejecuta mediante tres kernels de NPU: prefill de texto, decode de texto (incluyendo la cabeza de salida) y codificador visual, gestionados a través de un `manifest.json`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base, ya que la model card de esta distribución se centra en el despliegue y no en el entrenamiento. La innovación técnica destacable de este paquete es la integración del backend ggml-axera en llama.cpp, que permite ejecutar el modelo completo en la NPU del AX8860 con un consumo de memoria NPU de 2,08 GiB tras la carga y un pico de 3,01 GiB. El paquete incluye además un servidor compatible con OpenAI y un chat template en Jinja.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de documentos, tablas y capturas de pantalla en chino e inglés.
- Procesamiento multimodal: acepta imágenes y texto como entrada.
- Generación de texto y finalización de texto (text completion).
- Servidor compatible con la API de OpenAI para integración en aplicaciones existentes.
- Procesamiento por lotes de imágenes (modo `-b` sobre directorios de PNG).
- Modo de razonamiento configurable (desactivado por defecto en el servidor mediante `--reasoning off`).
- Soporte de prompt cache, validado con una prueba de estrés de 160 peticiones sin errores de caché.
- No se dispone de información sobre soporte de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Digitalización de documentos en el borde: el modelo puede ejecutarse íntegramente en el AX8860 sin conexión a la nube, procesando documentos escaneados en chino e inglés con una latencia mediana de 1,62 segundos por imagen, lo que lo hace adecuado para escáneres inteligentes o dispositivos de captura portátiles.
- Extracción de tablas en facturas y formularios: al reconocer tablas, puede integrarse en flujos de contabilidad o gestión documental que necesiten convertir tablas impresas en texto estructurado, con el servidor compatible con OpenAI como punto de integración.
- Procesamiento por lotes de capturas de pantalla: el script `run.sh -b images` permite enviar todas las imágenes de un directorio al servidor temporal en el puerto 18258, útil para auditorías de interfaz, accesibilidad o archivado masivo de capturas.
- Asistencia a la lectura en dispositivos de bajo consumo: con un pico de 3,01 GiB de memoria NPU y 868 MiB de RSS en host, el modelo cabe en hardware embebido, lo que permite construir lectores aumentados o traductores de documentos sin depender de infraestructura cloud.
- Automatización de atención al cliente con documentos adjuntos: el servidor compatible con OpenAI permite recibir imágenes de tickets o comprobantes y devolver el texto reconocido, integrándose en sistemas de ticketing existentes mediante llamadas HTTP estándar.
- Verificación de calidad de OCR en pipelines de CI: el paquete incluye diez imágenes de prueba con texto de referencia en `images/reference.json` y un script `bench.sh`, lo que permite automatizar pruebas de regresión de precisión y rendimiento tras actualizaciones del SDK o de los kernels.
- Procesamiento de texto puro en el borde: aunque su especialidad es el OCR, el modelo también realiza finalización de texto con 154,9 tokens/s de decodificación, lo que permite tareas ligeras de generación o clasificación textual en el mismo dispositivo.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y se midieron en el AX8860 con contexto de 4096, decodificación greedy y mediana de 3 ejecuciones.

| Metrica | Resultado |
|---|---|
| Latencia total por peticion de imagen (mediana) | 1,62 s (codificacion + prefill + generacion) |
| Decodificacion OCR | 143,4 tokens/s |
| Decodificacion de texto | 154,9 tokens/s |
| Prefill de 3908 tokens | 0,50 s (7784 tokens/s) |
| Prefill de 5 tokens | 0,03 s |
| Codificacion de imagen (`doc_en.png`, 1782 tokens de imagen) | 1,61 s |
| Memoria NPU tras carga / pico | 2,08 GiB / 3,01 GiB |
| RSS de host tras carga / pico | 182 MiB / 868 MiB |
| Perplejidad de texto en placa vs. referencia CPU | 174,56 vs. 172,74 (+1,05%) |
| Prueba de estres de prompt cache | 160 peticiones, 0 errores |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- NPU Axera AX8860 obligatoria, con SDK V0.5.1 o superior; el modelo no funciona en CPU ni GPU convencionales con este paquete.
- Memoria NPU: 2,08 GiB tras la carga y 3,01 GiB en pico.
- Memoria de host: 182 MiB tras la carga y 868 MiB en pico.
- La inferencia ocupa los cuatro núcleos de la NPU en exclusiva; el servidor se ejecuta con `-np 1`.
- Almacenamiento: repositorio de 2,7 GB (pesos de texto 1,52 GB, codificador visual 0,9 GB, más binarios y kernels).
- Despliegue mediante los scripts incluidos (`run.sh`, `bench.sh`) y binarios estáticos de llama.cpp en `bin/`; no se mencionan opciones como vLLM, Ollama o TGI para este paquete.
- Los archivos descargados de Hugging Face no tienen permisos de ejecución; deben invocarse con `sh`.
- No se dispone de datos de latencia o throughput en otras plataformas distintas del AX8860.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0-AX8860-llama.cpp | 752 M | 4096 | no disponible | NPU AX8860 (llama.cpp + ggml-axera) | Especializado en OCR chino/ingles; 1,62 s por imagen |
| openbmb/MiniCPM-OCR-1.0 | 752 M | no disponible | no disponible | Generico (formato original) | Modelo base del que deriva esta distribucion |
| Otros modelos OCR de la familia MiniCPM | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de otros fabricantes en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse el uso comercial sin consultar el repositorio del modelo base.
- El modelo solo soporta chino e ingles; no se garantiza el rendimiento en otros idiomas.
- La ventana de contexto esta limitada a 4096 tokens; la prompt mas larga entre las diez imagenes incluidas alcanza 1830 tokens, lo que deja margen pero restringe documentos muy extensos.
- Dependencia estricta del hardware Axera AX8860 y del SDK V0.5.1 o superior; no es portable a otras plataformas sin recompilar los kernels.
- La NPU queda ocupada en exclusiva durante la inferencia, lo que impide ejecutar otras cargas de NPU en paralelo.
- El modo de razonamiento esta desactivado por defecto en el servidor; su comportamiento con razonamiento activado no se documenta en detalle.
- Riesgo de alucinacion inherente a los modelos generativos: en OCR, esto puede manifestarse como texto inventado en zonas de baja calidad o con tipografias no vistas durante el entrenamiento.
- Las imagenes de prueba fueron generadas con la fuente Noto CJK, por lo que la validacion de precision cubre un dominio limitado y no representa documentos reales con ruido, sellos o caligrafia.
- No se dispone de informacion sobre sesgos especificos del modelo base.
- La diferencia de perplejidad respecto a la referencia en CPU es del +1,05%, lo que indica una degradacion pequena pero medible en la calidad de la generacion de texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/MiniCPM-OCR-1.0-AX8860-llama.cpp
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Fork de llama.cpp utilizado: https://github.com/ZHEQIUSHUI/llama.cpp (commit `6613735ce`)
