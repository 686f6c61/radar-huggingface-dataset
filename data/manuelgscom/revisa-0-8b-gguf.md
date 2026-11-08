# manuelgscom/revisa-0.8b-GGUF

## Resumen

`revisa-0.8b-GGUF` es un ajuste completo (full fine-tune) de Qwen3.5-0.8B orientado a una única tarea: la corrección ortográfica y gramatical del castellano frase a frase. Lo desarrolla Manuel García Sanz (manuelgscom) y se distribuye en formato GGUF cuantizado Q4_K_M, con un único fichero de 529 MB que funciona en CPU sin GPU. El modelo recibe una oración y la devuelve corregida (tildes, erratas, confusiones «haber»/«a ver» o «echo»/«hecho», dequeísmo, errores de concordancia) o idéntica si ya es correcta, sin alterar el estilo.

La relevancia del modelo está en su relación calidad/tamaño para una tarea acotada: con 752 millones de parámetros declara superar a LanguageTool 6.6 y a un Qwen3.5-9B sin ajustar en las tres partes del benchmark `revisa-bench-es`, y lo hace con latencias de 138 ms por frase (mediana) en una CPU de sobremesa con 8 hilos. Es la pieza central de la aplicación de escritorio revisa para Windows y Linux, un corrector gratuito que se invoca con un atajo de teclado sobre cualquier aplicación.

El diseño es deliberadamente conservador: el modelo solo propone una reescritura y un pipeline determinista calcula el diff palabra a palabra, clasifica la edición con un catálogo cerrado de 31 tipos de error y aplica guardas que descartan cambios ante la duda. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_K_M (publicado); otros quants de llama.cpp no disponibles |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`revisa-0.8b-Q4_K_M.gguf`, 529 MB) |

## Arquitectura y entrenamiento

El modelo es un full fine-tune del checkpoint Qwen3.5-0.8B, un transformer decoder-only de 752 millones de parámetros. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor sí documenta el uso de decodificación especulativa guiada por la entrada (input-guided speculative decoding) en la inferencia, lo que explica parte de la velocidad declarada en CPU.

La innovación técnica principal no está en el entrenamiento sino en el pipeline de uso: el modelo reescribe la frase completa y un código determinista compara original y reescritura, asigna a cada edición uno de 31 tipos de error con explicación fija en castellano y aplica guardas de seguridad («ante la duda, no toques nada»). Este diseño reduce el riesgo de que el modelo introduzca cambios no deseados en texto ya correcto, algo crítico en una herramienta de corrección integrada en el flujo de trabajo del usuario. El modelo se distribuye con metadatos `general.*` en el GGUF (nombre, autor, URL, versión, licencia, modelo base).

## Capacidades

- Corrección ortográfica en castellano: tildes, erratas, mayúsculas y grafías incorrectas.
- Corrección gramatical: concordancia, dequeísmo, confusiones léxicas («haber»/«a ver», «echo»/«hecho»).
- Detección de frases correctas: devuelve el texto sin cambios, con tasas de falsa alarma declaradas del 1,8 %, 2,4 % y 0,9 % según la parte del benchmark.
- Preservación de estilo: no reescribe ni reformula, solo corrige errores.
- Procesamiento frase a frase con segmentación previa que aísla URLs, correos y código para no tocarlos.
- Clasificación de errores en 31 tipos con explicación en español, generada por el pipeline determinista y no por el modelo.
- Ejecución offline en CPU, sin GPU ni conexión de red.
- Integración con llama.cpp y cualquier runtime compatible con GGUF.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking documentados.

## Casos de uso

- Corrector de escritorio integrado en el sistema operativo: la aplicación revisa selecciona texto en cualquier aplicación (correo, chat, editor), invoca el modelo con Ctrl+Alt+Espacio y muestra las ediciones para aceptar o rechazar. Es el caso de uso principal y está implementado en la app oficial para Windows y Linux.
- Revisión de documentación técnica en castellano: el modelo corrige tildes y concordancias en ficheros Markdown o documentación interna antes de publicar, con la ventaja de que el pipeline aísla bloques de código y URLs para no alterarlos.
- Preprocesado de corpus y datasets en español: limpieza ortográfica de textos scrapeados o generados sintéticamente antes de usarlos en entrenamiento o evaluación, con la tasa de falsa alarma baja como garantía de no degradar texto ya correcto.
- Corrección en pipelines de CI para contenido editorial: integración vía llama.cpp o CLI en un paso de validación que marque frases con errores en artículos, notas de prensa o traducciones antes del commit.
- Herramientas de accesibilidad y apoyo a la escritura: asistencia a usuarios con dificultades ortográficas en entornos sin conexión, como aulas, administraciones públicas o equipos air-gapped.
- Moderación y normalización de texto en foros o chats: normalización de mensajes de usuario antes de indexarlos o analizarlos, manteniendo el texto original cuando no hay errores.
- Aplicaciones de mensajería y correo con extensión o plugin: corrección bajo demanda en el cliente de correo o mensajería, aprovechando el tamaño de 529 MB y la latencia de 138 ms para una experiencia interactiva en CPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (métrica F0.5, no verificada de forma independiente):

