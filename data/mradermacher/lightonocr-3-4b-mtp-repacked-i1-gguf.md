# mradermacher/LightOnOCR-3-4B-MTP-Repacked-i1-GGUF

## Resumen

LightOnOCR-3-4B-MTP-Repacked-i1-GGUF es una cuantización GGUF generada por mradermacher a partir del modelo LightOnOCR-3-4B-MTP-Repacked, publicado originalmente por prithivMLmods. Se trata de un modelo de visión-lenguaje orientado a OCR y comprensión de documentos: extracción de texto de PDF, tablas, formularios y localización visual de elementos (visual grounding). El repositorio contiene únicamente archivos imatrix y cuantizaciones de tipo IQ, no los pesos completos en precisión original.

El modelo base, según la información disponible, tiene aproximadamente 4,54 mil millones de parámetros en configuración densa (dato de OSYNK), aunque la model card del repositorio GGUF declara 1.797.272 parámetros en safetensors, cifra que probablemente corresponde a un componente parcial (por ejemplo, el proyector multimodal) y no al total. Esta discrepancia debe tenerse en cuenta antes de cualquier despliegue.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo OCR de 4B en hardware de consumo mediante llama.cpp, con licencia Apache 2.0 y soporte declarado solo para inglés. No hay benchmarks publicados ni métricas de calidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal); detalles internos no disponibles |
| Parametros totales | ~4,54B según OSYNK; 1.797.272 declarados en safetensors (probable componente parcial) |
| Parametros activos | no disponible (modelo denso según OSYNK) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (imatrix/weighted) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su carácter multimodal (visión-lenguaje) y su uso para OCR y comprensión de documentos. OSYNK lo clasifica como denso con una configuración híbrida 8/32, pero no se especifican capas, cabezas de atención ni mecanismo de atención. El sufijo "MTP" en el nombre sugiere multi-token prediction, aunque no hay confirmación técnica en la documentación proporcionada.

Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El repositorio de mradermacher es exclusivamente una recuantización: no aporta información sobre el proceso de entrenamiento original. Se desconoce igualmente si el modelo base incorpora decodificación especulativa, atención lineal u otras innovaciones.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y páginas de documentos.
- Comprensión de documentos PDF, incluyendo tablas y formularios.
- Localización visual (visual grounding) de elementos en la imagen.
- Generación de texto condicionada por imagen (pipeline vision-language).
- Integración con llama.cpp y text-generation-inference mediante formato GGUF.
- Soporte multilingüe limitado al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Digitalización de facturas y formularios: el modelo puede extraer campos estructurados de imágenes de documentos escaneados, aprovechando su entrenamiento específico en formularios y tablas.
- Extracción de tablas de informes PDF: útil para pipelines de ingestión de datos donde se necesita convertir tablas impresas en estructuras parseables.
- Procesamiento de documentos en local: al distribuirse en GGUF, puede ejecutarse con llama.cpp en estaciones de trabajo sin GPU dedicada, lo que facilita el cumplimiento de requisitos de privacidad.
- Indexación de archivos escaneados para búsqueda interna: combinado con un motor de búsqueda, permite generar texto plano a partir de imágenes para su indexación posterior.
- Automatización de entrada de datos en back office: integrado en un servicio que recibe imágenes y devuelve texto, reduce la transcripción manual en flujos administrativos.
- Localización de regiones de interés en documentos: el grounding visual permite recortar o resaltar secciones concretas (firmas, sellos, campos) antes de pasarlas a otro modelo.
- Preprocesado para pipelines RAG sobre documentación corporativa: convierte PDFs escaneados en texto que luego se trocea y se embebe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; para un modelo de ~4,5B en Q4_K_M se puede estimar en torno a 3-4 GB de pesos, más el proyector multimodal (mmproj), aunque no hay cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cabría en RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4; no se confirma compatibilidad.
- GPU de consumo: probablemente sí en cuantizaciones Q4/IQ4, pero sin verificación publicada.
- Despliegue: llama.cpp (formato nativo GGUF), text-generation-inference (según tags), y potencialmente Ollama si se empaqueta el mmproj.
- Latencia y throughput: no disponibles.
- Nota: los archivos mmproj, necesarios para el modo visión, están en el repositorio estático (mradermacher/LightOnOCR-3-4B-MTP-Repacked-GGUF), no en este repositorio i1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B-MTP-Repacked-i1-GGUF (este) | ~4,5B (según OSYNK) | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantización de comunidad, solo inglés |
| prithivMLmods/LightOnOCR-3-4B-MTP-Repacked | no disponible | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva este |
| mradermacher/LightOnOCR-3-4B-MTP-Repacked-GGUF | no disponible | no disponible | Apache 2.0 | GGUF (estático) | Incluye mmproj para visión |

No se dispone de información suficiente para comparar con alternativas OCR de otros autores (por ejemplo, modelos tipo Donut, TrOCR o Qwen-VL) en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está verificado.
- No hay benchmarks publicados, por lo que la calidad real del OCR y del grounding es desconocida.
- Discrepancia entre los parámetros declarados en safetensors (1.797.272) y los reportados por OSYNK (~4,54B): conviene validar el tamaño real antes de planificar recursos.
- Este repositorio contiene solo el archivo imatrix y cuantizaciones IQ; los archivos mmproj necesarios para el modo visión están en el repositorio estático, lo que puede complicar el despliegue.
- Riesgo de alucinación en la extracción de texto: los modelos OCR generativos pueden inventar caracteres o campos, especialmente en cuantizaciones agresivas (Q2, IQ2, IQ1).
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribución y verificarse las condiciones del modelo base.
- Al ser una recuantización de comunidad, no hay garantía de mantenimiento ni soporte oficial.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse en integraciones complejas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/LightOnOCR-3-4B-MTP-Repacked-i1-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/LightOnOCR-3-4B-MTP-Repacked
- Repositorio GGUF estático (incluye mmproj): https://huggingface.co/mradermacher/LightOnOCR-3-4B-MTP-Repacked-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#LightOnOCR-3-4B-MTP-Repacked-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- OSYNK (ficha del modelo base): https://osynk.com/
- Referencia sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
