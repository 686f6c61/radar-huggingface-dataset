# mradermacher/Heretic-Scalpel-E2B-i1-GGUF

## Resumen

Heretic-Scalpel-E2B-i1-GGUF es un repositorio de cuantizaciones GGUF en formato imatrix (etiquetadas como i1) del modelo aifeifei798/Heretic-Scalpel-E2B, publicado por el usuario mradermacher. El modelo base tiene 4.647.450.147 parámetros según los pesos en safetensors y está etiquetado como conversacional, en inglés y con licencia apache-2.0. El repositorio de cuantizaciones ocupa 50,2 GB e incluye 15 ficheros GGUF más el fichero imatrix empleado para generarlos.

El nombre del modelo remite a dos elementos: "Heretic", la herramienta de eliminación automática de censura basada en ablación direccional (abliteration) más un optimizador TPE con Optuna, y "Scalpel", presumiblemente el ajuste fino concreto aplicado sobre la base. El sufijo E2B y el campo license_link, que apunta a la licencia de Gemma, sugieren un linaje Gemma, aunque esta circunstancia no se confirma de forma explícita en la información disponible y no debe darse por sentada.

La relevancia de esta ficha es práctica: se trata de un modelo pequeño (entre 3,1 y 3,9 GB por cuantización) que puede ejecutarse en hardware de consumo, en CPU o en GPU modestas, con pesos ya decensurados. El autor del repositorio advierte además de que el modelo base es un modelo de visión, de modo que los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estáticas y no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre E2B y el enlace de licencia a Gemma apuntan a una base de esa familia, sin confirmar) |
| Parametros totales | 4.647.450.147 (~4,65 B) segun los pesos safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (mas fichero imatrix) |
| Idiomas soportados | en (segun model card y etiquetas del repositorio) |
| Licencia | apache-2.0 en el repositorio; el campo license_link apunta a la licencia de Gemma, lo que genera ambiguedad (ver limitaciones) |
| Formato de pesos | GGUF (cuantizaciones imatrix/i1). El modelo base se distribuye en safetensors |
| Tamano del repositorio | 50,2 GB en total |
| Tamano por cuantizacion | 3,1 GB (i1-Q2_K) a 3,9 GB (i1-Q6_K); el fichero imatrix ocupa 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en los materiales consultados. Los indicios disponibles son indirectos: el sufijo "E2B" (habitual en denominaciones de modelos con parámetros efectivos reducidos frente a los totales) y el enlace de licencia a la documentación de Gemma 4, que sugiere que la base procede de esa familia. El recuento real de parámetros en safetensors, 4.647.450.147, es el único dato estructural confirmado. No se especifican tipo de transformer, número de capas, atención utilizada ni presencia de mezcla de expertos.

Respecto al entrenamiento, el nombre indica que el modelo ha pasado por Heretic, una herramienta que combina una implementación avanzada de ablación direccional (abliteration) con un optimizador de parámetros basado en TPE y Optuna. Heretic busca de forma automática parámetros de ablación que minimicen simultáneamente el número de rechazos y la divergencia KL respecto al modelo original, de modo que el modelo decensurado conserve la mayor parte posible de la inteligencia del modelo de partida. No se han publicado en la información disponible ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO. Las cuantizaciones de este repositorio se han generado con fichero imatrix, lo que habitualmente reduce la pérdida de perplejidad en bits bajos frente a cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, con el formato de chat heredado del modelo base.
- Comportamiento decensurado: por construcción, el proceso de abliteración reduce las negativas y los avisos moralizantes del modelo original.
- Capacidad de visión: el autor de las cuantizaciones indica que el modelo base es un modelo de visión y que los ficheros mmproj, si los hay, se encuentran en el repositorio de cuantizaciones estáticas. La disponibilidad efectiva del mmproj no se confirma en este repositorio.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere compatibilidad con APIs de tipo OpenAI al servirse mediante herramientas locales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado; no hay evidencia de soporte de otros idiomas.
- Modo thinking explícito: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Inferencia local en equipos sin GPU dedicada: con la cuantización i1-Q4_K_M (3,5 GB) el modelo cabe en la RAM de un portátil convencional y puede ejecutarse con llama.cpp, lo que permite disponer de un asistente conversacional sin conexión ni coste por token.
- Asistente conversacional con datos sensibles: al ejecutarse íntegramente en local, el texto del usuario no sale de la máquina, lo que resulta adecuado para borradores legales, notas clínicas o documentación interna que no puede enviarse a servicios en la nube.
- Generación de texto creativo sin filtros editoriales: la naturaleza decensurada del modelo permite trabajar ficción, guiones o contenido de tono adulto sin las negativas habituales de los modelos alineados, siempre que el uso cumpla la legalidad aplicable.
- Investigación sobre alineación y seguridad: al ser el resultado de un proceso de abliteración reproducible con Heretic, sirve para estudiar cuánto rendimiento se pierde al eliminar la alineación de seguridad y comparar curvas de rechazo frente a divergencia KL.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 15 variantes entre 3,1 y 3,9 GB, lo que permite medir en un mismo modelo el impacto de i1-Q2_K frente a i1-Q6_K en perplejidad y calidad de respuesta sobre el mismo conjunto de prompts.
- Despliegue en pipelines por lotes: al ser un GGUF pequeño y con etiqueta endpoints_compatible, puede exponerse tras un servidor compatible con la API de OpenAI y usarse para clasificación, resumen o reescritura masiva de textos en inglés a bajo coste por elemento.
- Procesamiento de imagen (condicionado): si se obtiene el fichero mmproj del repositorio estático, el modelo podría emplearse para descripción de imágenes u OCR ligero en local; esta capacidad no está confirmada en la documentación de este repositorio.
- Prototipado rápido en estaciones de trabajo con GPU de gama media: al ocupar menos de 4 GB, permite reservar el resto de la VRAM para contexto largo o para ejecutar varios modelos en paralelo durante pruebas A/B de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio de cuantizaciones ni los resultados de búsqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de rechazo posteriores a la abliteración.

