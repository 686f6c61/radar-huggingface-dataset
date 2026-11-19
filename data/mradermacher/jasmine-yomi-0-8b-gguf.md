# mradermacher/jasmine-yomi-0.8b-GGUF

## Resumen

jasmine-yomi-0.8b es un modelo especializado en la conversión de grafemas a fonemas (G2P) del japonés, concretamente en la lectura de kanji (yomi) y la generación de furigana. Lo desarrolla pakutoma y esta versión GGUF la publica mradermacher como cuantización estática del modelo original. Resuelve un problema muy concreto del procesado de lenguaje natural en japonés: determinar la lectura correcta de un kanji o de una secuencia de kanjis en función del contexto, algo que los tokenizadores y los modelos generalistas suelen fallar por la ambigüedad inherente de la escritura japonesa.

El modelo tiene 752.393.024 parámetros (aproximadamente 0,8 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para una tarea única. La arquitectura se etiqueta como qwen3_5 en los metadatos del repositorio, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada a la tarea de lectura japonesa. El modelo está entrenado exclusivamente en japonés y se distribuye bajo licencia Apache 2.0.

La relevancia práctica de este modelo radica en su tamaño reducido y su especialización: puede ejecutarse en CPU o en GPUs de gama baja con cuantizaciones de 0,5 a 0,9 GB, lo que lo hace viable para pipelines de preprocesado de texto japonés, sistemas de accesibilidad, motores de síntesis de voz y anotación lingüística a gran escala sin necesidad de infraestructura pesada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetada como qwen3_5 en los metadatos) |
| Parámetros totales | 752.393.024 (aproximadamente 0,8B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen3_5 presente en los metadatos del repositorio, que apunta a una base derivada de la familia Qwen 3.5. El modelo es un transformer de aproximadamente 752 millones de parámetros, diseñado específicamente para la tarea de G2P japonesa: dado un texto con kanjis, predecir su lectura en hiragana o katakana y, por extensión, generar furigana.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF es una plantilla estándar de mradermacher que no incluye detalles del entrenamiento del modelo original; para obtener esa información habría que consultar la model card del modelo base pakutoma/jasmine-yomi-0.8b.

## Capacidades

- Conversión de grafemas a fonemas (G2P) para texto japonés: transforma kanjis y secuencias mixtas en su lectura fonética.
- Lectura de kanji (yomi): determina la lectura correcta de un kanji según el contexto, resolviendo ambigüedades entre lecturas on'yomi y kun'yomi.
- Generación de furigana: produce anotaciones de lectura sobre los kanjis para textos dirigidos a lectores no nativos o sistemas de accesibilidad.
- Procesamiento de texto japonés exclusivamente; no se documenta soporte para otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Preprocesado para síntesis de voz (TTS) en japonés: el modelo convierte texto con kanjis a su lectura fonética antes de pasarlo a un motor TTS, evitando errores de pronunciación en nombres propios y compuestos kanji poco frecuentes.
- Anotación de furigana en materiales educativos: se usa para generar automáticamente las lecturas sobre kanjis en textos escolares o para estudiantes de japonés, reduciendo el trabajo manual de anotación.
- Indexación y búsqueda fonética: al convertir documentos japoneses a su lectura, se puede construir un índice de búsqueda por sonido que funcione aunque el usuario escriba en kana lo que en el documento aparece en kanji.
- Procesamiento de nombres propios y topónimos: los nombres japoneses presentan lecturas irregulares que los modelos generalistas suelen fallar; un modelo especializado en yomi mejora la precisión en la normalización de entidades.
- Integración en pipelines de NLP japonés: como paso previo a tokenizadores, analizadores morfológicos o sistemas de traducción automática que necesitan la lectura fonética para desambiguar.
- Sistemas de accesibilidad y lectura asistida: generación de ruby (furigana) para lectores de pantalla o aplicaciones que asisten a personas con dificultades de lectura de kanjis.
- Normalización de texto para motores de búsqueda y comparación: convertir variantes de escritura a una representación fonética común para deduplicación y matching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,6 GB (f16) según la cuantización; las cuantizaciones recomendadas Q4_K_M y Q4_K_S ocupan aproximadamente 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3050, RTX 4060 y superiores. También puede ejecutarse en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo actual e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (0,8B) se espera una latencia muy baja en GPU y aceptable en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de G2P japonés en la documentación proporcionada. Como referencia de categoría, se puede comparar con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| jasmine-yomi-0.8b-GGUF (este) | 752M | No disponible | ja | Apache 2.0 | GGUF |
| pakutoma/jasmine-yomi-0.8b (base) | 752M | No disponible | ja | Apache 2.0 | safetensors |
| Alternativas G2P japonés | No disponible | No disponible | ja | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo monoidioma: solo procesa japonés; no es adecuado para tareas multilingües ni para generación de texto general.
- Especialización estrecha: está diseñado para G2P/yomi; no se debe esperar razonamiento, código, matemáticas ni conversación general.
- Riesgo de error en lecturas ambiguas: la lectura de kanjis depende del contexto y existen casos irregulares (nanori, ateji) que pueden producir errores; conviene validar en dominios específicos como nombres propios.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir lecturas plausibles pero incorrectas; en producción se recomienda un mecanismo de verificación o confianza.
- Sin datos de benchmarks: no hay métricas publicadas que permitan estimar la precisión frente a alternativas, lo que dificulta la evaluación previa a producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribución correspondiente.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar la precisión en una tarea sensible al detalle como la lectura de kanjis; se recomienda Q4_K_M o superior para producción.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en japonés puede reflejar sesgos presentes en los corpus de texto japoneses utilizados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/jasmine-yomi-0.8b-GGUF
- Modelo base: https://huggingface.co/pakutoma/jasmine-yomi-0.8b
- Página de descargas del cuantizador: https://hf.tst.eu/model#jasmine-yomi-0.8b-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
