# DICPlay/RusMind-Vspyshka

## Resumen

RusMind-Vspyshka es un modelo de generación de texto conversacional publicado por DICPlay, un desarrollador que lo presenta como "IA nacional" rusa. Se distribuye exclusivamente en formato GGUF y está diseñado para ejecutarse en el dispositivo (on-device) sin conexión a internet, tanto en ordenadores personales como en teléfonos de gama alta y en el navegador a través de rusmind.ru. Deriva del modelo base google/gemma-4-E4B-it, del que hereda la arquitectura subyacente, y cuenta con 7.518.069.290 parámetros totales según los pesos en safetensors publicados.

El repositorio aloja dos versiones (v3.2, actual, y v2.4) y cuatro variantes de cuantización por versión: Mini (3,8 GB), Lite (4,2 GB), Q4_K_M (5,3 GB) y Q8_0 (8,0 GB), lo que permite desplegarlo desde teléfonos y navegadores hasta equipos con más memoria. El ajuste fino se ha orientado a contenidos en ruso sobre historia de Rusia, legislación federal, cultura, los 89 sujetos de la federación y lo que el autor denomina "valores tradicionales", además de mantener capacidad en inglés.

Su relevancia actual radica en la combinación de tres factores: inferencia totalmente offline, un rango de tamaños que abarca desde 3,8 GB y una licencia propia (RusMind License) que restringe el uso comercial y la redistribución de versiones modificadas. No se han publicado resultados de benchmarks ni especificaciones de longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de google/gemma-4-E4B-it; la model card no detalla la arquitectura interna) |
| Parametros totales | 7.518.069.290 (aproximadamente 7,52 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0 (8,0 GB), Q4_K_M (5,3 GB), Lite (embeddings por capas a 3 bits, capas a 4 bits, 4,2 GB), Mini (embeddings por capas a 2 bits, vocabulario a 4 bits, capas a 4 bits, 3,8 GB) |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | RusMind License (DICPlay), etiquetada como "other"; el modelo base Gemma 4 E4B se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); los safetensors del repositorio suman 7.518.069.290 parámetros |
| Modelo base | google/gemma-4-E4B-it |
| Versiones publicadas | v3.2 (10.10.2026, actual) y v2.4 (09.10.2026) |
| Tamano del repositorio | 30,9 GB |
| Descargas / likes | 106 descargas, 0 likes |
| Compatibilidad de despliegue | llama.cpp, LM Studio, Ollama, navegador (rusmind.ru); etiqueta endpoints_compatible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: se limita a indicar que está construido sobre google/gemma-4-E4B-it, un modelo de Google distribuido bajo Apache 2.0. Por tanto, los detalles sobre tipo de transformer, mecanismos de atención, posible uso de mezcla de expertos o parámetros activos no están disponibles en la información proporcionada. El sufijo "E4B" corresponde a la nomenclatura del modelo base y no se traduce en especificaciones publicadas por DICPlay.

En cuanto al entrenamiento, el autor indica que RusMind se entrenó primero sobre "un enorme conjunto de datos" y después recibió un ajuste fino con conjuntos de datos rusos propios de DICPlay. Estos conjuntos cubren historia de Rusia desde la Rus de Kiev hasta la actualidad, legislación de la Federación Rusa con referencias a artículos, cultura (literatura, poesía de clásicos rusos, arte y tradiciones), los pueblos de Rusia y los 89 sujetos federales con sus capitales, "valores espirituales y morales tradicionales" y la posición oficial de Rusia sobre acontecimientos clave, en ruso y en inglés. Además de sus propios datos, se usaron las particiones de entrenamiento abiertas de MERA y MMLU-ru, excluyendo explícitamente las particiones de test. No se documentan en la información disponible el número de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron técnicas de RLHF, DPO u otras.

La versión 3.2 incorpora los mismos "pasos de entrenamiento" que el modelo RusMind-Momentum e incluye, según el autor, la capacidad de responder correctamente a preguntas de control en inglés sobre su creador y su país de origen, así como una posición explícita sobre "valores familiares tradicionales". La versión 2.4 introdujo la identidad RusMind, poesía de clásicos rusos, correcciones factuales concretas (por ejemplo, el zarévich Alekséi en 1904, los hijos de Nicolás II, las repúblicas de la URSS) y respuestas de "no lo sé" ante preguntas inventadas.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés, con pipeline declarado de text-generation y etiqueta conversational.
- Conocimiento específico inyectado vía ajuste fino sobre historia de Rusia, cronología de acontecimientos, cultura, literatura y poesía de clásicos rusos.
- Consulta de legislación de la Federación Rusa con referencias a artículos, según los datos de entrenamiento declarados.
- Geografía administrativa: los 89 sujetos federales de Rusia y sus capitales.
- Respuestas bilingües: la model card menciona explícitamente que la posición oficial sobre determinados temas se cubre en ruso y en inglés.
- Comportamiento calibrado ante preguntas inventadas, con respuestas de "no lo sé" según lo indicado para la versión 2.4 en adelante.
- Ejecución totalmente offline y on-device, sin llamadas a red, en PC, teléfonos de gama alta y navegador.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card ni en los tags).
- Soporte de agentes y razonamiento multi-paso: no disponible (el tag conversational es el único indicio de interacción, y no hay documentación de planificación o uso de herramientas).
- Capacidades de visión, audio o thinking mode: no disponible.
- Decodificación especulativa, atención lineal u otras optimizaciones: no disponible.

