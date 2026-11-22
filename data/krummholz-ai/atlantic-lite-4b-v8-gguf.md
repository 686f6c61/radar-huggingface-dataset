# krummholz-ai/atlantic-lite-4b-v8-GGUF

## Resumen

Krummholz Atlantic Lite 4B v8 es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado por Krummholz AI LLC (Belfast, Maine) como un ajuste fino mediante LoRA sobre Qwen/Qwen3.5-4B. Su propuesta central es poco habitual: en lugar de maximizar la tasa de respuestas correctas, el modelo está entrenado para decir "no lo sé" cuando carece de herramientas de búsqueda y para consultar fuentes externas cuando dispone de ellas. El objetivo declarado es reducir las respuestas erróneas por debajo del 1 %, aunque el propio autor reconoce que esa meta no se alcanza con el modelo en solitario.

La versión v8 parte del adaptador de v7 (entrenado con el razonamiento desactivado) y lo continúa con el razonamiento activado a través de tres rondas de entrenamiento por preferencias. En cada ronda el modelo se muestrea sobre preguntas de hechos con respuesta conocida, un código decide qué respuestas propias son correctas, incorrectas o un "no lo sé" limpio, y el modelo se entrena para preferir sus mejores respuestas. No hay texto de respuesta escrito por personas ni por otro modelo.

El modelo está pensado para ejecutarse dentro del harness de Krummholz, que aporta un presupuesto de razonamiento, un filtro de seguridad y herramientas de búsqueda. Los pesos se distribuyen en formato GGUF (Q4_K_M, Q5_K_M, bf16) y como adaptador LoRA, con licencia Apache 2.0. Su relevancia actual radica en que aborda de forma explícita el problema de la calibración y la abstención en modelos pequeños para hardware de consumo, un área donde la mayoría de las publicaciones priorizan el rendimiento bruto sobre la honestidad epistémica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), ajuste fino mediante LoRA |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, bf16 (GGUF); adaptador LoRA en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M, Q5_K_M, bf16), safetensors (adaptador), mmproj f16 para entrada de imagen |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,2 mil millones de parámetros que hereda la arquitectura de Qwen3.5-4B. El ajuste se realiza mediante un adaptador LoRA sobre el modelo base, no mediante un preentrenamiento desde cero. La innovación principal no está en la arquitectura sino en el procedimiento de alineación: tres rondas de entrenamiento por preferencias en las que el modelo se muestrea sobre preguntas de hechos con respuesta conocida y un código automático etiqueta cada respuesta como correcta, incorrecta o abstención limpia. El modelo aprende a preferir sus propias respuestas mejores, sin intervención humana ni generación de texto por parte de otro modelo. Un control entrenado con los mismos pares pero con las etiquetas barajadas no mostró la reducción de respuestas erróneas, lo que sugiere que el efecto proviene de los pares y no del entrenamiento adicional en sí.

Los datos de evaluación y entrenamiento provienen de Wikidata (CC0) y Natural Questions en versión abierta (CC BY-SA 3.0), usados como preguntas y para calificar respuestas; los objetivos de entrenamiento son texto generado por el propio modelo. La medición de seguridad emplea HarmBench con su clasificador de validación. El razonamiento está activado en la plantilla de chat: el modelo escribe su razonamiento, luego `</think>` y después la respuesta. Los encabezados GGUF declaran los bloques que contienen los archivos (las versiones anteriores declaraban un bloque de más y fallaban al cargar en algunas compilaciones de llama.cpp).

## Capacidades

