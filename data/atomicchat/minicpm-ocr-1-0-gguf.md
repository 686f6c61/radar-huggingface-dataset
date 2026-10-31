# AtomicChat/MiniCPM-OCR-1.0-GGUF

## Resumen

MiniCPM-OCR 1.0 GGUF es una colección de cuantizaciones en formato GGUF del modelo openbmb/MiniCPM-OCR-1.0 de OpenBMB, publicada por AtomicChat. El modelo base es un modelo multimodal de visión-lenguaje de aproximadamente 752 millones de parámetros (1.3B según la denominación de OpenBMB) especializado en reconocimiento óptico de caracteres y análisis de documentos: convierte imágenes de páginas en texto, tablas en HTML, fórmulas en LaTeX y es capaz de interpretar gráficos y sellos, en chino e inglés.

Esta versión cuantizada resuelve un problema práctico concreto: permitir ejecutar un modelo OCR de documentos en hardware modesto mediante llama.cpp, con archivos que ocupan desde 0,53 GB (texto) más 0,62 GB (proyector de visión). AtomicChat ha validado cada cuantización sobre 40 páginas reales de OmniDocBench, comparando el error de lectura frente al original en BF16, con métricas KLD y de divergencia top-1 publicadas abiertamente. Es relevante porque ofrece una alternativa local, ligera y con licencia Apache 2.0 a servicios OCR comerciales, con degradación mínima de calidad respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal visión-lenguaje (familia MiniCPM-V), transformer con proyector de visión |
| Parametros totales | 752.167.744 (dato real de safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M (texto); Q8_0 y F16 (proyector de visión) |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM-OCR-1.0, pertenece a la familia MiniCPM-V de OpenBMB y combina un modelo de lenguaje transformer con un proyector de visión (distribuido en el repositorio como archivo `mmproj` separado, requisito obligatorio para inferir). Está especializado en la tarea de transcripción de documentos: texto en páginas, tablas (salida en HTML), fórmulas matemáticas (salida en LaTeX), gráficos y sellos, operando en chino e inglés. Los detalles de preentrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La innovación principal de esta publicación es el proceso de cuantización: AtomicChat emplea cuantizaciones del tipo AD (con matriz de importancia, `imatrix`), que según sus mediciones reducen a la mitad la deriva del modelo de texto frente a cuantizaciones estándar del mismo tamaño (KLD a BF16 de 0,087 frente a 0,165 en AD-Q4_K_M a 0,53 GB; 0,027 frente a 0,051 en AD-Q5_K_M). Además, la model card documenta un borrador especulativo (DSpark de OpenBMB) que acelera la generación un 1,7x con texto idéntico en 11 de 12 páginas evaluadas. La plantilla de chat embebida mantiene el modo de pensamiento desactivado, igual que la GGUF oficial de OpenBMB, ya que con la plantilla original `llama-server` devuelve la transcripción en `reasoning_content` con `content` vacío, y `llama-mtmd-cli` degrada la lectura (+6,6 puntos de error de carácter).

## Capacidades

- Transcripción OCR de imágenes de documentos a texto plano, en inglés y chino.
- Reconocimiento de tablas con salida estructurada en HTML.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Interpretación de gráficos (charts) y sellos en documentos.
- Análisis general de documentos (document parsing) sobre diapositivas, artículos, libros, manuales, exámenes, documentos históricos, revistas, periódicos, notas e informes.
- Interacción conversacional multimodal (image-text-to-text): preguntas sobre una página y extracción de información a JSON, según las mediciones KLD sobre prompts de formato libre.
- Ejecución 100% local vía llama.cpp, con soporte en Atomic Chat (motor b11946 o posterior).
- No se documenta soporte de tool calling, agentes ni capacidades de audio.

## Casos de uso

- Digitalización de archivos documentales: transcripción masiva de páginas escaneadas (informes, actas, correspondencia) en local, sin enviar datos a terceros, gracias al tamaño reducido y la licencia permisiva.
- Extracción de tablas a HTML: convertir tablas de PDFs escaneados o fotos de documentos en HTML estructurado para su posterior importación a hojas de cálculo o bases de datos.
- Transcripción de fórmulas a LaTeX: digitalizar apuntes de matemáticas, exámenes y artículos científicos para integrarlos en editores LaTeX o plataformas de e-learning.
- Procesamiento de documentos multilingües chino-inglés: útil en flujos de trabajo que mezclan documentación en ambos idiomas, como facturación internacional o revisión de contratos.
- OCR en dispositivos de recursos limitados: con el conjunto completo desde 1,15 GB en disco (AD-Q4_K_M + proyector Q8_0), es viable en portátiles sin GPU dedicada o en servidores pequeños.
- Preprocesamiento para RAG documental: convertir imágenes de páginas en texto y estructuras (tablas HTML) que alimenten un índice de búsqueda vectorial, evitando servicios OCR de pago.
- Transcripción de documentos históricos y prensa archivada: el conjunto de evaluación incluye documentos históricos, periódicos y revistas, escenarios típicos de bibliotecas digitales y humanidades.
- Automatización de entrada de datos: extracción de texto y estructuras de formularios y notas escaneadas como paso previo a pipelines de validación y almacenamiento.

## Benchmarks y rendimiento

AtomicChat publica mediciones propias de la cuantización, no benchmarks estándar del modelo base. Evaluación sobre 40 páginas de OmniDocBench (4 de cada una de 10 fuentes, inglés y chino, prompt `Text Recognition:`, decodificación greedy, llama.cpp b11953). La referencia BF16 original lee estas páginas con un error medio de carácter del 21,6% frente a la anotación (mediana 13,1%); gran parte se atribuye a diferencias de formato (orden de lectura y convenciones de marcado), por lo que la métrica sirve para comparar archivos entre sí.

| Archivo | Tamano en disco | Paginas a menos del 1% del original | Error de lectura vs original (puntos, IC 95%) | KLD / top-1 del modelo de texto |
|---|---|---|---|---|
| Q8_0 | 0,81 GB | 30/40 | +0,2 [-0,8, +1,1] | 0,0039 / 96,1% |
| AD-Q6_K | 0,73 GB | 32/40 | +0,3 [-0,2, +0,8] | 0,0064 / 95,0% |
| AD-Q5_K_M (recomendado) | 0,59 GB | 27/40 | +1,5 [+0,1, +3,2]; con proyector Q8_0: -0,3 [-1,5, +0,7] | 0,0266 / 89,9% |
| AD-Q4_K_M | 0,53 GB | 19/40 | -0,4 [-4,2, +2,6] | 0,0871 / 83,4% |
| Proyector de visión Q8_0 | 0,62 GB | 33/40 (con modelo de texto BF16) | -0,7 [-1,9, +0,3] | no disponible |
| Proyector de visión F16 (referencia) | 0,90 GB | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada: el conjunto completo ocupa desde 1,15 GB en disco (AD-Q4_K_M de 0,53 GB + proyector Q8_0 de 0,62 GB); la configuración más fiel (Q8_0 + F16) ronda 1,71 GB. En inferencia con contexto, es razonable estimar entre 2 y 4 GB de RAM o VRAM, aunque el dato exacto no está disponible.
- GPU recomendadas: no requiere GPU dedicada; al ser un modelo de menos de 1 GB de pesos cuantizados, funciona en CPU. En GPU, cualquier tarjeta con 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060 o superiores) es más que suficiente.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU moderna de consumo, incluidas las de gama de entrada, e incluso es viable íntegramente en CPU.
- Opciones de despliegue: llama.cpp (requisito principal; probado con builds b11946-b11953, mediante `llama-server` o `llama-mtmd-cli`), Atomic Chat (con soporte de entrada de imágenes), y por extensión Ollama y LM Studio al tratarse de GGUF, aunque no se documenta explícitamente. Es obligatorio cargar un proyector de visión (`--mmproj`).
- Rendimiento: generación 1,7x más rápida con el borrador especulativo DSpark de OpenBMB (texto idéntico en 11 de 12 páginas). Latencias absolutas no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 GGUF (AtomicChat) | 752M | GGUF (Q4 a Q8) | OCR de documentos, tablas, formulas | Apache 2.0 | Cuantizaciones validadas pagina a pagina; desde 1,15 GB en disco |
| MiniCPM-OCR 1.0 (openbmb, original) | 752M | BF16 GGUF / safetensors | OCR de documentos, tablas, formulas | Apache 2.0 | Referencia de calidad; par minimo recomendado de OpenBMB: 1,43 GB |
| GGUF de prithivMLmods del mismo modelo | 752M | GGUF | OCR de documentos | no disponible | Incluido en la comparativa de AtomicChat; calidad medida en las mismas 40 paginas (ver grafico size-vs-error) |

