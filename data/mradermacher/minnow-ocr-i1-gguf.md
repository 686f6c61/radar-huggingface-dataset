# mradermacher/Minnow-OCR-I1-GGUF

## Resumen

Minnow-OCR-I1-GGUF es una colección de cuantizaciones en formato GGUF del modelo KiteFishAI/Nano-OCR-1B, un modelo especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos. Las cuantizaciones han sido generadas por mradermacher, un conocido publicador de versiones GGUF de modelos open source, a partir de los pesos originales del modelo base desarrollado por KiteFishAI.

El modelo base cuenta con aproximadamente 891 millones de parámetros y está diseñado para despliegues on-premise en entornos empresariales, con soporte para inglés e hindi. La versión GGUF incluye un proyector multimodal (mmproj) que permite procesar imágenes junto con texto, lo que lo habilita para tareas de extracción de texto a partir de imágenes de documentos.

La relevancia de esta ficha radica en que ofrece una alternativa ligera (menos de 1.000 millones de parámetros) para OCR y comprensión de documentos en infraestructura local, con cuantizaciones que van desde 0,5 GB hasta 1,9 GB, lo que facilita su despliegue en hardware de consumo y sistemas sin GPU dedicada de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector de visión, segun los ficheros mmproj) |
| Parametros totales | 891.138.048 (aproximadamente 891 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | ingles (en), hindi (hi) |
| Licencia | MIT |
| Formato de pesos | GGUF (con ficheros mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base KiteFishAI/Nano-OCR-1B en la información proporcionada. Los metadatos de la cuantización indican que se trata de un modelo multimodal, ya que se incluyen ficheros `mmproj` (proyector multimodal) que acompañan a los pesos principales y permiten el procesamiento de imágenes. El tamaño de 891 millones de parámetros sugiere un transformer compacto, probablemente con un codificador visual acoplado a un decodificador de lenguaje.

Tampoco se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio de cuantización es la generada automáticamente por mradermacher y no incluye detalles sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- Comprensión de documentos: extracción de texto estructurado a partir de imágenes.
- Procesamiento multimodal imagen-texto gracias al proyector mmproj incluido en la cuantización.
- Soporte de conversación multi-turno (etiqueta `conversational` en los metadatos).
- Capacidades multilingües limitadas a inglés e hindi.
- Compatible con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Orientado a despliegue on-premise y entornos empresariales.

## Casos de uso

- Digitalización de archivos administrativos: el modelo puede procesar imágenes escaneadas de documentos y extraer el texto para su indexación en sistemas de gestión documental, aprovechando su naturaleza ligera para ejecutarse en servidores modestos.
- Facturación y contabilidad automatizada: extracción de campos de facturas y recibos en inglés o hindi, integrándose en pipelines de contabilidad que requieran procesamiento local sin enviar datos a la nube.
- Procesamiento de documentos en hindi: para organizaciones que operan en India o gestionan documentación en hindi, el modelo ofrece OCR nativo en ese idioma, algo poco habitual en modelos de este tamaño.
- Despliegue en el edge o en hardware de consumo: con cuantizaciones desde 0,5 GB (Q2_K) hasta 1,1 GB (Q8_0), puede ejecutarse en portátiles o mini-PC sin GPU dedicada mediante llama.cpp u Ollama, útil para aplicaciones de campo.
- Cumplimiento normativo y soberanía del dato: al ser un modelo MIT desplegable on-premise, encaja en sectores regulados (salud, legal, administración pública) donde no se permite enviar documentos a servicios externos.
- Extracción de texto en aplicaciones móviles o embebidas: el tamaño reducido del modelo permite integrarlo en aplicaciones que necesiten OCR local sin conectividad, por ejemplo en digitalización de notas o tarjetas de visita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB (Q2_K) hasta 1,9 GB (f16) para los pesos, más el proyector multimodal (0,6 GB en Q8_0 o 1,0 GB en f16). En la práctica, entre 1 y 3 GB de memoria total según la cuantización elegida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060). Para mayor throughput, RTX 4090 o A100/H100 aunque el modelo es demasiado pequeño para aprovecharlas plenamente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF. El formato mmproj es compatible con llama.cpp para el procesamiento de imágenes.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia baja en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Minnow-OCR-I1-GGUF (este) | ~891 M | no disponible | en, hi | MIT | GGUF |
| KiteFishAI/Nano-OCR-1B (base) | ~891 M | no disponible | en, hi | MIT | safetensors/transformers |
| Alternativas OCR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar el repositorio del modelo base para obtener referencias adicionales.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés e hindi; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto que no aparece en la imagen, especialmente en documentos con baja calidad o ruido.
- Sin datos de benchmarks: no hay métricas publicadas que permitan evaluar su precisión frente a alternativas, lo que dificulta la comparación objetiva.
- Contexto desconocido: se desconoce la longitud máxima de contexto, lo que puede limitar el procesamiento de documentos muy extensos o múltiples páginas.
- Cuantizaciones de baja calidad: las versiones Q2_K y Q3_K pueden degradar notablemente la precisión del OCR; se recomienda Q4_K_M o superior para producción.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Modelo de nicho: con solo 186 descargas y 0 likes en el momento de la consulta, la comunidad es reducida y el soporte puede ser limitado.
- Fecha de creación futura en los metadatos (2026): conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo en producción.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/Minnow-OCR-I1-GGUF
- Modelo base: https://huggingface.co/KiteFishAI/Nano-OCR-1B
- Página de descargas de mradermacher: https://hf.tst.eu/model#Minnow-OCR-I1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
