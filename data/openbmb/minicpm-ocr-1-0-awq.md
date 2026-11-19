# openbmb/MiniCPM-OCR-1.0-AWQ

## Resumen

MiniCPM-OCR 1.0-AWQ es la versión cuantizada a 4 bits (AWQ W4A16) de MiniCPM-OCR 1.0, un modelo multimodal de 1.300 millones de parámetros desarrollado por OpenBMB, el equipo detrás de la familia MiniCPM-V/o. Es el primer modelo de la familia específicamente orientado a OCR y comprensión de documentos centrados en texto: texto plano, tablas, fórmulas, gráficos, sellos y extracción de información estructurada. El repositorio que nos ocupa contiene únicamente los pesos cuantizados; la model card describe el modelo base BF16.

El modelo resuelve el problema del parseo de documentos reales (escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados) en chino e inglés, con un equilibrio explícito entre calidad y velocidad. Según el autor, alcanza 93,68 en Real5-OmniDocBench y 54,7 en OCRBench v2, y con la decodificación acelerada DSpark mejora un 55 % la eficiencia extremo a extremo, con un throughput de aproximadamente 1,49× respecto a PaddleOCR-VL-1.6 y 3,62× respecto a MinerU2.5 Pro.

La relevancia actual está en su tamaño reducido (1,3B), su licencia Apache 2.0 y su despliegue desde el primer día en vLLM, SGLang, llama.cpp y Ollama, lo que lo hace apto para self-hosting, procesamiento por lotes de documentos y aplicaciones móviles offline (la app de parseo de documentos es, por ahora, solo para iOS).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text de la familia MiniCPM-V/o) |
| Parámetros totales | 1.300.434.160 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | AWQ 4-bit (W4A16); el modelo base dispone de variantes BF16 y GGUF |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB) |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna (tipo de transformer, encoder visual, mecanismo de atención) ni sobre la composición del dataset de entrenamiento, el número de tokens o si hubo fases de RLHF/DPO. La model card solo indica que se trata de un modelo multimodal de la familia MiniCPM-V/o orientado a comprensión de documentos centrados en texto, con soporte para chino e inglés, y que el pipeline es image-text-to-text.

La innovación técnica destacada por el autor es DSpark, una técnica de aceleración de decodificación disponible en variantes BF16 y GGUF del modelo base, que según la model card mejora un 55 % la eficiencia extremo a extremo. Esta versión AWQ, al ser una cuantización W4A16 del modelo base, no incluye cambios arquitectónicos respecto a este: solo reduce la precisión de los pesos a 4 bits manteniendo las activaciones en 16 bits.

## Capacidades

- Parseo de documentos: extracción de texto, tablas, fórmulas, gráficos y sellos en documentos e PDF, incluidos escaneos, páginas curvadas, fotografías, páginas inclinadas y documentos recapturados.
- Reconocimiento general de texto (OCR) en chino e inglés, con 54,7 en OCRBench v2 según el autor.
- Extracción de información clave (KIE) para automatización posterior.
- Comprensión multimodal image-text-to-text con salida conversacional.
- Despliegue en vLLM, SGLang, llama.cpp y Ollama, con variantes cuantizadas y builds multi-chip.
- SDK de Python (pip), API completa y flujos de trabajo de agentes (Agent Skill con SKILL.md).
- Aplicación móvil en dispositivo y offline, con parseo de documentos disponible solo en iOS por el momento.
- Fine-tuning adicional soportado según la model card.

## Casos de uso

- Digitalización masiva de archivos: procesar lotes de PDF escaneados y fotografías de documentos para obtener texto estructurado, aprovechando el throughput de 1,2 páginas/s reportado y el soporte de vLLM/SGLang para servir en paralelo.
- Extracción de datos de facturas y formularios: usar las capacidades de KIE para convertir documentos comerciales en campos estructurados (importes, fechas, emisores) y alimentar sistemas de contabilidad o ERP.
- Ingesta de documentación técnica: parsear manuales y papers con fórmulas y tablas para construir bases de conocimiento o índices de búsqueda, gracias al manejo específico de fórmulas y tablas.
- Automatización de back office: integrar el modelo en pipelines internos mediante el SDK de pip o la API para clasificar y extraer información de documentos entrantes sin enviar datos a terceros (self-hosting).
- Digitalización en movilidad: usar la app iOS offline para capturar y parsear documentos en campo, sin conexión, gracias al tamaño de 1,3B y a la cuantización.
- Procesamiento de documentos chino-inglés: digitalizar documentación bilingüe (contratos, aduanas, documentación técnica) con un único modelo que cubre ambos idiomas.
- Construcción de agentes documentales: emplear el Agent Skill para que un agente instale el modelo y parsee el primer documento con un solo prompt, útil en prototipado rápido.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Real5-OmniDocBench | 93,68 |
| OCRBench v2 | 54,7 |
| OmniDocBench v1.6 | líder entre modelos open source comparados (sin cifra en la información disponible) |
| Wild-OmniDocBench | líder entre modelos open source comparados (sin cifra en la información disponible) |
| olmOCR-Bench | líder entre modelos open source comparados (sin cifra en la información disponible) |
| Throughput | 1,2 páginas/s; 1,49× PaddleOCR-VL-1.6 y 3,62× MinerU2.5 Pro |