| Dataset (revisa-bench-es, test) | F0.5 | Falsas alarmas en frases correctas |
|---|---|---|
| Parte A: ediciones reales de Wikipedia | 81,5 | 1,8 % |
| Parte B: páginas de discusión de Wikipedia | 80,0 | 2,4 % |
| Parte C: correos y chats sintéticos | 92,0 | 0,9 % |

Según el autor, supera a LanguageTool 6.6 y a un Qwen3.5-9B sin ajustar en las tres partes del benchmark. No se han publicado en la información disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K, ni comparativas numéricas detalladas frente a esos dos sistemas.

En velocidad, el autor declara 138 ms de mediana por frase en una CPU de sobremesa con 8 hilos y sin GPU, usando decodificación especulativa guiada por la entrada.

## Requisitos de hardware

- VRAM: no requiere GPU; el fichero Q4_K_M ocupa 529 MB y cabe en memoria RAM de cualquier equipo actual.
- GPU recomendadas: no aplica para el caso de uso previsto; cualquier GPU compatible con llama.cpp puede acelerar la inferencia, pero no es necesaria.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) si se quiere acelerar, aunque el diseño está pensado para CPU.
- Despliegue: llama.cpp y cualquier runtime compatible con GGUF (Ollama, servidores basados en llama.cpp). No se documenta soporte para vLLM ni TGI en la información disponible.
- Latencia: 138 ms de mediana por frase en CPU de sobremesa con 8 hilos; el throughput agregado no está disponible.
- Almacenamiento: 0,5 GB para el repositorio completo; un único fichero GGUF de 529 MB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| revisa-0.8b | 752 M | No disponible | Corrección gramatical en español | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-0.8B (base) | 752 M | No disponible | Generación de texto general | No disponible en la información | Hugging Face |
| Qwen3.5-9B sin ajustar | 9 B (aprox.) | No disponible | Generación de texto general | No disponible en la información | Hugging Face |
| LanguageTool 6.6 | No aplica (basado en reglas) | No aplica | Corrección gramatical multilingüe | Comercial (versión libre limitada) | Software y API |

El autor declara que revisa-0.8b supera a LanguageTool 6.6 y a Qwen3.5-9B sin ajustar en las tres partes de `revisa-bench-es`, con una diferencia de tamaño de más de diez veces frente al 9B. No se dispone de cifras comparativas detalladas ni de otros modelos de corrección en español en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: solo corrige ortografía y gramática; no reescribe, no mejora el estilo y no responde a instrucciones generales.
- Un solo idioma: únicamente español; no se ha evaluado su comportamiento en otras lenguas ni en variantes distintas del castellano de España.
- Riesgo de falsos positivos: aunque las tasas declaradas son bajas (0,9-2,4 %), en textos con terminología especializada, nombres propios o regionalismos puede proponer cambios incorrectos.
- Dependencia del pipeline: fuera de la app revisa o de un pipeline equivalente con diff y guardas, el modelo puede introducir modificaciones no deseadas; no debe usarse como corrector autónomo sin revisión.
- Benchmark no verificado: los resultados del model-index están marcados como `verified: false` y el dataset `revisa-bench-es` es del propio autor, por lo que conviene tratarlos con cautela hasta que haya evaluaciones independientes.
- Contexto no documentado: se desconoce la longitud máxima de contexto; el uso previsto es frase a frase, no documentos largos.
- Sin datos de sesgo: no se ha publicado un análisis de sesgos lingüísticos, dialectales o de género.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda conservar el aviso de licencia y verificar las condiciones del modelo base Qwen3.5-0.8B.
- Madurez: el repositorio no registra descargas ni likes en el momento de la consulta, lo que indica un proyecto reciente y con poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manuelgscom/revisa-0.8b-GGUF
- Dataset de evaluación: https://huggingface.co/datasets/manuelgscom/revisa-bench-es
- Aplicación revisa (GitHub): https://github.com/manuelgscom/revisa
- Colección revisa en Hugging Face: https://huggingface.co/collections/manuelgscom/revisa-6af07e5219339ae58de2f63d
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fichero GGUF Q4_K_M: https://huggingface.co/manuelgscom/revisa-0.8b-GGUF/resolve/main/revisa-0.8b-Q4_K_M.gguf?download=true
- Autor: https://manuelgs.com/en/
- Modelo relacionado del mismo autor: https://huggingface.co/manuelgscom/askmdb-0.8b-GGUF
- Modelo relacionado del mismo autor: https://huggingface.co/manuelgscom/dale-0.8b-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
