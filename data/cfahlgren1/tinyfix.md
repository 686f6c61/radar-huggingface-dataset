# cfahlgren1/tinyfix

## Resumen

tinyfix es un modelo de corrección ortográfica contextual de dominio muy restringido, desarrollado por cfahlgren1 y publicado en Hugging Face bajo el identificador `cfahlgren1/tinyfix`. Su propósito es resolver un problema que los correctores ortográficos clásicos no abordan: los errores en palabras que existen en el diccionario pero no encajan en el contexto (por ejemplo, escribir "form" cuando se quería decir "from", o "there" en lugar de "their"). Para ello puntúa candidatos léxicos a partir de las palabras que rodean la posición, en lugar de limitarse a comprobar si la palabra existe.

El modelo es extremadamente pequeño: 1,9 millones de parámetros y un artefacto ONNX de aproximadamente 2,1 MB, lo que permite ejecutarlo íntegramente en el navegador mediante ONNX Runtime Web sin enviar datos a ningún servidor. Su arquitectura es una GRU a nivel de palabra que lee hasta 16 palabras a la izquierda y 4 a la derecha, y opera sobre un vocabulario cerrado de 20 000 palabras. El tiempo de inferencia reportado por el autor es de unos 3 ms por comprobación en Chrome.

Es relevante ahora por su enfoque de despliegue: demuestra que tareas de corrección contextual acotadas pueden resolverse con modelos de pocos megabytes que caben en una página web y funcionan sin conexión. No es un modelo de lenguaje general ni compite en esa categoría; es una pieza de infraestructura de edición de texto, concretamente uno de los dos modelos que sostienen la aplicación offline.page.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU a nivel de palabra (word-level GRU) |
| Parametros totales | 1,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 palabras a la izquierda + hasta 4 palabras a la derecha |
| Tipos de cuantizacion | modelo ONNX cuantizado (el autor no detalla el esquema exacto) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`wrong-word.onnx`) |
| Vocabulario | 20 000 palabras (`wrong-word-vocab.txt`) |
| Tamano del artefacto | ~2,1 MB |
| Libreria | onnx |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

tinyfix es una red recurrente (GRU) que opera sobre secuencias de identificadores de palabra, no sobre tokens de subpalabra. La entrada se divide en tres tensores: `left` con forma `[batch, 16]` (las palabras anteriores, rellenadas por la izquierda con 0 y comenzando por `<s>` cuando hay menos de 16), `right` con forma `[batch, 4]` (las palabras posteriores, con la más cercana al final) y `candidates` con forma `[batch, 9]` (la palabra escrita seguida de hasta 8 palabras cercanas). La salida `scores` tiene forma `[batch, 9]` y asigna una puntuación a cada candidato; comparar la puntuación de cada alternativa con la de la palabra escrita determina si merece la pena sustituirla. Los identificadores son números de línea del fichero `wrong-word-vocab.txt` empezando por 0; el texto se pasa a minúsculas y las palabras capitalizadas en mitad de frase se mapean a `<name>`.

El entrenamiento se realizó durante 25 minutos en una GPU A10G sobre 118 millones de tokens procedentes de FineWeb-Edu, SmolTalk y OpenAssistant (oasst1). El procedimiento consiste en sustituir palabras reales por palabras reales cercanas y entrenar al modelo para revertir la sustitución, lo que explica que el objetivo sea la desambiguación contextual y no la detección de errores tipográficos. El repositorio incluye el script `train_realword.py` y un fichero `wrong-word-confusions.txt` con confusiones que están lejos en el teclado (como "their"/"there"). No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de decodificación especulativa.

## Capacidades

- Corrección de errores en palabras reales: detecta y propone sustituciones cuando la palabra escrita existe pero no encaja en el contexto ("form" por "from", "now" por "know", "there" por "their").
- Desambiguación de candidatos: puntúa hasta 8 alternativas léxicas por posición y permite comparar la idoneidad relativa de cada una.
- Mejora de correcciones sobre palabras mal escritas: según el autor, eleva la tasa de acierto en la elección de la corrección del 56 % al 61,5 %, manteniendo un 96,6 % de correcciones correctas.
- Ejecución local en navegador: compatible con ONNX Runtime Web, sin envío de datos a servidores.
- Funcionamiento sin conexión: diseñado para operar en modo avión dentro de la aplicación offline.page.
- Ámbito léxico cerrado: solo puede juzgar palabras presentes en su vocabulario de 20 000 entradas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. No es un modelo generativo de texto libre.

## Casos de uso

- Corrección en tiempo real en un editor web: el modelo se ejecuta en el navegador con ONNX Runtime Web y devuelve puntuaciones en torno a 3 ms por comprobación en Chrome, lo que permite subrayar o sustituir palabras mientras el usuario escribe sin bloquear la interfaz.
- Aplicaciones de escritura sin conexión: integrado en offline.page, permite corregir texto en modo avión o en entornos sin red, ya que el artefacto de 2,1 MB se descarga una vez y se ejecuta localmente.
- Pretratamiento de textos antes de indexación o búsqueda: al normalizar confusiones frecuentes ("their"/"there", "form"/"from") en correos y documentación, mejora la calidad de los índices y de las búsquedas sobre texto libre en inglés.
- Limpieza de documentación técnica y correos: con el modo Careful, el autor reporta aproximadamente 1 palabra correcta modificada de cada 2 500 en correos y 1 de cada 1 700 en texto de GitHub, una tasa baja que lo hace apto para procesamiento por lotes con revisión mínima.
- Revisión de mensajes en herramientas de soporte o formularios: puede señalar sustituciones probables en campos de texto libre en inglés antes del envío, con la advertencia de que solo cubre su vocabulario de 20 000 palabras.
- Componente de corrección en pipelines de edición asistida: combinado con un corrector ortográfico tradicional, aporta la capa contextual que este último no cubre, elevando la tasa de corrección de palabras mal escritas del 56 % al 61,5 % según el autor.
- Filtro de calidad en la generación de datos: al puntuar candidatos léxicos en contexto, puede usarse para detectar sustituciones dudosas en corpus en inglés antes de entrenar otros modelos, siempre que el vocabulario objetivo esté dentro de sus 20 000 entradas.