- Generación de texto conversacional en inglés con modo de razonamiento explícito (cadena de pensamiento antes de la respuesta).
- Abstención calibrada: entrenado para responder "no lo sé" cuando no dispone de herramientas y no está seguro, en lugar de adivinar.
- Uso de herramientas de búsqueda: con el prompt de herramientas, busca en el 93 % de las preguntas de hechos en lugar de responder de memoria.
- Formato correcto de llamadas a herramientas: 60 de 60 llamadas bien formadas en la evaluación del autor.
- Entrada de imagen mediante el archivo `mmproj-krummholz-atlantic-lite-4b-v8-f16.gguf`.
- Razonamiento multi-paso dentro de un presupuesto de tokens controlado por el harness (1.024 tokens por defecto).
- Capacidades multilingües: limitadas al inglés según la model card.
- Integración con el harness de Krummholz: presupuesto de razonamiento, filtro de seguridad y herramientas de búsqueda.

## Casos de uso

- Asistente de preguntas factuales con búsqueda web: el modelo consulta fuentes externas en el 93 % de las preguntas en lugar de responder de memoria, lo que lo hace adecuado para asistentes que deben citar o verificar información en lugar de improvisar.
- Despliegue en dispositivos de consumo: el archivo Q4_K_M está pensado para teléfonos y portátiles, y el Q5_K_M para portátiles y sobremesas, lo que permite ejecutar el modelo localmente sin GPU dedicada de gama alta.
- Atención al cliente con abstención controlada: cuando el modelo no dispone de la información en su contexto ni de herramientas, devuelve "no lo sé" en lugar de inventar respuestas, lo que reduce el riesgo de información errónea en entornos donde una respuesta falsa es más costosa que una derivación a un humano.
- Sistemas de recuperación aumentada (RAG) con umbral de confianza: el presupuesto de razonamiento del harness convierte en "no lo sé" las generaciones que superan los 1.024 tokens de razonamiento, lo que proporciona un mecanismo determinista de abstención en pipelines de producción.
- Análisis de documentos con entrada de imagen: el archivo mmproj f16 permite procesar imágenes junto con texto, útil para extraer información de capturas o documentos escaneados en flujos locales.
- Evaluación de calibración y honestidad en investigación: el modelo y sus informes de resultados en `results/` sirven como caso de estudio reproducible sobre entrenamiento por preferencias para reducir alucinaciones en modelos pequeños.
- Filtrado previo en aplicaciones sensibles: combinado con el safety screen del harness, que detuvo el 34 % de solicitudes HarmBench no vistas y 4 de 12.500 prompts legítimos, puede actuar como primera capa de moderación antes de un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor con razonamiento activado (229 preguntas de hechos retenidas sin herramientas, 199 preguntas de sonda, 120 prompts largos, 60 turnos de uso de herramientas, HarmBench 300). Las columnas v7 y v8 corresponden a pesos sin cuantizar; la última columna es el archivo Q4_K_M ejecutado con llama.cpp sobre las mismas peticiones y el mismo código de puntuación.

| Medida | v7 | v8 | v8 Q4_K_M |
|---|---|---|---|
| Preguntas de hechos sin herramientas: respuesta incorrecta | 52 % | 3 % | 10 % |
| Preguntas de hechos sin herramientas: respuesta correcta | 45 % | 31 % | 30 % |
| Preguntas de hechos sin herramientas: dice que no lo sabe | 3 % | 50 % | 38 % |
| Preguntas de hechos sin herramientas: razonamiento nunca terminado | 0 % | 16 % | 22 % |
| Incorrectas entre las respuestas dadas de memoria | 54 % | 9 % | 26 % |
| Con herramientas: busca en lugar de responder de memoria | 95 % | 93 % | 94 % |
| Llamadas a herramientas bien formadas | 60 de 60 | 60 de 60 | 60 de 60 |
| Prompts largos: se repite / alcanza el límite | 5 / 10 de 120 | 1 / 4 de 120 | 0 / 4 de 120 |
| Suites de sonda superadas (identidad, historia, soberanía y otras) | 149 de 199 | 135 de 199 | 131 de 199 |
| HarmBench: respuestas dañinas | 23 de 300 | 23 de 300 | no medido |
| Media de tokens por respuesta | 665 | 504 | 545 |

