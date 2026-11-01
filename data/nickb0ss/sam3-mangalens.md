# NickB0ss/sam3-mangalens

## Resumen

SAM 3 (Segment Anything Model 3) es el modelo de segmentación de imágenes y vídeo desarrollado por Meta (Facebook). Esta ficha concreta, `NickB0ss/sam3-mangalens`, no es un modelo nuevo ni un fine-tuning: es una copia sin modificaciones de los pesos oficiales de `facebook/sam3`, redistribuida por un tercero para que la aplicación MangaLens pueda descargar el modelo sin exigir una cuenta de Hugging Face al usuario final. El autor lo declara explícitamente en la model card.

El modelo resuelve el problema de la segmentación promptable: dado un prompt (punto, caja, máscara o texto, según la variante), devuelve máscaras de segmentación de alta calidad para los objetos indicados, tanto en imágenes estáticas como en vídeo (el tag `sam3_video` confirma el soporte de la variante de vídeo). Es relevante porque SAM 3 extiende la familia SAM con capacidad de segmentación guiada por conceptos y seguimiento temporal en vídeo.

El repo contiene 859.922.360 parámetros en formato safetensors (aproximadamente 860 M), con un tamaño total de 3,4 GB, lo que sugiere pesos en precisión de 32 bits o 16 bits con algún overhead. La licencia es la SAM License (no OSI), lo que condiciona el uso comercial. No hay información publicada sobre arquitectura interna, datos de entrenamiento ni benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de segmentación; tag `sam3_video`) |
| Parametros totales | 859.922.360 (~860 M) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica a segmentación; resolución de entrada no especificada) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | SAM License (`sam-license`, `license: other`) |
| Formato de pesos | safetensors |
| Tamano del repo | 3,4 GB |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 27 / 0 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna en la documentación proporcionada. Por el nombre del modelo y el tag `sam3_video`, se trata de la familia Segment Anything Model 3 de Meta, orientada a segmentación promptable en imagen y vídeo, pero esta ficha no puede confirmar detalles de backbone, mecanismo de atención, componentes de memoria temporal ni diseño del decoder de máscaras.

Tampoco hay datos sobre el entrenamiento: número de tokens o imágenes, composición del dataset, uso de RLHF/DPO (no aplicable en un modelo de segmentación) ni innovaciones técnicas concretas. La model card de esta copia es mínima y solo declara la procedencia de los pesos y la licencia. Para detalles técnicos habría que consultar la documentación oficial de `facebook/sam3`, que no forma parte de la información disponible.

## Capacidades

- Segmentación de imágenes a partir de prompts (el modelo es de la familia SAM; los tipos exactos de prompt no se detallan en la información disponible).
- Segmentación y seguimiento en vídeo, según el tag `sam3_video`.
- Generación de máscaras de alta calidad para objetos, uso típico de la familia SAM.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documenta capacidad multilingüe ni de generación de texto.
- No se documenta modo thinking, visión-a-texto ni audio.
- Capacidad de segmentación guiada por conceptos (propia de SAM 3): no confirmada en la información disponible para esta copia concreta.

## Casos de uso

- Segmentación interactiva en herramientas de edición: el usuario marca puntos o cajas sobre una imagen y el modelo devuelve la máscara del objeto; los ~860 M de parámetros permiten ejecución en GPU de consumo con cuantización adecuada.
- Rotoscopia y máscaras en vídeo: el tag `sam3_video` sugiere seguimiento temporal de objetos entre fotogramas, útil para postproducción y composición.
- Anotación automática de datasets: generar máscaras preliminares para entrenar modelos de segmentación semántica o detección, reduciendo el trabajo manual de etiquetado.
- Preprocesado en pipelines de visión por computador: aislar regiones de interés antes de un clasificador u OCR, por ejemplo en documentos escaneados o capturas.
- Aplicaciones de recorte y fondos: separar sujetos del fondo en apps de foto y vídeo, con la ventaja de que los pesos se pueden descargar sin cuenta de Hugging Face gracias a esta redistribución.
- Integración en la app MangaLens: caso de uso declarado por el autor, que usa esta copia para descargar el modelo de forma directa en su aplicación.
- Investigación en segmentación promptable: punto de partida reproducible para experimentar con SAM 3 sin depender del acceso autenticado al repo oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los 3,4 GB de pesos safetensors implican al menos ~3,5-4 GB de VRAM en precisión original; en FP16 cabría en torno a 2 GB y en cuantizaciones de 8 bits alrededor de 1 GB, aunque no se distribuyen pesos cuantizados en este repo.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para los pesos en precisión original; A100, H100 o RTX 4090 sobran para este tamaño y aportan margen para lotes grandes o vídeo.
- GPU de consumo: cabe en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas solo si se dispone de suficiente memoria compartida, con latencia mucho mayor.
- Opciones de despliegue: no se documentan en la información disponible; al ser safetensors, requeriría cargarse con la librería oficial de SAM 3 o con transformers si existe integración, no confirmada aquí. No hay GGUF ni soporte declarado de llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| NickB0ss/sam3-mangalens | ~860 M | no disponible | SAM License | Copia no oficial en HF |
| facebook/sam3 (oficial) | no disponible en esta información | no disponible | SAM License | Requiere cuenta en HF según la model card |
| Otros modelos SAM de Meta (SAM 1/2) | no disponible en esta información | no disponible | licencias Apache/SAM según versión | Repos oficiales en HF |

No se dispone de datos de benchmarks ni de especificaciones de las alternativas en la información proporcionada, por lo que la comparación se limita a procedencia, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una copia no oficial: el autor no ha modificado los pesos, pero la integridad y el mantenimiento dependen de un tercero con 27 descargas y sin likes; no hay garantía de actualizaciones.
- La SAM License no es una licencia de código abierto OSI; conviene revisar las cláusulas de uso comercial antes de integrarla en un producto.
- No hay información sobre sesgos, tasas de alucinación de máscaras ni dominios donde el modelo falle (por ejemplo, objetos ocluidos, imágenes de baja resolución o estilos de dibujo).
- No se documentan limitaciones de idioma ni de resolución de entrada.
- Al ser un modelo de segmentación, no genera texto; cualquier expectativa de razonamiento o diálogo es incorrecta.
- Para producción se recomienda verificar el hash de los pesos contra el repo oficial y considerar usar `facebook/sam3` directamente.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/NickB0ss/sam3-mangalens
- Repo oficial de los pesos: https://huggingface.co/facebook/sam3
- No se han encontrado en la información disponible papers, blogs, repos de código ni demos adicionales.
