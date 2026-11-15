# paperweight/tinyfix

## Resumen

tinyfix es un modelo de autocorrección ortográfica de palabras reales desarrollado por el usuario paperweight. Resuelve un problema concreto que los correctores tradicionales no abordan: distinguir entre palabras correctamente escritas pero erróneas en contexto, como "form" en lugar de "from", "there" en lugar de "their" o "now" en lugar de "know". A diferencia de un corrector ortográfico convencional, que solo detecta palabras inexistentes en el diccionario, tinyfix evalúa el contexto a ambos lados de la palabra para decidir si el término escrito encaja o si conviene sustituirlo por un vecino léxico real.

El modelo es extremadamente compacto: 1,9 millones de parámetros y un tamaño de archivo de 2,1 MB en formato ONNX cuantizado. Está diseñado para ejecutarse íntegramente en el navegador mediante ONNX Runtime Web, sin enviar datos a ningún servidor, lo que lo hace adecuado para aplicaciones de escritura con requisitos de privacidad estrictos. Su latencia declarada es de aproximadamente 3 ms por comprobación en Chrome.

La relevancia de tinyfix radica en su enfoque de despliegue: un modelo de corrección contextual que cabe en una página web y funciona sin conexión. Está entrenado exclusivamente para inglés y su vocabulario se limita a 20.000 palabras. La model card reporta una precisión del 94 % en las correcciones que realiza y una tasa de falsos positivos de aproximadamente 1 palabra modificada por cada 1.800 en texto correcto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU a nivel de palabra (word-level GRU) |
| Parametros totales | 1,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16 palabras a la izquierda + hasta 4 palabras a la derecha |
| Tipos de cuantizacion | modelo ONNX cuantizado (detalle del esquema no disponible) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`wrong-word.onnx`) |

## Arquitectura y entrenamiento

tinyfix es una red GRU a nivel de palabra que recibe tres entradas: una secuencia de hasta 16 palabras previas (`left`, con relleno a la izquierda y token `<s>` cuando hay menos), hasta 4 palabras posteriores (`right`, con la palabra más cercana al final) y un conjunto de hasta 9 candidatos (`candidates`), donde el primero es la palabra escrita y los siguientes hasta 8 son vecinos léxicos. La salida es una puntuación por candidato (`scores`), y la decisión de sustitución se toma comparando la puntuación del candidato con la de la palabra original, aplicando reglas externas de confianza (por ejemplo, un umbral más exigente al inicio de frase).

El entrenamiento se realizó durante 120.000 pasos en una única GPU. Los datos declarados incluyen FineWeb-Edu, Smoltalk y OpenAssistant/oasst1, aunque la model card solo detalla explícitamente FineWeb-Edu en el fragmento disponible. El vocabulario de 20.000 palabras se almacena en `wrong-word-vocab.txt` y las confusiones entre palabras (234 pares como their/there) en `wrong-word-confusions.txt`. El modelo solo puntúa palabras; la lógica de cuándo proponer un cambio reside en el código de la aplicación offlinepage.app, no en el propio modelo.

## Capacidades

- Corrección contextual de palabras reales mal empleadas: distingue "form"/"from", "there"/"their", "now"/"know", "to"/"too" y confusiones similares.
- Evaluación bidireccional del contexto: lee palabras a la izquierda y a la derecha de la posición evaluada.
- Ejecución en navegador mediante ONNX Runtime Web, sin envío de datos a servidores.
- Funcionamiento sin conexión (offline) una vez cargado el modelo.
- Puntuación de candidatos léxicos: para cada posición devuelve una puntuación por candidato, permitiendo umbrales de confianza configurables.
- Detección limitada a un vocabulario cerrado de 20.000 palabras y 234 pares de confusión predefinidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre. Es un modelo discriminativo de puntuación léxica, no generativo.

## Casos de uso

- Corrección en tiempo real en editores web: integrar el modelo en un editor de texto en el navegador para corregir confusiones léxicas mientras el usuario escribe, con latencia de ~3 ms y sin enviar el contenido a ningún servidor.
- Aplicaciones de escritura con privacidad estricta: diarios, notas personales o herramientas para sectores regulados donde el texto no puede salir del dispositivo; el modelo se ejecuta íntegramente en el cliente.
- Procesamiento por lotes de texto en el navegador: limpiar corpus de correos, chats o documentación antes de exportarlos, aprovechando el bajo coste computacional del modelo (2,1 MB).
- Asistencia a correctores ortográficos existentes: combinarlo con un corrector tradicional que detecte palabras inexistentes; tinyfix cubre el caso complementario de palabras reales mal usadas.
- Preprocesado ligero en pipelines de datos: aplicar correcciones de confusiones frecuentes (their/there, to/too) a texto en inglés antes de tareas posteriores de NLP, como paso de normalización de bajo coste.
- Extensiones de navegador y PWA: empaquetar el modelo en una extensión o aplicación web progresiva para ofrecer autocorrección offline en formularios, redes sociales o herramientas de soporte.
- Educación y aprendizaje de inglés: señalar confusiones típicas en textos de estudiantes, con la advertencia de que el modelo solo cubre 20.000 palabras y tiene cobertura limitada en errores reales.

