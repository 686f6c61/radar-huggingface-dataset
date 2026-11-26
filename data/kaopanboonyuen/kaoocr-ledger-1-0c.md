# kaopanboonyuen/KaoOCR-Ledger-1.0c

## Resumen

KaoOCR-Ledger-1.0c es un modelo de visión-lenguaje especializado en OCR y parseo de documentos tailandeses, desarrollado por kaopanboonyuen en el marco del GSB AI Lab (Government Savings Bank de Tailandia). Recibe como entrada la imagen de una página de documento —o el recorte de una sola línea de texto— y devuelve Markdown estructurado con encabezados, párrafos y tablas, o texto plano en modo línea. Con 630,8 millones de parámetros (encoder visual más decoder autorregresivo), está pensado para desplegarse en local con un coste de cómputo contenido.

El modelo es un fine-tune de KaoOCR-Ledger-1.0a, que a su vez desciende de OpenThai2.1-OCR-Markdown y, en última instancia, de NVIDIA Nemotron 3.5 Parse. La versión 1.0c es la release actual de la familia Ledger: mantiene el nivel de OCR de 1.0b (54,0 en NLS sobre ThaiOCRBench) y sitúa el parseo en 66,7 (TEDS/NLS), ligeramente por debajo del 67,6 de 1.0b pero por encima de 1.0a.

Su relevancia radica en cubrir un nicho poco atendido: documentación financiera y administrativa en tailandés, incluyendo manuscrito, con salida directamente consumible en formato Markdown y una licencia OpenMDW-1.1 que permite uso comercial. El soporte se limita a tailandés e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder + decoder autorregresivo (image-text-to-text, familia Nemotron Parse) |
| Parametros totales | 630.800.504 (0,63B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo incluye requisitos para vLLM) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (librería transformers, código custom en `nemotron_parse/`) |

## Arquitectura y entrenamiento

La arquitectura combina un encoder visual con un decoder autorregresivo de tipo decoder-only, heredado de la línea Nemotron 3.5 Parse → OpenThai2.1-OCR-Markdown. El modelo base 1.0a incorporó un ajuste del decoder sobre escritura manuscrita tailandesa y una mezcla de pesos mediante WiSE-FT (weight-space ensembling fine-tuning). La versión 1.0c es un fine-tune adicional sobre 1.0a que conserva sin cambios el tokenizador, el código de inferencia (`nemotron_parse/`, que actúa como post-procesador) y los ficheros de licencia.

La model card indica explícitamente que los detalles de entrenamiento de 1.0c (mezcla de datos, épocas, tasa de aprendizaje, hardware y criterio de selección de checkpoint) están pendientes de publicar. No se dispone de información sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO. Tampoco se documentan innovaciones de decodificación o atención más allá de lo heredado de la arquitectura base.

## Capacidades

- OCR de páginas de documento completo con salida en Markdown estructurado (encabezados, párrafos, tablas).
- Reconocimiento de escritura manuscrita tailandesa, especialmente en modo línea sobre recortes de una sola línea.
- Parseo de tablas con evaluación mediante TEDS, lo que implica reconstrucción de estructura tabular en Markdown.
- Modo línea (`--line`) para convertir un recorte de texto en texto plano.
- Procesamiento bilingüe tailandés-inglés en el mismo documento.
- Inferencia en GPU (recomendada) o CPU (soportada pero lenta).
- Despliegue como servicio compatible con vLLM mediante `--trust-remote-code`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modos de pensamiento extendido.

## Casos de uso

- Digitalización de extractos y documentación bancaria en tailandés: el modelo convierte la imagen de la página en Markdown con tablas preservadas, adecuado para el dominio financiero del que procede el proyecto (GSB).
- Extracción de tablas de informes contables: la evaluación con TEDS indica que reconstruye la estructura tabular, lo que permite alimentar pipelines de análisis sin transcripción manual.
- Procesamiento de formularios manuscritos: el ajuste específico sobre manuscrito tailandés y el modo línea permiten leer campos rellenados a mano y volcarlos como texto plano.
- Archivado y búsqueda documental: al generar Markdown limpio, el resultado se indexa directamente en motores de búsqueda o bases documentales sin post-procesado adicional.
- Digitalización de documentación administrativa bilingüe tailandés-inglés: útil en organismos públicos y empresas con documentación mixta.
- Despliegue local con requisitos de privacidad: el tamaño de 0,63B y el soporte de CPU permiten ejecutarlo en infraestructura propia sin enviar documentos sensibles a servicios externos.
- Servicio de alto rendimiento con vLLM: para volúmenes elevados de páginas, el servidor vLLM incluido en el repo permite exponer el modelo como endpoint compatible con clientes OpenAI.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre ThaiOCRBench (escala 0-100; OCR medido con NLS, parseo con TEDS cuando hay tabla y NLS sobre texto sin marcado en el resto). No incluyen tareas VQA ni de extracción de información clave.