Otros competidores de la categoria (por ejemplo, modelos OCR ligeros de otras familias) no disponen de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- El error medio de carácter del modelo original frente a la anotación de OmniDocBench es del 21,6% (mediana 13,1%); parte corresponde a diferencias de formato y convenciones, pero indica que la transcripción no es perfecta y conviene validar en el dominio de destino.
- Las cuantizaciones más agresivas degradan la calidad: AD-Q4_K_M solo coincide con el original en 19/40 páginas; por debajo de 0,53 GB algunas páginas entran en bucles de repetición hasta el límite de tokens (2 de 40 a 0,45 GB), motivo por el cual AtomicChat no publica esos archivos.
- La plantilla de chat embebida mantiene el thinking desactivado deliberadamente; usar la plantilla original degrada la lectura (+6,6 puntos de error) y hace que `llama-server` devuelva la salida en `reasoning_content` con `content` vacío.
- Solo soporta inglés y chino; no sirve para documentos en otros idiomas.
- El dataset de evaluación (OmniDocBench) es de uso exclusivo de investigación, por lo que el texto de las páginas no se republica; esto no afecta al modelo en sí, con licencia Apache 2.0 apta para uso comercial.
- Sesgos conocidos, riesgo de alucinación específico y longitud de contexto no están documentados en la información disponible; como en todo modelo OCR, cabe esperar errores en manuscritos difíciles, sellos superpuestos o escaneos de baja calidad.
- Cada archivo de texto requiere descargar además un proyector de visión (`mmproj`); omitirlo impide la inferencia multimodal.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/AtomicChat/MiniCPM-OCR-1.0-GGUF
- Modelo base original: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Repositorio de métricas (16 tamaños, página a página): https://huggingface.co/datasets/AtomicChat/MiniCPM-OCR-1.0-GGUF-metrics
- Dataset de evaluación: https://huggingface.co/datasets/opendatalab/OmniDocBench
- Atomic Chat (demo con soporte de imágenes): https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter) de AtomicChat: https://x.com/atomic_chat_hq
- Paper del modelo base: no disponible
- Demo independiente: no disponible