Los resultados corresponden al modelo base según la model card; no se han publicado en la información disponible cifras específicas de esta variante AWQ. La media de los cuatro benchmarks de parseo es la más alta entre los modelos OCR open source comparados, según el autor.

## Requisitos de hardware

- VRAM estimada: al tratarse de una cuantización AWQ 4-bit de un modelo de 1,3B, el repo ocupa 1,9 GB; la inferencia cabe holgadamente en GPUs consumer de 8 GB o menos, aunque no se dispone de cifras oficiales de VRAM en la información proporcionada.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, cualquier GPU consumer moderna (RTX 3060/4060 en adelante) es suficiente. Para servir en producción con vLLM o SGLang se recomiendan GPUs de datacenter (A100, H100) por throughput, aunque no se han publicado cifras de latencia por GPU.
- Cabe en GPU consumer: sí, por el tamaño del repo (1,9 GB) y los 1,3B parámetros.
- Opciones de despliegue: vLLM, SGLang, llama.cpp, Ollama, imagen Docker oficial, SDK de pip y API.
- Latencia y throughput: 1,2 páginas/s reportado para el modelo base; no hay datos específicos de la variante AWQ ni desglose por hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0-AWQ | 1,3B | no disponible | 93,68 Real5-OmniDocBench; 54,7 OCRBench v2 | Apache 2.0 | HF, vLLM, SGLang, llama.cpp, Ollama |
| PaddleOCR-VL-1.6 | no disponible | no disponible | referencia de throughput (1,49× menor según el autor) | no disponible | no disponible |
| MinerU2.5 Pro | no disponible | no disponible | referencia de throughput (3,62× menor según el autor) | no disponible | no disponible |

La información disponible solo identifica a PaddleOCR-VL-1.6 y MinerU2.5 Pro como referencias de comparación de throughput; no se aportan sus parámetros, contexto ni licencia, por lo que la comparativa completa no está disponible.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en otros idiomas no está documentado.
- Longitud de contexto: no disponible, lo que impide planificar el procesamiento de documentos muy extensos sin pruebas previas.
- Alucinación: como todo modelo generativo aplicado a OCR, puede producir texto plausible pero incorrecto en regiones de baja calidad; no se documentan tasas de error.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Cuantización: esta variante AWQ 4-bit puede degradar ligeramente la precisión respecto al modelo BF16; no se publican métricas comparativas entre ambas variantes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los componentes y datos de entrenamiento, no detalladas.
- Producción: la app móvil de parseo de documentos es solo para iOS por ahora; el resto de plataformas móviles no está cubierto.
- DSpark: la aceleración de decodificación se ofrece en variantes BF16 y GGUF, no en esta AWQ, por lo que la mejora del 55 % no aplica directamente a este repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM-OCR-1.0-AWQ
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Variante DSpark (BF16): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark
- Variante DSpark (GGUF): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-DSpark-gguf
- GitHub: https://github.com/OpenBMB/MiniCPM-OCR
- Familia MiniCPM-V/o: https://github.com/openbmb/MiniCPM-V
- Guía de despliegue: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_tutorial_en.md
- Agent Skill: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/SKILL_en.md
- Guía de reproducción de benchmarks: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/benchmark_reproduction_en.md
- Guía del modelo: https://github.com/OpenBMB/MiniCPM-OCR/blob/main/docs/minicpm_ocr_1dot0_en.md
- Demo iOS: https://github.com/OpenBMB/MiniCPM-V-Apps/blob/main/README.md#11-ios-demo
- Playground (global): https://platform.modelbest.ai/console/playground/document-parse
- Playground (China): https://platform.modelbest.cn/console/playground/document-parse
- Documentación de API (global): https://platform.modelbest.ai/console/docs/api/document-parse
- Documentación de API (China): https://platform.modelbest.cn/console/docs/api/document-parse
- Discord: https://discord.gg/JE8KQqtdn