| Modelo | OCR (NLS) | Parseo (TEDS/NLS) |
|---|---:|---:|
| KaoOCR-Ledger-1.0c | 54,0 | 66,7 |
| KaoOCR-Ledger-1.0b | 54,0 | 67,6 |
| KaoOCR-Ledger-1.0a | 45,2 | 61,6 |
| OpenThai2.1-OCR-Markdown (referencia) | 50,4 | 68,1 |
| typhoon-ocr2-2b (referencia) | 55,8 | 63,6 |

Frente a las referencias, 1.0c gana +3,1 en parseo a typhoon-ocr2-2b y +3,6 en OCR a OpenThai2.1-OCR-Markdown, pero pierde −1,8 en OCR frente a typhoon-ocr2-2b y −1,4 en parseo frente a OpenThai2.1-OCR-Markdown. El autor advierte que las cifras provienen de su propia ejecución del benchmark y recomienda validar sobre documentos propios.

## Requisitos de hardware

- VRAM estimada: no publicada. Con 0,63B de parámetros en safetensors (repo de 2,7 GB), la inferencia en fp16 requiere del orden de 1,3 GB solo para pesos, más memoria para el encoder visual y las activaciones; una GPU con 8 GB debería ser suficiente en la práctica, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU consumer reciente (RTX 3060/4060 en adelante) es candidata; A100 o H100 no son necesarias para un modelo de este tamaño.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más; el autor solo indica que se recomienda GPU.
- Despliegue: `inference.py` incluido en el repo (con `--device cpu` disponible), y servidor vLLM mediante `pip install -e ".[vllm,client]"` y `vllm serve . --served-model-name nemotron-parse --trust-remote-code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | OCR (NLS) | Parseo (TEDS/NLS) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| KaoOCR-Ledger-1.0c | 0,63B | no disponible | 54,0 | 66,7 | OpenMDW-1.1 | Hugging Face |
| KaoOCR-Ledger-1.0b | no disponible | no disponible | 54,0 | 67,6 | no disponible | Hugging Face |
| OpenThai2.1-OCR-Markdown | no disponible | no disponible | 50,4 | 68,1 | no disponible | no disponible |
| typhoon-ocr2-2b | 2B (según nombre) | no disponible | 55,8 | 63,6 | no disponible | no disponible |

La comparativa se limita a los datos de la model card: no se dispone de parámetros, contexto ni licencia de los modelos de referencia. Frente a typhoon-ocr2-2b, KaoOCR-Ledger-1.0c ofrece un tamaño tres veces menor con mejor parseo y peor OCR; frente a OpenThai2.1-OCR-Markdown, mejor OCR y peor parseo.

## Limitaciones y advertencias

- Hereda todas las dificultades de la arquitectura base: fórmulas, texto en escenas naturales y maquetaciones poco habituales.
- El modo línea (`--line`) está pensado exclusivamente para recortes de una sola línea; usarlo con páginas completas degradará el resultado.
- Solo cubre tailandés e inglés; no hay soporte documentado para otras lenguas.
- Riesgo de alucinación inherente a los modelos generativos: la salida Markdown puede contener texto inventado o tablas mal reconstruidas, especialmente en documentos de baja calidad.
- No se han publicado detalles de entrenamiento, sesgos ni evaluación de robustez; el propio autor marca la sección de entrenamiento como pendiente.
- Las cifras de benchmark proceden de una ejecución propia del autor y excluyen tareas VQA y de extracción de información clave; no deben extrapolarse sin validación sobre el corpus de destino.
- Licencia OpenMDW-1.1 etiquetada como `other`: conviene revisar el texto completo antes de un uso comercial en producción.
- El código requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio; audítalo antes de desplegarlo en entornos sensibles.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación registrada (2026-11-26) es posterior a la actual; trátese como un artefacto muy reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0c
- Modelo base (1.0a): https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0a
- Versión 1.0b: https://huggingface.co/kaopanboonyuen/KaoOCR-Ledger-1.0b
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios adicionales ni demos.
