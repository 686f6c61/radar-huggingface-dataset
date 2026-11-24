# DICPlay/RusMind-3.2-Vspyshka

## Resumen

RusMind 3.2 Vspyshka (Вспышка, "destello" en ruso) es un ajuste fino en ruso del modelo abierto Gemma 4 E4B de Google, desarrollado por DICPlay. Se distribuye exclusivamente en formato GGUF y está pensado para inferencia local y offline en equipos de sobremesa y teléfonos de gama alta, sin que ninguna conversación salga del dispositivo. El autor declara un total de 7.518.069.290 parámetros en los pesos originales, aunque el modelo base es un Gemma 4 con arquitectura de mezcla de expertos (la etiqueta E4B indica expertos efectivos), por lo que el número de parámetros activos por token es sustancialmente menor que el total.

El modelo se ha especializado mediante datos propios de DICPlay centrados en lengua y cultura rusas, historia y regiones de Rusia, legislación de la Federación Rusa y lo que el autor denomina "valores familiares tradicionales". Soporta ruso como idioma principal e inglés como secundario, y se ofrece en cuatro cuantizaciones GGUF que van de 3,8 GB a 8,0 GB, con una ventana de contexto de 4096 tokens en la variante para navegador.

Su relevancia actual radica en dos factores: por un lado, es un ejemplo de modelo "soberano" empaquetado para consumo masivo (web, móvil, escritorio) con cifras de descargas declaradas por encima de las de otros actores rusos; por otro, su licencia propia restringe el uso comercial sin contrato, lo que lo aleja de los modelos abiertos de uso libre y lo convierte en un producto con condiciones de distribución específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), derivada de Gemma 4 E4B |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (el modelo base E4B sugiere expertos efectivos, sin cifra publicada) |
| Longitud de contexto | 4096 tokens (variante de navegador); no se especifica para el resto de ficheros |
| Tipos de cuantizacion | Mini (3,8 GB, Q4_K_M con embeddings reducidos), Lite (4,2 GB), Q4_K_M (5,3 GB), Q8_0 (8,0 GB) |
| Idiomas soportados | Ruso (principal), inglés |
| Licencia | RusMind License (DICPlay); uso personal y no comercial libre, comercial solo por contrato |
| Formato de pesos | GGUF (fichero único y versión troceada en 14 partes de hasta 1 GB) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E4B, un transformer con mezcla de expertos de Google publicado bajo Apache 2.0. DICPlay ha realizado un ajuste fino supervisado sobre corpus propios en ruso y en menor medida en inglés, con énfasis declarado en historia y cultura rusas, legislación de la Federación Rusa, regiones y pueblos del país, y contenidos de carácter familiar. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco documenta innovaciones técnicas propias más allá del empaquetado para navegador mediante wllama y llama.cpp.

La innovación más visible es de despliegue, no de arquitectura: la versión de 3,8 GB se sirve troceada en 14 ficheros GGUF de menos de 1 GB para que el navegador pueda descargarla por partes y cachearla, con embeddings reducidos para ahorrar memoria. El resto de variantes son cuantizaciones estándar de llama.cpp pensadas para LM Studio, Ollama, PocketPal y la CLI de llama.cpp.

## Capacidades

- Generación de texto conversacional en ruso e inglés, orientada a redacción de correos, textos divulgativos, explicaciones y apoyo al estudio.
- Razonamiento y respuesta a preguntas sobre historia, cultura, geografía y legislación de Rusia, según los datos de ajuste declarados por el autor.
- Ejecución completamente offline: no requiere conexión tras la descarga inicial del modelo.
- Integración con el ecosistema llama.cpp: CLI, servidores compatibles con la API de endpoints y aplicaciones de escritorio y móvil basadas en GGUF.
- Ejecución en navegador mediante wllama, con descarga progresiva por trozos.
- Capacidad declarada de expresar incertidumbre ("no lo sé") en lugar de responder cuando no está segura.
- No se documentan soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente personal offline en escritorio: con la variante Q4_K_M (5,3 GB) y llama.cpp, el modelo puede mantener conversaciones multi-turno de hasta 4096 tokens sin enviar datos a ningún servidor, adecuado para entornos con requisitos de privacidad.
- Redacción de correos y textos administrativos en ruso: el ajuste sobre registros formales y legislación rusa lo hace útil para borradores de comunicaciones internas y resúmenes de normativa.
- Apoyo al estudio de historia y cultura rusas: puede explicar conceptos, contextualizar eventos y responder preguntas de un temario, con la advertencia de que sus respuestas deben verificarse.
- Despliegue en navegador para demos y prototipos: la versión troceada de 3,8 GB permite ofrecer un chatbot funcional en una página web sin backend, útil para pruebas de producto o entornos educativos.
- Aplicaciones móviles de gama alta: la variante Mini o Lite cabe en teléfonos con suficiente RAM y permite asistentes de bolsillo sin conectividad, por ejemplo en viajes o zonas sin cobertura.
- Explicación de alertas de seguridad en productos de escritorio: el autor documenta su uso en DIC.Антивирус PRO para describir en lenguaje llano qué es una amenaza detectada, por qué es peligrosa y qué hacer.
- Filtrado y clasificación de texto en ruso en pipelines locales: al ser un modelo conversacional pequeño, puede emplearse para tareas de etiquetado o resumen siempre que se validen las salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente cifras de descargas en Hugging Face (66.548 en 30 días para el conjunto de la familia, según el autor) y una comparación de popularidad con modelos de T-Bank, Sber, Yandex y Avito, pero no datos de MMLU, HumanEval, GSM8K ni evaluaciones en ruso.

