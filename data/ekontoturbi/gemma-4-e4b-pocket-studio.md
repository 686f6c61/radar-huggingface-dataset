# ekontoTURBI/gemma-4-E4B-pocket-studio

## Resumen

El modelo `ekontoTURBI/gemma-4-E4B-pocket-studio` es un ajuste fino de `google/gemma-4-E4B-it`, desarrollado por el usuario `ekontoTURBI` y empaquetado en un único archivo `.litertlm` para ejecutarse íntegramente en dispositivos Android mediante el runtime LiteRT-LM. Su propósito es transformar descripciones en lenguaje natural en aplicaciones web funcionales (HTML, CSS y JavaScript), sin necesidad de conexión a internet, cuenta de usuario ni servicios en la nube.

El modelo se presenta como el motor de la aplicación de código abierto **Gemma Pocket Studio**, una app para Android donde el usuario describe una app y el modelo la genera fichero a fichero, en tiempo real y de forma local. La arquitectura es un transformer basado en Gemma 4, con un adaptador LoRA de aproximadamente 35 millones de parámetros entrenables fusionado en los pesos bf16. El tamaño del archivo empaquetado es de 4.98 GB. La longitud de contexto no se especifica en la información disponible.

Su relevancia radica en habilitar el desarrollo de aplicaciones web en entornos sin conectividad y en dispositivos móviles, con enfoque en la privacidad y el coste cero. Además, introduce una cuantización mixta (int8 en atención, int4 en MLP) que, según los datos publicados, preserva la capacidad de generar código JavaScript válido, algo que la cuantización int4 completa destruye.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de `google/gemma-4-E4B-it`) |
| Parametros totales | No disponible (el modelo base no se especifica; el adaptador LoRA añade ~35M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 en atención + int4 en MLP (block-wise, 32 pesos por escala) en la versión publicada; también se evaluaron builds int8 completo e int4 completo |
| Idiomas soportados | No disponible (se documenta su uso con HTML, CSS y JavaScript) |
| Licencia | Gemma |
| Formato de pesos | `.litertlm` (empaquetado para LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `google/gemma-4-E4B-it` mediante adaptadores LoRA de rango estabilizado aplicados a las proyecciones de atención y MLP, con alrededor de 35 millones de parámetros entrenables. Los datos de entrenamiento consisten en unos pocos cientos de ejemplos multi-tarea que combinan prompts de creación de aplicaciones desde cero y prompts de edición orientados a parches `SEARCH`/`REPLACE`. Cada ejemplo de edición fue validado aplicando realmente su parche; aquellos cuyo diff no se aplicaba se descartaban del conjunto de entrenamiento.

La pérdida en el conjunto de validación descendió de 0.897 a 0.513, estabilizándose a partir del paso 60, lo que sugiere que la limitación principal era la cantidad de datos y no el coste computacional. El adaptador se fusionó en los pesos bf16, por lo que en inferencia no se requiere cargar un adaptador adicional.

La innovación técnica más destacable es la cuantización mixta: se compararon tres builds (int8 completo, int8 en atención + int4 en MLP, e int4 completo). Solo la configuración con atención a 8 bits y MLP a 4 bits mantuvo intacta la capacidad de generar JavaScript que parsea correctamente. La build int4 completa producía código corrupto, y la build int8 completa no lograba el objetivo de reducir el tamaño por debajo de 5 GB.

## Capacidades

- Generación de código HTML, CSS y JavaScript para pequeñas aplicaciones web completas.
- Aplicación de ediciones mediante parches `SEARCH`/`REPLACE` que se pueden aplicar de forma fiable; en la evaluación limitada del autor, el 100 % de parches generados por este modelo se aplican correctamente.
- Ejecución completamente local en dispositivos Android con Android 12 o superior y arquitectura `arm64-v8a`, a través del runtime LiteRT-LM.
- No se documenta soporte para tool calling / function calling ni para agentes multi-paso; su uso está restringido al flujo de generación y edición de ficheros dentro de la app Gemma Pocket Studio.
- No se documentan capacidades de visión, audio ni multimodales.
- Los recursos multilingües no están especificados; el modelo está orientado a generar código web, con resultados documentados únicamente en ese dominio.

## Casos de uso

- Desarrollo de prototipos web sobre la marcha: el usuario describe una app en lenguaje natural y el modelo genera los archivos HTML, CSS y JavaScript de forma incremental, en la propia pantalla del móvil, lo que resulta útil para validar ideas sin necesidad de un ordenador ni conexión.
- Mantenimiento y edición de aplicaciones web locales: el modelo aplica parches `SEARCH`/`REPLACE` sobre código existente, reduciendo el riesgo de romper la aplicación al modificarla, lo que lo hace adecuado para iteraciones rápidas en dispositivos móviles.
- Entornos con conectividad restringida: en zonas sin internet (aviones, zonas rurales, instalaciones industriales), un Android con suficiente RAM puede generar y desplegar aplicaciones web sin depender de servicios en la nube.
- Aprendizaje de desarrollo web: la generación en vivo de código permite a estudiantes observar cómo se construye una aplicación desde cero y cómo se aplican cambios incrementales sobre un proyecto.
- Prototipado privado para clientes o equipos: al no haber salida de datos externa, el código generado nunca abandona el dispositivo, lo que es relevante en proyectos con requisitos de confidencialidad.
- Generación de demos y snippets de código: el modelo puede producir ejemplos completos de pequeñas apps (formularios, tablas, calculadoras) que se pueden reutilizar como plantillas o material didáctico.

## Benchmarks y rendimiento

Los datos presentados en la model card del autor se basan en una muestra reducida: 4 prompts de creación de aplicaciones y 4 sondas de edición. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. Los resultados comparativos entre el modelo stock (`google/gemma-4-E4B-it`) y este modelo son los siguientes:

| Métrica | Stock | Este modelo |
|---|---|---|
| Produce exactamente un bloque de razonamiento | 83.3 % | 100 % |
| Sus ediciones se aplican realmente | 75.0 % | 100 % |
| JavaScript parsea (`node --check`) | 100 % | 100 % |
| Referencia IDs de elementos reales | 71.4 % | 100 % |
| Se queda sin espacio a mitad de fichero | 12.5 % | 0 % |
| Documento HTML completo | 75.0 % | 75.0 % |
| Selectores CSS coinciden con su propio HTML | 60.0 % | 53.1 % |

Asimismo, se compararon las tres builds de cuantización a nivel de rendimiento básico:

| Build | Tamaño del archivo | RAM en uso | JavaScript parsea |
|---|---|---|---|
| int8 en todas partes | 6.44 GB | 5.47 GB | 3 de 4 |
| int8 atención + int4 MLP (publicado) | 4.98 GB | 4.93 GB | 4 de 4 |
| int4 en todas partes | 4.38 GB | 3.68 GB | 1 de 4 |

Es importante señalar que la muestra es muy pequeña y el autor advierte explícitamente que las diferencias en las dos últimas filas de la primera tabla (HTML completo y selectores CSS) están dentro del ruido estadístico para ese tamaño muestral.

## Requisitos de hardware

- RAM del dispositivo: 12 GB o más, obligatorio para evitar problemas de thrashing. El autor indica que un teléfono de 8 GB no es suficiente, ya que la RAM medida en uso durante la generación es de 4.93 GB, más el sistema Android y la propia app.
- Android 12 (API 31) o superior, arquitectura `arm64-v8a`.
- Almacenamiento libre: aproximadamente 6 GB (el archivo del modelo ocupa 4.98 GB, más el espacio de la app y los ficheros temporales).
- GPU dedicada: no es necesaria; la ejecución se realiza en el dispositivo Android mediante LiteRT-LM, probablemente usando la GPU o CPU integrada del teléfono. No se han publicado requisitos de hardware de servidor.
- Despliegue: únicamente disponible a través de LiteRT-LM, empaquetado en la aplicación Gemma Pocket Studio. No se documentan instrucciones para vLLM, llama.cpp, Ollama, TGI u otros frameworks de despliegue estándar.
- Latencia y throughput: no disponibles en la información publicada.

## Comparativa con modelos similares

La comparación más directa es contra el modelo base `google/gemma-4-E4B-it`, ya que es el punto de partida del fine-tune y los datos de la model card se expresan en términos relativos a él.

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento en edición de código | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `google/gemma-4-E4B-it` (stock) | Transformer | No disponible | No disponible | 75 % de parches aplicables (en la muestra evaluada) | Gemma | HuggingFace |
| `ekontoTURBI/gemma-4-E4B-pocket-studio` | Transformer (fine-tune) | No disponible (adaptador LoRA ~35M fusionado) | No disponible | 100 % de parches aplicables (en la muestra evaluada) | Gemma | HuggingFace, con formato `.litertlm` |

No se han publicado comparaciones con otros modelos de generación de código en el dispositivo (por ejemplo, Qwen2.5-Coder o Phi-3 Mini), por lo que no se puede ofrecer una comparativa más amplia con datos objetivos.

## Limitaciones y advertencias

- Sesgos: no hay evaluaciones publicadas sobre sesgos; como modelo generativo, puede heredar los sesgos presentes en el modelo base.
- Alucinación: el riesgo existe cuando se usa fuera de su dominio, ya que es un modelo especializado y no un asistente generalista.
- Especialización: no sirve para tareas de conversación, razonamiento general u otras modalidades; solo genera y edita código web.
- Cuantización: la build publicada usa int4 en las capas MLP, lo que puede degradar la calidad en otras tareas si se le intentara reutilizar fuera del flujo para el que fue diseñado. El autor documenta que la cuantización int4 completa destruía la generación de código válido.
- Licencia: el modelo se distribuye bajo la licencia Gemma, que puede contener términos restrictivos para uso comercial; es necesario revisar la licencia completa antes de desplegarlo en producción.
- Hardware: requiere un dispositivo con al menos 12 GB de RAM, lo que excluye a la mayoría de los teléfonos Android de gama media y baja. Forzar su ejecución en un dispositivo con menos memoria provoca thrashing y una experiencia degradada.
- Benchmarks limitados: los resultados de rendimiento están basados en una muestra de 4 prompts y 4 sondas de edición, por lo que no son concluyentes para afirmar una calidad general.
- Despliegue restringido: el formato `.litertlm` no es compatible con los frameworks de inferencia de servidor más habituales (vLLM, llama.cpp, TGI), lo que limita su uso en entornos de producción tradicionales.

## Enlaces

- HuggingFace: https://huggingface.co/ekontoTURBI/gemma-4-E4B-pocket-studio
- GitHub (Gemma Pocket Studio): https://github.com/ekontoTURBO/gemma-pocket-studio
