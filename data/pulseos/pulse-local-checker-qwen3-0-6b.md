# PulseOS/pulse-local-checker-qwen3-0.6b

## Resumen

Pulse Local checker es un ajuste fino del modelo base Qwen/Qwen3-0.6B (596.049.920 parámetros) que PulseOS ha entrenado para una única tarea: leer un mensaje escrito por un usuario sobre sus propios registros financieros y devolver, en JSON, el cálculo que ese mensaje pide (qué contar, sobre qué, en qué fechas y cómo agruparlo). No es un modelo conversacional: no responde preguntas ni redacta frases, solo rellena un formulario fijo bajo una gramática JSON Schema que restringe los valores a los nombres reales del hogar (categorías, cuentas, comercios).

Su función en la aplicación Pulse Local es la de segundo lector: el código interpreta el mensaje con reglas deterministas, el modelo lo interpreta con la misma estructura y la app solo muestra una cifra cuando ambas lecturas coinciden. Si no coinciden, la app indica que no está segura y no ofrece cifra alguna. Se distribuye cuantizado en Q4_K_M (GGUF, repositorio de 0,4 GB) y sustituye a Qwen3-4B-Instruct-2507 como verificador desde la versión 0.4.19 de la app, con una reducción de latencia de 15,1 s a 1,4 s por turno en un Mac M4.

Es relevante porque ejemplifica un patrón de despliegue on-device muy concreto: modelos pequeños, de una sola tarea, con salida constreñida por gramática y verificación cruzada contra código, en lugar de un LLM grande generando la respuesta final. La licencia Apache 2.0 y el tamaño reducido lo hacen reutilizable como plantilla para tareas cerradas de extracción estructurada en local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con ajuste LoRA; inferencia con gramática JSON Schema vía `node-llama-cpp` |
| Parámetros totales | 596.049.920 |
| Longitud de contexto | 8.192 tokens, una sola secuencia (configuración de la llamada en la app); contexto nativo del modelo base: no disponible en la información |
| Tipos de cuantización | Q4_K_M (GGUF) es la publicada; otras cuantizaciones: no disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 0,4 GB); adaptador LoRA fundido y convertido con `llama.cpp` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de 28 capas, y se ha entrenado mediante LoRA con `mlx-lm` en un Mac M4: rango 16, escala 20, dropout 0,05, las 28 capas, optimizador AdamW, tasa de aprendizaje 1e-4 con decaimiento coseno hasta 1e-5 tras 40 pasos de calentamiento, batch de 8, prompt enmascarado, semilla 11, longitud máxima de 1.536 tokens y una pasada de 1.532 pasos. El adaptador final se eligió entre varias variantes (el texto de la model card está truncado en ese punto), se fusionó con los pesos base, se convirtió a GGUF y se cuantizó a Q4_K_M con `llama.cpp`.