## Requisitos de hardware

- VRAM estimada: unos 4,5-5 GB para la variante Mini (3,8 GB de pesos), 5-6 GB para Lite, 6-7 GB para Q4_K_M y 9-10 GB para Q8_0, contando overhead de contexto y caché KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las variantes mayores; A100 o H100 no son necesarias y aportan poco en un modelo de este tamaño.
- Cabe en GPU de consumo: sí, todas las variantes caben en tarjetas con 8 GB o más; Mini y Lite pueden ejecutarse incluso con 6 GB.
- Despliegue: llama.cpp (CLI y servidor), LM Studio, Ollama, PocketPal, wllama en navegador y cualquier runtime compatible con GGUF y la API de endpoints.
- Latencia y throughput: no disponibles. Al ser un MoE con pocos parámetros activos, la velocidad de generación en CPU debería ser superior a la de un modelo denso de 7,5B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RusMind 3.2 Vspyshka | 7,5B totales (MoE, base Gemma 4 E4B) | 4096 (navegador) | RusMind License, comercial por contrato | GGUF en Hugging Face y rusmind.ru |
| Gemma 4 E4B (Google) | Arquitectura E4B, cifra total no indicada | no disponible | Apache 2.0 | Pesos abiertos en Hugging Face |
| RusMind 3.2 Momentum (DICPlay) | no disponible | no disponible | RusMind License | GGUF, orientado a móviles y equipos modestos |
| Modelos rusos de T-Bank, Sber y Yandex | no disponible | no disponible | no disponible | Repositorios abiertos según la model card |

La comparación directa con Gemma 4 E4B es la más relevante: Vspyshka añade especialización en ruso y empaquetado para navegador, pero pierde la licencia Apache 2.0 y no publica métricas que demuestren una mejora medible frente a la base.

## Limitaciones y advertencias

- La licencia RusMind License restringe el uso comercial, la redistribución, la publicación de versiones modificadas y la integración en productos sin contrato escrito con DICPlay; no es un modelo de uso libre.
- El ajuste sobre contenidos de "valores familiares tradicionales" y legislación rusa introduce una orientación editorial explícita que puede sesgar respuestas sobre temas sociales y políticos.
- Riesgo de alucinación inherente a un modelo de 7,5B parámetros totales y contexto de 4096 tokens; las respuestas sobre leyes, medicina o finanzas deben verificarse.
- Contexto limitado a 4096 tokens en la variante documentada, insuficiente para documentos largos o conversaciones extensas.
- Cobertura lingüística reducida a ruso e inglés; el rendimiento en otros idiomas no está evaluado.
- Ausencia de benchmarks publicados que permitan validar las afirmaciones de calidad del autor.
- El modelo se distribuye solo en GGUF, sin pesos safetensors ni posibilidad de reentrenamiento completo a partir de este repositorio.
- Las cifras de descargas y comparaciones con competidores proceden del propio autor y no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka
- Repositorio de versiones anteriores: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Demo y descarga en navegador: https://rusmind.ru
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Fichero Mini (3,8 GB): https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Mini.gguf
- Fichero Lite (4,2 GB): https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Lite.gguf
- Fichero Q4_K_M (5,3 GB): https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Q4_K_M.gguf
- Fichero Q8_0 (8,0 GB): https://huggingface.co/DICPlay/RusMind-3.2-Vspyshka/blob/main/RusMind-Vspyshka-3.2-Q8_0.gguf
- Contacto del autor en Telegram: https://t.me/DanKirillin
- Contacto del autor en MAX: https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
