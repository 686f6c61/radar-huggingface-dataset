# luban2026/lubanai-private-e2b

## Resumen

LubanAI Private (E2B) es un modelo de lenguaje de tipo on-device desarrollado por LubanAI en el AI Learning Center (AILC) de Mascate, Omán. Se trata de un ajuste fino del modelo base `google/gemma-4-E2B-it` de Google, orientado a ejecutarse íntegramente en un teléfono móvil Android mediante LiteRT-LM, sin que los datos del usuario abandonen el dispositivo. El modelo resuelve el problema de la asistencia conversacional con privacidad estricta: responde a partir de los ficheros locales del usuario invocando herramientas de búsqueda en una base de conocimiento y citando los pasajes utilizados.

El ajuste se centra en cuatro capacidades concretas: invocación de herramientas locales (`kb_search`, `kb_lookup`, `kb_read_page`, `kb_neighbours`, `kb_list_files`), uso de calculadora y fechas (gregoriana e hijri), respuesta en el idioma de la pregunta (árabe o inglés) e identidad propia como asistente privado de LubanAI. Conserva del modelo base las capacidades de visión (lectura de texto, incluido árabe) y entrada de voz.

Con un tamaño de repositorio de 4,0 GB y un único fichero de pesos en formato `.litertlm`, el modelo está pensado para despliegue en dispositivos de gama media-alta con aceleración int8. Su relevancia actual radica en que demuestra un flujo completo de ajuste LoRA sobre pesos QAT móviles y exportación a un runtime de inferencia en dispositivo, con una mejora medida muy sustancial frente al modelo base en tareas de recuperación documental con herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), decodificador exportado con LiteRT-LM |
| Parámetros totales | no disponible (clase 2B según el autor) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (pesos del decodificador); pesos QAT móviles del modelo base |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Apache 2.0 (con enlace a la licencia Gemma 4) |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero de 4.035.362.816 bytes, sha256 `aead084da36ff6adeff1cb1487490daf3d32526fb31fcbc1a0e5db356d3dfca3` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer de la familia Gemma 4 en su variante E2B. El ajuste se realizó mediante LoRA de rango 16 aplicado a las capas de atención y MLP, entrenado sobre aproximadamente 1.080 ejemplos bilingües (árabe e inglés) escritos específicamente para la aplicación: llamadas a herramientas en el formato exacto de la app, respuestas fundamentadas en documentos ficticios, identidad y respuestas conversacionales destiladas del modelo base. El entrenamiento se ejecutó sobre los pesos QAT móviles de Google (`google/gemma-4-E2B-it-qat-mobile-transformers`) con su redondeo estático de activaciones.

Tras el entrenamiento, el adaptador se fusionó y el decodificador de texto se exportó con `litert-torch` en int8. El paquete conserva byte a byte las secciones publicadas por Google en `litert-community/gemma-4-E2B-it-litert-lm`: tokenizador, embedders, codificador de audio y codificador de visión. Solo el decodificador es propio. El drafter de decodificación especulativa no está incluido en el bundle.

## Capacidades

- Generación de texto conversacional en árabe e inglés, respondiendo en el idioma de la pregunta.
- Invocación de herramientas locales de base de conocimiento: `kb_search`, `kb_lookup`, `kb_read_page`, `kb_neighbours`, `kb_list_files`.
- Citación de los pasajes utilizados para fundamentar las respuestas.
- Aritmética mediante la herramienta `calc` y gestión de fechas gregorianas e hijri mediante `today`.
- Razonamiento multi-step con herramientas (10/10 en la evaluación interna con herramientas simuladas).
- Resistencia a instrucciones maliciosas incrustadas en documentos (8/8 en la evaluación interna).
- Identidad propia como asistente privado de LubanAI (20/20 en la evaluación interna).
- Visión: lectura de texto en imágenes, incluido árabe, heredada del modelo base.
- Entrada de voz heredada del modelo base (codificador de audio incluido en el bundle).
- Ejecución completamente local en dispositivo, sin salida de datos a red.

## Casos de uso

- Asistente documental privado en móvil: el modelo indexa y consulta los ficheros del usuario mediante las herramientas `kb_*`, citando los pasajes empleados. Adecuado porque toda la inferencia ocurre en el dispositivo y no requiere conectividad.
- Búsqueda semántica y recuperación exacta sobre corpus personales: con `kb_search` y `kb_lookup` puede localizar pasajes por similitud o por coincidencia exacta, útil para contratos, apuntes o manuales almacenados en el teléfono.
- Resumen y lectura de documentos escaneados: gracias al codificador de visión heredado, puede extraer texto de imágenes, incluido árabe, y responder preguntas sobre él.
- Asistencia bilingüe árabe-inglés en atención al usuario: responde en el idioma de la consulta, lo que lo hace apto para usuarios de Oriente Medio que alternan ambos idiomas.
- Cálculos y gestión de fechas en contextos administrativos: la herramienta `calc` y la conversión gregoriana-hijri cubren casos de planificación y trámites en regiones donde el calendario hijri es de uso habitual.
- Dictado y consulta por voz: la entrada de audio permite formular preguntas habladas y obtener respuestas textuales, útil en movilidad o accesibilidad.
- Despliegue embebido en aplicaciones Android con requisitos de cumplimiento: al no salir datos del dispositivo, encaja en escenarios con normativa de protección de datos estricta (sanitario, legal, financiero) donde el envío a la nube es inviable.