## Casos de uso

- Asistente offline en escritorio: con la variante Q4_K_M (5,3 GB) se puede ejecutar un asistente conversacional completo en un PC de gama media sin conexión, útil en entornos con conectividad restringida o para preservar la privacidad de las conversaciones.
- Aplicación móvil de chat en ruso: las variantes Mini (3,8 GB) y Lite (4,2 GB) están pensadas para teléfonos de gama alta, de modo que la app puede responder sin backend ni coste de inferencia en la nube.
- Asistente integrado en navegador: rusmind.ru carga el modelo una vez y responde después sin internet; el mismo enfoque sirve para desplegar un asistente web sin servidor de inferencia.
- Apoyo educativo sobre historia y cultura rusas: el ajuste fino sobre cronología, literatura y poesía permite usarlo como herramienta de repaso o de generación de material didáctico, siempre con verificación por parte del docente.
- Consulta de referencia legislativa: para localizar y contextualizar artículos de la legislación rusa, con la advertencia de que las respuestas son informativas y no sustituyen asesoramiento jurídico.
- Generación de contenido editorial en ruso: redacción de borradores, resúmenes y textos divulgativos en ruso con un registro controlado, aprovechando el ajuste específico en cultura y tradiciones.
- Traducción y asistencia bilingüe ru-en: al soportar ambos idiomas, puede emplearse para reformular, resumir o adaptar textos entre ruso e inglés, aunque la calidad por tarea no está documentada con métricas.
- Procesamiento de documentos en redes aisladas (air-gapped): organismos o empresas que no pueden enviar datos a la nube pueden desplegar el GGUF con llama.cpp y procesar texto sensible localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card menciona que las particiones de entrenamiento abiertas de MERA y MMLU-ru se usaron para el ajuste fino y que las particiones de test quedaron excluidas, pero no se aportan puntuaciones de MMLU, MMLU-ru, MERA, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Tampoco hay datos comparativos publicados por el autor.

## Requisitos de hardware

- Tamaño de archivo por variante (v3.2): Mini 3,8 GB, Lite 4,2 GB, Q4_K_M 5,3 GB, Q8_0 8,0 GB. La memoria necesaria para inferencia es superior al tamaño del archivo, ya que hay que sumar caché KV, buffers de contexto y overhead del runtime; la model card no publica cifras de VRAM.
- Mini y Lite: orientados explícitamente a teléfonos y PC de gama baja, así que están dentro del rango de dispositivos con pocos gigabytes de memoria disponible.
- Q4_K_M: la variante recomendada "para la mayoría"; con 5,3 GB de pesos es desplegable en GPU de consumo con 8 GB o más de VRAM y en equipos con 8-16 GB de RAM en CPU.
- Q8_0: pensado para "PC con margen de memoria"; con 8,0 GB de pesos encaja en GPU de consumo de 12 GB o más (por ejemplo, gama RTX xx60/xx70 con 12-16 GB) y requiere más RAM si se ejecuta en CPU.
- No hay datos publicados sobre GPU de datacenter (A100, H100) ni sobre latencia o throughput medidos.
- Opciones de despliegue documentadas: llama.cpp (`llama-cli -m v3.2/RusMind-Vspyshka-3.2-Q4_K_M.gguf -cnv`), LM Studio, Ollama y cualquier programa compatible con GGUF. El despliegue en navegador se realiza a través de rusmind.ru. La etiqueta endpoints_compatible sugiere compatibilidad con endpoints de inferencia estándar, aunque no se detalla en la model card.
- No se documentan vLLM, TGI ni TensorRT-LLM como backends soportados en la información disponible.

## Comparativa con modelos similares

El propio autor publica una tabla de familia que permite comparar alternativas dentro del mismo proyecto:

