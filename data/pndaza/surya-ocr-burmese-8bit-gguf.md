# pndaza/surya-ocr-burmese-8bit-GGUF

## Resumen

surya-ocr-burmese-8bit-GGUF es una compilación en formato GGUF de 8 bits del modelo pndaza/surya-ocr-burmese-8bit-MLX, que a su vez es un fine-tune de datalab-to/surya-ocr-2, el modelo de OCR de documentos de Datalab. El modelo está especializado en reconocimiento óptico de caracteres de documentos birmanos (Myanmar), con especial atención a textos en Pāli (ပါဠိ) y glosas nissaya (နိဿယ), y devuelve la página completa en el formato HTML `high_accuracy_bbox` propio de surya.

La relevancia de esta ficha es doble: por un lado, demuestra el flujo de trabajo habitual de cuantización y empaquetado para llama.cpp de un modelo de visión-lenguaje especializado; por otro, documenta una mejora sustancial de precisión en un dominio de bajos recursos (birmano) respecto al modelo base, con una reducción del error de carácter (CER) de aproximadamente 1,9–2,9% a 0,2–0,5% en un libro birmano no visto durante el entrenamiento.

El modelo tiene 632.103.744 parámetros (unos 632 M), se distribuye en dos ficheros GGUF (el modelo de lenguaje en Q8_0 y el proyector de visión en F16) y se ejecuta mediante llama.cpp con soporte multimodal, tanto en CPU como en Apple Silicon (Metal) y CUDA. La licencia es OpenRAIL-M modificada, heredada de surya, con restricciones para uso comercial amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en surya-ocr-2 (transformer multimodal con proyector de visión; detalles internos no disponibles) |
| Parametros totales | 632.103.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de llama-server de la model card) |
| Tipos de cuantizacion | Q8_0 para el modelo de lenguaje; F16 para el proyector de visión (mmproj) |
| Idiomas soportados | Birmano (Myanmar), con foco en Pāli y nissaya; otros idiomas no disponibles |
| Licencia | OpenRAIL-M modificada (heredada de surya-ocr-2) |
| Formato de pesos | GGUF (surya-ocr-burmese-Q8_0.gguf, 644 MB; surya-ocr-burmese-mmproj-F16.gguf, 196 MB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de datalab-to/surya-ocr-2, un modelo de visión-lenguaje orientado a OCR de documentos que procesa una imagen de página y genera una representación HTML estructurada. La compilación GGUF conserva los pesos del repositorio MLX con el adaptador LoRA ya fusionado, de modo que no se necesita ningún adaptador adicional en tiempo de inferencia. El proyector de visión se mantiene deliberadamente en F16 porque, según el autor, cuantizarlo no se validó y su coste de almacenamiento es reducido. La model card incluye un detalle técnico para quien reconstruya los pesos: en el formato ggml, `blk.N.ssm_a` almacena `-exp(A_log)` precalculado, no `A_log` en bruto, lo que sugiere componentes de tipo state space (SSM) en la arquitectura subyacente; no se dispone de más detalle sobre la arquitectura interna.

El entrenamiento combina tres fuentes: libros birmanos escaneados reales del dataset pndaza/surya-ocr-burmese-books (sermones, textos en Pāli y glosas nissaya, con verdad terreno revisada manualmente), el dataset freococo/myanmar_complex_document_layouts de maquetaciones documentales complejas convertidas automáticamente, y un corpus sintético interno de páginas renderizadas con ocho fuentes birmanas y degradaciones de escaneo simuladas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- OCR de página completa de documentos birmanos, con salida en HTML estructurado en el formato `high_accuracy_bbox` de surya: cada bloque es un `div` con `data-label` y `data-bbox` (coordenadas normalizadas 0–1000).
- Reconocimiento específico de textos en Pāli (ပါဠိ) y glosas nissaya (နိဿယ), un dominio poco cubierto por los modelos OCR generalistas.
- Procesamiento de maquetaciones documentales complejas, gracias al entrenamiento con el dataset de layouts birmanos complejos.
- Interfaz conversacional compatible con la API `/v1/chat/completions` de OpenAI a través de llama-server, incluyendo entrada de imagen en base64 mediante `image_url`.
- Ejecución multimodal en CPU, Apple Silicon (Metal) y CUDA mediante llama.cpp.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes ni procesamiento de audio.

## Casos de uso

- Digitalización de fondos bibliográficos birmanos: el modelo convierte páginas escaneadas de sermones y textos religiosos en HTML estructurado con coordenadas de bloque, lo que permite indexar y buscar el contenido preservando la maquetación original. Es adecuado por su CER de 0,2–0,5% en libros birmanos no vistos.
- Preservación de textos en Pāli y nissaya: bibliotecas y centros de estudios budistas pueden transcribir glosas interlineales y comentarios canónicos que los OCR generalistas confunden, gracias al entrenamiento específico en este subdominio.
- Construcción de corpus para investigación lingüística: la salida con `data-label` y `data-bbox` facilita separar bloques de texto, títulos y glosas, lo que permite generar corpus anotados estructuralmente para estudios de filología birmana.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU mediante llama.cpp, puede desplegarse en infraestructura modesta para digitalizar lotes de documentos sin depender de aceleradores.
- Integración en pipelines de gestión documental: la compatibilidad con la API OpenAI de llama-server permite sustituir llamadas a servicios OCR en la nube por un endpoint local, manteniendo los documentos sensibles dentro de la organización.
- Prototipado en estaciones de trabajo Apple Silicon: el formato GGUF y el soporte Metal permiten ejecutar el modelo en un Mac para validar la calidad de OCR antes de invertir en infraestructura mayor.
- Extracción de texto para motores de búsqueda internos: el HTML estructurado con coordenadas permite reconstruir el orden de lectura y alimentar índices de búsqueda con texto limpio y referencias a la posición original en la página.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, sobre un libro birmano no visto):