## Requisitos de hardware

- VRAM estimada: el peso de los ficheros va de 3,1 GB (i1-Q2_K) a 3,9 GB (i1-Q6_K). A esa cifra hay que sumar el espacio de la caché KV y el contexto, que no puede calcularse porque se desconoce la longitud de contexto del modelo. Como regla práctica, reservar entre 0,5 y 1,5 GB adicionales según la ventana configurada.
- Cabe en GPU de consumo: sí. Cualquier GPU con 6 GB o más (GTX 1660, RTX 2060, RTX 3060, RTX 4060, RTX 4090) puede alojar las cuantizaciones de 4 bits y superiores. Las cuantizaciones i1-Q2_K e i1-IQ3_S son las más adecuadas para GPU de 4 a 6 GB.
- Ejecución en CPU: viable con 6-8 GB de RAM del sistema para las cuantizaciones de 4 bits, con velocidades de generación dependientes del número de núcleos.
- GPU de centro de datos (A100, H100, L40S): soportadas, pero sobredimensionadas para 4,65 B de parámetros; su uso solo se justifica para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI. El soporte de GGUF en vLLM es experimental y conviene verificarlo en la versión concreta antes de usarlo en producción.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento con alternativas de la misma categoría. La siguiente tabla recoge únicamente las relaciones conocidas entre este repositorio y sus artefactos asociados.

| Artefacto | Contenido | Formato | Tamano | Licencia declarada |
|---|---|---|---|---|
| mradermacher/Heretic-Scalpel-E2B-i1-GGUF (este repositorio) | 15 cuantizaciones imatrix/i1 mas fichero imatrix | GGUF | 3,1-3,9 GB por cuantizacion; 50,2 GB el repo completo | apache-2.0, con enlace a licencia de Gemma |
| mradermacher/Heretic-Scalpel-E2B-GGUF | Cuantizaciones estaticas y, en su caso, ficheros mmproj | GGUF | no disponible | apache-2.0 (segun el repositorio de referencia) |
| aifeifei798/Heretic-Scalpel-E2B | Modelo base sin cuantizar | safetensors | 4.647.450.147 parametros | apache-2.0, con enlace a licencia de Gemma |

## Limitaciones y advertencias

- Ambigüedad de licencia: el repositorio declara apache-2.0, pero el campo license_link remite a la licencia de Gemma 4. Si el modelo base deriva de Gemma, la licencia efectiva podría ser la de Gemma y no apache-2.0. Debe verificarse antes de cualquier uso comercial.
- Modelo decensurado: al haber sido procesado con Heretic, el modelo presenta una alineación de seguridad reducida de forma deliberada. Puede generar contenido que otros modelos rechazarían. El despliegue en productos de cara al público exige filtros propios y revisión legal.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual para este modelo ni para su base. Con 4,65 B de parámetros, la tasa de error en tareas de conocimiento factual será previsiblemente alta en comparación con modelos de mayor tamaño.
- Idioma: solo se declara inglés. No hay evidencia de competencia en castellano ni en otros idiomas, por lo que no se recomienda su uso en producción multilingüe sin evaluación previa.
- Contexto: se desconoce la longitud de contexto soportada. Cualquier estimación de uso en conversaciones largas o con documentos extensos carece de base documental.
- Cuantizaciones de bits muy bajos: las variantes i1-Q2_K e i1-Q3_K_S están en el rango en el que la degradación de calidad es apreciable. El propio autor anota, para varios formatos, qué alternativa considera mejor (por ejemplo, "IQ3_XXS probably better" frente a Q2_K, o "beats Q3_K*" para IQ3_S).
- Vision no confirmada: la afirmación de que el modelo es multimodal procede de una nota genérica del cuantizador. Sin el fichero mmproj no hay capacidad de imagen operativa, y este repositorio no lo incluye.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe una comunidad que haya validado su comportamiento en producción.
- Trazabilidad limitada: no se documentan dataset de entrenamiento, número de tokens, método de ajuste ni parámetros de abliteración empleados, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Repositorio de cuantizaciones (este modelo): https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-i1-GGUF
- Modelo base: https://huggingface.co/aifeifei798/Heretic-Scalpel-E2B
- Repositorio de cuantizaciones estaticas y posibles ficheros mmproj: https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-GGUF
- Pagina de resumen y descarga del cuantizador: https://hf.tst.eu/model#Heretic-Scalpel-E2B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Heretic-Scalpel-E2B-i1-GGUF/resolve/main/Heretic-Scalpel-E2B.imatrix.gguf
- Herramienta Heretic (repositorio original): https://github.com/p-e-w/heretic
- Heretic (fork): https://github.com/clanker25/heretic
- Licencia referenciada en la model card: https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de ficheros GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantizacion (grafico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
