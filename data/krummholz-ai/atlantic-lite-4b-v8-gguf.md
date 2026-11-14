# krummholz-ai/atlantic-lite-4b-v8-GGUF

## Resumen

Krummholz Atlantic Lite 4B v8 es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por Krummholz AI LLC (Belfast, Maine) mediante ajuste fino (LoRA) sobre Qwen/Qwen3.5-4B, que se distribuye bajo licencia Apache 2.0. El modelo está diseñado específicamente para hardware de consumo y su objetivo central es la calibración de la abstención: en lugar de responder de memoria cuando no dispone de herramientas, el modelo está entrenado para decir "no lo sé", y cuando dispone de herramientas de búsqueda, para consultarlas en lugar de inventar.

La versión v8 introduce un cambio sustancial respecto a v7: mientras que v7 se entrenó con el razonamiento desactivado, v8 continúa el adaptador de v7 con el razonamiento activado, a través de tres rondas de entrenamiento por preferencias. En cada ronda el modelo fue muestreado sobre preguntas de hechos con respuesta conocida, un programa clasificó automáticamente sus propias respuestas como correctas, incorrectas o una abstención limpia, y el modelo fue entrenado para preferir su propia respuesta mejor. Ningún texto de respuesta fue escrito por una persona ni por otro modelo.

