# openbmb/MiniCPM-OCR-1.0

## Resumen

MiniCPM-OCR 1.0 es un modelo vision-language de 1.300 millones de parámetros especializado en comprensión de documentos, desarrollado por OpenBMB (grupo de investigación de la Universidad de Tsinghua) y publicado bajo licencia Apache 2.0. Se trata del primer modelo de la familia MiniCPM-V/o orientado específicamente a OCR y parsing documental, y deriva por fine-tuning del modelo base openbmb/MiniCPM-V-4.6. Su propósito es convertir imágenes de documentos —escaneos, fotografías, páginas curvadas, capturas recapturadas— en texto estructurado, incluyendo tablas, fórmulas, gráficos, sellos y extracción de información clave.

El modelo alcanza 93,68 en Real5-OmniDocBench y 54,7 en OCRBench v2, y está diseñado para equilibrar calidad y velocidad: procesa aproximadamente 1,2 páginas por segundo, con un throughput de 1,49× respecto a PaddleOCR-VL-1.6 y 3,62× respecto a MinerU2.5 Pro. Con la decodificación acelerada DSpark (variantes BF16 y GGUF) la eficiencia extremo a extremo mejora un 55%.

Su relevancia actual radica en tres factores: es un modelo pequeño (1,3B) que cabe en hardware modesto, soporta desde el primer día vLLM, SGLang, llama.cpp y Ollama, e incluye un SDK de Python, API completa y flujos de agente. Con 225.216 descargas y 459 likes en Hugging Face, se posiciona como una alternativa open source práctica frente a soluciones propietarias de parsing documental. El contexto y los detalles de entrenamiento no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language multimodal (familia MiniCPM-V/o); detalles internos no disponibles |
| Parámetros totales | 1.300.434.160 (1,3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Variantes cuantizadas disponibles (GGUF para DSpark); lista completa no disponible |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 5,3 GB); GGUF para la variante DSpark |
| Pipeline | image-text-to-text |
| Modelo base | openbmb/MiniCPM-V-4.6 |
| Librería | minicpm-ocr |
| Tamaño del repositorio | 5,3 GB |

## Arquitectura y entrenamiento

MiniCPM-OCR 1.0 es un modelo vision-language de tipo image-text-to-text construido mediante fine-tuning sobre openbmb/MiniCPM-V-4.6. La información disponible no detalla la arquitectura interna del encoder visual ni del decoder de lenguaje, ni especifica el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas de RLHF o DPO. Lo que sí se documenta es su especialización: el modelo está afinado para tareas centradas en texto dentro de documentos, incluyendo reconocimiento de tablas, fórmulas, gráficos y sellos, así como extracción de información estructurada.

La innovación técnica destacada es DSpark, un mecanismo de decodificación acelerada que mejora la eficiencia extremo a extremo en un 55% y que se distribuye en variantes BF16 y GGUF (openbmb/MiniCPM-OCR-1.0-DSpark y openbmb/MiniCPM-OCR-1.0-DSpark-gguf). El modelo está preparado para despliegue en vLLM, SGLang, llama.cpp y Ollama, con builds multi-chip, y admite fine-tuning adicional. No se dispone de información sobre la composición del corpus de entrenamiento ni sobre el proceso de alineación.

## Capacidades

- Parsing documental de extremo a extremo: convierte imágenes y PDFs en texto estructurado, con resultados SOTA en Real5-OmniDocBench (93,68), OmniDocBench v1.6, Wild-OmniDocBench y olmOCR-Bench.
- Reconocimiento de tablas: extrae la estructura y el contenido de tablas en documentos.
- Reconocimiento de fórmulas: interpreta expresiones matemáticas presentes en documentos.
- Reconocimiento de gráficos y sellos: procesa elementos visuales no textuales dentro de documentos.
- Extracción de información clave (KIE): identifica y estructura campos relevantes para automatización downstream.
- Robustez ante capturas del mundo real: maneja escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados.
- Procesamiento bilingüe chino-inglés, tanto en documentos como en PDFs.
- Reconocimiento general: 54,7 en OCRBench v2.
- Soporte conversacional (pipeline image-text-to-text).
- Integración con agentes: incluye un Agent Skill (SKILL.md) para que un agente instale el modelo y parsee documentos con un solo prompt.
- SDK de Python (pip), API completa y app móvil iOS con procesamiento on-device y offline.

## Casos de uso