La innovación no está en la arquitectura sino en el contrato de salida: la decodificación se hace con temperatura 0, un máximo de 260 tokens, sin bloque de razonamiento (el chat template de Qwen3 se usa sin thinking) y bajo una gramática generada con `createGrammarForJsonSchema` que limita los campos a `act`, `measure`, `subject_kind`, `subject`, `period`, `month`, `from`, `to`, `breakdown`, `pick`, `rank`, `exclude`, `versus_month`, `min_amount`, `max_amount` y `top`, y restringe los valores de `subject` y `exclude` a los nombres del propio hogar. El prompt de sistema aporta la fecha de hoy, el mes en curso, los meses presentes en los registros y las listas de categorías, cuentas y comercios, e indica que un seguimiento cambia solo lo que explicita. No se aportan ejemplos resueltos. No se detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Lectura de una única frase o mensaje sobre registros financieros propios y conversión a un objeto JSON con el cálculo solicitado (medida, sujeto, periodo, agrupación, ranking, exclusiones, importes mínimo y máximo).
- Salida estrictamente estructurada: rellena un formulario fijo, no genera prosa ni responde preguntas abiertas.
- Resolución de seguimientos conversacionales ("follow-up"): recibe el mensaje previo con su consulta ya resuelta y aplica solo el cambio indicado.
- Constreñimiento léxico por gramática: los valores de sujeto y exclusión solo pueden ser nombres presentes en los registros del usuario.
- Ejecución totalmente local y determinista (temperatura 0), apta para entornos sin conexión.
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modo de razonamiento explícito; la model card no documenta ninguna de estas capacidades.
- Capacidad multilingüe: limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Verificación cruzada en aplicaciones de finanzas personales: el modelo actúa como segundo lector frente a un intérprete determinista basado en reglas; solo se muestra una cifra cuando ambas interpretaciones coinciden, lo que reduce las respuestas erróneas de aproximadamente 23 a 6 por cada 100 en el benchmark del autor.
- Extracción de intención con vocabulario cerrado: cualquier asistente que necesite mapear lenguaje natural a un esquema JSON cuyos valores deban pertenecer a un conjunto conocido (categorías, cuentas, comercios) puede reutilizar el patrón de gramática restringida.
- Procesamiento on-device con requisitos de privacidad: al ejecutarse en local con 0,4 GB de pesos, encaja en apps de banca o presupuesto que no pueden enviar transacciones a la nube; el proceso completo de la app consume 2.964 MB en un Mac M4 con 24 GB.
- Filtro previo en pipelines híbridos: dado su coste de 1,4 s por turno (mediana) frente a 15,1 s del verificador de 4B anterior, sirve como primera pasada que marca consultas ambiguas antes de invocar un modelo mayor.
- Normalización de consultas para evaluación interna: permite etiquetar automáticamente conjuntos de preguntas financieras con su estructura de cálculo y comparar sistemas de interpretación sobre las mismas etiquetas.
- Plantilla de ajuste fino para tareas cerradas: la receta LoRA (rango 16, 1.532 pasos, `mlx-lm` sobre un M4) es reproducible en hardware de consumo para entrenar extractores de dominio específico con salida JSON validada por esquema.
- Desambiguación de seguimientos en asistentes multi-turno: al recibir el último o los dos últimos mensajes con sus consultas, resuelve referencias implícitas ("y el mes pasado", "sin contar transporte") sin mantener un estado conversacional completo.

## Benchmarks y rendimiento

Los únicos datos publicados son de BudgetBench, el benchmark de chat de la propia app, sobre una partición sellada de 387 conversaciones (BudgetBench v3 sealed) que ningún sistema había visto. La métrica evalúa la app completa con el modelo como verificador, no el modelo aislado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

| Configuración | Cifra incorrecta | Cifra correcta | No seguro |
|---|---|---|---|
| Solo código | 89 | 169 | 99 |
| Código verificado por Qwen3-4B-Instruct-2507 (Pulse Local 0.4.18) | 24 | 93 | 254 |
| Código verificado por este modelo (Pulse Local 0.4.19) | 23 | 158 | 187 |

El autor cifra el resultado en aproximadamente 6 respuestas con cifra incorrecta por cada 100, frente a 23 sin el verificador, con un intervalo del 95% de 2,6% a 9,4% (remuestreo por hogares y después por casos). El criterio de aceptación fijado antes de la ejecución era no superar en respuestas erróneas al modelo de 4B y conservar al menos el 90% de sus respuestas correctas; se cumplió.

Resultados anteriores (BudgetBench v2 sealed, 22 de octubre de 2026, 340 conversaciones, código 0.4.18): solo código, 73 incorrectas y 165 correctas; Qwen3-4B, 17 incorrectas y 103 correctas; verificador de 0,6B entrenado igual (reader5), 16 incorrectas, 140 correctas y 166 no seguras. Si todas las respuestas que requieren revisión se cuentan como incorrectas, reader5 suma 20 y el 4B suma 19.

Coste medido en un Mac M4 con 24 GB de memoria, sin otra carga en la GPU:

| Modelo | Segundos por turno (mediana) | Percentil 90 | Memoria máxima del proceso |
|---|---|---|---|
| Qwen3-4B-Instruct-2507 | 15,1 | 18,4 | 5.164 MB |
| Este modelo | 1,4 | 1,7 | 2.964 MB |

La memoria del proceso incluye el modelo de chat y el modelo de embeddings de la app.

## Requisitos de hardware