El modelo se publica principalmente en formato GGUF (Q4_K_M, Q5_K_M y bf16), junto con un proyector multimodal para entrada de imágenes y el adaptador LoRA sobre el modelo base. Está pensado para ejecutarse dentro del arnés propietario de Krummholz (con presupuesto de razonamiento, cribado de seguridad y herramientas de búsqueda), cuyo código fuente aún no se ha publicado; el autor advierte explícitamente que, si se ejecuta el archivo por separado, debe colocarse un filtro propio delante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B), ajuste fino mediante LoRA |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, bf16 (y proyector multimodal en f16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen/Qwen3.5-4B mediante un adaptador LoRA, que se distribuye tanto en el directorio `adapter/` como fusionado en los archivos GGUF. La innovación técnica principal no reside en la arquitectura, sino en el procedimiento de entrenamiento: tres rondas de entrenamiento por preferencias sobre pares generados por el propio modelo. En cada ronda se muestreó el modelo sobre preguntas de hechos con respuesta de referencia conocida; un programa decidió cuáles de sus propias respuestas eran correctas, incorrectas o una abstención limpia; y el modelo se entrenó para preferir su propia respuesta mejor. Un control entrenado con los mismos pares pero con las etiquetas barajadas no mostró la caída en respuestas incorrectas, lo que según el autor indica que la mejora proviene de los pares y no del entrenamiento adicional en sí.

Los datos de referencia para las preguntas y la corrección provienen de Wikidata (CC0) y de la versión abierta de Natural Questions (CC BY-SA 3.0; Kwiatkowski et al. 2019, Lee et al. 2019); los objetivos de entrenamiento son texto generado por el propio modelo. La medición de seguridad emplea HarmBench (Mazeika et al. 2024, MIT) con su clasificador de validación. El razonamiento está activado en la plantilla de chat: el modelo escribe su razonamiento, luego `</think>` y después la respuesta. Los encabezados GGUF declaran correctamente los bloques que contienen los archivos (versiones anteriores declaraban un bloque de más y fallaban al cargar en algunas compilaciones de llama.cpp).

## Capacidades

- Generación de texto conversacional en inglés, con modo de razonamiento explícito (bloque de pensamiento delimitado por `</think>`).
- Abstención calibrada: entrenado para responder "no lo sé" cuando no dispone de herramientas y no tiene certeza, en lugar de adivinar.
- Uso de herramientas de búsqueda: con el prompt de herramientas, busca en el 93% de las preguntas de hechos en lugar de responder de memoria.
- Formato de llamadas a herramientas: 60 de 60 llamadas bien formadas en la evaluación del autor.
- Entrada de imágenes mediante el proyector multimodal incluido (`mmproj-...-f16.gguf`).
- Manejo de prompts largos (evaluado con 120 prompts largos).
- Capacidades multilingües: limitadas al inglés según la model card y las etiquetas del repositorio.
- No se documentan capacidades de audio ni de agentes multi-paso autónomos más allá del uso de herramientas de búsqueda.

## Casos de uso

- Asistente de preguntas y respuestas con búsqueda web: el modelo está diseñado para invocar herramientas de búsqueda en el 93% de las preguntas de hechos, lo que lo hace adecuado para asistentes que deben citar fuentes en lugar de responder de memoria.
- Sistemas de atención al cliente con base de conocimiento: combinado con una herramienta de recuperación, el modelo consulta la fuente en lugar de improvisar, y su abstención calibrada reduce las respuestas inventadas ante consultas fuera de dominio.
- Despliegue en portátiles y móviles: los archivos Q4_K_M y Q5_K_M están pensados explícitamente para estos entornos, lo que permite ejecutar un modelo de 4,2 mil millones de parámetros en hardware de consumo.
- Filtrado y triaje de consultas: su tendencia a declarar desconocimiento puede aprovecharse como primera capa en pipelines donde una respuesta incorrecta es más costosa que una abstención.
- Procesamiento de documentos con imagen: el proyector multimodal f16 permite incorporar entrada de imágenes en flujos de extracción o descripción de documentos.
- Investigación sobre calibración y abstención: el modelo y sus informes de evaluación (`results/`) sirven como caso de estudio reproducible de entrenamiento por preferencias auto-generado para reducir alucinaciones.
- Prototipado de agentes con tool calling: las 60 de 60 llamadas bien formadas lo hacen utilizable en pipelines de función única donde el formato de la llamada es crítico.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre los pesos sin cuantizar (bf16) y con razonamiento activado: 229 preguntas de hechos retenidas sin herramientas, 199 preguntas de sonda, 120 prompts largos, 60 turnos de uso de herramientas y HarmBench 300.

| Medida | v7 | v8 |
|---|---|---|
| Preguntas de hechos sin herramientas: respuesta incorrecta | 52% | 3% |
| Preguntas de hechos sin herramientas: respuesta correcta | 45% | 31% |
| Preguntas de hechos sin herramientas: dice que no lo sabe | 3% | 50% |
| Preguntas de hechos sin herramientas: razonamiento nunca terminado | 0% | 16% |
| Incorrectas entre las respuestas que da de memoria | 54% | 9% |
| Con herramientas: busca en lugar de responder de memoria | 95% | 93% |
| Llamadas a herramientas bien formadas | 60 de 60 | 60 de 60 |
| Prompts largos: se repite en la respuesta / llega al límite | 5 / 10 de 120 | 1 / 4 de 120 |
| Suites de sonda superadas (identidad, historia, soberanía y otras) | 149 de 199 | 135 de 199 |
| HarmBench: respuestas dañinas | 23 de 300 | 23 de 300 |
| Media de tokens por respuesta | 665 | 504 |

Con el presupuesto de razonamiento del arnés (se detiene la generación si el razonamiento oculto supera 1.024 tokens y se muestra un "no lo sé" fijo), las cifras de preguntas de hechos quedan en: correctas 31%, incorrectas 3%, no lo sabe 66%. El cribado de seguridad del arnés detuvo el 34% de las peticiones de HarmBench no vistas previamente y 4 de 12.500 prompts legítimos. El autor advierte que el conjunto de prueba es pequeño (229 preguntas, en su mayoría hechos de cola larga como años de nacimiento de científicos) y que los porcentajes conllevan varios puntos de incertidumbre. Los archivos cuantizados no fueron medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa por tamaño (4,2 mil millones de parámetros), Q4_K_M ocuparía del orden de 2,5-3 GB y Q5_K_M del orden de 3-3,5 GB, mientras que bf16 requeriría del orden de 8,5 GB; estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no especificadas por el autor. El modelo está orientado a hardware de consumo (móviles, portátiles y sobremesas) según la model card.
- Cabe en GPU de consumo: sí, según el diseño declarado (archivos Q4_K_M para móviles y portátiles, Q5_K_M para portátiles y sobremesas); no se detallan modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (los archivos GGUF están pensados para este runtime; se mencionan compilaciones de llama.cpp), y por extensión los runners compatibles con GGUF. No se mencionan vLLM, TGI ni Ollama en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque diferencial |
|---|---|---|---|---|
| Krummholz Atlantic Lite 4B v8 | 4.205.751.296 | no disponible | Apache 2.0 | Abstención calibrada y uso de búsqueda; requiere arnés propietario para seguridad y presupuesto de razonamiento |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la información proporcionada | no disponible | Apache 2.0 | Modelo generalista sin el ajuste de abstención |
| Krummholz Atlantic Lite 4B v7 (versión anterior) | mismo tamaño (derivado del mismo base) | no disponible | Apache 2.0 | Razonamiento desactivado; 52% de respuestas incorrectas sin herramientas frente al 3% de v8 |

No se dispone en la información proporcionada de datos comparativos con otras familias de modelos de tamaño similar (por ejemplo, alternativas de 3-4 mil millones de parámetros de otros desarrolladores); por tanto, la comparación se limita al modelo base y a la versión anterior del mismo proyecto.

## Limitaciones y advertencias

- Renuncia a respuestas correctas para evitar incorrectas: sin herramientas acierta menos que v7 (31% frente a 45%); está diseñado para usarse con búsqueda.
- Sigue equivocándose: el 9% de las respuestas que da de memoria fueron incorrectas; el objetivo de menos del 1% es una meta, no un resultado alcanzado por el modelo por sí solo.
- El razonamiento no siempre termina: en el 16% de las preguntas de hechos el razonamiento agotó el límite de tokens y no se produjo respuesta; el presupuesto de razonamiento del arnés convierte esos casos en "no lo sé".
- Seguridad insuficiente por sí sola: en HarmBench rechaza peticiones dañinas directas (1 de 200 respondida) pero respondió a 22 de 100 peticiones dañinas envueltas en un documento o una historia, 11 de ellas sobre cibercrimen. No desplegar sin el cribado de seguridad o un filtro equivalente.
- Las puntuaciones de las suites de sonda bajaron de 149 a 135 de 199.
- Los archivos cuantizados no fueron medidos: todas las cifras proceden de los pesos bf16; Q4_K_M y Q5_K_M pueden diferir.
- Conjunto de prueba pequeño (229 preguntas, mayoritariamente hechos de cola larga), con varios puntos de incertidumbre en los porcentajes.
- Dependencia del arnés: el código fuente del arnés (presupuesto de razonamiento, cribado de seguridad, herramientas de búsqueda) no está publicado; ejecutar el archivo de forma aislada exige aportar el propio filtro.
- Idiomas: solo inglés según la model card y las etiquetas del repositorio.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo fuera del arnés.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: mitigado pero no eliminado; persiste en un 9% de las respuestas de memoria y en respuestas a peticiones dañinas envueltas en contexto narrativo.

## Enlaces

- Hugging Face: https://huggingface.co/krummholz-ai/atlantic-lite-4b-v8-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Natural Questions (Kwiatkowski et al. 2019; Lee et al. 2019): no disponible en la información proporcionada
- Wikidata (CC0): https://www.wikidata.org
- HarmBench (Mazeika et al. 2024): no disponible en la información proporcionada
- Repositorio del arnés Krummholz: no publicado (no disponible)
- Informes de evaluación: directorio `results/` dentro del repositorio de Hugging Face