## Benchmarks y rendimiento

Evaluación interna del autor con 150 casos bilingües (árabe/inglés) con herramientas simuladas, ejecutada en CPU con LiteRT-LM. El modelo base recibió el mismo system prompt y las mismas herramientas.

| Conjunto de casos | LubanAI Private E2B | Gemma 4 E2B base |
|---|---|---|
| Todos los casos | 140/150 (93 %) | 66/150 (44 %) |
| Búsqueda en ficheros | 29/30 | 1/30 |
| Búsqueda exacta | 10/14 | 1/14 |
| Multi-step | 10/10 | 0/10 |
| Ignora instrucciones dentro de documentos | 8/8 | 0/8 |
| Identidad | 20/20 | 17/20 |
| Cálculo / fecha / conversación trivial | 38/38 | 37/38 |
| Idioma de respuesta | 150/150 | 150/150 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero de pesos ocupa 4,0 GB en int8; se requiere al menos esa cantidad de memoria libre en el dispositivo, más el overhead del runtime LiteRT-LM.
- GPU recomendadas: no aplica en el sentido de GPU de servidor; el destino es la NPU/GPU integrada de smartphones Android compatibles con LiteRT-LM.
- ¿Cabe en GPU de consumo? No está diseñado para GPU de escritorio; el runtime objetivo es LiteRT-LM en Android. No se dispone de datos de ejecución en GPU de consumo (RTX 4090, etc.).
- Opciones de despliegue: LiteRT-LM (runtime oficial del formato `.litertlm`), integrado en la aplicación LubanAI o en apps que repliquen sus esquemas de herramientas. No se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados.
- Latencia y throughput: no disponibles en la información proporcionada; la evaluación se ejecutó en CPU con LiteRT-LM, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| LubanAI Private E2B | clase 2B | no disponible | ar, en | Apache 2.0 | `.litertlm` | On-device Android con tool calling documental |
| google/gemma-4-E2B-it (base) | clase 2B | no disponible | multilingüe (no detallado) | Gemma 4 | safetensors / LiteRT-LM | Modelo generalista de Google |
| litert-community/gemma-4-E2B-it-litert-lm | clase 2B | no disponible | multilingüe (no detallado) | Gemma 4 | `.litertlm` | Exportación oficial a LiteRT-LM |

La comparación cuantitativa disponible se limita al modelo base: LubanAI Private E2B obtiene 140/150 frente a 66/150 en la evaluación interna del autor, con una ventaja especialmente marcada en búsqueda en ficheros (29/30 frente a 1/30) y multi-step (10/10 frente a 0/10). No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos on-device de la misma categoría.

## Limitaciones y advertencias

- Modelo de clase 2B: cuando se le permite responder fuera de los ficheros del usuario, puede afirmar hechos incorrectos; se le instruye a etiquetar esas respuestas como generales y no procedentes de los documentos.
- Puede citar un pasaje vecino en lugar del que responde exactamente a la consulta.
- El uso de herramientas requiere la aplicación LubanAI o esquemas de herramientas idénticos; sin herramientas se comporta como un modelo de chat convencional.
- Si se le pide transcribir una petición hablada, puede responder a la petición en lugar de transcribirla.
- Idiomas limitados a árabe e inglés; no se detalla cobertura de otros idiomas.
- No se especifican sesgos conocidos más allá de los inherentes al modelo base y al corpus de ajuste (aproximadamente 1.080 ejemplos sintéticos).
- Licencia Apache 2.0 con enlace a la licencia Gemma 4; conviene revisar los términos de la licencia Gemma 4 para uso comercial, ya que el modelo base impone condiciones adicionales.
- El drafter de decodificación especulativa no está incluido, por lo que no se aprovecha esa aceleración.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia para documentos extensos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luban2026/lubanai-private-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Pesos QAT móviles del base: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Bundle oficial LiteRT-LM del base: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- LiteRT-LM (runtime): https://github.com/google-ai-edge/LiteRT-LM
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- AI Learning Center (AILC), Mascate: www.ailc-oman.com
