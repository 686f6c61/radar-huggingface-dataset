# mradermacher/Qari-OCR-0.2.2.1-VL-2B-Instruct-merged-GGUF

## Resumen

Qari-OCR-0.2.2.1-VL-2B-Instruct-merged es un modelo vision-lenguaje (VL) de aproximadamente 1.540 millones de parametros, especializado en reconocimiento optico de caracteres (OCR) y comprension de documentos. El modelo original fue desarrollado por el usuario oddadmix y esta pensado para tareas de extraccion de texto e interpretacion de imagenes de documentos. Esta ficha concreta corresponde a la version cuantizada en formato GGUF publicada por mradermacher, un conocido empaquetador de cuantizaciones para la comunidad.

La relevancia de esta publicacion radica en que pone a disposicion del ecosistema llama.cpp y Ollama un modelo OCR multimodal de solo 2B de parametros, lo que permite desplegarlo en hardware de consumo. Al estar en formato GGUF con cuantizaciones desde Q2_K (0,8 GB) hasta f16 (3,2 GB), y con el proyector multimodal (mmproj) separado, se facilita su integracion en pipelines locales de digitalizacion de documentos sin depender de APIs externas.

No obstante, la informacion publicada por el autor de la cuantizacion es muy escasa: no se detalla la licencia, la longitud de contexto, la composicion del entrenamiento ni resultados de benchmarks. La model card se limita a listar los ficheros GGUF disponibles y a remitir a la documentacion generica de mradermacher sobre cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (transformer multimodal, detalles no disponibles) |
| Parametros totales | 1.543.714.304 (~1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun tags de Hugging Face) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con fichero mmproj separado para el proyector multimodal) |

## Arquitectura y entrenamiento

El modelo base es oddadmix/Qari-OCR-0.2.2.1-VL-2B-Instruct-merged, un modelo vision-lenguaje de aproximadamente 1,54 mil millones de parametros. Por la nomenclatura "VL" y "merged" se infiere una arquitectura multimodal que combina un codificador de vision con un modelo de lenguaje, y que ha pasado por un proceso de fusion de pesos (merge), probablemente de adaptadores o de un fine-tuning. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO.

La version aqui descrita es una cuantizacion estatica realizada por mradermacher, que incluye el fichero principal del modelo y un fichero mmproj separado (proyector multimodal) en Q8_0 o f16, necesario para procesar imagenes. El autor indica que no ha generado cuantizaciones con imatrix (weighted) para este modelo. No se detalla ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, segun el nombre del modelo.
- Comprension de imagenes y documentos (modelo vision-lenguaje).
- Generacion de texto conversacional en formato instruct (etiqueta "Instruct" y tag "conversational").
- Procesamiento multimodal mediante el fichero mmproj separado en despliegues llama.cpp.
- Capacidades de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (en); no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo puede extraer texto de imagenes de facturas, formularios o paginas escaneadas, aprovechando su naturaleza OCR y su tamano reducido para ejecutarse en local.
- Procesamiento por lotes en servidores modestos: con cuantizaciones Q4_K_M (~1,1 GB) o Q5_K_M (~1,2 GB), se puede desplegar en CPU o GPU de gama baja para pipelines de conversion masiva de PDF a texto.
- Integracion en aplicaciones de escritorio: al ser GGUF, puede embeberse en herramientas locales mediante llama.cpp u Ollama, sin enviar documentos sensibles a servicios en la nube.
- Extraccion de datos estructurados de recibos y tickets: el modelo puede leer campos clave de imagenes de documentos y devolver texto que posteriormente se parsee con reglas o expresiones regulares.
- Prototipado rapido de asistentes documentales: gracias a su formato instruct y conversacional, sirve para construir demos de chat sobre imagenes de documentos en entornos de desarrollo.
- Archivado y busqueda de documentos: combinado con un motor de busqueda, permite indexar el texto extraido de escaneos historicos en un flujo completamente local.
- Pruebas de concepto en investigacion: su tamano (1,54B) y su disponibilidad en multiples cuantizaciones lo hacen util para experimentar con modelos VL-OCR en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo principal): aproximadamente 0,8 GB en Q2_K, 1,0-1,1 GB en Q4_K_M, 1,4 GB en Q6_K y 3,2 GB en f16. Hay que sumar el fichero mmproj (0,8 GB en Q8_0 o 1,4 GB en f16) para el procesamiento de imagenes.
- VRAM total estimada en configuracion tipica (Q4_K_M + mmproj Q8_0): en torno a 2 GB, mas el espacio para el contexto y las activaciones.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; tambien es viable en CPU gracias al tamano reducido.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF y mmproj; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qari-OCR-0.2.2.1-VL-2B-Instruct-merged (esta ficha) | ~1,54B | no disponible | no disponible | GGUF | Especializado en OCR/VL, cuantizaciones de 0,8 a 3,2 GB |
| Modelos OCR-VL de mayor tamano (p. ej. familia Qwen2-VL 2B/7B) | 2B-7B | variable | variable | safetensors/GGUF | Referencia habitual en tareas OCR multimodal; no se dispone de comparacion directa con este modelo |
| Modelos OCR clasicos (Tesseract, PaddleOCR) | no aplica (no neuronal generativo o distinto) | no aplica | open source | varios | No son modelos de lenguaje; la comparacion no es directa |

No se dispone de datos objetivos para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Informacion muy escasa: no se publican licencia, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base (oddadmix/Qari-OCR-0.2.2.1-VL-2B-Instruct-merged) antes de cualquier despliegue.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: como modelo generativo, puede inventar texto que no aparece en la imagen, especialmente en documentos de baja calidad o con tipografias complejas.
- Al ser una cuantizacion, las versiones de baja precision (Q2_K, Q3_K) pueden degradar la calidad del OCR; se recomienda Q4_K_M o superior para tareas sensibles.
- Requiere el fichero mmproj adicional para procesar imagenes; sin el, el modelo no puede realizar tareas de vision.
- No se han publicado cuantizaciones con imatrix, lo que puede implicar una calidad algo inferior frente a cuantizaciones ponderadas equivalentes.
- Sin informacion sobre sesgos, limites de contexto ni robustez frente a documentos adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Qari-OCR-0.2.2.1-VL-2B-Instruct-merged-GGUF
- Modelo base: https://huggingface.co/oddadmix/Qari-OCR-0.2.2.1-VL-2B-Instruct-merged
- Pagina de overview del autor de cuantizaciones: https://hf.tst.eu/model#Qari-OCR-0.2.2.1-VL-2B-Instruct-merged-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
