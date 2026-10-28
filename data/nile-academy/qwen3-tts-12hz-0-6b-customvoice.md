# nile-academy/qwen3-tts-12hz-0.6b-customvoice

## Resumen

`nile-academy/qwen3-tts-12hz-0.6b-customvoice` es un checkpoint de síntesis de voz (text-to-speech) publicado en HuggingFace por la cuenta nile-academy, que actúa como catálogo o espejo de terceros y no como desarrollador original del modelo. El artefacto corresponde a la variante compacta CustomVoice de la familia Qwen3-TTS e incluye el tokenizador y codec de voz original integrado, que opera a 12 Hz, junto con nueve timbres predefinidos. No incorpora grabaciones de referencia, identidades clonadas ni voces generadas.

El repositorio contiene únicamente datos declarativos (pesos en safetensors, ficheros de configuración del tokenizador y avisos legales), con un tamaño total de 2,5 GB y 905.788.672 parámetros según los metadatos de safetensors. No incluye SDK, binarios de ejecución, código Python o Node, ni motor de inferencia alguno: para generar audio hace falta una implementación compatible que se cualifique por separado. La licencia es Apache 2.0 y cubre diez idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano).

Su relevancia ahora es la de un punto de partida ligero para evaluar TTS multilingüe de la familia Qwen3 en entornos con recursos limitados, pero con una advertencia importante: el autor del espejo declara explícitamente que la calidad por idioma y voz no está medida de forma independiente, que el rendimiento en móvil y navegador no está cualificado y que el paquete no refleja el consumo real de memoria en ejecución. La longitud de contexto y los detalles de arquitectura interna no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de text-to-speech con tokenizador y codec de voz integrado a 12 Hz; la model card no describe la topologia de la red) |
| Parametros totales | 905.788.672 (~0,91 mil millones, dato de safetensors) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors en el layout original) |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it (10 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,5 GB |
| Pipeline declarado | text-to-speech |
| Timbres integrados | 9 (voces predefinidas, sin grabaciones de referencia) |
| Frecuencia del codec de voz | 12 Hz |
| Autor del repositorio | nile-academy (espejo de terceros; el publicador original del modelo es otro) |
| Fecha de creacion / actualizacion | 2026-10-28 / 2026-10-28 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna del modelo: no se especifica si el backbone es un transformer denso, un decoder autorregresivo sobre tokens de audio ni la composición exacta del codec. Lo que sí se documenta es que el paquete incluye el tokenizador y codec de voz original integrado, que trabaja a una tasa de 12 Hz, y que el checkpoint pertenece a la variante CustomVoice de la familia Qwen3-TTS, en su escalón compacto, seleccionada frente al tier superior de 1,7B del mismo fabricante.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del corpus, uso de RLHF o DPO, ni innovaciones técnicas concretas más allá de la citada integración del codec a 12 Hz y de los nueve timbres predefinidos. El autor del espejo remite al informe técnico del publicador (arXiv:2601.15621) como evidencia primaria de selección del checkpoint, y separa explícitamente la calidad reportada por el publicador de cualquier medición independiente, que no aporta.

## Capacidades

- Síntesis de voz a partir de texto en diez idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Generación con nueve timbres integrados (CustomVoice), sin necesidad de grabaciones de referencia para seleccionar una voz.
- Tokenizador y codec de voz propio a 12 Hz incluido en el paquete, lo que evita depender de un codec externo para la decodificación de audio.
- Distribución en safetensors con comprobaciones estructurales y de integridad declaradas por el autor del espejo, junto con un `source-manifest.json` que fija revisiones y hashes del origen.
- Soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión o audio de entrada: no disponible o no aplicable (es un modelo de TTS, no un modelo de lenguaje de propósito general).
- Modo thinking, visión o audio de entrada: no disponible en la información proporcionada.
- Clonación de voz: no soportada en este paquete, que excluye explícitamente grabaciones de referencia e identidades clonadas.

## Casos de uso

- Lectura de artículos y documentación técnica: el modelo convierte texto en audio en diez idiomas, lo que permite generar versiones locutadas de documentación para equipos distribuidos; conviene validar antes la inteligibilidad por idioma, que el autor del espejo no ha medido.
- Locución de interfaces de asistente en aplicaciones de escritorio o web: los nueve timbres integrados permiten ofrecer varias voces sin gestionar grabaciones de referencia, siempre que se cualifique previamente rendimiento en navegador, que queda declarado como no evaluado.
- Generación de avisos y mensajes cortos en sistemas de atención al cliente: el tamaño compacto (~0,91 mil millones de parámetros) facilita el despliegue en infraestructura modesta para respuestas habladas de un solo turno, sin depender de servicios externos.
- Accesibilidad y lectura de pantalla: integración en lectores de contenido para convertir artículos o formularios en audio en el idioma del usuario, con la advertencia de que la estabilidad en textos largos está declarada como pendiente de cualificar.
- Prototipado de productos de voz en fase de investigación: al ser un paquete de datos sin runtime, sirve para comparar el escalón de 0,6B frente al de 1,7B de la misma familia en un banco de pruebas propio antes de fijar la arquitectura de producción.
- Generación de material de formación multilingüe: producir pistas de audio para cursos en español, inglés, francés o alemán a partir del mismo guion, revisando manualmente la pronunciación por idioma y la calidad de cada timbre.
- Pruebas de regresión de pipelines de audio: usar el checkpoint como referencia fija (con hashes y revisiones ancladas en `source-manifest.json`) para detectar cambios en el codec o el tokenizador entre versiones del motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo remite al informe técnico del publicador (arXiv:2601.15621), pero no reproduce cifras de calidad, inteligibilidad ni comparativas numéricas, y el autor declara de forma explícita que la calidad reportada por el publicador es distinta de cualquier medición independiente, que no aporta. Tampoco hay datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras oficiales. Como referencia aritmética a partir de los 905.788.672 parámetros, los pesos en bf16 ocuparían del orden de 1,8 GB y en fp32 del orden de 3,6 GB; a esto hay que sumar el decodificador y el codec de voz, y el propio autor advierte que el nombre del paquete no equivale al consumo real de memoria.
- GPU recomendadas: no disponible (no se publican perfiles de GPU ni requisitos oficiales).
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más si el motor de inferencia elegido soporta la arquitectura, aunque esta afirmación no está respaldada por documentación del repositorio.
- Opciones de despliegue: el repositorio no incluye motor, SDK ni binarios, y no declara compatibilidad con vLLM, llama.cpp, Ollama o TGI. La model card indica que los ficheros de configuración son datos para una implementación empaquetada que debe cualificarse por separado.
- Latencia y throughput: no disponible. El autor del espejo marca como puertas independientes la inferencia nativa, la estabilidad en formato largo y el rendimiento sostenido en móvil y navegador, sin resultados publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-tts-12hz-0.6b-customvoice (este) | 905.788.672 | no disponible | 10 | apache-2.0 | safetensors, espejo de terceros |
| Qwen3-TTS 1.7B (tier superior de la misma familia) | no disponible | no disponible | no disponible | no disponible | mencionado en la model card, sin datos tecnicos |
| Otros sistemas TTS open source comparables | no disponible | no disponible | no disponible | no disponible | sin datos verificados en la informacion proporcionada |

La información disponible no permite una comparación numérica fiable: el único término de comparación citado es el escalón de 1,7B de la propia familia Qwen3-TTS, del que no se aportan parámetros exactos, contexto, idiomas ni resultados. Los resultados de búsqueda web obtenidos no guardan relación con el modelo (corresponden a un río, una agencia de asuntos públicos y una marca de ropa), por lo que no aportan alternativas verificables.

## Limitaciones y advertencias

- El repositorio es un espejo de un tercero (nile-academy) y no la publicación oficial del desarrollador original; la procedencia debe contrastarse contra el informe técnico citado antes de usarlo en producción.
- No incluye motor de inferencia, fonemizador, librería de marca de agua ni código ejecutable: sin una implementación compatible y cualificada, el paquete por sí solo no genera audio.
- Calidad no verificada de forma independiente: el autor declara que no afirma que todas las voces e idiomas tengan la misma calidad y que la medición independiente queda fuera de su alcance.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que implica ausencia de informes de terceros sobre fallos o comportamiento.
- Discrepancia de nomenclatura: el identificador indica 0,6B, mientras que safetensors arroja 905.788.672 parámetros; conviene no dimensionar infraestructura a partir del nombre.
- Estabilidad en formato largo, inteligibilidad en todos los idiomas y rendimiento sostenido en móvil y navegador están declarados como puertas no superadas o no cualificadas.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta: no hay datos publicados sobre tasa de errores de pronunciación por idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial sujeto a sus términos, pero no concede derechos sobre identidades de terceros, grabaciones de referencia ni contenido de aplicación; los derechos de motores, fonemizadores y librerías de marca de agua requieren acuerdos separados.
- Sesgos: no disponible (no se documenta composición del corpus ni evaluación de sesgos de habla, acento o género).
- No soporta clonación de voz en este paquete, lo que limita casos de uso de personalización de timbre.

## Enlaces

- HuggingFace: https://huggingface.co/nile-academy/qwen3-tts-12hz-0.6b-customvoice
- Informe técnico del publicador citado como evidencia de selección: https://arxiv.org/abs/2601.15621
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a entidades no relacionadas (río Nilo, agencia de asuntos públicos y marca de ropa).
