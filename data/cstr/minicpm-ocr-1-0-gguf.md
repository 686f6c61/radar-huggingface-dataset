# cstr/MiniCPM-OCR-1.0-GGUF

## Resumen

MiniCPM-OCR-1.0 es un modelo multimodal de tipo image-text-to-text especializado en reconocimiento óptico de caracteres (OCR), desarrollado originalmente por OpenBMB. Esta ficha describe la conversión a formato GGUF publicada por el usuario `cstr` bajo el paraguas del proyecto CrispEmbed, que adapta los pesos originales en BF16 safetensors a un runtime nativo basado en ggml. El modelo combina un codificador visual SigLIP con un decodificador derivado de Qwen3.5, según las etiquetas del repositorio, y está pensado para tareas de extracción de texto en imágenes, tablas y documentos.

El interés de esta publicación no reside en un modelo nuevo, sino en la disponibilidad de pesos cuantizados en GGUF que pueden ejecutarse en CPU mediante CrispEmbed, una alternativa a llama.cpp que implementa su propio runtime. Los archivos publicados incluyen tres precisiones: F16, Q8_0 y una variante Q4_K_MIX marcada como experimental. La conversión preserva la licencia Apache 2.0 del modelo original y documenta de forma exhaustiva el proceso de conversión, los hashes SHA256 y las pruebas de paridad frente al modelo original.