Con el presupuesto de razonamiento del harness (detención a los 1.024 tokens y "no lo sé" fijo), las cifras de preguntas de hechos quedan en: correctas 31 %, incorrectas 3 %, no lo sabe 66 % a precisión completa; correctas 30 %, incorrectas 10 %, no lo sabe 60 % con Q4_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de 4,2 mil millones de parámetros, Q4_K_M ocupa aproximadamente 2,5-3 GB y Q5_K_M en torno a 3-3,5 GB, mientras que bf16 requiere cerca de 8,5 GB (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: el autor indica que Q4_K_M está pensado para teléfonos y portátiles y Q5_K_M para portátiles y sobremesas; no se especifican modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (usado en la evaluación del Q4_K_M); el harness de Krummholz (componentes en C++); el autor menciona vLLM como alternativa de ejecución a precisión completa, aunque no se separó su efecto del de la cuantización.
- Latencia y throughput: no disponibles. El autor solo reporta la media de tokens por respuesta (504 en v8, 545 en Q4_K_M).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Krummholz Atlantic Lite 4B v8 | 4.205.751.296 | no disponible | Apache 2.0 | Abstención calibrada y uso de herramientas | GGUF y LoRA en Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | Apache 2.0 | Modelo generalista | Hugging Face |
| Krummholz Atlantic Lite 4B v7 | ~4B | no disponible | Apache 2.0 | Versión previa, razonamiento desactivado | Hugging Face |

No se dispone de datos de benchmarks de Qwen3.5-4B ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparación con v7 sí está disponible en la tabla de benchmarks: v8 reduce las respuestas incorrectas del 52 % al 3 % sin herramientas, a costa de bajar las correctas del 45 % al 31 % y de aumentar las abstenciones del 3 % al 50 %.

## Limitaciones y advertencias

- Renuncia a respuestas correctas para evitar incorrectas: sin herramientas acierta menos que v7 (31 % frente a 45 %). Está diseñado para usarse con búsqueda.
- Sigue equivocándose: el 9 % de las respuestas que da de memoria fueron incorrectas a precisión completa y el 26 % con Q4_K_M (10 % de todas las preguntas de hechos, frente al 52 % de v7). El objetivo de menos del 1 % es una meta, no un logro del modelo en solitario.
- El razonamiento no siempre termina: en el 16 % de las preguntas de hechos (22 % con Q4_K_M) el razonamiento alcanzó el límite de tokens y no se emitió respuesta. El presupuesto de razonamiento del harness convierte esos casos en "no lo sé".
- Seguridad insuficiente por sí sola: en HarmBench rechaza solicitudes dañinas directas (1 de 200 respondidas) pero respondió a 22 de 100 solicitudes dañinas envueltas en un documento o una historia, 11 de ellas sobre ciberdelincuencia. No desplegar sin el filtro de seguridad o un equivalente.
- Las puntuaciones de las suites de sonda bajaron de 149 a 135 de 199.
- La cuantización degrada la precisión: Q4_K_M da más respuestas incorrectas que los pesos a precisión completa. No se ha separado si el efecto proviene de la cuantización o de ejecutar con llama.cpp en lugar de vLLM. Q5_K_M y el GGUF bf16 no se midieron; HarmBench no se ejecutó sobre ningún archivo cuantizado.
- El conjunto de prueba es pequeño (229 preguntas, en su mayoría hechos de cola larga como años de nacimiento de científicos), por lo que los porcentajes tienen varios puntos de incertidumbre.
- Idioma limitado al inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación mitigado pero no eliminado; el propio autor advierte que el modelo debe ejecutarse con el harness o con un filtro propio delante.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas más allá de las de esa licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krummholz-ai/atlantic-lite-4b-v8-GGUF
- Harness de Krummholz: https://huggingface.co/krummholz-ai/krummholz-harness
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Natural Questions (Kwiatkowski et al. 2019; Lee et al. 2019): no disponible en la información proporcionada
- HarmBench (Mazeika et al. 2024, MIT): no disponible en la información proporcionada
- Wikidata (CC0): https://www.wikidata.org
