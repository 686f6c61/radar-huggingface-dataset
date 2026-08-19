# mradermacher/Schattenblume-31B-GGUF

## Resumen

Schattenblume-31B es un modelo de lenguaje de gran tamaño con 30.697.345.596 parámetros (~30,7B), resultado de un merge de modelos creado por Nimbz y cuantizado posteriormente a formato GGUF por mradermacher. Según las etiquetas de la model card, se trata de un modelo basado en la arquitectura Gemma (etiqueta `gemma-4`), orientado a tareas de razonamiento, escritura creativa, roleplay, conversación y storytelling, con un comportamiento de "bajo rechazo" (low-refusal) que reduce la censura en las respuestas. También incluye archivos `mmproj` (proyección multimodal), lo que sugiere capacidades de visión adicionales, aunque no se detallan en la documentación.

La relevancia de este modelo radica en su naturaleza de merge: combina las fortalezas de varios modelos base para obtener un equilibrio entre capacidades de razonamiento y creatividad, con una licencia Apache 2.0 que permite uso comercial sin restricciones. La versión GGUF facilita su despliegue local en CPU y GPU mediante herramientas como llama.cpp u Ollama, con múltiples niveles de cuantización para adaptarse a distintos presupuestos de hardware.

Al tratarse de una cuantización estática realizada por un tercero, la información disponible se limita a los detalles técnicos de los archivos GGUF. No se han publicado especificaciones sobre el entrenamiento, la arquitectura interna ni los benchmarks del modelo original, por lo que gran parte de los datos técnicos deben considerarse no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como `gemma-4`, presumiblemente Transformer denso, sin confirmar) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q8_0; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (modelo original en Nimbz/Schattenblume-31B) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Las etiquetas indican que es un merge creado con mergekit, combinando múltiples modelos base, y que la arquitectura subyacente corresponde a la familia Gemma (etiqueta `gemma-4`). Sin embargo, no se especifican los componentes del merge, el número de capas, la dimensionalidad del modelo ni el método de fusión utilizado (por ejemplo, SLERP, TIES, etc.).

Tampoco hay datos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La etiqueta `low-refusal` sugiere que el modelo ha sido ajustado o seleccionado para minimizar respuestas de rechazo, lo que es habitual en modelos orientados a roleplay y escritura creativa sin restricciones, pero no se confirma el método empleado.

La presencia de archivos `mmproj` indica que el modelo incorpora un proyector multimodal, probablemente para procesar imágenes, aunque no se documenta su funcionamiento ni la arquitectura del codificador visual.

## Capacidades

- Generación de texto libre con énfasis en escritura creativa, narrativa y storytelling.
- Razonamiento y resolución de problemas (etiqueta `reasoning`), aunque también se incluye `non-reasoning` como alternativa.
- Conversación multi-turno y roleplay de personajes (etiquetas `conversational`, `character-rp`).
- Comportamiento de bajo rechazo (`low-refusal`), lo que reduce las negativas ante solicitudes de contenido sensible o NSFW.
- Capacidades multimodales parciales (archivos `mmproj`), aunque sin documentación sobre el alcance exacto.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al inglés, según la etiqueta `en`.

## Casos de uso

- Roleplay y juegos de personajes: el modelo puede mantener conversaciones prolongadas con identidades ficticias, gracias a su orientación a `character-rp` y `storytelling`. Se usaría con un frontend como SillyTavern o KoboldAI, cargando la cuantización Q4_K_M en una GPU de 24 GB.
- Escritura creativa asistida: generación de borradores de ficción, diálogos y descripciones con un estilo fluido y poco restrictivo. Adecuado para autores que necesitan un asistente que no imponga censura temática.
- Generación de contenido narrativo para juegos: creación de misiones, diálogos de NPCs y tramas ramificadas en desarrollo de videojuegos independientes.
- Asistente conversacional con baja censura: para entornos donde se requiere tratar temas delicados sin respuestas evasivas, como investigación sociológica o simulación de entrevistas.
- Prototipado rápido de aplicaciones de chat: al ser un GGUF, se puede integrar en pipelines locales con llama.cpp u Ollama para pruebas sin depender de APIs externas.
- Experimentación con modelos merge: útil para desarrolladores que quieran estudiar el comportamiento de un merge de 31B en tareas de razonamiento y creatividad, comparándolo con sus modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o su versión original.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M ocupa 18,8 GB, por lo que se necesita al menos 20 GB de VRAM para cargar el modelo completo en GPU. La versión Q8_0 requiere unos 32,7 GB.
- GPU recomendadas: para Q4_K_M o Q4_K_S, una RTX 3090 o RTX 4090 (24 GB) es suficiente. Para Q5_K_M (21,9 GB) o Q8_0, se recomienda una GPU de 32 GB o más, como A100 o RTX 6000 Ada.
- En CPU: con 32 GB de RAM y cuantización Q4_K_M, es posible ejecutar el modelo con llama.cpp a velocidades de 2-4 tokens/s en un procesador moderno de gama alta.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, LM Studio, text-generation-webui con backend llama.cpp. También compatible con servidores que aceptan GGUF, como llama-cpp-python.
- Latencia y throughput: no disponibles de forma fiable. Como referencia orientativa, en una RTX 4090 con Q4_K_M se pueden esperar entre 30 y 50 tokens/s, pero no hay datos verificados.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un merge basado en Gemma de 31B, pero no se conocen sus componentes exactos ni sus resultados en benchmarks. Alternativas de tamaño similar (30-32B) como Gemma-2-27B, Qwen-2.5-32B o merges populares como NousHermes-2-32B podrían ser comparables, pero sin datos de rendimiento de Schattenblume-31B no es posible realizar una tabla objetiva. Se recomienda consultar la página del modelo base (Nimbz/Schattenblume-31B) para obtener más detalles si estuvieran disponibles.

## Limitaciones y advertencias

- No hay información verificada sobre sesgos del modelo; al ser un merge con bajo rechazo, podría generar contenido ofensivo, sexual o dañino sin filtros.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad factual; el modelo está orientado a creatividad, por lo que la precisión en datos objetivos no está garantizada.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada; los modelos Gemma suelen manejar 8K tokens, pero no está confirmado.
- Idioma: solo se declara soporte para inglés; el rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales si los modelos originales del merge usan otras licencias; se debe verificar el modelo original.
- Para producción: al ser una cuantización estática sin imatrix, la calidad puede ser inferior a cuantizaciones dinámicas; se recomienda usar Q4_K_M o Q8_0 para un equilibrio razonable.
- Los archivos `mmproj` sugieren multimodalidad, pero no hay documentación sobre cómo usarlos ni qué tareas de visión soportan.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Schattenblume-31B-GGUF
- Modelo base (merge original): https://huggingface.co/Nimbz/Schattenblume-31B
- Página del autor de la cuantización: https://huggingface.co/mradermacher
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
