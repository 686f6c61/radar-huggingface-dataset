# mradermacher/zorka-vieniera-12b-GGUF

## Resumen

Zorka-vieniera-12b es un modelo lingüístico de 12.913 millones de parámetros desarrollado por el usuario ewxxyyzz, especializado en bielorruso (código de idioma "be"). Esta ficha corresponde a la versión cuantizada en formato GGUF publicada por mradermacher, un cuantizador conocido por generar versiones estáticas de modelos populares para su ejecución local con llama.cpp y herramientas derivadas.

El modelo base se entrenó sobre el dataset karotkizmest del propio autor, junto con wikimedia/wikipedia y cis-lmu/GlotCC-V1, un corpus multilingüe de web crawling de la iniciativa Glot500. Esta combinación sugiere un enfoque en la generación de texto en bielorruso apoyado en conocimiento general enciclopédico, un área con escasa representación en los grandes modelos comerciales y de la comunidad.

Su relevancia radica en la escasez de modelos abiertos centrados en bielorruso, un idioma eslavo oriental con pocos recursos lingüísticos de calidad. La disponibilidad de cuantizaciones desde Q2_K (5,3 GB) hasta Q8_0 (13,8 GB) permite ejecutarlo en hardware modesto, democratizando el acceso a un LLM para este idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, por la librería transformers) |
| Parametros totales | 12.913.983.536 (~12,9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | bielorruso (be) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base está disponible en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base, aunque la etiqueta de librería "transformers" y el tamaño de ~12,9B parámetros indican un modelo transformer denso de tamaño medio. No se ha publicado información sobre el número de tokens de entrenamiento, el método de ajuste fino (SFT, RLHF, DPO) ni la plantilla de chat utilizada.

Según la model card del modelo base, los datos de entrenamiento incluyen tres fuentes: ewxxyyzz/karotkizmest (dataset propio del autor, sin documentación pública detallada), wikimedia/wikipedia (la versión estructurada de Wikipedia de Wikimedia) y cis-lmu/GlotCC-V1, un corpus de texto masivo multilingüe derivado de CommonCrawl que cubre más de 100 idiomas con especial atención a lenguas de bajos recursos. Esta mezcla apunta a un entrenamiento orientado a reforzar el bielorruso sobre capacidades generales de lenguaje.

## Capacidades

- Generación de texto en bielorruso, su capacidad principal según los metadatos de idioma.
- Conocimiento enciclopédico general adquirido mediante Wikipedia y GlotCC-V1.
- Ejecución local eficiente gracias a las once cuantizaciones GGUF disponibles.
- No se ha documentado soporte de tool calling, capacidades de visión o audio, ni modo de razonamiento extendido.

## Casos de uso

- Generación de contenido en bielorruso: redacción de artículos, entradas de blog o material divulgativo en un idioma con escasa oferta de LLMs abiertos.
- Asistencia lingüística para hablantes de bielorruso: ayuda en redacción, parafraseo y consulta de conocimiento general en su idioma nativo.
- Preservación y revitalización lingüística: base para proyectos de tecnología del lenguaje destinados al bielorruso, aprovechando su licencia Apache 2.0 permisiva.
- Chatbots locales sin conexión: despliegue en dispositivos con GPU de consumo o incluso CPU usando las cuantizaciones Q2_K o Q3_K_S (5,3-6,1 GB).
- Investigación en NLP de lenguas de bajos recursos: punto de partida para fine-tuning adicional con datos propios, dado el tamaño manejable del modelo.
- Traducción y post-edición asistida: como componente en flujos de trabajo de traducción hacia o desde el bielorruso, aunque su rendimiento en esta tarea no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M (8,0 GB) cabe en una GPU de 8-12 GB; Q8_0 (13,8 GB) requiere 16 GB de VRAM; Q2_K (5,3 GB) puede ejecutarse incluso en GPU de 6 GB o en CPU con RAM suficiente.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB para cuantizaciones medias; RTX 4090 (24 GB) para Q8_0 con contexto amplio.
- Cabe en GPUs de consumo: sí, todas las cuantizaciones son viables en hardware doméstico; las más pequeñas (Q2_K, Q3_K_S) funcionan incluso sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. No es un modelo orientado a vLLM o TGI en su versión GGUF (para ello habría que usar el modelo base en safetensors).
- Latencia y throughput: no disponibles; en hardware de consumo, los tamaños de 7-9 GB suelen ofrecer velocidades de decodificación fluidas con offloading parcial a GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|
| zorka-vieniera-12b (GGUF) | 12,9B | bielorruso | Apache 2.0 | GGUF, 11 cuantizaciones |
| Qwen2.5-14B-Instruct | 14,2B | multilingue (incluye bielorruso de forma limitada) | Apache 2.0 (algunas variantes) | safetensors, GGUF |
| Mistral-Nemo-12B | 12,2B | multilingue (sin foco en bielorruso) | Apache 2.0 | safetensors, GGUF |

No hay datos de rendimiento comparativo publicados, por lo que la comparación se limita a tamaño, licencia y disponibilidad. La ventaja diferencial de zorka-vieniera-12b es su especialización en bielorruso, frente a los modelos multilingües generales que ofrecen cobertura superficial de ese idioma.

## Limitaciones y advertencias

- No se ha documentado el rendimiento en tareas de razonamiento, código o matemáticas; el modelo está orientado a texto en bielorruso.
- El dataset karotkizmest carece de documentación pública, por lo que no es posible evaluar sesgos potenciales de los datos de entrenamiento.
- Riesgo de alucinación: no cuantificado; como todo LLM, puede generar información falsa con apariencia verosímil.
- La longitud de contexto no está publicada; debe verificarse antes de desplegar aplicaciones con documentos largos.
- La cuantización Q2_K y las variantes Q3_K pueden degradar notablemente la calidad, especialmente en un idioma de bajos recursos donde cada bit de precisión importa.
- La licencia Apache 2.0 no impone restricciones comerciales relevantes, pero el contenido de los datasets de entrenamiento puede estar sujeto a consideraciones propias.
- Al tratarse de un modelo de autor comunitario sin documentación extensa, se recomienda evaluación propia antes de uso en producción.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/mradermacher/zorka-vieniera-12b-GGUF
- Modelo base: https://huggingface.co/ewxxyyzz/zorka-vieniera-12b
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/zorka-vieniera-12b-i1-GGUF
- Página de descargas con vista general: https://hf.tst.eu/model#zorka-vieniera-12b-GGUF
- Dataset karotkizmest: https://huggingface.co/datasets/ewxxyyzz/karotkizmest
- Corpus GlotCC-V1: https://huggingface.co/datasets/cis-lmu/GlotCC-V1
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