| Modelo | Entorno de ejecución | Enfoque | Disponibilidad |
|---|---|---|---|
| RusMind-Momentum | En dispositivo, sin internet | Respuestas rápidas en teléfonos y PC de gama baja | HuggingFace (DICPlay) |
| RusMind-Vspyshka (este modelo) | En dispositivo, sin internet | Tareas cotidianas en PC potentes y teléfonos de gama alta | HuggingFace (DICPlay) |
| RusMind-Znanie | Nube y PC potentes | Equilibrio entre velocidad y conocimiento; tope de gama abierto de la línea | HuggingFace (DICPlay) |
| RusMind-ATOM | Nube | Tope de gama con tecnología "Multi-Thinking" | En desarrollo, no publicado |

| Criterio | RusMind-Vspyshka | RusMind-Momentum | RusMind-Znanie |
|---|---|---|---|
| Parámetros | 7.518.069.290 | no disponible | no disponible |
| Tamaño mínimo de pesos | 3,8 GB (v3.2 Mini) | no disponible | no disponible |
| Idiomas | ru, en | ru, en (según familia) | ru, en (según familia) |
| Licencia | RusMind License | RusMind License (presumiblemente la misma familia) | RusMind License (presumiblemente la misma familia) |
| Formato | GGUF | GGUF (según proyecto) | no disponible en la información consultada |

Frente al modelo base google/gemma-4-E4B-it, RusMind-Vspyshka añade ajuste fino específico en ruso y una licencia propia más restrictiva que la Apache 2.0 del original. No se dispone de datos de parámetros, contexto ni rendimiento de otros modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- Sesgo ideológico explícito: el ajuste fino incluye "la posición oficial de Rusia", "valores tradicionales" y "valores espirituales y morales tradicionales", además de preguntas de control sobre quién creó el modelo y a qué país pertenece. Esto implica una alineación de valor deliberada que condiciona las respuestas en temas políticos, históricos, familiares y geopolíticos.
- Riesgo de alucinación: el propio autor advierte de que el modelo "puede equivocarse" y recomienda verificar la información importante.
- Ámbito médico, jurídico y financiero: las respuestas son de carácter informativo y no sustituyen a un profesional, según la model card. Esto es especialmente relevante porque el modelo se ha ajustado con contenido legislativo y podría inducir a confiar en respuestas legales no verificadas.
- Idiomas limitados: solo ruso e inglés. No hay soporte documentado de castellano ni de otras lenguas.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que dificulta planificar tareas de documento largo o conversaciones extensas.
- Restricciones de licencia: uso gratuito solo para fines personales, no comerciales, de investigación y evaluación. El uso comercial, la reventa, la distribución de versiones modificadas o reentrenadas y la integración en productos requieren un contrato escrito con DICPlay. Esto descarta de facto muchos escenarios de producción sin negociación previa.
- Obligaciones heredadas del modelo base: al derivar de Gemma 4 E4B (Apache 2.0), siguen aplicándose las condiciones de esa licencia, cuyo texto se incluye en LICENSE-GEMMA-APACHE-2.0.txt.
- Validación comunitaria mínima: 106 descargas y 0 likes, sin benchmarks publicados ni evaluaciones independientes. No hay evidencia pública de rendimiento frente a alternativas.
- Versionado: el autor recomienda usar siempre la versión más reciente (v3.2); las versiones anteriores se conservan solo por histórico y no deberían emplearse en producción.
- Versionado de pesos y mezcla de cuantizaciones: Lite y Mini comprimen de forma distinta los embeddings por capas y el vocabulario respecto a las capas del transformer, por lo que la pérdida de calidad no es uniforme y puede afectar de manera desigual a tareas que dependen del vocabulario o de representaciones de entrada.
- Ausencia de datos de despliegue a escala: no se documentan latencias, throughput ni comportamiento bajo concurrencia, por lo que cualquier estimación de capacidad en producción debe medirse en el entorno real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Carpeta de la versión actual v3.2: https://huggingface.co/DICPlay/RusMind-Vspyshka/tree/main/v3.2
- Carpeta de la versión 2.4: https://huggingface.co/DICPlay/RusMind-Vspyshka/tree/main/v2.4
- Repositorio relacionado con la misma versión: https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka
- Modelo de la familia RusMind-Momentum: https://huggingface.co/DICPlay/RusMind-Momentum
- Modelo de la familia RusMind-Znanie: https://huggingface.co/DICPlay/RusMind-Znanie
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Demo y despliegue en navegador: https://rusmind.ru
- Licencia del modelo (RusMind License): https://huggingface.co/DICPlay/RusMind-Vspyshka/blob/main/LICENSE
- Texto de la licencia Apache 2.0 del modelo base: https://huggingface.co/DICPlay/RusMind-Vspyshka/blob/main/LICENSE-GEMMA-APACHE-2.0.txt
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: el resto de resultados de la búsqueda web consultada (repositorios de interfaces gráficas y generadores de arte no relacionados) no guardan relación con este modelo y se han omitido.
