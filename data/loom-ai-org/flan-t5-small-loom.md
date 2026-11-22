# loom-ai-org/flan-t5-small-loom

## Resumen

`loom-ai-org/flan-t5-small-loom` es una exportación al formato GGUF del modelo `google/flan-t5-small`, empaquetada por el proyecto loom.cpp para su ejecución con el runtime `loom-py-rt`. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales de Google, y el trabajo del autor consiste en empaquetar los mismos 76,96 millones de parámetros en un único fichero GGUF autodescriptivo que incluye las topologías de grafo, el tokenizador y el script de control necesarios para ejecutarlo sin dependencias del ecosistema Transformers.

El modelo base es un transformer encoder-decoder de tipo T5 con instrucciones afinadas (FLAN), la variante más pequeña de la colección FLAN. Su relevancia es fundamentalmente práctica e instrumental: sirve como banco de pruebas para validar la implementación de arquitecturas encoder-decoder y de vocabularios SentencePiece Unigram dentro de loom.cpp, que hasta esta exportación solo cubría modelos decoder-only. Es, por tanto, una pieza de infraestructura para desarrolladores que trabajan con el stack de loom, no un modelo destinado a producción.

Las capacidades reales del checkpoint son muy limitadas: con 77 millones de parámetros reproduce la forma de las instrucciones pero falla con frecuencia en el contenido, tal y como reconoce el propio autor en la model card. Su interés está en la interfaz de ejecución (streaming, `text2text.infer`, decodificación con caché KV y atención cruzada) y en la portabilidad del formato, no en la calidad de sus respuestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), con atención relativa por buckets de posición |
| Parámetros totales | 76.962.314 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens por lado (entrada y salida); los buckets de posición relativa saturan a 128 tokens de distancia |
| Tipos de cuantización | no disponible (el repo distribuye un único GGUF sin especificar variantes de cuantización) |
| Idiomas soportados | en, fr, ro, de, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`flan-t5-small.gguf`), autodescriptivo con grafo, tokenizador y driver embebidos |

## Arquitectura y entrenamiento

La arquitectura es la de T5: un encoder que procesa la secuencia de entrada una sola vez y un decoder con caché KV que atiende de forma cruzada a la representación del encoder. T5 no emplea una tabla de posiciones aprendida, sino buckets de posición relativa que se saturan a 128 tokens de distancia; el vocabulario es SentencePiece Unigram, lo que convierte a esta exportación en la primera de la colección de loom en soportar ese esquema de tokenización y la primera en cubrir un modelo encoder-decoder de texto.

El entrenamiento corresponde íntegramente al checkpoint original de Google: `flan-t5-small` es la variante pequeña de la colección FLAN, afinada con instrucciones sobre T5-small. La model card no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO), por lo que esos datos deben consultarse en la documentación del modelo base. La única modificación introducida por esta exportación es el empaquetado: pesos sin modificar, grafo y driver propios, y decodificación greedy token a token en lugar del beam search de 4 haces que emplean los presets originales de traducción y resumen.

## Capacidades