La relevancia actual de esta ficha es doble: por un lado, permite evaluar un modelo OCR compacto de aproximadamente 1.300 millones de parámetros con licencia permisiva; por otro, ilustra las prácticas de reproducibilidad y verificación de paridad que un proyecto de cuantización debería documentar antes de publicar artefactos derivados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text; codificador visual SigLIP y decodificador derivado de Qwen3.5 (según etiquetas del repositorio) |
| Parámetros totales | 1.300.434.160 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q4_K_MIX (experimental) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (runtime nativo de CrispEmbed; no compatible con llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que apuntan a una combinación de codificador visual SigLIP y decodificador basado en Qwen3.5. El modelo original fue publicado por OpenBMB en la revisión `6796197bb3a8e224b2f64ae462bfbb3f8a15ac4b`, con pesos en BF16 safetensors. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La contribución de esta publicación es exclusivamente de formato: los pesos se convirtieron a GGUF mediante el script `models/convert-minicpm-ocr-to-gguf.py` del proyecto CrispEmbed, con renombrado de tensores, conversión de BF16 a F32/F16 y embebido de metadatos del tokenizador y del preprocesado. Las variantes cuantizadas se generaron con la herramienta propia `crispembed-quantize`, aplicando la receta `q8_0` para Q8_0 y la política `minicpm_q4k_v1` para Q4_K_MIX. Los tensores unidimensionales (normas, sesgos) se mantienen en F32. No se entrenó, ajustó ni fusionó ningún peso.

## Capacidades

- Reconocimiento de texto en imágenes (OCR) mediante prompts de tarea, por ejemplo `Text Recognition:`.
- Procesamiento de imágenes de entrada y generación de texto de salida en un pipeline image-text-to-text.
- Manejo de distintos tipos de contenido visual según los casos de referencia documentados: líneas de texto, párrafos en inglés, tablas, imágenes de formato alto y texto de pequeño tamaño.
- Generación autorregresiva con decodificación greedy verificada hasta 1024 tokens nuevos en las pruebas de paridad.
- Soporte de conversación (etiqueta `conversational` en el repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, audio ni modos de pensamiento explícitos.

## Casos de uso

- Digitalización de documentos escaneados: el modelo puede extraer texto de páginas completas procesando la imagen con el prompt de reconocimiento, adecuado por su tamaño compacto y su licencia Apache 2.0 para integrarse en pipelines internos.
- Extracción de tablas en informes y facturas: los casos de referencia incluyen una prueba específica de tabla (`table`, 56 tokens generados), lo que permite validar el comportamiento en estructuras tabulares antes de desplegar en producción.
- Procesamiento por lotes en CPU sin GPU: las variantes Q8_0 y F16 se ejecutan en el runtime nativo de CrispEmbed, lo que facilita el despliegue en servidores sin acelerador dedicado, a costa de throughput limitado.
- Preprocesado de corpus para entrenamiento o búsqueda: la salida OCR puede alimentar etapas posteriores de indexación o anotación, siempre que se acepte la licencia permisiva del modelo.
- Verificación de calidad en entornos con requisitos de reproducibilidad: el repositorio documenta hashes SHA256, recibos de paridad y comparaciones token a token frente al original, lo que resulta útil en auditorías de pipelines documentales.
- Prototipado de aplicaciones de accesibilidad: conversión de texto impreso a texto digital en aplicaciones de lectura asistida, con la advertencia de que el rendimiento en documentos reales no está medido.
- Evaluación comparativa de cuantizaciones: la publicación sirve como caso de estudio para medir la degradación de Q4_K_MIX frente a Q8_0 en tareas OCR sensibles a glifos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye, en cambio, pruebas de paridad frente al modelo original en CPU con decodificación greedy sobre cinco casos de referencia:

| Precisión | Tamaño (bytes) | Tokens idénticos vs original (5 casos) | Texto decodificado / CER | Coseno de logits finales mínimo | Estado |
|---|---:|---|---|---|---|
| F16 | 2.612.763.136 | 5/5 exactos | idéntico al original (CER 0) | no medido | recomendado |
| Q8_0 | 1.525.926.080 | 5/5 exactos a 2 y 4 hilos | idéntico al original (CER 0) | 0,9998 (caso `para-en`) | recomendado |
| Q4_K_MIX | 1.017.943.296 | 4/5 exactos; `para-en` diverge en el token 54 | 4/5 idénticos; `para-en` lee umlauts como `Gr×e, Stra×e, ×pfel` | 0,9671 (peor caso, `para-en`) | experimental |

Los casos de referencia generan 19, 63, 56, 279 y 3 tokens respectivamente (`line`, `para-en`, `table`, `tall`, `tiny`). No se han medido los backends de GPU, los documentos multipágina, los benchmarks de calidad a nivel de tarea ni prompts distintos de las tareas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los archivos, F16 requiere al menos 2,6 GB de memoria para los pesos, Q8_0 unos 1,5 GB y Q4_K_MIX alrededor de 1,0 GB, más el espacio para el codificador visual, el contexto y las activaciones.
- GPU recomendadas: no disponible; la model card indica que los backends de GPU no han sido verificados.
- Compatibilidad con GPU de consumo: probable por tamaño de pesos en Q8_0 y Q4_K_MIX, pero no verificada por el autor.
- Opciones de despliegue: runtime nativo de CrispEmbed con las variables `CRISPEMBED_MINICPM_OCR=1` y `CRISPEMBED_QWEN35_OCR=1`. Los archivos no son cargables por llama.cpp.
- Latencia y throughput: no disponibles; las pruebas de paridad se ejecutaron en CPU con decodificación greedy, sin cifras de rendimiento publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. A continuación se comparan únicamente características estructurales verificables:

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM-OCR-1.0 (esta conversión GGUF) | 1.300.434.160 | no disponible | GGUF (CrispEmbed) | Apache 2.0 | Runtime propio, no compatible con llama.cpp |
| openbmb/MiniCPM-OCR-1.0 (original) | 1.300.434.160 | no disponible | safetensors BF16 | Apache 2.0 | Modelo de referencia; requiere Transformers |
| openbmb/MiniCPM-OCR-1.0-gguf | no disponible | no disponible | GGUF (llama.cpp) | no disponible en esta ficha | Conversión oficial para llama.cpp, distinta de esta |

No se han identificado en la información proporcionada otros modelos OCR comparables con datos de rendimiento verificables.

## Limitaciones y advertencias

- La variante Q4_K_MIX está marcada como experimental: no es token-ID exacta en todos los casos y falla en la lectura de umlauts y glifos de caja en el caso `para-en`; no debe usarse donde se requiera coincidencia exacta con el original.
- La calidad en páginas reales representativas no se ha medido; las pruebas se limitan a cinco casos sintéticos de referencia.
- Los backends de GPU no están verificados; solo se ha validado la ejecución en CPU con decodificación greedy.
- No se ha evaluado el comportamiento en documentos multipágina ni con prompts distintos de las tareas de referencia.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática; la lista de idiomas no está disponible.
- Los archivos no son compatibles con llama.cpp; deben cargarse con CrispEmbed, lo que limita la portabilidad frente a otras herramientas del ecosistema.
- El soporte de MiniCPM-OCR en CrispEmbed es experimental y está desactivado por defecto, lo que requiere variables de entorno específicas.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión no ofrece garantías sobre los artefactos derivados; se recomienda validar la paridad en el dominio de uso concreto.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/cstr/MiniCPM-OCR-1.0-GGUF
- Modelo original: https://huggingface.co/openbmb/MiniCPM-OCR-1.0/tree/6796197bb3a8e224b2f64ae462bfbb3f8a15ac4b
- Repositorio de código original: https://github.com/OpenBMB/MiniCPM-OCR
- Proyecto CrispEmbed: https://github.com/CrispStrobe/CrispEmbed
- Conversión oficial para llama.cpp (distinta de esta): https://huggingface.co/openbmb/MiniCPM-OCR-1.0-gguf