## Benchmarks y rendimiento

Los datos de la model card se obtuvieron mecanografiando texto de prueba en el código de offlinepage.app, sobre texto no visto durante el entrenamiento. La métrica principal es el porcentaje de palabras erróneas corregidas y la precisión de las correcciones realizadas.

| Conjunto de prueba | Palabras erróneas corregidas | Correcciones acertadas |
|---|---|---|
| Mezcla clásica de confusiones en correo, chat y enciclopedia (their/there, to/too, its/it's…) | 69 % | 99 % |
| Frases escritas a mano | 58 % | 100 % |
| Errores de tecleo que producen una palabra real | 29 % | 87 % |
| Errores reales de escritura infantil | 28 % | 91 % |
| Errores reales de commits de GitHub | 18 % | 96 % |

Métricas globales declaradas: 94 % de las correcciones realizadas son correctas; 40 % de media de palabras erróneas corregidas en los cinco conjuntos (frente al 24 % de la versión anterior). Sobre unas 110.000 palabras de texto correcto (correo, chat, enciclopedia, noticias, documentación y ficción) modificó erróneamente aproximadamente 1 palabra de cada 1.800. El autor advierte que los dos primeros conjuntos están construidos a partir de los pares de confusión del entrenamiento y, por tanto, favorecen al modelo.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo ocupa 2,1 MB en disco y puede ejecutarse en memoria de CPU o en el navegador.
- GPU recomendadas: no requiere GPU. Diseñado para ejecución en CPU y en el navegador mediante ONNX Runtime Web.
- Cabe en cualquier GPU de consumo y en dispositivos sin GPU dedicada, incluidos móviles y navegadores de escritorio.
- Opciones de despliegue: ONNX Runtime Web en el navegador; ONNX Runtime en servidor o escritorio; integración en offlinepage.app (código en GitHub).
- Latencia: aproximadamente 3 ms por comprobación en Chrome, según la model card. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyfix | 1,9 M | 16 palabras izquierda + 4 derecha | GRU de puntuación léxica, corrección de palabras reales | no disponible | Hugging Face, ONNX, demo en Spaces |
| Correctores ortográficos tradicionales (p. ej. Hunspell) | no aplica | no aplica | Diccionario y reglas, detecta palabras inexistentes | variable (LGPL/GPL habitualmente) | Amplia |
| Modelos de corrección gramatical tipo GECToR/T5-small | decenas a cientos de millones | 128-512 tokens | Seq2seq o tagging, corrección gramatical completa | variable | Hugging Face |
| LLM generalistas pequeños (p. ej. modelos de ~1B) | ~1.000 M | miles de tokens | Generación y reescritura | variable | Hugging Face |

La comparación directa es limitada: no se dispone de datos de benchmarks de alternativas en la información proporcionada. La ventaja diferencial de tinyfix es su tamaño (2,1 MB) y su ejecución en navegador sin servidor; su desventaja es la cobertura restringida a inglés, 20.000 palabras y 234 pares de confusión.

## Limitaciones y advertencias

- Omite más palabras erróneas de las que corrige; en errores reales de commits de GitHub deja pasar aproximadamente cuatro de cada cinco.
- Cuando ambas palabras tienen sentido en contexto, no interviene: "writing this form a plane" se deja sin cambios.
- Las palabras de dos letras son inconsistentes: corrige "I am to tired" pero no todos los "to" que deberían ser "too".
- Solo evalúa las 20.000 palabras de su vocabulario; palabras menos frecuentes como "ware" por "were" no se corrigen.
- Necesita las palabras posteriores, por lo que las correcciones aparecen con un retardo de un par de palabras.
- Solo inglés.
- Licencia no declarada en la información disponible: verificar antes de uso comercial.
- No es un modelo generativo: no produce texto, solo puntúa candidatos léxicos; requiere lógica externa para decidir sustituciones.
- Riesgo de falsos positivos bajo pero no nulo: aproximadamente 1 palabra modificada por cada 1.800 en texto correcto.
- No se han publicado datos sobre sesgos demográficos o dialectales; el vocabulario cerrado puede penalizar variedades del inglés no representadas en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paperweight/tinyfix
- Demo en Spaces: https://huggingface.co/spaces/cfahlgren1/tinyfix
- Aplicación offlinepage.app: https://offlinepage.app
- Repositorio de offlinepage.app: https://github.com/cfahlgren1/offline-page
- Código de la lógica de corrección (src/tinyfix): https://github.com/cfahlgren1/offline-page/tree/main/src/tinyfix
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset OpenAssistant/oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