| Modelo | CER |
|---|---|
| surya-ocr-2 original | ~1,9–2,9% |
| surya-ocr-burmese-8bit (Q8_0) | ~0,2–0,5% |

El autor indica además que la cuantización Q8_0 mantiene el mismo CER que F16 con una velocidad aproximadamente un 40% superior. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje Q8_0 ocupa 644 MB y el proyector de visión F16 196 MB, por lo que el peso total de los ficheros es de unos 840 MB; el consumo real de memoria depende del contexto configurado y de los buffers de llama.cpp, pero en cualquier caso es muy inferior al de modelos de miles de millones de parámetros.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos unos pocos GB de VRAM libre; también funciona en Apple Silicon con Metal. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe holgadamente en GPU de consumo: con menos de 1 GB de pesos, cualquier GPU consumer moderna (por ejemplo, series RTX 30/40) puede alojarlo; también es viable en CPU.
- Opciones de despliegue: llama.cpp (llama-server) con `--mmproj` para el proyector de visión; requiere llama.cpp ≥ b4xxx / 0.2.0. No se documentan otras opciones como vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; el autor solo indica que Q8_0 es aproximadamente un 40% más rápido que F16 con el mismo CER.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (birmano, libro no visto) | Licencia | Formato |
|---|---|---|---|---|---|
| surya-ocr-burmese-8bit-GGUF (este) | 632 M | 8192 | ~0,2–0,5% | OpenRAIL-M modificada | GGUF (Q8_0 + mmproj F16) |
| datalab-to/surya-ocr-2 (base) | no disponible | no disponible | ~1,9–2,9% | OpenRAIL-M modificada | safetensors / GGUF oficial |
| pndaza/surya-ocr-burmese-8bit-MLX | 632 M (mismos pesos) | no disponible | no disponible | OpenRAIL-M modificada | MLX |

No se dispone de datos sobre otros modelos OCR comparables (por ejemplo, alternativas generalistas o especializadas en birmano) en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en birmano (Myanmar), Pāli y nissaya; su rendimiento en otros idiomas o alfabetos no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de visión-lenguaje generativos: puede producir texto plausible que no aparece en la imagen, especialmente en zonas degradadas o con baja resolución.
- La salida sigue un formato HTML específico (`high_accuracy_bbox`); desviaciones del prompt esperado pueden degradar la estructura de la salida.
- La licencia OpenRAIL-M modificada permite uso gratuito en investigación, uso personal y pequeñas startups, pero el uso comercial más amplio requiere una licencia de Datalab; conviene revisar los términos antes de integrarlo en un producto.
- El proyector de visión se distribuye en F16 sin validación de cuantizaciones inferiores; no se recomienda cuantizarlo sin evaluar el impacto en el CER.
- Solo hay métricas publicadas sobre un libro birmano no visto; el rendimiento en otros tipos de documento (formularios, tablas, prensa) no está cuantificado.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a dominios distintos al corpus de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pndaza/surya-ocr-burmese-8bit-GGUF
- Repositorio MLX del mismo fine-tune: https://huggingface.co/pndaza/surya-ocr-burmese-8bit-MLX
- Modelo base: https://huggingface.co/datalab-to/surya-ocr-2
- Dataset de libros birmanos: https://huggingface.co/datasets/pndaza/surya-ocr-burmese-books
- Dataset de maquetaciones documentales birmanas: https://huggingface.co/datasets/freococo/myanmar_complex_document_layouts
