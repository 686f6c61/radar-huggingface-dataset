# mradermacher/Kadoe-4B-GGUF

## Resumen

Kadoe-4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Kadoe-4B, un modelo conversacional multimodal de unos 4.200 millones de parámetros desarrollado por aungzaythant y orientado a los idiomas birmano (myanmar) e inglés. La cuantización ha sido realizada por mradermacher, un cuantizador muy activo en la comunidad de Hugging Face conocido por publicar versiones GGUF de gran parte de los modelos que aparecen en la plataforma.

El modelo original destaca por combinar capacidades de chat con visión y OCR, algo poco habitual en modelos centrados en el idioma birmano, un idioma con recursos limitados y con un sistema de escritura complejo que suele plantear dificultades a los LLM convencionales. Esto lo convierte en una opción relevante para desarrolladores que necesiten procesar texto birmano en local, incluyendo tareas de reconocimiento óptico de caracteres.

Esta ficha describe el repositorio de cuantizaciones, no el modelo base. Las versiones disponibles van desde Q2_K (2,0 GB) hasta f16 (8,5 GB), además de dos archivos mmproj (suplementos multimodales) necesarios para usar las capacidades de visión con llama.cpp. Existen también cuantizaciones weighted/imatrix en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal, según tags) |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | birmano (my), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado información técnica detallada sobre la arquitectura del modelo base Kadoe-4B. Los tags del repositorio indican que se trata de un modelo conversacional con capacidades multimodales (visión y OCR), con un tamaño de 4,21 mil millones de parámetros según los metadatos de safetensors. La presencia de archivos mmproj (proyectores multimodales) en formato GGUF confirma que el modelo incorpora un componente de visión que se gestiona por separado en llama.cpp.

Tampoco hay datos públicos sobre el corpus de entrenamiento, el número de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. En cuanto a esta colección concreta, mradermacher ha generado cuantizaciones estáticas en formato GGUF a partir de los pesos del modelo base, cubriendo el rango completo de calidades desde Q2_K hasta f16, e incluye el proyector multimodal en Q8_0 y f16 para habilitar las capacidades de visión.

## Capacidades

- Generación de texto conversacional en birmano e inglés, con formato de chat.
- Comprensión de imágenes (visión) mediante los archivos mmproj incluidos en el repositorio.
- OCR: reconocimiento de texto en imágenes, presumiblemente optimizado para escritura birmana, aunque el modelo base no detalla los conjuntos de datos usados.
- Ejecución local mediante llama.cpp, Ollama u otros runtimes compatibles con GGUF.
- No hay información sobre soporte de tool calling, function calling ni capacidades de agente.
- No hay información sobre modo de razonamiento extendido (thinking mode) ni procesamiento de audio.

## Casos de uso

- OCR de documentos en birmano: combinando los archivos mmproj con el modelo principal, se puede extraer texto de imágenes escaneadas o fotografías de documentos en escritura birmana, una tarea con muy pocas opciones en modelos open source.
- Asistentes conversacionales locales en Myanmar: el tamaño de 4B permite desplegar un chatbot bilingüe birmano-inglés en hardware modesto, incluso sin GPU dedicada con las cuantizaciones Q3/Q4.
- Traducción y asistencia lingüística birmano-inglés: útil para flujos de trabajo que mezclen ambos idiomas, como revisión de contenido localizado.
- Procesamiento de formularios y facturas escaneadas: la combinación de visión y OCR permite automatizar la digitalización de documentos con texto birmano en entornos sin conexión a la nube.
- Integración en aplicaciones móviles o de escritorio: las cuantizaciones Q2_K y Q3_K_S (2,0-2,2 GB) hacen viable su ejecución en portátiles con 8 GB de RAM.
- Prototipado de aplicaciones multimodales: Apache 2.0 permite usar el modelo en productos comerciales sin restricciones de licencia, lo que facilita pruebas de concepto con visión en este par de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco existen datos de evaluación (MMLU, HumanEval, GSM8K u otros) para el modelo base Kadoe-4B en el repositorio original consultado.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantización elegida, desde unos 2,5 GB (Q2_K) hasta unos 9-10 GB (f16). Con el suplemento multimodal mmproj-Q8_0 hay que añadir unos 0,5 GB adicionales.
- La cuantización recomendada Q4_K_M ocupa 2,8 GB, por lo que cabe con holgura en GPUs consumer como una RTX 3060 de 12 GB, RTX 4060 Ti o incluso en CPU con 8 GB de RAM.
- Para la variante f16 (8,5 GB) se recomienda una GPU con 12-16 GB de VRAM (RTX 4090, RTX 3090) o ejecutarlo en CPU con RAM suficiente.
- Despliegue: llama.cpp es el runtime de referencia para GGUF; también es compatible con Ollama, LM Studio, GPT4All y otros runtimes que soporten el formato. No hay información sobre compatibilidad con vLLM o TGI para esta versión cuantizada.
- Latencia y throughput: no disponibles; al tratarse de un modelo de 4B con cuantizaciones de 4 bits, se espera inferencia fluida en GPUs consumer modernas, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Idiomas destacados | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Kadoe-4B (esta ficha) | 4,21 B | Sí (visión, OCR) | Birmano, inglés | Apache 2.0 | Sí (mradermacher) |
| Qwen2.5-VL-3B | 3,75 B | Sí (visión, OCR) | Multilingüe (100+ idiomas, birmano incluido de forma limitada) | Qwen (Apache 2.0 con restricciones parciales) | Sí |
| Gemma 3 4B | 4,3 B | Sí (visión) | Multilingüe (140+ idiomas) | Gemma (restricciones de uso) | Sí |
| Llama 3.2 3B Vision | 3,2 B | Sí (visión) | Multilingüe (soporte limitado de birmano) | Llama Community (restricciones) | Sí |

La principal diferencia de Kadoe-4B frente a estas alternativas es su enfoque específico en el idioma birmano, mientras que los modelos generalistas multilingües suelen ofrecer rendimiento inferior en escritura birmana. A cambio, se desconoce su rendimiento en otras tareas y su contexto es un dato no disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones del modelo base, por lo que su calidad real (especialmente en OCR y comprensión birmana) debe validarse antes de usarlo en producción.
- Riesgo de alucinación: no cuantificado; como todo LLM de 4B, puede generar contenido incorrecto con fluidez, especialmente en temas técnicos.
- Longitud de contexto no documentada: es imprescindible verificarla en la configuración del modelo base antes de diseñar aplicaciones con documentos largos.
- Las cuantizaciones Q2_K y Q3_K_S implican una degradación de calidad notable respecto a los pesos originales; para producción se recomienda Q4_K_M o superior.
- La licencia Apache 2.0 del repositorio de cuantización no garantiza que el modelo base no tenga condiciones adicionales; conviene revisar la ficha de aungzaythant/Kadoe-4B.
- Sesgos conocidos: no documentados; al tratarse de un modelo entrenado presumiblemente con corpus birmano-inglés, puede mostrar sesgos propios de esos datos sin que exista auditoría publicada.
- Las capacidades de visión requieren cargar el archivo mmproj correspondiente además del modelo principal; omitirlo desactiva la multimodalidad.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Kadoe-4B-GGUF
- Modelo base: https://huggingface.co/aungzaythant/Kadoe-4B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Kadoe-4-i1-GGUF (enlace indicado en la model card: https://huggingface.co/mradermacher/Kadoe-4B-i1-GGUF)
- Página de descargas resumida: https://hf.tst.eu/model#Kadoe-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
