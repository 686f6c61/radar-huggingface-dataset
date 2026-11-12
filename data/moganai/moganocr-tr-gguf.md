# moganai/MoganOCR-TR-GGUF

## Resumen

MoganOCR-TR-GGUF es la versión cuantizada en formato GGUF de MoganOCR-TR, un modelo de visión-lenguaje (VLM) de aproximadamente 1.880 millones de parámetros especializado en OCR de documentos en turco. Lo desarrolla el usuario moganai y está pensado para su uso con llama.cpp, lo que permite ejecutar la inferencia en hardware de consumo sin necesidad de GPUs de datacenter. El modelo recibe una imagen de una página y devuelve el contenido completo en orden de lectura como Markdown, con las tablas convertidas a HTML y las fórmulas a LaTeX.

La relevancia del modelo radica en su especialización: frente a VLMs generalistas, MoganOCR-TR está afinado específicamente para el parsing de documentos turcos, un idioma con relativamente pocos recursos en el ecosistema OCR open source. La publicación en GGUF facilita el despliegue local y en entornos con recursos limitados, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El repositorio incluye varias cuantizaciones (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16) junto con el codificador visual en un archivo separado `mmproj-MoganOCR-TR-F16.gguf`, que es obligatorio para el funcionamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (image-text-to-text) basada en transformer; detalles internos no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de uso de llama-server emplea `-c 16384` |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); pesos originales del modelo base en safetensors |

## Arquitectura y entrenamiento

La model card disponible no detalla la arquitectura interna del modelo base MoganOCR-TR más allá de identificarlo como un VLM de tipo image-text-to-text. Por el tamaño (1,88 B de parámetros) y la tarea, se trata de un modelo compacto que combina un codificador visual con un decodificador de lenguaje; el codificador se distribuye por separado en el archivo `mmproj-MoganOCR-TR-F16.gguf` (0,67 GB), lo que es habitual en los despliegues GGUF multimodales de llama.cpp.

No se ha publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El modelo está diseñado para generar salida estructurada en Markdown, con tablas en HTML y fórmulas en LaTeX, lo que sugiere un entrenamiento orientado a la preservación de estructura de documentos.

## Capacidades

- OCR de documentos: extrae el texto de una imagen de página completa en orden de lectura.
- Conversión a Markdown: la salida se estructura como Markdown, lo que facilita su uso en pipelines de documentación.
- Tablas: las tablas del documento se emiten como HTML dentro del Markdown.
- Fórmulas matemáticas: las expresiones se emiten en LaTeX.
- Multilingüe limitado: soporta turco e inglés según los metadatos del modelo.
- Entrada de imagen: pipeline image-text-to-text, una imagen por petición.
- Compatible con llama.cpp y llama-server, incluyendo endpoints compatibles con la API de OpenAI (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes o modos de razonamiento extendido en la información disponible.

## Casos de uso

- Digitalización de archivos turcos: procesar lotes de documentos escaneados en turco y obtener Markdown listo para indexar en un sistema de búsqueda o base de conocimiento, aprovechando la preservación de orden de lectura.
- Extracción de tablas financieras: convertir tablas de informes, facturas o estados contables a HTML dentro del Markdown, lo que permite un post-procesado estructurado con parsers HTML estándar.
- Procesamiento de documentación técnica con fórmulas: capturar ecuaciones en LaTeX para su reutilización en documentación científica o manuales técnicos.
- Pipelines RAG sobre PDFs: integrar el modelo como etapa de extracción previa a la fragmentación y embedding, ejecutándolo localmente con llama.cpp para evitar enviar documentos sensibles a servicios externos.
- Despliegue en hardware de consumo: usar la cuantización Q4_K_M (1,44 GB) o Q5_K_M (1,56 GB) en estaciones de trabajo con GPU modesta o incluso CPU, gracias al formato GGUF.
- Servicio OCR autoalojado: levantar `llama-server` con el endpoint compatible con OpenAI y ofrecer OCR como servicio interno para aplicaciones de gestión documental.
- Preprocesado en flujos de accesibilidad: generar versiones Markdown navegables de documentos escaneados en turco para lectores de pantalla u otras herramientas de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a un Space llamado TurkishOCR-Bench (`moganai/TurkishOCR-Bench`), pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB con Q4_K_M, 1,6 GB con Q5_K_M, 1,7 GB con Q6_K y 2,0 GB con Q8_0 para los pesos del modelo; hay que sumar el codificador visual `mmproj-MoganOCR-TR-F16.gguf` (0,67 GB) y el espacio de contexto y caché KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería poder ejecutar las cuantizaciones pequeñas; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4-8 GB de VRAM (por ejemplo, gamas RTX xx60/xx70), aunque no se confirma con datos oficiales.
- Opciones de despliegue: llama.cpp y llama-server; el ejemplo de la model card es `llama-server -hf moganai/MoganOCR-TR-GGUF:Q8_0 --image-max-tokens 4096 -c 16384`. No se documenta soporte de vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de comparaciones oficiales en la información proporcionada. A continuación se indican alternativas de la misma categoría (OCR/VLM para documentos) sin cifras comparativas verificadas:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MoganOCR-TR-GGUF | ~1,88 B | no disponible | tr, en | Apache 2.0 | GGUF |
| Alternativas OCR/VLM de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han podido establecer comparaciones cuantitativas con modelos concretos por falta de datos en la información disponible.

## Limitaciones y advertencias

- Especialización lingüística: el modelo está orientado a turco e inglés; su rendimiento en otros idiomas no está garantizado ni documentado.
- Una imagen por petición: el flujo de uso descrito procesa una página por solicitud, lo que limita el procesamiento por lotes dentro de una misma llamada.
- Dependencia del codificador visual: es obligatorio cargar `mmproj-MoganOCR-TR-F16.gguf` junto con el archivo del modelo; omitirlo impide la inferencia multimodal.
- Parámetros de inferencia sensibles: la model card recomienda temperatura 0 y el prompt exacto `Sayfayı markdown olarak yaz.`; desviarse de esta configuración puede degradar la calidad de la salida.
- Riesgo de alucinación: como todo modelo generativo, puede inventar contenido en documentos con baja calidad de escaneo, tipografías poco habituales o tablas complejas; no se documentan tasas de error.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base MoganOCR-TR por si hubiera requisitos adicionales no reflejados aquí.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y se creó el 12 de noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moganai/MoganOCR-TR-GGUF
- Modelo base: https://huggingface.co/moganai/MoganOCR-TR
- Benchmark TurkishOCR-Bench: https://huggingface.co/spaces/moganai/TurkishOCR-Bench
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Apoyo al autor: https://buymeacoffee.com/moganai