- Pesos en Q4_K_M: 0,4 GB de repositorio para 596.049.920 parámetros, por lo que el modelo cabe en cualquier GPU de consumo actual e incluso en CPU; el fabricante no publica requisitos mínimos oficiales.
- VRAM estimada para inferencia: no disponible como cifra oficial; en la app, el proceso completo (modelo de chat más modelo de embeddings más este verificador) alcanza 2.964 MB de memoria máxima en un Mac M4 con 24 GB.
- GPU recomendadas: no disponibles en la información. El ajuste se realizó en un Apple M4 y las mediciones de latencia son de esa máquina; no hay datos para A100, H100 ni RTX 4090.
- Despliegue: el camino documentado es GGUF mediante `llama.cpp` y `node-llama-cpp` (este último empleado para generar la gramática JSON). Soporte en vLLM, TGI, Ollama u otros motores: no documentado.
- Latencia: 1,4 s por turno de mediana y 1,7 s en el percentil 90 en el M4 de referencia, con temperatura 0 y un máximo de 260 tokens de salida.
- Throughput: no disponible; las pruebas se hicieron con una sola secuencia y sin procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pulse Local checker (este modelo) | 596.049.920 | 8.192 tokens en la llamada de la app | Verificador de consultas financieras con salida JSON restringida | Apache 2.0 | GGUF en HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B (base) | 596.049.920 (aproximado, según ficha del base) | No disponible en la información | Modelo conversacional generalista | Apache 2.0 | HuggingFace |
| Qwen3-4B-Instruct-2507 (verificador anterior en la app) | 4B (aproximado, según la model card) | No disponible en la información | Verificador de la misma tarea | No disponible en la información | Usado por la app hasta la versión 0.4.18; el archivo (~2,5 GB) permanece en disco y se puede borrar manualmente |

Frente al 4B, este modelo reduce el tiempo por turno de 15,1 s a 1,4 s (mediana) y la memoria del proceso de 5.164 MB a 2.964 MB, con 23 frente a 24 cifras incorrectas y 158 frente a 93 cifras correctas en BudgetBench v3 sealed, a costa de más respuestas marcadas como "no seguro" que el solo-código pero menos que el 4B. No se dispone de comparación con otros verificadores estructurados de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de chat: no responde preguntas ni redacta frases; cualquier uso fuera del esquema JSON previsto produce resultados sin validez.
- Solo inglés: la etiqueta de idioma del repositorio es `en` y no se documenta soporte de otros idiomas.
- Riesgo de cifra incorrecta pese a la verificación: alrededor del 6% de las respuestas mostraron una cifra errónea en la partición sellada (intervalo del 95%: 2,6%-9,4%); el modelo no elimina el error, solo lo reduce.
- Dependencia estricta del prompt y de la gramática: el autor advierte que los resultados solo aplican si se replica la misma llamada (prompt de sistema con fecha, mes, meses, listas de categorías, cuentas y comercios; plantilla de chat de Qwen3; temperatura 0; máximo 260 tokens; 8.192 tokens de contexto).
- La gramática limita los valores de sujeto y exclusión a los nombres del hogar, de modo que un nombre ausente en los registros no puede representarse correctamente.
- Dependencia de un intérprete determinista externo: la cifra final siempre la produce el código, nunca el modelo; usar el modelo como generador de respuestas rompe el diseño previsto.
- El benchmark mide la app completa, no el modelo aislado; no hay métricas estándar (MMLU, HumanEval, GSM8K) que permitan comparaciones externas.
- La partición sellada v3 ya se ha consumido, por lo que las próximas afirmaciones sobre el verificador requieren casos sellados nuevos.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial; el modelo base Qwen3-0.6B es también Apache 2.0. No se documentan sesgos específicos, pero al ser un extractor de dominio financiero hereda los sesgos del modelo base y de los datos de entrenamiento no publicados.
- Advertencia de despliegue: el repositorio registra 0 descargas y 0 likes, y las fechas de creación y actualización son del 25 de octubre de 2026, con una model card truncada; conviene validar el comportamiento antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PulseOS/pulse-local-checker-qwen3-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- `llama.cpp` (conversión y cuantización a GGUF): no se proporciona URL en la información disponible
- `mlx-lm` (entrenamiento LoRA): no se proporciona URL en la información disponible
- `node-llama-cpp` (generación de gramática JSON): no se proporciona URL en la información disponible
- Código de la llamada en la app: `pulse-local/app/electron/llm/secondReader.ts`; prompt en `worksheet/learned.ts` (`readerSystem`, `readerUser`, `READER_SCHEMA`) — rutas citadas en la model card, sin URL pública
- La búsqueda web realizada no devolvió resultados relacionados con el modelo; los enlaces obtenidos no son pertinentes y se omiten.