- Digitalización masiva de archivos: el modelo convierte lotes de escaneos y PDFs en texto estructurado a 1,2 páginas/s, lo que permite procesar grandes volúmenes documentales con hardware modesto gracias a sus 1,3B de parámetros.
- Extracción de datos de facturas y formularios: mediante KIE, identifica campos clave (importes, fechas, emisores) y los devuelve estructurados para alimentar sistemas de contabilidad o ERP.
- Procesamiento de documentación científica y técnica: reconoce fórmulas y tablas en papers y manuales, preservando la estructura para su conversión a Markdown o LaTeX.
- Automatización de pipelines RPA: el soporte de vLLM, SGLang, llama.cpp y Ollama desde el primer día permite integrar el modelo en flujos existentes con una API estándar y un SDK de pip.
- Captura móvil de documentos: la app iOS con procesamiento on-device y offline permite parsear documentos en campo, sin conexión y sin enviar datos a la nube.
- Agentes autónomos de gestión documental: el Agent Skill permite que un agente instale el modelo y procese documentos con un solo prompt, habilitando flujos multi-paso de clasificación y extracción.
- Despliegue en entornos con requisitos de privacidad: la licencia Apache 2.0 y las opciones de self-hosting (incluida imagen Docker oficial) permiten mantener los datos en la infraestructura propia.
- Procesamiento de documentos degradados: su robustez ante páginas curvadas, inclinadas, fotografías y recapturas lo hace adecuado para digitalizar material de archivo en mal estado.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | Líder entre modelos open source (valor numérico no disponible) |
| Wild-OmniDocBench | Líder entre modelos open source (valor numérico no disponible) |
| olmOCR-Bench | Líder entre modelos open source (valor numérico no disponible) |
| CHAOS-Bench | Evaluado (valor numérico no disponible) |

| Métrica de eficiencia | Valor |
|---|---|
| Throughput | 1,2 páginas/s |
| Aceleración con DSpark | +55% de eficiencia extremo a extremo |
| Throughput vs PaddleOCR-VL-1.6 | 1,49× |
| Throughput vs MinerU2.5 Pro | 3,62× |

Los resultados numéricos de OmniDocBench v1.6, Wild-OmniDocBench, olmOCR-Bench y CHAOS-Bench se presentan en la model card únicamente como gráficos comparativos, sin cifras textuales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,3B de parámetros, en BF16 el modelo requiere aproximadamente 2,6 GB solo para pesos; en cuantizaciones de 8 bits alrededor de 1,3 GB y en 4 bits en torno a 0,7 GB, más overhead de KV cache y encoder visual (cifras estimadas a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas: el tamaño reducido permite ejecución en GPUs de consumo; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño de 1,3B; el repo completo ocupa 5,3 GB, por lo que una GPU con 8 GB de VRAM debería ser suficiente en la mayoría de configuraciones.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, imagen Docker oficial, SDK de pip y app iOS on-device.
- Latencia y throughput: 1,2 páginas/s de referencia; con DSpark la eficiencia extremo a extremo mejora un 55%.
- Builds multi-chip disponibles según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Throughput relativo | Licencia |
|---|---|---|---|---|
| MiniCPM-OCR 1.0 | 1,3B | OCR y parsing documental | 1,0× (referencia: 1,2 págs/s) | Apache 2.0 |
| PaddleOCR-VL-1.6 | No disponible | OCR y parsing documental | 0,67× (MiniCPM es 1,49× más rápido) | No disponible |
| MinerU2.5 Pro | No disponible | Parsing documental | 0,28× (MiniCPM es 3,62× más rápido) | No disponible |

MiniCPM-OCR 1.0 lidera la media equiponderada de OmniDocBench v1.6, Real5-OmniDocBench, Wild-OmniDocBench y olmOCR-Bench entre los modelos OCR open source comparados. Los datos de parámetros, contexto y licencia de PaddleOCR-VL-1.6 y MinerU2.5 Pro no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte para inglés y chino; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto: no disponible, lo que impide evaluar su comportamiento en documentos de muchas páginas procesados de una sola vez.
- Sesgos: no se documentan sesgos conocidos; al entrenarse principalmente con documentos en y zh, puede presentar menor precisión en tipografías, layouts o sistemas de escritura no representados.
- Alucinación: como modelo generativo, puede producir texto plausible pero incorrecto en regiones degradadas o ambiguas; se recomienda validación en flujos críticos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los modelos base y de los datasets empleados en el fine-tuning.
- App móvil: el parsing documental on-device está disponible solo en iOS por el momento.
- Producción: los benchmarks publicados corresponden a configuraciones aceleradas concretas; la reproducibilidad requiere seguir la guía oficial de reproducción.
- Detalles de entrenamiento y arquitectura interna no publicados en la información disponible, lo que limita la evaluación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante DSpark (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark (GGUF): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.6
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Familia MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
- Guía de despliegue: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md
- Agent Skill (SKILL.md): https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/SKILL_en.md
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guía del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Demo en HF Spaces: https://huggingface.co/spaces/openbmb/MiniCPM-OCR
- Playground oficial (global): https://platform.modelbest.ai/console/playground/document-parse
- Playground oficial (CN): https://platform.modelbest.cn/console/playground/document-parse
- Documentación de API (global): https://platform.modelbest.ai/console/docs/api/document-parse
- Documentación de API (CN): https://platform.modelbest.cn/console/docs/api/document-parse
- Demo iOS: https://github.com/OpenBMB/MiniCPM-V-Apps/blob/main/README.md#11-ios-demo
- Discord: https://discord.gg/JE8KQqtdn
