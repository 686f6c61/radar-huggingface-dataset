# ahmedsamirtarjama/arabic-ocr-dots-ft-e6a

## Resumen

`ahmedsamirtarjama/arabic-ocr-dots-ft-e6a` es un ajuste fino orientado a OCR y análisis de estructura de documentos en árabe, construido sobre el modelo multimodal `rednote-hilab/dots.mocr`. Lo publica el usuario `ahmedsamirtarjama` como parte de un proyecto de investigación alojado en un servidor interno (`server3-ts`, directorio `/mnt/extra/ocr`), por lo que se trata de un experimento con fines de estudio más que de un modelo con soporte de producción.

El modelo se ha generado mediante un LoRA de rango 64 fusionado en los pesos del modelo base, dejando congelada la torre de visión. Esto implica que el ajuste afecta principalmente al componente de lenguaje y de decodificación de estructura, mientras que la percepción visual hereda el comportamiento del modelo original. El recuento real de parámetros en safetensors es de 3.039.179.264 (aproximadamente 3,04 mil millones), y el repositorio ocupa 6,1 GB.

Su relevancia radica en el hueco existente de herramientas de OCR y comprensión de maquetación bien ajustadas para árabe, un idioma con particularidades de escritura (dirección derecha-izquierda, ligaduras, diacríticos) que los modelos genéricos suelen manejar con más errores. No obstante, la información pública disponible es muy escasa: no hay licencia declarada, no se detallan idiomas en los metadatos y los resultados de evaluación se remiten a documentos externos no incluidos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo multimodal (visión-lenguaje) derivado de `rednote-hilab/dots.mocr`, con torre de visión congelada y componente de lenguaje ajustado |
| Parametros totales | 3.039.179.264 (aproximadamente 3,04 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio distribuido contiene pesos en safetensors sin cuantizar |
| Idiomas soportados | Árabe (ajuste específico para OCR en árabe según la model card); resto de idiomas no disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un ajuste fino de OCR y maquetación (layout) en árabe sobre `rednote-hilab/dots.mocr`. El procedimiento de entrenamiento consistió en un LoRA de rango 64 que se fusionó posteriormente en los pesos del modelo base, manteniendo congelada la torre de visión. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

La model card etiqueta el proyecto como investigación y remite a los archivos `docs/TEST_PROTOCOL.md` y `REPORT.md` del repositorio `arabic-ocr-research-data/code` para consultar los resultados, pero esos documentos no se incluyen en la información proporcionada. El pipeline de inferencia documentado utiliza vLLM con el prompt `prompt_layout_all_en`, temperatura 0,1, top_p 1,0 y max_tokens 8192, seguido de un postprocesado denominado `trim_tail` y `trim_v2` (código en `code/scripts/` del repositorio de datos de investigación). Cabe señalar que la model card cita como base `rednote-hilab/dots.mocr`, mientras que los metadatos de HuggingFace registran `dots-studio/dots.mocr`; la discrepancia no se aclara en la información disponible.

## Capacidades

- Generación de texto y OCR de documentos en árabe, incluyendo la transducción de imagen de documento a texto.
- Análisis de estructura y maquetación de documentos (`document-layout`), según las etiquetas del modelo.
- Naturaleza conversacional (etiqueta `conversational`), orientada a interacción por turnos con instrucciones.
- Entrada multimodal: procesa imágenes a través de la torre de visión heredada de `dots.mocr`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el foco declarado es el árabe.
- Capacidades especiales (modo de razonamiento, audio, etc.): no disponibles.

## Casos de uso

- Digitalización de archivos administrativos en árabe: conversión de documentos escaneados (formularios, actas, expedientes) a texto estructurado, aprovechando el ajuste específico sobre maquetación para preservar el orden de lectura de derecha a izquierda.
- Extracción de datos de facturas y recibos: identificación de campos como importes, fechas y datos fiscales en documentos árabes, integrándose en un pipeline de extracción posterior mediante reglas o expresiones regulares sobre la salida textual.
- Procesamiento de publicaciones y páginas periódicas: el componente de layout facilita la separación de columnas y bloques de texto, útil para digitalizar prensa en árabe manteniendo la estructura editorial.
- Preparación de corpus para NLP en árabe: generación de texto limpio a partir de material escaneado para alimentar modelos de lenguaje o sistemas de búsqueda, con el postprocesado `trim` documentado para eliminar ruido de cola.
- Indexación y búsqueda documental: extracción de texto de repositorios de documentos escaneados para su posterior indexación en motores de búsqueda o sistemas RAG, aprovechando la salida conversacional para normalizar resultados.
- Investigación en OCR árabe: dado su carácter de experimento, sirve como punto de partida para reproducir el ajuste LoRA r64 y comparar estrategias de fine-tuning sobre el modelo base `dots.mocr`, contando con el protocolo de pruebas referenciado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que los resultados deben consultarse en `docs/TEST_PROTOCOL.md` y `REPORT.md` dentro del repositorio `arabic-ocr-research-data/code`, pero estos archivos no forman parte de los datos facilitados, por lo que no se puede presentar ninguna tabla comparativa con cifras verificadas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 3,04 mil millones de parámetros): aproximadamente 6,1 GB en BF16/FP16 solo para pesos, más el coste de activaciones, caché KV y la torre de visión.
- En cuantización INT8 la huella de pesos bajaría a unos 3 GB, y en INT4 a alrededor de 1,5-2 GB, aunque no se distribuyen versiones cuantizadas oficiales en el repositorio.
- GPU de consumo: debería caber en tarjetas con 16 GB o más (por ejemplo RTX 4060 Ti 16 GB, RTX 4080, RTX 4090) en BF16 con margen para contexto moderado; en tarjetas de 8-12 GB sería recomendable cuantizar, opción no disponible de serie.
- GPU de数据中心/servidor: A100, H100 o L40S para servicio con lotes grandes y baja latencia.
- Opciones de despliegue: vLLM es el backend documentado por el autor. La librería declarada es `transformers`. El uso de llama.cpp, Ollama o TGI no se menciona y, dado que el modelo usa `custom_code`, requeriría verificación previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. Como referencia de categoría (OCR multimodal), podrían considerarse el propio modelo base `rednote-hilab/dots.mocr`, `GOT-OCR2.0` o soluciones VLM de propósito general como Qwen2-VL, pero no se dispone de cifras contrastadas en este contexto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| arabic-ocr-dots-ft-e6a | 3,04 mil millones | No disponible | No disponible | HuggingFace |
| dots.mocr (base) | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de OCR multimodal | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de investigación: la propia model card lo etiqueta como "experiment" y no ofrece garantías de robustez ni de mantenimiento.
- Licencia no declarada: no se especifican los términos de uso, por lo que el uso comercial es jurídicamente incierto y no se puede asumir que esté permitido.
- Idiomas no declarados en los metadatos más allá del foco árabe, lo que impide anticipar su comportamiento en otros idiomas.
- Los resultados de evaluación no están disponibles en la información proporcionada; solo se remiten a documentos externos.
- Riesgo de alucinación inherente a los modelos generativos aplicados a OCR: puede producir texto plausible pero incorrecto en zonas de imagen degradadas, manuscritos o tipografías inusuales.
- Sin datos sobre sesgos, composición del dataset de entrenamiento o posibles desequilibrios.
- Dependencia de `custom_code`: el despliegue requiere el código personalizado del repositorio, lo que puede complicar la integración con herramientas estándar.
- Contexto y cuantizaciones no documentados: limita la planificación de recursos en producción.
- El pipeline de inferencia recomendado incluye un postprocesado específico (`trim_tail`, `trim_v2`); omitirlo puede degradar la calidad de la salida.
- Cero descargas y cero "likes" en el momento de la consulta, indicativo de un modelo sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-dots-ft-e6a
- Modelo base citado en la model card: https://huggingface.co/rednote-hilab/dots.mocr
- Modelo base registrado en metadatos: https://huggingface.co/dots-studio/dots.mocr
- Repositorio de datos y código de investigación referenciado en la model card: `arabic-ocr-research-data` (ruta `code/scripts/` y documentos `docs/TEST_PROTOCOL.md`, `REPORT.md`); no se proporciona URL directa en la información disponible.