- Generación de texto condicionada por instrucción en formato texto-a-texto (`text2text.infer`), sin plantilla de chat ni turno de sistema.
- Traducción entre los idiomas cubiertos por el checkpoint (inglés, francés, rumano, alemán) mediante prefijos del tipo `translate English to German: ...`.
- Respuesta a preguntas formuladas como instrucción explícita (`Answer the following question. ...`).
- Resumen de textos con el prefijo `summarize: ...`.
- Decodificación en streaming token a token mediante `text2text.stream`.
- Muestreo configurable: greedy por defecto (argmax) o con `temperature=` para muestreo estocástico.
- Acceso de bajo nivel al driver embebido mediante `model.infer(...)` y `model.driver_source`, que documenta todos los argumentos aceptados.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Validación de la implementación encoder-decoder de loom.cpp: permite comprobar que la atención cruzada, la caché KV del decoder y la lectura única del encoder funcionan correctamente antes de portar modelos mayores de la familia T5.
- Prueba de la tokenización SentencePiece Unigram: sirve para verificar el pipeline de tokenización en un runtime que hasta ahora solo manejaba otros esquemas de vocabulario.
- Banco de pruebas de la API `loom-py`: los ejemplos de traducción, pregunta-respuesta y resumen de la model card permiten ejercitar `text2text.infer`, `text2text.stream` y `model.infer` con un modelo de 1,2 GB de repo que cabe en cualquier máquina.
- Prototipado rápido de interfaces de traducción: con 77 millones de parámetros y licencia Apache 2.0, permite montar una demo funcional de traducción EN-DE/FR/RO en CPU antes de invertir en un modelo mayor.
- Experimentación educativa con arquitecturas encoder-decoder: el tamaño reducido y el formato GGUF autodescriptivo facilitan inspeccionar el grafo y el driver sin cargar un stack completo de Transformers.
- Pruebas de regresión en CI: al ser determinista en modo greedy y ocupar poco espacio, puede integrarse en pipelines de integración continua para detectar roturas en el runtime o en el formato GGUF.
- Evaluación comparativa de decodificación: permite medir la diferencia entre la salida greedy de esta exportación y el beam search de los presets originales sobre las mismas entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente documenta un comportamiento cualitativo: ante la pregunta por la capital de Francia el modelo responde `london`, y el autor señala que `transformers` produce la misma salida con el mismo checkpoint, atribuyéndolo al modelo y no a la exportación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 76,96 millones de parámetros y un repo de 1,2 GB, la inferencia cabe holgadamente en menos de 1 GB en precisión reducida y en torno a 300 MB en float32 para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o una RTX 3060 están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: el runtime previsto es `loom-py-rt` (PyPI, `pip install -U "loom-py-rt[hub]>=1.0.0"`) sobre el motor loom.cpp. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| flan-t5-small-loom (este) | 76,96 M | 512 tokens por lado | GGUF para loom.cpp | Apache 2.0 | Exportación instrumental; decodificación greedy; sin beam search |
| google/flan-t5-small | 76,96 M | 512 tokens por lado | safetensors (Transformers) | Apache 2.0 | Modelo base; presets con beam search de 4 haces |
| google/flan-t5-base | ~248 M | 512 tokens por lado | safetensors (Transformers) | Apache 2.0 | Recomendado por el propio autor para respuestas que se vayan a conservar |
| google/t5-small | ~60 M | 512 tokens por lado | safetensors (Transformers) | Apache 2.0 | Variante sin afinado por instrucciones; requiere formato de tarea explícito |

## Limitaciones y advertencias

- Calidad muy baja por tamaño: con 77 millones de parámetros el modelo acierta la forma de la instrucción pero yerra con frecuencia el contenido; el propio autor documenta la respuesta `london` a la capital de Francia.
- Sin plantilla de chat: la instrucción debe formar parte del texto (`translate English to German: ...`). Una frase sin instrucción queda fuera de distribución y suele devolverse como fragmento de sí misma.
- Decodificación greedy: la exportación no implementa el beam search de 4 haces de los presets originales, por lo que las traducciones y resúmenes difieren de los publicados por Google.
- Límite de 512 tokens por lado: aunque el fichero no impide entradas más largas, los buckets de posición relativa saturan a 128 tokens de distancia y la caché KV se construye a 512.
- Cobertura lingüística limitada a inglés, francés, rumano, alemán y multilingüe según los metadatos; no hay garantías de calidad fuera de esos idiomas.
- Riesgo de alucinación y de respuestas factualmente incorrectas elevado, coherente con el tamaño del checkpoint.
- Sesgos: no se documentan sesgos específicos en la información disponible, pero al heredarse los pesos de `flan-t5-small` se heredan los sesgos de sus datos de entrenamiento, no detallados en la model card.
- Licencia Apache 2.0, heredada del modelo base, permite uso comercial; aun así, la calidad del modelo lo desaconseja para producción sin un paso previo a `flan-t5-base` o superior.
- Dependencia del ecosistema loom: requiere `loom-py-rt` y el motor loom.cpp; no hay soporte documentado para otros runtimes.
- Advertencia sobre la búsqueda web: los resultados obtenidos corresponden a la aplicación de grabación de pantalla Loom y a la marca de ropa Loom, sin relación con este modelo; no se han utilizado como fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/flan-t5-small-loom
- Modelo base: https://huggingface.co/google/flan-t5-small
- Repositorio de loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio de loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio de loom-py: https://github.com/loom-ai-org/loom-py