## Benchmarks y rendimiento

Los datos publicados por el autor se midieron sobre 2 460 errores de palabra real procedentes de commits de GitHub y 45 000 palabras correctas de correo y documentación no vistas en entrenamiento.

| Configuracion | Errores de palabra real corregidos | Correcciones acertadas | Palabras correctas cambiadas (correo) | Palabras correctas cambiadas (GitHub) |
|---|---|---|---|---|
| Careful (por defecto) | 19 % | 94 % | ~1 de cada 2 500 | ~1 de cada 1 700 |
| Eager (demo y offline.page) | 31 % | 94 % | ~1 de cada 910 | ~1 de cada 430 |

| Metrica adicional | Valor |
|---|---|
| Tasa de acierto al elegir corrección de palabra mal escrita (sin modelo) | 56 % |
| Tasa de acierto al elegir corrección de palabra mal escrita (con modelo) | 61,5 % |
| Correcciones que siguen siendo correctas con el modelo | 96,6 % |
| Latencia por comprobación en Chrome | ~3 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no procede aplicarlos a un modelo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuración; el artefacto ONNX ocupa ~2,1 MB y el modelo tiene 1,9 M de parámetros.
- GPU recomendadas: no requiere GPU. El autor lo ejecuta en el navegador mediante ONNX Runtime Web, por lo que la CPU del dispositivo es suficiente.
- Compatibilidad con GPU de consumo: irrelevante por tamaño; cabe en cualquier RTX, en iGPU y en dispositivos móviles.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime nativo (CPU), y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura.
- Latencia y throughput: ~3 ms por comprobación en Chrome según el autor. No se publican cifras de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| tinyfix | 1,9 M | 16 palabras izquierda + 4 derecha | GRU de puntuación de candidatos léxicos | no disponible | Si (ONNX Runtime Web) |
| tinynext (mismo autor) | no disponible | no disponible | Sugerencia de siguientes palabras | no disponible | Si (compañero en offline.page) |
| Correctores ortográficos clásicos (Hunspell, LanguageTool) | basados en reglas/diccionario | no aplica | Reglas y diccionarios | variables (GPL, LGPL, etc.) | Posible con port a WASM |
| Modelos de lenguaje pequeños para corrección (p. ej. variantes de menos de 1 000 M) | cientos de millones a miles de millones | miles de tokens | Generación condicionada | variables | Posible pero con artefactos de cientos de MB a GB |

La comparación directa con modelos de lenguaje pequeños es desfavorable en cobertura (tinyfix solo conoce 20 000 palabras) pero muy favorable en tamaño, latencia y privacidad. Frente a correctores basados en reglas, la diferencia clave es la capacidad de resolver palabras reales mal usadas, que los diccionarios no detectan.

## Limitaciones y advertencias

- Cobertura limitada: falla más errores de palabra real de los que corrige. En modo Careful corrige el 19 % y en modo Eager el 31 % de los casos medidos.
- Vocabulario cerrado de 20 000 palabras: no puede proponer ni evaluar palabras fuera de ese léxico; por ejemplo, "ware" escrito por "were" queda sin tocar.
- Dependencia del contexto derecho: necesita las palabras posteriores, por lo que las correcciones aparecen con un retraso de un par de palabras.
- Solo inglés: no hay soporte multilingüe documentado.
- Sin información de licencia: la model card y los metadatos no especifican licencia, lo que impide confirmar si el uso comercial está permitido. Es un bloqueo para producción hasta aclararlo con el autor.
- Sin información sobre sesgos: no se documentan evaluaciones de sesgo, y el vocabulario y los corpus de entrenamiento (FineWeb-Edu, SmolTalk, OpenAssistant) pueden introducir sesgos léxicos y de dominio.
- Riesgo de falsos positivos: en modo Eager cambia aproximadamente 1 de cada 910 palabras correctas en correo y 1 de cada 430 en texto de GitHub; en modo Careful las tasas bajan a 1 de cada 2 500 y 1 de cada 1 700 respectivamente.
- Sin garantías de producción: no se publican métricas de robustez ante dominios distintos de correo, documentación y commits de GitHub, ni pruebas de estrés, ni versionado semántico del modelo.
- Naturaleza no generativa: no debe emplearse como modelo de lenguaje; su salida son puntuaciones sobre un conjunto fijo de candidatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cfahlgren1/tinyfix
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/cfahlgren1/tinyfix
- Repositorio de la aplicación offline.page: https://github.com/cfahlgren1/offline-page
- Modelo complementario tinynext: https://huggingface.co/cfahlgren1/tinynext
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset OpenAssistant oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
