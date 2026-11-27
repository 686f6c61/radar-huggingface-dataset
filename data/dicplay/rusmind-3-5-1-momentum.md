# DICPlay/RusMind-3.5.1-Momentum

## Resumen
RusMind 3.5.1 · Momentum es un modelo de lenguaje afinado (finetune) por DICPlay a partir de `google/gemma-4-E2B-it`, distribuido exclusivamente en formato GGUF y orientado a ejecucion local y sin conexion en telefonos, portatiles y equipos de sobremesa. Con 4.647.450.147 parametros totales segun los pesos en safetensors y un repositorio de 20,2 GB que agrupa cuatro cuantizaciones, el modelo se posiciona como la variante mas ligera de la familia RusMind.

El objetivo declarado por el autor es ofrecer un asistente conversacional en ruso e ingles con conocimiento profundo de historia, cultura, legislacion, regiones y pueblos de Rusia, ademas de valores familiares tradicionales. La model card menciona mejoras en 3.5.1 sobre la version anterior: mayor solidez en ruso e ingles, cumplimiento de instrucciones (completado de codigo, preguntas cortas por ejemplar) y alineamiento con el marco legal ruso.

Su relevancia actual reside en el despliegue on-device: el archivo Lite ocupa 2,5 GB y el Q4_K_M 3,4 GB, lo que permite inferencia en hardware de consumo sin GPU dedicada. La licencia es propietaria (`rusmind-license`), con un canal de contacto para licencias de organizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Lite (2,5 GB), Q4_K_M (3,4 GB), Q8_0 (5,0 GB), BF16 (9,3 GB) |
| Idiomas soportados | ru, en |
| Licencia | rusmind-license (propietaria, `license: other`) |
| Formato de pesos | GGUF (unico formato publicado) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base `google/gemma-4-E2B-it` ni confirma si se trata de un transformer denso, un modelo de mezcla de expertos o una variante hibrida. El identificador "E2B" del modelo base sugiere una familia de parametros efectivos, pero no se aporta confirmacion al respecto, por lo que el dato se deja como no disponible.

Tampoco se publican el volumen de tokens de entrenamiento, la composicion del dataset de ajuste fino ni si se emplearon tecnicas de RLHF, DPO o similares. La model card unicamente describe el resultado del ajuste: mejor adherencia al ruso y al ingles, ejecucion precisa de tareas de completado de codigo y respuestas a preguntas breves por ejemplar, ademas de un alineamiento explicito con los valores familiares tradicionales y la legislacion de Rusia. No se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto conversacional multi-turno en ruso e ingles.
- Respuesta a preguntas sobre historia, cultura, legislacion, regiones y pueblos de Rusia.
- Completado y generacion de codigo, segun la model card.
- Resolucion de preguntas cortas por ejemplar (few-shot implicito).
- Seguimiento de instrucciones y cumplimiento de tareas de formato.
- Conocimiento alineado con el marco legal y los valores familiares tradicionales de Rusia.
- Ejecucion local y offline mediante llama.cpp y programas compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso
- Asistente conversacional offline en telefono: con el archivo Lite de 2,5 GB, el modelo puede ejecutarse integramente en el dispositivo mediante PocketPal u otra aplicacion GGUF, sin enviar datos a la nube y sin conexion a internet.
- Atencion al ciudadano sobre legislacion rusa: el ajuste del modelo sobre leyes y normas del pais lo hace adecuado para responder consultas informativas sobre derechos, tramites y normativa, siempre con supervision humana por el riesgo de alucinacion.
- Educacion y divulgacion cultural: preguntas y respuestas sobre historia, regiones y pueblos de Rusia en entornos escolares o de autoaprendizaje, con el modelo Q4_K_M como opcion de equilibrio entre calidad y tamano.
- Asistencia a la redaccion bilingue ru/en: traduccion y reescritura de textos entre ambos idiomas en herramientas de escritorio, aprovechando la naturaleza conversacional del modelo.
- Autocompletado de codigo en editores locales: el modelo puede integrarse en flujos de desarrollo que requieran un asistente de codigo sin conexion, usando el archivo Q8_0 para preservar mas calidad.
- Procesamiento de documentos sensibles en intranet: al ejecutarse localmente con llama.cpp, permite resumir o clasificar textos internos sin que salgan de la infraestructura de la organizacion.
- Prototipado e investigacion: el archivo BF16 de 9,3 GB sirve como base para experimentos de cuantizacion propia o evaluaciones academicas del ajuste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible para RusMind 3.5.1 · Momentum. La model card incluye cifras de MERA v2 (0,136) y comparativas con modelos de T-Bank, Sber, Alibaba y Google, pero corresponden a otras variantes de la familia (RusMind 4.7, Sokol 4.7 y Vspyshka 4.7), no a este modelo.

## Requisitos de hardware
- VRAM estimada: aproximadamente 2,5 GB con Lite, 3,4 GB con Q4_K_M, 5,0 GB con Q8_0 y 9,3 GB con BF16, a los que hay que sumar la memoria para el contexto KV.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060 o superiores para Q8_0; A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual; el archivo Lite esta pensado para ejecucion en CPU en telefonos y portatiles.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -cnv`), LM Studio, Ollama, PocketPal y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia, aunque no se detalla.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RusMind 3.5.1 · Momentum | 4.647.450.147 | no disponible | rusmind-license (propietaria) | GGUF | Ajuste de gemma-4-E2B-it, ru/en, on-device |
| RusMind Vspyshka 4.7 | 7,5 mil millones | no disponible | rusmind-license | safetensors y GGUF | 0,191 en MERA v2 segun la model card |
| Gemma 4 E4B (Google) | 8 mil millones | no disponible | licencia de Google | no disponible | 0,170 en MERA v2 segun la model card |
| Qwen3.5-9B (Alibaba) | 9 mil millones | no disponible | no disponible | no disponible | 0,186 en MERA v2 segun la model card |

Los datos de MERA v2 de la tabla proceden de la model card del autor y corresponden a los modelos comparados, no a RusMind 3.5.1 · Momentum, para el que no se publican resultados.

## Limitaciones y advertencias
- Licencia propietaria `rusmind-license`: es necesario revisar el archivo LICENSE antes de cualquier uso comercial; el autor remite a un contacto en Telegram y MAX para licencias de organizacion.
- Riesgo de alucinacion inherente a los modelos de 4,6 mil millones de parametros, especialmente en consultas legales o historicas donde el modelo puede generar afirmaciones verosimiles pero incorrectas.
- El alineamiento explicito con los valores familiares tradicionales y la legislacion rusa puede introducir sesgos ideologicos y limitar la neutralidad de las respuestas en temas sensibles.
- Cobertura linguistica restringida a ruso e ingles; el rendimiento en castellano no esta documentado ni garantizado.
- Solo se distribuyen pesos GGUF; no hay safetensors publicados en este repositorio, lo que limita el reentrenamiento y la inspeccion directa de los pesos.
- La longitud de contexto no se especifica, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.
- No se documentan evaluaciones independientes de sesgo, toxicidad o robustez para esta version concreta.
- El autor recomienda migrar a RusMind 4.7 · Momentum, lo que sugiere que 3.5.1 puede quedar sin mantenimiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.5.1-Momentum
- Repositorio de la familia: https://huggingface.co/DICPlay/RusMind-Momentum
- Demo web: https://rusmind.ru
- RusMind 4.7 · Momentum: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
